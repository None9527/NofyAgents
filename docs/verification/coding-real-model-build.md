# 编程基线真实模型构建验收（M3d2）

2026-11-03（Asia/Shanghai）通过的是当前编程预设的真实模型字节码编译/测试闭环，不是任意工具链、全部编程项目或最终平台完成声明。执行前后核对M3d1冻结清单：Rust、Python、Rhai、JSON声明和实际发行二进制均未更改或重编译；本阶段之后仅更新验收/状态文档，不把文档摘要变化冒充运行源码变化。

## 执行边界

使用标准`nofy-agent-host` CLI、标准注册表、原`nofy.deployment/v1`及`presets/coding/preset.json`的唯一`chat`程序，没有添加诊断Tool根、独立Agent主循环或业务Rust分支。通过报告目录为`/tmp/nofy-m3d2-live.rNnOrD`；临时目录不是可永久依赖的产品状态，以下记录保留关键结论、摘要及复核入口。

执行在独立临时项目及本次拥有的`nofy-m3d2-live-69c4ea3f14bf.service`委托中；仅把该服务子进程放入其`kernel`叶组，命令使用独立`jobs`子树，未迁动原`session-c7.scope`。限额为32进程、512MiB内存、100% CPU；不授予网络、后台作业或PTY。退出后服务为inactive/dead、Result=success，未留下进程树持久任务记录。

受信任测试准备器只选取本次文件模块、命令模块、unittest及compileall所需的已安装模块/ELF依赖；生产打包器仍不发现宿主依赖。原生映像为123文件、32958503解码字节、11537484 wire字节；不含完整标准库、GCC或此前原生探针。这是实际验收工作负载的依赖闭包，不是任意Python项目的完整环境，也不宣称理论最小。

请求名保持用户指定的`gemini-3.8-flash-high`，九份成功响应元数据均为`gemini-3.8-flash-n`；未知别名映射继续保留，不自行替换请求名。256k上下文及真实上游身份均未验证。凭据经私有终端输入、内存及管道交给本次服务，再通过内核环境凭据引用注入；不放入命令参数、systemd服务环境配置、系统声明或仓库文件。最后一次重开未注入模型凭据，state中不存在`credentials.json`，也未使用`RUST_MIN_STACK`覆盖。

## 行为与直接证据

| 验收项 | 实际观察 |
|---|---|
| 模型读取 | 在首条命令前依次读取AGENTS.md、calc.py、test_calc.py |
| 原始失败 | `run_command`实际执行`/bin/python -S -s -B -m unittest -v`；退出1，六项测试全部失败，应用结果`ok=false`、效果`unknown` |
| 精确修复 | `edit_file`使用实际读取摘要`9c3589d3a381265f4395fe846ce0d767a68ef3471b64e13e15cee2d747b2b0e8`，一次精确替换，去掉求和后的错误减一 |
| 编译 | 在相同项目执行`/bin/python -S -s -B -m compileall -q calc.py`；退出0，产生真实`__pycache__/calc.cpython-314.pyc` |
| 修复后测试 | 相同unittest argv退出0、六项全部通过；空序列、正数、负数、大整数数值抵消、生成器和输入不变都有实际断言 |
| 回读 | 模型最后读取实际calc.py，摘要为`3251dbf18617cd67c47707cb9bd1611dbac212ff0ee9814a75b8ce1f34b85aad`；Host侧只解析AST，不执行生成的项目源码 |
| 审批 | 失败测试、编辑、编译、成功测试共四次原持久审批；每次先提交篡改的argv或文件路径，均409，然后批准完整原请求204 |
| 审批前无效果 | 首条命令批准前，完整临时项目文件摘要/inode/大小与原始状态相同 |
| 三次重启 | 首次命令前、失败测试后编辑前、全部完成后无凭据重开；完整运行记录JSON、预算及文件效果均相同 |
| 成功不重复 | 重放相同成功运行请求，完整记录、预算和文件效果相同；测试进程账本仍恰好两行 |
| 流与重连 | 110条真实持久事件含52条model_delta、9条model_usage及8条工具完成事件；完整SSE逐条相同，首轮读取前缀后关闭，再跨内核重启以Last-Event-ID续读，无丢失或重复 |

两次unittest进程各只执行一次，`test-runs.log`恰好两行`actual-test-process`。原AGENTS.md、test_calc.py和sentinel.txt的内容、inode及大小不变；编译和测试明确产生pyc及账本，不能说除源码外没有任何文件效果。`test_cancellation`是大整数正负数值抵消，不是本阶段新增的Agent取消验收；物理取消的证据仍来自M3d1，不混用测试名称。

运行事件首尾相差115233ms，含审批及两次中途重启，不是单纯模型推理延迟。成功运行9份已完成模型响应，确认输入35968、输出1823 token；账本9次模型调用、8次工具调用、零子Agent，与轨迹对应。

## 保留的失败与用量边界

首轮独立运行位于`/tmp/nofy-m3d2-live.niqB55`，真实CLI最终记录`model_protocol/transport`失败并正常关闭；首份模型响应成功读取AGENTS.md，第二次调用未取得成功响应，没有命令审批或项目写入。仅在原运行已确定失败、服务退出及项目无写入后，才另建目录/服务进行第二轮，不因观察超时重启原任务，也不覆盖原失败记录。

首轮账本计2次调用尝试，其中仅1份完成响应，已确认输入2442/输出184 token；失败操作的2048输出明确标为`reserved_upper_bound`，不能当作实际生成或账单用量。两轮合计11次调用尝试、10份完成响应，确认输入38410/输出2007，另保留失败的2048输出预算占额。传输错误的具体根因未确认，第二轮通过不构成该根因已经修复的证据。

## 证据文件摘要

以下均为SHA-256；完整JSON只在私有验收目录留存，不把巨大的运行快照复制进产品源码树。

| 文件 | 摘要 |
|---|---|
| 成功目录/result.json | `94bca14d62fef5fa6cc0186f5ba2f7d65e6a5c4a28c19a184bb03ea253d83580` |
| 成功目录/completed-record.json | `c3eae47a946b27661c584db09cbc7376eb988c88be30d32241b43424a664e381` |
| 成功目录/events.json | `ee8f9b1899c05fd6bf2f31dfcf33e114c96b7b3634d6e3da8e3d919b77d21363` |
| 成功目录/tool-trace.json | `8514a2430a0362f59b0b6ee3200aa1337fb69049cc9b18d7923b89107208bb98` |
| 成功目录/live_probe.py | `1bd9cb4368c5138dd0137299c13c1fd6a6d4eb1c4d747f0ae2bcc44a7f7b55db` |
| 成功目录/python-image.json | `2ffd92aaed15b161a7ee3ee4e8fe5106676c1d46d41159d66dd029fe18e618e4` |
| 失败目录/result.json | `fe4c444ab8bbde0df39ba1031be26f2cad0acf69a38a4c7000079740ee0f3aba` |

关键复核入口：读取`result.json`的passed、approvals、reopens、command_results及model_accounting；对照tool-trace与events，而非只信最终模型文字。私有state/runtime.sqlite中的预算操作回执区分completed和reserved_upper_bound；不得仅累加预算used便把失败上界报成已确认token。临时服务/工作目录由验收方显式创建，凭据独立注入；运行期间不使用Cargo或改动预设模板。

本阶段未改运行源码，复用M3d1同一冻结二进制的195项完整回归；未无证据地重复跑同组测试。后续仍须验收按需原生工具链/GCC、PTY/后台/网络能力配置、完整运行中状态转换、C8执行隔离、物理旧源码清理、新控制台及参考版本化多预设，整体目标保持开放。
