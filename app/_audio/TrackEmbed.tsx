"use client";

/**
 * The real track via YouTube's licensed player. We build the iframe ourselves so
 * we can set allow="autoplay; encrypted-media" (required for cross-origin muted
 * autoplay + EME). It autoplays MUTED and loops; sound starts on the visitor's
 * first CLICK/tap. (Browser security: a YouTube cross-origin frame can't be
 * unmuted by mouse-move/scroll on the parent page — only a real click/tap works,
 * and even that is best-effort. The fully-seamless version needs a self-hosted,
 * licensed audio file.) We read only playback state.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";

const VIDEO_ID = "_XmKYwC1H9Y"; // the site's track — youtu.be/_XmKYwC1H9Y

export interface Playhead {
  time: number;
  playing: boolean;
  readAt: number;
}

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
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function TrackEmbed({
  accent = "#e8a14c",
  playheadRef,
}: {
  accent?: string;
  playheadRef?: React.RefObject<Playhead>;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const playingRef = useRef(false);
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unmuted = false;
    const container = mountRef.current;
    if (!container) return;

    // Build the iframe ourselves so we control allow=.
    const iframe = document.createElement("iframe");
    iframe.allow = "autoplay; encrypted-media";
    iframe.style.cssText = "width:320px;height:180px;border:0;";
    const origin = encodeURIComponent(window.location.origin);
    iframe.src =
      `https://www.youtube.com/embed/${VIDEO_ID}?enablejsapi=1&autoplay=1&mute=1` +
      `&playsinline=1&controls=0&loop=1&playlist=${VIDEO_ID}&rel=0&modestbranding=1&origin=${origin}`;
    container.appendChild(iframe);

    const init = () => {
      if (cancelled || !window.YT) return;
      playerRef.current = new window.YT.Player(iframe, {
        events: {
          onReady: (e: { target: YTPlayer }) => {
            e.target.mute();
            e.target.playVideo();
            setReady(true);
          },
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            playingRef.current = e.data === 1;
            if (e.data === 0) {
              e.target.seekTo(0, true);
              e.target.playVideo();
            }
          },
          onError: () => setErrored(true), // 101/150 embedding disabled, 100 removed
        },
      });
    };

    if (window.YT?.Player) init();
    else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); init(); };
      if (!document.getElementById("yt-iframe-api")) {
        const s = document.createElement("script");
        s.id = "yt-iframe-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }

    // Unmute on the first valid gesture — click / tap / key (NOT move/scroll,
    // which browsers don't accept as activation for a cross-origin frame, esp iOS).
    const evs = ["click", "touchend", "keydown", "pointerdown"];
    const onGesture = () => {
      if (unmuted) return;
      const p = playerRef.current;
      if (!p) return;
      unmuted = true;
      p.unMute();
      p.setVolume(72);
      p.playVideo();
      setOn(true);
      evs.forEach((ev) => window.removeEventListener(ev, onGesture));
    };
    evs.forEach((ev) => window.addEventListener(ev, onGesture, { passive: true }));

    const poll = window.setInterval(() => {
      const p = playerRef.current;
      if (p?.getCurrentTime && playheadRef?.current) {
        playheadRef.current.time = p.getCurrentTime();
        playheadRef.current.playing = playingRef.current;
        playheadRef.current.readAt = performance.now();
      }
    }, 120);

    return () => {
      cancelled = true;
      clearInterval(poll);
      evs.forEach((ev) => window.removeEventListener(ev, onGesture));
      try { playerRef.current?.destroy(); } catch { /* noop */ }
    };
  }, [playheadRef]);

  const toggle = () => {
    const p = playerRef.current;
    if (!p) return;
    if (on) { p.mute(); setOn(false); }
    else { p.unMute(); p.setVolume(72); p.playVideo(); setOn(true); }
  };

  return (
    <>
      <div
        aria-hidden
        style={{ position: "fixed", width: 1, height: 1, bottom: 0, right: 0, opacity: 0.001, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}
      >
        <div ref={mountRef} />
      </div>
      <button onClick={toggle} aria-pressed={on} disabled={!ready || errored} style={btn(accent, on)}>
        <span style={dot(accent, on)} />
        {errored ? "audio off" : on ? "sound on" : "listen"}
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
