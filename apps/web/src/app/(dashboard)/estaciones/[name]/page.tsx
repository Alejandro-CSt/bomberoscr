import env from "@/features/lib/env";
import db, { eq } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { cacheLife } from "next/cache";
import type { Metadata } from "next";

async function findStationByName(rawName: string) {
  const decodedName = decodeURIComponent(rawName).trim();
  return {
    decodedName,
    station: await db.query.stations.findFirst({
      where: eq(stations.name, decodedName.toUpperCase())
    })
  };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const { decodedName, station } = await findStationByName(name);

  if (!station) {
    return {
      title: "Estación no encontrada",
      description: `No localizamos información para la estación "${decodedName}".`,
      alternates: {
        canonical: env.SITE_URL
          ? new URL(`/estaciones/${encodeURIComponent(decodedName)}`, env.SITE_URL).toString()
          : undefined
      },
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const canonicalUrl = env.SITE_URL
    ? new URL(`/estaciones/${encodeURIComponent(decodedName)}`, env.SITE_URL).toString()
    : undefined;

  const description = station.address
    ? `Detalles de la estación ${decodedName} del Benemérito Cuerpo de Bomberos: ${station.address}.`
    : `Detalles de la estación ${decodedName} del Benemérito Cuerpo de Bomberos.`;

  return {
    title: `Estación ${decodedName}`,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: `Estación ${decodedName}`,
      description,
      url: canonicalUrl,
      type: "profile"
    },
    twitter: {
      card: "summary",
      title: `Estación ${decodedName}`,
      description
    }
  };
}

export default async function StationContent({
  params
}: {
  params: Promise<{ name: string }>;
}) {
  "use cache";
  cacheLife({ revalidate: 60 * 10, expire: 60 * 10 });
  const { name } = await params;
  const { station } = await findStationByName(name);
  return (
    <div className="mx-auto max-w-5xl">
      {Date.now()}Estación {station?.address}
    </div>
  );
}
