/**
 * clientCapabilities 与 initialize 常量。
 *
 * ## 三个能力门的裁定（2026-09-09，全部有内核源码依据）
 *
 * 内核只认两个 _meta 能力门（全树仅这两个 parse_*_capability）：
 *   1. nofy/folderTrust.interactive  —— folder_trust_prompt.rs:75-83
 *   2. nofy/codeNavigation.enabled   —— code_nav.rs:9-17
 * 外加标准 clientCapabilities.fs / .terminal（agent_ops.rs:2654-2662）。
 *
 * ### ① folderTrust.interactive = **true**（声明）
 * 不声明的后果不是会话坏掉，而是 folder_trust_prompt.rs 文档注释说的
 * 「DORMANT no-op」＋「the session was already created with **project servers GATED**」
 * ⇒ **仓库级 MCP 服务器与仓库配置永久不加载，且 GUI 里没有任何途径解锁**。
 * 对一个要打开用户仓库的编码 agent 桌面，这是真功能洞，故必须声明。
 * 声明后语义（同文件 :221-262）：
 *   - Trust   → grant_folder_trust(cwd) **持久化授权** + resolve_and_record + 热重载
 *               项目 MCP/插件/managed 缓存/auth（reload_project_servers_after_grant）
 *   - Reject  → **保留 dedup key**（同一进程内不再重复问），工作区继续 gated；
 *               拒绝**不持久化**，仅进程内记账
 *   - 超时/不可解码/传输错 → 「not a decision」→ stay gated 且**释放** dedup key（下次重问）
 * 触发还需 prompt_warranted（feature on + untrusted + 仓库配置存在），故不会滥发；
 * 且整个提示跑在 detached spawn_local 里、受 TRUST_PROMPT_TIMEOUT 约束，
 * **不会阻塞 session/new 的响应**。
 *
 * ### ② codeNavigation.enabled = **不声明**（P6/P7 再开）
 * 它门的是**代码库索引的启动资格**（code_nav.rs:19-40 start_codebase_index_for_code_nav
 * → nofy_codebase_graph IndexManagerHandle，并 pin 到会话）。声明了内核就可能为一个
 * **我们还没有任何界面**的功能在后台起索引——纯成本零收益。
 * 与 folderTrust 不同：不声明**不会**让任何东西被 gated，只是拿不到
 * _nofy/code/{goto-definition,find-references,find-definitions,goto-references,status}。
 * 实测旁证：golden-turn 的 session/new 响应里 _meta.codebaseIndexed = []。
 * ⇒ 登记为 P6 开关，届时与代码导航 UI 同批打开。
 *
 * ### ③ nofy/mcp/sdk_call —— **无客户端能力门可声明**
 * 全树查无 client 侧声明点：initialize 响应里的 _meta["nofy/mcp/sdk"]=true 是**内核单向
 * 通告**（acp_agent.rs:387「the SDK reads this to enable transport=acp」），
 * 不是等我们回声明。sdk_call 是**只发不收的反向方法**
 * （extensions/mcp.rs:2011-2025「emit-only reverse method」「inbound nofy/mcp/sdk_call
 * must not resolve to a forward handler」；session/acp_mcp.rs 是它的内核侧实现）。
 * 含义：用户若配置了 in-process SDK 型 MCP 服务器，内核会向我们发 sdk_call 反向请求。
 * ⇒ 裁定：**P5 之前不实现**，落到连接层默认的 METHOD_NOT_FOUND；但必须**逐服务器诚实
 * 上报**「该服务器需要桌面内嵌 MCP 宿主，尚未实现」，不得静默失败（PLAN §7.3）。
 * 实测本机 initialize 的 _meta.mcpServers = []，唯一加载的 gitnexus 是 source=local
 * 的常规本地服务器，不走 SDK 通道 ⇒ 当前无实际影响。
 *
 * ## ⚠ 声明位置的陷阱
 * folder_trust_prompt.rs:375 明写「Production reads `client_capabilities.meta`,
 * **not** top-level request meta」。故能力必须放在 clientCapabilities._meta 里；
 * 放在 initialize 请求顶层的 _meta（那是 clientIdentifier 的位置）**不生效**。
 * 旧 seam 的 handshake 只有顶层 _meta，若照抄则声明静默失效。
 */
import { ACP_PROTOCOL_VERSION } from "./generated/wire-names.ts";
import { CLIENT_IDENTIFIER } from "./identity.ts";

/**
 * fs / terminal **不声明能力**（PORTING-PLAN §2.3，已由 agent_ops.rs:2654-2662 复核）：
 * 只有声明为 true 内核才会把 fs/read_text_file、fs/write_text_file、terminal/* 委托给我们，
 * 否则内核用本地实现自管。交互式 PTY 另有 _nofy/terminal/pty/* 扩展，与此无关。
 */
export const CLIENT_CAPABILITIES_FS = { readTextFile: false, writeTextFile: false } as const;

/** _meta 能力门。见文件头三条裁定。 */
export const CLIENT_CAPABILITY_META = {
  /** ① 声明：否则仓库级 MCP/配置永久 gated 且 GUI 无解锁途径。 */
  "nofy/folderTrust": { interactive: true },
  /**
   * ② **刻意不声明** nofy/codeNavigation —— 见文件头。
   * 留此注释占位，防止有人「顺手补全」而无意启动代码库索引。
   * 打开条件：P6 代码导航 UI 同批落地。
   */
} as const;

export const CLIENT_CAPABILITIES = {
  fs: CLIENT_CAPABILITIES_FS,
  elicitation: { form: {}, url: {} },
  _meta: CLIENT_CAPABILITY_META,
} as const;

/**
 * initialize 的 protocolVersion。取自生成的权威值，不再手写常量——
 * 上游 schema 升版时这里自动跟随，drift 测试负责报警。
 */
export const PROTOCOL_VERSION = ACP_PROTOCOL_VERSION;

/**
 * initialize 请求载荷。
 *
 * 两个 _meta 位置**都**要，语义不同，不可混：
 *   - 顶层 _meta.clientIdentifier —— 客户端身份（内核认 "nofy-desktop"，
 *     Desktop/TUI 类拿到比 Generic 更丰富的 bash 作用域权限选项）
 *   - clientCapabilities._meta   —— 能力门（folderTrust / codeNavigation）
 */
export function initializeParams(clientVersion: string) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    clientCapabilities: CLIENT_CAPABILITIES,
    clientInfo: { name: CLIENT_IDENTIFIER, version: clientVersion },
    _meta: { clientIdentifier: CLIENT_IDENTIFIER },
  };
}

/** folder trust 应答。fail-closed：只有 "trust" 解锁（#[serde(other)] 使其余全为 Reject）。 */
export const FOLDER_TRUST_TRUST = { outcome: "trust" } as const;
export const FOLDER_TRUST_REJECT = { outcome: "reject" } as const;

export type ClientCapabilities = typeof CLIENT_CAPABILITIES;
export type InitializeParams = ReturnType<typeof initializeParams>;

