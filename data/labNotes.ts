export interface LabNote {
  date: string;
  title: string;
  summary: string;
}

export const labNotes: LabNote[] = [
  {
    date: "2026-06-28",
    title: "Building an Engineering Notebook",
    summary:
      "Redesigned my portfolio around an engineering notebook instead of a traditional personal website.",
  },
  {
    date: "2026-06-24",
    title: "AI Evaluation Pipelines",
    summary:
      "Explored practical methods for evaluating LLM responses using structured rubrics and human feedback.",
  },
  {
    date: "2026-06-18",
    title: "Knowledge Graph Research",
    summary:
      "Investigated graph-based data models for agricultural intelligence and explainable AI systems.",
  },
  {
    date: "2026-06-10",
    title: "Power BI Design Patterns",
    summary:
      "Documented reusable dashboard layouts and KPI reporting techniques for executive stakeholders.",
  },
];