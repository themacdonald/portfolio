import { profile } from "@/data/profile";
import EditorDocument from "@/components/ui/editor/EditorDocument";
import EditorHeading from "@/components/ui/editor/EditorHeading";
import EditorParagraph from "@/components/ui/editor/EditorParagraph";

export default function Contact() {
  return (
    <EditorDocument id="contact">
      <EditorParagraph line={1} className="mb-2 text-sm uppercase tracking-[0.25em] text-editor-muted">CONTACT.md</EditorParagraph>

      <EditorHeading line={2}>Get in touch</EditorHeading>

      <EditorParagraph line={3}>
        I'm always interested in conversations about AI quality engineering,
        data platforms, analytics, open source, and ambitious engineering
        projects.
      </EditorParagraph>

      <div className="mt-12 space-y-4 text-editor-muted">
        <EditorParagraph line={4}>Email: <a href={`mailto:${profile.email}`} className="text-editor-link hover:text-editor-text">{profile.email}</a></EditorParagraph>
        <EditorParagraph line={5}>GitHub: <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-editor-link hover:text-editor-text">themacdonald</a></EditorParagraph>
        <EditorParagraph line={6}>LinkedIn: <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-editor-link hover:text-editor-text">the-macdonald</a></EditorParagraph>
      </div>
    </EditorDocument>
  );
}