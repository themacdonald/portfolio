"use client";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import ArchitectureDAG from "@/components/notebook/ArchitectureDAG";
import ProjectNode from "@/components/notebook/ProjectNode";
import TokenizedLine from "@/components/ui/editor/TokenizedLine";
import type { NotebookCell } from "@/types/portfolio-contract";

interface ProjectNodeLogProps {
  cell: NotebookCell;
}

interface ParsedLog {
  preamble: string[];
  projects: { slug: string; lines: string[] }[];
  closing: string[];
}

/** Split the markdown log cell into preamble, one block per project node, and closing. */
function parseLog(cell: NotebookCell, slugs: string[]): ParsedLog {
  const preamble: string[] = [];
  const projects: { slug: string; lines: string[] }[] = [];
  const closing: string[] = [];

  let current: { slug: string; lines: string[] } | null = null;
  let inClosing = false;

  for (const line of cell.sourceLines) {
    const heading = /^###\s+(.+?)\s*$/.exec(line);

    if (heading) {
      const slug = slugs.find((candidate) => heading[1].startsWith(candidate));
      if (slug) {
        current = { slug, lines: [] };
        projects.push(current);
        inClosing = false;
        continue;
      }
    }

    if (line.startsWith("## ")) {
      inClosing = true;
      current = null;
    }

    if (inClosing) {
      closing.push(line);
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }

  return { preamble, projects, closing };
}

export default function ProjectNodeLog({ cell }: ProjectNodeLogProps) {
  const { node, payload } = useWorkspace();
  const slugs = Object.keys(node.projectDetails);
  const { preamble, projects, closing } = parseLog(cell, slugs);
  const growthLabel = node.interfaceLabels.recentGrowthTitle;

  return (
    <div className="space-y-6 px-5 py-4">
      <div>
        {preamble.map((line, index) => (
          <LogLine key={`pre-${index}`} line={line} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((project) => {
          const detail = node.projectDetails[project.slug];
          if (!detail) return null;
          return (
            <div key={project.slug} className="space-y-3">
              <div>
                {project.lines.map((line, index) => (
                  <LogLine key={`${project.slug}-${index}`} line={line} />
                ))}
              </div>
              <ProjectNode slug={project.slug} detail={detail} growthLabel={growthLabel} />
            </div>
          );
        })}
      </div>

      <div>
        {closing.map((line, index) => (
          <LogLine key={`close-${index}`} line={line} />
        ))}
      </div>

      <ArchitectureDAG dag={payload.systemArchitectureDAG} labels={node.shellLabels} />
    </div>
  );
}

function LogLine({ line }: { line: string }) {
  if (line.trim() === "") return <div className="h-3" />;
  return (
    <TokenizedLine line={line} language="markdown" className="block leading-7" />
  );
}
