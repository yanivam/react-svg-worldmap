import * as React from "react";
import type { ISOCode } from "../types.js";

export function useDrilldownState(): {
  activeCountryCode: ISOCode | null;
  activeCountryName: string | null;
  enterCountry: (countryCode: ISOCode, countryName: string) => void;
  reset: () => void;
  canGoBack: boolean;
} {
  const [activeCountryCode, setActiveCountryCode] =
    React.useState<ISOCode | null>(null);
  const [activeCountryName, setActiveCountryName] = React.useState<
    string | null
  >(null);

  return {
    activeCountryCode,
    activeCountryName,
    enterCountry(countryCode: ISOCode, countryName: string) {
      setActiveCountryCode(countryCode);
      setActiveCountryName(countryName);
    },
    reset() {
      setActiveCountryCode(null);
      setActiveCountryName(null);
    },
    canGoBack: activeCountryCode != null,
  };
}
