import * as React from "react"
import { useMemo } from "react"
import { Puzzle, Boxes, Package, X, ExternalLink, BookOpen, Plus, Search, Check } from "lucide-react"
import type { Skill } from "@/types/blueprint"
import { useDebounce } from "@/hooks/useDebounce"

export interface SkillsPickerProps {
  allSkills: Skill[]
  selectedSkills: string[]
  skillFilter: string
  skillSearch: string
  skillDetail: string | null
  onFilterChange: (f: string) => void
  onSearchChange: (s: string) => void
  onDetailChange: (id: string | null) => void
  onToggleSkill: (id: string) => void
  onViewPrompt: () => void
}

export const SkillsPicker = React.memo<SkillsPickerProps>(
  ({ allSkills, selectedSkills, skillFilter, skillSearch, skillDetail, onFilterChange, onSearchChange, onDetailChange, onToggleSkill, onViewPrompt }) => {
    const debouncedSearch = useDebounce(skillSearch, 300)
    const filtered = useMemo(
      () =>
        allSkills.filter((s) => {
          const matchesSearch =
            !debouncedSearch ||
            s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            s.description.toLowerCase().includes(debouncedSearch.toLowerCase())
          const matchesFilter = skillFilter === "All" || s.category === skillFilter
          return matchesSearch && matchesFilter
        }),
      [allSkills, debouncedSearch, skillFilter],
    )

    const installed = useMemo(
      () => allSkills.filter((s) => selectedSkills.includes(s.id)),
      [allSkills, selectedSkills],
    )

    const categories = useMemo(
      () => ["All", ...Array.from(new Set(allSkills.map((s) => s.category)))],
      [allSkills],
    )

    const detailSkill = skillDetail ? allSkills.find((s) => s.id === skillDetail) : null

    return (
      <>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Puzzle size={28} className="text-text-muted" /> Skills
            </h2>
            <p className="text-text-secondary mt-2 max-w-2xl">
              Extend your blueprint with reusable capability packs. Skills inject install steps, docs context and prompt rules into the generated blueprint. Start with <span className="text-text-primary font-medium">Chakra UI</span>.
            </p>
          </div>
          {installed.length > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-surface-1 border border-border-default rounded-full px-3 py-1.5 text-xs shrink-0">
              <Boxes size={14} className="text-text-muted" />
              <span className="text-text-secondary">{installed.length} installed</span>
              <span className="text-text-muted">·</span>
              <button onClick={onViewPrompt} className="text-text-primary underline">view prompt →</button>
            </div>
          )}
        </div>
        <div className="border-b border-border-default pb-6 mb-6" />

        {installed.length > 0 && (
          <div className="mb-8 bg-surface-1 border border-border-strong rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-text-muted" />
              <h3 className="text-sm font-semibold tracking-widest uppercase text-text-secondary">
                Installed — {installed.length}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {installed.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 bg-surface-2 border border-border-default rounded-full px-3 py-1.5 text-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-text-primary font-medium">{s.name}</span>
                  <span className="text-text-muted text-xs hidden sm:inline">{s.package}</span>
                  <button
                    onClick={() => onToggleSkill(s.id)}
                    className="ml-1 w-5 h-5 rounded-full bg-surface-3 hover:bg-border-strong flex items-center justify-center text-text-muted hover:text-text-primary"
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-3">
              These will be injected under <span className="font-mono text-text-secondary"># SKILLS</span> in the master prompt and scaffold instructions.
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={skillSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search skills (e.g. Chakra, UI, components)…"
              className="w-full bg-surface-1 border border-border-default rounded-md pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-secondary"
              aria-label="Search skills"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onFilterChange(cat)}
                aria-pressed={skillFilter === cat}
                className={`px-3 py-2 rounded-full text-xs font-medium border transition-colors ${
                  skillFilter === cat
                    ? "bg-text-primary text-background border-text-primary"
                    : "bg-surface-1 border-border-default text-text-secondary hover:border-text-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filtered.map((skill) => {
            const isInstalled = selectedSkills.includes(skill.id)
            return (
              <div
                key={skill.id}
                className={`relative rounded-xl border p-5 flex flex-col gap-3 transition-all ${
                  isInstalled
                    ? "bg-text-primary text-background border-text-primary shadow-lg"
                    : "bg-surface-1 border-border-default hover:border-border-strong hover:bg-surface-2"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isInstalled ? "bg-background text-text-primary" : "bg-surface-2 border border-border-default text-text-primary"
                    }`}
                  >
                    <Puzzle size={20} />
                  </div>
                  <button
                    onClick={() => onToggleSkill(skill.id)}
                    aria-pressed={isInstalled}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors shrink-0 ${
                      isInstalled ? "bg-background text-text-primary border-background hover:opacity-90" : "bg-text-primary text-background border-text-primary hover:opacity-90"
                    }`}
                  >
                    {isInstalled ? "Installed ✓" : "Install"}
                  </button>
                </div>
                <div>
                  <div
                    className={`text-base font-bold leading-none flex items-center gap-2 ${isInstalled ? "text-background" : "text-text-primary"}`}
                  >
                    {skill.name}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                        isInstalled ? "border-background/20 text-background/70" : "border-border-default text-text-muted bg-surface-2"
                      }`}
                    >
                      {skill.category}
                    </span>
                  </div>
                  <div className={`text-[11px] font-mono mt-1 ${isInstalled ? "text-background/60" : "text-text-muted"}`}>
                    {skill.concepts} · {skill.package}
                  </div>
                  <p className={`text-sm mt-2 leading-relaxed line-clamp-2 ${isInstalled ? "text-background/80" : "text-text-secondary"}`}>
                    {skill.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skill.highlights.slice(0, 3).map((h) => (
                    <span
                      key={h}
                      className={`text-[11px] px-2 py-1 rounded-full border ${
                        isInstalled ? "bg-background/10 border-background/15 text-background/80" : "bg-surface-2 border-border-default text-text-muted"
                      }`}
                    >
                      {h}
                    </span>
                  ))}
                </div>
                <div
                  className={`flex items-center gap-2 text-[11px] font-mono pt-2 border-t ${
                    isInstalled ? "border-background/15 text-background/60" : "border-border-subtle text-text-muted"
                  }`}
                >
                  <BookOpen size={12} />
                  <span className="truncate">{skill.docsUrl}</span>
                  <button
                    onClick={() => onDetailChange(skill.id)}
                    className={`ml-auto underline ${isInstalled ? "text-background" : "text-text-secondary"}`}
                  >
                    details →
                  </button>
                </div>
                <a
                  href={skill.rawUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`absolute top-3 right-[88px] w-7 h-7 rounded-full border flex items-center justify-center ${
                    isInstalled ? "border-background/15 text-background/60 hover:text-background" : "border-border-default text-text-muted hover:text-text-primary bg-surface-1"
                  }`}
                  aria-label="External link"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="border border-dashed border-border-default rounded-lg p-10 text-center">
            <p className="text-text-muted text-sm">No skills match “{skillSearch}” in {skillFilter}.</p>
            <button
              onClick={() => {
                onSearchChange("")
                onFilterChange("All")
              }}
              className="mt-3 text-sm text-text-primary underline"
            >
              clear filters
            </button>
          </div>
        )}

        {detailSkill && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => onDetailChange(null)} />
            <div
              className="w-full max-w-xl bg-surface-1 border-l border-border-default h-screen overflow-y-auto p-6 animate-in"
              role="dialog"
              aria-modal="true"
              aria-label={`${detailSkill.name} details`}
              tabIndex={-1}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-text-primary text-background flex items-center justify-center">
                    <Puzzle size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary leading-none">{detailSkill.name}</h3>
                    <p className="text-xs text-text-muted font-mono mt-1">{detailSkill.docsUrl}</p>
                    <p className="text-xs text-text-muted mt-1">{detailSkill.source}</p>
                  </div>
                </div>
                <button
                  onClick={() => onDetailChange(null)}
                  className="w-8 h-8 rounded-full bg-surface-2 border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary"
                  aria-label="Close details"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">{detailSkill.description}</p>
              <div className="bg-surface-2 border border-border-default rounded-lg p-4 mb-4">
                <div className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-2 flex items-center gap-2">
                  <Package size={12} /> Install
                </div>
                <code className="text-sm font-mono text-text-primary block bg-background border border-border-subtle rounded px-3 py-2">
                  {detailSkill.installCmd}
                </code>
                <div className="mt-3 flex gap-2">
                  <a
                    href={detailSkill.rawUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-surface-3 border border-border-default px-3 py-1.5 rounded flex items-center gap-1.5 hover:border-text-muted"
                  >
                    <ExternalLink size={12} /> Raw MDX
                  </a>
                  <a
                    href={`https://chakra-ui.com/${detailSkill.docsUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-surface-3 border border-border-default px-3 py-1.5 rounded flex items-center gap-1.5 hover:border-text-muted"
                  >
                    <BookOpen size={12} /> Docs
                  </a>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-2">Concepts</h4>
                <p className="text-sm font-mono text-text-primary bg-surface-2 border border-border-default rounded px-3 py-2">
                  {detailSkill.concepts}
                </p>
              </div>
              <div className="mb-6">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-2">Highlights</h4>
                <ul className="space-y-1.5">
                  {detailSkill.highlights.map((h) => (
                    <li key={h} className="text-sm text-text-secondary flex gap-2">
                      <span className="text-text-muted">—</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-background border border-border-default rounded-lg p-4 mb-6">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-2">Prompt injection preview</h4>
                <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {`- ${detailSkill.name} [${detailSkill.id}] — ${detailSkill.description} (source: ${detailSkill.source} | docs: ${detailSkill.docsUrl} | package: ${detailSkill.package})`}
                </pre>
              </div>
              <button
                onClick={() => {
                  onToggleSkill(detailSkill.id)
                  onDetailChange(null)
                }}
                className={`w-full py-3 rounded-md font-medium flex items-center justify-center gap-2 ${
                  selectedSkills.includes(detailSkill.id) ? "bg-surface-3 border border-border-strong text-text-primary" : "bg-text-primary text-background"
                }`}
              >
                {selectedSkills.includes(detailSkill.id) ? (
                  <>
                    <X size={16} /> Remove skill
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Install skill
                  </>
                )}
              </button>
              <p className="text-[11px] text-text-muted text-center mt-3">
                File: <span className="font-mono">skills/{detailSkill.id}/SKILL.md</span>
              </p>
            </div>
          </div>
        )}

        <div className="bg-surface-1 border border-border-default rounded-lg p-4 flex gap-3">
          <div className="text-text-muted mt-0.5">
            <Boxes size={18} />
          </div>
          <div className="text-sm">
            <div className="font-medium text-text-primary mb-1">How skills work</div>
            <div className="text-text-secondary leading-relaxed text-xs">
              Skills are versioned folders under <span className="font-mono text-text-primary">skills/</span> (see{" "}
              <span className="font-mono">skills/chakra-ui/SKILL.md</span>). Installing adds the skill to{" "}
              <span className="font-mono"># SKILLS</span> in the master prompt — downstream AI will scaffold with that library and follow its usage rules. Add new skills in{" "}
              <span className="font-mono">Admin → Skills</span> or by creating a folder and registering it in{" "}
              <span className="font-mono">SKILLS_CATALOG</span>.
            </div>
          </div>
        </div>
      </>
    )
  },
)

SkillsPicker.displayName = "SkillsPicker"

export default SkillsPicker