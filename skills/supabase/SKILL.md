# Supabase — Agent Skills

> **Source:** `supabase/agent-skills`
> **Upstream:** https://github.com/supabase/agent-skills
> **Install:** `npx skills add supabase/agent-skills`

## Concept

**supabase/agent-skills** — Supabase’s official agent skills for AI-assisted development. Teaches the agent to work with Supabase correctly: Postgres, Auth, Storage, Realtime, Edge Functions, RLS, migrations and `supabase` CLI — with security-first patterns.

This is a **backend / database** skill, not a UI library. It pairs with a Supabase project (DB + Auth + Storage) regardless of frontend framework.

## What this skill provides

When **installed** in Blueprint, the project prompt instructs code generation to:

- Use **Supabase** as the data / auth layer (Postgres + `supabase-js` / `supabase` CLI)
- Follow skill-guarded patterns: correct `createClient` usage, RLS policies, service-role vs anon key separation, migrations via `supabase` CLI
- Prefer `supabase` helpers for Auth (email/OAuth, session, middleware), Storage (buckets, policies), Realtime (channels, `postgres_changes`)
- Keep secrets server-only (`SUPABASE_SERVICE_ROLE_KEY` never in client bundle), use env-based `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` correctly
- Generate SQL/migrations that pass Supabase advisors (security + performance)

## Install — how to add (no auto-download)

This project does **not** auto-download the skill. Blueprint only injects the install instruction into the prompt + exported ZIP so you can run it when ready.

```bash
# via skills CLI (as you specified)
npx skills add supabase/agent-skills

# with full GitHub URL (equivalent)
npx skills add https://github.com/supabase/agent-skills

# alternatives
pnpm dlx skills add supabase/agent-skills
yarn dlx skills add supabase/agent-skills
bunx skills add supabase/agent-skills

# Supabase CLI + local dev (if using locally)
npx supabase --help
npx supabase init
npx supabase start
```

After adding the skill, follow the skill’s own guide + Supabase docs for your stack (Next.js / Vite / etc.).

## Setup snippet (typical)

```ts
// lib/supabase/client.ts (browser)
import { createBrowserClient } from "@supabase/ssr"
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// lib/supabase/server.ts (server / route handler)
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({name,value,options}) => cookieStore.set(name,value,options)) } }
  )
}
```

Env:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server only
```

## Prompt injection

When installed, Blueprint injects:

```md
# SKILLS
- Supabase — Agent Skills [supabase] — Supabase Postgres/Auth/Storage/Realtime/Edge Functions skills. Use Supabase correctly (RLS, migrations, supabase-js). — install: `npx skills add supabase/agent-skills`
```

and (if selected) auto-sets `Database: Supabase` in the blueprint if not already set.

## Usage rules for generated code

1. **Never expose service-role key** in client code or commits — server-only.
2. **RLS on** — enable Row Level Security + policies for every new table; don’t use `service_role` to bypass in app code.
3. **Use `supabase-js` / `@supabase/ssr`** helpers, not raw fetch to the PostgREST URL.
4. **Migrations via CLI** — `supabase migration new <name>` then SQL; don’t hand-edit remote DB without migration file.
5. **Auth via Supabase Auth** — use helpers/middleware for session refresh; don’t home-roll JWT.
6. **Check advisors** — `supabase` security + performance advisors must be green (no missing RLS).

## Links

- Skill repo: https://github.com/supabase/agent-skills
- Docs: https://supabase.com/docs/guides/getting-started/ai-skills.md
- Supabase docs: https://supabase.com/docs
- CLI: https://supabase.com/docs/guides/local-development/cli/getting-started
- Skill install: `npx skills add supabase/agent-skills`

## Blueprint UI

Enable this skill from the **Skills** phase (step 06) — toggle `Supabase`. It is **not downloaded** automatically; the download ZIP will include `SKILLS.md` with this install command so you can add it after scaffolding. Selecting it also pre-fills `Database: Supabase` if empty.

## Included in ZIP

When you download the Blueprint ZIP (Blueprint phase → Download ZIP), a `SKILLS.md` file is added listing:

```
npx skills add supabase/agent-skills
```

plus any other selected skills, so the recipient can install skills post-download without extra steps.
