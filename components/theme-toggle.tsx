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
 * It positions itself. Every page wants it in the same top-right corner, and
 * four hand-copied class strings had already drifted out of alignment with the
 * content gutter — so the corner lives here, keyed off the `--edge-*` tokens.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <label
      className={cn(
        "label-mono fixed right-[var(--edge-x)] top-[var(--edge-top)] z-50",
        // min-h-11/py-3 make a 44px target; -mt-3 cancels the growth so the
        // glyphs sit exactly where they did before.
        "-mt-3 inline-flex min-h-11 cursor-pointer touch-manipulation select-none items-center gap-2 py-3",
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
