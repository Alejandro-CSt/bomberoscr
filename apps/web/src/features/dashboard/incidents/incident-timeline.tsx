import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle
} from "@/features/shared/components/ui/timeline";
import { isUndefinedDate } from "@/features/shared/lib/utils";
import type { DetailedIncident } from "@bomberoscr/db/queries/incidents";

type Props = {
  incident: NonNullable<DetailedIncident>;
};

type TimelineEvent = {
  id: string;
  date: Date;
  title: string;
  description?: string;
};

function formatEventDate(date: Date, incidentDate: Date): string {
  const sameDay =
    date.getFullYear() === incidentDate.getFullYear() &&
    date.getMonth() === incidentDate.getMonth() &&
    date.getDate() === incidentDate.getDate();

  if (sameDay) {
    return date.toLocaleTimeString("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  return date.toLocaleString("es-CR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

export function IncidentTimeline({ incident }: Props) {
  type Kind = "dispatch" | "arrival" | "departure";
  type VehicleEvent = { date: Date; vehicle: string; station: string };
  const byKindStation = new Map<Kind, Map<string, VehicleEvent[]>>();
  const thresholdMs = 10 * 60 * 1000;

  const pushEvent = (kind: Kind, date: Date, station: string, vehicle: string) => {
    const stationKey =
      kind === "arrival" || kind === "dispatch" || kind === "departure"
        ? `all-${kind === "dispatch" ? "dispatches" : kind === "arrival" ? "arrivals" : "departures"}`
        : station;
    const existingStationMap = byKindStation.get(kind);
    const stationMap = existingStationMap ?? new Map<string, VehicleEvent[]>();
    if (!existingStationMap) byKindStation.set(kind, stationMap);
    const list = stationMap.get(stationKey) ?? [];
    list.push({ date, vehicle, station });
    stationMap.set(stationKey, list);
  };

  const events: TimelineEvent[] = [];

  events.push({
    id: `incident:${incident.id}:reported`,
    date: incident.incidentTimestamp,
    title: "Reporte inicial"
  });

  for (const v of incident.dispatchedVehicles) {
    const vehicleLabel = v.vehicle?.internalNumber || "N/A";
    const stationLabel = v.station.name;

    if (!isUndefinedDate(v.dispatchedTime)) {
      pushEvent("dispatch", v.dispatchedTime, stationLabel, vehicleLabel);
    }
    if (!isUndefinedDate(v.arrivalTime)) {
      pushEvent("arrival", v.arrivalTime, stationLabel, vehicleLabel);
    }
    if (!isUndefinedDate(v.departureTime)) {
      pushEvent("departure", v.departureTime, stationLabel, vehicleLabel);
    }
  }

  for (const [kind, stationMap] of byKindStation) {
    for (const [stationKey, list] of stationMap) {
      list.sort((a, b) => a.date.getTime() - b.date.getTime());

      let groupStart: Date | undefined;
      let groupVehicles: string[] = [];
      let groupStations = new Set<string>();

      const flush = () => {
        if (!groupStart || groupVehicles.length === 0) return;
        const uniqueStations = Array.from(groupStations);
        const stationDescription =
          kind === "arrival" || kind === "dispatch" || kind === "departure"
            ? uniqueStations.length === 1
              ? uniqueStations[0]
              : uniqueStations.join(", ")
            : stationKey;

        const idBase = `${kind}|${stationKey}|${groupStart.getTime()}|${groupVehicles.join("-")}`;
        const count = groupVehicles.length;
        if (kind === "dispatch") {
          events.push({
            id: idBase,
            date: groupStart,
            title:
              count > 1
                ? `Despachados: ${groupVehicles.join(", ")}`
                : `Despachado: ${groupVehicles[0]}`,
            description: stationDescription
          });
        } else if (kind === "arrival") {
          events.push({
            id: idBase,
            date: groupStart,
            title:
              count > 1
                ? `Llegada a escena: ${groupVehicles.join(", ")}`
                : `Llegada a escena: ${groupVehicles[0]}`,
            description: stationDescription
          });
        } else if (kind === "departure") {
          events.push({
            id: idBase,
            date: groupStart,
            title:
              count > 1
                ? `Retiro de escena: ${groupVehicles.join(", ")}`
                : `Retiro de escena: ${groupVehicles[0]}`
          });
        }
      };

      for (const e of list) {
        if (!groupStart) {
          groupStart = e.date;
          groupVehicles = [e.vehicle];
          groupStations = new Set([e.station]);
          continue;
        }
        const diff = e.date.getTime() - groupStart.getTime();
        if (diff <= thresholdMs) {
          groupVehicles.push(e.vehicle);
          groupStations.add(e.station);
        } else {
          flush();
          groupStart = e.date;
          groupVehicles = [e.vehicle];
          groupStations = new Set([e.station]);
        }
      }
      flush();
    }
  }

  if (!incident.isOpen && incident.modifiedAt) {
    events.push({
      id: `incident:${incident.id}:closed`,
      date: incident.modifiedAt,
      title: "Incidente cerrado"
    });
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  const lastStep = events.length > 0 ? events.length : 1;

  return (
    <Timeline defaultValue={lastStep}>
      {events.map((e, index) => (
        <TimelineItem key={e.id} step={index + 1}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineDate>{formatEventDate(e.date, incident.incidentTimestamp)}</TimelineDate>
            <TimelineTitle>{e.title}</TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
          {e.description ? <TimelineContent>{e.description}</TimelineContent> : null}
        </TimelineItem>
      ))}
    </Timeline>
  );
}

export default IncidentTimeline;
