// A0-S4-3: 自 modules/StoresDeep.tsx §D 原样迁入（Z0t HooksStore 深层助手；原文件现为薄 re-export shim）。
/* ============================================================================
 * §D. Z0t HooksStore 深层助手（原 js 201185–201243）
 * ==========================================================================*/

export interface HookDescriptor {
  id: string;
  event: string;
  matcher?: string;
  type: string;
  command: string;
  args?: string[];
  async?: boolean;
  shell?: string | boolean;
  statusMessage?: string;
  timeout: number;
  enabled: boolean;
  custom?: Record<string, unknown>; // A0-CLEANUP3 3b：按消费面（customJsonOf/HookItem.custom）收敛
  location?: { source: string; scope: string; directoryPath: string; projectPath?: string };
  [key: string]: unknown;
}

export interface HooksService {
  loadHooks(args: { workspacePath: string; workspaceIdentity?: string }): Promise<{ hooks: HookDescriptor[] }>;
  saveHooks(args: { workspacePath: string; workspaceIdentity?: string; hooks: HookDescriptor[] }): Promise<void>;
}

/* ── tombstone〔A1-R186〕死界面普查批第五批（stores/hooksHelpers.ts：1 面／7 行，本批该文件共 1 碑）：本地 interface HooksStoreSnapshot@28-34（7 行）纯删，7 行等行墓碑在原位。
 *    判据〔A1-R176 立／A1-R183 v7／A1-R184 v8〕：一面为死当且仅当 Ⓐ本文件内无代码位读者落在其自身定义跨度之外，且 Ⓑ不带 export（或带 export 而无一家导入方把该名作 specifier 拉取）；级联＝读者全落在已判死之面内者亦判死，迭代至不动点（本批 3 轮收敛，全树 1924 面中得死面 66）。量测一律用 token 级 code-only 掩码 v8（单点模块导入、13 形自检 + 9 负对照），禁行首前缀法〔A1-R174 沉淀①〕。
 *    interface HooksStoreSnapshot：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；未 export ⇒ 跨文件读者结构性不可能。
 *    同名定义站：HooksStoreSnapshot 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。
 *    型-only 批：interface 与 type 别名皆非台账对象〔A1-R164 登记〕⇒ 台账 588/571/510 不得变动（反向哨兵：若变动即证动了 declare、须立即停批核查）；esbuild 擦除全部型构造 ⇒ 三 bundle 必逐字节全等〔A1-R173 沉淀③／A1-R174 沉淀⑥，可用于预测〕。
 *    原界面共 7 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    净零行：本碑 7 行置换原 7 行，文件行数 121 不变、零重锚（本文件 hooksHelpers 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 41 条（原始发射 41）；带行号之记录 41 条**皆在**首个编辑点 @28 之前 ⇒ 位移不证伪任何引证，仍照本批工艺一律强制净零行）。★口径须自载：六形係**下界**——R185 查出第七形「Name 型面（NNN）」，本批之骑手网另以 P0 裸名谓词兜底；两口径同判「净零行强制」故结论不受影响〔A1-R173 沉淀⑧〕。 ── */

/** 原 K0t（201185）：钩子工作区键（身份优先） */
export function hooksWorkspaceKey(workspacePath: string, workspaceIdentity: string | null): string {
  return workspaceIdentity?.trim() || workspacePath;
}

/** 原 q0t（201188）：按作用域生成位置描述（project 带 projectPath；user 无目录） */
export function hookLocationForScope(
  workspacePath: string,
  scope: string = "user",
): HookDescriptor["location"] {
  return scope === "project"
    ? { source: "zcode", scope: "project", directoryPath: "", projectPath: workspacePath }
    : { source: "zcode", scope: "user", directoryPath: "" };
}

/** 原 _9（201193）：钩子是否可编辑（无位置 或 zcode 来源） */
export function isHookEditable(hook: HookDescriptor): boolean {
  return !hook.location || hook.location.source === "zcode";
}

/** 原 J0t（201196）：由草稿构造新钩子（随机 id；process 带 args；command 可选 async/shell；timeout 缺省 60） */
export function buildNewHook(draft: Partial<HookDescriptor> & { storageLevel?: string }, workspacePath: string): HookDescriptor {
  return {
    id: `hook-${crypto.randomUUID()}`,
    event: draft.event as string,
    matcher: draft.matcher,
    type: draft.type as string,
    command: draft.command as string,
    ...(draft.type === "process" ? { args: draft.args ?? [] } : {}),
    ...(draft.type === "command" && draft.async !== undefined ? { async: draft.async } : {}),
    ...(draft.type === "command" && draft.shell !== undefined ? { shell: draft.shell } : {}),
    ...(draft.statusMessage ? { statusMessage: draft.statusMessage } : {}),
    timeout: draft.timeout ?? 60,
    enabled: draft.enabled ?? true,
    custom: draft.custom,
    location: hookLocationForScope(workspacePath, draft.storageLevel),
  };
}

/** 原 Y0t（201213）：合并钩子补丁（args/async/shell 按类型条件化；enabled 缺省保持） */
export function mergeHookPatch(hook: HookDescriptor, patch: Partial<HookDescriptor>): HookDescriptor {
  return {
    ...hook,
    event: patch.event as string,
    matcher: patch.matcher,
    type: patch.type as string,
    command: patch.command as string,
    args: patch.type === "process" ? patch.args ?? [] : undefined,
    async: patch.type === "command" ? patch.async : undefined,
    shell: patch.type === "command" ? patch.shell : undefined,
    statusMessage: patch.statusMessage,
    timeout: patch.timeout ?? 60,
    enabled: patch.enabled ?? hook.enabled,
    custom: patch.custom,
  };
}

/** 原 X0t（201229）：重载钩子列表（落盘工作区键） */
export async function reloadHooks(
  get: () => { workspacePath: string | null; workspaceIdentity: string | null },
  set: (partial: { hooks?: HookDescriptor[]; loadedWorkspaceKey?: string | null }) => void,
  service: HooksService,
): Promise<void> {
  const { workspacePath, workspaceIdentity } = get();
  if (workspacePath) {
    set({
      hooks: (await service.loadHooks({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}) })).hooks,
      loadedWorkspaceKey: hooksWorkspaceKey(workspacePath, workspaceIdentity),
    });
  }
}

/** 原 v9（201238）：落盘（无工作区抛错；成功后重载；失败抛出供乐观更新回滚） */
export async function saveHooksList(
  hooks: HookDescriptor[],
  get: () => { workspacePath: string | null; workspaceIdentity: string | null },
  set: (partial: { hooks?: HookDescriptor[]; loadedWorkspaceKey?: string | null }) => void,
  service: HooksService,
): Promise<void> {
  const { workspacePath, workspaceIdentity } = get();
  if (!workspacePath) throw new Error("No workspace path set");
  await service.saveHooks({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}), hooks });
  await reloadHooks(get, set, service);
}

