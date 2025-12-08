import env from "@/features/lib/env";
import { getFromR2, uploadToR2 } from "@/features/lib/r2";
import { db, eq } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import { type NextRequest, NextResponse, after } from "next/server";

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

function getR2Key(incidentId: number): string {
  return `incidents/${incidentId}/map.png`;
}

/**
 * Returns a static map image for an incident location.
 * Images are cached in R2; on cache miss, fetches from Mapbox and stores in R2 asynchronously.
 * @param params.id - The incident ID
 * @returns PNG image response with 1-year cache headers
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incidentId = Number.parseInt(id, 10);

  if (Number.isNaN(incidentId)) {
    return NextResponse.json({ error: "Invalid incident ID" }, { status: 400 });
  }

  const incident = await db.query.incidents.findFirst({
    where: eq(incidents.id, incidentId),
    columns: {
      id: true,
      latitude: true,
      longitude: true
    }
  });

  if (!incident) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  const latitude = Number(incident.latitude);
  const longitude = Number(incident.longitude);

  if (!latitude || !longitude || latitude === 0 || longitude === 0) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const r2Key = getR2Key(incidentId);

  const cachedImage = await getFromR2(r2Key);
  if (cachedImage) {
    return new NextResponse(new Uint8Array(cachedImage), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  }

  const mapboxUrl = buildMapboxUrl(latitude, longitude);
  const mapboxResponse = await fetch(mapboxUrl, {
    headers: {
      Referer: env.SITE_URL
    }
  });

  if (!mapboxResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch map image" },
      { status: mapboxResponse.status }
    );
  }

  const imageBuffer = await mapboxResponse.arrayBuffer();

  after(async () => {
    try {
      await uploadToR2(r2Key, imageBuffer, "image/png");
    } catch (error) {
      console.error("Failed to upload map image to R2:", error);
    }
  });

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
