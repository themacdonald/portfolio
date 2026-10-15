/**
 * AgenticPortfolioPayload contract.
 *
 * This file is the single TypeScript source of truth for the compiled
 * architectural data pipeline consumed by the presentation layer. The runtime
 * artifact lives at data/portfolio.payload.json and is produced by
 * `npm run pipeline`.
 *
 * Rules enforced by the pipeline validator:
 *  - No decorative emoji.
 *  - No HTML layout elements or inline markdown tables inside strings.
 *  - Code cells contain executable Python only.
 *  - Every language in metadata.availableLanguages has a full registry node.
 */

export type LanguageKey = "en" | "fr" | "es" | "de" | "ru" | "ja" | "zh";

/** Kernel targets available to executable cells. */
export type KernelTarget = "python3" | "cpp20";

/** A single scalar or structured record emitted by a simulated kernel run. */
export type TelemetryScalar = string | number;
export type TelemetryRecordValue = string | number | object;
export type TelemetryRecord = Record<string, TelemetryRecordValue>;

export interface SimulatedTelemetry {
  /** Column header rendered above the output grid. */
  metricsHeader: string;
  /** Ordered display names for every record column. */
  outputFields: string[];
  /** Deterministic mock rows produced by the cell. */
  records: TelemetryRecord[];
  /** Optional stdout trace captured from the executed cell. */
  rawConsoleLog?: string[];
}

export interface ExecutionMetadata {
  requiresKernel: KernelTarget;
  simulatedTelemetry: SimulatedTelemetry;
}

export interface NotebookCell {
  id: number;
  type: "markdown" | "code";
  sourceLines: string[];
  executionMetadata?: ExecutionMetadata;
}

export interface InterfaceLabels {
  kernelStatus: string;
  runCellBtn: string;
  workspaceFiles: string;
  telemetryOutput: string;
  recentGrowthTitle: string;
}

export interface ProfileNarrative {
  title: string;
  /** Short declarative promise, set in the display face. */
  headline: string;
  summary: string;
  /** Short capability chips rendered under the pitch. */
  focusAreas: string[];
}

/**
 * Chrome labels for the IDE shell itself. These stay inside the localization
 * node so the whole workspace, not only the notebook body, follows langKey.
 */
export interface ShellLabels {
  runAllBtn: string;
  clearBtn: string;
  cellLabel: string;
  localeLabel: string;
  cellsLabel: string;
  narrativeLinesLabel: string;
  codeLinesLabel: string;
  telemetryRowsLabel: string;
  growthItemsLabel: string;
  dagPayloadLabel: string;
  outputIdle: string;
  outputRunning: string;
  rawConsoleLabel: string;
  repositoryLabel: string;
  domainLabel: string;
  weightLabel: string;
  edgeManifestLabel: string;
  highestCriticalityLabel: string;
  nodesLabel: string;
  edgesLabel: string;
  /** View mode switch: recruiter vs technical. */
  viewModeRecruiter: string;
  viewModeTechnical: string;
  /** Accessibility and mobile controls. */
  menuLabel: string;
  reduceMotionLabel: string;
  /** Primary calls to action in the masthead. */
  viewDashboard: string;
  viewWork: string;
  /** Evidence badges: how a figure was obtained. */
  verifiedLabel: string;
  selfReportedLabel: string;
  unmeasuredLabel: string;
}

export interface ProjectDetail {
  description: string;
  updatedFeatures: string[];
}

export interface PayloadMetadata {
  engineerName: string;
  targetTitle: string;
  globalTelemetryVersion: string;
  systemLocation: string;
  availableLanguages: string[];
  compiledTimestamp: string;
}

export interface ArchitectureNode {
  id: string;
  domain: string;
  subSystem: string;
  weight: number;
}

export interface ArchitectureEdge {
  source: string;
  target: string;
  dependencyType: string;
}

export interface SystemArchitectureDAG {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

/* ------------------------------------------------------------------ *
 * Analytics layer: dashboards, metrics and charts
 * ------------------------------------------------------------------ */

/** Where a number came from. Rendered next to every metric. */
export type MetricSource = "github" | "derived" | "config";

export interface MetricValue {
  key: string;
  /** Numeric or preformatted display value. Never localized. */
  value: number | string;
  /** Set when value is numeric so the UI can format it. */
  unit?: "count" | "percent" | "score" | "date" | "ratio";
  /** Short qualifier, for example "last 12 months". Localized by key. */
  context?: string;
  source: MetricSource;
  /** Provenance detail shown in the data-sources panel. Not localized. */
  sourceDetail?: string;
}

export interface TimePoint {
  /** ISO date or YYYY-MM, depending on granularity. */
  period: string;
  value: number;
  /** Localized series label, for stacked series. */
  series?: string;
}

export interface Segment {
  label: string;
  value: number;
  /** Optional share of total, 0..100. */
  share?: number;
}

export type ChartKind = "heatmap" | "distribution" | "strips" | "signals";

export interface ChartDataset {
  id: string;
  kind: ChartKind;
  unit?: MetricValue["unit"];
  /** Values are language-neutral; the title comes from the locale node. */
  series: TimePoint[];
  segments?: Segment[] | null;
  source: MetricSource;
  sourceDetail?: string;
}

export interface HeatmapDay {
  date: string;
  value: number;
  /** Pre-bucketed 0..4 shading level. */
  level: number;
}

export interface RepositoryRecord {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  topics: string[];
  homepage: string;
  url: string;
  pushedAt: string;
  createdAt: string;
  /** Repo size in kilobytes, straight from the API. */
  sizeKb: number;
  archived: boolean;
  isFork: boolean;
  /** Track id: analytics | evaluation | platform | system. */
  track: string;
  /** Derived 0..100 readiness score. */
  readiness: number;
}

export interface MetricTile extends MetricValue {
  emphasis?: boolean;
}

/** Computed profile of a raw dataset the pipeline downloaded and measured. */
export interface DatasetProfile {
  rows: number;
  columns: number;
  groups: number;
  yearFrom: string;
  yearTo: string;
  lifeMean: number | null;
  lifeMin: number | null;
  lifeMax: number | null;
  counts: Record<string, number>;
  numeric: Record<string, { min: number; max: number; mean: number }>;
}

/**
 * Reading of the telemetry, computed in the pipeline. The code selects a
 * template; the numbers are the same ones the figures plot. This states what
 * the evidence shows, not what the owner wishes it showed.
 */
export type VerdictCode = "sparse" | "bursty" | "steady" | "sustained";
export type VerdictTone = "caution" | "neutral" | "strong";

export interface Verdict {
  code: VerdictCode;
  tone: VerdictTone;
  /** Template with {n} placeholders, resolved from the locale node. */
  template: string;
  values: Record<string, number>;
}

export interface DashboardSource {
  id: string;
  detail: string;
  url?: string;
  capturedAt?: string;
}

export interface DashboardData {
  generatedAt: string;
  capturedDaysAgo: number;
  metrics: MetricValue[];
  tiles: MetricTile[];
  charts: ChartDataset[];
  repositories: RepositoryRecord[];
  /** Seven-row columns, oldest week first. */
  contributionWeeks: HeatmapDay[][];
  /** One-sentence reading of the numbers above. */
  verdict: Verdict;
  datasetProfiles: Record<string, DatasetProfile>;
  sources: DashboardSource[];
}

export interface ProfileContact {
  id: string;
  value: string;
  url?: string;
  primary?: boolean;
}

/* ------------------------------------------------------------------ *
 * Localized content keys
 * ------------------------------------------------------------------ */

/**
 * Every localized string the dashboard needs, keyed by the language-neutral
 * ids used in data/config. The pipeline fails the build when a key is missing.
 */
export interface DashboardLabels {
  /** Section headings and captions. */
  sectionTitles: Record<string, string>;
  sectionCaptions: Record<string, string>;
  /** Tile and metric labels, keyed by metric key. */
  metricLabels: Record<string, string>;
  /** Chart titles and captions, keyed by chart id. */
  chartTitles: Record<string, string>;
  chartCaptions: Record<string, string>;
  /** Data-source panel copy, keyed by source id. */
  sourceLabels: Record<string, string>;
  /** Track names and blurbs, keyed by track id. */
  trackLabels: Record<string, string>;
  trackBlurbs: Record<string, string>;
  /** Case study copy, keyed by copyId. */
  caseProblem: Record<string, string>;
  caseMethod: Record<string, string[]>;
  caseOutcome: Record<string, string[]>;
  caseRole: Record<string, string>;
  caseTimeframe: Record<string, string>;
  caseProvenance: Record<string, string>;
  /** Availability statement, keyed by availabilityId. */
  availability: Record<string, string>;
  /** Contact labels, keyed by contact id. */
  contactLabels: Record<string, string>;
  /** Verdict sentences, keyed by verdict code. */
  verdicts: Record<string, string>;
  /** Tone badges: what the evidence supports. */
  verifiedLabel: string;
  selfReportedLabel: string;
  unmeasuredLabel: string;
}

export interface LocalizationNode {
  interfaceLabels: InterfaceLabels;
  shellLabels: ShellLabels;
  profileNarrative: ProfileNarrative;
  dashboardLabels: DashboardLabels;
  notebookCells: NotebookCell[];
  projectDetails: Record<string, ProjectDetail>;
}

/* ------------------------------------------------------------------ *
 * Root payload
 * ------------------------------------------------------------------ */

export interface AgenticPortfolioPayload {
  metadata: PayloadMetadata;
  /** Language-neutral analytics, labelled by localizationRegistry[*].dashboardLabels. */
  dashboard: DashboardData;
  localizationRegistry: Record<string, LocalizationNode>;
  systemArchitectureDAG: SystemArchitectureDAG;
}

/** Language codes supported by the localization matrix, in display order. */
export const LANGUAGE_KEYS: LanguageKey[] = [
  "en",
  "fr",
  "es",
  "de",
  "ru",
  "ja",
  "zh",
];

/** Endonym labels used by the language switcher. */
export const LANGUAGE_LABELS: Record<LanguageKey, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  ru: "Русский",
  ja: "日本語",
  zh: "中文",
};

/** BCP 47 tags applied to the document root for the active locale. */
export const LANGUAGE_HTML_TAGS: Record<LanguageKey, string> = {
  en: "en",
  fr: "fr",
  es: "es",
  de: "de",
  ru: "ru",
  ja: "ja",
  zh: "zh-Hans",
};

/** Repository slugs covered by localizationRegistry[lang].projectDetails. */
export const PROJECT_SLUGS = [
  "BiasGuard",
  "FeedbackLoop",
  "ConfidenceCoach",
  "AgriMANET-Scheduler",
] as const;

export type ProjectSlug = (typeof PROJECT_SLUGS)[number];

/** Cell identifiers required in every localization node. */
export const CELL_IDS = [1, 2, 3, 4] as const;
