/**
 * topicGuides.js
 * 全端工程師面試專題精講 (Topic Guides) 資料庫
 * 提供成篇、具架構性的深層技術導讀與原始碼解析
 */

export const topicGuides = [
  {
    id: "guide-react-state-management",
    category: "React",
    title: "React 狀態管理終極解析：從 useState、useRef 到 Context 與 Zustand 的選型之道",
    subtitle: "深入理解 React 渲染機制、訂閱模式、記憶體傳址特性與企業級狀態架構決策樹",
    readTime: "8 分鐘閱讀",
    updatedAt: "2026-10",
    tags: ["React 19", "State Management", "Zustand", "Context API", "useRef", "Performance"],
    summary: "解構 React 各種狀態儲存方式的底層機制，探討 Context API 的「全樹重繪」效能瓶頸、useRef 幕後指標本質，以及 Zustand 為何成為現代前端團隊的首選全域狀態方案。",
    sections: [
      {
        id: "section-1",
        title: "1. 狀態管理核心光譜：局部、幕後與全域",
        summary: "不同狀態有其適合的生命週期與儲存載體，切忌將所有變數都塞入 useState。",
        content: `在 React 的設計哲學中，「狀態 (State)」並不是單一概念，而是依據「是否需要反映在畫面 (UI) 上」以及「共享範圍 (Scope)」分為三大範疇：

1. **局部視圖狀態 (Local UI State)**：由 \`useState\` 或 \`useReducer\` 承載。狀態改變時會觸發組件重新執行 (Re-render) 並更新 Virtual DOM。
2. **幕後邏輯狀態 (Internal Mutable State)**：由 \`useRef\` 承載。本質為常駐記憶體的物件，資料變更時「零 Re-render」。
3. **跨層級共享狀態 (Shared/Global State)**：由 \`Context API\` 或外部狀態庫（如 \`Zustand\`, \`Redux\`）承載，解決 Props Drilling 痛點。`,
        takeaways: [
          "畫面要變 -> useState / useReducer",
          "畫面不變但要跨渲染保存 -> useRef",
          "多個跨層組件要共用 -> Zustand 或 Context"
        ]
      },
      {
        id: "section-2",
        title: "2. useRef 的本質：{ current: val } 與傳址特性",
        summary: "useRef 絕不只是拿來綁定 DOM，它更是極致效能的「幕後狀態載體」。",
        content: `許多初學者以為 \`useRef\` 只是用來操作 DOM 節點（例如 \`inputRef.current.focus()\`），但其本質更廣：

\`\`\`javascript
const myRef = useRef(false);
// 在記憶體中，它等同於建立一個普通 JavaScript 物件：
// { current: false }
\`\`\`

- **為什麼更新不觸發渲染？**
  呼叫 \`setState\` 時，React 會呼叫調度器 (Scheduler) 排程重新渲染；但直接修改 \`myRef.current = true\` 只是修改一個普通 JavaScript 物件的屬性，React 調度器完全不知情，因此 **不會引發任何 Re-render**。
- **避免「幕後狀態反模式」**：
  若把「防重複點擊鎖 (isSubmitting)」、「計時器 Timer ID」、「WebSocket 實例」放進 \`useState\`，每次修改都會引發全組件 Virtual DOM 重算，造成頁面掉幀。這些幕後變數應堅決使用 \`useRef\`！`,
        codeSnippet: `// 💡 最佳實踐：使用 useRef 實作防連點併發鎖
function FastSubmitButton({ onSubmit }) {
  const isSubmittingRef = useRef(false);

  const handleClick = async () => {
    // 檢查併發鎖，若正忙碌則直接阻擋
    if (isSubmittingRef.current) return;

    try {
      isSubmittingRef.current = true;
      await onSubmit();
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return <button onClick={handleClick}>立即結帳</button>;
}`,
        codeLanguage: "jsx"
      },
      {
        id: "section-3",
        title: "3. useContext 的兩大硬傷：Provider Hell 與無差別重繪",
        summary: "Context 適合低頻全域資料，在高頻或複雜業務狀態下會暴露出嚴重缺陷。",
        content: `React 原生提供的 Context API 經常被當作全域狀態庫使用，但在中大型專案中通常會遭遇兩大瓶頸：

### 痛點 A：一人感冒，全家吃藥（缺乏 Selector 精準訂閱）
Context API **不具備細粒度屬性訂閱 (Fine-grained Subscriptions)** 機制。
假設 Context 傳遞的物件為 \`{ user, theme, unreadCount }\`：
- 元件 A 只需要讀取 \`theme\`。
- 當後台推播更新了 \`unreadCount\`，**所有呼叫了 \`useContext\` 的元件，即使它只關心 \`theme\`，全部都會被強制重新渲染！**
- 頁面元件繁多時，打字或高頻狀態會引發嚴重掉幀卡頓。

### 痛點 B：無法在非 React 元件中存取
\`useContext\` 是一個 React Hook，規定只能在 JSX 元件中呼叫。如果你在純 JavaScript 檔案中（例如 Axios / Fetch 的 API 網路攔截器、WebSocket 封裝檔）需要讀取 JWT Token，Context 完全束手無策。

### Provider Hell 的緩解手段：Provider 組合器
若專案必須使用多層 Context，可撰寫 \`combineProviders\` 工具函式將多層俄羅斯套娃折疊成單一陣列。`,
        codeSnippet: `// 💡 技巧：利用 reduceRight 組合多個 Context Provider
export function combineProviders(providerList) {
  return ({ children }) => {
    return providerList.reduceRight((acc, CurrentProvider) => {
      return <CurrentProvider>{acc}</CurrentProvider>;
    }, children);
  };
}

// 在 App.jsx 即可乾淨引用：
// const AllProviders = combineProviders([AuthProvider, ThemeProvider, LangProvider]);
// <AllProviders><MainContent /></AllProviders>`,
        codeLanguage: "jsx"
      },
      {
        id: "section-4",
        title: "4. 現代解決方案：Zustand 的架構優勢",
        summary: "零 Provider、基於 useSyncExternalStore 的精準 Selector 訂閱與極簡 API。",
        content: `Zustand 採用了與 Redux 類似的外部 Store 發布訂閱模型，但剔除了繁瑣的 Boilerplate 與 Provider 包裝：

1. **零 Provider (Zero-Provider Setup)**：
   Store 直接定義在模組單例中，不需要在 \`App.jsx\` 根節點包裹任何 Provider。
2. **精準 Selector 訂閱**：
   透過 \`useAuthStore(state => state.user)\`，只有當 \`user\` 屬性真正變更時，該元件才會 Re-render；其餘屬性變動完全不影響。
3. **Vanilla JS 任意存取**：
   在純 \`.js\` 檔案（如網路攔截器、WebSocket 事件）中，可直接呼叫 \`useAuthStore.getState()\` 與 \`useAuthStore.setState()\`，打破 React 元件樹的邊界限制。`,
        codeSnippet: `// 1. 建立 Store (無需 Provider)
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

// 2. 在純 JS 網路攔截器中直接取值 (非 React 元件)
export function getAuthHeaders() {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: \`Bearer \${token}\` } : {};
}`,
        codeLanguage: "javascript"
      },
      {
        id: "section-5",
        title: "5. 狀態管理選型決策矩陣 (Decision Matrix)",
        summary: "面試時能夠根據具體場景給出清晰架構推導，展現 Senior 架構思維。",
        content: `| 狀態類型 | 建議工具 | 適用情境 | 關鍵評估標準 |
| :--- | :--- | :--- | :--- |
| **單一元件內部狀態** | \`useState\` | 表單輸入、Modal 開關、分頁頁碼 | 簡單直覺、不需與其他組件共享 |
| **複雜關聯內部狀態** | \`useReducer\` | 多步驟表單、複雜購物車明細計算 | 狀態轉移邏輯集中、易於單元測試 |
| **幕後旗標 / DOM 實例** | \`useRef\` | 請求防連點鎖、計時器 ID、DOM 聚焦 | 變動時完全不需引發 UI 重繪 |
| **全域低頻設定** | \`Context API\` | 語系 (i18n)、淺色/深色主題 (Theme) | 變動頻率極低，無 Re-render 效能風險 |
| **業務跨組件共享** | \`Zustand\` | 使用者登入權限、購物車清單、行程排程 | 高頻變更、需精準訂閱、需純 JS 存取 |`,
        takeaways: [
          "切勿為了趕流行把所有狀態都搬進全域 Store",
          "就近原則：能放在局部元件就放局部，需要跨層共享才提升至全域",
          "重視 Re-render 懲罰：關注頻繁變更狀態的訂閱粒度"
        ]
      }
    ]
  },
  {
    id: "guide-react-lifecycle",
    category: "React",
    title: "React 生命週期全景指南：從 Class 舊時代到現代 Hooks 渲染三階段與防坑實戰",
    subtitle: "徹底拆解 Mount、Update、Unmount 底層機制、Fiber 雙快取架構、StrictMode 雙重掛載與 useEffect 清理函數核心",
    readTime: "10 分鐘閱讀",
    updatedAt: "2026-10",
    tags: ["React 19", "Lifecycle", "Fiber", "useEffect", "StrictMode", "Clean-up", "AbortController"],
    summary: "全面對照 Class 元件生命週期與 Function 元件 Hooks 同步思維，深入解析 React Fiber 渲染三階段（Render / Commit / Passive Effects），並提供 StrictMode 雙重掛載除錯與 AbortController 實戰避坑技巧。",
    sections: [
      {
        id: "lifecycle-sec-1",
        title: "1. 思維躍遷：從「生命週期」到「狀態同步模型 (Synchronization)」",
        summary: "Function Component 本質不是在模擬生命週期，而是根據狀態與外部世界保持同步。",
        content: `在早期的 Class Component 時代，開發者必須將心智模型建立在「元件實例的出生、成長與死亡」：
- **Mounting (誕生)**：\`constructor\` -> \`render\` -> \`componentDidMount\`
- **Updating (成長)**：\`shouldComponentUpdate\` -> \`render\` -> \`componentDidUpdate\`
- **Unmounting (銷毀)**：\`componentWillUnmount\`

### 現代 Function Component 的本質轉變
現代 React (Hooks) 徹底打破了實例生命週期的概念。每次 Render 都是**執行一次純函式 (Function Execution)**，每一次呼叫都擁有其獨立的 Props、State 與事件處理器快照 (Snapshot)。
**\`useEffect\` 不是 \`componentDidMount\` 的語法糖**，它的核心意圖是：**「讓元件與外部系統 (DOM, 網路 API, WebSocket, 定時器) 保持狀態同步」**。`,
        takeaways: [
          "Class 思維：關注元件何時出生、何時死亡",
          "Hooks 思維：關注此時此刻的狀態如何與外部世界同步",
          "每一次 Render 都是獨立的閉包快照 (Closure Snapshot)"
        ]
      },
      {
        id: "lifecycle-sec-2",
        title: "2. 經典 Class vs 現代 Hooks 映射對照矩陣",
        summary: "理順新舊專案遷移時的生命週期對應關係與底層差異。",
        content: `| Class Component 生命週期 | 現代 Function Component 寫法 | 觸發時機與關鍵細節 |
| :--- | :--- | :--- |
| \`componentDidMount\` | \`useEffect(() => { ... }, [])\` | 元件初次掛載完成、瀏覽器繪製 (Paint) 後非同步執行 |
| \`componentDidUpdate\` | \`useEffect(() => { ... }, [depA, depB])\` | 依賴項目變更、且元件重新渲染完成後執行 |
| \`componentWillUnmount\` | \`useEffect(() => { return () => { ... } }, [])\` | 元件即將被銷毀前，執行 Clean-up 清理函式 |
| \`getSnapshotBeforeUpdate\` / 同步 DOM 讀寫 | \`useLayoutEffect(() => { ... }, [deps])\` | DOM 突變完成後、瀏覽器螢幕繪製前**同步阻塞**執行 |
| \`shouldComponentUpdate\` | \`React.memo(Component, arePropsEqual)\` | 淺比較 Props 是否變動，決定是否跳過 Render |
| 錯誤捕獲 (\`componentDidCatch\`) | 目前官方仍推薦使用 **Class Error Boundary** (或第三方 \`react-error-boundary\`) | 捕捉渲染時期的 JavaScript 例外，避免整頁白屏 |`,
        codeSnippet: `// 💡 經典對照：Mount / Update / Unmount 在 Hooks 中的一體化呈現
function UserProfile({ userId }) {
  useEffect(() => {
    // 1. 等同 componentDidMount (若 [] 空陣列) 或 componentDidUpdate (依賴 userId)
    console.log('連線至使用者頻道:', userId);

    // 2. 清理函式 (Clean-up)：等同 componentWillUnmount 以及下一次 Effect 執行前的重置
    return () => {
      console.log('清理前一次連線或銷毀元件:', userId);
    };
  }, [userId]); // 只有 userId 改變時才會重跑

  return <div>使用者編號：{userId}</div>;
}`,
        codeLanguage: "jsx"
      },
      {
        id: "lifecycle-sec-3",
        title: "3. React Fiber 渲染三階段：Render、Commit 與 Passive Effects",
        summary: "深入理解 Virtual DOM 計算與真實 DOM 繪製的切分，面試最高頻考點。",
        content: `React 16+ 引入 Fiber 架構後，元件的生命歷程被精準切割為三個階段：

### 階段一：Render Phase (渲染階段 - 純計算、可被中斷)
- **發生了什麼**：執行函式元件主體，計算 Virtual DOM，並透過 Diff 演算法比對新舊 Fiber 樹（雙快取樹 Work-in-Progress 樹與 Current 樹）。
- **關鍵特性**：**不可包含任何副作用**！在並發模式 (Concurrent Mode) 下，此階段可能被優先級更高的任務中斷、暫停甚至丟棄重算。

### 階段二：Commit Phase (提交階段 - DOM 變更、不可中斷)
- **發生了什麼**：將 Diff 計算出的變更一次性同步寫入真實 DOM。
- **時機**：真實 DOM 節點剛被修改，但瀏覽器尚未繪製到螢幕上。
- **相關 Hook**：\`useLayoutEffect\` 在此階段同步執行，適合讀取 DOM 幾何尺寸（如 \`getBoundingClientRect\`）或防閃爍微調。

### 階段三：Passive Effects Phase (被動副作用階段 - 非同步繪製後)
- **發生了什麼**：瀏覽器完成螢幕繪製 (Paint) 後，React 在背景非同步調度執行 \`useEffect\`。
- **目的**：保證使用者操作介面順暢不掉幀，將繁重的非同步請求與事件監聽移出關鍵渲染路徑。`,
        takeaways: [
          "Render Phase 只能做純計算，嚴禁在元件本體發起 API 或修改全域變數",
          "Commit Phase 同步執行 useLayoutEffect (會阻塞瀏覽器繪製)",
          "Passive Effects Phase 非同步執行 useEffect (保證 60FPS 畫面流暢)"
        ]
      },
      {
        id: "lifecycle-sec-4",
        title: "4. React 18/19 StrictMode 雙重掛載與 AbortController 實戰",
        summary: "為什麼 useEffect 在開發環境會執行兩次？如何正確使用 Clean-up 終結競態條件。",
        content: `### 為什麼開發環境中 useEffect 會跑兩次？
在 React 18/19 開啟 \`<StrictMode>\` 後，React 會在開發環境故意執行：
**Mount (掛載) -> Unmount (立即銷毀並執行 Clean-up) -> Mount (重新掛載)**。

**React 官方目的**：
強制檢查你的副作用是否具備健全的**清理邏輯 (Idempotent Clean-up)**！若未妥善清理，會在未來 Fast Refresh 或頁面快取時造成記憶體洩漏與幽靈請求。

### 實戰防坑：使用 AbortController 取消 In-flight 請求
當使用者頻繁切換分頁或快速輸入時，舊的請求若比新請求慢回傳，會造成**競態條件 (Race Condition)** 覆蓋最新資料。透過 Clean-up 中斷請求是業界黃金標準！`,
        codeSnippet: `import React, { useState, useEffect } from 'react';

/**
 * SearchResults - 示範 StrictMode 友善的 AbortController 取消請求模式
 */
export default function SearchResults({ query }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. 建立瀏覽器原生請求中斷控制器
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(\`/api/search?q=\${query}\`, { signal });
        const json = await res.json();
        setData(json);
      } catch (err) {
        // 若為正常主動中斷，則忽略錯誤；其餘錯誤正常處理
        if (err.name !== 'AbortError') {
          console.error('API 請求異常:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // 🌟 2. Clean-up 清理函式：元件卸載或 query 改變時立即中斷舊請求！
    return () => {
      abortController.abort();
    };
  }, [query]);

  return <div>{isLoading ? '載入中...' : \`搜尋結果筆數: \${data.length}\`}</div>;
}`,
        codeLanguage: "jsx"
      },
      {
        id: "lifecycle-sec-5",
        title: "5. 三大反模式與避坑守則：何時不該用 useEffect？",
        summary: "《You Might Not Need an Effect》官方指引核心精華總結。",
        content: `### ❌ 反模式 1：用 useEffect 計算衍生資料 (Derived State)
- **錯誤**：監聽 \`firstName\` 與 \`lastName\`，在 \`useEffect\` 裡呼叫 \`setFullName\`。
- **代價**：引發額外的一次 Re-render，畫面閃爍。
- **正確解法**：在元件本體中同步計算：\`const fullName = \`\${firstName} \${lastName}\`\`，或使用 \`useMemo\` 快取高成本運算。

### ❌ 反模式 2：把 useEffect 當作事件監聽器處理表單提交
- **錯誤**：在使用者按下送出按鈕時設定 \`setIsSubmitted(true)\`，然後在 \`useEffect\` 裡發送 POST 請求。
- **正確解法**：與使用者互動直接相關的邏輯，直接放在 **按鈕的 \`onSubmit\` / \`onClick\` 事件處理函式** 中執行！

### ❌ 反模式 3：遺漏依賴引發過期閉包 (Stale Closure)
- **錯誤**：定時器或非同步回呼引用了舊的 \`count\`，依賴陣列卻填 \`[]\`。
- **正確解法**：使用函數式更新 \`setCount(prev => prev + 1)\`，確保永遠取得記憶體中最新狀態。`,
        takeaways: [
          "只在需要與外部系統同步時才寫 useEffect",
          "能用純計算得出的值，直接在 Render 階段算出，不要動用 Effect 與額外 State",
          "使用者點擊觸發的行為，寫在 EventHandler，不要繞道 Effect"
        ]
      }
    ]
  }
];

/**
 * 取得特定分類的專題清單
 * @param {string} category - 分類名稱 ('All' 或具體分類)
 */
export const getGuidesByCategory = (category) => {
  if (!category || category === 'All') return topicGuides;
  return topicGuides.filter(g => g.category === category);
};

/**
 * 依關鍵字搜尋專題
 * @param {Array} guides - 專題清單
 * @param {string} keyword - 搜尋關鍵字
 */
export const searchGuides = (guides, keyword) => {
  if (!keyword || !keyword.trim()) return guides;
  const term = keyword.toLowerCase().trim();
  return guides.filter(g =>
    g.title.toLowerCase().includes(term) ||
    g.subtitle.toLowerCase().includes(term) ||
    g.summary.toLowerCase().includes(term) ||
    g.tags.some(t => t.toLowerCase().includes(term))
  );
};
