"""Submissions API router."""

import time
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_db
from models.schemas import (
    SubmissionModel,
    SubmissionCreate,
    SubmissionResponse,
    SubmissionResult,
    SubmissionStatus,
    GamificationResult,
)
from services.code_executor import execute_code
from services.pipeline import process_submission
from services.gamification import process_gamification
from routers.problems import SAMPLE_PROBLEMS

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


# Mock user ID for development (no auth yet)
MOCK_USER_ID = "dev-user-001"


def normalize_output(output: str) -> str:
    """Normalize output for comparison (strip whitespace, normalize line endings)."""
    return output.strip().replace('\r\n', '\n').replace('\r', '\n')


@router.post("", response_model=SubmissionResult)
@router.post("/submit", response_model=SubmissionResult)
async def submit_code(
    submission: SubmissionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit code for a problem.
    
    Executes the code against all test cases and returns the result with AI evaluation.
    """
    # Find the problem
    problem = None
    for p in SAMPLE_PROBLEMS:
        if p["id"] == submission.problem_id:
            problem = p
            break
    
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem not found: {submission.problem_id}")
    
    test_cases = problem.get("test_cases", [])
    if not test_cases:
        raise HTTPException(status_code=400, detail="Problem has no test cases")
    
    total_cases = len(test_cases)
    passed_cases = 0
    total_time_ms = 0.0
    error_message = None
    final_status = SubmissionStatus.ACCEPTED
    
    # Run each test case
    for i, test_case in enumerate(test_cases):
        stdin = test_case["input"]
        expected = normalize_output(test_case["expected"])
        
        # Execute the code
        result = await execute_code(
            code=submission.code,
            language=submission.language,
            stdin=stdin
        )
        
        total_time_ms += result.runtime_ms
        
        # Check for errors
        if result.error:
            if "Time Limit" in result.error:
                final_status = SubmissionStatus.TIMEOUT
                error_message = f"Time Limit Exceeded on test case {i + 1}"
            else:
                final_status = SubmissionStatus.RUNTIME_ERROR
                error_message = f"Runtime Error on test case {i + 1}: {result.error}"
            break
        
        # Compare output
        actual = normalize_output(result.output)
        if actual == expected:
            passed_cases += 1
        else:
            final_status = SubmissionStatus.WRONG_ANSWER
            error_message = f"Wrong Answer on test case {i + 1}"
            if not test_case.get("is_hidden", False):
                error_message += f"\nExpected: {expected}\nGot: {actual}"
            break
    
    # Determine if this is the first attempt
    first_attempt = False
    try:
        count_result = await db.execute(
            select(func.count(SubmissionModel.id)).where(
                SubmissionModel.user_id == MOCK_USER_ID,
                SubmissionModel.problem_id == submission.problem_id
            )
        )
        count = count_result.scalar() or 0
        first_attempt = (count == 0)
    except Exception:
        # Fallback if DB fails
        first_attempt = True

    # Calculate XP earned base (will be overwritten by true gamification logic)
    xp_earned = 0
    if final_status == SubmissionStatus.ACCEPTED:
        xp_earned = problem.get("xp_reward", 100)
    
    # Run AI evaluation (async, non-blocking on failure)
    ai_evaluation = None
    try:
        # Build problem description for AI
        problem_desc = f"{problem['title']}\n{problem['description']}"
        ai_result = await process_submission(problem_desc, submission.code, submission.language)
        ai_evaluation = {
            "score": ai_result.get("score", 5),
            "feedback": ai_result.get("feedback", ""),
            "weaknesses": ai_result.get("all_weaknesses", []),
            "suggestions": ai_result.get("suggestions", []),
            "skill_scores": ai_result.get("skill_scores", {}),
            "hint": ai_result.get("hint", ""),
            "explanation": ai_result.get("explanation", ""),
        }
    except Exception as e:
        print(f"Warning: AI evaluation failed: {e}")
        # Return default evaluation on failure
        ai_evaluation = {
            "score": 5,
            "feedback": "Code evaluation completed.",
            "weaknesses": [],
            "suggestions": [],
            "skill_scores": {},
            "hint": "",
            "explanation": "",
        }
    
    # Try to store submission in database (non-blocking)
    submission_id = str(uuid.uuid4())
    try:
        new_submission = SubmissionModel(
            id=submission_id,
            user_id=MOCK_USER_ID,
            problem_id=submission.problem_id,
            code=submission.code,
            language=submission.language,
            status=final_status.value,
            test_cases_passed=passed_cases,
            total_test_cases=total_cases,
            execution_time_ms=total_time_ms,
            error_message=error_message,
            xp_earned=0, # temp, updated below
            ai_evaluation=ai_evaluation
        )
        db.add(new_submission)
        await db.commit()
    except Exception as e:
        # Log but don't fail the request if DB storage fails
        print(f"Warning: Could not store submission: {e}")

    # Process final gamification metrics
    gamification_result = None
    try:
        ai_score = ai_evaluation.get("score") if ai_evaluation else None
        skill_scores = ai_evaluation.get("skill_scores") if ai_evaluation else None
        
        gam_res = await process_gamification(
            user_id=MOCK_USER_ID,
            problem_difficulty=problem.get("difficulty", "easy"),
            is_accepted=(final_status == SubmissionStatus.ACCEPTED),
            is_first_attempt=first_attempt,
            ai_score=ai_score,
            ai_skill_scores=skill_scores,
            execution_time_ms=total_time_ms,
            db=db
        )
        
        gamification_result = GamificationResult(**gam_res)
        xp_earned = gam_res.get("xp_earned", xp_earned)
        
        # Update submission with actual XP earned
        try:
            if final_status == SubmissionStatus.ACCEPTED:
                await db.execute(
                    SubmissionModel.__table__.update().
                    where(SubmissionModel.id == submission_id).
                    values(xp_earned=xp_earned)
                )
                await db.commit()
        except Exception as e:
            pass
            
    except Exception as e:
        print(f"Warning: Gamification processing failed: {e}")
    
    return SubmissionResult(
        status=final_status,
        test_cases_passed=passed_cases,
        total_test_cases=total_cases,
        execution_time_ms=total_time_ms,
        error_message=error_message,
        xp_earned=xp_earned,
        ai_evaluation=ai_evaluation,
        gamification=gamification_result
    )


@router.get("/history")
async def get_submission_history(
    problem_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get submission history for the current user.
    
    Supports filtering by problem_id and status, with pagination.
    """
    try:
        query = select(SubmissionModel).where(
            SubmissionModel.user_id == MOCK_USER_ID
        ).order_by(SubmissionModel.created_at.desc())
        
        if problem_id:
            query = query.where(SubmissionModel.problem_id == problem_id)
        if status:
            query = query.where(SubmissionModel.status == status)
        
        query = query.offset(offset).limit(limit)
        
        result = await db.execute(query)
        submissions = result.scalars().all()
        
        return {
            "submissions": [
                SubmissionResponse(
                    id=s.id,
                    status=s.status,
                    test_cases_passed=s.test_cases_passed,
                    total_test_cases=s.total_test_cases,
                    execution_time_ms=s.execution_time_ms,
                    error_message=s.error_message
                )
                for s in submissions
            ],
            "total": len(submissions),
            "limit": limit,
            "offset": offset
        }
    except Exception:
        # Return empty when DB not available
        return {
            "submissions": [],
            "total": 0,
            "limit": limit,
            "offset": offset
        }


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get details of a specific submission."""
    try:
        result = await db.execute(
            select(SubmissionModel).where(SubmissionModel.id == submission_id)
        )
        submission = result.scalar_one_or_none()
        
        if submission:
            return submission
    except Exception:
        pass
    
    raise HTTPException(status_code=404, detail="Submission not found")
