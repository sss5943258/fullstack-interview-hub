import React, { useState, useEffect } from 'react';
import { ALL_CATEGORIES, getQuestionsByCategory, saveStoredStats, loadStoredStats } from '../data';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  Timer, 
  HelpCircle, 
  ChevronRight,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function MockQuizMode({ allQuestions }) {
  // Quiz Status: 'setup' | 'active' | 'completed'
  const [quizStatus, setQuizStatus] = useState('setup');
  
  // Setup Options
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quizLength, setQuizLength] = useState(10);

  // Active Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: selectedIndex }
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (quizStatus === 'active') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [quizStatus]);

  // Start Quiz Handler
  const handleStartQuiz = () => {
    let pool = getQuestionsByCategory(selectedCategory);
    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(quizLength, shuffled.length));

    setQuizQuestions(selected);
    setCurrentIndex(0);
    setUserAnswers({});
    setTimeElapsed(0);
    setQuizStatus('active');
  };

  // Select Option Handler
  const handleSelectOption = (questionId, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Submit Quiz Handler
  const handleSubmitQuiz = () => {
    setQuizStatus('completed');

    // Calculate score
    let correctCount = 0;
    quizQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    // Update LocalStorage Stats
    const prevStats = loadStoredStats();
    const newStats = {
      totalQuizzes: (prevStats.totalQuizzes || 0) + 1,
      totalQuestions: (prevStats.totalQuestions || 0) + quizQuestions.length,
      totalCorrect: (prevStats.totalCorrect || 0) + correctCount,
      history: [
        {
          id: Date.now(),
          date: new Date().toLocaleDateString('zh-TW'),
          category: selectedCategory,
          score: Math.round((correctCount / quizQuestions.length) * 100),
          correct: correctCount,
          total: quizQuestions.length,
          timeSpent: timeElapsed
        },
        ...(prevStats.history || [])
      ]
    };
    saveStoredStats(newStats);
  };

  // Format Time Helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ================= 1. SETUP VIEW =================
  if (quizStatus === 'setup') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 p-[2px] mx-auto shadow-xl shadow-pink-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Award className="w-8 h-8 text-pink-400" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              全端技術模擬測驗
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
              隨機抽取高頻面試單選題進行評測，驗證你的技術基礎與題庫熟練度。
            </p>
          </div>

          {/* Category Selection */}
          <div className="space-y-3 text-left max-w-lg mx-auto">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. 選擇測驗領域
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white border-pink-400/50 shadow-md shadow-pink-500/20'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  {selectedCategory === cat.id && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Length Selection */}
          <div className="space-y-3 text-left max-w-lg mx-auto pt-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. 選擇測驗題數
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[5, 10, 15].map(count => (
                <button
                  key={count}
                  onClick={() => setQuizLength(count)}
                  className={`py-3 rounded-xl border text-sm font-extrabold transition-all ${
                    quizLength === count
                      ? 'bg-slate-800 text-pink-400 border-pink-500/50 shadow-md'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {count} 題
                </button>
              ))}
            </div>
          </div>

          {/* Start Quiz Button */}
          <div className="pt-4 max-w-lg mx-auto">
            <button
              onClick={handleStartQuiz}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-extrabold text-base shadow-xl shadow-pink-500/25 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>開始進行測驗</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ================= 2. ACTIVE QUIZ VIEW =================
  if (quizStatus === 'active') {
    const currentQ = quizQuestions[currentIndex];
    const isLast = currentIndex === quizQuestions.length - 1;
    const currentSelected = userAnswers[currentQ.id];

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Active Header: Progress & Timer */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-lg bg-pink-500/10 text-pink-400 text-xs font-bold border border-pink-500/30">
              {currentQ.category}
            </span>
            <span className="text-xs font-bold text-slate-300">
              題目 {currentIndex + 1} / {quizQuestions.length}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-300 font-mono text-sm bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Timer className="w-4 h-4 text-pink-400 animate-pulse" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
          
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {currentQ.difficulty} 難度
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 mt-1 leading-snug">
              {currentQ.title}
            </h3>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = currentSelected === oIdx;
              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(currentQ.id, oIdx)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between text-sm ${
                    isSelected
                      ? 'bg-pink-500/15 border-pink-500/60 text-pink-200 font-semibold shadow-lg shadow-pink-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border ${
                      isSelected
                        ? 'bg-pink-500 text-white border-pink-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-pink-400" />}
                </button>
              );
            })}
          </div>

          {/* Quiz Bottom Controls */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              上一題
            </button>

            {isLast ? (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all"
              >
                結束測驗並計算成績
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition-all flex items-center space-x-1"
              >
                <span>下一題</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    );
  }

  // ================= 3. COMPLETED SCORE VIEW =================
  let correctCount = 0;
  quizQuestions.forEach(q => {
    if (userAnswers[q.id] === q.correctIndex) correctCount++;
  });
  const scorePercent = Math.round((correctCount / quizQuestions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Score Summary Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4 shadow-2xl relative overflow-hidden">
        
        <div className="inline-flex p-3 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 mb-2">
          <Award className="w-10 h-10 animate-bounce" />
        </div>

        <h2 className="text-3xl font-extrabold text-slate-100">測驗完成！</h2>
        
        <div className="flex items-center justify-center space-x-6 py-4">
          <div className="flex flex-col text-center">
            <span className="text-xs text-slate-400">總得分</span>
            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
              {scorePercent} 分
            </span>
          </div>

          <div className="w-[1px] h-12 bg-slate-800" />

          <div className="flex flex-col text-center">
            <span className="text-xs text-slate-400">答對題數</span>
            <span className="text-2xl font-bold text-slate-200">
              {correctCount} / {quizQuestions.length}
            </span>
          </div>

          <div className="w-[1px] h-12 bg-slate-800" />

          <div className="flex flex-col text-center">
            <span className="text-xs text-slate-400">總耗時</span>
            <span className="text-2xl font-bold text-slate-200 font-mono">
              {formatTime(timeElapsed)}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setQuizStatus('setup')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-pink-500/20 hover:opacity-95 transition-all inline-flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新進行一次測驗</span>
          </button>
        </div>

      </div>

      {/* Detailed Review Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-pink-400" />
          <span>測驗題目詳細檢討與解析</span>
        </h3>

        <div className="space-y-4">
          {quizQuestions.map((q, idx) => {
            const userChoice = userAnswers[q.id];
            const isCorrect = userChoice === q.correctIndex;

            return (
              <div
                key={q.id}
                className={`glass-panel p-6 rounded-2xl border ${
                  isCorrect ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-rose-500/30 bg-rose-950/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400">
                      #{idx + 1} ({q.category} - {q.difficulty})
                    </span>
                    <h4 className="font-bold text-slate-100 text-base">
                      {q.title}
                    </h4>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1 ${
                    isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{isCorrect ? '答對' : '答錯'}</span>
                  </span>
                </div>

                {/* Options Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {q.options.map((opt, oIdx) => {
                    const isUserPick = userChoice === oIdx;
                    const isRightOpt = oIdx === q.correctIndex;

                    let style = 'bg-slate-900/60 border-slate-800 text-slate-400';
                    if (isRightOpt) {
                      style = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                    } else if (isUserPick && !isCorrect) {
                      style = 'bg-rose-500/20 border-rose-500/50 text-rose-300 line-through';
                    }

                    return (
                      <div key={oIdx} className={`p-3 rounded-xl border text-xs ${style}`}>
                        {String.fromCharCode(65 + oIdx)}. {opt}
                        {isRightOpt && ' (正確解答)'}
                        {isUserPick && !isRightOpt && ' (你的選擇)'}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                  💡 <b>考題解析：</b>{q.quizExplanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
