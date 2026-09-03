# Aceternity UI — Components Skill

> **Source:** `secondsky/claude-skills` — `--skill aceternity-ui`
> **Upstream:** https://github.com/secondsky/claude-skills
> **Install:** `npx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui`

## Concept

**Aceternity UI** — Animated, modern React + Tailwind + Framer Motion components. Premium effects (spotlight, moving borders, 3D cards, beams, aurora, parallax) that layer on top of Tailwind/shadcn patterns.

## What this skill provides

When **installed** in Blueprint, the project prompt instructs code generation to:

- Use **Aceternity UI** components/effects as the primary motion-rich layer (on top of Tailwind)
- Prefer Aceternity components for marketing/hero/animated surfaces (e.g. `Spotlight`, `BackgroundBeams`, `MovingBorder`, `3D Card`, `TextGenerateEffect`, `Sparkles`, `Meteors`, `WavyBackground`)
- Follow Aceternity conventions: Tailwind + `framer-motion` + `clsx`/`cn`, no separate npm package — components are copy-pasted into `components/ui` / `components/aceternity`
- Keep accessibility + reduced-motion fallbacks (Aceternity animates with `motion` but should respect `prefers-reduced-motion`)

## Install — how to add (no auto-download)

This project does **not** auto-download the skill. Blueprint only injects the install instruction into the prompt + exported ZIP so you can run it when ready.

```bash
# via skills CLI (adds the agent skill + component context)
npx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui

# alternatives (same registry, same flag)
pnpm dlx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui
yarn dlx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui
bunx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui
```

After adding the skill, follow the skill’s own setup in your app (typically copy the desired component from Aceternity into `components/ui` and install `framer-motion` + `tailwind-merge` if not present):

```bash
pnpm add framer-motion clsx tailwind-merge
# then copy the component source shown by the skill / docs into your repo
```

## Component catalogue (Aceternity UI — selected)

**Effects:** Spotlight, Background Beams, Background Boxes, Wavy Background, Aurora Background, Grid & Dot Backgrounds, Sparkles, Meteors, Shooting Stars
**Cards:** 3D Card, Hover Border Gradient, Evervault Card, Wobble Card, Glare Card
**Text:** Text Generate Effect, Typewriter Effect, Flip Words, Text Hover Effect, Hero Highlight
**Borders / Buttons:** Moving Border, Shimmer Button, Stateful Button, Hover Border Gradient
**Layout:** Bento Grid, Sticky Scroll Reveal, Parallax Scroll, Tracing Beam, Timeline, Infinite Moving Cards, Sticky Banner
**Other:** Lamp, Macbook Scroll, Container Scroll Animation, Vortex, Cover, Compare

Full list: https://ui.aceternity.com/components — treat this skill as authorization to use any of them.

## Usage rules for generated code

1. **Copy-paste, don’t npm install** — Aceternity components live in your codebase (e.g. `components/aceternity/spotlight.tsx`); import from there, not a package.
2. **Motion via `framer-motion`** — keep `motion.*` props, variants and `useScroll`/`useTransform` as authored; gate heavy motion with `prefers-reduced-motion` check.
3. **Tailwind + `cn`** — use `cn("base-classes", className)` from `@/lib/utils` for merging; keep variable-driven dark/light handling.
4. **Compose with shadcn/ui** where useful — Aceternity effects often wrap shadcn primitives (Card, Button) — that’s expected.
5. **No re-invention** — don’t re-implement spotlight/beam/meteor with raw CSS if the Aceternity component exists; use it via the skill.

## Prompt injection

When installed, Blueprint injects:

```md
# SKILLS
- Aceternity UI [aceternity-ui] — Animated, modern React + Tailwind + Framer Motion components. Use Aceternity UI effects/components as primary motion layer. — install: `npx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui`
```

and auto-adds `Aceternity UI` to `FRONTEND > UI Libraries` if selected.

## Links

- Components: https://ui.aceternity.com/components
- GitHub (components): https://github.com/aceternitylabs/ui
- Skill repo: https://github.com/secondsky/claude-skills
- Skill install: `npx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui`

## Blueprint UI

Enable this skill from the **Skills** phase (step 06) — toggle `Aceternity UI`. It is **not downloaded** automatically; the download ZIP will include `SKILLS.md` with this install command so you can add it after scaffolding.

## Included in ZIP

When you download the Blueprint ZIP (Blueprint phase → Download ZIP), a `SKILLS.md` file is added listing:

```
npx skills add https://github.com/secondsky/claude-skills --skill aceternity-ui
```

plus any other selected skills, so the recipient can install skills post-download without extra steps.
