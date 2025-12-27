import {
  GarageIcon,
  HouseLineIcon,
  MapTrifoldIcon,
  SirenIcon
} from "@phosphor-icons/react/dist/ssr";

export const navItems = [
  {
    title: "Inicio",
    url: "/",
    icon: HouseLineIcon,
    enabled: true
  },
  {
    title: "Mapa interactivo",
    url: "/mapa",
    icon: MapTrifoldIcon,
    enabled: true
  },
  {
    title: "Incidentes",
    url: "/incidentes",
    icon: SirenIcon,
    enabled: true
  },
  {
    title: "Estaciones",
    url: "/estaciones",
    icon: GarageIcon,
    enabled: true
  }
];
