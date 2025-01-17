import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

export const stations = pgTable("stations", {
  id: integer().primaryKey(),
  name: text(),
  stationKey: text(),
  radioChannel: text(),
  latitude: integer(),
  longitude: integer(),
  address: text(),
  phoneNumber: text(),
  fax: text(),
  email: text()
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
  dispatchedTime: text(),
  arrivalTime: text(),
  departureTime: text(),
  baseReturnTime: text(),
  vehicleInternalNumber: text()
});

export const incidentTypes = pgTable("incident_types", {
  id: integer().primaryKey(),
  incidentCode: text(),
  name: text(),
  parentId: integer("id")
});

export const incidents = pgTable("incidents", {
  id: integer().primaryKey(),
  incidentType: text(),
  dispatchIncidentType: text(),
  incidentCode: text(),
  dispatchIncidentCode: text(),
  specificIncidentCode: text(),
  specificDispatchIncidentCode: text(),
  EEConsecutive: text(),
  address: text(),
  responsibleStation: integer().references(() => stations.id),
  date: text(),
  incidentTime: text(),
  importantDetails: text(),
  latitude: integer(),
  longitude: integer(),
  provinceId: integer(),
  cantonId: integer(),
  districtId: integer(),
  isOpen: boolean()
});
