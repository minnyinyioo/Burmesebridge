"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type LocationOption = { value: string; label: string };

export default function LocationCombobox({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled = false,
  loading = false,
  onChange,
}: {
  value: string;
  options: LocationOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
  loading?: boolean;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find(option => option.value === value);
  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    return keyword ? options.filter(option => option.label.toLocaleLowerCase().includes(keyword)) : options;
  }, [options, query]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return <div className="location-combobox" ref={root}>
    <button
      type="button"
      className="location-combobox-trigger"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={id}
      disabled={disabled || loading}
      onClick={() => { setOpen(current => !current); setQuery(""); }}
    >
      <span className={selected ? "" : "placeholder"}>{loading ? "…" : selected?.label || placeholder}</span>
      <ChevronDown size={18} />
    </button>
    {open ? <div className="location-combobox-menu">
      <div className="location-combobox-search">
        <Search size={16} />
        <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder={searchPlaceholder} />
      </div>
      <div id={id} role="listbox" className="location-combobox-options">
        {filtered.length ? filtered.map(option => <button
          type="button"
          role="option"
          aria-selected={option.value === value}
          key={option.value}
          onClick={() => { onChange(option.value); setOpen(false); setQuery(""); }}
        >
          <span>{option.label}</span>{option.value === value ? <Check size={16} /> : null}
        </button>) : <p>{emptyText}</p>}
      </div>
    </div> : null}
  </div>;
}
