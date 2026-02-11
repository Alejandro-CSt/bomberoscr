import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";

import type { GetIncidentsByHourResponse } from "@/lib/api/types.gen";

type IncidentsByHour = GetIncidentsByHourResponse;

interface IncidentsByHourChartProps {
  incidents: IncidentsByHour;
  timeRange?: number;
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
    label: "Numero de incidentes",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig;

const getHourColor = (count: number, maxCount: number) => {
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

export function IncidentsByHourChart({ incidents, timeRange = 30 }: IncidentsByHourChartProps) {
  const maxCount = Math.max(...incidents.map((incident) => incident.count));

  return (
    <section className="flex flex-col gap-4">
      <header className="space-y-1">
        <h3 className="text-lg leading-none font-semibold">Incidentes por hora del dia</h3>
        <p className="text-sm text-muted-foreground">
          Distribucion de incidentes por hora - Ultimos {getTimeRangeLabel(timeRange)}
        </p>
      </header>
      <div>
        <ChartContainer
          config={chartConfig}
          className="w-full font-mono">
          <BarChart
            accessibilityLayer
            data={incidents}
            margin={{ right: 16, top: 30 }}
            layout="horizontal">
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
                  key={incident.hour}
                  fill={getHourColor(incident.count, maxCount)}
                />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                offset={16}
                fontSize={10}
                angle={-90}
                fill="var(--foreground)"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </section>
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
