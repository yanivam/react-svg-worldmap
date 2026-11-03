import { useColorMode } from "@docusaurus/theme-common";

const light = {
  backgroundColor: "#ffffff",
  borderColor: "#000000",
  strokeOpacity: 0.2,
  tooltipBgColor: "#111827",
  tooltipTextColor: "#ffffff",
  pinColor: "#b91c1c",
  pinTextColor: "#1f2937",
  pinOutlineColor: "#ffffff",
  labelColor: "#222222",
};

const dark = {
  backgroundColor: "#242526",
  borderColor: "#e5e7eb",
  strokeOpacity: 0.35,
  tooltipBgColor: "#f9fafb",
  tooltipTextColor: "#111827",
  pinColor: "#f87171",
  pinTextColor: "#f9fafb",
  pinOutlineColor: "#242526",
  labelColor: "#d1d5db",
  labelHaloColor: "#242526",
};

/** Map colors for the site's light or dark mode. Spread them on WorldMap. */
export function useMapTheme(): typeof light & { labelHaloColor?: string } {
  return useColorMode().colorMode === "dark" ? dark : light;
}
