"use client";

import { useState } from "react";

import type { NotebookCell as NotebookCellModel } from "@/types/portfolio-contract";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import CellShell from "@/components/notebook/CellShell";
import TelemetryOutput from "@/components/notebook/TelemetryOutput";
import TokenizedLine from "@/components/ui/editor/TokenizedLine";
import { cn } from "@/lib/utils";

interface NotebookCellProps {
  cell: NotebookCellModel;
  /** Recruiter mode collapses long code cells so the prose stays readable. */
  collapsedByDefault?: boolean;
}

export default function NotebookCell({ cell, collapsedByDefault = false }: NotebookCellProps) {
  const { node, executions, runCell } = useWorkspace();
  const shell = node.shellLabels;
  const [expanded, setExpanded] = useState(!collapsedByDefault);
  const state = executions[cell.id];
  const status = state?.status ?? "idle";
  const isCode = cell.type === "code";

  return (
    <CellShell
      cellId={cell.id}
      type={cell.type}
      kernel={cell.executionMetadata?.requiresKernel}
      status={isCode ? status : "done"}
      elapsedMs={state?.elapsedMs}
      runLabel={isCode ? node.interfaceLabels.runCellBtn : undefined}
      onRun={isCode ? () => runCell(cell) : undefined}
    >
      <div className="flex">
        <div className="hidden w-12 shrink-0 select-none border-r border-syntax-border bg-syntax-cell-gutter pt-4 text-right sm:block">
          {cell.sourceLines.map((_, index) => (
            <div
              key={index}
              className="pr-3 font-mono text-[10px] leading-6 text-syntax-comment opacity-60"
            >
              {(index + 1).toString().padStart(2, "0")}
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {isCode && !expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-full px-4 py-3 text-left font-mono text-[11px] text-syntax-comment transition-colors hover-syntax"
            >
              {cell.sourceLines.length} lines of Python — show source
            </button>
          ) : isCode ? (
            <div className="overflow-x-auto px-4 py-4">
              {cell.sourceLines.map((line, index) => (
                <div key={index} className="flex leading-6">
                  <TokenizedLine
                    line={line || " "}
                    language="python"
                    className={cn(
                      "font-mono text-[12.5px] leading-6",
                      index === 0 ? "text-syntax-text" : undefined
                    )}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-4">
              {cell.sourceLines.map((line, index) => (
                <MarkdownLine key={index} line={line} />
              ))}
            </div>
          )}

          {isCode && cell.executionMetadata && (
            <TelemetryOutput
              telemetry={cell.executionMetadata.simulatedTelemetry}
              label={node.interfaceLabels.telemetryOutput}
              idleMessage={shell.outputIdle}
              runningMessage={shell.outputRunning}
              consoleLabel={shell.rawConsoleLabel}
              status={status}
            />
          )}
        </div>
      </div>
    </CellShell>
  );
}

function MarkdownLine({ line }: { line: string }) {
  if (line.trim() === "") {
    return <div className="h-3" />;
  }

  return (
    <TokenizedLine
      line={line}
      language="markdown"
      className="block font-mono text-[12.5px] leading-7"
    />
  );
}
