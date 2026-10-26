import { SettingsExitGuard } from "./SettingsExitGuard.tsx";
import { memo } from "react";
import { useStableCallback } from "../../ui/useStableCallback.ts";
import { SettingsSurface } from "./SettingsSurface.tsx";
import type { SettingsSurfaceProps } from "./SettingsSurface.tsx";
const View = memo(SettingsSurface);
export function SettingsBoundary(props: SettingsSurfaceProps) {
  const onSection = useStableCallback(props.onSection)!;
  const onClose = useStableCallback(props.onClose)!;
  const onTheme = useStableCallback(props.onTheme)!;
  return <SettingsExitGuard><View {...props} onSection={onSection} onClose={onClose} onTheme={onTheme} /></SettingsExitGuard>;
}
