import { cn } from "@/lib/utils";
import type { HighlightedIncident as HighlightedIncidentType } from "@bomberoscr/db/queries/highlightedIncidents";
import { ArrowRightIcon, ImageIcon } from "lucide-react";
import { Bricolage_Grotesque } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "700"]
});

export function HighlightedIncident({ incident }: { incident: HighlightedIncidentType }) {
  return (
    <Link
      href={`/incidentes/${incident.id}`}
      className={cn(
        "group flex h-full flex-col justify-between overflow-hidden rounded-2xl not-dark:border bg-card",
        bricolageGrotesque.className
      )}
      aria-label={`Ver detalles del incidente: ${incident.importantDetails}`}
    >
      <IncidentImage incident={incident} />
      <div className="flex flex-col gap-2 p-4">
        <span className="text-muted-foreground text-sm">{incident.incidentType}</span>
        <h3 className="font-bold text-lg leading-tight">{incident.importantDetails}</h3>
        <p className="line-clamp-2 text-muted-foreground text-sm leading-tight">
          {incident.address}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {incident.dispatchedStationsCount} estaciones
          </span>
          <span className="text-muted-foreground">
            {incident.dispatchedVehiclesCount} vehículos
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t p-4">
        <span className="text-sm">Ver detalles</span>
        <ArrowRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
    </Link>
  );
}

function IncidentStatus({ isOpen, className }: { isOpen: boolean; className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      aria-label={isOpen ? "Incidente en progreso" : "Incidente atendido"}
    >
      <span
        className={cn(
          "size-1.5 rounded-full bg-current",
          isOpen ? "bg-red-500/90" : "bg-green-500/90 "
        )}
        aria-hidden="true"
      />
      {isOpen ? "En progreso" : "Atendido"}
    </div>
  );
}

function IncidentImage({ incident }: { incident: HighlightedIncidentType }) {
  const formattedDate = new Date(incident.incidentTimestamp).toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="relative h-[250px] w-full overflow-hidden">
      <Image
        src="/map-dark.png"
        alt={`Mapa del incidente: ${incident.importantDetails}`}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        priority={false}
      />
      <div className="absolute right-3 bottom-3 flex items-center gap-2 rounded-lg bg-background/70 px-2 py-1 text-xs backdrop-blur-sm">
        <ImageIcon className="size-3" aria-hidden="true" />
        <span>Teletica</span>
      </div>
      <IncidentStatus
        isOpen={incident.isOpen}
        className="absolute top-3 right-3 flex items-center gap-2 rounded-lg bg-background/70 px-2 py-1 text-xs backdrop-blur-sm"
      />
      <span className="absolute top-3 left-3 rounded-lg bg-background/70 px-2 py-1 text-xs backdrop-blur-sm">
        {formattedDate}
      </span>
    </div>
  );
}
