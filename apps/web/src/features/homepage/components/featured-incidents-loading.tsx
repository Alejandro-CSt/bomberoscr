import { FeaturedIncidentsHeader } from "@/features/homepage/components/featured-incidents-header";
import { IncidentListItem } from "@/features/homepage/components/incident-list-item";
import { DEFAULT_TIME_RANGE } from "@/features/homepage/schemas/timeRange";

export function FeaturedIncidentsLoading() {
  return (
    <div className="overflow-hidden whitespace-nowrap rounded-lg border bg-card shadow-2xl">
      <FeaturedIncidentsHeader timeRange={DEFAULT_TIME_RANGE} onTimeRangeChange={() => {}} />
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
