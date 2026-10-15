"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Database } from "lucide-react";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import ChartSurface from "@/components/dashboard/ChartSurface";
import Verdict from "@/components/dashboard/Verdict";
import type { MetricValue, MetricTile } from "@/types/portfolio-contract";
import { cn } from "@/lib/utils";

const UNIT_FORMAT: Record<string, (value: number) => string> = {
  count: (value) => new Intl.NumberFormat("en").format(value),
  percent: (value) => `${value.toFixed(1)}%`,
  score: (value) => value.toFixed(2),
  ratio: (value) => value.toFixed(2),
  date: (value) => new Date(value).toISOString().slice(0, 10),
};

export function formatMetric(value: MetricValue["value"], unit?: MetricValue["unit"]): string {
  if (typeof value === "string") return value;
  return (unit && UNIT_FORMAT[unit] ? UNIT_FORMAT[unit] : UNIT_FORMAT.count)(value);
}

export function MetricTileCard({
  tile,
  label,
  contextLabel,
}: {
  tile: MetricTile;
  label: string;
  /** Localized context copy, resolved from the locale node. */
  contextLabel?: string;
}) {
  return (
    <div className="plate px-3 py-2.5">
      <div className="label leading-4 text-syntax-comment">{label}</div>
      <div
        className={cn(
          "figure-value mt-1.5",
          tile.emphasis ? "text-[30px] text-syntax-command" : "text-[25px] text-syntax-text"
        )}
      >
        {formatMetric(tile.value, tile.unit)}
      </div>
      {tile.context && (
        <div className="mt-0.5 truncate font-mono text-[9.5px] text-syntax-muted">
          {contextLabel ?? tile.context}
        </div>
      )}
    </div>
  );
}

/** KPI strip plus every chart. The heatmap leads because it is the story. */
export function DashboardGrid() {
  const { payload, node } = useWorkspace();
  const labels = node.dashboardLabels;
  const { dashboard } = payload;

  const heatmap = dashboard.charts.find((chart) => chart.kind === "heatmap");
  const rest = dashboard.charts.filter((chart) => chart.kind !== "heatmap");

  return (
    <div className="space-y-3">
      <Verdict />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {dashboard.tiles.map((tile) => (
          <MetricTileCard
            key={tile.key}
            tile={tile}
            label={labels.metricLabels[tile.key] ?? tile.key}
            contextLabel={
              tile.context ? labels.metricLabels[tile.context] ?? tile.context : undefined
            }
          />
        ))}
      </div>

      {heatmap && <ChartSurface chart={heatmap} />}

      {/* Masonry keeps each chart at its natural height instead of stretching
          a short card to match a tall neighbour. */}
      <div className="columns-1 gap-3 lg:columns-2 [&>*]:mb-3 [&>*]:break-inside-avoid">
        {rest.map((chart) => (
          <ChartSurface key={chart.id} chart={chart} />
        ))}
      </div>
    </div>
  );
}

/** Data provenance, collapsed by default so it never leads the page. */
export function DataSourcesPanel() {
  const { payload, node } = useWorkspace();
  const [open, setOpen] = useState(false);
  const labels = node.dashboardLabels;
  const { dashboard } = payload;

  return (
    <section className="plate-flat">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-mono text-[11px] text-syntax-muted transition-colors hover-syntax"
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <Database size={12} className="text-syntax-tech" />
        <span className="text-syntax-text">data sources</span>
        <span className="text-syntax-comment">
          {dashboard.sources.length} · {dashboard.metrics.length} metrics traced
        </span>
      </button>

      {open && (
        <ul className="divide-y divide-syntax-border border-t border-syntax-border">
          {dashboard.sources.map((source) => (
            <li key={`${source.id}-${source.detail}`} className="px-4 py-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-[11.5px] text-syntax-command">
                  {labels.sourceLabels[source.id] ?? source.id}
                </span>
                {source.capturedAt && (
                  <span className="font-mono text-[10px] text-syntax-comment">
                    {source.capturedAt.slice(0, 10)}
                  </span>
                )}
              </div>
              <p className="mt-0.5 font-mono text-[10.5px] leading-4 text-syntax-muted">
                {source.detail}
              </p>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-block break-all font-mono text-[10px] text-syntax-link hover:opacity-80"
                >
                  {source.url}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
