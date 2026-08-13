import { getYouTubeId } from "@/lib/youtube";

export type MediaBlock = { type: "image" | "video"; url: string; caption?: string };

export default function RichMediaBlocks({ blocks }: { blocks: MediaBlock[] | null }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  return <div className="rich-media-list">{blocks.map((block, index) => {
    if (block.type === "video") {
      const id = getYouTubeId(block.url);
      if (!id) return null;
      return <figure key={`${id}-${index}`} className="rich-media-block"><div className="rich-video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`} title={block.caption || "Video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
    }
    if (!/^https:\/\//.test(block.url)) return null;
    // Supabase storage host is deployment-specific, so a native lazy image is intentional here.
    // eslint-disable-next-line @next/next/no-img-element
    return <figure key={`${block.url}-${index}`} className="rich-media-block"><img src={block.url} alt={block.caption || ""} loading="lazy" />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
  })}</div>;
}
