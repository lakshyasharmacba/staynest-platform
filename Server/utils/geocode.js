const axios = require("axios");

const DEFAULT_COORDS = [77.209, 28.6139]; // [lng, lat] - New Delhi

// "Goa, India" -> [lng, lat]. Fail ho jaye to default (listing save phir bhi hogi)
module.exports = async (location, country) => {
  try {
    const q = encodeURIComponent(`${location}, ${country}`);
    const { data } = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "User-Agent": "wanderlust-app" }, timeout: 3000 }
    );
    if (data && data.length) {
      const lat = Number(data[0].lat);
      const lon = Number(data[0].lon);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) return [lon, lat];
    }
  } catch (err) {
    console.log("Geocoding failed, using default:", err.message);
  }
  return DEFAULT_COORDS;
};
