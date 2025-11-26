"use client";

import { Button } from "@/features/shared/components/ui/button";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes = ["system", "light", "dark"] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    const currentIndex = themes.indexOf((theme ?? "system") as (typeof themes)[number]);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex] ?? "system");
  };

  const Icon = !mounted
    ? MonitorIcon
    : theme === "dark"
      ? MoonIcon
      : theme === "light"
        ? SunIcon
        : MonitorIcon;

  return (
    <Button
      suppressHydrationWarning
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema"
      onClick={cycleTheme}
    >
      <Icon size={16} />
    </Button>
  );
}
