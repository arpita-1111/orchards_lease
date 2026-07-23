import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// @ts-ignore
import L from 'leaflet';
import { ExternalLink, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon assets in React
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface OrchardMapProps {
  latitude?: number;
  longitude?: number;
  gardenName: string;
  district: string;
  state: string;
  address?: string;
}

// Fallback coordinates for district centers if coordinates are not provided
const defaultCoordinates: Record<string, [number, number]> = {
  default: [20.5937, 78.9629], // India Center
};

export function OrchardMap({
  latitude,
  longitude,
  gardenName,
  district,
  state,
  address,
}: OrchardMapProps) {
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && latitude !== 0 && longitude !== 0;
  
  // Use provided coordinates or general fallback
  const position: [number, number] = hasCoords
    ? [latitude!, longitude!]
    : defaultCoordinates.default;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-sand bg-cream shadow-sm">
      <div className="flex items-center justify-between border-b border-sand/60 px-5 py-3 bg-paper/50">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-forest" />
          <span className="text-sm font-bold text-ink">Location &amp; Map Navigation</span>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
        >
          Get Directions
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="relative h-[320px] w-full z-0">
        <MapContainer
          center={position}
          zoom={hasCoords ? 13 : 6}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={customIcon}>
            <Popup>
              <div className="p-1 text-center">
                <strong className="block text-sm text-forest font-serif">{gardenName}</strong>
                <span className="text-xs text-gray-600">
                  {address ? `${address}, ` : ''}{district}, {state}
                </span>
                <div className="mt-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-blue-600 underline font-semibold"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="p-4 bg-cream border-t border-sand/60 text-xs text-sub flex justify-between items-center">
        <span>
          📍 {address ? `${address}, ` : ''}{district}, {state}
        </span>
        <span className="font-mono text-faint">
          {position[0].toFixed(4)}° N, {position[1].toFixed(4)}° E
        </span>
      </div>
    </div>
  );
}