import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Estadísticas",
  description: "Estadísticas en tiempo real de Bomberos de Costa Rica"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={cn(inter.className, "max-h-screen overflow-y-hidden")}>{children}</div>;
}
