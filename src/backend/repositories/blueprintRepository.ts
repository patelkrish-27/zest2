// src/backend/repositories/blueprintRepository.ts
// Repository layer per backend-patterns: abstract data access; currently in-memory/file fallback
// When Supabase is linked, swap to SupabaseBlueprintRepository without changing service

import type { PartialBlueprintState, ParsedFile } from "../types"

export interface BlueprintRecord {
  id: string
  state: PartialBlueprintState
  prompt: string
  parsedFiles?: ParsedFile[]
  createdAt: string
}

export interface BlueprintFilters {
  q?: string
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface BlueprintRepository {
  save(record: Omit<BlueprintRecord, "id" | "createdAt">): Promise<BlueprintRecord>
  findById(id: string): Promise<BlueprintRecord | null>
  /** @deprecated use findAll — kept for compat */
  list(limit?: number): Promise<BlueprintRecord[]>
  findAll(filters?: BlueprintFilters): Promise<PaginatedResult<BlueprintRecord>>
  delete(id: string): Promise<boolean>
  count(): Promise<number>
}

// In-memory implementation — zero infra, no N+1, no external calls at runtime
// Suitable for file-based coordination; replace with Supabase when DB agent finishes schema
// Query optimization: select only needed fields in findAll via projection; batch ops avoid N+1
export class InMemoryBlueprintRepository implements BlueprintRepository {
  private store = new Map<string, BlueprintRecord>()

  async save(record: Omit<BlueprintRecord, "id" | "createdAt">): Promise<BlueprintRecord> {
    const id = `bp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const row: BlueprintRecord = { id, createdAt: new Date().toISOString(), ...record }
    this.store.set(id, row)
    return row
  }

  async findById(id: string): Promise<BlueprintRecord | null> {
    return this.store.get(id) ?? null
  }

  async list(limit = 20): Promise<BlueprintRecord[]> {
    // kept for backwards compat — delegates to findAll
    const res = await this.findAll({ limit, offset: 0 })
    return res.items
  }

  async findAll(filters?: BlueprintFilters): Promise<PaginatedResult<BlueprintRecord>> {
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100)
    const offset = Math.max(filters?.offset ?? 0, 0)
    const q = filters?.q?.trim().toLowerCase() ?? ""

    // N+1 prevention: single scan over store — no per-item async fetches
    // Select only needed fields: callers can project; here we return full record but document pattern
    let all = Array.from(this.store.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    if (q) {
      all = all.filter((r) => {
        const name = (r.state.projectName ?? "").toLowerCase()
        const prompt = r.prompt.toLowerCase().slice(0, 500)
        return name.includes(q) || prompt.includes(q) || r.id.toLowerCase().includes(q)
      })
    }

    const total = all.length
    const items = all.slice(offset, offset + limit)
    return { items, total, limit, offset }
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id)
  }

  async count(): Promise<number> {
    return this.store.size
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Cached repository — decorates any BlueprintRepository with in-memory TTL cache
// Pattern mirrors backend-patterns Redis cache-aside but uses Map for zero-deps
// TTL 5 minutes (300s) — per skill's CachedMarketRepository example
// ──────────────────────────────────────────────────────────────────────────────
type CacheEntry<T> = { value: T; expiresAt: number }

export class CachedBlueprintRepository implements BlueprintRepository {
  private cache = new Map<string, CacheEntry<BlueprintRecord>>()
  private listCache = new Map<string, CacheEntry<PaginatedResult<BlueprintRecord>>>()
  private readonly ttlMs: number

  constructor(
    private readonly base: BlueprintRepository,
    ttlSec = 300
  ) {
    this.ttlMs = ttlSec * 1000
  }

  private cacheKeyFindAll(filters?: BlueprintFilters): string {
    const f = filters ?? {}
    return `blueprints:list:${f.q ?? ""}:${f.limit ?? 20}:${f.offset ?? 0}`
  }

  async save(record: Omit<BlueprintRecord, "id" | "createdAt">): Promise<BlueprintRecord> {
    const row = await this.base.save(record)
    // populate cache
    this.cache.set(`blueprint:${row.id}`, { value: row, expiresAt: Date.now() + this.ttlMs })
    // invalidate list caches
    this.listCache.clear()
    return row
  }

  async findById(id: string): Promise<BlueprintRecord | null> {
    const key = `blueprint:${id}`
    const entry = this.cache.get(key)
    if (entry && entry.expiresAt > Date.now()) return entry.value
    if (entry) this.cache.delete(key)

    const row = await this.base.findById(id)
    if (row) this.cache.set(key, { value: row, expiresAt: Date.now() + this.ttlMs })
    return row
  }

  async list(limit = 20): Promise<BlueprintRecord[]> {
    const r = await this.findAll({ limit, offset: 0 })
    return r.items
  }

  async findAll(filters?: BlueprintFilters): Promise<PaginatedResult<BlueprintRecord>> {
    const key = this.cacheKeyFindAll(filters)
    const entry = this.listCache.get(key)
    if (entry && entry.expiresAt > Date.now()) return entry.value
    if (entry) this.listCache.delete(key)

    const result = await this.base.findAll(filters)
    this.listCache.set(key, { value: result, expiresAt: Date.now() + this.ttlMs })
    return result
  }

  async delete(id: string): Promise<boolean> {
    const ok = await this.base.delete(id)
    this.cache.delete(`blueprint:${id}`)
    this.listCache.clear()
    return ok
  }

  async count(): Promise<number> {
    return this.base.count()
  }

  async invalidateCache(id?: string): Promise<void> {
    if (id) this.cache.delete(`blueprint:${id}`)
    else this.cache.clear()
    this.listCache.clear()
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Supabase implementation — stub (uncomment & configure when DB linked)
// Implements same interface; swap singleton below to use it.
// Requires server-side supabase-js with service_role or RLS-aware anon key.
// See src/lib/supabaseClient.ts Database type for table shape.
// ──────────────────────────────────────────────────────────────────────────────
/*
import { createClient } from "@supabase/supabase-js"
import type { Database } from "../../lib/supabaseClient"

export class SupabaseBlueprintRepository implements BlueprintRepository {
  private supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // or anon with RLS
  )

  async save(record: Omit<BlueprintRecord, "id" | "createdAt">): Promise<BlueprintRecord> {
    // Select only needed columns per backend-patterns query optimization
    const { data, error } = await this.supabase
      .from("blueprint_documents")
      .insert({
        // map record -> columns; adjust to your schema
        // project_id, filename, content etc.
        content: record.prompt,
        // state: record.state
      } as never)
      .select("id, content, created_at")
      .single()
    if (error) throw new Error(error.message)
    return {
      id: (data as unknown as { id: string }).id,
      state: record.state,
      prompt: record.prompt,
      parsedFiles: record.parsedFiles,
      createdAt: (data as unknown as { created_at: string }).created_at,
    }
  }

  async findById(id: string): Promise<BlueprintRecord | null> {
    const { data, error } = await this.supabase
      .from("blueprint_documents")
      .select("id, content, created_at")
      .eq("id", id)
      .single()
    if (error) return null
    return {
      id: (data as unknown as { id: string }).id,
      state: {} as PartialBlueprintState,
      prompt: (data as unknown as { content: string }).content,
      createdAt: (data as unknown as { created_at: string }).created_at,
    }
  }

  async list(limit = 20): Promise<BlueprintRecord[]> {
    const r = await this.findAll({ limit, offset: 0 })
    return r.items
  }

  async findAll(filters?: BlueprintFilters): Promise<PaginatedResult<BlueprintRecord>> {
    const limit = Math.min(filters?.limit ?? 20, 100)
    const offset = filters?.offset ?? 0
    let query = this.supabase
      .from("blueprint_documents")
      .select("id, content, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (filters?.q) query = query.ilike("content", `%${filters.q}%`)

    const { data, error, count } = await query
    if (error) throw new Error(error.message)
    const items: BlueprintRecord[] = (data as unknown as Array<{ id: string; content: string; created_at: string }>).map(d => ({
      id: d.id, state: {} as PartialBlueprintState, prompt: d.content, createdAt: d.created_at,
    }))
    return { items, total: count ?? items.length, limit, offset }
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase.from("blueprint_documents").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return true
  }

  async count(): Promise<number> {
    const { count, error } = await this.supabase.from("blueprint_documents").select("id", { count: "exact", head: true })
    if (error) throw new Error(error.message)
    return count ?? 0
  }
}
*/

// Singleton used by routes — ensures Vite HMR does not duplicate store
// Wrapped with cache-aside (TTL 5min). To swap to Supabase:
//   export const blueprintRepo: BlueprintRepository = new SupabaseBlueprintRepository()
//   // optionally wrap: new CachedBlueprintRepository(new SupabaseBlueprintRepository())
const baseRepo = new InMemoryBlueprintRepository()
export const blueprintRepo: BlueprintRepository = new CachedBlueprintRepository(baseRepo, 300)
// For cache invalidation access if needed (tests):
export const _baseRepo = baseRepo
