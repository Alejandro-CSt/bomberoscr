import { DetailedIncidentDrawer } from "@/features/map/components/detailed-incident-drawer";
import DetailedStationDrawer from "@/features/map/components/detailed-station-drawer";
import IncidentInfoDrawer from "@/features/map/components/incident-drawer";
import { InteractiveMap } from "@/features/map/components/interactive-map";
import StationInfoDrawer from "@/features/map/components/station-drawer";
import { getStations } from "@/server/db/queries";

export default async function Home() {
  const allStationsQuery = await getStations(true);
  const operativeStationsQuery = await getStations(false);

  return (
    <div className="h-dvh">
      <StationInfoDrawer />
      <IncidentInfoDrawer />
      <DetailedStationDrawer />
      <DetailedIncidentDrawer />
      <InteractiveMap allStations={allStationsQuery} operativeStations={operativeStationsQuery} />
    </div>
  );
}
