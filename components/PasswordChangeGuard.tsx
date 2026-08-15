"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PasswordChangeGuard({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const enforce = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active || data.user?.app_metadata?.must_change_password !== true) return;
      const resetPath = `/${locale}/reset-password`;
      if (pathname !== resetPath) router.replace(`${resetPath}?forced=1`);
    };
    void enforce();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void enforce() });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [locale, pathname, router]);

  return null;
}
