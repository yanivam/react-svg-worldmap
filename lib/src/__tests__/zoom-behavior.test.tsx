import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

import WorldMap from "../index.js";
import type { MapPin, ZoomState } from "../index.js";

vi.mock("react-path-tooltip", () => ({
  PathTooltip: () => null,
}));

const DATA = [{ country: "us" as const, value: 100 }];
const PINS: MapPin[] = [
  {
    id: "paris",
    caption: "Paris",
    coordinates: [2.35, 48.86],
    countryCode: "FR",
    kind: "capital",
  },
];

function getSvg(container: HTMLElement): SVGSVGElement {
  return container.querySelector<SVGSVGElement>('svg[role="img"]')!;
}

function layerTransform(container: HTMLElement, layer: string) {
  return container
    .querySelector(`[data-map-layer="${layer}"]`)
    ?.getAttribute("transform");
}

function mockRect(svg: SVGSVGElement, width: number, height: number) {
  return vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width,
    height,
  } as DOMRect);
}

describe("onZoomChange", () => {
  it("does not loop when the parent stores the state with an inline callback", () => {
    const onChange = vi.fn();
    let renders = 0;
    function Parent() {
      const [, setZoom] = React.useState<ZoomState | null>(null);
      renders += 1;
      return (
        <WorldMap
          data={DATA}
          size={400}
          zoom
          // eslint-disable-next-line react/jsx-no-bind -- the inline callback is the point of the test.
          onZoomChange={(z) => {
            onChange(z);
            setZoom({ ...z });
          }}
        />
      );
    }

    render(<Parent />);
    expect(onChange.mock.calls.length).toBeLessThanOrEqual(1);
    expect(renders).toBeLessThan(5);

    const before = renders;
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(onChange).toHaveBeenLastCalledWith({
      scale: 2,
      translate: [-200, -150],
    });
    expect(renders - before).toBeLessThan(5);
  });

  it("is not called when an action changes nothing", () => {
    const onZoomChange = vi.fn();
    render(
      <WorldMap data={DATA} size={400} zoom onZoomChange={onZoomChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(onZoomChange).not.toHaveBeenCalled();
  });

  it("is also called for richInteraction zoom", () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <WorldMap
        data={DATA}
        size={400}
        richInteraction
        onZoomChange={onZoomChange}
      />,
    );
    fireEvent.keyDown(getSvg(container), { key: "+" });
    expect(onZoomChange).toHaveBeenCalledWith({
      scale: 2,
      translate: [-200, -150],
    });
  });
});

describe("maxScale", () => {
  it("stops the buttons, keys, double-click and wheel at maxScale", () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <WorldMap
        data={DATA}
        size={400}
        zoom={{ maxScale: 4 }}
        onZoomChange={onZoomChange}
      />,
    );
    const svg = getSvg(container);
    mockRect(svg, 400, 300);
    const status = screen.getByText("Map zoom reset");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.keyDown(svg, { key: "+" });
    expect(svg).toHaveAttribute("data-zoom-scale", "4");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.keyDown(svg, { key: "=" });
    fireEvent.doubleClick(svg, { clientX: 100, clientY: 100 });
    fireEvent.wheel(svg, { deltaY: -500, ctrlKey: true });
    expect(svg).toHaveAttribute("data-zoom-scale", "4");
    expect(onZoomChange).toHaveBeenCalledTimes(2);
    expect(status).toHaveTextContent("Map at maximum zoom");
  });

  it("defaults to 8", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = getSvg(container);
    for (let i = 0; i < 6; i += 1) fireEvent.keyDown(svg, { key: "+" });
    expect(svg).toHaveAttribute("data-zoom-scale", "8");
  });
});

describe("wheel zoom", () => {
  it("leaves plain wheel events to the page", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = getSvg(container);
    const notPrevented = fireEvent.wheel(svg, { deltaY: -100 });
    expect(notPrevented).toBe(true);
    expect(svg).toHaveAttribute("data-zoom-scale", "1");
  });

  it("zooms around the pointer with ctrl or meta held", () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom onZoomChange={onZoomChange} />,
    );
    const svg = getSvg(container);
    mockRect(svg, 400, 300);

    const notPrevented = fireEvent.wheel(svg, {
      deltaY: -200,
      ctrlKey: true,
      clientX: 100,
      clientY: 100,
    });
    expect(notPrevented).toBe(false);
    expect(onZoomChange).toHaveBeenLastCalledWith({
      scale: 2,
      translate: [-100, -100],
    });

    fireEvent.wheel(svg, { deltaY: 200, metaKey: true });
    expect(svg).toHaveAttribute("data-zoom-scale", "1");
  });

  it("handles line and page wheel deltas", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = getSvg(container);
    mockRect(svg, 400, 300);
    fireEvent.wheel(svg, { deltaY: -12.5, deltaMode: 1, ctrlKey: true });
    expect(svg).toHaveAttribute("data-zoom-scale", "2");
    fireEvent.wheel(svg, { deltaY: -1, deltaMode: 2, ctrlKey: true });
    expect(Number(svg.getAttribute("data-zoom-scale"))).toBeGreaterThan(2);
  });
});

describe("zoom with keyboard and pointer", () => {
  it("pans with the arrow keys only when there is room to move", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = getSvg(container);

    // At 1x the map can't move, so the page keeps the key.
    expect(fireEvent.keyDown(svg, { key: "ArrowLeft" })).toBe(true);

    fireEvent.keyDown(svg, { key: "+" });
    const zoomed = layerTransform(container, "countries");
    expect(fireEvent.keyDown(svg, { key: "ArrowLeft" })).toBe(false);
    expect(layerTransform(container, "countries")).toBe(
      zoomed!.replace("translate(-200, -150)", "translate(-160, -150)"),
    );
    fireEvent.keyDown(svg, { key: "ArrowUp" });
    fireEvent.keyDown(svg, { key: "ArrowRight" });
    fireEvent.keyDown(svg, { key: "ArrowDown" });
    expect(layerTransform(container, "countries")).toBe(zoomed);
  });

  it("resets on Escape and lets Escape through when already reset", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = getSvg(container);
    const initial = layerTransform(container, "countries");

    expect(fireEvent.keyDown(svg, { key: "Escape" })).toBe(true);
    fireEvent.keyDown(svg, { key: "+" });
    expect(fireEvent.keyDown(svg, { key: "Escape" })).toBe(false);
    expect(layerTransform(container, "countries")).toBe(initial);
  });

  it("zooms out with '-' instead of resetting", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const svg = getSvg(container);
    fireEvent.keyDown(svg, { key: "+" });
    fireEvent.keyDown(svg, { key: "+" });
    fireEvent.keyDown(svg, { key: "_" });
    expect(svg).toHaveAttribute("data-zoom-scale", "2");
    fireEvent.keyDown(svg, { key: "-" });
    expect(svg).toHaveAttribute("data-zoom-scale", "1");
    fireEvent.keyDown(svg, { key: "-" });
    expect(screen.getByText("Map at minimum zoom")).toBeInTheDocument();
  });

  it("ignores keys it doesn't use", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    expect(fireEvent.keyDown(getSvg(container), { key: "a" })).toBe(true);
  });

  it("does not click a country at the end of a drag", () => {
    const onClick = vi.fn();
    const { container } = render(
      <WorldMap
        data={DATA}
        size={400}
        zoom={{ initialScale: 2 }}
        onClickFunction={onClick}
      />,
    );
    const svg = getSvg(container);
    const us = container.querySelector('path[data-country-code="US"]')!;

    fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 });
    fireEvent.mouseMove(svg, { clientX: 70, clientY: 60 });
    const countries = container.querySelector('[data-map-layer="countries"]')!;
    expect(countries).toHaveStyle({ transition: "none" });
    fireEvent.mouseUp(svg);
    fireEvent.click(us);
    expect(onClick).not.toHaveBeenCalled();
    expect(countries).toHaveStyle({ transition: "all 0.2s" });

    // A plain click still works.
    fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(svg);
    fireEvent.click(us);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("only drags with the main button", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom={{ initialScale: 2 }} />,
    );
    const svg = getSvg(container);
    const before = layerTransform(container, "countries");
    fireEvent.mouseDown(svg, { button: 2, clientX: 50, clientY: 50 });
    fireEvent.mouseMove(svg, { clientX: 70, clientY: 60 });
    expect(layerTransform(container, "countries")).toBe(before);
  });

  it("keeps the same view when the map is resized", () => {
    const { container, rerender } = render(
      <WorldMap data={DATA} size={400} zoom />,
    );
    fireEvent.keyDown(getSvg(container), { key: "+" });
    rerender(<WorldMap data={DATA} size={800} zoom />);
    expect(layerTransform(container, "countries")).toBe(
      `translate(-400, -300) scale(${(800 / 960) * 2}) translate(0, 240)`,
    );
  });

  it("can be turned off with enabled: false", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom={{ enabled: false }} />,
    );
    expect(container.querySelector("button")).toBeNull();
    expect(getSvg(container).getAttribute("tabindex")).toBeNull();
  });

  it("hides the buttons with showControls: false", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom={{ showControls: false }} />,
    );
    expect(container.querySelector("button")).toBeNull();
    expect(getSvg(container).getAttribute("tabindex")).toBe("0");
  });
});

describe("zoom with Equal Earth", () => {
  it("keeps the 2:1 map inside its viewport while panning", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={400}
        projection="equalEarth"
        zoom={{ initialScale: 2 }}
      />,
    );
    const svg = getSvg(container);
    const scale = (400 / 960) * 2;

    fireEvent.mouseDown(svg, { clientX: 300, clientY: 300 });
    fireEvent.mouseMove(svg, { clientX: -500, clientY: -500 });
    fireEvent.mouseUp(svg);
    // 400 × 200 viewport at 2x: the far corner is at (-400, -200).
    expect(layerTransform(container, "countries")).toBe(
      `translate(-400, -200) scale(${scale}) translate(0, 0)`,
    );

    fireEvent.mouseDown(svg, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(svg, { clientX: 900, clientY: 900 });
    fireEvent.mouseUp(svg);
    expect(layerTransform(container, "countries")).toBe(
      `translate(0, 0) scale(${scale}) translate(0, 0)`,
    );
  });

  it("zooms around the centre of the 2:1 map", () => {
    const onZoomChange = vi.fn();
    render(
      <WorldMap
        data={DATA}
        size={400}
        projection="equalEarth"
        zoom
        onZoomChange={onZoomChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(onZoomChange).toHaveBeenCalledWith({
      scale: 2,
      translate: [-200, -100],
    });
  });

  it("places pins and labels with the Equal Earth projection", () => {
    const mercator = render(<WorldMap data={DATA} size={640} pins={PINS} />);
    const equalEarth = render(
      <WorldMap data={DATA} size={640} projection="equalEarth" pins={PINS} />,
    );
    const pinPath = (c: HTMLElement) =>
      c.querySelector("[data-map-pin] path")!.getAttribute("d");
    expect(pinPath(equalEarth.container)).not.toBe(pinPath(mercator.container));

    const labelled = render(
      <WorldMap data={DATA} size={640} projection="equalEarth" zoom />,
    );
    expect(
      labelled.container.querySelector(
        '[data-map-layer="country-labels"] text[data-country-code="RU"]',
      ),
    ).not.toBeNull();
  });
});

describe("layers that move with the map", () => {
  it("share the countries' transform after zooming", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={640}
        zoom
        pins={PINS}
        showDisputedTerritories
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    const transform = layerTransform(container, "countries");
    expect(transform).toContain("scale(1.3333333333333333)");
    for (const layer of ["disputed-territories", "country-labels", "pins"])
      expect(layerTransform(container, layer)).toBe(transform);
    // User labels stay in screen coordinates.
    expect(layerTransform(container, "labels")).toBeNull();
  });

  it("draws borders with non-scaling strokes only with zoom", () => {
    const zoomed = render(
      <WorldMap data={DATA} size={400} zoom showDisputedTerritories />,
    );
    for (const selector of [
      "[data-country-code]",
      "[data-disputed-territory]",
    ]) {
      expect(
        zoomed.container.querySelector(selector)!.getAttribute("vector-effect"),
      ).toBe("non-scaling-stroke");
    }

    const plain = render(
      <WorldMap data={DATA} size={400} showDisputedTerritories />,
    );
    expect(plain.container.querySelector("[vector-effect]")).toBeNull();
  });
});

describe("pins", () => {
  it("render without zoom, with the default colors", () => {
    const { container } = render(
      <WorldMap data={DATA} size={640} pins={PINS} />,
    );
    const pin = container.querySelector(
      '[data-map-pin="capital"][data-country-code="FR"]',
    )!;
    expect(pin).not.toBeNull();
    const marker = pin.querySelector("path")!;
    expect(marker.getAttribute("fill")).toBe("#b91c1c");
    expect(marker.getAttribute("stroke")).toBe("#fff");
    const caption = pin.querySelector("text")!;
    expect(caption).toHaveTextContent("Paris");
    expect(caption.getAttribute("fill")).toBe("#1f2937");
    expect(caption.getAttribute("stroke")).toBe("#fff");
    expect(container.querySelector("button")).toBeNull();
  });

  it("use the color props", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={640}
        pins={PINS}
        pinColor="gold"
        pinTextColor="white"
        pinOutlineColor="black"
      />,
    );
    const marker = container.querySelector("[data-map-pin] path")!;
    const caption = container.querySelector("[data-map-pin] text")!;
    expect(marker.getAttribute("fill")).toBe("gold");
    expect(marker.getAttribute("stroke")).toBe("black");
    expect(caption.getAttribute("fill")).toBe("white");
    expect(caption.getAttribute("stroke")).toBe("black");
  });

  it("keep their on-screen size as the map zooms", () => {
    const { container } = render(
      <WorldMap data={DATA} size={640} zoom pins={PINS} />,
    );
    const fontSize = () =>
      Number(
        container
          .querySelector("[data-map-pin] text")!
          .getAttribute("font-size"),
      );
    expect(fontSize() * (640 / 960)).toBeCloseTo(10);
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(fontSize() * (640 / 960) * 2).toBeCloseTo(10);
  });

  it("skip pins with invalid coordinates and pins on an unmeasured map", () => {
    const invalid = render(
      <WorldMap
        data={DATA}
        size={640}
        pins={[{ caption: "Nowhere", coordinates: [500, 0] }]}
      />,
    );
    expect(invalid.container.querySelector("[data-map-pin]")).toBeNull();

    const unmeasured = render(<WorldMap data={DATA} size={0} pins={PINS} />);
    expect(
      unmeasured.container.querySelector('[data-map-layer="pins"]'),
    ).toBeNull();
  });
});

describe("country labels", () => {
  it("use labelColor and no halo by default", () => {
    const { container } = render(<WorldMap data={DATA} size={640} zoom />);
    const label = container.querySelector(
      '[data-map-layer="country-labels"] text',
    )!;
    expect(label.getAttribute("fill")).toBe("#222");
    expect(label.hasAttribute("stroke")).toBe(false);
  });

  it("draw a halo with labelHaloColor", () => {
    const { container } = render(
      <WorldMap
        data={DATA}
        size={640}
        zoom
        labelColor="#eee"
        labelHaloColor="#111"
      />,
    );
    const label = container.querySelector(
      '[data-map-layer="country-labels"] text',
    )!;
    expect(label.getAttribute("fill")).toBe("#eee");
    expect(label.getAttribute("stroke")).toBe("#111");
    expect(label.getAttribute("paint-order")).toBe("stroke");
  });

  it("are hidden from pointer events and assistive technology", () => {
    const { container } = render(<WorldMap data={DATA} size={640} zoom />);
    const layer = container.querySelector('[data-map-layer="country-labels"]')!;
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveAttribute("pointer-events", "none");
  });
});

describe("zoom layout", () => {
  it("keeps the figure's styles and wraps the map in a positioned box", () => {
    const { container } = render(<WorldMap data={DATA} size={400} zoom />);
    const figure = container.querySelector("figure")!;
    expect(figure.getAttribute("style")).toBe("background-color: white;");
    const box = container.querySelector(".worldmap__zoom-viewport")!;
    expect(box).toHaveStyle({ position: "relative", width: "400px" });
    expect(box.contains(getSvg(container))).toBe(true);
  });

  it("puts the zoom buttons before clickable countries in the tab order", () => {
    const { container } = render(
      <WorldMap data={DATA} size={400} zoom onClickFunction={vi.fn()} />,
    );
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement | SVGElement>(
        'button, [tabindex="0"]',
      ),
    );
    expect(focusable[0]).toHaveAccessibleName("Zoom in");
    expect(focusable[1]).toHaveAccessibleName("Zoom out");
    expect(focusable[2]).toHaveAccessibleName("Reset zoom");
    expect(focusable[3]).toBe(getSvg(container));
    expect(focusable.length).toBeGreaterThan(100);
  });

  it("turns off the zoom transition when the user prefers reduced motion", () => {
    const listeners = new Set<() => void>();
    const query = {
      matches: true,
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    };
    const matchMedia = vi.fn(() => query);
    vi.stubGlobal("matchMedia", matchMedia);
    try {
      const { container, unmount } = render(
        <WorldMap data={DATA} size={400} zoom />,
      );
      const countries = container.querySelector(
        '[data-map-layer="countries"]',
      )!;
      expect(matchMedia).toHaveBeenCalledWith(
        "(prefers-reduced-motion: reduce)",
      );
      expect(countries).toHaveStyle({ transition: "none" });

      query.matches = false;
      act(() => {
        for (const fn of listeners) fn();
      });
      expect(countries).toHaveStyle({ transition: "all 0.2s" });

      unmount();
      expect(listeners.size).toBe(0);

      // Without zoom the old transition is kept.
      query.matches = true;
      const legacy = render(
        <WorldMap data={DATA} size={400} richInteraction />,
      );
      expect(
        legacy.container.querySelector('[data-map-layer="countries"]'),
      ).toHaveStyle({ transition: "all 0.2s" });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("cleans up the wheel listener on unmount", () => {
    const { container, unmount } = render(
      <WorldMap data={DATA} size={400} zoom />,
    );
    const svg = getSvg(container);
    const remove = vi.spyOn(svg, "removeEventListener");
    act(() => unmount());
    expect(remove).toHaveBeenCalledWith("wheel", expect.any(Function));
  });
});
