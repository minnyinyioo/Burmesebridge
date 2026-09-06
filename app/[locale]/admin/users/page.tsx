"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Badge, { type BadgeType } from "@/components/Badges";
import { KeyRound } from "lucide-react";

type AdminUser = {
  id: string;
  display_name: string | null;
  role: string | null;
  badge: string | null;
  verified: boolean | null;
  banned_until: string | null;
  badges?: string[] | null;
};

const SYSTEM_ROLES = ["member", "moderator", "admin", "banned"] as const;
const KNOWN_POSITION_ROLES = ["teacher", "student", "company", "author"] as const;

function normaliseRole(value: string | null | undefined) {
  return value?.trim().toLowerCase() || "";
}

function isSystemRole(value: string) {
  return (SYSTEM_ROLES as readonly string[]).includes(value);
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <UsersContent />
    </AdminGuard>
  );
}

function UsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [resetting, setResetting] = useState<string | null>(null);

  const roleOptions = useMemo(() => {
    const discovered = users.flatMap((user) => [normaliseRole(user.role), normaliseRole(user.badge)]);
    return Array.from(new Set([
      ...SYSTEM_ROLES,
      ...KNOWN_POSITION_ROLES,
      ...discovered.filter(Boolean),
    ]));
  }, [users]);

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, role, badge, badges, verified, banned_until")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setUsers(data || []);
  }, []);

  async function updateRole(user: AdminUser, selectedRoles: string[]) {
    const selected = selectedRoles.map(normaliseRole).filter(Boolean);
    if (!selected.length) return;
    const role = normaliseRole(user.role) === "admin" ? "admin" : selected.find(isSystemRole) || "member";
    if (!confirm(`将为 ${user.display_name || user.id} 设置身份：${selected.join(", ")}。Admin 权限将保留。继续吗？`)) return;
    if (!confirm("二次确认：确认立即保存这些身份和徽章吗？此操作会影响账户显示与权限。")) return;

    // System roles control moderation access. Position roles are identity
    // badges; assigning one here never grants verification or teacher access.
    const updates = isSystemRole(role)
      ? {
          role,
          badge: selected.find((item) => ["teacher", "student", "company", "author", "vip"].includes(item)) || (role === "banned" ? "member" : role),
          badges: selected,
          verified: role === "admin" || role === "moderator",
        }
      : {
          role,
          badge: selected.find((item) => ["teacher", "student", "company", "author", "vip"].includes(item)) || normaliseRole(user.badge) || "member",
          badges: selected,
          verified: Boolean(user.verified),
        };

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadUsers();
  }

  useEffect(() => {
    // Data fetching populates this client-only admin view after authentication.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers();
  }, [loadUsers]);

  async function resetPassword(user: AdminUser) {
    const name = user.display_name || user.id;
    if (!confirm(`Reset the password for ${name}? A reset email will be sent and the user will be required to choose a new password.`)) return;
    if (!confirm(`Second confirmation: send a password reset email for ${name}? This cannot be undone from this screen.`)) return;
    setResetting(user.id);
    const { data: sessionData } = await supabase.auth.getSession();
    const response = await fetch("/api/admin/users/reset-password", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${sessionData.session?.access_token || ""}`,
      },
      body: JSON.stringify({ userId: user.id, confirmation: user.id }),
    });
    const result = await response.json().catch(() => ({})) as { message?: string };
    setResetting(null);
    if (!response.ok) {
      alert(result.message || "Password reset failed.");
      return;
    }
    alert(result.message || "Password reset email sent.");
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
                  <Badge type={(user.badge || user.role || "member") as BadgeType} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button className="admin-action-button" onClick={() => resetPassword(user)} disabled={resetting === user.id}>
                  <KeyRound size={16} /> {resetting === user.id ? "Resetting…" : "Reset password"}
                </button>
                <select
                  multiple
                  defaultValue={(() => { const current = (user.badges || []).map(normaliseRole).filter(Boolean); if (current.length) return current; const role = normaliseRole(user.role); const badge = normaliseRole(user.badge); return Array.from(new Set([role, badge].filter(Boolean))); })()}
                  onChange={(event) => void updateRole(user, Array.from(event.target.selectedOptions, (option) => option.value))}
                  style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #e2e8f0", fontWeight: 700 }}
                >
                  {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
