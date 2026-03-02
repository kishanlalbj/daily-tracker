import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col gap-6 mt-6" role="status" aria-label="Loading dashboard">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      {/* Charts row — 3:2 split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Skeleton className="lg:col-span-3 h-72 w-full rounded-xl" />
        <Skeleton className="lg:col-span-2 h-72 w-full rounded-xl" />
      </div>

      {/* Transactions block */}
      <Skeleton className="h-64 w-full rounded-xl" />

      <span className="sr-only">Loading dashboard data</span>
    </div>
  );
};

export default Loading;
