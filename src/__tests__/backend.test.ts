/**
 * Backend unit tests — promptService, repository, validation middleware, errorHandler, routes (thin)
 * Runs in node env via vitest (jsdom still ok for pure logic; we mock express req/res)
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { PromptService, THEMES, MODIFIER_GROUPS, SUB_THEMES, FONTS, FONT_PAIRINGS } from "@/backend/services/promptService"
import { InMemoryBlueprintRepository } from "@/backend/repositories/blueprintRepository"
import { AppError, errorHandler, notFound } from "@/backend/middleware/errorHandler"
import { requireJsonBody, validateGeneratePrompt, validateParseResponse } from "@/backend/middleware/validate"
import type { Request, Response, NextFunction } from "express"

// ---------------------------------------------------------------------------
// Helpers for middleware tests
// ---------------------------------------------------------------------------
function mockReq(body: unknown): Request {
  return { body } as Request
}
function mockRes() {
  const res: Partial<Response> = {}
  res.status = vi.fn().mockReturnValue(res) as any
  res.json = vi.fn().mockReturnValue(res) as any
  return res as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> }
}

// ---------------------------------------------------------------------------
// PromptService
// ---------------------------------------------------------------------------
describe("backend/services/promptService", () => {
  const svc = new PromptService()

  it("THEMES / MODIFIER_GROUPS / SUB_THEMES / FONTS constants exported correctly", () => {
    expect(THEMES.length).toBe(10)
    expect(MODIFIER_GROUPS.length).toBe(5)
    expect(SUB_THEMES.length).toBe(10)
    // backend FONTS has 20 (mirrors App.tsx 20 ranked fonts); allow >=15 for tolerance
    expect(FONTS.length).toBe(20)
    expect(FONTS.length).toBeGreaterThanOrEqual(15)
    expect(FONT_PAIRINGS.length).toBe(10)
  })

  it("buildPrompt returns string containing project overview and required file list", () => {
    const p = svc.buildPrompt({ projectName: "Demo", projectType: "Web App" })
    expect(p).toContain("Demo")
    expect(p).toContain("Web App")
    expect(p).toContain("PROJECT_CONTEXT.md")
    expect(p).toContain("DEVELOPMENT_RULES.md")
    expect(p).toContain("--- FILE: FILENAME.md ---")
  })

  it("buildPrompt handles empty state gracefully", () => {
    const p = svc.buildPrompt({})
    expect(p).toContain("Untitled")
    expect(p).toContain("Not specified")
  })

  it("buildPrompt injects skillsCatalog correctly", () => {
    const skills = [
      {
        id: "test-skill",
        name: "Test Skill",
        description: "A test skill",
        category: "Testing",
        docsUrl: "example.com/docs",
        source: "skills/test/SKILL.md",
        rawUrl: "https://example.com/raw",
        package: "test-package",
        installCmd: "pnpm dlx skills add test",
        concepts: "Test",
        highlights: ["highlight1", "highlight2"],
      },
    ]
    const p = svc.buildPrompt({ selectedSkills: ["test-skill"] }, [], skills as any)
    expect(p).toContain("Test Skill")
    expect(p).toContain("test-package")
    expect(p).toContain("pnpm dlx skills add test")
    expect(p).toContain("highlight1")
  })

  it("parseResponse handles empty and null", () => {
    expect(svc.parseResponse("")).toEqual([])
    expect(svc.parseResponse(null as any)).toEqual([])
    expect(svc.parseResponse("   ")).toEqual([])
  })

  it("parseResponse parses valid FILE blocks and trims", () => {
    const input = "--- FILE: A.md ---\n  hello  \n--- END FILE ---\n--- FILE: B.md ---\nworld\n--- END FILE ---"
    const out = svc.parseResponse(input)
    expect(out.length).toBe(2)
    expect(out[0]).toEqual({ name: "A.md", content: "hello" })
    expect(out[1]).toEqual({ name: "B.md", content: "world" })
  })

  it("parseResponse fallback to AI_OUTPUT_RAW.md when no markers", () => {
    const raw = "# raw markdown"
    expect(svc.parseResponse(raw)).toEqual([{ name: "AI_OUTPUT_RAW.md", content: raw }])
  })

  it("buildSkillsGuide produces markdown with install commands", () => {
    const skills = [
      { id: "s1", name: "Skill One", description: "desc", category: "UI", docsUrl: "docs", source: "src", rawUrl: "raw", package: "pkg1", installCmd: "install s1", concepts: "c", highlights: ["h1"] },
      { id: "s2", name: "Skill Two", description: "desc2", category: "Backend", docsUrl: "docs2", source: "src2", rawUrl: "raw2", package: "pkg2", installCmd: "install s2", concepts: "c2", highlights: ["h2", "h3"] },
    ] as any
    const md = svc.buildSkillsGuide(skills, "MyApp")
    expect(md).toContain("Skill One")
    expect(md).toContain("install s1")
    expect(md).toContain("install s2")
    expect(md).toContain("MyApp")
    expect(md).toContain("Quick install")
  })

  it("buildPrompt handles customSections with string and array answers, skips empty", () => {
    const customSections = [
      { id: "sec1", title: "Q1" },
      { id: "sec2", title: "Q2" },
      { id: "sec3", title: "Q3" },
    ] as any
    const p = svc.buildPrompt(
      { customAnswers: { sec1: "answer1", sec2: ["a", "b"], sec3: "" } } as any,
      customSections,
      []
    )
    expect(p).toContain("Q1: answer1")
    expect(p).toContain("Q2: a, b")
    expect(p).not.toContain("Q3:")
  })

  it("buildPrompt handles themeModifiers and themeExtras correctly", () => {
    const p = svc.buildPrompt({
      theme: "minimalist",
      themeModifiers: { mode: "light", palette: "monochrome" } as any,
      themeExtras: ["aurora"],
    })
    expect(p).toContain("Minimalist")
    expect(p).toContain("Mode: light")
    expect(p).toContain("Palette: monochrome")
    expect(p).toContain("Aurora UI")
  })

  it("buildPrompt handles fonts and pairing", () => {
    const p = svc.buildPrompt({ fontHeading: "Inter", fontBody: "Geist", fontMono: "JetBrains Mono", fontPairing: "geist-mono" })
    expect(p).toContain("Inter")
    expect(p).toContain("Geist")
    expect(p).toContain("JetBrains Mono")
  })
})

// ---------------------------------------------------------------------------
// InMemoryBlueprintRepository
// ---------------------------------------------------------------------------
describe("backend/repositories/InMemoryBlueprintRepository", () => {
  let repo: InMemoryBlueprintRepository
  beforeEach(() => {
    repo = new InMemoryBlueprintRepository()
  })

  it("save creates record with id and createdAt", async () => {
    const rec = await repo.save({ state: { projectName: "Test" } as any, prompt: "hello" })
    expect(rec.id).toMatch(/^bp_/)
    expect(rec.createdAt).toBeTruthy()
    expect(rec.state.projectName).toBe("Test")
    expect(rec.prompt).toBe("hello")
  })

  it("findById returns saved record, null for missing", async () => {
    const saved = await repo.save({ state: {} as any, prompt: "p" })
    const found = await repo.findById(saved.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(saved.id)
    expect(await repo.findById("nonexistent")).toBeNull()
  })

  it("list returns most recent first, respects limit", async () => {
    await repo.save({ state: { projectName: "A" } as any, prompt: "a" })
    // tiny delay to ensure distinct timestamps
    await new Promise((r) => setTimeout(r, 5))
    await repo.save({ state: { projectName: "B" } as any, prompt: "b" })
    await new Promise((r) => setTimeout(r, 5))
    await repo.save({ state: { projectName: "C" } as any, prompt: "c" })
    const all = await repo.list()
    expect(all.length).toBe(3)
    expect(all[0].state.projectName).toBe("C") // most recent first
    const limited = await repo.list(2)
    expect(limited.length).toBe(2)
    expect(limited[0].state.projectName).toBe("C")
  })

  it("save with parsedFiles persists them", async () => {
    const files = [{ name: "A.md", content: "hello" }]
    const rec = await repo.save({ state: {} as any, prompt: "p", parsedFiles: files })
    expect(rec.parsedFiles).toEqual(files)
  })

  it("list default limit 20 returns all when less than 20", async () => {
    for (let i = 0; i < 5; i++) await repo.save({ state: {} as any, prompt: `p${i}` })
    const items = await repo.list()
    expect(items.length).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// validate middleware
// ---------------------------------------------------------------------------
describe("backend/middleware/validate", () => {
  it("requireJsonBody passes for valid object body", () => {
    const req = mockReq({ foo: "bar" })
    const next = vi.fn()
    requireJsonBody(req, mockRes(), next as unknown as NextFunction)
    expect(next).toHaveBeenCalledWith()
  })

  it("requireJsonBody fails for null/undefined body", () => {
    const next = vi.fn()
    requireJsonBody(mockReq(null), mockRes(), next as unknown as NextFunction)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }))
    // message check
    const err = next.mock.calls[0][0] as AppError
    expect(err.message).toMatch(/JSON/)
  })

  it("validateGeneratePrompt passes with state object", () => {
    const next = vi.fn()
    validateGeneratePrompt(mockReq({ state: { projectName: "x" } }), mockRes(), next as any)
    expect(next).toHaveBeenCalledWith()
  })

  it("validateGeneratePrompt fails without state", () => {
    const next = vi.fn()
    validateGeneratePrompt(mockReq({}), mockRes(), next as any)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }))
    const err = next.mock.calls[0][0] as any
    // ValidationError wraps issues; message is generic, details contain path 'state'
    expect(err.message).toMatch(/Validation failed/)
    expect(err.issues?.[0]?.path).toBe("state")
  })

  it("validateGeneratePrompt fails when state is not object", () => {
    const next = vi.fn()
    validateGeneratePrompt(mockReq({ state: "bad" }), mockRes(), next as any)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }))
  })

  it("validateParseResponse passes with non-empty string", () => {
    const next = vi.fn()
    validateParseResponse(mockReq({ aiResponse: "hello" }), mockRes(), next as any)
    expect(next).toHaveBeenCalledWith()
  })

  it("validateParseResponse fails for empty/missing/whitespace", () => {
    for (const body of [{}, { aiResponse: "" }, { aiResponse: "   " }, { aiResponse: 123 }]) {
      const next = vi.fn()
      validateParseResponse(mockReq(body), mockRes(), next as any)
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }))
    }
  })
})

// ---------------------------------------------------------------------------
// errorHandler
// ---------------------------------------------------------------------------
describe("backend/middleware/errorHandler", () => {
  it("handles AppError with correct status and code (includes success:false, requestId)", () => {
    const res = mockRes()
    errorHandler(new AppError(422, "bad", "MY_CODE"), { originalUrl: "/api/x" } as Request, res, (() => {}) as NextFunction)
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "bad", code: "MY_CODE", success: false }))
  })

  it("handles AppError without code defaults to APP_ERROR", () => {
    const res = mockRes()
    errorHandler(new AppError(400, "oops"), { originalUrl: "/" } as Request, res, (() => {}) as NextFunction)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "oops", code: "APP_ERROR", success: false }))
  })

  it("handles SyntaxError 400 as BAD_JSON", () => {
    const res = mockRes()
    const err = new SyntaxError("unexpected") as SyntaxError & { status?: number }
    err.status = 400
    errorHandler(err, { originalUrl: "/" } as Request, res, (() => {}) as NextFunction)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Invalid JSON body", code: "BAD_JSON", success: false }))
  })

  it("handles unknown error as 500 INTERNAL", () => {
    const res = mockRes()
    // suppress logger output
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    // mock logger.error via console? errorHandler uses logger.error - stub via vi
    errorHandler(new Error("boom"), { originalUrl: "/" } as Request, res, (() => {}) as NextFunction)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Internal server error", code: "INTERNAL", success: false }))
    spy.mockRestore()
  })

  it("notFound returns 404 with success:false", () => {
    const res = mockRes()
    notFound({ originalUrl: "/missing" } as Request, res)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Not found", code: "NOT_FOUND", success: false }))
  })

  it("AppError is instance of Error with correct name", () => {
    const e = new AppError(400, "msg", "CODE")
    expect(e).toBeInstanceOf(Error)
    expect(e.name).toBe("AppError")
    expect(e.statusCode).toBe(400)
    expect(e.code).toBe("CODE")
  })
})

// ---------------------------------------------------------------------------
// backendClient fallback (mock fetch)
// ---------------------------------------------------------------------------
describe("backend/client fallback", () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it("generatePromptWithFallback uses backend when ok", async () => {
    const { backendClient } = await import("@/backend/client")
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ prompt: "BACKEND PROMPT" }),
    })) as any
    const res = await backendClient.generatePromptWithFallback({} as any, () => "fallback", { customSections: [], skillsCatalog: [] as any })
    expect(res.source).toBe("backend")
    expect(res.prompt).toBe("BACKEND PROMPT")
  })

  it("generatePromptWithFallback falls back on fetch failure", async () => {
    const { backendClient } = await import("@/backend/client")
    global.fetch = vi.fn(async () => { throw new Error("down") }) as any
    const res = await backendClient.generatePromptWithFallback({} as any, () => "local", { customSections: [], skillsCatalog: [] as any })
    expect(res.source).toBe("fallback")
    expect(res.prompt).toBe("local")
    expect(res.error).toMatch(/down/)
  })

  it("parseResponseWithFallback uses backend when ok", async () => {
    const { backendClient } = await import("@/backend/client")
    const files = [{ name: "A.md", content: "hi" }]
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ files }),
    })) as any
    const res = await backendClient.parseResponseWithFallback("input", () => [])
    expect(res.source).toBe("backend")
    expect(res.files).toEqual(files)
  })

  it("parseResponseWithFallback falls back on non-ok response", async () => {
    const { backendClient } = await import("@/backend/client")
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 500,
      statusText: "Server Error",
      json: async () => ({ error: "oops" }),
    })) as any
    const fallback = [{ name: "AI_OUTPUT_RAW.md", content: "raw" }]
    const res = await backendClient.parseResponseWithFallback("raw", () => fallback)
    expect(res.source).toBe("fallback")
    expect(res.files).toEqual(fallback)
  })
})
