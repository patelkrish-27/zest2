import { useEffect } from "react"
import type { AppState, AppConfig } from "@/types/blueprint"

const LS_KEY = "zest:blueprint:draft:v1"

export function useLocalDraft(state: AppState, config: AppConfig, phase: string) {
  // Load once on mount
  // We use a ref-like pattern via useEffect with empty deps for load, and watch for save
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return
      // Validation is intentionally minimal - App will reconcile
      // This hook is used for side-effect only; caller handles hydration via callback if needed
    } catch {
      // storage unavailable
    }
  }, [])

  // Persist on change (debounced by caller or raw - here raw for simplicity, 500ms via timeout)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          LS_KEY,
          JSON.stringify({ state, config, phase, savedAt: Date.now() }),
        )
      } catch {
        // quota exceeded
      }
    }, 500)
    return () => clearTimeout(id)
  }, [state, config, phase])
}

export function loadDraft(): { state?: AppState; config?: AppConfig; phase?: string } | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(LS_KEY)
  } catch {
    // ignore
  }
}

export default useLocalDraft
