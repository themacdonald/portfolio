import { profile } from "@/data/profile";
import EditorDocument from "@/components/ui/editor/EditorDocument";
import EditorHeading from "@/components/ui/editor/EditorHeading";
import EditorParagraph from "@/components/ui/editor/EditorParagraph";

export default function Introduction() {
  return (
    <EditorDocument id="introduction">
      <EditorParagraph line={1} className="mb-2 text-sm uppercase tracking-[0.25em] text-editor-muted">
        README.md
      </EditorParagraph>

      <EditorHeading line={2} level={2}>
        Welcome to my engineering notebook.
      </EditorHeading>

      <EditorParagraph line={3} className="font-mono text-sm text-editor-muted">
        {profile.title}
      </EditorParagraph>

      {profile.intro.map((paragraph, idx) => (
        <EditorParagraph key={idx} line={4 + idx} className="font-mono text-sm text-editor-text">
          {paragraph}
        </EditorParagraph>
      ))}
    </EditorDocument>
  );
}