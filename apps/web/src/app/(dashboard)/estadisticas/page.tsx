import { DashboardCard } from "@/dashboard/overview/components/dashboard-card";
import db from "@bomberoscr/db/db";
import {
  dispatchedStations,
  dispatchedVehicles,
  incidentTypes,
  incidents,
  stations,
  vehicles
} from "@bomberoscr/db/schema";
import { Building2, Car, FileText, Flame, Truck, Users } from "lucide-react";

export default async function AdminPage() {
  const [
    stationsCount,
    vehiclesCount,
    incidentsCount,
    incidentTypesCount,
    dispatchedVehiclesCount,
    dispatchedStationsCount
  ] = await Promise.all([
    db.$count(stations),
    db.$count(vehicles),
    db.$count(incidents),
    db.$count(incidentTypes),
    db.$count(dispatchedVehicles),
    db.$count(dispatchedStations)
  ]);

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-3xl tracking-tight">Estadísticas generales</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Estaciones"
          value={stationsCount}
          icon={<Building2 className="size-5" />}
          description="Total de estaciones de bomberos en el sistema incluyendo no operativas"
        />
        <DashboardCard
          title="Vehículos"
          value={vehiclesCount}
          icon={<Truck className="size-5" />}
          description="Total de vehículos registrados incluyendo no operativos"
        />
        <DashboardCard
          title="Incidentes"
          value={incidentsCount}
          icon={<Flame className="size-5" />}
          description="Total de incidentes registrados"
        />
        <DashboardCard
          title="Tipos de Incidentes"
          value={incidentTypesCount}
          icon={<FileText className="size-5" />}
          description="Categorías de incidentes de emergencia"
        />
        <DashboardCard
          title="Vehículos Despachados"
          value={dispatchedVehiclesCount}
          icon={<Car className="size-5" />}
          description="Total de despachos de vehículos"
        />
        <DashboardCard
          title="Estaciones Despachadas"
          value={dispatchedStationsCount}
          icon={<Users className="size-5" />}
          description="Total de despachos de estaciones"
        />
      </div>
    </div>
  );
}
