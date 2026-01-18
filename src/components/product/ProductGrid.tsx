"use client";
import { CreditCard, LucideIcon, ShoppingCart } from "lucide-react";

import { ProductCard, ProductCardProps } from "./ProductCard";
import ProductHoverCard from "./ProductHoverCard";
import EmptyState from "./EmptyState";

export type ProductGridIcon = "products" | "subscriptions";

const ICON_MAP: Record<ProductGridIcon, LucideIcon> = {
  products: ShoppingCart,
  subscriptions: CreditCard,
};

interface ProductGridProps {
  title: string;
  products: ProductCardProps[];
  checkoutBaseUrl: string;
  icon: ProductGridIcon;
}

export function ProductGrid({
  title,
  products,
  checkoutBaseUrl,
  icon,
}: ProductGridProps) {
  const Icon = ICON_MAP[icon];
  return (
    <>
      <h2 className="text-text-primary w-full mb-6 text-left font-display text-lg font-medium flex items-center gap-2">
        <Icon size={16} className="text-gray-400" />
        {title}
      </h2>

      {products.length === 0 && (
        <EmptyState
          title={
            title === "Products"
              ? "No Products Available"
              : "No Subscriptions Available"
          }
          description={""}
          icon={title === "Products" ? ShoppingCart : CreditCard}
        />
      )}

      <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 items-start gap-6">
        {products.map((product, index) => (
          <ProductHoverCard
            key={`${product.name}-${index}`}
            className="rounded-lg "
          >
            <ProductCard {...product} checkoutBaseUrl={checkoutBaseUrl} />
          </ProductHoverCard>
        ))}
      </div>
    </>
  );
}
