"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { canAccessAdmin } from "@/lib/permissions";

/**
 * AdminGuard
 * 负责保护后台页面。
 * 只有 admin / moderator 可以进入。
 */
export default function AdminGuard({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams();
  const locale = String(params.locale || "my");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [denied, setDenied] = useState(false);

  const checkAccess = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!canAccessAdmin(profile?.role)) {
      setDenied(true);
      setLoading(false);
      return;
    }

    setAllowed(true);
    setLoading(false);
  }, [locale, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkAccess();
  }, [checkAccess]);

  if (loading) {
    return <main style={{ padding: 40 }}>Loading...</main>;
  }

  if (!allowed) {
    const copy = locale === "zh"
      ? { title: "无权访问后台", body: "此区域仅限管理员和版主使用。", back: "返回首页" }
      : locale === "my"
        ? { title: "စီမံခန့်ခွဲရေးသို့ ဝင်ခွင့်မရှိပါ", body: "ဤနေရာကို အက်မင်နှင့် မော်ဒရေတာများသာ အသုံးပြုနိုင်ပါသည်။", back: "ပင်မစာမျက်နှာသို့" }
        : { title: "Admin access denied", body: "This area is available only to administrators and moderators.", back: "Back to home" };
    return denied ? <main className="auth-page"><section className="auth-card admin-denied" role="alert"><h1>{copy.title}</h1><p className="auth-copy">{copy.body}</p><Link className="auth-submit auth-submit-link" href={`/${locale}`}>{copy.back}</Link></section></main> : null;
  }

  return <>{children}</>;
}
