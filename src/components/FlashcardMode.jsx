import React, { useState, useMemo } from 'react';
import { ALL_CATEGORIES, getQuestionsByCategory } from '../data';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  HelpCircle, 
  Bookmark, 
  Eye, 
  Award,
  BookOpen
} from 'lucide-react';

export default function FlashcardMode({
  allQuestions,
  masteredSet,
  bookmarkSet,
  toggleMastered,
  toggleBookmark
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledList, setShuffledList] = useState(null);

  // Active question list
  const currentPool = useMemo(() => {
    const list = getQuestionsByCategory(selectedCategory);
    return shuffledList ? shuffledList : list;
  }, [selectedCategory, shuffledList]);

  const currentCard = currentPool[currentIndex] || currentPool[0];

  // Handle category change
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffledList(null);
  };

  // Shuffle current deck
  const handleShuffle = () => {
    const list = [...getQuestionsByCategory(selectedCategory)];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setShuffledList(list);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Next & Prev
  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % currentPool.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + currentPool.length) % currentPool.length);
    }, 150);
  };

  if (!currentCard) return null;

  const isMastered = masteredSet.has(currentCard.id);
  const isBookmarked = bookmarkSet.has(currentCard.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Category Tabs & Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Category Selector */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleShuffle}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-semibold transition-all hover:border-cyan-500/40"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>隨機洗牌</span>
          </button>

          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 text-purple-400 border border-slate-800">
            {currentIndex + 1} / {currentPool.length}
          </span>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div className="perspective-1000 w-full min-h-[420px] sm:min-h-[460px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div
          className={`transform-style-3d relative w-full h-full min-h-[420px] sm:min-h-[460px] rounded-3xl transition-transform duration-700 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT SIDE ================= */}
          <div className="backface-hidden absolute inset-0 w-full h-full glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-slate-800 shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-indigo-950/30">
            
            {/* Front Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {currentCard.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  {currentCard.difficulty}
                </span>
              </div>

              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleBookmark(currentCard.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isBookmarked ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Front Body - Question */}
            <div className="my-auto text-center space-y-4 py-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-400/80">
                QUESTION #{currentIndex + 1}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 leading-snug px-4">
                {currentCard.title}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {currentCard.tags.map((tag, idx) => (
                  <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900/80 text-slate-400 border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Front Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/80">
              <span className="flex items-center space-x-1">
                {isMastered ? (
                  <span className="text-cyan-400 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>這題你已經標記精通！</span>
                  </span>
                ) : (
                  <span>點擊卡片任何地方翻面看答案</span>
                )}
              </span>
              <span className="flex items-center space-x-1 text-purple-400 font-medium">
                <RotateCw className="w-4 h-4 animate-spin-slow" />
                <span>點擊翻面</span>
              </span>
            </div>

          </div>

          {/* ================= BACK SIDE ================= */}
          <div className="rotate-y-180 backface-hidden absolute inset-0 w-full h-full glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-cyan-500/30 shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/20 overflow-y-auto">
            
            {/* Back Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>核心觀念解答</span>
              </span>
              <span className="text-xs text-slate-400">點擊任意處翻回正面</span>
            </div>

            {/* Back Body - Summary & Snippet */}
            <div className="my-auto space-y-4 py-4">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-sm font-medium leading-relaxed">
                {currentCard.summary}
              </div>

              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-2 max-h-48 overflow-y-auto pr-2">
                {currentCard.answer.split('\n\n').slice(0, 3).map((para, idx) => (
                  <p key={idx} className="whitespace-pre-line leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Back Footer Self Evaluation */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">自主成效標記：</span>
              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    if (isMastered) toggleMastered(currentCard.id);
                    handleNext();
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>還不熟</span>
                </button>

                <button
                  onClick={() => {
                    if (!isMastered) toggleMastered(currentCard.id);
                    handleNext();
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>已經掌握 (下一張)</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Navigation Buttons (Prev / Next) */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-semibold transition-all hover:border-slate-700 shadow-md"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>上一題</span>
        </button>

        <span className="text-xs text-slate-500 hidden sm:inline">
          提示：可以使用鍵盤 Space 鍵翻面，左右方向鍵切換
        </span>

        <button
          onClick={handleNext}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-purple-500/20"
        >
          <span>下一題</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
