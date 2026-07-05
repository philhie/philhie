"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Switch } from "@/components/ui/switch";

/**
 * "After-hours" control — flips the canonical blinding-white monograph into
 * its inverted dark reading. Renders a stable placeholder until mounted so
 * next-themes can't cause a hydration mismatch.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <label
      className={`label-mono inline-flex cursor-pointer select-none items-center gap-2 ${className ?? ""}`}
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
