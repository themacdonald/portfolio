"use client";

import { X } from "lucide-react";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: "g d", action: "dashboard" },
  { keys: "g t", action: "tracks" },
  { keys: "g p", action: "profile" },
  { keys: "g m", action: "methodology" },
  { keys: "g n", action: "notebook" },
  { keys: "g c", action: "contact" },
  { keys: "?", action: "toggle this sheet" },
  { keys: "esc", action: "close overlays" },
];

/** Keyboard legend. Opens on `?`, closes on Escape. */
export default function ShortcutSheet() {
  const { helpOpen, setHelpOpen, node } = useWorkspace();
  if (!helpOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-4 py-24">
      <div className="plate w-full max-w-sm">
        <header className="flex items-center justify-between border-b border-syntax-border px-3.5 py-2">
          <span className="fig-label">keys</span>
          <button
            type="button"
            onClick={() => setHelpOpen(false)}
            aria-label="close"
            className="text-syntax-muted transition-colors hover:text-syntax-text"
          >
            <X size={13} />
          </button>
        </header>
        <dl className="divide-y divide-syntax-border">
          {SHORTCUTS.map((entry) => (
            <div key={entry.keys} className="flex items-baseline justify-between px-3.5 py-2">
              <dt className="font-mono text-[11px] text-syntax-command">{entry.keys}</dt>
              <dd className="font-mono text-[10.5px] text-syntax-muted">{entry.action}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-syntax-border px-3.5 py-2 font-mono text-[9.5px] text-syntax-comment">
          {node.interfaceLabels.workspaceFiles}
        </p>
      </div>
    </div>
  );
}
