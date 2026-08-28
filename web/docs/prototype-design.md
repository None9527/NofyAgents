# Grok Build 桌面端 · 原型设计（v4.1，三参照布局/分成/交互驱动 + 真机截图校正）

> v3 的错误：把 TUI 面板**直译**成桌面视图——spine/lineage/contract 做成三个并列主视图、attention 做成独立右栏。按"TUI 功能点"组织，不是按桌面产品的**布局思路**组织。
> v4 的骨架来自三个参照的布局与交互哲学：ZCode（内核包装范式的最完整 GUI 表达）、Codex（多 agent 并行 + review 为中心）、Orca（多 agent 总览 + chrome 纪律 + 分屏/终端栈）。TUI parity 功能点（prd-v3 P1–P7）作为**填入各区的内容**，不再决定布局。
> **v4.1 校正（用户真机 ZCode 截图 2026-08-26 红框三处）**：
> 1. 终端/浏览器/审查/辅助对话 = **右侧边面板 tab**，空态为四宫格启动器——**不是底部 dock**（源码 §13 的 "Mqt 底部 dock" 推断被真机推翻）。
> 2. 会话头 = 标题 + **[项目 chip]** + **[⑂ branch ⌄ chip]** + ⋯ 菜单。
> 3. **Git 工具 mini 浮卡**悬浮对话流右上：更改 +N −M / branch ⌄ / 提交或推送 / 智能体（= aside 的 mini 态）。
> 可视化原型：`web/prototype/v4.html`（浏览器直接打开）。

---

## 1. 三参照的布局/分成/交互思路（取证）

### 1.1 ZCode（zcode-uiux-spec.md §2/§3/§5/§6/§9 + 真机截图 2026-08-26）

**分成**：
- **顶栏 = 绝对定位浮层**，整条 drag；左簇仅 logo(=侧栏开关)+后退/前进；右簇 = 头像⌄ + 更新 + 面板开关 + ⊞ 侧边面板开关。**顶栏不含面板图标本身**。
- **左侧栏 = 唯一滚动容器**：导航 4 行（新建任务⌘N / 搜索⌘K / 自动化 / 插件市场）→ 分段（分组|项目）→ 项目→任务两级列表（相对时间、未读点、运行中橙色 spinner 点、hover …菜单）→ 固定底栏（头像+设置）。
- **Home = hero + workspace 行 + composer 卡 + 建议卡**；composer 工具条：+ 附件 / 计划模式⌄ / 模型⌄ / 开启⌄ / 发送。
- **会话视图 = 会话头 + 对话流 + composer**；会话头 = 标题 + 项目 chip + branch⌄ chip + ⋯（真机框注①）。
- **右侧边面板**（⊞ 开关）= tab 容器：tab 类型 **辅助对话 / 审查 / 终端 / 浏览器**；空态 = 居中四宫格启动器（真机框注③）。终端 tab 内可再分屏；审查 tab = 变更文件列表 + 逐文件 diff。
- **Git 工具 mini 浮卡**悬浮对话流右上（aside mini 态）：`更改 +N −M` / `⑂ branch ⌄` / `提交或推送` / `智能体`；⤢ 展开进侧边面板（真机框注②）。

**交互思路**：
- **轮级动作，不是气泡按钮**：turnHeader 每轮头部挂 `重试/编辑/回退文件/fork`（`editDisposition: rewind|fork`）。
- **面板入口收敛**：侧边面板 tab 仅经 ⊞/快捷键/命令面板（quickPick panels 段）打开。
- **Quick Pick 段序**：suggested/recommended/chat/navigation/panels/configure/app。
- **设置 = 左段列表 + 右栏行式**两栏。
- 任务行上下文菜单：移动分组/置顶/重命名/归档/标记未读/复制路径族/打开方式。

### 1.2 Codex（ref-analysis/scope-entry-global-home-analysis.md 用户实测 + 公开设计）

- **项目优先**：左 = 项目 → thread 列表；thread = 一等公民，各绑自己的 worktree/分支，行带状态。
- **review 为中心**：右 Changes 面板一等公民——文件列表 + 逐文件 diff + **行内评论回流 thread**。
- **审批 = 线程级自主模式**（只读/自动/完全），危险操作仍升格询问。
- 多 thread 并行，用户像经理切换：发起→离开→状态点召回→回来 review。

### 1.3 Orca（orca-spec.md §3/§11/§12，MIT 源码）

- chrome 纪律：titlebar 36px；侧栏折叠时顶栏变浮层；状态栏 24px + 右键可见性菜单（可选借用）。
- 左栏卡片三态配方：idle 透明 / hover color-mix 4% / active 属性选择器 + DOM 抢先同步。
- **Kanban dashboard**：非模态 companion sheet；列序 attention/working/done/idle；**unseen→ack**；`done&&!unseen` 保持绿直到 ack 再沉灰；attention 不整列染色（卡片自带状态色，避免双重信号）。
- 状态点五态：working=spinner / monitoring=yellow / permission=question / done 未读=emerald / 已读=neutral。
- Cmd+J 面板：匹配质量阶梯 + 分区领导权。

### 1.4 三家共识（= 我们要学的思路）

| 维度 | 共识 |
|---|---|
| 左栏 | 项目→任务两级唯一滚动列表；状态点+未读+相对时间；右键全菜单 |
| 中列 | 会话头(标题+项目chip+branch⌄+⋯) → 对话流(turn 轮级动作) → composer |
| 右侧 | 侧边面板 tab 容器（辅助对话/审查/终端/浏览器）+ Git mini 浮卡 |
| 顶 chrome | 浮层顶栏，左簇极简，右簇=头像/更新/面板开关 |
| 多 agent | 并行任务+状态点召回+kanban 总览（unseen→ack） |
| 审批/自主 | 线程级自主模式为主表达；危险操作内联卡升格（非全局模态） |
| review | diff 一等公民，行内评论回流对话 |
| 入口 | 面板/dock/导航全进命令面板；键盘和弦优先 |
| 设置 | 两栏 |

---

## 2. 布局蓝图 v4.1（对拍真机三框注）

```
┌────────────────────────────────────────────────────────────────────────────┐
│ TopBar=会话头同行 h-12 全drag 三段：[●●●][≡][←][→]｜标题[⌐项目chip][⑂dev⌄][]｜[T][○更新][▢][⊞]│
├────────────────┬───────────────────────────────────────────┬───────────────┤
│ 左栏(唯一滚动)   │ Git 浮卡② + 对话流(turn 轮级动作/内联卡)     │ 右·侧边面板③   │
│ [＋新建任务 ⌘N] │ ┌───────────────────────────┐              │ (tab 容器)     │
│ [🔍搜索 K]    │ │ Git 工具②          ⋯  ⤢ │              │               │
│ [⚙自动化]      │ │  📄 更改       +1939 −51  │              │ 空态=四宫格：   │
│ [⊞插件市场]    │ │  ⑂ dev ⌄                │              │ [辅助对话][审查]│
│ ── 分组|项目 ── │ │  → 提交或推送             │              │ [终端][浏览器]  │
│ 项目 ▾         │ │  ───────────            │              │               │
│ ▸ media-agent │ │  智能体                  │              │ 打开后=tab 条×N │
│   查找… 49天   │ └───────────────────────────┘              │ 终端tab内split │
│ ◔ deepwiki-open│ 对话流：turn 分段                            │ 审查tab=文件列 │
│ ◔ RTAgent-SDK │  turnHeader①级菜单[重试|编辑|回退文件|fork]    │ 表+逐文件diff │
│ ▸ zcodebot    │  审批/问题/计划 = 内联卡（非模态）              │ +行内评论回流  │
│   添加… 1天    │  markdown + 工具折叠块 ▶✓                     │ 辅助对话=隔离  │
│ ▾ rtagent     │ ┌───────────────────────────────────────┐   │ side chat     │
│  ● R55 eval 今│ │ 提出后续修改要求                          │   │              │
│  审计… 69天    │ │ [＋][📄计划模式⌄]    [模型⌄][⊕自主L3⌄][] │   │              │
│ ─────────────│ └───────────────────────────────────────┘   │              │
│ 底栏 [T 用户⚙] │                                           │              │
├───────────────────────────────────────────────────────────┴───────────────┤
│ （可选 Orca 借用）24px 状态栏：用量名册⌄ · 连接 · N活动/M待你 · 右键=可见性菜单   │
└────────────────────────────────────────────────────────────────────────────┘
覆盖层：Kanban sheet(attention/working/done/idle, 非模态) · 命令面板⌘K · 设置两栏
```

**与 v3/v4.0 的差异**：
1. 砍 spine/lineage/contract 三并列视图：lineage→左栏缩进线+kanban 子代理展开；contract→会话头自主⌄+设置；spine=中列对话流。
2. 砍 AttentionRail：attention = kanban attention 列 + 左栏状态点 + 内联卡，不双重信号。
3. **v4.1：终端/浏览器/审查/辅助对话 = 右侧边面板 tab**（真机），废除底部 dock 构想。
4. **v4.1：Git 工具 mini 浮卡**悬浮对话右上（更改±/branch⌄/提交或推送/智能体），⤢ 展开入侧边面板。
5. **v4.1：会话头 chips**（项目 + branch⌄）承载 workspace/分支语义；自主模式 chip 并入 composer 右簇。
6. Home = ZCode home（hero+composer+建议卡）+ kanban 摘要条（"N 个任务待你"→开 sheet）。
7. **v4.2（用户校正）：顶栏与"会话头"是同一行**——顶栏三段：左簇（红绿灯/≡/←/→）| 中段=会话头（标题+[项目chip]+[⑂branch⌄]+⋯）| 右簇（头像⌄/更新/▢/⊞）。对话列内不再单设会话头行。Home 视图时中段为空或面包屑。

---

## 3. 交互思路（十条纪律）

1. **unseen→ack 唯一未读语义**；`done&&!unseen` 沉灰。
2. **状态点五态**（Orca §12.5）：spinner / question 琥珀 / red blocked / emerald 未读 / neutral 已读，全应用同映射。
3. **轮级动作**挂 turnHeader（重试/编辑/回退文件/fork），气泡无按钮。
4. **非模态优先**：审批/问题/计划内联卡；kanban companion sheet；仅不可内联者模态。
5. **自主模式线程级**（Codex）：composer 右簇 `[自主 L3⌄]` = 本任务覆盖全局；危险操作任何级别仍升格。
6. **review 闭环**：审查 tab 逐文件+行内评论 → follow-up 注入对话；回滚 = 文件级 rewind。
7. **入口收敛**：侧边面板/kanban/设置/导航全进命令面板；质量阶梯+段序领导权。
8. **和弦表**：`⌘K` 面板 · `⌘N` 新任务 · `⌘B` 左栏 · `.`/`` 侧边面板 · `⌘⇧T` 终端 tab · `⌘R` 审查 tab · `⌘,` 设置 · `⌘⇧K` kanban · `⌘[/]` prev/next 任务 · `Esc` 逐级。
9. **chrome 纪律**：顶栏浮层全 drag；列表行三态配方；color-mix token。
10. **诚实降级**（D3）：断连=连接点红+列表灰化可读；web 无能力项 amber 标注。

---

## 4. TUI parity 功能点落区表（prd-v3 P1–P7 → v4.1 区）

| 需求 | 落区 | 表达 |
|---|---|---|
| P1 重命名/导出/搜索/跳转/时间戳 | 会话头  + 左栏行菜单 + ⌘K find(scope 消息/变更) | ZCode |
| P1 内联编辑用户消息 | turnHeader 菜单 edit→rewind 重跑 | ZCode |
| P1 fork | turnHeader 菜单；左栏 lineageTrail 挂父子线 | ZCode+Orca |
| P2 权限七选项 | 对话内联卡，选项级保真+本任务/全局记住 | TUI 保真 |
| P2 计划审批+行评论 | 内联卡（计划渲染+行评论回流） | Codex review |
| P2 多问题表单 | 内联表单卡 | TUI |
| P2 CancelTurn 四选项 | 会话头/运行中 stop⌄ 非模态菜单 | — |
| P3 tasks/todo/queue/btw | Git 浮卡"智能体"行⌄（运行中计数/todo）+ 对话内 queue chips + btw 条 | 拆入流内 |
| P4 context/usage/doctor | 顶栏头像⌄用量 + 设置；可选状态栏名册 | ZCode/Orca |
| P5 扩展五 tab | 设置两栏右栏 tab | ZCode |
| P6 dashboard attach/peek | kanban sheet：点击=attach 跳转；双击=peek 终端预览 | Orca |
| P6 sessions 浏览器 | 左栏即会话列表 + ⌘K 全局搜索 overlay | ZCode |
| P7 viewers/media | 审查 tab 内嵌 + 模态 fallback | — |
| rewind 选择器 | turnHeader 回退文件 → checkpoint popover，锚点后 dim | TUI |

---

## 5. src2 rework 清单（现组件 → v4.1）

| 现组件 | 处置 |
|---|---|
| ShellGrid 三视图切换 | 单一任务视图 + 右侧边面板；ViewSwitch 删除 |
| AttentionRail | 删除；语义入 kanban attention 列 + 左栏状态点 + 内联卡 |
| Kanban | 保留改 companion sheet + 五态点 + peek |
| contract | 拆：自主模式→composer 右簇⌄；预算→设置 |
| lineage | 拆：左栏 lineageTrail + kanban 子代理展开 |
| Fleet | 升级左栏：项目→任务两级+三态卡片+spinner 点+右键全菜单+底栏用户 |
| TopOverlay | 顶栏与会话头合并为同一行三段：左簇[logo≡][←][→]｜中段=标题+[项目chip]+[⑂branch⌄]+[⋯]｜右簇[头像⌄][更新][▢][⊞]；整行 drag（v4.2 用户校正） |
| dock | **改右侧边面板**：tab=辅助对话/审查/终端/浏览器；空态四宫格；终端 tab 内 split |
| 右栏（新） | 侧边面板 tab 容器 + **Git 工具 mini 浮卡**（对话右上，⤢ 展开入面板） |
| spine | 中列对话流；补会话头 chips（项目/branch⌄/⋯）+ turnHeader 轮级菜单 |
| palette | 质量阶梯+段序 |
| settings | 保留两栏 |
| dispatch | = Home composer；补 计划模式⌄/自主⌄/模型⌄ |

---

## 6. 验证方式

0. **打开 `web/prototype/v4.html`**，对拍真机三框注：会话头 chips / Git mini 浮卡 / 侧边面板四宫格。
1. rework 后逐区截图对拍。
2. 真后端冒烟：左栏五态点分布；审批内联卡七选项；rewind popover 锚点 dim。
3. 面板质量阶梯单测。
4. 和弦表与 Esc 逐级手测。

> 证据：web/docs/zcode-uiux-spec.md、web/docs/orca-spec.md、ref-analysis/scope-entry-global-home-analysis.md、ScreenShot_2026-08-26_110119_031.png（真机三框注）、nofy-tui-full-spec.md、prd-v3.md。
