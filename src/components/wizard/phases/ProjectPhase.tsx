import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SelectCard } from "@/components/ui/select-card"
import type { AppState, AppConfig } from "@/types/blueprint"
import { WizardNav } from "../WizardNav"

export interface ProjectPhaseProps {
  state: AppState
  config: AppConfig
  updateState: (k: keyof AppState, v: unknown) => void
  renderCustomSections: (pageId: string) => React.ReactNode
  wizardNav: React.ReactNode
}

export const ProjectPhase = React.memo<ProjectPhaseProps>(({ state, config, updateState, renderCustomSections, wizardNav }) => (
  <div className="max-w-3xl animate-in pb-20">
    <h2 className="text-3xl font-bold mb-2 tracking-tight">Project Definition</h2>
    <p className="text-text-secondary mb-10 border-b border-border-default pb-8">Establish the core identity and purpose of your system.</p>
    <Input
      label="Project Name"
      placeholder="e.g. Acme Dashboard"
      value={state.projectName}
      onChange={(e: any) => updateState("projectName", e.target.value)}
      required
    />
    <div className="mb-6">
      <label className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-3 block">Project Type</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {config.projectTypes.map((type) => (
          <SelectCard key={type} label={type} selected={state.projectType === type} onClick={() => updateState("projectType", type)} />
        ))}
      </div>
    </div>
    <Textarea
      label="Problem Statement"
      placeholder="What specific problem does this project solve?"
      value={state.problemStatement}
      onChange={(e: any) => updateState("problemStatement", e.target.value)}
      rows={5}
      required
    />
    {renderCustomSections("project")}
    {wizardNav}
  </div>
))
ProjectPhase.displayName = "ProjectPhase"
export default ProjectPhase
