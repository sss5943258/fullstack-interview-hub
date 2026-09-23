export const sqlQuestions = [
  {
    id: "sql-01",
    category: "SQL",
    difficulty: "Senior",
    title: "SQL 中的 Clustered Index (聚集索引) 與 Non-Clustered Index (非聚集索引) 有何底層結構差異？什麼是 Covered Query (覆蓋索引)？",
    tags: ["Indexing", "B-Tree", "Clustered Index", "Covered Index", "SQL Performance"],
    summary: "Clustered Index 的葉子節點即為真實資料行，一張表只能有一個；Non-Clustered Index 葉子節點儲存主鍵值，可能觸發 Key Lookup。",
    answer: `📌 **核心觀念**
在關聯式資料庫 (如 MySQL InnoDB, SQL Server) 中，索引底層普遍採用 **B+ Tree (B+ 樹)** 資料結構。兩種索引在 B+ Tree 葉子節點 (Leaf Node) 儲存的內容有著根本區別。

🔍 **底層結構比較**
1. **Clustered Index (聚集索引)**：
   - **實體排序**：資料列的實體儲存順序與索引鍵值的邏輯順序**完全一致**。
   - **葉子節點內容**：直接存放**整行真實數據 (Data Rows)**。
   - **數量限制**：一張資料表**只能有一個**聚集索引（通常為 Primary Key）。
2. **Non-Clustered Index (非聚集索引 / 二級索引)**：
   - **實體分離**：索引結構與真實資料列分開存放。
   - **葉子節點內容**：存放索引鍵值以及指向資料的**聚集索引鍵 (Primary Key Value)** 或行定位符 (RID)。
   - **Key Lookup (回表/鍵值查找)**：如果查詢的欄位不在二級索引中，SQL 必須持主鍵再到聚集索引搜尋一次真實資料，此過程稱為「回表 (Lookup)」。

🔍 **Covered Query (覆蓋索引)**
- 當一個查詢所需的所有欄位 (SELECT, WHERE, ORDER BY) **完全包含**在 Non-Clustered Index 的欄位中時：
- 資料庫直接從二級索引葉子節點回傳數據，**完全不需要進行回表 (Key Lookup)**，查詢速度顯著提升！

💻 **覆蓋索引 SQL 範例**
\`\`\`sql
-- 建立覆蓋索引
CREATE INDEX IX_Users_Dept_Name ON Users(DepartmentId) INCLUDE (Name, Email);

-- 此查詢完全覆蓋，0 次 Key Lookup！
SELECT Name, Email FROM Users WHERE DepartmentId = 5;
\`\`\`

💡 **面試加分點**
- 說明 B+ Tree 相比 B Tree 的優勢：葉子節點之間具備雙向鏈結串列 (Double LinkedList)，極度有利於範圍查詢 (Range Scan)。`,
    options: [
      "一張資料表可以建立多個 Clustered Index",
      "Clustered Index 的葉子節點存放的是二級索引的指標",
      "Covered Query 指查詢欄位完全包含在非聚集索引中，可避免昂貴的回表 (Key Lookup) 動作",
      "Non-Clustered Index 的葉子節點直接儲存整行的實體真實資料"
    ],
    correctIndex: 2,
    quizExplanation: "覆蓋索引 (Covering Index) 包含查詢所需的全部欄位，使 SQL 無須回表 (Key Lookup) 至聚集索引讀取資料。"
  },
  {
    id: "sql-02",
    category: "SQL",
    difficulty: "Senior",
    title: "資料庫事務 (Transaction) 的四大隔離層級與三大異象 (髒讀、不可重複讀、幻讀) 的對應關係？",
    tags: ["ACID", "Transactions", "Isolation Levels", "Dirty Read", "Phantom Read"],
    summary: "隔離層級由低到高：Read Uncommitted, Read Committed, Repeatable Read, Serializable。層級越高隔離性越好，但併發吞吐量越低。",
    answer: `📌 **核心觀念**
事務的 **ACID** 中，**Isolation (隔離性)** 決定了多個併發事務 (Concurrent Transactions) 互相干擾的程度。ANSI/ISO SQL 標準定義了四個隔離層級。

🔍 **三大併發異象 (Anomalies)**
1. **Dirty Read (髒讀)**：事務 A 讀取到了事務 B **尚未提交 (Uncommitted)** 的修訂數據。若 B 隨後 Rollback，A 讀到的就是髒數據。
2. **Non-repeatable Read (不可重複讀)**：事務 A 在同一個事務中多次讀取同一筆資料，中間事務 B **修改並提交了 (Update/Delete)** 該資料，導致 A 兩次讀到的資料不一致。
3. **Phantom Read (幻讀)**：事務 A 根據範圍條件查詢資料，中間事務 B **新增了 (Insert)** 符合該條件的新行並提交，導致 A 再次查詢時多出了「幻影列 (Phantom Rows)」。

🔍 **隔離層級對照表**
| 隔離層級 | 髒讀 (Dirty Read) | 不可重複讀 | 幻讀 (Phantom Read) |
| --- | --- | --- | --- |
| **Read Uncommitted** | ⚠️ 可能發生 | ⚠️ 可能發生 | ⚠️ 可能發生 |
| **Read Committed** (預設多數) | ❌ 阻止 | ⚠️ 可能發生 | ⚠️ 可能發生 |
| **Repeatable Read** (MySQL 預設) | ❌ 阻止 | ❌ 阻止 | ⚠️ 可能發生 (MySQL MVCC 能緩解) |
| **Serializable** (序列化) | ❌ 阻止 | ❌ 阻止 | ❌ 阻止 |

💡 **面試加分點**
- 說明 MySQL InnoDB 在 Repeatable Read 下透過 **MVCC (Multi-Version Concurrency Control)** 與 **Next-Key Locks (Gap Lock + Record Lock)** 解決了絕大部分的幻讀問題。`,
    options: [
      "Read Committed 隔離層級可以完全防止「不可重複讀」異象",
      "髒讀指的是讀取到了其他併發事務已經 Commit 提交的最新資料",
      "Repeatable Read 能阻止髒讀與不可重複讀，Serializable 能阻擋包含幻讀在內的所有併發異象",
      "Serializable 是併發吞吐量最高且最快的事務隔離層級"
    ],
    correctIndex: 2,
    quizExplanation: "Serializable 為最強隔離層級，能阻擋髒讀、不可重複讀與幻讀，但代價是併發效能最低。"
  },
  {
    id: "sql-03",
    category: "SQL",
    difficulty: "Mid",
    title: "SQL 執行計畫 (Execution Plan) 中，Index Scan 與 Index Seek 有何實質差異？如何識別隱式型別轉換 (Implicit Conversion) 導致的索引失效？",
    tags: ["Execution Plan", "Index Seek", "Index Scan", "SARGable", "Performance"],
    summary: "Index Seek 透過 B-Tree 樹狀直接定位目標；Index Scan 掃描整顆索引樹。隱式型別轉換會導致 SARGable 破壞從 Seek 退化為 Scan。",
    answer: `📌 **核心觀念**
閱讀 SQL **Execution Plan (執行計畫)** 是 SQL 調優的基本功。最關鍵的指標之一是觀察資料庫尋找資料的手法。

🔍 **Index Seek vs Index Scan**
1. **Index Seek (索引尋找 - 高效 🚀)**：
   - 資料庫利用 B-Tree 結構，像翻字典一樣，透過對數時間複雜度 \`O(log N)\` **精準定位**至符合條件的第一筆節點。
2. **Index Scan (索引掃描 - 較次之 🐢)**：
   - 資料庫無法精準定位，必須從頭到尾**走訪整顆索引樹的所有葉子節點 \`O(N)\`**。
3. **Table Scan (全表掃描 - 最差 ❌)**：
   - 完全沒有合適索引，逐行掃描整張實體資料表。

⚠️ **隱式型別轉換 (Implicit Conversion - 索引殺手)**
- 當資料庫欄位型別為 \`VARCHAR\`，而 SQL 查詢條件傳入 \`INT\`（或反之）：
- 資料庫為了比對，會在幕後隱式呼叫轉換函式：\`CONVERT(VARCHAR, UserCode) = 12345\`。
- 這打破了 **SARGable (Search Argument Able)** 原則，導致資料庫**無法使用 Index Seek，被迫退化為 Index Scan 或 Table Scan**！

💻 **隱式轉換示範**
\`\`\`sql
-- ❌ 欄位 Phone 是 VARCHAR，傳數字引發隱式轉換 -> 退化為 Index Scan
SELECT * FROM Users WHERE Phone = 0912345678;

-- ✅ 傳入正確字串型別 -> 保留 Index Seek
SELECT * FROM Users WHERE Phone = '0912345678';
\`\`\`

💡 **面試加分點**
- 提及其他常見的非 SARGable 寫法：在欄位上使用函式 (\`WHERE YEAR(CreateTime) = 2024\`)、前綴模糊搜尋 (\`WHERE Name LIKE '%Alex'\`)。`,
    options: [
      "Index Scan 效能比 Index Seek 更好，因為 Scan 會平行尋找資料",
      "Index Seek 透過 B-Tree 樹直接定位資料，時間複雜度為 O(log N)",
      "隱式型別轉換 (Implicit Conversion) 能幫助 SQL 自動優化並強化 Index Seek",
      "WHERE Phone LIKE '%123' 可以完美觸發 Index Seek 搜尋"
    ],
    correctIndex: 1,
    quizExplanation: "Index Seek 利用 B-Tree 對數時間定位，而隱式型別轉換會破壞 SARGable 性質導致退化為慢速 Scan。"
  },
  {
    id: "sql-04",
    category: "SQL",
    difficulty: "Junior",
    title: "SQL 中的 GROUP BY 與 HAVING 有何區別？WHERE 與 HAVING 的執行時機差異？",
    tags: ["SQL Basics", "GROUP BY", "HAVING", "Aggregation"],
    summary: "WHERE 在資料分組與聚合前篩選單列；HAVING 在 GROUP BY 聚合後對分組結果進行篩選。",
    answer: `📌 **核心觀念**
\`WHERE\` 與 \`HAVING\` 都用於條件過濾，但它們在 SQL 查詢的內部**邏輯執行順序 (Logical Query Processing)** 中位於完全不同的階段。

🔍 **邏輯執行順序**
1. \`FROM\` -> 2. \`ON\` -> 3. \`JOIN\` -> 4. **\`WHERE\`** -> 5. **\`GROUP BY\`** -> 6. **\`HAVING\`** -> 7. \`SELECT\` -> 8. \`DISTINCT\` -> 9. \`ORDER BY\`

🔍 **核心差異**
1. **WHERE (預先過濾)**：
   - 作用於 \`GROUP BY\` **之前**。
   - 對原始資料表的**單列 (Row-level)** 進行篩選。
   - **不能在 WHERE 中使用聚合函式** (如 \`SUM()\`, \`AVG()\`, \`COUNT()\`)。
2. **HAVING (聚合後過濾)**：
   - 作用於 \`GROUP BY\` **之後**。
   - 對分組後的**聚合結果 (Group-level)** 進行篩選。
   - **可以使用聚合函式**。

💻 **範例程式碼**
\`\`\`sql
SELECT DepartmentId, AVG(Salary) AS AvgSalary
FROM Employees
WHERE Status = 'Active' -- 1. 先過濾在職員工
GROUP BY DepartmentId   -- 2. 按部門分組
HAVING AVG(Salary) > 60000; -- 3. 再過濾平均薪資高於 6 萬的部門
\`\`\`

💡 **面試加分點**
- 提示效能優化：能在 \`WHERE\` 先過濾掉的條件，絕不要留到 \`HAVING\` 再處理，因為先過濾能減少 \`GROUP BY\` 記憶體排序開銷。`,
    options: [
      "WHERE 可以直接使用 SUM() 或 COUNT() 等聚合函式進行過濾",
      "HAVING 作用於 GROUP BY 之後，專門對分組聚合後的結果集進行篩選",
      "WHERE 與 HAVING 在 SQL 執行的時間點與順序完全相同",
      "HAVING 不能與 GROUP BY 一起搭配使用"
    ],
    correctIndex: 1,
    quizExplanation: "HAVING 位於 GROUP BY 之後，專門針對聚合函式的結果進行次級條件篩選。"
  },
  {
    id: "sql-05",
    category: "SQL",
    difficulty: "Senior",
    title: "高併發資料庫的 悲觀鎖 (Pessimistic Locking) 與 樂觀鎖 (Optimistic Locking) 實作機制與選型比較？",
    tags: ["Locking", "Concurrency", "Optimistic Lock", "Pessimistic Lock"],
    summary: "悲觀鎖透過 SELECT ... FOR UPDATE 實體鎖定；樂觀鎖透過版本號 (Version/Timestamp) 進行 CAS 檢查，適合讀多寫少。",
    answer: `📌 **核心觀念**
在處置高併發資料更新（例如商品秒殺扣減庫存、銀行轉帳）時，為了防止**寫入覆蓋 (Lost Update)** 衝擊，需要採用適當的併發控制鎖策略。

🔍 **兩大鎖策略深度比較**
1. **Pessimistic Locking (悲觀鎖)**：
   - **假設最壞情況**：認為併發衝突極高，隨時有人會搶改資料。
   - **實作方式**：利用資料庫原生的鎖機制。查詢時直接加上排他鎖 (Exclusive Lock)。
     - SQL: \`SELECT * FROM Stock WHERE ProductId = 1 FOR UPDATE;\`
   - **優點**：保證強一致性，徹底防止衝突。
   - **缺點**：鎖住資料列會造成其他 Transaction 阻塞等待，併發吞吐量 (Throughput) 低，易死鎖 (Deadlock)。
2. **Optimistic Locking (樂觀鎖)**：
   - **假設最好情況**：認為併發衝突機率低，大家都各自讀取。
   - **實作方式**：不安裝實體鎖。在 Table 加上 \`Version\` 或 \`UpdatedAt\` 欄位。更新時透過 **CAS (Compare-And-Swap)** 機制檢查：
     - SQL: \`UPDATE Stock SET Quantity = Quantity - 1, Version = Version + 1 WHERE ProductId = 1 AND Version = @OldVersion;\`
   - **優點**：無鎖等待，併發吞吐量極高，適用於「讀多寫少」場景。
   - **缺點**：高併發寫入衝突時會導致大量 Retry，浪費 CPU 資源。

💡 **面試加分點**
- 結論選型：**讀多寫少 -> 樂觀鎖**；**寫多讀少 / 搶購秒殺 -> 悲觀鎖或 Redis 分佈式鎖**。`,
    options: [
      "樂觀鎖使用 SELECT ... FOR UPDATE 實施實體鎖定",
      "悲觀鎖適合用在「讀多寫少」且高併發的超大型網站中",
      "樂觀鎖透過欄位版本號 (Version) 與 CAS 機制檢查，不阻擋其他 Transaction 讀取",
      "悲觀鎖完全不會引發資料庫 Deadlock 情況"
    ],
    correctIndex: 2,
    quizExplanation: "樂觀鎖透過 Version 版本號進行 Compare-And-Swap 比對，完全不安裝實體 Lock，吞吐量高。"
  },
  {
    id: "sql-06",
    category: "SQL",
    difficulty: "Mid",
    title: "SQL 中的視窗函式 (Window Functions) ROW_NUMBER(), RANK() 與 DENSE_RANK() 有何差異？",
    tags: ["Window Functions", "ROW_NUMBER", "RANK", "DENSE_RANK", "Analytics"],
    summary: "ROW_NUMBER 產生連續唯一序號；RANK 遇到相同值排名並列且會跳號；DENSE_RANK 並列但不跳號。",
    answer: `📌 **核心觀念**
**Window Functions (視窗函式)** 允許在不使用 \`GROUP BY\` 壓縮行數的前提下，針對特定數據視窗 (Partition) 進行跨行計算與排名。

🔍 **三大排名函式對比**
假設資料的薪資數值為：\`[100, 90, 90, 80]\`

1. **\`ROW_NUMBER()\`**：
   - 產生**嚴格連續且唯一**的行號，不管數值是否相同。
   - **結果**：\`1, 2, 3, 4\`
   - **適用**：分頁查詢 (Pagination)、刪除重複數據。
2. **\`RANK()\`**：
   - 遇到相同數值給予**相同名次**，但後續名次會**跳號 (Gap)**。
   - **結果**：\`1, 2, 2, 4\` (因為有兩個第 2 名，下一個直接跳第 4 名)。
   - **適用**：標準競賽排名。
3. **\`DENSE_RANK()\`**：
   - 遇到相同數值給予**相同名次**，且後續名次**緊密連續不跳號 (No Gap)**。
   - **結果**：\`1, 2, 2, 3\` (即使有兩個第 2 名，下一個依然是第 3 名)。

💻 **範例程式碼**
\`\`\`sql
SELECT Name, Salary,
       ROW_NUMBER() OVER (ORDER BY Salary DESC) as RowNum,
       RANK()       OVER (ORDER BY Salary DESC) as RankNum,
       DENSE_RANK() OVER (ORDER BY Salary DESC) as DenseRankNum
FROM Employees;
\`\`\`

💡 **面試加分點**
- 示範經典面試題：「如何查詢每個部門薪資前 3 高的員工」 (使用 \`DENSE_RANK() OVER (PARTITION BY DepartmentId ORDER BY Salary DESC)\` 搭配 CTE)。`,
    options: [
      "ROW_NUMBER() 遇到數值相同時會給予相同名次並跳號",
      "RANK() 遇到數值相同時會名次並列，且後續名次會跳號 (Gap)",
      "DENSE_RANK() 會給予唯一不重複的連續流水號",
      "視窗函式只能與 GROUP BY 子句強制搭配使用"
    ],
    correctIndex: 1,
    quizExplanation: "RANK() 遇到同分並列名次，且排名會佔用後續位置導致名次不連續跳號 (如 1, 2, 2, 4)。"
  },
  {
    id: "sql-07",
    category: "SQL",
    difficulty: "Senior",
    title: "資料庫快取高併發下的三大名詞：Cache Penetration (快取穿透)、Cache Breakdown (快取擊穿) 與 Cache Avalanche (快取雪崩) 的原因與防範處置？",
    tags: ["Redis", "Caching", "Cache Avalanche", "Cache Penetration", "System Design"],
    summary: "快取穿透指查不存在數據(Bloom Filter解)；快取擊穿指熱點 Key 過期(互斥鎖/永遠不過期解)；快取雪崩指大量 Key 同時過期(隨機 TTL 解)。",
    answer: `📌 **核心觀念**
在 High-concurrency 高併發系統中，通常使用 **Redis** 作為資料庫前置快取。若快取層失效，流量直接灌爆後端 DB，可能引發災難性崩潰。

🔍 **三大快取災害與防禦機制**
1. **Cache Penetration (快取穿透)**：
   - **現象**：查詢一個**快取與 DB 中都絕對不存在**的 key (如惡意攻擊 \`id = -1\`)。每次請求都穿透 Redis 直接硬打 DB。
   - **解法**：
     - **Bloom Filter (布隆過濾器)**：在 Redis 前放置布隆過濾器阻擋不存在的 ID。
     - **快取空值 (Cache Null)**：在 Redis 寫入 \`null\` 並設定短 TTL (如 60s)。
2. **Cache Breakdown (快取擊穿)**：
   - **現象**：某個**超極限熱點 Key (Hotspot Key)** (例如爆款商品) 在**過期的瞬間**，萬筆併發流量同時湧入 DB。
   - **解法**：
     - **互斥鎖 (Mutex Lock)**：查詢 DB 前先搶 Redis 分佈式鎖，搶到者查 DB 補快取，其他人等待。
     - **熱點 Key 邏輯永遠不過期** (背景非同步更新)。
3. **Cache Avalanche (快取雪崩)**：
   - **現象**：**大量快取 Key 在同一時間點集體過期**，或 Redis 服務單點宕機。全站流量瞬間集體灌爆 DB。
   - **解法**：
     - **TTL 加隨機值**：設定 TTL 時加上 1~5 分鐘的隨機抖動 (Random Shift)，分散過期時間。
     - **Redis 高可用集群 (Sentinel / Cluster)**。

💡 **面試加分點**
- 畫出快取防禦架構圖：Client -> API -> Bloom Filter -> Redis -> Mutex Lock -> DB。`,
    options: [
      "快取穿透是指超極限熱點 Key 過期引發大量併發流灌爆 DB",
      "快取雪崩可以使用 Bloom Filter 作為主要防禦手段",
      "快取擊穿指熱點 Key 過期瞬間萬筆請求直擊 DB，可用互斥鎖 (Mutex Lock) 或邏輯永遠不過期防止",
      "快取穿透是指大量 Key 設定了完全相同的過期時間"
    ],
    correctIndex: 2,
    quizExplanation: "快取擊穿專指「單一熱點 Key 過期」引發大量併發湧入 DB，互斥鎖能確保僅單一請求訪問 DB 重新重建快取。"
  },
  {
    id: "sql-08",
    category: "SQL",
    difficulty: "Junior",
    title: "SQL 資料庫正規化 (Normalization) 的 1NF, 2NF 與 3NF 規範為何？什麼時候該進行反正規化 (Denormalization)？",
    tags: ["Normalization", "1NF", "2NF", "3NF", "Denormalization"],
    summary: "1NF 要求欄位原子性；2NF 要求消除部分相依；3NF 要求消除遞移相依。反正規化以空間與冗餘換取 Read 查詢效能。",
    answer: `📌 **核心觀念**
**Normalization (正規化)** 旨在透過消除資料冗餘 (Data Redundancy) 來預防新增、修改、刪除異象 (Anomalies)，並確保資料一致性。

🔍 **三大正規化原則**
1. **1NF (第一正規化 - 欄位原子性)**：
   - 表中的每一個欄位都必須是**不可再分的原子值 (Atomic Value)**。不能在單一欄位存逗號分隔的字串 (如 \`Phones: "0912,0934"\`)。
2. **2NF (第二正規化 - 消除部分相依)**：
   - 符合 1NF，且非主鍵欄位必須**完全相依於複合主鍵 (Composite Key)** 的整體，而非部分。
3. **3NF (第三正規化 - 消除遞移相依)**：
   - 符合 2NF，且非主鍵欄位之間**不能存在遞移相依關係** (A -> B -> C)。例如 User 表中不能直接放 \`DepartmentName\`（應放 \`DepartmentId\` 引照至部門表）。

⚠️ **什麼時候進行反正規化 (Denormalization)？**
- 在高併發 Read-heavy 系統中，嚴格的 3NF 會導致查詢需要頻繁多表 **JOIN**，嚴重拉低吞吐量。
- **反正規化**：故意保留適度的冗餘欄位（如在訂單表直接冗餘存入 \`CustomerName\`），以**空間換取時間**，減少 JOIN 提升讀取速度。

💡 **面試加分點**
- 強調反正規化的代價：寫入 (UPDATE) 時必須手動同步所有冗餘欄位，否則會發生資料不一致。`,
    options: [
      "1NF 要求非主鍵欄位不能存在遞移相依關係",
      "2NF 要求資料表中每個欄位都是不可再分的原子值",
      "3NF 要求消除非主鍵欄位對主鍵的遞移相依，避免資料重複冗餘",
      "反正規化旨在徹底消除所有資料表間的欄位冗餘"
    ],
    correctIndex: 2,
    quizExplanation: "3NF 要求資料表欄位直接相依於主鍵，消除遞移相依，使資料庫架構簡潔且無異象。"
  },
  {
    id: "sql-09",
    category: "SQL",
    difficulty: "Mid",
    title: "SQL CTE (Common Table Expression / 公用表運算式) 與臨時表 (Temp Table)、子查詢 (Subquery) 的比較與遞迴應用？",
    tags: ["CTE", "WITH", "Subquery", "Recursive CTE", "SQL"],
    summary: "CTE (WITH 語法) 提高 readability 並支援遞迴；臨時表適合複用與加索引；子查詢易使 SQL 混亂。",
    answer: `📌 **核心觀念**
**CTE (Common Table Expression)** 透過 \`WITH\` 關鍵字定義一個命名的臨時結果集，僅在單一 SQL 語句的執行範圍內存在。

🔍 **三者深度對比**
1. **Subquery (子查詢)**：
   - 嵌套在 SQL 內部。多層嵌套時程式碼可讀性極差，且無法在同查詢中多次重複引用。
2. **CTE (\`WITH cte AS (...)\`)**：
   - 提升程式碼可讀性，結構清晰。可在主查詢中**多次引用**同一個 CTE。
   - **遞迴 (Recursive CTE)**：SQL 中唯一能優雅處理**組織樹狀圖、多層級選單 (Parent-Child Hierarchy)** 的原生機制。
3. **Temp Table (\`#TempTable\` / \`CREATE TEMPORARY TABLE\`)**：
   - 實體儲存於 \`tempdb\`。可以在臨時表上**建立索引**、跨多個 SQL 步驟使用。適合極大數據量的多步驟複雜計算。

💻 **Recursive CTE 組織樹範例**
\`\`\`sql
WITH RecursiveOrg AS (
    -- 1. 錨點成員 (Root): 找出頂層 CEO
    SELECT EmployeeId, Name, ManagerId, 1 AS Level
    FROM Employees WHERE ManagerId IS NULL
    UNION ALL
    -- 2. 遞迴成員: 向上/向下尋找下屬
    SELECT e.EmployeeId, e.Name, e.ManagerId, r.Level + 1
    FROM Employees e
    INNER JOIN RecursiveOrg r ON e.ManagerId = r.EmployeeId
)
SELECT * FROM RecursiveOrg;
\`\`\`

💡 **面試加分點**
- 提醒：多數資料庫中一般 CTE 本質是語法糖 (Inline View)，不會自動寫入 TempDB 建立索引；若數據極大需重複 Join，臨時表可能更優。`,
    options: [
      "CTE 可以跨多個不同的資料庫 Session 長期保存數據",
      "Recursive CTE (遞迴 CTE) 是 SQL 中處理樹狀組織與多層級階層資料的標準解法",
      "可以在 CTE 的定義語句上建立額外的 B-Tree 索引",
      "Subquery 比 CTE 更有利於維護龐大複雜的 SQL 邏輯"
    ],
    correctIndex: 1,
    quizExplanation: "Recursive CTE 透過 UNION ALL 自我引用，是 SQL 原生遍歷樹狀父子關係結構的威力工具。"
  },
  {
    id: "sql-10",
    category: "SQL",
    difficulty: "Senior",
    title: "資料庫 Sharding (分庫分表) 與 Partitioning (分區) 的差異？如何解決 Sharding 後的跨庫 JOIN 與全域自增 ID 問題？",
    tags: ["Sharding", "Partitioning", "Distributed Database", "Snowflake", "Architecture"],
    summary: "Partitioning 屬單機內實體分割；Sharding 屬跨實體節點分片。Sharding 後需靠分散式 ID (Snowflake) 與資料冗餘/CQRS 解決 JOIN。",
    answer: `📌 **核心觀念**
當單一資料表資料量達到千萬/億級、或單機儲存與 I/O 瓶頸時，必須進行資料拆分。

🔍 **Partitioning vs Sharding**
1. **Partitioning (垂直/水平分區)**：
   - **單機內部**：資料表在**同一個資料庫實例**內部根據 Hash 或 Range 切分成多個物理檔案。對應用程式完全透明。
2. **Sharding (水平分庫分表)**：
   - **跨機器實體**：將資料根據 Sharding Key (如 \`UserId % N\`) 分散儲存到**多台獨立的實體資料庫伺服器**中。

⚠️ **Sharding 帶來的兩大核心挑戰與解法**
1. **全域自增 ID 衝突 (Global Primary Key)**：
   - 單機 \`AUTO_INCREMENT\` 在分庫後會發生 ID 重複衝突。
   - **解法**：使用 **Snowflake (雪花演算法)** 產生全域唯一 64-bit 比特位 ID（包含時間戳+工作機器 ID+序列號），或使用 UUID/Redis 自增。
2. **跨庫 JOIN 困難 (Cross-shard JOIN)**：
   - 資料散落在不同 Server，無法再寫 SQL \`JOIN\`。
   - **解法**：
     - **欄位冗餘 (Denormalization)**：將常用欄位直接冗餘存入主表。
     - **應用層組裝 / CQRS**：透過 ES (Elasticsearch) 或 Async Event 將資料匯集至專門的 Read-model 進行查詢。

💡 **面試加分點**
- 討論 Sharding 的代價：分散式事務 (2PC/Saga) 複雜度飆升，能不 Sharding 就儘量先透過 Read-Write Splitting (主從複製) 與索引優化。`,
    options: [
      "Partitioning 是將資料分散儲存到多台不同的獨立實體伺服器中",
      "Sharding 後可以繼續流暢地使用單機 SQL JOIN 進行跨庫查詢",
      "Snowflake 雪花演算法能產生時間遞增且全域分散式唯一的 64-bit ID，解決 Sharding ID 衝突",
      "Sharding 會顯著降低微服務系統的部署與維護複雜度"
    ],
    correctIndex: 2,
    quizExplanation: "Snowflake 演算法結合時間戳與機器節點 ID，能高效產生單調遞增且分散式全域唯一的 ID，是 Sharding 標準配備。"
  },
  {
    id: "sql-11",
    category: "SQL",
    difficulty: "Junior",
    title: "SQL Injection (SQL 注入攻擊) 的攻擊原理是什麼？為什麼 Parameterized Queries (參數化查詢) 能徹底防範？",
    tags: ["SQL Injection", "Security", "Prepared Statements", "OWASP"],
    summary: "SQL 注入係因動態拼貼字串將用戶輸入誤判為 SQL 語法；參數化查詢將指令語法與資料內容嚴格分離，從根源杜絕攻擊。",
    answer: `📌 **核心觀念**
**SQL Injection (SQL 注入)** 長年位居 OWASP Top 10 資安威脅前茅。攻擊者將惡意的 SQL 語法片段注入到未經處理的輸入參數中，騙過資料庫解析器。

🔍 **攻擊原理 (字串拼接)**
\`\`\`sql
-- 程式碼拼接： "SELECT * FROM Users WHERE Username = '" + userInput + "' AND Password = '" + passInput + "'"
-- 若 userInput 輸入: ' OR '1'='1
-- 最終編譯成 SQL:
SELECT * FROM Users WHERE Username = '' OR '1'='1' AND Password = '';
\`\`\`
這會導致條件永遠判定為 True，攻擊者無須密碼直接登入！

🔍 **為什麼 Parameterized Queries (預編譯/參數化) 能徹底根治？**
1. **語法樹預先編譯 (Pre-compilation)**：
   - 資料庫會先接收 SQL 樣板 (如 \`SELECT * FROM Users WHERE Username = ?\`) 並將其**編譯為固定的 AST (抽象語法樹)**。
2. **資料與指令嚴格分離**：
   - 用戶輸入的內容後續作為純資料參數 (Literal Data) 帶入，**資料庫絕不會將參數內容二次解釋/編譯為 SQL 命令**。哪怕輸入含有 \`OR '1'='1'\` 也只會被當成普通字串比對。

💡 **面試加分點**
- 提醒：使用 ORM (如 EF Core, Dapper) 時，若直接寫 \`FromSqlRaw("... " + userInput)\` 依然會引發 SQL 注入，必須使用參數化寫法。`,
    options: [
      "SQL 注入的根源是因為資料庫效能過慢導致語法解析錯誤",
      "參數化查詢先將 SQL 樣板編譯為語法樹，確保用戶輸入永遠只被當成純資料內容處理",
      "只要在前端用 JavaScript 過濾單引號就能 100% 防止 SQL 注入",
      "ORM 框架在任何情況下都不可能發生 SQL 注入攻擊"
    ],
    correctIndex: 1,
    quizExplanation: "參數化查詢 (Prepared Statements) 預先將 SQL 編譯完成，讓用戶輸入強制歸類為 Value 而非 Command，從根源防範注入。"
  },
  {
    id: "sql-12",
    category: "SQL",
    difficulty: "Mid",
    title: "如何處置 SQL 查詢中的 Deadlock (死鎖)？資料庫如何偵測並處置死鎖？",
    tags: ["Deadlock", "Transactions", "Locking", "Troubleshooting"],
    summary: "死鎖係兩事務互相等待對方釋放鎖；資料庫以 Wait-For Graph 偵測並選擇代價最小的事務作為 Deadlock Victim 強制 Rollback。",
    answer: `📌 **核心觀念**
**Deadlock (死鎖)** 指兩個或多個事務在執行過程中，因爭奪資源而造成的一種**互相等待 (Cyclic Dependency)** 的現象，若無外力介入將永遠無法推進。

🔍 **死鎖成因情境**
- **Transaction A**：持有 Resource 1 鎖，嘗試索取 Resource 2 鎖。
- **Transaction B**：持有 Resource 2 鎖，嘗試索取 Resource 1 鎖。

🔍 **資料庫死鎖偵測機制**
1. **Wait-For Graph (等待圖)**：資料庫背景執行緒定期繪製鎖等待關聯圖，當發現圖中出現**閉環/環路 (Cycle)** 時，即確定發生死鎖。
2. **Deadlock Victim (死鎖受害者 selection)**：
   - 資料庫會選擇一個「撤銷開銷最小 (Lowest Rollback Cost)」的事務作為 Victim，主動將其 **Rollback 並拋出 1205 號死鎖例外**，釋放鎖讓另一個事務成功完成。

💻 **預防死鎖的 3 大黃金準則**
1. **嚴格保持相同的資源存取順序**：所有人更新表 A 再更新表 B，絕對不要顛倒！
2. **縮短 Transaction 事務範圍**：不要在 Transaction 中執行耗時的非同步 API 呼叫或複雜邏輯。
3. **降低鎖級別或採用樂觀鎖**。

💡 **面試加分點**
- 在程式碼中捕捉 Deadlock Exception 並配置 Polly **Retry Policy (重試機制)**。`,
    options: [
      "死鎖發生時，資料庫會永久凍結並只能手動重啟資料庫服務",
      "資料庫透過 Wait-For Graph 檢測閉環，並選擇撤銷代價最小的事務作為 Victim 進行 Rollback",
      "顛倒不同事務存取資料表的順序是防止死鎖的最佳 practice",
      "死鎖只能在 SQL 預設層級為 Read Uncommitted 時發生"
    ],
    correctIndex: 1,
    quizExplanation: "資料庫透過 Wait-For Graph 偵測環形鎖等待，並選擇代價最小者強制 Rollback 釋放資源。"
  },
  {
    id: "sql-13",
    category: "SQL",
    difficulty: "Senior",
    title: "資料庫 Read-Write Splitting (主從複製/讀寫分離) 的 Master-Slave 架構如何處理 Replication Lag (主從同步延遲) 帶來的資料不一致問題？",
    tags: ["Read-Write Splitting", "Replication Lag", "Master-Slave", "High Availability"],
    summary: "主從延遲指 Slave 同步落後 Master。解法包含：關鍵業務強制讀 Master、帶上版本號/時間戳比對、或利用分佈式快取中轉。",
    answer: `📌 **核心觀念**
為應對高併發讀取流量，大型系統多採用 **Read-Write Splitting (讀寫分離)** 架構：**Master (主庫)** 負責寫入 (INSERT/UPDATE)，一或多台 **Slave (從庫)** 透過 Binlog 非同步複製 (Asynchronous Replication) 負責讀取。

⚠️ **核心痛點：Replication Lag (主從同步延遲)**
- 由於 Binlog 複製是**非同步或半同步**的，當 Master 寫入完畢後，Slave 需要數毫秒至數秒才能同步完畢。
- **使用者體驗痛點**：使用者剛發布完一篇文章，頁面自動重新整理（讀取 Slave），結果畫面上剛發的文章竟然消失了！

🔍 **四大業界解決方案**
1. **關鍵/剛需業務強制讀 Master (Read Master for Critical Writes)**：
   - 例如：使用者「修改個人資料」、「支付成功」後的立即回顯，強制該查詢直接走 Master 庫。
2. **基於 Session / Cookie 判斷時間差**：
   - 當使用者執行寫入後，在 Cookie/Session 寫入時間戳。在接下來 5 秒內的讀取請求強制路由至 Master，過後才放行回 Slave。
3. **帶上 Binlog 位點 / GTID 檢查**：
   - Client 讀取時附帶寫入時獲得的 GTID，Slave 檢查若自己的 GTID 尚未到達該位點，則阻塞等待或轉交 Master。
4. **快取前置中轉 (Redis Buffer)**：
   - 寫入 Master 時同時寫入 Redis，前端優先讀取 Redis。

💡 **面試加分點**
- 分析 MySQL 的 **Semi-synchronous Replication (半同步複製)** 與 **Group Replication (MGR)** 在數據零丟失與延遲之間的權衡。`,
    options: [
      "Master-Slave 讀寫分離中，Binlog 複製永遠是絕對同步且零毫秒延遲的",
      "使用者剛更新資料後的立即回顯，可透過強制讀取 Master 庫或基於時間戳路由來解決主從延遲痛點",
      "解決主從延遲的最佳做法是徹底停用 Slave 庫",
      "讀寫分離主要是為了提升資料庫的寫入吞吐量"
    ],
    correctIndex: 1,
    quizExplanation: "剛寫入後的即時回顯業務可透過「強制讀 Master」或「寫入後 N 秒內走 Master」來規避從庫非同步延遲問題。"
  },
  {
    id: "sql-14",
    category: "SQL",
    difficulty: "Junior",
    title: "SQL 資料庫中 Union 與 Union All 的差別為何？何時該優先使用 Union All？",
    tags: ["UNION", "UNION ALL", "SQL Basics", "Performance"],
    summary: "Union 會進行去重與排序；Union All 直接合併所有結果。確定無重複或不需去重時，優先使用 Union All 提升效能。",
    answer: `📌 **核心觀念**
\`UNION\` 與 \`UNION ALL\` 都用於將兩個或多個 \`SELECT\` 查詢的結果集合併為單一結果集。

🔍 **核心差異與效能**
1. **\`UNION\` (合併 + 唯一去重)**：
   - 會將多個結果集合併，並**自動剔除重複的資料行 (Distinct)**。
   - **效能開銷**：為了剔除重複列，資料庫必須在記憶體中對整個合併結果集進行**排序 (Sort) 與 Hash 去重運算**。
2. **\`UNION ALL\` (純粹合併)**：
   - 直接將多個結果集**原封不動地串聯拼接**在一起，包含重複行。
   - **效能極佳**：完全不進行任何排序或去重運算。

💻 **最佳實踐原則**
- 只要你**確定兩個查詢結果不可能重疊**，或者**業務邏輯上允許重複**，**永遠優先選擇 \`UNION ALL\`**！

💻 **範例**
\`\`\`sql
-- 歷史表與當前表主鍵絕不重複，用 UNION ALL 效能最高！
SELECT OrderId, Amount FROM Orders_2023
UNION ALL
SELECT OrderId, Amount FROM Orders_2024;
\`\`\`

💡 **面試加分點**
- 提醒：使用 UNION/UNION ALL 時，前後各個 SELECT 子句的欄位數量、順序與資料型別必須保持嚴格相容。`,
    options: [
      "UNION 比 UNION ALL 效能更好，因為 UNION 佔用的記憶體更少",
      "UNION ALL 會自動對合併後的結果集進行排序並剔除重複列",
      "UNION 會自動剔除重複列並進行排序去重，確定無重複時應優先使用 UNION ALL 以獲取最佳效能",
      "UNION ALL 要求前後 SELECT 子句的欄位數量可以不一致"
    ],
    correctIndex: 2,
    quizExplanation: "UNION 需額外進行 Sort / Distinct 去重運算，而 UNION ALL 僅進行資料拼接，效能顯著優越。"
  },
  {
    id: "sql-15",
    category: "SQL",
    difficulty: "Mid",
    title: "資料庫 Connection Pool (連線池) 的運作機制與連線洩漏 (Connection Leak) 的防禦處置？",
    tags: ["Connection Pool", "Performance", "Resource Management", "Database"],
    summary: "連線池預先建立並維護 TCP 連線以供複用；忘記 Close/Dispose 連線會引發 Connection Leak 導致系統癱瘓。",
    answer: `📌 **核心觀念**
建立一個資料庫 TCP 連線並完成身份驗證的開銷非常昂貴 (耗時數十至數百毫秒)。**Connection Pool (連線池)** 預先建立一組持久化的 DB 連線並在記憶體中維護，供應用程式重複借用與歸還。

🔍 **連線池生命週期**
1. **Borrow (借用)**：應用程式呼叫 \`connection.Open()\` 時，連線池直接分配一個現成的空閒連線，無須重新三次握手。
2. **Return (歸還)**：呼叫 \`connection.Close()\` 或 \`Dispose()\` 時，連線**並未真正關閉**，而是被清除狀態後歸還給連線池備用。

⚠️ **Connection Leak (連線洩漏)**
- **原因**：程式碼開啟了 DB 連線，但因為發生 Exception 或邏輯漏洞，**沒有呼叫 \`Close()\` 或 \`Dispose()\`**。
- **後果**：連線池中的連線被借光且無法收回，後續所有 Request 呼叫 \`connection.Open()\` 都會被阻塞等待直到 Timeout (拋出 \`TimeoutException: Timeout expired. The timeout period elapsed prior to obtaining a connection from the pool\`)。

💻 **正確寫法**
\`\`\`csharp
// C# using 語法糖保證即使出錯也會呼叫 Dispose 歸還連線
using (var conn = new SqlConnection(connStr))
{
    await conn.OpenAsync();
    // 執行查詢...
} // 此處自動歸還連線至 Connection Pool
\`\`\`

💡 **面試加分點**
- 說明連線池關鍵參數設定：\`Min Pool Size\`, \`Max Pool Size\` (預設通常 100), \`Connection Timeout\`。`,
    options: [
      "connection.Close() 會立即切斷與資料庫的實體 TCP 連線",
      "連線洩漏 (Connection Leak) 是因為忘記關閉/歸還連線，導致連線池借光並引發 Timeout 崩潰",
      "Connection Pool 會讓每次 DB 查詢都重新發起 TCP 三次握手與驗證",
      "Max Pool Size 設定得越大越好，建議設為無上限"
    ],
    correctIndex: 1,
    quizExplanation: "未正確 Close/Dispose 資料庫連線會導致連線無法歸還連線池，最終引發 Connection Leak 併發 Timeout 崩潰。"
  },
  {
    id: "sql-16",
    category: "SQL",
    difficulty: "Senior",
    title: "SQL 中的 Materialized View (物化檢視) 與 Standard View (標準檢視) 有何差別？更新機制為何？",
    tags: ["Materialized View", "Views", "SQL Performance", "Data Warehouse"],
    summary: "Standard View 僅為儲存的查詢 SQL 語句；Materialized View 實體將計算結果寫入磁碟，適合極度昂貴的報表分析。",
    answer: `📌 **核心觀念**
在資料庫中，**View (檢視)** 是一種虛擬表。然而根據實體化程度的不同，分為標準檢視與物化檢視。

🔍 **兩者深度比較**
1. **Standard View (標準檢視 - 虛擬表)**：
   - **實體存在**：磁碟上**只儲存 SQL 查詢語句**，不儲存任何數據。
   - **執行機制**：每次查詢 View 時，資料庫都會動態執行背後的 SQL 語句。
   - **優缺點**：永遠獲取最新數據，但若背後 SQL 非常複雜，每次查詢都很慢。
2. **Materialized View (物化檢視 - 實體快取表)**：
   - **實體存在**：將背後 SQL 查詢計算出來的**結果真實寫入磁碟實體表**中，並可建立 B-Tree 索引！
   - **執行機制**：查詢時直接讀取磁碟上的快取結果，速度極快 (毫秒級)。
   - **更新機制 (Refresh)**：
     - **ON DEMAND / Scheduled**：定時或手動觸發重新計算。
     - **ON COMMIT (Fast Refresh)**：當基表 (Base Table) 發生異動提交時，異量同步更新物化檢視。

💻 **適用場景**
- 商業智慧 (BI)、數據分析、億級跨表統計報表。

💡 **面試加分點**
- 說明 PostgreSQL / Oracle 原生支援物化檢視；SQL Server 稱為 **Indexed Views (索引檢視)**。`,
    options: [
      "Standard View 會將查詢結果實體寫入磁碟並佔用大量儲存空間",
      "Materialized View 磁碟上只儲存 SQL 語法，不儲存任何實體資料",
      "Materialized View 實體保存計算結果並可建索引，能極大化提升複雜統計報表的查詢效能",
      "Materialized View 每次查詢都會強制重新執行背後複雜的 JOIN 運算"
    ],
    correctIndex: 2,
    quizExplanation: "Materialized View 將計算結果實體快取寫入磁碟並支援索引，專為大規模報表與複雜聚合分析優化。"
  },
  {
    id: "sql-17",
    category: "SQL",
    difficulty: "Mid",
    title: "資料庫索引失效 (Index Invalidation) 的常見原因有哪些？",
    tags: ["Indexing", "Index Invalidation", "SQL Optimization", "SARGable"],
    summary: "常見失效原因包含：欄位使用函式/運算、前綴模糊搜尋(%xxx)、隱式型別轉換、使用 NOT IN / != 以及 OR 條件缺少索引。",
    answer: `📌 **核心觀念**
建立了索引並不代表 SQL 就一定會使用索引。若 SQL 撰寫不當，優化器 (Query Optimizer) 會放棄 Index Seek 並退化為全表掃描 (Table Scan)。

🔍 **經典 5 大索引失效坑**
1. **對索引欄位進行運算或使用函式**：
   - ❌ \`WHERE YEAR(CreatedDate) = 2024\`
   - ✅ \`WHERE CreatedDate >= '2024-01-01' AND CreatedDate < '2025-01-01'\`
2. **前綴模糊搜尋 (Leading Wildcard)**：
   - ❌ \`WHERE Name LIKE '%Alex'\` (無法使用 B-Tree 排序前綴)
   - ✅ \`WHERE Name LIKE 'Alex%'\` (可觸發 Index Seek)
3. **隱式型別轉換 (Implicit Data Type Conversion)**：
   - ❌ \`WHERE Phone = 0912345678\` (Phone 欄位為 VARCHAR)
4. **使用否定條件 (!=, <>, NOT IN)**：
   - 否定條件通常範圍極大，優化器會判斷全表掃描比走索引更划算。
5. **OR 條件中含有未建索引的欄位**：
   - \`WHERE IndexedCol = 1 OR NonIndexedCol = 2\` (只要 OR 的其中一邊無索引，全盤退化)。

💡 **面試加分點**
- 提醒：當資料庫統計資訊 (Statistics) 過期時，資料庫優化器可能會估算錯誤並選擇錯誤的索引，需定期執行 \`ANALYZE TABLE\` 或 \`UPDATE STATISTICS\`。`,
    options: [
      "WHERE Name LIKE 'Alex%' 會導致索引徹底失效",
      "對索引欄位使用 YEAR() 函式包裹能顯著提升 B-Tree 定位速度",
      "在索引欄位上使用函式運算、前綴模糊搜尋 (%xx) 與隱式型別轉換是導致索引失效的常見原因",
      "OR 條件兩邊只要其中一邊有索引，就一定能執行高效的 Index Seek"
    ],
    correctIndex: 2,
    quizExplanation: "欄位上進行運算/函式、前綴 % 模糊搜尋與隱式型別轉換皆會打破 SARGable 原則，引發索引失效。"
  }
];
