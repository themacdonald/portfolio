"""Derive every code metric in the dashboard from the GitHub snapshot.

Nothing here is allowed to invent a value. Each metric is either read straight
from the snapshot, aggregated from it, or marked as self-reported with a named
source in data/config/metrics.ts.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from typing import Any

from pipeline.constants import PROJECT_TRACKS

# A repository is considered "active" when it was pushed inside this window.
ACTIVE_WINDOW_DAYS = 180

# GitHub reports notebook bytes as "Jupyter Notebook", which is an artifact
# format rather than a language. A notebook executes Python, so its bytes are
# attributed to the kernel language. Grouping here keeps the share truthful
# instead of letting an envelope format outrank the language it carries.
LANGUAGE_FAMILY = {
    "Jupyter Notebook": "Python",
    "Jupyter Notebooks": "Python",
}


def _parse(value: str | None) -> datetime | None:
    """Parse an ISO timestamp into a naive UTC datetime for safe arithmetic."""
    if not value:
        return None
    try:
        stamp = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if stamp.tzinfo is not None:
        stamp = stamp.astimezone(timezone.utc).replace(tzinfo=None)
    return stamp


def _days_since(value: str | None, now: datetime) -> int | None:
    stamp = _parse(value)
    if stamp is None:
        return None
    return max(0, (now - stamp).days)


def _readiness(repo: dict[str, Any]) -> int:
    """0..100 readiness score: documentation, commit depth, language spread.

    Deliberately transparent rather than clever. Every input is visible in the
    snapshot, so any reader can recompute the score by hand.
    """
    score = 0.0
    if repo.get("description"):
        score += 25.0
    if repo.get("homepage"):
        score += 10.0
    if repo.get("topics"):
        score += 10.0
    commits = sum((repo.get("commitMonths") or {}).values())
    score += min(30.0, commits * 1.5)
    languages = len(repo.get("languages") or {})
    score += min(15.0, languages * 5.0)
    if not repo.get("isFork"):
        score += 10.0
    return int(round(min(100.0, score)))


def _track_for(name: str) -> str:
    return PROJECT_TRACKS.get(name, "system")


def repository_records(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    records = []
    for repo in snapshot.get("repositories", []):
        if repo.get("platform"):
            continue
        records.append(
            {
                "name": repo["name"],
                "description": repo.get("description") or "",
                "language": repo.get("language") or "Unspecified",
                "stars": repo.get("stars", 0),
                "forks": repo.get("forks", 0),
                "openIssues": repo.get("openIssues", 0),
                "topics": repo.get("topics", []),
                "homepage": repo.get("homepage") or "",
                "url": repo.get("url") or "",
                "pushedAt": (repo.get("pushedAt") or "")[:10],
                "createdAt": (repo.get("createdAt") or "")[:10],
                "sizeKb": repo.get("sizeKb", 0),
                "archived": bool(repo.get("archived")),
                "isFork": bool(repo.get("isFork")),
                "track": _track_for(repo["name"]),
                "readiness": _readiness(repo),
            }
        )
    records.sort(key=lambda item: (-item["readiness"], item["name"]))
    return records


def language_mix(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    """Aggregate declared language bytes across tracked repositories."""
    raw_totals: dict[str, int] = defaultdict(int)
    for repo in snapshot.get("repositories", []):
        if repo.get("platform"):
            continue
        for language, size in (repo.get("languages") or {}).items():
            raw_totals[language] += int(size)

    totals: dict[str, int] = defaultdict(int)
    for language, size in raw_totals.items():
        totals[LANGUAGE_FAMILY.get(language, language)] += size
    grand = sum(totals.values()) or 1
    segments = [
        {"label": language, "value": size, "share": round(size / grand * 100, 1)}
        for language, size in sorted(totals.items(), key=lambda item: -item[1])
    ]
    return segments


def contribution_weeks(snapshot: dict[str, Any]) -> list[list[dict[str, Any]]]:
    """Contribution calendar as 7-row columns, oldest week first.

    Intensity is bucketed 0..4 so the client can pick a shade without doing any
    arithmetic, and the bucket edges are visible in the payload.
    """
    from datetime import date, timedelta

    days = snapshot.get("contributions", {}).get("days", [])
    if not days:
        return []

    parsed: list[tuple[date, int]] = []
    for day in days:
        raw = day.get("date") or ""
        try:
            parsed.append((date.fromisoformat(raw), int(day.get("count", 0))))
        except ValueError:
            continue
    if not parsed:
        return []

    parsed.sort(key=lambda item: item[0])
    # Align the first column to Sunday so weekday rows stay stable.
    start = parsed[0][0] - timedelta(days=(parsed[0][0].weekday() + 1) % 7)
    counts = dict(parsed)
    weeks: list[list[dict[str, Any]]] = []
    cursor = start
    while cursor <= parsed[-1][0]:
        column: list[dict[str, Any]] = []
        for _ in range(7):
            value = counts.get(cursor, 0)
            column.append(
                {
                    "date": cursor.isoformat(),
                    "value": value,
                    "level": _intensity(value),
                }
            )
            cursor += timedelta(days=1)
        weeks.append(column)
    return weeks


def _intensity(value: int) -> int:
    if value <= 0:
        return 0
    if value <= 2:
        return 1
    if value <= 5:
        return 2
    if value <= 9:
        return 3
    return 4


def repository_activity(snapshot: dict[str, Any], repositories: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Per-repository commit spreads, newest repository first."""
    source = {repo["name"]: repo for repo in snapshot.get("repositories", [])}
    featured = [repo for repo in repositories if repo["track"] != "system"]
    featured.sort(key=lambda item: item["pushedAt"], reverse=True)
    out: list[dict[str, Any]] = []
    for repo in featured[:12]:
        months = (source.get(repo["name"], {}).get("commitMonths") or {})
        ordered = sorted(months.items())
        out.append(
            {
                "period": repo["name"],
                "value": sum(months.values()),
                "series": ",".join(f"{month}:{count}" for month, count in ordered),
            }
        )
    return out


def derive_verdict(active_days: int, total_contributions: int, months_spanned: int) -> dict[str, Any]:
    """Read the contribution shape. Opinionated, but computed from the data.

    The labels are the owner's; the reading is the pipeline's. A portfolio that
    only ever flatters itself is not a measurement instrument.
    """
    if total_contributions == 0:
        code, tone = "sparse", "caution"
    elif total_contributions < 60 or active_days < 12:
        code, tone = "sparse", "caution"
    elif active_days < 40:
        code, tone = "bursty", "neutral"
    elif active_days < 120:
        code, tone = "steady", "neutral"
    else:
        code, tone = "sustained", "strong"

    return {
        "code": code,
        "tone": tone,
        "values": {
            "activeDays": active_days,
            "contributions": total_contributions,
            "months": months_spanned,
            "perActiveDay": round(total_contributions / active_days, 1) if active_days else 0,
        },
    }


def repository_signals(snapshot: dict[str, Any], repositories: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Visible engineering signals across every public repository.

    Counting what is present avoids scoring the portfolio down for work that is
    legitimately unfinished. A reader learns the surface area, which is the
    point, without being handed a grade.
    """
    tracked_names = {repo["name"] for repo in repositories}
    repos = [r for r in snapshot.get("repositories", []) if r["name"] in tracked_names]
    with_description = sum(1 for repo in repos if (repo.get("description") or "").strip())
    with_topics = sum(1 for repo in repos if (repo.get("topics") or []))
    with_demo = sum(1 for repo in repos if (repo.get("homepage") or "").strip())
    python = sum(1 for repo in repos if repo.get("language") == "Python")
    since_2026 = sum(1 for repo in repos if (repo.get("createdAt") or "") >= "2026-01-01")
    return [
        {"period": "tracked_repos", "value": len(repos)},
        {"period": "with_description", "value": with_description},
        {"period": "with_topics", "value": with_topics},
        {"period": "with_demo", "value": with_demo},
        {"period": "python_primary", "value": python},
        {"period": "created_2026", "value": since_2026},
    ]


def contribution_series(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    """Monthly contribution totals for the captured window."""
    months: dict[str, int] = defaultdict(int)
    for day in snapshot.get("contributions", {}).get("days", []):
        date = day.get("date") or ""
        if len(date) >= 7:
            months[date[:7]] += int(day.get("count", 0))
    return [{"period": month, "value": months[month]} for month in sorted(months)]


def activity_series(snapshot: dict[str, Any], repositories: list[dict[str, Any]], limit: int = 10) -> list[dict[str, Any]]:
    """Commits per month summed across the most recently active repositories."""
    by_name = {repo["name"]: repo for repo in snapshot.get("repositories", [])}
    ordered = sorted(repositories, key=lambda item: item["pushedAt"], reverse=True)[:limit]
    months: dict[str, int] = defaultdict(int)
    for repo in ordered:
        source = by_name.get(repo["name"], {})
        for month, count in (source.get("commitMonths") or {}).items():
            months[month] += int(count)
    return [{"period": month, "value": months[month]} for month in sorted(months)]


def commit_depth(repositories: list[dict[str, Any]], snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    by_name = {repo["name"]: repo for repo in snapshot.get("repositories", [])}
    buckets = {"1-5": 0, "6-15": 0, "16-30": 0, "31+": 0}
    for repo in repositories:
        commits = sum((by_name.get(repo["name"], {}).get("commitMonths") or {}).values())
        if commits <= 5:
            buckets["1-5"] += 1
        elif commits <= 15:
            buckets["6-15"] += 1
        elif commits <= 30:
            buckets["16-30"] += 1
        else:
            buckets["31+"] += 1
    return [{"period": label, "value": count} for label, count in buckets.items()]


def dataset_metrics(dataset: dict[str, Any]) -> dict[str, Any]:
    """Pull the defensible headline numbers out of a computed dataset profile."""
    summary = dataset.get("numericSummary", {})
    categorical = dataset.get("categoricalColumns", {})
    correlations = dataset.get("correlations", [])
    years = categorical.get("Year", {}).get("values", [])
    states = categorical.get("State", {}).get("values", [])

    life = summary.get("Life Expectancy (Years)")
    strongest = correlations[0] if correlations else None

    return {
        "source": "dataset",
        "rows": dataset.get("rowCount", 0),
        "columns": dataset.get("columnCount", 0),
        "groups": len(states),
        "yearFrom": years[0] if years else "",
        "yearTo": years[-1] if years else "",
        "lifeMean": life["mean"] if life else None,
        "lifeMin": life["min"] if life else None,
        "lifeMax": life["max"] if life else None,
        "strongest": strongest,
        "counts": {name: len(values) for name, values in categorical.items()},
        "numeric": summary,
    }


def build_dashboard(
    snapshot: dict[str, Any],
    manual_metrics: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Assemble the whole dashboard block for the compiled payload."""
    now = _parse(snapshot.get("capturedAt")) or datetime.now(timezone.utc).replace(tzinfo=None)
    repositories = repository_records(snapshot)
    profile = snapshot.get("profile", {})
    contributions = snapshot.get("contributions", {})
    days = contributions.get("days", [])

    active_days = sum(1 for day in days if int(day.get("count", 0)) > 0)
    busiest = max((int(day.get("count", 0)) for day in days), default=0)
    total_contributions = int(
        contributions.get("total", {}).get("lastYear")
        or sum(int(day.get("count", 0)) for day in days)
    )
    tracked_commits = sum(
        sum((repo.get("commitMonths") or {}).values())
        for repo in snapshot.get("repositories", [])
        if not repo.get("platform")
    )
    fresh = [repo for repo in repositories if (_days_since(repo["pushedAt"], now) or 9999) <= ACTIVE_WINDOW_DAYS]
    starred = sum(repo["stars"] for repo in repositories)
    languages = language_mix(snapshot)
    primary_language = languages[0]["label"] if languages else "Unspecified"
    primary_share = languages[0]["share"] if languages else 0.0
    latest_push = max((repo["pushedAt"] for repo in repositories), default="")

    datasets = snapshot.get("datasets", {})
    dataset_profiles = {name: dataset_metrics(value) for name, value in datasets.items()}

    metrics: list[dict[str, Any]] = [
        {
            "key": "tracked_repositories",
            "value": len(repositories),
            "unit": "count",
            "context": "context_excluding_forks",
            "source": "derived",
            "sourceDetail": "github snapshot repository list",
        },
        {
            "key": "featured_repositories",
            "value": len([repo for repo in repositories if repo["track"] != "system"]),
            "unit": "count",
            "context": "context_tracked_tracks",
            "source": "derived",
            "sourceDetail": "data/config/case-studies.ts",
        },
        {
            "key": "commits_captured",
            "value": tracked_commits,
            "unit": "count",
            "context": "context_commits_read",
            "source": "github",
            "sourceDetail": "GitHub REST API commits endpoint, first 300 per repo",
        },
        {
            "key": "contributions_last_year",
            "value": total_contributions,
            "unit": "count",
            "context": "context_public_calendar",
            "source": "github",
            "sourceDetail": "github-contributions-api contribution calendar",
        },
        {
            "key": "active_days",
            "value": active_days,
            "unit": "count",
            "context": "context_active_days",
            "source": "derived",
            "sourceDetail": "contribution calendar day series",
        },
        {
            "key": "busiest_day",
            "value": busiest,
            "unit": "count",
            "context": "context_busiest_day",
            "source": "derived",
            "sourceDetail": "contribution calendar day series",
        },
        {
            "key": "repositories_touched_180d",
            "value": len(fresh),
            "unit": "count",
            "context": "context_pushed_180d",
            "source": "derived",
            "sourceDetail": "repository pushedAt timestamps",
        },
        {
            "key": "primary_language",
            "value": primary_language,
            "context": "context_measured_bytes",
            "source": "github",
            "sourceDetail": "GitHub REST API languages endpoint, notebooks attributed to Python",
        },
        {
            "key": "languages_used",
            "value": len(languages),
            "unit": "count",
            "context": "context_language_groups",
            "source": "github",
            "sourceDetail": "GitHub REST API languages endpoint",
        },
        {
            "key": "stars_earned",
            "value": starred,
            "unit": "count",
            "context": "context_stars",
            "source": "github",
            "sourceDetail": "repository stargazers_count",
        },
        {
            "key": "open_issues",
            "value": sum(repo["openIssues"] for repo in repositories),
            "unit": "count",
            "context": "context_open_issues",
            "source": "github",
            "sourceDetail": "repository open_issues_count",
        },
        {
            "key": "followers",
            "value": profile.get("followers", 0),
            "unit": "count",
            "context": "context_followers",
            "source": "github",
            "sourceDetail": "GitHub REST API user endpoint",
        },
        {
            "key": "latest_push",
            "value": latest_push,
            "unit": "date",
            "context": "context_latest_push",
            "source": "github",
            "sourceDetail": "repository pushedAt timestamps",
        },
        {
            "key": "datasets_profiled",
            "value": len(dataset_profiles),
            "unit": "count",
            "context": "context_datasets",
            "source": "derived",
            "sourceDetail": "pipeline/fetch_github.py dataset profiler",
        },
    ]

    if dataset_profiles:
        public_health = dataset_profiles.get("Nigeria-Public-Health-Trends-Dashboard")
        if public_health:
            metrics.extend(
                [
                    {
                        "key": "public_health_rows",
                        "value": public_health["rows"],
                        "unit": "count",
                        "context": "context_ph_rows",
                        "source": "derived",
                        "sourceDetail": "nigeria_public_health.csv",
                    },
                    {
                        "key": "public_health_groups",
                        "value": public_health["groups"],
                        "unit": "count",
                        "context": "context_ph_states",
                        "source": "derived",
                        "sourceDetail": "nigeria_public_health.csv State column",
                    },
                    {
                        "key": "expenditure_life_correlation",
                        "value": (
                            public_health["strongest"]["r"]
                            if public_health.get("strongest")
                            else 0
                        ),
                        "unit": "score",
                        "context": "context_correlation",
                        "source": "derived",
                        "sourceDetail": (
                            f"{public_health['strongest']['a']} vs {public_health['strongest']['b']}"
                            if public_health.get("strongest")
                            else "no correlation passed the size threshold"
                        ),
                    },
                ]
            )

    if manual_metrics:
        metrics.extend(manual_metrics)

    # Tiles chosen so a reader sees volume, recency and breadth in one row.
    tiles = [
        {"key": "tracked_repositories", "value": len(repositories), "unit": "count", "context": "context_excluding_forks", "source": "derived", "emphasis": True},
        {"key": "contributions_last_year", "value": total_contributions, "unit": "count", "context": "context_public_calendar", "source": "github", "emphasis": True},
        {"key": "commits_captured", "value": tracked_commits, "unit": "count", "context": "context_read_from_api", "source": "github"},
        {"key": "primary_language", "value": primary_language, "context": "context_measured_bytes", "source": "github"},
        {"key": "datasets_profiled", "value": len(dataset_profiles), "unit": "count", "context": "context_raw_csv", "source": "derived"},
        {"key": "repositories_touched_180d", "value": len(fresh), "unit": "count", "context": "context_pushed_180d", "source": "derived"},
    ]

    weeks = contribution_weeks(snapshot)
    measured_repos = len([repo for repo in repositories if repo["name"] in {
        name for name, data in snapshot.get("datasets", {}).items()
    }])
    unmeasured = len([repo for repo in snapshot.get("repositories", []) if not repo.get("languages")])

    charts = [
        {
            # Values live at dashboard.contributionWeeks; this entry carries the
            # metadata and provenance for the heatmap.
            "id": "contribution-heatmap",
            "kind": "heatmap",
            "unit": "count",
            "series": [],
            "segments": None,
            "source": "github",
            "sourceDetail": f"contribution calendar, {len(weeks)} weeks aligned to Sunday",
        },
        {
            "id": "language-mix",
            "kind": "distribution",
            "unit": "count",
            "series": [],
            "segments": languages,
            "source": "github",
            "sourceDetail": (
                f"language bytes summed per repository; notebooks attributed to Python; "
                f"{unmeasured} repositories report no measured bytes"
            ),
        },
        {
            "id": "repository-activity",
            "kind": "strips",
            "unit": "count",
            "series": repository_activity(snapshot, repositories),
            "segments": None,
            "source": "github",
            "sourceDetail": "commits per repository, collapsed to the months they landed in",
        },
        {
            "id": "repository-signals",
            "kind": "signals",
            "unit": "count",
            "series": repository_signals(snapshot, repositories),
            "segments": None,
            "source": "derived",
            "sourceDetail": "presence counts across every public repository in the snapshot",
        },
    ]

    sources = [
        {
            "id": "github",
            "detail": f"@{snapshot.get('username')}",
            "url": f"https://github.com/{snapshot.get('username')}",
            "capturedAt": snapshot.get("capturedAt", ""),
        },
        {
            "id": "derived",
            "detail": "computed by pipeline/github_metrics.py from the snapshot",
            "capturedAt": snapshot.get("capturedAt", ""),
        },
    ]
    if manual_metrics:
        sources.append(
            {
                "id": "config",
                "detail": "declared in data/config/metrics.ts",
                "capturedAt": snapshot.get("capturedAt", ""),
            }
        )
    for name, profile_data in dataset_profiles.items():
        sources.append(
            {
                "id": "dataset",
                "detail": f"{name}/{profile_data['rows']} rows",
                "url": datasets[name].get("url"),
                "capturedAt": snapshot.get("capturedAt", ""),
            }
        )

    months_spanned = len({day["date"][:7] for day in days}) if days else 0

    return {
        "generatedAt": snapshot.get("capturedAt", ""),
        "capturedDaysAgo": _days_since(snapshot.get("capturedAt"), datetime.now(timezone.utc).replace(tzinfo=None)) or 0,
        "verdict": derive_verdict(active_days, total_contributions, months_spanned),
        "metrics": metrics,
        "tiles": tiles,
        "charts": charts,
        "repositories": repositories,
        "contributionWeeks": weeks,
        "datasetProfiles": dataset_profiles,
        "sources": sources,
    }
