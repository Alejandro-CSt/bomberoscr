import env from "@/features/lib/env";
import type { Metadata } from "next";

const dashboardDescription =
  "Visualiza incidentes recientes, métricas operativas y estaciones de bomberos con datos en vivo.";

export const metadata: Metadata = {
  title: {
    default: "Panel de incidentes",
    template: "%s | Emergencias CR"
  },
  description: dashboardDescription,
  openGraph: {
    title: "Panel de incidentes",
    description: dashboardDescription,
    url: env.SITE_URL ? new URL("/", env.SITE_URL).toString() : undefined,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Panel de incidentes",
    description: dashboardDescription
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-6 xl:px-0">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </div>
  );
}
