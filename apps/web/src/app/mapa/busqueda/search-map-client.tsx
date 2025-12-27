"use client";

import { FloatingPanelHeader } from "@/features/map/layout/components/floating-panel-header";
import { IncidentTypesField } from "@/features/map/search/components/incident-types-field";
import { StationsField } from "@/features/map/search/components/stations-field";
import { TimeRangeField } from "@/features/map/search/components/time-range-field";
import { SearchIncidentsFormSchema } from "@/features/map/search/schemas";
import { useMapSettings } from "@/features/map/settings/hooks/use-map-settings";
import { Form } from "@/features/shared/components/ui/form";
import { trpc } from "@/features/trpc/client";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";

const formSchema = SearchIncidentsFormSchema;

export default function SearchMapPageClient() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      incidentTypeCodes: [],
      stationIds: [],
      timeRange: { start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), end: new Date() },
      bounds: null
    }
  });

  const {
    setHideRegularIncidents,
    setSearchResults,
    viewportBounds,
    searchResults,
    isSearching,
    setIsSearching
  } = useMapSettings();
  const utils = trpc.useUtils();

  useEffect(() => {
    setHideRegularIncidents(true);
    return () => {
      setHideRegularIncidents(false);
      setSearchResults([]);
    };
  }, [setHideRegularIncidents, setSearchResults]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setIsSearching(true);
      debounceRef.current = setTimeout(async () => {
        const payload = {
          ...data,
          bounds: viewportBounds,
          timeRange: {
            start: data.timeRange.start.toISOString(),
            end: data.timeRange.end.toISOString()
          }
        };
        const results = await utils.search.searchIncidents.fetch(payload);
        setSearchResults(results ?? []);
        setHideRegularIncidents(true);
        setIsSearching(false);
      }, 250);
    },
    [
      utils.search.searchIncidents,
      setSearchResults,
      setHideRegularIncidents,
      viewportBounds,
      setIsSearching
    ]
  );

  useEffect(() => {
    const subscription = form.watch(async () => {
      const values = form.getValues();
      await runSearch(values);
    });
    return () => subscription.unsubscribe();
  }, [form, form.getValues, form.watch, runSearch]);

  useEffect(() => {
    const values = form.getValues();
    void runSearch(values);
  }, [runSearch, form.getValues]);

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col overflow-y-auto">
      <FloatingPanelHeader
        title="Búsqueda"
        subtitle={(() => {
          if (isSearching) return "Buscando...";
          const count = searchResults.length;
          if (count === 0) return "No se encontraron resultados.";
          if (count === 500) return "500+ incidentes encontrados";
          return `${count} incidentes encontrados.`;
        })()}
      />
      <Form {...form}>
        <form className="space-y-4 p-4">
          <IncidentTypesField
            control={form.control}
            errors={form.formState.errors}
            name="incidentTypeCodes"
          />
          <StationsField control={form.control} errors={form.formState.errors} name="stationIds" />
          <TimeRangeField control={form.control} errors={form.formState.errors} name="timeRange" />
        </form>
      </Form>
    </div>
  );
}
