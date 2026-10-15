"""Ingest GitHub metadata and compute every code metric in the dashboard.

Sequence:
  1. fetch the user profile, repository list, languages, commit months and the
     contribution calendar from the public GitHub REST API
  2. fetch any dataset CSV a case study declares, and compute real statistics
     from it (row counts, ranges, correlations, group breakdowns)
  3. write data/github.snapshot.json

The snapshot is committed. The compile pipeline only reads it, so a build works
offline and a build never depends on GitHub being reachable. Re-run this script
deliberately when you want fresher numbers:

    npm run github:sync

Set GITHUB_TOKEN to raise the API rate limit and read private repository
metadata. Without a token the public API allows 60 requests per hour, which is
comfortably enough for one sync.
"""

from __future__ import annotations

import csv
import io
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
SNAPSHOT_PATH = ROOT / "data" / "github.snapshot.json"
CONFIG_PATH = ROOT / "data" / "config" / "github.ts"

API = "https://api.github.com"
USER_AGENT = "agentic-portfolio-pipeline/1.0"
TIMEOUT = 30

# Repository name -> dataset CSV path inside that repository.
DATASET_SOURCES: dict[str, str] = {
    "Nigeria-Public-Health-Trends-Dashboard": "nigeria_public_health.csv",
}


class GithubSyncError(RuntimeError):
    """Raised when the GitHub API cannot be read."""


def _headers() -> dict[str, str]:
    headers = {"Accept": "application/vnd.github+json", "User-Agent": USER_AGENT}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def get_json(url: str) -> Any:
    request = urllib.request.Request(url, headers=_headers())
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        raise GithubSyncError(f"{url} returned HTTP {error.code}") from error
    except (urllib.error.URLError, TimeoutError) as error:
        raise GithubSyncError(f"{url} is unreachable: {error}") from error


def get_text(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        return response.read().decode("utf-8", errors="replace")


def read_config() -> dict[str, Any]:
    """Read the TypeScript config without a TS runtime.

    The config is deliberately a flat object literal so a small scan is enough.
    """
    text = CONFIG_PATH.read_text(encoding="utf-8")
    username = _first_match(text, r'username:\s*"([^"]+)"')
    arrays = {
        "featured": _string_array(text, "featured"),
        "exclude": _string_array(text, "exclude"),
        "platform": _string_array(text, "platform"),
    }
    year = _first_match(text, r'contributionYear:\s*"([^"]+)"') or _first_digits(text, r"contributionYear:\s*(\d{4})")
    if not username:
        raise GithubSyncError(f"could not read username from {CONFIG_PATH}")
    return {
        "username": username,
        "contributionYear": year or "last",
        **arrays,
    }


def _first_match(text: str, pattern: str) -> str | None:
    import re

    match = re.search(pattern, text)
    return match.group(1) if match else None


def _first_digits(text: str, pattern: str) -> str | None:
    import re

    match = re.search(pattern, text)
    return match.group(1) if match else None


def _string_array(text: str, field: str) -> list[str]:
    import re

    match = re.search(rf"{field}:\s*\[(.*?)\]", text, re.DOTALL)
    if not match:
        return []
    return re.findall(r'"([^"]+)"', match.group(1))


def fetch_languages(username: str, repo_names: list[str]) -> dict[str, dict[str, int]]:
    out: dict[str, dict[str, int]] = {}
    for name in repo_names:
        try:
            out[name] = get_json(f"{API}/repos/{username}/{name}/languages")
        except GithubSyncError as error:
            print(f"  warn: languages for {name}: {error}")
            out[name] = {}
    return out


def fetch_commit_months(username: str, repo_names: list[str]) -> dict[str, dict[str, int]]:
    """Commit counts per YYYY-MM, capped at the first 100 commits per repo."""
    out: dict[str, dict[str, int]] = {}
    for name in repo_names:
        months: dict[str, int] = {}
        page = 1
        total = 0
        while page <= 3:
            try:
                batch = get_json(
                    f"{API}/repos/{username}/{name}/commits?per_page=100&page={page}"
                )
            except GithubSyncError as error:
                print(f"  warn: commits for {name}: {error}")
                break
            if not isinstance(batch, list) or not batch:
                break
            for entry in batch:
                date = (entry.get("commit", {}).get("author") or {}).get("date") or ""
                if len(date) >= 7:
                    months[date[:7]] = months.get(date[:7], 0) + 1
            total += len(batch)
            if len(batch) < 100:
                break
            page += 1
        out[name] = dict(sorted(months.items()))
        print(f"  commits {name}: {total}")
    return out


def fetch_dataset_stats(username: str, repo: str, path: str) -> dict[str, Any] | None:
    """Download a dataset CSV and compute real descriptive statistics."""
    url = f"https://raw.githubusercontent.com/{username}/{repo}/HEAD/{path}"
    try:
        raw = get_text(url)
    except Exception as error:  # noqa: BLE001 - any failure means "no dataset"
        print(f"  warn: dataset {repo}/{path}: {error}")
        return None

    reader = csv.DictReader(io.StringIO(raw))
    rows = [row for row in reader]
    if not rows:
        return None
    columns = list(rows[0].keys())

    def numeric(column: str) -> list[float]:
        values: list[float] = []
        for row in rows:
            raw_value = (row.get(column) or "").strip().replace("%", "").replace(",", "")
            if raw_value in ("", "NA", "N/A", "null"):
                continue
            try:
                values.append(float(raw_value))
            except ValueError:
                continue
        return values

    numeric_columns: dict[str, list[float]] = {}
    categorical_columns: dict[str, list[str]] = {}
    for column in columns:
        values = numeric(column)
        if len(values) >= max(2, len(rows) // 2):
            numeric_columns[column] = values
        else:
            categorical_columns[column] = sorted({(row.get(column) or "").strip() for row in rows})

    def pearson(xs: list[float], ys: list[float]) -> float | None:
        if len(xs) != len(ys) or len(xs) < 3:
            return None
        n = len(xs)
        mean_x = sum(xs) / n
        mean_y = sum(ys) / n
        numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys))
        denom_x = sum((x - mean_x) ** 2 for x in xs) ** 0.5
        denom_y = sum((y - mean_y) ** 2 for y in ys) ** 0.5
        if denom_x == 0 or denom_y == 0:
            return None
        return round(numerator / (denom_x * denom_y), 3)

    return {
        "repo": repo,
        "path": path,
        "url": url,
        "rowCount": len(rows),
        "columnCount": len(columns),
        "columns": columns,
        "numericColumns": {name: len(values) for name, values in numeric_columns.items()},
        "categoricalColumns": {
            name: {"count": len(values), "values": values[:15]}
            for name, values in categorical_columns.items()
        },
        "numericSummary": {
            name: {
                "min": round(min(values), 4),
                "max": round(max(values), 4),
                "mean": round(sum(values) / len(values), 4),
            }
            for name, values in numeric_columns.items()
        },
        "correlations": _notable_correlations(numeric_columns, pearson),
    }


def _notable_correlations(numeric_columns: dict[str, list[float]], pearson) -> list[dict[str, Any]]:
    """Every pairwise correlation, strongest absolute first."""
    names = list(numeric_columns)
    pairs: list[dict[str, Any]] = []
    for index, left in enumerate(names):
        for right in names[index + 1 :]:
            left_values = numeric_columns[left]
            right_values = numeric_columns[right]
            size = min(len(left_values), len(right_values))
            value = pearson(left_values[:size], right_values[:size])
            if value is None:
                continue
            pairs.append({"a": left, "b": right, "r": value})
    pairs.sort(key=lambda item: -abs(item["r"]))
    return pairs[:8]


def sync() -> int:
    config = read_config()
    username = config["username"]
    print(f"github:sync {username}")

    profile = get_json(f"{API}/users/{username}")
    repos = get_json(f"{API}/users/{username}/repos?per_page=100&sort=updated")
    if not isinstance(repos, list):
        raise GithubSyncError("repository listing was not an array")

    excluded = set(config["exclude"])
    visible = [repo for repo in repos if repo["name"] not in excluded]
    print(f"  repositories: {len(repos)} total, {len(visible)} tracked")

    tracked_names = [repo["name"] for repo in visible]
    excluded_names = [repo["name"] for repo in repos if repo["name"] in excluded]
    # Measure languages for excluded repos too. Without this the language share
    # silently omits their bytes and overstates the remaining languages.
    languages = fetch_languages(username, tracked_names + excluded_names)
    commits = fetch_commit_months(username, tracked_names)

    year = config["contributionYear"]
    try:
        contributions = get_json(
            f"https://github-contributions-api.jogruber.de/v4/{username}?y={year}"
        )
    except GithubSyncError as error:
        print(f"  warn: contribution calendar unavailable: {error}")
        contributions = {"total": {}, "contributions": []}

    datasets: dict[str, Any] = {}
    for repo, path in DATASET_SOURCES.items():
        if repo in tracked_names:
            stats = fetch_dataset_stats(username, repo, path)
            if stats:
                datasets[repo] = stats
                print(f"  dataset {repo}: {stats['rowCount']} rows, {stats['columnCount']} columns")

    snapshot = {
        "username": username,
        "capturedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "profile": {
            "name": profile.get("name"),
            "bio": profile.get("bio"),
            "location": profile.get("location"),
            "blog": profile.get("blog"),
            "company": profile.get("company"),
            "publicRepos": profile.get("public_repos", 0),
            "publicGists": profile.get("public_gists", 0),
            "followers": profile.get("followers", 0),
            "following": profile.get("following", 0),
            "createdAt": profile.get("created_at"),
        },
        "contributionYear": year,
        "contributions": {
            "total": contributions.get("total", {}),
            "days": contributions.get("contributions", []),
        },
        "repositories": [
            {
                "name": repo["name"],
                "description": repo.get("description"),
                "language": repo.get("language"),
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "openIssues": repo.get("open_issues_count", 0),
                "topics": repo.get("topics", []),
                "homepage": repo.get("homepage") or "",
                "url": repo.get("html_url"),
                "pushedAt": repo.get("pushed_at"),
                "createdAt": repo.get("created_at"),
                "sizeKb": repo.get("size", 0),
                "archived": bool(repo.get("archived")),
                "isFork": bool(repo.get("fork")),
                "defaultBranch": repo.get("default_branch"),
                "hasPages": bool(repo.get("has_pages")),
                "platform": repo["name"] in set(config["platform"]),
                "featured": repo["name"] in set(config["featured"]),
                "languages": languages.get(repo["name"], {}),
                "commitMonths": commits.get(repo["name"], {}),
            }
            for repo in visible
        ],
        "datasets": datasets,
    }

    SNAPSHOT_PATH.write_text(
        json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    size = SNAPSHOT_PATH.stat().st_size
    print(f"  wrote {SNAPSHOT_PATH.relative_to(ROOT)} ({size} bytes)")
    return 0


def main() -> int:
    try:
        return sync()
    except GithubSyncError as error:
        print(f"github:sync FAILED: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
