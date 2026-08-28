# Grok Build Web

Grok Build 代理的图形客户端，UI 与交互对标 ZCode 级别（参考 `ref-ui/` 的 clean 重写版移植，已去除原品牌信息）。
**先用网页版开发，稳定后套 Electron 壳**（`electron/` 已预留 stub）。

## 快速开始

```bash
cd web
npm install
npm run dev        # 一键拉起 nofy agent serve + Vite，默认即真实后端
# 打开 http://127.0.0.1:5173 直接使用（真实历史 / 真实对话 / 真实命令列表）
```

- `?ws=ws://host:port/ws?server-key=<密钥>&cwd=<路径>` 切换其他后端实例
- `?mock=1` 离线演示模式（纯 UI 调试用，默认关闭）
- `npm run dev:web` 只起 Vite（需自行启动 serve，默认连 127.0.0.1:9800/devsecret）

已实测验证（对真实后端）：`session/list` 历史列表、`session/new` 真实模型清单、
`session/prompt`（参数为 `prompt`）流式回复、思考/回复分离、工具调用生命周期、
`available_commands_update` → `/` 命令面板与技能页、`_nofy/sessions/changed` 侧栏实时刷新、
**`session/load` 历史会话完整回放**（含工具块）、`response_completed` 用量统计、
`last_turn_summary` 轮摘要、`_nofy/mcp/*` → 设置页 MCP 面板、会话导出 Markdown、
文件附件、多标签内嵌浏览器、全屏切换、`session/cancel` 停止。

## 功能清单

- **主屏**：时段问候 hero + 水印 mark、composer（工作区切换菜单、git 分支徽章、
  `@/路径` 上下文附加、变更前确认、计划模式、模型/供应商选择菜单、思考强度、公告横幅、建议卡片）
- **会话视图**：流式回复（光标动画）、Markdown 渲染（标题/粗体/代码块/表格）、
  工具调用块、工具审批（允许/拒绝）、计划批准后执行、追问、任务操作（重命名/置顶/归档/删除）
- **侧栏**：新建任务 Ctrl+N、搜索 Ctrl+K、自动化、技能、终端、浏览器六个入口；
  分组/项目分段控件；项目+任务两栏列表；用户 footer
- **搜索浮层**：任务 + 工作区模糊搜索
- **设置**：语言（zh-CN/en-US）、主题（暗/亮）、缩放、模型供应商、后端连接说明、关于
- **终端面板**：命令执行（mock 模拟；真实执行待 Electron/后端扩展）
- **浏览器面板**：内嵌 iframe 浏览
- **传输层**：mock（离线）/ ACP WebSocket（grok serve）/ Electron IPC（阶段 2），UI 零改动切换

## 架构

```
src/
├── lib/
│   ├── transport.ts   # Transport 接口 + 事件分发基类
│   ├── mock.ts        # 全功能内存后端：流式引擎 + 审批 + 假 shell
│   ├── acp.ts         # ACP (JSON-RPC 2.0) over WebSocket → grok serve
│   ├── rpc.ts         # HostClient 门面（方法面与参考实现一致）
│   ├── client.ts      # 传输选择：IPC > ?ws= > mock
│   ├── i18n.ts        # zh-CN / en-US 全量文案
│   └── format.ts      # 时段问候 / 相对时间
├── components/        # Sidebar / Titlebar / HomeView / TaskView /
│                      # SettingsView / SearchOverlay / ListView /
│                      # TerminalView / BrowserView
├── icons.tsx          # 线性图标集
└── styles/app.css     # 主题变量 + 布局（含亮色主题）

electron/              # 阶段 2 预留：main.ts / preload.ts stub（未接入构建）
```

### 后端接口（不另建 API）

| 接口 | 结论 |
|---|---|
| TUI (ratatui) | 渲染层，非数据接口 |
| **`grok serve` `/ws`** | ✅ ACP JSON-RPC over WebSocket，`server-key` 鉴权，浏览器可连 |
| `grok --stdio` | ✅ 同协议；Electron 阶段 main 进程 spawn |
| ptyctl | 终端面板可选接入 |

已知缺口：ACP 暂无历史会话 list 方法（当前标签页内会话可用）；终端真实执行需 Electron 或后端扩展。

## 路线

1. **阶段 1（当前）**：网页版全功能 UI + mock/ACP 传输。
2. **阶段 2**：Electron 壳（electron-vite / electron-builder），renderer 零改动；
   `vite.config.ts` 的 `base: "./"` 已为 `loadFile` 准备好。
3. **阶段 3**：历史会话扩展、终端接 ptyctl、打包分发。

## 命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 开发服务器（0.0.0.0:5173，自动拉起 serve） |
| `npm run build` | 类型检查 + 产物到 `dist/` |
| `npm run typecheck` | 仅类型检查 |
| `npm run preview` | 预览构建产物 |
| `npm run desktop` | 构建并启动 Electron 桌面版 |
| `npm run desktop:view` | 桌面版 + CDP 调试端口（9223） |

### 无显示器机器上看桌面版

桌面版跑在 Xvfb 虚拟屏上时，用投屏页远程操作真实 Electron 窗口：

```bash
xvfb-run -a npm run desktop:view
# 任意浏览器打开（鼠标/键盘/滚轮直接操作桌面窗口）：
# http://<host>:5173/desktop-view.html
```

原理：Electron CDP `Page.startScreencast` 帧流经 vite `/cdp` 代理（同源，免 CORS），
输入事件经 `Input.dispatch*` 回注。启动需 `--no-sandbox --remote-allow-origins=*`
（开发机沙箱权限与浏览器 Origin 检查所致）。
