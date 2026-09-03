import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SelectCard, MultiSelectCard } from "@/components/ui/select-card"
import { ThemeCard } from "@/components/ui/theme-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ToastProvider, useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ToastHarness() {
  const { toast } = useToast()
  return (
    <button onClick={() => toast({ title: "Hello toast", description: "details", variant: "success" })}>
      fire toast
    </button>
  )
}

// ---------------------------------------------------------------------------
// cn util
// ---------------------------------------------------------------------------
describe("cn util", () => {
  it("merges and dedupes tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
    expect(cn("text-sm", undefined, false && "hidden")).toContain("text-sm")
  })
})

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------
describe("Dialog primitive", () => {
  it("does not render children when closed", () => {
    render(
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent><DialogTitle>Hidden</DialogTitle></DialogContent>
      </Dialog>
    )
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument()
  })

  it("renders when open and has role dialog + aria-modal", () => {
    render(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent><DialogTitle>Visible title</DialogTitle><DialogDescription>desc</DialogDescription></DialogContent>
      </Dialog>
    )
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true")
    expect(screen.getByText("Visible title")).toBeInTheDocument()
  })

  it("calls onOpenChange(false) on overlay click and on Escape", async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(
      <Dialog open={true} onOpenChange={spy}>
        <DialogContent><DialogTitle>T</DialogTitle></DialogContent>
      </Dialog>
    )
    // overlay is first div with aria-hidden
    const overlay = document.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(overlay).toBeTruthy()
    await user.click(overlay)
    expect(spy).toHaveBeenCalledWith(false)
    spy.mockClear()
    // Escape key
    await user.keyboard("{Escape}")
    expect(spy).toHaveBeenCalledWith(false)
  })

  it("close button calls onClose when provided", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent onClose={onClose}><DialogTitle>T</DialogTitle></DialogContent>
      </Dialog>
    )
    await user.click(screen.getByLabelText("Close dialog"))
    expect(onClose).toHaveBeenCalled()
  })

  it("DialogHeader / Footer render", () => {
    render(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader><DialogTitle>HT</DialogTitle></DialogHeader>
          <DialogFooter><Button>ok</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText("HT")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ok" })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
describe("Tabs primitive", () => {
  function TabsHarness() {
    const [v, setV] = React.useState("a")
    return (
      <Tabs value={v} onValueChange={setV}>
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>
    )
  }

  it("switches content on trigger click", async () => {
    const user = userEvent.setup()
    render(<TabsHarness />)
    expect(screen.getByText("Content A")).toBeInTheDocument()
    expect(screen.queryByText("Content B")).not.toBeInTheDocument()
    // aria-selected
    expect(screen.getByRole("tab", { name: "Tab A" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: "Tab B" })).toHaveAttribute("aria-selected", "false")
    expect(screen.getByRole("tablist")).toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: "Tab B" }))
    expect(await screen.findByText("Content B")).toBeInTheDocument()
    expect(screen.queryByText("Content A")).not.toBeInTheDocument()
    expect(screen.getByRole("tabpanel")).toBeInTheDocument()
  })

  it("has correct data-state", async () => {
    const user = userEvent.setup()
    render(<TabsHarness />)
    expect(screen.getByRole("tab", { name: "Tab A" })).toHaveAttribute("data-state", "active")
    await user.click(screen.getByRole("tab", { name: "Tab B" }))
    expect(screen.getByRole("tab", { name: "Tab B" })).toHaveAttribute("data-state", "active")
  })
})

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------
describe("Tooltip primitive", () => {
  it("shows tooltip on hover and hides on leave (accessible)", async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="tooltip text">
        <button>hover me</button>
      </Tooltip>
    )
    const btn = screen.getByRole("button", { name: "hover me" })
    // hidden initially
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    await user.hover(btn)
    expect(await screen.findByRole("tooltip")).toBeInTheDocument()
    expect(screen.getByRole("tooltip")).toHaveTextContent("tooltip text")
    await user.unhover(btn)
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })

  it("shows tooltip on focus (keyboard)", async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="tip"><button>focus me</button></Tooltip>
    )
    const btn = screen.getByRole("button", { name: "focus me" })
    await user.tab()
    expect(btn).toHaveFocus()
    expect(await screen.findByRole("tooltip")).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------
describe("Progress primitive", () => {
  it("renders with correct aria and clamped width", () => {
    const { rerender } = render(<Progress value={42} />)
    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveAttribute("aria-valuenow", "42")
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
    // inner width
    const inner = bar.firstElementChild as HTMLElement
    expect(inner.style.width).toBe("42%")

    rerender(<Progress value={150} />)
    expect(screen.getByRole("progressbar").firstElementChild as HTMLElement).toHaveProperty("style")
    expect((screen.getByRole("progressbar").firstElementChild as HTMLElement).style.width).toBe("100%")

    rerender(<Progress value={-10} />)
    expect((screen.getByRole("progressbar").firstElementChild as HTMLElement).style.width).toBe("0%")
  })

  it("rounds aria-valuenow", () => {
    render(<Progress value={42.7} />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "43")
  })
})

// ---------------------------------------------------------------------------
// DropdownMenu
// ---------------------------------------------------------------------------
describe("DropdownMenu primitive", () => {
  function DropdownHarness() {
    const [open, setOpen] = React.useState(false)
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setOpen(false)}>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  it("toggles on trigger, shows menu, aria-expanded", async () => {
    const user = userEvent.setup()
    render(<DropdownHarness />)
    const trigger = screen.getByRole("button", { name: "Open menu" })
    expect(trigger).toHaveAttribute("aria-haspopup", "menu")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    await user.click(trigger)
    expect(await screen.findByRole("menu")).toBeInTheDocument()
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getAllByRole("menuitem").length).toBe(3)
  })

  it("closes on Escape", async () => {
    const user = userEvent.setup()
    render(<DropdownHarness />)
    await user.click(screen.getByRole("button", { name: "Open menu" }))
    expect(await screen.findByRole("menu")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })

  it("menuitem is keyboard activatable with Enter", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    function H() {
      const [open, setOpen] = React.useState(true)
      return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>trig</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onClick}>Activate me</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
    render(<H />)
    const item = screen.getByRole("menuitem", { name: "Activate me" })
    item.focus()
    await user.keyboard("{Enter}")
    expect(onClick).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
describe("Avatar primitive", () => {
  it("renders fallback when no image", () => {
    render(<Avatar><AvatarFallback>AB</AvatarFallback></Avatar>)
    expect(screen.getByText("AB")).toBeInTheDocument()
  })

  it("renders Avatar with custom class", () => {
    const { container } = render(<Avatar className="custom-avatar"><AvatarFallback>ZZ</AvatarFallback></Avatar>)
    expect(container.firstChild).toHaveClass("custom-avatar")
  })
})

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
describe("Toast primitive", () => {
  it("useToast throws outside provider", () => {
    function Bad() {
      useToast()
      return null
    }
    expect(() => render(<Bad />)).toThrow("useToast must be used within ToastProvider")
  })

  it("fires toast and manual dismiss works", async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    )
    await user.click(screen.getByRole("button", { name: "fire toast" }))
    expect(await screen.findByText("Hello toast")).toBeInTheDocument()
    expect(screen.getByText("details")).toBeInTheDocument()
    // dismiss via close X button near toast
    const closeBtn = screen.getByText("Hello toast").parentElement?.parentElement?.querySelector("button") as HTMLElement
    if (closeBtn) {
      await user.click(closeBtn)
    }
    // after dismiss, toast gone (allow one tick for state update)
    // use waitFor via find - need to allow rerender
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByText("Hello toast")).not.toBeInTheDocument()
  })

  it("supports different variants", async () => {
    const user = userEvent.setup()
    function MultiToast() {
      const { toast } = useToast()
      return (
        <>
          <button onClick={() => toast({ title: "Toast OK", variant: "success" })}>btn-ok</button>
          <button onClick={() => toast({ title: "Toast ERR", variant: "error" })}>btn-err</button>
          <button onClick={() => toast({ title: "Toast INFO", variant: "info" })}>btn-info</button>
        </>
      )
    }
    render(<ToastProvider><MultiToast /></ToastProvider>)
    await user.click(screen.getByRole("button", { name: "btn-ok" }))
    expect(await screen.findByText("Toast OK")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "btn-err" }))
    expect(await screen.findByText("Toast ERR")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "btn-info" }))
    expect(await screen.findByText("Toast INFO")).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Other primitives smoke: Button variants, Card, Input, Textarea, Badge, Separator, SelectCard, ThemeCard
// ---------------------------------------------------------------------------
describe("Remaining primitives smoke", () => {
  it("Button variants render", () => {
    render(
      <>
        <Button variant="default">def</Button>
        <Button variant="destructive">dest</Button>
        <Button variant="outline">out</Button>
        <Button variant="secondary">sec</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="link">link</Button>
        <Button size="sm">sm</Button>
        <Button size="lg">lg</Button>
        <Button size="icon">ic</Button>
        <Button disabled>dis</Button>
      </>
    )
    expect(screen.getByRole("button", { name: "def" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "dis" })).toBeDisabled()
  })

  it("Card renders header/title/desc/content", () => {
    render(
      <Card>
        <CardHeader><CardTitle>CTitle</CardTitle><CardDescription>CDesc</CardDescription></CardHeader>
        <CardContent>CContent</CardContent>
      </Card>
    )
    expect(screen.getByText("CTitle")).toBeInTheDocument()
    expect(screen.getByText("CDesc")).toBeInTheDocument()
    expect(screen.getByText("CContent")).toBeInTheDocument()
  })

  it("Input renders label and handles change", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Input label="Name" placeholder="enter" value="" onChange={onChange} />)
    expect(screen.getByText("Name")).toBeInTheDocument()
    const input = screen.getByPlaceholderText("enter")
    await user.type(input, "a")
    expect(onChange).toHaveBeenCalled()
  })

  it("Textarea renders", () => {
    render(<Textarea label="Bio" placeholder="bio" value="" onChange={() => {}} />)
    expect(screen.getByText("Bio")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("bio")).toBeInTheDocument()
  })

  it("Badge renders", () => {
    render(<Badge>hello</Badge>)
    expect(screen.getByText("hello")).toBeInTheDocument()
  })

  it("Separator renders", () => {
    const { container } = render(<Separator />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it("SelectCard selected vs not", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { rerender } = render(<SelectCard label="Pick me" selected={false} onClick={onClick} />)
    expect(screen.getByRole("button", { name: "Pick me" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Pick me" })).toHaveAttribute("aria-pressed", "false")
    await user.click(screen.getByRole("button", { name: "Pick me" }))
    expect(onClick).toHaveBeenCalled()
    rerender(<SelectCard label="Pick me" selected={true} onClick={onClick} />)
    expect(screen.getByRole("button", { name: "Pick me" })).toHaveAttribute("aria-pressed", "true")
  })

  it("MultiSelectCard shows check when selected", () => {
    render(<MultiSelectCard label="Multi" selected={true} onClick={() => {}} />)
    expect(screen.getByRole("button", { name: "Multi" })).toBeInTheDocument()
    // check icon present via svg
    expect(document.querySelector("svg")).toBeTruthy()
  })

  it("ThemeCard renders and selected state", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<ThemeCard name="Minimalist" feel="Clean" traits="Traits" accent="from-zinc-100" selected={false} onClick={onClick} />)
    expect(screen.getByText("Minimalist")).toBeInTheDocument()
    expect(screen.getByText("Clean")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Minimalist/i }))
    expect(onClick).toHaveBeenCalled()
  })

  it("ThemeCard selected has aria-pressed true", () => {
    render(<ThemeCard name="Minimalist" feel="Clean" traits="t" accent="x" selected={true} onClick={() => {}} />)
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true")
  })
})
