// src/backend/services/blueprintService.ts — service layer per backend-patterns
// Wraps repository + promptService; holds business logic, validation, and orchestration.
// No N+1, no direct DB in controllers, thin controllers delegate here.
import type { PartialBlueprintState, SkillDTO, ParsedFile } from "../types"
import type { BlueprintRecord, BlueprintRepository, BlueprintFilters, PaginatedResult } from "../repositories/blueprintRepository"
import { promptService } from "./promptService"
import { AppError } from "../middleware/errorHandler"
import { SKILLS_CATALOG } from "../../lib/skillsCatalog"

export interface GeneratePromptInput {
  state: PartialBlueprintState
  config?: { customSections?: { id: string; title: string }[]; skillsCatalog?: SkillDTO[] }
}

export interface ValidateResult {
  valid: boolean
  issues: Array<{ path: string; message: string; severity: "error" | "warning" }>
  summary: string
}

export class BlueprintService {
  constructor(
    private readonly repo: BlueprintRepository,
    private readonly prompts = promptService
  ) {}

  // ── Prompt ──
  buildPrompt(input: GeneratePromptInput): string {
    return this.prompts.buildPrompt(input.state, input.config?.customSections ?? [], input.config?.skillsCatalog ?? [])
  }

  parseResponse(aiResponse: string): ParsedFile[] {
    return this.prompts.parseResponse(aiResponse)
  }

  buildSkillsGuide(skills: SkillDTO[], projectName: string): string {
    return this.prompts.buildSkillsGuide(skills, projectName)
  }

  // ── Persistence ──
  async saveBlueprint(input: GeneratePromptInput & { prompt: string; parsedFiles?: ParsedFile[] }): Promise<BlueprintRecord> {
    // Transaction-like pattern: save is atomic; if parse fails we still save prompt
    return this.repo.save({
      state: input.state,
      prompt: input.prompt,
      parsedFiles: input.parsedFiles,
    })
  }

  async getBlueprint(id: string): Promise<BlueprintRecord> {
    const row = await this.repo.findById(id)
    if (!row) throw new AppError(404, `Blueprint ${id} not found`, "NOT_FOUND")
    return row
  }

  async listBlueprints(filters?: BlueprintFilters): Promise<PaginatedResult<BlueprintRecord>> {
    // Select only needed fields: callers can project `items` if needed; repo already paginated
    return this.repo.findAll(filters)
  }

  async deleteBlueprint(id: string): Promise<void> {
    const exists = await this.repo.findById(id)
    if (!exists) throw new AppError(404, `Blueprint ${id} not found`, "NOT_FOUND")
    await this.repo.delete(id)
  }

  // ── Validation (POST /api/validate) ──
  validateState(state: PartialBlueprintState): ValidateResult {
    const issues: ValidateResult["issues"] = []

    if (!state.projectName?.trim()) issues.push({ path: "projectName", message: "Project name is required", severity: "warning" })
    if (!state.projectType) issues.push({ path: "projectType", message: "Project type not selected", severity: "warning" })
    if (!state.frontendFramework) issues.push({ path: "frontendFramework", message: "Frontend framework not selected", severity: "warning" })
    if (!state.backendFramework) issues.push({ path: "backendFramework", message: "Backend framework not selected", severity: "warning" })
    if (!state.database) issues.push({ path: "database", message: "Database not selected", severity: "warning" })
    if (!state.theme) issues.push({ path: "theme", message: "Theme not selected", severity: "warning" })

    // completeness score
    const required = ["projectName", "projectType", "frontendFramework", "backendFramework", "database", "theme", "fontPairing"]
    const filled = required.filter((k) => {
      const v = (state as Record<string, unknown>)[k]
      return typeof v === "string" ? v.trim().length > 0 : Array.isArray(v) ? v.length > 0 : !!v
    }).length
    const completeness = Math.round((filled / required.length) * 100)

    const valid = issues.filter((i) => i.severity === "error").length === 0
    const summary = valid
      ? `Blueprint ${completeness}% complete — ${issues.length} warning(s)`
      : `Invalid — ${issues.length} issue(s)`

    return { valid, issues, summary }
  }

  // ── Skills catalog passthrough ──
  getSkillsCatalog(): SkillDTO[] {
    // Authoritative source: src/lib/skillsCatalog.ts (15 items, no React).
    // Imported by both App.tsx (re-export) and this service.
    return SKILLS_CATALOG as unknown as SkillDTO[]
  }
}

// Singleton — routes import this; swap repo for testing via new BlueprintService(otherRepo)
import { blueprintRepo } from "../repositories/blueprintRepository"
export const blueprintService = new BlueprintService(blueprintRepo)
