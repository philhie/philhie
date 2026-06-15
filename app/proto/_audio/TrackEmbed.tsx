"use client";

/**
 * The real track, embedded. A hidden YouTube IFrame player streams the official
 * recording (the license travels with the embed). Muted autoplay-loop satisfies
 * autoplay policy; the "listen" button unmutes on a user gesture. We read only
 * player state — never reproduce the recording.
 *
 * Swap VIDEO_ID if a cleaner official upload is preferred.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";

const VIDEO_ID = "v-QTu118AFw"; // Rick Ross — "Stay Schemin'" (official)

interface YTPlayer {
  mute: () => void;
  unMute: () => void;
  setVolume: (v: number) => void;
  playVideo: () => void;
  destroy: () => void;
}
interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: Record<string, unknown>,
  ) => YTPlayer;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function TrackEmbed({ accent = "#e8a14c" }: { accent?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = () => {
      if (cancelled || !mountRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          loop: 1,
          playlist: VIDEO_ID,
          mute: 1,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            e.target.mute();
            e.target.playVideo();
            setReady(true);
          },
        },
      });
    };

    if (window.YT?.Player) {
      init();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        init();
      };
      if (!document.getElementById("yt-iframe-api")) {
        const s = document.createElement("script");
        s.id = "yt-iframe-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        /* noop */
      }
    };
  }, []);

  const toggle = () => {
    const p = playerRef.current;
    if (!p) return;
    if (on) {
      p.mute();
      setOn(false);
    } else {
      p.unMute();
      p.setVolume(72);
      p.playVideo();
      setOn(true);
    }
  };

  return (
    <>
      {/* hidden player (kept on-screen at 1px so autoplay isn't throttled) */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          width: 1,
          height: 1,
          bottom: 0,
          right: 0,
          opacity: 0.001,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div ref={mountRef} />
      </div>

      <button onClick={toggle} aria-pressed={on} disabled={!ready} style={btn(accent, on)}>
        <span style={dot(accent, on)} />
        {on ? "playing" : "listen"}
      </button>
    </>
  );
}

const btn = (accent: string, on: boolean): CSSProperties => ({
  position: "fixed",
  bottom: "clamp(1.5rem, 4vh, 2.5rem)",
  right: "clamp(1.5rem, 4vw, 3rem)",
  zIndex: 30,
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "0.4rem 0",
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.625rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: on ? accent : "rgba(255,255,255,0.4)",
  transition: "color 0.3s ease",
});

const dot = (accent: string, on: boolean): CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: on ? accent : "rgba(255,255,255,0.3)",
  boxShadow: on ? `0 0 10px 2px ${accent}` : "none",
  transition: "all 0.3s ease",
});
