import TRPCProvider from "@/lib/trpc/provider";
import { ThemeProvider } from "@/map/layout/context/theme-provider";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Head from "next/head";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";

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

const geist = Geist({ subsets: ["latin"], weight: "variable" });

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased" style={geist.style}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <Head>
            <Script
              defer
              src="https://u.anifz.com/script.js"
              data-website-id="3d28fb97-aefd-4f31-90dd-a609e21d0b22"
              strategy="lazyOnload"
            />
          </Head>
          <NuqsAdapter>
            <TRPCProvider>{children}</TRPCProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
