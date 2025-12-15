"use client";

import { Button } from "@/features/shared/components/ui/button";
import { RelativeTime } from "@/features/shared/components/ui/relative-time";
import { cn } from "@/features/shared/lib/utils";
import { SirenIcon } from "lucide-react";
import { useState } from "react";

interface OpenIncidentBannerProps {
  modifiedAt: string;
  className?: string;
}

export default function OpenIncidentBanner({ modifiedAt, className }: OpenIncidentBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside
      // biome-ignore lint/a11y/useSemanticElements: banner
      role="status"
      aria-live="polite"
      className={cn("rounded-md border bg-background px-4 py-3 shadow-lg", className)}
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/80"
            aria-hidden="true"
          >
            <SirenIcon size={16} />
          </div>
          <div className="space-y-0.5">
            <p className="font-medium text-sm">Incidente en progreso</p>
            <p className="text-muted-foreground text-sm">
              Actualizado por última vez <RelativeTime date={modifiedAt} />
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsVisible(false)}
          aria-label="Cerrar anuncio"
        >
          Entendido
        </Button>
      </div>
    </aside>
  );
}
