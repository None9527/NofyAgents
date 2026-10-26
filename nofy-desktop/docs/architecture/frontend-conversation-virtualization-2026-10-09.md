# 长对话虚拟化第一版

2026-10-09。A5 首批建立在 A3 的稳定轮级索引和局部订阅上。内核、ACP 与 reducer 不变；本批只改变前端列表承载与定位。

## 结构与交互

application/conversation/virtualPolicy.ts 统一阈值、overscan、block 到 segment 的定位和固定行策略；ConversationPane 切换 session 时重建视图测量。Spine 继续负责列表与折叠呈现，TurnActions 报告弹窗生命周期。

达到 200 个 segment 时启用轮级虚拟列表，低于阈值保持普通列表。overscan 为 8，预估高度 220px，行间距 16px，实际高度由 measureElement/ResizeObserver 测量；窗口宽度变化重新计算列表 scrollMargin。稳定 key 来自 segment，而非位置。

依赖精确锁定 @tanstack/react-virtual 3.14.13。选用官方维护的 React 适配器，避免自行实现动态高度与范围计算。根据[官方 Virtualizer API](https://tanstack.com/virtual/latest/docs/api/virtualizer)并核对本地安装类型使用 anchorTo、followOnAppend、scrollToIndex、scrollToOffset 与 measureElement。在线最新 API 的 cancelScroll 在本次安装版本中不存在，未使用；最终像素定位用 scrollToOffset 结束索引滚动校正。

向上滚轮、滚动条操作、向上翻页或查找/折叠标记阅读历史，后续追加保留当前位置。底部距离小于 80px 时恢复跟随；初次批量加载和程序测量引起的滚动不误判为手动阅读。查找先定位所在轮并展开，再挂载目标 block，按实际 block 校正位置并避开顶部查找栏。回退弹窗打开时将对应轮加入 rangeExtractor，离屏后保留表单直到关闭。

## 验收与性能

隔离生产 Electron，1440×900，确定性 ACP 模拟内核：专门 9 项联调通过，无 pageerror。覆盖一万条消息末端加载、离屏精确查找、历史阅读期间追加、流式底部跟随、动态展开折叠、隐藏过程查找与窄窗口、会话切换、离屏回退弹窗、renderer 刷新恢复。报告：output/playwright/virtual-2026-10-09T15-51-24.059Z/report.json。

| 观测 | A3 非虚拟版本 | 本版 |
| --- | ---: | ---: |
| 10000 条消息的实际 DOM 消息块 | 10000 | 22 |
| 1000 条消息输入到下一帧 p95 | 12.1ms | 14.3ms |
| 10000 条消息输入到下一帧 p95 | 18.1ms | 14.3ms |
| 输入阶段历史 Markdown 执行 | 0 | 0 |
| 后台追加时前台 Spine / 通用 SettingsSurface 渲染 | 0 / 0 | 0 / 0 |

本版测量加载 1000/10000 块约 319/832ms，采样窗口无 longtask。单次各 20 次输入，不据此建立普适性能预算，也不宣称相对 Codex/ZCode 的速度。保留原始数据：[virtual](benchmarks/2026-10-09-conversation-virtual.json)、[A3 after](benchmarks/2026-10-09-conversation-after.json)。performance.memory 为粗粒度缓存值，不推导峰值内存改善。

完整 pnpm verify 通过：360 项单测（ACP 41、desktop 319），62 条夹具，架构/样式/类型/构建、协议 7、PTY 8、恢复 11。新增 2 项纯策略测试验证前缀/中间/末尾 block 定位及固定行排序去重。依赖门为 169 源文件、769 imports，存量例外仍为 15。

最终页面回归和包装证据见 [交付证据](frontend-conversation-virtualization-evidence-2026-10-09.json)。

## 限制与后续

DOM 上限由可见轮、overscan 与一个打开弹窗的固定轮控制；单个超长消息或展开轮含大量 block 时仍可能挂载大量节点，需要后续轮内处理。本版并不释放 store 中全部历史，也不消除行索引的 O(n) 引用扫描。

轮折叠状态由 Spine 保留；原生 details 等行内临时状态可能随离屏卸载重置。切换会话重建测量，不保存对话滚动位置到跨会话/重启偏好。查找仍扫描已加载内容；跨轮虚拟导航目录、精确内存测量、重复采样与性能预算尚未完成。

App 完整状态订阅、Sidebar/Composer/ApprovalHost 容器迁移，以及设置查询与 dirty-close 仍为后续工作。不将本批标记为完整 A3/A5/A6 关闭。
