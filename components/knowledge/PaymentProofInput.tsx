"use client";
import { ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";
export default function PaymentProofInput({
  locale,
  file,
  onChange,
}: {
  locale: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const label =
    locale === "zh"
      ? "付款截图（图片/PDF，最大 5MB）"
      : locale === "my"
        ? "ငွေပေးချေမှုပုံ/PDF (5MB)"
        : "Payment proof image/PDF (max 5MB)";
  function select(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] || null;
    if (
      next &&
      next.size <= 5 * 1024 * 1024 &&
      ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
        next.type,
      )
    )
      onChange(next);
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
    </label>
  );
}
