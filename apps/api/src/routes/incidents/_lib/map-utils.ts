import { createHmac } from "node:crypto";

import env from "@/env";

const MAPBOX_CONFIG = {
  zoom: 15.73,
  bearing: 0,
  pitch: 39,
  width: 640,
  height: 360
};

function buildMapboxUrl(latitude: number, longitude: number): string {
  const { zoom, bearing, pitch, width, height } = MAPBOX_CONFIG;
  const marker = `pin-s+ff3b30(${longitude},${latitude})`;
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${marker}/${longitude},${latitude},${zoom},${bearing},${pitch}/${width}x${height}@2x?access_token=${env.MAPBOX_API_KEY}`;
}

function getS3Key(incidentId: number): string {
  return `incidents/${incidentId}/map.png`;
}

function buildOriginalSourceUrl(incidentId: number): string {
  const baseUrl = normalizeBaseUrl(env.SITE_URL);
  return `${baseUrl}/bomberos/hono/incidents/${incidentId}/map/original?token=${env.IMGPROXY_TOKEN}`;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function encodeImgproxySource(url: string): string {
  return Buffer.from(url)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signImgproxyPath(path: string): string {
  const key = Buffer.from(env.IMGPROXY_KEY, "hex");
  const salt = Buffer.from(env.IMGPROXY_SALT, "hex");
  const signature = createHmac("sha256", key).update(salt).update(path).digest("base64");
  return signature.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function buildImgproxyUrl(sourceUrl: string): string {
  const width = MAPBOX_CONFIG.width * 2;
  const height = MAPBOX_CONFIG.height * 2;
  const processingOptions = `rs:fit:${width}:${height}`;
  const encodedSource = encodeImgproxySource(sourceUrl);
  const path = `/${processingOptions}/${encodedSource}`;
  const signature = signImgproxyPath(path);
  return `${normalizeBaseUrl(env.IMGPROXY_BASE_URL)}/${signature}${path}`;
}

export { buildImgproxyUrl, buildMapboxUrl, buildOriginalSourceUrl, getS3Key };
