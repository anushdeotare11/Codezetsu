# SkillSprint — The Adaptive AI Coding Arena

> **Transform the way developers grow.** SkillSprint is an AI-powered adaptive coding platform that evaluates your code like a senior engineer, maps your skill gaps, and generates personalized challenges to make you better — fast.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [AI Engine](#ai-engine)
- [Gamification System](#gamification-system)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Overview

SkillSprint is an adaptive coding platform built for the next generation of developers. Unlike static platforms where everyone gets the same problems in the same order, SkillSprint uses large language models to **watch how you code**, identify where you struggle, and **generate the exact challenge you need next**.

The platform tracks 6 core skill dimensions — algorithm knowledge, data structures, code efficiency, edge case handling, code readability, and problem-solving approach — and continuously adapts the difficulty and topic of challenges based on your real-time performance.

Built as a full-stack monorepo with a Next.js frontend, FastAPI backend, Supabase database, and a dual-LLM AI layer (Groq + Gemini), SkillSprint runs entirely on free-tier infrastructure with zero cost to operate.

---

## Key Features

### Adaptive AI Engine
The core of SkillSprint is its AI evaluation and adaptation loop. Every time you submit code, the AI evaluator scores it across 6 dimensions, identifies your top 3 weaknesses, and triggers the challenge generator to create a new problem that specifically targets those gaps. The system scales difficulty based on your current level, ensuring you are always challenged but never overwhelmed.

### VS Code-Quality Code Editor
The arena is powered by Monaco Editor — the same editor that runs inside VS Code. You get syntax highlighting, autocomplete, and multi-language support (Python, JavaScript, C++, Java) without leaving the browser.

### Real-Time AI Code Evaluation
When you submit a solution, the AI acts as a senior engineer reviewing your PR. It analyzes correctness, time complexity, space complexity, readability, edge case coverage, and overall problem-solving approach. You get a score out of 10, specific feedback, identified weaknesses, and actionable suggestions — all in under 2 seconds.

### Personalized Challenge Generation
When the AI detects a skill gap (e.g., you consistently underperform on dynamic programming or edge case handling), it generates a brand new problem on the fly, targeted precisely at that weakness. No two users get exactly the same learning path.

### Boss Fight Mode
At key progression milestones, you face a "Boss Fight" — a multi-skill, harder-than-normal challenge with a dramatic UI, health bar, and defeat animation. Defeating a Boss earns 500 XP and unlocks the Boss Slayer achievement.

### Skill Radar Chart
Your dashboard features a hexagonal radar chart that visualizes your 6 skill scores in real time. As you submit more code, the chart evolves — shrinking in weak areas that need work, expanding in areas where you excel. This gives you an instant, honest picture of where you stand.

### Gamified Progression
SkillSprint uses a full XP and leveling system with 10 tiers (Novice Coder → Arena Champion), daily streak tracking, and 10 unique achievements. Animations, level-up celebrations, and streak fire effects make the learning loop genuinely engaging.

### Global Leaderboard
A ranked leaderboard shows all users by XP, level, current streak, and problems solved. A materialized database view ensures fast queries even at scale.

### Progressive Hint System
Stuck on a problem? SkillSprint offers a hint system that reveals clues progressively — so you're guided toward the answer without having it handed to you.

### Secure Code Execution
All submitted code runs inside the Piston API's isolated sandbox containers with a 10-second timeout. This ensures security and prevents malicious code from affecting the platform.

---

## Tech Stack

### Frontend

| Tool | Purpose |
|------|---------|
| **Next.js 14 (App Router)** | SSR, file-based routing, fast setup |
| **TypeScript** | Type safety across the entire frontend |
| **Tailwind CSS** | Utility-first styling with dark dungeon theme |
| **Monaco Editor** (`@monaco-editor/react`) | VS Code-quality in-browser code editor |
| **Recharts / Chart.js** | Skill radar charts and progress visualization |
| **Framer Motion** | Smooth animations for XP gains, level-ups, and boss fights |
| **Lucide React** | Icon system |
| **Axios** | HTTP client for API calls |

### Backend

| Tool | Purpose |
|------|---------|
| **FastAPI (Python)** | High-performance async REST API framework |
| **Uvicorn** | ASGI server for FastAPI |
| **Pydantic** | Request/response validation and data modeling |
| **python-dotenv** | Environment variable management |

### AI / LLM Layer

| Tool | Purpose | Rate Limits |
|------|---------|-------------|
| **Groq API** (Primary) | Ultra-fast inference with Llama 3.3 70B | 30 RPM, 1,000 RPD |
| **Google Gemini API** (Fallback) | High-quality reasoning fallback | 15 RPM, 1,000 RPD |

Groq is used as the primary LLM provider due to its sub-second inference speed. If Groq's rate limits are hit, the system automatically fails over to Gemini with zero user impact. Both APIs are completely free with no credit card required.

### Database

| Tool | Purpose |
|------|---------|
| **Neondb** | PostgreSQL database, user authentication, real-time subscriptions, file storage |

### Code Execution

| Tool | Purpose |
|------|---------|
| **Piston API** | Sandboxed code execution supporting 60+ languages, no auth required |
| **Judge0 CE** | Self-hosted alternative for production environments |

### Problem Sources

| Source | Method | Volume |
|--------|--------|--------|
| **Codeforces API** | Official REST API, no auth needed | 2,000+ problems with tags and difficulty ratings |
| **Kaggle LeetCode Dataset** | CSV/JSON download | Problem statements, difficulty, topics, test cases |
| **HuggingFace LeetCode Dataset** | Dataset download | Python problems with test cases |
| **LLM-Generated Problems** | Groq/Gemini API | Unlimited, personalized, dynamically created |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (User)                       │
│              Next.js 14 — App Router (SSR)               │
│   Monaco Editor │ Recharts │ Framer Motion │ Lucide      │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / REST
┌──────────────────────────▼──────────────────────────────┐
│                  FastAPI Backend (Python)                 │
│   /problems  /submit  /challenge  /users  /leaderboard   │
│                                                          │
│  ┌─────────────────┐   ┌──────────────────────────────┐  │
│  │  Code Executor  │   │         AI Services          │  │
│  │  Piston API     │   │  ai_evaluator.py             │  │
│  │  (sandboxed)    │   │  challenge_generator.py      │  │
│  └─────────────────┘   │  skill_analyzer.py           │  │
│                        └──────────────────────────────┘  │
│                                    │                     │
│                         ┌──────────▼──────────┐         │
│                         │    LLM Router        │         │
│                         │  Groq (primary)      │         │
│                         │  Gemini (fallback)   │         │
│                         └─────────────────────┘         │
└──────────────────────────┬──────────────────────────────┘
                           │ PostgreSQL / REST
┌──────────────────────────▼──────────────────────────────┐
│                    Supabase                              │
│   profiles │ problems │ submissions │ user_skills       │
│   user_achievements │ leaderboard (view)                │
└─────────────────────────────────────────────────────────┘
```

**Full submission flow:**
1. User writes code in Monaco Editor and clicks Submit
2. Frontend sends code + problem ID to `POST /api/submit`
3. Backend sends code to Piston API for sandboxed execution against test cases
4. Backend sends code + execution results to Groq (or Gemini fallback) for AI evaluation
5. AI returns a structured JSON evaluation with scores, weaknesses, and suggestions
6. Backend updates `user_skills`, awards XP, checks for achievement unlocks, updates streak
7. Frontend renders the evaluation result, updates the radar chart, and triggers any animations
8. AI skill analyzer identifies top weakness → challenge generator creates a targeted next problem

---

## Project Structure

```
skillsprint/
├── frontend/                         # Next.js 14 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout with sidebar navigation
│   │   │   ├── page.tsx              # Landing / home page
│   │   │   ├── arena/
│   │   │   │   └── page.tsx          # Code editor + problem split view
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Skill radar + stats cards
│   │   │   ├── leaderboard/
│   │   │   │   └── page.tsx          # Global rankings table
│   │   │   └── profile/
│   │   │       └── page.tsx          # User profile + achievement badges
│   │   ├── components/
│   │   │   ├── CodeEditor.tsx        # Monaco editor wrapper
│   │   │   ├── ProblemPanel.tsx      # Problem description with markdown
│   │   │   ├── SkillRadar.tsx        # Hexagonal radar chart
│   │   │   ├── XPBar.tsx             # Experience bar with level indicator
│   │   │   ├── AchievementBadge.tsx  # Achievement display component
│   │   │   ├── LeaderboardTable.tsx  # Rankings table
│   │   │   ├── BossFight.tsx         # Boss challenge UI with health bar
│   │   │   └── Sidebar.tsx           # Navigation sidebar
│   │   ├── lib/
│   │   │   ├── api.ts                # Axios API client functions
│   │   │   └── supabase.ts           # Supabase browser client
│   │   └── styles/
│   │       └── globals.css           # Global styles + dungeon dark theme
│   ├── package.json
│   └── next.config.js
│
├── backend/                          # FastAPI Application
│   ├── main.py                       # FastAPI app entry point + CORS config
│   ├── routers/
│   │   ├── problems.py               # Problem CRUD + filtering endpoints
│   │   ├── submissions.py            # Submission + code execution pipeline
│   │   ├── users.py                  # User profile + stats + skill endpoints
│   │   ├── challenges.py             # AI-powered challenge generation
│   │   └── leaderboard.py            # Rankings + leaderboard queries
│   ├── services/
│   │   ├── ai_evaluator.py           # LLM-based code quality evaluation
│   │   ├── challenge_generator.py    # Dynamic problem generation via LLM
│   │   ├── skill_analyzer.py         # Skill dimension scoring + gap detection
│   │   ├── code_executor.py          # Piston / Judge0 integration
│   │   └── gamification.py           # XP awards, leveling, achievements, streaks
│   ├── models/
│   │   └── schemas.py                # Pydantic request/response models
│   ├── config.py                     # Environment variable config
│   ├── requirements.txt
│   └── .env                          # Environment variables (not committed)
│
├── data/                             # Problem datasets
│   ├── codeforces_problems.json      # Problems fetched from Codeforces API
│   ├── leetcode_dataset.csv          # Kaggle LeetCode dataset
│   └── seed_db.py                    # Script to seed Supabase with problems
│
└── README.md
```

---

## Database Schema

### `profiles` — User accounts extending Supabase Auth

```sql
CREATE TABLE profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id),
  username         TEXT UNIQUE NOT NULL,
  display_name     TEXT,
  avatar_url       TEXT,
  xp               INTEGER DEFAULT 0,
  level            INTEGER DEFAULT 1,
  current_streak   INTEGER DEFAULT 0,
  longest_streak   INTEGER DEFAULT 0,
  last_solve_date  DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### `problems` — Problem bank (seeded + AI-generated)

```sql
CREATE TABLE problems (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  difficulty       TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'boss')),
  difficulty_score INTEGER CHECK (difficulty_score BETWEEN 1 AND 10),
  topics           TEXT[] NOT NULL,        -- e.g. ['arrays', 'dynamic_programming']
  skills_tested    TEXT[] NOT NULL,        -- e.g. ['algorithm', 'edge_cases']
  test_cases       JSONB NOT NULL,         -- [{input: "...", expected: "..."}]
  hints            TEXT[],
  source           TEXT,                   -- 'codeforces' | 'leetcode_dataset' | 'ai_generated'
  source_id        TEXT,
  starter_code     JSONB,                  -- {python: "def solve():", javascript: "function solve(){}"}
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### `submissions` — All code submissions

```sql
CREATE TABLE submissions (
  id                  SERIAL PRIMARY KEY,
  user_id             UUID REFERENCES profiles(id),
  problem_id          INTEGER REFERENCES problems(id),
  code                TEXT NOT NULL,
  language            TEXT NOT NULL,
  status              TEXT CHECK (status IN ('accepted','wrong_answer','runtime_error','time_limit','pending')),
  execution_time_ms   INTEGER,
  test_cases_passed   INTEGER,
  total_test_cases    INTEGER,
  ai_evaluation       JSONB,               -- {score, feedback, weaknesses[], suggestions[]}
  xp_earned           INTEGER DEFAULT 0,
  submitted_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### `user_skills` — Per-user skill dimension scores

```sql
CREATE TABLE user_skills (
  id                SERIAL PRIMARY KEY,
  user_id           UUID REFERENCES profiles(id),
  skill_name        TEXT NOT NULL,         -- 'algorithm_knowledge', 'data_structures', etc.
  score             DECIMAL(4,2) DEFAULT 5.0,  -- 1.0 to 10.0
  total_assessments INTEGER DEFAULT 0,
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);
```

Tracked skill dimensions:
- `algorithm_knowledge` — Ability to select and apply the correct algorithm
- `data_structures` — Appropriate use of arrays, trees, graphs, heaps, etc.
- `code_efficiency` — Time and space complexity awareness
- `edge_cases` — Handling of boundary conditions and invalid inputs
- `readability` — Code organization, naming, and clarity
- `problem_solving` — Overall approach and decomposition

### `user_achievements` — Unlocked achievements per user

```sql
CREATE TABLE user_achievements (
  id              SERIAL PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id),
  achievement_key TEXT NOT NULL,
  unlocked_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);
```

### `leaderboard` — Materialized view for fast rankings

```sql
CREATE VIEW leaderboard AS
SELECT
  p.id, p.username, p.display_name, p.avatar_url,
  p.xp, p.level, p.current_streak,
  COUNT(DISTINCT s.problem_id) FILTER (WHERE s.status = 'accepted') as problems_solved,
  RANK() OVER (ORDER BY p.xp DESC) as rank
FROM profiles p
LEFT JOIN submissions s ON p.id = s.user_id
GROUP BY p.id;
```

---

## AI Engine

### Code Evaluator

Every submission is analyzed by the LLM against 6 dimensions. The evaluator prompt includes the problem title, description, the user's code, the language, and the test case pass rate. It returns a structured JSON object:

```json
{
  "overall_score": 7,
  "correctness": 9,
  "efficiency": {
    "time_complexity": "O(n log n)",
    "space_complexity": "O(n)",
    "score": 7
  },
  "code_quality": 6,
  "edge_case_handling": 5,
  "feedback": "Your solution is correct and handles most cases well. Consider using a hash map instead of nested loops to improve efficiency.",
  "weaknesses": ["edge_case_handling", "code_efficiency"],
  "suggestions": ["Add a check for empty input", "Replace the O(n²) loop with a hash-based approach"],
  "skill_scores": {
    "algorithm_knowledge": 8,
    "data_structures": 6,
    "code_efficiency": 7,
    "edge_cases": 5,
    "readability": 7,
    "problem_solving": 8
  }
}
```

### Skill Analyzer

After each evaluation, the skill analyzer:
1. Updates the rolling average for each skill dimension in `user_skills`
2. Identifies the top 3 weaknesses across all submissions
3. Passes those weaknesses to the challenge generator

### Challenge Generator

The challenge generator creates a new, unique coding problem targeting a specific weakness area. It respects the user's current level and scales difficulty accordingly. The output is a fully-formed problem object including title, description, examples, hidden test cases, hints, topics, and the optimal approach's time complexity target.

### LLM Routing & Fallback

All LLM calls go through a routing layer that:
- Sends requests to **Groq** (Llama 3.3 70B) as the primary — typical latency under 1 second
- Automatically retries with **Gemini 2.5 Flash** if Groq returns a 429 rate limit error
- Retries with a stricter JSON-only prompt if the response fails to parse
- Logs all failures for monitoring

---

## Gamification System

### XP Awards

| Action | XP Earned |
|--------|-----------|
| Solve an Easy problem | 50 XP |
| Solve a Medium problem | 100 XP |
| Solve a Hard problem | 200 XP |
| Defeat a Boss Fight | 500 XP |
| Daily streak bonus | +10 XP × streak day number |
| First-attempt solve | +25 XP bonus |
| Perfect AI evaluation (10/10) | +50 XP bonus |

### Level Progression

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Novice Coder | 0 XP |
| 2 | Code Apprentice | 200 XP |
| 3 | Bug Squasher | 500 XP |
| 4 | Algorithm Adept | 1,000 XP |
| 5 | Data Warrior | 2,000 XP |
| 6 | Efficiency Expert | 3,500 XP |
| 7 | Pattern Master | 5,500 XP |
| 8 | Code Architect | 8,000 XP |
| 9 | Algorithm Legend | 12,000 XP |
| 10 | Arena Champion | 18,000 XP |

### Achievements

| Badge | Key | Condition |
|-------|-----|-----------|
| 🏆 First Blood | `first_solve` | Solve your first problem |
| 🔥 On Fire | `streak_3` | Maintain a 3-day solve streak |
| ⚡ Lightning Fast | `speed_demon` | Solve a problem in under 5 minutes |
| 🧠 Big Brain | `perfect_eval` | Receive a 10/10 AI evaluation |
| 🐛 Bug Hunter | `bug_hunter` | Fix a wrong answer on retry |
| 👑 Boss Slayer | `boss_slayer` | Defeat a Boss Fight challenge |
| 🎯 Sharpshooter | `sharpshooter` | 5 first-attempt solves in a row |
| 📈 Growth Mindset | `growth_mindset` | Improve your weakest skill by 3 points |
| 🏔️ Peak Performance | `peak_performance` | All 6 skills above 7/10 |
| 💎 Diamond Coder | `diamond_coder` | Reach Level 10 (Arena Champion) |

---

## API Reference

### Problems

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/problems` | List problems with optional filters (`topic`, `difficulty`) |
| `GET` | `/api/problems/{id}` | Get a single problem by ID |

### Submissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/submit` | Submit code — runs execution, AI evaluation, XP award, achievement check |

Request body:
```json
{
  "problem_id": 42,
  "code": "def solve(n): ...",
  "language": "python"
}
```

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user/stats` | XP, level, streak, problems solved |
| `GET` | `/api/user/submissions` | Submission history |
| `GET` | `/api/user/skills` | Skill dimension scores (radar chart data) |

### Challenges

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/challenge/next` | Generate the next adaptive challenge based on user's weaknesses |

### Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leaderboard` | Global rankings sorted by XP |

FastAPI automatically generates interactive API documentation at `/docs` (Swagger UI) and `/redoc`.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Supabase account (free at supabase.com)
- A Groq API key (free at console.groq.com)
- A Google Gemini API key (free at aistudio.google.com)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/skillsprint.git
cd skillsprint
```

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_URL
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### 3. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in GROQ_API_KEY, GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### 4. Database setup

In your Supabase project, run the SQL schema from the [Database Schema](#database-schema) section above in the SQL editor.

### 5. Seed problems

```bash
# Fetch problems from Codeforces
curl "https://codeforces.com/api/problemset.problems" -o data/codeforces_problems.json

# Seed the database
cd data
python seed_db.py
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)

```env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
PISTON_API_URL=https://emkc.org/api/v2/piston
EXECUTION_TIMEOUT_SECONDS=10
```

All API keys are free with no credit card required. See the links in the [Prerequisites](#prerequisites) section.

---

## Deployment

### Frontend → Vercel (Free)

```bash
cd frontend
npx vercel --prod
```

Set the same environment variables from `frontend/.env.local` in the Vercel project settings.

### Backend → Render (Free)

1. Push the repository to GitHub
2. Connect the repo to a new Render Web Service
3. Set the root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add all backend environment variables in Render's dashboard

Note: Render's free tier spins down after 15 minutes of inactivity. For a production deployment, Railway's free credit tier or a paid Render plan is recommended.

### Database → Neondb (Free)

No deployment needed — Supabase is already hosted. The free tier provides 500MB of database storage and unlimited API calls, which is more than sufficient for thousands of users.

| Component | Platform | Free Tier Limit |
|-----------|----------|-----------------|
| Frontend | Local | Unlimited deploys |
| Backend | Render | 750 hours/month |
| Database | Neondb | 500MB, unlimited API calls |

---
