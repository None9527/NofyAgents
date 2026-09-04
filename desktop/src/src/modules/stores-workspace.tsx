/* eslint-disable */
/**
 * ============================================================================
 * stores-workspace.tsx — ZCode 3.7.6 横切层 zustand stores · 工作区域（D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，本机 213,979 行，未改动；旧账 213,695 行拷贝已不在本机，两版行号不同，本文件引证 vintage 逐条混杂、用前须以本机束重定〔A1-R163〕）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 行号口径：融合 chunk js 行；模块地图见同目录 MODULE-MAP.md §2.1。
 * 本文件含 6 个 store：
 *
 *  # | 混淆名 | 语义名              | js 行          | 归属族
 *  --|--------|----------------------|----------------|--------
 *  5 | Ug     | McpStore             | 25007–25973    | F06
 *  7 | UB     | SkillContextStore    | 63592–63845    | F08
 *  9 | FH     | CodeCommentsStore    | 68514–68579    | F14
 * 17 | F6     | CommandsStore        | 142754–142984  | F06
 * 18 | B6     | PluginsStore         | 142985–143100  | F06
 * 19 | Z0t    | HooksStore           | 201244–201421  | F06
 *
 * ----------------------------------------------------------------------------
 * 持久化键
 * ----------------------------------------------------------------------------
 *  McpStore: zcode-mcp-deleted-preload（zg，24788；被预载 MCP 的删除名单）；
 *            服务器配置经 mcpSyncService（Lg/Rg 助手）落盘到各来源配置文件
 *  Commands/Plugins/Hooks/SkillContext/CodeComments: 无（配置在宿主文件系统，经服务读写）
 *
 * selectors 使用方（抽样）：
 *  Ug：15 处 —— 194658–194676（设置 MCP 分区）、25350 S_e 接线钩子等
 *  F6：13 处 —— 200506–200513（设置 commands 分区）等
 *  B6：37 处 —— 194660、199959、200014–200018（设置 plugins 分区/市场）等
 *  Z0t：1 处 —— 202037（设置 hooks 分区）
 *  UB：4 处 —— 63660–63663（WB useSkillContext 钩子）
 *  FH：3 处 —— 161208–161210（代码查看器行级评论）
 *
 * 〔A0-S4-3：6 个 store 实体已逐字迁 ../stores/（mcpStore/skillContextStore/
 *   codeCommentsStore/commandsStore/pluginsStore/hooksStore）；§0 zustand
 *   接口类型收敛 ../stores/storeTypes.ts；本文件为薄 re-export shim，导出面不变〕
 * ============================================================================
 */

/* 原 §0 zustand 接口类型已收敛 ../stores/storeTypes.ts（四份同形副本之一）。 */
export type { UseBoundStore } from '../stores/storeTypes';

import { loadSkillContext } from './Composer'; // 原 HB（js 63581；A0-CLEANUP2 item 13 接线：declare → Composer 属主导出）
import { t as logger } from './logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { buildNewHook, hookLocationForScope, hooksWorkspaceKey, isHookEditable, mergeHookPatch, reloadHooks, saveHooksList } from './StoresDeep';
import { isRemoteDisconnectedError } from './services';
import { create as createStore, resolveWorkspaceKey as workspaceKey } from './SkillStore'; // 原 Ae | 原 Io
import { resolveDefaultAgentCliProvider as normalizeProvider } from './SrcSharedA'; // 原 ni
import type { HookDescriptor, HooksService } from './StoresDeep';
export type { HookDescriptor, HooksService };
/* A0-CLEANUP2 item 13：原 HB declare 已接线 → import { loadSkillContext } from './Composer'（属主已导出，js 63581） */
/** 原 Sc：是否远端工作区断开错误 */

/* ─────────────────────────── A0-S4-3 shim ───────────────────────────
 * 6 个 store 实体已原样迁入 ../stores/（见上方头块注记）；本文件保留
 * B5 头块与导出面，全部导入方零改动。
 * ──────────────────────────────────────────────────────────────────── */

import { setMcpSyncServiceHandle, setSessionMcpSyncService, useMcpStore } from '../stores/mcpStore';
import type { McpSource, McpScope, McpServerStatus, McpServerConfig, NativeMcpServer, DerivedMcpServer, McpConfig, McpSyncService, McpState } from '../stores/mcpStore';
import { skillContextKey, useSkillContextStore } from '../stores/skillContextStore';
import type { SkillDescriptor, SkillContextEntry, SkillsService, SkillContextState } from '../stores/skillContextStore';
import { useCodeCommentsStore } from '../stores/codeCommentsStore';
import type { CodeComment, CodeCommentsState } from '../stores/codeCommentsStore';
import { useCommandsStore, mergeSlashCommands } from '../stores/commandsStore';
import type { CommandDescriptor, SubagentsService, CommandsService, CommandsState } from '../stores/commandsStore';
import { usePluginsStore } from '../stores/pluginsStore';
import type { PluginDescriptor, PluginMarketplace, PluginDiagnostic, PluginService, PluginsState } from '../stores/pluginsStore';
import { HOOK_EVENTS, useHooksStore } from '../stores/hooksStore';
import type { HooksState } from '../stores/hooksStore';

export { setMcpSyncServiceHandle, setSessionMcpSyncService, useMcpStore };
export type { McpSource, McpScope, McpServerStatus, McpServerConfig, NativeMcpServer, DerivedMcpServer, McpConfig, McpSyncService, McpState };

export { skillContextKey, useSkillContextStore };
export type { SkillDescriptor, SkillContextEntry, SkillsService, SkillContextState };

export { useCodeCommentsStore };
export type { CodeComment, CodeCommentsState };

export { useCommandsStore, mergeSlashCommands };
export type { CommandDescriptor, SubagentsService, CommandsService, CommandsState };

export { usePluginsStore };
export type { PluginDescriptor, PluginMarketplace, PluginDiagnostic, PluginService, PluginsState };

export { HOOK_EVENTS, useHooksStore };
export type { HooksState };
