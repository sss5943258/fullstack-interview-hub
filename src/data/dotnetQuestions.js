export const dotnetQuestions = [
  {
    id: "dotnet-01",
    category: ".NET Core",
    difficulty: "Mid",
    title: ".NET Core 依賴注入 (DI) 的三種生命週期 (Transient, Scoped, Singleton) 有何區別？什麼是 Captive Dependency (捕獲依賴陷阱)？",
    tags: ["Dependency Injection", "Lifetimes", "Captive Dependency", ".NET Core"],
    summary: "Transient 每次索取創建新實例；Scoped 在同一個 HTTP Request 內共用實例；Singleton 全域唯一實例。捕獲依賴指長生命週期注入了短生命週期服務。",
    answer: `📌 **核心觀念**
ASP.NET Core 內建輕量級依賴注入 (DI) 容器，註冊服務時必須嚴格指定其生命週期 (Service Lifetime)。

🔍 **三種 Service Lifetime 細節**
1. **Transient (瞬時 - \`AddTransient\`)**：
   - 每次向 DI 容器索取服務時，**都會建立一個全新的實例**。
   - **適用**：輕量級、無狀態 (Stateless) 的服務。
2. **Scoped (區域 - \`AddScoped\`)**：
   - 在**同一個 HTTP Request 範圍 (Scope) 內共用同一個實例**。不同的 Request 之間互相隔離。
   - **適用**：\`DbContext\` (EF Core 預設)、使用者 Request 狀態上下文。
3. **Singleton (單例 - \`AddSingleton\`)**：
   - 應用程式啟動後**第一次被索取時建立**，之後整個應用程式生命週期內共用同一個實例。
   - **適用**：全域快取、記憶體 Queue、設定檔服務。

⚠️ **Captive Dependency (捕獲依賴陷阱)**
- **現象**：當一個較長生命週期的服務 (例如 **Singleton**) 的建構子中，注入了一個較短生命週期的服務 (例如 **Scoped**)。
- **危害**：Singleton 服務只會實例化一次，這會導致注入進去的 Scoped 服務**強制被 Singleton 持有而無法隨 HTTP Request 結束而釋放**！這破壞了 Scoped 的隔離性，且容易引發併發 Thread-safe 衝突與 \`DbContext\` 記憶體洩漏。

💻 **防範機制**
ASP.NET Core 在開發模式 (\`Development\`) 下預設開啟 **Scope Validation**，若偵測到 Captive Dependency 會直接拋出 \`InvalidOperationException\`。

💡 **面試加分點**
- 說明如何在 Singleton 中安全地存取 Scoped 服務：注入 \`IServiceScopeFactory\`，在方法內部手動 \`using (var scope = _scopeFactory.CreateScope())\`。`,
    options: [
      "Scoped 生命週期的服務在整個應用程式運行期間只有唯一一個實例",
      "Captive Dependency 是指將 Transient 服務注入到 Scoped 服務中",
      "將 Scoped 服務 (如 DbContext) 注入 Singleton 服務中會破壞 Scope 隔離並引發 Thread-safety 問題",
      "AddTransient 註冊的服務會在 Request 結束時自動併入 Singleton"
    ],
    correctIndex: 2,
    quizExplanation: "Singleton 持有 Scoped 服務會造成 Captive Dependency，導致 Scoped 服務無法被正確銷毀並破壞 Request 間的數據隔離。"
  },
  {
    id: "dotnet-02",
    category: ".NET Core",
    difficulty: "Senior",
    title: "C# async/await 的運作機制與 Task / ValueTask 有何不同？什麼是 Thread Starvation (執行緒飢餓)？",
    tags: ["async/await", "Task", "ValueTask", "Thread Starvation", "Performance"],
    summary: "async/await 由編譯器轉換為狀態機；ValueTask 避免同步完成時的 Heap 分配；Thread Starvation 係因在非同步環境中使用 .Result 或 .Wait() 死鎖執行緒。",
    answer: `📌 **核心觀念**
C# 的非同步程式設計建立在 **TAP (Task-based Asynchronous Pattern)** 之上。\`async/await\` 關鍵字是編譯器語法糖，會將方法編譯為一個實作了 \`IAsyncStateMachine\` 的結構體狀態機。

🔍 **Task vs ValueTask**
1. **Task**：
   - 引用型別 (Class)，分配在 Heap 上。
   - 若非同步方法**頻繁同步回傳** (例如大量走記憶體快取 Hit)，頻繁分配 Task 物件會造成垃圾回收 (GC) 壓力。
2. **ValueTask**：
   - 結構體值型別 (Struct)，分配在 Stack 上。
   - **優點**：在同步完成的情境下達到 **0-Allocation**。
   - **限制**：ValueTask 不可被 await 兩次，不可使用 \`Task.WhenAll\`。

⚠️ **Thread Starvation (執行緒飢餓 / Sync over Async)**
- **問題程式碼**：\`var data = _service.GetDataAsync().Result;\` 或 \`.Wait()\`。
- **原因**：在 ThreadPool 執行緒中封堵 (Block) 等待非同步任務。當高併發 request 來臨時，ThreadPool 中的有限執行緒全部被 \`.Result\` 阻塞等待，導致 ThreadPool 無法分派新執行緒來處理回傳的 Continuation，最終導致應用程式徹底卡死 (Deadlock/Starvation)。

💻 **最佳實踐**
- 一步非同步，步步非同步 (Async all the way)。
- 在 class library / 非 UI 程式碼中使用 **\`ConfigureAwait(false)\`** 避免回切 SynchronizationContext 的額外開銷。

💡 **面試加分點**
- 解釋在 ASP.NET Core (.NET Core 3.1+) 中 SynchronizationContext 已經被移除，因此控制台與 Web API 不再有 SynchronizationContext 的死鎖問題，但 Thread Starvation 依舊存在。`,
    options: [
      "ValueTask 是 Class 引用型別，Task 是 Struct 值型別",
      "呼叫非同步方法時使用 .Result 或 .Wait() 是推薦的非同步做法",
      "ValueTask 適合用在經常同步完成 (如走快取) 的高效能熱點方法中以減少 GC 分配",
      "ConfigureAwait(false) 會強制將非同步任務轉為同步阻塞執行"
    ],
    correctIndex: 2,
    quizExplanation: "ValueTask 是 Struct，能在方法經常同步回傳 (如快取命中) 時避免在 Heap 分配 Task 物件，極大減輕 GC 負擔。"
  },
  {
    id: "dotnet-03",
    category: ".NET Core",
    difficulty: "Mid",
    title: "ASP.NET Core Middleware (中介軟體) 的 Pipeline 運作原理為何？Use, Run 與 Map 有何差別？",
    tags: ["Middleware", "Pipeline", "ASP.NET Core", "HTTP Context"],
    summary: "Middleware 採用洋蔥圈 (Onion Architecture) 雙向鏈結模式傳遞 HttpContext；Use 可傳遞下個元件，Run 終結管道，Map 進行路由分支。",
    answer: `📌 **核心觀念**
ASP.NET Core 的 HTTP 請求處理管道 (Request Pipeline) 由一系列 **Middleware** 串聯而成。請求從外層傳入內層，回應再從內層傳回外層，稱為 **洋蔥模型 (Onion Model)**。

🔍 **三大註冊方法細節**
1. **\`app.Use\`**：
   - 鏈式傳遞。可以執行自己的邏輯，並呼叫 \`await next()\` 將 \`HttpContext\` 傳給下一個 Middleware；當下層返回後，還能執行後置 (Post-processing) 邏輯。
2. **\`app.Run\`**：
   - **短路 (Short-circuit) / 終結器 (Terminal Middleware)**。不會呼叫 \`next()\`，代表 Request 處理在此結束並開始返回。
3. **\`app.Map\` / \`app.MapWhen\`**：
   - 根據 Request Path 或特定條件分支 (Branch) 建立獨立的 Middleware 子管道。

💻 **洋蔥模型範例**
\`\`\`csharp
app.Use(async (context, next) => {
  // 1. 請求傳入前置處理
  Console.WriteLine("Before next Middleware");
  
  await next(); // 呼叫下一個中介軟體
  
  // 3. 回應返回後置處理
  Console.WriteLine("After next Middleware");
});

app.Run(async context => {
  // 2. 終結端點
  await context.Response.WriteAsync("Terminal Middleware Response");
});
\`\`\`

💡 **面試加分點**
- 強調 **Middleware 的註冊順序非常重要**！例如 \`UseAuthentication\` 必須放在 \`UseAuthorization\` 之前；\`UseCors\` 必須放在 \`UseRouting\` 與 \`UseEndpoints\` 之間。`,
    options: [
      "app.Run 可以呼叫 next() 繼續將 HttpContext 傳給下一個 Middleware",
      "Middleware 管道的註冊順序不會影響 Request 的處理邏輯與安全性",
      "app.Use 可以執行前置邏輯、呼叫 next() 傳遞請求，並在回應返回時執行後置邏輯",
      "app.Map 不能根據 URL 路徑切換 Middleware 分支"
    ],
    correctIndex: 2,
    quizExplanation: "app.Use 是典型的洋蔥鏈式 Middleware 註冊，支援 next() 呼叫前後的雙向處理。"
  },
  {
    id: "dotnet-04",
    category: ".NET Core",
    difficulty: "Senior",
    title: "Entity Framework Core 中的 N+1 問題是什麼？Lazy Loading, Eager Loading 與 Explicit Loading 的使用抉擇與 AsNoTracking 效能優化？",
    tags: ["EF Core", "N+1 Problem", "AsNoTracking", "Performance", "OR Mapping"],
    summary: "N+1 係因迴圈觸發 Lazy Loading 重複查詢資料庫；AsNoTracking 跳過 Change Tracker 追蹤，大幅提升唯讀查詢效能。",
    answer: `📌 **核心觀念**
EF Core 是 .NET 最為普及的 ORM 框架。理解其查詢加載策略與內部 **Change Tracker (變更追蹤器)** 是寫出高效能 SQL 的關鍵。

🔍 **N+1 問題與加載策略**
1. **N+1 問題**：
   - 查詢 1 次主表（取得 N 筆資料），並在迴圈中逐筆存取導覽屬性 (Navigation Property)，觸發額外 N 次 SQL 查詢。共執行 **1 + N 次 SQL**，導致資料庫連線池耗盡與延遲飆升。
2. **加載策略 (Loading Strategies)**：
   - **Eager Loading (預先加載 - 推薦)**：使用 \`.Include(x => x.Orders).ThenInclude(...)\` 在單一 SQL 中透過 \`JOIN\` 一次性帶回所有關聯資料。
   - **Lazy Loading (延遲加載)**：存取導覽屬性時才動態發送 SQL。易誘發 N+1 陷阱。
   - **Explicit Loading (顯式加載)**：使用 \`entry.Collection(...).Load()\` 手動按需加載。

🔍 **AsNoTracking 的效能效應**
- 預設情況下，EF Core 查詢出來的 Entity 會被 **Change Tracker** 記錄，以利後續呼叫 \`SaveChanges()\` 時對比 Diff。
- 對於**唯讀 (Read-only)** 的查詢（如 API 列表展示），加上 **\`AsNoTracking()\`**：
  - **節省記憶體**：無需建立 Entity 鏡像副本。
  - **加速執行**：跳過 Change Tracker 的 Hash / Identity Resolution 運算。

💻 **最佳查詢範例**
\`\`\`csharp
var users = await _dbContext.Users
    .AsNoTracking() // 唯讀查詢優化
    .Include(u => u.Orders) // Eager Loading 防止 N+1
    .Where(u => u.IsActive)
    .ToListAsync();
\`\`\`

💡 **面試加分點**
- 提及 EF Core 5.0+ 的 \`AsSplitQuery()\` 解決當 \`Include\` 過多集合時，多重 JOIN 導致結果集資料膨脹 (Cartesian Explosion) 的效能難題。`,
    options: [
      "AsNoTracking 會強制 Entity 必須被 SaveChanges() 追蹤並寫入 DB",
      "N+1 問題是指 EF Core 無法處理超過 10 筆以上的查詢條件",
      "Eager Loading 透過 .Include() 使用 SQL JOIN 在單一查詢中帶回關聯資料，能有效防止 N+1 問題",
      "Lazy Loading 在高併發環境下比 Eager Loading 效能更高且最為安全"
    ],
    correctIndex: 2,
    quizExplanation: "Eager Loading 使用 .Include() 來進行預先載入，能以一次 JOIN 查詢解決迴圈中重複觸發 SQL 的 N+1 效能地雷。"
  },
  {
    id: "dotnet-05",
    category: ".NET Core",
    difficulty: "Senior",
    title: ".NET 垃圾回收 (Garbage Collector) 的分代演算法 (Generations 0, 1, 2 & LOH) 運作原理？如何正確實作 IDisposable 與 Finalizer？",
    tags: ["Garbage Collection", "Generations", "LOH", "IDisposable", "Memory"],
    summary: ".NET GC 分為 Gen 0, 1, 2 與 LOH；Dispose 模式透過 GC.SuppressFinalize() 避免不必要的二次 GC 析構負擔。",
    answer: `📌 **核心觀念**
.NET 的 **Garbage Collector (GC)** 是自動記憶體管理的核心。它採用**代際垃圾回收 (Generational GC)** 演算法，假設「新建立的物件生命週期短，越老舊的物件生命週期越長」。

🔍 **GC 分代架構 (Generations)**
1. **Generation 0 (第 0 代)**：
   - 存放新分配的短命物件（如局部變數）。GC 觸發頻率極高，回收速度極快 (< 1ms)。
2. **Generation 1 (第 1 代)**：
   - 作為 Gen 0 與 Gen 2 之間的緩衝區。在 Gen 0 回收中存活下來的物件會升代 (Promote) 至 Gen 1。
3. **Generation 2 (第 2 代 - Full GC)**：
   - 存放長生命週期物件（如 Singleton 服務、靜態變數）。GC 回收成本極高，會引發明顯 Stop-The-World (STW)。
4. **Large Object Heap (LOH - 大物件堆)**：
   - 存放大小 **>= 85,000 bytes** 的大物件（如大型陣列）。LOH 直接分配在 Gen 2，預設不進行記憶體壓縮 (Compaction)，易造成碎片化。

🔍 **標準 Dispose 模式與 Finalizer**
當託管類別持有了**非託管資源 (Unmanaged Resources)** (如 OS File Handle、C++ 指針、Socket) 時，必須實作標準 \`IDisposable\` 模式。

💻 **標準 Dispose 範例**
\`\`\`csharp
public class ResourceHolder : IDisposable
{
    private bool _disposed = false;

    // 實作 IDisposable 介面
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this); // 告訴 GC 不需要呼叫 Finalizer，節省二次回收時間！
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing) { /* 釋放託管資源 */ }
            /* 釋放非託管資源 */
            _disposed = true;
        }
    }

    // 解構子/ Finalizer (防止開發者忘記呼叫 Dispose)
    ~ResourceHolder()
    {
        Dispose(false);
    }
}
\`\`\`

💡 **面試加分點**
- 說明 \`GC.SuppressFinalize(this)\` 的重要性：若未呼叫，含有 Finalizer 的物件會被放到 Finalization Queue，導致它被迫延遲到 Gen 2 才被回收。`,
    options: [
      "Gen 0 GC 回收的代價最高，會導致長達幾秒鐘的 Stop-The-World",
      "超過 85,000 bytes 的物件會分配在 Large Object Heap (LOH) 上",
      "GC.SuppressFinalize(this) 會強制 GC 立即對該物件進行記憶體回收",
      "託管記憶體與非託管記憶體都可以被 GC 完全自動回收，無須 IDisposable"
    ],
    correctIndex: 1,
    quizExplanation: ".NET 將 85,000 bytes 以上的物件歸類於 LOH (Large Object Heap)，直接歸在 Gen 2 處理。"
  },
  {
    id: "dotnet-06",
    category: ".NET Core",
    difficulty: "Junior",
    title: "C# 9+ 的 Record 型別與普通 Class 有何不同？什麼是不可變性 (Immutability) 與 with 運算子？",
    tags: ["C# 9", "Record", "Immutability", "Value Semantics"],
    summary: "Record 預設提供基於值的相等性比對 (Value Equality) 與不可變性 (init-only)，並支援以 with 運算子進行非破壞性複製。",
    answer: `📌 **核心觀念**
C# 9 引入的 **\`record\`** (包含 \`record class\` 與 \`record struct\`) 旨在簡化**以數據為中心 (Data-centric)** 的物件定義。

🔍 **Record vs Class 核心差異**
1. **值的相等性 (Value Equality)**：
   - **Class**：預設進行**參照比對 (Reference Equality)**。兩個獨立 instance 屬性完全相同，\`Equals\` 仍回傳 \`false\`。
   - **Record**：編譯器自動重寫 \`Equals\` 與 \`GetHashCode\`，進行**值比對 (Value Equality)**。只要所有屬性值相同，\`Equals\` 即回傳 \`true\`。
2. **不可變性 (Immutability & Positional Syntax)**：
   - 使用位置語法 \`public record UserDto(int Id, string Name);\`。
   - 自動生成 \`init-only\` 屬性，建構後無法任意修改值。
3. **\`with\` 運算子 (Non-destructive Mutation)**：
   - 複製原物件並對特定屬性進行修改，生成新物件。

💻 **範例程式碼**
\`\`\`csharp
public record User(int Id, string Name, string Role);

var user1 = new User(1, "Alex", "Admin");
var user2 = new User(1, "Alex", "Admin");

Console.WriteLine(user1 == user2); // True! (值相等)

// 使用 with 運算子產生修改後的新 record
var updatedUser = user1 with { Role = "User" };
\`\`\`

💡 **面試加分點**
- 說明 \`record\` 在 DTO (Data Transfer Object)、Domain Event 以及 CQRS 的 Command/Query 中的完美適用性。`,
    options: [
      "Record 是值型別 (Struct)，而 Class 是引用型別 (Class)",
      "Record 預設具備參照相等性，屬性內容相同但位址不同會被判斷為不相等",
      "Record 自動提供基於值的相等性比對 (Value-based Equality) 與 with 非破壞性複製語法",
      "with 運算子會直接修改原本 record 物件內部的記憶體屬性"
    ],
    correctIndex: 2,
    quizExplanation: "Record 的亮點為自動編譯值相等性 (Value Equality)、Immutability 支援與以 with 進行非破壞性複製。"
  },
  {
    id: "dotnet-07",
    category: ".NET Core",
    difficulty: "Mid",
    title: "ASP.NET Core Options Pattern (IOptions, IOptionsSnapshot, IOptionsMonitor) 的使用情境與熱載入 (Hot Reload) 差別？",
    tags: ["Options Pattern", "Configuration", "IOptions", "Hot Reload"],
    summary: "IOptions 屬 Singleton 不支援強重新加載；IOptionsSnapshot 屬 Scoped 能在每次 Request 獲取最新 appsettings；IOptionsMonitor 屬 Singleton 支援即時變更通知。",
    answer: `📌 **核心觀念**
**Options Pattern** 是 ASP.NET Core 推薦的強型別設定檔存取模式。它能將 JSON (\`appsettings.json\`) 結構映射為強型別 C# 類別。

🔍 **三種 Options 介面比較**
1. **\`IOptions<T>\`**：
   - **生命週期**：Singleton。
   - **特性**：應用程式啟動時讀取一次，**不支援** \`appsettings.json\` 變更後的熱載入 (Hot Reload)。效能最高。
2. **\`IOptionsSnapshot<T>\`**：
   - **生命週期**：Scoped。
   - **特性**：在**每個 HTTP Request** 啟動時重新計算與讀取。支援熱載入（在 Request 邊界獲取最新設定值）。**不可在 Singleton 服務中注入**。
3. **\`IOptionsMonitor<T>\`**：
   - **生命週期**：Singleton。
   - **特性**：用於全域隨時讀取最新設定（透過 \`.CurrentValue\`）。支援熱載入，且提供 \`OnChange\` 事件發送設定變更通知。**可以在 Singleton 中安全使用**。

💻 **註冊與使用範例**
\`\`\`csharp
// Program.cs
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

// Service 中注入
public class AuthService
{
    private readonly JwtOptions _options;
    public AuthService(IOptionsMonitor<JwtOptions> optionsMonitor)
    {
        _options = optionsMonitor.CurrentValue; // 即時獲取最新值
    }
}
\`\`\`

💡 **面試加分點**
- 提及 Option Validation (\`ValidateDataAnnotations()\` 或 \`ValidateOnStart()\`)，在應用程式一啟動時就驗證設定檔合法性，達到 Fail-Fast。`,
    options: [
      "IOptions<T> 支援 appsettings.json 檔案修改後的即時熱載入 (Hot Reload)",
      "IOptionsSnapshot<T> 生命週期為 Scoped，可以在每個 HTTP Request 取得最新配置",
      "IOptionsMonitor<T> 無法在 Singleton 服務中注入使用",
      "Options Pattern 只能讀取環境變數，無法綁定 JSON 設定"
    ],
    correctIndex: 1,
    quizExplanation: "IOptionsSnapshot<T> 為 Scoped 生命週期，在每次 Request 處理時讀取當前最新的 Config 數值。"
  },
  {
    id: "dotnet-08",
    category: ".NET Core",
    difficulty: "Senior",
    title: "ASP.NET Core Kestrel 伺服器的架構優勢是什麼？Reverse Proxy (Nginx / YARP) 在部署中的角色？",
    tags: ["Kestrel", "Reverse Proxy", "YARP", "Architecture", "Security"],
    summary: "Kestrel 是跨平台且極致效能的非同步 I/O Web 伺服器；搭配 Reverse Proxy (如 Nginx 或 YARP) 負責 SSL 終結、負載平衡與資安防護。",
    answer: `📌 **核心觀念**
**Kestrel** 是 ASP.NET Core 預設的跨平台 HTTP Web 伺服器，建立在 **Socket / libuv** 與非同步 I/O Pipeline 之上，具備驚人的吞吐量與極低延遲。

🔍 **Kestrel + Reverse Proxy 邊界防禦架構**
雖然 Kestrel 可以直接接收網路流量，但在生產環境 (Production) 通常建議放在 **Reverse Proxy (反向代理)** 之後。

🔍 **Reverse Proxy (Nginx, IIS, YARP) 的四大保護責任**：
1. **邊界資安防護 (Edge Security)**：限制公網曝露面，擋下惡意 Slowloris 攻擊、DDoS 與不合法 Request Header。
2. **TLS / SSL Termination (憑證解密終結)**：在反向代理層統一處理 HTTPS 加解密，減輕內部 Kestrel 的 CPU 負擔。
3. **靜態檔案與快取分流**：直接回應 HTML/JS/CSS，不佔用 Kestrel 與 .NET 執行緒。
4. **負載平衡 (Load Balancing)**：分發流量至後端多個 Kestrel 容器實例。

💻 **YARP (Yet Another Reverse Proxy)**
- .NET 官方開源、完全基於 C# / Kestrel 打造的高效能反向代理套件，可在 C# 代碼中自由自訂路由、認證與轉發邏輯。

💡 **面試加分點**
- 提醒：使用 Reverse Proxy 後，Kestrel 取得的 IP 會變成代理伺服器的本地 IP，必須設定 \`UseForwardedHeaders\` 中介軟體以恢復真正的 Client IP (\`X-Forwarded-For\`)。`,
    options: [
      "Kestrel 只能在 Windows IIS 環境下執行，無法在 Linux 運行",
      "Reverse Proxy (如 Nginx 或 YARP) 常用於處理 SSL 終結、資安邊界防禦與負載平衡",
      "Kestrel 內部採用完全同步阻塞式 I/O 模型以簡化線程調度",
      "使用 Reverse Proxy 後不需要配置 UseForwardedHeaders 就能直接取得真實 Client IP"
    ],
    correctIndex: 1,
    quizExplanation: "生產環境部署時，使用 Nginx 或 YARP 作為反向代理能集中處理 SSL 終結、靜態快取與安全防禦。"
  },
  {
    id: "dotnet-09",
    category: ".NET Core",
    difficulty: "Junior",
    title: "ASP.NET Core 中的 Filter Pipeline (過濾器管道) 有哪些類型？執行順序為何？",
    tags: ["Filters", "ActionFilter", "ExceptionFilter", "Pipeline"],
    summary: "Filter Pipeline 分為 Authorization, Resource, Action, Exception, Result 5 大類，在 Action 執行前後提供強大的 AOP 切面處理。",
    answer: `📌 **核心觀念**
**Filters** 允許在 ASP.NET Core MVC / Web API 請求處理管道的**特定階段 (AOP - Aspect Oriented Programming)** 插入自訂程式碼。

🔍 **五大 Filters 類型與順序**
1. **Authorization Filters (授權過濾器)**：
   - **最先執行**。檢查使用者是否有權限執行該 Request (如 \`[Authorize]\`)。
2. **Resource Filters (資源過濾器)**：
   - 授權之後執行。常用於**內容快取 (Output Caching)** 或 Short-circuit (短路)。
3. **Action Filters (操作過濾器 - 最常用)**：
   - 包裹在 Controller Action 執行前後 (OnActionExecuting / OnActionExecuted)。
   - **適用**：Model 驗證 (\`ModelState.IsValid\`)、日誌紀錄、參數轉換。
4. **Exception Filters (異常過濾器)**：
   - 捕捉 Action 執行過程中拋出未處理的異常 (Uncaught Exception)。
5. **Result Filters (結果過濾器)**：
   - 包裹在 ActionResult 渲染/輸出前後。

💻 **ActionFilter 範例**
\`\`\`csharp
public class LogActionFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Action 執行前
        Console.WriteLine($"Starting Action: {context.ActionDescriptor.DisplayName}");
        
        var resultContext = await next(); // 執行真正的 Action
        
        // Action 執行後
        Console.WriteLine($"Finished Action: {context.ActionDescriptor.DisplayName}");
    }
}
\`\`\`

💡 **面試加分點**
- 對比 Filter 與 Middleware 的區別：Middleware 能捕捉所有 HTTP Request（包含靜態檔案），而 Filter 知道 ASP.NET Core 的 MVC / Routing 上下文細節。`,
    options: [
      "Exception Filters 是第一個被執行的過濾器",
      "Authorization Filters 最先執行，用來驗證用戶請求是否合法授權",
      "Filter 與 Middleware 完全相同，二者無任何上下文細節差異",
      "Action Filters 只能在 Action 執行完畢之後執行，無法在之前執行"
    ],
    correctIndex: 1,
    quizExplanation: "Authorization Filter 位於 Filter 管道的最前端，負責第一時間阻擋未授權的 HTTP 請求。"
  },
  {
    id: "dotnet-10",
    category: ".NET Core",
    difficulty: "Mid",
    title: "ASP.NET Core Minimal APIs 與傳統 Controller-based APIs 的優缺點對比與適用場景？",
    tags: ["Minimal API", "Controller", "ASP.NET Core", "Architecture"],
    summary: "Minimal API 移除 Controller 樣板代碼、啟動極快、適用於微服務與輕量 API；Controller 結構嚴謹適用於大型複雜系統。",
    answer: `📌 **核心觀念**
從 .NET 6 引入的 **Minimal APIs** 旨在消除傳統 MVC Controller 的繁複樣板結構，讓開發者只需幾行程式碼即可宣告一個高效能 HTTP API 端點。

🔍 **兩者深層對比**
1. **Minimal APIs (極簡 API)**：
   - **優點**：
     - **效能提升**：減少 MVC 路由探索與反射機制，啟動時間更快、記憶體佔用更小。
     - **簡潔直覺**：無須創建 Class 與 Controller，直接在 \`Program.cs\` 進行方法映射 (\`app.MapGet\`, \`app.MapPost\`)。
   - **適用**：微服務 (Microservices)、Serverless Functions、輕量級 CRUD 服務。
2. **Controller-based APIs (傳統控制器)**：
   - **優點**：
     - **結構組織化**：透過 Attribute (\`[Route]\`, \`[HttpGet]\`)、Action Filters 機制進行大型專案的清晰分層。
   - **適用**：企業級大型單體應用 (Monolith)、功能極度龐大複雜的系統。

💻 **Minimal API 範例**
\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/users/{id:int}", async (int id, IUserService userService) =>
{
    var user = await userService.GetUserByIdAsync(id);
    return user is not null ? Results.Ok(user) : Results.NotFound();
});

app.Run();
\`\`\`

💡 **面試加分點**
- 提及 .NET 7/8 為 Minimal API 帶來的 **Endpoint Filters** 與 **TypedResults**，使其在中大型專案中也具備絕佳的維護性。`,
    options: [
      "Minimal API 必須依賴 Controller Class 才能定義路由",
      "Minimal API 能顯著降低啟動時間與記憶體開銷，非常適合微服務開發",
      "Controller-based API 的效能永遠超越 Minimal API",
      "Minimal API 不支援依賴注入 (DI)"
    ],
    correctIndex: 1,
    quizExplanation: "Minimal API 移除反射與控制器繁雜樣板，具備極輕量、快速啟動與高吞吐特性，是微服務與輕量 API 首選。"
  },
  {
    id: "dotnet-11",
    category: ".NET Core",
    difficulty: "Senior",
    title: "C# 中的 ThreadPool (執行緒池) 的 Work-Stealing (工作竊取) 演算法與 Task 排程機制為何？",
    tags: ["ThreadPool", "Work-Stealing", "Concurrency", "Threading"],
    summary: "ThreadPool 包含全域佇列與各 Thread 的區域佇列。當 worker 空閒時會使用 Work-Stealing 演算法從其他佇列尾端偷取任務執行。",
    answer: `📌 **核心觀念**
.NET 的 **ThreadPool** 管理著一組可重用的背景執行緒，避免頻繁建立與銷毀 OS Thread 的昂貴開銷。其高效調度的核心是 **Work-Stealing (工作竊取) 演算法**。

🔍 **佇列雙層架構與 Work-Stealing**
1. **Global Queue (全域佇列)**：
   - 由非 ThreadPool 執行緒（如外部主執行緒）發起的 Task 會進至全域 FIFO 佇列。所有 Worker 執行緒需競爭 Lock 來獲取任務。
2. **Local Queue (區域雙端佇列 - Deque)**：
   - 每個 ThreadPool Worker 執行緒擁有自己獨立的 Local Queue。當該執行緒內部產生新 Task 時（如 \`await\`），會推進自己的 Local Queue。
   - **LIFO (後進先出)**：Worker 執行自己 Local Queue 時採用 LIFO 順序（強化 CPU L1/L2 Cache 命中率）。
3. **Work-Stealing (工作竊取機制)**：
   - 當某個 Worker 執行緒把自己的 Local Queue 執行完畢閒置時，它會轉變成「竊取者 (Stealer)」。
   - 它會以 **FIFO 順序從其他繁忙 Worker 執行緒的 Local Queue 尾端「偷取 (Steal)」任務** 來執行，達成完美負載平衡！

💡 **面試加分點**
- 解釋為何 ThreadPool 不適合執行長時間阻塞 (Long-running blocking) 的任務，以及如何透過 \`TaskCreationOptions.LongRunning\` 提示 ThreadPool 創建獨立專屬執行緒。`,
    options: [
      "ThreadPool 每個 Worker 執行緒皆沒有自己的獨立區域佇列",
      "Work-Stealing 演算法允許閒置的 Worker 執行緒從繁忙 Worker 的區域佇列尾端竊取 Task 執行，實現負載平衡",
      "Local Queue 內部存取預設強制採用全域 Lock 鎖定",
      "長時間阻塞任務非常適合直接放入預設 ThreadPool 執行"
    ],
    correctIndex: 1,
    quizExplanation: "Work-Stealing 演算法讓空閒線程由其他繁忙線程的 Local Queue 尾端竊取任務，大幅減少鎖競爭並發揮全核心效能。"
  },
  {
    id: "dotnet-12",
    category: ".NET Core",
    difficulty: "Mid",
    title: "如何正確在 ASP.NET Core 中實作全域例外處理 (Global Exception Handling) 與 RFC 7807 ProblemDetails？",
    tags: ["Exception Handling", "ProblemDetails", "ASP.NET Core", "REST API"],
    summary: "使用 IExceptionHandler (.NET 8+) 或 UseExceptionHandler 中介軟體全域攔截例外，並統一回傳符合 RFC 7807 標準的 ProblemDetails JSON。",
    answer: `📌 **核心觀念**
在 Web API 中，切忌將原始 C# 異常堆疊 (Stack Trace) 直接洩漏給前端，這會帶來嚴重的**資安風險**與不友好的 API 體驗。規範的做法是採用 **RFC 7807 ProblemDetails** 統一錯誤格式。

🔍 **.NET 8 全新 \`IExceptionHandler\` 介面**
.NET 8 導入了全新的 \`IExceptionHandler\` 介面，比傳統 Exception Filter 或自訂 Middleware 更乾淨且優雅。

💻 **實作範例 (.NET 8)**
\`\`\`csharp
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Unhandled Exception occurred: {Message}", exception.Message);

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An error occurred while processing your request.",
            Detail = exception.Message,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = problemDetails.Status.Value;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true; // 已成功處置
    }
}
\`\`\`

💡 **面試加分點**
- 說明 \`builder.Services.AddProblemDetails()\` 與 \`app.UseExceptionHandler()\` 的配合。`,
    options: [
      "應該在生產環境將完整的 Stack Trace 回傳給前端以利使用者除錯",
      "RFC 7807 ProblemDetails 是 HTTP API 的標準化錯誤響應格式",
      "IExceptionHandler 介面只能在 Controller 中獨立繼承，無法全域註冊",
      "TryHandleAsync 回傳 false 代表異常已經被完全處理完畢"
    ],
    correctIndex: 1,
    quizExplanation: "RFC 7807 定義了 Web API 的標準化錯誤格式 (ProblemDetails)，結合全域 Exception Handler 提供一致的 HTTP 錯誤狀態。"
  },
  {
    id: "dotnet-13",
    category: ".NET Core",
    difficulty: "Junior",
    title: ".NET 中的 SignalR 是什麼？它如何實作即時 (Real-time) 雙向 Web 通訊？",
    tags: ["SignalR", "WebSocket", "Real-time", "WebSockets"],
    summary: "SignalR 是一個即時雙向通訊庫，自動在 WebSocket, Server-Sent Events 與 Long Polling 之間切換最佳傳輸協定。",
    answer: `📌 **核心觀念**
**ASP.NET Core SignalR** 是一個開放原始碼函式庫，簡化了向 Web 應用程式添加**即時 (Real-time) 雙向 Web 功能**的過程。

🔍 **自動退回機制 (Transport Fallbacks)**
SignalR 封裝了底層複雜的網路傳輸，並根據瀏覽器與伺服器的支援程度，**自動降級/選擇最佳傳輸協定**：
1. **WebSockets (首選)**：全雙工、低延遲的持久化 TCP 連線。
2. **Server-Sent Events (SSE)**：伺服器單向推送事件給瀏覽器。
3. **Long Polling (長輪詢 - 墊底)**：頻繁發送 HTTP 請求並掛起等待。

🔍 **Hub (集線器)**
- SignalR 使用 **Hub** 作為高階 RPC (Remote Procedure Call) 管道。
- 伺服器可以直接呼叫 Client 端的 JavaScript 函式 (\`Clients.All.SendAsync("ReceiveMessage", user, message)\`).

💻 **C# Hub 範例**
\`\`\`csharp
public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        // 廣播給所有連線的 Client
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}
\`\`\`

💡 **面試加分點**
- 討論多伺服器橫向擴展 (Scale-out) 時，SignalR 必須搭配 **Redis Backplane** 或 **Azure SignalR Service** 來跨節點同步廣播訊息。`,
    options: [
      "SignalR 只能使用 WebSocket，若瀏覽器不支援 WebSocket 則完全無法運行",
      "SignalR 透過 Hub 實現 RPC，並能自動在 WebSockets、SSE 與 Long Polling 間動態降級選擇",
      "SignalR 不支援伺服器端主動向 Client 端推送數據",
      "SignalR Hub 的方法只能傳送純文字，不支援 JSON 物件傳遞"
    ],
    correctIndex: 1,
    quizExplanation: "SignalR 自動封裝底層傳輸細節，支援 WebSockets/SSE/Long Polling 自動降級，實現 RPC 即時雙向溝通。"
  },
  {
    id: "dotnet-14",
    category: ".NET Core",
    difficulty: "Senior",
    title: ".NET Core 中的 System.Text.Json Source Generator (源碼產生器) 如何解決效能與 Native AOT 編譯問題？",
    tags: ["System.Text.Json", "Source Generator", "Native AOT", "Performance"],
    summary: "Source Generator 在編譯期生成 JSON 序列化程式碼，跳過執行期 Reflection 反射與 JIT，降低記憶體並全面支援 Native AOT。",
    answer: `📌 **核心觀念**
傳統 JSON 序列化庫 (如 Newtonsoft.Json) 嚴重依賴 **Runtime Reflection (執行期反射)**，這會帶來**記憶體分配、啟動延遲與無法進行 Native AOT 編譯**的致命缺點。

🔍 **System.Text.Json Source Generators 突破**
.NET 6+ 導入的 **Source Generators** 將 Reflection 工作提前到了 **Compile Time (編譯時期)**。

🔍 **三大優勢**
1. **零 Reflection 反射**：編譯器在編譯階段就自動產生強型別 JSON 讀寫與解析程式碼。
2. **Native AOT 完美相容**：Native AOT (Ahead-Of-Time) 編譯會裁剪 (Trim) 未使用的反射代碼，Source Generator 生成的靜態程式碼不會被剪裁。
3. **吞吐量與記憶體優化**：大幅降低 GC 分配與啟動冷啟動 (Cold Start) 延遲。

💻 **使用範例**
\`\`\`csharp
[JsonSerializable(typeof(UserDto))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}

// 呼叫時傳入 Context
var json = JsonSerializer.Serialize(user, AppJsonSerializerContext.Default.UserDto);
\`\`\`

💡 **面試加分點**
- 說明 Native AOT 的目標領域：Docker 容器極速啟動、Serverless Cold-start 優化、降低微服務記憶體 Footprint。`,
    options: [
      "Source Generator 會在執行期 (Runtime) 動態編譯 IL 程式碼以取代 JIT",
      "Source Generator 在編譯期預先生成 JSON 序列化代碼，跳過 Reflection，大幅支援 Native AOT",
      "Newtonsoft.Json 比 System.Text.Json Source Generator 更適合用在 Native AOT 中",
      "System.Text.Json 無法在 Minimal API 中使用"
    ],
    correctIndex: 1,
    quizExplanation: "Source Generator 在編譯期自動產生 C# 序列化程式碼，避開 Runtime 反射，是 .NET Native AOT 的靈魂底座。"
  },
  {
    id: "dotnet-15",
    category: ".NET Core",
    difficulty: "Mid",
    title: "How does gRPC in .NET Core compare to REST APIs in terms of performance and protocol design?",
    tags: ["gRPC", "HTTP/2", "Protobuf", "REST", "Performance"],
    summary: "gRPC 基於 HTTP/2 全雙工流與 Protocol Buffers 二進位序列化，吞吐量與傳輸體積顯著優於 JSON-over-HTTP/1.1 的 REST API。",
    answer: `📌 **核心觀念**
**gRPC** 是由 Google 主導的高效能、跨語言 RPC 框架，在 .NET Core (.NET 3.0+) 擁有官方頂級一等公民支援。

🔍 **gRPC vs REST API 深度對比**
1. **資料傳輸格式**：
   - **REST**：通常使用 **JSON / XML** (純文字格式)，體積大、解析開銷高。
   - **gRPC**：使用 **Protocol Buffers (Protobuf)** (強型別二進位編碼)，體積小約 60-80%，序列化速度極快。
2. **網路傳輸協定**：
   - **REST**：多基於 **HTTP/1.1** (存在 Head-of-line blocking 隊頭阻塞)。
   - **gRPC**：嚴格基於 **HTTP/2** (支援多路複用 Multiplexing、Header 壓縮、全雙工 Streaming)。
3. **契約驅動 (Contract-first)**：
   - gRPC 透過 **\`.proto\` 檔案** 定義 Strict Schema，並自動產生 C# Client/Server 存根 (Stub) 代碼。

💻 **適用場景**
- **微服務內部通訊 (Internal Microservices)**：首選 gRPC。
- **對外前端公網 API**：建議 REST / GraphQL（因為瀏覽器對 HTTP/2 gRPC 原生支援仍需 gRPC-Web 轉換）。

💡 **面試加分點**
- 提及 gRPC 支援的 4 種通訊模式：Unary (單一)、Server Streaming、Client Streaming、Bi-directional Streaming (雙向流)。`,
    options: [
      "gRPC 使用 JSON 作為主要資料傳輸格式，比 Protobuf 體積更小",
      "gRPC 建立在 HTTP/2 之上，利用 Protobuf 二進位編碼實現極高併發與低傳輸體積",
      "REST API 預設具備嚴格的 .proto 契約驅動機制",
      "gRPC 只能支援單向點對點請求，完全不支援雙向 Streaming"
    ],
    correctIndex: 1,
    quizExplanation: "gRPC 基於 HTTP/2 多路複用與 Protobuf 二進制序列化，傳輸效率遠超傳統基於 JSON/HTTP1.1 的 REST API。"
  },
  {
    id: "dotnet-16",
    category: ".NET Core",
    difficulty: "Junior",
    title: "ASP.NET Core 設定檔 (IConfiguration) 的載入順序與優先級關聯？環境變數如何覆蓋 appsettings.json？",
    tags: ["Configuration", "IConfiguration", "Environment Variables", "ASP.NET Core"],
    summary: "設定檔載入具備覆蓋層疊性。優先級：命令行參數 > 環境變數 > User Secrets > appsettings.{Environment}.json > appsettings.json。",
    answer: `📌 **核心觀念**
ASP.NET Core 提供極致靈活的層疊式設定檔系統 (\`IConfiguration\`)。當有多個 Provider 提供同名 Key 時，**後載入的 Provider 數值會覆蓋先載入的數值**。

🔍 **預設載入優先級 (由低至高 - 後者勝出)**
1. **\`appsettings.json\`** (基礎設定)。
2. **\`appsettings.{Environment}.json\`** (例如 \`appsettings.Development.json\`)。
3. **User Secrets** (僅在 Development 環境生效，防止敏感密碼進 Git)。
4. **Environment Variables (系統環境變數)** (Docker / K8s 部署常用)。
5. **Command-line Arguments (命令列參數)** (最高優先級)。

🔍 **環境變數階層映射法則**
在 JSON 中的階層 \`{ "Jwt": { "Secret": "123" } }\`，在 Linux/Windows 環境變數中應寫為雙下劃線 **\`Jwt__Secret=123\`**。

💻 **程式碼存取**
\`\`\`csharp
string dbConn = builder.Configuration.GetConnectionString("DefaultConnection");
string jwtSecret = builder.Configuration["Jwt:Secret"];
\`\`\`

💡 **面試加分點**
- 解釋為何 Docker / K8s 環境極度依賴環境變數覆蓋 \`appsettings.json\` 的實踐原因。`,
    options: [
      "appsettings.json 的數值會強制覆蓋所有系統環境變數",
      "命令列參數 (Command-line arguments) 具備最高優先級，會覆蓋前面的設定",
      "User Secrets 會在 Production 生產環境中自動啟用",
      "環境變數中的多層級 Key 分隔符號在 Linux 下使用冒號 : "
    ],
    correctIndex: 1,
    quizExplanation: "ASP.NET Core Configuration 採用後載入者覆蓋規則，命令行參數 > 環境變數 > appsettings.json。"
  },
  {
    id: "dotnet-17",
    category: ".NET Core",
    difficulty: "Mid",
    title: "ASP.NET Core 7/8 內建的 Rate Limiting (限流) 中介軟體提供哪些演算法？",
    tags: ["Rate Limiting", "ASP.NET Core 7", "Performance", "Security"],
    summary: "提供 Fixed Window, Sliding Window, Token Bucket 與 Concurrency 4 種演算法，防止 API 被高頻刷爆或 DDoS。",
    answer: `📌 **核心觀念**
.NET 7 內建了原生 **Rate Limiting (限流) Middleware** (\`Microsoft.AspNetCore.RateLimiting\`)，保護 API 免於過載攻擊與刷票。

🔍 **四大限流演算法**
1. **Fixed Window (固定視窗)**：
   - 劃分固定時間區間 (如 1 分鐘內最多 100 次)。區間倒數結束後歸零重計。
2. **Sliding Window (滑動視窗 - 推薦)**：
   - 將時間區間劃分為更小的細節 Segment。避免固定視窗在區間交界處（如第 59 秒與第 61 秒）爆發兩倍流量突波的問題。
3. **Token Bucket (權杖桶)**：
   - 桶子有固定容量 (Token)，並以固定速率補充 Token。允許一定程度的**突發流量 (Burst)**。
4. **Concurrency (併發限流)**：
   - 限制**同時進行中 (Concurrent)** 的 Request 數量，不管時間過了多久。

💻 **註冊範例**
\`\`\`csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixedPolicy", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromSeconds(10);
        opt.QueueLimit = 2;
    });
});

// 使用於 API 上
app.MapGet("/api/data", () => "Data").RequireRateLimiter("fixedPolicy");
\`\`\`

💡 **面試加分點**
- 說明當觸發限流時，Middleware 會預設回傳 **HTTP 429 Too Many Requests** 狀態碼。`,
    options: [
      "Rate Limiting 觸發時會回傳 HTTP 500 Internal Server Error",
      "Fixed Window 可以完美解決時間邊界處的兩倍突發流量問題",
      "Sliding Window 演算法比 Fixed Window 能提供更平滑的流量限制並預防邊界突波",
      "Concurrency 限流演算法限制的是每小時的最大請求總筆數"
    ],
    correctIndex: 2,
    quizExplanation: "Sliding Window 將時間分為細微 Segment 動態滑動計算，克服了 Fixed Window 於區間邊界湧入兩倍突發流量的盲點。"
  }
];
