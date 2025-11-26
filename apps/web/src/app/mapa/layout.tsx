import env from "@/features/lib/env";
import { FloatingNavigation } from "@/features/map/layout/components/floating-navigation";
import { FloatingPanel } from "@/features/map/layout/components/floating-panel";
import { InteractiveMap } from "@/features/map/layout/components/map";
import { MapSettingsProvider } from "@/features/map/settings/context/map-settings-provider";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Metadata } from "next";
import { Suspense } from "react";

const siteUrl = env.SITE_URL ? env.SITE_URL.replace(/\/+$/, "") : undefined;

const title = "Mapa de Emergencias — Emergencias CR (en tiempo real)";
const description =
  "Visualiza el mapa interactivo y panel con incidentes activos, historial, estaciones y tiempos de respuesta de Bomberos de Costa Rica en tiempo real.";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title,
  description,
  alternates: {
    canonical: siteUrl ? `${siteUrl}/mapa` : undefined
  },
  keywords: [
    "mapa de emergencias",
    "mapa bomberos Costa Rica",
    "incidentes activos",
    "estadísticas en tiempo real",
    "estadísticas de bomberos",
    "estaciones de bomberos",
    "emergencias CR"
  ],
  openGraph: {
    title,
    description,
    url: siteUrl ? `${siteUrl}/mapa` : undefined,
    type: "website",
    siteName: "Emergencias CR",
    images: siteUrl ? [new URL("og.png", siteUrl).toString()] : undefined
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: siteUrl ? [new URL("og.png", siteUrl).toString()] : undefined
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1
    }
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MapSettingsProvider>
      <div className="no-subheader flex min-h-full">
        <InteractiveMap />
        <Suspense fallback={null}>
          <FloatingNavigation />
        </Suspense>
        <Suspense fallback={null}>
          <FloatingPanel>{children}</FloatingPanel>
        </Suspense>
      </div>
    </MapSettingsProvider>
  );
}
