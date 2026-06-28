import { work } from "@/data/work";
import EditorDocument from "@/components/ui/editor/EditorDocument";
import EditorHeading from "@/components/ui/editor/EditorHeading";
import EditorParagraph from "@/components/ui/editor/EditorParagraph";

export default function Repositories() {
  return (
    <EditorDocument id="repositories">
      <EditorParagraph line={1} className="text-sm uppercase tracking-[0.25em] text-editor-muted">REPOSITORIES.md</EditorParagraph>

      <EditorHeading line={2}>Repositories</EditorHeading>

      <EditorParagraph line={3}>
        Every project begins with a problem. These repositories document the
        thinking, engineering decisions, implementation, and outcomes behind
        the systems I've built.
      </EditorParagraph>

      <div className="space-y-32">
        {work.map((project, idx) => (
          <section id={project.slug} key={project.slug} className="scroll-mt-24">
            <div className="mb-10 h-px bg-editor-border" />

            <EditorHeading line={4 + idx} level={3}>{project.title}</EditorHeading>
            <EditorParagraph line={5 + idx} className="mt-3 text-sm text-editor-muted">{project.category} • {project.status} • {project.year}</EditorParagraph>

            <EditorParagraph line={6 + idx} className="mt-10"><strong className="text-editor-muted">Role</strong></EditorParagraph>
            <EditorParagraph line={7 + idx}>{project.role}</EditorParagraph>

            <EditorParagraph line={8 + idx} className="mt-10"><strong className="text-editor-muted">Why</strong></EditorParagraph>
            <EditorParagraph line={9 + idx}>{project.why}</EditorParagraph>

            <EditorParagraph line={10 + idx} className="mt-10"><strong className="text-editor-muted">Overview</strong></EditorParagraph>
            <EditorParagraph line={11 + idx}>{project.overview}</EditorParagraph>

            <EditorParagraph line={12 + idx} className="mt-10"><strong className="text-editor-muted">Stack</strong></EditorParagraph>
            <EditorParagraph line={13 + idx} className="mt-3 font-mono text-sm text-editor-text">
              {project.tech.map((tech) => tech.toLowerCase().replace(/ /g, "-")).join(" • ")}
            </EditorParagraph>

            <EditorParagraph line={14 + idx} className="mt-10"><strong className="text-editor-muted">Impact</strong></EditorParagraph>
            <div className="mt-4">
              {project.impact.map((item, i) => (
                <EditorParagraph key={i} line={14 + idx + i} className="text-editor-muted"><span className="text-editor-muted">&gt;</span> {item}</EditorParagraph>
              ))}
            </div>

            <EditorParagraph line={20 + idx} className="mt-10"><strong className="text-editor-muted">Repository</strong></EditorParagraph>
            <EditorParagraph line={21 + idx}><a href={project.github} target="_blank" rel="noopener noreferrer" className="text-editor-link hover:text-editor-text">{project.github}</a></EditorParagraph>

            {project.demo && (
              <EditorParagraph line={22 + idx} className="mt-8"><strong className="text-editor-muted">Live Demo</strong></EditorParagraph>
            )}
          </section>
        ))}
      </div>
    </EditorDocument>
  );
}