# 左栏溢出与折叠入口（2026-10-12）

后续用户反馈要求撤掉图标缩小、底部形成整体，并指出顶部原生点击仍有问题。当前实现见 frontend-sidebar-integrated-2026-10-12.md；以下保留此前步骤，不能将此前DOM验收视为原生点击已经修复。

隔离 Electron 在修改前复现：200px左栏的窗口导航宽220px，最后按钮超出20px；分组工具行末枚归档按钮到212px，超出12px。窗口按钮未显式标记no-drag，与下方Electron窗口拖动区重叠。点击折叠能改变状态，但展开按钮与aside一起隐藏，再展开入口消失。

## 当前实现

- WindowNavigation是ShellLayout的独立窗口槽，与Sidebar平级；它负责折叠、前进/后退、新任务。aside只负责项目/任务与账号区域。状态和回调仍由App持有。
- 窗口导航与按钮显式no-drag。Mac交通灯预留空间保留；≤224px宽时按钮24px/间距2px，200px左栏不再溢出。
- 窄栏分组工具行缩小内边距和图标按钮宽度。隐藏左栏时窗口导航仍挂载，主列标题让位；没有增加第二套开合状态。
- 既有⌘B、偏好持久化、拖拽宽度与列表状态保留。左栏材质沿用现有透明背景。

## 影响与验收

GitNexus Sidebar LOW（调用者App）、App LOW（入口main）；ShellLayout/SidebarBoundary未被当前索引收录，实际调用点已核对。未改内核或通信协议。

修改前证据：output/playwright/sidebar-2026-10-12T03-26-00.275Z/report.json，两条目标验收均失败。修改后目标覆盖：200/224/264/480px宽度、880px小窗口、深浅主题、真实按钮开合、⌘B、重载恢复、拖拽、折叠状态下新建任务与标题避让。

完整pnpm verify通过423单测、类型/架构/共享样式、构建和三类smoke。GUI使用隔离profile与合成ACP，未请求真实模型。

首次修改后GUI的S06误选了已隐藏的任务列表标题，导致等待超时；修正为可见卡片标题，失败报告保留，不计入通过结果。

最终专项GUI：output/playwright/sidebar-2026-10-12T03-41-21.453Z/report.json，6/6通过。主页GUI：output/playwright/homepage-2026-10-12T03-38-50.121Z/report.json，12/12通过。拖拽验收显式等待隔离窗口焦点与一帧布局，并记录实际宽度/持久化值；此前未同步的失败报告保留。

发布包两次隔离启动通过，已重开新版Nofy.app。证据索引：frontend-sidebar-2026-10-12-evidence.json。
