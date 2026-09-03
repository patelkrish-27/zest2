# DB Agent — Zest (Figma Make)

> Orchestrator tier: **db** | Upstream: `backend`, `frontend` (`state.database`, `state.dbTables`) | Skill: `supabase` (`npx skills add supabase/agent-skills`)
> Source: `src/App.tsx:362`, `src/App.tsx:954`, `src/App.tsx:990`

## Role
Owns persistence for Zest: `AppConfig` (admin catalog + customPages/Sections + skillsCatalog), `AppState` snapshots / blueprints, and the **user-described** schema the wizard collects in `state.dbTables:90` and emits in `# DATABASE` block of `generatePrompt:1009`. Also the required reference DB for the `supabase` skill when `state.database === "Supabase"`.

## Current Wiring
- `INITIAL_CONFIG.databases:362` = `PostgreSQL | MySQL | MongoDB | Supabase | Firebase | Redis`.
- No DB connection today; `dbTables` is a free-text `<textarea>` piped into prompt/database.md.
- When `database === "Supabase"` auto-selects `supabase` skill (`src/App.tsx:891`).

## Target Model
### 1) Meta-DB (Zest's own persistence)
Choose **Supabase Postgres** (fits `supabase` skill + RLS + Edge Functions) unless ADR picks alternative. Fallback: Postgres + Redis cache.

```sql
-- config store (single row + audit)
create table app_config (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,           -- AppConfig blob (valid against zod schema)
  version int not null default 1,
  updated_at timestamptz default now()
);
-- blueprint saves
create table blueprints (
  id uuid primary key default gen_random_uuid(),
  project_name text,
  project_type text,
  state jsonb not null,          -- AppState snapshot
  prompt text not null,
  ai_response text,
  files jsonb,                   -- parsedFiles[]
  selected_skills text[],
  created_at timestamptz default now()
);
-- customPages / customSections could be normalized if query needed;
-- else kept inside app_config.data (simpler, matches current flat structure)
```

### 2) User-Described Schema (generated artifact)
`state.dbTables` (e.g.:
```
users(id uuid pk, email text unique, created_at timestamptz)
projects(id uuid pk, owner uuid fk->users, name text)
```
) is **not** executed against meta-DB. The `DATABASE.md` artifact must contain well-formed migrations per selected `state.database`.

## Migrations & RLS (supabase skill)
- Migrations under `supabase/migrations/` via `supabase migration new <name>`; never hand-edit applied migration.
- RLS: `blueprints` readable by creator only; `app_config` readable by all, writable by `admin` role. Mirror `handleAdminAuth:1137` → `auth.users` + `user_roles`.
- Validate with `migrate-validate` skill before publish.

## Repository Pattern (ports `backend-patterns`)
```
repositories/
  config.repository.ts  → get/put AppConfig
  blueprint.repository.ts → create/get/list by project_name
  skills.repository.ts → SKILLS_CATALOG sync (seed from src/App.tsx:120)
```
Services never embed SQL; use `supabase-js` via `createClient` with `SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY` env.

## Redis Role (if selected or for cache)
- Cache `GET /api/config` (TTL 300s, key `zest:config:v{version}`).
- Rate-limit `POST /api/blueprint/*` (`zest:rl:{ip}:blueprint` INCR EX 60).
- If `database === "Redis"` for user project, generated `DATABASE.md` documents ephemeral constraints + suggests Postgres for durable blueprint store regardless.

## Validation
```bash
npx supabase db reset --local    # apply migrations
npx supabase gen types typescript --local > src/types/supabase.ts
# parity: prompt DB block === migration in generated zip for each of 6 db options
```

## Handoffs
- **← frontend/backend**: notify on `AppConfig` shape change; `customSections[].isMulti` affects storage (array vs string in `customAnswers`).
- **→ qa**: seed fixtures: one blueprint per db type; RLS tests (anon cannot PUT config).

## Pitfalls
- Treating `state.dbTables` text as executable SQL against meta-DB.
- Missing `supabase` skill env wiring (`SUPABASE_URL` etc.) — guard with `doctor` check.
- Firebase/Mongo user choice: generated docs must not assume Postgres syntax.
