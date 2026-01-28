import { createHmac } from "node:crypto";

import env from "@/env";
import { existsInS3 } from "@/lib/s3";
import { getApiBaseUrl } from "@/lib/url-builder";

/**
 * Get the S3 key for an incident type image.
 */
function getS3Key(code: string): string {
  return `types/${code}.png`;
}

/**
 * Get parent codes for fallback logic.
 * For example: "6.1.1.2.1" -> ["6.1.1.2", "6.1.1", "6.1", "6"]
 */
function getParentCodes(code: string): string[] {
  const parts = code.split(".");
  const parents: string[] = [];

  for (let i = parts.length - 1; i > 0; i--) {
    parents.push(parts.slice(0, i).join("."));
  }

  return parents;
}

/**
 * Find the first available image for an incident type code.
 * Checks the exact code first, then parent codes in order.
 * Returns the code that has an image, or null if none found.
 */
async function findAvailableImageCode(code: string): Promise<string | null> {
  // Check exact code first
  const exactKey = getS3Key(code);
  if (await existsInS3(exactKey)) {
    return code;
  }

  // Check parent codes
  const parentCodes = getParentCodes(code);
  for (const parentCode of parentCodes) {
    const parentKey = getS3Key(parentCode);
    if (await existsInS3(parentKey)) {
      return parentCode;
    }
  }

  return null;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

/**
 * Build the URL for the original image endpoint (used by imgproxy).
 */
function buildOriginalSourceUrl(code: string): string {
  return `${getApiBaseUrl()}/types/${code}/image/original?token=${env.IMGPROXY_TOKEN}`;
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

/**
 * Build the imgproxy URL for an incident type image.
 * Resizes to 256x256 for consistent icon size.
 */
function buildImgproxyUrl(sourceUrl: string): string {
  const size = 256;
  const processingOptions = `rs:fit:${size}:${size}`;
  const encodedSource = encodeImgproxySource(sourceUrl);
  const path = `/${processingOptions}/${encodedSource}`;
  const signature = signImgproxyPath(path);
  return `${normalizeBaseUrl(env.IMGPROXY_BASE_URL)}/${signature}${path}`;
}

export {
  buildImgproxyUrl,
  buildOriginalSourceUrl,
  findAvailableImageCode,
  getParentCodes,
  getS3Key
};
