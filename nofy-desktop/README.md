# nofy-desktop

给 **nofy 内核**重写的桌面前端。干净树，不从 `desktop/` 继承任何运行期代码。

框架计划见 [PLAN.md](./PLAN.md)——三条裁定、通信契约与陷阱表、目录树、施工序、验收门都在那里。

## 为什么是新树，不是继续改解析产物

一句话：旧路的手术面已经滑到**不可维护的那一层**。

- `desktop/src/out/renderer` 是 757 个 chunk、标识符永久最小化的出厂产物，
  最近的改动是在一个 214,056 行的 chunk 里**手写新 UI**（modality 选择器，+168/−50）。
  那里没有类型门、没有模块边界、没有重建管线，也永远吃不下上游升级。
- 旧路自己的只读真值 md5 基线已被打破（PLAN.md §10 I3），量具被污染。
- 而 host 侧接线是**成功**的——那部分的价值是知识（33 通道分类、内核 ACP 面测绘、
  D1–D20 缺陷账），不是代码。知识已经全部沉淀在 PLAN.md §2 与 `desktop/src/docs/`。

## 干净室规则（违反即回滚）

1. **不得 import** `desktop/`、`out/`、`src-reconstructed/`、`desktop/src/src/` 下的任何代码。
2. **不得修改 `desktop/`**。该树自此为只读参照物。
3. 唯一允许的移植是 PLAN.md §9 白名单里的 seam 左列 2,535 行，
   且移植＝**读其行为、重写为 TypeScript**，不是拷贝 JS。
4. **内核零改动**：`crates/` 与 `~/.local/bin/nofy` 不动。发现缺口就登记，不擅自改。
5. **配置单一真源**：只有 `~/.nofy/config.toml`（桌面私有状态写其 `[desktop]` 段）。
   不引入 setting.json，不引入 `~/.nofy/v2/`。
6. `tsc --strict` 零错误。**不准用 `declare X: any` 或 `: any` 消错**
   （旧工程树有 7,153 处 any，tsc 绿但保真度存疑——那是反面教材）。

## 参照物在哪

| 要什么 | 去哪看 |
|---|---|
| 事件→UI 契约（最权威） | `desktop/docs/research/nofy-tui-full-spec.md` Part 4 |
| 施工顺序与验收判据 | 同上 Part 5（P1–P8 parity 表） |
| 内核线路名（不得凭空造名） | `desktop/src/docs/KERNEL-ACP-SURFACE.md` |
| 逐方法实测结果与客户端义务 | `desktop/src/docs/PORTING-PLAN.md` §2.1–2.4 |
| 功能域取舍（K0/K1/K2/K3） | `desktop/src/docs/UI-KERNEL-GAP-MATRIX.md` |
| 控件工艺（虚拟化列表/Lexical/diff/xterm） | `desktop/src/src-reconstructed/`（只读） |
| 活体行为预言机 | CDP 9400（旧壳仍在跑，可截图对照、可录事件流） |

## 通信

**ACP over stdio**，单个 `nofy agent stdio` 子进程，归 Electron main 所有。

这不是妥协：TUI 自己就是 ACP 消费者——`nofy-pager` 进程内嵌 `MvpAgent`，
经 tokio mpsc 通道传 `AcpClientMessage`/`AcpAgentMessage`（`acp/spawn.rs`、
`nofy-acp-lib/src/channel.rs`）。所以 **ACP + `_nofy/*` 扩展对全保真 UI 是已被第一方
证明充分的**。headless 与 leader 模式在本构建里都已 bail，指向 `agent stdio`。

## 状态

- [x] 框架计划（PLAN.md，448 行；一条命令跑全部门：`pnpm verify`）
- [x] S1 传输层 + packages/acp 契约包（7/7 验收门；实测证据 docs/contract/initialize-measured.md）
- [x] 协议契约 codegen：ACP 权威 schema 入库 + 线路名生成 + drift 门（PLAN.md §12）
- [x] NOFY_HOME 测试隔离（完全 hermetic，隔离生效可断言）
- [x] 恢复 smoke：SIGKILL → 察觉 → 清账 → 自动重派生 → 单内核不变量（11/11）
- [x] S1b 完整轮次黄金夹具 + 回放门 23 例（54 帧 / 4,274ms / end_turn，已脱敏）
- [x] 归一化层 renderer/core/events.ts（线路形状 → 应用形状的唯一入口）
- [x] 夹具卫生门 audit-fixtures.ts（密钥与真实路径为硬红线，已入 verify 链）
- [x] 投影层 core/project.ts + reducer store（回放门 18 例；抓到 tool_index 关联的真 bug）
- [x] 能力门三条裁定 folderTrust / codeNavigation / mcp-sdk（docs/contract/capability-gates.md）
- [x] 权限流夹具 + P2 逐字对齐回放门（含 permission_mode 抑制提问的前置发现）
- [x] 重连+回放夹具 + 去重回放门 8 例（去重语义定案：单一高水位，不需 epoch 重置）
- [x] **P1 硬前提已解**：冷启动标题从 session/load 响应取（零额外往返）；5 条读路径形状实测
- [x] 端到端接线 KernelPort → bind → store + Effect 层（16 例门；请求/通知之分结构性强制）
- [x] **S0 Electron 壳**：边界三件套（contract / bridge / adaptIpcBridge）+ hold 层 +
      第一个真界面（ShellGrid + 脊柱 + 审批卡 + composer），令牌驱动样式；
      真键盘路径验过一整轮。账见 docs/contract/ipc-boundary.md 与 tokens-measured.md
- [ ] 补夹具：plan / ask_user_question / cancel / subagent
      + permission 变体（bash 族 / MCP 族 / reject 附言 / allow-edits-session）
- [ ] zod strict schema（由 schema.unstable.json 生成，替换当前宽松的 InitializeResult）
- [ ] P1 冷启动：roster 可点 → session/list + session/load（标题零额外往返，action 已备）
- [ ] 其余 smoke：interrupt / reconnect-streaming / user-input / permission-policy / config-hot-reload / history-pagination（路线图见 docs/contract/codex-web-reference.md）
- [ ] P1 会话内环（合格线）
- [ ] P2 审批保真（合格线）
- [ ] P3–P8 增量

## 跑起来

前置：`pnpm install`；electron 的 dist 若被包管理器拦了 postinstall，
手动跑一次 `node node_modules/.pnpm/electron@*/node_modules/electron/install.js`。
内核二进制走 `NOFY_BIN` → `~/.local/bin/nofy` → 本仓库 `target/release/nofy`。

```sh
pnpm verify                 # 总门：gen → typecheck×2 → test → audit → build → smoke×2
pnpm build && pnpm start    # 打包后跑真 ~/.nofy
pnpm dev                    # renderer HMR + main/preload 预构建 + electron

# 演示/自检（不碰真 ~/.nofy；审批面只有在 default 模式下才会出现）
NOFY_ISOLATED_HOME=1 NOFY_WORKSPACE=/path/to/repo pnpm start
NOFY_SCREENSHOT=/tmp/x.png NOFY_SCREENSHOT_DELAY=8000 NOFY_ISOLATED_HOME=1 pnpm start
```

改视觉：改 `apps/desktop/renderer/ui/themes/zcode.json` → `pnpm tokens` → 看截图；
`tokens.css` 是生成物，不手改（级联语义的坑见 docs/contract/tokens-measured.md §2）。







