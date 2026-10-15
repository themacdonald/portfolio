/**
 * GitHub ingestion configuration.
 *
 * `npm run github:sync` writes data/github.snapshot.json from this config.
 * The pipeline derives every code metric from that snapshot, so no number in
 * the dashboard is hand-typed. When the API is unreachable the committed
 * snapshot is used and freshness is reported instead of failing the build.
 */

export interface GithubConfig {
  username: string;
  /** Repos surfaced as hero projects, in display order. */
  featured: string[];
  /** Repos hidden from the dashboard entirely. */
  exclude: string[];
  /** Repos treated as platform/tooling rather than analytical work. */
  platform: string[];
  /** Contribution calendar year: "last" or a specific year. */
  contributionYear: "last" | number;
}

export const github: GithubConfig = {
  username: "themacdonald",
  featured: ["BiasGuard", "FeedbackLoop", "AgriMANET-Scheduler", "ConfidenceCoach"],
  exclude: [
    "machine_learning_examples",
    "PythonDataScienceHandbook",
    "datacamp-Data-Engineer-with-Python-course",
    "system-prompts-and-models-of-ai-tools",
  ],
  platform: ["portfolio", "themacdonald", ".github"],
  contributionYear: "last",
};
