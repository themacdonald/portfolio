"use client";

import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useActiveDocument from "@/hooks/useActiveDocument";
import { explorer, ExplorerItem } from "@/data/navigation";

interface ExplorerNodeProps {
  item: ExplorerItem;
  activeId: string;
  depth?: number;
}

function hasActiveDescendant(item: ExplorerItem, activeId: string): boolean {
  if (item.type === "file") {
    return item.target === activeId;
  }

  return item.children.some((child) => hasActiveDescendant(child, activeId));
}

function ExplorerNode({
  item,
  activeId,
  depth = 0,
}: ExplorerNodeProps) {
  if (item.type === "file") {
    const isActive = activeId === item.target;
    const ref = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
      if (isActive && ref.current) {
        ref.current.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }
    }, [isActive]);

    return (
      <a
        ref={ref}
        href={`#${item.target}`}
        className={`
          flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors

          ${
            isActive
              ? "border-l-2 border-syntax-branch bg-syntax-surface-muted font-medium text-syntax-text"
              : "text-syntax-muted hover:bg-syntax-surface-muted hover:text-syntax-text"
          }
        `}
        style={{
          paddingLeft: `${depth * 16 + 10}px`,
        }}
      >
        <FileText
          size={14}
          className="text-syntax-file shrink-0"
        />

        <span>{item.filename}</span>
      </a>
    );
  }

  const [open, setOpen] = useState(item.defaultOpen ?? false);

  useEffect(() => {
    if (hasActiveDescendant(item, activeId)) {
      setOpen(true);
    }
  }, [activeId]);

  return (
    <div>

      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          w-full
          items-center
          gap-2
          rounded-md
          px-2
          py-1.5
          text-sm
          text-syntax-muted
          transition-colors
          hover:bg-syntax-surface-muted
          hover:text-syntax-text
        "
        style={{
          paddingLeft: `${depth * 16 + 10}px`,
        }}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}

        <Folder
          size={14}
          className="text-syntax-folder"
        />

        {item.name}
      </button>

      {open &&
        item.children.map((child) => (
          <ExplorerNode
            key={child.type === "file" ? child.target : child.name}
            item={child}
            activeId={activeId}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

export default function Sidebar() {
  const active = useActiveDocument();

  return (
    <aside
      className="
        flex
        h-full
        w-72
        shrink-0
        flex-col
        overflow-y-auto
        border-r
        border-syntax-border
        bg-syntax-surface
      "
    >
      <header className="border-b border-syntax-border px-5 py-4">

        <div className="text-xs uppercase tracking-[0.28em] text-syntax-comment">
          notebook
        </div>

        <h1 className="mt-3 text-base font-semibold text-syntax-heading">
          themacdonald
        </h1>

      </header>

      <nav className="flex-1 px-3 py-5">

        <p className="mb-4 px-2 text-xs uppercase tracking-[0.28em] text-syntax-muted">
          explorer
        </p>

        {explorer.map((item) => (
          <ExplorerNode
            key={item.type === "folder" ? item.name : item.target}
            item={item}
            activeId={active?.id ?? ""}
          />
        ))}

      </nav>
    </aside>
  );
}