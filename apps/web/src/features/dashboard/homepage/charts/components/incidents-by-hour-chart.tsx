"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/features/shared/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip
} from "@/features/shared/components/ui/chart";
import { cn } from "@/features/shared/lib/utils";
import type { getIncidentsByHour } from "@bomberoscr/db/queries/charts/incidentsByHour";
import { Geist_Mono } from "next/font/google";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";

type IncidentsByHour = Awaited<ReturnType<typeof getIncidentsByHour>>;

interface IncidentsByHourChartProps {
  incidents: IncidentsByHour;
  timeRange: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: IncidentsByHour[number];
  }>;
  label?: string;
}

const chartConfig = {
  count: {
    label: "Número de incidentes",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig;

const GeistMono = Geist_Mono({
  subsets: ["latin"]
});

const getHourColor = (count: number, maxCount: number) => {
  if (maxCount === 0) return "var(--chart-1)";

  const ratio = count / maxCount;

  if (ratio <= 0.2) return "var(--chart-1)";
  if (ratio <= 0.4) return "var(--chart-2)";
  if (ratio <= 0.6) return "var(--chart-3)";
  if (ratio <= 0.8) return "var(--chart-4)";
  return "var(--chart-5)";
};

export function IncidentsByHourChart({ incidents, timeRange }: IncidentsByHourChartProps) {
  const getTimeRangeLabel = (days: number) => {
    if (days === 7) return "7 días";
    if (days === 30) return "30 días";
    if (days === 90) return "90 días";
    if (days === 365) return "365 días";
    return `${days} días`;
  };

  const maxCount = Math.max(...incidents.map((incident) => incident.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incidentes por hora del día</CardTitle>
        <CardDescription>
          Distribución de incidentes por hora - Últimos {getTimeRangeLabel(timeRange)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={cn("w-full", GeistMono.className)}>
          <BarChart
            accessibilityLayer
            data={incidents}
            margin={{ right: 16, top: 30 }}
            layout="horizontal"
          >
            <XAxis
              dataKey="displayHour"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={60}
              tickFormatter={(value, index) => {
                if (index % 2 === 0) {
                  return value;
                }
                return "";
              }}
            />
            <YAxis type="number" tickLine={false} axisLine={false} tickMargin={8} hide />
            <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
            <Bar dataKey="count" radius={4} spacing={4}>
              {incidents.map((incident) => (
                <Cell key={incident.hour} fill={getHourColor(incident.count, maxCount)} />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                spacing={4}
                offset={16}
                fontSize={10}
                angle={-90}
                fill="var(--foreground)"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function CustomTooltipContent({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;

    if (!data) return null;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <div className="space-y-1">
          <div className="font-medium">{data.displayHour}</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground text-xs">Incidentes:</span>
              <span className="font-medium font-mono text-sm">{data.count}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
