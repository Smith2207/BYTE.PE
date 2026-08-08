import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProductos() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-64 shrink-0 space-y-6 lg:block">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Skeleton className="h-9 w-28 rounded-full lg:hidden" />
            <Skeleton className="ml-auto h-9 w-40 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
