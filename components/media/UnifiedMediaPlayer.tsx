"use client";

import { useEffect, useRef } from "react";
import "plyr/dist/plyr.css";

type Props = {
  title: string;
  youtubeId?: string | null;
  src?: string | null;
  kind?: "video" | "audio";
};

type PlyrInstance = { destroy: () => void };
type PlyrConstructor = new (element: HTMLElement, options?: Record<string, unknown>) => PlyrInstance;

export default function UnifiedMediaPlayer({ title, youtubeId, src, kind = "video" }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: PlyrInstance | undefined;
    let disposed = false;

    void import("plyr").then(({ default: Plyr }) => {
      if (disposed || !host.current) return;
      const element = host.current.firstElementChild as HTMLElement | null;
      if (!element) return;
      const options: Record<string, unknown> = {
        controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "settings", "fullscreen"],
        i18n: { restart: "Restart", play: "Play", pause: "Pause" },
      };
      if (youtubeId) options.youtube = { noCookie: true, rel: 0, modestbranding: 1 };
      player = new (Plyr as unknown as PlyrConstructor)(element, options);
    });

    return () => {
      disposed = true;
      player?.destroy();
    };
  }, [youtubeId, src, kind]);

  return (
    <div ref={host} className="unified-media-player" aria-label={title}>
      {youtubeId ? (
        <div data-plyr-provider="youtube" data-plyr-embed-id={youtubeId} />
      ) : kind === "audio" ? (
        <audio controls preload="metadata" src={src || undefined} />
      ) : (
        <video controls preload="metadata" src={src || undefined} />
      )}
    </div>
  );
}
