import FloatingMenu from "@/map/layout/components/floating-menu";
import { FloatingPanel } from "@/map/layout/components/floating-panel";
import { InteractiveMap } from "@/map/layout/components/interactive-map";
import { MapSettingsProvider } from "@/map/layout/context/map-settings-context";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MapSettingsProvider>
      <InteractiveMap />
      <FloatingMenu />
      <FloatingPanel>{children}</FloatingPanel>
    </MapSettingsProvider>
  );
}
