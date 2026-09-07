# UI ↔ 内核 域处置图（双向缺口账）

状态：**v1（2026-09-06）** · 证据基＝renderer 通道表（src-HCld2afU.js:8468-8501）与 host
通道表（chunk-O5YHTQBW.js:17538-17571，两表逐字一致 33 通道）+ `KERNEL-ACP-SURFACE.md`
（266 扩展线路名 / 66 分派表可达）+ PORTING-PLAN §2/§4 实测。
用途：回答「UI 有哪些功能内核没有」，并据此分阶段；**每域一行，方法级差异只在垂直切片域展开**。

## 差距类别

- **K0** 内核已有 ACP 对应 ⇒ 映射即可（无新功能）。
- **K1** 内核无对应、属桌面私有 ⇒ 留桌面实现（config.toml `[desktop]` / tasks-index.sqlite / 本地 fs / Electron 能力）。
- **K2** 内核无对应、云时代死功能 ⇒ 拆除或隐藏（阶段 D）。
- **K3** 内核无对应、仍是真需求 ⇒ 在「内核零改动」约束下只能桌面降级/隐藏，或登记为内核需求待评审。

## 域处置表（33 通道）

| 通道 | UI 域 | 内核对应面 | 类别 | 阶段 |
|---|---|---|---|---|
| nofy-agent / zcode-session | 会话主流程（composer/流式/权限/历史） | stdlib 10 点 + `_nofy/session/*` 族（info/list/updates/rename/delete/fork/usage/state/load_history/search）+ `_nofy/sessions/changed` | K0 | **P1（B）** |
| model-provider | 模型选择/门槛/自定义模型 | `initialize._meta.modelState`、`_nofy/models/update`、`session/set_model`；写侧仅 config.toml 直写（§2.4） | K0（读）/K1（写） | P4（C） |
| setting | 设置界面 | config.toml 直读写 + `_nofy/settings/update` 热重载 | K0/K1 混合 | P4（C） |
| mcp-sync | MCP 管理 | `_nofy/mcp/*` + `nofy/mcp/upsert|delete`（内核直落 config） | K0 | P4（C） |
| credential | API key | `_nofy/getApiKey|setApiKey`（写 auth.json） | K0 | P4（C） |
| oauth | 登录墙 | 已本地化 stub；内核 `authenticate{api_key|cached_token}` | K2 | P5（D） |
| coding-plan-subscription | 订阅/升级按钮 | 无（云壳，返回常量） | K2 | P5（D） |
| settings-sync | 云设置同步 | 无（云壳） | K2 | P5（D） |
| off-peak-task |  off-peak 调度 | 仅 `_nofy/scheduler/delete`；调度本体在桌面 scheduler 进程 | K1/K3 | P6 评审 |
| usage-stats | 用量页 | `_nofy/session/usage` + prompt 响应 `_meta` + `turn_completed.usage` | K0 | P6（E） |
| terminal | 终端面板 | 内核自管（clientCapabilities 不声明）+ `nofy/terminal/*`、`pty/*` | K0 | P6（E） |
| git / git-checkpoint | Git 面板/审查/回退 | `_nofy/git/*`、`git/worktree/*`、`pr/status`、`hunk-tracker/*`、`rewind/*` | K0 | P6（E） |
| skills / skill-sync | 技能页 | `_nofy/skills/*` | K0 | P6（E） |
| commands | 命令面板 | `initialize._meta.availableCommands` + `_nofy/commands/list` | K0 | P6（E） |
| hooks | Hooks 设置 | `_nofy/hooks/*` | K0 | P6（E） |
| memory | 记忆设置 | `_nofy/memory/{flush,rewrite}` + config `[memory]` | K0 | P6（E） |
| subagents | 子代理面板 | `_nofy/subagent/{cancel,get,list_running}` + `_nofy/task/*` | K0 | P6（E） |
| plugins / plugin-management / plugin-sync | 插件页 | `_nofy/plugins/*` + config `[plugins]` | K0 | P6（E） |
| output-style | 输出风格 | 无直接对应（≈ prompts/config 私有） | K1/K3 | P6 评审 |
| bots | 云 bot | 无（云功能残壳） | K2 | P5（D） |
| feedback | 反馈工单 | 无（云工单残壳；本地化 stub 在案） | K2 | P5（D） |
| repo-wiki | 仓库维基索引 | 无（桌面索引私有） | K1/K3 | P6 评审 |
| zcode-task | 任务列表/分组/自动化 | 数据源换 `_nofy/sessions/changed` + `session_summaries`；分组/自动化存 tasks-index.sqlite | K0/K1 混合 | P1（B）尾 |
| file / file-watcher | 文件服务/监视 | 内核 `_nofy/fs/*` 存在但桌面建议自管（§2.3 fs=false） | K1 | 不动 |
| system / broadcast / prompt-attachment-transfer | 桌面本地能力 | 与内核无关 | K1 | 不动 |

renderer 内部域（无通道依赖，**任何阶段都不动**）：xlsx 引擎、code-viewer/diffs 渲染、
conversation 排版、onboarding 视觉、侧栏/搜索/命令面板外壳。

## K3 登记（内核零改动约束下的真缺口）

1. 多窗口共享单内核（裁定 K 的 K1 面）：候选 fd-socketpair 或修 main→host 投递。
2. off-peak/调度本体：内核仅有 delete；桌面 scheduler 进程自持 ⇒ 维持 K1 或隐藏入口。
3. repo-wiki / output-style：桌面私有实现或隐藏；不伪造内核能力。

## 分阶段序（每阶段独立可验收）

- **P1（B）** 会话主流程 + roster/任务列表数据源换轨（K0 垂直切片）。
- **P2** 桥 main→host 收帧探针（独立小件）。
- **P3** attach 模式 secret 诊断（D1 代码层）。
- **P4（C）** 配置面：model-provider/setting/mcp/credential 直读写 config.toml + 拆 v2 镜像。
- **P5（D）** 拆云壳（oauth/subscription/settings-sync/bots/feedback）+ ZCode 协议层与 adapter 拆除。
- **P6（E）** 按域点亮 K0 余域（terminal/git/skills/commands/hooks/memory/subagents/plugins/usage），
  每域一个 UI 验收；K3 队列单独评审后定「降级/隐藏/登记内核需求」。
