"use client";

import { Alert, AlertDescription, AlertTitle } from "@/features/components/ui/alert";
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
import { trpc } from "@/lib/trpc/client";
import { AlertCircleIcon, AlertTriangleIcon } from "lucide-react";
import { useState } from "react";
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

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function StationStats({ stationKey }: { stationKey: string }) {
  const { data, isLoading, error } = trpc.stations.getStationStats.useQuery({
    key: stationKey
  });
  const { data: hourlyData, isLoading: hourlyLoading } =
    trpc.stations.getStationHourlyStats.useQuery({
      key: stationKey
    });
  const { data: incidentTypes, isLoading: typesLoading } =
    trpc.stations.getStationIncidentTypes.useQuery({
      key: stationKey
    });
  const [period, setPeriod] = useState<"week" | "month">("week");

  if (isLoading || hourlyLoading || typesLoading) return <LoadingSkeleton />;
  if (error || !data)
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error al cargar las estadísticas de la estación {stationKey}</AlertTitle>
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
      color: "var(--chart-2)"
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
        color: `var(--chart-${(Object.keys(config).length % 8) + 1})`
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
        <Alert>
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>
            No se encontraron incidentes en la estación {stationKey} en los últimos 30 días
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
      fill: `var(--chart-${(index % 8) + 1})`
    })) ?? [];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Incidentes</CardTitle>
            <CardDescription className="text-xs">
              Veces que se despachó a la estación {stationKey}
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
                fill="var(--primary)"
                stroke="var(--primary)"
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

      <Card>
        <CardHeader>
          <CardTitle>Incidentes por hora</CardTitle>
          <CardDescription className="text-xs">
            Distribución horaria de incidentes atendidos por la estación {stationKey} en los últimos
            30 días
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
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.6}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            </RadarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de incidentes</CardTitle>
          <CardDescription className="text-xs">
            Distribución por tipo de incidente atendido por la estación {stationKey} en los últimos
            30 días
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
                        fill="var(--background)"
                        className="sm:text[11px] fill-background"
                      >
                        {name}
                      </Text>
                      <Text
                        x={x2}
                        y={y2}
                        fill="var(--foreground)"
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
