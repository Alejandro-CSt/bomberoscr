import { Card, CardContent, CardHeader, CardTitle } from "@/features/shared/components/ui/card";
import { Skeleton } from "@/features/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-6 w-28 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-3/4 md:h-10" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="mt-3 space-y-2.5">
          <Skeleton className="h-4 w-full max-w-prose" />
          <Skeleton className="h-4 w-5/6 max-w-prose" />
        </div>

        <div className="mt-2 h-[400px] w-full rounded-lg border bg-muted" />
      </div>

      <div className="flex basis-1/2 flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="h-64 w-full rounded-md border bg-muted" />

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <div key={i} className="grid grid-cols-6 gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
