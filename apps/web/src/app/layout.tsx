import { AppSidebar } from "@/features/layout/components/sidebar";
import env from "@/features/lib/env";
import { SidebarInset, SidebarProvider } from "@/features/shared/components/ui/sidebar";
import { ThemeProvider } from "@/features/shared/context/theme-provider";
import { cn } from "@/features/shared/lib/utils";
import "@/features/styles/globals.css";
import TRPCProvider from "@/features/trpc/provider";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

const title = "Mapa de incidentes atendidos por Bomberos de Costa Rica en tiempo real";
const description =
  "Mapa interactivo no oficial con estadísticas de incendios, emergencias activas, ubicación de estaciones y detalles de incidentes en tiempo real atendidos por Bomberos de Costa Rica.";
const siteUrl = env.SITE_URL;

export const metadata: Metadata = {
  title: title,
  description: description,
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
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
    images: siteUrl ? [`${siteUrl}/og.png`] : undefined
  },
  twitter: {
    card: "summary_large_image",
    title: "Mapa y estadísticas de incidentes atendidos por Bomberos de Costa Rica",
    description: description,
    images: siteUrl ? [`${siteUrl}/og.png`] : undefined
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
    icon: "/flame.jpg"
  }
};

const geist = Geist({ subsets: ["latin-ext"], weight: ["400", "500", "600", "700"] });

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn("antialiased", geist.className)}>
        <SidebarProvider defaultOpen={false} open={false}>
          <NuqsAdapter>
            <ThemeProvider attribute="class" defaultTheme="system">
              <TRPCProvider>
                <Suspense fallback={null}>
                  <AppSidebar />
                </Suspense>
                <SidebarInset className="overflow-hidden">
                  <main className="h-full">{children}</main>
                </SidebarInset>
              </TRPCProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </SidebarProvider>
      </body>
    </html>
  );
}
