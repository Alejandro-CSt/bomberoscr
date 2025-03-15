import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const stations = pgTable("stations", {
  id: integer().primaryKey(),
  name: text().notNull(),
  stationKey: text().notNull(),
  radioChannel: text(),
  latitude: numeric().notNull(),
  longitude: numeric().notNull(),
  address: text(),
  phoneNumber: text(),
  fax: text(),
  email: text(),
  isOperative: boolean()
});

export const stationsRelations = relations(stations, ({ many }) => ({
  vehicles: many(vehicles),
  dispatchedStations: many(dispatchedStations),
  dispatchedVehicles: many(dispatchedVehicles)
}));

export const vehicles = pgTable("vehicles", {
  id: integer().primaryKey(),
  internalNumber: text().notNull().unique(),
  plate: text().notNull(),
  stationId: integer()
    .notNull()
    .references(() => stations.id),
  descriptionType: text().notNull(),
  class: text().notNull(),
  descriptionOperationalStatus: text().notNull()
});

export const vehicleDisponibility = pgTable("vehicle_disponibility", {
  id: integer().primaryKey(),
  description: text().notNull()
});

export const dispatchedVehicles = pgTable("dispatched_vehicles", {
  id: integer().primaryKey(),
  vehicleId: integer().references(() => vehicles.id),
  incidentId: integer()
    .notNull()
    .references(() => incidents.id),
  stationId: integer()
    .notNull()
    .references(() => stations.id),
  dispatchedTime: timestamp().notNull(),
  arrivalTime: timestamp().notNull(),
  departureTime: timestamp().notNull(),
  baseReturnTime: timestamp().notNull(),
  attentionOnFoot: boolean().default(false)
});

export const dispatchedStations = pgTable("dispatched_stations", {
  id: integer().primaryKey(),
  stationId: integer()
    .notNull()
    .references(() => stations.id),
  incidentId: integer()
    .notNull()
    .references(() => incidents.id),
  serviceTypeId: integer(),
  attentionOnFoot: boolean().notNull()
});

export const incidentTypes = pgTable("incident_types", {
  id: integer("id").primaryKey(),
  incidentCode: text().notNull().unique(),
  name: text().notNull(),
  parentId: integer("parent_id").references((): AnyPgColumn => incidentTypes.id)
});

export const incidents = pgTable("incidents", {
  id: integer().primaryKey(),
  incidentCode: text().references(() => incidentTypes.incidentCode),
  specificIncidentCode: text().references(() => incidentTypes.incidentCode),
  dispatchIncidentCode: text().references(() => incidentTypes.incidentCode),
  specificDispatchIncidentCode: text().references(() => incidentTypes.incidentCode),
  EEConsecutive: text().notNull(),
  address: text().notNull(),
  responsibleStation: integer().references(() => stations.id),
  incidentTimestamp: timestamp().notNull(),
  importantDetails: text().notNull(),
  latitude: numeric().notNull(),
  longitude: numeric().notNull(),
  provinceId: integer(),
  cantonId: integer(),
  districtId: integer(),
  isOpen: boolean().notNull(),
  modifiedAt: timestamp().notNull().defaultNow()
});

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  station: one(stations, { fields: [vehicles.stationId], references: [stations.id] }),
  dispatchedVehicles: many(dispatchedVehicles)
}));

export const vehicleDisponibilityRelations = relations(vehicleDisponibility, () => ({}));

export const dispatchedVehiclesRelations = relations(dispatchedVehicles, ({ one }) => ({
  vehicle: one(vehicles, { fields: [dispatchedVehicles.vehicleId], references: [vehicles.id] }),
  incident: one(incidents, { fields: [dispatchedVehicles.incidentId], references: [incidents.id] }),
  station: one(stations, { fields: [dispatchedVehicles.stationId], references: [stations.id] })
}));

export const dispatchedStationsRelations = relations(dispatchedStations, ({ one }) => ({
  station: one(stations, { fields: [dispatchedStations.stationId], references: [stations.id] }),
  incident: one(incidents, { fields: [dispatchedStations.incidentId], references: [incidents.id] })
}));

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  station: one(stations, { fields: [incidents.responsibleStation], references: [stations.id] }),
  dispatchedVehicles: many(dispatchedVehicles),
  dispatchedStations: many(dispatchedStations),
  incidentType: one(incidentTypes, {
    fields: [incidents.incidentCode],
    references: [incidentTypes.incidentCode]
  }),
  dispatchIncidentType: one(incidentTypes, {
    fields: [incidents.dispatchIncidentCode],
    references: [incidentTypes.incidentCode]
  }),
  specificIncidentType: one(incidentTypes, {
    fields: [incidents.specificIncidentCode],
    references: [incidentTypes.incidentCode]
  }),
  specificDispatchIncidentType: one(incidentTypes, {
    fields: [incidents.specificDispatchIncidentCode],
    references: [incidentTypes.incidentCode]
  })
}));

export const stationsInsertSchema = createSelectSchema(stations);
export const vehiclesInsertSchema = createSelectSchema(vehicles);
export const vehicleDisponibilityInsertSchema = createSelectSchema(vehicleDisponibility);
export const dispatchedVehiclesInsertSchema = createSelectSchema(dispatchedVehicles);
export const dispatchedStationsInsertSchema = createSelectSchema(dispatchedStations);
export const incidentTypesInsertSchema = createSelectSchema(incidentTypes);
export const incidentsInsertSchema = createSelectSchema(incidents);
