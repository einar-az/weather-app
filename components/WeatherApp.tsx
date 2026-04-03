"use client";

import { CitySearch } from "@/components/CitySearch";
import { WeatherPanel } from "@/components/WeatherPanel";
import {
  type ForecastBundle,
  type GeocodePlace,
  fetchForecast,
  formatPlaceSubtitle,
} from "@/lib/open-meteo";
import { useCallback, useEffect, useState } from "react";

const defaultPlace: GeocodePlace = {
  id: 5128581,
  name: "New York",
  latitude: 40.71427,
  longitude: -74.00597,
  country: "United States",
  country_code: "US",
  admin1: "New York",
};

export function WeatherApp() {
  const [place, setPlace] = useState<GeocodePlace>(defaultPlace);
  const [forecast, setForecast] = useState<ForecastBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const selectedLabel =
    [place.name, formatPlaceSubtitle(place)].filter(Boolean).join(", ") || null;

  const retry = useCallback(() => {
    setRetryToken((n) => n + 1);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await fetchForecast(place.latitude, place.longitude, ac.signal);
        if (!ac.signal.aborted) setForecast(data);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        if (!ac.signal.aborted) {
          setForecast(null);
          setError("Could not load weather. Check your connection and try again.");
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [place, retryToken]);

  const onSelectCity = useCallback((p: GeocodePlace) => {
    setPlace(p);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-12 px-4 pb-24 pt-16 md:px-8 md:pt-24">
      <header className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-200/80">
          Forecast
        </p>
        <h1 className="mt-3 bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-semibold tracking-tight text-transparent md:text-5xl">
          Weather at a glance
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/50">
          Search any city — suggestions appear as you type. Data from Open‑Meteo.
        </p>
      </header>

      <CitySearch key={place.id} onSelect={onSelectCity} selectedLabel={selectedLabel} />

      {error ? (
        <div
          role="alert"
          className="w-full max-w-xl rounded-2xl border border-rose-400/30 bg-rose-950/40 px-5 py-4 text-sm text-rose-100/90"
        >
          {error}{" "}
          <button
            type="button"
            className="underline decoration-rose-300/50 underline-offset-2 hover:text-white"
            onClick={retry}
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading && !forecast ? (
        <div className="flex w-full max-w-xl flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-16 text-white/50">
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          <p className="text-sm">Loading forecast…</p>
        </div>
      ) : null}

      {forecast ? (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <WeatherPanel name={place.name} subtitle={formatPlaceSubtitle(place)} forecast={forecast} />
        </div>
      ) : null}
    </div>
  );
}
