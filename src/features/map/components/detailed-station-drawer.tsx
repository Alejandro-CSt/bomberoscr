"use client";

import { Alert, AlertDescription, AlertTitle } from "@/features/components/ui/alert";
import { Badge } from "@/features/components/ui/badge";
import { Button } from "@/features/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/features/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/features/components/ui/chart";
import { Skeleton } from "@/features/components/ui/skeleton";
import { ResponsiveDrawer } from "@/features/map/components/responsive-drawer";
import { useActiveStation } from "@/features/map/hooks/use-active-station";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { LatestIncident, StationDetails } from "@/server/trpc";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  Building2Icon,
  ChartSplineIcon,
  CheckCircleIcon,
  HashIcon,
  Loader2Icon,
  LoaderIcon,
  type LucideIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  PrinterIcon,
  RadioIcon,
  SirenIcon,
  XCircleIcon
} from "lucide-react";
import { Geist_Mono } from "next/font/google";
import { parseAsStringEnum } from "nuqs";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Text,
  XAxis,
  YAxis
} from "recharts";
import { IncidentCard } from "./latest-incidents-drawer";

const geist = Geist_Mono({ subsets: ["latin"], weight: "variable" });

enum TabName {
  Details = "detalles",
  Incidents = "incidentes",
  Stats = "estadisticas",
  Share = "compartir"
}

export const searchParamsParsers = {
  tab: parseAsStringEnum<TabName>(Object.values(TabName)).withOptions({
    shallow: true
  })
};

export default function DetailedStationDrawer() {
  const [activeStation, setActiveStation] = useActiveStation();
  const handleClose = () => {
    setActiveStation(null);
  };

  return (
    <ResponsiveDrawer
      isOpen={activeStation.stationKey !== null && activeStation.stationName !== null}
      onCloseAction={handleClose}
      {...(activeStation.stationName && {
        title: `${activeStation.stationName} ${activeStation.stationKey}`
      })}
    >
      <Tabs />
      <div className="mt-4">
        <Body />
      </div>
    </ResponsiveDrawer>
  );
}

export function Tabs() {
  const [activeStation, setActiveStation] = useActiveStation();

  return (
    <div className="-mx-4 -top-4 sticky z-30 flex flex-row justify-evenly border-b bg-background py-4 text-sm">
      <Button
        onClick={() => {
          setActiveStation({
            tab: TabName.Details
          });
        }}
        className={cn(
          "flex basis-0 flex-col items-center gap-1 text-foreground",
          activeStation.tab === TabName.Details && "text-primary"
        )}
        variant="link"
      >
        <Building2Icon className="size-4" />
        General
      </Button>
      <Button
        onClick={() => {
          setActiveStation({
            tab: TabName.Incidents
          });
        }}
        className={cn(
          "flex basis-0 flex-col items-center gap-1 text-foreground",
          activeStation.tab === TabName.Incidents && "text-primary"
        )}
        variant="link"
      >
        <SirenIcon className="size-4" />
        Incidentes
      </Button>
      <Button
        onClick={() => {
          setActiveStation({
            tab: TabName.Stats
          });
        }}
        className={cn(
          "flex basis-0 flex-col items-center gap-1 text-foreground",
          activeStation.tab === TabName.Stats && "text-primary"
        )}
        variant="link"
      >
        <ChartSplineIcon className="size-4" />
        Estadísticas
      </Button>
    </div>
  );
}
function Body() {
  const [activeStationQuery] = useActiveStation();

  switch (activeStationQuery.tab) {
    case TabName.Details:
      return <DetailsTab />;
    case TabName.Incidents:
      return <IncidentsTab />;
    default:
      return <StatsTab />;
  }
}
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

function DetailsTab() {
  const [activeStationQuery] = useActiveStation();
  const { data, isLoading, error } = trpc.stations.getStationDetails.useQuery({
    key: activeStationQuery.stationKey
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error || !data)
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error al cargar la estación {activeStationQuery.stationKey}</AlertTitle>
          <AlertDescription>{error?.message}</AlertDescription>
        </Alert>
      </div>
    );

  return <FireStationDetails data={data} />;
}

function FireStationDetails({ data }: { data: NonNullable<StationDetails> }) {
  return (
    <Card>
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

function IncidentsTab() {
  const [activeStation] = useActiveStation();
  const [results, setResults] = useState<LatestIncident[]>([]);
  const { data, isPending, fetchNextPage, isFetchingNextPage, hasNextPage, error } =
    trpc.incidents.infiniteIncidents.useInfiniteQuery(
      {
        limit: 15,
        stationFilter: activeStation.stationName
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  useEffect(() => {
    if (data) {
      const newIncidents = data.pages.flatMap((page) => page.items);
      setResults(newIncidents);
    }
  }, [data]);

  if (isPending)
    return (
      <div className="flex h-16 flex-col items-center justify-center">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );

  if (error || !data)
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>
            Error al cargar los incidentes de la estación {activeStation.stationKey}
          </AlertTitle>
          <AlertDescription>{error?.message}</AlertDescription>
        </Alert>
      </div>
    );

  if (results.length === 0)
    return (
      <div className="flex-1">
        <p className="p-4 text-center text-muted-foreground">No se encontraron incidentes.</p>
      </div>
    );

  return (
    <div className={cn("mb-4 flex flex-1 flex-col gap-4", geist.className)}>
      {results.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
      {hasNextPage && (
        <Button
          variant="outline"
          className="mx-auto my-4 flex items-center justify-center"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Cargar más"}
        </Button>
      )}
    </div>
  );
}

function StatsTab() {
  const [activeStation] = useActiveStation();
  const { data, isLoading, error } = trpc.stations.getStationStats.useQuery({
    key: activeStation.stationKey
  });
  const { data: hourlyData, isLoading: hourlyLoading } =
    trpc.stations.getStationHourlyStats.useQuery({
      key: activeStation.stationKey
    });
  const { data: incidentTypes, isLoading: typesLoading } =
    trpc.stations.getStationIncidentTypes.useQuery({
      key: activeStation.stationKey
    });
  const [period, setPeriod] = useState<"week" | "month">("week");

  if (isLoading || hourlyLoading || typesLoading) return <LoadingSkeleton />;
  if (error || !data)
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>
            Error al cargar las estadísticas de la estación {activeStation.stationKey}
          </AlertTitle>
          <AlertDescription>{error?.message}</AlertDescription>
        </Alert>
      </div>
    );

  const chartData: Array<{ date: string; count: number; formatted: string }> = [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-MX", {
      weekday: "short",
      day: "2-digit"
    });
  };

  if (period === "week")
    for (const date of data.week)
      chartData.push({
        date: formatDate(date.day as string),
        count: date.count,
        formatted: new Date(date.day).toLocaleDateString("es-CR", {
          day: "numeric",
          weekday: "long",
          month: "long",
          year: "numeric"
        })
      });
  else
    for (const date of data.month)
      chartData.push({
        date: formatDate(date.day as string),
        count: date.count,
        formatted: new Date(date.day).toLocaleDateString("es-CR", {
          day: "numeric",
          weekday: "long",
          month: "long",
          year: "numeric"
        })
      });

  const chartConfig: ChartConfig = {
    count: {
      label: "Incidentes atendidos: ",
      color: "hsl(var(--chart-2))"
    },
    ...chartData.reduce((config, item) => {
      config[item.date] = {
        label: item.formatted
      };
      return config;
    }, {} as ChartConfig),
    ...incidentTypes?.reduce((config, item) => {
      config[item.name] = {
        label: item.name,
        color: `hsl(var(--chart-${(Object.keys(config).length % 8) + 1}))`
      };
      return config;
    }, {} as ChartConfig)
  };

  const totalIncidents = {
    week: data.week.reduce((acc, item) => acc + Number(item.count || 0), 0),
    month: data.month.reduce((acc, item) => acc + Number(item.count || 0), 0)
  };

  if (totalIncidents.week === 0 && totalIncidents.month === 0)
    return (
      <div className="p-4">
        <Alert variant="warning">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>
            No se encontraron incidentes en la estación {activeStation.stationKey} en los últimos 30
            días
          </AlertTitle>
        </Alert>
      </div>
    );

  const hourlyChartData =
    hourlyData?.map((item) => ({
      hour: new Date(2024, 0, 1, item.hour)
        .toLocaleString("en-US", {
          hour: "numeric",
          hour12: true
        })
        .toLowerCase(),
      count: item.count
    })) ?? [];

  const incidentTypesData =
    incidentTypes?.map((type, index) => ({
      name: type.name,
      value: type.count,
      fill: `hsl(var(--chart-${(index % 8) + 1}))`
    })) ?? [];

  return (
    <div className={cn("h-full")}>
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Incidentes</CardTitle>
            <CardDescription className="text-xs">
              Veces que se despachó a {activeStation.stationName}
            </CardDescription>
          </div>
          <div className="flex">
            {["week", "month"].map((key) => {
              return (
                <button
                  type="button"
                  key={key}
                  data-active={period === key}
                  className="relative flex flex-1 flex-col justify-center gap-1 border-t px-4 py-2 text-left even:border-l data-[active=true]:bg-muted/70 sm:border-t-0 sm:border-l sm:px-6 sm:py-4"
                  onClick={() => setPeriod(key as "week" | "month")}
                >
                  <span className="text-muted-foreground text-xs">
                    {key === "week" ? "Última semana" : "Último mes"}
                  </span>
                  <span className="font-bold text-lg leading-none sm:text-xl">
                    {totalIncidents[key as keyof typeof totalIncidents].toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="pt-4">
            <BarChart data={chartData} margin={{ top: 22, right: 22, left: 22, bottom: 22 }}>
              <CartesianGrid vertical={false} />
              <YAxis tickLine={false} axisLine={false} spacing={4} width={15} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                className="mt-1"
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
              <Bar
                dataKey="count"
                type="linear"
                spacing={15}
                fill="hsl(var(--primary))"
                stroke="hsl(var(--primary))"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          {/* {period === "7days" ? (
            <>
              En los últimos 7 días la estación {activeStation.stationName} atendió {currentTotal}{" "}
              incidentes, {comparisonText}.
            </>
          ) : (
            <>
              En los últimos 30 días la estación {activeStation.stationName} atendió {currentTotal}{" "}
              incidentes, {comparisonText}.
            </>
          )} */}
        </CardFooter>
      </Card>

      <Card className="m-4">
        <CardHeader>
          <CardTitle>Incidentes por hora</CardTitle>
          <CardDescription className="text-xs">
            Distribución horaria de incidentes atendidos por {activeStation.stationName} en los
            últimos 30 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <RadarChart
              data={hourlyChartData}
              margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
              className="mx-auto aspect-square max-h-[350px]"
            >
              <PolarGrid gridType="circle" />
              <PolarAngleAxis
                dataKey="hour"
                tick={{
                  fontSize: 11,
                  dy: 3
                }}
              />
              <Radar
                name="Incidentes"
                dataKey="count"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            </RadarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="m-4">
        <CardHeader>
          <CardTitle>Tipos de incidentes</CardTitle>
          <CardDescription className="text-xs">
            Distribución por tipo de incidente atendido por {activeStation.stationName} en los
            últimos 30 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px] [&_.recharts-text]:fill-foreground dark:[&_.recharts-text]:fill-foreground"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={incidentTypesData}
                dataKey="value"
                nameKey="name"
                labelLine={{ stroke: "hsl(var(--foreground))" }}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  const radius2 = outerRadius * 1.2;
                  const x2 = cx + radius2 * Math.cos(-midAngle * RADIAN);
                  const y2 = cy + radius2 * Math.sin(-midAngle * RADIAN);

                  return (
                    <>
                      <Text
                        x={x}
                        y={y}
                        verticalAnchor="end"
                        textAnchor="middle"
                        width={75}
                        fontSize={8}
                        fill="hsl(var(--background))"
                        className="sm:text[11px] fill-background"
                      >
                        {name}
                      </Text>
                      <Text
                        x={x2}
                        y={y2}
                        fill="hsl(var(--foreground))"
                        textAnchor={x2 > cx ? "start" : "end"}
                        dominantBaseline="middle"
                        className="text-[11px]"
                      >
                        {value}
                      </Text>
                    </>
                  );
                }}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
