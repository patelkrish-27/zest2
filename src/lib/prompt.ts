import type { AppState, AppConfig, Skill } from "@/types/blueprint"
import type { Theme, ModifierGroup, SubTheme, Font, FontPairing } from "@/types/blueprint"

export interface PromptDeps {
  themes: Theme[]
  modifierGroups: ModifierGroup[]
  subThemes: SubTheme[]
  fonts: Font[]
  fontPairings: FontPairing[]
  catalog: Skill[]
}

/**
 * Pure prompt builder — no React, no side effects.
 * Mirrors generatePrompt() in App.tsx for test parity and reuse.
 */
export function generatePrompt(
  state: AppState,
  config: AppConfig,
  deps: PromptDeps,
): string {
  const { themes, modifierGroups, subThemes, fonts, fontPairings, catalog } = deps

  let customPrompts = ""
  config.customSections.forEach((section) => {
    const answer = state.customAnswers[section.id]
    if (answer && (typeof answer === "string" || (Array.isArray(answer) && answer.length > 0))) {
      const answerStr = Array.isArray(answer) ? answer.join(", ") : answer
      customPrompts += `${section.title}: ${answerStr}\n`
    }
  })

  const themeName =
    themes.find((t) => t.id === state.theme)?.name || state.theme || "Not specified"
  const themeDetails = themes.find((t) => t.id === state.theme)
  const modifierStr = Object.entries(state.themeModifiers)
    .map(([k, v]) => {
      const g = modifierGroups.find((x) => x.id === k)
      return `${g?.label || k}: ${v}`
    })
    .join(" | ")
  const extrasStr = state.themeExtras.length
    ? state.themeExtras.map((id) => subThemes.find((s) => s.id === id)?.label || id).join(", ")
    : "None"

  const pairing = fontPairings.find((p) => p.id === state.fontPairing)
  const fontPrimary = fonts.find((f) => f.name === state.fontHeading)?.name || state.fontHeading

  const skillsPrompt =
    catalog.filter((s) => state.selectedSkills.includes(s.id)).length > 0
      ? `# SKILLS (installed project skills — must be used in generated code/docs)\n${catalog
          .filter((s) => state.selectedSkills.includes(s.id))
          .map(
            (s) =>
              `- ${s.name} [${s.id}] — ${s.description} (source: ${s.source} | docs: ${s.docsUrl} | package: ${s.package} | concepts: ${s.concepts}) — install: \`${s.installCmd}\``,
          )
          .join("\n")}\n\nSKILL RULES:\n${catalog
          .filter((s) => state.selectedSkills.includes(s.id))
          .map(
            (s) =>
              `- For ${s.name}: use \`${s.package}\` as primary primitive; follow its docs at ${s.docsUrl} (raw: ${s.rawUrl}). Highlights: ${s.highlights.join(" · ")}`,
          )
          .join("\n")}\n`
      : "# SKILLS\nNo additional skills installed.\n"

  return `You are an expert software architect. Based on the following project blueprint, please generate comprehensive documentation and architecture markdown files. 

# PROJECT OVERVIEW
Name: ${state.projectName || "Untitled"}
Type: ${state.projectType || "Not specified"}
Problem Statement: ${state.problemStatement || "Not specified"}

# FRONTEND
Framework: ${state.frontendFramework || "Not specified"}
UI Libraries: ${state.uiLibraries.join(", ") || "Not specified"}
Features: ${state.features.join(", ") || "None specified"}

# BACKEND
Framework: ${state.backendFramework || "Not specified"}
Database: ${state.database || "Not specified"}

# ARCHITECTURE DETAILS
Pages/Routes:
${state.pages || "Not specified"}

Components:
${state.components || "Not specified"}

Database Tables:
${state.dbTables || "Not specified"}

# VISUAL STYLE & THEME
Primary Theme: ${themeName}${themeDetails ? ` — ${themeDetails.feel} (${themeDetails.traits})` : ""}
Modifiers: ${modifierStr || "Not specified"}
Additional Layers: ${extrasStr}
Theme Combination Summary: ${
    themeName !== "Not specified"
      ? `${modifierStr} + ${themeName}${extrasStr !== "None" ? ` + ${extrasStr}` : ""}`
      : "Not specified"
  }

# TYPOGRAPHY
Primary / Heading Font: ${state.fontHeading || "Not specified"}${fontPrimary ? ` (${fonts.find((f) => f.name === state.fontHeading)?.vibe || ""})` : ""}
Body / UI Font: ${state.fontBody || "Not specified"}
Monospace / Code Font: ${state.fontMono || "Not specified"}
Font Pairing Preset: ${
    pairing
      ? `${pairing.label} — ${pairing.vibe} (Heading: ${pairing.heading} / Body: ${pairing.body} / Mono: ${pairing.mono})`
      : state.fontPairing || "Custom"
  }
Typography Summary: Headings → ${state.fontHeading || "—"} | Body/UI → ${state.fontBody || "—"} | Code/Meta → ${state.fontMono || "—"}

${skillsPrompt}
${customPrompts ? `# ADDITIONAL REQUIREMENTS\n${customPrompts}\n` : ""}---
Please provide your response strictly as a series of markdown files. Use the following format exactly for each file:

--- FILE: FILENAME.md ---
(File content here)
--- END FILE ---

Required files to generate:
1. PROJECT_CONTEXT.md
2. PRODUCT_REQUIREMENTS.md
3. FRONTEND_ARCHITECTURE.md
4. BACKEND_ARCHITECTURE.md
5. DATABASE.md
6. DEVELOPMENT_RULES.md
`
}

export default generatePrompt
