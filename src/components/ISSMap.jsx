import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import React, { useEffect, useMemo } from 'react';
import { formatDate } from '../utils/formatDate';

const issIcon = L.divIcon({
  className: 'iss-marker',
  html: '<div class="iss-marker-core">ISS</div>',
  iconSize: [46, 46],
  iconAnchor: [23, 23]
});

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.latitude, position.longitude], map.getZoom(), { duration: 1.2 });
    }
  }, [map, position]);

  return null;
}

export default function ISSMap({ currentPosition, positions }) {
  const center = currentPosition
    ? [currentPosition.latitude, currentPosition.longitude]
    : [0, 0];

  const path = useMemo(
    () => positions.map((position) => [position.latitude, position.longitude]),
    [positions]
  );

  return (
    <div className="map-shell">
      <MapContainer center={center} zoom={3} minZoom={2} scrollWheelZoom className="iss-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap position={currentPosition} />
        {path.length > 1 && <Polyline positions={path} pathOptions={{ color: '#20c997', weight: 3 }} />}
        {positions.slice(0, -1).map((position) => (
          <CircleMarker
            center={[position.latitude, position.longitude]}
            radius={4}
            pathOptions={{ color: '#93c5fd', fillColor: '#93c5fd', fillOpacity: 0.8 }}
            key={position.timestamp}
          />
        ))}
        {currentPosition && (
          <CircleMarker
            center={[currentPosition.latitude, currentPosition.longitude]}
            radius={18}
            pathOptions={{ color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 0.25 }}
          />
        )}
        {currentPosition && (
          <Marker position={[currentPosition.latitude, currentPosition.longitude]} icon={issIcon}>
            <Tooltip permanent direction="top" offset={[0, -14]}>
              <div className="map-tooltip">
                <strong>ISS</strong>
                <span>Lat {currentPosition.latitude.toFixed(3)}</span>
                <span>Lng {currentPosition.longitude.toFixed(3)}</span>
                <span>{Math.round(currentPosition.speed || 0).toLocaleString()} km/h</span>
                <span>{formatDate(currentPosition.timestamp)}</span>
                <span>{currentPosition.locationName}</span>
              </div>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
