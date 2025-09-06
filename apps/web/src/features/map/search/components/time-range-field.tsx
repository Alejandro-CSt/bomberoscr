"use client";

import { Button } from "@/features/shared/components/ui/button";
import { Calendar } from "@/features/shared/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/features/shared/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/features/shared/components/ui/popover";
import { cn } from "@/features/shared/lib/utils";
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears
} from "date-fns";
import { es } from "date-fns/locale";
import * as React from "react";

type Props = {
  name: string;
  label?: string;
  className?: string;
};

export function TimeRangeField({ name, label = "Rango de tiempo", className }: Props) {
  const today = new Date();
  const yesterday = { from: subDays(today, 1), to: subDays(today, 1) };
  const last7Days = { from: subDays(today, 6), to: today };
  const last30Days = { from: subDays(today, 29), to: today };
  const monthToDate = { from: startOfMonth(today), to: today };
  const lastMonth = {
    from: startOfMonth(subMonths(today, 1)),
    to: endOfMonth(subMonths(today, 1))
  };
  const yearToDate = { from: startOfYear(today), to: today };
  const lastYear = { from: startOfYear(subYears(today, 1)), to: endOfYear(subYears(today, 1)) };

  const [month, setMonth] = React.useState(today);

  return (
    <FormField
      name={name as never}
      render={({ field }) => {
        const selectedRange = {
          from: (field.value as { start?: Date; end?: Date } | undefined)?.start,
          to: (field.value as { start?: Date; end?: Date } | undefined)?.end
        };

        const rangeLabel = (() => {
          const from = selectedRange.from ? selectedRange.from.toLocaleDateString() : "";
          const to = selectedRange.to ? selectedRange.to.toLocaleDateString() : "";
          if (from && to) return `${from} – ${to}`;
          if (from) return `${from}`;
          return "Selecciona rango";
        })();

        return (
          <FormItem className={cn(className)}>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {rangeLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <div className="rounded-md border">
                    <div className="flex max-sm:flex-col">
                      <div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-32">
                        <div className="h-full sm:border-e">
                          <div className="flex flex-col px-2 max-sm:px-3">
                            <div className="space-y-1 max-sm:grid max-sm:max-h-48 max-sm:grid-cols-2 max-sm:gap-1 max-sm:space-y-0 max-sm:overflow-y-auto">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start max-sm:h-8 max-sm:text-xs"
                                onClick={() => {
                                  field.onChange({ start: today, end: today });
                                  setMonth(today);
                                }}
                              >
                                Hoy
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start max-sm:h-8 max-sm:text-xs"
                                onClick={() => {
                                  field.onChange({ start: yesterday.from, end: yesterday.to });
                                  setMonth(yesterday.to);
                                }}
                              >
                                Ayer
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start max-sm:h-8 max-sm:text-xs"
                                onClick={() => {
                                  field.onChange({ start: last7Days.from, end: last7Days.to });
                                  setMonth(last7Days.to);
                                }}
                              >
                                Últimos 7 días
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start max-sm:h-8 max-sm:text-xs"
                                onClick={() => {
                                  field.onChange({ start: last30Days.from, end: last30Days.to });
                                  setMonth(last30Days.to);
                                }}
                              >
                                Últimos 30 días
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start max-sm:h-8 max-sm:text-xs"
                                onClick={() => {
                                  field.onChange({ start: monthToDate.from, end: monthToDate.to });
                                  setMonth(monthToDate.to);
                                }}
                              >
                                Mes a la fecha
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start max-sm:h-8 max-sm:text-xs"
                                onClick={() => {
                                  field.onChange({ start: lastMonth.from, end: lastMonth.to });
                                  setMonth(lastMonth.to);
                                }}
                              >
                                Mes pasado
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start max-sm:h-8 max-sm:text-xs"
                                onClick={() => {
                                  field.onChange({ start: yearToDate.from, end: yearToDate.to });
                                  setMonth(yearToDate.to);
                                }}
                              >
                                Año a la fecha
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start max-sm:h-8 max-sm:text-xs"
                                onClick={() => {
                                  field.onChange({ start: lastYear.from, end: lastYear.to });
                                  setMonth(lastYear.to);
                                }}
                              >
                                Año pasado
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Calendar
                        mode="range"
                        selected={selectedRange}
                        captionLayout="dropdown"
                        startMonth={new Date(2020, 0)}
                        endMonth={endOfYear(today)}
                        showOutsideDays={false}
                        onSelect={(nuevo) => {
                          if (nuevo) {
                            field.onChange({
                              start: nuevo.from ?? undefined,
                              end: nuevo.to ?? undefined
                            });
                          }
                        }}
                        month={month}
                        onMonthChange={setMonth}
                        className="p-2"
                        locale={es}
                        disabled={[{ after: today }]}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
