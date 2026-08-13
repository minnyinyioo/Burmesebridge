-- Run only when intentionally rolling back the video module.
-- This removes video metadata; YouTube-hosted source videos are unaffected.
drop table if exists public.videos;
