// A0-S4-4c: 自 modules/RemoteWizard.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/remote/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * RemoteWizard.tsx — F10 RemoteFamily 远程向导逐字重建（B5-05 批次 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（主口径，融合 chunk，213,979 行，D5b 点状改写后现状，只读）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，仅用于 JSX 结构对照）：
 *   desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 行号口径：注释中 js 行号 = **当前 out chunk 行号**（锚点回代以此为准）；
 *           「原 N」= D5b 前原始行号（MODULE-MAP/COVERAGE-LEDGER 口径），本段偏移 +17。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（js 行 = 当前 out / jsx 行 = pretty 版）
 * ----------------------------------------------------------------------------
 *  [步骤指示]（js 127943–128055 / jsx 107954–107992）：
 *   i4   → REMOTE_WIZARD_STEPS  [kind,settings,connecting,directory] (127943 / 107954)
 *   lOt  → wizardStepIndex      (127949 / 107967)
 *   uOt  → RemoteWizardStepIndicator  移动横滚 nav + 桌面 aside 双形态 (127952 / 107970)
 *  [向导头]（js 128058–128108 / jsx 107993–108011）：
 *   dOt  → RemoteWizardHeader   标题/描述 + 最小化(bv minus)/关闭(g x) (128058 / 107993)
 *  [根] 四型设置表单（js 124284–125011 / jsx 105903–106205）：
 *   REt  → RemoteSettingsForm   ssh/server/wsl/docker 四 case 分步表单
 *  [根] 向导壳对话框（js 128110–128541 / jsx 108012–108384）：
 *   fOt  → RemoteWizardDialog   触发器 + Dialog 壳 + 四步分派（最小化/关闭语义内嵌）
 *   pOt  → RemoteWizardDialogAlias  `var pOt = fOt`（Home.tsx 接口引用名）(128542 / 108385)
 *
 * ----------------------------------------------------------------------------
 * 二、边界裁决（只记录，不改动它批产物）
 * ----------------------------------------------------------------------------
 *  1. 已抽取（Modals.tsx，只注记不重复）：MEt 目录浏览（原 123942–124126）+
 *     OEt/kEt/AEt/jEt（原 123929–123945 区）；r4 分派 + ZEt/lDt/XDt 三同步对话框 +
 *     $Dt + preflight 助手（原 124995–127332，含 $2 canOpenRemoteSessionSourceCheck
 *     原 127125——TopBar.report 亦登记，裁决归 Modals）；ZTt/QTt（原 123239/123251，
 *     登记于 TopBar.report）。128795+ 更新窗属 F09/TopBar。
 *  2. **账实差异注记**：COVERAGE-LEDGER 将原 123942–124266 记为「MEt 已抽取」，实测
 *     Modals.tsx 仅含 123929–124126；子段 NEt/PEt/W2/G2/FEt/K2/IEt/LEt（当前
 *     124144–124283）实际未抽取。本文件对 W2（SuggestionInput）等以接口级登记，
 *     待整合期补抽或归并本族（不改动 Modals.tsx）。
 *  3. **未分配隙段**（接口级登记，建议后续批）：
 *     a) 原 123518–123928：fEt/pEt/mEt 向导状态钩 + hEt…bEt 连接日志族 + xEt 步文案 +
 *        SEt 校验/目标构建 + CEt/wEt/TEt/EEt/DEt 流助手；
 *     b) 原 127340–127925：rOt 连接日志步 / oOt 类型步 / sOt 设置步壳 / cOt 目录步（含三同步卡）。
 *     fOt 渲染的四个步骤组件即 b) 隙段，本文件以 declare 挂接。
 *  4. mOt…bOt（原 128526–128567，家目录感知显示名/工作区菜单过滤）已随 Home.tsx 抽取，
 *     本文件不重复；Home.tsx 1192 行 `pOt = fOt` 接口级登记，整合期指向本实现。
 *  5. i18n：`remote/ssh/server/wsl/docker.*` 键全部保留原键名；隙段 a) 的 xEt 亦消费
 *     `remote.*StepTitle/Description` 键（declare 注释留痕）。
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单（跨 chunk / 它批已还原者，此处声明接口）
 * ----------------------------------------------------------------------------
 *  1. react (Q) / jsx-runtime ($)；2. cn (Z)；3. Button (X)；4. Input (P，imeComposition y)；
 *  5. useIntlContext (G)；6. logger (J)；7. useConfirmDialog (U2，Modals.tsx)；
 *  8. usePlatformService (l，selectFile 面)；9. useBaseServices (Ec，本 chunk 4897)；
 *  10. 会话 store (Zs，stores-session)；11. Dialog 原语族 (zb/Hb/Ub/Gb/Kb)；
 *  12. Popover 原语族 (T/h/x/O)；13. Command/cmdk 原语族 (Yb/Zb/Xb/Qb/$b/ex)；
 *  14. Select 原语族 (iO/oO/aO/sO/cO)；15. 图标（lucide vendored 块）。
 * ============================================================================
 */

import * as React from "react";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../../modules/ImeComposition'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '../../modules/QuickPick'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { CommandInput } from '../ui/command'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../modules/Settings'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Button, createLucideIcon } from '../../modules/button'; // A0-CLEANUP 族清理：Button/createLucideIcon declare 改指 button chunk
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：Dialog 族 declare → components/ui/dialog（bundle zb/Hb/Ub/Gb/Kb）
/* ── A0-S2d 接线（B5-14）：隙段 declare 组改指 RemoteGapSegments 实体；混淆名注释随迁 ── */
import {
  useRemoteWizardState, // 原 mEt（隙段 a，原 123535–123746）：远程向导状态总钩（表单字段 + 运行时选项 + setters）
  useRemoteConnectionLogs, // 原 bEt（隙段 a，原 123789–123837）：连接日志钩（订阅 onRemoteConnectionLog + 进度行去重）
  resolveWizardStepCopy, // 原 xEt（隙段 a，原 123838–123867）：步文案（remote.kindStepTitle / settingsStepDescription{method} / connectingStep* / selectDirectory*）
  validateAndBuildRemoteTarget, // 原 SEt（隙段 a，原 123868–123928）：按 kind 校验并构建目标（ssh.validation.* / docker.validation.required / wsl.validation.invalidUser / server.validation.*）
  attachSelectedResourcePackages, // 原 CEt（隙段 a，原 123929）：ssh 目标附加 resourcePackages（vne 选中包 id）
  isWizardFlowActive, // 原 wEt（隙段 a，原 123932）：流活动（loading 或已连）
  isWizardFlowIdle, // 原 TEt（隙段 a，原 123935）
  wizardResultToOpenState, // 原 EEt（隙段 a，原 123938）：连接结果 → {open:!0, step: success?directory:connecting}
  resolveDirectorySelectFallback, // 原 DEt（隙段 a，原 123941）：目录选择失败回退（sessionStillRegistered?directory:settings）
  RemoteKindStep, // 原 oOt（127539）：类型步
  RemoteSettingsStep, // 原 sOt（127616）：设置步壳（内嵌 REt + 返回/连接脚部）
  RemoteConnectingStep, // 原 rOt（127357）：连接日志步
  RemoteDirectoryStep // 原 cOt（127782）：目录步（内嵌 MEt embedded + 三同步卡）
} from '../../modules/RemoteGapSegments';
import { isValidWslUser as isValidWslUsername } from '../../modules/SrcSharedA'; // 原 lee（src chunk Cc 4299）：WSL 用户名合法性（1–64、无冒号、非保留名）
import { generateUuid as generateRequestId } from '../../modules/SrcSharedB'; // 原 xi（src chunk cx）：请求 id（crypto.randomUUID 回退链）
import { extractErrorMessage as toErrorMessage } from '../../modules/FeedbackCenter'; // 原 MC（本 chunk 37651，横切错误文本）
import { useSessionRegistryStore as useSessionStore } from '../../modules/stores-core'; // 原 Zs：会话 store（sessionsById 选择器 + getState）
import { useBaseServices } from '../../modules/services'; // 原 Ec（本 chunk 4897）：基础服务（skillSync/mcpSync/pluginSync/zcodeAgent）
import { t as logger } from '../../modules/logger';
import { useConfirmDialog } from '../../modules/Modals'; // 原 U2（Modals.tsx useConfirmDialog，js 123510）
import { Input } from '../../modules/ImeComposition'; // 原 P（imeComposition y 导出）

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

declare function cn(...inputs: Array<string | false | null | undefined>): string;
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };
/* ── tombstone（A0-S2d）：logger declare 删除 → canonical 在 logger.tsx（t 导出）；
 *    P Input declare 删除 → canonical 在 ImeComposition.tsx（y 导出）；
 *    U2 useConfirmDialog declare 删除 → canonical 在 Modals.tsx（已导出），
 *    均经文件头真实 import 消费。 ── */

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "default" | "ghost" | "outline" | "destructive" | "link" | string;
  size?: "default" | "sm" | "lg" | "xs" | "icon-sm" | "icon-lg" | string;
}
/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */
/** 原 l（imeComposition M 导出） */
interface PlatformServiceLike {
  selectFile?(): Promise<string | null>;
}
declare function usePlatformService(): PlatformServiceLike;

/* ---- Dialog 原语族（原 zb/Hb/Ub/Gb/Kb） ---- */
/* ── tombstone（A0-S3c）：Dialog 族 declare 删除 → import from '../components/ui/dialog'；调用面逐字不变。 ── */

/* ---- Popover 原语族（原 T/h/x/O，imeComposition n/a/i 等） ---- */
/* ── tombstone（A0-S3c）：Command、CommandEmpty、CommandGroup、CommandInput、CommandItem、CommandList、Popover、PopoverAnchor、PopoverContent、PopoverTrigger、Select、SelectContent、SelectItem、SelectTrigger、SelectValue declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */




/* ---- Command/cmdk 原语族（原 Yb/Zb/Xb/Qb/$b/ex） ---- */







/* ---- Select 原语族（原 iO/oO/aO/sO/cO） ---- */






/* ---- 图标（lucide 名逐字取自 Sa(`name`) 工厂） ---- */
interface IconProps { className?: string; "aria-hidden"?: boolean | "true" | "false" }
/* ── tombstone（A0-CLEANUP 族清理）：createLucideIcon declare 删除 → import from './button'。 ── */
const IconChevronDown = createLucideIcon("chevron-down", []);   // 原 N_（26850）
const IconCheck = createLucideIcon("check", []);                // 原 M_（26849）
const IconLoader = createLucideIcon("loader", []);              // 原 fv（27363）
const IconPlus = createLucideIcon("plus", []);                  // 原 kv（27654）
const IconMinus = createLucideIcon("minus", []);                // 原 bv（27490）
const IconTriangleAlert = createLucideIcon("triangle-alert", []); // 原 N（imeComposition x 导出）
/** 关闭图标（原 g，button chunk） */
declare const IconX: React.FC<{ className?: string }>;

/* ---- testid（src-HCld2afU.js；链：styles 别名 ← src 导出 ← 内部常量） ---- */
const TESTID_SSH_CONFIG_ALIAS_SELECT = "ssh-config-alias-select"; // 原 tre ← vi ← c_
const TESTID_SSH_HOST_INPUT = "ssh-host-input";                   // 原 br ← Si ← a_
const TESTID_SSH_PORT_INPUT = "ssh-port-input";                   // 原 ore ← wi ← o_
const TESTID_SSH_USERNAME_INPUT = "ssh-username-input";           // 原 xt ← Di ← s_
const TESTID_SSH_AUTH_PASSWORD = "ssh-auth-password";             // 原 pte ← gi ← d_
const TESTID_SSH_AUTH_PRIVATE_KEY = "ssh-auth-private-key";       // 原 Dee ← _i ← f_
const TESTID_SSH_PASSWORD_INPUT = "ssh-password-input";           // 原 mt ← Ci ← l_
const TESTID_SSH_PRIVATE_KEY_INPUT = "ssh-private-key-input";     // 原 Dr ← Ti ← u_
const TESTID_SERVER_URL_INPUT = "server-url-input";               // 原 Cee ← Zr ← __
const TESTID_SERVER_NAME_INPUT = "server-name-input";             // 原 gee ← Yr ← v_
const TESTID_SERVER_TOKEN_INPUT = "server-token-input";           // 原 uee ← Xr ← y_
const TESTID_SERVER_WORKSPACE_PATH_INPUT = "server-workspace-path-input"; // 原 lr ← Qr ← b_
const TESTID_WSL_DISTRO_SELECT = "wsl-distro-select";             // 原 ln ← Ja ← p_
const TESTID_WSL_USER_INPUT = "wsl-user-input";                   // 原 fee ← Ya ← m_
const TESTID_DOCKER_CONTAINER_SELECT = "docker-container-select"; // 原 Une ← tr ← h_
const TESTID_DOCKER_CONTAINER_INPUT = "docker-container-input";   // 原 ate ← er ← g_
const TESTID_SSH_CONNECT_TRIGGER = "ssh-connect-trigger";         // 原 mre ← yi ← $g
const TESTID_SSH_DIALOG = "ssh-dialog";                           // 原 zee ← bi ← e_
const TESTID_SSH_ERROR = "ssh-error";                             // 原 Ni ← xi ← Kv
const TESTID_SSH_SUCCESS = "ssh-success";                         // 原 kt ← Ei ← qv

/* ============================================================================
 * 隙段接口级登记（未分配行段，见头注二.3；fOt/REt 依赖面）
 * ==========================================================================*/

type RemoteKind = "ssh" | "server" | "wsl" | "docker";
type WizardStep = "kind" | "settings" | "connecting" | "directory";
interface SshConfigAlias {
  alias: string;
  host?: string | null;
  port?: number | null;
  username?: string | null;
}
interface DockerContainerRef {
  id: string;
  name: string;
}
interface WslDistroRef {
  name: string;
}
export interface RemoteTarget {
  kind: RemoteKind;
  host?: string;
  port?: number;
  username?: string;
  sshConfigAlias?: string;
  assetInstallMode?: string;
  password?: string;
  privateKeyPath?: string;
  privateKeyPassphrase?: string;
  container?: string;
  distro?: string;
  user?: string;
  url?: string;
  name?: string;
  token?: string;
  workspacePath?: string;
  resourcePackages?: { selectedPackageIds: string[] };
}
export interface RemoteWorkspaceSessionLike {
  target?: RemoteTarget | null;
  services?: unknown;
}

/* ── tombstone（A0-S2d）：mEt/bEt/xEt/SEt/CEt/wEt/TEt/EEt/DEt 九钩与
 *    rOt/oOt/sOt/cOt 四步骤组件的 declare 挂接已删除，canonical 实体在
 *    RemoteGapSegments.tsx（§3.2/§3.3 实体化），经文件头真实 import 消费。
 *    xi→SrcSharedB generateUuid | MC→FeedbackCenter extractErrorMessage |
 *    lee→SrcSharedA isValidWslUser | Zs→stores-core useSessionRegistryStore |
 *    Ec→services useBaseServices。 ── */
/** 原 uEt（F09 段 123484 区，未抽取）：取消在途连接钩 */
declare function useCancelRemoteConnection(): (requestId?: string) => Promise<void> | void;

/** A0-S2d 类型垫片：目录步 props 面自 RGS 实体推导（原 declare 为 Record<string, unknown> 接口） */
type RemoteDirectoryStepPropsLike = React.ComponentProps<typeof RemoteDirectoryStep>;

/** 原 W2（账实差异段，当前 124152–124259；SuggestionInput：Popover+cmdk 历史建议输入）
 *  辅助：NEt（124144，interactOutside 判定透传）/ PEt（124147，建议过滤 includes） */
declare const SuggestionInput: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> & {
    containerClassName?: string;
    suggestionWidth?: string;
    label?: string;
    value: string;
    suggestions: string[];
    emptyText?: string;
    onChange: (v: string) => void;
  }
>;

/* ============================================================================
 * 1. 步骤指示（原 i4/lOt/uOt，js 127943–128055 / jsx 107954–107992）
 * ==========================================================================*/

/** 原 i4（127943） */
const REMOTE_WIZARD_STEPS: Array<{ key: WizardStep; titleId: string }> = [
  { key: `kind`, titleId: `remote.step.kind` },
  { key: `settings`, titleId: `remote.step.settings` },
  { key: `connecting`, titleId: `remote.step.connecting` },
  { key: `directory`, titleId: `remote.step.directory` },
];
/** 原 lOt（127949） */
function wizardStepIndex(e: WizardStep): number {
  return REMOTE_WIZARD_STEPS.findIndex((t) => t.key === e);
}
/** 原 uOt（127952）：移动横滚 nav（md:hidden）+ 桌面 aside（hidden md:flex）双形态 */
export function RemoteWizardStepIndicator({ currentStep: e }: { currentStep: WizardStep }) {
  const { intl: t } = useIntlContext();
  const n = wizardStepIndex(e);
  return (
    <>
      <nav className={`md:hidden`}>
        <div className={`flex min-w-0 gap-2 overflow-x-auto rounded-xl border border-border bg-surface p-2`}>
          {REMOTE_WIZARD_STEPS.map((r, i) => {
            const a = e === r.key;
            const o = i < n;
            return (
              <div
                key={r.key}
                aria-current={a ? `step` : void 0}
                className={cn(
                  `flex min-w-28 shrink-0 items-center gap-2 rounded-lg px-2 py-2`,
                  a ? `bg-card text-foreground` : o ? `bg-background-alt text-foreground` : `text-foreground-subtle`,
                )}
              >
                <div
                  className={cn(
                    `flex size-5 shrink-0 items-center justify-center rounded-full border text-ui-base font-mono font-semibold`,
                    a
                      ? `bg-primary text-primary-foreground`
                      : o
                        ? `border-success bg-success text-success-foreground`
                        : `border-border bg-background text-foreground-subtle`,
                  )}
                >
                  {o ? <IconCheck className={`size-3.5`} /> : i + 1}
                </div>
                <span className={`truncate text-ui-base font-medium`}>{t.formatMessage({ id: r.titleId })}</span>
              </div>
            );
          })}
        </div>
      </nav>
      <aside className={`hidden w-56 shrink-0 flex-col gap-2 p-1 md:flex`}>
        <div className={`rounded-xl border border-border bg-surface flex flex-col gap-4 p-4 h-full`}>
          <h3 className={`text-ui-base font-medium tracking-wide text-foreground-subtle uppercase`}>
            {t.formatMessage({ id: `remote.wizard` })}
          </h3>
          <div className={`space-y-2`}>
            {REMOTE_WIZARD_STEPS.map((r, i) => {
              const a = e === r.key;
                const o = i < n;
              return (
                <div
                  key={r.key}
                  className={cn(
                    `flex items-center gap-3 rounded-xl border-0 px-3 py-3 transition-colors`,
                    a ? `border-border-hover bg-card` : o ? `border-transparent bg-background-alt` : `border-transparent bg-transparent`,
                  )}
                >
                  <div
                    className={cn(
                      `flex size-6 shrink-0 items-center justify-center rounded-full border text-ui-base font-mono font-semibold`,
                      a
                        ? `bg-primary text-primary-foreground`
                        : o
                          ? `border-success bg-success text-success-foreground`
                          : `border-border bg-background text-foreground-subtle`,
                    )}
                  >
                    {o ? <IconCheck className={`size-4`} /> : i + 1}
                  </div>
                  <div className={`min-w-0`}>
                    <p className={cn(`text-ui-base font-medium`, a || o ? `text-foreground` : `text-foreground-subtle`)}>
                      {t.formatMessage({ id: r.titleId })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ============================================================================
 * 2. 向导头（原 dOt，js 128058–128108 / jsx 107993–108011；最小化/关闭按钮）
 * ==========================================================================*/

export function RemoteWizardHeader({
  title: e,
  description: t,
  onMinimize: n,
  onClose: r,
}: {
  title: string;
  description: string;
  onMinimize?: () => void;
  onClose?: () => void;
}) {
  const { intl: i } = useIntlContext();
  return (
    <div className={`space-y-2`}>
      <div className={`flex items-start justify-between gap-4`}>
        <DialogTitle className={`text-lg font-medium`}>{e}</DialogTitle>
        <div className={`flex shrink-0 items-center gap-1`}>
          {n ? (
            <Button type="button" variant="ghost" size="icon-sm" className={`shrink-0`} onClick={n}>
              <IconMinus className={`size-4`} />
              <span className={`sr-only`}>{i.formatMessage({ id: `remote.minimize` })}</span>
            </Button>
          ) : null}
          {r ? (
            <Button type="button" variant="ghost" size="icon-sm" className={`shrink-0`} onClick={r}>
              <IconX className={`size-4`} />
              <span className={`sr-only`}>{i.formatMessage({ id: `common.close` })}</span>
            </Button>
          ) : null}
        </div>
      </div>
      <DialogDescription>{t}</DialogDescription>
    </div>
  );
}

/* ============================================================================
 * 3. RemoteSettingsForm（原 REt，js 124284–125011 / jsx 105903–106205）
 *    四型（ssh/server/wsl/docker）设置表单；类名/i18n/分支逐字。
 * ==========================================================================*/

export function RemoteSettingsForm({
  kind: e,
  host: t,
  port: n,
  username: r,
  sshAuthMethod: i,
  assetInstallMode: a,
  password: o,
  privateKeyPath: s,
  privateKeyPassphrase: c,
  wslDistro: u,
  wslUser: d = ``,
  wslDistros: f,
  dockerContainer: p,
  manualDockerContainer: m,
  serverUrl: g,
  serverName: _,
  serverToken: v,
  serverWorkspacePath: y,
  dockerContainers: b,
  dockerAvailable: S,
  sshConfigAliases: C,
  sshConfigAliasesLoading: w,
  sshConfigAliasesError: E,
  selectedSshConfigAlias: D,
  runtimeOptionsLoading: O,
  remoteWorkspaceSessions: k = [],
  refreshDockerContainers: A,
  applySshConfigAlias: j,
  clearSelectedSshConfigAlias: M,
  setHost: F,
  setPort: I,
  setUsername: L,
  setSshAuthMethod: R,
  setAssetInstallMode: z,
  setPassword: B,
  setPrivateKeyPath: V,
  setPrivateKeyPassphrase: H,
  setWslDistro: ee,
  setWslUser: U,
  setDockerContainer: te,
  setManualDockerContainer: ne,
  setServerUrl: re,
  setServerName: ie,
  setServerToken: ae,
  setServerWorkspacePath: oe,
}: {
  kind: RemoteKind;
  host: string;
  port: string;
  username: string;
  sshAuthMethod: "password" | "privateKey";
  assetInstallMode: string;
  password: string;
  privateKeyPath: string;
  privateKeyPassphrase: string;
  wslDistro: string;
  wslUser?: string;
  wslDistros: WslDistroRef[];
  dockerContainer: string;
  manualDockerContainer: string;
  serverUrl: string;
  serverName: string;
  serverToken: string;
  serverWorkspacePath: string;
  dockerContainers: DockerContainerRef[];
  dockerAvailable?: boolean;
  sshConfigAliases: SshConfigAlias[];
  sshConfigAliasesLoading: boolean;
  sshConfigAliasesError: string;
  selectedSshConfigAlias: string | null;
  runtimeOptionsLoading: boolean;
  remoteWorkspaceSessions?: RemoteWorkspaceSessionLike[];
  refreshDockerContainers?: () => void;
  applySshConfigAlias: (alias: SshConfigAlias) => void;
  clearSelectedSshConfigAlias: () => void;
  setHost: (v: string) => void;
  setPort: (v: string) => void;
  setUsername: (v: string) => void;
  setSshAuthMethod: (v: "password" | "privateKey") => void;
  setAssetInstallMode: (v: string) => void;
  setPassword: (v: string) => void;
  setPrivateKeyPath: (v: string) => void;
  setPrivateKeyPassphrase: (v: string) => void;
  setWslDistro: (v: string) => void;
  setWslUser?: (v: string) => void;
  setDockerContainer: (v: string) => void;
  setManualDockerContainer: (v: string) => void;
  setServerUrl: (v: string) => void;
  setServerName: (v: string) => void;
  setServerToken: (v: string) => void;
  setServerWorkspacePath: (v: string) => void;
}) {
  const { intl: se } = useIntlContext();
  const ce = usePlatformService();
  const [le, ue] = React.useState(false);
  const [de, fe] = React.useState(false);
  const W = React.useRef<HTMLDivElement | null>(null);
  const pe = buildSshHistorySuggestions(k);
  const me = D == null ? null : (C.find((e) => e.alias === D) ?? null);
  const he = w
    ? se.formatMessage({ id: `common.loading` })
    : (me?.alias ??
      (C.length === 0
        ? se.formatMessage({ id: `ssh.configAliasEmpty` })
        : se.formatMessage({ id: `ssh.configAliasPlaceholder` })));
  const ge = React.useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const t = e.currentTarget;
    t.scrollHeight <= t.clientHeight || ((t.scrollTop += e.deltaY), e.preventDefault(), e.stopPropagation());
  }, []);
  const _e =
    S === false
      ? se.formatMessage({ id: `docker.unavailable` })
      : se.formatMessage({ id: `docker.noContainers` });
  const ve =
    p.trim() ||
    (O
      ? se.formatMessage({ id: `docker.loading` })
      : b.length === 0
        ? _e
        : se.formatMessage({ id: `docker.selectContainer` }));
  const ye = !p.trim() && b.length === 0;
  const be = m.trim().length === 0;
  const xe = d.trim().toLowerCase() === `root`;
  const Se = d.trim().length > 0 && !isValidWslUsername(d);
  const Ce = React.useCallback(
    (e: boolean) => {
      (fe(e), e && A?.());
    },
    [A],
  );
  switch (
    (React.useEffect(() => {
      e !== `ssh` && le && ue(false);
    }, [e, le]),
    React.useEffect(() => {
      e !== `docker` && de && fe(false);
    }, [de, e]),
    React.useEffect(() => {
      if (!le) return;
      const e = window.requestAnimationFrame(() => {
        W.current
          ?.querySelector(`[data-ssh-config-alias-selected="true"]`)
          ?.scrollIntoView({ block: `nearest` });
      });
      return () => {
        window.cancelAnimationFrame(e);
      };
    }, [le, D, C.length]),
    e)
  ) {
    case `ssh`:
      return (
        <div className={`space-y-3`}>
          <div className={`space-y-1`}>
            <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
              {se.formatMessage({ id: `ssh.configAlias` })}
            </label>
            <Popover open={le} onOpenChange={ue}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={w || C.length === 0}
                  data-testid={TESTID_SSH_CONFIG_ALIAS_SELECT}
                  className={`h-9 w-full max-w-80 justify-between rounded-lg border-input-border bg-input px-3 text-ui-base font-normal hover:border-input-border-hover hover:bg-input aria-expanded:border-input-border-focused aria-expanded:bg-input-focused`}
                >
                  <span className={`min-w-0 truncate text-left`}>{he}</span>
                  <IconChevronDown className={`size-3.5 text-foreground-subtle`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align={`start`} sideOffset={6} className={`w-80 gap-0 bg-menu p-0`}>
                <Command className={`bg-transparent p-0 text-foreground`}>
                  <CommandInput
                    placeholder={se.formatMessage({ id: `ssh.configAliasSearchPlaceholder` })}
                    className={`h-8`}
                  />
                  <CommandList ref={W} className={`max-h-60 overscroll-contain`} onWheel={ge}>
                    <CommandEmpty className={`px-4 py-5 text-foreground-subtle`}>
                      {se.formatMessage({ id: `ssh.configAliasEmpty` })}
                    </CommandEmpty>
                    <CommandGroup className={`p-1`}>
                      <CommandItem
                        value={SSH_CONFIG_ALIAS_NONE}
                        data-checked={D == null ? `true` : void 0}
                        data-ssh-config-alias-selected={D == null ? `true` : void 0}
                        className={`min-h-8 cursor-pointer px-2 text-ui-base`}
                        onSelect={() => {
                          (M(), ue(false));
                        }}
                      >
                        <span className={`truncate`}>
                          {se.formatMessage({ id: `ssh.configAliasPlaceholder` })}
                        </span>
                      </CommandItem>
                      {C.map((e) => (
                        <CommandItem
                          key={e.alias}
                          value={`${e.alias} ${sshConfigAliasSummary(e)}`}
                          data-checked={D === e.alias ? `true` : void 0}
                          data-ssh-config-alias-selected={D === e.alias ? `true` : void 0}
                          className={`min-h-8 cursor-pointer px-2 text-ui-base`}
                          onSelect={() => {
                            (j(e), ue(false));
                          }}
                        >
                          <span className={`flex min-w-0 flex-1 flex-col text-left`}>
                            <span className={`truncate`}>{e.alias}</span>
                            <span className={`truncate text-ui-base text-foreground-subtle`}>
                              {sshConfigAliasSummary(e)}
                            </span>
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className={cn(`text-ui-base`, E ? `text-warning` : `text-foreground-subtle`)}>
              {w
                ? se.formatMessage({ id: `common.loading` })
                : E
                  ? se.formatMessage({ id: `ssh.configAliasLoadFailed` })
                  : C.length === 0
                    ? se.formatMessage({ id: `ssh.configAliasEmpty` })
                    : se.formatMessage({ id: `ssh.configAliasDescription` })}
            </p>
          </div>
          <div className={`grid gap-3 md:grid-cols-[minmax(0,1fr)_6.5rem]`}>
            <SuggestionInput
              className={`h-9 text-ui-base`}
              label={se.formatMessage({ id: `ssh.host` })}
              value={t}
              onChange={F}
              placeholder={se.formatMessage({ id: `ssh.hostPlaceholder` })}
              suggestions={pe.hosts}
              emptyText={se.formatMessage({ id: `remote.history.empty` })}
              suggestionWidth={`min(30ch, calc(100vw - 2rem))`}
              autoCapitalize="none"
              spellCheck={false}
              data-testid={TESTID_SSH_HOST_INPUT}
            />
            <SuggestionInput
              className={`h-9 text-ui-base`}
              label={se.formatMessage({ id: `ssh.port` })}
              value={n}
              onChange={I}
              placeholder={`22`}
              suggestions={pe.ports}
              emptyText={se.formatMessage({ id: `remote.history.empty` })}
              suggestionWidth={`min(8ch, calc(100vw - 2rem))`}
              inputMode="numeric"
              data-testid={TESTID_SSH_PORT_INPUT}
            />
          </div>
          <div className={`grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-end`}>
            <SuggestionInput
              className={`h-9 text-ui-base`}
              label={se.formatMessage({ id: `ssh.username` })}
              value={r}
              onChange={L}
              placeholder={se.formatMessage({ id: `ssh.usernamePlaceholder` })}
              suggestions={pe.usernames}
              emptyText={se.formatMessage({ id: `remote.history.empty` })}
              suggestionWidth={`min(30ch, calc(100vw - 2rem))`}
              autoCapitalize="none"
              spellCheck={false}
              data-testid={TESTID_SSH_USERNAME_INPUT}
            />
            <div>
              <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
                {se.formatMessage({ id: `ssh.authMethod` })}
              </label>
              <div className={`inline-flex w-full items-center rounded-lg border border-input-border bg-input p-[3px]`}>
                {([`password`, `privateKey`] as const).map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => R(e)}
                    data-testid={e === `password` ? TESTID_SSH_AUTH_PASSWORD : TESTID_SSH_AUTH_PRIVATE_KEY}
                    className={cn(
                      `inline-flex h-7 flex-1 items-center justify-center rounded-md px-3 text-ui-base font-medium whitespace-nowrap transition-colors`,
                      i === e ? `bg-background text-foreground` : `text-foreground-subtle hover:text-foreground`,
                    )}
                  >
                    {se.formatMessage({ id: `ssh.auth.${e}` })}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {i === `password` ? (
            <div>
              <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
                {se.formatMessage({ id: `ssh.password` })}
              </label>
              <Input
                size="lg"
                className={`h-9 text-ui-base`}
                type="password"
                value={o}
                onChange={(e) => B(e.target.value)}
                placeholder={se.formatMessage({ id: `ssh.passwordPlaceholder` })}
                name={`remote-ssh-password`}
                autoComplete="off"
                data-testid={TESTID_SSH_PASSWORD_INPUT}
              />
            </div>
          ) : (
            <div>
              <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
                {se.formatMessage({ id: `ssh.privateKey` })}
              </label>
              <div className={`relative mb-3`}>
                <SuggestionInput
                  className={`h-9 pr-10 text-ui-base`}
                  value={s}
                  onChange={V}
                  placeholder={se.formatMessage({ id: `ssh.privateKeyPlaceholder` })}
                  suggestions={pe.privateKeyPaths}
                  emptyText={se.formatMessage({ id: `remote.history.empty` })}
                  autoCapitalize="none"
                  spellCheck={false}
                  data-testid={TESTID_SSH_PRIVATE_KEY_INPUT}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className={`absolute top-1/2 right-0.5 -translate-y-1/2`}
                  title={se.formatMessage({ id: `ssh.privateKeySelect` })}
                  onClick={() => {
                    (async () => {
                      const e = await ce.selectFile?.();
                      e && V(e);
                    })();
                  }}
                >
                  <IconPlus className={`size-4`} />
                </Button>
              </div>
              <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
                {se.formatMessage({ id: `ssh.privateKeyPassphrase` })}
              </label>
              <Input
                size="lg"
                className={`h-9 text-ui-base`}
                type="password"
                value={c}
                onChange={(e) => H(e.target.value)}
                placeholder={se.formatMessage({ id: `ssh.privateKeyPassphrasePlaceholder` })}
                name={`remote-ssh-private-key-passphrase`}
                autoComplete="off"
              />
            </div>
          )}
          <div>
            <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
              {se.formatMessage({ id: `ssh.assetInstallMode` })}
            </label>
            <div className={`inline-flex w-full max-w-md flex-col items-stretch rounded-lg border border-input-border bg-input p-[3px] sm:w-fit sm:flex-row sm:items-center`}>
              {([`local-download-upload`, `remote-download`] as const).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => z(e)}
                  className={cn(
                    `inline-flex min-h-7 min-w-0 flex-1 items-center justify-center rounded-md px-3 py-1 text-center text-ui-base font-medium transition-colors sm:flex-none`,
                    a === e ? `bg-background text-foreground` : `text-foreground-subtle hover:text-foreground`,
                  )}
                >
                  <span className={`min-w-0 break-words`}>
                    {se.formatMessage({ id: `ssh.assetInstallMode.${e}` })}
                  </span>
                </button>
              ))}
            </div>
            <p className={`mt-1 text-ui-base text-foreground-subtle`}>
              {se.formatMessage({ id: `ssh.assetInstallModeDescription` })}
            </p>
          </div>
        </div>
      );
    case `server`:
      return (
        <div className={`space-y-3`}>
          <p className={`text-ui-base text-foreground-subtle`}>{se.formatMessage({ id: `server.description` })}</p>
          <div>
            <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
              {se.formatMessage({ id: `server.url` })}
            </label>
            <Input
              size="lg"
              className={`h-9 text-ui-base`}
              value={g}
              onChange={(e) => re(e.target.value)}
              placeholder={se.formatMessage({ id: `server.urlPlaceholder` })}
              autoCapitalize="none"
              spellCheck={false}
              data-testid={TESTID_SERVER_URL_INPUT}
            />
          </div>
          <div className={`grid gap-3 md:grid-cols-2`}>
            <div>
              <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
                {se.formatMessage({ id: `server.name` })}
              </label>
              <Input
                size="lg"
                className={`h-9 text-ui-base`}
                value={_}
                onChange={(e) => ie(e.target.value)}
                placeholder={se.formatMessage({ id: `server.namePlaceholder` })}
                data-testid={TESTID_SERVER_NAME_INPUT}
              />
            </div>
            <div>
              <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
                {se.formatMessage({ id: `server.token` })}
              </label>
              <Input
                size="lg"
                className={`h-9 text-ui-base`}
                type="password"
                value={v}
                onChange={(e) => ae(e.target.value)}
                placeholder={se.formatMessage({ id: `server.tokenPlaceholder` })}
                autoComplete="off"
                data-testid={TESTID_SERVER_TOKEN_INPUT}
              />
            </div>
          </div>
          <div>
            <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
              {se.formatMessage({ id: `server.workspacePath` })}
            </label>
            <Input
              size="lg"
              className={`h-9 text-ui-base`}
              value={y}
              onChange={(e) => oe(e.target.value)}
              placeholder={se.formatMessage({ id: `server.workspacePathPlaceholder` })}
              autoCapitalize="none"
              spellCheck={false}
              data-testid={TESTID_SERVER_WORKSPACE_PATH_INPUT}
            />
            <p className={`mt-1 text-ui-base text-foreground-subtle`}>
              {se.formatMessage({ id: `server.workspacePathDescription` })}
            </p>
          </div>
        </div>
      );
    case `wsl`:
      return (
        <div className={`space-y-3`}>
          <p className={`text-ui-base text-foreground-subtle`}>{se.formatMessage({ id: `wsl.description` })}</p>
          <div>
            <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
              {se.formatMessage({ id: `wsl.distro` })}
            </label>
            {f.length > 0 ? (
              <Select
                value={u || WSL_DEFAULT_DISTRO_SENTINEL}
                onValueChange={(e) => {
                  ee(e === WSL_DEFAULT_DISTRO_SENTINEL ? `` : e);
                }}
              >
                <SelectTrigger size={`lg`} className={`h-9 w-full`} data-testid={TESTID_WSL_DISTRO_SELECT}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align={`start`}>
                  <SelectItem value={WSL_DEFAULT_DISTRO_SENTINEL}>
                    {se.formatMessage({ id: `wsl.defaultDistro` })}
                  </SelectItem>
                  {f.map((e) => (
                    <SelectItem key={e.name} value={e.name}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                size="lg"
                className={`h-9 text-ui-base`}
                value={u}
                onChange={(e) => ee(e.target.value)}
                placeholder={se.formatMessage({ id: `wsl.defaultDistro` })}
              />
            )}
          </div>
          <p className={`text-ui-base text-foreground-subtle`}>
            {O
              ? se.formatMessage({ id: `wsl.loading` })
              : f.length > 0
                ? se.formatMessage({ id: `wsl.detectedCount` }, { count: String(f.length) })
                : se.formatMessage({ id: `wsl.noDistros` })}
          </p>
          <div>
            <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
              {se.formatMessage({ id: `wsl.user` })}
            </label>
            <Input
              size="lg"
              className={`h-9 text-ui-base`}
              value={d}
              onChange={(e) => U?.(e.target.value)}
              placeholder={se.formatMessage({ id: `wsl.defaultUser` })}
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={Se}
              data-testid={TESTID_WSL_USER_INPUT}
            />
            <p className={cn(`mt-1 text-ui-base`, Se ? `text-destructive` : `text-foreground-subtle`)}>
              {se.formatMessage({ id: Se ? `wsl.validation.invalidUser` : `wsl.userDescription` })}
            </p>
          </div>
          {xe ? (
            <div className={`flex items-start gap-2 rounded-lg border border-warning bg-warning px-3 py-2 text-ui-base text-warning-foreground`}>
              <IconTriangleAlert className={`mt-0.5 size-4 shrink-0`} />
              <span>{se.formatMessage({ id: `wsl.rootWarning` })}</span>
            </div>
          ) : null}
        </div>
      );
    case `docker`:
      return (
        <div className={`space-y-3`}>
          <p className={`text-ui-base text-foreground-subtle`}>{se.formatMessage({ id: `docker.description` })}</p>
          <div>
            <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
              {se.formatMessage({ id: `docker.selectContainer` })}
            </label>
            <Popover open={de} onOpenChange={Ce}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  data-testid={TESTID_DOCKER_CONTAINER_SELECT}
                  className={`h-9 w-full justify-between rounded-lg border-input-border bg-input px-3 text-ui-base font-normal hover:border-input-border-hover hover:bg-input aria-expanded:border-input-border-focused aria-expanded:bg-input-focused`}
                >
                  <span className={cn(`min-w-0 truncate text-left`, ye ? `text-foreground-subtlest` : `text-foreground`)}>
                    {ve}
                  </span>
                  {O ? (
                    <IconLoader className={`size-3.5 shrink-0 animate-spin text-foreground-subtle`} />
                  ) : (
                    <IconChevronDown className={`size-3.5 shrink-0 text-foreground-subtle`} />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align={`start`}
                sideOffset={6}
                className={`max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-menu p-1 shadow-lg`}
                style={{ width: `var(--radix-popover-trigger-width)` }}
              >
                <Command className={`rounded-lg bg-transparent p-0 text-foreground`}>
                  <CommandList className={`max-h-56 scroll-py-1`}>
                    {O ? (
                      <div className={`flex min-h-8 items-center gap-2 rounded-lg px-3 py-1.5 text-ui-base text-foreground-subtle`}>
                        <IconLoader className={`size-3.5 shrink-0 animate-spin`} />
                        <span className={`truncate`}>{se.formatMessage({ id: `docker.loading` })}</span>
                      </div>
                    ) : null}
                    {b.length === 0 && !O ? (
                      <CommandEmpty className={`px-3 py-5 text-ui-base text-foreground-subtle`}>{_e}</CommandEmpty>
                    ) : (
                      b.map((e) => {
                        const t = e.name === p;
                        return (
                          <CommandItem
                            key={e.id}
                            value={e.name}
                            className={`min-h-8 cursor-pointer rounded-lg px-3 py-1.5 text-ui-base text-foreground data-selected:bg-menu-hover data-selected:text-foreground`}
                            onSelect={() => {
                              (te(e.name), fe(false));
                            }}
                          >
                            <span className={`min-w-0 flex-1 truncate`}>{e.name}</span>
                            <IconCheck className={cn(`size-4 shrink-0 text-foreground-subtle`, t ? `opacity-100` : `opacity-0`)} />
                          </CommandItem>
                        );
                      })
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className={`mb-1 block text-ui-base text-foreground-subtle`}>
              {se.formatMessage({ id: `docker.container` })}
            </label>
            <Input
              size="lg"
              className={`h-9 text-ui-base`}
              value={m}
              onChange={(e) => ne(e.target.value)}
              placeholder={se.formatMessage({ id: `docker.containerPlaceholder` })}
              data-testid={TESTID_DOCKER_CONTAINER_INPUT}
            />
            {be ? (
              <p className={`mt-1 text-ui-base text-foreground-subtle`}>
                {se.formatMessage({ id: `docker.manualContainerHint` })}
              </p>
            ) : null}
          </div>
        </div>
      );
  }
  return null;
}

/* ---- REt 依赖的隙段小助手（账实差异段，当前 124260–124283，见头注二.2） ---- */

/** 原 K2（124276） */
const WSL_DEFAULT_DISTRO_SENTINEL = `__default_wsl_distro__`;
/** 原 IEt（124277） */
const SSH_CONFIG_ALIAS_NONE = `__ssh_config_alias_none__`;
/** 原 LEt（124278）：alias 摘要 user@host:port */
function sshConfigAliasSummary(e: SshConfigAlias): string {
  const t = e.host?.trim() || e.alias;
  const n = e.username?.trim();
  const r = n ? `${n}@${t}` : t;
  return e.port == null ? r : `${r}:${e.port}`;
}
/** 原 G2（124260）+ FEt（124267）：由历史会话构建 ssh 建议（hosts/ports/usernames/privateKeyPaths） */
function dedupeTrimmed(values: string[]): string[] {
  const t = new Set<string>();
  return values.flatMap((e) => {
    const n = e.trim();
    return !n || t.has(n) ? [] : (t.add(n), [n]);
  });
}
function buildSshHistorySuggestions(e: RemoteWorkspaceSessionLike[]): {
  hosts: string[];
  ports: string[];
  usernames: string[];
  privateKeyPaths: string[];
} {
  const t = e.flatMap((e) => (e.target?.kind === `ssh` ? [e.target] : []));
  return {
    hosts: dedupeTrimmed(t.map((e) => e.host ?? ``)),
    ports: dedupeTrimmed(t.map((e) => String(e.port ?? 22))),
    usernames: dedupeTrimmed(t.map((e) => e.username ?? ``)),
    privateKeyPaths: dedupeTrimmed(t.map((e) => e.privateKeyPath ?? ``)),
  };
}

/* ============================================================================
 * 4. RemoteWizardDialog（原 fOt，js 128110–128541 / jsx 108012–108384）
 * ==========================================================================*/

export function RemoteWizardDialog({
  onConnect: e,
  onSelectProject: t,
  onCancelSession: n,
  localWorkspacePath: r,
  trigger: i,
  triggerVariant: a = `outline`,
  triggerSize: o = `sm`,
  triggerClassName: s,
  open: c,
  onOpenChange: l,
  hideTriggerWhenClosed: u = false,
  isWindowsDesktop: d = false,
  remoteWorkspaceSessions: f = [],
  onFlowActiveChange: p,
  onFlowRequestIdChange: m,
  preferredKind: h,
  preferredWslDistro: g,
}: {
  onConnect: (target: RemoteTarget, requestId: string) => Promise<string | null>;
  /* A0-CLEANUP4：第三参收可选——bundle a4（js 128782）localWorkspacePath 可传 undefined，
     实际处理方 selectRemoteProject（OnboardingLoginLeaves js 209393 域）第三参即可选 */
  onSelectProject: (sessionId: string, path: string, localWorkspacePath?: string) => Promise<void>;
  onCancelSession: (sessionId: string) => Promise<void>;
  localWorkspacePath?: string;
  trigger?: React.ReactNode;
  triggerVariant?: string;
  triggerSize?: string;
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  hideTriggerWhenClosed?: boolean;
  isWindowsDesktop?: boolean;
  remoteWorkspaceSessions?: RemoteWorkspaceSessionLike[];
  onFlowActiveChange?: (active: boolean) => void;
  onFlowRequestIdChange?: (requestId: string | null) => void;
  preferredKind?: RemoteKind;
  preferredWslDistro?: string;
}) {
  const { intl: _ } = useIntlContext();
  const v = useConfirmDialog();
  const y = useCancelRemoteConnection();
  const [b, x] = React.useState(false);
  const [S, C] = React.useState(false);
  const [w, T] = React.useState(``);
  const [E, D] = React.useState(``);
  const [O, k] = React.useState<WizardStep>(`kind`);
  const [A, j] = React.useState<string | null>(null);
  const [M, P] = React.useState<string | null>(null);
  const [F, I] = React.useState<RemoteTarget | null>(null);
  const [L, R] = React.useState(false);
  const z = React.useRef(false);
  const { connectionLogs: B, resetConnectionLogs: V } = useRemoteConnectionLogs(M);
  const H = c ?? b;
  const {
    kind: ee,
    host: U,
    port: te,
    username: ne,
    sshAuthMethod: re,
    assetInstallMode: ie,
    password: ae,
    privateKeyPath: oe,
    privateKeyPassphrase: se,
    wslDistro: ce,
    wslUser: le,
    dockerContainer: ue,
    manualDockerContainer: de,
    serverUrl: fe,
    serverName: W,
    serverToken: pe,
    serverWorkspacePath: me,
    sshConfigAliases: he,
    sshConfigAliasesLoading: ge,
    sshConfigAliasesError: _e,
    selectedSshConfigAlias: ve,
    dockerAvailable: ye,
    wslDistros: be,
    dockerContainers: xe,
    availableKinds: Se,
    setKind: Ce,
    setHost: we,
    setPort: Te,
    setUsername: Ee,
    setSshAuthMethod: De,
    setAssetInstallMode: Oe,
    setPassword: ke,
    setPrivateKeyPath: Ae,
    setPrivateKeyPassphrase: je,
    setWslDistro: Me,
    setWslUser: Ne,
    setDockerContainer: Pe,
    setManualDockerContainer: Fe,
    setServerUrl: Ie,
    setServerName: Le,
    setServerToken: Re,
    setServerWorkspacePath: ze,
    refreshDockerContainers: Be,
    applySshConfigAlias: Ve,
    clearSelectedSshConfigAlias: He,
    currentRuntimeOptionsLoading: Ue,
    currentRuntimeOptionsError: We,
  } = useRemoteWizardState({ open: H, isWindowsDesktop: d, preferredKind: h, preferredWslDistro: g });
  const Ge = useSessionStore((e) => (A ? (e.sessionsById[A]?.services ?? null) : null));
  const Ke = useBaseServices();
  const qe = React.useMemo(() => ({ currentStep: O, loading: S, connectedSessionId: A }), [A, O, S]);
  const Je = isWizardFlowActive(qe);
  React.useEffect(() => {
    p?.(Je);
  }, [Je, p]);
  const Ye = React.useCallback(
    (e: string | null) => {
      (P(e), m?.(e));
    },
    [m],
  );
  const Xe = (e: boolean) => {
    (l?.(e), c === void 0 && x(e));
  };
  const Ze = () => {
    (T(``), D(``));
  };
  const Qe = React.useCallback(() => {
    ((z.current = false), R(false));
  }, []);
  const $e = React.useCallback(
    async (e: string) => {
      try {
        await n(e);
      } catch (t) {
        logger.warn(`[SSHDialog] 释放未确认的远程 session 失败:`, { sessionId: e, error: t });
      }
    },
    [n],
  );
  const et = React.useCallback(
    (e?: { preserveSession?: boolean }) => {
      const t = A;
      (!e?.preserveSession && t
        ? $e(t)
        : !e?.preserveSession && S && O === `connecting` && y(M ?? void 0),
        Ze(),
        C(false),
        Qe(),
        V(),
        k(`kind`),
        j(null),
        I(null),
        Ye(null),
        Xe(false));
    },
    [y, A, M, O, $e, S, Qe, Ye],
  );
  const tt = React.useCallback(
    async () =>
      O === `connecting` && S
        ? v({
            title: _.formatMessage({ id: `remote.connectingConfirmTitle` }),
            description: _.formatMessage({ id: `remote.connectingConfirmDescription` }),
            confirmLabel: _.formatMessage({ id: `remote.stopConnecting` }),
            cancelLabel: _.formatMessage({ id: `common.cancel` }),
          })
        : A
          ? v({
              title: _.formatMessage({ id: `remote.connectedConfirmTitle` }),
              description: _.formatMessage({ id: `remote.connectedConfirmDescription` }),
              confirmLabel: _.formatMessage({ id: `remote.leaveConnectedSession` }),
              cancelLabel: _.formatMessage({ id: `common.cancel` }),
            })
          : true,
    [v, A, O, _, S],
  );
  const nt = React.useCallback(async () => {
    (await tt()) && et();
  }, [et, tt]);
  const rt = async (t: RemoteTarget) => {
    const n = attachSelectedResourcePackages(t);
    if (S) return;
    (I(n), C(true));
    const r = generateRequestId();
    (Ye(r), Ze(), V(), k(`connecting`));
    try {
      const t = await e(n, r);
      const i = wizardResultToOpenState(`success`);
      (j(t), k(i.step), Xe(i.open));
    } catch (e) {
      const t = wizardResultToOpenState(`error`);
      (T(toErrorMessage(e)), k(t.step), Xe(t.open));
    } finally {
      C(false);
    }
  };
  const it = async () => {
    if (S) return;
    const { target: e, errorMessage: t } = validateAndBuildRemoteTarget(_, {
      kind: ee,
      host: U,
      port: te,
      username: ne,
      sshAuthMethod: re,
      assetInstallMode: ie,
      password: ae,
      privateKeyPath: oe,
      privateKeyPassphrase: se,
      selectedSshConfigAlias: ve,
      wslDistro: ce,
      wslUser: le,
      dockerContainer: ue,
      manualDockerContainer: de,
      serverUrl: fe,
      serverName: W,
      serverToken: pe,
      serverWorkspacePath: me,
    });
    if (!e) {
      D(t ?? `Connection failed`);
      return;
    }
    (Ze(), I(e), await rt(e));
  };
  const at = React.useCallback(() => {
    if (!F) {
      it();
      return;
    }
    rt(F);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [it, F, rt]);
  const ot = React.useCallback(async () => {
    if (A) {
      Ze();
      try {
        (await n(A), j(null), Ye(null), V(), k(`settings`));
      } catch (e) {
        T(toErrorMessage(e));
      }
    }
  }, [A, n, Ye]);
  const st = React.useCallback(
    async (e: string) => {
      if (!(!A || z.current)) {
        ((z.current = true), R(true), Ze());
        try {
          (await t(A, e, r), V(), k(`kind`), j(null), I(null), Ye(null), Xe(false));
        } catch (e) {
          const t = resolveDirectorySelectFallback({
            connectedSessionId: A,
            sessionStillRegistered: !!useSessionStore.getState().sessionsById[A],
          });
          (t.connectedSessionId || (j(null), k(t.step), Ye(null)), T(toErrorMessage(e)));
        } finally {
          Qe();
        }
      }
    },
    [A, r, t, Qe, Ye],
  );
  const ct = (e: boolean) => {
    if (e) {
      (isWizardFlowIdle(qe) && (Ze(), V(), k(`kind`), I(null)), Xe(true));
      return;
    }
    nt();
  };
  const lt = resolveWizardStepCopy(_, O, ee);
  return (
    <>
      {u ? null : (
        <Button
          type="button"
          variant={a}
          size={o}
          onClick={() => {
            (isWizardFlowIdle(qe) && (Ze(), V(), k(`kind`), I(null)), Xe(true));
          }}
          data-testid={TESTID_SSH_CONNECT_TRIGGER}
          className={s}
        >
          {i ?? _.formatMessage({ id: `remote.trigger` })}
        </Button>
      )}
      <Dialog open={H} onOpenChange={ct}>
        <DialogContent
          showCloseButton={false}
          className={`h-[calc(100dvh-1rem)] max-h-168 w-[calc(100vw-1rem)] max-w-4xl overflow-hidden rounded-2xl p-0 md:h-[calc(100vh-6rem)]`}
        >
          <div data-testid={TESTID_SSH_DIALOG} className={`flex h-full min-h-0 flex-col overflow-hidden md:flex-row`}>
            <RemoteWizardStepIndicator currentStep={O} />
            <div className={`flex min-w-0 flex-1 flex-col gap-3 overflow-hidden p-4 sm:gap-4 sm:p-6`}>
              <DialogHeader className={`space-y-2`}>
                <RemoteWizardHeader
                  title={lt.title}
                  description={lt.description}
                  onMinimize={
                    Je
                      ? () => {
                          Xe(false);
                        }
                      : void 0
                  }
                  onClose={() => {
                    nt();
                  }}
                />
              </DialogHeader>
              {w && O !== `connecting` ? (
                <div
                  data-testid={TESTID_SSH_ERROR}
                  className={`flex items-start gap-3 rounded-xl bg-destructive px-4 py-3 text-ui-base text-destructive-foreground`}
                >
                  <IconTriangleAlert className={`mt-0.5 size-4 shrink-0`} />
                  {w}
                </div>
              ) : null}
              <div className={`w-full min-h-0 flex-1`}>
                {O === `kind` ? (
                  <RemoteKindStep
                    kind={ee}
                    availableKinds={Se}
                    onKindChange={Ce}
                    onCancel={() => et()}
                    onNext={() => {
                      (Ze(), k(`settings`));
                    }}
                  />
                ) : null}
                {O === `settings` ? (
                  <RemoteSettingsStep
                    kind={ee}
                    host={U}
                    port={te}
                    username={ne}
                    sshAuthMethod={re}
                    assetInstallMode={ie}
                    password={ae}
                    privateKeyPath={oe}
                    privateKeyPassphrase={se}
                    wslDistro={ce}
                    wslUser={le}
                    wslDistros={be}
                    dockerContainer={ue}
                    manualDockerContainer={de}
                    serverUrl={fe}
                    serverName={W}
                    serverToken={pe}
                    serverWorkspacePath={me}
                    dockerContainers={xe}
                    dockerAvailable={ye}
                    sshConfigAliases={he}
                    sshConfigAliasesLoading={ge}
                    sshConfigAliasesError={_e}
                    selectedSshConfigAlias={ve}
                    currentRuntimeOptionsLoading={Ue}
                    currentRuntimeOptionsError={We}
                    remoteWorkspaceSessions={f}
                    validationMessage={E}
                    loading={S}
                    onBack={() => {
                      (Ze(), k(`kind`));
                    }}
                    onHostChange={we}
                    onPortChange={Te}
                    onUsernameChange={Ee}
                    onSshAuthMethodChange={De}
                    onAssetInstallModeChange={Oe}
                    onPasswordChange={ke}
                    onPrivateKeyPathChange={Ae}
                    onPrivateKeyPassphraseChange={je}
                    onWslDistroChange={Me}
                    onWslUserChange={Ne}
                    onDockerContainerChange={Pe}
                    onManualDockerContainerChange={Fe}
                    onServerUrlChange={Ie}
                    onServerNameChange={Le}
                    onServerTokenChange={Re}
                    onServerWorkspacePathChange={ze}
                    onDockerContainersRefresh={Be}
                    onApplySshConfigAlias={Ve}
                    onClearSelectedSshConfigAlias={He}
                    onConnect={() => {
                      it();
                    }}
                  />
                ) : null}
                {O === `connecting` ? (
                  <RemoteConnectingStep
                    kind={ee}
                    logs={B}
                    errorMessage={w}
                    loading={S}
                    onBack={() => {
                      (async () => {
                        (await tt()) &&
                          (S && (await y(M ?? void 0), C(false)),
                          Ze(),
                          Ye(null),
                          k(`settings`));
                      })();
                    }}
                    onRetry={() => {
                      at();
                    }}
                  />
                ) : null}
                {O === `directory` ? (
                  <div data-testid={TESTID_SSH_SUCCESS} className={`h-full`}>
                    <RemoteDirectoryStep
                      services={Ge as RemoteDirectoryStepPropsLike["services"]}
                      remoteTarget={F}
                      localSkillSyncService={Ke.skillSyncService as RemoteDirectoryStepPropsLike["localSkillSyncService"]}
                      remoteSkillSyncService={((Ge as { skillSyncService?: unknown } | null)?.skillSyncService ?? null) as RemoteDirectoryStepPropsLike["remoteSkillSyncService"]}
                      localMcpSyncService={Ke.mcpSyncService as RemoteDirectoryStepPropsLike["localMcpSyncService"]}
                      remoteMcpSyncService={((Ge as { mcpSyncService?: unknown } | null)?.mcpSyncService ?? null) as RemoteDirectoryStepPropsLike["remoteMcpSyncService"]}
                      localPluginSyncService={Ke.pluginSyncService as RemoteDirectoryStepPropsLike["localPluginSyncService"]}
                      remotePluginSyncService={((Ge as { pluginSyncService?: unknown } | null)?.pluginSyncService ?? null) as RemoteDirectoryStepPropsLike["remotePluginSyncService"]}
                      localZCodeAgentService={Ke.zcodeAgentService as RemoteDirectoryStepPropsLike["localZCodeAgentService"]}
                      remoteZCodeAgentService={((Ge as { zcodeAgentService?: unknown } | null)?.zcodeAgentService ?? null) as RemoteDirectoryStepPropsLike["remoteZCodeAgentService"]}
                      localWorkspacePath={r}
                      selecting={L}
                      onSelect={(e: string) => {
                        st(e);
                      }}
                      onBack={() => {
                        (async () => {
                          (await tt()) && (await ot());
                        })();
                      }}
                      onCancel={() => {
                        nt();
                      }}
                      onSkillsSynced={async () => void 0}
                      onMcpSynced={async () => void 0}
                      onPluginsSynced={async () => void 0}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
/** 原 pOt（128542 / jsx 108385）：`var pOt = fOt`（Home.tsx 接口引用别名） */
export const RemoteWizardDialogAlias = RemoteWizardDialog;

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → 当前 js 行 / jsx 行；本文件覆盖段）
 * ============================================================================
 *  i4 127943/107954 | lOt 127949/107967 | uOt 127952–128055/107970–107992
 *  dOt 128058–128108/107993–108011
 *  REt 124284–125011/105903–106205
 *  fOt 128110–128541/108012–108384 | pOt 128542/108385
 *  内联隙段小助手：G2 124260 | FEt 124267 | K2 124276 | IEt 124277 | LEt 124278
 *  —— 接口级登记（未分配隙段）：mEt 123535 | bEt 123789 | xEt 123838 | SEt 123868
 *     CEt 123929 | wEt 123932 | TEt 123935 | EEt 123938 | DEt 123941 | uEt 123484 区
 *     rOt 127357 | oOt 127539 | sOt 127616 | cOt 127782 | W2/NEt/PEt 124144–124259
 *  —— 已抽取注记：MEt/OEt/kEt/AEt/jEt + r4/ZEt/lDt/XDt/$Dt/preflight（Modals.tsx）
 *     ZTt/QTt（TopBar.report）| mOt…bOt（Home.tsx）| 128795+ 更新窗（F09/TopBar）
 * ============================================================================
 */
