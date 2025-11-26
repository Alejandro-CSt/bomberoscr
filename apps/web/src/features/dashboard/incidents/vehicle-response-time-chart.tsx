"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/features/shared/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip
} from "@/features/shared/components/ui/chart";
import { cn, formatSecondsToHMS, isUndefinedDate } from "@/features/shared/lib/utils";
import type { DetailedIncident } from "@bomberoscr/db/queries/incidents";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  responseTime: {
    label: "Tiempo de respuesta",
    color: "var(--chart-1)",
    className: "bg-chart-1"
  },
  onSceneTime: {
    label: "Tiempo en escena",
    color: "var(--chart-2)",
    className: "bg-chart-2"
  },
  returnTime: {
    label: "Tiempo de regreso",
    color: "var(--chart-3)",
    className: "bg-chart-3"
  }
} satisfies ChartConfig & {
  [key: string]: { className: string };
};

/**
 * Calculates the time difference between two dates in seconds.
 *
 * @param end   - The end date/time.
 * @param start - The start date/time.
 * @returns The difference in seconds, or `0` if either date is invalid.
 */
const calculateTimeDiffInSeconds = (end?: Date, start?: Date): number => {
  if (!end || !start || isUndefinedDate(end) || isUndefinedDate(start)) {
    return 0;
  }
  return Math.floor((end.getTime() - start.getTime()) / 1000);
};

export function VehicleResponseTimeChart({
  vehicles,
  isOpen
}: {
  vehicles: NonNullable<DetailedIncident>["dispatchedVehicles"];
  isOpen: boolean;
}) {
  const timeData = vehicles
    .flatMap((vehicle) => {
      const { dispatchedTime, arrivalTime, departureTime, baseReturnTime } = vehicle;

      const responseTime = calculateTimeDiffInSeconds(arrivalTime, dispatchedTime);

      const hasDeparture = !!departureTime && !isUndefinedDate(departureTime);
      const hasReturn = !!baseReturnTime && !isUndefinedDate(baseReturnTime);

      const onSceneEndDate = hasDeparture ? departureTime : isOpen ? new Date() : undefined;
      const onSceneTime = calculateTimeDiffInSeconds(onSceneEndDate, arrivalTime);

      const isEnRoute = hasDeparture && !hasReturn;
      const returnTime =
        hasDeparture && hasReturn ? calculateTimeDiffInSeconds(baseReturnTime, departureTime) : 0;

      const totalTime = responseTime + onSceneTime + returnTime;

      if (totalTime === 0) {
        return [];
      }

      return [
        {
          id: vehicle.id,
          vehicle: vehicle.vehicle?.internalNumber || "N/A",
          station: vehicle.station.name,
          responseTime,
          onSceneTime,
          returnTime,
          isEnRoute,
          totalTime
        }
      ];
    })
    .sort((a, b) => a.totalTime - b.totalTime);

  if (timeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Desglose de tiempos por vehículo</CardTitle>
          <CardDescription>No hay datos de tiempo disponibles</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartHeight = 125 + timeData.length * 35;

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
      <BarChart accessibilityLayer data={timeData} layout="vertical">
        <YAxis
          type="category"
          dataKey="vehicle"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => (value.length > 6 ? `${value.slice(0, 6)}...` : value)}
          width={70}
          textAnchor="end"
        />
        <XAxis
          type="number"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => formatSecondsToHMS(Number(value))}
        />
        <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          stackId="a"
          dataKey="responseTime"
          fill="var(--color-responseTime)"
          radius={4}
          barSize={8}
        />
        <Bar
          stackId="a"
          dataKey="onSceneTime"
          fill="var(--color-onSceneTime)"
          radius={4}
          barSize={8}
        />
        <Bar
          stackId="a"
          dataKey="returnTime"
          fill="var(--color-returnTime)"
          radius={4}
          barSize={8}
        />
      </BarChart>
    </ChartContainer>
  );
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  payload: Record<string, number | string | boolean>;
}

interface CustomTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltipContent({ active, payload }: CustomTooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const vehicleLabel = `${data.vehicle} ${data.station}`;

  const segments = [
    { key: "responseTime", ...chartConfig.responseTime },
    { key: "onSceneTime", ...chartConfig.onSceneTime },
    { key: "returnTime", ...chartConfig.returnTime }
  ];

  return (
    <div className="min-w-[220px] rounded-lg border bg-background p-3 shadow-sm">
      <div className="space-y-1">
        <div className="font-medium">{vehicleLabel}</div>
        <div className="space-y-1">
          {segments.map((seg) => {
            const isReturnSegment = seg.key === "returnTime";
            const isEnRoute = Boolean(data.isEnRoute);
            const valueSeconds = Number(data[seg.key]) ?? 0;
            return (
              <div className="flex items-center justify-between gap-4" key={seg.key}>
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-1 rounded-[2px]", seg.className)} />
                  <span className="text-muted-foreground text-xs">{seg.label}:</span>
                </div>
                <span className="font-medium font-mono text-sm">
                  {isReturnSegment && isEnRoute ? "En camino" : formatSecondsToHMS(valueSeconds)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between gap-4 border-t pt-2">
          <span className="font-semibold text-xs">Total:</span>
          <span className="font-mono font-semibold text-xs">
            {formatSecondsToHMS(Number(data.totalTime) ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
