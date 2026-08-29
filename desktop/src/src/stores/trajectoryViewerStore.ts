// A0-S4-3: 自 modules/stores-session.tsx §1 原样迁入（ls TrajectoryViewerStore；原文件现为薄 re-export shim）。
import * as React from "react";
import { resolveWorkspaceKey as workspaceKey } from './taskStore'; // 原 Io=U
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 1. TrajectoryViewerStore（原 ls，js 2610–2637 / jsx 1697）
 * ----------------------------------------------------------------------------
 * 模型轨迹面板的“打开请求”信箱：跨组件请求打开某任务的 model-trajectory 标签。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | pendingRequest | { workspaceKey, taskId, title, requestId } \| null | 待消费打开请求 |
 * actions：requestOpen/consumeRequest（2 个）
 * ==========================================================================*/

export interface TrajectoryOpenRequest {
  workspaceKey: string;
  taskId: string;
  title?: string | null;
  requestId: string;
}

export interface TrajectoryViewerState {
  pendingRequest: TrajectoryOpenRequest | null;
  requestOpen(request: { workspaceKey: string; taskId: string; title?: string | null }): void;
  consumeRequest(requestId: string): void;
}

let trajectoryRequestSeq = 0; // 原 hoe

export const useTrajectoryViewerStore: UseBoundStore<TrajectoryViewerState> = createStore<TrajectoryViewerState>((set) => ({
  pendingRequest: null,
  requestOpen: (request) => {
    trajectoryRequestSeq += 1;
    set({ pendingRequest: { ...request, requestId: `model-trajectory-open:${trajectoryRequestSeq}` } });
  },
  consumeRequest: (requestId) => {
    set((state) => (state.pendingRequest?.requestId === requestId ? { pendingRequest: null } : state));
  },
}));

/** 原 goe（js 2619–2633）：订阅本工作区的轨迹打开请求并消费 */
export function useTrajectoryOpenRequest(
  workspaceKeyOfView: string,
  onOpen: (target: { taskId: string; title?: string | null }) => void,
): void {
  React.useEffect(() => {
    const handle = (request: TrajectoryOpenRequest | null) => {
      if (!request || request.workspaceKey !== workspaceKeyOfView) return;
      onOpen({ taskId: request.taskId, title: request.title });
      useTrajectoryViewerStore.getState().consumeRequest(request.requestId);
    };
    handle(useTrajectoryViewerStore.getState().pendingRequest);
    return useTrajectoryViewerStore.subscribe((state) => {
      handle(state.pendingRequest);
    });
  }, [onOpen, workspaceKeyOfView]);
}

