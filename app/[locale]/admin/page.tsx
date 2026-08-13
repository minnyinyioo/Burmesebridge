"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminGuard from "@/components/admin/AdminGuard";

/**
 * Admin Dashboard
 * 只允许 role 为 admin / moderator 的用户访问。
 */
export default function AdminPage() {
  const params = useParams();
  const locale = String(params.locale || "my");
const text = {
  my: {
    dashboard: "အက်မင်ဒက်ရှ်ဘုတ်",
    users: "အသုံးပြုသူများ",
    posts: "ပို့စ်များ",
  },
  zh: {
    dashboard: "后台管理",
    users: "用户",
    posts: "帖子",
  },
  en: {
    dashboard: "Admin Dashboard",
    users: "Users",
    posts: "Posts",
  },
};

  const t = text[locale as keyof typeof text] || text.en;
  const [loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  const checkAdminAccess = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = `/${locale}/login`;
      return;
    }

    const [users, posts] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
    ]);

    setUsersCount(users.count || 0);
    setPostsCount(posts.count || 0);
    setLoading(false);
  }, [locale]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkAdminAccess();
  }, [checkAdminAccess]);

  if (loading) {
    return <main style={{ padding: 40 }}>Loading...</main>;
  }

  return (
    <AdminGuard><div className="adminShell">
      <AdminSidebar />

      <div className="adminContent">
        <h1>{t.dashboard}</h1>

        <div className="adminGrid">
          <AdminStatCard title={t.users} value={usersCount} />
          <AdminStatCard title={t.posts} value={postsCount} />
        </div>
      </div>
    </div></AdminGuard>
  );
}
