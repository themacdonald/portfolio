"""Data schema validation contract for the agentic portfolio pipeline.

Every locale node must satisfy all of the following before the compiler emits a
payload:

  * complete key coverage against the TypeScript contract
  * four notebook cells with the mandated markdown and code archetypes
  * executable Python in every code cell, proven by compiling the source and by
    running it in a subprocess
  * identical numeric leaves across every locale, so translation cannot move a
    metric
  * zero decorative emoji, zero HTML layout elements, zero inline markdown tables
"""

from __future__ import annotations

import ast
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

if __package__ in (None, ""):  # allow `python3 pipeline/validator.py`
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipeline.compile_labels import required_dashboard_label_keys
from pipeline.constants import (
    CELL_SHAPE,
    DASHBOARD_LABEL_BLOCKS,
    INTERFACE_LABEL_KEYS,
    PROJECT_KEYS,
    SHELL_LABEL_KEYS,
    SUPPORTED_KERNELS,
)
from pipeline.loader import collect_numbers, iter_strings, load_all

EMOJI_PATTERN = re.compile(
    "[\U0001f000-\U0001faff\u2600-\u27bf\ufe0f\u2b00-\u2bff\u2190-\u21ff\u2700-\u27bf]"
)
HTML_PATTERN = re.compile(r"</?\s*(?:div|span|table|tbody|thead|tr|td|th|p|br|hr|h[1-6]|ul|ol|li|section|iframe|script|style)\b", re.IGNORECASE)
TABLE_PIPE_PATTERN = re.compile(r"^\s*\|.*\|\s*$")
NUMBER_TOLERANCE = 1e-9

# Shell label placeholders are compared against the English reference block.
_baseline_shell_labels: dict[str, str] = {}


@dataclass
class ValidationResult:
    """Collected findings for one full pipeline validation run."""

    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    checks_run: int = 0

    @property
    def ok(self) -> bool:
        return not self.errors

    def require(self, condition: bool, message: str) -> bool:
        self.checks_run += 1
        if not condition:
            self.errors.append(message)
        return condition

    def warn(self, condition: bool, message: str) -> bool:
        self.checks_run += 1
        if not condition:
            self.warnings.append(message)
        return condition


def validate(
    execute_code_cells: bool = True,
    dashboard: dict[str, Any] | None = None,
) -> tuple[ValidationResult, dict[str, dict[str, Any]]]:
    """Validate the full localization matrix and return the loaded nodes.

    Pass the built dashboard to also enforce dashboard label coverage.
    """
    result = ValidationResult()
    nodes = load_all()
    baseline = nodes["en"]

    _baseline_shell_labels.clear()
    _baseline_shell_labels.update(baseline.get("shellLabels", {}))

    if dashboard is not None:
        _validate_dashboard(result, dashboard, nodes)

    _validate_node_shape(result, baseline, "en")
    _validate_rejection_filters(result, nodes)
    _validate_code_cells(result, baseline, execute_code_cells)

    baseline_numbers = collect_numbers(baseline, [])
    for lang, node in nodes.items():
        if lang == "en":
            continue
        _validate_node_shape(result, node, lang)
        node_numbers = collect_numbers(node, [])
        result.require(
            len(node_numbers) == len(baseline_numbers),
            f"{lang}: numeric leaf count {len(node_numbers)} differs from baseline {len(baseline_numbers)}",
        )
        mismatched = [
            (index, expected, actual)
            for index, (expected, actual) in enumerate(zip(baseline_numbers, node_numbers))
            if abs(expected - actual) > NUMBER_TOLERANCE
        ]
        result.require(
            not mismatched,
            f"{lang}: numeric leaves drifted from baseline at indices {[item[0] for item in mismatched[:5]]}",
        )

    return result, nodes


def _validate_node_shape(result: ValidationResult, node: dict[str, Any], lang: str) -> None:
    result.require(node.get("langKey") == lang, f"{lang}: langKey is {node.get('langKey')!r}")

    labels = node.get("interfaceLabels", {})
    result.require(isinstance(labels, dict), f"{lang}: interfaceLabels is not an object")
    for key in INTERFACE_LABEL_KEYS:
        value = labels.get(key) if isinstance(labels, dict) else None
        result.require(
            isinstance(value, str) and value.strip() != "",
            f"{lang}: interfaceLabels.{key} is missing or empty",
        )

    narrative = node.get("profileNarrative", {})
    for key in ("title", "summary"):
        value = narrative.get(key) if isinstance(narrative, dict) else None
        result.require(
            isinstance(value, str) and value.strip() != "",
            f"{lang}: profileNarrative.{key} is missing or empty",
        )

    shell = node.get("shellLabels", {})
    result.require(isinstance(shell, dict), f"{lang}: shellLabels is not an object")
    for key in SHELL_LABEL_KEYS:
        value = shell.get(key) if isinstance(shell, dict) else None
        result.require(
            isinstance(value, str) and value.strip() != "",
            f"{lang}: shellLabels.{key} is missing or empty",
        )
        if isinstance(value, str):
            expects_placeholder = "{n}" in _baseline_shell_labels[key]
            result.require(
                ("{n}" in value) == expects_placeholder,
                f"{lang}: shellLabels.{key} must {'keep' if expects_placeholder else 'drop'} the {{n}} placeholder",
            )

    cells = node.get("notebookCells", [])
    result.require(isinstance(cells, list), f"{lang}: notebookCells is not an array")
    if not isinstance(cells, list):
        return
    result.require(len(cells) == len(CELL_SHAPE), f"{lang}: expected 4 notebook cells, found {len(cells)}")

    seen_ids: list[int] = []
    for cell in cells:
        cell_id = cell.get("id")
        seen_ids.append(cell_id)
        expected_type = CELL_SHAPE.get(cell_id)
        result.require(expected_type is not None, f"{lang}: unexpected cell id {cell_id!r}")
        result.require(
            expected_type is None or cell.get("type") == expected_type,
            f"{lang}: cell {cell_id} type is {cell.get('type')!r}, expected {expected_type!r}",
        )
        lines = cell.get("sourceLines")
        result.require(
            isinstance(lines, list) and len(lines) > 0 and all(isinstance(line, str) for line in lines),
            f"{lang}: cell {cell_id} sourceLines must be a non-empty array of strings",
        )
        if cell.get("type") == "code":
            _validate_execution_metadata(result, lang, cell)
    result.require(
        sorted(seen_ids) == sorted(CELL_SHAPE),
        f"{lang}: cell ids are {seen_ids}, expected {sorted(CELL_SHAPE)}",
    )

    details = node.get("projectDetails", {})
    result.require(isinstance(details, dict), f"{lang}: projectDetails is not an object")
    if not isinstance(details, dict):
        return
    result.require(
        sorted(details) == sorted(PROJECT_KEYS),
        f"{lang}: projectDetails keys are {sorted(details)}",
    )
    for project in PROJECT_KEYS:
        entry = details.get(project, {})
        description = entry.get("description")
        result.require(
            isinstance(description, str) and description.strip() != "",
            f"{lang}: projectDetails.{project}.description is missing",
        )
        features = entry.get("updatedFeatures")
        result.require(
            isinstance(features, list) and len(features) == 4,
            f"{lang}: projectDetails.{project}.updatedFeatures must hold exactly 4 items",
        )
        if isinstance(features, list):
            result.require(
                all(isinstance(item, str) and item.strip() != "" for item in features),
                f"{lang}: projectDetails.{project}.updatedFeatures contains an empty entry",
            )


def _validate_execution_metadata(result: ValidationResult, lang: str, cell: dict[str, Any]) -> None:
    metadata = cell.get("executionMetadata")
    if not result.require(isinstance(metadata, dict), f"{lang}: cell {cell.get('id')} is missing executionMetadata"):
        return

    kernel = metadata.get("requiresKernel")
    result.require(
        kernel in SUPPORTED_KERNELS,
        f"{lang}: cell {cell.get('id')} requiresKernel {kernel!r} is outside {SUPPORTED_KERNELS}",
    )

    telemetry = metadata.get("simulatedTelemetry")
    if not result.require(
        isinstance(telemetry, dict),
        f"{lang}: cell {cell.get('id')} is missing simulatedTelemetry",
    ):
        return

    header = telemetry.get("metricsHeader")
    result.require(
        isinstance(header, str) and header.strip() != "",
        f"{lang}: cell {cell.get('id')} metricsHeader is empty",
    )

    fields = telemetry.get("outputFields")
    records = telemetry.get("records")
    result.require(
        isinstance(fields, list) and len(fields) > 0,
        f"{lang}: cell {cell.get('id')} outputFields must not be empty",
    )
    if not isinstance(records, list) or not records:
        result.require(False, f"{lang}: cell {cell.get('id')} records must be a non-empty array")
        return

    if isinstance(fields, list):
        result.require(
            len(fields) == len(records[0]),
            f"{lang}: cell {cell.get('id')} has {len(fields)} outputFields for {len(records[0])} record columns",
        )

    for index, record in enumerate(records):
        result.require(
            isinstance(record, dict) and len(record) > 0,
            f"{lang}: cell {cell.get('id')} record {index} is not a populated object",
        )

    log = telemetry.get("rawConsoleLog")
    if log is not None:
        result.require(
            isinstance(log, list) and all(isinstance(line, str) for line in log),
            f"{lang}: cell {cell.get('id')} rawConsoleLog must be an array of strings",
        )


def _validate_rejection_filters(result: ValidationResult, nodes: dict[str, dict[str, Any]]) -> None:
    for lang, node in nodes.items():
        for path, value in iter_strings(node):
            if EMOJI_PATTERN.search(value):
                result.require(False, f"{lang}: decorative emoji rejected at {path}")
            if HTML_PATTERN.search(value):
                result.require(False, f"{lang}: HTML layout element rejected at {path}")
            if TABLE_PIPE_PATTERN.match(value):
                result.require(False, f"{lang}: inline markdown table rejected at {path}")
    result.checks_run += 1
    result.require(
        all(not EMOJI_PATTERN.search(value) for node in nodes.values() for _, value in iter_strings(node)),
        "rejection filter: emoji scan produced findings",
    )


def _validate_code_cells(
    result: ValidationResult,
    node: dict[str, Any],
    execute_code_cells: bool,
) -> None:
    for cell in node["notebookCells"]:
        if cell.get("type") != "code":
            continue
        source = "\n".join(cell["sourceLines"]) + "\n"
        cell_id = cell.get("id")

        try:
            ast.parse(source)
        except SyntaxError as error:
            result.require(False, f"en: cell {cell_id} is not syntactically valid Python: {error}")
            continue
        result.checks_run += 1

        if not execute_code_cells:
            continue

        with tempfile.TemporaryDirectory() as workspace:
            script = Path(workspace) / f"cell_{cell_id}.py"
            script.write_text(source, encoding="utf-8")
            completed = subprocess.run(
                [sys.executable, str(script)],
                capture_output=True,
                text=True,
                timeout=120,
                cwd=workspace,
            )
        result.require(
            completed.returncode == 0,
            f"en: cell {cell_id} exited with code {completed.returncode}: {completed.stderr.strip()[:400]}",
        )
        result.require(
            completed.stdout.strip() != "",
            f"en: cell {cell_id} produced no telemetry on stdout",
        )


def main() -> int:
    result, _ = validate()
    print(f"checks run: {result.checks_run}")
    for warning in result.warnings:
        print(f"warning: {warning}")
    for error in result.errors:
        print(f"error: {error}")
    print("validation: PASS" if result.ok else "validation: FAIL")
    return 0 if result.ok else 1


if __name__ == "__main__":
    raise SystemExit(main())


def _validate_dashboard(
    result: ValidationResult,
    dashboard: dict[str, Any],
    nodes: dict[str, dict[str, Any]],
) -> None:
    """Enforce the analytics contract and full label coverage in every locale."""
    required = required_dashboard_label_keys(dashboard)

    result.require(
        isinstance(dashboard.get("metrics"), list) and dashboard["metrics"],
        "dashboard: metrics must be a non-empty array",
    )
    result.require(
        isinstance(dashboard.get("tiles"), list) and dashboard["tiles"],
        "dashboard: tiles must be a non-empty array",
    )
    result.require(
        isinstance(dashboard.get("repositories"), list),
        "dashboard: repositories must be an array",
    )
    result.require(
        isinstance(dashboard.get("sources"), list) and dashboard["sources"],
        "dashboard: sources must be a non-empty array",
    )

    for metric in dashboard.get("metrics", []):
        result.require(
            metric.get("source") in ("github", "derived", "config"),
            f"dashboard: metric {metric.get('key')} has no valid source",
        )
        result.require(
            metric.get("value") is not None,
            f"dashboard: metric {metric.get('key')} has no value",
        )

    weeks = dashboard.get("contributionWeeks") or []
    result.require(bool(weeks), "dashboard: contributionWeeks matrix is empty")

    for chart in dashboard.get("charts", []):
        kind = chart.get("kind")
        has_data = bool(chart.get("series")) or bool(chart.get("segments"))
        if kind == "heatmap":
            result.require(bool(weeks), f"dashboard: heatmap {chart.get('id')} has no weeks")
            continue
        result.require(has_data, f"dashboard: chart {chart.get('id')} carries no data")

    referenced = {metric.get("source") for metric in dashboard.get("metrics", [])}
    referenced |= {chart.get("source") for chart in dashboard.get("charts", [])}
    referenced |= {tile.get("source") for tile in dashboard.get("tiles", [])}
    referenced |= {
        profile.get("source")
        for profile in (dashboard.get("datasetProfiles") or {}).values()
    }
    declared = {source.get("id") for source in dashboard.get("sources", [])}
    result.require(
        referenced <= declared,
        f"dashboard: sources missing for {sorted(referenced - declared)}",
    )
    result.require(
        declared <= referenced,
        f"dashboard: sources declared but unused {sorted(declared - referenced)}",
    )

    verdict = dashboard.get("verdict") or {}
    result.require(
        verdict.get("code") in ("sparse", "bursty", "steady", "sustained"),
        "dashboard: verdict code is not recognised",
    )
    result.require(
        isinstance(verdict.get("values"), dict) and verdict["values"],
        "dashboard: verdict carries no values",
    )

    for lang, node in nodes.items():
        labels = node.get("dashboardLabels")
        if not result.require(
            isinstance(labels, dict),
            f"{lang}: dashboardLabels is missing",
        ):
            continue
        for block in DASHBOARD_LABEL_BLOCKS:
            values = labels.get(block)
            if not result.require(
                isinstance(values, dict),
                f"{lang}: dashboardLabels.{block} is missing",
            ):
                continue
            missing = sorted(required[block] - set(values))
            extra = sorted(set(values) - required[block])
            result.require(
                not missing,
                f"{lang}: dashboardLabels.{block} missing {missing[:6]}",
            )
            result.warn(
                not extra,
                f"{lang}: dashboardLabels.{block} carries unused keys {extra[:6]}",
            )
            for key in sorted(required[block] & set(values)):
                value = values[key]
                is_list_block = block in ("caseMethod", "caseOutcome")
                if is_list_block:
                    result.require(
                        isinstance(value, list) and len(value) >= 2
                        and all(isinstance(item, str) and item.strip() for item in value),
                        f"{lang}: dashboardLabels.{block}.{key} must be a list of at least 2 strings",
                    )
                else:
                    result.require(
                        isinstance(value, str) and value.strip() != "",
                        f"{lang}: dashboardLabels.{block}.{key} is empty",
                    )
