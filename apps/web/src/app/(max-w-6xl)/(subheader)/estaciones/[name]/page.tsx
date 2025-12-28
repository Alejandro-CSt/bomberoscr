import env from "@/features/lib/env";
import {
  StationHeatmapSection,
  StationHeatmapSkeleton
} from "@/features/stations/components/station-heatmap-section";
import {
  StationHighlightedIncidents,
  StationHighlightedIncidentsSkeleton
} from "@/features/stations/components/station-highlighted-incidents";
import {
  StationProfileHeader,
  StationProfileHeaderSkeleton
} from "@/features/stations/components/station-profile-header";
import {
  StationRecentIncidents,
  StationRecentIncidentsSkeleton
} from "@/features/stations/components/station-recent-incidents";
import db, { eq } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import type { Metadata } from "next";
import { Suspense } from "react";

export type StationPageParams = Promise<{ name: string }>;

export async function findStationByName(rawName: string) {
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
    ? `Detalles de la estación ${decodedName}: ${station.address}.`
    : `Detalles de la estación ${decodedName}.`;

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

export default function StationPage(props: PageProps<"/estaciones/[name]">) {
  const { params } = props;

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
      <div className="sticky top-4 self-start">
        <Suspense fallback={<StationProfileHeaderSkeleton />}>
          <StationProfileHeader params={params} />
        </Suspense>
      </div>

      <aside className="flex flex-col gap-6 lg:col-span-2">
        <Suspense fallback={<StationHighlightedIncidentsSkeleton />}>
          <StationHighlightedIncidents params={params} />
        </Suspense>
        <Suspense fallback={<StationHeatmapSkeleton />}>
          <StationHeatmapSection params={params} />
        </Suspense>
        <Suspense fallback={<StationRecentIncidentsSkeleton />}>
          <StationRecentIncidents params={params} />
        </Suspense>
      </aside>
    </div>
  );
}
