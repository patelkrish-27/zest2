# Watermelon UI — Make Interfaces Feel Better

> **Source:** `WatermelonCorp/watermelon-platform` — `skills/make-interfaces-feel-better`
> **Upstream:** https://github.com/WatermelonCorp/watermelon-platform/tree/main/skills/make-interfaces-feel-better
> **Install:** `npx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better`

## Concept

**make-interfaces-feel-better** — Watermelon’s UI polish skill. Focuses on micro-interactions, motion, empty-states, loading skeletons, optimistic updates, delight details and “feel-better” UX patterns that make interfaces feel fast, humane and premium.

Works on top of Tailwind + your existing component library (shadcn/ui, Chakra, Aceternity, etc.) — it adds the *feel* layer, not a replacement primitives set.

## What this skill provides

When **installed** in Blueprint, the project prompt instructs code generation to:

- Apply **feel-better** patterns from Watermelon: thoughtful empty states, skeletons vs spinners, optimistic UI, toast copy, haptic-adjacent motion, focus/hover delight, courteous errors
- Prefer subtle Framer Motion / CSS transitions for feedback (not showy hero effects) — 150-250ms ease, respects `prefers-reduced-motion`
- Use concrete recipes from the skill (e.g. optimistic button, skeleton card, inline success, gentle shimmer, contextual micro-copy) instead of generic “added loading”
- Pair with existing primitives — wrap shadcn/Chakra components with the feel layer rather than rebuilding

## Install — how to add (no auto-download)

This project does **not** auto-download the skill. Blueprint only injects the install instruction into the prompt + exported ZIP so you can run it when ready.

```bash
# via skills CLI (recommended — skill name is make-interfaces-feel-better)
npx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better

# alternatives
pnpm dlx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better
yarn dlx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better
bunx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better

# direct tree path also works
npx skills add https://github.com/WatermelonCorp/watermelon-platform/tree/main/skills/make-interfaces-feel-better
```

After adding, follow the skill’s own docs inside your project (typically exposes recipes/guidelines for polish).

## Catalogue (Watermelon — make-interfaces-feel-better)

Patterns include:
- **Loading feel:** skeletons, streaming, suspense boundaries, spinner vs shimmer choices
- **Empty states:** humane copy + illustration + next action (not blank screens)
- **Optimistic UI:** instant button feedback, local mutations before server confirm
- **Micro-motion:** hover/press delight, success checkmarks, gentle shakes for errors
- **Toast & copy:** human, concise, non-robotic feedback
- **Error feel:** forgiving, recoverable errors with retry + context
- **Focus & a11y:** visible focus polish, keyboard delight

Treat this skill as authorization to apply those polish patterns across generated UI.

## Usage rules for generated code

1. **Enhance, don’t replace** — keep shadcn/Chakra/Aceternity primitives; add the feel layer (skeleton, optimistic state, motion) around them.
2. **Timing matters** — 150-250ms transitions, `ease-out`/`ease-in-out`, `prefers-reduced-motion` guarded.
3. **Empty > spinner** — prefer skeletons/placeholders + human copy over generic spinners for content areas.
4. **Optimistic first** — buttons/inputs show instant feedback; reconcile with server after.
5. **Copy is UX** — toast/empty/error copy must be short, humane, action-oriented (from skill’s voice guide).

## Prompt injection

When installed, Blueprint injects:

```md
# SKILLS
- Watermelon UI — Make Interfaces Feel Better [watermelon-ui] — Micro-interactions, skeletons, optimistic UI and feel-better UX polish. — install: `npx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better`
```

and auto-adds `Watermelon UI` to `FRONTEND > UI Libraries` if selected.

## Links

- Skill dir: https://github.com/WatermelonCorp/watermelon-platform/tree/main/skills/make-interfaces-feel-better
- Repo: https://github.com/WatermelonCorp/watermelon-platform
- Skill install: `npx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better`

## Blueprint UI

Enable this skill from the **Skills** phase (step 06) — toggle `Watermelon UI`. It is **not downloaded** automatically; the download ZIP will include `SKILLS.md` with this install command so you can add it after scaffolding.

## Included in ZIP

When you download the Blueprint ZIP (Blueprint phase → Download ZIP), a `SKILLS.md` file is added listing:

```
npx skills add https://github.com/WatermelonCorp/watermelon-platform --skill make-interfaces-feel-better
```

plus any other selected skills, so the recipient can install skills post-download without extra steps.
