"use client";
import { useEffect } from "react";
export default function ResetPasswordCompatibilityPage() {
  useEffect(() => {
    const target = `/zh/reset-password${window.location.search}${window.location.hash}`;
    window.location.replace(target);
  }, []);
  return <main className="auth-page"><div className="auth-card"><p className="auth-copy">Opening password recovery…</p></div></main>;
}
