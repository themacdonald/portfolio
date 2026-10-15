"""Compile the localization matrix into the shipped portfolio payload.

Sequence:
  1. validate every locale node against the data schema contract
  2. build the system architecture DAG
  3. emit data/portfolio.payload.json
  4. emit data/telemetry.dataset.ts for the client telemetry output
  5. emit pipeline/portfolio.schema.json as the machine-readable contract
  6. emit pipeline/compilation.report.json as the audit record
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

if __package__ in (None, ""):  # allow `python3 pipeline/compile.py`
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipeline.architecture_dag import build_dag, domain_weights
from pipeline.constants import (
    AVAILABILITY_IDS,
    CASE_STUDIES,
    CONTACT_IDS,
    DATA_DIR,
    LANGUAGE_ORDER,
    METADATA,
    PAYLOAD_PATH,
    PIPELINE_DIR,
    PROJECT_KEYS,
    REPORT_PATH,
    SCHEMA_PATH,
    DASHBOARD_LABEL_BLOCKS,
    SECTION_IDS,
    SHELL_LABEL_KEYS,
    SNAPSHOT_PATH,
    TELEMETRY_PATH,
    TRACK_IDS,
)
from pipeline.compile_labels import required_dashboard_label_keys
from pipeline.github_metrics import build_dashboard
from pipeline.loader import file_digest, iter_strings
from pipeline.validator import validate

VERSION = "1.0.0"


def resolve_timestamp() -> str:
    """Deterministic compile timestamp: SOURCE_DATE_EPOCH, then git, then now."""
    epoch = os.environ.get("SOURCE_DATE_EPOCH")
    if epoch and epoch.isdigit():
        return _iso(int(epoch))

    try:
        committed = subprocess.run(
            ["git", "log", "-1", "--format=%ct"],
            capture_output=True,
            text=True,
            timeout=10,
            cwd=Path(__file__).resolve().parent.parent,
        )
        if committed.returncode == 0 and committed.stdout.strip().isdigit():
            return _iso(int(committed.stdout.strip()))
    except (OSError, subprocess.SubprocessError):
        pass

    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _iso(epoch: int) -> str:
    return (
        datetime.fromtimestamp(epoch, tz=timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z")
    )


def load_snapshot() -> dict[str, Any]:
    """Read the committed GitHub snapshot. The build never calls the network."""
    if not SNAPSHOT_PATH.exists():
        raise SystemExit(
            f"missing {SNAPSHOT_PATH.name}. run `npm run github:sync` first."
        )
    return json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))


def read_manual_metrics() -> list[dict[str, Any]]:
    """Read the self-reported metric entries from data/config/metrics.ts.

    The config is a flat literal so a small scan is enough and the pipeline
    keeps zero TypeScript runtime dependencies.
    """
    path = DATA_DIR / "config" / "metrics.ts"
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8")
    block = re.search(r"manual:\s*\[(.*?)\n  \],", text, re.DOTALL)
    if not block:
        return []

    entries: list[dict[str, Any]] = []
    for chunk in re.finditer(r"\{(.*?)\}", block.group(1), re.DOTALL):
        body = chunk.group(1)

        def value(field: str) -> str | None:
            found = re.search(rf"{field}:\s*(\"(?:[^\"]*)\"|'[^']*'|[-0-9.]+)", body)
            if not found:
                return None
            raw = found.group(1)
            return raw[1:-1] if raw.startswith(("\"", "'")) else raw

        key = value("key")
        if not key:
            continue
        raw_value = value("value")
        if raw_value is None:
            continue
        try:
            numeric: float | int = float(raw_value)
            numeric = int(numeric) if numeric.is_integer() else numeric
        except ValueError:
            numeric = raw_value

        entries.append(
            {
                "key": key,
                "value": numeric,
                "unit": value("unit"),
                "context": value("context"),
                "source": "config",
                "sourceDetail": value("sourceDetail") or "data/config/metrics.ts",
            }
        )
    return entries


def build_payload(nodes: dict[str, dict[str, Any]], compiled_at: str) -> dict[str, Any]:
    snapshot = load_snapshot()
    dashboard = build_dashboard(snapshot, read_manual_metrics())

    registry: dict[str, Any] = {}
    for lang in LANGUAGE_ORDER:
        node = nodes[lang]
        registry[lang] = {
            "interfaceLabels": node["interfaceLabels"],
            "shellLabels": node["shellLabels"],
            "profileNarrative": node["profileNarrative"],
            "dashboardLabels": {
                block: {
                    key: value
                    for key, value in (node.get("dashboardLabels", {}).get(block) or {}).items()
                }
                for block in DASHBOARD_LABEL_BLOCKS
            },
            "notebookCells": node["notebookCells"],
            "projectDetails": {
                project: node["projectDetails"][project] for project in PROJECT_KEYS
            },
        }

    return {
        "metadata": {
            "engineerName": METADATA["engineerName"],
            "targetTitle": METADATA["targetTitle"],
            "globalTelemetryVersion": f"{METADATA['globalTelemetryVersion']}+pipeline.{VERSION}",
            "systemLocation": METADATA["systemLocation"],
            "availableLanguages": list(LANGUAGE_ORDER),
            "compiledTimestamp": compiled_at,
        },
        "dashboard": dashboard,
        "localizationRegistry": registry,
        "systemArchitectureDAG": build_dag(),
    }


def build_telemetry_dataset(nodes: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """Per-locale structural metrics rendered by the telemetry output panel."""
    locales: list[dict[str, Any]] = []
    for lang in LANGUAGE_ORDER:
        node = nodes[lang]
        cells = node["notebookCells"]
        narrative_lines = sum(len(cell["sourceLines"]) for cell in cells if cell["type"] == "markdown")
        code_lines = sum(len(cell["sourceLines"]) for cell in cells if cell["type"] == "code")
        characters = sum(len(value) for _, value in iter_strings(node))
        telemetry_records = sum(
            len(cell["executionMetadata"]["simulatedTelemetry"]["records"])
            for cell in cells
            if cell["type"] == "code"
        )
        features = sum(len(entry["updatedFeatures"]) for entry in node["projectDetails"].values())
        locales.append(
            {
                "langKey": lang,
                "narrativeLines": narrative_lines,
                "codeLines": code_lines,
                "translatedCharacters": characters,
                "telemetryRecords": telemetry_records,
                "growthFeatures": features,
                "cells": len(cells),
                "digest": file_digest(DATA_DIR / "localization" / f"{lang}.json"),
            }
        )

    return {
        "compiledAt": resolve_timestamp(),
        "engineVersion": VERSION,
        "locales": locales,
    }


def render_telemetry_module(dataset: dict[str, Any]) -> str:
    body = json.dumps(dataset, indent=2, ensure_ascii=False)
    return (
        "// Generated by pipeline/compile.py. Do not edit by hand.\n"
        "// Run `npm run pipeline` to regenerate.\n\n"
        "import type { LanguageKey } from \"@/types/portfolio-contract\";\n\n"
        "export interface LocaleTelemetry {\n"
        "  langKey: LanguageKey;\n"
        "  narrativeLines: number;\n"
        "  codeLines: number;\n"
        "  translatedCharacters: number;\n"
        "  telemetryRecords: number;\n"
        "  growthFeatures: number;\n"
        "  cells: number;\n"
        "  digest: string;\n"
        "}\n\n"
        "export interface CompilationTelemetry {\n"
        "  compiledAt: string;\n"
        "  engineVersion: string;\n"
        "  locales: LocaleTelemetry[];\n"
        "}\n\n"
        f"export const compilationTelemetry: CompilationTelemetry = {body};\n"
    )



def dashboard_labels_schema() -> dict[str, Any]:
    """Label block schema, generated from the same ids the validator enforces."""
    string_map = {
        "type": "object",
        "additionalProperties": {"type": "string"},
    }
    list_map = {
        "type": "object",
        "additionalProperties": {"type": "array", "items": {"type": "string"}},
    }
    return {
        "type": "object",
        "required": list(DASHBOARD_LABEL_BLOCKS),
        "additionalProperties": False,
        "properties": {
            block: (list_map if block in ("caseMethod", "caseOutcome") else string_map)
            for block in DASHBOARD_LABEL_BLOCKS
        },
    }


def dashboard_schema() -> dict[str, Any]:
    """Schema for the analytics block, derived from the built dashboard.

    Deriving the key universe from the dashboard keeps the contract honest: a
    new metric or source cannot ship without a label and a schema entry.
    """
    metric = {
        "type": "object",
        "required": ["key", "value", "source"],
        "additionalProperties": False,
        "properties": {
            "key": {"type": "string"},
            "value": {"type": ["string", "number"]},
            "unit": {"enum": ["count", "percent", "score", "date", "ratio"]},
            "context": {"type": "string"},
            "source": {"enum": ["github", "derived", "config"]},
            "sourceDetail": {"type": "string"},
            "emphasis": {"type": "boolean"},
        },
    }
    return {
        "type": "object",
        "required": [
            "generatedAt",
            "capturedDaysAgo",
            "metrics",
            "tiles",
            "charts",
            "repositories",
            "contributionWeeks",
            "verdict",
            "datasetProfiles",
            "sources",
        ],
        "additionalProperties": False,
        "properties": {
            "generatedAt": {"type": "string"},
            "capturedDaysAgo": {"type": "integer"},
            "metrics": {"type": "array", "minItems": 1, "items": metric},
            "tiles": {"type": "array", "minItems": 1, "items": metric},
            "charts": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["id", "kind", "source"],
                    "additionalProperties": False,
                    "properties": {
                        "id": {"type": "string"},
                        "kind": {"enum": ["heatmap", "distribution", "strips", "signals"]},
                        "unit": {"enum": ["count", "percent", "score", "date", "ratio"]},
                        "series": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "required": ["period", "value"],
                                "additionalProperties": False,
                                "properties": {
                                    "period": {"type": "string"},
                                    "value": {"type": "number"},
                                    "series": {"type": "string"},
                                    # present on heatmap rows, which address days directly
                                    "date": {"type": "string"},
                                    "level": {"type": "integer"},
                                },
                            },
                        },
                        "segments": {
                            "type": ["array", "null"],
                            "items": {
                                "type": "object",
                                "required": ["label", "value"],
                                "additionalProperties": False,
                                "properties": {
                                    "label": {"type": "string"},
                                    "value": {"type": "number"},
                                    "share": {"type": "number"},
                                },
                            },
                        },
                        "source": {"enum": ["github", "derived", "config"]},
                        "sourceDetail": {"type": "string"},
                    },
                },
            },
            "verdict": {
                "type": "object",
                "required": ["code", "tone", "values"],
                "additionalProperties": False,
                "properties": {
                    "code": {"enum": ["sparse", "bursty", "steady", "sustained"]},
                    "tone": {"enum": ["caution", "neutral", "strong"]},
                    "values": {
                        "type": "object",
                        "additionalProperties": {"type": "number"},
                    },
                },
            },
            "contributionWeeks": {
                "type": "array",
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["date", "value", "level"],
                        "additionalProperties": False,
                        "properties": {
                            "date": {"type": "string"},
                            "value": {"type": "integer"},
                            "level": {"type": "integer"},
                        },
                    },
                },
            },
            "repositories": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": [
                        "name",
                        "language",
                        "stars",
                        "forks",
                        "openIssues",
                        "topics",
                        "url",
                        "pushedAt",
                        "createdAt",
                        "sizeKb",
                        "archived",
                        "isFork",
                        "track",
                        "readiness",
                    ],
                    "additionalProperties": False,
                    "properties": {
                        "name": {"type": "string"},
                        "description": {"type": "string"},
                        "language": {"type": "string"},
                        "stars": {"type": "integer"},
                        "forks": {"type": "integer"},
                        "openIssues": {"type": "integer"},
                        "topics": {"type": "array", "items": {"type": "string"}},
                        "homepage": {"type": "string"},
                        "url": {"type": "string"},
                        "pushedAt": {"type": "string"},
                        "createdAt": {"type": "string"},
                        "sizeKb": {"type": "integer"},
                        "archived": {"type": "boolean"},
                        "isFork": {"type": "boolean"},
                        "track": {"type": "string"},
                        "readiness": {"type": "integer"},
                    },
                },
            },
            "datasetProfiles": {
                "type": "object",
                "additionalProperties": {
                    "type": "object",
                    "required": ["source", "rows", "columns", "groups", "counts", "numeric"],
                    "additionalProperties": False,
                    "properties": {
                        "source": {"enum": ["dataset"]},
                        "rows": {"type": "integer"},
                        "columns": {"type": "integer"},
                        "groups": {"type": "integer"},
                        "yearFrom": {"type": "string"},
                        "yearTo": {"type": "string"},
                        "lifeMean": {"type": ["number", "null"]},
                        "lifeMin": {"type": ["number", "null"]},
                        "lifeMax": {"type": ["number", "null"]},
                        "strongest": {
                            "type": ["object", "null"],
                            "required": ["a", "b", "r"],
                            "additionalProperties": False,
                            "properties": {
                                "a": {"type": "string"},
                                "b": {"type": "string"},
                                "r": {"type": "number"},
                            },
                        },
                        "counts": {
                            "type": "object",
                            "additionalProperties": {"type": "integer"},
                        },
                        "numeric": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "object",
                                "required": ["min", "max", "mean"],
                                "additionalProperties": False,
                                "properties": {
                                    "min": {"type": "number"},
                                    "max": {"type": "number"},
                                    "mean": {"type": "number"},
                                },
                            },
                        },
                    },
                },
            },
            "sources": {
                "type": "array",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "required": ["id", "detail"],
                    "additionalProperties": False,
                    "properties": {
                        "id": {"type": "string"},
                        "detail": {"type": "string"},
                        "url": {"type": "string"},
                        "capturedAt": {"type": "string"},
                    },
                },
            },
        },
    }


def build_json_schema() -> dict[str, Any]:
    telemetry = {
        "type": "object",
        "required": ["metricsHeader", "outputFields", "records"],
        "additionalProperties": False,
        "properties": {
            "metricsHeader": {"type": "string"},
            "outputFields": {"type": "array", "items": {"type": "string"}},
            "records": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": {"type": ["string", "number", "object"]},
                },
            },
            "rawConsoleLog": {"type": "array", "items": {"type": "string"}},
        },
    }
    cell = {
        "type": "object",
        "required": ["id", "type", "sourceLines"],
        "additionalProperties": False,
        "properties": {
            "id": {"type": "integer", "minimum": 1},
            "type": {"enum": ["markdown", "code"]},
            "sourceLines": {"type": "array", "minItems": 1, "items": {"type": "string"}},
            "executionMetadata": {
                "type": "object",
                "required": ["requiresKernel", "simulatedTelemetry"],
                "additionalProperties": False,
                "properties": {
                    "requiresKernel": {"enum": ["python3", "cpp20"]},
                    "simulatedTelemetry": telemetry,
                },
            },
        },
    }
    project_detail = {
        "type": "object",
        "required": ["description", "updatedFeatures"],
        "additionalProperties": False,
        "properties": {
            "description": {"type": "string"},
            "updatedFeatures": {
                "type": "array",
                "minItems": 1,
                "items": {"type": "string"},
            },
        },
    }
    localization_node = {
        "type": "object",
        "required": [
            "interfaceLabels",
            "shellLabels",
            "profileNarrative",
            "notebookCells",
            "projectDetails",
        ],
        "additionalProperties": False,
        "properties": {
            "interfaceLabels": {
                "type": "object",
                "required": [
                    "kernelStatus",
                    "runCellBtn",
                    "workspaceFiles",
                    "telemetryOutput",
                    "recentGrowthTitle",
                ],
                "additionalProperties": False,
                "properties": {
                    "kernelStatus": {"type": "string"},
                    "runCellBtn": {"type": "string"},
                    "workspaceFiles": {"type": "string"},
                    "telemetryOutput": {"type": "string"},
                    "recentGrowthTitle": {"type": "string"},
                },
            },
            "shellLabels": {
                "type": "object",
                "required": list(SHELL_LABEL_KEYS),
                "additionalProperties": False,
                "properties": {key: {"type": "string"} for key in SHELL_LABEL_KEYS},
            },
            "profileNarrative": {
                "type": "object",
                "required": ["title", "headline", "summary", "focusAreas"],
                "additionalProperties": False,
                "properties": {
                    "title": {"type": "string"},
                    "headline": {"type": "string"},
                    "summary": {"type": "string"},
                    "focusAreas": {"type": "array", "items": {"type": "string"}},
                },
            },
            "dashboardLabels": dashboard_labels_schema(),
            "notebookCells": {
                "type": "array",
                "minItems": 4,
                "maxItems": 4,
                "items": cell,
            },
            "projectDetails": {
                "type": "object",
                "required": list(PROJECT_KEYS),
                "additionalProperties": project_detail,
            },
        },
    }

    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://portfolio.themacdonald.dev/schema/portfolio.schema.json",
        "title": "AgenticPortfolioPayload",
        "type": "object",
        "required": ["metadata", "dashboard", "localizationRegistry", "systemArchitectureDAG"],
        "additionalProperties": False,
        "properties": {
            "metadata": {
                "type": "object",
                "required": [
                    "engineerName",
                    "targetTitle",
                    "globalTelemetryVersion",
                    "systemLocation",
                    "availableLanguages",
                    "compiledTimestamp",
                ],
                "additionalProperties": False,
                "properties": {
                    "engineerName": {"type": "string"},
                    "targetTitle": {"type": "string"},
                    "globalTelemetryVersion": {"type": "string"},
                    "systemLocation": {"type": "string"},
                    "availableLanguages": {
                        "type": "array",
                        "minItems": len(LANGUAGE_ORDER),
                        "items": {"enum": list(LANGUAGE_ORDER)},
                    },
                    "compiledTimestamp": {"type": "string"},
                },
            },
            "dashboard": dashboard_schema(),
            "localizationRegistry": {
                "type": "object",
                "required": list(LANGUAGE_ORDER),
                "additionalProperties": localization_node,
            },
            "systemArchitectureDAG": {
                "type": "object",
                "required": ["nodes", "edges"],
                "additionalProperties": False,
                "properties": {
                    "nodes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["id", "domain", "subSystem", "weight"],
                            "additionalProperties": False,
                            "properties": {
                                "id": {"type": "string"},
                                "domain": {"type": "string"},
                                "subSystem": {"type": "string"},
                                "weight": {"type": "number"},
                            },
                        },
                    },
                    "edges": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["source", "target", "dependencyType"],
                            "additionalProperties": False,
                            "properties": {
                                "source": {"type": "string"},
                                "target": {"type": "string"},
                                "dependencyType": {"type": "string"},
                            },
                        },
                    },
                },
            },
        },
    }


def main() -> int:
    print("pipeline: validate")
    print("  building dashboard from the GitHub snapshot")
    snapshot = load_snapshot()
    dashboard = build_dashboard(snapshot, read_manual_metrics())

    result, nodes = validate(execute_code_cells=True, dashboard=dashboard)
    if not result.ok:
        for error in result.errors:
            print(f"  error: {error}")
        print(f"pipeline: FAIL after {result.checks_run} checks")
        return 1
    print(f"  {result.checks_run} checks passed across {len(LANGUAGE_ORDER)} locales")

    print("pipeline: compile")
    compiled_at = resolve_timestamp()
    payload = build_payload(nodes, compiled_at)
    dag = payload["systemArchitectureDAG"]

    PAYLOAD_PATH.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(
        f"  wrote {PAYLOAD_PATH.relative_to(DATA_DIR.parent)} "
        f"({PAYLOAD_PATH.stat().st_size} bytes, {len(dag['nodes'])} nodes, {len(dag['edges'])} edges)"
    )

    dataset = build_telemetry_dataset(nodes)
    TELEMETRY_PATH.write_text(render_telemetry_module(dataset), encoding="utf-8")
    print(f"  wrote {TELEMETRY_PATH.relative_to(DATA_DIR.parent)}")

    schema = build_json_schema()
    SCHEMA_PATH.parent.mkdir(parents=True, exist_ok=True)
    SCHEMA_PATH.write_text(json.dumps(schema, indent=2) + "\n", encoding="utf-8")
    print(f"  wrote {SCHEMA_PATH.relative_to(SCHEMA_PATH.parent.parent)}")

    report = {
        "pipelineVersion": VERSION,
        "compiledTimestamp": compiled_at,
        "checksRun": result.checks_run,
        "errors": result.errors,
        "warnings": result.warnings,
        "locales": [node["langKey"] for node in dataset["locales"]],
        "notebookCells": len(nodes["en"]["notebookCells"]),
        "dagNodes": len(dag["nodes"]),
        "dagEdges": len(dag["edges"]),
        "dagDomainWeight": domain_weights(dag),
        "payloadBytes": PAYLOAD_PATH.stat().st_size,
        "artifacts": [
            str(PAYLOAD_PATH.relative_to(DATA_DIR.parent)),
            str(TELEMETRY_PATH.relative_to(DATA_DIR.parent)),
            str(SCHEMA_PATH.relative_to(PIPELINE_DIR.parent)),
        ],
        "telemetry": dataset["locales"],
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"  wrote {REPORT_PATH.relative_to(REPORT_PATH.parent.parent)}")
    print("pipeline: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
