"use client";
import { ChangeEvent, useState } from "react";
import { ImagePlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { safeFileExtension, validateUpload } from "@/lib/fileValidation";
export default function CourseCoverUploader({
  locale,
  onUploaded,
}: {
  locale: string;
  onUploaded: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const label =
    locale === "zh"
      ? "直接上传课程封面（最大 5MB）"
      : locale === "my"
        ? "သင်တန်းမျက်နှာဖုံး တင်ရန် (5MB)"
        : "Upload course cover (max 5MB)";
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !(await validateUpload(file, ["image/jpeg", "image/png", "image/webp"]))) return;
    setBusy(true);
    const extension = safeFileExtension(file);
    const path = `courses/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from("content-media")
      .upload(path, file, { contentType: file.type });
    if (!error) {
      const { data } = supabase.storage
        .from("content-media")
        .getPublicUrl(path);
      onUploaded(data.publicUrl);
    }
    setBusy(false);
  }
  return (
    <label className="course-cover-upload">
      <ImagePlus size={17} />
      {busy ? "…" : label}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={upload}
      />
    </label>
  );
}
