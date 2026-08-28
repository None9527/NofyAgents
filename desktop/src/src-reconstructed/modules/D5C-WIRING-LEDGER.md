# D5c 接线账本 — 任务路端到端跑通 nofy 内核（initial，留 TODO）

日期：2026-08-27
范围：`ref-ui/zcode-restored`（out/main de-minified；renderer↔host IPC 契约见
Stores.report.md / SYMBOL-INDEX.md / rendererEntry.report.md）。
品牌：桌面端文案一律 nofy（grok-build 仅为上游源仓库名）。

## 0. 结论

任务路（项目作用域会话线程）已端到端跑通 nofy 内核：
composer 发送 → host（ZCode Protocol stdio）→ `acp-agent-adapter` → ACP（ws 9800）
→ nofy 内核执行工具 → session/update 流 → v4/conversation/frame 推送 →
renderer 会话流渲染用户消息、turn 头、**工具块（`$ echo nofy-ok` + 输出 `nofy-ok`）**、助手文本。
验证截图：`/tmp/d5c-e2e-final2.png`（工具块展开态）。

## 1. 拓扑

```
┌────────────────────────── renderer (ZCode UI, nofy 文案) ──────────────────────────┐
│  会话视图 v4：FrameAssembler + conversation/<sid> 订阅；sidebar sessions-index/<ws> │
└──────────────▲───────────────────────────────────────────────────▲─────────────────┘
               │ MessagePort（34 服务，原契约不变）                  │ v4/command（createSession/
               │ v4/conversation/frame 推送（原推送通道）             │  sendText/stop/resolveInteraction）
┌──────────────┴───────────────────────────────────────────────────┴─────────────────┐
│ host 进程 out/host/index.js（zcode-agent-service / zcode-session-service 原样）     │
│   ZCodeAgentProcessManager spawn:  env ZCODE_AGENT_SERVER_COMMAND=/usr/bin/node    │
│                                    env ZCODE_AGENT_SERVER_ARGS_JSON=[adapter]       │
└──────────────▲───────────────────────────────────────────────────▲─────────────────┘
               │ stdio ndjson（ZCode Protocol：v4/*、session/*、workspace/*）          │
┌──────────────┴────────────────────────────────────────────────────────────────────┐
│ out/main/seam/acp-agent-adapter.js（被删 host agent 服务的替代＝推送重建言）          │
│   · ZCode Protocol server（stdio）：subscribe/ack、rowsRange、resync、v4/command、   │
│     session/create|resume|read|list|send|stop、workspace/* 结果按 host zod 形状      │
│   · v4 帧发射：wireVersion=3、kind=complete、deliveryKind initial/online/recovery； │
│     topics: conversation/<sid>、sessions-index/<ws>、workspace-config/<ws>          │
│   · rows 映射：turnHeader/userInput/assistantText(流式 row.delta)/toolCall(行+输出)  │
│   · load replay + 高水位：session/load 回放重建 rows；per-topic seq 单调             │
│   · 权限内联：ACP session/request_permission → pendingInteractions（je）→           │
│     renderer 内联审批 → v4/command resolveInteraction → ACP outcome 应答            │
└──────────────▲────────────────────────────────────────────────────────────────────┘
               │ ACP over WebSocket（ws://127.0.0.1:9800/ws?server-key=…）
┌──────────────┴────────────────────────────────────────────────────────────────────┐
│ nofy 内核（~/.local/bin/nofy agent serve --bind 127.0.0.1:9800 --secret …）          │
│ 由 out/main/seam/kernel-supervisor.js 于 main 启动时 发现-否则-启动                   │
└────────────────────────────────────────────────────────────────────────────────────┘
```

main 进程（out/main/index.js 顶部）：import kernel-supervisor；设置 host spawn env；
`ensureKernel()` 异步启动/附着内核；父退子收（exit/SIG* kill 子进程）。

## 2. 发现-否则-启动（kernel-supervisor.js）

顺序：① env `NOFY_SOCKET`（unix socket 探针）→ ② 应用数据目录 socket 文件
（`~/.local/share/nofy-desktop/kernel.sock` 探针）→ ③ `ws://127.0.0.1:9800` TCP 探针
（standalone 优先附着）→ ④ spawn `nofy agent serve --bind 127.0.0.1:9800 --secret …`。
状态文件 `~/.local/share/nofy-desktop/kernel.json`（pid/url/secret/mode）；
防双 kernel：端口探针 + pidfile（仅回收 desktop-spawned 的陈旧 pid）；
父退子收：exit/SIGINT/SIGTERM/SIGHUP kill 子进程（已实测：pkill zcode 后 9800 释放）。

## 3. 关键协议事实（逆向所得，供后续里程碑）

- host subscribe params **不带** subscriptionId：由 agent 生成并经 `ack.subscriptionId`
  回传；host `rememberV4SubscriptionRoute(topic, ack.subscriptionId, connectionId)`。
- wire frame（complete）superRefine 要求 `frame.topic/subscriptionId` 与外层一致。
- host 结构化日志会丢弃 host 原始 stdout（console.log 不可见）；调试需文件落盘。
- workspace/* 结果 zod：updateInteractionPreferences→{workspace,
  askUserQuestionAutoResolutionEnabled, snoozedInteractionCount}；
  updateProviderRegistry→{workspace, appliedProviderRevision, status:"applied", providerCount}；
  readState/setDefault*→{workspace, settings:{model:{current,available},thoughtLevel,mode}}。
- renderer 工具块：toolCall 行需 `input`（对象，含 command）+ shell 族 toolName
  （`run_terminal_command`/`bash` 等命中 ^(?:execute|run|exec|bash|shell|command|terminal)(?:_|$)）
  才渲染 ShellToolView（`$ 命令` + 输出）；输出取 `output.text`。
- turn 头默认折叠工具步；点击 `tool-summary-trigger-*` 展开。

## 4. 文件清单

- 新增 `out/main/seam/kernel-supervisor.js`（ESM；发现序/spawn/回收/防双）
- 新增 `out/main/seam/acp-client.js`（Node ACP client：initialize/list/new/load/prompt/
  cancel/request_permission 应答；事件 update/sessions/replayed/permission）
- 新增 `out/main/seam/acp-agent-adapter.js`（ZCode stdio ↔ ACP 桥；v4 帧/rows/replay/权限）
- 修改 `out/main/index.js`（顶部 seam import + host spawn env + ensureKernel）
- 修改 `out/main/seam/nofy-backend.js`（TODO(D5c) 注释结案）
- 修改 `out/host/index.js`（仅临时调试探针，已**全部移除**，净改动 0）
- 验证辅助 `d5c-send2.mjs`、`d5c-console.mjs`（CDP 驱动；可留可删）

## 5. 验证记录

- `pkill -x zcode` → 重启（`--open-workspace /home/none/grok-build`）：
  supervisor `spawned`（首次）/`attach-9800`（复用 standalone）；父退子收实测。
- CDP 发送「用 bash 执行 echo nofy-ok」：createSession(ACP session/new, cwd=项目路径,
  scope=task) → sendText(ACP session/prompt) → 工具块 `$ echo nofy-ok` + 输出 `nofy-ok`
  + 助手文本渲染（截图 /tmp/d5c-e2e-final2.png、/tmp/d5c-final5.png）。
- `node --check`：index.js / kernel-supervisor / acp-client / acp-agent-adapter / host 全过。

## 6. TODO 清单（initial 边界）

1. unix socket 传输：`nofy agent serve` 仅 TCP bind；NOFY_SOCKET/应用数据 socket 仅探针记档。
2. 助手路：session scope 参数 kernel 层已预留（`session/new._meta.nofy.session.scope='task'|'os'`，
   默认 task）；UI 不动，待助手路里程碑。
3. 权限内联 UI 全链路点击验证未做（内核当前配置未触发 request_permission；映射代码已就位：
   pendingInteractions ⇄ resolveInteraction  ACP outcome）。
4. reasoning（agent_thought_chunk）行未渲染；attachments v4/* 回 -32601；
   usage/plans/fileChanges 等返回空壳。
5. ~~sidebar 任务列表（sessions-index）帧已通但 UI 未显示条目（renderer 侧过滤待查）。~~
   **已结案（2026-08-27，FIX-WS/FIX-RESUME）**：根因不在 renderer 过滤，见 §7。
6. composer 聚焦需 CDP 辅助（contenteditable 初始 false）——疑似 renderer 对
   snapshot.control 的 gating 细节，待查（不影响协议路）。
7. secret 固定 `nofy-desktop`（dev）；待轮换/随机化 + 应用数据目录权限收紧。
8. 多 workspace 并发会话、session/resume 跨重启的 rows 续接（replay 已具备，未压测）。

## 7. FIX-WS / FIX-RESUME（2026-08-27）：项目段展开见任务行 + resume 风暴根除

### 7.1 缺陷与根因

**缺陷1（验收硬指标）**：项目分段展开 Z-Image 显示「暂无任务」。
**缺陷2**：启动时 host 对存量 session 逐个 `session/resume`，adapter 响应缺
ZCode Protocol 必填字段，host zod 校验失败巨量刷屏（单次运行 31 万+行，曾写满磁盘）。

根因链（两者同源）：

1. **初始快照空窗**：adapter 对 `sessions-index/<ws>` 订阅**先发空初始快照**，
   随后 `workspace_list` 异步到达，存量会话以 **online deltas** 逐行补发。
2. **host 对 delta 新行走 resume**：task-index syncer `applySessionsIndexFrame`
   仅对**首个快照**走 `seedMissingRowsFromInitialSnapshot`（直接 seed，不 resume）；
   之后的 online 新行走 `processSummary` → `session.became-visible` →
   `resyncTaskIndexRowFromAgent` → **逐行 `session/resume`**（＝风暴来源）。
3. **resume 响应形状不全**：host 对 `session/create|resume|read|setModel|
   setThoughtLevel|setMode` 的响应共用同一严格 zod schema（host chunk
   `chunk-O5YHTQBW.js` 的 `Vr`：`protocol{name:"ZCode Protocol",version:1}/
   session{workspace,sessionKind,title,mode,status,createdAt,updatedAt,…}/
   settings{model.available,thoughtLevel,mode}/projection/runtime/messages`，
   且 `traceId` 为 optional string——`null` 亦非法）；旧响应只有
   `{session:{sessionId,traceId:null},messages:[],settings:{model:{current}}}`
   → 校验失败 → resume 抛错 → **task index 行永不落库** → 已打开 workspace 的
   任务列表空（「暂无任务」）；同时 host `Se.warn` 全量 zod issues 逐行日志
   × main host-log 中继多份拷贝 → 刷屏写盘。
4. **main 侧枚举回退**：`workspace-registry.js` 的 ACP client 懒连接，首次
   renderer 调用时恰遇启动期 host-log 洪峰拥塞事件循环，5s ready 预算超时 →
   回退目录扫描（3400+ 条含 /tmp 测试残留），且按正常 TTL 缓存不回主路。

### 7.2 修复落点（标记 `// FIX-WS` / `// FIX-RESUME`）

`out/main/seam/acp-agent-adapter.js`：
- **FIX-RESUME** `zcodeSessionSnapshot(s, cwd)`：按 host `Vr` schema 构造完整
  会话快照（`protocol`/`session`（workspace 对象、sessionKind:'interactive'、
  title 回退链、mode:'build'、status 随 phase、ms 时间戳、省略 traceId）/
  `settings`（model.available:[]、thoughtLevel、mode）/`projection`/`runtime`/
  `messages:[]`）；`session/create|resume|read` 与 `session/setModel|
  setThoughtLevel|setMode|updateRuntimeModelConfig` 全部改用之。
- **FIX-WS 懒加载先于快照**：`sessions-index/<ws>` 订阅改为先
  `ensureWorkspaceIndexLoaded(wid)`（ACP `workspace_list` 静默回填，4s 兜底）
  再发初始快照——存量行**进快照不进 deltas**：host 走 seed 路（不 resume），
  renderer SessionIndexStore 展开即见行。`populateFromSummaries/
  populateFromSessionList` 静默填充（不发帧）；`backfillAllIndexes` 并发去重、
  完成即释放可再触发；`workspaceState.loaded` 标记。
- **FIX-RESUME 日志节流**：`logOnce(key, …)` 同键只记一次（handler error 按
  方法+消息、session/load 失败按会话、回填失败按类别）。

`out/main/seam/workspace-registry.js`：
- **FIX-WS** `registerWorkspaceRegistry()` 注册即预连 ACP（不等首调）；
  dir-scan 回退按 3s 短负缓存（尽快回 ACP 主路）；目录扫描按 mtime 排序、
  上限 200 行（防 /tmp 残留灌满侧栏）。

不改：renderer（`WsEnumUseWorkspaceSessions` 展开 acquire 逻辑已就位）、
host（净改动保持 0）、preload。

### 7.3 验证（本次）

- `node --check` × 6 seam 文件 + main/index.js；esbuild 0.28.2 parse 0 错。
- `pkill -x zcode` 重启（后台，日志 → /tmp/fixws.log）：
  - 项目段展开 Z-Image → 见 `01a03f76…`（4D-RoPE）行（截图存档）；
  - 点击打开 → 会话头 chip=Z-Image（截图存档）；
  - `/tmp/fixws.log` `grep -c 'session/resume 失败'` ≈0（风暴根除）。
