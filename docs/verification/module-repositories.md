# 模块仓库实施与验收

日期：2026-11-05。源码基线 `2d455df24f10ac4acd4440e1aee740f3b611c890` 上的工作区实现，未提交或推送。接口契约 `0.4`，79 项操作、77 个入站 MCP 工具，源码 HTTP 索引 119 个方法/路径。实现范围为模块来源、不可变源码包、声明引用、Host/CLI/MCP、共享文件工具包与离线导出；统一 Loader、运行循环和 Session 状态格式沿用既有路径。

## 集中自动检查

| 检查 | 实际结果 |
|---|---|
| 工作区 all-features / all-targets 编译 | 通过；Cargo.lock 仅追加当前包对已有 jsonschema/tar/flate2 的依赖边 |
| 源码工程与模块仓库 | 12 项通过，覆盖内容版本、参数隔离、跨包端口、字面数据、版本冲突、快照原子性、持久重开、撤销注册、离线归档及路径边界 |
| 共用客户端协议 | 5 项通过 |
| CLI 与官方 rmcp stdio / HTTP 客户端 | 5 项通过；仓库补验覆盖 managed/source 两类目标、CLI 参数指针、共享缓存、目录/Git 同步、旧 CAS 拒绝、移除后引用及不回写原工程的归档 |
| Host 库 | 86 项通过 |
| Host HTTP 发布/权限/执行主路径 | 1 项通过 |
| SessionPolicy HTTP | 3 项通过 |
| coding Python | 53 项通过 |
| Cargo 依赖边界与格式 | 通过；工作区仍为 22 个 Rust 包 |
| 两份操作目录/Schema 与 git diff 空白检查 | 字节一致，检查通过 |

首轮 CLI 运行有 3 项失败：本地 pack 原有快捷分支绕过操作引擎，而新增输出逻辑期望服务端归档；另一个新用例误用只识别 Agent 声明的目录 Loader 读取 module.json 包。修复为本地打包前收齐精确缓存源码，继续使用本地归档路径，并纠正模块目录用例。受影响 CLI 用例集中补跑通过。首轮编译的两个 unused 警告也已移除。

关键命令：

```sh
cargo check --workspace --all-features --all-targets --locked
cargo test --locked -p nofy-agent-project -p nofy-agent-client -p nofy-agent-mcp -p nofy-cli
cargo test --locked -p nofy-cli --test development
cargo test --locked -p nofy-agent-host --lib
cargo test --locked -p nofy-agent-host --test http real_api_enforces_scopes_and_pure_preview_then_runs_edited_releases_in_one_process -- --exact
cargo test --locked -p nofy-agent-host --test http session_policy::
python3 -m unittest discover -s presets/coding/tests -p 'test_*.py'
python3 scripts/verify-framework-boundaries.py
cargo fmt --all --check
```

首个综合测试命令的源码/客户端部分通过，CLI 首轮失败后的实际补验命令单独记录，不能把失败命令整体写成一次通过。最终新增的本地引用归档案例使用 `cargo test --locked -p nofy-cli --test development repositories::` 补验。

## 变更范围审查

阶段开始已对共享 router、project_operation 和源码构建入口分析影响，其中共享 Host 入口为 CRITICAL、46 个直接调用方；范围锁定在仓库存储、源码解析与开发面。结束运行 GitNexus detect_changes，最终提示 CRITICAL、32 条受影响流程。该工具会把文件父节点和同名 Markdown 粗粒度归入结果，不能把其符号数量视作精确变更清单。实际源码 SHA 与 git 路径核对为 39 个已有文件、17 个新增文件、0 删除、0 范围外修改；没有修改运行循环或 Session 格式，没有新增前端。新增文件另行纳入清单。

## 实际 MCP、模型与文件效果

使用新二进制在独立状态目录和随机监听端口启动 Host；私有令牌和模型凭据独立注入。标准 MCP 初始化协商 `2025-11-25`，tools/list 实际返回 77 项。通过 describe/schema、repository.add、module.publish、agent.create/module.use/module.add/build/apply、run.start/inspect/events、module.export/publish 和 agent.export 完成操作。

两个 Agent `repo-one`、`repo-two` 引用同一个 `workspace-files@0.1.0` 包，提供不同 workspace；各自工程只保存 pin、参数与接线。第一个阶段共享缓存实际只有 1 份包源码。每个 Agent 使用真实模型调用 read_file 读随机文本，再调用 write_file 写到独立 output.txt；分别观察 3 次 model_completed、2 次成功 tool_completed，共 6 次模型完成、4 次工具完成，文件逐字节相等且各 workspace 内容不同。

请求模型保持 `gemini-3.8-flash-high`；事件中的网关回报为 `gemini-3.8-flash-n`，继续保存差异，不声称已经确认其别名关系。模型与工具完成事件、release、包摘要和效果摘要见[机器记录](module-repositories.json)。

两份 Agent 导出的 Source 都包含精确 `.nofy-module-packages/<digest>.json`，断开内核地址后 offline 构建的 deployment_json 与在线结果完全一致。发布 `0.1.1` 后，两个原工程 revision、旧 pin 和已激活 release 保持不变。只重启隔离 Host 后重新 build 两个工程并查询原运行，均能恢复，运行仍为 completed。

真实探针的早期失败如实保留：首次观察器未处理 queued 状态下 execution 为 null；修正后的一轮模型调用得到 transport 错误，根因未确认。后续单独的模型请求成功，新隔离轮次通过私有凭据注入完成上述验收；不能据此断言凭据注入修复了 transport。

私有日志位于 `/home/none/.local/state/nofy-build/module-repositories-20261105-023643/`，成功探针为其 `live-3/`。仓库内记录不包含访问令牌、模型密钥或运行状态文件。

## 边界

本次没有升级或重启原常驻 7331 实例，没有恢复前端或继续 GitHub 发布。pi 完整复刻和全模块交叉矩阵仍不属于本次完成范围。包只交付源码和普通依赖清单，Python/GCC/库由用户安装；不新增自动安装、业务语言语法检查或包体配额。来源移除保留不可变包供已有引用恢复，当前没有自动垃圾回收。
