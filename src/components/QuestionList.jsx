import React, { useState, useMemo } from 'react';
import { 
  ALL_CATEGORIES, 
  getQuestionsByCategory, 
  getQuestionsByDifficulty, 
  searchQuestions 
} from '../data';
import { 
  Search, 
  Bookmark, 
  CheckCircle2, 
  Check, 
  Code2, 
  Shield, 
  Zap, 
  Database, 
  Container, 
  Sparkles, 
  ChevronRight, 
  X, 
  Copy, 
  Filter, 
  BookMarked,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';

const CATEGORY_ICONS = {
  All: Sparkles,
  React: Code2,
  Angular: Shield,
  '.NET Core': Zap,
  SQL: Database,
  'K8s & Docker': Container,
};

const DIFFICULTY_COLORS = {
  Junior: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Mid: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  Senior: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

export default function QuestionList({
  allQuestions,
  masteredSet,
  bookmarkSet,
  toggleMastered,
  toggleBookmark
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [onlyMastered, setOnlyMastered] = useState(false);

  // Selected Question for Modal
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [copied, setCopied] = useState(false);

  // Filter Logic
  const filteredQuestions = useMemo(() => {
    let list = getQuestionsByCategory(selectedCategory);
    list = getQuestionsByDifficulty(list, selectedDifficulty);
    list = searchQuestions(list, searchQuery);

    if (onlyBookmarked) {
      list = list.filter(q => bookmarkSet.has(q.id));
    }
    if (onlyMastered) {
      list = list.filter(q => masteredSet.has(q.id));
    }
    return list;
  }, [selectedCategory, selectedDifficulty, searchQuery, onlyBookmarked, onlyMastered, bookmarkSet, masteredSet]);

  // Copy code handler
  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Domain Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ALL_CATEGORIES.map(cat => {
          const IconComponent = CATEGORY_ICONS[cat.id] || Sparkles;
          const isSelected = selectedCategory === cat.id;
          const categoryCount = cat.id === 'All' 
            ? allQuestions.length 
            : allQuestions.filter(q => q.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3.5 rounded-2xl flex flex-col items-start justify-between transition-all duration-300 border ${
                isSelected
                  ? 'glass-panel border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30 transform -translate-y-1'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className={`p-2 rounded-xl bg-gradient-to-tr ${cat.color} bg-opacity-20 text-white shadow-sm`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {categoryCount} 題
                </span>
              </div>
              <div className="text-left">
                <h3 className={`font-bold text-sm ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                  {cat.name}
                </h3>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search Bar & Multi-filter Tools */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋題目名稱、關鍵字或標籤..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          
          {/* Difficulty Filter */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            {['All', 'Junior', 'Mid', 'Senior'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-slate-800 text-cyan-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff === 'All' ? '全部難度' : diff}
              </button>
            ))}
          </div>

          {/* Bookmarked Filter Toggle */}
          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              onlyBookmarked
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-amber-400' : ''}`} />
            <span>收藏清單 ({bookmarkSet.size})</span>
          </button>

          {/* Mastered Filter Toggle */}
          <button
            onClick={() => setOnlyMastered(!onlyMastered)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              onlyMastered
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>已精通 ({masteredSet.size})</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>顯示 <b>{filteredQuestions.length}</b> 筆題目觀念解析</span>
        {(searchQuery || selectedDifficulty !== 'All' || onlyBookmarked || onlyMastered) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty('All');
              setOnlyBookmarked(false);
              setOnlyMastered(false);
            }}
            className="text-cyan-400 hover:underline flex items-center space-x-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>重置篩選</span>
          </button>
        )}
      </div>

      {/* Question Cards Grid */}
      {filteredQuestions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 my-8">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-bounce" />
          <h3 className="text-base font-bold text-slate-300">找不到符合條件的考題</h3>
          <p className="text-xs text-slate-500 mt-1">請嘗試調整搜尋關鍵字或清除篩選條件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map(q => {
            const isMastered = masteredSet.has(q.id);
            const isBookmarked = bookmarkSet.has(q.id);
            const IconComp = CATEGORY_ICONS[q.category] || Sparkles;

            return (
              <div
                key={q.id}
                className={`glass-card rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 relative ${
                  isMastered ? 'border-cyan-500/30 bg-cyan-950/10' : 'border-slate-800/80'
                }`}
              >
                <div>
                  {/* Category & Difficulty Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700">
                        <IconComp className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{q.category}</span>
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Action buttons (Bookmark & Mastered) */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(q.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                        title={isBookmarked ? '取消收藏' : '加入收藏'}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMastered(q.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isMastered ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                        title={isMastered ? '標記為未精通' : '標記為已精通'}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'text-cyan-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => setActiveQuestion(q)}
                    className="font-bold text-slate-100 text-base mb-2 group-hover:text-cyan-300 transition-colors cursor-pointer leading-snug"
                  >
                    {q.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {q.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {q.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {isMastered ? '已標記為精通' : '點擊查看完整觀念與代碼'}
                  </span>
                  <button
                    onClick={() => setActiveQuestion(q)}
                    className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>完整解析</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Question Detail Modal */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/40">
              <div className="space-y-2 pr-4">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {activeQuestion.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${DIFFICULTY_COLORS[activeQuestion.difficulty]}`}>
                    {activeQuestion.difficulty} 難度
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 leading-snug">
                  {activeQuestion.title}
                </h2>
              </div>

              <button
                onClick={() => setActiveQuestion(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed">
              
              {/* Summary Highlight Box */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-sm font-medium">
                <div className="font-bold text-cyan-400 mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>精華摘要 (Summary)</span>
                </div>
                {activeQuestion.summary}
              </div>

              {/* Detailed Markdown Answer */}
              <div className="prose prose-invert max-w-none space-y-4">
                {activeQuestion.answer.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('```')) {
                    const codeContent = paragraph.replace(/```[a-z]*/g, '').trim();
                    return (
                      <div key={pIdx} className="relative group my-4">
                        <div className="absolute right-3 top-3 z-10">
                          <button
                            onClick={() => handleCopyCode(codeContent)}
                            className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copied ? '已複製！' : '複製代碼'}</span>
                          </button>
                        </div>
                        <pre className="code-block p-4 rounded-xl overflow-x-auto text-xs sm:text-sm text-cyan-300 border border-slate-800">
                          <code>{codeContent}</code>
                        </pre>
                      </div>
                    );
                  }
                  return (
                    <p key={pIdx} className="whitespace-pre-line text-slate-300">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Quiz Sample Options Review */}
              {activeQuestion.options && (
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 mb-3 flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>對應單選模擬題目預覽</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2 mb-3">
                    {activeQuestion.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          oIdx === activeQuestion.correctIndex
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                        {oIdx === activeQuestion.correctIndex && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            正確解答
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    💡 <b>解析：</b>{activeQuestion.quizExplanation}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleBookmark(activeQuestion.id)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    bookmarkSet.has(activeQuestion.id)
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarkSet.has(activeQuestion.id) ? 'fill-amber-400' : ''}`} />
                  <span>{bookmarkSet.has(activeQuestion.id) ? '已收藏' : '加入收藏'}</span>
                </button>

                <button
                  onClick={() => toggleMastered(activeQuestion.id)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    masteredSet.has(activeQuestion.id)
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{masteredSet.has(activeQuestion.id) ? '已標記精通' : '標記為已精通'}</span>
                </button>
              </div>

              <button
                onClick={() => setActiveQuestion(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
              >
                關閉視窗
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
