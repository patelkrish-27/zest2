// src/backend/types.ts — shared domain types
export interface BlueprintState {
  projectName: string
  projectType: string
  problemStatement: string
  frontendFramework: string
  uiLibraries: string[]
  features: string[]
  backendFramework: string
  database: string
  dbTables: string
  pages: string
  components: string
  theme: string
  themeModifiers: Record<string, string>
  themeExtras: string[]
  fontHeading: string
  fontBody: string
  fontMono: string
  fontPairing: string
  aiResponse: string
  customAnswers: Record<string, string | string[]>
  selectedSkills: string[]
}

export type PartialBlueprintState = Partial<BlueprintState>

export interface GeneratePromptRequest {
  state: PartialBlueprintState
  config?: {
    customPages?: { id: string; title: string }[]
    customSections?: { id: string; pageId: string; title: string; description: string; options: string[]; isMulti: boolean }[]
    skillsCatalog?: SkillDTO[]
  }
}

export interface ArchitecturePlanRequest {
  state: PartialBlueprintState
}

export interface SkillDTO {
  id: string
  name: string
  description: string
  category: string
  docsUrl: string
  source: string
  rawUrl: string
  package: string
  installCmd: string
  concepts: string
  highlights: string[]
}

export interface ParseResponseRequest {
  aiResponse: string
}

export interface ParsedFile {
  name: string
  content: string
}
