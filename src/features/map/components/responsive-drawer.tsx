"use client";

import { Drawer, DrawerContent } from "@/features/components/ui/drawer";
import { useMediaQuery } from "@/features/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Drawer as Vaul } from "vaul";

type ResponsiveDrawerProps = {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function ResponsiveDrawer(props: ResponsiveDrawerProps) {
  const { children, isOpen, setIsOpen } = props;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (isOpen)
      window.requestAnimationFrame(() => {
        document.body.style.pointerEvents = "auto";
      });
  }, [isOpen]);

  if (isDesktop)
    return (
      <Vaul.Root modal={false} open={isOpen} onOpenChange={setIsOpen} direction="left">
        <Vaul.Portal>
          <Vaul.Content
            className={cn(
              "fixed bottom-2 left-2 z-10 flex h-full max-h-[50dvh] w-[310px] flex-col overflow-hidden rounded-lg bg-background outline-none"
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
      onOpenChange={setIsOpen}
      disablePreventScroll
      preventScrollRestoration={false}
      noBodyStyles
    >
      <DrawerContent className="h-full max-h-[45vh] outline-none">{children}</DrawerContent>
    </Drawer>
  );
}
