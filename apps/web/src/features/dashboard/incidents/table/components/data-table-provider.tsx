"use no memo";
"use client";

import {
  type ColumnDef,
  type RowSelectionState,
  type VisibilityState,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { type ReactNode, createContext, useContext, useMemo, useState } from "react";

interface DataTableProviderProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  children: ReactNode;
}

interface DataTableContextValue<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  table: ReturnType<typeof useReactTable<TData>>;
}

const DataTableContext = createContext<unknown | undefined>(undefined);

export function DataTableProvider<TData, TValue>({
  columns,
  data,
  children
}: DataTableProviderProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    isOpen: true,
    EEConsecutive: false,
    incidentTimestamp: true,
    station: true,
    specificIncidentType: true,
    importantDetails: true,
    address: false
  });

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
      rowSelection
    },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    enableMultiRowSelection: false
  });

  const value = useMemo(
    () => ({
      columns,
      data,
      columnVisibility,
      setColumnVisibility,
      rowSelection,
      setRowSelection,
      table
    }),
    [columns, data, columnVisibility, rowSelection, table]
  );

  return <DataTableContext.Provider value={value}>{children}</DataTableContext.Provider>;
}

export function useDataTableContext<TData, TValue>() {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error("useDataTableContext must be used within a DataTableProvider");
  }
  return context as DataTableContextValue<TData, TValue>;
}
