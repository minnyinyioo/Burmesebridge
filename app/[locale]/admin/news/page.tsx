"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import type { MediaBlock } from "@/components/RichMediaBlocks";
import { getYouTubeId } from "@/lib/youtube";

type Category = "news" | "jobs" | "learn";

type NewsItem = {
  id: number;
  category: Category | null;
  pinned: boolean | null;
  featured: boolean | null;
  hot: boolean | null;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  content_my: string | null;
  content_zh: string | null;
  content_en: string | null;
  created_at: string;
  media_blocks: MediaBlock[] | null;
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

  const text = {
    my: {
      pageTitle: "အချက်အလက် ထုတ်ပြန်ရန်",
      category: "အမျိုးအစား",
      news: "သတင်း",
      jobs: "အလုပ်အကိုင်",
      learn: "လေ့လာရန်",
      titleMy: "မြန်မာ ခေါင်းစဉ်",
      titleZh: "中文标题",
      titleEn: "English Title",
      contentMy: "မြန်မာ အကြောင်းအရာ",
      contentZh: "中文内容",
      contentEn: "English Content",
      generateDraft: "ဘာသာစကား ၃ မျိုး မူကြမ်းထုတ်ရန်",
      publish: "ထုတ်ပြန်ရန်",
      delete: "ဖျက်ရန်",
      empty: "ထုတ်ပြန်ထားသော အချက်အလက် မရှိသေးပါ",
      missingDraftSource:
        "ဘာသာစကားတစ်မျိုး၏ ခေါင်းစဉ်နှင့် အကြောင်းအရာကို အရင်ဖြည့်ပါ",
      draftFailed: "မူကြမ်းထုတ်ရာတွင် မအောင်မြင်ပါ",
      confirmDelete: "ဒီအချက်အလက်ကို ဖျက်မှာ သေချာပါသလား?",
      pinned: "ထိပ်ဆုံးပို့စ်",
      featured: "အကြံပြု",
      hot: "လူကြိုက်များ",
      media: "ပုံနှင့် ဗီဒီယို",
      image: "ပုံတင်ရန် (5MB အောက်)", video: "YouTube လင့်ခ်", caption: "စာတန်း", addVideo: "ဗီဒီယိုထည့်ရန်", removeMedia: "ဖယ်ရှားရန်", uploadFailed: "ပုံတင်၍ မရပါ",
    },
    zh: {
      pageTitle: "发布信息",
      category: "类型",
      news: "新闻",
      jobs: "工作信息",
      learn: "学习内容",
      titleMy: "缅语标题",
      titleZh: "中文标题",
      titleEn: "英文标题",
      contentMy: "缅语内容",
      contentZh: "中文内容",
      contentEn: "英文内容",
      generateDraft: "生成三语草稿",
      publish: "发布",
      delete: "删除",
      empty: "暂无已发布信息",
      missingDraftSource: "请先填写任意一种语言的标题和内容",
      draftFailed: "生成失败",
      confirmDelete: "确定要删除这条信息吗？",
      pinned: "置顶",
      featured: "推荐",
      hot: "热门",
      media: "图片与视频", image: "上传图片（不超过 5MB）", video: "YouTube 链接", caption: "图片/视频字幕", addVideo: "添加视频", removeMedia: "移除", uploadFailed: "图片上传失败",
    },
    en: {
      pageTitle: "Publish",
      category: "Category",
      news: "News",
      jobs: "Jobs",
      learn: "Learning",
      titleMy: "Myanmar Title",
      titleZh: "Chinese Title",
      titleEn: "English Title",
      contentMy: "Myanmar Content",
      contentZh: "Chinese Content",
      contentEn: "English Content",
      generateDraft: "Generate trilingual draft",
      publish: "Publish",
      delete: "Delete",
      empty: "No published items yet",
      missingDraftSource: "Please fill in one language title and content first",
      draftFailed: "Failed to generate draft",
      confirmDelete: "Delete this item?",
      pinned: "Pinned",
      featured: "Featured",
      hot: "Hot",
      media: "Images and video", image: "Upload image (max 5MB)", video: "YouTube link", caption: "Image/video caption", addVideo: "Add video", removeMedia: "Remove", uploadFailed: "Image upload failed",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [items, setItems] = useState<NewsItem[]>([]);
  const [category, setCategory] = useState<Category>("news");

  const [pinned, setPinned] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [hot, setHot] = useState(false);

  const [titleMy, setTitleMy] = useState("");
  const [titleZh, setTitleZh] = useState("");
  const [titleEn, setTitleEn] = useState("");

  const [contentMy, setContentMy] = useState("");
  const [contentZh, setContentZh] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [mediaBlocks, setMediaBlocks] = useState<MediaBlock[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const { data, error } = await supabase
      .from("news")
      .select(
        "id, category, pinned, featured, hot, title_my, title_zh, title_en, content_my, content_zh, content_en, media_blocks, created_at"
      )
      .order("pinned", { ascending: false })
      .order("hot", { ascending: false })
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setItems((data || []) as NewsItem[]);
  }

  async function generateDraft() {
    const sourceTitle = titleMy || titleZh || titleEn;
    const sourceContent = contentMy || contentZh || contentEn;

    if (!sourceTitle.trim() || !sourceContent.trim()) {
      alert(t.missingDraftSource);
      return;
    }

    const response = await fetch("/api/admin/translate-news", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: sourceTitle,
        content: sourceContent,
        sourceLanguage: locale,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message || t.draftFailed);
      return;
    }

    setTitleMy(result.data.title_my || sourceTitle);
    setTitleZh(result.data.title_zh || sourceTitle);
    setTitleEn(result.data.title_en || sourceTitle);

    setContentMy(result.data.content_my || sourceContent);
    setContentZh(result.data.content_zh || sourceContent);
    setContentEn(result.data.content_en || sourceContent);
  }

  async function createNews() {
    if (!titleMy.trim() && !titleZh.trim() && !titleEn.trim()) return;
    if (!contentMy.trim() && !contentZh.trim() && !contentEn.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const fallbackTitle = titleMy || titleZh || titleEn;
    const fallbackContent = contentMy || contentZh || contentEn;

    const { error } = await supabase.from("news").insert({
      category,
      locale,
      pinned,
      featured,
      hot,
      status: "published",
      source_language: locale,
      author_id: user?.id || null,

      title: fallbackTitle,
      content: fallbackContent,

      title_my: titleMy || fallbackTitle,
      title_zh: titleZh || fallbackTitle,
      title_en: titleEn || fallbackTitle,

      content_my: contentMy || fallbackContent,
      content_zh: contentZh || fallbackContent,
      content_en: contentEn || fallbackContent,
      media_blocks: mediaBlocks,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setCategory("news");
    setPinned(false);
    setFeatured(false);
    setHot(false);

    setTitleMy("");
    setTitleZh("");
    setTitleEn("");
    setContentMy("");
    setContentZh("");
    setContentEn("");
    setMediaBlocks([]);

    await loadItems();
  }

  async function uploadImage(file?: File) {
    if (!file || file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      alert(t.uploadFailed); return;
    }
    setUploading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `news/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("content-media").upload(path, file, { contentType: file.type, upsert: false });
    if (error) { setUploading(false); alert(error.message); return; }
    const { data } = supabase.storage.from("content-media").getPublicUrl(path);
    setMediaBlocks((current) => [...current, { type: "image", url: data.publicUrl, caption: mediaCaption.trim() }]);
    setMediaCaption(""); setUploading(false);
  }

  function addVideo() {
    if (!getYouTubeId(videoUrl)) return alert(t.video);
    setMediaBlocks((current) => [...current, { type: "video", url: videoUrl.trim(), caption: mediaCaption.trim() }]);
    setVideoUrl(""); setMediaCaption("");
  }

  async function deleteNews(newsId: number) {
    const ok = confirm(t.confirmDelete);
    if (!ok) return;

    const { error } = await supabase.from("news").delete().eq("id", newsId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadItems();
  }

  function getCategoryLabel(value: Category | null) {
    if (value === "jobs") return t.jobs;
    if (value === "learn") return t.learn;
    return t.news;
  }

  return (
    <div className="adminShell">
      <AdminSidebar />

      <div className="adminContent">
        <h1>{t.pageTitle}</h1>

        <div className="feedCard" style={{ marginTop: 24 }}>
          <label style={label}>{t.category}</label>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            style={input}
          >
            <option value="news">{t.news}</option>
            <option value="jobs">{t.jobs}</option>
            <option value="learn">{t.learn}</option>
          </select>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <label>
              <input
                type="checkbox"
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
              />{" "}
              {t.pinned}
            </label>

            <label>
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
              />{" "}
              {t.featured}
            </label>

            <label>
              <input
                type="checkbox"
                checked={hot}
                onChange={(event) => setHot(event.target.checked)}
              />{" "}
              {t.hot}
            </label>
          </div>

          <input
            value={titleMy}
            onChange={(event) => setTitleMy(event.target.value)}
            placeholder={t.titleMy}
            style={input}
          />

          <textarea
            value={contentMy}
            onChange={(event) => setContentMy(event.target.value)}
            placeholder={t.contentMy}
            style={textarea}
          />

          <div className="rich-editor">
            <strong>{t.media}</strong>
            <input value={mediaCaption} onChange={(event) => setMediaCaption(event.target.value)} placeholder={t.caption} style={input} />
            <div className="rich-editor-actions">
              <label className="rich-upload-button">{uploading ? "…" : t.image}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={(event) => uploadImage(event.target.files?.[0])} /></label>
              <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder={t.video} style={{...input, margin: 0}} />
              <button type="button" onClick={addVideo} style={button}>{t.addVideo}</button>
            </div>
            {mediaBlocks.map((block, index) => <div className="rich-editor-item" key={`${block.url}-${index}`}><span>{block.type === "image" ? "🖼" : "▶"} {block.caption || block.url}</span><button type="button" onClick={() => setMediaBlocks((current) => current.filter((_, itemIndex) => itemIndex !== index))}>{t.removeMedia}</button></div>)}
          </div>

          <input
            value={titleZh}
            onChange={(event) => setTitleZh(event.target.value)}
            placeholder={t.titleZh}
            style={input}
          />

          <textarea
            value={contentZh}
            onChange={(event) => setContentZh(event.target.value)}
            placeholder={t.contentZh}
            style={textarea}
          />

          <input
            value={titleEn}
            onChange={(event) => setTitleEn(event.target.value)}
            placeholder={t.titleEn}
            style={input}
          />

          <textarea
            value={contentEn}
            onChange={(event) => setContentEn(event.target.value)}
            placeholder={t.contentEn}
            style={textarea}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={generateDraft}
              style={{
                ...button,
                background: "var(--brand-accent)",
                color: "#082e31",
              }}
            >
              {t.generateDraft}
            </button>

            <button type="button" onClick={createNews} style={button}>
              {t.publish}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
          {items.length === 0 && <div className="feedCard">{t.empty}</div>}

          {items.map((item) => (
            <div key={item.id} className="feedCard">
              <strong>{getCategoryLabel(item.category)}</strong>

              <h3 style={{ marginTop: 10 }}>
                {item.title_my || item.title_zh || item.title_en}
              </h3>

              <button
                onClick={() => deleteNews(item.id)}
                style={{
                  ...button,
                  background: "#ef4444",
                  marginTop: 14,
                }}
              >
                {t.delete}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const label = {
  display: "block",
  fontWeight: 800,
  marginBottom: 8,
};

const input = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  marginBottom: 12,
};

const textarea = {
  width: "100%",
  minHeight: 110,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  marginBottom: 12,
};

const button = {
  border: "none",
  background: "var(--brand-primary)",
  color: "white",
  padding: "10px 16px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 700,
};
