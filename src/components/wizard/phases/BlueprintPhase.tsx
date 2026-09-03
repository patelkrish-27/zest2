import * as React from "react"
import { ChevronLeft, Download, FileCode, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { AppState } from "@/types/blueprint"

export interface BlueprintPhaseProps {
  state: AppState
  parsedFiles: { name: string; content: string }[]
  blueprintActive: number
  setBlueprintActive: (n: number) => void
  onDownload: () => void
  onBack: () => void
}

export const BlueprintPhase = React.memo<BlueprintPhaseProps>(({ state, parsedFiles, blueprintActive, setBlueprintActive, onDownload, onBack }) => {
  const safeActive = Math.min(blueprintActive, Math.max(0, parsedFiles.length - 1))
  return (
    <div className="max-w-5xl animate-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2 tracking-tight">Project Blueprint</h2>
          <p className="text-text-secondary">Your architecture is ready. Review documents and download the initiator.</p>
        </div>
        <Button onClick={onDownload} className="gap-2 shadow-md shrink-0"><Download size={18} /> Download ZIP</Button>
      </div>
      <Separator className="mb-6" />
      {parsedFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className="font-mono text-xs">{parsedFiles.length} files</Badge>
          <Badge variant="outline" className="font-mono text-xs">{state.projectName || "untitled"}-blueprint</Badge>
          {state.selectedSkills.length > 0 && <Badge variant="outline" className="text-xs">+ SKILLS.md</Badge>}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 border border-border-strong rounded-xl bg-surface-1 overflow-hidden flex flex-col max-h-[600px] shadow-sm">
          <div className="px-4 py-3 border-b border-border-subtle bg-surface-2 font-mono text-xs text-text-muted flex items-center justify-between"><span>FILES ({parsedFiles.length})</span><span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden /></div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {parsedFiles.map((f, i) => {
              const isActive = i === safeActive
              return (
                <button key={i} onClick={() => setBlueprintActive(i)} className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? "bg-text-primary text-background font-medium shadow-sm" : "text-text-secondary hover:text-text-primary hover:bg-surface-2"}`} aria-pressed={isActive}><FileCode size={14} className={isActive ? "text-background/80" : "text-text-muted"} /><span className="truncate">{f.name}</span></button>
              )
            })}
            {parsedFiles.length === 0 && <div className="p-4 text-sm text-text-muted italic">No files parsed. Paste an AI response first.</div>}
          </div>
        </div>
        <div className="lg:col-span-3 border border-border-strong rounded-xl bg-surface-1 overflow-hidden flex flex-col max-h-[600px] shadow-sm">
          <div className="px-4 py-3 border-b border-border-subtle bg-surface-2 font-mono text-xs text-text-muted flex items-center justify-between gap-2">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-text-muted" aria-hidden />PREVIEW</span>
            <span className="flex items-center gap-2 truncate">{parsedFiles.length > 0 && (<><span className="truncate max-w-[180px]">{parsedFiles[safeActive]?.name}</span><button onClick={async () => { if (parsedFiles[safeActive]) await navigator.clipboard.writeText(parsedFiles[safeActive].content) }} className="ml-2 px-2 py-1 rounded bg-surface-3 border border-border-default hover:bg-border-strong text-text-primary text-[11px] flex items-center gap-1 shrink-0"><Copy size={12} /> Copy</button></>)}</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-background/40">
            {parsedFiles.length > 0 ? <pre className="text-[13px] leading-relaxed font-mono text-text-primary whitespace-pre-wrap break-words">{parsedFiles[safeActive]?.content}</pre> : <div className="h-full flex flex-col items-center justify-center text-text-muted gap-2 py-12"><FileCode size={28} className="opacity-40" /><span className="text-sm">Select a file to preview</span></div>}
          </div>
        </div>
      </div>
      <div className="flex justify-start mt-8 pt-6 border-t border-border-subtle"><Button variant="ghost" onClick={onBack} className="gap-2"><ChevronLeft size={18} /> Back to Response</Button></div>
    </div>
  )
})
BlueprintPhase.displayName = "BlueprintPhase"
export default BlueprintPhase
