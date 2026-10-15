"""Inject dashboardLabels into every localization node.

Reads data/localization/dashboard-labels.<lang>.json and merges the block into
data/localization/<lang>.json directly after interfaceLabels, so the node keeps
a stable key order and the pipeline can diff it.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALES = ROOT / "data" / "localization"
LANGUAGES = ("en", "fr", "es", "de", "ru", "ja", "zh")


def main() -> None:
    for lang in LANGUAGES:
        source = LOCALES / f"dashboard-labels.{lang}.json"
        if not source.exists():
            raise SystemExit(f"missing {source.name}")

        labels = json.loads(source.read_text(encoding="utf-8"))
        node_path = LOCALES / f"{lang}.json"
        node = json.loads(node_path.read_text(encoding="utf-8"))

        rebuilt: dict[str, object] = {}
        for key, value in node.items():
            rebuilt[key] = value
            if key == "shellLabels":
                rebuilt["dashboardLabels"] = labels

        if "dashboardLabels" not in rebuilt:
            raise SystemExit(f"{lang}: shellLabels anchor missing")

        node_path.write_text(
            json.dumps(rebuilt, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        total = sum(
            len(v) if isinstance(v, (dict, list)) else 1 for v in labels.values()
        )
        print(f"{lang}: injected {len(labels)} blocks / {total} entries")


if __name__ == "__main__":
    main()
