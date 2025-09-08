import { FloatingNavigation } from "@/features/map/layout/components/floating-navigation";
import { FloatingPanel } from "@/features/map/layout/components/floating-panel";
import { InteractiveMap } from "@/features/map/layout/components/map";
import { MapSettingsProvider } from "@/features/map/settings/context/map-settings-provider";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Metadata } from "next";
import { Suspense } from "react";

const title = "Mapa de incidentes atendidos por Bomberos de Costa Rica en tiempo real";
const description =
  "Mapa interactivo no oficial con estadísticas de incendios, emergencias activas, ubicación de estaciones y detalles de incidentes en tiempo real atendidos por Bomberos de Costa Rica.";
const siteUrl = "https://bomberos.anifz.com";

export const metadata: Metadata = {
  title: title,
  description: description,
  metadataBase: new URL(siteUrl),
  keywords: [
    "Bomberos de Costa Rica",
    "Bomberos",
    "incendios",
    "atención de emergencias",
    "Costa Rica",
    "estadísticas",
    "datos",
    "análisis",
    "mapa",
    "tiempo real",
    "incidentes",
    "emergencias",
    "Costa Rica",
    "BCBCR",
    "mapa interactivo",
    "no oficial"
  ],
  openGraph: {
    title: "Mapa y estadísticas de incidentes atendidos por Bomberos de Costa Rica",
    description: description,
    url: siteUrl,
    type: "website",
    siteName: title,
    images: [`${siteUrl}/og.png`]
  },
  twitter: {
    card: "summary_large_image",
    title: "Mapa y estadísticas de incidentes atendidos por Bomberos de Costa Rica",
    description: description,
    images: [`${siteUrl}/og.png`]
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
      <div className="flex min-h-full">
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
