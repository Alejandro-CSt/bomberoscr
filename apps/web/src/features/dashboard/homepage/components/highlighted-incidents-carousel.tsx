import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/features/shared/components/ui/carousel";
import { getHighlightedIncidents } from "@bomberoscr/db/queries/highlightedIncidents";
import { HighlightedIncident } from "./highlighted-incident";

export async function HighlightedIncidents() {
  const highlightedIncidents = await getHighlightedIncidents();

  return (
    <Carousel opts={{ loop: true, align: "start" }} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-xl lg:text-2xl">Incidentes destacados</h2>
        <div className="relative flex items-center gap-2">
          <CarouselPrevious className="rounded-lg" />
          <CarouselNext className="rounded-lg" />
        </div>
      </div>
      <CarouselContent>
        {highlightedIncidents.map((incident) => (
          <CarouselItem key={incident.id} className="lg:basis-1/2">
            <HighlightedIncident incident={incident} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
