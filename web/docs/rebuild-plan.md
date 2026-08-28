# Grok Build 前端 · 从零施工规划（v2 设计落地）

> 原则：**不是打补丁**。旧 web/src 是十轮补丁的拼盘（god-App、props 钻穿、
> 1000+ 行追加式 CSS），停止在其上施工。新建独立代码树 `web/src2/`（独立入口
> `index2.html`），旧应用保留为参照与器官捐献者，完工后切换、再归档。
> 设计依据 `product-design-v2.md`；实现规格 `zcode-uiux-spec.md` / `orca-spec.md`。

## 1 旧代码处置表（能用就用，不能用就舍弃）

| 旧资产 | 处置 | 理由 |
|---|---|---|
| lib/acp.ts / rpc.ts / mock.ts | **移植** → core/transport | 三传输（ACP-WS/IPC/mock）经实战验证 |
| lib/taskmeta.ts | **移植** → core/meta | lastSeen/pinned/archived=注意力与摘要的数据源 |
| lib/markdown.ts | **移植** → features/spine | 渲染器独立可用 |
| lib/i18n.ts | **移植+剪枝** | 机制好（zh/en 双字典），键随新 UI 重写裁剪 |
| icons.tsx | **移植+扩充** | 基础图标集 |
| Dock 三 pane（终端/浏览器/审查） | **提取移植** → features/dock | 逻辑真实可用，脱离旧壳 |
| Composer 的 /@# 菜单逻辑 | **提取移植** → features/dispatch | 解析逻辑可复用，UI 重做 |
| AgentDashboard.tsx | **移植+升级** → features/kanban | 看板雏形，加中断分级/SLA |
| electron/main.cjs + preload.cjs | **移植+扩展** | 壳基础设施；后续加 tray(Companion) |
| scripts/*（dev/zfork-serve） | **保留** | 工具链 |
| SettingsView 逻辑（mcp CRUD/providers） | **逻辑移植，UI 重写** | |
| ListView 逻辑（schedule CRUD） | **逻辑移植，UI 重写** → features/routines | |
| CommandPalette / SearchOverlay | **重写** | 需质量阶梯模糊匹配与新分区 |
| **App.tsx / Sidebar / TaskView / HomeView / Titlebar / ListView UI / SettingsView UI** | **舍弃** | god-object 与补丁 UI，无 salvage 价值 |
| **styles/app.css** | **舍弃** | 追加式补丁堆，违反 token 纪律 |

## 2 新架构（从零）

```
web/src2/
├─ main.tsx / index2.html
├─ core/        transport(三传输) / store(zustand slices) / meta / events(日志摄取)
├─ tokens.css   令牌：orca 纪律(成对/color-mix/三级阴影) + zcode 暗色像素值；.light 对偶
├─ ui/          原语集：Button(5变体4尺寸) Menu Sheet Dialog Tooltip Toast Switch
│               Input Badge Kbd —— 统一 data-slot，语义分叉表照 orca §2.5
├─ shell/       TopOverlay / CaptionCluster / StatusBar / ShellGrid / HistoryStack
├─ features/
│  ├─ fleet/    侧栏：工作区+任务（状态点语义/未读加粗/右键/分段/排序）
│  ├─ dispatch/ 首页工作单 composer（芯片实时成形/autonomy/预算）
│  ├─ spine/    会话时间脊柱（文档模）：节点类型/区间折叠/轮级动作/审批内联/队列
│  ├─ digest/   回来摘要条（lastSeen 事件 diff，原地判决）
│  ├─ attention/注意力轨+中断总线(L0-L3, SLA, 一键动作) + kanban 抽屉
│  ├─ review/   审查模：changeset diff/单文件回滚 + dock(终端/浏览器/审查,可分屏)
│  ├─ lineage/  谱系模：子代理/委托/工作流活组织图
│  ├─ contract/ autonomy 旋钮+回滚覆盖率+信任校准建议+预算信封
│  ├─ routines/ 例程：schedule+monitor 心跳/失败升级
│  ├─ palette/  命令面板(质量阶梯) + 搜索 + 脊柱查找
│  └─ settings/ 双栏设置（只有激活分区渲染）
└─ companion/   tray 药丸+popover 迷你注意力总线（Phase-3）
```

**两条工程纪律（v2 D1-D3 落地）**：
- store 以**事件日志为源**：sessions slice 只缓存日志投影；任何动作写回事件
  （D1 渲染日志不拥有状态）。
- 连接瞬态=琥珀 connecting；翻转不清数据（"Last known: N tasks" 陈旧保留）；
  能力缺失=诚实文案（D3）。

## 3 施工顺序（每步以截图验证收尾，可独立回滚）

| 步 | 内容 | 移植源 | 验证 |
|---|---|---|---|
| S0 | 入口+tokens+原语集+空壳网格（顶栏浮层位/侧栏位/主区/右轨位/状态栏位）+主题切换 | tokens 取自两 spec | 空壳截图，暗/亮 |
| S1 | transport+store：ACP 连接、会话水合、事件摄取、降级态（琥珀/陈旧保留） | acp/rpc/mock | 断连横幅演练 |
| S2 | fleet 侧栏：状态点语义、未读加粗、右键菜单、分段、排序 | 旧 Sidebar 逻辑片段 | 对照原版侧栏截图 |
| S3 | 顶栏浮层+⌄窗口菜单+历史栈；状态栏 v1（daemon 健康+舰队脉搏+token 名册⌄） | Titlebar 概念重做 | 前进/后退演练 |
| S4 | dispatch 首页：工作单 composer（@/#//、mode、autonomy、effort、预算芯片） | Composer 解析逻辑 | 芯片成形演练 |
| S5 | spine 文档模：事件脊柱、区间折叠、轮级动作、审批内联、队列芯片；digest 摘要条 | markdown+taskmeta | 真任务全流程 |
| S6 | attention 轨+kanban 抽屉：L0-L3、SLA、一键动作、ack/reveal flash | AgentDashboard 升级 |  elicitation 演练 |
| S7 | review 模+ dock：diff/单文件回滚/git chip；终端可分屏 | Dock panes | diff 回滚演练 |
| S8 | lineage 模：谱系图（节点状态光晕、跳转子会话） | 会话内子代理行 | 子代理任务演练 |
| S9 | contract：autonomy 旋钮+回滚覆盖+校准建议+预算告警 | rewind API | 放权演练 |
| S10 | palette/搜索/设置双栏/routines；Companion tray；Remote 配对 | 旧逻辑移植 | 全链路走查 |

依赖链：S0→S1→(S2,S3 并行)→S4→S5→(S6,S7 并行)→S8→S9→S10。
S5 是价值拐点（脊柱+digest=产品心脏的第一跳），优先保质量。

## 4 验收标准（每步通用）

- 截图对照：chrome 与 zcode 像素纪律一致（36-48px 顶栏、24px 状态栏、行三态）；
- 三动词判据：本步每个控件服役于 assign/observe/adjudicate 之一；
- D3 演练：断 daemon/断网/web 无能力三态不出现死按钮；
- tsc 严格模式零警告；新树不 import 旧树（器官在移植时拷贝清洗，不引用）。

## 5 风险

- 双树并行期的入口混淆→index2 明确 banner "v2 施工区"；
- 事件日志投影的性能→slice 细粒度订阅（orca 教训）；
- 谱系数据深度不足→S8 允许降级为列表+缩进（诚实降级）。

---
**开工建议**：S0+S1 一并做（骨架+血脉），约一轮可截图；之后每步一轮。
说"开工"即从 S0 启动。
