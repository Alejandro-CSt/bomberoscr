import { pgTable, integer, text, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const dispatchedVehicles = pgTable("dispatched_vehicles", {
  id: integer().primaryKey().notNull(),
  vehicleInternalNumber: text(),
  incidentId: integer(),
  stationId: integer(),
  dispatchedTime: text(),
  arrivalTime: text(),
  departureTime: text(),
  baseReturnTime: text()
});

export const incidentTypes = pgTable("incident_types", {
  id: integer(),
  incidentCode: text(),
  name: text()
});

export const incidents = pgTable("incidents", {
  id: integer().primaryKey().notNull(),
  incidentType: text(),
  dispatchIncidentType: text(),
  incidentCode: text(),
  dispatchIncidentCode: text(),
  specificIncidentCode: text(),
  specificDispatchIncidentCode: text(),
  eeConsecutive: text("EEConsecutive"),
  address: text(),
  responsibleStation: integer(),
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

export const stations = pgTable("stations", {
  id: integer().primaryKey().notNull(),
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

export const vehicleDisponibility = pgTable("vehicle_disponibility", {
  id: integer().primaryKey().notNull(),
  description: text()
});

export const vehicles = pgTable("vehicles", {
  id: integer().primaryKey().notNull(),
  internalNumber: text().notNull(),
  plate: text(),
  stationId: integer(),
  descriptionType: text(),
  class: text(),
  descriptionOperationalStatus: text()
});
