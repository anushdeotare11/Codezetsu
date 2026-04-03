"""Problems API router."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_db
from models.schemas import ProblemModel, ProblemResponse, ProblemListResponse, Difficulty
from services.ai_evaluator import generate_hint, explain_solution

router = APIRouter(prefix="/api/problems", tags=["problems"])

# Thread pool for async AI calls
_executor = ThreadPoolExecutor(max_workers=2)


# Sample problems data (used for seeding and fallback)
SAMPLE_PROBLEMS = [
    {
        "id": "two-sum",
        "title": "Two Sum",
        "description": """Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.""",
        "difficulty": "easy",
        "topic": "arrays",
        "xp_reward": 100,
        "time_limit_seconds": 5,
        "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
        "starter_code": {
            "python": "def two_sum(nums, target):\n    # Your code here\n    pass",
            "javascript": "function twoSum(nums, target) {\n    // Your code here\n}",
        },
        "test_cases": [
            {"input": "[2,7,11,15]\n9", "expected": "[0, 1]", "is_hidden": False},
            {"input": "[3,2,4]\n6", "expected": "[1, 2]", "is_hidden": False},
            {"input": "[3,3]\n6", "expected": "[0, 1]", "is_hidden": True},
        ],
        "examples": [
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."},
            {"input": "nums = [3,2,4], target = 6", "output": "[1,2]", "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."},
        ],
        "hints": ["Try using a hash map to store seen values.", "For each number, check if target - number exists in the map."],
    },
    {
        "id": "reverse-string",
        "title": "Reverse String",
        "description": """Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.""",
        "difficulty": "easy",
        "topic": "strings",
        "xp_reward": 75,
        "time_limit_seconds": 5,
        "constraints": "1 <= s.length <= 10^5\ns[i] is a printable ascii character",
        "starter_code": {
            "python": "def reverse_string(s):\n    # Modify s in-place\n    pass",
            "javascript": "function reverseString(s) {\n    // Modify s in-place\n}",
        },
        "test_cases": [
            {"input": "hello", "expected": "olleh", "is_hidden": False},
            {"input": "Hannah", "expected": "hannaH", "is_hidden": False},
            {"input": "a", "expected": "a", "is_hidden": True},
        ],
        "examples": [
            {"input": 's = ["h","e","l","l","o"]', "output": '["o","l","l","e","h"]', "explanation": ""},
        ],
        "hints": ["Use two pointers, one at the start and one at the end."],
    },
    {
        "id": "fibonacci",
        "title": "Fibonacci Number",
        "description": """The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.

Given n, calculate F(n).""",
        "difficulty": "easy",
        "topic": "recursion",
        "xp_reward": 100,
        "time_limit_seconds": 5,
        "constraints": "0 <= n <= 30",
        "starter_code": {
            "python": "def fib(n):\n    # Return the nth Fibonacci number\n    pass",
            "javascript": "function fib(n) {\n    // Return the nth Fibonacci number\n}",
        },
        "test_cases": [
            {"input": "2", "expected": "1", "is_hidden": False},
            {"input": "3", "expected": "2", "is_hidden": False},
            {"input": "4", "expected": "3", "is_hidden": False},
            {"input": "10", "expected": "55", "is_hidden": True},
        ],
        "examples": [
            {"input": "n = 2", "output": "1", "explanation": "F(2) = F(1) + F(0) = 1 + 0 = 1"},
            {"input": "n = 3", "output": "2", "explanation": "F(3) = F(2) + F(1) = 1 + 1 = 2"},
        ],
        "hints": ["You can use recursion with memoization.", "Or use dynamic programming with iteration."],
    },
    {
        "id": "valid-parentheses",
        "title": "Valid Parentheses",
        "description": """Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.""",
        "difficulty": "medium",
        "topic": "stacks",
        "xp_reward": 150,
        "time_limit_seconds": 5,
        "constraints": "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'",
        "starter_code": {
            "python": "def is_valid(s):\n    # Return True if valid, False otherwise\n    pass",
            "javascript": "function isValid(s) {\n    // Return true if valid, false otherwise\n}",
        },
        "test_cases": [
            {"input": "()", "expected": "True", "is_hidden": False},
            {"input": "()[]{}", "expected": "True", "is_hidden": False},
            {"input": "(]", "expected": "False", "is_hidden": False},
            {"input": "([)]", "expected": "False", "is_hidden": True},
            {"input": "{[]}", "expected": "True", "is_hidden": True},
        ],
        "examples": [
            {"input": 's = "()"', "output": "true", "explanation": ""},
            {"input": 's = "()[]{}"', "output": "true", "explanation": ""},
            {"input": 's = "(]"', "output": "false", "explanation": ""},
        ],
        "hints": ["Use a stack to keep track of opening brackets.", "When you see a closing bracket, check if it matches the top of the stack."],
    },
    {
        "id": "merge-sorted-arrays",
        "title": "Merge Sorted Arrays",
        "description": """You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.

Merge nums1 and nums2 into a single array sorted in non-decreasing order.

The final sorted array should be stored inside nums1. To accommodate this, nums1 has a length of m + n.""",
        "difficulty": "medium",
        "topic": "arrays",
        "xp_reward": 175,
        "time_limit_seconds": 5,
        "constraints": "nums1.length == m + n\nnums2.length == n\n0 <= m, n <= 200",
        "starter_code": {
            "python": "def merge(nums1, m, nums2, n):\n    # Modify nums1 in-place\n    pass",
            "javascript": "function merge(nums1, m, nums2, n) {\n    // Modify nums1 in-place\n}",
        },
        "test_cases": [
            {"input": "[1,2,3,0,0,0]\n3\n[2,5,6]\n3", "expected": "[1, 2, 2, 3, 5, 6]", "is_hidden": False},
            {"input": "[1]\n1\n[]\n0", "expected": "[1]", "is_hidden": False},
            {"input": "[0]\n0\n[1]\n1", "expected": "[1]", "is_hidden": True},
        ],
        "examples": [
            {"input": "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", "output": "[1,2,2,3,5,6]", "explanation": "The result is [1,2,2,3,5,6]."},
        ],
        "hints": ["Try merging from the end of the arrays.", "Use three pointers: one for each array and one for the result position."],
    },
    {
        "id": "lru-cache",
        "title": "LRU Cache",
        "description": """Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
- LRUCache(int capacity): Initialize the LRU cache with positive size capacity.
- int get(int key): Return the value of the key if it exists, otherwise return -1.
- void put(int key, int value): Update the value of the key if it exists. Otherwise, add the key-value pair to the cache.

If the number of keys exceeds the capacity from this operation, evict the least recently used key.

The functions get and put must each run in O(1) average time complexity.""",
        "difficulty": "hard",
        "topic": "design",
        "xp_reward": 300,
        "time_limit_seconds": 10,
        "constraints": "1 <= capacity <= 3000\n0 <= key <= 10^4\n0 <= value <= 10^5\nAt most 2 * 10^5 calls will be made to get and put.",
        "starter_code": {
            "python": "class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    \n    def get(self, key: int) -> int:\n        pass\n    \n    def put(self, key: int, value: int) -> None:\n        pass",
            "javascript": "class LRUCache {\n    constructor(capacity) {\n        // Initialize\n    }\n    \n    get(key) {\n        // Return value or -1\n    }\n    \n    put(key, value) {\n        // Add/update value\n    }\n}",
        },
        "test_cases": [
            {"input": "LRUCache(2)\nput(1,1)\nput(2,2)\nget(1)\nput(3,3)\nget(2)", "expected": "1\n-1", "is_hidden": False},
        ],
        "examples": [
            {"input": '["LRUCache","put","put","get","put","get"]\\n[[2],[1,1],[2,2],[1],[3,3],[2]]', "output": "[null,null,null,1,null,-1]", "explanation": "LRU evicts key 2 when capacity is exceeded."},
        ],
        "hints": ["Use a hash map combined with a doubly linked list.", "The hash map provides O(1) access, the linked list maintains order."],
    },
]


def _get_sample_problems_list(difficulty: Optional[str] = None, topic: Optional[str] = None) -> List[ProblemListResponse]:
    """Get filtered sample problems as list responses."""
    filtered = SAMPLE_PROBLEMS
    if difficulty:
        filtered = [p for p in filtered if p["difficulty"] == difficulty.lower()]
    if topic:
        filtered = [p for p in filtered if p["topic"] == topic.lower()]
    return [
        ProblemListResponse(
            id=p["id"],
            title=p["title"],
            difficulty=p["difficulty"],
            topic=p["topic"],
            xp_reward=p["xp_reward"]
        )
        for p in filtered
    ]


def _get_sample_problem(problem_id: str) -> Optional[ProblemResponse]:
    """Get a single sample problem by ID."""
    from datetime import datetime
    for p in SAMPLE_PROBLEMS:
        if p["id"] == problem_id:
            return ProblemResponse(
                id=p["id"],
                title=p["title"],
                description=p["description"],
                difficulty=Difficulty(p["difficulty"]),
                topic=p["topic"],
                xp_reward=p["xp_reward"],
                time_limit_seconds=p["time_limit_seconds"],
                constraints=p.get("constraints"),
                starter_code=p.get("starter_code"),
                examples=p.get("examples"),
                hints=p.get("hints"),
                created_at=datetime.now()
            )
    return None


@router.get("", response_model=List[ProblemListResponse])
async def list_problems(
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: easy, medium, hard, boss"),
    topic: Optional[str] = Query(None, description="Filter by topic"),
    db: AsyncSession = Depends(get_db)
):
    """Get list of all problems with optional filters."""
    try:
        query = select(ProblemModel).where(ProblemModel.is_active == True)
        
        if difficulty:
            query = query.where(ProblemModel.difficulty == difficulty.lower())
        if topic:
            query = query.where(ProblemModel.topic == topic.lower())
        
        result = await db.execute(query)
        problems = result.scalars().all()
        
        if problems:
            return problems
    except Exception as e:
        # DB not available, use sample data
        print(f"DB unavailable, using sample data: {e}")
    
    # Return sample data as fallback
    return _get_sample_problems_list(difficulty, topic)


@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem(
    problem_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a single problem by ID."""
    try:
        result = await db.execute(
            select(ProblemModel).where(ProblemModel.id == problem_id)
        )
        problem = result.scalar_one_or_none()
        
        if problem:
            return problem
    except Exception:
        pass
    
    # Try sample data
    sample = _get_sample_problem(problem_id)
    if sample:
        return sample
    
    raise HTTPException(status_code=404, detail=f"Problem not found: {problem_id}")


@router.get("/topics/list")
async def list_topics():
    """Get list of all available topics."""
    topics = set(p["topic"] for p in SAMPLE_PROBLEMS)
    return {"topics": sorted(topics)}


@router.post("/{problem_id}/hint")
async def get_problem_hint(problem_id: str):
    """
    Get an AI-generated hint for a problem.
    
    Returns a conceptual hint without giving away the solution.
    """
    # Find the problem
    problem = None
    for p in SAMPLE_PROBLEMS:
        if p["id"] == problem_id:
            problem = p
            break
    
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem not found: {problem_id}")
    
    # Check if problem has predefined hints
    predefined_hints = problem.get("hints", [])
    if predefined_hints:
        return {
            "hint": predefined_hints[0],
            "source": "predefined",
            "hints_available": len(predefined_hints)
        }
    
    # Generate AI hint
    problem_text = f"{problem['title']}\n{problem['description']}"
    
    loop = asyncio.get_event_loop()
    try:
        hint = await loop.run_in_executor(_executor, generate_hint, problem_text)
    except Exception as e:
        print(f"AI hint generation failed: {e}")
        hint = "Try breaking down the problem into smaller steps and identify the key constraint."
    
    return {
        "hint": hint,
        "source": "ai_generated",
        "hints_available": 1
    }


@router.post("/{problem_id}/explain")
async def get_solution_explanation(problem_id: str):
    """
    Get an AI-generated explanation of the optimal approach.
    
    Provides conceptual guidance without giving the exact code.
    """
    # Find the problem
    problem = None
    for p in SAMPLE_PROBLEMS:
        if p["id"] == problem_id:
            problem = p
            break
    
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem not found: {problem_id}")
    
    problem_text = f"{problem['title']}\n{problem['description']}"
    
    loop = asyncio.get_event_loop()
    try:
        explanation = await loop.run_in_executor(_executor, explain_solution, problem_text)
    except Exception as e:
        print(f"AI explanation generation failed: {e}")
        explanation = "Consider the time and space complexity trade-offs and look for patterns in the problem constraints."
    
    return {
        "explanation": explanation,
        "problem_id": problem_id,
        "problem_title": problem["title"]
    }


@router.get("/{problem_id}/hints")
async def get_all_hints(problem_id: str):
    """Get all available hints for a problem (progressive hints)."""
    # Find the problem
    problem = None
    for p in SAMPLE_PROBLEMS:
        if p["id"] == problem_id:
            problem = p
            break
    
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem not found: {problem_id}")
    
    hints = problem.get("hints", [])
    if not hints:
        hints = ["Think about the problem constraints and what data structure would help."]
    
    return {
        "problem_id": problem_id,
        "hints": hints,
        "total": len(hints)
    }


def get_sample_problems():
    """Get sample problems for seeding."""
    return SAMPLE_PROBLEMS
