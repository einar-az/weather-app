"use client";

import type { GeocodePlace } from "@/lib/open-meteo";
import Image from "next/image";
import { useEffect, useState } from "react";

type LocationBackdropProps = {
  place: GeocodePlace;
};

export function LocationBackdrop({ place }: LocationBackdropProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    setImageReady(false);

    const qs = new URLSearchParams({ name: place.name });
    if (place.country) qs.set("country", place.country);
    if (place.country_code) qs.set("countryCode", place.country_code);
    if (place.admin1) qs.set("admin1", place.admin1);

    (async () => {
      try {
        const res = await fetch(`/api/hero-image?${qs}`, { signal: ac.signal });
        if (!res.ok) {
          if (!ac.signal.aborted) setImageUrl(null);
          return;
        }
        const data = (await res.json()) as { url: string | null };
        if (!ac.signal.aborted) setImageUrl(data.url);
      } catch {
        if (!ac.signal.aborted) setImageUrl(null);
      }
    })();

    return () => ac.abort();
  }, [place.id, place.name, place.country, place.country_code, place.admin1]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {imageUrl ? (
        <>
          <div className="absolute inset-0">
            <Image
              key={imageUrl}
              src={imageUrl}
              alt=""
              fill
              sizes="100vw"
              priority={false}
              className={`scale-[1.04] object-cover transition-opacity duration-700 ease-out ${
                imageReady ? "opacity-100" : "opacity-0"
              }`}
              onLoadingComplete={() => setImageReady(true)}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/88 via-slate-950/72 to-slate-950/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_0%,_rgb(2,6,23)_75%)]" />
        </>
      ) : null}

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-sky-500/20 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-[380px] w-[380px] rounded-full bg-indigo-600/15 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-[280px] w-[480px] rounded-full bg-cyan-500/12 blur-[100px]" />
      </div>
    </div>
  );
}
