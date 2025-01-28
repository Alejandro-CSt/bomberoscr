import { cn } from "@/features/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Estadísticas",
  description: "Estadísticas en tiempo real de Bomberos de Costa Rica"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={cn(inter.className, "max-h-screen overflow-y-hidden")}>{children}</body>
    </html>
  );
}
