"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarCheck, ChevronDown, CircleUserRound, LayoutDashboard, LogIn, LogOut, UserRound } from "lucide-react";

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
      login: "အကောင့်ဝင်ရန်",
      me: "ကျွန်ုပ်",
      dashboard: "ဒက်ရှ်ဘုတ်",
      profile: "ပရိုဖိုင်",
      account: "ကျွန်ုပ်အကောင့်",
      checkin: "ချက်အင်",
      logout: "အကောင့်ထွက်ရန်",
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
      <Link href={`/${locale}/login`} className="auth-login-button">
        <LogIn size={16} />{t.login}
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="menu-popover">
      <button
        onClick={() => setOpen(!open)}
        className="site-action-button"
        aria-expanded={open}
      >
        <CircleUserRound size={18} />{t.me}<ChevronDown size={14} />
      </button>

      {open && (
        <div className="site-dropdown auth-dropdown">
          <div className="dropdown-account">
            {email}
          </div>

          <MenuLink
            href={`/${locale}/dashboard`}
            label={t.dashboard}
            icon={<LayoutDashboard size={17} />}
          />

          <MenuLink
            href={`/${locale}/profile`}
            label={t.profile}
            icon={<UserRound size={17} />}
          />

          <MenuLink
            href={`/${locale}/me`}
            label={t.account}
            icon={<CircleUserRound size={17} />}
          />

          <MenuLink
            href={`/${locale}/checkin`}
            label={t.checkin}
            icon={<CalendarCheck size={17} />}
          />

          <button
            onClick={handleLogout}
            className="dropdown-link dropdown-danger"
          >
            <LogOut size={17} />{t.logout}
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="dropdown-link">
      {icon}{label}
    </Link>
  );
}
