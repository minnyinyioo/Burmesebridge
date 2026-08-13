"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function GlobalSearch({ locale }: { locale: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const placeholder = locale === "zh" ? "全站搜索" : locale === "my" ? "ရှာဖွေရန်" : "Search";

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push(`/${locale}/search?q=${encodeURIComponent(value)}`);
    else router.push(`/${locale}/search`);
  }

  return (
    <form className="global-search-form" role="search" onSubmit={submit}>
      <Search size={16} aria-hidden="true" />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </form>
  );
}
