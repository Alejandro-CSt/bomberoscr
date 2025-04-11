import FloatingMenu from "@/features/layout/components/floating-menu";
import { FloatingPanel } from "@/features/layout/components/floating-panel";
import { InteractiveMap } from "@/features/map/components/interactive-map";
import { MapSettingsProvider } from "@/features/map/context/map-settings-context";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-map h-dvh">
      <MapSettingsProvider>
        <InteractiveMap />
        <FloatingMenu />
        <FloatingPanel>{children}</FloatingPanel>
      </MapSettingsProvider>
    </div>
  );
}
