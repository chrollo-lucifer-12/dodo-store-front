import Header, { Business } from "@/components/header";

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

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getData(slug: string) {
  await delay(1500);
  const h = await headers();
  const mode = resolveModeFromHost(h);
  const checkoutBaseUrl = getCheckoutBaseUrl(mode);

  try {
    const [business, productsJson, subsJson] = await Promise.all([
      getBusiness(mode, slug),
      getProducts(mode, slug, { recurring: false, page_size: 100 }),
      getProducts(mode, slug, { recurring: true, page_size: 100 }),
    ]);

    const businessData: Business = business;

    const products: ProductCardProps[] = productsJson.items.map((product) => ({
      product_id: product.product_id,
      name: product.name,
      image: product.image || undefined,
      price: product.price,
      pay_what_you_want: product.price_detail?.pay_what_you_want,
      description: product.description || "",
      currency: product.currency,
    }));

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

    return {
      business: businessData,
      products,
      subscriptions,
      mode,
      checkoutBaseUrl,
    } as const;
  } catch (err) {
    // if (isUpstreamHttpError(err) && err.statusCode === 404) {
    //   return { notFound: true as const };
    // }

    throw err;
  }
}

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

async function BannerSection({ slug }: { slug: string }) {
  const { mode } = await getData(slug);
  return <Banner mode={mode} />;
}

async function HeaderSection({ slug }: { slug: string }) {
  const { business } = await getData(slug);
  return <Header business={business} />;
}

const ProductsSection = async ({ slug }: { slug: string }) => {
  const data = await getData(slug);

  return (
    <section className="flex flex-col pb-20 items-center max-w-[1145px] mx-auto justify-center mt-10 px-4">
      <ProductGrid
        title="Products"
        products={data.products}
        checkoutBaseUrl={data.checkoutBaseUrl}
      />

      <div className="mt-8 w-full">
        <ProductGrid
          title="Subscriptions"
          products={data.subscriptions}
          checkoutBaseUrl={data.checkoutBaseUrl}
        />
      </div>
    </section>
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
