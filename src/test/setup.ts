import "@testing-library/jest-dom/vitest"

// mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: async (_text: string) => {},
  },
})

// JSDOM doesn't implement matchMedia etc - mock for completeness
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Polyfill MutationObserver for @testing-library waitFor
class MockMutationObserver {
  observe() {}
  disconnect() {}
  takeRecords() { return [] }
}
global.MutationObserver = MockMutationObserver as any

// ResizeObserver polyfill (Radix / shadcn)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

// IntersectionObserver polyfill
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
  root: null = null
  rootMargin = ""
  thresholds: number[] = []
} as any

// hasPointerCapture polyfill for Radix
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {}
}
