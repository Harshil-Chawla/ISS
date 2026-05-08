const ISS_BASE_URL = import.meta.env.DEV ? '/open-notify' : 'http://api.open-notify.org';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

export async function fetchISSLocation() {
  const response = await fetch(`${ISS_BASE_URL}/iss-now.json`, {
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Unable to fetch ISS location.');

  const data = await response.json();
  if (data.message !== 'success') throw new Error('ISS API returned an invalid response.');

  return {
    latitude: Number(data.iss_position.latitude),
    longitude: Number(data.iss_position.longitude),
    timestamp: new Date(data.timestamp * 1000).toISOString()
  };
}

export async function fetchPeopleInSpace() {
  const response = await fetch(`${ISS_BASE_URL}/astros.json`, {
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Unable to fetch people in space.');

  const data = await response.json();
  if (data.message !== 'success') throw new Error('People in space API returned an invalid response.');

  return {
    number: data.number,
    people: data.people || []
  };
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
