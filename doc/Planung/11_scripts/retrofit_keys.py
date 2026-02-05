#!/usr/bin/env python3
"""
Retrofit issue keys into existing issues created earlier.

Reads:
- week2.json (must contain item.key + item.title)
- created_issues.json (contains created[].title + created[].number)

Does:
- Build key->issue_number mapping by matching on title once (only for retrofit)
- PATCH each issue body to ensure it contains <!-- issue_key: KEY -->
- Write back created_issues.json with "key_to_number" mapping

Usage:
  export GITHUB_TOKEN="..."
  python3 retrofit_keys.py \
    --input /Users/.../doc/Planung/10_issues/week2.json \
    --repo thojank/promptos \
    --dry-run

  python3 retrofit_keys.py \
    --input /Users/.../doc/Planung/10_issues/week2.json \
    --repo thojank/promptos
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import urllib.request
import urllib.error

API = "https://api.github.com"


def _request(method: str, url: str, token: str, payload: Optional[dict] = None) -> Any:
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "promptos-retrofit-keys",
    }
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"GitHub API error {e.code} for {url}\n{detail}") from e


def ensure_marker(body: str, key: str) -> str:
    marker = f"<!-- issue_key: {key} -->"
    if marker in body:
        return body
    return body.rstrip() + "\n\n" + marker + "\n"


def load_week_input(path: Path) -> dict:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if "issues" not in raw or not isinstance(raw["issues"], list):
        raise ValueError("week json must contain issues[]")
    return raw


def load_created(path: Path) -> dict:
    created_path = path.with_name("created_issues.json")
    return json.loads(created_path.read_text(encoding="utf-8"))


def write_created(path: Path, data: dict) -> None:
    created_path = path.with_name("created_issues.json")
    created_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to week2.json")
    parser.add_argument("--repo", required=True, help="owner/repo, e.g. thojank/promptos")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    if not token and not args.dry_run:
        raise SystemExit("Missing env var GITHUB_TOKEN")

    week_path = Path(args.input).expanduser().resolve()
    week = load_week_input(week_path)
    created = load_created(week_path)

    owner, repo = args.repo.split("/", 1)

    # Build title -> number from created_issues.json
    title_to_number: Dict[str, int] = {}
    for c in created.get("created", []):
        if "title" in c and "number" in c:
            title_to_number[str(c["title"])] = int(c["number"])

    # Build key -> number by matching titles ONCE (retrofit only)
    key_to_number: Dict[str, int] = {}
    missing: List[dict] = []
    duplicates: Dict[str, List[str]] = {}

    for item in week["issues"]:
        key = str(item.get("key", "")).strip()
        title = str(item.get("title", "")).strip()
        if not key or not title:
            missing.append({"key": key, "title": title, "reason": "missing key or title"})
            continue

        num = title_to_number.get(title)
        if not num:
            missing.append({"key": key, "title": title, "reason": "title not found in created_issues.json"})
            continue

        if key in key_to_number:
            duplicates.setdefault(key, []).append(title)
        key_to_number[key] = num

    if duplicates:
        raise SystemExit(f"Duplicate keys in week input: {duplicates}")

    if missing:
        print("WARN: Some issues could not be matched (will be skipped):")
        print(json.dumps(missing, indent=2, ensure_ascii=False))

    # Patch each issue body to include marker
    patched = 0
    skipped = 0
    errors: List[dict] = []

    for item in week["issues"]:
        key = str(item.get("key", "")).strip()
        title = str(item.get("title", "")).strip()
        num = key_to_number.get(key)
        if not key or not title or not num:
            skipped += 1
            continue

        if args.dry_run:
            print(f"Would patch #{num} [{key}] {title}")
            patched += 1
            continue

        try:
            issue_url = f"{API}/repos/{owner}/{repo}/issues/{num}"
            issue = _request("GET", issue_url, token)
            current_body = issue.get("body") or ""
            new_body = ensure_marker(current_body, key)

            if new_body == current_body:
                print(f"OK (marker exists): #{num} [{key}]")
                continue

            _request("PATCH", issue_url, token, {"body": new_body})
            print(f"PATCHED: #{num} [{key}]")
            patched += 1
        except Exception as e:
            errors.append({"key": key, "number": num, "title": title, "error": str(e)})

    # Persist key_to_number mapping
    created["key_to_number"] = created.get("key_to_number", {})
    created["key_to_number"].update(key_to_number)

    # Also enrich created[].key if possible
    key_by_title = {str(i.get("title")): str(i.get("key")) for i in week["issues"] if i.get("key") and i.get("title")}
    for c in created.get("created", []):
        t = str(c.get("title"))
        if t in key_by_title:
            c["key"] = key_by_title[t]

    if not args.dry_run:
        write_created(week_path, created)

    print("----")
    print(f"Patched: {patched} | Skipped: {skipped} | Errors: {len(errors)}")
    if not args.dry_run:
        print(f"Updated mapping written to: {week_path.with_name('created_issues.json')}")
    if errors:
        print(json.dumps(errors, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
