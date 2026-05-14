"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthMenu({
  locale,
}: {
  locale: string;
}) {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const text = {
    my: {
      login: "ဝင်ရန်",
      me: "ကျွန်ုပ်",
      dashboard: "ဒက်ရှ်ဘုတ်",
      profile: "ပရိုဖိုင်",
      account: "ကျွန်ုပ်အကောင့်",
      checkin: "ချက်အင်",
      logout: "ထွက်ရန်",
    },

    zh: {
      login: "登录",
      me: "我的",
      dashboard: "控制台",
      profile: "个人资料",
      account: "我的账号",
      checkin: "签到",
      logout: "退出登录",
    },

    en: {
      login: "Login",
      me: "My",
      dashboard: "Dashboard",
      profile: "Profile",
      account: "My Account",
      checkin: "Check In",
      logout: "Logout",
    },
  };

  const t =
    text[locale as keyof typeof text] ||
    text.en;

  useEffect(() => {
    async function getUser() {
      const { data } =
        await supabase.auth.getUser();

      setEmail(data.user?.email ?? null);
    }

    getUser();

    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    window.location.href = `/${locale}/login`;
  }

  if (!email) {
    return (
      <Link href={`/${locale}/login`}>
        {t.login}
      </Link>
    );
  }

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
          border: "none",
          color: "inherit",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "15px",
        }}
      >
        {t.me} ▾
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "42px",
            width: "240px",
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 12px 30px rgba(15,23,42,0.12)",
            overflow: "hidden",
            zIndex: 999,
          }}
        >
          <div
            style={{
              padding: "16px",
              borderBottom:
                "1px solid #e2e8f0",
              fontSize: "14px",
              color: "#64748b",
            }}
          >
            {email}
          </div>

          <MenuLink
            href={`/${locale}/dashboard`}
            label={t.dashboard}
          />

          <MenuLink
            href={`/${locale}/profile`}
            label={t.profile}
          />

          <MenuLink
            href={`/${locale}/me`}
            label={t.account}
          />

          <MenuLink
            href={`/${locale}/checkin`}
            label={t.checkin}
          />

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "14px 18px",
              background: "white",
              border: "none",
              cursor: "pointer",
              color: "#ef4444",
              fontWeight: 700,
            }}
          >
            {t.logout}
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({
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
        padding: "14px 18px",
        color: "#0f172a",
        textDecoration: "none",
        borderBottom:
          "1px solid #f1f5f9",
        fontWeight: 600,
      }}
    >
      {label}
    </Link>
  );
}