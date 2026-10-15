/**
 * Identity and positioning configuration.
 *
 * This is the first file a buyer edits. Everything here is language-neutral:
 * localized prose lives under data/localization/<lang>.json, and the pipeline
 * validates that every locale carries a value for each id declared here.
 */

export interface ContactConfig {
  id: string;
  /** Literal value, shown as-is. Never localized. */
  value: string;
  url?: string;
  /** Rendered as the primary call to action. */
  primary?: boolean;
  /** Prompt a save dialog and use this filename. */
  download?: string;
}

export interface IdentityConfig {
  /** Full name, matching the GitHub display name convention. */
  name: string;
  /** Short handle used in the header and metadata. */
  handle: string;
  /** Primary machine-readable job title for metadata and JSON-LD. */
  jobTitle: string;
  /** Secondary title, shown under the headline. */
  secondaryTitle: string;
  location: string;
  /** Human-readable timezone string. */
  timezone: string;
  /** Availability statement id; the copy comes from the locale nodes. */
  availabilityId: "open-to-roles" | "open-to-contract" | "not-available";
  github: string;
  /** Canonical production URL, used for SEO metadata and JSON-LD. */
  siteUrl: string;
  ogImage: string;
  contacts: ContactConfig[];
}

export const identity: IdentityConfig = {
  name: "MacDonald Uwachukwunenye",
  handle: "themacdonald",
  jobTitle: "Data Analyst and AI Data Quality Specialist",
  secondaryTitle: "LLM Evaluation Engineer",
  location: "Abuja, Nigeria",
  timezone: "WAT (UTC+1)",
  availabilityId: "open-to-roles",
  github: "https://github.com/themacdonald",
  siteUrl: "https://portfolio.themacdonald.dev",
  ogImage: "/og-image.png",
  contacts: [
    {
      id: "email",
      value: "uwadonald15@gmail.com",
      url: "mailto:uwadonald15@gmail.com",
      primary: true,
    },
    {
      id: "github",
      value: "github.com/themacdonald",
      url: "https://github.com/themacdonald",
    },
    {
      id: "linkedin",
      value: "linkedin.com/in/the-macdonald",
      url: "https://linkedin.com/in/the-macdonald",
    },
    {
      id: "resume",
      // Ship your own CV at public/resume.pdf, or point this at any URL.
      // The editable source lives at docs/cv/.
      value: "CV.pdf",
      url: "/resume.pdf",
      download: "MacDonald_Uwachukwunenye_CV.pdf",
    },
  ],
};

/** Section ids in render order. Each id needs copy in every locale node. */
export const SECTION_ORDER = [
  "profile",
  "dashboard",
  "tracks",
  "methodology",
  "growth",
  "architecture",
  "notebook",
  "contact",
] as const;

export type SectionId = (typeof SECTION_ORDER)[number];
