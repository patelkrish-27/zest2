export interface CustomPage {
  id: string
  title: string
}

export interface CustomSection {
  id: string
  pageId: string
  title: string
  description: string
  options: string[]
  isMulti: boolean
}

export interface Skill {
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

export interface AppConfig {
  projectTypes: string[]
  frontendFrameworks: string[]
  uiLibraries: string[]
  features: string[]
  backendFrameworks: string[]
  databases: string[]
  customPages: CustomPage[]
  customSections: CustomSection[]
  skillsCatalog: Skill[]
}

export interface AppState {
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

export interface Theme {
  id: string
  name: string
  feel: string
  traits: string
  accent: string
}

export interface ModifierGroup {
  id: string
  label: string
  icon: string
  options: { value: string; label: string }[]
}

export interface SubTheme {
  id: string
  label: string
  desc: string
}

export interface Font {
  id: string
  name: string
  vibe: string
  bestFor: string
  category: string
  fallback: string
}

export interface FontPairing {
  id: string
  label: string
  heading: string
  body: string
  mono: string
  vibe: string
}
