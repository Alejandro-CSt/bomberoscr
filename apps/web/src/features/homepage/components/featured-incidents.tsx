"use client";

import { trpc } from "@/lib/trpc/client";
import { cn, getRelativeTime } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function FeaturedIncidents() {
  const [timeRange, setTimeRange] = useState(3);
  const { data, isLoading } = trpc.featuredIncidents.getFeaturedIncidents.useQuery({
    timeRange,
    limit: 5
  });

  return (
    <div className="overflow-hidden whitespace-nowrap rounded-lg border shadow-2xl">
      <div className="flex items-center justify-between gap-4 border-b p-2 font-medium text-size-3 uppercase">
        <div className="flex items-center gap-4 text-xs">
          <h2 className="mr-auto font-semibold text-xs">Incidentes destacados</h2>
          <div className="*:not-first:mt-2">
            <Select
              defaultValue="3"
              onValueChange={(value) => setTimeRange(Number(value))}
              value={timeRange.toString()}
            >
              <SelectTrigger className="h-6 border border-none p-0 text-xs uppercase focus-visible:ring-0">
                <SelectValue placeholder="Rango de tiempo" />
              </SelectTrigger>
              <SelectContent className="text-xs uppercase">
                <SelectItem value="1">1 día</SelectItem>
                <SelectItem value="3">3 días</SelectItem>
                <SelectItem value="7">7 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Link
          className="group flex items-center gap-2 text-xs uppercase hover:text-primary-foreground"
          href="/incidentes/destacados"
        >
          Ver todos
          <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <ul>
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <li key={`${index}-${Date.now()}`} className={cn("group", index !== 4 && "border-b")}>
                <div className="grid h-12 grid-cols-[100px_minmax(120px,1fr)_70px] items-center gap-1 p-2 transition-colors duration-200 group-hover:bg-foreground/10">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-full w-full" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-18" />
                  </div>
                </div>
              </li>
            ))
          : data?.map((incident, index) => (
              <li
                key={incident.id}
                className={cn("group", index !== data.length - 1 && "border-b")}
              >
                <Link href={`/incidentes/${incident.id}`}>
                  <div className="grid h-12 grid-cols-[100px_minmax(120px,1fr)_100px] gap-1 p-2 transition-colors duration-200 group-hover:bg-foreground/10">
                    <div className="flex flex-col text-xs">
                      <p className="font-semibold text-muted-foreground">
                        {incident.districtName || "UBIC. PENDIENTE"}
                      </p>
                      <p>{getRelativeTime(incident.incidentTimestamp)}</p>
                    </div>
                    <h3 className="line-clamp-2 text-wrap font-medium text-xs">
                      {incident.importantDetails}
                    </h3>
                    <div className="flex flex-col *:text-xs">
                      <p className="font-semibold">{incident.dispatchedStationsCount} estaciones</p>
                      <p className="font-semibold">{incident.dispatchedVehiclesCount} vehículos</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
      </ul>
    </div>
  );
}
