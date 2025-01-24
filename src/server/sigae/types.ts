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

export interface ObtenerEstaciones {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerEstaciones[];
}

export interface ItemObtenerEstaciones {
  ClaveEstacion: string;
  IdEstacion: number;
  Nombre: string;
}

export interface ObtenerEstacionLista {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerEstacionLista[];
}

export interface ItemObtenerEstacionLista {
  ClaveEstacion: string;
  IdEstacion: number;
  Latitud: number;
  Longitud: number;
  Nombre: string;
  Telefono: string;
}

export interface ObtenerEstacionDetalle {
  Codigo: string;
  Descripcion: string;
  CanalRadio: string;
  ClaveEstacion: string;
  Direccion: string;
  Email: string;
  Fax: string;
  IdEstacion: number;
  Latitud: number;
  Longitud: number;
  Nombre: string;
  Telefono: string;
}

export interface ObtenerEstacionesOperativas {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerEstacionesOperativas[];
}

export interface ItemObtenerEstacionesOperativas {
  ClaveEstacion: string;
  IdEstacion: number;
  Nombre: string;
}

export interface ObtenerEstacionesAtiendeIncidente {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerEstacionesAtiendeIncidente[];
}

export interface ItemObtenerEstacionesAtiendeIncidente {
  Codigo: string | null;
  Descripcion: string | null;
  AtencionAPie: boolean;
  ClaveEstacion: string;
  DestipoServicio: string;
  HoraAtencionAPie: string;
  IdBoletaEstacionAtiende: number;
  IdEstacion: number;
  IdTipoServicio: number;
  NombreEstacion: string;
}

export interface ObtenerEstadoDisponibilidadUnidades {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerEstadoDisponibilidadUnidades[];
}

export interface ItemObtenerEstadoDisponibilidadUnidades {
  Descripcion: string;
  IdGrupoClasificacion: number;
}

export interface ObtenerVehiculosComboF5 {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerVehiculosComboF5[];
}

export interface ItemObtenerVehiculosComboF5 {
  IdVehiculo: number;
  NumeroInterno: string;
}

export interface ObtenerDatosVehiculo {
  Codigo: string;
  Descripcion: string;
  Asignado_a: string;
  Canton: string;
  Capacidad: number;
  Clave_estacion_evolution: string;
  Des_clase_vehiculo: string;
  Des_estado_disponibilidad: string;
  Des_estado_operativo: string;
  Des_tipo_vehiculo: string;
  Distrito: string;
  Id_Estacion_Reporte: number;
  Id_canton: number;
  Id_clase_vehiculo: number;
  Id_distrito: number;
  Id_estacion: number;
  Id_estacion_transferido: number;
  Id_estado_disponibilidad: number;
  Id_estado_operativo: number;
  Id_personal: number;
  Id_personal_transferido: number;
  Id_provincia: number;
  Id_tipo_vehiculo: number;
  Id_veh_evo: string;
  Id_vehiculo: number;
  Ind_i_a: number;
  Numero_interno: string;
  Observaciones: string;
  Placa: string;
  Provincia: string;
  Transferido_a: string;
}

export interface ObtenerUnidadesDespachadasIncidente {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerUnidadesDespachadasIncidente[];
}

export interface ItemObtenerUnidadesDespachadasIncidente {
  Codigo: string | null;
  Descripcion: string | null;
  CodigoEstacion: number;
  CodigoUnidad: number;
  DespachoAlarma: boolean;
  HoraBase: string;
  HoraDespacho: string;
  HoraDevolverBase: string;
  HoraLLegada: string;
  HoraRetiro: string;
  HoraTraslado: string;
  IdBoletaServicio: number;
  IdBoletaUnidadDespachada: number;
  IdVehiculo: number;
  NumeroInterno: string | null;
  Traslado: boolean;
  Unidad: string;
  UnidadCompleta: string;
}
