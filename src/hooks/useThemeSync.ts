import { useEffect } from "react"

/**
 * Syncs themeModifiers.mode to document data-theme.
 * Handles auto -> prefers-color-scheme.
 */
export function useThemeSync(mode: string | undefined) {
  useEffect(() => {
    const m = mode ?? "dark"
    const resolved =
      m === "auto"
        ? window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
        : m
    document.documentElement.setAttribute("data-theme", resolved)
  }, [mode])
}

export default useThemeSync
