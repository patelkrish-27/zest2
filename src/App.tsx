import React, { useState, useEffect } from "react"
import {
  ChevronRight,
  ChevronLeft,
  Terminal,
  Copy,
  Check,
  Download,
  Layout,
  Database,
  Cpu,
  FileCode,
  ArrowRight,
  Settings,
  Lock,
  Trash2,
  Plus,
  LayoutTemplate,
  Palette,
  Sparkles,
  Layers,
  Wand2,
  Type,
  ALargeSmall,
  Puzzle,
  Boxes,
  BookOpen,
  Package,
  ExternalLink,
  Search,
  X,
  Moon,
  Sun,
} from "lucide-react"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { backendClient } from "@/backend/client"
import { Badge } from "@/components/ui/badge"
import { SelectCard, MultiSelectCard } from "@/components/ui/select-card"
import { ThemeCard } from "@/components/ui/theme-card"
import { Separator } from "@/components/ui/separator"

// --- Types ---
type Phase = string // Expanded to string to support dynamic custom pages

interface CustomPage {
  id: string
  title: string
}

interface CustomSection {
  id: string
  pageId: string
  title: string
  description: string
  options: string[]
  isMulti: boolean
}

interface Skill {
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

interface AppConfig {
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

interface AppState {
  projectName: string
  projectType: string
  problemStatement: string

  // Frontend
  frontendFramework: string
  uiLibraries: string[]
  features: string[]

  // Backend
  backendFramework: string
  database: string
  dbTables: string

  // Architecture
  pages: string
  components: string

  // Theme & Style Selector
  theme: string
  themeModifiers: Record<string, string>
  themeExtras: string[]

  // Typography / Fonts
  fontHeading: string
  fontBody: string
  fontMono: string
  fontPairing: string

  // AI Response
  aiResponse: string

  // Dynamic Answers
  customAnswers: Record<string, string | string[]>

  // Skills
  selectedSkills: string[]
}

// --- Skills Catalog (project skills – corresponds to /skills/*) ---
export const SKILLS_CATALOG: Skill[] = [
  {
    id: "chakra-ui",
    name: "Chakra UI",
    description: "Accessible, modern and easy to style UI components.",
    category: "UI Library",
    docsUrl: "docs/components/concepts/overview",
    source: "apps/www/content/docs/components/concepts/overview.mdx",
    rawUrl:
      "https://raw.githubusercontent.com/chakra-ui/chakra-ui/refs/heads/main/apps/www/content/docs/components/concepts/overview.mdx",
    package: "@chakra-ui/react",
    installCmd:
      "npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills",
    concepts: "Components > Concepts > Components",
    highlights: [
      "ComponentGrid catalogue — full primitives list",
      "Accessible by default (ARIA, focus, keyboard)",
      "Style props + recipes/slotRecipes theming",
      "Composable primitives (Box, Flex, Grid, Stack)",
      "npx skills: chakra-ui-builder · chakra-ui-migrate · chakra-ui-refactor",
    ],
  },
  {
    id: "chakra-ui-builder",
    name: "Chakra UI — Builder",
    description:
      "Generate new Chakra UI components and layouts with best-practice patterns.",
    category: "UI Library",
    docsUrl: "docs/components/concepts/overview",
    source: "skills/chakra-ui-builder/SKILL.md",
    rawUrl:
      "https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder",
    package: "@chakra-ui/react",
    installCmd:
      "npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder",
    concepts: "Builder · Components",
    highlights: ["Scaffold components", "Layout recipes", "Theming tokens"],
  },
  {
    id: "chakra-ui-migrate",
    name: "Chakra UI — Migrate",
    description: "Migrate existing UI code to Chakra UI v3 idioms and props.",
    category: "UI Library",
    docsUrl: "docs/components/concepts/overview",
    source: "skills/chakra-ui-migrate/SKILL.md",
    rawUrl:
      "https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-migrate",
    package: "@chakra-ui/react",
    installCmd:
      "npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-migrate",
    concepts: "Migrate · Codemod",
    highlights: ["v2 → v3 migration", "Prop mapping", "Codemod guidance"],
  },
  {
    id: "chakra-ui-refactor",
    name: "Chakra UI — Refactor",
    description:
      "Refactor and clean up Chakra UI code — DRY up style props, recipes and composition.",
    category: "UI Library",
    docsUrl: "docs/components/concepts/overview",
    source: "skills/chakra-ui-refactor/SKILL.md",
    rawUrl:
      "https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-refactor",
    package: "@chakra-ui/react",
    installCmd:
      "npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-refactor",
    concepts: "Refactor · Best practices",
    highlights: ["Prop hygiene", "Slot recipes", "Composition cleanup"],
  },
  {
    id: "shadcn-ui",
    name: "shadcn/ui",
    description:
      "Accessible, composable React components built on Radix UI + Tailwind CSS.",
    category: "UI Library",
    docsUrl: "ui.shadcn.com/docs/components",
    source: "skills/shadcn-ui/SKILL.md",
    rawUrl: "https://github.com/shadcn-ui/ui",
    package: "shadcn/ui",
    installCmd: "pnpm dlx skills add shadcn/ui",
    concepts: "Components · Radix · Tailwind",
    highlights: [
      "Copy-paste primitives",
      "Radix + Tailwind",
      "CSS variables theming",
      "pnpm dlx skills add shadcn/ui",
    ],
  },
  {
    id: "aceternity-ui",
    name: "Aceternity UI",
    description:
      "Animated, modern React + Tailwind + Framer Motion components.",
    category: "UI Library",
    docsUrl: "ui.aceternity.com/components",
    source: "skills/aceternity-ui/SKILL.md",
    rawUrl: "https://github.com/secondsky/claude-skills",
    package: "aceternity-ui",
    installCmd:
      "npx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui",
    concepts: "Motion · Effects · Framer",
    highlights: [
      "Spotlight & Beams",
      "3D Card & Bento",
      "Framer Motion + Tailwind",
      "npx skills --skill aceternity-ui",
    ],
  },
  {
    id: "ui-skills-root",
    name: "UI Skills — Root (ibelick)",
    description:
      "Overall meta UI skill aggregating modern copy-paste React + Tailwind patterns.",
    category: "UI Library",
    docsUrl: "github.com/ibelick/ui-skills",
    source: "skills/ui-skills-root/SKILL.md",
    rawUrl: "https://github.com/ibelick/ui-skills",
    package: "ui-skills",
    installCmd:
      "npx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root",
    concepts: "Meta · Components · Tailwind",
    highlights: [
      "Overall UI baseline",
      "Copy-paste + cn + CSS vars",
      "Composes with shadcn/Chakra/Aceternity",
      "npx skills --skill ui-skills-root",
    ],
  },
  {
    id: "watermelon-ui",
    name: "Watermelon UI — Make Interfaces Feel Better",
    description:
      "Micro-interactions, skeletons, optimistic UI and feel-better UX polish.",
    category: "UI Library",
    docsUrl:
      "github.com/WatermelonCorp/watermelon-platform/tree/main/skills/make-interfaces-feel-better",
    source: "skills/watermelon-ui/SKILL.md",
    rawUrl: "https://github.com/WatermelonCorp/watermelon-platform",
    package: "watermelon-ui",
    installCmd:
      "npx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better",
    concepts: "Polish · Motion · Skeletons",
    highlights: [
      "Optimistic UI & skeletons",
      "Empty states & micro-copy",
      "150-250ms feel polish",
      "npx skills --skill make-interfaces-feel-better",
    ],
  },
  {
    id: "supabase",
    name: "Supabase — Agent Skills",
    description:
      "Supabase Postgres/Auth/Storage/Realtime/Edge Functions skills for correct, secure usage.",
    category: "Backend",
    docsUrl: "supabase.com/docs/guides/getting-started/ai-skills",
    source: "skills/supabase/SKILL.md",
    rawUrl: "https://github.com/supabase/agent-skills",
    package: "supabase",
    installCmd: "npx skills add supabase/agent-skills",
    concepts: "Postgres · Auth · RLS · Storage",
    highlights: [
      "RLS & migrations",
      "supabase-js / ssr helpers",
      "Auth + Storage + Realtime",
      "npx skills add supabase/agent-skills",
    ],
  },
  {
    id: "frontend-patterns",
    name: "Frontend Patterns (React/Next)",
    description:
      "React, Next.js, state, perf, forms, a11y — composition, hooks, memo, virtualization. Best-practice patterns.",
    category: "Frontend",
    docsUrl:
      "skillsmp.com/creators/affaan-m/ecc/agents-skills-frontend-patterns",
    source: "skills/frontend-patterns/SKILL.md",
    rawUrl:
      "https://github.com/affaan-m/ECC/tree/main/.agents/skills/frontend-patterns",
    package: "frontend-patterns",
    installCmd:
      "npx skills add https://github.com/affaan-m/ECC --skill frontend-patterns",
    concepts: "React · Next.js · Hooks · Perf",
    highlights: [
      "Composition & compound components",
      "useQuery/useDebounce hooks",
      "Memo/virtualization/code-split",
      "npx skills --skill frontend-patterns",
    ],
  },
  {
    id: "backend-patterns",
    name: "Backend Patterns (Node/Express)",
    description:
      "API design, repository/service layers, DB optimization, caching, auth, rate-limit, queues and logging.",
    category: "Backend",
    docsUrl:
      "skillsmp.com/creators/affaan-m/ecc/agents-skills-backend-patterns",
    source: "skills/backend-patterns/SKILL.md",
    rawUrl:
      "https://github.com/affaan-m/ECC/tree/main/.agents/skills/backend-patterns",
    package: "backend-patterns",
    installCmd:
      "npx skills add https://github.com/affaan-m/ECC --skill backend-patterns",
    concepts: "API · DB · Cache · Auth",
    highlights: [
      "REST + repository/service",
      "N+1 & query opt + transactions",
      "Redis cache-aside & rate-limit",
      "npx skills --skill backend-patterns",
    ],
  },
  {
    id: "ui-styling",
    name: "UI Styling (ui-ux-pro-max)",
    description:
      "shadcn/ui + Tailwind + canvas — components, theming, responsive, a11y, visual design. 98 files incl. scripts & references.",
    category: "Frontend",
    docsUrl:
      "skillsmp.com/creators/nextlevelbuilder/ui-ux-pro-max-skill/claude-skills-ui-styling",
    source: "skills/ui-styling/SKILL.md",
    rawUrl:
      "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/ui-styling",
    package: "ui-styling",
    installCmd:
      "npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-styling",
    concepts: "shadcn · Tailwind · Canvas",
    highlights: [
      "shadcn + Tailwind + Radix",
      "7 references + 2 python scripts + 64 fonts",
      "Responsive & dark mode & a11y",
      "npx skills --skill ui-styling",
    ],
  },
  {
    id: "drawio-skill",
    name: "Draw.io — Architecture Studio",
    description:
      "Editable .drawio diagrams — IR build/sync, 31 importers, exports PNG/SVG/PDF, validation. 75 files.",
    category: "Design",
    docsUrl:
      "skillsmp.com/creators/agents365-ai/drawio-skill/skills-drawio-skill",
    source: "skills/drawio-skill/SKILL.md",
    rawUrl:
      "https://github.com/Agents365-ai/drawio-skill/tree/main/skills/drawio-skill",
    package: "drawio-skill",
    installCmd:
      "npx skills add https://github.com/Agents365-ai/drawio-skill --skill drawio-skill",
    concepts: "Diagram · IR · Autolayout",
    highlights: [
      "diagramctl build/sync/views/test",
      "41 scripts + 20 refs + 5 styles",
      "draw.io CLI + Graphviz dot",
      "npx skills --skill drawio-skill",
    ],
  },
  {
    id: "autoreview",
    name: "Autoreview — Structured Code Review",
    description:
      "Codex/Claude/Amp/Pi/Kimi review helper with TruffleHog secret scan, P0/P3 triage. Use when explicitly requested.",
    category: "Testing",
    docsUrl: "skillsmp.com/creators/openclaw/openclaw/agents-skills-autoreview",
    source: "skills/autoreview/SKILL.md",
    rawUrl:
      "https://github.com/openclaw/openclaw/tree/main/.agents/skills/autoreview",
    package: "autoreview",
    installCmd:
      "npx skills add https://github.com/openclaw/openclaw --skill autoreview",
    concepts: "Review · TruffleHog · Isolation",
    highlights: [
      "Codex gpt-5.6-sol high + fallback",
      "TruffleHog secret scan",
      "P0 only default triage",
      "npx skills --skill autoreview",
    ],
  },
  {
    id: "agent-orchestrator-task",
    name: "Agent Orchestrator — Task",
    description:
      "Central task decomposition, parallel/sequential planning, dependency & progress tracking. Invoke $agent-orchestrator-task.",
    category: "Orchestration",
    docsUrl:
      "skillsmp.com/creators/ruvnet/ruflo/agents-skills-agent-orchestrator-task",
    source: "skills/agent-orchestrator-task/SKILL.md",
    rawUrl:
      "https://github.com/ruvnet/ruflo/tree/main/.agents/skills/agent-orchestrator-task",
    package: "agent-orchestrator-task",
    installCmd:
      "npx skills add https://github.com/ruvnet/ruflo --skill agent-orchestrator-task",
    concepts: "Orchestration · Decomposition · Synthesis",
    highlights: [
      "Task decomposition & dependency graph",
      "Parallel/sequential/adaptive strategy",
      "TodoWrite progress + memory_store",
      "npx skills --skill agent-orchestrator-task",
    ],
  },
]

const INITIAL_CONFIG: AppConfig = {
  projectTypes: ["Website", "Web App", "Mobile App", "Desktop", "API", "Other"],
  // Reconfigured 2026-09-03: frameworks are now mutually-comparable entry points (pick ONE primary),
  // UI systems are mutually-comparable design systems (all Tailwind-compatible where relevant),
  // features are app capabilities at the same abstraction level (not micro-widgets).
  frontendFrameworks: [
    "React (Vite SPA)",
    "Next.js (App Router)",
    "Vue 3 (Vite)",
    "Nuxt 3 (SSR)",
    "SvelteKit",
    "Astro (Islands)",
  ],
  uiLibraries: [
    "Tailwind CSS + shadcn/ui",
    "Chakra UI",
    "Mantine",
    "Material UI (MUI)",
    "Ant Design",
    "Radix UI + Tailwind",
    "DaisyUI",
    "Bootstrap",
  ],
  features: [
    "TanStack Query (Server State)",
    "Zustand / Redux (Client State)",
    "React Hook Form + Zod (Forms)",
    "Auth & Protected Routes",
    "Framer Motion (Animations)",
    "Recharts / Data Viz (Charts)",
    "TanStack Table (Data Grid)",
    "Realtime / WebSocket Layer",
  ],
  backendFrameworks: [
    "Node.js (Express)",
    "NestJS",
    "Python (FastAPI)",
    "Go (FastAPI)",
    "Ruby",
    "Serverless/Edge",
  ],
  databases: [
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Supabase",
    "Firebase",
    "Redis",
  ],
  customPages: [],
  customSections: [],
  skillsCatalog: SKILLS_CATALOG,
}

// --- Theme System Data (10 major styles + modifiers + sub-layers) ---
export const THEMES: {
  id: string
  name: string
  feel: string
  traits: string
  accent: string
}[] = [
  {
    id: "minimalist",
    name: "Minimalist",
    feel: "Clean, premium, calm",
    traits: "Whitespaces · simple typography · restrained colors",
    accent: "from-zinc-100 to-zinc-300",
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    feel: "Futuristic, premium",
    traits: "Frosted glass · transparency · blur · glow",
    accent: "from-cyan-400/40 via-white/20 to-indigo-500/40",
  },
  {
    id: "bento",
    name: "Bento Grid",
    feel: "Modern, organized",
    traits: "Modular cards · asymmetric grids · rounded",
    accent: "from-neutral-800 to-neutral-600",
  },
  {
    id: "neo-brutalism",
    name: "Neo-Brutalism",
    feel: "Bold, edgy, distinctive",
    traits: "Thick borders · hard shadows · huge type · bright",
    accent: "from-yellow-400 to-orange-500",
  },
  {
    id: "editorial",
    name: "Editorial / Magazine",
    feel: "Sophisticated, artistic",
    traits: "Large typography · columns · asymmetry · imagery",
    accent: "from-stone-200 to-stone-400",
  },
  {
    id: "swiss",
    name: "Swiss / International",
    feel: "Precise, professional",
    traits: "Grid systems · typography-focused · alignment",
    accent: "from-red-500 to-red-700",
  },
  {
    id: "neumorphism",
    name: "Neumorphism",
    feel: "Soft, tactile",
    traits: "Soft shadows · raised/inset · monochrome surfaces",
    accent: "from-zinc-200 to-zinc-400",
  },
  {
    id: "retro-y2k",
    name: "Retro / Y2K",
    feel: "Nostalgic, playful",
    traits: "Chrome · gradients · neon · pixel · 90s/00s",
    accent: "from-fuchsia-400 via-cyan-400 to-lime-300",
  },
  {
    id: "3d-immersive",
    name: "3D / Immersive",
    feel: "Cinematic, futuristic",
    traits: "3D objects · depth · WebGL-style · spatial",
    accent: "from-violet-600 via-indigo-600 to-cyan-500",
  },
  {
    id: "maximalist",
    name: "Maximalist",
    feel: "Energetic, expressive",
    traits: "Dense layouts · bold colors · layered · mixed type",
    accent: "from-pink-500 via-orange-400 to-yellow-400",
  },
]

export const MODIFIER_GROUPS: {
  id: string
  label: string
  icon: string
  options: { value: string; label: string }[]
}[] = [
  {
    id: "mode",
    label: "Mode",
    icon: "◐",
    options: [
      { value: "dark", label: "Dark" },
      { value: "light", label: "Light" },
      { value: "auto", label: "Auto" },
    ],
  },
  {
    id: "palette",
    label: "Palette",
    icon: "◈",
    options: [
      { value: "monochrome", label: "Monochrome" },
      { value: "colorful", label: "Colorful" },
      { value: "muted", label: "Muted" },
    ],
  },
  {
    id: "motion",
    label: "Motion",
    icon: "◎",
    options: [
      { value: "static", label: "Static" },
      { value: "subtle", label: "Subtle Motion" },
      { value: "kinetic", label: "Kinetic" },
    ],
  },
  {
    id: "depth",
    label: "Depth",
    icon: "▣",
    options: [
      { value: "flat", label: "Flat" },
      { value: "elevated", label: "Elevated" },
      { value: "3d", label: "3D" },
    ],
  },
  {
    id: "density",
    label: "Expression",
    icon: "⬢",
    options: [
      { value: "subtle", label: "Subtle" },
      { value: "balanced", label: "Balanced" },
      { value: "expressive", label: "Expressive" },
    ],
  },
]

export const SUB_THEMES: { id: string; label: string; desc: string }[] = [
  { id: "aurora", label: "Aurora UI", desc: "blurred gradient blobs + glow" },
  {
    id: "liquid-glass",
    label: "Liquid Glass",
    desc: "fluid translucent depth",
  },
  {
    id: "claymorphism",
    label: "Claymorphism",
    desc: "soft 3D clay-like rounded",
  },
  { id: "skeuomorphism", label: "Skeuomorphism", desc: "real-world materials" },
  { id: "flat", label: "Flat Design", desc: "simple shapes, minimal depth" },
  { id: "cyberpunk", label: "Cyberpunk", desc: "neon, dark HUD, futuristic" },
  {
    id: "kinetic-type",
    label: "Kinetic Typography",
    desc: "type as animation",
  },
  { id: "organic", label: "Organic / Nature", desc: "earthy, organic shapes" },
  { id: "hand-drawn", label: "Hand-drawn", desc: "doodles, imperfect human" },
  {
    id: "dark-luxury",
    label: "Dark Luxury",
    desc: "black, elegant, metallic glow",
  },
]

// --- Typography / Font System (20 ranked fonts + 10 pairings) ---
export const FONTS: {
  id: string
  name: string
  vibe: string
  bestFor: string
  category: string
  fallback: string
}[] = [
  {
    id: "inter",
    name: "Inter",
    vibe: "Clean, professional, polished",
    bestFor: "SaaS, apps, tech",
    category: "Tech / SaaS",
    fallback: "Inter, sans-serif",
  },
  {
    id: "geist",
    name: "Geist",
    vibe: "Modern, technical, futuristic",
    bestFor: "AI, dev tools, startups",
    category: "Tech / AI",
    fallback: "Geist, Inter, sans-serif",
  },
  {
    id: "neue-montreal",
    name: "Neue Montreal",
    vibe: "Designer, premium, editorial",
    bestFor: "Agencies, portfolios, luxury",
    category: "Premium",
    fallback: "'Geologica', Inter, sans-serif",
  },
  {
    id: "suisse",
    name: "Suisse Intl",
    vibe: "Swiss, sophisticated, precise",
    bestFor: "Premium products, corporate",
    category: "Premium",
    fallback: "'Sora', Inter, sans-serif",
  },
  {
    id: "satoshi",
    name: "Satoshi",
    vibe: "Modern, geometric, friendly",
    bestFor: "Startups, portfolios, SaaS",
    category: "Creative",
    fallback: "'Outfit', Inter, sans-serif",
  },
  {
    id: "aeonik",
    name: "Aeonik",
    vibe: "Bold, contemporary, premium",
    bestFor: "Branding, landing pages",
    category: "Premium",
    fallback: "'Geologica', sans-serif",
  },
  {
    id: "gt-america",
    name: "GT America",
    vibe: "Strong, modern, editorial",
    bestFor: "High-end brands",
    category: "Editorial",
    fallback: "'Instrument Sans', sans-serif",
  },
  {
    id: "helvetica-now",
    name: "Helvetica Now",
    vibe: "Classic, clean, iconic",
    bestFor: "Brand/design-heavy sites",
    category: "Premium",
    fallback: "Helvetica, Arial, sans-serif",
  },
  {
    id: "manrope",
    name: "Manrope",
    vibe: "Soft, modern, approachable",
    bestFor: "SaaS, fintech, apps",
    category: "Tech / SaaS",
    fallback: "Manrope, sans-serif",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    vibe: "Techy, distinctive",
    bestFor: "AI, Web3, creative tech",
    category: "Tech / AI",
    fallback: "'Space Grotesk', sans-serif",
  },
  {
    id: "instrument-sans",
    name: "Instrument Sans",
    vibe: "Minimal, elegant",
    bestFor: "Modern SaaS/portfolio",
    category: "Creative",
    fallback: "'Instrument Sans', sans-serif",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    vibe: "Friendly, clean",
    bestFor: "Product websites",
    category: "SaaS",
    fallback: "'DM Sans', sans-serif",
  },
  {
    id: "plus-jakarta",
    name: "Plus Jakarta Sans",
    vibe: "Smooth, slightly warm",
    bestFor: "Startup/marketing",
    category: "SaaS",
    fallback: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: "switzer",
    name: "Switzer",
    vibe: "Neutral, Swiss-inspired",
    bestFor: "Minimalist design",
    category: "Minimal",
    fallback: "Inter, sans-serif",
  },
  {
    id: "ibm-plex",
    name: "IBM Plex Sans",
    vibe: "Technical, structured",
    bestFor: "Developer products",
    category: "Tech / AI",
    fallback: "'IBM Plex Sans', sans-serif",
  },
  {
    id: "graphik",
    name: "Graphik",
    vibe: "Corporate-premium",
    bestFor: "High-end brands",
    category: "Premium",
    fallback: "Inter, sans-serif",
  },
  {
    id: "roobert",
    name: "Roobert",
    vibe: "Modern, clean, slightly human",
    bestFor: "SaaS/creative",
    category: "Creative",
    fallback: "Inter, sans-serif",
  },
  {
    id: "general-sans",
    name: "General Sans",
    vibe: "Contemporary, versatile",
    bestFor: "Agencies/startups",
    category: "Creative",
    fallback: "'Outfit', sans-serif",
  },
  {
    id: "poppins",
    name: "Poppins",
    vibe: "Geometric, friendly",
    bestFor: "Marketing/consumer",
    category: "Marketing",
    fallback: "Poppins, sans-serif",
  },
  {
    id: "clash-display",
    name: "Clash Display",
    vibe: "Dramatic, fashionable",
    bestFor: "Hero headlines",
    category: "Display",
    fallback: "'Space Grotesk', sans-serif",
  },
]

export const FONT_PAIRINGS: {
  id: string
  label: string
  heading: string
  body: string
  mono: string
  vibe: string
}[] = [
  {
    id: "geist-mono",
    label: "01 Geist + Geist Mono",
    heading: "Geist",
    body: "Geist",
    mono: "Geist Mono",
    vibe: "developer / AI / futuristic",
  },
  {
    id: "neue-geist-mono",
    label: "02 Neue Montreal + Geist Mono",
    heading: "Neue Montreal",
    body: "Neue Montreal",
    mono: "Geist Mono",
    vibe: "premium + technical",
  },
  {
    id: "inter-geist-mono",
    label: "03 Inter + Geist Mono",
    heading: "Inter",
    body: "Inter",
    mono: "Geist Mono",
    vibe: "clean + developer",
  },
  {
    id: "satoshi-inter",
    label: "04 Satoshi + Inter",
    heading: "Satoshi",
    body: "Inter",
    mono: "JetBrains Mono",
    vibe: "modern + friendly",
  },
  {
    id: "neue-instrument-serif",
    label: "05 Neue Montreal + Instrument Serif",
    heading: "Neue Montreal",
    body: "Instrument Sans",
    mono: "JetBrains Mono",
    vibe: "luxury + editorial",
  },
  {
    id: "space-inter",
    label: "06 Space Grotesk + Inter",
    heading: "Space Grotesk",
    body: "Inter",
    mono: "JetBrains Mono",
    vibe: "futuristic + readable",
  },
  {
    id: "aeonik-inter",
    label: "07 Aeonik + Inter",
    heading: "Aeonik",
    body: "Inter",
    mono: "IBM Plex Mono",
    vibe: "premium startup",
  },
  {
    id: "gt-america-mono",
    label: "08 GT America + GT America Mono",
    heading: "GT America",
    body: "GT America",
    mono: "JetBrains Mono",
    vibe: "high-end design studio",
  },
  {
    id: "manrope-plex",
    label: "09 Manrope + IBM Plex Mono",
    heading: "Manrope",
    body: "Manrope",
    mono: "IBM Plex Sans",
    vibe: "modern technical",
  },
  {
    id: "instrument-both",
    label: "10 Instrument Sans + Serif",
    heading: "Instrument Sans",
    body: "Instrument Sans",
    mono: "JetBrains Mono",
    vibe: "sophisticated editorial",
  },
]

const INITIAL_STATE: AppState = {
  projectName: "",
  projectType: "",
  problemStatement: "",
  frontendFramework: "",
  uiLibraries: [],
  features: [],
  backendFramework: "",
  database: "",
  dbTables: "",
  pages: "",
  components: "",
  theme: "",
  themeModifiers: {
    mode: "dark",
    palette: "colorful",
    motion: "subtle",
    depth: "elevated",
    density: "balanced",
  },
  themeExtras: [],
  fontHeading: "Geist",
  fontBody: "Geist",
  fontMono: "Geist Mono",
  fontPairing: "geist-mono",
  aiResponse: "",
  customAnswers: {},
  selectedSkills: [],
}

// --- Extracted UI components now live in src/components/ui/* ---
// Input, Textarea, SelectCard, MultiSelectCard, ThemeCard imported from @/components/ui
// Button, Card, Badge, Separator also available for refined layout with shadcn + Watermelon polish

// --- Main App ---

export default function App() {
  const [phase, setPhase] = useState<Phase>("landing")
  const [state, setState] = useState<AppState>(INITIAL_STATE)
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG)

  const [copied, setCopied] = useState(false)
  const [parsedFiles, setParsedFiles] = useState<{
    name: string
    content: string
  }[]>([])

  // Admin auth & state
  const [isAdmin, setIsAdmin] = useState(false)
  const [newOptions, setNewOptions] = useState<Record<string, string>>({})

  // New Custom Section Form State
  const [newSecTitle, setNewSecTitle] = useState("")
  const [newSecDesc, setNewSecDesc] = useState("")
  const [newSecPage, setNewSecPage] = useState("frontend")
  const [newSecCustomPageName, setNewSecCustomPageName] = useState("")
  const [newSecType, setNewSecType] = useState<"single" | "multi">("single")

  // Typography filter (local UI)
  const [fontFilter, setFontFilter] = useState<string>("All")
  const [mobileOpen, setMobileOpen] = useState(false)

  // Skills local UI (must be before useEffects that reference them)
  const [skillFilter, setSkillFilter] = useState<string>("All")
  const [skillSearch, setSkillSearch] = useState<string>("")
  const [skillDetail, setSkillDetail] = useState<string | null>(null)

  // Theme toggle — sync state.themeModifiers.mode to document data-theme for Tailwind v4 tokens
  useEffect(() => {
    const mode = state.themeModifiers.mode
    const resolved =
      mode === "auto"
        ? window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
        : mode
    document.documentElement.setAttribute("data-theme", resolved)
  }, [state.themeModifiers.mode])

  // Keyboard a11y: Escape closes skill drawer / mobile nav
  useEffect(() => {
    if (!skillDetail && !mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSkillDetail(null)
        setMobileOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [skillDetail, mobileOpen])

  // --- Logic Helpers ---
  const updateState = (key: keyof AppState, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const toggleArrayItem = (key: "features" | "uiLibraries", item: string) => {
    setState((prev) => {
      const arr = prev[key] as string[]
      const isRemoving = arr.includes(item)
      let nextSelected = prev.selectedSkills
      const isChakra = item.includes("Chakra UI")
      const isShadcn = item.toLowerCase().includes("shadcn")
      const isRadixShadcn = item.includes("Radix UI + Tailwind") // also backed by shadcn skill
      const isAceternity = item.includes("Aceternity")
      const isWatermelon = item.includes("Watermelon")
      // Keep skill sync relatable: UI system → corresponding skill. Substring match handles renamed options.
      if (key === "uiLibraries" && isChakra) {
        if (!isRemoving && !prev.selectedSkills.includes("chakra-ui"))
          nextSelected = [...prev.selectedSkills, "chakra-ui"]
        if (isRemoving)
          nextSelected = prev.selectedSkills.filter(
            (s) => !s.startsWith("chakra-ui"),
          )
      }
      if (key === "uiLibraries" && (isShadcn || isRadixShadcn)) {
        if (!isRemoving && !prev.selectedSkills.includes("shadcn-ui"))
          nextSelected = [...prev.selectedSkills, "shadcn-ui"]
        if (isRemoving) {
          // only remove if no other shadcn-backed UI remains selected
          const remaining = (prev.uiLibraries as string[]).filter(
            (x) => x !== item && (x.toLowerCase().includes("shadcn") || x.includes("Radix UI + Tailwind")),
          )
          if (remaining.length === 0)
            nextSelected = prev.selectedSkills.filter((s) => s !== "shadcn-ui")
        }
      }
      // Legacy Aceternity/Watermelon now live as polish skills but may still be selected via custom sections
      if (key === "uiLibraries" && isAceternity) {
        if (!isRemoving && !prev.selectedSkills.includes("aceternity-ui"))
          nextSelected = [...prev.selectedSkills, "aceternity-ui"]
        if (isRemoving)
          nextSelected = prev.selectedSkills.filter(
            (s) => s !== "aceternity-ui",
          )
      }
      if (key === "uiLibraries" && isWatermelon) {
        if (!isRemoving && !prev.selectedSkills.includes("watermelon-ui"))
          nextSelected = [...prev.selectedSkills, "watermelon-ui"]
        if (isRemoving)
          nextSelected = prev.selectedSkills.filter(
            (s) => s !== "watermelon-ui",
          )
      }
      if (isRemoving) {
        return {
          ...prev,
          [key]: arr.filter((i) => i !== item),
          selectedSkills: nextSelected,
        }
      }
      return { ...prev, [key]: [...arr, item], selectedSkills: nextSelected }
    })
  }

  const setCustomSingle = (sectionId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      customAnswers: {
        ...prev.customAnswers,
        [sectionId]: value,
      },
    }))
  }

  const toggleCustomMulti = (sectionId: string, value: string) => {
    setState((prev) => {
      const current = prev.customAnswers[sectionId]
      const arr = Array.isArray(current) ? current : []
      if (arr.includes(value)) {
        return {
          ...prev,
          customAnswers: {
            ...prev.customAnswers,
            [sectionId]: arr.filter((i) => i !== value),
          },
        }
      }
      return {
        ...prev,
        customAnswers: { ...prev.customAnswers, [sectionId]: [...arr, value] },
      }
    })
  }

  const setThemeModifier = (groupId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      themeModifiers: { ...prev.themeModifiers, [groupId]: value },
    }))
  }

  const toggleThemeExtra = (id: string) => {
    setState((prev) => {
      if (prev.themeExtras.includes(id)) {
        return {
          ...prev,
          themeExtras: prev.themeExtras.filter((x) => x !== id),
        }
      }
      return { ...prev, themeExtras: [...prev.themeExtras, id] }
    })
  }

  const applyFontPairing = (pairId: string) => {
    const pairing = FONT_PAIRINGS.find((p) => p.id === pairId)
    if (!pairing) return
    setState((prev) => ({
      ...prev,
      fontPairing: pairId,
      fontHeading: pairing.heading,
      fontBody: pairing.body,
      fontMono: pairing.mono,
    }))
  }

  const toggleSkill = (skillId: string) => {
    setState((prev) => {
      const has = prev.selectedSkills.includes(skillId)
      // Auto-sync uiLibraries / database when skill toggled
      let nextUiLibs = prev.uiLibraries
      let nextDatabase = prev.database
      const isChakraFamily = skillId.startsWith("chakra-ui")
      const isShadcn = skillId === "shadcn-ui"
      const isAceternity = skillId === "aceternity-ui"
      const isWatermelon = skillId === "watermelon-ui"
      const isSupabase = skillId === "supabase"
      // ui-skills-root is meta — no auto-toggle
      if (isChakraFamily && !has && !prev.uiLibraries.includes("Chakra UI"))
        nextUiLibs = [...prev.uiLibraries, "Chakra UI"]
      if (isShadcn && !has && !prev.uiLibraries.includes("shadcn/ui"))
        nextUiLibs = [...prev.uiLibraries, "shadcn/ui"]
      if (isAceternity && !has && !prev.uiLibraries.includes("Aceternity UI"))
        nextUiLibs = [...prev.uiLibraries, "Aceternity UI"]
      if (isWatermelon && !has && !prev.uiLibraries.includes("Watermelon UI"))
        nextUiLibs = [...prev.uiLibraries, "Watermelon UI"]
      if (isSupabase && !has && !prev.database) nextDatabase = "Supabase"
      // only remove lib when last family skill is removed
      if (isChakraFamily && has) {
        const remaining = prev.selectedSkills.filter(
          (s) => s !== skillId && s.startsWith("chakra-ui"),
        )
        if (remaining.length === 0)
          nextUiLibs = prev.uiLibraries.filter((x) => x !== "Chakra UI")
      }
      if (isShadcn && has) {
        nextUiLibs = prev.uiLibraries.filter((x) => x !== "shadcn/ui")
      }
      if (isAceternity && has) {
        nextUiLibs = prev.uiLibraries.filter((x) => x !== "Aceternity UI")
      }
      if (isWatermelon && has) {
        nextUiLibs = prev.uiLibraries.filter((x) => x !== "Watermelon UI")
      }
      if (isSupabase && has && prev.database === "Supabase") {
        // keep DB as-is if user explicitly chose it; only clear if supabase was the sole selector and no other backend implies it
        nextDatabase = prev.database
      }
      return {
        ...prev,
        selectedSkills: has
          ? prev.selectedSkills.filter((s) => s !== skillId)
          : [...prev.selectedSkills, skillId],
        uiLibraries: nextUiLibs,
        database: nextDatabase,
      }
    })
  }

  // --- Wizard Flow Management ---
  const wizardFlow = [
    "project",
    "frontend",
    "backend",
    "architecture",
    "theme",
    "skills",
    ...config.customPages.map((p) => p.id),
    "prompt",
    "response",
    "blueprint",
  ]

  const currentIndex = wizardFlow.indexOf(phase)
  const prevPhase = currentIndex > 0 ? wizardFlow[currentIndex - 1] : null
  const nextPhase =
    currentIndex > -1 && currentIndex < wizardFlow.length - 1
      ? wizardFlow[currentIndex + 1]
      : null

  // --- Prompt Generation ---
  const generatePrompt = () => {
    let customPrompts = ""
    config.customSections.forEach((section) => {
      const answer = state.customAnswers[section.id]
      if (answer && (typeof answer === "string" || answer.length > 0)) {
        const answerStr = Array.isArray(answer) ? answer.join(", ") : answer
        customPrompts += `${section.title}: ${answerStr}\n`
      }
    })

    const themeName =
      THEMES.find((t) => t.id === state.theme)?.name ||
      state.theme ||
      "Not specified"
    const themeDetails = THEMES.find((t) => t.id === state.theme)
    const modifierStr = Object.entries(state.themeModifiers)
      .map(([k, v]) => {
        const g = MODIFIER_GROUPS.find((x) => x.id === k)
        return `${g?.label || k}: ${v}`
      })
      .join(" | ")
    const extrasStr = state.themeExtras.length
      ? state.themeExtras
          .map((id) => SUB_THEMES.find((s) => s.id === id)?.label || id)
          .join(", ")
      : "None"

    const pairing = FONT_PAIRINGS.find((p) => p.id === state.fontPairing)
    const fontPrimary =
      FONTS.find((f) => f.name === state.fontHeading)?.name || state.fontHeading

    // Skills prompt injection
    const allSkills = [
      ...SKILLS_CATALOG,
      ...config.skillsCatalog.filter(
        (s) => !SKILLS_CATALOG.find((c) => c.id === s.id),
      ),
    ]
    const selectedSkillObjs = allSkills.filter((s) =>
      state.selectedSkills.includes(s.id),
    )
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
UI Libraries: ${state.uiLibraries.join(", ") || "Not specified"}
Features: ${state.features.join(", ") || "None specified"}

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
Primary Theme: ${themeName}${
      themeDetails ? ` — ${themeDetails.feel} (${themeDetails.traits})` : ""
    }
Modifiers: ${modifierStr || "Not specified"}
Additional Layers: ${extrasStr}
Theme Combination Summary: ${
      themeName !== "Not specified"
        ? `${modifierStr} + ${themeName}${
            extrasStr !== "None" ? ` + ${extrasStr}` : ""
          }`
        : "Not specified"
    }

# TYPOGRAPHY
Primary / Heading Font: ${state.fontHeading || "Not specified"}${
      fontPrimary
        ? ` (${FONTS.find((f) => f.name === state.fontHeading)?.vibe || ""})`
        : ""
    }
Body / UI Font: ${state.fontBody || "Not specified"}
Monospace / Code Font: ${state.fontMono || "Not specified"}
Font Pairing Preset: ${
      pairing
        ? `${pairing.label} — ${pairing.vibe} (Heading: ${pairing.heading} / Body: ${pairing.body} / Mono: ${pairing.mono})`
        : state.fontPairing || "Custom"
    }
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

  const handleCopyPrompt = async () => {
    // Try backend first (Vite proxy /api -> Express), fallback to local generatePrompt()
    try {
      const { prompt } = await backendClient.generatePromptWithFallback(
        state as unknown as Record<string, unknown> as never,
        () => generatePrompt(),
        {
          customSections: config.customSections,
          skillsCatalog: [
            ...SKILLS_CATALOG,
            ...config.skillsCatalog.filter(
              (s) => !SKILLS_CATALOG.find((c) => c.id === s.id),
            ),
          ] as never,
        },
      )
      await navigator.clipboard.writeText(prompt)
    } catch {
      await navigator.clipboard.writeText(generatePrompt())
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const processResponse = async () => {
    if (!state.aiResponse.trim()) return
    // Prefer backend parse (validates file format server-side), fallback to local regex
    const fallback = () => {
      const fileRegex =
        /---\s*FILE:\s*([a-zA-Z0-9_.-]+)\s*---([\s\S]*?)---\s*END FILE\s*---/g
      const files: { name: string; content: string }[] = []
      let match
      while ((match = fileRegex.exec(state.aiResponse)) !== null) {
        files.push({ name: match[1].trim(), content: match[2].trim() })
      }
      if (files.length === 0)
        files.push({ name: "AI_OUTPUT_RAW.md", content: state.aiResponse })
      return files
    }
    try {
      const { files } = await backendClient.parseResponseWithFallback(
        state.aiResponse,
        fallback,
      )
      setParsedFiles(files)
    } catch {
      setParsedFiles(fallback())
    }
    setPhase("blueprint")
  }

  const downloadZip = async () => {
    const zip = new JSZip()
    const folder =
      zip.folder(
        `${state.projectName.toLowerCase().replace(/\s+/g, "-")}-blueprint`,
      ) || zip

    parsedFiles.forEach((file) => {
      folder.file(file.name, file.content)
    })

    // Include SKILLS.md + skills/ install guide if any skills selected
    // — does NOT auto-download the skill; only documents how to install
    // — so the recipient can run `pnpm dlx skills add ...` after extracting the zip
    if (state.selectedSkills.length > 0) {
      const allSkills = [
        ...SKILLS_CATALOG,
        ...config.skillsCatalog.filter(
          (s) => !SKILLS_CATALOG.find((c) => c.id === s.id),
        ),
      ]
      const selected = allSkills.filter((s) =>
        state.selectedSkills.includes(s.id),
      )
      const skillsMd = `# Skills — install after scaffolding

This blueprint uses ${selected.length} skill(s). Skills are **not** auto-downloaded or bundled.
After extracting this zip, run the install command(s) below in your project root to add them.

${selected
  .map(
    (s) =>
      `## ${s.name} — \`${s.id}\`\n\n- **What:** ${s.description}\n- **Package / Skill:** \`${s.package}\`\n- **Source:** ${s.source}\n- **Docs:** ${s.docsUrl}\n- **Concepts:** ${s.concepts}\n- **Highlights:** ${s.highlights.join(" · ")}\n- **Install:**\n\n\`\`\`bash\n${s.installCmd}\n\`\`\`\n`,
  )
  .join("\n")}

## Quick install (all selected)

\`\`\`bash
${selected.map((s) => s.installCmd).join("\n")}
\`\`\`

## Notes

- **Chakra UI** — \`npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills\` installs all sub-skills; pick a single one (builder/migrate/refactor) if you only need one.
- **shadcn/ui** — \`pnpm dlx skills add shadcn/ui\` adds the skill context; then \`pnpm dlx shadcn@latest init\` and \`add <component>\` inside your app. No components are bundled inside this zip.
- These commands only document installation — Blueprint does not run them automatically.

Generated: ${new Date().toISOString()}
Blueprint: ${state.projectName || "Untitled"} · ${state.selectedSkills.join(", ")}
`
      folder.file("SKILLS.md", skillsMd)

      // also add a lightweight per-skill README under skills/<id>/ for discoverability inside the zip
      const skillsFolder = folder.folder("skills")
      selected.forEach((s) => {
        const perSkill = `# ${s.name}\n\n${s.description}\n\nInstall:\n\`\`\`bash\n${s.installCmd}\n\`\`\`\n\nSource: ${s.source}\nDocs: ${s.docsUrl}\nPackage: ${s.package}\nConcepts: ${s.concepts}\n`
        skillsFolder?.file(`${s.id}/SKILL.md`, perSkill)
      })
    }

    const content = await zip.generateAsync({ type: "blob" })
    saveAs(
      content,
      `${state.projectName.toLowerCase().replace(/\s+/g, "-") || "project"}-blueprint.zip`,
    )
  }

  // --- Admin Logic ---
  const handleAdminAuth = () => {
    const pwd = prompt('Enter admin password (hint: "admin"):')
    if (pwd === "admin") {
      setIsAdmin(true)
      setPhase("admin")
    } else if (pwd !== null) {
      alert("Incorrect password")
    }
  }

  const removeConfigOption = (category: keyof AppConfig, item: string) => {
    setConfig((prev) => ({
      ...prev,
      [category]: (prev[category] as string[]).filter((val) => val !== item),
    }))
  }

  const addConfigOption = (category: keyof AppConfig) => {
    const val = newOptions[category]
    if (val && val.trim()) {
      setConfig((prev) => ({
        ...prev,
        [category]: [...prev[category] as string[], val.trim()],
      }))
      setNewOptions((prev) => ({ ...prev, [category]: "" }))
    }
  }

  const addCustomSectionOption = (sectionId: string) => {
    const val = newOptions[sectionId]
    if (val && val.trim()) {
      setConfig((prev) => ({
        ...prev,
        customSections: prev.customSections.map((s) =>
          s.id === sectionId
            ? { ...s, options: [...s.options, val.trim()] }
            : s,
        ),
      }))
      setNewOptions((prev) => ({ ...prev, [sectionId]: "" }))
    }
  }

  const removeCustomSectionOption = (sectionId: string, item: string) => {
    setConfig((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === sectionId
          ? { ...s, options: s.options.filter((o) => o !== item) }
          : s,
      ),
    }))
  }

  const deleteCustomSection = (sectionId: string) => {
    setConfig((prev) => {
      const updatedSections = prev.customSections.filter(
        (s) => s.id !== sectionId,
      )

      // Auto-cleanup orphaned custom pages
      const activeCustomPageIds = new Set(updatedSections.map((s) => s.pageId))
      const updatedPages = prev.customPages.filter((p) =>
        activeCustomPageIds.has(p.id),
      )

      return {
        ...prev,
        customSections: updatedSections,
        customPages: updatedPages,
      }
    })
  }

  const handleCreateCustomSection = () => {
    if (!newSecTitle.trim()) return

    let targetPageId = newSecPage

    if (newSecPage === "NEW_PAGE") {
      if (!newSecCustomPageName.trim())
        return alert("Please provide a name for the new page.")
      targetPageId = "page_" + Date.now()
      setConfig((prev) => ({
        ...prev,
        customPages: [
          ...prev.customPages,
          { id: targetPageId, title: newSecCustomPageName.trim() },
        ],
      }))
    }

    const newSection: CustomSection = {
      id: "sec_" + Date.now(),
      pageId: targetPageId,
      title: newSecTitle.trim(),
      description: newSecDesc.trim(),
      isMulti: newSecType === "multi",
      options: [],
    }

    setConfig((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newSection],
    }))

    setNewSecTitle("")
    setNewSecDesc("")
    setNewSecPage("frontend")
    setNewSecCustomPageName("")
    setNewSecType("single")
  }

  // --- Render Helpers ---
  const renderSidebar = () => {
    const navItems: { id: Phase; label: string; icon: any }[] = [
      { id: "project", label: "01. Project", icon: Layout },
      { id: "frontend", label: "02. Frontend", icon: Layout },
      { id: "backend", label: "03. Backend", icon: Database },
      { id: "architecture", label: "04. Architecture", icon: Cpu },
      { id: "theme", label: "05. Visual Style", icon: Palette },
      {
        id: "skills",
        label: `06. Skills${
          state.selectedSkills.length ? ` · ${state.selectedSkills.length}` : ""
        }`,
        icon: Puzzle,
      },
      // Inject Custom Pages after skills
      ...config.customPages.map((p, idx) => ({
        id: p.id,
        label: `0${7 + idx}. ${p.title}`,
        icon: LayoutTemplate,
      })),
      {
        id: "prompt",
        label: `0${7 + config.customPages.length}. AI Prompt`,
        icon: Terminal,
      },
      {
        id: "response",
        label: `0${8 + config.customPages.length}. Response`,
        icon: Terminal,
      },
      {
        id: "blueprint",
        label: `0${9 + config.customPages.length}. Blueprint`,
        icon: FileCode,
      },
    ]

    if (isAdmin) {
      navItems.push({ id: "admin", label: "Admin Config", icon: Settings })
    }

    return (
      <>
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        <aside
          className={`w-64 border-r border-border-default bg-surface-1 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-40 transition-transform duration-200 ease-out md:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div
            className="p-6 border-b border-border-subtle cursor-pointer hover:bg-surface-2 transition-colors"
            onClick={() => setPhase("landing")}
          >
            <h1 className="font-mono font-bold tracking-tight text-xl">
              BLUEPRINT
            </h1>
            <p className="text-text-muted text-xs mt-1">PLANNING LAYER</p>
          </div>
          <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = phase === item.id
            return (
              <div
                key={item.id}
                onClick={() => {
                  setPhase(item.id)
                  setMobileOpen(false)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setPhase(item.id)
                    setMobileOpen(false)
                  }
                }}
                className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-surface-3 text-text-primary font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                }`}
              >
                <item.icon
                  size={16}
                  className={isActive ? "text-text-primary" : "text-text-muted"}
                />
                <span className="truncate">{item.label}</span>
              </div>
            )
          })}
          </nav>
          <div className="p-4 border-t border-border-subtle space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const next =
                    state.themeModifiers.mode === "dark" ? "light" : "dark"
                  setThemeModifier("mode", next)
                }}
                className="flex-1 justify-start h-8 text-xs"
                aria-label="Toggle theme"
              >
                {state.themeModifiers.mode === "light" ? (
                  <Moon size={14} />
                ) : (
                  <Sun size={14} />
                )}
                {state.themeModifiers.mode === "light" ? "Dark" : "Light"} mode
              </Button>
              <Badge variant="secondary" className="text-[10px]">
                v1.2
              </Badge>
            </div>
            <Separator />
            {!isAdmin && (
              <button
                onClick={handleAdminAuth}
                className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1 py-1"
              >
                <Lock size={12} /> Admin Login
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setIsAdmin(false)}
                className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1 py-1"
              >
                <Lock size={12} /> Logout Admin
              </button>
            )}
          </div>
        </aside>
      </>
    )
  }

  const renderWizardNav = () => (
    <div className="flex justify-between mt-12 pt-6 border-t border-border-subtle">
      {prevPhase ? (
        <Button
          variant="ghost"
          onClick={() => setPhase(prevPhase)}
          className="gap-2"
        >
          <ChevronLeft size={18} /> Back
        </Button>
      ) : (
        <div />
      )}

      {nextPhase ? (
        <Button onClick={() => setPhase(nextPhase)} className="gap-2">
          Next Phase <ChevronRight size={18} />
        </Button>
      ) : (
        <div />
      )}
    </div>
  )

  const renderCustomSectionsForPage = (pageId: string) => {
    const sections = config.customSections.filter((s) => s.pageId === pageId)
    if (sections.length === 0) return null

    return sections.map((sec) => (
      <div key={sec.id} className="mb-8 pt-4 border-t border-border-subtle/50">
        <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-1 block">
          {sec.title}
        </label>
        {sec.description && (
          <p className="text-text-muted text-sm mb-4">{sec.description}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sec.options.map((opt) =>
            sec.isMulti ? (
              <MultiSelectCard
                key={opt}
                label={opt}
                selected={(state.customAnswers[sec.id] || []).includes(opt)}
                onClick={() => toggleCustomMulti(sec.id, opt)}
              />
            ) : (
              <SelectCard
                key={opt}
                label={opt}
                selected={state.customAnswers[sec.id] === opt}
                onClick={() => setCustomSingle(sec.id, opt)}
              />
            ),
          )}
          {sec.options.length === 0 && (
            <div className="col-span-2 text-text-muted text-sm italic py-2">
              No options available. An admin can add options in the Admin
              Config.
            </div>
          )}
        </div>
      </div>
    ))
  }

  const renderSkills = () => {
    const allSkills = [
      ...SKILLS_CATALOG,
      ...config.skillsCatalog.filter(
        (s) => !SKILLS_CATALOG.find((c) => c.id === s.id),
      ),
    ]
    const filtered = allSkills.filter((s) => {
      const matchesSearch =
        !skillSearch ||
        s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
        s.description.toLowerCase().includes(skillSearch.toLowerCase())
      const matchesFilter = skillFilter === "All" || s.category === skillFilter
      return matchesSearch && matchesFilter
    })
    const installed = allSkills.filter((s) =>
      state.selectedSkills.includes(s.id),
    )
    const categories = [
      "All",
      ...Array.from(new Set(allSkills.map((s) => s.category))),
    ]
    const detailSkill = skillDetail
      ? allSkills.find((s) => s.id === skillDetail)
      : null

    return (
      <div className="max-w-5xl animate-in pb-20">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Puzzle size={28} className="text-text-muted" /> Skills
            </h2>
            <p className="text-text-secondary mt-2 max-w-2xl">
              Extend your blueprint with reusable capability packs. Skills
              inject install steps, docs context and prompt rules into the
              generated blueprint. Start with{" "}
              <span className="text-text-primary font-medium">Chakra UI</span>.
            </p>
          </div>
          {installed.length > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-surface-1 border border-border-default rounded-full px-3 py-1.5 text-xs shrink-0">
              <Boxes size={14} className="text-text-muted" />
              <span className="text-text-secondary">
                {installed.length} installed
              </span>
              <span className="text-text-muted">·</span>
              <button
                onClick={() => setPhase("prompt")}
                className="text-text-primary underline"
              >
                view prompt →
              </button>
            </div>
          )}
        </div>

        <div className="border-b border-border-default pb-6 mb-6" />

        {/* Installed summary */}
        {installed.length > 0 && (
          <div className="mb-8 bg-surface-1 border border-border-strong rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-text-muted" />
              <h3 className="text-sm font-semibold tracking-widest uppercase text-text-secondary">
                Installed — {installed.length}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {installed.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 bg-surface-2 border border-border-default rounded-full px-3 py-1.5 text-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-text-primary font-medium">
                    {s.name}
                  </span>
                  <span className="text-text-muted text-xs hidden sm:inline">
                    {s.package}
                  </span>
                  <button
                    onClick={() => toggleSkill(s.id)}
                    className="ml-1 w-5 h-5 rounded-full bg-surface-3 hover:bg-border-strong flex items-center justify-center text-text-muted hover:text-text-primary"
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-3">
              These will be injected under{" "}
              <span className="font-mono text-text-secondary"># SKILLS</span> in
              the master prompt and scaffold instructions.
            </p>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Search skills (e.g. Chakra, UI, components)…"
              className="w-full bg-surface-1 border border-border-default rounded-md pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-secondary"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSkillFilter(cat)}
                className={`px-3 py-2 rounded-full text-xs font-medium border transition-colors ${
                  skillFilter === cat
                    ? "bg-text-primary text-background border-text-primary"
                    : "bg-surface-1 border-border-default text-text-secondary hover:border-text-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filtered.map((skill) => {
            const isInstalled = state.selectedSkills.includes(skill.id)
            return (
              <div
                key={skill.id}
                className={`relative rounded-xl border p-5 flex flex-col gap-3 transition-all ${
                  isInstalled
                    ? "bg-text-primary text-background border-text-primary shadow-lg"
                    : "bg-surface-1 border-border-default hover:border-border-strong hover:bg-surface-2"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isInstalled
                        ? "bg-background text-text-primary"
                        : "bg-surface-2 border border-border-default text-text-primary"
                    }`}
                  >
                    <Puzzle size={20} />
                  </div>
                  <button
                    onClick={() => toggleSkill(skill.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors shrink-0 ${
                      isInstalled
                        ? "bg-background text-text-primary border-background hover:opacity-90"
                        : "bg-text-primary text-background border-text-primary hover:opacity-90"
                    }`}
                  >
                    {isInstalled ? "Installed ✓" : "Install"}
                  </button>
                </div>

                <div>
                  <div
                    className={`text-base font-bold leading-none flex items-center gap-2 ${
                      isInstalled ? "text-background" : "text-text-primary"
                    }`}
                  >
                    {skill.name}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                        isInstalled
                          ? "border-background/20 text-background/70"
                          : "border-border-default text-text-muted bg-surface-2"
                      }`}
                    >
                      {skill.category}
                    </span>
                  </div>
                  <div
                    className={`text-[11px] font-mono mt-1 ${
                      isInstalled ? "text-background/60" : "text-text-muted"
                    }`}
                  >
                    {skill.concepts} · {skill.package}
                  </div>
                  <p
                    className={`text-sm mt-2 leading-relaxed line-clamp-2 ${
                      isInstalled ? "text-background/80" : "text-text-secondary"
                    }`}
                  >
                    {skill.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skill.highlights.slice(0, 3).map((h) => (
                    <span
                      key={h}
                      className={`text-[11px] px-2 py-1 rounded-full border ${
                        isInstalled
                          ? "bg-background/10 border-background/15 text-background/80"
                          : "bg-surface-2 border-border-default text-text-muted"
                      }`}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                <div
                  className={`flex items-center gap-2 text-[11px] font-mono pt-2 border-t ${
                    isInstalled
                      ? "border-background/15 text-background/60"
                      : "border-border-subtle text-text-muted"
                  }`}
                >
                  <BookOpen size={12} />
                  <span className="truncate">{skill.docsUrl}</span>
                  <button
                    onClick={() => setSkillDetail(skill.id)}
                    className={`ml-auto underline ${
                      isInstalled ? "text-background" : "text-text-secondary"
                    }`}
                  >
                    details →
                  </button>
                </div>

                {/* subtle source link */}
                <a
                  href={skill.rawUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`absolute top-3 right-[88px] w-7 h-7 rounded-full border flex items-center justify-center ${
                    isInstalled
                      ? "border-background/15 text-background/60 hover:text-background"
                      : "border-border-default text-text-muted hover:text-text-primary bg-surface-1"
                  }`}
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="border border-dashed border-border-default rounded-lg p-10 text-center">
            <p className="text-text-muted text-sm">
              No skills match “{skillSearch}” in {skillFilter}.
            </p>
            <button
              onClick={() => {
                setSkillSearch("")
                setSkillFilter("All")
              }}
              className="mt-3 text-sm text-text-primary underline"
            >
              clear filters
            </button>
          </div>
        )}

        {/* Detail drawer */}
        {detailSkill && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="flex-1 bg-black/60 backdrop-blur-sm"
              onClick={() => setSkillDetail(null)}
            />
            <div className="w-full max-w-xl bg-surface-1 border-l border-border-default h-screen overflow-y-auto p-6 animate-in">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-text-primary text-background flex items-center justify-center">
                    <Puzzle size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary leading-none">
                      {detailSkill.name}
                    </h3>
                    <p className="text-xs text-text-muted font-mono mt-1">
                      {detailSkill.docsUrl}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {detailSkill.source}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSkillDetail(null)}
                  className="w-8 h-8 rounded-full bg-surface-2 border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {detailSkill.description}
              </p>

              <div className="bg-surface-2 border border-border-default rounded-lg p-4 mb-4">
                <div className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-2 flex items-center gap-2">
                  <Package size={12} /> Install
                </div>
                <code className="text-sm font-mono text-text-primary block bg-background border border-border-subtle rounded px-3 py-2">
                  {detailSkill.installCmd}
                </code>
                <div className="mt-3 flex gap-2">
                  <a
                    href={detailSkill.rawUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-surface-3 border border-border-default px-3 py-1.5 rounded flex items-center gap-1.5 hover:border-text-muted"
                  >
                    <ExternalLink size={12} /> Raw MDX
                  </a>
                  <a
                    href={`https://chakra-ui.com/${detailSkill.docsUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-surface-3 border border-border-default px-3 py-1.5 rounded flex items-center gap-1.5 hover:border-text-muted"
                  >
                    <BookOpen size={12} /> Docs
                  </a>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-2">
                  Concepts
                </h4>
                <p className="text-sm font-mono text-text-primary bg-surface-2 border border-border-default rounded px-3 py-2">
                  {detailSkill.concepts}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-2">
                  Highlights
                </h4>
                <ul className="space-y-1.5">
                  {detailSkill.highlights.map((h) => (
                    <li
                      key={h}
                      className="text-sm text-text-secondary flex gap-2"
                    >
                      <span className="text-text-muted">—</span> {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-background border border-border-default rounded-lg p-4 mb-6">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-2">
                  Prompt injection preview
                </h4>
                <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {`- ${detailSkill.name} [${detailSkill.id}] — ${detailSkill.description} (source: ${detailSkill.source} | docs: ${detailSkill.docsUrl} | package: ${detailSkill.package})`}
                </pre>
              </div>

              <button
                onClick={() => {
                  toggleSkill(detailSkill.id)
                  setSkillDetail(null)
                }}
                className={`w-full py-3 rounded-md font-medium flex items-center justify-center gap-2 ${
                  state.selectedSkills.includes(detailSkill.id)
                    ? "bg-surface-3 border border-border-strong text-text-primary"
                    : "bg-text-primary text-background"
                }`}
              >
                {state.selectedSkills.includes(detailSkill.id) ? (
                  <>
                    <X size={16} /> Remove skill
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Install skill
                  </>
                )}
              </button>

              <p className="text-[11px] text-text-muted text-center mt-3">
                File:{" "}
                <span className="font-mono">
                  skills/{detailSkill.id}/SKILL.md
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Footer help */}
        <div className="bg-surface-1 border border-border-default rounded-lg p-4 flex gap-3">
          <div className="text-text-muted mt-0.5">
            <Boxes size={18} />
          </div>
          <div className="text-sm">
            <div className="font-medium text-text-primary mb-1">
              How skills work
            </div>
            <div className="text-text-secondary leading-relaxed text-xs">
              Skills are versioned folders under{" "}
              <span className="font-mono text-text-primary">skills/</span> (see{" "}
              <span className="font-mono">skills/chakra-ui/SKILL.md</span>).
              Installing adds the skill to{" "}
              <span className="font-mono"># SKILLS</span> in the master prompt —
              downstream AI will scaffold with that library and follow its usage
              rules. Add new skills in{" "}
              <span className="font-mono">Admin → Skills</span> or by creating a
              folder and registering it in{" "}
              <span className="font-mono">SKILLS_CATALOG</span>.
            </div>
          </div>
        </div>

        {renderWizardNav()}
      </div>
    )
  }

  const renderAdmin = () => {
    const standardCategories: {
      key: keyof AppConfig
      title: string
      desc: string
    }[] = [
      {
        key: "projectTypes",
        title: "Project Types",
        desc: "Options available in Project Definition",
      },
      {
        key: "frontendFrameworks",
        title: "Frontend Frameworks",
        desc: "Options available in Frontend Stack",
      },
      {
        key: "uiLibraries",
        title: "UI Libraries",
        desc: "Styling & UI libraries in Frontend Stack",
      },
      {
        key: "features",
        title: "Features & Polish",
        desc: "Additional features in Frontend Stack",
      },
      {
        key: "backendFrameworks",
        title: "Backend Frameworks",
        desc: "Runtime/Frameworks in Backend",
      },
      {
        key: "databases",
        title: "Databases",
        desc: "Database options in Backend",
      },
    ]

    return (
      <div className="max-w-4xl animate-in pb-20">
        <h2 className="text-3xl font-bold mb-2 tracking-tight">
          Admin Dashboard
        </h2>
        <p className="text-text-secondary mb-10 border-b border-border-default pb-8">
          Create new sections, dynamically insert pages, and configure available
          options globally.
        </p>

        {/* CREATE NEW CUSTOM SECTION */}
        <div className="bg-surface-1 border border-border-strong rounded-md p-6 mb-12 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Plus size={20} className="text-text-primary" />
            <h3 className="text-xl font-bold text-text-primary">
              Create Custom Section
            </h3>
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Add a brand new dynamic question block. You can inject it into
            existing pages or create an entirely new step in the workflow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input
              label="Section Title"
              value={newSecTitle}
              onChange={(e: any) => setNewSecTitle(e.target.value)}
              placeholder="e.g. Types of Theme"
            />
            <Input
              label="Section Description"
              value={newSecDesc}
              onChange={(e: any) => setNewSecDesc(e.target.value)}
              placeholder="e.g. Select the overall aesthetic."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase">
                Placement / Page
              </label>
              <select
                className="bg-surface-2 border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                value={newSecPage}
                onChange={(e) => setNewSecPage(e.target.value)}
              >
                <option value="project">01. Project</option>
                <option value="frontend">02. Frontend</option>
                <option value="backend">03. Backend</option>
                <option value="architecture">04. Architecture</option>
                <option value="theme">05. Visual Style</option>
                {config.customPages.map((p) => (
                  <option key={p.id} value={p.id}>
                    Custom: {p.title}
                  </option>
                ))}
                <option value="NEW_PAGE">➕ Create New Page...</option>
              </select>
            </div>

            {newSecPage === "NEW_PAGE" && (
              <Input
                label="New Page Title"
                value={newSecCustomPageName}
                onChange={(e: any) => setNewSecCustomPageName(e.target.value)}
                placeholder="e.g. Theming & Design"
              />
            )}

            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase">
                Selection Type
              </label>
              <select
                className="bg-surface-2 border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                value={newSecType}
                onChange={(e: any) => setNewSecType(e.target.value)}
              >
                <option value="single">Single Choice (Radio behavior)</option>
                <option value="multi">
                  Multiple Choice (Checkbox behavior)
                </option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCreateCustomSection}
            disabled={
              !newSecTitle.trim() ||
              (newSecPage === "NEW_PAGE" && !newSecCustomPageName.trim())
            }
            className="bg-text-primary text-background px-6 py-3 rounded-md font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            Create Section <Check size={18} />
          </button>
        </div>

        <h3 className="text-2xl font-bold mb-6 tracking-tight border-b border-border-default pb-4">
          Manage Options
        </h3>
        <div className="flex flex-col gap-8">
          {/* CUSTOM SECTIONS (Dynamically Created) */}
          {config.customSections.map((sec) => {
            const pageName = sec.pageId.startsWith("page_")
              ? config.customPages.find((p) => p.id === sec.pageId)?.title
              : sec.pageId.charAt(0).toUpperCase() + sec.pageId.slice(1)

            return (
              <div
                key={sec.id}
                className="bg-surface-1 border border-border-strong rounded-md p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-text-primary">
                      {sec.title}
                    </h3>
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                      Custom ({sec.isMulti ? "Multi" : "Single"})
                    </span>
                    <span className="text-xs text-text-muted bg-surface-3 px-2 py-1 rounded">
                      Page: {pageName}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteCustomSection(sec.id)}
                    className="text-text-muted hover:text-red-400 transition-colors p-1"
                    title="Delete section completely"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mb-6">
                  {sec.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {sec.options.map((opt) => (
                    <div
                      key={opt}
                      className="bg-surface-2 border border-border-strong rounded px-3 py-1.5 flex items-center gap-2 text-sm"
                    >
                      {opt}
                      <button
                        onClick={() => removeCustomSectionOption(sec.id, opt)}
                        className="text-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {sec.options.length === 0 && (
                    <span className="text-sm text-text-muted italic">
                      No options added yet.
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOptions[sec.id] || ""}
                    onChange={(e) =>
                      setNewOptions((prev) => ({
                        ...prev,
                        [sec.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && addCustomSectionOption(sec.id)
                    }
                    placeholder="Add new option..."
                    className="bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-text-secondary w-64 transition-colors"
                  />
                  <button
                    onClick={() => addCustomSectionOption(sec.id)}
                    className="bg-surface-3 hover:bg-border-strong text-text-primary px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            )
          })}

          {/* STANDARD SECTIONS */}
          {standardCategories.map((cat) => (
            <div
              key={cat.key}
              className="bg-surface-1 border border-border-default rounded-md p-6"
            >
              <h3 className="text-lg font-medium text-text-primary mb-1">
                {cat.title}
              </h3>
              <p className="text-sm text-text-secondary mb-6">{cat.desc}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {(config[cat.key] as string[]).map((opt) => (
                  <div
                    key={opt}
                    className="bg-surface-2 border border-border-strong rounded px-3 py-1.5 flex items-center gap-2 text-sm"
                  >
                    {opt}
                    <button
                      onClick={() => removeConfigOption(cat.key, opt)}
                      className="text-text-muted hover:text-red-400 transition-colors"
                      title="Remove option"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOptions[cat.key] || ""}
                  onChange={(e) =>
                    setNewOptions((prev) => ({
                      ...prev,
                      [cat.key]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && addConfigOption(cat.key)
                  }
                  placeholder="Add new option..."
                  className="bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-text-secondary w-64 transition-colors"
                />
                <button
                  onClick={() => addConfigOption(cat.key)}
                  className="bg-surface-3 hover:bg-border-strong text-text-primary px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-in">
      <Badge variant="outline" className="mb-6 font-mono tracking-[0.2em] text-xs">
        System Ready · shadcn · Aceternity · Watermelon
      </Badge>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 max-w-4xl">
        THE PLANNING LAYER
        <br />
        BETWEEN IDEA & CODE.
      </h1>
      <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-12">
        Blueprint is a structured project-planning tool designed for rapid
        software development. Define your architecture properly before you start
        writing code.
      </p>
      <Button
        onClick={() => setPhase("project")}
        size="lg"
        className="px-8 py-6 text-base gap-2 hover-lift"
      >
        Start Planning
        <ArrowRight size={20} />
      </Button>
      <p className="text-text-muted text-xs mt-6 font-mono">
        12 phases · 10 themes · 20 fonts · Watermelon 200ms polish
      </p>
    </div>
  )

  const renderContent = () => {
    switch (phase) {
      case "project":
        return (
          <div className="max-w-3xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              Project Definition
            </h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">
              Establish the core identity and purpose of your system.
            </p>

            <Input
              label="Project Name"
              placeholder="e.g. Acme Dashboard"
              value={state.projectName}
              onChange={(e: any) => updateState("projectName", e.target.value)}
              required
            />

            <div className="mb-6">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">
                Project Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {config.projectTypes.map((type) => (
                  <SelectCard
                    key={type}
                    label={type}
                    selected={state.projectType === type}
                    onClick={() => updateState("projectType", type)}
                  />
                ))}
              </div>
            </div>

            <Textarea
              label="Problem Statement"
              placeholder="What specific problem does this project solve?"
              value={state.problemStatement}
              onChange={(e: any) =>
                updateState("problemStatement", e.target.value)
              }
              rows={5}
              required
            />

            {renderCustomSectionsForPage("project")}
            {renderWizardNav()}
          </div>
        )

      case "frontend":
        return (
          <div className="max-w-3xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              Frontend Stack
            </h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">
              Define the client-side architecture — each group is mutually-comparable so choices compose cleanly.
            </p>

            <div className="mb-8">
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-text-secondary text-sm font-medium tracking-wide uppercase block">
                  Core Framework — pick ONE entry point
                </label>
                <span className="text-[11px] text-text-muted">single-select</span>
              </div>
              <p className="text-xs text-text-muted mb-3">
                React vs Next.js vs Vue ecosystem — determines routing, SSR/SSG, and Islands strategy.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {config.frontendFrameworks.map((fw) => (
                  <SelectCard
                    key={fw}
                    label={fw}
                    selected={state.frontendFramework === fw}
                    onClick={() => updateState("frontendFramework", fw)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-text-secondary text-sm font-medium tracking-wide uppercase block">
                  Design System — pick ONE library
                </label>
                <span className="text-[11px] text-text-muted">single or mix · curated 2026</span>
              </div>
              <p className="text-xs text-text-muted mb-3">
                All options are production design systems — no mixing of primitives vs techniques. Pick the system your team will own.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {config.uiLibraries.map((lib) => (
                  <MultiSelectCard
                    key={lib}
                    label={lib}
                    selected={state.uiLibraries.includes(lib)}
                    onClick={() => toggleArrayItem("uiLibraries", lib)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-text-secondary text-sm font-medium tracking-wide uppercase block">
                  App Capabilities — composable layers
                </label>
                <span className="text-[11px] text-text-muted">multi-select</span>
              </div>
              <p className="text-xs text-text-muted mb-3">
                Same abstraction level: client/server state, forms, auth, animation, viz, and realtime — pick what the product actually needs.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {config.features.map((feat) => (
                  <MultiSelectCard
                    key={feat}
                    label={feat}
                    selected={state.features.includes(feat)}
                    onClick={() => toggleArrayItem("features", feat)}
                  />
                ))}
              </div>
            </div>

            {renderCustomSectionsForPage("frontend")}
            {renderWizardNav()}
          </div>
        )

      case "backend":
        return (
          <div className="max-w-3xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              Backend & Data
            </h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">
              Configure server infrastructure and data persistence.
            </p>

            <div className="mb-8">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">
                Runtime / Framework
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {config.backendFrameworks.map((fw) => (
                  <SelectCard
                    key={fw}
                    label={fw}
                    selected={state.backendFramework === fw}
                    onClick={() => updateState("backendFramework", fw)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">
                Database
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {config.databases.map((db) => (
                  <SelectCard
                    key={db}
                    label={db}
                    selected={state.database === db}
                    onClick={() => updateState("database", db)}
                  />
                ))}
              </div>
            </div>

            <Textarea
              label="Database Tables & Entities (Draft)"
              placeholder="e.g. Users, Posts, Comments, Analytics..."
              value={state.dbTables}
              onChange={(e: any) => updateState("dbTables", e.target.value)}
              rows={4}
            />

            {renderCustomSectionsForPage("backend")}
            {renderWizardNav()}
          </div>
        )

      case "architecture":
        return (
          <div className="max-w-3xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              System Architecture
            </h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">
              Map out the structural components of the application.
            </p>

            <Textarea
              label="Pages & Routes"
              placeholder="e.g. / (Landing), /dashboard (Main App), /settings"
              value={state.pages}
              onChange={(e: any) => updateState("pages", e.target.value)}
              rows={4}
            />

            <Textarea
              label="Key Components"
              placeholder="e.g. Navbar, Sidebar, DataTable, UserProfileCard"
              value={state.components}
              onChange={(e: any) => updateState("components", e.target.value)}
              rows={4}
            />

            {renderCustomSectionsForPage("architecture")}
            {renderWizardNav()}
          </div>
        )

      case "theme":
        // compute combination string for summary
        const selectedTheme = THEMES.find((t) => t.id === state.theme)
        const comboStr = selectedTheme
          ? `${state.themeModifiers.mode} · ${state.themeModifiers.palette} · ${state.themeModifiers.motion} · ${state.themeModifiers.depth} · ${state.themeModifiers.density} → ${selectedTheme.name}${
              state.themeExtras.length
                ? ` + ${state.themeExtras.map((id) => SUB_THEMES.find((s) => s.id === id)?.label).join(" + ")}`
                : ""
            }`
          : null
        return (
          <div className="max-w-4xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight flex items-center gap-3">
              <Palette size={28} className="text-text-muted" /> Visual Style
            </h2>
            <p className="text-text-secondary mb-6 border-b border-border-default pb-8">
              Pick a primary theme and layer modifiers. Combine styles like{" "}
              <span className="text-text-primary font-medium">
                Dark Luxury + Glassmorphism + Bento + Kinetic
              </span>{" "}
              — curated for 2026 aesthetics.
            </p>

            {/* Summary pill */}
            {comboStr && (
              <div className="mb-8 flex items-center gap-2 text-xs font-mono bg-surface-2 border border-border-default rounded-md px-4 py-3">
                <Sparkles size={14} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">COMBO:</span>
                <span className="text-text-primary truncate">{comboStr}</span>
                <button
                  onClick={() => updateState("theme", "")}
                  className="ml-auto text-text-muted hover:text-text-primary underline"
                >
                  clear
                </button>
              </div>
            )}

            {/* 10 Major Themes */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <Layers size={16} className="text-text-muted" />
                <h3 className="text-sm font-semibold tracking-widest uppercase text-text-secondary">
                  Primary Theme — pick one
                </h3>
                <span className="text-xs text-text-muted ml-2">10 styles</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {THEMES.map((t) => (
                  <ThemeCard
                    key={t.id}
                    name={t.name}
                    feel={t.feel}
                    traits={t.traits}
                    accent={t.accent}
                    selected={state.theme === t.id}
                    onClick={() => updateState("theme", t.id)}
                  />
                ))}
              </div>
              <p className="text-xs text-text-muted mt-3 italic">
                Minimalist, Glassmorphism, Bento, Neo-Brutalism, Editorial,
                Swiss, Neumorphism, Retro/Y2K, 3D Immersive, Maximalist
              </p>
            </div>

            {/* Modifiers */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Wand2 size={16} className="text-text-muted" />
                <h3 className="text-sm font-semibold tracking-widest uppercase text-text-secondary">
                  Modifiers — fine-tune the feel
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODIFIER_GROUPS.map((g) => (
                  <div
                    key={g.id}
                    className="bg-surface-1 border border-border-default rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-text-muted text-xs w-5 text-center">
                        {g.icon}
                      </span>
                      <span className="text-xs font-semibold tracking-widest uppercase text-text-secondary">
                        {g.label}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {g.options.map((opt) => {
                        const active = state.themeModifiers[g.id] === opt.value
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setThemeModifier(g.id, opt.value)}
                            className={`flex-1 px-2 py-2.5 rounded-md text-xs font-medium border transition-colors ${
                              active
                                ? "bg-text-primary text-background border-text-primary"
                                : "bg-surface-2 border-border-default text-text-secondary hover:border-text-muted hover:text-text-primary"
                            }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-3">
                Modifiers layer on top — e.g. Dark + Colorful + Elevated +
                Kinetic gives a premium AI-era feel. Mix Minimalist with
                Monochrome + Subtle for calm.
              </p>
            </div>

            {/* Sub themes / additional layers */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-text-muted" />
                <h3 className="text-sm font-semibold tracking-widest uppercase text-text-secondary">
                  Additional Layers — optional, multi-select
                </h3>
              </div>
              <p className="text-xs text-text-muted mb-3">
                Add one or two supporting styles. Don&apos;t overmix — 1
                dominant + 1-2 supports works best.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {SUB_THEMES.map((s) => {
                  const active = state.themeExtras.includes(s.id)
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleThemeExtra(s.id)}
                      className={`px-3 py-3 rounded-md border text-left flex items-center gap-3 transition-all ${
                        active
                          ? "bg-surface-3 border-text-secondary text-text-primary"
                          : "bg-surface-1 border-border-default text-text-secondary hover:border-text-muted hover:text-text-primary"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 min-w-[16px] border rounded flex items-center justify-center ${
                          active
                            ? "border-text-primary bg-text-primary text-background"
                            : "border-border-strong"
                        }`}
                      >
                        {active && <Check size={12} strokeWidth={4} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm leading-none truncate">
                          {s.label}
                        </div>
                        <div className="text-[11px] text-text-muted truncate">
                          {s.desc}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Typography / Fonts ── */}
            <div className="border-t border-border-default pt-10 mb-10">
              <div className="flex items-center gap-3 mb-2">
                <Type size={22} className="text-text-muted" />
                <h3 className="text-xl font-bold tracking-tight">Typography</h3>
                <span className="text-xs bg-surface-2 border border-border-default text-text-muted px-2 py-1 rounded-full ml-2">
                  20 fonts · 10 pairings
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-6">
                Choose a font system. The curated trio right now is{" "}
                <span className="text-text-primary font-medium">
                  Geist + Inter + Satoshi
                </span>{" "}
                — Geist for technical, Inter as neutral, Satoshi as distinctive.
                For Blueprint, recommended:{" "}
                <span className="text-text-primary">
                  Headings: Geist · Body: Geist · Mono: Geist Mono
                </span>{" "}
                (Vercel/Linear aesthetic).
              </p>

              {/* Current selection pill */}
              <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-mono bg-surface-2 border border-border-default rounded-md px-4 py-3">
                <ALargeSmall size={14} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">TYPE:</span>
                <span className="text-text-primary">
                  Heading → <b>{state.fontHeading}</b> · Body →{" "}
                  <b>{state.fontBody}</b> · Mono → <b>{state.fontMono}</b>
                </span>
                {state.fontPairing && (
                  <span className="ml-auto text-text-muted hidden md:inline">
                    Preset:{" "}
                    {FONT_PAIRINGS.find((p) => p.id === state.fontPairing)
                      ?.label || state.fontPairing}
                  </span>
                )}
              </div>

              {/* Font Pairings — 10 presets */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-text-muted" />
                  <h4 className="text-xs font-semibold tracking-widest uppercase text-text-secondary">
                    Font Pairings — pick a preset
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {FONT_PAIRINGS.map((pair) => {
                    const active = state.fontPairing === pair.id
                    return (
                      <button
                        key={pair.id}
                        onClick={() => applyFontPairing(pair.id)}
                        className={`p-3.5 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${
                          active
                            ? "bg-text-primary text-background border-text-primary shadow-md"
                            : "bg-surface-1 border-border-default hover:border-border-strong hover:bg-surface-2"
                        }`}
                      >
                        <div
                          className={`text-xs font-bold tracking-wide ${
                            active ? "text-background" : "text-text-primary"
                          }`}
                        >
                          {pair.label}
                        </div>
                        <div
                          className={`text-[11px] ${
                            active ? "text-background/70" : "text-text-muted"
                          }`}
                        >
                          {pair.vibe} — H: {pair.heading} · B: {pair.body} · M:{" "}
                          {pair.mono}
                        </div>
                        <div
                          className={`mt-1 flex items-baseline gap-2 ${
                            active ? "text-background" : "text-text-primary"
                          }`}
                        >
                          <span
                            className="text-lg font-semibold leading-none"
                            style={{
                              fontFamily: FONTS.find(
                                (f) => f.name === pair.heading,
                              )?.fallback,
                            }}
                          >
                            {pair.heading.split(" ")[0]}
                          </span>
                          <span className="text-xs opacity-60">+</span>
                          <span
                            className="text-sm"
                            style={{
                              fontFamily: FONTS.find(
                                (f) => f.name === pair.body,
                              )?.fallback,
                            }}
                          >
                            {pair.body.split(" ")[0]}
                          </span>
                          <span className="text-[11px] font-mono opacity-50 ml-auto">
                            {pair.mono}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-text-muted mt-2">
                  Pairings seen in Awwwards / curated modern sites (Geist+Neue
                  Montreal, Inter+Neue Montreal, Geist Mono+Inter, etc.).
                </p>
              </div>

              {/* Category filter */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {[
                  "All",
                  "Tech / AI",
                  "Tech / SaaS",
                  "Premium",
                  "Creative",
                  "SaaS",
                  "Editorial",
                  "Minimal",
                  "Display",
                  "Marketing",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFontFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      fontFilter === cat
                        ? "bg-text-primary text-background border-text-primary"
                        : "bg-surface-1 border-border-default text-text-secondary hover:border-text-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Font Gallery — 20 fonts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                {(fontFilter === "All"
                  ? FONTS
                  : FONTS.filter(
                      (f) =>
                        f.category === fontFilter ||
                        (fontFilter === "Tech / AI" &&
                          f.category.includes("Tech")),
                    )
                ).map((font) => {
                  const isHeading = state.fontHeading === font.name
                  const isBody = state.fontBody === font.name
                  const isSelected = isHeading && isBody
                  const isMono = state.fontMono === font.name
                  return (
                    <button
                      key={font.id}
                      onClick={() => {
                        setState((prev) => ({
                          ...prev,
                          fontHeading: font.name,
                          fontBody: font.name,
                          fontPairing: "",
                        }))
                      }}
                      className={`rounded-lg border p-4 text-left flex flex-col gap-2 transition-all ${
                        isSelected
                          ? "bg-text-primary text-background border-text-primary shadow"
                          : isHeading || isBody
                            ? "bg-surface-3 border-text-secondary text-text-primary"
                            : "bg-surface-1 border-border-default hover:border-border-strong text-text-primary"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="text-3xl font-semibold leading-none"
                          style={{ fontFamily: font.fallback }}
                        >
                          {font.name === "Geist"
                            ? "Geist"
                            : font.name === "Neue Montreal"
                              ? "Neue M"
                              : font.name.split(" ")[0]}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-background text-text-primary flex items-center justify-center">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                          {!isSelected && (isHeading || isBody) && (
                            <span className="text-[10px] border border-current rounded px-1 py-0.5">
                              active
                            </span>
                          )}
                          {isMono && (
                            <span className="text-[10px] bg-surface-2 border border-border-default rounded px-1 py-0.5">
                              mono
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`text-xs ${
                          isSelected ? "text-background/80" : "text-text-muted"
                        }`}
                      >
                        Aa · The quick brown fox
                      </div>
                      <div
                        className={`text-xs font-medium leading-none ${
                          isSelected ? "text-background" : "text-text-primary"
                        }`}
                      >
                        {font.name}
                      </div>
                      <div
                        className={`text-[11px] leading-snug ${
                          isSelected
                            ? "text-background/70"
                            : "text-text-secondary"
                        }`}
                      >
                        {font.vibe}
                      </div>
                      <div
                        className={`text-[11px] ${
                          isSelected ? "text-background/60" : "text-text-muted"
                        }`}
                      >
                        Best for: {font.bestFor} · {font.category}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            setState((p) => ({
                              ...p,
                              fontHeading: font.name,
                              fontPairing: "",
                            }))
                          }}
                          className={`text-[10px] px-2 py-1 rounded border ${
                            state.fontHeading === font.name
                              ? "bg-background text-text-primary border-background"
                              : "bg-surface-2 border-border-default hover:border-text-muted"
                          }`}
                        >
                          H
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            setState((p) => ({
                              ...p,
                              fontBody: font.name,
                              fontPairing: "",
                            }))
                          }}
                          className={`text-[10px] px-2 py-1 rounded border ${
                            state.fontBody === font.name
                              ? "bg-background text-text-primary border-background"
                              : "bg-surface-2 border-border-default hover:border-text-muted"
                          }`}
                        >
                          Body
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            setState((p) => ({
                              ...p,
                              fontMono:
                                font.name === "Clash Display"
                                  ? "Geist Mono"
                                  : font.name,
                              fontPairing: "",
                            }))
                          }}
                          className={`text-[10px] px-2 py-1 rounded border ${
                            state.fontMono === font.name
                              ? "bg-background text-text-primary border-background"
                              : "bg-surface-2 border-border-default hover:border-text-muted"
                          }`}
                        >
                          Mono
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-text-muted mb-4">
                Click a card to set Heading + Body together. Use{" "}
                <b>H / Body / Mono</b> chips to set each role individually.
                Pairings above auto-set all three.
              </p>

              {/* Curated categories help */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="bg-surface-1 border border-border-default rounded-lg p-3">
                  <div className="text-xs font-semibold text-text-primary mb-1">
                    🔥 For Tech / AI
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    Geist, Inter, Space Grotesk, IBM Plex Sans, Manrope
                  </div>
                </div>
                <div className="bg-surface-1 border border-border-default rounded-lg p-3">
                  <div className="text-xs font-semibold text-text-primary mb-1">
                    🏆 For Premium / Luxury
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    Neue Montreal, Suisse Intl, Aeonik, GT America, Helvetica
                    Now, Graphik
                  </div>
                </div>
                <div className="bg-surface-1 border border-border-default rounded-lg p-3">
                  <div className="text-xs font-semibold text-text-primary mb-1">
                    🎨 For Creative / Editorial
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    Satoshi, Switzer, Instrument Sans, General Sans + Editorial
                    New, Instrument Serif
                  </div>
                </div>
              </div>

              {/* Mono selector */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal size={14} className="text-text-muted" />
                  <h4 className="text-xs font-semibold tracking-widest uppercase text-text-secondary">
                    Monospace — for code / labels / metadata
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Geist Mono",
                    "JetBrains Mono",
                    "IBM Plex Mono",
                    "GT America Mono",
                  ].map((mono) => (
                    <button
                      key={mono}
                      onClick={() =>
                        setState((p) => ({
                          ...p,
                          fontMono: mono,
                          fontPairing: "",
                        }))
                      }
                      className={`px-3 py-2 rounded-md border text-xs font-mono ${
                        state.fontMono === mono
                          ? "bg-text-primary text-background border-text-primary"
                          : "bg-surface-1 border-border-default text-text-secondary hover:border-text-muted"
                      }`}
                    >
                      {mono}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted mt-2">
                  Blueprint default: <b>Geist Mono</b> for technical metadata —
                  pairs best with Geist/Inter headings.
                </p>
              </div>
            </div>

            {/* Help card */}
            <div className="bg-surface-1 border border-border-strong rounded-lg p-4 flex gap-3 mb-6">
              <div className="text-text-muted mt-0.5">
                <Palette size={18} />
              </div>
              <div className="text-sm">
                <div className="font-medium text-text-primary mb-1">
                  How to combine Theme + Type
                </div>
                <div className="text-text-secondary leading-relaxed text-xs">
                  Pick 1 theme + 5 modifiers + optionally 1-2 layers + a font
                  pairing. Example:{" "}
                  <span className="text-text-primary">
                    Minimalist + Dark + Monochrome + Flat + Geist + Geist Mono
                  </span>{" "}
                  = calm dev tool.{" "}
                  <span className="text-text-primary">
                    Glassmorphism + Liquid Glass + Aurora + Space Grotesk +
                    Inter
                  </span>{" "}
                  = futuristic AI product. Injected into AI prompt as{" "}
                  <span className="font-mono text-text-muted">
                    # TYPOGRAPHY
                  </span>{" "}
                  +{" "}
                  <span className="font-mono text-text-muted">
                    # VISUAL STYLE
                  </span>
                  .
                </div>
              </div>
            </div>

            {renderCustomSectionsForPage("theme")}
            {renderWizardNav()}
          </div>
        )

      case "skills":
        return renderSkills()

      case "prompt":
        const generatedPrompt = generatePrompt()
        return (
          <div className="max-w-4xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              AI Implementation Prompt
            </h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">
              Copy this prompt and paste it into ChatGPT, Claude, or your
              preferred AI to generate your project documentation.
            </p>

            <div className="relative bg-surface-1 border border-border-default rounded-md">
              <div className="flex justify-between items-center px-4 py-2 border-b border-border-subtle bg-surface-2 rounded-t-md">
                <div className="font-mono text-xs text-text-muted flex items-center gap-2">
                  <Terminal size={14} /> master_prompt.txt
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-2 text-xs font-medium bg-surface-3 hover:bg-border-default text-text-primary px-3 py-1.5 rounded transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-green-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Prompt
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-sm text-text-secondary font-mono overflow-x-auto whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {generatedPrompt}
              </pre>
            </div>

            {renderWizardNav()}
          </div>
        )

      case "response":
        return (
          <div className="max-w-4xl animate-in pb-20">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              Process AI Response
            </h2>
            <p className="text-text-secondary mb-10 border-b border-border-default pb-8">
              Paste the raw markdown response generated by the AI here to parse
              your blueprint files.
            </p>

            <Textarea
              label="Paste AI Response"
              placeholder="--- FILE: PROJECT_CONTEXT.md ---\n..."
              value={state.aiResponse}
              onChange={(e: any) => updateState("aiResponse", e.target.value)}
              rows={15}
            />

            <div className="flex justify-between mt-12 pt-6 border-t border-border-subtle">
              <button
                onClick={() => setPhase("prompt")}
                className="text-text-secondary px-4 py-3 font-medium flex items-center gap-2 hover:text-text-primary"
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={processResponse}
                disabled={!state.aiResponse.trim()}
                className="bg-text-primary text-background px-6 py-3 rounded-md font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Parse Blueprint <Check size={18} />
              </button>
            </div>
          </div>
        )

      case "blueprint":
        return (
          <div className="max-w-5xl animate-in pb-20">
            <div className="flex justify-between items-end mb-10 border-b border-border-default pb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 tracking-tight">
                  Project Blueprint
                </h2>
                <p className="text-text-secondary">
                  Your architecture is ready. Review your documents and download
                  the project initiator.
                </p>
              </div>
              <button
                onClick={downloadZip}
                className="bg-text-primary text-background px-6 py-3 rounded-md font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Download size={18} /> Download ZIP
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* File List */}
              <div className="lg:col-span-1 border border-border-default rounded-md bg-surface-1 overflow-hidden flex flex-col max-h-[600px]">
                <div className="px-4 py-3 border-b border-border-subtle bg-surface-2 font-mono text-xs text-text-muted">
                  FILES ({parsedFiles.length})
                </div>
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
                  {parsedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 rounded cursor-pointer flex items-center gap-2"
                    >
                      <FileCode size={14} />
                      <span className="truncate">{f.name}</span>
                    </div>
                  ))}
                  {parsedFiles.length === 0 && (
                    <div className="p-4 text-sm text-text-muted italic">
                      No files parsed.
                    </div>
                  )}
                </div>
              </div>

              {/* Markdown Preview */}
              <div className="lg:col-span-3 border border-border-default rounded-md bg-surface-1 overflow-hidden flex flex-col max-h-[600px]">
                <div className="px-4 py-3 border-b border-border-subtle bg-surface-2 font-mono text-xs text-text-muted flex justify-between">
                  <span>PREVIEW</span>
                  {parsedFiles.length > 0 && <span>{parsedFiles[0].name}</span>}
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  {parsedFiles.length > 0 ? (
                    <pre className="text-sm font-mono text-text-primary whitespace-pre-wrap">
                      {parsedFiles[0].content}
                    </pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-text-muted">
                      Select a file to preview
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-start mt-12 pt-6 border-t border-border-subtle">
              <button
                onClick={() => setPhase("response")}
                className="text-text-secondary px-4 py-3 font-medium flex items-center gap-2 hover:text-text-primary"
              >
                <ChevronLeft size={18} /> Back to Response
              </button>
            </div>
          </div>
        )

      case "admin":
        return renderAdmin()

      default:
        // Handle fully dynamic custom pages
        const customPage = config.customPages.find((p) => p.id === phase)
        if (customPage) {
          return (
            <div className="max-w-3xl animate-in pb-20">
              <h2 className="text-3xl font-bold mb-2 tracking-tight">
                {customPage.title}
              </h2>
              <p className="text-text-secondary mb-10 border-b border-border-default pb-8">
                Provide custom details for this stage.
              </p>

              {renderCustomSectionsForPage(customPage.id)}
              {renderWizardNav()}
            </div>
          )
        }
        return null
    }
  }

  if (phase === "landing") {
    return (
      <div className="min-h-screen bg-background text-text-primary">
        {/* Keep theme toggle accessible even on landing */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = state.themeModifiers.mode === "dark" ? "light" : "dark"
              setThemeModifier("mode", next)
            }}
            aria-label="Toggle theme"
          >
            {state.themeModifiers.mode === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </Button>
        </div>
        {renderLanding()}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {renderSidebar()}
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-surface-1 border-b border-border-default flex items-center gap-3 px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
          <Layout size={18} />
        </Button>
        <span className="font-mono font-bold text-sm tracking-tight">BLUEPRINT</span>
        <span className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] hidden sm:inline">
            {phase}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const next = state.themeModifiers.mode === "dark" ? "light" : "dark"
              setThemeModifier("mode", next)
            }}
            aria-label="Toggle theme"
          >
            {state.themeModifiers.mode === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </Button>
        </span>
      </div>
      <main className="flex-1 md:ml-64 p-6 md:p-12 overflow-y-auto pt-16 md:pt-12">
        {renderContent()}
      </main>
    </div>
  )
}
