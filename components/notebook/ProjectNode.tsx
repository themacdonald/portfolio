"use client";

import { ArrowUpRight, GitBranch } from "lucide-react";

import type { ProjectDetail } from "@/types/portfolio-contract";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { cn } from "@/lib/utils";

const REPO_URLS: Record<string, string> = {
  BiasGuard: "https://github.com/themacdonald/BiasGuard",
  FeedbackLoop: "https://github.com/themacdonald/FeedbackLoop",
  ConfidenceCoach: "https://github.com/themacdonald/ConfidenceCoach",
  "AgriMANET-Scheduler": "https://github.com/themacdonald/AgriMANET-Scheduler",
};

const NODE_BINDINGS: Record<string, string> = {
  BiasGuard: "biasguard.audit",
  FeedbackLoop: "feedbackloop.align",
  ConfidenceCoach: "confidencecoach.memory",
  "AgriMANET-Scheduler": "agrimanet.wrr",
};

const DOT_CLASS: Record<string, string> = {
  BiasGuard: "bg-syntax-concept",
  FeedbackLoop: "bg-syntax-command",
  ConfidenceCoach: "bg-syntax-number",
  "AgriMANET-Scheduler": "bg-syntax-tech",
};

interface ProjectNodeProps {
  slug: string;
  detail: ProjectDetail;
  growthLabel: string;
}

export default function ProjectNode({ slug, detail, growthLabel }: ProjectNodeProps) {
  const { activeProject, setActiveProject, payload, node: localeNode } = useWorkspace();
  const shell = localeNode.shellLabels;
  const isActive = activeProject === slug;
  const node = payload.systemArchitectureDAG.nodes.find(
    (entry) => entry.id === NODE_BINDINGS[slug]
  );

  return (
    <article
      id={`repo-${slug}`}
      className={cn(
        "scroll-mt-24 rounded-md border bg-syntax-surface p-5 transition-colors",
        isActive ? "border-syntax-branch" : "border-syntax-border"
      )}
      onMouseEnter={() => setActiveProject(slug)}
      onMouseLeave={() => setActiveProject(null)}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("h-2 w-2 rounded-full", DOT_CLASS[slug] ?? "bg-syntax-tech")} />
          <h3 className="font-mono text-base font-semibold text-syntax-heading">{slug}</h3>
        </div>
        <a
          href={REPO_URLS[slug]}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-mono text-[11px] text-syntax-link transition-opacity hover:opacity-80"
        >
          {shell.repositoryLabel}
          <ArrowUpRight size={12} />
        </a>
      </header>

      <p className="mt-3 text-sm leading-6 text-syntax-text">{detail.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] text-syntax-muted">
        <span className="flex items-center gap-1">
          <GitBranch size={12} className="text-syntax-branch" />
          {NODE_BINDINGS[slug]}
        </span>
        {node && (
          <>
            <span className="text-syntax-comment">
              {shell.domainLabel}: {node.domain}
            </span>
            <span className="text-syntax-comment">
              {shell.weightLabel}: {node.weight.toFixed(2)}
            </span>
          </>
        )}
      </div>

      <div className="mt-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-syntax-comment">
          {growthLabel}
        </div>
        <ul className="mt-3 space-y-2">
          {detail.updatedFeatures.map((feature) => (
            <li key={feature} className="flex gap-3 text-sm leading-6 text-syntax-muted">
              <span className="select-none text-syntax-branch">&gt;</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
