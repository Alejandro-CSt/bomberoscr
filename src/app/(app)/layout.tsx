import IncidentInfoDrawer from "@/features/map/components/incident-drawer";
import StationInfoDrawer from "@/features/map/components/station-drawer";
import { IncidentInfoProvider } from "@/features/map/context/incident-drawer-context";
import { MapSettingsProvider } from "@/features/map/context/map-settings-context";
import { StationInfoProvider } from "@/features/map/context/station-drawer-context";
import { cn } from "@/lib/utils";
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
    <div className={cn(inter.className, "max-h-screen")}>
      <MapSettingsProvider>
        <StationInfoProvider>
          <IncidentInfoProvider>
            <StationInfoDrawer />
            <IncidentInfoDrawer />
            {children}
          </IncidentInfoProvider>
        </StationInfoProvider>
      </MapSettingsProvider>
    </div>
  );
}
