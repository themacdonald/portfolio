"use client";

import { CheckCircle2, Clock, Mail, MapPin } from "lucide-react";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { identity } from "@/data/config/identity";

/**
 * Identity strip: the facts the masthead cannot carry — where he is, what time
 * zone he answers in, what he is open to — then the action that matters.
 */
export default function ProfileHero() {
  const { node } = useWorkspace();
  const labels = node.dashboardLabels;
  const narrative = node.profileNarrative;

  const primaryContact = identity.contacts.find((contact) => contact.primary);
  const secondaryContacts = identity.contacts.filter((contact) => !contact.primary);

  return (
    <section className="plate-flat px-3.5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px] text-syntax-muted">
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
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {primaryContact && (
            <a
              href={primaryContact.url}
              className="flex items-center gap-1.5 border border-syntax-branch px-2.5 py-1 font-mono text-[10.5px] text-syntax-branch transition-colors hover-syntax"
            >
              <Mail size={11} />
              {labels.contactLabels[primaryContact.id] ?? primaryContact.id}
            </a>
          )}
          {secondaryContacts.map((contact) => (
            <a
              key={contact.id}
              href={contact.url}
              target={contact.url?.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="border border-syntax-border px-2.5 py-1 font-mono text-[10.5px] text-syntax-muted transition-colors hover-syntax hover:text-syntax-text"
            >
              {labels.contactLabels[contact.id] ?? contact.id}
            </a>
          ))}
        </div>
      </div>

      <ul className="mt-2.5 flex flex-wrap gap-1.5">
        {narrative.focusAreas.map((area) => (
          <li
            key={area}
            className="border border-syntax-border px-2 py-0.5 font-mono text-[9.5px] text-syntax-tech"
          >
            {area}
          </li>
        ))}
      </ul>
    </section>
  );
}
