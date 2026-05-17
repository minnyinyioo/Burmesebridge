"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

type AdminPost = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
};

export default function AdminPostsPage() {
  return (
    <AdminGuard>
      <PostsContent />
    </AdminGuard>
  );
}

function PostsContent() {
  const [posts, setPosts] = useState<AdminPost[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("id, content, created_at, user_id")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setPosts(data || []);
  }

  async function deletePost(postId: number) {
    const ok = confirm("Delete this post?");

    if (!ok) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPosts();
  }

  return (
    <div className="adminShell">
      <AdminSidebar />

      <div className="adminContent">
        <h1>Posts</h1>

        <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
          {posts.map((post) => (
            <div key={post.id} className="feedCard">
              <p style={{ lineHeight: 1.8 }}>{post.content}</p>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#64748b",
                  fontSize: 14,
                }}
              >
                <span>{new Date(post.created_at).toLocaleString()}</span>

                <button
                  onClick={() => deletePost(post.id)}
                  style={{
                    border: "none",
                    background: "#ef4444",
                    color: "white",
                    borderRadius: 999,
                    padding: "8px 14px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}