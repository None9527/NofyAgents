# Codex 桌面壳前端结构分析

日期：2026-10-09。分析方式：只读安装包静态资源，不启动提取代码，不读取账号、会话、凭据或配置，不修改安装包。

## 对象与证据边界

本机路径 `/Applications/ChatGPT.app`，Info.plist 实际标识 `com.openai.codex`，产品 manifest 为 Codex，版本 26.930.51102，build 13100。目录名不能用来判断其内部产品身份。
资源在 `Contents/Resources/app.asar`。清单 20809 个文件项，webview 下 14527 个 JS、310 个 CSS；包含大量 ChatGPT/Work/业务 widget，不能将这个数量当作 Codex 源码模块数量。
没有 `.map` 文件项，尽管 JS 末尾仍有 sourceMappingURL；不能据此恢复原始 TypeScript、源码目录、完整组件名称或作者的模块设计。以下是产物结构，不是官方源码架构图。

证据：[静态路径、依赖与哈希](codex-shell-evidence-2026-10-09.json)。提取资源仅放在 `/tmp/nofy-codex-shell`，项目内只保存本报告和元数据，不引入其运行代码。

## 可以确认的结构

### 1. 宿主与 webview 分离

manifest 显示 Electron、Vite 和 Electron Forge；主入口 `.vite/build/early-bootstrap.js`，还有 main、bootstrap、preload、worker 等独立构建产物。安装包包含自定义 Codex Framework。
主进程依赖列有 app-server-manager、app-server-types、protocol、git-worker、shared-node、node-pty；main 产物中有 host 级 app-server manager 创建与传输适配。

preload 使用 contextBridge 暴露 electronBridge，提供 view 消息、worker 消息订阅、共享对象快照、初始侧栏数据和系统主题等能力。宿主服务入口与界面有桥接边界，但它的消息入口也比较宽，不能仅凭存在 preload 判断所有业务接口已经窄化。

### 2. 启动分阶段，有集中服务入口

webview/index.html 加载 index chunk 和 app-shared CSS；index 先初始化并载入 rpc，再加载 app-main。app-main 查找 root 并通过 React createRoot 渲染。
rpc 模块导出 appHost、appServices 和 initializeAppHostServices，证实存在集中宿主/服务入口。

有 app-shared、app-initial、app-primary 和大量领域 chunk。存在动态 import；不能将每个命名 chunk 等同为一个源文件，也不能把静态依赖当作浏览器实际执行时序。

### 3. 对话按显示职责分开

实际命名和静态依赖：

```text
local-conversation-page
  → local-conversation-thread
      → local-conversation-thread-turn-entries
      → local-conversation-turn（清单中存在）
      → virtualized-turn-list
          → thread-virtualizer
          → thread-scroll-controller-context-value
```

page 有标题、策略、侧面板和 Git 操作等依赖；thread 依赖 turn entries、列表与其他业务模块。这支持“页面装配、会话内容、轮级读模型、列表承载分别组织”的判断，不代表 page/thread 已完全无业务编排。

virtualized-turn-list 产物包含 useSyncExternalStore、ResizeObserver 与 overscan。thread-virtualizer 有按 turnKey 的索引、估计/实测高度与偏移计算。可确认存在动态高度与滚动索引机制；不能仅据产物证明运行时无抖动或性能优于我们的实现。

### 4. 查询资源与外部订阅同时存在

manifest 明示 @tanstack/query-core，公共前端包包含 QueryClientProvider、查询/变更缓存相关实现；多个领域模块使用 queryKey/queryFn，bridge 模块有 invalidateQueries。
另有 useSyncExternalStore 及 selector 实现，虚拟列表自身也使用外部 store。

合理推断：查询结果、失效重读和持续更新的视图状态采用不同机制。不能据这些标记认定所有状态都由某个单一状态库管理，也不推断其完整 store 数量。

### 5. 设置有路由与页面生命周期

settings-page 依赖 use-visible-settings-sections、settings-route-state、settings-unsaved-changes-dialog、host dropdown 等模块，产物含 `/settings/:section/*` 路由。
分区另有 general-settings、git-settings、hooks-settings、worktrees-settings、MCP 与其他产品设置 chunk。
这说明设置入口不仅分组件，还处理分区可见性、路由状态、宿主选择与未保存修改。我们可以借鉴职责，不照搬其多产品/多宿主规模。

### 6. 有共享 UI 与样式体系

存在多组 button/dialog 控件产物，公共 CSS 有大量语义变量，settings 与 conversation 引用公共包。
可确认共享基础设施存在；不能推断只有一套控件或没有重复。多个 button/dialog chunk 可能由不同产品、版本或打包来源形成，缺少源码不能作唯一归因。

## 架构图：确认部分与推断边界

```text
Electron main
  ├─ app-server manager / transport
  ├─ 宿主服务（文件、Git、终端等）
  └─ worker 通信
           ↕ preload electronBridge
webview
  ├─ appHost / appServices 集中入口
  ├─ React 启动与路由
  ├─ 查询缓存 / 外部状态订阅
  ├─ 对话 page → thread → 轮级内容与虚拟列表
  ├─ 设置入口 → 路由/分区/未保存修改
  └─ 共享控件与样式
```

确认了安装包里的实现路径和调用标记；没有对运行中的消息流做动态追踪。公开 app-server 的内核边界另见主架构方案第 0 节，不将安装包分析替代协议契约。

## 不应盲目模仿的部分

未压缩磁盘字节：app-initial 约 11.17 MB，app-shared JS 约 7.78 MB，app-primary JS 约 2.33 MB；共享 CSS 约 1.24 MB。
入口直接依赖公共包并动态加载初始应用包，说明功能拆包同时仍有较大的公共/初始资源。此为容量事实，不是已测启动瓶颈；没有运行时 parse/compile、长任务或内存基准。

产品包含 Codex、ChatGPT/Work 及许多富内容模块。Nofy 当前无需复制这个产品范围，也无需先复制包数量、服务注册规模或全部依赖。

## 对 Nofy 的具体调整

| Codex 壳观察 | Nofy 对应改进 | 阶段 |
|---|---|---|
| appHost/appServices 入口 | 内部集中装配，页面只得到领域窄接口；不能重新暴露整个 Runtime | A1 |
| 查询缓存与外部订阅分开 | settings 查询按身份管理缓存/失效；会话流走投影与局部订阅；草稿留客户端偏好层 | A1/A3 |
| page/thread/轮级列表 | Shell 装配、Conversation 容器、轮级读模型、RowView 与列表承载明确分工 | A2/A3 |
| turnKey、高度测量、滚动控制 | 在稳定索引上实现虚拟化，并保证查找/折叠/底部跟随 | A5 |
| 设置路由与未保存修改 | 建立类型化 SettingsSection 注册表、持久导航入口和统一 dirty-close 协议 | A2/A4 |
| 共享 UI + 领域 chunk | 全量迁移共享控件；页面仅拥有布局；按实际需要懒加载重型内容 | A4 |
| worker 与宿主能力独立 | 保持 main/renderer 职责；只有基准证明阻塞时才把重计算迁到 worker | A0/A5 |

设置注册表的目标字段为 id、标题翻译键、图标、入口组件、能力条件；界面分区由它派生，不重复维护多套导航列表。编辑页面向 SettingsHost 注册 dirty 状态；切页/关闭统一处理，成功保存才清除 dirty，busy 时阻止重复提交。支持的 deep link 范围必须由产品路由声明，不直接采用 Codex 的全部路径。

不立即更换 reducer 或引入全套查询框架。先定义查询身份、失效与读取契约，再根据共享缓存/重试复杂度决定复用库。client projection 不成为内核事实存储；设置失败/冲突仍由适配层返回明确结果。

## 本轮交付与下一步

本轮完成静态产物分析与方案补充，没有实现代码迁移、没有更改 Codex 安装包、没有运行性能测试。
架构优化顺序仍为 A0–A6。A0 除依赖门与性能基线外，新增资源分类与设置入口盘点；A1 以模型/MCP/插件窄接口为第一批；A2 再收口 App 和设置编排。
