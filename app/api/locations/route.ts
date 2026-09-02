import { NextRequest, NextResponse } from "next/server";
import { City, Country, State } from "country-state-city";

type LocationOption = { value: string; label: string };

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");
  const country = (params.get("country") || "").toUpperCase();
  const state = params.get("state") || "";
  let options: LocationOption[] = [];

  if (type === "countries") {
    options = Country.getAllCountries().map(item => ({ value: item.isoCode, label: item.name }));
  } else if (type === "states" && /^[A-Z]{2}$/.test(country)) {
    options = State.getStatesOfCountry(country).map(item => ({ value: item.isoCode, label: item.name }));
  } else if (type === "cities" && /^[A-Z]{2}$/.test(country) && state) {
    options = City.getCitiesOfState(country, state).map(item => ({ value: item.name, label: item.name }));
  } else {
    return NextResponse.json({ error: "Invalid location query" }, { status: 400 });
  }

  options.sort((a, b) => a.label.localeCompare(b.label));
  return NextResponse.json(options, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
