import * as React from "react"
import { SelectCard, MultiSelectCard } from "@/components/ui/select-card"
import type { AppState, AppConfig } from "@/types/blueprint"

export interface FrontendPhaseProps {
  state: AppState
  config: AppConfig
  updateState: (k: keyof AppState, v: unknown) => void
  toggleArrayItem: (k: "features" | "uiLibraries", item: string) => void
  renderCustomSections: (pageId: string) => React.ReactNode
  wizardNav: React.ReactNode
}

export const FrontendPhase = React.memo<FrontendPhaseProps>(({ state, config, updateState, toggleArrayItem, renderCustomSections, wizardNav }) => (
  <div className="max-w-3xl animate-in pb-20">
    <h2 className="text-3xl font-bold mb-2 tracking-tight">Frontend Stack</h2>
    <p className="text-text-secondary mb-10 border-b border-border-default pb-8">
      Define the client-side architecture — each group is mutually-comparable so choices compose cleanly.
    </p>
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <label className="text-text-secondary text-sm font-medium tracking-wide uppercase block">Core Framework — pick ONE entry point</label>
        <span className="text-[11px] text-text-muted">single-select</span>
      </div>
      <p className="text-xs text-text-muted mb-3">React vs Next.js vs Vue ecosystem — determines routing, SSR/SSG, and Islands strategy.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {config.frontendFrameworks.map((fw) => (
          <SelectCard key={fw} label={fw} selected={state.frontendFramework === fw} onClick={() => updateState("frontendFramework", fw)} />
        ))}
      </div>
    </div>
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <label className="text-text-secondary text-sm font-medium tracking-wide uppercase block">Design System — pick ONE library</label>
        <span className="text-[11px] text-text-muted">single or mix · curated 2026</span>
      </div>
      <p className="text-xs text-text-muted mb-3">All options are production design systems — no mixing of primitives vs techniques. Pick the system your team will own.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {config.uiLibraries.map((lib) => (
          <MultiSelectCard key={lib} label={lib} selected={state.uiLibraries.includes(lib)} onClick={() => toggleArrayItem("uiLibraries", lib)} />
        ))}
      </div>
    </div>
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <label className="text-text-secondary text-sm font-medium tracking-wide uppercase block">App Capabilities — composable layers</label>
        <span className="text-[11px] text-text-muted">multi-select</span>
      </div>
      <p className="text-xs text-text-muted mb-3">Same abstraction level: client/server state, forms, auth, animation, viz, and realtime — pick what the product actually needs.</p>
      <div className="grid grid-cols-2 gap-3">
        {config.features.map((feat) => (
          <MultiSelectCard key={feat} label={feat} selected={state.features.includes(feat)} onClick={() => toggleArrayItem("features", feat)} />
        ))}
      </div>
    </div>
    {renderCustomSections("frontend")}
    {wizardNav}
  </div>
))
FrontendPhase.displayName = "FrontendPhase"
export default FrontendPhase
