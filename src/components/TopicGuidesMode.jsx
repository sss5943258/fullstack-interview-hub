import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Tag, 
  Typography, 
  Button, 
  Alert, 
  Divider, 
  Tooltip, 
  message 
} from 'antd';
import { 
  CopyOutlined, 
  CheckOutlined, 
  BookOutlined, 
  FireOutlined, 
  ThunderboltOutlined,
  CompassOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { 
  topicGuides, 
  getGuidesByCategory, 
  searchGuides, 
  ALL_CATEGORIES 
} from '../data';
import { Search, Sparkles, BookOpen, Clock, Tag as TagIcon } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

/**
 * TopicGuidesMode - 專題精講主畫面元件
 * 
 * 【React 小白學習筆記】：
 * 1. 本元件展示了 React 的「條件渲染 (Conditional Rendering)」：使用者可以在「文章清單」與「詳細文章閱讀」之間平滑切換。
 * 2. 使用了 `useMemo` 進行搜尋與過濾的快取優化，避免在不相關的狀態更新時重複計算陣列。
 * 3. 透過 props 接收 `onSwitchToBank`，展現了 React 的「狀態提升與跨元件溝通」技巧。
 * 
 * @param {Function} onSwitchToBank - 允許使用者直接切換至題庫刷題模式的父層函式
 */
export default function TopicGuidesMode({ onSwitchToBank }) {
  // 🌟 useState 示範：記錄當前選中的分類（例如 'All', 'React'）
  // React 觀念：當 selectedCategory 改變時，React 會重新執行 TopicGuidesMode 元件函式，並更新畫面
  const [selectedCategory, setSelectedCategory] = useState('All');

  // 🌟 useState 示範：記錄使用者在搜尋框輸入的文字
  const [searchKeyword, setSearchKeyword] = useState('');

  // 🌟 useState 示範：記錄當前正在閱讀的專題文章物件（若為 null 表示目前在總覽清單）
  const [activeGuide, setActiveGuide] = useState(() => topicGuides[0] || null);

  // 🌟 useState 示範：記錄程式碼區塊是否剛被複製（用來呈現打勾圖示）
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  /**
   * filteredGuides - 根據「分類」與「關鍵字」過濾後的文章清單
   * 
   * 【React 小白學習筆記 - useMemo】：
   * useMemo 會記住計算結果。只有當 [selectedCategory, searchKeyword] 這兩個依賴變數發生改變時，
   * 才會重新執行過濾演算法。這能大幅節省不必要的 CPU 運算！
   */
  const filteredGuides = useMemo(() => {
    let list = getGuidesByCategory(selectedCategory);
    list = searchGuides(list, searchKeyword);
    return list;
  }, [selectedCategory, searchKeyword]);

  /**
   * handleCategorySelect - 處理分類標籤切換的點擊事件
   * 
   * 【React 小白學習筆記 - 事件處理函式】：
   * 在 JSX 中透過 onClick={handleCategorySelect(cat.id)} 或 onClick={() => handleCategorySelect(cat.id)} 呼叫。
   * 它會呼叫 setSelectedCategory 更新狀態，並自動挑選該分類的第一篇文章進行展示。
   * 
   * @param {string} categoryId - 點選的分類識別碼 (如 'All', 'React')
   */
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    const categoryArticles = getGuidesByCategory(categoryId);
    if (categoryArticles.length > 0) {
      setActiveGuide(categoryArticles[0]);
    }
  };

  /**
   * handleSearchChange - 處理搜尋文字輸入事件
   * 
   * 【React 小白學習筆記 - 受控元件 (Controlled Component)】：
   * 當使用者在 <input> 打字時，瀏覽器會觸發 onChange 事件，
   * 透過 e.target.value 取得使用者最新打的文字並存回 React State。
   * 
   * @param {Object} event - 原生 Input Change 事件物件
   */
  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  /**
   * handleCopyCode - 一鍵複製程式碼範例至使用者剪貼簿
   * 
   * 【React 小白學習筆記 - 非同步操作與反饋】：
   * 1. 使用 navigator.clipboard.writeText 呼叫瀏覽器原生剪貼簿 API（非同步 Promise）。
   * 2. 成功後使用 Ant Design 的 message.success 跳出通知。
   * 3. 透過 setCopiedCodeId 改變狀態 2 秒，製造「複製成功」的短暫視覺打勾回饋。
   * 
   * @param {string} codeText - 要複製的程式碼文字
   * @param {string} snippetId - 該段程式碼的唯一識別 ID
   */
  const handleCopyCode = async (codeText, snippetId) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeId(snippetId);
      message.success('程式碼已成功複製至剪貼簿！');
      setTimeout(() => {
        setCopiedCodeId(null);
      }, 2000);
    } catch (err) {
      message.error('複製失敗，請手動選取複製');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 頂部功能區：標題與搜尋欄位 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <CompassOutlined className="text-xl" />
            </span>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>
              專題精講 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Topic Guides</span>
            </Title>
          </div>
          <Paragraph className="text-slate-400 text-xs sm:text-sm mt-1 mb-0">
            全端面試高頻深度專題解析 • 涵蓋 React 狀態管理底層原理、架構選型決策與實戰原始碼導讀
          </Paragraph>
        </div>

        {/* 搜尋框 */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={handleSearchChange}
            placeholder="搜尋專題標題、關鍵字或技術標籤..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* 分類篩選標籤 */}
      <div className="flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center space-x-2 border ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 主版面區塊：左側文章目錄清單 + 右側文章詳細導讀內容 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 左側欄位：文章導航列表 (寬度佔 4 格) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
            <span>文章列表 ({filteredGuides.length})</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          {filteredGuides.length === 0 ? (
            <Card className="bg-slate-900/40 border-slate-800 text-center py-8">
              <Paragraph className="text-slate-500 text-sm mb-0">
                找不到相符的專題精講文章
              </Paragraph>
            </Card>
          ) : (
            filteredGuides.map((guide) => {
              const isActive = activeGuide?.id === guide.id;
              return (
                <div
                  key={guide.id}
                  onClick={() => setActiveGuide(guide)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                    isActive
                      ? 'bg-slate-900/90 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Tag color="cyan" className="rounded-md font-semibold text-xs border-0 m-0">
                      {guide.category}
                    </Tag>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{guide.readTime}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-200 line-clamp-2 mb-1.5 leading-snug">
                    {guide.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {guide.summary}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {guide.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 右側欄位：主文章閱讀器 (寬度佔 8 格) */}
        <div className="lg:col-span-8">
          {activeGuide ? (
            <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-2xl">
              
              {/* 文章標頭區塊 */}
              <div className="border-b border-slate-800 pb-6 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag color="blue" className="px-2.5 py-1 text-xs font-semibold rounded-lg">
                    {activeGuide.category} 精選專題
                  </Tag>
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeGuide.readTime}</span>
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">更新於 {activeGuide.updatedAt}</span>
                </div>

                <Title level={2} style={{ color: '#f8fafc', margin: 0, lineHeight: 1.3 }}>
                  {activeGuide.title}
                </Title>

                <p className="text-sm sm:text-base text-cyan-300 font-medium">
                  {activeGuide.subtitle}
                </p>

                {/* 標籤群 */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {activeGuide.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 核心摘要警示卡片 */}
              <Alert
                message="📌 專題導讀核心總覽"
                description={activeGuide.summary}
                type="info"
                showIcon
                className="bg-cyan-950/20 border-cyan-500/30 text-slate-300 rounded-xl"
              />

              {/* 各章節內文 */}
              <div className="space-y-8 pt-2">
                {activeGuide.sections.map((section, idx) => (
                  <section key={section.id} className="space-y-4">
                    
                    {/* 章節標題 */}
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-6 bg-cyan-500 rounded-full" />
                      <h3 className="text-lg font-bold text-slate-100 m-0">
                        {section.title}
                      </h3>
                    </div>

                    {/* 章節重點說明 */}
                    {section.summary && (
                      <p className="text-xs text-cyan-400/90 italic bg-slate-950/40 px-3 py-1.5 rounded-lg border-l-2 border-cyan-500">
                        {section.summary}
                      </p>
                    )}

                    {/* 章節正文 (支援簡易 Markdown 段落切割) */}
                    <div className="text-slate-300 text-sm leading-relaxed space-y-2 whitespace-pre-line font-normal">
                      {section.content}
                    </div>

                    {/* 程式碼範例展示 (若該章節有 codeSnippet) */}
                    {section.codeSnippet && (
                      <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-lg mt-3">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800/80">
                          <span className="text-xs font-mono text-cyan-400 flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                            <span>{section.codeLanguage || 'javascript'}</span>
                          </span>
                          <Tooltip title="複製範例程式碼">
                            <Button
                              size="small"
                              type="text"
                              icon={copiedCodeId === section.id ? <CheckOutlined className="text-emerald-400" /> : <CopyOutlined className="text-slate-400" />}
                              onClick={() => handleCopyCode(section.codeSnippet, section.id)}
                              className="text-xs text-slate-400 hover:text-white"
                            >
                              {copiedCodeId === section.id ? '已複製' : '複製'}
                            </Button>
                          </Tooltip>
                        </div>
                        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                          <code>{section.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {/* 章節重點收穫 (Takeaways) */}
                    {section.takeaways && section.takeaways.length > 0 && (
                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 mt-3">
                        <div className="text-xs font-semibold text-amber-400 mb-2 flex items-center space-x-1.5">
                          <ThunderboltOutlined />
                          <span>面試核心結論速記：</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                          {section.takeaways.map((point, pIdx) => (
                            <li key={pIdx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {idx < activeGuide.sections.length - 1 && (
                      <Divider className="border-slate-800/60 my-6" />
                    )}
                  </section>
                ))}
              </div>

              {/* 底部行動呼籲 (Call To Action)：前往題庫做題實戰 */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-200 m-0">
                    想立刻檢驗學習成效嗎？
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 mb-0">
                    題庫已更新收錄 React 狀態管理 3 道深度面試題（Zustand vs Context、useReducer、useRef 幕後反模式）
                  </p>
                </div>
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={onSwitchToBank}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 border-0 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
                >
                  前往題庫刷題
                </Button>
              </div>

            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
              請從左側列表選擇欲閱讀的專題文章
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
