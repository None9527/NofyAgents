# 设置写路径验证（2026-10-08）

运行：`node apps/desktop/scripts/probe-settings-writes.ts`。实际内核 `~/.local/bin/nofy`，隔离 HOME 与 NOFY_HOME，未复制凭据。认证使用无效的测试字符串，不发模型请求。结果在 `settings-write-probe.json`。

| 路径 | 方向及字段 | 当前结果 |
|---|---|---|
| `_nofy/setApiKey` | request `{key}` | `result.ok=true`，持久化后不读取密钥 |
| `authenticate` | ACP request `{methodId:"api_key"}` | `{}`，仅确认内核接受，不证明供应商网络认证 |
| `_nofy/auth/info` | request `{}` | 无机密认证状态 |
| `_nofy/mcp/upsert` | request `{session_id,server_name,url}` 或 `{command,args,env}` | `result.ok=true`；服务启动失败仍可写配置，界面继续显示真实状态 |
| `_nofy/mcp/toggle` | request `{session_id,server_name,enabled}` | `result.ok=true` |
| `_nofy/mcp/delete` | request `{session_id,server_name}` | `result.ok=true`，只允许本地用户配置 |
| `_nofy/mcp/auth_trigger` | request `{session_id,server_name}` | 测试服务返回 `setup_required` 与 select 字段 |
| `_nofy/mcp/setup` | request `{sessionId,serverName,values}` | `result.ok=true`，注意这里是 camelCase |
| `_nofy/plugins/action` | request `{sessionId,action}`；action 字段 snake_case | 合成无 hooks/MCP 插件安装→reload→列表→停用→启用→卸载全部 `status=success` |
| `_nofy/hooks/list` | request `{sessionId}` | 测试隔离目录 0 hooks；按 name/event/sourceDir/disabled 展示 |

配置所有者为内核。新增 MCP 当前仅用户 scope；项目配置写入未提供。已有服务“替换配置”会写指定运输字段，明确要求用户保留所需配置，不伪称完整保留 oauth/setup/高级 timeout 字段。认证 setup 仅支持内核已定义的 select；其他类型拒绝提交。

**发现的内核边界：** `authenticate(api_key)` 仅在 sampling_config.api_key 为空时从环境重读，已运行模型更新凭据后不能保证热生效；界面要求重启应用后测试连接。 带 required setup 的 upsert 先持久化，再因服务尚不可实例化返回 `Invalid params`；之后 auth_trigger 能读取 setup，提交 setup 后可使用。失败不能据此断言配置未变。

**未验证/未提供：** 真实供应商网络连接、坏凭据网络错误、重启完整模型对话；供应商/默认模型的内核 RPC 写接口缺失，已按 native-model-config-spec.md 通过原生 JSON 配置适配器接通新增/编辑与默认选择；旧 TOML 保持只读；MCP 成功加载工具的真实服务 E2E；personas/agents 项目目录写管理尚无接线；bundle/status/get 已接内置缓存只读目录与详情；前端静态文案已迁入中英资源层，并开放语言选择。真实 Electron GUI 已验证语言即时切换、草稿保留及 reload 恢复；内核内容、模型输出与用户文本保持原文。

通用设置：深/浅/系统跟随，系统颜色变化实时响应；字号 12/14/16/18px 存储在非机密 UI preference，启动时恢复。语言、字号与主题的 GUI 证据参见 frontend-settings-acceptance-2026-10-08.md。

## 原生配置补齐（2026-10-09）

ProviderSettings 使用 typed Runtime ModelConfigAccess，经 main/config/model-controller 的活动会话/审批门与单内核停机生命周期调用 model-config.ts。新的 shared provider、per-model BYOK 和 models.default 通过受限 JSON patch 更新。源码定义、CAS/0600 备份、URL 脱敏与残余外部 CLI 写竞争见 native-model-config-spec.md。GUI 验收 9/9；测试 provider 只用 dummy key，不证明真实网络可达。
