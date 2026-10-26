# 文件工作区：路径工具栏与目录树拖拽

2026-10-09。本批补齐用户截图指出的缺项，承接 [只读工作区 v1.2](frontend-file-workspace-2026-10-09.md)。

## 交付行为

主工具行按顺序显示路径面包屑、复制、打开方式和图标目录开关。长路径可横向查看，切文件时优先显示末端文件名；完整地址仍可通过 title 查看。源码/预览、固定与刷新位于次级工具行，避免挤掉截图所要求的主行。

复制主按钮复制完整路径；下拉还提供相对路径与文件名。剪贴板调用实际 main clipboard.writeText，取消/失败不冒充成功。

打开主按钮调用系统默认文件关联；下拉提供系统默认、选择应用打开、在文件管理器中显示。选择应用在 macOS 使用原生 .app 选择框，并由 main 通过固定 /usr/bin/open 与参数数组启动；renderer 不能指定 shell 命令或任意程序路径。取消保持页面，失败显示诊断。选择应用未实现 Windows/Linux 版本；默认打开和显示由 Electron 宿主 API 提供，本次只实测 macOS。

最右侧目录树有独立的左缘拖拽把手，拖向左增宽，拖向右缩窄，左右方向键也可调整。宽度保存于工作区 view owner，隐藏/显示以及近期会话切换会保留，不写进外侧面板宽度。值限制 150–480px，并给正文至少保留 220px；窄面板继续使用抽屉，不显示拖拽把手。应用重启不持久化该宽度。

## 层次与边界

- `shared/file-host-contract.ts`：纯 DTO/能力类型，新增 copyFilePath 与 openWorkspacePath 两个窄能力。
- `preload/contract.ts` 与 index：集中 IPC 通道及明确方法，没有通用 invoke/exec 入口。
- `main/seam/file-host.ts`：参数、文件存在性与应用 bundle 路径校验，宿主 provider 适配；可在 Node 单独测试。
- `main/seam/register.ts`：Electron clipboard/shell/dialog 与固定 execFile 装配。Native host actions 不经过 ACP，不实现内核逻辑。
- `DesktopClient.host`：renderer 应用层宿主门面；页面不直接获取 clipboard、shell 或 ipcRenderer。
- `ResourceHeader`：主/次工具行、异步反馈和路径身份保护。双击请求受互斥保护；切路径、A/B/A 或卸载后旧反馈不回写。
- `TreeResizeHandle` 与 fileResources：元素级 pointer capture/键盘输入与 view-owned 宽度；不访问全局 DOM 或另建偏好状态源。

新 shared 目录纳入 AST 扫描与层次策略，main/preload/application 允许导入纯共享契约，没有追加存量豁免。目录层与请求/通知 ACP 规则不变。

## 验证范围

新增 5 项宿主测试和 1 项宽度测试；覆盖复制、实际路径分派、打开错误、选择/取消、无效路径、宽度限制与保留。

文件 Electron 回归由 9 扩展为 12 项。新增验证真实 IPC 与原生 clipboard 的读回、拖拽/键盘/隐藏恢复，以及 default/reveal/chooser cancel/error 的 main provider 分派。外部应用打开和 reveal 在 GUI 测试中使用宿主 provider stub，以避免自动打开用户外部应用；实际 .app 成功启动未作为 E2E 实测项。Node 测试验证选定应用与文件路径精确传给 provider，生产代码使用固定 OS launcher。

未提供系统应用列表枚举、默认应用偏好写入、文件编辑/watch 或更改文件关联。打开反馈表示宿主调用返回，不保证外部应用已完成渲染。最终 `pnpm verify`：353 项单测（ACP 41、desktop 312）、59 条夹具、架构/样式/类型/构建、协议 7/7、PTY 8/8、恢复 11/11 全部通过。架构扫描为 159 源文件、730 imports、15 条存量例外，没有新增豁免。

最终 Electron 报告 `output/playwright/workspace-2026-10-09T09-16-14.643Z/report.json`：12/12，consoleErrors 为 0。macOS arm64 包更新后，两次隔离启动与内核回收通过。本地 ad-hoc 签名，不捆绑内核。源码、截图报告与包摘要见 [交付证据](frontend-workspace-header-evidence-2026-10-09.json)。
