import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
        {[...Array(2)].map((_, index) => (
          <Skeleton key={index} className="h-48 w-full" />
        ))}
      </div>
    </>
  );
};

export default Loading;
