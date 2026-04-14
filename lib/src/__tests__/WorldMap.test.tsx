/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WorldMap from "../index.js";

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

    fireEvent.keyDown(svg, { key: "+" });
    fireEvent.keyDown(svg, { key: "-" });

    expect(g.getAttribute("transform")).toContain("scale(0.4166666666666667)");
    expect(g.getAttribute("transform")).not.toContain("NaN");
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

  it("does not zoom in beyond the maximum continuous zoom level", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} richInteraction />,
    );
    const svg = container.querySelector("svg")!;

    for (let index = 0; index < 10; index += 1)
      fireEvent.keyDown(svg, { key: "+" });

    const atMax = container
      .querySelector("svg > g")!
      .getAttribute("transform")!;

    fireEvent.keyDown(svg, { key: "+" });
    expect(container.querySelector("svg > g")!.getAttribute("transform")).toBe(
      atMax,
    );
  });

  it("zooms around the pointer on repeated double click", () => {
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
    expect(g.getAttribute("transform")).not.toBe(zoomed);

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

// ── Text labels ──────────────────────────────────────────────────────────────

describe("WorldMap — textLabelFunction", () => {
  const northAmericaLabel = () => [{ label: "North America", x: 100, y: 100 }];
  const noLabels = () => [];

  it("does not render automatic labels by default", () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(container.querySelector("text")).toBeNull();
  });

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

  it("defaults detailLevel to countries when omitted", () => {
    render(<WorldMap data={[]} />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "World map");
  });

  it("warns and falls back safely when detailLevel=regions is provided without a provider", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() =>
      render(<WorldMap data={[]} detailLevel="regions" />),
    ).not.toThrow();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Falling back to detailLevel="countries"'),
    );
  });

  it("requests region details after selecting a country in regions mode", async () => {
    const user = userEvent.setup();
    const loadRegions = vi.fn().mockResolvedValue({
      status: "ready",
      layer: "regions",
      detailLevel: "regions",
      collection: {
        countryCode: "US",
        englishCountryName: "United States",
        regions: [],
      },
    });
    const provider = {
      supports: () => true,
      loadRegions,
    };

    render(
      <WorldMap data={DATA} detailLevel="regions" detailProvider={provider} />,
    );

    await user.click(screen.getByLabelText("United States"));

    expect(loadRegions).toHaveBeenCalledWith("US");
  });

  it("does not request region details before a country is selected", () => {
    const loadRegions = vi.fn().mockResolvedValue({
      status: "ready",
      layer: "regions",
      detailLevel: "regions",
      collection: {
        countryCode: "US",
        englishCountryName: "United States",
        regions: [],
      },
    });
    const provider = {
      supports: () => true,
      loadRegions,
    };

    render(
      <WorldMap data={DATA} detailLevel="regions" detailProvider={provider} />,
    );

    expect(loadRegions).not.toHaveBeenCalled();
  });

  it("renders zoom controls in regions mode", () => {
    const provider = {
      supports: () => true,
      loadRegions: vi.fn().mockResolvedValue({
        status: "ready",
        layer: "regions",
        detailLevel: "regions",
        collection: {
          countryCode: "US",
          englishCountryName: "United States",
          regions: [],
        },
      }),
    };

    render(
      <WorldMap data={DATA} detailLevel="regions" detailProvider={provider} />,
    );

    expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("group", { name: "Map zoom controls" }),
      ).getAllByRole("button"),
    ).toHaveLength(2);
  });

  it("renders automatic region labels inside the transformed map group", async () => {
    const user = userEvent.setup();
    const providerWithRegions = {
      supports: () => true,
      loadRegions: vi.fn().mockResolvedValue({
        status: "ready",
        layer: "regions",
        detailLevel: "regions",
        collection: {
          countryCode: "US",
          englishCountryName: "United States",
          regions: [
            {
              id: "CA",
              countryCode: "US",
              labels: { englishName: "California" },
              path: "M0 0L10 0L10 10L0 10Z",
              bounds: [
                [0, 0],
                [160, 60],
              ],
              centroid: [80, 30],
            },
          ],
        },
      }),
    };

    const { container } = render(
      <WorldMap
        data={DATA}
        detailLevel="regions"
        detailProvider={providerWithRegions}
        showLabels
        size={400}
      />,
    );

    await user.click(screen.getByLabelText("United States"));
    await screen.findByRole("button", { name: "California" });

    const transformedGroup = container.querySelector("svg > g");
    expect(transformedGroup?.querySelector("text")?.textContent).toBe(
      "California",
    );
  });

  it("does not render automatic labels in regions mode unless showLabels is enabled", async () => {
    const user = userEvent.setup();
    const providerWithRegions = {
      supports: () => true,
      loadRegions: vi.fn().mockResolvedValue({
        status: "ready",
        layer: "regions",
        detailLevel: "regions",
        collection: {
          countryCode: "US",
          englishCountryName: "United States",
          regions: [
            {
              id: "CA",
              countryCode: "US",
              labels: { englishName: "California" },
              path: "M0 0L10 0L10 10L0 10Z",
              bounds: [
                [0, 0],
                [160, 60],
              ],
              centroid: [80, 30],
            },
          ],
        },
      }),
    };

    const { container } = render(
      <WorldMap
        data={DATA}
        detailLevel="regions"
        detailProvider={providerWithRegions}
        size={400}
      />,
    );

    await user.click(screen.getByLabelText("United States"));
    await screen.findByRole("button", { name: "California" });

    expect(container.querySelector("text")).toBeNull();
  });

  it("supports multiple zoom-in levels before disabling the control", async () => {
    const user = userEvent.setup();
    const provider = {
      supports: () => true,
      loadRegions: vi.fn().mockResolvedValue({
        status: "ready",
        layer: "regions",
        detailLevel: "regions",
        collection: {
          countryCode: "US",
          englishCountryName: "United States",
          regions: [],
        },
      }),
    };

    const { container } = render(
      <WorldMap
        data={DATA}
        detailLevel="regions"
        detailProvider={provider}
        size={400}
      />,
    );

    const svg = container.querySelector("svg")!;
    const group = container.querySelector("svg > g")!;
    const zoomIn = screen.getByRole("button", { name: "Zoom in" });
    const transforms = new Set<string | null>([
      group.getAttribute("transform"),
    ]);

    for (let index = 0; index < 4; index += 1) {
      await user.click(zoomIn);
      transforms.add(group.getAttribute("transform"));
    }

    expect(transforms.size).toBeGreaterThan(3);
    expect(svg).toBeInTheDocument();
  });

  it("announces drill-down state changes", async () => {
    const user = userEvent.setup();
    const provider = {
      supports: () => true,
      loadRegions: vi.fn().mockResolvedValue({
        status: "ready",
        layer: "regions",
        detailLevel: "regions",
        collection: {
          countryCode: "US",
          englishCountryName: "United States",
          regions: [],
        },
      }),
    };

    render(
      <WorldMap data={DATA} detailLevel="regions" detailProvider={provider} />,
    );

    await user.click(screen.getByLabelText("United States"));

    expect(
      screen.getByText(/Showing United States regions at/i),
    ).toBeInTheDocument();
  });

  it("pans the map when dragging after zooming in", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={400}
        richInteraction
        detailLevel="countries"
      />,
    );
    const svg = container.querySelector("svg")!;
    const group = container.querySelector("svg > g")!;

    fireEvent.keyDown(svg, { key: "+" });
    const beforePan = group.getAttribute("transform");

    fireEvent.mouseDown(svg, { button: 0, clientX: 180, clientY: 140 });
    fireEvent.mouseMove(svg, { clientX: 220, clientY: 170 });
    fireEvent.mouseUp(svg, { clientX: 220, clientY: 170 });

    expect(group.getAttribute("transform")).not.toBe(beforePan);
  });

  it("renders a visible-region list after ready region detail loads", async () => {
    const user = userEvent.setup();
    const providerWithRegions = {
      supports: () => true,
      loadRegions: vi.fn().mockResolvedValue({
        status: "ready",
        layer: "regions",
        detailLevel: "regions",
        collection: {
          countryCode: "US",
          englishCountryName: "United States",
          regions: [
            {
              id: "CA",
              countryCode: "US",
              labels: { englishName: "California" },
              path: "M0 0L10 0L10 10L0 10Z",
              bounds: [
                [0, 0],
                [10, 10],
              ],
            },
          ],
        },
      }),
    };

    const { container } = render(
      <WorldMap
        data={DATA}
        detailLevel="regions"
        detailProvider={providerWithRegions}
        size={400}
      />,
    );

    await user.click(screen.getByLabelText("United States"));

    expect(
      await screen.findByRole("region", { name: "Visible regions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "California" }),
    ).toBeInTheDocument();
    expect(
      Array.from(container.querySelectorAll("path > title")).some(
        (title) => title.textContent === "California",
      ),
    ).toBe(true);
  });

  it("keeps the world map visible when region detail is unavailable", async () => {
    const user = userEvent.setup();
    const providerUnavailable = {
      supports: () => true,
      loadRegions: vi.fn().mockResolvedValue({
        status: "unavailable",
        layer: "regions",
        detailLevel: "regions",
      }),
    };

    render(
      <WorldMap
        data={DATA}
        detailLevel="regions"
        detailProvider={providerUnavailable}
      />,
    );

    await user.click(screen.getByLabelText("China"));

    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("World map"),
    );
  });

  it("falls back to English region labels when translations are partial", async () => {
    const user = userEvent.setup();
    const providerWithRegions = {
      supports: () => true,
      loadRegions: vi.fn().mockResolvedValue({
        status: "ready",
        layer: "regions",
        detailLevel: "regions",
        collection: {
          countryCode: "US",
          englishCountryName: "United States",
          regions: [
            {
              id: "CA",
              countryCode: "US",
              labels: { englishName: "California" },
              path: "M0 0L10 0L10 10L0 10Z",
            },
            {
              id: "TX",
              countryCode: "US",
              labels: { englishName: "Texas" },
              path: "M20 20L30 20L30 30L20 30Z",
            },
          ],
        },
      }),
    };

    render(
      <WorldMap
        data={DATA}
        detailLevel="regions"
        detailProvider={providerWithRegions}
        regionNameTranslations={{ US: { CA: "California" } }}
      />,
    );

    await user.click(screen.getByLabelText("United States"));

    expect(
      await screen.findByRole("button", { name: "California" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Texas" })).toBeInTheDocument();
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
