# ZCode 包装逻辑拆解 · 与我们的施工逻辑

> 2026-08-26 · 信源限定：原版 `ZCode-3.7.6-linux-x64.deb` 解包（/tmp/zcode-orig、/tmp/zcode-asar）
> 与反编译目录 `ref-ui/zcode-restored/src-reconstructed`。**仿照/重建项目不作证据**。

## 1. 事实清单（每条带证据）

### 1.1 运行时：不 spawn Claude Code，自研 in-process agent loop
- 全 main bundle 无 `stream-json` / `--resume` / `--permission-prompt-tool` / `--input-format`（标准 CLI 包装四件套全无）。
- package.json 依赖无 `@anthropic-ai/claude-code`；有 `@lydell/node-pty-*`（shell 工具自供）。
- 直连 Anthropic 兼容 API：`new Map([[ee.zapi,"/v1/messages"]])`、`providerMappings:{claude:Js()}`、
   bundled `resources/model-providers/models_catalog_china_llm_zcode_2026-06-03.json`。
- 工具链自带二进制：`resources/tools/{ripgrep,bfs,ugrep}` —— 搜索类工具是自己实现的，不是 claude 的。

### 1.2 权限：自有协议 schema，非 CLI 回调
- `kind:"permission",toolCallId,toolName,summary`；`interactionId,kind:["permission","userInput"],autoResolution`；
  `permission.lifecycle phase:["requested","resolved","denied"]`；渲染层 `permissionWaitsByRequestId`。

### 1.3 数据生态兼容：这才是"基于 Claude Code"的真义
- `ClaudeNativeSessionImportRepo`：扫 `~/.claude/projects/**/*.jsonl`，解析原生 transcript，
  可 import/continue 用户在 CLI 里的会话（`provider:"claude"`、`copySessionFileToWorkspace`）。
- 扫 `.claude-plugin` 目录（插件格式兼容）。
- 选择性兼容：**不读** CLAUDE.md / .claude.json（main 全 bundle 0 命中）——兼容是为迁移，不是寄生。

### 1.4 GUI 完整表达交互范式（反编译 renderer 主 chunk）
- 会话操作全集：`applyFileRewind / forkAssistant / editUserQuery / retryTurn / fileRewind`。
- 计划模：`plan-detail` 作为子会话类型（`parentSessionId`）。
- MCP：`mcpStore`，scope=user/project，含 legacy 迁移。
- 其余（前期 spec 已证）：session picker、审批 UI、dock 终端/浏览器、设置双栏、搜索、dashboard。

### 1.5 桌面产品层（内核之外）
OAuth 账号/登录归因、云任务 ticket broker（queued/ready/active/settled）、CUA Helper（computer-use）、
settings-sync、repo-snapshot-upload、遥测、electron-updater、日志保留、remote/pairing。

## 2. 包装逻辑（产品视角）

ZCode 包装的不是 **Claude Code 进程**，而是 **Claude Code 交互范式 + 数据生态**：

```
┌─ 桌面产品层   账号/云/CUA/同步/遥测/更新        （差异化，可厚）
├─ 范式表达层   审批/plan/rewind/fork/改问/重试/MCP/slash/会话管理   （必须完整，= 产品合格线）
├─ 兼容层      读 ~/.claude jsonl、.claude-plugin              （迁移摩擦为零）
└─ 自研运行时   in-process loop + 自带工具 + 直连 API            （ZCode 被迫自建，因无内核）
```

关键洞察：**范式表达层的完整性是桌面产品的合格线**。ZCode 连运行时都要自己写，
却不敢省略范式层的任何一个动作（rewind/fork/edit/retry 全有）——因为用户心智里
"这就是 Claude Code 的桌面版"，少一个动作就是残废。

## 3. 映射到我们：成本结构相反，结论更硬

| | ZCode | 我们 |
|---|---|---|
| 运行时 | 被迫自研 | **已有真内核**（nofy + ACP） |
| 范式参照 | 凭 Claude Code 心智 reimplement | **已有参照实现**（nofy TUI） |
| 风险 | 范式层漏项 | **GUI 表达漏项**（现状 parity≈30%） |

我们的"简陋"感 = 范式表达层残缺：TUI 的 rewind✅/fork❌/editUserQuery❌/retry❌/
tasks 三源❌/todo❌/context❌/compact❌/memory/doctor❌/选项级审批❌/plan 审批视图❌ ……
而我们把精力投在了增强层（注意力轨/看板/契约）——位置错了。

## 4. 施工逻辑修订

1. **合格线先行**：parity-matrix.md 的 P1–P7 = 范式表达层补全，逐 TUI 能力 GUI 化，
   每步以"该能力在 TUI 存在且桌面版可完成同一动作"为验收。
2. **兼容层廉价可得**：nofy 的会话/设置本就是我们内核原生格式，无迁移问题——跳过 ZCode 的兼容层功课。
3. **桌面层薄而真**：Electron 壳/tray/通知/remote 放 P8，不抢 parity 资源。
4. **增强层冻结**：注意力轨/看板/契约只修 bug 不加功能，作为 P8 之后的差异化。

一句话：ZCode 教我们的不是"怎么 spawn 内核"，而是**"内核的交互范式必须一个动作不落地
GUI 化，这才是桌面产品的合格线"**。内核我们比 ZCode 幸运（真内核+TUI 参照），
没有借口再漏。
