"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useEffect, useRef, useState } from "react";
import type { FieldControlProps } from "./index";
import { loadGoogleMapsScript, isGoogleMapsAvailable } from "@/lib/frappe/maps";
import { Button } from "@/components/shadcn/button";

export default function GeolocationField({ field, value, onChange, disabled }: FieldControlProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [fallback, setFallback] = useState(false);

  const parsed = useMemo(() => {
    if (!value) return null;
    if (typeof value === "string") {
      try { return JSON.parse(value); } catch { return null; }
    }
    if (typeof value === "object" && "lat" in value && "lng" in value) return value as { lat: number; lng: number };
    return null;
  }, [value]);

  useEffect(() => {
    if (fallback || loaded || !mapRef.current) return;
    let cancelled = false;

    loadGoogleMapsScript()
      .then((ok) => {
        if (!ok || cancelled) {
          setFallback(true);
          return;
        }
        if (!mapRef.current || !(window as any).google?.maps) return;

        const position = parsed ? { lat: parsed.lat, lng: parsed.lng } : { lat: 0, lng: 0 };

        const gMap = new (window as any).google.maps.Map(mapRef.current, {
          center: position,
          zoom: position.lat === 0 && position.lng === 0 ? 1 : 15,
          disableDefaultUI: true,
          zoomControl: true,
        });

        const gMarker = new (window as any).google.maps.Marker({
          position,
          map: gMap,
          draggable: !disabled && !field.read_only,
        });

        gMarker.addListener("dragend", () => {
          const pos = gMarker.getPosition();
          if (pos) {
            onChange(JSON.stringify({ lat: pos.lat(), lng: pos.lng() }));
          }
        });

        if (!cancelled) {
          setMap(gMap as google.maps.Map);
          setMarker(gMarker as google.maps.Marker);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFallback(true);
      });

    return () => {
      cancelled = true;
    };
  }, [fallback, loaded, parsed, onChange, disabled, field.read_only]);

  const handleGeocode = () => {
    const address = prompt("Enter address:");
    if (!address || !map || !marker) return;

    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        map.setCenter(loc);
        marker.setPosition(loc);
        onChange(JSON.stringify({ lat: loc.lat(), lng: loc.lng() }));
      }
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (map && marker) {
          const loc = { lat: latitude, lng: longitude };
          map.setCenter(loc);
          marker.setPosition(loc);
          onChange(JSON.stringify(loc));
        }
      },
      () => {},
    );
  };

  if (fallback || !isGoogleMapsAvailable()) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={parsed?.lat ?? ""}
            onChange={(e) => {
              const lat = parseFloat(e.target.value);
              const lng = parsed?.lng ?? 0;
              onChange(JSON.stringify({ lat: Number.isNaN(lat) ? 0 : lat, lng }));
            }}
            disabled={disabled || !!field.read_only}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={parsed?.lng ?? ""}
            onChange={(e) => {
              const lng = parseFloat(e.target.value);
              const lat = parsed?.lat ?? 0;
              onChange(JSON.stringify({ lat, lng: Number.isNaN(lng) ? 0 : lng }));
            }}
            disabled={disabled || !!field.read_only}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={mapRef} className="h-64 w-full rounded-lg border border-zinc-200 dark:border-zinc-700" />
      {!(disabled || field.read_only) && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleGeocode}>
            Search
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleCurrentLocation}>
            Current
          </Button>
        </div>
      )}
      {parsed && (
        <p className="text-xs text-zinc-500">
          {parsed.lat.toFixed(6)}, {parsed.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
