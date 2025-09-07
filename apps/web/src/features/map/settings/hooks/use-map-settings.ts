import { MapSettingsContext } from "@/features/map/settings/context/map-settings-provider";
import { useContext } from "react";

export function useMapSettings() {
  const context = useContext(MapSettingsContext);
  if (!context) {
    throw new Error("useMapSettings must be used within a MapSettingsProvider");
  }
  return context;
}
