"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MfaGuard({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    async function enforce() {
      const { data: userData } = await supabase.auth.getUser();
      if (!active || !userData.user) return;
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!active || data?.nextLevel !== "aal2" || data.currentLevel === "aal2") return;
      const verifyPath = `/${locale}/mfa-verify`;
      if (pathname !== verifyPath) router.replace(verifyPath);
    }
    void enforce();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void enforce() });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [locale, pathname, router]);

  return null;
}
