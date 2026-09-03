import * as React from "react"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}
const DropdownContext = React.createContext<{ open: boolean; onOpenChange: (o: boolean) => void } | null>(null)

function DropdownMenu({ open, onOpenChange, children }: DropdownMenuProps) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    const onClick = () => onOpenChange(false)
    window.addEventListener("keydown", onKey)
    // delay to avoid immediate close from trigger click
    const t = setTimeout(() => window.addEventListener("click", onClick), 0)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("click", onClick)
      clearTimeout(t)
    }
  }, [open, onOpenChange])

  return (
    <DropdownContext.Provider value={{ open, onOpenChange }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ className, children, onClick, ...props }, ref) => {
    const ctx = React.useContext(DropdownContext)
    return (
      <button
        ref={ref}
        aria-haspopup="menu"
        aria-expanded={ctx?.open}
        onClick={(e) => {
          e.stopPropagation()
          ctx?.onOpenChange(!ctx.open)
          onClick?.(e)
        }}
        className={cn("focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md", className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(DropdownContext)
    if (!ctx?.open) return null
    return (
      <div
        ref={ref}
        role="menu"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute right-0 z-50 mt-2 min-w-[12rem] rounded-lg border border-border-strong bg-surface-1 p-1 shadow-xl animate-scale-in",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(
  ({ className, inset, children, onClick, ...props }, ref) => (
    <div
      ref={ref}
      role="menuitem"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          ;(onClick as any)?.(e)
        }
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary focus:bg-surface-2 focus:text-text-primary focus:outline-none transition-colors duration-150",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("-mx-1 my-1 h-px bg-border-default", className)} {...props} />
)

const DropdownMenuLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-2 py-1.5 text-xs font-semibold tracking-widest uppercase text-text-muted", className)} {...props} />
)

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel }
export default DropdownMenu
