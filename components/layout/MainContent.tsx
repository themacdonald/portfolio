"use client";

import { useMemo } from "react";
import { GraduationCap } from "lucide-react";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import CaseStudyCard from "@/components/dashboard/CaseStudyCard";
import { DashboardGrid, DataSourcesPanel } from "@/components/dashboard/DashboardPanel";
import ArchitectureDAG from "@/components/notebook/ArchitectureDAG";
import NotebookCell from "@/components/notebook/NotebookCell";
import ProjectNodeLog from "@/components/notebook/ProjectNodeLog";
import Masthead from "@/components/layout/Masthead";
import Reveal from "@/components/layout/Reveal";
import { TRACK_ORDER, caseStudiesForTrack } from "@/data/config/case-studies";
import { identity } from "@/data/config/identity";
import { cn } from "@/lib/utils";

export default function MainContent() {
  const { node, payload, viewMode } = useWorkspace();
  const labels = node.dashboardLabels;
  const shell = node.shellLabels;
  const technical = viewMode === "technical";

  const principles = useMemo(
    () => [
      labels.caseProvenance.biasguard,
      labels.caseProvenance.feedbackloop,
      labels.caseProvenance.healthcare_insights,
      labels.sectionCaptions.dashboard,
    ],
    [labels]
  );

  return (
    <div className="space-y-14">
      <section id="profile" className="scroll-mt-14">
        <Masthead />
      </section>

      <Block
        index="01"
        id="dashboard"
        title={labels.sectionTitles.dashboard}
        caption={labels.sectionCaptions.dashboard}
      >
        <div className="space-y-3">
          <DashboardGrid />
          <DataSourcesPanel />
        </div>
      </Block>

      <Block index="02" id="tracks" title={labels.sectionTitles.tracks}>
        <div className="space-y-7">
          {TRACK_ORDER.map((track) => {
            const studies = caseStudiesForTrack(track);
            if (studies.length === 0) return null;
            return (
              <div key={track} className="space-y-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-syntax-border pb-2">
                  <h3 className="font-mono text-[13px] text-syntax-tech">
                    {labels.trackLabels[track]}
                  </h3>
                  <p className="text-[11.5px] text-syntax-comment">{labels.trackBlurbs[track]}</p>
                </div>
                {studies.map((study, position) => (
                  <Reveal key={study.slug} delay={position * 60}>
                    <CaseStudyCard study={study} />
                  </Reveal>
                ))}
              </div>
            );
          })}
        </div>
      </Block>

      <Block index="03" id="methodology" title={labels.sectionTitles.methodology}>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {principles.map((principle, position) => (
            <Reveal key={principle} delay={position * 50}>
              <li className="flex h-full gap-3 border border-syntax-border bg-syntax-surface px-4 py-3.5">
                <GraduationCap size={14} className="mt-0.5 shrink-0 text-syntax-command" />
                <p className="text-[12px] leading-6 text-syntax-muted">{principle}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </Block>

      <Block index="04" id="growth" title={labels.sectionTitles.growth}>
        {node.notebookCells
          .filter((cell) => cell.id === 4)
          .map((cell) => (
            <div
              key={cell.id}
              className="overflow-hidden border border-syntax-border bg-syntax-surface"
            >
              <ProjectNodeLog cell={cell} />
            </div>
          ))}
      </Block>

      {technical && (
        <Block index="05" id="architecture" title={labels.sectionTitles.architecture}>
          <ArchitectureDAG dag={payload.systemArchitectureDAG} labels={shell} />
        </Block>
      )}

      <Block
        index={technical ? "06" : "05"}
        id="notebook"
        title={labels.sectionTitles.notebook}
        caption={labels.sectionCaptions.notebook}
      >
        <div className="space-y-7">
          {node.notebookCells
            .filter((cell) => cell.id !== 4)
            .map((cell) => (
              <NotebookCell key={cell.id} cell={cell} collapsedByDefault={!technical} />
            ))}
        </div>
      </Block>

      <Block
        index={technical ? "07" : "06"}
        id="contact"
        title={labels.sectionTitles.contact}
        caption={labels.sectionCaptions.contact}
      >
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {identity.contacts.map((contact) => (
            <a
              key={contact.id}
              href={contact.url}
              download={contact.download}
              target={contact.download ? undefined : contact.url?.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={cn(
                "border bg-syntax-surface px-4 py-3 transition-transform hover:-translate-y-px",
                contact.primary ? "border-syntax-command" : "border-syntax-border"
              )}
            >
              <div className="label text-syntax-comment">
                {labels.contactLabels[contact.id] ?? contact.id}
              </div>
              <div
                className={cn(
                  "mt-1.5 break-all font-mono text-[12px]",
                  contact.primary ? "text-syntax-command" : "text-syntax-link"
                )}
              >
                {contact.value}
              </div>
              {contact.download && (
                <div className="label mt-1 text-syntax-comment">download</div>
              )}
            </a>
          ))}
        </div>
      </Block>
    </div>
  );
}

function Block({
  index,
  id,
  title,
  caption,
  children,
}: {
  index: string;
  id: string;
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-14">
        <header className="mb-4">
          <div className="flex items-baseline gap-3">
            <span className="figure-label">{index}</span>
            <h2 className="display-tight text-[19px] text-syntax-text">{title}</h2>
            <span className="h-px flex-1 bg-syntax-border" />
          </div>
          {caption && (
            <p className="mt-1.5 max-w-3xl text-[11.5px] leading-5 text-syntax-comment">
              {caption}
            </p>
          )}
        </header>
        {children}
      </section>
    </Reveal>
  );
}
