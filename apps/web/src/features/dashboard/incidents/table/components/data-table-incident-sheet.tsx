"use client";
import type { IncidentTable } from "@/features/dashboard/incidents/table/components/columns";
import { useDataTableContext } from "@/features/dashboard/incidents/table/components/data-table-provider";
import { Button } from "@/features/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/features/shared/components/ui/sheet";
import { cn } from "@/features/shared/lib/utils";
import { ArrowRightIcon, ChevronDown, ChevronUp, XIcon } from "lucide-react";
import Link from "next/link";
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
      ? selectedIncident.incidentTimestamp.toLocaleString("es-CR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
      : String(selectedIncident?.incidentTimestamp ?? "");

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="overflow-x-auto pb-8 sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <SheetTitle className="font-semibold text-lg">
              Incidente EE-{selectedIncident?.EEConsecutive}
            </SheetTitle>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handlePrev}
                disabled={!prevRow}
              >
                <ChevronUp className="h-4 w-4" />
                <span className="sr-only">Anterior</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleNext}
                disabled={!nextRow}
              >
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Siguiente</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setOpen(false)}
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </div>
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-2">
          <IncidentProperty label="Fecha" value={formattedDate} />
          <IncidentProperty
            label="Tipo de incidente"
            value={selectedIncident?.specificIncidentType?.name ?? "N/A"}
          />
          <IncidentProperty
            label="Descripción"
            value={selectedIncident?.importantDetails ?? "N/A"}
          />
          <IncidentProperty
            label="Estado"
            value={selectedIncident?.isOpen ? "En progreso" : "Atendido"}
          />
          <IncidentProperty
            label="Estación responsable"
            value={selectedIncident?.station?.name ?? "N/A"}
          />
          <IncidentProperty label="Ubicación" value={selectedIncident?.address ?? "N/A"} />

          <Link
            href={`/incidentes/${selectedIncident?.id}`}
            className="group flex w-full items-center justify-center gap-2 p-8 text-primary underline-offset-4 hover:underline"
          >
            Ver detalles{" "}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const IncidentProperty = ({
  label,
  value,
  className
}: { label: string; value: string; className?: string }) => {
  return (
    <div
      className={cn(
        "mx-2 flex justify-between gap-2 border-b py-4 font-mono text-xs md:mx-4",
        className
      )}
    >
      <p className="text-muted-foreground">{label}</p>
      <p className="break-words text-end font-medium">{value}</p>
    </div>
  );
};
