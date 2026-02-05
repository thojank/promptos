#!/usr/bin/env python3
"""
Bulk update existing GitHub issues from JSON.

Requires created_issues.json (output of bulk_create_issues.py).

Usage:
  export GITHUB_TOKEN="ghp_..."
  python3 scripts/bulk_update_issues.py --input doc/Planung/10_issues/week2.json

Behavior:
- matches issues by exact title in created_issues.json
- PATCH title/body/labels for each matched issue
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import urllib.request
import urllib.error

GITHUB_API = "https://api.github.com"


def _request(method: str, url: str, token: str, payload: Optional[dict] = None) -> dict:
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "promptos-bulk-issues",
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


def load_input(path: Path) -> Tuple[str, List[str], List[Dict[str, Any]]]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    repo = raw.get("meta", {}).get("repo")
    if not repo or "/" not in repo:
        raise ValueError("meta.repo missing or invalid (expected 'owner/repo')")
    default_labels = raw.get("meta", {}).get("default_labels", [])
    issues = raw.get("issues", [])
    if not isinstance(issues, list) or not issues:
        raise ValueError("issues must be a non-empty list")
    return repo, default_labels, issues


def load_created(path: Path) -> Dict[str, int]:
    created_path = path.with_name("created_issues.json")
    raw = json.loads(created_path.read_text(encoding="utf-8"))
    mapping: Dict[str, int] = {}
    for item in raw.get("created", []):
        mapping[item["title"]] = int(item["number"])
    return mapping


def update_issue(owner: str, repo: str, token: str, number: int, title: str, body: str, labels: List[str]) -> dict:
    url = f"{GITHUB_API}/repos/{owner}/{repo}/issues/{number}"
    payload = {"title": title, "body": body, "labels": labels}
    return _request("PATCH", url, token, payload)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to issues JSON")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    if not token and not args.dry_run:
        raise SystemExit("Missing env var GITHUB_TOKEN")

    input_path = Path(args.input).expanduser().resolve()
    repo_full, default_labels, issues = load_input(input_path)
    owner, repo = repo_full.split("/", 1)
    title_to_number = load_created(input_path)

    updated = 0
    skipped = 0
    errors: List[dict] = []

    for item in issues:
        title = item.get("title", "").strip()
        if not title:
            continue
        number = title_to_number.get(title)
        labels = list(dict.fromkeys(default_labels + item.get("labels", [])))

        if not number:
            skipped += 1
            continue

        if args.dry_run:
            print(f"Would update #{number}: {title}")
            continue

        try:
            update_issue(owner, repo, token, number, title, item.get("body", ""), labels)
            updated += 1
        except Exception as e:
            errors.append({"title": title, "number": number, "error": str(e)})

    print(f"Updated: {updated}, Skipped (not found): {skipped}, Errors: {len(errors)}")
    if errors:
        print(json.dumps(errors, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
