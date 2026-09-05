import { NextRequest, NextResponse } from "next/server";
import { City, Country, State } from "country-state-city";

type LocationOption = { value: string; label: string };
type PostalRecord = {
  postal_code?: string;
  place_name?: string;
  admin_name1?: string;
  admin_code1?: string;
};

async function postalRecords(country: string, state = "", city = "") {
  const filters = [`country_code="${country}"`];
  if (state) filters.push(`(admin_code1="${state}" or search(admin_name1,"${state.replaceAll('"', '\\"')}"))`);
  if (city) filters.push(`search(place_name,"${city.replaceAll('"', '\\"')}")`);
  const url = new URL("https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-postal-code/records");
  url.searchParams.set("limit", "100");
  url.searchParams.set("where", filters.join(" and "));
  const response = await fetch(url, { next: { revalidate: 604800 } });
  if (!response.ok) return [];
  const data = await response.json() as { results?: PostalRecord[] };
  return data.results || [];
}

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
    if (!options.length) {
      const seen = new Set<string>();
      options = (await postalRecords(country, state)).flatMap(item => {
        const name = item.place_name?.trim();
        if (!name || seen.has(name.toLocaleLowerCase())) return [];
        seen.add(name.toLocaleLowerCase());
        return [{ value: name, label: name }];
      });
    }
  } else if (type === "postal" && /^[A-Z]{2}$/.test(country) && state && params.get("city")) {
    const seen = new Set<string>();
    options = (await postalRecords(country, state, params.get("city") || "")).flatMap(item => {
      const code = item.postal_code?.trim();
      const place = item.place_name?.trim();
      if (!code || seen.has(code)) return [];
      seen.add(code);
      return [{ value: code, label: place ? `${code} · ${place}` : code }];
    });
  } else {
    return NextResponse.json({ error: "Invalid location query" }, { status: 400 });
  }

  options.sort((a, b) => a.label.localeCompare(b.label));
  return NextResponse.json(options, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
