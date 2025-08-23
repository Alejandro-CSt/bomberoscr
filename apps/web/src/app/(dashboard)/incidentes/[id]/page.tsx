import IncidentMap from "@/features/incidents/incident-map";
import { VehicleResponseTimeChart } from "@/features/incidents/vehicle-response-time-chart";
import { cn, getRelativeTime, isUndefinedDate } from "@/lib/utils";
import { IncidentStatusIndicator } from "@/shared/components/incident-status-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shared/components/ui/table";
import { getDetailedIncidentById } from "@bomberoscr/db/queries/incidentDetails";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";

const GeistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

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

export default async function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = await getDetailedIncidentById(Number(id));

  if (!incident) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <IncidentStatusIndicator isOpen={incident.isOpen} />
            {incident.isOpen && (
              <p className="rounded-lg border px-2 py-1 text-muted-foreground text-sm">
                Actualizado {getRelativeTime(incident.incidentTimestamp.toISOString())}
              </p>
            )}
            {incident.specificIncidentType && (
              <p className="rounded-lg border px-2 py-1 text-muted-foreground text-sm">
                {incident.specificIncidentType.name}
              </p>
            )}
          </div>
          <h1 className="font-bold text-xl md:text-3xl">{incident.importantDetails}</h1>
          <p className="text-muted-foreground">
            {incident.incidentTimestamp.toLocaleString("es-CR")}
          </p>
        </div>

        <p className="max-w-prose text-muted-foreground leading-relaxed">{incident.address}</p>

        <IncidentMap
          latitude={Number(incident.latitude)}
          longitude={Number(incident.longitude)}
          stations={incident.dispatchedStations.map((station) => ({
            latitude: Number(station.station.latitude),
            longitude: Number(station.station.longitude),
            name: station.station.name
          }))}
        />
      </div>
      <div className="flex basis-1/2 flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Estaciones despachadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className={cn(GeistMono.className, "text-sm")}>
              <TableHeader>
                <TableRow>
                  <TableHead>Estación</TableHead>
                  <TableHead>Rol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incident.dispatchedStations
                  .sort((a, b) => (b.serviceTypeId ?? 0) - (a.serviceTypeId ?? 0))
                  .map((station) => (
                    <TableRow
                      key={station.id}
                      className={cn(station.serviceTypeId === 1 && "font-semibold")}
                    >
                      <TableCell>
                        <Link href={`/estaciones/${station.station.name}`}>
                          {station.station.name}
                        </Link>
                      </TableCell>

                      <TableCell>{station.serviceTypeId === 1 ? "Responsable" : "Apoyo"}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <VehicleResponseTimeChart vehicles={incident.dispatchedVehicles} isOpen={incident.isOpen} />

        <Card>
          <CardHeader>
            <CardTitle>Vehículos despachados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className={cn(GeistMono.className, "text-sm")}>
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
                {incident.dispatchedVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.vehicle?.internalNumber || "N/A"}</TableCell>
                    <TableCell>{vehicle.station.name}</TableCell>
                    <TableCell className="text-xs">{formatTime(vehicle.dispatchedTime)}</TableCell>
                    <TableCell className="text-xs">{formatTime(vehicle.arrivalTime)}</TableCell>
                    <TableCell className="text-xs">{formatTime(vehicle.departureTime)}</TableCell>
                    <TableCell className="text-xs">
                      {isUndefinedDate(vehicle.dispatchedTime) ||
                      isUndefinedDate(vehicle.arrivalTime)
                        ? "N/A"
                        : calculateResponseTime(vehicle.dispatchedTime, vehicle.arrivalTime)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
