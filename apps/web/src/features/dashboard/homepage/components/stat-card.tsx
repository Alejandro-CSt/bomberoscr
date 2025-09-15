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
