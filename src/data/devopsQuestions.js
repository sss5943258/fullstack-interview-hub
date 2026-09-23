export const devopsQuestions = [
  {
    id: "devops-01",
    category: "K8s & Docker",
    difficulty: "Mid",
    title: "Docker 鏡像的分層儲存 (Layer Caching) 原理為何？如何在 Dockerfile 中撰寫高效 Multi-stage Builds (多階段構建)？",
    tags: ["Docker", "Multi-stage Builds", "Layer Cache", "Container"],
    summary: "Docker 鏡像採用 OverlayFS唯讀分層。Multi-stage Builds 允許在編譯階段使用完整 SDK，最後只將編譯好的二進位產物複製至極小 Alpine/Distroless 基礎鏡像中。",
    answer: `📌 **核心觀念**
Docker 鏡像由一系列**唯讀的層 (Read-Only Layers)** 堆疊而成，底層採用 **Union File System (如 Overlay2)**。當 Dockerfile 中某指令未變動時，Docker 會直接重用鏡像層快取 (Layer Cache)。

🔍 **Dockerfile 優化與 Layer Caching 黃金原則**
1. **變動頻率低的指令寫在上面**：例如將複製依賴檔 (\`COPY package.json .\`) 與安裝依賴 (\`npm install\`) 放在複製原始碼 (\`COPY . .\`) 之前。這樣改原始碼時，不需要重新發起耗時的 \`npm install\`。

🔍 **Multi-stage Builds (多階段構建)**
- **舊痛點**：為了編譯程式（如 C#, Go, Java），鏡像必須包含完整的 SDK、編譯工具與標頭檔，導致最終鏡像動輒 1GB+。
- **多階段解法**：在單一 Dockerfile 中定義多個 \`FROM\` 階段。編譯階段使用 SDK 鏡像，**最後階段換成極小的運行時鏡像 (如 Alpine 或 Distroless)**，並從編譯階段只複製 (\`COPY --from=builder\`) 編譯好的 binary 產物。

💻 **.NET / Node.js 範例**
\`\`\`dockerfile
# 階段 1: 編譯 (Build Stage)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

# 階段 2: 最終運行時 (Runtime Stage - 體積極小且安全)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyApp.dll"]
\`\`\`

💡 **面試加分點**
- 體積對比：SDK 鏡像約 800MB -> Runtime 鏡像僅約 100MB / Distroless 僅 30MB。更小體積意味著更快的 CI/CD 部署速度與更小的攻擊面 (Attack Surface)。`,
    options: [
      "Dockerfile 中任何指令改變都不會影響後續指令的 Layer Cache",
      "Multi-stage Builds 允許只將編譯後的產物複製至極小 Runtime 鏡像，大幅減小鏡像體積與資安風險",
      "應該把經常變動的程式碼 COPY 指令放在 npm install 指令的最前面以加速快取",
      "Multi-stage Builds 要求每一個階段都必須包含完整的 SDK 編譯器"
    ],
    correctIndex: 1,
    quizExplanation: "Multi-stage Builds 可以在 Builder 階段編譯後，僅將 binary 產物提取至 Slim/Distroless 鏡像，達成極小體積與極高安全性。"
  },
  {
    id: "devops-02",
    category: "K8s & Docker",
    difficulty: "Senior",
    title: "Kubernetes 中的 Liveness Probe, Readiness Probe 與 Startup Probe 三大健康檢查有何根本區別？配置不當會造成什麼災難？",
    tags: ["Kubernetes", "Health Check", "Liveness Probe", "Readiness Probe", "Probes"],
    summary: "Liveness 失敗會重啟 Pod；Readiness 失敗會自 Service 負載平衡切離流量；Startup 失敗會暫停前兩者直到應用完全啟動。",
    answer: `📌 **核心觀念**
Kubernetes (K8s) 的 **Kubelet** 透過三種探針 (Probes) 來監控容器的健康狀態。設定正確的探針是保證零停機 (Zero-downtime) 滾動升級的關鍵。

🔍 **三大探針比較**
1. **Liveness Probe (存活探針)**：
   - **檢查目的**：應用程式是否死鎖 (Deadlock) 或陷入永久崩潰。
   - **失敗處置**：Kubelet 會**強制殺死容器並重啟 Pod (Restart Container)**。
2. **Readiness Probe (就緒探針)**：
   - **檢查目的**：應用程式是否準備好接受外部網路流量（如快取是否載入完畢、DB 是否連上）。
   - **失敗處置**：**絕不重啟 Pod**，而是將該 Pod 從 K8s **Service Endpoint 流量列表中移除**，不再轉發流量給它。
3. **Startup Probe (啟動探針 - K8s 1.18+)**：
   - **檢查目的**：針對冷啟動極慢的遺留系統 (Legacy App)。
   - **特點**：在 Startup Probe 成功前，**Liveness 與 Readiness 探針會被完全禁用**。避免啟動慢的 Pod 被 Liveness 誤殺陷入重啟無限迴圈。

⚠️ **配置不當災難案例**
- **案例**：將 Liveness Probe 的 \`initialDelaySeconds\` 設太短，且檢查點連向了 DB：
- **災難**：當高峰期流量大時，DB 延遲上升，導致 Liveness 失敗。K8s **集體殺死所有 Pod 並重啟**，引發雪崩效能災難！

💡 **最佳實踐**
- Liveness 應盡可能輕量 (檢查內部狀態/記憶體)，不要在 Liveness 探針中呼叫外部 API 或 DB！`,
    options: [
      "Liveness Probe 失敗時只會將 Pod 從 Service 流量切離，不會重啟 Pod",
      "Readiness Probe 失敗時會引發 Kubelet 重啟 Pod 容器",
      "Startup Probe 能防止啟動極慢的應用在未完成啟動前被 Liveness 探針誤判死亡而陷入重啟無限迴圈",
      "三者探針都應該向外呼叫大型資料庫的複雜 JOIN 查詢以確保真實健康"
    ],
    correctIndex: 2,
    quizExplanation: "Startup Probe 能保護冷啟動慢的應用，在啟動完成前暫停 Liveness 檢查，避免頻繁被 Kubelet 誤殺重啟。"
  },
  {
    id: "devops-03",
    category: "K8s & Docker",
    difficulty: "Mid",
    title: "Kubernetes 的 Deployment 滾動更新 (Rolling Update) 原理為何？maxSurge 與 maxUnavailable 參數如何配置達到零停機？",
    tags: ["Kubernetes", "Deployment", "Rolling Update", "Zero-downtime"],
    summary: "Rolling Update 透過創建新 ReplicaSet 逐漸替換舊 Pod。配置 maxSurge 與 maxUnavailable 控制滾動期間 Pod 的最大超額與最小可用量。",
    answer: `📌 **核心觀念**
Kubernetes **Deployment** 控制器透過管理 **ReplicaSet** 實現無縫的 **Rolling Update (滾動更新)**，在不干斷服務的情形下將舊版本 Pod 逐步替換為新版本。

🔍 **核心參數對比 (\`strategy.rollingUpdate\`)**
1. **\`maxSurge\` (最大超額數)**：
   - 更新過程中，最多可以**比預期 Pod 數量多出多少個**。
   - 範例：目標 4 個 Pod，\`maxSurge: 25%\` (即 1 個)。更新時最多可擴容到 5 個 Pod。
2. **\`maxUnavailable\` (最大不可用數)**：
   - 更新過程中，最多可以有**多少個 Pod 處於不可用/刪除狀態**。
   - 範例：目標 4 個 Pod，\`maxUnavailable: 0\`。確保更新期間可用 Pod 數量**永遠不低於 4 個**（零停機防護）。

💻 **零停機 Deployment 配置範例**
\`\`\`yaml
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 允許先多建 1 個新 Pod
      maxUnavailable: 0  # 更新期間絕對不允許可用數減少！
\`\`\`

💡 **面試加分點**
- 說明配合零停機更新的靈魂前提：Pod 必須配置合適的 **Readiness Probe** 與 **PreStop Lifecycle Hook**（讓 Pod 在被 Terminate 之前有時間處理完手中剩餘的 HTTP 請求）。`,
    options: [
      "maxUnavailable: 0 代表更新過程中絕對不允許可用 Pod 數量低於 replicas 設定，有利於零停機",
      "Rolling Update 會立即一次性殺死所有舊 Pod 並同時建立全新 Pod",
      "maxSurge: 0 允許更新過程中先多創建 50% 的新版本 Pod",
      "滾動更新完全不依賴 ReplicaSet 控制器"
    ],
    correctIndex: 0,
    quizExplanation: "設定 maxUnavailable: 0 能保證在滾動更新期間，可用 Pod 總數永遠不會低於目標份數，是零停機 (Zero-downtime) 靈魂配置。"
  },
  {
    id: "devops-04",
    category: "K8s & Docker",
    difficulty: "Senior",
    title: "Kubernetes 中的 StatefulSet 與 Deployment 的架構區別為何？如何為資料庫等有狀態服務規劃持久化儲存 (PV / PVC / StorageClass)？",
    tags: ["StatefulSet", "Deployment", "PersistentVolume", "StorageClass", "Storage"],
    summary: "Deployment 適合無狀態(Stateless)且 Pod 名稱隨機；StatefulSet 提供固定有序網絡標識(Pod-0, Pod-1)與獨立綁定的 PV 儲存卷。",
    answer: `📌 **核心觀念**
在 K8s 中，**Deployment** 專門處理**無狀態 (Stateless)** 應用（如 Web API），Pod 之間是完全同質、無序且可隨意替換的。而 **StatefulSet** 專門處理**有狀態 (Stateful)** 應用（如 MySQL, Redis, Kafka）。

🔍 **StatefulSet 的三大獨特保證**
1. **穩定且唯一的網路標識 (Stable Network ID)**：
   - Pod 名稱固定為 \`app-0\`, \`app-1\`, \`app-2\`。重新啟動後名稱與 DNS 主機名稱不會改變。
2. **有序部署與縮放 (Ordered Deployment)**：
   - 按 \`0 -> 1 -> 2\` 順序依次創建與啟動；刪除時按 \`2 -> 1 -> 0\` 逆序進行。
3. **穩定且獨立的持久化儲存 (Stable Storage Binding)**：
   - 透過 \`volumeClaimTemplates\` 為**每個 Pod 獨立建立專屬的 PVC/PV**。當 Pod 宕機被重新調度到其他 Node 時，該 Pod 仍會精準掛載回原本屬於它的同一塊 PV 儲存區塊！

🔍 **PV / PVC / StorageClass 三層架構**
- **StorageClass (儲存類)**：定義儲存供應商 (如 AWS EBS, GCP PD, NFS) 的動態供給 (Dynamic Provisioning) 規則。
- **PVC (PersistentVolumeClaim)**：使用者向 K8s 提出的「儲存申請單」（如：我需要 50GB 讀寫儲存空間）。
- **PV (PersistentVolume)**：K8s 實體掛載的儲存資源。

💡 **面試加分點**
- 提醒：StatefulSet 通常搭配 **Headless Service (\`clusterIP: None\`)**，讓內部 Pod 能直接透過 DNS 精確定址特定副本 (例如訪問 Redis Master 節點)。`,
    options: [
      "Deployment 為每個 Pod 提供了固定的 Pod-0, Pod-1 名稱與專屬綁定 PV",
      "StatefulSet 適合無狀態 Web API，Pod 銷毀時 PV 會被自動強制清除",
      "StatefulSet 提供穩定的 Pod 網路識別碼、有序擴縮容與 volumeClaimTemplates 獨立 PV 綁定",
      "PVC 是實體的硬碟，PV 是使用者寫的申請單"
    ],
    correctIndex: 2,
    quizExplanation: "StatefulSet 具備固定有序識別碼、有序擴縮容與 volumeClaimTemplates 專屬 PV 綁定機制，是有狀態服務首選。"
  },
  {
    id: "devops-05",
    category: "K8s & Docker",
    difficulty: "Junior",
    title: "Docker CMD 與 ENTRYPOINT 指令有何差別？如何組合使用？",
    tags: ["Docker", "Dockerfile", "CMD", "ENTRYPOINT"],
    summary: "ENTRYPOINT 定義容器啟動時的固定主程式；CMD 提供預設參數。在 docker run 傳參時 CMD 會被覆蓋而 ENTRYPOINT 保持固定。",
    answer: `📌 **核心觀念**
在 Dockerfile 中，\`CMD\` 與 \`ENTRYPOINT\` 都用來指定容器啟動時要執行的指令，但它們在**參數覆蓋 (Override)** 的行為上有著顯著差異。

🔍 **二者差異與組合**
1. **ENTRYPOINT (進入點/主程式)**：
   - 設定容器啟動時的**固定執行檔/主指令**。
   - 在執行 \`docker run <image> <args>\` 時，傳入的 \`<args>\` 會被作為參數**追加 (Append)** 到 ENTRYPOINT 之後，而不會覆蓋它。
2. **CMD (預設參數)**：
   - 提供預設執行的指令或預設參數。
   - 在執行 \`docker run <image> <args>\` 時，傳入的 \`<args>\` 會**完全覆蓋 (Override)** CMD 的內容。

💡 **最佳組合模式 (Preferred Pattern)**
- 將 **ENTRYPOINT** 設定為固定主程式，將 **CMD** 設定為預設傳給主程式的參數！

💻 **範例**
\`\`\`dockerfile
# 組合寫法
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]

# 執行: docker run my-nginx
# 實際執行: nginx -g "daemon off;"

# 執行: docker run my-nginx -h (傳入 -h)
# 實際執行: nginx -h (CMD 被 -h 覆蓋，但 ENTRYPOINT nginx 保持不變)
\`\`\`

💡 **面試加分點**
- 區分 Shell Form (\`CMD node app.js\`) 與 Exec Form (\`CMD ["node", "app.js"]\`)：Exec Form 不會呼叫 shell，能正確讓 PID 1 收到 SIGTERM 訊號進行優雅關機 (Graceful Shutdown)。`,
    options: [
      "docker run 傳入的參數會完全覆蓋 ENTRYPOINT 指令",
      "CMD 適合放置固定不可變的主程式，ENTRYPOINT 適合放置可變參數",
      "使用 Exec Form (JSON 陣列) 設定 ENTRYPOINT 才能讓容器內的應用正確接收 SIGTERM 優雅關機訊號",
      "CMD 與 ENTRYPOINT 不能在同一個 Dockerfile 中同時出現"
    ],
    correctIndex: 2,
    quizExplanation: "Exec Form ([\"node\", \"app.js\"]) 讓應用程式作為 PID 1 啟動，從而能正確接收 K8s/Docker 的 SIGTERM 訊號以實現優雅關機。"
  },
  {
    id: "devops-06",
    category: "K8s & Docker",
    difficulty: "Mid",
    title: "Kubernetes Services 的四種類型 (ClusterIP, NodePort, LoadBalancer, ExternalName) 與 Ingress 控制器的角色？",
    tags: ["Kubernetes", "Service", "Ingress", "Networking", "ClusterIP"],
    summary: "ClusterIP 僅集群內訪問；NodePort 開啟節點端口；LoadBalancer 整合雲端 LB；Ingress 在 L7 提供 HTTP 路由與 SSL 終結。",
    answer: `📌 **核心觀念**
Kubernetes **Service** 是一個抽象層，它定義了一組 Pod 的邏輯集合與存取策略（透過 Label Selector）。由於 Pod IP 會隨重啟隨機改變，Service 提供了一個**穩定的 Cluster IP 與 DNS 名稱**。

🔍 **Service 四大類型剖析**
1. **ClusterIP (預設)**：
   - 僅在 **K8s 集群內部 (Internal)** 可存取。集群外部無法直接連線。
2. **NodePort**：
   - 在集群中的**每一個 Node** 上開啟一個實體高位 Port (預設 30000-32767)。透過 \`<NodeIP>:<NodePort>\` 從外部訪問。
3. **LoadBalancer**：
   - 專為公有雲 (AWS, GCP, Azure) 設計。K8s 會自動向雲端廠商申請一組實體的外部雲端負載平衡器 (如 AWS NLB/ALB) 並綁定 IP。
4. **ExternalName**：
   - 將 Service 映射到外部的 CNAME 域名 (如外部資料庫或第三方 API)。

🔍 **Ingress / Ingress Controller (L7 網關)**
- **問題**：若每個服務都用 LoadBalancer，會非常昂貴且難以管理。
- **Ingress 角色**：運作在 **Layer 7 (HTTP/HTTPS)**。透過單一 IP 暴露幾百個微服務。提供基於 URL Path/Host 的路由轉發、SSL/TLS 憑證終結與 Rate Limiting。

💡 **面試加分點**
- 提及現代 K8s 新一代網關標準：**Gateway API** (取代傳統 Ingress，提供更強大的多團隊 Role-oriented 治理能力)。`,
    options: [
      "ClusterIP 可以在 K8s 集群外部透過公網直接連線存取",
      "NodePort 是專為公有雲自動向 AWS 申請實體 Cloud LoadBalancer 的 Service 類型",
      "Ingress 運作於 Layer 7 HTTP/HTTPS 層，能透過單一 IP 提供域名路由與 TLS 憑證終結",
      "ExternalName 只能連線至同一個 Namespace 內部的 Pod"
    ],
    correctIndex: 2,
    quizExplanation: "Ingress 係七層 (L7) 應用層網關，透過域名與 Path 將流量分發給不同 Service，避免為每個服務申請獨立昂貴的 LoadBalancer。"
  },
  {
    id: "devops-07",
    category: "K8s & Docker",
    difficulty: "Senior",
    title: "Kubernetes 的 Resource Limits 與 Requests (CPU & Memory) 如何影響 Kubelet 的 Pod 排程 (Scheduling) 與 OOMKilled 行為？",
    tags: ["Kubernetes", "Resource Limits", "QoS", "OOMKilled", "Scheduling"],
    summary: "Requests 用於 Kube-scheduler 排程節點；Limits 限制最大資源。Memory 超過 Limit 會被 OOMKilled；CPU 超過 Limit 會引發 Throttling。",
    answer: `📌 **核心觀念**
Kubernetes 允許為容器宣告 **\`requests\` (最低保證需求)** 與 **\`limits\` (上限限制)**。這直接決定了 Pod 的 **QoS (Quality of Service) 等級** 與生命力。

🔍 **Requests vs Limits 深度影響**
1. **Pod 排程階段 (Kube-scheduler)**：
   - Scheduler **完全依據 \`requests\` 的總和**來決定將 Pod 放在哪個 Node。如果 Node 的剩餘可分配空間小於 Pod 的 \`requests\`，Pod 就無法排程上去 (處於 \`Pending\` 狀態)。**Limits 完全不影響排程**。
2. **運行與超用階段 (Runtime Behavior)**：
   - **CPU (可壓縮資源 - Compressible)**：
     - 若容器 CPU 使用量超過 \`limits\`，Kubelet 不會殺死容器，而是施加 **CPU Throttling (限速/降頻)**，導致應用變慢。
   - **Memory (不可壓縮資源 - Non-compressible)**：
     - 若容器記憶體使用量超過 \`limits\`，LINUX 核心會觸發 **OOMKilled (Out Of Memory Killed - Exit Code 137)**，直接強制殺死該容器並重啟！

🔍 **QoS 三大等級**
- **Guaranteed (最高)**：所有容器的 Requests 與 Limits 均設定且完全相等。最難被驅逐。
- **Burstable (中等)**：Requests 小於 Limits。
- **BestEffort (最低)**：完全未設定。節點記憶體不足時最先被驅逐殺死。

💡 **面試加分點**
- 警告：Java / .NET 應用必須配置 JVM/CLR 記憶體堆限制，否則容器會因為讀取到 Node 的總記憶體而分配過大，導致觸發 K8s OOMKilled。`,
    options: [
      "Kube-scheduler 是根據 Limits 的大小來決定 Pod 要排程在哪個 Node",
      "當容器 Memory 超過 limits 時，K8s 會施加 CPU Throttling 但絕對不會殺死容器",
      "當容器 Memory 超過 limits 時會觸發 OOMKilled (Exit Code 137) 被強制殺死；CPU 超過 limit 會引起 Throttling",
      "BestEffort 是 QoS 級別中最高等級且最安全不被驅逐的等級"
    ],
    correctIndex: 2,
    quizExplanation: "Memory 為不可壓縮資源，超用 limit 會被 OS/K8s 觸發 OOMKilled；CPU 屬可壓縮資源，超用只會引發 Throttling 限速。"
  },
  {
    id: "devops-08",
    category: "K8s & Docker",
    difficulty: "Mid",
    title: "Kubernetes 的 Pod 設計模式中，Sidecar Pattern (邊車模式) 與 Init Containers 的應用場景為何？",
    tags: ["Sidecar Pattern", "Init Containers", "Design Patterns", "Kubernetes"],
    summary: "Init Containers 在主容器啟動前按順序跑完即退出；Sidecar 容器與主容器共享 Network/Volume，在背景輔助日誌或代理。",
    answer: `📌 **核心觀念**
Pod 是 K8s 最小的部署單元。一個 Pod 可以包含一個或**多個緊密耦合的容器 (Multi-container Pod)**。

🔍 **兩大經典設計模式**
1. **Init Containers (初始化容器)**：
   - **特性**：在主應用容器 (App Container) **啟動之前運行**。多個 Init Containers 會**按順序阻塞式執行**，每個都必須成功退出 (\`exit 0\`)，主容器才會開始啟動。
   - **場景**：等待 DB 連線就緒、從遠端下載組態設定檔、執行資料庫 Migration。
2. **Sidecar Pattern (邊車模式)**：
   - **特性**：與主應用容器**同時運行、同生共死**。它們共享相同的 Network Namespace (可以透過 \`localhost\` 互相存取) 與 Storage Volume。
   - **場景**：
     - **Service Mesh 代理** (如 Istio Envoy)：攔截並加密/路由主容器的所有網路流量。
     - **日誌收集器** (如 Fluentd / Vector)：即時讀取主容器寫入共享 Volume 的 log 檔並推送至 ES。

💻 **K8s 1.28 Native Sidecar**
- K8s 1.28+ 支援原生的 Native Sidecar (在 \`initContainers\` 設定 \`restartPolicy: Always\`)，徹底解決了舊版 Sidecar 無法控制啟動與關機順序的痛點。

💡 **面試加分點**
- 強調同一個 Pod 內的所有容器共享 \`localhost\` 網路與 IPC 管道。`,
    options: [
      "Init Containers 與主容器同時平行啟動並在背景長期運行",
      "Sidecar 容器與主容器共享相同的 Network Namespace，可以透過 localhost 直接通訊",
      "Pod 內部永遠只能包含唯一一個容器，無法放置第二個容器",
      "Sidecar 容器主要用於執行資料庫 Schema Migration 並在完成後自動退出"
    ],
    correctIndex: 1,
    quizExplanation: "Pod 內部的多個容器 (如主容器與 Sidecar) 共享相同的 Network Namespace，可透過 localhost 高效溝通。"
  },
  {
    id: "devops-09",
    category: "K8s & Docker",
    difficulty: "Senior",
    title: "Kubernetes 的 Service Mesh (服務網格 - 如 Istio) 解決了什麼問題？Envoy Proxy 的 Sidecar 注入與流量治理機制？",
    tags: ["Service Mesh", "Istio", "Envoy", "mTLS", "Observability"],
    summary: "Service Mesh 將非業務功能(mTLS, 熔斷, 限流, 鏈路追蹤)從業務代碼剝離，透過 Envoy Sidecar 實現全自動網路切面治理。",
    answer: `📌 **核心觀念**
在微服務 (Microservices) 規模龐大時，**服務間通訊 (Service-to-Service)** 的資安 (mTLS 加密)、可觀察性 (Tracing)、流量控制 (Canary 灰度發布) 與熔斷 (Circuit Breaking) 如果全寫在業務代碼中（如 Spring Cloud / Steeltoe），會造成語言綁定與龐大維護成本。

🔍 **Service Mesh / Istio 革命**
**Service Mesh** 將所有的網路通訊抽象為獨立的基礎設施層。

🔍 **控制面與資料面 (Control Plane vs Data Plane)**
1. **Data Plane (資料面 - Envoy Proxy)**：
   - 透過 K8s Mutation Webhook **全自動注入 Envoy Sidecar** 容器到每個 Pod 中。
   - 透過 iptables 規則將 Pod 的所有進出流量**強制導向 Envoy**。
2. **Control Plane (控制面 - Istiod)**：
   - 負責管理配置，並將路由規則與 mTLS 憑證動態下發給全網格的 Envoy。

🔍 **四大核心能力**
- **Traffic Management (流量治理)**：金絲雀發布 (Canary)、A/B Testing (基於 Header 轉發 1% 流量)。
- **Security (安全)**： Pod 間全自動 **Zero-trust mTLS 雙向加密** 與 JWT 驗證。
- **Observability (可觀察性)**：自動生成全網格的 Distributed Tracing (Jaeger) 與 Metrics (Prometheus)。

💡 **面試加分點**
- 討論 Sidecarless Service Mesh 趨勢：如 Ambient Mesh / Cilium eBPF，解決傳統 Envoy Sidecar 額外消耗記憶體與增加 1-2ms 延遲的缺點。`,
    options: [
      "Service Mesh 要求所有微服務業務程式碼必須手動引進 Istio SDK",
      "Istio 透過全自動注入 Envoy Sidecar 容器與 iptables 流量攔截，實現非侵入式的 mTLS 與流量治理",
      "Service Mesh 只能處理單一微服務內部的記憶體變數傳遞，無法處理 HTTP 網路",
      "Envoy Proxy 運作於 Control Plane 主導 API 宣告"
    ],
    correctIndex: 1,
    quizExplanation: "Istio 使用 Envoy 邊車代理與 iptables 攔截流量，無需修訂業務代碼即可提供透明的 mTLS 加密、灰度發佈與熔斷。"
  },
  {
    id: "sql-18", // tag mapping
    category: "K8s & Docker",
    difficulty: "Junior",
    title: "Kubernetes ConfigMap 與 Secret 的用途為何？Secret 是絕對安全的加密儲存嗎？",
    tags: ["ConfigMap", "Secret", "Security", "Kubernetes"],
    summary: "ConfigMap 存明文設定；Secret 存敏感資訊。預設 Secret 僅使用 Base64 編碼，絕非加密，必須配置 KMS / RBAC 防護。",
    answer: `📌 **核心觀念**
為了符合 12-Factor App 原則（將設定檔與程式碼分離），K8s 提供了 **ConfigMap** 與 **Secret** 兩種原生資源，將配置動態注入容器（透過環境變數或 Volume 掛載）。

🔍 **ConfigMap vs Secret**
1. **ConfigMap**：儲存非敏感的明文設定（如資料庫連線位址、環境變數、JSON 配置文件）。
2. **Secret**：儲存敏感資訊（如密碼、API Key、TLS 憑證、SSH 金鑰）。

⚠️ **重大迷思：Secret 是絕對安全的嗎？**
- **答案：絕對不是！**
- K8s 預設的 Secret **只是將字串進行 Base64 編碼 (Encoding)**（例如 \`echo "admin" | base64\`），任何人拿到 YAML 都可以輕鬆解碼取得明文！
- **真正安全的 Secret 防禦**：
  1. **KMS Encryption at Rest**：配置 etcd 的靜態加密 (使用 AWS KMS / HashiCorp Vault key)。
  2. **嚴格的 K8s RBAC**：限制一般開發者讀取 Secret 的權限。
  3. **整合外部金鑰庫**：使用 **External Secrets Operator** 或 **HashiCorp Vault**。

💡 **面試加分點**
- 說明當 ConfigMap 以 **Volume 掛載** 時，K8s 會在數十秒內自動更新容器內的檔案；但若以 **Env (環境變數)** 注入，ConfigMap 改變時容器不會更新，必須重啟 Pod。`,
    options: [
      "K8s Secret 預設採用 AES-256 強度加密儲存，絕對無法被解析",
      "ConfigMap 用於明文配置，Secret 預設僅使用 Base64 編碼，並非加密，需搭配 etcd KMS 與 RBAC 保障安全",
      "以環境變數 (Env) 注入的 ConfigMap 在修改後容器會自動即時更新變數值",
      "ConfigMap 無法以檔案 Volume 的形式掛載進容器"
    ],
    correctIndex: 1,
    quizExplanation: "Secret 預設僅做 Base64 encoding 而非加密，安全性依賴 etcd 加密、RBAC 存取控制與 Vault 金鑰庫整合。"
  },
  {
    id: "devops-11",
    category: "K8s & Docker",
    difficulty: "Mid",
    title: "Kubernetes HPA (Horizontal Pod Autoscaler) 的自動擴縮容工作原理為何？Metrics Server 的角色？",
    tags: ["HPA", "Autoscaling", "Metrics Server", "Kubernetes"],
    summary: "HPA 定期向 Metrics Server 查詢 Pod 的 CPU/Memory 利用率，並根據期望公式動態調整 Deployment 的 replicas 數量。",
    answer: `📌 **核心觀念**
**HPA (Horizontal Pod Autoscaler)** 是 K8s 實現彈性伸縮、節省雲端成本的核心組件。它能根據即時的負載自動增加或減少 Pod 的副本數量 (Replicas)。

🔍 **運作流程與公式**
1. **Metrics 收集**：**Metrics Server** 定期向全集群 Kubelet 的 cAdvisor 收集 CPU / Memory 數據。
2. **HPA 控制迴圈 (Control Loop)**：HPA 控制器預設每 15 秒向 Metrics Server 查詢 Metric 數據。
3. **擴縮容計算公式**：
   - \`期望 Pod 數 = ceil[ 當前 Pod 數 * ( 當前 Metric 值 / 目標 Target Metric 值 ) ]\`
   - 範例：當前 2 個 Pod，CPU 平均利用率為 80%，設定目標為 40%。
   - 期望 Pod 數 = \`2 * (80% / 40%) = 4\` 個 Pod。

🔍 **防止擴縮容震盪 (Flapping / Cool-down)**
- 為了避免流量忽高忽低導致 Pod 頻繁創建與銷毀 (Flapping)：
- K8s 內建縮容冷卻時間 (Scale-down stabilization window，預設 5 分鐘)。

💡 **面試加分點**
- 說明自訂指標擴縮容：除了 CPU/Memory，更先進的做法是透過 **KEDA (Kubernetes Event-driven Autoscaling)** 根據 MQ (RabbitMQ/Kafka) 的 Queue 消息積壓數量進行微秒級 HPA。`,
    options: [
      "HPA 直接透過 ping 測試網路延遲來決定擴容與否",
      "HPA 透過 Metrics Server 定期收集數據，並依據目標利用率公式動態增減 Deployment 的 replicas 副本數",
      "HPA 只能改變 Pod 的 CPU Limit 大小，無法增加 Pod 的數量",
      "HPA 在流量下降時會秒級立即關閉所有 Pod，完全沒有冷卻等待期"
    ],
    correctIndex: 1,
    quizExplanation: "HPA 定期透過 Metrics Server 採集指標，根據 Target 利用率公式自動動態調節 Pod 的 Replicas 副本個數。"
  },
  {
    id: "devops-12",
    category: "K8s & Docker",
    difficulty: "Senior",
    title: "Kubernetes 中的 Node Affinity, Pod Anti-Affinity 與 Taints / Tolerations 的調度機制比較？",
    tags: ["Scheduling", "Affinity", "Taints", "Tolerations", "Kubernetes"],
    summary: "Affinity 是 Pod 吸引至特定 Node/Pod 旁；Taints 是 Node 排斥特定 Pod；Toleration 是 Pod 宣告容忍特定 Taint。",
    answer: `📌 **核心觀念**
K8s 的 **Kube-scheduler** 負責決定 Pod 應該落戶在哪個 Node 上。預設是自動尋找最空閒節點，但透過親和性 (Affinity) 與污點 (Taints) 能夠精準掌控調度哲學。

🔍 **三者概念對比**
1. **Node Affinity (節點親和性)**：
   - **Pod 的視角**：「我想要去擁有特定 Label 的 Node 上 (例如：擁有 \`gpu=true\` 或 \`disktype=ssd\` 的節點)」。
2. **Pod Anti-Affinity (Pod 反親和性)**：
   - **Pod 的視角**：「我絕對不要跟某些 Pod 擠在同一個 Node 實體上」。
   - **典型場景**：高可用 HA 部署。將相同的 Web API Pod 分散在不同的實體 Node 或 Availability Zone (AZ) 上，防止單點故障。
3. **Taints & Tolerations (污點與容忍)**：
   - **Taints (Node 的視角 - 排斥)**：「我有污點 (例如：\`node-role=master:NoSchedule\`)，預設拒絕所有 Pod 踏進來！」
   - **Tolerations (Pod 的視角 - 許可)**：「我有對應的容忍度 (Toleration)，所以我有權力踏入該污點節點」。

💡 **面試加分點**
- 區分 \`requiredDuringSchedulingIgnoredDuringExecution\` (硬親和：不滿足就 Pending) 與 \`preferredDuringSchedulingIgnoredDuringExecution\` (軟親和：盡量滿足，不滿足就找替代)。`,
    options: [
      "Taints 是 Pod 設定用來吸引特定 Node 的屬性",
      "Pod Anti-Affinity 能將相同服務的 Pod 強制分散在不同 Node 或 AZ 上，達到高可用 (HA) 防止單點故障",
      "Toleration 設定在 Node 上，用來拒絕未授權的 Pod",
      "Node Affinity 硬親和性在不滿足條件時依然會隨機找 Node 強制排程"
    ],
    correctIndex: 1,
    quizExplanation: "Pod Anti-Affinity 防止同類 Pod 聚集在同一節點，能有效將 Pod 分散於不同硬體/機架達成 HA 高可用性。"
  },
  {
    id: "devops-13",
    category: "K8s & Docker",
    difficulty: "Junior",
    title: "Kubernetes 的 Helm 包管理器是什麼？Chart, Values.yaml 與 Release 的關係？",
    tags: ["Helm", "Package Manager", "Charts", "Kubernetes"],
    summary: "Helm 是 K8s 的 APT/YUM 包管理器。Chart 是打包好的 YAML 模板；Values.yaml 儲存客製化參數；Release 是安裝後的實例。",
    answer: `📌 **核心觀念**
在 K8s 中部署一個應用往往需要撰寫 Deployment, Service, Ingress, ConfigMap 等一大堆 YAML。**Helm** 是 K8s 官方推薦的包管理器 (Package Manager)。

🔍 **Helm 三大核心概念**
1. **Chart (應用套件)**：
   - 一個包含 K8s YAML 模板檔案 (\`templates/\`) 與描述檔 (\`Chart.yaml\`) 的打包資料夾。可發布至 Helm Repository (如 Artifact Hub)。
2. **Values.yaml (參數設定檔)**：
   - 儲存所有可供客製化的參數變數（如 \`image.tag\`, \`replicaCount\`, \`db.password\`）。模板透過 \`{{ .Values.replicaCount }}\` 進行動態替換。
3. **Release (安裝實例)**：
   - 在 K8s 集群中運行中的 Chart 實例。透過 \`helm install <release-name> <chart>\` 生成。同一個 Chart 可以被安裝多次生成不同的 Release (如 \`dev-release\`, \`prod-release\`)。

💻 **常用指令**
\`\`\`bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-redis bitnami/redis -f custom-values.yaml
helm upgrade my-redis bitnami/redis
helm rollback my-redis 1 # 秒級版本回滾！
\`\`\`

💡 **面試加分點**
- 亮點功能：\`helm rollback\` 能在一秒內將整個複雜應用的所有 YAML 變更安全復原回前一次版本。`,
    options: [
      "Helm 是用來替換 K8s 控制面板 (Control Plane) 的編譯工具",
      "Values.yaml 存放可客製化變數，Templates 透過變數動態渲染生成最終的 K8s YAML 資源",
      "Release 代表打包好的唯讀 ZIP 檔案，無法被安裝至集群",
      "Helm 無法進行應用的版本升級與回滾 (Rollback)"
    ],
    correctIndex: 1,
    quizExplanation: "Helm 透過 Values.yaml 注入變數給 Templates，編譯成終端 YAML 並管理 Release 實例與回滾。"
  },
  {
    id: "devops-14",
    category: "K8s & Docker",
    difficulty: "Mid",
    title: "容器安全性最佳實踐：為何嚴禁在容器內使用 root 用戶？什麼是 Read-only Root Filesystem？",
    tags: ["Security", "Container Security", "Non-root", "OWASP", "Docker"],
    summary: "容器內以 root 執行若遭突破可能竄奪 Host 宿主機控制權；應設定 USER 10001 與 readOnlyRootFilesystem 實現最小權限。",
    answer: `📌 **核心觀念**
Docker 容器實質上是 Host 宿主機 Linux 系統上的一個**受隔離進程 (Isolated Process)**。預設情況下，容器內部進程如果以 **\`root\` (UID 0)** 身份執行，極度危險！

⚠️ **Root 用戶容器漏洞**
- 若容器內部遭黑客攻陷 (例如零日漏洞 RCE)，攻擊者一旦突破容器隔離 (Container Escape)，他將**直接擁有 Host 宿主機作業系統的完全 ROOT 控制權**！

🛡️ **四大容器資安強化最佳實踐**
1. **以非 root 隨機 UID 執行 (Run as Non-root)**：
   - Dockerfile 加入 \`USER 10001\`。
   - K8s SecurityContext: \`runAsNonRoot: true\`, \`runAsUser: 10001\`。
2. **只讀根檔案系統 (Read-only Root Filesystem)**：
   - 設定 \`readOnlyRootFilesystem: true\`。防範黑客入侵後下載並寫入木馬腳本或修改 system 二進位檔。
   - 若程式需要寫暫存檔，改為掛載臨時 \`emptyDir\` 到 \`/tmp\`。
3. **丟棄所有 Linux Capabilities (Capabilities Dropping)**：
   - \`capabilities: drop: ["ALL"]\`。

💻 **K8s SecurityContext 範例**
\`\`\`yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 10001
    readOnlyRootFilesystem: true
    capabilities:
      drop: ["ALL"]
\`\`\`

💡 **面試加分點**
- 提及鏡像資安掃描工具：使用 **Trivy** 或 **Grype** 在 CI/CD 流水線中掃描基礎鏡像的 CVE 漏洞。`,
    options: [
      "容器內的 root 用戶與宿主機的 root 用戶完全沒有任何資安關聯，盡管使用",
      "容器應設定以非 root (Non-root) 身份運行，並設置 Read-only Root Filesystem 防止黑客寫入木馬",
      "readOnlyRootFilesystem 會導致容器無法將 Log 印到 stdout",
      "capabilities: drop: ['ALL'] 會導致 CPU 無法進行算術運算"
    ],
    correctIndex: 1,
    quizExplanation: "Non-root USER 搭配唯讀 Root 檔案系統是容器安全防禦邊界核心，杜絕容器逃逸與木馬植入風險。"
  },
  {
    id: "devops-15",
    category: "K8s & Docker",
    difficulty: "Senior",
    title: "Kubernetes CNI (Container Network Interface) 的運作原理？Flannel 與 Calico (BGP/IP-in-IP) 的網路模式對比？",
    tags: ["CNI", "Networking", "Calico", "Flannel", "Kubernetes"],
    summary: "CNI 提供跨 Pod 通訊封包路由。Flannel 採用簡單 Overlay (VXLAN) 覆蓋網路；Calico 採用原生 BGP 路由與 NetworkPolicy 微隔離。",
    answer: `📌 **核心觀念**
Kubernetes 網路模型要求：**所有 Pod 可以在不需要 NAT 的情況下直接與任何其他 Pod 跨 Node 通訊**。K8s 本身不包含網路實作，而是透過 **CNI (Container Network Interface)** 外掛規格由第三方套件提供。

🔍 **兩大主流 CNI 對比**
1. **Flannel (簡單極簡)**：
   - **架構**：採用 **Overlay Network (覆蓋網路)** 模式（預設 **VXLAN** 封包 UDP 封裝）。
   - **優點**：極易安裝、設定簡單。
   - **缺點**：封包進行了額外的 UDP/VXLAN 封裝與解包開銷，效能稍遜，且**完全不支援 NetworkPolicy** (安全微隔離)。
2. **Calico (企業級高效能 & 安全)**：
   - **架構**：採用 **純三層 L3 BGP (Border Gateway Protocol)** 路由模式，封包無須 Overlay 封裝，直達硬體路由器。
   - **優點**：
     - **接近原生硬體網卡效能 (Bare-metal Speed)**。
     - **強大 Security**：完美支援原生 K8s **NetworkPolicy**（可定義 Pod 層級的防火牆規則，如阻擋 Frontend 直連 DB）。

💡 **面試加分點**
- 介紹次世代 CNI **Cilium**：利用 Linux 核心 **eBPF (Extended Berkeley Packet Filter)** 技術，繞過 iptables 進行微秒級超高效能封包路由與可觀察性。`,
    options: [
      "Flannel 是效能最高且原生支援網路安全 Policy 的 CNI",
      "Calico 支援純三層 BGP 路由模式，提供極高效能與 K8s NetworkPolicy 網路防火牆隔離能力",
      "CNI 外掛要求所有 Pod 必須經過 NAT 才能互相連線",
      "Cilium 採用傳統的 iptables 規則來實現底層連線"
    ],
    correctIndex: 1,
    quizExplanation: "Calico 採用三層 BGP 路由與完整 NetworkPolicy 防火牆微隔離支援，是企業級高架構 CNI 首選。"
  },
  {
    id: "devops-16",
    category: "K8s & Docker",
    difficulty: "Mid",
    title: "Kubernetes Operator Pattern (算子模式) 與 CRD (Custom Resource Definition) 的架構設計動機？",
    tags: ["Operator Pattern", "CRD", "Controller", "Kubernetes Architecture"],
    summary: "CRD 擴充 K8s API schema；Operator 結合 CRD 與自訂 Control Loop，將維運專家經驗(如自動備份、故障轉移)代碼化。",
    answer: `📌 **核心觀念**
Kubernetes 的核心設計哲學是 **聲明式 API (Declarative API) + 控制迴圈 (Control Loop)**。**CRD (Custom Resource Definition)** 允許我們擴充 K8s 的原生 API 物件，而 **Operator** 則是將**維運工程師的知識與經驗自動化代碼化**。

🔍 **CRD + Controller = Operator Pattern**
1. **CRD (自訂資源定義)**：
   - 定義一個新的 API 資源類型。例如定義 \`kind: MySQLCluster\`。
2. **Operator (控制器代碼)**：
   - 一個在集群內運行的自訂 Controller，持續監聽 CRD 的狀態改變 (\`Watch API\`)。
   - **維運自動化**：當發現聲明了 \`MySQLCluster\` 時，Operator 會自動建立 Master/Slave Pod、配置主從同步、定時快照備份、在 Master 宕機時自動進行 Failover 故障轉移與數據修復！

💻 **著名開源 Operator 案例**
- **Prometheus Operator**：自動管理 Prometheus 監控實例與告警規則。
- **Strimzi Kafka Operator**：一鍵部署與擴容高可用 Kafka 集群。

💡 **面試加分點**
- 說明開發 Operator 的主流框架：**Kubebuilder** 與 **Operator SDK** (基於 Go 語言)。`,
    options: [
      "CRD 用於取代 Dockerfile 進行容器構建",
      "Operator Pattern 將維運專家經驗 (如自動備份、故障轉移) 編寫為 Controller 代碼，實現複雜應用自動化維運",
      "K8s 原生只支援 Deployment，無法手動擴充自定義 API 資源",
      "Prometheus Operator 只能用在 Windows 伺服器上"
    ],
    correctIndex: 1,
    quizExplanation: "Operator 模式結合 CRD 與自訂 Control Loop，將有狀態複雜應用 (如 DB/Kafka) 的極致維運自動化。"
  },
  {
    id: "devops-17",
    category: "K8s & Docker",
    difficulty: "Junior",
    title: "Docker 網路模式 (Bridge, Host, None) 有何區別？在什麼情境下使用 Host 網路模式？",
    tags: ["Docker", "Networking", "Bridge", "Host Mode"],
    summary: "Bridge 透過網橋隔離網路與 Port 映射；Host 直接共享宿主機 Network Namespace (效能最高)；None 徹底隔離無網路。",
    answer: `📌 **核心觀念**
Docker 提供了多種網路驅動模式 (Network Drivers) 來提供容器間與外網的連線能力。

🔍 **三大常見 Mode 對比**
1. **Bridge Mode (網橋模式 - 預設)**：
   - Docker 在宿主機建立虛擬網橋 (\`docker0\`)。
   - 容器擁有獨立的 IP 與 Network Namespace。透過 \`-p 8080:80\` 進行 **NAT Port 映射** 與外網通訊。
2. **Host Mode (宿主機模式)**：
   - 容器**不進行任何網路隔離**，直接共享宿主機的 Network Namespace 與 IP。
   - 容器內監聽 80 埠，宿主機的 80 埠就直接被佔用，**無需經過 NAT 轉發**。
   - **優點**：消除 NAT 開銷，獲得極致的網路 throughput 與低延遲。
   - **適用**：極致效能敏感服務（如高頻交易、大流量 API 網關）。
3. **None Mode (無網路)**：
   - 容器完全關閉網路功能，僅保留 \`loopback\` (127.0.0.1)。
   - **適用**：離線密碼學計算、極高安全隔離任務。

💡 **面試加分點**
- 提醒：使用 Host 模式時，容器間的 Port 容易發生衝突，且容器失去了網路安全隔離障壁。`,
    options: [
      "Bridge 模式下容器直接與宿主機共享相同的 IP，無須 NAT 轉發",
      "Host 模式直接共享宿主機 Network Namespace，消除 NAT 開銷以獲得極致網路效能",
      "None 模式會自動幫容器申請公網 IP",
      "Bridge 模式下不同容器之間無法進行任何連線"
    ],
    correctIndex: 1,
    quizExplanation: "Host 模式讓容器直接共享宿主機 Network Namespace，免除 NAT 轉換開銷，提供原生網卡速度與極低延遲。"
  }
];
