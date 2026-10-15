"use client";

import type { ReactNode } from "react";

import { EvidenceBadge } from "@/components/dashboard/Verdict";
import type { MetricSource } from "@/types/portfolio-contract";
import { cn } from "@/lib/utils";

interface FigureFrameProps {
  /** Plate number, rendered as FIG_00X. */
  index: number;
  title: string;
  sourceLabel: string;
  sourceDetail?: string;
  source?: MetricSource;
  /** Instrument readouts: label and value pairs, no sentences. */
  readouts?: { label: string; value: string }[];
  className?: string;
  children: ReactNode;
}

/**
 * A numbered plate. Charts present as figures with a monospace label, a
 * hairline frame and instrument readouts rather than as prose captions.
 */
export default function FigureFrame({
  index,
  title,
  sourceLabel,
  sourceDetail,
  source,
  readouts = [],
  className,
  children,
}: FigureFrameProps) {
  return (
    <figure className={cn("plate", className)}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-syntax-border px-3.5 py-2">
        <span className="figure-label">FIG_{String(index).padStart(3, "0")}</span>
        <h3 className="display-tight text-[15px] text-syntax-text">{title}</h3>
        <span className="ml-auto flex items-center gap-2">
          {source && <EvidenceBadge source={source} />}
          <span className="label text-syntax-comment" title={sourceDetail}>
            {sourceLabel}
          </span>
        </span>
      </div>

      <div className="px-3.5 py-3">{children}</div>

      {readouts.length > 0 && (
        <dl className="flex flex-wrap gap-x-5 gap-y-1 border-t border-syntax-border px-3.5 py-2">
          {readouts.map((readout) => (
            <div key={readout.label} className="flex items-baseline gap-1.5">
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-syntax-comment">
                {readout.label}
              </dt>
              <dd className="readout text-[15px] text-syntax-text">{readout.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </figure>
  );
}
