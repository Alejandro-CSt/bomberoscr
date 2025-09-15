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

  return (
    <div className="flex flex-col">
      <h1 className="font-bold text-xl md:text-3xl">{title}</h1>
      <p className="text-muted-foreground first-letter:uppercase">
        {incident.incidentTimestamp.toLocaleString("es-CR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })}
      </p>
    </div>
  );
}
