import { boolean, integer, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const stations = pgTable("stations", {
  id: integer().primaryKey(),
  name: text(),
  stationKey: text(),
  radioChannel: text(),
  latitude: numeric(),
  longitude: numeric(),
  address: text(),
  phoneNumber: text(),
  fax: text(),
  email: text(),
  isOperative: boolean()
});

export const vehicles = pgTable("vehicles", {
  id: integer().primaryKey(),
  internalNumber: text().unique(),
  plate: text(),
  stationId: integer().references(() => stations.id),
  descriptionType: text(),
  class: text(),
  descriptionOperationalStatus: text()
});

export const vehicleDisponibility = pgTable("vehicle_disponibility", {
  id: integer().primaryKey(),
  description: text()
});

export const dispatchedVehicles = pgTable("dispatched_vehicles", {
  id: integer().primaryKey(),
  vehicleId: integer().references(() => vehicles.id),
  incidentId: integer().references(() => incidents.id),
  stationId: integer().references(() => stations.id),
  dispatchedTime: timestamp(),
  arrivalTime: timestamp(),
  departureTime: timestamp(),
  baseReturnTime: timestamp(),
  attentionOnFoot: boolean()
});

export const dispatchedStations = pgTable("dispatched_stations", {
  id: integer().primaryKey(),
  stationId: integer().references(() => stations.id),
  incidentId: integer().references(() => incidents.id),
  serviceTypeId: integer(),
  attentionOnFoot: boolean()
});

export const incidentTypes = pgTable("incident_types", {
  id: integer().primaryKey(),
  incidentCode: text().notNull().unique(),
  name: text(),
  parentId: integer("parent_id")
});

export const incidents = pgTable("incidents", {
  id: integer().primaryKey(),
  incidentCode: text().references(() => incidentTypes.incidentCode),
  specificIncidentCode: text().references(() => incidentTypes.incidentCode),
  dispatchIncidentCode: text().references(() => incidentTypes.incidentCode),
  specificDispatchIncidentCode: text().references(() => incidentTypes.incidentCode),
  EEConsecutive: text(),
  address: text(),
  responsibleStation: integer().references(() => stations.id),
  incidentTimestamp: timestamp(),
  importantDetails: text(),
  latitude: numeric(),
  longitude: numeric(),
  provinceId: integer(),
  cantonId: integer(),
  districtId: integer(),
  isOpen: boolean()
});

export const stationsInsertSchema = createSelectSchema(stations);
export const vehiclesInsertSchema = createSelectSchema(vehicles);
export const vehicleDisponibilityInsertSchema = createSelectSchema(vehicleDisponibility);
export const dispatchedVehiclesInsertSchema = createSelectSchema(dispatchedVehicles);
export const dispatchedStationsInsertSchema = createSelectSchema(dispatchedStations);
export const incidentTypesInsertSchema = createSelectSchema(incidentTypes);
export const incidentsInsertSchema = createSelectSchema(incidents);
