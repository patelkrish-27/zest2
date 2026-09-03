// src/lib/skillsCatalog.ts — single source of truth for SKILLS_CATALOG (15 items)
// Shared by App.tsx (frontend) and src/backend/services/blueprintService.ts (backend).
// Mirrors src/App.tsx:150-449 exactly; update both if you add/remove a skill.
//
// No React, no DOM — pure data module so the backend can import without bundling
// the wizard. App.tsx re-exports it for backward compatibility with existing
// imports (`import { SKILLS_CATALOG } from "@/App"`).
//
// Categories present (audit-friendly): UI Library, Backend, Frontend,
// Design, Testing, Orchestration. Filter bar derives `categories` dynamically.

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

export const SKILLS_CATALOG: readonly Skill[] = [
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
    installCmd: "npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills",
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
    description: "Generate new Chakra UI components and layouts with best-practice patterns.",
    category: "UI Library",
    docsUrl: "docs/components/concepts/overview",
    source: "skills/chakra-ui-builder/SKILL.md",
    rawUrl: "https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder",
    package: "@chakra-ui/react",
    installCmd: "npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder",
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
    rawUrl: "https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-migrate",
    package: "@chakra-ui/react",
    installCmd: "npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-migrate",
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
    rawUrl: "https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-refactor",
    package: "@chakra-ui/react",
    installCmd: "npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-refactor",
    concepts: "Refactor · Best practices",
    highlights: ["Prop hygiene", "Slot recipes", "Composition cleanup"],
  },
  {
    id: "shadcn-ui",
    name: "shadcn/ui",
    description: "Accessible, composable React components built on Radix UI + Tailwind CSS.",
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
    description: "Animated, modern React + Tailwind + Framer Motion components.",
    category: "UI Library",
    docsUrl: "ui.aceternity.com/components",
    source: "skills/aceternity-ui/SKILL.md",
    rawUrl: "https://github.com/secondsky/claude-skills",
    package: "aceternity-ui",
    installCmd: "npx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui",
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
    description: "Overall meta UI skill aggregating modern copy-paste React + Tailwind patterns.",
    category: "UI Library",
    docsUrl: "github.com/ibelick/ui-skills",
    source: "skills/ui-skills-root/SKILL.md",
    rawUrl: "https://github.com/ibelick/ui-skills",
    package: "ui-skills",
    installCmd: "npx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root",
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
    description: "Micro-interactions, skeletons, optimistic UI and feel-better UX polish.",
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
    description: "Supabase Postgres/Auth/Storage/Realtime/Edge Functions skills for correct, secure usage.",
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
    docsUrl: "skillsmp.com/creators/affaan-m/ecc/agents-skills-frontend-patterns",
    source: "skills/frontend-patterns/SKILL.md",
    rawUrl: "https://github.com/affaan-m/ECC/tree/main/.agents/skills/frontend-patterns",
    package: "frontend-patterns",
    installCmd: "npx skills add https://github.com/affaan-m/ECC --skill frontend-patterns",
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
    description: "API design, repository/service layers, DB optimization, caching, auth, rate-limit, queues and logging.",
    category: "Backend",
    docsUrl: "skillsmp.com/creators/affaan-m/ecc/agents-skills-backend-patterns",
    source: "skills/backend-patterns/SKILL.md",
    rawUrl: "https://github.com/affaan-m/ECC/tree/main/.agents/skills/backend-patterns",
    package: "backend-patterns",
    installCmd: "npx skills add https://github.com/affaan-m/ECC --skill backend-patterns",
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
    docsUrl: "skillsmp.com/creators/nextlevelbuilder/ui-ux-pro-max-skill/claude-skills-ui-styling",
    source: "skills/ui-styling/SKILL.md",
    rawUrl: "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/ui-styling",
    package: "ui-styling",
    installCmd: "npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-styling",
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
    docsUrl: "skillsmp.com/creators/agents365-ai/drawio-skill/skills-drawio-skill",
    source: "skills/drawio-skill/SKILL.md",
    rawUrl: "https://github.com/Agents365-ai/drawio-skill/tree/main/skills/drawio-skill",
    package: "drawio-skill",
    installCmd: "npx skills add https://github.com/Agents365-ai/drawio-skill --skill drawio-skill",
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
    description: "Codex/Claude/Amp/Pi/Kimi review helper with TruffleHog secret scan, P0/P3 triage. Use when explicitly requested.",
    category: "Testing",
    docsUrl: "skillsmp.com/creators/openclaw/openclaw/agents-skills-autoreview",
    source: "skills/autoreview/SKILL.md",
    rawUrl: "https://github.com/openclaw/openclaw/tree/main/.agents/skills/autoreview",
    package: "autoreview",
    installCmd: "npx skills add https://github.com/openclaw/openclaw --skill autoreview",
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
    docsUrl: "skillsmp.com/creators/ruvnet/ruflo/agents-skills-agent-orchestrator-task",
    source: "skills/agent-orchestrator-task/SKILL.md",
    rawUrl: "https://github.com/ruvnet/ruflo/tree/main/.agents/skills/agent-orchestrator-task",
    package: "agent-orchestrator-task",
    installCmd: "npx skills add https://github.com/ruvnet/ruflo --skill agent-orchestrator-task",
    concepts: "Orchestration · Decomposition · Synthesis",
    highlights: [
      "Task decomposition & dependency graph",
      "Parallel/sequential/adaptive strategy",
      "TodoWrite progress + memory_store",
      "npx skills --skill agent-orchestrator-task",
    ],
  },
] as const

export default SKILLS_CATALOG
