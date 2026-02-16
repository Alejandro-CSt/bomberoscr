import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CircleHelpIcon } from "lucide-react";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { getDailyResponseTimesOptions } from "@/lib/api/@tanstack/react-query.gen";
import { formatMinutesToHMS } from "@/lib/utils";
import {
  ALLOWED_TIME_RANGE_VALUES,
  DEFAULT_TIME_RANGE,
  Route,
  TIME_RANGE_LABELS
} from "@/routes/_dashboard/index";

type DailyResponseTimeDatum = {
  date: Date;
  label: string;
  avgResponseMinutes: number;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: DailyResponseTimeDatum;
  }>;
}

const chartConfig = {
  avgResponseMinutes: {
    label: "Tiempo promedio",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig;

const dayFormatter = new Intl.DateTimeFormat("es-CR", {
  day: "numeric",
  month: "short",
  timeZone: "America/Costa_Rica"
});

function parseDateInCostaRica(dateString: string) {
  return new Date(`${dateString}T00:00:00-06:00`);
}

function getTickStep(timeRange: number) {
  if (timeRange <= 7) return 1;
  if (timeRange <= 30) return 5;
  if (timeRange <= 90) return 14;
  return 30;
}

export function DailyResponseTimesLineChart() {
  const { dailyResponseTimesTimeRange } = Route.useSearch();
  const selectedTimeRange = dailyResponseTimesTimeRange ?? DEFAULT_TIME_RANGE;

  const { data, isLoading, isError } = useQuery({
    ...getDailyResponseTimesOptions({
      query: {
        timeRange: selectedTimeRange
      }
    }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000
  });

  const chartData = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.data.map((item) => {
      const date = parseDateInCostaRica(item.date);

      return {
        date,
        label: dayFormatter.format(date),
        avgResponseMinutes: Number((item.averageResponseTimeSeconds / 60).toFixed(1))
      } satisfies DailyResponseTimeDatum;
    });
  }, [data]);

  const tickStep = useMemo(() => getTickStep(selectedTimeRange), [selectedTimeRange]);

  return (
    <section className="flex flex-col gap-0">
      <div className="grid grid-cols-1 gap-0 xl:grid-cols-3">
        <div className="xl:col-span-3">
          <div className="border border-t-0 border-zinc-800/70 bg-card">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 max-lgx:py-2">
              <h2 className="text-sm font-semibold tracking-wide uppercase">
                Tiempos de respuesta
              </h2>

              <Tabs value={String(selectedTimeRange)}>
                <TabsList
                  variant="underline"
                  className="h-8">
                  {ALLOWED_TIME_RANGE_VALUES.map((value) => (
                    <TabsTab
                      key={value}
                      value={String(value)}
                      render={
                        <Link
                          to="."
                          search={(prev) => ({
                            ...prev,
                            dailyResponseTimesTimeRange:
                              value === DEFAULT_TIME_RANGE ? undefined : value
                          })}
                          replace
                          resetScroll={false}
                        />
                      }
                      className="rounded-none border-none px-3 py-1.5 text-sm">
                      {TIME_RANGE_LABELS[value]}
                    </TabsTab>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {isLoading ? (
              <div className="h-[320px] w-full px-2 pb-2 sm:px-3 sm:pb-3">
                <Skeleton className="h-full w-full bg-zinc-800" />
              </div>
            ) : isError ? (
              <div className="flex h-[320px] items-center justify-center px-4 pb-4 text-sm text-muted-foreground">
                No se pudieron cargar los tiempos de respuesta.
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center px-4 pb-4 text-sm text-muted-foreground">
                No hay datos de tiempos de respuesta para este periodo.
              </div>
            ) : (
              <ChartContainer
                config={chartConfig}
                className="max-h-[320px] w-full px-2 pb-2 font-mono sm:px-3 sm:pb-3">
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 12, right: 12, bottom: 6, left: 0 }}>
                  <defs>
                    <linearGradient
                      id="fillAvgResponseMinutes"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-avgResponseMinutes)"
                        stopOpacity={0.6}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-avgResponseMinutes)"
                        stopOpacity={0.08}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value, index) => {
                      if (index % tickStep === 0 || index === chartData.length - 1) {
                        return value;
                      }

                      return "";
                    }}
                  />
                  <ChartTooltip
                    cursor={{ stroke: "var(--color-avgResponseMinutes)", strokeOpacity: 0.25 }}
                    content={<CustomTooltipContent />}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgResponseMinutes"
                    stroke="var(--color-avgResponseMinutes)"
                    fill="url(#fillAvgResponseMinutes)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "var(--color-avgResponseMinutes)",
                      stroke: "var(--background)",
                      strokeWidth: 2
                    }}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomTooltipContent({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const point = payload[0]?.payload;

  if (!point) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="space-y-1">
        <div className="font-medium">{point.label}</div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">Tiempo promedio:</span>
          <span className="font-mono text-sm font-medium">
            {formatMinutesToHMS(point.avgResponseMinutes)}
          </span>
        </div>
      </div>
    </div>
  );
}
