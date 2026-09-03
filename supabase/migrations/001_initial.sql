-- 001_initial.sql — Zest canonical schema derived from AppState
-- AppState fields: projectName, projectType, problemStatement, frontendFramework, uiLibraries[], features[],
--   backendFramework, database, dbTables (string), pages, components, theme, themeModifiers{}, themeExtras[],
--   fontHeading, fontBody, fontMono, fontPairing, aiResponse, customAnswers{}, selectedSkills[]
-- AppConfig: projectTypes, frontendFrameworks, uiLibraries, features, backendFrameworks, databases, customPages, customSections
-- Design: normalized so dbTables freeform string is stored but also parseable as jsonb when comma/newline delimited
-- Best practices: RLS enabled on every table, indexes, FKs, updated_at triggers, advisors green
-- Idempotent guard: uses IF NOT EXISTS where possible

-- extensions
create extension if not exists "pgcrypto";

-- helper: updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1) projects — core entity (maps to AppState.projectName/type/problemStatement)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  project_type text check (project_type in ('Website','Web App','Mobile App','Desktop','API','Other') or project_type is null),
  problem_statement text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_projects_name on public.projects (name);
create index if not exists idx_projects_type on public.projects (project_type);
drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

-- 2) frontend_configs — 1:1 per project (frontendFramework, uiLibraries, features)
create table if not exists public.frontend_configs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  framework text check (framework in ('React','Next.js','Vue','Nuxt','Svelte','Vanilla JS') or framework is null or framework = ''),
  ui_libraries text[] not null default '{}',
  features text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_frontend_configs_project on public.frontend_configs (project_id);
drop trigger if exists trg_frontend_configs_updated_at on public.frontend_configs;
create trigger trg_frontend_configs_updated_at before update on public.frontend_configs for each row execute function public.set_updated_at();

-- 3) backend_configs — 1:1 per project (backendFramework, database, dbTables freeform)
create table if not exists public.backend_configs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  framework text check (framework in ('Node.js (Express)','NestJS','Python (FastAPI)','Go (FastAPI)','Ruby','Serverless/Edge') or framework is null or framework = ''),
  database text check (database in ('PostgreSQL','MySQL','MongoDB','Supabase','Firebase','Redis') or database is null or database = ''),
  db_tables_text text, -- raw AppState.dbTables string (e.g. "users, posts\ncomments")
  db_tables_json jsonb, -- parsed array if comma/newline delimited, populated by app or trigger
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_backend_configs_project on public.backend_configs (project_id);
create index if not exists idx_backend_configs_database on public.backend_configs (database);
drop trigger if exists trg_backend_configs_updated_at on public.backend_configs;
create trigger trg_backend_configs_updated_at before update on public.backend_configs for each row execute function public.set_updated_at();

-- 4) architecture_specs — 1:1 per project (pages, components, derived dbTables mirror)
create table if not exists public.architecture_specs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  pages_text text,
  components_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_architecture_specs_project on public.architecture_specs (project_id);
drop trigger if exists trg_architecture_specs_updated_at on public.architecture_specs;
create trigger trg_architecture_specs_updated_at before update on public.architecture_specs for each row execute function public.set_updated_at();

-- 5) theme_configs — 1:1 per project (theme, modifiers, extras, fonts, pairing)
create table if not exists public.theme_configs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  theme_id text, -- THEMES.id e.g. minimalist, glassmorphism, bento, neo-brutalism...
  modifiers jsonb not null default '{}', -- {mode, palette, motion, depth, density}
  extras text[] not null default '{}', -- SUB_THEMES ids: aurora, liquid-glass...
  font_heading text,
  font_body text,
  font_mono text,
  font_pairing text, -- FONT_PAIRINGS.id e.g. geist-mono
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_theme_configs_project on public.theme_configs (project_id);
create index if not exists idx_theme_configs_theme on public.theme_configs (theme_id);
drop trigger if exists trg_theme_configs_updated_at on public.theme_configs;
create trigger trg_theme_configs_updated_at before update on public.theme_configs for each row execute function public.set_updated_at();

-- 6) custom_answers — N per project (AppState.customAnswers Record<sectionId, string|string[]>)
create table if not exists public.custom_answers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  section_id text not null,
  answer jsonb not null, -- string or string[] serialized as jsonb
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, section_id)
);
create index if not exists idx_custom_answers_project on public.custom_answers (project_id);
create index if not exists idx_custom_answers_section on public.custom_answers (section_id);
drop trigger if exists trg_custom_answers_updated_at on public.custom_answers;
create trigger trg_custom_answers_updated_at before update on public.custom_answers for each row execute function public.set_updated_at();

-- 7) project_skills — M:N projects <-> SKILLS_CATALOG (selectedSkills)
create table if not exists public.project_skills (
  project_id uuid not null references public.projects(id) on delete cascade,
  skill_id text not null, -- SKILLS_CATALOG.id e.g. supabase, chakra-ui, shadcn-ui...
  added_at timestamptz not null default now(),
  primary key (project_id, skill_id)
);
create index if not exists idx_project_skills_skill on public.project_skills (skill_id);
create index if not exists idx_project_skills_project on public.project_skills (project_id);

-- 8) blueprint_documents — generated AI files (PROJECT_CONTEXT.md etc.)
create table if not exists public.blueprint_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  filename text not null check (filename ~ '^[a-zA-Z0-9_.-]+\.md$'),
  content text not null,
  created_at timestamptz not null default now(),
  unique (project_id, filename)
);
create index if not exists idx_blueprint_documents_project on public.blueprint_documents (project_id);

-- 9) ai_responses — raw AppState.aiResponse archive per project (optional but useful for regeneration)
create table if not exists public.ai_responses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  raw_response text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_responses_project on public.ai_responses (project_id);

-- RLS: enable on every table (supabase skill best practice — never disabled)
alter table public.projects enable row level security;
alter table public.frontend_configs enable row level security;
alter table public.backend_configs enable row level security;
alter table public.architecture_specs enable row level security;
alter table public.theme_configs enable row level security;
alter table public.custom_answers enable row level security;
alter table public.project_skills enable row level security;
alter table public.blueprint_documents enable row level security;
alter table public.ai_responses enable row level security;

-- Policies: permissive for anon/authenticated in local/dev; replace with owner-based policies for prod
-- Drop existing to make migration re-runnable
drop policy if exists "Allow all for anon and authenticated" on public.projects;
drop policy if exists "Allow all for anon and authenticated" on public.frontend_configs;
drop policy if exists "Allow all for anon and authenticated" on public.backend_configs;
drop policy if exists "Allow all for anon and authenticated" on public.architecture_specs;
drop policy if exists "Allow all for anon and authenticated" on public.theme_configs;
drop policy if exists "Allow all for anon and authenticated" on public.custom_answers;
drop policy if exists "Allow all for anon and authenticated" on public.project_skills;
drop policy if exists "Allow all for anon and authenticated" on public.blueprint_documents;
drop policy if exists "Allow all for anon and authenticated" on public.ai_responses;

-- For MVP/blueprint planning layer: open to anon+authenticated (no auth yet). Harden before prod by adding auth.uid() ownership.
create policy "Allow all for anon and authenticated" on public.projects for all to anon, authenticated using (true) with check (true);
create policy "Allow all for anon and authenticated" on public.frontend_configs for all to anon, authenticated using (true) with check (true);
create policy "Allow all for anon and authenticated" on public.backend_configs for all to anon, authenticated using (true) with check (true);
create policy "Allow all for anon and authenticated" on public.architecture_specs for all to anon, authenticated using (true) with check (true);
create policy "Allow all for anon and authenticated" on public.theme_configs for all to anon, authenticated using (true) with check (true);
create policy "Allow all for anon and authenticated" on public.custom_answers for all to anon, authenticated using (true) with check (true);
create policy "Allow all for anon and authenticated" on public.project_skills for all to anon, authenticated using (true) with check (true);
create policy "Allow all for anon and authenticated" on public.blueprint_documents for all to anon, authenticated using (true) with check (true);
create policy "Allow all for anon and authenticated" on public.ai_responses for all to anon, authenticated using (true) with check (true);

-- Comment: to harden for prod, add column projects.owner_id uuid references auth.users(id) and replace policies with:
--   using (auth.uid() = owner_id) / with check (auth.uid() = owner_id)
-- See SUPABASE_SYNC.md § RLS Hardening
