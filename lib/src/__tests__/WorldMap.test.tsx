/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WorldMap from "../index.js";
import type {
  CountryContext,
  DetailProvider,
  RegionCollectionRecord,
} from "../types.js";
import { disputedTerritories } from "../disputes.js";

// Mock react-path-tooltip. It relies on browser layout APIs
// (getBoundingClientRect measurements for tooltip positioning)
// that are not meaningful in jsdom.
vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [
  { country: "us", value: 100 },
  { country: "cn", value: 200 },
] as const;

const detailCollection: RegionCollectionRecord = {
  countryCode: "US",
  countryName: "United States",
  coverageStatus: "complete",
  expectedRegionCount: 2,
  regions: [
    {
      id: "us-west",
      countryCode: "US",
      name: "West",
      kind: "state",
      path: "M220 215 L300 215 L300 285 L220 285 Z",
      centroid: [260, 250],
      bounds: [
        [220, 215],
        [300, 285],
      ],
    },
    {
      id: "us-east",
      countryCode: "US",
      name: "East",
      kind: "state",
      path: "M320 215 L420 215 L420 285 L320 285 Z",
      centroid: [370, 250],
      bounds: [
        [320, 215],
        [420, 285],
      ],
    },
  ],
};

const detailProvider: DetailProvider = {
  supports: (countryCode) => countryCode.toUpperCase() === "US",
  loadRegions: () =>
    Promise.resolve({
      status: "ready",
      layer: "regions",
      countryCode: "US",
      coverageStatus: "complete",
      collection: detailCollection,
    }),
};

// ── Basic rendering ──────────────────────────────────────────────────────────

describe("WorldMap — rendering", () => {
  it("renders without crashing with minimal props", () => {
    const { container } = render(<WorldMap data={[]} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders an SVG element", () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders country <path> elements", () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(container.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("renders the regenerated core country topology through the public component", () => {
    const { container } = render(<WorldMap data={[]} />);
    expect(container.querySelectorAll("svg path")).toHaveLength(175);
  });

  it("wraps content in a div with the default worldmap__wrapper class", () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(container.querySelector(".worldmap__wrapper")).not.toBeNull();
  });

  it("applies containerClassName to the wrapper div, replacing the default", () => {
    const { container } = render(
      <WorldMap data={DATA} containerClassName="my-map" />,
    );
    expect(container.querySelector(".my-map")).not.toBeNull();
    expect(container.querySelector(".worldmap__wrapper")).toBeNull();
  });

  it("applies regionClassName to every country path", () => {
    const { container } = render(
      <WorldMap data={DATA} regionClassName="country" />,
    );
    expect(container.querySelectorAll("path.country").length).toBeGreaterThan(
      0,
    );
  });

  it("renders normally when consumers ignore dispute metadata", () => {
    const { container } = render(<WorldMap data={DATA} />);

    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("renders region detail paths as dotted thematic overlays", async () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        zoom={{ initialScale: 4 }}
        detailLevel="regions"
        detailProvider={detailProvider}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll("[data-region-id]")).toHaveLength(2);
    });

    const regionPath = container.querySelector("[data-region-id='us-west']")!;
    expect(regionPath.getAttribute("stroke-dasharray")).toBe("2 2");
    expect(regionPath.getAttribute("fill")).toBe("transparent");
    expect(regionPath.querySelector("title")?.textContent).toContain(
      "non-authoritative",
    );
  });

  it("keeps country paths visible when region detail is layered", async () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        zoom={{ initialScale: 4 }}
        detailLevel="regions"
        detailProvider={detailProvider}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll("[data-region-id]")).toHaveLength(2);
    });

    expect(container.querySelectorAll("svg path")).toHaveLength(177);
    expect(container.querySelectorAll("[data-region-id]")).toHaveLength(2);
    expect(
      Array.from(container.querySelectorAll("path > title")).some(
        (title) => title.textContent?.includes("United States"),
      ),
    ).toBe(true);
  });

  it("hides region map labels when zoom is too low", async () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        zoom={{ initialScale: 1 }}
        detailLevel="regions"
        detailProvider={detailProvider}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll("[data-region-id]")).toHaveLength(2);
    });

    expect(
      Array.from(container.querySelectorAll("svg text")).some(
        (label) => label.textContent === "West",
      ),
    ).toBe(false);
  });

  it("shows fitted region map labels when zoom is high enough", async () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        zoom={{ initialScale: 4 }}
        detailLevel="regions"
        detailProvider={detailProvider}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll("[data-region-id]")).toHaveLength(2);
    });

    expect(
      Array.from(container.querySelectorAll("svg text")).some(
        (label) => label.textContent === "West",
      ),
    ).toBe(true);
  });
});

// ── Title & accessibility ────────────────────────────────────────────────────

describe("WorldMap — title and accessibility", () => {
  it("renders a <figcaption> containing the title text", () => {
    render(<WorldMap data={DATA} title="Population Map" />);
    expect(screen.getByText("Population Map")).toBeInTheDocument();
  });

  it("does not render a <figcaption> when title prop is omitted", () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(container.querySelector("figcaption")).toBeNull();
  });

  it('SVG has role="img"', () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(container.querySelector('svg[role="img"]')).not.toBeNull();
  });

  it("SVG uses the title text as its aria-label when title is provided", () => {
    const { container } = render(<WorldMap data={DATA} title="My Map" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-label")).toBe("My Map");
    expect(svg.getAttribute("aria-labelledby")).toBeNull();
  });

  it('SVG has aria-label="World map" when no title prop is provided', () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(container.querySelector("svg")!.getAttribute("aria-label")).toBe(
      "World map",
    );
  });

  it("each country path contains an SVG <title> text alternative", () => {
    const { container } = render(<WorldMap data={DATA} />);
    // At least the countries in DATA should have titles with their value
    expect(container.querySelectorAll("path > title").length).toBeGreaterThan(
      0,
    );
  });

  it("countries with data get a tooltip title that includes the value", () => {
    const { container } = render(<WorldMap data={DATA} valueSuffix="people" />);
    const titles = Array.from(container.querySelectorAll("path > title")).map(
      (t) => t.textContent ?? "",
    );
    // At least one title should mention the United States
    expect(titles.some((t) => t.includes("United States"))).toBe(true);
  });
});

// ── Frame prop ───────────────────────────────────────────────────────────────

describe("WorldMap — frame", () => {
  it("renders a <rect> when frame=true", () => {
    const { container } = render(<WorldMap data={DATA} frame />);
    expect(container.querySelector("rect")).not.toBeNull();
  });

  it("does not render a <rect> by default (frame=false)", () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(container.querySelector("rect")).toBeNull();
  });

  it("applies frameColor as the rect stroke color", () => {
    const { container } = render(
      <WorldMap data={DATA} frame frameColor="crimson" />,
    );
    expect(container.querySelector("rect")!.getAttribute("stroke")).toBe(
      "crimson",
    );
  });
});

// ── Size prop ────────────────────────────────────────────────────────────────

describe("WorldMap — size", () => {
  it("accepts a numeric size and sets exact SVG width/height", () => {
    const { container } = render(<WorldMap data={DATA} size={400} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("400px");
    // Height = width * 3/4
    expect(svg.getAttribute("height")).toBe("300px");
  });

  it.each(["sm", "md", "lg", "xl", "xxl"] as const)(
    "accepts preset size %s without throwing",
    (preset) => {
      const { container } = render(<WorldMap data={DATA} size={preset} />);
      expect(container.querySelector("svg")).not.toBeNull();
    },
  );

  it('accepts size="responsive" without throwing', () => {
    const { container } = render(<WorldMap data={DATA} size="responsive" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

// ── richInteraction ──────────────────────────────────────────────────────────

describe("WorldMap — richInteraction", () => {
  it("stops propagation on mouse down and only prevents default for multi-clicks", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} richInteraction />,
    );
    const svg = container.querySelector("svg")!;

    const single = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      detail: 1,
    });
    const singleStop = vi.spyOn(single, "stopPropagation");
    const singlePrevent = vi.spyOn(single, "preventDefault");
    svg.dispatchEvent(single);

    expect(singleStop).toHaveBeenCalledTimes(1);
    expect(singlePrevent).not.toHaveBeenCalled();

    const multi = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      detail: 2,
    });
    const multiStop = vi.spyOn(multi, "stopPropagation");
    const multiPrevent = vi.spyOn(multi, "preventDefault");
    svg.dispatchEvent(multi);

    expect(multiStop).toHaveBeenCalledTimes(1);
    expect(multiPrevent).toHaveBeenCalledTimes(1);
  });

  it("makes the SVG focusable (tabIndex=0) when richInteraction=true", () => {
    const { container } = render(<WorldMap data={DATA} richInteraction />);
    expect(container.querySelector("svg")!.getAttribute("tabindex")).toBe("0");
  });

  it("SVG is not focusable when richInteraction is not set", () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(container.querySelector("svg")!.getAttribute("tabindex")).toBeNull();
  });

  it('sets aria-keyshortcuts="+ -" when richInteraction=true', () => {
    const { container } = render(<WorldMap data={DATA} richInteraction />);
    expect(
      container.querySelector("svg")!.getAttribute("aria-keyshortcuts"),
    ).toBe("+ -");
  });

  it("zooms in on + key and changes the <g> transform", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} richInteraction />,
    );
    const svg = container.querySelector("svg")!;
    const g = container.querySelector("svg > g")!;
    const before = g.getAttribute("transform");

    fireEvent.keyDown(svg, { key: "+" });

    expect(g.getAttribute("transform")).not.toBe(before);
  });

  it("resets zoom on - key, restoring the original transform", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} richInteraction />,
    );
    const svg = container.querySelector("svg")!;
    const g = container.querySelector("svg > g")!;
    const original = g.getAttribute("transform");

    fireEvent.keyDown(svg, { key: "+" });
    fireEvent.keyDown(svg, { key: "-" });

    expect(g.getAttribute("transform")).toBe(original);
  });

  it("accepts '=' as an alias for + (zoom in)", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} richInteraction />,
    );
    const svg = container.querySelector("svg")!;
    const g = container.querySelector("svg > g")!;
    const before = g.getAttribute("transform");

    fireEvent.keyDown(svg, { key: "=" });

    expect(g.getAttribute("transform")).not.toBe(before);
  });

  it("does not zoom in beyond 4× (scale stays at 4 on repeated +)", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} richInteraction />,
    );
    const svg = container.querySelector("svg")!;

    // 3 zoom-ins reach 4× (1 → 2 → 4); a 4th should be ignored
    fireEvent.keyDown(svg, { key: "+" });
    fireEvent.keyDown(svg, { key: "+" });
    fireEvent.keyDown(svg, { key: "+" });
    const at4x = container.querySelector("svg > g")!.getAttribute("transform")!;

    fireEvent.keyDown(svg, { key: "+" });
    expect(container.querySelector("svg > g")!.getAttribute("transform")).toBe(
      at4x,
    );
  });

  it("zooms around the pointer on double click and resets on a later double click at 4x", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} richInteraction />,
    );
    const svg = container.querySelector("svg")!;
    const g = container.querySelector("svg > g")!;
    const getBoundingClientRect = vi
      .spyOn(svg, "getBoundingClientRect")
      .mockReturnValue({
        left: 10,
        top: 20,
        width: 400,
        height: 300,
      } as DOMRect);

    const original = g.getAttribute("transform");

    fireEvent.doubleClick(svg, { clientX: 110, clientY: 120 });
    const zoomed = g.getAttribute("transform");
    expect(zoomed).not.toBe(original);

    fireEvent.doubleClick(svg, { clientX: 110, clientY: 120 });
    const at4x = g.getAttribute("transform");
    expect(at4x).not.toBe(original);

    fireEvent.doubleClick(svg, { clientX: 110, clientY: 120 });
    expect(g.getAttribute("transform")).toBe(original);

    getBoundingClientRect.mockRestore();
  });
});

// ── Click handler ────────────────────────────────────────────────────────────

describe("WorldMap — onClickFunction", () => {
  it("is called when a country path is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <WorldMap data={DATA} onClickFunction={onClick} />,
    );
    await user.click(container.querySelectorAll("path")[0]!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("passes a CountryContext (with event) to the callback", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <WorldMap data={DATA} onClickFunction={onClick} />,
    );
    await user.click(container.querySelectorAll("path")[0]!);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        countryCode: expect.any(String),
        countryName: expect.any(String),
        color: expect.any(String),
        minValue: expect.any(Number),
        maxValue: expect.any(Number),
        event: expect.any(Object),
      }),
    );
  });
});

// ── Dispute metadata ────────────────────────────────────────────────────────

describe("WorldMap — dispute metadata", () => {
  it("passes dispute metadata to styleFunction for supported region codes", () => {
    const styleFunction = vi.fn(() => ({}));

    render(<WorldMap data={[]} styleFunction={styleFunction} />);

    expect(styleFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        countryCode: "UA",
        dispute: disputedTerritories.crimea,
      }),
    );
  });

  it("passes dispute metadata to tooltipTextFunction for supported region codes", () => {
    const tooltipTextFunction = vi.fn(
      (context: CountryContext) => context.countryName,
    );

    render(
      <WorldMap
        data={[{ country: "UA", value: 1 }]}
        tooltipTextFunction={tooltipTextFunction}
      />,
    );

    expect(tooltipTextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        countryCode: "UA",
        dispute: disputedTerritories.crimea,
      }),
    );
  });

  it("does not attach dispute metadata to ordinary regions", () => {
    const styleFunction = vi.fn(() => ({}));

    render(<WorldMap data={[]} styleFunction={styleFunction} />);

    expect(styleFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        countryCode: "US",
        dispute: undefined,
      }),
    );
  });
});

// ── Text labels ──────────────────────────────────────────────────────────────

describe("WorldMap — textLabelFunction", () => {
  const northAmericaLabel = () => [{ label: "North America", x: 100, y: 100 }];
  const noLabels = () => [];

  it("renders <text> elements when textLabelFunction returns labels", () => {
    const { container } = render(
      // eslint-disable-next-line react/jsx-no-bind -- This prop is the subject under test.
      <WorldMap data={DATA} textLabelFunction={northAmericaLabel} />,
    );
    expect(container.querySelector("text")?.textContent).toBe("North America");
  });

  it("renders nothing extra when textLabelFunction returns an empty array", () => {
    const { container } = render(
      // eslint-disable-next-line react/jsx-no-bind -- This prop is the subject under test.
      <WorldMap data={DATA} textLabelFunction={noLabels} />,
    );
    expect(container.querySelector("text")).toBeNull();
  });
});

// ── Edge cases ───────────────────────────────────────────────────────────────

describe("WorldMap — edge cases", () => {
  it("renders with empty data without throwing", () => {
    expect(() => render(<WorldMap data={[]} />)).not.toThrow();
  });

  it("renders with a single data point (handles single-value range)", () => {
    expect(() =>
      render(<WorldMap data={[{ country: "us", value: 50 }]} />),
    ).not.toThrow();
  });

  it("handles string values without throwing", () => {
    expect(() =>
      render(
        <WorldMap
          data={[
            { country: "us", value: "High" },
            { country: "cn", value: "Low" },
          ]}
        />,
      ),
    ).not.toThrow();
  });
});
