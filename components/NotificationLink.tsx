"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";
export default function NotificationLink({ locale }: { locale: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { count: value } = await supabase
        .from("user_notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null);
      if (active) setCount(value || 0);
    }
    void load();
    const channel = supabase
      .channel("notification-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_notifications" },
        () => void load(),
      )
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);
  const label =
    locale === "zh" ? "通知" : locale === "my" ? "အသိပေးချက်" : "Notifications";
  return (
    <Link
      href={`/${locale}/notifications`}
      className="notification-link"
      aria-label={`${label}${count ? ` (${count})` : ""}`}
    >
      <Bell size={17} />
      {count > 0 && <span>{count > 99 ? "99+" : count}</span>}
    </Link>
  );
}
