# Gamification Engine & API Documentation

## Gamification Logic
SkillSprint awards experience points (XP) based on problem difficulty, submission success, and various multipliers.

- **Base XP Values:** 
  - Easy: 50 XP
  - Medium: 100 XP
  - Hard: 200 XP
- **First Solve Bonus:** `+ 100 XP` per problem on the first correct attempt.
- **AI Score Bonus:** AI Evaluation acts as a multiplier. (XP is boosted based on clean, optimal code up to +20%).
- **Streaks:** Solving problems consecutively on different days applies a combo multiplier scaling from 1.1x to 2.0x (capped at 5 days).
- **Achievements:** Earned natively on the backend after evaluations (`first_solve`, `streak_3`, `boss_slayer`, etc.). Unlocks trigger real-time UI components.

## Leaderboard
The Leaderboard is calculated universally based on the cumulative `xp` recorded in each user's `ProfileModel`. 
- **Endpoint:** `GET /api/leaderboard`
- **Output:** Fully ranked arrays returning user position, level, XP, and avatar graphics.

## Boss Fight Flow
The Boss flow incorporates multi-skill problems mapped dynamically to a user's identified weaknesses.
- **XP Yield:** Submitting code correctly against a `boss` difficulty nets a massive **500 XP**.
- **Special Flagging:** Successfully defeating a Boss problem uniquely issues the `boss_slayer` achievement and prompts customized, dramatic visual animations on the client (Health bar/damage visualizations in frontend arena).
