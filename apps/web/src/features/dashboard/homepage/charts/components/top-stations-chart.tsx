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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip
} from "@/features/shared/components/ui/chart";
import type { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

type TopDispatchedStations = Awaited<ReturnType<typeof getTopDispatchedStations>>;

interface TopDispatchedStationsChartProps {
  stations: TopDispatchedStations;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TopDispatchedStations[number];
  }>;
  label?: string;
}

const chartConfig = {
  responsible: {
    label: "Responsable",
    color: "var(--chart-1)"
  },
  support: {
    label: "Apoyo",
    color: "var(--chart-3)"
  }
} satisfies ChartConfig;

export function TopDispatchedStationsChart({ stations }: TopDispatchedStationsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estaciones más despachadas</CardTitle>
        <CardDescription>
          Estaciones con más despachos (responsable y apoyo) - Últimos 30 días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full font-mono">
          <BarChart
            accessibilityLayer
            data={stations}
            margin={{ left: 16, right: 16 }}
            layout="vertical"
          >
            <XAxis type="number" dataKey="total" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 8)}
            />
            <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
            <Bar
              dataKey="responsible"
              fill="var(--color-responsible)"
              radius={[4, 0, 0, 4]}
              stackId="a"
            />
            <Bar dataKey="support" fill="var(--color-support)" radius={[0, 4, 4, 0]} stackId="a">
              <LabelList
                dataKey="total"
                position="right"
                offset={8}
                fontSize={12}
                fill="var(--foreground)"
              />
            </Bar>
            <ChartLegend content={<ChartLegendContent />} />
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
          <div className="font-medium">
            {data.key} {data.name}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-1 rounded-[2px] bg-chart-1" />
              <span className="text-muted-foreground text-xs">Responsable:</span>
            </div>
            <span className="font-medium font-mono text-sm">{data.responsible}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-1 rounded-[2px] bg-chart-2" />
              <span className="text-muted-foreground text-xs">Apoyo:</span>
            </div>
            <span className="font-medium font-mono text-sm">{data.support}</span>
          </div>
          <div className="mt-2 border-t pt-2">
            <div className="flex items-center justify-between gap-4 font-semibold">
              <span className="text-xs">Total:</span>
              <span className="font-mono text-xs">{data.total}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
