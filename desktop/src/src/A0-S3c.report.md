# A0-S3c 报告 — vendored→npm 迁移（radix/shadcn 原语层：109 名 lane4 "radix" 桶）

日期：2026-08-29 · 工作目录：`desktop/src/src`（该 package.json）· 基线 tsc：2 errors（/tmp/tsc-now14.txt，均为 TopBar S4 stub，保留）

## 〇、桶规模核对（任务称 104，实测 101）

- lane4-classify.json `radix` 桶 = **109 名**。
- S3c 开工时仍 declared = **101 个唯一名 / 328 条 declare 语句**（/tmp/s3c-decl.json 审计链）。
- 差额 8 名为早前批次已消耗：**Button**（S2/CLEANUP → './button'）、**Card / CardContent**（CLEANUP → Settings/SettingsCard 系）、**Tooltip / TooltipProvider**（pass-1 → UsageStatsUiParts）、**CardCvcElement / CardExpiryElement / CardNumberElement**（S3-a Stripe）。
- 任务简报「104」与实测 101 之差为快照时点差异（本批以 101/328 为准，逐名核验见 §二）。

## 一、版本裁决（13 包新装，全部 exact 钉版）

| 包 | 钉版 | 落点 |
|---|---|---|
| @radix-ui/react-alert-dialog | 1.1.23 | components/ui/alert-dialog.tsx + Settings.tsx |
| @radix-ui/react-checkbox | 1.3.11 | components/ui/checkbox.tsx + Modals.tsx（raw） |
| @radix-ui/react-collapsible | 1.1.20 | components/ui/collapsible.tsx |
| @radix-ui/react-context-menu | 2.3.7 | components/ui/context-menu.tsx |
| @radix-ui/react-dialog | 1.1.23 | components/ui/dialog.tsx |
| @radix-ui/react-dropdown-menu | 2.1.24 | components/ui/dropdown-menu.tsx |
| @radix-ui/react-hover-card | 1.1.23 | components/ui/hover-card.tsx |
| @radix-ui/react-progress | 1.1.16 | Modals.tsx（raw Root/Indicator） |
| @radix-ui/react-scroll-area | 1.2.18 | components/ui/scroll-area.tsx + SettingsLeaves.tsx（raw） |
| @radix-ui/react-select | 2.3.7 | Settings.tsx（Radix* 别名导入） |
| @radix-ui/react-switch | 1.3.7 | Settings.tsx + FeedbackCenter/ExtendedViews（raw） |
| @radix-ui/react-tabs | 1.1.21 | Settings.tsx（Radix* 别名导入） |
| cmdk | 1.1.1 | QuickPick.tsx（具名导入 + const 映射） |

既有（S2-a 安装，本批复用不改版）：@radix-ui/react-popover ^1.1.15（解析 1.1.15）、@radix-ui/react-slot ^1.3.3（解析 1.3.3）。
选型原则：任务指示「radix 包稳定——取当前稳定版并登记」；全部取 npm 当前稳定 exact 版。API 面逐包与 declare 形状核对（popover Root 有 `modal`、hover-card Root 有 `openDelay/closeDelay`、menu SubTrigger 有 `disabled`、menu Content `forceMount?: true` 等均在所装版本 d.ts 实证）。

## 二、族普查（101 名 → 库归属 → landed/deferred）

Lane-4 "radix" 桶为粗分类；逐名精核后归属如下。「宿主」= 既有重建层（复用不重复）；「新件」= 本批新建 components/ui 文件。

### 2.1 landed —— shadcn 封装族（新件，bundle 类串逐字）

| 族（bundle 符号） | 普查名 | 落点 |
|---|---|---|
| Dialog（zb/Bb/QDe/Vb/$De/Hb/Ub/Wb/Gb/Kb） | Dialog、DialogRoot、DialogTrigger、DialogContent、DialogHeader、DialogTitle、DialogDescription、DialogFooter、DialogClose | components/ui/dialog.tsx（showCloseButton/showOverlay/overlayClassName 按消费面；关闭钮 = Button ghost icon-sm + X，bundle 31943–32040） |
| AlertDialog（$4/_At/vAt/yAt/e3/t3/n3/r3/i3/a3/o3） | AlertDialogRoot、AlertDialogTrigger（全族导出） | components/ui/alert-dialog.tsx（Action/Cancel 套 buttonVariants，Cancel 默认 variant="outline"，bundle $4/_At 实证） |
| DropdownMenu（VO/HO/UO/WO/GO/KO/qO/JO/YO/XO/ZO/QO/$O） | DropdownMenu、DropdownMenuRoot、DropdownMenuTrigger、DropdownMenuContent、DropdownMenuItem、DropdownMenuCheckboxItem、DropdownMenuLabel、DropdownMenuRadioGroup、DropdownMenuRadioItem、DropdownMenuSeparator、DropdownMenuShortcut、DropdownMenuSub、DropdownMenuSubTrigger、DropdownMenuSubContent | components/ui/dropdown-menu.tsx |
| └ PaymentDeep select 风格别名（同 VO/HO/UO/KO/qO） | SelectShell、SelectTriggerAsChild、SelectPopup、SelectControl、SelectOption | 同上（别名导入，非 radix-select） |
| ContextMenu（yk/bk/xk/Sk/Ck/wk/Tk/Ek） | ContextMenu、ContextMenuTrigger、ContextMenuContent、ContextMenuItem、ContextMenuSeparator、ContextMenuSub、ContextMenuSubTrigger、ContextMenuSubContent | components/ui/context-menu.tsx |
| Collapsible（kZ/AZ/jZ） | Collapsible、CollapsibleRoot、CollapsibleTrigger、CollapsibleContent | components/ui/collapsible.tsx（双层动画内容按 jZ） |
| HoverCard（dN/fN/pN + CN/wN/TN） | HoverCard、HoverCardTrigger、HoverCardContent | components/ui/hover-card.tsx（含 HoverCardTooltip/Trigger/Content = CN/wN/TN：CN 默认 openDelay=closeDelay=0，TN align="start" + `w-auto p-2`，styles 54832–54836） |
| Card（bMt/xMt/SMt/CMt；B3/V3 宿主在 Settings） | CardHeader、CardTitle、CardDescription、CardAction | components/ui/card.tsx（bundle 无 card-footer，不造） |
| Alert（C9） | AlertTitle | components/ui/alert.tsx（Alert/AlertDescription 宿主在 Settings.tsx，不重复） |
| InputGroup（qb/Jb + eOe cva） | InputGroup、InputGroupAddon | components/ui/input-group.tsx（Jb 点击聚焦 `closest("button")` 逻辑按 bundle） |
| CommandInput（Xb） | CommandInput | components/ui/command.tsx（cmdk Input + InputGroup/Addon + Search 图标复合体） |
| ScrollArea（Y3/XMt） | ScrollArea、ScrollAreaScrollbar | components/ui/scroll-area.tsx |

### 2.2 landed —— 宿主复用（既有重建层，本批只接线）

| 族 | 普查名 | 宿主 |
|---|---|---|
| Select（iO/aO/oO/sO/cO） | Select、SelectRoot、SelectTrigger、SelectValue、SelectContent、SelectItem、SelectContentAlignEnd（=sO align="end"） | Settings.tsx（Radix* 底层改 npm @radix-ui/react-select@2.3.7；Tabs/Switch/AlertDialog 同） |
| Tabs（hC/gC/_C/vC） | TabsRoot | Settings.tsx Tabs 封装（ComponentProps 收口） |
| Command/cmdk（26004–26574） | Command、CommandRoot、CommandPalette、CommandList、CommandEmpty、CommandGroup、CommandItem + CommandPrimitive（census 外） | QuickPick.tsx（cmdk@1.1.1 具名导入；复合导出无 `.Root` 静态 → const 映射补齐） |
| Popover | Popover、PopoverTrigger、PopoverAnchor、PopoverContent、PopoverTriggerPrimitive、PopoverContentPrimitive、Input、Textarea | ImeComposition.tsx（既有封装） |
| Tooltip（Na/Oa/Ma/ka） | TooltipRoot、TooltipTriggerAsChild、TooltipContent、TooltipTriggerWrap（PaymentDeep） | UsageStatsUiParts.tsx（ShadcnTooltip 族 + InfoTooltip） |

### 2.3 landed —— raw radix / 直连

| 名 | 归属 | 落点 |
|---|---|---|
| SwitchRoot、SwitchThumb（UDe/WDe、DC） | @radix-ui/react-switch | FeedbackCenter、ExtendedViews 直连；Settings RadixSwitch* 别名 |
| CheckboxRoot、CheckboxIndicator（xOt） | @radix-ui/react-checkbox | Modals 直连 + components/ui/checkbox.tsx |
| ProgressRoot、ProgressIndicator | @radix-ui/react-progress | Modals 直连（Composer 保留，见 §三） |
| ScrollAreaRoot/Viewport/Scrollbar/Thumb/Corner（wEe/TEe/aEe/mEe/EEe） | @radix-ui/react-scroll-area | SettingsLeaves 直连 |
| Slot（Gre） | @radix-ui/react-slot | Modals、PaymentDeep、UsageStatsUiParts |

### 2.4 精核改名/改属（桶内误归或一名多属，逐一裁决）

| 名 | 粗归 | 实判 | 依据 |
|---|---|---|---|
| Command*（8 名 + CommandPrimitive） | radix | **cmdk@1.1.1** | bundle 26004–26574 = cmdk 复合组件；导出面与 cmdk 1.1.1 逐名核对 |
| PopoverRoot | radix popover | **四名分判**：TopBar:849 / ExtendedViews:853 = ShadcnTooltipProvider（bundle FOt@129313/ANt@138530 嵌套链 Na>Oa>Ma/ka 实证）；PaymentDeep = HoverCardTooltip（CN）；pptxPreviewViewer = 真 Popover；Composer:783 = 无消费面保留 | 各消费面 props 形状互斥 |
| TooltipRoot/TooltipTrigger/TooltipContent（GitReview） | radix tooltip | **hover-card 封装 CN/wN/TN** | GitReview 消费面带 openDelay 0 / align start，与 PaymentDeep CN/wN/TN 同构 |
| SelectShell/SelectTriggerAsChild/SelectPopup/SelectControl/SelectOption | radix select | **dropdown-menu 原语别名**（VO/HO/UO/KO/qO） | PaymentDeep 消费面为 menu 行为（无 value/ItemText 面） |
| ResizablePanel、ResizablePanelGroup | radix | **react-resizable-panels / 第一方引擎** | S3-a 已整库推迟（X4/Z4/Q4 封装面）→ 保留 declare |
| SwitchModeHint | radix | **第一方提示组件** | ConversationOverlays 消费面无 radix 面 → 保留 declare |
| Checkbox（ExtendedViews:912） | radix checkbox | **名实不符**：调用面 2146 实为 bundle `vq` ModelSelect 误重建、2787 实为 DC Switch | 保留 declare（不动误重建面，移交 S4） |

## 三、保留 declare 逐条登记（8 条 / 8 名）

| 名 | 位置 | 保留理由 |
|---|---|---|
| PopoverRoot | Composer.tsx:783 | 文件内无消费面（未渲染），真实面不可证 |
| ProgressRoot | Composer.tsx:784 | SegmentedProgress 调用面 `{...rest}` 为 `Record<string, unknown>` 索引签名（bundle @8675），对真实 radix props 判 TS2322；收口需重写调用面，超 B5 最小面 |
| ProgressIndicator | Composer.tsx:785 | 同上 |
| HoverCardRoot | Composer.tsx:801 | 调用面 `{...rest}` 索引签名（bundle @8745），同上 |
| Checkbox | ExtendedViews.tsx:912 | §2.4 名实不符（vq/DC 误重建面） |
| ResizablePanel | WorkspaceShell.tsx:1260 | react-resizable-panels 整库推迟（S3-a） |
| ResizablePanelGroup | WorkspaceShell.tsx:1243 | 同上 |
| SwitchModeHint | ConversationOverlays.tsx:568 | 第一方组件，非 radix |

## 四、转换汇总

- **declare 转换：348 条语句**（= 320 条 census 内 + 27 条 Settings Radix* 底层别名 + 1 座 CommandPrimitive namespace；census 328 条中 8 条保留见 §三）。
- **唯一名**：101 census 名中 93 名纯转换 + 3 名混合（PopoverRoot/ProgressRoot/ProgressIndicator 部分文件保留）+ 5 名纯保留。
- **新建 components/ui/**（12 件，均 `cn` ← modules/UtilsCn、`cva/Button/buttonVariants` ← modules/button、图标 ← lucide-react；cn 未搬家，维持 modules/UtilsCn 现址）：
  dialog.tsx、alert-dialog.tsx、dropdown-menu.tsx、context-menu.tsx、hover-card.tsx、collapsible.tsx、card.tsx、scroll-area.tsx、checkbox.tsx、input-group.tsx、command.tsx、alert.tsx。
- **modules/ 改动**：33 文件，+393/−598；42 座 A0-S3c tombstone；96 行 A0-S3c 标注导入/收口注。
- **最小调用面修正（均有 bundle 锚点）**：
  1. Composer 8548/8565 `<DropdownMenuGroup>`→`<DropdownMenuSub>`（bundle ZO@75905 = Sub 封装，包 SubTrigger+SubContent；原 Group declare 无对应消费面随删）。
  2. Composer 8275/8276 `contentSide?: string; contentAlign?: string` → radix side/align 联合（UO 透传；全调用面均为字面量，收窄零破坏）。
  3. BrowserPane `<SelectContentAlignEnd>` → `<SelectContent align="end">`（sO = SelectContent align=end；declare 删除）。
  4. PaymentDeep:640 ThoughtLevelControl `triggerRef?: React.RefObject<unknown> | null` → `React.Ref<HTMLSpanElement> | null`（Ia→InfoTooltip span ref 消费面，UsageStatsUiParts:945）。
  5. SettingsLeaves:4126 AutomationScrollbar `orientation?: string` → `"horizontal" | "vertical"`（XMt@136042 透传 radix Scrollbar；唯一调用面无参）。
  6. UsageStatsUiParts:484 `<Slot asChild>` → `<Slot>`（npm react-slot@1.3.3 Slot 恒为合并语义，asChild 已出其类型面/运行面；同 S2-a button.tsx 约定，原 g@dist-vnZIbudW asChild=true 行为不变）。
  7. Settings.tsx Tabs/TabsContent 包装收口 `React.ComponentProps<typeof RadixTabsRoot/Content>`（defaultValue/forceMount?: true 判定；bundle hC/vC 为纯透传）。
- **新增 @ts-expect-error/@ts-ignore/as any：0**（modules/ 与 components/ui/ 全量审计）。

### 转换事故与修复（记录在案）

批量转换器以 census 文本做精确替换；census 采集为单行捕获，**多行 declare 首行被截断**（65 条 suspect，其中 31 条实损：Converter 仅删首行/首段，尾部孤立残留 → 12 文件语法错）。修复：以 `git show HEAD:`（HEAD=检查点 9，批前真值）逐条恢复完整 declare 跨度（括号深度扫描至终结 `;`/`}`），计算 `remainder = full[len(txt):]` 后从工作区精确删除（/tmp/s3c-repair.py：31 条尾部修复，280 条验证无损，4 条「尾部不存在」经核为批-A 手工全量删除，15→8 条 intact 全程未触碰）。修复后 tsc 由 ~170 语法错归零。

## 五、类串恢复注记（styling）

- 12 件新 components/ui 的 Tailwind 类串全部取自 bundle 实证：/tmp/s3c/r-*.txt（styles-CdEGpc2x.js / src-HCld2afU.js 逐族抽取，含 31943–32040 Dialog、54832–54836 HoverCard-tooltip、zje Tabs cva、eOe InputGroup cva 等），与 modules/button.tsx、UsageStatsUiParts.tsx 既有重建层同源不重复。
- **既有宿主层偏差（登记为缺口，不在本批擅改宿主行为）**：
  1. Settings.tsx AlertDialogAction/Cancel 未套 buttonVariants（bundle $4/_At 套，Cancel 默认 outline）——Settings 宿主为早前批次重建面，本批只换底层 import。
  2. Settings.tsx SelectContent 滚动按钮为裸渲染（bundle BRe/VRe 有类串 + ChevronUp/Down 图标）。
  3. Settings.tsx Alert destructive 变体与 bundle g2t 类串存在差异。
- 无法从 bundle 恢复类串处（如个别透传容器）取最小功能样式，未发明装饰性类串。

## 六、tsc 增量（gate b）

| 时点 | errors | 说明 |
|---|---|---|
| 基线 /tmp/tsc-now14.txt | 2 | TopBar S4 stub ×2 |
| 批量转换后（事故态） | ~170 | census 截断尾部语法错（12 文件）——未交付，即修 |
| 尾部修复后 | 11 | 语义错：真实 radix 类型面收口（联合/refs/asChild） |
| 调用面收口 + WebRemote/SPData 补转后（终态） | **2** | 与基线逐条一致（TopBar 879→884、2953→2958 为导入块行移，错误本体逐字相同） |

无任何文件 error 数增加。

## 七、Gate 结果（全部通过）

- **a. esbuild 逐文件**：45 件（12 components/ui + 33 改动 modules）transform（`--loader:.tsx=tsx --jsx=automatic`，esbuild 0.25.12）**0 失败**；WebRemote/SettingsPanelsData 补转后复检通过。
- **b. tsc 总量**：2 = 基线 2，逐条一致（见 §六）。
- **c. ground truth md5**：`src-HCld2afU.js` = `f5edd6a1207c6d20008204829dad3923` ✓ · `styles-CdEGpc2x.js` = `48d71d4874b0868d61fd35a328bf6ad5` ✓。
- **d. git 作用域**：改动 = 33 modules/*.tsx + package.json + package-lock.json + 新增 components/ui/（12 件），全部位于 `desktop/src/src/`；`?? web/` 为批前既有状态；A0-PROGRESS.md / src-reconstructed/ / out/ 零触碰。

## 八、版本登记表（供 A0-PROGRESS.md S3 台账录入）

| 库 | 钉版 | 状态 | 落点 |
|---|---|---|---|
| @radix-ui/react-dialog | 1.1.23 | ✅ landed | components/ui/dialog.tsx；13 文件 Dialog 族接线 |
| @radix-ui/react-alert-dialog | 1.1.23 | ✅ landed | components/ui/alert-dialog.tsx + Settings Radix* |
| @radix-ui/react-dropdown-menu | 2.1.24 | ✅ landed | components/ui/dropdown-menu.tsx（含 PaymentDeep select 风格别名） |
| @radix-ui/react-context-menu | 2.3.7 | ✅ landed | components/ui/context-menu.tsx |
| @radix-ui/react-hover-card | 1.1.23 | ✅ landed | components/ui/hover-card.tsx（含 CN/wN/TN tooltip 风格封装） |
| @radix-ui/react-collapsible | 1.1.20 | ✅ landed | components/ui/collapsible.tsx |
| @radix-ui/react-scroll-area | 1.2.18 | ✅ landed | components/ui/scroll-area.tsx + SettingsLeaves raw |
| @radix-ui/react-select | 2.3.7 | ✅ landed | Settings.tsx Radix* 底层（Select 族宿主） |
| @radix-ui/react-switch | 1.3.7 | ✅ landed | Settings Radix* + FeedbackCenter/ExtendedViews raw |
| @radix-ui/react-tabs | 1.1.21 | ✅ landed | Settings Radix*（Tabs 族宿主） |
| @radix-ui/react-checkbox | 1.3.11 | ✅ landed | components/ui/checkbox.tsx + Modals raw |
| @radix-ui/react-progress | 1.1.16 | ✅ landed | Modals raw（Composer 3 件保留见 §三） |
| cmdk | 1.1.1 | ✅ landed | QuickPick.tsx（Command 族宿主；复合导出 const 映射） |

（@radix-ui/react-popover ^1.1.15、@radix-ui/react-slot ^1.3.3 为 S2-a 既有登记，本批复用。）

## 九、遗留事项（移交后续批次）

1. **保留的 8 条 declare**（§三）：Composer 3 件索引签名收口、ExtendedViews Checkbox 误重建面、resizable 2 件随 S3-a 推迟库、SwitchModeHint/PopoverRoot(Composer) 第一方/无消费面——S4 实体化时处置。
2. **Settings 宿主三处偏差**（§五）：AlertDialogAction/Cancel buttonVariants、SelectContent 滚动按钮类串+图标、Alert destructive 类串——宿主行为面，随 Settings 族深重建批次对齐。
3. **QuickPick CommandPrimitive const 映射**：cmdk 复合导出无 `.Root` 静态的权宜补齐；若后续 cmdk 升级带 Root 静态可简化。
