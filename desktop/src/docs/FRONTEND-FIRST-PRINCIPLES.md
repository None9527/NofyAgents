# 前端问题的第一性原理重定框（A1-B）

状态：**生效** —— 本文取代「先全量逆向 renderer 再谈移植」的工作序；PORTING-PLAN 的阶段
B–E 回到关键路径，A1 renderer 重建降级为非关键路径的只读资产。
日期：2026-09-06 · 基线 b37869f · 全部结论附实测证据，非推论。

---

## 1. 地面真相（实测，可复跑）

| # | 事实 | 证据 |
|---|---|---|
| 1 | 仓库里有两个产品：nofy Rust 内核（92 crates，原生 ACP 库 `nofy-acp-lib` 2,277 行）与 ZCode 3.7.6 去品牌 Electron 壳（`desktop/src/out/`，**已解混淆**：prettier 重排 + main/host 约 15,500 个真符号名回代；**renderer 无 keep_names，标识符永久最小化**） | `desktop/src/README.md` §2/2b；`out/host/index.js` 52,824 行、平均行长 33.5 |
| 2 | **PORTING-PLAN 阶段 A 已完工并提交**（`40e5871`，08-30 15:12）：main 内 `NofyKernelClient` 单例 + kernel-supervisor + main↔host IPC 桥 + `acp-probe5` 17/17 | `git show 40e5871 --stat` |
| 3 | 阶段 A 之后的 **276 个提交全部只改 `desktop/src/src/`**（renderer 重建影子树，456 文件）；`out/` 0 次、`crates/` 0 次 | `git diff --numstat 40e5871..HEAD` |
| 4 | PORTING-PLAN §2.6 明写：「renderer（757 个 minified chunk，无符号）← **第一阶段不动**」「renderer 是压缩产物，改它代价极高；**host 是唯一合理的手术面**」 | `docs/PORTING-PLAN.md` §2.6 |
| 5 | 出厂应用可启动、UI 完整渲染，但被**唯一硬阻塞**卡死：首页横幅「当前没有可用模型」，host 日志 `providerCount:0 ⇒ ZCode agent 保持未启动` | CDP 探针 + `electron.log`（§2.7 的 Producer A/B/C 全中） |
| 6 | `~/.nofy/v2/config.json`（provider 镜像）**不存在**；`~/.nofy/config.toml` 有 4 个模型（grok-4.5 内置 + dashscope/qwen-coder/glm-5.2） | `ls ~/.nofy/v2/`；`grep '^\[model' ~/.nofy/config.toml` |
| 7 | `nofy agent serve` **不带 `--secret` 时自动生成随机 secret**（仅 stderr 打印，无状态文件）；桌面 seam 硬连 `server-key=nofy-desktop` ⇒ 对外部启动的内核，阶段 A 单例**结构上握不上手**（`kernel client not ready (8000ms)`） | `nofy agent serve --help`；kernel banner `Secret: 57de32046e66`；probe5 FATAL |
| 8 | 带 `--secret nofy-desktop` 启动内核后 `acp-probe5` **17/17 全过**（modelState 4 模型、roster 11 条、cancel=notification 7ms 收尾、全进程 WS=1） | `node desktop/scripts/acp-probe5.mjs` |
| 9 | **main→host 的 utilityProcess 裸帧在真应用里不送达**（六次对照实验：parentPort 裸帧／带空 transfer 列表／专用 MessageChannelMain 转移端口，host 侧最早注册的监听均收不到；而 host→main 方向可达、内核侧 initialize 已被处理并回推通知） | `[kbridge] reply ok= true` 与 host 侧零收帧的对照日志；kernel `--debug-file` 轨迹 |
| 10 | 门槛快照的投影判据：`shouldIncludeModelProviderInZCodeAgentRegistry` + `convertModelProviderConfigToZCodeProviderInput` 要求 `endpoints.paths[kind]` 存在且模型条目带 `kinds`、`models` 为**数组**形 | `out/host/chunk-O5YHTQBW.js:14050/14871`；`TypeError: e.models.filter is not a function` |

## 2. 已证缺陷（登记即修，不留隐患）

- **D1（secret 契约）**：supervisor 的 attach 路径无法认证外部启动的内核（secret 不可发现）。
  08-30 的 17/17 是对带匹配 secret 的内核测的；此后内核被换成无 secret 进程，Track A 静默失效且
  「kernel ready attach-9800」日志**主动误导**（它只是端点发现，不含握手结果）。
  本批处置：运维层以 `--secret nofy-desktop` 恢复契约；代码层待办＝attach 失败时把
  WS 关闭码/401 纳入超时错误文本（见 §4 P3）。
- **D2（桥的 main→host 方向死）**：阶段 A 的 host 消费面自提交起**从未被端到端验证**
  （probe5 只测 main 侧纯 Node）。本批将传输改为每 child 一条专用 MessageChannelMain
  （与 ChannelServer 服务帧同形制）；**该方向仍未证实可达**，故门槛取数不依赖它（见 D3 兜底）。
- **D3（模型门槛）**：已修。host `model-provider` 服务在存储注册表为空时，以
  「内核 modelState（经桥，优先）→ `~/.nofy/config.toml` 的 `[model.*]` 只读派生（兜底）」
  合成一条 provider 条目（`apiKeyRequired:false`、`endpoints.paths` 与模型 `kinds` 齐备），
  门槛三 Producer 全绿，**renderer 零改动**。实测：横幅消失、快照 `providers=1 ids=nofy-kernel`、
  agent 服务越过门槛并尝试启动旧 adapter。

## 3. 修正后的工作序

1. **阶段 B（会话主流程切 ACP）＝下一切片**。门槛已绿，但首发仍走旧 adapter（其传输已报错
   `ZCode agent transport`，且 cancel=notification 等缺陷在案，§2.5）。B 完成后首发/流式/停止/
   权限应答才真正可用，并顺带消除「adapter 第二条 WS 抢单客户端槽」的 §2.3 违例。
2. **阶段 C 余量**（设置界面直读写 config.toml、拆 `v2/setting.json` 等）随 B 滚动。
3. **阶段 D/E** 按 PORTING-PLAN 原序。
4. **A1 renderer 重建＝冻结为非关键路径**。理由：§2.6 已裁定 renderer 第一阶段不动；276 提交
   对「应用能否工作」零贡献；其产物（356 文件/343,126 行、tsc+esbuild 绿）保留为只读资产与
   回归哨兵（七门继续跑），但**不再作为进度指标**；「out/ 零改动」不变量自本批起仅约束
   renderer 三束字节（byte-identity 证据），**不再约束 host/main 的移植手术**。
5. **验证开销硬规则**：任何批次的验证成本不得超过其产品码成本；被引证的判决必须读已提交之物。

## 4. 待办队列（按序）

- **P0.5 桌面拓扑＝私有 stdio 子进程：完成**（2026-09-06）。supervisor 默认派生
  `nofy agent stdio` 私有子进程（无端口/无 secret/天然单父客户端/父死子亡）；
  attach-serve 降为显式 opt-in（`NOFY_KERNEL_ATTACH=1`）。验收：`acp-probe6` **13/13**
  （stdio-child 形态、子进程 ps 实证、initialize/modelState/扩展负对照、零 TCP、
  cancel 通知 7ms、`close()` 后子进程 stdin EOF 退出）；`acp-probe5`（WS/attach 基线）
  **17/17 无回归**；真应用实证：9803 有活 serve 亦**零 attach**、门槛横幅消失、
  应用退出后子进程回收（code=143、零孤儿）。D1 在默认拓扑下**结构性消失**。
- P1 阶段 B 垂直切片：host 会话实现改走 main 单例（列表/新建/load 回放/prompt 流/停止/权限应答），
  验收＝UI 真发一条 prompt 见流式、停止 `stopReason:cancelled`、权限弹窗可批可拒。
- P2 修 D2：为桥的 main→host 方向建立**入库的端到端回归探针**（host 侧收帧断言），
  在探针绿之前一切 host 取数不得依赖该方向。
- P3 修 D1 代码层：`ensureNofyKernelClient` 超时错误携带 WS 关闭码/HTTP 状态（401 ⇒ 明示 secret 不匹配）。
- P4 阶段 C：设置界面直读写 config.toml（含 JS 侧保注释编辑方案定案，PORTING-PLAN §6.1）。
