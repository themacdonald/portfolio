"""Inject a localized focusAreas list into each node's profileNarrative."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALES = ROOT / "data" / "localization"

FOCUS_AREAS: dict[str, list[str]] = {
    "en": [
        "LLM evaluation",
        "RLHF and DPO preference data",
        "Fairness and bias auditing",
        "Analytical SQL",
        "Power BI and Tableau",
        "Metric governance",
        "Python and Pandas",
    ],
    "fr": [
        "Évaluation de LLM",
        "Données de préférence RLHF et DPO",
        "Audit d'équité et de biais",
        "SQL analytique",
        "Power BI et Tableau",
        "Gouvernance des métriques",
        "Python et Pandas",
    ],
    "es": [
        "Evaluación de LLM",
        "Datos de preferencia RLHF y DPO",
        "Auditoría de equidad y sesgo",
        "SQL analítico",
        "Power BI y Tableau",
        "Gobernanza de métricas",
        "Python y Pandas",
    ],
    "de": [
        "LLM-Evaluierung",
        "RLHF- und DPO-Präferenzdaten",
        "Fairness- und Bias-Audit",
        "Analytisches SQL",
        "Power BI und Tableau",
        "Metrik-Governance",
        "Python und Pandas",
    ],
    "ru": [
        "Оценка LLM",
        "Данные предпочтений RLHF и DPO",
        "Аудит справедливости и предвзятости",
        "Аналитический SQL",
        "Power BI и Tableau",
        "Управление метриками",
        "Python и Pandas",
    ],
    "ja": [
        "LLM評価",
        "RLHFとDPOの選好データ",
        "公平性とバイアスの監査",
        "分析用SQL",
        "Power BIとTableau",
        "指標ガバナンス",
        "PythonとPandas",
    ],
    "zh": [
        "LLM 评估",
        "RLHF 与 DPO 偏好数据",
        "公平性与偏见审计",
        "分析型 SQL",
        "Power BI 与 Tableau",
        "指标治理",
        "Python 与 Pandas",
    ],
}


def main() -> None:
    for lang, areas in FOCUS_AREAS.items():
        path = LOCALES / f"{lang}.json"
        node = json.loads(path.read_text(encoding="utf-8"))
        node["profileNarrative"]["focusAreas"] = areas
        path.write_text(json.dumps(node, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"{lang}: {len(areas)} focus areas")


if __name__ == "__main__":
    main()
