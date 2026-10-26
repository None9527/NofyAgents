# 桌面与内核协作排查：失效工作区与生命周期

日期：2026-10-11。范围：实际 Nofy macOS 包、Electron 持久化、桌面会话协调、ACP 投影、Rust 会话建立。结论来自现场路径、源码、隔离 GUI 与协议探针；没有调用模型 API。

## 1. 现场与直接原因

截图使用 `nofy-package-workspace-f3QwEp`；文件系统确认目录已经删除。相同完整路径出现在 `/Users/mac/Library/Application Support/Nofy/Local Storage/leveldb/000016.log`。真实 `~/.nofy/sessions` 下也存在对应编码工作区目录，含 25 个 JSONL 文件；这不等于 25 个会话，未读取对话正文或配置密钥。

该路径前缀由 `apps/desktop/scripts/verify-package.ts` 创建。原脚本只隔离 `NOFY_HOME`，没有隔离 Electron `user-data-dir`，并在结束时删除临时工作区。窗口偏好由 localStorage 持久化，独立于内核的 NOFY_HOME。

源码还显示，`useWorkspace` 原来直接相信保存的 selected；`useSessionNavigation` 优先恢复保存的 last-session。正常启动可以在真实内核上创建临时目录对应的新会话。真实会话目录与现场偏好都吻合这条污染链路；未保留原先那次验证的时间级协议帧，因此不声称已经逐帧重放事故。

原发送路径未检查会话 cwd，直接发 `session/prompt`。模型随后才发现 shell 工作目录失效，浪费一轮请求，并把本应由应用解决的问题交给用户。复制原测试目录或重建同名空目录不是修复：会掩盖原项目身份错误。

## 2. 发现与处理

| 优先级 | 问题 | 证据位置 | 本轮处理 |
| --- | --- | --- | --- |
| P0 | 包验证污染正常窗口偏好 | scripts/verify-package.ts | 两次验证显式使用隔离 Electron profile，仍隔离 NOFY_HOME；清理仅作用于测试目录 |
| P1 | 已删除 selected 直接成为创建目录 | application/workspace/useWorkspace.ts | 启动前原生校验，失效选择回退到有效 bootstrap，移除该 selected 对应最近项目；无有效目录则等待用户选择 |
| P1 | 无条件恢复失效 last-session | application/sessions/useSessionNavigation.ts | 校验恢复目录，失效时清除该恢复指针并在有效目录建立新任务；不删除内核历史；异步校验不能抢占较新的用户导航 |
| P1 | 发送缺少工作区前置检查 | application/client.ts | 创建与发送走共享 checked；检查真实 session.cwd，不使用选中项目代替；失败保留草稿，且不发 prompt、不乐观置 running |
| P1 | 检查期间传输或 session cwd 可变化 | application/client.ts | await 后复核 transportEpoch、ready 和该 session.cwd，拒绝陈旧请求 |
| P1 | Finder 的进程 cwd 被当作项目 | main/index.ts workspaceCwd | 打包启动 cwd 为 `/` 或应用资源目录时采用用户主目录；显式 NOFY_WORKSPACE 不被静默替换 |
| P1 | 内核工作区解析只有路径格式检查 | nofy-shell/src/agent/mvp_agent/session_setup.rs:191–211 | 本轮桌面前置拦截；Rust 源码未修改，不能宣称其他客户端也得到保护 |
| P1 | 传输 ready 与会话恢复 ready 未分离 | core/project.ts connection/initialized；useSessionNavigation 重连 effect | 尚未修改：需要会话按 transportEpoch 管理恢复状态，并在恢复成功前阻止发送 |
| P1 | fresh load 在 RPC 成功前清除投影 | core/effects.ts session/load | 尚未修改：需要暂存回放并原子替换；失败保留旧投影，不能简单把 reset 移到 RPC 后，因为通知可能先到 |

新的原生接口是 typed `validateDirectory(path)`，由 preload/contract.ts 单一声明，经 main 的同一个 native-files.validateDirectory 校验。renderer 不自行访问磁盘，不根据目录名字过滤错误；真实工程目录被删除时也能拦截。历史会话可手动打开阅读，失效 cwd 不被自动重绑定到其他项目。

## 3. 独立内核的边界与版本

现场内核进程实际来自 `/Users/mac/.local/bin/nofy`；CLI 返回 `nofy 0.2.121 (51643aed0e21)`。桌面包版本为 0.1.0，包不包含 Rust 内核。重打桌面包不会更新该二进制，也不能证明仓库 Rust 改动已经在现场运行。

`main/kernel/bin.ts` 的发现优先级是显式 NOFY_BIN、用户安装位置、开发仓库 release 兜底。构建版本和运行版本应成为验收证据的一部分。暂不改变该发现顺序，避免隐式切换用户安装内核。

源码 `new_session_inner` 和 `attach_session` 共享 resolve_workspace；该函数通过 AbsPathBuf::new 接受绝对路径，然后处理 folder trust/MCP，没有目录存在性检查。合理的后续职责是：

- 创建新会话时，内核验证 cwd 的存在与可执行性，并返回可分类的 WorkspaceUnavailable 业务错误。
- 历史载入允许查看失效工程的历史，显式标记工作区不可用；不能因目录不存在拒绝全部历史。
- prompt 在真正执行前再检查工作区，覆盖桌面校验之后目录被删除的竞争窗口。
- 修改或迁移 session cwd 必须是显式操作；禁止靠 fallback 把已有会话重绑定到其他工程。

桌面检查属于用户反馈与避免无效请求；内核检查才是所有客户端共同的最终执行保障。这两者不能互相替代。

## 4. 已做验证及限制

`pnpm verify`：414 单测（ACP 41、desktop 373），契约生成、架构、样式、类型、夹具、构建、协议 smoke 7、PTY 8、恢复 11 均通过。日志 `/tmp/nofy-integration-verify.log`。

新增 workspace-session-contract 单测覆盖：失效目录无 effect；用真实 session cwd 发送并保留附件；校验期间更换传输拒绝发送；session cwd 变化拒绝发送。

实际 Electron GUI（ACP 使用确定性模拟器，目录检查经真实 main IPC / 文件系统）：

- integration-2026-10-10T18-53-11.784Z/report.json：4 项，删除目录后发送拦截并保留草稿；重新建目录后同一 session 可发送；污染 selected/last-session 冷恢复不发失效 cwd；点击失效最近项目不创建会话。
- project-2026-10-10T18-53-41.625Z/report.json：11 项原有项目、草稿、导航、归档、删除、导出回归。
- 两组均零 pageerror，不包含真实模型推理。

打包验证：两次实际可执行程序启动，profile 与 NOFY_HOME 同时隔离，截图有效、退出成功、内核回收。`docs/contract/package-macos-verification.json`。这个门仍只验证包启动，不能代替会话执行验收。

真实内核离线探针 `scripts/probe-workspace-contract.ts` 使用空隔离 NOFY_HOME，不复制凭据，不调用 prompt；有效和不存在目录都被 Authentication required 拦截。这是认证前置条件阻断，**不是目录校验通过，也不是目录被内核接受的实测证据**。记录于 backend-workspace-probe-2026-10-11.json。

未验证：真实模型与 shell 的联合执行、Rust 修复、新版本内核部署、完整重连会话恢复状态机、回放失败原子保留、Windows/Linux、签名公证。没有删除受影响真实会话，也没有重建事故临时目录。

## 5. 下一阶段应按协议模块推进

1. 工作区执行契约：内核 new/prompt 校验、失效历史只读、统一错误码；桌面将业务错误映射为明确恢复动作。实际 API 配置只用于隔离验收，禁止输出密钥。
2. 会话生命周期：transportReady 与 sessionReady 分离；每个会话记录 loadedEpoch；重连时恢复与发送排队；导航、删除、fresh load 竞争使用一致的 token。
3. 回放事务：旧可见投影保留，独立暂存新的事件与元数据，load 成功后原子替换；失败、重复事件与旧 epoch 不污染当前会话。
4. 发布验收：冻结并记录桌面与内核版本，在隔离 profile + NOFY_HOME + 有效工作区跑一次真实 shell/文件/取消/恢复全链路；GUI 夹具门和真实执行门分别记录。

先完成这些模块，再继续扩展外观功能。当前结论是现场临时工作区事故的桌面入口已堵住，整体前后端生命周期仍有上述两项明确未收口问题。
