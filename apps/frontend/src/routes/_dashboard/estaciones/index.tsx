import { createFileRoute } from "@tanstack/react-router";

import {
  StationsDirectorySection,
  StationsDirectorySectionSkeleton
} from "@/components/stations/stations-directory-section";
import {
  StationsSystemOverviewSection,
  StationsSystemOverviewSkeletonSection
} from "@/components/stations/stations-directory-system-overview-section";

const title = "Estaciones de Bomberos — Emergencias CR";
const description =
  "Consulta el directorio de estaciones de bomberos de Costa Rica, con datos de ubicación, unidades y estadísticas de respuesta.";

export const Route = createFileRoute("/_dashboard/estaciones/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description }
    ]
  }),
  component: Page,
  pendingComponent: PageSkeleton
});

function Page() {
  return (
    <div className="flex flex-col gap-6">
      <StationsSystemOverviewSection />
      <StationsDirectorySection />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <StationsSystemOverviewSkeletonSection />
      <StationsDirectorySectionSkeleton />
    </div>
  );
}
