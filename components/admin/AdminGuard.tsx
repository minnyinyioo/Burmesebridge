"use client";

import { ReactNode, useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = `/${locale}/login`;
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!canAccessAdmin(profile?.role)) {
      window.location.href = `/${locale}`;
      return;
    }

    setAllowed(true);
    setLoading(false);
  }

  if (loading) {
    return <main style={{ padding: 40 }}>Loading...</main>;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}