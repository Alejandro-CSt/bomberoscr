import MapSettings from "@/features/map/components/map-settings";

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false
  }
};

export default function MapSettingsPanel() {
  return <MapSettings />;
}
