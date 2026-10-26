import { memo } from "react";
import type { SidebarProps } from "./Sidebar.tsx";
import { Sidebar } from "./Sidebar.tsx";
import { useStableCallback } from "../../ui/useStableCallback.ts";
const View = memo(Sidebar);
export function SidebarBoundary(props: SidebarProps) {
  const onArchiveView = useStableCallback(props.onArchiveView);
  const onRenameGroup = useStableCallback(props.onRenameGroup);
  const onRemoveGroup = useStableCallback(props.onRemoveGroup);
  const onTaskMetadataChange = useStableCallback(props.onTaskMetadataChange);
  const onOpenWorkspace = useStableCallback(props.onOpenWorkspace);
  const onPickWorkspace = useStableCallback(props.onPickWorkspace);
  const onTheme = useStableCallback(props.onTheme);
  const onView = useStableCallback(props.onView);
  const onSort = useStableCallback(props.onSort);
  const onReorderProjects = useStableCallback(props.onReorderProjects);
  const onNewSession = useStableCallback(props.onNewSession);
  const onOpenPalette = useStableCallback(props.onOpenPalette);
  const onPickTask = useStableCallback(props.onPickTask);
  const onOpenSettings = useStableCallback(props.onOpenSettings);
  return <View {...props} onArchiveView={onArchiveView} onRenameGroup={onRenameGroup} onRemoveGroup={onRemoveGroup} onTaskMetadataChange={onTaskMetadataChange} onOpenWorkspace={onOpenWorkspace!} onPickWorkspace={onPickWorkspace!} onTheme={onTheme!} onView={onView!} onSort={onSort!} onReorderProjects={onReorderProjects!} onNewSession={onNewSession!} onOpenPalette={onOpenPalette!} onPickTask={onPickTask!} onOpenSettings={onOpenSettings!} />;
}
