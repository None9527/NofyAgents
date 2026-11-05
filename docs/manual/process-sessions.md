# 命令、交互终端与 stdio MCP

`tool.process_tree_artifact` 的 `tree` 端口可接 `resource.process_tree_limits` 或 `resource.process_namespace_limits`。前者需要真实 cgroup v2 委派子目录，提供原有整树聚合配额；后者使用独立 user/PID/mount/network namespace，不要求 cgroup，提供每进程 CPU 秒数、地址空间限制和整树退出回收。后者不承诺聚合内存或进程数量配额。所有解释器、编译器及库均由用户显式提供，源码包不安装依赖。

交互资源 `resource.process_session` 连接 `environment`、`artifact`、`limits`，通过 `entrypoint` 和固定 `args` 选择源码入口；`directories` 映射额外目录端口。`terminal:true` 使用真实 PTY，默认 24 行、80 列；普通管道适合机器协议。`timeout_ms` 为整个 OS 会话存活时间，`max_output_bytes` 分别限制 stdout/stderr 的保留窗口。输出继续被排空，超出窗口时返回 `dropped_before`，不能将它当完整输出。

模型工具 `tool.terminal` 连接 `session`，提供 `start/poll/write/resize/close`。工具依旧先经过原有权限、审批、预算及事件边界；同一声明资源的进程按 thread 隔离。开发控制使用 `nofy terminal start|poll|write|resize|close` 或同名 `nofy_terminal_*` MCP 工具，提供固定 release、原生 `{id,version}` ModuleRef、owner。Host 同时要求 execute 与 resources 权限；operator owner 有独立前缀，不能伪装为模型线程。

```json
{"release":"<真实发布摘要>","module_ref":{"id":"terminal-session","version":"1"},"owner":"development","start_id":"terminal-1"}
```

每次 `start` 必须指定稳定 `start_id`，返回 `session_id`。重复相同 ID 读取原记录；同 ID 不同配置冲突，不再启动。每次输入指定稳定 `command_id`，先持久化 prepared，再写 stdin，最后保存 committed。断线或崩溃时可能处于 prepared/uncertain；查询原回执，不能换 ID 自动重发。重复相同 ID 和相同输入只返回原回执，不再投递。管道 `eof:true` 关闭 stdin；PTY 会发送 EOT，原始模式应用自行解释该字符。

`poll` 支持独立 `stdout_cursor/stderr_cursor`、`limit` 和至多 30 秒 `wait_ms`；返回字节范围、UTF-8 便览及精确 `data_base64`。解码器跨块保留自己的 UTF-8 状态。PTY 合并终端输出到 stdout。`resize` 仅适用 PTY，并产生真实窗口变更。`close` 等待 helper 与 PID namespace 后代退出及输出排空后返回终态。调用方停止等待不等于关闭交互进程。

进程所有者独立于调用 future，保留 scratch 与缓存租约直至物理回收。helper 通过只继承给自身的 pipe 等待 Host 持久交接；Host 死亡时不会在缺记录的情况下启动业务。已存输出与输入回执可跨 Host 重启读取；仍在运行的 OS 进程标记 abandoned，不能凭历史状态重放输入或声称已恢复。

出站 stdio MCP 使用相同管道资源，连接 `resource.mcp_stdio.session`，再把该 connection 接到 `tool_source.mcp`。工厂编译阶段不启动服务；发现工具时创建独立服务进程，快照释放时关闭。stdout 仅容纳一行一个 JSON-RPC 消息，日志写 stderr；PTY 不能用于 MCP。初始化、工具分页、名称空间、别名、允许表、输出 Schema、取消与未知效果禁止自动重发规则，与 HTTP 传输共用。服务 instructions 只作数据，不隐式写入 Agent 提示词。

网络默认关闭。`resource.process_namespace_limits.network_proxy` 可声明 HTTP/CONNECT 出口，配置示例：

```json
{"allowed":[{"host":"api.example.com","ports":[443],"allow_private":false}],"max_connections":16,"max_bytes_per_connection":16777216,"idle_timeout_ms":30000}
```

host 使用小写精确名称或显式 `*.example.com` 后缀规则；通配符不匹配根域名。IPv4/IPv6 字面地址也需明确规则。Host 解析目标并连接经核验的固定数值地址；默认拒绝私有、loopback、link-local 与特殊地址，需要访问内网时逐条显式设 `allow_private:true`。未匹配 host/port 或地址检查失败返回 HTTP 403。配置不存放凭据。

业务进程位于只有 loopback 的新 network namespace。代理转接进程属于可信内核，业务进程不继承其控制描述符，不能创建 Unix/raw/UDP socket，也不能改变 namespace 或路由。HTTP_PROXY/HTTPS_PROXY/ALL_PROXY 及小写变量指向该 namespace 内 `127.0.0.1:19753`，NO_PROXY 清空。忽略这些变量仍无法直接到达 Host 或互联网。单连接数量、双向字节总量、空闲时间和最长存活时间受限；关闭会话同步停止 broker 和代理后代。此网络配置适用于 namespace 后端，cgroup 原后端仍保持默认禁止网络。
