import JSZip from "jszip"
import type { AppState } from "@/types/blueprint"

export interface ParsedFile {
  name: string
  content: string
}

export interface BuildBlueprintOptions {
  state: AppState
  files: ParsedFile[]
  catalog: { id: string; name: string; description: string; source: string; docsUrl: string; package: string; installCmd: string; concepts: string; highlights: string[] }[]
}

function sanitizeFolderName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-") || "project"
}

function buildSkillsMd(
  selected: BuildBlueprintOptions["catalog"],
): string {
  return `# Skills — install after scaffolding

This blueprint uses ${selected.length} skill(s). Skills are **not** auto-downloaded or bundled.
After extracting this zip, run the install command(s) below in your project root to add them.

${selected
  .map(
    (s) =>
      `## ${s.name} — \`${s.id}\`\n\n- **What:** ${s.description}\n- **Package / Skill:** \`${s.package}\`\n- **Source:** ${s.source}\n- **Docs:** ${s.docsUrl}\n- **Concepts:** ${s.concepts}\n- **Highlights:** ${s.highlights.join(" · ")}\n- **Install:**\n\n\`\`\`bash\n${s.installCmd}\n\`\`\`\n`,
  )
  .join("\n")}

## Quick install (all selected)

\`\`\`bash
${selected.map((s) => s.installCmd).join("\n")}
\`\`\`

## Notes

- **Chakra UI** — \`npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills\` installs all sub-skills; pick a single one (builder/migrate/refactor) if you only need one.
- **shadcn/ui** — \`pnpm dlx skills add shadcn/ui\` adds the skill context; then \`pnpm dlx shadcn@latest init\` and \`add <component>\` inside your app. No components are bundled inside this zip.
- These commands only document installation — Blueprint does not run them automatically.

Generated: ${new Date().toISOString()}
Blueprint: ${selected.length} skills
`
}

/**
 * Pure zip builder for the blueprint package.
 * Adds parsed files + optional SKILLS.md / skills/ directory when skills are selected.
 * Returns the generated Blob; callers handle download via file-saver.
 */
export async function buildBlueprintBlob(opts: BuildBlueprintOptions): Promise<Blob> {
  const { state, files, catalog } = opts
  const zip = new JSZip()
  const folder = zip.folder(`${sanitizeFolderName(state.projectName)}-blueprint`) || zip

  files.forEach((file) => {
    folder.file(file.name, file.content)
  })

  if (state.selectedSkills.length > 0) {
    const selected = catalog.filter((s) => state.selectedSkills.includes(s.id))
    folder.file("SKILLS.md", buildSkillsMd(selected))

    const skillsFolder = folder.folder("skills")
    selected.forEach((s) => {
      const perSkill = `# ${s.name}\n\n${s.description}\n\nInstall:\n\`\`\`bash\n${s.installCmd}\n\`\`\`\n\nSource: ${s.source}\nDocs: ${s.docsUrl}\nPackage: ${s.package}\nConcepts: ${s.concepts}\n`
      skillsFolder?.file(`${s.id}/SKILL.md`, perSkill)
    })
  }

  return zip.generateAsync({ type: "blob" })
}

export function blueprintFileName(projectName: string): string {
  return `${sanitizeFolderName(projectName)}-blueprint.zip`
}

export default buildBlueprintBlob