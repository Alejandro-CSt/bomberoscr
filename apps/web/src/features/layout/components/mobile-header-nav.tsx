"use client";

import { navItems } from "@/features/layout/components/nav-items";
import { Button } from "@/features/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/features/shared/components/ui/popover";
import { cn } from "@/features/shared/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import React, { Suspense } from "react";

const enabledNavItems = navItems.filter((item) => item.enabled);

function MobileHeaderNavInner({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      if (open) {
        setOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open]);

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/";
    }
    return pathname.includes(url);
  };

  return (
    <nav className={className}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            className="extend-touch-target !p-0 h-8 touch-manipulation items-center justify-start gap-2.5 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent"
            variant="ghost"
          >
            <div className="relative flex h-8 w-4 items-center justify-center">
              <div className="relative size-4">
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
                    open ? "-rotate-45 top-[0.4rem]" : "top-1"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
                    open ? "top-[0.4rem] rotate-45" : "top-2.5"
                  )}
                />
              </div>
              <span className="sr-only">Toggle Menu</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          alignOffset={-8}
          className="no-scrollbar h-[calc(100dvh-var(--app-header-height))] w-screen max-w-none overflow-y-auto rounded-none border-none bg-background/90 p-0 shadow-none backdrop-blur duration-100"
          side="bottom"
          sideOffset={8}
        >
          <div className="flex flex-col gap-6 overflow-auto px-6 py-6">
            <div className="flex flex-col gap-3">
              {enabledNavItems.map((item) => (
                <MobileLink href={item.url as "/"} isActive={isActive(item.url)} key={item.url}>
                  {item.title}
                </MobileLink>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </nav>
  );
}

export function MobileHeaderNav({ className }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <MobileHeaderNavInner className={className} />
    </Suspense>
  );
}

function MobileLink({
  href,
  className,
  children,
  isActive,
  ...props
}: LinkProps<string> & {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}) {
  return (
    <Link className={cn("relative font-medium text-2xl", className)} href={href} {...props}>
      {children}
      <AnimatePresence>
        {isActive && (
          <motion.span
            className="-bottom-1 absolute left-0 h-0.5 w-6 bg-primary"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1, originX: 0 }}
            exit={{ scaleX: 0, originX: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </Link>
  );
}
