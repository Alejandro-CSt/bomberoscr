import env from "@/features/lib/env";
import type { Metadata } from "next";

const stationsDescription =
  "Directorio de estaciones de bomberos con información de cobertura y ubicación.";

export const metadata: Metadata = {
  title: "Estaciones de bomberos",
  description: stationsDescription,
  alternates: {
    canonical: env.SITE_URL ? new URL("/estaciones", env.SITE_URL).toString() : undefined
  },
  openGraph: {
    title: "Estaciones de bomberos",
    description: stationsDescription,
    url: env.SITE_URL ? new URL("/estaciones", env.SITE_URL).toString() : undefined,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Estaciones de bomberos",
    description: stationsDescription
  }
};

export default function EstacionesPage() {
  return <div>Estaciones</div>;
}
