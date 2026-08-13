"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function GlobalSearch({ locale }: { locale: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholder = locale === "zh" ? "全站搜索" : locale === "my" ? "ရှာဖွေရန်" : "Search";

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push(`/${locale}/search?q=${encodeURIComponent(value)}`);
    else router.push(`/${locale}/search`);
  }

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  return (
    <form className="global-search-form" role="search" onSubmit={submit}>
      <Search size={16} aria-hidden="true" />
      <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
      <kbd>⌘K</kbd>
    </form>
  );
}
