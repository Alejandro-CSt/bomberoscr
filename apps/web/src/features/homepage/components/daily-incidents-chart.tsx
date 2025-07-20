"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/shared/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip
} from "@/shared/components/ui/chart";
import type { getDailyIncidents } from "@bomberoscr/db/queries/charts/dailyIncidents";
import { Geist_Mono } from "next/font/google";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

type DailyIncidents = Awaited<ReturnType<typeof getDailyIncidents>>;

interface DailyIncidentsChartProps {
  incidents: DailyIncidents;
  timeRange: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: DailyIncidents["data"][number];
  }>;
  label?: string;
}

const chartConfig = {
  current: {
    label: "Período actual",
    color: "var(--chart-1)"
  },
  previous: {
    label: "Período anterior",
    color: "var(--chart-3)"
  }
} satisfies ChartConfig;

const GeistMono = Geist_Mono({
  subsets: ["latin"]
});

export function DailyIncidentsChart({ incidents, timeRange }: DailyIncidentsChartProps) {
  const { data, summary } = incidents;

  const getTimeRangeLabel = (days: number) => {
    if (days === 7) return "7 días";
    if (days === 30) return "30 días";
    if (days === 90) return "90 días";
    if (days === 365) return "365 días";
    return `${days} días`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-red-600";
    if (change < 0) return "text-green-600";
    return "text-muted-foreground";
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Incidentes diarios</CardTitle>
        <CardDescription>
          Comparación de incidentes por día - {getTimeRangeLabel(timeRange)} actual vs anterior
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <ChartContainer
          config={chartConfig}
          className={cn("max-h-[300px] w-full", GeistMono.className)}
        >
          <AreaChart accessibilityLayer data={data} margin={{ right: 16 }}>
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value, index) => {
                if (index % 2 === 0) {
                  return value;
                }
                return "";
              }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
            <Area
              dataKey="previous"
              type="monotone"
              fill="var(--color-previous)"
              fillOpacity={0.4}
              stroke="var(--color-previous)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="current"
              type="monotone"
              fill="var(--color-current)"
              fillOpacity={0.6}
              stroke="var(--color-current)"
              strokeWidth={2}
              stackId="b"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          <span>Total actual: {summary.currentTotal}</span>
          <span>•</span>
          <span>Total anterior: {summary.previousTotal}</span>
          <span>•</span>
          <span className={getChangeColor(summary.percentageChange)}>
            {formatChange(summary.percentageChange)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

function CustomTooltipContent({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;

    if (!data) return null;

    const currentData = payload.find((p) => p.dataKey === "current");
    const previousData = payload.find((p) => p.dataKey === "previous");

    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <div className="space-y-1">
          <div className="font-medium">{label}</div>
          <div className="space-y-1">
            {currentData && (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-1 rounded-[2px] bg-chart-1" />
                  <span className="text-muted-foreground text-xs">Período actual:</span>
                </div>
                <span className="font-medium font-mono text-sm">{currentData.value}</span>
              </div>
            )}
            {previousData && (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-1 rounded-[2px] bg-chart-3" />
                  <span className="text-muted-foreground text-xs">Período anterior:</span>
                </div>
                <span className="font-medium font-mono text-sm">{previousData.value}</span>
              </div>
            )}
          </div>
          {currentData && previousData && (
            <div className="mt-2 border-t pt-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs">Diferencia:</span>
                <span className="font-mono text-xs">
                  {currentData.value - previousData.value > 0 ? "+" : ""}
                  {currentData.value - previousData.value}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}
