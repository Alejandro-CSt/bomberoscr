import { FeaturedIncidents } from "@/features/homepage/components/featured-incidents";
import { FeaturedIncidentsLoading } from "@/features/homepage/components/featured-incidents-loading";
import { LatestIncidents } from "@/features/homepage/components/latest-incidents";
import { LatestIncidentsLoading } from "@/features/homepage/components/latest-incidents-loading";
import { Suspense } from "react";

export default async function Page() {
  return (
    <div className="flex flex-col p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<LatestIncidentsLoading />}>
          <LatestIncidents />
        </Suspense>
        <Suspense fallback={<FeaturedIncidentsLoading />}>
          <FeaturedIncidents />
        </Suspense>
      </div>
    </div>
  );
}
