import { useEffect, useMemo, useRef, useState } from "react";

import { useIncidentsQuery } from "@/components/incidents/query-options";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/_incidents/incidentes";

const MAPBOX_SCRIPT_ID = "mapbox-gl-script";
const MAPBOX_CSS_ID = "mapbox-gl-css";
const MAPBOX_SCRIPT_SRC = "https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.js";
const MAPBOX_CSS_HREF = "https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.css";

const DEFAULT_CENTER: [number, number] = [-84.1, 9.93];
const DEFAULT_ZOOM = 7;
const DEFAULT_PITCH = 45;
const DEFAULT_BEARING = 0;
const COSTA_RICA_BOUNDS: [number, number, number, number] = [-86.2, 8.0, -82.0, 11.5];
const TERRAIN_SOURCE_ID = "mapbox-dem";
const TERRAIN_SOURCE_URL = "mapbox://mapbox.mapbox-terrain-dem-v1";
const TERRAIN_EXAGGERATION = 1.2;
const MARKER_DEFAULT_COLOR = "#a3000b";
const MARKER_HOVER_COLOR = "#055e16";
const MARKER_TEXT_COLOR = "#ffffff";
const MARKER_BASE_Z_INDEX = "1";
const MARKER_ACTIVE_Z_INDEX = "30";
const MARKER_LABEL_MIN_ZOOM = 11;

type IncidentFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
    properties: {
      id: number;
      slug: string;
      title: string;
      responsibleStationName: string | null;
      isOpen: boolean;
      typeLabel: string;
    };
  }>;
};

type MapboxMarker = {
  setLngLat: (coords: [number, number]) => MapboxMarker;
  addTo: (map: MapboxMap) => MapboxMarker;
  remove: () => void;
};

type IncidentMarkerElements = {
  wrapper: HTMLDivElement;
  bubble: HTMLDivElement;
  arrow: HTMLDivElement;
  tip: HTMLDivElement;
};

type IncidentMapMarker = {
  id: number;
  marker: MapboxMarker;
  elements: IncidentMarkerElements;
  isHovered: boolean;
};

type MapboxMap = {
  addControl: (control: unknown, position?: string) => void;
  addLayer: (layer: Record<string, unknown>) => void;
  addSource: (id: string, source: Record<string, unknown>) => void;
  fitBounds: (bounds: [number, number, number, number], options?: Record<string, unknown>) => void;
  getBounds: () => {
    getNorth: () => number;
    getSouth: () => number;
    getEast: () => number;
    getWest: () => number;
  };
  getCanvas: () => HTMLCanvasElement;
  getSource: (id: string) => { setData: (data: IncidentFeatureCollection) => void } | undefined;
  isStyleLoaded: () => boolean;
  on: (event: string, ...args: unknown[]) => void;
  remove: () => void;
  resize: () => void;
  setTerrain: (terrain: Record<string, unknown> | null) => void;
  getZoom: () => number;
};

type MapboxNamespace = {
  accessToken: string;
  Map: new (options: Record<string, unknown>) => MapboxMap;
  NavigationControl: new () => unknown;
  Marker: new (options?: Record<string, unknown>) => MapboxMarker;
};

declare global {
  interface Window {
    mapboxgl?: MapboxNamespace;
  }
}

function ensureMapboxCss() {
  if (document.getElementById(MAPBOX_CSS_ID)) {
    return;
  }

  const link = document.createElement("link");
  link.id = MAPBOX_CSS_ID;
  link.rel = "stylesheet";
  link.href = MAPBOX_CSS_HREF;
  document.head.appendChild(link);
}

async function loadMapboxScript() {
  if (window.mapboxgl) {
    return window.mapboxgl;
  }

  const existing = document.getElementById(MAPBOX_SCRIPT_ID) as HTMLScriptElement | null;

  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("No se pudo cargar Mapbox GL JS.")),
        {
          once: true
        }
      );
    });

    if (!window.mapboxgl) {
      throw new Error("Mapbox GL JS no esta disponible.");
    }

    return window.mapboxgl;
  }

  const script = document.createElement("script");
  script.id = MAPBOX_SCRIPT_ID;
  script.src = MAPBOX_SCRIPT_SRC;
  script.async = true;

  await new Promise<void>((resolve, reject) => {
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("No se pudo cargar Mapbox GL JS.")), {
      once: true
    });
    document.head.appendChild(script);
  });

  if (!window.mapboxgl) {
    throw new Error("Mapbox GL JS no esta disponible.");
  }

  return window.mapboxgl;
}

function toIncidentFeatureCollection(
  incidents: Array<{
    id: number;
    slug: string;
    title: string;
    longitude: number;
    latitude: number;
    responsibleStationName: string | null;
    isOpen: boolean;
    typeLabel: string;
  }>
): IncidentFeatureCollection {
  const features = incidents
    .filter(
      (incident) =>
        Number.isFinite(incident.longitude) &&
        Number.isFinite(incident.latitude) &&
        incident.longitude !== 0 &&
        incident.latitude !== 0
    )
    .map((incident) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [incident.longitude, incident.latitude] as [number, number]
      },
      properties: {
        id: incident.id,
        slug: incident.slug,
        title: incident.title,
        responsibleStationName: incident.responsibleStationName,
        isOpen: incident.isOpen,
        typeLabel: incident.typeLabel
      }
    }));

  return {
    type: "FeatureCollection",
    features
  };
}

function fitToFeatures(
  map: MapboxMap,
  features: IncidentFeatureCollection["features"],
  animate: boolean
) {
  if (features.length === 0) {
    return;
  }

  const first = features[0];
  if (!first) {
    return;
  }

  let west = first.geometry.coordinates[0];
  let east = first.geometry.coordinates[0];
  let south = first.geometry.coordinates[1];
  let north = first.geometry.coordinates[1];

  for (const feature of features) {
    const [lng, lat] = feature.geometry.coordinates;
    west = Math.min(west, lng);
    east = Math.max(east, lng);
    south = Math.min(south, lat);
    north = Math.max(north, lat);
  }

  map.fitBounds([west, south, east, north], {
    padding: 40,
    maxZoom: 12,
    duration: animate ? 500 : 0
  });
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6));
}

function roundZoom(value: number) {
  return Number(value.toFixed(2));
}

function buildIncidentTypeLabel(incident: {
  specificActualTypeName?: string;
  specificDispatchTypeName?: string;
}) {
  return (
    incident.specificActualTypeName ?? incident.specificDispatchTypeName ?? "Tipo no disponible"
  );
}

function createIncidentMarkerElement({ label }: { label: string }): IncidentMarkerElements {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.maxWidth = "220px";
  wrapper.style.pointerEvents = "auto";
  wrapper.style.cursor = "pointer";
  wrapper.style.zIndex = MARKER_BASE_Z_INDEX;
  wrapper.style.filter = "drop-shadow(0 2px 6px rgba(2, 6, 23, 0.22))";

  const bubble = document.createElement("div");
  bubble.textContent = label;
  bubble.style.padding = "2px 6px";
  bubble.style.borderRadius = "10px";
  bubble.style.backgroundColor = MARKER_DEFAULT_COLOR;
  bubble.style.color = MARKER_TEXT_COLOR;
  bubble.style.fontSize = "11px";
  bubble.style.fontWeight = "600";
  bubble.style.lineHeight = "1.1";
  bubble.style.textAlign = "center";
  bubble.style.maxWidth = "220px";
  bubble.style.whiteSpace = "nowrap";
  bubble.style.overflow = "hidden";
  bubble.style.textOverflow = "ellipsis";
  bubble.style.transition = "background-color 140ms ease";

  const arrow = document.createElement("div");
  arrow.style.width = "0";
  arrow.style.height = "0";
  arrow.style.borderLeft = "4px solid transparent";
  arrow.style.borderRight = "4px solid transparent";
  arrow.style.borderTop = `5px solid ${MARKER_DEFAULT_COLOR}`;
  arrow.style.marginTop = "-1px";
  arrow.style.transition = "border-top-color 140ms ease";

  const tip = document.createElement("div");
  tip.style.width = "6px";
  tip.style.height = "6px";
  tip.style.borderRadius = "999px";
  tip.style.backgroundColor = MARKER_DEFAULT_COLOR;
  tip.style.marginTop = "-1px";
  tip.style.transition = "background-color 140ms ease";

  wrapper.appendChild(bubble);
  wrapper.appendChild(arrow);
  wrapper.appendChild(tip);

  return {
    wrapper,
    bubble,
    arrow,
    tip
  };
}

function setIncidentMarkerColor(elements: IncidentMarkerElements, color: string) {
  elements.bubble.style.backgroundColor = color;
  elements.arrow.style.borderTop = `5px solid ${color}`;
  elements.tip.style.backgroundColor = color;
}

function shouldShowIncidentMarkerLabel(zoom: number) {
  return zoom >= MARKER_LABEL_MIN_ZOOM;
}

function setIncidentMarkerLabelVisibility(marker: IncidentMapMarker, isVisible: boolean) {
  marker.elements.bubble.style.display = isVisible ? "block" : "none";
  marker.elements.arrow.style.display = isVisible ? "block" : "none";
  marker.elements.tip.style.marginTop = isVisible ? "-1px" : "0";
}

function setIncidentMarkersLabelVisibility(markers: IncidentMapMarker[], isVisible: boolean) {
  for (const marker of markers) {
    setIncidentMarkerLabelVisibility(marker, isVisible);
  }
}

function updateIncidentMarkerAppearance(
  marker: IncidentMapMarker,
  highlightedIncidentId: number | null
) {
  const shouldHighlight = marker.isHovered || marker.id === highlightedIncidentId;
  setIncidentMarkerColor(
    marker.elements,
    shouldHighlight ? MARKER_HOVER_COLOR : MARKER_DEFAULT_COLOR
  );
  marker.elements.wrapper.style.zIndex = shouldHighlight
    ? MARKER_ACTIVE_Z_INDEX
    : MARKER_BASE_Z_INDEX;
}

function renderIncidentMarkers(
  mapboxgl: MapboxNamespace,
  map: MapboxMap,
  features: IncidentFeatureCollection["features"],
  existingMarkers: IncidentMapMarker[],
  showLabels: boolean,
  getHighlightedIncidentId: () => number | null
): IncidentMapMarker[] {
  for (const marker of existingMarkers) {
    marker.marker.remove();
  }

  return features.map((feature) => {
    const markerElements = createIncidentMarkerElement({
      label: feature.properties.typeLabel
    });

    const mapboxMarker = new mapboxgl.Marker({
      element: markerElements.wrapper,
      anchor: "bottom"
    })
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);

    const marker: IncidentMapMarker = {
      id: feature.properties.id,
      marker: mapboxMarker,
      elements: markerElements,
      isHovered: false
    };

    setIncidentMarkerLabelVisibility(marker, showLabels);

    markerElements.wrapper.addEventListener("mouseenter", () => {
      marker.isHovered = true;
      updateIncidentMarkerAppearance(marker, getHighlightedIncidentId());
    });

    markerElements.wrapper.addEventListener("mouseleave", () => {
      marker.isHovered = false;
      updateIncidentMarkerAppearance(marker, getHighlightedIncidentId());
    });

    updateIncidentMarkerAppearance(marker, getHighlightedIncidentId());

    return marker;
  });
}

export function IncidentsMap({
  className,
  highlightedIncidentId = null
}: {
  className?: string;
  highlightedIncidentId?: number | null;
}) {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, isPending, isError } = useIncidentsQuery(search);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const mapboxRef = useRef<MapboxNamespace | null>(null);
  const markersRef = useRef<IncidentMapMarker[]>([]);
  const markerLabelsVisibleRef = useRef(shouldShowIncidentMarkerLabel(search.zoom ?? DEFAULT_ZOOM));
  const highlightedIncidentIdRef = useRef<number | null>(highlightedIncidentId);
  const didInitialFitRef = useRef(false);

  const hasSearchBounds =
    search.northBound != null &&
    search.southBound != null &&
    search.eastBound != null &&
    search.westBound != null;

  const initialBoundsRef = useRef<[number, number, number, number] | null>(
    hasSearchBounds
      ? [
          search.westBound as number,
          search.southBound as number,
          search.eastBound as number,
          search.northBound as number
        ]
      : null
  );
  const initialZoomRef = useRef(search.zoom ?? DEFAULT_ZOOM);

  const incidents = data?.data ?? [];
  const featureCollection = useMemo(
    () =>
      toIncidentFeatureCollection(
        incidents.map((incident) => ({
          id: incident.id,
          slug: incident.slug,
          title: incident.title,
          longitude: incident.longitude,
          latitude: incident.latitude,
          responsibleStationName: incident.responsibleStationName,
          isOpen: incident.isOpen,
          typeLabel: buildIncidentTypeLabel({
            specificActualTypeName: incident.specificActualType?.name,
            specificDispatchTypeName: incident.specificDispatchType?.name
          })
        }))
      ),
    [incidents]
  );
  const featureCollectionRef = useRef(featureCollection);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    featureCollectionRef.current = featureCollection;
  }, [featureCollection]);

  useEffect(() => {
    highlightedIncidentIdRef.current = highlightedIncidentId;

    for (const marker of markersRef.current) {
      updateIncidentMarkerAppearance(marker, highlightedIncidentIdRef.current);
    }
  }, [highlightedIncidentId]);

  useEffect(() => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

    if (!mapboxToken || !mapContainerRef.current) {
      return;
    }

    let cancelled = false;

    const initializeMap = async () => {
      try {
        ensureMapboxCss();
        const mapboxgl = await loadMapboxScript();

        if (cancelled || !mapContainerRef.current) {
          return;
        }

        mapboxgl.accessToken = mapboxToken;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/standard",
          center: DEFAULT_CENTER,
          zoom: initialZoomRef.current,
          pitch: DEFAULT_PITCH,
          bearing: DEFAULT_BEARING,
          maxBounds: COSTA_RICA_BOUNDS
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");
        mapRef.current = map;
        mapboxRef.current = mapboxgl;

        map.on("load", () => {
          map.addSource(TERRAIN_SOURCE_ID, {
            type: "raster-dem",
            url: TERRAIN_SOURCE_URL,
            tileSize: 512,
            maxzoom: 14
          });
          map.setTerrain({
            source: TERRAIN_SOURCE_ID,
            exaggeration: TERRAIN_EXAGGERATION
          });

          if (initialBoundsRef.current) {
            map.fitBounds(initialBoundsRef.current, {
              padding: 40,
              duration: 0,
              maxZoom: 12
            });
            didInitialFitRef.current = true;
          } else {
            fitToFeatures(map, featureCollectionRef.current.features, false);
            didInitialFitRef.current = featureCollectionRef.current.features.length > 0;
          }

          markersRef.current = renderIncidentMarkers(
            mapboxgl,
            map,
            featureCollectionRef.current.features,
            markersRef.current,
            markerLabelsVisibleRef.current,
            () => highlightedIncidentIdRef.current
          );

          const syncMarkerLabelVisibility = () => {
            const shouldShowLabels = shouldShowIncidentMarkerLabel(map.getZoom());

            if (shouldShowLabels === markerLabelsVisibleRef.current) {
              return;
            }

            markerLabelsVisibleRef.current = shouldShowLabels;
            setIncidentMarkersLabelVisibility(markersRef.current, shouldShowLabels);
          };

          syncMarkerLabelVisibility();

          map.on("zoom", syncMarkerLabelVisibility);

          setMapReady(true);
        });

        map.on("moveend", () => {
          const bounds = map.getBounds();

          void navigate({
            search: (prev) => ({
              ...prev,
              northBound: roundCoordinate(bounds.getNorth()),
              southBound: roundCoordinate(bounds.getSouth()),
              eastBound: roundCoordinate(bounds.getEast()),
              westBound: roundCoordinate(bounds.getWest()),
              zoom: roundZoom(map.getZoom())
            }),
            replace: true,
            resetScroll: false
          });
        });

        const resizeObserver = new ResizeObserver(() => {
          map.resize();
        });

        resizeObserver.observe(mapContainerRef.current);

        return () => {
          resizeObserver.disconnect();
        };
      } catch {
        if (!cancelled) {
          setMapError("No se pudo cargar el mapa.");
        }
      }
    };

    let cleanupObserver: (() => void) | undefined;
    void initializeMap().then((cleanup) => {
      cleanupObserver = cleanup;
    });

    return () => {
      cancelled = true;
      cleanupObserver?.();

      for (const marker of markersRef.current) {
        marker.marker.remove();
      }
      markersRef.current = [];

      mapRef.current?.remove();
      mapRef.current = null;
      mapboxRef.current = null;
    };
  }, [navigate]);

  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;

    if (!map || !mapboxgl || !map.isStyleLoaded()) {
      return;
    }

    markersRef.current = renderIncidentMarkers(
      mapboxgl,
      map,
      featureCollection.features,
      markersRef.current,
      shouldShowIncidentMarkerLabel(map.getZoom()),
      () => highlightedIncidentIdRef.current
    );
    markerLabelsVisibleRef.current = shouldShowIncidentMarkerLabel(map.getZoom());

    if (!hasSearchBounds && !didInitialFitRef.current) {
      fitToFeatures(map, featureCollection.features, true);
      didInitialFitRef.current = featureCollection.features.length > 0;
    }
  }, [featureCollection, hasSearchBounds]);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  if (!mapboxToken) {
    return (
      <div
        className={cn("flex size-full min-h-0 items-center justify-center bg-muted/20", className)}>
        <p className="px-6 text-center text-sm text-muted-foreground">
          Configura <code>VITE_MAPBOX_TOKEN</code> para habilitar el mapa.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative size-full min-h-0 overflow-hidden", className)}>
      {!mapReady && <Skeleton className="absolute inset-0 rounded-none" />}
      <div
        ref={mapContainerRef}
        className="h-full w-full"
      />

      {isPending && (
        <div className="absolute top-3 left-3 rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
          Actualizando incidentes...
        </div>
      )}

      {(mapError || isError) && (
        <div className="absolute inset-x-3 bottom-3 rounded-md border border-border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
          {mapError ?? "Ocurrió un error cargando los incidentes del mapa."}
        </div>
      )}
    </div>
  );
}
