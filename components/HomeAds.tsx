"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Ad = { id: number; title: string; subtitle: string | null; image_url: string | null; target_url: string | null };

export default function HomeAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    void supabase.from("homepage_ads").select("id,title,subtitle,image_url,target_url").eq("active", true).order("sort_order")
      .then(({ data, error }) => {
        if (error) console.error("Unable to load homepage ads", error);
        if (active) setAds((data || []) as Ad[]);
      });
    return () => { active = false };
  }, []);

  useEffect(() => {
    if (ads.length < 2) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % ads.length), 5000);
    return () => window.clearInterval(timer);
  }, [ads.length]);

  if (!ads.length) return null;
  const ad = ads[index] || ads[0];
  const content = <><div className="home-ad-copy"><small>ADVERTISEMENT</small><h2>{ad.title}</h2>{ad.subtitle ? <p>{ad.subtitle}</p> : null}</div>{ad.target_url ? <ExternalLink aria-hidden="true" size={20} /> : null}</>;

  return <section className="home-ad-slot" aria-label="Advertisement" style={ad.image_url ? { backgroundImage: `linear-gradient(90deg,rgba(6,42,36,.94),rgba(6,42,36,.45)),url(${ad.image_url})` } : undefined}>
    {ad.target_url ? <a className="home-ad-content" href={ad.target_url} target="_blank" rel="sponsored noopener noreferrer">{content}</a> : <div className="home-ad-content">{content}</div>}
    {ads.length > 1 ? <div className="home-ad-dots" aria-label="Choose advertisement">{ads.map((item, itemIndex) => <button type="button" key={item.id} className={itemIndex === index ? "active" : ""} onClick={() => setIndex(itemIndex)} aria-label={`Advertisement ${itemIndex + 1}`} aria-current={itemIndex === index ? "true" : undefined} />)}</div> : null}
  </section>;
}
