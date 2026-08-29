/* eslint-disable */
/**
 * ============================================================================
 * RemoteGapSegments.tsx — F10 远程族两个未分配隙段的逐字重建（批次 B5-14 · 缺口 3）
 * ============================================================================
 *
 * 来源文件（主口径，融合 chunk，只读，md5 基线 48d71d4874b0868d61fd35a328bf6ad5）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 接口级登记依据：
 *   desktop/src/src-reconstructed/modules/WebRemoteWizard.report.md §B.2-3（隙段 a/b）
 *
 * 行号口径：本文件注释中「当前 N」= 当前 out chunk 实测行号（锚点回代以此为准）；
 *           「原 N」= 台账口径（≤142k 区 当前−17）；「jsx N」= WebRemoteWizard.report.md
 *           所引 pretty 版行号（仅登记符号有值，其余记 —）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表
 * ----------------------------------------------------------------------------
 * 隙段 a（台账原 123518–123928 / 当前 123522–123945；登记 12 符号 + 内部 4 + 邻接 1）：
 *   dEt → probeDockerAvailability        docker 可用性探测（邻接，原 123496，未登记；本批补录）
 *                                        （当前 123513–123521 / jsx —）
 *   fEt → resolveCurrentDockerContainer  现容器名在列表中则保留（当前 123522–123525 / 原 123505 / jsx 105244）
 *   pEt → listAvailableRemoteKinds       可用连接类型列表（当前 123526–123534 / 原 123509 / jsx 105251）
 *   mEt → useRemoteWizardState           向导状态总钩（当前 123535–123746 / 原 123518 / jsx 105255）
 *   hEt → stripRemoteLogPrefixes         日志行前缀剥离（当前 123747–123753 / 原 123730 / jsx 105441）
 *   gEt → logIsDownloadProgress          内部（当前 123754–123756 / 原 123737 / jsx —）
 *   _Et → classifyProgressLogMessage     内部（当前 123757–123761 / 原 123740 / jsx —）
 *   vEt → mergeRemoteLogProgressEntry    内部（当前 123762–123784 / 原 123745 / jsx —）
 *   yEt → logEntryMatchesRequestId       内部（当前 123785–123788 / 原 123768 / jsx —）
 *   bEt → useRemoteConnectionLogs        连接日志钩（当前 123789–123837 / 原 123772 / jsx 105484）
 *   xEt → resolveWizardStepCopy          步文案（当前 123838–123867 / 原 123821 / jsx 105519）
 *   SEt → validateAndBuildRemoteTarget   校验并构建目标（当前 123868–123928 / 原 123851 / jsx 105567）
 *   CEt → attachSelectedResourcePackages ssh 目标附资源包（当前 123929–123931 / 原 123912 / jsx 105674）
 *   wEt → isWizardFlowActive             当前 123932–123934 / 原 123915 / jsx 105682
 *   TEt → isWizardFlowIdle               当前 123935–123937 / 原 123918 / jsx 105685
 *   EEt → wizardResultToOpenState        当前 123938–123940 / 原 123921 / jsx 105688
 *   DEt → resolveDirectorySelectFallback 当前 123941–123945 / 原 123924–123928 / jsx 105694
 * 隙段 b（台账原 127340–127925 / 当前 127350–127942；登记 4 符号 + 内部 2 + 邻接 3）：
 *   eOt → REMOTE_LOG_AUTOSCROLL_THRESHOLD_PX  邻接，原 127333，未登记；本批补录（当前 127350）
 *   tOt → logViewIsScrolledToBottom           邻接，原 127334，未登记；本批补录（当前 127351–127353）
 *   nOt → scrollLogViewToBottom               邻接，原 127337，未登记；本批补录（当前 127354–127356）
 *   rOt → RemoteConnectingStep           连接日志步（当前 127357–127509 / 原 127340 / jsx 107685）
 *   iOt → buildRemoteConnectionFeedbackDescription 内部（当前 127510–127526 / 原 127493 / jsx —）
 *   aOt → remoteKindIcon                 内部（当前 127527–127538 / 原 127510 / jsx —）
 *   oOt → RemoteKindStep                 类型步（当前 127539–127615 / 原 127522 / jsx 107764）
 *   sOt → RemoteSettingsStep             设置步壳（当前 127616–127781 / 原 127599 / jsx 107792）
 *   cOt → RemoteDirectoryStep            目录步（当前 127782–127942 / 原 127765–127925 / jsx 107859）
 *
 * ----------------------------------------------------------------------------
 * 二、边界裁决（只记录，不改动它批产物）
 * ----------------------------------------------------------------------------
 *  1. H2/U2（useConfirmDialogStore/useConfirmDialog，当前 123480–123512）已随
 *     stores-core.tsx §5 抽取（739–786 行），与本隙段 a 邻接，不在本批范围。
 *  2. OEt/kEt/AEt/jEt（当前 123946–123958 = 原 123929–123941）已随 Modals.tsx
 *     抽取（3348–3360 行），紧接隙段 a 之后，不在本批范围。
 *  3. REt RemoteSettingsForm（RemoteWizard.tsx 521 行导出）/ MEt DirectoryBrowserDialog、
 *     r4 RemoteSyncDialogs、$Dt RemoteSyncDropdownButton（Modals.tsx 导出）——本文件直接
 *     import 正规实体，不重复转录。
 *  4. $2 canOpenRemoteSessionSourceCheck：正规实现在 Modals.tsx 689 行（未导出），
 *     本文件以 declare 挂接（签名照录），整合期改为自 Modals 再导出。
 *  5. $te DEFAULT_ASSET_INSTALL_MODE：正规实体在 SrcSharedA.tsx 4542 行（const 链
 *     声明符，未导出），本文件以 declare 挂接，整合期补导出或改 import。
 *  6. i4/lOt/uOt/dOt/fOt/pOt（当前 127943+，步序/指示器/头/壳）已随 RemoteWizard.tsx
 *     抽取；本文件四步骤组件即 fOt 的 declare 挂接对象，整合期替换 RemoteWizard.tsx
 *     344–363 行 declare。
 *  7. testid：styles 自 src-HCld2afU 绑定 wne/yn/pn/Gt（remote-kind-*）与 Ni（ssh-error）；
 *     正规实体在 SrcSharedB.tsx（remoteKind*Testid / sshErrorTestid），本文件 import。
 *  8. yC FeedbackStore：stores-core.tsx §3 已逐字重建并导出 useFeedbackStore，本文件 import。
 *
 * ----------------------------------------------------------------------------
 * 三、外部依赖清单（跨 chunk / 它批已还原者）
 * ----------------------------------------------------------------------------
 *  1. react；2. cn (Z)；3. Button (X)；4. useIntlContext (G)；5. usePlatformService (l，
 *     本批扩展面：isDockerAvailable/listDockerContainers/listSSHConfigAliases/
 *     listWSLDistros/onRemoteConnectionLog/captureWindowScreenshot)；
 *  6. useFeedbackStore (yC，stores-core)；7. 图标（Sa=createLucideIcon：fv loader 27363 /
 *     N triangle-alert / Iv server 27794 / U_ cloud 26966 / Qye monitor-cog 27491 /
 *     Gv terminal 27900 / wa ChevronRight=button chunk o 导出）；
 *  8. lee isValidWslUser、vne listFileTransferCapabilities（SrcSharedA 导出）。
 *
 * 把握度：高（全量逐行逐字；类型注解与两处类型层垫片在 §五 符号表后注记）。
 * ==========================================================================*/

import * as React from "react";
import { RemoteSettingsForm } from "./RemoteWizard";
import { canOpenRemoteSessionSourceCheck, DirectoryBrowserDialog, RemoteSyncDialogs, RemoteSyncDropdownButton } from "./Modals"; // +$2（A0-S2d/B5-14 接线）
import { DEFAULT_ASSET_INSTALL_MODE, isValidWslUser, listFileTransferCapabilities } from "./SrcSharedA"; // +$te（A0-S2d/B5-14 接线）
import {
  remoteKindDockerTestid,
  remoteKindServerTestid,
  remoteKindSshTestid,
  remoteKindWslTestid,
  sshErrorTestid,
} from "./SrcSharedB";
import { useFeedbackStore } from "./stores-core";

/* ============================================================================
 * 0. 契约声明（原符号 / 正规实体位置 见注释）
 * ==========================================================================*/

/** 原 Z（dist chunk cn 导出） */
declare function cn(...inputs: Array<string | false | null | undefined>): string;

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
/** 原 G（IntlProvider chunk） */
declare function useIntlContext(): { intl: IntlShape; locale: string };

/** 原 X（button chunk t 导出） */
interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "default" | "ghost" | "outline" | "destructive" | "link" | "secondary" | string;
  size?: "default" | "sm" | "lg" | "xs" | "icon-sm" | "icon-lg" | string;
}
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

/** 原 l（imeComposition M 导出；本批按 mEt/bEt/rOt 调用面扩展） */
interface RemotePlatformService {
  isLocalDevelopmentRuntime: boolean;
  isDockerAvailable(): Promise<boolean>;
  listDockerContainers(): Promise<DockerContainerRef[]>;
  listSSHConfigAliases(): Promise<SshConfigAlias[]>;
  listWSLDistros(): Promise<WslDistroRef[]>;
  onRemoteConnectionLog(handler: (entry: RemoteConnectionSourceLogEntry) => void): () => void;
  captureWindowScreenshot?(): Promise<Blob | null>;
}
declare function usePlatformService(): RemotePlatformService;

/* ── tombstone（A0-S2d/B5-14）：$2 与 $te 的 declare 挂接已删除 ——
 *    $2 canOpenRemoteSessionSourceCheck canonical 在 Modals.tsx（已补导出），
 *    $te DEFAULT_ASSET_INSTALL_MODE canonical 在 SrcSharedA.tsx（§15 已补导出），
 *    均经文件头真实 import 消费。 ── */

/** 图标工厂（原 Sa，lucide vendored 块） */
interface IconProps {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}
declare function createLucideIcon(name: string, paths: unknown[]): React.FC<IconProps>;
const IconLoader = createLucideIcon("loader", []);                // 原 fv（27363）
const IconTriangleAlert = createLucideIcon("triangle-alert", []); // 原 N（imeComposition x 导出）
const IconServer = createLucideIcon("server", []);                // 原 Iv（27794）
const IconCloud = createLucideIcon("cloud", []);                  // 原 U_（26966）
const IconMonitorCog = createLucideIcon("monitor-cog", []);       // 原 Qye（27491）
const IconTerminal = createLucideIcon("terminal", []);            // 原 Gv（27900）
/** 原 wa（button chunk o 导出 = ChevronRight；Modals.tsx 174 行同式登记） */
declare const IconChevronRight: React.FC<IconProps>;

/* ============================================================================
 * 0b. 本地类型（与 RemoteWizard.tsx 未导出类型同构；整合期可并一处）
 * ==========================================================================*/

type RemoteSettingsFormProps = React.ComponentProps<typeof RemoteSettingsForm>;
type RemoteKind = RemoteSettingsFormProps["kind"];
type WizardStep = "kind" | "settings" | "connecting" | "directory";
type WslDistroRef = RemoteSettingsFormProps["wslDistros"][number];
type DockerContainerRef = RemoteSettingsFormProps["dockerContainers"][number];
type RemoteWorkspaceSessionLike = NonNullable<RemoteSettingsFormProps["remoteWorkspaceSessions"]>[number];

/** ssh 配置别名（较 RemoteWizard.tsx 本地副本多 privateKeyPath 一字段：原 mEt
 *  applySshConfigAlias 消费 e.privateKeyPath，实测必需） */
interface SshConfigAlias {
  alias: string;
  host?: string | null;
  port?: number | null;
  username?: string | null;
  privateKeyPath?: string | null;
}

/** 原 RemoteTarget（RemoteWizard.tsx 209 行同构） */
interface RemoteTarget {
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

/** 向导表单快照（原 mEt 返回面对象，供 SEt 校验消费） */
interface RemoteTargetFormState {
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
  wslUser: string;
  dockerContainer: string;
  manualDockerContainer: string;
  serverUrl: string;
  serverName: string;
  serverToken: string;
  serverWorkspacePath: string;
  selectedSshConfigAlias: string | null;
}

/** 连接日志行（bEt 状态；timestamp 订阅来源为数值、手工追加为时间串，故并集） */
interface ConnectionLogRow {
  id: string;
  level: string;
  message: string;
  timestamp: string | number;
}

/** 服务侧日志条目（OnboardingLoginLeaves.tsx RemoteConnectionLogEntry 同构） */
interface RemoteConnectionSourceLogEntry {
  label?: string;
  level: string;
  message: string;
  timestamp: number;
  requestId?: string;
}

/* ============================================================================
 * 1. 隙段 a —— 向导状态 / 连接日志 / 步文案 / 校验 / 流助手
 *    （当前 123513–123945；台账原 123496–123928）
 * ==========================================================================*/

/** 原 dEt（当前 123513–123521，邻接补录）：docker 可用性探测 */
export async function probeDockerAvailability(e: RemotePlatformService): Promise<{
  dockerAvailable: boolean | null;
  dockerContainers: DockerContainerRef[];
  error: string;
}> {
  try {
    return (await e.isDockerAvailable())
      ? { dockerAvailable: !0, dockerContainers: await e.listDockerContainers(), error: `` }
      : { dockerAvailable: !1, dockerContainers: [], error: `` };
  } catch (e) {
    return { dockerAvailable: null, dockerContainers: [], error: String(e) };
  }
}

/** 原 fEt（当前 123522–123525）：当前容器名仍在列表中则保留，否则清空 */
export function resolveCurrentDockerContainer({
  currentContainer: e,
  dockerContainers: t,
}: {
  currentContainer: string;
  dockerContainers: DockerContainerRef[];
}) {
  let n = e.trim();
  return n && t.some((e) => e.name === n || e.id === n) ? n : ``;
}

/** 原 pEt（当前 123526–123534）：可用连接类型列表 */
export function listAvailableRemoteKinds(e: {
  isWindowsDesktop: boolean;
  isLocalDevelopmentRuntime: boolean;
}) {
  let t: RemoteKind[] = [`ssh`];
  return (
    e.isLocalDevelopmentRuntime && t.push(`server`),
    e.isWindowsDesktop && t.push(`wsl`),
    t.push(`docker`),
    t
  );
}

/** 原 mEt（当前 123535–123746）：远程向导状态总钩（表单字段 + 运行时选项 + setters） */
export function useRemoteWizardState({
  open: e,
  isWindowsDesktop: t,
  preferredKind: n,
  preferredWslDistro: r,
}: {
  open: boolean;
  isWindowsDesktop: boolean;
  preferredKind?: RemoteKind;
  preferredWslDistro?: string;
}) {
  let i = usePlatformService(),
    [a, o] = React.useState<RemoteKind>(`ssh`),
    [s, c] = React.useState(``),
    [u, d] = React.useState(`22`),
    [f, p] = React.useState(``),
    [m, h] = React.useState<"password" | "privateKey">(`password`),
    [g, _] = React.useState(DEFAULT_ASSET_INSTALL_MODE),
    [v, y] = React.useState(``),
    [b, x] = React.useState(``),
    [S, C] = React.useState(``),
    [w, T] = React.useState(``),
    [E, D] = React.useState(``),
    [O, k] = React.useState(``),
    [A, j] = React.useState(``),
    [M, N] = React.useState(``),
    [P, F] = React.useState(``),
    [I, L] = React.useState(``),
    [R, z] = React.useState(``),
    [B, V] = React.useState<SshConfigAlias[]>([]),
    [H, ee] = React.useState(!1),
    [U, te] = React.useState(!1),
    [ne, re] = React.useState(``),
    [ie, ae] = React.useState<string | null>(null),
    [oe, se] = React.useState<boolean | null>(null),
    [ce, le] = React.useState<WslDistroRef[]>([]),
    [ue, de] = React.useState<DockerContainerRef[]>([]),
    [fe, W] = React.useState(!1),
    [pe, me] = React.useState(!1),
    [he, ge] = React.useState(``),
    [_e, ve] = React.useState(!1),
    [ye, be] = React.useState(!1),
    [xe, Se] = React.useState(``),
    Ce = React.useRef(!1),
    we = React.useRef(0),
    Te = React.useRef<number | null>(null),
    Ee = i.isLocalDevelopmentRuntime === !0 || !1,
    De = React.useMemo(
      () => listAvailableRemoteKinds({ isWindowsDesktop: t, isLocalDevelopmentRuntime: Ee }),
      [Ee, t],
    );
  (React.useEffect(() => {
    De.includes(a) || o(De[0] ?? `ssh`);
  }, [De, a]),
    React.useEffect(() => {
      (we.current += 1),
        (Te.current = null),
        e &&
          (V([]),
          ee(!1),
          te(!1),
          re(``),
          ae(null),
          me(!1),
          W(!1),
          ge(``),
          le([]),
          se(null),
          be(!1),
          ve(!1),
          Se(``),
          de([]),
          n && De.includes(n) && o(n),
          r !== void 0 && T(r));
    }, [De, e, n, r]));
  let Oe = React.useCallback(
    ({ clearContainersOnError: e = !0 } = {}) => {
      if (Te.current != null && Te.current === we.current) return;
      let t = we.current + 1;
      (we.current = t),
        (Te.current = t),
        ve(!0),
        Se(``),
        (async () => {
          let n = await probeDockerAvailability(i);
          if (we.current === t) {
            if ((se(n.dockerAvailable), be(!0), Se(n.error), !n.error)) {
              de(n.dockerContainers),
                k((e) => resolveCurrentDockerContainer({ currentContainer: e, dockerContainers: n.dockerContainers }));
              return;
            }
            e && de(n.dockerContainers);
          }
        })().finally(() => {
          (Te.current === t && (Te.current = null), we.current === t && ve(!1));
        });
    },
    [i],
  );
  return (
    React.useEffect(() => {
      if (!e || a !== `ssh` || U) return;
      let t = !1;
      return (
        ee(!0),
        re(``),
        (async () => {
          try {
            let e = await i.listSSHConfigAliases();
            if (t) return;
            (V(e), te(!0));
          } catch (e) {
            if (t) return;
            (V([]), te(!0), re(String(e)));
          } finally {
            t || ee(!1);
          }
        })(),
        () => {
          t = !0;
        }
      );
    }, [a, e, i, U]),
    React.useEffect(() => {
      ie && (B.some((e) => e.alias === ie) || ae(null));
    }, [ie, B]),
    React.useEffect(() => {
      if (!e || a !== `wsl` || !t || pe) return;
      let n = !1;
      return (
        W(!0),
        ge(``),
        (async () => {
          try {
            let e = await i.listWSLDistros();
            if (n) return;
            (le(e), me(!0));
          } catch (e) {
            if (n) return;
            (le([]), me(!0), ge(String(e)));
          } finally {
            n || W(!1);
          }
        })(),
        () => {
          n = !0;
        }
      );
    }, [t, a, e, i, pe]),
    React.useEffect(() => {
      !e || a !== `docker` || ye || Oe({ clearContainersOnError: !0 });
    }, [ye, a, e, Oe]),
    {
      kind: a,
      host: s,
      port: u,
      username: f,
      sshAuthMethod: m,
      assetInstallMode: g,
      password: v,
      privateKeyPath: b,
      privateKeyPassphrase: S,
      wslDistro: w,
      wslUser: E,
      dockerContainer: O,
      manualDockerContainer: A,
      serverUrl: M,
      serverName: P,
      serverToken: I,
      serverWorkspacePath: R,
      sshConfigAliases: B,
      sshConfigAliasesLoading: H,
      sshConfigAliasesError: ne,
      selectedSshConfigAlias: ie,
      dockerAvailable: oe,
      wslDistros: ce,
      dockerContainers: ue,
      availableKinds: De,
      setKind: o,
      setHost: (e: string) => {
        (!Ce.current && ie && e !== s && ae(null), c(e));
      },
      setPort: (e: string) => {
        (!Ce.current && ie && e !== u && ae(null), d(e));
      },
      setUsername: (e: string) => {
        (!Ce.current && ie && e !== f && ae(null), p(e));
      },
      setSshAuthMethod: h,
      setAssetInstallMode: _,
      setPassword: y,
      setPrivateKeyPath: (e: string) => {
        (!Ce.current && ie && e !== b && ae(null), x(e));
      },
      setPrivateKeyPassphrase: C,
      setWslDistro: T,
      setWslUser: D,
      setDockerContainer: k,
      setManualDockerContainer: j,
      setServerUrl: N,
      setServerName: F,
      setServerToken: L,
      setServerWorkspacePath: z,
      refreshDockerContainers: () => Oe({ clearContainersOnError: !1 }),
      applySshConfigAlias: (e: SshConfigAlias) => {
        Ce.current = !0;
        try {
          ae(e.alias);
          let t = e.host?.trim() || e.alias,
            n = e.port != null && Number.isFinite(e.port) ? String(e.port) : ``,
            r = e.username?.trim() ?? ``,
            i = e.privateKeyPath?.trim() ?? ``;
          (c(t), d(n), p(r), y(``), x(i), C(``), h(i ? `privateKey` : `password`));
        } finally {
          Ce.current = !1;
        }
      },
      clearSelectedSshConfigAlias: () => {
        ae(null);
      },
      currentRuntimeOptionsLoading: a === `wsl` ? fe : a === `docker` ? _e : !1,
      currentRuntimeOptionsError: a === `wsl` ? he : a === `docker` ? xe : ``,
    }
  );
}

/** 原 hEt（当前 123747–123753）：剥离日志行时间戳/pid/方括号前缀 */
export function stripRemoteLogPrefixes(e: string) {
  return e
    .replace(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}\]\s*/u, ``)
    .replace(/^\[pid:\d+\]\s*/u, ``)
    .replace(/^(?:\[[^\]]+\]\s*)+/u, ``)
    .trim();
}

/** 原 gEt（当前 123754–123756，内部） */
function logIsDownloadProgress(e: string) {
  return /^download progress:/iu.test(e);
}

/** 原 _Et（当前 123757–123761，内部）：进度行分类（download | upload:路径:阶段 | null） */
function classifyProgressLogMessage(e: string) {
  if (logIsDownloadProgress(e)) return `download`;
  let t = /^upload progress(?: \[([^\]]+)\])?(?: \((.+)\))?:/iu.exec(e);
  return t ? `upload:${t[1]?.trim() ?? ``}:${t[2]?.trim() ?? ``}` : null;
}

/** 原 vEt（当前 123762–123784，内部）：同键进度行就地替换（保序追加） */
function mergeRemoteLogProgressEntry(e: ConnectionLogRow[], t: ConnectionLogRow) {
  let n = classifyProgressLogMessage(t.message);
  if (n) {
    let r = -1;
    for (let t = e.length - 1; t >= 0; --t) {
      let i = e[t];
      if (i && classifyProgressLogMessage(i.message) === n) {
        r = t;
        break;
      }
    }
    if (r >= 0) {
      let n = e[r];
      if (n)
        return [
          ...e.slice(0, r),
          ...e.slice(r + 1),
          { ...n, level: t.level, message: t.message, timestamp: t.timestamp },
        ];
    }
  }
  return [...e, { id: t.id, level: t.level, message: t.message, timestamp: t.timestamp }];
}

/** 原 yEt（当前 123785–123788，内部）：请求 id 过滤（空请求 id 全放行） */
function logEntryMatchesRequestId(e: { requestId?: string }, t: string | null | undefined) {
  let n = t?.trim();
  return n ? e.requestId?.trim() === n : !0;
}

/** 原 bEt（当前 123789–123837）：连接日志钩（订阅 onRemoteConnectionLog + 进度行去重） */
export function useRemoteConnectionLogs(e: string | null) {
  let t = usePlatformService(),
    n = React.useRef(e),
    [r, i] = React.useState<ConnectionLogRow[]>([]);
  return (
    React.useEffect(() => {
      n.current = e;
    }, [e]),
    React.useEffect(
      () =>
        t.onRemoteConnectionLog((e) => {
          if (!logEntryMatchesRequestId(e, n.current)) return;
          let t = stripRemoteLogPrefixes(e.message);
          t &&
            i((n) =>
              mergeRemoteLogProgressEntry(n, {
                id: `${e.label}-${e.timestamp}-${n.length}`,
                level: e.level,
                message: t,
                timestamp: e.timestamp,
              }),
            );
        }),
      [t],
    ),
    {
      connectionLogs: r,
      resetConnectionLogs: () => {
        i([]);
      },
      appendConnectionLog: (e: string, t: string) => {
        i((n) => [
          ...n,
          {
            id: `${Date.now()}-${n.length}`,
            level: e,
            message: t,
            timestamp: new Date().toLocaleTimeString(void 0, {
              hour12: !1,
              hour: `2-digit`,
              minute: `2-digit`,
              second: `2-digit`,
            }),
          },
        ]);
      },
    }
  );
}

/** 原 xEt（当前 123838–123867）：四步标题/描述文案（remote.*StepTitle/Description 键） */
export function resolveWizardStepCopy(e: IntlShape, t: WizardStep, n: RemoteKind): {
  title: string;
  description: string;
} {
  switch (t) {
    case `kind`:
      return {
        title: e.formatMessage({ id: `remote.kindStepTitle` }),
        description: e.formatMessage({ id: `remote.kindStepDescription` }),
      };
    case `settings`:
      return {
        title: e.formatMessage({ id: `remote.settingsStepTitle` }),
        description: e.formatMessage(
          { id: `remote.settingsStepDescription` },
          { method: e.formatMessage({ id: `remote.kind.${n}` }) },
        ),
      };
    case `connecting`:
      return {
        title: e.formatMessage({ id: `remote.connectingStepTitle` }),
        description: e.formatMessage(
          { id: `remote.connectingStepDescription` },
          { method: e.formatMessage({ id: `remote.kind.${n}` }) },
        ),
      };
    case `directory`:
      return {
        title: e.formatMessage({ id: `remote.selectDirectoryTitle` }),
        description: e.formatMessage({ id: `remote.selectDirectoryDescription` }),
      };
  }
}

/** 原 SEt（当前 123868–123928）：按 kind 校验并构建远程目标 */
export function validateAndBuildRemoteTarget(
  e: IntlShape,
  t: RemoteTargetFormState,
): { target?: RemoteTarget; errorMessage?: string } {
  switch (t.kind) {
    case `ssh`:
      if (!t.host || !t.username)
        return { errorMessage: e.formatMessage({ id: `ssh.validation.required` }) };
      if (t.sshAuthMethod === `password` && !t.password)
        return { errorMessage: e.formatMessage({ id: `ssh.validation.passwordRequired` }) };
      if (t.sshAuthMethod === `privateKey` && !t.privateKeyPath)
        return { errorMessage: e.formatMessage({ id: `ssh.validation.privateKeyRequired` }) };
      let n = t.selectedSshConfigAlias?.trim();
      return {
        target: {
          kind: `ssh`,
          host: t.host,
          port: t.port ? Number(t.port) : void 0,
          username: t.username,
          ...(n ? { sshConfigAlias: n } : {}),
          assetInstallMode: t.assetInstallMode,
          ...(t.sshAuthMethod === `password` && t.password ? { password: t.password } : {}),
          ...(t.sshAuthMethod === `privateKey` && t.privateKeyPath
            ? { privateKeyPath: t.privateKeyPath }
            : {}),
          ...(t.sshAuthMethod === `privateKey` && t.privateKeyPassphrase
            ? { privateKeyPassphrase: t.privateKeyPassphrase }
            : {}),
        },
      };
    case `docker`:
      let r = t.manualDockerContainer?.trim() || t.dockerContainer.trim();
      return r
        ? { target: { kind: `docker`, container: r } }
        : { errorMessage: e.formatMessage({ id: `docker.validation.required` }) };
    case `wsl`: {
      let n = t.wslUser?.trim();
      return n && !isValidWslUser(n)
        ? { errorMessage: e.formatMessage({ id: `wsl.validation.invalidUser` }) }
        : { target: { kind: `wsl`, distro: t.wslDistro || void 0, ...(n ? { user: n } : {}) } };
    }
    case `server`: {
      let n = t.serverUrl?.trim() ?? ``;
      if (!n) return { errorMessage: e.formatMessage({ id: `server.validation.urlRequired` }) };
      try {
        new URL(n);
      } catch {
        return { errorMessage: e.formatMessage({ id: `server.validation.invalidUrl` }) };
      }
      let r = t.serverName?.trim(),
        i = t.serverToken?.trim(),
        a = t.serverWorkspacePath?.trim();
      return {
        target: {
          kind: `server`,
          url: n,
          ...(r ? { name: r } : {}),
          ...(i ? { token: i } : {}),
          ...(a ? { workspacePath: a } : {}),
        },
      };
    }
  }
}

/** 原 CEt（当前 123929–123931）：ssh 目标附加选中资源包（vne = listFileTransferCapabilities） */
export function attachSelectedResourcePackages(e: RemoteTarget) {
  return e.kind === `ssh` ? { ...e, resourcePackages: { selectedPackageIds: listFileTransferCapabilities() } } : e;
}

/** 原 wEt（当前 123932–123934）：流活动（loading 或已连） */
export function isWizardFlowActive(e: { loading: boolean; connectedSessionId: string | null }) {
  return e.loading || !!e.connectedSessionId;
}

/** 原 TEt（当前 123935–123937） */
export function isWizardFlowIdle(e: { loading: boolean; connectedSessionId: string | null }) {
  return !isWizardFlowActive(e);
}

/** 原 EEt（当前 123938–123940）：连接结果 → 向导开合态 */
export function wizardResultToOpenState(e: "success" | "error"): { open: boolean; step: WizardStep } {
  return { open: !0, step: e === `success` ? `directory` : `connecting` };
}

/** 原 DEt（当前 123941–123945）：目录选择失败回退（会话仍在册 → directory，否则 settings） */
export function resolveDirectorySelectFallback(e: {
  sessionStillRegistered: boolean;
  connectedSessionId: string | null;
}): { connectedSessionId: string | null; step: WizardStep } {
  return e.sessionStillRegistered
    ? { connectedSessionId: e.connectedSessionId, step: `directory` }
    : { connectedSessionId: null, step: `settings` };
}

/* ============================================================================
 * 2. 隙段 b —— 四步骤组件（当前 127350–127942；台账原 127333–127925）
 * ==========================================================================*/

/** 原 eOt（当前 127350，邻接补录）：日志视图自动滚动贴底阈值（px） */
export const REMOTE_LOG_AUTOSCROLL_THRESHOLD_PX = 2;

/** 原 tOt（当前 127351–127353，邻接补录）：日志视图是否贴底 */
export function logViewIsScrolledToBottom(e: HTMLElement, t: number = REMOTE_LOG_AUTOSCROLL_THRESHOLD_PX) {
  return Math.max(0, e.scrollHeight - e.clientHeight) - e.scrollTop <= t;
}

/** 原 nOt（当前 127354–127356，邻接补录）：条件滚底 */
export function scrollLogViewToBottom(e: HTMLElement, t: boolean) {
  return t ? ((e.scrollTop = e.scrollHeight), !0) : !1;
}

/** 原 rOt（当前 127357–127509）：连接日志步（日志流 + 错误反馈卡 + 返回/重试） */
export function RemoteConnectingStep({
  kind: e,
  logs: t,
  errorMessage: n,
  loading: r,
  onBack: i,
  onRetry: a,
}: {
  kind: RemoteKind;
  logs: ConnectionLogRow[];
  errorMessage: string;
  loading: boolean;
  onBack: () => void;
  onRetry: () => void;
}) {
  let { intl: o } = useIntlContext(),
    s = usePlatformService(),
    c = useFeedbackStore((e) => e.openSubmit),
    u = React.useRef<HTMLDivElement>(null),
    d = React.useRef(!0),
    f = t.at(-1)?.id,
    p = t.at(-1)?.timestamp,
    m = React.useCallback(() => {
      let e = u.current;
      e && (d.current = logViewIsScrolledToBottom(e));
    }, []);
  React.useEffect(() => {
    let e = u.current;
    e && scrollLogViewToBottom(e, d.current) && (d.current = !0);
  }, [t.length, f, p]);
  let h = async () => {
    let r = await s.captureWindowScreenshot?.().catch(() => null);
    c({
      title:
        n.slice(0, 80) ||
        o.formatMessage({ id: `feedback.submit.template.section.remoteConnectFailed` }),
      type: `bug`,
      module: e === `ssh` ? `SSH连接失败` : e === `wsl` ? `WSL连接失败` : `Agent任务执行失败`,
      severity: `P2-中`,
      includeLogs: !0,
      description: buildRemoteConnectionFeedbackDescription(n, t, (e, t) => o.formatMessage({ id: e }, t)),
      screenshots: r ? [r] : [],
    });
  };
  return (
    <div className={`flex min-h-0 flex-1 flex-col gap-6 h-full`}>
      <div className={`flex flex-col flex-1 min-h-0 space-y-4`}>
        <div className={`min-h-0 flex-1 flex flex-col rounded-xl bg-background border border-border`}>
          <div className={`flex items-center justify-between border-b border-border px-4 py-3`}>
            <p className={`text-ui-base font-medium text-foreground`}>
              {o.formatMessage({ id: `remote.connectionLog` })}
            </p>
            {r ? (
              <div className={`flex items-center gap-2 text-ui-base text-foreground-subtle`}>
                <IconLoader className={`size-3.5 animate-spin`} />
                {o.formatMessage({ id: `remote.connecting` })}
              </div>
            ) : null}
          </div>
          <div
            ref={u}
            onScroll={m}
            className={`min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 font-mono text-ui-base`}
          >
            {t.length > 0
              ? t.map((e) => (
                  <div key={e.id} className={`w-full flex min-w-0 leading-5 text-foreground`}>
                    <span className={`text-foreground-subtlest`}>{e.timestamp}</span>
                    <span
                      className={cn(
                        `mx-2`,
                        e.level === `success`
                          ? `text-success`
                          : e.level === `warn`
                            ? `text-warning`
                            : e.level === `error`
                              ? `text-destructive`
                              : `text-foreground-subtle`,
                      )}
                    >
                      {[`[`, e.level.toUpperCase(), `]`]}
                    </span>
                    <span>{e.message}</span>
                  </div>
                ))
              : (
                <div className={`flex min-h-full items-center justify-center text-foreground-subtle`}>
                  <span>{[`[INFO] `, o.formatMessage({ id: `remote.connectionLogEmpty` })]}</span>
                </div>
              )}
          </div>
        </div>
        {n ? (
          <div
            data-testid={sshErrorTestid}
            className={`flex flex-wrap items-start gap-3 rounded-xl border border-warning/30 px-4 py-3 text-ui-base text-warning`}
          >
            <IconTriangleAlert className={`mt-0.5 size-4 shrink-0`} />
            <span className={`min-w-0 flex-1`}>{n}</span>
            <Button
              type={`button`}
              variant={`outline`}
              size={`sm`}
              onClick={() => {
                h();
              }}
              className={`h-7 shrink-0 border-warning/30 text-warning hover:bg-warning/10`}
            >
              {o.formatMessage({ id: `remoteConnection.feedback` })}
            </Button>
          </div>
        ) : null}
      </div>
      <div className={`flex justify-end gap-3`}>
        <Button
          type={`button`}
          variant={`secondary`}
          size={`lg`}
          className={`h-10 min-w-0 px-5`}
          onClick={i}
          disabled={r}
        >
          {o.formatMessage({ id: `common.back` })}
        </Button>
        <Button
          type={`button`}
          size={`lg`}
          className={`h-10 min-w-0 px-5`}
          onClick={a}
          disabled={r}
        >
          {r
            ? o.formatMessage({ id: `remote.connecting` })
            : o.formatMessage({ id: `remote.retryConnection` })}
        </Button>
      </div>
    </div>
  );
}

/** 原 iOt（当前 127510–127526，内部）：反馈工单描述模板（近 30 行日志 + 环境提示） */
function buildRemoteConnectionFeedbackDescription(
  e: string,
  t: ConnectionLogRow[],
  n: (key: string, values?: Record<string, unknown>) => string,
) {
  let r = t
    .slice(-30)
    .map((e) => `${e.timestamp} [${e.level.toUpperCase()}] ${e.message}`)
    .join(`
`);
  return [
    n(`feedback.submit.template.section.remoteHeading`),
    ``,
    n(`feedback.submit.template.section.errorSummary`),
    e || n(`feedback.submit.template.section.notProvided`),
    ``,
    n(`feedback.submit.template.section.remoteLog`),
    r || n(`feedback.submit.template.section.remoteLogEmpty`),
    ``,
    n(`feedback.submit.template.section.remoteEnvironment`),
    n(`feedback.submit.template.section.supplement`),
  ].join(`
`);
}

/** 原 aOt（当前 127527–127538，内部）：连接类型 → 图标 */
function remoteKindIcon(e: RemoteKind) {
  switch (e) {
    case `ssh`:
      return IconServer;
    case `server`:
      return IconCloud;
    case `docker`:
      return IconMonitorCog;
    case `wsl`:
      return IconTerminal;
  }
}

/** 原 oOt（当前 127539–127615）：类型步（四卡选择 + 取消/下一步） */
export function RemoteKindStep({
  kind: e,
  availableKinds: t,
  onKindChange: n,
  onCancel: r,
  onNext: i,
}: {
  kind: RemoteKind;
  availableKinds: RemoteKind[];
  onKindChange: (v: RemoteKind) => void;
  onCancel: () => void;
  onNext: () => void;
}) {
  let { intl: a } = useIntlContext();
  return (
    <div className={`flex min-h-0 flex-1 flex-col gap-6 h-full`}>
      <div className={`flex-1 min-h-0 grid content-start gap-3 md:grid-cols-2`}>
        {t.map((t) => {
          let KindIcon = remoteKindIcon(t),
            i = e === t;
          return (
            <button
              key={t}
              type={`button`}
              onClick={() => n(t)}
              data-testid={
                t === `ssh`
                  ? remoteKindSshTestid
                  : t === `server`
                    ? remoteKindServerTestid
                    : t === `wsl`
                      ? remoteKindWslTestid
                      : remoteKindDockerTestid
              }
              className={cn(
                `flex min-h-32 flex-col items-start gap-4 rounded-2xl border p-4 text-left transition-colors`,
                i
                  ? `border-border-hover bg-selected`
                  : `border-border bg-card hover:border-border-hover hover:bg-surface`,
              )}
            >
              <div
                className={cn(
                  `flex size-10 items-center justify-center rounded-xl border`,
                  i
                    ? `border-primary bg-primary text-primary-foreground`
                    : `border-border bg-background-alt text-foreground-subtle`,
                )}
              >
                <KindIcon className={`size-5`} />
              </div>
              <div className={`min-w-0 space-y-1`}>
                <p className={`text-ui-lg font-medium text-foreground`}>
                  {a.formatMessage({ id: `remote.kind.${t}` })}
                </p>
                <p className={`text-ui-base leading-5 text-foreground-subtle`}>
                  {a.formatMessage({ id: `remote.kind.${t}.wizardDescription` })}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <div className={`flex gap-3 justify-end`}>
        <Button type={`button`} variant={`secondary`} size={`lg`} className={`h-10 min-w-0 px-5`} onClick={r}>
          {a.formatMessage({ id: `common.cancel` })}
        </Button>
        <Button type={`button`} size={`lg`} className={`h-10 min-w-0 px-5`} onClick={i}>
          {a.formatMessage({ id: `common.next` })}
          <IconChevronRight className={`size-4`} />
        </Button>
      </div>
    </div>
  );
}

/** sOt 入参（原 127616–127667 解构面） */
interface RemoteSettingsStepProps {
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
  dockerAvailable: boolean | null;
  sshConfigAliases: SshConfigAlias[];
  sshConfigAliasesLoading: boolean;
  sshConfigAliasesError: string;
  selectedSshConfigAlias: string | null;
  currentRuntimeOptionsLoading: boolean;
  currentRuntimeOptionsError: string;
  remoteWorkspaceSessions?: RemoteWorkspaceSessionLike[];
  validationMessage?: string;
  loading: boolean;
  onBack: () => void;
  onHostChange: (v: string) => void;
  onPortChange: (v: string) => void;
  onUsernameChange: (v: string) => void;
  onSshAuthMethodChange: (v: "password" | "privateKey") => void;
  onAssetInstallModeChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onPrivateKeyPathChange: (v: string) => void;
  onPrivateKeyPassphraseChange: (v: string) => void;
  onWslDistroChange: (v: string) => void;
  onWslUserChange: (v: string) => void;
  onDockerContainerChange: (v: string) => void;
  onManualDockerContainerChange: (v: string) => void;
  onServerUrlChange: (v: string) => void;
  onServerNameChange: (v: string) => void;
  onServerTokenChange: (v: string) => void;
  onServerWorkspacePathChange: (v: string) => void;
  onDockerContainersRefresh: () => void;
  onApplySshConfigAlias: (alias: SshConfigAlias) => void;
  onClearSelectedSshConfigAlias: () => void;
  onConnect: () => void;
}

/** 原 sOt（当前 127616–127781）：设置步壳（内嵌 REt + 运行时错误横幅 + 返回/连接脚部） */
export function RemoteSettingsStep({
  kind: e,
  host: t,
  port: n,
  username: r,
  sshAuthMethod: i,
  assetInstallMode: a,
  password: o,
  privateKeyPath: s,
  privateKeyPassphrase: c,
  wslDistro: l,
  wslUser: u = ``,
  wslDistros: d,
  dockerContainer: f,
  manualDockerContainer: p,
  serverUrl: m,
  serverName: h,
  serverToken: g,
  serverWorkspacePath: _,
  dockerContainers: v,
  dockerAvailable: y,
  sshConfigAliases: b,
  sshConfigAliasesLoading: x,
  sshConfigAliasesError: S,
  selectedSshConfigAlias: C,
  currentRuntimeOptionsLoading: w,
  currentRuntimeOptionsError: T,
  remoteWorkspaceSessions: E = [],
  validationMessage: D,
  loading: O,
  onBack: k,
  onHostChange: A,
  onPortChange: j,
  onUsernameChange: M,
  onSshAuthMethodChange: P,
  onAssetInstallModeChange: F,
  onPasswordChange: I,
  onPrivateKeyPathChange: L,
  onPrivateKeyPassphraseChange: R,
  onWslDistroChange: z,
  onWslUserChange: B,
  onDockerContainerChange: V,
  onManualDockerContainerChange: H,
  onServerUrlChange: ee,
  onServerNameChange: U,
  onServerTokenChange: te,
  onServerWorkspacePathChange: ne,
  onDockerContainersRefresh: re,
  onApplySshConfigAlias: ie,
  onClearSelectedSshConfigAlias: ae,
  onConnect: oe,
}: RemoteSettingsStepProps) {
  let { intl: se } = useIntlContext();
  return (
    <div className={`flex min-h-0 flex-1 flex-col gap-6 h-full`}>
      <div
        data-testid={`remote-connection-settings-scroll`}
        className={`flex-1 min-h-0 space-y-4 overflow-y-auto pr-1`}
      >
        {T ? (
          <div
            className={`flex items-start gap-3 rounded-2xl border border-warning bg-warning px-4 py-3 text-ui-base text-warning-foreground`}
          >
            <IconTriangleAlert className={`mt-0.5 size-4 shrink-0`} />
            <span>{se.formatMessage({ id: `remote.optionsLoadFailed` })}</span>
          </div>
        ) : null}
        <RemoteSettingsForm
          kind={e}
          host={t}
          port={n}
          username={r}
          sshAuthMethod={i}
          assetInstallMode={a}
          password={o}
          privateKeyPath={s}
          privateKeyPassphrase={c}
          wslDistro={l}
          wslUser={u}
          wslDistros={d}
          dockerContainer={f}
          manualDockerContainer={p}
          serverUrl={m}
          serverName={h}
          serverToken={g}
          serverWorkspacePath={_}
          dockerContainers={v}
          dockerAvailable={y as boolean | undefined}
          sshConfigAliases={b}
          sshConfigAliasesLoading={x}
          sshConfigAliasesError={S}
          selectedSshConfigAlias={C}
          runtimeOptionsLoading={w}
          remoteWorkspaceSessions={E}
          applySshConfigAlias={ie}
          clearSelectedSshConfigAlias={ae}
          setHost={A}
          setPort={j}
          setUsername={M}
          setSshAuthMethod={P}
          setAssetInstallMode={F}
          setPassword={I}
          setPrivateKeyPath={L}
          setPrivateKeyPassphrase={R}
          setWslDistro={z}
          setWslUser={B}
          setDockerContainer={V}
          setManualDockerContainer={H}
          setServerUrl={ee}
          setServerName={U}
          setServerToken={te}
          setServerWorkspacePath={ne}
          refreshDockerContainers={re}
        />
      </div>
      <div className={`flex items-center justify-end gap-3`}>
        {D ? (
          <div className={`flex flex-1 min-w-0 items-center gap-2`}>
            <IconTriangleAlert className={`size-4 shrink-0 text-warning`} />
            <span className={`text-warning`}>{D}</span>
          </div>
        ) : null}
        <div className={`flex shrink-0 justify-end gap-3`}>
          <Button
            type={`button`}
            variant={`secondary`}
            size={`lg`}
            className={`h-10 min-w-0 px-5`}
            onClick={k}
            disabled={O}
          >
            {se.formatMessage({ id: `common.back` })}
          </Button>
          <Button
            type={`button`}
            size={`lg`}
            className={`h-10 min-w-0 px-5`}
            onClick={oe}
            disabled={O}
          >
            {O ? (
              <>
                <IconLoader className={`size-4 animate-spin`} />
                {se.formatMessage({ id: `remote.connecting` })}
              </>
            ) : (
              se.formatMessage({ id: `remote.startConnection` })
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** cOt 入参（原 127782–127801 解构面；服务类型取自 Modals 导出组件的 prop 面） */
type DirectoryBrowserServices = React.ComponentProps<typeof DirectoryBrowserDialog>["services"];
type RemoteSyncDialogsProps = React.ComponentProps<typeof RemoteSyncDialogs>;
interface RemoteDirectoryStepProps {
  services: DirectoryBrowserServices | null;
  remoteTarget: RemoteSyncDialogsProps["remoteTarget"];
  localSkillSyncService: RemoteSyncDialogsProps["localSkillSyncService"];
  remoteSkillSyncService: RemoteSyncDialogsProps["remoteSkillSyncService"];
  localMcpSyncService: RemoteSyncDialogsProps["localMcpSyncService"];
  remoteMcpSyncService: RemoteSyncDialogsProps["remoteMcpSyncService"];
  localPluginSyncService: RemoteSyncDialogsProps["localPluginSyncService"];
  remotePluginSyncService: RemoteSyncDialogsProps["remotePluginSyncService"];
  localZCodeAgentService: RemoteSyncDialogsProps["localZCodeAgentService"];
  remoteZCodeAgentService: RemoteSyncDialogsProps["remoteZCodeAgentService"];
  localWorkspacePath?: string;
  selecting?: boolean;
  onSelect: (path: string) => void;
  onBack: () => void;
  onCancel: () => void;
  onSkillsSynced?: () => Promise<void> | void;
  onMcpSynced?: () => Promise<void> | void;
  onPluginsSynced?: () => Promise<void> | void;
}

/** 原 cOt（当前 127782–127942）：目录步（内嵌 MEt embedded + 三同步卡 + 加载回退态） */
export function RemoteDirectoryStep({
  services: e,
  remoteTarget: t,
  localSkillSyncService: n,
  remoteSkillSyncService: r,
  localMcpSyncService: i,
  remoteMcpSyncService: a,
  localPluginSyncService: o,
  remotePluginSyncService: s,
  localZCodeAgentService: c,
  remoteZCodeAgentService: l,
  localWorkspacePath: u,
  selecting: d = !1,
  onSelect: f,
  onBack: p,
  onCancel: m,
  onSkillsSynced: h,
  onMcpSynced: g,
  onPluginsSynced: _,
}: RemoteDirectoryStepProps) {
  let { intl: v } = useIntlContext(),
    [y, b] = React.useState(``),
    [x, S] = React.useState(!1),
    [C, w] = React.useState(!1),
    [T, E] = React.useState(!1),
    D = canOpenRemoteSessionSourceCheck({
      remoteSessionId: t ? `directory-step` : null,
      remoteTarget: t,
      clientMode: `desktop-continuous`,
      hasLocalSourceService: !!(n || i || o),
    }),
    O = !!(D && n && r),
    k = !!(D && i && a),
    A = !!(D && o && s);
  return e ? (
    <div className={`flex min-h-0 flex-1 flex-col gap-6 h-full`} aria-busy={d}>
      <div className={`flex flex-col flex-1 min-h-0 space-y-4`}>
        <div
          className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border border-success bg-success px-4 py-3 text-ui-base text-success-foreground`}
        >
          <span>{v.formatMessage({ id: `remote.success` })}</span>
          <RemoteSyncDropdownButton
            canSyncSkills={O}
            canSyncMcp={k}
            canSyncPlugins={A}
            mcpDisabled={!y.trim()}
            onOpenSkillSync={() => S(!0)}
            onOpenMcpSync={() => w(!0)}
            onOpenPluginSync={() => E(!0)}
          />
        </div>
        <div className={cn(`min-h-0 flex flex-1 overflow-hidden`, d ? `pointer-events-none opacity-70` : ``)}>
          <DirectoryBrowserDialog services={e} embedded={!0} onSelect={f} onCancel={m} onPathChange={b} />
        </div>
      </div>
      <div className={`flex items-center justify-end gap-3`}>
        <Button
          type={`button`}
          variant={`secondary`}
          size={`lg`}
          className={`h-10 min-w-0 px-5`}
          onClick={p}
          disabled={d}
        >
          {v.formatMessage({ id: `common.back` })}
        </Button>
        <Button
          type={`button`}
          size={`lg`}
          className={`h-10 min-w-0 px-5`}
          onClick={() => y && !d && f(y)}
          disabled={!y || d}
        >
          {d ? (
            <>
              <IconLoader className={`size-4 animate-spin`} />
              {v.formatMessage({ id: `common.loading` })}
            </>
          ) : (
            v.formatMessage({ id: `directoryBrowser.selectDir` })
          )}
        </Button>
      </div>
      <RemoteSyncDialogs
        canSyncSkills={O}
        canSyncMcp={k}
        canSyncPlugins={A}
        skillOpen={x}
        mcpOpen={C}
        pluginOpen={T}
        onSkillOpenChange={S}
        onMcpOpenChange={w}
        onPluginOpenChange={E}
        localSkillSyncService={n}
        remoteSkillSyncService={r}
        localMcpSyncService={i}
        remoteMcpSyncService={a}
        localPluginSyncService={o}
        remotePluginSyncService={s}
        localZCodeAgentService={c}
        remoteZCodeAgentService={l}
        remoteTarget={t}
        skillWorkspacePath={``}
        mcpWorkspacePath={y.trim()}
        pluginWorkspacePath={y.trim()}
        pluginLocalWorkspacePath={u}
        mcpLocalWorkspacePath={u}
        onSkillsSynced={async () => {
          await h?.();
        }}
        onMcpSynced={async () => {
          await g?.();
        }}
        onPluginsSynced={async () => {
          await _?.();
        }}
      />
    </div>
  ) : (
    <div className={`flex min-h-0 flex-1 flex-col gap-6 h-full`}>
      <div
        className={`flex min-h-[22rem] flex-1 items-center justify-center rounded-2xl border border-border bg-card text-ui-base text-foreground-subtle`}
      >
        <IconLoader className={`mr-2 size-4 animate-spin`} />
        {v.formatMessage({ id: `common.loading` })}
      </div>
      <div className={`flex justify-end gap-3`}>
        <Button
          type={`button`}
          variant={`secondary`}
          size={`lg`}
          className={`h-10 min-w-0 w-32`}
          onClick={p}
        >
          {v.formatMessage({ id: `common.back` })}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================================
 * 五、符号表（文件尾总表）
 * ----------------------------------------------------------------------------
 * | 原符号 | 语义名 | 当前 js 行 | 原（台账） | jsx 行 | 状态 | 把握度 |
 * |---|---|---|---|---|---|---|
 * | dEt | probeDockerAvailability | 123513–123521 | 123496–123504 | — | 邻接补录，逐字 | 高 |
 * | fEt | resolveCurrentDockerContainer | 123522–123525 | 123505–123508 | 105244 | 逐字 | 高 |
 * | pEt | listAvailableRemoteKinds | 123526–123534 | 123509–123517 | 105251 | 逐字 | 高 |
 * | mEt | useRemoteWizardState | 123535–123746 | 123518–123729 | 105255 | 全量逐行 | 高 |
 * | hEt | stripRemoteLogPrefixes | 123747–123753 | 123730–123736 | 105441 | 逐字 | 高 |
 * | gEt | logIsDownloadProgress | 123754–123756 | 123737–123739 | — | 内部，逐字 | 高 |
 * | _Et | classifyProgressLogMessage | 123757–123761 | 123740–123744 | — | 内部，逐字 | 高 |
 * | vEt | mergeRemoteLogProgressEntry | 123762–123784 | 123745–123767 | — | 内部，逐字 | 高 |
 * | yEt | logEntryMatchesRequestId | 123785–123788 | 123768–123771 | — | 内部，逐字 | 高 |
 * | bEt | useRemoteConnectionLogs | 123789–123837 | 123772–123820 | 105484 | 全量逐行 | 高 |
 * | xEt | resolveWizardStepCopy | 123838–123867 | 123821–123850 | 105519 | 全量逐行 | 高 |
 * | SEt | validateAndBuildRemoteTarget | 123868–123928 | 123851–123911 | 105567 | 全量逐行 | 高 |
 * | CEt | attachSelectedResourcePackages | 123929–123931 | 123912–123914 | 105674 | 逐字 | 高 |
 * | wEt | isWizardFlowActive | 123932–123934 | 123915–123917 | 105682 | 逐字 | 高 |
 * | TEt | isWizardFlowIdle | 123935–123937 | 123918–123920 | 105685 | 逐字 | 高 |
 * | EEt | wizardResultToOpenState | 123938–123940 | 123921–123923 | 105688 | 逐字 | 高 |
 * | DEt | resolveDirectorySelectFallback | 123941–123945 | 123924–123928 | 105694 | 逐字 | 高 |
 * | eOt | REMOTE_LOG_AUTOSCROLL_THRESHOLD_PX | 127350 | 127333 | — | 邻接补录，逐字 | 高 |
 * | tOt | logViewIsScrolledToBottom | 127351–127353 | 127334–127336 | — | 邻接补录，逐字 | 高 |
 * | nOt | scrollLogViewToBottom | 127354–127356 | 127337–127339 | — | 邻接补录，逐字 | 高 |
 * | rOt | RemoteConnectingStep | 127357–127509 | 127340–127492 | 107685 | 全量逐行 | 高 |
 * | iOt | buildRemoteConnectionFeedbackDescription | 127510–127526 | 127493–127509 | — | 内部，逐字 | 高 |
 * | aOt | remoteKindIcon | 127527–127538 | 127510–127521 | — | 内部，逐字 | 高 |
 * | oOt | RemoteKindStep | 127539–127615 | 127522–127598 | 107764 | 全量逐行 | 高 |
 * | sOt | RemoteSettingsStep | 127616–127781 | 127599–127764 | 107792 | 全量逐行 | 高 |
 * | cOt | RemoteDirectoryStep | 127782–127942 | 127765–127925 | 107859 | 全量逐行 | 高 |
 *
 * 类型层注记（零运行时影响）：
 *  1. useState/useRef 泛型参数（<RemoteKind>、<SshConfigAlias[]>、<string | null>、
 *     <boolean | null>、<WslDistroRef[]>、<DockerContainerRef[]>、<number | null>、
 *     <ConnectionLogRow[]>、<HTMLDivElement>）——strict 推断垫片。
 *  2. RemoteSettingsStep 传 REt 的 dockerAvailable={y as boolean | undefined}——
 *     原件直传 boolean|null；REt 以 `=== false` 消费，null/undefined 行为同一。
 *  3. oOt 卡片图标局部名 r → KindIcon（JSX 组件位需大写标识符，结构零变）。
 *  4. applySshConfigAlias/appendConnectionLog 及 setHost/setPort/setUsername/
 *     setPrivateKeyPath 参数类型标注（原隐式；返回面对象处逗号表达式内无上下文推断）。
 * ==========================================================================*/
