"use client";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import ContributionHeatmap from "@/components/dashboard/ContributionHeatmap";
import FigureFrame from "@/components/dashboard/FigureFrame";
import {
  LanguageRibbon,
  RepositoryStrips,
  SignalBars,
} from "@/components/dashboard/DistributionCharts";
import type { ChartDataset } from "@/types/portfolio-contract";

/** Every visualisation in the dashboard, presented as a numbered plate. */
export default function ChartSurface({ chart }: { chart: ChartDataset }) {
  const { payload, node } = useWorkspace();
  const labels = node.dashboardLabels;
  const { dashboard } = payload;

  const index = dashboard.charts.findIndex((entry) => entry.id === chart.id) + 1;
  const title = labels.chartTitles[chart.id] ?? chart.id;
  const sourceLabel = labels.sourceLabels[chart.source] ?? chart.source;

  return (
    <FigureFrame
      index={index}
      title={title}
      sourceLabel={sourceLabel}
      sourceDetail={chart.sourceDetail}
      source={chart.source}
      readouts={readoutsFor(chart, dashboard.contributionWeeks)}
    >
      {chart.kind === "heatmap" && (
        <ContributionHeatmap weeks={dashboard.contributionWeeks} label={title} />
      )}
      {chart.kind === "distribution" && <LanguageRibbon segments={chart.segments ?? []} />}
      {chart.kind === "strips" && <RepositoryStrips series={chart.series} />}
      {chart.kind === "signals" && <SignalBars series={chart.series} />}
    </FigureFrame>
  );
}

/** Instrument readouts per chart kind. Labels are short and language-neutral. */
function readoutsFor(
  chart: ChartDataset,
  weeks: { date: string; value: number }[][]
): { label: string; value: string }[] {
  if (chart.kind === "heatmap") {
    const days = weeks.flat();
    const active = days.filter((day) => day.value > 0).length;
    const total = days.reduce((sum, day) => sum + day.value, 0);
    return [
      { label: "days", value: String(days.length) },
      { label: "active", value: String(active) },
      { label: "total", value: String(total) },
    ];
  }

  if (chart.kind === "strips") {
    const total = chart.series.reduce((sum, point) => sum + point.value, 0);
    return [
      { label: "repos", value: String(chart.series.length) },
      { label: "commits", value: String(total) },
    ];
  }

  if (chart.kind === "signals") {
    const max = chart.series.reduce((peak, point) => Math.max(peak, point.value), 0);
    return [
      { label: "signals", value: String(chart.series.length) },
      { label: "max", value: String(max) },
    ];
  }

  if (chart.kind === "distribution") {
    return [{ label: "groups", value: String((chart.segments ?? []).length) }];
  }

  return [];
}
