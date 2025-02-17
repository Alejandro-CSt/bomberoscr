import { DetailedIncidentDrawer } from "@/features/map/components/detailed-incident-drawer";
import DetailedStationDrawer from "@/features/map/components/detailed-station-drawer";
import { InteractiveMap } from "@/features/map/components/interactive-map";
import { LatestIncidentsDrawer } from "@/features/map/components/latest-incidents-drawer";
import { MapSettingsDrawer } from "@/features/map/components/settings-drawer";

export default async function Home() {
  return (
    <div className="h-dvh">
      <DetailedStationDrawer />
      <DetailedIncidentDrawer />
      <MapSettingsDrawer />
      <LatestIncidentsDrawer />
      <InteractiveMap />
    </div>
  );
}
