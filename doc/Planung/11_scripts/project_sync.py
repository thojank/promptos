#!/usr/bin/env python3
"""
Sync GitHub Issues into a GitHub Project (Projects v2) and set custom fields.

- Reads created_issues.json (output from bulk_create_issues.py)
- Adds issues to the Project if missing
- Sets fields: Status, Epic, Week, Priority, Area based on labels (epic:*, week:*, prio:*, area:*)

Requirements:
- GITHUB_TOKEN with scopes: repo (or public_repo) + project
- Project is Projects v2 (GraphQL)

Usage:
  export GITHUB_TOKEN="..."
  python3 project_sync.py \
    --created /Users/.../doc/Planung/10_issues/created_issues.json \
    --repo thojank/promptos

Optional:
  --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import urllib.request
import urllib.error

REST_API = "https://api.github.com"
GQL_API = "https://api.github.com/graphql"


# ---- CONFIG: PromptOS Project + Field IDs ----
PROJECT_ID = "PVT_kwHOC0214c4BOVtt"

FIELD_STATUS = "PVTSSF_lAHOC0214c4BOVttzg9EhS0"
FIELD_EPIC = "PVTSSF_lAHOC0214c4BOVttzg9EivE"
FIELD_WEEK = "PVTSSF_lAHOC0214c4BOVttzg9EixE"
FIELD_PRIORITY = "PVTSSF_lAHOC0214c4BOVttzg9Ei0w"
FIELD_AREA = "PVTSSF_lAHOC0214c4BOVttzg9Ei3Y"

STATUS_OPTIONS = {
    "Backlog": "f75ad846",
    "Ready": "47fc9ee4",
    "In Progress": "98236657",
    "Review": "a65b5864",
    "Done": "c67d47d7",
}

EPIC_OPTIONS = {
    "E-001": "66a2febd",
    "E-002": "d2924680",
    "E-003": "a5289fef",
    "E-004": "55234d08",
}

WEEK_OPTIONS = {"1": "e4a2f98c", "2": "37faa261", "3": "2f8f4728", "4": "db53113f"}

PRIO_OPTIONS = {"P0": "f3cab737", "P1": "09c37dac"}

AREA_OPTIONS = {"FE": "3af6e5ea", "BE": "9ad7a554", "DB": "44e36e32", "Ops": "3deaf4a0"}

DEFAULT_STATUS = "Backlog"
DEFAULT_SLEEP = 0.25


# ---- HTTP helpers ----
def _rest_request(method: str, url: str, token: str, payload: Optional[dict] = None) -> Any:
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "promptos-project-sync",
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
        raise RuntimeError(f"REST error {e.code} for {url}\n{detail}") from e


def _gql_request(token: str, query: str, variables: Optional[dict] = None) -> dict:
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "promptos-project-sync",
    }
    payload = {"query": query, "variables": variables or {}}
    req = urllib.request.Request(GQL_API, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            data = json.loads(body) if body else {}
            if "errors" in data:
                raise RuntimeError(f"GraphQL errors: {json.dumps(data['errors'], indent=2)}")
            return data["data"]
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"GQL error {e.code}\n{detail}") from e


# ---- Project queries/mutations ----
def fetch_project_items(token: str) -> Dict[str, str]:
    """
    Returns mapping: issue_node_id -> project_item_id
    """
    mapping: Dict[str, str] = {}
    cursor = None

    q = """
    query($projectId: ID!, $after: String) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 100, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              content {
                ... on Issue { id number title }
              }
            }
          }
        }
      }
    }
    """

    while True:
        data = _gql_request(token, q, {"projectId": PROJECT_ID, "after": cursor})
        items = data["node"]["items"]
        for n in items["nodes"]:
            content = n.get("content")
            if content and content.get("id"):
                mapping[content["id"]] = n["id"]

        if not items["pageInfo"]["hasNextPage"]:
            break
        cursor = items["pageInfo"]["endCursor"]

    return mapping


def add_issue_to_project(token: str, issue_node_id: str) -> str:
    m = """
    mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item { id }
      }
    }
    """
    data = _gql_request(token, m, {"projectId": PROJECT_ID, "contentId": issue_node_id})
    return data["addProjectV2ItemById"]["item"]["id"]


def set_single_select(token: str, item_id: str, field_id: str, option_id: str) -> None:
    m = """
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId,
        itemId: $itemId,
        fieldId: $fieldId,
        value: { singleSelectOptionId: $optionId }
      }) {
        projectV2Item { id }
      }
    }
    """
    _gql_request(token, m, {"projectId": PROJECT_ID, "itemId": item_id, "fieldId": field_id, "optionId": option_id})


# ---- Label parsing ----
def parse_labels(labels: List[str]) -> Dict[str, str]:
    """
    Expects labels like:
      epic:E-002, week:2, prio:P0, area:FE
    Returns dict with keys: epic, week, prio, area
    """
    out: Dict[str, str] = {}
    for l in labels:
        if l.startswith("epic:"):
            out["epic"] = l.split(":", 1)[1]
        elif l.startswith("week:"):
            out["week"] = l.split(":", 1)[1]
        elif l.startswith("prio:"):
            out["prio"] = l.split(":", 1)[1]
        elif l.startswith("area:"):
            out["area"] = l.split(":", 1)[1]
    return out


def issue_node_id(owner: str, repo: str, token: str, number: int) -> str:
    url = f"{REST_API}/repos/{owner}/{repo}/issues/{number}"
    data = _rest_request("GET", url, token)
    nid = data.get("node_id")
    if not nid:
        raise RuntimeError(f"Missing node_id for issue #{number}")
    return nid


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--created", required=True, help="Path to created_issues.json")
    parser.add_argument("--repo", required=True, help="owner/repo (used to fetch issue node_id)")
    parser.add_argument("--status", default=DEFAULT_STATUS, help="Default Status value (Backlog/Ready/...)")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--sleep", type=float, default=DEFAULT_SLEEP)
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    if not token and not args.dry_run:
        raise SystemExit("Missing env var GITHUB_TOKEN")

    owner, repo = args.repo.split("/", 1)
    created_path = Path(args.created).expanduser().resolve()
    raw = json.loads(created_path.read_text(encoding="utf-8"))
    created = raw.get("created", [])
    if not created:
        raise SystemExit("created_issues.json has no created entries")

    # 1) Fetch current project items to avoid duplicates
    print("Fetching existing project items...")
    existing_map = {} if args.dry_run else fetch_project_items(token)
    print(f"Existing items: {len(existing_map)}")

    # 2) For each created issue: add if missing, then set fields
    status_value = args.status
    status_opt = STATUS_OPTIONS.get(status_value)
    if not status_opt:
        raise SystemExit(f"Unknown --status '{status_value}'. Allowed: {list(STATUS_OPTIONS.keys())}")

    added = 0
    skipped = 0
    updated_fields = 0
    errors: List[dict] = []

    for item in created:
        try:
            title = item["title"]
            number = int(item["number"])
            labels = item.get("labels", [])  # already returned from issue creation response

            # ensure node_id (GraphQL contentId)
            nid = "I_" + item.get("node_id", "")  # not present in our created_issues.json by default
            # we fetch node_id via REST anyway (reliable)
            if args.dry_run:
                issue_nid = f"(node_id for #{number})"
            else:
                issue_nid = issue_node_id(owner, repo, token, number)

            # already in project?
            if not args.dry_run and issue_nid in existing_map:
                project_item_id = existing_map[issue_nid]
                skipped += 1
                print(f"SKIP (already in project): #{number} {title}")
            else:
                if args.dry_run:
                    project_item_id = "(new_item_id)"
                    print(f"ADD: #{number} {title}")
                else:
                    project_item_id = add_issue_to_project(token, issue_nid)
                    existing_map[issue_nid] = project_item_id
                    added += 1
                    print(f"ADDED: #{number} {title} -> item {project_item_id}")
                    time.sleep(args.sleep)

            # parse labels -> field values
            parsed = parse_labels(labels)

            # set Status
            if args.dry_run:
                print(f"  set Status={status_value}")
            else:
                set_single_select(token, project_item_id, FIELD_STATUS, status_opt)
                updated_fields += 1
                time.sleep(args.sleep)

            # set Epic/Week/Priority/Area if present
            if "epic" in parsed and parsed["epic"] in EPIC_OPTIONS:
                if args.dry_run:
                    print(f"  set Epic={parsed['epic']}")
                else:
                    set_single_select(token, project_item_id, FIELD_EPIC, EPIC_OPTIONS[parsed["epic"]])
                    updated_fields += 1
                    time.sleep(args.sleep)

            if "week" in parsed and parsed["week"] in WEEK_OPTIONS:
                if args.dry_run:
                    print(f"  set Week={parsed['week']}")
                else:
                    set_single_select(token, project_item_id, FIELD_WEEK, WEEK_OPTIONS[parsed["week"]])
                    updated_fields += 1
                    time.sleep(args.sleep)

            if "prio" in parsed and parsed["prio"] in PRIO_OPTIONS:
                if args.dry_run:
                    print(f"  set Priority={parsed['prio']}")
                else:
                    set_single_select(token, project_item_id, FIELD_PRIORITY, PRIO_OPTIONS[parsed["prio"]])
                    updated_fields += 1
                    time.sleep(args.sleep)

            if "area" in parsed and parsed["area"] in AREA_OPTIONS:
                if args.dry_run:
                    print(f"  set Area={parsed['area']}")
                else:
                    set_single_select(token, project_item_id, FIELD_AREA, AREA_OPTIONS[parsed["area"]])
                    updated_fields += 1
                    time.sleep(args.sleep)

        except Exception as e:
            errors.append({"title": item.get("title"), "number": item.get("number"), "error": str(e)})

    print("----")
    print(f"Added: {added} | Skipped(already in project): {skipped} | Field updates: {updated_fields} | Errors: {len(errors)}")
    if errors:
        print(json.dumps(errors, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
