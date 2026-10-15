"""Label ids the dashboard requires in every localization node.

Kept in its own module so both the compiler and the validator can import it
without a cycle.
"""

from __future__ import annotations

from typing import Any

from pipeline.constants import (
    AVAILABILITY_IDS,
    CASE_STUDIES,
    CONTACT_IDS,
    SECTION_IDS,
    TRACK_IDS,
    VERDICT_CODES,
)


def required_dashboard_label_keys(dashboard: dict[str, Any]) -> dict[str, set[str]]:
    """Every label id the dashboard needs, grouped by block.

    The validator fails the build when a locale is missing any of these, so a
    new metric cannot ship untranslated, and a removed metric cannot leave a
    stale key behind.
    """
    return {
        "sectionTitles": set(SECTION_IDS),
        "sectionCaptions": set(SECTION_IDS),
        "metricLabels": {metric["key"] for metric in dashboard["metrics"]}
        | {tile["key"] for tile in dashboard["tiles"]},
        "chartTitles": {chart["id"] for chart in dashboard["charts"]},
        "chartCaptions": {chart["id"] for chart in dashboard["charts"]},
        "sourceLabels": {source["id"] for source in dashboard["sources"]},
        "trackLabels": set(TRACK_IDS),
        "trackBlurbs": set(TRACK_IDS),
        "caseProblem": {study["copyId"] for study in CASE_STUDIES},
        "caseMethod": {study["copyId"] for study in CASE_STUDIES},
        "caseOutcome": {study["copyId"] for study in CASE_STUDIES},
        "caseRole": {study["copyId"] for study in CASE_STUDIES},
        "caseTimeframe": {study["copyId"] for study in CASE_STUDIES},
        "caseProvenance": {study["copyId"] for study in CASE_STUDIES},
        "availability": set(AVAILABILITY_IDS),
        "contactLabels": set(CONTACT_IDS),
        "verdicts": set(VERDICT_CODES),
    }
