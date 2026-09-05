"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MuxVideoUploader({ lessonId, onUploaded }: { lessonId: number; onUploaded?: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("none");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function refresh() {
    const { data } = await supabase.from("knowledge_lesson_content").select("mux_status,mux_asset_id,mux_playback_id").eq("lesson_id", lessonId).maybeSingle();
    setStatus(String(data?.mux_status || "none"));
  }

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 5000);
    return () => window.clearInterval(timer);
  }, [lessonId]);

  async function upload() {
    const file = input.current?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { setMessage("Please choose a video file."); return; }
    if (file.size > 5 * 1024 * 1024 * 1024) { setMessage("Video must be 5 GB or smaller."); return; }
    setBusy(true); setMessage("");
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      if (!accessToken) throw new Error("Please sign in again.");
      const response = await fetch("/api/mux/upload", { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ lessonId }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not create Mux upload.");
      const uploadResponse = await fetch(payload.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!uploadResponse.ok) throw new Error(`Mux upload failed (${uploadResponse.status}).`);
      setStatus("preparing"); setMessage("Uploaded. Mux is processing the video.");
      if (input.current) input.current.value = "";
      onUploaded?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally { setBusy(false); }
  }

  return <div className="mux-uploader">
    <label>Paid video (Mux)</label>
    <div className="mux-uploader-row">
      <input ref={input} type="file" accept="video/*" disabled={busy} />
      <button type="button" onClick={() => void upload()} disabled={busy}>{busy ? "Uploading…" : "Upload video"}</button>
    </div>
    <small>Status: {status}</small>
    {message && <small>{message}</small>}
  </div>;
}
