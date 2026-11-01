import { useColorMode } from "@docusaurus/theme-common";

const light = {
  backgroundColor: "#ffffff",
  borderColor: "#000000",
  strokeOpacity: 0.2,
  tooltipBgColor: "#111827",
  tooltipTextColor: "#ffffff",
};

const dark = {
  backgroundColor: "#242526",
  borderColor: "#e5e7eb",
  strokeOpacity: 0.35,
  tooltipBgColor: "#f9fafb",
  tooltipTextColor: "#111827",
};

/** Map colors for the site's light or dark mode. Spread them on WorldMap. */
export function useMapTheme(): typeof light {
  return useColorMode().colorMode === "dark" ? dark : light;
}
