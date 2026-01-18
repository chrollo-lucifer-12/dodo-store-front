const USE_MOCK_DATA = "true";

const mockBusiness: BusinessResponse = {
  business_id: "mock_business_1",
  name: "Mock Storefront",
  logo: "https://github.com/shadcn.png",
  banner: "",
};

const mockOneTimeProducts: OneTimeProductApiResponse[] = [
  {
    product_id: "mock_prod_1",
    name: "Mock Ebook",
    price: 1999,
    currency: "USD",
    description: "This is a fake product for local dev",
    price_detail: {
      pay_what_you_want: false,
    },
  },
  {
    product_id: "mock_prod_2",
    name: "Pay What You Want Donation",
    price: 500,
    currency: "USD",
    description: "Support us ❤️",
    price_detail: {
      pay_what_you_want: true,
    },
  },
];

const mockRecurringProducts: RecurringProductApiResponse[] = [
  {
    product_id: "mock_sub_1",
    name: "Pro Membership",
    price: 999,
    currency: "USD",
    description: "Monthly subscription",
    price_detail: {
      payment_frequency_count: 1,
      payment_frequency_interval: "month",
      trial_period_days: 7,
    },
  },
];
import type { Mode } from "@/types/storefront";

export interface UpstreamHttpError extends Error {
  statusCode: number;
  responseBody?: string;
  name: "UpstreamHttpError";
}

export function isUpstreamHttpError(err: unknown): err is UpstreamHttpError {
  return (
    err !== null &&
    typeof err === "object" &&
    "statusCode" in err &&
    "name" in err &&
    err.name === "UpstreamHttpError" &&
    typeof (err as UpstreamHttpError).statusCode === "number"
  );
}

function getBaseUrl(mode: Mode): string {
  const base =
    mode === "live"
      ? process.env.DODO_LIVE_API_URL
      : process.env.DODO_TEST_API_URL;
  if (!base) {
    throw new Error(
      `Missing API base URL for mode=${mode}. Set DODO_LIVE_API_URL and DODO_TEST_API_URL.`,
    );
  }
  return base.replace(/\/$/, "");
}

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    // Disable Next cache by default for freshness; tune as needed
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(
      `Upstream request failed ${res.status}: ${text}`,
    ) as UpstreamHttpError;
    err.name = "UpstreamHttpError";
    err.statusCode = res.status;
    err.responseBody = text;
    throw err;
  }
  return (await res.json()) as T;
}

export interface BusinessResponse {
  banner: string;
  business_id: string;
  logo: string;
  name: string;
}

export interface OneTimeProductApiResponse {
  product_id: string;
  name: string;
  image?: string | null;
  price: number;
  currency: string;
  description?: string | null;
  price_detail?: {
    pay_what_you_want?: boolean;
  };
}

export interface RecurringProductApiResponse {
  product_id: string;
  name: string;
  image?: string | null;
  price: number;
  currency: string;
  description?: string | null;
  price_detail?: {
    payment_frequency_count?: number;
    payment_frequency_interval?: string;
    trial_period_days?: number;
  };
}

export async function getBusiness(mode: Mode, slug: string) {
  if (USE_MOCK_DATA) {
    return mockBusiness;
  }
  const base = getBaseUrl(mode);
  const url = `${base}/storefront/${encodeURIComponent(slug)}`;
  return fetchJson<BusinessResponse>(url);
}

export async function getProducts(
  mode: Mode,
  slug: string,
  opts: { recurring: false; page_size?: number },
): Promise<{ items: OneTimeProductApiResponse[] }>;
export async function getProducts(
  mode: Mode,
  slug: string,
  opts: { recurring: true; page_size?: number },
): Promise<{ items: RecurringProductApiResponse[] }>;
export async function getProducts(
  mode: Mode,
  slug: string,
  opts: { recurring: boolean; page_size?: number } = { recurring: false },
): Promise<{
  items: Array<OneTimeProductApiResponse | RecurringProductApiResponse>;
}> {
  if (USE_MOCK_DATA) {
    return {
      items: opts.recurring ? mockRecurringProducts : mockOneTimeProducts,
    };
  }

  const base = getBaseUrl(mode);
  const params = new URLSearchParams();
  params.set("recurring", String(opts.recurring));
  params.set("page_size", String(opts.page_size ?? 100));
  const url = `${base}/storefront/${encodeURIComponent(slug)}/products?${params.toString()}`;
  return fetchJson<{
    items: Array<OneTimeProductApiResponse | RecurringProductApiResponse>;
  }>(url);
}
