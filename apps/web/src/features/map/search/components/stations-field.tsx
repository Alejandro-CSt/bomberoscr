"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/features/shared/components/ui/form";
import MultipleSelector, { type Option } from "@/features/shared/components/ui/multiselect";
import { trpc } from "@/features/trpc/client";
import * as React from "react";

type Props = {
  name: string;
  label?: string;
};

export function StationsField({ name, label = "Estaciones" }: Props) {
  const { data, isLoading } = trpc.search.getOperativeStations.useQuery();

  const options = React.useMemo<Option[]>(() => {
    const list = data || [];
    const mapped = list.map((it) => ({ value: String(it.id), label: it.name }));
    return mapped.sort((a, b) => Number(a.value) - Number(b.value));
  }, [data]);

  return (
    <FormField
      name={name as never}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <MultipleSelector
              value={(() => {
                const selectedValues = (field.value as unknown as string[]) || [];
                return options.filter((o) => selectedValues.includes(o.value));
              })()}
              onChange={(selected) => field.onChange(selected.map((s) => s.value))}
              defaultOptions={options}
              options={options}
              placeholder={isLoading ? "Cargando..." : "Selecciona estaciones"}
              commandProps={{
                label: "Estaciones operativas",
                filter: (value: string, search: string) => {
                  const option = options.find((o) => o.value === value);
                  if (option) {
                    return option.label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                  }
                  return 0;
                }
              }}
              maxSelected={3}
              hidePlaceholderWhenSelected
              emptyIndicator={<p className="text-center text-sm">Sin resultados</p>}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default StationsField;
