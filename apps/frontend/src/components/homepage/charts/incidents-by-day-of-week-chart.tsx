import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";

import type { getStatsIncidentsByDayOfWeek } from "@/lib/api/sdk.gen";

type IncidentsByDayOfWeek = Awaited<ReturnType<typeof getStatsIncidentsByDayOfWeek>>;

interface IncidentsByDayOfWeekChartProps {
  incidents: IncidentsByDayOfWeek;
  timeRange?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: IncidentsByDayOfWeek[number];
  }>;
  label?: string;
}

const chartConfig = {
  count: {
    label: "Numero de incidentes",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig;

const getDayColor = (count: number, maxCount: number) => {
  if (maxCount === 0) return "var(--chart-1)";

  const ratio = count / maxCount;

  if (ratio <= 0.2) return "var(--chart-1)";
  if (ratio <= 0.4) return "var(--chart-2)";
  if (ratio <= 0.6) return "var(--chart-3)";
  if (ratio <= 0.8) return "var(--chart-4)";
  return "var(--chart-5)";
};

const getTimeRangeLabel = (days: number) => {
  if (days === 7) return "7 dias";
  if (days === 30) return "30 dias";
  if (days === 90) return "90 dias";
  if (days === 365) return "365 dias";
  return `${days} dias`;
};

export function IncidentsByDayOfWeekChart({
  incidents,
  timeRange = 30
}: IncidentsByDayOfWeekChartProps) {
  const maxCount = Math.max(...incidents.map((incident) => incident.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incidentes por dia de la semana</CardTitle>
        <CardDescription>
          Distribucion de incidentes por dia - Ultimos {getTimeRangeLabel(timeRange)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="w-full font-mono">
          <BarChart
            accessibilityLayer
            data={incidents}
            layout="horizontal">
            <XAxis
              dataKey="dayOfWeek"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              hide
            />
            <ChartTooltip
              cursor={false}
              content={<CustomTooltipContent />}
            />
            <Bar
              dataKey="count"
              radius={4}>
              {incidents.map((incident) => (
                <Cell
                  key={incident.dayOfWeek}
                  fill={getDayColor(incident.count, maxCount)}
                />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                offset={8}
                fontSize={12}
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
          <div className="font-medium">{data.dayOfWeek}</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Incidentes:</span>
              <span className="font-mono text-sm font-medium">{data.count}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
