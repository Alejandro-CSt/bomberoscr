import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function HeaderBackdrop() {
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();

  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const isIncidentesRoot = normalizedPathname === "/incidentes";

  useEffect(() => {
    const handleScroll = () => {
      // Show backdrop when scrolled past a small threshold
      // In apps/web it uses --app-subheader-height, here we'll use a fixed value or 16px (1rem)
      setShow(window.scrollY > 16);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isIncidentesRoot) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-40 h-8 bg-gradient-to-b from-background to-transparent transition-opacity duration-300",
        show ? "opacity-100" : "opacity-0"
      )}
      style={{ top: "var(--app-header-height)" }}
    />
  );
}
