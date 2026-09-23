export const reactQuestions = [
  {
    id: "react-01",
    category: "React",
    difficulty: "Mid",
    title: "React 18 的 Concurrent Mode (並發模式) 與 Automatic Batching 原理為何？",
    tags: ["React 18", "Concurrent Mode", "Performance", "State Batching"],
    summary: "React 18 引入並發渲染機制，允許中斷渲染與優先級排程；同時實作全自動批次更新 (Automatic Batching)，減少不必要的重新渲染。",
    answer: `📌 **核心觀念**
React 18 的核心改革是 **Concurrent Rendering (並發渲染)**。在舊版 React 中，渲染是不可中斷的同步作業 (Blocking)；React 18 允許 React 暫停、恢復或中斷渲染，優先處理高優先級的使用者互動（如打字、點擊）。

🔍 **技術細節剖析**
1. **Automatic Batching (全自動批次更新)**：
   - React 17 僅在 React 事件處理器中進行 batching。在 \`setTimeout\`、\`Promise\` 或原生 DOM 事件中，多次 \`setState\` 會觸發多次 re-render。
   - React 18 將批次處理擴展到所有情境。非必要時可使用 \`flushSync\` 強制同步更新。
2. **Priority Scheduler (優先級排程)**：
   - **Urgent Update**：直覺的使用者輸入、點擊（需要立即回應）。
   - **Transition Update**：視圖切換、搜尋結果過濾（可延遲）。
3. **關鍵 Hooks**：
   - \`useTransition\`：將狀態更新標記為低優先級 Transition。
   - \`useDeferredValue\`：延遲更新非緊急的衍生數據。

💻 **範例程式碼**
\`\`\`jsx
import { useState, useTransition } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // 緊急更新：保持輸入框流暢
    setQuery(e.target.value);

    // 低優先級更新：大量資料計算渲染
    startTransition(() => {
      const items = Array.from({ length: 10000 }, (_, i) => \`Result for \${e.target.value} #\${i}\`);
      setList(items);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <p>載入中...</p>}
      <ul>{list.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
    </div>
  );
}
\`\`\`

💡 **面試加分點**
- 提及 \`flushSync\` 的使用場景（例如：需要立即讀取更新後的 DOM 位置或尺寸時）。
- 解釋 React 如何利用 \`MessageChannel\` 或 \`requestIdleCallback\` 來實作內部 Scheduler 時間分片 (Time Slicing)。`,
    options: [
      "React 18 的 Automatic Batching 只在 setTimeout 內部生效",
      "useTransition 用於標記低優先級的狀態更新，防止 UI 凍結",
      "React 18 依然採用不可中斷的同步 Blocking 渲染模式",
      "flushSync 是用來將更新標記為最低優先級的 Hook"
    ],
    correctIndex: 1,
    quizExplanation: "useTransition 允許將狀態更新標記為 Transition (非緊急)，使 React 能夠中斷該渲染以優化使用者輸入流暢度。"
  },
  {
    id: "react-02",
    category: "React",
    difficulty: "Junior",
    title: "React 中 useEffect 與 useLayoutEffect 的主要差別為何？",
    tags: ["Hooks", "DOM", "Rendering", "Lifecycle"],
    summary: "useEffect 是非同步且在瀏覽器繪製 (Paint) 後執行；useLayoutEffect 是同步且在 DOM 變更後、繪製前執行，常用於避免畫面閃爍。",
    answer: `📌 **核心觀念**
React 的渲染生命週期分為 Render 階段與 Commit 階段。\`useEffect\` 與 \`useLayoutEffect\` 都在 Commit 階段呼叫，但執行時機與阻擋繪製的行為不同。

🔍 **技術細節剖析**
1. **useEffect (預設推薦)**：
   - **執行時機**：瀏覽器將變更繪製到螢幕 (Paint) **之後** 非同步執行。
   - **優勢**：不會阻擋畫面渲染，提供最佳使用者體驗與 FPS。
2. **useLayoutEffect (特殊情境)**：
   - **執行時機**：React 修改 DOM 後、瀏覽器**繪製前** (Before Paint) 同步執行。
   - **情境**：需要讀取/修改 DOM 幾何資訊 (如 \`getBoundingClientRect\`) 並立即調整樣式，避免使用者看到畫面閃爍 (Flicker)。

💻 **範例程式碼**
\`\`\`jsx
import { useState, useLayoutEffect, useRef } from 'react';

function Tooltip() {
  const [height, setHeight] = useState(0);
  const ref = useRef(null);

  useLayoutEffect(() => {
    // 在畫面繪製出來前取得真實高度並更新，不會產生閃爍
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, []);

  return <div ref={ref}>Tooltip 高度: {height}px</div>;
}
\`\`\`

💡 **面試加分點**
- 在 SSR (Server-Side Rendering) 環境下使用 \`useLayoutEffect\` 會收到警告，因為 Server 端沒有 DOM。通常需改用 \`useEffect\` 或檢查 \`typeof window !== 'undefined'\`。`,
    options: [
      "useEffect 是同步執行的，會阻擋瀏覽器 Paint",
      "useLayoutEffect 在 DOM 變更後、畫面 Paint 之前同步執行",
      "useEffect 適合用來測量 DOM 尺寸並同步調整樣式以避免閃爍",
      "SSR 環境下 useLayoutEffect 表現完全與 Client 端一致"
    ],
    correctIndex: 1,
    quizExplanation: "useLayoutEffect 在 React 完成 DOM 變更後、瀏覽器將畫面繪製到螢幕前同步執行，能防止 Layout Shift 與閃爍。"
  },
  {
    id: "react-03",
    category: "React",
    difficulty: "Senior",
    title: "React Fiber 架構的設計動機是什麼？它是如何解決舊版 Stack Reconciler 的效能瓶頸？",
    tags: ["React Architecture", "Fiber", "Reconciler", "Time Slicing"],
    summary: "Fiber 是 React 16 重新架構的核心數據結構與鏈結串列，將渲染拆分為微小工作單元 (Work Unit)，實現可中斷與優先級排程 (Time Slicing)。",
    answer: `📌 **核心觀念**
React 15 採用 **Stack Reconciler**，遞迴遍歷元件樹。當元件樹非常龐大時，Call Stack 會持續佔用主執行緒，導致動畫卡頓與輸入延遲 (Jank)。**React Fiber** 採用虛擬堆疊 (Virtual Stack) 架構，將遞迴轉為單向鏈結串列 (LinkedList)。

🔍 **技術細節剖析**
1. **Fiber 節點結構**：
   - 每個 React Element 都對應一個 Fiber 節點。
   - 擁有 \`child\` (第一個子節點)、\`sibling\` (兄弟節點)、\`return\` (父節點) 指針。
2. **雙緩衝技術 (Double Buffering)**：
   - **current Fiber Tree**：代表當前螢幕上渲染的樹。
   - **workInProgress Fiber Tree**：在記憶體中構建與計算變更的樹。計算完成後瞬間切換指標 (Commit)。
3. **兩大階段 (Two Phases)**：
   - **Render/Reconciliation Phase**：可中斷 (Interruptible)。計算 Diff，標記 Effect Tag。
   - **Commit Phase**：不可中斷 (Synchronous)。將 DOM 變更一次性寫入瀏覽器。

💻 **資料結構意象**
\`\`\`js
// Fiber 結構簡化示意
class FiberNode {
  constructor(tag, pendingProps, key) {
    this.tag = tag; // 元件類型
    this.key = key;
    this.stateNode = null; // 對應的真實 DOM 或元件實例
    this.child = null; // 指向第一個子 Fiber
    this.sibling = null; // 指向下一個兄弟 Fiber
    this.return = null; // 指向父 Fiber
    this.alternate = null; // 對應的 current/workInProgress 雙向指標
    this.flags = 0; // 副作用標記 (Placement, Update, Deletion)
  }
}
\`\`\`

💡 **面試加分點**
- 深入解釋 \`requestIdleCallback\` 與 React 自建 \`Scheduler\` 函式庫（使用 \`MessageChannel\` 模擬 5ms 時間切片）的技術背景。`,
    options: [
      "Stack Reconciler 使用鏈結串列，Fiber 則使用遞迴呼叫堆疊",
      "Fiber 將 Render 階段設計為不可中斷的同步任務",
      "Fiber 透過 child、sibling、return 鏈結串列結構將渲染拆解為可切片的工作單元",
      "Fiber 完全廢除了 Commit 階段"
    ],
    correctIndex: 2,
    quizExplanation: "Fiber 數據結構使用單向鏈結串列 (child, sibling, return) 取代原本遞迴呼叫堆疊，從而實現了任務暫停、恢復與優先級排程。"
  },
  {
    id: "react-04",
    category: "React",
    difficulty: "Mid",
    title: "React.memo、useMemo 與 useCallback 的差別與使用時機為何？誤用會帶來什麼效能懲罰？",
    tags: ["Performance", "Memoization", "Hooks", "Optimization"],
    summary: "React.memo 記憶元件，useMemo 記憶計算結果，useCallback 記憶函式參照。過度使用會增加記憶體開銷與比對成本。",
    answer: `📌 **核心觀念**
三者皆為 React 提供的快取 (Memoization) 工具。其目的在於**跳過不必要的計算或無謂的子元件 Re-render**。然而，快取本身是有成本的 (記憶體空間與淺比對 Shallow Compare 開銷)。

🔍 **技術細節剖析**
1. **React.memo (HOC)**：
   - 包裹元件。當 Props 進行淺比對 (Shallow Compare) 未變動時，跳過該元件的 Re-render。
2. **useMemo (Hook)**：
   - \`const cachedValue = useMemo(() => calculate(), [deps])\`
   - 快取昂貴計算結果。只有當 \`deps\` 改變時才重新計算。
3. **useCallback (Hook)**：
   - \`const cachedFn = useCallback(fn, [deps])\`
   - 等同於 \`useMemo(() => fn, [deps])\`。防止父元件 Re-render 時傳給子元件的函式參照 (Reference) 改變。

💻 **常見陷阱範例**
\`\`\`jsx
// ❌ 誤用：簡單計算或沒有傳給 memo 元件的函式，加 useCallback 反而變慢
function SimpleButton() {
  // 每次 render 都創建新 closure 並比較 deps，徒增負擔
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <button onClick={handleClick}>Click</button>;
}

// ✅ 正確用法：傳給 React.memo 子元件時
const ExpensiveChild = React.memo(({ onClick }) => {
  return <button onClick={onClick}>Expensive Rerender Child</button>;
});
\`\`\`

💡 **面試加分點**
- 說明淺比對 (Shallow Comparison) 如何運作（\`Object.is\`）。
- 提及何時不該 Memoize：當 Props 頻繁改變、或傳遞 inline object/array 時，記憶化只會白白浪費比對時間。`,
    options: [
      "useCallback 會記憶計算結果，useMemo 會記憶函式參照",
      "所有組件都應該預設加上 React.memo 以獲得最佳效能",
      "React.memo 預設透過淺比對 (Shallow Comparison) 檢查 Props 是否變更",
      "useMemo 可以完全替代 React 中的所有 useEffect 功能"
    ],
    correctIndex: 2,
    quizExplanation: "React.memo 透過對前一次與當前的 Props 進行淺比對 (Shallow Comparison) 來決定是否跳過元件渲染。"
  },
  {
    id: "react-05",
    category: "React",
    difficulty: "Junior",
    title: "為什麼 React 的 State 不能直接修改 (Mutation)，而必須使用 setState 或 setFn？",
    tags: ["State", "Immutability", "Re-render", "Pure Function"],
    summary: "React 依賴不可變性 (Immutability) 進行淺比對。直接修改物件屬性參照不變，React 將無法偵測狀態改變並觸發 UI 渲染。",
    answer: `📌 **核心觀念**
React 的渲染引擎建立在 **不可變性 (Immutability)** 原則上。React 在對比 State 變更時，使用的是高效的**參照相等性比較 (Reference Equality Check / Object.is)**，而非深層比對。

🔍 **技術細節剖析**
1. **直接 Mutation 的後果**：
   - \`user.name = 'Alex'; setUser(user);\`
   - 由於 \`user\` 的記憶體位址沒有改變，React 會認為 State 未發生任何變化，因而**跳過 UI Re-render**。
2. **Immutability 的優勢**：
   - **效能**：檢查 \`prevObj === nextObj\` 只需 \`O(1)\` 時間。
   - **可預測性與時間旅行**：便於追蹤狀態歷史 (如 Redux DevTools) 與除錯。

💻 **正確寫法**
\`\`\`javascript
// 陣列操作
setList(prev => [...prev, newItem]); // 新增
setList(prev => prev.filter(item => item.id !== targetId)); // 刪除

// 物件操作
setUser(prev => ({ ...prev, name: 'Alex' }));
\`\`\`

💡 **面試加分點**
- 提及套件如 **Immer** 如何使用 JavaScript \`Proxy\` 讓開發者可以用直覺的 Mutation 語法寫出符合 Immutability 的程式碼。`,
    options: [
      "直接修改 State 會拋出 JavaScript 執行時期語法錯誤",
      "React 使用淺比對檢查參照，直接 Mutation 參照未變會導致 UI 不會重新渲染",
      "直接修改 State 會導致記憶體立即洩漏",
      "setState 是非同步的，直接修改 State 會將其強制變為同步操作"
    ],
    correctIndex: 1,
    quizExplanation: "React 使用參照相等性檢查狀態變動。若直接修改物件/陣列屬性，參照位址不變，React 將判斷狀態無變化而不引發重新渲染。"
  },
  {
    id: "react-06",
    category: "React",
    difficulty: "Senior",
    title: "什麼是 React Server Components (RSC)？它與 SSR (Server-Side Rendering) 有何本質區別？",
    tags: ["RSC", "SSR", "Next.js", "Architecture"],
    summary: "SSR 是在伺服器端將組件渲染成 HTML 傳給 Client 進行 Hydration；RSC 則是組件永遠只在 Server 端執行，不打包到 Bundle 中，返回專屬 JSON 樹結構。",
    answer: `📌 **核心觀念**
**RSC (React Server Components)** 是一種全新的組件架構。與傳統的 SSR 探討「畫面如何初次呈現」不同，RSC 探討的是「組件程式碼在哪裡執行與打包」。

🔍 **技術細節剖析**
1. **SSR (Server-Side Rendering)**：
   - 在 Server 將 React 樹轉為 HTML 傳送給瀏覽器。
   - 瀏覽器下載全部 JavaScript 檔案後進行 **Hydration (水合)**。
   - Client Bundle 依然包含所有組件程式碼。
2. **RSC (Server Components)**：
   - **零 Bundle 負擔**：Server Component 的程式碼與依賴 (如大型 markdown 解析套件) 永遠不會下載到瀏覽器。
   - **無 Hydration 成本**：Server Component 不會在 Client 執行，不需要 Hydration。
   - **Direct Backend Access**：可以直接在組件內存取資料庫或檔案系統。
   - **回傳格式**：回傳特殊的流式 UI 描述檔 (Virtual DOM Stream)，可與 Client Component 無縫混合。

💻 **比較表**
| 特性 | SSR | RSC |
| --- | --- | --- |
| 執行位置 | Server 初次渲染 -> Client 再次執行 | 僅限 Server |
| Bundle Size | 包含所有組件 JavaScript | 0 KB (僅 Client Components 入包) |
| State/Hooks | 支援 useState, useEffect | ❌ 不支援 State/Effects/DOM 事件 |

💡 **面試加分點**
- 解釋 RSC 中 \`"use client"\` 指令的正確含義（它宣告的是 Client/Server 的邊界，而非表示該組件只在 Client 端渲染）。`,
    options: [
      "RSC 與 SSR 完全相同，只是 Next.js 的行銷新名詞",
      "RSC 的組件程式碼會打包進 Client 端 JavaScript bundle",
      "SSR 用於生成初始 HTML 並進行水合，而 RSC 組件只在 Server 端執行且不增加 Client Bundle",
      "RSC 裡面可以自由使用 useState 與 useEffect"
    ],
    correctIndex: 2,
    quizExplanation: "RSC (React Server Components) 永遠只在伺服器執行，其依存庫與程式碼不會打包進前端 Bundle，且不需要水合作業。"
  },
  {
    id: "react-07",
    category: "React",
    difficulty: "Mid",
    title: "如何設計一個高效能的 React 定義 Context (useContext)？如何避免無謂的全域 Re-render？",
    tags: ["Context API", "State Management", "Performance", "Re-render"],
    summary: "Context 值更新時，所有呼叫 useContext 的元件都會重新渲染。解法是將 Context 拆分、結合 React.memo 或使用狀態管理庫 (如 Zustand)。",
    answer: `📌 **核心觀念**
React Context 本質上是為了**解決 Prop Drilling**，而非高效能的全域狀態管理庫。當 \`<Context.Provider value={val}>\` 中的 \`value\` 參照改變時，**所有訂閱該 Context 的子元件都會無條件 Re-render**，無視是否使用了變動的那部分資料。

🔍 **技術細節剖析與優化方案**
1. **狀態拆分 (Context Splitting)**：
   - 將頻繁變動的 State 與不常變動的 State (或 Dispatch 函式) 拆分為不同的 Context。
2. **使用 Component Splitting + React.memo**：
   - 在 Provider 內部抽離中間層元件，透過 \`children\` 傳遞，防止 Provider 自體更新帶動子樹更新。
3. **Selector 模式**：
   - 原生 Context 不支援 Selector（如 \`useContextSelector\`）。對於複雜全域狀態，建議採用 **Zustand** 或 **Jotai**，它們採用原子化或訂閱制 (Subscription) 實現精準更新。

💻 **優化範例 (拆分 Dispatch)**
\`\`\`jsx
const StateContext = createContext();
const DispatchContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({ name: 'Alex' });
  return (
    <StateContext.Provider value={user}>
      <DispatchContext.Provider value={setUser}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}
// 只改資料的按鈕元件訂閱 DispatchContext，不會因為 user 變更而 re-render！
\`\`\`

💡 **面試加分點**
- 分析為何大型專案常以 Zustand / Redux Toolkit 替代全全域 Context。`,
    options: [
      "只要 Provider 的 value 改變，所有呼叫 useContext 的元件皆會 Re-render",
      "useContext 原生支援精準的 Selector 功能，只重新渲染被選取的欄位",
      "把所有狀態都放在一個巨大的 Context 物件中最有利於效能優化",
      "Context 改變時，React.memo 可以自動阻止呼叫了 useContext 的元件更新"
    ],
    correctIndex: 0,
    quizExplanation: "React 原生 Context 只要 Provider 的 value 參照更新，所有訂閱該 Context 的元件都會強制 Re-render。"
  },
  {
    id: "react-08",
    category: "React",
    difficulty: "Junior",
    title: "React 中的 key prop 作用為何？為什麼不能用 Math.random() 或 index 作為 key？",
    tags: ["Virtual DOM", "Diffing Algorithm", "Keys", "Reconciliation"],
    summary: "key 是 Reconciliation 用於辨識 Virtual DOM 節點身分的唯一標示。使用動態隨機值或 index 會引發渲染錯誤與嚴重效能損失。",
    answer: `📌 **核心觀念**
React 在進行 **Diffing 演算法** (比較新舊 O(N) 虛擬 DOM 樹) 時，依靠 \`key\` 來識別清單中的元素是 **被移動、新增還是刪除**。

🔍 **技術細節剖析**
1. **使用 Math.random() 的危害**：
   - 每次 Re-render 都會產生全新的 key。
   - React 會認為**舊節點全部被銷毀 (Unmount)，新節點全部重新創建 (Mount)**。這會破壞內部 State、DOM 狀態 (如 input 輸入焦點) 並帶來極高的效能開銷。
2. **使用 index 作為 key 的陷阱**：
   - 當清單發生**排序、頂部/中間插隊新增、刪除**時，項目的 index 會發生位移。
   - React 會誤以為同 index 的元件是同一個，導致元件內部 State（如 Checkbox 選取狀態、Input 填寫值）錯位展示。

💻 **正確觀念範例**
\`\`\`jsx
// ✅ 使用具有唯一性且穩定的資料 ID
{items.map(item => (
  <TodoItem key={item.id} data={item} />
))}
\`\`\`

💡 **面試加分點**
- 說明唯一例外情況：當清單是**靜態的**（不會進行新增、刪除、重新排序）且沒有內部 state 時，使用 \`index\` 作為 key 是安全且被許可的。`,
    options: [
      "Math.random() 是最推薦的 key 值來源，能保證絕對不重複",
      "key 幫助 React 的 Diffing 演算法精確判斷列表項目的移動、新增與刪除",
      "使用 index 作為 key 在列表發生插隊刪除時不會有任何 UI State 錯置問題",
      "key 會被作為真實 DOM 的標準 HTML 屬性 render 出來"
    ],
    correctIndex: 1,
    quizExplanation: "key 屬性是 React 虛擬 DOM Diffing 演算法的關鍵標示，用以在陣列更新時維護元件身分與內部狀態。"
  },
  {
    id: "react-09",
    category: "React",
    difficulty: "Mid",
    title: "請說明 React 18 中的 useId, useDeferredValue 與 useSyncExternalStore 的應用場景。",
    tags: ["React 18", "Hooks", "Concurrent", "Accessibility"],
    summary: "useId 生成 SSR 安全的唯一 ID；useDeferredValue 延遲非緊急 UI 更新；useSyncExternalStore 解決並發模式下的 Tear 撕裂問題。",
    answer: `📌 **核心觀念**
React 18 為解決 SSR 嚴格一致性、並發排程與外部狀態庫同步，提供了三個極具戰略價值的內建 Hooks。

🔍 **技術細節剖析**
1. **useId**：
   - 用於生成在 Server 與 Client 端全域唯一且**完全一致的表單/無障礙 ID**。避免了過往 Hydration Mismatch 的問題。
2. **useDeferredValue**：
   - 類似於 Debounce/Throttle，但更智慧。它會接收一個 State，並回傳該 State 的「延遲版本」。當主執行緒有緊急任務時，延遲版本會優先讓出執行時間。
3. **useSyncExternalStore**：
   - 專為狀態管理庫（如 Redux, Zustand, RxJS）設計。在 Concurrent Rendering 併發中斷機制下，確保訂閱外部 store 時不會產生 **Tear (畫面數據不一致/撕裂)**。

💻 **useDeferredValue 範例**
\`\`\`jsx
function SearchPage({ text }) {
  // text 是即時更新的 input state
  const deferredText = useDeferredValue(text);
  
  // 昂貴的搜尋結果列表中使用 deferredText
  return <HugeList query={deferredText} />;
}
\`\`\`

💡 **面試加分點**
- 對比 \`useDeferredValue\` 與 \`debounce\` 的區別：Debounce 有固定的等待時間 (如 300ms)，而 \`useDeferredValue\` 無固定延遲，只要主執行緒一有空閒就會立即更新。`,
    options: [
      "useId 產生的 ID 每次 re-render 都會改變",
      "useDeferredValue 會強制主執行緒暫停 300ms",
      "useSyncExternalStore 解決了併發渲染下訂閱外部 Store 時數據可能撕裂 (Tear) 的問題",
      "useId 主要用於取代 UUID 儲存在資料庫"
    ],
    correctIndex: 2,
    quizExplanation: "useSyncExternalStore 確保在並發渲染中斷時，讀取外部 state 不會因為中斷導致組件樹讀到不同時間點的狀態 (Tearing)。"
  },
  {
    id: "react-10",
    category: "React",
    difficulty: "Senior",
    title: "如何實現一個高擴充性、符合 Headless UI 概念的 Custom Hook 設計？",
    tags: ["Custom Hooks", "Headless UI", "Design Pattern", "Compound Components"],
    summary: "Headless UI 模式將 logic, state, accessbility 與特定 UI 樣式解耦，由 Hook 處理邏輯，元件只負責視覺呈現。",
    answer: `📌 **核心觀念**
**Headless UI Design Pattern** 是一種前端組件架構哲學。組件庫（如 Radix UI, TanStack Table, Downshift）將**狀態邏輯、鍵盤導覽、無障礙 ARIA** 抽離到 Custom Hook 中，把視覺 CSS 與 HTML DOM 控制權完全留給使用者。

🔍 **核心實作策略**
1. **Prop Getters Pattern**：
   - Hook 回傳專門的 \`getToggleProps()\`, \`getItemProps()\`, 內部自動 inject 所需的 ARIA 屬性與事件處理。
2. **Controlled / Uncontrolled 雙模支援**：
   - Hook 應同時支援由內部維護 State，或由外部傳入 \`value\` 與 \`onChange\` 控制。
3. **State Reducer Pattern**：
   - 允許呼叫者傳入自訂的 reducer 覆寫 Hook 內部的預設狀態變更邏輯。

💻 **Headless Toggle Hook 範例**
\`\`\`jsx
function useToggle({ isControlled, value, onChange } = {}) {
  const [onState, setOnState] = useState(false);
  const isOn = isControlled ? value : onState;

  const toggle = useCallback(() => {
    if (isControlled) {
      onChange?.(!value);
    } else {
      setOnState(prev => !prev);
    }
  }, [isControlled, value, onChange]);

  const getTogglerProps = (props = {}) => ({
    'aria-pressed': isOn,
    onClick: (e) => {
      props.onClick?.(e);
      toggle();
    },
    ...props
  });

  return { isOn, toggle, getTogglerProps };
}
\`\`\`

💡 **面試加分點**
- 討論 Component API 設計哲學：Compound Components + Headless Hooks 結合帶來的極致靈活性。`,
    options: [
      "Headless UI 指的是沒有任何 JavaScript 邏輯的 HTML 模板",
      "Headless UI 將狀態邏輯與 ARIA 無障礙功能抽離到 Hook，不強加特定 UI 樣式",
      "Custom Hook 內部絕對不能使用 useState 或 useEffect",
      "Prop Getters Pattern 會禁止使用者添加自定義的 onClick 事件"
    ],
    correctIndex: 1,
    quizExplanation: "Headless UI 模式專注於狀態與無障礙邏輯封裝，完全不綁定樣式，給予 UI 元件極高的樣式客製化彈性。"
  },
  {
    id: "react-11",
    category: "React",
    difficulty: "Mid",
    title: "React 中的 Error Boundary (錯誤邊界) 是什麼？有哪些狀況無法被 Error Boundary 擷取？",
    tags: ["Error Boundary", "Lifecycle", "Exception Handling"],
    summary: "Error Boundary 是一種能夠捕捉其子組件樹中 JavaScript 錯誤並顯示 Fallback UI 的 Class 組件。無法擷取事件處理器、非同步與 SSR 錯誤。",
    answer: `📌 **核心觀念**
預設情況下，如果組件在渲染期間拋出 JavaScript 錯誤，React 會卸載 (Unmount) 整顆組件樹。**Error Boundary** 像是一個 JavaScript 的 \`try...catch\` 區塊，保護應用程式不致全黑屏。

🔍 **技術細節剖析**
1. **實作方式**：
   - 目前**必須使用 Class Component**，實作 \`static getDerivedStateFromError()\` (用於更新 fallback state) 或 \`componentDidCatch()\` (用於紀錄錯誤日誌)。
2. **⚠️ 無法捕捉 (Catch) 的 4 大例外情況**：
   - **Event Handlers (事件處理器)**：例如 \`onClick\` 內部的錯誤 (需用一般的 try...catch)。
   - **Asynchronous Code (非同步程式碼)**：例如 \`setTimeout\`、\`fetch\` 或 \`Promise\`。
   - **Server-Side Rendering (SSR)**。
   - **Error Boundary 組件本身的錯誤**。

💻 **範例程式碼**
\`\`\`jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>出錯了！Fallback UI</h2>;
    }
    return this.props.children;
  }
}
\`\`\`

💡 **面試加分點**
- 提及開源套件 \`react-error-boundary\`，它利用 Hook 風格與 \`useErrorBoundary\` 提供極佳的函式型包裝。`,
    options: [
      "Error Boundary 可以輕鬆捕捉 onClick 事件處理器內部拋出的錯誤",
      "Error Boundary 目前仍須透過 Class Component 實作 getDerivedStateFromError 或 componentDidCatch",
      "Error Boundary 可以捕捉 setTimeout 與 fetch Promise 內部的非同步錯誤",
      "Error Boundary 可以完全捕捉 SSR 在 Server 端的渲染錯誤"
    ],
    correctIndex: 1,
    quizExplanation: "Error Boundary 必須以 Class Component 形式實現，且僅能捕捉 Render、生命週期與子元件樹中的錯誤，無法捕捉事件處理器或非同步錯誤。"
  },
  {
    id: "react-12",
    category: "React",
    difficulty: "Junior",
    title: "React 中的 Controlled (受控) 與 Uncontrolled (非受控) 元件有何差異？",
    tags: ["Forms", "Controlled Components", "useRef", "State"],
    summary: "受控元件由 React State 驅動與控制數值；非受控元件資料由 DOM 節點自身維護，透過 useRef 存取。",
    answer: `📌 **核心觀念**
在處理表單輸入 (Input, Select, Textarea) 時，受控與非受控代表了**資料真理來源 (Source of Truth)** 的不同歸屬。

🔍 **技術細節剖析**
1. **Controlled Component (受控元件)**：
   - 表單資料由 **React State** 託管。
   - \`<input value={name} onChange={e => setName(e.target.value)} />\`
   - **優點**：可即時進行表單驗證、動態停用按鈕、格式化輸入。
2. **Uncontrolled Component (非受控元件)**：
   - 表單資料由 **DOM 自身** 託管。
   - 透過 \`useRef\` 或 \`defaultValue\` 在提交時一次性讀取。
   - \`<input ref={inputRef} defaultValue="Alex" />\`
   - **優點**：程式碼較簡短、大型表單減少每字輸入引起的全元件 Re-render。

💡 **面試加分點**
- 提及檔案上傳 \`<input type="file" />\` 在 React 中永遠是非受控元件，因為其值唯讀且由瀏覽器直接掌控。`,
    options: [
      "受控元件的資料來源是 DOM 節點本身",
      "非受控元件必須為每一個輸入綁定 value 與 onChange",
      "受控元件由 React State 掌控，適合實現即時輸入驗證與即時 UI 反應",
      "<input type=\"file\" /> 是典型的受控元件"
    ],
    correctIndex: 2,
    quizExplanation: "受控元件以 React State 為 Source of Truth，每次 keypress 都透過 onChange 更新 state，利於即時驗證。"
  },
  {
    id: "react-13",
    category: "React",
    difficulty: "Senior",
    title: "請解釋 StrictMode 在 React 18 中的雙重觸發 (Double Invoke) 機制及其背後目的。",
    tags: ["StrictMode", "React 18", "Effects", "Hydration"],
    summary: "StrictMode 在開發模式下會故意執行兩次 Effect (Mount -> Unmount -> Mount)，用以驗證 Effect 是否具備乾淨的 Cleanup 邏輯與冪等性。",
    answer: `📌 **核心觀念**
在 React 18 開發模式 (\`development\`) 下，包在 \`<React.StrictMode>\` 內部的元件，在 Mount 時其 \`useEffect\` 會被**故意觸發兩次** (Mount -> Unmount -> Mount)。這不是 Bug，而是 React 團隊特意設計的健康檢查機制。

🔍 **背後戰略目的**
1. **適應未來的 Offscreen (Activity) API**：
   - 未來 React 允許暫存 UI (如 Tab 切換、隱藏選單)。組件會被 Unmount 暫存，再次切回時重新 Mount 且保留狀態。
2. **檢查是否有遺漏的 Cleanup**：
   - 如果 Effect 內部訂閱了 WebSocket、Event Listener 或 Timer，但**沒有在 cleanup 函式中清除**，雙重執行會立即暴露重複訂閱或記憶體洩漏 (Memory Leak) 問題。

💻 **正確寫法範例**
\`\`\`jsx
useEffect(() => {
  const connection = createConnection();
  connection.connect();

  // 必須提供 Cleanup！
  return () => {
    connection.disconnect();
  };
}, []);
\`\`\`

💡 **面試加分點**
- 強調此雙重觸發**只會在開發模式 (Development) 發生**，在生產環境 (Production Build) 中完全不會執行雙次。`,
    options: [
      "StrictMode 雙重觸發只在 Production 生產環境生效",
      "雙重執行 Effect 是為了檢測 Effect 是否具備對應的 Cleanup 邏輯並預防記憶體洩漏",
      "StrictMode 會讓所有組件在生產環境中效能下降 50%",
      "StrictMode 會自動幫你把所有 setTimeout 轉換為 setInterval"
    ],
    correctIndex: 1,
    quizExplanation: "React 18 StrictMode 在開發環境刻意掛載-卸載-再掛載元件，藉此逼出未正確寫 Cleanup 導致的記憶體洩漏與重複訂閱 Bug。"
  },
  {
    id: "react-14",
    category: "React",
    difficulty: "Mid",
    title: "useRef 與普通的 JavaScript 全域/區域變數有何根本區別？",
    tags: ["useRef", "State", "Re-render", "Reference"],
    summary: "useRef 在元件整個生命週期中保持相同的物件參照 ({ current: val })，且更新 .current 不會引發元件 Re-render。",
    answer: `📌 **核心觀念**
\`useRef\` 回傳一個可變的 ref 物件 \`{ current: value }\`。其核心特性在於：**跨越 Re-render 保持參照穩定**，且**修改 .current 不會觸發 UI 重新渲染**。

🔍 **三者對比**
1. **useState**：更新狀態 -> **觸發 Re-render** -> 保留新數值。
2. **useRef**：更新 \`.current\` -> **不觸發 Re-render** -> 保留新數值。
3. **一般區域變數 (const a = 1)**：每次元件重新渲染 -> **重新初始化**。
4. **全域變數 (let b = 1)**：多個元件實例會**共享同一個全域變數**，導致狀態污染。

💻 **常見應用場景**
- 存取真實 DOM 節點 (\`inputRef.current.focus()\`)。
- 儲存計時器 ID (\`timerRef.current = setInterval(...)\`)。
- 紀錄前一次渲染的 State (\`prevCountRef.current\`)。

💡 **面試加分點**
- 警告：不要在 Render 階段 (即組件 return 前的同步邏輯中) 讀取或寫入 \`ref.current\`，這在 Concurrent Rendering 下是不安全的；應在 \`useEffect\` 或事件處理器中讀寫。`,
    options: [
      "修改 ref.current 的值會立即觸發元件重新渲染",
      "元件內部的普通區域變數會在每次 re-render 時保持前一次的值",
      "useRef 跨越 re-render 保持相同參照，且修改 .current 不會引發重新渲染",
      "全域變數適合用來替代 useRef 管理每個組件獨立的 DOM 參照"
    ],
    correctIndex: 2,
    quizExplanation: "useRef 產生的物件在元件生命週期中參照固定，變更 current 屬性不會引發重新渲染，適合保存不需要反映在 UI 上的持久數據。"
  },
  {
    id: "react-15",
    category: "React",
    difficulty: "Senior",
    title: "如何在 React 中設計與實作微前端 (Micro-Frontends) 架構？Module Federation 的角色為何？",
    tags: ["Micro-Frontends", "Webpack", "Module Federation", "Architecture"],
    summary: "微前端將大型單體拆分為多個可獨立開發與部署的微應用。Webpack 5 Module Federation 允許在執行期動態加載遠端 React 元件。",
    answer: `📌 **核心觀念**
微前端 (Micro-Frontends) 將後端 Microservices 的理念延伸至前端。多個團隊可以獨立使用不同版本、甚至不同框架開發子應用，最後整合在 Host 容器應用中。

🔍 **關鍵技術與 Module Federation**
1. **Module Federation (Webpack 5 / Vite Plugin)**：
   - 解決了過往 iframe 效能差、或 npm package 需要重新編譯發布的痛點。
   - **Host App**：主應用，負責路由導航與全域 Context/Auth。
   - **Remote App**：提供遠端匯出的組件 (\`exposes\`)。
   - 執行期 (Runtime) 動態載入，且支援**共享依賴 (Shared Dependencies)**（如雙方共享同一份 React 實例，避免重複下載）。

2. **核心挑戰與解法**：
   - **CSS 衝突**：使用 CSS Modules、Tailwind 帶 prefix 或 Shadow DOM。
   - **狀態共享**：透過 Custom Event、Window Event Bus 或輕量狀態訂閱。
   - **版本容錯**：使用 React \`Suspense\` 與 \`Error Boundary\` 包裹遠端動態載入的元件。

💡 **面試加分點**
- 探討微前端的代價：增加基礎設施複雜度、資安與依賴版本管理負擔。`,
    options: [
      "Module Federation 要求子應用更新時，主應用必須重新打包發布",
      "Module Federation 允許在執行期動態載入遠端組件，並能在主子應用間共享 React 依賴",
      "微前端只能使用 iframe 實現，沒有其他技術方案",
      "微前端要求所有子團隊必須使用完全相同的 React 小版本號"
    ],
    correctIndex: 1,
    quizExplanation: "Module Federation 允許跨應用在 Runtime 動態載入代碼與組件，並能在 Host 與 Remote 間共享 common 依賴 (如 React)。"
  },
  {
    id: "react-16",
    category: "React",
    difficulty: "Junior",
    title: "什麼是 Custom Hook？建立 Custom Hook 必須遵守哪些規則 (Rules of Hooks)？",
    tags: ["Custom Hooks", "Rules of Hooks", "Reusability"],
    summary: "Custom Hook 是封裝與複用可跨組件狀態邏輯的函式，名稱必須以 use 開頭，且 Hook 只能在頂層呼叫。",
    answer: `📌 **核心觀念**
Custom Hook 是 React 邏輯複用的終極武器。它是一個名稱以 **\`use\`** 開頭的 JavaScript 函式，內部可以呼叫其他 React Hooks (如 useState, useEffect)。

🔍 **React Hooks 的兩大鐵律 (Rules of Hooks)**
1. **只在最頂層 (Top Level) 呼叫 Hooks**：
   - **切勿**在條件判斷 (\`if\`)、迴圈 (\`for\`) 或嵌套函式中呼叫 Hook。
   - **原因**：React 依賴 Hooks 被呼叫的**順序 (Order of Invocation)** 來維護內部的單向鏈結串列。條件式呼叫會打亂 Hook 的索引陣列。
2. **只在 React 函式元件或 Custom Hooks 中呼叫 Hooks**：
   - 切勿在一般的普通 JavaScript 函式中呼叫。

💻 **範例程式碼**
\`\`\`jsx
// 自訂網路狀態 Hook
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
\`\`\`

💡 **面試加分點**
- 解釋 ESLint 外掛 \`eslint-plugin-react-hooks\` 如何在編譯時期自動協助檢查 Hook 規則與依賴陣列。`,
    options: [
      "Custom Hook 名稱可以自由命名，不需要以 use 開頭",
      "可以在 if 條件式內部呼叫 useState 以達到動態初始化",
      "React 依靠 Hook 執行的絕對順序來正確關聯狀態與資料",
      "Custom Hook 可以在一般的 Node.js 工具函式中呼叫"
    ],
    correctIndex: 2,
    quizExplanation: "React 內部以呼叫順序 (Call Order) 來追蹤 Hook 狀態，因此 Hook 必須在組件最頂層無條件執行。"
  },
  {
    id: "react-17",
    category: "React",
    difficulty: "Mid",
    title: "React 的 Portals (createPortal) 是什麼？它解決了什麼 CSS 渲染難題？",
    tags: ["Portals", "DOM", "CSS", "Modal"],
    summary: "createPortal 將子元件渲染到父元件 DOM 樹之外的節點，解決 z-index、overflow: hidden 等 CSS 層級切割問題，同時保留 React 事件冒泡。",
    answer: `📌 **核心觀念**
預設情況下，React 元件會渲染在其父元件的 DOM 結構中。然而當製作 **Modal, Tooltip, Popover, Drawer** 時，父元件的 \`overflow: hidden\` 或 \`z-index\` / \`transform\` 屬性會切割或遮蔽子元件。

🔍 **技術細節剖析**
1. **DOM 位置 vs React 樹位置**：
   - **DOM**：元件被渲染至指定的 DOM 節點（例如 \`document.body\` 或獨立的 \`#modal-root\`）。
   - **React 樹**：在 React 的組件階層中，它依然屬於聲明它的父組件。
2. **事件冒泡 (Event Bubbling)**：
   - 即使 DOM 實體已經被丟到 \`document.body\` 下，**React 合成事件 (Synthetic Events)** 依然會順著 React 的組件樹向父組件冒泡！

💻 **實作範例**
\`\`\`jsx
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded">{children}</div>
    </div>,
    document.body // 渲染至 DOM 頂層
  );
}
\`\`\`

💡 **面試加分點**
- 強調事件冒泡機制在 Portal 中的妙用：父元件可以直接在 \`<ModalContainer onClick={handleChildClick}>\` 捕捉來自 Portal 內部的點擊事件。`,
    options: [
      "createPortal 渲染的 DOM 節點會在 React 事件系統中中斷事件冒泡",
      "createPortal 能將 DOM 渲染到指定的外部 DOM 容器，解決 overflow:hidden 與 z-index 遮擋痛點",
      "createPortal 只支援在 Server 端渲染時使用",
      "createPortal 會創建一個全新的獨立 React Root"
    ],
    correctIndex: 1,
    quizExplanation: "createPortal 允許將 React 元件輸出到真實 DOM 的任意位置，突破父元件 CSS 容器限制，且保留 React 事件冒泡機制。"
  }
];
