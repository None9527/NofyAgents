# M2 会话操作契约（2026-10-08）

来源：`crates/codegen/nofy-shell/src/extensions/session_admin.rs`、`session_search.rs`、`rewind.rs`、`session/fork.rs`、`session/acp_types.rs`；实际二进制 0.2.121。可复跑 `node apps/desktop/scripts/probe-session-writes.ts`，输出 `session-write-probe.json`，临时 NOFY_HOME 与含中文/空格目录，结束清理。未改真实配置与会话，无模型 prompt。

| 操作 | 线路与参数 | 成功依据 | 实测范围 |
|---|---|---|---|
| 重命名 | request `_nofy/session/rename` `{sessionId,title,cwd?}` | `{success:true}`；事件标题由内核 manual pin，后续 roster 刷新 | 成功、空白拒绝、load 读回新标题通过 |
| 删除 | request `_nofy/session/delete` `{sessionId,cwd?}` | `{success:true}` 后才清窗口导航；文件保留，历史永久删除 | 复制会话和原会话删除通过 |
| 分叉 | request `_nofy/session/fork` `{sourceSessionId,sourceCwd,newCwd,targetPromptIndex?}` | `newSessionId,newCwd,parentSessionId`；显式 load 新会话 | 空会话 fork 通过；返回内核父子关联，不修改原会话 |
| 历史检索 | request `_nofy/session/search` `{query,cwd?,limit:20,offset,includeContent:true,headless:"exclude"}` | `result.results/nextOffset/bootstrapping` | 请求成功，空会话无命中；非空索引/分页真实命中尚未验收 |
| 检查点 | request `_nofy/rewind/points` `{sessionId}` | `rewind_points[].prompt_index/num_file_snapshots/has_file_changes` | 空会话返回空检查点；真实工具轮次返回 prompt_index=0、1 个快照 |
| 回退 | request `_nofy/rewind/execute` `{sessionId,targetPromptIndex,mode,force:false/true}` | `success:true`；force:false 返回只读 clean_files/conflicts；force:true 执行，检查 success | 真实 files_only/all：只读预览、明确提交、文件移除、fresh load 转录通过 |
| 原生 retry | 无独立请求证据 | 不伪造 | UI 提供复制输入到草稿，明确发送产生新回合 |
| 编辑 | 内核回退到 prompt N 前 + 填回 prompt_text，用户编辑再发送 | 需内核检查点成功 | 接线可用；真实非空转录尚未验收 |

`targetPromptIndex` 是执行 prompt N 之前的状态，保留 0..N-1。Spine 只使用 user-message 的内核 `promptIndex`；该值缺失时禁用回退。不得把数组序号、DOM 序号当作检查点。

导出只声明已加载内容，包含用户文本、agent 文本、工具文本结果，不导出 rawInput/rawOutput、thought、event 或模型配置。不会声称完整历史、自动脱敏用户正文。保存由限定 native `saveText(content,filename)` bridge 完成，取消没有文件。

查找仅搜索已加载 user/agent/tool result text，返回用户轮次锚点。历史搜索独立组件注明 title/content 匹配来源；generation 丢弃旧响应、按 sessionId 去重分页、索引启动中提示不完整。

共享 service/request 白名单包含 sessionRename/sessionFork/sessionDelete/sessionSearch、rewindPoints/rewindExecute、modelAuthenticate（标准 ACP request）、modelsReload、mcpUpsert/mcpDelete/mcpToggle/mcpSetup/mcpAuthTrigger/mcpList、pluginsAction、hooksList、authInfo、setApiKey。settingsUpdate 是内核事件，不允许客户端 request。setApiKey 是 acp_agent.rs 明确接受的 legacy mixed-case 名；生成器当前未提取，故在白名单带来源注释。

影响分析：runEffect LOW（runtime.effect 一个直接调用者，0 流程）；cancelPayloadFor LOW（runEffect 一个直接调用者，0 流程）；Spine LOW（App 一个直接调用者、App 流程）；SegmentView LOW（Spine 一个直接调用者、App 流程）。没有内核源代码变更。

验证：新增模型及出站单测 5/5，既有 e2e-chain、dep-guard 加新测 24/24。GUI 场景 E04–E06 尚需整合后实测；源码实现不能替代 GUI 出口验收。检查点列表只给快照数，但 execute force:false 会返回实际文件清单，已核对源码并实测。确认页显示 clean_files/conflicts，冲突禁止提交；确认后立即复查且文件集合改变时要求重审。内核 force:true 会执行（不是原子比较提交），复查与提交之间仍有 TOCTOU 边界，不能声称并发修改时绝对不会覆盖。

旧供应商配置曾返回 401。用户切换到 gemini-3.8-flash-high 后重新执行真实探针：files_only/all 预览不改变文件、commit force:true 删除工具所建文件；files_only fresh load 保留 user1/agent1/tool2，all fresh load 无 user/agent/tool，也不回放 rewind_marker。证据为 turn-rewind-probe.json；临时配置/目录/内核均在 finally 清理。renderer 专项 TypeScript 检查通过。
