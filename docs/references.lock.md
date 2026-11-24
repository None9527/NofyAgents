# Reference Repositories Lock (`ref/`)

本文件锁定本地 `ref/` 目录下 12 个外部参考仓库的只读基线提交（`git rev-parse HEAD`）、上游地址、Nofy 借鉴的设计思想，以及明确拒绝引入的耦合项。

> 约束：
> - `ref/` 仅作为只读研究参考源，不参与 Nofy Rust 工作区构建与运行时依赖。
> - 任何被 Nofy 采纳的跨平台原语或安全机制均已在对应 crate 内独立实现并附带测试（如 `crates/common/nofy-private-fs/THIRD_PARTY.md` 所列来源说明）。

## 锁定清单（12 仓）

| 参考仓 | 分支 | 锁定 Commit SHA | 上游 Remote (`origin`) | 核心借鉴点 | 明确拒绝的耦合项 |
|---|---|---|---|---|---|
| `ADAS` | `main` | `2702bee8fefda42255efc5be9f60e3bd3db96ae4` | `https://github.com/ShengranHu/ADAS.git` | 自动化 Agent 系统设计与评测闭环的抽象思路（候选结构探索 + 基准校验） | 拒绝无门控自由生成并直接执行任意 Python 代码、拒绝绕过声明式模块契约与确定性摘要校验 |
| `AFlow` | `main` | `3f457218fc716093fe53f6df8a5d5e6379d66346` | `https://github.com/FoundationAgents/AFlow.git` | 图/工作流编排优化与基于执行反馈迭代筛选候选工作流的思路 | 拒绝 MetaGPT 运行时重依赖、无预算上限的树搜索与非确定性动态图热改 |
| `AgentFactory` | `master` | `df92287894ab7bc9cdfecbd469f4b8a2f4a27616` | `https://github.com/zzatpku/AgentFactory.git` | 将验证通过的专用能力沉淀为可复用子 Agent/模块包并按执行反馈持续改进的理念 | 拒绝将未签名、无权限边界的任意 Python 源码直接作为宿主常驻模块加载 |
| `AutoAgent` | `main` | `16c12b052ef2330a198063c62a07a7f9723031e3` | `https://github.com/HKUDS/AutoAgent.git` | 声明式/低门槛组合多工具与子 Agent 的高层交互抽象 | 拒绝隐式全局状态、黑盒自动化工具拼装与弱类型自由编排 |
| `Comma` | `main` | `66ab3dc92475005aea9afd123df36a28e4ef86ab` | `https://github.com/AFK-surf/Comma.git` | 常驻任务连续性、跨端状态持久化与确定性/形式化状态机建模思路（`determinism/`、`tla/`） | 拒绝绑定单一云托管服务、弱化本地会话/工作区隔离或绕过宿主治理预算 |
| `ZCode` | `main` | `a9fe401eede6e6e5e01be9048679c206fe6f02d9` | `https://git.none.xz.cn/none/ZCode.git` | 桌面/浏览器/终端一体化工作台交互分层（会话作用域、输入态、展示态解耦）与本地 Web Cookie 流程参考 | 拒绝用 Electron/桌面 IPC 取代统一内核 HTTP 鉴权与作用域契约、拒绝在内核硬编码特定前端视图状态 |
| `claude-code-clone` | `master` | `c16284c1e2c3e75634af23d71a2210e09ba08292` | `（本地只读快照，未配置 remote）` | 终端编码 Agent 行为对照：取消信号贯穿在途请求、后台任务输出落盘与简洁 CLI 交互语义 | 拒绝 Node.js 运行时耦合、无检查点事务的纯追加 JSONL 主状态存储与非受控环境透传 |
| `codex` | `main` | `ba057e43758cb19beead2af9df19d10756cc4100` | `https://github.com/openai/codex.git` | Windows 仅所有者受保护目录 ACL 校验方案（已改造沉淀于 `nofy-private-fs`，见 `THIRD_PARTY.md`）与沙箱/审批体验参考 | 拒绝直接照搬其 CLI 私有协议、拒绝放宽 Nofy fail-closed 隔离门禁或引入单一供应商锁定 |
| `deepseek-harness` | `master` | `fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159` | `https://github.com/deepseek-ai/deepseek-harness.git` | 插件化架构理念、本地浏览器 HttpOnly Cookie + 请求信任校验模式（`browser-auth`）与输入提交策略解耦 | 拒绝 TypeScript/Cordis 动态插件运行时、拒绝未声明能力边界的热插拔插件直接持有宿主权限 |
| `dgm` | `main` | `a565fd2d1dca504ef5104a7cc0f3bdc4ab9b4fd2` | `https://github.com/jennyzzt/dgm.git` | 实证门控自改进循环（先基线、再候选评测、观测回归与回滚的演进思想） | 拒绝开放式无界自我修改宿主二进制/内核源码、拒绝缺乏预授权基线、成本红线与自动回滚的自修改 |
| `grok-build` | `main` | `2bdd1d6a6369de0e8c68132ea4539e9abd9e14a8` | `https://github.com/xai-org/grok-build.git` | 早期上下文压缩、目标状态跟踪与终端体验对照基线（已与上游完全解耦并独立演进） | 拒绝任何 xAI 私有依赖/品牌/协议耦合，拒绝在共享内核层回流产品外壳（shell/TUI）私有逻辑 |
| `pi` | `main` | `0c5b7ee39352658b54385cf29c25f777b20b0f20` | `https://github.com/earendil-works/pi.git` | 极简、可组合的 Agent harness 扩展面设计与低仪式感工具接入理念 | 拒绝牺牲检查点持久化、版本化模块摘要、审批治理与确定性恢复来换取轻量脚本式扩展 |

## 校验命令

如需复核本地 `ref/` 索引与本文件一致，可执行只读校验：

```bash
for d in ref/*/; do
  name=$(basename "$d")
  sha=$(git -C "$d" rev-parse HEAD)
  url=$(git -C "$d" remote get-url origin 2>/dev/null || echo "NO_REMOTE")
  printf "%-20s %s  %s\n" "$name" "$sha" "$url"
done
```
