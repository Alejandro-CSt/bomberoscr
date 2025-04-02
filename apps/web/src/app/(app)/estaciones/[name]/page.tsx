import { ErrorPanel } from "@/features/components/error-panel";
import { IncidentCard } from "@/features/components/incident-card";
import { Badge } from "@/features/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/components/ui/tabs";
import { FloatingPanelHeader } from "@/features/layout/components/floating-panel-header";
import { StatsTab } from "@/features/stations/station-stats";
import { cn } from "@/lib/utils";
import { getLatestIncidents } from "@/server/queries";
import db from "@bomberoscr/db/db";
import { stations } from "@bomberoscr/db/schema";
import { eq } from "drizzle-orm";
import {
  Building2Icon,
  ChartSplineIcon,
  CheckCircleIcon,
  HashIcon,
  type LucideIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  PrinterIcon,
  RadioIcon,
  SirenIcon,
  XCircleIcon
} from "lucide-react";

export default async function DetailedStationPage({
  params
}: {
  params: Promise<{ name: string }>;
}) {
  const decodedName = decodeURIComponent((await params).name);

  const station = await db.query.stations.findFirst({
    where: eq(stations.name, decodedName)
  });

  if (!station)
    return (
      <ErrorPanel
        title="Detalles de la estación"
        message="No se encontró la estación"
        backHref="/estaciones"
      />
    );

  const incidents = await getLatestIncidents({
    stationFilter: station.stationKey,
    limit: 15,
    cursor: null
  });

  const tabs = [
    {
      value: "details",
      label: "Detalles",
      icon: <Building2Icon className="size-4" />
    },
    {
      value: "incidents",
      label: "Incidentes",
      icon: <SirenIcon className="size-4" />
    },
    {
      value: "stats",
      label: "Estadísticas",
      icon: <ChartSplineIcon className="size-4" />
    }
  ];
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <FloatingPanelHeader title="Detalles de la estación" />
      <Tabs defaultValue="incidents">
        <TabsList asChild>
          <div className="sticky top-[61px] z-20 flex w-full items-center justify-between py-8">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex flex-1 flex-col items-center gap-1"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </div>
        </TabsList>
        <TabsContent value="details">
          <FireStationDetails data={station} />
        </TabsContent>
        <TabsContent value="incidents">
          <IncidentsTab incidents={incidents} />
        </TabsContent>
        <TabsContent value="stats">
          <StatsTab stationKey={station.stationKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FireStationDetails({ data }: { data: typeof stations.$inferSelect }) {
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Badge variant={data.isOperative ? "default" : "destructive"}>
            {data.isOperative ? (
              <CheckCircleIcon className="mr-1 h-4 w-4" />
            ) : (
              <XCircleIcon className="mr-1 h-4 w-4" />
            )}
            {data.isOperative ? "Operativa" : "No operativa"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-1">
        <DetailItem icon={HashIcon} label="Clave" value={data.stationKey} />
        <DetailItem icon={MapPinIcon} label="Dirección" value={data.address} fullWidth />
        <DetailItem
          icon={MapPinIcon}
          label="Coordenadas"
          value={`${data.latitude}, ${data.longitude}`}
        />
        <DetailItem icon={RadioIcon} label="Canal de radio" value={data.radioChannel} />
        <DetailItem icon={PhoneIcon} label="Teléfono" value={data.phoneNumber} />
        <DetailItem icon={PrinterIcon} label="Fax" value={data.fax} />
        <DetailItem icon={MailIcon} label="Correo electrónico" value={data.email} />
      </CardContent>
    </Card>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  fullWidth = false
}: { icon: LucideIcon; label: string; value: string | null; fullWidth?: boolean }) {
  if (!value) return null;
  return (
    <div className={cn("flex items-start space-x-2", fullWidth && "col-span-full")}>
      <Icon className="size-4 min-h-4 min-w-4 text-muted-foreground" />
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-muted-foreground text-sm">{value}</p>
      </div>
    </div>
  );
}

function IncidentsTab({
  incidents
}: { incidents: Awaited<ReturnType<typeof getLatestIncidents>> }) {
  if (incidents.length === 0)
    return (
      <div className="flex-1">
        <p className="p-4 text-center text-muted-foreground">No se encontraron incidentes.</p>
      </div>
    );

  return (
    <div className="space-y-2 px-4 pb-4">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
}
