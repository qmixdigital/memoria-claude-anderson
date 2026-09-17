#!/usr/bin/env python3
"""Append an existing roll JSON to the registry. Use when you generated a roll
manually (without scripts/roll.py) and want to record it.

Usage:
    python scripts/append_roll.py < roll.json
    cat my-roll.json | python scripts/append_roll.py

Input must be valid JSON matching the entry schema:
{
  "portal": "domain.com",
  "theme": "GeneratePress",
  "vps": "h-anderson",
  "niche": "regional",
  "neighbors": ["a.com", "b.com"],
  "generated_at": "2026-05-01T10:00:00",
  "roll": { "archetype": "A", "class_naming": "bem", ... }
}
"""
import json
import sys
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "data" / "fingerprint-rolls.json"

def main():
    raw = sys.stdin.read()
    if not raw.strip():
        sys.exit("No JSON on stdin")
    entry = json.loads(raw)
    required = {"portal", "roll"}
    missing = required - set(entry.keys())
    if missing:
        sys.exit(f"Missing required fields: {missing}")

    with DB_PATH.open(encoding="utf-8") as f:
        db = json.load(f)
    db.setdefault("rolls", []).append(entry)
    with DB_PATH.open("w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    print(f"Appended {entry['portal']} to {DB_PATH}", file=sys.stderr)


if __name__ == "__main__":
    main()
