# Hermes Agent（NousResearch）源码分析报告

> 分析对象：`/home/none/grok-build/ref/hermes-agent`（hermes-agent v0.20.0，MIT License）
> 分析目的：为 grok-build（Rust 专有 coding agent）脱敏改造为"通用 API agent"提供架构参考。
> 所有结论均基于实际源码阅读，关键文件路径已标注。

---

## 1. 项目定位与技术栈

**定位**：Nous Research 出品的"自我改进 AI agent"（`pyproject.toml` description："The self-improving AI agent — creates skills from experience, improves them during use, and runs anywhere"）。核心卖点：

- 不绑定任何模型厂商："Use any model you want — Nous Portal, OpenRouter, OpenAI, your own endpoint... Switch with `hermes model` — no code changes, no lock-in"（`README.md`）
- 内置学习闭环（memory 策展 + skill 自动创建/自改进 + 跨会话 FTS5 检索）
- 多渠道接入（Telegram/Discord/Slack 等 gateway）+ 7 种终端后端（local/Docker/SSH/Singularity/Modal/Daytona/Vercel Sandbox）
- 研究友好：batch trajectory 生成 + trajectory 压缩（用于训练数据）

**技术栈**：

| 项 | 内容 |
|---|---|
| 语言 | Python ≥3.11,<3.14（`pyproject.toml`；上限是刻意的，防止 uv 选到无 wheel 的 3.14） |
| 依赖管理 | uv（`uv.lock`）；**所有直接依赖精确 pin 到 ==X.Y.Z**，注释明确说明是应对 PyPI 供应链攻击（Mini Shai-Hulud 蠕虫事件）；provider 专属依赖放 extras，经 `tools/lazy_deps.py` 懒安装 |
| 核心依赖 | `openai==2.24.0`（主力 SDK）、httpx[socks]、rich、tenacity、pydantic、prompt_toolkit、fire、croniter、pyyaml/ruamel.yaml、jinja2、Markdown |
| 入口 | `hermes`（shell 脚本）→ `hermes_cli/main.py:main()`（argparse，~48 个子命令）；交互式 REPL 在 `cli.py`（18915 行）；agent 库入口 `run_agent.py:AIAgent`；另有 `batch_runner.py`、`mcp_serve.py`、`acp_adapter/`、`tui_gateway/` |
| 附属前端 | `apps/desktop`（Electron/TS）、`ui-tui`（TS）、`web`（TS）——核心逻辑全在 Python 侧，前端只是客户端 |

---

## 2. 目录/模块结构总览

| 顶层目录/文件 | 职责 |
|---|---|
| `run_agent.py`（8303 行） | `AIAgent` 类：会话管理、客户端构造、fallback 链、工具快照；构造函数整体转发给 `agent/agent_init.py:init_agent` |
| `agent/`（~150 模块） | 从 AIAgent 拆出的子系统：`conversation_loop.py`（主循环）、`transports/`（协议适配）、`context_compressor.py`、`memory_manager.py`、`curator.py`、`error_classifier.py`、`auxiliary_client.py`、`credential_pool.py`、`system_prompt.py` 等 |
| `providers/` + `plugins/model-providers/` | **Provider 抽象层**（本报告重点，见 §4）：`base.py` 定义 `ProviderProfile`，`__init__.py` 是注册表；34 个内置 provider 以插件形式存放 |
| `tools/`（140 文件） | 工具实现 + `registry.py` 中央注册表；`tools/environments/` 是 7 种终端后端 |
| `toolsets.py` | toolset 分组/组合定义（`TOOLSETS` dict，可 includes 组合） |
| `model_tools.py` | 工具 schema 组装（`get_tool_definitions`）+ 工具调用分发（`handle_function_call`）+ 参数 coerce |
| `hermes_state*.py` | SQLite 会话持久化（`SessionDB`，拆成 schema/common/search/portability 四个 mixin 文件） |
| `trajectory_compressor.py` | 离线 trajectory 压缩（训练数据用途） |
| `gateway/` + `plugins/platforms/` | 多渠道消息网关（`run.py` GatewayRunner 28k 行）；22 个平台以插件形式存在 |
| `hermes_cli/`（271 文件） | CLI 子命令、配置（`config.py` 5499 行）、认证（`auth.py`）、模型选择器（`models.py`/`model_switch.py`）、profiles、doctor 等 |
| `skills/` + `optional-skills/` | 内置 skill（SKILL.md 格式，兼容 agentskills.io 标准） |
| `plugins/` | 通用插件系统：model-providers / platforms / memory / image_gen / browser / video_gen / web / observability / kanban 等 |
| `cron/` | 内置 cron/interval 调度器（croniter），支持投递到任意平台 |
| `acp_adapter/`、`mcp_serve.py` | Agent Client Protocol 服务端；MCP stdio 服务端（把会话暴露为 MCP 工具） |
| `tests/`（2872 个 py 文件） | 测试体量与源码相当 |

---

## 3. 核心架构：agent 主循环与工具系统

### 3.1 主循环组织

- `AIAgent`（`run_agent.py:412`）是 god object，但已系统性拆分：`__init__` 只是 forwarder，真正初始化在 `agent/agent_init.py:init_agent`（459 行起，负责 provider 解析、客户端构造、fallback 链装配、工具快照）。
- **单轮主循环**在 `agent/conversation_loop.py:run_conversation`（1422 行起，文件 7757 行）。文件头注释自述：这是从 `run_agent.AIAgent` 抽出的 ~3900 行循环体，"drives one user turn through the agent (model call, tool dispatch, retries, fallbacks, compression, post-turn hooks, background memory/skill review nudges)"，以 `agent` 实例为第一参数、通过属性访问状态。
- 循环内的横切能力都是独立模块：错误分类 `agent/error_classifier.py:classify_api_error`（FailoverReason 枚举）、上下文压缩 `agent/conversation_compression.py` + `agent/context_compressor.py`、轮次收尾 `agent/turn_finalizer.py`、重试状态 `agent/turn_retry_state.py`。

### 3.2 协议适配（transport 层）

`agent/transports/base.py` 定义 `ProviderTransport` ABC，注释明确了职责边界："A transport owns the data path for one api_mode... It does NOT own: client construction, streaming, credential refresh, prompt caching, interrupt handling, or retry logic. Those stay on AIAgent."

```python
class ProviderTransport(ABC):
    api_mode: str                                   # e.g. 'anthropic_messages'
    convert_messages(messages, **kw)                # OpenAI 格式 → 原生格式
    convert_tools(tools)                            # OpenAI tool schema → 原生格式
    build_kwargs(model, messages, tools, **params)  # 组装完整 API 调用参数
    normalize_response(response, **kw) -> NormalizedResponse
    validate_response(response) / extract_cache_stats(response)  # 可选 hook
```

实现：`chat_completions.py`（默认）、`anthropic.py`、`bedrock.py`、`codex.py`、`codex_app_server.py`。api_mode 由 `hermes_cli/providers.py:determine_api_mode(provider, base_url, model)` 决定（671 行）：host 强制 → 已知 provider 映射 → 默认 `chat_completions`。**即：内部消息/工具统一用 OpenAI 格式作为"窄腰"，只在出口处做一次协议转换。**

### 3.3 工具系统（registry / toolsets / skills 三层）

**注册**（`tools/registry.py`）：单例 `ToolRegistry`，每个工具文件在模块级调用：

```python
registry.register(
    name, toolset, schema, handler,
    check_fn=None,            # 可用性检查（结果带 TTL 缓存）
    requires_env=None,        # 依赖的环境变量
    is_async=False,
    dynamic_schema_overrides=None,  # 运行时动态 schema
    override=False,           # 插件替换内置工具需显式 opt-in + 操作员配置允许
)
```

- 发现机制：`discover_builtin_tools()` 用 **AST 静态扫描**找出哪些 `tools/*.py` 含 `registry.register()` 调用，再按需 import（避免全量导入）。
- 注册表带 `_generation` 计数器 + RLock，支持 MCP 工具动态刷新时的并发安全与缓存失效。
- 插件覆盖内置工具有安全闸门：`_plugin_owner_of(handler)` 按定义模块命名空间鉴权，需 `plugins.entries.<id>.allow_tool_override: true`。

**分组**（`toolsets.py`）：`TOOLSETS` dict，每个 toolset 有 `description`/`tools`/`includes`（可组合其他 toolset）；`_HERMES_CORE_TOOLS` 是 CLI 与所有消息平台共享的核心工具清单（web_search、terminal、read_file/write_file/patch、browser_*、memory、todo、session_search、delegate_task、execute_code、cronjob 等）。

**调度**（`model_tools.py`）：`get_tool_definitions(enabled_toolsets, disabled_toolsets)` 按 toolset 过滤并组装 OpenAI 格式 schema（带多级 memo 缓存，key 含 registry generation + config 文件 mtime）；`handle_function_call`（1160 行）负责分发、参数 coerce（`coerce_tool_args`）、结果尺寸限制、post_tool_call hook。

**Skills**：SKILL.md = YAML frontmatter（name/description/version/platforms/metadata）+ markdown 正文（例：`skills/software-development/dogfood/SKILL.md`）；通过 `skills_list`/`skill_view`/`skill_manage` 工具暴露给模型；兼容 agentskills.io 开放标准。

---

## 4. Provider / 模型抽象（重点）

这是 hermes-agent 最值得借鉴的部分，采用**三层结构**：声明式 Profile（请求怪癖）+ Auth Registry（凭据来源）+ Transport（线上协议）。

### 4.1 `ProviderProfile`（`providers/base.py`）

声明式 dataclass，"describes the provider's behavior. They do NOT own client construction, credential rotation, or streaming"：

```python
@dataclass
class ProviderProfile:
    # 身份
    name: str
    api_mode: str = "chat_completions"
    aliases: tuple = ()
    display_name: str; description: str; signup_url: str
    # 认证与端点
    env_vars: tuple = ()          # e.g. ("ACME_API_KEY", "ACME_BASE_URL")
    base_url: str = ""
    models_url: str = ""          # 模型列表端点，缺省 {base_url}/models
    auth_type: str = "api_key"    # api_key|oauth_device_code|oauth_external|copilot|aws_sdk
    # 能力标记
    supports_vision: bool; supports_vision_tool_messages: bool
    supports_prompt_cache_key: bool
    # 模型目录
    fallback_models: tuple = ()   # 在线拉取失败时的候选模型
    hostname: str = ""            # URL→provider 反查
    # 请求级怪癖
    default_headers: dict; fixed_temperature: Any   # OMIT_TEMPERATURE 哨兵
    default_max_tokens: int | None
    default_aux_model: str        # 压缩/视觉等辅助任务的廉价模型

    # 可覆写 hook
    def prepare_messages(messages) -> list          # 消息预处理
    def build_extra_body(session_id=..., **ctx) -> dict   # extra_body 字段
    def build_api_kwargs_extras(reasoning_config=..., **ctx) -> (extra_body, top_level)
    def get_max_tokens(model) -> int | None
    def fetch_models(api_key=None, base_url=None, timeout=8.0) -> list[str] | None
    def resolve_aux_model(vision=False) -> str
    def default_vision_model() -> str | None
```

`fetch_models` 默认实现：Bearer 认证 GET `{models_url or base_url/models}`，解析 `{"data":[{"id":...}]}`，失败返回 None 由调用方回退到 `fallback_models`。

### 4.2 注册与发现（`providers/__init__.py`）

```python
register_provider(profile)        # 按 name + aliases 注册，后注册覆盖先注册
get_provider_profile(name)        # 按名字/别名查，懒触发发现
list_providers()
```

发现顺序（`_discover_providers()`）：
1. 内置插件 `<repo>/plugins/model-providers/<name>/`
2. **用户插件 `$HERMES_HOME/plugins/model-providers/<name>/`**（同名覆盖内置，last-writer-wins —— 第三方可不改仓库替换任何内置 profile）
3. 兼容旧式单文件 `providers/<name>.py`（pkgutil 扫描）

每个插件目录 = `__init__.py`（模块级调用 `register_provider()`）+ `plugin.yaml`（`kind: model-provider`）。**内置 34 个 provider 全部是这个模式的实例**：openrouter、anthropic、gemini、bedrock、deepseek、zai、kimi-coding、minimax、copilot、copilot-acp、vertex、xai、nous、fireworks、deepinfra、nvidia、huggingface、xiaomi、upstage、stepfun、arcee、gmi、alibaba(-coding-plan)、azure-foundry、ai-gateway、opencode-zen、openai-codex、qwen-oauth、ollama-cloud、novita、kilocode、actual、**custom**。

**`custom` profile 就是"任意 OpenAI-compatible 端点"**（`plugins/model-providers/custom/__init__.py`）：`env_vars=()`、`base_url=""`（全由用户配置），aliases 含 ollama/vllm/llamacpp；`build_api_kwargs_extras` 处理 Ollama `num_ctx`、`think=False`、顶层 `reasoning_effort` 等本地端点怪癖；`default_max_tokens=65536` 兜底。

### 4.3 认证侧注册表（`hermes_cli/auth.py`）

```python
@dataclass
class ProviderConfig:
    id: str; name: str
    auth_type: str            # oauth_device_code | oauth_external | api_key | ...
    portal_base_url: str = ""; inference_base_url: str = ""
    client_id: str = ""; scope: str = ""
    api_key_env_vars: tuple = ()   # 按优先级排列的环境变量名
    base_url_env_var: str = ""

PROVIDER_REGISTRY: Dict[str, ProviderConfig] = { "nous": ..., "openai-api": ..., "gemini": ..., }
```

关键设计：**该注册表在模块加载时自动用 provider 插件扩展自己**（auth.py 547-590 行）——遍历 `list_providers()`，凡 `auth_type=="api_key"` 且有 `env_vars` 的插件自动转成 `ProviderConfig` 注入（并从 env_vars 中区分出 `*_BASE_URL`/`*_URL` 作为 base_url_env_var）。**新增一个 API-key provider 只需放一个插件目录，auth.py 零改动。**

`resolve_provider(requested, explicit_api_key, explicit_base_url)`（auth.py:2018）的 auto 解析优先级：
1. 显式 CLI api_key/base_url → openrouter（泛指 OpenAI-compat）
2. config.yaml `model.provider`
3. `OPENAI_API_KEY`/`OPENROUTER_API_KEY` env
4. OpenRouter 凭据池
5. 各 provider 专属 env key（GLM/Kimi/MiniMax...）→ 对应 provider
6. `auth.json` 的 OAuth `active_provider`（兜底）
7. AWS Bedrock 凭据链
8. 报错

另有大别名表（glm→zai、google→gemini、ollama/vllm→custom 等），并用插件声明的 aliases 动态补全。

### 4.4 配置面（BYOK 的落点）

`~/.hermes/config.yaml`（模板见 `cli-config.yaml.example`）：

```yaml
model:
  default: "anthropic/claude-opus-4.6"   # 模型
  provider: "auto"                        # 或任意已注册 provider 名
  base_url: "https://openrouter.ai/api/v1"
  # api_key: "..."                        # 也可走 .env / key_env
  # context_length / max_tokens / default_headers / auth_mode(entra_id)
providers:                                # 命名 provider 条目（自定义端点）
  my-proxy:
    base_url: "https://llm.internal.example.com/v1"
    key_env: "MY_PROXY_API_KEY"
    extra_headers: {CF-Access-Client-Id: "..."}   # 值按密钥处理，不落日志
    request_timeout_seconds: 300
    models: {claude-opus-4.6: {timeout_seconds: 600}}
fallback_providers: []                    # [{provider, model}, ...] 有序备胎链
auxiliary:                                # 辅助任务（压缩/视觉/检索）独立路由
  vision: {provider: auto, model: "", base_url: "", api_key: ""}
```

- `.env`（`$HERMES_HOME/.env`）存 API key；还支持外部 secret 源（1Password/Bitwarden/任意 command helper，`secrets:` 段）。
- **`hermes model` 切换模型**：`hermes_cli/subcommands/model.py` → `hermes_cli/models.py`（picker：优先 `profile.fetch_models()` 在线拉目录，失败回退 `fallback_models`；含定价/免费模型/tool-calling 能力过滤）→ `hermes_cli/model_switch.py`（解析 `--provider/--model` flag、写回 config.yaml 的 `model.*`）。运行中也可用 `/model` slash 命令切换。
- 凭据轮换：`agent/credential_pool.py`（多 key 池）+ `agent/credential_lifecycle.py`。

### 4.5 请求路径串联

`init_agent`（agent_init.py）解析 provider → 构造 OpenAI client（`run_agent.py:_create_openai_client`，4902 行；openai SDK 懒加载，~240ms 导入被隔离）→ 每轮请求经 `ChatCompletionsTransport.build_kwargs`（chat_completions.py:356），其中 `_build_kwargs_from_profile`（599 行）调用 profile 的 `prepare_messages`/`build_extra_body`/`build_api_kwargs_extras`/`get_max_tokens` 注入 provider 怪癖 → 失败时 `classify_api_error` 分类，按 `agent._fallback_chain`（config `fallback_providers`，agent_init.py 1420-1440 行装配）切换备用 provider/model。

辅助任务（压缩、session_search 摘要、视觉、web 抽取）走独立的 `agent/auxiliary_client.py`，有自己的 auto 解析链（主 provider → OpenRouter → Nous Portal → custom endpoint → Anthropic → 各 API-key provider），支持 402 额度耗尽自动换下一家，`auxiliary.free_only` 可限制只走免费模型。

---

## 5. 会话与状态管理

- **`hermes_state.py:SessionDB`**（11165 行，拆分为 `hermes_state_schema.py`/`_common.py`/`_search.py`/`_portability.py` 四个 mixin）：SQLite 库，默认 `$HERMES_HOME/state.db`（`hermes_constants.get_hermes_home()` 统一解析：context override → `HERMES_HOME` env → `~/.hermes`，Windows 为 `%LOCALAPPDATA%\hermes`）。
- 表：`sessions`（含 source/model/model_config/system_prompt_hash/cwd/profile/parent_session_id）、`messages`、`session_model_usage`、`gateway_routing`、telegram 话题绑定等；system prompt 做了内容寻址去重（`_store_system_prompt`）。
- WAL 模式 + 文件系统兼容性降级（`apply_wal_with_fallback`，针对 virtiofs/NFS/SMB）。
- **检索**：FTS5 全文索引（`messages_fts` + trigram + CJK 变体；`native/fts5_cjk/` 提供 C 编写的 CJK tokenizer），支撑 `session_search` 工具跨会话召回。
- **恢复**：`hermes --resume`/`-c` 从 DB 重建会话（记录启动 cwd、yolo 标志等）；压缩过程有跨进程锁（`_compression_lock_holder_process_is_dead`）。
- **上下文压缩（在线）**：config `compression.{enabled,threshold:0.5,min_tail_user_messages}`；接近上下文上限时用辅助模型生成摘要替换中段消息（`agent/context_compressor.py`、`agent/conversation_compression.py`、`agent/native_compaction.py`；`docs/micro-compaction.md` 有设计文档）。
- **Trajectory 压缩（离线，训练用）**：`trajectory_compressor.py`（1598 行）——保护首轮（system/human/first gpt/first tool）与末 N 轮，仅压缩中段 tool response，超预算时替换为单条 human summary；`datagen-config-examples/trajectory_compression.yaml` 是配置样例。配合 `batch_runner.py` 批量生成轨迹。

---

## 6. 记忆 / 学习循环

- **文件式策展记忆**（默认，零依赖）：`tools/memory_tool.py` —— `$HERMES_HOME/memory/` 下 `MEMORY.md`（agent 自身笔记）+ `USER.md`（用户画像），`§` 分隔条目；会话启动时以**冻结快照**注入 system prompt，会中写入立即落盘但不改 prompt（保护前缀缓存）；单一 `memory` 工具带 add/replace/remove action，replace/remove 用"短唯一子串"匹配。
- **MemoryManager**（`agent/memory_manager.py`）：统一编排 memory provider，只允许同时挂一个外部 provider；接口为 `build_system_prompt()` / `prefetch_all(user_message)` / `sync_all(user, assistant)` / `queue_prefetch_all()`。外部后端全在 `plugins/memory/`：honcho（辩证用户建模）、mem0、hindsight、holographic、retaindb、supermemory、byterover、openviking。
- **Skill 自改进闭环**：
  - 创建 nudge：`agent/agent_init.py:1798` `_skill_nudge_interval=10`（config `skills.creation_nudge_interval`），主循环每 N 次工具迭代检查是否值得把刚学到的流程固化为 skill（conversation_loop.py:1699、turn_finalizer.py:734）。
  - 后台复盘：`agent/background_review.py` fork 出隔离的 review agent 做 turn 后审查（持久化隔离，不污染主会话）。
  - Curator：`agent/curator.py` ——空闲触发的后台 skill 维护（非 cron 守护）：生命周期状态自动迁移、派生 fork agent 做 pin/archive/consolidate/patch；硬不变量："只碰 agent 自创 skill、永不删除只归档、pinned 豁免、用辅助模型不动主会话缓存"。
  - 另有 `agent/learning_graph.py`/`learn_prompt.py` 等学习图谱模块。

---

## 7. 多渠道 Gateway 与终端后端

### 7.1 Gateway（`gateway/`）

- `gateway/run.py:GatewayRunner`（5886 行起，全文 28k 行）：单进程承载所有平台；`gateway/session.py` 维护 SessionStore（每渠道会话 → AIAgent 实例，LRU 上限 `max_live_sessions`，DETACHED 会话可从磁盘重新 resume）；`gateway/platform_registry.py:PlatformRegistry` 管理适配器注册（懒加载平台 SDK）。
- **平台 = 插件**：`plugins/platforms/` 下 22 个（telegram、discord、slack、matrix、teams、irc、email、feishu、dingtalk、wecom、whatsapp、line、signal、simplex、google_chat、mattermost、ntfy、sms、homeassistant、a2a、buzz、photon、raft）；核心仓库 `gateway/platforms/` 只留 api_server、webhook、signal、weixin、yuanbao、bluebubbles、qqbot 等。
- 插件契约（`gateway/platforms/ADDING_A_PLATFORM.md`）：目录含 `plugin.yaml`（`kind: platform`、`requires_env`/`optional_env` 富描述自动进 setup 向导）+ `adapter.py`（继承 `BasePlatformAdapter`，在 `register(ctx)` 里 `ctx.register_platform()`）；可选 hook：`env_enablement_fn`、`apply_yaml_config_fn`、`cron_deliver_env_var`、`standalone_sender_fn`（cron 进程外投递）。**"zero changes to core Hermes code"**。
- 每个平台有 `*_HOME_CHANNEL` env 作为 cron/通知的默认投递目标；授权用 `*_ALLOWED_USERS` 白名单。

### 7.2 终端后端（`tools/environments/`）

- `base.py:BaseEnvironment`（ABC）：统一"每次命令 spawn 一个 `bash -c`"模型；登录 shell 环境快照（`init_session` 捕获 env/functions/aliases，之后每命令 re-source）；CWD 经带内标记/临时文件持久；子类只需实现 `_run_bash(cmd_string, login, timeout, stdin_data) -> ProcessHandle` 和 `cleanup()`；基类提供 `execute()`（快照 source、CWD 跟踪、中断、超时、输出限流+spill 落盘）。
- 实现：`local.py`、`docker.py`、`ssh.py`、`singularity.py`、`modal.py`/`managed_modal.py`（serverless 休眠）、`daytona.py`、`vercel_sandbox.py`；选择经 `TERMINAL_ENV` env 或 config `terminal.backend`（`tools/terminal_tool.py:_create_environment`，1754 行）；config 还提供 docker_image、docker_volumes、ssh key/port 等 per-backend 参数。
- 文件同步：`file_sync.py`；进程管理：`tools/process_registry.py`、`daemon_pool.py`。

### 7.3 其他对外协议面

- `mcp_serve.py`：把 hermes 会话作为 MCP 工具暴露给 Claude Code/Cursor 等（`hermes mcp serve`）。
- `acp_adapter/`：Agent Client Protocol 服务端（Zed 等编辑器接入）。
- `tui_gateway/`：桌面/TUI 后端服务器。

---

## 8. 认证与隐私

- **无强制专有认证**：`provider: auto` 纯靠 env key 即可工作。Nous Portal（OAuth device code）只是 34 个 provider 之一（`plugins/model-providers/nous/`、`hermes_cli/nous_auth_keepalive.py`、`plugins/dashboard_auth/nous/`），删除这些插件不影响其余功能——这正是"可剥离"的实证。
- **专有/商业化成分清单**（脱敏时需处理的对象，hermes 里均为可插拔）：nous portal provider、dashboard_auth/nous、`agent/billing_*.py`/`credits_tracker.py`/`subscription_view.py`（计费视图）、`hermes_cli/xai_retirement.py`（xAI 迁移提示）、`agent/nous_rate_guard.py`。
- **遥测策略**：`cli-config.yaml.example` 明示 `telemetry.shared_metrics.enabled: false`，且"只写本地聚合计数，**不上传**"；`hermes_cli/config_defaults.py:2856` 注释"Collection is opt-in and no remote sink exists"；`agent/monitoring/`（OTLP exporter）是**用户自配**的可观测导出（自己的 collector），install_id 为可重置的假名化 UUID；第三方 cua-driver 的 PostHog 遥测被默认关闭（`cua_telemetry: False`）。
- **Trace 上传**：`agent/trace_upload.py` 仅在用户显式 `hermes trace upload` 时把会话导出到**用户自己的** HuggingFace 数据集，默认 private + 强制 secret redaction，失败即拒绝上传。
- **密钥处理**：`.env` 存 key；config 中 header/key 值标记为 secret 不落日志（`agent/redact.py`、`hermes_cli/urllib_security.py`）；支持 1Password/Bitwarden/命令式 secret 源；`agent/secret_scope.py` 做 profile 级密钥隔离。

---

## 9. 对 grok-build 脱敏改造的可借鉴点

结合"Rust 专有 coding agent → 通用 OpenAI-compatible BYOK agent"的目标：

1. **Provider 用"声明式 Profile + 插件目录"而非枚举分支**。照搬 `ProviderProfile` 的字段集（name/aliases/env_vars/base_url/models_url/auth_type/fallback_models/default_headers/default_max_tokens）与 hook 集（`prepare_messages`/`build_extra_body`/`build_api_kwargs_extras`/`get_max_tokens`/`fetch_models`）。Rust 侧可用 trait + 内建清单 + 外部目录（如 `~/.agent/providers/*.toml`）动态加载，实现"加一个后端 = 加一个目录/文件，零核心改动"。参考：`providers/base.py`、`providers/__init__.py`、`plugins/model-providers/custom/`。
2. **认证与请求怪癖分离、且认证表自动从 profile 派生**。hermes 的 `PROVIDER_REGISTRY` 在加载期用插件的 `env_vars` 自动填充（auth.py:547-590），避免两处维护。grok-build 脱敏后应只保留 `api_key`（env/config）+ 可选 OAuth 通用流程，删掉专有认证；`resolve_provider` 的 8 级优先级链（显式 flag > config > 通用 env > 专属 env > 登录态 > 报错）可直接移植为 Rust 的解析顺序。
3. **"窄腰"协议设计**：内部消息与工具 schema 统一 OpenAI chat-completions 格式，非 OpenAI 后端在出口经 transport 层转换（`ProviderTransport` 四方法）。对通用 API agent，只需实现 `chat_completions` transport 即可覆盖绝大多数后端；anthropic/bedrock transport 可留作后续扩展位。
4. **BYOK 配置面**：`model.{default,provider,base_url,api_key}` + 命名 `providers:` 条目（`key_env`/`extra_headers`/per-model timeout）+ `.env` + 外部 secret 源，这套分层（config.yaml 行为配置 / .env 密钥 / env 覆盖）值得原样保留。`custom_providers` 条目对"内网反代 + 自定义 header（如 Cloudflare Access）"场景考虑周到。
5. **`custom` provider 是现成的"任意 OpenAI-compatible"模板**：空 env_vars/base_url、别名 ollama/vllm/llamacpp、`fetch_models` 探测 `{base_url}/models`、num_ctx/think/reasoning_effort 兼容处理。grok-build 的默认模式就应是这个 profile。
6. **辅助模型链与 fallback 链**：把"压缩/摘要/视觉"等 side task 路由到廉价模型（`auxiliary_client.py` 的 auto 链 + `default_aux_model` + `free_only` 成本闸门），以及 `fallback_providers` 有序备胎 + `classify_api_error` 分类驱动的切换，是通用 agent 的刚需，建议保留为配置项。
7. **工具注册表模式**：`register(name, toolset, schema, handler, check_fn, requires_env)` + toolset 组合（includes）+ AST 发现 + generation 计数缓存，比硬编码工具列表可维护得多；`override` 需操作员 opt-in 的安全闸门也值得保留。
8. **状态层**：SQLite `sessions/messages` + FTS5 跨会话检索 + 冻结快照式记忆（MEMORY.md/USER.md）全部本地化、零云服务，与"无遥测无专有服务"目标天然契合，可作 grok-build 会话持久化的参照（注意 WAL 降级逻辑对容器/NFS 场景的价值）。
9. **可直接裁剪的部分**（hermes 中本就插件化，剥离成本低）：nous portal/billing/credits/dashboard_auth 插件、gateway 平台插件（若 grok-build 不需要 IM 渠道则整个 gateway/ 可不动）、trace_upload、cron。这验证了一个架构判断：**凡是厂商专有的东西都应做成插件，核心只留 provider 抽象 + 循环 + 工具 + 状态**。

---

## 附：关键文件速查

| 主题 | 文件 |
|---|---|
| Agent 主体 | `run_agent.py`（AIAgent）、`agent/agent_init.py`、`agent/conversation_loop.py` |
| 协议适配 | `agent/transports/{base,chat_completions,anthropic,bedrock,codex}.py` |
| Provider 抽象 | `providers/base.py`、`providers/__init__.py`、`plugins/model-providers/*`（34 个） |
| Provider 认证/解析 | `hermes_cli/auth.py`（ProviderConfig/PROVIDER_REGISTRY/resolve_provider）、`hermes_cli/providers.py`（determine_api_mode） |
| 模型切换 | `hermes_cli/models.py`、`hermes_cli/model_switch.py`、`hermes_cli/subcommands/model.py` |
| 配置 | `hermes_cli/config.py`、`hermes_cli/config_defaults.py`、`cli-config.yaml.example`、`cli.py:load_cli_config`（409 行） |
| 工具系统 | `tools/registry.py`、`toolsets.py`、`model_tools.py` |
| 状态/会话 | `hermes_state*.py`、`hermes_constants.py`（get_hermes_home） |
| 压缩 | `agent/context_compressor.py`、`agent/conversation_compression.py`、`trajectory_compressor.py` |
| 记忆/学习 | `tools/memory_tool.py`、`agent/memory_manager.py`、`plugins/memory/*`、`agent/curator.py`、`agent/background_review.py` |
| Gateway | `gateway/run.py`、`gateway/session.py`、`gateway/platform_registry.py`、`plugins/platforms/*`、`gateway/platforms/ADDING_A_PLATFORM.md` |
| 终端后端 | `tools/environments/{base,local,docker,ssh,modal,daytona,singularity,vercel_sandbox}.py`、`tools/terminal_tool.py` |
| 辅助客户端/fallback | `agent/auxiliary_client.py`、`agent/error_classifier.py`、`agent/credential_pool.py` |
