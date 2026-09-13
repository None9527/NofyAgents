# 外部参照：wangru8080/codex-web（v0.10.8）

评估日期 2026-09-09。它是「基于 Codex app-server 的浏览器 Web 工作台」，
与本项目架构同构，只差一跳：

```
codex-web   : browser  ⇄ WebSocket ⇄ Node server ⇄ stdio ⇄ codex app-server
nofy-desktop: renderer ⇄ IPC       ⇄ Electron main ⇄ stdio ⇄ nofy agent stdio
```

## ⚠ 红线：license 为 UNLICENSED

其 package.json 明写 `"license": "UNLICENSED"`——**未授权即保留全部权利**。

- 允许：读它的**架构、模式、选型、测试族形状**，据此独立设计与编码。
- 禁止：复制其代码，禁止把仓库放进本仓库，禁止「近似改写」。
- 本项目从它那里得到的全部产物都是**模式层面**的，见下。
  唯一逐字进入本仓库的第三方代码来自 `agent-client-protocol-schema`
  （**Apache-2.0**，LICENSE 已随 schema 入库），与 codex-web 无关。

## 采纳了什么

| 它的做法 | 我们怎么落地 | 状态 |
|---|---|---|
| 协议契约**机器生成**：`src/codex/protocol/generated/` 87 个 TS 文件，手写只有 `json-rpc.ts` 100 行 | `packages/acp/schema/` 入库 ACP 权威 schema+meta（Apache-2.0 crate 的 `generate.rs` 产物），`scripts/gen-wire-names.ts` 生成线路名表；手写常量引用生成值 + `satisfies` 约束 | ✅ PLAN §12 |
| 协议级 smoke 族：interrupt / reconnect(+--streaming) / app-server-recovery / user-input-server-request / permission-policy / config-runtime-hot-reload / history-pagination-regression / performance-baseline | 作为 S1b 之后的门的路线图；已落 `recovery-smoke.ts`（11/11） | 🟡 1/8 |
| 测试隔离：`resolveTestCodexHome()` + 设 `CODEX_HOME` + **断言隔离生效** | `main/kernel/test-home.ts` 造 mktemp `NOFY_HOME`；smoke ③ 号门断言 workspace_list 为 0（真库 5/82） | ✅ |
| `PersistentAppServer`：一个 agent 进程 + N 个消费者；缓存上游 initialize 响应回放给后到者；`pendingServerRequests` 跨重连存活；退避重启；恢复期发诚实错误并以 WS 1013(Try Again Later) 主动断开 | 定案为 PLAN §11 未决 #5 的多窗口范式 | ✅ 已定案 |
| 选型：streamdown(+code/math/mermaid/cjk)、react-virtuoso、use-stick-to-bottom、@xterm/xterm 6、shiki 3、12 个主题 JSON + next-themes | 写进 PLAN §4；主题 JSON 化正合「先按 ZCode 风格走、之后再调整」 | ✅ |

## 没采纳什么（以及为什么）

- **Next.js / 浏览器形态**。我们是本地优先的桌面应用。
- **多用户 runtime broker 族**（`runtime-broker-*` 9 个文件）、`web-auth`、
  Cloudflare Turnstile、`user-runtime-registry`、多用户 smoke——那是托管多用户
  web 产品的必需品，占其 server/ 3,699 行的一大半，与我们无关。
- **npm 包 + CLI + systemd/launchd 分发**。分发模型不同。
  （若将来要做浏览器/远程模式，它的形态说明我们的 `packages/acp` 与 main 侧连接
  可以原样坐在一个 WS bridge 后面——这反过来印证了裁定 B。）

## 一条要长期记住的差异

Codex app-server 要求 `initialize` 之后补发 `notify("initialized")`；
**nofy 不要求**（源码零命中，且我们从不发也 7/7 全过）。
详见 `initialize-measured.md` §6.2。照抄它的生命周期会平白多一个 no-op。

## 规模对照（供估算）

| | codex-web | nofy-desktop（当前） |
|---|---|---|
| 协议层 | `src/codex/protocol` 6,372 行（87 生成 + 100 手写） | `packages/acp` ~700 行（生成表 + 手写扩展层 + 帧分类） |
| 服务端 | `server/` 3,699 行（含大量多用户/鉴权） | `apps/desktop/main/` ~800 行（无鉴权、无多用户） |
| 测试 | vitest + 十余个 smoke 脚本 | node:test 36 例 + 2 个 smoke（7/7、11/11） |

它的协议层 6,372 行是个有用的标尺：我们把 `schema.unstable.json`（290KB）
真正展开成类型与 zod 校验器之后，`packages/acp` 也会长到那个量级——**这是预期的**，
且其中绝大部分应是生成物。

