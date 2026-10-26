# 可扩展窗口骨架第一版

本轮把导航、对话、右工作区、底部工具和完整页面路由组织成同一个窗口框架。沿用React、现有共享控件和application能力边界；没有引入另一套UI库或内核逻辑。

## 层级与状态

```text
WindowFrame
  ├─ persistent workspace（路由打开时hidden + inert，不销毁）
  │    └─ ShellLayout
  │         ├─ navigation slot：Sidebar + 独立WindowNavigation
  │         ├─ main slot：共享高度Header + conversation + bottom-tools slot
  │         ├─ right workspace：SideSheet + 注册面板/资源标签
  │         └─ overlays：palette/history/menus
  └─ route surface：SettingsSurface + 错误边界/返回入口
```

- `ui/windowLayout.ts`拥有几何与降级策略，输入实际容器尺寸与偏好，输出呈现尺寸。默认导航264px，对话默认舒适宽600px、手动最小280px（中栏专项第二版更新），右栏最小320px；自动右栏为可用工作区40%，上限548px，拖拽进入fixed，双击恢复auto。自动分配优先保留舒适阅读空间；手动允许280px中栏。601px以下可用工作区右栏使用原生modal。底部工具高不超过主视图可用高度45%，保留140px下限。
- `application/workspace/useWindowPreferences`仍是偏好所有者。新增auxSizing区分auto/fixed；旧非默认右栏宽度解释为fixed，默认宽度解释为auto。测量导致的夹限不覆盖用户偏好，明确fixed=548也能重载恢复。
- `ui/useElementWidth`同时测量高度，隐藏时保留最后有效尺寸，避免路由隐藏导致误折叠/原生dialog切成modal。`SideSheet.active`在路由替换时关闭top-layer，在返回时恢复。
- `WindowFrame`控制可见页面；SettingsSurface只在实际路由期间存在，workspace/终端节点保持。设置期间KeyboardScope统一停用工作区后代的window级快捷键（包括Spine查找），App顶层导航命令也停用，隐藏视图不接收输入；设置自身的保存/dirty保护保持生效。
- 对话、审批、队列和模型仍由既有application/core持有。终端仍由TerminalDock负责PTY与xterm，只改变它在窗口中的承载位置，移出conversation。

## 视觉基线

主视图与右栏为通顶平级区域，Header/TabStrip统一48px。去掉工作区内重复的4px框架间隔、卡片边框与圆角；两处接缝各占1px，命中区8px。保留原生窗口材质、侧栏整体页脚、内容中的气泡/输入区外观，以及220ms侧栏动效。代码/Markdown共享内容组件不改。

## 扩展入口

### 新工作区能力

1. 在application/workspace/panelTabs的PANEL_KINDS登记领域ID；PanelKind直接从该唯一列表派生。
2. 在features/shell/panelRegistry的WORKBENCH_PANELS登记名称、说明、图标、命令和视图工厂。Record类型强制每个ID具备定义。
3. 领域模块通过public.ts提供真实View和窄客户端能力；AuxPane的视图供应表接入该View。Header、空状态、切换器、新增菜单与命令中心自动复用同一元数据，App不增加新的面板条件分支。
4. 数据/请求/取消/恢复由application领域Owner实现，不放入注册表。面板渲染错误由ViewBoundary隔离，可重试，不影响对话与窗口按钮。

文件资源仍由原控制器管理，不将每个文件误登记为新的功能ID。预览/固定标签、模式、目录与阅读位置保留既有生命期。

### 新完整页面

向WindowFrame提供`route:{id,title,close,view}`。页面拥有自己的路由/表单退出保护；close只在其授权退出后调用。框架隐藏并inert工作区，保留资源和工具节点。错误边界提供重试与返回工作区入口，避免页面失败销毁工作环境。

### 新底部工具

通过ShellLayout的`bottomDock(height)`槽装配真实工具Host；height来自统一策略，open/偏好/实例生命期由application/该工具Owner持有。终端是已经运行的首个接入点。后续日志、调试器或任务控制台可使用该槽，不再放进Spine或ConversationDock，不先显示无实际能力的按钮。

## 验证边界

GitNexus App/AuxPane/loadLayoutInner/saveLayout LOW，直接调用者为main/App/偏好入口；ShellLayout/SideSheet/windowActions/useElementWidth尚未索引，手工核对调用。未增加架构豁免。源代码门目前210文件、980导入、14存量例外，七个样式所有者。

GUI使用独立profile、模拟ACP和真实Electron/宿主IPC。骨架5场景、侧栏11、主页14、工作区21、折叠间距1、设置20，另有万块虚拟化回归；骨架覆盖五种窗口宽度、通顶几何、真实注册命令、route前后同一workspace/dock/panel节点、草稿保持、隐藏输入隔离、bottom-tools独立位置与auto/fixed恢复。

首轮主页窗口意外退出未定位，重跑13场景通过，未把首轮计入通过证据。设置原ABA用例通过全局快捷键在隐藏工作区创建会话；现改为验证保存保护不被快捷键绕过，再显式回工作区完成A/B/A路由重入。领域迟到响应单测保留。失败记录保留于证据索引。

真实发送后无响应仍需单独做请求→内核通知→客户端投影→呈现链路验证；本骨架与模拟GUI不构成该问题的修复证明。Windows/Linux、远端CI和签名公证未作为本次实测项。

新骨架隐藏工作区暴露了真实阅读状态缺口：普通对话在设置往返后从offset -476变成24，丢失500px位置。已在useTranscriptScroll的capture/apply/onScroll统一拒绝零尺寸视图；观察器仍安装以接收重新显示。隐藏时冻结恢复锚点，重新显示沿用原150ms稳定测量机制，避免虚拟列表再漂移75px。函数未被索引，手工核对调用者仅Spine；普通对话GUI已复现修复前失败、修复后锚点与offset保持，万块虚拟列表另补route往返用例。真实复现报告保留在证据索引。

验证日志、截图与包证据见frontend-window-skeleton-2026-10-12-evidence.json。

最终pnpm verify通过428单测、样式/架构/类型/夹具、构建与7+8+11 smoke；七组83个GUI场景通过。万块历史设置往返前后匹配项均为y=71.8984375，DOM数量保持受控。

最终包两次隔离启动与内核回收通过；已重开release/mac-arm64/Nofy.app，确认1个主进程/1个独立内核子进程。
