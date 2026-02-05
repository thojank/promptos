#!/usr/bin/env python3
"""
Create standard labels in a GitHub repo (idempotent).

Usage:
  export GITHUB_TOKEN="..."
  python3 create_labels.py --repo thojank/promptos

Notes:
- Requires token with permission to manage issues/labels on the repo.
- Skips labels that already exist.
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.request
import urllib.error
from typing import Dict, List, Tuple

GITHUB_API = "https://api.github.com"


def _request(method: str, url: str, token: str, payload: dict | None = None) -> dict:
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "promptos-label-bootstrap",
    }
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"GitHub API error {e.code} for {url}\n{detail}") from e


def list_existing_labels(owner: str, repo: str, token: str) -> Dict[str, dict]:
    existing: Dict[str, dict] = {}
    page = 1
    per_page = 100

    while True:
        url = f"{GITHUB_API}/repos/{owner}/{repo}/labels?per_page={per_page}&page={page}"
        data = _request("GET", url, token)
        if not isinstance(data, list):
            # GitHub returns list for this endpoint
            raise RuntimeError(f"Unexpected response for labels list: {data}")

        for item in data:
            name = item.get("name")
            if name:
                existing[name] = item

        if len(data) < per_page:
            break
        page += 1

    return existing


def create_label(owner: str, repo: str, token: str, name: str, color: str, description: str) -> dict:
    url = f"{GITHUB_API}/repos/{owner}/{repo}/labels"
    payload = {
        "name": name,
        "color": color.lstrip("#"),
        "description": description,
    }
    return _request("POST", url, token, payload)


def standard_labels() -> List[Tuple[str, str, str]]:
    """
    Returns list of (name, color, description).
    Colors are hex without '#'.
    """
    labels: List[Tuple[str, str, str]] = []

    # Epics
    epic_color = "1D76DB"  # blue
    for e in ["E-001", "E-002", "E-003", "E-004"]:
        labels.append((f"epic:{e}", epic_color, f"Epic {e}"))

    # Weeks
    week_color = "BFDADC"  # light teal
    for w in ["1", "2", "3", "4"]:
        labels.append((f"week:{w}", week_color, f"MVP week {w}"))

    # Priority
    labels.append(("prio:P0", "D93F0B", "Must-have for MVP"))  # orange/red
    labels.append(("prio:P1", "FBCA04", "Post-MVP / next iteration"))  # yellow

    # Areas
    labels.append(("area:FE", "C2E0C6", "Frontend"))  # light green
    labels.append(("area:BE", "F9D0C4", "Backend/API"))  # light salmon
    labels.append(("area:DB", "D4C5F9", "Database/Supabase"))  # light purple
    labels.append(("area:Ops", "EDEDED", "Ops/Monitoring/Infra"))  # gray

    # Optional helpful labels
    labels.append(("type:bug", "B60205", "Bug / Fix"))
    labels.append(("type:chore", "6A737D", "Chore / Maintenance"))
    labels.append(("type:doc", "0E8A16", "Documentation"))
    labels.append(("blocked", "000000", "Blocked by dependency"))

    return labels


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True, help="owner/repo, e.g. thojank/promptos")
    parser.add_argument("--dry-run", action="store_true", help="Print changes without calling API")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    if not token and not args.dry_run:
        raise SystemExit("Missing env var GITHUB_TOKEN")

    if "/" not in args.repo:
        raise SystemExit("Invalid --repo. Expected owner/repo")

    owner, repo = args.repo.split("/", 1)

    if args.dry_run:
        print("[dry-run] Would create the following labels (if missing):")
        for name, color, desc in standard_labels():
            print(f" - {name} #{color} : {desc}")
        return

    existing = list_existing_labels(owner, repo, token)
    to_create = standard_labels()

    created = 0
    skipped = 0
    errors: List[dict] = []

    for name, color, desc in to_create:
        if name in existing:
            skipped += 1
            continue
        try:
            create_label(owner, repo, token, name, color, desc)
            created += 1
            print(f"Created label: {name}")
        except Exception as e:
            errors.append({"label": name, "error": str(e)})

    print("----")
    print(f"Created: {created}, Skipped(existing): {skipped}, Errors: {len(errors)}")
    if errors:
        print(json.dumps(errors, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
