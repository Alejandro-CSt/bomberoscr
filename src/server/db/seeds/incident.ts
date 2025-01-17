import {
  getIncidentDetails,
  getIncidentListApp,
  getStationsAttendingIncident,
  getVehiclesDispatchedToIncident
} from "@/server/api";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import {
  dispatchedVehicles as dispatchedVehiclesSchema,
  incidents as incidentsSchema
} from "../schema";

export interface ObtenerDetalleEmergencias {
  Codigo: string;
  Descripcion: string;
  DetallesImportantes: string;
  codigo_tipo_incidente: string;
  codigo_tipo_incidente_despacho: string;
  codigo_tipo_incidente_despacho_esp: string;
  codigo_tipo_incidente_esp: string;
  consecutivo_EE: string;
  direccion: string;
  estaciones: EstacionesObtenerDetalleEmergencias[];
  fecha: string;
  hora_incidente: string;
  latitud: number;
  longitud: number;
  tipo_incidente: string;
  tipo_incidente_despacho: string;
  tipo_incidente_despacho_esp: string;
  tipo_incidente_esp: string;
}

export interface EstacionesObtenerDetalleEmergencias {
  clave_estacion: string;
  nombre: string;
  vehiculos: VehiculoEstacionesObtenerDetalleEmergencias[];
}

export interface VehiculoEstacionesObtenerDetalleEmergencias {
  estado: string;
  numero_interno: string;
}

export interface ObtenerBoletaIncidente {
  Codigo: string;
  Descripcion: string;
  Aerolinea: number;
  Almas_Abordo: number;
  Anno: number;
  Area_Afectada: number;
  Area_Quemada_Protegida: string;
  Bomberos_Fallecidos: number;
  Bomberos_Heridos: number;
  Cantidad_Dimensiones: number;
  Cantidad_Estructuras_Involucradas: number;
  Canton: string;
  Capacidad: number;
  Cedula_Avisa: string;
  Civiles_Fallecidos: number;
  Civiles_Heridos: number;
  Clave: string;
  CodigoTipoIncidenteDespacho: string;
  CodigoTipoIncidenteReal: string;
  Combustible: string;
  Condiciones_Especiales: string;
  Consecutivo: string;
  DesConstruccion: string;
  DesDimensionesIncidente: string;
  DesEstrategia: string | null;
  DesEtapaIncidente: string | null;
  DesMetodoAviso: string | null;
  DesUbicacion: string;
  Descripcion_Aviso: string | null;
  Direccion: string;
  Distrito: string;
  Estado_Abierto: string;
  Fecha: string;
  Hora_Aviso: string;
  Hora_Controlado: string;
  Hora_Disponible: string;
  Hora_Fuego_Bajo_Control: string;
  Hora_Hospital: string;
  Hora_Paciente: string;
  Hora_Perdidas_Detenidas: string;
  Hora_Todo_Claro: string;
  Hora_Traslado: string;
  Id_Boleta_Incidente: number;
  Id_Bombero_Mando: number;
  Id_Canton: number;
  Id_Construccion: number;
  Id_Dimensiones_Incidente: number;
  Id_Distrito: number;
  Id_Estrategia: number;
  Id_Etapa_Incidente: number;
  Id_Metodo_Aviso: number;
  Id_Provincia: number;
  Id_Tipo_Incidente: number;
  Id_Ubicacion: number;
  Info_Relevante: string;
  Marca: number;
  Matricula: string;
  NomBomberoMando: string;
  NomTipoIncidenteReal: string;
  Nombre_Avisa: string;
  Nombre_Incidente: string;
  Nombre_Mando: string;
  NomtipoIncidenteDespacho: string;
  Observaciones: string;
  Otra_Marca: string;
  Provincia: string;
  Telefono_Avisa: string;
  Tiempo_Desplazamiento: string;
  Tiene_Poliza: boolean;
  Tipo_Aeronave: number;
  Tipo_Alerta: number;
  Tipo_Problema: string;
  Unidad_Capacidad: number;
  Usuario: string;
  X: number;
  Y: number;
}

export interface ObtenerListaEmergenciasApp {
  Codigo: string;
  Descripcion: string;
  items: ItemObtenerListaEmergenciasApp[];
}

export interface ItemObtenerListaEmergenciasApp {
  codigoTipoIncidente: string;
  codigoTipoIncidenteDespacho: string;
  consecutivoEE: string;
  direccion: string;
  estacionResponsable: string;
  fecha: string;
  horaIncidente: string;
  idBoletaIncidente: number;
  tipoIncidente: string;
  tipoIncidenteDespacho: string;
}

export interface ObtenerListaUltimasEmergenciasApp {
  Codigo: string;
  Descripcion: string;
  items: ItemObtenerListaUltimasEmergenciasApp[];
  itemsFecha: ItemsFechaObtenerListaUltimasEmergenciasApp[];
}

export interface ItemObtenerListaUltimasEmergenciasApp {
  codigoTipoIncidente: string;
  codigoTipoIncidenteDespacho: string;
  consecutivoEE: string;
  direccion: string;
  estacionResponsable: string;
  fecha: string;
  horaIncidente: string;
  idBoletaIncidente: number;
  tipoIncidente: string;
  tipoIncidenteDespacho: string;
}

export interface ItemsFechaObtenerListaUltimasEmergenciasApp {
  CantidadEmergencias: number;
  Fecha: string;
}

const FROM = "2025-01-01";
const TO = "2025-12-31";

type IncidentType = typeof incidentsSchema.$inferInsert;
type DispatchedVehicleType = typeof dispatchedVehiclesSchema.$inferInsert;

export async function seedIncidents(db: DrizzleD1Database) {
  const incidents = await getIncidentListApp(FROM, TO);
  const data: IncidentType[] = [];

  for (const incident of incidents.items) {
    const dispatchedVehicles = await getVehiclesDispatchedToIncident(incident.idBoletaIncidente);
    const detailedIncident = await getIncidentDetails(incident.idBoletaIncidente);
    const stationsAttending = await getStationsAttendingIncident(incident.idBoletaIncidente);
    const responsibleStation = stationsAttending.Items.find(
      (station) => incident.estacionResponsable === station.ClaveEstacion
    );
    const vehicles: DispatchedVehicleType[] = dispatchedVehicles.Items.map((vehicle) => ({
      id: vehicle.IdVehiculo,
      stationId: vehicle.CodigoEstacion,
      vehicleInternalNumber: vehicle.NumeroInterno,
      incidentId: incident.idBoletaIncidente,
      dispatchedTime: vehicle.HoraDespacho,
      arrivalTime: vehicle.HoraLLegada,
      departureTime: vehicle.HoraRetiro,
      baseReturnTime: vehicle.HoraBase
    }));

    const incidentData: IncidentType = {
      id: incident.idBoletaIncidente,
      incidentType: detailedIncident.tipo_incidente,
      dispatchIncidentType: detailedIncident.tipo_incidente_despacho,
      incidentCode: detailedIncident.Codigo,
      dispatchIncidentCode: detailedIncident.codigo_tipo_incidente_despacho,
      specificIncidentCode: detailedIncident.codigo_tipo_incidente_esp,
      specificDispatchIncidentCode: detailedIncident.codigo_tipo_incidente_despacho_esp,
      EEConsecutive: detailedIncident.consecutivo_EE,
      address: detailedIncident.direccion,
      responsibleStation: responsibleStation?.IdEstacion,
      date: detailedIncident.fecha,
      incidentTime: detailedIncident.hora_incidente
    };

    db.insert(dispatchedVehiclesSchema).values(vehicles);
    data.push(incidentData);
  }

  db.insert(incidentsSchema).values(data);
}
