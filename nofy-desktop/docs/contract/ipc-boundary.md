# renderer ↔ main 边界契约（S0 落地）

裁定 B（PLAN §1）：renderer↔main 是**唯一**边界，形状自定义。本件是这个形状的
可执行说明书。代码：`preload/contract.ts`（类型与通道名）、`main/ipc/bridge.ts`、
`main/ipc/register.ts`、`main/ipc/hold.ts`、`preload/index.ts`、
`renderer/core/ipc-port.ts`。门：`test/ipc-bridge.test.ts`（10 例）。

说明（2026-10-09）：上文“唯一边界”指桌面内部 renderer/main 的传输适配边界；系统还有 main 与独立 Nofy 内核之间的 ACP/stdio 边界。它不表示内核并入前端。宿主能力已扩展，当前完整通道以 preload/contract.ts 为准。

## 1. 形状：KernelPort → wire → KernelPort

```
KernelConnection ──adaptConnection──▶ KernelPort ──createKernelBridge──▶ KernelBridge
        （main，stdio）                                        │ IPC（9 通道）
                                                              ▼
renderer 组件 ◀──bind/effects/project── KernelPort ◀──adaptIpcBridge── NofyBridge(preload)
```

两端同形，故 `bind.ts` / `effects.ts` / `project.ts` **一行不改**跨进程。
「边界透明」门用真夹具证明这一点：同一批信号，直连与跨 IPC 的终态 AppState
`assert.deepEqual` 相等，出站原语序列也相等（请求没被降级成通知、反之亦然）。

## 2. 通道表（全部集中在 preload/contract.ts 的 IPC 常量）

| 通道 | 方向 | 语义 |
|---|---|---|
| `nofy:signal` | main→renderer | **唯一**推送通道，载荷即 KernelSignal |
| `nofy:subscribe` | renderer→main | 订阅握手；返回时 sticky+缓冲回放已完成 |
| `nofy:request` / `nofy:ext-request` | renderer→main | 请求（等响应） |
| `nofy:notify` | renderer→main | 通知（不等响应；陷阱 T1/T13 的强制点仍在 effects） |
| `nofy:respond` | renderer→main | 应答内核→客户端请求 |
| `nofy:cancel` | renderer→main | session/cancel（notification） |
| `nofy:is-ready` / `nofy:bootstrap` | renderer→main | 就绪位 / 启动信息（cwd 等） |
| nofy:pick-files | renderer→main | **宿主能力**：系统选文件框（dialog.showOpenDialog，
  openFile+multiSelections）；取消＝[]。2026-09-13 用户裁定「添加附件＝Finder 窗口」。
  不经内核、不进 KernelPort 形状——它是 OS 能力不是内核能力，故不受「边界透明」门约束。 |

**没有「发一条任意帧」的口子**：request 与 notification 的区别是行为性的，
必须在类型上分开，不能靠调用方自觉。
nofy:pick-files 是唯一的「非内核」通道：载荷只有 {path,name} 字符串数组，
结构化克隆安全；main 侧取发送者所属窗口做模态父窗（register.ts）。

## 3. 不丢帧：三层早到暂存 + sticky

启动顺序刻意是 `connect()` → `createWindow()` → renderer `invoke(subscribe)`：
握手与建窗并行，代价是握手期无客户端。三层暂存互为双保险，任何一层调用顺序变化都不丢帧：

1. **main bridge 的 buffer**：无客户端时入队（上限 20000，溢出丢最旧并计数，
   `stats().dropped` 可见）；首次 attach 按序回放。
2. **preload 的 early**：`wc.send` 可能早于 renderer 调 `onSignal`；无监听者时暂存，
   首个监听者注册时 flush。`diagnostics()` 暴露 `early/droppedEarly/rejected`。
3. **ipc-port 的 early**：握手在构造时发出，而 `bindKernel` 的订阅在其后。

**sticky**：`status` 与 `ready` 是**状态**不是事件。reload 后 buffer 已空，
只有 sticky 能把「连接还活着、initialize 结果是什么」救回来。回放时 buffer 里的
status/ready 被 sticky 顶替（回放历史值会把「已断连」误报成「还活着」）。

## 4. 不悬死：outstanding 记账

未应答的 server-request 单独记账，每次 attach **重投**（权限请求不能因为一次 reload
就永远等不到裁决）。三处清账：`respond`、`cancel`（连带清该会话的）、
`status:false`（连接断了 id 全部作废——**buffer 里躺着的那些也要清**，
否则 attach 仍会回放成点了没反应的僵尸审批卡；本条由门当场抓到）。
已应答的 id 进 `answered` 集防重投。

## 5. hold 层：listenerCount 门

`KernelConnection.handleServerRequest` 对每类 server-request 先查
`listenerCount(...)===0`，为 0 立即自动应答 cancelled（node 直跑下的正确 fail-safe）。
桌面里裁决者在 renderer、main 只转发 frame 流 ⇒ 那些 typed 事件的 listenerCount 恒 0
⇒ **权限请求会在到达界面前被取消**，且无任何报错。
`hold.ts` 为五类事件各挂一个不作为监听者把计数抬到 ≥1；载荷仍只走 frame 流
（否则同一条请求推两次，界面出重复卡）。

## 6. 安全形状

`contextIsolation: true`、`nodeIntegration: false`、`sandbox: false`
（ESM preload 的硬要求，不等于给 renderer node 能力）。renderer 拿到的只有
`window.nofy` 的九个方法 + `diagnostics`。preload 对入站载荷做判别集合校验，
形状不符即丢弃并计数（`rejected`）——契约漂移的第一现场必须可见。
CSP 由构建注入：生产 `script-src 'self'`，开发额外放开 React Refresh 前导与 HMR ws。

## 7. 已知边界（诚实登记，不假装没有）

- **多窗口**：bridge 支持多客户端（clients>1），但 UI 的局部态（输入草稿、滚动位）
  在 renderer，两窗不共享——这是设计，不是缺陷。
- **reload 窗口**：未应答请求会重投（好事）；但 reload 前**已消费**的事件不重放，
  界面从空脊柱重建。要完整历史得走 P1 的 session/load 冷启动路径。
- **buffer 溢出**（>20000 条无客户端信号）会丢最旧；`dropped` 计数可见，
  正常启动路径实测为 0。

## 文件工作区宿主能力（2026-10-09）

`copyFilePath(value)` 与 `openWorkspacePath(path, kind)` 使用集中 IPC 常量，经 preload 到 main。kind 仅支持 default/choose/reveal；没有任意 shell/exec 入口。shared/file-host-contract.ts 只保存 DTO 与能力形状。

main 验证绝对路径、存在性、动作类型和原生选择的 .app；复制不要求目标仍然存在。返回结构化成功/取消/错误。选择应用为 macOS 实现，外部启动使用固定 /usr/bin/open 和 argv，不拼接 shell 文本。详见 [工作区工具栏](../architecture/frontend-workspace-header-2026-10-09.md)。


## 文件资源与设置命令补充

图片读取和目录变化使用 shared/workspace-files-contract.ts 的专用 typed 通道，经 DesktopClient.host 接入；每窗口限制 watcher 范围，退出清理。设置页面只消费 SettingsClient.models/credentials/catalog/mcp/plugins，不能直接访问 effect/bridge/native 配置写接口；native CAS 与重启仍由 main 保证。详见 [文件资源](../architecture/frontend-file-module-2026-10-10.md)与[架构收口](../architecture/frontend-closeout-2026-10-11.md)。
