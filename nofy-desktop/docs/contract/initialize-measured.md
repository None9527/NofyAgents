# initialize 响应——活体内核实测证据

采集：2026-09-09，`node apps/desktop/scripts/smoke.ts` 对 `~/.local/bin/nofy agent stdio`
（agentVersion **0.2.121**）实跑所得。原始帧：`docs/fixtures/smoke-*.jsonl` 第 1 帧。

用途：S1b 的 zod strict schema 以此为准绳；PORTING-PLAN §2.1 的记载在此逐条复核通过。

## 1. 顶层

| 字段 | 实测值 |
|---|---|
| protocolVersion | 1 |
| agentVersion | 0.2.121 |
| authMethods | 仅 `[{id:"api_key", name:"API key", description:"NOFY_API_KEY or api_key/env_key in config.toml"}]` —— **无 OAuth**，与域处置图把 oauth 判为 K2（拆除）一致 |

## 2. agentCapabilities

```jsonc
{
  "loadSession": true,
  "promptCapabilities": { "image": false, "audio": false, "embeddedContext": true },
  "mcpCapabilities":    { "http": true, "sse": true },
  "sessionCapabilities": { "list": {}, "resume": {}, "close": {} },
  "auth": {},
  "_meta": {
    "nofy/fs_notify": true,
    "nofy/hooks": {
      "blockingEvents": ["pre_tool_use", "stop", "subagent_stop"],
      "decisions":      ["deny", "block"],
      "stopSignals":    ["continue", "stopReason", "additionalContext"]
    }
  }
}
```

`sessionCapabilities.{list,resume,close}` 三项齐备 ⇒ PORTING-PLAN §2.1 把
`session/list`、`session/resume`、`session/close` 归入 [实测]（不在 message.rs 的
10 点枚举内）是对的：它们由 capability 声明支撑。

`nofy/hooks` 的三组枚举**逐字确认** PLAN.md §2.2 的「阻塞 hooks」行：
pre_tool_use / stop / subagent_stop，decisions deny / block。

## 3. `_meta` 键集（16 键，实测顺序）

`nofyShell` · `defaultAuthMethodId` · `nofy/mcp/sdk` · `nofy/pluginDirs` ·
`currentWorkingDirectory` · `agentVersion` · `agentId` · `agentInstanceId` ·
`hostname` · `modelState` · `mcpServers` · `mcpApps` · `metadata` ·
`availableCommands` · `cancelRewind` · `sessionRecap`

- `modelState` = `{ currentModelId, availableModels }`；实测 4 个模型
  **grok-4.5 / qwen3.8-max / qwen3-coder-plus / glm-5.2**，与 FRONTEND-FIRST-PRINCIPLES
  §1 地面真相 #6 的记载一致。
- `availableCommands` = 7 条：**compact / always-approve / context / session-info /
  deep-research / workflow / goal**。与 PORTING-PLAN §2.1 逐字相符。
  ⇒ PLAN.md §5 第 3 条「菜单不能是死列表」的数据源就是这里，且它还会经
  `available_commands_update` 动态刷新。

## 4. 两项需要裁定的新发现

### 4.1 `_meta["nofy/mcp/sdk"] = true` —— 内核**声明了**进程内 SDK MCP 传输

PLAN.md §2.2 记载：`_nofy/mcp/sdk_call` 是内核→客户端的 request，「仅当
`initialize._meta["nofy/mcp/sdk"]` 声明时」出现。实测该键为 **true**，
所以本项目**会**收到 `_nofy/mcp/sdk_call`。

当前 connection.ts 对未知 server→client 请求一律回 METHOD_NOT_FOUND（-32601），
这会让进程内 SDK MCP 服务器不可用。三条处置待定：

1. 实现 `_nofy/mcp/sdk_call`（在 Electron main 里跑 SDK MCP 传输）；
2. 找出让内核不声明该键的 initialize 参数（若存在）；
3. 接受降级：SDK 型 MCP 服务器不可用，UI 诚实说明（符合验收门 3「能力缺失＝诚实文案」）。

**倾向 3 起步、按 P5（生态面）需要再升级到 1**——因为 MCP 属 P5，不在合格线内。

### 4.2 `promptCapabilities.image = false`、`audio = false`

内核**不接受** prompt 里的图片与音频内容块（`embeddedContext: true` 只表示可嵌入文本上下文）。

这直接影响 PLAN.md §11 未决 #3（modality 面）：旧路在 renderer bundle 里手写的那套
`zzModBox` 选择器含 text/image/video/audio/pdf 五模态，而本内核对 image 与 audio
的 prompt 能力为 false。⇒ **新项目不应照搬那个五模态选择器**；应以此 capability
为门渲染，能力为 false 的模态不出现在 UI 上（可见性是状态函数，PLAN.md §5 第 3 条）。

需复核：该 capability 是否随模型而变（`availableModels` 各项是否自带模态声明），
S1b 录制含 `session/new` 的夹具时一并取回。

## 6. 后续增补（2026-09-09，codegen 与隔离态实测）

### 6.1 codegen 校正了一处线路名

从 `agent-client-protocol-schema 0.11.4`（Apache-2.0）生成的权威表给出
**client 侧 11 个方法**，其中终止终端命令的线路名是 **`terminal/kill`**。
本文档与 `methods.ts` 初版写作 `terminal/kill_command`——那是把 Rust 枚举变体名
`KillTerminalCommand` 误当线路名反推的结果。已修，并由
`packages/acp/test/wire-names-drift.test.ts` 钉为回归门。

生成表同时补齐了本文档 §2 未列的名字：`session/elicitation/complete`、
`document/{didOpen,didChange,didSave,didClose,didFocus}`、`nes/{start,suggest,accept,reject,close}`、
协议级 `$/cancel_request`。agent 侧权威表共 **24** 条（本文档 §A 的 10 点是 nofy
`message.rs` 自己包进枚举的子集，不是协议全集）。

### 6.2 nofy **不需要** `initialized` 通知

Codex 的 app-server 要求客户端在 `initialize` 之后补发 `notify("initialized")`。
**nofy 不要**：`acp_agent.rs` 与 `nofy-acp-lib/src/message.rs` 中搜
`initialized`/`Initialized` 零命中；本项目 smoke 从不发这一条，7/7 门全过。

⇒ 登记在此，防止后来者对照别的 app-server 实现「补上」这一步。

### 6.3 隔离 NOFY_HOME 下的差异（重要：这些量不是常量）

内核读 `$NOFY_HOME`（`crates/codegen/nofy-config/src/paths.rs:35`），未设才落 `~/.nofy`。
smoke 默认在 mktemp 出来的空 home 上跑，实测与真库的差异：

| 量 | 真 `~/.nofy` | 空 NOFY_HOME |
|---|---|---|
| `authMethods` | `[{id:"api_key",…}]` | **`[]`** |
| `modelState.availableModels` | 4（grok-4.5 / qwen3.8-max / qwen3-coder-plus / glm-5.2） | **1（grok-4.5，内置）** |
| `workspace_list` | 5 工作区 / 82 会话 | **0 / 0** |
| `agentCapabilities` | 同 | 同（不随配置变） |
| `availableCommands` | 7 条 | 7 条（不随配置变） |

⇒ **`authMethods` 与 `availableModels` 随配置动态，不得当常量断言**；
`agentCapabilities` 与 `availableCommands` 可当稳定形状断言。
第三行正是「隔离生效」的可观测证据，smoke 的 ③ 号门就用它。

### 6.4 `session/list` 的响应形状

实测为对象而非数组：**`{ sessions, _meta }`**。（初版 smoke 只报了「object, 3 keys」。）

## 5. 复核结论

PORTING-PLAN §2.1 关于 initialize 的每一条记载（agentCapabilities、authMethods 仅 api_key、
`_meta.modelState` 完整模型表、`_meta.availableCommands` 七条、cancelRewind、sessionRecap、
agentVersion）**全部实测通过**。契约层可按此写 strict schema。


