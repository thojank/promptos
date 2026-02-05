#!/usr/bin/env python3
"""
Bulk create GitHub issues from a JSON file (with stable issue keys).

Usage:
  export GITHUB_TOKEN="..."
  python3 bulk_create_issues.py --input /path/to/week2.json

Writes:
  - created_issues.json next to input file
    contains key->number mapping for robust updates
"""

from __future__ import annotations

import argparse
import json
import os
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import urllib.request
import urllib.error

GITHUB_API = "https://api.github.com"


@dataclass
class CreatedIssue:
    key: str
    title: str
    number: int
    url: str
    labels: List[str]


def _request(method: str, url: str, token: str, payload: Optional[dict] = None) -> Any:
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


def create_issue(owner: str, repo: str, token: str, title: str, body: str, labels: List[str]) -> dict:
    url = f"{GITHUB_API}/repos/{owner}/{repo}/issues"
    payload = {"title": title, "body": body, "labels": labels}
    return _request("POST", url, token, payload)


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


def ensure_key_marker(body: str, key: str) -> str:
    marker = f"<!-- issue_key: {key} -->"
    if marker in body:
        return body
    body = body.rstrip() + "\n\n" + marker + "\n"
    return body


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to issues JSON")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be created, don't call API")
    parser.add_argument("--sleep", type=float, default=0.35, help="Sleep between API calls (seconds)")
    parser.add_argument(
        "--created-out",
        default=None,
        help=(
            "Optional output path for created mapping JSON (e.g. created_week1.json). "
            "Default: created_issues.json next to input."
        ),
    )
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    if not token and not args.dry_run:
        raise SystemExit("Missing env var GITHUB_TOKEN")

    input_path = Path(args.input).expanduser().resolve()
    repo_full, default_labels, issues = load_input(input_path)
    owner, repo = repo_full.split("/", 1)

    created: List[CreatedIssue] = []
    errors: List[dict] = []
    key_to_number: Dict[str, int] = {}

    print(f"Repo: {repo_full}")
    print(f"Default labels: {default_labels}")
    print(f"Issues to create: {len(issues)}")
    print("----")

    for idx, item in enumerate(issues, start=1):
        key = str(item.get("key", "")).strip()
        title = str(item.get("title", "")).strip()
        body = str(item.get("body", ""))
        labels = list(dict.fromkeys(default_labels + item.get("labels", [])))  # dedupe preserve order

        if not key:
            errors.append({"index": idx, "title": title, "error": "Missing key (add item.key)"})
            continue
        if not title:
            errors.append({"index": idx, "key": key, "error": "Missing title"})
            continue
        if key in key_to_number:
            errors.append({"index": idx, "key": key, "title": title, "error": "Duplicate key in input"})
            continue

        body = ensure_key_marker(body, key)

        print(f"[{idx}/{len(issues)}] Creating: {title}")
        print(f"  key: {key}")
        print(f"  labels: {labels}")

        if args.dry_run:
            continue

        try:
            resp = create_issue(owner, repo, token, title, body, labels)
            created.append(
                CreatedIssue(
                    key=key,
                    title=title,
                    number=resp["number"],
                    url=resp["html_url"],
                    labels=[l["name"] for l in resp.get("labels", [])],
                )
            )
            key_to_number[key] = int(resp["number"])
            time.sleep(args.sleep)
        except Exception as e:
            errors.append({"index": idx, "key": key, "title": title, "error": str(e)})

    out = {
        "meta": {
            "repo": repo_full,
            "source": str(input_path),
            "created_count": len(created),
            "error_count": len(errors),
        },
        "created": [c.__dict__ for c in created],
        "key_to_number": key_to_number,
        "errors": errors,
    }

    if args.created_out:
        out_path = Path(args.created_out).expanduser().resolve()
    else:
        out_path = input_path.with_name("created_issues.json")
    out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")

    print("----")
    print(f"Created: {len(created)} | Errors: {len(errors)}")
    print(f"Wrote: {out_path}")


if __name__ == "__main__":
    main()
