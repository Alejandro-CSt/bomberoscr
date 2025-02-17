"use client";

import { Button } from "@/features/components/ui/button";
import { useMediaQuery } from "@/features/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ChevronsDownIcon, ChevronsUpIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";

interface ResponsiveDrawerProps {
  children?: React.ReactNode;
  isOpen: boolean;
  onCloseAction?: () => void;
  direction?: "left" | "bottom";
  snapPoints?: Array<string | number> | null;
  title?: string;
  isNested?: boolean;
}

export function ResponsiveDrawer({
  children,
  isOpen,
  onCloseAction,
  direction,
  snapPoints = ["384px", 1],
  title,
  isNested = false
}: ResponsiveDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(snapPoints?.[0] || null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (isOpen)
      window.requestAnimationFrame(() => {
        document.body.style.pointerEvents = "auto";
      });
  }, [isOpen]);

  useEffect(() => {
    if (snap !== 1) {
      contentRef.current?.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [snap]);

  const hasNextSnap = () =>
    snapPoints && snap ? snapPoints.indexOf(snap) < snapPoints.length - 1 : false;

  const handleCycleSnap = () => {
    if (!snapPoints || !snap) return;
    if (hasNextSnap()) {
      setSnap(snapPoints[snapPoints.indexOf(snap) + 1]);
    } else {
      setSnap(snapPoints[0]);
    }
  };

  return (
    <Drawer.Root
      open={isOpen}
      {...(onCloseAction && { onClose: onCloseAction })}
      direction={isDesktop ? "left" : direction || "bottom"}
      {...(!isDesktop && snapPoints
        ? {
            snapPoints: snapPoints,
            activeSnapPoint: snap,
            setActiveSnapPoint: setSnap,
            handleOnly: false
          }
        : {})}
      modal={false}
      disablePreventScroll
      preventScrollRestoration={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          data-testid="content"
          className={cn(
            isDesktop
              ? "fixed top-2 right-auto bottom-2 left-2 z-20 flex max-h-dvh w-[384px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-background outline-none"
              : "fixed right-0 bottom-0 left-0 z-20 flex h-[97dvh] flex-col overflow-hidden rounded-t-xl border border-gray-200 border-b-none bg-background outline-none",
            isNested ? (isDesktop ? "max-h-[93dvh]" : "w-[354px]") : ""
          )}
        >
          <div ref={contentRef} className={cn("mx-auto flex h-full w-full max-w-md flex-col")}>
            <Drawer.Handle
              style={
                {
                  all: "unset",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0px",
                  padding: "1rem",
                  minHeight: "2.5rem",
                  borderBottom: "1px solid #E5E7EB",
                  position: "sticky",
                  zIndex: 30,
                  backgroundColor: "#FFF",
                  opacity: 1
                } as React.CSSProperties
              }
              preventCycle
            >
              <div className="mx-auto mt-2 min-h-2 w-[100px] rounded-full bg-muted md:hidden" />
              <div className="flex h-full items-center justify-between px-4 py-2">
                <Drawer.Title className="w-full whitespace-nowrap font-medium text-xl leading-none tracking-tight">
                  {title}
                </Drawer.Title>
                <div className="flex w-full items-center justify-end">
                  {snapPoints && (
                    <Button variant="ghost" onClick={handleCycleSnap}>
                      <span className="sr-only">Cambiar tamaño</span>
                      {hasNextSnap() ? (
                        <ChevronsUpIcon className="size-5" />
                      ) : (
                        <ChevronsDownIcon className="size-5" />
                      )}
                    </Button>
                  )}
                  <Drawer.Close asChild>
                    <Button variant="ghost" onClick={onCloseAction}>
                      <XIcon className="size-5" />
                      <span className="sr-only">Cerrar</span>
                    </Button>
                  </Drawer.Close>
                </div>
              </div>
            </Drawer.Handle>
            <div
              className={cn(
                "flex flex-col px-4 pt-4",
                snap === 1 ? "overflow-y-auto" : "overflow-hidden"
              )}
            >
              {children}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
