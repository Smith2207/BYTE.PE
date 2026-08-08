import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCarrito() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-8 w-40" />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="size-24 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
