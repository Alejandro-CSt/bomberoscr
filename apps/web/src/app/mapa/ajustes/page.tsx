import { FloatingPanelHeader } from "@/features/map/layout/components/floating-panel-header";
import { IncidentSettings } from "@/features/map/settings/components/incident-settings";
import { StationsSettings } from "@/features/map/settings/components/stations-settings";
import { ThemeSettings } from "@/features/map/settings/components/theme-settings";

export default function MapSettingsPanel() {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <FloatingPanelHeader title="Ajustes" />
      <div className="flex flex-col gap-2 p-2">
        <ThemeSettings />
        <IncidentSettings />
        <StationsSettings />
      </div>
    </div>
  );
}
