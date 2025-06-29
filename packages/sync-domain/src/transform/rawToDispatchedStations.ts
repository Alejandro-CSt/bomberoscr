import type { dispatchedStationsInsertSchema } from "@bomberoscr/db/schema";
import type { ItemObtenerEstacionesAtiendeIncidente } from "@bomberoscr/sync-domain/types";
import type z from "zod";

export function rawToDispatchedStations({
  incidentId,
  dispatchedStations
}: {
  incidentId: number;
  dispatchedStations: ItemObtenerEstacionesAtiendeIncidente[];
}): z.infer<typeof dispatchedStationsInsertSchema>[] {
  return dispatchedStations.map((station) => ({
    id: station.IdBoletaEstacionAtiende,
    attentionOnFoot: station.AtencionAPie,
    incidentId: incidentId,
    serviceTypeId: station.IdTipoServicio,
    stationId: station.IdEstacion
  }));
}
