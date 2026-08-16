# Burmesebridge notebook

Scope: `minnyinyioo/Burmesebridge` only. Live branch: `codex/password-recovery`. Domain: `https://burmesebridge.eu.cc`.

## Production (2026-08-16 14:49 ICT)

- Commit: `fe2cd28` (promoted Production rebuild).
- `/my/admin` without login returns `307` to `/my/login?next=/my/admin`.
- Checkins RLS is on in production.
- Free-plan backups cannot be downloaded; a real restore drill needs Pro.

## Mail (Brevo custom SMTP)

- Host expected: `smtp-relay.brevo.com:587`.
- DNS already has Brevo DKIM CNAMEs, SPF, and `brevo-code` TXT.
- Auth logs (15 Aug): `/signup` and `/recover` return `504 request_timeout` at 10s (`context deadline exceeded`), then a `200` on the same request. Keep Brevo; do not switch to Supabase built-in mail.
- Code change: treat timeout as success on register, forgot-password, and admin reset email.

## Do not touch

- goldfinder, shwezay, devcommander-os, jonas-cv
- Noto Serif Myanmar / existing zh-my-en prompt UI
- Live visitor counts: real data only
