import { useCallback } from "react"
import type { AppState } from "@/types/blueprint"

export function useSkillSync(
  setState: React.Dispatch<React.SetStateAction<AppState>>,
) {
  const toggleArrayItem = useCallback(
    (key: "features" | "uiLibraries", item: string) => {
      setState((prev) => {
        const arr = prev[key] as string[]
        const isRemoving = arr.includes(item)
        let nextSelected = prev.selectedSkills
        const isChakra = item.includes("Chakra UI")
        const isShadcn = item.toLowerCase().includes("shadcn")
        const isRadixShadcn = item.includes("Radix UI + Tailwind")
        const isAceternity = item.includes("Aceternity")
        const isWatermelon = item.includes("Watermelon")
        if (key === "uiLibraries" && isChakra) {
          if (!isRemoving && !prev.selectedSkills.includes("chakra-ui"))
            nextSelected = [...prev.selectedSkills, "chakra-ui"]
          if (isRemoving)
            nextSelected = prev.selectedSkills.filter((s) => !s.startsWith("chakra-ui"))
        }
        if (key === "uiLibraries" && (isShadcn || isRadixShadcn)) {
          if (!isRemoving && !prev.selectedSkills.includes("shadcn-ui"))
            nextSelected = [...prev.selectedSkills, "shadcn-ui"]
          if (isRemoving) {
            const remaining = (prev.uiLibraries as string[]).filter(
              (x) => x !== item && (x.toLowerCase().includes("shadcn") || x.includes("Radix UI + Tailwind")),
            )
            if (remaining.length === 0) nextSelected = prev.selectedSkills.filter((s) => s !== "shadcn-ui")
          }
        }
        if (key === "uiLibraries" && isAceternity) {
          if (!isRemoving && !prev.selectedSkills.includes("aceternity-ui"))
            nextSelected = [...prev.selectedSkills, "aceternity-ui"]
          if (isRemoving) nextSelected = prev.selectedSkills.filter((s) => s !== "aceternity-ui")
        }
        if (key === "uiLibraries" && isWatermelon) {
          if (!isRemoving && !prev.selectedSkills.includes("watermelon-ui"))
            nextSelected = [...prev.selectedSkills, "watermelon-ui"]
          if (isRemoving) nextSelected = prev.selectedSkills.filter((s) => s !== "watermelon-ui")
        }
        if (isRemoving) {
          return { ...prev, [key]: arr.filter((i) => i !== item), selectedSkills: nextSelected }
        }
        return { ...prev, [key]: [...arr, item], selectedSkills: nextSelected }
      })
    },
    [setState],
  )

  const toggleSkill = useCallback(
    (skillId: string) => {
      setState((prev) => {
        const has = prev.selectedSkills.includes(skillId)
        let nextUiLibs = prev.uiLibraries
        let nextDatabase = prev.database
        const isChakraFamily = skillId.startsWith("chakra-ui")
        const isShadcn = skillId === "shadcn-ui"
        const isAceternity = skillId === "aceternity-ui"
        const isWatermelon = skillId === "watermelon-ui"
        const isSupabase = skillId === "supabase"
        if (isChakraFamily && !has && !prev.uiLibraries.includes("Chakra UI"))
          nextUiLibs = [...prev.uiLibraries, "Chakra UI"]
        if (isShadcn && !has && !prev.uiLibraries.includes("shadcn/ui"))
          nextUiLibs = [...prev.uiLibraries, "shadcn/ui"]
        if (isAceternity && !has && !prev.uiLibraries.includes("Aceternity UI"))
          nextUiLibs = [...prev.uiLibraries, "Aceternity UI"]
        if (isWatermelon && !has && !prev.uiLibraries.includes("Watermelon UI"))
          nextUiLibs = [...prev.uiLibraries, "Watermelon UI"]
        if (isSupabase && !has && !prev.database) nextDatabase = "Supabase"
        if (isChakraFamily && has) {
          const remaining = prev.selectedSkills.filter((s) => s !== skillId && s.startsWith("chakra-ui"))
          if (remaining.length === 0) nextUiLibs = prev.uiLibraries.filter((x) => x !== "Chakra UI")
        }
        if (isShadcn && has) nextUiLibs = prev.uiLibraries.filter((x) => x !== "shadcn/ui")
        if (isAceternity && has) nextUiLibs = prev.uiLibraries.filter((x) => x !== "Aceternity UI")
        if (isWatermelon && has) nextUiLibs = prev.uiLibraries.filter((x) => x !== "Watermelon UI")
        if (isSupabase && has && prev.database === "Supabase") nextDatabase = prev.database
        return {
          ...prev,
          selectedSkills: has ? prev.selectedSkills.filter((s) => s !== skillId) : [...prev.selectedSkills, skillId],
          uiLibraries: nextUiLibs,
          database: nextDatabase,
        }
      })
    },
    [setState],
  )

  return { toggleArrayItem, toggleSkill }
}

export default useSkillSync
