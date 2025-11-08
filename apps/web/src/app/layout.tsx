import { AppSidebar } from "@/features/layout/components/sidebar";
import env from "@/features/lib/env";
import { SidebarInset, SidebarProvider } from "@/features/shared/components/ui/sidebar";
import { ThemeProvider } from "@/features/shared/context/theme-provider";
import { cn } from "@/features/shared/lib/utils";
import "@/features/styles/globals.css";
import TRPCProvider from "@/features/trpc/provider";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

const siteUrl = env.SITE_URL;

const brandName = "Bomberos de Costa Rica";
const defaultTitle = "Estadísticas Bomberos";
const defaultFullTitle = `${defaultTitle} — ${brandName}`;
const description =
  "Dashboard interactivo con estadísticas, análisis de datos y mapa de incidentes atendidos por el Benemérito Cuerpo de Bomberos de Costa Rica en tiempo real. Consulta tendencias, estaciones y tiempos de respuesta.";

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
    "Benemérito Cuerpo de Bomberos",
    "incidentes en tiempo real",
    "respuesta de emergencias",
    "estadísticas de incendios",
    "mapa de incidentes",
    "análisis operativo",
    "estaciones de bomberos",
    "tiempo de respuesta",
    "BCR emergencias"
  ],
  openGraph: {
    title: defaultFullTitle,
    description,
    url: siteUrl,
    type: "website",
    siteName: "Estadísticas Bomberos",
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
    icon: "/bomberos/flame-32.jpg"
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
    <html lang="es-CR" suppressHydrationWarning>
      <body
        className={cn(
          "font-sans antialiased",
          geist.variable,
          geistMono.variable,
          bricolageGrotesque.variable
        )}
      >
        <SidebarProvider defaultOpen={false} open={false}>
          <NuqsAdapter>
            <ThemeProvider attribute="class" defaultTheme="system">
              <TRPCProvider>
                <Suspense fallback={null}>
                  <AppSidebar variant="sidebar" />
                </Suspense>
                <SidebarInset>
                  <div className="h-full">{children}</div>
                </SidebarInset>
              </TRPCProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </SidebarProvider>
      </body>
    </html>
  );
}
