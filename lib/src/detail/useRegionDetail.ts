import { useEffect, useRef, useState } from "react";
import type {
  DetailProvider,
  DetailProviderResult,
  ISOCode,
} from "../types.js";
import {
  createFailedDetailResult,
  createIdleDetailResult,
} from "./providerState.js";

interface UseRegionDetailArgs {
  /** Whether regions should be shown (detailLevel, zoom level, provider). */
  active: boolean;
  provider: DetailProvider | undefined;
  /** The countries in view; their regions are requested once each. */
  countryCodes: readonly ISOCode[];
  onStatusChange: ((status: DetailProviderResult) => void) | undefined;
}

/**
 * Loads the regions of the countries in view from a `DetailProvider` and
 * keeps the results per country for as long as the provider is the same.
 *
 * `onStatusChange` is called when a load starts and ends, and with `"idle"`
 * when the regions are hidden again: from the load and from that one
 * transition, never because a callback's identity changed.
 */
export function useRegionDetail({
  active,
  provider,
  countryCodes,
  onStatusChange,
}: UseRegionDetailArgs): Record<string, DetailProviderResult> {
  const [results, setResults] = useState<Record<string, DetailProviderResult>>(
    {},
  );
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;
  const requested = useRef(new Set<string>());
  const providerRef = useRef(provider);
  const wasActive = useRef(false);

  // A new provider starts from scratch.
  if (providerRef.current !== provider) {
    providerRef.current = provider;
    requested.current = new Set();
  }

  const countryKey = countryCodes.join(",");
  useEffect(() => {
    if (!active || provider == null) {
      if (wasActive.current) {
        wasActive.current = false;
        onStatusChangeRef.current?.(createIdleDetailResult());
      }
      return;
    }
    wasActive.current = true;

    const report = (countryCode: string, result: DetailProviderResult) => {
      // Drop results for a provider that has since been replaced.
      if (providerRef.current !== provider) return;
      setResults((current) => ({ ...current, [countryCode]: result }));
      onStatusChangeRef.current?.(result);
    };

    for (const countryCode of countryCodes) {
      const key = countryCode.toUpperCase();
      if (requested.current.has(key) || !provider.supports(countryCode))
        continue;
      requested.current.add(key);
      report(key, { status: "loading", layer: "regions", countryCode });
      Promise.resolve()
        .then(() => provider.loadRegions(countryCode))
        .then(
          (result) => report(key, result),
          () => report(key, createFailedDetailResult(countryCode)),
        );
    }
    // CountryKey stands for countryCodes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, provider, countryKey]);

  // Results of an earlier provider are not shown.
  const [resultsProvider, setResultsProvider] = useState(provider);
  if (resultsProvider !== provider) {
    setResultsProvider(provider);
    setResults({});
  }

  return results;
}
