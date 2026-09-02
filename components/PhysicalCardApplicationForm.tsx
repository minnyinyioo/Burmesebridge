"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, MapPin, Wifi as Contactless } from "lucide-react";
import LocationCombobox, { type LocationOption } from "@/components/LocationCombobox";
import { supabase } from "@/lib/supabase";

type Card = { id: number; card_no: string; card_type: "student" | "teacher" };
type Request = { id: number; status: string; tracking_no: string | null; created_at: string };
type LocationType = "countries" | "states" | "cities";

async function getLocations(type: LocationType, country = "", state = "") {
  const query = new URLSearchParams({ type });
  if (country) query.set("country", country);
  if (state) query.set("state", state);
  const response = await fetch(`/api/locations?${query}`);
  if (!response.ok) throw new Error("Unable to load locations");
  return response.json() as Promise<LocationOption[]>;
}

export default function PhysicalCardApplicationForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]), [requests, setRequests] = useState<Request[]>([]);
  const [cardId, setCardId] = useState(""), [name, setName] = useState(""), [phone, setPhone] = useState("");
  const [country, setCountry] = useState("MM"), [region, setRegion] = useState(""), [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState(""), [address, setAddress] = useState(""), [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false), [countries, setCountries] = useState<LocationOption[]>([]), [regions, setRegions] = useState<LocationOption[]>([]), [cities, setCities] = useState<LocationOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true), [loadingRegions, setLoadingRegions] = useState(true), [loadingCities, setLoadingCities] = useState(false);

  const copy = locale === "zh" ? {
    eyebrow: "实体证件服务", title: "实体 NFC 卡申请", intro: "收件信息单独填写，避免账号页面拥挤。NFC 只连接本站实时查验记录，制作前须由 Admin 审核。", card: "选择电子证件", name: "收件人姓名", phone: "联系电话（含国家区号）", country: "国家 / 地区", region: "州 / 省 / 地区", city: "城市 / 区县", postal: "邮政编码", address: "街道、门牌号和详细地址", submit: "提交审核", need: "尚无有效电子学生证或教师证，暂时无法申请。", status: "申请记录", success: "申请已提交，Admin 审核后才会制作。", chooseCountry: "选择国家或地区", chooseRegion: "选择州、省或地区", chooseCity: "选择城市或区县", search: "输入名称搜索…", empty: "没有匹配的地点", manualRegion: "填写州、省或地区", manualCity: "填写城市或区县",
  } : locale === "my" ? {
    eyebrow: "ရုပ်ပိုင်းဆိုင်ရာ ID ဝန်ဆောင်မှု", title: "NFC ကတ် လျှောက်ထားရန်", intro: "လက်ခံမည့်လိပ်စာကို သီးခြားဖြည့်နိုင်သည်။ NFC သည် BurmeseBridge အွန်လိုင်းစစ်ဆေးမှုမှတ်တမ်းသို့သာ ချိတ်ဆက်ပြီး Admin စစ်ဆေးပြီးမှ ထုတ်လုပ်မည်။", card: "ဒစ်ဂျစ်တယ်ကတ် ရွေးရန်", name: "လက်ခံသူအမည်", phone: "ဖုန်းနံပါတ် (နိုင်ငံကုဒ်ပါ)", country: "နိုင်ငံ / ဒေသ", region: "ပြည်နယ် / တိုင်း / ဒေသ", city: "မြို့ / ခရိုင်", postal: "စာတိုက်ကုဒ်", address: "လမ်း၊ အိမ်အမှတ်နှင့် လိပ်စာအပြည့်အစုံ", submit: "စစ်ဆေးရန် တင်သွင်းမည်", need: "အသက်ဝင်သော ကျောင်းသား/ဆရာ ဒစ်ဂျစ်တယ်ကတ် မရှိသေးပါ။", status: "လျှောက်လွှာမှတ်တမ်း", success: "လျှောက်လွှာတင်ပြီးပါပြီ။ Admin အတည်ပြုပြီးမှ ထုတ်လုပ်မည်။", chooseCountry: "နိုင်ငံ သို့မဟုတ် ဒေသ ရွေးပါ", chooseRegion: "ပြည်နယ်၊ တိုင်း သို့မဟုတ် ဒေသ ရွေးပါ", chooseCity: "မြို့ သို့မဟုတ် ခရိုင် ရွေးပါ", search: "အမည်ဖြင့် ရှာရန်…", empty: "ကိုက်ညီသောနေရာ မရှိပါ", manualRegion: "ပြည်နယ်၊ တိုင်း သို့မဟုတ် ဒေသ ဖြည့်ပါ", manualCity: "မြို့ သို့မဟုတ် ခရိုင် ဖြည့်ပါ",
  } : {
    eyebrow: "Physical ID service", title: "Apply for a physical NFC card", intro: "Delivery information is collected on this dedicated page. NFC links only to the live BurmeseBridge verification record, and Admin approval is required before production.", card: "Select digital ID", name: "Recipient name", phone: "Phone including country code", country: "Country / region", region: "State / province / region", city: "City / district", postal: "Postal code", address: "Street, building and full delivery address", submit: "Submit for review", need: "No active digital student or teacher ID is available.", status: "Application history", success: "Application submitted. Production starts only after Admin approval.", chooseCountry: "Choose country or region", chooseRegion: "Choose state, province or region", chooseCity: "Choose city or district", search: "Search by name…", empty: "No matching location", manualRegion: "Enter state, province or region", manualCity: "Enter city or district",
  };

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { router.replace(`/${locale}/login?next=/${locale}/physical-card`); return; }
    const [cardResult, requestResult] = await Promise.all([
      supabase.from("education_id_cards").select("id,card_no,card_type").eq("user_id", auth.user.id).eq("status", "active").gt("expires_at", new Date().toISOString()).order("issued_at", { ascending: false }),
      supabase.from("education_physical_card_requests").select("id,status,tracking_no,created_at").order("created_at", { ascending: false }),
    ]);
    const next = (cardResult.data || []) as Card[];
    setCards(next); setRequests((requestResult.data || []) as Request[]);
    if (next[0]) setCardId(String(next[0].id));
  }, [locale, router]);

  useEffect(() => {
    // Auth-backed form data is loaded only after the client session is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  useEffect(() => {
    let active = true;
    Promise.all([getLocations("countries"), getLocations("states", "MM")]).then(([countryItems, regionItems]) => {
      if (active) { setCountries(countryItems); setRegions(regionItems); }
    }).catch(() => setMessage("Unable to load locations. Please refresh the page.")).finally(() => {
      if (active) { setLoadingCountries(false); setLoadingRegions(false); }
    });
    return () => { active = false; };
  }, []);

  async function changeCountry(value: string) {
    setCountry(value); setRegion(""); setCity(""); setRegions([]); setCities([]); setLoadingRegions(true);
    try { setRegions(await getLocations("states", value)); } catch { setMessage("Unable to load regions. Please try again."); } finally { setLoadingRegions(false); }
  }
  async function changeRegion(value: string) {
    setRegion(value); setCity(""); setCities([]); setLoadingCities(true);
    try { setCities(await getLocations("cities", country, value)); } catch { setMessage("Unable to load cities. Please try again."); } finally { setLoadingCities(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const countryName = countries.find(item => item.value === country)?.label || country;
    const regionName = regions.find(item => item.value === region)?.label || region;
    const cityName = cities.find(item => item.value === city)?.label || city;
    const fullAddress = [`Country/Region: ${countryName} (${country})`, `Region: ${regionName}`, `City/District: ${cityName}`, postalCode ? `Postal code: ${postalCode}` : "", `Address: ${address}`].filter(Boolean).join("\n");
    const { error } = await supabase.rpc("request_physical_education_card", { p_card_id: Number(cardId), p_name: name, p_phone: phone, p_address: fullAddress });
    setBusy(false); setMessage(error ? error.message : copy.success); if (!error) await load();
  }

  return <main className="physical-card-page"><section className="physical-card-form-shell">
    <header><span className="physical-card-page-icon"><Contactless size={28} /></span><div><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.intro}</p></div></header>
    {!cardId ? <p className="physical-card-empty">{copy.need}</p> : <form onSubmit={submit}>
      <label className="full"><span>{copy.card}</span><select required value={cardId} onChange={event => setCardId(event.target.value)}>{cards.map(card => <option value={card.id} key={card.id}>{card.card_no} · {card.card_type}</option>)}</select></label>
      <label><span>{copy.name}</span><input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={event => setName(event.target.value)} /></label>
      <label><span>{copy.phone}</span><input required minLength={6} maxLength={40} autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} /></label>
      <label className="full"><span>{copy.country}</span><LocationCombobox value={country} options={countries} placeholder={copy.chooseCountry} searchPlaceholder={copy.search} emptyText={copy.empty} loading={loadingCountries} onChange={value => void changeCountry(value)} /></label>
      <label><span>{copy.region}</span>{!loadingRegions && regions.length === 0 ? <input required maxLength={120} autoComplete="address-level1" placeholder={copy.manualRegion} value={region} onChange={event => { setRegion(event.target.value); setCity(""); }} /> : <LocationCombobox value={region} options={regions} placeholder={copy.chooseRegion} searchPlaceholder={copy.search} emptyText={copy.empty} disabled={!country} loading={loadingRegions} onChange={value => void changeRegion(value)} />}</label>
      <label><span>{copy.city}</span>{region && !loadingCities && cities.length === 0 ? <input required maxLength={120} autoComplete="address-level2" placeholder={copy.manualCity} value={city} onChange={event => setCity(event.target.value)} /> : <LocationCombobox value={city} options={cities} placeholder={copy.chooseCity} searchPlaceholder={copy.search} emptyText={copy.empty} disabled={!region} loading={loadingCities} onChange={setCity} />}</label>
      <label><span>{copy.postal}</span><input maxLength={24} autoComplete="postal-code" value={postalCode} onChange={event => setPostalCode(event.target.value)} /></label>
      <label className="full"><span>{copy.address}</span><textarea required minLength={5} maxLength={700} autoComplete="street-address" value={address} onChange={event => setAddress(event.target.value)} /></label>
      <button disabled={busy}><CreditCard size={18} />{copy.submit}</button>
    </form>}
    {message ? <p className="verification-message" role="status">{message}</p> : null}
    {requests.length ? <section className="physical-card-history"><h2><MapPin size={18} />{copy.status}</h2>{requests.map(item => <article key={item.id}><span>#{item.id}</span><strong>{item.status}</strong><time>{new Date(item.created_at).toLocaleDateString(locale)}</time>{item.tracking_no ? <small>{item.tracking_no}</small> : null}</article>)}</section> : null}
  </section></main>;
}
