import type { AppRouteHandler } from "@/lib/types";
import env from "@/env";
import type {
  ListIncidentsRoute,
  SyncIncidentRoute,
  SyncIncidentsRoute
} from "@/routes/admin/admin.routes";
import { getExistingIncidentIds } from "@bomberoscr/db/queries/incidents";
import {
  getIncidentDetails,
  getIncidentListApp,
  getIncidentReport,
  getStationsAttendingIncident,
  getVehiclesDispatchedToIncident
} from "@bomberoscr/sync-domain/api";
import { createFetcher } from "@bomberoscr/sync-domain/fetcher";
import { upsertIncident } from "@bomberoscr/sync-domain/persist/upsertIncident";
import type {
  ObtenerEstacionesAtiendeIncidente,
  ObtenerUnidadesDespachadasIncidente
} from "@bomberoscr/sync-domain/types";
import * as HttpStatusCodes from "stoker/http-status-codes";

type SigAEFetcher = ReturnType<typeof createFetcher>;

const SIGAE_ENV_KEYS = [
  "SIGAE_API_URL",
  "SIGAE_IP",
  "SIGAE_PASSWORD",
  "SIGAE_USER",
  "SIGAE_COD_SYS"
] as const;

let cachedFetcher: SigAEFetcher | null = null;

function getSigAEFetcher():
  | { ok: true; fetcher: SigAEFetcher }
  | { ok: false; missing: (typeof SIGAE_ENV_KEYS)[number][] } {
  const baseUrl = env.SIGAE_API_URL;
  const ip = env.SIGAE_IP;
  const password = env.SIGAE_PASSWORD;
  const user = env.SIGAE_USER;
  const codSys = env.SIGAE_COD_SYS;

  if (!baseUrl || !ip || !password || !user || !codSys) {
    const missing = SIGAE_ENV_KEYS.filter((key) => !env[key]);
    return { ok: false, missing };
  }

  if (!cachedFetcher) {
    cachedFetcher = createFetcher({
      baseUrl,
      credentials: {
        IP: ip,
        Password: password,
        Usuario: user,
        codSistema: codSys
      }
    });
  }

  return { ok: true, fetcher: cachedFetcher };
}

function formatMissingEnvMessage(missing: readonly string[]) {
  const label = missing.length > 1 ? "environment variables" : "environment variable";
  return `Admin synchronization is disabled. Missing ${label}: ${missing.join(", ")}`;
}

function formatIsoDateForSIGAE(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

async function syncSingleIncident(fetcher: SigAEFetcher, incidentId: number) {
  const results = await Promise.all([
    getIncidentDetails({ fetcher, id: incidentId }),
    getIncidentReport({ fetcher, id: incidentId }),
    getStationsAttendingIncident({ fetcher, id: incidentId }),
    getVehiclesDispatchedToIncident({ fetcher, id: incidentId })
  ]);

  const [incidentDetailsResult, incidentReportResult, stationsResult, vehiclesResult] = results;

  if (incidentDetailsResult.isErr()) {
    return { incidentId, success: false, error: "Failed to fetch incident details" };
  }
  if (incidentReportResult.isErr()) {
    return { incidentId, success: false, error: "Failed to fetch incident report" };
  }
  if (stationsResult.isErr()) {
    return { incidentId, success: false, error: "Failed to fetch stations" };
  }
  if (vehiclesResult.isErr()) {
    return { incidentId, success: false, error: "Failed to fetch vehicles" };
  }

  try {
    await upsertIncident({
      incidentId,
      incidentDetails: incidentDetailsResult.value,
      incidentReport: incidentReportResult.value,
      stationsAttending: (stationsResult.value as unknown as ObtenerEstacionesAtiendeIncidente)
        .Items,
      vehiclesDispatched: (vehiclesResult.value as unknown as ObtenerUnidadesDespachadasIncidente)
        .Items
    });
    return { incidentId, success: true };
  } catch (error) {
    return {
      incidentId,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export const listIncidents: AppRouteHandler<ListIncidentsRoute> = async (c) => {
  const { from, to } = c.req.valid("query");
  const fetcherResult = getSigAEFetcher();

  if (!fetcherResult.ok) {
    return c.json(
      { message: formatMissingEnvMessage(fetcherResult.missing) },
      HttpStatusCodes.SERVICE_UNAVAILABLE
    );
  }

  const { fetcher } = fetcherResult;
  const fromFormatted = formatIsoDateForSIGAE(from);
  const toFormatted = formatIsoDateForSIGAE(to);

  const incidentListResult = await getIncidentListApp({
    fetcher,
    from: fromFormatted,
    to: toFormatted
  });

  if (incidentListResult.isErr()) {
    return c.json(
      { message: "Failed to fetch incident list from SIGAE" },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const items = incidentListResult.value.items;
  const ids = items.map((i) => i.idBoletaIncidente);
  const existingIds = await getExistingIncidentIds(ids);
  const existingSet = new Set(existingIds);

  return c.json(
    {
      incidents: items.map((incident) => ({
        id: incident.idBoletaIncidente,
        consecutivo: incident.consecutivoEE,
        fecha: incident.fecha,
        hora: incident.horaIncidente,
        direccion: incident.direccion,
        tipoIncidente: incident.tipoIncidente,
        estacionResponsable: incident.estacionResponsable,
        synced: existingSet.has(incident.idBoletaIncidente)
      }))
    },
    HttpStatusCodes.OK
  );
};

export const syncIncidents: AppRouteHandler<SyncIncidentsRoute> = async (c) => {
  const { incidentIds } = c.req.valid("json");

  if (incidentIds.length === 0) {
    return c.json(
      {
        success: true,
        totalIncidents: 0,
        syncedIncidents: 0,
        failedIncidents: 0,
        failedResults: []
      },
      HttpStatusCodes.OK
    );
  }

  const fetcherResult = getSigAEFetcher();
  if (!fetcherResult.ok) {
    return c.json(
      { message: formatMissingEnvMessage(fetcherResult.missing) },
      HttpStatusCodes.SERVICE_UNAVAILABLE
    );
  }

  const { fetcher } = fetcherResult;
  const BATCH_SIZE = 5;
  const results: { incidentId: number; success: boolean; error?: string }[] = [];

  for (let i = 0; i < incidentIds.length; i += BATCH_SIZE) {
    const batch = incidentIds.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map((id) => syncSingleIncident(fetcher, id)));
    results.push(...batchResults);
  }

  const syncedCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;
  const hasFailures = failedCount > 0;

  return c.json(
    {
      success: !hasFailures,
      totalIncidents: incidentIds.length,
      syncedIncidents: syncedCount,
      failedIncidents: failedCount,
      failedResults: results.filter((r) => !r.success)
    },
    HttpStatusCodes.OK
  );
};

export const syncIncident: AppRouteHandler<SyncIncidentRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const fetcherResult = getSigAEFetcher();

  if (!fetcherResult.ok) {
    return c.json(
      { message: formatMissingEnvMessage(fetcherResult.missing) },
      HttpStatusCodes.SERVICE_UNAVAILABLE
    );
  }

  const result = await syncSingleIncident(fetcherResult.fetcher, id);
  return c.json(result, HttpStatusCodes.OK);
};
