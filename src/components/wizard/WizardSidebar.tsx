import * as React from "react"
import {
  Layout,
  Database,
  Cpu,
  FileCode,
  Terminal,
  Settings,
  Lock,
  LayoutTemplate,
  Palette,
  Moon,
  Sun,
  Puzzle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tooltip } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import type { AppState, AppConfig } from "@/types/blueprint"

export interface WizardSidebarProps {
  phase: string
  state: AppState
  config: AppConfig
  isAdmin: boolean
  mobileOpen: boolean
  avatarMenuOpen: boolean
  wizardFlow: string[]
  currentIndex: number
  progressValue: number
  onPhaseChange: (phase: string) => void
  onCloseMobile: () => void
  onAvatarMenuChange: (open: boolean) => void
  onToggleTheme: () => void
  onAdminAuth: () => void
  onLogoutAdmin: () => void
  setPhase: (p: string) => void
}

export const WizardSidebar = React.memo<WizardSidebarProps>(
  ({
    phase,
    state,
    config,
    isAdmin,
    mobileOpen,
    avatarMenuOpen,
    wizardFlow,
    currentIndex,
    progressValue,
    onPhaseChange,
    onCloseMobile,
    onAvatarMenuChange,
    onToggleTheme,
    onAdminAuth,
    onLogoutAdmin,
  }) => {
    const navItems: { id: string; label: string; icon: any }[] = [
      { id: "project", label: "01. Project", icon: Layout },
      { id: "frontend", label: "02. Frontend", icon: Layout },
      { id: "backend", label: "03. Backend", icon: Database },
      { id: "architecture", label: "04. Architecture", icon: Cpu },
      { id: "theme", label: "05. Visual Style", icon: Palette },
      {
        id: "skills",
        label: `06. Skills${state.selectedSkills.length ? ` · ${state.selectedSkills.length}` : ""}`,
        icon: Puzzle,
      },
      ...config.customPages.map((p, idx) => ({
        id: p.id,
        label: `0${7 + idx}. ${p.title}`,
        icon: LayoutTemplate,
      })),
      { id: "prompt", label: `0${7 + config.customPages.length}. AI Prompt`, icon: Terminal },
      { id: "response", label: `0${8 + config.customPages.length}. Response`, icon: Terminal },
      { id: "blueprint", label: `0${9 + config.customPages.length}. Blueprint`, icon: FileCode },
    ]
    if (isAdmin) navItems.push({ id: "admin", label: "Admin Config", icon: Settings })
    const totalSteps = wizardFlow.length
    const grouped = {
      setup: navItems.slice(0, 4),
      style: navItems.slice(4, 6 + config.customPages.length),
      output: navItems.slice(6 + config.customPages.length),
    }

    const renderNavGroup = (items: typeof navItems, label: string) => (
      <div className="space-y-1">
        <div className="px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase text-text-muted">
          {label}
        </div>
        {items.map((item) => {
          const isActive = phase === item.id
          return (
            <div
              key={item.id}
              onClick={() => {
                onPhaseChange(item.id)
                onCloseMobile()
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onPhaseChange(item.id)
                  onCloseMobile()
                }
              }}
              className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                isActive
                  ? "bg-surface-3 text-text-primary font-medium shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon size={16} className={isActive ? "text-text-primary" : "text-text-muted"} />
              <span className="truncate">{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-text-primary" aria-hidden />}
            </div>
          )
        })}
      </div>
    )

    return (
      <>
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
        )}
        <aside
          className={`w-64 border-r border-border-default bg-surface-1 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-40 transition-transform duration-200 ease-out md:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Wizard navigation"
        >
          <div
            className="p-6 border-b border-border-subtle cursor-pointer hover:bg-surface-2 transition-colors"
            onClick={() => onPhaseChange("landing")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onPhaseChange("landing")
              }
            }}
          >
            <h1 className="font-mono font-bold tracking-tight text-xl">BLUEPRINT</h1>
            <p className="text-text-muted text-xs mt-1">PLANNING LAYER · v2.0</p>
          </div>
          <div className="px-4 pt-4 pb-2 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-text-muted">PROGRESS</span>
              <span className="text-text-secondary">
                {currentIndex >= 0 ? currentIndex + 1 : 0} / {totalSteps}
              </span>
            </div>
            <Progress value={progressValue} className="h-1.5" aria-label="Wizard progress" />
            <div className="text-[11px] text-text-muted truncate">{phase === "landing" ? "Start planning" : phase}</div>
          </div>
          <Separator className="mx-4 w-auto" />
          <nav className="flex-1 p-4 flex flex-col gap-5 overflow-y-auto" aria-label="Wizard steps">
            {renderNavGroup(grouped.setup, "Setup")}
            {renderNavGroup(grouped.style, "Style")}
            {renderNavGroup(grouped.output, "Output")}
          </nav>
          <div className="p-4 border-t border-border-subtle space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>BP</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-text-primary leading-none truncate">Workspace</div>
                <div className="text-[11px] text-text-muted truncate">{state.projectType || "No type selected"}</div>
              </div>
              <DropdownMenu open={avatarMenuOpen} onOpenChange={onAvatarMenuChange}>
                <DropdownMenuTrigger
                  className="w-7 h-7 rounded-md border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                  aria-label="Workspace menu"
                >
                  <Settings size={12} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="left-0 right-auto w-52">
                  <div className="px-3 py-2">
                    <div className="text-xs font-medium text-text-primary truncate">{state.projectName || "Untitled"}</div>
                    <div className="text-[11px] text-text-muted">{phase}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onPhaseChange("project")}>Go to Project</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPhaseChange("theme")}>Visual Style</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPhaseChange("prompt")}>View Prompt</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onAdminAuth}>
                    <Lock size={12} className="mr-2" /> {isAdmin ? "Admin Config" : "Admin Login"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Tooltip content={state.themeModifiers.mode === "light" ? "Switch to dark" : "Switch to light"}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleTheme}
                  className="flex-1 justify-start h-8 text-xs"
                  aria-label="Toggle theme"
                >
                  {state.themeModifiers.mode === "light" ? <Moon size={14} /> : <Sun size={14} />}
                  {state.themeModifiers.mode === "light" ? "Dark" : "Light"} mode
                </Button>
              </Tooltip>
              <Badge variant="secondary" className="text-[10px]">
                v2.0
              </Badge>
            </div>
            {!isAdmin ? (
              <button
                onClick={onAdminAuth}
                className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1 py-1 w-full"
              >
                <Lock size={12} /> Admin Login
              </button>
            ) : (
              <button
                onClick={onLogoutAdmin}
                className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1 py-1 w-full"
              >
                <Lock size={12} /> Logout Admin
              </button>
            )}
          </div>
        </aside>
      </>
    )
  },
)
WizardSidebar.displayName = "WizardSidebar"
export default WizardSidebar
