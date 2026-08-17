const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

export const searchPlaces = async (query, limit = 5) => {
  const res = await fetch(
    `${GEO_BASE_URL}?q=${encodeURIComponent(query)}&limit=${limit * 3}&appid=${API_KEY}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch place suggestions');
  }

  const data = await res.json();
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = data.filter((place) =>
    place.name.toLowerCase().startsWith(normalizedQuery)
  );

  // dedupe by display name
  const seen = new Set();
  const deduped = filtered.filter((place) => {
    const key = [place.name, place.state, place.country].filter(Boolean).join(', ');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.slice(0, limit);
};

export const getWeatherByCoords = async (lat, lon) => {
  const res = await fetch(
    `${WEATHER_BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );

  if (!res.ok) {
    throw new Error(res.status === 404 ? 'Place not found' : 'Something went wrong');
  }

  return res.json();
};

export const getTodayHighLow = async (lat, lon) => {
  const res = await fetch(
    `${FORECAST_BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch forecast data');
  }

  const data = await res.json();
  const today = data.list[0].dt_txt.split(' ')[0];
  const todayEntries = data.list.filter((entry) => entry.dt_txt.startsWith(today));

  const temps = todayEntries.map((entry) => entry.main.temp);

  return {
    high: Math.max(...temps),
    low: Math.min(...temps),
  };
};