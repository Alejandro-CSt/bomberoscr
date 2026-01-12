import db from "@bomberoscr/db/db";
import {
  type dispatchedStationsInsertSchema,
  type dispatchedVehiclesInsertSchema,
  type incidentsInsertSchema,
  incidents as incidentsTable
} from "@bomberoscr/db/schema";
import { eq } from "drizzle-orm";

import type {
  ItemObtenerEstacionesAtiendeIncidente,
  ItemObtenerUnidadesDespachadasIncidente,
  ObtenerBoletaIncidente,
  ObtenerDetalleEmergencias
} from "@bomberoscr/sigae/types";
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

export function rawToDispatchedVehicles({
  incidentId,
  dispatchedVehicles
}: {
  incidentId: number;
  dispatchedVehicles: ItemObtenerUnidadesDespachadasIncidente[];
}): z.infer<typeof dispatchedVehiclesInsertSchema>[] {
  return dispatchedVehicles.map((vehicle) => ({
    id: vehicle.IdBoletaUnidadDespachada,
    arrivalTime: new Date(vehicle.HoraLLegada),
    baseReturnTime: new Date(vehicle.HoraBase),
    departureTime: new Date(vehicle.HoraRetiro),
    dispatchedTime: new Date(vehicle.HoraDespacho),
    incidentId: incidentId,
    stationId: vehicle.CodigoEstacion,
    vehicleId: vehicle.Unidad === "ATENCION A PIE" ? null : vehicle.CodigoUnidad,
    vehicleInternalNumber: vehicle.NumeroInterno,
    attentionOnFoot: vehicle.Unidad === "ATENCION A PIE"
  }));
}

export async function rawToIncident({
  incidentId,
  responsibleStationId,
  incidentReport,
  incidentDetails
}: {
  incidentId: number;
  responsibleStationId: number;
  incidentReport: ObtenerBoletaIncidente;
  incidentDetails: ObtenerDetalleEmergencias;
}): Promise<z.infer<typeof incidentsInsertSchema>> {
  const date = incidentReport.Fecha.split("T")[0];
  const time = incidentReport.Hora_Aviso.split("T")[1];
  const timestamp = new Date(`${date}T${time}`);
  return {
    id: incidentId,
    EEConsecutive: incidentReport.Consecutivo,
    address: incidentReport.DesUbicacion,
    districtId: incidentReport.Id_Distrito === 0 ? null : incidentReport.Id_Distrito,
    cantonId: incidentReport.Id_Canton === 0 ? null : incidentReport.Id_Canton,
    provinceId: incidentReport.Id_Provincia === 0 ? null : incidentReport.Id_Provincia,
    importantDetails: incidentReport.Direccion,
    dispatchIncidentCode: await getIncidentType(incidentDetails.codigo_tipo_incidente_despacho),
    specificDispatchIncidentCode: await getIncidentType(
      incidentDetails.codigo_tipo_incidente_despacho_esp
    ),
    incidentCode: await getIncidentType(incidentDetails.codigo_tipo_incidente),
    specificIncidentCode: await getIncidentType(incidentDetails.codigo_tipo_incidente_esp),
    incidentTimestamp: timestamp,
    responsibleStation: responsibleStationId,
    latitude: incidentDetails.latitud?.toString() || "0",
    longitude: incidentDetails.longitud?.toString() || "0",
    isOpen: incidentReport.Estado_Abierto === "true",
    modifiedAt: new Date()
  };
}

function sanitizeIncidentCode(code: string) {
  if (code.charAt(code.length - 1) !== ".") return code;

  return code.slice(0, code.length - 1);
}

async function getIncidentType(incidentCode: string | null) {
  if (!incidentCode) return null;
  const sanitized = sanitizeIncidentCode(incidentCode);
  const type = await db.query.incidentTypes.findFirst({
    where: eq(incidentsTable.incidentCode, sanitized),
    columns: { incidentCode: true }
  });
  return type?.incidentCode || null;
}
