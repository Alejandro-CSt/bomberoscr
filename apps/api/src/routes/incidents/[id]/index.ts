import { db } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import {
  formatIncidentTypes,
  getIncidentTitle,
  toIsoStringOrNull
} from "@/routes/incidents/_lib/formatters";
import { buildDispatchedStationsSummary } from "@/routes/incidents/_lib/stations";
import { getIncidentStatistics } from "@/routes/incidents/_lib/statistics";
import { IncidentDetailResponseSchema, IncidentIdParamSchema } from "@/routes/incidents/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/{id}",
  request: {
    params: IncidentIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      IncidentDetailResponseSchema,
      "Detailed incident information"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Incident not found"),
      "Incident not found"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { id } = c.req.valid("param");

  const incident = await db.query.incidents.findFirst({
    where: eq(incidents.id, id),
    columns: {
      id: true,
      incidentCode: true,
      specificIncidentCode: true,
      incidentTimestamp: true,
      address: true,
      responsibleStation: true,
      importantDetails: true,
      isOpen: true,
      modifiedAt: true,
      cantonId: true,
      districtId: true,
      latitude: true,
      longitude: true
    },
    with: {
      canton: {
        columns: {
          name: true
        }
      },
      district: {
        columns: {
          name: true
        }
      },
      province: {
        columns: {
          name: true
        }
      },
      dispatchedStations: {
        columns: {
          serviceTypeId: true
        },
        with: {
          station: {
            columns: {
              id: true,
              name: true,
              stationKey: true
            }
          }
        }
      },
      dispatchedVehicles: {
        columns: {
          id: true,
          stationId: true,
          dispatchedTime: true,
          arrivalTime: true,
          departureTime: true,
          baseReturnTime: true
        },
        with: {
          vehicle: {
            columns: {
              internalNumber: true
            }
          },
          station: {
            columns: {
              id: true,
              name: true
            }
          }
        }
      },
      dispatchIncidentType: {
        columns: {
          name: true
        }
      },
      specificDispatchIncidentType: {
        columns: {
          name: true
        }
      },
      incidentType: {
        columns: {
          name: true
        }
      },
      specificIncidentType: {
        columns: {
          name: true
        }
      }
    }
  });

  if (!incident) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const dispatchType = formatIncidentTypes(
    [incident.dispatchIncidentType?.name, incident.specificDispatchIncidentType?.name],
    "incidente"
  );

  const actualType = formatIncidentTypes([
    incident.incidentType?.name,
    incident.specificIncidentType?.name
  ]);

  const dispatchedStations = buildDispatchedStationsSummary(incident);
  const statistics = await getIncidentStatistics(incident);

  return c.json(
    {
      incident: {
        id: incident.id,
        title: getIncidentTitle(incident),
        incidentTimestamp: incident.incidentTimestamp.toISOString(),
        dispatchType,
        actualType: actualType || null,
        address: incident.address,
        isOpen: incident.isOpen,
        modifiedAt: toIsoStringOrNull(incident.modifiedAt),
        cantonName: incident.canton?.name ?? null,
        latitude: incident.latitude?.toString() ?? null,
        longitude: incident.longitude?.toString() ?? null,
        hasMapImage:
          incident.latitude !== null &&
          incident.longitude !== null &&
          Number(incident.latitude) !== 0 &&
          Number(incident.longitude) !== 0,
        dispatchedStations: dispatchedStations.map((station) => ({
          name: station.name,
          stationKey: station.key ?? "",
          isResponsible: station.isResponsible,
          vehicles: station.vehicles
        }))
      },
      statistics: {
        currentYear: statistics.year,
        currentYearCount: statistics.typeRankInYear,
        currentYearCantonCount: statistics.typeRankInCanton,
        previousYear: statistics.year - 1,
        previousYearCount: statistics.typeCountPreviousYear
      }
    },
    HttpStatusCodes.OK
  );
};
