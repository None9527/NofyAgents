# 右栏共享组件与视觉规格（2026-10-12）

现有客户端使用内部ui组件层，没有安装ZCode/Radix/shadcn组件库。之前只复用Btn/MenuButton/TextInput，右栏组合仍自绘并散布尺寸：workspace.css里的32px文件标签被后加载styles.css的28px旧芯片覆盖；路径、按钮、搜索各用一套高度；空状态的h2/p默认margin造成过大间距，灰色占位卡片导致不齐。

## 统一后的所有者

- ui/workbench.tsx：PaneToolbar、PaneButton、PaneIconButton、PaneMenuButton、PaneActionGroup、PaneTab、PaneSearch、PaneEmpty、PaneChoice。复用原Btn/MenuButton/TextInput，不增加第三方依赖。
- ui/foundations.css：右栏规格token，控制尺寸、半径和间距复用既有ui-control-md/radius-lg/spacing。
- ui/components.css：上述共享控件的视觉与状态；primary控件32px、toolbar48px、标签32px/156px、主要图标16px，空状态图标24px。
- ui/workspace.css：文件、审查、子智能体布局与目录行；目录行28px、固定展开槽位、图标/名称对齐。shell styles.css不再持有旧右栏芯片、工具条、空卡片、审查布局。

真实调用点：AuxPane的模块/文档标签共用PaneTab，空面板选择行共用PaneChoice；ResourceHeader/ReviewPane共用PaneToolbar和图标动作；文件搜索与标签搜索共用PaneSearch；FilePane/FileViewer/ReviewPane/子智能体共用PaneEmpty。

## 视觉变化

路径改成一行平整面包屑，去掉按钮胶囊包胶囊；主操作尺寸对齐，窄栏模式按钮保留图标和可访问名称。零标签页只展示三个真实可用入口：文件、审查、子智能体，移除未实现的辅助对话/浏览器灰卡。空状态标题段落margin归零，缩小无意义的图标和留白；文件内容与目录沿用同一背景与细线。

## 风险与验证

GitNexus AuxPane/FilePane/ReviewPane LOW，调用链App→AuxPane→右栏视图；ResourceHeader/WorkspaceExplorer/FileViewer未索引，实际调用点已核对。没有修改基础MenuButton/Btn函数或内核协议。

pnpm verify：423单测、类型/架构/样式、夹具审计、构建与三类smoke通过。隔离Electron：21工作区GUI+12主页GUI通过，无pageerror。新增空状态只含三条可用入口、margin归零；320/548px深浅主题下工具条48、标签/按钮/搜索32、目录行28的真实DOM尺寸检查，覆盖以前的cascade覆盖错误。保留pin/close/Markdown切换/复制/打开方式/监听/位置恢复/原生modal菜单回归。

GUI报告：output/playwright/workspace-2026-10-12T09-13-43.626Z/report.json；output/playwright/homepage-2026-10-12T09-13-55.223Z/report.json。截图是隔离合成内容，无真实模型请求。本轮未重新运行性能基准，也不宣称Electron/CDP覆盖OS原生标题栏点击。

构建脚本已增加样式归属门，并通过独立临时目录的反例验证：shell里的右栏控件样式与workspace里的ui-pane共享控件覆盖均被拒绝。发布包两次隔离启动通过，已重开新版Nofy.app。证据索引：frontend-workbench-ui-2026-10-12-evidence.json。
