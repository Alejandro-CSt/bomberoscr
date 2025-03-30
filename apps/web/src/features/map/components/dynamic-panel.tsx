"use client";

import { Button } from "@/features/components/ui/button";
import { useMediaQuery } from "@/features/hooks/use-media-query";
import { DetailedIncidentPanel } from "@/features/map/components/detailed-incident-panel";
import { DetailedStationPanel } from "@/features/map/components/detailed-station-panel";
import { LatestIncidentsPanel } from "@/features/map/components/latest-incidents-panel";
import { MapSettingsPanel } from "@/features/map/components/settings-drawer";
import { PanelView, useDynamicPanel } from "@/features/map/hooks/use-dynamic-panel";
import { ArrowLeft, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function DynamicPanel() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [dynamicPanel, setDynamicPanel] = useDynamicPanel();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { view, title, incidentId } = dynamicPanel;

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  const handleClose = () => {
    setDynamicPanel(null);
  };

  const handleBack = () => {
    // Back button is only shown when there is a specific incident selected, so just reset the incidentId searchParam
    setDynamicPanel({
      incidentId: null,
      view: PanelView.Incidents,
      title: "Incidentes"
    });
  };

  return (
    <AnimatePresence mode="sync">
      {view && (
        <motion.div
          key="panel-content"
          className="fixed top-20 bottom-0 z-50 max-h-dvh w-full overflow-hidden rounded-lg bg-background shadow-lg max-md:rounded-b-none md:bottom-8 md:left-8 md:w-[450px] md:max-w-[calc(100vw-32px)]"
          initial={isInitialLoad ? false : isMobile ? { y: "100%" } : { x: "-100%" }}
          animate={isMobile ? { y: 0 } : { x: 0 }}
          exit={isMobile ? { y: "100%" } : { x: "-110%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center">
              {view === PanelView.Incidents && incidentId && (
                <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Volver</span>
                </Button>
              )}
              <h2 className="font-semibold text-sm">{title}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-auto p-4"
              style={{ maxHeight: "calc(100% - 65px)" }}
            >
              <PanelContent />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PanelContent() {
  const [panelState] = useDynamicPanel();
  const { view, incidentId } = panelState;

  switch (view) {
    case PanelView.Incidents:
      return incidentId !== null && incidentId !== undefined ? (
        <DetailedIncidentPanel />
      ) : (
        <LatestIncidentsPanel />
      );
    case PanelView.Station:
      return <DetailedStationPanel />;
    case PanelView.Statistics:
      return <Statistics />;
    default:
      return <MapSettingsPanel />;
  }
}

function Statistics() {
  return <div>Panel de estadísticas</div>;
}
