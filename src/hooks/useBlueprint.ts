import { useState, useCallback } from "react"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { backendClient } from "@/backend/client"
import { parseFilesFromResponse } from "@/lib/parse"
import { generatePrompt as pureGenerate } from "@/lib/prompt"
import type { AppState, AppConfig, Skill } from "@/types/blueprint"
import type { Theme, ModifierGroup, SubTheme, Font, FontPairing } from "@/types/blueprint"

export function useBlueprint(
  state: AppState,
  config: AppConfig,
  deps: {
    themes: Theme[]
    modifierGroups: ModifierGroup[]
    subThemes: SubTheme[]
    fonts: Font[]
    fontPairings: FontPairing[]
    catalog: Skill[]
  },
  setPhase: (p: string) => void,
  setParsedFiles: (f: { name: string; content: string }[]) => void,
) {
  const [copied, setCopied] = useState(false)
  const [promptCopiedAt, setPromptCopiedAt] = useState<number | null>(null)

  const generatePrompt = useCallback(() => {
    return pureGenerate(state, config, {
      themes: deps.themes,
      modifierGroups: deps.modifierGroups,
      subThemes: deps.subThemes,
      fonts: deps.fonts,
      fontPairings: deps.fontPairings,
      catalog: deps.catalog,
    })
  }, [state, config, deps])

  const handleCopyPrompt = useCallback(async () => {
    try {
      const { prompt } = await backendClient.generatePromptWithFallback(
        state as unknown as Record<string, unknown> as never,
        () => generatePrompt(),
        {
          customSections: config.customSections,
          skillsCatalog: deps.catalog as never,
        },
      )
      await navigator.clipboard.writeText(prompt)
    } catch {
      await navigator.clipboard.writeText(generatePrompt())
    }
    setCopied(true)
    setPromptCopiedAt(Date.now())
    setTimeout(() => setCopied(false), 2000)
  }, [state, config, deps.catalog, generatePrompt])

  const processResponse = useCallback(async () => {
    if (!state.aiResponse.trim()) return
    const fallback = () => parseFilesFromResponse(state.aiResponse)
    try {
      const { files } = await backendClient.parseResponseWithFallback(state.aiResponse, fallback)
      setParsedFiles(files)
    } catch {
      setParsedFiles(fallback())
    }
    setPhase("blueprint")
  }, [state.aiResponse, setParsedFiles, setPhase])

  const downloadZip = useCallback(
    async (parsedFiles: { name: string; content: string }[]) => {
      const zip = new JSZip()
      const folder = zip.folder(`${state.projectName.toLowerCase().replace(/\s+/g, "-")}-blueprint`) || zip
      parsedFiles.forEach((file) => {
        folder.file(file.name, file.content)
      })
      if (state.selectedSkills.length > 0) {
        const selected = deps.catalog.filter((s) => state.selectedSkills.includes(s.id))
        const skillsMd = `# Skills — install after scaffolding

This blueprint uses ${selected.length} skill(s). Skills are **not** auto-downloaded or bundled.
After extracting this zip, run the install command(s) below in your project root to add them.

${selected.map((s) => `## ${s.name} — \`${s.id}\`\n\n- **What:** ${s.description}\n- **Package / Skill:** \`${s.package}\`\n- **Source:** ${s.source}\n- **Docs:** ${s.docsUrl}\n- **Concepts:** ${s.concepts}\n- **Highlights:** ${s.highlights.join(" · ")}\n- **Install:**\n\n\`\`\`bash\n${s.installCmd}\n\`\`\`\n`).join("\n")}

## Quick install (all selected)

\`\`\`bash
${selected.map((s) => s.installCmd).join("\n")}
\`\`\`

## Notes

- **Chakra UI** — \`npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills\` installs all sub-skills; pick a single one (builder/migrate/refactor) if you only need one.
- **shadcn/ui** — \`pnpm dlx skills add shadcn/ui\` adds the skill context; then \`pnpm dlx shadcn@latest init\` and \`add <component>\` inside your app. No components are bundled inside this zip.
- These commands only document installation — Blueprint does not run them automatically.

Generated: ${new Date().toISOString()}
Blueprint: ${state.projectName || "Untitled"} · ${state.selectedSkills.join(", ")}
`
        folder.file("SKILLS.md", skillsMd)
        const skillsFolder = folder.folder("skills")
        selected.forEach((s) => {
          const perSkill = `# ${s.name}\n\n${s.description}\n\nInstall:\n\`\`\`bash\n${s.installCmd}\n\`\`\`\n\nSource: ${s.source}\nDocs: ${s.docsUrl}\nPackage: ${s.package}\nConcepts: ${s.concepts}\n`
          skillsFolder?.file(`${s.id}/SKILL.md`, perSkill)
        })
      }
      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, `${state.projectName.toLowerCase().replace(/\s+/g, "-") || "project"}-blueprint.zip`)
    },
    [state.projectName, state.selectedSkills, deps.catalog],
  )

  return { copied, promptCopiedAt, generatePrompt, handleCopyPrompt, processResponse, downloadZip }
}

export default useBlueprint
