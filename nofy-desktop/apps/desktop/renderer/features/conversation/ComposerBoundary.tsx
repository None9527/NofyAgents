import { memo } from "react";
import type { ComponentProps } from "react";
import { Composer } from "./Composer.tsx";
import { useStableCallback } from "../../ui/useStableCallback.ts";
const View = memo(Composer);
export function ComposerBoundary(props: ComponentProps<typeof Composer>) {
  const onAttachmentsChange = useStableCallback(props.onAttachmentsChange);
  const onChange = useStableCallback(props.onChange);
  const onSend = useStableCallback(props.onSend);
  const onStop = useStableCallback(props.onStop);
  const onOpenBackgroundWorks = useStableCallback(props.onOpenBackgroundWorks);
  const onPerm = useStableCallback(props.onPerm);
  const pickFiles = useStableCallback(props.pickFiles);
  const onModel = useStableCallback(props.onModel);
  const onEffort = useStableCallback(props.onEffort);
  return <View {...props} onAttachmentsChange={onAttachmentsChange} onChange={onChange!} onSend={onSend!} onStop={onStop!} onOpenBackgroundWorks={onOpenBackgroundWorks} onPerm={onPerm!} pickFiles={pickFiles!} onModel={onModel!} onEffort={onEffort!} />;
}
