"use client";

import Badge from "@/components/Badges";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  display_name?: string | null;
  email?: string | null;
  verified?: boolean | null;
  badge?: string | null;
};

type Post = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: Profile | Profile[] | null;
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
      delete: "ဖျက်မည်",
      confirmDelete: "ဒီပို့စ်ကို ဖျက်မှာ သေချာပါသလား?",
      like: "ကြိုက်သည်",
      liked: "ကြိုက်ပြီး",
      comment: "မှတ်ချက်",
      share: "မျှဝေ",
      commentPlaceholder: "မှတ်ချက်ရေးရန်...",
      send: "ပို့မည်",
      copied: "လင့်ခ်ကို ကူးပြီးပါပြီ",
    },
    zh: {
      title: "社区论坛",
      placeholder: "分享点什么...",
      post: "发布",
      login: "请先登录",
      anonymous: "BurmeseBridge 用户",
      delete: "删除",
      confirmDelete: "确定要删除这条帖子吗？",
      like: "点赞",
      liked: "已点赞",
      comment: "评论",
      share: "分享",
      commentPlaceholder: "写评论...",
      send: "发送",
      copied: "链接已复制",
    },
    en: {
      title: "Forum",
      placeholder: "Share something...",
      post: "Post",
      login: "Please login",
      anonymous: "BurmeseBridge User",
      delete: "Delete",
      confirmDelete: "Delete this post?",
      like: "Like",
      liked: "Liked",
      comment: "Comment",
      share: "Share",
      commentPlaceholder: "Write a comment...",
      send: "Send",
      copied: "Link copied",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [currentUserId, setCurrentUserId] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [myLikes, setMyLikes] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});

  useEffect(() => {
    loadUserAndPosts();
  }, []);

  async function loadUserAndPosts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id || "");
    await loadPosts(user?.id || "");
  }

  async function loadPosts(userId: string) {
    const { data, error } = await supabase
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

    if (error) {
      alert(error.message);
      return;
    }

    const postList = (data || []) as Post[];
    setPosts(postList);

    const ids = postList.map((p) => p.id);
    if (ids.length === 0) return;

    const { data: likeRows } = await supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", ids);

    const likeCount: Record<number, number> = {};
    const likedByMe: Record<number, boolean> = {};

    likeRows?.forEach((row) => {
      likeCount[row.post_id] = (likeCount[row.post_id] || 0) + 1;
      if (row.user_id === userId) likedByMe[row.post_id] = true;
    });

    setLikes(likeCount);
    setMyLikes(likedByMe);

    const { data: commentRows } = await supabase
      .from("post_comments")
      .select(`
        id,
        post_id,
        content,
        created_at,
        user_id,
        profiles (
          display_name,
          email
        )
      `)
      .in("post_id", ids)
      .order("created_at", { ascending: true });

    const grouped: Record<number, any[]> = {};

    commentRows?.forEach((comment) => {
      if (!grouped[comment.post_id]) grouped[comment.post_id] = [];
      grouped[comment.post_id].push(comment);
    });

    setComments(grouped);
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
      content: content.trim(),
    });

    if (error) {
      alert(error.message);
      return;
    }

    setContent("");
    await loadPosts(user.id);
  }

  async function toggleLike(postId: number) {
    if (!currentUserId) {
      alert(t.login);
      return;
    }

    if (myLikes[postId]) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", currentUserId);
    } else {
      await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: currentUserId,
      });
    }

    await loadPosts(currentUserId);
  }

  async function createComment(postId: number) {
    if (!currentUserId) {
      alert(t.login);
      return;
    }

    const text = commentText[postId]?.trim();
    if (!text) return;

    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      user_id: currentUserId,
      content: text,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setCommentText({ ...commentText, [postId]: "" });
    await loadPosts(currentUserId);
  }

  async function deletePost(postId: number) {
    const ok = confirm(t.confirmDelete);
    if (!ok) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPosts(currentUserId);
  }

  async function sharePost(postId: number) {
    const url = `${window.location.origin}/${locale}/forum#post-${postId}`;
    await navigator.clipboard.writeText(url);
    alert(t.copied);
  }

  function getProfile(post: Post): Profile | null {
    if (Array.isArray(post.profiles)) return post.profiles[0] || null;
    return post.profiles || null;
  }

  return (
    <main style={page}>
      <h1 style={title}>{t.title}</h1>

      <div style={composerCard}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.placeholder}
          style={textarea}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button onClick={createPost} style={primaryButton}>
            {t.post}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "grid", gap: 18 }}>
        {posts.map((post) => {
          const profile = getProfile(post);
          const author = profile?.display_name || profile?.email || t.anonymous;
          const badge = profile?.badge || "member";

          return (
            <article id={`post-${post.id}`} key={post.id} style={postCard}>
              <div style={{ display: "flex", gap: 14 }}>
                <div style={avatar}>{author.slice(0, 1).toUpperCase()}</div>

                <div style={{ flex: 1 }}>
                  <div style={authorRow}>
                    <strong>{author}</strong>
                    {profile?.verified && <Badge type="verified" />}
                    <Badge type={badge as any} />
                  </div>

                  <div style={timeText}>
                    {new Date(post.created_at).toLocaleString()}
                  </div>

                  <div style={postContent}>{post.content}</div>

                  <div style={statsRow}>
                    <span>{likes[post.id] || 0} {t.like}</span>
                    <span>{comments[post.id]?.length || 0} {t.comment}</span>
                  </div>

                  <div style={actionBar}>
                    <button onClick={() => toggleLike(post.id)} style={actionButton}>
                      {myLikes[post.id] ? `👍 ${t.liked}` : `👍 ${t.like}`}
                    </button>

                    <button style={actionButton}>💬 {t.comment}</button>

                    <button onClick={() => sharePost(post.id)} style={actionButton}>
                      ↗ {t.share}
                    </button>

                    {currentUserId === post.user_id && (
                      <button
                        onClick={() => deletePost(post.id)}
                        style={{ ...actionButton, color: "#ef4444" }}
                      >
                        🗑 {t.delete}
                      </button>
                    )}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={commentText[post.id] || ""}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [post.id]: e.target.value,
                          })
                        }
                        placeholder={t.commentPlaceholder}
                        style={commentInput}
                      />

                      <button onClick={() => createComment(post.id)} style={sendButton}>
                        {t.send}
                      </button>
                    </div>

                    <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                      {(comments[post.id] || []).map((comment) => {
                        const cp = Array.isArray(comment.profiles)
                          ? comment.profiles[0]
                          : comment.profiles;

                        const commentAuthor =
                          cp?.display_name || cp?.email || t.anonymous;

                        return (
                          <div key={comment.id} style={commentBox}>
                            <strong>{commentAuthor}</strong>
                            <p style={{ marginTop: 4 }}>{comment.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

const page = {
  padding: "48px 24px",
  maxWidth: "920px",
  margin: "0 auto",
  background: "#f8fafc",
  minHeight: "100vh",
};

const title = {
  fontSize: "42px",
  marginBottom: "24px",
  color: "#0f172a",
};

const composerCard = {
  background: "white",
  padding: "20px",
  borderRadius: "22px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 30px rgba(15,23,42,0.05)",
};

const postCard = {
  background: "white",
  borderRadius: "22px",
  padding: "20px",
  boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
  border: "1px solid rgba(226,232,240,0.9)",
};

const textarea = {
  width: "100%",
  minHeight: "120px",
  padding: "16px",
  borderRadius: "16px",
  border: "1px solid #cbd5e1",
  resize: "none" as const,
  fontSize: "16px",
  outline: "none",
};

const primaryButton = {
  padding: "12px 22px",
  borderRadius: "999px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const avatar = {
  minWidth: "52px",
  width: "52px",
  height: "52px",
  borderRadius: "999px",
  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 800,
  fontSize: "18px",
};

const authorRow = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap" as const,
  color: "#0f172a",
};

const timeText = {
  color: "#94a3b8",
  fontSize: "13px",
  marginTop: "4px",
};

const postContent = {
  marginTop: "16px",
  color: "#0f172a",
  fontSize: "16px",
  lineHeight: 1.9,
  whiteSpace: "pre-wrap" as const,
};

const statsRow = {
  marginTop: "16px",
  display: "flex",
  gap: "16px",
  color: "#64748b",
  fontSize: "14px",
};

const actionBar = {
  marginTop: "12px",
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "14px",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "12px",
};

const actionButton = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontWeight: 700,
  color: "#64748b",
  padding: "6px",
};

const commentInput = {
  flex: 1,
  padding: "11px 14px",
  borderRadius: "999px",
  border: "1px solid #cbd5e1",
  outline: "none",
};

const sendButton = {
  padding: "10px 14px",
  borderRadius: "999px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const commentBox = {
  background: "#f8fafc",
  borderRadius: "14px",
  padding: "10px 12px",
  color: "#0f172a",
};