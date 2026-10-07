import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import QuestionList from './components/QuestionList';
import FlashcardMode from './components/FlashcardMode';
import MockQuizMode from './components/MockQuizMode';
import TopicGuidesMode from './components/TopicGuidesMode';
import StatsModal from './components/StatsModal';
import { 
  allQuestions, 
  loadStoredSet, 
  saveStoredSet, 
  STORAGE_KEYS 
} from './data';

/**
 * App - 應用程式根元件 (Root Component)
 * 
 * 【React 小白學習筆記】：
 * 1. 單向資料流 (One-Way Data Flow)：App 作為頂層元件，持有全域狀態（如 activeMode, masteredSet），
 *    並透過 props 將資料向下傳遞給子元件（Navbar, QuestionList, TopicGuidesMode 等）。
 * 2. 惰性初始化 (Lazy Initial State)：`useState(() => loadStoredSet(...))` 傳入函式，
 *    只會在元件「初次載入 (Initial Mount)」時執行一次，避免每次 Re-render 都重複讀取 localStorage，大幅提升效能！
 * 3. 副作用處理 (useEffect)：監聽 masteredSet 與 bookmarkSet 的變動，自動將最新資料同步持久化至瀏覽器 localStorage。
 */
export default function App() {
  // Practice Mode: 'bank' (題庫) | 'guides' (專題精講) | 'flashcard' (翻牌) | 'quiz' (測驗)
  const [activeMode, setActiveMode] = useState('bank');
  
  // LocalStorage state sets
  const [masteredSet, setMasteredSet] = useState(() => loadStoredSet(STORAGE_KEYS.MASTERED));
  const [bookmarkSet, setBookmarkSet] = useState(() => loadStoredSet(STORAGE_KEYS.BOOKMARKS));
  
  // Stats Modal open state
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Persistence Effects: 當 masteredSet 改變時，寫入 localStorage
  useEffect(() => {
    saveStoredSet(STORAGE_KEYS.MASTERED, masteredSet);
  }, [masteredSet]);

  // Persistence Effects: 當 bookmarkSet 改變時，寫入 localStorage
  useEffect(() => {
    saveStoredSet(STORAGE_KEYS.BOOKMARKS, bookmarkSet);
  }, [bookmarkSet]);

  /**
   * toggleMastered - 切換題目是否已掌握 (Mastered) 的狀態
   * 
   * 【React 小白學習筆記 - 函數式更新 (Functional Update)】：
   * 當新狀態依賴於前一個狀態時，使用 `setMasteredSet(prev => ...)` 形式。
   * 注意不可變性 (Immutability)：我們必須 `new Set(prev)` 複製一份新物件再修改，
   * 絕不能直接在舊的 prev 上進行 mutation，這樣 React 才能正確偵測到依賴變化並觸發畫面更新！
   * 
   * @param {string} id - 題目 ID (例如 'react-01')
   */
  const toggleMastered = (id) => {
    setMasteredSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /**
   * toggleBookmark - 切換題目是否已收藏 (Bookmark) 的狀態
   * 
   * 【React 小白學習筆記】：
   * 與 toggleMastered 相同，遵循「不可變狀態原則 (Immutable State Principle)」，
   * 建立全新 Set 實例以確保狀態更新能夠安全觸發所有依賴此 Set 的子元件重繪。
   * 
   * @param {string} id - 題目 ID (例如 'react-18')
   */
  const toggleBookmark = (id) => {
    setBookmarkSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /**
   * handleResetAll - 清空所有本機儲存資料與統計數據
   * 
   * 【React 小白學習筆記】：
   * 同步重設多個 State，在 React 18 / 19 中具備「自動批次處理 (Automatic Batching)」，
   * 連續呼叫兩次 setState 只會引發一次 Re-render，不會有閃爍問題。
   */
  const handleResetAll = () => {
    setMasteredSet(new Set());
    setBookmarkSet(new Set());
    localStorage.removeItem(STORAGE_KEYS.MASTERED);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_STATS);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-white">
      
      {/* Dynamic Background Glow Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main App Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* Navigation Bar */}
        <Navbar
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          masteredCount={masteredSet.size}
          bookmarkCount={bookmarkSet.size}
          totalQuestions={allQuestions.length}
          onOpenStats={() => setIsStatsOpen(true)}
        />

        {/* View Router Main Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {activeMode === 'bank' && (
            <QuestionList
              allQuestions={allQuestions}
              masteredSet={masteredSet}
              bookmarkSet={bookmarkSet}
              toggleMastered={toggleMastered}
              toggleBookmark={toggleBookmark}
            />
          )}

          {activeMode === 'guides' && (
            <TopicGuidesMode
              onSwitchToBank={() => setActiveMode('bank')}
            />
          )}

          {activeMode === 'flashcard' && (
            <FlashcardMode
              allQuestions={allQuestions}
              masteredSet={masteredSet}
              bookmarkSet={bookmarkSet}
              toggleMastered={toggleMastered}
              toggleBookmark={toggleBookmark}
            />
          )}

          {activeMode === 'quiz' && (
            <MockQuizMode
              allQuestions={allQuestions}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="glass-panel border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 relative z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 Fullstack Interview Hub • 全端工程師熱門面試考題練習平台</span>
            <div className="flex items-center space-x-3">
              <span className="text-slate-400 font-semibold">React • Angular • .NET Core • SQL • K8s & Docker</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Statistics Modal */}
      {isStatsOpen && (
        <StatsModal
          allQuestions={allQuestions}
          masteredSet={masteredSet}
          bookmarkSet={bookmarkSet}
          onClose={() => setIsStatsOpen(false)}
          onResetAll={handleResetAll}
        />
      )}

    </div>
  );
}
