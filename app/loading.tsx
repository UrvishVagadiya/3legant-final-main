import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="w-full space-y-12">
      <Skeleton className="w-full h-125 rounded-none lg:h-175" />

      <div className="max-w-350 mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      <div className="max-w-350 mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full aspect-square" />
        ))}
      </div>

      <div className="max-w-350 mx-auto px-4 space-y-8">
        <div className="flex justify-between items-end">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="w-full aspect-4/5" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
