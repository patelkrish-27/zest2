// src/backend/services/promptService.ts
// Business logic extracted from src/App.tsx generatePrompt() — single source of truth
// Service layer per backend-patterns skill: pure functions, no I/O, testable
import type { PartialBlueprintState, SkillDTO, ParsedFile } from "../types"

// Re-export catalog data so backend can generate prompt without frontend import
// Duplicated constants intentionally — backend must not import React components
export const THEMES = [
  { id: "minimalist", name: "Minimalist", feel: "Clean, premium, calm", traits: "Whitespaces · simple typography · restrained colors" },
  { id: "glassmorphism", name: "Glassmorphism", feel: "Futuristic, premium", traits: "Frosted glass · transparency · blur · glow" },
  { id: "bento", name: "Bento Grid", feel: "Modern, organized", traits: "Modular cards · asymmetric grids · rounded" },
  { id: "neo-brutalism", name: "Neo-Brutalism", feel: "Bold, edgy, distinctive", traits: "Thick borders · hard shadows · huge type · bright" },
  { id: "editorial", name: "Editorial / Magazine", feel: "Sophisticated, artistic", traits: "Large typography · columns · asymmetry · imagery" },
  { id: "swiss", name: "Swiss / International", feel: "Precise, professional", traits: "Grid systems · typography-focused · alignment" },
  { id: "neumorphism", name: "Neumorphism", feel: "Soft, tactile", traits: "Soft shadows · raised/inset · monochrome surfaces" },
  { id: "retro-y2k", name: "Retro / Y2K", feel: "Nostalgic, playful", traits: "Chrome · gradients · neon · pixel · 90s/00s" },
  { id: "3d-immersive", name: "3D / Immersive", feel: "Cinematic, futuristic", traits: "3D objects · depth · WebGL-style · spatial" },
  { id: "maximalist", name: "Maximalist", feel: "Energetic, expressive", traits: "Dense layouts · bold colors · layered · mixed type" },
] as const

export const MODIFIER_GROUPS = [
  { id: "mode", label: "Mode", options: [{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }, { value: "auto", label: "Auto" }] },
  { id: "palette", label: "Palette", options: [{ value: "monochrome", label: "Monochrome" }, { value: "colorful", label: "Colorful" }, { value: "muted", label: "Muted" }] },
  { id: "motion", label: "Motion", options: [{ value: "static", label: "Static" }, { value: "subtle", label: "Subtle Motion" }, { value: "kinetic", label: "Kinetic" }] },
  { id: "depth", label: "Depth", options: [{ value: "flat", label: "Flat" }, { value: "elevated", label: "Elevated" }, { value: "3d", label: "3D" }] },
  { id: "density", label: "Expression", options: [{ value: "subtle", label: "Subtle" }, { value: "balanced", label: "Balanced" }, { value: "expressive", label: "Expressive" }] },
] as const

export const SUB_THEMES = [
  { id: "aurora", label: "Aurora UI", desc: "blurred gradient blobs + glow" },
  { id: "liquid-glass", label: "Liquid Glass", desc: "fluid translucent depth" },
  { id: "claymorphism", label: "Claymorphism", desc: "soft 3D clay-like rounded" },
  { id: "skeuomorphism", label: "Skeuomorphism", desc: "real-world materials" },
  { id: "flat", label: "Flat Design", desc: "simple shapes, minimal depth" },
  { id: "cyberpunk", label: "Cyberpunk", desc: "neon, dark HUD, futuristic" },
  { id: "kinetic-type", label: "Kinetic Typography", desc: "type as animation" },
  { id: "organic", label: "Organic / Nature", desc: "earthy, organic shapes" },
  { id: "hand-drawn", label: "Hand-drawn", desc: "doodles, imperfect human" },
  { id: "dark-luxury", label: "Dark Luxury", desc: "black, elegant, metallic glow" },
] as const

export const FONTS = [
  { name: "Inter", vibe: "Clean, professional, polished" },
  { name: "Geist", vibe: "Modern, technical, futuristic" },
  { name: "Neue Montreal", vibe: "Designer, premium, editorial" },
  { name: "Suisse Intl", vibe: "Swiss, sophisticated, precise" },
  { name: "Satoshi", vibe: "Modern, geometric, friendly" },
  { name: "Aeonik", vibe: "Bold, contemporary, premium" },
  { name: "GT America", vibe: "Strong, modern, editorial" },
  { name: "Helvetica Now", vibe: "Classic, clean, iconic" },
  { name: "Manrope", vibe: "Soft, modern, approachable" },
  { name: "Space Grotesk", vibe: "Techy, distinctive" },
  { name: "Instrument Sans", vibe: "Minimal, elegant" },
  { name: "DM Sans", vibe: "Friendly, clean" },
  { name: "Plus Jakarta Sans", vibe: "Smooth, slightly warm" },
  { name: "Switzer", vibe: "Neutral, Swiss-inspired" },
  { name: "IBM Plex Sans", vibe: "Technical, structured" },
  { name: "Graphik", vibe: "Corporate-premium" },
  { name: "Roobert", vibe: "Modern, clean, slightly human" },
  { name: "General Sans", vibe: "Contemporary, versatile" },
  { name: "Poppins", vibe: "Geometric, friendly" },
  { name: "Clash Display", vibe: "Dramatic, fashionable" },
] as const

export const FONT_PAIRINGS = [
  { id: "geist-mono", label: "01 Geist + Geist Mono", heading: "Geist", body: "Geist", mono: "Geist Mono", vibe: "developer / AI / futuristic" },
  { id: "neue-geist-mono", label: "02 Neue Montreal + Geist Mono", heading: "Neue Montreal", body: "Neue Montreal", mono: "Geist Mono", vibe: "premium + technical" },
  { id: "inter-geist-mono", label: "03 Inter + Geist Mono", heading: "Inter", body: "Inter", mono: "Geist Mono", vibe: "clean + developer" },
  { id: "satoshi-inter", label: "04 Satoshi + Inter", heading: "Satoshi", body: "Inter", mono: "JetBrains Mono", vibe: "modern + friendly" },
  { id: "neue-instrument-serif", label: "05 Neue Montreal + Instrument Serif", heading: "Neue Montreal", body: "Instrument Sans", mono: "JetBrains Mono", vibe: "luxury + editorial" },
  { id: "space-inter", label: "06 Space Grotesk + Inter", heading: "Space Grotesk", body: "Inter", mono: "JetBrains Mono", vibe: "futuristic + readable" },
  { id: "aeonik-inter", label: "07 Aeonik + Inter", heading: "Aeonik", body: "Inter", mono: "IBM Plex Mono", vibe: "premium startup" },
  { id: "gt-america-mono", label: "08 GT America + GT America Mono", heading: "GT America", body: "GT America", mono: "JetBrains Mono", vibe: "high-end design studio" },
  { id: "manrope-plex", label: "09 Manrope + IBM Plex Mono", heading: "Manrope", body: "Manrope", mono: "IBM Plex Sans", vibe: "modern technical" },
  { id: "instrument-both", label: "10 Instrument Sans + Serif", heading: "Instrument Sans", body: "Instrument Sans", mono: "JetBrains Mono", vibe: "sophisticated editorial" },
] as const

export class PromptService {
  buildPrompt(
    state: PartialBlueprintState,
    customSections: { id: string; title: string }[] = [],
    skillsCatalog: SkillDTO[] = []
  ): string {
    let customPrompts = ""
    for (const sec of customSections) {
      const answer = state.customAnswers?.[sec.id]
      if (answer && (typeof answer === "string" ? answer.trim() : (answer as string[]).length > 0)) {
        const answerStr = Array.isArray(answer) ? answer.join(", ") : answer
        customPrompts += `${sec.title}: ${answerStr}\n`
      }
    }

    const themeName = THEMES.find((t) => t.id === state.theme)?.name || state.theme || "Not specified"
    const themeDetails = THEMES.find((t) => t.id === state.theme)
    const modifierStr = Object.entries(state.themeModifiers ?? {})
      .map(([k, v]) => {
        const g = MODIFIER_GROUPS.find((x) => x.id === k)
        return `${g?.label || k}: ${v}`
      })
      .join(" | ")
    const extrasStr = state.themeExtras?.length
      ? state.themeExtras.map((id) => SUB_THEMES.find((s) => s.id === id)?.label || id).join(", ")
      : "None"

    const pairing = FONT_PAIRINGS.find((p) => p.id === state.fontPairing)
    const fontPrimary = FONTS.find((f) => f.name === state.fontHeading)?.name || state.fontHeading

    const selectedSkillObjs = skillsCatalog.filter((s) => state.selectedSkills?.includes(s.id))
    const skillsPrompt =
      selectedSkillObjs.length > 0
        ? `# SKILLS (installed project skills — must be used in generated code/docs)\n${selectedSkillObjs.map((s) => `- ${s.name} [${s.id}] — ${s.description} (source: ${s.source} | docs: ${s.docsUrl} | package: ${s.package} | concepts: ${s.concepts}) — install: \`${s.installCmd}\``).join("\n")}\n\nSKILL RULES:\n${selectedSkillObjs.map((s) => `- For ${s.name}: use \`${s.package}\` as primary primitive; follow its docs at ${s.docsUrl} (raw: ${s.rawUrl}). Highlights: ${s.highlights.join(" · ")}`).join("\n")}\n`
        : "# SKILLS\nNo additional skills installed.\n"

    return `You are an expert software architect. Based on the following project blueprint, please generate comprehensive documentation and architecture markdown files. 

# PROJECT OVERVIEW
Name: ${state.projectName || "Untitled"}
Type: ${state.projectType || "Not specified"}
Problem Statement: ${state.problemStatement || "Not specified"}

# FRONTEND
Framework: ${state.frontendFramework || "Not specified"}
UI Libraries: ${state.uiLibraries?.join(", ") || "Not specified"}
Features: ${state.features?.join(", ") || "None specified"}

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
Theme Combination Summary: ${themeName !== "Not specified" ? `${modifierStr} + ${themeName}${extrasStr !== "None" ? ` + ${extrasStr}` : ""}` : "Not specified"}

# TYPOGRAPHY
Primary / Heading Font: ${state.fontHeading || "Not specified"}${fontPrimary ? ` (${FONTS.find((f) => f.name === state.fontHeading)?.vibe || ""})` : ""}
Body / UI Font: ${state.fontBody || "Not specified"}
Monospace / Code Font: ${state.fontMono || "Not specified"}
Font Pairing Preset: ${pairing ? `${pairing.label} — ${pairing.vibe} (Heading: ${pairing.heading} / Body: ${pairing.body} / Mono: ${pairing.mono})` : state.fontPairing || "Custom"}
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

  parseResponse(aiResponse: string): ParsedFile[] {
    if (!aiResponse?.trim()) return []
    const fileRegex = /---\s*FILE:\s*([a-zA-Z0-9_.-]+)\s*---([\s\S]*?)---\s*END FILE\s*---/g
    const files: ParsedFile[] = []
    let match
    while ((match = fileRegex.exec(aiResponse)) !== null) {
      files.push({ name: match[1].trim(), content: match[2].trim() })
    }
    if (files.length === 0) {
      files.push({ name: "AI_OUTPUT_RAW.md", content: aiResponse })
    }
    return files
  }

  buildSkillsGuide(skills: SkillDTO[], projectName: string): string {
    const now = new Date().toISOString()
    return `# Skills — install after scaffolding

This blueprint uses ${skills.length} skill(s). Skills are **not** auto-downloaded or bundled.
After extracting this zip, run the install command(s) below in your project root to add them.

${skills
  .map(
    (s) =>
      `## ${s.name} — \`${s.id}\`\n\n- **What:** ${s.description}\n- **Package / Skill:** \`${s.package}\`\n- **Source:** ${s.source}\n- **Docs:** ${s.docsUrl}\n- **Concepts:** ${s.concepts}\n- **Highlights:** ${s.highlights.join(" · ")}\n- **Install:**\n\n\`\`\`bash\n${s.installCmd}\n\`\`\`\n`
  )
  .join("\n")}

## Quick install (all selected)

\`\`\`bash
${skills.map((s) => s.installCmd).join("\n")}
\`\`\`

## Notes

- **Chakra UI** — \`npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills\` installs all sub-skills; pick a single one (builder/migrate/refactor) if you only need one.
- **shadcn/ui** — \`pnpm dlx skills add shadcn/ui\` adds the skill context; then \`pnpm dlx shadcn@latest init\` and \`add <component>\` inside your app. No components are bundled inside this zip.
- These commands only document installation — Blueprint does not run them automatically.

Generated: ${now}
Blueprint: ${projectName || "Untitled"} · ${skills.map((s) => s.id).join(", ")}
`
  }
}

export const promptService = new PromptService()
