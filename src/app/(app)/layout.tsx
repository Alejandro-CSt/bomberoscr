import { MapSettingsProvider } from "@/features/map/context/map-settings-context";
import { cn } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], weight: "variable" });

export const metadata: Metadata = {
  title: "Mapa en tiempo real",
  description: "Mapa en tiempo real de Bomberos de Costa Rica"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(inter.className, "max-h-screen")}>
      <MapSettingsProvider>
        <Suspense
          fallback={
            <div className="flex h-dvh flex-col items-center justify-center">
              <LoaderIcon className="size-8 animate-spin" />
            </div>
          }
        >
          {children}
        </Suspense>
      </MapSettingsProvider>
    </div>
  );
}
