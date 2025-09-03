"use no memo";
"use client";

import { Button } from "@/features/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/features/shared/components/ui/dropdown-menu";
import type { Table } from "@tanstack/react-table";
import { SlidersHorizontalIcon } from "lucide-react";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

const COLUMN_LABELS: Record<string, string> = {
  EEConsecutive: "Consecutivo",
  incidentTimestamp: "Fecha",
  station: "Estación",
  specificIncidentType: "Tipo de incidente",
  importantDetails: "Detalles",
  address: "Dirección"
};

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <SlidersHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className=""
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {COLUMN_LABELS[column.id] || column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
