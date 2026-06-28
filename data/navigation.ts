export type ExplorerItem =
  | ExplorerFolder
  | ExplorerFile;

export interface ExplorerFolder {
  type: "folder";
  name: string;
  defaultOpen?: boolean;
  children: ExplorerItem[];
}

export interface ExplorerFile {
  type: "file";
  name: string;
  filename: string;
  target: string;
}

export const explorer: ExplorerItem[] = [
  {
    type: "folder",
    name: "notebook",
    defaultOpen: true,

    children: [
      {
        type: "file",
        name: "README.md",
        filename: "README.md",
        target: "introduction",
      },

      {
        type: "file",
        name: "PHILOSOPHY.md",
        filename: "PHILOSOPHY.md",
        target: "philosophy",
      },

      {
        type: "file",
        name: "CURRENT_FOCUS.md",
        filename: "CURRENT_FOCUS.md",
        target: "current-focus",
      },

      {
        type: "folder",
        name: "repositories",
        defaultOpen: true,

        children: [
          {
            type: "file",
            name: "AgriGraph-AI.md",
            filename: "AgriGraph-AI.md",
            target: "agrigraph-ai",
          },

          {
            type: "file",
            name: "AgriMANET-Scheduler.md",
            filename: "AgriMANET-Scheduler.md",
            target: "agrimanet-scheduler",
          },

          {
            type: "file",
            name: "FeedbackLoop.md",
            filename: "FeedbackLoop.md",
            target: "feedbackloop",
          },

          {
            type: "file",
            name: "BiasGuard.md",
            filename: "BiasGuard.md",
            target: "biasguard",
          },

          {
            type: "file",
            name: "Healthcare-Dashboard.md",
            filename: "Healthcare-Dashboard.md",
            target: "healthcare-dashboard",
          },

          {
            type: "file",
            name: "Football-Dashboard.md",
            filename: "Football-Dashboard.md",
            target: "football-dashboard",
          },
        ],
      },

      {
        type: "file",
        name: "CAREER_LOG.md",
        filename: "CAREER_LOG.md",
        target: "career-log",
      },

      {
        type: "file",
        name: "RESEARCH.md",
        filename: "RESEARCH.md",
        target: "research",
      },

      {
        type: "file",
        name: "LAB_NOTES.md",
        filename: "LAB_NOTES.md",
        target: "lab-notes",
      },

      {
        type: "file",
        name: "OPEN_SOURCE.md",
        filename: "OPEN_SOURCE.md",
        target: "open-source",
      },

      {
        type: "file",
        name: "CONTACT.md",
        filename: "CONTACT.md",
        target: "contact",
      },
    ],
  },
];