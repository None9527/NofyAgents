# A0-S3b 报告 — vendored→npm 迁移（lucide 图标 285 → lucide-react@1.35.0）

日期：2026-08-29 · 工作目录：`desktop/src/src`（该 package.json）· 基线 tsc：2 errors（/tmp/tsc-now13.txt，均为 TopBar S4 stub，保留）

## 一、版本裁决

- **安装**：`lucide-react@1.35.0`（exact 钉版，npm 可解析，与 A0-PROGRESS.md S3 表记录一致）。
- **版本张力备注**：button.tsx 头部重建注记称 button chunk vendored 段 = lucide-react@**1.17.0**（2026-08-26 逐行对照，把握度高）；S3 表记 1.35.0。本批核验：本批全部映射图标名在 **1.17.0 与 1.35.0 两版导出面均存在**（1.17.0 导出 7,592 名 / 1.35.0 导出 7,891 名，差集不含本批任一名）→ 版本差异对本批零影响，按任务指令采用 1.35.0。
- **类型面**：lucide-react `LucideProps`（= `RefAttributes<SVGSVGElement> & Partial<SVGProps<SVGSVGElement>> & {size?, absoluteStrokeWidth?}`）完全覆盖本地 declare 的 `React.FC<React.SVGProps<SVGSVGElement>>` / `React.FC<{className?: string}>` / `React.ComponentType<{className?: string}>` / `IconComponent` / `React.FC<IconProps>` 各面 → **调用面零改动**（git diff 审计：删除行仅 declare，新增行仅 import/tombstone）。

## 二、转换方法与证据层级

每个 declare 的映射按以下优先级裁决（全部记录于 /tmp/s3b-plan.json 审计链）：
1. **GT 锚定**：src-reconstructed（只读真值）的 `createLucideIcon("<kebab>", …)` 定义（108 名零冲突映射）。
2. **同句注释 kebab**：declare 行尾注释中的显式 lucide kebab 名（如 `// Nv refresh-cw 27677`、`// rocket (Pv)`）。
3. **导出面精确同名**：声明名本身 ∈ lucide-react 导出（`X`/`XIcon` 双形中取与声明名全同者，避免别名）。
4. **前后缀剥离**：`IconXxx`→`Xxx`、`XxxIcon`→`Xxx` ∈ 导出。
5. **符号交叉引用**：注释符号经他处「符号+kebab（+js 行号）」锚定且语义吻合（如 `g = x`、`S_ = arrow-left 26634`、`M = loader-circle`）。
6. 无证据/证据冲突 → **保留 declare 并逐条登记**（见 §四）。

**去重（任务第 4 条）**：button.tsx 导出的 4 个图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut，bundle 中即 button chunk 导出 wa/Ea/a/i，GT 注释亦标注「button chunk」）沿用 **pass-1 canonical**，经 `'./button'` 接线（21 处，合入各文件既有 `'./button'` import，原注释保留 + 增补注）；其余一律走 `'lucide-react'`。每文件每图标单一来源，无重复导入。pass-1 已接线的 9 处（pptxPreviewViewer×4 / PdfViewer×4 / RemoteGapSegments×1）零改动。

## 三、转换汇总

- **declare 转换：429 条语句 / 227 个唯一名**（491 条中的 87.4%）；其中 `'lucide-react'` 408 条、`'./button'` 21 条。
- **保留：62 条语句 / 60 个唯一名**（含 2 名跨文件混合裁决：IconCalendar、SkillIcon，见 §四.3）。
- 纯转换名 225 + 纯保留名 58 + 混合名 2 = 285（= 286 − 早前已消耗的 createLucideIcon）。
- diff：**+134 / −444**（32 modules/*.tsx + package.json + package-lock.json）。
- 新增 @ts-expect-error/@ts-ignore/as any：**0**（git diff 全量审计）。

### 代表性映射（非同名者）

| 声明名 | → 导入 | 依据 |
|---|---|---|
| IconArrowLeft 等 174 个 IconXxx | `ArrowLeft as IconArrowLeft` 等 | GT/注释/前缀剥离 |
| AlertIcon | `TriangleAlert as AlertIcon` | 注释「N triangle-alert」 |
| CommandIcon | `SquareTerminal as CommandIcon` | 注释「Gv square-terminal」 |
| EditIcon | `SquarePen as EditIcon` | 注释「Jjt square-pen」 |
| ResumeIcon | `PlayCircle as ResumeIcon` | 注释「j3 play-circle」 |
| RotateIcon | `RotateCcw as RotateIcon` | 注释「gbe rotate-ccw」 |
| SettingsIcon | `Settings2 as SettingsIcon` | 同句注释「settings-2」（Rv 跨注冲突见 §四.3） |
| SubagentIcon / IconSubagents | `Bot as …` | 注释「b_ bot」/「bot (D_)」 |
| UserScopeIcon | `UserRound as UserScopeIcon` | 注释「Nbe user-round」 |
| IconAutomations / IconBrowser / IconCommands / IconGeneral / IconHooks / IconIndexing / IconMcp / IconMemory / IconModelProvider / IconOnboarding / IconPlugins / IconSkillRow / IconSkills / IconUsage / IconAppearance | AlarmClock / Earth / Terminal / Settings2 / Anchor / ShieldCheck / Cable / Brain / Server / Rocket / Puzzle / Box / WandSparkles / ChartColumn / Palette | 注释显式 kebab |
| IconThemeSystem / IconThemeDark / IconThemeLight | Monitor / Moon / Sun | 注释「monitor 系 / moon 系 / sun 系」 |
| IconClose ×5、CloseIcon ×2 | `X as …` | g=x（QuickPick 明注「g = x」） |
| IconBack、BackIcon、IconPrevious | ArrowLeft | S_=arrow-left（26634 锚定） |
| IconNext | ArrowRight | C_=arrow-right（26649 锚定） |
| IconError | CircleAlert | F_=circle-alert（26812 锚定） |
| IconMore | Ellipsis | K_=ellipsis（26950 锚定） |
| IconSpinner ×5、SpinnerIcon ×8 | LoaderCircle | M=loader-circle（Conversation:204/ExtendedViews:854 明注） |
| IconExternal ×2、IconOpenExternal ×3 | ExternalLink | q_=external-link |
| IconSend | ArrowUpFromLine | w_=arrow-up-from-line（26653 锚定；发送=上箭头语义吻合） |
| SuccessIcon / AutomationStatusCompletedIcon | CircleCheck | I_=circle-check（Modals GT 锚定） |
| AutomationStatusFailedIcon | TriangleAlert | 注释明注「三角警示复用」 |
| CopiedIcon | Check | M_=check |
| ThoughtLevelIcon | Lightbulb | O_=lightbulb |
| TrashIcon ×6、IconTrash ×3 | **Trash2** | Kv=trash-2（27882 行号双锚定，优先于「Kv trash」孤注） |
| RefreshIcon/IconRefresh（Nv 注）×4 | RefreshCw | Nv=refresh-cw（27677 锚定） |
| RefreshIcon（SPData Mv 注）、IconRefresh（Settings 明注）| RefreshCcw | Mv=refresh-ccw |
| SkillIcon（SPCapability） | Sparkles | 注释「sye sparkles」 |
| ChevronRightIcon ×3、IconChevronRight ×10、IconChevronLeft ×3、IconZoomIn/Out ×4 | `'./button'` 同名导出别名 | button chunk canonical（pass-1 同源） |

## 四、保留名逐条登记（62 条 / 60 名）

### 4.1 自定义第一方图标（误分类，49 名）——无 lucide 对应，declare 保留

AgentIcon、AttachmentCardIcon、AttachmentChipIcon、AttachmentIcon、AutomationStatusActiveIcon（M3）、AutomationStatusPausedIcon（k3）、CodeCommentIcon、CommentGlyphIcon、GenericProviderIcon、HookIcon（注释自注「camera-info 占位」）、IconCollapseScrollMode、IconEmptyFolder、IconExpandScrollMode、IconExternalSession（注释自注「P3 包装」）、IconFilterChanges、IconListTodoLike、IconMermaid、IconMermaidZoomIn、IconMermaidZoomOut、IconQuestion ×2（vye 无 kebab 锚点）、IconRepoWiki、IconSparklesLike、IconSpinnerAlt、IconTablePreview、IconWrap、LoginIcon、MermaidIcon、MessageIcon、ModeLeadingIcon、OrbitSpinnerIcon、PlanIcon、PluginFallbackIcon、PptxElementIcon、ProviderIcon（函数签名）、RadixSelectIcon（asChild/children 自定义面）、ScheduledTemplateIcon（name prop）、SelectionIcon、SessionIcon、SkillIcon（Composer:832 无注；SPCapability:233 有注已转）、SubagentGlyphIcon、TemplateIcon（name prop）、TodoStatusIcon（status prop）、TokensIcon、WhiteboardIcon、WorksCompactIcon、WrapLinesIcon、ZapiProviderIcon、navItemIcon（函数）、resolveFileIcon（函数）。

### 4.2 自定义 prop 面 / 非图标占位（3 名）

| 名 | 位置 | 证据 |
|---|---|---|
| FileIcon | ConversationLeaves:281、Home:321 | prop 面含 `src: string`（调用面 `<FileIcon src={…}/>`），lucide File 无 src —— 第一方文件类型图标，**名称巧合** |
| IconComponent | Conversation:176 | 类型占位 const，非图标 |
| IconFork | Conversation:201 | Obe 无 kebab 锚点；lucide@1.35.0 无 `Fork` 导出（仅 `GitFork`），证据不足 |

### 4.3 名-符冲突保留（6 名）——声明名可映射，但注释符号已锚定为另一图标，证据冲突不强行裁决

| 名 | 位置 | 冲突 |
|---|---|---|
| IconZap | Conversation:206 | 名→Zap；符号 Pv=rocket（27687 行号双锚定） |
| IconStar | SettingsLeaves:231 | 名→Star；符号 Wv=square（ExtendedViews GT 锚定） |
| IconCalendar | SettingsLeaves:232 | 名→Calendar；符号 j_=calendar-days（Modals GT 锚定）。**同名在 Conversation:213 / ConversationLeaves:139（// R_，无 kebab 锚）已按名转 Calendar** |
| CalendarIcon | SettingsPanelsData:116 | 同上（j_=calendar-days） |
| IconCompact | Conversation:195 | 名无映射；符号 x_=archive（26615 锚定）与 compact 语义不吻合 |
| EquityCheckIcon / HelpIcon / WebElementIcon | PaymentDeep:262/263/268 | 符号 E_=astroid、p=info、wye=earth 与名义语义不吻合/不定 |

### 4.4 跨注冲突备忘（不影响转换，记录在案）

- **Kv**：trash（SettingsPanels 孤注）vs trash-2（27882 行号双锚定）→ 一律从 trash-2。
- **Rv**：settings 27758（QuickPick/Sidebar 行号注）vs settings-2（SPCapability SettingsIcon 同句注）→ 各从其同句证据。
- **Uv**：square-terminal（QuickPick 显式注）vs shell 描述 → 名映射不受影响；IconTerminal 经 GT（terminal）裁决，不受 Uv 影响。
- **Gv**：square-terminal（CommandIcon）vs terminal（IconCommands）→ 各从其同句注。
- **F_**：circle-alert 26812（行号锚定）vs circle-help（SettingsPanels CircleHelpIcon 同注）→ CircleHelpIcon 按精确同名导出转换，不受符号影响。
- **sye**：box（IconSkillRow「box (sye)」）vs sparkles（SkillIcon「sye sparkles」）→ 各从其同句注。
- **C_**：arrow-right 26649（行号锚定）vs arrow-up-right（IconArrowUpRight 同注）→ IconArrowUpRight 按名映射（ArrowUpRight），IconNext 从 arrow-right。
- **p**：info（IconInfo ×4 明注）vs triangle-alert（Sidebar IconTriangleAlert 同注）→ IconTriangleAlert 按名映射。
- **j_**：calendar-days（Modals GT 锚定）→ 见 §4.3。
- **IconX**（Modals:164、SettingsLeaves:218）不在 lane4 lucide 286 清单内，本批未触碰。

## 五、文件清单（32 个 modules/*.tsx）

Bots(12)、BrowserPane(13)、CmdkPaletteDeep(7)、CodeViewer(7)、Composer(18+14 保留)、Conversation(32+6)、ConversationLeaves(17+5)、ConversationOverlays(9)、ExtendedViews(1)、FeedbackCenter(1)、FileRewindDialogDeep(4)、FileTreePanel(10+3)、GitReview(21)、Home(16+2)、MarkdownIntegration(6+2)、Modals(2)、OnboardingLoginLeaves(2+2)、PaymentDeep(12+7)、PreviewCards(8+5)、QuickPick(29)、Settings(31+1)、SettingsLeaves(38+4)、SettingsPanels(15)、SettingsPanelsCapability(27+5)、SettingsPanelsData(10+5)、Sidebar(45)、SidebarLeaves(12)、TerminalPane(3)、UsageDeep(16+1)、WebRemote(1)、WorkspaceShell(1)、pptxPreviewViewer(3)（括号 = 转换条数 + 保留条数）。
每文件：文件头新增 1 条 `'lucide-react'` import（React import 之后）± `'./button'` import 增补；原 declare 块以 A0-S3b tombstone 替换（共 76 条 tombstone）。

## 六、tsc 增量（gate b）

| 时点 | errors | 说明 |
|---|---|---|
| 基线 /tmp/tsc-now13.txt | 2 | TopBar S4 stub ×2 |
| 全量转换 + 注释修复后（终态） | 2 | 与基线逐条 diff **完全一致**（同文件同行） |

无任何文件 error 数增加。

## 七、Gate 结果（全部通过）

- **a. esbuild 逐文件**：32 个改动文件 transform 检查 **0 失败**；另做 bundle 模式对照：TerminalPane 全量 bundle 的 15 个错误（MarkdownVendored 14 + UsageStatsUiParts.useControllableState 1）经 git stash 前后对照 **逐条一致**，均为未重建区既有错，本批零新增；以 `--external` 隔离既有缺口后 bundle 成功（5.87MB，lucide 标识 ×277，确认 lucide-react 正常内联）。
- **b. tsc 总量**：2 = 基线 2，逐条一致（见 §六）。
- **c. ground truth md5**：`src-HCld2afU.js` = `f5edd6a1207c6d20008204829dad3923` ✓ · `styles-CdEGpc2x.js` = `48d71d4874b0868d61fd35a328bf6ad5` ✓。
- **d. git 作用域**：改动 = 32 modules/*.tsx + package.json + package-lock.json，全部位于 `desktop/src/src/`；`?? web/` 为批前既有状态。

## 八、版本登记表（供 A0-PROGRESS.md S3 台账录入）

| 库 | 钉版 | 状态 | 落点 |
|---|---|---|---|
| lucide-react | 1.35.0 | ✅ landed | 32 文件 429 条 declare→import（225 名纯转换；button chunk 4 图标 21 处经 './button' pass-1 canonical；62 条/60 名保留逐条登记）；与 button.tsx 注记 1.17.0 之版本差经核验不影响本批名集 |

## 九、遗留事项（移交后续批次）

1. **保留的 62 条 declare**：§4.1 的 49 个自定义名属 first-party 深部（S4 目标）；§4.3 的 6 个名-符冲突名待 bundle 视觉/运行时核验后裁决。
2. **button.tsx vendored lucide 段**（createLucideIcon/Icon/工具函数 + 4 图标）：本批保留；后续若将该段改指 lucide-react，`'./button'` 图标接线自动获得 npm 实体。
3. **Modals/ExtendedViews/TopBar 等 12 文件的 `createLucideIcon("<name>", [])` 空节点占位**（A0-D 期接线）：非 declare，本批未动；其 npm 化（空节点→真实字形）可作为 S3 收尾微批。
