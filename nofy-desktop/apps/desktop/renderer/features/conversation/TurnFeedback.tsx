import type { TurnRecord } from '../../core/store/state.ts';
import { Disclosure } from '../../ui/disclosure.tsx';
import { CopyButton } from '../../ui/contentActions.tsx';
import { Btn } from '../../ui/primitives.tsx';
import { IconX } from '../../ui/icons.tsx';
import { tr } from '../../ui/i18n.ts';
/** Always outside the activity disclosure: lifecycle feedback cannot disappear with its history. */
export function TurnFeedback({ turn, running, onRestore }: {
  turn: TurnRecord | null; running: boolean; onRestore?: () => void;
}) {
  const feedback = turn?.feedback;
  if (!feedback || (feedback.kind === 'retrying' && !running)) return null;
  const failed = feedback?.kind === 'failed';
  const retrying = feedback?.kind === 'retrying' && running;
  const label = failed ? tr('本轮请求失败') : tr('模型请求重试中');
  const message = feedback?.message.includes('no_visible_content') ? tr('模型返回了空响应。') : feedback?.message;
  return <div className="turn-feedback" data-state={failed ? 'failed' : retrying ? 'retrying' : 'running'}>
    <div className="turn-feedback__heading" role={failed ? 'alert' : 'status'}>
      {failed ? <IconX size={14} /> : null}
      <span className={failed ? undefined : 'activity-live'}>{label}</span>
      {retrying ? <span className="turn-feedback__attempt">{feedback.attempt} / {feedback.maxRetries}</span> : null}
    </div>
    {feedback ? <>
      <p className="turn-feedback__message">{message}{retrying ? tr('正在自动重试，可随时停止。') : failed ? tr('你可以检查模型配置，或编辑原消息后重新发送。') : ''}</p>
      <div className="turn-feedback__actions">
        {failed && onRestore ? <Btn variant="ghost" onClick={onRestore}>{tr('编辑原消息')}</Btn> : null}
        <CopyButton text={feedback.message} label="复制错误详情" />
        <Disclosure className="activity-parameters" summary={tr('技术详情')}><pre className="activity-parameters__text">{feedback.message}</pre></Disclosure>
      </div>
    </> : null}
  </div>;
}
