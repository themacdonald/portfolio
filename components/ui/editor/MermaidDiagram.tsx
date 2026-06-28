"use client";

import { useEffect, useId, useRef, useState } from "react";
import EditorBlock from "./EditorBlock";

interface MermaidDiagramProps {
  line: number;
  chart: string;
  className?: string;
}

interface MermaidAPI {
  initialize(config: unknown): void;
  render(
    id: string,
    text: string,
    callback: (svg: string) => void
  ): Promise<void> | void;
}

declare global {
  interface Window {
    mermaid?: MermaidAPI;
  }
}

const MERMAID_VERSION = "10.9.1";

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
  primaryTextColor: "#e6edf3",
  primaryBorderColor: "#30363d",

  secondaryColor: "#1f232a",
  secondaryBorderColor: "#30363d",

  tertiaryColor: "#121417",

  lineColor: "#30363d",

  border1: "#30363d",
  border2: "#30363d",

  textColor: "#e6edf3",

  mainBkg: "#181c24",

  noteBkgColor: "#1f232a",
  noteTextColor: "#8b949e",

  clusterBkg: "#1f232a",
  clusterBorder: "#30363d",

  actorBorder: "#3fb950",

  arrowheadColor: "#30363d",

  edgeLabelBackground: "#181c24",

  noteBorder: "#30363d",

  fontFamily: "JetBrains Mono",

  fontSize: "14px",

  borderRadius: "4px",

  lineWidth: "1.5px",
};

let loader: Promise<MermaidAPI> | null = null;

let initialized = false;

function loadMermaid(): Promise<MermaidAPI> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Mermaid can only be loaded in the browser.")
    );
  }

  if (window.mermaid) {
    return Promise.resolve(window.mermaid);
  }

  if (loader) {
    return loader;
  }

  loader = new Promise<MermaidAPI>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-mermaid]"
    );

    if (existing) {
      if (window.mermaid) {
        resolve(window.mermaid);
        return;
      }

      existing.addEventListener("load", () => {
        if (window.mermaid) {
          resolve(window.mermaid);
        } else {
          reject(
            new Error("Mermaid loaded but was not found on window.")
          );
        }
      });

      existing.addEventListener("error", () => {
        reject(new Error("Unable to load Mermaid."));
      });

      return;
    }

    const script = document.createElement("script");

    script.async = true;

    script.dataset.mermaid = "true";

    script.src = `https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/mermaid.min.js`;

    script.onload = () => {
      if (window.mermaid) {
        resolve(window.mermaid);
      } else {
        reject(
          new Error("Mermaid loaded but was not found on window.")
        );
      }
    };

    script.onerror = () => {
      reject(new Error("Unable to load Mermaid."));
    };

    document.body.appendChild(script);
  }).catch((error) => {
    loader = null;
    throw error;
  });

  return loader;
}

function initializeMermaid(mermaid: MermaidAPI) {
  if (initialized) {
    return;
  }

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

    er: {
      useMaxWidth: true,
    },
  });

  initialized = true;
}

function getDiagramType(
  chart: string
): MermaidDiagramType | null {
  const firstLine = chart.trim().split("\n")[0].trim();

  for (const type of SUPPORTED_DIAGRAMS) {
    const escaped = type.replace(" ", "\\s+");

    const regex = new RegExp(`^${escaped}`, "i");

    if (regex.test(firstLine)) {
      return type;
    }
  }

  if (/^flowchart\b/i.test(firstLine)) {
    return "flowchart";
  }

  return null;
}
export default function MermaidDiagram({
  line,
  chart,
  className = "",
}: MermaidDiagramProps) {
  const id = useId();

  const containerRef = useRef<HTMLDivElement>(null);

  const [svg, setSvg] = useState("");

  const [status, setStatus] = useState<
    "idle" | "loading" | "rendered" | "error"
  >("idle");

  const [error, setError] = useState<string | null>(null);

  const [visible, setVisible] = useState(false);

  /*
   * Lazy render only when approaching viewport
   */

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setVisible(true);

        observer.disconnect();
      },
      {
        rootMargin: "250px 0px",
        threshold: 0.05,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  /*
   * Render Mermaid
   */

  useEffect(() => {
    if (!visible) {
      return;
    }

    const type = getDiagramType(chart);

    if (!type) {
      setStatus("error");
      setError("Unsupported Mermaid diagram.");
      return;
    }

    let cancelled = false;

    async function render() {
      try {
        setStatus("loading");

        setSvg("");

        setError(null);

        const mermaid = await loadMermaid();

        if (cancelled) {
          return;
        }

        initializeMermaid(mermaid);

        const renderId = `diagram-${id}`;

        await mermaid.render(
          renderId,
          chart,
          (svgCode: string) => {
            if (cancelled) {
              return;
            }

            setSvg(svgCode);

            setStatus("rendered");
          }
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        setStatus("error");

        setError(
          err instanceof Error
            ? err.message
            : "Unable to render Mermaid diagram."
        );
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [chart, id, visible]);

  return (
    <EditorBlock
      line={line}
      className={`mb-8 ${className}`}
    >
      <div className="overflow-hidden rounded-md border border-syntax-border bg-syntax-surface">

        <div className="border-b border-syntax-border bg-syntax-surface-muted px-4 py-2">

          <span className="font-mono text-xs uppercase tracking-[0.25em] text-syntax-comment">
            Mermaid Diagram
          </span>

        </div>

        <div
          ref={containerRef}
          className="min-h-[10rem] p-6"
        >

          {status === "idle" && (
            <div className="font-mono text-sm text-syntax-comment">
              Initializing renderer...
            </div>
          )}

          {status === "loading" && (
            <div className="space-y-2 font-mono text-sm">

              <div className="text-syntax-command">
                $ mermaid render
              </div>

              <div className="text-syntax-comment">
                Parsing Mermaid syntax...
              </div>

              <div className="text-syntax-comment">
                Rendering SVG...
              </div>

            </div>
          )}

          {status === "error" && (
            <div className="rounded-md border border-syntax-warning bg-syntax-surface-muted p-5">

              <div className="mb-3 font-mono text-sm text-syntax-command">
                $ mermaid render
              </div>

              <div className="font-semibold text-syntax-error">
                Render failed
              </div>

              <div className="mt-2 font-mono text-sm text-syntax-comment">
                {error}
              </div>

              <div className="mt-4 font-mono text-xs text-syntax-warning">
                Exit code: 1
              </div>

            </div>
          )}

          {status === "rendered" && svg && (
            <div
              role="img"
              aria-label="Mermaid diagram"
              className="mermaid overflow-x-auto"
              dangerouslySetInnerHTML={{
                __html: svg,
              }}
            />
          )}

        </div>

      </div>
    </EditorBlock>
  );
}