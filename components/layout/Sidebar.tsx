"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { caseStudies } from "@/data/config/case-studies";
import { identity } from "@/data/config/identity";
import { cn } from "@/lib/utils";

const CELL_FILES: Record<number, string> = {
  1: "01_summary.md",
  2: "02_ledger.py",
  3: "03_evaluation.py",
  4: "04_nodes.md",
};

/** Editor-style workspace tree. Words stay short; the pane does the talking. */
export default function Sidebar() {
  const { payload, node, langKey, navOpen, setNavOpen } = useWorkspace();
  const labels = node.dashboardLabels;
  const [open, setOpen] = useState<Record<string, boolean>>({
    work: true,
    notebook: false,
    dag: false,
  });

  const toggle = (key: string) =>
    setOpen((current) => ({ ...current, [key]: !current[key] }));

  const recent = useMemo(
    () =>
      [...payload.dashboard.repositories]
        .sort((left, right) => right.pushedAt.localeCompare(left.pushedAt))
        .slice(0, 4),
    [payload.dashboard.repositories]
  );

  return (
    <>
      {navOpen && (
        <button
          type="button"
          aria-label="close navigation"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-syntax-border bg-syntax-surface transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <header className="border-b border-syntax-border px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className="display-tight truncate text-[17px] text-syntax-text">
                {identity.handle}
              </h1>
              <p className="label mt-1 truncate text-syntax-command">
                {identity.secondaryTitle}
              </p>
              <p className="mt-0.5 truncate font-mono text-[10px] text-syntax-muted">
                {identity.jobTitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="close navigation"
              className="rounded border border-syntax-border p-1 text-syntax-muted lg:hidden"
            >
              <X size={12} />
            </button>
          </div>
        </header>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <a
            href="#profile"
            onClick={() => setNavOpen(false)}
            className="mb-0.5 flex items-center gap-2 rounded px-2 py-1 font-mono text-[11.5px] text-syntax-muted transition-colors hover-syntax hover:text-syntax-text"
          >
            <span className="text-syntax-file">~</span>
            {labels.sectionTitles.profile}
          </a>
          <a
            href="#dashboard"
            onClick={() => setNavOpen(false)}
            className="mb-1.5 flex items-center gap-2 rounded px-2 py-1 font-mono text-[11.5px] text-syntax-branch transition-colors hover-syntax"
          >
            <span className="text-syntax-file">~/</span>
            {labels.sectionTitles.dashboard}
            <span className="ml-auto text-syntax-comment">{payload.dashboard.metrics.length}</span>
          </a>

          <Row
            label={labels.sectionTitles.tracks}
            open={open.work ?? false}
            onToggle={() => toggle("work")}
          />
          {open.work && (
            <div className="mb-1">
              {caseStudies.map((study) => (
                <a
                  key={study.slug}
                  href={`#case-${study.slug}`}
                  onClick={() => setNavOpen(false)}
                  className="block truncate rounded py-1 pl-6 pr-2 font-mono text-[11px] text-syntax-muted transition-colors hover-syntax hover:text-syntax-text"
                >
                  {study.repo ?? study.slug}
                </a>
              ))}
            </div>
          )}

          <Row
            label={labels.sectionTitles.notebook}
            open={open.notebook ?? false}
            onToggle={() => toggle("notebook")}
          />
          {open.notebook && (
            <div className="mb-1">
              {node.notebookCells.map((cell) => (
                <a
                  key={cell.id}
                  href={`#cell-${cell.id}`}
                  onClick={() => setNavOpen(false)}
                  className="flex items-center gap-2 rounded py-1 pl-6 pr-2 font-mono text-[11px] text-syntax-muted transition-colors hover-syntax hover:text-syntax-text"
                >
                  <span className="shrink-0 text-[9.5px] text-syntax-comment">
                    [{cell.id}]
                  </span>
                  <span className="truncate">{CELL_FILES[cell.id]}</span>
                </a>
              ))}
              <a
                href="#architecture"
                onClick={() => setNavOpen(false)}
                className="block truncate rounded py-1 pl-6 pr-2 font-mono text-[11px] text-syntax-muted transition-colors hover-syntax hover:text-syntax-text"
              >
                {labels.sectionTitles.architecture}
              </a>
              <a
                href="#methodology"
                onClick={() => setNavOpen(false)}
                className="block truncate rounded py-1 pl-6 pr-2 font-mono text-[11px] text-syntax-muted transition-colors hover-syntax hover:text-syntax-text"
              >
                {labels.sectionTitles.methodology}
              </a>
            </div>
          )}

          <Row
            label="recently pushed"
            open={open.dag ?? false}
            onToggle={() => toggle("dag")}
          />
          {open.dag && (
            <div className="mb-1">
              {recent.map((repo) => (
                <a
                  key={repo.name}
                  href={`#case-${repo.track === "analytics" ? "healthcare-insights" : repo.name.toLowerCase()}`}
                  onClick={() => setNavOpen(false)}
                  className="flex items-center gap-2 rounded py-1 pl-6 pr-2 font-mono text-[10.5px] text-syntax-muted transition-colors hover-syntax hover:text-syntax-text"
                >
                  <span className="truncate">{repo.name}</span>
                  <span className="ml-auto shrink-0 text-syntax-comment">{repo.pushedAt}</span>
                </a>
              ))}
            </div>
          )}
        </nav>

        <footer className="border-t border-syntax-border px-4 py-2.5">
          <p className="truncate font-mono text-[10px] text-syntax-muted">
            <span className="text-syntax-branch">{langKey}</span> · {identity.location}
          </p>
          <p className="truncate font-mono text-[10px] text-syntax-comment">
            snapshot {payload.dashboard.generatedAt.slice(0, 10)}
          </p>
        </footer>
      </aside>
    </>
  );
}

interface RowProps {
  label: string;
  open: boolean;
  onToggle: () => void;
}

function Row({ label, open, onToggle }: RowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left font-mono text-[11.5px] text-syntax-muted transition-colors hover-syntax hover:text-syntax-text"
    >
      {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      <span className="truncate">{label}</span>
    </button>
  );
}
