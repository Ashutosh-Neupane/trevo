declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLDivElement, options?: google.maps.MapOptions) => google.maps.Map;
        Marker: new (options?: google.maps.MarkerOptions) => google.maps.Marker;
        Geocoder: new () => google.maps.Geocoder;
        event: {
          addListenerOnce: (instance: unknown, eventName: string, handler: () => void) => void;
        };
      };
    };
  }

  namespace google {
    namespace maps {
      interface MapOptions {
        center?: { lat: number; lng: number };
        zoom?: number;
        disableDefaultUI?: boolean;
        zoomControl?: boolean;
      }

      interface Map {
        setCenter(latLng: { lat: number; lng: number } | google.maps.LatLng): void;
        setZoom(zoom: number): void;
      }

      interface MarkerOptions {
        position?: { lat: number; lng: number } | google.maps.LatLng;
        map?: google.maps.Map | null;
        draggable?: boolean;
      }

      interface Marker {
        setPosition(latLng: { lat: number; lng: number } | google.maps.LatLng): void;
        getPosition(): google.maps.LatLng | null;
        addListener(eventName: string, handler: () => void): google.maps.MapsEventListener;
      }

      interface GeocoderRequest {
        address?: string;
      }

      interface GeocoderResult {
        geometry: {
          location: google.maps.LatLng;
        };
      }

      interface Geocoder {
        geocode(request: GeocoderRequest, callback: (results: GeocoderResult[] | null, status: string) => void): void;
      }

      interface LatLng {
        lat(): number;
        lng(): number;
      }

      interface MapsEventListener {
        remove(): void;
      }
    }
  }
}

export {};
