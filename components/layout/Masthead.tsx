"use client";

import { ArrowRight, CheckCircle2, Clock, Mail, MapPin } from "lucide-react";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { identity } from "@/data/config/identity";

/**
 * The hero. One promise in the display face, the proof underneath, and exactly
 * two ways forward. Everything else on the page is reachable from here.
 */
export default function Masthead() {
  const { payload, node } = useWorkspace();
  const meta = payload.metadata;
  const labels = node.dashboardLabels;
  const shell = node.shellLabels;
  const narrative = node.profileNarrative;

  const primaryContact = identity.contacts.find((contact) => contact.primary);
  const secondaryContacts = identity.contacts.filter((contact) => !contact.primary);

  const proof = [
    { value: String(payload.dashboard.metrics.length), label: "sourced metrics" },
    { value: String(payload.dashboard.repositories.length), label: "tracked repos" },
    { value: String(meta.availableLanguages.length), label: "locales" },
    { value: String(payload.systemArchitectureDAG.nodes.length), label: "dag nodes" },
  ];

  return (
    <header className="border-b border-syntax-border pb-7">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="label text-syntax-command">{identity.handle}</span>
        <span className="label text-syntax-comment">portfolio</span>
        <span className="label text-syntax-comment">v{meta.globalTelemetryVersion}</span>
        <span className="label ml-auto text-syntax-comment">
          compiled {meta.compiledTimestamp.slice(0, 10)}
        </span>
      </div>

      <h1 className="display mt-5 text-[34px] text-syntax-text sm:text-[46px] lg:text-[54px]">
        {narrative.headline}
      </h1>

      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-syntax-muted">
        {narrative.summary}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        {primaryContact && (
          <a
            href={primaryContact.url}
            className="group flex items-center gap-2 bg-syntax-command px-4 py-2 font-mono text-[11.5px] font-medium text-syntax-background transition-transform hover:-translate-y-px"
          >
            <Mail size={13} />
            {primaryContact.value}
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        )}
        <a
          href="#dashboard"
          className="border border-syntax-border px-4 py-2 font-mono text-[11.5px] text-syntax-text transition-colors hover-syntax"
        >
          {shell.viewDashboard}
        </a>
        <a
          href="#tracks"
          className="link-underline font-mono text-[11.5px] text-syntax-muted hover:text-syntax-text"
        >
          {shell.viewWork}
        </a>
      </div>

      <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-3 border-t border-syntax-border pt-4">
        {proof.map((item) => (
          <div key={item.label}>
            <dd className="figure-value text-[20px] text-syntax-text">{item.value}</dd>
            <dt className="label mt-1 text-syntax-comment">{item.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10.5px] text-syntax-muted">
        <span className="flex items-center gap-1.5">
          <MapPin size={11} />
          {identity.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={11} />
          {identity.timezone}
        </span>
        <span className="flex items-center gap-1.5 text-syntax-success">
          <CheckCircle2 size={11} />
          {labels.availability[identity.availabilityId]}
        </span>
        {secondaryContacts.map((contact) => (
          <a
            key={contact.id}
            href={contact.url}
            target={contact.url?.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="link-underline hover:text-syntax-text"
          >
            {labels.contactLabels[contact.id] ?? contact.id}
          </a>
        ))}
      </div>

      <ul className="mt-5 flex flex-wrap gap-1.5">
        {narrative.focusAreas.map((area) => (
          <li
            key={area}
            className="border border-syntax-border px-2 py-1 font-mono text-[9.5px] text-syntax-tech"
          >
            {area}
          </li>
        ))}
      </ul>
    </header>
  );
}
