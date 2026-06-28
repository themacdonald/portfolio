"use client";

import { useEffect, useState } from "react";

export interface ActiveDocument {
  id: string;
  filename: string;
}

const documents: ActiveDocument[] = [
  {
    id: "introduction",
    filename: "README.md",
  },
  {
    id: "philosophy",
    filename: "PHILOSOPHY.md",
  },
  {
    id: "current-focus",
    filename: "CURRENT_FOCUS.md",
  },
  {
    id: "repositories",
    filename: "REPOSITORIES.md",
  },
  {
    id: "agrigraph-ai",
    filename: "AgriGraphAI.md",
  },
  {
    id: "agrimanet-scheduler",
    filename: "AgriMANETScheduler.md",
  },
  {
    id: "feedbackloop",
    filename: "FeedbackLoop.md",
  },
  {
    id: "biasguard",
    filename: "BiasGuard.md",
  },
  {
    id: "healthcare-dashboard",
    filename: "HealthcareDashboard.md",
  },
  {
    id: "football-dashboard",
    filename: "FootballDashboard.md",
  },
  {
    id: "career-log",
    filename: "CAREER_LOG.md",
  },
  {
    id: "research",
    filename: "RESEARCH.md",
  },
  {
    id: "lab-notes",
    filename: "LAB_NOTES.md",
  },
  {
    id: "open-source",
    filename: "OPEN_SOURCE.md",
  },
  {
    id: "contact",
    filename: "CONTACT.md",
  },
];

export default function useActiveDocument() {
  const [active, setActive] = useState<ActiveDocument>(documents[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);

        if (visible.length === 0) return;

        const best = visible.sort((a, b) => {
          const aTop = a.boundingClientRect.top;
          const bTop = b.boundingClientRect.top;

          return aTop - bTop;
        })[0];

        const id = best.target.id;

        const document = documents.find((doc) => doc.id === id);

        if (document) {
          setActive(document);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    documents.forEach((doc) => {
      const element = document.getElementById(doc.id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return active;
}