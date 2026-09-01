// A0-S4-4c: 自 modules/Home.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/shell/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * Home.tsx — ZCode 3.7.6 Home 族（草稿态首页：hero+问候+工作区行+composer 卡+建议卡+banner）
 *            （解混淆重建 · D8 Stage B / F02）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 结构结论（MODULE-MAP.md F02）：ZCode 的 Home 不是独立视图，而是会话面板 `R0` 的
 * draftMode 形态：`R0` 在 draft 态把 `git`(=memo(hit)) composer 以 `centered/draftMode`
 * 挂载、把 `Sit` 问候 hero 作为消息列表 emptyState、把 `kit` off-peak 横幅（含 3 张建议卡）
 * 挂在 composer 之下；工作区行 `a4` + 分支 chip `zZ` 由窗口壳 `yJt` 组装成 contextHeader
 * 注入 composer 卡顶部（js 184540–184577）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  问候 hero（draft emptyState）：
 *   vit  → GREETING_HOUR_BOUNDARIES [5,9,12,14,18,23]   (91182 / 78837)
 *   gX   → GREETING_MIN_FONT_SIZE_PX = 20               (91183 / 78838)
 *   _X   → GREETING_MAX_FONT_SIZE_PX = 30               (91184 / 78839)
 *   yit  → resolveGreetingI18nId     按时段 6 档选 key  (91185 / 78840)
 *   bit  → msUntilNextGreetingBoundary                  (91202 / 78844)
 *   xit  → fitGreetingFontSize       20–30px 自适应     (91212 / 78854)
 *   Sit  → GreetingHero              问候语+品牌线框底图 (91219 / 78861)
 *   Cit  → HomeHeroLogo              品牌线框 SVG        (91322 / 78922)
 *
 *  composer 卡（draft 态根组件，props: snapshot/draftMode/draftConfig/contextHeader/centered）：
 *   hit  → DraftComposerRegion       (90180–91174 / 78144)
 *   git  → DraftComposerRegionMemo = memo(hit)          (91174 / 78829)
 *   dit  → applyExternalTextInsertRequest               (90132 / 78112)
 *   fit  → applyComposerRestoreRequest                  (90150 / 78122)
 *   pit  → areStringArraysEqual                         (90176 / 78136)
 *   mit  → formatLineCount                              (90178 / 78139)
 *   _it  → isEventInsideDialog（R0 Escape 守卫用）      (91176 / 78830)
 *
 *  off-peak 横幅 + 建议卡（draft 态、本地工作区才显示）：
 *   vX   → toErrorMessage                               (91337 / 78937 附近)
 *   wit  → hasCodingPlanProviderEntry                   (91340 / —)
 *   Tit  → isCodingPlanConnectionSelected               (91348 / —)
 *   Eit  → isQuota3103Error                             (91355 / —)
 *   Dit  → resolveOffPeakErrorI18nId                    (91358 / —)
 *   bX   → useOffPeakTaskStore（zustand）               (91368 / 78945)
 *   Oit  → OFF_PEAK_HOME_TEMPLATES [standupGitSummary, ciFlakyReport, customize] (91590 / 79215)
 *   kit  → OffPeakNewTaskBanner（📢 横幅 + 3 张建议卡）  (91591 / 79222)
 *
 *  工作区选择行（contextHeader 左件）：
 *   mOt  → resolveHomePathPrefix                        (128526 / 108386)
 *   hOt  → homeAwareDisplayName                         (128533 / 108389)
 *   gOt  → workspaceMenuLabel                           (128538 / 108393)
 *   _Ot  → workspaceTriggerLabel                        (128542 / 108397)
 *   vOt  → isSameWorkspaceTab                           (128546 / 108401)
 *   yOt  → remoteTabSearchHaystack                      (128549 / 108404)
 *   bOt  → filterWorkspaceTabsForMenu（搜索、前 5 条）  (128554 / 108407)
 *   a4   → WorkspaceSelectionRow                        (128568–128776 / 108415)
 *   UTt  → useRemoteWorkspaceEnabled（恒 true）         (123177 / —)
 *   N2   → isRemoteWorkspaceTab                         (123199 / —)
 *   pOt  → = fOt RemoteWizardDialog（F10，接口保留）    (128525 / —)
 *
 *  提及菜单（@#> / $ / 斜杠 面板的可见层）：
 *   mC   → mentionTriggerChar（commands→`>`、conversations→`#`、files→`@`）(36348 / 33369)
 *   Pqe  → MENTION_TRIGGER_REGEX /(^|\s)([/@$#¥￥])([^\s/@$#¥￥]*)$/ (64024 / —)
 *   Fqe  → MENTION_TOKEN_PREFIX_REGEX                   (64025 / —)
 *   Iqe  → normalizeCnyTrigger（¥/￥ → $）              (64026 / —)
 *   tV   → parseMentionTrigger                          (64061 / —)
 *   SV   → SuggestionPanel（虚拟滚动面板）              (64639 / 57678)
 *   _Je  → SuggestionSectionHeaderRow                   (64776 / —)
 *   vJe  → SuggestionStatusRow（loading/error/empty）   (64785 / —)
 *   yJe  → SuggestionOptionRow                          (64813 / —)
 *   （KJe MentionSelector js 65605 / SJe SlashPanel js 65002：Lexical 接线层，接口保留，属 F08）
 *
 *  建议卡文案数据（地图备注所指，实为提及面板技能段文案，非 3 张卡）：
 *   Dqe  → OFFICIAL_SKILL_PLUGINS Set                   (63845 / 56970)
 *   kqe  → CURATED_SKILL_DESCRIPTIONS（zh-CN/en-US）    (63868 / —)
 *   jqe  → curatedSkillDescription                      (63975 / —)
 *
 *  图标（Sa=createLucideIcon，js 行）：
 *   T_ arrow-up 26663（发送）| Wv square 27823（停止）| Yye megaphone 27358（横幅 📢）
 *   xv moon 27468（建议卡）| gbe rotate-ccw 27705（重试）| xye clipboard-pen-line 26884
 *   sv house 27214 | $_ folder 27133 | U_ cloud 26918 | Nye folder-plus 27112
 *   gv message-circle 27390 | Fv search 27732 | N_ chevron-down 26802
 *   fv loader 27315（EN Spinner 用）| p info（imeComposition chunk `Ht` 导出）
 *   g close-x（imeComposition chunk `b` 导出）
 *
 *  data-testid 常量（来自 src-HCld2afU.js，括号内为字符串值）：
 *   Ht=v4-composer | St=chat-attachment-menu-item | At=chat-attachment-button
 *   Ot=v4-stop | see=v4-composer-send | un=v4-composer-input
 *   Yee=v4-paused-queue-send-dialog | Sne=v4-composer-clear-queue-send
 *   pee=v4-composer-keep-queue-send | Br=v4-attachment-upload-progress
 *   Yt=v4-attachment-upload-retry | ct=v4-attachment | qr(e,t)=`${e}-${t}`
 *   Ut=composer-project-detach | Cne=composer-workspace-trigger
 *   _n=composer-remote-connection | dn=composer-work-outside-project
 *
 *  模式工具条簇（A1-R17 逐字转录；逐名映射详见 §T 区头横幅）：
 *   YM/XM/ZUe/ZM/QM/$M → 末稿协作模式族（53562–53577）| Krt→getLastDraftCollaborationMode 89303
 *   zRe→configSelectTriggerVariants 46035 | iO/aO/oO/sO/cO/BRe/VRe→ConfigSelect 封装族 46057–46160
 *   M3e/N3e/P3e/F3e/R3e/L3e/z3e/jq/B3e/V3e/H3e→ConfigSelect 助手族 76848–76901 | Mq→ConfigSelect 76912
 *   Fq→shortcutKeyOfConfigCategory 77348 | Z3e→cycleSelectOptionValue 77360
 *   Q3e→resolveComposerToolbarShortcutAction 77367 | $3e→useComposerToolbarShortcuts 77393
 *   Jrt→composerToolbarShortcutNoop 89341 | Yrt→COMPOSER_INPUT_FOCUS_SELECTOR 89342
 *   qrt→ComposerModeTrigger 89306 | Xrt→ComposerModeToolbarBody 89343 | Zrt→ComposerModeToolbar(memo) 89415
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime           react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)              utils-CEEH0K_K.js
 *  3. Button (X) / createLucideIcon (Sa)
 *                                   button-laUijeDG.js
 *  4. useIntlContext (G) → {intl, locale}
 *                                   IntlProvider-C321H7m8.js
 *  5. toast (m)、info 图标 (p=T)、close 图标 (g=b)、usePlatformService (l=M)
 *                                   imeComposition-DEYFkwWm.js
 *  6. Tooltip (Ia)、Popover 原语 (Na/Oa/Ma/ka = root/anchor/trigger/content)
 *                                   usageStatsUiParts-CiR7YEhh.js
 *  7. logger (J)                    logger-PFDwl5Yq.js
 *  8. zustand create (Ae)、useTaskStore (xe)
 *                                   skillStore-BmeKHDBI.js
 *  9. testid 常量 + testidOf (qr)、workspaceScopeKey (Ti)、DesktopCommand/环境常量
 *                                   src-HCld2afU.js
 * 10. useVirtualizer (to)           esm-BY6T6pIH.js（@tanstack/react-virtual）
 * 11. 本 chunk 内：Radix DropdownMenu 原语（VO…JO，TopBar.tsx 已还原）、
 *     Dialog 原语（zb/Hb/Ub/Gb/Kb/Vb/Wb）、InputGroup（qb/Jb）、
 *     Composer 族（ZV/ait/iZe/TH/lit/JH/uit/vN/yN/xN/bN/SN/DN/KJe/SJe，F08；
 *     Zrt 已于 A1-R17 §T 逐字实体化）、
 *     远程向导 fOt（F10）、GitBranchChip zZ（TopBar 族）
 * 12. keyboardShortcuts-BGHopxr9.js：Bre（导出 r=内部 l，Ctrl/Cmd+Shift 快捷键标签）、
 *     ea（导出 s=内部 m，Ctrl 匹配）、zre（导出 o=内部 h，Ctrl+Shift 匹配）
 *     —— A1-R17 §T declare 三件（chunk 外依赖，不转录）
 * ============================================================================
 */

import * as React from "react";
import * as $ from "react/jsx-runtime"; // A1-R15：vWe=ChatErrorBanner 编译形 JSX 消费面（原 $，jsx-runtime-B5yMD3-t.js）
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { InputGroup, InputGroupAddon } from '../ui/input-group'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { ArrowUp as IconArrowUp, Square as IconSquare, Megaphone as IconMegaphone, Moon as IconMoon, RotateCcw as IconRotateCcw, ClipboardPenLine as IconClipboardPenLine, House as IconHouse, Folder as IconFolder, Cloud as IconCloud, FolderPlus as IconFolderPlus, MessageCircle as IconMessageCircle, Search as IconSearch, ChevronDown as IconChevronDown, Loader as IconLoader, Info as IconInfo, X as IconClose, Rocket as IconRocket, Settings as IconSettings, Copy as IconCopy, SlidersHorizontal as IconSlidersHorizontal, ChevronUp as IconChevronUp, Check as IconCheck, ShieldAlert as IconShieldAlert, Hand as IconHand, NotepadText as IconNotepadText, ShieldCheck as IconShieldCheck, Brain as IconBrain } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）。A1-R15：+IconRocket/IconSettings/IconCopy（原 Pv/Rv/W_，Sa('rocket'/'settings'/'copy') 27735/27806/26974；vWe 54394/54404/54462 消费）。A1-R17：+7 件（原 bbe=sliders-horizontal 27837 / P_=chevron-up / M_=check / zv=shield-alert 27816 / av=hand 27244 / Sv=notepad-text 27549 / Bv=shield-check 27827；§T 模式工具条簇消费）
import { useVirtualizer } from '@tanstack/react-virtual'; // A0-S3a：vendored useVirtualizer（原 to，esm-BY6T6pIH.js）→ npm @tanstack/react-virtual@3.14.10
import { Button, cva, ChevronRight } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk。A1-R17：+cva（原 Ta = button chunk 导出 r，styles 897 导入；§T configSelectTriggerVariants 46035 消费）。A1-R19：+ChevronRight（原 wa = button chunk 导出 o=ChevronRight，styles 896 导入；§V s3e 76375 消费）
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：Dialog 族 declare → components/ui/dialog（bundle zb/Hb/Ub/Gb/Kb/Wb/Vb）
import { BackgroundWorksCapsule, CodeCommentsChip, ComposerInput, SelectionsChip, WebElementsChip, applyWorkspaceFileMentionDrop as insertAddToChatPayload, useComposerFileDragDetection as useFileDragDetection, isCoarseTouchDevice, shouldRestoreFocus, useWebElementContexts, removeCodeCommentEverywhere, useSessionScopedReferences, type AppSlashCommand, type BackgroundWork, type ComposerEditorApi, type WebElementContext } from '../../modules/Composer'; // A0-CLEANUP2 item 10：属主导出后接线（原 rZe/ZV）。A1-R12：insertAddToChatPayload declare（原 YV，66811）改指 Composer 属主导出（bundle 唯一真身；消费点 2440/2947 逐字不变）。A1-R13：useFileDragDetection declare（原 XV，66828）改指 Composer 属主导出（bundle 唯一真身；消费点 2418 逐字不变）。A1-R17：+isCoarseTouchDevice/shouldRestoreFocus（原 XH 69346 / ZH 69351 属主导出；§T ConfigSelect 77025 消费）。A1-R21：+useWebElementContexts/removeCodeCommentEverywhere/useSessionScopedReferences（原 ZXe 68940 / jXe 68628 / tZe 69225 属主导出；附件域双钩子+余量 declare 收敛，见下墓碑）。A1-R22：+CodeCommentsChip/WebElementsChip/SelectionsChip（原 TH 68298 / lit 89989 / uit 90087 逐字 canonical；chip 行三 declare 收敛，见下墓碑）
import { countContextAttachments, buildOutboundContentWithAttachments, useCodeCommentContexts, type CodeCommentAttachment } from '../../modules/GitReview'; // A1-R12：isAddToChatEvent 移出（原 yXe，68430 = code-comment-add-to-chat 域，与 2945 消费面事件名不符 → 改指工作区域守卫，见下）。A1-R21：+buildOutboundContentWithAttachments（原 GXe，68833；buildOutgoingMessage declare 收敛，与 countContextAttachments=GH 68825 同族配对）
import { readWorkspaceFilePayload as parseAddToChatPayload, ADD_WORKSPACE_FILE_TO_CHAT_EVENT as ADD_TO_CHAT_EVENT_NAME, isAddWorkspaceFileToChatEvent as isAddToChatEvent, type WorkspaceFileDragPayload } from '../composer/FileMentionDragHelpers'; // A1-R12：Mj（52248）/Aj（52211）/nUe（52260）declare 改指纯函数叶子（本批逐字转录）；消费点 2436/2945/2957/2959 逐字不变。nUe 此前误接 GitReview yXe（code-comment 域），bundle 90733 真身 = 工作区域守卫
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger, toast, usePlatformService, type RemoteTarget } from '../../modules/ImeComposition'; // +usePlatformService（A1-R15：原 l=M，vWe 54317 截图面消费）；〔A1-R50〕+type RemoteTarget（统一属主改指，本地同形副本删除）
import { pathBasename } from '../../modules/ModalsLeaves';
import { useCodingPlanUpgradeDialog, useCodingPlanUpgradeDialogOptional as useUpgradeActions, filterUsableProviders, modelMenuGroupsOf, type ModelProvider as PaymentModelProvider } from '../../modules/PaymentDeep'; // 〔A1-R29〕+filterUsableProviders（N6e 77910 canonical）/modelMenuGroupsOf（Hq 77850 canonical）/type ModelProvider（型缝所依）：两 declare 收敛改指，见下墓碑 // A1-R23：原 fX（89100）declare 改指 canonical（components/payments/PaymentDeep 〔A1-R23〕补 export）；消费面 §U.10 ComposerConfigToolbarBody 4243 ≡ bundle 89522。〔A1-R24〕useUpgradeActions 别名并入：原 Art（89106）declare 收敛改接（消费面 1078 ≡ bundle 91644）。环安全：函数声明提升，渲染期调用（二环 Home→PaymentDeep shim→components/payments→modules/Home）
import { RemoteWizardDialog, type RemoteWorkspaceSessionLike } from '../../modules/RemoteWizard'; // +RemoteWorkspaceSessionLike（A0-CLEANUP B-24 接线）
import { create, logger, useTaskStore, parseCustomModelId, formatCustomModelId, filterNativeModelOptions, getWorkspaceTaskStateAlias, getMergedTaskListItem, buildTaskConfigOptionsFromMeta, type ConfigOption, type TaskStoreState } from '../../modules/SkillStore'; // A1-R18：+parseCustomModelId（原 D=se，skillStore 881/386 导入别名；§U Ee/k6e/D6e 消费）/formatCustomModelId（原 rt=we，skillStore 900；§U xe 消费）/filterNativeModelOptions（原 it=L，skillStore 906；§U _e 消费）。〔A1-R53〕+getWorkspaceTaskStateAlias（fe ≡ skillStore 导出面 `U as fe` ← _e@251→S@209）/getMergedTaskListItem（ce ≡ `E as P` ← E@236）/buildTaskConfigOptionsFromMeta（be ≡ `sn as g` ← sn@1300）：§U.11 Jq 体内三依赖改指（canonical 全在 stores/taskStore，SkillStore 转导出面 217-266 在案）
// 〔A1-R26〕§U.8 漏斗遥测族实体化：+reportTelemetry/TelemetryPlatform（原 xw 40457 ≡ StoresDeep@323 逐字，A1-R9 判例；环安全：StoresDeep 值闭包不达 components/shell）
import { providerBusinessI18nId, normalizeCaptchaCode, isEmptyModelResponse, reportTelemetry, type TelemetryPlatform } from '../../modules/StoresDeep'; // A1-R13：lN 簇依赖改指（原 yNe 40497 / Cw 40570（stub）/ jNe 40573，§H 逐字真身）；环安全：StoresDeep 不反引本文件
import { providerIds, isGlmModelId, GLM_REASONING_LEVELS, isBuiltinProviderId, isZaiPlanProviderId, isStartPlanProviderId } from '../../modules/SrcSharedA'; // A1-R18：+5 件（原 qn=Tl=Oo 4858 / ui=Sl=ho 4855 / jt=_l=Eo 4842 / tr=Po 4845 / HM=No 4848；§U zrt/Ee/GUe/IM 消费）
import { useServices } from '../../modules/services';
import { workspaceScopeKey } from '../../modules/stores-session';
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { useFeedbackStore } from '../../modules/stores-core'; // A1-R15：原 yC（js 37040）反馈中心 store——vWe openSubmit 消费（TopBar 144 同源边）
import { chatErrorBannerTestid, listSessionModePresets, offpeakFormTitleTestid, chatAssistantHistoryContentTestid, automationYearDayOptionTestid, browserForwardButtonTestid, v4ComposerInputTestid, v4ModelConfigTestid, chatContextUsageTriggerTestid, buildCodingPlanScope, parseCodingPlanScope, codingPlanScopesOverlap, isProviderEnabled, normalizeProviderFamilyDomain, resolveProviderFamilyMode } from '../../modules/SrcSharedB'; // A1-R17 及以前：见尾注。A1-R18：+5 件（原 Uee=ca=ky 8513 / vi=mt 8631 / li=gt 8638 / fi=ht 8658 / gi=ko 5001；§U iit/nit/mX/hX 消费）+A1-R19：+chatContextUsageTriggerTestid（原 Lte=Fv，jsx 8465 / js 8358；§V j3e 76752 data-testid 消费） // A1-R15：原 N_（js 8302）= bundle 作用域 Ate（jn 700）——vWe data-testid 54367 消费。A1-R17：+listSessionModePresets（原 cn()=src chunk Ax 导出 J，styles 501；Xrt 89366 消费）+4 testid（原 Fr=tb/wn=V_/Xt=Eb/rn=Dg；P3e/F3e 76852/76856 消费）+v4ComposerInputTestid（原 un=Ji；Yrt 89342 消费）。〔A1-R27〕+normalizeProviderFamilyDomain（xn 真身 ≡ Xx 8937 / src 9745 `Xx as L` / styles 514 `L as xn`；Tit @761 declare providerFamilyFromDomain 收敛改指，见下墓碑）。〔A1-R28〕+resolveProviderFamilyMode（zi 真身 ≡ Gx / src 10062 `Gx as z` / styles 820 `z as zi` ≡ SrcSharedB@5555；@767/@4056 declare resolveProviderFamilyAuthMode 收敛改指，见下墓碑）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // 原 Ia（A0-CLEANUP 族清理：本地 Tooltip declare 改指 InfoTooltip）
import { Root as RadixSelectRoot, Value as RadixSelectValue, Trigger as RadixSelectTrigger, Icon as RadixSelectIcon, Portal as RadixSelectPortal, Content as RadixSelectContent, Viewport as RadixSelectViewport, Item as RadixSelectItem, ItemText as RadixSelectItemText, ItemIndicator as RadixSelectItemIndicator, ScrollUpButton as RadixSelectScrollUpButton, ScrollDownButton as RadixSelectScrollDownButton } from '@radix-ui/react-select'; // A1-R17：vendored radix select（原 CDe=PEe/TDe=REe/wDe=IEe/EDe=BEe/DDe=HEe/ODe=UEe/kDe=QEe/ADe=sDe/MDe/jDe/NDe/PDe，styles 30850–31745 区）→ npm @radix-ui/react-select@2.3.7（A0-S3c 先例 SettingsRowPrimitives）
import { AnimatedLabel, MODE_LABEL_I18N, MODE_DESCRIPTION_I18N, ModelSelector, ContextUsageProvider, ContextRingTrigger, ContextRingTooltipContent, ContextRingTooltipBody, SegmentedProgress, type ModelGroup } from '../composer/ModelSelector'; // A1-R17：原 _q（75520）/V4e（75972）/H4e（76003）——A0-S4-4b 已属主导出（[D] ConfigSelect 消费预案），本批 §T 接线。A1-R18：+ModelSelector（原 vq，js 75575 memo；§U iit 消费，props 面逐字兼容）+type ModelGroup（Hq declare 返回面）。A1-R19：+5 件（原 J4e/X4e/Z4e/Q4e/yq = ContextUsageProvider 76079/ContextRingTrigger 76125/ContextRingTooltipContent 76139/ContextRingTooltipBody 76147/SegmentedProgress 76034，A0-S2d 已属主导出；§V j3e 76741–76794 消费）
import { usePptxElementReferences, usePptxPreviewOpener, PptxReferencesChip } from '../composer/PptxReferencesChip'; // A1-R21：附件域双钩子收敛——原 QXe/YH/JH=usePptxElementReferences/usePptxPreviewOpener/PptxReferencesChip（styles 68996/69207/69036；canonical 属主 A0-S4-4b 迁出件，本批补 export）；六实体 bundle 原即模块私有（styles 导出块 213930 无面），树内补 export 为收敛面（Composer 补 export 先例）
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n'; // A1-R18：useIntlContext declare（原 G，IntlProvider-C321H7m8 D 9254）收敛 I18n canonical（Composer.tsx:517 先例；ZCodeIntl 与旧本地 IntlShape 同形）
import { remoteTargetDisplayLabel } from '../../modules/SplitLayoutDeep'; // A1-R4：XTt（js 123241）远端条目域改指（tombstone 见原声明位）
import { LoaderCircle } from '../../modules/ImeComposition'; // A1-R19：原 M = imeComposition-DEYFkwWm.js 导出 w（内名 Ut = lucide loader-circle 11786）；§V s3e 76365 / v3e 76563 loading 消费
import { formatNumberCompact } from '../../modules/UsageStatsUiParts'; // A1-R19：原 ja = usageStatsUiParts-CiR7YEhh.js 导出 l（styles 910 导入）；§V S3e 76625 消费
import { useBillingDiscount, BillingDiscountBadge, BillingDiscountBadgeWithInfo, BillingDiscountInfoDialog, type BillingDiscountConfig, type EntitlementSnapshot } from '../../modules/UsageDeep'; // 〔A1-R29〕+type EntitlementSnapshot：N6e 收敛型缝所依（A as (id) => EntitlementSnapshot | null，行依据见 iit _e 注） // A1-R20：胶囊域收敛——原 dj/hj/gj/_j=useBillingDiscount/BillingDiscountBadge/BillingDiscountBadgeWithInfo/BillingDiscountInfoDialog（styles 51910/51959/51980/52034；canonical 属主 components/usage/UsageDeep.tsx A0 已重建）；§V s3e 76295/76359 + v3e 76541/76588/76597 消费

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/


/* ── tombstone（A1-R18）：interface IntlShape + declare function useIntlContext（原 G，IntlProvider-C321H7m8.js D 9254–9258）
 *    删除 → 文件头 import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n'
 *    （Composer.tsx:517 先例；ZCodeIntl 与旧本地接口同形：formatMessage(descriptor, values?) => string）。消费面逐字不变。 ── */

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/** toast（原 m，imeComposition chunk 的 _ 导出） */

/** zustand create（原 Ae，skillStore-BmeKHDBI.js） */

/** useTaskStore（原 xe，skillStore chunk）——本族仅用 draftFocusVersion */

/* ── tombstone（A0-S3a）：vendored useVirtualizer（原 to，esm-BY6T6pIH.js）declare 删除，
 *    改 npm @tanstack/react-virtual@3.14.10 真实 import（文件头）；
 *    count/getScrollElement/estimateSize/overscan 调用面与 getTotalSize/getVirtualItems/scrollToIndex 返回面逐字不变。 ── */

/* --- 平台 / 服务 --- */

/* A0-CLEANUP4：与 stores-tasks.OffPeakTask 双向对齐（bundle js 134720/134426 消费面
   offPeakTaskId 恒有值；title 可选）。原 id/title 必填为重建偏差。 */
export interface OffPeakTaskSummary {
  offPeakTaskId: string;
  prompt: string;
  status: string;
  title?: string;
  /* A1-R9 bX 消费面接線精化：AutomationsMainView（bundle 138876/139287 簇）与
   * OffPeakTaskEditor（SL.OffPeakTaskRecord 同族）消费面按运行期真形补足——
   * shim OffPeakTask / SL.OffPeakTaskRecord / EV 本地面三方对齐在案
   * （A0-CLEANUP3 3b）。新增皆可选，既有指派面（shim OffPeakTask → 本型等）不破。 */
  queuePosition?: number;
  permissionMode?: string | null;
  model?: string | null;
  thoughtLevel?: string | null;
  startedAt?: number;
  endedAt?: number;
  historyDeletedAt?: number;
  sessionId?: string | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}
export interface OffPeakGrayConfig {
  enabled?: boolean;
  codingPlanActive?: boolean;
  /* A1-R9 精化：AutomationsMainView OffPeakTaskEditor props 消费面读
   * allowedModels/allowedModelConfigs（1673/1674）；Tit 消费面读
   * providerFamily/selectedConnectionKey（本文件 isCodingPlanConnectionSelected
   * 参数面已具型）。getOffPeakClientConfig 灰度配置运行期真形。 */
  allowedModels?: string[];
  allowedModelConfigs?: Array<{ id: string; modelIdByKind?: Record<string, string>; reasoning?: { levels: Record<string, unknown>; defaultLevel?: string } }>;
  providerFamily?: string;
  selectedConnectionKey?: string;
  [key: string]: unknown;
}
export interface OffPeakCodingPlanSupport {
  supported?: boolean;
  providerFamily?: string; // A1-R9 精化：Tit（isCodingPlanConnectionSelected 参数面）消费
  selectedConnectionKey?: string;
  [key: string]: unknown;
}
export interface OffPeakTakeNumberAvailability {
  /* A1-R9 精化：AutomationsMainView 消费面（1203/1215/1292/1303 = bundle 138876 簇）
   * 读 canTakeNumber/nextTakeAt——getTakeNumberAvailability 取号可用性真形。 */
  canTakeNumber?: boolean;
  nextTakeAt?: number;
  [key: string]: unknown;
}
/* A1-R9 精化（判别联合，与 offPeakHelpers 同型族双向对齐）：ok 支补 task 必填
 * （运行期创建成功恒含任务记录；AutomationsMainView 遥测 965 行无守卫直读
 * result.task.offPeakTaskId = bundle 138876 簇真形）+ ticketInitialState/
 * queuePosition/providerName 可选面；失败支补索引签名（客户端校验字面量含
 * task 附挂，1618–1628 行）。 */
export type OffPeakCreateResult =
  | { ok: true; task: OffPeakTaskSummary; ticketInitialState?: string; queuePosition?: number; providerName?: string; [key: string]: unknown }
  | {
      ok: false;
      failureStage: string;
      errorCategory: "quota_3103" | "network" | "invalid_response" | "unknown" | string;
      errorCode: string;
      providerName: string;
      [key: string]: unknown;
    };

interface OffPeakTaskService {
  list(): Promise<OffPeakTaskSummary[]>;
  getCodingPlanSupport(): Promise<OffPeakCodingPlanSupport>;
  getTakeNumberAvailability(): Promise<OffPeakTakeNumberAvailability>;
  createTask(input: OffPeakCreateInput): Promise<OffPeakCreateResult>;
  updateTask(id: string, patch: Partial<OffPeakCreateInput>): Promise<OffPeakTaskSummary | null>;
  pauseTask(id: string): Promise<void>;
  continueTask(id: string): Promise<void>;
  cancelTask(id: string): Promise<void>;
  deleteTask(id: string): Promise<void>;
  deleteHistory(id: string): Promise<void>;
}
interface CodingPlanSubscriptionService {
  getOffPeakClientConfig(opts: { forceRefresh: boolean }): Promise<OffPeakGrayConfig | null>;
}

/** 服务 context（原 fs()，横切层 §2.2） */

/** 设置快照（原 JM()，Settings 族提供） */
interface SettingsSnapshot {
  providerFamilyDomain?: string;
  modelProviderFamilyModes?: Record<string, string>;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  [key: string]: unknown;
}
declare function useSettingsSnapshot(): { settings: SettingsSnapshot | null };

/** 模型供应商列表（原 qq()，ProviderPlanUsage 族提供） */
// 〔A1-R24〕补 export：zrt 197021 面联动——SubagentLeaves ModelProvider.models 型缝所依（经 modules/Home 转导出）
export interface ModelCatalogEntryLike { // A1-R18：模型目录条目（zrt/Rrt 89219–89241 消费面）
  id?: string;
  modelIdByKind?: Record<string, string>;
  reasoning?: { levels: Record<string, unknown>; defaultLevel?: string } | null;
  [key: string]: unknown;
}
interface QuotaLimitLike { // A1-R18：配额限制条目（c3e/l3e/h3e 76439–76501 消费面）
  number?: number;
  unit?: number;
  remaining?: number;
  percentage?: number;
  type?: string;
  nextResetTime?: string | number;
  usageDetails: Array<{ modelCode: string; displayName?: string | null }>; // A1-R19 型缝：m3e 76487 直接消费 e.usageDetails.map（bundle 无 ?.）
  [key: string]: unknown;
}
interface ModelProviderEntry {
  id: string;
  name?: string;
  apiKey: string;
  models: Array<string | ModelCatalogEntryLike>;
  enabled?: boolean;
  systemDisabledReason?: string | null;
  [key: string]: unknown;
}
declare function useModelProviders(): { modelProviders: ModelProviderEntry[]; displayOrder: string[]; loading: boolean }; // A1-R18：+displayOrder（bundle qq 78243 返回面 { modelProviders, displayOrder, loading }；§U iit C 消费）

/* ── tombstone〔A1-R53〕：declare useCatalogConfigOptions（原 Jq，styles 78437-78455；旧注「js 78437」系 src/styles 混标，
 *    真身在 styles chunk——R51 §②重标判例同族）删除 → §U.11 逐字实体化（本文件内，消费位 4650 ≡ bundle 89524 逐字不变）。
 *    体内依赖全链改指（零新增 declare）：f8e 同批转录（§U.11）；xe≡useTaskStore（@154 既导）；co≡useShallowSelector
 *    （lib/shallowSelector，R36/R38 判例）；fe/ce/be ≡ SkillStore 转导出三件（@154 〔A1-R53〕扩面）。
 *    域外消费 137206/197845 属他域（各自 declare 留批）。 ── */

/** 权益中心（原 sX，js 88303；entitlements hub，深依赖 $j/tM/nM 服务族——declare 分层） */
// 〔A1-R23〕补 export：Oq 叠层专项——SidebarLeaves PlanEntitlementSnapshot 收敛为本型别名（经 modules/Home 转导出）
export interface EntitlementSnapshotLike {
  provider?: { id?: string } | null;
  quota?: { level?: string | null; limits?: QuotaLimitLike[] } | null;
  subscription?: { details: Array<{ productId?: string; productName?: string; renewTime?: string }> } | null;
  remaining?: { nextResetTime?: number } | null; // A1-R19 型缝宽化：d3e 76457 消费 e?.remaining?.nextResetTime（原 unknown）
  unavailableReason?: string | null;
  context?: { scope?: string; organizationId?: string | null; projectId?: string | null; productId?: string | null; displayName?: string | null } | null;
  [key: string]: unknown;
}
interface EntitlementSlotLike { snapshot?: EntitlementSnapshotLike | null; loading?: boolean; error?: string | null }
declare function useEntitlementsHub(opts: {
  autoRefreshMode: string;
  modelProviders: ModelProviderEntry[];
  loading: boolean;
  modelProviderFamilySelectedKeys?: Record<string, string | undefined>;
}): { entitlements: Record<string, EntitlementSlotLike | undefined>; refresh: (e?: unknown) => Promise<void> };

/* ── tombstone〔A1-R40〕：interface TabStoreStateLike + declare useTabStoreSelector（原 pc）删除 → 一符一家收敛 WorkspaceTabsDeep useWorkspaceTabStore@686
 * （pc 真身 4801-4805 逐字：useContext(fc) + throw 守卫 + ne(t, e)；PD-α 同簇，A1-R1 重建在案；TabStoreStateLike 为 declare 期近似型，同批删除）。
 * 消费面实测 1 处 @4638 改名改指（≡ bundle 89534；回调 `(e) => e.openSettingsTab` 受 WorkspaceTabStoreState 上下文型，openSettingsTab(): void 逐字段吻合）。经尾部导入消费，行引用零漂。 ── */

/* ── tombstone（A1-R23）：declare useCodingPlanUpgradeDialog（原 fX，js 89100）删除——canonical 属主
 *    components/payments/PaymentDeep.tsx（A0 重建，体 ≡ bundle：useContext(dX) + throwing 守卫），
 *    改指文件头 import（modules/PaymentDeep，〔A1-R23〕补 export）；消费面 §U.10
 *    ComposerConfigToolbarBody 4243（≡ bundle 89522）逐字不变。环安全：函数声明提升，
 *    调用在渲染期（Home→modules/PaymentDeep→components/payments→modules/Home 二环，bundle 本同模块）。 ── */

/** 团队产品订阅查询（原 TY，js 83745；codingPlanSubscriptionService 深依赖——declare 分层） */
declare function useTeamProductSubscriptions(opts: { enabled: boolean; authenticated: boolean }): {
  snapshot: { productList: SubscribedTeamProductLike[] } | null;
  loading: boolean;
  error: string | null;
};

/** 组织权益查询（原 $j，js 52497；usageStatsService eM 族深依赖——declare 分层） */
declare function useOrganizationEntitlementQuery(opts: {
  autoRefreshMode?: string;
  enabled?: boolean;
  includeSubscription?: boolean;
  preferredProviderId?: string;
  allowDisabledPreferredProvider?: boolean;
  requirePreferredProvider?: boolean;
  allowEnvApiKey?: boolean;
  organizationId?: string | null;
  projectId?: string | null;
  cacheKey?: string | null;
}): { snapshot: EntitlementSnapshotLike | null; loading: boolean; error: string | null; refresh: (e?: unknown) => Promise<void> };

/* ── tombstone〔A1-R29〕：declare filterEntitledModelProviders（原 N6e）删除 → 改指 filterUsableProviders
 *    （N6e 真身：bundle 77910–77929 唯一真身 ≡ PaymentDeep@1097 A0 逐字实化，modules/PaymentDeep@128 转导出）。
 *    消费面实测：@4809（iit _e 内）≡ bundle 89703，改名改指（型缝见该处注）；另一消费 135402 ≡
 *    Automations buildEntitledProviderList 面同批收敛。负证据：bundle 内 N6e 无第二真身。 ── */

/* ── tombstone〔A1-R29〕：declare buildModelSelectGroups（原 Hq）删除 → 改指 modelMenuGroupsOf
 *    （Hq 真身：bundle 77850 唯一真身 ≡ PaymentDeep@993 A0 逐字实化，modules/PaymentDeep@118 转导出）。
 *    消费面实测：@4818（iit _e 内）≡ bundle 89710，改名改指（参数重排 + configModels 位删除——
 *    bundle Hq 体内从不读第二参 t，负证据在案；型缝见该处注）。其余三脸（Automations@151/
 *    ExtendedViews@427/SubagentsSettingsSection@248）同批收敛；PD@356 文件内第二脸零消费删碑。
 *    负证据：bundle 内 Hq 无第二真身。 ── */

/** 模型触发器标签解析（原 nWe，js 53806；iN/dr 模型组域——declare 分层，R18 留批） */
declare function resolveModelTriggerLabels(opts: {
  modelGroups: ModelGroup[];
  normalizedValue: string;
  fallbackLabel: string;
  providerId?: string | null;
  providerName?: string;
}): { fullLabel: string; providerPrefix?: string; modelLabel: string };

/** 工具条快捷键标签（原 Zi，keyboardShortcuts-BGHopxr9.js 导出 i；chunk 外依赖，不转录——同 §T 三件先例） */
declare function formatToolbarShortcutLabel(key: string): string;

/* ── tombstone（A1-R19）：declare function CodingPlanUsageToolbar + interface CodingPlanUsageRemainingLike（原 j3e，js 76678–76847）
 *    删除——§V usage 展示域逐字实体化（j3e 本体 + s3e/v3e + 30 件助手）；消费面 iit 89918 逐字不变。 ── */

/* ── tombstone（A1-R20）：type BillingDiscountConfigLike + declare useCodingPlanBillingDiscount/CodingPlanBillingDiscountBadge/
 *    CodingPlanBillingDiscountBadgeLabel/CodingPlanBillingDiscountInfoPopover（原 dj/gj/hj/_j，js 51910/51980/51959/52034；
 *    R19 登记深依赖 ps 2680/Ao 1301/cj 51736/zb·Bb·Hb 31991+/lj·uj·zHe·UHe 51905–52073/kbe 27943）删除——
 *    勘验结论：canonical 属主 components/usage/UsageDeep.tsx（A0 已重建：useBillingDiscount/BillingDiscountBadgeWithInfo/
 *    BillingDiscountBadge/BillingDiscountInfoDialog + BillingDiscountConfig 型，深依赖已收敛 useOptionalServices/
 *    useSettingsStoreValue/MarkdownRenderer/Dialog 族）；bundle 胶囊簇唯一真身（51905–52090），消费面 5 处
 *    （76295/76359/76541/76588/76597 + 域外 84520/94923/94926/189595/189601/190007/190212/191010/191156/85417 留批域）。
 *    改指文件头 import（modules/UsageDeep）；§V 消费面逐字不变。 ── */

/** 墓碑〔A1-R24〕：declare useUpgradeActions 删除——双实例收敛至 PaymentDeep 逐字真身 useCodingPlanUpgradeDialogOptional（原 Art）。
 *  证据：bundle Art 定义唯一（styles 89106 `function Art() { return (0, Q.useContext)(dX); }`；dX ≡ CodingPlanUpgradeDialogContext）；
 *  PaymentDeep useCodingPlanUpgradeDialogOptional ≡ Art（return useContext(context)，逐字同形）；
 *  终端消费实测：91644 面 ≡ 本文件 OffPeakNewTaskBanner（1078 调用点，别名 useUpgradeActions 保留）；
 *  119444 面属 R0 ConversationPane（119219，未重建）留批。改指文件头 import（modules/PaymentDeep 转导出）。
 *  原注：「升级动作（原 Art()，ProviderPlanUsage 族提供）」。 */

/** 供应商 id 枚举（原 q，横切层） */

/* ── tombstone〔A1-R28〕：declare resolveProviderFamilyAuthMode（原 zi）删除 → 改指 resolveProviderFamilyMode
 *    （zi 真身：styles 820 `z as zi` ← src 10062 `Gx as z` ≡ Gx ≡ SrcSharedB@5555 `return t?.[e] ?? \`oauth\``，链闭合）。
 *    bundle zi 消费 9 处：本文件 @767（Tit isCodingPlanConnectionSelected）≡ 91398、@4056（tit
 *    resolveCodingPlanFamilySelection 内）≡ 89444，本批改名改指；PD@787 ≡ 77699 / OLL@3509 ≡ 210066 /
 *    OLL@3541 ≡ 210094 同批收敛（见各墓碑）；191804/191836/191855/192364 属 settings R0 域留批。
 *    负证据：bundle 内 zi 无第二真身。 ── */

/* ── tombstone（A1-R27）：declare resolveCodingPlanProviderFamily（A0 误标「原 li：coding plan 供应商族」）删除 →
 *    改指 parseCodingPlanScope（li 真身：styles 680 `gt as li` ← src `parseCodingPlanScope as gt` ≡ Gb 8533 ≡
 *    SrcSharedB@5106；R26 §U.8 取证闭环，返回 scope object|null，非 A0 所标 family string|null）。
 *    消费面实测：本文件 @749（wit ≡ hasCodingPlanProviderEntry）≡ bundle wit 91390 `li(e.id) !== null`——
 *    仅判 !== null，行为不变；LM ≡ resolveEntryPlanState@4405 已按真身消费（R26）。
 *    负证据：bundle 内 li 无第二真身。 ── */
/* ── tombstone（A1-R27）：declare providerFamilyFromDomain（A0 误标「原 xn：域名→族」）删除 →
 *    改指 normalizeProviderFamilyDomain（xn 真身：styles 514 `L as xn` ← src 9745 `Xx as L` ≡ Xx 8937 ≡
 *    SrcSharedB@5582，`e === 'zai' || e === 'bigmodel' ? e : null`）。
 *    消费面实测：本文件 @761（Tit ≡ isCodingPlanConnectionSelected）≡ bundle Tit 91397 `xn(t.providerFamilyDomain)`
 *    （bundle 无 `?? ''` 兜底，同批对齐）；52744 PUe / 150303 R0 域留批。负证据：bundle 内 xn 无第二真身。 ── */

/* ── tombstone（A1-R25）：declare buildCodingPlanFunnelContext（原 FM，ProviderPlanUsage 族）删除 →
 *    §U.8 逐字真身（bundle FM 53267–53276 唯一真身；终端消费实测：本文件 1134 ≡ bundle 91685、
 *    139073 R0 域留批；负证据：bundle 内 FM 无第二定义）。调用点逐字不变。 ── */
/* ── tombstone（A1-R26）：declare resolveEntryPlanState（原 LM，ProviderPlanUsage 族）删除 →
 *    §U.8 逐字真身（bundle LM 53299–53312 唯一真身；终端消费实测：本文件 1137 ≡ bundle 91688、
 *    139076 R0 域留批；负证据：bundle 内 LM 无第二定义）。调用点逐字不变。
 *    （A1-R25 型缝注：返回面 EntryPlanStateLike——LM 全部 return 均为 IM(...)，本批实体化直接吻合。） ── */

/** 平台 context（原 ps()，横切层；hit 用其 broadcastService） */
declare function usePlatformContext(): { broadcastService?: { send(message: { channel: string; payload: unknown }): unknown } } | null; // 〔A1-R21〕型缝校正：broadcastService 消费面为 .send({channel, payload})（bundle jXe 68634 实测），旧注 postMessage 为 A0 占位

/* --- UI 原语 --- */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon-sm" | "icon-md";
  type?: "button" | "submit";
}
/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */
/* ── tombstone（A0-CLEANUP 族清理）：Tooltip declare 删除 → import { InfoTooltip as Tooltip } from './UsageStatsUiParts'。 ── */


/* DropdownMenu 原语族（本 chunk 47926–48040，TopBar.tsx §1.1 已逐字还原） */
/* ── tombstone（A0-S3c）：DropdownMenu、DropdownMenuCheckboxItem、DropdownMenuContent、DropdownMenuItem、DropdownMenuSeparator、DropdownMenuTrigger、InputGroup、InputGroupAddon declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */






/* Dialog 原语族（本 chunk 31943+，TopBar.tsx 已登记） */
/* ── tombstone（A0-S3c）：Dialog 族 declare 删除 → import from '../components/ui/dialog'；调用面逐字不变。 ── */

/* InputGroup（本 chunk 28021–32245 原语块） */



/* 图标（原混淆名 → lucide 名；button-laUijeDG.js 的 createLucideIcon 产物） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（16）：IconArrowUp/IconSquare/IconMegaphone/IconMoon/IconRotateCcw/IconClipboardPenLine/IconHouse/IconFolder/IconCloud/IconFolderPlus/IconMessageCircle/IconSearch/IconChevronDown/IconLoader/IconInfo/IconClose → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** Spinner（原 EN，js 54789：loader 图标 + animate-spin 包装） */
export function Spinner({ className, ...rest }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <IconLoader
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className) as string}
      {...rest}
    />
  );
}

/** 文件图标组件（原 Vc：按扩展名出图标，src 来自文件图标服务） */
declare function FileIcon(props: { src?: string; size: number; className?: string }): React.ReactElement;
/** 按路径解析文件图标（原 zc，横切层 5150） */
declare function resolveFileIconInfo(path: string): { fileIconSrc?: string };

/* --- testid 常量（原值来自 src-HCld2afU.js，见头部登记） --- */
const COMPOSER_REGION_TESTID = "v4-composer"; // Ht
const ATTACHMENT_MENU_ITEM_TESTID = "chat-attachment-menu-item"; // St
const ATTACHMENT_BUTTON_TESTID = "chat-attachment-button"; // At
const STOP_BUTTON_TESTID = "v4-stop"; // Ot
const SEND_BUTTON_TESTID = "v4-composer-send"; // see
const COMPOSER_INPUT_TESTID = "v4-composer-input"; // un
const PAUSED_QUEUE_SEND_DIALOG_TESTID = "v4-paused-queue-send-dialog"; // Yee
const CLEAR_QUEUE_SEND_TESTID = "v4-composer-clear-queue-send"; // Sne
const KEEP_QUEUE_SEND_TESTID = "v4-composer-keep-queue-send"; // pee
const ATTACHMENT_UPLOAD_PROGRESS_TESTID = "v4-attachment-upload-progress"; // Br
const ATTACHMENT_UPLOAD_RETRY_TESTID = "v4-attachment-upload-retry"; // Yt
const ATTACHMENT_ITEM_TESTID = "v4-attachment"; // ct
const PROJECT_DETACH_TESTID = "composer-project-detach"; // Ut
const WORKSPACE_TRIGGER_TESTID = "composer-workspace-trigger"; // Cne
const REMOTE_CONNECTION_TESTID = "composer-remote-connection"; // _n
const WORK_OUTSIDE_PROJECT_TESTID = "composer-work-outside-project"; // dn
/** testid 拼接（原 qr = Nb：`${e}-${t}`） */
function testidOf(base: string, suffix: string): string {
  return `${base}-${suffix}`;
}

/* ============================================================================
 * 1. 问候 hero（原 vit/gX/_X/yit/bit/xit/Sit/Cit，js 91182–91336 / jsx 78837–78935）
 *    draft 态消息列表的 emptyState：品牌线框大图居中垫底，问候语按时段 6 档，
 *    字号按「可用宽度 ÷ 文本自然宽度 × 30」在 20–30px 间自适应。
 * ==========================================================================*/

/** 原 vit：问候时段分界（小时） */
export const GREETING_HOUR_BOUNDARIES = [5, 9, 12, 14, 18, 23];
/** 原 gX：问候语最小字号 */
export const GREETING_MIN_FONT_SIZE_PX = 20;
/** 原 _X：问候语最大字号 */
export const GREETING_MAX_FONT_SIZE_PX = 30;

/** 原 yit：按小时段选 6 档问候 key（chat.empty.greeting.*） */
export function resolveGreetingI18nId(now: Date = new Date()): string {
  const hours = now.getHours();
  return hours >= 5 && hours < 9
    ? "chat.empty.greeting.morningEarly"
    : hours >= 9 && hours < 12
      ? "chat.empty.greeting.morning"
      : hours >= 12 && hours < 14
        ? "chat.empty.greeting.noon"
        : hours >= 14 && hours < 18
          ? "chat.empty.greeting.afternoon"
          : hours >= 18 && hours < 23
            ? "chat.empty.greeting.evening"
            : "chat.empty.greeting.lateNight";
}

/** 原 bit：距下一个时段分界的毫秒数（用于定时刷新问候语） */
export function msUntilNextGreetingBoundary(now: Date = new Date()): number {
  const boundariesToday = GREETING_HOUR_BOUNDARIES.map((hour) => {
    const d = new Date(now);
    d.setHours(hour, 0, 0, 0);
    return d;
  });
  const firstTomorrow = new Date(now);
  firstTomorrow.setDate(firstTomorrow.getDate() + 1);
  firstTomorrow.setHours(GREETING_HOUR_BOUNDARIES[0], 0, 0, 0);
  const next = boundariesToday.find((d) => d.getTime() > now.getTime()) ?? firstTomorrow;
  return Math.max(1, next.getTime() - now.getTime());
}

/** 原 xit：问候语字号自适应（远控态恒 20px；宽度足够时取 30px） */
export function fitGreetingFontSize({
  availableWidthPx,
  naturalTextWidthPx,
  compactForRemoteControl = false,
}: {
  availableWidthPx: number;
  naturalTextWidthPx: number;
  compactForRemoteControl?: boolean;
}): number {
  if (compactForRemoteControl) return GREETING_MIN_FONT_SIZE_PX;
  if (
    !Number.isFinite(availableWidthPx) ||
    !Number.isFinite(naturalTextWidthPx) ||
    availableWidthPx <= 0 ||
    naturalTextWidthPx <= 0 ||
    availableWidthPx >= naturalTextWidthPx
  )
    return GREETING_MAX_FONT_SIZE_PX;
  return Math.max(
    GREETING_MIN_FONT_SIZE_PX,
    Math.min(GREETING_MAX_FONT_SIZE_PX, Math.floor((availableWidthPx / naturalTextWidthPx) * GREETING_MAX_FONT_SIZE_PX)),
  );
}

export interface GreetingHeroProps {
  className?: string;
  /** Web 远控（手机）态：固定最小字号 */
  compactForRemoteControl?: boolean;
}

/**
 * 原 Sit（js 91219 / jsx 78861）：问候 hero。
 * - 底图：HomeHeroLogo 线框 SVG，绝对定位居中、向下渐隐遮罩、透明度 70%
 * - 文本：隐藏的 30px 测量副本（aria-hidden）+ 可见文本；字号写入 CSS 变量
 *   --v4-draft-greeting-font-size；ResizeObserver/resize 节流重算
 * - 定时器：到下一个时段分界时重新取问候 key
 */
export function GreetingHero({ className, compactForRemoteControl = false }: GreetingHeroProps) {
  const { intl } = useIntlContext();
  const [now, setNow] = React.useState<Date>(() => new Date());
  const [fontSizePx, setFontSizePx] = React.useState<number>(GREETING_MAX_FONT_SIZE_PX);
  const textContainerRef = React.useRef<HTMLParagraphElement | null>(null);
  const measureRef = React.useRef<HTMLSpanElement | null>(null);
  const greetingText = intl.formatMessage({ id: resolveGreetingI18nId(now) });

  // 到点切换问候时段
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setNow(new Date());
    }, msUntilNextGreetingBoundary(now));
    return () => {
      window.clearTimeout(timer);
    };
  }, [now]);

  // 字号自适应：测量容器可用宽度与文本自然宽度
  React.useLayoutEffect(() => {
    if (compactForRemoteControl) {
      setFontSizePx(GREETING_MIN_FONT_SIZE_PX);
      return;
    }
    const container = textContainerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    let rafId: number | null = null;
    const recompute = () => {
      rafId = null;
      const styles = window.getComputedStyle(container);
      const horizontalPadding = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
      const availableWidthPx = Math.max(0, container.getBoundingClientRect().width - horizontalPadding);
      const naturalTextWidthPx = measure.getBoundingClientRect().width;
      const nextSize = fitGreetingFontSize({ availableWidthPx, naturalTextWidthPx });
      setFontSizePx((prev) =>
        prev === nextSize
          ? prev
          : (logger.debug("[v4-draft-greeting] 标题自身可用宽度变化，更新字号", {
              availableWidthPx: Math.round(availableWidthPx),
              naturalTextWidthPx: Math.round(naturalTextWidthPx),
              previousFontSizePx: prev,
              nextFontSizePx: nextSize,
            }),
            nextSize),
      );
    };
    const scheduleRecompute = () => {
      if (rafId === null) rafId = window.requestAnimationFrame(recompute);
    };
    recompute();
    if (typeof ResizeObserver > "u") {
      // 环境无 ResizeObserver：退回 window resize
      window.addEventListener("resize", scheduleRecompute);
      return () => {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", scheduleRecompute);
      };
    }
    const observer = new ResizeObserver(scheduleRecompute);
    observer.observe(container);
    observer.observe(measure);
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [compactForRemoteControl, greetingText]);

  return (
    <div
      className={cn(
        "relative mb-10 flex w-full max-w-2xl flex-col items-center justify-center gap-6 text-foreground sm:mb-8",
        className,
      ) as string}
    >
      {/* 品牌线框底图（spec §5 hero）：向下渐隐的遮罩 + 70% 透明度 */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 aspect-[5/4] w-[min(72vw,25rem)] -mt-10",
          "-translate-x-1/2 -translate-y-1/2 text-foreground-subtlest opacity-70",
          "[-webkit-mask-image:linear-gradient(to_bottom,black_0%,transparent_70%,transparent_100%)]",
          "[-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]",
          "[mask-image:linear-gradient(to_bottom,black_0%,transparent_70%,transparent_100%)]",
          "[mask-repeat:no-repeat] [mask-size:100%_100%]",
        ) as string}
      >
        <HomeHeroLogo className="h-full w-full" />
      </div>
      {/* 问候语：隐藏测量副本 + 可见文本 */}
      <p
        ref={textContainerRef}
        data-v4-draft-greeting="true"
        style={{ "--v4-draft-greeting-font-size": `${fontSizePx}px` } as React.CSSProperties}
        className={cn(
          "relative z-10 w-full px-4 text-center font-medium text-foreground",
          compactForRemoteControl ? "text-xl/[1.2]" : "text-[length:var(--v4-draft-greeting-font-size)]/[1.2]",
        ) as string}
      >
        <span
          ref={measureRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute whitespace-nowrap text-3xl/[1.2]"
        >
          {greetingText}
        </span>
        <span>{greetingText}</span>
      </p>
    </div>
  );
}

/**
 * 原 Cit（js 91322 / jsx 78922）：Home hero 品牌线框 logo（400×320，stroke=currentColor）。
 * 路径逐字转录自源码。
 */
export function HomeHeroLogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} width="400" height="320" viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* REBRAND-039+139 */}
      <path
        d="M122 270 L122 148 A78 78 0 0 1 278 148 L278 270"
        stroke="currentColor"
        strokeWidth="56"
      />
    </svg>
  );
}

/* ============================================================================
 * 2. off-peak 助手 + store + 横幅（原 vX/wit/Tit/Eit/Dit/bX/Oit/kit，
 *    js 91337–91751 / jsx 78937–79377）。
 *    横幅 = spec §5 的「banner 行（📢 可关）」+「建议卡 3 张」：
 *    3 张卡是 off-peak 闲时任务模板（standupGitSummary/ciFlakyReport/customize），
 *    点击后写入 pendingCreateDraft 并打开自动化面板。
 * ==========================================================================*/

/** 原 vX：错误 → 消息文本 */
export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 原 wit：供应商列表中是否存在可用的 Coding Plan 条目 */
export function hasCodingPlanProviderEntry(providers: ModelProviderEntry[]): boolean {
  return providers.some((provider) =>
    provider.id === providerIds.zaiCodingPlan ||
    provider.id === providerIds.bigmodelCodingPlan ||
    parseCodingPlanScope(provider.id) !== null
      ? !(provider.enabled === false && provider.systemDisabledReason)
      : false,
  );
}

/** 原 Tit：当前设置是否选中了 Coding Plan 的 OAuth 连接 */
export function isCodingPlanConnectionSelected(
  support: { supported?: boolean; providerFamily?: string; selectedConnectionKey?: string } | null | undefined,
  settings: SettingsSnapshot | null,
): boolean {
  if (!support?.supported || !settings) return false;
  const family = normalizeProviderFamilyDomain(settings.providerFamilyDomain);
  if (!family || family !== support.providerFamily) return false;
  if (resolveProviderFamilyMode(family, settings.modelProviderFamilyModes) !== "oauth") return false;
  return settings.modelProviderFamilySelectedKeys?.[family]?.trim() === support.selectedConnectionKey;
}

/** 原 Eit：配额 3103 错误判定 */
export function isQuota3103Error(result: OffPeakCreateResult | null | undefined): boolean {
  return result?.ok === false && result.errorCategory === "quota_3103" && result.errorCode === "3103";
}

/** 原 Dit：off-peak 错误 → i18n key */
export function resolveOffPeakErrorI18nId(result: OffPeakCreateResult | null | undefined): string {
  return isQuota3103Error(result)
    ? "offPeak.error.quota"
    : result?.ok === false &&
        (result.errorCategory === "network" ||
          result.errorCategory === "invalid_response" ||
          result.errorCategory === "unknown")
      ? "offPeak.error.unavailable"
      : "offPeak.error.generic";
}

export interface OffPeakCreateInput {
  title?: string;
  prompt?: string;
  telemetrySource?: { eventRegion: string; templateId?: string };
  [key: string]: unknown;
}

export interface OffPeakTaskStoreState {
  tasks: OffPeakTaskSummary[];
  loading: boolean;
  error: string | null;
  operationId: string | null;
  grayConfig: OffPeakGrayConfig | null;
  codingPlanSupport: OffPeakCodingPlanSupport | null;
  takeNumberAvailability: OffPeakTakeNumberAvailability | null;
  takeNumberAvailabilityStatus: "idle" | "loading" | "ready" | "error";
  newTaskBannerDismissed: boolean;
  pendingCreateDraft: OffPeakCreateInput | null;
  initialize(services: {
    offPeakTaskService: OffPeakTaskService;
    codingPlanSubscriptionService: CodingPlanSubscriptionService;
  }): Promise<void>;
  refresh(service: OffPeakTaskService): Promise<void>;
  refreshCodingPlanSupport(service: OffPeakTaskService): Promise<void>;
  refreshTakeNumberAvailability(service: OffPeakTaskService): Promise<void>;
  createTask(input: OffPeakCreateInput, service: OffPeakTaskService): Promise<OffPeakCreateResult>;
  updateTask(id: string, patch: Partial<OffPeakCreateInput>, service: OffPeakTaskService): Promise<boolean>;
  pauseTask(id: string, service: OffPeakTaskService): Promise<void>;
  continueTask(id: string, service: OffPeakTaskService): Promise<void>;
  cancelTask(id: string, service: OffPeakTaskService): Promise<void>;
  deleteTask(id: string, service: OffPeakTaskService): Promise<void>;
  deleteHistory(id: string, service: OffPeakTaskService): Promise<void>;
  dismissNewTaskBanner(): void;
  setPendingCreateDraft(draft: OffPeakCreateInput | null): void;
  consumePendingCreateDraft(): OffPeakCreateInput | null;
}

/** 原 yX：initialize 的单飞 promise（防并发重复初始化） */
let offPeakInitializeInFlight: Promise<void> | null = null;

/**
 * 原 bX（js 91416；A0 期误标 91368 / jsx 78945）：off-peak 闲时任务 store（zustand）。
 * 横幅可见性（grayConfig.enabled + newTaskBannerDismissed）与 3 张建议卡的
 * pendingCreateDraft 投递都在这里。
 * A1-R8 双实例收敛 canonical：bundle 唯一 bX（@91416，紧邻 kit@91639 定义区属主）。
 * 本文件消费面 896–901 = bundle 91645–91650 钩子簇；stores/offPeakTaskStore.ts
 * 并行实例休眠降 shim；AutomationsMainView 之 bX 消费面（bundle 138876 簇）
 * 普查裁决接线归一，型面对齐留批（见其留批注）。
 */
export const useOffPeakTaskStore = create<OffPeakTaskStoreState>()((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  operationId: null,
  grayConfig: null,
  codingPlanSupport: null,
  takeNumberAvailability: null,
  takeNumberAvailabilityStatus: "idle",
  newTaskBannerDismissed: false,
  pendingCreateDraft: null,
  async initialize({ offPeakTaskService, codingPlanSubscriptionService }) {
    if (offPeakInitializeInFlight) return offPeakInitializeInFlight;
    const run = (async () => {
      set({
        loading: true,
        error: null,
        codingPlanSupport: null,
        takeNumberAvailability: null,
        takeNumberAvailabilityStatus: "loading",
      });
      try {
        let supportLoadFailed = false;
        const [grayConfig, tasks, codingPlanSupport] = await Promise.all([
          codingPlanSubscriptionService
            .getOffPeakClientConfig({ forceRefresh: true })
            .catch((error) => (logger.warn("[off-peak] gray config load failed", toErrorMessage(error)), null)),
          offPeakTaskService.list().catch((error) => (logger.warn("[off-peak] list failed", toErrorMessage(error)), [])),
          offPeakTaskService
            .getCodingPlanSupport()
            .catch((error) => ((supportLoadFailed = true), logger.warn("[off-peak] coding plan support load failed", toErrorMessage(error)), null)),
        ]);
        let takeNumberAvailability: OffPeakTakeNumberAvailability | null = null;
        let availabilityStatus: OffPeakTaskStoreState["takeNumberAvailabilityStatus"] = supportLoadFailed ? "error" : "idle";
        const codingPlanRelevant = grayConfig?.codingPlanActive === true || codingPlanSupport?.supported === true;
        if (grayConfig?.enabled && codingPlanRelevant) {
          try {
            takeNumberAvailability = await offPeakTaskService.getTakeNumberAvailability();
            availabilityStatus = "ready";
          } catch (error) {
            availabilityStatus = "error";
            logger.warn("[off-peak] availability load failed", toErrorMessage(error));
          }
        }
        set({
          grayConfig,
          tasks,
          codingPlanSupport,
          takeNumberAvailability,
          takeNumberAvailabilityStatus: availabilityStatus,
          loading: false,
        });
      } catch (error) {
        set({
          error: toErrorMessage(error),
          takeNumberAvailability: null,
          takeNumberAvailabilityStatus: "error",
          loading: false,
        });
      }
    })();
    offPeakInitializeInFlight = run;
    try {
      await run;
    } finally {
      if (offPeakInitializeInFlight === run) offPeakInitializeInFlight = null;
    }
  },
  async refresh(service) {
    try {
      set({ tasks: await service.list(), error: null });
    } catch (error) {
      set({ error: toErrorMessage(error) });
    }
  },
  async refreshCodingPlanSupport(service) {
    set({
      codingPlanSupport: null,
      takeNumberAvailability: null,
      takeNumberAvailabilityStatus: "loading",
    });
    try {
      const support = await service.getCodingPlanSupport();
      set({ codingPlanSupport: support });
      const grayConfig = get().grayConfig;
      const codingPlanRelevant = grayConfig?.codingPlanActive === true || support.supported === true;
      if (grayConfig?.enabled && codingPlanRelevant) {
        await get().refreshTakeNumberAvailability(service);
      } else {
        set({ takeNumberAvailabilityStatus: "idle" });
      }
    } catch (error) {
      set({ codingPlanSupport: null, takeNumberAvailabilityStatus: "error" });
      logger.warn("[off-peak] coding plan support refresh failed", toErrorMessage(error));
    }
  },
  async refreshTakeNumberAvailability(service) {
    set({ takeNumberAvailability: null, takeNumberAvailabilityStatus: "loading" });
    try {
      set({
        takeNumberAvailability: await service.getTakeNumberAvailability(),
        takeNumberAvailabilityStatus: "ready",
      });
    } catch (error) {
      set({ takeNumberAvailability: null, takeNumberAvailabilityStatus: "error" });
      logger.warn("[off-peak] availability refresh failed", toErrorMessage(error));
    }
  },
  async createTask(input, service) {
    set({ operationId: "offpeak:create", error: null });
    try {
      const result = await service.createTask(input);
      if (result.ok) {
        await Promise.all([get().refresh(service), get().refreshTakeNumberAvailability(service)]);
        return result;
      }
      set({
        error: result.errorCategory,
        takeNumberAvailability: null,
        takeNumberAvailabilityStatus: "error",
      });
      logger.warn("[off-peak] create failed", {
        errorCategory: result.errorCategory,
        errorCode: result.errorCode,
        failureStage: result.failureStage,
      });
      if (isQuota3103Error(result)) await get().refreshTakeNumberAvailability(service);
      return result;
    } catch (error) {
      const fallback: OffPeakCreateResult = {
        ok: false,
        failureStage: "ticket_request",
        errorCategory: "network",
        errorCode: "",
        providerName: "",
      };
      set({
        error: fallback.errorCategory,
        takeNumberAvailability: null,
        takeNumberAvailabilityStatus: "error",
      });
      logger.warn("[off-peak] create RPC transport failed", {
        errorType: error instanceof Error ? error.name : typeof error,
      });
      return fallback;
    } finally {
      set({ operationId: null });
    }
  },
  async updateTask(id, patch, service) {
    set({ operationId: `offpeak:update:${id}`, error: null });
    try {
      const updated = await service.updateTask(id, patch);
      await get().refresh(service);
      return updated !== null;
    } catch (error) {
      set({ error: toErrorMessage(error) });
      return false;
    } finally {
      set({ operationId: null });
    }
  },
  async pauseTask(id, service) {
    set({ operationId: `offpeak:pause:${id}`, error: null });
    try {
      await service.pauseTask(id);
      await get().refresh(service);
    } catch (error) {
      set({ error: toErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async continueTask(id, service) {
    set({ operationId: `offpeak:continue:${id}`, error: null });
    try {
      await service.continueTask(id);
      await get().refresh(service);
    } catch (error) {
      set({ error: toErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async cancelTask(id, service) {
    set({ operationId: `offpeak:cancel:${id}`, error: null });
    try {
      await service.cancelTask(id);
      await get().refresh(service);
    } catch (error) {
      set({ error: toErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async deleteTask(id, service) {
    set({ operationId: `offpeak:delete:${id}`, error: null });
    try {
      await service.deleteTask(id);
      await get().refresh(service);
    } catch (error) {
      set({ error: toErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async deleteHistory(id, service) {
    set({ operationId: `offpeak:delete-history:${id}`, error: null });
    try {
      await service.deleteHistory(id);
      await get().refresh(service);
    } catch (error) {
      set({ error: toErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  dismissNewTaskBanner() {
    set({ newTaskBannerDismissed: true });
  },
  setPendingCreateDraft(draft) {
    set({ pendingCreateDraft: draft });
  },
  consumePendingCreateDraft() {
    const draft = get().pendingCreateDraft;
    if (draft) set({ pendingCreateDraft: null });
    return draft;
  },
}));

/** 原 Oit：新任务横幅的 3 张建议卡模板（文案 key：offPeak.newTask.template.<id>.*） */
export const OFF_PEAK_HOME_TEMPLATES: Array<{ id: "standupGitSummary" | "ciFlakyReport" | "customize" }> = [
  { id: "standupGitSummary" },
  { id: "ciFlakyReport" },
  { id: "customize" },
];

export interface OffPeakNewTaskBannerProps {
  /** 打开自动化面板（R0 传入的 onOpenAutomations） */
  onOpenAutomations?: () => void;
}

/**
 * 原 kit（js 91591 / jsx 79222）：off-peak 新任务横幅。
 * 显示条件：grayConfig.enabled === true 且未被关闭（newTaskBannerDismissed）。
 * 结构：头部行（📢 megaphone 图标 + bannerText（悬停提示 bannerTipText）+ 关闭按钮）
 *       + 3 张模板建议卡（sm:grid-cols-3，moon 图标 + 标题 + 描述）。
 * 无任何 Coding Plan 时点卡 → 弹升级 toast；否则写 pendingCreateDraft 并打开自动化面板。
 */
export function OffPeakNewTaskBanner({ onOpenAutomations }: OffPeakNewTaskBannerProps) {
  const { intl } = useIntlContext();
  const { offPeakTaskService, codingPlanSubscriptionService } = useServices();
  const { settings } = useSettingsSnapshot();
  const { modelProviders, loading: providersLoading } = useModelProviders();
  const upgradeActions = useUpgradeActions();
  const grayConfig = useOffPeakTaskStore((s) => s.grayConfig);
  const bannerDismissed = useOffPeakTaskStore((s) => s.newTaskBannerDismissed);
  const initialize = useOffPeakTaskStore((s) => s.initialize);
  const refreshCodingPlanSupport = useOffPeakTaskStore((s) => s.refreshCodingPlanSupport);
  const dismissNewTaskBanner = useOffPeakTaskStore((s) => s.dismissNewTaskBanner);
  const setPendingCreateDraft = useOffPeakTaskStore((s) => s.setPendingCreateDraft);

  React.useEffect(() => {
    initialize({ offPeakTaskService, codingPlanSubscriptionService });
  }, [initialize, offPeakTaskService, codingPlanSubscriptionService]);

  const providerFamilyDomain = settings?.providerFamilyDomain;
  const selectedAuthMode = providerFamilyDomain ? settings?.modelProviderFamilyModes?.[providerFamilyDomain] : undefined;
  const selectedConnectionKey = providerFamilyDomain ? settings?.modelProviderFamilySelectedKeys?.[providerFamilyDomain] : undefined;
  const settingsReady = settings != null;
  const settingsSeenRef = React.useRef(false);

  // 设置首次就绪后，连接选择变化时刷新 Coding Plan 支持态
  React.useEffect(() => {
    if (settingsReady) {
      if (!settingsSeenRef.current) {
        settingsSeenRef.current = true;
        return;
      }
      refreshCodingPlanSupport(offPeakTaskService);
    }
  }, [settingsReady, offPeakTaskService, refreshCodingPlanSupport, selectedConnectionKey, selectedAuthMode, providerFamilyDomain]);

  if (grayConfig?.enabled !== true || bannerDismissed) return null;

  const lacksAnyCodingPlan =
    grayConfig.codingPlanActive === false || (grayConfig.codingPlanActive === undefined && !providersLoading && !hasCodingPlanProviderEntry(modelProviders));

  const showCodingPlanToast = () => {
    toast(intl.formatMessage({ id: "offPeak.create.codingPlanToast" }), {
      durationMs: 8000,
      position: "top-center",
      variant: "info",
      actionLabel: intl.formatMessage({ id: "settings.modelProvider.codingPlan.upgrade" }),
      onAction: () => {
        const providerId =
          settings?.providerFamilyDomain === "bigmodel" ? providerIds.bigmodelCodingPlan : providerIds.zaiCodingPlan;
        const upgradeLabel = intl.formatMessage({ id: "settings.modelProvider.codingPlan.upgrade" });
        upgradeActions?.openCodingPlanUpgrade?.({
          providerId,
          initialAudience: "personal",
          funnelContext: buildCodingPlanFunnelContext({
            providerId,
            eventText: upgradeLabel,
            entryPlanState: resolveEntryPlanState({ providers: modelProviders, loading: providersLoading }),
          }),
        });
      },
      dismissible: true,
      dismissLabel: intl.formatMessage({ id: "common.close" }),
    });
  };

  const handleTemplateClick = (template: (typeof OFF_PEAK_HOME_TEMPLATES)[number]) => {
    if (lacksAnyCodingPlan) {
      logger.debug("[off-peak] blocked home template without any Coding Plan", { templateId: template.id });
      showCodingPlanToast();
      return;
    }
    setPendingCreateDraft(
      template.id === "customize"
        ? { telemetrySource: { eventRegion: "app.session", templateId: template.id } }
        : {
            title: intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.title` }),
            prompt: intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.prompt` }),
            telemetrySource: { eventRegion: "app.session", templateId: template.id },
          },
    );
    onOpenAutomations?.();
  };

  return (
    <div className="mt-6 flex flex-col gap-3 @min-[820px]/conversation:-mx-[54px]">
      {/* 横幅头行：📢 + 文案（带 tip popover）+ 关闭 */}
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-1 text-foreground-subtle opacity-80">
          <span className="flex size-8 shrink-0 items-center justify-center" aria-hidden="true">
            <IconMegaphone className="size-4" strokeWidth={2} />
          </span>
          <Popover>
            <PopoverAnchor>
              <PopoverTrigger asChild>
                <span
                  tabIndex={0}
                  className="min-w-0 cursor-default rounded-sm text-ui-caption font-normal leading-snug focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-hover"
                >
                  {intl.formatMessage({ id: "offPeak.newTask.bannerText" })}
                </span>
              </PopoverTrigger>
            </PopoverAnchor>
            <PopoverContent side="top" sideOffset={6} className="max-w-none whitespace-nowrap">
              <span>{intl.formatMessage({ id: "offPeak.newTask.bannerTipText" })}</span>
            </PopoverContent>
          </Popover>
        </div>
        <button
          type="button"
          onClick={dismissNewTaskBanner}
          aria-label={intl.formatMessage({ id: "common.close" })}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-foreground-subtle opacity-80 hover:bg-hover hover:opacity-100"
        >
          <IconClose className="size-4" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
      {/* 建议卡 3 张（spec §5：icon+title+body） */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {OFF_PEAK_HOME_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => handleTemplateClick(template)}
            className="flex flex-col gap-2 rounded-2xl border border-card-border bg-background p-3 text-left transition-colors hover:bg-surface-hover"
          >
            <div className="flex items-center gap-1.5">
              <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
                <IconMoon
                  aria-hidden="true"
                  className="size-4 text-foreground-subtle"
                  data-off-peak-homepage-template-icon="moon"
                  size={16}
                  strokeWidth={2}
                />
              </span>
              <span className="truncate text-ui-base leading-5 text-foreground">
                {intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.title` })}
              </span>
            </div>
            <p className="text-wrap-phrase line-clamp-3 text-ui-caption font-normal leading-snug text-foreground-subtle">
              {intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.description` })}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. 工作区选择行（原 mOt/hOt/gOt/_Ot/vOt/yOt/bOt/a4 + UTt/N2，
 *    js 123177,123199,128526–128776 / jsx 108386–108415）。
 *    Home contextHeader 的左件：🗀 名称 + ⌄ 菜单（最近项目搜索/打开文件夹/
 *    远程连接/不选项目）。由窗口壳 yJt 组装进 contextHeader（js 184540–184577），
 *    draft 态随 composer 卡顶部渲染。
 * ==========================================================================*/

/** 工作区标签页（窗口壳维护；原 Ti(e) 生成作用域 key） */
export interface WorkspaceTab {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  workspacePurpose?: "project" | "conversation";
  label?: string;
}
/* ── tombstone〔A1-R50〕：本地 RemoteTarget 副本（6 员 family-A 形）删除 → 统一属主
 *    改指 components/ime/ImeComposition::RemoteTarget（canonical openInEditor opts.remoteTarget
 *    内联抽出；经 modules/ImeComposition type import，既有边）。消费位 @1235（本地
 *    WorkspaceTab.remoteTarget 面）/ @1350（onConnectRemote 参型）逐字不变。 ── */
/** 工作区作用域 key（原 Ti，src-HCld2afU.js 导出） */
/** 路径末段名（原 Go，横切层 1928） */
/* ── tombstone（A1-R4）：remoteTargetDisplayLabel（原 XTt）declare 删除 → 真实 import
 *    from '../../modules/SplitLayoutDeep'（§F 远端条目域，js 123241）。
 *    型别宽化：返回 string | undefined；remoteTabSearchHaystack 之 filter(Boolean) 兼容。 ── */

/** 原 UTt：远程工作区入口开关（当前恒 true） */
export function useRemoteWorkspaceEnabled(): boolean {
  return true;
}

/** 原 N2：是否远程/带身份的工作区标签 */
export function isRemoteWorkspaceTab(tab: Partial<WorkspaceTab> | null | undefined): boolean {
  return !!(tab && (tab.remoteSessionId || tab.remoteTarget || tab.workspaceIdentity));
}

const HOME_DIR_PATH_REGEX = /^(\/Users\/[^/]+|\/home\/[^/]+|[A-Za-z]:\/Users\/[^/]+)(?:\/|$)/;
const HOME_DIR_EXACT_REGEX = /^(\/Users\/[^/]+|\/home\/[^/]+|[A-Za-z]:\/Users\/[^/]+)$/;

function normalizePathForDisplay(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+$/, "");
}

/** 原 mOt：路径若以家目录开头，返回家目录前缀（否则 null） */
export function resolveHomePathPrefix(path: string): string | null {
  return normalizePathForDisplay(path).match(HOME_DIR_PATH_REGEX)?.[1] ?? null;
}

/** 原 hOt：家目录本身显示为给定标签，否则显示末段名 */
export function homeAwareDisplayName(path: string, homeLabel: string): string {
  const normalized = normalizePathForDisplay(path);
  return HOME_DIR_EXACT_REGEX.test(normalized) ? homeLabel : pathBasename(path);
}

/** 原 gOt：菜单项标签（家目录本身 → 末段名，其余 → homeAwareDisplayName） */
export function workspaceMenuLabel(path: string, homeLabel: string): string {
  const normalized = normalizePathForDisplay(path);
  return HOME_DIR_EXACT_REGEX.test(normalized) ? pathBasename(path) : homeAwareDisplayName(path, homeLabel);
}

/** 原 _Ot：触发器（chip）标签 */
export function workspaceTriggerLabel(path: string, homeLabel: string): string {
  const normalized = normalizePathForDisplay(path);
  return HOME_DIR_EXACT_REGEX.test(normalized) ? pathBasename(path) : homeAwareDisplayName(path, homeLabel);
}

/** 原 vOt：两个标签是否同一工作区（按作用域 key） */
export function isSameWorkspaceTab(
  a: Pick<WorkspaceTab, "workspacePath" | "workspaceIdentity" | "remoteSessionId">,
  b: Pick<WorkspaceTab, "workspacePath" | "workspaceIdentity" | "remoteSessionId">,
): boolean {
  const scopeOf = (tab: typeof a) => ({
    workspacePath: tab.workspacePath,
    workspaceIdentity: tab.workspaceIdentity ?? undefined,
    remoteSessionId: tab.remoteSessionId ?? undefined,
  });
  return workspaceScopeKey(scopeOf(a)) === workspaceScopeKey(scopeOf(b));
}

/** 原 yOt：远程标签的搜索串（远程目标标签 + 身份） */
export function remoteTabSearchHaystack(tab: WorkspaceTab): string {
  return tab.remoteTarget
    ? [remoteTargetDisplayLabel(tab.remoteTarget), tab.workspaceIdentity].filter(Boolean).join(" ")
    : (tab.workspaceIdentity ?? "");
}

/** 原 bOt：菜单用工作区过滤（排除未连接的会话远程项、按搜索词匹配、前 5 条） */
export function filterWorkspaceTabsForMenu({
  workspaceTabs,
  homeWorkspaceLabel,
  searchQuery,
}: {
  workspaceTabs: WorkspaceTab[];
  homeWorkspaceLabel: string;
  searchQuery: string;
}): WorkspaceTab[] {
  const query = searchQuery.trim().toLowerCase();
  return workspaceTabs
    .filter((tab) => !(isRemoteWorkspaceTab(tab) && !tab.remoteSessionId))
    .filter((tab) =>
      query
        ? [workspaceMenuLabel(tab.workspacePath, homeWorkspaceLabel), tab.label, tab.workspacePath, remoteTabSearchHaystack(tab)]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true,
    )
    .slice(0, 5);
}

/** 原 pOt = fOt：远程连接向导对话框（F10 RemoteFamily，js 128093；接口保留） */

export interface WorkspaceSelectionRowProps {
  workspacePath: string;
  workspaceIdentity?: string | null;
  isWindowsDesktop?: boolean;
  compactForRemoteControl?: boolean;
  workspaceTabs: WorkspaceTab[];
  allowConversationWorkspaceSelection?: boolean;
  allowConversationWorkspaceDetach?: boolean;
  onSelectWorkspace: (tab: WorkspaceTab) => void;
  onSelectConversationWorkspace: () => void;
  onOpenFolder: () => void;
  allowOpenWorkspace?: boolean;
  allowRemoteWorkspace?: boolean;
  remoteWorkspaceSessions?: RemoteWorkspaceSessionLike[];
  /* A0-CLEANUP4：三回调收 RemoteWizardDialog 属主面具型（bundle a4 js 128776–128786 纯透传 pOt） */
  onConnectRemote: (target: RemoteTarget, requestId: string) => Promise<string | null>;
  onSelectRemoteProject: (sessionId: string, path: string, localWorkspacePath?: string) => Promise<void>;
  onCancelRemoteProject: (sessionId: string) => Promise<void>;
  containerClassName?: string;
  triggerClassName?: string;
  triggerIndicator?: React.ReactNode;
}

/**
 * 原 a4（js 128568 / jsx 108415）：工作区选择行（spec §5 workspace 行的左半）。
 * 胶囊触发器 = [悬停显形的分离按钮（会话工作区才可分离）] + [图标+名称+⌄]；
 * 弹出菜单 = 搜索框 + 最近项目（前 5，勾选态）+ [打开文件夹] + [远程连接] + [不选项目]。
 * 图标语义：远程=cloud、家目录=house、普通=folder。
 */
export function WorkspaceSelectionRow({
  workspacePath,
  workspaceIdentity,
  isWindowsDesktop = false,
  compactForRemoteControl = false,
  workspaceTabs,
  allowConversationWorkspaceSelection = true,
  allowConversationWorkspaceDetach = allowConversationWorkspaceSelection,
  onSelectWorkspace,
  onSelectConversationWorkspace,
  onOpenFolder,
  allowOpenWorkspace = true,
  allowRemoteWorkspace = true,
  remoteWorkspaceSessions = [],
  onConnectRemote,
  onSelectRemoteProject,
  onCancelRemoteProject,
  containerClassName,
  triggerClassName,
  triggerIndicator,
}: WorkspaceSelectionRowProps) {
  const { intl } = useIntlContext();
  const [remoteDialogOpen, setRemoteDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const remoteEnabled = useRemoteWorkspaceEnabled();
  const allowRemote = allowRemoteWorkspace && remoteEnabled;
  const activeTab = workspaceTabs.find((tab) => isSameWorkspaceTab(tab, { workspacePath, workspaceIdentity })) ?? null;
  const isConversationWorkspace = activeTab?.workspacePurpose === "conversation";
  const canDetach = allowConversationWorkspaceSelection && allowConversationWorkspaceDetach && !isConversationWorkspace;
  const remoteDialogLocalPath =
    isConversationWorkspace || activeTab?.remoteSessionId || activeTab?.remoteTarget || activeTab?.workspaceIdentity
      ? undefined
      : workspacePath;
  const homePrefix = resolveHomePathPrefix(workspacePath);
  const homeLabel = intl.formatMessage({ id: "chat.empty.home" });
  const remoteTab = isRemoteWorkspaceTab(activeTab ?? {});
  const menuTabs = React.useMemo(
    () =>
      filterWorkspaceTabsForMenu({
        workspaceTabs: workspaceTabs.filter((tab) => tab.workspacePurpose !== "conversation"),
        homeWorkspaceLabel: homeLabel,
        searchQuery,
      }),
    [homeLabel, searchQuery, workspaceTabs],
  );
  const triggerLabel = isConversationWorkspace
    ? intl.formatMessage({ id: "chat.empty.selectProject" })
    : workspaceTriggerLabel(workspacePath, homeLabel);
  const TriggerIcon = remoteTab ? IconCloud : homePrefix === workspacePath ? IconHouse : IconFolder;

  return (
    <DropdownMenu>
      <div
        className={cn(
          "group/workspace-chip relative flex min-w-0 items-center rounded-full hover:bg-surface-hover focus-within:bg-surface-hover",
          containerClassName,
        ) as string}
      >
        {/* 分离按钮：仅会话工作区可分离，悬停/聚焦显形 */}
        {canDetach ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="pointer-events-none absolute left-1.5 z-10 rounded-full text-foreground-subtle opacity-0 transition-opacity group-hover/workspace-chip:pointer-events-auto group-hover/workspace-chip:opacity-100 group-focus-within/workspace-chip:pointer-events-auto group-focus-within/workspace-chip:opacity-100"
            aria-label={intl.formatMessage({ id: "chat.empty.detachProject" })}
            data-testid={PROJECT_DETACH_TESTID}
            onClick={(event: React.MouseEvent) => {
              event.stopPropagation();
              onSelectConversationWorkspace();
            }}
          >
            <IconClose className="size-3.5" />
          </Button>
        ) : null}
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="default"
            className={cn(
              "min-w-0 rounded-full bg-transparent text-ui-base/relaxed hover:bg-transparent",
              compactForRemoteControl ? "max-w-44 pl-3 pr-2" : "max-w-[15rem] pl-3 pr-2",
              triggerClassName,
            ) as string}
            aria-label={intl.formatMessage({ id: "chat.empty.workspaceMenu" })}
            data-testid={WORKSPACE_TRIGGER_TESTID}
          >
            <TriggerIcon
              className={cn(
                "size-4 text-foreground-subtle transition-opacity",
                canDetach && "group-hover/workspace-chip:opacity-0 group-focus-within/workspace-chip:opacity-0",
              ) as string}
            />
            <span className="block max-w-full truncate">{triggerLabel}</span>
            {triggerIndicator ?? <IconChevronDown className="size-3.5 text-foreground-subtle" />}
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent align="start" side="top" className="w-72 p-0">
        {/* 最近项目搜索框 */}
        <div
          data-slot="command-input-wrapper"
          className="p-1 border-b border-border"
          onKeyDown={(event) => event.stopPropagation()}
        >
          <InputGroup className="h-8 border-0 !bg-transparent hover:border-input-border-hover ">
            <input
              data-slot="command-input"
              value={searchQuery}
              placeholder={intl.formatMessage({ id: "chat.empty.workspaceSearchPlaceholder" })}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full text-ui-base/relaxed text-foreground outline-hidden placeholder:text-foreground-subtlest disabled:cursor-not-allowed disabled:opacity-50"
            />
            <InputGroupAddon>
              <IconSearch className="size-4 shrink-0 text-foreground-subtlest" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="p-1">
          {menuTabs.map((tab, index) => {
            const itemLabel = workspaceMenuLabel(tab.workspacePath, homeLabel);
            const ItemIcon = isRemoteWorkspaceTab(tab) ? IconCloud : resolveHomePathPrefix(tab.workspacePath) === tab.workspacePath ? IconHouse : IconFolder;
            return (
              <DropdownMenuCheckboxItem
                key={`${tab.workspaceIdentity ?? tab.remoteSessionId ?? "local"}:${tab.workspacePath}:${index}`}
                checked={isSameWorkspaceTab(tab, { workspacePath, workspaceIdentity })}
                onSelect={() => {
                  onSelectWorkspace(tab);
                }}
              >
                <ItemIcon className="size-4 text-foreground-subtle" />
                <span className="min-w-0 flex-1 truncate">{itemLabel}</span>
              </DropdownMenuCheckboxItem>
            );
          })}
          {menuTabs.length === 0 ? (
            <div className="px-2 py-2 text-ui-base text-foreground-subtlest">
              {intl.formatMessage({ id: "chat.empty.workspaceSearchEmpty" })}
            </div>
          ) : null}
          <DropdownMenuSeparator />
          {allowOpenWorkspace ? (
            <DropdownMenuItem onSelect={onOpenFolder}>
              <IconFolderPlus className="size-4 text-foreground-subtle" />
              <span>{intl.formatMessage({ id: "workspace.openFolder" })}</span>
            </DropdownMenuItem>
          ) : null}
          {allowRemote ? (
            <DropdownMenuItem
              data-testid={REMOTE_CONNECTION_TESTID}
              onSelect={() => {
                logger.info(`[ChatEmptyWorkspacePreviewMenu] open remote dialog from workspace menu workspace=${workspacePath}`);
                setRemoteDialogOpen(true);
              }}
            >
              <IconCloud className="size-4 text-foreground-subtle" />
              <span>{intl.formatMessage({ id: "remote.trigger" })}</span>
            </DropdownMenuItem>
          ) : null}
          {allowConversationWorkspaceSelection ? (
            <DropdownMenuCheckboxItem
              data-testid={WORK_OUTSIDE_PROJECT_TESTID}
              checked={isConversationWorkspace}
              onSelect={() => void onSelectConversationWorkspace()}
            >
              <IconMessageCircle className="size-4 text-foreground-subtle" />
              <span>{intl.formatMessage({ id: "chat.empty.workOutsideProject" })}</span>
            </DropdownMenuCheckboxItem>
          ) : null}
        </div>
      </DropdownMenuContent>
      {allowRemote ? (
        <RemoteWizardDialog
          onConnect={onConnectRemote}
          onSelectProject={onSelectRemoteProject}
          onCancelSession={onCancelRemoteProject}
          localWorkspacePath={remoteDialogLocalPath}
          isWindowsDesktop={isWindowsDesktop}
          remoteWorkspaceSessions={remoteWorkspaceSessions}
          open={remoteDialogOpen}
          onOpenChange={setRemoteDialogOpen}
          hideTriggerWhenClosed
        />
      ) : null}
    </DropdownMenu>
  );
}

/* ============================================================================
 * 4. 提及菜单（@#>）可见层（原 mC/Pqe/Fqe/Iqe/tV/SV/_Je/vJe/yJe，
 *    js 36348,64024–64029,64061–64064,64594–64865）。
 *    接线层（Lexical 编辑器内触发检测/键盘导航/选择回填）在 F08：
 *    KJe MentionSelector（js 65605，@→files/plugins、#→sessions、$→skills）、
 *    SJe SlashPanel（js 65002，/→commands/skills/subagents）。
 * ==========================================================================*/

/** 原 mC：提及域 → 触发符（spec §5 所引：commands `>`、conversations `#`、files `@`） */
export function mentionTriggerChar(scope: "commands" | "conversations" | "files" | string): string {
  switch (scope) {
    case "commands":
      return ">";
    case "conversations":
      return "#";
    case "files":
      return "@";
    default:
      return "";
  }
}

/** 原 Pqe：光标前触发符检测（行内空白后的 / @ $ # ¥ ￥） */
export const MENTION_TRIGGER_REGEX = /(^|\s)([/@$#¥￥])([^\s/@$#¥￥]*)$/;
/** 原 Fqe：token 前缀（补全用） */
export const MENTION_TOKEN_PREFIX_REGEX = /^[^\s/@$#¥￥]*/;
/** 原 Iqe：人民币符号归一为 $（技能触发符） */
export function normalizeCnyTrigger(trigger: string): string {
  return trigger === "¥" || trigger === "￥" ? "$" : trigger;
}
/** 原 tV：从光标前文本解析 {trigger, query} */
export function parseMentionTrigger(textBeforeCursor: string): { trigger: string; query: string } | null {
  const match = MENTION_TRIGGER_REGEX.exec(textBeforeCursor);
  return match ? { trigger: normalizeCnyTrigger(match[2] ?? ""), query: match[3] ?? "" } : null;
}

/* --- SuggestionPanel 的内部助手（原 _V/vV/yV/bV/xV/pJe/mJe/hJe/gJe） --- */

const PANEL_MASK_FADE_PX = 24; // _V
const PANEL_SCROLL_EDGE_EPSILON = 1; // vV
const PANEL_SCROLL_EDGE_NONE = { showTop: false, showBottom: false }; // yV

function resolvePanelScrollEdges({
  clientHeight,
  scrollHeight,
  scrollTop,
}: {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
}): { showTop: boolean; showBottom: boolean } {
  const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
  if (maxScrollTop <= PANEL_SCROLL_EDGE_EPSILON) return PANEL_SCROLL_EDGE_NONE;
  return { showTop: scrollTop > PANEL_SCROLL_EDGE_EPSILON, showBottom: scrollTop < maxScrollTop - PANEL_SCROLL_EDGE_EPSILON };
}

/** 原 xV：上下渐隐遮罩样式（滚动边缘提示） */
function panelEdgeMaskStyle({ showBottom, showTop }: { showTop: boolean; showBottom: boolean }): React.CSSProperties | undefined {
  if (!showTop && !showBottom) return undefined;
  const gradient = `linear-gradient(to bottom, ${showTop ? `transparent 0px, black ${PANEL_MASK_FADE_PX}px` : `black 0px, black ${PANEL_MASK_FADE_PX}px`}, ${showBottom ? `black calc(100% - ${PANEL_MASK_FADE_PX}px), transparent 100%` : `black calc(100% - ${PANEL_MASK_FADE_PX}px), black 100%`})`;
  return {
    WebkitMaskImage: gradient,
    maskImage: gradient,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };
}

const OPTION_ROW_HEIGHT = 34; // pJe
const STATUS_ROW_HEIGHT = 40; // mJe
const SECTION_HEADER_ROW_HEIGHT = 28; // hJe

export interface SuggestionOption {
  id: string;
  label: string;
  description?: string;
  meta?: string;
  disabled?: boolean;
  disabledReason?: string;
  content?: React.ReactNode;
  [key: string]: unknown;
}
export interface SuggestionSection {
  id: string;
  title: string;
  options: SuggestionOption[];
  loading?: boolean;
  loadingText?: string;
  emptyText: string;
  errorText?: string | null;
}
type SuggestionRow =
  | { kind: "section_header"; sectionId: string; title: string }
  | { kind: "status"; sectionId: string; content: "loading" | "error" | "empty"; text: string }
  | { kind: "option"; sectionId: string; option: SuggestionOption; flatOptionIndex: number };

/** 原 gJe：分段 → 扁平行（多段才出段头；error > loading > empty > options） */
export function flattenSuggestionRows(sections: SuggestionSection[]): SuggestionRow[] {
  const rows: SuggestionRow[] = [];
  let flatOptionIndex = 0;
  const multipleSections = sections.length > 1;
  for (const section of sections) {
    if (multipleSections && section.title.trim().length > 0) {
      rows.push({ kind: "section_header", sectionId: section.id, title: section.title });
    }
    if (section.errorText) {
      rows.push({ kind: "status", sectionId: section.id, content: "error", text: section.errorText });
    } else if (section.loading) {
      rows.push({
        kind: "status",
        sectionId: section.id,
        content: "loading",
        text: section.loadingText ?? section.emptyText,
      });
    } else if (section.options.length === 0) {
      rows.push({ kind: "status", sectionId: section.id, content: "empty", text: section.emptyText });
    } else {
      for (const option of section.options) {
        rows.push({ kind: "option", sectionId: section.id, option, flatOptionIndex });
        flatOptionIndex += 1;
      }
    }
  }
  return rows;
}

export interface SuggestionPanelProps {
  title: string;
  description?: string;
  sections: SuggestionSection[];
  emptyText: string;
  selectedIndex: number;
  hasActiveQuery: boolean;
  onSelect: (flatOptionIndex: number) => void;
  /** 触发符（@ # $ > /），写入 data-trigger */
  trigger: string;
}

/**
 * 原 SV（js 64639 / jsx 57678）：提及/斜杠建议面板。
 * `rounded-2xl border bg-menu` 浮层，@tanstack/virtual 虚拟滚动（行高 34/28/40），
 * 选中项自动 scrollToIndex，滚动边缘渐隐遮罩。
 * testid：prompt-suggestion-panel（段头 -section / 选项 -option / 状态 -status 派生）。
 */
export function SuggestionPanel({
  title,
  description,
  sections,
  emptyText,
  selectedIndex,
  hasActiveQuery,
  onSelect,
  trigger,
}: SuggestionPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [scrollEdges, setScrollEdges] = React.useState(PANEL_SCROLL_EDGE_NONE);
  const rows = React.useMemo(() => flattenSuggestionRows(sections), [sections]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      rows[index]?.kind === "option" ? OPTION_ROW_HEIGHT : rows[index]?.kind === "section_header" ? SECTION_HEADER_ROW_HEIGHT : STATUS_ROW_HEIGHT,
    overscan: 8,
  });
  const totalHeight = virtualizer.getTotalSize();
  const recomputeScrollEdges = React.useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      setScrollEdges(PANEL_SCROLL_EDGE_NONE);
      return;
    }
    const next = resolvePanelScrollEdges({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
    });
    setScrollEdges((prev) => (prev.showTop === next.showTop && prev.showBottom === next.showBottom ? prev : next));
  }, []);
  const maskStyle = React.useMemo(() => panelEdgeMaskStyle(scrollEdges), [scrollEdges]);
  const selectedRowIndex = React.useMemo(
    () => rows.findIndex((row) => row.kind === "option" && row.flatOptionIndex === selectedIndex),
    [rows, selectedIndex],
  );

  // 选中项滚动进视野
  React.useEffect(() => {
    if (selectedRowIndex >= 0) virtualizer.scrollToIndex(selectedRowIndex, { align: "auto" });
  }, [selectedRowIndex, virtualizer]);

  // 滚动/尺寸变化时更新边缘遮罩
  React.useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      setScrollEdges(PANEL_SCROLL_EDGE_NONE);
      return;
    }
    let rafId: number | null = null;
    const scheduleRecompute = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          recomputeScrollEdges();
        });
      }
    };
    recomputeScrollEdges();
    element.addEventListener("scroll", scheduleRecompute, { passive: true });
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver < "u") {
      resizeObserver = new ResizeObserver(scheduleRecompute);
      resizeObserver.observe(element);
      const firstChild = element.firstElementChild;
      if (firstChild) resizeObserver.observe(firstChild);
    } else {
      window.addEventListener("resize", scheduleRecompute);
    }
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      element.removeEventListener("scroll", scheduleRecompute);
      resizeObserver?.disconnect();
      if (typeof ResizeObserver > "u") window.removeEventListener("resize", scheduleRecompute);
    };
  }, [totalHeight, recomputeScrollEdges, rows.length]);

  return (
    <div
      className="mb-1 overflow-hidden rounded-2xl border border-border bg-menu shadow-xs"
      data-testid="prompt-suggestion-panel"
      data-trigger={trigger}
    >
      {rows.length > 0 ? (
        <div
          ref={scrollRef}
          className="max-h-56 overflow-y-auto px-1 py-0.75"
          role="listbox"
          aria-label={title}
          onMouseLeave={() => setHoveredIndex(null)}
          style={maskStyle}
        >
          <div style={{ height: `${totalHeight}px`, width: "100%", position: "relative" }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const row = rows[virtualItem.index];
              return row ? (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {row.kind === "status" ? (
                    <SuggestionStatusRow row={row} />
                  ) : row.kind === "section_header" ? (
                    <SuggestionSectionHeaderRow row={row} />
                  ) : (
                    <SuggestionOptionRow
                      row={row}
                      isSelected={row.flatOptionIndex === selectedIndex}
                      isHovered={row.flatOptionIndex === hoveredIndex}
                      onSelect={onSelect}
                      onHover={setHoveredIndex}
                    />
                  )}
                </div>
              ) : null;
            })}
          </div>
        </div>
      ) : hasActiveQuery && emptyText ? (
        <div className="flex items-center justify-between px-4 py-3 text-ui-base text-foreground-subtlest">{emptyText}</div>
      ) : null}
      {!hasActiveQuery && description ? (
        <div className="flex items-center gap-2 px-4 py-3 text-ui-base text-foreground-subtle">
          <IconInfo className="size-4 shrink-0 text-foreground" />
          <span>{description}</span>
        </div>
      ) : null}
    </div>
  );
}

/** 原 _Je：段头行 */
export function SuggestionSectionHeaderRow({ row }: { row: Extract<SuggestionRow, { kind: "section_header" }> }) {
  return (
    <div
      className="px-3 pt-2 pb-1 text-ui-xs font-semibold uppercase tracking-wide text-foreground-subtlest"
      data-testid={testidOf("prompt-suggestion-section", row.sectionId)}
      data-section-id={row.sectionId}
    >
      {row.title}
    </div>
  );
}

/** 原 vJe：状态行（loading 转圈 / error 红底 / empty 灰字） */
export function SuggestionStatusRow({ row }: { row: Extract<SuggestionRow, { kind: "status" }> }) {
  if (row.content === "loading") {
    return (
      <div
        className="flex items-center gap-2 rounded-xl px-5 py-2 text-ui-base text-foreground-subtle"
        data-testid={testidOf("prompt-suggestion-status", row.sectionId)}
        data-section-id={row.sectionId}
        data-status="loading"
      >
        <IconLoader className="size-3.5 shrink-0 animate-spin" />
        <span>{row.text}</span>
      </div>
    );
  }
  if (row.content === "error") {
    return (
      <div
        className="rounded-xl bg-destructive px-5 py-2 text-ui-base text-destructive-foreground"
        data-testid={testidOf("prompt-suggestion-status", row.sectionId)}
        data-section-id={row.sectionId}
        data-status="error"
      >
        {row.text}
      </div>
    );
  }
  return (
    <div
      className="rounded-xl px-5 py-2 text-ui-base text-foreground-subtlest"
      data-testid={testidOf("prompt-suggestion-status", row.sectionId)}
      data-section-id={row.sectionId}
      data-status="empty"
    >
      {row.text}
    </div>
  );
}

/** 原 yJe：选项行（选中 bg-selected / 悬停 bg-hover；mousedown 防焦点丢失） */
export function SuggestionOptionRow({
  row,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  row: Extract<SuggestionRow, { kind: "option" }>;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (flatOptionIndex: number) => void;
  onHover: (flatOptionIndex: number | null) => void;
}) {
  const { option, flatOptionIndex } = row;
  const disabled = option.disabled === true;
  return (
    <div className="py-px w-full">
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        disabled={disabled}
        data-testid={testidOf("prompt-suggestion-option", option.id)}
        data-section-id={row.sectionId}
        data-option-id={option.id}
        data-option-index={flatOptionIndex}
        data-selected={isSelected ? "true" : "false"}
        data-disabled={disabled ? "true" : "false"}
        className={cn(
          "flex h-8 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors",
          disabled ? "cursor-not-allowed opacity-50" : isSelected ? "bg-selected" : isHovered ? "bg-hover" : "hover:bg-hover",
        ) as string}
        onMouseDown={(event) => {
          event.preventDefault();
          if (!disabled) onSelect(flatOptionIndex);
        }}
        onMouseEnter={() => onHover(disabled ? null : flatOptionIndex)}
      >
        {option.content ? (
          <>{option.content}</>
        ) : (
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2">
              <span className="truncate text-ui-base font-medium text-foreground">{option.label}</span>
              {option.meta ? (
                <span className="shrink-0 text-ui-xs text-foreground-subtlest">{option.meta}</span>
              ) : null}
            </span>
            <span className="mt-1 block truncate text-ui-xs text-foreground-subtlest">
              {disabled && option.disabledReason ? option.disabledReason : option.description}
            </span>
          </span>
        )}
      </button>
    </div>
  );
}

/* ============================================================================
 * 5. composer 卡（draft 态根组件）：原 hit / git = memo(hit)，
 *    js 90180–91174 / jsx 78144–78829。
 *    这是「Home 的 composer 卡」本体：R0 在 draftMode 以 centered 挂载它；
 *    contextHeader（工作区行+分支 chip）渲染在输入面顶部，双层圆角卡片。
 *    同一组件在会话态（非 draft）作为消息列表底部 composer。
 * ==========================================================================*/

/* --- 5.0 hit 依赖的 Composer 族符号（F08，js 行已登记；此处接口保留） --- */

/** 附件（原 je.attachments 项；mXe 钩子产物） */
export interface ComposerAttachment {
  id: string;
  filename: string;
  localPath?: string | null;
  mimeType: string;
  objectUrl?: string | null;
  sourceKind?: "clipboard-text" | string;
  uploadStatus: "pending" | "uploading" | "ready" | "failed";
  uploadProgress: number;
  uploadError?: string | null;
  localZeroCopy?: boolean;
  showComplete?: boolean;
  /** 剪贴板文本附件的行数（描述文案用） */
  lineCount?: number;
  [key: string]: unknown;
}
/** composer 输入 API（Lexical 句柄，原 Ce = inputApiRef） */
export interface ComposerInputApi {
  focus(): void;
  clear(): void;
  setText(text: string): void;
  getMarkdown(): string;
  getEditorState(): { toJSON(): unknown } | null;
  setEditorStateJson(json: string): void;
  setMention?(mention: ComposerMentionPayload, restText: string): void;
  /** 型缝精化（A1-R12）：bundle YV（66811）在 Ce=inputApiRef 上消费 appendFileMention（90348/90735）；
   *  运行时对象 = ComposerInput api（ComposerEditorApi，modules/Composer 4377），A0 注释面缺此成员。 */
  appendFileMention(label: string, filePath: string, markdown: string, data: Record<string, unknown> | undefined, trailingText?: string): void;
}
export interface ComposerMentionPayload {
  markdown: string;
  [key: string]: unknown;
}
export interface ComposerDraftSnapshot {
  text: string;
  editorStateJson?: string;
}
/** 草稿持久化（原 $Ye 前缀 zcode-v4-composer-drafts:v1:，js 67468–67545） */
declare function saveComposerDraft(workspacePath: string, workspaceIdentity: string | null | undefined, scopeId: string, draft: ComposerDraftSnapshot): void;
declare function loadComposerDraft(workspacePath: string, workspaceIdentity: string | null | undefined, scopeId: string): ComposerDraftSnapshot | null;
declare function clearComposerDraft(workspacePath: string, workspaceIdentity: string | null | undefined, scopeId: string): void;
/** 跨工作区切换时草稿搬运标记（原 iXe/rXe，js 67540–67556） */
declare function consumeDraftCarryOver(args: {
  sourceWorkspacePath: string;
  sourceWorkspaceIdentity?: string | null;
  targetWorkspacePath: string;
  targetWorkspaceIdentity?: string | null;
}): boolean;
/** 输入历史（原 sH/cH/JJe，js 67451–67463,66064；localStorage，最多 30 条） */
declare function readPromptHistory(workspacePath: string): string[];
declare function writePromptHistory(workspacePath: string, history: string[]): void;
declare function appendPromptHistoryEntry(history: string[], text: string, limit?: number): string[];
/** 自动聚焦策略（原 lH，js 67465：skip/defer/focus-now） */
declare function resolveAutoFocusPolicy(policy: { autoFocusEnabled: boolean; disabled: boolean; isMobileViewport: boolean }): "skip" | "defer" | "focus-now";
/** 移动端文本输入视口（原 VV/QJe/$Je，js 66101–66110） */
declare function useMobileTextInputViewport(): boolean;
/** 提交快捷键/回车策略（原 eYe/tYe/nYe，js 66111–66118） */
function resolveEnterSubmits({ isMobileTextInputViewport, preferEnterNewline }: { isMobileTextInputViewport: boolean; preferEnterNewline: boolean }): boolean {
  return !(preferEnterNewline && isMobileTextInputViewport);
}
function resolveSubmitShortcut({ enterSubmits }: { enterSubmits: boolean }): string | undefined {
  return enterSubmits ? "Enter" : undefined;
}
function shouldAvoidIosInputFocusZoom({ isMobileTextInputViewport, isWebRemoteControl }: { isMobileTextInputViewport: boolean; isWebRemoteControl: boolean }): boolean {
  return isWebRemoteControl && isMobileTextInputViewport;
}
/** 是否图片附件（原 nH，js 67377） */
function isImageAttachment(attachment: ComposerAttachment): boolean {
  return attachment.mimeType.startsWith("image/");
}

/** 提及/引用/上下文钩子群（F08，js 行登记） */
/* 〔A1-R21〕本地型 WebContextItem/PptxReferenceItem 删除：附件域双钩子收敛后，消费面型别改自
 * canonical 属主——webContexts: WebElementContext[]（Composer ZXe 返回面）、pptxReferences:
 * PptxElementAddDetail[]（PptxReferencesChip QXe 返回面）；原二型（{id; [key: string]: unknown}）
 * 为 A0 期占位，无独立 bundle 对应物。 */
/* ── tombstone（A1-R22）：interface ConversationSelectionItem（declare 时代占位型）删除——
 *    唯一消费面 ConversationSelectionChipRow declare 同批删除；真形 = Composer.ConversationSelection
 *    （F03 域，koe 2720 构建面；SelectionsChip 逐字 props 直接消费）。 ── */
/** 代码评论条目统一采用 GitReview 导出的 CodeCommentAttachment（原 DXe 族类型） */
type CodeCommentItem = CodeCommentAttachment;
declare function useWhiteboardAttachmentScope(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  scopeId: string;
  attachmentSessionId: string | null;
  attachmentPut?: unknown;
  onRuntimeRestart?: () => void;
  disabled: boolean;
}): {
  attachments: ComposerAttachment[];
  hasAttachments: boolean;
  hasUnreadyAttachments: boolean;
  attachmentError: string | null;
  attachmentInputRef: React.RefObject<HTMLInputElement>;
  handleAttachmentInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  openAttachmentPicker: () => void;
  removeAttachment(id: string): void;
  retryAttachment(id: string): void;
  prepareForSend(): Promise<unknown[] | null>;
  adoptSentAttachments(): Promise<void>;
  clearAttachments(): void;
  restoreSessionOwnedAttachments(attachments: ComposerAttachment[]): boolean;
  handleWhiteboardMentionSelected: (mention: unknown) => void;
  handlePaste: (event: ClipboardEvent) => void; // A0-CLEANUP2 item 10：对齐 ComposerInput onPaste 的 DOM ClipboardEvent（PasteCapturePlugin 原生监听）
  handleDragOverComposer(event: React.DragEvent): void;
  handleDragLeaveComposer(event: React.DragEvent): void;
  handleDropComposer(event: React.DragEvent): void;
  composerDragKind: "attachment" | "workspace" | null;
  isDraggingOverComposer: boolean;
};
/* ── tombstone（A1-R13）：declare useFileDragDetection（原 XV，66828）删除 → 文件头
 *    ../../modules/Composer import 别名消费（canonical = useComposerFileDragDetection，
 *    bundle 唯一真身，Composer B10 区已逐字转录；返回 6 字段面，本文件解构 2 字段；
 *    原 declare 2 字段窄面仅 declare 时代产物）。 ── */
/* ── tombstone（A1-R12）：declare parseAddToChatPayload（原 Mj，52248）删除 → 文件头
 *    ../composer/FileMentionDragHelpers import 别名消费（canonical = readWorkspaceFilePayload，
 *    本批逐字转录；调用点 2436 逐字不变）。 ── */
/* ── tombstone（A1-R12）：interface AddToChatPayload（索引形）删除 → 别名指向
 *    FileMentionDragHelpers.WorkspaceFileDragPayload（bundle eUe 52219 解析输出；
 *    事件 detail = rUe 52263 派发载荷，形状逐字段吻合）。 ── */
type AddToChatPayload = WorkspaceFileDragPayload;
/* ── tombstone（A1-R12）：declare insertAddToChatPayload（原 YV，66811）删除 → 文件头
 *    ../../modules/Composer import 别名消费（canonical = applyWorkspaceFileMentionDrop，
 *    bundle 唯一真身；调用点 2440/2947 逐字不变）。 ── */
/* ── tombstone（A1-R12）：declare ADD_TO_CHAT_EVENT_NAME（原 Aj，52211）删除 → 文件头
 *    ADD_WORKSPACE_FILE_TO_CHAT_EVENT 别名 import（调用点 2957/2959 逐字不变）。 ── */
/* ── tombstone（A1-R21）：附件域双钩子 + 余量 6 件 declare 删除——bundle 唯一真身改指收敛：
 *    useWebContexts          （原 ZXe，68940）→ useWebElementContexts（modules/Composer 属主导出）
 *    usePptxReferences       （原 QXe，68996）→ usePptxElementReferences（components/composer/PptxReferencesChip 属主导出）
 *    useCodeCommentOpener    （原 YH，69207）→ usePptxPreviewOpener（同上；A0 旧名误作 code-comment，实为 pptx 预览开启器）
 *    useConversationSelections（原 tZe，69225）→ useSessionScopedReferences（modules/Composer 属主导出）
 *    broadcastContextRemoved （原 jXe，68628）→ removeCodeCommentEverywhere（modules/Composer 属主导出）
 *    buildOutgoingMessage    （原 GXe，68833；旧注 68785/68777 为 +48 漂移行）→ buildOutboundContentWithAttachments（modules/GitReview 属主导出，与 countContextAttachments=GH 68825 配对）
 *    证据：六真身 styles chunk 各仅 1 份定义且均不在导出块（213930 仅 EAe/kAe/jAe/lAe 四名）；
 *    消费面（本文件 6151/6158/6164/6228/6504/6510 区）改指后语义不变。闭包助手（XXe/YXe/IH/LH/BH
 *    属 Composer；pptx 五件 v/y/D/k/E 属 imeComposition 域外）随钩子收敛，无余留。 ── */

/** 错误展示（原 uN/lN，js 54302/54280；A1-R13 行校正，旧注 54254/54232） */
interface ChatError {
  message: string;
  code?: string;
  taskId?: string;
  traceId?: string;
  /** A1-R15 型缝（vWe 54332/54352 消费面）：错误详情文本（Conversation lastError 4629 同面） */
  detail?: string;
  [key: string]: unknown;
}

/* --- A1-R13：聊天错误消息 i18n 解析簇（js 54260–54304，逐字转录；vWe 消费面随
 *     ChatErrorBanner declare 留批，本簇终端消费 = 3046（displayError）/3054（displayMessage） ---
 *   mWe → LEGACY_TASK_MODEL_UNAVAILABLE_MESSAGES (54260)  uN 依赖
 *   hWe → CHAT_ERROR_I18N_FALLBACK_CODES          (54264)  lN 末段 `zcode.error.${code}` 回退集
 *   gWe → MODEL_CONFIG_MISSING_CODES              (54272)  cN 依赖
 *   cN  → isModelConfigMissingError               (54273)  lN 首段
 *   _We → parseClaudeUnknownCommand               (54276)  lN CLAUDE_UNKNOWN_COMMAND 段
 *   lN  → formatChatError                         (54280)  消费 yNe/Cw/jNe（StoresDeep 改指）
 *   uN  → isIgnorableChatError                    (54302)  ZCODE_RUNTIME_MODEL_UNAVAILABLE 文案判定
 * ========================================================================== */
/* ── tombstone（A1-R13）：declare isIgnorableChatError（原 uN，54302）删除 → 本段逐字转录。 ── */
/* ── tombstone（A1-R13）：declare formatChatError（原 lN，54280）删除 → 本段逐字转录
 *    （Cw 54293 消费面经 StoresDeep normalizeCaptchaCode stub 承接，行为与 bundle 归约一致）。 ── */

/** 原 mWe（54260）：历史任务模型不可用文案（中英） */
const LEGACY_TASK_MODEL_UNAVAILABLE_MESSAGES = [
  `历史任务使用的模型已不可用`,
  `The model used by this historical task is no longer available`,
];

/** 原 hWe（54264）：错误码直拼 i18n key 回退集 */
const CHAT_ERROR_I18N_FALLBACK_CODES = new Set([
  `TASK_OWNED_BY_OTHER_HOST`,
  `STALE_TASK_OWNER_COMMAND`,
  `NO_ACTIVE_TASK_OWNER`,
  `OWNER_COMMAND_FAILED`,
  `ZCODE_RUNTIME_MODEL_UNAVAILABLE`,
  `ZCODE_BIGMODEL_TEAM_PLAN_MEMBER_REQUIRED`,
]);

/** 原 gWe（54272）：模型配置缺失码集 */
const MODEL_CONFIG_MISSING_CODES = new Set([`model_config_missing`, `MODEL_CONFIG_MISSING`, `ModelConfigMissing`]);

/** 原 cN（54273）：模型配置缺失判定 */
function isModelConfigMissingError(e: ChatError): boolean {
  return !!(e.code && MODEL_CONFIG_MISSING_CODES.has(e.code));
}

/** 原 _We（54276）：Claude Code 未知命令文案解析 */
function parseClaudeUnknownCommand(e: string): { command: string; args?: string } | null {
  let t = e.match(/Claude Code 未知命令\s+(\S+?)(?:（参数：([^）]+)）)?。/u);
  return t?.[1] ? { command: t[1], ...(t[2]?.trim() ? { args: t[2].trim() } : {}) } : null;
}

/** 原 lN（54280）：聊天错误消息格式化（配置缺失 → 未知命令 → 业务码 i18n → 空响应 → 回退码 → 原文） */
function formatChatError(e: ChatError, t: IntlShape): string {
  if (isModelConfigMissingError(e)) return t.formatMessage({ id: `chat.error.noAvailableModel` });
  if (e.code === `CLAUDE_UNKNOWN_COMMAND`) {
    let n = parseClaudeUnknownCommand(e.message);
    return n
      ? n.args
        ? t.formatMessage(
            { id: `zcode.error.CLAUDE_UNKNOWN_COMMAND_WITH_ARGS` },
            { command: n.command, args: n.args },
          )
        : t.formatMessage({ id: `zcode.error.CLAUDE_UNKNOWN_COMMAND` }, { command: n.command })
      : e.message;
  }
  let n = providerBusinessI18nId(normalizeCaptchaCode(e.code, e.message) ?? e.code);
  return n
    ? t.formatMessage({ id: n })
    : isEmptyModelResponse(e.message)
      ? t.formatMessage({ id: `zcode.error.modelSuspiciousEmpty` })
      : e.code && CHAT_ERROR_I18N_FALLBACK_CODES.has(e.code)
        ? t.formatMessage({ id: `zcode.error.${e.code}` })
        : e.message;
}

/** 原 uN（54302）：可忽略聊天错误判定（历史任务模型不可用文案） */
function isIgnorableChatError(e: ChatError): boolean {
  return !!(e.code === `ZCODE_RUNTIME_MODEL_UNAVAILABLE` && LEGACY_TASK_MODEL_UNAVAILABLE_MESSAGES.some((t) => e.message.includes(t)));
}

/** 遥测（原 wT js 42717 / oFe js 41744） */
interface ComposerTelemetry {
  recordComposerTextChange(text: string): void;
  recordComposerFocus(): void;
  reportVisibleChatError(payload: { errorKey: string; displayMessage: string; error: ChatError }): void;
}
declare function useComposerTelemetry(scope: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
}): ComposerTelemetry | null;
declare function buildComposerTelemetryExtraDetail(args: {
  askMode?: string | null;
  modelName?: string | null;
  configProvider?: string | null;
  agentProvider?: string | null;
  providerBaseURL?: string;
  planIdentitySnapshot?: unknown;
}): Record<string, unknown>;

/** 供应商端点快照（原 hM/fM，js 52647/52633：useSyncExternalStore 订阅） */
interface ProviderEndpointEntry { id: string; endpoints: { baseURL?: string } }
declare function subscribeProviderEndpoints(listener: () => void): () => void;
declare function getProviderEndpointsSnapshot(): ProviderEndpointEntry[];

/** 上下文头/草稿配置/快照 */
export interface ComposerSnapshot {
  config?: ComposerConfig | null;
  usage?: unknown;
  control: { canStop: boolean; phase?: string | null };
  queue: { items: Array<{ queueItemId: string }> };
  rows: { totalCount: number; window: unknown[] };
  backgroundWorks?: unknown[];
  inputRouting?: { mode: "startNow" | "enqueue" | "reject" };
  [key: string]: unknown;
}
export interface ComposerConfig {
  mode?: string | null;
  model?: string | null;
  provider?: string | null;
  thought?: string | null; // A1-R18 型缝：§U Urt/Grt 投影面（bundle Vrt 89246 返回面含 thought/thoughtLevels/followupMode）
  thoughtLevels?: string[];
  followupMode?: string;
  [key: string]: unknown;
}
export type ComposerConfigPicker = "model" | "thought" | "mode" | null;

/** 附件卡原语（原 vN/yN/bN/xN/SN，js 54555–54730；F08 附件族，接口保留） */
declare function AttachmentList(props: { variant: "grid" | "inline"; className?: string; children: React.ReactNode }): React.ReactElement;
declare function AttachmentCard(props: {
  "data-testid"?: string;
  "data-upload-status"?: string;
  data: { id: string; type: string; filename: string; description?: string; displayName?: string; sourceKind?: string; mediaType: string; url: string };
  onRemove: () => void;
  onOpen?: () => void;
  openLabel?: string;
  children: React.ReactNode;
}): React.ReactElement;
declare function AttachmentCardName(props: { className?: string }): React.ReactElement;
declare function AttachmentCardIcon(props: { className?: string; fallbackIcon?: React.ReactNode; children?: React.ReactNode }): React.ReactElement;
declare function AttachmentCardRemoveButton(props: { label: string }): React.ReactElement;
/** 附件预览对话框（原 DN，js 54798） */
declare function AttachmentPreviewDialog(props: {
  attachment: { filename: string; mediaType: string; url: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): React.ReactElement;
/* ── tombstone（A1-R22）：declare CodeCommentChipRow/WebContextChipRow/ConversationSelectionChipRow
 *    （原 TH/lit/uit，js 68298/89989/90087；旧注 68250/89941/90039/68246 皆漂移行）删除 → 文件头
 *    CodeCommentsChip/WebElementsChip/SelectionsChip 真实 import（逐字 canonical，modules/Composer.tsx
 *    [B14]/[B17]）；消费面 bundle 90781/90782/90789 渲染形 props 逐字同构（{comments, onRemove,
 *    onRemoveAll} / {contexts, onRemove, onRemoveAll} / {references, onRemove, onRemoveAll}，
 *    contentAlign 缺省 start）。本地占位型 ConversationSelectionItem 随删（仅 declare 消费）。 ── */
/* ── tombstone（A1-R21）：declare PptxReferenceChipRow（原 JH，69036）删除 → 文件头
 *    PptxReferencesChip import（canonical 属主 components/composer/PptxReferencesChip；
 *    props 面 {references/onOpen?/onRemove?/onRemoveAll?} 与 bundle 90783 渲染形逐字同构）。 ── */
/* --- A1-R15：聊天错误横幅族（js 54305–54540，逐字转录；lN/cN/uN 簇 R13 已就位） ---
 * 映射表（minified → 语义名 → bundle 行）：
 *   vWe → ChatErrorBanner               (54305)  消费面 = 本文件 hit 作曲区（本树 3630 = bundle 91075）
 *   yWe → buildChatErrorCopyText        (54505)  复制全文模板（vWe 独家消费 54347）
 *   bWe → buildChatErrorBugDescription  (54520)  bug 反馈描述模板（vWe 独家消费 54330）
 * 行内消费：G=useIntlContext / l=usePlatformService（M）/ yC=useFeedbackStore / m=toast / Z=cn /
 *   X=Button / p=IconInfo（T）/ g=IconClose（b）/ Pv=IconRocket / Rv=IconSettings / W_=IconCopy /
 *   zb/Hb/Ub/Gb/Kb=Dialog/DialogContent/DialogHeader/DialogTitle/DialogDescription（A0-S3c 既有 import）/
 *   Ate=chatErrorBannerTestid（N_，SrcSharedB）。JSX 保持编译形态（$=react/jsx-runtime）。 ── */

/** 原 yWe（js 54505）— 逐字；复制全文模板 */
function buildChatErrorCopyText({ message: e, detail: t, traceId: n, formatMessage: r }: {
  message: string;
  detail?: string;
  traceId?: string;
  formatMessage: (id: string, values?: Record<string, unknown>) => string;
}): string {
  return [
    r(`feedback.submit.template.section.copyErrorHeading`),
    ``,
    r(`feedback.submit.template.section.errorSummary`),
    e,
    ``,
    n ? r(`feedback.submit.template.section.errorTraceId`, { traceId: n }) : null,
    t
      ? [``, r(`feedback.submit.template.section.errorDetail`), t].join(`
`)
      : null,
  ].filter((e) => e != null).join(`
`);
}

/** 原 bWe（js 54520）— 逐字；bug 反馈描述模板 */
function buildChatErrorBugDescription({ message: e, detail: t, traceId: n, formatMessage: r }: {
  message: string;
  detail?: string;
  traceId?: string;
  formatMessage: (id: string, values?: Record<string, unknown>) => string;
}): string {
  return [
    r(`feedback.submit.template.section.errorSummaryLine`, { message: e }),
    ``,
    n ? r(`feedback.submit.template.section.errorTraceId`, { traceId: n }) : null,
    t
      ? [``, r(`feedback.submit.template.section.errorDetail`), t].join(`
`)
      : null,
    ``,
    r(`feedback.submit.template.section.whatDoing`),
    r(`feedback.submit.template.section.supplement`),
    ``,
    r(`feedback.submit.template.section.expectedResult`),
    r(`feedback.submit.template.section.supplement`),
  ].filter((e) => e != null).join(`
`);
}

/* ── tombstone（A1-R15）：declare function ChatErrorBanner（原 vWe，js 54305）删除 →
 *    本位逐字实体化（编译形 JSX；7 参全量真身——declare 期 4 参为窄面，bundle 消费点 91075
 *    传 error/onDismiss/onOpenModelSettings/onOpenUpgrade，onRetry/retryLabel/retryDisabled 为
 *    可选面，本树消费点 3630 逐字不变）。 ── */
/** 原 vWe（js 54305）— 逐字；聊天错误横幅（配置缺失 → 升级/设置双动作；其余 → 详情展开/复制全文/反馈/重试/关闭） */
function ChatErrorBanner({
  error: e,
  onRetry: t,
  retryLabel: n,
  retryDisabled: r,
  onDismiss: i,
  onOpenModelSettings: a,
  onOpenUpgrade: o,
}: {
  error: ChatError;
  onRetry?: () => void;
  retryLabel?: string;
  retryDisabled?: boolean;
  onDismiss?: () => void;
  onOpenModelSettings?: () => void;
  onOpenUpgrade?: () => void;
}): React.ReactElement | null {
  let { intl: s } = useIntlContext(),
    c = usePlatformService(),
    u = useFeedbackStore((e) => e.openSubmit),
    [d, f] = (0, React.useState)(!1),
    h = `shrink-0`,
    _ = formatChatError(e, s),
    v = isModelConfigMissingError(e);
  if (isIgnorableChatError(e)) return null;
  let y = async () => {
      let t = await c.captureWindowScreenshot?.().catch(() => null);
      (u({
        title: _.slice(0, 80),
        type: `bug`,
        module: `模型调用报错`,
        severity: `P2-中`,
        includeLogs: !0,
        description: buildChatErrorBugDescription({
          message: _,
          detail: e.detail,
          traceId: e.traceId,
          formatMessage: (e, t) => s.formatMessage({ id: e }, t),
        }),
        screenshots: t ? [t] : [],
      }),
        toast(s.formatMessage({ id: `chat.error.feedbackOpened` })));
    },
    b = async () => {
      if (typeof navigator > `u` || !navigator.clipboard?.writeText) {
        toast(s.formatMessage({ id: `chat.error.copyFailed` }, { error: `clipboard-unavailable` }));
        return;
      }
      try {
        (await navigator.clipboard.writeText(
          buildChatErrorCopyText({
            message: _,
            detail: e.detail,
            traceId: e.traceId,
            formatMessage: (e, t) => s.formatMessage({ id: e }, t),
          }),
        ),
          toast(s.formatMessage({ id: `chat.error.copyFull.copied` })));
      } catch (e) {
        toast(
          s.formatMessage(
            { id: `chat.error.copyFailed` },
            { error: e instanceof Error ? e.message : String(e) },
          ),
        );
      }
    };
  return (0, $.jsx)(`div`, {
    className: `flex w-full justify-center`,
    children: (0, $.jsxs)(`div`, {
      "data-testid": chatErrorBannerTestid,
      "data-error-code": e.code,
      className: cn(
        `w-full flex flex-wrap items-center gap-2 rounded-xl bg-surface backdrop-blur-md border border-border px-3 py-2`,
      ),
      children: [
        (0, $.jsxs)(`div`, {
          className: `flex min-w-0 flex-1 items-center gap-2 text-ui-base text-foreground`,
          children: [
            (0, $.jsx)(IconInfo, { className: `size-4 shrink-0` }),
            (0, $.jsx)(`div`, { className: `min-w-0 truncate font-medium`, children: _ }),
          ],
        }),
        v
          ? (0, $.jsxs)($.Fragment, {
              children: [
                (0, $.jsxs)(Button, {
                  type: `button`,
                  variant: `default`,
                  size: `sm`,
                  onClick: o,
                  className: cn(
                    h,
                    `button-gradient gap-1.5 text-white hover:bg-transparent hover:opacity-90 dark:bg-[#484A58] dark:hover:bg-[#484A58]`,
                  ),
                  "aria-label": s.formatMessage({ id: `chat.quota.action.upgrade` }),
                  children: [
                    (0, $.jsx)(IconRocket, { className: `size-3.5` }),
                    s.formatMessage({ id: `chat.quota.action.upgrade` }),
                  ],
                }),
                (0, $.jsxs)(Button, {
                  type: `button`,
                  variant: `outline`,
                  size: `sm`,
                  onClick: a,
                  className: cn(h, `gap-1.5`),
                  "aria-label": s.formatMessage({ id: `chat.error.setModels` }),
                  children: [
                    (0, $.jsx)(IconSettings, { className: `size-3.5` }),
                    s.formatMessage({ id: `chat.error.setModels` }),
                  ],
                }),
              ],
            })
          : null,
        !v && e.detail
          ? (0, $.jsxs)($.Fragment, {
              children: [
                (0, $.jsx)(Button, {
                  type: `button`,
                  variant: `outline`,
                  size: `sm`,
                  className: h,
                  onClick: () => {
                    f(!0);
                  },
                  children: s.formatMessage({ id: `chat.error.expandDetails` }),
                }),
                (0, $.jsx)(Dialog, {
                  open: d,
                  onOpenChange: f,
                  children: (0, $.jsxs)(DialogContent, {
                    className: `max-w-2xl`,
                    children: [
                      (0, $.jsxs)(DialogHeader, {
                        children: [
                          (0, $.jsx)(DialogTitle, { className: `whitespace-pre-wrap`, children: _ }),
                          (0, $.jsx)(DialogDescription, {
                            children: s.formatMessage({ id: `chat.error.expandDetails` }),
                          }),
                        ],
                      }),
                      (0, $.jsx)(`pre`, {
                        className: `max-h-[60vh] overflow-auto rounded-xl border border-border bg-surface px-3 py-2 text-ui-base whitespace-pre-wrap text-foreground-subtle`,
                        children: e.detail,
                      }),
                    ],
                  }),
                }),
              ],
            })
          : null,
        v
          ? null
          : (0, $.jsxs)(Button, {
              type: `button`,
              variant: `outline`,
              size: `sm`,
              onClick: () => {
                b();
              },
              className: cn(h, `gap-1.5`),
              "aria-label": s.formatMessage({ id: `chat.error.copyFull` }),
              children: [
                (0, $.jsx)(IconCopy, { className: `size-3.5` }),
                s.formatMessage({ id: `chat.error.copyFull` }),
              ],
            }),
        v
          ? null
          : (0, $.jsx)(Button, {
              type: `button`,
              variant: `outline`,
              size: `sm`,
              onClick: () => {
                y();
              },
              className: cn(h),
              "aria-label": s.formatMessage({ id: `chat.error.feedback` }),
              title: e.traceId,
              children: s.formatMessage({ id: `chat.error.feedback` }),
            }),
        !v && t
          ? (0, $.jsx)(Button, {
              variant: `outline`,
              size: `sm`,
              onClick: t,
              disabled: r,
              children: n ?? s.formatMessage({ id: `chat.error.retry` }),
            })
          : null,
        i
          ? (0, $.jsx)(Button, {
              type: `button`,
              variant: `outline`,
              size: `icon-sm`,
              onClick: i,
              className: cn(`shrink-0`),
              title: s.formatMessage({ id: `chat.error.dismiss` }),
              "aria-label": s.formatMessage({ id: `chat.error.dismiss` }),
              children: (0, $.jsx)(IconClose, { className: `size-4` }),
            })
          : null,
      ],
    }),
  });
}
/* ============================================================================
 * §T 模式工具条簇（A1-R17 逐字转录；ComposerModeToolbar declare 实体化）
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名 → bundle 行（styles-CdEGpc2x.js）：
 *  快捷键匹配/标签（keyboardShortcuts-BGHopxr9.js，chunk 外 declare 三件）：
 *   ea→matchCtrlKeyOnly（导出 s=内部 m，chunk 62）| zre→matchCtrlShiftKeyOnly（导出 o=内部 h，chunk 65）
 *   Bre→formatCtrlShiftShortcut（导出 r=内部 l，chunk 47）
 *  末稿协作模式（$M 族，53562–53585）：
 *   YM→LAST_DRAFT_COLLABORATION_MODE_DEFAULT 53562 | XM→LAST_DRAFT_COLLABORATION_MODE_STORAGE_KEY 53563
 *   ZUe→LAST_DRAFT_COLLABORATION_MODE_IDS 53564 | ZM→safeGlobalLocalStorage 53565
 *   QM→parseCollaborationModeId 53572 | $M→readLastDraftCollaborationMode 53577
 *   QUe→writeDraftMode（53585；〔A1-P1-B15〕重查更正：R17 负证据过期——真身已实体化于
 *     ConversationDraftConfig 66（B8），消费位 = tWe@53606 handleDraftSwitchMode 束 53780（同叶 258）；
 *     本簇（§T 模式工具条）确无消费；§T.1 与 ConversationDraftConfig 双实例收敛留批（R25 判例）
 *  ConfigSelect 封装族（46035–46175；vendored radix 原语按 A0-S3c 先例 → npm @radix-ui/react-select）：
 *   zRe→configSelectTriggerVariants 46035 | iO→ConfigSelectRoot 46057 | aO→ConfigSelectValue 46060
 *   oO→ConfigSelectTrigger 46063 | DDe(=HEe 31033)→ConfigSelectPortal | sO→ConfigSelectContent 46087
 *   cO→ConfigSelectItem 46120 | BRe→ConfigSelectScrollUpButton 46149 | VRe→ConfigSelectScrollDownButton 46160
 *  ConfigSelect 原语族（76848–77061）：
 *   M3e→isSelectValueInRange 76848 | N3e→FULL_ACCESS_MODE_VALUES 76851
 *   P3e→resolveConfigSelectTestId 76852 | F3e→resolveConfigSelectOptionTestId 76856
 *   I3e→ApiRetryStatusChip（76860；〔A1-P1-B15〕实体化本文件 §T.3 + export；消费位 112823（chat 加载槽域 kvt/Llt）留批）
 *   L3e→resolveModeOptionLabel 76880 | R3e→resolveModeLabelI18nId 76884 | z3e→resolveModeDescriptionI18nId 76887
 *   jq→resolveConfigOptionLabel 76890 | B3e→resolveConfigOptionDescription 76893
 *   V3e→isFullAccessModeValue 76898 | H3e→resolveModeIndicatorIcon 76901 | Mq→ConfigSelect 76912
 *  快捷键环（77348–77440）：
 *   Fq→shortcutKeyOfConfigCategory 77348 | Z3e→cycleSelectOptionValue 77360
 *   Q3e→resolveComposerToolbarShortcutAction 77367 | $3e→useComposerToolbarShortcuts 77393
 *  模式工具条（89303–89415）：
 *   Krt→getLastDraftCollaborationMode 89303 | Jrt→composerToolbarShortcutNoop 89341
 *   Yrt→COMPOSER_INPUT_FOCUS_SELECTOR 89342 | qrt→ComposerModeTrigger 89306
 *   Xrt→ComposerModeToolbarBody 89343 | Zrt→ComposerModeToolbar(memo) 89415
 *  跨域改指（属主导出，零新增转录）：
 *   cn()→listSessionModePresets（SrcSharedB，原 src chunk Ax 导出 J）| qr→testidOf（本文件局部 383）|
 *   XH→isCoarseTouchDevice / ZH→shouldRestoreFocus（Composer）|
 *   _q→AnimatedLabel / V4e→MODE_LABEL_I18N / H4e→MODE_DESCRIPTION_I18N
 *   （ModelSelector A0-S4-4b 属主导出）| Fr→offpeakFormTitleTestid / wn→chatAssistantHistoryContentTestid /
 *   Xt→automationYearDayOptionTestid / rn→browserForwardButtonTestid / un→v4ComposerInputTestid（SrcSharedB）
 *   Ta→cva（button）| zv/av/Sv/Bv/bbe/P_/M_/N_→lucide-react（文件头导入块）
 * ==========================================================================*/

/** 原 ea（keyboardShortcuts-BGHopxr9.js 导出 s=内部 m，chunk 62）：Ctrl-only 键匹配（chunk 外依赖，不转录） */
declare function matchCtrlKeyOnly(event: KeyboardEvent, key: string): boolean;
/** 原 zre（keyboardShortcuts-BGHopxr9.js 导出 o=内部 h，chunk 65）：Ctrl+Shift 键匹配（chunk 外依赖，不转录） */
declare function matchCtrlShiftKeyOnly(event: KeyboardEvent, key: string): boolean;
/** 原 Bre（keyboardShortcuts-BGHopxr9.js 导出 r=内部 l，chunk 47）：Ctrl/Cmd+Shift 快捷键标签（chunk 外依赖，不转录） */
declare function formatCtrlShiftShortcut(key: string): string;

/* --- §T.1 末稿协作模式（原 $M 族，js 53562–53585） --- */

var LAST_DRAFT_COLLABORATION_MODE_DEFAULT = `build`, // YM
  LAST_DRAFT_COLLABORATION_MODE_STORAGE_KEY = `zcode-last-draft-collaboration-mode`, // XM
  LAST_DRAFT_COLLABORATION_MODE_IDS = [`build`, `edit`, `plan`, `yolo`]; // ZUe
function safeGlobalLocalStorage() { // ZM
  try {
    return globalThis.localStorage === void 0 ? null : globalThis.localStorage;
  } catch {
    return null;
  }
}
function parseCollaborationModeId(e: unknown) { // QM
  if (typeof e != `string`) return null;
  let t = e.trim();
  return LAST_DRAFT_COLLABORATION_MODE_IDS.includes(t) ? t : null;
}
function readLastDraftCollaborationMode(e: Storage | null = safeGlobalLocalStorage()) { // $M
  if (!e) return LAST_DRAFT_COLLABORATION_MODE_DEFAULT;
  try {
    return parseCollaborationModeId(e.getItem(LAST_DRAFT_COLLABORATION_MODE_STORAGE_KEY)) ?? `build`;
  } catch {
    return LAST_DRAFT_COLLABORATION_MODE_DEFAULT;
  }
}
function getLastDraftCollaborationMode(e?: Storage | null) { // Krt
  return readLastDraftCollaborationMode(e);
}

/* --- §T.2 ConfigSelect 封装族（原 46035–46175；vendored radix → npm 替代，A0-S3c 先例） --- */

var configSelectTriggerVariants = cva( // zRe
  `flex w-fit items-center justify-between gap-1.5 border whitespace-nowrap transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-placeholder:text-foreground-subtlest *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        input: `border-input-border bg-input text-foreground hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0`,
        default: `border-transparent bg-primary text-primary-foreground hover:bg-primary/80`,
        outline: `border-border bg-transparent text-foreground hover:bg-input/50 hover:text-foreground aria-expanded:bg-selected aria-expanded:text-foreground`,
        secondary: `border-transparent bg-secondary text-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-foreground`,
        ghost: `border-transparent bg-transparent text-foreground hover:bg-hover hover:text-foreground aria-expanded:bg-hover aria-expanded:text-foreground`,
        destructive: `border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 aria-expanded:bg-destructive aria-expanded:text-destructive-foreground`,
      },
      size: {
        xs: `h-5 rounded-sm pl-2 pr-1 text-ui-base [&_svg:not([class*='size-'])]:size-2.5`,
        sm: `h-6 rounded-md pl-2 pr-1 text-ui-base/relaxed [&_svg:not([class*='size-'])]:size-3`,
        default: `h-7 rounded-md pl-2 pr-1 text-ui-base/relaxed [&_svg:not([class*='size-'])]:size-3.5`,
        lg: `h-8 rounded-lg pl-3 pr-2 text-ui-base [&_svg:not([class*='size-'])]:size-4`,
      },
    },
    defaultVariants: { variant: `input`, size: `default` },
  },
);

interface ConfigSelectOptionItem {
  value: string;
  name: string;
  description?: string;
}
interface ConfigSelectOption {
  id: string;
  name: string;
  category: string;
  type: string;
  currentValue?: string;
  options?: ConfigSelectOptionItem[];
}

function ConfigSelectRoot({ ...e }: React.ComponentProps<typeof RadixSelectRoot>) { // iO
  return (0, $.jsx)(RadixSelectRoot, { "data-slot": `select`, ...e });
}
function ConfigSelectValue({ ...e }: React.ComponentProps<typeof RadixSelectValue>) { // aO
  return (0, $.jsx)(RadixSelectValue, { "data-slot": `select-value`, ...e });
}
function ConfigSelectTrigger({
  className: e,
  variant: t = `input`,
  size: n = `default`,
  children: r,
  indicator: i,
  ...a
}: { variant?: string; size?: string; indicator?: React.ReactNode } & React.ComponentProps<typeof RadixSelectTrigger>) { // oO
  return (0, $.jsxs)(RadixSelectTrigger, {
    "data-slot": `select-trigger`,
    "data-variant": t,
    "data-size": n,
    className: cn(configSelectTriggerVariants({ variant: t, size: n }), e),
    ...a,
    children: [
      r,
      (0, $.jsx)(RadixSelectIcon, {
        asChild: !0,
        children:
          i ?? (0, $.jsx)(IconChevronDown, { className: `pointer-events-none size-3.5 text-foreground-subtle` }),
      }),
    ],
  });
}
function ConfigSelectPortal(e: { children?: React.ReactNode }) { // DDe=HEe 31033（asChild:!0 透传，npm radix Portal 面 A0-S3c 替代）
  return (0, $.jsx)(RadixSelectPortal, { ...{ asChild: !0 }, ...e });
}
function ConfigSelectContent({
  className: e,
  children: t,
  position: n = `item-aligned`,
  align: r = `center`,
  ...i
}: React.ComponentProps<typeof RadixSelectContent>) { // sO
  return (0, $.jsx)(ConfigSelectPortal, {
    children: (0, $.jsxs)(RadixSelectContent, {
      "data-slot": `select-content`,
      "data-align-trigger": n === `item-aligned`,
      className: cn(
        `relative z-[60] max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-popover-border bg-menu p-1 text-foreground shadow-md duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 [app-region:no-drag]`,
        e,
      ),
      position: n,
      align: r,
      ...i,
      children: [
        (0, $.jsx)(ConfigSelectScrollUpButton, {}),
        (0, $.jsx)(RadixSelectViewport, {
          "data-position": n,
          className: cn(
            `flex flex-col gap-0.5 data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)`,
            n === `popper` && ``,
          ),
          children: t,
        }),
        (0, $.jsx)(ConfigSelectScrollDownButton, {}),
      ],
    }),
  });
}
var ConfigSelectItem = React.forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode; trailing?: React.ReactNode } & Omit<React.ComponentProps<typeof RadixSelectItem>, "className" | "children">>(({ className: e, children: t, trailing: n, ...r }, i) => // cO
  (0, $.jsxs)(RadixSelectItem, {
    ref: i,
    "data-slot": `select-item`,
    className: cn(
      `relative flex min-h-7 w-full cursor-default items-center gap-2 rounded-lg px-2 py-1 text-ui-base/relaxed text-foreground outline-hidden select-none data-[highlighted]:bg-menu-hover data-[highlighted]:text-foreground data-disabled:pointer-events-none data-disabled:text-foreground-subtlest data-disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2`,
      e,
    ),
    ...r,
    children: [
      n
        ? (0, $.jsx)(`span`, {
            className: `pointer-events-auto absolute right-2 flex items-center justify-center`,
            children: n,
          })
        : null,
      (0, $.jsx)(`span`, {
        className: `pointer-events-none absolute right-2 flex items-center justify-center`,
        children: (0, $.jsx)(RadixSelectItemIndicator, {
          children: (0, $.jsx)(IconCheck, {
            className: `pointer-events-none size-4 text-foreground-subtle`,
          }),
        }),
      }),
      (0, $.jsx)(RadixSelectItemText, { children: t }),
    ],
  }),
);
ConfigSelectItem.displayName = `SelectItem`;
function ConfigSelectScrollUpButton({ className: e, ...t }: React.ComponentProps<typeof RadixSelectScrollUpButton>) { // BRe
  return (0, $.jsx)(RadixSelectScrollUpButton, {
    "data-slot": `select-scroll-up-button`,
    className: cn(
      `z-10 flex cursor-default items-center justify-center bg-menu py-1 text-foreground-subtle [&_svg:not([class*='size-'])]:size-3.5`,
      e,
    ),
    ...t,
    children: (0, $.jsx)(IconChevronUp, {}),
  });
}
function ConfigSelectScrollDownButton({ className: e, ...t }: React.ComponentProps<typeof RadixSelectScrollDownButton>) { // VRe
  return (0, $.jsx)(RadixSelectScrollDownButton, {
    "data-slot": `select-scroll-down-button`,
    className: cn(
      `z-10 flex cursor-default items-center justify-center bg-menu py-1 text-foreground-subtle [&_svg:not([class*='size-'])]:size-3.5`,
      e,
    ),
    ...t,
    children: (0, $.jsx)(IconChevronDown, {}),
  });
}

/* --- §T.3 ConfigSelect 原语族（原 76848–77061） --- */

function isSelectValueInRange(e: ConfigSelectOption, t: string) { // M3e
  return e.options?.some((e) => String(e.value) === t) ?? !1;
}
var FULL_ACCESS_MODE_VALUES = new Set([`bypassPermissions`, `full-access`, `agent-full-access`, `yolo`]); // N3e
function resolveConfigSelectTestId(e: ConfigSelectOption) { // P3e
  if (e.category === `thought_level`) return offpeakFormTitleTestid;
  if (e.category === `mode`) return chatAssistantHistoryContentTestid;
}
function resolveConfigSelectOptionTestId(e: ConfigSelectOption, t: ConfigSelectOptionItem) { // F3e
  if (e.category === `thought_level`) return testidOf(automationYearDayOptionTestid, t.value);
  if (e.category === `mode`) return testidOf(browserForwardButtonTestid, t.value);
}
/** 原 I3e（76860）：apiRetry 状态件——attempt/maxRetries i18n 数字格式化 + 渐变文本 chip；〔A1-P1-B15〕转录。
 *  消费位 112823（chat 加载槽域，kvt/Llt 未实体化）留批；modules/Conversation ApiRetryView declare 同批收敛。
 *  参数缝 `: any`〔A1-P1-B15〕（见 /tmp/a1r0-p1/p15/seams-HomeI3e.json）；局部变量保留混淆名。 */
export function ApiRetryStatusChip({ apiRetry: e, intl: t, locale: n }: any) {
  let r = (0, React.useMemo)(() => {
    if (!e) return null;
    let r = new Intl.NumberFormat(n);
    return t.formatMessage(
      { id: `chat.apiRetryStatus` },
      { attempt: r.format(e.attempt), maxRetries: r.format(e.maxRetries) },
    );
  }, [e, t, n]);
  return !e || !r
    ? null
    : (0, $.jsx)(`span`, {
        className: `inline-flex h-7 items-center whitespace-nowrap px-1 text-ui-base`,
        title: e.errorStatus == null ? r : `${r} · HTTP ${e.errorStatus}`,
        children: (0, $.jsx)(`span`, {
          className: `animated-gradient-text animated-gradient-text-subtle font-medium`,
          children: r,
        }),
      });
}
function resolveModeOptionLabel(e: IntlShape, t: string | null | undefined, n: ConfigSelectOptionItem) { // L3e
  let r = resolveModeLabelI18nId(t, n);
  return r ? e.formatMessage({ id: r }) : n.name;
}
function resolveModeLabelI18nId(e: string | null | undefined, t: ConfigSelectOptionItem) { // R3e
  return e ? (MODE_LABEL_I18N[e]?.[t.value] ?? null) : null;
}
function resolveModeDescriptionI18nId(e: string | null | undefined, t: ConfigSelectOptionItem) { // z3e
  return e ? (MODE_DESCRIPTION_I18N[e]?.[t.value] ?? null) : null;
}
function resolveConfigOptionLabel(e: IntlShape, t: string | null | undefined, n: ConfigSelectOption, r: ConfigSelectOptionItem) { // jq
  return n.category === `mode` ? resolveModeOptionLabel(e, t, r) : r.name;
}
function resolveConfigOptionDescription(e: IntlShape, t: string | null | undefined, n: ConfigSelectOption, r: ConfigSelectOptionItem) { // B3e
  if (n.category !== `mode`) return r.description;
  let i = resolveModeDescriptionI18nId(t, r);
  return i ? e.formatMessage({ id: i }) : r.description;
}
function isFullAccessModeValue(e: unknown) { // V3e
  return typeof e == `string` && FULL_ACCESS_MODE_VALUES.has(e);
}
function resolveModeIndicatorIcon(e: unknown) { // H3e
  return isFullAccessModeValue(e)
    ? IconShieldAlert
    : typeof e == `string` && /^(default|build)$/i.test(e)
      ? IconHand
      : typeof e == `string` && e.toLocaleLowerCase() === `plan`
        ? IconNotepadText
        : typeof e == `string` && /^(auto|acceptEdits|agent|autoEdit|dontAsk|edit)$/i.test(e)
          ? IconShieldCheck
          : IconHand;
}
function ConfigSelect({
  option: e,
  onValueChange: t,
  open: n,
  onOpenChange: r,
  disabled: i,
  tooltipTitle: a,
  shortcutLabel: o,
  triggerRef: s,
  triggerClassName: c,
  indicatorClassName: l,
  triggerVariant: u = `ghost`,
  triggerSize: d = `lg`,
  leadingIcon: f,
  labelVisibilityClassName: p = `hidden @xl/composer:inline-flex`,
  provider: m,
  restoreFocusSelector: h = `[data-testid="chat-input"]`,
}: {
  option: ConfigSelectOption;
  onValueChange: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  tooltipTitle?: string;
  shortcutLabel?: string;
  triggerRef?: React.Ref<HTMLSpanElement>;
  triggerClassName?: string;
  indicatorClassName?: string;
  triggerVariant?: string;
  triggerSize?: string;
  leadingIcon?: React.ComponentType<{ className?: string }>;
  labelVisibilityClassName?: string;
  provider?: string | null;
  restoreFocusSelector?: string;
}) { // Mq
  let { intl: g } = useIntlContext(),
    _ = (0, React.useCallback)((e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== `Tab`) return;
      let t =
        e.currentTarget.querySelector(`[data-slot="select-item"][data-highlighted]`) ??
        e.currentTarget.querySelector(`[data-slot="select-item"][data-state="checked"]`) ??
        e.currentTarget.querySelector(`[data-slot="select-item"]`);
      t && (e.preventDefault(), (t as HTMLElement).click());
    }, []);
  if (e.type !== `select` || !e.options?.length) return null;
  let v = e.category === `mode` || e.category === `thought_level`,
    y = e.category === `mode` && isFullAccessModeValue(e.currentValue),
    b = e.category === `mode` ? resolveModeIndicatorIcon(e.currentValue) : f,
    x = cn(c, y && `text-warning hover:text-warning aria-expanded:text-warning`),
    S = cn(`pointer-events-none size-4 text-current`, y && `text-warning`),
    C: {
      position: `popper`;
      side: `top`;
      align: `start`;
      sideOffset: number;
      collisionPadding: number;
      className: string | undefined;
    } | undefined = v
      ? {
          position: `popper`,
          side: `top`,
          align: `start`,
          sideOffset: 4,
          collisionPadding: 8,
          className: e.category === `mode` ? `w-64` : void 0,
        }
      : void 0,
    w = resolveConfigSelectTestId(e),
    T = e.options.find((t) => t.value === e.currentValue),
    E = T ? resolveConfigOptionLabel(g, m, e, T) : String(e.currentValue ?? ``),
    D = e.category === `thought_level` ? `first-letter:uppercase` : void 0;
  return (0, $.jsxs)(ConfigSelectRoot, {
    open: n,
    onOpenChange: r,
    value: String(e.currentValue),
    onValueChange: (n: string) => {
      if (!isSelectValueInRange(e, n)) {
        logger.warn(`[ConfigSelect] 忽略值域外的选择回调`, { category: e.category, value: n });
        return;
      }
      t(n);
    },
    disabled: i,
    children: [
      (0, $.jsx)(Tooltip, {
        title: a,
        shortcut: o,
        triggerRef: s,
        children: (0, $.jsxs)(ConfigSelectTrigger, {
          variant: u,
          size: d,
          className: x,
          indicator: (0, $.jsx)(IconChevronDown, {
            className: cn(`pointer-events-none size-3.5 text-foreground-subtle`, l),
          }),
          "aria-label": a,
          "data-testid": w,
          children: [
            b ? (0, $.jsx)(b, { className: S }) : null,
            (0, $.jsx)(`span`, {
              className: p,
              children:
                e.category === `mode`
                  ? (0, $.jsx)(AnimatedLabel, { label: E })
                  : (0, $.jsx)(ConfigSelectValue, { children: (0, $.jsx)(`span`, { className: D, children: E }) }),
            }),
          ],
        }),
      }),
      (0, $.jsx)(ConfigSelectContent, {
        ...C,
        onKeyDown: _,
        onCloseAutoFocus: (t: Event) => {
          if (!h || (t.preventDefault(), !shouldRestoreFocus({ isCoarseTouchDevice: isCoarseTouchDevice() }))) return;
          let n = document.querySelector(h);
          (logger.debug(`[ConfigSelect] picker focus handoff`, {
            category: e.category,
            restoreFocusSelector: h,
            targetFound: !!n,
          }),
            (n as HTMLElement | null)?.focus());
        },
        children:
          e.category === `mode`
            ? e.options.map((t) => {
                let n = resolveModeIndicatorIcon(t.value),
                  r = resolveConfigOptionLabel(g, m, e, t),
                  i = resolveConfigOptionDescription(g, m, e, t);
                return (0, $.jsx)(
                  ConfigSelectItem,
                  {
                    value: t.value,
                    className: `min-h-13 items-start gap-3 py-2 pl-2 pr-8`,
                    "data-testid": resolveConfigSelectOptionTestId(e, t),
                    children: (0, $.jsxs)(`span`, {
                      className: `flex min-w-0 items-start gap-3`,
                      children: [
                        (0, $.jsx)(n, { className: `mt-0.5 size-4.5 shrink-0 text-foreground` }),
                        (0, $.jsxs)(`span`, {
                          className: `flex min-w-0 flex-col gap-0.5`,
                          children: [
                            (0, $.jsx)(`span`, {
                              className: `truncate text-ui-base/relaxed text-foreground`,
                              children: r,
                            }),
                            i?.trim()
                              ? (0, $.jsx)(`span`, {
                                  className: `line-clamp-2 text-ui-sm/relaxed text-foreground-subtle whitespace-nowrap`,
                                  children: i,
                                })
                              : null,
                          ],
                        }),
                      ],
                    }),
                  },
                  t.value,
                );
              })
            : e.options.map((t) =>
                (0, $.jsx)(
                  ConfigSelectItem,
                  {
                    value: t.value,
                    "data-testid": resolveConfigSelectOptionTestId(e, t),
                    children: (0, $.jsx)(`span`, { className: D, children: resolveConfigOptionLabel(g, m, e, t) }),
                  },
                  t.value,
                ),
              ),
      }),
    ],
  });
}

/* --- §T.4 快捷键环（原 77348–77440） --- */

function shortcutKeyOfConfigCategory(e: string | undefined) { // Fq
  switch (e) {
    case `model`:
      return `m`;
    case `mode`:
      return `ctrlShiftM`;
    case `thought_level`:
      return `t`;
    default:
      return null;
  }
}
function cycleSelectOptionValue(e: ConfigSelectOption) { // Z3e
  if (e.type !== `select` || !e.options?.length) return null;
  let t = String(e.currentValue),
    n = e.options.findIndex((e) => e.value === t),
    r = n === -1 ? 0 : (n + 1) % e.options.length;
  return e.options[r]?.value ?? null;
}
function resolveComposerToolbarShortcutAction(
  e: KeyboardEvent,
  {
    hasAnyOption: t,
    toolbarDisabled: n,
    modelMenuDisabled: r,
    modelOption: i,
    modeOption: a,
    thoughtOption: o,
  }: {
    hasAnyOption: boolean;
    toolbarDisabled: boolean;
    modelMenuDisabled: boolean;
    modelOption?: ConfigSelectOption | null;
    modeOption?: ConfigSelectOption | null;
    thoughtOption?: ConfigSelectOption | null;
  },
) { // Q3e
  if (!t || n || e.defaultPrevented || e.repeat || e.isComposing) return null;
  if (matchCtrlKeyOnly(e, `m`)) {
    let e = shortcutKeyOfConfigCategory(i?.category);
    return !i || e !== `m` || r ? null : `openModelMenu`;
  }
  if (matchCtrlShiftKeyOnly(e, `m`)) {
    let e = shortcutKeyOfConfigCategory(a?.category);
    return !a || e !== `ctrlShiftM` ? null : `cycleSessionMode`;
  }
  if (matchCtrlKeyOnly(e, `t`)) {
    let e = shortcutKeyOfConfigCategory(o?.category);
    return !o || e !== `t` ? null : `cycleThoughtLevel`;
  }
  return null;
}
function useComposerToolbarShortcuts(e: {
  hasAnyOption: boolean;
  toolbarDisabled: boolean;
  modelMenuDisabled: boolean;
  modelOption?: ConfigSelectOption | null;
  modeOption?: ConfigSelectOption | null;
  thoughtOption?: ConfigSelectOption | null;
  onOpenModelMenu: () => void;
  onCycleSessionMode: () => void;
  onCycleThoughtLevel: () => void;
}) { // $3e
  let {
    hasAnyOption: t,
    toolbarDisabled: n,
    modelMenuDisabled: r,
    modelOption: i,
    modeOption: a,
    thoughtOption: o,
    onOpenModelMenu: s,
    onCycleSessionMode: c,
    onCycleThoughtLevel: l,
  } = e;
  (0, React.useEffect)(() => {
    if (!t) return;
    function e(e: KeyboardEvent) {
      let u = resolveComposerToolbarShortcutAction(e, {
        hasAnyOption: t,
        toolbarDisabled: n,
        modelMenuDisabled: r,
        modelOption: i,
        modeOption: a,
        thoughtOption: o,
      });
      if (!u) {
        matchCtrlKeyOnly(e, `m`) &&
          logger.debug(`[V4ComposerToolbar] Ctrl+M 未打开模型菜单`, {
            hasModelOption: !!i,
            shortcutKey: shortcutKeyOfConfigCategory(i?.category),
            modelMenuDisabled: r,
          });
        return;
      }
      if ((e.preventDefault(), u === `openModelMenu`)) {
        (logger.debug(`[V4ComposerToolbar] Ctrl+M 打开模型菜单`), s());
        return;
      }
      if (u === `cycleSessionMode`) {
        c();
        return;
      }
      u === `cycleThoughtLevel` && l();
    }
    return (
      window.addEventListener(`keydown`, e, !0),
      () => {
        window.removeEventListener(`keydown`, e, !0);
      }
    );
  }, [t, n, r, a, i, s, c, l, o]);
}

/* --- §T.5 模式工具条（原 89303–89415） --- */

function composerToolbarShortcutNoop() {} // Jrt
var COMPOSER_INPUT_FOCUS_SELECTOR = `[data-testid="${v4ComposerInputTestid}"]`; // Yrt（原 un=v4-composer-input，src-HCld2afU Ji）
function ComposerModeTrigger({
  compactIconOnly: e = !1,
  disabled: t,
  disabledReason: n,
  intl: r,
  labelVisibilityClassName: i,
  modeOption: a,
  modeShortcutLabel: o,
  modeTriggerRef: s,
  onConfigValueChange: c,
  open: l,
  onOpenChange: u,
  restoreFocusSelector: d,
  selectedProvider: f,
}: {
  compactIconOnly?: boolean;
  disabled?: boolean;
  disabledReason?: string | null;
  intl: IntlShape;
  labelVisibilityClassName?: string;
  modeOption: ConfigSelectOption;
  modeShortcutLabel: string;
  modeTriggerRef: React.Ref<HTMLSpanElement>;
  onConfigValueChange: (option: ConfigSelectOption, value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  restoreFocusSelector?: string;
  selectedProvider: string;
}) { // qrt
  return (0, $.jsx)(ConfigSelect, {
    option: a,
    onValueChange: (e: string) => c(a, e),
    open: l,
    onOpenChange: u,
    disabled: t,
    tooltipTitle: n ?? r.formatMessage({ id: `chat.toolbar.mode.label` }),
    shortcutLabel: o,
    triggerRef: s,
    triggerSize: `default`,
    triggerClassName: e
      ? `size-7 justify-center gap-0 rounded-lg p-0 text-ui-base @xl/composer:h-7 @xl/composer:w-fit @xl/composer:justify-between @xl/composer:gap-1 @xl/composer:pl-2 @xl/composer:pr-1.5`
      : `gap-1 rounded-lg pl-2 pr-1.5 text-ui-base`,
    indicatorClassName: e ? `hidden @xl/composer:block` : void 0,
    leadingIcon: IconSlidersHorizontal,
    labelVisibilityClassName: i,
    provider: f,
    restoreFocusSelector: d,
  });
}
function ComposerModeToolbarBody({
  provider: e,
  config: t,
  draftMode: n = !1,
  draftConfig: r,
  disabled: i,
  activeConfigPicker: a,
  onConfigPickerOpenChange: o,
  onSwitchMode: s,
}: {
  workspacePath: string; // 调用面 91037 透传，Xrt 体不读
  workspaceIdentity?: string | null; // 调用面 91038 透传，Xrt 体不读
  provider?: string | null;
  config: ComposerConfig | null;
  draftMode?: boolean;
  draftConfig?: ComposerConfig | null;
  disabled: boolean;
  activeConfigPicker: ComposerConfigPicker;
  onConfigPickerOpenChange: (picker: ComposerConfigPicker, open: boolean) => void;
  onSwitchMode: (mode: string) => void;
}) { // Xrt
  let { intl: c } = useIntlContext(),
    l = e ?? `glm`,
    u = (0, React.useRef)(null),
    d = (0, React.useMemo)(() => formatCtrlShiftShortcut(`M`), []),
    f = (0, React.useMemo)(
      () =>
        !t && !n
          ? null
          : {
              id: `mode`,
              name: `Mode`,
              category: `mode`,
              type: `select`,
              currentValue: n ? (r?.mode ?? getLastDraftCollaborationMode()) : t?.mode || `build`,
              options: listSessionModePresets().map((e) => ({ value: e.id, name: e.name, description: e.description })),
            },
      [t, r?.mode, n],
    ),
    p = (0, React.useCallback)(
      (e: ConfigSelectOption, t: string) => {
        s(t);
      },
      [s],
    ),
    m = (0, React.useCallback)(
      (e: boolean) => {
        o(`mode`, e);
      },
      [o],
    ),
    h = (0, React.useCallback)(() => {
      if (!f || f.type !== `select`) return;
      let e = cycleSelectOptionValue(f);
      e != null && s(e);
    }, [f, s]);
  return (
    useComposerToolbarShortcuts({
      hasAnyOption: !!f,
      toolbarDisabled: i,
      modelMenuDisabled: !0,
      modeOption: f ?? void 0,
      onCycleSessionMode: h,
      onOpenModelMenu: composerToolbarShortcutNoop,
      onCycleThoughtLevel: composerToolbarShortcutNoop,
    }),
    f
      ? (0, $.jsx)(ComposerModeTrigger, {
          compactIconOnly: !0,
          disabled: i,
          intl: c,
          modeOption: f,
          modeShortcutLabel: d,
          modeTriggerRef: u,
          onConfigValueChange: p,
          open: a === `mode`,
          onOpenChange: m,
          restoreFocusSelector: COMPOSER_INPUT_FOCUS_SELECTOR,
          selectedProvider: l,
        })
      : null
  );
}
var ComposerModeToolbar = (0, React.memo)(ComposerModeToolbarBody), // Zrt 89415
  COMPOSER_MODE_TRIGGER_FOCUS_SELECTOR = `[data-testid="${v4ComposerInputTestid}"]`; // Qrt 89416（与 Zrt 同 var 句；原 un=v4-composer-input，src-HCld2afU Ji；同 Yrt 89342 形；§U.10 iit focusSelectorOnClose / §U.2 Pq restoreFocusSelector 消费）

/* ── tombstone（A1-R17）：declare function ComposerModeToolbar（原 Zrt，js 89415 = memo(Xrt 89343)；
 *    旧注 js 89295 为行漂移）删除——本文件 §T 模式工具条簇逐字实体化；消费面 91036 逐字不变。 ── */

/* ============================================================================
 * §U 配置工具条簇（原 ait/iit 89503–89978 + 助手域；A1-R18 逐字转录）
 *  映射表（minified → 语义 → bundle 行）：
 *   U3e→THOUGHT_LEVEL_OFF_VALUES 77062 | W3e→THOUGHT_LEVEL_RANK_BY_VALUE 77063 | G3e→THOUGHT_LEVEL_VALUE_I18N_IDS 77095
 *   Nq→normalizeThoughtLevelToken 77127 | K3e→isThoughtLevelOptionDisabled 77130 | q3e→rankThoughtLevelOption 77133
 *   J3e→sortThoughtLevelOptions 77141 | Y3e→cycleThoughtLevelSelectValue 77155 | X3e→resolveThoughtLevelOptionLabel 77162
 *   Pq→ComposerThoughtToolbar 77166
 *   c3e→quotaLimitTotal 76439 | l3e→quotaLimitRemaining 76442 | h3e→listActiveQuotaLimits 76495 | g3e→hasStartPlanBalanceDisplay 76502
 *   Eq→entitlementEntrySourceId 76197 | Dq→hasUsableEntitlementSnapshot 76200 | n3e→codingPlanProviderFallbackLabel 76194
 *   Oq→resolveCodingPlanUsageRemaining 76207 | i3e→hasCodingPlanUsageRemaining 76249
 *   Prt→SIDEBAR_USAGE_CODING_PLAN_PROVIDER_KEY 89186 | Frt→CODING_PLAN_PREFERENCE_PROVIDER_IDS 89187 | hX→listConfiguredCodingPlanProviders 89188
 *   Irt→getSidebarUsagePreferenceStorage 89195 | Lrt→writeSidebarUsageCodingPlanProviderPreference 89208 | Rrt→modelCatalogEntryMatchesModelId 89219
 *   zrt→buildThoughtLevelOptionFromCatalog 89222 | Wrt→buildThoughtLevelOptionForDraft 89291 | Brt→readConfigOptionCurrentValue 89242
 *   Vrt→projectDraftConfigFromOptions 89246 | Hrt→configMatchesProviderModel 89260 | Urt→resolveDraftEffectiveConfig 89263 | Grt→resolveEffectiveThoughtLevel 89292
 *   Mg→parseLooseModelValue 24406
 *   pX→listCodingPlanAudienceSources 89109 | jrt→teamSourcesFromSubscribedProducts 89120 | Nrt→teamSourceDisplayName 89182
 *   mX→codingPlanSourceIdsMatch 89171 | nit→teamSourceFromEntitlementSnapshot 89469 | rit→resolveSelectedTeamSource 89490
 *   Mrt→resolveUpgradeTargetSource 89154（A1-R26 逐字实体化，SidebarLeaves declare 收敛）
 *   eit→classifyCodingPlanProviderId 89418 | tit→resolveCodingPlanFamilySelection 89438
 *   Qrt→COMPOSER_MODE_TRIGGER_FOCUS_SELECTOR 89416（bundle 与 Zrt 89415 同 var 句，实体在 §T.5 ComposerModeToolbar 声明处） | $rt→composerSessionModeCycleNoop 89417
 *   c8e→isSessionPhaseRunning 78404 | l8e→entitlementAutoRefreshModeOfPhase 78407 | u8e→shouldForceRefreshOnPhaseChange 78410 | d8e→useEntitlementRefreshOnTaskTransition 78418
 *   JC→SETTINGS_SECTION_INTENT_KEY 39299 | YC→SETTINGS_USAGE_TAB_INTENT_KEY 39300 | XC→SETTINGS_MODEL_PROVIDER_INTENT_KEY 39301 | ZC→SETTINGS_SECTION_INTENT_EVENT 39302
 *   QC→SETTINGS_LAST_SECTION_KEY 39303 | VMe→AUTOMATION_SETTINGS_SECTION_VALUES 39304
 *   $C→isSettingsSectionId 39305 | ew→isSettingsSectionVisible 39324 | tw→resolveVisibleSettingsSection 39327 | nw→tryGetSettingsStorage 39330
 *   HMe→readLastSettingsSection 39343 | rw→persistLastSettingsSection 39359 | UMe→readInitialSettingsSection 39371 | iw→openSettingsSection 39375
 *   aw→openSettingsUsageSection 39378 | ow→requestSettingsSectionOpen 39381 | WMe→clearSettingsSectionIntents 39397 | GMe→consumeSectionIntent 39405
 *   KMe→consumeUsageTabIntent 39413 | sw→consumeModelProviderIntent 39425 | qMe→shouldResetUsageTabToApp 39434 | cw→subscribeSettingsSectionIntent 39442
 *   （A1-R24 设置导航域全域补齐：§U.7 逐字 canonical；modules/Settings §2 A0 副本收敛为再导出，见其墓碑）
 *   UUe→newCodingPlanFunnelId 53250 | qUe→fallbackCodingPlanFunnelId 53409 | GUe→normalizeCodingPlanFunnelFamily 53387 | KUe→codingPlanFunnelChannelOfFamily 53397
 *   UM→isStartPlanLevelLabel 53406 | PM→buildCodingPlanPurchaseFunnelContext 53253 | FM→buildCodingPlanFunnelContext 53267（A1-R25 逐字实体化） | IM→resolveEntryPlanStateFromSnapshot 53277
 *   LM→resolveEntryPlanState 53299 | WUe→trackCodingPlanFunnelStart 53313 | RM→trackCodingPlanProductSelect 53328 | zM→trackCodingPlanBillingCycleSelect 53349
 *   BM→codingPlanFunnelExtrasOf 53376 | VM→stringifyCodingPlanFunnelExtras 53400（A1-R26 逐字实体化，§U.8 漏斗族全绿；xw≡reportTelemetry StoresDeep@323）
 *   （HM 53403 = 双实例收敛 → SrcSharedA isStartPlanProviderId@2026（原 No，jsx 4848）：逐字同形 `e===q.zaiStartPlan||e===q.bigmodelStartPlan`；IM 消费点直用真身）
 *   T6e→isManageModelsActionVisible 77864 | E6e→isSyntheticModelValue 77867 | D6e→shortLabelOfModelValue 77870 | O6e→modelGroupsContainValue 77881 | k6e→normalizeModelSelectState 77884
 *   iit→ComposerConfigToolbarBody 89503 | ait→ComposerConfigToolbar 89978
 *  导入面接线：q=providerIds / qn=isGlmModelId / ui=GLM_REASONING_LEVELS / jt=isBuiltinProviderId / tr=isZaiPlanProviderId / HM=isStartPlanProviderId（SrcSharedA）；
 *   Uee=v4ModelConfigTestid / vi=buildCodingPlanScope / li=parseCodingPlanScope / fi=codingPlanScopesOverlap / gi=isProviderEnabled（SrcSharedB）；
 *   se=parseCustomModelId / we=formatCustomModelId / L=filterNativeModelOptions（SkillStore）；vq=ModelSelector（ModelSelector.tsx）；
 *   O_=IconBrain / N_=IconChevronDown（lucide）；_q=AnimatedLabel、Ia=Tooltip、iO/oO/sO/cO=ConfigSelect 族（§T）、ZH/XH=shouldRestoreFocus/isCoarseTouchDevice、
 *   un=v4ComposerInputTestid、Xt=automationYearDayOptionTestid、Fr=offpeakFormTitleTestid、qr=testidOf、jq=resolveConfigOptionLabel、$3e=useComposerToolbarShortcuts（本文件）。
 *  declare 分层（深依赖，不转录）：Jq/sX/pc/fX/TY/$j/N6e/Hq/nWe/Zi/j3e——见上方 declare 块。
 * ========================================================================== */

/* --- §U.1 思考级选择助手族（原 77062–77165） --- */

var THOUGHT_LEVEL_OFF_VALUES = new Set([`disabled`, `false`, `no`, `none`, `nothink`, `no-think`, `no_think`, `off`]), // U3e
  THOUGHT_LEVEL_RANK_BY_VALUE: Record<string, number> = { // W3e
    disabled: 0,
    false: 0,
    no: 0,
    none: 0,
    nothink: 0,
    "no-think": 0,
    no_think: 0,
    off: 0,
    low: 1,
    light: 1,
    minimal: 1,
    shallow: 1,
    balanced: 2,
    default: 2,
    medium: 2,
    normal: 2,
    standard: 2,
    deep: 3,
    high: 3,
    enable: 4,
    enabled: 4,
    on: 4,
    true: 4,
    "extra-high": 5,
    extra_high: 5,
    "very-high": 5,
    very_high: 5,
    xhigh: 5,
    max: 6,
    maximum: 6,
  },
  THOUGHT_LEVEL_VALUE_I18N_IDS: Record<string, string> = { // G3e
    disabled: `chat.toolbar.thoughtLevel.value.off`,
    false: `chat.toolbar.thoughtLevel.value.off`,
    no: `chat.toolbar.thoughtLevel.value.off`,
    none: `chat.toolbar.thoughtLevel.value.off`,
    nothink: `chat.toolbar.thoughtLevel.value.noThink`,
    "no-think": `chat.toolbar.thoughtLevel.value.noThink`,
    no_think: `chat.toolbar.thoughtLevel.value.noThink`,
    off: `chat.toolbar.thoughtLevel.value.off`,
    enable: `chat.toolbar.thoughtLevel.value.on`,
    enabled: `chat.toolbar.thoughtLevel.value.on`,
    on: `chat.toolbar.thoughtLevel.value.on`,
    true: `chat.toolbar.thoughtLevel.value.on`,
    low: `chat.toolbar.thoughtLevel.value.low`,
    light: `chat.toolbar.thoughtLevel.value.low`,
    minimal: `chat.toolbar.thoughtLevel.value.low`,
    shallow: `chat.toolbar.thoughtLevel.value.low`,
    balanced: `chat.toolbar.thoughtLevel.value.medium`,
    default: `chat.toolbar.thoughtLevel.value.medium`,
    medium: `chat.toolbar.thoughtLevel.value.medium`,
    normal: `chat.toolbar.thoughtLevel.value.medium`,
    standard: `chat.toolbar.thoughtLevel.value.medium`,
    deep: `chat.toolbar.thoughtLevel.value.high`,
    high: `chat.toolbar.thoughtLevel.value.high`,
    "extra-high": `chat.toolbar.thoughtLevel.value.xhigh`,
    extra_high: `chat.toolbar.thoughtLevel.value.xhigh`,
    "very-high": `chat.toolbar.thoughtLevel.value.xhigh`,
    very_high: `chat.toolbar.thoughtLevel.value.xhigh`,
    xhigh: `chat.toolbar.thoughtLevel.value.xhigh`,
    max: `chat.toolbar.thoughtLevel.value.max`,
    maximum: `chat.toolbar.thoughtLevel.value.max`,
  };
function normalizeThoughtLevelToken(e: string) { // Nq
  return e.trim().toLowerCase();
}
function isThoughtLevelOptionDisabled(e: ConfigSelectOptionItem) { // K3e
  return THOUGHT_LEVEL_OFF_VALUES.has(normalizeThoughtLevelToken(e.value)) || THOUGHT_LEVEL_OFF_VALUES.has(normalizeThoughtLevelToken(e.name));
}
function rankThoughtLevelOption(e: ConfigSelectOptionItem) { // q3e
  let t = [e.value, e.name];
  for (let e of t) {
    let t = THOUGHT_LEVEL_RANK_BY_VALUE[normalizeThoughtLevelToken(e)];
    if (t !== void 0) return t;
  }
  return null;
}
function sortThoughtLevelOptions(e: ConfigSelectOptionItem[]) { // J3e
  return e
    .map((e, t) => ({ entry: e, index: t, rank: rankThoughtLevelOption(e) }))
    .sort((e, t) =>
      e.rank !== null && t.rank !== null && e.rank !== t.rank
        ? e.rank - t.rank
        : e.rank !== null && t.rank === null
          ? -1
          : e.rank === null && t.rank !== null
            ? 1
            : e.index - t.index,
    )
    .map((e) => e.entry);
}
function cycleThoughtLevelSelectValue(e: ConfigSelectOption) { // Y3e
  if (e.type !== `select` || !e.options || e.options.length < 2) return null;
  let t = sortThoughtLevelOptions(e.options),
    n = String(e.currentValue),
    r = t.findIndex((e) => e.value === n);
  return t[r === -1 ? 0 : (r + 1) % t.length]?.value ?? null;
}
function resolveThoughtLevelOptionLabel(e: IntlShape, t: string | null | undefined, n: ConfigSelectOption, r: ConfigSelectOptionItem) { // X3e
  let i = THOUGHT_LEVEL_VALUE_I18N_IDS[normalizeThoughtLevelToken(r.value)];
  return i ? e.formatMessage({ id: i }) : resolveConfigOptionLabel(e, t, n, r);
}

/* --- §U.2 思考级工具条（原 Pq 77166–77347） --- */

function ComposerThoughtToolbar({
  disabled: e,
  disabledReason: t,
  interactionMode: n = `select`,
  indicatorClassName: r,
  intl: i,
  labelVisibilityClassName: a = `hidden @xl/composer:inline-flex`,
  option: o,
  provider: s,
  showInvalidCurrentValue: c = !1,
  restoreFocusSelector: l = `[data-testid="chat-input"]`,
  shortcutLabel: u,
  triggerClassName: d,
  triggerRef: f,
  open: p,
  onOpenChange: m,
  onValueChange: h,
}: {
  disabled?: boolean;
  disabledReason?: string | null;
  interactionMode?: string;
  indicatorClassName?: string;
  intl: IntlShape;
  labelVisibilityClassName?: string;
  option: ConfigSelectOption;
  provider?: string | null;
  showInvalidCurrentValue?: boolean;
  restoreFocusSelector?: string;
  shortcutLabel?: string;
  triggerClassName?: string;
  triggerRef?: React.Ref<HTMLSpanElement>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onValueChange: (value: string) => void;
}) { // Pq
  let g = React.useRef<HTMLSpanElement | null>(null),
    [_, v] = (0, React.useState)(!0),
    y = (0, React.useCallback)((e: HTMLSpanElement | null) => {
      if (!e) return;
      let t = window.getComputedStyle(e);
      v(t.display !== `none` && t.visibility !== `hidden` && e.getClientRects().length > 0);
    }, []),
    b: number | null = null,
    x = () => {
      b === null &&
        (b = requestAnimationFrame(() => {
          ((b = null), y(g.current));
        }));
    },
    S = o.type === `select` ? sortThoughtLevelOptions(o.options ?? []) : [],
    C = S.findIndex((e) => e.value === o.currentValue),
    w = C >= 0,
    T = c && !w,
    E = Math.max(0, C),
    D = S[E] ?? S[0],
    O = S.length === 1 && w,
    k = T ? String(o.currentValue) : D ? resolveThoughtLevelOptionLabel(i, s, o, D) : ``,
    A = i.formatMessage({ id: `chat.toolbar.thoughtLevel.tooltip` }),
    j = t ?? (_ ? A : k);
  (0, React.useEffect)(() => {
    let e = g.current;
    if (!e) return;
    y(e);
    let t =
      typeof ResizeObserver > `u`
        ? null
        : new ResizeObserver(() => {
            x();
          });
    return (
      t?.observe(e),
      e.parentElement && t?.observe(e.parentElement),
      window.addEventListener(`resize`, x),
      () => {
        (t?.disconnect(),
          window.removeEventListener(`resize`, x),
          b !== null && cancelAnimationFrame(b));
      }
    );
  }, [k, a]);
  let M = S.filter(isThoughtLevelOptionDisabled).length,
    N = ((T ? 0 : Math.max(0, E + 1 - M)) / Math.max(1, S.length - M)) * 100;
  if (o.type !== `select` || S.length === 0 || !D) return null;
  let P = () => {
      let e = S[T ? 0 : (E + 1) % S.length];
      e && h(e.value);
    },
    F = (0, $.jsxs)($.Fragment, {
      children: [
        (0, $.jsx)(IconBrain, { className: cn(`pointer-events-none size-4 text-current`) }),
        (0, $.jsx)(`span`, {
          className: cn(
            `relative w-1 self-stretch overflow-hidden rounded-full bg-current/10`,
            `hidden @sm/composer:inline-flex @xl/composer:hidden`,
          ),
          "aria-hidden": `true`,
          children: (0, $.jsx)(`span`, {
            className: cn(
              `absolute bottom-0 left-0 w-full rounded-full bg-success transition-[height] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]`,
              N > 0 ? `min-h-1` : void 0,
            ),
            style: { height: `${N}%` },
          }),
        }),
        (0, $.jsx)(`span`, {
          ref: g,
          className: cn(`min-w-0 whitespace-nowrap`, a),
          children: (0, $.jsx)(AnimatedLabel, { label: k }),
        }),
      ],
    });
  return O
    ? (0, $.jsx)(Tooltip, {
        title: j,
        triggerRef: f,
        children: (0, $.jsx)(`span`, {
          className: cn(
            `inline-flex h-7 items-center gap-1 rounded-lg px-1.5 py-1.5 text-ui-base text-foreground`,
            d,
          ),
          "aria-label": k,
          "data-thought-level-fixed": `true`,
          "data-testid": offpeakFormTitleTestid,
          children: F,
        }),
      })
    : n === `select`
      ? (0, $.jsxs)(ConfigSelectRoot, {
          open: p,
          onOpenChange: m,
          value: String(o.currentValue),
          onValueChange: (e: string) => {
            S.some((t) => t.value === e) && h(e);
          },
          disabled: e,
          children: [
            (0, $.jsx)(Tooltip, {
              title: j,
              shortcut: u,
              triggerRef: f,
              children: (0, $.jsx)(ConfigSelectTrigger, {
                variant: `ghost`,
                size: `default`,
                indicator: (0, $.jsx)(IconChevronDown, {
                  className: cn(`pointer-events-none size-3.5 text-foreground-subtle`, r),
                }),
                className: cn(`gap-1 rounded-lg px-1.5 py-1.5 text-ui-base`, d),
                "aria-label": k,
                "data-chat-toolbar-popover-trigger": `true`,
                "data-testid": offpeakFormTitleTestid,
                children: F,
              }),
            }),
            (0, $.jsx)(ConfigSelectContent, {
              position: `popper`,
              side: `top`,
              align: `start`,
              sideOffset: 4,
              collisionPadding: 8,
              onCloseAutoFocus: (e: Event) => {
                l &&
                  (e.preventDefault(),
                  shouldRestoreFocus({ isCoarseTouchDevice: isCoarseTouchDevice() }) && (document.querySelector(l) as HTMLElement | null)?.focus());
              },
              children: S.map((e) =>
                (0, $.jsx)(
                  ConfigSelectItem,
                  {
                    value: e.value,
                    "data-testid": testidOf(automationYearDayOptionTestid, e.value),
                    children: (0, $.jsx)(`span`, {
                      className: `first-letter:uppercase`,
                      children: resolveThoughtLevelOptionLabel(i, s, o, e),
                    }),
                  },
                  e.value,
                ),
              ),
            }),
          ],
        })
      : (0, $.jsx)(Tooltip, {
          title: j,
          shortcut: u,
          triggerRef: f,
          children: (0, $.jsx)(Button, {
            type: `button`,
            variant: `ghost`,
            size: `default`,
            disabled: e,
            "data-chat-toolbar-popover-trigger": `true`,
            "data-testid": offpeakFormTitleTestid,
            className: cn(`gap-1 rounded-lg px-1.5 py-1.5 text-ui-base`, d),
            "aria-label": k,
            onClick: P,
            children: F,
          }),
        });
}

/* --- §U.3 usage 守卫族（原 76194–76251 + 76439–76504；iit re/ge 消费面所需最小子集；u3e/d3e/f3e/p3e/m3e/r3e + a3e/o3e/s3e/kq 展示域留批） --- */

function codingPlanProviderFallbackLabel(e: string) { // n3e
  return e === providerIds.zaiCodingPlan ? `Z.ai Coding Plan` : `BigModel Coding Plan`;
}
function entitlementEntrySourceId(e: { sourceId?: string; providerId: string }): string { // Eq
  return e.sourceId ?? e.providerId;
}
function hasUsableEntitlementSnapshot(e: EntitlementSnapshotLike | null | undefined, t: string): boolean { // Dq
  return (
    e?.provider?.id === t &&
    e.unavailableReason !== `no_plan` &&
    (!!e.quota || !!e.subscription || !!e.remaining)
  );
}
// 〔A1-R23〕补 export：Oq 叠层专项——SidebarLeaves SidebarUsageStateModel.usageState 收敛为本型（经 modules/Home 转导出）
export interface CodingPlanUsageViewLike {
  activeProviderId?: string;
  displayedEntitlement: { id?: string; providerId: string; label?: string; loading?: boolean; snapshot?: EntitlementSnapshotLike | null; error?: string | null } | null;
  displayedProviderId?: string | null; // 〔A1-R23〕型缝：bundle Oq `a ?? e.selectedProviderId`——mRt 150396 面 selectedProviderId 可 null（原 string）
  hasAnyActiveCodingPlan: boolean;
  loading: boolean;
  providerEntitlements: unknown[];
  tabProviders: Array<{ id: string; providerId: string; label: string }>;
  visibleSnapshot: EntitlementSnapshotLike | null | undefined;
}
// 〔A1-R23〕补 export：Oq 叠层专项裁定——bundle Oq 唯一真身 76207–76245，消费三面 76250（i3e）/76296（§V 族）/150396（mRt useSidebarUsageState，SidebarLeaves）；
// 150396 面经 modules/Home 改接本函数（原 SidebarLeaves resolveUsageState declare 删除）。
// 型缝二处（body 逐字不变，checker 剥离型注在证）：availableProviders 宽化为 { id; name? } 数组（bundle body 仅读 e.id/e.name；mRt 面传 CodingPlanProvider[]），selectedProviderId 受 null（mRt 面传 string | null）。
export function resolveCodingPlanUsageRemaining(e: {
  entitlements: Array<{ id?: string; providerId: string; label?: string; loading?: boolean; snapshot?: EntitlementSnapshotLike | null; sourceId?: string }>;
  availableProviders: Array<{ id: string; name?: string }>; // 〔A1-R23〕型缝（原 ModelProviderEntry[]）
  selectedProviderId?: string | null; // 〔A1-R23〕型缝（原 string）
  modelProvidersLoading: boolean;
}): CodingPlanUsageViewLike | null { // Oq
  let t = e.entitlements.filter(
      (t) =>
        entitlementEntrySourceId(t).startsWith(`team-plan:`) || e.availableProviders.some((e) => e.id === t.providerId),
    ),
    n = t.find((t) => entitlementEntrySourceId(t) === e.selectedProviderId),
    r =
      (n && hasUsableEntitlementSnapshot(n.snapshot, n.providerId) ? n : void 0) ??
      t.find((e) => hasUsableEntitlementSnapshot(e.snapshot, e.providerId)),
    i = r ?? n ?? t[0] ?? null,
    a = r ? entitlementEntrySourceId(r) : void 0,
    o = a ?? e.selectedProviderId,
    s = e.modelProvidersLoading || t.some((e) => e.loading),
    c = i && hasUsableEntitlementSnapshot(i.snapshot, i.providerId) ? i.snapshot : null,
    l = t.filter((e) => hasUsableEntitlementSnapshot(e.snapshot, e.providerId)).map((e) => entitlementEntrySourceId(e)),
    u = !!r,
    d = t
      .filter((e) => l.includes(entitlementEntrySourceId(e)))
      .map((t) => {
        let n = e.availableProviders.find((e) => e.id === t.providerId);
        return {
          id: entitlementEntrySourceId(t),
          providerId: t.providerId,
          label: t.label ?? n?.name ?? codingPlanProviderFallbackLabel(t.providerId),
        };
      });
  return (!e.modelProvidersLoading && t.length === 0) || (!s && !u)
    ? null
    : {
        activeProviderId: a,
        displayedEntitlement: i,
        displayedProviderId: o,
        hasAnyActiveCodingPlan: u,
        loading: s,
        providerEntitlements: t,
        tabProviders: d,
        visibleSnapshot: c,
      };
}
function hasCodingPlanUsageRemaining(e: {
  entitlements: Array<{ id?: string; providerId: string; label?: string; loading?: boolean; snapshot?: EntitlementSnapshotLike | null; sourceId?: string }>;
  availableProviders: ModelProviderEntry[];
  selectedProviderId?: string;
  modelProvidersLoading: boolean;
}): boolean { // i3e
  return !!resolveCodingPlanUsageRemaining(e);
}
function quotaLimitTotal(e: QuotaLimitLike) { // c3e
  return e.number ?? e.unit ?? 0;
}
function quotaLimitRemaining(e: QuotaLimitLike) { // l3e
  return e.remaining ?? 0;
}
function listActiveQuotaLimits(e: EntitlementSnapshotLike | null | undefined) { // h3e
  return (e?.quota?.limits ?? []).filter((e) => {
    let t = quotaLimitTotal(e),
      n = quotaLimitRemaining(e);
    return t > 0 || n > 0;
  });
}
function hasStartPlanBalanceDisplay(e: { loading?: boolean; snapshot?: EntitlementSnapshotLike | null } | undefined): boolean { // g3e
  return e ? e.loading || listActiveQuotaLimits(e.snapshot).length > 0 : !1;
}

/* --- §U.4 sidebar usage 偏好族 + 草稿投影族（原 89186–89303 + Mg 24406） --- */

var SIDEBAR_USAGE_CODING_PLAN_PROVIDER_KEY = `zcode:sidebar-usage-coding-plan-provider`, // Prt
  CODING_PLAN_PREFERENCE_PROVIDER_IDS = [providerIds.zaiCodingPlan, providerIds.bigmodelCodingPlan]; // Frt
function listConfiguredCodingPlanProviders(e: ModelProviderEntry[]) { // hX
  return CODING_PLAN_PREFERENCE_PROVIDER_IDS.flatMap((t) => {
    let n = e.find((e) => e.id === t),
      r = n?.systemDisabledReason === `coding_plan_not_entitled`;
    return n && (isProviderEnabled(n) || r) && n.apiKey.trim().length > 0 ? [n] : [];
  });
}
function getSidebarUsagePreferenceStorage() { // Irt
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch (e) {
    return (
      logger.warn(`[sidebarUsageCodingPlanProviderPreference] localStorage 不可用`, {
        error: e instanceof Error ? e.message : String(e),
      }),
      null
    );
  }
}
function writeSidebarUsageCodingPlanProviderPreference(e: string) { // Lrt
  let t = getSidebarUsagePreferenceStorage();
  if (t)
    try {
      t.setItem(SIDEBAR_USAGE_CODING_PLAN_PROVIDER_KEY, e);
    } catch (e) {
      logger.warn(`[sidebarUsageCodingPlanProviderPreference] 写入偏好失败`, {
        error: e instanceof Error ? e.message : String(e),
      });
    }
}
function modelCatalogEntryMatchesModelId(e: ModelCatalogEntryLike, t: string) { // Rrt
  return e.id === t || Object.values(e.modelIdByKind ?? {}).includes(t);
}
// 〔A1-R24〕型缝：首参宽化至最小消费面（body 仅取 id/models；原 R19 缝 ModelProviderEntry[] 收口）——N1t 197021 面联动：SubagentLeaves 链 ModelProvider[]（无 apiKey 面）可直传
// 〔A1-R24〕补 export：N1t 197021 面收敛——SubagentLeaves resolveProviderThoughtOption declare 改接（经 modules/Home 转导出）
export function buildThoughtLevelOptionFromCatalog(e: Array<{ id: string; models: Array<string | ModelCatalogEntryLike>; [key: string]: unknown }>, t: string | null | undefined, n: string | null | undefined) { // zrt
  let r = e.find((e) => e.id === t)?.models.find((e): e is ModelCatalogEntryLike => typeof e != `string` && modelCatalogEntryMatchesModelId(e, n ?? ``)),
    i = r?.reasoning ? Object.keys(r.reasoning.levels) : [],
    a = i.length > 0 ? i : isGlmModelId(n as string) ? [...GLM_REASONING_LEVELS] : [];
  return a.length === 0
    ? null
    : {
        id: `thought_level`,
        name: `Thought Level`,
        category: `thought_level`,
        type: `select`,
        currentValue:
          r?.reasoning?.defaultLevel && a.includes(r.reasoning.defaultLevel)
            ? r.reasoning.defaultLevel
            : isGlmModelId(n as string)
              ? `max`
              : (a[0] ?? ``),
        options: a.map((e) => ({ value: e, name: e })),
      };
}
var buildThoughtLevelOptionForDraft = buildThoughtLevelOptionFromCatalog; // Wrt
function readConfigOptionCurrentValue(e: ConfigOption[], t: string) { // Brt
  let n = e.find((e) => e.category === t && e.type === `select`);
  return String(n?.currentValue ?? ``).trim();
}
interface DraftConfigProjectionLike {
  provider: string;
  model: string;
  thought: string;
  thoughtLevels: string[];
  followupMode: string;
  mode: string;
}
function projectDraftConfigFromOptions(e: ConfigOption[]): DraftConfigProjectionLike | null { // Vrt
  let t = readConfigOptionCurrentValue(e, `model`);
  if (!t) return null;
  let n = parseLooseModelValue(t),
    r = readConfigOptionCurrentValue(e, `thought_level`);
  return {
    provider: n.providerId,
    model: n.modelId,
    thought: r || n.variant || ``,
    thoughtLevels: [],
    followupMode: `queue`,
    mode: `build`,
  };
}
function configMatchesProviderModel(e: DraftConfigProjectionLike | ComposerConfig | null | undefined, t: string, n: string) { // Hrt
  return e?.provider === t && e.model === n;
}
function resolveDraftEffectiveConfig(e: { configOptions: ConfigOption[]; projectionConfig: ComposerConfig | null; desiredConfig: ComposerConfig }): DraftConfigProjectionLike | null { // Urt
  let { configOptions: t, projectionConfig: n, desiredConfig: r } = e,
    i = projectDraftConfigFromOptions(t),
    a = r.provider?.trim() ?? ``,
    o = r.model?.trim() ?? ``;
  if (a && o) {
    let e = configMatchesProviderModel(n, a, o) ? n : configMatchesProviderModel(i, a, o) ? i : null;
    return {
      provider: a,
      model: o,
      thought: Object.prototype.hasOwnProperty.call(r, `thought`)
        ? (r.thought ?? ``)
        : (e?.thought ?? ``),
      thoughtLevels: r.thoughtLevels ?? e?.thoughtLevels ?? [],
      followupMode: r.followupMode ?? e?.followupMode ?? `queue`,
      mode: r.mode ?? e?.mode ?? `build`,
    };
  }
  let s = n ?? i;
  return s
    ? ({
        ...s,
        ...(Object.prototype.hasOwnProperty.call(r, `thought`) ? { thought: r.thought ?? `` } : {}),
        ...(r.followupMode ? { followupMode: r.followupMode } : {}),
        ...(r.mode ? { mode: r.mode } : {}),
      } as DraftConfigProjectionLike)
    : null;
}
function resolveEffectiveThoughtLevel(e: { thought?: string | null; thoughtLevels: string[]; modelThoughtOption?: ConfigSelectOption | null }) { // Grt
  let t = e.thought?.trim() ?? ``;
  return t && e.thoughtLevels.includes(t)
    ? t
    : (e.modelThoughtOption?.type === `select` &&
      typeof e.modelThoughtOption.currentValue == `string` &&
      e.thoughtLevels.includes(e.modelThoughtOption.currentValue)
        ? e.modelThoughtOption.currentValue
        : ``) ||
        (e.thoughtLevels[0] ?? ``);
}
// 〔A1-R25〕补 export：SubagentLeaves parseModelRef declare 收敛改接点（bundle Mg 24406 唯一真身；终端消费实测：本文件 3780 ≡ bundle 89249 Vrt 89246 面、SubagentLeaves 176/197 ≡ bundle 196989/196993 域 M1t/N1t 面）
export function parseLooseModelValue(e: string): { providerId: string; modelId: string; variant?: string } { // Mg（Zn=parseCustomModelId，src chunk P=iS）
  let t = parseCustomModelId(e);
  if (t?.providerId && t.modelName) return { providerId: t.providerId, modelId: t.modelName };
  let n = e.trim(),
    r = n.indexOf(`/`);
  if (r <= 0) return { providerId: `glm`, modelId: n || `default` };
  let i = n.slice(0, r),
    a = n.slice(r + 1),
    o = a.indexOf(`$`);
  return o <= 0 || o >= a.length - 1
    ? { providerId: i, modelId: a }
    : { providerId: i, modelId: a.slice(0, o), variant: a.slice(o + 1) };
}

/* --- §U.5 coding plan 族模式解析（原 89109–89185 + 89416–89502） --- */

interface TeamCodingPlanSourceLike {
  id: string;
  providerId: string;
  label?: string;
  organizationId?: string | null;
  projectId?: string | null;
}
interface SubscribedTeamProductLike {
  productId?: string;
  subscribed?: boolean;
  organizationId?: string | null;
  organizationName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  teamProjects?: Array<{
    organizationId?: string | null;
    organizationName?: string | null;
    projectId?: string | null;
    projectName?: string | null;
  }>;
  [key: string]: unknown;
}
function listCodingPlanAudienceSources({
  activeCodingPlanProviderIds: e,
  availableCodingPlanProviders: t,
  subscribedTeamProducts: n,
}: {
  activeCodingPlanProviderIds: string[];
  availableCodingPlanProviders: ModelProviderEntry[];
  subscribedTeamProducts: SubscribedTeamProductLike[];
}): TeamCodingPlanSourceLike[] { // pX
  let r = t
      .filter((t) => e.includes(t.id))
      .map((e) => ({ id: e.id, providerId: e.id, label: e.name })),
    i = teamSourcesFromSubscribedProducts(n);
  return [...r, ...i];
}
function teamSourcesFromSubscribedProducts(e: SubscribedTeamProductLike[]) { // jrt
  let t = new Set<string>();
  return e.flatMap((e) =>
    (e.teamProjects && e.teamProjects.length > 0
      ? e.teamProjects
      : [
          {
            organizationId: e.organizationId ?? null,
            organizationName: e.organizationName ?? null,
            projectId: e.projectId ?? null,
            projectName: e.projectName ?? null,
          },
        ]
    ).flatMap((n, r) => {
      let i = n.organizationId?.trim() ?? ``,
        a = n.projectId?.trim() ?? ``;
      if (!i || !a) return [];
      let o = teamSourceDisplayName({
        product: e,
        organizationId: i,
        organizationName: n.organizationName ?? e.organizationName,
        projectId: a,
        projectName: n.projectName ?? e.projectName,
      });
      if (!o) return [];
      let s = a || String(r),
        c = buildCodingPlanScope({ productId: e.productId, organizationId: i, projectId: s });
      return t.has(c)
        ? []
        : (t.add(c),
          [{ id: c, providerId: providerIds.bigmodelCodingPlan, label: o, organizationId: i, projectId: a }]);
    }),
  );
}
export function teamSourceOrganizationLabel(e: { organizationName?: string | null; [key: string]: unknown }): string | null { // Lq〔A1-R28〕补 export：Lq 77476 逐字 canonical 收敛面——PaymentDeep teamOrganizationLabelOf A0 副本删除改指（见该处墓碑）；校验器 jrt/Lq 段行依据同步
  return (e.organizationName?.trim() ?? ``) || null;
}
function teamSourceDisplayName({ product: e, organizationId: t, organizationName: n, projectId: r, projectName: i }: { product: SubscribedTeamProductLike; organizationId: string; organizationName?: string | null; projectId: string; projectName?: string | null }) { // Nrt
  let a = teamSourceOrganizationLabel({ ...e, organizationId: t, organizationName: n, projectId: r, projectName: i });
  return a ? `BigModel - ${a}` : null;
}
// 〔A1-R26〕Mrt 89154–89170 逐字实体化（裁量件）：SidebarLeaves resolveUpgradeTargetSource declare 收敛
// （bundle Mrt 唯一真身；终端消费实测：SidebarLeaves 932 ≡ bundle 150329，useSidebarUsageState mRt 域；
// 负证据：bundle 内 Mrt 无第二定义；PaymentDeep@10058 旧注「零消费」为 A0 期误记——150329 实测在案）。
// 型缝：解构参型按消费面——teamSources 元素取 SidebarLeaves TeamSource 同面（下游 966–968/994–996
// 消费 organizationId/projectId/providerId/label）；返回面命名标注（audience 字面量联合——
// SidebarLeaves 1017 消费面要求 `individual` | `team`，推导宽化 string 不可赋，实测在案）。
interface CodingPlanUpgradeTargetSource {
  audience: `individual` | `team`;
  providerId: string;
  sourceId: string;
  teamSource?: { id: string; providerId: string; label?: string; organizationId?: string; projectId?: string; [key: string]: unknown };
}
export function resolveUpgradeTargetSource({
  bigmodelSelectedKey: e,
  selectedProviderId: t,
  teamSources: n
}: {
  bigmodelSelectedKey?: string | null;
  selectedProviderId: string | null;
  teamSources: Array<{ id: string; providerId: string; label?: string; organizationId?: string; projectId?: string; [key: string]: unknown }>;
}): CodingPlanUpgradeTargetSource | null { // Mrt
  if (t === providerIds.zaiCodingPlan)
    return { audience: `individual`, providerId: providerIds.zaiCodingPlan, sourceId: providerIds.zaiCodingPlan };
  if (t !== providerIds.bigmodelCodingPlan) return null;
  let r = e?.trim() ?? ``;
  if (r.startsWith(`team-plan:${providerIds.bigmodelCodingPlan}:`)) {
    let e = n.find((e) => codingPlanSourceIdsMatch(e.id, r));
    return e
      ? { audience: `team`, providerId: providerIds.bigmodelCodingPlan, sourceId: e.id, teamSource: e }
      : null;
  }
  return {
    audience: `individual`,
    providerId: providerIds.bigmodelCodingPlan,
    sourceId: providerIds.bigmodelCodingPlan,
  };
}
function codingPlanSourceIdsMatch(e: string, t: string) { // mX
  if (codingPlanScopesOverlap(e, t)) return !0;
  let n = parseCodingPlanScope(e),
    r = parseCodingPlanScope(t);
  return !!(
    n?.projectId &&
    r?.projectId &&
    n.projectId === r.projectId &&
    (!n.organizationId || !r.organizationId || n.organizationId === r.organizationId)
  );
}
function teamSourceFromEntitlementSnapshot({ selectedSourceKey: e, snapshot: t }: { selectedSourceKey: string; snapshot: EntitlementSnapshotLike | null | undefined }) { // nit
  if (t?.context?.scope !== `team`) return null;
  let n = t.context.organizationId?.trim() ?? ``,
    r = t.context.projectId?.trim() ?? ``;
  if (!n || !r) return null;
  let i = t.subscription?.details[0] ?? null,
    a = buildCodingPlanScope({
      productId: t.context.productId?.trim() || i?.productId?.trim() || `current`,
      organizationId: n,
      projectId: r,
    });
  if (!codingPlanSourceIdsMatch(a, e)) return null;
  let o = t.context.displayName?.trim() || i?.productName?.trim() || `Team`;
  return {
    id: a,
    providerId: providerIds.bigmodelCodingPlan,
    label: `BigModel - ${o}`,
    organizationId: n,
    projectId: r,
  };
}
function resolveSelectedTeamSource(e: {
  cachedTeamSources?: TeamCodingPlanSourceLike[];
  entitlementSnapshot?: EntitlementSnapshotLike | null;
  providerId: string;
  selectedSourceKey?: string;
  subscribedTeamProducts: SubscribedTeamProductLike[];
}) { // rit
  let t = e.selectedSourceKey?.trim() ?? ``;
  return e.providerId !== providerIds.bigmodelCodingPlan ||
    !t.startsWith(`team-plan:${providerIds.bigmodelCodingPlan}:`)
    ? null
    : (listCodingPlanAudienceSources({
        activeCodingPlanProviderIds: [],
        availableCodingPlanProviders: [],
        subscribedTeamProducts: e.subscribedTeamProducts,
      }).find((e) => codingPlanSourceIdsMatch(e.id, t)) ??
        e.cachedTeamSources?.find((e) => codingPlanSourceIdsMatch(e.id, t)) ??
        teamSourceFromEntitlementSnapshot({ selectedSourceKey: t, snapshot: e.entitlementSnapshot }));
}
function classifyCodingPlanProviderId(e: string | undefined | null) { // eit
  switch (e?.trim()) {
    case providerIds.zai:
      return { family: `zai`, kind: `apiKey` };
    case providerIds.zaiCodingPlan:
      return { family: `zai`, kind: `personalCoding` };
    case providerIds.zaiStartPlan:
      return { family: `zai`, kind: `start` };
    case providerIds.bigmodel:
      return { family: `bigmodel`, kind: `apiKey` };
    case providerIds.bigmodelCodingPlan:
      return { family: `bigmodel`, kind: `personalCoding` };
    case providerIds.bigmodelStartPlan:
      return { family: `bigmodel`, kind: `start` };
    case providerIds.zapi:
      return { family: `zai`, kind: `zapi` };
    default:
      return null;
  }
}
interface CodingPlanFamilySelectionLike {
  kind: string;
  family?: string;
  providerId?: string;
  selectedSourceKey?: string;
}
function resolveCodingPlanFamilySelection(e: {
  providerId?: string | null;
  modelProviderFamilyModes?: Record<string, string>;
  modelProviderFamilySelectedKeys?: Record<string, string>;
}): CodingPlanFamilySelectionLike { // tit
  let t = classifyCodingPlanProviderId(e.providerId);
  if (
    !t ||
    t.kind === `apiKey` ||
    t.kind === `zapi` ||
    resolveProviderFamilyMode(t.family, e.modelProviderFamilyModes ?? {}) !== `oauth`
  )
    return { kind: `none` };
  let n = e.modelProviderFamilySelectedKeys?.[t.family]?.trim() ?? ``;
  if (!n) return { kind: `none` };
  if (t.kind === `start`) {
    let r = e.providerId?.trim();
    return (r !== providerIds.zaiStartPlan && r !== providerIds.bigmodelStartPlan) || n !== `coding-plan:${r}`
      ? { kind: `none` }
      : { family: t.family, kind: `start`, providerId: r };
  }
  let r = e.providerId?.trim();
  return r !== providerIds.zaiCodingPlan && r !== providerIds.bigmodelCodingPlan
    ? { kind: `none` }
    : r === providerIds.bigmodelCodingPlan && n.startsWith(`team-plan:${providerIds.bigmodelCodingPlan}:`)
      ? {
          family: `bigmodel`,
          kind: `teamCoding`,
          providerId: providerIds.bigmodelCodingPlan,
          selectedSourceKey: n,
        }
      : n === `coding-plan:${r}`
        ? { family: t.family, kind: `personalCoding`, providerId: r }
        : { kind: `none` };
}
/* Qrt（COMPOSER_MODE_TRIGGER_FOCUS_SELECTOR）89416：bundle 与 Zrt 89415 同 var 句，已并入 §T.5 ComposerModeToolbar 声明处。 */
function composerSessionModeCycleNoop() {} // $rt

/* --- §U.6 会话相位刷新族（原 78404–78429） --- */

function isSessionPhaseRunning(e: string | null) { // c8e
  return e === `prewarming` || e === `running`;
}
function entitlementAutoRefreshModeOfPhase(e: string | null) { // l8e
  return isSessionPhaseRunning(e) ? `active` : `idle`;
}
function shouldForceRefreshOnPhaseChange(e: { current: { running: boolean; sessionId: string | null }; previous: { running: boolean; sessionId: string | null } }) { // u8e
  let { current: t, previous: n } = e;
  if (!t.sessionId) return !1;
  let r = n.sessionId === t.sessionId,
    i = t.running && (!r || !n.running),
    a = r && n.running && !t.running;
  return i || a;
}
interface EntitlementRefreshOptionsLike { force: boolean; silent: boolean; reason: string }
function useEntitlementRefreshOnTaskTransition(e: {
  phase: string | null;
  refresh: (e: EntitlementRefreshOptionsLike) => void;
  sessionId: string | null;
}) { // d8e
  let t = e.refresh,
    n = e.sessionId?.trim() || null,
    r = isSessionPhaseRunning(e.phase),
    i = (0, React.useRef)({ running: r, sessionId: n });
  (0, React.useEffect)(() => {
    let e = { running: r, sessionId: n },
      a = i.current;
    ((i.current = e),
      shouldForceRefreshOnPhaseChange({ current: e, previous: a }) && t({ force: !0, silent: !0, reason: `task` }));
  }, [t, r, n]);
}

/* --- §U.7 设置导航状态机（原 39299–39454；A1-R24 全域补齐：$C–cw 逐字，canonical 收口） --- */

// 〔A1-R24〕型缝：设置分区 id 全集（bundle $C 39305 运行期判定面的编译期镜像；原 modules/Settings SettingsSectionId 同面）
export type SettingsSectionId =
  | `general`
  | `appearance`
  | `migration`
  | `indexing`
  | `browser`
  | `modelProvider`
  | `memory`
  | `mcp`
  | `plugins`
  | `usage`
  | `skills`
  | `subagents`
  | `commands`
  | `hooks`
  | `automations`;
// 〔A1-R24〕型缝：意图事件 detail 面（bundle ow 39381 dispatch 面 / cw 39442 消费面）
export interface SettingsSectionIntentDetail {
  section: SettingsSectionId;
  usageTab?: string;
  modelProviderId?: string;
}

var SETTINGS_SECTION_INTENT_KEY = `zcode-settings-section-intent`, // JC
  SETTINGS_USAGE_TAB_INTENT_KEY = `zcode-settings-usage-tab-intent`, // YC
  SETTINGS_MODEL_PROVIDER_INTENT_KEY = `zcode-settings-model-provider-id-intent`, // XC
  SETTINGS_SECTION_INTENT_EVENT = `zcode:settings-section-intent`, // ZC
  SETTINGS_LAST_SECTION_KEY = `zcode-settings-last-section`, // QC
  AUTOMATION_SETTINGS_SECTION_VALUES: Set<string | null> = new Set([`automations`]); // VMe 〔A1-R24〕型缝：has() 入参含 null 面（ew 39324 消费面）
export function isSettingsSectionId(e: unknown): e is SettingsSectionId { // $C
  return (
    e === `general` ||
    e === `appearance` ||
    e === `migration` ||
    e === `indexing` ||
    e === `browser` ||
    e === `modelProvider` ||
    e === `memory` ||
    e === `mcp` ||
    e === `plugins` ||
    e === `usage` ||
    e === `skills` ||
    e === `subagents` ||
    e === `commands` ||
    e === `hooks` ||
    e === `automations`
  );
}
// 〔A1-R24〕型缝：入参宽化为 string | null + 守护返回（bundle 无类型；tw 消费面 GMe 39373 传 string | null——
// TS 收窄不过逗号表达式，GMe 守卫面无法编译期回收；运行期各消费面均传已验分区串，守护使三元返回收窄回 SettingsSectionId）
export function isSettingsSectionVisible(e: string | null): e is SettingsSectionId { // ew
  return !AUTOMATION_SETTINGS_SECTION_VALUES.has(e);
}
export function resolveVisibleSettingsSection(e: string | null, t: SettingsSectionId = `general`) { // tw
  return isSettingsSectionVisible(e) ? e : t;
}
function tryGetSettingsStorage() { // nw
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch (e) {
    return (
      logger.warn(`[settingsNavigation] localStorage 不可用`, {
        error: e instanceof Error ? e.message : String(e),
      }),
      null
    );
  }
}
export function readLastSettingsSection(e: SettingsSectionId = `general`) { // HMe
  let t = tryGetSettingsStorage();
  if (!t) return e;
  try {
    let n = t.getItem(SETTINGS_LAST_SECTION_KEY);
    if (n === `codePreview`) return (t.setItem(SETTINGS_LAST_SECTION_KEY, `appearance`), `appearance`);
    if (n === `codePreview`) return `appearance`;
    if (n && isSettingsSectionId(n)) return resolveVisibleSettingsSection(n, e);
    n !== null && t.removeItem(SETTINGS_LAST_SECTION_KEY);
  } catch (e) {
    logger.warn(`[settingsNavigation] 读取上次设置分区失败`, {
      error: e instanceof Error ? e.message : String(e),
    });
  }
  return e;
}
export function persistLastSettingsSection(e: SettingsSectionId) { // rw
  let t = resolveVisibleSettingsSection(e),
    n = tryGetSettingsStorage();
  if (n)
    try {
      n.setItem(SETTINGS_LAST_SECTION_KEY, t);
    } catch (e) {
      logger.warn(`[settingsNavigation] 写入上次设置分区失败`, {
        error: e instanceof Error ? e.message : String(e),
      });
    }
}
export function readInitialSettingsSection(e: SettingsSectionId = `general`) { // UMe
  let t = readLastSettingsSection(e);
  return resolveVisibleSettingsSection(consumeSectionIntent(t), t);
}
export function openSettingsSection(e: SettingsSectionId) { // iw
  requestSettingsSectionOpen(e);
}
// 〔A1-R25〕补 export：Sidebar markUsageEntryIntent declare 收敛改接点（bundle aw 39378 唯一真身；终端消费实测：本文件 4689 ≡ bundle 89577、Sidebar 4769 ≡ bundle 150430）
export function openSettingsUsageSection() { // aw
  requestSettingsSectionOpen(`usage`);
}
// 〔A1-R24〕补 export：modules/Settings 再导出别名 requestSettingsSectionNavigation 所依（A0 iw/aw 并入面）
export function requestSettingsSectionOpen(e: SettingsSectionId, t: { usageTab?: string; modelProviderId?: string } = {}) { // ow
  if (!(typeof window > `u`)) {
    try {
      (window.sessionStorage.setItem(SETTINGS_SECTION_INTENT_KEY, e),
        t.usageTab && window.sessionStorage.setItem(SETTINGS_USAGE_TAB_INTENT_KEY, t.usageTab),
        t.modelProviderId
          ? window.sessionStorage.setItem(SETTINGS_MODEL_PROVIDER_INTENT_KEY, t.modelProviderId)
          : window.sessionStorage.removeItem(SETTINGS_MODEL_PROVIDER_INTENT_KEY));
    } catch {}
    window.dispatchEvent(
      new CustomEvent(SETTINGS_SECTION_INTENT_EVENT, {
        detail: { section: e, usageTab: t.usageTab, modelProviderId: t.modelProviderId },
      }),
    );
  }
}
function clearSettingsSectionIntents() { // WMe
  if (!(typeof window > `u`))
    try {
      (window.sessionStorage.removeItem(SETTINGS_SECTION_INTENT_KEY),
        window.sessionStorage.removeItem(SETTINGS_USAGE_TAB_INTENT_KEY),
        window.sessionStorage.removeItem(SETTINGS_MODEL_PROVIDER_INTENT_KEY));
    } catch {}
}
// 〔A1-R24〕型缝：返回宽化 string | null——bundle 守卫在逗号表达式内（`(..., e && $C(e))`），TS 收窄不过逗号，body 逐字不改；消费面仅 UMe 39373（经 tw 守护回收窄）
function consumeSectionIntent(e: SettingsSectionId = `general`): string | null { // GMe
  if (typeof window > `u`) return e;
  try {
    let e = window.sessionStorage.getItem(SETTINGS_SECTION_INTENT_KEY);
    if ((e !== null && window.sessionStorage.removeItem(SETTINGS_SECTION_INTENT_KEY), e && isSettingsSectionId(e))) return e;
  } catch {}
  return e;
}
export function consumeUsageTabIntent() { // KMe
  if (!(typeof window > `u`))
    try {
      let e = window.sessionStorage.getItem(SETTINGS_USAGE_TAB_INTENT_KEY);
      return (
        e !== null && window.sessionStorage.removeItem(SETTINGS_USAGE_TAB_INTENT_KEY),
        e === `app` || e === `codingPlan` ? e : void 0
      );
    } catch {
      return;
    }
}
export function consumeModelProviderIntent() { // sw
  if (!(typeof window > `u`))
    try {
      let e = window.sessionStorage.getItem(SETTINGS_MODEL_PROVIDER_INTENT_KEY);
      return (window.sessionStorage.removeItem(SETTINGS_MODEL_PROVIDER_INTENT_KEY), e?.trim() ? { providerId: e.trim() } : void 0);
    } catch {
      return;
    }
}
export function shouldResetUsageTabToApp({
  activeTab: e,
  checkingCodingPlanTab: t,
  loadingModelProviders: n,
  showCodingPlanTab: r,
}: {
  activeTab: string;
  checkingCodingPlanTab: boolean;
  loadingModelProviders: boolean;
  showCodingPlanTab: boolean;
}) { // qMe
  return e === `codingPlan` && !r && !n && !t;
}
export function subscribeSettingsSectionIntent(
  e: (section: SettingsSectionId, detail: SettingsSectionIntentDetail) => void, // 〔A1-R24〕型缝：handler 形（bundle cw 39449 调用面 e(n.section, n)）
) { // cw
  if (typeof window > `u`) return () => {};
  let t = (t: { type: string; detail?: SettingsSectionIntentDetail | null }) => { // 〔A1-R24〕型缝：CustomEvent 消费面（type 为 Event 共有面，避弱型检测；detail 可选）
    let n = t.detail;
    n?.section && isSettingsSectionId(n.section) && (clearSettingsSectionIntents(), e(n.section, n));
  };
  return (
    window.addEventListener(SETTINGS_SECTION_INTENT_EVENT, t),
    () => {
      window.removeEventListener(SETTINGS_SECTION_INTENT_EVENT, t);
    }
  );
}

/* --- §U.8 购买漏斗上下文族（原 53250–53412） --- */

function newCodingPlanFunnelId() { // UUe
  return globalThis.crypto?.randomUUID?.() ?? fallbackCodingPlanFunnelId();
}
function fallbackCodingPlanFunnelId() { // qUe
  return (
    logger.warn(`[codingPlanFunnelTelemetry] crypto.randomUUID unavailable, using fallback id`),
    `funnel_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
}
function normalizeCodingPlanFunnelFamily(e: string) { // GUe
  return e === `bigmodel` ||
    e === providerIds.bigmodel ||
    e === providerIds.bigmodelCodingPlan ||
    e === providerIds.bigmodelStartPlan
    ? `bigmodel`
    : e === `zai` || e === providerIds.zai || isZaiPlanProviderId(e)
      ? `zai`
      : `unknown`;
}
function codingPlanFunnelChannelOfFamily(e: string) { // KUe
  return ({ bigmodel: `MaaS`, zai: `Z_AI`, unknown: `` } as Record<string, string>)[e];
}
function isStartPlanLevelLabel(e: string) { // UM
  return /\bstart\b/i.test(e.trim());
}
interface EntryPlanStateLike { entryPlanStatus?: string; entryPlanLevel?: string }
export function buildCodingPlanPurchaseFunnelContext(e: { // 〔A1-P1-B5〕补 export：R0 簇 ConversationPaneCore 消费面回取（原 PM 53253）
  providerId: string;
  upgradeSource: string;
  eventRegion: string;
  eventText: string;
  entryPlanState?: EntryPlanStateLike | null;
  purchaseAudience?: string;
}) { // PM
  let t = normalizeCodingPlanFunnelFamily(e.providerId);
  return {
    purchaseFunnelId: newCodingPlanFunnelId(),
    upgradeSource: e.upgradeSource,
    eventRegion: e.eventRegion,
    eventText: e.eventText,
    entryPlanStatus: e.entryPlanState?.entryPlanStatus ?? `unknown`,
    entryPlanLevel: e.entryPlanState?.entryPlanLevel ?? ``,
    purchaseAudience: e.purchaseAudience ?? ``,
    providerFamily: t,
    channel: codingPlanFunnelChannelOfFamily(t),
  };
}
// 〔A1-R25〕FM 53267–53276 逐字实体化：buildCodingPlanFunnelContext declare 收敛（bundle FM 唯一真身；
// 终端消费实测：本文件 1124 OffPeakNewTaskBanner ≡ bundle 91685、139073 R0 域留批；负证据：bundle 内 FM 无第二定义）
export function buildCodingPlanFunnelContext(e: { // 〔A1-R42〕补 export：AutomationsMain 139073/139076 消费面接引（P1-B5 补 export 先例；R25 留批闭合）
  providerId: string;
  eventText: string;
  entryPlanState?: EntryPlanStateLike | null;
}) { // FM
  return buildCodingPlanPurchaseFunnelContext({
    providerId: e.providerId,
    upgradeSource: `session_idle_time`,
    eventRegion: `app.session`,
    eventText: e.eventText,
    entryPlanState: e.entryPlanState,
    purchaseAudience: `personal`,
  });
}
export function resolveEntryPlanStateFromSnapshot(e: { // 〔A1-P1-B5〕补 export：R0 簇 ConversationPaneCore 消费面回取（原 IM 53277）
  providerId?: string;
  planLevel?: string;
  snapshot?: EntitlementSnapshotLike | null;
  displayStatus?: string;
}): EntryPlanStateLike { // IM
  let t = e.planLevel?.trim() ?? ``,
    n =
      e.snapshot?.subscription?.details?.[0]?.productName?.trim() ||
      e.snapshot?.subscription?.details?.[0]?.productId?.trim() ||
      e.snapshot?.quota?.level?.trim() ||
      ``,
    r = t || n;
  if (e.snapshot) {
    if (e.snapshot.unavailableReason === `no_plan`)
      return { entryPlanStatus: `no_plan`, entryPlanLevel: `` };
    if (e.snapshot.subscription || e.snapshot.quota || e.snapshot.remaining)
      return { entryPlanStatus: isStartPlanLevelLabel(r) ? `start_plan` : `coding_plan`, entryPlanLevel: r };
  }
  return e.displayStatus === `notPurchased`
    ? { entryPlanStatus: `no_plan`, entryPlanLevel: `` }
    : e.displayStatus === `purchased`
      ? { entryPlanStatus: isStartPlanLevelLabel(r) ? `start_plan` : `coding_plan`, entryPlanLevel: r }
      : e.providerId && isStartPlanProviderId(e.providerId) && r
        ? { entryPlanStatus: `start_plan`, entryPlanLevel: r }
        : { entryPlanStatus: `unknown`, entryPlanLevel: `` };
}
// 〔A1-R26〕LM 53299–53312 逐字实体化：resolveEntryPlanState declare 收敛（bundle LM 唯一真身；
// 终端消费实测：本文件 1137 ≡ bundle 91688、139076 R0 域留批；负证据：bundle 内 LM 无第二定义）。
// 依赖接线：IM≡resolveEntryPlanStateFromSnapshot / q≡providerIds / li≡parseCodingPlanScope（SrcSharedB；
// styles 680 `gt as li` ← src `parseCodingPlanScope as gt` ≡ Gb 8533）/ HM≡isStartPlanProviderId（SrcSharedA）。
export function resolveEntryPlanState(e: { providers: ModelProviderEntry[]; loading: boolean }): EntryPlanStateLike { // LM 〔A1-R42〕补 export：AutomationsMain 139076 消费面接引（参型 ModelProviderEntry[] 与 AutomationsMain ModelProvider[] 逐字段相容，索引签名 unknown 对齐）
  if (e.loading) return resolveEntryPlanStateFromSnapshot({});
  let t = e.providers.filter((e) => !(e.enabled === !1 && e.systemDisabledReason)),
    n = t.find(
      (e) => e.id === providerIds.zaiCodingPlan || e.id === providerIds.bigmodelCodingPlan || parseCodingPlanScope(e.id) !== null,
    );
  if (n) return resolveEntryPlanStateFromSnapshot({ displayStatus: `purchased`, providerId: n.id });
  let r = t.find((e) => isStartPlanProviderId(e.id));
  return resolveEntryPlanStateFromSnapshot(
    r
      ? { displayStatus: `purchased`, providerId: r.id, planLevel: `start` }
      : { displayStatus: `notPurchased` },
  );
}
// 〔A1-R26〕WUe/RM/zM/BM/VM 53313–53386/53400 漏斗遥测族逐字实体化（§U.8 收尾）：
// 终端消费实测——WUe：PaymentDeep 5507 ≡ bundle 84644；RM：PaymentDeep 5679/5716 ≡ bundle 84816/84853；
// zM：PaymentDeep 5979/6012 ≡ bundle 85159/85191；BM/VM 仅族内消费（53324/53342/53363/53377）。
// 负证据：bundle 内五符均无第二定义。xw≡reportTelemetry（StoresDeep@323 逐字，A1-R9 判例）。
// 型缝：n 取结构面（消费字段逐字列出）；t=PM 返回面（CodingPlanFunnelContextLike）；e 可空守卫后窄化；
// zM n.seatCount/n.durationMonths 可选——bundle 85191 personal 路径不传，体 `?? ''` 兜底（85159 team 路径传）。
interface CodingPlanFunnelContextLike {
  purchaseFunnelId: string;
  upgradeSource: string;
  eventRegion: string;
  eventText: string;
  entryPlanStatus: string;
  entryPlanLevel: string;
  purchaseAudience: string;
  providerFamily: string;
  channel: string;
}
export function trackCodingPlanFunnelStart(e: TelemetryPlatform | null | undefined, t: CodingPlanFunnelContextLike) { // WUe
  !e ||
    !t ||
    reportTelemetry(
      e,
      {
        eventType: `ck`,
        eventRegion: t.eventRegion,
        elementName: `coding_plan_upgrade_ck`,
        eventText: t.eventText,
        eventExtraDetail: codingPlanFunnelExtrasOf(t),
      },
      `codingPlanFunnelTelemetry`,
    );
}
export function trackCodingPlanProductSelect(e: TelemetryPlatform | null | undefined, t: CodingPlanFunnelContextLike, n: {
  eventText: string;
  purchaseAudience: string;
  productGroupId: string;
  productName: string;
  planTier: string;
}) { // RM（补 export：PaymentDeep 5679/5716 消费面）
  !e ||
    !t ||
    reportTelemetry(
      e,
      {
        eventType: `ck`,
        eventRegion: `app.purchase`,
        elementName: `purchase_product_select_ck`,
        eventText: n.eventText,
        eventExtraDetail: stringifyCodingPlanFunnelExtras({
          ...codingPlanFunnelExtrasOf({ ...t, purchaseAudience: n.purchaseAudience }),
          product_group_id: n.productGroupId,
          product_id: ``,
          product_name: n.productName,
          plan_tier: n.planTier || `unknown`,
        }),
      },
      `codingPlanFunnelTelemetry`,
    );
}
export function trackCodingPlanBillingCycleSelect(e: TelemetryPlatform | null | undefined, t: CodingPlanFunnelContextLike, n: {
  eventText: string;
  purchaseAudience: string;
  productId: string;
  productName: string;
  planTier: string;
  billingPeriod: string;
  purchaseMethod: string;
  paymentMethod: string;
  seatCount?: string;
  durationMonths?: string;
  currency: string;
  amount: string;
}) { // zM（补 export：PaymentDeep 5979/6012 消费面）
  !e ||
    !t ||
    reportTelemetry(
      e,
      {
        eventType: `ck`,
        eventRegion: `app.purchase`,
        elementName: `purchase_billing_cycle_select_ck`,
        eventText: n.eventText,
        eventExtraDetail: stringifyCodingPlanFunnelExtras({
          ...codingPlanFunnelExtrasOf({ ...t, purchaseAudience: n.purchaseAudience }),
          product_id: n.productId,
          product_name: n.productName,
          plan_tier: n.planTier || `unknown`,
          billing_period: n.billingPeriod || `unknown`,
          purchase_method: n.purchaseMethod || `unknown`,
          payment_method: n.paymentMethod,
          seat_count: n.seatCount ?? ``,
          duration_months: n.durationMonths ?? ``,
          currency: n.currency,
          amount: n.amount,
        }),
      },
      `codingPlanFunnelTelemetry`,
    );
}
function codingPlanFunnelExtrasOf(e: CodingPlanFunnelContextLike) { // BM
  return stringifyCodingPlanFunnelExtras({
    purchase_funnel_id: e.purchaseFunnelId,
    upgrade_source: e.upgradeSource,
    entry_plan_status: e.entryPlanStatus,
    entry_plan_level: e.entryPlanLevel,
    purchase_audience: e.purchaseAudience,
    provider_family: e.providerFamily,
    channel: e.channel,
  });
}
function stringifyCodingPlanFunnelExtras(e: Record<string, unknown>) { // VM
  return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, t == null ? `` : String(t)]));
}

/* --- §U.9 模型选择小助手族（原 77856–77897；A1-R25 w6e 实体化并入） --- */

// 〔A1-R25〕w6e 实体化（补 export）：双实例 declare 收敛 canonical（bundle w6e 77856 唯一真身；终端消费实测：
// 197058 ≡ SubagentLeaves resolveModelTriggerLabel（findModelGroupItemLabel declare 面）、
// ExtendedViews 2267（resolveModelGroupLabel declare 面）、132407 repoWiki 域外留批）。
// 型缝：首参宽化至最小消费面（body 仅取 items.value/items.name；消费侧传 ModelGroup[]、
// SelectGroupEntry[]、ModelSelectGroup[] 三型，name 可选面 → 返回宽化 string | null | undefined，调用面均 ?? 兜底）
export function resolveModelGroupLabel(e: Array<{ items: Array<{ value: string; name?: string; [key: string]: unknown }>; [key: string]: unknown }>, t: string): string | null | undefined { // w6e
  for (let n of e) {
    let e = n.items.find((e) => e.value === t);
    if (e) return e.name;
  }
  let n = parseCustomModelId(t);
  return n?.modelName ? n.modelName : null;
}
function isManageModelsActionVisible(e: unknown, t: { isWebRemoteControl?: boolean } = {}) { // T6e
  return t.isWebRemoteControl ? !1 : typeof e == `function`;
}
function isSyntheticModelValue(e: string) { // E6e
  return e.trim().toLocaleLowerCase() === `<synthetic>`;
}
function shortLabelOfModelValue(e: string) { // D6e
  let t = parseCustomModelId(e);
  if (t?.modelName?.trim()) return t.modelName.trim();
  let n = e.trim(),
    r = n.indexOf(`/`);
  if (r > 0 && r < n.length - 1) {
    let e = n.slice(r + 1).trim();
    if (e) return e;
  }
  return n;
}
function modelGroupsContainValue(e: ModelGroup[], t: string) { // O6e
  return e.some((e) => e.items.some((e) => e.value === t));
}
function normalizeModelSelectState(e: string, t: ModelGroup[], n: boolean, r: string, i?: { allowUnavailableCustomModelPlaceholder?: boolean; allowUnavailableModelPlaceholder?: boolean }) { // k6e
  if (isSyntheticModelValue(e)) return { value: void 0, placeholder: void 0 };
  if (modelGroupsContainValue(t, e)) return { value: e, placeholder: void 0 };
  let a = parseCustomModelId(e);
  return i?.allowUnavailableCustomModelPlaceholder && a?.modelName?.trim()
    ? { value: void 0, placeholder: a.modelName.trim() }
    : i?.allowUnavailableModelPlaceholder && e.trim()
      ? { value: void 0, placeholder: shortLabelOfModelValue(e) }
      : t.length === 0 && n
        ? { value: void 0, placeholder: r }
        : { value: void 0, placeholder: void 0 };
}
function isModelSelectConnectionModeEnabled(e: string) { // r6e
  return !1;
}

/* --- §U.11 配置选项钩族（原 78430–78455；A1-R53 逐字实体化） ---
 * 映射表（行号 = styles-CdEGpc2x.js）：
 *   f8e → useActiveTabWorkspaceIdentity (78430-78436) | Jq → useCatalogConfigOptions (78437-78455)
 * 体内依赖改指（canonical 全在案，调用面逐字不变）：
 *   pc ≡ useWorkspaceTabStore（WorkspaceTabsDeep@686；styles 4801-4805，R1/R2 判例；尾部导入 @7162 既接）
 *   oc ≡ isWorkspaceKindTab（WorkspaceTabsDeep@328；styles 4487-4489，R1 判例；〔A1-R53〕尾部导入扩面接引）
 *   xe ≡ useTaskStore（stores/taskStore ≡ skillStore chunk yn@1798；styles 371-420 导入面 `h as xe`）
 *   co ≡ useShallowSelector（lib/shallowSelector；styles 1033-1039，R36 逐字/R38 迁公共叶判例；〔A1-R53〕尾部导入接引）
 *   fe ≡ getWorkspaceTaskStateAlias（taskStore@430 ≡ skillStore _e@251→S@209；导入面 `U as fe`）
 *   ce ≡ getMergedTaskListItem（taskStore@409 ≡ skillStore E@236；导入面 `E as P`）
 *   be ≡ buildTaskConfigOptionsFromMeta（taskStore@2124 ≡ skillStore sn@1300；导入面 `sn as g`）
 * 消费面：Jq 本文件 4650（≡ bundle 89524，iit）；域外 137206（workspacePurpose 域）/197845（支付域 qq/JM 面）留批。
 * f8e 唯一消费 = Jq@78438（全 bundle 负证据在案）；f8e/Jq 皆不在 styles 导出面（chunk 私有，不 export）。 */
function useActiveTabWorkspaceIdentity(e: string): string | null | undefined { // f8e
  return useWorkspaceTabStore((t) => {
    if (!t.activeTabId) return;
    let n = t.tabs.find((e) => e.id === t.activeTabId);
    if (!(!n || !isWorkspaceKindTab(n) || n.workspacePath !== e)) return n.workspaceIdentity;
  });
}
function useCatalogConfigOptions(e: string, t: string | null, n?: string | null): { configOptions: ConfigOption[]; status: string; loading: boolean; error: boolean } { // Jq
  let r = useActiveTabWorkspaceIdentity(e),
    i = n ?? r,
    { configOptions: a, configOptionsStatus: o } = useTaskStore(
      useShallowSelector((n: TaskStoreState) => { // 〔A1-R53〕型缝：选择器参型显式标注（useShallowSelector 参面 any，束真 n = xe 态面 = TaskStoreState；运行期零变）
        let r = getWorkspaceTaskStateAlias(n, e, i);
        if (t && r.activeTaskId === t) {
          let e = r.taskConfigOptionsByTaskId[t],
            n = r.taskConfigOptionsStatusByTaskId[t];
          if (e) return { configOptions: e, configOptionsStatus: n ?? `ready` };
          let i = getMergedTaskListItem(r, t),
            a = buildTaskConfigOptionsFromMeta({ taskMeta: { provider: i?.provider ?? r.selectedProvider, model: i?.model } });
          return { configOptions: a, configOptionsStatus: a.length > 0 ? `loading` : `idle` };
        }
        return { configOptions: r.configOptions, configOptionsStatus: r.configOptionsStatus };
      }),
    );
  return { configOptions: a ?? [], status: o, loading: o === `loading`, error: o === `error` };
}

/* --- §U.10 配置工具条（原 iit 89503–89977 / ait 89978） --- */

interface ComposerUsageSnapshot {
  contextWindow?: {
    usedTokens: number;
    maxTokens: number;
    cache?: { hitRate?: number | null } | null;
    breakdown?: Array<{ source: string; chars: number }> | null;
  } | null;
}
interface ComposerConfigToolbarProps {
  workspacePath: string;
  workspaceIdentity?: string | null;
  sessionId: string | null;
  phase: string | null;
  provider?: string | null;
  isWebRemoteControl?: boolean;
  isMobileViewport?: boolean;
  config: ComposerConfig | null;
  draftMode?: boolean;
  draftConfig?: ComposerConfig | null;
  usage?: ComposerUsageSnapshot | null;
  disabled?: boolean;
  activeConfigPicker: ComposerConfigPicker;
  onConfigPickerOpenChange: (picker: ComposerConfigPicker, open: boolean) => void;
  onSelectModel: (providerId: string, model: string, previous: { provider?: string | null; model?: string | null } | null) => void;
  onSelectThought: (thought: string, current: { provider?: string | null; model?: string | null }) => void;
  onSwitchMode?: (mode: string) => void;
  onRecoverCustomModelSelection?: (value: string, previous: { provider: string; model: string } | null) => unknown;
  onSendCompressionCommand?: () => void;
}
function ComposerConfigToolbarBody({
  workspacePath: e,
  workspaceIdentity: t,
  sessionId: n,
  phase: r,
  provider: i,
  config: a,
  draftMode: o = !1,
  draftConfig: s,
  usage: c,
  disabled: l,
  activeConfigPicker: u,
  onConfigPickerOpenChange: d,
  onSelectModel: f,
  onSelectThought: p,
  onSendCompressionCommand: m,
  onRecoverCustomModelSelection: h,
}: ComposerConfigToolbarProps) { // iit
  let { intl: g, locale: _ } = useIntlContext(),
    { openCodingPlanUpgrade: v } = useCodingPlanUpgradeDialog(),
    y = i ?? `glm`,
    { configOptions: b, error: x } = useCatalogConfigOptions(e, null, t),
    { modelProviders: S, displayOrder: C, loading: w } = useModelProviders(),
    { settings: T } = useSettingsSnapshot(),
    E = entitlementAutoRefreshModeOfPhase(r),
    { entitlements: D, refresh: O } = useEntitlementsHub({
      autoRefreshMode: E,
      modelProviders: S,
      loading: w,
      modelProviderFamilySelectedKeys: T?.modelProviderFamilySelectedKeys,
    }),
    k = useWorkspaceTabStore((e) => e.openSettingsTab), // 〔A1-R40〕原 useTabStoreSelector（pc）收敛改指 WorkspaceTabsDeep useWorkspaceTabStore（≡ bundle 89534）
    A = (0, React.useCallback)((e: string) => D[e]?.snapshot ?? null, [D]),
    j = React.useRef<HTMLSpanElement | null>(null),
    M = React.useRef<HTMLSpanElement | null>(null),
    [N, P] = (0, React.useState)(0),
    [F, I] = (0, React.useState)(!1),
    R = (0, React.useCallback)(() => {
      P((e) => e + 1);
    }, []),
    z = (0, React.useCallback)(
      (e: boolean) => {
        d(`model`, e);
      },
      [d],
    ),
    B = (0, React.useCallback)(
      (e: boolean) => {
        d(`thought`, e);
      },
      [d],
    ),
    V = b.find((e) => e.category === `model`),
    H = (0, React.useMemo)(
      () => (o ? resolveDraftEffectiveConfig({ configOptions: b, projectionConfig: a, desiredConfig: s ?? {} }) : a),
      [a, b, s, o],
    ),
    ee = (0, React.useCallback)(
      (e: string) => {
        v({
          providerId: e,
          funnelContext: buildCodingPlanPurchaseFunnelContext({
            providerId: e,
            upgradeSource: `session_token_usage`,
            eventRegion: `app.session`,
            eventText: g.formatMessage({ id: `chat.quota.action.upgrade` }),
            entryPlanState: resolveEntryPlanStateFromSnapshot({ providerId: e, displayStatus: `purchased`, planLevel: `start` }),
          }),
        });
      },
      [g, v],
    ),
    U = (0, React.useCallback)(
      (e: string | undefined) => {
        (e && writeSidebarUsageCodingPlanProviderPreference(e), openSettingsUsageSection(), k());
      },
      [k],
    ),
    te = (0, React.useMemo)(
      () =>
        resolveCodingPlanFamilySelection({
          modelProviderFamilyModes: T?.modelProviderFamilyModes,
          modelProviderFamilySelectedKeys: T?.modelProviderFamilySelectedKeys,
          providerId: H?.provider,
        }),
      [H?.provider, T?.modelProviderFamilyModes, T?.modelProviderFamilySelectedKeys],
    ),
    ne = (0, React.useMemo)(() => {
      if (te.kind !== `start`) return;
      let e = D[te.providerId as string];
      return {
        loading: e?.loading ?? w,
        onUpgradeClick: () => ee(te.providerId as string),
        snapshot: e?.snapshot?.provider?.id === te.providerId ? e?.snapshot ?? null : null,
      };
    }, [te, D, ee, w]),
    re = hasStartPlanBalanceDisplay(ne) ? ne : void 0,
    ie = (0, React.useMemo)(() => listConfiguredCodingPlanProviders(S), [S]),
    ae = useTeamProductSubscriptions({ enabled: !w && te.kind === `teamCoding`, authenticated: !0 }),
    oe = (0, React.useMemo)(
      () => ae.snapshot?.productList.filter((e) => e.subscribed === !0) ?? [],
      [ae.snapshot?.productList],
    ),
    ce = React.useRef<TeamCodingPlanSourceLike[]>([]),
    le = te.kind === `personalCoding` || te.kind === `teamCoding` ? te.providerId : void 0,
    ue = (0, React.useMemo)(
      () =>
        te.kind === `teamCoding`
          ? resolveSelectedTeamSource({
              cachedTeamSources: ce.current,
              entitlementSnapshot: D[providerIds.bigmodelCodingPlan]?.snapshot ?? null,
              providerId: te.providerId as string,
              selectedSourceKey: te.selectedSourceKey,
              subscribedTeamProducts: oe,
            })
          : null,
      [te, D, oe],
    );
  (0, React.useEffect)(() => {
    if (!ue) return;
    let e = ce.current.filter((e) => !codingPlanSourceIdsMatch(e.id, ue.id));
    (e.unshift(ue), (ce.current = e.slice(0, 8)));
  }, [ue]);
  let de = te.kind === `teamCoding` ? ue?.id : le,
    fe = useOrganizationEntitlementQuery({
      autoRefreshMode: E,
      enabled: !w && !!ue,
      includeSubscription: !0,
      preferredProviderId: providerIds.bigmodelCodingPlan,
      allowDisabledPreferredProvider: !0,
      requirePreferredProvider: !0,
      allowEnvApiKey: !1,
      organizationId: ue?.organizationId,
      projectId: ue?.projectId,
      cacheKey: ue?.id,
    });
  useEntitlementRefreshOnTaskTransition({
    phase: r,
    refresh: (0, React.useCallback)(
      async (e: EntitlementRefreshOptionsLike) => {
        await Promise.all([O(e), fe.refresh(e)]);
      },
      [O, fe.refresh],
    ),
    sessionId: n,
  });
  let W = (0, React.useMemo)(
      () => (te.kind === `personalCoding` && le ? ie.filter((e) => e.id === le) : []),
      [ie, le, te.kind],
    ),
    pe = (0, React.useMemo)(() => {
      if (ue)
        return [
          {
            sourceId: ue.id,
            providerId: ue.providerId,
            label: ue.label,
            snapshot: fe.snapshot,
            loading: fe.loading,
            error: fe.error,
          },
        ];
      if (te.kind !== `personalCoding` || !le) return [];
      let e = le,
        t = D[e];
      return [
        {
          sourceId: e,
          providerId: e,
          snapshot: t?.snapshot ?? null,
          loading: t?.loading ?? w,
          error: t?.error ?? null,
        },
      ];
    }, [le, ue, te.kind, D, w, fe.error, fe.loading, fe.snapshot]),
    me = (0, React.useCallback)(() => U(de), [de, U]),
    he = (0, React.useMemo)(() => {
      if (!(te.kind !== `personalCoding` && !ue))
        return {
          availableProviders: W,
          entitlements: pe,
          modelProvidersLoading: w,
          onUsageClick: me,
          selectedProviderId: de,
        };
    }, [W, de, ue, te.kind, pe, me, w]),
    ge = he && hasCodingPlanUsageRemaining(he) ? he : void 0;
  (0, React.useEffect)(() => {
    o &&
      logger.debug(`[v4-toolbar] draft effectiveConfig changed`, {
        provider: H?.provider ?? null,
        model: H?.model ?? null,
        thought: H?.thought ?? null,
        catalogModelCurrentValue: String(
          b.find((e) => e.category === `model` && e.type === `select`)?.currentValue ?? ``,
        ),
        catalogOptionCount: b.length,
      });
  }, [b, o, H]);
  let _e = (0, React.useMemo)(() => {
      // 〔A1-R29〕型缝：旧 declare 面依本地 ModelProviderEntry/EntitlementSnapshotLike；canonical 依 PD ModelProvider/
      // EntitlementSnapshot（读面全合，行依据：本行 + useModelProviders/useEntitlementsHub declare 面）。
      let e = filterUsableProviders({
          providers: S as PaymentModelProvider[],
          selectedProvider: y,
          getEntitlementSnapshot: A as (providerId: string) => EntitlementSnapshot | null,
          modelProviderFamilySelectedKeys: T?.modelProviderFamilySelectedKeys,
        }),
        t = V?.type === `select` ? filterNativeModelOptions(V.options ?? [], V.currentValue, e) : [];
      // 〔A1-R29〕Hq 收敛：bundle Hq 77850 体内从不读第二参（configModels 位，负证据在案），本行删该位；
      // displayOrder C 旧 declare 面 string[] 为 A0 近似，真形 {providerIds}（qq store 真面，Iq 77456/MPSS 证据），宽化直通。
      return modelMenuGroupsOf(
        y,
        e,
        {
          apiKeyLabel: g.formatMessage({ id: `settings.modelProvider.apiKey` }),
          apiKeyBadgeLabel: g.formatMessage({
            id: `settings.modelProvider.connectionMode.apiKeyBadge`,
          }),
          codingPlanLabel: g.formatMessage({
            id: `settings.modelProvider.connectionMode.codingPlan`,
          }),
          codingPlanBadgeLabel: g.formatMessage({
            id: `settings.modelProvider.connectionMode.codingPlanBadge`,
          }),
          startPlanLabel: g.formatMessage({
            id: `settings.modelProvider.connectionMode.startPlan`,
          }),
          startPlanBadgeLabel: g.formatMessage({
            id: `settings.modelProvider.connectionMode.startPlanBadge`,
          }),
          teamPlanBadgeLabel: g.formatMessage({
            id: `settings.modelProvider.connectionMode.teamPlanBadge`,
          }),
          teamPlanFallbackLabel: g.formatMessage({
            id: `settings.modelProvider.connectionMode.teamPlan`,
          }),
        },
        C as unknown as { providerIds: string[] } | null,
        T?.modelProviderFamilyModes,
        T?.modelProviderFamilySelectedKeys,
        [],
        !1,
        void 0,
        { providerFamilyDomain: T?.providerFamilyDomain },
      );
    }, [
      C,
      y,
      A,
      g,
      V,
      S,
      T?.modelProviderFamilyModes,
      T?.modelProviderFamilySelectedKeys,
      T?.providerFamilyDomain,
    ]),
    ve = (0, React.useCallback)(() => {
      (requestSettingsSectionOpen(`modelProvider`), k());
    }, [k]),
    ye = isManageModelsActionVisible(ve),
    be = g.formatMessage({ id: `chat.toolbar.model.manageModels` }),
    xe = (0, React.useMemo)(
      () =>
        !H || !H.model
          ? ``
          : S.some((e) => e.id === H.provider)
            ? formatCustomModelId(H.provider as string, H.model)
            : H.model,
      [H, S],
    ),
    Se = (0, React.useMemo)(() => normalizeModelSelectState(xe, _e, ye, be), [be, _e, xe, ye]),
    Ce = Se.value ?? ``,
    Te = (0, React.useMemo)(() => {
      let e = Se.placeholder ?? g.formatMessage({ id: `chat.toolbar.model.label` }),
        t = S.find((e) => e.id === H?.provider)?.name;
      return resolveModelTriggerLabels({
        modelGroups: _e,
        normalizedValue: Ce,
        fallbackLabel: e,
        providerId: H?.provider,
        providerName: t,
      });
    }, [H?.provider, g, S, _e, Ce, Se.placeholder]),
    Ee = (0, React.useCallback)(
      (e: string) => {
        let t = parseCustomModelId(e),
          n = H?.provider && H.model ? { provider: H.provider, model: H.model } : null;
        logger.debug(`[v4-toolbar] model select onValueChange`, {
          value: e,
          decodedProviderId: t?.providerId ?? null,
          decodedModelName: t?.modelName ?? null,
          draftMode: o,
        });
        let r = t?.providerId ? S.find((e) => e.id === t.providerId) : void 0,
          i = !!(r && !isBuiltinProviderId(r.id) && r.source !== `builtin`);
        if (x && t?.providerId && i && h) {
          (I(!0),
            Promise.resolve(h(e, n))
              .catch((e: unknown) => {
                logger.warn(`[v4-toolbar] custom provider recovery failed`, {
                  error: e instanceof Error ? e.message : String(e),
                  providerId: t.providerId,
                });
              })
              .finally(() => {
                I(!1);
              }));
          return;
        }
        if (t) {
          f(t.providerId, t.modelName ?? ``, n);
          return;
        }
        let a = e.indexOf(`/`);
        if (a > 0) {
          f(e.slice(0, a), e.slice(a + 1), n);
          return;
        }
        f(``, e, n);
      },
      [x, y, o, H?.model, H?.provider, h, f, S, t, e],
    ),
    De = (0, React.useMemo)(() => (o && H ? buildThoughtLevelOptionForDraft(S, H.provider, H.model) : null), [o, H, S]),
    Oe = (0, React.useMemo)(
      () =>
        H
          ? (H.thoughtLevels ?? []).length > 0
            ? {
                id: `thought_level`,
                name: `Thought Level`,
                category: `thought_level`,
                type: `select`,
                currentValue: resolveEffectiveThoughtLevel({
                  thought: H.thought,
                  thoughtLevels: H.thoughtLevels ?? [],
                  modelThoughtOption: De,
                }),
                options: (H.thoughtLevels ?? []).map((e) => ({ value: e, name: e })),
              }
            : !o || !De
              ? null
              : { ...De, currentValue: H.thought || De.currentValue }
          : null,
      [o, De, H],
    ),
    ke = (0, React.useCallback)(
      (e: string) => {
        if (H) {
          if (!e.trim()) {
            logger.debug(`[v4-toolbar] ignore synthetic empty thought change`, {
              model: H.model,
              provider: H.provider,
            });
            return;
          }
          p(e, { provider: H.provider, model: H.model });
        }
      },
      [H, p],
    ),
    Ae = (0, React.useCallback)(() => {
      if (!Oe || Oe.type !== `select`) return;
      let e = cycleThoughtLevelSelectValue(Oe);
      e != null && H && p(e, { provider: H.provider, model: H.model });
    }, [H, p, Oe]),
    je = (0, React.useMemo)(() => {
      let e = c?.contextWindow;
      return e
        ? {
            used: e.usedTokens,
            size: e.maxTokens,
            ...(e.cache ? { cache: e.cache } : {}),
            ...(e.breakdown ? { breakdown: e.breakdown } : {}),
          }
        : null;
    }, [c?.contextWindow]),
    Me = (0, React.useMemo)(() => formatToolbarShortcutLabel(`M`), []),
    Ne = (0, React.useMemo)(() => formatToolbarShortcutLabel(`T`), []),
    Pe = (0, React.useCallback)(() => !1, []),
    Fe = (!!H || o) && (_e.length > 0 || ye);
  return (
    useComposerToolbarShortcuts({
      hasAnyOption: !!V || !!Oe,
      toolbarDisabled: l || F,
      modelMenuDisabled: l || F || !Fe,
      modelOption: V,
      thoughtOption: Oe ?? void 0,
      onOpenModelMenu: R,
      onCycleThoughtLevel: Ae,
      onCycleSessionMode: composerSessionModeCycleNoop,
    }),
    (0, $.jsxs)($.Fragment, {
      children: [
        (0, $.jsx)(`span`, {
          "data-testid": v4ModelConfigTestid,
          "data-source": o
            ? s?.provider && s.model
              ? `draft-intent`
              : a
                ? `prewarm-projection`
                : H
                  ? `workspace-default`
                  : ``
            : a
              ? `projection`
              : ``,
          "data-provider": H?.provider ?? ``,
          "data-model": H?.model ?? ``,
          "data-thought": H?.thought ?? ``,
          "data-thought-levels":
            Oe?.type === `select` ? (Oe.options ?? []).map((e) => e.value).join(`,`) : ``,
          "data-mode": H?.mode ?? ``,
          "data-usage-used": c?.contextWindow?.usedTokens ?? ``,
          "data-usage-max": c?.contextWindow?.maxTokens ?? ``,
          className: `hidden`,
        }),
        (0, $.jsx)(CodingPlanUsageToolbar, {
          codingPlanUsageRemaining: ge,
          taskUsage: je,
          startPlanBalance: re,
          selectedProvider: y,
          intl: g,
          locale: _,
          onSendCompressionCommand: m,
          compressionDisabled: l || F,
        }),
        Fe
          ? (0, $.jsx)(ModelSelector, {
              modelGroups: _e,
              normalizedValue: Ce,
              triggerLabel: Te.fullLabel,
              triggerLabelPrefix: Te.providerPrefix,
              triggerLabelValue: Te.modelLabel,
              triggerLabelPrefixClassName: `hidden @xl/composer:inline`,
              showManageModelsAction: ye,
              manageModelsLabel: be,
              onManageModels: ve,
              lockReasonMessage: g.formatMessage({
                id: `chat.toolbar.modelSwitch.lockedByRunningTask`,
              }),
              isItemLocked: Pe,
              onValueChange: Ee,
              disabled: l || F,
              tooltipTitle: g.formatMessage({ id: `chat.toolbar.model.label` }),
              shortcutLabel: Me,
              triggerRef: j,
              open: u === `model`,
              onOpenChange: z,
              openRequestKey: N,
              labelVisibilityClassName: `hidden @sm/composer:inline-flex`,
              indicatorClassName: `hidden @sm/composer:block`,
              triggerClassName: `@max-sm/composer:size-7 @max-sm/composer:justify-center @max-sm/composer:gap-0 @max-sm/composer:p-0`,
              triggerIconClassName: `inline-flex @sm/composer:hidden`,
              focusSelectorOnClose: COMPOSER_MODE_TRIGGER_FOCUS_SELECTOR,
            })
          : null,
        Oe
          ? (0, $.jsx)(ComposerThoughtToolbar, {
              indicatorClassName: `hidden @xl/composer:block`,
              triggerClassName: `@max-sm/composer:size-7 @max-sm/composer:justify-center @max-sm/composer:p-0`,
              option: Oe,
              onValueChange: ke,
              disabled: l || F,
              intl: g,
              provider: y,
              shortcutLabel: Ne,
              triggerRef: M,
              open: u === `thought`,
              onOpenChange: B,
              restoreFocusSelector: COMPOSER_MODE_TRIGGER_FOCUS_SELECTOR,
            })
          : null,
      ],
    })
  );
}
var ComposerConfigToolbar = (0, React.memo)(ComposerConfigToolbarBody); // ait 89978

/* ── tombstone（A1-R18）：declare function ComposerConfigToolbar（原 ait，js 89978 = memo(iit 89503)；
 *    iZe 后台工作胶囊 js 69225 仍留批）删除——本文件 §U 配置工具条簇逐字实体化；消费面 90971 逐字不变。 ── */

/* ── §V usage 展示域（原 styles js 76149–76180 + 76246–76293 + 76294–76494 中本批段 + 76505–76847）A1-R19 逐字实体化 ──
 * 映射表（minified → 语义 → bundle 行）：
 *   Sq=findUsageLimit 76149 / Cq=resolveUsageLimitRemainingPercent 76152 / $4e=formatUsageLimitPercentLabel 76157 /
 *   wq=formatUsageResetDateTime 76162–76180 / r3e=resolveUsageGridColumnsClass 76246 / a3e=formatUsageResetClockTime 76252 /
 *   o3e=UsagePlanLimitRow 76262 / s3e=CodingPlanUsagePanel 76294 / kq=normalizeUsageDetailDisplayName 76418 /
 *   u3e=formatUsageFractionPercent 76445 / d3e=resolveSnapshotEarliestRenewTime 76451 / f3e=formatSnapshotRenewTime 76465 /
 *   p3e=formatUsageModelCode 76482 / m3e=resolveUsageDetailLabel 76486 / _3e=StartPlanUsageLimitRow 76505 /
 *   v3e=StartPlanBalancePanel 76540 / y3e=runActionAndClose 76612 / Aq=USAGE_CHART_SEGMENT_COLORS 76615 /
 *   b3e=USAGE_CONTEXT_PROGRESS_MAX 76621 / x3e=CACHE_HIT_RATE_DISPLAY_THRESHOLD 76622 / S3e=formatUsageTokenCountCompact 76624 /
 *   C3e=formatContextUsageSummary 76627 / w3e=formatCacheHitRatePercent 76631 / T3e=resolveUsageChartSegmentStyle 76638 /
 *   E3e=CONTEXT_USAGE_BREAKDOWN_LABEL_I18N_IDS 76641 / D3e=CONTEXT_USAGE_BREAKDOWN_SOURCE_ORDER 76650 /
 *   O3e=aggregateContextUsageBreakdown 76659 / k3e=buildContextUsageProgressSegments 76670 / A3e=sanitizeContextTaskUsage 76673 /
 *   j3e=CodingPlanUsageToolbar 76678–76847。
 * 跨 chunk 真身：J4e/X4e/Z4e/Q4e/yq=ContextUsageProvider/ContextRingTrigger/ContextRingTooltipContent/ContextRingTooltipBody/
 *   SegmentedProgress（ModelSelector.tsx，A0-S2d 属主导出）/ wa=ChevronRight（button chunk 导出 o）/
 *   M=LoaderCircle（imeComposition chunk 导出 w）/ Pv=IconRocket（R15）/ ja=formatNumberCompact（UsageStatsUiParts）/
 *   Lte=chatContextUsageTriggerTestid（SrcSharedB）/ X=Button / Z=cn / Q=React / $=jsx-runtime。
 * 胶囊层（A1-R20 收敛）：dj/gj/hj/_j=useBillingDiscount/BillingDiscountBadgeWithInfo/BillingDiscountBadge/
 *   BillingDiscountInfoDialog——canonical 属主 components/usage/UsageDeep.tsx（A0 已重建，深依赖已收敛），文件头 import 改指。
 * JSX 保持编译形态；函数体内局部变量保留混淆名。 ── */

/* --- §V.1 限额查找 + 百分比 + 重置时刻格式化（原 76149–76180） --- */

function findUsageLimit(e: QuotaLimitLike[] | null | undefined, t: string, n: number, r?: number) { // Sq
  return e?.find((e) => e.type === t && e.unit === n && (r == null || e.number === r)) ?? null;
}
function resolveUsageLimitRemainingPercent(e: QuotaLimitLike | null | undefined) { // Cq
  return typeof e?.percentage != `number` || !Number.isFinite(e.percentage)
    ? null
    : Math.max(0, Math.min(100, 100 - e.percentage));
}
function formatUsageLimitPercentLabel(e: string, t: QuotaLimitLike | null | undefined) { // $4e
  let n = resolveUsageLimitRemainingPercent(t);
  return n == null
    ? `--`
    : `${new Intl.NumberFormat(e, { maximumFractionDigits: n >= 10 ? 0 : 1 }).format(n)}%`;
}
function formatUsageResetDateTime(e: { locale: string; value: string | number | undefined; format?: string; compactToday?: boolean }) { // wq
  if (!e.value) return;
  let t = new Date(e.value);
  if (Number.isNaN(t.getTime())) return;
  if (e.format === `date`)
    return new Intl.DateTimeFormat(e.locale, { month: `short`, day: `numeric` }).format(t);
  let n = new Date(),
    r =
      t.getFullYear() === n.getFullYear() &&
      t.getMonth() === n.getMonth() &&
      t.getDate() === n.getDate();
  return new Intl.DateTimeFormat(e.locale, {
    ...(e.compactToday && r ? {} : { month: `short`, day: `numeric` }),
    hour: `2-digit`,
    minute: `2-digit`,
    hourCycle: `h23`,
  }).format(t);
}

/* --- §V.2 网格列类 + 时钟时刻 + 计划限额行（原 76246–76293） --- */

function resolveUsageGridColumnsClass(e: number) { // r3e
  return e <= 1 ? `grid-cols-1` : e === 2 ? `grid-cols-2` : `grid-cols-3`;
}
function formatUsageResetClockTime({ locale: e, value: t }: { locale: string; value: string | number }) { // a3e
  if (!t) return;
  let n = new Date(t);
  if (!Number.isNaN(n.getTime()))
    return new Intl.DateTimeFormat(e, {
      hour: `2-digit`,
      minute: `2-digit`,
      hourCycle: `h23`,
    }).format(n);
}
function UsagePlanLimitRow({ color: e, label: t, percentage: n, resetTime: r, value: i }: { color: string; label: string; percentage: number | null; resetTime: string | undefined; value: string }) { // o3e
  return (0, $.jsxs)(`div`, {
    className: `min-w-0 space-y-1.5`,
    children: [
      (0, $.jsxs)(`div`, {
        className: `min-w-0 space-y-0.5 text-ui-sm`,
        children: [
          (0, $.jsx)(`div`, { className: `min-w-0 truncate text-foreground-subtle`, children: t }),
          (0, $.jsxs)(`div`, {
            className: `min-w-0 text-ui-sm tabular-nums`,
            children: [
              (0, $.jsx)(`span`, { className: `font-mono text-foreground`, children: i }),
              r
                ? (0, $.jsxs)(`span`, { className: `text-foreground-subtle`, children: [` · `, r] })
                : null,
            ],
          }),
        ],
      }),
      (0, $.jsx)(`div`, {
        className: `h-1.5 overflow-hidden rounded-full bg-surface-hover`,
        children: (0, $.jsx)(`div`, {
          className: `h-full rounded-full`,
          style: {
            backgroundColor: e,
            width: `${Number.isFinite(n) ? Math.max(0, Math.min(100, n ?? 0)) : 0}%`,
          },
        }),
      }),
    ],
  });
}

/* --- §V.3 Coding Plan usage 面板（原 s3e 76294–76417） --- */

interface CodingPlanUsagePlanLimitRow {
  color: string;
  key: string;
  label: string;
  limit: QuotaLimitLike;
  resetTime: string | undefined;
}
/** Coding Plan usage 余量入参（原 j3e prop e / s3e config 面；iit 89600 区 ge 构造同形） */
interface CodingPlanUsageRemainingLike {
  entitlements: Array<{ id?: string; providerId: string; label?: string; loading?: boolean; snapshot?: EntitlementSnapshotLike | null; sourceId?: string }>;
  availableProviders: ModelProviderEntry[];
  selectedProviderId?: string;
  modelProvidersLoading: boolean;
  onUsageClick?: (() => void) | null;
}
function CodingPlanUsagePanel({ config: e, intl: t, locale: n, separated: r = !1 }: { config: CodingPlanUsageRemainingLike; intl: IntlShape; locale: string; separated?: boolean }) { // s3e
  let i = useBillingDiscount(),
    a = (0, React.useMemo)(() => resolveCodingPlanUsageRemaining(e), [e]);
  if (!a) return null;
  let o = a.visibleSnapshot?.quota?.level ?? null,
    s = a.visibleSnapshot?.remaining,
    c = a.visibleSnapshot?.unavailableReason,
    l = a.visibleSnapshot?.quota?.limits ?? [],
    u = findUsageLimit(l, `TOKENS_LIMIT`, 3, 5),
    d = findUsageLimit(l, `TOKENS_LIMIT`, 6),
    f = findUsageLimit(l, `TIME_LIMIT`, 5, 1),
    p = u?.nextResetTime ? formatUsageResetClockTime({ locale: n, value: u.nextResetTime }) : void 0,
    m = d?.nextResetTime ? formatUsageResetDateTime({ locale: n, value: d.nextResetTime, format: `date` }) : void 0,
    h = f?.nextResetTime ? formatUsageResetDateTime({ locale: n, value: f.nextResetTime, format: `date` }) : void 0,
    g =
      c === `not_configured`
        ? t.formatMessage({ id: `sidebar.usage.plan.notConfigured` })
        : c === `not_authenticated`
          ? t.formatMessage({ id: `sidebar.usage.plan.loginRequired` })
          : c === `no_plan`
            ? t.formatMessage({ id: `sidebar.usage.plan.noPlan` })
            : t.formatMessage({ id: `sidebar.usage.plan.unavailable` }),
    _ = !a.loading && !s && l.length === 0 && !o,
    v = [
      u
        ? {
            color: `var(--color-usage-chart-1)`,
            key: `fiveHour`,
            label: t.formatMessage({ id: `sidebar.usage.plan.fiveHour` }),
            limit: u,
            resetTime: p,
          }
        : null,
      d
        ? {
            color: `var(--color-usage-chart-2)`,
            key: `weekly`,
            label: t.formatMessage({ id: `sidebar.usage.plan.weekly` }),
            limit: d,
            resetTime: m,
          }
        : null,
      f
        ? {
            color: `var(--color-usage-chart-3)`,
            key: `monthlyTool`,
            label: t.formatMessage({ id: `sidebar.usage.plan.toolCalls` }),
            limit: f,
            resetTime: h,
          }
        : null,
    ].filter((e): e is CodingPlanUsagePlanLimitRow => e !== null);
  return (0, $.jsxs)(`div`, {
    className: r ? `border-t border-border pt-2` : void 0,
    children: [
      (0, $.jsxs)(`div`, {
        className: `flex min-w-0 items-center mb-2 gap-3`,
        children: [
          (0, $.jsxs)(`div`, {
            className: `flex min-w-0 flex-1 items-center gap-1`,
            children: [
              (0, $.jsx)(`span`, {
                className: `min-w-0 truncate text-ui-base font-medium text-foreground`,
                children: t.formatMessage({ id: `sidebar.usage.plan.title` }),
              }),
              i.active ? (0, $.jsx)(BillingDiscountBadgeWithInfo, { config: i.config, size: `compact` }) : null,
            ],
          }),
          e.onUsageClick
            ? (0, $.jsxs)(`button`, {
                type: `button`,
                "aria-label": t.formatMessage({ id: `sidebar.usage.plan.open` }),
                className: `inline-flex h-6 shrink-0 items-center gap-0.5 text-ui-sm text-foreground-subtle hover:text-foreground hover:underline`,
                onClick: (t: React.MouseEvent<HTMLButtonElement>) => {
                  (t.preventDefault(), t.stopPropagation(), e.onUsageClick?.());
                },
                children: [
                  (0, $.jsx)(`span`, {
                    children: t.formatMessage({ id: `sidebar.usage.plan.open` }),
                  }),
                  (0, $.jsx)(ChevronRight, { className: `size-3.5` }),
                ],
              })
            : null,
        ],
      }),
      (0, $.jsx)(`div`, {
        className: cn(`grid gap-2`, resolveUsageGridColumnsClass(v.length)),
        children:
          a.loading && !a.visibleSnapshot
            ? (0, $.jsxs)(`div`, {
                className: `flex items-center gap-2 p-2 text-ui-base text-foreground-subtle`,
                children: [
                  (0, $.jsx)(LoaderCircle, { className: `size-3.5 animate-spin` }),
                  t.formatMessage({ id: `sidebar.usage.plan.loading` }),
                ],
              })
            : a.displayedEntitlement?.error
              ? (0, $.jsx)(`div`, {
                  className: `rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-ui-base text-destructive`,
                  children: a.displayedEntitlement.error,
                })
              : _
                ? (0, $.jsx)(`div`, {
                    className: `p-2 text-ui-base leading-relaxed text-foreground-subtle`,
                    children: g,
                  })
                : v.map((e) =>
                    (0, $.jsx)(
                      UsagePlanLimitRow,
                      {
                        color: e.color,
                        label: e.label,
                        percentage: resolveUsageLimitRemainingPercent(e.limit),
                        value: formatUsageLimitPercentLabel(n, e.limit),
                        resetTime: e.resetTime,
                      },
                      e.key,
                    ),
                  ),
      }),
    ],
  });
}

/* --- §V.4 展示名归一 + 分数百分比 + 最早续费时刻 + 模型码 + 明细标签（原 76418–76494 本批段） --- */

function normalizeUsageDetailDisplayName(e: string) { // kq
  let t = e.replace(/\s+/g, ` `).trim();
  if (/^GLM-\S+$/i.test(t))
    return t
      .split(`-`)
      .map((e, t) => (t === 0 ? `GLM` : /^turbo$/i.test(e) ? `Turbo` : e))
      .join(`-`);
  let n = t.replace(/[_-]+/g, ` `);
  return n
    ? n
        .split(` `)
        .map((e) =>
          /^(GLM|API|MCP|AI)$/i.test(e)
            ? e.toUpperCase()
            : /^\d+(\.\d+)?$/.test(e)
              ? e
              : e.charAt(0).toUpperCase() + e.slice(1).toLowerCase(),
        )
        .join(` `)
    : ``;
}
function formatUsageFractionPercent(e: number, t: string | undefined) { // u3e
  let n = Number.isFinite(e) ? Math.max(0, Math.min(1, e)) : 0;
  return new Intl.NumberFormat(t || void 0, { maximumFractionDigits: 0, style: `percent` }).format(
    n,
  );
}
function resolveSnapshotEarliestRenewTime(e: EntitlementSnapshotLike | null | undefined) { // d3e
  let t = e?.subscription?.details[0]?.renewTime?.trim();
  if (t) {
    let e = Date.parse(t);
    if (Number.isFinite(e)) return e;
  }
  let n = e?.remaining?.nextResetTime;
  return typeof n == `number` && Number.isFinite(n)
    ? n
    : (e?.quota?.limits ?? [])
        .map((e) => e.nextResetTime)
        .filter((e): e is number => typeof e == `number` && Number.isFinite(e))
        .sort((e, t) => e - t)[0];
}
function formatSnapshotRenewTime(e: number | undefined, t: string) { // f3e
  if (!e) return;
  let n = new Date(e);
  if (Number.isNaN(n.getTime())) return;
  let r = new Intl.DateTimeFormat(t || void 0, { month: `short`, day: `numeric` }).format(n),
    i = new Intl.DateTimeFormat(t || void 0, {
      hour: `2-digit`,
      minute: `2-digit`,
      hourCycle: `h23`,
    }).format(n),
    a = new Date();
  return n.getFullYear() === a.getFullYear() &&
    n.getMonth() === a.getMonth() &&
    n.getDate() === a.getDate()
    ? i
    : `${r} ${i}`;
}
function formatUsageModelCode(e: string) { // p3e
  let t = e.replace(/^model:/i, ``);
  return t.toLowerCase() === `glm-5-turbo` ? `GLM-5Turbo` : t.toUpperCase();
}
function resolveUsageDetailLabel(e: QuotaLimitLike) { // m3e
  let t = e.usageDetails
    .map((e) => {
      let t = e.displayName?.trim();
      return normalizeUsageDetailDisplayName(t || formatUsageModelCode(e.modelCode.trim()));
    })
    .filter((e) => e.length > 0);
  return t.length === 0 ? e.type : t.join(` / `);
}

/* --- §V.5 Start Plan 余额行 + 面板（原 _3e 76505 / v3e 76540） --- */

function StartPlanUsageLimitRow({ limit: e, locale: t, renewTime: n }: { limit: QuotaLimitLike; locale: string; renewTime: string | undefined }) { // _3e
  let r = quotaLimitTotal(e),
    i = quotaLimitRemaining(e),
    a = r > 0 ? Math.max(0, Math.min(1, i / r)) : 0;
  return (0, $.jsxs)(`div`, {
    className: `min-w-0 space-y-1.5`,
    children: [
      (0, $.jsxs)(`div`, {
        className: `min-w-0 space-y-0.5 text-ui-sm`,
        children: [
          (0, $.jsx)(`div`, {
            className: `min-w-0 truncate text-foreground-subtle`,
            children: resolveUsageDetailLabel(e),
          }),
          (0, $.jsxs)(`div`, {
            className: `min-w-0 text-ui-sm tabular-nums`,
            children: [
              (0, $.jsx)(`span`, { className: `font-mono text-foreground`, children: formatUsageFractionPercent(a, t) }),
              n
                ? (0, $.jsxs)(`span`, { className: `text-foreground-subtle`, children: [` · `, n] })
                : null,
            ],
          }),
        ],
      }),
      (0, $.jsx)(`div`, {
        className: `h-1.5 overflow-hidden rounded-full bg-surface-hover`,
        children: (0, $.jsx)(`div`, {
          className: `h-full rounded-full bg-success`,
          style: { width: `${a * 100}%` },
        }),
      }),
    ],
  });
}
/** Start Plan 余额视图入参（原 j3e prop t / v3e config 面；iit 4348 区 ne 构造同形） */
interface StartPlanBalanceLike {
  loading?: boolean;
  onUpgradeClick?: (() => void) | null;
  snapshot?: EntitlementSnapshotLike | null;
}
function StartPlanBalancePanel({ config: e, intl: t, locale: n, separated: r = !1 }: { config: StartPlanBalanceLike; intl: IntlShape; locale: string; separated?: boolean }) { // v3e
  let i = useBillingDiscount(),
    a = i.active === !0,
    o = listActiveQuotaLimits(e.snapshot),
    s = formatSnapshotRenewTime(resolveSnapshotEarliestRenewTime(e.snapshot), n);
  return !e.loading && o.length === 0
    ? null
    : (0, $.jsxs)(`div`, {
        className: r ? `border-t border-border pt-2` : void 0,
        children: [
          (0, $.jsxs)(`div`, {
            className: `mb-2 flex min-w-0 items-center gap-3`,
            children: [
              (0, $.jsxs)(`div`, {
                className: `flex min-w-0 flex-1 items-center gap-1.5`,
                children: [
                  (0, $.jsx)(`span`, {
                    className: `min-w-0 truncate text-ui-base font-medium text-foreground`,
                    children: t.formatMessage({
                      id: `settings.modelProvider.startPlan.balance.title`,
                    }),
                  }),
                  e.loading
                    ? (0, $.jsx)(LoaderCircle, {
                        className: `size-3.5 shrink-0 animate-spin text-foreground-subtle`,
                      })
                    : null,
                ],
              }),
              e.onUpgradeClick
                ? (0, $.jsxs)(`div`, {
                    className: `inline-flex shrink-0 items-center gap-1`,
                    children: [
                      (0, $.jsxs)(Button, {
                        type: `button`,
                        size: `xs`,
                        className: cn(
                          `h-6 shrink-0 gap-1 px-2 text-ui-sm`,
                          a &&
                            `button-gradient rounded-full pr-[5px] text-white hover:bg-transparent hover:opacity-90 dark:bg-[#484A58] dark:hover:bg-[#484A58]`,
                        ),
                        onClick: (t: React.MouseEvent<HTMLButtonElement>) => {
                          (t.preventDefault(), t.stopPropagation(), e.onUpgradeClick?.());
                        },
                        children: [
                          (0, $.jsx)(IconRocket, { className: `size-3` }),
                          t.formatMessage({ id: `chat.quota.action.upgrade` }),
                          a
                            ? (0, $.jsx)(BillingDiscountBadge, {
                                config: i.config,
                                iconVisible: !1,
                                size: `compact`,
                                variant: `surface`,
                              })
                            : null,
                        ],
                      }),
                      a ? (0, $.jsx)(BillingDiscountInfoDialog, { config: i.config }) : null,
                    ],
                  })
                : null,
            ],
          }),
          (0, $.jsx)(`div`, {
            className: cn(`grid gap-2`, resolveUsageGridColumnsClass(o.length)),
            children: o.map((e) =>
              (0, $.jsx)(StartPlanUsageLimitRow, { limit: e, locale: n, renewTime: s }, `${e.type}:${resolveUsageDetailLabel(e)}`),
            ),
          }),
        ],
      });
}

/* --- §V.6 上下文用量助手族（原 76612–76677） --- */

function runActionAndClose({ action: e, close: t }: { action?: (() => void) | null; close: () => void }) { // y3e
  (t(), e?.());
}
var USAGE_CHART_SEGMENT_COLORS = [
    `var(--color-usage-chart-1)`,
    `color-mix(in oklab, var(--color-usage-chart-1) 78%, var(--color-surface))`,
    `color-mix(in oklab, var(--color-usage-chart-1) 58%, var(--color-surface))`,
    `color-mix(in oklab, var(--color-usage-chart-1) 42%, var(--color-surface))`,
    `color-mix(in oklab, var(--color-usage-chart-1) 28%, var(--color-surface))`,
  ],
  USAGE_CONTEXT_PROGRESS_MAX = 100,
  CACHE_HIT_RATE_DISPLAY_THRESHOLD = 0.78;
function formatUsageTokenCountCompact(e: number, t: string, n: { maximumFractionDigits?: number } = {}) { // S3e
  return formatNumberCompact(t, e, n);
}
function formatContextUsageSummary({ locale: e, percent: t, size: n, used: r }: { locale: string; percent: number; size: number; used: number }) { // C3e
  let i = new Intl.NumberFormat(e, { maximumFractionDigits: 1, style: `percent` });
  return `${formatUsageTokenCountCompact(r, e)}/${formatUsageTokenCountCompact(n, e, { maximumFractionDigits: 0 })} (${i.format(t)})`;
}
function formatCacheHitRatePercent(e: number | null | undefined, t: string, n: { showBelowThreshold?: boolean } = {}) { // w3e
  return e == null || !Number.isFinite(e) || (!n.showBelowThreshold && e < CACHE_HIT_RATE_DISPLAY_THRESHOLD)
    ? null
    : new Intl.NumberFormat(t, { maximumFractionDigits: 1, style: `percent` }).format(
        Math.max(0, e),
      );
}
function resolveUsageChartSegmentStyle(e: number) { // T3e
  return { backgroundColor: USAGE_CHART_SEGMENT_COLORS[Math.min(e, USAGE_CHART_SEGMENT_COLORS.length - 1)] ?? USAGE_CHART_SEGMENT_COLORS[0] };
}
var CONTEXT_USAGE_BREAKDOWN_LABEL_I18N_IDS: Record<string, string> = {
    messages: `chat.contextUsage.breakdown.messages`,
    system_prompt: `chat.contextUsage.breakdown.systemPrompt`,
    meta_user_context: `chat.contextUsage.breakdown.metaUserContext`,
    skills: `chat.contextUsage.breakdown.skills`,
    tool_prompt: `chat.contextUsage.breakdown.toolPrompt`,
    system_tool_schemas: `chat.contextUsage.breakdown.systemTools`,
    mcp_tool_schemas: `chat.contextUsage.breakdown.mcpTools`,
  },
  CONTEXT_USAGE_BREAKDOWN_SOURCE_ORDER: Record<string, number> = {
    messages: 0,
    system_prompt: 1,
    meta_user_context: 2,
    skills: 3,
    tool_prompt: 4,
    system_tool_schemas: 5,
    mcp_tool_schemas: 6,
  };
function aggregateContextUsageBreakdown(e: Array<{ source: string; chars: number }> | null | undefined) { // O3e
  let t = new Map();
  for (let n of e ?? [])
    !Number.isFinite(n.chars) || n.chars <= 0 || t.set(n.source, (t.get(n.source) ?? 0) + n.chars);
  let n = [...t.values()].reduce((e, t) => e + t, 0);
  return n <= 0
    ? []
    : [...t.entries()]
        .map(([e, t]) => ({ chars: t, percent: t / n, source: e }))
        .sort((e, t) => t.chars - e.chars || CONTEXT_USAGE_BREAKDOWN_SOURCE_ORDER[e.source] - CONTEXT_USAGE_BREAKDOWN_SOURCE_ORDER[t.source]);
}
function buildContextUsageProgressSegments(e: Array<{ chars: number; percent: number; source: string }>) { // k3e
  return e.map((e, t) => ({ id: e.source, percent: e.percent, style: resolveUsageChartSegmentStyle(t) }));
}
/** 任务上下文用量（原 j3e prop n / iit 4625 区 je 构造同形） */
interface ContextTaskUsageLike {
  used: number;
  size: number;
  cache?: { hitRate?: number | null } | null;
  breakdown?: Array<{ source: string; chars: number }> | null;
}
function sanitizeContextTaskUsage(e: ContextTaskUsageLike | null | undefined) { // A3e
  return !e || !Number.isFinite(e.used) || !Number.isFinite(e.size) || e.used <= 0 || e.size <= 0
    ? null
    : e;
}

/* --- §V.7 usage 工具条本体（原 j3e 76678–76847） --- */

interface CodingPlanUsageToolbarProps {
  codingPlanUsageRemaining?: CodingPlanUsageRemainingLike | null;
  startPlanBalance?: StartPlanBalanceLike | null;
  taskUsage?: ContextTaskUsageLike | null;
  selectedProvider?: unknown;
  intl: IntlShape;
  locale: string;
  onSendCompressionCommand?: (() => void) | null; // iit 89918 透传面；bundle j3e 不解构
  compressionDisabled?: boolean; // 同上
}
function CodingPlanUsageToolbar({
  codingPlanUsageRemaining: e,
  startPlanBalance: t,
  taskUsage: n,
  selectedProvider: r,
  intl: i,
  locale: a,
}: CodingPlanUsageToolbarProps) { // j3e
  let [o, s] = (0, React.useState)(!1),
    c = sanitizeContextTaskUsage(n),
    l = (0, React.useMemo)(
      () =>
        e?.onUsageClick
          ? { ...e, onUsageClick: () => runActionAndClose({ action: e.onUsageClick, close: () => s(!1) }) }
          : e,
      [e],
    ),
    u = (0, React.useMemo)(() => {
      if (t)
        return t.onUpgradeClick
          ? {
              ...t,
              onUpgradeClick: () => {
                (s(!1), t.onUpgradeClick?.());
              },
            }
          : t;
    }, [t]),
    d = l ? hasCodingPlanUsageRemaining(l) : !1,
    f = hasStartPlanBalanceDisplay(u),
    p = (0, React.useMemo)(() => new Intl.NumberFormat(a), [a]),
    m = (0, React.useMemo)(
      () =>
        c
          ? i.formatMessage(
              { id: `chat.contextUsage` },
              { used: p.format(c.used), total: p.format(c.size) },
            )
          : null,
      [i, p, c],
    ),
    h = (0, React.useMemo)(() => formatCacheHitRatePercent(c?.cache?.hitRate, a, { showBelowThreshold: !1 }), [a, c]),
    g = (0, React.useMemo)(() => aggregateContextUsageBreakdown(c?.breakdown), [c?.breakdown]),
    _ = (0, React.useMemo)(() => buildContextUsageProgressSegments(g), [g]),
    v = (0, React.useMemo)(
      () => new Intl.NumberFormat(a, { maximumFractionDigits: 1, style: `percent` }),
      [a],
    );
  if ((!c || !m) && !d && !f) return null;
  let y = c ? Math.min(Math.max(c.used / c.size, 0), 1) : 0,
    b = c ? formatContextUsageSummary({ locale: a, percent: y, size: c.size, used: c.used }) : null,
    x =
      m ??
      (d
        ? i.formatMessage({ id: `sidebar.usage.plan.title` })
        : i.formatMessage({ id: `settings.modelProvider.startPlan.balance.title` }));
  return (0, $.jsxs)(ContextUsageProvider, {
    usedTokens: c?.used ?? 0,
    maxTokens: c?.size ?? 1,
    open: o,
    onOpenChange: s,
    children: [
      (0, $.jsx)(ContextRingTrigger, {
        "aria-label": x,
        className: `text-foreground-subtle`,
        "data-chat-toolbar-popover-trigger": `true`,
        "data-testid": chatContextUsageTriggerTestid,
      }),
      (0, $.jsx)(ContextRingTooltipContent, {
        className: `!w-80 !rounded-xl !shadow-md`,
        side: `top`,
        sideOffset: 2,
        children: (0, $.jsxs)(ContextRingTooltipBody, {
          className: `space-y-3`,
          children: [
            c && b
              ? (0, $.jsxs)(`div`, {
                  className: `space-y-2`,
                  children: [
                    (0, $.jsxs)(`div`, {
                      className: `flex min-w-0 mb-3 items-center gap-3`,
                      children: [
                        (0, $.jsx)(`span`, {
                          className: `shrink-0 text-ui-base font-medium text-foreground`,
                          children: i.formatMessage({ id: `chat.contextUsage.title` }),
                        }),
                        (0, $.jsx)(`span`, {
                          className: `ml-auto shrink-0 text-right font-mono text-ui-sm text-foreground-subtle`,
                          children: b,
                        }),
                      ],
                    }),
                    (0, $.jsx)(SegmentedProgress, {
                      className: `h-2 bg-surface`,
                      indicatorClassName: `min-w-2`,
                      segments: _,
                      value: y * USAGE_CONTEXT_PROGRESS_MAX,
                    }),
                  ],
                })
              : null,
            c && (g.length > 0 || h)
              ? (0, $.jsxs)($.Fragment, {
                  children: [
                    g.length > 0
                      ? (0, $.jsx)(`div`, {
                          "aria-label": i.formatMessage({ id: `chat.contextUsage.breakdown` }),
                          className: `space-y-1.5`,
                          children: (0, $.jsx)(`div`, {
                            className: `grid gap-1.5`,
                            children: g.map((e, t) =>
                              (0, $.jsxs)(
                                `div`,
                                {
                                  className: `flex min-w-0 items-center gap-2 text-ui-sm`,
                                  children: [
                                    (0, $.jsx)(`span`, {
                                      "aria-hidden": `true`,
                                      className: `size-2 shrink-0 rounded-sm border border-border`,
                                      style: resolveUsageChartSegmentStyle(t),
                                    }),
                                    (0, $.jsx)(`span`, {
                                      className: `min-w-0 truncate text-foreground-subtle`,
                                      children: i.formatMessage({ id: CONTEXT_USAGE_BREAKDOWN_LABEL_I18N_IDS[e.source] }),
                                    }),
                                    (0, $.jsx)(`span`, {
                                      className: `ml-auto min-w-10 shrink-0 text-right font-mono text-ui-sm tabular-nums text-foreground`,
                                      children: v.format(e.percent),
                                    }),
                                  ],
                                },
                                e.source,
                              ),
                            ),
                          }),
                        })
                      : null,
                    h
                      ? (0, $.jsxs)(`div`, {
                          className: cn(
                            `flex items-center justify-between gap-3 text-ui-sm`,
                            g.length > 0 && `border-t border-border pt-3`,
                          ),
                          children: [
                            (0, $.jsx)(`span`, {
                              className: `text-foreground-subtle`,
                              children: i.formatMessage({ id: `chat.contextUsage.cacheHitRate` }),
                            }),
                            (0, $.jsx)(`span`, {
                              className: `font-mono text-ui-sm text-foreground`,
                              children: h,
                            }),
                          ],
                        })
                      : null,
                  ],
                })
              : null,
            l && d
              ? (0, $.jsx)(CodingPlanUsagePanel, { config: l, intl: i, locale: a, separated: !!(c && b) })
              : null,
            u && f
              ? (0, $.jsx)(StartPlanBalancePanel, { config: u, intl: i, locale: a, separated: !!((c && b) || d) })
              : null,
          ],
        }),
      }),
    ],
  });
}

/**
 * composer 输入区（原 ZV，F08 根组件，js 66959–~69297；接口保留）。
 * Lexical 富文本：@提及节点/斜杠面板/附件/工具条接线都在此实现。
 */

/* --- 5.1 hit 前置纯函数（原 dit/fit/pit/mit/_it） --- */

/** 原 dit：外部插入请求应用（提及优先：setMention，否则 setText） */
export function applyExternalTextInsertRequest({
  appliedRequestId,
  inputApi,
  request,
  requestFocus,
  scheduleDraftPersist,
  updateText,
}: {
  appliedRequestId: string | null;
  inputApi: ComposerInputApi | null;
  request: { requestId: string; text: string; mention?: ComposerMentionPayload } | null;
  requestFocus: () => void;
  scheduleDraftPersist: () => void;
  updateText: (text: string) => void;
}): string | null {
  if (!request || request.requestId === appliedRequestId || !inputApi) return appliedRequestId;
  if (request.mention && request.text.startsWith(request.mention.markdown)) {
    inputApi.setMention?.(request.mention, request.text.slice(request.mention.markdown.length));
  } else {
    inputApi.setText(request.text);
  }
  updateText(request.text);
  scheduleDraftPersist();
  requestFocus();
  return request.requestId;
}

/** 原 fit：composer 恢复请求应用（会话/工作区匹配且当前无内容时才恢复） */
export function applyComposerRestoreRequest({
  appliedRequestId,
  currentSessionId,
  currentWorkspaceKey,
  hasDraftContent,
  inputApi,
  request,
  requestFocus,
  restoreSessionOwnedAttachments,
  scheduleDraftPersist,
  updateText,
}: {
  appliedRequestId: string | null;
  currentSessionId: string | null;
  currentWorkspaceKey: string;
  hasDraftContent: boolean;
  inputApi: ComposerInputApi | null;
  request: {
    requestId: string;
    sessionId: string | null;
    workspaceKey: string;
    text: string;
    attachments: ComposerAttachment[];
  } | null;
  requestFocus: () => void;
  restoreSessionOwnedAttachments: (attachments: ComposerAttachment[]) => boolean;
  scheduleDraftPersist: () => void;
  updateText: (text: string) => void;
}): string | null {
  if (
    !request ||
    request.requestId === appliedRequestId ||
    request.sessionId !== currentSessionId ||
    request.workspaceKey !== currentWorkspaceKey ||
    hasDraftContent ||
    !inputApi ||
    !restoreSessionOwnedAttachments(request.attachments)
  ) {
    return appliedRequestId;
  }
  inputApi.setText(request.text);
  updateText(request.text);
  scheduleDraftPersist();
  requestFocus();
  return request.requestId;
}

/** 原 pit：字符串数组相等 */
export function areStringArraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

/** 原 mit：行数本地化格式（剪贴板文本附件描述用） */
export function formatLineCount(entry: { lineCount?: number }, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
    typeof entry.lineCount === "number" ? entry.lineCount : 0,
  );
}

/** 原 _it：事件是否落在对话框内（R0 的 Escape 处理用，js 120831） */
export function isEventInsideDialog(event: Event): boolean {
  if (event.defaultPrevented) return true;
  return event.composedPath().some((node) => {
    if (!node || typeof node !== "object") return false;
    const element = node as HTMLElement;
    return element.dataset?.slot === "dialog-content" || element.getAttribute?.("role") === "dialog";
  });
}

/** 草稿作用域：无会话时的占位 sessionId（原 `__draft__`） */
export const DRAFT_SCOPE_SESSION_ID = "__draft__";
/** 草稿持久化防抖（原 350ms） */
const DRAFT_PERSIST_DEBOUNCE_MS = 350;

export interface DraftComposerRegionProps {
  snapshot: ComposerSnapshot | null;
  sessionId?: string | null;
  /** Home 草稿态（R0 draftMode 传入 true） */
  draftMode?: boolean;
  draftConfig?: ComposerConfig | null;
  telemetryDraftConfig?: ComposerConfig | null;
  /** 上下文头（工作区行+分支 chip；draft 态渲染在输入面顶部） */
  contextHeader?: React.ReactNode;
  /** draft 态居中 + 限宽 max-w-2xl */
  centered?: boolean;
  blockingRequestId?: string | null;
  disabled?: boolean;
  autoFocusEnabled?: boolean;
  isWebRemoteControl?: boolean;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  attachmentSessionId?: string | null;
  attachmentPut?: unknown;
  onRuntimeRestart?: () => void;
  provider?: string | null;
  telemetryVisible?: boolean;
  readPlanIdentitySnapshot?: () => unknown;
  onSendText: (
    text: string,
    opts: {
      telemetrySeed: unknown;
      heldQueueDisposition?: "clearQueueAndSend" | "keepQueueAndSend";
      expectedHeldQueueItemIds?: string[];
      attachments?: unknown[];
      contextAttachmentCount?: number;
    },
  ) => Promise<"sent" | "blocked" | "confirmationRequired">;
  onTextChange?: (text: string) => void;
  onDraftStateChange?: (state: { hasContent: boolean; busy: boolean }) => void;
  onStop: () => void;
  onSelectModel: (model: string) => void;
  onSelectThought: (thought: string) => void;
  onSwitchMode: (mode: string) => void;
  onOpenRunningBackgroundWorks?: () => void;
  runningSubagentCount?: number;
  onRecoverCustomModelSelection?: () => void;
  onSendCompressionCommand?: () => void;
  error?: ChatError | null;
  onDismissError?: () => void;
  onOpenModelSettings?: () => void;
  onOpenModelUpgrade?: () => void;
  onOpenCodeViewer?: (args: unknown) => void;
  listenAddToChatEvents?: boolean;
  externalTextInsertRequest?: { requestId: string; text: string; mention?: ComposerMentionPayload } | null;
  onExternalTextInsertApplied?: (requestId: string) => void;
  composerRestoreRequest?: {
    requestId: string;
    sessionId: string | null;
    workspaceKey: string;
    text: string;
    attachments: ComposerAttachment[];
  } | null;
  onComposerRestoreApplied?: (requestId: string) => void;
  suppressGoalCommands?: boolean;
  appSlashCommands?: unknown[];
  onDropTargetControllerChange?: (controller: {
    active: boolean;
    kind: "attachment" | "workspace" | null;
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  } | null) => void;
}

/**
 * 原 hit（js 90180–91174 / jsx 78144）。逐行转录。
 * 结构：
 *   div.chat-composer-region（data-testid=v4-composer，@container/composer，draft 态 max-w-2xl）
 *     ├─ 隐藏 <input type=file>（附件选择）
 *     ├─ 错误横幅（vWe）
 *     ├─ div.chat-composer-input-surface（contextHeader 存在时 rounded-2xl bg-surface shadow-xl/5）
 *     │    ├─ contextHeader 行（p-1.5 flex flex-wrap）
 *     │    ├─ 会话选择限额告警（chat.selections.limit.*）
 *     │    ├─ ComposerInput（ZV：富文本输入 + 提及/斜杠面板）
 *     │    └─ 附件错误提示（info 图标 + 文案）
 *     ├─ 附件预览对话框（DN）
 *     └─ 队列发送确认对话框（chat.queue.sendConfirm.*：清空并发送/保留并发送）
 */
export function DraftComposerRegion({
  snapshot,
  sessionId = null,
  draftMode = false,
  draftConfig,
  telemetryDraftConfig,
  contextHeader,
  centered = false,
  blockingRequestId = null,
  disabled = false,
  autoFocusEnabled = true,
  isWebRemoteControl = false,
  workspacePath,
  workspaceIdentity,
  remoteSessionId,
  attachmentSessionId = null,
  attachmentPut,
  onRuntimeRestart,
  provider,
  telemetryVisible = true,
  readPlanIdentitySnapshot,
  onSendText,
  onTextChange,
  onDraftStateChange,
  onStop,
  onSelectModel,
  onSelectThought,
  onSwitchMode,
  onOpenRunningBackgroundWorks,
  runningSubagentCount = 0,
  onRecoverCustomModelSelection,
  onSendCompressionCommand,
  error,
  onDismissError,
  onOpenModelSettings,
  onOpenModelUpgrade,
  onOpenCodeViewer,
  listenAddToChatEvents = true,
  externalTextInsertRequest = null,
  onExternalTextInsertApplied,
  composerRestoreRequest = null,
  onComposerRestoreApplied,
  suppressGoalCommands = false,
  appSlashCommands,
  onDropTargetControllerChange,
}: DraftComposerRegionProps) {
  const { intl, locale } = useIntlContext();
  const platformContext = usePlatformContext();
  const telemetry = useComposerTelemetry({
    workspacePath,
    ...(workspaceIdentity ? { workspaceIdentity } : {}),
    ...(remoteSessionId ? { remoteSessionId } : {}),
  });
  const providerEndpoints = React.useSyncExternalStore(subscribeProviderEndpoints, getProviderEndpointsSnapshot, getProviderEndpointsSnapshot);
  const scopeSessionId = sessionId ?? DRAFT_SCOPE_SESSION_ID;
  const workspaceKey = workspaceIdentity?.trim() || workspacePath;
  const draftScopeKey = `${workspaceKey}\0${scopeSessionId}`;
  const [text, setTextState] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [pickerScope, setPickerScope] = React.useState<{ scopeKey: string; activePicker: ComposerConfigPicker }>(() => ({
    scopeKey: draftScopeKey,
    activePicker: null,
  }));
  // 作用域变化时重置选择器状态
  if (pickerScope.scopeKey !== draftScopeKey) setPickerScope({ scopeKey: draftScopeKey, activePicker: null });
  const activeConfigPicker = pickerScope.scopeKey === draftScopeKey ? pickerScope.activePicker : null;
  const handleConfigPickerOpenChange = React.useCallback(
    (picker: ComposerConfigPicker, open: boolean) => {
      setPickerScope((prev) =>
        prev.scopeKey === draftScopeKey
          ? { scopeKey: prev.scopeKey, activePicker: mergeConfigPickerState(prev.activePicker, picker, open) }
          : prev,
      );
    },
    [draftScopeKey],
  );
  // 队列发送确认状态（原 _e/ve，js 90250）
  const [queueConfirmState, setQueueConfirmState] = React.useState<{ telemetrySeed: unknown; queueItemIds: string[] } | null>(null);
  const [previewAttachment, setPreviewAttachment] = React.useState<{ filename: string; mediaType: string; url: string } | null>(null);
  const textRef = React.useRef("");
  const submitInFlightRef = React.useRef(false);
  const snapshotRef = React.useRef(snapshot);
  snapshotRef.current = snapshot;
  const inputApiRef = React.useRef<ComposerInputApi | null>(null);
  const reportedErrorKeysRef = React.useRef(new Set<string>());
  const isMobileTextInputViewport = useMobileTextInputViewport();
  const enterSubmits = resolveEnterSubmits({ isMobileTextInputViewport, preferEnterNewline: isWebRemoteControl });
  const avoidIosInputFocusZoom = shouldAvoidIosInputFocusZoom({ isMobileTextInputViewport, isWebRemoteControl });
  const compactNewTask = isWebRemoteControl && isMobileTextInputViewport;
  const submitShortcut = resolveSubmitShortcut({ enterSubmits });
  const updateText = React.useCallback(
    (next: string) => {
      textRef.current = next;
      setTextState(next);
      onTextChange?.(next);
    },
    [onTextChange],
  );
  const whiteboardScope = useWhiteboardAttachmentScope({
    workspacePath,
    workspaceIdentity,
    remoteSessionId,
    scopeId: scopeSessionId,
    attachmentSessionId,
    attachmentPut,
    onRuntimeRestart,
    disabled,
  });
  const { externalFileDragging, workspaceFileDragging } = useFileDragDetection({
    enableExternalFileDrop: true,
    enableWorkspaceFileDrop: true,
  });
  const handleDragOver = React.useCallback(
    (event: React.DragEvent) => {
      whiteboardScope.handleDragOverComposer(event);
    },
    [whiteboardScope.handleDragOverComposer],
  );
  const handleDragLeave = React.useCallback(
    (event: React.DragEvent) => {
      whiteboardScope.handleDragLeaveComposer(event);
    },
    [whiteboardScope.handleDragLeaveComposer],
  );
  const handleDrop = React.useCallback(
    (event: React.DragEvent) => {
      const payload = parseAddToChatPayload(event.dataTransfer);
      if (payload) {
        event.preventDefault();
        whiteboardScope.handleDropComposer(event);
        insertAddToChatPayload({
          inputApiRef,
          currentMarkdown: inputApiRef.current?.getMarkdown() ?? textRef.current,
          payload,
          workspacePath,
          workspaceIdentity,
          onTextChange: updateText,
        });
        return;
      }
      whiteboardScope.handleDropComposer(event);
    },
    [whiteboardScope.handleDropComposer, updateText, workspaceIdentity, workspacePath],
  );
  const dragKind = workspaceFileDragging
    ? "workspace"
    : externalFileDragging
      ? "attachment"
      : (whiteboardScope.composerDragKind ?? (whiteboardScope.isDraggingOverComposer ? "attachment" : null));
  const dropTargetController = React.useMemo(
    () => ({ active: dragKind !== null, kind: dragKind, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop }),
    [dragKind, handleDragLeave, handleDragOver, handleDrop],
  );
  React.useEffect(() => {
    onDropTargetControllerChange?.(dropTargetController);
    return () => onDropTargetControllerChange?.(null);
  }, [dropTargetController, onDropTargetControllerChange]);

  const attachmentOpenLabel = intl.formatMessage({ id: "chat.attachments.preview.open" });
  const hasAttachments = whiteboardScope.hasAttachments;
  const { contexts: webContexts, hasContexts: hasWebContexts, removeContext: removeWebContext, clearContexts: clearWebContexts } = useWebElementContexts({ // A1-R21：原 useWebContexts declare 改指（ZXe 68940）
    workspacePath,
    workspaceIdentity,
    listenAddToChatEvents: listenAddToChatEvents && !disabled,
    scopeId: scopeSessionId,
  });
  const { references: pptxReferences, hasReferences: hasPptxReferences, removeReference: removePptxReference, clearReferences: clearPptxReferences } = usePptxElementReferences({ // A1-R21：原 usePptxReferences declare 改指（QXe 68996）
    workspacePath,
    workspaceIdentity,
    remoteSessionId,
    listenAddToChatEvents: listenAddToChatEvents && !disabled,
    scopeId: scopeSessionId,
  });
  const openCodeCommentViewer = usePptxPreviewOpener({ workspacePath, workspaceIdentity, remoteSessionId, onOpenCodeViewer }); // A1-R21：原 useCodeCommentOpener declare 改指（YH 69207）
  const {
    references: conversationSelections,
    limitReason: selectionLimitReason,
    removeReference: removeConversationSelection,
    clearReferences: clearConversationSelections,
  } = useSessionScopedReferences({ sessionId, workspaceKey }); // A1-R21：原 useConversationSelections declare 改指（tZe 69225）
  const hasConversationSelections = conversationSelections.length > 0;

  /* --- 草稿持久化（350ms 防抖；页签隐藏/失焦时立即落盘） --- */
  const scopeSessionIdRef = React.useRef(scopeSessionId);
  const draftTargetRef = React.useRef({ workspacePath, workspaceIdentity, scopeId: scopeSessionId });
  const persistTimerRef = React.useRef<number | null>(null);
  const suppressPersistRef = React.useRef(false);
  const buildDraftSnapshot = React.useCallback((): ComposerDraftSnapshot => {
    const draftText = textRef.current;
    let editorStateJson: string | undefined;
    try {
      const editorState = inputApiRef.current?.getEditorState();
      editorStateJson = editorState ? JSON.stringify(editorState.toJSON()) : undefined;
    } catch (err) {
      logger.warn(`[v4-composer] 草稿 editorState 序列化失败: ${String(err)}`);
    }
    return draftText.trim() ? { text: draftText, ...(editorStateJson ? { editorStateJson } : {}) } : { text: "" };
  }, []);
  const persistDraftNow = React.useCallback(
    (scopeId: string) => {
      if (suppressPersistRef.current) return;
      saveComposerDraft(workspacePath, workspaceIdentity, scopeId, buildDraftSnapshot());
    },
    [buildDraftSnapshot, workspaceIdentity, workspacePath],
  );
  const scheduleDraftPersist = React.useCallback(() => {
    if (typeof window > "u") return;
    if (persistTimerRef.current !== null) window.clearTimeout(persistTimerRef.current);
    persistTimerRef.current = window.setTimeout(() => {
      persistTimerRef.current = null;
      persistDraftNow(scopeSessionIdRef.current);
    }, DRAFT_PERSIST_DEBOUNCE_MS);
  }, [persistDraftNow]);

  /* --- 自动聚焦（草稿焦点版本变化 / 恢复 / 启用态变化） --- */
  const draftFocusVersion = useTaskStore((s) => s.getWorkspaceState(workspacePath, workspaceIdentity).draftFocusVersion);
  const focusPendingRef = React.useRef(false);
  const restoreAppliedRef = React.useRef<string | null>(null);
  const insertAppliedRef = React.useRef<string | null>(null);
  const autoFocusPolicyRef = React.useRef({ autoFocusEnabled, disabled, isMobileViewport: isMobileTextInputViewport });
  autoFocusPolicyRef.current = { autoFocusEnabled, disabled, isMobileViewport: isMobileTextInputViewport };
  const applyPendingFocus = React.useCallback(() => {
    if (
      focusPendingRef.current &&
      resolveAutoFocusPolicy(autoFocusPolicyRef.current) === "focus-now" &&
      inputApiRef.current
    ) {
      focusPendingRef.current = false;
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => inputApiRef.current?.focus());
      } else {
        inputApiRef.current.focus();
      }
    }
  }, []);
  const requestFocus = React.useCallback(() => {
    if (resolveAutoFocusPolicy(autoFocusPolicyRef.current) !== "skip") {
      focusPendingRef.current = true;
      applyPendingFocus();
    }
  }, [applyPendingFocus]);
  const handleContextRemoved = React.useCallback(
    (item: CodeCommentItem) => {
      removeCodeCommentEverywhere(item, platformContext?.broadcastService); // A1-R21：原 broadcastContextRemoved declare 改指（jXe 68628）
    },
    [platformContext?.broadcastService],
  );
  const {
    contexts: codeComments,
    hasContexts: hasCodeComments,
    removeContext: removeCodeComment,
    clearContexts: clearCodeComments,
    getContexts,
  } = useCodeCommentContexts({
    listenAddToChatEvents: listenAddToChatEvents && !disabled,
    onContextRemoved: handleContextRemoved,
    requestFocus,
    scopeKey: `${workspaceKey}\0${scopeSessionId}`,
  });

  /* --- composer 恢复请求（会话切换时把旧草稿搬回输入区） --- */
  React.useEffect(() => {
    if (!composerRestoreRequest) return;
    const apply = () => {
      const appliedId = applyComposerRestoreRequest({
        appliedRequestId: restoreAppliedRef.current,
        currentSessionId: sessionId,
        currentWorkspaceKey: workspaceKey,
        hasDraftContent:
          textRef.current.length > 0 ||
          whiteboardScope.attachments.length > 0 ||
          codeComments.length > 0 ||
          webContexts.length > 0 ||
          pptxReferences.length > 0 ||
          conversationSelections.length > 0,
        inputApi: inputApiRef.current,
        request: composerRestoreRequest,
        requestFocus,
        restoreSessionOwnedAttachments: whiteboardScope.restoreSessionOwnedAttachments,
        scheduleDraftPersist,
        updateText,
      });
      const justApplied = appliedId === composerRestoreRequest.requestId && restoreAppliedRef.current !== composerRestoreRequest.requestId;
      restoreAppliedRef.current = appliedId;
      if (justApplied) onComposerRestoreApplied?.(composerRestoreRequest.requestId);
      return appliedId === composerRestoreRequest.requestId;
    };
    if (apply() || typeof requestAnimationFrame !== "function") return;
    const rafId = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(rafId);
  }, [
    whiteboardScope.attachments.length,
    whiteboardScope.restoreSessionOwnedAttachments,
    codeComments.length,
    composerRestoreRequest,
    conversationSelections.length,
    onComposerRestoreApplied,
    requestFocus,
    scheduleDraftPersist,
    sessionId,
    updateText,
    webContexts.length,
    pptxReferences.length,
    workspaceKey,
  ]);

  /* --- 作用域切换：落盘旧草稿、恢复新草稿（跨工作区切换时尝试搬运） --- */
  React.useEffect(() => {
    const previous = draftTargetRef.current;
    const scopeChanged = previous.scopeId !== scopeSessionId || previous.workspacePath !== workspacePath || previous.workspaceIdentity !== workspaceIdentity;
    let carriedDraft: ComposerDraftSnapshot | null = null;
    if (scopeChanged && !suppressPersistRef.current) {
      if (persistTimerRef.current !== null) {
        window.clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      const draftSnapshot = buildDraftSnapshot();
      saveComposerDraft(previous.workspacePath, previous.workspaceIdentity, previous.scopeId, draftSnapshot);
      if (
        previous.scopeId === DRAFT_SCOPE_SESSION_ID &&
        scopeSessionId === DRAFT_SCOPE_SESSION_ID &&
        consumeDraftCarryOver({
          sourceWorkspacePath: previous.workspacePath,
          sourceWorkspaceIdentity: previous.workspaceIdentity,
          targetWorkspacePath: workspacePath,
          targetWorkspaceIdentity: workspaceIdentity,
        })
      ) {
        saveComposerDraft(workspacePath, workspaceIdentity, scopeSessionId, draftSnapshot);
        carriedDraft = draftSnapshot;
      }
    }
    scopeSessionIdRef.current = scopeSessionId;
    draftTargetRef.current = { workspacePath, workspaceIdentity, scopeId: scopeSessionId };
    const storedDraft = carriedDraft ?? loadComposerDraft(workspacePath, workspaceIdentity, scopeSessionId);
    const restoreInto = (api: ComposerInputApi) => {
      if (!storedDraft) {
        if (textRef.current) {
          api.clear();
          updateText("");
        }
        return;
      }
      if (storedDraft.editorStateJson) {
        try {
          api.setEditorStateJson(storedDraft.editorStateJson);
          updateText(api.getMarkdown());
          return;
        } catch (err) {
          logger.warn(`[v4-composer] 草稿 editorState 恢复失败，退纯文本: ${String(err)}`);
        }
      }
      api.setText(storedDraft.text);
      updateText(storedDraft.text);
    };
    const restoreAndFocus = () => {
      const api = inputApiRef.current;
      if (api) {
        restoreInto(api);
        requestFocus();
      }
    };
    if (typeof requestAnimationFrame === "function") {
      const rafId = requestAnimationFrame(restoreAndFocus);
      return () => cancelAnimationFrame(rafId);
    }
    restoreAndFocus();
  }, [scopeSessionId, persistDraftNow, requestFocus, buildDraftSnapshot, updateText, workspaceIdentity, workspacePath]);

  /* --- 外部文本插入请求（如侧栏「添加到任务」） --- */
  React.useEffect(() => {
    if (!externalTextInsertRequest) return;
    const apply = () => {
      const appliedId = applyExternalTextInsertRequest({
        appliedRequestId: insertAppliedRef.current,
        inputApi: inputApiRef.current,
        request: externalTextInsertRequest,
        requestFocus,
        scheduleDraftPersist,
        updateText,
      });
      const justApplied = appliedId === externalTextInsertRequest.requestId;
      insertAppliedRef.current = appliedId;
      if (justApplied) onExternalTextInsertApplied?.(externalTextInsertRequest.requestId);
      return justApplied;
    };
    if (apply() || typeof requestAnimationFrame !== "function") return;
    const rafId = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(rafId);
  }, [externalTextInsertRequest, onExternalTextInsertApplied, requestFocus, scheduleDraftPersist, updateText]);

  /* --- 焦点版本 / 禁用态 / 页面隐藏落盘 --- */
  const lastFocusVersionRef = React.useRef(draftFocusVersion);
  React.useEffect(() => {
    if (lastFocusVersionRef.current !== draftFocusVersion) {
      lastFocusVersionRef.current = draftFocusVersion;
      requestFocus();
    }
  }, [draftFocusVersion, requestFocus]);
  React.useEffect(() => {
    applyPendingFocus();
  }, [disabled, applyPendingFocus]);
  React.useEffect(() => {
    if (typeof window > "u") return;
    const flush = () => persistDraftNow(scopeSessionIdRef.current);
    window.addEventListener("pagehide", flush);
    window.addEventListener("blur", flush);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("blur", flush);
      if (persistTimerRef.current !== null) {
        window.clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
    };
  }, [persistDraftNow]);

  const [promptHistory, setPromptHistory] = React.useState<string[]>(() => readPromptHistory(workspacePath));
  React.useEffect(() => {
    setPromptHistory(readPromptHistory(workspacePath));
  }, [workspacePath]);

  /* --- 提交可用性推导 --- */
  const inputRoutingMode = snapshot?.inputRouting?.mode ?? "startNow";
  const isTaskProcessing = !!snapshot?.control.canStop;
  const hasSubmittableContent =
    text.trim().length > 0 || hasAttachments || hasCodeComments || hasWebContexts || hasPptxReferences || hasConversationSelections;
  const hasAnyContent =
    text.length > 0 || hasAttachments || hasCodeComments || hasWebContexts || hasPptxReferences || hasConversationSelections;
  React.useEffect(() => {
    onDraftStateChange?.({ hasContent: hasAnyContent, busy: submitting });
  }, [hasAnyContent, onDraftStateChange, submitting]);
  const canSubmitNow = draftMode || (snapshot !== null && inputRoutingMode !== "reject");
  const attachmentsReady = !whiteboardScope.hasUnreadyAttachments;
  const submitEnabled = !disabled && !submitting && hasSubmittableContent && canSubmitNow && attachmentsReady;
  const showStopButton = isTaskProcessing && !hasSubmittableContent;

  /* --- 发送（含队列确认、提示词历史、遥测、草稿清理） --- */
  const handleSubmit = React.useCallback(
    async (
      heldQueueDisposition?: "clearQueueAndSend" | "keepQueueAndSend",
      expectedHeldQueueItemIds?: string[],
      telemetrySeedOverride?: { sendTime: number; extraDetail: Record<string, unknown> },
    ) => {
      const draftText = textRef.current.trim();
      const heldQueueItemIdsBefore = snapshotRef.current?.queue.items.map((item) => item.queueItemId) ?? [];
      const hasAttachmentsToSend = whiteboardScope.attachments.length > 0;
      const codeCommentsToSend = getContexts();
      const hasCodeCommentsToSend = codeCommentsToSend.length > 0;
      const webElementsToSend = webContexts;
      const hasWebElementsToSend = webElementsToSend.length > 0;
      const pptxElementsToSend = pptxReferences;
      const hasPptxElementsToSend = pptxElementsToSend.length > 0;
      const selectionsToSend = conversationSelections;
      const hasSelectionsToSend = selectionsToSend.length > 0;
      const submitScopeId = scopeSessionIdRef.current;
      const submitTarget = { ...draftTargetRef.current };
      const draftSnapshotAtSend = buildDraftSnapshot();
      if (
        (!draftText && !hasAttachmentsToSend && !hasCodeCommentsToSend && !hasWebElementsToSend && !hasPptxElementsToSend && !hasSelectionsToSend) ||
        submitInFlightRef.current ||
        whiteboardScope.hasUnreadyAttachments
      ) {
        return;
      }
      submitInFlightRef.current = true;
      setSubmitting(true);
      const effectiveConfig = snapshotRef.current?.config ?? telemetryDraftConfig ?? draftConfig;
      const telemetrySeed =
        telemetrySeedOverride ?? {
          sendTime: Date.now(),
          extraDetail: buildComposerTelemetryExtraDetail({
            askMode: effectiveConfig?.mode,
            modelName: effectiveConfig?.model,
            configProvider: effectiveConfig?.provider,
            agentProvider: provider,
            providerBaseURL: providerEndpoints.find((entry) => entry.id === effectiveConfig?.provider)?.endpoints.baseURL,
            planIdentitySnapshot: readPlanIdentitySnapshot?.(),
          }),
        };
      let historyBefore: string[] | null = null;
      let historyCandidate: string[] | null = null;
      let historyChanged = false;
      let historyPersisted = false;
      const clearPersistedDraft = () => {
        if (persistTimerRef.current !== null) {
          window.clearTimeout(persistTimerRef.current);
          persistTimerRef.current = null;
        }
        suppressPersistRef.current = true;
        clearComposerDraft(submitTarget.workspacePath, submitTarget.workspaceIdentity, submitScopeId);
        historyPersisted = true;
      };
      const rollbackDraft = () => {
        if (historyPersisted) {
          saveComposerDraft(submitTarget.workspacePath, submitTarget.workspaceIdentity, submitScopeId, draftSnapshotAtSend);
          suppressPersistRef.current = false;
        }
      };
      const commitDraftCleared = () => {
        if (historyPersisted) {
          clearComposerDraft(submitTarget.workspacePath, submitTarget.workspaceIdentity, submitScopeId);
          suppressPersistRef.current = false;
        }
      };
      const maybePersistPromptHistory = () => {
        if (!historyChanged || historyBefore === null || historyCandidate === null) return;
        const currentHistory = readPromptHistory(workspacePath);
        if (areStringArraysEqual(currentHistory, historyCandidate)) {
          writePromptHistory(workspacePath, historyBefore);
          setPromptHistory(historyBefore);
          return;
        }
        setPromptHistory(currentHistory);
      };
      try {
        const preparedAttachments = await whiteboardScope.prepareForSend();
        if (preparedAttachments === null) return;
        const outgoingText = buildOutboundContentWithAttachments(draftText, { // A1-R21：原 buildOutgoingMessage declare 改指（GXe 68833）
          codeComments: codeCommentsToSend,
          conversationSelections: selectionsToSend,
          webElements: webElementsToSend,
          pptxElements: pptxElementsToSend,
        });
        const contextAttachmentCount = countContextAttachments({
          codeComments: codeCommentsToSend,
          conversationSelections: selectionsToSend,
          webElements: webElementsToSend, // 〔A1-R21〕双钩子收敛后 webContexts 即 WebElementContext[]，原 `as unknown as WebElementContext[]` 强转删除
          pptxElements: pptxElementsToSend,
        });
        if (draftText) {
          historyBefore = readPromptHistory(workspacePath);
          historyCandidate = appendPromptHistoryEntry(historyBefore, draftText);
          if (!areStringArraysEqual(historyBefore, historyCandidate)) {
            writePromptHistory(workspacePath, historyCandidate);
            historyChanged = true;
            setPromptHistory(historyCandidate);
          }
        }
        clearPersistedDraft();
        const sendResult = await onSendText(outgoingText, {
          telemetrySeed,
          ...(heldQueueDisposition ? { heldQueueDisposition } : {}),
          ...(expectedHeldQueueItemIds ? { expectedHeldQueueItemIds } : {}),
          ...(preparedAttachments.length > 0 ? { attachments: preparedAttachments } : {}),
          ...(contextAttachmentCount > 0 ? { contextAttachmentCount } : {}),
        });
        if (sendResult === "blocked") {
          maybePersistPromptHistory();
          rollbackDraft();
          return;
        }
        if (sendResult === "confirmationRequired") {
          maybePersistPromptHistory();
          rollbackDraft();
          const heldQueueItemIds = snapshotRef.current?.queue.items.map((item) => item.queueItemId) ?? [];
          setQueueConfirmState({ telemetrySeed, queueItemIds: heldQueueItemIds.length > 0 ? heldQueueItemIds : heldQueueItemIdsBefore });
          return;
        }
        setQueueConfirmState(null);
        await whiteboardScope.adoptSentAttachments();
        inputApiRef.current?.clear();
        updateText("");
        whiteboardScope.clearAttachments();
        clearCodeComments();
        clearWebContexts();
        clearPptxReferences();
        clearConversationSelections();
        commitDraftCleared();
      } catch (err) {
        maybePersistPromptHistory();
        rollbackDraft();
        logger.warn(`[v4-composer] 发送失败: ${String(err)}`);
      } finally {
        submitInFlightRef.current = false;
        setSubmitting(false);
      }
    },
    [
      whiteboardScope,
      clearCodeComments,
      clearConversationSelections,
      clearWebContexts,
      clearPptxReferences,
      conversationSelections,
      draftConfig,
      getContexts,
      telemetryDraftConfig,
      providerEndpoints,
      onSendText,
      provider,
      readPlanIdentitySnapshot,
      buildDraftSnapshot,
      updateText,
      webContexts,
      pptxReferences,
      workspaceIdentity,
      workspacePath,
    ],
  );

  const handleTextChange = React.useCallback(
    (next: string) => {
      telemetry?.recordComposerTextChange(next);
      updateText(next);
      scheduleDraftPersist();
    },
    [telemetry, scheduleDraftPersist, updateText],
  );
  const handleInputFocus = React.useCallback(() => {
    telemetry?.recordComposerFocus();
  }, [telemetry]);
  const handleEditorSubmit = React.useCallback(
    (nextText: string) => {
      textRef.current = nextText;
      handleSubmit();
      return false;
    },
    [handleSubmit],
  );
  const handleClearQueueAndSend = React.useCallback(() => {
    if (queueConfirmState) handleSubmit("clearQueueAndSend", queueConfirmState.queueItemIds, queueConfirmState.telemetrySeed as { sendTime: number; extraDetail: Record<string, unknown> });
  }, [queueConfirmState, handleSubmit]);
  const handleKeepQueueAndSend = React.useCallback(() => {
    if (queueConfirmState) handleSubmit("keepQueueAndSend", queueConfirmState.queueItemIds, queueConfirmState.telemetrySeed as { sendTime: number; extraDetail: Record<string, unknown> });
  }, [queueConfirmState, handleSubmit]);
  const handleStop = React.useCallback(() => {
    onStop();
  }, [onStop]);

  /* --- 「添加到任务」窗口事件 → 文本插入 --- */
  React.useEffect(() => {
    if (!listenAddToChatEvents || typeof window > "u") return;
    const listener = (event: Event) => {
      if (isAddToChatEvent(event)) {
        event.preventDefault();
        insertAddToChatPayload({
          inputApiRef,
          currentMarkdown: inputApiRef.current?.getMarkdown() ?? textRef.current,
          payload: (event as CustomEvent<AddToChatPayload>).detail,
          workspacePath,
          workspaceIdentity,
          onTextChange: updateText,
        });
      }
    };
    window.addEventListener(ADD_TO_CHAT_EVENT_NAME, listener);
    return () => {
      window.removeEventListener(ADD_TO_CHAT_EVENT_NAME, listener);
    };
  }, [listenAddToChatEvents, updateText, workspaceIdentity, workspacePath]);

  /* --- 文案 --- */
  const placeholder = intl.formatMessage({
    id: resolveComposerPlaceholderI18nId({
      hasHistoryMessages: (snapshot?.rows.totalCount ?? 0) > 0,
      isTaskProcessing,
      compactNewTask,
    }),
  });
  const submitLabel = intl.formatMessage({ id: inputRoutingMode === "enqueue" ? "chat.queue.enqueue" : "chat.send" });
  const stopLabel = intl.formatMessage({ id: "chat.stop" });
  const attachmentAddLabel = intl.formatMessage({ id: "chat.attachments.add" });
  const displayError = error && !isIgnorableChatError(error) ? error : null;

  /* --- 可见错误遥测（去重） --- */
  React.useEffect(() => {
    if (!displayError || !telemetry || !telemetryVisible) return;
    const errorKey = [displayError.taskId ?? sessionId ?? "", displayError.code ?? "", displayError.traceId ?? "", displayError.message].join(":");
    if (reportedErrorKeysRef.current.has(errorKey)) return;
    reportedErrorKeysRef.current.add(errorKey);
    telemetry.reportVisibleChatError({ errorKey, displayMessage: formatChatError(displayError, intl), error: displayError });
  }, [telemetry, intl, sessionId, telemetryVisible, displayError]);

  const attachmentAction = React.useMemo(
    () => ({ label: attachmentAddLabel, menuItemTestId: ATTACHMENT_MENU_ITEM_TESTID, onSelect: whiteboardScope.openAttachmentPicker, testId: ATTACHMENT_BUTTON_TESTID }),
    [attachmentAddLabel, whiteboardScope.openAttachmentPicker],
  );

  /* --- 输入区上方内容：上下文/引用/附件 chip 群 --- */
  const attachments = whiteboardScope.attachments;
  const topContent = React.useMemo(
    () =>
      attachments.length === 0 && codeComments.length === 0 && webContexts.length === 0 && pptxReferences.length === 0 && conversationSelections.length === 0
        ? null
        : (() => (
            <div className="flex max-w-full flex-wrap items-center gap-2">
              <CodeCommentsChip /* A1-R22：原 CodeCommentChipRow declare 改指（TH 68298） */ comments={codeComments} onRemove={removeCodeComment} onRemoveAll={clearCodeComments} />
              <WebElementsChip /* A1-R22：原 WebContextChipRow declare 改指（lit 89989） */ contexts={webContexts} onRemove={removeWebContext} onRemoveAll={clearWebContexts} />
              <PptxReferencesChip /* A1-R21：原 PptxReferenceChipRow declare 改指（JH 69036） */
                references={pptxReferences}
                onOpen={onOpenCodeViewer ? openCodeCommentViewer : undefined}
                onRemove={removePptxReference}
                onRemoveAll={clearPptxReferences}
              />
              <SelectionsChip /* A1-R22：原 ConversationSelectionChipRow declare 改指（uit 90087） */
                references={conversationSelections}
                onRemove={removeConversationSelection}
                onRemoveAll={clearConversationSelections}
              />
              {attachments.length > 0 ? (
                <AttachmentList variant="inline" className="max-w-full gap-2">
                  {attachments.map((attachment) => {
                    const isClipboardText = attachment.sourceKind === "clipboard-text";
                    const isImage = isImageAttachment(attachment);
                    const mediaType = attachment.objectUrl
                      ? attachment.mimeType
                      : attachment.mimeType.startsWith("image/")
                        ? "application/octet-stream"
                        : attachment.mimeType;
                    const canPreview = !!attachment.objectUrl && isImageAttachment(attachment);
                    const iconInfo = resolveFileIconInfo(attachment.localPath ?? attachment.filename);
                    const uploadStatusLabel =
                      attachment.uploadStatus === "uploading"
                        ? intl.formatMessage({ id: "chat.attachments.upload.uploading" }, { progress: String(attachment.uploadProgress) })
                        : attachment.uploadStatus === "failed"
                          ? intl.formatMessage({ id: "chat.attachments.upload.failed" }, { message: attachment.uploadError ?? "unknown" })
                          : intl.formatMessage({ id: `chat.attachments.upload.${attachment.uploadStatus}` });
                    const showUploadOverlay = !attachment.localZeroCopy && (attachment.uploadStatus !== "ready" || attachment.showComplete);
                    return (
                      <AttachmentCard
                        key={attachment.id}
                        data-testid={testidOf(ATTACHMENT_ITEM_TESTID, attachment.id)}
                        data-upload-status={attachment.uploadStatus}
                        data={{
                          id: attachment.id,
                          type: "file",
                          filename: attachment.filename,
                          ...(isClipboardText
                            ? {
                                description: intl.formatMessage(
                                  { id: "chat.attachments.clipboardText.description" },
                                  { lineCount: formatLineCount(attachment, locale) },
                                ),
                                displayName: intl.formatMessage({ id: "chat.attachments.clipboardText" }),
                                sourceKind: "clipboard-text",
                              }
                            : {}),
                          mediaType,
                          url: attachment.objectUrl ?? "",
                        }}
                        onRemove={() => whiteboardScope.removeAttachment(attachment.id)}
                        onOpen={canPreview ? () => setPreviewAttachment({ filename: attachment.filename, mediaType, url: attachment.objectUrl ?? "" }) : undefined}
                        openLabel={canPreview ? attachmentOpenLabel : undefined}
                      >
                        <div className="relative size-6 shrink-0">
                          <AttachmentCardIcon
                            className="size-6"
                            fallbackIcon={
                              isClipboardText ? (
                                <IconClipboardPenLine className="size-3.5 text-muted-foreground" />
                              ) : (
                                <FileIcon src={iconInfo.fileIconSrc} size={16} className="size-4 shrink-0" />
                              )
                            }
                          />
                          {showUploadOverlay && isImage ? (
                            <span
                              data-testid={testidOf(ATTACHMENT_UPLOAD_PROGRESS_TESTID, attachment.id)}
                              role={attachment.uploadStatus === "failed" ? "alert" : "status"}
                              aria-label={uploadStatusLabel}
                              className="absolute inset-0 grid place-items-center rounded bg-background/85 text-[7px] font-semibold text-foreground"
                            >
                              <svg aria-hidden="true" className="absolute inset-0 size-6 -rotate-90 text-brand" viewBox="0 0 24 24">
                                <circle className="stroke-border" cx="12" cy="12" fill="none" pathLength="100" r="9" strokeWidth="2" />
                                <circle
                                  className={attachment.uploadStatus === "failed" ? "stroke-destructive" : "stroke-current"}
                                  cx="12"
                                  cy="12"
                                  fill="none"
                                  pathLength="100"
                                  r="9"
                                  strokeDasharray={`${attachment.uploadProgress} 100`}
                                  strokeLinecap="round"
                                  strokeWidth="2"
                                />
                              </svg>
                              <span className="relative">{attachment.uploadStatus === "failed" ? "!" : `${attachment.uploadProgress}%`}</span>
                            </span>
                          ) : null}
                        </div>
                        <AttachmentCardName className="max-w-48 text-ui-base text-foreground" />
                        {showUploadOverlay && !isImage ? (
                          <span
                            data-testid={testidOf(ATTACHMENT_UPLOAD_PROGRESS_TESTID, attachment.id)}
                            role={attachment.uploadStatus === "failed" ? "alert" : "status"}
                            title={uploadStatusLabel}
                            className={cn(
                              "max-w-28 truncate text-ui-sm font-normal text-foreground-subtle",
                              attachment.uploadStatus === "failed" && "text-destructive",
                            ) as string}
                          >
                            {attachment.uploadStatus === "uploading" ? `${attachment.uploadProgress}%` : uploadStatusLabel}
                          </span>
                        ) : null}
                        {attachment.uploadStatus === "failed" ? (
                          <button
                            type="button"
                            data-testid={testidOf(ATTACHMENT_UPLOAD_RETRY_TESTID, attachment.id)}
                            aria-label={intl.formatMessage({ id: "chat.attachments.upload.retry" })}
                            title={uploadStatusLabel}
                            className="grid size-5 shrink-0 place-items-center rounded-md text-destructive hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              whiteboardScope.retryAttachment(attachment.id);
                            }}
                          >
                            <IconRotateCcw className="size-3" />
                          </button>
                        ) : null}
                        <AttachmentCardRemoveButton label={intl.formatMessage({ id: "chat.attachments.remove" })} />
                      </AttachmentCard>
                    );
                  })}
                </AttachmentList>
              ) : null}
            </div>
          ))(),
    [
      attachmentOpenLabel,
      whiteboardScope,
      clearCodeComments,
      clearConversationSelections,
      clearWebContexts,
      clearPptxReferences,
      codeComments,
      attachments,
      intl,
      locale,
      removeCodeComment,
      removeConversationSelection,
      removeWebContext,
      removePptxReference,
      conversationSelections,
      webContexts,
      pptxReferences,
      onOpenCodeViewer,
      openCodeCommentViewer,
    ],
  );

  /* --- 提交控件（右簇：配置工具条 + 停止/发送按钮） --- */
  const snapshotConfig = snapshot?.config ?? null;
  const snapshotUsage = snapshot?.usage ?? null;
  const snapshotPhase = snapshot?.control.phase ?? null;
  const submitControl = React.useMemo(
    () => (
      <div className="flex min-w-0 items-center gap-1">
        <span className="flex min-w-0 shrink items-center gap-1 overflow-hidden empty:hidden">
          <ComposerConfigToolbar
            workspacePath={workspacePath}
            workspaceIdentity={workspaceIdentity}
            sessionId={sessionId ?? null}
            phase={snapshotPhase}
            provider={provider}
            isWebRemoteControl={isWebRemoteControl}
            isMobileViewport={isMobileTextInputViewport}
            config={snapshotConfig}
            draftMode={draftMode}
            draftConfig={draftConfig}
            usage={snapshotUsage as ComposerUsageSnapshot | null}
            disabled={disabled}
            activeConfigPicker={activeConfigPicker}
            onConfigPickerOpenChange={handleConfigPickerOpenChange}
            onSelectModel={onSelectModel}
            onSelectThought={onSelectThought}
            onSwitchMode={onSwitchMode}
            onRecoverCustomModelSelection={onRecoverCustomModelSelection}
            onSendCompressionCommand={onSendCompressionCommand}
          />
        </span>
        {showStopButton ? (
          <Tooltip title={stopLabel} shortcut="Esc">
            <Button
              type="button"
              variant="secondary"
              size="icon-md"
              onClick={handleStop}
              data-testid={STOP_BUTTON_TESTID}
              aria-label={stopLabel}
            >
              <IconSquare className="size-4 fill-current" />
              <span className="sr-only">{stopLabel}</span>
            </Button>
          </Tooltip>
        ) : (
          <Tooltip title={submitLabel} shortcut={submitShortcut}>
            <Button
              type="submit"
              size="icon-md"
              disabled={!submitEnabled}
              data-testid={SEND_BUTTON_TESTID}
              aria-label={submitLabel}
              className="gap-1 rounded-lg bg-brand text-ui-base text-foreground-inverse hover:bg-brand/80"
            >
              {submitting ? <Spinner className="size-4" /> : <IconArrowUp className="size-4" />}
              <span className="sr-only">{submitLabel}</span>
            </Button>
          </Tooltip>
        )}
      </div>
    ),
    [
      submitEnabled,
      activeConfigPicker,
      snapshotConfig,
      snapshotPhase,
      snapshotUsage,
      disabled,
      draftConfig,
      draftMode,
      handleStop,
      handleConfigPickerOpenChange,
      isWebRemoteControl,
      inputRoutingMode,
      onSelectModel,
      onSelectThought,
      onRecoverCustomModelSelection,
      onSendCompressionCommand,
      onSwitchMode,
      submitting,
      provider,
      submitShortcut,
      submitLabel,
      sessionId,
      showStopButton,
      stopLabel,
      workspaceIdentity,
      workspacePath,
    ],
  );

  /* --- 前置动作（左簇：模式工具条 + 后台工作胶囊） --- */
  const leadingActions = React.useMemo(
    () => (
      <>
        <ComposerModeToolbar
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          provider={provider}
          config={snapshotConfig}
          draftMode={draftMode}
          draftConfig={draftConfig}
          disabled={disabled}
          activeConfigPicker={activeConfigPicker}
          onConfigPickerOpenChange={handleConfigPickerOpenChange}
          onSwitchMode={onSwitchMode}
        />
        <BackgroundWorksCapsule
          backgroundWorks={(snapshot?.backgroundWorks ?? []) as BackgroundWork[]}
          runningSubagentCount={runningSubagentCount}
          onOpen={onOpenRunningBackgroundWorks}
        />
      </>
    ),
    [snapshotConfig, activeConfigPicker, disabled, draftConfig, draftMode, handleConfigPickerOpenChange, onOpenRunningBackgroundWorks, onSwitchMode, provider, runningSubagentCount, snapshot?.backgroundWorks, workspaceIdentity, workspacePath],
  );

  const isBlocked = blockingRequestId !== null;

  return (
    <div
      data-testid={COMPOSER_REGION_TESTID}
      data-input-routing={inputRoutingMode}
      aria-hidden={isBlocked ? true : undefined}
      style={isBlocked ? { display: "none" } : undefined}
      className={cn("chat-composer-region z-20 w-full shrink-0 @container/composer", centered && "max-w-2xl") as string}
    >
      {/* 隐藏的附件文件选择器 */}
      <input
        ref={whiteboardScope.attachmentInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={whiteboardScope.handleAttachmentInputChange}
      />
      {displayError ? (
        <div className="mb-6 w-full shrink-0">
          <ChatErrorBanner error={displayError} onDismiss={onDismissError} onOpenModelSettings={onOpenModelSettings} onOpenUpgrade={onOpenModelUpgrade} />
        </div>
      ) : null}
      {/* 输入面（双层卡：有 contextHeader 时 rounded-2xl bg-surface shadow-xl/5） */}
      <div className={cn("chat-composer-input-surface w-full", contextHeader ? "rounded-2xl bg-surface shadow-xl/5" : undefined) as string}>
        {contextHeader ? (
          <div className="p-1.5 flex min-w-0 flex-wrap items-center gap-0">{contextHeader}</div>
        ) : null}
        {selectionLimitReason ? (
          <div
            role="alert"
            className="mb-2 w-full rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-3 py-2 text-ui-base text-foreground"
          >
            {intl.formatMessage({ id: `chat.selections.limit.${selectionLimitReason}` })}
          </div>
        ) : null}
        <ComposerInput
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          taskId={sessionId}
          placeholder={placeholder}
          disabled={disabled || inputRoutingMode === "reject"}
          submitting={submitting}
          submitDisabled={submitting || !canSubmitNow || !attachmentsReady}
          allowSubmitWhenEmpty={hasCodeComments || hasAttachments || hasWebContexts || hasPptxReferences || hasConversationSelections}
          enterSubmits={enterSubmits}
          submitLabel={submitLabel}
          showSlashButton
          showMentionButton
          topContent={topContent}
          attachmentAction={attachmentAction}
          inputTestId={COMPOSER_INPUT_TESTID}
          inputApiRef={inputApiRef as unknown as { current: ComposerEditorApi | null }}
          promptHistory={promptHistory}
          avoidIosInputFocusZoom={avoidIosInputFocusZoom}
          compactPlaceholder={compactNewTask}
          excludedSlashCommandNames={suppressGoalCommands ? ["goal"] : undefined}
          appSlashCommands={appSlashCommands as AppSlashCommand[]}
          enableMentionPanel
          leadingActions={leadingActions}
          submitControl={submitControl}
          className="p-0"
          onChange={handleTextChange}
          onFocus={handleInputFocus}
          onSubmit={handleEditorSubmit}
          onWhiteboardMentionSelected={whiteboardScope.handleWhiteboardMentionSelected}
          onPaste={whiteboardScope.handlePaste}
        />
        {whiteboardScope.attachmentError ? (
          <p className="flex items-start gap-2 p-3 text-ui-base text-warning">
            <IconInfo className="mt-0.5 size-4 shrink-0" />
            <span>{whiteboardScope.attachmentError}</span>
          </p>
        ) : null}
      </div>
      {/* 附件预览对话框 */}
      <AttachmentPreviewDialog
        attachment={previewAttachment}
        open={previewAttachment !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewAttachment(null);
        }}
      />
      {/* 队列发送确认对话框（有暂留队列项时二次确认：清空并发送 / 保留并发送） */}
      <Dialog
        open={queueConfirmState !== null}
        onOpenChange={(open) => {
          if (!open && !submitInFlightRef.current) setQueueConfirmState(null);
        }}
      >
        <DialogContent data-testid={PAUSED_QUEUE_SEND_DIALOG_TESTID} showCloseButton={false} className="max-w-xl gap-6 rounded-3xl p-6 sm:p-8">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              disabled={submitting}
              aria-label={intl.formatMessage({ id: "common.close" })}
              className="absolute top-4 right-4"
            >
              <IconClose className="size-5" />
            </Button>
          </DialogClose>
          <DialogHeader className="gap-3 pr-8">
            <DialogTitle className="text-xl font-semibold sm:text-2xl">
              {intl.formatMessage({ id: "chat.queue.sendConfirm.title" })}
            </DialogTitle>
            <DialogDescription className="text-ui-base sm:text-ui-lg">
              {intl.formatMessage({ id: "chat.queue.sendConfirm.description" }, { count: String(queueConfirmState?.queueItemIds.length ?? 0) })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="destructive"
              size="lg"
              data-testid={CLEAR_QUEUE_SEND_TESTID}
              disabled={submitting}
              className="min-w-32 rounded-full"
              onClick={handleClearQueueAndSend}
            >
              {intl.formatMessage({ id: "chat.queue.sendConfirm.clear" })}
            </Button>
            <Button
              type="button"
              size="lg"
              data-testid={KEEP_QUEUE_SEND_TESTID}
              disabled={submitting}
              className="min-w-32 rounded-full"
              onClick={handleKeepQueueAndSend}
            >
              {submitting ? <Spinner className="size-4" /> : null}
              {intl.formatMessage({ id: "chat.queue.sendConfirm.keep" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** 原 hit 的 memo 导出（js 91174：`var git = (0, Q.memo)(hit)`） */
export const DraftComposerRegionMemo = React.memo(DraftComposerRegion);

/* --- 5.2 hit 内的两个小推导函数（原文件其他位置，随族登记） --- */

/** 原 oit（89979–89981；A1-R24 归属实证：消费面 5842 ≡ bundle 90293 hit 内 oit(n.activePicker, e, t)）：配置选择器开合合并（作用域内单开） */
function mergeConfigPickerState(e: ComposerConfigPicker, t: ComposerConfigPicker, n: boolean): ComposerConfigPicker { // oit
  return n ? t : e === t ? null : e;
}

/**
 * 原 ZYe（js 67422）：placeholder 文案 key 选择：
 * 有历史消息+处理中 → chat.placeholder.followUpQueue；有历史消息 → followUpAsk；
 * 远控窄视口新任务 → newTaskMobile；否则 → chat.placeholder.newTask（spec §5：
 * 「向 ZCode 提问，使用 @ 添加上下文，使用 / 选择命令或能力」）
 */
export function resolveComposerPlaceholderI18nId({
  hasHistoryMessages,
  isTaskProcessing,
  compactNewTask = false,
}: {
  hasHistoryMessages: boolean;
  isTaskProcessing: boolean;
  compactNewTask?: boolean;
}): string {
  if (hasHistoryMessages) return isTaskProcessing ? "chat.placeholder.followUpQueue" : "chat.placeholder.followUpAsk";
  return compactNewTask ? "chat.placeholder.newTaskMobile" : "chat.placeholder.newTask";
}

/* 〔A1-R21〕双实例叠层专项裁定（编排方委托）：s3e/v3e bundle 唯一真身（76294/76540，styles 导出块
 * 213930 无面；唯一消费 = j3e@76837/76840）。树内逐字真身 = 本文件 §V.3 CodingPlanUsagePanel /
 * §V.5 StartPlanBalancePanel（R19 转录，机械校验在案）；UsageDeep A0 并行副本（SidebarCodingPlanWidget/
 * SidebarStartPlanWidget）降 shim，经 modules/UsageDeep 再导出本面（函数声明提升，环安全），
 * PaymentDeep 581/584 消费面不变。证据链见 A1-R21.report.md §三。
 * 〔A1-R23〕补注：PaymentDeep §1 消费面 581/584 已随 j3e 叠层专项删除（A0 副本簇全删，见
 * components/payments/PaymentDeep §1 墓碑）；modules/UsageDeep 再导出面同批移除（末位消费已逝）。
 * §V.3/§V.5 逐字 canonical 本体不变。 */
export { CodingPlanUsagePanel, StartPlanBalancePanel };

/* ============================================================================
 * 6. 接口保留清单（属其他族 / 体量大，未逐行展开；行号见 MODULE-MAP.md）
 *    - ZV  ComposerInput            F08 根组件（js 66959–~69297）：Lexical 引擎、
 *      提及节点、斜杠面板挂载、工具条布局
 *    - KJe MentionSelector          F08（js 65605）：@→files/plugins、#→sessions、
 *      $→skills 的 Lexical 接线（段数据钩子 AJe/WJe/HJe/PJe/Nqe）
 *    - SJe SlashPanel               F08（js 65002）：/→commands/skills/subagents
 *    - ait/iZe 工具条               F08/F12（js 89455/69225）；Zrt 已 A1-R17 §T 逐字实体化
 *    - TH/lit/uit chip 行           F08（js 68298/89989/90087）：A1-R22 三 declare 收敛 → Composer
 *      [B14]/[B17] 逐字 canonical（JH 69036 已 A1-R21 收敛 PptxReferencesChip）
 *    - vN/yN/bN/xN/SN/DN 附件件     F08（js 54555–54830）
 *    - fOt RemoteWizardDialog       F10（js 128093–128525）
 *    - zZ  GitBranchChip            TopBar 族（contextHeader 右件，已还原）
 *    - R0    ConversationPane       F03（js 119219）：draft 态装配现场
 *    - yJt   WorkspaceShell         F07（js 183896）：contextHeader 组装（184540–184577）
 *    - Dqe/kqe/jqe 建议文案数据     F08（js 63845–63975）：官方插件技能文案
 *      （地图备注称「建议卡文案数据」；实际消费方是提及面板技能段，非 3 张模板卡）
 * ============================================================================
 */

/* 〔A1-R40〕尾部导入：useWorkspaceTabStore（原 pc）收敛改指——WorkspaceTabsDeep@686 canonical（bundle 4801-4805 逐字；PD-α 同簇）。尾部导入：ES 模块提升，等价文件头，行引用零漂（R35 @10315 先例）。环安全：WorkspaceTabsDeep 值闭包（zustand/stores/SkillStore/remoteServices）不达本文件反向。〔A1-R53〕+isWorkspaceKindTab（原 oc，styles 4487-4489 ≡ WorkspaceTabsDeep@328；§U.11 f8e 体内消费）。 */
import { useWorkspaceTabStore, isWorkspaceKindTab } from '../../modules/WorkspaceTabsDeep';
import { useShallowSelector } from '../../lib/shallowSelector'; // 〔A1-R53〕co 改指（原 co，styles 1033-1039）：R36 逐字/R38 迁公共叶判例（PD@10702、WorkspaceShell@238 同式接引）；§U.11 Jq 选择器浅比消费——束真 `wie(t.current, r)` 缓存回取逐字闭合在叶内
