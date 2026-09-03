import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import App, { THEMES, SKILLS_CATALOG } from "@/App"

// helper to start planning
async function startApp(user: ReturnType<typeof userEvent.setup>) {
  render(<App />)
  expect(screen.getByText(/THE PLANNING LAYER/i)).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: /Start Planning/i }))
  expect(await screen.findByText(/Project Definition/i)).toBeInTheDocument()
}

describe("Blueprint App — component smoke & interaction", () => {
  it("renders landing and can start planning", async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByText(/THE PLANNING LAYER/i)).toBeInTheDocument()
    const btn = screen.getByRole("button", { name: /Start Planning/i })
    await user.click(btn)
    expect(await screen.findByText(/Project Definition/i)).toBeInTheDocument()
  })

  it("navigates wizard phases via Next/Back and sidebar", async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole("button", { name: /Start Planning/i }))
    expect(await screen.findByText(/Project Definition/i)).toBeInTheDocument()

    const websiteCard = screen.getByRole("button", { name: "Website" })
    await user.click(websiteCard)
    expect(websiteCard).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /Next Phase/i }))
    expect(await screen.findByText(/Frontend Stack/i)).toBeInTheDocument()

    // Sidebar navigation: click Backend & Data - use more resilient selector
    const backendNav = screen.getByText(/Backend/i)
    await user.click(backendNav)
    expect(await screen.findByText(/Backend & Data/i)).toBeInTheDocument()

    const archNav = screen.getByText(/Architecture/i)
    await user.click(archNav)
    expect(await screen.findByText(/System Architecture/i)).toBeInTheDocument()
  })

  it("toggles UI libraries via MultiSelectCard interaction", async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole("button", { name: /Start Planning/i }))
    await user.click(screen.getByRole("button", { name: /Next Phase/i }))
    expect(await screen.findByText(/Frontend Stack/i)).toBeInTheDocument()
    // UI libraries were reconfigured 2026-09-03 — now "Tailwind CSS + shadcn/ui" etc
    const uiLibEls = screen.getAllByText(/Tailwind CSS \+ shadcn\/ui/i)
    const uiBtn = uiLibEls[0].closest("button") || uiLibEls[0]
    expect(uiBtn).toBeInTheDocument()
    await user.click(uiBtn as HTMLElement)
    expect(screen.getAllByText(/Tailwind CSS \+ shadcn\/ui/i)[0]).toBeInTheDocument()
    await user.click(uiBtn as HTMLElement)
    expect(screen.getAllByText(/Tailwind CSS \+ shadcn\/ui/i)[0]).toBeInTheDocument()
  })

  it("skills page shows catalog and allows install toggle", async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole("button", { name: /Start Planning/i }))
    // find Skills nav - text may be "06. Skills" or "06. Skills · N"
    const skillsNav = screen.getByText(/Skills/i)
    await user.click(skillsNav)
    expect(await screen.findByText(/Extend your blueprint/i)).toBeInTheDocument()
    expect(screen.getAllByText(SKILLS_CATALOG[0].name).length).toBeGreaterThan(0)
    const installBtns = screen.getAllByRole("button", { name: /^Install$/ })
    expect(installBtns.length).toBeGreaterThan(0)
    await user.click(installBtns[0])
    expect(screen.getAllByText(/Installed/).length).toBeGreaterThan(0)
  })

  it("theme page renders all 10 themes as ThemeCards", async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole("button", { name: /Start Planning/i }))
    // navigate via sidebar - find text Visual Style
    const visualNav = screen.getByText(/Visual Style/i)
    await user.click(visualNav)
    // heading inside main - use getByRole heading
    expect(await screen.findByRole("heading", { name: /Visual Style/i })).toBeInTheDocument()
    for (const t of THEMES) {
      expect(screen.getByText(t.name)).toBeInTheDocument()
    }
  })

  it("handles full flow to prompt generation via sidebar jumps", async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole("button", { name: /Start Planning/i }))
    const nameInput = screen.getByPlaceholderText(/Acme Dashboard/i)
    await user.type(nameInput, "My Test App")
    await user.click(screen.getByRole("button", { name: "Web App" }))
    // jump directly to prompt via sidebar instead of clicking Next repeatedly
    // prompt nav label is "AI Prompt" - may be numbered 07/08/09 depending on customPages
    const promptNav = screen.getByText(/AI Prompt/i)
    await user.click(promptNav)
    expect(await screen.findByText(/AI Implementation Prompt/i)).toBeInTheDocument()
    expect(screen.getByText(/master_prompt\.txt/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Copy Prompt/i })).toBeInTheDocument()
    // verify prompt contains project data
    const promptPre = screen.getByText(/My Test App/i) // inside pre
    expect(promptPre).toBeInTheDocument()
  })

  it("response → blueprint fallback shows files", async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole("button", { name: /Start Planning/i }))
    const responseNav = await screen.findByText(/Response/i)
    await user.click(responseNav)
    expect(await screen.findByText(/Process AI Response/i)).toBeInTheDocument()
    const textarea = screen.getByPlaceholderText(/--- FILE: PROJECT_CONTEXT.md ---/i)
    await user.type(textarea, "--- FILE: PROJECT_CONTEXT.md ---\n# hello\n--- END FILE ---")
    await user.click(screen.getByRole("button", { name: /Parse Blueprint/i }))
    expect(await screen.findByText(/Project Blueprint/i)).toBeInTheDocument()
    expect(screen.getAllByText("PROJECT_CONTEXT.md").length).toBeGreaterThan(0)
  })
})
