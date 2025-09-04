import { Button } from "@/features/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/features/shared/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/features/shared/components/ui/toggle-group";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

function ThemeSelector({
  value,
  onChange
}: {
  value: "light" | "dark" | "system" | undefined;
  onChange: (v: "light" | "dark" | "system") => void;
}) {
  return (
    <ToggleGroup
      suppressHydrationWarning
      type="single"
      variant="outline"
      size="sm"
      value={value ?? "system"}
      onValueChange={(v) => v && onChange(v as "light" | "dark" | "system")}
      aria-label="Cambiar tema"
    >
      <ToggleGroupItem value="system" aria-label="Sistema">
        <MonitorIcon size={16} />
      </ToggleGroupItem>
      <ToggleGroupItem value="light" aria-label="Claro">
        <SunIcon size={16} />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Oscuro">
        <MoonIcon size={16} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const selectedTheme: "light" | "dark" | "system" | undefined =
    theme === "light" || theme === "dark" || theme === "system" ? theme : undefined;

  return (
    <div>
      <div className="flex justify-end md:hidden">
        <ThemeSelector value={selectedTheme} onChange={(v) => setTheme(v)} />
      </div>

      <div className="hidden md:block">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              suppressHydrationWarning
              variant="outline"
              size="icon"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? (
                <MoonIcon size={16} />
              ) : theme === "light" ? (
                <SunIcon size={16} />
              ) : (
                <MonitorIcon size={16} />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-fit border-none p-0">
            <ThemeSelector value={selectedTheme} onChange={(v) => setTheme(v)} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
