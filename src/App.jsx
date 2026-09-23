import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import QuestionList from './components/QuestionList';
import FlashcardMode from './components/FlashcardMode';
import MockQuizMode from './components/MockQuizMode';
import StatsModal from './components/StatsModal';
import { 
  allQuestions, 
  loadStoredSet, 
  saveStoredSet, 
  STORAGE_KEYS 
} from './data';

export default function App() {
  // Practice Mode: 'bank' | 'flashcard' | 'quiz'
  const [activeMode, setActiveMode] = useState('bank');
  
  // LocalStorage state sets
  const [masteredSet, setMasteredSet] = useState(() => loadStoredSet(STORAGE_KEYS.MASTERED));
  const [bookmarkSet, setBookmarkSet] = useState(() => loadStoredSet(STORAGE_KEYS.BOOKMARKS));
  
  // Stats Modal open state
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Persistence Effects
  useEffect(() => {
    saveStoredSet(STORAGE_KEYS.MASTERED, masteredSet);
  }, [masteredSet]);

  useEffect(() => {
    saveStoredSet(STORAGE_KEYS.BOOKMARKS, bookmarkSet);
  }, [bookmarkSet]);

  // Toggle Handlers
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

  // Reset all stored data
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
