/**
 * 生态面读路径探针 —— 把「右栏/设置/市场/终端要画什么」变成实测账，而不是猜。
 *
 * 动机：PLAN §13 下一步只覆盖了会话脊柱；用户裁定生态面要做（终端/文件/审查/
 * 技能/插件/市场/MCP/用量）。这些面的可调用名已在 EXT_DISPATCH_ONLY 里
 * （docs/contract/kernel-ext-audit.md §2.4：`fs/*`、`git/*`、`search/*`、
 * `skills/*`、`terminal/*` 全族「仅分派侧有证据」），但**参数与响应形状从未实测**。
 * 按「一条不落、一条不造」，先用探针量清，再画界面。
 *
 * 参数来源（不是猜的）：内核源码 extensions/*.rs 的 `*Request` 结构体，一律
 * `#[serde(rename_all = "camelCase")]` ⇒ 线上键是 camelCase：
 *   fs/list        {sessionId?, path, depth=1, includeHidden=true, limit=1000, offset=0,
 *                   followSymlinks=true, respectGitIgnore=true, includeGlobs[], excludeGlobs[]}
 *   fs/read_file   {sessionId?, path, maxBytes=1MiB, maxLines?, offset?, length?, encoding?}
 *   git/status     {sessionId?|gitRoot?, includeUntracked?, includeStats?, ignoreSubmodules?, includePatches?}
 *   git/files      {sessionId?|gitRoot?, paths[], version="head"}
 *   git/diffs      {sessionId?|gitRoot?, paths?, from="head", to="working", includePatch, includeContent, mergeBase}
 *   search/content {sessionId?, cwd?, pattern, caseInsensitive?, wholeWord?, isRegex?, includeGlobs?, ...}（flatten）
 *   search/fuzzy/* open{cwd?,root?,hidden} → change{searchId,query,dirsOnly,limit?} → close{searchId}
 *   skills/list    {cwd}          workflows/list {}      plugins/list {}
 *   mcp/list       {sessionId?, cache}                   hooks/list {sessionId}
 *   code/status    {sessionId?, cwd?}                    terminal/pty/create {shell?,cwd?,rows?,cols?,name?}
 *
 * **只探读路径**。写路径（git/stage|commit|discard、skills/toggle、mcp/upsert、
 * marketplace/action、rewind/execute、task/kill…）一律不碰：探针的职责是量形状，
 * 不是改用户的东西（隔离 home 也一样——写路径等各界面落地时按需单点实测）。
 * 唯一例外是 terminal/pty/create：终端面必须量到流式形状，故创建后**立刻** kill。
 *
 * 输出 docs/contract/ecosystem-shapes.json。字符串一律**只记类型与长度**，
 * 另收「枚举词汇表」（短、无路径分隔符的值）——这样形状可入库而不带用户数据。
 *
 * 跑法：node apps/desktop/scripts/probe-ecosystem.ts [--pty]
 */
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { AGENT_METHOD, EXT_DISPATCH_ONLY, EXT_CLIENT_REQUEST, EXT_NOTIFY, extMethodName } from "@nofy-desktop/acp";
import { getKernel } from "../main/acp/connection.ts";
import { createIsolatedNofyHome } from "../main/kernel/test-home.ts";
import { installReapHooks, setKernelEnv, shutdownKernel, spawnKernelChild } from "../main/kernel/supervisor.ts";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "..", "..", "..", "docs", "contract", "ecosystem-shapes.json");
const TIMEOUT = 20_000;

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** 类型级形状：字符串只留长度（不入库任何用户文本）。 */
function shape(v: unknown, depth = 0): unknown {
  if (v === null) return "null";
  if (Array.isArray(v)) return v.length === 0 ? "[]空" : [shape(v[0], depth + 1), "…len=" + String(v.length)];
  if (typeof v === "object") {
    if (depth >= 4) return "{…}";
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = shape(x, depth + 1);
    return out;
  }
  if (typeof v === "string") return "str(" + String(v.length) + ")";
  if (typeof v === "number" || typeof v === "boolean") return typeof v;
  return typeof v;
}

/**
 * 枚举词汇表：把「看起来是枚举而不是数据」的字符串值按字段名收起来。
 * 判据：≤24 字符、无路径分隔符/波浪号/空白、无点号开头。路径与标题因此被排除，
 * 而 status/kind/type/state 这类词汇留下来——界面要按它们分支渲染。
 */
function collectVocab(v: unknown, path: string, out: Map<string, Set<string>>): void {
  const looksEnum = (s: string): boolean =>
    s.length > 0 && s.length <= 24 && !/[\/~\s]/.test(s) && !s.startsWith(".");
  if (isObj(v)) {
    for (const [k, x] of Object.entries(v)) {
      const p = path === "" ? k : path + "." + k;
      if (typeof x === "string" && looksEnum(x)) {
        const set = out.get(k) ?? new Set<string>();
        set.add(x);
        out.set(k, set);
      } else {
        collectVocab(x, p, out);
      }
    }
    return;
  }
  if (Array.isArray(v)) for (const x of v.slice(0, 20)) collectVocab(x, path, out);
}

function vocabToJson(m: Map<string, Set<string>>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, s] of m) out[k] = [...s].sort().slice(0, 12);
  return out;
}

/** 收 errors[]/error 里的 code+message（内核诊断，不含用户数据；tmp 路径无妨）。 */
function collectDiag(v: unknown, out: string[]): void {
  if (isObj(v)) {
    const code = v["code"];
    const message = v["message"];
    if (typeof code === "string" && typeof message === "string") out.push(code + ": " + message.slice(0, 160));
    for (const x of Object.values(v)) collectDiag(x, out);
    return;
  }
  if (Array.isArray(v)) for (const x of v.slice(0, 10)) collectDiag(x, out);
}

/** 响应包装不统一（实测三种）：{result:{…}} / 裸对象 / snake_case 裸对象。取里层。 */
function unwrap(v: unknown): Record<string, unknown> {
  if (!isObj(v)) return {};
  const inner = v["result"];
  return isObj(inner) ? inner : v;
}

/**
 * 「有没有真数据」判据：递归找任一非空数组。
 * git/diffs 与 git/files 首轮都返回**空数组而不报错**——参数口径错时内核不报错，
 * 只是查不到（'head' 不是合法 revspec 时 git/files 才回 errors[]）。
 * 所以对这两条要一直试到拿到非空结果，否则会把「口径错」记成「形状是空的」。
 */
function hasListData(v: unknown, depth = 0): boolean {
  if (depth > 4) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (isObj(v)) return Object.values(v).some((x) => hasListData(x, depth + 1));
  return false;
}

type Attempt = { desc: string; params: unknown; ok: boolean; error?: string; code?: number };
type Entry = {
  method: string;
  ok: boolean;
  acceptedParams?: unknown;
  shape?: unknown;
  vocab?: Record<string, string[]>;
  /** 内核自带的诊断串（errors[].code/message）——它解释「为什么是空的」，比形状更要紧。 */
  diag?: string[];
  attempts: Attempt[];
};

function git(ws: string, args: string[]): void {
  execFileSync("git", ["-C", ws, ...args], { stdio: "ignore" });
}

/** 造一个**有内容**的仓库：一次提交 + 一处修改 + 一个未跟踪文件。git 面要真数据。 */
function seedRepo(ws: string): void {
  writeFileSync(join(ws, "README.md"), "# probe\n\necosystem probe workspace\n", "utf8");
  writeFileSync(join(ws, "marker.txt"), "line one\nline two\n", "utf8");
  mkdirSync(join(ws, "src"));
  writeFileSync(join(ws, "src", "app.ts"), "export function main(): string {\n  return \"ok\";\n}\n", "utf8");
  git(ws, ["init", "-b", "main"]);
  git(ws, ["config", "user.email", "probe@nofy.local"]);
  git(ws, ["config", "user.name", "nofy-probe"]);
  git(ws, ["config", "commit.gpgsign", "false"]);
  git(ws, ["add", "-A"]);
  git(ws, ["commit", "-q", "-m", "probe: seed"]);
  // 脏工作区：modified + untracked，让 git/status 与 git/diffs 有东西可返回
  writeFileSync(join(ws, "marker.txt"), "line one\nline two changed\nline three\n", "utf8");
  writeFileSync(join(ws, "new.txt"), "untracked\n", "utf8");
}

async function main(): Promise<number> {
  const withPty = process.argv.includes("--pty");
  installReapHooks();
  const home = createIsolatedNofyHome({ copyConfig: true, configOverrides: { "ui.permission_mode": "default" } });
  const ws = mkdtempSync(join(tmpdir(), "nofy-desktop-eco-ws-"));
  setKernelEnv({ ...process.env, NOFY_HOME: home.path });
  seedRepo(ws);
  const rel = (p: string): string => relative(ws, p);

  const conn = getKernel();
  conn.attachChild(spawnKernelChild());
  await conn.ready(TIMEOUT);
  const ms = conn.modelState;
  const modelId = isObj(ms) ? String(ms["currentModelId"] ?? "") : "";
  console.log("");
  console.log("── 生态面读路径探针 ──");
  console.log("  model:", modelId || "(none)", " pty:", withPty ? "on" : "off");

  const created = await conn.rpc(
    AGENT_METHOD.newSession,
    { cwd: ws, mcpServers: [], _meta: modelId.length > 0 ? { modelId } : {} },
    30_000,
  );
  const sessionId = isObj(created) ? String(created["sessionId"] ?? "") : "";
  if (sessionId.length === 0) throw new Error("session/new 没给 sessionId");
  console.log("  sessionId:", sessionId.slice(0, 12));

  const report: Record<string, Entry> = {};

  /**
   * 逐个变体试；第一个成功的记为 acceptedParams，其余错误一并留档。
   * untilNonEmpty=true 时继续试到拿到非空列表（空结果不算成功，但仍留档）。
   */
  async function probe(
    label: string,
    method: string,
    variants: Array<{ desc: string; params: unknown }>,
    opts: { untilNonEmpty?: boolean } = {},
  ): Promise<unknown> {
    const entry: Entry = { method: extMethodName(method), ok: false, attempts: [] };
    report[label] = entry;
    let value: unknown = null;
    for (const v of variants) {
      try {
        value = await conn.ext(method, v.params, TIMEOUT);
        entry.attempts.push({ desc: v.desc, params: v.params, ok: true });
        const nonEmpty = !opts.untilNonEmpty || hasListData(value);
        if (nonEmpty || entry.acceptedParams === undefined) {
          entry.ok = nonEmpty || entry.ok;
          entry.acceptedParams = v.params;
          entry.shape = shape(value);
          const vocab = new Map<string, Set<string>>();
          collectVocab(value, "", vocab);
          entry.vocab = vocabToJson(vocab);
          const diag: string[] = [];
          collectDiag(value, diag);
          if (diag.length > 0) entry.diag = [...new Set(diag)].slice(0, 6);
          console.log("");
          console.log("══ " + label + (nonEmpty ? "  ✓ (" : "  ○空 (") + v.desc + ")");
          console.log("   形状:", JSON.stringify(entry.shape)?.slice(0, 700));
          if (Object.keys(entry.vocab).length > 0) console.log("   词汇:", JSON.stringify(entry.vocab).slice(0, 400));
          if (entry.diag !== undefined) console.log("   诊断:", entry.diag.join(" | ").slice(0, 300));
        }
        if (nonEmpty) break;
      } catch (e) {
        const err = e as Error & { code?: number };
        entry.attempts.push({ desc: v.desc, params: v.params, ok: false, error: err.message, code: err.code });
        console.log("");
        console.log("══ " + label + "  ✗ (" + v.desc + ") " + String(err.code ?? "") + " " + err.message.slice(0, 160));
      }
    }
    return value;
  }

  /* ── 文件面（FileTreePanel / CodeViewer） ── */
  await probe("fs/list", EXT_DISPATCH_ONLY.fs_list, [
    { desc: "绝对路径+depth1", params: { sessionId, path: ws, depth: 1, limit: 200 } },
    { desc: "无 sessionId", params: { path: ws } },
    { desc: "相对路径靠 session cwd", params: { sessionId, path: "src" } },
  ]);
  await probe("fs/list(depth2)", EXT_DISPATCH_ONLY.fs_list, [
    { desc: "depth2 递归", params: { sessionId, path: ws, depth: 2, limit: 200, respectGitIgnore: true } },
  ]);
  // 文件树真正要用的调用：首轮实测 depth2 把 .git 内部（HEAD/config/hooks…）也吐出来了
  // ⇒ includeHidden 默认 true，界面必须显式关掉，否则树里全是 .git 噪声。
  await probe("fs/list(tree)", EXT_DISPATCH_ONLY.fs_list, [
    { desc: "depth2+includeHidden=false", params: { sessionId, path: ws, depth: 2, limit: 200, includeHidden: false } },
  ]);
  await probe("fs/exists", EXT_DISPATCH_ONLY.fs_exists, [
    { desc: "绝对路径", params: { sessionId, path: join(ws, "marker.txt") } },
    { desc: "相对路径", params: { sessionId, path: "marker.txt" } },
  ]);
  await probe("fs/read_file", EXT_DISPATCH_ONLY.fs_read_file, [
    { desc: "全文", params: { sessionId, path: join(ws, "marker.txt") } },
    { desc: "限 maxLines", params: { sessionId, path: join(ws, "src", "app.ts"), maxLines: 2 } },
  ]);

  /* ── Git 审查面（GitReview / DiffsWorker） ── */
  await probe("git/status", EXT_DISPATCH_ONLY.git_status, [
    { desc: "sessionId+stats+patches", params: { sessionId, includeUntracked: true, includeStats: true, includePatches: true } },
    { desc: "gitRoot", params: { gitRoot: ws } },
    { desc: "空参数", params: {} },
  ]);
  await probe("git/info", EXT_DISPATCH_ONLY.git_info, [
    { desc: "sessionId", params: { sessionId } },
    { desc: "gitRoot", params: { gitRoot: ws } },
  ]);
  await probe("git/branches", EXT_DISPATCH_ONLY.git_branches, [{ desc: "sessionId", params: { sessionId } }]);
  await probe("git/current_commit", EXT_DISPATCH_ONLY.git_current_commit, [{ desc: "sessionId", params: { sessionId } }]);
  await probe("git/diffs", EXT_DISPATCH_ONLY.git_diffs, [
    { desc: "大写 HEAD→working", params: { sessionId, from: "HEAD", to: "working", includePatch: true } },
    { desc: "小写 head→working+patch", params: { sessionId, from: "head", to: "working", includePatch: true, includeContent: false } },
    { desc: "gitRoot 而非 sessionId", params: { gitRoot: ws, from: "head", to: "working", includePatch: true } },
    { desc: "带 paths", params: { sessionId, paths: ["marker.txt"], from: "head", to: "working", includePatch: true } },
    { desc: "mergeBase=true", params: { sessionId, from: "head", to: "working", includePatch: true, mergeBase: true } },
    { desc: "默认 from/to", params: { sessionId } },
  ], { untilNonEmpty: true });
  await probe("git/files", EXT_DISPATCH_ONLY.git_files, [
    { desc: "version=HEAD 大写", params: { sessionId, paths: ["marker.txt"], version: "HEAD" } },
    { desc: "version=head 小写", params: { sessionId, paths: [rel(join(ws, "marker.txt"))], version: "head" } },
    { desc: "gitRoot+相对路径", params: { gitRoot: ws, paths: ["marker.txt"], version: "head" } },
    { desc: "version 缺省", params: { sessionId, paths: [rel(join(ws, "marker.txt"))] } },
  ], { untilNonEmpty: true });
  await probe("git/git_repo_root", EXT_DISPATCH_ONLY.git_git_repo_root, [
    { desc: "currentWorkingDirectory（源码 GitRepoRequest 唯一字段）", params: { currentWorkingDirectory: ws } },
    { desc: "sessionId", params: { sessionId } },
    { desc: "cwd", params: { cwd: ws } },
  ]);

  /* ── 搜索面（⌘K 的文件/内容范围） ── */
  await probe("search/content", EXT_DISPATCH_ONLY.search_content, [
    { desc: "flatten pattern", params: { sessionId, cwd: ws, pattern: "line", maxMatches: 20 } },
    { desc: "params 嵌套", params: { sessionId, cwd: ws, params: { pattern: "line" } } },
  ]);
  const fuzzy = await probe("search/fuzzy/open", EXT_DISPATCH_ONLY.search_fuzzy_open, [
    { desc: "cwd+hidden", params: { sessionId, cwd: ws, hidden: false } },
    { desc: "空参数", params: {} },
  ]);
  // 首轮踩的坑：响应是 {result:{sessionId,searchId}}，直接取顶层拿到空串，
  // 于是 change/close 整段被跳过、PTY 也没 kill。一律经 unwrap()。
  const searchId = String(unwrap(fuzzy)["searchId"] ?? "");
  if (searchId.length > 0) {
    // fuzzy/change 的响应只回 {sessionId,searchId}（源码 FuzzyChangeResponse 就这两个字段）
    // ⇒ 结果必然走别的路（通知或另一次读）。挂帧监听把它找出来，不猜。
    const searchFrames: Array<{ method: string; shape: unknown }> = [];
    const offSearch = conn.on("frame", (frame: { kind: string; method?: string; params?: unknown }) => {
      if (frame.kind !== "notification" || frame.method === undefined) return;
      if (!frame.method.includes("search")) return;
      if (searchFrames.length < 8) searchFrames.push({ method: frame.method, shape: shape(frame.params) });
    });
    await probe("search/fuzzy/change", EXT_DISPATCH_ONLY.search_fuzzy_change, [
      { desc: "query=mark", params: { searchId, query: "mark", dirsOnly: false, limit: 20 } },
      { desc: "dirsOnly=true", params: { searchId, query: "src", dirsOnly: true } },
    ]);
    await new Promise((r) => setTimeout(r, 800));
    offSearch();
    report["search/fuzzy 结果通道"] = {
      method: "(notification)",
      ok: searchFrames.length > 0,
      shape: searchFrames,
      attempts: [
        {
          desc: searchFrames.length > 0 ? "结果经通知推送" : "change 期间没有任何 search* 通知 ⇒ 结果不在通知轨上",
          params: null,
          ok: searchFrames.length > 0,
        },
      ],
    };
    console.log("");
    console.log("══ search/fuzzy 结果通道  " + (searchFrames.length > 0 ? "✓ " + String(searchFrames.length) + " 帧" : "○ 无通知"));
    for (const f of searchFrames.slice(0, 3)) console.log("   " + f.method + " " + JSON.stringify(f.shape).slice(0, 260));
    await probe("search/fuzzy/close", EXT_DISPATCH_ONLY.search_fuzzy_close, [{ desc: "close", params: { searchId } }]);
  } else {
    console.log("!! searchId 为空，跳过 fuzzy change/close");
  }

  /* ── 生态面：技能 / 插件 / 市场 / MCP / 钩子 / 工作流 ── */
  await probe("skills/list", EXT_CLIENT_REQUEST.skills_list, [
    { desc: "cwd", params: { cwd: ws } },
    { desc: "cwd+sessionId", params: { cwd: ws, sessionId } },
    { desc: "空参数", params: {} },
  ]);
  await probe("workflows/list", EXT_CLIENT_REQUEST.workflows_list, [
    { desc: "空参数", params: {} },
    { desc: "sessionId", params: { sessionId } },
  ]);
  await probe("plugins/list", EXT_CLIENT_REQUEST.plugins_list, [
    { desc: "空参数", params: {} },
    { desc: "sessionId", params: { sessionId } },
  ]);
  await probe("marketplace/list", EXT_CLIENT_REQUEST.marketplace_list, [{ desc: "空参数", params: {} }]);
  await probe("mcp/list", EXT_CLIENT_REQUEST.mcp_list, [
    { desc: "cache=false", params: { sessionId, cache: false } },
    { desc: "空参数", params: {} },
  ]);
  await probe("hooks/list", EXT_CLIENT_REQUEST.hooks_list, [
    { desc: "sessionId", params: { sessionId } },
    { desc: "空参数", params: {} },
  ]);
  await probe("commands/list", EXT_CLIENT_REQUEST.commands_list, [
    { desc: "sessionId", params: { sessionId } },
    { desc: "空参数", params: {} },
  ]);

  /* ── 用量 / 任务 / 子智能体 / 代码导航 ── */
  await probe("session/usage", EXT_CLIENT_REQUEST.session_usage, [
    { desc: "sessionId", params: { sessionId } },
    { desc: "空参数", params: {} },
  ]);
  await probe("task/list", EXT_DISPATCH_ONLY.task_list, [
    { desc: "sessionId（源码 ListTasksRequest.session_id 必填）", params: { sessionId } },
    { desc: "空参数", params: {} },
  ]);
  await probe("subagent/list_running", EXT_DISPATCH_ONLY.subagent_list_running, [
    { desc: "sessionId", params: { sessionId } },
    { desc: "空参数", params: {} },
  ]);
  await probe("subagent/get", EXT_DISPATCH_ONLY.subagent_get, [
    { desc: "sessionId", params: { sessionId } },
    { desc: "subagentId 占位", params: { subagentId: "00000000-0000-0000-0000-000000000000" } },
  ]);
  await probe("code/status", EXT_DISPATCH_ONLY.code_status, [
    { desc: "sessionId", params: { sessionId } },
    { desc: "cwd", params: { cwd: ws } },
  ]);
  await probe("rewind/points", EXT_CLIENT_REQUEST.rewind_points, [
    { desc: "sessionId", params: { sessionId } },
    { desc: "空参数", params: {} },
  ]);
  await probe("prompt_history", EXT_CLIENT_REQUEST.prompt_history, [
    // 源码 PromptHistoryRequest **无 rename_all** ⇒ 线上键是 snake_case（cwd 必填）。
    // 这就是首轮 {sessionId} 报 Invalid params 的原因：不是缺参数，是键名口径不同。
    { desc: "cwd（snake_case 结构体）", params: { cwd: ws } },
    { desc: "cwd+filter_session_id", params: { cwd: ws, filter_session_id: sessionId } },
    { desc: "sessionId", params: { sessionId } },
    { desc: "空参数", params: {} },
  ]);
  // session/search 不在 EXT_DISPATCH_ONLY 里（提取器只认字面量构造点），但
  // acp_agent.rs 有 "nofy/session/search" 分派臂 ⇒ 直接用线上名探，结果同样记账。
  await probe("session/search", "_nofy/session/search", [
    { desc: "query+cwd", params: { query: "probe", cwd: ws } },
    { desc: "query 单参", params: { query: "probe" } },
  ]);
  await probe("auth/info", EXT_DISPATCH_ONLY.auth_info, [{ desc: "空参数", params: {} }]);
  await probe("session_summaries/workspace_list", EXT_DISPATCH_ONLY.session_summaries_workspace_list, [
    { desc: "空参数", params: {} },
  ]);
  await probe("terminal/list", EXT_DISPATCH_ONLY.terminal_list, [
    { desc: "sessionId", params: { sessionId } },
    { desc: "空参数", params: {} },
  ]);

  /* ── 终端面：唯一允许的「创建」，量完立刻 kill ── */
  if (withPty) {
    // PTY 的输出是**内核 → 客户端通知**（EXT_INDIRECT.terminal_pty_notification）。
    // 读路径量不到它，只能在创建期间挂帧监听把方法名与形状录下来。
    const ptyFrames: Array<{ method: string; shape: unknown }> = [];
    /** 通知的 type 词汇（源码 pty_session.rs 共四种：output/exit/process_started/process_ended）。 */
    const ptyTypes = new Set<string>();
    /** 退出帧的细节：exitCode + 距创建的毫秒数。shell 早退是本轮实测的真相，必须记账。 */
    const ptyExit: Array<{ exitCode: unknown; signal: unknown; afterMs: number }> = [];
    const t0 = Date.now();
    /** output 帧的 data 是 **base64**（源码 :604 + PtyInputNotification 同法）⇒ 解码后累积，
     * 用来验证「我们写进去的字节真的到了 shell」。通知没有错误通道，只能这样验。 */
    let ptyText = "";
    /** 全量累积（不随分步验证清空）：shell 早退时，唯一的正文证据在最早的帧里。 */
    let ptyTextAll = "";
    const off = conn.on("frame", (frame: { kind: string; method?: string; params?: unknown }) => {
      if (frame.kind !== "notification" || frame.method === undefined) return;
      if (!frame.method.includes("terminal")) return;
      if (ptyFrames.length < 12) ptyFrames.push({ method: frame.method, shape: shape(frame.params) });
      const p = isObj(frame.params) ? frame.params : {};
      const t = p["type"];
      if (typeof t === "string") ptyTypes.add(t);
      if (t === "exit") ptyExit.push({ exitCode: p["exitCode"], signal: p["signal"], afterMs: Date.now() - t0 });
      const d = p["data"];
      if (typeof d === "string" && d.length > 0) {
        try {
          const decoded = Buffer.from(d, "base64").toString("utf8");
          ptyText += decoded;
          ptyTextAll += decoded;
        } catch {
          /* 不是 base64 就忽略：形状本身已记账 */
        }
      }
    });
    const pty = await probe("terminal/pty/create", EXT_DISPATCH_ONLY.terminal_pty_create, [
      // 源码 resolve_pty_shell：显式 shell → $SHELL → /bin/bash，且 unix 下加 "-l"
      // ⇒ 默认会跑用户真实 ~/.zshrc（NOFY_HOME 隔离了，HOME 没隔离）。
      // 首轮实测：不给 TERM 时 shell 起来就退（只留下一串终端能力探测序列）。
      { desc: "带 TERM 环境", params: { sessionId, cwd: ws, rows: 24, cols: 80, name: "probe", env: [{ name: "TERM", value: "xterm-256color" }] } },
      { desc: "cwd+rows/cols（无 env）", params: { sessionId, cwd: ws, rows: 24, cols: 80, name: "probe" } },
      { desc: "无 sessionId", params: { cwd: ws, rows: 24, cols: 80 } },
    ]);
    const terminalId = String(unwrap(pty)["terminalId"] ?? "");
    if (terminalId.length > 0) {
      await probe("terminal/pty/load", EXT_DISPATCH_ONLY.terminal_pty_load, [
        { desc: "terminalId", params: { terminalId } },
      ]);
      await probe("terminal/pty/resize", EXT_DISPATCH_ONLY.terminal_pty_resize, [
        { desc: "30x100", params: { terminalId, rows: 30, cols: 100 } },
      ]);
      await probe("terminal/list(有 PTY 时)", EXT_DISPATCH_ONLY.terminal_list, [{ desc: "sessionId", params: { sessionId } }]);
      /* 写入路径三步实测（每一步都必须验证到**回显**，因为通知不报错）：
       *   ① rpc() 发 → -32601（第二轮实测）：它由 ext_notification 处理，不是请求。
       *   ② notify() 但键名用 input → 内核 parse 失败只 tracing::warn，**静默丢弃**。
       *      第二轮我们误把这一步记成成功（当时只数了帧数，没看内容）。
       *   ③ notify() + {terminalId, data:<base64>} → 源码 PtyInputNotification 的唯一正确形状
       *      （extensions/terminal.rs:88-91 rename_all=camelCase；:358 base64 解码）。
       * ⇒ 终端面的写入必须是 base64；这条是本探针最贵的一个教训。 */
      const MARKER = "nofy-pty-probe-marker";
      const waitMs = async (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

      ptyText = "";
      const sentWrong = conn.notify(EXT_NOTIFY.terminalPtyInput, { terminalId, input: "echo " + MARKER + "\n" });
      await waitMs(1200);
      const wrongEchoed = ptyText.includes(MARKER);

      ptyText = "";
      const b64 = Buffer.from("echo " + MARKER + "\n", "utf8").toString("base64");
      const sentRight = conn.notify(EXT_NOTIFY.terminalPtyInput, { terminalId, data: b64 });
      await waitMs(1500);
      const rightEchoed = ptyText.includes(MARKER);

      report["terminal/pty/input"] = {
        method: EXT_NOTIFY.terminalPtyInput,
        ok: sentRight && rightEchoed,
        acceptedParams: { terminalId: "…", data: "<base64 of raw bytes>" },
        attempts: [
          { desc: "① rpc() 发送", params: null, ok: false, error: "Method not found", code: -32601 },
          { desc: "② notify() 但用 input 键（源码要 data）", params: { terminalId: "…", input: "echo …" }, ok: wrongEchoed, error: wrongEchoed ? undefined : "静默丢弃：内核 parse 失败只 warn，通知无错误通道" },
          { desc: "③ notify() + data:<base64>", params: { terminalId: "…", data: "<base64>" }, ok: sentRight && rightEchoed },
        ],
      };
      console.log("");
      console.log("══ terminal/pty/input（notify）  " + (sentRight && rightEchoed ? "✓ base64 data 生效（回显已验证）" : "✗ 未见回显"));
      console.log("   ② input 键:", wrongEchoed ? "竟然生效？！须复核源码" : "静默丢弃（符合源码：parse 失败只 warn）");
      await probe("terminal/kill", EXT_DISPATCH_ONLY.terminal_kill, [
        { desc: "terminalId+sessionId", params: { terminalId, sessionId } },
      ]);
    } else {
      console.log("!! terminalId 为空，跳过 pty 生命周期");
    }
    off();
    report["terminal/pty 通知帧"] = {
      method: "(notification)",
      ok: ptyFrames.length > 0,
      shape: ptyFrames,
      vocab: { type: [...ptyTypes].sort() },
      attempts: [{ desc: "创建期间挂 conn.on('frame') 监听 terminal* 通知", params: null, ok: ptyFrames.length > 0 }],
    };
    console.log("");
    console.log("══ terminal/pty 通知帧  " + (ptyFrames.length > 0 ? "✓ " + String(ptyFrames.length) + " 帧" : "✗ 没收到"));
    console.log("   type 词汇:", [...ptyTypes].sort().join(", ") || "(无)");
    for (const f of ptyFrames.slice(0, 4)) console.log("   " + f.method + " " + JSON.stringify(f.shape).slice(0, 300));
    // 解码后的 shell 输出：它解释「为什么没回显」——本轮实测 shell 起来就退了
    // （type 词汇里同时出现 process_ended 与 exit），输出正文是唯一线索。
    const redacted = ptyTextAll.replaceAll(ws, "<ws>").replaceAll(home.path, "<home>").slice(0, 400);
    console.log("   解码输出(" + String(ptyTextAll.length) + " 字符):", JSON.stringify(redacted));
    report["terminal/pty 解码输出"] = {
      method: "(decoded)",
      ok: ptyTextAll.length > 0,
      shape: { chars: ptyTextAll.length, types: [...ptyTypes].sort(), exits: ptyExit, text: redacted },
      attempts: [{ desc: "base64 data 解码后累积（路径已替换为 <ws>/<home>）", params: null, ok: ptyTextAll.length > 0 }],
    };
    console.log("   退出帧:", ptyExit.length > 0 ? JSON.stringify(ptyExit) : "(没有——shell 还活着)");
  }

  await mkdir(dirname(OUT), { recursive: true });
  const okCount = Object.values(report).filter((r) => r.ok).length;
  const payload = {
    generatedAt: new Date().toISOString(),
    kernelAgentVersion: conn.agentVersion,
    note: "只探读路径；字符串只记长度，枚举词汇单独收（无用户数据）。写路径各界面落地时单点实测。",
    probeCount: Object.keys(report).length,
    okCount,
    report,
  };
  await writeFile(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log("");
  console.log("→ 写入", OUT);
  console.log("── 可调通读路径: " + String(okCount) + "/" + String(Object.keys(report).length) + " ──");

  conn.close();
  shutdownKernel();
  setKernelEnv(null);
  home.cleanup();
  rmSync(ws, { recursive: true, force: true });
  return 0;
}

main()
  .then((c) => {
    process.exitCode = c;
    setTimeout(() => process.exit(c), 150).unref();
  })
  .catch((e) => {
    console.error("CRASHED:", e instanceof Error ? e.stack : String(e));
    shutdownKernel();
    setKernelEnv(null);
    process.exit(1);
  });
