-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "dispatched_vehicles" (
	"id" integer PRIMARY KEY NOT NULL,
	"vehicleInternalNumber" text,
	"incidentId" integer,
	"stationId" integer,
	"dispatchedTime" text,
	"arrivalTime" text,
	"departureTime" text,
	"baseReturnTime" text
);
--> statement-breakpoint
CREATE TABLE "incident_types" (
	"id" integer,
	"incidentCode" text,
	"name" text
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" integer PRIMARY KEY NOT NULL,
	"incidentType" text,
	"dispatchIncidentType" text,
	"incidentCode" text,
	"dispatchIncidentCode" text,
	"specificIncidentCode" text,
	"specificDispatchIncidentCode" text,
	"EEConsecutive" text,
	"address" text,
	"responsibleStation" integer,
	"date" text,
	"incidentTime" text,
	"importantDetails" text,
	"latitude" integer,
	"longitude" integer,
	"provinceId" integer,
	"cantonId" integer,
	"districtId" integer,
	"isOpen" boolean
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text,
	"stationKey" text,
	"radioChannel" text,
	"latitude" integer,
	"longitude" integer,
	"address" text,
	"phoneNumber" text,
	"fax" text,
	"email" text
);
--> statement-breakpoint
CREATE TABLE "vehicle_disponibility" (
	"id" integer PRIMARY KEY NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" integer PRIMARY KEY NOT NULL,
	"internalNumber" text NOT NULL,
	"plate" text,
	"stationId" integer,
	"descriptionType" text,
	"class" text,
	"descriptionOperationalStatus" text
);

*/