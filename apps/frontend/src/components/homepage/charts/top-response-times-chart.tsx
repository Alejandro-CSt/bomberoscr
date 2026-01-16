import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatMinutesToHMS } from "@/lib/utils";

import type { GetStatsTopResponseTimesResponse } from "@/lib/api/types.gen";

type TopResponseTimesStations = GetStatsTopResponseTimesResponse;

interface TopResponseTimesStationsChartProps {
  stations: TopResponseTimesStations;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TopResponseTimesStations[number];
  }>;
  label?: string;
}

const chartConfig = {
  avgResponseTimeMinutes: {
    label: "Tiempo de respuesta promedio (min)",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig;

const getCategoryColor = (category: string) => {
  switch (category) {
    case "fastest":
      return "var(--chart-1)";
    case "slowest":
      return "var(--chart-5)";
    case "average":
      return "var(--chart-2)";
    default:
      return "var(--chart-3)";
  }
};

export function TopResponseTimesStationsChart({ stations }: TopResponseTimesStationsChartProps) {
  const sortedStations = [...stations].sort((a, b) => {
    const categoryOrder = { fastest: 0, average: 1, slowest: 2 };
    const aOrder = categoryOrder[a.category as keyof typeof categoryOrder] ?? 3;
    const bOrder = categoryOrder[b.category as keyof typeof categoryOrder] ?? 3;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    if (a.category === "fastest" || a.category === "slowest") {
      return a.avgResponseTimeMinutes - b.avgResponseTimeMinutes;
    }

    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tiempos de respuesta</CardTitle>
        <CardDescription>
          Las 3 estaciones mas rapidas, mas lentas y promedio nacional - Ultimos 365 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="w-full font-mono">
          <BarChart
            accessibilityLayer
            data={sortedStations}
            margin={{ left: 16, right: 16 }}
            layout="vertical">
            <XAxis
              type="number"
              dataKey="avgResponseTimeMinutes"
              hide
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 8)}
            />
            <ChartTooltip
              cursor={false}
              content={<CustomTooltipContent />}
            />
            <Bar
              dataKey="avgResponseTimeMinutes"
              radius={4}>
              {sortedStations.map((station) => (
                <Cell
                  key={`${station.category}-${station.key || station.name}`}
                  fill={getCategoryColor(station.category)}
                />
              ))}
              <LabelList
                dataKey="avgResponseTimeMinutes"
                position="right"
                offset={8}
                fontSize={12}
                fill="var(--foreground)"
                formatter={(value: number) => formatMinutesToHMS(value)}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          No incluye tiempos de respuesta menores a 1 minuto ni estaciones con menos de 10
          despachos.
        </p>
      </CardFooter>
    </Card>
  );
}

function CustomTooltipContent({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;

    if (!data) return null;

    const categoryLabels = {
      fastest: "Mas rapida",
      slowest: "Mas lenta",
      average: "Promedio nacional"
    };

    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <div className="space-y-1">
          <div className="font-medium">
            {data.key && `${data.key} `}
            {data.name}
          </div>
          {data.category !== "average" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div
                className="h-3 w-1 rounded-[2px]"
                style={{ backgroundColor: getCategoryColor(data.category) }}
              />
              <span>{categoryLabels[data.category as keyof typeof categoryLabels]}</span>
            </div>
          )}
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Tiempo promedio:</span>
              <span className="font-mono text-sm font-medium">
                {formatMinutesToHMS(Number(data.avgResponseTimeMinutes) ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Mas rapido:</span>
              <span className="font-mono text-sm font-medium">
                {formatMinutesToHMS(Number(data.fastestResponseMinutes) ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Mas lento:</span>
              <span className="font-mono text-sm font-medium">
                {formatMinutesToHMS(Number(data.slowestResponseMinutes) ?? 0)}
              </span>
            </div>
            <div className="mt-2 border-t pt-2">
              <div className="flex items-center justify-between gap-4 font-semibold">
                <span className="text-xs">Despachos:</span>
                <span className="font-mono text-xs">{data.totalDispatches}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
