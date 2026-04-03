import { resolveHeroImageUrl } from "@/lib/location-hero-image";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim();
  if (!name) {
    return NextResponse.json({ url: null as string | null }, { status: 400 });
  }

  const country = req.nextUrl.searchParams.get("country") ?? undefined;
  const countryCode = req.nextUrl.searchParams.get("countryCode") ?? undefined;
  const admin1 = req.nextUrl.searchParams.get("admin1") || undefined;

  try {
    const url = await resolveHeroImageUrl({
      name,
      country: country || undefined,
      countryCode: countryCode || undefined,
      admin1,
    });
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ url: null as string | null });
  }
}
