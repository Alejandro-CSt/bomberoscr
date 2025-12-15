import { Header } from "@/features/layout/components/header";
import { HeaderBackdrop } from "@/features/layout/components/header-backdrop";
import env from "@/features/lib/env";
import { cn } from "@/features/shared/lib/utils";
import "@/features/styles/globals.css";
import TRPCProvider from "@/features/trpc/provider";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const siteUrl = env.SITE_URL;

const brandName = "Emergencias CR";
const defaultTitle = "Emergencias CR";
const defaultFullTitle = `${defaultTitle} — Incidentes en tiempo real`;
const description =
  "Dashboard interactivo con estadísticas, análisis de datos y mapa de incidentes atendidos por Bomberos de Costa Rica en tiempo real. Consulta tendencias, estaciones y tiempos de respuesta.";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: defaultFullTitle,
    template: `%s — ${brandName}`
  },
  description,
  applicationName: defaultFullTitle,
  alternates: {
    canonical: siteUrl
  },
  keywords: [
    "dashboard de emergencias",
    "Bomberos de Costa Rica",
    "incidentes en tiempo real",
    "respuesta de emergencias",
    "estadísticas de incidentes",
    "mapa de incidentes",
    "análisis operativo",
    "estaciones de bomberos",
    "tiempo de respuesta",
    "emergencias CR"
  ],
  openGraph: {
    title: defaultFullTitle,
    description,
    url: siteUrl,
    type: "website",
    siteName: "Emergencias CR",
    images: siteUrl ? [new URL("og.png", siteUrl).toString()] : undefined
  },
  twitter: {
    card: "summary_large_image",
    title: defaultFullTitle,
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
  },
  icons: {
    icon: "/bomberos/favicon.svg"
  }
};

const geist = Geist({
  subsets: ["latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans"
});

const geistMono = Geist_Mono({
  subsets: ["latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono"
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif"
});

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CR" className="dark">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
            data-enabled="true"
          />
        )}
      </head>
      <body
        className={cn(
          "font-sans antialiased",
          geist.variable,
          geistMono.variable,
          bricolageGrotesque.variable
        )}
      >
        <NuqsAdapter>
          <TRPCProvider>
            <div className="flex min-h-dvh min-w-0 flex-col overflow-x-hidden pt-(--app-header-height)">
              <Header />
              <HeaderBackdrop />

              <main className="min-h-0 w-full flex-1">{children}</main>
            </div>
          </TRPCProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
