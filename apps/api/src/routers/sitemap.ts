import { getSitemapIncidents, getSitemapStations } from "@bomberoscr/db/queries/sitemap";
import { OpenAPIHono } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import env from "@/env";
import { buildIncidentSlugFromPartial } from "@/lib/slug";

const app = new OpenAPIHono();

const ONE_HOUR_SECONDS = 60 * 60;
const SIX_HOURS_SECONDS = 6 * 60 * 60;

const internalSitemapToken = env.SITEMAP_TOKEN ?? env.ADMIN_TOKEN ?? env.IMGPROXY_TOKEN;
const siteUrl = env.API_URL.replace(/\/?api\/?$/, "").replace(/\/$/, "");
const siteRootUrl = `${siteUrl}/`;

type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
};

type SitemapIndexEntry = {
  loc: string;
  lastmod?: string;
};

function getXmlHeaders(ttlSeconds: number): Record<string, string> {
  return {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": `public, max-age=0, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds}`
  };
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatLastmod(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return date.toISOString();
}

function buildUrlSetXml(entries: UrlEntry[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const entry of entries) {
    xml += "  <url>\n";
    xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    if (entry.lastmod) {
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    if (entry.changefreq) {
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    }
    if (entry.priority) {
      xml += `    <priority>${entry.priority}</priority>\n`;
    }
    xml += "  </url>\n";
  }

  xml += "</urlset>";
  return xml;
}

function buildSitemapIndexXml(entries: SitemapIndexEntry[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const entry of entries) {
    xml += "  <sitemap>\n";
    xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    if (entry.lastmod) {
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    xml += "  </sitemap>\n";
  }

  xml += "</sitemapindex>";
  return xml;
}

function isAuthorized(token: string | undefined): boolean {
  if (!internalSitemapToken || !token) return false;
  return token === internalSitemapToken;
}

function buildIndexXml(): string {
  const now = new Date().toISOString();

  return buildSitemapIndexXml([
    {
      loc: `${siteUrl}/sitemap-stations.xml`,
      lastmod: now
    },
    {
      loc: `${siteUrl}/sitemap-incidents.xml`,
      lastmod: now
    }
  ]);
}

async function buildStationsXml(): Promise<string> {
  const stations = await getSitemapStations();

  const entries: UrlEntry[] = [
    { loc: siteRootUrl, changefreq: "daily", priority: "1.0" },
    { loc: `${siteUrl}/incidentes`, changefreq: "hourly" },
    { loc: `${siteUrl}/estaciones`, changefreq: "daily" },
    ...stations.map((station) => ({
      loc: `${siteUrl}/estaciones/${encodeURIComponent(station.name)}`,
      changefreq: "daily" as const
    }))
  ];

  return buildUrlSetXml(entries);
}

async function buildIncidentsXml(): Promise<string> {
  const incidents = await getSitemapIncidents();

  const entries: UrlEntry[] = incidents.map((incident) => ({
    loc: `${siteUrl}/incidentes/${buildIncidentSlugFromPartial({
      id: incident.id,
      incidentTimestamp: incident.incidentTimestamp,
      importantDetails: incident.importantDetails,
      specificIncidentType: incident.specificIncidentType,
      incidentType: incident.incidentType
    })}`,
    lastmod: formatLastmod(incident.modifiedAt)
  }));

  return buildUrlSetXml(entries);
}

app.get("/internal/index.xml", async (c) => {
  const token = c.req.query("token");

  if (!isAuthorized(token)) {
    return c.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED);
  }

  const xml = buildIndexXml();
  return c.body(xml, HttpStatusCodes.OK, getXmlHeaders(ONE_HOUR_SECONDS));
});

app.get("/internal/stations.xml", async (c) => {
  const token = c.req.query("token");

  if (!isAuthorized(token)) {
    return c.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED);
  }

  const xml = await buildStationsXml();
  return c.body(xml, HttpStatusCodes.OK, getXmlHeaders(SIX_HOURS_SECONDS));
});

app.get("/internal/incidents.xml", async (c) => {
  const token = c.req.query("token");

  if (!isAuthorized(token)) {
    return c.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED);
  }

  const xml = await buildIncidentsXml();
  return c.body(xml, HttpStatusCodes.OK, getXmlHeaders(ONE_HOUR_SECONDS));
});

export const sitemapRouter = app;
