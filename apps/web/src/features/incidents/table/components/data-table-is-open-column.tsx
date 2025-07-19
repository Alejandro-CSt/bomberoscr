import { cn } from "@/lib/utils";

export function DataTableIsOpenIndicator({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <div className={cn("h-2.5 w-2.5 rounded-[2px]", isOpen ? "bg-red-500" : "bg-green-500")} />
    </div>
  );
}

export function IsOpenIndicatorLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 text-xs", className)}>
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-[2px] bg-red-500" />
        <span>En progreso</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-[2px] bg-green-500" />
        <span>Atendido</span>
      </div>
    </div>
  );
}
