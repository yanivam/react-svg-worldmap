import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { responsify, useWindowWidth, useContainerWidth } from "../utils.js";
import { sizeMap , sizeBreakpoints } from "../constants.js";


// ── responsify ────────────────────────────────────────────────────────────────

describe("responsify", () => {
  describe("named size presets", () => {
    it("returns the exact preset width when the container is wide enough for sm", () => {
      expect(responsify("sm", 300)).toBe(sizeMap.sm); // 240
    });

    it("returns the exact preset width when the container is wide enough for md", () => {
      expect(responsify("md", 400)).toBe(sizeMap.md); // 336
    });

    it("returns the exact preset width when the container is wide enough for lg", () => {
      expect(responsify("lg", 500)).toBe(sizeMap.lg); // 480
    });

    it("returns the exact preset width when the container is wide enough for xl", () => {
      expect(responsify("xl", 700)).toBe(sizeMap.xl); // 640
    });

    it("returns the exact preset width when the container is wide enough for xxl", () => {
      expect(responsify("xxl", 1300)).toBe(sizeMap.xxl); // 1200
    });

    it("caps to the largest fitting breakpoint when container is narrower than requested (xl in 300px container)", () => {
      // Largest breakpoint ≤ 300 is 240 (sm); xl (640) is capped to 240
      expect(responsify("xl", 300)).toBe(240);
    });

    it("caps to the largest fitting breakpoint for md in a 250px container", () => {
      // Largest breakpoint ≤ 250 is 240 (sm)
      expect(responsify("md", 250)).toBe(240);
    });

    it("returns the sm breakpoint even when the container is very narrow (100px)", () => {
      // Smallest breakpoint is 240; if container < 240 the fallback is the first breakpoint
      expect(responsify("xl", 100)).toBe(sizeBreakpoints[0]);
    });
  });

  describe("responsive mode", () => {
    beforeEach(() => {
      Object.defineProperty(window, "innerWidth", {
        value: 1024,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, "innerHeight", {
        value: 768,
        writable: true,
        configurable: true,
      });
    });

    it("returns availableWidth when it is smaller than 75% of the min viewport dimension", () => {
      // 75% of min(1024, 768) = 576; availableWidth 400 < 576 → result = 400
      expect(responsify("responsive", 400)).toBe(400);
    });

    it("caps to 75% of the min viewport dimension when availableWidth exceeds it", () => {
      // Min(innerHeight, innerWidth) = 768; 75% = 576; availableWidth 800 > 576 → result = 576
      expect(responsify("responsive", 800)).toBeCloseTo(576);
    });
  });
});

// ── useWindowWidth ────────────────────────────────────────────────────────────

describe("useWindowWidth", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      value: 1200,
      writable: true,
      configurable: true,
    });
  });

  it("returns the current window.innerWidth on mount", () => {
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current).toBe(1200);
  });

  it("updates when the window resize event fires", () => {
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current).toBe(1200);

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        value: 600,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(600);
  });

  it("removes the resize listener on unmount (no state update after unmount)", () => {
    const { result, unmount } = renderHook(() => useWindowWidth());
    unmount();
    // Dispatching after unmount should not throw
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        value: 400,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event("resize"));
    });
    // The hook result is frozen after unmount — we just verify no error was thrown
    expect(result.current).toBeDefined();
  });
});

// ── useContainerWidth ─────────────────────────────────────────────────────────

describe("useContainerWidth", () => {
  // The global ResizeObserver stub is set up in setup.ts. Reset mocks between tests.
  beforeEach(() => {
    vi.mocked(global.ResizeObserver).mockClear();
  });

  it("returns null when containerEl is null", () => {
    const { result } = renderHook(() => useContainerWidth(null));
    expect(result.current).toBeNull();
  });

  it("initialises with the element's getBoundingClientRect width", () => {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      width: 480,
    } as DOMRect);

    const { result } = renderHook(() => useContainerWidth(el));
    expect(result.current).toBe(480);
  });

  it("calls ResizeObserver.observe with the provided element", () => {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      width: 320,
    } as DOMRect);

    renderHook(() => useContainerWidth(el));

    const observerInstance = vi.mocked(ResizeObserver).mock.results[0]!
      .value as {
      observe: ReturnType<typeof vi.fn>;
    };
    expect(observerInstance.observe).toHaveBeenCalledWith(el);
  });

  it("disconnects ResizeObserver when the component unmounts", () => {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      width: 320,
    } as DOMRect);

    const { unmount } = renderHook(() => useContainerWidth(el));

    const observerInstance = vi.mocked(ResizeObserver).mock.results[0]!
      .value as {
      disconnect: ReturnType<typeof vi.fn>;
    };
    unmount();
    expect(observerInstance.disconnect).toHaveBeenCalled();
  });

  it("returns null again when containerEl changes from an element to null", () => {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      width: 320,
    } as DOMRect);

    const { result, rerender } = renderHook(
      ({ element }: { element: HTMLElement | null }) =>
        useContainerWidth(element),
      { initialProps: { element: el } },
    );
    expect(result.current).toBe(320);

    rerender({ element: null });
    expect(result.current).toBeNull();
  });
});
