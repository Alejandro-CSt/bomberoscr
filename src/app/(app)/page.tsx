import { DetailedIncidentDrawer } from "@/features/map/components/detailed-incident-drawer";
import DetailedStationDrawer from "@/features/map/components/detailed-station-drawer";
import IncidentInfoDrawer from "@/features/map/components/incident-drawer";
import { InteractiveMap } from "@/features/map/components/interactive-map";
import StationInfoDrawer from "@/features/map/components/station-drawer";

export default async function Home() {
  return (
    <div className="h-dvh">
      <StationInfoDrawer />
      <IncidentInfoDrawer />
      <DetailedStationDrawer />
      <DetailedIncidentDrawer />
      <InteractiveMap />
    </div>
  );
}
