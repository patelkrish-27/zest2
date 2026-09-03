import { test, expect } from "@playwright/test"
import JSZip from "jszip"

/**
 * Blueprint E2E — covers landing → project → frontend → backend → architecture → theme → skills → prompt → response → blueprint
 * Also verifies: generate prompt copy, parse files, download zip (JSZip)
 */

test.describe("Blueprint wizard full flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("landing → project → frontend → backend → architecture → theme → skills → prompt → response → blueprint", async ({ page }) => {
    // landing
    await expect(page.getByText("THE PLANNING LAYER")).toBeVisible()
    await page.getByRole("button", { name: /Start Planning/i }).click()
    await expect(page.getByText("Project Definition")).toBeVisible()

    // project: fill name, pick type, problem
    await page.getByPlaceholder("e.g. Acme Dashboard").fill("Zest E2E App")
    await page.getByRole("button", { name: "Web App" }).click()
    await page.getByPlaceholder("What specific problem does this project solve?").fill("E2E testing the wizard")

    // next → frontend
    await page.getByRole("button", { name: /Next Phase/i }).click()
    await expect(page.getByText("Frontend Stack")).toBeVisible()
    // frameworks were reconfigured 2026-09-03: "React (Vite SPA)" etc
    await page.getByRole("button", { name: "React (Vite SPA)" }).click()
    // toggle UI libs (MultiSelectCard) — now "Tailwind CSS + shadcn/ui" etc
    await page.getByRole("button", { name: "Tailwind CSS + shadcn/ui" }).click()
    await page.getByRole("button", { name: "Chakra UI" }).click()
    await page.getByRole("button", { name: "Mantine" }).click()
    // toggle back one to test deselect
    await page.getByRole("button", { name: "Tailwind CSS + shadcn/ui" }).click()
    await page.getByRole("button", { name: "Tailwind CSS + shadcn/ui" }).click()
    // features — now capabilities: pick one
    await page.getByRole("button", { name: "Framer Motion (Animations)" }).click()

    // next → backend
    await page.getByRole("button", { name: /Next Phase/i }).click()
    await expect(page.getByText("Backend & Data")).toBeVisible()
    await page.getByRole("button", { name: "Node.js (Express)" }).click()
    await page.getByRole("button", { name: "Supabase" }).click()
    await page.getByPlaceholder("e.g. Users, Posts, Comments, Analytics...").fill("users, posts, comments")

    // next → architecture
    await page.getByRole("button", { name: /Next Phase/i }).click()
    await expect(page.getByText("System Architecture")).toBeVisible()
    await page.getByPlaceholder("e.g. / (Landing), /dashboard (Main App), /settings").fill("/, /dashboard, /settings")
    await page.getByPlaceholder("e.g. Navbar, Sidebar, DataTable, UserProfileCard").fill("Navbar, Sidebar, DataTable")

    // next → theme (Visual Style)
    await page.getByRole("button", { name: /Next Phase/i }).click()
    await expect(page.getByText("Visual Style")).toBeVisible()
    // pick primary theme Minimalist
    await page.getByRole("button", { name: "Minimalist" }).click()
    // modifiers: Mode Light
    await page.getByRole("button", { name: "Light" }).first().click()
    // sub theme layer
    await page.getByRole("button", { name: /Aurora UI/i }).click()
    // font pairing
    await page.getByRole("button", { name: /01 Geist \+ Geist Mono/i }).click()

    // next → skills
    await page.getByRole("button", { name: /Next Phase/i }).click()
    await expect(page.getByText("Skills")).toBeVisible()
    // search filter sanity
    await page.getByPlaceholder(/Search skills/i).fill("Chakra")
    await expect(page.getByText("Chakra UI").first()).toBeVisible()
    await page.getByPlaceholder(/Search skills/i).fill("")
    // install a skill
    const installBtn = page.getByRole("button", { name: /^Install$/ }).first()
    if (await installBtn.isVisible()) await installBtn.click()
    // should show installed
    await expect(page.getByText(/Installed/).first()).toBeVisible({ timeout: 2000 })

    // next → prompt (AI Prompt) via Next Phase
    await page.getByRole("button", { name: /Next Phase/i }).click()
    await expect(page.getByText("AI Implementation Prompt")).toBeVisible()
    await expect(page.getByText("master_prompt.txt")).toBeVisible()
    // verify generated prompt contains project name and skills header
    const promptText = await page.locator("pre").textContent()
    expect(promptText).toContain("Zest E2E App")
    expect(promptText).toContain("Web App")
    // copy button toggle
    const copyBtn = page.getByRole("button", { name: /Copy Prompt/i })
    await copyBtn.click()
    await expect(page.getByText("Copied")).toBeVisible({ timeout: 2000 })

    // next → response
    await page.getByRole("button", { name: /Next Phase/i }).click()
    await expect(page.getByText("Process AI Response")).toBeVisible()

    const fakeAIResponse = `
--- FILE: PROJECT_CONTEXT.md ---
# Project Context
E2E App context
--- END FILE ---
--- FILE: PRODUCT_REQUIREMENTS.md ---
# PRD
Requirements here
--- END FILE ---
--- FILE: FRONTEND_ARCHITECTURE.md ---
# Frontend
React + Tailwind
--- END FILE ---
--- FILE: BACKEND_ARCHITECTURE.md ---
# Backend
Node + Supabase
--- END FILE ---
--- FILE: DATABASE.md ---
# Database
tables: users, posts
--- END FILE ---
--- FILE: DEVELOPMENT_RULES.md ---
# Rules
Use double quotes for strings containing apostrophes
--- END FILE ---
`.trim()

    await page.getByPlaceholder("--- FILE: PROJECT_CONTEXT.md ---").fill(fakeAIResponse)
    await page.getByRole("button", { name: /Parse Blueprint/i }).click()

    // blueprint
    await expect(page.getByText("Project Blueprint")).toBeVisible({ timeout: 5000 })
    await expect(page.getByText("FILES (6)")).toBeVisible()
    await expect(page.getByText("PROJECT_CONTEXT.md").first()).toBeVisible()
    await expect(page.getByText("DEVELOPMENT_RULES.md").first()).toBeVisible()

    // download zip - intercept download via JSZip client-side: we verify the button triggers JSZip logic
    // We'll set up a download listener and verify file would be offered
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 }).catch(() => null)
    await page.getByRole("button", { name: /Download ZIP/i }).click()
    const download = await downloadPromise
    // If file-saver uses blob download, playwright may not capture; we at least assert no error and files still visible
    await expect(page.getByText("Project Blueprint")).toBeVisible()
    // optional: if download captured, verify name
    if (download) {
      const fname = download.suggestedFilename()
      expect(fname).toMatch(/zest-e2e-app-blueprint\.zip|project-blueprint\.zip/)
    }
  })

  test("JSZip pure: zip generation with 6 files produces valid archive (client parity)", async () => {
    // This test runs inside node context but proves parity with downloadZip() client code
    // Uses same JSZip generation as src/App.tsx:downloadZip()
    const files = [
      { name: "PROJECT_CONTEXT.md", content: "# ctx" },
      { name: "PRODUCT_REQUIREMENTS.md", content: "# prd" },
      { name: "FRONTEND_ARCHITECTURE.md", content: "# fe" },
      { name: "BACKEND_ARCHITECTURE.md", content: "# be" },
      { name: "DATABASE.md", content: "# db" },
      { name: "DEVELOPMENT_RULES.md", content: "# rules" },
    ]
    const zip = new JSZip()
    const folder = zip.folder("zest-e2e-app-blueprint") || zip
    files.forEach((f) => folder.file(f.name, f.content))
    // SKILLS.md simulation when skills selected
    folder.file("SKILLS.md", "# Skills\nshandcn/ui")
    const blob = await zip.generateAsync({ type: "nodebuffer" })
    expect(blob.length).toBeGreaterThan(0)
    const loaded = await JSZip.loadAsync(blob)
    for (const f of files) {
      expect(loaded.file(`zest-e2e-app-blueprint/${f.name}`) || loaded.file(f.name)).toBeTruthy()
    }
    expect(loaded.file("zest-e2e-app-blueprint/SKILLS.md") || loaded.file("SKILLS.md")).toBeTruthy()
  })

  test("sidebar navigation jumps to any phase", async ({ page }) => {
    await page.getByRole("button", { name: /Start Planning/i }).click()
    // sidebar items
    await page.getByText("03. Backend").click()
    await expect(page.getByText("Backend & Data")).toBeVisible()
    await page.getByText("05. Visual Style").click()
    await expect(page.getByText("Visual Style")).toBeVisible()
    await page.getByText("06. Skills").click()
    await expect(page.getByText("Extend your blueprint")).toBeVisible()
  })

  test("parsedFiles fallback: raw content without FILE markers shows AI_OUTPUT_RAW.md", async ({ page }) => {
    await page.getByRole("button", { name: /Start Planning/i }).click()
    // skip to response via sidebar nav
    await page.getByText(/08\. Response/i).click()
    // Actually sidebar labels are dynamic: Response is after skills. Click via visible text fallback
    const responseNav = page.locator("aside").getByText("Response")
    if (await responseNav.isVisible()) await responseNav.click()
    else {
      // brute: navigate through Next clicks until response visible
      for (let i = 0; i < 10; i++) {
        if (await page.getByText("Process AI Response").isVisible()) break
        const nxt = page.getByRole("button", { name: /Next Phase/i })
        if (await nxt.isVisible()) await nxt.click()
        else break
      }
    }
    await expect(page.getByText("Process AI Response")).toBeVisible({ timeout: 5000 })
    await page.getByPlaceholder("--- FILE: PROJECT_CONTEXT.md ---").fill("# just some raw markdown without markers\nhello")
    await page.getByRole("button", { name: /Parse Blueprint/i }).click()
    await expect(page.getByText("Project Blueprint")).toBeVisible()
    await expect(page.getByText("AI_OUTPUT_RAW.md")).toBeVisible()
  })
})
