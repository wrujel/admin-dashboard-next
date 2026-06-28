import { Skeleton } from "@/app/ui/primitives/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <Skeleton className="h-80 rounded-xl lg:col-span-8" />
        <Skeleton className="h-80 rounded-xl lg:col-span-4" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
