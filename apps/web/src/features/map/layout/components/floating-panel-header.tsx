"use client";

import { useFloatingPanel } from "@/features/map/layout/components/floating-panel";
import { Button } from "@/features/shared/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

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
      <div className="flex shrink-0 items-center gap-2 self-start">
        {isMobile && (
          <Button type="button" onClick={toggleCollapsed} variant="ghost" size="icon">
            {collapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
            <span className="sr-only">{collapsed ? "Expandir panel" : "Colapsar panel"}</span>
          </Button>
        )}
        <Button asChild variant="ghost" size="icon">
          <Link href="/mapa">
            <XIcon />
            <span className="sr-only">Cerrar</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
