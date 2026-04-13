import * as React from "react";
import type { ISOCode } from "../types.js";

interface InitialCountry {
  countryCode: ISOCode;
  countryName: string;
}

export function useDrilldownState(initialCountry?: InitialCountry): {
  activeCountryCode: ISOCode | null;
  activeCountryName: string | null;
  enterCountry: (countryCode: ISOCode, countryName: string) => void;
  reset: () => void;
  canGoBack: boolean;
} {
  const [activeCountryCode, setActiveCountryCode] =
    React.useState<ISOCode | null>(initialCountry?.countryCode ?? null);
  const [activeCountryName, setActiveCountryName] = React.useState<
    string | null
  >(initialCountry?.countryName ?? null);

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
