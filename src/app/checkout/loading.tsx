import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCheckout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-8 w-56" />

      <div className="mb-10 flex items-center justify-center gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9 rounded-full" />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}
