import * as React from "react"
import { Plus, Trash2, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { AppConfig } from "@/types/blueprint"

export interface AdminSectionMeta {
  key: keyof AppConfig
  title: string
  desc: string
}

export const ADMIN_STANDARD_CATEGORIES: AdminSectionMeta[] = [
  { key: "projectTypes", title: "Project Types", desc: "Options available in Project Definition" },
  { key: "frontendFrameworks", title: "Frontend Frameworks", desc: "Options available in Frontend Stack" },
  { key: "uiLibraries", title: "UI Libraries", desc: "Styling & UI libraries in Frontend Stack" },
  { key: "features", title: "Features & Polish", desc: "Additional features in Frontend Stack" },
  { key: "backendFrameworks", title: "Backend Frameworks", desc: "Runtime/Frameworks in Backend" },
  { key: "databases", title: "Databases", desc: "Database options in Backend" },
]

export interface AdminPhaseProps {
  config: AppConfig
  newOptions: Record<string, string>
  newSecTitle: string
  newSecDesc: string
  newSecPage: string
  newSecCustomPageName: string
  newSecType: "single" | "multi"
  onNewSecTitle: (v: string) => void
  onNewSecDesc: (v: string) => void
  onNewSecPage: (v: string) => void
  onNewSecCustomPageName: (v: string) => void
  onNewSecType: (v: "single" | "multi") => void
  onCreateCustomSection: () => void
  onRemoveConfigOption: (category: keyof AppConfig, item: string) => void
  onAddConfigOption: (category: keyof AppConfig) => void
  onRemoveCustomSectionOption: (sectionId: string, item: string) => void
  onAddCustomSectionOption: (sectionId: string) => void
  onDeleteCustomSection: (sectionId: string) => void
  onNewOptionChange: (category: string, value: string) => void
}

export const AdminPhase = React.memo<AdminPhaseProps>(
  ({
    config,
    newOptions,
    newSecTitle,
    newSecDesc,
    newSecPage,
    newSecCustomPageName,
    newSecType,
    onNewSecTitle,
    onNewSecDesc,
    onNewSecPage,
    onNewSecCustomPageName,
    onNewSecType,
    onCreateCustomSection,
    onRemoveConfigOption,
    onAddConfigOption,
    onRemoveCustomSectionOption,
    onAddCustomSectionOption,
    onDeleteCustomSection,
    onNewOptionChange,
  }) => {
    return (
      <div className="max-w-4xl animate-in pb-20">
        <h2 className="text-3xl font-bold mb-2 tracking-tight">Admin Dashboard</h2>
        <p className="text-text-secondary mb-10 border-b border-border-default pb-8">
          Create new sections, dynamically insert pages, and configure available options globally.
        </p>

        <div className="bg-surface-1 border border-border-strong rounded-md p-6 mb-12 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Plus size={20} className="text-text-primary" />
            <h3 className="text-xl font-bold text-text-primary">Create Custom Section</h3>
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Add a brand new dynamic question block. You can inject it into existing pages or create an entirely new step in the workflow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input
              label="Section Title"
              value={newSecTitle}
              onChange={(e: any) => onNewSecTitle(e.target.value)}
              placeholder="e.g. Types of Theme"
            />
            <Input
              label="Section Description"
              value={newSecDesc}
              onChange={(e: any) => onNewSecDesc(e.target.value)}
              placeholder="e.g. Select the overall aesthetic."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase">Placement / Page</label>
              <select
                className="bg-surface-2 border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                value={newSecPage}
                onChange={(e) => onNewSecPage(e.target.value)}
              >
                <option value="project">01. Project</option>
                <option value="frontend">02. Frontend</option>
                <option value="backend">03. Backend</option>
                <option value="architecture">04. Architecture</option>
                <option value="theme">05. Visual Style</option>
                {config.customPages.map((p) => (
                  <option key={p.id} value={p.id}>
                    Custom: {p.title}
                  </option>
                ))}
                <option value="NEW_PAGE">➕ Create New Page...</option>
              </select>
            </div>

            {newSecPage === "NEW_PAGE" && (
              <Input
                label="New Page Title"
                value={newSecCustomPageName}
                onChange={(e: any) => onNewSecCustomPageName(e.target.value)}
                placeholder="e.g. Theming & Design"
              />
            )}

            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium tracking-wide uppercase">Selection Type</label>
              <select
                className="bg-surface-2 border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-text-secondary transition-colors"
                value={newSecType}
                onChange={(e: any) => onNewSecType(e.target.value)}
              >
                <option value="single">Single Choice (Radio behavior)</option>
                <option value="multi">Multiple Choice (Checkbox behavior)</option>
              </select>
            </div>
          </div>

          <button
            onClick={onCreateCustomSection}
            disabled={!newSecTitle.trim() || (newSecPage === "NEW_PAGE" && !newSecCustomPageName.trim())}
            className="bg-text-primary text-background px-6 py-3 rounded-md font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            Create Section <Check size={18} />
          </button>
        </div>

        <h3 className="text-2xl font-bold mb-6 tracking-tight border-b border-border-default pb-4">Manage Options</h3>
        <div className="flex flex-col gap-8">
          {config.customSections.map((sec) => {
            const pageName = sec.pageId.startsWith("page_")
              ? config.customPages.find((p) => p.id === sec.pageId)?.title
              : sec.pageId.charAt(0).toUpperCase() + sec.pageId.slice(1)

            return (
              <div
                key={sec.id}
                className="bg-surface-1 border border-border-strong rounded-md p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-text-primary">{sec.title}</h3>
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                      Custom ({sec.isMulti ? "Multi" : "Single"})
                    </span>
                    <span className="text-xs text-text-muted bg-surface-3 px-2 py-1 rounded">Page: {pageName}</span>
                  </div>
                  <button
                    onClick={() => onDeleteCustomSection(sec.id)}
                    className="text-text-muted hover:text-red-400 transition-colors p-1"
                    title="Delete section completely"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mb-6">{sec.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {sec.options.map((opt) => (
                    <div
                      key={opt}
                      className="bg-surface-2 border border-border-strong rounded px-3 py-1.5 flex items-center gap-2 text-sm"
                    >
                      {opt}
                      <button
                        onClick={() => onRemoveCustomSectionOption(sec.id, opt)}
                        className="text-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {sec.options.length === 0 && (
                    <span className="text-sm text-text-muted italic">No options added yet.</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOptions[sec.id] || ""}
                    onChange={(e) => onNewOptionChange(sec.id, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onAddCustomSectionOption(sec.id)}
                    placeholder="Add new option..."
                    className="bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-text-secondary w-64 transition-colors"
                  />
                  <button
                    onClick={() => onAddCustomSectionOption(sec.id)}
                    className="bg-surface-3 hover:bg-border-strong text-text-primary px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            )
          })}

          {ADMIN_STANDARD_CATEGORIES.map((cat) => (
            <div key={cat.key} className="bg-surface-1 border border-border-default rounded-md p-6">
              <h3 className="text-lg font-medium text-text-primary mb-1">{cat.title}</h3>
              <p className="text-sm text-text-secondary mb-6">{cat.desc}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {(config[cat.key] as string[]).map((opt) => (
                  <div
                    key={opt}
                    className="bg-surface-2 border border-border-strong rounded px-3 py-1.5 flex items-center gap-2 text-sm"
                  >
                    {opt}
                    <button
                      onClick={() => onRemoveConfigOption(cat.key, opt)}
                      className="text-text-muted hover:text-red-400 transition-colors"
                      title="Remove option"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOptions[cat.key] || ""}
                  onChange={(e) => onNewOptionChange(cat.key, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onAddConfigOption(cat.key)}
                  placeholder="Add new option..."
                  className="bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-text-secondary w-64 transition-colors"
                />
                <button
                  onClick={() => onAddConfigOption(cat.key)}
                  className="bg-surface-3 hover:bg-border-strong text-text-primary px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
)
AdminPhase.displayName = "AdminPhase"

export default AdminPhase