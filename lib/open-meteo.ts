export type GeocodePlace = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string | null;
};

export type GeocodeResponse = {
  results?: GeocodePlace[];
};

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodePlace[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: "8",
    language: "en",
    format: "json",
  });

  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
    signal,
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Could not search places.");
  const data = (await res.json()) as GeocodeResponse;
  return data.results ?? [];
}

export type CurrentWeather = {
  temperature: number;
  apparent: number;
  humidity: number;
  windSpeed: number;
  isDay: boolean;
  weatherCode: number;
  time: string;
};

export type DailyForecast = {
  dates: string[];
  codes: number[];
  maxTemp: number[];
  minTemp: number[];
};

export type ForecastBundle = {
  timezone: string;
  current: CurrentWeather;
  daily: DailyForecast;
};

type ForecastApiResponse = {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

export async function fetchForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<ForecastBundle> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "is_day",
    ].join(","),
    daily: ["weather_code", "temperature_2m_max", "temperature_2m_min"].join(","),
    timezone: "auto",
    forecast_days: "7",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal,
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Could not load forecast.");
  const data = (await res.json()) as ForecastApiResponse;

  const c = data.current;
  return {
    timezone: data.timezone,
    current: {
      time: c.time,
      temperature: c.temperature_2m,
      apparent: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      isDay: c.is_day === 1,
      weatherCode: c.weather_code,
    },
    daily: {
      dates: data.daily.time,
      codes: data.daily.weather_code,
      maxTemp: data.daily.temperature_2m_max,
      minTemp: data.daily.temperature_2m_min,
    },
  };
}

export function labelForWmo(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Weather";
}

export function emojiForWmo(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code === 1) return isDay ? "🌤️" : "🌙";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 85 && code <= 86) return "❄️";
  if (code >= 95 && code <= 99) return "⛈️";
  return "🌡️";
}

export function formatPlaceSubtitle(place: GeocodePlace): string {
  const parts: string[] = [];
  if (place.admin1) parts.push(place.admin1);
  if (place.country ?? place.country_code) {
    parts.push(place.country ?? place.country_code ?? "");
  }
  return parts.filter(Boolean).join(" · ");
}
