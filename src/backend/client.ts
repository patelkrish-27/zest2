// src/backend/client.ts — frontend fetch wrapper with graceful fallback
import type { PartialBlueprintState, SkillDTO, ParsedFile } from "./types"

export interface ArchitecturePlanClient {
  summary: string
  pages: Array<{ route: string; name: string; purpose: string; keyInteractions: string[] }>
  components: Array<{ name: string; purpose: string; usedOn: string[] }>
  architecture: {
    frontendFlow: string[]
    backendModules: string[]
    apiEndpoints: Array<{ method: string; path: string; purpose: string }>
    dataFlow: string[]
    databaseEntities: string[]
    dependencies: string[]
    importantDecisions: string[]
  }
}

const API_BASE =
  (import.meta as unknown as { env: Record<string, string | undefined> }).env.VITE_API_BASE ?? ""

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const backendClient = {
  async health(): Promise<{ status: string; uptime: number; timestamp: string }> {
    return apiFetch("/api/health")
  },

  async generateArchitecturePlanningPrompt(state: PartialBlueprintState): Promise<string> {
    const data = await apiFetch<{ prompt: string }>("/api/generate-architecture-prompt", {
      method: "POST",
      body: JSON.stringify({ state }),
    })
    return data.prompt
  },

  async parseArchitecturePlan(response: string): Promise<ArchitecturePlanClient> {
    const data = await apiFetch<{ plan: ArchitecturePlanClient }>("/api/parse-architecture-plan", {
      method: "POST",
      body: JSON.stringify({ response }),
    })
    return data.plan
  },

  async generatePrompt(state: PartialBlueprintState, config?: { customSections?: { id: string; title: string }[]; skillsCatalog?: SkillDTO[] }): Promise<string> {
    const data = await apiFetch<{ prompt: string }>("/api/generate-prompt", {
      method: "POST",
      body: JSON.stringify({ state, config }),
    })
    return data.prompt
  },

  async parseResponse(aiResponse: string): Promise<ParsedFile[]> {
    const data = await apiFetch<{ files: ParsedFile[] }>("/api/parse-response", {
      method: "POST",
      body: JSON.stringify({ aiResponse }),
    })
    return data.files
  },

  async generatePromptWithFallback(state: PartialBlueprintState, fallback: () => string, config?: { customSections?: { id: string; title: string }[]; skillsCatalog?: SkillDTO[] }): Promise<{ prompt: string; source: "backend" | "fallback"; error?: string }> {
    try {
      const prompt = await this.generatePrompt(state, config)
      return { prompt, source: "backend" }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.warn("[backendClient] backend unavailable, using fallback:", msg)
      return { prompt: fallback(), source: "fallback", error: msg }
    }
  },

  async parseResponseWithFallback(aiResponse: string, fallback: () => ParsedFile[]): Promise<{ files: ParsedFile[]; source: "backend" | "fallback"; error?: string }> {
    try {
      const files = await this.parseResponse(aiResponse)
      return { files, source: "backend" }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.warn("[backendClient] parse fallback:", msg)
      return { files: fallback(), source: "fallback", error: msg }
    }
  },
}
