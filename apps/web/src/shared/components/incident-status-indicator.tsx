import { cn } from "@/lib/utils";

export function IncidentStatusIndicator({
  isOpen,
  className
}: { isOpen: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "flex w-fit items-center gap-2 rounded-lg border px-2 py-1 text-muted-foreground text-sm",
        className
      )}
    >
      <span
        className={cn("size-2 rounded-full", isOpen ? "animate-pulse bg-red-500" : "bg-green-500")}
      />
      {isOpen ? "En progreso" : "Atendido"}
    </span>
  );
}
