"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const params = useParams();
  const locale = String(params.locale || "my");

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = `/${locale}/login`;
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("email, display_name")
        .eq("id", userData.user.id)
        .maybeSingle();

      setEmail(data?.email || userData.user.email || "");
      setDisplayName(data?.display_name || "");
      setLoading(false);
    }

    loadProfile();
  }, [locale]);

  async function saveProfile() {
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = `/${locale}/login`;
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
      })
      .eq("id", userData.user.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Saved successfully");
  }

  if (loading) {
    return <main style={{ padding: 40 }}>Loading...</main>;
  }

  return (
    <main style={{ padding: "48px 24px", minHeight: "100vh" }}>
      <section style={{ maxWidth: "640px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "24px" }}>
          Edit Profile
        </h1>

        <div style={card}>
          <label style={label}>
            Email
            <input value={email} disabled style={input} />
          </label>

          <label style={label}>
            Display Name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={input}
              placeholder="Your name"
            />
          </label>

          <button onClick={saveProfile} style={button}>
            Save
          </button>

          {message && (
            <p style={{ marginTop: 16, color: "#10b981" }}>
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

const card = {
  background: "white",
  color: "#0f172a",
  padding: "28px",
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
};

const label = {
  display: "grid",
  gap: "8px",
  marginBottom: "18px",
  fontWeight: 700,
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
};

const button = {
  background: "#2563eb",
  color: "white",
  padding: "14px 18px",
  borderRadius: "12px",
  border: "none",
  fontWeight: 700,
};