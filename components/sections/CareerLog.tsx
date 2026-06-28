import EditorDocument from "@/components/ui/editor/EditorDocument";
import EditorHeading from "@/components/ui/editor/EditorHeading";
import EditorParagraph from "@/components/ui/editor/EditorParagraph";

export default function CareerLog() {
  return (
    <EditorDocument id="career-log">
      <EditorParagraph line={1} className="mb-2 text-sm uppercase tracking-[0.25em] text-editor-muted">CAREER_LOG.md</EditorParagraph>

      <EditorHeading line={2} level={2}>git log --author="MacDonald Uwachukwunenye"</EditorHeading>

      <EditorParagraph line={3} className="font-mono text-sm text-editor-muted">
        {"commit a93f72d (HEAD -> ai-quality-engineering)"}
      </EditorParagraph>
      <EditorParagraph line={4} className="font-mono text-sm text-editor-muted">Author: MacDonald Uwachukwunenye</EditorParagraph>
      <EditorParagraph line={5} className="font-mono text-sm text-editor-muted">Date: Jan 2026</EditorParagraph>
      <EditorParagraph line={6} className="font-mono text-sm text-editor-text whitespace-pre-line">
        {"AI Data Quality Analyst / LLM Evaluation Specialist\n\nEvaluated AI-generated responses for reasoning quality.\n\nDesigned evaluation workflows.\n\nImproved model reliability."}
      </EditorParagraph>
      <EditorParagraph line={7} className="font-mono text-sm text-editor-text">Stack</EditorParagraph>
      <EditorParagraph line={8} className="font-mono text-sm text-editor-text">python • sql • llm-evaluation • prompt-engineering</EditorParagraph>

      <div className="my-8 h-px bg-editor-border" />

      <EditorParagraph line={9} className="font-mono text-sm text-editor-muted">commit f81bc0a</EditorParagraph>
      <EditorParagraph line={10} className="font-mono text-sm text-editor-muted">Author: MacDonald Uwachukwunenye</EditorParagraph>
      <EditorParagraph line={11} className="font-mono text-sm text-editor-muted">Date: Nov 2025</EditorParagraph>
      <EditorParagraph line={12} className="font-mono text-sm text-editor-text whitespace-pre-line">
        {"Senior Data Analyst / AI QA Analyst\n\nStandardized KPIs used across operational teams.\n\nBuilt Power BI dashboards for executive reporting.\n\nApplied SQL and Python to improve reporting accuracy."}
      </EditorParagraph>
      <EditorParagraph line={13} className="font-mono text-sm text-editor-text">Stack</EditorParagraph>
      <EditorParagraph line={14} className="font-mono text-sm text-editor-text">power-bi • sql • python • analytics • business-intelligence</EditorParagraph>

      <div className="my-8 h-px bg-editor-border" />

      <EditorParagraph line={15} className="font-mono text-sm text-editor-muted">commit 92ea1cd</EditorParagraph>
      <EditorParagraph line={16} className="font-mono text-sm text-editor-muted">Author: MacDonald Uwachukwunenye</EditorParagraph>
      <EditorParagraph line={17} className="font-mono text-sm text-editor-muted">Date: Jun 2023</EditorParagraph>
      <EditorParagraph line={18} className="font-mono text-sm text-editor-text whitespace-pre-line">
        {"Analytics Consultant\n\nReduced operational costs by approximately 20%.\n\nIntroduced reporting standards.\n\nBuilt KPI dashboards."}
      </EditorParagraph>
      <EditorParagraph line={19} className="font-mono text-sm text-editor-text">Stack</EditorParagraph>
      <EditorParagraph line={20} className="font-mono text-sm text-editor-text">power-bi • excel • sql</EditorParagraph>

      <div className="my-8 h-px bg-editor-border" />

      <EditorParagraph line={21} className="font-mono text-sm text-editor-muted">commit d41a8e1</EditorParagraph>
      <EditorParagraph line={22} className="font-mono text-sm text-editor-muted">Author: MacDonald Uwachukwunenye</EditorParagraph>
      <EditorParagraph line={23} className="font-mono text-sm text-editor-muted">Date: Feb 2022</EditorParagraph>
      <EditorParagraph line={24} className="font-mono text-sm text-editor-text whitespace-pre-line">
        {"Early analytics work through Mshel Homes, ALX Africa, Fred Brandon FLAMES Foundation, and Edwin Kiagbodo Clark Foundation.\n\nDeveloped research methods, exploratory analysis, dashboard design, and stakeholder reporting."}
      </EditorParagraph>
      <EditorParagraph line={25} className="font-mono text-sm text-editor-text">Stack</EditorParagraph>
      <EditorParagraph line={26} className="font-mono text-sm text-editor-text">research • statistics • python • sql • power-bi • excel</EditorParagraph>

      <div className="my-12 h-px bg-editor-border" />

      <EditorParagraph line={27} className="font-mono text-sm text-editor-muted">git status</EditorParagraph>
      <EditorParagraph line={28} className="font-mono text-sm text-editor-text whitespace-pre-line">
        {"On branch ai-quality-engineering\n\nChanges not staged for commit:\n\n    Building explainable AI systems\n    Researching knowledge graphs\n    Shipping open-source software\n    Learning Kubernetes\n\nnothing to commit, working tree clean for now"}
      </EditorParagraph>
    </EditorDocument>
  );
}
