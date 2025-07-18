import { cn } from "@/lib/utils";

export function DataTableIsOpenIndicator({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <div className={cn("h-2.5 w-2.5 rounded-[2px]", isOpen ? "bg-green-500" : "bg-red-500")} />
    </div>
  );
}
