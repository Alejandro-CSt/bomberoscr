import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export function LatestIncidentsHeader() {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 border-b p-2 font-medium text-size-3">
      <h2 className="font-semibold text-sm">Incidentes recientes</h2>
      <Link className="group flex items-center gap-2 text-xs" href="/incidentes">
        Ver todos
        <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
