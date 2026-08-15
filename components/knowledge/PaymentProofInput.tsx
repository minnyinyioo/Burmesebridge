"use client";
import { ChangeEvent, useState } from "react";
import { ImagePlus } from "lucide-react";
import { validateUpload } from "@/lib/fileValidation";
export default function PaymentProofInput({
  locale,
  file,
  onChange,
}: {
  locale: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const [invalid, setInvalid] = useState(false);
  const label =
    locale === "zh"
      ? "付款截图（图片/PDF，最大 5MB）"
      : locale === "my"
        ? "ငွေပေးချေမှုပုံ/PDF (5MB)"
        : "Payment proof image/PDF (max 5MB)";
  async function select(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] || null;
    if (!next) { onChange(null); setInvalid(false); return; }
    const valid = await validateUpload(next, ["image/jpeg", "image/png", "image/webp", "application/pdf"]);
    setInvalid(!valid);
    onChange(valid ? next : null);
  }
  return (
    <label className="payment-proof-input">
      <ImagePlus size={16} />
      {file ? file.name : label}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={select}
      />
      {invalid ? <span role="alert">Invalid file</span> : null}
    </label>
  );
}
