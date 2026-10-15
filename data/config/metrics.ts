/**
 * Metric configuration.
 *
 * Two kinds of metrics reach the dashboard:
 *
 *  1. Derived  - computed from data/github.snapshot.json by the pipeline. You
 *                never type these; they stay honest automatically.
 *  2. Manual   - declared here with an explicit `source`. Every manual metric
 *                must name where the number came from, because the UI renders
 *                that provenance next to the value.
 *
 * Adding a manual metric:
 *   1. append an entry below with a unique `key`
 *   2. run `npm run pipeline`; the validator reports the label keys that still
 *      need translations in data/localization/metric-labels.json
 *   3. add the translations, run the pipeline again
 *
 * Never put an unsourced number here. A portfolio that claims quality work and
 * ships invented metrics contradicts itself.
 */

import type { MetricSource, MetricValue, MetricTile } from "@/types/portfolio-contract";

export interface ManualMetric extends Omit<MetricValue, "label"> {
  /** Label key; resolved per locale from data/localization/metric-labels.json. */
  labelKey: string;
}

export interface ManualTile extends Omit<MetricTile, "label"> {
  labelKey: string;
}

export interface MetricsConfig {
  manual: ManualMetric[];
  manualTiles: ManualTile[];
}

export const metrics: MetricsConfig = {
  /**
   * Empty by default: every shipped metric is derived from the GitHub snapshot,
   * so the site can be published without asserting an unverifiable number.
   *
   * Example of a properly sourced manual metric:
   *
   *   {
   *     key: "reporting_cycle",
   *     labelKey: "reporting_cycle",
   *     value: 68,
   *     unit: "percent",
   *     context: "reduction, 2023-2025",
   *     source: "config",
   *     sourceDetail: "Power BI refresh audit, internal ProptVerse dashboard",
   *   }
   */
  manual: [],
  manualTiles: [],
};

/** Provenance copy rendered in the data-sources panel, keyed by source id. */
export const SOURCE_REGISTRY: Record<
  MetricSource,
  { label: string; detail: string; url?: string }
> = {
  github: {
    label: "GitHub REST API v3",
    detail:
      "Repositories, languages, stars and contribution calendar captured at compile time. Recomputed by `npm run github:sync`.",
    url: "https://api.github.com",
  },
  derived: {
    label: "Pipeline computation",
    detail:
      "Aggregated from the GitHub snapshot by pipeline/github_metrics.py. Deterministic for a fixed snapshot.",
  },
  config: {
    label: "Self-reported, sourced",
    detail:
      "Declared in data/config/metrics.ts. Each entry names the system it was measured in. This source appears in the data-sources panel only while at least one manual metric exists.",
  },
};
