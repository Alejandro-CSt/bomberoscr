import { Button } from "@/features/shared/components/ui/button";
import {
  GarageIcon,
  HouseLineIcon,
  MagnifyingGlassIcon,
  MapTrifoldIcon,
  SirenIcon
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const navigationLinks = [
  {
    title: "Directorio de estaciones",
    description: "Explora todas las estaciones de bomberos del país",
    url: "/estaciones",
    icon: GarageIcon
  },
  {
    title: "Mapa interactivo",
    description: "Visualiza estaciones e incidentes en tiempo real",
    url: "/mapa",
    icon: MapTrifoldIcon
  },
  {
    title: "Incidentes recientes",
    description: "Consulta los últimos incidentes atendidos",
    url: "/incidentes",
    icon: SirenIcon
  },
  {
    title: "Página principal",
    description: "Volver al inicio del sitio",
    url: "/",
    icon: HouseLineIcon
  }
];

export default function StationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
        <MagnifyingGlassIcon className="size-10 text-muted-foreground" />
      </div>

      <h1 className="font-bold text-2xl">Estación no encontrada</h1>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button render={<Link href="/estaciones" />} variant="default">
          <GarageIcon />
          Ver todas las estaciones
        </Button>
        <Button render={<Link href="/" />} variant="outline">
          <HouseLineIcon />
          Ir al inicio
        </Button>
      </div>

      <div className="mt-12 w-full max-w-2xl">
        <h2 className="mb-4 font-medium text-muted-foreground text-sm">También puedes explorar</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.url}
                href={link.url as "/"}
                className="group flex items-start gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted transition-colors group-hover:bg-primary/10">
                  <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{link.title}</span>
                  <span className="text-muted-foreground text-xs">{link.description}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
