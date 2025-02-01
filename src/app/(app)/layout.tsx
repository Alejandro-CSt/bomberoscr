import StationInfoDrawer from "@/features/map/components/station-info-drawer";
import { MapStyleProvider } from "@/features/map/context/map-style-provider";
import { StationInfoProvider } from "@/features/map/context/station-drawer-context";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mapa en tiempo real",
  description: "Mapa en tiempo real de Bomberos de Costa Rica"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={cn(inter.className, "max-h-screen")}>
        <MapStyleProvider>
          <StationInfoProvider>
            <StationInfoDrawer />
            {children}
          </StationInfoProvider>
        </MapStyleProvider>
      </body>
    </html>
  );
}
