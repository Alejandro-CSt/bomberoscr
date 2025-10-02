import type { DetailedIncident } from "@bomberoscr/db/queries/incidents";

export function IncidentHeader({ incident }: { incident: NonNullable<DetailedIncident> }) {
  let title = incident.importantDetails;
  if (incident.district) {
    title += ` EN ${incident.district.name}`;
  }
  if (incident.canton) {
    title += `, ${incident.canton.name}`;
  }
  if (incident.province) {
    title += `, ${incident.province.name}`;
  }

  const formatted = incident.incidentTimestamp.toLocaleString("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  return (
    <header className="flex flex-col">
      <h1 itemProp="headline">{title}</h1>
      <p>
        <time dateTime={incident.incidentTimestamp.toISOString()}>{formatted}</time>
      </p>
    </header>
  );
}
