import { cn } from "@/features/shared/lib/utils";
export function StatCard({
  title,
  value,
  secondValue,
  size = "normal",
  className = ""
}: {
  title: string;
  value: string;
  secondValue: string;
  size?: "normal" | "small";
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
      <div className="flex justify-end">
        <span className="font-medium text-sm">{title}</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <span
          className={cn(
            "font-bold uppercase",
            size === "small" ? "text-lg md:text-xl lg:text-2xl" : "text-3xl md:text-4xl lg:text-5xl"
          )}
        >
          {value}
        </span>
      </div>

      <div className="flex justify-start">
        <span className="font-medium text-sm">{secondValue}</span>
      </div>
    </div>
  );
}
