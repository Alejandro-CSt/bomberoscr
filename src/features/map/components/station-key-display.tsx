import { cn } from "@/lib/utils";
import { Geist_Mono } from "next/font/google";

const geist = Geist_Mono({ subsets: ["latin"], weight: ["900"] });

export function StationKeyDisplay({ stationKey }: { stationKey: string }) {
  const [main, sub] = stationKey.split("-");

  return (
    <div
      className={cn(
        "flex min-h-10 min-w-10 items-center justify-center rounded-full bg-red-500 font-black text-sm text-white",
        geist.className
      )}
    >
      <span>{main}</span>
      {" - "}
      <span>{sub}</span>
    </div>
  );
}
