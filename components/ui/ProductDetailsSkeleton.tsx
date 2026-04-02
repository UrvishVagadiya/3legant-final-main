import { Skeleton } from "./Skeleton";

export function ProductDetailsSkeleton() {
  return (
    <div className="w-full px-4 md:px-8 xl:px-40 py-4 md:py-10">
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="w-full aspect-3/4" />
            <div className="hidden sm:grid grid-cols-1 gap-4">
              <Skeleton className="w-full aspect-3/4" />
            </div>
            <Skeleton className="w-full aspect-3/4 hidden sm:block" />
            <Skeleton className="w-full aspect-3/4 hidden sm:block" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 border-b border-[#E8ECEF] pb-6">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-14 w-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
