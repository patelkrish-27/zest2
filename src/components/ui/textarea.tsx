import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, required, ...props }, ref) => {
    const autoId = React.useId()
    const inputId = id || autoId
    return (
      <div className="flex flex-col gap-2 w-full mb-6">
        {label && (
          <label
            htmlFor={inputId}
            className="text-text-secondary text-sm font-medium tracking-wide uppercase"
          >
            {label} {required && <span className="text-text-muted">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            "flex min-h-[88px] w-full rounded-md border border-border-default bg-surface-2 px-4 py-3 text-sm text-text-primary ring-offset-background placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-secondary/30 focus-visible:border-text-secondary disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 resize-y",
            error && "border-red-500 focus-visible:ring-red-500/30",
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
export default Textarea
