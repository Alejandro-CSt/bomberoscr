import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { cn } from "@/features/lib/utils";
import StationInfoDrawer from "@/features/map/components/station-info-drawer";
import { StationInfoProvider } from "@/features/map/context/station-drawer-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mapa en tiempo real",
  description: "Mapa en tiempo real de Bomberos de Costa Rica"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={cn(inter.className, "max-h-screen")}>
        <StationInfoProvider>
          <StationInfoDrawer />
          {children}
        </StationInfoProvider>
      </body>
    </html>
  );
}
