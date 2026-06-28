import EditorDocument from "@/components/ui/editor/EditorDocument";
import EditorHeading from "@/components/ui/editor/EditorHeading";
import EditorParagraph from "@/components/ui/editor/EditorParagraph";

export default function OpenSource() {
  return (
    <EditorDocument id="open-source">
      <EditorParagraph line={1} className="mb-2 text-sm uppercase tracking-[0.25em] text-editor-muted">OPEN_SOURCE.md</EditorParagraph>
  
      <EditorHeading line={2}>Open Source</EditorHeading>
  
      <EditorParagraph line={3}>
        I believe public work is the best evidence of engineering ability.
        Every repository is treated as documentation of a problem, the thinking
        behind it, and the solution that emerged.
      </EditorParagraph>
  
      <div className="mt-12">
        <a href="https://github.com/themacdonald" target="_blank" rel="noopener noreferrer" className="text-editor-link hover:text-editor-text">
          github.com/themacdonald →
        </a>
      </div>
    </EditorDocument>
  );
}