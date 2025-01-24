import type { z } from "zod";
import { getIncidentReport } from "../api";
import db from "../db";
import {
  type dispatchedStationsInsertSchema,
  dispatchedStations as dispatchedStationsTable,
  type dispatchedVehiclesInsertSchema,
  dispatchedVehicles as dispatchedVehiclesTable,
  type incidentsInsertSchema,
  incidents as incidentsTable
} from "../db/schema";
import {
  getIncidentDetails,
  getStationsAttendingIncident,
  getVehiclesDispatchedToIncident
} from "../sigae/api";

export async function upsertIncident(id: number) {
  const [dispatchedStations, dispatchedVehicles, incidentDetails, incidentReport] =
    await Promise.all([
      getStationsAttendingIncident(id),
      getVehiclesDispatchedToIncident(id),
      getIncidentDetails(id),
      getIncidentReport(id)
    ]);

  const responsibleStation =
    dispatchedStations.Items.find((station) => station.DestipoServicio === "RESPONSABLE") ||
    dispatchedStations.Items[dispatchedStations.Items.length - 1];

  // Create UTC timestamp from the two date fields
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
    dispatchIncidentCode: sanitizeIncidentCode(incidentDetails.codigo_tipo_incidente_despacho),
    specificDispatchIncidentCode: sanitizeIncidentCode(
      incidentDetails.codigo_tipo_incidente_despacho_esp
    ),
    incidentCode: sanitizeIncidentCode(incidentDetails.codigo_tipo_incidente),
    specificIncidentCode: sanitizeIncidentCode(incidentDetails.codigo_tipo_incidente_esp),
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
      vehicleId: vehicle.IdVehiculo,
      vehicleInternalNumber: vehicle.NumeroInterno
    }));

  await db.insert(incidentsTable).values(incident);
  await db.insert(dispatchedStationsTable).values(dispatchedStationsData);
  await db.insert(dispatchedVehiclesTable).values(dispatchedVehiclesData);
}

function sanitizeIncidentCode(code: string) {
  if (code.charAt(code.length - 1) !== ".") return code;

  return code.slice(0, code.length - 1);
}
