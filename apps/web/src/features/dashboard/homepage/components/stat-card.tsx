import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { cn } from "@/features/shared/lib/utils";

export function StatCard({
  title,
  value,
  secondValue,
  className = ""
}: {
  title: string;
  value: string;
  secondValue: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col justify-between gap-2 rounded-lg bg-primary p-3 text-primary-foreground md:p-4",
        "transition-all duration-300 ease-out will-change-transform",
        "hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 hover:ring-ring/30",
        className
      )}
    >
      <div className="flex justify-center">
        <span className={cn("font-bold text-sm uppercase md:text-base lg:text-lg")}>{value}</span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-sm">{title}</span>
        <span className="font-medium text-sm">{secondValue}</span>
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col justify-between gap-2 rounded-lg bg-primary p-3 md:p-4",
        className
      )}
    >
      <div className="flex justify-center">
        <Skeleton className="h-6 w-3/4 bg-primary-foreground/20" />
      </div>

      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-5 w-full bg-primary-foreground/20" />
        <Skeleton className="h-5 w-2/3 bg-primary-foreground/20" />
      </div>
    </div>
  );
}
