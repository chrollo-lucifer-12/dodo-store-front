import { CreditCard, ShoppingCart } from "lucide-react";

import { ProductCard, ProductCardProps } from "./ProductCard";
import ProductHoverCard from "./ProductHoverCard";
import EmptyState from "./EmptyState";

interface ProductGridProps {
  title: string;
  products: ProductCardProps[];
  checkoutBaseUrl: string;
}

export function ProductGrid({
  title,
  products,
  checkoutBaseUrl,
}: ProductGridProps) {
  return (
    <>
      <h2 className="text-text-primary w-full mb-6 text-left font-display text-lg font-medium">
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
          <ProductHoverCard key={`${product.name}-${index}`}>
            <ProductCard {...product} checkoutBaseUrl={checkoutBaseUrl} />
          </ProductHoverCard>
        ))}
      </div>
    </>
  );
}
