"use client";

import { cn } from "@/features/shared/lib/utils";
import type { HTMLAttributes } from "react";

type DotsLoaderProps = {
  size?: "sm" | "md" | "lg";
} & HTMLAttributes<HTMLDivElement>;

export function DotsLoader({ size = "md", className, ...props }: DotsLoaderProps) {
  const dotSize = size === "sm" ? "size-1.5" : size === "lg" ? "size-3" : "size-2";
  const gap = size === "sm" ? "gap-1" : size === "lg" ? "gap-2.5" : "gap-2";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando"
      className={cn("inline-flex items-end", gap, className)}
      {...props}
    >
      <span
        className={cn("inline-block animate-bounce rounded-full bg-current", dotSize)}
        style={{ animationDelay: "0ms" }}
      />
      <span
        className={cn("inline-block animate-bounce rounded-full bg-current", dotSize)}
        style={{ animationDelay: "120ms" }}
      />
      <span
        className={cn("inline-block animate-bounce rounded-full bg-current", dotSize)}
        style={{ animationDelay: "240ms" }}
      />
    </div>
  );
}
