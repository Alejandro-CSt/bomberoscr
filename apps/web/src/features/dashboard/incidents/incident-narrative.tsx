import { isUndefinedDate } from "@/features/shared/lib/utils";
import type { DetailedIncident } from "@bomberoscr/db/queries/incidents";
import Link from "next/link";

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-CR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function getArticleForTime(date: Date): "la" | "las" {
  const hour = date.getHours() % 12;
  return hour === 1 ? "la" : "las";
}

function formatListSpanish(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0] ?? "";
  return items.join(", ");
}

function calculateResponseTime(dispatchTime: Date, arrivalTime: Date): string {
  const diffMs = arrivalTime.getTime() - dispatchTime.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (minutes > 0) {
    return `${minutes} minuto${minutes !== 1 ? "s" : ""}${seconds > 0 ? ` y ${seconds} segundo${seconds !== 1 ? "s" : ""}` : ""}`;
  }
  return `${seconds} segundo${seconds !== 1 ? "s" : ""}`;
}

function calculateDuration(arrivalTime: Date, departureTime: Date): string {
  const diffMs = departureTime.getTime() - arrivalTime.getTime();
  const totalMinutes = Math.round(diffMs / (1000 * 60));

  if (totalMinutes === 0) {
    return "1 minuto";
  }

  return `${totalMinutes} minuto${totalMinutes !== 1 ? "s" : ""}`;
}

export default function IncidentNarrative({
  incident
}: {
  incident: NonNullable<DetailedIncident>;
}) {
  const dispatchTypes: string[] = [];
  if (incident.dispatchIncidentType?.name) {
    dispatchTypes.push(incident.dispatchIncidentType.name);
  }
  if (incident.specificDispatchIncidentType?.name) {
    dispatchTypes.push(incident.specificDispatchIncidentType.name);
  }
  if (dispatchTypes.length === 0) {
    dispatchTypes.push("incidente");
  }

  const dispatchTypeDisplay = formatListSpanish(dispatchTypes);

  const actualTypes: string[] = [];
  if (incident.incidentType?.name) {
    actualTypes.push(incident.incidentType.name);
  }
  if (incident.specificIncidentType?.name) {
    actualTypes.push(incident.specificIncidentType.name);
  }

  const actualTypeDisplay = formatListSpanish(actualTypes);

  const responsibleStation = incident.dispatchedStations.find(
    (station) => station.serviceTypeId === 1
  );

  const tenMinutesInMs = 10 * 60 * 1000;
  const firstBatchVehicles = responsibleStation
    ? incident.dispatchedVehicles
        .filter((v) => v.station.name === responsibleStation.station.name)
        .filter((v) => !isUndefinedDate(v.dispatchedTime))
        .filter((v) => {
          const timeDiff = v.dispatchedTime.getTime() - incident.incidentTimestamp.getTime();
          return timeDiff >= 0 && timeDiff <= tenMinutesInMs;
        })
        .sort((a, b) => a.dispatchedTime.getTime() - b.dispatchedTime.getTime())
    : [];

  const vehicleNumbers = firstBatchVehicles
    .map((v) => v.vehicle?.internalNumber)
    .filter(Boolean) as string[];

  const arrivedVehicles = firstBatchVehicles.filter((v) => !isUndefinedDate(v.arrivalTime));
  const earliestArrival =
    arrivedVehicles.length > 0
      ? arrivedVehicles.reduce((earliest, current) =>
          current.arrivalTime < earliest.arrivalTime ? current : earliest
        )
      : null;

  const supportingStations = incident.dispatchedStations.filter((s) => s.serviceTypeId !== 1);

  const supportingVehiclesCount = incident.dispatchedVehicles.filter((v) =>
    supportingStations.some((s) => s.station.name === v.station.name)
  ).length;

  const totalVehiclesDispatched = incident.dispatchedVehicles.filter(
    (v) => !isUndefinedDate(v.dispatchedTime)
  );

  const singleVehicleWithDeparture =
    totalVehiclesDispatched.length === 1 &&
    totalVehiclesDispatched[0] &&
    !isUndefinedDate(totalVehiclesDispatched[0].departureTime) &&
    !isUndefinedDate(totalVehiclesDispatched[0].arrivalTime)
      ? totalVehiclesDispatched[0]
      : null;

  return (
    <section className="space-y-4">
      <p>
        Al ser {getArticleForTime(incident.incidentTimestamp)}{" "}
        {formatTime(incident.incidentTimestamp)}, Bomberos recibe una alerta de "
        <em className="lowercase">{dispatchTypeDisplay}</em>". En la dirección:
      </p>
      <blockquote>{incident.address}</blockquote>
      <p>
        {responsibleStation && (
          <>
            Se asigna la estación{" "}
            <Link href={`/mapa/estaciones/${responsibleStation.station.name}`}>
              {responsibleStation.station.name}
            </Link>{" "}
            como responsable
            {vehicleNumbers.length > 0 && (
              <>
                {" "}
                y se {vehicleNumbers.length > 1 ? "despachan las unidades" : "despacha la unidad"}{" "}
                {formatListSpanish(vehicleNumbers)}
              </>
            )}
            {earliestArrival && firstBatchVehicles[0] && (
              <>
                {" "}
                que con un tiempo de respuesta de{" "}
                {calculateResponseTime(
                  firstBatchVehicles[0].dispatchedTime,
                  earliestArrival.arrivalTime
                )}{" "}
                {arrivedVehicles.length > 1 ? "llegan" : "llega"} a la escena al ser{" "}
                {getArticleForTime(earliestArrival.arrivalTime)}{" "}
                {formatTime(earliestArrival.arrivalTime)}
              </>
            )}
          </>
        )}
        .
      </p>

      {singleVehicleWithDeparture && (
        <p>
          La unidad {singleVehicleWithDeparture.vehicle?.internalNumber} permanece en la escena por{" "}
          {calculateDuration(
            singleVehicleWithDeparture.arrivalTime,
            singleVehicleWithDeparture.departureTime
          )}{" "}
          y se retira al ser {getArticleForTime(singleVehicleWithDeparture.departureTime)}{" "}
          {formatTime(singleVehicleWithDeparture.departureTime)}.
        </p>
      )}

      {supportingStations.length > 0 && supportingVehiclesCount > 0 && (
        <p>
          Adicionalmente, se{" "}
          {supportingStations.length > 1 ? "despachan las estaciones" : "despacha la estación"}{" "}
          {supportingStations.map((s, index) => {
            const isLast = index === supportingStations.length - 1;
            const isSecondLast = index === supportingStations.length - 2;

            return (
              <span key={s.station.name}>
                <Link href={`/mapa/estaciones/${s.station.name}`}>{s.station.name}</Link>
                {!isLast && (isSecondLast ? " y " : ", ")}
              </span>
            );
          })}{" "}
          que {supportingStations.length === 1 ? "apoya" : "apoyan"} con {supportingVehiclesCount}{" "}
          {supportingVehiclesCount === 1 ? "unidad" : "unidades"}{" "}
          {supportingVehiclesCount === 1 ? "adicional" : "adicionales"}.
        </p>
      )}

      {(!incident.isOpen || dispatchTypeDisplay !== actualTypeDisplay) &&
        actualTypes.length > 0 &&
        (dispatchTypeDisplay !== actualTypeDisplay ? (
          <p>
            Los bomberos en la escena actualizan la clasificación del incidente a: "
            <em className="lowercase">{actualTypeDisplay}</em>".
          </p>
        ) : (
          <p>
            Los bomberos en la escena confirman la categoría del incidente como "
            <em className="lowercase">{actualTypeDisplay}</em>".
          </p>
        ))}
    </section>
  );
}
