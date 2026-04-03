"""
seed_db.py — Data pipeline + DB seeder for SkillSprint.

Parses Codeforces API data into the problems schema (matching roadmap),
maps difficulty ratings to Easy/Medium/Hard with numeric 1-10 scores,
and seeds the Neon DB via SQLAlchemy.

Usage:
    python data/seed_db.py              # Seed from Codeforces JSON
    python data/seed_db.py --dry-run    # Preview without DB writes
    python data/seed_db.py --limit 50   # Seed only 50 problems
"""

import asyncio
import json
import os
import sys
import argparse

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from config import get_settings, Base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from models.schemas import ProblemModel


# =====================
# Difficulty Mapping (per roadmap)
#   Easy   → 1–3  (Codeforces rating 800–1300)
#   Medium → 4–7  (Codeforces rating 1400–2000)
#   Hard   → 8–10 (Codeforces rating 2100+)
# =====================

def map_cf_rating_to_difficulty(rating: int) -> tuple:
    """
    Map Codeforces rating to (difficulty_label, difficulty_score).
    
    Codeforces ratings:
        800-1000   → easy, score 1
        1100-1200  → easy, score 2
        1300       → easy, score 3
        1400-1500  → medium, score 4
        1600-1700  → medium, score 5
        1800       → medium, score 6
        1900-2000  → medium, score 7
        2100-2200  → hard, score 8
        2300-2500  → hard, score 9
        2600+      → hard, score 10
    """
    if rating <= 1000:
        return "easy", 1
    elif rating <= 1200:
        return "easy", 2
    elif rating <= 1300:
        return "easy", 3
    elif rating <= 1500:
        return "medium", 4
    elif rating <= 1700:
        return "medium", 5
    elif rating <= 1800:
        return "medium", 6
    elif rating <= 2000:
        return "medium", 7
    elif rating <= 2200:
        return "hard", 8
    elif rating <= 2500:
        return "hard", 9
    else:
        return "hard", 10


def map_difficulty_to_xp(difficulty: str) -> int:
    """Map difficulty label to XP reward (per roadmap)."""
    return {
        "easy": 50,
        "medium": 100,
        "hard": 200,
        "boss": 500,
    }.get(difficulty, 50)


# =====================
# Tag → Skill Mapping
# =====================

TAG_TO_SKILLS = {
    "dp": ["algorithm", "problem_solving"],
    "dynamic programming": ["algorithm", "problem_solving"],
    "greedy": ["algorithm", "problem_solving"],
    "graphs": ["data_structures", "algorithm"],
    "trees": ["data_structures", "algorithm"],
    "binary search": ["algorithm", "efficiency"],
    "sortings": ["algorithm", "efficiency"],
    "math": ["algorithm", "problem_solving"],
    "number theory": ["algorithm", "problem_solving"],
    "strings": ["data_structures", "edge_cases"],
    "implementation": ["readability", "edge_cases"],
    "brute force": ["problem_solving"],
    "data structures": ["data_structures"],
    "constructive algorithms": ["algorithm", "problem_solving"],
    "dfs and similar": ["algorithm", "data_structures"],
    "bitmasks": ["algorithm", "efficiency"],
    "two pointers": ["algorithm", "efficiency"],
    "geometry": ["algorithm", "edge_cases"],
    "divide and conquer": ["algorithm", "efficiency"],
    "hashing": ["data_structures", "efficiency"],
}

VALID_SKILLS = {"algorithm", "data_structures", "efficiency", "edge_cases", "readability", "problem_solving"}


def tags_to_skills(tags: list) -> list:
    """Convert Codeforces tags to skill dimensions."""
    skills = set()
    for tag in tags:
        tag_lower = tag.lower()
        if tag_lower in TAG_TO_SKILLS:
            skills.update(TAG_TO_SKILLS[tag_lower])
    
    # Default skills if none mapped
    if not skills:
        skills = {"problem_solving"}
    
    return sorted(skills & VALID_SKILLS)


# =====================
# Codeforces Parser
# =====================

def parse_codeforces_data(filepath: str, limit: int = None) -> list:
    """
    Parse Codeforces API JSON into normalized problem records.
    
    Returns list of dicts matching ProblemModel schema.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if data.get("status") != "OK":
        print(f"Error: Codeforces data status is '{data.get('status')}'")
        return []
    
    problems = data["result"]["problems"]
    statistics = data["result"].get("problemStatistics", [])
    
    # Build solved-count lookup
    solved_map = {}
    for stat in statistics:
        key = f"{stat['contestId']}-{stat['index']}"
        solved_map[key] = stat.get("solvedCount", 0)
    
    parsed = []
    seen_ids = set()
    
    for prob in problems:
        # Skip problems without ratings (can't map difficulty)
        rating = prob.get("rating")
        if not rating:
            continue
        
        # Skip problems without tags
        tags = prob.get("tags", [])
        if not tags:
            continue
        
        contest_id = prob.get("contestId", 0)
        index = prob.get("index", "A")
        problem_id = f"cf-{contest_id}-{index}".lower()
        
        # Deduplicate
        if problem_id in seen_ids:
            continue
        seen_ids.add(problem_id)
        
        # Map difficulty
        difficulty, difficulty_score = map_cf_rating_to_difficulty(rating)
        
        # Build description
        name = prob.get("name", "Untitled")
        description = (
            f"{name}\n\n"
            f"This is a Codeforces problem (Contest {contest_id}, Problem {index}).\n\n"
            f"Rating: {rating}\n"
            f"Tags: {', '.join(tags)}\n\n"
            f"Solve this problem on Codeforces: "
            f"https://codeforces.com/contest/{contest_id}/problem/{index}"
        )
        
        # Build skills_tested from tags
        skills_tested = tags_to_skills(tags)
        
        # XP reward
        xp_reward = map_difficulty_to_xp(difficulty)
        
        # Starter code templates
        starter_code = {
            "python": f"# {name}\n# Difficulty: {difficulty} ({difficulty_score}/10)\n\ndef solve():\n    # Read input\n    # Your code here\n    pass\n\nsolve()",
            "javascript": f"// {name}\n// Difficulty: {difficulty} ({difficulty_score}/10)\n\nfunction solve() {{\n    // Read input\n    // Your code here\n}}\n\nsolve();",
            "cpp": f"// {name}\n// Difficulty: {difficulty} ({difficulty_score}/10)\n\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {{\n    // Your code here\n    return 0;\n}}",
        }
        
        # Basic test cases (Codeforces API doesn't provide test cases,
        # so we create placeholder entries)
        test_cases = [
            {"input": "sample input", "expected": "sample output", "is_hidden": False},
        ]
        
        # Solved count for ordering
        stat_key = f"{contest_id}-{index}"
        solved_count = solved_map.get(stat_key, 0)
        
        record = {
            "id": problem_id,
            "title": name,
            "description": description,
            "difficulty": difficulty,
            "difficulty_score": difficulty_score,
            "topics": [t.replace(" ", "_") for t in tags],  # Normalize tag names
            "skills_tested": skills_tested,
            "xp_reward": xp_reward,
            "time_limit_seconds": 10,
            "constraints": f"Codeforces Rating: {rating}",
            "starter_code": starter_code,
            "test_cases": test_cases,
            "examples": [],
            "hints": [],
            "source": "codeforces",
            "source_id": f"{contest_id}/{index}",
            "is_active": True,
            "_solved_count": solved_count,  # metadata, not stored
            "_rating": rating,  # metadata, not stored
        }
        
        parsed.append(record)
        
        if limit and len(parsed) >= limit:
            break
    
    # Sort by popularity (most solved first) to get the "best" problems
    parsed.sort(key=lambda x: x["_solved_count"], reverse=True)
    
    return parsed


# =====================
# DB Seeding
# =====================

async def seed_database(problems: list, dry_run: bool = False) -> int:
    """
    Seed problems into the Neon DB.
    
    Returns count of problems inserted.
    """
    settings = get_settings()
    
    if not settings.has_database:
        print("Error: No database configured. Set NEON_DB_URL in backend/.env")
        print("       Problems parsed but NOT seeded.")
        return 0
    
    if dry_run:
        print(f"[DRY RUN] Would insert {len(problems)} problems into database.")
        return len(problems)
    
    engine = create_async_engine(
        settings.async_database_url,
        echo=False,
        pool_pre_ping=True,
        connect_args={"ssl": True},
    )
    
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables ensured.")
    
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    inserted = 0
    skipped = 0
    
    async with SessionLocal() as session:
        for prob in problems:
            try:
                # Check if problem already exists
                from sqlalchemy import select
                result = await session.execute(
                    select(ProblemModel).where(ProblemModel.id == prob["id"])
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    skipped += 1
                    continue
                
                # Remove metadata keys
                record = {k: v for k, v in prob.items() if not k.startswith("_")}
                
                model = ProblemModel(**record)
                session.add(model)
                inserted += 1
                
                # Commit in batches of 50
                if inserted % 50 == 0:
                    await session.commit()
                    print(f"  Inserted {inserted} problems...")
                    
            except Exception as e:
                print(f"  Error inserting {prob['id']}: {e}")
                await session.rollback()
        
        # Final commit
        try:
            await session.commit()
        except Exception as e:
            print(f"Error on final commit: {e}")
            await session.rollback()
    
    await engine.dispose()
    
    print(f"\nSeeding complete: {inserted} inserted, {skipped} skipped (already existed)")
    return inserted


# =====================
# Main
# =====================

def print_summary(problems: list) -> None:
    """Print a summary of parsed problems."""
    print(f"\n{'='*60}")
    print(f"  PARSED PROBLEMS SUMMARY")
    print(f"{'='*60}")
    print(f"  Total: {len(problems)}")
    
    # Difficulty distribution
    diff_counts = {}
    for p in problems:
        d = p["difficulty"]
        diff_counts[d] = diff_counts.get(d, 0) + 1
    print(f"\n  Difficulty distribution:")
    for d in ["easy", "medium", "hard"]:
        count = diff_counts.get(d, 0)
        bar = "█" * (count // 5)
        print(f"    {d:8s}: {count:4d} {bar}")
    
    # Difficulty score distribution
    score_counts = {}
    for p in problems:
        s = p["difficulty_score"]
        score_counts[s] = score_counts.get(s, 0) + 1
    print(f"\n  Difficulty score distribution:")
    for s in range(1, 11):
        count = score_counts.get(s, 0)
        bar = "█" * (count // 3)
        print(f"    Score {s:2d}: {count:4d} {bar}")
    
    # Topic stats
    all_topics = []
    for p in problems:
        all_topics.extend(p["topics"])
    topic_counts = {}
    for t in all_topics:
        topic_counts[t] = topic_counts.get(t, 0) + 1
    top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    print(f"\n  Top 10 topics:")
    for topic, count in top_topics:
        print(f"    {topic:30s}: {count}")
    
    # Skills tested stats
    all_skills = []
    for p in problems:
        all_skills.extend(p["skills_tested"])
    skill_counts = {}
    for s in all_skills:
        skill_counts[s] = skill_counts.get(s, 0) + 1
    print(f"\n  Skills tested distribution:")
    for skill, count in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"    {skill:20s}: {count}")
    
    print(f"{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(description="Seed SkillSprint DB with problem data")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing to DB")
    parser.add_argument("--limit", type=int, default=250, help="Max problems to seed (default: 250)")
    parser.add_argument("--source", type=str, default="codeforces", choices=["codeforces"], help="Data source")
    parser.add_argument("--data-file", type=str, default=None, help="Path to Codeforces JSON file")
    args = parser.parse_args()
    
    # Determine data file path
    data_dir = os.path.dirname(__file__)
    
    if args.data_file:
        cf_file = args.data_file
    else:
        cf_file = os.path.join(data_dir, "codeforces_problems.json")
    
    if not os.path.exists(cf_file):
        print(f"Error: Data file not found: {cf_file}")
        print("Run: python data/fetch_codeforces.py  (or)")
        print("     curl 'https://codeforces.com/api/problemset.problems' -o data/codeforces_problems.json")
        sys.exit(1)
    
    print(f"Source: {args.source}")
    print(f"Data file: {cf_file}")
    print(f"Limit: {args.limit}")
    print(f"Dry run: {args.dry_run}")
    
    # Parse
    problems = parse_codeforces_data(cf_file, limit=args.limit)
    
    if not problems:
        print("No problems parsed. Check the data file.")
        sys.exit(1)
    
    print_summary(problems)
    
    # Seed
    if args.dry_run:
        print(f"[DRY RUN] Would seed {len(problems)} problems. No DB changes made.")
    else:
        count = asyncio.run(seed_database(problems, dry_run=args.dry_run))
        print(f"\nDone. {count} problems seeded to database.")


if __name__ == "__main__":
    main()
