"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export default function LanguageMenu({
  locale,
}: {
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const label = {
    my: "မြန်မာ",
    zh: "中文",
    en: "EN",
  };

  useEffect(() => {
    function close(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", close);

    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      style={{
        position: "relative",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "transparent",
          border: "1px solid #e2e8f0",
          borderRadius: "999px",
          padding: "8px 12px",
          color: "inherit",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        {label[locale as keyof typeof label] || "EN"} ▾
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "42px",
            width: "140px",
            background: "white",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
            overflow: "hidden",
            zIndex: 999,
          }}
        >
          <LangLink href="/my" label="မြန်မာ" />
          <LangLink href="/zh" label="中文" />
          <LangLink href="/en" label="English" />
        </div>
      )}
    </div>
  );
}

function LangLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "12px 14px",
        color: "#0f172a",
        textDecoration: "none",
        borderBottom: "1px solid #f1f5f9",
        fontWeight: 700,
      }}
    >
      {label}
    </Link>
  );
}