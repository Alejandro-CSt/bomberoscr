import { Analytics } from "@/features/layout/components/analytics";
import TRPCProvider from "@/lib/trpc/provider";
import env from "@/server/env";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geist = Geist({ subsets: ["latin"], weight: "variable" });

const title = "Emergencias Costa Rica: Mapa y estadísticas de incidentes atendidos por Bomberos";
const description =
  "Mapa interactivo no oficial con incendios, emergencias activas, ubicación de estaciones y detalles de incidentes en tiempo real atendidos por Bomberos de Costa Rica.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: title,
    description: description,
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
      url: env.SITE_URL,
      type: "website",
      siteName: title,
      images: [`${env.SITE_URL}/og.png`]
    },
    twitter: {
      card: "summary_large_image",
      title: "Mapa y estadísticas de incidentes atendidos por Bomberos de Costa Rica",
      description: description,
      images: [`${env.SITE_URL}/og.png`]
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
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <Analytics />
      </head>
      <body className="antialiased" style={geist.style}>
        <NuqsAdapter>
          <TRPCProvider>{children}</TRPCProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
