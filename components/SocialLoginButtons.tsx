"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { FacebookIcon, GitHubIcon, GoogleIcon } from "@/components/icons/BrandIcons";

type RedirectProvider = Extract<Provider, "github" | "facebook">;
type GoogleCredentialResponse = { credential?: string };
type GoogleIdentityApi = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    nonce: string;
    ux_mode: "popup";
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentityApi } };
  }
}

const redirectProviders = [
  { id: "github", label: "GitHub", icon: GitHubIcon },
  { id: "facebook", label: "Facebook", icon: FacebookIcon },
] as const;

function randomNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function SocialLoginButtons({ locale }: { locale: string }) {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleNonceRef = useRef("");
  const [activeProvider, setActiveProvider] = useState<RedirectProvider | "google" | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState("");

  const copy = locale === "zh"
    ? { divider: "或使用以下账号继续", loading: "正在连接", error: "暂时无法连接此登录方式，请稍后重试。" }
    : locale === "my"
      ? { divider: "သို့မဟုတ် အောက်ပါအကောင့်ဖြင့် ဆက်လုပ်ပါ", loading: "ချိတ်ဆက်နေသည်", error: "ဤအကောင့်ဖြင့် လောလောဆယ် ဝင်၍မရပါ။ နောက်မှ ထပ်စမ်းပါ။" }
      : { divider: "or continue with", loading: "Connecting", error: "This sign-in option is temporarily unavailable. Please try again later." };

  const initializeGoogle = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const button = googleButtonRef.current;
    const identity = window.google?.accounts.id;
    if (!clientId || !button || !identity) {
      setGoogleReady(false);
      return;
    }

    const rawNonce = randomNonce();
    googleNonceRef.current = rawNonce;
    const hashedNonce = await sha256(rawNonce);

    identity.initialize({
      client_id: clientId,
      nonce: hashedNonce,
      ux_mode: "popup",
      use_fedcm_for_prompt: true,
      callback: async ({ credential }) => {
        if (!credential) {
          setError(copy.error);
          return;
        }
        setActiveProvider("google");
        setError("");
        const { error: googleError } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: credential,
          nonce: googleNonceRef.current,
        });
        if (googleError) {
          setError(copy.error);
          setActiveProvider(null);
          return;
        }
        router.replace(`/${locale}/me`);
        router.refresh();
      },
    });

    button.replaceChildren();
    identity.renderButton(button, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "continue_with",
      logo_alignment: "left",
      width: Math.max(120, Math.floor(button.getBoundingClientRect().width)),
    });
    setGoogleReady(true);
  }, [copy.error, locale, router]);

  async function signIn(provider: RedirectProvider) {
    setActiveProvider(provider);
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?locale=${encodeURIComponent(locale)}&next=${encodeURIComponent(`/${locale}/me`)}`,
        ...(provider === "facebook" ? { scopes: "public_profile,email" } : {}),
      },
    });
    if (oauthError) {
      setError(copy.error);
      setActiveProvider(null);
    }
  }

  return (
    <section className="social-auth" aria-label={copy.divider}>
      <Script id="google-identity-services" src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => void initializeGoogle()} onError={() => setError(copy.error)} />
      <div className="social-auth-divider"><span>{copy.divider}</span></div>
      <div className="social-auth-grid">
        <div className="google-identity-slot">
          <div ref={googleButtonRef} className="google-identity-button" aria-label={`${copy.divider} Google`} />
          {!googleReady && (
            <button type="button" className="social-auth-button social-auth-google" disabled>
              <span className="social-auth-mark" aria-hidden="true"><GoogleIcon /></span><span>{activeProvider === "google" ? copy.loading : "Google"}</span>
            </button>
          )}
        </div>
        {redirectProviders.map((provider) => {
          const Icon = provider.icon;
          return (
            <button key={provider.id} type="button" className={`social-auth-button social-auth-${provider.id}`} onClick={() => signIn(provider.id)} disabled={activeProvider !== null} aria-label={`${copy.divider} ${provider.label}`}>
              <span className="social-auth-mark" aria-hidden="true"><Icon /></span><span>{activeProvider === provider.id ? copy.loading : provider.label}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="auth-error social-auth-error" role="alert">{error}</p>}
    </section>
  );
}
