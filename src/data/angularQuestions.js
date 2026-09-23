export const angularQuestions = [
  {
    id: "angular-01",
    category: "Angular",
    difficulty: "Mid",
    title: "Angular 17 引入的 Angular Signals 是什麼？與傳統 RxJS 有何根本差別？",
    tags: ["Signals", "RxJS", "Reactivity", "Angular 17"],
    summary: "Signals 是細粒度活性 (Fine-grained Reactivity) 狀態管理機制，能在不依賴 Zone.js 的情況下精準追蹤與通知 UI 更新，簡化同步狀態管理。",
    answer: `📌 **核心觀念**
**Angular Signals** 是 Angular 16+ 推出並在 17 成為主流的反應式狀態模型。它提供無須訂閱 (Unsubscribe) 的細粒度狀態追蹤機制，並為未來無 Zone.js (Zoneless) 的極致效能奠定基礎。

🔍 **技術細節剖析與 RxJS 比較**
1. **RxJS (Stream / Asynchronous)**：
   - 適合處理**非同步事件流**、HTTP 請求、WebSocket、Debounce/Throttle 等時間維度的資料。
   - 需要手動取消訂閱 (\`takeUntilDestroyed\`)，否則易造成記憶體洩漏。
2. **Signals (State / Synchronous)**：
   - 適合處理**同步應用程式狀態**與衍生值。
   - **無須訂閱/取消訂閱**：Signals 會在被讀取時自動追蹤依賴關係。
3. **三大靈魂要素**：
   - \`signal(value)\`：可寫狀態 (Writable Signal)。
   - \`computed(() => fn)\`：唯讀衍生狀態 (自動快取，依賴變更時才重算)。
   - \`effect(() => fn)\`：狀態變更時發生的副作用。

💻 **範例程式碼**
\`\`\`typescript
import { Component, signal, computed, effect } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-counter',
  template: \`
    <p>Count: {{ count() }}</p>
    <p>Double: {{ doubleCount() }}</p>
    <button (click)="increment()">+1</button>
  \`
})
export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  constructor() {
    effect(() => {
      console.log(\`當前 Count 是: \${this.count()}\`);
    });
  }

  increment() {
    this.count.update(c => c + 1);
  }
}
\`\`\`

💡 **面試加分點**
- 說明 \`toSignal()\` 與 \`toObservable()\`（來自 \`@angular/core/rxjs-interop\`），展示如何在 RxJS 與 Signals 之間進行優雅橋接。`,
    options: [
      "Signals 必須手動呼叫 .unsubscribe() 否則會造成記憶體洩漏",
      "Signals 適合同步狀態，不需要手動取消訂閱，並提供細粒度更新能力",
      "Signals 完全廢除了 RxJS 在 HTTP 請求方面的所有應用",
      "computed() 創建的 Signal 每次被讀取都會強制重新執行運算"
    ],
    correctIndex: 1,
    quizExplanation: "Signals 是同步細粒度響應系統，讀取時自動建立依賴關係，免去 RxJS 複雜的訂閱管理成本。"
  },
  {
    id: "angular-02",
    category: "Angular",
    difficulty: "Senior",
    title: "Angular 的 Change Detection (變更偵測) 運作原理為何？Default 與 OnPush 策略有何效能差異？",
    tags: ["Change Detection", "OnPush", "Zone.js", "Performance"],
    summary: "Change Detection 由 Zone.js 攔截非同步事件觸發；OnPush 策略僅在 @Input 參照改變、Signal 觸發或手動標記時才檢查組件樹。",
    answer: `📌 **核心觀念**
Angular 的變更偵測負責將組件的狀態映射至 DOM。Angular 從根組件開始向下進行**自上而下的單向樹狀檢查**。

🔍 **技術細節剖析**
1. **Default 策略 (預設)**：
   - 只要任何非同步事件 (點擊、setTimeout、XHR) 發生，**Zone.js** 就會通知 Angular 掃描整顆元件樹中的每一個元件，即使該元件資料完全沒變。
2. **OnPush 策略 (效能優化極致)**：
   - 設定 \`changeDetection: ChangeDetectionStrategy.OnPush\`。
   - 只有在以下 4 種情況下，Angular 才會檢查該組件及其子樹：
     1. **\`@Input()\` 參照地址發生改變** (Shallow Check)。
     2. 組件或其子組件**發起了 DOM 事件** (如 \`(click)\`)。
     3. 內部使用了 **Async Pipe** 或 **Signal** 觸發通知。
     4. 手動呼叫了 \`ChangeDetectorRef.markForCheck()\`.

💻 **OnPush + Immutability 範例**
\`\`\`typescript
@Component({
  selector: 'app-user-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<h2>{{ user.name }}</h2>\`
})
export class UserProfileComponent {
  @Input() user!: { name: string };
}
// 父組件更新方式：
// ❌ 直接修改屬性參照不變，OnPush 組件不會更新：this.user.name = 'Alex';
// ✅ 重新給予新參照，引發 OnPush 組件更新：this.user = { ...this.user, name: 'Alex' };
\`\`\`

💡 **面試加分點**
- 比較 \`markForCheck()\` (將當前組件至根節點的所有祖先標記為 CheckOnce) 與 \`detectChanges()\` (立即對當前組件及子樹執行同步檢查) 的根本差異。`,
    options: [
      "OnPush 策略下，直接修改 Input 物件的屬性也能自動引發 UI 更新",
      "Default 策略會在任何非同步事件發生時檢查整顆組件樹",
      "markForCheck() 會立即執行同步的變更偵測，無視父組件狀態",
      "Zone.js 只能攔截 HTML 元素原生 onclick 事件"
    ],
    correctIndex: 1,
    quizExplanation: "Default 策略會因為非同步事件掃描全部組件，而 OnPush 能將掃描範圍收窄至僅在 Input 參照變更或觸發標記時檢查。"
  },
  {
    id: "angular-03",
    category: "Angular",
    difficulty: "Mid",
    title: "請說明 RxJS 的四大高階轉換算子 (switchMap, mergeMap, concatMap, exhaustMap) 的行為差異。",
    tags: ["RxJS", "Operators", "Asynchronous", "HTTP"],
    summary: "switchMap 取消前次未完請求；mergeMap 平行併發執行；concatMap 佇列順序執行；exhaustMap 執行期間忽略新發起請求。",
    answer: `📌 **核心觀念**
這四個算子都用於處理「Observable 產生 Observable」的高階情境 (Higher-order Observables)，但在處理**內部 Observable 的併發與取消**上有著關鍵性的不同。

🔍 **四大算子行為對比**
1. **switchMap (切換取消)**：
   - 當新值傳入時，**立即取消 (Unsubscribe) 之前未完成的內部 Observable**。
   - **適用場景**：自動補全搜尋框 (Autocomplete Search)，永遠只關心最新一次輸入。
2. **mergeMap (併發處置)**：
   - 不會取消任何內部 Observable，**同時平行處理所有請求**，結果按完成時間返回。
   - **適用場景**：獨立的批量上傳或抓取作業。
3. **concatMap (佇列排隊)**：
   - 保持嚴格順序。前一個內部 Observable 完成 (Complete) 後，才會訂閱下一個。
   - **適用場景**：有嚴格先後順序依賴的 API 呼叫。
4. **exhaustMap (抵制忽略)**：
   - 當目前有一個內部 Observable 在執行中時，**直接忽略/拋棄之後傳入的新事件**，直到當前任務結束。
   - **適用場景**：表單防重複點擊提交按鈕 (Submit Button)。

💻 **決策矩陣**
- 搜尋打字 -> \`switchMap\`
- 按鈕防連點 -> \`exhaustMap\`
- 佇列按順序 Save -> \`concatMap\`
- 獨立無順序平行 -> \`mergeMap\`

💡 **面試加分點**
- 解釋為何在搜尋功能中誤用 \`mergeMap\` 會產生 Race Condition (後發出的請求先返回，導致畫面呈現舊資料)。`,
    options: [
      "switchMap 會等待上一個內部 Observable 完成後才開始執行下一個",
      "exhaustMap 在當前請求執行完畢前會忽略新發起的事件，適合防重複點擊",
      "mergeMap 會取消所有尚未回應的歷史 API 請求",
      "concatMap 會平行平行發送所有 HTTP 請求"
    ],
    correctIndex: 1,
    quizExplanation: "exhaustMap 會在內部 Observable 還沒結束時忽略後續所有輸入，非常適合防重複 Submit 操作。"
  },
  {
    id: "angular-04",
    category: "Angular",
    difficulty: "Junior",
    title: "Angular 17 的全新控制流語法 (@if, @for, @switch) 與舊版結構型指令 (*ngIf, *ngFor) 有何優勢？",
    tags: ["Control Flow", "Angular 17", "Template", "Performance"],
    summary: "全新內建控制流 @ 語法不需要導入 CommonModule，語法更簡潔，且 @for 強制要求 track 提升列表 Diff 效能。",
    answer: `📌 **核心觀念**
Angular 17 重構了模板控制流，引進基於 **Block Syntax (@if, @for, @switch)** 的內建控制流，用以取代過去基於微語法 (Microsyntax) 的結構型指令 (\`*ngIf\`, \`*ngFor\`, \`*ngSwitch\`)。

🔍 **核心優勢剖析**
1. **零 Import 成本 (Built-in)**：
   - 舊版需要導入 \`CommonModule\` 或 \`NgIf\`/\`NgFor\`。新語法直接內建於模板編譯器，零 import 負擔。
2. **極致效能與強制 Track**：
   - 舊版 \`*ngFor\` 的 \`trackBy\` 是可選的，新手容易漏寫導致 DOM 重新整顆重建。
   - 新版 \`@for\` 的 \`track\` 是**強制的語法需求**，極大程度避免了效能陷阱。
3. **優雅的 @empty 區塊**：
   - 當陣列為空時，可以直接使用 \`@empty\` 展示空狀態，無須額外寫 \`*ngIf="items.length === 0"\`。

💻 **語法對比**
\`\`\`html
<!-- 舊版 *ngFor -->
<div *ngFor="let item of items; trackBy: trackById">
  {{ item.name }}
</div>

<!-- 新版 @for (Angular 17+) -->
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <p>目前沒有資料</p>
}
\`\`\`

💡 **面試加分點**
- 提及 Angular CLI 提供自動遷移指令 \`ng g @angular/core:control-flow\`，能無縫將舊專案全部轉換為新語法。`,
    options: [
      "新版 @for 語法中，track 屬性是可寫可不寫的可選參數",
      "@if 語法仍必須在 Component 中 Import CommonModule 才能編譯",
      "新控制流語法編譯出的 JavaScript 代碼更少，且支援 @empty 展示空清單區塊",
      "@switch 語法無法配合 Standalone Components 使用"
    ],
    correctIndex: 2,
    quizExplanation: " Angular 17 新控制流採用 Block 語法，內建於編譯器，不需匯入 CommonModule，並內建 @empty 與強制 track 提升效能。"
  },
  {
    id: "angular-05",
    category: "Angular",
    difficulty: "Mid",
    title: "Angular 依賴注入 (Dependency Injection) 的 Hierarchical Injectors (階層式注入器) 運作原理為何？",
    tags: ["Dependency Injection", "Injector", "Providers", "Architecture"],
    summary: "Angular DI 是階層式的。尋找依賴時由當前 Element Injector 沿著組件樹向上尋找 Module/Environment Injectors，實現單例或獨立實例控制。",
    answer: `📌 **核心觀念**
Angular 的 **Dependency Injection (DI)** 系統是其架構靈魂。DI 系統具備**階層性 (Hierarchical)**，這意味著應用程式中存在一顆 Injector 樹，與組件 DOM 樹平行對應。

🔍 **Injectors 兩大層級**
1. **EnvironmentInjector (環境注入器)**：
   - 包含 Root Injector。例如在 Service 寫 \`@Injectable({ providedIn: 'root' })\`。
   - 在全域應用程式範圍內提供**單例 (Singleton)**。
2. **ElementInjector (元素注入器)**：
   - 在 Component 或 Directive 的 \`providers: [MyService]\` 中聲明。
   - 該組件及其所有子組件會獲得一個**全新的獨立 Service 實例**。當組件銷毀時，該 Service 也隨之銷毀。

🔍 **查找解析規則 (Resolution Rules)**：
當組件請求注入某個 Service 時：
1. 先檢查當前的 ElementInjector。
2. 若無，沿著 DOM 祖先樹向上的 ElementInjectors 尋找。
3. 若仍無，轉向 EnvironmentInjector (Module -> Root -> NullInjector)。
4. 若最後都找不到且無 \`@Optional()\` 標記，則拋出 \`NullInjectorError\`。

💻 **自訂 Provider 技巧**
\`\`\`typescript
{ provide: API_URL, useValue: 'https://api.example.com' }
{ provide: LoggerService, useClass: AdvancedLoggerService }
{ provide: DataService, useFactory: (http: HttpClient) => new DataService(http), deps: [HttpClient] }
\`\`\`

💡 **面試加分點**
- 解釋 DI 修飾詞：\`@Self()\`, \`@SkipSelf()\`, \`@Host()\`, \`@Optional()\` 的調度行為。`,
    options: [
      "providedIn: 'root' 的 Service 會在每個組件實例化時建立獨立實例",
      "在 Component 的 providers 陣列中宣告 Service 會使其成為全域單例",
      "Angular DI 查找依賴時會由當前 Element Injector 沿著階層向上尋找直到 Root Injector",
      "NullInjectorError 代表 Service 已經被注入了兩次"
    ],
    correctIndex: 2,
    quizExplanation: "Angular DI 沿著組件與注入器階層由下向上冒泡查找依賴，若找不到則最終到達 NullInjector 並拋錯。"
  },
  {
    id: "angular-06",
    category: "Angular",
    difficulty: "Junior",
    title: "Angular 的 Standalone Components (獨立組件) 是什麼？它如何簡化 Angular 的模組架構？",
    tags: ["Standalone", "NgModule", "Architecture", "Angular 14+"],
    summary: "Standalone Components 允許直接在組件上宣告 imports，擺脫對 NgModule 的強制依賴，簡化專案架構與心智負擔。",
    answer: `📌 **核心觀念**
從 Angular 14 引入、15 穩定、17 成為預設模板的 **Standalone Components**，徹底改變了 Angular 過往必須圍繞 \`NgModule\` 的開發模式。

🔍 **技術細節剖析**
1. **擺脫 NgModule 樣板代碼**：
   - 過往每個 Component 必須聲明在某個 \`NgModule\` 的 \`declarations\` 陣列中。
   - 現在只需在 Component 的裝飾器中設定 **\`standalone: true\`** (Angular 19+ 預設為 true)。
2. **自我包含的依賴聲明 (Self-contained)**：
   - 組件需要的其他組件、指令、管道或模組，直接寫在該組件的 **\`imports: [CommonModule, ButtonComponent]\`** 陣列中。
3. **優勢**：
   - 降低新手學習門檻。
   - 更容易實現元件級別的 Lazy Loading (懶載入)。
   - 簡化單元測試 (Direct Component Testing)。

💻 **範例程式碼**
\`\`\`typescript
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  standalone: true,
  selector: 'app-user-card',
  imports: [CardModule],
  template: \`<p-card header="User Profile">Standalone Component!</p-card>\`
})
export class UserCardComponent {}
\`\`\`

💡 **面試加分點**
- 說明如何透過 \`provideRouter\` 與 \`bootstrapApplication(AppComponent, appConfig)\` 完全廢除 \`AppModule\`。`,
    options: [
      "Standalone Components 依然必須登錄在某個 NgModule 的 declarations 中",
      "Standalone Components 透過在 Component 內部直接聲明 imports 陣列，簡化了對 NgModule 的依賴",
      "Standalone Components 無法使用懶載入 (Lazy Loading) 功能",
      "Standalone Components 只能用在管道 (Pipe) 上，不能用在組件"
    ],
    correctIndex: 1,
    quizExplanation: "Standalone Components 直接在組件裝飾器中管理其所需的 imports 依賴，無須定義 NgModule。"
  },
  {
    id: "angular-07",
    category: "Angular",
    difficulty: "Senior",
    title: "Zone.js 的運作原理為何？為什麼 Angular 18+ 正在走向 Zoneless (無 Zone) 架構？",
    tags: ["Zone.js", "Zoneless", "Angular 18", "Performance"],
    summary: "Zone.js 透過 Monkey-patching 改寫非同步 API 自動發起變更偵測。Zoneless 利用 Signals 進行精準通知，提升效能與調試體驗。",
    answer: `📌 **核心觀念**
**Zone.js** 是 Angular 過去自動觸發 Change Detection 的魔法心臟。它透過 **Monkey-patching (猴子補丁)** 重寫瀏覽器的所有非同步 API (如 \`addEventListener\`, \`setTimeout\`, \`Promise\`, \`fetch\`)。

🔍 **Zone.js 的痛點與 Zoneless 趨勢**
1. **Zone.js 的代碼與效能代價**：
   - **Bundle 大小**：增加了約 30KB 的額外打包體積。
   - **過度偵測 (Over-checking)**：例如 \`mousemove\` 或動畫事件引發頻繁的全樹 Change Detection。
   - **Async/Await 障礙**：Zone.js 很難完美捕捉原生的 async/await 語法微任務。
2. **Zoneless (無 Zone 架構)**：
   - Angular 18 導入了原生的 Zoneless 支援 (\`provideExperimentalZonelessChangeDetection()\`)。
   - 結合 **Signals**：當 Signal 改變時，組件會直接標記自己為 Dirty，不需要 Zone.js 的全域事件攔截，達到極致效能與原生 async/await 支持。

💡 **面試加分點**
- 展示如果在傳統 Zone 專案中防止過度偵測：使用 \`NgZone.runOutsideAngular(() => { ... })\`。`,
    options: [
      "Zone.js 利用 TypeScript 裝飾器進行變更偵測，完全不修改原生 API",
      "Zone.js 透過 Monkey-patching 改寫瀏覽器非同步 API 以自動觸發全樹 Change Detection",
      "Zoneless 架構會導致 Signals 無法更新畫面",
      "NgZone.runOutsideAngular() 會強制 Angular 立即同步渲染畫面"
    ],
    correctIndex: 1,
    quizExplanation: "Zone.js 透過對瀏覽器原生非同步 API 施加猴子補丁來監聽事件並觸發變更偵測。"
  },
  {
    id: "angular-08",
    category: "Angular",
    difficulty: "Mid",
    title: "RxJS 的 Subject, BehaviorSubject 與 ReplaySubject 有何區別與應用場景？",
    tags: ["RxJS", "Subject", "State", "Observables"],
    summary: "Subject 無初始值且只收訂閱後的值；BehaviorSubject 須初始值並可隨時 get 保持最新值；ReplaySubject 能重播指定數量的歷史值。",
    answer: `📌 **核心觀念**
這三者皆屬於 **Subject**（既是 Observable 也是 Observer，支援 Multicast 廣播）。它們的核心區別在於對**歷史數值 (Memory History)** 的保存能力不同。

🔍 **三者細節對比**
1. **Subject**：
   - **無歷史記憶**。訂閱者 (Subscriber) **只能收到訂閱時間點之後**發出的新事件。
   - **場景**：一發即忘的 UI 按鈕點擊事件通知。
2. **BehaviorSubject**：
   - **必須提供初始值**。永遠保存「最後一個最新值」。
   - 新訂閱者會在訂閱時**立即收到最後一個最新值**。
   - 提供 \`getValue()\` 同步獲取當前數值。
   - **場景**：用戶登入狀態 (CurrentUser)、全域主題 Theme 狀態。
3. **ReplaySubject**：
   - 可指定緩衝區大小 (例如 \`new ReplaySubject(3)\`)。
   - 新訂閱者訂閱時，會**重播 (Replay) 過去 N 個發送過的值**。
   - **場景**：保留最近 N 筆日誌紀錄或歷史快取數據。

💻 **範例**
\`\`\`typescript
const behavior$ = new BehaviorSubject<string>('Init');
behavior$.subscribe(v => console.log('Sub 1:', v)); // 印出: Sub 1: Init
behavior$.next('Updated');
behavior$.subscribe(v => console.log('Sub 2:', v)); // 印出: Sub 2: Updated
\`\`\`

💡 **面試加分點**
- 提醒：使用 BehaviorSubject 暴露時應搭配 \`asObservable()\`，防止外部直接被呼叫 \`.next()\` 破壞單向資料流。`,
    options: [
      "Subject 必須在實例化時傳入初始值",
      "BehaviorSubject 會保存最新值，並在有新訂閱時立即重播該最新值給訂閱者",
      "ReplaySubject 無法設定重播的數據筆數上限",
      "BehaviorSubject 內部沒有提供 getValue() 方法"
    ],
    correctIndex: 1,
    quizExplanation: "BehaviorSubject 具有現態保持屬性 (Current Value)，建構時需初始值，有新訂閱者加入時會立即重播最新值。"
  },
  {
    id: "angular-09",
    category: "Angular",
    difficulty: "Junior",
    title: "Angular 中的 Directives (指令) 有哪些類型？Attribute Directive 與 Structural Directive 的區別？",
    tags: ["Directives", "Template", "DOM", "Components"],
    summary: "指令用於擴充 DOM 行為。Attribute Directive 修改元素外觀/行為；Structural Directive 透過操作 ViewContainer 新增或銷毀 DOM 結構。",
    answer: `📌 **核心觀念**
在 Angular 中，**Component 本質上就是帶有 Template 的 Directive**。除了 Component 之外，Angular 還有兩大指令類型。

🔍 **指令兩大類型剖析**
1. **Attribute Directives (屬性型指令)**：
   - **作用**：改變既存 HTML 元素的外觀或行為，不改變 DOM 結構。
   - **語法**：像一般 HTML 屬性一樣使用。
   - **範例**：\`ngClass\`, \`ngStyle\` 或自訂的高亮指令 \`[appHighlight]\`。
2. **Structural Directives (結構型指令)**：
   - **作用**：透過新增、替換或刪除 DOM 節點來改變 **DOM 佈局結構**。
   - **語法**：星號前綴 \`*\`（星號是 \`<ng-template>\` 的語法糖）。
   - **範例**：\`*ngIf\`, \`*ngFor\`, \`*ngSwitchCase\`。

💻 **自訂 Attribute Directive 範例**
\`\`\`typescript
@Directive({
  standalone: true,
  selector: '[appHoverColor]'
})
export class HoverColorDirective {
  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = 'yellow';
  }
}
\`\`\`

💡 **面試加分點**
- 解釋結構型指令星號 \`*\` 背後的原理：Angular 會自動將 \`*ngIf="cond"\` 展開為 \`<ng-template [ngIf]="cond">\`。`,
    options: [
      "Attribute Directive 可以隨意刪除與新增真實 DOM 節點",
      "Structural Directive 使用星號 * 前綴，其本質是操作 ng-template 來變更 DOM 結構",
      "Component 不是 Directive 的一種",
      "ngClass 是典型的 Structural Directive"
    ],
    correctIndex: 1,
    quizExplanation: "結構型指令 (如 *ngIf) 以星號標示，內部透過 ViewContainerRef 與 TemplateRef 來動態塑造與變更 DOM 結構。"
  },
  {
    id: "angular-10",
    category: "Angular",
    difficulty: "Senior",
    title: "Angular 的 Reactive Forms 與 Template-driven Forms 的架構理念與單元測試體驗有何差別？",
    tags: ["Forms", "Reactive Forms", "Validation", "Testing"],
    summary: "Reactive Forms 是顯式、不可變且以 Observable 為核心的模型驅動方案，利於複雜驗證與單元測試；Template-driven Forms 則由模板雙向綁定驅動。",
    answer: `📌 **核心觀念**
Angular 提供兩套表單處理機制，其代表了不同的設計哲學。

🔍 **深層比較**
1. **Reactive Forms (響應式表單 - 推薦中大型專案)**：
   - **驅動來源**：TypeScript 程式碼中顯式建立 \`FormGroup\` / \`FormControl\` 結構。
   - **資料流**：同步、不可變 (Immutable)。表單狀態變更為 Observable 流 (\`valueChanges\`)。
   - **單元測試**：極為優異。**完全不需要渲染 DOM 模板** 即可直接對 \`FormControl\` 測試驗證邏輯。
2. **Template-driven Forms (模板驅動表單)**：
   - **驅動來源**：HTML 模板中的 \`ngModel\` 與原生指令。
   - **資料流**：非同步、雙向綁定 (\`[(ngModel)]\`)。
   - **單元測試**：較困難，必須依賴 \`ComponentFixture\` 渲染 DOM 才能進行測試。

💻 **Reactive Forms 範例**
\`\`\`typescript
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]]
});

// 即時監聽與處理管道
this.form.get('email')?.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged()
).subscribe(val => console.log('Email modified:', val));
\`\`\`

💡 **面試加分點**
- 提及 Angular 14 引入的 **Typed Forms (強類型表單)**，徹底解決了過往 \`form.value\` 是 \`any\` 類型的問題。`,
    options: [
      "Template-driven Forms 比 Reactive Forms 更容易撰寫獨立單元測試",
      "Reactive Forms 由 TypeScript 模型驅動，表單狀態更新為同步且提供 Observable 響應流",
      "Reactive Forms 必須依賴 [(ngModel)] 雙向綁定才能獲取使用者輸入",
      "Angular 14 之後 Reactive Forms 依然不支援 TypeScript 型別檢查"
    ],
    correctIndex: 1,
    quizExplanation: "Reactive Forms 以代碼模型為真理來源，提供強型別、可預測的同步數據流與絕佳的測試獨立性。"
  },
  {
    id: "angular-11",
    category: "Angular",
    difficulty: "Mid",
    title: "Angular HTTP Interceptor (攔截器) 的應用場景為何？Functional Interceptor 在 Angular 15+ 如何配置？",
    tags: ["HTTP Interceptor", "HttpClient", "Auth", "Angular 15+"],
    summary: "HTTP Interceptor 用於全域攔截請求與響應 (如注入 JWT Auth Token、統一錯誤處理)；Angular 15+ 支援輕量化的 Functional Interceptor。",
    answer: `📌 **核心觀念**
**HTTP Interceptor** 採用責任鏈 (Chain of Responsibility) 模式。它可以在 HTTP 請求發送給伺服器之前、或伺服器響應返回給元件之前進行洋蔥式的攔截與修改。

🔍 **常見應用場景**
1. **Auth Token 注入**：自動為所有 API 請求的 Header 加上 \`Authorization: Bearer <token>\`。
2. **全域 Error Handling**：攔截 \`401 Unauthorized\` 自動轉跳登入頁；攔截 \`500\` 彈出 Toast。
3. **Global Loading Spinner**：發送請求時顯示 Spinner，回應結束時關閉。

💻 **Angular 15+ Functional Interceptor 寫法**
\`\`\`typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', \`Bearer \${token}\`) })
    : req;

  return next(authReq);
};

// 在 app.config.ts 配置:
// provideHttpClient(withInterceptors([authInterceptor]))
\`\`\`

💡 **面試加分點**
- 強調 \`req\` (HttpRequest) 物件是**不可變的 (Immutable)**，必須呼叫 \`req.clone()\` 來修改 Header 或 URL。`,
    options: [
      "HttpInterceptor 可以直接修改原本傳入的 req 屬性而不需 clone",
      "Functional Interceptors 必須實作 HttpInterceptor 介面並宣告在 NgModule 中",
      "HTTP Interceptor 可用於全域統一注入 Auth Token 與處理 401/500 錯誤",
      "HTTP Interceptor 只能攔截 GET 請求，無法攔截 POST 請求"
    ],
    correctIndex: 2,
    quizExplanation: "Interceptor 是 HTTP 切面處理利器，常用於全域 Header 注入、通用錯誤捕捉與 Loading 狀態調度。"
  },
  {
    id: "angular-12",
    category: "Angular",
    difficulty: "Junior",
    title: "Angular 路由守衛 (Route Guards) 有哪些？Functional Guards 如何撰寫？",
    tags: ["Router", "Guards", "CanActivate", "Auth"],
    summary: "路由守衛控制路由導航權限。Angular 15+ 推薦使用 Functional Guard (如 CanActivateFn)，利用 inject() 簡化寫法。",
    answer: `📌 **核心觀念**
**Route Guards** 允許在進入、離開或載入某個路由前進行條件判斷（如檢查登入權限、表單未保存提示）。

🔍 **常見 Guard 類型**
1. **CanActivateFn**：檢查使用者是否有權限進入該路由。
2. **CanDeactivateFn**：檢查使用者離開當前路由前（例如表單寫一半想切走）是否給予確認警告。
3. **CanMatchFn**：檢查是否匹配該路由（常用於權限不同載入不同 Module/Component）。

💻 **Functional Guard 範例**
\`\`\`typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/login');
};

// 路由配置:
// { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
\`\`\`

💡 **面試加分點**
- 說明 Guard 回傳 \`UrlTree\` (如 \`router.parseUrl('/login')\`) 比回傳 \`false\` 並手動 \`router.navigate\` 更優越，因為能防止導航中斷競爭問題。`,
    options: [
      "Functional Guards 必須定義為 Class 並且實作 CanActivate 介面",
      "CanActivateFn 回傳 UrlTree 可以優雅地將未授權使用者重導向至登入頁",
      "Route Guards 只能檢查非同步數據，無法回傳同步的 boolean",
      "CanDeactivateFn 是用來阻止用戶登入應用的 Guard"
    ],
    correctIndex: 1,
    quizExplanation: "Functional Guards 利用 inject() 獲取 Service，並可透過回傳 UrlTree 來跳轉路由，極其乾淨高效。"
  },
  {
    id: "angular-13",
    category: "Angular",
    difficulty: "Senior",
    title: "請說明 Angular Content Projection (內容投影) 與 ng-content 的多插槽 (Multi-slot) 實作機制。",
    tags: ["Content Projection", "ng-content", "Components", "Architecture"],
    summary: "ng-content 允許父組件將 DOM 內容投影至子組件。使用 select 屬性可實現多插槽內容分發 (Multi-slot Projection)。",
    answer: `📌 **核心觀念**
**Content Projection** 是 Angular 版本的 Web Components Slot / React Children 模式。它允許組件的使用者在呼叫組件時注入自訂的 HTML 或其他組件。

🔍 **多插槽投影 (Multi-slot Projection)**
透過 \`<ng-content select="selector">\` 可以根據 CSS 選擇器（標籤名、類名、屬性）將內容精準分發到不同的插槽位置。

💻 **範例程式碼**
\`\`\`html
<!-- 子組件: modal.component.html -->
<div class="modal">
  <header>
    <ng-content select="[modal-title]"></ng-content>
  </header>
  <main>
    <ng-content></ng-content> <!-- 預設插槽 -->
  </main>
  <footer>
    <ng-content select=".modal-actions"></ng-content>
  </footer>
</div>

<!-- 父組件呼叫時 -->
<app-modal>
  <h2 modal-title>刪除確認</h2>
  <p>您確定要刪除這筆資料嗎？</p>
  <div class="modal-actions">
    <button>取消</button>
    <button>確定</button>
  </div>
</app-modal>
\`\`\`

💡 **面試加分點**
- 提及 \`@ContentChild\` / \`@ContentChildren\` 可以讓子組件程式碼讀取並操作透過 \`ng-content\` 投影進來的指令或元件實例。`,
    options: [
      "ng-content 會複製 HTML 節點並在內部創建兩份相同的 DOM 實例",
      "使用 ng-content select=\"[attr]\" 可以達成多插槽 (Multi-slot) 精準內容投影",
      "Content Projection 投影進來的內容無法使用 @ContentChild 存取",
      "父組件無法將資料綁定至投影給子組件的模板中"
    ],
    correctIndex: 1,
    quizExplanation: "ng-content 的 select 屬性支援標準 CSS 選擇器，可實現彈性且清晰的多插槽版面配置注入。"
  },
  {
    id: "angular-14",
    category: "Angular",
    difficulty: "Mid",
    title: "Angular 生命週期 Hook 的執行順序為何？ngOnInit 與 Constructor 的職責劃分？",
    tags: ["Lifecycle", "ngOnInit", "Constructor", "Hooks"],
    summary: "Constructor 用於類別實例化與 DI 注入；ngOnInit 在 Angular 完成 @Input 綁定初始化後執行，適合處理業務與非同步請求。",
    answer: `📌 **核心觀念**
瞭解 Angular 生命週期鉤子的**執行順序與分工**是編寫高效且無 Bug 組件的基礎。

🔍 **生命週期順序**
1. **\`ngOnChanges\`**：有 \`@Input()\` 綁定資料發生變更時最先執行（包含初始設定）。
2. **\`ngOnInit\`**：組件輸入屬性初始化完畢後執行一次。
3. **\`ngDoCheck\`**：每次變更偵測時執行（自訂偵測）。
4. **\`ngAfterContentInit\`**：內容投影 (\`ng-content\`) 完成初始化後。
5. **\`ngAfterContentChecked\`**。
6. **\`ngAfterViewInit\`**：組件檢視 (View) 與子組件 View 初始化完畢（此時才能安全存取 \`@ViewChild\`）。
7. **\`ngAfterViewChecked\`**。
8. **\`ngOnDestroy\`**：組件銷毀前（適合清除訂閱與事件監聽）。

🔍 **Constructor vs ngOnInit**
- **Constructor**：ES6 類別本身的建構子，此時 \`@Input\` 數據**尚未注入**。僅用於簡單的依賴注入 (DI)。
- **ngOnInit**：Angular 的生命週期開端，此時 \`@Input\` **已有值**。適合發起 HTTP API 請求或複雜初始化邏輯。

💡 **面試加分點**
- 在 \`ngAfterViewInit\` 中修改會觸發變更偵測的狀態時，可能會遇到 \`ExpressionChangedAfterItHasBeenCheckedError\` 錯誤，需說明其原因與解法 (如異步 \`setTimeout\` 或 \`ChangeDetectorRef\`)。`,
    options: [
      "Constructor 執行時 @Input 屬性已經確保有值並完成初始化",
      "ViewChild 存取的最安全時機是在 ngOnInit 生命週期中",
      "ngOnInit 在 @Input 完成初始化後執行，適合放置 HTTP API 請求",
      "ngOnDestroy 在組件視圖渲染之前最先執行"
    ],
    correctIndex: 2,
    quizExplanation: "Constructor 僅用於 DI 注入；組件的 Input 資料初始化與業務 API 調用應放置於 ngOnInit 中。"
  },
  {
    id: "angular-15",
    category: "Angular",
    difficulty: "Junior",
    title: "Angular 中的 Pure Pipe (純管道) 是什麼？為何它具備優異的效能優勢？",
    tags: ["Pipes", "Pure Pipe", "Performance", "Optimization"],
    summary: "Pure Pipe 預設為純函式，只有當輸入參數的參照發生變更時才會重新計算，具有極佳的結果快取能力。",
    answer: `📌 **核心觀念**
Pipe (管道) 用於模板中的資料格式化轉譯 (例如 \`{{ price | currency }}\`)。Angular 的 Pipe 預設都是 **Pure Pipe (純管道)**。

🔍 **Pure vs Impure Pipe**
1. **Pure Pipe (\`pure: true\` 預設)**：
   - Angular 內部會對輸入參數進行**參照比對 (Reference Checking)**。
   - 只要輸入參數未發生改變，Pipe **絕對不會重新執行**，而是直接回傳快取結果。
   - **極致效能**：比起在模板中呼叫元件方法 \`{{ calculatePrice(item) }}\`（每次變更偵測都會重複呼叫），Pure Pipe 效能好上數倍。
2. **Impure Pipe (\`pure: false\` Special)**：
   - 每次變更偵測都會無條件執行。
   - **範例**：\`async\` pipe（內部需維護訂閱狀態）。

💻 **自訂 Pure Pipe 範例**
\`\`\`typescript
@Pipe({
  name: 'taxCalculate',
  pure: true, // 預設即為 true
  standalone: true
})
export class TaxCalculatePipe implements PipeTransform {
  transform(value: number, taxRate: number = 0.05): number {
    return value * (1 + taxRate);
  }
}
\`\`\`

💡 **面試加分點**
- 說明為什麼「嚴禁在 HTML 模板中綁定元件方法 \`{{ getStatusText() }}\`」，以及如何用 Pure Pipe 重構它。`,
    options: [
      "Pure Pipe 每次組件發生變更偵測時都會無條件重新執行",
      "Pure Pipe 只有在輸入參數參照發生改變時才重新計算，具備 memoization 快取效益",
      "Impure Pipe 效能比 Pure Pipe 更好，推薦大量使用",
      "Angular 預設自訂 Pipe 的 pure 屬性為 false"
    ],
    correctIndex: 1,
    quizExplanation: "Pure Pipe 遵循純函式與參照相等性原則，只有當傳入參數變動時才重算，能大幅降低模板渲染負擔。"
  },
  {
    id: "angular-16",
    category: "Angular",
    difficulty: "Senior",
    title: "Angular 的 Lazy Loading (懶載入) 與 Preloading Strategies (預載策略) 如何規劃？",
    tags: ["Lazy Loading", "Preloading", "Performance", "Router"],
    summary: "Lazy Loading 透過 loadComponent / loadChildren 按需載入模組；Preloading 策略則在背景偷偷下載其他路由模組提升體驗。",
    answer: `📌 **核心觀念**
為了降低 initial JavaScript bundle 大小與首屏渲染時間 (FCP)，大型 Angular 專案必須導入 **Lazy Loading** 與 **Preloading** 策略。

🔍 **實作細節剖析**
1. **Lazy Loading 路由聲明**：
   - 使用動態 \`import()\` 語法按需下載。
   - \`loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)\`
2. **Preloading Strategies (預載策略)**：
   - 懶載入雖然減小首屏，但使用者切換路由時會有微小網路延遲。
   - **解決方案**：首屏渲染完成後，利用瀏覽器空閒時間**在背景自動預先下載**其他路由檔案。
   - **內建策略**：
     - \`NoPreloading\` (預設)：不預載。
     - \`PreloadAllModules\`：預載所有懶載入路由。
   - **Custom Preloading Strategy**：可根據路由的 \`data: { preload: true }\` 標記或使用者網路狀態 (Network Speed) 動態決定是否預載。

💻 **配置範例**
\`\`\`typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules) // 啟用全預載
    )
  ]
};
\`\`\`

💡 **面試加分點**
- 探討基於 Quicklink 理念的自訂 Preloading Strategy：只預載當前畫面 viewport 視窗內出現的超連結路由。`,
    options: [
      "Lazy Loading 會在應用程式初次啟動時一次下載完全部的路由代碼",
      "PreloadAllModules 策略會在首屏加載完畢後的背景時間自動預載懶載入模組",
      "Angular 無法編寫自定義的 Preloading Strategy",
      "loadComponent 必須配合 NgModule 使用，不支援 Standalone Component"
    ],
    correctIndex: 1,
    quizExplanation: "PreloadAllModules 能在使用者瀏覽首屏之餘，利用背景頻寬預載其他懶載入檔案，達成無縫切頁體驗。"
  },
  {
    id: "angular-17",
    category: "Angular",
    difficulty: "Mid",
    title: "Angular 17+ 的 Non-destructive Hydration (無破壞性水合) 在 SSR 中如何運作？",
    tags: ["SSR", "Hydration", "Angular 17", "Performance"],
    summary: "舊版 SSR 會毀掉 DOM 並重新全建；Angular 17 無破壞性水合能保留 Server 渲染的 DOM 結構並附加上事件監聽，防止畫面閃爍。",
    answer: `📌 **核心觀念**
過往 Angular Universal (SSR) 存在一個嚴重缺點：當 Client 端 JavaScript 下載完成時，Angular 會**把伺服器渲染好的 DOM 全部抹除 (Destroy) 並重新在 Client 創建一份**，導致嚴重的畫面閃爍 (Flicker)。

🔍 **Angular 17+ 革命性 Hydration 特性**
1. **DOM 保留與復用 (DOM Re-use)**：
   - 伺服器渲染時會在 HTML 中注入節點標記。
   - Client 端 Angular 啟動時會直接**清點並綁定**既存的 DOM 節點，僅附加事件處理器與綁定反應式狀態。
2. **極致效能與 SEO**：
   - 完全消除畫面閃爍。
   - 顯著提升 LCP (Largest Contentful Paint) 與 CLS (Cumulative Layout Shift) 指標。

💻 **啟用方式**
\`\`\`typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration() // 輕鬆啟用無破壞性水合
  ]
};
\`\`\`

💡 **面試加分點**
- 提及如果在 Client/Server 端 DOM 結構因直接操作了原生 DOM 而不一致，可使用 \`ngSkipHydration\` 屬性跳過該特定組件的水合檢查。`,
    options: [
      "舊版 Angular SSR 水合會保留 DOM 節點而不進行摧毀",
      "Angular 17 的 provideClientHydration() 實現無破壞性水合，直接復用 Server DOM 解決畫面閃爍",
      "Hydration 只在 Client-side SPA 模式下有用，與 SSR 無關",
      "使用無破壞性水合後無法在組件內發送 HTTP 請求"
    ],
    correctIndex: 1,
    quizExplanation: "Angular 17+ provideClientHydration 提供 DOM 復用機制，保留 Server 產生的 DOM 節點並直接附加上事件監聽。"
  }
];
