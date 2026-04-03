/** Resolve a representative image URL for a place using Wikipedia (MediaWiki API). */

const WIKI_API = "https://en.wikipedia.org/w/api.php";

type WikiQueryResponse = {
  query?: {
    pages?: Array<{
      pageid: number;
      title: string;
      thumbnail?: { source: string; width: number; height: number };
    }>;
  };
};

async function wikiSearchThumbnail(gsrsearch: string, signal?: AbortSignal): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrsearch,
    gsrlimit: "1",
    gsrnamespace: "0",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "1920",
  });

  const res = await fetch(`${WIKI_API}?${params}`, {
    signal,
    headers: {
      Accept: "application/json",
      "User-Agent": "WeatherApp/1.0 (https://github.com/einar-az/weather-app)",
    },
    next: { revalidate: 86_400 },
  });

  if (!res.ok) return null;
  const data = (await res.json()) as WikiQueryResponse;
  const page = data.query?.pages?.[0];
  return page?.thumbnail?.source ?? null;
}

export type HeroPlace = {
  name: string;
  country?: string;
  countryCode?: string;
  admin1?: string | null;
};

export async function resolveHeroImageUrl(place: HeroPlace, signal?: AbortSignal): Promise<string | null> {
  const { name, country, countryCode, admin1 } = place;
  const tries: string[] = [];

  if (country) tries.push(`${name} ${country}`);
  if (countryCode) tries.push(`${name} ${countryCode}`);
  if (admin1 && admin1.trim() && admin1.trim() !== name.trim()) {
    tries.push(`${name} ${admin1}`);
  }
  tries.push(name);

  const seen = new Set<string>();
  for (const q of tries) {
    const key = q.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const url = await wikiSearchThumbnail(q.trim(), signal);
    if (url) return url;
  }

  return null;
}
