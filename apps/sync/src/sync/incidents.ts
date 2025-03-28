import logger from "@/lib/logger";
import { rawToDispatchedStations, rawToDispatchedVehicles, rawToIncident } from "@/lib/transform";
import { compareTwoStrings } from "@/lib/utils";
import { db } from "@repo/db/db";
import {
  dispatchedStations as dispatchedStationsTable,
  dispatchedVehicles as dispatchedVehiclesTable,
  incidents as incidentsTable
} from "@repo/db/schema";
import { conflictUpdateSetAllColumns } from "@repo/db/utils";
import {
  getIncidentDetails,
  getIncidentReport,
  getStationsAttendingIncident,
  getVehiclesDispatchedToIncident
} from "@repo/sigae/api";
import { eq } from "drizzle-orm";

export async function upsertIncident(id: number) {
  const [dispatchedStations, dispatchedVehicles, incidentDetails, incidentReport] =
    await Promise.all([
      getStationsAttendingIncident(id),
      getVehiclesDispatchedToIncident(id),
      getIncidentDetails(id),
      getIncidentReport(id)
    ]);

  //   if (incidentDetails.Descripcion !== "Proceso realizado satisfactoriamente")
  // Log error

  if (incidentDetails.Descripcion === "No se encontraron registros.") {
    try {
      const similarIncidentId = await getSimilarIncident({
        id,
        address: incidentDetails.direccion
      });
      await db.delete(dispatchedStationsTable).where(eq(dispatchedStationsTable.incidentId, id));
      await db.delete(dispatchedVehiclesTable).where(eq(dispatchedVehiclesTable.incidentId, id));
      await db.delete(incidentsTable).where(eq(incidentsTable.id, id));
      await upsertIncident(similarIncidentId);
    } catch (_) {
      console.error(`Incident not found on SIGAE, no similar incidents found. ${id}`);
      return;
    }
  }

  const responsibleStation =
    dispatchedStations.Items.find((station) => station.DestipoServicio === "RESPONSABLE") ||
    dispatchedStations.Items[dispatchedStations.Items.length - 1];

  const incident = await rawToIncident({
    incidentId: id,
    responsibleStationId:
      responsibleStation?.IdEstacion || dispatchedStations.Items[0]?.IdEstacion || 0,
    incidentReport,
    incidentDetails
  });

  const dispatchedStationsData = rawToDispatchedStations({
    dispatchedStations: dispatchedStations.Items,
    incidentId: id
  });

  const dispatchedVehiclesData = rawToDispatchedVehicles({
    dispatchedVehicles: dispatchedVehicles.Items,
    incidentId: id
  });

  await db.insert(incidentsTable).values(incident).onConflictDoUpdate({
    set: incident,
    target: incidentsTable.id
  });

  if (dispatchedStationsData.length > 0)
    await db
      .insert(dispatchedStationsTable)
      .values(dispatchedStationsData)
      .onConflictDoUpdate({
        target: dispatchedStationsTable.id,
        set: conflictUpdateSetAllColumns(dispatchedStationsTable)
      });

  if (dispatchedVehiclesData.length > 0)
    await db
      .insert(dispatchedVehiclesTable)
      .values(dispatchedVehiclesData)
      .onConflictDoUpdate({
        target: dispatchedVehiclesTable.id,
        set: conflictUpdateSetAllColumns(dispatchedVehiclesTable)
      });

  return incident;
}

async function getSimilarIncident({
  id,
  address
}: {
  id: number;
  address: string;
}): Promise<number> {
  for (let nextId = id + 1; nextId <= id + 15; nextId++) {
    const nextIdIncident = await getIncidentDetails(nextId);
    const dbNextId = await db.query.incidents.findFirst({
      where: eq(incidentsTable.id, nextId)
    });

    if (dbNextId) {
      if (compareTwoStrings(dbNextId.address, address) >= 0.8) {
        return nextId;
      }
    }

    if (nextIdIncident.Descripcion === "No se encontraron registros.") continue;

    if (nextIdIncident.direccion === address) {
      logger.warn(`Updating incident ${id} to ${nextId}`);
      await db.update(incidentsTable).set({ id: nextId }).where(eq(incidentsTable.id, id));
      return nextId;
    }
  }
  throw new Error(`No similar incident found for ${id} ${address}`);
}
