import type { NextConfig } from "next";

// Keep this policy in report-only mode until violations from all public,
// authenticated, admin, and embedded-media routes have been reviewed.
// Cloudflare currently supplies the enforced CSP in production.
const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn-cookieyes.com https://static.cloudflareinsights.com https://www.youtube.com https://www.tiktok.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: https://*.supabase.co https://*.googlevideo.com",
  "connect-src 'self' https://cdn-cookieyes.com https://log.cookieyes.com https://*.cookieyes.com https://*.supabase.co wss://*.supabase.co https://www.youtube.com https://*.youtube.com https://www.tiktok.com https://*.tiktok.com",
  "frame-src 'self' https://www.youtube.com https://*.youtube.com https://www.youtube-nocookie.com https://*.youtube-nocookie.com https://www.tiktok.com https://*.tiktok.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/:locale(my|zh|en)/jobs", destination: "/:locale", permanent: false },
      { source: "/:locale(my|zh|en)/safety", destination: "/:locale", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: contentSecurityPolicyReportOnly,
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(), payment=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
