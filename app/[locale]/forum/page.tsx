"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Post = {
  id: number;
  content: string;
  created_at: string;
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
    },

    zh: {
      title: "社区论坛",
      placeholder: "分享点什么...",
      post: "发布",
      login: "请先登录",
    },

    en: {
      title: "Forum",
      placeholder: "Share something...",
      post: "Post",
      login: "Please login",
    },
  };

  const t =
    text[locale as keyof typeof text] ||
    text.en;

  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

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

    if (!content.trim()) {
      return;
    }

    const { error } = await supabase
      .from("posts")
      .insert({
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
    <main
      style={{
        padding: "48px 24px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "42px",
          marginBottom: "24px",
        }}
      >
        {t.title}
      </h1>

      <div style={card}>
        <textarea
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          placeholder={t.placeholder}
          style={textarea}
        />

        <button
          onClick={createPost}
          style={button}
        >
          {t.post}
        </button>
      </div>

      <div
        style={{
          marginTop: "24px",
          display: "grid",
          gap: "18px",
        }}
      >
        {posts.map((post) => (
          <div key={post.id} style={card}>
            <p>{post.content}</p>

            <p
              style={{
                marginTop: "12px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              {new Date(
                post.created_at
              ).toLocaleString()}
            </p>
          </div>
        ))}
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