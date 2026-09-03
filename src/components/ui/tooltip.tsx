import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false)
  const id = React.useId()

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      aria-describedby={visible ? id : undefined}
    >
      {children}
      {visible && content && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "absolute z-50 px-2.5 py-1.5 rounded-md bg-text-primary text-background text-xs font-medium shadow-lg whitespace-nowrap pointer-events-none animate-in",
            side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
            side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
            side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
            side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { Tooltip, TooltipProvider }
export default Tooltip
