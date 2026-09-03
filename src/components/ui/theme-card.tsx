import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ThemeCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  name: string
  feel: string
  traits: string
  accent: string
  selected?: boolean
}

const ThemeCard = React.forwardRef<HTMLButtonElement, ThemeCardProps>(
  ({ className, name, feel, traits, accent, selected, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-pressed={selected}
        className={cn(
          "group relative overflow-hidden rounded-xl border text-left transition-all duration-200 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-secondary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
          selected
            ? "bg-text-primary text-background border-text-primary shadow-lg scale-[1.01]"
            : "bg-surface-1 border-border-default hover:border-border-strong hover:bg-surface-2 hover:shadow-md",
          className
        )}
        {...props}
      >
        <div className={cn("h-16 w-full bg-gradient-to-br relative", accent)}>
          <div className="absolute inset-0 flex items-center justify-center opacity-60">
            {name === "Glassmorphism" && (
              <div className="w-20 h-10 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 shadow-lg" />
            )}
            {name === "Bento Grid" && (
              <div className="grid grid-cols-3 gap-1.5">
                <div className="w-6 h-6 rounded bg-white/80" />
                <div className="w-6 h-6 rounded bg-white/40" />
                <div className="w-6 h-10 rounded bg-white/60 row-span-2" />
                <div className="w-6 h-6 rounded bg-white/50" />
                <div className="w-6 h-6 rounded bg-white/30" />
              </div>
            )}
            {name === "Neo-Brutalism" && (
              <div className="w-16 h-8 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-[8px] font-black text-black">
                BOLD
              </div>
            )}
            {name === "Retro / Y2K" && (
              <div className="w-14 h-8 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300 border border-white/40 flex items-center justify-center text-[7px] font-bold text-white tracking-widest">
                CHROME
              </div>
            )}
            {name === "3D / Immersive" && (
              <div
                className="w-10 h-10 rounded-xl bg-white/90 shadow-xl border border-white"
                style={{ transform: "rotateX(12deg) rotateY(-18deg)" }}
              />
            )}
          </div>
          {selected && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background text-text-primary flex items-center justify-center shadow-sm animate-in">
              <Check size={14} strokeWidth={3} />
            </div>
          )}
        </div>
        <div className="p-3.5 flex-1 flex flex-col gap-1">
          <div
            className={cn(
              "text-sm font-semibold leading-none",
              selected ? "text-background" : "text-text-primary"
            )}
          >
            {name}
          </div>
          <div className={cn("text-xs", selected ? "text-background/70" : "text-text-muted")}>
            {feel}
          </div>
          <div
            className={cn(
              "text-[11px] leading-snug mt-1 line-clamp-2",
              selected ? "text-background/60" : "text-text-secondary"
            )}
          >
            {traits}
          </div>
        </div>
      </button>
    )
  }
)
ThemeCard.displayName = "ThemeCard"

export { ThemeCard }
export default ThemeCard
