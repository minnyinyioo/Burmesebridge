"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Badge from "@/components/Badges";

type AdminUser = {
  id: string;
  display_name: string | null;
  role: string | null;
  badge: string | null;
  verified: boolean | null;
  banned_until: string | null;
};

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <UsersContent />
    </AdminGuard>
  );
}

function UsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, role, badge, verified, banned_until")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setUsers(data || []);
  }

  async function updateRole(userId: string, role: string) {
    const { error } = await supabase
      .from("profiles")
      .update({
        role,
        badge: role === "banned" ? "member" : role,
        verified: role === "admin" || role === "moderator",
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
        <h1>Users</h1>

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
              </div>

              <select
                value={user.role || "member"}
                onChange={(event) => updateRole(user.id, event.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontWeight: 700,
                }}
              >
                <option value="member">member</option>
                <option value="moderator">moderator</option>
                <option value="admin">admin</option>
                <option value="banned">banned</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}