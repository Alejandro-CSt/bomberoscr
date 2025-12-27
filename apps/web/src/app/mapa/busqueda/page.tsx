import env from "@/features/lib/env";
import type { Metadata } from "next";

const description =
  "Busca incidentes atendidos por Bomberos de Costa Rica filtrando por tipo, estación y rango de tiempo sobre un mapa interactivo.";
const canonicalUrl = env.SITE_URL ? new URL("/mapa/busqueda", env.SITE_URL).toString() : undefined;

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
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="font-semibold text-3xl">Búsqueda geoespacial no disponible</h1>
      <p className="text-base text-muted-foreground">
        Estamos trabajando en mejoras para esta herramienta. Vuelve más adelante para acceder a la
        búsqueda de incidentes en el mapa.
      </p>
    </section>
  );
}
