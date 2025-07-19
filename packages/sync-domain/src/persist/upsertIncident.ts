import { db } from "@bomberoscr/db/index";
import {
  dispatchedStations as dispatchedStationsTable,
  dispatchedVehicles as dispatchedVehiclesTable,
  incidents as incidentsTable
} from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import { rawToDispatchedStations } from "@bomberoscr/sync-domain/transform/rawToDispatchedStations";
import { rawToDispatchedVehicles } from "@bomberoscr/sync-domain/transform/rawToDispatchedVehicles";
import { rawToIncident } from "@bomberoscr/sync-domain/transform/rawToIncident";
import type {
  ItemObtenerEstacionesAtiendeIncidente,
  ItemObtenerUnidadesDespachadasIncidente,
  ObtenerBoletaIncidente,
  ObtenerDetalleEmergencias
} from "@bomberoscr/sync-domain/types";

export async function upsertIncident({
  incidentId,
  incidentDetails,
  incidentReport,
  stationsAttending,
  vehiclesDispatched
}: {
  incidentId: number;
  incidentDetails: ObtenerDetalleEmergencias;
  incidentReport: ObtenerBoletaIncidente;
  stationsAttending: ItemObtenerEstacionesAtiendeIncidente[];
  vehiclesDispatched: ItemObtenerUnidadesDespachadasIncidente[];
}) {
  if (!incidentDetails || !incidentReport) return;

  const responsibleStation =
    stationsAttending.find((s) => s.DestipoServicio === "RESPONSABLE") ||
    stationsAttending[stationsAttending.length - 1];

  const incident = await rawToIncident({
    incidentId,
    responsibleStationId: responsibleStation?.IdEstacion || stationsAttending[0]?.IdEstacion || 0,
    incidentReport,
    incidentDetails
  });

  const dispatchedStationsData = rawToDispatchedStations({
    dispatchedStations: stationsAttending,
    incidentId
  });

  const dispatchedVehiclesData = rawToDispatchedVehicles({
    dispatchedVehicles: vehiclesDispatched,
    incidentId
  });

  await db.insert(incidentsTable).values(incident).onConflictDoUpdate({
    set: incident,
    target: incidentsTable.id
  });

  if (dispatchedStationsData.length > 0) {
    await db
      .insert(dispatchedStationsTable)
      .values(dispatchedStationsData)
      .onConflictDoUpdate({
        target: dispatchedStationsTable.id,
        set: conflictUpdateSetAllColumns(dispatchedStationsTable)
      });
  }

  if (dispatchedVehiclesData.length > 0) {
    await db
      .insert(dispatchedVehiclesTable)
      .values(dispatchedVehiclesData)
      .onConflictDoUpdate({
        target: dispatchedVehiclesTable.id,
        set: conflictUpdateSetAllColumns(dispatchedVehiclesTable)
      });
  }

  return incident;
}
