"use client";

import { AlertTriangle, Check, HelpCircle } from "lucide-react";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import type { MetricSource, VerdictTone } from "@/types/portfolio-contract";
import { cn } from "@/lib/utils";

const TONE: Record<VerdictTone, { text: string; rule: string; Icon: typeof Check }> = {
  caution: { text: "text-syntax-warning", rule: "bg-syntax-warning", Icon: AlertTriangle },
  neutral: { text: "text-syntax-tech", rule: "bg-syntax-tech", Icon: HelpCircle },
  strong: { text: "text-syntax-success", rule: "bg-syntax-success", Icon: Check },
};

/**
 * One sentence reading of the telemetry. The code and the numbers come from the
 * pipeline; only the sentence is translated. It states what the evidence shows.
 */
export default function Verdict() {
  const { payload, node } = useWorkspace();
  const labels = node.dashboardLabels;
  const verdict = payload.dashboard.verdict;
  const tone = TONE[verdict.tone] ?? TONE.neutral;

  const template = labels.verdicts[verdict.code] ?? "";
  const sentence = template.replace(/\{(\w+)\}/g, (_match, key: string) =>
    String(verdict.values[key] ?? "")
  );

  return (
    <div className="flex items-start gap-3 border border-syntax-border bg-syntax-surface px-4 py-3">
      <span className={cn("mt-1.5 h-2 w-2 shrink-0", tone.rule)} />
      <div className="min-w-0">
        <div className="label text-syntax-comment">reading</div>
        <p className={cn("mt-1 text-[13.5px] leading-6", tone.text)}>{sentence}</p>
      </div>
    </div>
  );
}

const BADGE: Record<MetricSource, { tone: string; labelKey: "verifiedLabel" | "selfReportedLabel" | "unmeasuredLabel" }> = {
  github: { tone: "text-syntax-success border-syntax-success", labelKey: "verifiedLabel" },
  derived: { tone: "text-syntax-success border-syntax-success", labelKey: "verifiedLabel" },
  config: { tone: "text-syntax-warning border-syntax-warning", labelKey: "selfReportedLabel" },
};

/** Says plainly whether a figure is measured from a system or declared by hand. */
export function EvidenceBadge({ source }: { source: MetricSource }) {
  const { node } = useWorkspace();
  const entry = BADGE[source];
  if (!entry) return null;
  return (
    <span
      className={cn(
        "label border px-1.5 py-0.5 text-[8.5px] tracking-[0.14em]",
        entry.tone
      )}
    >
      {node.shellLabels[entry.labelKey]}
    </span>
  );
}
