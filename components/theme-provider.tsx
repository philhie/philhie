"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ComponentProps } from "react";
import { useEffect } from "react";

/**
 * Keeps the mobile browser chrome the same colour as the page.
 *
 * The static `themeColor` in `app/layout.tsx` cannot do this on its own: it can
 * only branch on `prefers-color-scheme`, and this site ignores the OS scheme
 * (`enableSystem: false`) in favour of an explicit toggle. So the tag is written
 * here, from the theme actually in effect.
 */
function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = resolvedTheme === "dark" ? "#000000" : "#ffffff";
    let tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "theme-color";
      document.head.appendChild(tag);
    }
    tag.content = color;
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
