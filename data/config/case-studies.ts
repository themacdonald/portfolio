/**
 * Case study registry: language-neutral structure.
 *
 * Prose, method steps, outcomes and metric labels are localized, keyed by the
 * ids used here. Numbers and source attribution are not localized, because a
 * metric that changes when you switch language is not a metric.
 *
 * Vertical tracks:
 *   analytics  - business intelligence, dashboarding, metric governance
 *   evaluation - LLM evaluation, alignment data, rubric design
 *   platform   - networking and systems research
 */

import type { MetricValue } from "@/types/portfolio-contract";

export type TrackId = "analytics" | "evaluation" | "platform";

export interface CaseStudyConfig {
  slug: string;
  track: TrackId;
  /** GitHub repository backing this study, when one exists. */
  repo?: string;
  /** Displayed stack; language names are never localized. */
  stack: string[];
  /** Upper bounds only; the pipeline fills these from the repo when available. */
  repoDerived?: {
    languageBreakdown?: boolean;
    sizeKb?: boolean;
    lastPush?: boolean;
  };
  /** Metric tiles. `labelKey` resolves through data/localization/metric-labels.json. */
  metrics: Array<Omit<MetricValue, "label"> & { labelKey: string }>;
  /** Ids resolved to localized copy in each locale node under caseStudyCopy. */
  copyId: string;
}

export const TRACK_ORDER: TrackId[] = ["analytics", "evaluation", "platform"];

export const caseStudies: CaseStudyConfig[] = [
  {
    slug: "healthcare-insights",
    track: "analytics",
    repo: "Healthcare-Insights-Dashboard-Tableau-Project",
    copyId: "healthcare_insights",
    stack: ["Tableau", "SQL", "Excel", "Data Modeling"],
    repoDerived: { sizeKb: true, lastPush: true },
    metrics: [
      {
        key: "stakeholder_reporting_cycle",
        labelKey: "reporting_cycle",
        value: "manual-entry-required",
        context: "replace with your measured cycle time",
        source: "config",
        sourceDetail: "data/config/case-studies.ts",
      },
    ],
  },
  {
    slug: "oil-gas-operations",
    track: "analytics",
    repo: "Oil-Gas-Data-Intelligence-Power-BI-Dashboard",
    copyId: "oil_gas_operations",
    stack: ["Power BI", "DAX", "Python", "Power Query"],
    repoDerived: { sizeKb: true, lastPush: true },
    metrics: [
      {
        key: "maintenance_visibility",
        labelKey: "maintenance_visibility",
        value: "manual-entry-required",
        context: "replace with your measured coverage",
        source: "config",
        sourceDetail: "data/config/case-studies.ts",
      },
    ],
  },
  {
    slug: "biasguard",
    track: "evaluation",
    repo: "BiasGuard",
    copyId: "biasguard",
    stack: ["Python", "Pandas", "Fairness Metrics", "Pytest"],
    repoDerived: { languageBreakdown: true, sizeKb: true, lastPush: true },
    metrics: [
      {
        key: "protected_attributes_covered",
        labelKey: "protected_attributes",
        value: "manual-entry-required",
        context: "count of attributes in the parity matrix",
        source: "config",
        sourceDetail: "data/config/case-studies.ts",
      },
    ],
  },
  {
    slug: "feedbackloop",
    track: "evaluation",
    repo: "FeedbackLoop",
    copyId: "feedbackloop",
    stack: ["Python", "RLHF", "PPO", "DPO"],
    repoDerived: { languageBreakdown: true, sizeKb: true, lastPush: true },
    metrics: [
      {
        key: "preference_pairs",
        labelKey: "preference_pairs",
        value: "manual-entry-required",
        context: "labelled pairs in the training set",
        source: "config",
        sourceDetail: "data/config/case-studies.ts",
      },
    ],
  },
  {
    slug: "agrimanet-scheduler",
    track: "platform",
    repo: "AgriMANET-Scheduler",
    copyId: "agrimanet_scheduler",
    stack: ["Python", "Simulation", "Networking", "WRR Scheduling"],
    repoDerived: { sizeKb: true, lastPush: true },
    metrics: [
      {
        key: "simulated_nodes",
        labelKey: "simulated_nodes",
        value: "manual-entry-required",
        context: "nodes in the largest simulation run",
        source: "config",
        sourceDetail: "data/config/case-studies.ts",
      },
    ],
  },
];

/** Returns the configs for one track, in declared order. */
export function caseStudiesForTrack(track: TrackId): CaseStudyConfig[] {
  return caseStudies.filter((study) => study.track === track);
}
