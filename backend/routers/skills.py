"""Skills API router - User skill tracking and radar data."""

from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_db
from models.schemas import SubmissionModel

router = APIRouter(prefix="/api/skills", tags=["skills"])

# Mock user ID for development
MOCK_USER_ID = "dev-user-001"

# Default skill dimensions
SKILL_DIMENSIONS = [
    "algorithm_knowledge",
    "data_structures", 
    "code_efficiency",
    "edge_cases",
    "readability",
    "problem_solving"
]


class SkillScore(BaseModel):
    """Individual skill score."""
    name: str
    display_name: str
    score: float
    max_score: float = 10.0
    assessments: int = 0


class SkillRadarData(BaseModel):
    """Skill radar chart data for frontend."""
    user_id: str
    skills: List[SkillScore]
    overall_score: float
    total_assessments: int
    primary_strength: str
    primary_weakness: str


def _humanize_skill_name(skill: str) -> str:
    """Convert skill_name to Human Name."""
    return skill.replace("_", " ").title()


def _get_default_skills() -> Dict[str, float]:
    """Get default skill scores."""
    return {skill: 5.0 for skill in SKILL_DIMENSIONS}


@router.get("", response_model=SkillRadarData)
@router.get("/radar", response_model=SkillRadarData)
async def get_skill_radar(
    user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's skill radar data for visualization.
    
    Returns aggregated skill scores across all dimensions,
    suitable for rendering in a radar/spider chart.
    """
    user_id = user_id or MOCK_USER_ID
    
    # Try to aggregate from recent submissions
    skill_data = _get_default_skills()
    total_assessments = 0
    
    try:
        result = await db.execute(
            select(SubmissionModel)
            .where(SubmissionModel.user_id == user_id)
            .order_by(SubmissionModel.created_at.desc())
            .limit(50)
        )
        submissions = result.scalars().all()
        
        if submissions:
            # In a full implementation, we'd store AI evaluation in the DB
            # and aggregate those scores. For now, use simulated data.
            total_assessments = len(submissions)
            
            # Simulate skill progression based on submission count
            for skill in SKILL_DIMENSIONS:
                base = 5.0
                # Add variance based on skill type
                if skill == "readability":
                    skill_data[skill] = min(10.0, base + total_assessments * 0.1)
                elif skill == "algorithm_knowledge":
                    skill_data[skill] = min(10.0, base + total_assessments * 0.08)
                else:
                    skill_data[skill] = min(10.0, base + total_assessments * 0.05)
                    
    except Exception as e:
        print(f"DB query failed, using default skills: {e}")
        # Use mock data for demo
        skill_data = {
            "algorithm_knowledge": 7.2,
            "data_structures": 6.5,
            "code_efficiency": 5.8,
            "edge_cases": 6.0,
            "readability": 8.1,
            "problem_solving": 7.0
        }
        total_assessments = 15
    
    # Build skill scores list
    skills = [
        SkillScore(
            name=skill,
            display_name=_humanize_skill_name(skill),
            score=round(score, 1),
            assessments=total_assessments
        )
        for skill, score in skill_data.items()
    ]
    
    # Calculate aggregates
    overall = sum(skill_data.values()) / len(skill_data) if skill_data else 5.0
    primary_strength = max(skill_data, key=skill_data.get) if skill_data else "problem_solving"
    primary_weakness = min(skill_data, key=skill_data.get) if skill_data else "edge_cases"
    
    return SkillRadarData(
        user_id=user_id,
        skills=skills,
        overall_score=round(overall, 1),
        total_assessments=total_assessments,
        primary_strength=primary_strength,
        primary_weakness=primary_weakness
    )


@router.get("/summary")
async def get_skills_summary(db: AsyncSession = Depends(get_db)):
    """Get a quick summary of user's skills."""
    radar_data = await get_skill_radar(db=db)
    
    return {
        "overall_score": radar_data.overall_score,
        "level": _score_to_level(radar_data.overall_score),
        "strongest": _humanize_skill_name(radar_data.primary_strength),
        "weakest": _humanize_skill_name(radar_data.primary_weakness),
        "assessments": radar_data.total_assessments,
        "recommendation": f"Focus on improving your {_humanize_skill_name(radar_data.primary_weakness)} skills."
    }


def _score_to_level(score: float) -> str:
    """Convert overall score to a skill level."""
    if score >= 9.0:
        return "Master"
    elif score >= 7.5:
        return "Expert"
    elif score >= 6.0:
        return "Advanced"
    elif score >= 4.5:
        return "Intermediate"
    else:
        return "Beginner"


@router.get("/dimensions")
async def list_skill_dimensions():
    """List all tracked skill dimensions."""
    return {
        "dimensions": [
            {
                "name": skill,
                "display_name": _humanize_skill_name(skill),
                "description": _get_skill_description(skill)
            }
            for skill in SKILL_DIMENSIONS
        ]
    }


def _get_skill_description(skill: str) -> str:
    """Get description for a skill dimension."""
    descriptions = {
        "algorithm_knowledge": "Understanding of algorithms and their applications",
        "data_structures": "Ability to choose and use appropriate data structures",
        "code_efficiency": "Writing performant code with optimal time/space complexity",
        "edge_cases": "Handling boundary conditions and special cases",
        "readability": "Writing clean, maintainable, and well-documented code",
        "problem_solving": "Breaking down problems and devising solutions"
    }
    return descriptions.get(skill, "General coding skill")
