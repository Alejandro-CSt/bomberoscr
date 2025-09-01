import { Toggle } from "@/shared/components/ui/toggle";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <Toggle
        suppressHydrationWarning
        variant="outline"
        className="group size-8 rounded-full border-none text-muted-foreground shadow-none data-[state=on]:bg-transparent data-[state=on]:text-muted-foreground data-[state=on]:hover:bg-muted data-[state=on]:hover:text-foreground"
        pressed={theme === "dark"}
        onPressedChange={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
      >
        <MoonIcon
          size={16}
          className="shrink-0 scale-0 opacity-0 transition-all dark:scale-100 dark:opacity-100"
          aria-hidden="true"
        />
        <SunIcon
          size={16}
          className="absolute shrink-0 scale-100 opacity-100 transition-all dark:scale-0 dark:opacity-0"
          aria-hidden="true"
        />
      </Toggle>
    </div>
  );
}
