# A0-S4 文件树拆分计划（骨架，S3 落地后定稿）

## 目标
把 `modules/` 117 件族级大文件（合计 300,457 行）按导出边界拆入
`components/ hooks/ stores/ lib/ services/`（S1 已建，.gitkeep 占位），
成为真正的模块化源码工程。拆分只移动顶层定义，不改语义。

## 边界图（实测 import 枢纽，S4 拆分顺序依据）
| 枢纽文件 | 被导入次数 | 拆分属性 |
|---|---|---|
| button.tsx | 73 | 已含 shadcn 层，S3-c 后为 components/ui 枢纽 |
| SkillStore.tsx | 43 | stores/ 主枢纽（任务/技能/工作区状态） |
| UtilsCn.tsx | 40 | → lib/cn |
| UsageStatsUiParts.tsx | 38 | components/（Tooltip/图表件） |
| ImeComposition.tsx | 38 | components/（Popover/平台服务） |
| Settings.tsx | 35 | components/+stores/ 混合 |
| services.tsx | 28 | services/ 枢纽 |
| I18n.tsx / intlProvider.tsx | 24 | lib/i18n + 语言表（9,686/9,516 行，多为消息表） |
| stores-core.tsx | 21 | stores/ |
| SrcSharedA/B.tsx | 21/20 | lib/ 工具层（zod 已 npm 化，余路径/错误/常量） |

## 拆分对象（按规模）
PaymentDeep 11,794 / I18n 9,686 / intlProvider 9,516 / Composer 9,271 /
XlsxDeepA 8,185 / Conversation 8,098 / XlsxDeepP 7,294 / SrcSharedB 7,004 /
ExtendedViews 6,609 / SettingsLeaves 6,555 / XlsxDeepB 6,370 / UsageDeep 6,283 /
WorkspaceShell 5,951 / Sidebar 5,523 / Modals 5,436 …

## 单元定义
- 每个顶层导出 = 候选单元；单元 = 导出符号 + 其私有辅助 + 局部类型。
- 组件→components/<domain>/；hooks→hooks/；zustand store→stores/；
  纯函数/常量/类型→lib/；IPC/服务面→services/。
- 语言消息表（I18n/intlProvider 主体）→ lib/i18n/<locale>.ts。

## 验证（每拆分单元）
1. tsc：项目错误数不变（基线 = 拆分前快照）。
2. esbuild bundle diff：拆前/拆后对同一入口 bundle，diff 只允许模块包装与
   顺序差异；出现语义差异即回退。
3. out/ md5 不变（f5edd6a1…/48d71d48…）。
4. 每族拆分报告：单元清单、去向、行数、diff 结论。

## 顺序（拟）
1. lib 层：UtilsCn、SrcSharedA/B 工具段、logger（低风险，先立范式）
2. I18n/intlProvider 消息表抽离（体量最大、边界最清晰）
3. stores：SkillStore/stores-*/StoresDeep 的 store 单元
4. components：button 族→components/ui 归位、UsageStatsUiParts、ImeComposition、
   Settings 族、Modals、Composer、Conversation、WorkspaceShell/Sidebar、
   PaymentDeep、Xlsx 族、UsageDeep、ExtendedViews
5. services：services.tsx IPC 面

## 附带实体化（S2 遗留）
- TopBar UpdateDialog（POt，jsx 108829，19-prop 面）——消 tsc 残余错 1
- TopBar Qct git 投射（jsx 85059–85080）——消 tsc 残余错 2
- react-resizable-panels X4/Z4/Q4 包装（S3-a 推迟件）视证据决定
- 未重建横切层（classifyToolCall 族等）按证据实体化或永久登记
