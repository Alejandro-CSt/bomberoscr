"use client";

import { createContext, useContext, useState } from "react";

type IncidentInfoContextType = {
  incidentId: number | undefined;
  setIncidentId: (id: number | undefined) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
};

const IncidentInfoContext = createContext<IncidentInfoContextType | null>(null);

export const IncidentInfoProvider = ({ children }: { children: React.ReactNode }) => {
  const [incidentId, setIncidentId] = useState<number | undefined>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <IncidentInfoContext.Provider
      value={{ incidentId, setIncidentId, isDrawerOpen, setIsDrawerOpen }}
    >
      {children}
    </IncidentInfoContext.Provider>
  );
};

export const useIncidentInfo = () => {
  const context = useContext(IncidentInfoContext);
  if (!context) {
    throw new Error("useIncidentInfo must be used within a IncidentInfoProvider");
  }
  return context;
};
