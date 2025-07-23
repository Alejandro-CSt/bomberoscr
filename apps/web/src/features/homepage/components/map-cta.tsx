"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { Bricolage_Grotesque } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "700"]
});

export function MapCTA() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Link
        href="/mapa"
        className="group relative col-span-2 block h-[300px] w-full overflow-hidden rounded-xl bg-gray-200 transition-all duration-300 hover:shadow-xl dark:bg-gray-800"
      />
    );
  }

  return (
    <Link
      href="/mapa"
      className="group relative block w-full overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl lg:h-[300px]"
    >
      <Image
        suppressHydrationWarning
        src={resolvedTheme === "dark" ? "/map-dark.png" : "/map-light.png"}
        alt="Map"
        width={1000}
        height={1000}
        quality={90}
        className="size-full object-cover transition-all duration-300 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent dark:via-black/20" />

      <div className={cn("absolute right-0 bottom-0 left-0 p-6 lg:p-8", bricolage.className)}>
        <div className="mb-4">
          <h2 className="font-bold text-white text-xl leading-tight lg:text-2xl xl:text-3xl">
            Mapa interactivo con incidentes en tiempo real
          </h2>
        </div>

        <Button
          variant="secondary"
          className="group/btn rounded-xl bg-white text-black hover:bg-white/85"
        >
          Ver mapa
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </Link>
  );
}
