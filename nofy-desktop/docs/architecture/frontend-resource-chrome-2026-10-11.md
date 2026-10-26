# 右栏资源布局收拢（2026-10-11）

后续修正：刷新/关闭工作区的“⋯”入口已全部去除，自适应预览以 `frontend-file-responsive-2026-10-11.md` 为当前实现。以下保留本轮首次收拢记录。

按用户提供的 Codex 截图，右栏保持通顶独立区域，收拢为「统一标签条 → 路径/操作条 → 预览与目录树」。ZCode 原版 `ref-desktop/packages/ui/src/app-shell/AnimatedSidePanePanel.tsx:953` 和 `SidePaneTabTrigger.tsx` 同样将真实资源标签放在侧栏顶部；旧实现将模块标签和文件标签分成两层，属于本项目重复建模。

## 实现

- AuxPane 顶部直接展示文件标签，与审查/子智能体同排。选中的标签自动进入横向视口，新增入口保持可见。没有文档时仍保留文件工作区入口。
- FilePane 只负责路径、预览与目录树，不再创建内部标签条。文件控制器仍属于 application/workspace，由 AuxPane 统一装配；切换到其他模块暂停读取、搜索和文件监听，保留缓存标签与位置。
- 固定标签、刷新、关闭文件工作区进入“文件操作”菜单。双击仍可固定。Markdown 大栏提供直接模式切换，小栏通过菜单切换；复制路径、系统打开、打开方式和目录开关保持原生桥接。
- 去掉固定/刷新专用行。预览和目录树共享背景色，按钮使用现有共享组件与样式 token。无扩展名文件使用 text 语言，避免将完整路径误当语言再次显示。
- 文件会话隔离、预览槽、迟到响应过滤、阅读位置恢复和原生 modal 菜单行为沿用既有契约。

## 影响范围

GitNexus：AuxPane LOW，直接调用者 App；FilePane LOW，直接调用者 AuxPane。ResourceHeader、FileViewer、useFileWorkspace 未被当前索引收录，结果 UNKNOWN；实际调用链已核对。代码变更限于 nofy-desktop 的右栏、窗口样式、翻译与隔离验收脚本；未修改内核。

## 验证

完整 pnpm verify：423 单测，架构/共享样式/类型/夹具审计、构建和三类 smoke 通过。隔离 Electron 工作区验收新增单层标签、菜单刷新、模块切换、320/400/548px 深浅主题几何与无扩展名语言检查，保留原有 17 条工作区回归。主页 10 条 GUI 回归通过（原生 modal、菜单、阅读/审批/队列行为）。本轮没有重新声明整套 82 条 GUI，也未重新运行性能基准。

实际模型请求未调用；截图是隔离 Electron 合成工作区。发布包为本地 ad-hoc 签名，不包含独立内核。

证据索引：`frontend-resource-chrome-2026-10-11-evidence.json`。工作区 19/19、主页 10/10 GUI 通过，无 pageerror；包的两次隔离启动通过。已重新打开 release/mac-arm64/Nofy.app。
