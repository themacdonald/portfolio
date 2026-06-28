import { research } from "@/data/research";
import EditorDocument from "@/components/ui/editor/EditorDocument";
import EditorHeading from "@/components/ui/editor/EditorHeading";
import EditorParagraph from "@/components/ui/editor/EditorParagraph";

export default function Research() {
  return (
    <EditorDocument id="research">
      <EditorParagraph line={1} className="mb-2 text-sm uppercase tracking-[0.25em] text-editor-muted">
        RESEARCH.md
      </EditorParagraph>

      <EditorHeading line={2}>Research</EditorHeading>

      <EditorParagraph line={3}>
        I enjoy exploring ideas before they become products. Most of my work
        starts as research, evolves into experiments, and eventually becomes an
        open-source project or production system.
      </EditorParagraph>

      <div className="mt-16 space-y-12">
        {research.map((item, idx) => (
          <div key={item.title} className="border-l border-editor-border pl-6">
            <EditorHeading line={4 + idx} level={3}>{item.title}</EditorHeading>
            <EditorParagraph line={5 + idx} className="mt-2 text-sm uppercase tracking-wide text-editor-muted">{item.status}</EditorParagraph>
            <EditorParagraph line={6 + idx}>{item.summary}</EditorParagraph>
          </div>
        ))}
      </div>
    </EditorDocument>
  );
}