import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return (
    <div className="w-full px-5 md:px-10 lg:px-40 py-10 md:py-20">
      <div className="flex justify-center mb-10 md:mb-20">
        <Skeleton className="h-12 w-64 md:h-13.5 md:w-96" />
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-18 mb-22">
        <div className="w-full md:w-64 flex flex-col items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex flex-col items-center gap-2 w-full">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex flex-col gap-3 w-full mt-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col gap-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-12 w-full max-w-50 mt-4" />
        </div>
      </div>
    </div>
  );
}
