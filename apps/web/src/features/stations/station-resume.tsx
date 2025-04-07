interface StationResumeProps {
  station: {
    stationKey: string;
    name: string;
    address?: string;
  };
}

export function StationResume({ station }: StationResumeProps) {
  return (
    <div className="flex items-center gap-4 border-b p-4">
      <div className="flex size-12 flex-shrink-0 items-center justify-center truncate rounded-full bg-orange-100 font-bold text-orange-500">
        {station.stationKey}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate font-bold text-lg">{station.name}</h2>

        <div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs">
          {station.address && <span className="line-clamp-2 text-wrap">{station.address}</span>}
        </div>
      </div>
    </div>
  );
}
