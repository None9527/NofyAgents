/* eslint-disable */
/**
 * ============================================================================
 * WorkspaceTabsDeep.tsx — 横切「工作区标签页 store + 服务袋解析」深部逐字重建（A1-R1 批次）
 * ============================================================================
 *
 * 来源文件（融合 chunk，本工作区现行 213,979 行，只读未改动）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 解码范围（行号 = 现行 out js 行）：
 *   js 3598–3625   git 自动刷新纯助手（Voe/Hoe/Uoe/Woe/Goe；Koe/qoe 已在
 *                  services/eventPrimitives.ts 重建，本文件经 import 复用）
 *   js 4436–4893   工作区展开持久化 + 标签页模型 + createWorkspaceTabStore 工厂
 *                  + TabStoreProvider/useTabStore 族 + 会话解析助手
 *   js 4996–5064   git 自动刷新监听钩子（Yse）
 *   隙段说明：3626–4435（Os/ks/As 事件原语、ise 协议客户端类、Us 服务代理、
 *                  Zs 会话注册表）已由 services/eventPrimitives.ts、
 *                  services/ipcBridge.ts、stores/sessionRegistryStore.ts、
 *                  services/sessionRegistry.ts 重建，本文件经 import 消费。
 *   双归属裁决：js 4834–4996（gc/Hse/bc/xc/Sc/Cc/Use/wc/Wse/Gse/Tc/Kse/Ec/qse/
 *                  Dc/Oc）已由 services/remoteServices.ts（A0-S4-5）重建并经
 *                  modules/services.tsx 接线消费 → canonical = remoteServices.ts；
 *                  本文件不重复转录，Yse 经 import 消费其 useWorkspaceServices；
 *                  remoteServices.ts 内残留的 pc/oc declare 改指本文件（§改指）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号 = 现行 out js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 * [A] git 自动刷新纯助手：
 *   Voe → isGitSummaryWorkspaceCurrent   (3598 / 2447)
 *   Hoe → normalizeWatchPath             (3601 / 2450)
 *   Uoe → collectGitWatchPaths           (3605 / 2454)
 *   Woe → serializeWatchPaths            (3616 / 2465)
 *   Goe → parseWatchPaths                (3619 / 2468)
 * [B] 工作区展开持久化 + 标签页模型：
 *   Ese → WORKSPACE_EXPANSION_STORAGE_KEY (4436 / 3274)  `zcode-workspace-expansion`
 *   nc  → safeLocalStorage               (4437 / 3275)
 *   Dse → sanitizeBooleanRecord          (4445 / 3283)
 *   rc  → readWorkspaceExpansionMap      (4452 / 3290)
 *   Ose → writeWorkspaceExpansionMap     (4461 / 3299)
 *   ic  → persistWorkspaceExpansion      (4464 / 3302)
 *   kse → expandedPathSet                (4468 / 3306)
 *   Ase → isRemoteBackedTab              (4471 / 3309)
 *   jse → isLocalOnlyTab                 (4474 / 3312)
 *   ac  → workspaceTabMatchesTarget      (4477 / 3315)
 *   Mse → SETTINGS_TAB_ID                (4486 / 3324)  `__settings__`
 *   oc  → isWorkspaceKindTab             (4487 / 3325)
 *   Nse → isUnavailableLocalDirectoryTab (4490 / 3328)
 *   sc  → hasUnavailableLocalDirectoryTab (4493 / 3331)
 *   Pse → isSettingsTab                  (4497 / 3335)
 *   Fse → workspacePathBaseName          (4500 / 3338)
 *   cc  → createWorkspaceTab             (4504 / 3342)
 *   lc  → patchWorkspaceTab              (4518 / 3356)
 *   Ise → normalizeRestorableTab         (4530 / 3368)
 *   Lse → createSettingsTab              (4533 / 3371)
 *   Rse → moveTabByIndex                 (4536 / 3374)
 *   uc  → setWithAdded                   (4541 / 3379)
 *   zse → setWithRemoved                 (4546 / 3384)
 * [C] 标签页 store 工厂 + Provider/钩子：
 *   dc  → createWorkspaceTabStore        (4551 / 3388)
 *   fc  → WorkspaceTabStoreContext       (4782 / 3606)
 *   Bse → fallbackWorkspaceTabStore      (4783 / 3607)
 *   Vse → WorkspaceTabStoreProvider      (4784 / 3608)
 *   pc  → useWorkspaceTabStore           (4801 / 3625)  useTabStore（消费侧 declare 名）
 *   mc  → useWorkspaceTabStoreOptional   (4806 / 3630)
 *   hc  → useWorkspaceTabStoreApi        (4809 / 3633)  useTabStoreApi（消费侧 declare 名）
 *   gc  → resolveTabRemoteSessionId      (4814 / 3638)
 *   _c  → tabHasRemoteBacking            (4822 / 3646)
 *   vc  → resolveTabServicesBinding      (4825 / 3649)
 *   yc  → buildWorkspaceServicesBindings (4834 / 3658)
 *   Hse → resolveWorkspaceSessionId      (4842 / 3666)
 *   bc  → useResolvedWorkspaceSessionId  (4868 / 3692)
 * [D] 远控断连 + 服务袋解析（原 4893–4996）—— 双归属裁决：canonical =
 *     services/remoteServices.ts（A0-S4-5 已重建并经 modules/services.tsx 接线）：
 *   xc/Sc/Cc/Use/wc/Wse/Gse/Tc/Kse → REMOTE_WORKSPACE_DISCONNECTED/
 *     isRemoteDisconnectedError/getDisconnectedServices/…（remoteServices 内部）
 *   gc/Hse/bc → resolveSessionIdForWorkspace/resolveRemoteSessionIdFromRegistry/
 *     useResolvedRemoteSessionId
 *   Ec/qse/Dc/Oc → useBaseServices/useBaseServicesOptional/
 *     useResolvedWorkspaceServices/useWorkspaceServices
 *     本文件不重复转录；其残留 pc/oc declare 改指本文件（见下 §C 导出）。
 * [E] git 自动刷新监听钩子：
 *   Jse → GIT_AUTO_REFRESH_DEBOUNCE_MS   (4996 / 3820)  = 60000
 *   Yse → useGitAutoRefreshWatcher       (4997 / 3821)
 *
 * ----------------------------------------------------------------------------
 * 二、跨块依赖（原混淆名 → 重建属主）
 * ----------------------------------------------------------------------------
 *   Ae（skillStore 导出 q）→ stores/zustand `create`
 *   ne（skillStore 导出 J）→ stores/zustand `useStore`
 *   re（skillStore 导出 K）→ stores/e2eStoreBridge `isE2EStoreBridgeEnabled`
 *   xi（src chunk 导出 ot=cx）→ lib/uuid `generateUuid`
 *   Io=U（skillStore 导出 H=b）→ modules/SkillStore `resolveWorkspaceKey`
 *   Zs → stores/sessionRegistryStore `useSessionRegistryStore`
 *   Oc → services/remoteServices `useWorkspaceServices`（canonical 属主）
 *   J → modules/SkillStore `logger`（re-export）
 *
 * 函数体内局部名保留原混淆名（逐字口径）；类型面按调用面归纳（§四）。
 */

import * as React from "react";
import { create as createStore, useStore } from "../stores/zustand"; // 原 Ae | 原 ne
import { isE2EStoreBridgeEnabled } from "../stores/e2eStoreBridge"; // 原 re
import { generateUuid } from "../lib/uuid"; // 原 xi
import { resolveWorkspaceKey, logger } from "./SkillStore"; // 原 Io=U | 原 J
import { useSessionRegistryStore } from "../stores/sessionRegistryStore"; // 原 Zs
import type { BaseServices, SessionRegistryState } from "../stores/sessionRegistryStore";
import { useWorkspaceServices } from "../services/remoteServices"; // 原 Oc（canonical 属主，双归属裁决见头注）

/* ============================================================================
 * 〇、类型面（调用面归纳；运行时形状以 bundle 为准）
 * ==========================================================================*/

/** 远控目标描述（bundle 未给出形状证据，消费面按不透明值传递）。 */
export type RemoteTarget = unknown;

/** 工作区标签页（原 dc store 元素形状，cc/lc/oc 调用面归纳）。
 * type 别名（非 interface）：消费侧存在 [key: string]: unknown 索引签名型
 * （remoteServices WorkspaceTabLike），型别名具隐式索引签名可赋值性。 */
export type WorkspaceTab = {
  id: string;
  kind: "workspace" | "settings";
  label: string;
  workspacePath?: string;
  availability?: string;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget;
  workspaceIdentity?: string | null;
  localWorkspacePath?: string | null;
  workspacePurpose?: string | null;
  remoteHistoryId?: string | null;
};

/** cc/lc 的可选字段入参面。 */
export interface WorkspaceTabPatch {
  availability?: string;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget;
  workspaceIdentity?: string | null;
  localWorkspacePath?: string | null;
  workspacePurpose?: string | null;
  remoteHistoryId?: string | null;
}

/** restoreTabs/completeTabRestore 入参元素（Ise 归一化前）。 */
export type RestorableTabInput =
  | string
  | ({ workspacePath: string } & WorkspaceTabPatch);

export interface WorkspaceTabStoreState {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  activeWorkspacePath: string | null;
  activeWorkspaceIdentity: string | null;
  expandedWorkspacePaths: Set<string>;
  addTab(workspacePath: string, patch?: WorkspaceTabPatch): string;
  ensureWorkspaceTab(workspacePath: string, patch?: WorkspaceTabPatch): string;
  closeTab(tabId: string): void;
  activateTab(tabId: string): void;
  reorderTabs(from: number, to: number): void;
  reorderWorkspaceTabs(from: number, to: number): void;
  openSettingsTab(): void;
  toggleWorkspaceExpanded(workspacePath: string): void;
  expandAllWorkspaceTabs(workspacePaths: string[]): void;
  collapseAllWorkspaceTabs(workspacePaths: string[]): void;
  activateTabByPath(workspacePath: string, patch?: WorkspaceTabPatch): boolean;
  restoreTabs(inputs: RestorableTabInput[], activeIndex: number): void;
  completeTabRestore(inputs: RestorableTabInput[]): void;
}

/** vc/yc 的单工作区服务绑定结果。 */
export interface WorkspaceServicesBinding {
  services: BaseServices;
  remoteSessionId?: string;
  isRemoteWorkspace: boolean;
}

/** fileWatcherService 调用面（Yse 消费：watch/unwatch/onDynamicChange）。 */
export interface FileWatcherServiceLike {
  watch(args: { path: string; recursive: boolean }): Promise<{ id: string }>;
  unwatch(args: { id: string }): Promise<void>;
  onDynamicChange(id: string): (listener: (event: { dirPath: string }) => void) => { dispose(): void };
}

/** Yse 入参的 git 摘要面（GitReview 域模型，调用面归纳）。 */
export interface GitAutoRefreshSummary {
  isGitAvailable: boolean;
  isRepository: boolean;
  repoRoot?: string | null;
  workspacePath?: string | null;
  autoRefreshWatchPaths?: Array<{ path: string; recursive?: boolean }>;
}

declare global {
  interface Window {
    /** E2E store 桥探针（原 Vse 内 window.__zcodeTabStoreE2E 挂卸）。 */
    __zcodeTabStoreE2E?: unknown;
  }
}

/* ============================================================================
 * A. git 自动刷新纯助手（原 3598–3625）
 * ==========================================================================*/

/** 原 Voe：当前工作区与摘要工作区一致时启用自动刷新。 */
export function isGitSummaryWorkspaceCurrent(e: { enabled?: boolean; currentWorkspaceKey?: string | null; summaryWorkspaceKey?: string | null }): boolean {
  return !!e.enabled && e.currentWorkspaceKey === e.summaryWorkspaceKey;
}

/** 原 Hoe：去尾部斜杠（保留裸根 `/` 与盘符根）。 */
export function normalizeWatchPath(e: string): string {
  let t = e.trim();
  return t === `/` || /^[A-Za-z]:[\\/]?$/.test(t) ? t : t.replace(/[\\/]+$/, ``);
}

/** 原 Uoe：由 git 摘要收集监听路径（仓库根 + 附加路径去重）。 */
export function collectGitWatchPaths(e: GitAutoRefreshSummary): Array<{ path: string; recursive: boolean }> {
  if (!e.isGitAvailable || !e.isRepository) return [];
  let t = normalizeWatchPath(e.workspacePath || e.repoRoot || "");
  if (t.length === 0) return [];
  let n: Array<{ path: string; recursive: boolean }> = [{ path: t, recursive: !0 }];
  for (let t of e.autoRefreshWatchPaths ?? []) {
    let e = normalizeWatchPath(t.path);
    !e || n.some((t) => t.path === e) || n.push({ path: e, recursive: !!t.recursive });
  }
  return n;
}

/** 原 Woe：监听路径序列化（依赖比较用）。 */
export function serializeWatchPaths(e: Array<{ path: string; recursive: boolean }>): string {
  return JSON.stringify(e);
}

/** 原 Goe：监听路径反序列化。 */
export function parseWatchPaths(e: string): Array<{ path: string; recursive: boolean }> {
  // JSON.parse 返回 any；型别按 serializeWatchPaths 往返契约归一（运行时无差）
  return (JSON.parse(e) as Array<{ path: string; recursive?: boolean }>).map((e) => ({ path: e.path, recursive: !!e.recursive }));
}

/* ============================================================================
 * B. 工作区展开持久化 + 标签页模型（原 4436–4550）
 * ==========================================================================*/

/** 原 Ese：localStorage 键。 */
export const WORKSPACE_EXPANSION_STORAGE_KEY = `zcode-workspace-expansion`;

/** 原 nc：安全取 localStorage（SSR/禁用场景返回 null）。 */
export function safeLocalStorage(): Storage | null {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 原 Dse：只保留 string→boolean 项。 */
export function sanitizeBooleanRecord(e: unknown): Record<string, boolean> {
  return !e || typeof e != `object` || Array.isArray(e)
    ? {}
    : Object.fromEntries(
        Object.entries(e as Record<string, unknown>).filter((e) => typeof e[0] == `string` && typeof e[1] == `boolean`),
      ) as Record<string, boolean>;
}

/** 原 rc：读展开映射。 */
export function readWorkspaceExpansionMap(e: Storage | null = safeLocalStorage()): Record<string, boolean> {
  let t = e?.getItem(WORKSPACE_EXPANSION_STORAGE_KEY);
  if (!t) return {};
  try {
    return sanitizeBooleanRecord(JSON.parse(t));
  } catch {
    return {};
  }
}

/** 原 Ose：写展开映射。 */
export function writeWorkspaceExpansionMap(e: Record<string, boolean>, t: Storage | null = safeLocalStorage()): void {
  t?.setItem(WORKSPACE_EXPANSION_STORAGE_KEY, JSON.stringify(sanitizeBooleanRecord(e)));
}

/** 原 ic：单路径展开态持久化（变更才写）。 */
export function persistWorkspaceExpansion(e: string, t: boolean, n: Storage | null = safeLocalStorage()): void {
  let r = readWorkspaceExpansionMap(n);
  r[e] !== t && writeWorkspaceExpansionMap({ ...r, [e]: t }, n);
}

/** 原 kse：未被显式收起的路径集合。 */
export function expandedPathSet(e: string[], t: Record<string, boolean>): Set<string> {
  return new Set(e.filter((e) => t[e] !== !1));
}

/** 原 Ase：有远控后端（identity 或远端会话）。 */
export function isRemoteBackedTab(e: { workspaceIdentity?: string | null; remoteSessionId?: string | null }): boolean {
  return !!(e.workspaceIdentity || e.remoteSessionId);
}

/** 原 jse：纯本地标签。 */
export function isLocalOnlyTab(e: { workspaceIdentity?: string | null; remoteSessionId?: string | null }): boolean {
  return !isRemoteBackedTab(e);
}

/** 原 ac：标签与（路径+可选 identity/远端会话）目标匹配。 */
export function workspaceTabMatchesTarget(
  e: { workspacePath?: string; workspaceIdentity?: string | null; remoteSessionId?: string | null },
  t: string,
  n?: WorkspaceTabPatch | null,
): boolean {
  return e.workspacePath === t
    ? n?.workspaceIdentity
      ? e.workspaceIdentity === n.workspaceIdentity
      : n?.remoteSessionId
        ? e.remoteSessionId === n.remoteSessionId
        : isLocalOnlyTab(e)
    : !1;
}

/** 原 Mse：设置标签固定 id。 */
export const SETTINGS_TAB_ID = `__settings__`;

/** 原 oc：kind === workspace。
 * 参型放宽为 { kind?: unknown; [key: string]: unknown }：bundle 各调用面均传标签对象（含
 * remoteServices.ts 的 WorkspaceTabLike 索引签名型）；运行期比较语义逐字。
 * 行注（A1-R2 宽化）：追加索引签名以避弱型检测（TS2559）——AutomationsMain 改指面
 * 以 { id: string; [key: string]: unknown } 流入，源侧索引签名不计入弱型重叠。 */
export function isWorkspaceKindTab(e: { kind?: unknown; [key: string]: unknown }): boolean {
  return e.kind === `workspace`;
}

/** 原 Nse：本地目录不可用标签。
 * 参型放宽为结构面 { kind?; availability? }：bundle 仅读 kind/availability，
 * 各消费面（含索引签名型标签）均可赋值；运行期比较语义逐字。 */
export function isUnavailableLocalDirectoryTab(e: { kind?: unknown; availability?: unknown }): boolean {
  return isWorkspaceKindTab(e) && e.availability === `unavailable-local-directory`;
}

/** 原 sc：标签列表中是否存在（指定路径/identity 的）不可用本地目录标签。
 * tabs 元素放宽为结构面（bundle 仅读 kind/availability/workspaceIdentity/workspacePath）。 */
export function hasUnavailableLocalDirectoryTab(
  e: { tabs: Array<{ kind?: unknown; availability?: unknown; workspaceIdentity?: string | null; workspacePath?: string }> },
  t: string,
  n?: string | null,
): boolean {
  let r = n?.trim() || t;
  return e.tabs.some((e) => isUnavailableLocalDirectoryTab(e) && (e.workspaceIdentity?.trim() || e.workspacePath) === r);
}

/** 原 Pse：kind === settings。
 * 参型放宽为结构面 { kind? }：bundle 仅读 kind；消费面含可空标签（调用侧先判空）。 */
export function isSettingsTab(e: { kind?: unknown }): boolean {
  return e.kind === `settings`;
}

/** 原 Fse：路径末段名（标签默认文案）。 */
export function workspacePathBaseName(e: string): string {
  let t = e.replace(/\\/g, `/`).split(`/`).filter(Boolean);
  return t[t.length - 1] ?? e;
}

/** 原 cc：新建工作区标签。 */
export function createWorkspaceTab(e: string, t?: WorkspaceTabPatch | null): WorkspaceTab {
  return {
    id: generateUuid(),
    kind: `workspace`,
    workspacePath: e,
    label: workspacePathBaseName(e),
    availability: t?.availability,
    remoteSessionId: t?.remoteSessionId,
    remoteTarget: t?.remoteTarget,
    workspaceIdentity: t?.workspaceIdentity,
    localWorkspacePath: t?.localWorkspacePath,
    workspacePurpose: t?.workspacePurpose,
  };
}

/** 原 lc：补丁合并（缺省保留原值）。 */
export function patchWorkspaceTab(e: WorkspaceTab, t?: WorkspaceTabPatch | null): WorkspaceTab {
  return {
    ...e,
    availability: t?.availability ?? e.availability,
    remoteSessionId: t?.remoteSessionId ?? e.remoteSessionId,
    remoteTarget: t?.remoteTarget ?? e.remoteTarget,
    remoteHistoryId: t?.remoteHistoryId ?? e.remoteHistoryId,
    workspaceIdentity: t?.workspaceIdentity ?? e.workspaceIdentity,
    localWorkspacePath: t?.localWorkspacePath ?? e.localWorkspacePath,
    workspacePurpose: t?.workspacePurpose ?? e.workspacePurpose,
  };
}

/** 原 Ise：恢复入参归一化（字符串 → { workspacePath }）。 */
export function normalizeRestorableTab(e: RestorableTabInput): { workspacePath: string } & WorkspaceTabPatch {
  return typeof e == `string` ? { workspacePath: e } : e;
}

/** 原 Lse：新建设置标签。 */
export function createSettingsTab(): WorkspaceTab {
  return { id: SETTINGS_TAB_ID, kind: `settings`, label: `settings` };
}

/** 原 Rse：数组元素搬移（不改原数组）。 */
export function moveTabByIndex(e: WorkspaceTab[], t: number, n: number): WorkspaceTab[] {
  let r = [...e],
    [i] = r.splice(t, 1);
  return (i && r.splice(n, 0, i), r);
}

/** 原 uc：集合添加（不变则返回原集合）。 */
export function setWithAdded(e: Set<string>, t: string): Set<string> {
  if (e.has(t)) return e;
  let n = new Set(e);
  return (n.add(t), n);
}

/** 原 zse：集合删除（不含则返回原集合）。 */
export function setWithRemoved(e: Set<string>, t: string): Set<string> {
  if (!e.has(t)) return e;
  let n = new Set(e);
  return (n.delete(t), n);
}

/* ============================================================================
 * C. 标签页 store 工厂 + Provider/钩子（原 4551–4893）
 * ==========================================================================*/

/** 原 dc：工作区标签页 store 工厂（e = 持久化用 Storage 覆盖，默认 localStorage）。 */
export function createWorkspaceTabStore(e: Storage | null | undefined = void 0) {
  return createStore<WorkspaceTabStoreState>((t, n) => ({
    tabs: [],
    activeTabId: null,
    activeWorkspacePath: null,
    activeWorkspaceIdentity: null,
    expandedWorkspacePaths: new Set<string>(),
    addTab: (r, i) => {
      let a = n().tabs.find((e) => isWorkspaceKindTab(e) && workspaceTabMatchesTarget(e, r, i));
      if (a)
        return (
          persistWorkspaceExpansion(a.workspacePath!, !0, e),
          t((e) => ({
            tabs: e.tabs.map((e) => (e.id !== a.id || !isWorkspaceKindTab(e) ? e : patchWorkspaceTab(e, i))),
            activeTabId: a.id,
            activeWorkspacePath: a.workspacePath!,
            activeWorkspaceIdentity: i?.workspaceIdentity ?? a.workspaceIdentity ?? null,
            expandedWorkspacePaths: setWithAdded(e.expandedWorkspacePaths, a.workspacePath!),
          })),
          a.id
        );
      let o = createWorkspaceTab(r, i);
      return (
        persistWorkspaceExpansion(r, !0, e),
        t((e) => ({
          tabs: [o, ...e.tabs],
          activeTabId: o.id,
          activeWorkspacePath: r,
          activeWorkspaceIdentity: o.workspaceIdentity ?? null,
          expandedWorkspacePaths: setWithAdded(e.expandedWorkspacePaths, r),
        })),
        o.id
      );
    },
    ensureWorkspaceTab: (r, i) => {
      let a = n().tabs.find((e) => isWorkspaceKindTab(e) && workspaceTabMatchesTarget(e, r, i));
      if (a)
        return (
          persistWorkspaceExpansion(a.workspacePath!, !0, e),
          t((e) => ({
            tabs: e.tabs.map((e) => (e.id !== a.id || !isWorkspaceKindTab(e) ? e : patchWorkspaceTab(e, i))),
            expandedWorkspacePaths: setWithAdded(e.expandedWorkspacePaths, a.workspacePath!),
          })),
          a.id
        );
      let o = createWorkspaceTab(r, i);
      return (
        persistWorkspaceExpansion(r, !0, e),
        t((e) => ({
          tabs: [o, ...e.tabs],
          expandedWorkspacePaths: setWithAdded(e.expandedWorkspacePaths, r),
        })),
        o.id
      );
    },
    closeTab: (r) => {
      let i = n(),
        { tabs: a, activeTabId: o } = i,
        s = a.findIndex((e) => e.id === r);
      if (s === -1) return;
      let c = a[s] ?? null,
        l = a.filter((e) => e.id !== r),
        u = o;
      o === r && (u = l.length === 0 ? null : l[Math.min(s, l.length - 1)].id);
      let d = l.find((e) => e.id === u),
        f =
          d && isWorkspaceKindTab(d)
            ? d.workspacePath!
            : c && isWorkspaceKindTab(c)
              ? (l.find(isWorkspaceKindTab)?.workspacePath ?? null)
              : i.activeWorkspacePath,
        p =
          d && isWorkspaceKindTab(d)
            ? (d.workspaceIdentity ?? null)
            : c && isWorkspaceKindTab(c)
              ? (l.find(isWorkspaceKindTab)?.workspaceIdentity ?? null)
              : i.activeWorkspaceIdentity,
        m = {
          tabs: l,
          activeTabId: u,
          activeWorkspacePath: f,
          activeWorkspaceIdentity: p,
          expandedWorkspacePaths: (() => {
            let e =
              c && isWorkspaceKindTab(c)
                ? setWithRemoved(i.expandedWorkspacePaths, c.workspacePath!)
                : i.expandedWorkspacePaths;
            return f ? setWithAdded(e, f) : e;
          })(),
        };
      (f && persistWorkspaceExpansion(f, !0, e), t(m));
    },
    activateTab: (r) => {
      let i = n(),
        a = i.tabs.find((e) => e.id === r);
      if (!a) return;
      let o = {
        activeTabId: r,
        activeWorkspacePath: isWorkspaceKindTab(a) ? a.workspacePath! : i.activeWorkspacePath,
        activeWorkspaceIdentity: isWorkspaceKindTab(a) ? (a.workspaceIdentity ?? null) : i.activeWorkspaceIdentity,
        expandedWorkspacePaths: isWorkspaceKindTab(a)
          ? setWithAdded(i.expandedWorkspacePaths, a.workspacePath!)
          : i.expandedWorkspacePaths,
      };
      (isWorkspaceKindTab(a) && persistWorkspaceExpansion(a.workspacePath!, !0, e), t(o));
    },
    reorderTabs: (e2, n2) => {
      t((t2) =>
        e2 < 0 || n2 < 0 || e2 >= t2.tabs.length || n2 >= t2.tabs.length || e2 === n2
          ? t2
          : { tabs: moveTabByIndex(t2.tabs, e2, n2) },
      );
    },
    reorderWorkspaceTabs: (e2, n2) => {
      t((t2) => {
        let r = t2.tabs.filter(isWorkspaceKindTab);
        if (e2 < 0 || n2 < 0 || e2 >= r.length || n2 >= r.length || e2 === n2) return t2;
        let i = moveTabByIndex(r, e2, n2),
          a = 0;
        return { tabs: t2.tabs.map((e) => (isWorkspaceKindTab(e) ? (i[a++] ?? e) : e)) };
      });
    },
    openSettingsTab: () => {
      let e2 = n().tabs.find(isSettingsTab);
      if (e2) {
        t({ activeTabId: e2.id });
        return;
      }
      let r = createSettingsTab();
      t((e) => ({ tabs: [...e.tabs, r], activeTabId: r.id }));
    },
    toggleWorkspaceExpanded: (n2) => {
      t((t2) => {
        let r = new Set(t2.expandedWorkspacePaths),
          i = !r.has(n2);
        return (r.has(n2) ? r.delete(n2) : r.add(n2), persistWorkspaceExpansion(n2, i, e), { expandedWorkspacePaths: r });
      });
    },
    expandAllWorkspaceTabs: (n2) => {
      t((t2) => {
        let r = new Set(t2.expandedWorkspacePaths);
        for (let t3 of n2) (r.add(t3), persistWorkspaceExpansion(t3, !0, e));
        return { expandedWorkspacePaths: r };
      });
    },
    collapseAllWorkspaceTabs: (n2) => {
      t((t2) => {
        let r = new Set(t2.expandedWorkspacePaths);
        for (let t3 of n2) (r.delete(t3), persistWorkspaceExpansion(t3, !1, e));
        return { expandedWorkspacePaths: r };
      });
    },
    activateTabByPath: (r, i) => {
      let a = n(),
        o = a.tabs.find((e) =>
          !isWorkspaceKindTab(e) || e.workspacePath !== r
            ? !1
            : i?.workspaceIdentity
              ? e.workspaceIdentity === i.workspaceIdentity
              : !0,
        );
      if (!o) return !1;
      let s = {
        activeTabId: o.id,
        activeWorkspacePath: r,
        activeWorkspaceIdentity: o.workspaceIdentity ?? null,
        expandedWorkspacePaths: setWithAdded(a.expandedWorkspacePaths, r),
      };
      return (persistWorkspaceExpansion(r, !0, e), t(s), !0);
    },
    restoreTabs: (n2, r) => {
      if (n2.length === 0) return;
      let i = n2.map((e) => {
          let t = normalizeRestorableTab(e);
          return createWorkspaceTab(t.workspacePath, {
            remoteSessionId: t.remoteSessionId,
            remoteTarget: t.remoteTarget,
            workspaceIdentity: t.workspaceIdentity,
            workspacePurpose: t.workspacePurpose,
            availability: t.availability,
          });
        }),
        a = i[Math.min(Math.max(r, 0), i.length - 1)];
      if (!a || !isWorkspaceKindTab(a)) return;
      let o = readWorkspaceExpansionMap(e);
      t({
        tabs: i,
        activeTabId: a.id,
        activeWorkspacePath: a.workspacePath!,
        activeWorkspaceIdentity: a.workspaceIdentity ?? null,
        expandedWorkspacePaths: expandedPathSet(
          i.map((e) => e.workspacePath!),
          o,
        ),
      });
    },
    completeTabRestore: (n2) => {
      n2.length !== 0 &&
        t((t2) => {
          let r = new Set<string>(),
            i = n2.map((e) => {
              let n = normalizeRestorableTab(e),
                i2 = {
                  remoteSessionId: n.remoteSessionId,
                  remoteTarget: n.remoteTarget,
                  workspaceIdentity: n.workspaceIdentity,
                  localWorkspacePath: n.localWorkspacePath,
                  workspacePurpose: n.workspacePurpose,
                  availability: n.availability,
                },
                a = t2.tabs.find((e) => isWorkspaceKindTab(e) && !r.has(e.id) && workspaceTabMatchesTarget(e, n.workspacePath, i2));
              return a ? (r.add(a.id), patchWorkspaceTab(a, i2)) : createWorkspaceTab(n.workspacePath, i2);
            }),
            a = t2.tabs.filter((e) => isWorkspaceKindTab(e) && !r.has(e.id)),
            o = t2.tabs.filter((e) => !isWorkspaceKindTab(e)),
            s = [...a, ...i, ...o],
            c = readWorkspaceExpansionMap(e);
          return {
            tabs: s,
            activeTabId: t2.activeTabId,
            activeWorkspacePath: t2.activeWorkspacePath,
            activeWorkspaceIdentity: t2.activeWorkspaceIdentity,
            expandedWorkspacePaths: expandedPathSet(
              s.filter(isWorkspaceKindTab).map((e) => e.workspacePath!),
              c,
            ),
          };
        });
    },
  }));
}

/** 原 fc：标签页 store 上下文。 */
export const WorkspaceTabStoreContext = React.createContext<ReturnType<typeof createWorkspaceTabStore> | null>(null);

/** 原 Bse：上下文外兜底 store（惰性单例）。 */
const fallbackWorkspaceTabStore = createWorkspaceTabStore(null);

/** 原 Vse：标签页 store Provider（E2E 桥挂卸 window.__zcodeTabStoreE2E）。 */
export function WorkspaceTabStoreProvider({ children: e }: { children?: React.ReactNode }) {
  let t = React.useRef<ReturnType<typeof createWorkspaceTabStore> | null>(null);
  return (
    (t.current ||= createWorkspaceTabStore()),
    React.useEffect(() => {
      if (!isE2EStoreBridgeEnabled() || !t.current) return;
      let e = t.current;
      return (
        (window.__zcodeTabStoreE2E = e),
        () => {
          window.__zcodeTabStoreE2E === e && delete window.__zcodeTabStoreE2E;
        }
      );
    }, []),
    <WorkspaceTabStoreContext.Provider value={t.current}>{e}</WorkspaceTabStoreContext.Provider>
  );
}

/** 原 pc：useTabStore —— 必须在 WorkspaceTabStoreProvider 内使用。 */
export function useWorkspaceTabStore<T>(e: (state: WorkspaceTabStoreState) => T): T {
  let t = React.useContext(WorkspaceTabStoreContext);
  if (!t) throw Error(`useTabStore 必须在 TabStoreProvider 内使用`);
  return useStore(t, e);
}

/** 原 mc：上下文外走兜底 store 的选择器钩子。 */
export function useWorkspaceTabStoreOptional<T>(e: (state: WorkspaceTabStoreState) => T): T {
  return useStore(React.useContext(WorkspaceTabStoreContext) ?? fallbackWorkspaceTabStore, e);
}

/** 原 hc：useTabStoreApi —— 取 store 四元 API（必须在 Provider 内）。 */
export function useWorkspaceTabStoreApi(): ReturnType<typeof createWorkspaceTabStore> {
  let e = React.useContext(WorkspaceTabStoreContext);
  if (!e) throw Error(`useTabStoreApi 必须在 TabStoreProvider 内使用`);
  return e;
}

/** 原 gc：标签的远端会话 id 解析（identity 优先，其次路径绑定）。 */
export function resolveTabRemoteSessionId(
  e: { workspacePath?: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; remoteTarget?: RemoteTarget },
  t: SessionRegistryState,
): string | undefined {
  let n = e.workspaceIdentity?.trim();
  let candidates: Array<string | null | undefined> = [
    e.remoteSessionId,
    n ? t.sessionIdByWorkspaceIdentity[n] : void 0,
    !n && e.remoteTarget ? t.sessionIdByWorkspacePath[e.workspacePath!] : void 0,
  ];
  // find 谓词 (!!e) 已排除 null/undefined；?? undefined 仅型别归一（运行时无差）
  return candidates.find((e) => !!(e && t.sessionsById[e])) ?? undefined;
}

/** 原 _c：标签是否具远控后端（identity/远端目标/已解析会话）。 */
export function tabHasRemoteBacking(
  e: { workspaceIdentity?: string | null; remoteTarget?: RemoteTarget },
  t: string | undefined,
): boolean {
  return !!(e.workspaceIdentity || e.remoteTarget || t);
}

/** 原 vc：单标签服务绑定解析（远控 → 会话服务；本地 → 上下文服务袋）。 */
export function resolveTabServicesBinding(
  e: { workspacePath?: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; remoteTarget?: RemoteTarget },
  t: BaseServices,
  n: SessionRegistryState,
): WorkspaceServicesBinding | null {
  let r = resolveTabRemoteSessionId(e, n),
    i = tabHasRemoteBacking(e, r);
  if (i) {
    let e = r ? n.sessionsById[r]?.services : void 0;
    return e ? { services: e, remoteSessionId: r, isRemoteWorkspace: i } : null;
  }
  return { services: t, isRemoteWorkspace: i };
}

/** 原 yc：批量工作区服务绑定映射（键 = resolveWorkspaceKey）。 */
export function buildWorkspaceServicesBindings(
  e: Array<{ workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; remoteTarget?: RemoteTarget }>,
  t: BaseServices,
  n: SessionRegistryState,
): Map<string, WorkspaceServicesBinding> {
  let r = new Map<string, WorkspaceServicesBinding>();
  for (let i of e) {
    let e = resolveTabServicesBinding(i, t, n);
    e && r.set(resolveWorkspaceKey(i.workspacePath, i.workspaceIdentity), e);
  }
  return r;
}

/** 原 Hse：工作区会话 id 综合解析（偏好会话 → 激活标签 → 注册表回退）。 */
export function resolveWorkspaceSessionId(e: {
  workspacePath: string;
  preferredRemoteSessionId?: string | null;
  workspaceIdentity?: string | null;
  remoteTarget?: RemoteTarget;
  activeTab?: WorkspaceTab | null;
  state: SessionRegistryState;
}): string | null {
  if (!e.workspacePath) return null;
  let t = e.workspaceIdentity?.trim() || void 0,
    n =
      e.activeTab &&
      (t
        ? e.activeTab.workspaceIdentity?.trim() === t
        : e.activeTab.workspacePath === e.workspacePath)
        ? e.activeTab
        : null,
    r = n?.workspaceIdentity?.trim() || void 0,
    i = [e.preferredRemoteSessionId, n?.remoteSessionId].find(
      (t) => !!(t && e.state.sessionsById[t]),
    );
  return (
    resolveTabRemoteSessionId(
      {
        workspacePath: e.workspacePath,
        workspaceIdentity: t ?? r,
        remoteSessionId: i,
        remoteTarget: n?.remoteTarget ?? e.remoteTarget,
      },
      e.state,
    ) ?? null
  );
}

/** 原 bc：工作区会话 id 解析钩子（激活标签 × 注册表双源）。 */
export function useResolvedWorkspaceSessionId(
  e: string,
  t: string | null | undefined,
  n: string | null | undefined,
  r?: RemoteTarget,
): string | null {
  let i = useWorkspaceTabStore((t2) => {
    if (!e || !t2.activeTabId) return null;
    let r2 = t2.tabs.find((e) => e.id === t2.activeTabId);
    return !r2 || !isWorkspaceKindTab(r2)
      ? null
      : n
        ? r2.workspaceIdentity?.trim() === n.trim()
          ? r2
          : null
        : r2.workspacePath === e
          ? r2
          : null;
  });
  return useSessionRegistryStore((a) =>
    resolveWorkspaceSessionId({
      workspacePath: e,
      preferredRemoteSessionId: t,
      workspaceIdentity: n,
      remoteTarget: r,
      activeTab: i,
      state: a,
    }),
  );
}

/* ============================================================================
 * E. git 自动刷新监听钩子（原 4996–5064）
 * ==========================================================================*/

/** 原 Jse：刷新去抖毫秒数。 */
export const GIT_AUTO_REFRESH_DEBOUNCE_MS = 6e4;

/** 原 Yse：监听 git 工作区文件变更并去抖触发刷新。 */
export function useGitAutoRefreshWatcher({
  workspacePath: e,
  workspaceIdentity: t,
  remoteSessionId: n,
  gitSummary: r,
  gitSummaryWorkspaceKey: i,
  enabled: a,
  onRefreshGit: o,
}: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  gitSummary: GitAutoRefreshSummary;
  gitSummaryWorkspaceKey?: string | null;
  enabled?: boolean;
  onRefreshGit: () => void;
}): void {
  let { fileWatcherService: s } = useWorkspaceServices(e, n, t) as { fileWatcherService: FileWatcherServiceLike },
    c = React.useRef(o),
    l = React.useRef<ReturnType<typeof setTimeout> | null>(null),
    u = isGitSummaryWorkspaceCurrent({ enabled: a, currentWorkspaceKey: t?.trim() || e, summaryWorkspaceKey: i }),
    d = React.useMemo(
      () => serializeWatchPaths(u ? collectGitWatchPaths(r) : []),
      [u, r.isGitAvailable, r.isRepository, r.repoRoot, r.workspacePath, r.autoRefreshWatchPaths],
    ),
    f = React.useMemo(() => parseWatchPaths(d), [d]);
  ((c.current = o),
    React.useEffect(() => {
      let t = !1,
        n: Array<{ subscription: { dispose(): void }; unwatch: () => Promise<void> }> = [],
        r = (t: string) => {
          (l.current && clearTimeout(l.current),
            (l.current = setTimeout(() => {
              ((l.current = null),
                logger.debug(`[GitAutoRefresh] Git 状态变更，刷新仓库状态`, {
                  workspacePath: e,
                  path: t,
                }),
                c.current());
            }, GIT_AUTO_REFRESH_DEBOUNCE_MS)));
        };
      for (let i of f)
        s.watch({ path: i.path, recursive: i.recursive })
          .then(({ id: e }) => {
            if (t) {
              s.unwatch({ id: e });
              return;
            }
            let i = s.onDynamicChange(e)((e) => {
              r(e.dirPath);
            });
            n.push({ subscription: i, unwatch: () => s.unwatch({ id: e }) });
          })
          .catch((n) => {
            t ||
              logger.warn(`[GitAutoRefresh] 监听 Git 工作区失败`, {
                workspacePath: e,
                path: i.path,
                recursive: i.recursive,
                error: n instanceof Error ? n.message : String(n),
              });
          });
      return () => {
        ((t = !0), (l.current &&= (clearTimeout(l.current), null)));
        for (let t of n)
          (t.subscription.dispose(),
            t.unwatch().catch((t) => {
              logger.warn(`[GitAutoRefresh] 停止监听 Git 工作区失败`, {
                workspacePath: e,
                error: t instanceof Error ? t.message : String(t),
              });
            }));
      };
    }, [s, f, e]));
}

/* ============================================================================
 * 尾部符号总表（原混淆名 → 语义名 → js 行，便于回代核验）
 * ==========================================================================*/
/*
 * Voe=isGitSummaryWorkspaceCurrent(3598) Hoe=normalizeWatchPath(3601)
 * Uoe=collectGitWatchPaths(3605) Woe=serializeWatchPaths(3616) Goe=parseWatchPaths(3619)
 * Ese=WORKSPACE_EXPANSION_STORAGE_KEY(4436) nc=safeLocalStorage(4437)
 * Dse=sanitizeBooleanRecord(4445) rc=readWorkspaceExpansionMap(4452)
 * Ose=writeWorkspaceExpansionMap(4461) ic=persistWorkspaceExpansion(4464)
 * kse=expandedPathSet(4468) Ase=isRemoteBackedTab(4471) jse=isLocalOnlyTab(4474)
 * ac=workspaceTabMatchesTarget(4477) Mse=SETTINGS_TAB_ID(4486) oc=isWorkspaceKindTab(4487)
 * Nse=isUnavailableLocalDirectoryTab(4490) sc=hasUnavailableLocalDirectoryTab(4493)
 * Pse=isSettingsTab(4497) Fse=workspacePathBaseName(4500) cc=createWorkspaceTab(4504)
 * lc=patchWorkspaceTab(4518) Ise=normalizeRestorableTab(4530) Lse=createSettingsTab(4533)
 * Rse=moveTabByIndex(4536) uc=setWithAdded(4541) zse=setWithRemoved(4546)
 * dc=createWorkspaceTabStore(4551) fc=WorkspaceTabStoreContext(4782)
 * Bse=fallbackWorkspaceTabStore(4783) Vse=WorkspaceTabStoreProvider(4784)
 * pc=useWorkspaceTabStore(4801) mc=useWorkspaceTabStoreOptional(4806)
 * hc=useWorkspaceTabStoreApi(4809) gc=resolveTabRemoteSessionId(4814)
 * _c=tabHasRemoteBacking(4822) vc=resolveTabServicesBinding(4825)
 * yc=buildWorkspaceServicesBindings(4834) Hse=resolveWorkspaceSessionId(4842)
 * bc=useResolvedWorkspaceSessionId(4868)
 * —— js 4893–4996（xc/Sc/Cc/Use/wc/Wse/Gse/Tc/Kse/Ec/qse/Dc/Oc）canonical =
 *    services/remoteServices.ts（双归属裁决，见头注）——
 * Jse=GIT_AUTO_REFRESH_DEBOUNCE_MS(4996) Yse=useGitAutoRefreshWatcher(4997)
 */
