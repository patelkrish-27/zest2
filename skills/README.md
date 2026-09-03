# Skills

Project-level **skills** are reusable capability packs that the Blueprint planning wizard can inject into the generated AI prompt and scaffold.

## Structure

```
skills/
  README.md                # this file
  chakra-ui/
    SKILL.md               # Chakra UI components overview (docs/components/concepts/overview)
  chakra-ui-builder/
    SKILL.md               # Builder — scaffold components/layouts
  chakra-ui-migrate/
    SKILL.md               # Migrate — v2→v3 / Tailwind→Chakra
  chakra-ui-refactor/
    SKILL.md               # Refactor — DRY recipes/slotRecipes
  shadcn-ui/
    SKILL.md               # shadcn/ui — Radix + Tailwind primitives (pnpm dlx skills add shadcn/ui)
  aceternity-ui/
    SKILL.md               # Aceternity UI — animated effects (npx skills add --skill aceternity-ui)
  ui-skills-root/
    SKILL.md               # UI Skills Root (ibelick) — overall meta skill (npx skills add --skill ui-skills-root)
  watermelon-ui/
    SKILL.md               # Watermelon — make-interfaces-feel-better (npx skills add --skill make-interfaces-feel-better)
  supabase/
    SKILL.md               # Supabase — agent-skills (npx skills add supabase/agent-skills)
  frontend-patterns/
    SKILL.md               # Frontend Patterns — React/Next best practices (npx skills add --skill frontend-patterns)
    agents/openai.yaml     # companion: OpenAI interface metadata
  backend-patterns/
    SKILL.md               # Backend Patterns — Node/Express/Next API best practices (npx skills add --skill backend-patterns)
    agents/openai.yaml     # companion: OpenAI interface metadata
  ui-styling/
    SKILL.md               # UI Styling — shadcn + Tailwind + canvas (npx skills add --skill ui-styling)
    references/            # 7 md: shadcn-* + tailwind-* + canvas-design-system
    scripts/               # shadcn_add.py + tailwind_config_gen.py + tests
    canvas-fonts/          # 64 TTF + OFL licenses
    LICENSE.txt
  drawio-skill/
    SKILL.md               # Draw.io Architecture Studio (npx skills add --skill drawio-skill)
    references/            # 20 md: toolbox, xml-authoring, diagram-types, security...
    scripts/               # 41 py: diagramctl, autolayout, importers, etc.
    data/                  # shape-index, lobe/databricks icons, IR schema
    styles/                # 5 built-in presets + schema.json
    agents/openai.yaml
  autoreview/
    SKILL.md               # Autoreview — structured Codex/Claude review (npx skills add --skill autoreview)
    AGENTS.md + CLAUDE.md
    scripts/               # autoreview (256 KB) + harness (ps1/py)
    tests/                 # hardening + fixtures
  agent-orchestrator-task/
    SKILL.md               # Orchestrator — task decomposition & parallel planning (npx skills add --skill agent-orchestrator-task)
  <skill-id>/
    SKILL.md               # each skill is a folder with a SKILL.md
```

### Install (upstream `skills` CLI)

```bash
# All Chakra UI skills
npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills

# Single Chakra skill
npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder
npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-migrate
npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-refactor

# shadcn/ui (no auto-download — just documents how to install; ZIP includes SKILLS.md)
pnpm dlx skills add shadcn/ui
# alternatives: npx skills add shadcn/ui | yarn dlx skills add shadcn/ui | bunx skills add shadcn/ui

# Aceternity UI — animated effects (no auto-download; ZIP includes SKILLS.md)
npx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui
# alternatives: pnpm dlx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui

# UI Skills — Root (ibelick) — overall meta skill (no auto-download; ZIP includes SKILLS.md)
npx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root
# alternatives: pnpm dlx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root

# Watermelon — Make Interfaces Feel Better (no auto-download; ZIP includes SKILLS.md)
npx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better
# direct path: npx skills add https://github.com/WatermelonCorp/watermelon-platform/tree/main/skills/make-interfaces-feel-better
# alternatives: pnpm dlx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better

# Supabase — Agent Skills (no auto-download; ZIP includes SKILLS.md)
npx skills add supabase/agent-skills
# alternative: npx skills add https://github.com/supabase/agent-skills
# alt: pnpm dlx skills add supabase/agent-skills

# Frontend Patterns — React/Next best practices (affaan-m/ECC)
npx skills add https://github.com/affaan-m/ECC --skill frontend-patterns
# verified: Socket 0 alerts, Snyk Low Risk; companion: agents/openai.yaml

# Backend Patterns — Node/Express/Next API best practices (affaan-m/ECC)
npx skills add https://github.com/affaan-m/ECC --skill backend-patterns
# verified: Socket 0 alerts, Snyk Low Risk; companion: agents/openai.yaml

# UI Styling — shadcn + Tailwind + canvas (nextlevelbuilder/ui-ux-pro-max-skill)
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-styling
# verified: Socket 0 alerts, Snyk Low Risk; 98 files incl. references/scripts/canvas-fonts

# Draw.io — Architecture Studio (Agents365-ai/drawio-skill)
npx skills add https://github.com/Agents365-ai/drawio-skill --skill drawio-skill
# verified: Socket 0 alerts, Snyk Low Risk; 75 files incl. data/references/scripts/styles

# Autoreview — Structured Code Review (openclaw/openclaw)
npx skills add https://github.com/openclaw/openclaw --skill autoreview
# verified: Socket 0 alerts, Snyk Med Risk / Gen High Risk — sends diffs to Codex/Claude/Amp; TruffleHog secret scan, 13 files incl. scripts/tests

# Agent Orchestrator Task — central coordination (ruvnet/ruflo)
npx skills add https://github.com/ruvnet/ruflo --skill agent-orchestrator-task
# verified: CLI registry name mismatch (ruflo vs agent-orchestrator-task); manual copy preserves 1-file structure; hooks echo + memory_store, no destructive shell
```

### Skill contract (`SKILL.md`)

Each skill must contain:

- `title` / `description` — human summary
- `Source` + `URL` + `Raw` — provenance (like `docs/components/concepts/overview` for Chakra)
- **What this skill provides** — what the AI should do when installed
- **Install** — package + setup snippet
- **Usage rules** — constraints for generated code
- **Prompt injection** — exact markdown appended to the master prompt
- **Links** — docs, repo, source MDX

The Blueprint UI reads `src/App.tsx:SKILLS_CATALOG` (seeded from this folder) and lets users toggle skills in the **Skills** phase. Selected skills are stored in `AppState.selectedSkills` and emitted in `generatePrompt()` under `# SKILLS`.

## Adding a new skill

1. Create `skills/<id>/SKILL.md` following `skills/chakra-ui/SKILL.md` as template.
2. Register it in `src/App.tsx` → `SKILLS_CATALOG` (and optionally `INITIAL_CONFIG.skillsCatalog` if admin-editable).
3. (Optional) Wire auto-selection: e.g. selecting `Chakra UI` skill auto-adds `Chakra UI` to `uiLibraries`.

### Example frontmatter

```md
# My Skill — Title

> Source: apps/.../overview.mdx
> URL: docs/...
> Raw: https://raw.githubusercontent.com/...

## Concept
...
```

## Current catalog

| Skill | ID | Category | Install |
|-------|----|----------|---------|
| Chakra UI | `chakra-ui` | UI Library | `npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills` |
| Chakra UI — Builder | `chakra-ui-builder` | UI Library | `npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder` |
| Chakra UI — Migrate | `chakra-ui-migrate` | UI Library | `npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-migrate` |
| Chakra UI — Refactor | `chakra-ui-refactor` | UI Library | `npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-refactor` |
| shadcn/ui | `shadcn-ui` | UI Library | `pnpm dlx skills add shadcn/ui` *(ZIP includes SKILLS.md — not auto-downloaded)* |
| Aceternity UI | `aceternity-ui` | UI Library | `npx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui` *(ZIP — not auto-downloaded)* |
| UI Skills — Root (ibelick) | `ui-skills-root` | UI Library | `npx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root` *(meta · ZIP — not auto-downloaded)* |
| Watermelon UI — Make Interfaces Feel Better | `watermelon-ui` | UI Library | `npx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better` *(ZIP — not auto-downloaded)* |
| Supabase — Agent Skills | `supabase` | Backend | `npx skills add supabase/agent-skills` *(DB/RSL · ZIP — not auto-downloaded)* |
| Frontend Patterns (React/Next) | `frontend-patterns` | Frontend | `npx skills add https://github.com/affaan-m/ECC --skill frontend-patterns` *(Socket 0 · Snyk Low Risk)* |
| Backend Patterns (Node/Express) | `backend-patterns` | Backend | `npx skills add https://github.com/affaan-m/ECC --skill backend-patterns` *(Socket 0 · Snyk Low Risk)* |
| UI Styling (ui-ux-pro-max) | `ui-styling` | Frontend | `npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-styling` *(Socket 0 · Snyk Low Risk · 98 files)* |
| Draw.io — Architecture Studio | `drawio-skill` | Design | `npx skills add https://github.com/Agents365-ai/drawio-skill --skill drawio-skill` *(Socket 0 · Snyk Low Risk · 75 files)* |
| Autoreview — Structured Code Review | `autoreview` | Testing | `npx skills add https://github.com/openclaw/openclaw --skill autoreview` *(Socket 0 · Snyk Med Risk · Gen High Risk — review sends diffs to LLM)* |
| Agent Orchestrator — Task | `agent-orchestrator-task` | Orchestration | `npx skills add https://github.com/ruvnet/ruflo --skill agent-orchestrator-task` *(single-file · manual fallback — registry shows ruflo)* |

> To propose a new skill, open a PR adding a folder + catalog entry — no build step required.
