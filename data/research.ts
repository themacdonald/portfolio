export interface ResearchItem {
  title: string;
  status: "Active" | "Exploring" | "Completed";
  summary: string;
}

export const research: ResearchItem[] = [
  {
    title: "Knowledge Graphs for Agricultural Intelligence",
    status: "Active",
    summary:
      "Exploring graph-based data models to connect agricultural datasets and improve explainability for AI-driven decision support.",
  },
  {
    title: "LLM Evaluation Frameworks",
    status: "Active",
    summary:
      "Studying scalable evaluation methods, human feedback workflows, and quality metrics for large language models.",
  },
  {
    title: "Applied AI Quality Engineering",
    status: "Active",
    summary:
      "Researching practical approaches for benchmarking, annotation quality, prompt evaluation, and production AI systems.",
  },
];