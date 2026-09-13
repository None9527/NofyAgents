# 重连与回放实测——去重语义定案

采集：2026-09-09，`scripts/record-replay.ts` 三段录制（隔离 NOFY_HOME、
`permission_mode=default`、临时工作区、极简 prompt 不触发工具）。
内核 0.2.121 · 47 帧 · malformed=0 · 已脱敏。夹具：`docs/fixtures/golden-replay.jsonl`
（每条记录带 `phase` 字段：live / replay / noreplay）。
逐事件对照：`node apps/desktop/scripts/inspect-replay-diff.ts`。

这份件回答的是 PLAN §13 排第一位的未知量：**重连后内核重放持久轨时，eventId 序号如何？**
此前只有「同一 epoch 内单调 0→27」一条证据，而序号回退的后果已被录制事故演示过
（整批事件静默丢弃）。

---

## 1. 核心发现：扩展事件有**两条轨**，线路名不同

| 轨 | 线路名 | 性质 | 重连后 |
|---|---|---|---|
| **持久轨** | `_nofy/session/update` | persisted + replayed | **会以同一批 eventId 重放** |
| **fire-and-forget 轨** | `_nofy/session_notification` | 即发即弃 | **丢失** |

源码依据：`nofy-shell/src/session/acp_session_impl/turn_end.rs:324-334`——
turn_completed 是 prompt_complete 的「durable twin … on the **persisted + replayed**
`_nofy/session/update` rail」，目的是「让中途重附着的 viewer 从 replay 收尾，
而不是永远卡在 Waiting…」。

实测逐条对上：live 段的 hook_execution 走 `_nofy/session_notification`（seq 2/4/7），
replay 段**同样的 seq** 从 `_nofy/session/update` 回来。

⇒ `events.ts` 的 `NormalizedEvent` 已加 `rail: "persisted" | "live"` 字段。
投影层据此可区分「实时到达」与「回放补发」，UI 可据此决定是否做入场动画等。

## 2. 什么会重放、什么不会

**会重放**（带 eventId，两条轨都出现过）：

| seq | live 线路 | replay 线路 | 判别值 |
|---|---|---|---|
| 2 | `_nofy/session_notification` | `_nofy/session/update` | hook_execution(session_start) |
| 3 | `session/update` | `session/update` | user_message_chunk |
| 4 | `_nofy/session_notification` | `_nofy/session/update` | hook_execution(user_prompt_submit) |
| 5 | `session/update` | `session/update` | agent_message_chunk |
| 7 | `_nofy/session_notification` | `_nofy/session/update` | hook_execution(stop) |
| 8 | `_nofy/session_notification` | `_nofy/session/update` | turn_completed |

**不重放**：

- `seq 6` `available_commands_update`（带 eventId 但**未**重放 ⇒ 非持久）
- 全部**不带 eventId** 的事件：`session_info_update`、`session_summary_generated`、
  `response_completed`、`queue/changed`、`sessions/changed`、`prompt_complete`、
  `mcp/server_status`、`model_changed`

### ⚠ 由此得出一条**硬设计要求**：冷启动载入历史会话时，标题不会以事件形式到达

`session_info_update`（stdlib 轨，携带 `title`）与 `session_summary_generated`
（ext 轨，携带 `session_summary`）**都不在回放集里**。

⇒ 新进程冷启动后 `session/load` 一个历史会话，投影层**收不到标题事件**。
标题必须从别处取：`session/load` 的响应、`session/list`、或
`_nofy/session_summaries/*`（后者实测返回 `generated_title` / `session_summary`）。
这不是优化项，是 P1「打开历史会话」的正确性前提。旧路 D12「历史回放疑未接线」
最后被撤销（实测走 subscribeConversationV4 的 snapshot 帧是通的）——
我们不那条路，故必须自己把标题来源接对。

## 3. load 会**新产生**事件，其中一个是真的又跑了一遍 hook

replay 段有 3 个 live 里不存在的 eventId：

| seq | 线路 | 判别值 | 说明 |
|---|---|---|---|
| 9 | `session/update` | available_commands_update | load 触发命令表刷新 |
| **10** | `_nofy/session_notification` | **hook_execution(session_start)** | **load 真的又跑了一次 session_start hook** |
| 11 | `session/update` | available_commands_update | 同上 |

⇒ 载入历史会话会在脊柱上**合法地**多出一个 session_start 块。这不是重复，
是新事件，必须上屏。回放门因此断言「内容块零重复，但 event 块可追加 ≤3 个」，
而不是「块序列完全一致」——初版断言写严了，被这条数据纠正。

## 4. 回放**乱序到达**

replay 段 eventId 的 seq 实际到达顺序：

```
2, 4, 3, 7, 5, 8, 9, 10, 11
```

**不是单调的。** ⇒ 投影层不得假定有序（例如不得按到达顺序给块编号、
不得用「比上一条新」做判据）。已钉成断言：若某次录制恰好有序，测试会**红**
并提示复核，防止有人据此加上有序假定。

## 5. 去重语义定案：单一高水位是对的，**不需要** epoch 重置

实测：live 段 max seq = **8**；replay 段 6 个重合（seq 2/3/4/5/7/8，全部 ≤ 8）
+ 3 个新增（seq 9/10/11，全部 > 8）。

对「每会话单一高水位 `lastEventSeq`，`seq <= lastEventSeq` 即丢」这条规则：

- 6 个重合被丢 ⇒ **正确**（它们已在状态里）。回放门实证：live-only 与
  live+replay 的 user/agent 文本**逐字相同**，无重复拼接。
- 3 个新增被应用 ⇒ **正确**。回放门实证：`appliedEvents` 增长、`lastEventSeq` 推进。

⇒ 我上一轮担心的「序号回退导致整批丢弃」在**真实重连场景下不发生**：
持久轨重放用的是**同一批 eventId**，新事件的 seq 严格大于旧 max。
故**不加** epoch 重置——加了反而会破坏真 replay 的去重。

**残留观察项**（未实测，登记不臆断）：若 live 流（非回放）本身出现
「高 seq 先到、低 seq 后到」，单一高水位会误丢后者。本次 live 段严格 0→8 有序，
未观察到该情形。若将来出现，正确解法是照第一方语义引入 replay 窗口
（TUI 的 `begin_replay_window` / 窗外 replay 丢弃 / replay 豁免去重），
而不是放宽高水位。

## 6. `_meta["nofy/replayed"]`：线路级零出现（判定 doubly 确认）

- 作为**方法名** `_nofy/replayed`：全 47 帧 **0 次**
- 作为 **_meta 键** `nofy/replayed`：全 47 帧 **0 次**

结合此前的源码复核（该键只出现在 pager 客户端侧：`follow_ups.rs:67/80`、
`agent_view/mod.rs:3081`），判定确认：**它是客户端自己在回放期打标、自己读标以
抑制重复渲染的约定，内核既不发这个方法、也不打这个标记。**

⇒ 我们不需要这个标记：去重由 eventId 高水位完成（§5 已实证）。
旧 seam 的 `'replayed'` 事件是错的，已在 connection.ts 移除（`EXT_REMOVED` 留档）。

## 7. `_meta.noReplay: true` 的实际效果

被内核接受。转录回放从 **9 个** eventId 事件降到 **1 个**——但**不是完全静默**：
load 自身仍会产生新事件（§3 的 seq 9/11 一类）。

⇒ 断言应写「远少于回放」而非「为零」。初版写 0，被数据纠正。

## 8. 本轮抓到的两个自身缺陷

1. **`ready()` 在死亡窗口返回陈旧结果**：SIGKILL 之后立刻 `ready()`，
   此时 exit 事件尚未派发、`initialized` 与 `io` 仍是旧值 ⇒ 立即以旧结果返回，
   实测 `pid1 === pid2`，随后 `session/load` 以 "kernel child exited" 失败。
   已做两件事：① `ready()` 增加 `isOpen()` 条件；② 在方法注释里写明局限，
   并要求「刚触发过进程终止的调用方必须先等 status:false」——
   `record-replay.ts` 的 `waitForDisconnect()` 即此。
2. **录制器不截断**：`appendFile` 是追加语义，两次录制的帧被拼进同一文件；
   又因每次录制各有 UUID 脱敏映射，两个不同真 sessionId 折叠成同一占位符，
   去重高水位遂把第二次的事件全部当重复丢弃。两个录制器均已加写前截断。

## 9. 块 id 必须由 eventId 派生

`hook_execution` 的块 id 初版用 `blocks.length` 生成，有两个后果：
① 重放时同一 seq 的 hook 不会 upsert 而是**追加**，脊柱上出现重复的 session_start；
② `blocks.length` 随任何前置块增删而漂移，**当 React key 不稳**。

已改为 `hook:<sessionId>:e<seq>`（无 eventId 时退回 `n<blocks.length>`）。
其余块 id 本就稳定（tool 块用 toolCallId、消息块用序号且只追加）。

