import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { searchPlaces, getWeatherByCoords, getTodayHighLow } from './utils/weatherApi';
import { formatPlaceName, formatLocalDateTime } from './utils/helper';
import SearchHistory from './components/SearchHistory';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // if we need to restore search history, we would use localStorage but not included this time

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced geocoding lookup as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
    try {
      const data = await searchPlaces(query);
      
      setSuggestions(data);
      setShowDropdown(true);
    } catch {
      setSuggestions([]);
    }
  }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const fetchWeatherByCoords = async (place) => {
    setLoading(true);
    setError('');
    setShowDropdown(false);

    try {
      const [weatherData, highLow] = await Promise.all([
        getWeatherByCoords(place.lat, place.lon),
        getTodayHighLow(place.lat, place.lon),
      ]);

      setWeather({ ...weatherData, todayHigh: highLow.high, todayLow: highLow.low });

      const displayName = place.displayName || formatPlaceName(place);
      addToHistory({ ...place, displayName }, weatherData);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // get weather icon
  const getWeatherIconUrl = (iconCode) =>
  `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  // keep to only 10 most recent records
  const addToHistory = (place, data) => {
    setHistory((prev) => {
      const entry = {
        id: Date.now(),
        lat: place.lat,
        lon: place.lon,
        displayName: place.displayName,
        temp: data.main.temp,
        timestamp: new Date().toISOString(),
      };
      const filtered = prev.filter((h) => h.displayName !== entry.displayName);
      return [entry, ...filtered].slice(0, 10);
    });
  };

  const handleSelectSuggestion = (place) => {
    setQuery(formatPlaceName(place));
    setSuggestions([]);
    setShowDropdown(false);
    fetchWeatherByCoords(place);
  };

  const handleHistoryClick = (item) => {
    fetchWeatherByCoords(item);
  };

  const removeHistoryItem = (id, e) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="app">

      <div className="search-wrapper" ref={wrapperRef}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Search city, state, or country"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setShowDropdown(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
            aria-label="Clear search"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}

        {showDropdown && suggestions.length > 0 && (
          <ul className="dropdown">
            {suggestions.map((place, i) => (
              <li key={`${place.lat}-${place.lon}-${i}`} onClick={() => handleSelectSuggestion(place)}>
                {formatPlaceName(place)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <p>Searching...</p>}
      {error && <p className="error text-red-400 text-sm">{error}</p>}

      <div className="card-wrapper">
        {weather && (
          <div className="weather-card md:flex items-center">
            <div className="content-left p-4 rounded-lg">
              <div className="flex justify-between mb-4 text-sm">
                <p>Current weather: </p>
                <p>{formatLocalDateTime(weather.dt, weather.timezone)}</p>
              </div>

              <div className="flex justify-between items-center gap-4">
                <div>
                  <img
                    src={getWeatherIconUrl(weather.weather[0].icon)}
                    alt={weather.weather[0].description}
                    className="w-20 h-20 mx-auto"
                  />
                  <p className='text-center'>{weather.name}, {weather.sys.country}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{Math.round(weather.main.temp)}°C</p>
                  <span className='text-lg'>Real feel: {Math.round(weather.main.feels_like)}°C</span>
                </div>
              </div>
            </div>

            <div className="content-right text-gray-300">
              <div className="card-item">
                <p className='text-xs md:text-sm pr-3'>Description</p>
                <p className='text-sm md:text-lg'>{weather.weather[0].main} — {weather.weather[0].description}</p>
              </div>
              <div className="card-item">
                <p className='text-xs md:text-sm pr-3'>High</p>
                <p className='text-sm md:text-lg'>{Math.round(weather.todayHigh)}°C</p>
              </div>
              <div className="card-item">
                <p className='text-xs md:text-sm pr-3'>Low</p>
                <p className='text-sm md:text-lg'>{Math.round(weather.todayLow)}°C</p>
              </div>
              <div className="card-item">
                <p className='text-xs md:text-sm pr-3'>Humidity</p>
                <p className='text-sm md:text-lg'>{weather.main.humidity}%</p>
              </div>
            </div>
          </div>
        )}

        <SearchHistory
          history={history}
          onItemClick={handleHistoryClick}
          onItemRemove={removeHistoryItem}
        />
        
      </div>

    </div>
  );
}

export default App;