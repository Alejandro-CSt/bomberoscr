"use client";

import { Drawer, DrawerContent } from "@/features/components/ui/drawer";
import { useMediaQuery } from "@/features/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { parseAsBoolean } from "nuqs";
import type React from "react";
import { useEffect } from "react";
import { Drawer as Vaul } from "vaul";

type ResponsiveDrawerProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  fullscreen?: boolean;
};

export const parseIsExpanded = parseAsBoolean.withDefault(false).withOptions({
  shallow: true
});

export function ResponsiveDrawer(props: ResponsiveDrawerProps) {
  const { children, isOpen, onClose, fullscreen } = props;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (isOpen)
      window.requestAnimationFrame(() => {
        document.body.style.pointerEvents = "auto";
      });
  }, [isOpen]);

  if (isDesktop)
    return (
      <Vaul.Root
        modal={false}
        open={isOpen}
        onClose={onClose}
        direction="bottom"
        shouldScaleBackground
        disablePreventScroll
        preventScrollRestoration={false}
        noBodyStyles
      >
        <Vaul.Portal>
          <Vaul.Content
            className={cn(
              "fixed bottom-2 left-2 z-10 flex h-full max-h-[70dvh] w-[410px] animate-none flex-col overflow-hidden rounded-lg bg-background outline-none",
              fullscreen && "max-h-[90dvh]"
            )}
            style={{ "--initial-transform": "calc(100% + 8px)" } as React.CSSProperties}
          >
            {children}
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    );

  return (
    <Drawer
      modal={false}
      open={isOpen}
      onClose={onClose}
      disablePreventScroll
      preventScrollRestoration={false}
      noBodyStyles
    >
      <DrawerContent
        className={cn(
          "flex h-full max-h-40 flex-col outline-none transition-all duration-300",
          fullscreen && "max-h-dvh"
        )}
      >
        {children}
      </DrawerContent>
    </Drawer>
  );
}
