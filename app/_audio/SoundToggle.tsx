"use client";

/**
 * The soundtrack — the site's one hidden indulgence. YouTube's licensed player
 * in a self-built iframe (so we can set allow="autoplay; encrypted-media" for
 * cross-origin muted autoplay + EME). It autoplays MUTED and loops; sound starts
 * on the visitor's first click/tap. Restyled to the editorial tokens; the beat
 * polling is gone (no shader consumes it anymore).
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const VIDEO_ID = "EBY-DPUyD6E"; // youtu.be/EBY-DPUyD6E

interface YTPlayer {
  mute: () => void;
  unMute: () => void;
  setVolume: (v: number) => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
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

export function SoundToggle({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const didInit = useRef(false);
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
      // Run exactly once — guards StrictMode double-mount and API-ready races.
      if (cancelled || didInit.current || !window.YT) return;
      didInit.current = true;
      playerRef.current = new window.YT.Player(iframe, {
        events: {
          onReady: (e: { target: YTPlayer }) => {
            e.target.mute();
            e.target.playVideo();
            setReady(true);
          },
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            if (e.data === 0) {
              e.target.seekTo(0, true);
              e.target.playVideo();
            }
          },
          onError: () => setErrored(true),
        },
      });
    };

    let patchedReady: (() => void) | null = null;
    let prevReady: (() => void) | undefined;
    if (window.YT?.Player) init();
    else {
      prevReady = window.onYouTubeIframeAPIReady;
      patchedReady = () => {
        prevReady?.();
        init();
      };
      window.onYouTubeIframeAPIReady = patchedReady;
      if (!document.getElementById("yt-iframe-api")) {
        const s = document.createElement("script");
        s.id = "yt-iframe-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }

    // Unmute on the first valid gesture (click / tap / key), not move/scroll.
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
    evs.forEach((ev) =>
      window.addEventListener(ev, onGesture, { passive: true }),
    );

    return () => {
      cancelled = true;
      evs.forEach((ev) => window.removeEventListener(ev, onGesture));
      if (patchedReady && window.onYouTubeIframeAPIReady === patchedReady) {
        window.onYouTubeIframeAPIReady = prevReady;
      }
      try {
        playerRef.current?.destroy();
      } catch {
        /* noop */
      }
      // Remove the hand-appended iframe even if destroy() threw or never ran
      // (player was still loading) — no orphaned autoplaying frame in the DOM.
      iframe.remove();
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
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 z-0 h-px w-px overflow-hidden opacity-[0.001]"
      >
        <div ref={mountRef} />
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        disabled={!ready || errored}
        className={cn(
          // -mx-3/-my-2.5 pulls the padding back out of the layout, so the
          // control still sits flush to the `--edge-*` corner while offering a
          // real 44px target instead of the old 62x15px one.
          "-mx-3 -my-2.5 inline-flex min-h-11 items-center gap-2 px-3 py-2.5",
          "font-mono text-(length:--text-label) uppercase tracking-[0.2em] transition-colors disabled:cursor-default disabled:opacity-40",
          on ? "text-signal" : "text-mono-muted hover:text-foreground",
          className,
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full transition-all duration-300",
            on ? "bg-signal shadow-[0_0_10px_2px] shadow-signal/60" : "bg-mono-muted",
          )}
        />
        {errored ? "audio off" : on ? "listen" : "sound on"}
      </button>
    </>
  );
}
