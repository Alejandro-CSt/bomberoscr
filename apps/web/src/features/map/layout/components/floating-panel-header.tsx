"use client";

import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useFloatingPanel } from "./floating-panel";

export function FloatingPanelHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { setHeaderHeight, toggleCollapsed, collapsed, isMobile } = useFloatingPanel();
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const el = headerRef.current;
    const measure = () => setHeaderHeight(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("orientationchange", measure);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("resize", measure);
    };
  }, [setHeaderHeight]);

  return (
    <div
      ref={headerRef}
      className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b bg-card p-4"
    >
      <div className="flex min-w-0 flex-col">
        <h1 className="truncate font-medium text-xl">{title}</h1>
        {subtitle && <p className="line-clamp-2 text-muted-foreground text-xs">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isMobile && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {collapsed ? (
              <ChevronUpIcon className="size-4" />
            ) : (
              <ChevronDownIcon className="size-4" />
            )}
            <span className="sr-only">{collapsed ? "Expandir panel" : "Colapsar panel"}</span>
          </button>
        )}
        <Link
          href="/mapa"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Cerrar</span>
        </Link>
      </div>
    </div>
  );
}
