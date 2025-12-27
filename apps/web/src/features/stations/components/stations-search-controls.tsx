"use client";

import { Input } from "@/features/shared/components/ui/input";
import { stationsSearchParamsParsers } from "@/features/stations/stations-search-params";
import { MagnifyingGlassIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useQueryStates } from "nuqs";
import { useEffect, useRef, useState, useTransition } from "react";

export function StationsSearchControls() {
  const [isPending, startTransition] = useTransition();
  const [showSpinner, setShowSpinner] = useState(false);
  const [{ q }, setParams] = useQueryStates(stationsSearchParamsParsers, {
    shallow: false,
    startTransition
  });
  const [inputValue, setInputValue] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  useEffect(() => {
    if (!isPending) {
      setShowSpinner(false);
      return;
    }

    const timeout = setTimeout(() => setShowSpinner(true), 500);
    return () => clearTimeout(timeout);
  }, [isPending]);

  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setParams({ q: value, page: 0 });
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full sm:w-72">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {showSpinner ? (
          <SpinnerIcon className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
        )}
      </div>
      <Input
        type="search"
        placeholder="Buscar por nombre..."
        className="pl-9"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
      />
    </div>
  );
}
