"""Loader for the discrete localization nodes on disk."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pipeline.constants import LANGUAGE_ORDER, LOCALIZATION_DIR


class LocalizationLoadError(RuntimeError):
    """Raised when a localization node cannot be read or parsed."""


def load_node(lang: str) -> dict[str, Any]:
    """Read one localization node and fail loudly on malformed JSON."""
    path = LOCALIZATION_DIR / f"{lang}.json"
    if not path.exists():
        raise LocalizationLoadError(f"missing localization node: {path}")
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise LocalizationLoadError(f"{path.name} is not valid JSON: {error}") from error


def load_all() -> dict[str, dict[str, Any]]:
    """Read every node in display order."""
    return {lang: load_node(lang) for lang in LANGUAGE_ORDER}


def iter_strings(value: Any, path: str = "$"):
    """Yield (json_path, string) for every string leaf."""
    if isinstance(value, dict):
        for key, child in value.items():
            yield from iter_strings(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from iter_strings(child, f"{path}[{index}]")
    elif isinstance(value, str):
        yield path, value


def collect_numbers(value: Any, sink: list[float]) -> list[float]:
    """Collect every numeric leaf in traversal order."""
    if isinstance(value, dict):
        for child in value.values():
            collect_numbers(child, sink)
    elif isinstance(value, list):
        for child in value:
            collect_numbers(child, sink)
    elif isinstance(value, (int, float)) and not isinstance(value, bool):
        sink.append(float(value))
    return sink


def file_digest(path: Path) -> str:
    """Stable short digest used by the telemetry dataset."""
    import hashlib

    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]
