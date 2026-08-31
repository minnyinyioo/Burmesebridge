# Changelog

## 2026-08-16

- Production is `fe2cd28` on `codex/password-recovery` (admin middleware, checkins RLS, email-only password reset).
- Cloudflare DNS for `burmesebridge.com` and `www` is DNS-only (grey cloud). Traffic hits Vercel directly.
- Signup and password recovery can still hit a 10-second Brevo SMTP timeout in Supabase Auth. The mail often goes out after the timeout. Branch `p0/smtp-timeout-ux` treats that timeout as “check your email” instead of a failure.
