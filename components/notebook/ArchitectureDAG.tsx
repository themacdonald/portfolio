"use client";

import { useMemo } from "react";

import type { ShellLabels, SystemArchitectureDAG } from "@/types/portfolio-contract";
import { cn, fillCount } from "@/lib/utils";

interface ArchitectureDAGProps {
  dag: SystemArchitectureDAG;
  labels: ShellLabels;
}

const DOMAIN_ORDER = [
  "analytics",
  "quality",
  "alignment",
  "memory",
  "coaching",
  "network",
  "telemetry",
];

const DOMAIN_COLOR: Record<string, string> = {
  analytics: "bg-syntax-command",
  quality: "bg-syntax-concept",
  alignment: "bg-syntax-branch",
  memory: "bg-syntax-warning",
  coaching: "bg-syntax-tech",
  network: "bg-syntax-number",
  telemetry: "bg-syntax-success",
};

export default function ArchitectureDAG({ dag, labels }: ArchitectureDAGProps) {
  const byDomain = useMemo(() => {
    const groups = new Map<string, typeof dag.nodes>();
    for (const node of dag.nodes) {
      const bucket = groups.get(node.domain) ?? [];
      bucket.push(node);
      groups.set(node.domain, bucket);
    }
    return DOMAIN_ORDER.filter((domain) => groups.has(domain)).map((domain) => ({
      domain,
      nodes: (groups.get(domain) ?? []).sort((a, b) => b.weight - a.weight),
    }));
  }, [dag]);

  const edgesByType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const edge of dag.edges) {
      counts.set(edge.dependencyType, (counts.get(edge.dependencyType) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [dag.edges]);

  const heaviest = useMemo(
    () => [...dag.nodes].sort((a, b) => b.weight - a.weight).slice(0, 6),
    [dag.nodes]
  );

  return (
    <div id="architecture-dag" className="scroll-mt-24 space-y-5">
      <div className="flex flex-wrap items-center gap-4 border-b border-syntax-border pb-3 font-mono text-[11px] text-syntax-muted">
        <span>{fillCount(labels.nodesLabel, dag.nodes.length)}</span>
        <span>{fillCount(labels.edgesLabel, dag.edges.length)}</span>
        {edgesByType.map(([type, count]) => (
          <span key={type}>
            {type}: {count}
          </span>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {byDomain.map((group) => (
          <section
            key={group.domain}
            className="rounded-md border border-syntax-border bg-syntax-surface p-4"
          >
            <header className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-syntax-muted">
                {group.domain}
              </span>
              <span className="font-mono text-[10px] text-syntax-comment">
                {fillCount(labels.nodesLabel, group.nodes.length)}
              </span>
            </header>

            <ul className="space-y-2">
              {group.nodes.map((node) => (
                <li key={node.id}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-[11.5px] text-syntax-text">
                      {node.id}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-syntax-number">
                      {node.weight.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-syntax-surface-muted">
                    <span
                      className={cn("block h-full rounded-full", DOMAIN_COLOR[group.domain])}
                      style={{ width: `${Math.round(node.weight * 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 truncate font-mono text-[10px] text-syntax-comment">
                    {node.subSystem}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="rounded-md border border-syntax-border bg-syntax-surface p-4">
        <header className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-syntax-muted">
          {labels.highestCriticalityLabel}
        </header>
        <div className="flex flex-wrap gap-2">
          {heaviest.map((node) => (
            <span
              key={node.id}
              className="rounded border border-syntax-border px-2 py-1 font-mono text-[11px] text-syntax-muted"
            >
              <span className="text-syntax-text">{node.id}</span>
              <span className="ml-2 text-syntax-number">{node.weight.toFixed(2)}</span>
            </span>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-syntax-border bg-syntax-surface">
        <header className="border-b border-syntax-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-syntax-muted">
          {labels.edgeManifestLabel}
        </header>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full border-collapse font-mono text-[11.5px]">
            <thead>
              <tr>
                <th className="border-b border-syntax-border px-4 py-2 text-left font-medium text-syntax-command">
                  source
                </th>
                <th className="border-b border-syntax-border px-4 py-2 text-left font-medium text-syntax-command">
                  target
                </th>
                <th className="border-b border-syntax-border px-4 py-2 text-left font-medium text-syntax-command">
                  dependencyType
                </th>
              </tr>
            </thead>
            <tbody>
              {dag.edges.map((edge) => (
                <tr key={`${edge.source}->${edge.target}`} className="hover-syntax">
                  <td className="border-b border-syntax-border-soft px-4 py-1.5 text-syntax-text">
                    {edge.source}
                  </td>
                  <td className="border-b border-syntax-border-soft px-4 py-1.5 text-syntax-muted">
                    {edge.target}
                  </td>
                  <td className="border-b border-syntax-border-soft px-4 py-1.5 text-syntax-number">
                    {edge.dependencyType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
