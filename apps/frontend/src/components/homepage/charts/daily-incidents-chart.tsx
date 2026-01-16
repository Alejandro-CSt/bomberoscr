import { Area, AreaChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip
} from "@/components/ui/chart";

import type { getStatsDailyIncidents } from "@/lib/api/sdk.gen";

type DailyIncidents = Awaited<ReturnType<typeof getStatsDailyIncidents>>;

interface DailyIncidentsChartProps {
  incidents: DailyIncidents;
  timeRange?: number;
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
    label: "Periodo actual",
    color: "var(--chart-1)"
  },
  previous: {
    label: "Periodo anterior",
    color: "var(--chart-3)"
  }
} satisfies ChartConfig;

const getTimeRangeLabel = (days: number) => {
  if (days === 7) return "7 dias";
  if (days === 30) return "30 dias";
  if (days === 90) return "90 dias";
  if (days === 365) return "365 dias";
  return `${days} dias`;
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

export function DailyIncidentsChart({ incidents, timeRange = 30 }: DailyIncidentsChartProps) {
  const { data, summary } = incidents;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Incidentes diarios</CardTitle>
        <CardDescription>
          Comparacion de incidentes por dia - {getTimeRangeLabel(timeRange)} actual vs anterior
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <ChartContainer
          config={chartConfig}
          className="max-h-[300px] w-full font-mono">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ right: 16 }}>
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
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<CustomTooltipContent />}
            />
            <Area
              dataKey="previous"
              type="monotone"
              fill="var(--color-previous)"
              fillOpacity={0.05}
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
        <div className="flex gap-2 leading-none font-medium">
          <span>Total actual: {summary.currentTotal}</span>
          <span>-</span>
          <span>Total anterior: {summary.previousTotal}</span>
          <span>-</span>
          <span className={getChangeColor(summary.percentageChange)}>
            {formatChange(summary.percentageChange)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

function CustomTooltipContent({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

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
                <span className="text-xs text-muted-foreground">Periodo actual:</span>
              </div>
              <span className="font-mono text-sm font-medium">{currentData.value}</span>
            </div>
          )}
          {previousData && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-1 rounded-[2px] bg-chart-3" />
                <span className="text-xs text-muted-foreground">Periodo anterior:</span>
              </div>
              <span className="font-mono text-sm font-medium">{previousData.value}</span>
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
