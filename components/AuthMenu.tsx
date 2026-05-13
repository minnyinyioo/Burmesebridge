"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AuthMenu({ locale }: { locale: string }) {
  const [email, setEmail] = useState<string | null>(null);

  const text = {
    my: {
      login: "ဝင်ရန်",
      my: "ကျွန်ုပ်",
      logout: "ထွက်ရန်",
    },
    zh: {
      login: "登录",
      my: "我的",
      logout: "退出",
    },
    en: {
      login: "Login",
      my: "Me",
      logout: "Logout",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  }

  if (!email) {
    return <Link href={`/${locale}/login`}>{t.login}</Link>;
  }

  return (
    <>
      <Link href={`/${locale}/me`}>{t.my}</Link>

      <button
        onClick={logout}
        style={{
          border: "none",
          background: "transparent",
          font: "inherit",
          cursor: "pointer",
          color: "inherit",
          padding: 0,
        }}
      >
        {t.logout}
      </button>
    </>
  );
}