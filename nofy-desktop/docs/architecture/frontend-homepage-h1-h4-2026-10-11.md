# 对话主页第一版 H1–H4 落地

2026-10-11。执行来源：frontend-zcode-homepage-audit-2026-10-11.md；用户进一步明确右栏必须通顶、与对话区平级。保留独立内核、typed ACP 客户端、现有虚拟化和共享样式模块。

## 最终结构

```text
Shell
├─ Sidebar + 左栏把手
└─ Workbench（整窗高）
   ├─ Conversation column
   │  ├─ 任务标题栏
   │  ├─ Timeline
   │  └─ Conversation dock / Terminal
   ├─ 通高分隔条
   └─ 独立右栏
      ├─ 标签栏（与对话卡片顶部对齐）
      ├─ 文件路径 / 复制 / 打开 / 目录开关
      └─ 文档与文件树
```

右栏不在 card__body 内，对话标题不跨到右栏。ShellLayout 只组合工作台插槽；内核与会话状态没有转移到布局组件。

## H1：共同宽度与独立分屏

- 新的 conversation-column 规则由对话宿主容器裁决：常规 w-full 减两侧安全边距；864px 中档减96px并封顶896px；1280px宽档减384px并封顶1152px。
- 历史、输入、审批、队列和查找共用该规则；删掉孤立的64rem正文 token 和正文双层padding。
- 空态 greeting 与输入共同布局，宽度上限672px，低高度安全居中并允许滚动。
- UI geometry policy 将实际空间与偏好宽度分离。并排必须保留520px对话内容、320px辅助区，并预留分隔条4px、主区边框与边距6px；不足850px工作台空间使用modal sheet。依据工作台实际宽度，不再用窗口900px切换。
- 右栏是工作台平级独立区域，顶部/底部各4px窗口内边距，内部标签栏与自己的内容区组成完整面板。
- 并排态不执行dialog.show的自动焦点动作；覆盖态用原生showModal提供背景inert、焦点边界和Escape。Cmd/Ctrl+Alt+B可关闭弹层，背景命令不透传。
- 共享菜单portal挂到所属打开dialog，解决modal背景inert导致内部菜单不可点击的问题；普通窗口仍挂body。

## H2：会话阅读记忆

application/conversation/readingMemory 是状态所有者，按runtime/session隔离，64项LRU上限。只保存 following、anchor key、offset、scrollTop，不保存消息正文或DOM；跨原生应用重启的阅读记忆尚未增加。

ui/useTranscriptScroll 是唯一滚动协调者，处理用户滚动意图、跟随、几何变化、阅读恢复。增加“回到最新消息”入口。虚拟历史切回时先定位离屏行，保留目标offset直到测量稳定后才保存；修复曾复现的约75px恢复偏移。

常规与虚拟列表都保留原来的增量投影、memo历史行、动态测高和200轮虚拟阈值。没有把完整AppState重新接回App订阅。

## H3：底部交互与提交确认

- ConversationDock局部订阅当前会话审批；阻断交互替换输入视图，保留composer挂载与草稿。避免审批和不可发送的输入同时挤占正文。
- 输入状态明确为 unavailable / submitting / busy / ready。提交阶段含原生目录检查到内核确认之间的异步窗口。
- 运行中空草稿显示停止，有文字或附件显示可发送；仅附件输入可提交。正在取消的轮次拒绝追加并保留草稿。
- 使用现有ACP session/prompt；生成_meta.promptId，未虚构独立enqueue/steer方法，也未强迫内核sendNow。
- promptAdmission区分接收与执行完成：新用户消息完整回声或相同promptId的权威队列条目可确认接收；否则等待原RPC。历史相同文本和其他队列id不能确认接收。确认后按提交版本清理草稿，保留期间新增的输入。
- 追加请求失败只记录该错误，不将原来仍运行的轮次置为空闲。

内核源码依据：nofy-shell/src/agent/mvp_agent/acp_agent.rs读取_meta.promptId，RPC等待rx执行完成；session/acp_session_impl/prompt_queue.rs的队列id来自prompt_id。实际模型/队列网络联合执行未在本轮调用；busy路线通过隔离ACP模拟器和单测验证。

## H4：消息与过程呈现

- 气泡自然宽度，宿主≥624px时封顶576px；按钮4px紧贴、桌面hover/focus显示继续保留。
- 思考、连续查阅和工具使用紧凑、各自可展开的行；过程摘要默认可见，整体收起不吞掉中间commentary。正文后的工具仍保持时间顺序。
- 历史行不再普遍执行入场动画。保留CommonMark/GFM、表格控件、代码复制/下载/换行和hook视图排除。
- 没有添加虚构的点赞、时间戳或思考耗时。

## 与右栏层级调整一起修复的文件回归

FileViewer原来在父dialog尚未显示、clientHeight为零时恢复scrollTop，导致保存位置仍为340px而DOM显示0。现在等可见尺寸就绪后恢复，并在恢复期间屏蔽无效scroll写回。图片还等待实际尺寸加载。右栏隐藏/重开、文件模式切换和renderer恢复不再丢失原有文件阅读位置。

## 验证

- pnpm verify：423单测（ACP41 + desktop382），生成契约、架构、共享样式、类型、夹具、构建、协议smoke7、PTY8、恢复11通过。
- 82项隔离Electron GUI：主页10、虚拟历史10、用户动作与富内容6、会话5、菜单/玻璃3、文件17、设置20、renderer11。主页包含14组窗口/侧栏组合的开闭对照、通顶与平级DOM断言、长模型名称、原生modal菜单和焦点验证。
- 文件17项包含独立目录树拖拽、模式与滚动、外栏开闭、文件外部更新/删除、图片、归档、native copy/open和刷新恢复。
- 性能3次采样，1k/10k各60输入样本：p95 24.1/24.4ms，DOM消息24，流式App渲染5，failures=[]；在本机33.4ms预算内，不宣称比ZCode更快。
- 包验证仍同时隔离NOFY_HOME和Electron profile，验证两次实际包启动、截图和内核回收。

精确报告、源码hash、包hash见 frontend-homepage-h1-h4-evidence-2026-10-11.json。测试脚本采用实际提交/完成语义，不能再以发送按钮存在推断空闲；虚拟基准额外记录离线RPC完成，防止旧回合的chunk-20误满足新回合等待。

## 保留边界

内核目录存在性检查、sessionReady与transportReady分离、失败回放的原子保留仍属于前后端协作报告的后续工作，本次未修改Rust或更换用户安装的内核。也未增加真实模型网络验收、浏览器tab能力或全套ZCode功能。原14条架构存量例外继续存在。
