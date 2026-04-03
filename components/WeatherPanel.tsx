"use client";

import {
  emojiForWmo,
  type ForecastBundle,
  labelForWmo,
} from "@/lib/open-meteo";

type WeatherPanelProps = {
  name: string;
  subtitle: string;
  forecast: ForecastBundle;
};

export function WeatherPanel({ name, subtitle, forecast }: WeatherPanelProps) {
  const { current, daily, timezone } = forecast;
  const emoji = emojiForWmo(current.weatherCode, current.isDay);
  const label = labelForWmo(current.weatherCode);

  return (
    <div className="w-full max-w-xl space-y-8">
      <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-8 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{name}</h2>
            <p className="mt-1 text-sm text-white/55">{subtitle}</p>
            <p className="mt-1 text-xs text-white/35">{timezone.split("_").join(" ")}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-6xl leading-none sm:text-7xl" aria-hidden>
              {emoji}
            </span>
            <div>
              <p className="text-5xl font-light tabular-nums tracking-tight text-white sm:text-6xl">
                {Math.round(current.temperature)}°
              </p>
              <p className="text-sm text-white/60">{label}</p>
            </div>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Feels like" value={`${Math.round(current.apparent)}°`} />
          <Stat label="Humidity" value={`${current.humidity}%`} />
          <Stat label="Wind" value={`${Math.round(current.windSpeed)} km/h`} />
          <Stat label="Local time" value={formatLocalTime(current.time)} />
        </dl>
      </div>

      <section aria-label="7 day outlook">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-white/45">Next 7 days</h3>
        <div className="grid gap-3 sm:grid-cols-7 sm:gap-2">
          {daily.dates.map((date, i) => {
            const code = daily.codes[i] ?? 0;
            const dayEmoji = emojiForWmo(code, true);
            const max = daily.maxTemp[i];
            const min = daily.minTemp[i];
            return (
              <div
                key={date}
                className="flex flex-row items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:flex-col sm:px-2 sm:py-4"
              >
                <p className="text-sm font-medium text-white/90 sm:text-xs">{shortWeekday(date)}</p>
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  {dayEmoji}
                </span>
                <div className="text-right sm:text-center">
                  <p className="tabular-nums text-sm text-white">{Math.round(max)}°</p>
                  <p className="tabular-nums text-xs text-white/45">{Math.round(min)}°</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
      <dt className="text-xs text-white/45">{label}</dt>
      <dd className="mt-1 text-lg font-medium tabular-nums text-white">{value}</dd>
    </div>
  );
}

function formatLocalTime(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "—";
  }
}

function shortWeekday(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(d);
  } catch {
    return "";
  }
}
