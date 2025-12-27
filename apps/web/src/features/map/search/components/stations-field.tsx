"use client";

import { Field, FieldError, FieldLabel } from "@/features/shared/components/ui/field";
import MultipleSelector, { type Option } from "@/features/shared/components/ui/multiselect";
import { trpc } from "@/features/trpc/client";
import * as React from "react";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";

type Props = {
  name: string;
  label?: string;
  control: Control<any>;
  errors?: FieldErrors<any>;
};

export function StationsField({ name, control, errors, label = "Estaciones" }: Props) {
  const { data, isLoading } = trpc.search.getOperativeStations.useQuery();

  const options = React.useMemo<Option[]>(() => {
    const list = data || [];
    const mapped = list.map((it) => ({ value: String(it.id), label: it.name }));
    return mapped.sort((a, b) => Number(a.value) - Number(b.value));
  }, [data]);

  const errorBag = (errors ?? {}) as Record<string, { message?: string } | undefined>;

  return (
    <Controller
      control={control}
      name={name as never}
      render={({ field }) => {
        const errorMessage = errorBag[name]?.message;
        return (
          <Field>
            {label ? <FieldLabel>{label}</FieldLabel> : null}
            <div data-slot="field-control">
              <MultipleSelector
                value={(() => {
                  const selectedValues = (field.value as unknown as string[]) || [];
                  return options.filter((o) => selectedValues.includes(o.value));
                })()}
                onChange={(selected) => field.onChange(selected.map((s) => s.value))}
                defaultOptions={options}
                options={options}
                placeholder={isLoading ? "Cargando..." : "Selecciona estaciones"}
                maxSelected={3}
                hidePlaceholderWhenSelected
                emptyIndicator={<p className="text-center text-sm">Sin resultados</p>}
              />
            </div>
            {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
          </Field>
        );
      }}
    />
  );
}

export default StationsField;
