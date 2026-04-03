/**
 * API Service Layer - Connects Frontend to Backend
 * 
 * This module provides typed API functions to communicate with the FastAPI backend.
 * Falls back to mock data when the backend is unavailable.
 */

import axios from 'axios';
import {
  Problem,
  UserProfile,
  Submission,
  SkillData,
  Achievement,
  LeaderboardEntry,
  mockProblems,
  mockUser,
  mockSkills,
  mockSubmissions,
  mockAchievements,
  mockLeaderboard,
} from './mockData';

// Backend API base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('API Error:', error.message);
    return Promise.reject(error);
  }
);

// ===== TYPE DEFINITIONS FOR API RESPONSES =====

export interface ApiProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  topic: string;
  xp_reward: number;
  time_limit_seconds: number;
  constraints?: string;
  starter_code?: Record<string, string>;
  test_cases?: Array<{ input: string; expected: string; is_hidden?: boolean }>;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  hints?: string[];
}

export interface ApiSubmissionResult {
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'timeout';
  test_cases_passed: number;
  total_test_cases: number;
  execution_time_ms: number;
  error_message: string | null;
  xp_earned: number;
  ai_evaluation?: {
    score: number;
    feedback: string;
    weaknesses: string[];
    suggestions: string[];
    skill_scores: Record<string, number>;
    hint?: string;
    explanation?: string;
  };
  next_problem?: {
    title: string;
    description: string;
    examples: Array<{ input: string; output: string }>;
    tags: string[];
  };
}

export interface ApiUserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  total_solved: number;
}

export interface ApiUserStats {
  total_submissions: number;
  problems_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  current_streak: number;
  level: number;
  xp: number;
}

export interface ApiLeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  xp: number;
  level: number;
  current_streak: number;
  problems_solved: number;
}

// ===== HELPER FUNCTIONS =====

/**
 * Converts API problem format to frontend Problem format
 */
function convertApiProblemToFrontend(apiProblem: ApiProblem): Problem {
  return {
    id: parseInt(apiProblem.id) || Math.random() * 10000,
    title: apiProblem.title,
    description: apiProblem.description,
    difficulty: apiProblem.difficulty,
    difficultyScore: apiProblem.difficulty === 'easy' ? 3 : 
                     apiProblem.difficulty === 'medium' ? 6 : 
                     apiProblem.difficulty === 'hard' ? 8 : 9,
    topics: [apiProblem.topic],
    skillsTested: ['algorithm_knowledge', 'problem_solving'],
    testCases: apiProblem.test_cases?.map(tc => ({
      input: tc.input,
      expected: tc.expected,
    })) || [],
    hints: apiProblem.hints || [],
    source: 'backend',
    starterCode: apiProblem.starter_code || {
      python: '# Your code here\n',
      javascript: '// Your code here\n',
    },
    examples: apiProblem.examples?.map(ex => ({
      input: ex.input,
      output: ex.output,
      explanation: ex.explanation || '',
    })) || [],
    bossImageUrl: apiProblem.difficulty === 'boss' ? '/images/boss_dragon.png' : undefined,
  };
}

/**
 * Converts API leaderboard entry to frontend format
 */
function convertApiLeaderboardToFrontend(entry: ApiLeaderboardEntry): LeaderboardEntry {
  return {
    rank: entry.rank,
    id: entry.id,
    username: entry.username,
    displayName: entry.display_name,
    avatarUrl: entry.avatar_url || '',
    xp: entry.xp,
    level: entry.level,
    currentStreak: entry.current_streak,
    problemsSolved: entry.problems_solved,
  };
}

// ===== API FUNCTIONS =====

/**
 * Check if the backend API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await api.get('/health');
    return response.data.status === 'healthy';
  } catch {
    return false;
  }
}

/**
 * Fetch all problems from the backend
 */
export async function fetchProblems(filters?: {
  difficulty?: string;
  topic?: string;
}): Promise<Problem[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.topic) params.append('topic', filters.topic);

    // Step 1: Fetch the lightweight list to get all problem IDs
    const listResponse = await api.get(`/api/problems${params.toString() ? '?' + params.toString() : ''}`);
    const problemList: Array<{ id: string; title: string; difficulty: string; topics?: string[]; xp_reward: number }> = listResponse.data;

    if (!problemList || problemList.length === 0) {
      return mockProblems;
    }

    // Step 2: Fetch full details for each problem in parallel
    const fullProblems = await Promise.all(
      problemList.map(async (p) => {
        try {
          const detailResponse = await api.get(`/api/problems/${p.id}`);
          const fullProblem = detailResponse.data;
          // Map backend field names to ApiProblem shape
          return {
            id: fullProblem.id,
            title: fullProblem.title,
            description: fullProblem.description || '',
            difficulty: fullProblem.difficulty,
            topic: (fullProblem.topics || [])[0] || '',
            xp_reward: fullProblem.xp_reward,
            time_limit_seconds: fullProblem.time_limit_seconds || 5,
            constraints: fullProblem.constraints,
            starter_code: fullProblem.starter_code || {},
            test_cases: fullProblem.test_cases || [],
            examples: fullProblem.examples || [],
            hints: fullProblem.hints || [],
            topics: fullProblem.topics || [],
          } as ApiProblem & { topics: string[] };
        } catch {
          // Fallback to list-level data if detail fetch fails
          return {
            id: p.id,
            title: p.title,
            description: '',
            difficulty: p.difficulty as ApiProblem['difficulty'],
            topic: (p.topics || [])[0] || '',
            xp_reward: p.xp_reward,
            time_limit_seconds: 5,
            topics: p.topics || [],
          } as ApiProblem & { topics: string[] };
        }
      })
    );

    return fullProblems.map((p) => ({
      ...convertApiProblemToFrontend(p),
      topics: (p as ApiProblem & { topics: string[] }).topics || [],
    }));
  } catch (error) {
    console.warn('Failed to fetch problems from API, using mock data:', error);
    return mockProblems;
  }
}

/**
 * Fetch a single problem by ID
 */
export async function fetchProblem(problemId: string | number): Promise<Problem | null> {
  try {
    const response = await api.get(`/api/problems/${problemId}`);
    return convertApiProblemToFrontend(response.data);
  } catch (error) {
    console.warn('Failed to fetch problem from API, using mock data:', error);
    const mockProblem = mockProblems.find(p => p.id === Number(problemId));
    return mockProblem || null;
  }
}

/**
 * Submit code for evaluation
 */
export async function submitCode(
  problemId: string | number,
  code: string,
  language: string
): Promise<ApiSubmissionResult> {
  try {
    const response = await api.post('/api/submissions', {
      problem_id: String(problemId),
      code,
      language,
    });
    return response.data;
  } catch (error) {
    console.warn('Failed to submit code to API, using mock result:', error);
    // Return mock result
    const passed = Math.random() > 0.3;
    return {
      status: passed ? 'accepted' : 'wrong_answer',
      test_cases_passed: passed ? 3 : Math.floor(Math.random() * 3),
      total_test_cases: 3,
      execution_time_ms: Math.random() * 100 + 20,
      error_message: null,
      xp_earned: passed ? 100 : 0,
      ai_evaluation: {
        score: Math.floor(Math.random() * 4) + 5,
        feedback: 'Good approach! Consider optimizing for better time complexity.',
        weaknesses: ['Could improve efficiency'],
        suggestions: ['Use a hash map for O(1) lookups'],
        skill_scores: {
          algorithm_knowledge: 7,
          data_structures: 6,
          code_efficiency: 5,
          edge_cases: 6,
          readability: 8,
          problem_solving: 7,
        },
        hint: 'Think about tracking seen elements.',
        explanation: 'The optimal solution uses a hash map.',
      },
    };
  }
}

/**
 * Fetch current user profile
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const response = await api.get('/api/users/me');
    const data = response.data;
    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      avatarUrl: data.avatar_url || '/images/user_avatar.png',
      xp: data.xp,
      level: data.level,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastSolveDate: new Date().toISOString().split('T')[0],
      createdAt: data.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Failed to fetch user profile from API, using mock data:', error);
    return mockUser;
  }
}

/**
 * Fetch user statistics
 */
export async function fetchUserStats(): Promise<ApiUserStats> {
  try {
    const response = await api.get('/api/users/stats');
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch user stats from API, using mock data:', error);
    return {
      total_submissions: mockSubmissions.length,
      problems_solved: 34,
      easy_solved: 20,
      medium_solved: 10,
      hard_solved: 4,
      current_streak: mockUser.currentStreak,
      level: mockUser.level,
      xp: mockUser.xp,
    };
  }
}

/**
 * Fetch user's skill scores for radar chart
 */
export async function fetchUserSkills(): Promise<SkillData[]> {
  try {
    const response = await api.get('/api/skills/radar');
    const data = response.data;
    
    // Convert API skills to frontend format (with skillName for radar chart)
    if (data.skills && Array.isArray(data.skills)) {
      return data.skills.map((skill: { name: string; display_name: string; score: number }) => ({
        skillName: skill.display_name || skill.name.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        score: skill.score,
        fullMark: 10,
      }));
    }
    return mockSkills;
  } catch (error) {
    console.warn('Failed to fetch user skills from API, using mock data:', error);
    return mockSkills;
  }
}

/**
 * Fetch submission history
 */
export async function fetchSubmissionHistory(
  limit?: number,
  problemId?: string
): Promise<Submission[]> {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (problemId) params.append('problem_id', problemId);

    const response = await api.get(`/api/submissions/history${params.toString() ? '?' + params.toString() : ''}`);
    const submissions = response.data;
    
    return submissions.map((sub: Record<string, unknown>) => ({
      id: sub.id,
      problemId: sub.problem_id,
      problemTitle: sub.problem_title || 'Unknown Problem',
      code: sub.code || '',
      language: sub.language,
      status: sub.status,
      executionTimeMs: sub.execution_time_ms,
      testCasesPassed: sub.test_cases_passed,
      totalTestCases: sub.total_test_cases,
      aiEvaluation: sub.ai_evaluation ? {
        overallScore: (sub.ai_evaluation as Record<string, unknown>).score as number || 5,
        correctness: 7,
        efficiency: {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          score: 6,
        },
        codeQuality: 7,
        edgeCaseHandling: 6,
        feedback: (sub.ai_evaluation as Record<string, unknown>).feedback as string || '',
        weaknesses: (sub.ai_evaluation as Record<string, unknown>).weaknesses as string[] || [],
        suggestions: (sub.ai_evaluation as Record<string, unknown>).suggestions as string[] || [],
        skillScores: (sub.ai_evaluation as Record<string, unknown>).skill_scores as Record<string, number> || {},
      } : null,
      xpEarned: sub.xp_earned as number || 0,
      submittedAt: sub.created_at as string || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn('Failed to fetch submission history from API, using mock data:', error);
    return mockSubmissions;
  }
}

/**
 * Fetch leaderboard
 */
export async function fetchLeaderboard(
  limit: number = 10,
  timeframe: 'all' | 'week' | 'today' = 'all'
): Promise<LeaderboardEntry[]> {
  try {
    const response = await api.get(`/api/leaderboard?limit=${limit}`);
    const entries: ApiLeaderboardEntry[] = response.data;
    return entries.map(convertApiLeaderboardToFrontend);
  } catch (error) {
    console.warn('Failed to fetch leaderboard from API, using mock data:', error);
    return mockLeaderboard.slice(0, limit);
  }
}

/**
 * Fetch user achievements
 */
export async function fetchAchievements(): Promise<Achievement[]> {
  // Achievements are typically stored in the backend
  // For now, return mock data with some unlocked based on user stats
  try {
    const stats = await fetchUserStats();
    const achievements = [...mockAchievements];
    
    // Unlock achievements based on stats
    if (stats.problems_solved >= 1) {
      const firstBlood = achievements.find(a => a.key === 'first_blood');
      if (firstBlood) firstBlood.unlocked = true;
    }
    if (stats.current_streak >= 3) {
      const onFire = achievements.find(a => a.key === 'on_fire');
      if (onFire) onFire.unlocked = true;
    }
    if (stats.level >= 10) {
      const diamond = achievements.find(a => a.key === 'diamond_coder');
      if (diamond) diamond.unlocked = true;
    }
    
    return achievements;
  } catch (error) {
    console.warn('Failed to fetch achievements, using mock data:', error);
    return mockAchievements;
  }
}

/**
 * Get available problem topics
 */
export async function fetchProblemTopics(): Promise<string[]> {
  try {
    const response = await api.get('/api/problems/topics/list');
    return response.data.topics || [];
  } catch (error) {
    console.warn('Failed to fetch topics from API, using defaults:', error);
    return ['arrays', 'strings', 'recursion', 'dynamic_programming', 'trees', 'graphs'];
  }
}

/**
 * Fetch the next adaptive challenge based on user weaknesses
 */
export async function fetchNextChallenge(targetWeakness?: string): Promise<{
  problem: Problem;
  targetWeakness: string;
  reason: string;
}> {
  try {
    const response = await api.post('/api/challenge/next', {
      target_weakness: targetWeakness,
    });
    
    const data = response.data;
    const problem: Problem = {
      id: Math.floor(Math.random() * 10000) + 1000,
      title: data.problem.title,
      description: data.problem.description,
      difficulty: data.problem.difficulty || 'medium',
      difficultyScore: 5,
      topics: data.problem.tags || [],
      skillsTested: [data.target_weakness || 'problem_solving'],
      testCases: [],
      hints: [],
      source: 'ai_generated',
      starterCode: {
        python: '# Your code here\n',
        javascript: '// Your code here\n',
      },
      examples: data.problem.examples || [],
    };
    
    return {
      problem,
      targetWeakness: data.target_weakness,
      reason: data.reason,
    };
  } catch (error) {
    console.warn('Failed to fetch next challenge from API, using random mock:', error);
    const randomProblem = mockProblems[Math.floor(Math.random() * mockProblems.length)];
    return {
      problem: randomProblem,
      targetWeakness: 'problem_solving',
      reason: 'Practice makes perfect!',
    };
  }
}

/**
 * Get a hint for a problem
 */
export async function fetchProblemHint(problemId: string): Promise<{
  hint: string;
  source: string;
  hintsAvailable: number;
}> {
  try {
    const response = await api.post(`/api/problems/${problemId}/hint`);
    return {
      hint: response.data.hint,
      source: response.data.source,
      hintsAvailable: response.data.hints_available,
    };
  } catch (error) {
    console.warn('Failed to fetch hint from API:', error);
    return {
      hint: 'Think about the problem constraints and what data structure might help.',
      source: 'fallback',
      hintsAvailable: 1,
    };
  }
}

/**
 * Get an explanation for a problem's solution approach
 */
export async function fetchSolutionExplanation(problemId: string): Promise<{
  explanation: string;
  problemTitle: string;
}> {
  try {
    const response = await api.post(`/api/problems/${problemId}/explain`);
    return {
      explanation: response.data.explanation,
      problemTitle: response.data.problem_title,
    };
  } catch (error) {
    console.warn('Failed to fetch explanation from API:', error);
    return {
      explanation: 'Consider the time and space complexity trade-offs and look for patterns.',
      problemTitle: 'Unknown',
    };
  }
}

// Export types
export type { Problem, UserProfile, Submission, SkillData, Achievement, LeaderboardEntry };
