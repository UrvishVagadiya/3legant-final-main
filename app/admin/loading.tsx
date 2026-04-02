import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
