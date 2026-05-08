import React from 'react';
import Loader from './Loader';

export default function ISSStats({ currentPosition, positionsCount, isLoading }) {
  if (isLoading && !currentPosition) return <Loader label="Acquiring ISS telemetry" />;

  const statCards = [
    {
      label: 'Latitude / Longitude',
      value: currentPosition
        ? `${currentPosition.latitude.toFixed(3)}, ${currentPosition.longitude.toFixed(3)}`
        : '--'
    },
    {
      label: 'Speed',
      value: `${Number(currentPosition?.speed || 0).toFixed(2)} km/h`
    },
    {
      label: 'Nearest Place',
      value: currentPosition?.locationName || 'Resolving location'
    },
    {
      label: 'Tracked Positions',
      value: positionsCount
    }
  ];

  return (
    <div className="stats-grid">
      {statCards.map((stat) => (
        <article className="metric-card" key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
        </article>
      ))}
    </div>
  );
}
