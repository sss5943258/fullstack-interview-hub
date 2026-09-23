import { reactQuestions } from './reactQuestions';
import { angularQuestions } from './angularQuestions';
import { dotnetQuestions } from './dotnetQuestions';
import { sqlQuestions } from './sqlQuestions';
import { devopsQuestions } from './devopsQuestions';

export const ALL_CATEGORIES = [
  { id: 'All', name: '全部領域', icon: 'Sparkles', color: 'from-cyan-500 to-blue-600' },
  { id: 'React', name: 'React', icon: 'Code2', color: 'from-cyan-400 to-blue-500' },
  { id: 'Angular', name: 'Angular', icon: 'Shield', color: 'from-red-500 to-pink-600' },
  { id: '.NET Core', name: '.NET Core', icon: 'Zap', color: 'from-purple-500 to-indigo-600' },
  { id: 'SQL', name: 'SQL & DB', icon: 'Database', color: 'from-emerald-400 to-teal-600' },
  { id: 'K8s & Docker', name: 'K8s & Docker', icon: 'Container', color: 'from-blue-500 to-indigo-500' },
];

export const allQuestions = [
  ...reactQuestions,
  ...angularQuestions,
  ...dotnetQuestions,
  ...sqlQuestions,
  ...devopsQuestions,
];

// Helper functions
export const getQuestionsByCategory = (category) => {
  if (!category || category === 'All') return allQuestions;
  return allQuestions.filter(q => q.category === category);
};

export const getQuestionsByDifficulty = (questions, difficulty) => {
  if (!difficulty || difficulty === 'All') return questions;
  return questions.filter(q => q.difficulty === difficulty);
};

export const searchQuestions = (questions, keyword) => {
  if (!keyword || !keyword.trim()) return questions;
  const term = keyword.toLowerCase().trim();
  return questions.filter(q =>
    q.title.toLowerCase().includes(term) ||
    q.summary.toLowerCase().includes(term) ||
    q.tags.some(t => t.toLowerCase().includes(term))
  );
};

// LocalStorage Persistence Helpers
const STORAGE_KEYS = {
  BOOKMARKS: 'fih_bookmarks_v1',
  MASTERED: 'fih_mastered_v1',
  QUIZ_STATS: 'fih_quiz_stats_v1',
};

export const loadStoredSet = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    console.error('Failed to load storage key:', key, e);
    return new Set();
  }
};

export const saveStoredSet = (key, setObj) => {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(setObj)));
  } catch (e) {
    console.error('Failed to save storage key:', key, e);
  }
};

export const loadStoredStats = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_STATS);
    return raw ? JSON.parse(raw) : { totalQuizzes: 0, totalQuestions: 0, totalCorrect: 0, history: [] };
  } catch (e) {
    return { totalQuizzes: 0, totalQuestions: 0, totalCorrect: 0, history: [] };
  }
};

export const saveStoredStats = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save quiz stats:', e);
  }
};

export { STORAGE_KEYS };
