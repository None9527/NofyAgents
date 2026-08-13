# 项目脱敏分析（去除 Grok 认证与 xAI/Grok 命名）

> 目标：把本仓库（xai-org/grok-build）改造成一个干净的"裸项目"——
> 去掉 xAI/Grok 品牌、专有认证、专有服务端点，保留通用的 agent/CLI 框架能力。
> 分支：`二次开发分支`。本文档是第一步的分析结论。

## 1. 现状盘点

| 维度 | 数据 |
|---|---|
| Rust 源文件 | ~2549 个 |
| 含 grok/xai（不区分大小写）的文件 | ~2118 个 |
| crate 数量 | ~71 个（build 1 + codegen 57 + common 13） |
| git remote | `https://github.com/xai-org/grok-build.git` |
| Cargo.lock 中 grok/xai 条目 | 360 处 |

### 1.1 命名层（机械替换为主）

- **crate 名**：几乎全部带 `xai-` / `xai-grok-` 前缀（如 `xai-grok-shell`、`xai-grok-pager`、`xai-grok-auth`）。
- **npm 包**：`crates/codegen/xai-grok-pager/npm/` 下 7 个包，scope 为 `@xai-official/grok*`（含各平台二进制分发包）。
- **二进制**：`grok`（pager）、`grok-pager-bin`、`workspace_server` 等。
- **品牌字符串**：UI/README/docs 中大量 "Grok"、"Grok Build"、"xAI"（热点：`xai-grok-tools/src/registry/types.rs` 145 处、`xai-grok-workspace/src/handle.rs` 35 处）。
- **配置目录**：`~/.grok`（discovery、插件安装/信任库、主题缓存等）与项目内 `.grok/`。
- **环境变量**：`GROK_*` 系列（GROK_HOME、GROK_FOLDER_TRUST、GROK_APPEARANCE、GROK_THEME、GROK_TELEMETRY_ENABLED、GROK_OAUTH2_ISSUER/CLIENT_ID……）与 `XAI_API_KEY` / `GROK_CODE_XAI_API_KEY` / `XAI_OAUTH`。

### 1.2 认证子系统（需要整体剥离，不只是改名）

- **`crates/codegen/xai-grok-auth`**：auth_provider、bearer_fragment、retry 中间件。
- **`crates/codegen/xai-grok-shell/src/auth/`**（20+ 文件）：OIDC device flow（accounts.x.ai/oauth2/device）、JWT、token 刷新、凭据存储、AuthManager、api_key_probe、attribution。
- **`xai-grok-workspace/src/hub_auth.rs`**：auth.x.ai 的 workspace hub 认证；`grok.com/preview-auth`。
- **ACP 认证方法**：`xai.api_key` 作为一等 auth method（`agent/auth_method.rs`），贯穿 session run loop 的每轮鉴权门。
- 认证与业务耦合点：sampling 客户端、session turn、remote client、web_search/image_gen/memory 工具都直接引用 auth 或 api.x.ai。

### 1.3 专有端点（必须清除或参数化）

| 端点 | 出现位置（热点） |
|---|---|
| `https://api.x.ai/v1` | `agent/config.rs`(28)、sampler、web_search、image_gen、memory backend |
| `https://auth.x.ai` / `accounts.x.ai` | workspace hub_auth、shell auth/oidc |
| `https://proxy.grok.com/v1`、`cli-chat-proxy.grok.com/v1` | remote client、agent config |
| `https://grok.com/...`（supergrok、billing） | pager-render link_opener、scrollback |
| `https://x.ai/cli/install.{sh,ps1}`、`x.ai/promo` | 安装脚本、announcements |
| `docs.x.ai` | 错误信息链接 |

### 1.4 遥测 / 更新 / 运营功能（建议整体删除）

- **遥测**：`xai-grok-telemetry` crate（含 external OTEL 桥）、`xai-mixpanel`（Mixpanel 客户端）、`xai-crash-handler`。
- **自动更新与分发**：`xai-grok-update`（GROK_INSTALLER、从 x.ai 拉安装脚本）、npm 分发包、`scripts/install*.sh|ps1`。
- **运营位**：`xai-grok-announcements`、`util/config/campaigns.rs`（GROK_CAMPAIGNS_OVERRIDE）、billing/credit_limit 视图。

### 1.5 其他风险点

- **私有 fork 依赖**：根 `Cargo.toml` 的 `[patch.crates-io]` 指向 `github.com/our-forks/async-openai`（疑似私有仓库），裸项目必须换成官方 crates.io 版本或公开 fork。
- **git 历史**：历史提交里包含全部原始内容；真正脱敏需要 orphan 新根提交（或直接新建仓库），并移除 `origin` remote。
- **未跟踪的 WIP**：
  - `crates/codegen/xai-grok-shell/evals/`（2.6 MB）：含运行时日志 `unified.jsonl`（有 auth.x.ai 痕迹）和 grok-home 快照，其中还有 permission-denied 的 `agent_id` 文件——**建议整体删除**。
  - `docs/`（188K）、新 crate `xai-convergence`、`xai-session-journal`、journaling 相关改动：属于二次开发内容，保留但同样要过命名审计。
- **模型名**：默认模型/模型表中的 `grok-*` 名称需参数化。

## 2. 脱敏方案（建议四个阶段）

### 阶段 0：决策项（已定）

1. 新名字：待定（改名是里程碑 2 的事，不阻塞里程碑 1）。
2. **认证模型（已定）**：删除全部 OIDC/device flow/JWT/刷新；只保留 BYOK API key + 可配置 base URL。
3. **xAI API 依赖功能（已定）**：尽量全部改造为**可配置接入**（memory、web_search、image_gen、embedding、sampler 端点），不直接删能力；仅纯账号/商务/grok.com 云专属功能删除（订阅检查、billing、tier 门控、relay、会话副本注册、反馈收集、chat modes、trace 上传、扩展分享）。
4. 遥测：随专有链路删除（里程碑 1 内处理引用点，整体删除可后置）。
5. 历史处理：暂保留历史，在 `二次开发分支` 上作业；WIP 已提交保护（02a42f5、ec53897）。

### 里程碑 1 规格（当前执行）

**目标**：剥离 grok auth，打通与 pi/hermes/openclaw 同形态的通用 provider 接入。

已确认的 auth 影响面与处置（详见会话分析）：

| 组 | 内容 | 处置 |
|---|---|---|
| A 核心推理路径 | sampler_turn 凭据注入、401 重试、ACP authenticate、模型端点解析 | 改造：BYOK 扶正为默认（`EndpointsConfig`/`ModelEntry` 已有 per-model api_key/env_key/base_url 基础设施） |
| B xAI 账号体系 | OIDC/device/JWT/refresh/storage/probe、workspace hub_auth | 删除 |
| C 订阅/计费 | subscription_check、billing 扩展、tier 门控 | 删除 |
| D grok.com 云服务 | remote/*、relay、leader、session_registry、feedback、chat_modes、upload、share | 删除 |
| E 灰色地带 | memory/embedding、web_search、image_gen/image_edit、managed MCP | **改为可配置接入**（端点未配置时能力优雅禁用） |

参考实现：`ref-analysis/SUMMARY.md` §5（StreamFn 边界、Model 五字段描述符、compat 旗标、凭据解析顺序）。

### 里程碑 1 执行进度

| 提交 | 内容 | 规模 |
|---|---|---|
| `f59d65e` S1 | 订阅分级/billing/paywall 全删，门控失效开放 | -1471 |
| `1a6ee30` S2 | feedback/registry 云端同步失能（本地保留）、share 删除 | -326 |
| S4a | `is_xai_auth()` 恒 false，41 处 xAI 分支切通用路径 | — |
| `44d1a60` S4b/c | 交互登录 + OIDC/device/JWT/devbox 机制删除，flow.rs 2233→352 行；run_headless/run_leader 桩掉 | -7953 |
| `b43f35e` S5a | ACP auth method `xai.api_key` → `api_key` | — |
| `fba7ac2` S3a | grok.com 数据面客户端（conversations/workspaces/skills/chat-modes/sandbox）删除，unified_list 会话车道移除 | -3941 |
| `4d803d8` S3b/c | upload trace 管道、relay、leader（~13k 行）删除，pager leader UI 移除 | -31041 |
| `afe2cd1` S6 | 测试 harness 对齐 api_key 方法 ID | — |

**里程碑 1 完成 ✅**：全 workspace 编译零错误；shell 库测试除环境性失败外全绿；构建二进制 e2e 冒烟 **31/31 通过**（完整 ACP stdio 生命周期、流式响应、BYOK 授权请求、headless 模式，全部对 mock OpenAI-compatible 端点）。累计净删约 **45,000 行**专有代码。

**S6 审计基线（里程碑 2 改名前）**：grok/xai 字样残留 1978 个文件（主要是标识符/crate 名，属里程碑 2）；api.x.ai 非测试引用 91 处；auth.x.ai/grok.com 端点残留 67 个文件（分布：pager 23、shell 21、workspace 6、telemetry 3——workspace crate 的 hub_auth 是 B 组漏网项，里程碑 2 处理）。

### 里程碑 2 完成 ✅（改名 Nofy）

| 提交 | 内容 |
|---|---|
| `62d06ed` P1/P2 | 127 个 crate 目录/包名/标识符 xai-*→nofy-*（2945 文件） |
| `3664fee` P3 | 环境变量 GROK_*/XAI_*→NOFY_*（XAI_API_KEY→NOFY_API_KEY，GROK_XAI_API_BASE_URL→NOFY_API_BASE_URL） |
| `afd84b1` P4 | 配置目录 .grok→.nofy |
| `0c4b35c` P5a | Grok* 标识符→Nofy*，模块目录/主题/proto/快照文件改名 |
| `0e13fa3` P5b | ACP wire 命名空间 x.ai/*→nofy/*（1513 处），品牌字符串替换，proto 包 nofy.tools.v1 |
| `9a3577f` P5c | 清理 LEGACY_NOFY_API_KEY 重复常量；还原被误伤的功能性端点域名（api.x.ai 等） |
| `c3f30dc` P6 | 二进制名 nofy、npm 包 @nofy/*、README 重写、移除 origin remote |

**改名后审计**：含 grok/xai 文件 1978 → 559。残留为两类**有意保留**：
1. `is_xai_api_url`、`xai_api_base_url` 等端点集成标识符——指代"xAI 后端"这一 provider 的语义，provider 无关架构中合法存在；
2. `grok-3/4/4.5` 等模型 ID——后端数据（模型目录），不是品牌。

**决策记录**：
- 功能性 xAI 端点默认值（api.x.ai、cli-chat-proxy.grok.com）保留——保证插 xAI key 开箱可用，用户可用 NOFY_API_BASE_URL / config 覆盖指向任意 OpenAI-compatible 后端；
- 死营销链接（supergrok/promo 等）保持 nofy.com 占位；
- relay/gateway 死端点常量保持 nofy.com 占位；
- `nofy-workspace::hub_auth` 模块保留不改名（复查结论）：生产代码已完全 nofy 化（读 `~/.nofy/auth.json` 的通用 OIDC/bearer provider），"hub" 指 computer-hub 功能组件（nofy-computer-hub-* crate 家族），与兄弟模块 hub/hub_channel/hub_ids/hub_server 命名一致；`"hub_auth"` 还是 `hub_auth_marker_is_stable_literal` 回归测试断言的稳定 wire 标识；x.ai 字样仅存在于测试 fixture。

**环境性测试失败（与代码无关）**：
- `config::watcher` 15 个 + `xai-fsnotify` 11 个：VS Code server 占用 65,054/65,536 inotify watch，`inotify_add_watch` 返回 ENOSPC。解决：`sudo sysctl fs.inotify.max_user_watches=524288` 或在 VS Code 配置 `files.watcherExclude` 排除 target/ 与 ref/。
- `auth::auth_provider::provider_expiry_source_precedence`：jsonwebtoken CryptoProvider 环境。
- `claude_import::gate_load_claude_env_returns_empty_when_marker_set`：本机 ~/.claude 状态。

**E 组侦察结论（S5）**：web_search 经 per-model BYOK 凭据接入（无 key 自动 Disabled）、memory/embedding 直接用会话 sampling base_url、image/video 用 `endpoints.xai_api_base_url`（env 可覆盖）——三者已"可接入"，无需额外代码。

已知预存测试失败（与脱敏无关，文件未被改动）：`auth::auth_provider::provider_expiry_source_precedence`（jsonwebtoken CryptoProvider 环境）、`claude_import::gate_load_claude_env_returns_empty_when_marker_set`（本机 ~/.claude 状态）。

### 阶段 1：先删后改（减小改名面积）

- 删除 `xai-grok-auth` crate、`shell/src/auth/` 中 OIDC/JWT/refresh/device 流（保留一个最小 ApiKey provider trait）。
- 删除 `xai-mixpanel`、`xai-grok-telemetry`（外部上报部分）、`xai-grok-update`、`xai-grok-announcements`、campaigns、billing/credit 视图、npm 分发包、install 脚本。
- 删除 `evals/` 运行产物；移除 `our-forks` patch；移除 origin remote。
- 处理所有 `mod`/依赖引用，保证 `cargo check` 通过后再进入改名。

### 阶段 2：机械改名（脚本化）

- crate 目录名 + Cargo.toml 包名 + workspace members + `use`/`extern` 路径（下划线形式）。
- env 变量、`~/.grok` 路径、二进制名、npm scope（若保留）。
- UI/README/docs 品牌词替换（注意区分大小写与词边界，避免误伤）。
- `cargo metadata` 驱动的批量 rename 脚本 + 全量编译验证。

### 阶段 3：端点与模型参数化

- `api.x.ai/v1` 等硬编码 → 配置项/env（如 `BASE_URL`），默认留空或指向用户自配；sampler、web_search、image_gen、memory backend 统一走该配置。
- 模型表去 grok 化，改为可配置模型列表。

### 阶段 4：验收

- `rg -i 'grok|xai|x\.ai' --glob '!target'` 归零（白名单除外）。
- `cargo check --workspace && cargo test --workspace`。
- 全新 clone 构建通过；确认无外发请求（遥测/更新/公告出口全部消失）。

## 3. 工作量与风险估计

| 阶段 | 性质 | 估计 |
|---|---|---|
| 阶段 1 删除 | 外科手术式，耦合点多（session/sampling/tools/workspace） | 工作量最大、风险最高 |
| 阶段 2 改名 | 机械、可脚本化 | 量大但低风险 |
| 阶段 3 参数化 | 中等 | 中 |
| 阶段 4 验收 | 自动化 | 小 |

主要风险：认证与 session 主循环、sampling、工具层深度耦合；删除时需保留一个最小凭据接口避免大面积重写。

## 4. 工具说明（GitNexus）

- 已运行 `npx gitnexus analyze` 完成全仓索引（`.gitnexus/`，commit 393430e），并生成 AGENTS.md/CLAUDE.md；`.gitignore` 已加 `.gitnexus`。
- 注意：当前会话没有注册 GitNexus 的 MCP server（工具列表里搜不到），MCP 服务器需要在宿主配置里添加后才能用图谱查询工具；本分析用 CLI + ripgrep 完成，不受影响。
