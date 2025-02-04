"use client";

import { createContext, useContext, useState } from "react";

type StationInfoContextType = {
  stationId: number | undefined;
  setStationId: (id: number | undefined) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
};

const StationInfoContext = createContext<StationInfoContextType | null>(null);

export const StationInfoProvider = ({ children }: { children: React.ReactNode }) => {
  const [stationId, setStationId] = useState<number | undefined>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <StationInfoContext.Provider
      value={{ stationId, setStationId: setStationId, isDrawerOpen, setIsDrawerOpen }}
    >
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
