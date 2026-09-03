import * as React from "react"
import { ArrowRight, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface LandingPageProps {
  onStart: () => void
  onExploreThemes: () => void
}

export const LandingPage = React.memo<LandingPageProps>(({ onStart, onExploreThemes }) => (
  <div className="relative min-h-screen flex flex-col items-center justify-center p-8 text-center animate-in overflow-hidden">
    <div className="pointer-events-none absolute inset-0 aurora-bg opacity-60" aria-hidden />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" aria-hidden />
    <div className="relative z-10 flex flex-col items-center">
      <Badge variant="outline" className="mb-6 font-mono tracking-[0.2em] text-xs glass">
        System Ready · v2.0 · shadcn · Aceternity · Watermelon
      </Badge>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 max-w-4xl leading-[0.9]">
        THE PLANNING LAYER
        <br />
        BETWEEN IDEA & CODE.
      </h1>
      <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-2 leading-relaxed">
        Blueprint is a structured planning layer for rapid product development.
      </p>
      <p className="text-text-muted text-sm max-w-xl mx-auto mb-10">
        Define architecture, style, and capabilities before writing a line of code — then generate a prompt any AI can execute.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button onClick={onStart} size="lg" className="px-8 py-6 text-base gap-2 hover-lift shadow-lg">
          Start Planning
          <ArrowRight size={20} />
        </Button>
        <Button variant="outline" size="lg" className="gap-2 glass" onClick={onExploreThemes}>
          <Palette size={16} /> Explore themes
        </Button>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs font-mono text-text-muted">
        <span className="px-3 py-1.5 rounded-full border border-border-default bg-surface-1">12 phases</span>
        <span className="px-3 py-1.5 rounded-full border border-border-default bg-surface-1">10 themes + 5 modifiers</span>
        <span className="px-3 py-1.5 rounded-full border border-border-default bg-surface-1">20 fonts · 10 pairings</span>
        <span className="px-3 py-1.5 rounded-full border border-border-default bg-surface-1">200ms Watermelon polish</span>
      </div>
      <p className="text-text-muted text-[11px] mt-6 font-mono">
        Tailwind v4 · data-theme light/dark · focus-visible ready
      </p>
    </div>
  </div>
))

LandingPage.displayName = "LandingPage"

export default LandingPage