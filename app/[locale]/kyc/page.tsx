"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import KycApplicationPanel from "@/components/kyc/KycApplicationPanel";
import { supabase } from "@/lib/supabase";

export default function KycPage() {
  const params = useParams();
  const locale = String(params.locale || "en");
  const router = useRouter();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) router.replace(`/${locale}/login?next=/${locale}/kyc`);
      else setUserId(data.user.id);
    });
    return () => { active = false; };
  }, [locale, router]);

  return <main className="account-page"><section className="account-shell kyc-page-shell"><KycApplicationPanel locale={locale} userId={userId} /></section></main>;
}
