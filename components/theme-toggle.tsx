"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * "After-hours" control — flips the canonical blinding-white monograph into
 * its inverted dark reading. Renders a stable placeholder until mounted so
 * next-themes can't cause a hydration mismatch.
 *
 * It positions itself, off the `--edge-*` tokens — four hand-copied class
 * strings had already drifted out of alignment with the content gutter.
 */
export function ThemeToggle({
  className,
  variant = "floating",
}: {
  className?: string;
  /**
   * `floating` pins the control to the top-right corner — correct on a wide
   * desktop viewport, and on pages with no masthead row to sit in.
   * `docked` puts it in the flow below `md` so it shares a baseline with the
   * dateline, and floats again from `md` up.
   */
  variant?: "floating" | "docked";
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <label
      className={cn(
        // min-h-11/py-3 make a 44px target; the negative margin cancels the
        // growth so the glyphs sit where the optical alignment wants them.
        "label-mono inline-flex min-h-11 cursor-pointer touch-manipulation select-none items-center gap-2 py-3",
        variant === "floating"
          ? "fixed right-[var(--edge-x)] top-[var(--edge-top)] z-50 -mt-3"
          : "-my-3 md:fixed md:right-[var(--edge-x)] md:top-[var(--edge-top)] md:z-50 md:-my-0 md:-mt-3",
        className,
      )}
    >
      <span className="sr-only">After hours</span>
      <Sun
        aria-hidden
        className={`size-3 transition-opacity ${isDark ? "opacity-40" : "opacity-100"}`}
      />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle after-hours (dark) mode"
      />
      <Moon
        aria-hidden
        className={`size-3 transition-opacity ${isDark ? "opacity-100" : "opacity-40"}`}
      />
    </label>
  );
}
