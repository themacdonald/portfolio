import { labNotes } from "@/data/labNotes";
import EditorDocument from "@/components/ui/editor/EditorDocument";
import EditorHeading from "@/components/ui/editor/EditorHeading";
import EditorParagraph from "@/components/ui/editor/EditorParagraph";

export default function LabNotes() {
  return (
    <EditorDocument id="lab-notes">
      <EditorParagraph line={1} className="mb-2 text-sm uppercase tracking-[0.25em] text-editor-muted">LAB_NOTES.md</EditorParagraph>

      <EditorHeading line={2}>Lab Notes</EditorHeading>

      <EditorParagraph line={3}>Short ideas, experiments, and notes from my work.</EditorParagraph>

      <div className="mt-16 space-y-10">
        {labNotes.map((note, idx) => (
          <div key={note.title} className="border-l border-editor-border pl-6">
            <EditorParagraph line={4 + idx} className="text-sm text-editor-muted">{note.date}</EditorParagraph>
            <EditorHeading line={5 + idx} level={3}>{note.title}</EditorHeading>
            <EditorParagraph line={6 + idx}>{note.summary}</EditorParagraph>
          </div>
        ))}
      </div>
    </EditorDocument>
  );
}
