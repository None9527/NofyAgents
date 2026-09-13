# 客户端能力门裁定（三个，全部有内核源码依据）

裁定日期 2026-09-09。实现落点：`packages/acp/src/caps.ts`。

## 0. 能力门的全集（先穷举，再裁定）

内核只认**两个** `_meta` 能力门——全树仅有两个 `parse_*_capability`：

| 能力键 | 解析点 | 门的是什么 |
|---|---|---|
| `nofy/folderTrust.interactive` | `nofy-shell/src/agent/mvp_agent/folder_trust_prompt.rs:75-83` | 是否向 GUI 客户端请求工作区信任裁定 |
| `nofy/codeNavigation.enabled` | `nofy-shell/src/agent/mvp_agent/code_nav.rs:9-17` | 代码库索引的启动资格 |

外加标准 ACP 能力（`agent_ops.rs:2654-2662` 读取）：

| 能力 | 我们的声明 | 后果 |
|---|---|---|
| `fs.readTextFile` / `fs.writeTextFile` | **false** | 只有声明 true 内核才委托 `fs/read_text_file`、`fs/write_text_file`；false ⇒ 内核用本地实现 |
| `terminal` | **不声明** | 内核自管；交互式 PTY 另有 `_nofy/terminal/pty/*` 扩展，与此无关 |
| `elicitation` | `{form:{}, url:{}}` | 表单追问可用 |

### ⚠ 声明位置的陷阱（会让声明静默失效）

`folder_trust_prompt.rs:375` 明写：「Production reads `client_capabilities.meta`,
**not** top-level request meta」。

⇒ 能力门必须放在 `clientCapabilities._meta` 里。initialize 请求**顶层**的 `_meta`
是 `clientIdentifier` 的位置，把能力写在那里内核读不到、也不报错。
旧 seam 的 handshake 只有顶层 `_meta`，照抄即静默失效。
`apps/desktop/test/connection.test.ts` 有一条守卫专门盯这件事。

---

## ① `nofy/folderTrust.interactive` = **true**（声明）

### 不声明的后果

不是会话坏掉。`folder_trust_prompt.rs` 的模块文档写得很清楚：

> Ask a GUI client to decide trust … **DORMANT no-op unless** the client advertised
> `nofy/folderTrust.interactive` AND `folder_trust::prompt_warranted`
> (feature on + untrusted + repo configs present).
>
> **Non-blocking**: the session was already created with **project servers GATED**
> (the untrusted resolve in `new_session`/`load_session`), so nothing repo-local
> spawns while the prompt is open.

⇒ 不声明 ⇒ **仓库级 MCP 服务器与仓库配置永久 gated，且 GUI 里没有任何途径解锁**。
对一个要打开用户仓库的编码 agent 桌面，这是真功能洞。

### 声明后的语义（`folder_trust_prompt.rs:221-262`）

| 我们的应答 | 内核行为 |
|---|---|
| `{outcome:"trust"}` | `grant_folder_trust(cwd)` **持久化授权** + `resolve_and_record(cwd,false)` 翻转缓存判定 + `reload_project_servers_after_grant`（热重载项目 MCP / 插件 / managed 缓存 / auth） |
| `{outcome:"reject"}` | **保留 dedup key**（同进程内不再重复问），工作区继续 gated；拒绝**不持久化** |
| 超时 / 不可解码 / 传输错 | 判为「not a decision」⇒ stay gated 且**释放** dedup key ⇒ 下次重问 |

`#[serde(other)]`（`:61`）使**任何非 "trust" 的值都解码为 Reject**——fail-closed，
只有显式 `"trust"` 解锁。所以回 JSON-RPC error（METHOD_NOT_FOUND）在语义上等于 Reject，
但会被归入「not a decision」而释放 dedup key ⇒ **每次开会话重问**。
⇒ 连接层在无人裁决时回**显式** `FOLDER_TRUST_REJECT`，不回 error。

安全性：授权是**持久化**的，故绝不能自动 trust。UI 未落地前的默认是显式 reject
（等于今天的实际效果，但不制造提问风暴）。

### 关键限定：本机自建内核上它是 **inert** 的

`nofy-workspace/src/folder_trust.rs:161-167`：

> **Local/dev builds never gate (auto-trust)**: folder-trust applies only to shipped,
> release-stamped binaries. Even an explicit `NOFY_FOLDER_TRUST`/config opt-in is
> ignored here so **a self-built nofy never prompts**.

且 `folder_trust_inert() = is_local_build()`（`:125-126`）。

本机内核 `nofy --version` = **0.2.121 (1431aa44508c)**，该 commit 即本仓库 HEAD
`1431aa4` ⇒ 自建二进制 ⇒ `is_local_build() == true` ⇒ **folder trust 全程 inert、
一律 auto-trust、内核永不发 `folder_trust/request`**。

⇒ **纠正上一轮的说法**：我曾称这是「P1 阻塞项」。准确说法是
**发布阻塞项，不是开发阻塞项**——在开发机上它无法被触发，因此不阻塞 P1 的会话脊柱；
但一旦对 release-stamped 内核发布，未声明就等于仓库级 MCP 永久不可用且无法解锁。

release-stamped 构建上的开关优先级（`:152-178`，`BoolFlag` 链）：

```
env NOFY_FOLDER_TRUST  >  [folder_trust] enabled（用户配置）  >  managed  >  default true
```

即**默认开启**，用户可显式关掉。⇒ UI 应展示**实际生效状态**，不能假定它一定开。

触发还需 `prompt_warranted(cwd)`（`nofy-shell/src/agent/folder_trust.rs:155-164`）：
`decide(feature_enabled(), …) == TrustOutcome::Prompt`，实际条件为
「feature on + 该工作区未信任 + **仓库级可执行配置存在**」。
其测试（`:1465-1474`）用的标记文件是 `.mcp.json`；`repo_config_kinds` 还包含
`.nofy/lsp.json` 等（`:166-177`，注意 lsp 会让文件夹被 gated，但**授权后的热重载跳过 LSP**，
项目 LSP 在下次开会话时生效）。

⇒ 我们的 smoke **不能**依赖观察到 folder_trust 请求（开发机上不会出现），
故 connection.test.ts 用合成帧覆盖两条路径（有/无监听者）。

---

## ② `nofy/codeNavigation.enabled` = **不声明**（P6 再开）

门的是**代码库索引的启动资格**：`code_nav.rs:19-40` 的
`start_codebase_index_for_code_nav` → `nofy_codebase_graph::IndexManagerHandle`，
并把索引 pin 到发起会话（防 Weak 立刻 orphan）。

声明了，内核就可能为一个**我们还没有任何界面**的功能在后台起索引——纯成本、零收益。

与 folderTrust 的关键差别：**不声明不会让任何东西被 gated**，只是拿不到
`_nofy/code/{goto-definition, find-references, find-definitions, goto-references, status}`
（这五个都在 `EXT_DISPATCH_ONLY` 里，是真实存在的能力）。

实测旁证：golden-turn 的 `session/new` 响应里 `_meta.codebaseIndexed = []`。

⇒ **登记为 P6 开关**，与代码导航 UI 同批打开。`caps.ts` 里留了占位注释，
防止有人「顺手补全」而无意启动索引。

---

## ③ `nofy/mcp/sdk_call` = **无客户端能力门可声明**，P5 前不实现

查全树：**没有**对应的 client 侧声明点（`parse_*_capability` 只有上面两个）。

- initialize **响应**里的 `_meta["nofy/mcp/sdk"] = true` 是**内核单向通告**，
  不是等我们回声明。`acp_agent.rs:387`：「channel (`nofy/mcp/sdk_call`);
  the SDK reads this to enable transport="acp"」。
- `sdk_call` 是**只发不收的反向方法**：`extensions/mcp.rs:2011-2025`
  「The emit-only reverse method (`nofy/mcp/sdk_call`) shares the `nofy/mcp/` …」、
  测试 `inbound_sdk_call_has_no_forward_route` 断言「inbound `nofy/mcp/sdk_call`
  must not resolve to a forward handler」。内核侧实现在 `session/acp_mcp.rs`
  （`GatewayAcpInvoker`，每次 invoke 发一个反向请求）；注册点
  `session/acp_session_impl/spawn.rs:929`「Registered in-process SDK MCP servers」。

含义：用户若配置了 **in-process SDK 型** MCP 服务器（由客户端进程内宿主），
内核会向我们发 `sdk_call` 反向请求来调用它的工具。不实现 ⇒ 该类服务器不可用。

⇒ 裁定：**P5（生态面）之前不实现**，落到连接层默认的 METHOD_NOT_FOUND。
但必须**逐服务器诚实上报**「该服务器需要桌面内嵌 MCP 宿主，尚未实现」，
不得静默失败（PLAN §7.3）。

当前无实际影响：本机 initialize 的 `_meta.mcpServers = []`，
golden-turn 里唯一加载的 `gitnexus` 是 `source=local` 的常规本地服务器
（`_nofy/mcp/server_status`：`status=ready, reason=initialized`），不走 SDK 通道。

---

## 4. 汇总

| 能力 | 裁定 | 落点 | 何时复核 |
|---|---|---|---|
| `folderTrust.interactive` | **声明 true** | `caps.ts` 的 `CLIENT_CAPABILITY_META` | 换 release-stamped 内核时，实测确认提示真的会来 |
| `codeNavigation.enabled` | **不声明** | `caps.ts` 占位注释 | P6 代码导航 UI 同批打开 |
| `mcp/sdk_call` | **无门可声明；不实现** | 连接层默认 METHOD_NOT_FOUND | P5 生态面 |
| `fs.*` / `terminal` | **false / 不声明** | `caps.ts` | 若将来要桌面自管文件/终端再议 |
| `elicitation` | `{form:{},url:{}}` | `caps.ts` | P2 问答保真时按 requestedSchema 全类型复核 |

## 5. 待办（由本裁定产生）

1. **P1**：folder trust 对话框（展示 `cwd` 与 `configKinds` 作为「为什么被 gated」的理由，
   内核已保证理由列表与实际 gate 同源，见 `folder_trust.rs:166-171`）。
   UI 未落地前保持显式 reject + 告警，并在界面上诚实说明仓库级 MCP 未加载的原因。
2. **P5**：逐 MCP 服务器展示传输类型；SDK 型标注「需桌面内嵌宿主，未实现」。
3. **P6**：打开 codeNavigation 并接 `_nofy/code/*` 五个方法。
4. 换 release-stamped 内核时：重跑 `smoke:real` 并新增一个「带 `.mcp.json` 的临时仓库」
   用例，实测 folder_trust 请求是否到达（开发机上无法验证这一点）。

