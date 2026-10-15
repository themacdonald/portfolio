"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { SimulatedTelemetry, TelemetryRecordValue } from "@/types/portfolio-contract";
import { cn } from "@/lib/utils";

interface TelemetryOutputProps {
  telemetry: SimulatedTelemetry;
  label: string;
  idleMessage: string;
  runningMessage: string;
  consoleLabel: string;
  status: "idle" | "queued" | "running" | "done";
}

function renderValue(value: TelemetryRecordValue): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function isNumeric(value: TelemetryRecordValue): boolean {
  return typeof value === "number";
}

export default function TelemetryOutput({
  telemetry,
  label,
  idleMessage,
  runningMessage,
  consoleLabel,
  status,
}: TelemetryOutputProps) {
  const [consoleOpen, setConsoleOpen] = useState(false);
  const records = telemetry.records;
  const fields = telemetry.outputFields;
  const columns = fields.length > 0 ? fields : Object.keys(records[0] ?? {});
  const keys = Object.keys(records[0] ?? {});

  const visible = status === "done";

  return (
    <div className="border-t border-syntax-border bg-syntax-background">
      <div className="flex items-center justify-between gap-4 border-b border-syntax-border px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-syntax-comment">
          {label}
        </span>
        {visible && (
          <span className="font-mono text-[10px] text-syntax-comment">
            {records.length} rows / {columns.length} columns
          </span>
        )}
      </div>

      {!visible && (
        <div className={cn("px-4 py-5 font-mono text-[12px]", status === "running" ? "text-syntax-warning" : "text-syntax-comment")}>
          {status === "running" ? `$ ${runningMessage}` : `$ ${idleMessage}`}
        </div>
      )}

      {visible && (
        <>
          <div className="px-4 pt-4 font-mono text-[12px] text-syntax-text">
            {telemetry.metricsHeader}
          </div>

          <div className="overflow-x-auto px-4 py-4">
            <table className="w-full border-collapse font-mono text-[12px]">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="border-b border-syntax-border px-3 py-2 text-left font-medium text-syntax-command"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record, rowIndex) => (
                  <tr key={rowIndex} className="hover-syntax">
                    {keys.map((key, columnIndex) => {
                      const value = record[key];
                      return (
                        <td
                          key={`${key}-${columnIndex}`}
                          className={cn(
                            "border-b border-syntax-border-soft px-3 py-2",
                            isNumeric(value)
                              ? "text-right text-syntax-number"
                              : columnIndex === 0
                                ? "text-left text-syntax-text"
                                : "text-left text-syntax-muted"
                          )}
                        >
                          {renderValue(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {telemetry.rawConsoleLog && telemetry.rawConsoleLog.length > 0 && (
            <div className="border-t border-syntax-border">
              <button
                type="button"
                onClick={() => setConsoleOpen((current) => !current)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left font-mono text-[11px] text-syntax-muted transition-colors hover-syntax"
              >
                {consoleOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                {consoleLabel}
              </button>
              {consoleOpen && (
                <pre className="overflow-x-auto border-t border-syntax-border px-4 py-4 font-mono text-[11px] leading-5 text-syntax-comment">
                  {telemetry.rawConsoleLog.join("\n")}
                </pre>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
