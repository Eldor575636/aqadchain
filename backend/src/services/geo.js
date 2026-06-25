const axios = require('axios');

/**
 * Look up lat/lng for a US zip code using Zippopotam.us (free, no API key).
 * Returns null if not found.
 */
async function geocodeZip(zip) {
  if (!zip) return null;
  try {
    const { data } = await axios.get(`https://api.zippopotam.us/us/${encodeURIComponent(zip)}`, { timeout: 5000 });
    const place = data?.places?.[0];
    if (!place) return null;
    return { latitude: parseFloat(place.latitude), longitude: parseFloat(place.longitude) };
  } catch {
    return null;
  }
}

/**
 * Haversine distance in miles between two lat/lng points.
 */
function distanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = { geocodeZip, distanceMiles };
