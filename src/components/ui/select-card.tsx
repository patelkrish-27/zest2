import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  selected?: boolean
}

const SelectCard = React.forwardRef<HTMLButtonElement, SelectCardProps>(
  ({ className, label, selected, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-pressed={selected}
        className={cn(
          "px-4 py-4 rounded-md border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-secondary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
          selected
            ? "bg-text-primary text-background border-text-primary font-medium shadow-sm"
            : "bg-surface-2 border-border-default text-text-primary hover:border-text-secondary hover:bg-surface-3",
          className
        )}
        {...props}
      >
        {label}
      </button>
    )
  }
)
SelectCard.displayName = "SelectCard"

export interface MultiSelectCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  selected?: boolean
}

const MultiSelectCard = React.forwardRef<HTMLButtonElement, MultiSelectCardProps>(
  ({ className, label, selected, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-pressed={selected}
        className={cn(
          "px-4 py-3 rounded-md border text-left flex items-center gap-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-secondary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
          selected
            ? "bg-surface-3 border-text-secondary text-text-primary shadow-sm"
            : "bg-surface-1 border-border-default text-text-secondary hover:border-text-muted hover:text-text-primary hover:bg-surface-2",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "w-4 h-4 min-w-[16px] border rounded flex items-center justify-center transition-colors duration-200",
            selected
              ? "border-text-primary bg-text-primary text-background"
              : "border-border-strong bg-transparent"
          )}
          aria-hidden
        >
          {selected && <Check size={12} strokeWidth={4} />}
        </span>
        <span className="truncate text-sm">{label}</span>
      </button>
    )
  }
)
MultiSelectCard.displayName = "MultiSelectCard"

export { SelectCard, MultiSelectCard }
export default SelectCard
