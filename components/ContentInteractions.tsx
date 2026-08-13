"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, MessageCircle, Send, Share2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ContentType = "news" | "video" | "knowledge";
type Comment = { id: number; user_id: string; body: string; created_at: string; name?: string };

export default function ContentInteractions({ type, contentId, locale, title }: { type: ContentType; contentId: number; locale: string; title: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const copy = locale === "zh"
    ? { like: "点赞", liked: "已点赞", comment: "评论", share: "分享", placeholder: "写下你的评论…", login: "请先登录后参与互动", send: "发布", copied: "链接已复制", remove: "删除评论" }
    : locale === "my"
      ? { like: "ကြိုက်သည်", liked: "ကြိုက်ပြီး", comment: "မှတ်ချက်", share: "မျှဝေ", placeholder: "မှတ်ချက်ရေးပါ…", login: "အရင် အကောင့်ဝင်ပါ", send: "ပို့မည်", copied: "လင့်ခ်ကူးပြီး", remove: "မှတ်ချက်ဖျက်ရန်" }
      : { like: "Like", liked: "Liked", comment: "Comment", share: "Share", placeholder: "Write a comment…", login: "Sign in to interact", send: "Post", copied: "Link copied", remove: "Delete comment" };

  const load = useCallback(async () => {
    const [{ data: auth }, { data: likeRows }, { data: commentRows }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("content_likes").select("user_id").eq("content_type", type).eq("content_id", contentId),
      supabase.from("content_comments").select("id,user_id,body,created_at").eq("content_type", type).eq("content_id", contentId).order("created_at"),
    ]);
    const uid = auth.user?.id || null;
    setUserId(uid);
    setLikes(likeRows?.length || 0);
    setLiked(!!uid && !!likeRows?.some((row) => row.user_id === uid));
    const rows = (commentRows || []) as Comment[];
    const ids = [...new Set(rows.map((row) => row.user_id))];
    const { data: profiles } = ids.length ? await supabase.from("public_profiles").select("id,display_name").in("id", ids) : { data: [] };
    const names = new Map((profiles || []).map((profile) => [profile.id, profile.display_name]));
    setComments(rows.map((row) => ({ ...row, name: names.get(row.user_id) || undefined })));
  }, [contentId, type]);

  useEffect(() => {
    // Initial remote synchronization for this content item.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function toggleLike() {
    if (!userId) { setMessage(copy.login); return; }
    const query = supabase.from("content_likes");
    const { error } = liked
      ? await query.delete().eq("content_type", type).eq("content_id", contentId).eq("user_id", userId)
      : await query.insert({ content_type: type, content_id: contentId, user_id: userId });
    if (!error) { setLiked(!liked); setLikes((value) => value + (liked ? -1 : 1)); }
  }

  async function addComment() {
    if (!userId) { setMessage(copy.login); return; }
    if (!text.trim()) return;
    const { error } = await supabase.from("content_comments").insert({ content_type: type, content_id: contentId, user_id: userId, body: text.trim() });
    if (!error) { setText(""); await load(); }
  }

  async function removeComment(id: number) {
    const { error } = await supabase.from("content_comments").delete().eq("id", id);
    if (!error) setComments((items) => items.filter((item) => item.id !== id));
  }

  async function share() {
    const data = { title, url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else { await navigator.clipboard.writeText(data.url); setMessage(copy.copied); }
  }

  return <section className="content-interactions">
    <div className="content-interaction-stats"><span>{likes} {copy.like}</span><span>{comments.length} {copy.comment}</span></div>
    <div className="content-interaction-actions">
      <button className={liked ? "active" : ""} onClick={toggleLike}><Heart size={18} fill={liked ? "currentColor" : "none"} />{liked ? copy.liked : copy.like}</button>
      <button onClick={() => document.getElementById(`comment-${type}-${contentId}`)?.focus()}><MessageCircle size={18} />{copy.comment}</button>
      <button onClick={share}><Share2 size={18} />{copy.share}</button>
    </div>
    {message && <p className="content-interaction-message">{message}</p>}
    <div className="content-comment-compose"><input id={`comment-${type}-${contentId}`} value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void addComment(); }} placeholder={copy.placeholder} /><button onClick={addComment} aria-label={copy.send}><Send size={17} /></button></div>
    <div className="content-comment-list">{comments.map((comment) => <article key={comment.id}><div><strong>{comment.name || "BurmeseBridge member"}</strong><time>{new Date(comment.created_at).toLocaleString()}</time></div><p>{comment.body}</p>{comment.user_id === userId && <button onClick={() => removeComment(comment.id)} title={copy.remove}><Trash2 size={14} /></button>}</article>)}</div>
  </section>;
}
