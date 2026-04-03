# Phase 0 — Setup & Foundation Report (Member 4)

> **Scope:** Read-only inspection. Zero modifications performed.
> **Date:** 2026-04-03

---

## 1. Repo Structure Report

```
Codezetsu/                          ← Monorepo root (confirmed ✅)
├── .git/                           ← Git initialized ✅
├── roadmap.md                      ← Full 24-hour roadmap (670 lines)
├── frontend/                       ← Next.js app ✅
│   ├── package.json                ← Dependencies installed
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          ← Root layout
│   │   │   ├── page.tsx            ← Landing page
│   │   │   ├── globals.css         ← Global styles
│   │   │   ├── arena/              ← Code editor + problem page
│   │   │   ├── dashboard/          ← Stats + skill radar page
│   │   │   ├── leaderboard/        ← Rankings page
│   │   │   └── profile/            ← User profile page
│   │   ├── components/             ← 14 components built
│   │   │   ├── AchievementBadge.tsx
│   │   │   ├── AchievementUnlock.tsx
│   │   │   ├── BossFight.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── LeaderboardTable.tsx
│   │   │   ├── LevelUpCelebration.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── ProblemPanel.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SkillRadar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── XPBar.tsx
│   │   │   └── XPGainPopup.tsx
│   │   └── lib/
│   │       ├── api.ts              ← API client functions
│   │       └── mockData.ts         ← Front-end mock data (15KB)
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   └── eslint.config.mjs
│
├── backend/                        ← FastAPI app ✅
│   ├── main.py                     ← FastAPI entry (5 routers registered)
│   ├── config.py                   ← Neon DB connection (SQLAlchemy async)
│   ├── middleware.py               ← Rate limiting
│   ├── requirements.txt            ← 12 dependencies
│   ├── .env                        ← Environment config (exists)
│   ├── models/
│   │   └── schemas.py              ← ORM models + Pydantic schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── challenges.py
│   │   ├── problems.py             ← Includes seed/sample data
│   │   ├── skills.py
│   │   ├── submissions.py
│   │   └── users.py                ← Includes leaderboard endpoint
│   └── services/
│       ├── __init__.py
│       ├── ai_client.py
│       ├── ai_evaluator.py
│       ├── challenge_generator.py
│       ├── code_executor.py
│       ├── pipeline.py             ← Full AI eval pipeline
│       └── skill_analyzer.py
│
└── data/                           ← Problem datasets directory ⚠️ (nearly empty)
    └── temp.txt                    ← Placeholder only
```

---

## 2. Dataset Inventory

| Dataset | Roadmap Expected File | Status | Details |
|---------|----------------------|--------|---------|
| **Codeforces API data** | `data/codeforces_problems.json` | ❌ **MISSING** | File does not exist. No download has occurred. |
| **Kaggle LeetCode dataset** | `data/leetcode_dataset.csv` | ❌ **MISSING** | File does not exist. No download has occurred. |
| **HuggingFace LeetCode** | (optional) | ❌ **NOT PRESENT** | Not referenced in codebase. |
| **Seed script** | `data/seed_db.py` | ❌ **MISSING** | No seed script exists in `data/`. |
| **Inline mock/seed data** | `backend/routers/problems.py` | ✅ **PRESENT** | ~16KB of sample problems hardcoded in the router (line 20). |
| **Frontend mock data** | `frontend/src/lib/mockData.ts` | ✅ **PRESENT** | ~15KB mock data with `leetcode_dataset` source references. |

> [!WARNING]
> The `data/` directory is effectively empty — it contains only a git-test placeholder file. **No real datasets have been downloaded.** This is a critical dependency for Member 4's Phase 1 work (data pipeline).

---

## 3. Database / Schema Readiness Report

### 3.1 Database Technology

> [!IMPORTANT]
> **Deviation from Roadmap:** The roadmap specifies **Supabase** (PostgreSQL + Auth + Realtime). The actual implementation uses **Neon DB** (PostgreSQL) with **SQLAlchemy async + asyncpg**. There is **zero Supabase code** anywhere in the codebase.

| Aspect | Roadmap Spec | Actual Implementation |
|--------|-------------|----------------------|
| **Database** | Supabase PostgreSQL | Neon DB PostgreSQL |
| **ORM** | Direct Supabase client | SQLAlchemy async + asyncpg |
| **Auth** | Supabase Auth | Not implemented (mock user) |
| **Connection** | `supabase-py` | `asyncpg` via SQLAlchemy |
| **Env var** | `SUPABASE_URL` + `SUPABASE_KEY` | `NEON_DB_URL` |

### 3.2 Schema/Table Presence Check

| Table | Roadmap | Actual ORM Model | Status |
|-------|---------|-------------------|--------|
| **profiles** | ✅ Required | `ProfileModel` in `schemas.py` | ✅ EXISTS — Fields: id, username, display_name, avatar_url, level, xp, total_solved, current_streak, longest_streak |
| **problems** | ✅ Required | `ProblemModel` in `schemas.py` | ✅ EXISTS — Fields: id, title, description, difficulty, topic, xp_reward, time_limit_seconds, test_cases, etc. |
| **submissions** | ✅ Required | `SubmissionModel` in `schemas.py` | ✅ EXISTS — Fields: id, user_id, problem_id, code, language, status, test_cases_passed, etc. |
| **user_skills** | ✅ Required | — | ❌ **MISSING** — No ORM model or table definition exists |
| **user_achievements** | ✅ Required | — | ❌ **MISSING** — No ORM model or table definition exists |
| **leaderboard** (view) | ✅ Required | — | ⚠️ **PARTIAL** — Endpoint exists in `users.py` (mock data), no materialized view |

> [!CAUTION]  
> **`user_skills` and `user_achievements` tables are completely absent.** These are critical for Member 4's gamification system (XP, levels, achievements, skill tracking). They must be created before gamification logic can be implemented.

### 3.3 Schema Differences from Roadmap

| Field | Roadmap Schema | Actual Schema | Impact |
|-------|---------------|---------------|--------|
| `profiles.last_solve_date` | ✅ Present | ❌ Missing | Needed for streak calculation |
| `problems.topics` | `TEXT[]` (array) | `topic` (single `String`) | Only 1 topic per problem instead of multiple |
| `problems.skills_tested` | `TEXT[]` (array) | ❌ Missing | Needed for skill-targeted problem selection |
| `problems.source` | ✅ Present | ❌ Missing | Needed for dataset tracking |
| `problems.source_id` | ✅ Present | ❌ Missing | Needed for dedup |
| `problems.difficulty_score` | `INTEGER (1-10)` | ❌ Missing | Only string difficulty exists |
| `submissions.ai_evaluation` | `JSONB` | ❌ Missing (from ORM) | AI eval not persisted |
| `submissions.xp_earned` | ✅ Present | ❌ Missing (from ORM) | XP not tracked per submission |

---

## 4. Environment Readiness

### 4.1 Environment Files

| File | Status | Contents |
|------|--------|----------|
| `backend/.env` | ✅ EXISTS | `NEON_DB_URL` (placeholder), `ENVIRONMENT=development`, `GROQ_API_KEY` (empty), `GEMINI_API_KEY` (empty) |
| `frontend/.env` or `.env.local` | ❌ **NOT FOUND** | `.gitignore` covers `.env*` but no env file exists |

### 4.2 Backend Dependencies (`requirements.txt`)

| Package | Version | Status |
|---------|---------|--------|
| fastapi | 0.115.0 | ✅ Listed |
| uvicorn[standard] | 0.30.6 | ✅ Listed |
| pydantic | 2.9.2 | ✅ Listed |
| pydantic-settings | 2.5.2 | ✅ Listed |
| httpx | 0.27.2 | ✅ Listed |
| python-dotenv | 1.0.1 | ✅ Listed |
| asyncpg | 0.29.0 | ✅ Listed |
| sqlalchemy[asyncio] | 2.0.35 | ✅ Listed |
| greenlet | 3.1.1 | ✅ Listed |
| groq | 0.4.1 | ✅ Listed (AI - Member 3) |
| google-generativeai | 0.3.2 | ✅ Listed (AI - Member 3) |
| **supabase** | — | ❌ NOT listed (matches Neon decision) |

### 4.3 Frontend Dependencies (`package.json`)

| Package | Version | Roadmap Required | Status |
|---------|---------|-----------------|--------|
| next | 16.2.2 | ✅ | ✅ Installed |
| react | 19.2.4 | ✅ | ✅ Installed |
| @monaco-editor/react | ^4.7.0 | ✅ | ✅ Installed |
| recharts | ^3.8.1 | ✅ | ✅ Installed |
| framer-motion | ^12.38.0 | ✅ | ✅ Installed |
| lucide-react | ^1.7.0 | ✅ | ✅ Installed |
| axios | ^1.14.0 | ✅ | ✅ Installed |
| tailwindcss | ^4 | ✅ | ✅ Installed (dev) |

---

## 5. Services Inventory (Backend)

| Service | Roadmap Expected | Actual File | Status |
|---------|-----------------|-------------|--------|
| `ai_evaluator.py` | ✅ | ✅ Exists (3.8KB) | Built by Member 3 |
| `challenge_generator.py` | ✅ | ✅ Exists (1.9KB) | Built by Member 3 |
| `skill_analyzer.py` | ✅ | ✅ Exists (1.7KB) | Built by Member 3 |
| `code_executor.py` | ✅ | ✅ Exists (8.9KB) | Built by Member 2 |
| `ai_client.py` | ✅ | ✅ Exists (1.6KB) | LLM client wrapper |
| `pipeline.py` | — | ✅ Exists (5.9KB) | Full eval pipeline (bonus) |
| **`gamification.py`** | ✅ Required | ❌ **MISSING** | **Member 4 responsibility** |

---

## 6. Summary & Action Items for Member 4

### ✅ What's Ready
- Monorepo structure (`frontend/`, `backend/`, `data/`) exists
- Frontend is well-built: 4 pages, 14 components, mock data layer
- Backend has 5 routers, 6 services, ORM models for core tables
- All frontend dependencies installed per roadmap
- Backend dependencies installed (minus Supabase — deliberate Neon pivot)
- AI pipeline is functional (Member 3's work)

### ❌ Blockers for Member 4 Phase 1

| # | Blocker | Severity | Action Needed |
|---|---------|----------|---------------|
| 1 | **No datasets downloaded** — `data/` is empty | 🔴 Critical | Download Codeforces API response + Kaggle dataset |
| 2 | **No `seed_db.py` script** | 🔴 Critical | Must create parser/seeder for DB |
| 3 | **`user_skills` table missing** | 🔴 Critical | Must create ORM model |
| 4 | **`user_achievements` table missing** | 🔴 Critical | Must create ORM model |
| 5 | **`gamification.py` service missing** | 🔴 Critical | Must create XP/level/achievement logic |
| 6 | **Schema gaps** (see §3.3) | 🟡 Medium | Need `last_solve_date`, `skills_tested`, `source`, `xp_earned`, `ai_evaluation` on existing models |
| 7 | **Neon DB vs Supabase deviation** | 🟡 Medium | Confirm with team this is intentional — affects schema approach |
| 8 | **No frontend `.env`** | 🟢 Low | May need `NEXT_PUBLIC_API_URL` for backend connection |

### ❓ Questions Requiring Team Confirmation

1. **Supabase → Neon DB:** This is a significant deviation from the roadmap. Is this intentional and confirmed? Member 4's data pipeline and gamification work should continue with Neon DB + SQLAlchemy?
2. **Problem schema `topic` (single) vs `topics` (array):** Should Member 4 adapt the data pipeline to the existing single-topic schema, or should the schema be updated to match the roadmap's array format?
3. **Missing fields on existing models:** Should Member 4 add `source`, `source_id`, `skills_tested`, `difficulty_score` to `ProblemModel` and `xp_earned`, `ai_evaluation` to `SubmissionModel`? This modifies Member 2's work.

---

> [!NOTE]
> **No files were created, modified, or deleted during this inspection.** This report is purely observational.
