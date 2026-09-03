import { useCallback, useState } from "react"
import { Check, Copy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { backendClient, type ArchitecturePlanClient } from "@/backend/client"
import type { PartialBlueprintState } from "@/backend/types"

interface ArchitecturePlannerProps {
  state: PartialBlueprintState
  onApply: (plan: ArchitecturePlanClient, rawResponse: string) => void
  onNext?: () => void
}

/**
 * Human-in-the-loop architecture planner.
 * Zest creates the planning prompt; the user's Gemini session performs the reasoning.
 */
export function ArchitecturePlanner({ state, onApply, onNext }: ArchitecturePlannerProps) {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const generate = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setPrompt(await backendClient.generateArchitecturePlanningPrompt(state))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the Gemini prompt")
    } finally {
      setLoading(false)
    }
  }, [state])

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [prompt])

  const apply = useCallback(async () => {
    setError("")
    try {
      const plan = await backendClient.parseArchitecturePlan(response)
      onApply(plan, response)
      onNext?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gemini response could not be parsed")
    }
  }, [response, onApply, onNext])

  return (
    <div className="max-w-4xl animate-in pb-20">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles size={24} className="text-text-muted" />
        <h2 className="text-3xl font-bold tracking-tight">Architecture Planner</h2>
      </div>
      <p className="text-text-secondary mb-8">
        Let Gemini reason about the project. Zest supplies the context; you bring the response back here. No AI API key is required in Zest.
      </p>
      <Separator className="mb-8" />

      {!prompt ? (
        <div className="rounded-xl border border-border-strong bg-surface-1 p-6">
          <h3 className="font-semibold mb-2">Generate your Gemini prompt</h3>
          <p className="text-sm text-text-secondary mb-6">
            This uses the selected problem statement, frontend framework, UI libraries, capabilities, backend framework, and database. Gemini will infer pages, reusable components, API boundaries, data flow, and database entities.
          </p>
          <Button onClick={generate} disabled={loading} className="gap-2">
            <Sparkles size={16} /> {loading ? "Preparing prompt…" : "Generate Gemini Prompt"}
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border-strong bg-surface-1 overflow-hidden mb-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-2">
              <span className="text-xs font-mono text-text-muted">GEMINI_ARCHITECT_PROMPT.txt</span>
              <Button size="sm" variant={copied ? "secondary" : "default"} onClick={copy} className="h-8 gap-1.5">
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Prompt</>}
              </Button>
            </div>
            <pre className="p-5 text-[13px] leading-relaxed font-mono whitespace-pre-wrap max-h-[520px] overflow-y-auto text-text-secondary">{prompt}</pre>
          </div>

          <div className="rounded-xl border border-border-strong bg-surface-1 p-5">
            <h3 className="font-semibold mb-1">Paste Gemini's response</h3>
            <p className="text-xs text-text-muted mb-4">Gemini must return the JSON requested in the prompt. Do not edit it unless you need to correct an obvious mistake.</p>
            <Textarea
              label="Architecture JSON"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={16}
              placeholder={'{ "summary": "...", "pages": [...], "components": [...], "architecture": {...} }'}
            />
            <div className="flex justify-between items-center mt-5">
              <Button variant="ghost" onClick={() => setPrompt("")}>Regenerate Prompt</Button>
              <Button onClick={apply} disabled={!response.trim()} className="gap-2">
                Apply Architecture <Check size={16} />
              </Button>
            </div>
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-500 mt-4" role="alert">{error}</p>}
    </div>
  )
}

export default ArchitecturePlanner
