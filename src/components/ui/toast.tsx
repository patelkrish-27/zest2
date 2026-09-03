import * as React from "react"
import { X, Check, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastVariant = "default" | "success" | "error" | "info"
export interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

const ToastContext = React.createContext<{ toasts: ToastItem[]; toast: (t: Omit<ToastItem, "id">) => void; dismiss: (id: string) => void } | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const toast = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...t, id }])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex gap-3 p-4 rounded-lg border shadow-lg animate-slide-in bg-surface-1",
              t.variant === "success" && "border-emerald-500/30 bg-emerald-500/10",
              t.variant === "error" && "border-red-500/30 bg-red-500/10",
              t.variant === "info" && "border-border-strong",
              !t.variant && "border-border-strong"
            )}
          >
            <span className="mt-0.5 shrink-0">
              {t.variant === "success" && <Check size={16} className="text-emerald-500" />}
              {t.variant === "error" && <AlertCircle size={16} className="text-red-500" />}
              {t.variant === "info" && <Info size={16} className="text-text-muted" />}
              {!t.variant && <Info size={16} className="text-text-muted" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary leading-none">{t.title}</div>
              {t.description && <div className="text-xs text-text-secondary mt-1 leading-relaxed">{t.description}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} className="shrink-0 text-text-muted hover:text-text-primary">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
