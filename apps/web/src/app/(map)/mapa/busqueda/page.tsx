import env from "@/features/lib/env";
import SearchMapPageClient from "./search-map-client";
import type { Metadata } from "next";

const description =
  "Busca incidentes atendidos por los Bomberos de Costa Rica filtrando por tipo, estación y rango de tiempo sobre un mapa interactivo.";
const canonicalUrl = env.SITE_URL
  ? new URL("/mapa/busqueda", env.SITE_URL).toString()
  : undefined;

export const metadata: Metadata = {
  title: "Búsqueda geoespacial de incidentes",
  description,
  alternates: {
    canonical: canonicalUrl
  },
  openGraph: {
    title: "Búsqueda geoespacial de incidentes",
    description,
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Búsqueda geoespacial de incidentes",
    description
  }
};

export default function SearchMapPage() {
  return <SearchMapPageClient />;
}
