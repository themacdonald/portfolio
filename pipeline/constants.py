"""Canonical pipeline paths and control tokens for the portfolio build."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALIZATION_DIR = ROOT / "data" / "localization"
DATA_DIR = ROOT / "data"
PIPELINE_DIR = ROOT / "pipeline"
REPORT_PATH = ROOT / "pipeline" / "compilation.report.json"
SCHEMA_PATH = ROOT / "pipeline" / "portfolio.schema.json"
PAYLOAD_PATH = DATA_DIR / "portfolio.payload.json"
TELEMETRY_PATH = DATA_DIR / "telemetry.dataset.ts"

# Display order of the internationalization matrix. The first entry is the
# baseline reference used for structural parity checks.
LANGUAGE_ORDER = ("en", "fr", "es", "de", "ru", "ja", "zh")

# Repository identifiers covered by localizationRegistry[lang].projectDetails.
PROJECT_KEYS = ("BiasGuard", "FeedbackLoop", "ConfidenceCoach", "AgriMANET-Scheduler")

# Required notebook cell ids and their expected markdown or code archetype.
CELL_SHAPE = {1: "markdown", 2: "code", 3: "code", 4: "markdown"}

# Keys required on every interface label block.
INTERFACE_LABEL_KEYS = (
    "kernelStatus",
    "runCellBtn",
    "workspaceFiles",
    "telemetryOutput",
    "recentGrowthTitle",
)

# Keys required on every shell label block.
SHELL_LABEL_KEYS = (
    "runAllBtn",
    "clearBtn",
    "cellLabel",
    "localeLabel",
    "cellsLabel",
    "narrativeLinesLabel",
    "codeLinesLabel",
    "telemetryRowsLabel",
    "growthItemsLabel",
    "dagPayloadLabel",
    "outputIdle",
    "outputRunning",
    "rawConsoleLabel",
    "repositoryLabel",
    "domainLabel",
    "weightLabel",
    "edgeManifestLabel",
    "highestCriticalityLabel",
    "nodesLabel",
    "edgesLabel",
    "viewModeRecruiter",
    "viewModeTechnical",
    "menuLabel",
    "reduceMotionLabel",
    "viewDashboard",
    "viewWork",
    "verifiedLabel",
    "selfReportedLabel",
    "unmeasuredLabel",
)

SUPPORTED_KERNELS = ("python3", "cpp20")

# Grounding context for the payload metadata block.
METADATA = {
    "engineerName": "MacDonald Uwachukwunenye",
    "targetTitle": "Senior Data Analyst | AI Data Quality and LLM Evaluation Specialist",
    "globalTelemetryVersion": "2.4.0",
    "systemLocation": "Abuja, Nigeria",
}

# Every string in the payload must survive these rejection filters.
REJECT_EMOJI = True
REJECT_HTML = True
REJECT_TABLE_PIPES = True

# Repository -> delivery track. Drives the case study grouping and the
# readiness score's track assignment.
PROJECT_TRACKS = {
    "BiasGuard": "evaluation",
    "FeedbackLoop": "evaluation",
    "ConfidenceCoach": "evaluation",
    "AgriMANET-Scheduler": "platform",
    "Healthcare-Insights-Dashboard-Tableau-Project": "analytics",
    "Oil-Gas-Data-Intelligence-Power-BI-Dashboard": "analytics",
    "Nigeria-Public-Health-Trends-Dashboard": "analytics",
    "Environmental-Cleanup-Dashboard": "analytics",
    "Retail-Sales-Dashboard-Power-BI-Project": "analytics",
    "Social-Media-Analytics": "analytics",
    "investigating-Netflix-Movies-at-the-work-place": "analytics",
    "football-dashboard": "analytics",
    "agrigraph-ai": "platform",
    "raihft": "evaluation",
    "First-Quarterly-Maintenance-Report-": "analytics",
}

# GitHub snapshot produced by `npm run github:sync`.
SNAPSHOT_PATH = DATA_DIR / "github.snapshot.json"

# Localized section ids, in render order. Mirrors SECTION_ORDER in
# data/config/identity.ts. Each id needs a title and caption in every locale.
SECTION_IDS = (
    "profile",
    "dashboard",
    "tracks",
    "methodology",
    "growth",
    "architecture",
    "notebook",
    "contact",
)

# Delivery tracks.
TRACK_IDS = ("analytics", "evaluation", "platform")

# Case study copy ids, mirroring data/config/case-studies.ts.
CASE_STUDIES = (
    {"slug": "healthcare-insights", "copyId": "healthcare_insights"},
    {"slug": "oil-gas-operations", "copyId": "oil_gas_operations"},
    {"slug": "biasguard", "copyId": "biasguard"},
    {"slug": "feedbackloop", "copyId": "feedbackloop"},
    {"slug": "agrimanet-scheduler", "copyId": "agrimanet_scheduler"},
)

AVAILABILITY_IDS = ("open-to-roles", "open-to-contract", "not-available")

CONTACT_IDS = ("email", "github", "linkedin", "resume")

# Blocks inside each locale's dashboardLabels object.
VERDICT_CODES = ("sparse", "bursty", "steady", "sustained")

DASHBOARD_LABEL_BLOCKS = (
    "sectionTitles",
    "sectionCaptions",
    "metricLabels",
    "chartTitles",
    "chartCaptions",
    "sourceLabels",
    "trackLabels",
    "trackBlurbs",
    "caseProblem",
    "caseMethod",
    "caseOutcome",
    "caseRole",
    "caseTimeframe",
    "caseProvenance",
    "availability",
    "contactLabels",
    "verdicts",
)
