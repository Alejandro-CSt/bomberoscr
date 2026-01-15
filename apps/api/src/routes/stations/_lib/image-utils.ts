import { createHmac } from "node:crypto";

import env from "@/env";
import { getFromS3 } from "@/lib/s3";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"] as const;

type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];

const CONTENT_TYPE_MAP: Record<ImageExtension, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png"
};

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
  const encodedSource = encodeImgproxySource(sourceUrl);
  const path = `/rs:fit:800:600/${encodedSource}`;
  const signature = signImgproxyPath(path);
  return `${normalizeBaseUrl(env.IMGPROXY_BASE_URL)}/${signature}${path}`;
}

function buildOriginalSourceUrl(stationKey: string): string {
  const baseUrl = normalizeBaseUrl(env.SITE_URL);
  return `${baseUrl}/bomberos/hono/stations/${stationKey}/image/original?token=${env.IMGPROXY_TOKEN}`;
}

async function getStationImage(
  stationKey: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  for (const ext of IMAGE_EXTENSIONS) {
    const s3Key = `stations/${stationKey}.${ext}`;
    const image = await getFromS3(s3Key);
    if (image) {
      return { buffer: image, contentType: CONTENT_TYPE_MAP[ext] };
    }
  }
  return null;
}

export { buildImgproxyUrl, buildOriginalSourceUrl, getStationImage };
