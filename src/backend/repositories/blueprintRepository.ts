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

export interface BlueprintRepository {
  save(record: Omit<BlueprintRecord, "id" | "createdAt">): Promise<BlueprintRecord>
  findById(id: string): Promise<BlueprintRecord | null>
  list(limit?: number): Promise<BlueprintRecord[]>
}

// In-memory implementation — zero infra, no N+1, no external calls at runtime
// Suitable for file-based coordination; replace with Supabase when DB agent finishes schema
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
    return Array.from(this.store.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
  }
}

// Singleton used by routes — ensures Vite HMR does not duplicate store
export const blueprintRepo: BlueprintRepository = new InMemoryBlueprintRepository()
