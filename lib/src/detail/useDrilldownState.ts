import * as React from "react";
import type { ISOCode } from "../types.js";

export function useDrilldownState(): {
  activeCountryCode: ISOCode | null;
  enterCountry: (countryCode: ISOCode) => void;
  reset: () => void;
  canGoBack: boolean;
} {
  const [activeCountryCode, setActiveCountryCode] =
    React.useState<ISOCode | null>(null);

  return {
    activeCountryCode,
    enterCountry(countryCode: ISOCode) {
      setActiveCountryCode(countryCode);
    },
    reset() {
      setActiveCountryCode(null);
    },
    canGoBack: activeCountryCode != null,
  };
}
