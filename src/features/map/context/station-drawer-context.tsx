"use client";

import type { Station } from "@/features/hooks/use-stations";
import { createContext, useContext, useState } from "react";

type StationInfoContextType = {
  station: Station | null;
  setStation: (station: Station | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
};

const StationInfoContext = createContext<StationInfoContextType | null>(null);

export const StationInfoProvider = ({ children }: { children: React.ReactNode }) => {
  const [station, setStation] = useState<Station | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <StationInfoContext.Provider value={{ station, setStation, isDrawerOpen, setIsDrawerOpen }}>
      {children}
    </StationInfoContext.Provider>
  );
};

export const useStationInfo = () => {
  const context = useContext(StationInfoContext);
  if (!context) {
    throw new Error("useStationInfo must be used within a StationInfoProvider");
  }
  return context;
};
