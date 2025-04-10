import { Separator } from "@/features/components/ui/separator";
import { Skeleton } from "@/features/components/ui/skeleton";
import { FloatingPanelHeader } from "@/features/layout/components/floating-panel-header";

export default function Loading() {
  return (
    <>
      <FloatingPanelHeader title="Ajustes" />
      <div className="flex flex-col gap-2 p-4">
        <div>
          <div className="mb-2 font-medium text-sm">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="mb-2 font-medium text-sm">
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <Separator />
        <div>
          <div className="mb-2 font-medium text-sm">
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </>
  );
}
