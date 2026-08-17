# Weather App

A React + Vite weather app with location autocomplete and search history, powered by the OpenWeatherMap API.

## Features

- 🔍 Search by city, state, or country with debounced autocomplete
- 📍 Geocoded suggestions with duplicate filtering
- 🌤️ Current weather with condition icon, temperature, real feel, humidity, and today's high/low
- 🕘 Search history with click-to-reload and per-item delete
- 💾 History persisted locally via `localStorage`
- 🎨 Glassmorphism UI styled with Tailwind CSS

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [OpenWeatherMap API](https://openweathermap.org/api) (current weather, geocoding, 5-day forecast)
- [Font Awesome](https://fontawesome.com/) for icons

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/x3iides/weather-react-app.git
cd weather-react-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

Download the `.env` file attached and place in the project root:

### 4. Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.