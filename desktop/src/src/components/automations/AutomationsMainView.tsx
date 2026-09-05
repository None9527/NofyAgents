// A0-S4-4a: 自 modules/ExtendedViews.tsx §6 AutomationsMain 视图态（F15，d6 视图态）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §0 声明群子集（随族复制，ambient 编译期擦除；图标常量留守原文件，经 import 取回）+ §6 全段（4948–6609）。导入路径按 components/automations/ 深度改指 ../../modules/ / ../ui/。
import * as React from "react";
import { ShadcnTooltipProvider as PopoverRoot } from '../../modules/UsageStatsUiParts'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { LoaderCircle as SpinnerIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button, createLucideIcon } from '../../modules/button';
import { Popover, PopoverContent, PopoverTrigger, toast, type ToastOptions, usePlatformService } from '../../modules/ImeComposition'; // ToastOptions 原属 imeComposition chunk（与 toast 同主）；〔A1-R46〕+usePlatformService（活面 declare 改指，canonical ImeComposition@186，R45 既判；型交叉检查见 A1-R46.report.md §二）
import { AutomationEditor, OffPeakTaskEditor, type ScheduleRule } from '../../modules/SettingsLeaves'; // A0-CLEANUP3 3b：Automation 三型 scheduleRule 统一
import { logger } from '../../modules/SkillStore';
import { providerIds } from '../../modules/SrcSharedA';
import { automationsWorkspaceKey, parseCustomModelRef as parseModelString, isAutomationCreateLimitError as isCreateLimitError, OFFPEAK_IDLE_PLAN_ID as OFFPEAK_TELEMETRY_DEFAULT_PROVIDER } from '../../modules/SrcSharedB'; // 〔A1-R119〕+parseCustomModelRef（束 MNt@138580 消费面实调 Zn 非 Mg——旧注勘误；R105 canonical）/isAutomationCreateLimitError（原 ri ≡ src et 导出 ≡ hx@8733 ≡ SrcSharedB@5344 逐字）/OFFPEAK_IDLE_PLAN_ID（原 vee ← src 5357，R106 判例）
import { useModelProvidersStore as useModelProviderRegistry, useCodingPlanEntitlements as useEntitlements, useCodingPlanUpgradeDialog as useCodingPlanUpgrade } from '../../modules/PaymentDeep'; // 〔A1-R120〕modelMenuGroupsOf/filterUsableProviders/PaymentModelProvider 随 AMt 孪生归一删（唯一消费面为下方删体；R29 碑文留史） // 〔A1-R119〕+useModelProvidersStore/useCodingPlanEntitlements/useCodingPlanUpgradeDialog（原 qq/sX/fX 族 declare 改指；R109/R111/R43 判例，别名保留调用名） // 〔A1-R29〕Hq 77850 / N6e 77910 canonical + 型缝型别：两 declare 收敛改指，见下墓碑。环安全：PaymentDeep shim 值闭包不达 components/automations
/* ── tombstone〔A1-R120〕：import type EntitlementSnapshot as UsageEntitlementSnapshot（R29 型缝所依）删除——
 *    唯一消费面 = 本批删除的 AMt A0 语义孪生体内 cast。 ── */
import type { ModelCatalogEntryLike } from '../../modules/Home';
import { buildCodingPlanFunnelContext as buildIdleUpgradeFunnelContext, resolveEntryPlanState, isRemoteWorkspaceTab as isRemoteScopedTab } from '../../modules/Home'; // 〔A1-R119〕原 FM/LM/zMt declare 改指（R26/R42/R107 canonical；别名保留调用名） // 〔A1-R24〕zrt 197021 面联动：ModelProviderInfo.models 型缝所依
import { reportTelemetry, type TelemetryPlatform } from '../../modules/StoresDeep'; // A0-CLEANUP3 3b：遥测助手形参具型
import { useServices } from '../../modules/services';
import { useAutomationsStore, useOffPeakTaskStore } from '../../modules/stores-tasks'; // A1-R9 bX 接线改指：本地死 declare 删除 → 真实 import（canonical = components/shell/Home.tsx 641 区 bX@91416，经 stores/offPeakTaskStore shim 链）；tombstone 见原声明位
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n'; // 〔A1-R119〕原 G（IntlProvider D@9248–9252）declare 改指（R1/R116 判例，别名保留调用名）
import { useAppSettings as useSettingsSnapshot } from '../../modules/UsageDeep'; // 〔A1-R119〕原 JM 族 declare 改指（canonical UsageDeep@1745，R11 判例〔A1-R168 勘误：旧引 1730 行漂 +15〕；返回面 {settings, loading, update, ...} 超集兼容）
import { useWorkspaceTabStore, isWorkspaceKindTab as isWorkspaceTabUsable } from '../../modules/WorkspaceTabsDeep'; // 〔A1-R119〕原 pc/oc declare 改指（R107/R2 判例；别名保留调用名）
import { useConfirmDialog } from '../../modules/Modals'; // 〔A1-R119〕原 U2（styles 123510）declare 改指（R5/R6 ConfirmDialog canonical 判例）
import { OffPeakTaskList, buildAutomationModelSelectGroups, automationNextRunLabel as describeAutomationNextRun } from './AutomationsMain'; // 〔A1-R119〕原 cMt declare 改指 R113 逐字实体 // 〔A1-R120〕+buildAutomationModelSelectGroups/automationNextRunLabel（AMt/egt 孪生归一；$ht/$$ 直进 describeAutomationNextRun 体内随归一删）
/* ── tombstone〔A1-R120〕：import schedulePreviewText/cronPreviewText（R119 改指所依）删除——唯一消费面
 *    describeAutomationFrequency A0 语义重建体本批归一删除（束 d6 139541 直调 rgt 实证 → 改指 formatCronSchedule）。 ── */
import { formatCronSchedule as describeAutomationFrequency } from '../conversation/AutomationCards'; // 〔A1-R120〕原 rgt 归一：describeAutomationFrequency A0 语义重建体删改指 R96 逐字实体（束 d6 139541 a = rgt(e, o) 实证；R119 ngt 保真修复经 formatCronSchedule 体内 scheduleRuleToPreviewModel 续在案）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // 原 Ia（A0-CLEANUP 族清理：本地 Tooltip declare 改指 InfoTooltip）
import {
  IconChevronDown,
  IconRefreshCw,
  IconTrash2,
  IconSquare,
  IconPencil,
  IconAlertTriangle,
  IconMoon,
  IconCircleCheck,
  IconCircleStop,
  IconCirclePlay,
  IconPlay,
  IconPlus,
  IconClock,
  IconEllipsis,
  IconExternalLink,
  IconRotateCcw,
  IconTarget,
  IconActivity,
  IconFileText,
  IconList,
  IconListChecks,
  IconSlidersHorizontal,
  AUTOMATIONS_OFFPEAK_TAB_TESTID,
  AUTOMATIONS_LIST_TESTID,
  AUTOMATION_CARD_TESTID,
  OFFPEAK_CREATE_BUTTON_TESTID,
  AUTOMATION_CREATE_MANUALLY_TESTID,
  AUTOMATION_CREATE_MENU_TESTID,
  AUTOMATION_CARD_MENU_TESTID,
  AUTOMATION_ACTION_TOGGLE_TESTID,
  AUTOMATION_ACTION_DELETE_TESTID,
} from '../../modules/ExtendedViews';
/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

/** react-intl 风格 intl（原 G()，IntlProvider-C321H7m8.js） */
/* ── tombstone〔A1-R172〕面收敛：本地 interface IntlShape（3 行形）删除 → 改采上方 @22 既有导入行之 `type ZCodeIntl as IntlShape` 别名 specifier（canonical modules/I18n@201-203 ZCodeIntl）。
 *    〔别名保名〕故本文件 1 处读者（@924 `formatOffPeakRemainingTime` 之 `intl` 参）之名**逐字不变**、零重锚；成员行与 canonical I18n@202 **逐字节同**（md5 d2ffea415e84）→ **型缝 0**。
 *    ★下方 @73-75 之 R119 碑本批同批勘误（其「接口保留」与「3 处读者 984/1070/1083」两声称皆不成立，见该处）。全树 11 家已落先例〔modules/Conversation@143、modules/Composer@524、components/payments/PaymentDeep@10700、components/shell/Home@167、components/composer/ConfigSelect@12、components/modals/UpdateStatusDialog@9、components/conversation/{ConversationToolViews@12,ConversationInteractionsOverlay@10,QueuePanel@7,AutomationCards@6,SessionBanners@7}〕 ── */

/* ── tombstone〔A1-R119〕：declare useIntlContext（原 G）删除 → 改指 modules/I18n::useZCodeIntl（import 别名在案；
 *    R1/R116 判例续）。〔A1-R172 勘误二处〕①旧注「本地 IntlShape 接口**保留**」已不复成立——该界面本批销账、改采上方 @22 之 `type ZCodeIntl as IntlShape` 别名（别名保名故读者之名不变）；
 *    ②旧注「余 3 处活体签名引用（984/1070/1083）」**三行号皆误**——实测 @984 係注释行且无该 token、@1070/@1083 係代码行而无该 token；**唯一真读者係 @924**（旧碑从未提及）。与 I18n::ZCodeIntl@201–203 逐字同形（R116 既证、本批复核 md5 d2ffea415e84）。 ── */

/** 桌面平台服务（原 l()，imeComposition chunk）——仅列本族用到的面 〔A1-R182〕★上句「仅列本族用到的面」今已失 referent：其所描述之本地 interface PlatformService（8 行、代码位读者 0）已随死界面普查批第二批销账、8 行等行墓碑在下方原位；「原 l()，imeComposition chunk」之束源注部分逐字保留（存活于碑上之先例＝本文件 @68，TopBar@165 明引）。 */
/* ── tombstone〔A1-R182〕死界面普查批第二批：本地 interface PlatformService（8 行，openInFileManager/openExternal?/onSettingsChanged?/reportTelemetryEvent/reportArmsCustomEvent）纯删，8 行等行墓碑在原位。
 *    读者面实测（token 级 code-only 掩码 + 六形自检，非行首前缀法；级联迭代至不动点）：本文件代码位读者 **0**、散文位亦 **0**；未 export ⇒ 跨文件读者结构性不可能；两套独立实现互证全等（普查工具 own_readers 与本批独立复算皆空集）。
 *    ★上方 @77 之单行文档注「桌面平台服务（原 l()，imeComposition chunk）——仅列本族用到的面」**存活**（加行内 rider、旧文逐字保留为前缀）：理据＝该注係**束源注**形，同文件 @68 之束源注存活于〔A1-R172〕碑上、且 TopBar@165 明引该处为「同款标签存活于碑上之先例」⇒ 同档一致性优先，不折入本碑。
 *    ★下方 @87 之〔A1-R46〕碑末句「本地 PlatformService 接口孤儿保留」**被本批证伪** ⇒ 同批加行内 rider（拆分感知：该碑其余声称〔usePlatformService 改指 canonical、型交叉检查、消费面 @1413／@1467／@1516 pass-through〕皆仍真、逐字保留）。
 *    ★并核：该句在**著笔时曾为真**（读者 0 之孤儿确曾保留），属 R172 沉淀③「处置后失效」型，而非 R176 沉淀⑦「理据从未成立」型（对照 McpSettingsSection@40 之同款 R46 碑，其理据从未成立）。
 *    同名定义站全树 **14** 家：本件 + CodeViewer@185／FileTreePanel@205／GitReview@256／ime/ImeComposition@152（带 export，canonical）／FileRewindDialogDeep@120／OnboardingLoginLeaves@452（带 export）／PreviewCards@165／Hooks@27／Plugins@26／SidePanel@199（带 export）／WorkspaceShell@289／ConversationLeaves@244（带 export）／pptxPreviewViewer@84。
 *    ★〔A1-R48〕已就多家本地 2 员面碑化改指 canonical 立判例（CommandsSettingsSection／ModelProviderSettingsSection／AutomationsMain 等）；本件读者 0 故径纯删、不采别名（别名无收益且可能静默改面）。
 *    级联：本面成员皆基础型或内联面，未引本文件其它本地面 ⇒ 预判级联新增死面 **0**。 ── */

/* ── tombstone〔A1-R46〕：declare usePlatformService 删除 → 改指 canonical（modules/ImeComposition ≡ ImeComposition@186 = usePlatform@168，bundle l ≡ M；R45 既判）。型交叉检查：消费面仅 @1413/@1467/@1516 pass-through 至 reportAutomationCreateResult/reportAutomationAction（service: TelemetryPlatform，StoresDeep@273）；canonical → TelemetryPlatform 可赋（reportTelemetryEvent 逐字同形；reportArmsCustomEvent 参 ArmsCustomEvent ⊆ canonical 内联面，方法双变成立）。本地 PlatformService 接口孤儿保留。证据见 A1-R46.report.md §二。〔A1-R182〕★上句「本地 PlatformService 接口孤儿保留」今已失效：该本地面（8 行、代码位读者 0）已随死界面普查批第二批销账、8 行等行墓碑在原位；本碑其余声称（usePlatformService 改指 canonical、型交叉检查、消费面 @1413／@1467／@1516 pass-through）皆仍真、逐字保留。★并记该句在著笔时曾为真（孤儿确曾保留），属「处置后失效」型而非「理据从未成立」型（对照 McpSettingsSection@40 之同款 R46 碑，其理据从未成立，R176 沉淀⑦）。 ── */

interface ModelProviderInfo {
  id: string;
  name?: string;
  source?: "system" | "custom" | string;
  enabled?: boolean;
  systemDisabledReason?: string | null;
  endpoints?: { baseURL?: string };
  models: Array<string | ModelCatalogEntryLike>; // 〔A1-R24〕zrt 197021 面联动型缝：经 AutomationEditor → SubagentLeaves resolveThoughtLevelOption 链透传至 buildThoughtLevelOptionFromCatalog
  [key: string]: unknown;
}

/* ── tombstone（A1-R9）：OffPeakTaskService/CodingPlanSubscriptionService 本地弱型面
 *    （纯索引签名桩）删除——唯一消费面为同批删除的本地 OffPeakStoreState 接口；
 *    bX 接线后消费面经 canonical 型面（Home OffPeakTaskStoreState）走真实服务型
 *    （useServices() 的 shim OffPeakTaskService 面 → canonical 面指派合拢）。 ── */

interface ZCodeSettings {
  keepAwakeWhileRunning?: boolean;
  modelProviderFamilyModes?: Record<string, string>;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  providerFamilyDomain?: string | null;
  [key: string]: unknown;
}

/* ── tombstone〔A1-R119〕：declare useSettingsSnapshot/useModelProviderRegistry 删除 → 改指
 *    useAppSettings（JM 族，UsageDeep@1745；R11 判例〔A1-R168 勘误：旧引 1730 行漂 +15〕）/useModelProvidersStore（qq 族，PaymentDeep §11；
 *    R109 判例）。消费面 @1111/@1110 解构逐字不变；F15 轨 @1187/@1188 同构消费在案。 ── */

/* ── tombstone〔A1-R182〕死界面普查批第二批：本地 interface EntitlementSnapshot（4 行，snapshot 加索引签名）纯删，4 行等行墓碑在原位。
 *    读者面实测（token 级 code-only 掩码 + 六形自检，非行首前缀法；级联迭代至不动点）：本文件代码位读者 **0**、散文位亦 **0**；未 export ⇒ 跨文件读者结构性不可能；两套独立实现互证全等（普查工具 own_readers 与本批独立复算皆空集）。
 *    同名定义站全树 **3** 家：本件 + components/usage/UsageDeep@703（带 export，canonical）+ modules/ExtendedViews@367。〔A1-R185〕★上句「同名定义站全树 **3** 家」之列名今失 1 处 referent：modules/ExtendedViews@367 那份 interface EntitlementSnapshot（4 行）已随死界面普查批第四批销账 ⇒ 施后同名定义站全树余 **2** 家（本件 + components/usage/UsageDeep@703 canonical）。
 *    ★OnboardingLoginLeaves@261 之 import type 係自 **modules/UsageDeep** 取该 canonical、与本件无关 ⇒ 其注记不证伪、不加 rider（R165 沉淀：dst 必经 resolve 解析、不得以同名想当然）。 ── */

/* ── tombstone〔A1-R119〕：declare useEntitlements/useCodingPlanUpgrade/buildIdleUpgradeFunnelContext/
 *    resolveEntryPlanState 删除 → 改指 useCodingPlanEntitlements（sX，PaymentDeep@9236；R111 判例）/
 *    useCodingPlanUpgradeDialog（fX，PaymentDeep@10102；R43 判例）/buildCodingPlanFunnelContext（FM，
 *    Home@4363；R26 实体化）/resolveEntryPlanState（LM，Home@4408；R26 实体化同名直收）。
 *    消费面 @1112–1116/@1109/@1327–1331 逐字不变（1115 型缝 cast 同 F15@1192 判例）；
 *    F15 轨 @1186–1193/@1407–1414 同构消费在案。 ── */

/* ── tombstone〔A1-R120〕：本地 ModelSelectGroup 接口删除——唯一型面消费面 = 本批归一删除的 AMt 孪生返回型；
 *    归一后 modelSelectGroups 经 F15 逐字实体（返回 any → AutomationEditor modelSelectGroups 参面直通）。 ── */

/* ── tombstone〔A1-R29〕：declare buildModelSelectGroups（原 Hq）删除 → 改指 modelMenuGroupsOf（Hq 真身：
 *    bundle 77850 唯一真身 ≡ PaymentDeep@993 A0 逐字实化，modules/PaymentDeep@118 转导出）。双实例收敛证据：
 *    消费面实测：@1043（AMt buildAutomationModelSelectGroups 体内）≡ bundle 135408（AMt 135401 体内
 *    `Hq(e.selectedProvider, [], t, e.labels, e.displayOrder, ...)`），改名改指（configModels 位 = bundle
 *    第二参，Hq 体内从不读，负证据在案，删位）。负证据：bundle 内 Hq 无第二真身。 ── */

/* ── tombstone〔A1-R29〕：declare buildEntitledProviderList（原 N6e）删除 → 改指 filterUsableProviders
 *    （N6e 真身：bundle 77910–77929 唯一真身 ≡ PaymentDeep@1097 A0 逐字实化，modules/PaymentDeep@128 转导出）。消费面实测：@1036（AMt 体内）
 *    ≡ bundle 135402，改名改指（型缝见 AMt 体内注）。负证据：bundle 内 N6e 无第二真身。 ── */

/* ── tombstone〔A1-R119〕：declare parseModelString 删除 → 改指 SrcSharedB::parseCustomModelRef。
 *    勘误：旧注「原 Mg（24406）」系误记——束内消费位 MNt@138580 实调 Zn（i = Zn(r)，读 .modelName），
 *    Zn ≡ parseCustomModelRef（R105 判例；Mg ≡ parseLooseModelValue 返回 modelId 面不符）。 ── */

/** A0-CLEANUP3 3b：cronExpr 收紧为必有（列表/编辑器运行期恒有值）；scheduleRule 统一为 SL.ScheduleRule，
 * 与 StoresDeep.Automation / SL.AutomationTaskLite 三型互指 */
interface AutomationRecord {
  automationId: string;
  title: string;
  prompt: string;
  cronExpr: string;
  recurring?: boolean;
  maxRuns?: number | null;
  runCount?: number; // A0-CLEANUP3 3b §C：与 StoresDeep.Automation 对齐（列表态运行期可能缺省统计字段）
  enabled: boolean;
  lifecycleStatus?: "active" | "paused" | "completed" | "failed" | string;
  dispatchStatus?: string;
  lastError?: string | null;
  nextRunAt?: number | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  model?: string | null;
  provider?: string | null;
  scheduleRule?: ScheduleRule | null;
  createdAt?: number;
  [key: string]: unknown;
}

/* ── tombstone〔A1-R182〕死界面普查批第二批：本地 interface AutomationScheduleRule（12 行）纯删，12 行等行墓碑在原位。
 *    读者面实测（token 级 code-only 掩码 + 六形自检，非行首前缀法；级联迭代至不动点）：本文件代码位读者 **0**、散文位亦 **0**；未 export ⇒ 跨文件读者结构性不可能；两套独立实现互证全等（普查工具 own_readers 与本批独立复算皆空集）。
 *    同名定义站全树 **2** 家：本件 + modules/ExtendedViews@550（该文件死面 29 个／223 行、係全树死行最多之文件，候后续批）。〔A1-R185〕★上句「同名定义站全树 **2** 家：本件 + modules/ExtendedViews@550（该文件死面 29 个／223 行、係全树死行最多之文件，候后续批）」之后半已**兑现**：ExtendedViews@550 那份 interface AutomationScheduleRule（12 行）已随死界面普查批第四批销账，该文件 29 面／223 行死面亦于同批全数销账 ⇒ 施后同名定义站全树余 **1** 家＝本件。
 *    ★本件与 ExtendedViews@550 那份**不得并批**：两者读者面须各自实测（R169 沉淀②），且 ExtendedViews 负 R163 vintage 债、其引证须逐条归真而非机械换算。〔A1-R185〕★上句「本件与 ExtendedViews@550 那份**不得并批**」之约束经本批核**已遵守**：本件係〔A1-R182〕处置、ExtendedViews@550 係本批（死界面普查批第四批）处置，两者不同批；其「读者面须各自实测」之要求亦已履行（本批以 token 级 code-only 掩码 v8 独立复算得 ExtendedViews@550 代码位读者 0）；「ExtendedViews 负 R163 vintage 债、其引证须逐条归真而非机械换算」之告诫仍立、候 R164 登记之逐条归真批。
 *    上方 @169 空行与 @166-168 之邻面收尾、下方 @182 空行与 @183 起之 interface AutomationInput（活体、读者 @1305）皆存活（outside-diff 已断言逐字节未变）。
 *    原体之语义（供后续重建参考）：调度规则面——hour 与 minute 必填、anchorAt 必填，weekdays?/monthDays?/months? 为数字数组，monthlyMode? 与 unit? 皆为字面量并集再并 string（宽化形），interval? 为数字，另有索引签名兜底。
 *    引证密度实测：`AutomationsMainView@NNN` 全树 **15** 处、其中 **4** 处引 @181 之后 ⇒ 净零行强制（12 行碑换 12 行原体，文件 1920 行不变、零重锚）。
 *    ★其中 TopBar@165 引 `AutomationsMainView@68` 为「束源注存活于碑上」之先例——@68 在本批首个编辑点（@77）之前且净零行 ⇒ 行号与所指皆不变、零引证证伪。
 *    级联：本面成员皆基础型或内联字面量并集，未引本文件其它本地面 ⇒ 预判级联新增死面 **0**。
 *    本块与同批另两块皆型-only ⇒ 三 bundle 必逐字节全等；台账 588 不得变动（反向哨兵）。
 *    证据同 SkillsService 碑所列三份 /tmp 工件（普查／双实现互证／形制无关三谓词扫）。
 *    本碑散文不嵌注释定界符、只描述不引用（R173 沉淀①）；标记严格交替已由施加脚本跨整块自检并带正负对照件。 ── */

interface AutomationInput {
  title: string;
  prompt: string;
  cronExpr?: string | null;
  model?: string | null;
  provider?: string | null;
  recurring?: boolean;
  maxRuns?: number | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}

interface OffPeakTask {
  offPeakTaskId: string;
  title?: string; // A0-CLEANUP3 3b：与 SL.OffPeakTaskRecord/stores-tasks.OffPeakTask 对齐（双向收敛）
  prompt: string;
  status: "queued" | "paused" | "running" | "completed" | "failed" | "cancelled" | string;
  queuePosition?: number;
  permissionMode?: string | null;
  model?: string | null;
  thoughtLevel?: string | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}

interface OffPeakCreateInput {
  title: string;
  prompt: string;
  permissionMode?: string | null;
  model?: string | null;
  thoughtLevel?: string | null;
  [key: string]: unknown;
}

interface OffPeakCreateDraft {
  title?: string;
  prompt?: string;
  templateId?: string;
  telemetrySource?: { eventRegion: string; templateId?: string } | null;
  [key: string]: unknown;
}

/* A1-R9 精化：原单接口面（ok: boolean + task 必填平铺）→ 判别联合。
 * bundle 真形（138876 簇消费面实测）：ok 支恒含 task（965 行遥测无守卫直读
 * result.task.offPeakTaskId）+ ticketInitialState/queuePosition 可选；失败支
 * failureStage/errorCategory/errorCode 全字段 + 客户端校验字面量附挂 task
 * （1618–1628 行）。与 canonical 面 Home bX OffPeakCreateResult 双向可指派。 */
type OffPeakCreateResult =
  | { ok: true; task: OffPeakTask; ticketInitialState?: string; queuePosition?: number; providerName?: string; [key: string]: unknown }
  | { ok: false; task?: OffPeakTask; errorCategory?: string; errorCode?: string; failureStage?: string; providerName?: string; [key: string]: unknown };

/* ── tombstone（A1-R9）：OffPeakStoreState/OffPeakStoreHook 本地接口与
 *    `declare const useOffPeakTaskStore` 死声明删除 → 文件头真实 import
 *    （modules/stores-tasks re-export 链 → stores/offPeakTaskStore shim →
 *    canonical components/shell/Home.tsx 641 区 bX@91416）。
 *    裁决与证据链（A1-R8 普查 + R9 接线）：
 *    - bundle 唯一 bX（@91416；A0 误标 91368，jsx 78945 孪生验证无误）。
 *    - canonical = Home 实例（定义区属主 + 唯一 live：896–901 = bundle
 *      91645–91650 钩子簇）；stores/offPeakTaskStore 并行实例 R8 已降 shim。
 *    - 本 declare 消费面（1155–1173 选择器簇 / 1573–1600 getState().error /
 *      = bundle 138876/139287 簇）R8 回滚之 10 处型缝，R9 逐一点修：
 *      canonical 侧按 bundle 真形精化四型（OffPeakTaskSummary 富面 /
 *      OffPeakGrayConfig.allowedModels(+Configs) / OffPeakCodingPlanSupport.
 *      providerFamily(+Key) / OffPeakTakeNumberAvailability.canTakeNumber
 *      (+nextTakeAt) / OffPeakCreateResult ok 支 task 必填，宽化注各在其位），
 *      本文件消费面（OffPeakCreateResult 判别联合化 + 服务弱型面随删）对齐；
 *      调用点逐字不变。
 *    - 环安全：本文件 → modules/stores-tasks（既有边，15 行）；stores-tasks →
 *      stores/offPeakTaskStore shim → Home 链为 R8 既有，Home 闭包实测不反入
 *      components/automations → 无新边、无成环。 ── */

/* ── tombstone〔A1-R119〕：declare useWorkspaceTabStore/isWorkspaceTabUsable/isRemoteScopedTab +
 *    本地 WorkspaceTab/RemoteTarget/WorkspaceTabStoreState/WorkspaceTabStoreHook 四孤悬接口删除 →
 *    改指 WorkspaceTabsDeep::useWorkspaceTabStore（原 pc，R107 判例）/isWorkspaceKindTab（原 oc，R2 判例）/
 *    Home::isRemoteWorkspaceTab（原 zMt，R107 判例）。消费面 @1155–1160 选择器簇逐字不变。 ── */

interface TelemetryEvent {
  elementName: string;
  eventRegion: string;
  eventType: string;
  eventText?: string;
  eventExtraDetail?: Record<string, unknown>;
  [key: string]: unknown; // A0-CLEANUP3 3b：流入 StoresDeep.TelemetryReport（带索引签名），接口级补齐
}

/* ── tombstone〔A1-R119〕：declare isCreateLimitError/OFFPEAK_TELEMETRY_DEFAULT_PROVIDER 删除 → 改指
 *    SrcSharedB::isAutomationCreateLimitError（原 ri：束 138719 消费面溯源 = styles import et ← src chunk
 *    hx@8733 ≡ SrcSharedB@5344 逐字，含 Error 实例 .includes 面）/OFFPEAK_IDLE_PLAN_ID（原 vee ← src 5357，
 *    R106 判例）。消费面 @796/@919 逐字不变。 ── */

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number; containerSize?: number };

/* ── tombstone〔A1-R119〕：declare useConfirmDialog（原 U2，styles 123510）删除 → 改指
 *    modules/Modals::useConfirmDialog（ConfirmDialog@79 canonical 转导出；R5/R6 判例，F15 轨同消费在案）。
 *    消费面 @1108 逐字不变。 ── */

interface AutomationCreateDraft {
  templateId?: string;
  title?: string;
  cronExpr?: string;
  prompt?: string;
  [key: string]: unknown;
}

/* ── tombstone〔A1-R119〕：declare OffPeakTaskList（原 cMt，js 134679 / jsx 113500）删除 → 改指
 *    AutomationsMain::OffPeakTaskList（R113 逐字实体，束 134696–134939；补 export 同批）。
 *    消费面 @1738–1747 八 props 逐字不变。 ── */

/* ============================================================================
 * 6. AutomationsMain 视图态（原 d6 等，F15；视图态全量展开，编辑器叶子接口保留）
 * ==========================================================================*/

/* ---- 6.0 容器类常量 / toast 锚点（原 H3、c6/l6，js 135261、138628） ---- */

const AUTOMATIONS_MAIN_CONTAINER_CLASS = "mx-auto w-full max-w-4xl px-4 pb-8 pt-0 lg:px-8 lg:pb-10"; // 原 H3

export const AUTOMATIONS_TOAST_ANCHOR_ID = "automations-main-toast-anchor"; // 原 c6；〔A1-P2-B10〕导出——WorkspaceShell 锚点 declare 改指消费（main id，WS 3617 区）

/** 原 l6：自动化主视图 toast（统一挂锚点） */
function automationsToast(message: string, opts?: ToastOptions): number {
  return toast(message, { ...opts, anchorId: AUTOMATIONS_TOAST_ANCHOR_ID });
}

/* ---- 6.1 图标包装族（原 E3 基座 + D3…F3，js 134460–134540 / jsx 113356–113436） ---- */

const AUTOMATION_ICON_DEFAULTS = { size: 16, strokeWidth: 2 } as const; // 原 E3

const AutomationChevronIcon: React.FC<IconProps> = ({ size = 12, containerSize = 20, ...rest }) => (
  <span className={cn("flex shrink-0 items-center justify-center", containerSize === 18 ? "size-4.5" : "size-5")} aria-hidden="true">
    <IconChevronDown size={size} strokeWidth={2} className={size === 14 ? "size-3.5" : "size-3"} {...rest} />
  </span>
);

/** 原 Kjt（plus，编辑器域用） */
export const AutomationPlusIcon: React.FC<IconProps> = (props) => <IconPlus {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationMoonIcon: React.FC<IconProps> = (props) => <IconMoon {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationPauseIcon: React.FC<IconProps> = (props) => <IconCircleStop {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationResumeIcon: React.FC<IconProps> = (props) => <IconCirclePlay {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationEditIcon: React.FC<IconProps> = (props) => <IconPencil {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationRunIcon: React.FC<IconProps> = (props) => <IconPlay {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationClockIcon: React.FC<IconProps> = (props) => <IconClock {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationMoreIcon: React.FC<IconProps> = (props) => <IconEllipsis {...AUTOMATION_ICON_DEFAULTS} {...props} />;
/** 原 P3（external-link，闲时列表域用） */
export const AutomationExternalLinkIcon: React.FC<IconProps> = (props) => <IconExternalLink {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationRefreshIcon: React.FC<IconProps> = (props) => <IconRefreshCw {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationRestartIcon: React.FC<IconProps> = (props) => <IconRotateCcw {...AUTOMATION_ICON_DEFAULTS} {...props} strokeWidth={1.33} aria-hidden="true" />;
/** 原 Xjt（square 停止，编辑器域用） */
export const AutomationStopIcon: React.FC<IconProps> = (props) => <IconSquare {...AUTOMATION_ICON_DEFAULTS} fill="currentColor" {...props} />;
const AutomationDeleteIcon: React.FC = () => (
  <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
    <IconTrash2 className="size-4" {...AUTOMATION_ICON_DEFAULTS} />
  </span>
);

/** 原 sMt（js 134677）：闲时状态徽章图标映射（闲时列表域用） */
export const OFFPEAK_BADGE_ICONS: Record<string, React.FC<IconProps>> = {
  moon: AutomationMoonIcon,
  pause: AutomationPauseIcon,
  spinner: (props) => <SpinnerIcon {...props} />,
  success: (props) => <IconCircleCheck {...AUTOMATION_ICON_DEFAULTS} {...props} />,
  warning: (props) => <IconAlertTriangle {...AUTOMATION_ICON_DEFAULTS} {...props} />,
  stopped: AutomationPauseIcon,
};

/** 原 EN（js 54837）：加载 spinner（loader 图标 role=status） */
const LoadingSpinner: React.FC<IconProps> = ({ className, ...rest }) => (
  <SpinnerIcon role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...rest} />
);

/* ---- 6.2 SwitchToggle（原 Gjt，js 134441 / jsx 113337） ---- */

const SwitchToggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  color?: "green" | "blue";
  size?: "default" | "sm";
}> = ({ checked, onChange, ariaLabel, color = "green", size = "default" }) => {
  const activeClass = color === "blue" ? "bg-brand" : "bg-success";
  const isSmall = size === "sm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-testid="automation-switch-toggle"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-[background-color,box-shadow] hover:ring-2 hover:ring-border-hover focus-visible:ring-2 focus-visible:ring-input-border-focused/30",
        checked ? activeClass : "bg-input",
        isSmall ? "h-4 w-8" : "h-5 w-9",
      )}
    >
      <span
        className={cn(
          "absolute inline-block size-3.5 rounded-full shadow transition-all duration-200",
          checked ? (color === "blue" ? "bg-foreground-inverse" : "bg-success-foreground") : "bg-primary",
          checked ? (isSmall ? "left-[17px]" : "left-[18px]") : "left-px",
        )}
      />
    </button>
  );
};

/* ---- 6.3 KeepAwakeBanner（原 tMt，js 134542 / jsx 113438） ---- */

const KeepAwakeBanner: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => {
  const { intl } = useIntlContext();
  return (
    <div
      data-automations-keep-awake="true"
      className="flex min-h-11 w-full items-center gap-3 overflow-hidden rounded-[10px] bg-surface px-3 py-3 text-foreground-subtle"
    >
      <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
        <AutomationMoonIcon className="size-4" />
      </span>
      <p className="min-w-0 flex-1 text-ui-base leading-5">{intl.formatMessage({ id: "offPeak.keepAwakeBanner" })}</p>
      <SwitchToggle checked={checked} ariaLabel={intl.formatMessage({ id: "offPeak.keepAwakeBanner" })} onChange={onChange} color="blue" size="sm" />
    </div>
  );
};

/* ---- 6.4 AutomationCreateSplitButton（原 L3，js 134567 / jsx 113451） ---- */

const AutomationCreateSplitButton: React.FC<{
  onViaChat: () => void;
  onManually: () => void;
  appearance?: "primary" | "outline";
}> = ({ onViaChat, onManually, appearance = "primary" }) => {
  const { intl } = useIntlContext();
  const isOutline = appearance === "outline";
  return (
    <div
      data-appearance={appearance}
      className={cn(
        "inline-flex h-8 items-center overflow-hidden rounded-lg",
        isOutline ? "border border-card-border bg-background" : "bg-primary text-primary-foreground",
      )}
    >
      <button
        type="button"
        data-testid={AUTOMATION_CREATE_MANUALLY_TESTID}
        onClick={onManually}
        className={cn(
          "group inline-flex h-full items-center px-2.5 text-ui-base font-normal leading-5 transition-colors",
          isOutline ? "hover:bg-hover active:bg-selected" : "hover:bg-primary-foreground/10 active:bg-primary-foreground/20",
        )}
      >
        <span className={cn("transition-opacity", isOutline ? "opacity-80 group-hover:opacity-100" : "opacity-100")}>
          {intl.formatMessage({ id: "automations.createManually" })}
        </span>
      </button>
      <div className={cn("h-4 w-px", isOutline ? "bg-surface" : "bg-primary-foreground/10")} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-testid={AUTOMATION_CREATE_MENU_TESTID}
            aria-label={intl.formatMessage({ id: "automations.create" })}
            className={cn(
              "group inline-flex h-full w-7 items-center justify-center transition-colors",
              isOutline
                ? "hover:bg-hover active:bg-selected data-[state=open]:bg-hover"
                : "hover:bg-primary-foreground/10 active:bg-primary-foreground/20 data-[state=open]:bg-primary-foreground/10",
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center transition-opacity",
                isOutline ? "opacity-80 group-hover:opacity-100 group-data-[state=open]:opacity-100" : "opacity-100",
              )}
            >
              <AutomationChevronIcon size={14} />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" alignOffset={-64} sideOffset={4} className="w-auto min-w-0">
          <DropdownMenuItem className="pr-6" onSelect={onViaChat}>
            {intl.formatMessage({ id: "automations.createViaChat" })}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

/* ---- 6.5 OffPeakCreateButton（原 INt，js 138634 / jsx 115771） ---- */

const OFFPEAK_TOOLTIP_CLASS = "max-w-[220px] [&>span]:break-words [&>span]:whitespace-normal [&>span]:text-wrap-pretty"; // 原 Fjt（js 133991）

export const OffPeakCreateButton: React.FC<{ greyReason: string | null; greyTooltip?: string; onCreate: () => void }> = ({ greyReason, greyTooltip, onCreate }) => {
  const { intl } = useIntlContext();
  const button = (
    <button
      type="button"
      data-testid={OFFPEAK_CREATE_BUTTON_TESTID}
      disabled={greyReason !== null}
      onClick={onCreate}
      className="inline-flex h-8 items-center rounded-lg border-0 bg-primary px-3 text-ui-base font-normal leading-5 text-primary-foreground shadow-none outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-input-border-focused/30 disabled:pointer-events-none disabled:bg-surface disabled:text-foreground-subtlest disabled:opacity-100"
    >
      {intl.formatMessage({ id: "offPeak.createButton" })}
    </button>
  );
  return greyTooltip ? (
    <Tooltip title={greyTooltip} side="top" align="center" className={OFFPEAK_TOOLTIP_CLASS}>
      <span className="inline-flex">{button}</span>
    </Tooltip>
  ) : (
    button
  );
};

/* ---- 6.6 AutomationSchedulePill（原 ANt，js 138513 / jsx 115689） ---- */

const AutomationSchedulePill: React.FC<{ dimmed?: boolean; icon: React.ReactNode; text: string }> = ({ dimmed = false, icon, text }) => {
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  React.useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    const measure = () => {
      const overflowing = element.scrollWidth > element.clientWidth;
      setIsOverflowing((previous) => (previous === overflowing ? previous : overflowing));
    };
    measure();
    if (typeof ResizeObserver > "u") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);
  return (
    <PopoverRoot>
      <Popover>
        <PopoverTrigger asChild>
          <span
            className={cn(
              "inline-flex w-fit min-w-0 max-w-full items-center gap-0.5 overflow-hidden rounded-lg bg-success/10 py-0.5 pl-1 pr-2 font-normal text-success",
              dimmed && "opacity-40",
            )}
          >
            <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
            <span ref={textRef} data-testid="automation-schedule-text" className="min-w-0 truncate whitespace-nowrap">
              {text}
            </span>
          </span>
        </PopoverTrigger>
        {isOverflowing ? <PopoverContent side="top" sideOffset={6}>{text}</PopoverContent> : null}
      </Popover>
    </PopoverRoot>
  );
};

/* ---- 6.7 AutomationCardMenu（原 ZNt，js 138713 / jsx 115876） ---- */

const AutomationCardMenu: React.FC<{
  automation: AutomationRecord;
  busy: boolean;
  canRestart: boolean;
  canToggle: boolean;
  onRunNow: (automation: AutomationRecord) => void;
  onEdit: (automation: AutomationRecord) => void;
  onToggle: (automation: AutomationRecord, enabled: boolean) => void;
  onRestart: (automation: AutomationRecord) => void;
  onDelete: (automation: AutomationRecord) => void;
}> = ({ automation, busy, canRestart, canToggle, onRunNow, onEdit, onToggle, onRestart, onDelete }) => {
  const { intl } = useIntlContext();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-6 items-center justify-center rounded-md opacity-100 transition-colors hover:bg-hover md:opacity-0 md:group-hover:opacity-100 data-[state=open]:bg-hover data-[state=open]:opacity-100"
          data-testid={AUTOMATION_CARD_MENU_TESTID}
          aria-label={intl.formatMessage({ id: "automations.moreActions" })}
          disabled={busy}
          onClick={(event) => event.stopPropagation()}
        >
          <AutomationMoreIcon className="size-4 text-foreground-subtle" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="w-[190px]" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem className="gap-1" disabled={busy} onSelect={() => void onRunNow(automation)}>
          <span className="flex size-5 items-center justify-center">
            <AutomationRunIcon className="size-4" aria-hidden="true" />
          </span>
          {intl.formatMessage({ id: "automations.runNow" })}
        </DropdownMenuItem>
        {canRestart ? (
          <DropdownMenuItem className="gap-1" disabled={busy} onSelect={() => void onRestart(automation)}>
            <span className="flex size-5 items-center justify-center">
              <AutomationRestartIcon className="size-4" />
            </span>
            {intl.formatMessage({ id: "automations.restart" })}
          </DropdownMenuItem>
        ) : null}
        {canToggle ? (
          <DropdownMenuItem data-testid={AUTOMATION_ACTION_TOGGLE_TESTID} className="gap-1" disabled={busy} onSelect={() => void onToggle(automation, !automation.enabled)}>
            {automation.enabled ? (
              <span className="flex size-5 items-center justify-center">
                <AutomationPauseIcon className="size-4" aria-hidden="true" />
              </span>
            ) : (
              <span className="flex size-5 items-center justify-center">
                <AutomationResumeIcon className="size-4" aria-hidden="true" />
              </span>
            )}
            {intl.formatMessage({ id: automation.enabled ? "automations.pause" : "automations.resume" })}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem className="gap-1" disabled={busy} onSelect={() => void onEdit(automation)}>
          <span className="flex size-5 items-center justify-center">
            <AutomationEditIcon className="size-4" aria-hidden="true" />
          </span>
          {intl.formatMessage({ id: "automations.form.editTitle" })}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid={AUTOMATION_ACTION_DELETE_TESTID}
          className="gap-1 !text-destructive data-[highlighted]:!bg-menu-hover data-[highlighted]:!text-destructive focus:!text-destructive [&_svg]:!text-destructive"
          disabled={busy}
          onSelect={() => void onDelete(automation)}
        >
          <AutomationDeleteIcon />
          {intl.formatMessage({ id: "automations.delete" })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* ---- 6.8 模板数据与图标（原 Mjt/Njt/Pjt、lMt/uMt、LNt） ---- */

const AUTOMATION_TEMPLATE_ICONS: Record<string, ReturnType<typeof createLucideIcon>> = {
  target: IconTarget, // 原 Mjt（js 133984）
  activity: IconActivity,
  file: IconFileText,
  list: IconList,
};

/** 原 Njt（js 133990 / jsx 112749） */
const AutomationTemplateIcon: React.FC<{ className?: string; name: string }> = ({ className, name }) => {
  const Icon = AUTOMATION_TEMPLATE_ICONS[name];
  return <Icon aria-hidden="true" className={className} data-automation-template-icon={name} size={16} strokeWidth={2} />;
};

/** 原 lMt（js 134923–134930 / jsx 113569）：闲时模板图标映射（6 项全量） */
const OFFPEAK_TEMPLATE_ICONS: Record<string, ReturnType<typeof createLucideIcon>> = {
  standupGitSummary: IconList,
  ciFlakyReport: IconActivity,
  documentationSyncCheck: IconListChecks,
  customize: IconSlidersHorizontal,
  standupGitSummarySecondary: IconList,
  followUpMonitor: IconListChecks,
};

/** 原 uMt（js 134931 / jsx 113575） */
const OffPeakTemplateIcon: React.FC<{ className?: string; name: string }> = ({ className, name }) => {
  const Icon = OFFPEAK_TEMPLATE_ICONS[name];
  return <Icon aria-hidden="true" className={className} data-off-peak-template-icon={name} size={16} strokeWidth={2} />;
};

/** 原 Pjt（js 134016 / jsx 112762）：闲时模板 id 表 */
const OFFPEAK_TEMPLATES = [{ id: "standupGitSummary" }, { id: "ciFlakyReport" }, { id: "documentationSyncCheck" }];

/** 原 LNt（js 138671 / jsx 115784）：定时模板表 */
export const SCHEDULED_TEMPLATES = [
  { id: "morningDevBrief", icon: "target", cronExpr: "0 9 * * 1-5" },
  { id: "dailyRiskScan", icon: "activity", cronExpr: "0 10 * * *" },
  { id: "weeklyReleaseBrief", icon: "file", cronExpr: "0 16 * * 5" },
  { id: "documentationSyncCheck", icon: "list", cronExpr: "0 15 * * 3" },
];

/* ---- 6.9 视图态纯助手（原 BNt…XNt、MNt…FNt、Vjt…Wjt、Ijt/Ljt、Tit/Dit，js 138563–138712、134385–134425、133996–134010、91347–91366） ---- */

const AUTOMATIONS_TELEMETRY_REGION = "app.automations"; // 原 jNt

type AutomationsTab = "scheduled" | "idle";

function resolveAutomationTabs(params: { hasAnyTasks: boolean; offPeakVisible: boolean }): AutomationsTab[] {
  return params.hasAnyTasks ? (params.offPeakVisible ? ["scheduled", "idle"] : ["scheduled"]) : [];
}

function resolveValidAutomationTab(tab: AutomationsTab, offPeakVisible: boolean): AutomationsTab {
  return tab === "idle" && !offPeakVisible ? "scheduled" : tab;
}

function resolveTemplateVisibility(params: { hasAnyTasks: boolean; offPeakCreationEnabled: boolean; tab: AutomationsTab }): {
  showOffPeakTemplates: boolean;
  showScheduledTemplates: boolean;
} {
  const isEmpty = !params.hasAnyTasks;
  return {
    showOffPeakTemplates: params.offPeakCreationEnabled && (isEmpty || params.tab === "idle"),
    showScheduledTemplates: isEmpty || params.tab === "scheduled",
  };
}

/** 原 UNt（js 138692） */
const AUTOMATION_LIFECYCLE_PRESENTATION: Record<string, { icon: React.FC<IconProps>; className: string }> = {
  active: { icon: AutomationClockIcon, className: "text-success" },
  paused: { icon: AutomationPauseIcon, className: "text-foreground-subtle" },
  completed: { icon: (props) => <IconCircleCheck {...AUTOMATION_ICON_DEFAULTS} {...props} />, className: "text-foreground-subtle" },
  failed: { icon: (props) => <IconAlertTriangle {...AUTOMATION_ICON_DEFAULTS} {...props} />, className: "text-destructive" },
};

function normalizeAutomationPrompt(prompt: string): string {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : " ";
}

function isAutomationFailed(automation: AutomationRecord): boolean {
  return automation.lifecycleStatus === "failed";
}

function isAutomationOperable(automation: AutomationRecord): boolean {
  return automation.lifecycleStatus !== "completed" && automation.lifecycleStatus !== "failed";
}

/** 原 qht（js 109298 / jsx 93279） */
function resolveAutomationLifecycleTier(automation: AutomationRecord): "active" | "paused" | "completed" | "failed" {
  return automation.lifecycleStatus === "failed"
    ? "failed"
    : automation.lifecycleStatus === "completed"
      ? "completed"
      : automation.lifecycleStatus === "paused" || !automation.enabled
        ? "paused"
        : "active";
}

/** 原 Kht（js 109243 / jsx 93276） */
function hasAutomationFailure(automation: AutomationRecord): boolean {
  return automation.lifecycleStatus === "failed" || automation.dispatchStatus === "failed_to_dispatch" || !!automation.lastError?.trim();
}

function resolveRunNowErrorLabelId(result: "queued" | "duplicate" | "failed"): string {
  return result === "queued"
    ? "automations.runNowQueued"
    : result === "duplicate"
      ? "automations.runNowAlreadyRunning"
      : "automations.runNowFailed";
}

function automationErrorLabelId(action: string): string {
  return `automations.error.${action}`;
}

function resolveCreateErrorLabelId(error: string | null): string {
  return isCreateLimitError(error) ? "automations.error.createLimit" : automationErrorLabelId("create");
}

function findAutomationById(automations: AutomationRecord[], automationId?: string | null): AutomationRecord | null {
  const trimmed = automationId?.trim();
  return trimmed ? (automations.find((e) => e.automationId === trimmed) ?? null) : null;
}

function resolveOpenAutomationRequest(
  automations: AutomationRecord[],
  openAutomationId: string | null | undefined,
  isInitialized: boolean,
): { status: "pending" } | { status: "found"; target: AutomationRecord } | { status: "missing" } {
  if (!openAutomationId?.trim() || !isInitialized) return { status: "pending" };
  const target = findAutomationById(automations, openAutomationId);
  return target ? { status: "found", target } : { status: "missing" };
}

/* 遥测（原 MNt/NNt/PNt/FNt） */

function buildAutomationModelTelemetryFields(model: string | null | undefined, provider: string | null | undefined, providers: ModelProviderInfo[]): {
  model_name: string;
  model_provider: string;
  provider_name: string;
} {
  const raw = model?.trim() ?? "";
  const parsed = parseModelString(raw);
  const slashIndex = raw.indexOf("/");
  const providerId = provider?.trim() || parsed?.providerId?.trim() || (slashIndex > 0 ? raw.slice(0, slashIndex).trim() : "");
  const modelName = parsed?.modelName?.trim() || (slashIndex > 0 ? raw.slice(slashIndex + 1).trim() : raw);
  const providerInfo = providers.find((e) => e.id === providerId);
  let hostname = "";
  if (providerInfo?.source === "custom" && providerInfo.endpoints?.baseURL?.trim())
    try {
      hostname = new URL(providerInfo.endpoints.baseURL).hostname;
    } catch {
      hostname = "";
    }
  return { model_name: modelName, model_provider: providerId, provider_name: hostname };
}

function sanitizeTelemetryText(text?: string | null): string {
  return text
    ? text
        .replace(/https?:\/\/[^\s"']+/g, "[url]")
        .replace(/(?:[A-Za-z]:\\|\/)[^\s"']+/g, "[path]")
        .replace(/((?:api[_-]?key|token|authorization|password)\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
        .slice(0, 500)
    : "";
}

function reportAutomationCreateResult(
  service: TelemetryPlatform,
  params: {
    automationId?: string | null;
    cronExpr: string;
    templateId?: string;
    error: string | null;
    modelFields: { model_name: string; model_provider: string; provider_name: string };
  },
): void {
  reportTelemetry(
    service,
    {
      elementName: "automation_create_result",
      eventRegion: AUTOMATIONS_TELEMETRY_REGION,
      eventType: "result",
      eventExtraDetail: {
        status: params.automationId ? "success" : "fail",
        automation_id: params.automationId ?? "",
        create_source: "manual",
        cron_expr: params.cronExpr,
        template_id: params.templateId ?? "",
        error_code: "",
        error_msg: params.automationId ? "" : sanitizeTelemetryText(params.error),
        ...params.modelFields,
      },
    },
    "automation-telemetry",
  );
}

function reportAutomationAction(
  service: TelemetryPlatform,
  params: {
    action: "run_now" | "delete";
    source: string;
    automation: AutomationRecord;
    providers: ModelProviderInfo[];
  },
): void {
  reportTelemetry(
    service,
    {
      elementName: params.action === "run_now" ? "automation_run_now_ck" : "automation_delete_ck",
      eventRegion: AUTOMATIONS_TELEMETRY_REGION,
      eventType: "ck",
      eventExtraDetail: {
        automation_id: params.automation.automationId,
        action_source: params.source,
        ...(params.action === "run_now"
          ? buildAutomationModelTelemetryFields(params.automation.model, params.automation.provider, params.providers)
          : {}),
      },
    },
    "automation-telemetry",
  );
}

/* 闲时遥测（原 Vjt/Hjt/Ujt/Wjt） */

interface OffPeakTelemetryContext {
  eventRegion: string;
  templateId: string;
  modelName: string;
  modelProvider: string;
}

function buildOffPeakTelemetryContext(params: { source?: { eventRegion?: string; templateId?: string } | null; model?: string | null }): OffPeakTelemetryContext {
  return {
    eventRegion: params.source?.eventRegion ?? "app.automations",
    templateId: params.source?.templateId ?? "",
    modelName: params.model?.trim() ?? "",
    modelProvider: OFFPEAK_TELEMETRY_DEFAULT_PROVIDER,
  };
}

function buildOffPeakCreateResultEvent(
  context: OffPeakTelemetryContext,
  result: OffPeakCreateResult,
): TelemetryEvent {
  const base = {
    result: result.ok ? "success" : "failure",
    template_id: context.templateId,
    model_name: context.modelName,
    model_provider: context.modelProvider,
    provider_name: result.providerName,
  };
  return {
    elementName: "off_peak_task_create_result",
    eventRegion: context.eventRegion,
    eventType: "result",
    eventText: "",
    eventExtraDetail: result.ok
      ? {
          ...base,
          off_peak_task_id: result.task.offPeakTaskId,
          ticket_initial_state: result.ticketInitialState,
          queue_position: result.queuePosition === undefined ? "" : String(result.queuePosition),
        }
      : {
          ...base,
          failure_stage: result.failureStage,
          error_category: result.errorCategory,
          error_code: result.errorCode,
        },
  };
}

function reportOffPeakCreateResult(service: TelemetryPlatform, context: OffPeakTelemetryContext, result: OffPeakCreateResult): void {
  reportTelemetry(service, buildOffPeakCreateResultEvent(context, result), "off-peak-telemetry");
}

async function withOffPeakCreateTelemetry<T extends OffPeakCreateResult>(
  service: TelemetryPlatform,
  context: OffPeakTelemetryContext,
  action: () => Promise<T>,
): Promise<T> {
  const result = await action();
  reportOffPeakCreateResult(service, context, result);
  return result;
}

/* 可用性（原 Ijt/Ljt） */

function resolveOffPeakCreateBlockReason(params: {
  availabilityStatus: string;
  canTakeNumber?: boolean;
  grayEnabled: boolean;
  noPlan: boolean;
}): "unavailable" | "plan" | "quota" | null {
  if (!params.grayEnabled) return null;
  if (params.availabilityStatus === "loading" || params.availabilityStatus === "error") return "unavailable";
  if (params.noPlan) return "plan";
  if (params.availabilityStatus === "ready") return params.canTakeNumber === true ? null : "quota";
  return "unavailable";
}

function formatOffPeakRemainingTime(nextTakeAt: number, now: number, intl: IntlShape): string {
  const remaining = nextTakeAt - now;
  if (remaining <= 0) return intl.formatMessage({ id: "offPeak.create.remaining.lessThanMinute" });
  const minutes = Math.ceil(remaining / 60_000);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 && rest > 0
    ? intl.formatMessage({ id: "offPeak.create.remaining.hoursMinutes" }, { hours, minutes: rest })
    : hours > 0
      ? intl.formatMessage({ id: "offPeak.create.remaining.hours" }, { hours })
      : intl.formatMessage({ id: "offPeak.create.remaining.minutes" }, { minutes: rest });
}

/* coding plan 错误（原 Eit/Dit，js 91353–91366 / jsx 78937–78941） */

function isQuota3103Result(result: OffPeakCreateResult | null): boolean {
  return result?.ok === false && result.errorCategory === "quota_3103" && result.errorCode === "3103";
}

function resolveOffPeakErrorLabelId(result: OffPeakCreateResult | null): string {
  return isQuota3103Result(result)
    ? "offPeak.error.quota"
    : result?.ok === false && (result.errorCategory === "network" || result.errorCategory === "invalid_response" || result.errorCategory === "unknown")
      ? "offPeak.error.unavailable"
      : "offPeak.error.generic";
}

/** 原 Tit（js 91347 / jsx 78933）：coding plan 连接是否激活（按家族域 + oauth + 选中连接键） */
function isCodingPlanConnectionActiveImpl(
  support: { supported?: boolean; providerFamily?: string; selectedConnectionKey?: string } | null, // A1-R9：原 OffPeakStoreState["codingPlanSupport"] 索引面随删；结构面与 canonical OffPeakCodingPlanSupport（R9 精化后）同形
  settings: ZCodeSettings | null,
): boolean {
  if (!support?.supported || !settings) return false;
  const domain = settings.providerFamilyDomain ?? null;
  if (!domain || domain !== support.providerFamily) return false;
  return settings.modelProviderFamilySelectedKeys?.[domain]?.trim() === support.selectedConnectionKey;
}

/* ── tombstone〔A1-R120〕：buildAutomationModelSelectGroups A0 语义重建孪生（原 AMt，js 135384 / jsx 113829；
 *    33 行含 R29/R119 型缝注）删除 → 归一 F15 轨 AutomationsMain::buildAutomationModelSelectGroups
 *    （R115 逐字实体，束 135401–135422；补 export 同批）。束证：d6 体内 AMt 唯一真身 135401，双轨同源；
 *    消费面 @1139 逐字不变（同名直收，参对象同形）。R29/R115 裁定史碑文续在案。 ── */

/* 频率/下次运行文案（原 rgt/egt，js 109525/109499；cron 描述器 Q$/Xht 属编辑器域，接口保留） */

/* ── tombstone〔A1-R119〕：declare describeScheduleRule/describeCronExpression 删除 → 改指
 *    AutomationEditor::schedulePreviewText（原 Q$ 109376）/cronPreviewText（原 Xht 109449）。
 *    束证：rgt@109573 分解 = Q$(ngt(rule),t)/Xht(cronExpr,t)（F15 轨 formatCronSchedule 同构在案）。
 *    型缝一：@1075 cronExpr 面 string|null|undefined → cronPreviewText(expr: string) 参，cast 补（束 JS 无此缝）。 ── */

/* ── tombstone〔A1-R119〕：toScheduleRuleDescription A0 退化桩（{...rule, frequency: "custom", rawExpr: ""}）删除 →
 *    改指 AutomationCards::scheduleRuleToPreviewModel（原 ngt，束 109557–109572 逐字，R96 实体化；补 export 同批）。
 *    保真修复：桩丢弃 interval/unit/weekdays/monthDays 等字段，束真形全投射；消费位 @1074 逐字不变。 ── */

/* ── tombstone〔A1-R120〕：describeAutomationFrequency A0 语义重建体（7 行）+ AUTOMATION_NEAR_RUN_WINDOW_MS
 *    （原 Jht 孪生常量）删除 → 归一 formatCronSchedule（R96 逐字实体 ≡ 束 rgt@109573；import 别名保留调用名）。
 *    束证：d6 139541 `a = rgt(e, o)` 直调；R119 改指后二本已行为同构（Q$∘ngt/Xht 分解 + ngt 保真），本批结构归一。
 *    消费面 @1710 逐字不变。R119 describeScheduleRule/describeCronExpression/toScheduleRuleDescription 碑文续在案。 ── */

/* ── tombstone〔A1-R119〕：declare describeNearRunTime/describeFarRunTime 删除 → 改指 AutomationsMain::
 *    formatRelativeRunTime（原 $ht，109527–109546）/formatAbsoluteRunTime（原 $$，109522–109526），
 *    R103 逐字实体补 export 同批。消费面 @1085 逐字不变。 ── */

/* ── tombstone〔A1-R120〕：describeAutomationNextRun A0 语义重建体（4 行）删除 → 归一 AutomationsMain::
 *    automationNextRunLabel（R103 逐字实体 ≡ 束 egt@109547–109549；import 别名保留调用名）。
 *    束证：d6 139542 `s = egt(e.nextRunAt, ke, o)` 直调；R119 改指后行为同构（720h 窗 + $ht/$$ 分支），本批结构归一。
 *    消费面 @1711 逐字不变。 ── */

/* ---- 6.10 AutomationsMain（原 d6，js 138823–139924 / jsx 115911–116693） ---- */

type AutomationsViewState =
  | { mode: "list" }
  | { mode: "create"; draft: AutomationCreateDraft | null }
  | { mode: "edit"; automation: AutomationRecord }
  | { mode: "offpeak-create"; draft?: OffPeakCreateDraft | null }
  | { mode: "offpeak-edit"; task: OffPeakTask };

export const AutomationsMain: React.FC<{
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  onCreateViaChat?: (prompt: string) => void;
  openAutomationId?: string | null;
  onOpenAutomationConsumed?: () => void;
  onOpenSession?: (target: { sessionId: string; workspacePath?: string; workspaceIdentity?: string | null }) => void; // A0-CLEANUP3 3b：与 SL.OffPeakTaskEditor.onOpenSession 形参面对齐（逆变收敛）
}> = ({ workspacePath, workspaceIdentity, onCreateViaChat, openAutomationId, onOpenAutomationConsumed, onOpenSession }) => {
  const { intl } = useIntlContext();
  const platformService = usePlatformService();
  const { zcodeAgentService } = useServices();
  const confirmDialog = useConfirmDialog();
  const { openCodingPlanUpgrade } = useCodingPlanUpgrade();
  const { modelProviders, displayOrder, loading: providersLoading } = useModelProviderRegistry();
  const { settings, update: updateSettings } = useSettingsSnapshot();
  const { entitlements } = useEntitlements({
    modelProviders,
    loading: providersLoading,
    modelProviderFamilySelectedKeys: settings?.modelProviderFamilySelectedKeys as Record<string, string> | undefined,
  }); // 〔A1-R119〕型缝 cast 同 F15@1192 判例（AppRuntimeSettings 面 → canonical 参型）
  const automations = useAutomationsStore((state) => state.automations);
  const createLimitReached = automations.length >= 20;
  const automationsLoading = useAutomationsStore((state) => state.loading);
  const operationId = useAutomationsStore((state) => state.operationId);
  const runsCache = useAutomationsStore((state) => state.runsCache);
  const initializeAutomations = useAutomationsStore((state) => state.initialize);
  const createAutomation = useAutomationsStore((state) => state.createAutomation);
  const updateAutomation = useAutomationsStore((state) => state.updateAutomation);
  const deleteAutomation = useAutomationsStore((state) => state.deleteAutomation);
  const setAutomationEnabled = useAutomationsStore((state) => state.setEnabled);
  const restartAutomation = useAutomationsStore((state) => state.restartAutomation);
  const runAutomationNow = useAutomationsStore((state) => state.runAutomationNow);
  const loadRuns = useAutomationsStore((state) => state.loadRuns);
  const deleteRun = useAutomationsStore((state) => state.deleteRun);
  const refreshAutomations = useAutomationsStore((state) => state.refresh);
  const { offPeakTaskService, codingPlanSubscriptionService } = useServices();
  const offPeakTasks = useOffPeakTaskStore((state) => state.tasks);
  const offPeakLoading = useOffPeakTaskStore((state) => state.loading);
  const offPeakGrayConfig = useOffPeakTaskStore((state) => state.grayConfig);
  const offPeakCodingPlanSupport = useOffPeakTaskStore((state) => state.codingPlanSupport);
  const takeNumberAvailability = useOffPeakTaskStore((state) => state.takeNumberAvailability);
  const takeNumberAvailabilityStatus = useOffPeakTaskStore((state) => state.takeNumberAvailabilityStatus);
  const offPeakOperationId = useOffPeakTaskStore((state) => state.operationId);
  const initializeOffPeak = useOffPeakTaskStore((state) => state.initialize);
  const refreshOffPeak = useOffPeakTaskStore((state) => state.refresh);
  const refreshCodingPlanSupport = useOffPeakTaskStore((state) => state.refreshCodingPlanSupport);
  const refreshTakeNumberAvailability = useOffPeakTaskStore((state) => state.refreshTakeNumberAvailability);
  const createOffPeakTask = useOffPeakTaskStore((state) => state.createTask);
  const updateOffPeakTask = useOffPeakTaskStore((state) => state.updateTask);
  const pauseOffPeakTask = useOffPeakTaskStore((state) => state.pauseTask);
  const continueOffPeakTask = useOffPeakTaskStore((state) => state.continueTask);
  const cancelOffPeakTask = useOffPeakTaskStore((state) => state.cancelTask);
  const deleteOffPeakTask = useOffPeakTaskStore((state) => state.deleteTask);
  const deleteOffPeakHistory = useOffPeakTaskStore((state) => state.deleteHistory);
  const consumePendingCreateDraft = useOffPeakTaskStore((state) => state.consumePendingCreateDraft);
  const [refreshing, setRefreshing] = React.useState(false);
  const [viewState, setViewState] = React.useState<AutomationsViewState>({ mode: "list" });
  const [activeTab, setActiveTab] = React.useState<AutomationsTab>("scheduled");
  const activeRemoteTab = isRemoteScopedTab(
    useWorkspaceTabStore((state) => {
      const tab = state.tabs.find((candidate) => candidate.id === state.activeTabId);
      return tab && isWorkspaceTabUsable(tab) ? tab : undefined;
    }),
  );
  const grayEnabled = offPeakGrayConfig?.enabled === true;
  const offPeakCreationEnabled = grayEnabled && !activeRemoteTab;
  const codingPlanInactive =
    offPeakGrayConfig?.codingPlanActive === false ||
    (offPeakGrayConfig?.codingPlanActive === undefined && !offPeakLoading && !isCodingPlanConnectionActiveImpl(offPeakCodingPlanSupport, settings));
  const offPeakVisible = !activeRemoteTab && (grayEnabled || offPeakTasks.length > 0);
  const hasAnyTasks = automations.length > 0 || offPeakTasks.length > 0;
  const tabs = resolveAutomationTabs({ hasAnyTasks, offPeakVisible });
  const activeTabHasTasks = activeTab === "scheduled" ? automations.length > 0 : offPeakTasks.length > 0;
  const { showOffPeakTemplates, showScheduledTemplates } = resolveTemplateVisibility({
    hasAnyTasks,
    offPeakCreationEnabled,
    tab: activeTab,
  });
  const showTemplateSeparator = activeTabHasTasks && (showOffPeakTemplates || showScheduledTemplates);
  const [initializedWorkspaceKey, setInitializedWorkspaceKey] = React.useState<string | null>(null);
  const [nowTick, setNowTick] = React.useState(() => Date.now());
  const offPeakBlock = React.useMemo(() => {
    const reason = resolveOffPeakCreateBlockReason({
      availabilityStatus: takeNumberAvailabilityStatus,
      canTakeNumber: takeNumberAvailability?.canTakeNumber,
      grayEnabled,
      noPlan: codingPlanInactive,
    });
    return {
      reason,
      tooltip:
        reason === "plan"
          ? intl.formatMessage({ id: "offPeak.create.codingPlanOnly" })
          : reason === "unavailable"
            ? intl.formatMessage({ id: "offPeak.create.availabilityUnavailable" })
            : reason === "quota" && takeNumberAvailability?.nextTakeAt !== undefined
              ? intl.formatMessage({ id: "offPeak.create.limitReachedAt" }, { time: formatOffPeakRemainingTime(takeNumberAvailability.nextTakeAt, nowTick, intl) })
              : undefined,
    };
  }, [intl, nowTick, grayEnabled, codingPlanInactive, takeNumberAvailability, takeNumberAvailabilityStatus]);
  const modelSelectGroups = React.useMemo(
    () =>
      buildAutomationModelSelectGroups({
        selectedProvider: "glm",
        providers: modelProviders,
        labels: {
          apiKeyLabel: intl.formatMessage({ id: "settings.modelProvider.apiKey" }),
          apiKeyBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.apiKeyBadge" }),
          codingPlanLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.codingPlan" }),
          codingPlanBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.codingPlanBadge" }),
          startPlanLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.startPlan" }),
          startPlanBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.startPlanBadge" }),
          teamPlanBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.teamPlanBadge" }),
          teamPlanFallbackLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.teamPlan" }),
        },
        displayOrder,
        familyModes: settings?.modelProviderFamilyModes,
        familySelectedKeys: settings?.modelProviderFamilySelectedKeys,
        providerFamilyDomain: settings?.providerFamilyDomain,
        getEntitlementSnapshot: (providerId: string) => entitlements[providerId]?.snapshot ?? null, // 〔A1-R120〕型缝：AMt 归一后 F15 实体参面 : any 无上下文型，箭头补注（束 JS 无此缝）
      }),
    [
      entitlements,
      displayOrder,
      intl,
      modelProviders,
      settings?.modelProviderFamilyModes,
      settings?.modelProviderFamilySelectedKeys,
      settings?.providerFamilyDomain,
    ],
  );

  React.useEffect(() => {
    if (!workspacePath) return;
    const workspaceKey = automationsWorkspaceKey({ workspacePath, workspaceIdentity });
    let cancelled = false;
    setInitializedWorkspaceKey(null);
    setNowTick(Date.now());
    initializeAutomations({ workspacePath, workspaceIdentity, agentService: zcodeAgentService }).then(() => {
      if (!cancelled) setInitializedWorkspaceKey(workspaceKey);
    });
    return () => {
      cancelled = true;
    };
  }, [workspacePath, workspaceIdentity, zcodeAgentService, initializeAutomations]);

  React.useEffect(() => {
    initializeOffPeak({ offPeakTaskService, codingPlanSubscriptionService });
  }, [initializeOffPeak, offPeakTaskService, codingPlanSubscriptionService]);

  React.useEffect(() => {
    const nextTab = resolveValidAutomationTab(activeTab, offPeakVisible);
    if (nextTab !== activeTab) setActiveTab(nextTab);
  }, [offPeakVisible, activeTab]);

  const providerFamilyDomain = settings?.providerFamilyDomain;
  const familyMode = providerFamilyDomain ? settings?.modelProviderFamilyModes?.[providerFamilyDomain] : undefined;
  const familySelectedKey = providerFamilyDomain ? settings?.modelProviderFamilySelectedKeys?.[providerFamilyDomain] : undefined;
  const settingsReady = settings != null;
  const sawSettingsRef = React.useRef(false);

  React.useEffect(() => {
    if (!settingsReady) return;
    if (!sawSettingsRef.current) {
      sawSettingsRef.current = true;
      return;
    }
    refreshCodingPlanSupport(offPeakTaskService);
  }, [settingsReady, refreshCodingPlanSupport, offPeakTaskService, familySelectedKey, familyMode, providerFamilyDomain]);

  React.useEffect(() => {
    const nextTakeAt = takeNumberAvailability?.nextTakeAt;
    if (takeNumberAvailability?.canTakeNumber !== false || nextTakeAt === undefined) return;
    const delay = Math.max(0, nextTakeAt - Date.now()) + 100;
    const timer = setTimeout(() => {
      setNowTick(Date.now());
      refreshTakeNumberAvailability(offPeakTaskService);
    }, delay);
    return () => clearTimeout(timer);
  }, [refreshTakeNumberAvailability, offPeakTaskService, takeNumberAvailability]);

  React.useEffect(() => {
    const nextTakeAt = takeNumberAvailability?.nextTakeAt;
    if (takeNumberAvailability?.canTakeNumber !== false || nextTakeAt === undefined) return;
    const remaining = nextTakeAt - Date.now();
    if (remaining <= 0) return;
    const minute = 60_000;
    const mod = remaining % minute;
    const delay = (mod === 0 ? minute : mod) + 50;
    const timer = setTimeout(() => setNowTick(Date.now()), delay);
    return () => clearTimeout(timer);
  }, [nowTick, takeNumberAvailability]);

  React.useEffect(() => {
    if (viewState.mode !== "list" || offPeakTasks.length === 0) return;
    const timer = setInterval(() => {
      refreshOffPeak(offPeakTaskService);
    }, 10_000);
    return () => clearInterval(timer);
  }, [viewState.mode, offPeakTasks.length, refreshOffPeak, offPeakTaskService]);

  const refreshAll = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshAutomations(zcodeAgentService), refreshOffPeak(offPeakTaskService), ...(grayEnabled ? [refreshTakeNumberAvailability(offPeakTaskService)] : [])]);
      setNowTick(Date.now());
    } finally {
      setRefreshing(false);
    }
  }, [grayEnabled, refreshOffPeak, refreshTakeNumberAvailability, offPeakTaskService, refreshAutomations, zcodeAgentService]);

  React.useEffect(() => {
    const draft = consumePendingCreateDraft();
    if (draft && !activeRemoteTab) {
      setActiveTab("idle");
      setViewState({ mode: "offpeak-create", draft });
    }
  }, [consumePendingCreateDraft, activeRemoteTab]);

  React.useEffect(() => {
    if (!activeRemoteTab) return;
    setActiveTab((previous) => (previous === "idle" ? "scheduled" : previous));
    setViewState((previous) => (previous.mode === "offpeak-create" || previous.mode === "offpeak-edit" ? { mode: "list" } : previous));
  }, [activeRemoteTab]);

  const openCodingPlanUpgradeFlow = React.useCallback(() => {
    const providerId = settings?.providerFamilyDomain === "bigmodel" ? providerIds.bigmodelCodingPlan : providerIds.zaiCodingPlan;
    openCodingPlanUpgrade({
      providerId,
      initialAudience: "personal",
      funnelContext: buildIdleUpgradeFunnelContext({
        providerId,
        eventText: intl.formatMessage({ id: "settings.modelProvider.codingPlan.upgrade" }),
        entryPlanState: resolveEntryPlanState({ providers: modelProviders, loading: providersLoading }),
      }),
    });
  }, [intl, modelProviders, providersLoading, openCodingPlanUpgrade, settings?.providerFamilyDomain]);

  const showCodingPlanToast = React.useCallback(() => {
    automationsToast(intl.formatMessage({ id: "offPeak.create.codingPlanToast" }), {
      durationMs: 8_000,
      position: "top-center",
      variant: "info",
      actionLabel: intl.formatMessage({ id: "settings.modelProvider.codingPlan.upgrade" }),
      onAction: openCodingPlanUpgradeFlow,
      dismissible: true,
      dismissLabel: intl.formatMessage({ id: "common.close" }),
    });
  }, [openCodingPlanUpgradeFlow, intl]);

  const showCreateLimitToast = React.useCallback(() => {
    automationsToast(intl.formatMessage({ id: "automations.error.createLimit" }, { limit: "20" }));
  }, [intl]);

  React.useEffect(() => {
    const workspaceKey = workspacePath ? automationsWorkspaceKey({ workspacePath, workspaceIdentity }) : null;
    const request = resolveOpenAutomationRequest(automations, openAutomationId, workspaceKey !== null && initializedWorkspaceKey === workspaceKey);
    if (request.status === "pending") return;
    if (request.status === "found") setViewState({ mode: "edit", automation: request.target });
    else automationsToast(intl.formatMessage({ id: "automations.error.targetNotFound" }));
    onOpenAutomationConsumed?.();
  }, [automations, intl, initializedWorkspaceKey, onOpenAutomationConsumed, openAutomationId, workspaceIdentity, workspacePath]);

  const handleCreateManually = React.useCallback(() => {
    if (createLimitReached) {
      showCreateLimitToast();
      return;
    }
    setViewState({ mode: "create", draft: null });
  }, [createLimitReached, showCreateLimitToast]);

  const handleCreateViaChatOrManually = React.useCallback(() => {
    if (createLimitReached) {
      showCreateLimitToast();
      return;
    }
    if (activeRemoteTab) {
      setViewState({ mode: "create", draft: null });
      return;
    }
    if (onCreateViaChat) onCreateViaChat(intl.formatMessage({ id: "automations.createViaChat.prompt" }));
    else setViewState({ mode: "create", draft: null });
  }, [createLimitReached, activeRemoteTab, intl, onCreateViaChat, showCreateLimitToast]);

  const handleCreateFromTemplate = React.useCallback(
    (template: { id: string; cronExpr: string }) => {
      if (createLimitReached) {
        showCreateLimitToast();
        return;
      }
      setViewState({
        mode: "create",
        draft: {
          templateId: template.id,
          title: intl.formatMessage({ id: `automations.template.${template.id}.title` }),
          cronExpr: template.cronExpr,
          prompt: intl.formatMessage({ id: `automations.template.${template.id}.prompt` }),
        },
      });
    },
    [createLimitReached, intl, showCreateLimitToast],
  );

  const handleSubmitAutomation = React.useCallback(
    async ({ input, workspacePath: targetPath, workspaceIdentity: targetIdentity }: { input: AutomationInput; workspacePath: string; workspaceIdentity?: string | null }) => {
      if (viewState.mode === "edit") {
        const updated = await updateAutomation(viewState.automation.automationId, input, zcodeAgentService);
        if (updated) setNowTick(Date.now());
        else automationsToast(intl.formatMessage({ id: automationErrorLabelId("update") }));
        return updated;
      }
      if (createLimitReached) {
        showCreateLimitToast();
        return false;
      }
      const created = await createAutomation({ ...input, workspacePath: targetPath, workspaceIdentity: targetIdentity }, zcodeAgentService);
      reportAutomationCreateResult(platformService, {
        automationId: created?.automationId,
        cronExpr: input.cronExpr ?? "",
        templateId: viewState.mode === "create" ? viewState.draft?.templateId : undefined,
        error: useAutomationsStore.getState().error,
        modelFields: buildAutomationModelTelemetryFields(input.model, input.provider, modelProviders),
      });
      if (!created) {
        const error = useAutomationsStore.getState().error;
        automationsToast(intl.formatMessage({ id: resolveCreateErrorLabelId(error) }, { limit: "20" }));
        return false;
      }
      setNowTick(Date.now());
      return true;
    },
    [createLimitReached, createAutomation, intl, modelProviders, platformService, showCreateLimitToast, updateAutomation, viewState, zcodeAgentService],
  );

  const handleToggleAutomation = React.useCallback(
    async (automation: AutomationRecord, enabled: boolean) => {
      await setAutomationEnabled(automation.automationId, enabled, zcodeAgentService);
      if (useAutomationsStore.getState().error) {
        automationsToast(intl.formatMessage({ id: automationErrorLabelId("toggle") }));
        return;
      }
      setViewState((previous) =>
        previous.mode === "edit" && previous.automation.automationId === automation.automationId
          ? {
              mode: "edit",
              automation: {
                ...previous.automation,
                enabled,
                lifecycleStatus: enabled ? "active" : "paused",
              },
            }
          : previous,
      );
      setNowTick(Date.now());
    },
    [intl, setAutomationEnabled, zcodeAgentService],
  );

  const handleRestartAutomation = React.useCallback(
    async (automation: AutomationRecord) => {
      await restartAutomation(automation.automationId, zcodeAgentService);
      if (useAutomationsStore.getState().error) automationsToast(intl.formatMessage({ id: automationErrorLabelId("restart") }));
      else setNowTick(Date.now());
    },
    [intl, restartAutomation, zcodeAgentService],
  );

  const handleRunNow = React.useCallback(
    async (automation: AutomationRecord, source: string = "list") => {
      logger.debug("[automations] 立即运行交互开始", { automationId: automation.automationId, source });
      reportAutomationAction(platformService, { action: "run_now", source, automation, providers: modelProviders });
      const result = await runAutomationNow(automation.automationId, zcodeAgentService);
      logger.debug("[automations] 立即运行交互结束", {
        automationId: automation.automationId,
        source,
        result,
      });
      if (result === "queued") {
        await loadRuns(automation.automationId, zcodeAgentService, true);
        const sessionId = useAutomationsStore.getState().runsCache[automation.automationId]?.runs?.find(
          (run) => run.trigger === "manual" && !!run.sessionId,
        )?.sessionId;
        automationsToast(intl.formatMessage({ id: "scheduledPreview.toast.running" }, { title: automation.title }), {
          durationMs: 4_000,
          position: "top-center",
          variant: "info",
          ...(sessionId && onOpenSession
            ? {
                actionLabel: intl.formatMessage({ id: "scheduledPreview.toast.view" }),
                onAction: () =>
                  onOpenSession({
                    sessionId,
                    workspacePath: automation.workspacePath ?? "", // A0-CLEANUP3 3b §C：workspacePath 对齐为可选，运行期恒有值
                    workspaceIdentity: automation.workspaceIdentity,
                  }),
              }
            : {}),
          dismissible: true,
          dismissLabel: intl.formatMessage({ id: "common.close" }),
        });
        setNowTick(Date.now());
      } else if (result === "duplicate" || result === "failed") {
        automationsToast(intl.formatMessage({ id: resolveRunNowErrorLabelId(result) }));
      }
    },
    [intl, loadRuns, modelProviders, onOpenSession, platformService, runAutomationNow, zcodeAgentService],
  );

  const handleDeleteAutomation = React.useCallback(
    async (automation: AutomationRecord, source: string = "list") => {
      const confirmed = await confirmDialog({
        presentation: "automation-confirmation",
        title: intl.formatMessage({ id: "automations.delete.title" }),
        description: intl.formatMessage({ id: "automations.delete.description" }, { title: automation.title }),
        confirmLabel: intl.formatMessage({ id: "common.delete" }),
        confirmVariant: "destructive",
        showKeyboardHints: false,
      });
      if (!confirmed) return;
      reportAutomationAction(platformService, { action: "delete", source, automation, providers: modelProviders });
      await deleteAutomation(automation.automationId, zcodeAgentService);
      if (useAutomationsStore.getState().error) automationsToast(intl.formatMessage({ id: automationErrorLabelId("delete") }));
      setViewState((previous) =>
        previous.mode === "edit" && previous.automation.automationId === automation.automationId ? { mode: "list" } : previous,
      );
    },
    [confirmDialog, deleteAutomation, intl, modelProviders, platformService, zcodeAgentService],
  );

  const handleOpenRunSession = React.useCallback(
    (run: { sessionId?: string | null; workspacePath?: string; workspaceIdentity?: string | null }) => {
      if (!run.sessionId || !onOpenSession) return;
      onOpenSession({
        sessionId: run.sessionId,
        workspacePath: run.workspacePath ?? "",
        ...(run.workspaceIdentity ? { workspaceIdentity: run.workspaceIdentity } : {}),
      });
    },
    [onOpenSession],
  );

  const handleOpenOffPeakEditor = React.useCallback((task: OffPeakTask) => {
    setViewState({ mode: "offpeak-edit", task });
  }, []);

  const handleCancelOffPeakTask = React.useCallback(
    async (task: OffPeakTask) => {
      const confirmed = await confirmDialog({
        title: intl.formatMessage({ id: "offPeak.cancel.title" }),
        description: intl.formatMessage({ id: "offPeak.cancel.description" }, { title: task.title || task.prompt }),
        confirmLabel: intl.formatMessage({ id: "offPeak.action.cancel" }),
      });
      if (!confirmed) return;
      await cancelOffPeakTask(task.offPeakTaskId, offPeakTaskService);
      const error = useOffPeakTaskStore.getState().error;
      if (error) automationsToast(error);
    },
    [confirmDialog, intl, cancelOffPeakTask, offPeakTaskService],
  );

  const handleDeleteOffPeakTask = React.useCallback(
    async (task: OffPeakTask) => {
      const confirmed = await confirmDialog({
        title: intl.formatMessage({ id: "offPeak.delete.title" }),
        description: intl.formatMessage({ id: "offPeak.delete.description" }),
        confirmLabel: intl.formatMessage({ id: "offPeak.delete.confirm" }),
      });
      if (!confirmed) return;
      await deleteOffPeakTask(task.offPeakTaskId, offPeakTaskService);
      const error = useOffPeakTaskStore.getState().error;
      if (error) automationsToast(error);
      setViewState((previous) =>
        previous.mode === "offpeak-edit" && previous.task.offPeakTaskId === task.offPeakTaskId ? { mode: "list" } : previous,
      );
    },
    [confirmDialog, intl, deleteOffPeakTask, offPeakTaskService],
  );

  const handleDeleteOffPeakHistoryEntry = React.useCallback(
    async (task: OffPeakTask) => {
      await deleteOffPeakHistory(task.offPeakTaskId, offPeakTaskService);
      const error = useOffPeakTaskStore.getState().error;
      if (error) automationsToast(error);
    },
    [deleteOffPeakHistory, offPeakTaskService],
  );

  const handleSubmitOffPeak = React.useCallback(
    async (input: OffPeakCreateInput): Promise<boolean> => {
      const current = viewState;
      const telemetryContext =
        current.mode === "offpeak-create"
          ? buildOffPeakTelemetryContext({ source: current.draft?.telemetrySource, model: input.model })
          : null;
      if (current.mode !== "offpeak-edit" && offPeakBlock.reason !== null) {
        if (offPeakBlock.reason === "plan") showCodingPlanToast();
        else if (offPeakBlock.reason === "unavailable") automationsToast(intl.formatMessage({ id: "offPeak.error.unavailable" }));
        else automationsToast(offPeakBlock.tooltip ?? intl.formatMessage({ id: "offPeak.error.quota" }));
        if (telemetryContext)
          reportOffPeakCreateResult(
            platformService,
            telemetryContext,
            {
              ok: false,
              task: { offPeakTaskId: "", title: "", prompt: "", status: "cancelled" },
              failureStage: "client_validation",
              errorCategory: "client_validation",
              errorCode: "",
              providerName: "",
            },
          );
        return false;
      }
      if (current.mode === "offpeak-edit") {
        const updated = await updateOffPeakTask(
          current.task.offPeakTaskId,
          {
            title: input.title,
            prompt: input.prompt,
            permissionMode: input.permissionMode,
            model: input.model ?? null,
            thoughtLevel: input.thoughtLevel ?? null,
          },
          offPeakTaskService,
        );
        if (!updated) automationsToast(intl.formatMessage({ id: "offPeak.error.generic" }));
        return updated;
      }
      const result =
        telemetryContext === null
          ? await createOffPeakTask(input, offPeakTaskService)
          : await withOffPeakCreateTelemetry(platformService, telemetryContext, () => createOffPeakTask(input, offPeakTaskService));
      if (!result.ok) automationsToast(intl.formatMessage({ id: resolveOffPeakErrorLabelId(result) }));
      return result.ok;
    },
    [intl, createOffPeakTask, offPeakBlock, offPeakTaskService, updateOffPeakTask, platformService, showCodingPlanToast, viewState],
  );

  if (!workspacePath)
    return (
      <div className="rounded-lg border border-card-border bg-card px-3 py-2 text-ui-base text-foreground-subtle">
        {intl.formatMessage({ id: "automations.noWorkspace" })}
      </div>
    );

  if (viewState.mode === "offpeak-create" || viewState.mode === "offpeak-edit")
    return (
      <OffPeakTaskEditor
        editing={
          viewState.mode === "offpeak-edit"
            ? (offPeakTasks.find((task) => task.offPeakTaskId === viewState.task.offPeakTaskId) ?? viewState.task)
            : null
        }
        initialDraft={viewState.mode === "offpeak-create" ? (viewState.draft ?? null) : null}
        allowedModels={offPeakGrayConfig?.allowedModels ?? []}
        allowedModelConfigs={offPeakGrayConfig?.allowedModelConfigs ?? []}
        defaultWorkspacePath={workspacePath ?? ""}
        defaultWorkspaceIdentity={workspaceIdentity}
        saving={offPeakOperationId?.startsWith("offpeak:create") || offPeakOperationId?.startsWith("offpeak:update") || false}
        createBlocked={viewState.mode === "offpeak-create" && offPeakBlock.reason !== null}
        createBlockedTooltip={offPeakBlock.tooltip}
        onBack={() => setViewState({ mode: "list" })}
        onSubmit={handleSubmitOffPeak}
        onOpenSession={onOpenSession}
        onDelete={(task: OffPeakTask) => void handleDeleteOffPeakTask(task)}
        onDeleteHistory={(task) => void handleDeleteOffPeakHistoryEntry(task)}
        onPause={(task: OffPeakTask) => void pauseOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
        onContinue={(task: OffPeakTask) => void continueOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
        showToast={automationsToast}
      />
    );

  if (viewState.mode === "list")
    return (
      <div data-automations-content="true" className={cn(AUTOMATIONS_MAIN_CONTAINER_CLASS, "flex flex-col")}>
        <div className="flex flex-col gap-3">
          <h1 className="text-[30px] font-medium leading-[34px] tracking-[0.114px] text-foreground">
            {intl.formatMessage({ id: "settings.automations.title" })}
          </h1>
          <p className="text-ui-base leading-5 text-foreground-subtlest">
            {intl.formatMessage({ id: hasAnyTasks ? "automations.description.populated" : "automations.description" })}
          </p>
        </div>
        {tabs.length > 0 ? (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2" data-testid={AUTOMATIONS_OFFPEAK_TAB_TESTID}>
              {tabs.map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  size="xs"
                  variant={activeTab === tab ? "secondary" : "ghost"}
                  className={cn(
                    "h-7 rounded-lg px-2.5 text-ui-base font-normal",
                    activeTab !== tab && "text-foreground-subtle hover:bg-surface-hover hover:text-foreground",
                  )}
                  onClick={() => setActiveTab(tab)}
                >
                  {intl.formatMessage({ id: `offPeak.tabs.${tab}` })}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Tooltip title={intl.formatMessage({ id: refreshing ? "automations.refreshing" : "automations.refresh" })}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={intl.formatMessage({ id: "automations.refresh" })}
                  onClick={() => void refreshAll()}
                  disabled={refreshing}
                >
                  <AutomationRefreshIcon className={cn("size-3.5", refreshing && "animate-spin")} aria-hidden="true" />
                </Button>
              </Tooltip>
              {activeTab === "idle" ? null : (
                <AutomationCreateSplitButton
                  onViaChat={handleCreateViaChatOrManually}
                  onManually={handleCreateManually}
                  appearance={activeTab === "scheduled" ? "primary" : "outline"}
                />
              )}
              {showOffPeakTemplates ? (
                <OffPeakCreateButton greyReason={offPeakBlock.reason} greyTooltip={offPeakBlock.tooltip} onCreate={() => setViewState({ mode: "offpeak-create" })} />
              ) : null}
            </div>
          </div>
        ) : null}
        {automationsLoading && automations.length === 0 && offPeakTasks.length === 0 ? (
          <div className="mt-8 flex h-40 items-center justify-center">
            <LoadingSpinner className="size-5" />
          </div>
        ) : (
          <div className={cn("flex flex-col gap-8", hasAnyTasks ? "mt-5" : "mt-8")}>
            <div className="flex w-full flex-col gap-4">
              {hasAnyTasks ? (
                <KeepAwakeBanner checked={settings?.keepAwakeWhileRunning ?? false} onChange={(checked) => void updateSettings({ keepAwakeWhileRunning: checked })} />
              ) : null}
              <div data-automations-task-grid="true" className="contents">
                {offPeakVisible && activeTab !== "scheduled" && offPeakTasks.length > 0 ? (
                  <section className="flex w-full flex-col gap-4">
                    <OffPeakTaskList
                      tasks={offPeakTasks}
                      busyOperationId={offPeakOperationId}
                      onOpen={handleOpenOffPeakEditor}
                      onPause={(task: OffPeakTask) => void pauseOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
                      onContinue={(task: OffPeakTask) => void continueOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
                      onCancel={(task: OffPeakTask) => void handleCancelOffPeakTask(task)}
                      onDelete={(task: OffPeakTask) => void handleDeleteOffPeakTask(task)}
                      onOpenSession={handleOpenRunSession}
                    />
                  </section>
                ) : null}
                {activeTab === "idle" ? null : automations.length > 0 ? (
                  <section className="flex w-full flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-ui-base font-medium leading-5 text-foreground-subtle">
                        {intl.formatMessage({ id: "automations.createdLabel" })}
                      </h2>
                      {tabs.length === 0 ? <AutomationCreateSplitButton onViaChat={handleCreateViaChatOrManually} onManually={handleCreateManually} /> : null}
                    </div>
                    <div
                      data-testid={AUTOMATIONS_LIST_TESTID}
                      className={cn(
                        "grid grid-cols-1 auto-rows-[132px] gap-x-4 gap-y-4 lg:grid-cols-2",
                        automations.length > 8 && "max-h-[1198px] overflow-y-auto overscroll-contain lg:max-h-[606px]",
                      )}
                    >
                      {automations.map((automation) => {
                        const lifecycleTier = resolveAutomationLifecycleTier(automation);
                        const failed = hasAutomationFailure(automation);
                        const presentation = AUTOMATION_LIFECYCLE_PRESENTATION[lifecycleTier];
                        const TierIcon = presentation.icon;
                        const frequencyLabel = describeAutomationFrequency(automation, intl);
                        const nextRunLabel = describeAutomationNextRun(automation.nextRunAt, nowTick, intl);
                        const scheduleLabel =
                          lifecycleTier === "active" && !failed && nextRunLabel
                            ? `${frequencyLabel} · ${intl.formatMessage({ id: "automations.nextRun" }, { when: nextRunLabel })}`
                            : frequencyLabel;
                        const runCountLabel = intl.formatMessage({ id: "automations.runCount" }, { count: String(automation.runCount) });
                        const busy = operationId?.endsWith(`:${automation.automationId}`) ?? false;
                        const canRestart = isAutomationFailed(automation);
                        const canToggle = isAutomationOperable(automation);
                        return (
                          <div
                            key={automation.automationId}
                            data-testid={AUTOMATION_CARD_TESTID}
                            role="button"
                            tabIndex={0}
                            onClick={() => setViewState({ mode: "edit", automation })}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setViewState({ mode: "edit", automation });
                              }
                            }}
                            className={cn(
                              "group relative flex h-full min-h-0 cursor-pointer gap-3 overflow-hidden rounded-xl border border-card-border bg-background p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused",
                              lifecycleTier === "completed" ? "opacity-60" : "hover:bg-hover",
                            )}
                          >
                            <div className="flex h-full min-w-0 flex-1 flex-col gap-3">
                              <span className="block truncate pr-12 text-ui-base font-medium leading-5 text-foreground">{automation.title}</span>
                              <p className="text-wrap-phrase line-clamp-2 h-10 text-ui-base font-normal leading-5 text-foreground-subtle">
                                {normalizeAutomationPrompt(automation.prompt)}
                              </p>
                              <div className="mt-auto flex h-6 min-w-0 items-center gap-2 text-ui-base leading-5">
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  {failed ? (
                                    <>
                                      <span className="inline-flex shrink-0 items-center py-0.5 pl-1 pr-2 font-normal text-destructive">
                                        <span className="flex size-5 shrink-0 items-center justify-center">
                                          <IconAlertTriangle className="size-4" strokeWidth={1.33} aria-hidden="true" />
                                        </span>
                                        <span className="pl-1">{intl.formatMessage({ id: "automations.lifecycle.failed" })}</span>
                                      </span>
                                      <span className="inline-flex min-w-0 items-center rounded-md bg-success/10 py-0.5 pl-1 pr-2 font-normal text-success opacity-40">
                                        <span className="flex size-5 shrink-0 items-center justify-center">
                                          <AutomationClockIcon className="size-4" aria-hidden="true" />
                                        </span>
                                        <span className="truncate pl-1">{scheduleLabel}</span>
                                      </span>
                                    </>
                                  ) : lifecycleTier === "active" ? (
                                    <AutomationSchedulePill
                                      text={scheduleLabel}
                                      icon={<TierIcon className="size-4 shrink-0" strokeWidth={1.33} aria-hidden="true" />}
                                    />
                                  ) : (
                                    <>
                                      <span className={cn("inline-flex shrink-0 items-center gap-1 font-normal", presentation.className)}>
                                        <span className="flex size-5 shrink-0 items-center justify-center">
                                          <TierIcon className="size-4 shrink-0" strokeWidth={1.33} aria-hidden="true" />
                                        </span>
                                        {intl.formatMessage({ id: `automations.lifecycle.${lifecycleTier}` })}
                                      </span>
                                      {lifecycleTier === "paused" || lifecycleTier === "completed" ? (
                                        <AutomationSchedulePill dimmed text={scheduleLabel} icon={<AutomationClockIcon className="size-4" aria-hidden="true" />} />
                                      ) : null}
                                    </>
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "inline-flex shrink-0 items-center whitespace-nowrap rounded-md bg-surface px-1.5 py-0.5 text-ui-base font-normal text-foreground-subtle",
                                    (failed || lifecycleTier === "paused") && "opacity-40",
                                  )}
                                >
                                  {runCountLabel}
                                </span>
                              </div>
                            </div>
                            <div className="absolute right-3 top-3 flex items-center gap-1">
                              {busy ? <LoadingSpinner className="size-3.5" /> : null}
                              <AutomationCardMenu
                                automation={automation}
                                busy={busy}
                                canRestart={canRestart}
                                canToggle={canToggle}
                                onRunNow={handleRunNow}
                                onEdit={(target) => setViewState({ mode: "edit", automation: target })}
                                onToggle={handleToggleAutomation}
                                onRestart={handleRestartAutomation}
                                onDelete={handleDeleteAutomation}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : (
                  <div
                    data-automations-empty-state="true"
                    className="flex h-[226px] w-full items-center justify-center rounded-2xl border border-card-border bg-background px-4"
                  >
                    <div className="flex translate-y-2 flex-col items-center gap-5">
                      <p className="text-ui-base font-medium leading-5 text-foreground-subtlest">
                        {intl.formatMessage({ id: "automations.empty.title" })}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <AutomationCreateSplitButton onViaChat={handleCreateViaChatOrManually} onManually={handleCreateManually} />
                        {offPeakCreationEnabled && offPeakTasks.length === 0 ? (
                          <OffPeakCreateButton greyReason={offPeakBlock.reason} greyTooltip={offPeakBlock.tooltip} onCreate={() => setViewState({ mode: "offpeak-create" })} />
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {hasAnyTasks ? null : (
                <KeepAwakeBanner checked={settings?.keepAwakeWhileRunning ?? false} onChange={(checked) => void updateSettings({ keepAwakeWhileRunning: checked })} />
              )}
            </div>
            {showTemplateSeparator ? (
              <div data-automations-task-template-separator="true" className="flex w-full flex-col py-2" aria-hidden="true">
                <div className="h-px w-full bg-card-border" />
              </div>
            ) : null}
            {showOffPeakTemplates ? (
              <section data-automations-idle-templates="true" className="flex w-full flex-col gap-4">
                <h2 className="text-ui-base font-medium leading-5 text-foreground-subtle">
                  {intl.formatMessage({ id: "offPeak.templates.sectionTitle" })}
                </h2>
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  {OFFPEAK_TEMPLATES.map((template) => {
                    const planBlocked = offPeakBlock.reason === "plan";
                    return (
                      <div key={template.id} className="h-full">
                        <button
                          type="button"
                          onClick={() => {
                            if (planBlocked) {
                              showCodingPlanToast();
                              return;
                            }
                            setViewState({
                              mode: "offpeak-create",
                              draft: {
                                title: intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.title` }),
                                prompt: intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.prompt` }),
                                telemetrySource: {
                                  eventRegion: "app.automations",
                                  templateId: template.id,
                                },
                              },
                            });
                          }}
                          className="flex h-full min-h-[114px] w-full flex-col gap-2 overflow-hidden rounded-xl border border-card-border bg-background p-3 text-left transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                        >
                          <div className="flex items-center gap-0.5">
                            <OffPeakTemplateIcon className="size-4 shrink-0 text-foreground-subtle" name={template.id} />
                            <span className="truncate px-1 text-ui-base font-medium leading-5 text-foreground">
                              {intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.title` })}
                            </span>
                          </div>
                          <p className="text-wrap-phrase line-clamp-2 flex-1 text-ui-base font-normal leading-5 text-foreground-subtle">
                            {intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.description` })}
                          </p>
                          <div className="text-ui-base font-normal leading-5 text-foreground-subtle">
                            {intl.formatMessage({ id: "offPeak.form.soonestAvailable" })}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}
            {showScheduledTemplates ? (
              <section data-automations-scheduled-templates="true" className="flex w-full flex-col gap-4">
                <h2 className="text-ui-base font-medium leading-5 text-foreground-subtle">{intl.formatMessage({ id: "automations.moreIdeas" })}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {SCHEDULED_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleCreateFromTemplate(template)}
                      className="group flex min-h-[114px] flex-col gap-2 overflow-hidden rounded-xl border border-card-border bg-background p-3 text-left transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                    >
                      <div className="flex min-w-0 items-center gap-1">
                        <span className="flex size-5 shrink-0 items-center justify-center">
                          <AutomationTemplateIcon className="text-foreground-subtle" name={template.icon} />
                        </span>
                        <span className="truncate text-ui-base font-medium leading-5 text-foreground">
                          {intl.formatMessage({ id: `automations.template.${template.id}.title` })}
                        </span>
                      </div>
                      <p className="line-clamp-2 flex-1 text-ui-base font-normal leading-5 text-foreground-subtle">
                        {intl.formatMessage({ id: `automations.template.${template.id}.description` })}
                      </p>
                      <div className="text-ui-base font-normal leading-5 text-foreground-subtle">
                        {intl.formatMessage({ id: `automations.template.${template.id}.schedule` })}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    );

  return (
    <AutomationEditor
      editing={viewState.mode === "edit" ? viewState.automation : null}
      initialDraft={viewState.mode === "create" ? viewState.draft : null}
      defaultWorkspacePath={workspacePath}
      defaultWorkspaceIdentity={workspaceIdentity}
      modelProviders={modelProviders}
      modelSelectGroups={modelSelectGroups}
      saving={operationId?.startsWith("automation:create") || operationId?.startsWith("automation:update") || false}
      onBack={() => setViewState({ mode: "list" })}
      onSubmit={handleSubmitAutomation}
      onRunNow={(automation) => handleRunNow(automation, "editor")}
      onToggle={handleToggleAutomation}
      onDelete={(automation) => handleDeleteAutomation(automation, "editor")}
      runsEntry={viewState.mode === "edit" ? runsCache[viewState.automation.automationId] : undefined}
      onLoadRuns={() => {
        if (viewState.mode === "edit") loadRuns(viewState.automation.automationId, zcodeAgentService, true);
      }}
      onDeleteRun={(runId) => {
        if (viewState.mode === "edit") deleteRun(viewState.automation.automationId, runId, zcodeAgentService);
      }}
      onOpenSession={
        viewState.mode === "edit" && onOpenSession
          ? (sessionId) => {
              onOpenSession({
                sessionId,
                workspacePath: viewState.automation.workspacePath ?? "", // A0-CLEANUP3 3b §C：workspacePath 对齐为可选，运行期恒有值
                workspaceIdentity: viewState.automation.workspaceIdentity,
              });
            }
          : undefined
      }
    />
  );
};
