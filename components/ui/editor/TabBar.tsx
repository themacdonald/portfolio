"use client";

import { FileText } from "lucide-react";
import useActiveDocument from "@/hooks/useActiveDocument";

export default function TabBar() {
  const active = useActiveDocument();

  const path = `notebook/${active.filename}`;

  return (
    <header className="sticky top-0 z-40 border-b border-editor-border bg-editor-surface px-6">
      <div className="flex h-14 items-center justify-between gap-3 text-sm">
        <div className="text-editor-muted">{path}</div>
        <div className="flex items-center gap-2 rounded-md border border-editor-border px-3 py-2 text-sm">
          <span className="text-syntax-branch"></span>
          <span className="font-semibold text-syntax-heading">{active.filename}</span>
        </div>
      </div>
    </header>
  );
}
