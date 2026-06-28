import { currentFocus } from "@/data/profile";
import EditorDocument from "@/components/ui/editor/EditorDocument";
import EditorHeading from "@/components/ui/editor/EditorHeading";
import EditorParagraph from "@/components/ui/editor/EditorParagraph";
import MermaidDiagram from "@/components/ui/editor/MermaidDiagram";

export default function CurrentFocus() {
  return (

    <EditorDocument id="current-focus">
      <EditorParagraph line={1} className="mb-2 text-sm uppercase tracking-[0.25em] text-editor-muted">
        CURRENT_FOCUS.md
      </EditorParagraph>

      <EditorHeading line={2} level={2}>
        What I'm focused on right now.
      </EditorHeading>

      <EditorParagraph line={3}>
        My interests evolve over time, but they consistently revolve around
        building reliable systems, improving decision making with data, and
        exploring practical applications of artificial intelligence.
      </EditorParagraph>

      <MermaidDiagram
        line={4}
        chart={`flowchart TB
  classDef heading fill:#181c24,stroke:#2e3744,stroke-width:1px,color:#d99d5f,font-family:JetBrains Mono,font-size:14px
  classDef tech fill:#181c24,stroke:#2e3744,stroke-width:1px,color:#5ac4d1
  classDef concept fill:#181c24,stroke:#2e3744,stroke-width:1px,color:#ab82ef

  today([Today]):::heading --> ai([AI Quality Engineering]):::tech
  ai --> kg([Knowledge Graphs]):::tech
  kg --> ml([Graph ML]):::concept
  ml --> agents([AI Agents]):::concept
  agents --> k8s([Kubernetes]):::concept
  k8s --> ds([Distributed Systems]):::concept
`}
      />

      <div className="mt-14 space-y-10">
        {currentFocus.map((item, idx) => (
          <div key={item.title}>
            <EditorHeading line={4 + idx} level={3}>{item.title}</EditorHeading>
            <EditorParagraph line={5 + idx}>{item.description}</EditorParagraph>
          </div>
        ))}
      </div>
    </EditorDocument>
  );
}