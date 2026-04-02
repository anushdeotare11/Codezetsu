// ===== MOCK DATA FOR CODEZETSU DEMO =====

export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  difficultyScore: number;
  topics: string[];
  skillsTested: string[];
  testCases: { input: string; expected: string }[];
  hints: string[];
  source: string;
  starterCode: Record<string, string>;
  examples: { input: string; output: string; explanation: string }[];
  bossImageUrl?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastSolveDate: string;
  createdAt: string;
}

export interface Submission {
  id: number;
  problemId: number;
  problemTitle: string;
  code: string;
  language: string;
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit' | 'pending';
  executionTimeMs: number;
  testCasesPassed: number;
  totalTestCases: number;
  aiEvaluation: AIEvaluation | null;
  xpEarned: number;
  submittedAt: string;
}

export interface AIEvaluation {
  overallScore: number;
  correctness: number;
  efficiency: { timeComplexity: string; spaceComplexity: string; score: number };
  codeQuality: number;
  edgeCaseHandling: number;
  feedback: string;
  weaknesses: string[];
  suggestions: string[];
  skillScores: Record<string, number>;
}

export interface SkillData {
  skillName: string;
  score: number;
  fullMark: number;
}

export interface Achievement {
  key: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  xp: number;
  level: number;
  currentStreak: number;
  problemsSolved: number;
}

// ===== LEVEL THRESHOLDS =====
export const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Novice Coder', xp: 0 },
  { level: 10, title: 'Code Apprentice', xp: 2000 },
  { level: 20, title: 'Bug Squasher', xp: 5000 },
  { level: 30, title: 'Algorithm Adept', xp: 10000 },
  { level: 40, title: 'Data Warrior', xp: 20000 },
  { level: 42, title: 'Architect', xp: 42000 },
  { level: 50, title: 'Efficiency Expert', xp: 60000 },
  { level: 60, title: 'Pattern Master', xp: 85000 },
  { level: 80, title: 'Algorithm Legend', xp: 120000 },
  { level: 100, title: 'Arena Champion', xp: 200000 },
];

export function getLevelInfo(level: number) {
  return LEVEL_THRESHOLDS.find(l => l.level === level) || LEVEL_THRESHOLDS[0];
}

export function getNextLevelXP(level: number): number {
  const next = LEVEL_THRESHOLDS.find(l => l.level === level + 1);
  return next ? next.xp : 99999;
}

// ===== MOCK PROBLEMS =====
export const mockProblems: Problem[] = [
  {
    id: 1,
    title: 'Shadow Protocol',
    description: `A malicious script has infiltrated the neural link. Your objective is to decrypt the Shadow Protocol by identifying the hidden recursion patterns within the signal stream.\n\n### Technical Specifications\n- Process a stream of nested integer arrays.\n- Extract the sum of all elements at an even depth.\n- Optimize for time complexity O(N).\n- Handle memory overflow for depths exceeding 2048.\n\n**Example:**\nInput: \`[[1, 2], [3, [4, 5]], 6]\` -> Output: \`15\``,
    difficulty: 'medium',
    difficultyScore: 6,
    topics: ['recursion', 'arrays', 'optimization'],
    skillsTested: ['algorithm_knowledge', 'code_efficiency', 'problem_solving'],
    testCases: [
      { input: '[[1, 2], [3, [4, 5]], 6]', expected: '15' },
    ],
    hints: ['Think about tracking the current depth during recursion.', 'Only sum elements when depth % 2 === 0.'],
    source: 'stitch_generated',
    starterCode: {
      python: 'def decryptShadowProtocol(stream: list) -> int:\n    # Your neural decryption here\n    pass',
      javascript: 'function decryptShadowProtocol(stream) {\n    // Your neural decryption here\n}',
    },
    examples: [
      { input: '[[1, 2], [3, [4, 5]], 6]', output: '15', explanation: 'Elements at even depths are summed.' },
    ],
  },
  {
    id: 2,
    title: 'Longest Substring Without Repeating Characters',
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.\n\n**Constraints:**\n- 0 <= s.length <= 5 * 10^4\n- s consists of English letters, digits, symbols and spaces.`,
    difficulty: 'medium',
    difficultyScore: 5,
    topics: ['strings', 'sliding_window', 'hash_map'],
    skillsTested: ['algorithm_knowledge', 'code_efficiency', 'edge_cases'],
    testCases: [
      { input: 's = "abcabcbb"', expected: '3' },
      { input: 's = "bbbbb"', expected: '1' },
      { input: 's = "pwwkew"', expected: '3' },
      { input: 's = ""', expected: '0' },
    ],
    hints: ['Think about the sliding window technique.', 'Use a set or map to track characters in the current window.'],
    source: 'leetcode_dataset',
    starterCode: {
      python: 'def lengthOfLongestSubstring(s: str) -> int:\n    # Your code here\n    pass',
      javascript: 'function lengthOfLongestSubstring(s) {\n    // Your code here\n}',
      cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n    }\n};',
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n    }\n}',
    },
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
    ],
  },
  {
    id: 3,
    title: 'Merge K Sorted Lists',
    description: `You are given an array of \`k\` linked-lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.\n\n**Constraints:**\n- k == lists.length\n- 0 <= k <= 10^4\n- 0 <= lists[i].length <= 500\n- -10^4 <= lists[i][j] <= 10^4`,
    difficulty: 'hard',
    difficultyScore: 8,
    topics: ['linked_list', 'heap', 'divide_and_conquer'],
    skillsTested: ['algorithm_knowledge', 'data_structures', 'code_efficiency', 'problem_solving'],
    testCases: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]' },
      { input: 'lists = []', expected: '[]' },
      { input: 'lists = [[]]', expected: '[]' },
    ],
    hints: ['Consider using a min-heap/priority queue.', 'You could also use divide and conquer to merge pairs.'],
    source: 'leetcode_dataset',
    starterCode: {
      python: 'def mergeKLists(lists):\n    # Your code here\n    pass',
      javascript: 'function mergeKLists(lists) {\n    // Your code here\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        // Your code here\n    }\n};',
      java: 'class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Your code here\n    }\n}',
    },
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'Merging all sorted lists produces one large sorted list.' },
    ],
  },
  {
    id: 4,
    title: 'The Shadow Algorithm',
    description: `**⚔️ BOSS FIGHT ⚔️**\n\nYou are trapped in the Shadow Dungeon. To escape, you must decode the Shadow Algorithm.\n\nGiven a matrix of size \`n x n\` filled with integers, find the maximum sum path from the top-left to the bottom-right corner. You can only move right or down.\n\nBut there's a twist: every 3rd cell you visit applies a "shadow curse" that halves its value (integer division).\n\n**Constraints:**\n- 1 <= n <= 100\n- -1000 <= matrix[i][j] <= 1000`,
    difficulty: 'boss',
    difficultyScore: 9,
    topics: ['dynamic_programming', 'matrix', 'state_tracking'],
    skillsTested: ['algorithm_knowledge', 'problem_solving', 'edge_cases', 'code_efficiency'],
    testCases: [
      { input: 'matrix = [[1,3,1],[1,5,1],[4,2,1]]', expected: '12' },
      { input: 'matrix = [[5]]', expected: '5' },
    ],
    hints: ['Think DP with an extra dimension for curse tracking.', 'dp[i][j][k] where k = steps since last curse.'],
    source: 'ai_generated',
    starterCode: {
      python: 'def shadowAlgorithm(matrix: list[list[int]]) -> int:\n    # Defeat the Shadow!\n    pass',
      javascript: 'function shadowAlgorithm(matrix) {\n    // Defeat the Shadow!\n}',
      cpp: 'class Solution {\npublic:\n    int shadowAlgorithm(vector<vector<int>>& matrix) {\n        // Defeat the Shadow!\n    }\n};',
      java: 'class Solution {\n    public int shadowAlgorithm(int[][] matrix) {\n        // Defeat the Shadow!\n    }\n}',
    },
    examples: [
      { input: 'matrix = [[1,3,1],[1,5,1],[4,2,1]]', output: '12', explanation: 'Path: 1→3→5→2→1 with shadow curse applied on the 3rd step.' },
    ],
    bossImageUrl: '/images/boss_dragon.png',
  },
];

export const mockUser: UserProfile = {
  id: 'usr_codezetsu_001',
  username: 'Codezetsu',
  displayName: 'Codezetsu',
  avatarUrl: '/images/user_avatar.png',
  xp: 12400,
  level: 42,
  currentStreak: 7,
  longestStreak: 30,
  lastSolveDate: '2026-04-02',
  createdAt: '2026-01-01',
};

// ===== MOCK SKILLS =====
export const mockSkills: SkillData[] = [
  { skillName: 'Algorithm', score: 7.2, fullMark: 10 },
  { skillName: 'Data Structures', score: 6.8, fullMark: 10 },
  { skillName: 'Efficiency', score: 5.4, fullMark: 10 },
  { skillName: 'Edge Cases', score: 4.9, fullMark: 10 },
  { skillName: 'Readability', score: 8.1, fullMark: 10 },
  { skillName: 'Problem Solving', score: 6.5, fullMark: 10 },
];

// ===== MOCK SUBMISSIONS =====
export const mockSubmissions: Submission[] = [
  {
    id: 1,
    problemId: 101,
    problemTitle: 'Binary Search Optimization',
    code: '',
    language: 'python',
    status: 'accepted',
    executionTimeMs: 120,
    testCasesPassed: 10,
    totalTestCases: 10,
    aiEvaluation: {
      overallScore: 9,
      correctness: 10,
      efficiency: { timeComplexity: 'O(log n)', spaceComplexity: 'O(1)', score: 9 },
      codeQuality: 8,
      edgeCaseHandling: 8,
      feedback: 'Excellent optimization of the search space.',
      weaknesses: [],
      suggestions: [],
      skillScores: { algorithm_knowledge: 9, data_structures: 9, code_efficiency: 9, edge_cases: 7, readability: 8, problem_solving: 9 },
    },
    xpEarned: 150,
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    problemId: 102,
    problemTitle: 'Load Balancer Logic',
    code: '',
    language: 'python',
    status: 'wrong_answer',
    executionTimeMs: 45,
    testCasesPassed: 3,
    totalTestCases: 8,
    aiEvaluation: {
      overallScore: 4,
      correctness: 4,
      efficiency: { timeComplexity: 'O(n)', spaceComplexity: 'O(n)', score: 5 },
      codeQuality: 5,
      edgeCaseHandling: 2,
      feedback: 'Missing weighted round-robin distribution.',
      weaknesses: [],
      suggestions: [],
      skillScores: { algorithm_knowledge: 4, data_structures: 5, code_efficiency: 5, edge_cases: 2, readability: 6, problem_solving: 4 },
    },
    xpEarned: 0,
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    problemId: 103,
    problemTitle: 'JWT Authentication Flow',
    code: '',
    language: 'javascript',
    status: 'accepted',
    executionTimeMs: 60,
    testCasesPassed: 5,
    totalTestCases: 5,
    aiEvaluation: {
      overallScore: 8,
      correctness: 10,
      efficiency: { timeComplexity: 'O(1)', spaceComplexity: 'O(1)', score: 10 },
      codeQuality: 7,
      edgeCaseHandling: 7,
      feedback: 'Secure implementation of token verification.',
      weaknesses: [],
      suggestions: [],
      skillScores: { algorithm_knowledge: 8, data_structures: 6, code_efficiency: 10, edge_cases: 7, readability: 7, problem_solving: 8 },
    },
    xpEarned: 300,
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ===== MOCK ACHIEVEMENTS =====
export const mockAchievements: Achievement[] = [
  { key: 'first_blood', name: 'First Blood', description: 'Solve your first problem', icon: '🏆', unlocked: true, unlockedAt: '2026-01-15' },
  { key: 'on_fire', name: 'On Fire', description: '3-day solve streak', icon: '🔥', unlocked: true, unlockedAt: '2026-02-01' },
  { key: 'lightning_fast', name: 'Lightning Fast', description: 'Solve within 5 minutes', icon: '⚡', unlocked: true, unlockedAt: '2026-02-14' },
  { key: 'big_brain', name: 'Big Brain', description: 'Get 10/10 AI evaluation', icon: '🧠', unlocked: false },
  { key: 'bug_hunter', name: 'Bug Hunter', description: 'Fix a wrong answer on retry', icon: '🐛', unlocked: true, unlockedAt: '2026-03-01' },
  { key: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat a Boss Fight', icon: '👑', unlocked: false },
  { key: 'sharpshooter', name: 'Sharpshooter', description: '5 first-attempt solves in a row', icon: '🎯', unlocked: false },
  { key: 'growth_mindset', name: 'Growth Mindset', description: 'Improve weakest skill by 3 points', icon: '📈', unlocked: true, unlockedAt: '2026-03-20' },
  { key: 'peak_performance', name: 'Peak Performance', description: 'All skills above 7/10', icon: '🏔️', unlocked: false },
  { key: 'diamond_coder', name: 'Diamond Coder', description: 'Reach Level 10', icon: '💎', unlocked: false },
];

// ===== MOCK LEADERBOARD =====
export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, id: 'usr_001', username: 'neuralninja', displayName: 'Neural Ninja', avatarUrl: '', xp: 15200, level: 9, currentStreak: 21, problemsSolved: 142 },
  { rank: 2, id: 'usr_002', username: 'quantumquill', displayName: 'Quantum Quill', avatarUrl: '', xp: 12800, level: 9, currentStreak: 15, problemsSolved: 128 },
  { rank: 3, id: 'usr_003', username: 'binaryblaze', displayName: 'Binary Blaze', avatarUrl: '', xp: 9400, level: 8, currentStreak: 8, problemsSolved: 95 },
  { rank: 4, id: 'usr_004', username: 'codespecter', displayName: 'Code Specter', avatarUrl: '', xp: 7200, level: 7, currentStreak: 12, problemsSolved: 78 },
  { rank: 5, id: 'usr_005', username: 'algorithmace', displayName: 'Algorithm Ace', avatarUrl: '', xp: 5800, level: 7, currentStreak: 4, problemsSolved: 63 },
  { rank: 6, id: 'usr_006', username: 'datadragon', displayName: 'Data Dragon', avatarUrl: '', xp: 4100, level: 6, currentStreak: 9, problemsSolved: 51 },
  { rank: 7, id: 'usr_demo_001', username: 'shadowcoder42', displayName: 'Shadow Coder', avatarUrl: '', xp: 2350, level: 5, currentStreak: 7, problemsSolved: 34 },
  { rank: 8, id: 'usr_008', username: 'pixelpython', displayName: 'Pixel Python', avatarUrl: '', xp: 1800, level: 4, currentStreak: 2, problemsSolved: 22 },
  { rank: 9, id: 'usr_009', username: 'byteboss', displayName: 'Byte Boss', avatarUrl: '', xp: 900, level: 3, currentStreak: 1, problemsSolved: 11 },
  { rank: 10, id: 'usr_010', username: 'newbienavy', displayName: 'Newbie Navy', avatarUrl: '', xp: 250, level: 2, currentStreak: 3, problemsSolved: 5 },
];
