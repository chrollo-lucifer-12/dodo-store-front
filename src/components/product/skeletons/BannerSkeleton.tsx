import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BannerSkeleton = () => {
  return (
    <div className="w-[100vw] absolute z-20 top-0 flex flex-col items-center">
      <div className="h-1 w-[100vw] shadow-md">
        <Skeleton className="h-full w-full" />
      </div>

      <Card className="rounded-b-md shadow-md w-fit bg-bg-secondary">
        <CardContent className="flex items-center gap-2 py-2 px-3">
          <Skeleton className="h-4 w-[160px]" />
          <Skeleton className="h-4 w-[80px]" />
        </CardContent>
      </Card>
    </div>
  );
};

export default BannerSkeleton;
