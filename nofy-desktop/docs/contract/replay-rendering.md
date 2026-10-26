# 历史恢复时的批量渲染

2026-10-08 的 Electron GUI 回归，在 1000 块历史与 renderer reload 场景复现了
React Maximum update depth exceeded：65 条 pageerror，堆栈起于 preload 的
IpcRenderer 消息回调。App 直接订阅同步 store，批量历史导致密集的强制 React 更新。

修复只改变 UI 的订阅层。`createFrameView` 缓存渲染快照，将一次突发的通知合并；
`useFrameState` 以 16ms 定时器交付最新快照。reducer 和 store.getState 仍逐事件同步，
权限、去重高水位、完整历史和出站动作不经过节流。处理动作时仍查实时 store，
避免用延后的 UI 快照应答已失效请求。

使用定时器而非仅依赖 requestAnimationFrame，使隐藏窗口仍可推进状态；
最后一个订阅者离开时取消调度并退订。不会通过吞掉异常、隐藏 console 或丢弃回放帧来消除刷屏。

验证：frame-store.test.ts 检查 1000 次同步更新只投递一次最终快照、退出取消调度。
完整 Electron 复测结果以 output/playwright 下本次运行的 report.json 为准，GUI 使用确定性 ACP 测试内核，不等同真实模型调用。

复测（2026-10-08）：类型检查、构建与 253 条桌面测试通过；Electron GUI 11/11，
pageerror 0。证据：`../../output/playwright/2026-10-08T10-01-03.803Z/report.json`。
1000 块历史与 renderer 重载均完成，未再出现更新深度异常。
