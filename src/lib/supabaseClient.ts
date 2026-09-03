// src/lib/supabaseClient.ts — Supabase client helper for Vite (browser)
// Follows supabase/agent-skills: never expose service_role in client, use anon key, env-based URL
// Install dep before use: pnpm add @supabase/supabase-js
// Env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (see .env.example / SUPABASE_SYNC.md)

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _client: SupabaseClient | null = null

function requireEnv(name: string): string {
  const v = (import.meta.env as Record<string, string | undefined>)[name]
  if (!v || v.includes("placeholder")) {
    console.warn(
      `[supabaseClient] ${name} missing or placeholder — set it in .env.local. See SUPABASE_SYNC.md. Got: ${v ?? "undefined"}`
    )
  }
  return v ?? ""
}

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = requireEnv("VITE_SUPABASE_URL")
  const anonKey = requireEnv("VITE_SUPABASE_ANON_KEY")
  if (!url || !anonKey) {
    // Return a client that will fail loudly on first query; avoids throw at import time (HMR)
    console.error("[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — queries will fail.")
  }
  _client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return _client
}

// default export for convenient `import supabase from "@/lib/supabaseClient"`
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    const c = getSupabase()
    const v = (c as unknown as Record<string, unknown>)[prop as string]
    return typeof v === "function" ? (v as unknown as Function).bind(c) : v
  },
})

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: { id: string; name: string; project_type: string | null; problem_statement: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; project_type?: string | null; problem_statement?: string | null }
        Update: { name?: string; project_type?: string | null; problem_statement?: string | null }
      }
      frontend_configs: {
        Row: { id: string; project_id: string; framework: string | null; ui_libraries: string[]; features: string[] }
        Insert: { project_id: string; framework?: string | null; ui_libraries?: string[]; features?: string[] }
        Update: { framework?: string | null; ui_libraries?: string[]; features?: string[] }
      }
      backend_configs: {
        Row: { id: string; project_id: string; framework: string | null; database: string | null; db_tables_text: string | null; db_tables_json: unknown | null }
        Insert: { project_id: string; framework?: string | null; database?: string | null; db_tables_text?: string | null; db_tables_json?: unknown | null }
        Update: { framework?: string | null; database?: string | null; db_tables_text?: string | null; db_tables_json?: unknown | null }
      }
      architecture_specs: { Row: { id: string; project_id: string; pages_text: string | null; components_text: string | null } }
      theme_configs: {
        Row: { id: string; project_id: string; theme_id: string | null; modifiers: unknown; extras: string[]; font_heading: string | null; font_body: string | null; font_mono: string | null; font_pairing: string | null }
      }
      custom_answers: { Row: { id: string; project_id: string; section_id: string; answer: unknown } }
      project_skills: { Row: { project_id: string; skill_id: string; added_at: string } }
      blueprint_documents: { Row: { id: string; project_id: string; filename: string; content: string } }
      ai_responses: { Row: { id: string; project_id: string; raw_response: string; created_at: string } }
    }
  }
}
