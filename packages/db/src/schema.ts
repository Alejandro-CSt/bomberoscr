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
import { createInsertSchema } from "drizzle-zod";

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
  provinceId: integer().references(() => provinces.id),
  cantonId: integer().references(() => cantons.id),
  districtId: integer().references(() => districts.id),
  isOpen: boolean().notNull(),
  modifiedAt: timestamp().notNull().defaultNow()
});

export const provinces = pgTable("provinces", {
  id: integer().primaryKey(),
  name: text().notNull(),
  code: text().notNull()
});

export const cantons = pgTable("cantons", {
  id: integer().primaryKey(),
  name: text().notNull(),
  code: text().notNull(),
  provinceId: integer()
    .notNull()
    .references(() => provinces.id)
});

export const districts = pgTable("districts", {
  id: integer().primaryKey(),
  name: text().notNull(),
  code: text().notNull(),
  cantonId: integer()
    .notNull()
    .references(() => cantons.id)
});

export const provincesRelations = relations(provinces, ({ many }) => ({
  cantons: many(cantons)
}));

export const cantonsRelations = relations(cantons, ({ one, many }) => ({
  districts: many(districts),
  province: one(provinces, {
    fields: [cantons.provinceId],
    references: [provinces.id]
  })
}));

export const districtsRelations = relations(districts, ({ one }) => ({
  canton: one(cantons, {
    fields: [districts.cantonId],
    references: [cantons.id]
  })
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  station: one(stations, {
    fields: [vehicles.stationId],
    references: [stations.id]
  }),
  dispatchedVehicles: many(dispatchedVehicles)
}));

export const vehicleDisponibilityRelations = relations(vehicleDisponibility, () => ({}));

export const dispatchedVehiclesRelations = relations(dispatchedVehicles, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [dispatchedVehicles.vehicleId],
    references: [vehicles.id]
  }),
  incident: one(incidents, {
    fields: [dispatchedVehicles.incidentId],
    references: [incidents.id]
  }),
  station: one(stations, {
    fields: [dispatchedVehicles.stationId],
    references: [stations.id]
  })
}));

export const dispatchedStationsRelations = relations(dispatchedStations, ({ one }) => ({
  station: one(stations, {
    fields: [dispatchedStations.stationId],
    references: [stations.id]
  }),
  incident: one(incidents, {
    fields: [dispatchedStations.incidentId],
    references: [incidents.id]
  })
}));

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  station: one(stations, {
    fields: [incidents.responsibleStation],
    references: [stations.id]
  }),
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
  }),
  province: one(provinces, {
    fields: [incidents.provinceId],
    references: [provinces.id]
  }),
  canton: one(cantons, {
    fields: [incidents.cantonId],
    references: [cantons.id]
  }),
  district: one(districts, {
    fields: [incidents.districtId],
    references: [districts.id]
  })
}));

export const stationsInsertSchema = createInsertSchema(stations);
export const vehiclesInsertSchema = createInsertSchema(vehicles);
export const vehicleDisponibilityInsertSchema = createInsertSchema(vehicleDisponibility);
export const dispatchedVehiclesInsertSchema = createInsertSchema(dispatchedVehicles);
export const dispatchedStationsInsertSchema = createInsertSchema(dispatchedStations);
export const incidentTypesInsertSchema = createInsertSchema(incidentTypes);
export const incidentsInsertSchema = createInsertSchema(incidents);
export const provincesInsertSchema = createInsertSchema(provinces);
export const cantonsInsertSchema = createInsertSchema(cantons);
export const districtsInsertSchema = createInsertSchema(districts);
