// A0-S4-4b: 自 modules/ConversationLeaves.tsx §4 自动化卡 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §4 全段（2932–3113）。导入路径按 components/conversation/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { Clock as IconClock } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { Button } from '../../modules/button'; // 原 t（A0-D 接线：declare → button canonical）
import { cn } from '../../modules/UtilsCn'; // 原 Z（A0-D 接线：declare → UtilsCn canonical）
import type { ToolCall, ToolCallNode } from '../../modules/ConversationLeaves'; // 会话流共享类型 canonical（A0-D 类型收敛）

/* ============================================================================
 * 4. 自动化卡（原 sgt…dgt/Mvt/Nvt/Pvt/Fvt/fgt，jsx 93617–93766 + 96194–96238）
 * ==========================================================================*/

/** 原 e1/agt：宽松对象判定/scheduleRule 归一（接口级） */
declare function isPlainObjectLike(value: unknown): value is Record<string, unknown>;
declare function normalizeScheduleRule(value: unknown): unknown;
/** 原 u1：toolCall 节点归一（Conversation.tsx 接口级） */
declare function normalizeToolCallNode(node: ToolCallNode): { toolCall: ToolCall; [key: string]: unknown };
/** 原 rgt：cron 表达式 → 人读调度文案（F15 域，接口级） */
declare function formatCronSchedule(
  args: { cronExpr: string; scheduleRule?: unknown; recurring?: boolean; maxRuns?: number },
  intl: IntlShape,
): string;

function tryParseJsonObject(value: unknown): Record<string, unknown> | null {
  let current = value;
  if (typeof current == "string") {
    try {
      current = JSON.parse(current);
    } catch {
      return null;
    }
  }
  return typeof current == "object" && current && !Array.isArray(current) ? (current as Record<string, unknown>) : null;
}
/** 原 sgt（93617）：cron 创建/更新工具判定 */
function isCronCreateOrUpdate(entry: { toolName?: string; kind?: string; title?: string | null }): boolean {
  return [entry.toolName, entry.kind, entry.title].some((value) => {
    const normalized = (value ?? "").toLowerCase().replace(/[^a-z0-9]/gu, "");
    return normalized === "croncreate" || normalized === "cronupdate";
  });
}
function parseJsonLoose(value: unknown): unknown {
  if (typeof value == "string") return tryParseJsonObject(value) ?? undefined;
  return value;
}
/** 原 ugt：自动化模型归一（camel/snake 双键 + 字段清洗） */
function normalizeAutomationModel(value: unknown): AutomationModel | null {
  const parsed = parseJsonLoose(value);
  if (!isPlainObjectLike(parsed)) return null;
  const container = isPlainObjectLike(parsed.automation) ? parsed.automation : parsed;
  const automationId =
    typeof container.automationId == "string" && container.automationId.trim()
      ? container.automationId.trim()
      : typeof container.automation_id == "string" && container.automation_id.trim()
        ? container.automation_id.trim()
        : undefined;
  const title = typeof container.title == "string" && container.title.trim() ? container.title.trim() : undefined;
  const cronExpr =
    typeof container.cronExpr == "string" && container.cronExpr.trim()
      ? container.cronExpr.trim()
      : typeof container.cron_expr == "string" && container.cron_expr.trim()
        ? container.cron_expr.trim()
        : undefined;
  if (!title && !cronExpr) return null;
  const scheduleRule = normalizeScheduleRule(container.scheduleRule);
  const recurring = typeof container.recurring == "boolean" ? container.recurring : undefined;
  const maxRuns = typeof container.maxRuns == "number" && Number.isFinite(container.maxRuns) ? container.maxRuns : undefined;
  return {
    ...(automationId ? { automationId } : {}),
    ...(title ? { title } : {}),
    ...(cronExpr ? { cronExpr } : {}),
    ...(scheduleRule ? { scheduleRule } : {}),
    ...(recurring === undefined ? {} : { recurring }),
    ...(maxRuns === undefined ? {} : { maxRuns }),
  };
}
export interface AutomationModel {
  automationId?: string;
  title?: string;
  cronExpr?: string;
  scheduleRule?: unknown;
  recurring?: boolean;
  maxRuns?: number;
}
/** 原 dgt（93666）：多源抽取自动化模型（raw/result/output/content） */
function extractAutomationModel(entry: { raw?: unknown; output?: unknown; content?: unknown }): AutomationModel | null {
  const raw = isPlainObjectLike(entry.raw) ? entry.raw : null;
  const result = isPlainObjectLike(raw?.result) ? raw.result : null;
  const candidates = [entry.output, raw?.rawOutput, raw?.output, result?.content, result?.display, raw?.result, entry.content];
  for (const candidate of candidates) {
    const model = normalizeAutomationModel(candidate);
    if (model) return model;
  }
  return null;
}
/** 原 Pvt（96223）：cronDelete 的自动化 id */
function extractDeletedAutomationId(node: { output?: { text?: unknown } | null; input?: unknown; inputText?: string }): string | undefined {
  for (const candidate of [node.output?.text, node.input, node.inputText]) {
    const id = tryParseJsonObject(candidate)?.id;
    if (typeof id == "string" && id.trim()) return id.trim();
  }
  return undefined;
}
export interface AutomationCardModel {
  rowId: number;
  toolCallId: string;
  automation: AutomationModel;
}
/** 原 Mvt（— / 96194）：成功 cron 调用 → 自动化卡列表（delete 移除同 id） */
export function collectAutomationCards(rows: Array<{ kind: string; status: string; toolName: string; rowId: number; toolCallId: string; [key: string]: unknown }>): AutomationCardModel[] {
  let cards: AutomationCardModel[] = [];
  for (const row of rows) {
    if (row.kind !== "toolCall" || row.status !== "success") continue;
    if (row.toolName.toLowerCase().replace(/[^a-z0-9]/gu, "") === "crondelete") {
      const deletedId = extractDeletedAutomationId(row as { output?: { text?: unknown } | null; input?: unknown; inputText?: string });
      if (deletedId) cards = cards.filter((card) => card.automation.automationId !== deletedId);
      continue;
    }
    const normalized = normalizeToolCallNode(row as unknown as ToolCallNode);
    if (!isCronCreateOrUpdate(normalized.toolCall)) continue;
    const automation = extractAutomationModel(normalized.toolCall);
    if (automation) {
      if (automation.automationId) cards = cards.filter((card) => card.automation.automationId !== automation.automationId);
      cards.push({ rowId: row.rowId as number, toolCallId: row.toolCallId as string, automation });
    }
  }
  return cards;
}
/** 原 fgt（107448 区 / 93676）：自动化卡单项（时钟图标 + 标题/调度 + 打开按钮） */
export function AutomationCard({ automation, onOpenAutomationsMain }: { automation: AutomationModel; onOpenAutomationsMain?: (automationId: string) => void }) {
  const { intl } = useIntlContext();
  const title = automation.title ?? intl.formatMessage({ id: "automations.chatCreated.defaultTitle" });
  const schedule = automation.cronExpr
    ? formatCronSchedule(
        {
          cronExpr: automation.cronExpr,
          ...(automation.scheduleRule ? { scheduleRule: automation.scheduleRule } : {}),
          ...(automation.recurring === undefined ? {} : { recurring: automation.recurring }),
          ...(automation.maxRuns === undefined ? {} : { maxRuns: automation.maxRuns }),
        },
        intl,
      )
    : intl.formatMessage({ id: "automations.chatCreated.scheduleFallback" });
  const canOpen = !!onOpenAutomationsMain;
  return (
    <div data-testid="automation-chat-created-card" className="my-1 w-full rounded-xl border border-border/70 bg-card/70 px-3 py-3 shadow-sm backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground-subtle">
          <IconClock className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-ui-base font-medium text-foreground">{title}</div>
          <div className="mt-0.5 truncate text-ui-base text-foreground-subtle">{schedule}</div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="automation-chat-created-open"
          className={cn(
            "h-auto rounded-lg border-border/70 bg-transparent px-3 py-1.5 text-ui-base text-foreground hover:bg-hover hover:text-foreground",
            !canOpen && "opacity-50",
          )}
          disabled={!canOpen}
          onClick={() => onOpenAutomationsMain?.(automation.automationId ?? "")}
        >
          <span>{intl.formatMessage({ id: "automations.chatCreated.open" })}</span>
        </Button>
      </div>
    </div>
  );
}
/** 原 Fvt（— / 96229）：自动化卡列表 */
export function AutomationCardList({
  cards,
  context,
}: {
  cards: AutomationCardModel[];
  context: { onOpenAutomationsMain?: (automationId: string) => void };
}) {
  if (cards.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <AutomationCard key={`${card.rowId}:${card.toolCallId}`} automation={card.automation} onOpenAutomationsMain={context.onOpenAutomationsMain} />
      ))}
    </div>
  );
}

