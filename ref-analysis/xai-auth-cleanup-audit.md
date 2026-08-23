# xAI 认证依赖清理审计(深入审查)

日期:2026-08-22。方法:三个并行只读审计(命令面 / 工具面 / 后台隐性连接),
全量正则扫描 `crates/` 内 `x.ai|grok.com|nofy.com`(137+ 命中点逐一分类)。

## 0. 结论先行

- 本 fork 已做过一轮 **sanitized build**:交互登录已删(`run_cli_login` bail)、
  feedback 上传已断(凭据恒 None)、writeback 被 `is_xai_auth()=false` 永久门控、
  更新检查已 opt-in、trace_upload 已移除。
- **但仍有 7 个工具默认注册,会把用户的 BYOK key 作为 Bearer 发往 api.x.ai**
  (image_gen / image_edit / image_to_video / reference_to_video / web_search /
  hosted web_search / x_search)——这是安全级问题,必须优先掐断。
- 模型列表预取在用户未配置模型端点时,默认携带 `NOFY_API_KEY` 请求
  `https://api.x.ai/v1/models`。
- 远端设置/公告链在存在 auth.json 凭据时每 5 分钟轮询
  `cli-chat-proxy.grok.com`,且远端设置可远程打开遥测等开关(远程策略控制面)。
- 一批用户可见的死表面:/login /logout /share /feedback /voice /imagine
  /imagine-video /release-notes、/docs web、/usage manage、欢迎屏付费墙/升级
  CTA/隐私横幅/CDN changelog。

## 1. 工具面(建议全部移除)

| 工具 | 认证/端点 | BYOK 下行为 |
|---|---|---|
| image_gen / image_edit | Bearer=sampling key → `{xai_api_base_url}/images/*` | 注册;调用即 401,**key 发往 xAI** |
| image_to_video / reference_to_video | 同上 `/videos/*` + ZDR S3 上传 | 同上 |
| web_search(本地客户端) | `{base}/responses` 服务端搜索工具 | DashScope 不支持 → 运行时报错 |
| hosted web_search / x_search | 原生服务端工具随请求发出 | xAI 专有;`x_search` 无本地实现 |

启用链:config.rs `resolve_image_gen/image_edit/video_gen`(默认 true)→
agent_ops.rs `prepare_*_config`(只要求 api_key 存在,base 固定
`endpoints.xai_api_base_url`)→ builder.rs 推入 tool_config →
registry/types.rs 注册 + 客户端注入。

保留:`web_fetch`(自建 HTTP,无 xAI 认证)、`deploy_app`(已是 stub)、
`search_tool`(MCP 工具 BM25 检索)。

## 2. 命令面

**整条移除**:/login、/logout、/share(已死)、/feedback(后端已断)、
/voice(api.x.ai STT)、/imagine、/imagine-video(依赖 xAI 工具)、
/release-notes(CDN 拉取)。
**部分移除**:/docs 的 `web` 分支(docs.x.ai);/usage 的 `manage` 分支与
consumer billing 面。
**欢迎屏**:交互登录流/ZDR 阻断屏/订阅付费墙/升级 CTA/CDN changelog 块/
隐私横幅/credits 警告——BYOK 带 key 时不出现;无 key 时登录入口是死路
(Round 2 处理:改为指引配置 API key)。
其余 50+ 命令经 grep 确认纯本地,保留。

## 3. 后台隐性连接

| 组件 | 端点 | 触发 | 处置 |
|---|---|---|---|
| 远端设置/公告 | cli-chat-proxy.grok.com/v1/settings | 启动+每5min | **移除轮询**(key 泄漏+远程策略面) |
| 模型列表预取 | api.x.ai/v1/models(默认) | 启动 | **去默认**:未显式配置端点则不预取 |
| 内部 OTLP traces | cli-chat-proxy.grok.com/v1/traces | 启动构建导出器 | **去默认**:显式配置才导出 |
| 产品事件遥测 | 默认无 URL | — | 保留(已无害) |
| 外部 OTEL | 客户 collector | 双重 opt-in | 保留 |
| /feedback 代理客户端 | {proxy}/feedback 等 | 已断线 | Round 2 删死代码 |
| 会话分享/writeback | code.nofy.com | 永久门控 | Round 2 删死代码 |
| subagent bundle | {proxy}/bundle/* | 无凭据跳过 | Round 2 评估 |
| computer-hub | wss://computer-hub.nofy.com | 默认 feature 不编译 | 休眠,暂不动 |
| 更新检查 | 占位+GCS | 已 opt-in | 保留 |
| 崩溃上报 | 纯本地 | — | 保留 |
| OAuth2 默认 provider/auth.x.ai 常量 | — | 死代码 | Round 2 清理 |
| 安装脚本 | x.ai/cli | 安装时 | Round 2 重写 |

## 4. 分级执行计划

**Round 1(本轮)**:
1. 工具面断 key 泄漏:image/video/web_search 配置恒 Disabled(shell 装配层),
   hosted backend_search 强制关。
2. 命令面:移除 8 个死命令注册 + /docs web + /usage manage 分支。
3. 远端设置/公告:关闭拉取与 5 分钟轮询。
4. 模型预取:未显式配置模型端点不预取。
5. OTLP:去默认端点,显式配置才导出。

**Round 2(后续)**:欢迎屏无 key 引导改造、死代码物理删除(OAuth 残留、
分享后端、feedback 客户端、bundle)、安装脚本重写、文档链接替换。

## 5. 用户定调升级:物理剔除,不留债务桩

Round 1 的"恒 Disabled 桩"方案被用户否决:**完全剔除所有 xAI 依赖代码,
代码完整闭环,不留下一堆债务**。执行方式改为分批物理删除:

- **Batch A(媒体工具)**:image_gen/image_edit/video_gen/reference_to_video
  工具、`/imagine`、`/imagine-video`、ToolOutput/ToolKind/ToolInput 变体、
  配置链、归因链、营销文案——已删。
- **Stage 1(vendor 拉取管道,本批)**:
  - external OTEL settings 门(`suppress_external_otel_until_settings` 等)、
    远程策略 `apply_remote_policy`/`ExternalOtelRemotePolicy`、shell 侧
    `otel_gate` 模块、`apply_otel_config`/`suppress_otel` 全部调用点——已删。
  - settings 拉取整链:`fetch_settings_blocking`/`SettingsFetch`/
    `refresh_remote_settings`/`spawn_post_auth_settings`/`spawn_settings_reapply`/
    公告 5min 轮询/401 自愈/heap-profile K12 scoped kill-switch/
    `test_settings_refresh.rs`——已删。公告发射机制(现纯本地数据)保留。
  - 模型目录:门控改为 `has_custom_endpoint()`(仅用户自有端点可拉),
    `ListModelsEndpoint` vendor 臂与 Session 头、auth-refresh watcher——已删。
  - 内部 OTLP:vendor proxy 回退在早前消毒中已去除,本批同步修正过时断言。
  - `resolve_remote_fetch_enabled` 及 `features.remote_fetch` 配置链整体移除。
- **Stage 2(remote 策略层,已提交 d40ad0e)**:`RemoteSettings` 类型、
  `ContextualHintsRemote`、`BoolFlag.feature_flag` 层、`ConfigSource::Remote`、
  全部 `resolve_*` 远端层、`cache_remote_*` 缓存、ACP remote 传递、
  付费墙 gate 机制(remote 是其唯一策略源)——整体物理删除,85 文件净删
  ~7600 行;公告/活动/提示的本地配置层解析保留。
- **Batch B(web/x 搜索,已提交 1d6b28e)**:web_search 本地客户端(BYOK
  key 泄漏点)、HostedTool vendor 服务端工具、tool_overrides、
  `[models] web_search`、CLI 旗标、pager 渲染线——整体删除;web_fetch 保留。
- **Batch C(voice,已提交 d974c1e)**:nofy-voice crate(wss://api.x.ai/v1/stt)
  与 pager/shell 全部 voice 面(状态机/键绑定/设置/诊断)——整体删除。
- **Batch D(xAI 登录流,已提交 ef18a31)**:/login /logout、OIDC/设备流、
  auth.x.ai/accounts.x.ai 常量、欢迎屏登录界面与 ZDR 阻断屏、
  `--force-login`、`is_xai_auth()` 全删;AuthMode 精简为
  {External, ApiKey};BYOK api_key/auth_provider 链完整保留;
  无 key 界面改为 API-key 配置指引。127 文件净删 ~10500 行。
- **Batch E(计费/付费墙,已提交 57ea7f4)**:订阅 tier/credits/
  SuperNofy 推销/CheckSubscription/隐私横幅/订阅监视全删;
  /usage 保留本地用量。155 文件净删 ~9500 行。
- **Batch F(剩余后台外联,已提交)**:/feedback /share /release-notes
  命令、nofy-update crate 与全部 changelogs、subagent bundle 拉取、
  RemoteSync/pull/session-export、BackendClient 远端方法与 share_url/
  NOFY_CODE_* URL、RelaySyncConfig/nofy_ws_url、sessions_cmd 远端分支、
  feedback 云端 handler(nofy/btw 保留)、feedback.jsonl 持久化链、
  UserFeedback 遥测事件、computer-hub shell 侧 ObservabilityBridge 引用、
  web_fetch xAI 域名白名单项、README/文档 x.ai 链接——392 文件净删
  ~28900 行。遗留:pager feedback 面板机械结构与 shell FeedbackManager
  子系统(启发式/信号/REST 客户端,提交链已断但代码仍在树中)——
  归入 Batch G 连根拔除。
- **Batch G(feedback 子系统,执行中)**:pager 死链
  (Action::OpenFeedbackPane/SendFeedback、Effect::SendFeedback、
  TaskResult::Feedback*、feedback 面板渲染/交互/测试)、shell
  feedback_client.rs/feedback.rs/feedback_manager.rs/signals.rs、
  FeedbackManagerConfig 管线、prod feedback_types wire 类型、
  pager-render feedback_info——整体物理删除。
