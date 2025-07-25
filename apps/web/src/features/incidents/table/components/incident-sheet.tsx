"use client";
import type { IncidentTable } from "@/features/incidents/table/components/columns";
import { useDataTableContext } from "@/features/incidents/table/components/data-table-provider";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { ChevronDown, ChevronUp, XIcon } from "lucide-react";
import * as React from "react";

export function IncidentSheet() {
  const { rowSelection, setRowSelection, table } = useDataTableContext<IncidentTable, unknown>();
  const selectedRowId = Object.keys(rowSelection)[0];
  const rows = table.getRowModel().rows;
  const selectedIndex = rows.findIndex((row) => row.id === selectedRowId);
  const selectedIncident: IncidentTable | undefined =
    selectedIndex !== -1 ? rows[selectedIndex]?.original : undefined;

  const [open, setOpen] = React.useState(!!selectedIncident);

  React.useEffect(() => {
    setOpen(!!selectedIncident);
  }, [selectedIncident]);

  const prevRow = selectedIndex > 0 ? rows[selectedIndex - 1] : undefined;
  const nextRow = selectedIndex < rows.length - 1 ? rows[selectedIndex + 1] : undefined;

  const handlePrev = React.useCallback(() => {
    if (prevRow) setRowSelection({ [prevRow.id]: true });
  }, [prevRow, setRowSelection]);

  const handleNext = React.useCallback(() => {
    if (nextRow) setRowSelection({ [nextRow.id]: true });
  }, [nextRow, setRowSelection]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!selectedIncident) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [selectedIncident, handlePrev, handleNext]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTimeout(() => setRowSelection({}), 300);
    }
  };

  const formattedDate =
    selectedIncident && selectedIncident.incidentTimestamp instanceof Date
      ? selectedIncident.incidentTimestamp.toLocaleString()
      : String(selectedIncident?.incidentTimestamp ?? "");

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>Incidente EE-{selectedIncident?.EEConsecutive}</SheetTitle>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handlePrev}
                disabled={!prevRow}
              >
                <ChevronUp className="h-5 w-5" />
                <span className="sr-only">Anterior</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleNext}
                disabled={!nextRow}
              >
                <ChevronDown className="h-5 w-5" />
                <span className="sr-only">Siguiente</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setOpen(false)}
              >
                <XIcon className="h-5 w-5" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </div>
          </div>
        </SheetHeader>
        {selectedIncident && (
          <div className="flex flex-col gap-2">
            <div>
              <b>Fecha:</b> {formattedDate}
            </div>
            <div>
              <b>Estación:</b> {selectedIncident.station?.name ?? "-"}
            </div>
            <div>
              <b>Tipo:</b> {selectedIncident.specificIncidentType?.name ?? "-"}
            </div>
            <div>
              <b>Detalles:</b> {selectedIncident.importantDetails}
            </div>
            <div>
              <b>Dirección:</b> {selectedIncident.address}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
