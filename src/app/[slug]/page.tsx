import Header from "@/components/header";

import Banner from "@/components/ui/dodoui/banner";
import { ProductCardProps } from "@/components/product/ProductCard";
import { headers } from "next/headers";
import {
  getCheckoutBaseUrl,
  resolveModeFromHost,
} from "@/lib/server/resolve-storefront";
import {
  getBusiness,
  getProducts,
  isUpstreamHttpError,
} from "@/lib/server/storefront-client";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";

import BannerSkeleton from "@/components/product/skeletons/BannerSkeleton";
import HeaderSkeleton from "@/components/product/skeletons/HeaderSkeleton";
import { ProductGridSkeleton } from "@/components/product/skeletons/ProductGridSkeleton";
import { redirect } from "next/navigation";
import MotionFadeIn from "@/components/product/MotionFadeIn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const h = await headers();
    const mode = resolveModeFromHost(h);
    const { slug } = await params;
    const business = await getBusiness(mode, slug);
    return { title: business.name ?? "Dodo Payments" };
  } catch (err) {
    if (isUpstreamHttpError(err) && err.statusCode === 404) {
      return { title: "Dodo Payments" };
    }

    return { title: "Dodo Payments" };
  }
}

async function getRequestContext() {
  const h = await headers();
  const mode = resolveModeFromHost(h);
  const checkoutBaseUrl = getCheckoutBaseUrl(mode);

  return { mode, checkoutBaseUrl };
}

async function getBusinessData(slug: string) {
  const { mode } = await getRequestContext();

  try {
    const business = await getBusiness(mode, slug);
    return { business, mode } as const;
  } catch (err) {
    if (isUpstreamHttpError(err) && err.statusCode === 404) {
      return { notFound: true as const };
    }
    throw err;
  }
}

async function getProductsData(slug: string) {
  const { mode, checkoutBaseUrl } = await getRequestContext();

  try {
    const productsJson = await getProducts(mode, slug, {
      recurring: false,
      page_size: 100,
    });

    const products: ProductCardProps[] = productsJson.items.map((product) => ({
      product_id: product.product_id,
      name: product.name,
      image: product.image || undefined,
      price: product.price,
      pay_what_you_want: product.price_detail?.pay_what_you_want,
      description: product.description || "",
      currency: product.currency,
    }));

    return { products, checkoutBaseUrl } as const;
  } catch (err) {
    if (isUpstreamHttpError(err) && err.statusCode === 404) {
      return { notFound: true as const };
    }
    throw err;
  }
}

async function getSubscriptionsData(slug: string) {
  const { mode, checkoutBaseUrl } = await getRequestContext();

  try {
    const subsJson = await getProducts(mode, slug, {
      recurring: true,
      page_size: 100,
    });

    const subscriptions: ProductCardProps[] = subsJson.items.map(
      (subscription) => ({
        product_id: subscription.product_id,
        name: subscription.name,
        image: subscription.image || undefined,
        price: subscription.price,
        description: subscription.description || "",
        currency: subscription.currency,
        payment_frequency_count:
          subscription.price_detail?.payment_frequency_count,
        payment_frequency_interval:
          subscription.price_detail?.payment_frequency_interval,
        trial_period_days: subscription.price_detail?.trial_period_days,
      }),
    );

    return { subscriptions, checkoutBaseUrl } as const;
  } catch (err) {
    if (isUpstreamHttpError(err) && err.statusCode === 404) {
      return { notFound: true as const };
    }
    throw err;
  }
}

async function BannerSection({ slug }: { slug: string }) {
  const data = await getBusinessData(slug);
  if ("notFound" in data) return redirect("/not-found");

  return (
    <MotionFadeIn>
      <Banner mode={data.mode} />
    </MotionFadeIn>
  );
}

async function HeaderSection({ slug }: { slug: string }) {
  const data = await getBusinessData(slug);
  if ("notFound" in data) return redirect("/not-found");

  return (
    <MotionFadeIn>
      <Header business={data.business} />
    </MotionFadeIn>
  );
}

const ProductsSection = async ({ slug }: { slug: string }) => {
  const [productsData, subsData] = await Promise.all([
    getProductsData(slug),
    getSubscriptionsData(slug),
  ]);

  if ("notFound" in productsData || "notFound" in subsData) {
    return redirect("/not-found");
  }

  return (
    <MotionFadeIn>
      <section
        className="flex flex-col pb-20 items-center max-w-[1145px] mx-auto justify-center mt-10 px-4"
        role="region"
        aria-label="Products and subscriptions section"
      >
        <ProductGrid
          title="Products"
          products={productsData.products}
          checkoutBaseUrl={productsData.checkoutBaseUrl}
          icon="products"
        />

        <div className="mt-8 w-full">
          <ProductGrid
            title="Subscriptions"
            products={subsData.subscriptions}
            checkoutBaseUrl={subsData.checkoutBaseUrl}
            icon="subscriptions"
          />
        </div>
      </section>
    </MotionFadeIn>
  );
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-bg-primary">
      <Suspense fallback={<BannerSkeleton />}>
        <BannerSection slug={slug} />
      </Suspense>

      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderSection slug={slug} />
      </Suspense>

      <Suspense
        fallback={
          <section className="flex flex-col pb-20 items-center max-w-[1145px] mx-auto justify-center mt-10 px-4">
            <ProductGridSkeleton title="Products" />
            <div className="mt-8 w-full">
              <ProductGridSkeleton title="Subscriptions" />
            </div>
          </section>
        }
      >
        <ProductsSection slug={slug} />
      </Suspense>
    </main>
  );
}
