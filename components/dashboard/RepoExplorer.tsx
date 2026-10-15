"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Database, ExternalLink, GitFork, Star } from "lucide-react";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { cn } from "@/lib/utils";

const SOURCE_TONE: Record<string, string> = {
  github: "text-syntax-command border-syntax-command/40",
  derived: "text-syntax-tech border-syntax-tech/40",
  dataset: "text-syntax-number border-syntax-number/40",
  config: "text-syntax-warning border-syntax-warning/40",
};

type SortKey = "readiness" | "pushedAt" | "stars" | "name";

export default function RepoExplorer() {
  const { payload, node } = useWorkspace();
  const labels = node.dashboardLabels;
  const repositories = payload.dashboard.repositories;
  const [sortKey, setSortKey] = useState<SortKey>("pushedAt");
  const [trackFilter, setTrackFilter] = useState<string>("all");

  const tracks = useMemo(() => {
    const seen = new Set(repositories.map((repo) => repo.track));
    return ["all", ...Array.from(seen).sort()];
  }, [repositories]);

  const rows = useMemo(() => {
    const filtered =
      trackFilter === "all"
        ? repositories
        : repositories.filter((repo) => repo.track === trackFilter);
    const sorted = [...filtered];
    sorted.sort((left, right) => {
      if (sortKey === "name") return left.name.localeCompare(right.name);
      if (sortKey === "stars") return right.stars - left.stars;
      if (sortKey === "pushedAt") return right.pushedAt.localeCompare(left.pushedAt);
      return right.readiness - left.readiness;
    });
    return sorted;
  }, [repositories, sortKey, trackFilter]);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "pushedAt", label: "recent" },
    { key: "stars", label: labels.metricLabels.stars_earned },
    { key: "name", label: "name" },
    { key: "readiness", label: "signals" },
  ];

  return (
    <section className="overflow-hidden rounded-md border border-syntax-border bg-syntax-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-syntax-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-syntax-comment">
            {labels.sectionTitles.dashboard}
          </span>
          <span className="font-mono text-[10px] text-syntax-comment">{rows.length}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {tracks.map((track) => (
              <button
                key={track}
                type="button"
                onClick={() => setTrackFilter(track)}
                className={cn(
                  "rounded border px-2 py-0.5 font-mono text-[10px] transition-colors",
                  trackFilter === track
                    ? "border-syntax-branch text-syntax-branch"
                    : "border-syntax-border text-syntax-muted hover-syntax"
                )}
              >
                {track === "all" ? labels.sectionTitles.tracks : labels.trackLabels[track] ?? track}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 font-mono text-[10px] text-syntax-comment">
            sort
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="rounded border border-syntax-border bg-syntax-background px-2 py-0.5 font-mono text-[10px] text-syntax-text"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <ul className="divide-y divide-syntax-border">
        {rows.map((repo) => (
          <li key={repo.name} className="px-4 py-3 transition-colors hover-syntax">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[12.5px] text-syntax-link hover:opacity-80"
                  >
                    {repo.name}
                  </a>
                  <span className="rounded border border-syntax-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-syntax-tech">
                    {labels.trackLabels[repo.track] ?? repo.track}
                  </span>
                  {repo.archived && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-syntax-warning">
                      archived
                    </span>
                  )}
                </div>

                {repo.description && (
                  <p className="mt-1 max-w-3xl text-[11.5px] leading-5 text-syntax-muted">
                    {repo.description}
                  </p>
                )}

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-syntax-comment">
                  <span className="text-syntax-number">{repo.language}</span>
                  <span className="flex items-center gap-1">
                    <Star size={10} /> {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={10} /> {repo.forks}
                  </span>
                  <span>pushed {repo.pushedAt}</span>
                  <span>{repo.sizeKb.toLocaleString("en")} KB</span>
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-syntax-link hover:opacity-80"
                    >
                      demo <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              </div>

            </div>
          </li>
        ))}
      </ul>

      <footer className="flex flex-wrap items-center gap-2 border-t border-syntax-border px-4 py-2 font-mono text-[10px] text-syntax-comment">
        <Database size={11} />
        {payload.dashboard.sources.map((source) => (
          <span
            key={`${source.id}-${source.detail}`}
            className={cn("rounded border px-1.5 py-0.5", SOURCE_TONE[source.id] ?? "text-syntax-muted border-syntax-border")}
            title={source.detail}
          >
            {labels.sourceLabels[source.id] ?? source.id}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1">
          <AlertCircle size={11} />
          captured {payload.dashboard.generatedAt.slice(0, 10)}
        </span>
      </footer>
    </section>
  );
}
