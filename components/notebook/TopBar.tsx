"use client";

import { useState } from "react";
import {
  Accessibility,
  ChevronDown,
  Languages,
  Menu,
  Moon,
  Play,
  RotateCcw,
  Sun,
} from "lucide-react";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import {
  LANGUAGE_HTML_TAGS,
  LANGUAGE_LABELS,
  type LanguageKey,
} from "@/types/portfolio-contract";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const {
    payload,
    node,
    langKey,
    setLangKey,
    theme,
    toggleTheme,
    kernelBusy,
    executions,
    runAllCells,
    resetCells,
    viewMode,
    setViewMode,
    reduceMotion,
    setReduceMotion,
    setNavOpen,
  } = useWorkspace();

  const [localeOpen, setLocaleOpen] = useState(false);
  const shell = node.shellLabels;

  const codeCells = node.notebookCells.filter((cell) => cell.type === "code");
  const executed = codeCells.filter((cell) => executions[cell.id]?.status === "done").length;
  const activeKernel = codeCells[0]?.executionMetadata?.requiresKernel ?? "python3";

  const kernelLabel = node.interfaceLabels.kernelStatus.replace(
    /(:|：)\s*.+$/,
    `$1 ${kernelBusy ? "running" : "idle"}`
  );

  return (
    <header className="sticky top-0 z-30 border-b border-syntax-border bg-syntax-tabbar px-3 py-2 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label={shell.menuLabel}
          className="rounded border border-syntax-border p-1.5 text-syntax-muted transition-colors hover-syntax lg:hidden"
        >
          <Menu size={14} />
        </button>

        <span className="label text-syntax-command">evidence</span>
        <span className="label hidden text-syntax-comment md:inline">
          portfolio
        </span>

        <span
          className={cn(
            "flex items-center gap-1.5 font-mono text-[10px]",
            kernelBusy ? "kernel-running text-syntax-warning" : "text-syntax-success"
          )}
          title={kernelLabel}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              kernelBusy ? "bg-syntax-warning" : "bg-syntax-success"
            )}
          />
          <span className="hidden sm:inline">{activeKernel}</span>
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div role="group" className="flex overflow-hidden rounded border border-syntax-border">
            {(["recruiter", "technical"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                title={mode === "recruiter" ? shell.viewModeRecruiter : shell.viewModeTechnical}
                className={cn(
                  "px-2.5 py-1 font-mono text-[10px] transition-colors",
                  viewMode === mode
                    ? "bg-syntax-surface-muted text-syntax-branch"
                    : "text-syntax-muted hover-syntax"
                )}
              >
                {mode === "recruiter" ? shell.viewModeRecruiter : shell.viewModeTechnical}
              </button>
            ))}
          </div>

          {viewMode === "technical" && (
            <>
              <button
                type="button"
                onClick={runAllCells}
                title={shell.runAllBtn}
                className="rounded border border-syntax-border p-1.5 text-syntax-command transition-colors hover-syntax"
              >
                <Play size={12} />
              </button>
              <button
                type="button"
                onClick={resetCells}
                title={shell.clearBtn}
                className="hidden rounded border border-syntax-border p-1.5 text-syntax-muted transition-colors hover-syntax sm:block"
              >
                <RotateCcw size={12} />
              </button>
              <span className="hidden font-mono text-[10px] text-syntax-comment md:inline">
                {executed}/{codeCells.length}
              </span>
            </>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setLocaleOpen((current) => !current)}
              aria-expanded={localeOpen}
              aria-label="language"
              className="flex items-center gap-1.5 rounded border border-syntax-border px-2.5 py-1 font-mono text-[10px] text-syntax-text transition-colors hover-syntax"
            >
              <Languages size={11} />
              <span className="hidden sm:inline">
                {LANGUAGE_LABELS[langKey as LanguageKey] ?? langKey}
              </span>
              <span className="text-syntax-comment">
                {LANGUAGE_HTML_TAGS[langKey as LanguageKey]}
              </span>
              <ChevronDown size={11} />
            </button>

            {localeOpen && (
              <ul className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded border border-syntax-border bg-syntax-surface py-1 shadow-lg">
                {payload.metadata.availableLanguages.map((code) => (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => {
                        setLangKey(code);
                        setLocaleOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-1.5 text-left font-mono text-[11px] transition-colors hover-syntax",
                        code === langKey ? "text-syntax-branch" : "text-syntax-muted"
                      )}
                    >
                      <span>{LANGUAGE_LABELS[code as LanguageKey] ?? code}</span>
                      <span className="text-syntax-comment">{code}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={() => setReduceMotion(!reduceMotion)}
            aria-pressed={reduceMotion}
            aria-label={shell.reduceMotionLabel}
            title={shell.reduceMotionLabel}
            className={cn(
              "rounded border border-syntax-border p-1.5 transition-colors hover-syntax",
              reduceMotion ? "text-syntax-branch" : "text-syntax-muted"
            )}
          >
            <Accessibility size={13} />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme archetype"
            className="flex items-center gap-1.5 rounded border border-syntax-border px-2.5 py-1 font-mono text-[10px] text-syntax-muted transition-colors hover-syntax"
          >
            {theme === "dark" ? <Moon size={11} /> : <Sun size={11} />}
            <span className="hidden sm:inline">{theme === "dark" ? "dark" : "light"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
