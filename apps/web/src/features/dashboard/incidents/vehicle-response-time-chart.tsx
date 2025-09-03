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
import { formatSecondsToHMS, isUndefinedDate } from "@/features/shared/lib/utils";
import type { DetailedIncident } from "@bomberoscr/db/queries/incidentDetails";
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

      // If the incident is open and the vehicle has not returned, its "on-scene"
      // time is calculated up to the present moment.
      const isPendingReturn = isOpen && isUndefinedDate(baseReturnTime);
      const onSceneEndDate = isPendingReturn ? new Date() : departureTime;

      const onSceneTime = calculateTimeDiffInSeconds(onSceneEndDate, arrivalTime);

      // Return time is 0 if the vehicle is considered pending return.
      const returnTime = isPendingReturn
        ? 0
        : calculateTimeDiffInSeconds(baseReturnTime, departureTime);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desglose de tiempos por vehículo</CardTitle>
        <CardDescription>Tiempo de respuesta, en escena y de regreso a base</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={timeData} layout="vertical">
            <YAxis
              type="category"
              dataKey="vehicle"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              width={60}
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
              barSize={20}
            />
            <Bar
              stackId="a"
              dataKey="onSceneTime"
              fill="var(--color-onSceneTime)"
              radius={4}
              barSize={20}
            />
            <Bar
              stackId="a"
              dataKey="returnTime"
              fill="var(--color-returnTime)"
              radius={4}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  payload: Record<string, number | string>;
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
          {segments.map((seg) => (
            <div className="flex items-center justify-between gap-4" key={seg.key}>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-1 rounded-[2px] ${seg.className}`} />
                <span className="text-muted-foreground text-xs">{seg.label}:</span>
              </div>
              <span className="font-medium font-mono text-sm">
                {formatSecondsToHMS(Number(data[seg.key]) ?? 0)}
              </span>
            </div>
          ))}
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
