import { Skeleton } from "@/features/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col py-2">
      <div className="flex items-center gap-4 border-b p-4">
        <div className="size-12 shrink-0">
          <Skeleton className="size-full rounded-full" />
        </div>
        <div className="min-w-0 flex-1">
          <Skeleton className="h-6 w-48" />
          <div className="mt-1">
            <Skeleton className="mt-2 h-3 w-64" />
          </div>
        </div>
      </div>

      <div className="p-4 px-4">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>

      <div className="space-y-2 px-4 pb-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={`incident-skeleton-${
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              i
            }`}
            className="flex w-full flex-col gap-3 rounded-lg border p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Skeleton className="h-5 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
