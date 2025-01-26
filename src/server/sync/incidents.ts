import db from "@/server/db/index";
import {
  type dispatchedStationsInsertSchema,
  dispatchedStations as dispatchedStationsTable,
  type dispatchedVehiclesInsertSchema,
  dispatchedVehicles as dispatchedVehiclesTable,
  type incidentsInsertSchema,
  incidents as incidentsTable
} from "@/server/db/schema";
import {
  getIncidentDetails,
  getIncidentReport,
  getStationsAttendingIncident,
  getVehiclesDispatchedToIncident
} from "@/server/sigae/api";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { conflictUpdateSetAllColumns } from "../db/utils";

export async function upsertIncident(id: number) {
  const [dispatchedStations, dispatchedVehicles, incidentDetails, incidentReport] =
    await Promise.all([
      getStationsAttendingIncident(id),
      getVehiclesDispatchedToIncident(id),
      getIncidentDetails(id),
      getIncidentReport(id)
    ]);

  if (incidentDetails.Descripcion === "No se encontraron registros.") return;

  const responsibleStation =
    dispatchedStations.Items.find((station) => station.DestipoServicio === "RESPONSABLE") ||
    dispatchedStations.Items[dispatchedStations.Items.length - 1];

  const date = incidentDetails.fecha.split("T")[0];
  const time = incidentDetails.hora_incidente.split("T")[1];
  const timestamp = new Date(`${date}T${time}`);

  const incident: z.infer<typeof incidentsInsertSchema> = {
    id: id,
    EEConsecutive: incidentDetails.consecutivo_EE,
    address: incidentDetails.direccion,
    districtId: incidentReport.Id_Distrito,
    cantonId: incidentReport.Id_Canton,
    provinceId: incidentReport.Id_Provincia,
    importantDetails: incidentDetails.DetallesImportantes,
    dispatchIncidentCode: await getIncidentType(incidentDetails.codigo_tipo_incidente_despacho),
    specificDispatchIncidentCode: await getIncidentType(
      incidentDetails.codigo_tipo_incidente_despacho_esp
    ),
    incidentCode: await getIncidentType(incidentDetails.codigo_tipo_incidente),
    specificIncidentCode: await getIncidentType(incidentDetails.codigo_tipo_incidente_esp),
    incidentTimestamp: timestamp,
    responsibleStation: responsibleStation.IdEstacion,
    latitude: incidentDetails.latitud.toString(),
    longitude: incidentDetails.longitud.toString(),
    isOpen: incidentReport.Estado_Abierto === "true"
  };

  const dispatchedStationsData: z.infer<typeof dispatchedStationsInsertSchema>[] =
    dispatchedStations.Items.map((station) => ({
      id: station.IdBoletaEstacionAtiende,
      attentionOnFoot: station.AtencionAPie,
      incidentId: id,
      serviceTypeId: station.IdTipoServicio,
      stationId: station.IdEstacion
    }));

  const dispatchedVehiclesData: z.infer<typeof dispatchedVehiclesInsertSchema>[] =
    dispatchedVehicles.Items.map((vehicle) => ({
      id: vehicle.IdBoletaUnidadDespachada,
      arrivalTime: new Date(vehicle.HoraLLegada),
      baseReturnTime: new Date(vehicle.HoraBase),
      departureTime: new Date(vehicle.HoraRetiro),
      dispatchedTime: new Date(vehicle.HoraDespacho),
      incidentId: id,
      stationId: vehicle.CodigoEstacion,
      vehicleId: vehicle.Unidad === "ATENCION A PIE" ? null : vehicle.CodigoUnidad,
      vehicleInternalNumber: vehicle.NumeroInterno,
      attentionOnFoot: vehicle.Unidad === "ATENCION A PIE"
    }));

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

function sanitizeIncidentCode(code: string) {
  if (code.charAt(code.length - 1) !== ".") return code;

  return code.slice(0, code.length - 1);
}

async function getIncidentType(incidentCode: string) {
  const sanitized = sanitizeIncidentCode(incidentCode);
  const type = await db.query.incidentTypes.findFirst({
    where: eq(incidentsTable.incidentCode, sanitized),
    columns: { incidentCode: true }
  });
  return type?.incidentCode || null;
}
