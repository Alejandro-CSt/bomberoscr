import TimeRangeSelect from "@/features/dashboard/homepage/components/time-range-select";

export function FeaturedIncidentsHeader() {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 border-b p-2 font-medium text-size-3">
      <div className="flex items-center gap-4 text-xs">
        <h2 className="mr-auto font-semibold text-sm">Incidentes destacados</h2>
        <div className="*:not-first:mt-2">
          <TimeRangeSelect />
        </div>
      </div>
      {/* <Link className="group flex items-center gap-2 text-xs" href="/incidentes/destacados">
        Ver todos
        <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
      </Link> */}
    </div>
  );
}
