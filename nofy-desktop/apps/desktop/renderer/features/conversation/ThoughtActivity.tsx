import { useState } from "react";
import type { Block } from "../../core/store/state.ts";
import { Disclosure } from "../../ui/disclosure.tsx";
import { IconBrain } from "../../ui/icons.tsx";
import { Markdown } from "../../ui/markdown.tsx";
import { RollingSummary } from "../../ui/rollingSummary.tsx";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { latestReasoningLine } from "./workflowModel.ts";

export function ThoughtActivity({ block, active }: { block: Extract<Block, { kind: 'agent-thought' }>; active: boolean }) {
  useLocale();
  const [expanded, setExpanded] = useState(false);
  const streaming = active && !block.closed;
  const summary = streaming && !expanded ? latestReasoningLine(block.text) : null;
  if (!block.text.trim()) return null;
  return <Disclosure className="block block--thought" onOpenChange={setExpanded} summary={<>
    <IconBrain size={16} /><span className={'thought-label' + (streaming && !expanded ? ' activity-live' : '')}>{tr(streaming ? '正在思考' : '思考过程')}</span>
    {summary ? <><span aria-hidden="true">·</span><RollingSummary snapshot={summary} followEnd /></> : null}
  </>}><div className="block__body"><Markdown text={block.text} streaming={!block.closed} /></div></Disclosure>;
}
