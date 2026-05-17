"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Badge from "@/components/Badges";

type BanUser = {
  id: string;
  display_name: string | null;
  role: string | null;
  badge: string | null;
  verified: boolean | null;
  ban_reason: string | null;
};

export default function AdminBanPage() {
  return (
    <AdminGuard>
      <BanContent />
    </AdminGuard>
  );
}

function BanContent() {
  const [users, setUsers] = useState<BanUser[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, role, badge, verified, ban_reason")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setUsers(data || []);
  }

  async function banUser(userId: string) {
    const reason = prompt("Ban reason") || "No reason provided";

    const { error } = await supabase
      .from("profiles")
      .update({
        role: "banned",
        badge: "member",
        verified: false,
        ban_reason: reason,
      })
      .eq("id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadUsers();
  }

  async function unbanUser(userId: string) {
    const { error } = await supabase
      .from("profiles")
      .update({
        role: "member",
        badge: "member",
        ban_reason: null,
      })
      .eq("id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadUsers();
  }

  return (
    <div className="adminShell">
      <AdminSidebar />

      <div className="adminContent">
        <h1>Ban Center</h1>

        <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
          {users.map((user) => (
            <div
              key={user.id}
              className="feedCard"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div>
                <strong>{user.display_name || "No name"}</strong>

                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  {user.verified && <Badge type="verified" />}
                  <Badge type={(user.badge || user.role || "member") as any} />
                </div>

                {user.ban_reason && (
                  <p style={{ marginTop: 8, color: "#ef4444" }}>
                    {user.ban_reason}
                  </p>
                )}
              </div>

              {user.role === "banned" ? (
                <button onClick={() => unbanUser(user.id)} style={button}>
                  Unban
                </button>
              ) : (
                <button
                  onClick={() => banUser(user.id)}
                  style={{
                    ...button,
                    background: "#ef4444",
                  }}
                >
                  Ban
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const button = {
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: "10px 16px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 700,
};