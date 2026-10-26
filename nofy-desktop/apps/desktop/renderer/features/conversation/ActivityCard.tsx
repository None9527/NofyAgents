import { memo, useMemo } from "react";
import { Disclosure } from "../../ui/disclosure.tsx";
import { CopyButton } from "../../ui/contentActions.tsx";
import { highlightLines, renderTokens } from "../../ui/highlight.tsx";
import { IconEdit, IconFile, IconSearch, IconTerminal, IconX } from "../../ui/icons.tsx";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { activityPhase, activitySummary, editFragment } from "./activityModel.ts";
import type { ActivityPhase, ActivityTool } from "./activityModel.ts";

function phaseLabel(phase: ActivityPhase) {
  switch (phase) {
    case "pending": return tr("待执行");
    case "running": return tr("执行中");
    case "complete": return tr("已完成");
    case "failed": return tr("失败");
    case "stopped": return tr("已停止");
    case "attention": return tr("需要确认");
    default: return tr("状态未知");
  }
}
export function ActivityBadge({ phase }: { phase: ActivityPhase }) {
  // Normal progress belongs to the summary text. Avoid a second looping signal.
  if (phase === "running" || phase === "pending" || phase === "complete") return null;
  return <span className="activity-badge" data-phase={phase} title={phaseLabel(phase)} role={phase === "attention" ? "status" : undefined}>
    {phase === "failed" ? <IconX size={12} /> : null}
    <span className="activity-badge__label" key={phase}>{phaseLabel(phase)}</span>
  </span>;
}
const json = (value: unknown) => { try { return JSON.stringify(value, null, 2)?.slice(0, 4000) ?? ""; } catch { return ""; } };
const linesOf = (text: string) => text ? text.replace(/\r\n/g, "\n").split("\n") : [];
function EditPreview({ before, after, path }: { before: string[] | null; after: string[]; path?: string }) {
  const partial = after.length > 150 || (before?.length ?? 0) > 150;
  const language = path?.split('.').at(-1) ?? null;
  const removed = useMemo(() => highlightLines((before ?? []).slice(0, 150).join('\n'), language), [before, language]);
  const added = useMemo(() => highlightLines(after.slice(0, 150).join('\n'), language), [after, language]);
  return <section className="activity-diff" aria-label={tr("编辑片段预览")}>
    <div className="activity-output__head"><IconFile size={14} /><span title={path}>{path ?? tr("编辑片段预览")}{partial ? ' · ' + tr("部分预览") : ''}</span>
      {before !== null ? <span className="activity-diff__stats"><span>+{after.length}</span>{' '}<span>−{before.length}</span></span> : null}
    </div>
    <pre><code>{before?.slice(0, 150).map((_, i) => <span className="activity-diff__line" data-change="removed" key={'b' + i}><span className="activity-diff__sign" aria-hidden="true">−</span><span>{renderTokens(removed[i]!, 'b' + i)}{'\n'}</span></span>)}{after.slice(0, 150).map((_, i) => <span className="activity-diff__line" data-change={before !== null ? "added" : undefined} key={'a' + i}><span className="activity-diff__sign" aria-hidden="true">{before !== null ? '+' : ' '}</span><span>{renderTokens(added[i]!, 'a' + i)}{'\n'}</span></span>)}</code></pre>
  </section>;
}
/** One surface for command + output; uses the shared highlighting/copy primitives. */
function ToolOutput({ command, output, phase }: { command?: string; output: string; phase: ActivityPhase }) {
  const tokens = useMemo(() => command ? highlightLines(command, 'bash') : [], [command]);
  return <section className="activity-output" data-phase={phase}>
    <div className="activity-output__head">{command ? <IconTerminal size={14} /> : <IconFile size={14} />}<span>{tr(command ? "终端" : "输出")}{output.length > 16000 ? ' · ' + tr("部分预览") : ''}</span><CopyButton text={output || command || ''} label={output ? "复制结果" : "复制命令"} /></div>
    {command ? <div className="activity-command"><span aria-hidden="true">$</span><code>{tokens.map((line, i) => <span key={i}>{renderTokens(line, String(i))}{i < tokens.length - 1 ? '\n' : ''}</span>)}</code></div> : null}
    {output ? <pre>{output.slice(0, 16000)}</pre> : phase === "running" ? <div className="activity-card__waiting">{tr("等待工具输出…")}</div> : null}
    {phase === "failed" || phase === "stopped" || phase === "attention" ? <div className="activity-output__outcome" data-phase={phase}>{phaseLabel(phase)}</div> : null}
  </section>;
}
export const ActivityCard = memo(function ActivityCard({ block }: { block: ActivityTool }) {
  useLocale();
  const info = activitySummary(block), phase = activityPhase(block), fragment = editFragment(block);
  const Icon = info.family === "execute" ? IconTerminal : info.family === "edit" ? IconEdit : info.family === "explore" ? IconSearch : IconFile;
  const args = block.argsDelta || (block.rawInput == null ? "" : json(block.rawInput)), output = block.resultText ?? "";
  const hasDiff = info.family === "edit" && (!!block.editPreviews?.length || fragment !== null);
  const deferredOutput = hasDiff && phase === "complete" ? output : "";
  const title = tr(info.label);
  return <Disclosure className="activity-card tool-card" canExpand={!!(args || output || block.locations.length || hasDiff || (info.family === "execute" && info.detail) || phase === "running")}
    autoOpen={phase === "attention"}
    summary={<><Icon size={16} /><span className={'activity-card__title' + (phase === 'running' ? ' activity-live' : '')} title={title}>{title}</span>
      {info.detail ? <span className="activity-card__detail" title={info.detail}>{info.filename && info.family !== "execute" ? <><span className="activity-card__filename">{info.filename}</span><span className="activity-card__parent">{info.parent}</span></> : info.detail}</span> : null}
      <ActivityBadge phase={phase} /></>}>
    <div className="activity-card__content" data-kind={info.family}>
      {hasDiff ? (block.editPreviews?.length ? block.editPreviews.map((diff, i) => <EditPreview key={diff.path + i} path={diff.path} before={diff.oldText === null ? null : linesOf(diff.oldText)} after={linesOf(diff.newText)} />) : fragment ? <EditPreview {...fragment} path={info.path} /> : null) : null}
      {info.family === "execute" || (output && !deferredOutput) || (!hasDiff && phase === "running") ? <ToolOutput command={info.family === "execute" ? info.detail : undefined} output={output} phase={phase} /> : null}
      {args || block.locations.length || deferredOutput ? <Disclosure className="activity-parameters" summary={tr("技术详情")}>
        {deferredOutput ? <><div className="activity-parameters__label">{tr("输出")}</div><pre className="activity-parameters__text">{deferredOutput.slice(0, 16000)}</pre><CopyButton text={deferredOutput} label="复制结果" /></> : null}
        {args ? <><div className="activity-parameters__label">{tr("参数")}</div><pre className="activity-parameters__text">{args.slice(0, 4000)}</pre></> : null}
        {block.locations.length ? <><div className="activity-parameters__label">{tr("位置")}</div><pre className="activity-parameters__text">{json(block.locations)}</pre></> : null}
      </Disclosure> : null}
    </div>
  </Disclosure>;
});
