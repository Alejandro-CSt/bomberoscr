import { getFromS3 } from "@/features/lib/s3";
import db, { ilike } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { glass } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { type NextRequest, NextResponse } from "next/server";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"] as const;
type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];

const CONTENT_TYPE_MAP: Record<ImageExtension, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png"
};

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  const station = await db.query.stations.findFirst({
    where: ilike(stations.name, name),
    columns: {
      stationKey: true,
      name: true
    }
  });

  if (!station) {
    return new NextResponse("Estacion no encontrada", { status: 404 });
  }

  const image = await getStationImage(station.stationKey);

  if (!image) {
    const avatar = createAvatar(glass, {
      seed: station.name,
      size: 800
    });

    return new NextResponse(avatar.toString(), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  }

  return new NextResponse(new Uint8Array(image.buffer), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
