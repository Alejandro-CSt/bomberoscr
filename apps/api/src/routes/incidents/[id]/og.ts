import { db } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { generateOgImage } from "@/routes/incidents/_lib/og-image";
import { getIncidentStatistics } from "@/routes/incidents/_lib/statistics";
import { IncidentIdParamSchema } from "@/routes/incidents/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/{id}/og",
  request: {
    params: IncidentIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: {
      description: "OG Image for the incident",
      content: {
        "image/png": {
          schema: {
            type: "string",
            format: "binary"
          }
        }
      }
    },
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
    with: {
      canton: true,
      district: true,
      province: true,
      dispatchedStations: {
        columns: {
          id: true,
          attentionOnFoot: true,
          serviceTypeId: true
        },
        with: {
          station: {
            columns: {
              id: true,
              name: true,
              stationKey: true,
              address: true,
              latitude: true,
              longitude: true
            }
          }
        }
      },
      dispatchedVehicles: {
        columns: {
          incidentId: false,
          stationId: false,
          vehicleId: false
        },
        with: {
          vehicle: {
            columns: {
              id: true,
              internalNumber: true,
              class: true
            }
          },
          station: {
            columns: {
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

  const statistics = await getIncidentStatistics(incident);
  return generateOgImage(incident, statistics);
};
