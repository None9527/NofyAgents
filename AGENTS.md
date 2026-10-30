<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **nofy-build** (114580 symbols, 272731 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## 阶段性实施与验证

- 允许按有明确目标和依赖边界的阶段连续实施；同一阶段内不要求每改一个函数或文件就运行测试、刷新索引或停下来确认。
- 在阶段开始时，对已知的变更入口集中做 upstream impact 分析，并报告调用方、受影响流程及风险。已有分析覆盖同一变更集合时可复用；新增公共契约、扩大依赖范围或出现新的高风险入口时补充分析。
- 每阶段结束集中运行相关构建、契约与回归测试；出现失败先修复，再进入依赖该阶段的工作。不要求无新证据时重复运行已通过的相同检查。
- HIGH/CRITICAL 风险须在编辑前报告，并采用兼容适配和有界迁移；不因风险标签本身反复请求已授权范围的批准。
- 最终验收必须同时满足：能力可通过公共模块组合成不同用途 Agent；原始 Nofy 编程 Agent 预设可用原有入口、配置直接运行，对话、工具、权限、取消、流式输出及恢复等既有行为兼容。不能只以分包完成、单元测试通过或新示例能运行宣称整体完成。
- 最终产品为控制台驱动的常驻 Agent 平台，所有可变能力须有外部定义/脚本/制品、管理与装载路径；常规能力更改不得要求修改内核 Rust 源码、重编译应用或重启内核。SDK 示例和静态编译快照不是最终交付。
- 采用“配置即系统”的声明式入口：一份可移植系统配置可共享/迁移 Agent、代码/模块、依赖、资源及策略；控制台、文件和 API 使用同一事实源。验收依赖锁定、环境预检、幂等应用、差异与回滚；凭据独立注入，历史状态走显式迁移，不能依赖手工 Rust 注册或重编译应用。
- 运行中更新须有明确应用边界、版本转换和恢复证据；保留会话状态、预算与已成功效果，不能把只对新运行生效宣传为完整热更新。
- 当前优先控制面、Loader 与执行更新机制；新控制台为后续里程碑。原 TUI、Web 或桌面展示层不重构，必要旧宿主接入在内核适配层完成。

## Always Do

- **MUST run impact analysis for each implementation stage.** Before editing, analyze the stage's affected entry points with `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius. Reuse that analysis within its covered scope; supplement it when scope or public contracts expand.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER expand a stage beyond its analyzed scope without supplementing impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/nofy-build/context` | Codebase overview, check index freshness |
| `gitnexus://repo/nofy-build/clusters` | All functional areas |
| `gitnexus://repo/nofy-build/processes` | All execution flows |
| `gitnexus://repo/nofy-build/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
