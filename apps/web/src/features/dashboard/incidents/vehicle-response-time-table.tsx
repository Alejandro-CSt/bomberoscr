"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/features/shared/components/ui/table";
import { isUndefinedDate } from "@/features/shared/lib/utils";
import type { DetailedIncident } from "@bomberoscr/db/queries/incidents";

function formatTime(date: Date): string {
  if (isUndefinedDate(date)) return "N/A";
  return date.toLocaleTimeString("es-CR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function calculateResponseTime(dispatch: Date, arrival: Date) {
  const diff = arrival.getTime() - dispatch.getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function VehicleResponseTimeTable({
  vehicles
}: {
  vehicles: NonNullable<DetailedIncident>["dispatchedVehicles"];
}) {
  return (
    <section className="rounded-lg border bg-muted">
      <Table className="border-collapse text-sm">
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="border-r">Vehículo</TableHead>
            <TableHead className="border-r">Estación</TableHead>
            <TableHead className="border-r">Despacho</TableHead>
            <TableHead className="border-r">Llegada</TableHead>
            <TableHead className="border-r">Retiro</TableHead>
            <TableHead>Tiempo de respuesta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} className="border-b">
              <TableCell className="border-r">{vehicle.vehicle?.internalNumber || "N/A"}</TableCell>
              <TableCell className="border-r">{vehicle.station.name}</TableCell>
              <TableCell className="border-r text-xs">
                {formatTime(vehicle.dispatchedTime)}
              </TableCell>
              <TableCell className="border-r text-xs">{formatTime(vehicle.arrivalTime)}</TableCell>
              <TableCell className="border-r text-xs">
                {formatTime(vehicle.departureTime)}
              </TableCell>
              <TableCell className="text-xs">
                {isUndefinedDate(vehicle.dispatchedTime) || isUndefinedDate(vehicle.arrivalTime)
                  ? "N/A"
                  : calculateResponseTime(vehicle.dispatchedTime, vehicle.arrivalTime)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
