"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";
import { useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  NavigationControl,
  ScaleControl,
  Source,
  type MapRef,
} from "react-map-gl/maplibre";
import { SCHOOLS } from "@/lib/data";
import { ORANGE_COUNTY_BOUNDS } from "@/lib/geo";
import { getMapStyleUrl } from "@/lib/mapStyle";
import { useActiveTopSchools, usePortal } from "@/store/portal";
import { PinPopover } from "./PinPopover";
import { FocusPin } from "./FocusPin";
import { RetailerLayers } from "./RetailerLayers";
import { useKeepPopoverInView, useMapCamera } from "./useMapCamera";
import { useMapLevel } from "./useMapLevel";

const MAP_STYLE = getMapStyleUrl();

// Copied to /public by scripts/copy-maplibre-worker.ts (bundled import.meta.url can't resolve it).
setWorkerUrl("/vendor/maplibre-gl-worker.mjs");

export default function MapCanvas() {
  const mapRef = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);
  const level = useMapLevel();
  const topSchools = useActiveTopSchools();

  const selectedId = usePortal((s) => s.selectedId);
  const leaving = usePortal((s) => s.leaving);
  const spotlightId = usePortal((s) => s.spotlightId);
  const select = usePortal((s) => s.select);

  useMapCamera(mapRef, loaded, level, topSchools);
  useKeepPopoverInView(
    mapRef,
    loaded,
    level.kind === "overview"
      ? topSchools.find((s) => s.id === selectedId)
      : undefined,
  );

  const focusId = level.kind === "overview" ? null : level.school.id;
  const pinnedIds = useMemo(
    () => new Set([...topSchools.map((s) => s.id), focusId ?? ""]),
    [topSchools, focusId],
  );

  const otherSchools = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: SCHOOLS.filter((s) => !pinnedIds.has(s.id)).map((s) => ({
        type: "Feature" as const,
        properties: { id: s.id },
        geometry: { type: "Point" as const, coordinates: [s.lng, s.lat] },
      })),
    }),
    [pinnedIds],
  );

  const selectedSlot = topSchools.findIndex((s) => s.id === selectedId) + 1;
  const focusInTop = topSchools.some((s) => s.id === focusId);

  return (
    <Map
      ref={mapRef}
      mapStyle={MAP_STYLE}
      initialViewState={{
        bounds: ORANGE_COUNTY_BOUNDS,
        fitBoundsOptions: { padding: 40 },
      }}
      style={{ position: "absolute", inset: 0 }}
      attributionControl={{ compact: true }}
      dragRotate={false}
      pitchWithRotate={false}
      onLoad={() => setLoaded(true)}
      onClick={(e) => {
        if ((e.originalEvent.target as HTMLElement).tagName === "CANVAS") {
          select(null);
        }
      }}
    >
      <Source id="other-schools" type="geojson" data={otherSchools}>
        <Layer
          id="other-schools"
          type="circle"
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              9,
              2.5,
              14,
              5,
            ],
            "circle-color": "#94a3b8",
            "circle-opacity": level.kind === "retailers" ? 0.35 : 0.7,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1,
          }}
        />
      </Source>

      {level.kind === "retailers" ? (
        <RetailerLayers school={level.school} />
      ) : (
        <>
          {topSchools.map((school, i) => (
            <FocusPin
              key={school.id}
              school={school}
              slot={i + 1}
              selected={selectedId === school.id || focusId === school.id}
              dimmed={
                (selectedId != null && selectedId !== school.id) ||
                (focusId != null && focusId !== school.id)
              }
              leaving={leaving?.id === school.id ? leaving.action : undefined}
              spotlight={spotlightId === school.id}
              onSelect={() => {
                if (level.kind === "overview") select(school.id);
              }}
            />
          ))}
          {level.kind === "school" && !focusInTop && (
            <FocusPin school={level.school} slot={null} selected />
          )}
          {level.kind === "overview" && selectedSlot > 0 && (
            <PinPopover
              school={topSchools[selectedSlot - 1]}
              slot={selectedSlot}
            />
          )}
        </>
      )}

      <NavigationControl position="bottom-right" showCompass={false} />
      <ScaleControl position="bottom-right" unit="imperial" />
    </Map>
  );
}
