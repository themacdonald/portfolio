export interface WorkProject {
  slug: string;
  title: string;
  category: string;
  status: "Completed" | "In Development" | "Research" | "In Progress";
  year: string;
  role: string;
  why: string;
  overview: string;
  impact: string[];
  tech: string[];
  github: string;
  demo?: string;
}

export const work: WorkProject[] = [
  {
    slug: "agrigraph-ai",
    title: "AgriGraph AI",
    category: "Artificial Intelligence",
    status: "In Development",
    year: "2026",
    role: "Founder • AI Engineer",

    why:
      "Built to explore how knowledge graphs can unify fragmented agricultural datasets into an explainable intelligence layer for farmers, researchers, and policymakers.",

    overview:
      "AgriGraph AI transforms disconnected agricultural datasets into a knowledge graph that captures relationships between crops, weather, soil, diseases, markets, and farming activities. The goal is to enable explainable AI systems that can reason over agricultural information instead of relying solely on isolated datasets.",

    impact: [
      "Designed a scalable agricultural knowledge graph architecture.",
      "Established a reusable ontology for agricultural entities.",
      "Explored explainable AI through graph reasoning.",
      "Created a foundation for future decision-support systems.",
    ],

    tech: [
      "Python",
      "NetworkX",
      "Pandas",
      "FastAPI",
      "Knowledge Graphs",
      "Neo4j",
    ],

    github: "https://github.com/themacdonald/AgriGraph-AI",
  },

  {
    slug: "agrimanet-scheduler",
    title: "AgriMANET Scheduler",
    category: "Research",
    status: "Research",
    year: "2026",
    role: "Research Engineer",

    why:
      "Built to investigate adaptive scheduling algorithms for heterogeneous agricultural telemetry operating over dynamic MANET environments.",

    overview:
      "A research implementation of an Adaptive Weighted Round Robin scheduler designed to improve packet delivery, fairness, and network utilization in agricultural Mobile Ad Hoc Networks.",

    impact: [
      "Simulated dynamic agricultural communication networks.",
      "Compared adaptive scheduling strategies.",
      "Documented networking performance metrics.",
      "Produced reproducible research experiments.",
    ],

    tech: [
      "Python",
      "Simulation",
      "Networking",
      "MANET",
      "Algorithms",
    ],

    github:
      "https://github.com/themacdonald/AgriMANET-Scheduler",
  },

  {
    slug: "feedbackloop",
    title: "FeedbackLoop",
    category: "AI Quality",
    status: "Completed",
    year: "2026",
    role: "AI Quality Engineer",

    why:
      "Built to demonstrate how structured human feedback improves AI recruiting assistants through evaluation pipelines inspired by RLHF workflows.",

    overview:
      "FeedbackLoop models an AI evaluation workflow where prompts, responses, annotations, reviewer agreement, and quality metrics are combined into a repeatable assessment pipeline.",

    impact: [
      "Created reproducible evaluation workflows.",
      "Improved annotation consistency.",
      "Demonstrated AI quality engineering practices.",
      "Documented scalable review pipelines.",
    ],

    tech: [
      "Python",
      "Prompt Engineering",
      "RLHF",
      "Evaluation",
      "LLMs",
    ],

    github:
      "https://github.com/themacdonald/FeedbackLoop",
  },  {
    slug: "biasguard",
    title: "BiasGuard",
    category: "AI Quality",
    status: "Completed",
    year: "2026",
    role: "AI Quality Engineer",

    why:
      "Built to investigate practical techniques for identifying, measuring, and mitigating bias in machine learning systems before deployment.",

    overview:
      "BiasGuard provides a structured workflow for analysing model outputs across protected attributes, identifying fairness issues, and documenting mitigation strategies as part of an AI quality assurance process.",

    impact: [
      "Implemented fairness evaluation workflows.",
      "Documented reproducible bias testing.",
      "Promoted responsible AI engineering practices.",
      "Produced reusable quality assurance guidelines.",
    ],

    tech: [
      "Python",
      "Pandas",
      "Machine Learning",
      "Fairness",
      "AI Evaluation",
    ],

    github:
      "https://github.com/themacdonald/BiasGuard",
  },

  {
    slug: "healthcare-dashboard",
    title: "Healthcare Insights Dashboard",
    category: "Data Analytics",
    status: "Completed",
    year: "2025",
    role: "Data Analyst",

    why:
      "Built to demonstrate how healthcare data can be transformed into meaningful operational insights through interactive analytics.",

    overview:
      "An interactive Tableau dashboard exploring patient demographics, treatment outcomes, operational performance, and healthcare trends for executive decision-making.",

    impact: [
      "Designed executive dashboards.",
      "Improved KPI visibility.",
      "Simplified healthcare reporting.",
      "Presented complex datasets visually.",
    ],

    tech: [
      "Tableau",
      "SQL",
      "Excel",
      "Data Visualization",
    ],

    github:
      "https://github.com/themacdonald/Healthcare-Insights-Dashboard-Tableau-Project",
  },

  {
    slug: "football-dashboard",
    title: "Football Dashboard",
    category: "Data Analytics",
    status: "In Progress",
    year: "2026",
    role: "Data Analyst",

    why:
      "Built to explore football analytics through interactive dashboards that support player evaluation, tactical analysis, and performance tracking.",

    overview:
      "A football analytics platform combining player statistics, team performance metrics, and visual storytelling into an interactive dashboard.",

    impact: [
      "Developed reusable sports analytics workflows.",
      "Applied interactive dashboard design principles.",
      "Explored performance metric visualisation.",
    ],

    tech: [
      "Python",
      "Power BI",
      "SQL",
      "Football Analytics",
    ],

    github:
      "https://github.com/themacdonald/football-dashboard",
  },
];