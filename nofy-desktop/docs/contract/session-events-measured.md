# 会话事件——完整轮次实测形状

采集：2026-09-09，`scripts/record-turn.ts` 对真内核录制。
内核 agentVersion **0.2.121** · 模型 **qwen3-coder-plus** · 轮次耗时 **4,274ms** ·
stopReason **end_turn** · 共 **54 帧**。原始帧：`docs/fixtures/golden-turn.jsonl`。
任务为只读（读临时工作区里的 hello.txt 并回复首行），权限走只读白名单。

用途：投影层（`renderer/core/project.ts`）的**唯一准绳**。回放门
`apps/desktop/test/replay.test.ts`（23 例）以此夹具断言形状与顺序不变量。

---

## 1. 最重要的更正：判别字段嵌在 `update` 里

```
params = { sessionId, update: { sessionUpdate: "<判别值>", … }, _meta?: { … } }
```

**不是** `params.sessionUpdate`。PORTING-PLAN §2.3 写作「`sessionUpdate` 种类：…」，
极易被读成 params 顶层字段——`record-turn.ts` 初版正是看错这一层，
23 条 `session/update` 全被记成 `update:?`、`agentChunks=0`，
门因此假红。一切以本文与夹具为准。

`session/update` 与 `_nofy/session_notification` **同构**（都是 `{sessionId, update}`），
差别只在判别值集合与走哪条轨。

## 2. `_meta` 信封（仅部分事件带）

```jsonc
"_meta": {
  "eventId":          "01a0850e-a303-7522-a13d-…",   // 去重高水位键
  "agentTimestampMs": 1788…,
  "updateType":       "AgentMessageChunk",            // 判别值的 PascalCase 镜像
  "totalTokens":      12345,
  "updateParams":     { … }
}
```

`updateType` 与 `update.sessionUpdate` 是**同一信息的两种写法**
（`agent_message_chunk` ↔ `AgentMessageChunk`）；回放门断言该镜像关系成立
（snake→Pascal 逐词首字母大写、去下划线）。

## 3. `eventId` 覆盖规律（本轮实测，逐种类）

**带 eventId（进持久转录轨 ⇒ replay 时需按高水位去重）：**

| 事件 | 计数 |
|---|---|
| `session/update#user_message_chunk` | 1 |
| `session/update#agent_message_chunk` | 14 |
| `session/update#tool_call` | 1 |
| `session/update#tool_call_update` | 2 |
| `session/update#available_commands_update` | 4 |
| `_nofy/session_notification#hook_execution` | 5 |
| `_nofy/session_notification#turn_completed` | 1 |

**不带 eventId（瞬态/UI 类 ⇒ 天然幂等或 last-write-wins，不得套用去重）：**

| 事件 | 计数 |
|---|---|
| `session/update#session_info_update` | 1 |
| `_nofy/session_notification#tool_call_delta_chunk` | 5 |
| `_nofy/session_notification#response_completed` | 2 |
| `_nofy/session_notification#model_changed` | 1 |
| `_nofy/session_notification#session_summary_generated` | 1 |
| `_nofy/session_notification#pending_interaction` | 1 |
| `_nofy/session_notification#interaction_resolved` | 1 |
| `_nofy/queue/changed` | 3 |
| `_nofy/sessions/changed` | 2 |
| `_nofy/mcp/{servers_updated,init_progress,server_status}`、`_nofy/mcp_initialized` | 5 |
| `_nofy/session/prompt_complete` | 1 |

⇒ **投影层的去重只能作用于带 eventId 的事件**（第一方语义
`last_applied_event_seq` + `drop_unexpected_replay`、replay 豁免）。
对不带 eventId 的事件套去重会把它们全部误丢——例如 `model_changed`
与 `session_info_update`（标题生成）会永远不上屏。

## 4. 完整轮次事件账（54 帧）

| 线路名 | 帧数 | 判别值分布 |
|---|---|---|
| `session/update` | 23 | agent_message_chunk 14 · available_commands_update 4 · tool_call_update 2 · user_message_chunk 1 · tool_call 1 · session_info_update 1 |
| `_nofy/session_notification` | 17 | hook_execution 5 · tool_call_delta_chunk 5 · response_completed 2 · turn_completed 1 · model_changed 1 · session_summary_generated 1 · pending_interaction 1 · interaction_resolved 1 |
| `_nofy/queue/changed` | 3 | — |
| `_nofy/mcp/init_progress` | 2 | — |
| `_nofy/sessions/changed` | 2 | — |
| `_nofy/mcp/servers_updated` / `_nofy/mcp_initialized` / `_nofy/mcp/server_status` | 各 1 | — |
| `_nofy/session/prompt_complete` | 1 | — |
| response（initialize / session/new / session/prompt） | 3 | — |

**本轮未出现**：`agent_thought_chunk`、`plan`、`current_mode_update`、
`session/request_permission`、`_nofy/ask_user_question`、`_nofy/exit_plan_mode`、
`subagent_*`、`auto_compact_*`、`rewind_marker`。需另录夹具覆盖（见 §7）。

## 5. 时间轴（相对首帧）

```
  111ms  _nofy/mcp/servers_updated
  313ms  _nofy/mcp/init_progress            total/connected/sessionId
  325ms  session/update  available_commands_update
  334ms  session/update  available_commands_update
  345ms  ext_notification  hook_execution   event_name=session_start
  348ms  ext_notification  model_changed
  349ms  _nofy/sessions/changed             upserted[1] removed[0]
  354ms  _nofy/queue/changed ×2
  357ms  session/update  user_message_chunk
  379ms  ext_notification  hook_execution
  688ms  ext_notification  session_summary_generated   ← 标题在这里生成
  688ms  session/update  session_info_update           ← 无 eventId
  949ms  _nofy/mcp/init_progress + _nofy/mcp_initialized  mcpToolCount/elapsedMs
 1001ms  _nofy/mcp/server_status             name=gitnexus status=ready
 2615ms  session/update  agent_message_chunk ×7        ← 首字延迟 ~2.6s
 3014ms  ext_notification  tool_call_delta_chunk ×5    ← 「正在调用工具…」
 3209ms  session/update  available_commands_update
 3221ms  ext_notification  response_completed          ← 第一段模型响应收尾
 3226ms  session/update  tool_call
 3233ms  session/update  tool_call_update
 3252ms  ext_notification  hook_execution + pending_interaction + interaction_resolved
 3276ms  session/update  tool_call_update
 3290ms  ext_notification  hook_execution
 4367ms  session/update  agent_message_chunk ×7        ← 工具后继续输出
 4581ms  session/update  available_commands_update
 4585ms  ext_notification  response_completed
 4614ms  ext_notification  hook_execution
 4621ms  _nofy/queue/changed
 4621ms  ext_notification  turn_completed              ← 权威收尾
 4622ms  _nofy/session/prompt_complete                 ← legacy 双生，晚 1ms
 4622ms  _nofy/sessions/changed
```

## 6. 三条被实测钉死的结论

1. **陷阱 T5 成立且可用**：`turn_completed`(4621ms) 早于 legacy 的
   `_nofy/session/prompt_complete`(4622ms) 1ms。回合结束**依赖 turn_completed**，
   prompt_complete 只作冗余信号。回放门断言了这个先后关系。
2. **`response_completed` 不等于回合结束**：本轮它出现 2 次（工具调用前、轮末），
   每次对应一段模型响应。把它当回合收尾会在多段轮次里提前关轮。
3. **只读工具不触发 `session/request_permission`**：本轮 tool_call 前后是
   `pending_interaction` 与 `interaction_resolved` **同一毫秒**成对出现，
   没有权限请求帧。⇒ 权限流需要**另录一份夹具**（用会触发审批的动作），
   不能指望只读轮次覆盖 P2 的验收。

## 7. 关键响应形状

**`session/new` 的 result**

```jsonc
{
  "sessionId": "01a0850e-…",
  "models": { "currentModelId": "qwen3-coder-plus", "availableModels": [/* 4 */] },
  "_meta": {
    "currentWorkingDirectory": "/var/folders/…/nofy-desktop-turn-ws-…",
    "codebaseIndexed": [], "isGitRepo": false, "gitRoot": null,
    "showNonGitWarning": true,
    "nofy/sessionConfig": { … },     // ← 模型选择器的数据源（PORTING-PLAN §2.1）
    "nofy/sessionDetail": { … },
    "nofy/schedulerBackgroundLoops": false
  }
}
```

注意：隔离 home 复制了 `config.json` 后 `availableModels` 是 **4** 个
（空 home 只有内置 grok-4.5 一个）。

**`session/prompt` 的 result**

```jsonc
{
  "stopReason": "end_turn",
  "_meta": {
    "sessionId": "…", "requestId": "…", "promptId": "…", "modelId": "qwen3-coder-plus",
    "totalTokens": N, "inputTokens": N, "outputTokens": N,
    "cachedReadTokens": N, "reasoningTokens": N, "usage": { … }
  }
}
```

⇒ P4 的用量面**不需要额外请求**，prompt 响应的 `_meta` 已经把
input/output/cached/reasoning 四项分账给全了。

**`availableCommands` 有两个来源、量级差很大**

- `initialize._meta.availableCommands` = **7** 条（compact / always-approve / context /
  session-info / deep-research / workflow / goal）
- 轮次中 `session/update#available_commands_update` 携带 **167** 条

⇒ 命令面板必须以 `available_commands_update` 为准动态刷新，
不能只读 initialize 的那 7 条。这正是 PLAN.md §5 第 3 条「菜单不能是死列表」的实证。

## 8. 投影层实现时新量到的三条（2026-09-09，回放门驱动）

### 8.1 `tool_call_delta_chunk` 的关联键是 **tool_index**，不是 tool_call_id

5 个 delta 帧的键集**不一致**：

| # | 键集 | tool_call_id | name | arguments_delta 长度 |
|---|---|---|---|---|
| 1 | sessionUpdate, **tool_call_id**, **tool_index**, **name**, arguments_delta | `call_a94c…` | `read_file` | 0 |
| 2 | sessionUpdate, tool_index, arguments_delta | **缺失** | 缺失 | 26 |
| 3 | 同上 | 缺失 | 缺失 | 0 |
| 4 | 同上 | 缺失 | 缺失 | 2 |
| 5 | 同上 | 缺失 | 缺失 | 0 |

⇒ **只有首帧公告 id 与工具名**，后续帧靠 `tool_index`（本轮恒为 0）关联。
投影层必须维护 `tool_index → toolCallId` 映射；按 id 关联会为帧 2–5 各造一个
`toolCallId=""` 的幽灵块，在脊柱上渲染成空工具卡。

**这个 bug 真发生过，被回放门抓到**：终态一度是 10 块、含 `id="tool:"` 的空块；
修后是 9 块、单一 tool-call。任何旧文档都没有这条协议细节。

另：delta 早于 `tool_call` 到达（3014ms vs 3226ms），故块必须能由 delta 先建。

### 8.2 两个 usage **不是同一形状**，不得混用

| 来源 | 命名法 | 字段 |
|---|---|---|
| `response_completed.usage`（段级，本轮 ×2） | **snake_case** | input_tokens / output_tokens / cache_read_input_tokens / cache_creation_input_tokens / reasoning_tokens |
| `turn_completed.usage`（轮级，×1） | **camelCase** | inputTokens / outputTokens / totalTokens / cachedReadTokens / cacheCreationTokens / reasoningTokens / **modelCalls / apiDurationMs / modelUsage / numTurns** |

实测值：段级第一段 input=22042 output=42；轮级 total=44355 modelCalls=2 numTurns=2
apiDurationMs=4088 cachedReadTokens=22016。
⇒ P4 用量面必须**分开建模**（`SegmentUsage` / `TurnUsage`），合并求和会算错。

### 8.3 eventId 序号在**两条轨之间**也是单调的

带 eventId 的 28 个事件，序号严格 0→27 递增，且 `session/update`（stdlib 轨）与
`_nofy/session_notification`（ext 轨）**共用同一序号空间**（形如 `<sessionId>-<n>`）。

⇒ 单一高水位 `lastEventSeq` 即可，不需要按轨分别记账。
复现：`node apps/desktop/scripts/inspect-eventid-seq.ts`。

### 8.4 available_commands_update 的 tools 数会**增长**

4 次 `available_commands_update` 的 `availableCommands` 恒为 167 条，但
`_meta.tools` 从 **25** 递增到 **38**（工具随会话推进注册）。
⇒ 取最后一次，不要取首次；也不要假定它恒定。

## 9. 待补的夹具

| 夹具 | 覆盖 | 触发方式 |
|---|---|---|
| `golden-permission.jsonl` | `session/request_permission` 全选项形状 + 应答 | 需要审批的动作（写文件/跑命令） |
| `golden-plan.jsonl` | `_nofy/exit_plan_mode` + 行级评论 | plan 模式轮次 |
| `golden-question.jsonl` | `_nofy/ask_user_question` 多问题表单 | 触发提问的任务 |
| `golden-replay.jsonl` | `session/load` 的回放帧序 + `_nofy/replayed` | 载入历史会话 |
| `golden-cancel.jsonl` | `session/cancel` → `turn_completed{stopReason:"cancelled"}` | 轮次中打断 |
| `golden-subagent.jsonl` | `subagent_spawned/progress/finished` + 子代理路由 | 委托子任务 |

前四条覆盖 P2 合格线，后两条覆盖 P1 的停止与 P3 的活任务面。


