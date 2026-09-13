# 会话读路径实测形状

采集：2026-09-09，`scripts/probe-session-shapes.ts`（隔离 NOFY_HOME、
`permission_mode=default`、临时工作区、一轮极简 prompt 让内核生成标题）。
内核 0.2.121 · 模型 qwen3-coder-plus · **5/8 条读路径可用**。
机器可读原始件：`session-read-shapes.json`（同目录，已确认不含用户名路径）。

动机：`replay-dedup-measured.md` §2 证明冷启动载入历史会话时**标题不以事件形式到达**
（`session_info_update` 与 `session_summary_generated` 都不在回放集里），
故必须找出标题的读路径来源。本件把全部候选一次量清。

---

## 1. 标题有三个来源，各管一段（P1 落地方案）

| 场景 | 来源 | 字段路径 | 额外代价 |
|---|---|---|---|
| **冷启动载入** | `session/load` **响应** | `_meta["nofy/sessionDetail"].title` | **零**（本来就要调） |
| 列表 / 会话 roster | `session/list` | `sessions[i].title` | 一次请求 |
| 跨工作区枚举 | `_nofy/session_summaries/workspace_list` | `all_sessions[cwd][i].generated_title` 与 `.session_summary` | 一次请求 |
| 活体 roster | `_nofy/sessions/list` | `result.sessions[i].title` | 一次请求 |
| 实时生成 | 事件 | `session_info_update.title` / `session_summary_generated.session_summary` | 无（推送） |

⇒ 已落地为 `session/hydrated` action（`core/project.ts`）+
`hydrateFromResponse()`（`core/bind.ts`），`titleSource` 记来源以便诊断。
门禁：`test/e2e-chain.test.ts` 的「session/load hydrates the TITLE from the response」。

## 2. 各读路径的实测形状

### `session/load`（与 `session/new` 同族）

```jsonc
{
  "models": { "currentModelId": "qwen3-coder-plus", "availableModels": [/* 4，含 name */] },
  "_meta": {
    "sessionId": "…",
    "codebaseIndexed": [],
    "nofy/sessionConfig": { "options": [/* 4，模型选择器的数据源 */] },
    "nofy/sessionDetail": {
      "sessionId": "…", "kind": "build", "cwd": "…",
      "currentModelId": "qwen3-coder-plus",
      "title": "Reply with exactly one word: OK. Do not use any"   // ← 冷启动标题
    },
    "nofy/schedulerBackgroundLoops": true
  }
}
```

- **`nofy/sessionConfig.options` 就是模型选择器的数据源**（PORTING-PLAN §2.1 早已指出
  「UI 模型选择器直接渲染它」，此处首次量到形状：4 项）。已落为 `SessionState.modelOptions`。
- `availableModels[].name` 是**展示名**（实测 "Nofy 4.5"、"DashScope qwen3.8-max"），
  与 `id`（`grok-4.5`、`qwen3.8-max`）不同 ⇒ 选择器显示 name、提交 id。
- `nofy/sessionDetail.kind` 实测 `"build"`（TUI 侧另有 chat 模式；
  PORTING-PLAN 记「chat 模式拒载本地 Build 会话」）。

### `session/list`

```jsonc
{
  "sessions": [ { "sessionId": "…", "cwd": "…", "title": "…",
                  "updatedAt": "2026-09-09T12:41:59.366012+00:00", "_meta": {…} } ],
  "_meta": { "nofy/facets": { "scope": "window", "keys": [/* 2 */] } }
}
```

⚠ 顶层是**对象**（`{sessions, _meta}`），不是数组。旧 smoke 一度只报「object, 3 keys」。

### `_nofy/session/info` —— **P4 上下文/用量面的金矿**

```jsonc
{ "result": {
    "sessionId": "…", "cwd": "…",
    "agentName": "nofy-build-plan",            // 人格/agent 名
    "model": "qwen3-coder-plus",
    "modelDisplayName": "DashScope qwen3-coder",
    "resolvedModelId": null, "modelFingerprint": null, "showModelFingerprint": false,
    "apiBackend": "ChatCompletions",
    "turns": 4, "turnIndex": 1,
    "context": {
      "used": 22026, "total": 131072, "usagePct": 17, "freeTokens": 109046,
      "systemPromptTokens": 1034,
      "toolDefinitionsCount": 25, "toolDefinitionsTokens": 7597,
      "messageCount": 6, "messageTokens": 13567,
      "turnCount": 1, "toolCallCount": 0, "compactionCount": 0,
      "autoCompactThresholdPercent": 85,
      "usageCategories": [/* 3 */]
    }
} }
```

⇒ P4 的 context bar（断点混色 + 悬浮进度）**不需要自己算 token**：
`used/total/usagePct/freeTokens` 与四段分解（system prompt / tool definitions /
messages / 其余）内核已给全，连 `autoCompactThresholdPercent=85` 这条阈值线也有。

⚠ 本路径**不返回 title**（只有 agentName 与 modelDisplayName）——所以它不能当标题来源。

### `_nofy/session_summaries/workspace_list`

```jsonc
{ "all_sessions": { "<cwd>": [ { "session_summary": "…", "generated_title": "…",
                                 "agent_name": "nofy-build-plan", … } ] } }
```

按 cwd 分组；`generated_title` 与 `session_summary` 实测同值（都由首条用户消息派生）。
这是**会话 roster / 工作区列表**的首选：一次请求拿到全部工作区的全部会话。
（「fleet / FleetView」是 TUI 第一方词汇——nofy-pager 的 leader 模式看板，见
nofy-tui-full-spec.md:263「Dashboard=FleetView」；界面文案不沿用内部术语。）

### `_nofy/sessions/list`（活体 roster）

`{ "result": { "sessions": [ { …, "title": "…" } ] } }` —— 注意多包了一层 `result`。

## 3. 三条调不通的读路径（已移入 `EXT_UNVERIFIED_PARAMS`）

| 方法 | 实测结果 | 含义 |
|---|---|---|
| `_nofy/session/state` | **Invalid params** | 方法在，参数形状未定 |
| `_nofy/session_summaries/session_list` | **Invalid params** | 同上 |
| `_nofy/session/load_history` | **Method not found** | `acp_agent.rs:1104` **有分派臂却回未找到** |

⇒ 教训：**「内核分派表里有」≠「可按显然参数调用」**。`EXT_DISPATCH_ONLY`
（82 名）只证明内核认这个名，不证明参数形状。用到之前必须先量，
故这三条已从 `EXT_REQUEST` 移入 `EXT_UNVERIFIED_PARAMS` 单独登记，
`probe-session-shapes.ts` 保留为量参数的工具。

`load_history` 那条尤其值得追：有分派臂却 Method not found，
可能被特性门或前置条件（如会话须先 load）挡住。P1 若需要分页历史，先查这个。

## 4. 复现

```sh
node apps/desktop/scripts/probe-session-shapes.ts
```

会真发一轮极简 prompt（不用工具 ⇒ 不触发权限）以让内核生成标题，
然后把 8 条读路径逐个探一遍，输出形状 + 标题类字段对照，并写
`docs/contract/session-read-shapes.json`。
