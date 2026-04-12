import * as React from "react";
import type { ISOCode } from "../types.js";
import type { DetailProvider, DetailProviderResult } from "./types.js";

const IDLE_RESULT: DetailProviderResult = {
  status: "idle",
  layer: "regions",
  detailLevel: "countries",
};

export function useDetailCollection(
  activeCountryCode: ISOCode | null,
  provider: DetailProvider | undefined,
  enabled: boolean,
): DetailProviderResult {
  const [result, setResult] = React.useState<DetailProviderResult>(IDLE_RESULT);

  React.useEffect(() => {
    if (!enabled || !activeCountryCode || !provider) {
      setResult(IDLE_RESULT);
      return undefined;
    }

    let cancelled = false;
    setResult({
      status: "loading",
      layer: "regions",
      detailLevel: "regions",
    });

    provider
      .loadRegions(activeCountryCode)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            status: "failed",
            layer: "regions",
            detailLevel: "regions",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCountryCode, enabled, provider]);

  return result;
}
