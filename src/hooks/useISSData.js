import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchISSLocation, fetchPeopleInSpace, reverseGeocodeLocation } from '../services/issService';
import { calculateSpeedKmH } from '../utils/haversine';

const POLL_INTERVAL_MS = 15000;

export function useISSData() {
  const [positions, setPositions] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [people, setPeople] = useState({ number: 0, people: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const currentPosition = positions[positions.length - 1] || null;

  const fetchAllISSData = useCallback(async ({ manual = false } = {}) => {
    try {
      if (manual) setIsRefreshing(true);
      setError('');

      const location = await fetchISSLocation();

      setPositions((previousPositions) => {
        const previous = previousPositions[previousPositions.length - 1];
        const speed = calculateSpeedKmH(previous, location);
        const enriched = {
          ...location,
          speed,
          locationName: previous?.locationName || 'Over ocean or remote region'
        };

        setSpeedHistory((history) => [
          ...history.slice(-29),
          {
            timestamp: enriched.timestamp,
            speed: Number(speed.toFixed(2))
          }
        ]);

        return [...previousPositions.slice(-14), enriched];
      });

      reverseGeocodeLocation(location.latitude, location.longitude).then((locationName) => {
        setPositions((previousPositions) =>
          previousPositions.map((position) =>
            position.timestamp === location.timestamp ? { ...position, locationName } : position
          )
        );
      });

      fetchPeopleInSpace()
        .then(setPeople)
        .catch(() => {
          if (manual) toast.error('People in space data is unavailable, but ISS location updated.');
        });

      if (manual) toast.success('ISS data refreshed');
    } catch (err) {
      const message = err.message || 'Unable to load ISS data.';
      setError(message);
      if (manual) toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllISSData();
    const interval = setInterval(fetchAllISSData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAllISSData]);

  const data = useMemo(
    () => ({
      currentPosition,
      positions,
      speedHistory,
      people,
      isLoading,
      isRefreshing,
      error,
      refresh: () => fetchAllISSData({ manual: true })
    }),
    [currentPosition, error, fetchAllISSData, isLoading, isRefreshing, people, positions, speedHistory]
  );

  return data;
}
