/**
 * Effect 层——TUI 架构的第三段（nofy-tui-full-spec.md §0.1）：
 *
 *   Action → dispatch(纯同步) → **Effect(异步)** → TaskResult
 *
 * 这一层是**请求与通知之分的强制点**。陷阱 T1（session/cancel 是 notification）与
 * T13（toggle_plan_mode / queue/* 是 notification）都在此结构性消除：
 * 每个 Effect 走哪个出站原语是写死在这里的，调用方无从选错。
 *
 * 判据一律来自内核源码提取件（packages/acp/schema/kernel-ext-usage.json）：
 *   EXT_REQUEST  → port.request / extRequest（等响应）
 *   EXT_NOTIFY   → port.notify（不等响应；第一方 pager 用 ExtNotification::new 发）
 *   AGENT_METHOD.cancel → port.cancel（notification，message.rs:387-391）
 *   EXT_SERVER_REQUEST 的应答 → port.respond
 */
import {
  AGENT_METHOD,
  CLIENT_SIDE_METHOD,
  EXT_CLIENT_REQUEST,
  EXT_DISPATCH_ONLY,
  EXT_DISPATCH_NOTIFY,
  EXT_NOTIFY,
  EXT_SERVER_REQUEST,
  EXT_REQUEST,
} from "@nofy-desktop/acp";
import { SERVICE_REQUESTS } from "./service-actions.ts";
import type { ServiceOperation } from "./service-actions.ts";
import { encodePtyInput } from "./events.ts";
import type { RpcId } from "./kernel-port.ts";
import type { KernelPort } from "./kernel-port.ts";
import { hydrateFromResponse } from "./bind.ts";
import type { Action } from "./project.ts";
import type { Store } from "./store/store.ts";
import type { AppState } from "./store/state.ts";
import { parseCancel, parseKill, parseScheduleDelete, parseSubagentList, parseTaskList } from "./taskMonitor.ts";

export type Effect =
  | { kind: "service/request"; operation: ServiceOperation; params: Record<string, unknown> }
  | { kind: "session/new"; cwd: string; modelId?: string | null; activate?: boolean }
  | { kind: "session/load"; sessionId: string; cwd: string; activate?: boolean; fresh?: boolean }
  | {
      kind: "session/prompt";
      sessionId: string;
      promptId?: string;
      text: string;
      /**
       * 附加上下文（composer 的「+」）。每项变成一个 resource_link 块，排在文本块前。
       * 〔线路真相〕prompt 收 resource_link（prompt_parser.rs:113-118）：meta 为空时内核
       * 自己把 "@路径" 展开成文件内容并进 <system-reminder> 引用段——客户端不读文件。
       */
      attach?: Array<{ path: string; name: string }>;
    }
  | { kind: "session/cancel"; sessionId: string; cancelSubagents?: boolean }
  /** 切模型。effort 给定时走内核 pager 同一条线路：session/set_model 的
   * _meta["reasoningEffort"]（nofy-sampling-types types.rs:785/818，pager
   * SwitchModel effects/mod.rs:1516-1535 逐字同机制）。 */
  | { kind: "session/setModel"; sessionId: string; modelId: string; effort?: string }
  | { kind: "session/setMode"; sessionId: string; modeId: string }
  | { kind: "roster/pull" }
  /** `_nofy/session_summaries/workspace_list` with `{}`. The renderer keeps the body; this does not write the store. */
  | { kind: "workspaces/pull" }
  | {
      /**
       * 客户端→内核的权限模式通知（acp_agent.rs:1245-1320 实测分派臂）。
       * params 词汇：{clientIdentifier, permission_mode, yolo_mode?, auto_mode?}；
       * permission_mode ∈ default/ask/auto/always-approve（pager settings 词表同族）。
       */
      kind: "perm/notify";
      params: Record<string, unknown>;
    }
  /**
   * 读会话上下文用量。形状已实测（session-read-shapes.md §2）：
   * context{used,total,usagePct,freeTokens, 四段分解, autoCompactThresholdPercent=85}。
   * 界面**不自己算 token**——内核给全了，连阈值线都有。
   */
  | { kind: "session/info"; sessionId: string }
  | { kind: "permission/respond"; id: RpcId; optionId: string }
  | { kind: "permission/dismiss"; id: RpcId }
  /**
   * 取消一个**非权限**的内核→客户端请求（问答 / 退出计划模式 / elicitation /
   * 工作区信任）。取消载荷**按方法分族**，来源不是猜测而是 connection.ts 里
   * 已经落地并被内核实测过的 fail-safe 应答形状。
   * 表外方法**不猜**：返回失败，请求保持挂起，由用户按 Stop（session/cancel，
   * 它会连带把该会话所有挂起请求应答 cancelled）兜底。
   */
  | { kind: "interaction/cancel"; id: RpcId; method: string }
  /**
   * 问答裁决面（_nofy/ask_user_question）正向应答。载荷由 questionModel 逐字按
   * 内核契约造好（types.rs AskUserQuestionExtResponse，internally tagged on outcome）：
   *   {outcome:"accepted", answers:{<题干原文>:[label,…]}, annotations?:{<q>:{preview?,notes?}}}
   * 取消不走这里——走 interaction/cancel 的已登记形状 {outcome:"cancelled"}。
   */
  | { kind: "interaction/answer"; id: RpcId; payload: Record<string, unknown> }
  | { kind: "folderTrust/respond"; id: RpcId; trust: boolean }
  /** 队列操作：**全部是通知**（EXT_NOTIFY），不等响应。P3 活任务面用。 */
  | { kind: "queue/edit"; sessionId: string; entryId: string; newText: string }
  | { kind: "queue/remove"; sessionId: string; entryId: string }
  | { kind: "queue/clear"; sessionId: string }
  /** 模式切换：通知。真开 always-approve 还需本地切芯片（permission-flow-measured.md §3）。 */
  | { kind: "togglePlanMode"; sessionId: string }
  /**
   * 文件面（生态面 #2）。参数形状来自内核源码 FsListRequest/FsReadFileRequest
   * （extensions/fs.rs，camelCase）+ 探针实测（ecosystem-shapes.json）：
   *   fs/list     {sessionId?, path, depth=1, includeHidden=true, limit=1000, …}
   *               ⇒ 界面**必须**显式 includeHidden:false，否则 .git 全进来（实测）。
   *   fs/read_file{sessionId?, path, maxBytes=1MiB, maxLines?, …}
   * 两者都是 EXT_DISPATCH_ONLY（请求，等响应）。
   */
  | { kind: "fs/list"; sessionId: string | null; path: string; depth?: number; includeHidden?: boolean; limit?: number }
  | { kind: "fs/readFile"; sessionId: string | null; path: string; maxLines?: number }
  /**
   * 模糊文件搜索（生态面 #2 的搜索框）。三段生命周期已实测：
   *   open   → {result:{sessionId, searchId}}
   *   change → {result:{sessionId, searchId}}，**结果不在响应里**，
   *             走 _nofy/search/fuzzy/status 通知（EXT_EMIT_CLIENT，handle.rs:2321）
   *   close  → {result:{…, closed}}
   */
  | { kind: "search/fuzzyOpen"; sessionId: string | null; cwd: string }
  | { kind: "search/fuzzyChange"; searchId: string; query: string }
  | { kind: "search/fuzzyClose"; searchId: string }
  /**
   * 审查面（生态面 #4）。三条读路径的参数形状来自探针实测（ecosystem-shapes.json）：
   *   git/status {sessionId, includeUntracked, includeStats, includePatches}
   *     ⇒ result{root,branch,commit,staged[],unstaged[]}，条目带 patch（unified diff 文本）
   *   git/diffs  {sessionId, from, to, includePatch, mergeBase}
   *     ⇒ from 为 HEAD 时必须大写（小写静默空）；result{files[]}
   *     mergeBase 只在 from/to 都是提交引用时生效。基准分支来自 git/branches。
   *   git/branches {sessionId} ⇒ {result:{currentBranch, repoRoot, branches[{name,current,remote}]}}
   *   git/files  {sessionId, paths[], version}
   *     ⇒ **version 必须大写 "HEAD"**；result{files[{path,version,content,isBinary}],errors[]}
   *   git/stage    {sessionId, paths[]}
   *   git/unstage  {sessionId, paths[]}
   *   git/discard  {sessionId, paths[], scope: working|staged|both, includeUntracked}
   *   git/commit   {sessionId, message, push}  只有用户勾了提交并推送才把 push 设为 true
   *   git/checkout {sessionId, branch, create}  create true 建分支，false 切换已有分支
   * 写路径不发送 stage/content、amend、signoff、sync、stageAll，也不单独推送。
   * 失败走 JSON-RPC error.data 里的内核原文。提交成功时 result 与 error 可以同时在，error 是警告。
   * 这些都是 EXT_DISPATCH_ONLY（请求，等响应）。
   */
  | { kind: "git/status"; sessionId: string; includeUntracked?: boolean; includeStats?: boolean; includePatches?: boolean }
  /**
   * 生态面 #5 四读（阶段 C）。全是请求（等响应）；参数/响应形状双证据：
   * 内核 codegen 型（nofy-hooks-plugins-types/src/lib.rs camelCase；skills 在
   * nofy-shell extensions/skills.rs）＋探针实测（docs/contract/ecosystem-shapes.json）：
   *   skills/list     {cwd}                 ⇒ {skills:[…]}（155 条实测）
   *   skills/toggle   {name, enabled, cwd}  ⇒ 成功时同样是 SkillsListResponse {skills:[…]}
   *     失败仍是成功的 JSON-RPC 帧：{result:null, error:"…"}。这里只原样带回 value。
   *   plugins/list    {sessionId}           ⇒ {plugins:[…]}
   *   marketplace/list {}                  ⇒ {sources:[…]}（292 条实测）
   *   mcp/list        {sessionId, cache:false} ⇒ {servers:[…]}
   * skills/add|remove|config|reset 不接线。
   */
  | { kind: "eco/skills"; cwd: string }
  | { kind: "skills/toggle"; name: string; enabled: boolean; cwd: string }
  | { kind: "eco/plugins"; sessionId: string }
  | { kind: "eco/marketplace" }
  | { kind: "eco/mcp"; sessionId: string }
  | { kind: "git/diffs"; sessionId: string; from?: string; to?: string; includePatch?: boolean; mergeBase?: boolean }
  | { kind: "git/branches"; sessionId: string }
  | { kind: "git/files"; sessionId: string; paths: string[]; version?: string }
  | { kind: "git/stage"; sessionId: string; paths: string[] }
  | { kind: "git/unstage"; sessionId: string; paths: string[] }
  | { kind: "git/discard"; sessionId: string; paths: string[]; scope: "working" | "staged" | "both"; includeUntracked: boolean }
  | { kind: "git/commit"; sessionId: string; message: string; push: boolean }
  | { kind: "git/checkout"; sessionId: string; branch: string; create: boolean }
  /**
   * 终端面（生态面 #3）。形状全部探针实测（ecosystem-shapes.json）：
   *   pty/create {sessionId, cwd, rows, cols, name, env[{name,value}]} ⇒ {result:{terminalId}}
   *   pty/load   {terminalId} ⇒ {result:{terminalId, rows, cols, exited}}
   *   pty/resize {terminalId, rows, cols} ⇒ result null
   *   pty/input  **notify + data:<base64>**（rpc 得 -32601；input 键静默丢弃——两条都实测过）
  *   kill       {terminalId, sessionId} ⇒ {result:{outcome:"killed"}}
  *   list       {sessionId} ⇒ {result:{terminals[{terminalId,status,interactive,name,exitCode,cwd,outputOffset,createdAt}]}}
 * 输出不走响应：_nofy/terminal/pty/notification 通知帧 → ptybus（流不进 store）。
 *
 * 两条读源码得到的事实（会影响调用方怎么用这些 effect）：
 *   · **list 忽略 sessionId**：分派臂直接调全局 list_terminals()（extensions/terminal.rs:342-345），
 *     而它是 list_ptys() + list_piped_terminals() 的合并（nofy-shell-terminal/src/lib.rs:105-110）
 *     ⇒ 拿到的是**全内核**清单，里面混着 agent 跑 bash 工具的非交互终端（interactive=false）。
 *     过滤是调用方的事（dockModel.adoptableTerminals）。
 *   · **kill 对 pty 忽略 sessionId**（terminal.rs 的 KillTerminalRequest 注释：pty 只按 terminalId 找；
 *     sessionId 只对管道终端是必需的）⇒ 形状照实测带 sessionId，语义上对 pty 无影响。
 *   · create 的 shell 参数决定要不要 "-l"：显式给 shell ⇒ 原样执行不加 -l；
 *     不给 ⇒ $SHELL + "-l"（pty_session.rs:709-718）。dock 刻意不给（第一方默认行为）。
   * **回显纪律**：input 是通知、没有错误通道，写入成功与否只能靠输出帧回显验证
   * （scripts/pty-smoke.ts 把这条做成了门）。
   */
  | { kind: "terminal/list"; sessionId: string }
  | { kind: "terminal/create"; sessionId: string; cwd: string; rows: number; cols: number; name: string; shell?: string }
  | { kind: "terminal/load"; terminalId: string }
  | { kind: "terminal/resize"; terminalId: string; rows: number; cols: number }
  | { kind: "terminal/input"; terminalId: string; text: string }
  | { kind: "terminal/kill"; terminalId: string; sessionId: string }
  /**
   * 后台任务对账与三条写请求。清单失败不得派发空数组。
   * kill 先在本地记 pending，响应或断线后再清；cancel 不写 subagentFinished。
   */
  | { kind: "tasks/reconcile"; sessionId: string }
  | { kind: "task/kill"; sessionId: string; taskId: string }
  | { kind: "subagent/cancel"; sessionId: string; subagentId: string }
  | { kind: "scheduler/delete"; sessionId: string; taskId: string };

export type TaskResult =
  | { ok: true; effect: Effect["kind"]; value?: unknown }
  | { ok: false; effect: Effect["kind"]; error: string };

function fail(kind: Effect["kind"], e: unknown): TaskResult {
  return { ok: false, effect: kind, error: e instanceof Error ? e.message : String(e) };
}

const STALE_CONNECTION = "连接已变化，请等待会话恢复后重试";

function openEpoch(store: Store<AppState, Action>): number | null {
  const connection = store.getState().connection;
  return connection.status === "ready" ? connection.transportEpoch : null;
}

/**
 * 各族请求的「取消」应答形状。
 *
 * 唯一来源是 main/acp/connection.ts 的 handleServerRequest —— 那里的自动应答
 * 是从旧 seam 移植并经真内核验证过的行为，本表只是把同一份知识搬到 Effect 层，
 * 让「谁能发什么应答」仍然只有一个强制点。
 *
 * 返回 null 表示**表外方法**：按「一条不造」纪律不编载荷。
 */
function cancelPayloadFor(method: string): Record<string, unknown> | null {
  switch (method) {
    case CLIENT_SIDE_METHOD.requestPermission:
      return { outcome: { outcome: "cancelled" } };
    case EXT_SERVER_REQUEST.askUserQuestion:
    case EXT_SERVER_REQUEST.exitPlanMode:
      return { outcome: "cancelled" };
    case CLIENT_SIDE_METHOD.elicitation:
          return { action: { outcome: "cancelled" } };
    case EXT_SERVER_REQUEST.mcpElicit:
      return { outcome: "cancel" };
    case EXT_SERVER_REQUEST.folderTrustRequest:
      // fail-closed：只有 "trust" 解锁；reject 是一个**决定**（保留 dedup key），
      // 语义比不应答干净（folder_trust_prompt.rs:221-228）。
      return { outcome: "reject" };
    default:
      return null;
  }
}

/**
 * 执行一个 Effect。
 *
 * 乐观更新只做**不会与内核回声冲突**的那部分：prompt 不乐观插用户块
 * （内核会发 user_message_chunk，乐观插会重复），只乐观置 turn-running。
 */
export async function runEffect(
  port: KernelPort,
  store: Store<AppState, Action>,
  effect: Effect,
): Promise<TaskResult> {
  const dispatch = (a: Action): void => store.dispatch(a);
  switch (effect.kind) {
    case "service/request": {
      try {
        const method = Object.hasOwn(SERVICE_REQUESTS, effect.operation) ? SERVICE_REQUESTS[effect.operation] : undefined;
        if (!method) return { ok: false, effect: effect.kind, error: "Unsupported service operation" };
        const value = effect.operation === "modelAuthenticate"
          ? await port.request(method, effect.params)
          : await port.extRequest(method, effect.params);
        return { ok: true, effect: effect.kind, value };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "session/new": {
      try {
        const res = await port.request(AGENT_METHOD.newSession, {
          cwd: effect.cwd,
          mcpServers: [],
          _meta: effect.modelId != null ? { modelId: effect.modelId } : {},
        });
        const h = hydrateFromResponse(res);
        if (h.sessionId === null) return { ok: false, effect: effect.kind, error: "session/new 未返回 sessionId" };
        dispatch({ type: "session/created", sessionId: h.sessionId, cwd: h.cwd, modelId: h.modelId, activate: effect.activate });
        dispatch({
          type: "session/hydrated",
          sessionId: h.sessionId,
          title: h.title,
          titleSource: "load-response",
          kind: h.kind,
          modelOptions: h.modelOptions,
        });
        return { ok: true, effect: effect.kind, value: h.sessionId };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "session/load": {
      try {
        if (effect.fresh) dispatch({ type: "session/replay-reset", sessionId: effect.sessionId });
        const res = await port.request(AGENT_METHOD.loadSession, {
          sessionId: effect.sessionId,
          cwd: effect.cwd,
          mcpServers: [],
        });
        const h = hydrateFromResponse(res);
        const sid = h.sessionId ?? effect.sessionId;
        dispatch({ type: "session/created", sessionId: sid, cwd: h.cwd ?? effect.cwd, modelId: h.modelId, activate: effect.activate });
        // ⚠ 冷启动时标题**只能**从这里来（回放集不含 session_info_update /
        // session_summary_generated，见 replay-dedup-measured.md §2）。
        dispatch({
          type: "session/hydrated",
          sessionId: sid,
          title: h.title,
          titleSource: "load-response",
          kind: h.kind,
          modelOptions: h.modelOptions,
        });
        return { ok: true, effect: effect.kind, value: sid };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "session/prompt": {
      // 乐观：只置运行态，不插用户块（内核会发 user_message_chunk）
      const wasRunning = store.getState().sessions[effect.sessionId]?.agentState === "turn-running";
      if (!wasRunning) dispatch({ type: "session/turn-requested", sessionId: effect.sessionId });
      try {
        const blocks: Array<Record<string, unknown>> = [];
        for (const a of effect.attach ?? []) {
          blocks.push({ type: "resource_link", uri: "file://" + a.path, name: a.name });
        }
        blocks.push({ type: "text", text: effect.text });
        const res = await port.request(AGENT_METHOD.prompt, {
          sessionId: effect.sessionId,
          prompt: blocks,
          ...(effect.promptId ? { _meta: { promptId: effect.promptId } } : {}),
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        dispatch({ type: "session/turn-failed", sessionId: effect.sessionId, preserveRunning: wasRunning, error: e instanceof Error ? e.message : String(e) });
        return fail(effect.kind, e);
      }
    }
    case "session/cancel":
      // 陷阱 T1：cancel 是 notification。port.cancel 内部走 notify，并且会
      // 连带把该会话所有挂起权限请求应答 cancelled（PORTING-PLAN §2.3）。
      dispatch({ type: "session/cancel-requested", sessionId: effect.sessionId });
      port.cancel(effect.sessionId, effect.cancelSubagents === undefined ? undefined : { cancelSubagents: effect.cancelSubagents });
      return { ok: true, effect: effect.kind };
    case "session/setModel": {
      try {
        const params: Record<string, unknown> = {
          sessionId: effect.sessionId,
          modelId: effect.modelId,
        };
        if (effect.effort !== undefined) {
          params["_meta"] = { reasoningEffort: effect.effort };
        }
        const res = await port.request(AGENT_METHOD.setSessionModel, params);
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "session/setMode": {
      try {
        const res = await port.request(AGENT_METHOD.setSessionMode, {
          sessionId: effect.sessionId,
          modeId: effect.modeId,
        });
        // 回执即真相：内核只对 plan 推 current_mode_update，ask/default 靠这条回执读回。
        dispatch({ type: "session/mode-set", sessionId: effect.sessionId, mode: effect.modeId });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "session/info": {
      try {
        const res = await port.extRequest(EXT_REQUEST.sessionInfo, { sessionId: effect.sessionId });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "roster/pull": {
      try {
        const res = await port.extRequest(EXT_REQUEST.sessionsList, {});
        const o: Record<string, unknown> =
          res !== null && typeof res === "object" ? (res as Record<string, unknown>) : {};
        const resultRaw = o["result"];
        const inner: Record<string, unknown> =
          resultRaw !== null && typeof resultRaw === "object"
            ? (resultRaw as Record<string, unknown>)
            : o;
        const rows = Array.isArray(inner["sessions"]) ? inner["sessions"] : [];
        dispatch({ type: "kernel/event", event: { type: "roster/upsert", rows } });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "workspaces/pull": {
      try {
        const res = await port.extRequest(EXT_REQUEST.summariesWorkspaceList, {});
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "fs/list": {
      try {
        const params: Record<string, unknown> = {
          path: effect.path,
          depth: effect.depth ?? 1,
          includeHidden: effect.includeHidden ?? false,
          limit: effect.limit ?? 500,
        };
        if (effect.sessionId !== null) params["sessionId"] = effect.sessionId;
        const res = await port.extRequest(EXT_DISPATCH_ONLY.fs_list, params);
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "fs/readFile": {
      try {
        const params: Record<string, unknown> = { path: effect.path };
        if (effect.sessionId !== null) params["sessionId"] = effect.sessionId;
        if (effect.maxLines !== undefined) params["maxLines"] = effect.maxLines;
        const res = await port.extRequest(EXT_DISPATCH_ONLY.fs_read_file, params);
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "search/fuzzyOpen": {
      try {
        const params: Record<string, unknown> = { cwd: effect.cwd, hidden: false };
        if (effect.sessionId !== null) params["sessionId"] = effect.sessionId;
        const res = await port.extRequest(EXT_DISPATCH_ONLY.search_fuzzy_open, params);
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "search/fuzzyChange": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.search_fuzzy_change, {
          searchId: effect.searchId,
          query: effect.query,
          dirsOnly: false,
          limit: 80,
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "search/fuzzyClose": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.search_fuzzy_close, { searchId: effect.searchId });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "git/status": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.git_status, {
          sessionId: effect.sessionId,
          includeUntracked: effect.includeUntracked ?? true,
          includeStats: effect.includeStats ?? true,
          includePatches: effect.includePatches ?? true,
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "eco/skills": {
      try {
        const res = await port.extRequest(EXT_CLIENT_REQUEST.skills_list, { cwd: effect.cwd });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "skills/toggle": {
      try {
        const res = await port.extRequest(EXT_CLIENT_REQUEST.skills_toggle, {
          name: effect.name,
          enabled: effect.enabled,
          cwd: effect.cwd,
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "eco/plugins": {
      try {
        const res = await port.extRequest(EXT_CLIENT_REQUEST.plugins_list, { sessionId: effect.sessionId });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "eco/marketplace": {
      try {
        const res = await port.extRequest(EXT_CLIENT_REQUEST.marketplace_list, {});
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "eco/mcp": {
      try {
        const res = await port.extRequest(EXT_CLIENT_REQUEST.mcp_list, { sessionId: effect.sessionId, cache: false });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "git/diffs": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.git_diffs, {
          sessionId: effect.sessionId,
          from: effect.from ?? "HEAD",
          to: effect.to ?? "working",
          includePatch: effect.includePatch ?? true,
          mergeBase: effect.mergeBase === true,
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "git/branches": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.git_branches, { sessionId: effect.sessionId });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "git/files": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.git_files, {
          sessionId: effect.sessionId,
          paths: effect.paths,
          version: effect.version ?? "HEAD",
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "git/stage": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.git_stage, { sessionId: effect.sessionId, paths: effect.paths });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "git/unstage": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.git_unstage, { sessionId: effect.sessionId, paths: effect.paths });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "git/discard": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.git_discard, {
          sessionId: effect.sessionId,
          paths: effect.paths,
          scope: effect.scope,
          includeUntracked: effect.includeUntracked,
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "git/commit": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.git_commit, {
          sessionId: effect.sessionId,
          message: effect.message,
          push: effect.push === true,
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "git/checkout": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.git_checkout, {
          sessionId: effect.sessionId,
          branch: effect.branch,
          create: effect.create === true,
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "terminal/list": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.terminal_list, { sessionId: effect.sessionId });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "terminal/create": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.terminal_pty_create, {
          sessionId: effect.sessionId,
          cwd: effect.cwd,
          rows: effect.rows,
          cols: effect.cols,
          name: effect.name,
          ...(effect.shell ? { shell: effect.shell } : {}),
          env: [{ name: "TERM", value: "xterm-256color" }],
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "terminal/load": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.terminal_pty_load, { terminalId: effect.terminalId });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "terminal/resize": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.terminal_pty_resize, {
          terminalId: effect.terminalId,
          rows: effect.rows,
          cols: effect.cols,
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "terminal/input": {
      // notify：不等响应（也没有响应构造点）。成功与否靠输出帧回显（pty-smoke 门）。
      port.notify(EXT_DISPATCH_NOTIFY.terminal_pty_input, {
        terminalId: effect.terminalId,
        data: encodePtyInput(effect.text),
      });
      return { ok: true, effect: effect.kind };
    }
    case "terminal/kill": {
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.terminal_kill, {
          terminalId: effect.terminalId,
          sessionId: effect.sessionId,
        });
        return { ok: true, effect: effect.kind, value: res };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "tasks/reconcile": {
      const epoch = openEpoch(store);
      if (epoch === null) return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
      let error: string | null = null;
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.task_list, { sessionId: effect.sessionId });
        if (store.getState().connection.transportEpoch !== epoch) return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
        const parsed = parseTaskList(res);
        if (parsed.ok) dispatch({ type: "tasks/listed", sessionId: effect.sessionId, tasks: parsed.tasks });
        else error = parsed.error;
      } catch (e) {
        if (store.getState().connection.transportEpoch !== epoch) return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
        error = e instanceof Error ? e.message : String(e);
      }
      try {
        const res = await port.extRequest(EXT_DISPATCH_ONLY.subagent_list_running, { sessionId: effect.sessionId });
        if (store.getState().connection.transportEpoch !== epoch) return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
        const parsed = parseSubagentList(res);
        if (parsed.ok) dispatch({ type: "subagents/listed", sessionId: effect.sessionId, subagents: parsed.subagents });
        else if (error === null) error = parsed.error;
      } catch (e) {
        if (store.getState().connection.transportEpoch !== epoch) return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
        if (error === null) error = e instanceof Error ? e.message : String(e);
      }
      return error === null ? { ok: true, effect: effect.kind } : { ok: false, effect: effect.kind, error };
    }
    case "task/kill": {
      const epoch = openEpoch(store);
      if (epoch === null) return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
      dispatch({ type: "task/kill-requested", sessionId: effect.sessionId, taskId: effect.taskId, at: Date.now() });
      const clearPending = (): void => {
        dispatch({ type: "task/kill-resolved", sessionId: effect.sessionId, taskId: effect.taskId, outcome: null });
      };
      try {
        const res = await port.extRequest(EXT_REQUEST.taskKill, { sessionId: effect.sessionId, taskId: effect.taskId });
        if (store.getState().connection.transportEpoch !== epoch) {
          clearPending();
          return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
        }
        const parsed = parseKill(res);
        dispatch({ type: "task/kill-resolved", sessionId: effect.sessionId, taskId: effect.taskId, outcome: parsed.outcome });
        return parsed.error === null
          ? { ok: true, effect: effect.kind, value: parsed.outcome }
          : { ok: false, effect: effect.kind, error: parsed.error };
      } catch (e) {
        clearPending();
        if (store.getState().connection.transportEpoch !== epoch) return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
        return fail(effect.kind, e);
      }
    }
    case "subagent/cancel": {
      const epoch = openEpoch(store);
      if (epoch === null) return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
      try {
        const res = await port.extRequest(EXT_REQUEST.subagentCancel, { subagentId: effect.subagentId });
        if (store.getState().connection.transportEpoch !== epoch) return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
        const parsed = parseCancel(res);
        dispatch({ type: "subagent/cancel-resolved", sessionId: effect.sessionId, subagentId: effect.subagentId, outcome: parsed.outcome });
        return parsed.error === null
          ? { ok: true, effect: effect.kind, value: parsed.outcome }
          : { ok: false, effect: effect.kind, error: parsed.error };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "scheduler/delete": {
      const epoch = openEpoch(store);
      if (epoch === null) return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
      try {
        const res = await port.extRequest(EXT_REQUEST.schedulerDelete, { sessionId: effect.sessionId, taskId: effect.taskId });
        if (store.getState().connection.transportEpoch !== epoch) return { ok: false, effect: effect.kind, error: STALE_CONNECTION };
        const parsed = parseScheduleDelete(res);
        if (parsed.deleted !== null) {
          dispatch({ type: "schedule/delete-resolved", sessionId: effect.sessionId, taskId: effect.taskId, deleted: parsed.deleted });
        }
        return parsed.error === null
          ? { ok: true, effect: effect.kind, value: parsed.deleted }
          : { ok: false, effect: effect.kind, error: parsed.error };
      } catch (e) {
        return fail(effect.kind, e);
      }
    }
    case "permission/respond":
      // 形状实测：{outcome:{outcome:"selected", optionId}}（permission-flow-measured.md）
      port.respond(effect.id, { outcome: { outcome: "selected", optionId: effect.optionId } });
      dispatch({ type: "kernel/server-request-answered", id: effect.id });
      return { ok: true, effect: effect.kind };
    case "permission/dismiss":
      port.respond(effect.id, { outcome: { outcome: "cancelled" } });
      dispatch({ type: "kernel/server-request-answered", id: effect.id });
      return { ok: true, effect: effect.kind };
    case "interaction/cancel": {
      const payload = cancelPayloadFor(effect.method);
      if (payload === null) {
        return {
          ok: false,
          effect: effect.kind,
          error: "未实现的裁决面: " + effect.method + "（不猜应答形状；请按 Stop 兜底）",
        };
      }
      port.respond(effect.id, payload);
      dispatch({ type: "kernel/server-request-answered", id: effect.id });
      return { ok: true, effect: effect.kind };
    }
    case "interaction/answer":
      port.respond(effect.id, effect.payload);
      dispatch({ type: "kernel/server-request-answered", id: effect.id });
      return { ok: true, effect: effect.kind };
    case "folderTrust/respond":
      // fail-closed：只有 "trust" 解锁（folder_trust_prompt.rs:59-63 的 #[serde(other)]）
      port.respond(effect.id, { outcome: effect.trust ? "trust" : "reject" });
      dispatch({ type: "kernel/server-request-answered", id: effect.id });
      return { ok: true, effect: effect.kind };
    /* ── 以下全部是**通知**：走 port.notify，绝不走 request（陷阱 T13） ── */
    case "queue/edit":
      port.notify(EXT_NOTIFY.queueEdit, { sessionId: effect.sessionId, id: effect.entryId, newText: effect.newText });
      return { ok: true, effect: effect.kind };
    case "queue/remove":
      port.notify(EXT_NOTIFY.queueRemove, { sessionId: effect.sessionId, id: effect.entryId });
      return { ok: true, effect: effect.kind };
    case "queue/clear":
      port.notify(EXT_NOTIFY.queueClear, { sessionId: effect.sessionId });
      return { ok: true, effect: effect.kind };
    case "togglePlanMode":
      port.notify(EXT_NOTIFY.togglePlanMode, { sessionId: effect.sessionId });
      return { ok: true, effect: effect.kind };
    case "perm/notify":
      // 内核只认 clientIdentifier / permission_mode / yolo_mode / auto_mode 四键
      // （acp_agent.rs:1245-1320）。旧载荷 {sessionId, enabled} 一个键都不认，
      // 审批卡「全放行」快捷动作因此静默无效——2026-09-12 改为透传 permModel 造好的参数。
      port.notify(EXT_NOTIFY.yoloModeChanged, effect.params);
      return { ok: true, effect: effect.kind };
  }
}

/** 便捷：读取当前活跃会话。 */
export function activeSession(s: AppState) {
  return s.activeSessionId === null ? null : s.sessions[s.activeSessionId] ?? null;
}

export type { EXT_REQUEST };
