"""
Fetch Codeforces problems from the official API.

Downloads problem data and saves to data/codeforces_problems.json.
This is a standalone utility — run it directly.
"""

import json
import os
import sys
import urllib.request
import urllib.error

CODEFORCES_API_URL = "https://codeforces.com/api/problemset.problems"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "codeforces_problems.json")


def fetch_codeforces_problems() -> dict:
    """Fetch problems from Codeforces API."""
    print(f"Fetching problems from {CODEFORCES_API_URL}...")
    
    try:
        req = urllib.request.Request(
            CODEFORCES_API_URL,
            headers={"User-Agent": "SkillSprint/1.0"}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as e:
        print(f"Error fetching data: {e}")
        sys.exit(1)
    
    if data.get("status") != "OK":
        print(f"API returned non-OK status: {data.get('status')}")
        sys.exit(1)
    
    return data


def save_data(data: dict, output_path: str) -> None:
    """Save data to JSON file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    file_size = os.path.getsize(output_path)
    print(f"Saved to {output_path} ({file_size:,} bytes)")


def main():
    data = fetch_codeforces_problems()
    
    problems = data.get("result", {}).get("problems", [])
    statistics = data.get("result", {}).get("problemStatistics", [])
    
    print(f"Fetched {len(problems)} problems and {len(statistics)} statistics entries")
    
    save_data(data, OUTPUT_FILE)
    
    # Print summary
    rated = [p for p in problems if p.get("rating")]
    print(f"\nSummary:")
    print(f"  Total problems: {len(problems)}")
    print(f"  With ratings: {len(rated)}")
    print(f"  Rating range: {min(p['rating'] for p in rated)} - {max(p['rating'] for p in rated)}")
    
    # Tag distribution
    all_tags = []
    for p in problems:
        all_tags.extend(p.get("tags", []))
    unique_tags = set(all_tags)
    print(f"  Unique tags: {len(unique_tags)}")
    print(f"  Top tags: {', '.join(sorted(unique_tags)[:10])}")


if __name__ == "__main__":
    main()
