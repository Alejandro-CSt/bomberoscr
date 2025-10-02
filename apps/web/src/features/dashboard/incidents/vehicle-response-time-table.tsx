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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vehículo</TableHead>
          <TableHead>Estación</TableHead>
          <TableHead>Despacho</TableHead>
          <TableHead>Llegada</TableHead>
          <TableHead>Retiro</TableHead>
          <TableHead>Tiempo de respuesta</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.id}>
            <TableCell>{vehicle.vehicle?.internalNumber || "N/A"}</TableCell>
            <TableCell>{vehicle.station.name}</TableCell>
            <TableCell>{formatTime(vehicle.dispatchedTime)}</TableCell>
            <TableCell>{formatTime(vehicle.arrivalTime)}</TableCell>
            <TableCell>{formatTime(vehicle.departureTime)}</TableCell>
            <TableCell>
              {isUndefinedDate(vehicle.dispatchedTime) || isUndefinedDate(vehicle.arrivalTime)
                ? "N/A"
                : calculateResponseTime(vehicle.dispatchedTime, vehicle.arrivalTime)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
