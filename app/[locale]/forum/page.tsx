"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PostComposer from "@/components/forum/PostComposer";
import PostCard from "@/components/forum/PostCard";

type Profile = {
  display_name?: string | null;
  email?: string | null;
  verified?: boolean | null;
  badge?: string | null;
  role?: string | null;
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

  /**
   * 页面初始化：
   * 获取当前登录用户，然后加载论坛数据。
   */
  async function loadUserAndPosts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || "";

    setCurrentUserId(userId);
    await loadPosts(userId);
  }

  /**
   * 加载帖子、点赞、评论。
   * 关键点：
   * profiles:profiles!posts_user_id_fkey
   * 必须依赖 posts.user_id → profiles.id 外键。
   */
  async function loadPosts(userId: string) {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:profiles!posts_user_id_fkey (
          display_name,
          email,
          verified,
          badge,
          role
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    const postList = (data || []) as Post[];
    setPosts(postList);

    const ids = postList.map((post) => post.id);

    if (ids.length === 0) {
      setLikes({});
      setMyLikes({});
      setComments({});
      return;
    }

    const { data: likeRows } = await supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", ids);

    const likeCount: Record<number, number> = {};
    const likedByMe: Record<number, boolean> = {};

    likeRows?.forEach((row) => {
      likeCount[row.post_id] = (likeCount[row.post_id] || 0) + 1;

      if (row.user_id === userId) {
        likedByMe[row.post_id] = true;
      }
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
        profiles:profiles!post_comments_user_id_fkey (
          display_name,
          email,
          verified,
          badge,
          role
        )
      `)
      .in("post_id", ids)
      .order("created_at", { ascending: true });

    const groupedComments: Record<number, any[]> = {};

    commentRows?.forEach((comment) => {
      if (!groupedComments[comment.post_id]) {
        groupedComments[comment.post_id] = [];
      }

      groupedComments[comment.post_id].push(comment);
    });

    setComments(groupedComments);
  }

  /**
   * 创建新帖子。
   */
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

  /**
   * 点赞 / 取消点赞。
   */
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

  /**
   * 新增评论。
   */
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

    setCommentText({
      ...commentText,
      [postId]: "",
    });

    await loadPosts(currentUserId);
  }

  /**
   * 删除帖子。
   * RLS 应限制：作者本人 / admin / moderator。
   */
  async function deletePost(postId: number) {
    const ok = confirm(t.confirmDelete);

    if (!ok) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPosts(currentUserId);
  }

  /**
   * 分享帖子链接。
   */
  async function sharePost(postId: number) {
    const url = `${window.location.origin}/${locale}/forum#post-${postId}`;

    await navigator.clipboard.writeText(url);

    alert(t.copied);
  }

  return (
    <main className="feedShell">
      <h1 className="feedTitle">{t.title}</h1>

      <PostComposer
        content={content}
        placeholder={t.placeholder}
        buttonText={t.post}
        onContentChange={setContent}
        onSubmit={createPost}
      />

      <div style={{ marginTop: 24, display: "grid", gap: 18 }}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            likesCount={likes[post.id] || 0}
            commentsCount={comments[post.id]?.length || 0}
            liked={!!myLikes[post.id]}
            comments={comments[post.id] || []}
            commentText={commentText[post.id] || ""}
            labels={{
              anonymous: t.anonymous,
              like: t.like,
              liked: t.liked,
              comment: t.comment,
              share: t.share,
              delete: t.delete,
              commentPlaceholder: t.commentPlaceholder,
              send: t.send,
            }}
            onLike={toggleLike}
            onShare={sharePost}
            onDelete={deletePost}
            onCommentChange={(postId, value) =>
              setCommentText({
                ...commentText,
                [postId]: value,
              })
            }
            onSubmitComment={createComment}
          />
        ))}
      </div>
    </main>
  );
}