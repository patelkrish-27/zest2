# shadcn/ui — Components Skill

> **Source:** `shadcn/ui` — https://ui.shadcn.com
> **Upstream skill:** `shadcn/ui` (via `skills` CLI)
> **Install (docs):** `pnpm dlx skills add shadcn/ui`

## Concept

**shadcn/ui** — Accessible, composable React components built on Radix UI + Tailwind CSS. Copy-paste primitives (not an npm package) that live in your codebase for full control and theming.

## What this skill provides

When this skill is **installed** in Blueprint, the project prompt instructs code generation to:

- Use **shadcn/ui** patterns as the primary UI primitive layer (Radix + Tailwind)
- Prefer `components/ui/*` primitives (Button, Input, Card, Dialog, Dropdown, etc.) over raw HTML
- Follow shadcn theming (CSS variables, `cn` utility, `cva` variants) instead of ad-hoc styles
- Respect accessibility defaults from Radix primitives

> `shadcn/ui` is **not** installed as a traditional npm dependency — components are added via the shadcn CLI into your repo. The skill gives the AI the correct component API and installation context.

## Install — how to add (no auto-download)

This project does **not** auto-download the skill. Blueprint only injects the install instruction into the prompt + exported zip so you can run it when ready.

```bash
# via skills CLI (recommended, adds the agent skill + component context)
pnpm dlx skills add shadcn/ui

# alternatives — also work
npx skills add shadcn/ui
yarn dlx skills add shadcn/ui
bunx skills add shadcn/ui
```

Once the skill is added, initialize / add components with the shadcn CLI:

```bash
# Init shadcn in your project (if not already done)
pnpm dlx shadcn@latest init

# Add individual components as needed
pnpm dlx shadcn@latest add button card dialog input select tabs tooltip
```

## Component catalogue (shadcn/ui)

**Form:** Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Label, Form
**Layout:** Card, Separator, Aspect Ratio, Resizable, Scroll Area
**Navigation:** Breadcrumb, Menubar, Navigation Menu, Pagination, Tabs, Dropdown Menu
**Overlay:** Dialog, Drawer, Popover, Tooltip, Hover Card, Context Menu, Alert Dialog, Sheet, Command
**Feedback:** Alert, Toast (Sonner), Progress, Skeleton, Badge
**Data Display:** Table, Avatar, Calendar, Chart, Carousel
**Other:** Accordion, Collapsible, Toggle, Toggle Group, etc.

See https://ui.shadcn.com/docs/components for the full list — treat this skill as authorization to use any of them.

## Usage rules for generated code

1. **Import from `components/ui/*`** — `import { Button } from "@/components/ui/button"`
2. **Use `cn` utility for conditional classes** — `import { cn } from "@/lib/utils"`
3. **Style via Tailwind + `cva` variants**, not external CSS for shadcn-owned primitives
4. **Do not re-implement** Radix primitives (Dialog, Popover, Dropdown) with divs — use shadcn component
5. **Theme via CSS variables** — `bg-background`, `text-foreground`, `border`, etc., as defined by shadcn init

## Prompt injection

When installed, Blueprint injects:

```md
# SKILLS
- shadcn/ui [shadcn-ui] — Accessible, composable React components built on Radix UI + Tailwind CSS. Use shadcn/ui components as primary UI primitives. — install: `pnpm dlx skills add shadcn/ui`
```

and auto-adds `shadcn/ui` to `FRONTEND > UI Libraries` if selected.

## Links

- Docs: https://ui.shadcn.com
- GitHub: https://github.com/shadcn-ui/ui
- Skill install: `pnpm dlx skills add shadcn/ui`

## Blueprint UI

Enable this skill from the **Skills** phase (step 06) — toggle `shadcn/ui`. It is **not downloaded** automatically; the download ZIP will include `SKILLS.md` with this install command so you can add it after scaffolding.

## Included in ZIP

When you download the Blueprint ZIP (Blueprint phase → Download ZIP), a `SKILLS.md` file is added listing:

```
pnpm dlx skills add shadcn/ui
```

plus any other selected skills, so the recipient can install skills post-download without extra steps.
