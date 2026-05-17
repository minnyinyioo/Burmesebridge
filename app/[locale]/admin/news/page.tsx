"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

type NewsItem = {
  id: number;
  title: string;
  content: string;
  locale: string | null;
  status: string | null;
  created_at: string;
};

export default function AdminNewsPage() {
  return (
    <AdminGuard>
      <NewsContent />
    </AdminGuard>
  );
}

function NewsContent() {
  const params = useParams();
  const locale = String(params.locale || "my");

  const [news, setNews] = useState<NewsItem[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    const { data, error } = await supabase
      .from("news")
      .select("id, title, content, locale, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setNews(data || []);
  }

  async function createNews() {
    if (!title.trim() || !content.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("news").insert({
      title: title.trim(),
      content: content.trim(),
      locale,
      status: "published",
      author_id: user?.id || null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    setContent("");
    await loadNews();
  }

  async function deleteNews(newsId: number) {
    const ok = confirm("Delete this news?");

    if (!ok) return;

    const { error } = await supabase.from("news").delete().eq("id", newsId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadNews();
  }

  return (
    <div className="adminShell">
      <AdminSidebar />

      <div className="adminContent">
        <h1>News</h1>

        <div className="feedCard" style={{ marginTop: 24 }}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="News title"
            style={input}
          />

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="News content"
            style={textarea}
          />

          <button onClick={createNews} style={button}>
            Publish
          </button>
        </div>

        <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
          {news.map((item) => (
            <div key={item.id} className="feedCard">
              <h3>{item.title}</h3>
              <p style={{ marginTop: 10, lineHeight: 1.8 }}>{item.content}</p>

              <button
                onClick={() => deleteNews(item.id)}
                style={{
                  ...button,
                  background: "#ef4444",
                  marginTop: 14,
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  marginBottom: 12,
};

const textarea = {
  width: "100%",
  minHeight: 140,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  marginBottom: 12,
};

const button = {
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: "10px 16px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 700,
};