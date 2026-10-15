"use client";

import { useMemo, useState } from "react";

import type { Segment, TimePoint } from "@/types/portfolio-contract";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Language composition: one proportional strip plus a readout list.
 * ------------------------------------------------------------------ */

const RIBBON = [
  "bg-syntax-command",
  "bg-syntax-tech",
  "bg-syntax-branch",
  "bg-syntax-number",
  "bg-syntax-concept",
  "bg-syntax-success",
];

export function LanguageRibbon({ segments }: { segments: Segment[] }) {
  if (segments.length === 0) {
    return <p className="font-mono text-[11px] text-syntax-comment">no bytes measured</p>;
  }
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden">
        {segments.map((segment, index) => (
          <span
            key={segment.label}
            title={`${segment.label} ${(segment.share ?? 0).toFixed(1)}%`}
            className={cn("h-full", RIBBON[index % RIBBON.length])}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-2.5 space-y-1.5">
        {segments.map((segment, index) => (
          <li key={segment.label} className="flex items-baseline gap-2.5">
            <span className={cn("h-1.5 w-1.5 shrink-0", RIBBON[index % RIBBON.length])} />
            <span className="flex-1 truncate font-mono text-[11px] text-syntax-text">
              {segment.label}
            </span>
            <span className="readout text-[15px] text-syntax-number">
              {(segment.share ?? 0).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Repository activity: a commit curve per repository with its span.
 * ------------------------------------------------------------------ */

const CURVE_W = 120;
const CURVE_H = 16;

export function RepositoryStrips({ series }: { series: TimePoint[] }) {
  if (series.length === 0) {
    return <p className="font-mono text-[11px] text-syntax-comment">no commit history</p>;
  }

  const rows = series.map((point) => {
    const months = (point.series ?? "")
      .split(",")
      .filter(Boolean)
      .map((entry) => {
        const [month, count] = entry.split(":");
        return { month, count: Number(count) };
      });
    const peak = Math.max(1, ...months.map((entry) => entry.count));
    return { name: point.period, total: point.value, months, peak };
  });

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.name} className="flex items-center gap-3">
          <span
            className="w-36 shrink-0 truncate font-mono text-[10.5px] text-syntax-muted"
            title={row.name}
          >
            {row.name}
          </span>

          <span className="flex-1">
            <CommitCurve months={row.months} peak={row.peak} label={row.name} />
          </span>

          <span className="readout w-7 shrink-0 text-right text-[15px] text-syntax-text">
            {row.total}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CommitCurve({
  months,
  peak,
  label,
}: {
  months: { month: string; count: number }[];
  peak: number;
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const points = useMemo(() => {
    if (months.length === 0) return [];
    if (months.length === 1) {
      return [{ x: CURVE_W / 2, y: CURVE_H - (months[0].count / peak) * (CURVE_H - 2) }];
    }
    return months.map((entry, index) => ({
      x: (index / (months.length - 1)) * CURVE_W,
      y: CURVE_H - 1 - (entry.count / peak) * (CURVE_H - 3),
    }));
  }, [months, peak]);

  if (points.length === 0) {
    return <span className="block h-4" />;
  }

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const area = `${line} L${points[points.length - 1].x},${CURVE_H} L${points[0].x},${CURVE_H} Z`;

  return (
    <span className="relative block">
      <svg
        viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label} commit history, peak ${peak} in one month`}
        className="h-4 w-full"
      >
        <line
          x1="0"
          y1={CURVE_H - 0.5}
          x2={CURVE_W}
          y2={CURVE_H - 0.5}
          stroke="var(--syntax-border-soft)"
          strokeWidth="1"
        />
        <path d={area} fill="var(--syntax-command)" fillOpacity="0.14" />
        <path
          d={line}
          fill="none"
          stroke="var(--syntax-command)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          className="fig-stroke"
        />
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={hover === index ? 2.4 : 1.6}
            fill={hover === index ? "var(--syntax-tech)" : "var(--syntax-command)"}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {hover !== null && months[hover] && (
        <span className="pointer-events-none absolute -top-5 left-0 whitespace-nowrap bg-syntax-background px-1.5 py-0.5 font-mono text-[9.5px] text-syntax-text">
          {months[hover].month}: {months[hover].count}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Repository signals: tick meters, not progress bars.
 * ------------------------------------------------------------------ */

const SIGNAL_TONE: Record<string, string> = {
  tracked_repos: "var(--syntax-text)",
  with_description: "var(--syntax-command)",
  with_topics: "var(--syntax-tech)",
  with_demo: "var(--syntax-branch)",
  python_primary: "var(--syntax-number)",
  created_2026: "var(--syntax-concept)",
};

export function SignalBars({ series }: { series: TimePoint[] }) {
  if (series.length === 0) {
    return <p className="font-mono text-[11px] text-syntax-comment">nothing measured</p>;
  }
  const max = Math.max(1, ...series.map((point) => point.value));

  return (
    <ul className="space-y-2">
      {series.map((point) => (
        <li key={point.period} className="flex items-center gap-2.5">
          <span className="w-32 shrink-0 truncate font-mono text-[10.5px] text-syntax-muted">
            {point.period}
          </span>
          <TickMeter value={point.value} max={max} tone={SIGNAL_TONE[point.period]} />
          <span className="readout w-6 shrink-0 text-right text-[15px] text-syntax-text">
            {point.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function TickMeter({ value, max, tone }: { value: number; max: number; tone?: string }) {
  const ticks = 20;
  const filled = Math.round((value / max) * ticks);
  return (
    <span className="flex flex-1 items-center gap-[2px]">
      {Array.from({ length: ticks }, (_, index) => (
        <span
          key={index}
          className="h-2.5 flex-1"
          style={{
            // Empty ticks sit on a hairline rule so the track reads in both
            // archetypes without competing with the fill.
            backgroundColor:
              index < filled ? (tone ?? "var(--syntax-command)") : "var(--syntax-border-soft)",
          }}
        />
      ))}
    </span>
  );
}
