"use client";

import { DataTableColumnHeader } from "@/features/incidents/table/components/data-table-column-header";
import DataTableDate from "@/features/incidents/table/components/data-table-date";
import { DataTableIsOpenIndicator } from "@/features/incidents/table/components/data-table-is-open-column";
import type { getIncidentsForTable } from "@bomberoscr/db/queries/incidentsTable";
import type { ColumnDef } from "@tanstack/react-table";

type IncidentTable = Awaited<ReturnType<typeof getIncidentsForTable>>[number];

export const columns: ColumnDef<IncidentTable>[] = [
  {
    accessorKey: "isOpen",
    header: "",
    cell: ({ row }) => {
      const isOpen = row.getValue<IncidentTable["isOpen"]>("isOpen");
      return <DataTableIsOpenIndicator isOpen={isOpen} />;
    },
    filterFn: "arrIncludesSome",
    enableHiding: false,
    enableResizing: false,
    size: 40,
    maxSize: 40,
    minSize: 40
  },
  {
    accessorKey: "EEConsecutive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Consecutivo" />,
    cell: ({ row }) => {
      const EEConsecutive = row.getValue<IncidentTable["EEConsecutive"]>("EEConsecutive");
      return <div className="whitespace-nowrap">EE-{EEConsecutive}</div>;
    },
    enableHiding: true,
    enableResizing: true,
    size: 120,
    maxSize: 150,
    minSize: 100
  },
  {
    accessorKey: "incidentTimestamp",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
    cell: ({ row }) => {
      const incidentTimestamp =
        row.getValue<IncidentTable["incidentTimestamp"]>("incidentTimestamp");
      return <DataTableDate date={incidentTimestamp} />;
    },
    enableHiding: true,
    enableResizing: true,
    size: 120,
    maxSize: 150,
    minSize: 100
  },
  {
    accessorKey: "station",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estación" />,
    cell: ({ row }) => {
      const station = row.getValue<IncidentTable["station"]>("station");
      return <div className="truncate">{station?.name ?? "-"}</div>;
    },
    enableHiding: true,
    enableResizing: true,
    enableSorting: false,
    size: 150,
    maxSize: 200,
    minSize: 120
  },
  {
    accessorKey: "specificIncidentType",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de incidente" />,
    cell: ({ row }) => {
      const specificIncidentType =
        row.getValue<IncidentTable["specificIncidentType"]>("specificIncidentType");
      return <div className="truncate">{specificIncidentType?.name ?? "-"}</div>;
    },
    enableHiding: true,
    enableResizing: true,
    enableSorting: false,
    size: 180,
    maxSize: 250,
    minSize: 150
  },
  {
    accessorKey: "importantDetails",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Detalles" />,
    cell: ({ row }) => {
      const importantDetails = row.getValue<IncidentTable["importantDetails"]>("importantDetails");
      return <div className="max-w-xs truncate">{importantDetails}</div>;
    },
    enableHiding: true,
    enableResizing: true,
    enableSorting: false,
    size: 200,
    maxSize: 300,
    minSize: 150
  },
  {
    accessorKey: "address",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dirección" />,
    cell: ({ row }) => {
      const address = row.getValue<IncidentTable["address"]>("address");
      return <div className="max-w-xs truncate">{address}</div>;
    },
    enableHiding: true,
    enableResizing: true,
    enableSorting: false,
    size: 200,
    maxSize: 300,
    minSize: 150
  }
];
