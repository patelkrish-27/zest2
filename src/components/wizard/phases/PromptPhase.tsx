import * as React from "react"
import { Copy, Check, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export interface PromptPhaseProps {
  prompt: string
  selectedSkillsCount: number
  onCopy: () => void
  copied: boolean
  wizardNav: React.ReactNode
}

export const PromptPhase = React.memo<PromptPhaseProps>(
  ({ prompt, selectedSkillsCount, onCopy, copied, wizardNav }) => (
    <div className="max-w-4xl animate-in pb-20">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Implementation Prompt</h2>
        <Badge variant="outline" className="font-mono text-[11px] hidden sm:inline-flex">
          {prompt.length.toLocaleString()} chars
        </Badge>
      </div>
      <p className="text-text-secondary mb-6">
        Copy this prompt and paste it into ChatGPT, Claude, or your preferred AI to generate the six required docs.
      </p>
      <Separator className="mb-8" />
      <div className="relative bg-surface-1 border border-border-strong rounded-xl overflow-hidden shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 border-b border-border-subtle bg-surface-2">
          <div className="font-mono text-xs text-text-muted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
            <Terminal size={14} /> master_prompt.txt
            <span className="hidden sm:inline text-text-muted">· ready to copy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[11px] font-mono text-text-muted">
              {selectedSkillsCount} skills · ready
            </span>
            <Button
              size="sm"
              variant={copied ? "secondary" : "default"}
              onClick={onCopy}
              className="h-8 gap-1.5 text-xs"
              aria-live="polite"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-500" /> Copied ✓
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy Prompt
                </>
              )}
            </Button>
          </div>
        </div>
        <pre className="p-5 text-[13px] leading-relaxed text-text-secondary font-mono overflow-x-auto whitespace-pre-wrap max-h-[520px] overflow-y-auto bg-background/50">
          {prompt}
        </pre>
        <div className="px-4 py-2 bg-surface-2 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>--- FILE: FILENAME.md --- format · 6 files</span>
          <span className={copied ? "text-emerald-500 font-medium" : ""}>
            {copied ? "Copied to clipboard" : "Tip: Cmd/Ctrl + A then copy"}
          </span>
        </div>
      </div>
      {wizardNav}
    </div>
  ),
)
PromptPhase.displayName = "PromptPhase"

export default PromptPhase