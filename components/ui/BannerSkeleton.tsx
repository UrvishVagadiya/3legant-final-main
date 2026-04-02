import { Skeleton } from "./Skeleton";

export function BannerSkeleton() {
  return (
    <div className="w-full min-h-98 flex items-center justify-center rounded-lg mt-6 bg-[#F3F5F7] animate-pulse">
      <div className="flex flex-col justify-center items-center text-center px-4 w-full">
        <div className="flex gap-3 mb-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-12 w-1/2 mb-5" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}
