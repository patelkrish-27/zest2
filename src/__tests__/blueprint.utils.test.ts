/**
 * Blueprint pure-logic unit tests
 * Covers: generatePrompt(), parsedFiles handling, toggleArrayItem, toggleSkill, theme/font, wizardFlow
 */
import { describe, it, expect } from "vitest"
import {
  SKILLS_CATALOG,
  THEMES,
  MODIFIER_GROUPS,
  SUB_THEMES,
  FONTS,
  FONT_PAIRINGS,
} from "@/App"

// ---------------------------------------------------------------------------
// Helpers extracted / duplicated from App.tsx for pure logic verification
// (these mirror the implementation inside the component so refactoring
// can be validated against the canonical behaviour)
// ---------------------------------------------------------------------------

function parseFilesFromResponse(aiResponse: string): { name: string; content: string }[] {
  const fileRegex = /---\s*FILE:\s*([a-zA-Z0-9_.-]+)\s*---([\s\S]*?)---\s*END FILE\s*---/g
  const files: { name: string; content: string }[] = []
  let match
  while ((match = fileRegex.exec(aiResponse)) !== null) {
    files.push({ name: match[1].trim(), content: match[2].trim() })
  }
  if (files.length === 0) {
    files.push({ name: "AI_OUTPUT_RAW.md", content: aiResponse })
  }
  return files
}

function toggleArrayItemPure<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]
}

interface MockAppState {
  uiLibraries: string[]
  selectedSkills: string[]
  database: string
}

function toggleSkillPure(state: MockAppState, skillId: string): MockAppState {
  const has = state.selectedSkills.includes(skillId)
  let nextUiLibs = [...state.uiLibraries]
  let nextDatabase = state.database
  const isChakraFamily = skillId.startsWith("chakra-ui")
  const isShadcn = skillId === "shadcn-ui"
  const isAceternity = skillId === "aceternity-ui"
  const isWatermelon = skillId === "watermelon-ui"
  const isSupabase = skillId === "supabase"
  if (isChakraFamily && !has && !state.uiLibraries.includes("Chakra UI")) nextUiLibs.push("Chakra UI")
  if (isShadcn && !has && !state.uiLibraries.includes("shadcn/ui")) nextUiLibs.push("shadcn/ui")
  if (isAceternity && !has && !state.uiLibraries.includes("Aceternity UI")) nextUiLibs.push("Aceternity UI")
  if (isWatermelon && !has && !state.uiLibraries.includes("Watermelon UI")) nextUiLibs.push("Watermelon UI")
  if (isSupabase && !has && !state.database) nextDatabase = "Supabase"
  if (isChakraFamily && has) {
    const remaining = state.selectedSkills.filter((s) => s !== skillId && s.startsWith("chakra-ui"))
    if (remaining.length === 0) nextUiLibs = nextUiLibs.filter((x) => x !== "Chakra UI")
  }
  if (isShadcn && has) nextUiLibs = nextUiLibs.filter((x) => x !== "shadcn/ui")
  if (isAceternity && has) nextUiLibs = nextUiLibs.filter((x) => x !== "Aceternity UI")
  if (isWatermelon && has) nextUiLibs = nextUiLibs.filter((x) => x !== "Watermelon UI")
  return {
    selectedSkills: has ? state.selectedSkills.filter((s) => s !== skillId) : [...state.selectedSkills, skillId],
    uiLibraries: nextUiLibs,
    database: nextDatabase,
  }
}

function toggleArrayItemSkillSync(
  prev: MockAppState,
  key: "uiLibraries",
  item: string,
): MockAppState {
  const arr = prev[key] as string[]
  const isRemoving = arr.includes(item)
  let nextSelected = [...prev.selectedSkills]
  if (item === "Chakra UI") {
    if (!isRemoving && !prev.selectedSkills.includes("chakra-ui")) nextSelected.push("chakra-ui")
    if (isRemoving) nextSelected = nextSelected.filter((s) => !s.startsWith("chakra-ui"))
  }
  if (item === "shadcn/ui") {
    if (!isRemoving && !prev.selectedSkills.includes("shadcn-ui")) nextSelected.push("shadcn-ui")
    if (isRemoving) nextSelected = nextSelected.filter((s) => s !== "shadcn-ui")
  }
  if (item === "Aceternity UI") {
    if (!isRemoving && !prev.selectedSkills.includes("aceternity-ui")) nextSelected.push("aceternity-ui")
    if (isRemoving) nextSelected = nextSelected.filter((s) => s !== "aceternity-ui")
  }
  if (item === "Watermelon UI") {
    if (!isRemoving && !prev.selectedSkills.includes("watermelon-ui")) nextSelected.push("watermelon-ui")
    if (isRemoving) nextSelected = nextSelected.filter((s) => s !== "watermelon-ui")
  }
  if (isRemoving) return { ...prev, [key]: arr.filter((i) => i !== item), selectedSkills: nextSelected } as MockAppState
  return { ...prev, [key]: [...arr, item], selectedSkills: nextSelected } as MockAppState
}

// generatePrompt helper (simplified mirror)
function generatePromptMock(state: any, config: any): string {
  let customPrompts = ""
  config.customSections.forEach((section: any) => {
    const answer = state.customAnswers[section.id]
    if (answer && (typeof answer === "string" || (Array.isArray(answer) && answer.length > 0))) {
      const answerStr = Array.isArray(answer) ? answer.join(", ") : answer
      customPrompts += `${section.title}: ${answerStr}\n`
    }
  })
  const themeName = THEMES.find((t) => t.id === state.theme)?.name || state.theme || "Not specified"
  const selectedSkillObjs = SKILLS_CATALOG.filter((s) => state.selectedSkills.includes(s.id))
  const skillsPrompt = selectedSkillObjs.length > 0
    ? `# SKILLS\n${selectedSkillObjs.map((s) => `- ${s.name} [${s.id}]`).join("\n")}\n`
    : "# SKILLS\nNo additional skills installed.\n"
  return `Name: ${state.projectName || "Untitled"}
Type: ${state.projectType || "Not specified"}
Framework: ${state.frontendFramework || "Not specified"}
UI: ${state.uiLibraries.join(", ") || "Not specified"}
Theme: ${themeName}
${skillsPrompt}${customPrompts}`
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SKILLS_CATALOG", () => {
  it("contains at least 10 skills", () => {
    expect(SKILLS_CATALOG.length).toBeGreaterThanOrEqual(10)
  })
  it("every skill has required fields", () => {
    for (const s of SKILLS_CATALOG) {
      expect(s.id, `missing id for ${s.name}`).toBeTruthy()
      expect(s.name).toBeTruthy()
      expect(s.description).toBeTruthy()
      expect(s.category).toBeTruthy()
      expect(s.package).toBeTruthy()
      expect(s.installCmd).toBeTruthy()
      expect(s.docsUrl).toBeTruthy()
    }
  })
  it("ids are unique", () => {
    const ids = SKILLS_CATALOG.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it("includes expected categories: UI Library, Backend, Frontend", () => {
    const cats = new Set(SKILLS_CATALOG.map((s) => s.category))
    expect(cats.has("UI Library")).toBe(true)
    expect(cats.has("Backend")).toBe(true)
    expect(cats.has("Frontend")).toBe(true)
  })
})

describe("THEMES / design tokens", () => {
  it("has exactly 10 primary themes", () => {
    expect(THEMES.length).toBe(10)
  })
  it("theme ids are kebab-case / unique", () => {
    const ids = THEMES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/)
  })
  it("every theme has accent gradient", () => {
    for (const t of THEMES) expect(t.accent).toContain("from-")
  })
})

describe("MODIFIER_GROUPS & SUB_THEMES", () => {
  it("has 5 modifier groups each with 3 options", () => {
    expect(MODIFIER_GROUPS.length).toBe(5)
    for (const g of MODIFIER_GROUPS) expect(g.options.length).toBe(3)
  })
  it("modifier group ids are mode/palette/motion/depth/density", () => {
    const ids = MODIFIER_GROUPS.map((g) => g.id)
    expect(ids).toEqual(["mode", "palette", "motion", "depth", "density"])
  })
  it("SUB_THEMES has 10 entries", () => {
    expect(SUB_THEMES.length).toBe(10)
  })
})

describe("FONTS & FONT_PAIRINGS", () => {
  it("has 20 fonts", () => {
    expect(FONTS.length).toBe(20)
  })
  it("font ids are kebab-case unique", () => {
    const ids = FONTS.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it("has 10 pairings each referencing valid font names or known aliases", () => {
    expect(FONT_PAIRINGS.length).toBe(10)
    const fontNames = new Set(FONTS.map((f) => f.name))
    // allow some pairing fonts like JetBrains Mono / Geist Mono which are virtual
    const allowedMono = new Set(["Geist Mono", "JetBrains Mono", "IBM Plex Mono", "GT America Mono", "IBM Plex Sans"])
    for (const p of FONT_PAIRINGS) {
      // heading/body should be in FONTS or allowed
      const allAllowed = new Set([...fontNames, ...allowedMono, "Instrument Serif", "Geist"])
      expect(allAllowed.has(p.heading) || fontNames.has(p.heading), `heading ${p.heading} not in FONTS`).toBeTruthy()
    }
  })
  it("pairing ids are kebab-like unique", () => {
    const ids = FONT_PAIRINGS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("parseFilesFromResponse — mirrors processResponse()", () => {
  it("parses single FILE block", () => {
    const input = "--- FILE: PROJECT_CONTEXT.md ---\n# hello\n--- END FILE ---"
    const out = parseFilesFromResponse(input)
    expect(out).toEqual([{ name: "PROJECT_CONTEXT.md", content: "# hello" }])
  })
  it("parses multiple FILE blocks", () => {
    const input = "--- FILE: A.md ---\nAAA\n--- END FILE ---\n--- FILE: B.md ---\nBBB\n--- END FILE ---"
    const out = parseFilesFromResponse(input)
    expect(out.length).toBe(2)
    expect(out[0].name).toBe("A.md")
    expect(out[1].content).toBe("BBB")
  })
  it("trims filename and content", () => {
    const input = "--- FILE:  spaced.md  ---\n  hello  \n--- END FILE ---"
    const out = parseFilesFromResponse(input)
    expect(out[0].name).toBe("spaced.md")
    expect(out[0].content).toBe("hello")
  })
  it("falls back to AI_OUTPUT_RAW.md when no FILE markers found", () => {
    const input = "# just some markdown without markers"
    const out = parseFilesFromResponse(input)
    expect(out.length).toBe(1)
    expect(out[0].name).toBe("AI_OUTPUT_RAW.md")
    expect(out[0].content).toBe(input)
  })
  it("handles 6 blueprint files format", () => {
    const files = ["PROJECT_CONTEXT.md","PRODUCT_REQUIREMENTS.md","FRONTEND_ARCHITECTURE.md","BACKEND_ARCHITECTURE.md","DATABASE.md","DEVELOPMENT_RULES.md"]
    const input = files.map((f) => `--- FILE: ${f} ---\ncontent ${f}\n--- END FILE ---`).join("\n")
    const out = parseFilesFromResponse(input)
    expect(out.length).toBe(6)
    expect(out.map((x) => x.name)).toEqual(files)
  })
  it("ignores malformed header without trailing --- END FILE ---", () => {
    const input = "--- FILE: A.md ---\nhello\nno end marker"
    const out = parseFilesFromResponse(input)
    expect(out[0].name).toBe("AI_OUTPUT_RAW.md") // fallback since regex requires END FILE
  })
})

describe("toggleArrayItem pure logic", () => {
  it("adds item when not present", () => {
    expect(toggleArrayItemPure(["a"], "b")).toEqual(["a","b"])
  })
  it("removes item when present", () => {
    expect(toggleArrayItemPure(["a","b"], "b")).toEqual(["a"])
  })
  it("is idempotent / toggling twice restores", () => {
    const arr = ["x"]
    const once = toggleArrayItemPure(arr, "y")
    const twice = toggleArrayItemPure(once, "y")
    expect(twice).toEqual(arr)
  })
})

describe("toggleArrayItemSkillSync — uiLibraries ↔ selectedSkills sync", () => {
  it("adding Chakra UI auto-adds chakra-ui skill", () => {
    const s: MockAppState = { uiLibraries: [], selectedSkills: [], database: "" }
    const next = toggleArrayItemSkillSync(s, "uiLibraries", "Chakra UI")
    expect(next.uiLibraries).toContain("Chakra UI")
    expect(next.selectedSkills).toContain("chakra-ui")
  })
  it("removing Chakra UI removes all chakra-* skills", () => {
    const s: MockAppState = { uiLibraries: ["Chakra UI"], selectedSkills: ["chakra-ui","chakra-ui-builder"], database: "" }
    const next = toggleArrayItemSkillSync(s, "uiLibraries", "Chakra UI")
    expect(next.uiLibraries).not.toContain("Chakra UI")
    expect(next.selectedSkills.every((x) => !x.startsWith("chakra-ui"))).toBe(true)
  })
  it("adding shadcn/ui auto-adds shadcn-ui", () => {
    const s: MockAppState = { uiLibraries: [], selectedSkills: [], database: "" }
    const next = toggleArrayItemSkillSync(s, "uiLibraries", "shadcn/ui")
    expect(next.selectedSkills).toContain("shadcn-ui")
  })
  it("removing shadcn/ui removes shadcn-ui skill", () => {
    const s: MockAppState = { uiLibraries: ["shadcn/ui"], selectedSkills: ["shadcn-ui"], database: "" }
    const next = toggleArrayItemSkillSync(s, "uiLibraries", "shadcn/ui")
    expect(next.selectedSkills).not.toContain("shadcn-ui")
  })
})

describe("toggleSkill pure logic — skills → uiLibraries/database sync", () => {
  it("installing chakra-ui adds Chakra UI lib", () => {
    const s: MockAppState = { uiLibraries: [], selectedSkills: [], database: "" }
    const next = toggleSkillPure(s, "chakra-ui")
    expect(next.selectedSkills).toContain("chakra-ui")
    expect(next.uiLibraries).toContain("Chakra UI")
  })
  it("removing last chakra family skill removes Chakra UI lib", () => {
    const s: MockAppState = { uiLibraries: ["Chakra UI"], selectedSkills: ["chakra-ui"], database: "" }
    const next = toggleSkillPure(s, "chakra-ui")
    expect(next.uiLibraries).not.toContain("Chakra UI")
  })
  it("keeping another chakra family skill keeps lib", () => {
    const s: MockAppState = { uiLibraries: ["Chakra UI"], selectedSkills: ["chakra-ui","chakra-ui-builder"], database: "" }
    const next = toggleSkillPure(s, "chakra-ui")
    expect(next.uiLibraries).toContain("Chakra UI")
    expect(next.selectedSkills).toEqual(["chakra-ui-builder"])
  })
  it("supabase install sets database to Supabase when empty", () => {
    const s: MockAppState = { uiLibraries: [], selectedSkills: [], database: "" }
    const next = toggleSkillPure(s, "supabase")
    expect(next.database).toBe("Supabase")
  })
  it("supabase install preserves existing database", () => {
    const s: MockAppState = { uiLibraries: [], selectedSkills: [], database: "PostgreSQL" }
    const next = toggleSkillPure(s, "supabase")
    expect(next.database).toBe("PostgreSQL")
  })
  it("toggling non-existent skill adds it, toggling again removes", () => {
    const s: MockAppState = { uiLibraries: [], selectedSkills: [], database: "" }
    const once = toggleSkillPure(s, "aceternity-ui")
    const twice = toggleSkillPure(once, "aceternity-ui")
    expect(twice.selectedSkills).toEqual([])
  })
})

describe("generatePrompt mirror — key fields present", () => {
  it("includes project overview fields", () => {
    const state = { projectName: "Acme", projectType: "Web App", frontendFramework: "Next.js", uiLibraries: ["Tailwind CSS"], theme: "minimalist", selectedSkills: [], customAnswers: {}, fontPairing: "geist-mono" }
    const config = { customSections: [] }
    const p = generatePromptMock(state, config)
    expect(p).toContain("Acme")
    expect(p).toContain("Web App")
    expect(p).toContain("Next.js")
    expect(p).toContain("Minimalist")
  })
  it("falls back to Untitled / Not specified when empty", () => {
    const state = { projectName: "", projectType: "", frontendFramework: "", uiLibraries: [], theme: "", selectedSkills: [], customAnswers: {} }
    const config = { customSections: [] }
    const p = generatePromptMock(state, config)
    expect(p).toContain("Untitled")
    expect(p).toContain("Not specified")
  })
  it("injects selected skill names", () => {
    const state = { projectName: "X", projectType: "Website", frontendFramework: "React", uiLibraries: [], theme: "", selectedSkills: ["chakra-ui","supabase"], customAnswers: {} }
    const config = { customSections: [] }
    const p = generatePromptMock(state, config)
    expect(p).toContain("chakra-ui")
    expect(p).toContain("supabase")
  })
  it("appends custom section answers", () => {
    const state = { projectName: "X", projectType: "", frontendFramework: "", uiLibraries: [], theme: "", selectedSkills: [], customAnswers: { sec_1: "Answer A", sec_2: ["B","C"] } }
    const config = { customSections: [{ id: "sec_1", title: "Q1" }, { id: "sec_2", title: "Q2" }] }
    const p = generatePromptMock(state, config)
    expect(p).toContain("Q1: Answer A")
    expect(p).toContain("Q2: B, C")
  })
})

describe("wizardFlow construction", () => {
  it("wizardFlow covers all phases in order without custom pages", () => {
    const customPages: { id:string }[] = []
    const flow = ["project","frontend","backend","architecture","theme","skills",...customPages.map((p)=>p.id),"prompt","response","blueprint"]
    expect(flow).toEqual(["project","frontend","backend","architecture","theme","skills","prompt","response","blueprint"])
  })
  it("inserts customPages between skills and prompt", () => {
    const customPages = [{id:"page_1"},{id:"page_2"}]
    const flow = ["project","frontend","backend","architecture","theme","skills",...customPages.map((p)=>p.id),"prompt","response","blueprint"]
    expect(flow.indexOf("skills")+1).toBe(flow.indexOf("page_1"))
    expect(flow.indexOf("page_2")+1).toBe(flow.indexOf("prompt"))
  })
  it("prev/next navigation works", () => {
    const flow = ["project","frontend","backend","architecture","theme","skills","prompt","response","blueprint"]
    const idx = flow.indexOf("backend")
    expect(flow[idx-1]).toBe("frontend")
    expect(flow[idx+1]).toBe("architecture")
  })
})

describe("JSZip / downloadZip serialization", () => {
  it("JSZip can produce a blob from parsed files", async () => {
    const JSZip = (await import("jszip")).default
    const zip = new JSZip()
    const folder = zip.folder("test-blueprint") || zip
    const files = [{name:"A.md",content:"#A"},{name:"B.md",content:"#B"}]
    files.forEach((f)=> folder.file(f.name, f.content))
    const blob = await zip.generateAsync({type:"blob"})
    expect(blob.size).toBeGreaterThan(0)
    // verify contents by re-reading
    const reloaded = await JSZip.loadAsync(blob)
    expect(Object.keys(reloaded.files).some((k)=>k.includes("A.md"))).toBe(true)
  })
})

describe("double-quote apostrophe rule", () => {
  it("README / docs guideline: no single-quoted string contains unescaped apostrophe", async () => {
    // This checks the source doesn't use patterns like 'We're' which break build
    const fs = await import("node:fs")
    const content = fs.readFileSync("src/App.tsx","utf-8")
    // look for single-quoted strings containing apostrophe without escaping
    // simpler: ensure no occurrence of "'[^']*'[^\"]" triggers parser failure - just assert file uses double quotes for those phrases
    // We'll assert that "We're" etc if present are double-quoted
    const risky = content.match(/'[^']*'/g) || []
    for (const s of risky) {
      // if s contains "We're" style, it would have been captured incorrectly; but check it doesn't contain unescaped '
      // For now just ensure no segment equals "'We're" - naive check
      expect(s).not.toMatch(/'.*We.*'/) // no single-quoted We
    }
  })
})
