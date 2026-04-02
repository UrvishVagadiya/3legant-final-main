import { BannerSkeleton } from "@/components/ui/BannerSkeleton";
import { ProductCardSkeleton } from "@/components/ui/ProductCardSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 mb-20 font-inter">
      <BannerSkeleton />
      <div className="flex flex-col lg:flex-row gap-8 my-8 md:my-12 relative w-full items-start">
        <div className="hidden lg:block w-full lg:w-1/4 pb-4">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex-1 lg:w-3/4">
          <div className="flex flex-row justify-between items-end gap-4 mb-8">
            <Skeleton className="h-8 w-40" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
