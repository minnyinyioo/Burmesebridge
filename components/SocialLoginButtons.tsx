"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type SocialProvider = Extract<Provider, "google" | "github" | "facebook">;

const providers: Array<{ id: SocialProvider; label: string; mark: string }> = [
  { id: "google", label: "Google", mark: "G" },
  { id: "github", label: "GitHub", mark: "GH" },
  { id: "facebook", label: "Facebook", mark: "f" },
];

export default function SocialLoginButtons({ locale }: { locale: string }) {
  const [activeProvider, setActiveProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState("");

  const copy = locale === "zh"
    ? { divider: "或使用以下账号继续", loading: "正在连接", error: "暂时无法连接此登录方式，请稍后重试。" }
    : locale === "my"
      ? { divider: "သို့မဟုတ် အောက်ပါအကောင့်ဖြင့် ဆက်လုပ်ပါ", loading: "ချိတ်ဆက်နေသည်", error: "ဤအကောင့်ဖြင့် လောလောဆယ် ဝင်၍မရပါ။ နောက်မှ ထပ်စမ်းပါ။" }
      : { divider: "or continue with", loading: "Connecting", error: "This sign-in option is temporarily unavailable. Please try again later." };

  async function signIn(provider: SocialProvider) {
    setActiveProvider(provider);
    setError("");

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/${locale}/me`,
      },
    });

    if (oauthError) {
      setError(copy.error);
      setActiveProvider(null);
    }
  }

  return (
    <section className="social-auth" aria-label={copy.divider}>
      <div className="social-auth-divider"><span>{copy.divider}</span></div>
      <div className="social-auth-grid">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className={`social-auth-button social-auth-${provider.id}`}
            onClick={() => signIn(provider.id)}
            disabled={activeProvider !== null}
            aria-label={`${copy.divider} ${provider.label}`}
          >
            <span className="social-auth-mark" aria-hidden="true">{provider.mark}</span>
            <span>{activeProvider === provider.id ? copy.loading : provider.label}</span>
          </button>
        ))}
      </div>
      {error && <p className="auth-error social-auth-error" role="alert">{error}</p>}
    </section>
  );
}
