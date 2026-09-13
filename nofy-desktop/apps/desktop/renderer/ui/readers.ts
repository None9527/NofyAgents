/**
 * 载荷读取器 —— 从**未实测/半实测**的 JSON 里安全取值。
 *
 * 纪律（PLAN §5「一条不落、一条不造」）：只读**已实测**的键。
 * 键名一律来自 docs/contract/*.md 与 docs/fixtures/*.jsonl，不来自旧文档转述：
 *
 *   options[]        {optionId, kind, name}      permission-flow-measured.md §2
 *   toolCall         {toolCallId, kind, title, rawInput, _meta}（键集恒定，同上 §1）
 *   modelOptions[]   {id, category, label, selected}  session-read-shapes.md
 *                                            （label 是展示名、id 是提交值）
 *
 * 读不到就给 null / 空数组，**不编默认值**：界面显示「未知」比显示一个
 * 看起来合理的假值安全得多。
 */

export function asObj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export function asStr(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export function asBool(v: unknown): boolean {
  return v === true;
}

/** 用量面分解段用：非数一律 null（缺段画「—」，不画 0 假装量到）。 */
function numOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * context.usageCategories 的一行（实测 3 行；session-read-shapes.json）。
 *
 * 〔内核源码〕crates/codegen/nofy-shell/src/session/acp_types.rs:168-212
 *   TokenUsageCategory { label, tokens, detail? }，serde rename_all=camelCase，
 *   detail 约定是「计数 + 名词」（"21 skills"），pager 右对齐 leading count。
 * ⚠ label/detail 是**内核给的英文显示串**，翻译在视图层做（contextModel），
 *   reader 只搬运，不改写。
 * ⚠ 这些行与 messageTokens **重叠**（同文件 :160-167 明写），不得相加。
 */
export type UsageCategoryRow = { label: string; tokens: number; detail: string | null };

function readUsageCategories(v: unknown): UsageCategoryRow[] {
  if (!Array.isArray(v)) return [];
  const out: UsageCategoryRow[] = [];
  for (const item of v) {
    const o = asObj(item);
    const label = asStr(o["label"]);
    const tokens = numOrNull(o["tokens"]);
    if (label === null || tokens === null) continue;
    out.push({ label, tokens, detail: asStr(o["detail"]) });
  }
  return out;
}

/** session/request_permission 的一个选项。name 是**逐字**文案，直接渲染，不改写。 */
export type PermissionOption = { optionId: string; kind: string | null; name: string };

export function readOptions(params: Record<string, unknown>): PermissionOption[] {
  const raw = params["options"];
  if (!Array.isArray(raw)) return [];
  const out: PermissionOption[] = [];
  for (const item of raw) {
    const o = asObj(item);
    const optionId = asStr(o["optionId"]);
    const name = asStr(o["name"]);
    if (optionId === null || name === null) continue; // 缺关键字段 ⇒ 不渲染成半个按钮
    out.push({ optionId, kind: asStr(o["kind"]), name });
  }
  return out;
}

/** 权限请求里的 toolCall。title 是展示标题（带动词，随模型选的工具而变）。 */
export type ToolCallInfo = {
  toolCallId: string | null;
  kind: string | null;
  title: string | null;
  rawInput: unknown;
};

export function readToolCall(params: Record<string, unknown>): ToolCallInfo | null {
  const tc = params["toolCall"];
  if (tc === undefined) return null;
  const o = asObj(tc);
  return {
    toolCallId: asStr(o["toolCallId"]),
    kind: asStr(o["kind"]),
    title: asStr(o["title"]),
    rawInput: o["rawInput"],
  };
}

/** 模型选择器项。来自 session/new|load 响应的 _meta["nofy/sessionConfig"].options。
 * 内核 session_config.rs：options 是**两族混装**——category="model" 是模型项、
 * category="mode" 是推理档项（effort），共用一张表、各选各的。 */
export type ModelOption = {
  id: string;
  label: string;
  category: string | null;
  description: string | null;
  selected: boolean;
};

export function readModelOptions(list: unknown[]): ModelOption[] {
  const out: ModelOption[] = [];
  for (const item of list) {
    const o = asObj(item);
    const id = asStr(o["id"]);
    if (id === null) continue;
    out.push({
      id,
      label: asStr(o["label"]) ?? id,
      category: asStr(o["category"]),
      description: asStr(o["description"]),
      selected: asBool(o["selected"]),
    });
  }
  return out;
}

/** 混装表拆两族：模型项进选择器、推理档项进推理档菜单；表外 category 両方都不收
 * （内核只产 model/mode 两族，session_config.rs build_session_config_options）。 */
export function splitModelOptions(options: ModelOption[]): { models: ModelOption[]; modes: ModelOption[] } {
  const models: ModelOption[] = [];
  const modes: ModelOption[] = [];
  for (const o of options) {
    if (o.category === "model") models.push(o);
    else if (o.category === "mode") modes.push(o);
  }
  return { models, modes };
}

/** 把任意 JSON 压成一段可读文本，供「未实现」的卡片诚实展示原始载荷。 */
export function preview(value: unknown, max = 400): string {
  let text: string;
  try {
    text = JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    text = String(value);
  }
  return text.length > max ? text.slice(0, max) + " …(截断)" : text;
}

/** _nofy/session/info 的 context 块（session-read-shapes.md §2，实测）。 */
export type ContextInfo = {
  used: number;
  total: number;
  usagePct: number;
  freeTokens: number;
  /** autoCompactThresholdPercent（实测 85）；缺失为 null。 */
  thresholdPct: number | null;
  /** 四段分解（用量面用；内核给全，界面不自己算 token）。缺哪段哪段 null。 */
  systemPromptTokens: number | null;
  toolDefinitionsTokens: number | null;
  toolDefinitionsCount: number | null;
  messageTokens: number | null;
  messageCount: number | null;
  turnCount: number | null;
  toolCallCount: number | null;
  compactionCount: number | null;
  /**
   * 注入上下文的清单行（技能/工作流/MCP 服务器各占多少 tok）。
   * 与 messageTokens 重叠，故只在浮层里单列一栏，不进堆叠条。
   */
  usageCategories: UsageCategoryRow[];
};

export function readContext(res: unknown): ContextInfo | null {
  // extRequest 的值是 {result:{…}} 信封（与 fs/terminal 族同纪律）；兼容裸体以防调用面变化
  const env = asObj(res);
  const o = asObj(env["result"] !== undefined ? env["result"] : env);
  const c = asObj(o["context"]);
  const used = c["used"];
  const total = c["total"];
  if (typeof used !== "number" || typeof total !== "number" || total <= 0) return null;
  const pctRaw = c["usagePct"];
  const usagePct = typeof pctRaw === "number" ? pctRaw : Math.round((used / total) * 100);
  const freeRaw = c["freeTokens"];
  const freeTokens = typeof freeRaw === "number" ? freeRaw : total - used;
  const thRaw = c["autoCompactThresholdPercent"];
  return {
    used,
    total,
    usagePct,
    freeTokens,
    thresholdPct: typeof thRaw === "number" ? thRaw : null,
    systemPromptTokens: numOrNull(c["systemPromptTokens"]),
    toolDefinitionsTokens: numOrNull(c["toolDefinitionsTokens"]),
    toolDefinitionsCount: numOrNull(c["toolDefinitionsCount"]),
    messageTokens: numOrNull(c["messageTokens"]),
    messageCount: numOrNull(c["messageCount"]),
    turnCount: numOrNull(c["turnCount"]),
    toolCallCount: numOrNull(c["toolCallCount"]),
    compactionCount: numOrNull(c["compactionCount"]),
    usageCategories: readUsageCategories(c["usageCategories"]),
  };
}

/**
 * available_commands_update / initialize 的命令表（实测 167 条，smoke 门钉着形状）。
 *
 * 〔实测形状〕golden-turn.jsonl 第 0 帧 result._meta.availableCommands：
 *   {name:"compact", description:"Compress conversation history…", input:{hint:"optional context…"}}
 *   {name:"context", description:"Show context window usage…", input:null}
 * ⇒ input 可为 null，hint 是**给用户看的参数占位**（"<query>" / "on|off"），
 *   命令面板把它显示在行尾，并在插入草稿时作为提示。
 * 〔实测增补 2026-09-12〕golden-turn.jsonl 的 available_commands_update 里，
 * **技能条目带 _meta**：{scope:"user", path, bareName, qualifiedName}；
 * 内置命令（compact/always-approve/context/…）**没有 _meta**（668 条里 52 条无 _meta）。
 * ⇒ scope 是「命令 vs 技能」分组的实测依据，斜杠面板靠它分两段。
 * 〔仍只读已实测的键〕scope 之外（path/qualifiedName）面板用不到，不搬。
 */
export type CommandInfo = {
  name: string;
  description: string | null;
  hint: string | null;
  /** _meta.scope（实测 "user"）；无 _meta 的内置命令为 null。 */
  scope: string | null;
};

export function readCommands(list: unknown[]): CommandInfo[] {
  const out: CommandInfo[] = [];
  for (const item of list) {
    const o = asObj(item);
    const name = asStr(o["name"]);
    if (name === null) continue;
    const input = asObj(o["input"]);
    const meta = asObj(o["_meta"]);
    out.push({
      name,
      description: asStr(o["description"]),
      hint: asStr(input["hint"]),
      scope: asStr(meta["scope"]),
    });
  }
  return out;
}

/* ═══════════════ 文件面（生态面 #2，实测形状见 ecosystem-shapes.json）═══════════════ */

/**
 * fs/list 的一个节点。〔实测〕{result:{nodes:[{name,path,type,modifiedAt}],truncated}}，
 * type 词汇实测只有 "file" | "directory" 两种；modifiedAt 是 ISO 串。
 * 注意：**没有** size——要大小得另走 fs/read_file 或 git/files，不猜。
 */
export type FsNode = { name: string; path: string; type: "file" | "directory" | "other"; modifiedAt: string | null };

export function readFsNodes(res: unknown): { nodes: FsNode[]; truncated: boolean } {
  const o = asObj(res);
  const inner = asObj(o["result"]);
  const raw = Array.isArray(inner["nodes"]) ? inner["nodes"] : [];
  const nodes: FsNode[] = [];
  for (const item of raw) {
    const n = asObj(item);
    const path = asStr(n["path"]);
    if (path === null) continue;
    const t = asStr(n["type"]);
    nodes.push({
      name: asStr(n["name"]) ?? path.split("/").filter((x) => x.length > 0).pop() ?? path,
      path,
      type: t === "file" || t === "directory" ? t : "other",
      modifiedAt: asStr(n["modifiedAt"]),
    });
  }
  // 目录在前、名字字典序：内核已 dirs-first 排序（源码注释），这里只做稳定兜底
  nodes.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1));
  return { nodes, truncated: inner["truncated"] === true };
}

/** fs/read_file。〔实测〕{result:{content,size,lineCount,type}}。 */
export type FsFile = { content: string; size: number | null; lineCount: number | null; type: string | null };

export function readFsFile(res: unknown): FsFile | null {
  const o = asObj(res);
  const inner = asObj(o["result"]);
  const content = asStr(inner["content"]);
  if (content === null) return null;
  return {
    content,
    size: typeof inner["size"] === "number" ? inner["size"] : null,
    lineCount: typeof inner["lineCount"] === "number" ? inner["lineCount"] : null,
    type: asStr(inner["type"]),
  };
}

/**
 * _nofy/search/fuzzy/status 的一条命中。
 * 〔实测〕matches[i] = {name, type, path, score, indices[number…]}；
 * indices 是高亮区间（扁平 number 数组，成对出现）——先只用它计数，渲染高亮留到下一批。
 */
export type FuzzyMatch = { name: string; path: string; type: "file" | "directory" | "other"; score: number | null };

export function readFuzzyMatches(list: unknown[]): FuzzyMatch[] {
  const out: FuzzyMatch[] = [];
  for (const item of list) {
    const o = asObj(item);
    const path = asStr(o["path"]);
    if (path === null) continue;
    const t = asStr(o["type"]);
    out.push({
      name: asStr(o["name"]) ?? path.split("/").filter((x) => x.length > 0).pop() ?? path,
      path,
      type: t === "file" || t === "directory" ? t : "other",
      score: typeof o["score"] === "number" ? o["score"] : null,
    });
  }
  return out;
}

/* ═══════════════════ 审查面读形状（生态面 #4，探针实测 ecosystem-shapes.json） ═══════════════════
 * git/status  ⇒ {result:{root,mainRoot,isWorktree,branch,commit,staged[],unstaged[]}}
 *   条目 = {path,type,staged,additions,deletions,patch,patchBytes,patchLines}
 *   patch 是 unified diff 文本（includePatches=true 时）；解析在 features/aux/diffModel.ts。
 * git/diffs   ⇒ {result:{files[同条目形状]}}（from="HEAD" 大写，小写静默空）
 * git/files   ⇒ {result:{files[{path,version,content,isBinary}],errors[]}}（version="HEAD" 大写）
 * 三条都是 {result:{…}} 包装族；读不到/坏形状一律给空集合，不猜。
 */

/** _nofy/search/fuzzy/open 的响应：{result:{sessionId, searchId}}（实测）。 */
export function readSearchId(res: unknown): string | null {
  const o = asObj(res);
  const inner = asObj(o["result"] !== undefined ? o["result"] : o);
  return asStr(inner["searchId"]);
}

/**
 * nofy/settings/update 的 auto_permission_mode_enabled（snake_case 逐字，
 * mvp_agent/mod.rs:503-507 SettingsUpdateNotification 无 rename_all）。
 * 权限芯片三源之一：auto 档的读回。
 */
export function readAutoPermissionEnabled(settings: unknown): boolean {
  return asObj(settings)["auto_permission_mode_enabled"] === true;
}

export type GitChange = {
  path: string;
  /** 实测词汇：edit / untracked（其余值原样保留，界面按「其它」渲染） */
  type: string;
  staged: boolean;
  additions: number;
  deletions: number;
  /** unified diff 文本；内核没给（或 includePatches=false）时 null */
  patch: string | null;
};

export type GitStatus = {
  root: string | null;
  branch: string | null;
  commit: string | null;
  staged: GitChange[];
  unstaged: GitChange[];
};

function readChange(item: unknown): GitChange | null {
  const o = asObj(item);
  const path = asStr(o["path"]);
  if (path === null) return null;
  return {
    path,
    type: asStr(o["type"]) ?? "edit",
    staged: o["staged"] === true,
    additions: typeof o["additions"] === "number" ? o["additions"] : 0,
    deletions: typeof o["deletions"] === "number" ? o["deletions"] : 0,
    patch: asStr(o["patch"]),
  };
}

function readChanges(v: unknown): GitChange[] {
  if (!Array.isArray(v)) return [];
  const out: GitChange[] = [];
  for (const item of v) {
    const c = readChange(item);
    if (c !== null) out.push(c);
  }
  return out;
}

export function readGitStatus(res: unknown): GitStatus {
  const inner = asObj(asObj(res)["result"]);
  return {
    root: asStr(inner["root"]),
    branch: asStr(inner["branch"]),
    commit: asStr(inner["commit"]),
    staged: readChanges(inner["staged"]),
    unstaged: readChanges(inner["unstaged"]),
  };
}

export function readGitDiffs(res: unknown): GitChange[] {
  return readChanges(asObj(asObj(res)["result"])["files"]);
}

export type GitFileContent = { path: string; version: string | null; content: string | null; isBinary: boolean };

export function readGitFiles(res: unknown): GitFileContent[] {
  const files = asObj(asObj(res)["result"])["files"];
  if (!Array.isArray(files)) return [];
  const out: GitFileContent[] = [];
  for (const item of files) {
    const o = asObj(item);
    const path = asStr(o["path"]);
    if (path === null) continue;
    out.push({
      path,
      version: asStr(o["version"]),
      content: asStr(o["content"]),
      isBinary: o["isBinary"] === true,
    });
  }
  return out;
}

/* ═══════════════ 终端面（生态面 #3） ═══════════════
 *
 * 形状实测（ecosystem-shapes.json 的 terminal/* 段 + 2026-09-11 的 pty 变体实测）：
 *   pty/create ⇒ {result:{terminalId}}
 *   pty/load   ⇒ {result:{terminalId, rows, cols, exited}}
 *   list       ⇒ {result:{terminals[{terminalId,status,interactive,name,exitCode,cwd,outputOffset,createdAt}]}}
 *
 * **输出流不在这里**：它是通知帧（_nofy/terminal/pty/notification），走 core/ptybus.ts，
 * 不进 store、不经 readers（记档例外，理由写在 ptybus 头注）。
 */

function asNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function readTerminalId(res: unknown): string | null {
  return asStr(asObj(asObj(res)["result"])["terminalId"]);
}

export type TerminalLoad = {
  terminalId: string | null;
  rows: number | null;
  cols: number | null;
  exited: boolean;
  /** PtyLoadResult.exit_code（skip_serializing_if none ⇒ 活着时没有这个键） */
  exitCode: number | null;
};

export function readTerminalLoad(res: unknown): TerminalLoad {
  const inner = asObj(asObj(res)["result"]);
  return {
    terminalId: asStr(inner["terminalId"]),
    rows: asNum(inner["rows"]),
    cols: asNum(inner["cols"]),
    exited: inner["exited"] === true,
    exitCode: asNum(inner["exitCode"]),
  };
}

export type TerminalInfo = {
  terminalId: string;
  name: string | null;
  /** 实测词汇：connected / exited */
  status: string | null;
  interactive: boolean;
  exitCode: number | null;
  cwd: string | null;
};

export function readTerminalList(res: unknown): TerminalInfo[] {
  const list = asObj(asObj(res)["result"])["terminals"];
  if (!Array.isArray(list)) return [];
  const out: TerminalInfo[] = [];
  for (const item of list) {
    const o = asObj(item);
    const terminalId = asStr(o["terminalId"]);
    if (terminalId === null) continue;
    out.push({
      terminalId,
      name: asStr(o["name"]),
      status: asStr(o["status"]),
      interactive: o["interactive"] === true,
      exitCode: asNum(o["exitCode"]),
      cwd: asStr(o["cwd"]),
    });
  }
  return out;
}

/* ══════════════ 生态面 #5：marketplace / plugins / skills / mcp 四读 ══════════════
 *
 * 形状双证据：内核 codegen 型（crates/codegen/nofy-hooks-plugins-types/src/lib.rs，
 * camelCase：PluginsListResponse / McpServersListResponse / MarketplaceListResponse；
 * skills 在 nofy-shell extensions/skills.rs 的 SkillsListResponse）＋探针实测
 * （docs/contract/ecosystem-shapes.json）。两处不一致时读取器**两边都收**：
 *   - skills 探针实测键是 snake（user_invocable…），codegen 型是 camel ⇒ 双键兜底；
 *   - mcp 探针实测到 type/command/args/session 族（装机内核旧于 crates 源码），
 *     crates 型是 enabled/status/toolCount/tools/configSource ⇒ 宽松并集。
 * 纪律同 #2：缺字段落兜底、脏条目跳过，设置面不因一条坏数据白屏。 */

export type SkillRow = {
  name: string;
  description: string;
  path: string;
  scope: string;
  enabled: boolean;
  userInvocable: boolean;
};

export function readSkills(res: unknown): SkillRow[] {
  const list = asObj(asObj(res)["result"])["skills"];
  if (!Array.isArray(list)) return [];
  const out: SkillRow[] = [];
  for (const item of list) {
    const o = asObj(item);
    const name = asStr(o["name"]);
    if (name === null) continue;
    out.push({
      name,
      description: asStr(o["description"]) ?? "",
      path: asStr(o["path"]) ?? "",
      scope: asStr(o["scope"]) ?? "",
      enabled: asBool(o["enabled"]),
      userInvocable: asBool(o["userInvocable"] ?? o["user_invocable"]),
    });
  }
  return out;
}

export type PluginRow = {
  id: string;
  name: string;
  enabled: boolean;
  scope: string;
  version: string | null;
  description: string | null;
  skillCount: number;
  agentCount: number;
  mcpServerCount: number;
  hookStatus: string | null;
  marketplaceSource: string | null;
};

export function readPlugins(res: unknown): PluginRow[] {
  const list = asObj(asObj(res)["result"])["plugins"];
  if (!Array.isArray(list)) return [];
  const out: PluginRow[] = [];
  for (const item of list) {
    const o = asObj(item);
    const name = asStr(o["name"]);
    if (name === null) continue;
    out.push({
      id: asStr(o["id"]) ?? name,
      name,
      enabled: asBool(o["enabled"]),
      scope: asStr(o["scope"]) ?? "",
      version: asStr(o["version"]),
      description: asStr(o["description"]),
      skillCount: asNum(o["skillCount"]) ?? 0,
      agentCount: asNum(o["agentCount"]) ?? 0,
      mcpServerCount: asNum(o["mcpServerCount"]) ?? 0,
      hookStatus: asStr(o["hookStatus"]),
      marketplaceSource: asStr(o["marketplaceSource"]),
    });
  }
  return out;
}

export type MarketplacePluginRow = {
  name: string;
  version: string | null;
  description: string | null;
  category: string | null;
  author: string | null;
  installStatus: string | null;
  skillCount: number;
  hasHooks: boolean;
  hasAgents: boolean;
  hasMcp: boolean;
};

export type MarketplaceSourceRow = {
  sourceName: string;
  sourceKind: string;
  sourceUrlOrPath: string;
  error: string | null;
  plugins: MarketplacePluginRow[];
};

export function readMarketplace(res: unknown): MarketplaceSourceRow[] {
  const list = asObj(asObj(res)["result"])["sources"];
  if (!Array.isArray(list)) return [];
  const out: MarketplaceSourceRow[] = [];
  for (const item of list) {
    const o = asObj(item);
    const sourceName = asStr(o["sourceName"]);
    if (sourceName === null) continue;
    const plugins = Array.isArray(o["plugins"]) ? o["plugins"] : [];
    out.push({
      sourceName,
      sourceKind: asStr(o["sourceKind"]) ?? "",
      sourceUrlOrPath: asStr(o["sourceUrlOrPath"]) ?? "",
      error: asStr(o["error"]),
      plugins: plugins.flatMap((p) => {
        const e = asObj(p);
        const name = asStr(e["name"]);
        if (name === null) return [];
        return [
          {
            name,
            version: asStr(e["version"]),
            description: asStr(e["description"]),
            category: asStr(e["category"]),
            author: asStr(e["author"]),
            installStatus: asStr(e["installStatus"]),
            skillCount: asNum(e["skillCount"]) ?? 0,
            hasHooks: asBool(e["hasHooks"]),
            hasAgents: asBool(e["hasAgents"]),
            hasMcp: asBool(e["hasMcp"]),
          },
        ];
      }),
    });
  }
  return out;
}

export type McpToolRow = { name: string; description: string | null };

export type McpServerRow = {
  name: string;
  source: string | null;
  enabled: boolean;
  status: string | null;
  toolCount: number;
  tools: McpToolRow[];
  configSource: string | null;
};

export function readMcpServers(res: unknown): McpServerRow[] {
  const list = asObj(asObj(res)["result"])["servers"];
  if (!Array.isArray(list)) return [];
  const out: McpServerRow[] = [];
  for (const item of list) {
    const o = asObj(item);
    const name = asStr(o["name"]);
    if (name === null) continue;
    // status/tools：crates 型在顶层；装机旧内核把它们塞在 session 对象里 ⇒ 双键兜底
    const session = asObj(o["session"]);
    const toolsRaw = Array.isArray(o["tools"]) ? o["tools"] : [];
    const toolsSource = toolsRaw.length > 0 ? toolsRaw : Array.isArray(session["tools"]) ? session["tools"] : [];
    const tools: McpToolRow[] = toolsSource.flatMap((t) => {
      const e = asObj(t);
      const tn = asStr(e["name"]);
      if (tn === null) return [];
      return [{ name: tn, description: asStr(e["description"]) }];
    });
    out.push({
      name,
      source: asStr(o["source"]),
      enabled: o["enabled"] === undefined ? true : asBool(o["enabled"]),
      status: asStr(o["status"]) ?? asStr(session["status"]),
      toolCount: asNum(o["toolCount"]) ?? asNum(session["toolCount"]) ?? tools.length,
      tools,
      configSource: asStr(o["configSource"]),
    });
  }
  return out;
}
