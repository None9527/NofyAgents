import { useState } from "react";
import { ActivityBadge, ActivityCard } from "./ActivityCard.tsx";
import { activityPhase, activitySummary } from "./activityModel.ts";
import type { ActivityTool } from "./activityModel.ts";
import { Disclosure } from "../../ui/disclosure.tsx";
import { RollingSummary } from "../../ui/rollingSummary.tsx";
import { IconSearch, IconTerminal } from "../../ui/icons.tsx";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";

/** Stage lifetime follows chronological boundaries, not the slowest child tool. */
export function WorkStage({ blocks, family, active }: { blocks: ActivityTool[]; family: 'explore' | 'execute'; active: boolean }) {
  useLocale();
  const [expanded, setExpanded] = useState(false);
  const attention = blocks.some(block => activityPhase(block) === 'attention');
  const failed = blocks.filter(block => activityPhase(block) === 'failed').length;
  const latest = (family === 'execute' ? blocks.findLast(block => ['running', 'pending'].includes(activityPhase(block))) : undefined) ?? blocks.at(-1)!;
  const info = activitySummary(latest);
  const files = blocks.map(block => activitySummary(block).path);
  const readsOnly = blocks.every(block => block.toolKind === 'read') && files.every(Boolean);
  const summary = family === 'execute' ? blocks.length + tr(' 个命令') : readsOnly ? new Set(files).size + ' ' + tr('文件') : blocks.length + tr(' 个操作');
  const label = family === 'execute' ? tr(active ? '运行命令' : '已运行') : tr(active ? '查阅' : '已查阅');
  const Icon = family === 'execute' ? IconTerminal : IconSearch;
  const rolling = active && !expanded && !attention;
  return <Disclosure className={'work-group ' + (family === 'explore' ? 'activity-explore' : 'activity-execute')} autoOpen={attention} onOpenChange={setExpanded}
    summary={<><Icon size={16} /><span className={'activity-card__title' + (rolling ? ' activity-live' : '')}>{label}</span>
      <span aria-hidden="true">·</span><RollingSummary enabled={rolling} snapshot={rolling ? { key: latest.id, text: info.detail ?? tr(info.label) } : { key: 'summary', text: summary }} />
      {failed ? <span className="activity-stage__failure">{failed}{tr(' 项失败')}</span> : null}<ActivityBadge phase={attention ? 'attention' : 'complete'} />
    </>}><div className="activity-explore__items">{blocks.map(block => <div key={block.id} data-block-id={block.id}><ActivityCard block={block} /></div>)}</div></Disclosure>;
}
