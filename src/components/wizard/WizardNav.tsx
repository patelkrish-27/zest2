import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface WizardNavProps {
  prevPhase: string | null
  nextPhase: string | null
  onPrev: () => void
  onNext: () => void
}

export const WizardNav = React.memo<WizardNavProps>(({ prevPhase, nextPhase, onPrev, onNext }) => {
  return (
    <div className="flex justify-between mt-12 pt-6 border-t border-border-subtle">
      {prevPhase ? (
        <Button variant="ghost" onClick={onPrev} className="gap-2">
          <ChevronLeft size={18} /> Back
        </Button>
      ) : (
        <div />
      )}
      {nextPhase ? (
        <Button onClick={onNext} className="gap-2">
          Next Phase <ChevronRight size={18} />
        </Button>
      ) : (
        <div />
      )}
    </div>
  )
})
WizardNav.displayName = "WizardNav"

export default WizardNav
