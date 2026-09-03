import * as React from "react"
import { Check, Layers, Wand2, Sparkles, Type, ALargeSmall, Terminal, Palette } from "lucide-react"
import { ThemeCard } from "@/components/ui/theme-card"
import type { AppState } from "@/types/blueprint"
import type { Theme, ModifierGroup, SubTheme, Font, FontPairing } from "@/types/blueprint"

export interface ThemePhaseProps {
  state: AppState
  themes: Theme[]
  modifierGroups: ModifierGroup[]
  subThemes: SubTheme[]
  fonts: Font[]
  fontPairings: FontPairing[]
  setState: React.Dispatch<React.SetStateAction<AppState>>
  updateState: (k: keyof AppState, v: unknown) => void
  setThemeModifier: (g: string, v: string) => void
  toggleThemeExtra: (id: string) => void
  applyFontPairing: (id: string) => void
  fontFilter: string
  setFontFilter: (f: string) => void
  renderCustomSections: (pageId: string) => React.ReactNode
  wizardNav: React.ReactNode
}

export const ThemePhase = React.memo<ThemePhaseProps>(
  ({ state, themes, modifierGroups, subThemes, fonts, fontPairings, setState, updateState, setThemeModifier, toggleThemeExtra, applyFontPairing, fontFilter, setFontFilter, renderCustomSections, wizardNav }) => {
    const selectedTheme = themes.find((t) => t.id === state.theme)
    const comboStr = selectedTheme
      ? `${state.themeModifiers.mode} · ${state.themeModifiers.palette} · ${state.themeModifiers.motion} · ${state.themeModifiers.depth} · ${state.themeModifiers.density} → ${selectedTheme.name}${
          state.themeExtras.length ? ` + ${state.themeExtras.map((id) => subThemes.find((s) => s.id === id)?.label).join(" + ")}` : ""
        }`
      : null
    return (
      <div className="max-w-4xl animate-in pb-20">
        <h2 className="text-3xl font-bold mb-2 tracking-tight flex items-center gap-3">
          <Palette size={28} className="text-text-muted" /> Visual Style
        </h2>
        <p className="text-text-secondary mb-6 border-b border-border-default pb-8">
          Pick a primary theme and layer modifiers. Combine styles like <span className="text-text-primary font-medium">Dark Luxury + Glassmorphism + Bento + Kinetic</span> — curated for 2026 aesthetics.
        </p>
        {comboStr && (
          <div className="mb-8 flex items-center gap-2 text-xs font-mono bg-surface-2 border border-border-default rounded-md px-4 py-3">
            <Sparkles size={14} className="text-text-muted shrink-0" />
            <span className="text-text-secondary">COMBO:</span>
            <span className="text-text-primary truncate">{comboStr}</span>
            <button onClick={() => updateState("theme", "")} className="ml-auto text-text-muted hover:text-text-primary underline">
              clear
            </button>
          </div>
        )}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-text-muted" />
            <h3 className="text-sm font-semibold tracking-widest uppercase text-text-secondary">Primary Theme — pick one</h3>
            <span className="text-xs text-text-muted ml-2">10 styles</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {themes.map((t) => (
              <ThemeCard key={t.id} name={t.name} feel={t.feel} traits={t.traits} accent={t.accent} selected={state.theme === t.id} onClick={() => updateState("theme", t.id)} />
            ))}
          </div>
          <p className="text-xs text-text-muted mt-3 italic">Minimalist, Glassmorphism, Bento, Neo-Brutalism, Editorial, Swiss, Neumorphism, Retro/Y2K, 3D Immersive, Maximalist</p>
        </div>
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 size={16} className="text-text-muted" />
            <h3 className="text-sm font-semibold tracking-widest uppercase text-text-secondary">Modifiers — fine-tune the feel</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modifierGroups.map((g) => (
              <div key={g.id} className="bg-surface-1 border border-border-default rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-text-muted text-xs w-5 text-center">{g.icon}</span>
                  <span className="text-xs font-semibold tracking-widest uppercase text-text-secondary">{g.label}</span>
                </div>
                <div className="flex gap-1.5">
                  {g.options.map((opt) => {
                    const active = state.themeModifiers[g.id] === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setThemeModifier(g.id, opt.value)}
                        className={`flex-1 px-2 py-2.5 rounded-md text-xs font-medium border transition-colors ${active ? "bg-text-primary text-background border-text-primary" : "bg-surface-2 border-border-default text-text-secondary hover:border-text-muted hover:text-text-primary"}`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-3">Modifiers layer on top — e.g. Dark + Colorful + Elevated + Kinetic gives a premium AI-era feel. Mix Minimalist with Monochrome + Subtle for calm.</p>
        </div>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-text-muted" />
            <h3 className="text-sm font-semibold tracking-widest uppercase text-text-secondary">Additional Layers — optional, multi-select</h3>
          </div>
          <p className="text-xs text-text-muted mb-3">Add one or two supporting styles. Don&apos;t overmix — 1 dominant + 1-2 supports works best.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {subThemes.map((s) => {
              const active = state.themeExtras.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => toggleThemeExtra(s.id)}
                  className={`px-3 py-3 rounded-md border text-left flex items-center gap-3 transition-all ${active ? "bg-surface-3 border-text-secondary text-text-primary" : "bg-surface-1 border-border-default text-text-secondary hover:border-text-muted hover:text-text-primary"}`}
                >
                  <div className={`w-4 h-4 min-w-[16px] border rounded flex items-center justify-center ${active ? "border-text-primary bg-text-primary text-background" : "border-border-strong"}`}>
                    {active && <Check size={12} strokeWidth={4} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-none truncate">{s.label}</div>
                    <div className="text-[11px] text-text-muted truncate">{s.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        <div className="border-t border-border-default pt-10 mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Type size={22} className="text-text-muted" />
            <h3 className="text-xl font-bold tracking-tight">Typography</h3>
            <span className="text-xs bg-surface-2 border border-border-default text-text-muted px-2 py-1 rounded-full ml-2">20 fonts · 10 pairings</span>
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Choose a font system. The curated trio right now is <span className="text-text-primary font-medium">Geist + Inter + Satoshi</span> — Geist for technical, Inter as neutral, Satoshi as distinctive. For Blueprint, recommended:{" "}
            <span className="text-text-primary">Headings: Geist · Body: Geist · Mono: Geist Mono</span> (Vercel/Linear aesthetic).
          </p>
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-mono bg-surface-2 border border-border-default rounded-md px-4 py-3">
            <ALargeSmall size={14} className="text-text-muted shrink-0" />
            <span className="text-text-secondary">TYPE:</span>
            <span className="text-text-primary">
              Heading → <b>{state.fontHeading}</b> · Body → <b>{state.fontBody}</b> · Mono → <b>{state.fontMono}</b>
            </span>
            {state.fontPairing && <span className="ml-auto text-text-muted hidden md:inline">Preset: {fontPairings.find((p) => p.id === state.fontPairing)?.label || state.fontPairing}</span>}
          </div>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-text-muted" />
              <h4 className="text-xs font-semibold tracking-widest uppercase text-text-secondary">Font Pairings — pick a preset</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {fontPairings.map((pair) => {
                const active = state.fontPairing === pair.id
                return (
                  <button
                    key={pair.id}
                    onClick={() => applyFontPairing(pair.id)}
                    className={`p-3.5 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${active ? "bg-text-primary text-background border-text-primary shadow-md" : "bg-surface-1 border-border-default hover:border-border-strong hover:bg-surface-2"}`}
                  >
                    <div className={`text-xs font-bold tracking-wide ${active ? "text-background" : "text-text-primary"}`}>{pair.label}</div>
                    <div className={`text-[11px] ${active ? "text-background/70" : "text-text-muted"}`}>
                      {pair.vibe} — H: {pair.heading} · B: {pair.body} · M: {pair.mono}
                    </div>
                    <div className={`mt-1 flex items-baseline gap-2 ${active ? "text-background" : "text-text-primary"}`}>
                      <span className="text-lg font-semibold leading-none" style={{ fontFamily: fonts.find((f) => f.name === pair.heading)?.fallback }}>
                        {pair.heading.split(" ")[0]}
                      </span>
                      <span className="text-xs opacity-60">+</span>
                      <span className="text-sm" style={{ fontFamily: fonts.find((f) => f.name === pair.body)?.fallback }}>
                        {pair.body.split(" ")[0]}
                      </span>
                      <span className="text-[11px] font-mono opacity-50 ml-auto">{pair.mono}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-text-muted mt-2">Pairings seen in Awwwards / curated modern sites (Geist+Neue Montreal, Inter+Neue Montreal, Geist Mono+Inter, etc.).</p>
          </div>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {["All", "Tech / AI", "Tech / SaaS", "Premium", "Creative", "SaaS", "Editorial", "Minimal", "Display", "Marketing"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFontFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${fontFilter === cat ? "bg-text-primary text-background border-text-primary" : "bg-surface-1 border-border-default text-text-secondary hover:border-text-muted"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            {(fontFilter === "All" ? fonts : fonts.filter((f) => f.category === fontFilter || (fontFilter === "Tech / AI" && f.category.includes("Tech")))).map((font) => {
              const isHeading = state.fontHeading === font.name
              const isBody = state.fontBody === font.name
              const isSelected = isHeading && isBody
              const isMono = state.fontMono === font.name
              return (
                <button
                  key={font.id}
                  onClick={() => setState((prev) => ({ ...prev, fontHeading: font.name, fontBody: font.name, fontPairing: "" }))}
                  className={`rounded-lg border p-4 text-left flex flex-col gap-2 transition-all ${isSelected ? "bg-text-primary text-background border-text-primary shadow" : isHeading || isBody ? "bg-surface-3 border-text-secondary text-text-primary" : "bg-surface-1 border-border-default hover:border-border-strong text-text-primary"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-3xl font-semibold leading-none" style={{ fontFamily: font.fallback }}>
                      {font.name === "Geist" ? "Geist" : font.name === "Neue Montreal" ? "Neue M" : font.name.split(" ")[0]}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {isSelected && <span className="w-5 h-5 rounded-full bg-background text-text-primary flex items-center justify-center"><Check size={12} strokeWidth={3} /></span>}
                      {!isSelected && (isHeading || isBody) && <span className="text-[10px] border border-current rounded px-1 py-0.5">active</span>}
                      {isMono && <span className="text-[10px] bg-surface-2 border border-border-default rounded px-1 py-0.5">mono</span>}
                    </div>
                  </div>
                  <div className={`text-xs ${isSelected ? "text-background/80" : "text-text-muted"}`}>Aa · The quick brown fox</div>
                  <div className={`text-xs font-medium leading-none ${isSelected ? "text-background" : "text-text-primary"}`}>{font.name}</div>
                  <div className={`text-[11px] leading-snug ${isSelected ? "text-background/70" : "text-text-secondary"}`}>{font.vibe}</div>
                  <div className={`text-[11px] ${isSelected ? "text-background/60" : "text-text-muted"}`}>Best for: {font.bestFor} · {font.category}</div>
                  <div className="flex gap-1 mt-1">
                    <span onClick={(e) => { e.stopPropagation(); setState((p) => ({ ...p, fontHeading: font.name, fontPairing: "" })) }} className={`text-[10px] px-2 py-1 rounded border ${state.fontHeading === font.name ? "bg-background text-text-primary border-background" : "bg-surface-2 border-border-default hover:border-text-muted"}`}>H</span>
                    <span onClick={(e) => { e.stopPropagation(); setState((p) => ({ ...p, fontBody: font.name, fontPairing: "" })) }} className={`text-[10px] px-2 py-1 rounded border ${state.fontBody === font.name ? "bg-background text-text-primary border-background" : "bg-surface-2 border-border-default hover:border-text-muted"}`}>Body</span>
                    <span onClick={(e) => { e.stopPropagation(); setState((p) => ({ ...p, fontMono: font.name === "Clash Display" ? "Geist Mono" : font.name, fontPairing: "" })) }} className={`text-[10px] px-2 py-1 rounded border ${state.fontMono === font.name ? "bg-background text-text-primary border-background" : "bg-surface-2 border-border-default hover:border-text-muted"}`}>Mono</span>
                  </div>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-text-muted mb-4">Click a card to set Heading + Body together. Use <b>H / Body / Mono</b> chips to set each role individually. Pairings above auto-set all three.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-surface-1 border border-border-default rounded-lg p-3"><div className="text-xs font-semibold text-text-primary mb-1">🔥 For Tech / AI</div><div className="text-[11px] text-text-secondary">Geist, Inter, Space Grotesk, IBM Plex Sans, Manrope</div></div>
            <div className="bg-surface-1 border border-border-default rounded-lg p-3"><div className="text-xs font-semibold text-text-primary mb-1">🏆 For Premium / Luxury</div><div className="text-[11px] text-text-secondary">Neue Montreal, Suisse Intl, Aeonik, GT America, Helvetica Now, Graphik</div></div>
            <div className="bg-surface-1 border border-border-default rounded-lg p-3"><div className="text-xs font-semibold text-text-primary mb-1">🎨 For Creative / Editorial</div><div className="text-[11px] text-text-secondary">Satoshi, Switzer, Instrument Sans, General Sans + Editorial New, Instrument Serif</div></div>
          </div>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2"><Terminal size={14} className="text-text-muted" /><h4 className="text-xs font-semibold tracking-widest uppercase text-text-secondary">Monospace — for code / labels / metadata</h4></div>
            <div className="flex flex-wrap gap-2">
              {["Geist Mono", "JetBrains Mono", "IBM Plex Mono", "GT America Mono"].map((mono) => (
                <button key={mono} onClick={() => setState((p) => ({ ...p, fontMono: mono, fontPairing: "" }))} className={`px-3 py-2 rounded-md border text-xs font-mono ${state.fontMono === mono ? "bg-text-primary text-background border-text-primary" : "bg-surface-1 border-border-default text-text-secondary hover:border-text-muted"}`}>{mono}</button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-2">Blueprint default: <b>Geist Mono</b> for technical metadata — pairs best with Geist/Inter headings.</p>
          </div>
        </div>
        <div className="bg-surface-1 border border-border-strong rounded-lg p-4 flex gap-3 mb-6">
          <div className="text-text-muted mt-0.5"><Palette size={18} /></div>
          <div className="text-sm"><div className="font-medium text-text-primary mb-1">How to combine Theme + Type</div><div className="text-text-secondary leading-relaxed text-xs">Pick 1 theme + 5 modifiers + optionally 1-2 layers + a font pairing. Example: <span className="text-text-primary">Minimalist + Dark + Monochrome + Flat + Geist + Geist Mono</span> = calm dev tool. <span className="text-text-primary">Glassmorphism + Liquid Glass + Aurora + Space Grotesk + Inter</span> = futuristic AI product. Injected into AI prompt as <span className="font-mono text-text-muted"># TYPOGRAPHY</span> + <span className="font-mono text-text-muted"># VISUAL STYLE</span>.</div></div>
        </div>
        {renderCustomSections("theme")}
        {wizardNav}
      </div>
    )
  },
)
ThemePhase.displayName = "ThemePhase"
export default ThemePhase
