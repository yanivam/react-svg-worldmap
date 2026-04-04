import "@testing-library/jest-dom";
import { vi } from "vitest";

// ── ResizeObserver ───────────────────────────────────────────────────────────
// jsdom does not implement ResizeObserver. Provide a minimal stub so any hook
// that observes container sizing can be tested without errors.
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));
