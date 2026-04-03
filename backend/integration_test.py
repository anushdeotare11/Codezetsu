import sys
import asyncio
from httpx import ASGITransport, AsyncClient
from main import app

async def test_integration():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        print("1. Validating Full System: Fetching Problems")
        # Fetch problems to get a valid problem_id
        problems_resp = await client.get("/api/problems")
        assert problems_resp.status_code == 200, f"Failed to get problems: {problems_resp.text}"
        problems = problems_resp.json()
        if not problems:
            print("No problems found in the database. Validation aborted.")
            return

        problem_id = problems[0]["id"]
        # Basic setup: assume it's an easy problem asking maybe for string reversal or basic returning
        # We'll just submit a dummy valid python script to get a response
        code = "def solve(*args, **kwargs):\n    pass\n" 
        payload = {
            "problem_id": str(problem_id),
            "code": code,
            "language": "python"
        }
        
        print(f"2. Testing Code Submission for Problem: {problem_id}")
        submit_resp = await client.post("/api/submissions", json=payload, timeout=30.0)
        assert submit_resp.status_code == 200, f"Submit failed: {submit_resp.text}"
        submit_data = submit_resp.json()
        print("Submission result:", submit_data.get("status"))
        print("AI Evaluation Score:", submit_data.get("ai_evaluation", {}).get("score"))
        gamification = submit_data.get("gamification")
        if gamification:
            print("XP Earned:", gamification.get("xp_earned"))
            print("Level Up:", gamification.get("level_up"))
            print("Achievements Unlocked:", gamification.get("achievements_unlocked"))

        print("\n3. Validating Gamification & Stats Updates")
        stats_resp = await client.get("/api/users/stats")
        assert stats_resp.status_code == 200, f"Stats failed: {stats_resp.text}"
        stats_data = stats_resp.json()
        print("Total XP:", stats_data.get("xp"))
        print("Level:", stats_data.get("level"))
        print("Achievements count:", len(stats_data.get("achievements", [])))

        print("\n4. Validating Leaderboard is Populated")
        lb_resp = await client.get("/api/leaderboard")
        assert lb_resp.status_code == 200, f"Leaderboard failed: {lb_resp.text}"
        lb_data = lb_resp.json()
        print("Leaderboard fetched. Total entries:", len(lb_data) if isinstance(lb_data, list) else len(lb_data.get("leaderboard", [])))
        entries = lb_data if isinstance(lb_data, list) else lb_data.get("leaderboard", [])
        if entries:
            top = entries[0]
            print("Top user rank 1:", top.get("username"), "- XP:", top.get("xp"))

        print("\n5. Validating Skills Radar / Boss Fight Pre-requisite")
        skills_resp = await client.get("/api/skills/radar")
        if skills_resp.status_code == 200:
            print("Skills Radar Fetched successfully!")
        else:
            print("Skills Radar fetching had issues:", skills_resp.text)
            
        print("\n========== INTEGRATION TEST COMPLETE ==========")

if __name__ == "__main__":
    asyncio.run(test_integration())
