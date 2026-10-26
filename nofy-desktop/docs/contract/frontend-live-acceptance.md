# 真实线路验收（2026-10-08–2026-10-09）

可复跑：`node apps/desktop/scripts/probe-live-acceptance.ts`；可限定阶段 `--only=<阶段名>`。使用独立 NOFY_HOME 与临时工作区，复制用户已授权的模型配置后仅修改临时副本，去掉继承的 MCP/插件/市场配置。退出清理配置、工作区、内核。模型目录与 id 可记录，API key、供应商响应正文、URL/header、原始帧不可记录。

证据：`frontend-live-acceptance.json`。每阶段的 passed 仅表示其 evidence 所述线路事实；不替代 GUI E2E。单阶段重跑保留既有阶段证据，每阶段的 generatedAt/observedEvents 属于该阶段，eventsThisRun 只属于最近一次运行。

- question-accept：模型实际发出 `_nofy/ask_user_question`，按实际题干及首个 option label 应答 accepted，prompt 最终 end_turn。
- permission-allow-once：临时 permission_mode=default，实际权限请求选择 allow_once，工具写入测试文件；没有 server request 不计通过。
- plan-approve：session/set_mode=plan，模型把计划写到内核指定文件并 exit_plan_mode；客户端收到非空 planContent 后 approved，后续工具创建了预定测试文件。JSON 只保存计划字符数和文件匹配结果。
- mcp-stdio-lifecycle：本地 Node stdio fixture 实际 initialize/tools/list，工具目录包含 live_echo/live_form；直接 `_nofy/mcp/call` 执行 echo 返回指定 marker；live_form 发起真正 elicitation/create，请求经内核转给客户端、验证 region=test，应答 accept 后服务端返回 LIVE_FORM_ACCEPTED；再停用、启用、删除，并从内核读回状态。所有写入在临时 home。
- cancel-running-tool：模型启动 sleep 30 的真实 bash 工具后发 session/cancel notification，pending prompt 返回 stopReason=cancelled。
- stream-interruption-and-history：观察模型流式帧后 SIGKILL 临时内核；先等待 status:false（避免 ready 仍返回旧握手的探针竞态），再等待重连；原请求 reject、pid 变化、单个新 child、load 回放一个已接收用户输入，脚本没有自动重发 prompt。

MCP fixture 有独立 `node --check`、静态 raw initialize/tools/list 手工握手验证，扩展字段由当前源码实际类型决定。真实交互应答在脚本中程序化处理，不宣称鼠标/键盘验收。

回退单独由 `probe-turn-rewind.ts` 验证，证据 `turn-rewind-probe.json`：files_only/all 两种 mode 都先 force:false dry-run（返回 success:false、clean_files、conflicts；文件不变），再明确 force:true commit（success:true）。files_only 删除文件并保留会话；all 删除文件且 fresh load 只回放存活分支（本例空），不含 rewind_marker。

回退协议没有原子 compare-and-commit token。UI 显示预览，冲突禁止提交、提交前重复预览，范围变化要求重新确认；内核 force:true 仍允许覆盖，因此无法消除两次请求之间外部文件修改的 TOCTOU 风险。原生 retry 请求没有证据；实际可行的是回退到 prompt 之前、编辑草稿后发送新 prompt。

最终磁盘账已核对：6/6 阶段 passed=true，问答、计划、MCP、停止、断流恢复来自 10 月 8 日；allow-once 的最终重跑来自 10 月 9 日，实际 allow-once 应答 sent=true，目标文件匹配且 end_turn。此前 standalone 轮次曾两次达到 120 秒探针期限，最终重跑完成，但超时根因未证实，不能宣称已修复供应商延迟。JSON priorFailureNotes 保留这项历史与探针自身的语法/重连竞态修复，不把最终通过等同从未失败。
