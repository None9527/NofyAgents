// A0-S4-3: 自 modules/stores-session.tsx §1b 原样迁入（TuiEditRequestStore（D5c 新增信箱）；原文件现为薄 re-export shim）。
import * as React from "react";
import { resolveWorkspaceKey as workspaceKey } from './taskStore'; // 原 Io=U
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 1b. TuiEditRequestStore（D5c 小件新增；仿 TrajectoryViewerStore 打开请求信箱）
 * ----------------------------------------------------------------------------
 * 「在 TUI 中编辑此任务」的打开请求信箱：会话头 ⋯ 菜单发起，请求在底部终端 dock
 * 新建一页 exec nofy 任务编辑模式（`nofy --resume <sessionId>`，cwd=任务工作区）。
 * 产品口径：TUI=具体任务的编辑器，入口只挂在任务上；本信箱不是 daemon 入口。
 * 消费链：useSidePaneState（peek 不消费 → 打开终端 dock）→ TerminalDockPanel
 * （消费 → 新建带 initialCommand 的终端页）。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | pendingRequest | { workspaceKey, sessionId, cwd, requestId } \| null | 待消费打开请求 |
 * actions：requestOpen/consumeRequest（2 个）
 * TODO(D5c-live)：活体验证（真实桌面壳里点菜单→dock 开页→`nofy --resume` 起 TUI）
 * 依赖主接线 agent（out/main 侧 nofy 二进制/pty 真链路）；DOM 级验证已通过
 * （/tmp/d5c-dom/verify.mjs：菜单渲染/点击→requestOpen/消费→pty spawn+exec）。
 * ==========================================================================*/

export interface TuiEditOpenRequest {
  workspaceKey: string;
  sessionId: string;
  cwd: string;
  requestId: string;
}

export interface TuiEditRequestState {
  pendingRequest: TuiEditOpenRequest | null;
  requestOpen(request: { workspaceKey: string; sessionId: string; cwd: string }): void;
  consumeRequest(requestId: string): void;
}

let tuiEditRequestSeq = 0; // D5c：仿 hoe 递增序号

export const useTuiEditRequestStore: UseBoundStore<TuiEditRequestState> = createStore<TuiEditRequestState>((set) => ({
  pendingRequest: null,
  requestOpen: (request) => {
    tuiEditRequestSeq += 1;
    set({ pendingRequest: { ...request, requestId: `tui-edit-open:${tuiEditRequestSeq}` } });
  },
  consumeRequest: (requestId) => {
    set((state) => (state.pendingRequest?.requestId === requestId ? { pendingRequest: null } : state));
  },
}));

/** D5c：只读订阅本工作区的 TUI 编辑打开请求（不消费）——useSidePaneState 用它打开终端 dock */
export function useTuiEditPendingRequest(workspaceKeyOfView: string): TuiEditOpenRequest | null {
  return useTuiEditRequestStore((state) =>
    state.pendingRequest && state.pendingRequest.workspaceKey === workspaceKeyOfView ? state.pendingRequest : null,
  );
}

/** D5c：订阅并消费本工作区的 TUI 编辑打开请求——TerminalDockPanel 用它新建 exec nofy 的终端页 */
export function useTuiEditOpenRequest(
  workspaceKeyOfView: string,
  onOpen: (target: { sessionId: string; cwd: string }) => void,
): void {
  React.useEffect(() => {
    const handle = (request: TuiEditOpenRequest | null) => {
      if (!request || request.workspaceKey !== workspaceKeyOfView) return;
      onOpen({ sessionId: request.sessionId, cwd: request.cwd });
      useTuiEditRequestStore.getState().consumeRequest(request.requestId);
    };
    handle(useTuiEditRequestStore.getState().pendingRequest);
    return useTuiEditRequestStore.subscribe((state) => {
      handle(state.pendingRequest);
    });
  }, [onOpen, workspaceKeyOfView]);
}

