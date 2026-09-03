import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import type { AppState } from "@/types/blueprint"

export interface ArchitecturePhaseProps {
  state: AppState
  updateState: (k: keyof AppState, v: unknown) => void
  renderCustomSections: (pageId: string) => React.ReactNode
  wizardNav: React.ReactNode
}

export const ArchitecturePhase = React.memo<ArchitecturePhaseProps>(({ state, updateState, renderCustomSections, wizardNav }) => (
  <div className="max-w-3xl animate-in pb-20">
    <h2 className="text-3xl font-bold mb-2 tracking-tight">System Architecture</h2>
    <p className="text-text-secondary mb-10 border-b border-border-default pb-8">Map out the structural components of the application.</p>
    <Textarea
      label="Pages & Routes"
      placeholder="e.g. / (Landing), /dashboard (Main App), /settings"
      value={state.pages}
      onChange={(e: any) => updateState("pages", e.target.value)}
      rows={4}
    />
    <Textarea
      label="Key Components"
      placeholder="e.g. Navbar, Sidebar, DataTable, UserProfileCard"
      value={state.components}
      onChange={(e: any) => updateState("components", e.target.value)}
      rows={4}
    />
    {renderCustomSections("architecture")}
    {wizardNav}
  </div>
))
ArchitecturePhase.displayName = "ArchitecturePhase"
export default ArchitecturePhase
