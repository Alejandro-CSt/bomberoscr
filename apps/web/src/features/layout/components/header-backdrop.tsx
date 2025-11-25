"use client";

import { cn } from "@/features/shared/lib/utils";
import { useEffect, useState } from "react";

export function HeaderBackdrop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show backdrop when scrolled past subheader height
      const subheaderHeight =
        Number.parseFloat(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--app-subheader-height")
            .replace("rem", "")
        ) * 16; // Convert rem to px (assuming 1rem = 16px)

      setShow(window.scrollY > subheaderHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-40 h-8 bg-gradient-to-b from-background to-transparent transition-opacity duration-300",
        !show && "hidden"
      )}
      style={{ top: "var(--app-header-height)" }}
    />
  );
}
