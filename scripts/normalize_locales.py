"""One-shot normalization pass over the localization nodes.

Applies two corrections discovered during the pipeline audit:

1. Replaces the `|` separator inside prose with a colon so no data string can be
   mistaken for an inline markdown table.
2. Aligns `simulatedTelemetry.outputFields` across every locale. The entries are
   display labels for the telemetry grid header row, so they belong in the
   localized node. Record keys stay canonical machine identifiers.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALES = ROOT / "data" / "localization"

# prose delimiters only: heading lines and list bullets. Never touches code.
PROSE_PIPE = re.compile(r"^((?:#|-)\s*.*?)\s*\|\s*", re.MULTILINE)

# localised display labels, one tuple per locale, for cells 2 and 3 in order
FIELD_LABELS: dict[str, tuple[list[str], list[str]]] = {
    "en": (
        ["site", "role", "cost_saved_pct", "output_scale_pct", "efficiency_shift_pct"],
        ["dimension", "target", "observed", "margin", "weight", "status"],
    ),
    "fr": (
        ["site", "role", "cout_economise_pct", "echelle_production_pct", "gain_efficacite_pct"],
        ["dimension", "cible", "mesure", "marge", "poids", "statut"],
    ),
    "es": (
        ["sitio", "rol", "costo_ahorrado_pct", "escala_produccion_pct", "mejora_eficiencia_pct"],
        ["dimension", "objetivo", "medido", "margen", "peso", "estado"],
    ),
    "de": (
        ["standort", "rolle", "kostenersparnis_pct", "skalierung_pct", "effizienzgewinn_pct"],
        ["dimension", "zielwert", "messwert", "abstand", "gewicht", "status"],
    ),
    "ru": (
        ["uchastok", "rol", "ekonomiya_zatrat_pct", "masshtab_vyrabotki_pct", "prirost_effektivnosti_pct"],
        ["izmerenie", "celevoj_uroven", "zamer", "zapas", "ves", "status"],
    ),
    "ja": (
        ["basyo", "yakuwari", "cost_sakugen_pct", "sanshutsu_kibo_pct", "koritsu_henka_pct"],
        ["shihyou", "mokuhyo", "jissoku", "yoyuu", "kaju", "sutetasu"],
    ),
    "zh": (
        ["zhandian", "juese", "chengben_jiesheng_pct", "chanchu_guimo_pct", "xiaolv_bianhua_pct"],
        ["weidu", "mubiao", "shice", "yuliang", "quanzhong", "zhuangtai"],
    ),
}


def main() -> None:
    for lang, (cell2_fields, cell3_fields) in FIELD_LABELS.items():
        path = LOCALES / f"{lang}.json"
        node = json.loads(path.read_text(encoding="utf-8"))

        for cell in node["notebookCells"]:
            cell["sourceLines"] = [_fix_pipes(line) for line in cell["sourceLines"]]
            if cell["type"] != "code":
                continue
            telemetry = cell["executionMetadata"]["simulatedTelemetry"]
            fields = cell2_fields if cell["id"] == 2 else cell3_fields
            telemetry["outputFields"] = list(fields)
            expected = len(telemetry["records"][0])
            if len(fields) != expected:
                raise ValueError(f"{lang} cell {cell['id']}: {len(fields)} labels for {expected} columns")

        path.write_text(json.dumps(node, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"normalized {path.relative_to(ROOT)}")


def _fix_pipes(line: str) -> str:
    """Replace a prose pipe delimiter with a colon inside headings and bullets."""
    if line.startswith("#") or line.startswith("- "):
        return PROSE_PIPE.sub(lambda match: f"{match.group(1).rstrip()}: ", line)
    return line


if __name__ == "__main__":
    main()
