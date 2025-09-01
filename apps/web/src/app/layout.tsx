import { SidebarWrapper } from "@/features/layout/context/sidebar-wrapper";
import { AppSidebar } from "@/features/sidebar/components/sidebar";
import TRPCProvider from "@/lib/trpc/provider";
import { cn } from "@/lib/utils";
import { SidebarInset } from "@/shared/components/ui/sidebar";
import { ThemeProvider } from "@/shared/context/theme-provider";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
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
        <SidebarWrapper>
          <NuqsAdapter>
            <ThemeProvider attribute="class" defaultTheme="system">
              <TRPCProvider>
                <AppSidebar />
                <SidebarInset className="overflow-hidden">
                  <main>{children}</main>
                </SidebarInset>
              </TRPCProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </SidebarWrapper>
      </body>
    </html>
  );
}
