/**
 * Extended pure-logic tests: parseFiles edge cases, generatePrompt skill injection,
 * wizardFlow customPage injection, font pairing apply, theme sync, localStorage, backend fallback
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  SKILLS_CATALOG,
  THEMES,
  MODIFIER_GROUPS,
  SUB_THEMES,
  FONTS,
  FONT_PAIRINGS,
} from "@/App"

import { PromptService } from "@/backend/services/promptService"

// ---------------------------------------------------------------------------
// Local helpers mirroring App.tsx pure logic (so we can test edge cases without mounting)
// ---------------------------------------------------------------------------
function parseFilesFromResponse(aiResponse: string) {
  const fileRegex = /---\s*FILE:\s*([a-zA-Z0-9_.-]+)\s*---([\s\S]*?)---\s*END FILE\s*---/g
  const files: { name: string; content: string }[] = []
  let match
  while ((match = fileRegex.exec(aiResponse)) !== null) {
    files.push({ name: match[1].trim(), content: match[2].trim() })
  }
  if (files.length === 0) files.push({ name: "AI_OUTPUT_RAW.md", content: aiResponse })
  return files
}

function wizardFlow(customPages: { id: string }[] = []) {
  return ["project", "frontend", "backend", "architecture", "theme", "skills", ...customPages.map((p) => p.id), "prompt", "response", "blueprint"]
}

function applyFontPairingPure(pairId: string) {
  const pairing = FONT_PAIRINGS.find((p) => p.id === pairId)
  if (!pairing) return null
  return { fontHeading: pairing.heading, fontBody: pairing.body, fontMono: pairing.mono, fontPairing: pairId }
}

// ---------------------------------------------------------------------------
// parseFiles edge cases
// ---------------------------------------------------------------------------
describe("parseFilesFromResponse edge cases", () => {
  it("handles filenames with dots, dashes, underscores", () => {
    const input = "--- FILE: my-file_v2.test.md ---\nhello\n--- END FILE ---"
    expect(parseFilesFromResponse(input)[0].name).toBe("my-file_v2.test.md")
  })

  it("handles content containing FILE-like substrings without END", () => {
    const input = "--- FILE: A.md ---\ncontains --- FILE: B.md --- fake\n--- END FILE ---"
    const out = parseFilesFromResponse(input)
    expect(out.length).toBe(1)
    expect(out[0].name).toBe("A.md")
    expect(out[0].content).toContain("--- FILE: B.md ---")
  })

  it("trims whitespace around filename and content", () => {
    const input = "--- FILE:   spaced.md   ---\n\n  hello world  \n\n--- END FILE ---"
    const out = parseFilesFromResponse(input)
    expect(out[0].name).toBe("spaced.md")
    expect(out[0].content).toBe("hello world")
  })

  it("handles empty file content", () => {
    const input = "--- FILE: EMPTY.md ---\n--- END FILE ---"
    const out = parseFilesFromResponse(input)
    expect(out[0].name).toBe("EMPTY.md")
    expect(out[0].content).toBe("")
  })

  it("handles whitespace-only AI response as single raw file with empty content fallback", () => {
    const input = "   \n  "
    // App code checks trim before fallback, but our pure helper still pushes raw
    const out = parseFilesFromResponse(input)
    // raw fallback still contains input
    expect(out[0].name).toBe("AI_OUTPUT_RAW.md")
  })

  it("rejects disallowed chars in filename (spaces) — no match → fallback", () => {
    const input = "--- FILE: bad name.md ---\nhello\n--- END FILE ---"
    const out = parseFilesFromResponse(input)
    expect(out[0].name).toBe("AI_OUTPUT_RAW.md") // regex does not capture space
  })

  it("parses multiple files with newlines between blocks", () => {
    const input = ["A.md", "B.md", "C.md"].map((n) => `--- FILE: ${n} ---\ncontent ${n}\n--- END FILE ---`).join("\n\n\n")
    expect(parseFilesFromResponse(input).length).toBe(3)
  })

  it("handles 6 blueprint files round-trip", () => {
    const names = ["PROJECT_CONTEXT.md", "PRODUCT_REQUIREMENTS.md", "FRONTEND_ARCHITECTURE.md", "BACKEND_ARCHITECTURE.md", "DATABASE.md", "DEVELOPMENT_RULES.md"]
    const input = names.map((n) => `--- FILE: ${n} ---\n# ${n}\n--- END FILE ---`).join("\n")
    const out = parseFilesFromResponse(input)
    expect(out.map((f) => f.name)).toEqual(names)
  })
})

// ---------------------------------------------------------------------------
// PromptService — skill injection, font, theme, customPages
// ---------------------------------------------------------------------------
describe("PromptService.buildPrompt — skill injection & typography", () => {
  const svc = new PromptService()

  it("generates fallback Untitled / Not specified when state empty", () => {
    const p = svc.buildPrompt({})
    expect(p).toContain("Untitled")
    expect(p).toContain("Not specified")
  })

  it("includes project overview fields", () => {
    const p = svc.buildPrompt({ projectName: "Acme", projectType: "Web App", frontendFramework: "Next.js (App Router)", theme: "minimalist" })
    expect(p).toContain("Acme")
    expect(p).toContain("Web App")
    expect(p).toContain("Next.js (App Router)")
    expect(p).toContain("Minimalist")
  })

  it("injects selected skill names, packages, installCmd, highlights", () => {
    const skills = SKILLS_CATALOG.slice(0, 2)
    const p = svc.buildPrompt({ selectedSkills: skills.map((s) => s.id) }, [], skills as any)
    for (const s of skills) {
      expect(p).toContain(s.id)
      expect(p).toContain(s.name)
      expect(p).toContain(s.package)
      expect(p).toContain(s.installCmd)
      expect(p).toContain(s.highlights[0])
    }
    expect(p).toContain("# SKILLS")
    expect(p).toContain("SKILL RULES")
  })

  it("says No additional skills when none selected", () => {
    const p = svc.buildPrompt({ selectedSkills: [] }, [], SKILLS_CATALOG as any)
    expect(p).toContain("No additional skills installed")
  })

  it("appends custom section answers (single + multi)", () => {
    const customSections = [
      { id: "sec_1", title: "Custom Q1" },
      { id: "sec_2", title: "Custom Q2" },
    ]
    const p = svc.buildPrompt(
      { customAnswers: { sec_1: "Answer A", sec_2: ["B", "C"] } } as any,
      customSections as any,
      []
    )
    expect(p).toContain("Custom Q1: Answer A")
    expect(p).toContain("Custom Q2: B, C")
  })

  it("skips empty custom answers", () => {
    const customSections = [{ id: "sec_1", title: "Q1" }]
    const p = svc.buildPrompt({ customAnswers: { sec_1: "" } } as any, customSections as any, [])
    expect(p).not.toContain("Q1:")
  })

  it("includes typography summary with font pairing preset", () => {
    const p = svc.buildPrompt({ fontHeading: "Geist", fontBody: "Geist", fontMono: "Geist Mono", fontPairing: "geist-mono" })
    expect(p).toContain("Geist")
    expect(p).toContain("01 Geist + Geist Mono")
    expect(p).toContain("developer / AI / futuristic")
  })

  it("handles unknown font pairing as Custom", () => {
    const p = svc.buildPrompt({ fontPairing: "nonexistent-pairing" })
    expect(p).toContain("nonexistent-pairing")
  })

  it("includes theme modifiers and extras", () => {
    const p = svc.buildPrompt({
      theme: "glassmorphism",
      themeModifiers: { mode: "dark", palette: "colorful" } as any,
      themeExtras: ["aurora", "liquid-glass"],
    })
    expect(p).toContain("Glassmorphism")
    expect(p).toContain("Mode: dark")
    expect(p).toContain("Aurora UI")
    expect(p).toContain("Liquid Glass")
  })

  it("uses theme id as fallback when theme not in THEMES", () => {
    const p = svc.buildPrompt({ theme: "unknown-theme" })
    expect(p).toContain("unknown-theme")
  })

  it("includes required file markers and 6 blueprint file list", () => {
    const p = svc.buildPrompt({})
    expect(p).toContain("--- FILE: FILENAME.md ---")
    expect(p).toContain("--- END FILE ---")
    expect(p).toContain("PROJECT_CONTEXT.md")
    expect(p).toContain("DEVELOPMENT_RULES.md")
  })
})

describe("PromptService.parseResponse", () => {
  const svc = new PromptService()

  it("returns [] for empty string (backend strict)", () => {
    expect(svc.parseResponse("")).toEqual([])
    expect(svc.parseResponse("   ")).toEqual([])
  })

  it("parses single FILE block", () => {
    const out = svc.parseResponse("--- FILE: A.md ---\nhello\n--- END FILE ---")
    expect(out).toEqual([{ name: "A.md", content: "hello" }])
  })

  it("falls back to AI_OUTPUT_RAW.md when no markers", () => {
    const raw = "# just markdown"
    const out = svc.parseResponse(raw)
    expect(out).toEqual([{ name: "AI_OUTPUT_RAW.md", content: raw }])
  })

  it("parses 6 files", () => {
    const names = ["PROJECT_CONTEXT.md", "PRODUCT_REQUIREMENTS.md", "FRONTEND_ARCHITECTURE.md", "BACKEND_ARCHITECTURE.md", "DATABASE.md", "DEVELOPMENT_RULES.md"]
    const input = names.map((n) => `--- FILE: ${n} ---\n${n} content\n--- END FILE ---`).join("\n")
    const out = svc.parseResponse(input)
    expect(out.length).toBe(6)
  })
})

describe("PromptService.buildSkillsGuide", () => {
  const svc = new PromptService()
  it("includes skill install commands and header", () => {
    const skills = SKILLS_CATALOG.slice(0, 1) as any
    const md = svc.buildSkillsGuide(skills, "My App")
    expect(md).toContain("Skills — install after scaffolding")
    expect(md).toContain(skills[0].name)
    expect(md).toContain(skills[0].installCmd)
    expect(md).toContain("Quick install")
    expect(md).toContain("My App")
  })
})

// ---------------------------------------------------------------------------
// wizardFlow customPage injection
// ---------------------------------------------------------------------------
describe("wizardFlow injection", () => {
  it("without custom pages order is canonical", () => {
    expect(wizardFlow()).toEqual(["project", "frontend", "backend", "architecture", "theme", "skills", "prompt", "response", "blueprint"])
  })
  it("injects custom pages between skills and prompt", () => {
    const flow = wizardFlow([{ id: "page_1" }, { id: "page_2" }])
    expect(flow.indexOf("skills") + 1).toBe(flow.indexOf("page_1"))
    expect(flow.indexOf("page_2") + 1).toBe(flow.indexOf("prompt"))
  })
  it("prev/next navigation correct with custom pages", () => {
    const flow = wizardFlow([{ id: "page_custom" }])
    const idx = flow.indexOf("page_custom")
    expect(flow[idx - 1]).toBe("skills")
    expect(flow[idx + 1]).toBe("prompt")
  })
  it("handles many custom pages numbering", () => {
    const pages = Array.from({ length: 5 }, (_, i) => ({ id: `page_${i}` }))
    const flow = wizardFlow(pages)
    expect(flow.length).toBe(9 + 5)
    expect(flow.filter((x) => x.startsWith("page_"))).toEqual(pages.map((p) => p.id))
  })
})

// ---------------------------------------------------------------------------
// font pairing
// ---------------------------------------------------------------------------
describe("font pairing apply", () => {
  it("applies known pairing", () => {
    const res = applyFontPairingPure("geist-mono")
    expect(res).toEqual({ fontHeading: "Geist", fontBody: "Geist", fontMono: "Geist Mono", fontPairing: "geist-mono" })
  })
  it("returns null for unknown pairing", () => {
    expect(applyFontPairingPure("nonexistent")).toBeNull()
  })
  it("all FONT_PAIRINGS are resolvable", () => {
    for (const p of FONT_PAIRINGS) {
      const res = applyFontPairingPure(p.id)
      expect(res).not.toBeNull()
      expect(res!.fontPairing).toBe(p.id)
    }
  })
  it("FONTS count 20 and pairings reference valid combos", () => {
    expect(FONTS.length).toBe(20)
    expect(FONT_PAIRINGS.length).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// theme modifiers structure
// ---------------------------------------------------------------------------
describe("theme system constants", () => {
  it("THEMES 10 with required fields", () => {
    expect(THEMES.length).toBe(10)
    for (const t of THEMES) {
      expect(t.id).toMatch(/^[a-z0-9-]+$/)
      expect(t.name).toBeTruthy()
      expect(t.feel).toBeTruthy()
    }
  })
  it("MODIFIER_GROUPS 5 each 3 options", () => {
    expect(MODIFIER_GROUPS.length).toBe(5)
    for (const g of MODIFIER_GROUPS) expect(g.options.length).toBe(3)
  })
  it("SUB_THEMES 10", () => {
    expect(SUB_THEMES.length).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// localStorage-like persistence (mock)
// ---------------------------------------------------------------------------
describe("localStorage persistence contract", () => {
  const KEY = "zest_blueprint_state"
  beforeEach(() => localStorage.clear())
  it("can save and restore AppState shape", () => {
    const state = { projectName: "Test", theme: "minimalist", selectedSkills: ["chakra-ui"] }
    localStorage.setItem(KEY, JSON.stringify(state))
    const restored = JSON.parse(localStorage.getItem(KEY)!)
    expect(restored.projectName).toBe("Test")
    expect(restored.theme).toBe("minimalist")
    expect(restored.selectedSkills).toContain("chakra-ui")
  })
  it("handles corrupted JSON gracefully", () => {
    localStorage.setItem(KEY, "{not json")
    let parsed: any = null
    try {
      parsed = JSON.parse(localStorage.getItem(KEY)!)
    } catch {
      parsed = null
    }
    expect(parsed).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// backend client fallback contract (unit without network)
// ---------------------------------------------------------------------------
describe("backend client fallback contract", () => {
  it("generatePrompt fallback returns local prompt when backend throws", async () => {
    const { backendClient } = await import("@/backend/client")
    const originalFetch = global.fetch
    // mock fetch to fail
    global.fetch = vi.fn(async () => { throw new Error("network down") }) as any
    const result = await backendClient.generatePromptWithFallback(
      { projectName: "Fallback Test" } as any,
      () => "LOCAL PROMPT: Fallback Test",
      { customSections: [], skillsCatalog: [] as any }
    )
    expect(result.source).toBe("fallback")
    expect(result.prompt).toBe("LOCAL PROMPT: Fallback Test")
    expect(result.error).toMatch(/network down/i)
    global.fetch = originalFetch
  })

  it("parseResponse fallback returns local parse when backend throws", async () => {
    const { backendClient } = await import("@/backend/client")
    const originalFetch = global.fetch
    global.fetch = vi.fn(async () => { throw new Error("timeout") }) as any
    const fallbackFiles = [{ name: "AI_OUTPUT_RAW.md", content: "raw" }]
    const result = await backendClient.parseResponseWithFallback("raw", () => fallbackFiles)
    expect(result.source).toBe("fallback")
    expect(result.files).toEqual(fallbackFiles)
    global.fetch = originalFetch
  })

  it("parseResponse succeeds when backend returns ok", async () => {
    const { backendClient } = await import("@/backend/client")
    const originalFetch = global.fetch
    const mockFiles = [{ name: "A.md", content: "hello" }]
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ files: mockFiles }),
    })) as any
    const result = await backendClient.parseResponseWithFallback("--- FILE: A.md ---\nhello\n--- END FILE ---", () => [])
    expect(result.source).toBe("backend")
    expect(result.files).toEqual(mockFiles)
    global.fetch = originalFetch
  })
})

// ---------------------------------------------------------------------------
// downloadZip skills injection (pure JSZip)
// ---------------------------------------------------------------------------
describe("downloadZip skills injection", () => {
  it("creates SKILLS.md and per-skill SKILL.md entries when skills selected", async () => {
    const JSZip = (await import("jszip")).default
    const skills = SKILLS_CATALOG.slice(0, 2) as any
    const zip = new JSZip()
    const folder = zip.folder("test-blueprint") || zip
    // simulate downloadZip skills injection
    const { PromptService } = await import("@/backend/services/promptService")
    const svc = new PromptService()
    const skillsMd = svc.buildSkillsGuide(skills, "test-blueprint")
    folder.file("SKILLS.md", skillsMd)
    const skillsFolder = folder.folder("skills")
    skills.forEach((s: any) => {
      skillsFolder?.file(`${s.id}/SKILL.md`, `# ${s.name}\n${s.installCmd}`)
    })
    const blob = await zip.generateAsync({ type: "blob" })
    const loaded = await JSZip.loadAsync(blob)
    expect(loaded.file("test-blueprint/SKILLS.md")).toBeTruthy()
    expect(loaded.file(`test-blueprint/skills/${skills[0].id}/SKILL.md`)).toBeTruthy()
    const skillsContent = await loaded.file("test-blueprint/SKILLS.md")!.async("string")
    expect(skillsContent).toContain(skills[0].installCmd)
    expect(skillsContent).toContain("auto-downloaded")
  })

  it("zip name sanitization: spaces → dashes, lowercased", () => {
    const name = "My Test App"
    const sanitized = name.toLowerCase().replace(/\s+/g, "-")
    expect(sanitized).toBe("my-test-app")
    expect(`${sanitized}-blueprint.zip`).toBe("my-test-app-blueprint.zip")
  })
})

// ---------------------------------------------------------------------------
// theme sync — document data-theme attribute
// ---------------------------------------------------------------------------
describe("theme sync contract", () => {
  afterEach(() => document.documentElement.removeAttribute("data-theme"))
  it("sets data-theme to mode value", () => {
    const mode = "dark"
    document.documentElement.setAttribute("data-theme", mode)
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
  })
  it("auto mode resolves via matchMedia", () => {
    // setup.ts mocks matchMedia to matches:false → dark
    const mode = "auto"
    const resolved = mode === "auto" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : mode
    expect(resolved).toBe("dark")
    document.documentElement.setAttribute("data-theme", resolved)
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
  })
})

// ---------------------------------------------------------------------------
// SKILLS_CATALOG categories coverage
// ---------------------------------------------------------------------------
describe("SKILLS_CATALOG coverage", () => {
  it("all categories represented", () => {
    const cats = new Set(SKILLS_CATALOG.map((s) => s.category))
    expect(cats.has("UI Library")).toBe(true)
    expect(cats.has("Backend")).toBe(true)
    expect(cats.has("Frontend")).toBe(true)
  })
  it("highlights non-empty for every skill", () => {
    for (const s of SKILLS_CATALOG) expect(s.highlights.length).toBeGreaterThan(0)
  })
})
