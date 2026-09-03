import * as React from "react"
import { SelectCard } from "@/components/ui/select-card"
import { Textarea } from "@/components/ui/textarea"
import type { AppState, AppConfig } from "@/types/blueprint"

export interface BackendPhaseProps {
  state: AppState
  config: AppConfig
  updateState: (k: keyof AppState, v: unknown) => void
  renderCustomSections: (pageId: string) => React.ReactNode
  wizardNav: React.ReactNode
}

export const BackendPhase = React.memo<BackendPhaseProps>(({ state, config, updateState, renderCustomSections, wizardNav }) => (
  <div className="max-w-3xl animate-in pb-20">
    <h2 className="text-3xl font-bold mb-2 tracking-tight">Backend & Data</h2>
    <p className="text-text-secondary mb-10 border-b border-border-default pb-8">Configure server infrastructure and data persistence.</p>
    <div className="mb-8">
      <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">Runtime / Framework</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {config.backendFrameworks.map((fw) => (
          <SelectCard key={fw} label={fw} selected={state.backendFramework === fw} onClick={() => updateState("backendFramework", fw)} />
        ))}
      </div>
    </div>
    <div className="mb-8">
      <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">Database</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {config.databases.map((db) => (
          <SelectCard key={db} label={db} selected={state.database === db} onClick={() => updateState("database", db)} />
        ))}
      </div>
    </div>
    <Textarea
      label="Database Tables & Entities (Draft)"
      placeholder="e.g. Users, Posts, Comments, Analytics..."
      value={state.dbTables}
      onChange={(e: any) => updateState("dbTables", e.target.value)}
      rows={4}
    />
    {renderCustomSections("backend")}
    {wizardNav}
  </div>
))
BackendPhase.displayName = "BackendPhase"
export default BackendPhase
