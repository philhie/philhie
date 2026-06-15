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

// Set from the song-research pick. START_SEC skips any spoken / sound-effect /
// silent intro and is also the loop point — we re-seek here when the track ends
// so the intro never replays.
const VIDEO_ID = "-ZBUXDQ4leM"; // Kanye West — "Flashing Lights" (extended intro)
const START_SEC = 10; // loop start: into the string/synth build
const LOOP_END = 55; //  loop end: stay inside the wordless cinematic intro

interface YTPlayer {
  mute: () => void;
  unMute: () => void;
  setVolume: (v: number) => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
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
          start: START_SEC,
          mute: 1,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            e.target.mute();
            if (START_SEC > 0) e.target.seekTo(START_SEC, true);
            e.target.playVideo();
            setReady(true);
          },
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            // 0 = ENDED → loop back to the start point (never replays the intro)
            if (e.data === 0) {
              e.target.seekTo(START_SEC, true);
              e.target.playVideo();
            }
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

    // Keep playback inside the wordless cinematic intro (loop window).
    const loopId = window.setInterval(() => {
      const pl = playerRef.current;
      if (pl && pl.getCurrentTime) {
        const ct = pl.getCurrentTime();
        if (ct >= LOOP_END || ct < START_SEC - 1.5) pl.seekTo(START_SEC, true);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearInterval(loopId);
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
