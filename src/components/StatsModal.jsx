import React, { useState } from 'react';
import { ALL_CATEGORIES, loadStoredStats, saveStoredStats, STORAGE_KEYS } from '../data';
import { 
  X, 
  BarChart3, 
  CheckCircle2, 
  Bookmark, 
  Award, 
  Trash2, 
  RotateCcw, 
  Sparkles,
  Layers,
  History
} from 'lucide-react';

export default function StatsModal({
  allQuestions,
  masteredSet,
  bookmarkSet,
  onClose,
  onResetAll
}) {
  const [stats, setStats] = useState(loadStoredStats());
  const [confirmReset, setConfirmReset] = useState(false);

  // Mastery Percentages by Category
  const categoryStats = ALL_CATEGORIES.filter(c => c.id !== 'All').map(cat => {
    const questionsInCat = allQuestions.filter(q => q.category === cat.id);
    const masteredInCat = questionsInCat.filter(q => masteredSet.has(q.id));
    const percent = Math.round((masteredInCat.length / questionsInCat.length) * 100) || 0;
    return {
      ...cat,
      total: questionsInCat.length,
      mastered: masteredInCat.length,
      percent
    };
  });

  // Mastery Percentages by Difficulty
  const difficultyStats = ['Junior', 'Mid', 'Senior'].map(diff => {
    const questionsInDiff = allQuestions.filter(q => q.difficulty === diff);
    const masteredInDiff = questionsInDiff.filter(q => masteredSet.has(q.id));
    const percent = Math.round((masteredInDiff.length / questionsInDiff.length) * 100) || 0;
    return {
      difficulty: diff,
      total: questionsInDiff.length,
      mastered: masteredInDiff.length,
      percent
    };
  });

  // Overall statistics
  const totalMastered = masteredSet.size;
  const totalQuestions = allQuestions.length;
  const overallPercent = Math.round((totalMastered / totalQuestions) * 100) || 0;

  const handleResetData = () => {
    onResetAll();
    setStats({ totalQuizzes: 0, totalQuestions: 0, totalCorrect: 0, history: [] });
    setConfirmReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">學習數據與進度儀表板</h2>
              <p className="text-xs text-slate-400">全端工程師面試題庫個人學習統計</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
          
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400">總體精通進度</span>
                <div className="text-xl font-extrabold text-slate-100">
                  {totalMastered} / {totalQuestions} ({overallPercent}%)
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400">收藏重點題目</span>
                <div className="text-xl font-extrabold text-amber-400">
                  {bookmarkSet.size} 題
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400">模擬測驗次數</span>
                <div className="text-xl font-extrabold text-pink-400">
                  {stats.totalQuizzes || 0} 次
                </div>
              </div>
            </div>

          </div>

          {/* Category Progress Breakdown */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>5 大技術領域精通度分析</span>
            </h3>

            <div className="space-y-3 pt-1">
              {categoryStats.map(cat => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{cat.name}</span>
                    <span className="text-slate-400">
                      {cat.mastered} / {cat.total} 題 (<b>{cat.percent}%</b>)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full bg-gradient-to-r ${cat.color} transition-all duration-500`}
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Mastery Breakdown */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>難易度分析 (Junior / Mid / Senior)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {difficultyStats.map(item => (
                <div key={item.difficulty} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-bold text-slate-200">{item.difficulty} 難度</span>
                    <span className="text-cyan-400 font-bold">{item.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                      style={{ width: `${item.percent}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    已掌握 {item.mastered} / {item.total} 題
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz History List */}
          {stats.history && stats.history.length > 0 && (
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                <History className="w-4 h-4 text-pink-400" />
                <span>近期模擬測驗紀錄</span>
              </h3>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {stats.history.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200">
                        {record.category} 測驗
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {record.date} • 答對 {record.correct}/{record.total} 題
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-extrabold text-sm ${
                        record.score >= 80 ? 'text-emerald-400' : record.score >= 60 ? 'text-cyan-400' : 'text-rose-400'
                      }`}>
                        {record.score} 分
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          {confirmReset ? (
            <div className="flex items-center space-x-2 animate-fadeIn">
              <span className="text-xs text-rose-400 font-bold">確定要清空所有刷題紀錄？</span>
              <button
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500"
              >
                確定清空
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>重置所有學習與收藏紀錄</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            關閉儀表板
          </button>
        </div>

      </div>
    </div>
  );
}
