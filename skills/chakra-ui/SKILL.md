# Chakra UI — Components Skill

> **Source:** `apps/www/content/docs/components/concepts/overview.mdx`
> **URL:** `docs/components/concepts/overview`
> **Raw:** https://raw.githubusercontent.com/chakra-ui/chakra-ui/refs/heads/main/apps/www/content/docs/components/concepts/overview.mdx

## Concept

**Components > Concepts > Components**

Accessible, modern and easy to style UI components.

---

title: Components
description: Accessible, modern and easy to style UI components.
links:

---

Here's a list of all the components available in the library.

`<ComponentGrid />` — renders the full Chakra UI component catalogue (see categories below).

## What this skill provides

When this skill is **installed** in Blueprint, the project prompt instructs code generation to:

- Use **Chakra UI v3** (`@chakra-ui/react`) as the UI primitive layer
- Prefer Chakra components over raw HTML / Tailwind-only primitives for interactive elements
- Follow Chakra theming tokens (`semanticTokens`, `recipes`, `slotRecipes`) instead of ad-hoc Tailwind values
- Respect accessibility defaults (focus ring, keyboard nav, ARIA) built into Chakra components

## Install

### Via `skills` CLI (recommended — installs agent skills)

```bash
# Install all Chakra UI skills
npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills

# Install a specific skill
npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-builder
npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-migrate
npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills/chakra-ui-refactor
```

Sub-skills:
- **`chakra-ui-builder`** — scaffold new components/layouts with Chakra best practices (recipes, slotRecipes, semanticTokens).
- **`chakra-ui-migrate`** — codemod & migrate existing UI to Chakra v3 props/tokens.
- **`chakra-ui-refactor`** — refactor prop hygiene, DRY style props, composition cleanup.

### Via package manager (runtime dependency)

```bash
pnpm add @chakra-ui/react @emotion/react
# or
npm i @chakra-ui/react @emotion/react
# or
yarn add @chakra-ui/react @emotion/react
```

Setup snippet (Vite + React 19):

```tsx
// src/main.tsx
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ChakraProvider value={defaultSystem}>
    <App />
  </ChakraProvider>
)
```

Or with custom system:

```ts
// src/theme.ts
import { createSystem, defaultConfig } from "@chakra-ui/react"
export const system = createSystem(defaultConfig, {
  theme: { tokens: { colors: { brand: { 500: { value: "#0090ff" } } } } }
})
```

## Component categories (from official docs)

**Layout:** Box, Flex, Grid, Stack, Center, Container, Wrap, Bleed
**Typography:** Text, Heading, Code, Kbd, Link, Blockquote
**Form:** Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, NumberInput, PinInput, FileUpload
**Disclosure:** Accordion, Tabs, Dialog/Modal, Drawer, Popover, Tooltip, HoverCard, Menu
**Navigation:** Breadcrumb, Pagination, Steps, Tabs, Link
**Feedback:** Alert, Toast, Progress, Spinner, Skeleton, EmptyState, Status
**Data Display:** Card, Table, List, Avatar, Badge, Tag, Stat, DataList, Separator
**Overlay:** Dialog, Drawer, Popover, Tooltip, Menu
**Other:** Icon, Image, CloseButton, Field, Fieldset

> The `<ComponentGrid />` in the source MDX enumerates every component — treat this skill as authorization to use any of them.

## Usage rules for generated code

1. **Import from `@chakra-ui/react`** — `import { Button, Input, Card } from "@chakra-ui/react"`
2. **Use `asChild` / `as` where composition is needed** (e.g. Button asChild Next Link)
3. **Style via props / `css` prop**, not external CSS classes for Chakra-owned components
4. **Do not re-implement** accessible primitives (Dialog, Menu, Tabs) with divs — use the Chakra component
5. **Icons:** pair with `lucide-react` — `<LuHouse />` via `@chakra-ui/icons` or direct `lucide-react`

## Prompt injection

When installed, Blueprint injects:

```md
# SKILLS
- Chakra UI (docs/components/concepts/overview): Accessible, modern and easy to style UI components. Use @chakra-ui/react components (ComponentGrid catalogue) as primary UI primitives.
```

and adds to `FRONTEND > UI Libraries: Chakra UI` automatically.

## Links

- Docs: https://chakra-ui.com/docs/components/concepts/overview
- GitHub: https://github.com/chakra-ui/chakra-ui
- Source MDX: https://raw.githubusercontent.com/chakra-ui/chakra-ui/refs/heads/main/apps/www/content/docs/components/concepts/overview.mdx

## Blueprint UI

Enable this skill from the **Skills** phase (step 06) in Blueprint — toggle `Chakra UI` to include it in the generated `master_prompt.txt` and in `BLUEPRINT` export.
