import { cn } from "@/lib/utils";
import { Geist_Mono } from "next/font/google";

const geist = Geist_Mono({ subsets: ["latin"], weight: ["900"] });

export function StationKeyDisplay({ stationKey }: { stationKey: string }) {
  const [main, sub] = stationKey.split("-");

  return (
    <div
      className={cn(
        "flex h-16 min-w-16 items-center justify-center rounded-full bg-red-500 font-black text-2xl text-white",
        geist.className
      )}
    >
      <span>{main}</span>
      {" - "}
      <span>{sub}</span>
    </div>
  );
}
