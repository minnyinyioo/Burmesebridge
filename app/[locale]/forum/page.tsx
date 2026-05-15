"use client";
import Badge from "@/components/Badges";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Post = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string | null;
    email: string | null;
    verified: boolean | null;
    badge: string | null;
  } | null;
};

export default function ForumPage() {
  const params = useParams();
  const locale = String(params.locale || "my");

  const text = {
    my: {
      title: "Community",
      placeholder: "တစ်ခုခု မျှဝေပါ...",
      post: "ပို့စ်တင်မည်",
      login: "ကျေးဇူးပြု၍အကောင့်ဝင်ပါ",
      anonymous: "BurmeseBridge အသုံးပြုသူ",
    },
    zh: {
      title: "社区论坛",
      placeholder: "分享点什么...",
      post: "发布",
      login: "请先登录",
      anonymous: "BurmeseBridge 用户",
    },
    en: {
      title: "Forum",
      placeholder: "Share something...",
      post: "Post",
      login: "Please login",
      anonymous: "BurmeseBridge User",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles (
          display_name,
          email,
          verified,
          badge
        )
      `)
      .order("created_at", { ascending: false });

    setPosts(data || []);
  }

  async function createPost() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert(t.login);
      return;
    }

    if (!content.trim()) return;

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setContent("");
    loadPosts();
  }

  return (
    <main style={{ padding: "48px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "42px", marginBottom: "24px" }}>{t.title}</h1>

      <div style={card}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.placeholder}
          style={textarea}
        />

        <button onClick={createPost} style={button}>
          {t.post}
        </button>
      </div>

      <div style={{ marginTop: "24px", display: "grid", gap: "18px" }}>
        {posts.map((post) => {
  const author =
    post.profiles?.display_name ||
    post.profiles?.email ||
    t.anonymous;

  const badge = post.profiles?.badge || "member";

  return (
    <div key={post.id} style={card}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "999px",
            background: "#2563eb",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
        >
          {author.slice(0, 1).toUpperCase()}
        </div>

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              fontWeight: 700,
            }}
          >
            {author}

            {post.profiles?.verified && <Badge type="verified" />}

            <Badge type={badge as any} />
          </div>

          <div
            style={{
              color: "#64748b",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            {new Date(post.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      <p>{post.content}</p>
    </div>
  );
})}
      </div>
    </main>
  );
}

const card = {
  background: "white",
  padding: "24px",
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
};

const textarea = {
  width: "100%",
  minHeight: "120px",
  padding: "16px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  resize: "none" as const,
};

const button = {
  marginTop: "16px",
  padding: "12px 18px",
  borderRadius: "12px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};