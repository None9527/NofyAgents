// A0-S4-4b: 自 modules/Composer.tsx [B16] 后台工作胶囊单元（BackgroundWork 型 + countBackgroundWorks + BackgroundWorksCapsule + Memo）
// 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = [B16] 段内 7899–7982 + §0 testid 常量 BACKGROUND_WORKS_TRIGGER_TESTID（767，本单元独占消费）
// + §0 图标 declare AgentIcon/WorksCompactIcon（本单元独占消费，随族迁入）。
// 导入路径按 components/composer/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { Terminal as TerminalIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { InfoTooltip as TooltipRoot } from '../../modules/UsageStatsUiParts'; // 原 Ia（A0-D 接线 + A0-CLEANUP2 item 47：TooltipRoot declare → InfoTooltip 属主导出）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { Button } from '../../modules/button'; // 原 H（A0-D 接线：declare → button canonical）

/** 14. 图标（本 chunk 图标块 = lucide vendored 登记；语义按消费点命名） */
declare const AgentIcon: React.ComponentType<{ className?: string }>;
declare const WorksCompactIcon: React.ComponentType<{ className?: string }>;

/** 15. testid 常量（src-HCld2afU.js，B5-11；值已回代核实，见原文件头） */
const BACKGROUND_WORKS_TRIGGER_TESTID = `v4-composer-background-work-trigger`;

/** 后台工作条目形状（语义归纳；中把握度） */
interface BackgroundWork {
  status: string;
  kind: string;
  [key: string]: unknown;
}
export type { BackgroundWork };

/** nZe → countBackgroundWorks（js 69266） */
function countBackgroundWorks(works: BackgroundWork[], subagentCount = 0): { bashCount: number; subagentCount: number; totalCount: number } {
  let bashCount = 0;
  for (const work of works) work.status === `running` && work.kind === `bash` && (bashCount += 1);
  const resolvedSubagentCount = Math.max(0, subagentCount);
  return { bashCount, subagentCount: resolvedSubagentCount, totalCount: bashCount + resolvedSubagentCount };
}

/** rZe → BackgroundWorksCapsule（js 69273） */
export function BackgroundWorksCapsule({ backgroundWorks, runningSubagentCount = 0, onOpen }: {
  backgroundWorks: BackgroundWork[];
  runningSubagentCount?: number;
  onOpen?: () => void;
}): React.ReactElement | null {
  const { intl } = useIntlContext();
  const counts = React.useMemo(() => countBackgroundWorks(backgroundWorks, runningSubagentCount), [backgroundWorks, runningSubagentCount]);
  if (!onOpen || counts.totalCount === 0) return null;
  const tooltipTitle = intl.formatMessage({
      id:
        counts.bashCount > 0
          ? counts.subagentCount > 0
            ? `chat.composer.backgroundWorks.tooltipMixed`
            : `chat.composer.backgroundWorks.tooltipTerminal`
          : `chat.composer.backgroundWorks.tooltipAgent`,
    }),
    ariaLabel = intl.formatMessage(
      { id: `chat.composer.backgroundWorks.ariaLabel` },
      {
        bashCount: String(counts.bashCount),
        subagentCount: String(counts.subagentCount),
        count: String(counts.totalCount),
      },
    );
  return (
    <TooltipRoot title={tooltipTitle}>
      <Button
        type={`button`}
        variant={`ghost`}
        size={`default`}
        data-testid={BACKGROUND_WORKS_TRIGGER_TESTID}
        data-background-bash-count={counts.bashCount}
        data-background-subagent-count={counts.subagentCount}
        data-background-total-count={counts.totalCount}
        aria-label={ariaLabel}
        onClick={onOpen}
        className={`rounded-lg px-1.5 text-ui-base text-[var(--color-foreground-subtle)] tabular-nums`}
      >
        <span data-composer-background-layout={`typed`} className={`inline-flex items-center gap-1 @max-[480px]/composer:hidden`} aria-hidden>
          {counts.bashCount > 0
            ? (
              <span className={`inline-flex items-center gap-0.5`}>
                <TerminalIcon className={`size-3.5`} />
                <span>{counts.bashCount}</span>
              </span>
            )
            : null}
          {counts.subagentCount > 0
            ? (
              <span className={`inline-flex items-center gap-0.5`}>
                <AgentIcon className={`size-3.5`} />
                <span>{counts.subagentCount}</span>
              </span>
            )
            : null}
        </span>
        <span data-composer-background-layout={`compact`} className={`hidden items-center gap-0.5 @max-[480px]/composer:inline-flex`} aria-hidden>
          <WorksCompactIcon className={`size-3.5`} />
          <span>{counts.totalCount}</span>
        </span>
      </Button>
    </TooltipRoot>
  );
}

/** iZe → BackgroundWorksCapsuleMemo（js 69345） */
const BackgroundWorksCapsuleMemo = React.memo(BackgroundWorksCapsule);
