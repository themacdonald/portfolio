"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CellShellProps {
  cellId: number;
  type: "markdown" | "code";
  kernel?: string;
  status: "idle" | "queued" | "running" | "done";
  elapsedMs?: number;
  runLabel?: string;
  onRun?: () => void;
  children: ReactNode;
}

const STATUS_LABEL: Record<CellShellProps["status"], string> = {
  idle: "idle",
  queued: "queued",
  running: "running",
  done: "done",
};

export default function CellShell({
  cellId,
  type,
  kernel,
  status,
  elapsedMs,
  runLabel,
  onRun,
  children,
}: CellShellProps) {
  const isCode = type === "code";
  const running = status === "running" || status === "queued";

  return (
    <section id={`cell-${cellId}`} className="scroll-mt-24">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-syntax-comment">
            {isCode ? `In [${status === "done" ? cellId : " "}]:` : `cell ${cellId}`}
          </span>
          {isCode && kernel && (
            <span className="rounded border border-syntax-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-syntax-tech">
              {kernel}
            </span>
          )}
          {isCode && (
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.2em]",
                running
                  ? "kernel-running text-syntax-warning"
                  : status === "done"
                    ? "text-syntax-success"
                    : "text-syntax-comment"
              )}
            >
              {STATUS_LABEL[status]}
              {typeof elapsedMs === "number" ? ` ${elapsedMs}ms` : ""}
            </span>
          )}
        </div>

        {isCode && runLabel && onRun && (
          <button
            type="button"
            onClick={onRun}
            disabled={running}
            className={cn(
              "rounded border border-syntax-border px-3 py-1 font-mono text-[11px] transition-colors",
              running ? "cursor-not-allowed text-syntax-comment" : "text-syntax-command hover-syntax"
            )}
          >
            {runLabel}
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-md border border-syntax-border bg-syntax-surface">
        {children}
      </div>
    </section>
  );
}
