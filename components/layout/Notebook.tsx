"use client";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/notebook/TopBar";
import MainContent from "@/components/layout/MainContent";
import ReadingProgress from "@/components/layout/ReadingProgress";
import ShortcutSheet from "@/components/layout/ShortcutSheet";
import {
  WorkspaceProvider,
  useWorkspace,
  type ThemeArchetype,
} from "@/components/workspace/WorkspaceProvider";
import type { AgenticPortfolioPayload } from "@/types/portfolio-contract";

interface NotebookShellProps {
  payload: AgenticPortfolioPayload;
}

export default function Notebook({ payload }: NotebookShellProps) {
  const initialLangKey = payload.metadata.availableLanguages[0] ?? "en";
  const initialTheme: ThemeArchetype = "dark";

  return (
    <WorkspaceProvider
      payload={payload}
      initialLangKey={initialLangKey}
      initialTheme={initialTheme}
    >
      <div className="flex h-screen w-full overflow-hidden bg-syntax-background text-syntax-text">
        <Sidebar />
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />
          <ReadingProgress />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <MainContent />
            </div>
          </main>
          <StatusBar />
        </section>
        <ShortcutSheet />
      </div>
    </WorkspaceProvider>
  );
}

/** Editor status line: the utility numbers, kept out of the reading flow. */
function StatusBar() {
  const { payload, node, langKey, viewMode } = useWorkspace();

  return (
    <footer className="hidden shrink-0 items-center gap-4 border-t border-syntax-border bg-syntax-tabbar px-4 py-1.5 font-mono text-[10px] text-syntax-comment sm:flex">
      <span className="text-syntax-branch">{langKey.toUpperCase()}</span>
      <span>{viewMode}</span>
      <span>
        metrics <span className="text-syntax-text">{payload.dashboard.metrics.length}</span>
      </span>
      <span>
        repos <span className="text-syntax-text">{payload.dashboard.repositories.length}</span>
      </span>
      <span>
        nodes <span className="text-syntax-text">{payload.systemArchitectureDAG.nodes.length}</span>
      </span>
      <span className="ml-auto">{node.profileNarrative.title}</span>
    </footer>
  );
}
