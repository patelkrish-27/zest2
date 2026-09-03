# Chakra UI Builder Skill

> **Source:** `skills/chakra-ui-builder/SKILL.md` (upstream)
> **Upstream:** https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder
> **Install:** `npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder`

## Purpose

Scaffold **new** Chakra UI components and layouts using best-practice patterns — recipes, slotRecipes, semanticTokens, and composable primitives.

## When to use

- Starting a new page/section/component with Chakra UI
- Need template for Card, Dialog, Menu, Tabs, Form with correct composition
- Want theme-aware tokens instead of hard-coded Tailwind values

## Install

```bash
npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder
# plus runtime
pnpm add @chakra-ui/react @emotion/react
```

## What this skill provides to Blueprint

When installed via `npx skills add .../chakra-ui-builder`, Blueprint injects:

```md
- Chakra UI — Builder [chakra-ui-builder] — Generate new Chakra UI components and layouts with best-practice patterns. (package: @chakra-ui/react | npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder)
```

Generated code must use `@chakra-ui/react` primitives + style props, not raw divs.

## Links

- Repo: https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder
- Components overview: https://chakra-ui.com/docs/components/concepts/overview
- Local parent: ../chakra-ui/SKILL.md
