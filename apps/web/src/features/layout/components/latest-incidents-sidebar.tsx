"use client";

import { LiveRelativeTime } from "@/features/layout/components/live-relative-time";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader
} from "@/features/shared/components/ui/sidebar";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { trpc } from "@/features/trpc/client";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export function LatestIncidentsSidebar() {
  const {
    data: incidents,
    dataUpdatedAt,
    isLoading
  } = trpc.latestIncidents.getLatestIncidents.useQuery({ limit: 20 }, { refetchInterval: 25_000 });

  const skeletonItems = [
    { id: "skeleton-1", width: "w-32" },
    { id: "skeleton-2", width: "w-28" },
    { id: "skeleton-3", width: "w-36" },
    { id: "skeleton-4", width: "w-30" },
    { id: "skeleton-5", width: "w-34" }
  ];

  return (
    <Sidebar collapsible="none" className="hidden flex-1 font-mono md:flex">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-ellipsis whitespace-nowrap font-medium text-base text-foreground">
            Últimos incidentes
            <p className="text-muted-foreground text-xs">
              {isLoading ? (
                "Actualizando"
              ) : (
                <>
                  Actualizado <LiveRelativeTime iso={new Date(dataUpdatedAt).toISOString()} />
                </>
              )}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            {isLoading ? (
              <>
                {skeletonItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 border-b p-4 last:border-b-0">
                    <div className="flex w-full justify-between gap-2">
                      <Skeleton className={`h-5 ${item.width}`} />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                ))}
                <div className="flex min-h-20 w-full items-center justify-center gap-4 border-b p-4 leading-tight">
                  <Skeleton className="h-5 w-32" />
                </div>
              </>
            ) : (
              <>
                {incidents?.map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/incidentes/${incident.id}`}
                    className="flex flex-col gap-3 border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <div className="flex w-full justify-between gap-2">
                      <p className="line-clamp-2">{incident.incidentType ?? "DESCONOCIDO"}</p>
                      <div className="flex flex-col items-end">
                        <p className="whitespace-nowrap text-muted-foreground text-xs first-letter:uppercase">
                          <LiveRelativeTime iso={incident.incidentTimestamp} />
                        </p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-muted-foreground text-sm">{incident.address}</p>
                    <div className="flex flex-col">
                      <p className="text-muted-foreground text-xs">ESTACIÓN RESPONSABLE</p>
                      <p className="font-semibold text-muted-foreground">
                        {incident.responsibleStation ?? "DESCONOCIDO"}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/incidentes"
                  className="flex min-h-20 w-full items-center justify-center gap-4 border-b p-4 leading-tight underline underline-offset-4 last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  Ver todos los incidentes <ArrowRightIcon className="size-4" />
                </Link>
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
