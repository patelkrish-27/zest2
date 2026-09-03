import { useMemo, useCallback } from "react"
import type { AppConfig } from "@/types/blueprint"

export function useWizard(phase: string, config: AppConfig) {
  const wizardFlow = useMemo(
    () => [
      "project",
      "frontend",
      "backend",
      "architecture",
      "theme",
      "skills",
      ...config.customPages.map((p) => p.id),
      "prompt",
      "response",
      "blueprint",
    ],
    [config.customPages],
  )

  const currentIndex = useMemo(() => wizardFlow.indexOf(phase), [wizardFlow, phase])
  const prevPhase = currentIndex > 0 ? wizardFlow[currentIndex - 1] : null
  const nextPhase =
    currentIndex > -1 && currentIndex < wizardFlow.length - 1
      ? wizardFlow[currentIndex + 1]
      : null

  const goNext = useCallback(
    (setter: (p: string) => void) => {
      if (nextPhase) setter(nextPhase)
    },
    [nextPhase],
  )
  const goPrev = useCallback(
    (setter: (p: string) => void) => {
      if (prevPhase) setter(prevPhase)
    },
    [prevPhase],
  )

  return { wizardFlow, currentIndex, prevPhase, nextPhase, goNext, goPrev }
}

export default useWizard
