"use client";

/**
 * The real track, embedded. A hidden YouTube IFrame player streams the official
 * recording (the license travels with the embed). It autoplays MUTED from 0:00
 * (browser policy), loops the whole song, and unmutes the instant the visitor
 * does anything (move / click / scroll / key / touch). We only read playback
 * state (position + playing) — never reproduce the recording.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";

const VIDEO_ID = "-ZBUXDQ4leM"; // Kanye West — "Flashing Lights" (extended intro)

export interface Playhead {
  time: number; // seconds into the track at readAt
  playing: boolean;
  readAt: number; // performance.now() when read (for interpolation)
}

interface YTPlayer {
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
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
  const [on, setOn] = useState(false); // sound on (unmuted)
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unmuted = false;

    const init = () => {
      if (cancelled || !mountRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1, controls: 0, disablekb: 1, fs: 0,
          modestbranding: 1, playsinline: 1, rel: 0, mute: 1,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            e.target.mute();
            e.target.playVideo();
            setReady(true);
          },
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            playingRef.current = e.data === 1;
            if (e.data === 0) { // ENDED → loop the whole song
              e.target.seekTo(0, true);
              e.target.playVideo();
            }
          },
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

    // Unmute on the first real interaction (browser-legal "auto" sound).
    const events = ["pointerdown", "keydown", "wheel", "touchstart", "pointermove"];
    const onFirstGesture = () => {
      if (unmuted) return;
      const p = playerRef.current;
      if (!p) return;
      unmuted = true;
      p.unMute();
      p.setVolume(70);
      p.playVideo();
      setOn(true);
      events.forEach((ev) => window.removeEventListener(ev, onFirstGesture));
    };
    events.forEach((ev) =>
      window.addEventListener(ev, onFirstGesture, { passive: true, once: false }),
    );

    // Publish the playhead for the beat clock.
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
      events.forEach((ev) => window.removeEventListener(ev, onFirstGesture));
      try { playerRef.current?.destroy(); } catch { /* noop */ }
    };
  }, [playheadRef]);

  const toggle = () => {
    const p = playerRef.current;
    if (!p) return;
    if (on) { p.mute(); setOn(false); }
    else { p.unMute(); p.setVolume(70); p.playVideo(); setOn(true); }
  };

  return (
    <>
      <div
        aria-hidden
        style={{ position: "fixed", width: 1, height: 1, bottom: 0, right: 0, opacity: 0.001, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}
      >
        <div ref={mountRef} />
      </div>
      <button onClick={toggle} aria-pressed={on} disabled={!ready} style={btn(accent, on)}>
        <span style={dot(accent, on)} />
        {on ? "sound on" : "listen"}
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
