# ZCode 3.7.6 重构方案

本方案基于对 `ZCode-3.7.6-linux-x64.deb` 的完整复原（见本目录其余文档）。
所有结构决策均以复原证据为依据；重构过程中的行为正确性以复原产物
（`../out/`，已通过真实 Electron 启动验证）为参照。

---

## 1. 目标与原则

**目标**：重建一个可维护的 TypeScript 源码工程，行为对齐 ZCode 3.7.6。

**原则**：
1. **证据驱动**：模块划分、接口签名、通道命名全部来自复原产物（符号表、
   IPC 契约、SQL schema、API 面），不凭空设计。
2. **行为对齐**：复原代码是事实规范（spec）。每个重写模块以复原版本的
   输入/输出行为为验收标准。
3. **契约先行**：进程间契约（IPC、preload API、服务协议、DB schema）先于
   实现固化成类型化共享包，之后各进程实现都对着契约编程。
4. **不做的事**：不虚构原项目没有的功能；不猜测无法证实的实现细节
   （这类点在代码中以 TODO(evidence) 标注并引用复原位置）。

## 2. 目标架构

### 2.1 工程形态：pnpm monorepo

证据：`package.json` 的 7 个 `workspace:*` 依赖；bundle 中泄漏的
`apps/zcode-cli/packages/cli/src/main.ts` 路径。

```
zcode/
├── pnpm-workspace.yaml
├── apps/
│   ├── desktop/                  # @zcode/desktop —— 本 Electron 应用
│   │   ├── src/
│   │   │   ├── main/             # 主进程（对应 out/main）
│   │   │   ├── preload/          # 3 个 preload（对应 out/preload）
│   │   │   ├── host/             # host 服务进程（对应 out/host）
│   │   │   ├── scheduler/        # 调度进程（对应 out/scheduler）
│   │   │   └── renderer/         # React 19 UI（对应 out/renderer）
│   │   └── electron.vite.config.ts
│   └── zcode-cli/                # CLI/agent 运行时（对应 resources/glm/zcode.cjs）
│       └── packages/cli/         # 泄漏路径证实的结构
└── packages/
    ├── rpc/        # @zcode/rpc：IPC 通道常量 + window.zcode 类型 + 服务协议
    ├── shared/     # @zcode/shared：配置/路径/环境/本地化等纯函数
    ├── server/     # @zcode/server：host 服务运行时框架
    ├── services/   # @zcode/services：领域服务（automation/usage/remote…）
    ├── client/     # @zcode/client：renderer 侧 API 客户端
    ├── ui/         # @zcode/ui：React 组件库（tooltip/button 等原语）
    └── e2e-report/ # @zcode/e2e-report：E2E 遥测桥（preload 中已见其契约）
```

### 2.2 技术栈（全部有产物证据）

| 选型 | 证据 |
|---|---|
| TypeScript + ESM | `package.json` `"type": "module"`；bundle 为 ESM |
| electron-vite 类构建 | `out/{main,preload,renderer}` 布局、chunk 哈希命名、preload 输出 .cjs |
| React 19 + jsx-runtime | `react@^19.2.4` 依赖；jsx-runtime chunk |
| node:sqlite | host bundle 中 SQLite 实验特性警告 + 完整 schema |
| electron-updater | `electron-updater@^6.8.3` + app-update.yml |
| node-pty / ssh2 | unpacked 原生预编译模块 |
| ws / undici / yaml / yazl / semver / node-forge | bundle 外部导入清单 |
| playwright-core | 依赖清单（CUA 计算机操作能力） |
| shiki + CodeMirror + mermaid + katex + roughjs | renderer chunk 名（300+ 语法/主题 chunk） |

### 2.3 进程模型（复原确认）

```
┌ main（桌面壳）──────────────────────────────────────┐
│ 窗口/菜单/托盘 · 自动更新 · OAuth · 内置浏览器 ·      │
│ 深链 · 崩溃捕获 · ARMS 遥测 · 设备/编辑器集成         │
└──────┬─────────────────────────────┬───────────────┘
   IPC │ 506 通道                 启动/服务端口
┌──────▼──────┐  ┌───────────────┐  ┌───────────────┐
│ renderer ×2 │  │ host 服务进程  │  │ scheduler 进程 │
│ 主窗口 +     │  │ 自动化/任务 ·  │  │ （定时触发）    │
│ 进程监视器   │  │ 远程工作区 ·   │  └───────────────┘
└─────────────┘  │ 用量/订阅 ·    │
                 │ git/仓库服务   │
                 └───────────────┘
zcode-cli（glm 运行时）：agent 会话 · 工具调用 · MCP · 技能/插件
```

## 3. 契约层（P0 机械生成，全部有完整复原）

| 契约 | 复原来源 | 重构形态 |
|---|---|---|
| 506 个 IPC 通道（标签+字符串） | `docs/ARCHITECTURE-MAP.md` §2 | `@zcode/rpc` 常量 + 每通道请求/响应类型 |
| window.zcode API（117 方法→通道） | `docs/PRELOAD-API.md` | preload 实现 + renderer 客户端接口 |
| host 服务协议（init-local/init-remote/attach-service-port/broadcast/cron-run 等 25 个命令） | `docs/ARCHITECTURE-MAP.md` §2（hC 枚举） | `@zcode/server` 协议类型 |
| SQLite schema（automations/automation_runs/tasks/task_groups + 索引） | `docs/ARCHITECTURE-MAP.md` §3 | 迁移脚本 + 类型化 DAO |
| 355 个外部端点 | atlas.json urls | 端点常量模块（按服务分组） |

## 4. 模块清单（按复原符号领域聚类，19,323 个已恢复名称）

### 4.1 main 进程（out/main，1,746 符号）
| 模块 | 符号量 | 代表函数 |
|---|---|---|
| window/desktop 窗口与桌面 | 276 | `migrateCloseToTrayOnWindowsDefault`, `resolveTerminalWindowsPtyInfo` |
| oauth/auth 认证 | 242（部分） | `buildZaiOAuthUrl`, `resolveZaiOAuthOrigin` |
| update 自动更新 | 120 | `getForceUpdateMinimalVersionFromConfig`, `handleStateUpdated` |
| embedded-browser 内置浏览器 | 114 | `createBrowserControlMainBridge`, `resolveWebRemoteControlRelayWsUrl` |
| telemetry/log 遥测 | 228（部分） | `generateTraceId`, `createSessionTraceId` |
| config/path 基础 | 1,094（部分） | `getDataBaseDir`, `getZCodeDataRootDir`, `normalizeZCodeEnv` |

### 4.2 host 进程（out/host，3,114+ 符号）
| 模块 | 符号量 | 代表函数 |
|---|---|---|
| remote-workspace 远程工作区 | 531 | `DockerBackend`, `parseDockerContainerList`, `normalizeRemotePlatform` |
| automation/task 自动化 | 325 | `deriveZCodeTaskStatusFromSessionSnapshot`, `resolveTaskKind` |
| usage/billing 用量计费 | 232 | `isZaiCodingPlanProviderId`, `parseBigModelTeamPlanConnectionKey` |
| database/data 数据层 | 210 | `ensureRepositoryAvailable`, `createGitCheckpointRepo` |
| service/ipc 服务框架 | 90 | `encodeRpcJsonValue`, `probeServiceEndpoint` |

### 4.3 zcode-cli / glm 运行时（resources/glm/zcode.cjs，10,563 符号——最大单体）
| 模块 | 符号量 | 代表函数 |
|---|---|---|
| session/conversation 会话 | 584 | `getConversationMessageProjectionPolicy`, `isZCodeCompactSummaryMessage` |
| skill/plugin 技能与 agent | 651 | `resolveZCodeAgentStartupReadiness`, `getZCodeAgentAvailableModes` |
| mcp/tools 工具调用 | 424 | `getRuntimeToolRuntime`, `buildZCodeStreamingToolInputPreview` |
| file/preview 文件操作 | 332 | `collectFileChanges`, `computeFileSha256` |
| config/path | 1,094（部分） | `resolveRuntimeZCodeEnv`, `createModelProviderModelConfig` |

### 4.4 renderer（out/renderer，757 chunk；符号名未保留，结构来自 JSX 还原 + chunk 名）
| 功能组 | 依据 |
|---|---|
| 应用外壳与路由 | index-*.jsx（入口）、process-monitor 窗口 |
| 用量统计面板 | usageStatsUiParts、AppUsage*Chart、CodingPlanUsageLineChart |
| Office 预览 | previewPaneOffice{Docx,Xlsx,LegacyDoc}Content、pptxRendererPreviewEngine |
| 编辑器支持 | imeComposition、keyboardShortcuts、diffs.worker、CodeMirror 语言包 |
| UI 原语库 | button、tooltip 等（33 个 JSX 视图已还原组件结构） |
| 渲染增强 | katex、mermaid 全系图表、rough.esm、pdf.js |

## 5. 阶段与里程碑

**P0 脚手架 + 契约层**（可立即开始，大部分机械生成）
- monorepo 骨架、tsconfig、electron-vite 配置、electron-builder 配置
  （后两者已有重建版可直接采用）
- 从 atlas.json 生成 `@zcode/rpc`：506 通道常量 + 117 个 preload API 类型
  + host 服务协议类型
- SQL schema → 迁移文件
- ✅ 完成标准：`pnpm build` 产出与原 out/ 同构的空壳；契约包单测对照
  atlas 全量断言（通道数、方法数、schema 列数）

**P1 main 进程地基**
- 日志、崩溃捕获、配置/路径（`getDataBaseDir` 等全套路径函数）、
  深链注册、ARMS 初始化
- ✅ 完成标准：**启动对齐测试**——新构建在 Electron 下启动，日志序列与
  参照实现一致（crash-capture → deep-link → arms → sqlite）

**P2 窗口系统 + IPC 全量注册**
- 主窗口/进程监视器窗口、菜单、托盘、窗口 chrome 控制
- 506 个通道 handler 骨架全部注册（未实现的显式抛 unimplemented），
  通道集合与 atlas 断言一致
- ✅ 完成标准：renderer 空壳加载成功，preload 桥接 117 方法全部可调用

**P3 host 服务 + 自动化调度**
- 服务协议落地（init-local/attach-service-port/…）
- automations/tasks 数据层（schema 已有）+ cron 调度 + 分发/重试队列
- ✅ 完成标准：创建定时任务 → 触发 → 运行记录入库，与参照行为一致

**P4 renderer 外壳 + UI 组件库**
- @zcode/ui：从 33 个 JSX 视图提取组件原语（tooltip/button/dialog…）
- 主窗口路由、国际化骨架（IntlProvider/defaultLocale 已知）
- ✅ 完成标准：启动画面 + 空主界面渲染，与原版视觉一致

**P5 功能模块（按价值排序逐个移植）**
1. 会话/agent 核心（cli 运行时接入）
2. 用量统计面板（契约完整，纯 UI+IPC）
3. Office 预览
4. 远程工作区（SSH/WSL/Docker）
5. 内置浏览器 + Web 远程控制
6. 自动更新全流程
- 每个模块：先写对着复原行为的测试，再重写实现

**P6 zcode-cli + glm 插件系统**
- 10,563 符号的最大单体，独立子项目推进
- 插件加载机制按 resources/glm 实物复原（7 个插件包结构完整）

**P7 打包对齐**
- electron-builder 产出 deb，与原始包做结构对比（control 字段、
  resources 布局、unpacked 预编译）
- ✅ 完成标准：新 deb 通过原 verify.mjs 的同类审计

## 6. 验证策略

1. **行为对齐**：复原实现是可运行的参照系。关键路径（启动、IPC 调用、
   任务调度）对比两者的日志/响应。
2. **契约断言**：通道集合、API 面、schema 与 atlas 数据做自动化断言，
   防止重构漂移。
3. **单元测试**：以复原函数为规范编写（例如 `normalizeWindowsComparablePath`
   的边界行为直接从复原代码提取测试用例）。
4. **锚定资产**：`zcode-src`（字节级副本）+ `zcode-restored`（可读参照）
   永久保留，任何重构疑问回溯到它们。

## 7. 风险与开放问题

| 风险 | 缓解 |
|---|---|
| renderer 内部逻辑无符号名，重写难度最高 | JSX 视图 + chunk 模块名 + IPC 契约 triangulate；先做契约明确的模块 |
| glm CLI 体量巨大（10,563 符号） | 独立子项目、独立里程碑，不阻塞桌面端 |
| 486 个第三方依赖仅 27 个是运行时外部依赖 | 其余已被打包进 bundle，重写时按需重新选型（见 2.2 证据表） |
| 部分通道 handler 的请求/响应类型无法静态确定 | 类型先标 `unknown` + TODO(evidence)，在 P5 移植各模块时逐个夯实 |
| 原项目的构建脚本/CI 完全缺失 | 以产物特征反推的配置（已有重建版）为准，不追求与原 CI 一致 |

## 8. 确认后的第一步

1. 创建 `zcode/` monorepo 骨架 + `pnpm-workspace.yaml`
2. 生成 `@zcode/rpc` 契约包（通道常量 + preload API 类型 + 服务协议）
3. 生成 SQL 迁移文件
4. 契约断言测试（对照 atlas 数据）
5. 空壳 `pnpm build` 通过

## 9. 进度记录

范围确认（2026-08-14）：**只做端侧，UI/UX 完整优先**。renderer 视觉与
交互完整性为第一优先级，renderer-baseline 作为像素级参照永久保留。

P0 已完成：
- [x] monorepo 骨架：`/home/none/zcode/zcode/`（apps/desktop、apps/zcode-cli、
      packages/{rpc,shared,ui,server,services,client,e2e-report}）
- [x] renderer 视觉基线：`apps/desktop/renderer-baseline/` —— 完整 shipped
      renderer 面（2,146 文件：CSS/字体/1146 SVG/pdfjs/HTML），md5 校验字节级一致
- [x] `@zcode/rpc` 契约包（全部由 atlas 数据生成，无手写值）：
      123 个 IPC 通道常量、24 个 host 服务协议命令、32 个 agent 事件、
      window.zcode 113 方法接口（含通道映射 JSDoc）
- [x] SQL 迁移：`apps/desktop/src/host/db/migrations/0001_init.sql`
      （automations/automation_runs/tasks/task_groups + 索引，逐字复原）
- [x] 契约断言测试：`packages/rpc/test/contract.test.mjs`，对照复原 docs
      全量断言，`RESULT PASS`
- [x] desktop 应用包：package.json（26 个原始依赖照搬）、electron.vite 配置、
      两个 HTML 入口（shipped 原文）、renderer bootstrap 壳

下一步（P4 提前，UI/UX 优先）：
1. ~~从 33 个 JSX 视图提取 UI 原语进 `packages/ui`~~ → 已被更优路径取代：
   复原 JSX 视图直接作为新工程 renderer 源码运行（见下）
2. ~~设计 token 提取~~ ✅ 462 个 CSS 变量 → `zcode/packages/ui/design-tokens.json`
   + `packages/ui/src/theme/tokens.css`
3. i18n 文本层 ✅ 4,495 条消息 → `zcode/packages/ui/src/i18n/zh-CN.json`

## 10. UI 1:1 验证闭环（2026-08-14 完成）

新工程 `zcode/apps/desktop/src/renderer/` 直接以复原 JSX 视图为源码：
- 757 个 chunk 模块保持 shipped import graph，转换模块统一 `.jsx` 通道
  （esbuild JSX 转换，语义保持）；2,753 处模块引用机械重写
- 在真实 Electron 运行时 + 真实 preload/主进程 IPC 下加载新 renderer
- CDP 截图与真实应用参照图像素对比：**99.57% 匹配**（0.43% 差异全部为
  动态内容：时段问候语、主进程实时模型选择状态）
- 资产：`zcode/docs/verification/`（参照图/重建图/像素差/RESULT.md）
- 工具链：`zcode/scripts/visual-verify/`（可复现）

转换中发现并修复的语义陷阱（已固化进 jsxrev）：
1. `document.createElement` 不得按方法名误转为 JSX（只认 `(0, X.fn)` 逗号形式）
2. JSX 小写标识符=内在元素：小写组件变量保持调用形式
3. 模块单一实例：转换模块仅 `.jsx` 通道 + 全引用重写，杜绝双实例

## 11. P1 主进程地基（2026-08-14 完成）

- `packages/shared/src/paths.ts`：路径/环境工具 1:1 移植（getDataBaseDir /
  getZCodeDataRootDir / getAppConfigDir / getConversationWorkspaceDir /
  readEnvValue / normalizeWindowsComparablePath / normalizeZCodeEnv）
- `apps/desktop/src/main/`：logger（shipped 日志格式）、crash-capture、
  deep-link（Linux 用户级 zcode:// 注册全套）、index.ts 启动序列
- 单元测试 9/9 通过（`packages/shared/test/ports.test.mjs`）
- **启动对齐测试 PASS**（`scripts/boot-parity/run.sh`）：新 main 在真实
  Electron 运行时下的日志序列与参照应用一致
  （crash-capture configured → deep-link 注册 → arms initialized env=prod
  version=3.7.6），证据 `zcode/docs/verification/boot-parity-new-main.log`

## 12. 全栈集成里程碑（2026-08-14 完成）

 rebuilt 客户端四件套首次同跑并渲染真实 UI：
 - 我们的 TS main（启动序列 + 窗口 + 123 通道骨架 + host glue）
 - 复原 preload（含 trace 开关）
 - 复原 renderer（JSX 源码，HTTP 服务加载）
 - 复原 host（utilityProcess.fork，MessageChannelMain 双向端口中介，
   忠实移植 shipped 的 attachServicePort 流程）

 **像素验证：97.62% 匹配**（差异均为动态内容：时段问候语、模型选择状态）。
 自包含复跑脚本：`zcode/scripts/fullstack-verify/run.sh` → PASS。

 集成中发现并固化的关键事实：
 1. Linux 主窗口必须 `frame:false`（shipped `buildDesktopWindowVisualOptions`），
    headless 下有框窗口触发 GPU 回退竞态 → GTK 对话框 → 进程中止。
 2. Electron 默认 uncaughtException 处理器会开原生对话框（无显示即 abort）；
    已替换为日志 handler。早期"不稳定崩溃"实为孤儿进程占用 4180 端口
    （EADDRINUSE）触发该对话框；服务器已加端口回退。
 3. renderer 启动链：监听 `zcode:service-port` MessagePort → 收到后才渲染；
    通过 `notifyRendererReady`(send `zcode:renderer-ready`) 请求 attach；
    main 冗余推送端口覆盖竞态（renderer 只接受首个）。
 4. host 需要 node_modules（486 依赖，符号链接自 asar 解包；正式化需 pnpm install）。
 5. 首个真实 handler：`zcode:get-web-remote-control-status` → `{status:"idle"}`
    （shipped 形状）；其余通道骨架返回 undefined 并记录 first-use 驱动增量移植。
