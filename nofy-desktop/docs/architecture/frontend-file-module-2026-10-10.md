# 文件工作区资源模块

2026-10-10。整合预览能力、变化失效与视图恢复；内核仍负责文本读取和目录清单，renderer 不取得 Node/fs 或通用 IPC 能力。

## 职责与能力

application/workspace/fileCapabilities.ts 统一预览类型：Markdown 与文本仍走现有 ACP 读取；PNG/JPEG/GIF/WebP 走宿主受限 raster 接口；压缩包、PDF、Office、音视频、字体、数据库和 SVG 显示不支持预览及外部打开提示，不请求 ACP 当作文本。未知后缀仍尝试内核文本接口，binary 响应降级。

shared/workspace-files-contract.ts 定义图片读入和目录变化订阅。main/seam/workspace-files.ts 验证绝对路径、realpath 与工作区范围，拒绝指向外部的符号链接；按内容签名识别 raster MIME，单文件限 8 MiB，PNG/GIF 另检查像素上限。renderer 仅接收 data URL；不创建本地 file URL，不执行 SVG/HTML。图片解码失败显示明确状态，已有打开方式和路径复制复用 DesktopClient.host。

原生文件监听由 main 持有，每个 webContents 一份。覆盖根目录、展开目录和打开文件的父目录，最多 32 个目录，非递归；变化按 100ms 合并、每次最多 64 条路径。重新订阅关闭旧 watcher 并移除 destroyed listener，unwatch、窗口销毁和 IPC 注册器退出都清理句柄。preload 仅暴露 typed 变化事件，application 按订阅 id/root 验证归属；会话/连接切换隔离旧事件。

createFileResources 使相关目录与文档失效，只即时读取当前文件，其余已打开文件标为 stale 并在激活时读取。目录和文件分别使用请求版本，强制刷新可取代在途旧请求。删除/读取失败保留最后已知内容，同时显示错误与缓存过期状态；不把旧内容冒充当前磁盘内容。

## 恢复与偏好

fileWorkspacePrefs.ts 校验并编码视图，fileWorkspaceOwner 在连接代际变化时丢弃全部正文/目录缓存，然后按 root/session 取回固定标签、活动资源、Markdown/source 两种位置、展开目录、树宽及开关。恢复后的当前文件重新读取，旧连接内容不复用。

窗口偏好只保存固定标签与视图元数据，临时预览、搜索输入和正文/图片不落盘。保留最近 4 个作用域，每个最多 12 个固定标签、32 个展开目录；拒绝跨根路径、..、NUL、重复项与非有限位置。滚动位置在内容加载完成后恢复，避免 loading 空视图将保存位置压成 0。未修改内核会话事实。

## 验证

完整 pnpm verify 通过；随后新增重连恢复/目录竞态两项测试，重新执行全部 pnpm test 与 pnpm typecheck。最终 386 项单测（ACP 41、desktop 345），架构/样式/类型/构建与夹具卫生、协议 7、PTY 8、恢复 11 通过。

新增 13 项原生/资源测试覆盖图片范围、内容签名、字节与尺寸限制、watch 合并/停止/上限、恢复数据过滤、刷新竞态、删除保留缓存、连接代际仅恢复元数据、旧目录响应隔离。

生产 Electron GUI 59/59，无 pageerror：文件 17、设置 20、对话/审批 11、项目/会话 11。文件新增 raster 真实 IPC、unsupported 不读文本、外部改写自动读取、删除过期提示、renderer 重载恢复固定标签/模式/位置/树宽；原路径工具栏与树拖拽仍通过。

一万消息模块隔离性能断言通过，后台正文不绘制前台对话、输入区、侧栏、审批、队列或通用设置：[原始记录](benchmarks/2026-10-10-file-module.json)。单次模拟数据，不作为进程内存或通用性能预算。

架构门为 185 源文件、869 imports，仍为 15 条存量例外。[交付证据](frontend-file-module-evidence-2026-10-10.json)记录测试/GUI 路径、源文件与安装包校验。

## 边界

仍为只读工作区；PDF/视频/Office 等使用现有宿主打开能力。watch 是操作系统非递归事件通知，不保证网络盘、权限变化或所有原子目录替换的完整事件；可手动刷新。监听目录超出上限时其余目录需要手动刷新/重新展开。文本仍受内核读取行数限制。

恢复不跨不同 root/session 共享标签；不保存临时预览，删除或不可读路径会在重新读取时明确失败。缓存仍受 4 个 owner/12 个标签的数量上限约束，未测量总体图片解码峰值内存，JPEG/WebP 未统一像素上限；不宣称完整媒体资源平台。

后续按模块收口剩余架构债务：设置命令接口、窗口编排与性能预算，集中检查生命周期与依赖门，而非继续散落添加控件。
