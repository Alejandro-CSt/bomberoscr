import env from "./env";
import type {
  ObtenerBoletaIncidente,
  ObtenerDatosVehiculo,
  ObtenerDetalleEmergencias,
  ObtenerEstacionDetalle,
  ObtenerEstaciones,
  ObtenerEstacionesAtiendeIncidente,
  ObtenerEstacionesOperativas,
  ObtenerEstadoDisponibilidadUnidades,
  ObtenerListaEmergenciasApp,
  ObtenerListaUltimasEmergenciasApp,
  ObtenerTiposIncidente,
  ObtenerUnidadesDespachadasIncidente,
  ObtenerVehiculosComboF5
} from "./types";

interface BaseRequestBody {
  IP: string;
  Password: string;
  Usuario: string;
  codSistema: string;
}

async function fetcher<T, B extends object = object>(path: string, extraBody: B = {} as B) {
  const baseUrl = env.SIGAE_API_URL.endsWith("/")
    ? env.SIGAE_API_URL.slice(0, -1)
    : env.SIGAE_API_URL;

  const baseBody: BaseRequestBody = {
    IP: env.SIGAE_IP,
    Password: env.SIGAE_PASSWORD,
    Usuario: env.SIGAE_USER,
    codSistema: env.SIGAE_COD_SYS
  };

  const response = await fetch(`${baseUrl}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...baseBody,
      ...extraBody
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getVehicleDisponibilityStates() {
  return await fetcher<ObtenerEstadoDisponibilidadUnidades>("ObtenerEstadoDisponibilidadUnidades");
}

export async function getAllVehicles() {
  return await fetcher<ObtenerVehiculosComboF5>("ObtenerVehiculosComboF5");
}

export async function getVehicleDetails(id: number) {
  return await fetcher<ObtenerDatosVehiculo>("ObtenerDatosVehiculo", {
    Id_Vehiculo: id
  });
}

export async function getVehiclesDispatchedToIncident(id: number) {
  return await fetcher<ObtenerUnidadesDespachadasIncidente>("ObtenerUnidadesDespachadasIncidente", {
    Id_Boleta_Incidente: id
  });
}

export async function getStationsList() {
  return await fetcher<ObtenerEstaciones>("ObtenerEstaciones");
}

export async function getOperativeStations() {
  return await fetcher<ObtenerEstacionesOperativas>("ObtenerEstacionesOperativas");
}

export async function getStationDetails(id: number) {
  return await fetcher<ObtenerEstacionDetalle>("ObtenerEstacionDetalle", {
    id_estacion: id
  });
}

export async function getStationsAttendingIncident(id: number) {
  return await fetcher<ObtenerEstacionesAtiendeIncidente>("ObtenerEstacionesAtiendeIncidente", {
    Id_Boleta_Incidente: id
  });
}

export async function getIncidentReport(id: number) {
  return await fetcher<ObtenerBoletaIncidente>("ObtenerBoletaIncidente", {
    Id_Boleta_Incidente: id
  });
}

export async function getIncidentTypes() {
  return await fetcher<ObtenerTiposIncidente>("ObtenerTiposIncidente");
}

export async function getIncidentDetails(id: number) {
  return await fetcher<ObtenerDetalleEmergencias>("ObtenerDetalleEmergencias", {
    id_boleta_incidente: id
  });
}

export async function getIncidentListApp(dateFrom: string, dateTo: string) {
  return await fetcher<ObtenerListaEmergenciasApp>("ObtenerListaEmergenciasApp", {
    FechaDesde: dateFrom,
    FechaHasta: dateTo
  });
}

export async function getLatestIncidentsListApp(amount: number) {
  return await fetcher<ObtenerListaUltimasEmergenciasApp>("ObtenerListaUltimasEmergenciasApp", {
    numero_registros: amount,
    id_tipo_incidentes_despacho: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    id_tipo_incidentes_real: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  });
}
