"use client";

import {
  type ColumnDef,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import * as React from "react";

import { DataTableViewOptions } from "@/features/incidents/table/components/data-table-view-options";
import { cn } from "@/lib/utils";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shared/components/ui/table";
import { FilterIcon, SearchIcon } from "lucide-react";
import { Geist_Mono } from "next/font/google";
import { IsOpenIndicatorLegend } from "./data-table-is-open-column";

const GeistMono = Geist_Mono({ subsets: ["latin"] });

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    isOpen: true,
    EEConsecutive: false,
    incidentTimestamp: true,
    station: true,
    specificIncidentType: true,
    importantDetails: true,
    address: true
  });
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility
    }
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-6 bg-background pb-2">
        <div className="flex items-stretch overflow-hidden rounded-lg border">
          <div className="flex items-center justify-center border-r px-3 py-2">
            <SearchIcon className="size-4" />
          </div>
          <Input
            placeholder="Buscar incidente"
            className="flex-1 border-0 px-3 py-2 outline-0 ring-0 focus-visible:ring-0"
          />
          <div className="flex cursor-pointer items-center justify-center border-l px-3 py-2 hover:bg-muted/50">
            <FilterIcon className="size-4" />
          </div>
        </div>
        <DataTableViewOptions table={table} />
      </div>

      <div className={cn("flex-1 overflow-auto", GeistMono.className)}>
        <IsOpenIndicatorLegend className={cn("py-2 text-muted-foreground")} />
        <div className={cn("border border-border md:border-r md:border-l")}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="border-r last:border-r-0">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="scrollbar-hide border-x-0">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="border-r last:border-r-0">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
