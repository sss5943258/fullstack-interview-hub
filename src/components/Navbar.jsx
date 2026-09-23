import React from 'react';
import { Sparkles, BookOpen, Layers, Award, BarChart3, CheckCircle2, Bookmark } from 'lucide-react';

export default function Navbar({
  activeMode,
  setActiveMode,
  masteredCount,
  bookmarkCount,
  totalQuestions,
  onOpenStats
}) {
  const percent = Math.round((masteredCount / totalQuestions) * 100) || 0;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveMode('bank')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400">
                  Fullstack Hub
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">全端工程師高頻面試題庫</p>
            </div>
          </div>

          {/* Mode Switching Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveMode('bank')}
              className={`flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeMode === 'bank'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">題庫瀏覽</span>
              <span className="md:hidden">題庫</span>
            </button>

            <button
              onClick={() => setActiveMode('flashcard')}
              className={`flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeMode === 'flashcard'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden md:inline">3D 翻牌刷題</span>
              <span className="md:hidden">翻牌</span>
            </button>

            <button
              onClick={() => setActiveMode('quiz')}
              className={`flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeMode === 'quiz'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span className="hidden md:inline">模擬測驗</span>
              <span className="md:hidden">測驗</span>
            </button>
          </nav>

          {/* Progress Pill & Stats Trigger */}
          <div className="flex items-center space-x-3">
            {/* Mastered Progress Widget */}
            <div 
              onClick={onOpenStats}
              className="hidden lg:flex items-center space-x-3 px-3 py-1.5 bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-xl cursor-pointer transition-all duration-200 group"
            >
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-slate-400 group-hover:text-cyan-400 transition-colors">
                  學習進度
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {masteredCount} / {totalQuestions} ({percent}%)
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-800/80 flex items-center justify-center relative">
                <svg className="w-8 h-8 transform -rotate-90">
                  <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" className="text-slate-700" fill="transparent" />
                  <circle 
                    cx="16" 
                    cy="16" 
                    r="12" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    className="text-cyan-400 transition-all duration-500" 
                    fill="transparent" 
                    strokeDasharray={75.39}
                    strokeDashoffset={75.39 - (75.39 * percent) / 100}
                  />
                </svg>
                <CheckCircle2 className="w-4 h-4 text-cyan-400 absolute" />
              </div>
            </div>

            {/* Stats Modal Button */}
            <button
              onClick={onOpenStats}
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all relative"
              title="查看詳細進度與紀錄"
            >
              <BarChart3 className="w-5 h-5" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-md">
                  {bookmarkCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
