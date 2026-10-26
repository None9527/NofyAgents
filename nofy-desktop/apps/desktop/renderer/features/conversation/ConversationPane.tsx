import { memo, useMemo } from "react";
import type { ComponentProps } from "react";
import { createDesktopClient } from "../../application/public.ts";
import { createConversationSelector, selectConversationReady } from "../../application/conversation/public.ts";
import { useProjection } from "../../application/projection/public.ts";
import { useStableCallback } from "../../ui/useStableCallback.ts";
import { Spine } from "./Spine.tsx";
const MemoSpine = memo(Spine);
type Props = ComponentProps<typeof Spine>;
function ConnectedConversation({ runtime, ...props }: Props & { runtime: NonNullable<Props["runtime"]> }) {
  const client = useMemo(() => createDesktopClient(runtime), [runtime]);
  const selector = useMemo(createConversationSelector, []);
  const session = useProjection(client.projection, selector);
  const ready = useProjection(client.projection, selectConversationReady);
  const onSuggest = useStableCallback(props.onSuggest)!;
  const onOpenAgent = useStableCallback(props.onOpenAgent);
  const onEdit = useStableCallback(props.onEdit);
  const onRewound = useStableCallback(props.onRewound);
  const onFindChange = useStableCallback(props.onFindChange);
  return <MemoSpine followToken={props.followToken} key={session?.id ?? "empty"} runtime={runtime} session={session} running={props.running || !ready} onSuggest={onSuggest} onOpenAgent={onOpenAgent} onEdit={onEdit} onRewound={onRewound} findOpen={props.findOpen} onFindChange={onFindChange} jumpRequest={props.jumpRequest} />;
}
export function ConversationPane(props: Props) {
  return props.runtime ? <ConnectedConversation {...props} runtime={props.runtime} /> : <MemoSpine {...props} />;
}
