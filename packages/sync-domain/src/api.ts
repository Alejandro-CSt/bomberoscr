import type { Fetcher } from "@bomberoscr/sync-domain/fetcher";
import type {
  ObtenerBoletaIncidente,
  ObtenerCantonesLista,
  ObtenerDatosVehiculo,
  ObtenerDetalleEmergencias,
  ObtenerDistritosLista,
  ObtenerEstacionDetalle,
  ObtenerEstaciones,
  ObtenerEstacionesAtiendeIncidente,
  ObtenerEstacionesOperativas,
  ObtenerEstadoDisponibilidadUnidades,
  ObtenerListaEmergenciasApp,
  ObtenerListaUltimasEmergenciasApp,
  ObtenerProvinciaLista,
  ObtenerTiposIncidente,
  ObtenerUnidadesDespachadasIncidente,
  ObtenerVehiculosComboF5
} from "@bomberoscr/sync-domain/types";
import type { ResultAsync } from "neverthrow";

export const getVehicleDisponibilityStates = ({ fetcher }: { fetcher: Fetcher }) =>
  fetcher<ObtenerEstadoDisponibilidadUnidades>("ObtenerEstadoDisponibilidadUnidades");

export const getAllVehicles = ({ fetcher }: { fetcher: Fetcher }) =>
  fetcher<ObtenerVehiculosComboF5>("ObtenerVehiculosComboF5");

export const getVehicleDetails = ({ fetcher, id }: { fetcher: Fetcher; id: number }) =>
  fetcher<ObtenerDatosVehiculo>("ObtenerDatosVehiculo", {
    Id_Vehiculo: id
  });

export const getVehiclesDispatchedToIncident = ({
  fetcher,
  id
}: {
  fetcher: Fetcher;
  id: number;
}) =>
  fetcher<ObtenerUnidadesDespachadasIncidente>("ObtenerUnidadesDespachadasIncidente", {
    Id_Boleta_Incidente: id
  });

export const getStationsList = ({ fetcher }: { fetcher: Fetcher }) =>
  fetcher<ObtenerEstaciones>("ObtenerEstaciones");

export const getOperativeStations = ({ fetcher }: { fetcher: Fetcher }) =>
  fetcher<ObtenerEstacionesOperativas>("ObtenerEstacionesOperativas");

export const getStationDetails = ({ fetcher, id }: { fetcher: Fetcher; id: number }) =>
  fetcher<ObtenerEstacionDetalle>("ObtenerEstacionDetalle", {
    id_estacion: id
  });

export const getStationsAttendingIncident = ({ fetcher, id }: { fetcher: Fetcher; id: number }) =>
  fetcher<ObtenerEstacionesAtiendeIncidente>("ObtenerEstacionesAtiendeIncidente", {
    Id_Boleta_Incidente: id
  });

export const getIncidentReport = ({ fetcher, id }: { fetcher: Fetcher; id: number }) =>
  fetcher<ObtenerBoletaIncidente>("ObtenerBoletaIncidente", {
    Id_Boleta_Incidente: id
  });

export const getIncidentTypes = ({ fetcher }: { fetcher: Fetcher }) =>
  fetcher<ObtenerTiposIncidente>("ObtenerTiposIncidente");

export const getIncidentDetails = ({ fetcher, id }: { fetcher: Fetcher; id: number }) =>
  fetcher<ObtenerDetalleEmergencias>("ObtenerDetalleEmergencias", {
    id_boleta_incidente: id
  });

export const getIncidentListApp = ({
  fetcher,
  from,
  to
}: {
  fetcher: Fetcher;
  from: string;
  to: string;
}) =>
  fetcher<ObtenerListaEmergenciasApp>("ObtenerListaEmergenciasApp", {
    FechaDesde: from,
    FechaHasta: to
  });

export const getLatestIncidentsListApp: (
  fetcher: Fetcher,
  amount: number
) => ResultAsync<ObtenerListaUltimasEmergenciasApp, Error> = (fetcher, amount) =>
  fetcher<ObtenerListaUltimasEmergenciasApp>("ObtenerListaUltimasEmergenciasApp", {
    numero_registros: amount,
    id_tipo_incidentes_despacho: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    id_tipo_incidentes_real: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  });

export const getDistrictsList = ({ fetcher }: { fetcher: Fetcher }) =>
  fetcher<ObtenerDistritosLista>("ObtenerDistritosLista");

export const getCantonsList = ({ fetcher }: { fetcher: Fetcher }) =>
  fetcher<ObtenerCantonesLista>("ObtenerCantonesLista");

export const getProvincesList = ({ fetcher }: { fetcher: Fetcher }) =>
  fetcher<ObtenerProvinciaLista>("ObtenerProvinciaLista");
