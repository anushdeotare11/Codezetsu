"""Database models and Pydantic schemas."""

from datetime import datetime, date
from enum import Enum
from typing import Optional, List, Any
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Integer, Text, DateTime, Date, JSON, ForeignKey, Float, Boolean, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from config import Base


# =====================
# SQLAlchemy ORM Models
# =====================

class ProfileModel(Base):
    """User profile database model."""
    __tablename__ = "profiles"
    
    id = Column(String, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100))
    avatar_url = Column(Text)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    total_solved = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_solve_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    submissions = relationship("SubmissionModel", back_populates="profile")
    skills = relationship("UserSkillModel", back_populates="profile")
    achievements = relationship("UserAchievementModel", back_populates="profile")


class ProblemModel(Base):
    """Coding problem database model."""
    __tablename__ = "problems"
    
    id = Column(String, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False)  # easy, medium, hard, boss
    difficulty_score = Column(Integer, nullable=True)  # 1-10 numeric scale
    topics = Column(JSON, nullable=False, default=list)  # ['arrays', 'dynamic_programming']
    skills_tested = Column(JSON, nullable=False, default=list)  # ['algorithm', 'edge_cases']
    xp_reward = Column(Integer, default=100)
    time_limit_seconds = Column(Integer, default=10)
    constraints = Column(Text)
    starter_code = Column(JSON)  # {"python": "...", "javascript": "..."}
    test_cases = Column(JSON, nullable=False)  # [{"input": "...", "expected": "..."}]
    examples = Column(JSON)  # [{"input": "...", "output": "...", "explanation": "..."}]
    hints = Column(JSON)  # ["hint1", "hint2"]
    source = Column(String(50), nullable=True)  # 'codeforces', 'leetcode_dataset', 'ai_generated'
    source_id = Column(String(100), nullable=True)  # original problem ID from source
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    submissions = relationship("SubmissionModel", back_populates="problem")


class SubmissionModel(Base):
    """Code submission database model."""
    __tablename__ = "submissions"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    problem_id = Column(String, ForeignKey("problems.id"), nullable=False)
    code = Column(Text, nullable=False)
    language = Column(String(30), nullable=False)
    status = Column(String(30), nullable=False)  # accepted, wrong_answer, error, timeout
    test_cases_passed = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)
    execution_time_ms = Column(Float)
    error_message = Column(Text)
    xp_earned = Column(Integer, default=0)
    ai_evaluation = Column(JSON, nullable=True)  # {score, feedback, weaknesses[], suggestions[]}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    profile = relationship("ProfileModel", back_populates="submissions")
    problem = relationship("ProblemModel", back_populates="submissions")


class UserSkillModel(Base):
    """User skill scores - updated after each submission."""
    __tablename__ = "user_skills"
    __table_args__ = (
        UniqueConstraint('user_id', 'skill_name', name='uq_user_skill'),
    )
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    skill_name = Column(String(50), nullable=False)  # 'algorithm', 'data_structures', etc.
    score = Column(Numeric(4, 2), default=5.0)  # 1.0 to 10.0
    total_assessments = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    profile = relationship("ProfileModel", back_populates="skills")


class UserAchievementModel(Base):
    """User achievements - unlocked badges."""
    __tablename__ = "user_achievements"
    __table_args__ = (
        UniqueConstraint('user_id', 'achievement_key', name='uq_user_achievement'),
    )
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    achievement_key = Column(String(50), nullable=False)  # 'first_solve', 'streak_7', etc.
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())
    
    profile = relationship("ProfileModel", back_populates="achievements")


# =====================
# Pydantic Schemas
# =====================

class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    BOSS = "boss"


class SubmissionStatus(str, Enum):
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    ERROR = "error"
    TIMEOUT = "timeout"
    RUNTIME_ERROR = "runtime_error"


# ----- Problem Schemas -----

class TestCase(BaseModel):
    input: str
    expected: str
    is_hidden: bool = False


class Example(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None


class ProblemBase(BaseModel):
    title: str
    description: str
    difficulty: Difficulty
    difficulty_score: Optional[int] = None
    topics: List[str] = []
    skills_tested: List[str] = []
    xp_reward: int = 100
    time_limit_seconds: int = 10
    constraints: Optional[str] = None
    source: Optional[str] = None
    source_id: Optional[str] = None


class ProblemCreate(ProblemBase):
    starter_code: Optional[dict] = None
    test_cases: List[TestCase]
    examples: Optional[List[Example]] = None
    hints: Optional[List[str]] = None


class ProblemResponse(ProblemBase):
    id: str
    starter_code: Optional[dict] = None
    examples: Optional[List[dict]] = None
    hints: Optional[List[str]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProblemListResponse(BaseModel):
    id: str
    title: str
    difficulty: str
    difficulty_score: Optional[int] = None
    topics: List[str] = []
    xp_reward: int
    
    class Config:
        from_attributes = True


# ----- Submission Schemas -----

class SubmissionCreate(BaseModel):
    problem_id: str
    code: str
    language: str = Field(..., description="Programming language (python, javascript, cpp, java)")


class SubmissionResponse(BaseModel):
    id: str
    status: str
    test_cases_passed: int
    total_test_cases: int
    execution_time_ms: Optional[float] = None
    error_message: Optional[str] = None
    xp_earned: int = 0
    
    class Config:
        from_attributes = True


class AIEvaluation(BaseModel):
    """AI-generated code evaluation."""
    score: int = Field(default=5, ge=0, le=10)
    feedback: str = ""
    weaknesses: List[str] = []
    suggestions: List[str] = []
    skill_scores: dict = {}
    hint: str = ""
    explanation: str = ""


class GamificationResult(BaseModel):
    """Results from processing gamification rules after submission."""
    xp_earned: int = 0
    level_up: bool = False
    new_level: Optional[int] = None
    old_level: Optional[int] = None
    achievements_unlocked: List[str] = []


class SubmissionResult(BaseModel):
    status: SubmissionStatus
    test_cases_passed: int
    total_test_cases: int
    execution_time_ms: float
    error_message: Optional[str] = None
    xp_earned: int = 0
    ai_evaluation: Optional[AIEvaluation] = None
    gamification: Optional[GamificationResult] = None


# ----- User Schemas -----

class UserStats(BaseModel):
    total_submissions: int
    problems_solved: int
    easy_solved: int = 0
    medium_solved: int = 0
    hard_solved: int = 0
    current_streak: int = 0
    level: int = 1
    xp: int = 0


class ProfileResponse(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    level: int
    xp: int
    total_solved: int
    current_streak: int
    longest_streak: int
    
    class Config:
        from_attributes = True


# ----- Skill Schemas -----

class UserSkillResponse(BaseModel):
    skill_name: str
    score: float
    total_assessments: int
    
    class Config:
        from_attributes = True


class UserAchievementResponse(BaseModel):
    achievement_key: str
    unlocked_at: datetime
    
    class Config:
        from_attributes = True


# ----- Code Execution Schemas -----

class CodeExecutionRequest(BaseModel):
    code: str
    language: str
    stdin: str = ""


class CodeExecutionResult(BaseModel):
    output: str
    runtime_ms: float
    error: Optional[str] = None
    exit_code: int = 0
