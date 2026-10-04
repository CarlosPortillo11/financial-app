"use client";

import { ThemeProvider as NextThemes } from "next-themes";

/** dark-mode.md › Best practices: "Avoid offering an app-specific appearance
 *  setting." Solo sigue al sistema; no hay switch en la interfaz. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemes>
  );
}
