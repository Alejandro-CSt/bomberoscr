import { FeaturedIncidentsHeader } from "@/features/dashboard/homepage/components/featured-incidents-header";
import { IncidentListItem } from "@/features/dashboard/homepage/components/incident-list-item";

export function FeaturedIncidentsLoading() {
  return (
    <div className="overflow-hidden whitespace-nowrap rounded-lg border bg-card shadow-2xl">
      <FeaturedIncidentsHeader />
      <div className="relative">
        <ul>
          {Array.from({ length: 5 }, (_, index) => ({
            id: `skeleton-incident-${index}`,
            index
          })).map(({ id, index }) => (
            <IncidentListItem key={id} isLoading={true} isLast={index === 4} />
          ))}
        </ul>
      </div>
    </div>
  );
}
