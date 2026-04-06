/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Region from "../components/Region.js";

/** SVG context is required for SVG child elements in jsdom. */
function Svg({ children }: { children: React.ReactNode }) {
  return <svg>{children}</svg>;
}

const BASE = {
  strokeOpacity: 0.2,
  d: "M 0 0",
  countryName: "United States",
  svgTitle: "United States: 100 people",
} as const;

// ── Basic rendering ──────────────────────────────────────────────────────────

describe("Region — rendering", () => {
  it("renders a <path> element", () => {
    const { container } = render(<Region {...BASE} />, { wrapper: Svg });
    expect(container.querySelector("path")).not.toBeNull();
  });

  it("renders an SVG <title> child with the svgTitle text", () => {
    const { container } = render(
      <Region {...BASE} svgTitle="France: 42 km²" />,
      { wrapper: Svg },
    );
    expect(container.querySelector("path > title")?.textContent).toBe(
      "France: 42 km²",
    );
  });

  it("does not render a <title> when svgTitle is undefined", () => {
    const { container } = render(<Region {...BASE} svgTitle={undefined} />, {
      wrapper: Svg,
    });
    expect(container.querySelector("title")).toBeNull();
  });

  it("applies regionClassName to the path", () => {
    const { container } = render(
      <Region {...BASE} regionClassName="my-region" />,
      { wrapper: Svg },
    );
    expect(container.querySelector("path.my-region")).not.toBeNull();
  });
});

// ── Interactivity & ARIA ─────────────────────────────────────────────────────

describe("Region — interactivity", () => {
  it("has no role or tabIndex by default (non-interactive)", () => {
    const { container } = render(<Region {...BASE} />, { wrapper: Svg });
    const path = container.querySelector("path")!;
    expect(path.getAttribute("role")).toBeNull();
    expect(path.getAttribute("tabindex")).toBeNull();
  });

  it('has role="button" and tabIndex=0 when isInteractive=true', () => {
    const { container } = render(
      <Region {...BASE} isInteractive onClick={vi.fn()} />,
      { wrapper: Svg },
    );
    const path = container.querySelector("path")!;
    expect(path.getAttribute("role")).toBe("button");
    expect(path.getAttribute("tabindex")).toBe("0");
  });

  it("sets aria-label to countryName when interactive", () => {
    const { container } = render(
      <Region {...BASE} isInteractive countryName="Germany" />,
      { wrapper: Svg },
    );
    expect(container.querySelector("path")!.getAttribute("aria-label")).toBe(
      "Germany",
    );
  });

  it("does not set aria-label when not interactive", () => {
    const { container } = render(<Region {...BASE} isInteractive={false} />, {
      wrapper: Svg,
    });
    expect(
      container.querySelector("path")!.getAttribute("aria-label"),
    ).toBeNull();
  });
});

// ── Keyboard interaction ─────────────────────────────────────────────────────

describe("Region — keyboard", () => {
  it("fires onClick when Enter is pressed on an interactive region", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <Region {...BASE} isInteractive onClick={onClick} />,
      { wrapper: Svg },
    );
    const path = container.querySelector("path")!;
    act(() => {
      path.focus();
    });
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("fires onClick when Space is pressed on an interactive region", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <Region {...BASE} isInteractive onClick={onClick} />,
      { wrapper: Svg },
    );
    const path = container.querySelector("path")!;
    act(() => {
      path.focus();
    });
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does NOT fire onClick on Enter when the region is non-interactive", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <Region {...BASE} isInteractive={false} onClick={onClick} />,
      { wrapper: Svg },
    );
    const path = container.querySelector("path")!;
    act(() => {
      path.focus();
    });
    await user.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
  });
});

// ── Hover state ──────────────────────────────────────────────────────────────

describe("Region — hover", () => {
  it("adds the hover class on mouseOver", () => {
    const { container } = render(<Region {...BASE} />, { wrapper: Svg });
    const path = container.querySelector("path")!;
    fireEvent.mouseOver(path);
    expect(path.classList.contains("worldmap__region--hover")).toBe(true);
  });

  it("removes the hover class on mouseOut", () => {
    const { container } = render(<Region {...BASE} />, { wrapper: Svg });
    const path = container.querySelector("path")!;
    fireEvent.mouseOver(path);
    fireEvent.mouseOut(path);
    expect(path.classList.contains("worldmap__region--hover")).toBe(false);
  });

  it("adds the hover class on focus", () => {
    const { container } = render(
      <Region {...BASE} isInteractive onClick={vi.fn()} />,
      { wrapper: Svg },
    );
    const path = container.querySelector("path")!;
    fireEvent.focus(path);
    expect(path.classList.contains("worldmap__region--hover")).toBe(true);
  });

  it("removes the hover class on blur", () => {
    const { container } = render(
      <Region {...BASE} isInteractive onClick={vi.fn()} />,
      { wrapper: Svg },
    );
    const path = container.querySelector("path")!;
    fireEvent.focus(path);
    fireEvent.blur(path);
    expect(path.classList.contains("worldmap__region--hover")).toBe(false);
  });

  it("still adds the hover class when regionClassName is set (CSS hook always active)", () => {
    const { container } = render(
      <Region {...BASE} regionClassName="custom" />,
      { wrapper: Svg },
    );
    const path = container.querySelector("path")!;
    fireEvent.mouseOver(path);
    // The hover class is ALWAYS applied so consumers can style it via CSS.
    expect(path.classList.contains("worldmap__region--hover")).toBe(true);
  });

  it("does NOT apply inline stroke hover style when regionClassName is set", () => {
    const { container } = render(
      <Region {...BASE} regionClassName="custom" strokeOpacity={0.2} />,
      { wrapper: Svg },
    );
    const path = container.querySelector("path")!;
    fireEvent.mouseOver(path);
    // Inline strokeWidth override is suppressed when consumer owns the styling.
    expect(path.style.strokeWidth).toBe("");
  });

  it("does not dispatch synthetic mouse events during pointer hover", () => {
    const { container } = render(<Region {...BASE} />, { wrapper: Svg });
    const path = container.querySelector("path")!;
    const dispatchEventSpy = vi.spyOn(path, "dispatchEvent");

    fireEvent.mouseOver(path);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    expect((dispatchEventSpy.mock.calls[0]?.[0] as MouseEvent).type).toBe(
      "mouseover",
    );
  });

  it("dispatches tooltip bridge events once when focus comes from the keyboard", () => {
    const { container } = render(
      <Region {...BASE} isInteractive onClick={vi.fn()} />,
      { wrapper: Svg },
    );
    const path = container.querySelector("path")!;
    const dispatchEventSpy = vi.spyOn(path, "dispatchEvent");

    fireEvent.focus(path);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(4);
    expect(
      dispatchEventSpy.mock.calls
        .map(([event]) => event.type)
        .filter((type) => type.startsWith("mouse")),
    ).toEqual(["mouseover", "mouseenter"]);
  });
});

// ── href (link) rendering ────────────────────────────────────────────────────

describe("Region — href", () => {
  it("wraps the path in an <a> when a string href is provided", () => {
    const { container } = render(
      <Region {...BASE} isInteractive href="https://example.com" />,
      { wrapper: Svg },
    );
    expect(container.querySelector("a")).not.toBeNull();
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "https://example.com",
    );
  });

  it("the anchor has aria-label equal to countryName", () => {
    const { container } = render(
      <Region
        {...BASE}
        isInteractive
        href="https://example.com"
        countryName="Spain"
      />,
      { wrapper: Svg },
    );
    expect(container.querySelector("a")?.getAttribute("aria-label")).toBe(
      "Spain",
    );
  });

  it("accepts an object href and spreads all its props onto the <a>", () => {
    const { container } = render(
      <Region
        {...BASE}
        isInteractive
        href={{ href: "/de", target: "_blank", rel: "noopener" }}
      />,
      { wrapper: Svg },
    );
    const a = container.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("/de");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener");
  });

  it("does NOT add role=button or tabIndex to a linked region (the <a> handles focus)", () => {
    const { container } = render(
      <Region {...BASE} isInteractive href="https://example.com" />,
      { wrapper: Svg },
    );
    const path = container.querySelector("path")!;
    expect(path.getAttribute("role")).toBeNull();
    expect(path.getAttribute("tabindex")).toBeNull();
  });
});
