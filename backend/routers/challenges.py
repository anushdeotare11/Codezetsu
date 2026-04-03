"""Challenges API router - Adaptive challenge generation."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_db
from models.schemas import SubmissionModel, SubmissionStatus
from services.challenge_generator import generate_ai_problem
from services.skill_analyzer import analyze_skills
from routers.problems import SAMPLE_PROBLEMS

router = APIRouter(prefix="/api/challenge", tags=["challenges"])

# Thread pool for async AI calls
_executor = ThreadPoolExecutor(max_workers=2)

# Mock user ID for development
MOCK_USER_ID = "dev-user-001"


class ChallengeRequest(BaseModel):
    """Request for next challenge."""
    user_id: Optional[str] = None
    target_weakness: Optional[str] = None
    difficulty: Optional[str] = None


class GeneratedProblem(BaseModel):
    """AI-generated problem response."""
    title: str
    description: str
    examples: List[dict] = []
    tags: List[str] = []
    difficulty: str = "medium"
    is_generated: bool = True


class NextChallengeResponse(BaseModel):
    """Response with next challenge and reasoning."""
    problem: GeneratedProblem
    target_weakness: str
    reason: str


async def _get_user_weakness(user_id: str, db: AsyncSession) -> tuple[str, dict]:
    """Analyze user's recent submissions to find their primary weakness."""
    default_weakness = "problem_solving"
    default_scores = {
        "algorithm_knowledge": 5,
        "data_structures": 5,
        "code_efficiency": 5,
        "edge_cases": 5,
        "readability": 5,
        "problem_solving": 5
    }
    
    try:
        # Get recent accepted submissions with AI evaluation
        result = await db.execute(
            select(SubmissionModel)
            .where(SubmissionModel.user_id == user_id)
            .order_by(SubmissionModel.created_at.desc())
            .limit(10)
        )
        submissions = result.scalars().all()
        
        if not submissions:
            return default_weakness, default_scores
        
        # Aggregate skill scores from all submissions
        aggregated_scores = {k: [] for k in default_scores.keys()}
        
        for sub in submissions:
            # In real implementation, we'd store AI evaluation in the submission
            # For now, use analyze_skills with mock evaluation
            mock_eval = {"skill_scores": default_scores}
            analysis = analyze_skills(mock_eval)
            
            for skill, score in analysis.get("skill_scores", {}).items():
                if skill in aggregated_scores:
                    aggregated_scores[skill].append(score)
        
        # Calculate averages and find the weakest skill
        avg_scores = {}
        for skill, scores in aggregated_scores.items():
            avg_scores[skill] = sum(scores) / len(scores) if scores else 5
        
        if avg_scores:
            primary_weakness = min(avg_scores, key=avg_scores.get)
            return primary_weakness, avg_scores
        
        return default_weakness, default_scores
        
    except Exception as e:
        print(f"Error analyzing user weakness: {e}")
        return default_weakness, default_scores


@router.post("/next", response_model=NextChallengeResponse)
async def get_next_challenge(
    request: ChallengeRequest = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get the next adaptive challenge based on user's weaknesses.
    
    The AI analyzes the user's recent submissions and generates a 
    problem that targets their identified weaknesses.
    """
    if request is None:
        request = ChallengeRequest()
    
    user_id = request.user_id or MOCK_USER_ID
    
    # Determine target weakness
    if request.target_weakness:
        target_weakness = request.target_weakness
        skill_scores = {}
    else:
        target_weakness, skill_scores = await _get_user_weakness(user_id, db)
    
    # Generate AI problem targeting the weakness
    loop = asyncio.get_event_loop()
    try:
        generated = await loop.run_in_executor(
            _executor, 
            generate_ai_problem, 
            target_weakness
        )
    except Exception as e:
        print(f"AI generation failed: {e}")
        generated = {
            "title": f"Practice: {target_weakness.replace('_', ' ').title()}",
            "description": f"Solve a problem to improve your {target_weakness.replace('_', ' ')} skills.",
            "examples": [{"input": "sample", "output": "result"}],
            "tags": [target_weakness]
        }
    
    # Build response
    problem = GeneratedProblem(
        title=generated.get("title", "Practice Challenge"),
        description=generated.get("description", "Improve your coding skills."),
        examples=generated.get("examples", []),
        tags=generated.get("tags", [target_weakness]),
        difficulty=request.difficulty or "medium",
        is_generated=True
    )
    
    human_weakness = target_weakness.replace("_", " ")
    reason = f"Based on your recent submissions, we identified {human_weakness} as an area for improvement."
    
    return NextChallengeResponse(
        problem=problem,
        target_weakness=target_weakness,
        reason=reason
    )


@router.get("/random")
async def get_random_challenge(
    difficulty: Optional[str] = None,
    topic: Optional[str] = None
):
    """Get a random challenge from the problem bank."""
    filtered = SAMPLE_PROBLEMS
    
    if difficulty:
        filtered = [p for p in filtered if p["difficulty"] == difficulty.lower()]
    if topic:
        filtered = [p for p in filtered if p["topic"] == topic.lower()]
    
    if not filtered:
        raise HTTPException(status_code=404, detail="No matching problems found")
    
    import random
    problem = random.choice(filtered)
    
    return {
        "id": problem["id"],
        "title": problem["title"],
        "description": problem["description"],
        "difficulty": problem["difficulty"],
        "topic": problem["topic"],
        "xp_reward": problem["xp_reward"],
        "examples": problem.get("examples", []),
        "hints": problem.get("hints", [])
    }


@router.get("/weaknesses")
async def get_skill_weaknesses(db: AsyncSession = Depends(get_db)):
    """Get the user's current skill weaknesses (for debugging/display)."""
    user_id = MOCK_USER_ID
    weakness, scores = await _get_user_weakness(user_id, db)
    
    return {
        "primary_weakness": weakness,
        "skill_scores": scores,
        "recommendation": f"Focus on improving your {weakness.replace('_', ' ')} skills."
    }
