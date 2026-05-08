const ISS_BASE_URLS = ['/open-notify', 'http://api.open-notify.org'];
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const REQUEST_TIMEOUT_MS = 7000;

async function fetchJsonWithTimeout(url) {
  const controller = new window.AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal
    });

    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function fetchISSLocation() {
  for (const baseUrl of ISS_BASE_URLS) {
    try {
      const data = await fetchJsonWithTimeout(`${baseUrl}/iss-now.json`);
      if (data.message !== 'success') throw new Error('ISS API returned an invalid response.');

      return {
        latitude: Number(data.iss_position.latitude),
        longitude: Number(data.iss_position.longitude),
        timestamp: new Date(data.timestamp * 1000).toISOString(),
        isEstimated: false
      };
    } catch {
      // Try the next source before falling back to an estimated orbit position.
    }
  }

  return getEstimatedISSLocation();
}

export async function fetchPeopleInSpace() {
  let lastError;
  for (const baseUrl of ISS_BASE_URLS) {
    try {
      const data = await fetchJsonWithTimeout(`${baseUrl}/astros.json`);
      if (data.message !== 'success') throw new Error('People in space API returned an invalid response.');

      return {
        number: data.number,
        people: data.people || []
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to fetch people in space.');
}

export async function reverseGeocodeLocation(latitude, longitude) {
  try {
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(latitude),
      lon: String(longitude),
      zoom: '4',
      addressdetails: '1'
    });

    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) return 'Over ocean or remote region';

    const data = await response.json();
    const address = data.address || {};
    const name =
      address.city ||
      address.town ||
      address.village ||
      address.state ||
      address.country ||
      data.display_name;

    return name || 'Over ocean or remote region';
  } catch {
    return 'Over ocean or remote region';
  }
}

function getEstimatedISSLocation() {
  const now = Date.now();
  const seconds = now / 1000;
  const orbitPeriodSeconds = 92.68 * 60;
  const inclinationDegrees = 51.64;
  const phase = ((seconds % orbitPeriodSeconds) / orbitPeriodSeconds) * Math.PI * 2;
  const latitude = inclinationDegrees * Math.sin(phase);
  const rawLongitude =
    ((seconds / orbitPeriodSeconds) * 360 - (seconds / 86164) * 360 + 29) % 360;
  const longitude = rawLongitude > 180 ? rawLongitude - 360 : rawLongitude < -180 ? rawLongitude + 360 : rawLongitude;

  return {
    latitude,
    longitude,
    timestamp: new Date(now).toISOString(),
    isEstimated: true
  };
}
