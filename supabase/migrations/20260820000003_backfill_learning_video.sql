-- Restore the video attached to the existing learning article. The old editor
-- discarded a valid URL when an editor published without clicking Add video.
update public.news
set media_blocks = jsonb_build_array(
  jsonb_build_object(
    'type', 'video',
    'url', 'https://www.youtube.com/watch?v=UA7CMPBtZMs',
    'caption', coalesce(title_my, title_zh, title_en, '')
  )
)
where id = 12
  and category = 'learn'
  and status = 'published'
  and coalesce(jsonb_array_length(media_blocks), 0) = 0;
