"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageCircleMore } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PostComposer from "@/components/forum/PostComposer";
import PostCard from "@/components/forum/PostCard";
import type { CommentItem } from "@/components/forum/CommentList";
import { PageContainer, PageIntro } from "@/components/ui/page-container";
import { DirectoryState } from "@/components/ui/content-directory";

type Profile = {
  id?: string;
  display_name?: string | null;
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

type ForumComment = CommentItem & { post_id: number; user_id: string; created_at: string };

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
      eyebrow: "အများပြည်သူ ဆွေးနွေးခန်း",
      subtitle: "အသိပညာ၊ အတွေ့အကြုံနှင့် မေးခွန်းများကို လေးစားစွာ မျှဝေပါ။",
      loading: "ဆွေးနွေးချက်များ ရယူနေသည်",
      empty: "ပထမဆုံး ဆွေးနွေးချက်ကို မျှဝေပါ",
      loadError: "ဆွေးနွေးချက်များကို ရယူ၍ မရပါ",
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
      eyebrow: "公共讨论区",
      subtitle: "分享知识、经验与问题，并保持尊重和友善。",
      loading: "正在加载讨论",
      empty: "还没有帖子，来发布第一条讨论吧",
      loadError: "讨论内容加载失败，请稍后重试",
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
      eyebrow: "Public discussion",
      subtitle: "Share knowledge, experiences, and questions with respect.",
      loading: "Loading discussions",
      empty: "No posts yet. Start the first discussion.",
      loadError: "Discussions could not be loaded. Please try again.",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [currentUserId, setCurrentUserId] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [myLikes, setMyLikes] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, CommentItem[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadUserAndPosts();
    // Initial synchronization is intentionally run once for this client page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 页面初始化：
   * 1. 获取当前登录用户
   * 2. 加载帖子、点赞、评论
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
   * 加载论坛数据。
   *
   * 这里不直接查 profiles。
   * 原因：
   * profiles 受 RLS 限制，登录用户/游客可能只能看到自己的资料。
   *
   * 统一改查 public_profiles：
   * - 只公开 display_name / verified / badge / role
   * - 不公开 email
   * - 所有人都可以读取发帖者公开身份
   */
  async function loadPosts(userId: string) {
    const { data: postRows, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        created_at,
        user_id
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    const rawPosts = postRows || [];

    const postUserIds = Array.from(
      new Set(rawPosts.map((post) => post.user_id))
    );

    const { data: profileRows, error: profileError } = await supabase
      .from("public_profiles")
      .select(`
        id,
        display_name,
        verified,
        badge,
        role
      `)
      .in("id", postUserIds);

    if (profileError) {
      setLoadError(profileError.message);
      setLoading(false);
      return;
    }

    const profileMap = new Map(
      (profileRows || []).map((profile) => [profile.id, profile])
    );

    const postList = rawPosts.map((post) => ({
      ...post,
      profiles: profileMap.get(post.user_id) || null,
    })) as Post[];

    setPosts(postList);
    setLoadError("");

    const postIds = postList.map((post) => post.id);

    if (postIds.length === 0) {
      setLikes({});
      setMyLikes({});
      setComments({});
      setLoading(false);
      return;
    }

    const { data: likeRows } = await supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds);

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
        user_id
      `)
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    const rawComments = commentRows || [];

    const commentUserIds = Array.from(
      new Set(rawComments.map((comment) => comment.user_id))
    );

    const { data: commentProfiles, error: commentProfileError } = await supabase
      .from("public_profiles")
      .select(`
        id,
        display_name,
        verified,
        badge,
        role
      `)
      .in("id", commentUserIds);

    if (commentProfileError) {
      setLoadError(commentProfileError.message);
      setLoading(false);
      return;
    }

    const commentProfileMap = new Map(
      (commentProfiles || []).map((profile) => [profile.id, profile])
    );

    const groupedComments: Record<number, CommentItem[]> = {};

    (rawComments as ForumComment[]).forEach((comment) => {
      if (!groupedComments[comment.post_id]) {
        groupedComments[comment.post_id] = [];
      }

      groupedComments[comment.post_id].push({
        ...comment,
        profiles: commentProfileMap.get(comment.user_id) || null,
      });
    });

    setComments(groupedComments);
    setLoading(false);
  }

  /**
   * 创建新帖子
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
   * 点赞 / 取消点赞
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
   * 新增评论
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
   * 删除帖子
   */
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

  /**
   * 分享帖子链接
   */
  async function sharePost(postId: number) {
    const url = `${window.location.origin}/${locale}/forum#post-${postId}`;

    await navigator.clipboard.writeText(url);

    alert(t.copied);
  }

  return (
  <PageContainer className="forum-page">
    <PageIntro eyebrow={<><MessageCircleMore size={18}/>{t.eyebrow}</>} title={t.title} description={t.subtitle}/>

    <div className="forum-composer-wrap">
      <PostComposer
        content={content}
        placeholder={t.placeholder}
        buttonText={t.post}
        onContentChange={setContent}
        onSubmit={createPost}
      />
    </div>

    {loading ? <DirectoryState kind="loading" title={t.loading}/> : loadError ? <DirectoryState kind="error" title={t.loadError} description={loadError}/> : posts.length === 0 ? <DirectoryState title={t.empty}/> : <div className="forum-feed-list">
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
          locale={locale}
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
    </div>}

  </PageContainer>
);
}
