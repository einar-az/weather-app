"use client";

import {
  type GeocodePlace,
  formatPlaceSubtitle,
  searchPlaces,
} from "@/lib/open-meteo";
import type { SVGProps } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type CitySearchProps = {
  onSelect: (place: GeocodePlace) => void;
  selectedLabel: string | null;
};

export function CitySearch({ onSelect, selectedLabel }: CitySearchProps) {
  const initial = selectedLabel ?? "";
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeocodePlace[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const ac = new AbortController();
    const t = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const places = await searchPlaces(query, ac.signal);
        if (!ac.signal.aborted) {
          setResults(places);
          setActiveIndex(places.length ? 0 : -1);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        if (!ac.signal.aborted) setError("Search failed. Try again.");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [query]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const pick = useCallback(
    (place: GeocodePlace) => {
      onSelect(place);
      const label = [place.name, formatPlaceSubtitle(place)].filter(Boolean).join(", ");
      setQuery(label);
      setOpen(false);
      setResults([]);
      setActiveIndex(-1);
      inputRef.current?.blur();
    },
    [onSelect]
  );

  const showList = Boolean(
    open && query.trim().length >= 2 && (loading || results.length > 0 || error)
  );

  return (
    <div ref={wrapRef} className="relative w-full max-w-xl">
      <label htmlFor={listId + "-input"} className="sr-only">
        Search for a city
      </label>
      <div className="group relative">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45 transition group-focus-within:text-sky-300/90"
          aria-hidden
        >
          <SearchIcon className="h-5 w-5" />
        </span>
        <input
          ref={inputRef}
          id={listId + "-input"}
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search city…"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId + "-listbox"}
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!showList && e.key === "ArrowDown" && results.length) {
              setOpen(true);
              setActiveIndex(0);
              e.preventDefault();
              return;
            }
            if (e.key === "Escape") {
              setOpen(false);
              return;
            }
            if (!results.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1) % results.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
            } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
              e.preventDefault();
              pick(results[activeIndex]);
            }
          }}
          className="w-full rounded-2xl border border-white/15 bg-black/25 py-3.5 pl-12 pr-4 text-[15px] text-white shadow-inner shadow-black/20 outline-none ring-0 backdrop-blur-md transition placeholder:text-white/35 focus:border-sky-400/50 focus:bg-black/35 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.2)]"
        />
        {loading ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
            <Spinner />
          </span>
        ) : null}
      </div>

      {selectedLabel ? (
        <p className="mt-2 text-center text-xs text-white/40 md:text-left">Showing weather for {selectedLabel}</p>
      ) : (
        <p className="mt-2 text-center text-xs text-white/40 md:text-left">
          Type at least two letters — use arrow keys and Enter in the list.
        </p>
      )}

      {showList ? (
        <ul
          id={listId + "-listbox"}
          role="listbox"
          className="absolute z-20 mt-3 max-h-80 w-full overflow-auto rounded-2xl border border-white/12 bg-slate-950/90 py-2 shadow-panel shadow-black/60 backdrop-blur-xl"
        >
          {error ? (
            <li className="px-4 py-3 text-sm text-rose-300/90" role="option" aria-selected={false}>
              {error}
            </li>
          ) : loading ? (
            <li className="px-4 py-3 text-sm text-white/50" role="status">
              Searching…
            </li>
          ) : results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-white/50" role="status">
              No cities found.
            </li>
          ) : (
            results.map((place, idx) => {
              const active = idx === activeIndex;
              const sub = formatPlaceSubtitle(place);
              return (
                <li key={place.id} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left text-sm transition ${
                      active ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/[0.06]"
                    }`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(place)}
                  >
                    <span className="font-medium">{place.name}</span>
                    {sub ? <span className="text-xs text-white/50">{sub}</span> : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
