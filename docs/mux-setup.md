# Mux paid-video setup

Add these as Vercel server environment variables (never `NEXT_PUBLIC_`):

```env
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_SIGNING_KEY_ID=
MUX_SIGNING_PRIVATE_KEY=
MUX_WEBHOOK_SECRET=
```

Create a Mux webhook pointing to `https://burmesebridge.com/api/webhooks/mux` and subscribe to `video.upload.asset_created`, `video.asset.ready`, `video.asset.errored`, and `video.asset.deleted`. Copy the signing secret immediately; Mux only returns it once.

The server API flow is:

1. An authenticated admin calls `POST /api/mux/upload` with `{ "lessonId": 123 }`.
2. The browser uploads the file to the returned `uploadUrl`.
3. Mux calls `/api/webhooks/mux`; the handler stores the asset and signed playback ID.
4. An entitled learner calls `GET /api/mux/playback?lessonId=123` with a Supabase Bearer token.
5. The short-lived token is used with `UnifiedMediaPlayer` via `muxPlaybackId` and `muxToken`.
6. The client saves watch position with `POST /api/knowledge/progress`.

Run the migration before uploading paid lessons:

```powershell
npx --yes supabase@latest db push --include-all
```
