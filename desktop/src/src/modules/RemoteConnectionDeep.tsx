/**
 * ============================================================================
 * RemoteConnectionDeep.tsx — 远程连接域深模块（A1-R5 新立；B5 逐字重建）
 * ============================================================================
 *
 * 来源文件（主口径，融合 chunk，213,979 行，只读）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 *
 * ----------------------------------------------------------------------------
 * 〇、属主裁决（自裁，头注说明——R5 任务项 1）
 * ----------------------------------------------------------------------------
 * 本文件为远程连接域深模块，与 SplitLayout 域解耦。R4 §5 曾评估 uEt/H2/U2 +
 * mEt 同批转录于此；A1-R5 侦查实测树内既有 canonical，裁决如下（不重复转录）：
 *
 *  1. mEt SSH 向导本体 + 隙段 a 全族（dEt/fEt/pEt/mEt/hEt…DEt，js 123513–123945）：
 *     canonical = components/remote/RemoteGapSegments.tsx（A0-S4-4c/B5-14，
 *     useRemoteWizardState 等 17 符号），RemoteWizard.tsx 经真实 import 消费。
 *  2. H2/U2（js 123510–123512，确认 store + 选择器钩）：canonical =
 *     components/modals/ConfirmDialog.tsx（live 路径：本地 ConfirmDialogStore +
 *     useConfirmDialog，经 modules/Modals.tsx:244 再导出，TopBar/OnboardingDialog/
 *     RemoteWizard 消费）；stores/confirmDialogStore.ts（A0-S4-3，经 stores-core
 *     再导出）为并行抽取。R4 §5「H2 为远程域专用确认机制」归属作废——bundle
 *     206864–206865 对话框呈现层直接消费 H2，实为全局 ConfirmDialogStore。
 *  3. uEt（js 123484–123496）：树内无 canonical（RemoteWizard.tsx 仅存 A0 近似
 *     declare useCancelRemoteConnection）→ 本文件 B5 逐字转录（见 §1）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（js 行 = 当前 out chunk 行）
 * ----------------------------------------------------------------------------
 *  [1] 远程连接取消钩（js 123484–123496）：
 *   uEt → useCancelPendingRemoteConnection  useServices 取
 *        cancelPendingRemoteConnection 之包装钩（logger 兜底）(123484)
 *
 * ----------------------------------------------------------------------------
 * 二、环安全（值闭包分析）
 * ----------------------------------------------------------------------------
 * 本文件值 import = react + ./logger（logger.tsx，基础域，不回指远程/远程向导域）；
 * usePlatformService 为本地 declare（原 l，imeComposition chunk M 导出；树内尚无
 * 跨文件 canonical，各消费文件按域 declare 挂接——RemoteWizard/RemoteGapSegments/
 * WebRemote 同例）。新增边仅 components/remote/RemoteWizard.tsx → 本文件；
 * 本文件不回指 components/*，无运行期环。
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单
 * ----------------------------------------------------------------------------
 *  1. react (Q)；2. logger (J，logger-PFDwl5Yq.js t 导出)；
 *  3. usePlatformService (l，declare 挂接：cancelPendingRemoteConnection 面)。
 * ==========================================================================*/

import * as React from "react";
import { t as logger } from "./logger"; // 原 J（logger chunk t 导出）

/* ============================================================================
 * 0. 契约声明
 * ==========================================================================*/

/** 原 l（imeComposition chunk M 导出）——本文件按 uEt 调用面取最小结构面。 */
interface RemoteConnectionPlatformService {
  cancelPendingRemoteConnection?(requestId?: string): Promise<void>;
}
declare function usePlatformService(): RemoteConnectionPlatformService;

/* ============================================================================
 * §1. 远程连接取消钩（uEt，js 123484–123496）
 * ----------------------------------------------------------------------------
 * 消费面：RemoteWizard.tsx fOt（RemoteWizardDialog，js 128131：`y = uEt()`，
 * 128369/128480 区 `y(M ?? void 0)` 取消进行中连接）；远程编排域
 * （js 209263–209809，useRemoteWorkspaceOrchestrator 族）亦为消费面，
 * 待其域重建时改指（R4 §8-2 登记）。
 * ==========================================================================*/

/** 原 uEt：取消进行中的远程连接（服务缺省则 no-op；失败仅 logger 兜底）。 */
export function useCancelPendingRemoteConnection() {
  let e = usePlatformService();
  return React.useCallback(
    async (t: string | undefined) => {
      try {
        await (e.cancelPendingRemoteConnection?.(t) ?? Promise.resolve());
      } catch (e) {
        logger.warn(`[SSHDialog] 取消进行中的远程连接失败:`, e);
      }
    },
    [e],
  );
}

/* ============================================================================
 * 尾部符号总表（原混淆名 → 语义名 → js 行，便于回代核验）
 * ==========================================================================*/
/*
 * [1] uEt=useCancelPendingRemoteConnection(123484)
 * —— 邻接不录（canonical 在他域，见头注〇）：H2=ConfirmDialogStore(123497)、
 *    U2=useConfirmDialog(123510) → components/modals/ConfirmDialog.tsx；
 *    dEt/fEt/pEt/mEt + 隙段 a 族(123513–123945) → components/remote/RemoteGapSegments.tsx。 ——
 */
