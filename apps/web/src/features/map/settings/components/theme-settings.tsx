"use client";

import { Label } from "@/features/shared/components/ui/label";
import { cn } from "@/features/shared/lib/utils";
import { useTheme } from "next-themes";
import Image from "next/image";

export const ThemeSettings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <Label className="font-medium text-sm">Estilo del mapa</Label>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className={cn(
            "flex flex-1 flex-col items-center gap-2 rounded-lg p-2 transition-all",
            theme === "light" ? "ring-2 ring-primary" : "hover:bg-muted"
          )}
          onClick={() => {
            setTheme("light");
          }}
        >
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src="/bomberos/light-map.png"
              alt="Vista clara del mapa"
              width={160}
              height={112}
              quality={95}
              className="h-28 w-full object-cover"
            />
          </div>
          <span className="font-medium text-foreground text-xs">Claro</span>
        </button>
        <button
          type="button"
          className={cn(
            "gtransition-all flex flex-1 flex-col items-center gap-2 rounded-lg p-2",
            theme === "dark" ? "ring-2 ring-primary" : "hover:bg-muted"
          )}
          onClick={() => {
            setTheme("dark");
          }}
        >
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src="/bomberos/dark-map.png"
              alt="Vista oscura del mapa"
              width={160}
              height={112}
              className="h-28 w-full object-cover"
            />
          </div>
          <span className="font-medium text-foreground text-xs">Oscuro</span>
        </button>
      </div>
    </div>
  );
};
