/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, react/jsx-no-bind -- userEvent is untyped here (as in WorldMap.test.tsx); callback props are the subject under test. */
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WorldMap, { disputedTerritoryAreas } from "../index.js";
import type { CountryContext, DataItem } from "../index.js";

// Same mock as WorldMap.test.tsx: the tooltip needs browser layout APIs.
vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA: DataItem[] = [
  { country: "ua", value: 1 },
  { country: "xk", value: 2 },
  { country: "us", value: 3 },
];

const tooltipText = (context: CountryContext) =>
  context.dispute?.display.tooltipLabel ?? context.countryName;

// Finds the country path whose <title> (the tooltip text) contains `text`.
function pathWithTitle(container: HTMLElement, text: string) {
  const title = Array.from(container.querySelectorAll("path > title")).find(
    (t) => t.textContent?.includes(text),
  );
  if (!title) throw new Error(`No path with title containing "${text}"`);
  return title.parentElement as unknown as SVGPathElement;
}

describe("WorldMap — dispute context", () => {
  it("passes dispute metadata to callbacks for disputed countries only", () => {
    const contexts = new Map<string, CountryContext>();
    const styleFunction = (context: CountryContext) => {
      contexts.set(context.countryCode.toUpperCase(), context);
      return {};
    };
    render(<WorldMap data={[]} styleFunction={styleFunction} />);

    expect(contexts.get("UA")?.dispute?.id).toBe("crimea");
    expect(contexts.get("PS")?.dispute?.id).toBe("palestinian-territories");
    expect(contexts.get("TW")?.dispute?.id).toBe("taiwan");
    expect(contexts.get("IN")?.dispute?.id).toBe("kashmir");
    expect(contexts.get("EH")?.dispute?.id).toBe("western-sahara");
    expect(contexts.get("XK")?.dispute?.id).toBe("kosovo");
    expect(contexts.get("US")?.dispute).toBeUndefined();
    expect(contexts.get("FR")?.dispute).toBeUndefined();
  });

  it("lets tooltipTextFunction show the dispute label", () => {
    const { container } = render(
      <WorldMap data={DATA} tooltipTextFunction={tooltipText} />,
    );
    const titles = Array.from(container.querySelectorAll("path > title")).map(
      (t) => t.textContent,
    );

    expect(titles).toContain("Crimea: disputed territory");
    expect(titles).toContain("Kosovo: partially recognized state");
    expect(titles).toContain("United States");
  });

  it("applies dispute-aware styles to disputed countries only", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        tooltipTextFunction={tooltipText}
        styleFunction={(context) =>
          context.dispute?.display.borderStyle === "dashed"
            ? { strokeDasharray: "4 2" }
            : {}
        }
      />,
    );

    expect(pathWithTitle(container, "Crimea").style.strokeDasharray).toBe(
      "4 2",
    );
    expect(
      pathWithTitle(container, "United States").style.strokeDasharray,
    ).toBe("");
  });

  it("includes the dispute in onClickFunction context", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <WorldMap
        data={DATA}
        tooltipTextFunction={tooltipText}
        onClickFunction={onClick}
      />,
    );

    await user.click(pathWithTitle(container, "Crimea"));
    expect(onClick).toHaveBeenLastCalledWith(
      expect.objectContaining({
        countryCode: "UA",
        dispute: expect.objectContaining({
          id: "crimea",
          recognizedSovereign: "Ukraine",
          controllingPower: "Russia",
        }),
      }),
    );

    await user.click(pathWithTitle(container, "United States"));
    expect(onClick).toHaveBeenLastCalledWith(
      expect.objectContaining({ countryCode: "US", dispute: undefined }),
    );
  });

  it("includes the dispute in hrefFunction context", () => {
    const hrefFunction = vi.fn((context: CountryContext) =>
      context.dispute ? `#dispute-${context.dispute.id}` : undefined,
    );
    const { container } = render(
      <WorldMap data={DATA} hrefFunction={hrefFunction} />,
    );

    expect(container.querySelector('a[href="#dispute-crimea"]')).not.toBeNull();
    expect(container.querySelector('a[href="#dispute-kosovo"]')).not.toBeNull();
  });
});

describe("WorldMap — disputed-territory overlay", () => {
  const territoryPaths = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("path[data-disputed-territory]"));

  it("is not rendered by default", () => {
    const { container } = render(<WorldMap data={DATA} />);
    expect(territoryPaths(container)).toHaveLength(0);
    expect(
      container.querySelector(".worldmap__disputed-territories"),
    ).toBeNull();
  });

  it("draws one shape per territory when enabled", () => {
    const { container } = render(
      <WorldMap data={DATA} showDisputedTerritories />,
    );
    const ids = territoryPaths(container).map((p) =>
      p.getAttribute("data-disputed-territory"),
    );

    expect(ids).toEqual(disputedTerritoryAreas.map((area) => area.id));
    expect(ids).toContain("crimea");
    expect(ids).toContain("aksai-chin");
    for (const path of territoryPaths(container))
      expect(path.getAttribute("d")).toMatch(/^M/);
  });

  it("highlights the territory, not the whole country", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        showDisputedTerritories
        disputedTerritoryColor="#123456"
      />,
    );
    const crimea = container.querySelector<SVGPathElement>(
      '[data-disputed-territory="crimea"]',
    )!;
    const taiwan = container.querySelector<SVGPathElement>(
      '[data-disputed-territory="taiwan"]',
    )!;

    expect(crimea.style.fill).toBe("#123456");
    expect(crimea.style.strokeDasharray).toBe("2 1");
    // Taiwan's display guidance is "unchanged": solid border.
    expect(taiwan.style.strokeDasharray).toBe("");
    // Ukraine itself keeps the default country style.
    expect(pathWithTitle(container, "Ukraine").style.fill).not.toBe("#123456");
  });

  it("uses the dispute metadata for the default tooltip", () => {
    const { container } = render(
      <WorldMap data={DATA} showDisputedTerritories />,
    );
    const title = container.querySelector(
      '[data-disputed-territory="crimea"] > title',
    )?.textContent;

    expect(title).toBe(
      "Crimea: disputed. Recognized sovereign: Ukraine. Controlled by: Russia. Parties: Ukraine, Russia",
    );
  });

  it("supports a custom tooltip and a click handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <WorldMap
        data={DATA}
        showDisputedTerritories
        disputedTerritoryTooltipFunction={(context) =>
          `${context.territoryName} (${context.dispute.id})`
        }
        onDisputedTerritoryClick={onClick}
      />,
    );
    const crimea = container.querySelector<SVGPathElement>(
      '[data-disputed-territory="crimea"]',
    )!;

    expect(crimea.querySelector("title")?.textContent).toBe("Crimea (crimea)");
    await user.click(crimea);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        territoryId: "crimea",
        territoryName: "Crimea",
        administration: "Admin. by Russia; Claimed by Ukraine",
        dispute: expect.objectContaining({
          id: "crimea",
          unStanding: expect.stringContaining("68/262"),
        }),
        event: expect.any(Object),
      }),
    );
  });
});
