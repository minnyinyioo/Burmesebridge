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
  status: "pending" | "published" | "hidden";
  is_pinned: boolean;
  is_featured: boolean;
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
      .select("id, content, created_at, user_id, status, is_pinned, is_featured")
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

  async function moderate(postId: number, patch: Partial<AdminPost>) {
    const { error } = await supabase.from("posts").update(patch).eq("id", postId);
    if (error) { alert(error.message); return; }
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
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span className="forum-post-badge pending">{post.status}</span>
                {post.is_pinned && <span className="forum-post-badge pinned">pinned</span>}
                {post.is_featured && <span className="forum-post-badge featured">featured</span>}
              </div>
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
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {post.status !== "published" && <button onClick={() => moderate(post.id, { status: "published" })}>Approve</button>}
                  {post.status !== "hidden" && <button onClick={() => moderate(post.id, { status: "hidden" })}>Hide</button>}
                  <button onClick={() => moderate(post.id, { is_pinned: !post.is_pinned })}>{post.is_pinned ? "Unpin" : "Pin"}</button>
                  <button onClick={() => moderate(post.id, { is_featured: !post.is_featured })}>{post.is_featured ? "Unfeature" : "Feature"}</button>
                  <button onClick={() => deletePost(post.id)} style={{ background: "#ef4444", color: "white" }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
