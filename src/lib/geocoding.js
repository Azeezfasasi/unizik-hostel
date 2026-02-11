/**
 * Geocode an address to latitude and longitude using Nominatim (OpenStreetMap)
 * @param {string} address - The address to geocode
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function geocodeAddress(address) {
  try {
    if (!address || address.trim() === '') {
      return null;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'ContactDetailsApp' // Nominatim requires a User-Agent
        }
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get address (optional)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string | null>}
 */
export async function reverseGeocodeCoordinates(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          'User-Agent': 'ContactDetailsApp'
        }
      }
    );

    const data = await response.json();
    return data.address?.country ? data.address.country : null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
