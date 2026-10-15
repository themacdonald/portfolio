"use client";

import { GitBranch, ShieldAlert, Star } from "lucide-react";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { MetricTileCard, formatMetric } from "@/components/dashboard/DashboardPanel";
import type { CaseStudyConfig } from "@/data/config/case-studies";
import { cn } from "@/lib/utils";

interface CaseStudyCardProps {
  study: CaseStudyConfig;
}

export default function CaseStudyCard({ study }: CaseStudyCardProps) {
  const { payload, node } = useWorkspace();
  const labels = node.dashboardLabels;
  const copyId = study.copyId;
  const repository = study.repo
    ? payload.dashboard.repositories.find((repo) => repo.name === study.repo)
    : undefined;

  const problem = labels.caseProblem[copyId];
  const method = labels.caseMethod[copyId] ?? [];
  const outcome = labels.caseOutcome[copyId] ?? [];
  const provenance = labels.caseProvenance[copyId];

  const metrics = study.metrics.map((metric) => ({
    ...metric,
    label: labels.metricLabels[metric.labelKey] ?? metric.labelKey,
    unresolved: metric.value === "manual-entry-required",
  }));

  return (
    <article
      id={`case-${study.slug}`}
      className="scroll-mt-20 overflow-hidden rounded border border-syntax-border bg-syntax-surface"
    >
      <header className="border-b border-syntax-border px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-syntax-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-syntax-tech">
                {labels.trackLabels[study.track] ?? study.track}
              </span>
              <span className="font-mono text-[10px] text-syntax-comment">
                {labels.caseTimeframe[copyId]}
              </span>
            </div>
            <h3 className="mt-2 font-mono text-[15px] font-semibold text-syntax-heading">
              {repository?.name ?? study.slug}
            </h3>
            <p className="mt-1 font-mono text-[11px] text-syntax-muted">
              {labels.caseRole[copyId]}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {repository && (
              <a
                href={repository.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded border border-syntax-border px-2.5 py-1 font-mono text-[10px] text-syntax-link transition-colors hover-syntax"
              >
                <GitBranch size={11} />
                repository
              </a>
            )}
            {repository && (
              <div className="flex items-center gap-3 font-mono text-[10px] text-syntax-comment">
                <span className="flex items-center gap-1">
                  <Star size={10} /> {repository.stars}
                </span>
                <span>{repository.language}</span>
                <span>{repository.sizeKb.toLocaleString("en")} KB</span>
              </div>
            )}
          </div>
        </div>

        {repository?.description && (
          <p className="mt-3 max-w-3xl text-[12px] leading-6 text-syntax-muted">
            {repository.description}
          </p>
        )}
      </header>

      <div className="space-y-3.5 px-4 py-3.5">
        <section>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-syntax-comment">
            problem
          </h4>
          <p className="mt-1.5 max-w-3xl text-[12.5px] leading-6 text-syntax-text">{problem}</p>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-syntax-comment">
              method
            </h4>
            <ol className="mt-2 space-y-1.5">
              {method.map((step, index) => (
                <li key={step} className="flex gap-2.5 text-[12px] leading-5 text-syntax-muted">
                  <span className="select-none font-mono text-[10px] text-syntax-comment">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-syntax-comment">
              outcome
            </h4>
            <ul className="mt-2 space-y-1.5">
              {outcome.map((item) => (
                <li key={item} className="flex gap-2.5 text-[12px] leading-5 text-syntax-muted">
                  <span className="select-none text-syntax-branch">&gt;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-syntax-comment">
            measured
          </h4>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {repository && (
              <>
                <RepositoryFact
                  label={labels.metricLabels.primary_language}
                  value={repository.language}
                />
                <RepositoryFact
                  label={labels.metricLabels.latest_push}
                  value={repository.pushedAt}
                />
              </>
            )}
            {metrics.map((metric) => (
              <MetricTileCard
                key={metric.key}
                tile={{
                  key: metric.key,
                  value: metric.unresolved ? "—" : metric.value,
                  unit: metric.unit,
                  context: metric.context,
                  source: metric.source,
                  sourceDetail: metric.sourceDetail,
                }}
                label={metric.label}
                contextLabel={
                  metric.context ? labels.metricLabels[metric.context] ?? metric.context : undefined
                }
              />
            ))}
          </div>

          {metrics.some((metric) => metric.unresolved) && (
            <p className="mt-2 flex items-start gap-2 font-mono text-[10px] leading-4 text-syntax-warning">
              <ShieldAlert size={12} className="mt-0.5 shrink-0" />
              unfilled metric slots. enter your measured values in
              data/config/case-studies.ts — nothing is invented for you.
            </p>
          )}
        </section>

        <section className="flex flex-wrap items-center gap-2">
          {study.stack.map((item) => (
            <span
              key={item}
              className="rounded border border-syntax-border px-2 py-0.5 font-mono text-[10px] text-syntax-muted"
            >
              {item}
            </span>
          ))}
        </section>

        {provenance && (
          <p
            className={cn(
              "border-t border-syntax-border pt-3 font-mono text-[10.5px] leading-5 text-syntax-comment"
            )}
          >
            {provenance}
          </p>
        )}
      </div>
    </article>
  );
}

function RepositoryFact({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-md border border-syntax-border bg-syntax-surface px-4 py-3">
      <div className="font-mono text-[10px] uppercase leading-4 tracking-[0.16em] text-syntax-comment">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-xl tabular-nums text-syntax-text">
        {formatMetric(value)}
        {suffix && <span className="ml-1 text-[11px] text-syntax-muted">{suffix}</span>}
      </div>
    </div>
  );
}
