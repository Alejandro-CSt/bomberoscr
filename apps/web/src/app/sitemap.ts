import env from "@/features/lib/env";
import { buildIncidentUrl } from "@/features/shared/lib/utils";
import db, { eq } from "@bomberoscr/db/index";
import { stations as stationsSchema } from "@bomberoscr/db/schema";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = env.SITE_URL;
  const stations = await db.query.stations.findMany({
    columns: {
      name: true
    },
    where: eq(stationsSchema.isOperative, true)
  });
  const incidents = await db.query.incidents.findMany({
    columns: {
      id: true,
      incidentTimestamp: true,
      importantDetails: true,
      modifiedAt: true,
      isOpen: true
    },
    limit: 49900
  });

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      priority: 1
    },
    {
      url: `${siteUrl}/incidentes`,
      lastModified: new Date(),
      changeFrequency: "always"
    },
    {
      url: `${siteUrl}/mapa/busqueda`,
      lastModified: new Date(),
      changeFrequency: "hourly"
    },
    ...stations.map((station) => ({
      url: `${siteUrl}/estaciones/${station.name}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const
    })),
    ...incidents.map((incident) => ({
      url: `${siteUrl}${buildIncidentUrl(
        incident.id,
        incident.importantDetails ?? "Incidente",
        incident.incidentTimestamp
      )}`,
      lastModified: incident.modifiedAt,
      changeFrequency: incident.isOpen ? "hourly" : "monthly"
    })),
    {
      url: `${siteUrl}/estaciones`,
      lastModified: new Date(),
      changeFrequency: "daily"
    }
  ];
}
