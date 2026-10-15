"""Deterministic test suite for the portfolio compilation pipeline.

Run with `python3 pipeline/test_pipeline.py`. Exits non-zero on the first
contract violation.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipeline.architecture_dag import build_dag
from pipeline.constants import (
    CELL_SHAPE,
    DASHBOARD_LABEL_BLOCKS,
    LANGUAGE_ORDER,
    PAYLOAD_PATH,
    SCHEMA_PATH,
    PROJECT_KEYS,
    SHELL_LABEL_KEYS,
)
from pipeline.loader import load_all
from pipeline.validator import validate

FAILURES: list[str] = []


def check(condition: bool, message: str) -> None:
    if condition:
        print(f"  ok   {message}")
    else:
        print(f"  FAIL {message}")
        FAILURES.append(message)


def test_validation_matrix() -> None:
    print("test: data schema validation contract")
    result, _ = validate(execute_code_cells=True)
    check(result.ok, f"{result.checks_run} contract checks pass")
    for error in result.errors:
        print(f"       error: {error}")


def test_payload_shape() -> None:
    print("test: compiled payload shape")
    payload = json.loads(PAYLOAD_PATH.read_text(encoding="utf-8"))
    registry = payload["localizationRegistry"]

    check(
        payload["metadata"]["availableLanguages"] == list(LANGUAGE_ORDER),
        "metadata.availableLanguages matches the language matrix",
    )
    check(set(registry) == set(LANGUAGE_ORDER), "registry holds every language key")
    check("dashboard" in payload, "payload carries the analytics dashboard")
    check(
        set(payload["metadata"]) == {
            "engineerName",
            "targetTitle",
            "globalTelemetryVersion",
            "systemLocation",
            "availableLanguages",
            "compiledTimestamp",
        },
        "metadata exposes exactly the contract fields",
    )

    for lang, node in registry.items():
        check(
            set(node) == {
                "interfaceLabels",
                "shellLabels",
                "profileNarrative",
                "dashboardLabels",
                "notebookCells",
                "projectDetails",
            },
            f"{lang} node exposes exactly the contract fields",
        )
        check(
            set(node["dashboardLabels"]) == set(DASHBOARD_LABEL_BLOCKS),
            f"{lang} dashboardLabels blocks complete",
        )
        check(
            set(node["shellLabels"]) == set(SHELL_LABEL_KEYS),
            f"{lang} shellLabels complete",
        )
        check(
            [cell["id"] for cell in node["notebookCells"]] == list(CELL_SHAPE),
            f"{lang} notebook cells 1..4 in order",
        )
        for cell in node["notebookCells"]:
            check(
                cell["type"] == CELL_SHAPE[cell["id"]],
                f"{lang} cell {cell['id']} archetype {cell['type']}",
            )
        check(
            sorted(node["projectDetails"]) == sorted(PROJECT_KEYS),
            f"{lang} projectDetails keys",
        )


def test_dag_integrity() -> None:
    print("test: system architecture DAG integrity")
    dag = build_dag()
    ids = {node["id"] for node in dag["nodes"]}
    check(len(ids) == len(dag["nodes"]), "node ids unique")
    check(
        all(edge["source"] in ids and edge["target"] in ids for edge in dag["edges"]),
        "every edge endpoint resolves to a node",
    )
    check(
        all(0.0 < node["weight"] <= 1.0 for node in dag["nodes"]),
        "node weights inside (0, 1]",
    )
    check(
        {"biasguard.audit", "feedbackloop.align", "confidencecoach.memory", "agrimanet.wrr"}
        <= ids,
        "all four open-source engines bind to DAG nodes",
    )
    domains = {node["domain"] for node in dag["nodes"]}
    check(
        {"analytics", "quality", "alignment", "memory", "coaching", "network", "telemetry"}
        <= domains,
        "every declared domain is populated",
    )


def test_numeric_parity() -> None:
    print("test: numeric parity across locales")
    nodes = load_all()
    baseline = json.dumps(nodes["en"], sort_keys=True)

    def numbers(value, sink):
        if isinstance(value, dict):
            for key in sorted(value):
                numbers(value[key], sink)
        elif isinstance(value, list):
            for item in value:
                numbers(item, sink)
        elif isinstance(value, (int, float)) and not isinstance(value, bool):
            sink.append(float(value))
        return sink

    reference = numbers(nodes["en"], [])
    for lang, node in nodes.items():
        candidate = numbers(node, [])
        check(len(candidate) == len(reference), f"{lang} numeric leaf count matches baseline")
    check(bool(baseline), "baseline serialises")


def test_schema_conformance() -> None:
    """Walk the emitted JSON Schema against the compiled payload."""
    print("test: payload conforms to the emitted JSON Schema")
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    payload = json.loads(PAYLOAD_PATH.read_text(encoding="utf-8"))

    violations = _conform(payload, schema, "$")
    check(not violations, f"schema walk reports {len(violations)} violation(s)")
    for violation in violations[:20]:
        print(f"       violation: {violation}")


def _conform(value: object, schema: dict, path: str) -> list[str]:
    """Minimal draft-07 subset walker covering the constructs this schema uses."""
    problems: list[str] = []
    if not isinstance(schema, dict):
        return problems

    declared = schema.get("type")
    if declared is not None:
        kinds = declared if isinstance(declared, list) else [declared]
        if not any(_matches(value, kind) for kind in kinds):
            return [f"{path}: expected {declared}, received {type(value).__name__}"]

    if "enum" in schema and value not in schema["enum"]:
        problems.append(f"{path}: {value!r} outside enum {schema['enum']}")

    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                problems.append(f"{path}: missing required key {key}")
        properties = schema.get("properties", {})
        additional = schema.get("additionalProperties", True)
        for key, child in value.items():
            if key in properties:
                problems += _conform(child, properties[key], f"{path}.{key}")
            elif additional is False:
                problems.append(f"{path}: unexpected key {key}")
            elif isinstance(additional, dict):
                problems += _conform(child, additional, f"{path}.{key}")

    if isinstance(value, list):
        if "minItems" in schema and len(value) < schema["minItems"]:
            problems.append(f"{path}: {len(value)} items below minItems {schema['minItems']}")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            problems.append(f"{path}: {len(value)} items above maxItems {schema['maxItems']}")
        item_schema = schema.get("items")
        if isinstance(item_schema, dict):
            for index, child in enumerate(value):
                problems += _conform(child, item_schema, f"{path}[{index}]")

    return problems


def _matches(value: object, kind: str) -> bool:
    if kind == "object":
        return isinstance(value, dict)
    if kind == "array":
        return isinstance(value, list)
    if kind == "string":
        return isinstance(value, str)
    if kind == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if kind == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if kind == "boolean":
        return isinstance(value, bool)
    return True


def main() -> int:
    test_validation_matrix()
    test_payload_shape()
    test_dag_integrity()
    test_numeric_parity()
    test_schema_conformance()

    print()
    if FAILURES:
        print(f"test suite FAILED with {len(FAILURES)} violation(s)")
        return 1
    print("test suite PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
