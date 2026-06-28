import EditorDocument from "@/components/ui/editor/EditorDocument";
import EditorHeading from "@/components/ui/editor/EditorHeading";
import EditorParagraph from "@/components/ui/editor/EditorParagraph";
import MermaidDiagram from "@/components/ui/editor/MermaidDiagram";

export default function Philosophy() {
  const principles = [
    "Reliable AI begins with reliable data.",
    "Documentation is part of engineering, not an afterthought.",
    "Dashboards should answer questions, not create more.",
    "Simple systems are easier to trust than clever ones.",
    "Every project should leave behind reusable knowledge.",
  ];

  return (
    <EditorDocument id="philosophy">
      <EditorParagraph line={1} className="mb-2 text-sm uppercase tracking-[0.25em] text-editor-muted">
        PHILOSOPHY.md
      </EditorParagraph>

      <EditorHeading line={2} level={2}>
        How I think about building software.
      </EditorHeading>

      <EditorParagraph line={3}>
        Tools change. Frameworks change. The principles behind good
        engineering rarely do. These ideas guide how I approach AI,
        analytics, software engineering, and product development.
      </EditorParagraph>

      {principles.map((principle, idx) => (
        <EditorParagraph key={idx} line={4 + idx}>
          <span className="text-editor-muted">&gt;</span> {principle}
        </EditorParagraph>
      ))}

      <MermaidDiagram
        line={10}
        chart={`flowchart TB
  classDef heading fill:#181c24,stroke:#2e3744,stroke-width:1px,color:#d99d5f,font-family:JetBrains Mono,font-size:14px
  classDef command fill:#181c24,stroke:#2e3744,stroke-width:1px,color:#7db7e8
  classDef concept fill:#181c24,stroke:#2e3744,stroke-width:1px,color:#ab82ef
  classDef branch fill:#181c24,stroke:#2e3744,stroke-width:1px,color:#7ccf8f
  classDef warning fill:#181c24,stroke:#2e3744,stroke-width:1px,color:#dcb45f

  observe([Observe]):::heading --> measure([Measure]):::command
  measure --> understand([Understand]):::concept
  understand --> improve([Improve]):::branch
  improve --> repeat([Repeat]):::warning
  repeat --> process([Process]):::heading
`}
      />
    </EditorDocument>
  );
}