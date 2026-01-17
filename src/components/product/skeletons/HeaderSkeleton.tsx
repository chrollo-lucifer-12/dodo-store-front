import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const HeaderSkeleton = () => {
  return (
    <header className="relative w-full">
      <div className="relative h-[35dvh] md:h-[30dvh] w-full">
        <Skeleton className="w-full h-full" />
      </div>

      <section className="relative flex flex-col items-center px-4">
        <div className="absolute -top-0 -translate-y-1/2 w-[72px] h-[72px] rounded-full overflow-hidden shadow-bg-primary/50 shadow-md">
          <Skeleton className="w-full h-full rounded-full" />
        </div>

        <Skeleton className="mt-12 h-7 w-[180px]" />
      </section>
    </header>
  );
};

export default HeaderSkeleton;
