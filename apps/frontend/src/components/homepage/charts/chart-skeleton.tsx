import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  title: string;
  description: string;
  className?: string;
}

export function ChartSkeleton({ title, description, className }: ChartSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg leading-none font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}

export function ChartSkeletonWithFooter({ title, description, className }: ChartSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg leading-none font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Skeleton className="h-[300px] w-full" />
      <div>
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
