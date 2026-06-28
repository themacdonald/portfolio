"use client";

import { useEffect, useId, useRef, useState } from "react";
import EditorBlock from "./EditorBlock";

interface MermaidDiagramProps {
  line: number;
  chart: string;
  className?: string;
}

declare global {
  interface Window {
    mermaid?: any;
  }
}

const SUPPORTED_DIAGRAMS = [
  "flowchart",
  "graph TD",
  "graph LR",
  "sequenceDiagram",
  "stateDiagram-v2",
  "erDiagram",
  "gitGraph",
] as const;

type MermaidDiagramType = (typeof SUPPORTED_DIAGRAMS)[number];

const mermaidThemeVariables = {
  background: "transparent",
  primaryColor: "#181c24",
  primaryTextColor: "#e5e9f0",
  secondaryColor: "#1f232a",
  tertiaryColor: "#121417",
  lineColor: "#232a34",
  border1: "#2e3744",
  border2: "#2e3744",
  textColor: "#e5e9f0",
  mainBkg: "#181c24",
  noteBkgColor: "#1f232a",
  noteTextColor: "#8f97a6",
  clusterBkg: "#1f232a",
  clusterBorder: "#2e3744",
  actorBorder: "#7ccf8f",
  arrowheadColor: "#232a34",
  edgeLabelBackground: "#181c24",
  noteBorder: "#232a34",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: "14px",
  borderRadius: "4px",
  lineWidth: "1.5px",
};

let mermaidLoader: Promise<any> | null = null;

function loadMermaid() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mermaid can only be loaded in the browser."));
  }

  if (window.mermaid) {
    return Promise.resolve(window.mermaid);
  }

  if (mermaidLoader) {
    return mermaidLoader;
  }

  mermaidLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-mermaid-notebook]");

    if (existing) {
      if (window.mermaid) {
        resolve(window.mermaid);
        return;
      }

      existing.addEventListener("load", () => {
        if (window.mermaid) {
          resolve(window.mermaid);
        } else {
          reject(new Error("Mermaid loaded but global object is unavailable."));
        }
      });

      existing.addEventListener("error", () => {
        reject(new Error("Failed to load Mermaid script."));
      });

      return;
    }

    const script = document.createElement("script");
    script.setAttribute("data-mermaid-notebook", "true");
    script.async = true;
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@10.4.0/dist/mermaid.min.js";

    script.onload = () => {
      if (window.mermaid) {
        resolve(window.mermaid);
      } else {
        reject(new Error("Mermaid loaded but global object is unavailable."));
      }
    };

    script.onerror = () => {
      reject(new Error("Failed to load Mermaid script."));
    };

    document.body.appendChild(script);
  }).catch((error) => {
    mermaidLoader = null;
    throw error;
  });

  return mermaidLoader;
}

function getDiagramType(chart: string): MermaidDiagramType | null {
  const normalized = chart.trim().split("\n")[0].trim();

  for (const diagram of SUPPORTED_DIAGRAMS) {
    const escaped = diagram.replace(" ", "\\s+");
    const pattern = new RegExp(`^${escaped}`, "i");
    if (pattern.test(normalized)) {
      return diagram;
    }
  }

  if (/^flowchart\b/i.test(normalized)) {
    return "flowchart";
  }

  return null;
}

function initializeMermaid(mermaid: any) {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "base",
    themeVariables: mermaidThemeVariables,
    flowchart: {
      htmlLabels: false,
      curve: "basis",
      useMaxWidth: true,
    },
    gitGraph: {
      useMaxWidth: true,
    },
    sequence: {
      actorMargin: 50,
      useMaxWidth: true,
    },
    state: {
      useMaxWidth: true,
    },
  });
}

export default function MermaidDiagram({ line, chart, className = "" }: MermaidDiagramProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement | null>(null);
  const [svg, setSvg] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "rendered" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "150px 0px 150px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const diagramType = getDiagramType(chart);

    if (!visible) {
      return;
    }

    if (!diagramType) {
      setStatus("error");
      setError("Unsupported Mermaid diagram type.");
      return;
    }

    let cancelled = false;

    async function renderDiagram() {
      setStatus("loading");
      setError(null);
      setSvg("");

      try {
        const mermaid = await loadMermaid();
        if (cancelled) return;

        initializeMermaid(mermaid);

        mermaid.render(`mermaid-${id}`, chart, (svgCode: string) => {
          if (cancelled) return;
          setSvg(svgCode);
          setStatus("rendered");
        });
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, id, visible]);

  return (
    <EditorBlock line={line} className={`mb-6 ${className}`}>
      <div className="rounded-sm border border-editor-border bg-editor-surface px-4 py-4">
        <div ref={ref} className="min-h-[8rem]">
          {status === "idle" && <div className="text-syntax-muted">Loading diagram…</div>}
          {status === "loading" && <div className="text-syntax-muted">Rendering diagram…</div>}
          {status === "error" && (
            <div className="rounded-sm border border-editor-warning bg-editor-surface-2 px-4 py-4">
              <div className="text-syntax-heading font-semibold">Diagram failed to render</div>
              <div className="mt-2 text-sm text-syntax-muted">{error ?? "Unsupported Mermaid syntax."}</div>
            </div>
          )}
          {status === "rendered" && svg && (
            <div className="mermaid overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />
          )}
        </div>
      </div>
    </EditorBlock>
  );
}
