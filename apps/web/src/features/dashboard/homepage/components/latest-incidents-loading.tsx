import { IncidentListItem } from "@/features/dashboard/homepage/components/incident-list-item";
import { LatestIncidentsHeader } from "@/features/dashboard/homepage/components/latest-incidents-header";

export function LatestIncidentsLoading() {
  return (
    <div className="overflow-hidden whitespace-nowrap rounded-lg border bg-card shadow-2xl">
      <LatestIncidentsHeader />
      <div className="relative">
        <ul>
          {Array.from({ length: 5 }, (_, index) => ({
            id: `skeleton-latest-${index}`,
            index
          })).map(({ id, index }) => (
            <IncidentListItem key={id} isLoading={true} isLast={index === 4} />
          ))}
        </ul>
      </div>
    </div>
  );
}
