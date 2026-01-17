import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridSkeletonProps {
  title: string;
  count?: number;
}

export function ProductGridSkeleton({
  title,
  count = 4,
}: ProductGridSkeletonProps) {
  return (
    <>
      <h2 className="text-text-primary w-full mb-6 text-left font-display text-lg font-medium">
        {title}
      </h2>

      <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 items-start gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </>
  );
}
