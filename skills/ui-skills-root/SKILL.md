# UI Skills (ibelick) — Root Skill

> **Source:** `ibelick/ui-skills` — root meta-skill
> **Upstream:** https://github.com/ibelick/ui-skills
> **Install:** `npx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root`

## Concept

**ui-skills (ibelick)** — Overall / meta UI skill aggregating modern, copy-paste React + Tailwind patterns. The `ui-skills-root` skill is the entrypoint that surfaces the full catalogue and conventions (shadcn-style copy-paste, Tailwind CSS, Radix/Headless primitives, Framer Motion where needed).

Use it when you want a single skill to govern general UI generation — layout, theming, component conventions — before picking more specific libraries (Chakra, shadcn, Aceternity).

## What this skill provides

When **installed** in Blueprint, the project prompt instructs code generation to:

- Follow **ui-skills (ibelick)** conventions for UI scaffolding (copy-paste components into `components/ui`, `cn` utility, CSS-variable theming)
- Prefer Tailwind + composition over heavy runtime dependencies for generic UI
- Use the skill’s component catalogue as the default UI source when no more specific skill (shadcn, Chakra, Aceternity) is selected for that surface
- Keep theming via Tailwind CSS variables and `tailwind-merge` / `clsx`

## Install — how to add (no auto-download)

This project does **not** auto-download the skill. Blueprint only injects the install instruction into the prompt + exported ZIP so you can run it when ready.

```bash
# via skills CLI (recommended)
npx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root

# alternatives
pnpm dlx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root
yarn dlx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root
bunx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root
```

After adding, the skill’s docs will guide component usage (typically copy relevant component source into your repo’s `components/ui` as with shadcn/ui pattern).

## Catalogue (via ui-skills root)

The root skill exposes the full **ibelick/ui-skills** collection — use it as the overall UI baseline. For specialized motion/data needs, layer **Aceternity UI** (effects), **Chakra UI** (styled system) or **shadcn/ui** (Radix primitives) on top — they compose with the root conventions.

## Usage rules for generated code

1. **Copy-paste first** — components live in-project (`components/ui/*`), not as an npm import.
2. **Tailwind + `cn`** — `import { cn } from "@/lib/utils"` for class merging.
3. **CSS variables** — `bg-background`, `foreground`, `primary`, `muted`, `border` from the skill’s theme.
4. **No duplicate re-implementation** — if the root skill provides a Button/Card/Dialog, use it.
5. **Layer specialization** — for highly animated surfaces prefer Aceternity; for Radix-heavy forms prefer shadcn; for token-driven system prefer Chakra — all sit on the root Tailwind base.

## Prompt injection

When installed, Blueprint injects:

```md
# SKILLS
- UI Skills (ibelick) — Root [ui-skills-root] — Overall meta UI skill aggregating modern copy-paste React + Tailwind patterns. — install: `npx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root`
```

No `FRONTEND > UI Libraries` auto-toggle — it is a meta skill. Optionally add `Tailwind CSS` (already default) alongside it.

## Links

- Repo (skills): https://github.com/ibelick/ui-skills
- Author: https://github.com/ibelick
- Skill install: `npx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root`

## Blueprint UI

Enable this skill from the **Skills** phase (step 06) — toggle `UI Skills — Root`. It is **not downloaded** automatically; the download ZIP will include `SKILLS.md` with this install command so you can add it after scaffolding.

## Included in ZIP

When you download the Blueprint ZIP (Blueprint phase → Download ZIP), a `SKILLS.md` file is added listing:

```
npx skills add https://github.com/ibelick/ui-skills --skill ui-skills-root
```

plus any other selected skills, so the recipient can install skills post-download without extra steps.
