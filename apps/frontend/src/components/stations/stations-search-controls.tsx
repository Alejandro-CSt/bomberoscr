import { MagnifyingGlass, SpinnerGap } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";

interface StationsSearchControlsProps {
  value: string;
  onChange: (value: string) => void;
  isPending?: boolean;
}

export function StationsSearchControls({
  value,
  onChange,
  isPending
}: StationsSearchControlsProps) {
  return (
    <div className="relative w-full sm:w-72">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {isPending ? (
          <SpinnerGap
            className="size-4 animate-spin text-muted-foreground"
            weight="bold"
          />
        ) : (
          <MagnifyingGlass
            className="size-4 text-muted-foreground"
            weight="bold"
          />
        )}
      </div>
      <Input
        className="pl-9"
        placeholder="Buscar por nombre..."
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
