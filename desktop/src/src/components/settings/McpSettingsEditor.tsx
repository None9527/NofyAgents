// A0-S4-4a: 自 modules/SettingsPanels.tsx MCP 族（§0 局部接口 McpServer + §5–§7）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 374–395（McpServer，模块内私有接口）+ 2291–2910（§5 表单原语 / §6 行件列表 / §7 编辑器）。
import * as React from "react";
import { Select as SelectRoot } from '../../modules/Settings';
import { LoaderCircle as SpinnerIcon, PlusIcon, Trash2 as TrashIcon, PencilIcon, ExternalLinkIcon, ChevronDownIcon, PlugIcon, CircleIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button, ChevronRight as ChevronRightIcon } from '../../modules/button';
import { Input, Textarea } from '../../modules/ImeComposition';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '../../modules/Settings';
import { cn } from '../../modules/UtilsCn';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import {
  mcpServerRowTestid as MCP_SERVER_ROW_TESTID_PREFIX, // bte（8337）
  joinTestidParts as testidOf, // qr
} from '../../modules/SrcSharedB';

interface McpServer {
  id: string;
  name: string;
  source: string; // A0-CLEANUP3 3b：对齐 Settings.McpServer（双向可指派）
  enabled: boolean;
  scope: "user" | "workspace";
  status?: "connected" | "connecting" | "error" | "disconnected";
  toolCount?: number;
  error?: string | null;
  authorization?: { authorizationUrl?: string } | null;
  location?: { source: string; directoryPath?: string } | null;
  config: {
    type?: string;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
    oauth?: unknown;
  };
}

/* ============================================================================
 * 5. MCP 表单原语（原 D7/IQt/O7/LQt/RQt/zQt/k7/BQt/A7/VQt，
 *    js 192349–192532 / jsx 155116–155281）
 * ==========================================================================*/

/** 原 D7（js 192645）：设置表单 Textarea（类名逐字） */
export function SettingsFormTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Textarea
      className={cn(
        "rounded-lg border border-input-border bg-input px-2 py-2 text-ui-base shadow-none placeholder:text-foreground-subtlest hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0",
        className
      )}
      {...props}
    />
  );
}

/** MCP 表单草稿（原 IQt 结构，js 192358） */
export interface McpFormDraft {
  name: string;
  scope: string;
  storageLevel: "user" | "workspace";
  type: "stdio" | "http" | "sse" | "streamableHttp";
  command: string;
  args: string;
  env: string;
  url: string;
  headers: string;
  timeoutMs: string;
  oauth: string;
}

/** 原 IQt（js 192654）：表单草稿缺省值（scope 固定 `zcodeagentmcp`） */
export const MCP_FORM_DRAFT_DEFAULTS: McpFormDraft = {
  name: "",
  scope: "zcodeagentmcp",
  storageLevel: "user",
  type: "stdio",
  command: "",
  args: "",
  env: "",
  url: "",
  headers: "",
  timeoutMs: "",
  oauth: "",
};

/** 原 O7（jsx 155138） */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && !!value && !Array.isArray(value);
}

/** 原 LQt（js 192670）：McpServer → 表单草稿 */
export function mcpServerToFormDraft(server: McpServer): McpFormDraft {
  const config = server.config;
  let type: McpFormDraft["type"];
  if (config.type === "sse") type = "sse";
  else if (config.type === "streamableHttp") type = "streamableHttp";
  else if (config.command) type = "stdio";
  else type = "http";
  return {
    name: server.name,
    scope: "zcodeagentmcp",
    storageLevel: server.scope === "workspace" ? "workspace" : "user",
    type,
    command: config.command ?? "",
    args: (config.args ?? []).join(" "),
    env: config.env ? JSON.stringify(config.env, null, 2) : "",
    url: config.url ?? "",
    headers: config.headers ? JSON.stringify(config.headers, null, 2) : "",
    timeoutMs: typeof config.timeoutMs === "number" ? String(config.timeoutMs) : "",
    oauth: isPlainObject(config.oauth) ? JSON.stringify(config.oauth, null, 2) : "",
  };
}

/** 原 zQt（jsx 155195） */
function parseTimeoutMsInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

/** 原 RQt（js 192697）：表单草稿 → server config（env/headers/oauth 宽容解析） */
export function mcpFormDraftToConfig(draft: McpFormDraft): Record<string, unknown> {
  const timeoutMs = parseTimeoutMsInput(draft.timeoutMs);
  if (draft.type === "stdio") {
    let env: Record<string, unknown> | undefined;
    if (draft.env.trim()) {
      try {
        env = JSON.parse(draft.env);
      } catch {
        /* 宽容：解析失败则丢弃 */
      }
    }
    return {
      type: "stdio",
      command: draft.command,
      args: draft.args.trim() ? draft.args.trim().split(/\s+/) : [],
      env,
      ...(timeoutMs === undefined ? {} : { timeoutMs }),
    };
  }
  let headers: Record<string, unknown> | undefined;
  if (draft.headers.trim()) {
    try {
      headers = JSON.parse(draft.headers);
    } catch {
      /* 宽容 */
    }
  }
  let oauth: Record<string, unknown> | undefined;
  if (draft.oauth?.trim()) {
    try {
      oauth = JSON.parse(draft.oauth);
    } catch {
      /* 宽容 */
    }
  }
  return {
    type: draft.type,
    url: draft.url,
    headers,
    ...(oauth === undefined ? {} : { oauth }),
    ...(timeoutMs === undefined ? {} : { timeoutMs }),
  };
}

/** 原 k7（js 192737）：表单草稿 → JSON 文本（`{"name": {...config}}`） */
export function mcpFormDraftToJson(draft: McpFormDraft): string {
  const name = draft.name.trim() || "my-mcp-server";
  return JSON.stringify({ [name]: mcpFormDraftToConfig(draft) }, null, 2);
}

/** 原 BQt（js 192741）：JSON 文本 → 表单草稿（支持 `{name:{...}}` 与 `{mcpServers:{name:{...}}}`） */
export function parseMcpJsonToFormDraft(json: string, previous: McpFormDraft): McpFormDraft {
  const parsed: unknown = JSON.parse(json);
  let name = previous.name.trim();
  let config: unknown = parsed;
  if (isPlainObject(parsed) && isPlainObject(parsed.mcpServers)) {
    const entries = Object.entries(parsed.mcpServers).filter(([, value]) => isPlainObject(value));
    if (entries.length !== 1) throw new Error("JSON 模式暂时只支持一次编辑一个 MCP server");
    const [entryName, entryConfig] = entries[0];
    name = entryName;
    config = entryConfig;
  } else if (isPlainObject(parsed)) {
    const entries = Object.entries(parsed).filter(([, value]) => isPlainObject(value));
    if (entries.length === 1 && !("type" in parsed) && !("command" in parsed) && !("url" in parsed)) {
      const [entryName, entryConfig] = entries[0];
      name = entryName;
      config = entryConfig;
    }
  }
  if (!isPlainObject(config)) throw new Error("JSON 内容不是有效的 MCP server 配置对象");
  if (!name) throw new Error("JSON 模式需要提供 server 名称");
  const record = config;
  let type: McpFormDraft["type"];
  if (record.type === "sse") type = "sse";
  else if (record.type === "streamableHttp") type = "streamableHttp";
  else if (record.command) type = "stdio";
  else type = "http";
  return {
    name,
    scope: previous.scope,
    storageLevel: previous.storageLevel,
    type,
    command: (record.command as string | undefined) ?? "",
    args: Array.isArray(record.args) ? (record.args as string[]).join(" ") : "",
    env: record.env ? JSON.stringify(record.env, null, 2) : "",
    url: (record.url as string | undefined) ?? "",
    headers: record.headers ? JSON.stringify(record.headers, null, 2) : "",
    timeoutMs: typeof record.timeoutMs === "number" ? String(record.timeoutMs) : "",
    oauth: isPlainObject(record.oauth) ? JSON.stringify(record.oauth, null, 2) : "",
  };
}

/** 原 A7（js 192785）：表单字段 label（类名逐字） */
export function SettingsFormFieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-ui-base font-medium text-foreground-subtle">{children}</label>;
}

/** 原 VQt（js 192791）：MCP 存储级别选择（user|workspace） */
export function McpStorageLevelSelect(props: {
  disabled: boolean;
  storageLevel: "user" | "workspace";
  workspaceAvailable: boolean;
  onChange: (level: "user" | "workspace") => void;
}) {
  const { disabled, storageLevel, workspaceAvailable, onChange } = props;
  const { intl } = useIntlContext();
  return (
    <label className="flex min-w-0 flex-wrap items-center justify-end gap-2">
      <span className="shrink-0 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.scope.label" })}</span>
      <SelectRoot value={storageLevel} onValueChange={(value) => onChange(value as "user" | "workspace")} disabled={disabled}>
        <SelectTrigger size="lg" className="justify-between">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="user">{intl.formatMessage({ id: "settings.scope.user" })}</SelectItem>
          <SelectItem value="workspace" disabled={!workspaceAvailable}>
            {intl.formatMessage({ id: "settings.scope.workspace" })}
          </SelectItem>
        </SelectContent>
      </SelectRoot>
    </label>
  );
}

/* ============================================================================
 * 6. MCP 行件/列表（原 UQt/WQt/GQt/KQt，js 192834–193013 / jsx 155435–155499）
 * ==========================================================================*/

/** 原 UQt（js 193130）：连接状态指示（spinner/圆点 + 颜色） */
export function McpStatusIndicator({ status }: { status?: string }) {
  const colorClass =
    status === "connected"
      ? "text-green-500"
      : status === "connecting"
        ? "text-yellow-500"
        : status === "error"
          ? "text-red-500"
          : "text-muted-foreground";
  return status === "connecting" ? (
    <SpinnerIcon className={`size-3 animate-spin ${colorClass}`} />
  ) : (
    <CircleIcon className={`size-2 fill-current ${colorClass}`} />
  );
}

/** 原 WQt（js 193143）：作用域徽章 */
export function McpScopeBadge({ scope }: { scope: "user" | "workspace" }) {
  const { intl } = useIntlContext();
  const messageId = scope === "workspace" ? "settings.scope.workspace" : "settings.scope.user";
  return (
    <span className="inline-flex items-center rounded-md bg-surface px-2 py-0.5 text-ui-xs text-foreground-subtle ring-1 ring-border">
      {intl.formatMessage({ id: messageId })}
    </span>
  );
}

/** MCP 行件 testid 前缀（原 bte，src chunk）与模板（原 qr） */

/** 原 GQt（js 193151）：MCP 服务器行件 */
export function McpServerRow(props: {
  server: McpServer;
  onEdit: (server: McpServer) => void;
  onDelete: (server: McpServer) => void;
  onToggle: (serverId: string, enabled: boolean) => void;
  onOpenAuthorization?: (server: McpServer) => void;
}) {
  const { server, onEdit, onDelete, onToggle, onOpenAuthorization } = props;
  const { intl } = useIntlContext();
  const typeLabel = server.config.command
    ? "stdio"
    : server.config.type ?? (server.config.url ? "http" : "?");
  const isZcodeManaged = !server.location || server.location.source === "zcode";
  const editable = isZcodeManaged;
  const hasAuthorization = !!server.authorization?.authorizationUrl;
  const authorizationLabel = intl.formatMessage({ id: "settings.mcp.oauth.openAuthorization" });
  const detailLine = server.config.url
    ? `${typeLabel} · ${server.config.url}`
    : server.config.command
      ? `${typeLabel} · ${server.config.command} ${(server.config.args ?? []).join(" ")}`
      : typeLabel;
  return (
    <div
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
      data-mcp-status={server.status ?? ""}
      data-mcp-tool-count={server.toolCount}
      data-testid={testidOf(MCP_SERVER_ROW_TESTID_PREFIX, server.name)}
    >
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle"
        aria-hidden="true"
      >
        <PlugIcon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 truncate text-ui-base font-medium text-foreground">
            <McpStatusIndicator status={server.status} />
            {server.name}
          </span>
          <McpScopeBadge scope={server.scope} />
          {typeof server.toolCount === "number" && (
            <span className="inline-flex rounded-md bg-surface px-1.5 py-0.5 text-ui-xs text-foreground-subtle ring-1 ring-border">
              {intl.formatMessage({ id: "settings.mcp.status.toolCount" }, { count: String(server.toolCount) })}
            </span>
          )}
        </div>
        <div className="mt-1 truncate text-ui-base text-foreground-subtle">{detailLine}</div>
        {server.error && <div className="mt-0.5 text-ui-base text-destructive">{server.error}</div>}
        {server.location?.directoryPath && (
          <div className="mt-0.5 truncate font-mono text-ui-base text-foreground-subtle/60">{server.location.directoryPath}</div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {hasAuthorization && (
          <Button
            variant="outline"
            size="sm"
            aria-label={authorizationLabel}
            data-testid={testidOf("mcp-open-authorization-button", server.name)}
            title={authorizationLabel}
            onClick={() => onOpenAuthorization?.(server)}
          >
            <ExternalLinkIcon className="size-3" aria-hidden="true" />
            <span className="hidden sm:inline">{authorizationLabel}</span>
          </Button>
        )}
        <Switch checked={server.enabled} onCheckedChange={(enabled) => onToggle(server.id, enabled)} />
        <div className="flex items-center gap-1">
          {editable && (
            <Button variant="ghost" size="icon-md" onClick={() => onEdit(server)}>
              <PencilIcon className="size-3.5" />
            </Button>
          )}
          {isZcodeManaged && (
            <Button variant="ghost" size="icon-md" onClick={() => onDelete(server)}>
              <TrashIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** 原 KQt（js 193252）：MCP 服务器列表/空态 */
export function McpServerList(props: {
  servers: McpServer[];
  onCreate: () => void;
  onEdit: (server: McpServer) => void;
  onDelete: (server: McpServer) => void;
  onToggle: (serverId: string, enabled: boolean) => void;
  onOpenAuthorization?: (server: McpServer) => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const { servers, onCreate, onEdit, onDelete, onToggle, onOpenAuthorization, emptyTitle, emptyDescription } = props;
  const { intl } = useIntlContext();
  return servers.length === 0 ? (
    <div className="overflow-hidden rounded-xl border border-dashed border-border">
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
        <div className="space-y-1">
          <div className="text-ui-base font-medium text-foreground">{emptyTitle}</div>
          <div className="text-ui-base text-foreground-subtle">{emptyDescription}</div>
        </div>
        <Button variant="outline" size="sm" onClick={onCreate}>
          <PlusIcon className="size-4" />
          <span>{intl.formatMessage({ id: "settings.mcp.create.open" })}</span>
        </Button>
      </div>
    </div>
  ) : (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="divide-y divide-border">
        {servers.map((server) => (
          <McpServerRow
            key={server.id}
            server={server}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            onOpenAuthorization={onOpenAuthorization}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * 7. MCP 服务器编辑器（原 HQt，js 192533–192833 / jsx 155282–155434）
 * ==========================================================================*/

export interface McpServerEditorProps {
  initial?: McpServer;
  editingId?: string;
  /** A0-CLEANUP3 3b：Settings 调用面附带 source（编辑器体内未消费，仅对齐调用面） */
  source?: string;
  editorMode: "form" | "json";
  onEditorModeChange: (mode: "form" | "json") => void;
  onSave: (server: McpFormDraft, initial?: McpServer) => void;
  onCancel: () => void;
  workspaceAvailable?: boolean;
}

/** 原 HQt：表单/JSON 双模式编辑器（stdio/http/sse；env/headers 折叠区） */
export function McpServerEditor(props: McpServerEditorProps) {
  const { initial, editingId, editorMode, onEditorModeChange, onSave, onCancel, workspaceAvailable = false } = props;
  const { intl } = useIntlContext();
  const initialDraft = initial ? mcpServerToFormDraft(initial) : { ...MCP_FORM_DRAFT_DEFAULTS };
  const [draft, setDraft] = React.useState<McpFormDraft>(initialDraft);
  const [jsonText, setJsonText] = React.useState(() => mcpFormDraftToJson(initialDraft));
  const [jsonError, setJsonError] = React.useState<string | null>(null);
  const [envExpanded, setEnvExpanded] = React.useState(false);
  const draftRef = React.useRef(draft);
  const jsonRef = React.useRef(jsonText);
  const modeRef = React.useRef(editorMode);
  React.useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  React.useEffect(() => {
    jsonRef.current = jsonText;
  }, [jsonText]);
  React.useEffect(() => {
    const previousMode = modeRef.current;
    if (previousMode !== editorMode) {
      if (editorMode === "json") {
        setJsonText(mcpFormDraftToJson(draftRef.current));
        setJsonError(null);
        modeRef.current = editorMode;
        return;
      }
      try {
        setDraft(parseMcpJsonToFormDraft(jsonRef.current, draftRef.current));
        setJsonError(null);
        modeRef.current = editorMode;
      } catch (error) {
        setJsonError(
          error instanceof Error ? error.message : intl.formatMessage({ id: "settings.mcp.form.jsonParseError" })
        );
        onEditorModeChange(previousMode);
      }
    }
  }, [editorMode, intl, onEditorModeChange]);

  function patchDraft(patch: Partial<McpFormDraft>) {
    setDraft((previous) => {
      const next = { ...previous, ...patch };
      if (editorMode === "json") setJsonText(mcpFormDraftToJson(next));
      return next;
    });
  }

  function handleSave() {
    if (editorMode === "json") {
      try {
        const parsed = parseMcpJsonToFormDraft(jsonText, draft);
        setDraft(parsed);
        setJsonError(null);
        onSave(parsed, initial);
      } catch (error) {
        setJsonError(
          error instanceof Error ? error.message : intl.formatMessage({ id: "settings.mcp.form.jsonParseError" })
        );
      }
      return;
    }
    onSave(draft, initial);
  }

  const canSave =
    editorMode === "json"
      ? jsonText.trim().length > 0
      : !!(draft.name.trim() && (draft.type === "stdio" ? draft.command.trim() : draft.url.trim()));
  const envToggleLabel =
    draft.type === "stdio"
      ? intl.formatMessage({ id: "settings.mcp.form.envOptional" })
      : intl.formatMessage({ id: "settings.mcp.form.headersOptional" });
  const keyValueText = draft.type === "stdio" ? draft.env : draft.headers;
  const keyValuePlaceholder =
    draft.type === "stdio"
      ? `{
  "MY_API_KEY": "your-key"
}`
      : `{
  "Authorization": "Bearer your-token"
}`;
  const handleKeyValueChange = (value: string) =>
    patchDraft(draft.type === "stdio" ? { env: value } : { headers: value });
  const storageLevelSelect = (
    <McpStorageLevelSelect
      disabled={!!initial}
      storageLevel={draft.storageLevel}
      workspaceAvailable={workspaceAvailable}
      onChange={(level) => patchDraft({ storageLevel: level })}
    />
  );

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      {editorMode === "json" ? (
        <div className="space-y-3">
          <div className="flex justify-end">{storageLevelSelect}</div>
          <div className="space-y-1.5">
            <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.fullConfig" })}</SettingsFormFieldLabel>
            <SettingsFormTextarea
              rows={16}
              className="font-mono text-ui-base"
              placeholder={`{
  "my-mcp-server": {
    "type": "http",
    "url": "https://example.com/mcp"
  }
}`}
              value={jsonText}
              onChange={(event) => {
                setJsonText(event.target.value);
                if (jsonError) setJsonError(null);
              }}
            />
            <p className="text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: "settings.mcp.form.pasteHintPrefix" })}{" "}
              <code>{`{"server-name": {...}}`}</code>{" "}
              {intl.formatMessage({ id: "settings.mcp.form.pasteHintMiddle" })}{" "}
              <code>{`{"mcpServers": {"server-name": {...}}}`}</code>
              {intl.formatMessage({ id: "settings.mcp.form.pasteHintSuffix" })}
            </p>
            {jsonError && <p className="text-ui-base text-destructive">{jsonError}</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="w-full min-w-0 space-y-1.5 md:w-48">
              <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.name" })}</SettingsFormFieldLabel>
              <Input
                size="lg"
                placeholder="my-mcp-server"
                value={draft.name}
                disabled={!!editingId}
                onChange={(event) => patchDraft({ name: event.target.value })}
              />
            </div>
            <div>{storageLevelSelect}</div>
          </div>
          <div className="space-y-1.5">
            <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.type" })}</SettingsFormFieldLabel>
            <SelectRoot value={draft.type} onValueChange={(value) => patchDraft({ type: value as McpFormDraft["type"] })}>
              <SelectTrigger size="lg" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stdio">{intl.formatMessage({ id: "settings.mcp.form.type.stdio" })}</SelectItem>
                <SelectItem value="http">HTTP</SelectItem>
                <SelectItem value="sse">{intl.formatMessage({ id: "settings.mcp.form.type.sse" })}</SelectItem>
              </SelectContent>
            </SelectRoot>
          </div>
          <div className="w-full space-y-1.5 md:w-48">
            <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.timeoutMs" })}</SettingsFormFieldLabel>
            <Input
              size="lg"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="30000"
              value={draft.timeoutMs}
              onChange={(event) => patchDraft({ timeoutMs: event.target.value })}
            />
          </div>
          {draft.type === "stdio" ? (
            <>
              <div className="space-y-1.5">
                <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.command" })}</SettingsFormFieldLabel>
                <Input
                  size="lg"
                  placeholder="npx"
                  value={draft.command}
                  onChange={(event) => patchDraft({ command: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <SettingsFormFieldLabel>{intl.formatMessage({ id: "settings.mcp.form.args" })}</SettingsFormFieldLabel>
                <Input
                  size="lg"
                  placeholder="-y @modelcontextprotocol/server-memory"
                  value={draft.args}
                  onChange={(event) => patchDraft({ args: event.target.value })}
                />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <SettingsFormFieldLabel>URL</SettingsFormFieldLabel>
              <Input
                size="lg"
                placeholder="https://mcp.example.com/mcp"
                value={draft.url}
                onChange={(event) => patchDraft({ url: event.target.value })}
              />
            </div>
          )}
          <div>
            <button
              type="button"
              className="flex items-center gap-1 text-ui-base text-foreground-subtle hover:text-foreground"
              onClick={() => setEnvExpanded((expanded) => !expanded)}
            >
              {envExpanded ? <ChevronDownIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />}
              {envToggleLabel}
            </button>
            {envExpanded && (
              <div className="mt-2 space-y-1.5">
                <SettingsFormTextarea
                  rows={4}
                  className="font-mono text-ui-base"
                  placeholder={keyValuePlaceholder}
                  value={keyValueText}
                  onChange={(event) => handleKeyValueChange(event.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button size="lg" disabled={!canSave} onClick={handleSave}>
          {initial ? intl.formatMessage({ id: "common.save" }) : intl.formatMessage({ id: "settings.mcp.form.add" })}
        </Button>
        <Button variant="ghost" size="lg" onClick={onCancel}>
          {intl.formatMessage({ id: "common.cancel" })}
        </Button>
      </div>
    </div>
  );
}
