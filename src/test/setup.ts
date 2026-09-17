import '@testing-library/jest-dom'

// Mock localStorage for Vitest Node environment
const storage: Record<string, string> = {}

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => {
      storage[key] = String(value)
    },
    removeItem: (key: string) => {
      delete storage[key]
    },
    clear: () => {
      for (const key of Object.keys(storage)) {
        delete storage[key]
      }
    },
    get length() {
      return Object.keys(storage).length
    },
    key: (index: number) => Object.keys(storage)[index] ?? null,
  },
  writable: true,
})
