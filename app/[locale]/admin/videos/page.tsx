"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Star, Trash2, Video } from "lucide-react";
import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { getYouTubeId } from "@/lib/youtube";

type VideoItem = { id: number; youtube_id: string; title: string; featured: boolean; status: "draft" | "published" };
export default function AdminVideosPage() { return <AdminGuard><VideoAdmin /></AdminGuard>; }

function VideoAdmin() {
  const locale = String(useParams().locale || "en");
  const [items, setItems] = useState<VideoItem[]>([]); const [url, setUrl] = useState(""); const [title, setTitle] = useState(""); const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const copy = locale === "zh" ? { heading: "视频管理", intro: "先免费上传到 YouTube，再粘贴公开视频或不公开链接。", url: "YouTube 视频链接", title: "视频标题", description: "视频简介", featured: "设为精选", publish: "发布视频", invalid: "请输入有效的 YouTube 链接。", empty: "暂无视频", remove: "删除" } : locale === "my" ? { heading: "ဗီဒီယို စီမံခန့်ခွဲမှု", intro: "YouTube သို့ အခမဲ့တင်ပြီး public သို့မဟုတ် unlisted လင့်ခ်ကို ထည့်ပါ။", url: "YouTube ဗီဒီယိုလင့်ခ်", title: "ဗီဒီယိုခေါင်းစဉ်", description: "ဗီဒီယိုအကြောင်း", featured: "ရွေးချယ်ထားရန်", publish: "ဗီဒီယို ထုတ်ဝေမည်", invalid: "မှန်ကန်သော YouTube လင့်ခ် ထည့်ပါ။", empty: "ဗီဒီယို မရှိသေးပါ", remove: "ဖျက်ရန်" } : { heading: "Video management", intro: "Upload to YouTube for free, then paste a public or unlisted video link.", url: "YouTube video link", title: "Video title", description: "Video description", featured: "Mark as featured", publish: "Publish video", invalid: "Enter a valid YouTube link.", empty: "No videos yet", remove: "Delete" };
  const load = useCallback(async () => { const { data } = await supabase.from("videos").select("id, youtube_id, title, featured, status").order("created_at", { ascending: false }); setItems((data || []) as VideoItem[]); }, []);
  useEffect(() => {
    // Initial remote synchronization for the admin list.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);
  async function submit(event: FormEvent) { event.preventDefault(); const youtubeId = getYouTubeId(url); setMessage(""); if (!youtubeId) { setMessage(copy.invalid); return; } if (!title.trim() || busy) return; setBusy(true); const { data } = await supabase.auth.getUser(); const { error } = await supabase.from("videos").insert({ youtube_id: youtubeId, title: title.trim(), description: description.trim(), featured, status: "published", author_id: data.user?.id || null }); setBusy(false); if (error) { setMessage(error.message); return; } setUrl(""); setTitle(""); setDescription(""); setFeatured(false); await load(); }
  async function remove(id: number) { const { error } = await supabase.from("videos").delete().eq("id", id); if (error) setMessage(error.message); else await load(); }
  return <div className="adminShell"><AdminSidebar /><div className="adminContent"><header className="admin-page-head"><div><h1>{copy.heading}</h1><p>{copy.intro}</p></div><Video size={24} /></header>
    <form className="feedCard video-admin-form" onSubmit={submit}><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={copy.url} /><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={copy.title} /><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={copy.description} rows={4} /><label><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /><Star size={16} />{copy.featured}</label>{message && <p className="auth-error">{message}</p>}<button disabled={busy || !title.trim()}>{copy.publish}</button></form>
    <div className="video-admin-list">{items.length === 0 && <div className="feedCard">{copy.empty}</div>}{items.map((item) => <article className="feedCard" key={item.id}><div className="video-admin-thumb" style={{ backgroundImage: `url(https://i.ytimg.com/vi/${item.youtube_id}/mqdefault.jpg)` }} /><div><strong>{item.title}</strong><small>{item.status}{item.featured ? ` · ${copy.featured}` : ""}</small></div><button onClick={() => remove(item.id)} title={copy.remove} aria-label={copy.remove}><Trash2 size={17} /></button></article>)}</div>
  </div></div>;
}
