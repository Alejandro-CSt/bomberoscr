import { MagnifyingGlass } from "@phosphor-icons/react";
import { useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";

import { stationsSearchParamsParsers } from "@/components/stations/stations-directory-search-params";
import { Input } from "@/components/ui/input";

export function StationsDirectorySearchControls() {
  const [{ q }, setParams] = useQueryStates(stationsSearchParamsParsers, {
    shallow: true
  });
  const [inputValue, setInputValue] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setParams({ q: value || null, page: 0 });
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
        <MagnifyingGlass
          className="size-4 text-muted-foreground"
          weight="bold"
        />
      </div>
      <Input
        className="pl-9"
        placeholder="Buscar por nombre..."
        type="search"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
      />
    </div>
  );
}
