# 权限流实测（P2 审批保真的准绳）

采集：2026-09-09，`scripts/record-permission.ts` 对真内核两轮录制。
内核 0.2.121 · 模型 qwen3-coder-plus · 隔离 NOFY_HOME +
`configOverrides {ui.permission_mode:"default", ui.yolo:false}` ·
临时工作区 · 123 帧 · serverRequests=2 · malformed=0 · 已脱敏。
原始帧：`docs/fixtures/golden-permission.jsonl`。

P2 的验收判据是「选项文案与 prompter.rs 逐字对齐」——本件就是**线路级**的逐字真相。

---

## 0. 前置：权限模式来自用户配置，会整体抑制提问

**本机真实 `~/.nofy/config.json` 里是 `ui.permission_mode = "always-approve"`（`ui.yolo = false`）。**
在该模式下内核**完全不发** `session/request_permission`：首次录制实测
`serverRequests=0`，两轮写文件（含我们打算拒绝的那次）**全部自动放行**。

⇒ 录权限流必须覆盖模式。取值词汇有两套，别混：

| 词汇 | 取值 | 出处 |
|---|---|---|
| `PermissionMode`（agent 配置枚举） | `default` / `acceptEdits` / `auto` / `dontAsk` / `bypassPermissions` / `plan` | `nofy-agent/src/config.rs:984-1002` 的 `VALID_VALUES` |
| `[ui] permission_mode`（TUI/CLI 词汇） | `"always-approve"` ⇒ yolo | `session/telemetry/permission.rs:183`：`is_yolo = … | m == "always-approve"` |

**产品含义（PLAN §5「可见性是状态函数」的又一实例）**：审批 UI 不能假定请求一定会来。
必须把**生效的权限模式**显式呈现（TUI 的 always-approve/auto 模式芯片即此用途），
否则用户会以为「没弹窗＝安全」，而实际是模式把提问整体关掉了。
从 TUI 迁移过来的用户，其 config 里很可能已经持久化了 always-approve。

## 1. `session/request_permission` 的 params 形状

```jsonc
{
  "sessionId": "…",
  "toolCall": {
    "toolCallId": "call_…",
    "kind": "edit",                     // ACP ToolKind（Write 与 Edit 工具都是 "edit"）
    "title": "Edit \`note-a.txt\`",     // **展示标题**，带反引号；动词随模型选的工具而变
    "rawInput": { … },
    "_meta": { … }
  },
  "options": [ /* 4 条，见 §2 */ ]
}
```

`toolCall` 的键集**恒为** `toolCallId, kind, title, rawInput, _meta`（多次录制一致，
已钉成断言）。注意 `title` 是展示名，与 `tool_call` 事件里的原始工具名
（`read_file`）语义不同——同一区别已在 session-events-measured.md §8 记过。

⚠ **`title` 的动词不稳定**：同一句提示词，两次录制分别得到
`Edit \`note-a.txt\`` 与 `Write \`note-a.txt\``——取决于模型这一轮选了哪个工具。
故回放门只断言**键集**与**标题形状**（`^[A-Z][A-Za-z]+ \`<文件名>\`$`），不断言动词。
（这条是踩过一次的：初版断言 `Edit` 逐字，换一次录制就红。）

`kind` 稳定为 `"edit"`——Write 与 Edit 两个工具都归这个 ACP ToolKind。

## 2. 选项全表（edit 类工具，**逐字**）

| # | optionId | kind | name（逐字） |
|---|---|---|---|
| 0 | `enable-always-approve` | `allow_once` | `Yes, and don't ask again for anything (always-approve mode)` |
| 1 | `allow-edits-session` | `allow_always` | `Yes, allow all edits during this session` |
| 2 | `allow-once` | `allow_once` | `Yes` |
| 3 | `reject-once` | `reject_once` | `No, and tell Nofy what to do differently` |

出现的 kind 集合：`allow_once`、`allow_always`、`reject_once`（本轮无 `reject_always`）。

与 TUI 规格（nofy-tui-full-spec.md Part 4 §2 引 prompter.rs）逐条对照：

- 「位0 enable-always-approve "Yes, and don't ask again for anything"」⇒ **确认**，
  但线路上的完整文案更长，尾部带 `(always-approve mode)`。规格是截断版，以本件为准。
- 「Edit: allow-edits-session(仅内存)/allow-once」⇒ **确认**，且顺序为 1、2。
- 「reject-once "No, and tell Nofy what to do differently"」⇒ **逐字确认**。
  这条文案本身就说明拒绝路径**带附言输入**（P2 必须实现 reject + followup 输入框）。
- 规格记载的 bash 族选项（`allow-always-command` 带 ←/→ 选词范围）与 MCP 族
  （`allow-always-mcp`，scope Tool⇄Server 仅当名含双下划线）**本轮未出现**
  ——因为触发的是 edit 工具。需另录 bash 与 MCP 两类夹具（§5）。

## 3. ⚠ `enable-always-approve` 在线路上**只是 allow_once**

**三条独立证据**，其中第一条就在当前夹具里：

1. **选项自带的 `kind` 字段就是 `allow_once`**（§2 表第 0 行）——内核自己把这个
   「以后都别问」的选项归类为一次性允许。这是线路级直接证据，已钉成断言
   （`projection-permission.test.ts` 的 enable-always-approve 用例）。
2. **行为观测**：首次录制时选择器按 `kind === "allow_once"` 取第一个，误命中位 0 的
   `enable-always-approve`；轮次 A 用它批准后文件正常写入、`stopReason=end_turn`，
   而**轮次 B 仍然收到了权限请求**。即选了「以后都别问」之后内核并未进入 always-approve。
   （该次夹具已被干净重录覆盖；选择器也已改为按 optionId 精确选，
   当前夹具走的是 `allow-once`。此条为一次性观测，故与第 1、3 条并列而非独证。）
3. **TUI 规格与之一致**（引 prompter.rs）：

> always-approve：slash 纯切换；副作用在 dispatcher…
> **enable-always-approve 选项 shell 侧只映射 AllowOnce，客户端选中才触发 YOLO**…
> settings/update 关 auto 时降级 Ask+清标志+`nofy/yolo_mode_changed`

⇒ **「开启 always-approve」是客户端的职责，不是应答这个选项的副作用。**
客户端要真开，必须自己切模式并通知内核——这就是 `EXT_NOTIFY.yoloModeChanged`
（`_nofy/yolo_mode_changed`，已在扩展表里，且经源码确认为**通知**）存在的理由。

**P2 必须实现这个闭环**：用户点「以后都别问」⇒ ①应答该 optionId ②本地切模式芯片
③发 `_nofy/yolo_mode_changed`。只做①会得到「点了没反应」的体感 bug——
用户以为开了，实际下次照样问。

## 4. 拒绝路径：`stopReason = "cancelled"`

轮次 B 用 `reject-once` 拒绝后：

- 文件**没有**被写（实测 `exists=false`）；
- 轮次以 **`stopReason = "cancelled"`** 收尾，耗时 2207ms；
- **不悬挂**，也不需要客户端补发 `session/cancel`。

⇒ 投影层必须把「拒绝」与「用户主动停止」区分开：两者 stopReason 都是 `cancelled`，
但前者有 `interaction_resolved` 且无用户取消动作。UI 文案不该都写「已停止」——
被拒绝的那次应显示「已拒绝该操作」。（TUI 规格：reject 附带附言会作为反馈进转录。）

## 5. 待补夹具

| 夹具 | 覆盖 | 触发 |
|---|---|---|
| bash 族选项 | `allow-always-command`（←/→ 选词范围）、`reject-always-command`、通用 always-allow/reject-always | 让 agent 跑一条 shell 命令 |
| MCP 族选项 | `allow-always-mcp`（带 meta，scope Tool⇄Server 仅当名含双下划线） | 调一个 MCP 工具 |
| reject + 附言 | 拒绝时带 followup 文本进转录 | 拒绝并填写「换个做法」 |
| `allow-edits-session` | 会话内后续 edit 不再问（仅内存，不持久） | 批准后连续两次 edit |
| `_nofy/ask_user_question` | 多问题表单（多 tab/多选/自由文本） | 触发提问的任务 |
| `_nofy/exit_plan_mode` | plan 审批 + 行级评论 | plan 模式轮次 |

## 6. 录制手法（可复现）

```sh
pnpm --filter @nofy-desktop/app record:permission
```

关键参数：隔离 `NOFY_HOME` + `copyConfig:true`（要凭据）+
`configOverrides {"ui.permission_mode":"default","ui.yolo":false}`（否则不问）。
`configOverrides` 只支持 config.json；若隔离 home 里是遗留 TOML 会**抛错**，
不静默忽略——静默忽略会录出「以为切了模式」的假数据。
写盘前过 `main/lib/redact.ts`（本轮脱敏 20 处密钥、771 处用户名路径、264 处 UUID）。



