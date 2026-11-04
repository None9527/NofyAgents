# 源码方法隔离验收

2026-11-03，证据根`/tmp/nofy-code-isolation.mx1iit`。C8b最终565源、16保护/二进制及7文档在阶段开始时全部匹配。归档`before.tar.gz`保留准确施工范围；不删除旧树、不引入旧宿主兼容、依赖安装器或包体配额。

## 施工边界

GitNexus工厂upstream LOW/0、Dispatch LOW/6、关闭入口HIGH/4；准确context和源码补足共用evaluation监督器的Prompt/Scope调用及API路由图谱缺项。HIGH已在编码前报告，按显式Executor → Loader/共用监督器 → 物理及行为验收控制范围。接口/拓扑/选型见`docs/architecture/code-program-isolation.md`。

保留tool.rhai的pure-json-v1声明及原source/input/contract/max_operations。默认Host通过Loader绑定Executor，裸native不选trusted；独立SDK明确选择。构建不做常量折叠，实际计算才执行。新32MiB内部JSON封套不是源码包配额，不在argv/env传源码、输入或凭据；ToolError完整保留。两个一次性物理helper仅求值时占许可，实际拥有者等待准备/kill+wait；原512MiB地址空间/系统调用/文件限制、代码16MiB栈，1..600000ms工具期限包含排队。CPU为ceil(timeout_ms/1000)+1、最高601秒；Prompt/Scope仍2秒CPU/5秒IO，模型沿C8b池。

## 当前运行证据

| 检查 | 结果 | 日志 |
|---|---|---|
| 执行器完整rhai特性 | 1单元+6源码+10外部执行=17通过，0失败/忽略，外部执行12.11秒 | `executors-tests.log` |
| 初次Host全入口构建 | 新测试Authorizer::new误传数组而非Vec，编译失败；生产代码已编译 | `host-no-run.log` |
| 首轮Host源码专项 | 4通过/4失败；物理观察等待到期，工具/Hook普通行为通过 | `code-tests.log` |
| 精确失败诊断 | 忙循环先返回typed script_error：字符串乘法不是本VM已注册函数 | `code-observation-diagnostic.log` |
| 修正实际忙循环后的Host源码专项 | 8入口全部通过，21.94秒；包含1个条件父死子入口，不是8次独立物理实验 | `code-tests-fixed.log` |
| 修正源码SDK夹具后的补验 | 源码6通过，0.16秒；生产源不变，其余11项复用本阶段原完整执行的范围证据 | `code-sdk-fixed.log` |
| 严格Host/Executors文档 | 无依赖rustdoc、rhai启用、警告视为错误，通过12.51秒 | `rustdoc.log` |
| 最终Host全入口构建 | 通过6.56秒；含补强裸native不默认注册Rhai的最终断言 | `host-frozen-no-run.log` |
| 实际Cargo依赖边界 | Host普通内部16、含build/dev17，Modules/Models各6；无新依赖或旧产品闭包 | `dependency-boundaries.log` |
| 最终冻结源码的完整默认Host | 72单元+5凭据+134HTTP+11进程树=222通过，0失败/忽略；单元4.24秒、HTTP762.86秒、进程树233.37秒 | `host-full.log`，原session16396终结exit0 |

首轮忙循环用了不支持的字符串乘法，worker确实启动并快速返回类型化错误，并非进程探测器已证明有错。只把长字符串改为JSON输入，原VM/操作/内存/期限均不变；诊断保留在终态与进程观察之间的选择断言，防止以后再将提前失败误写为观察超时。同步修正原SDK取消测试的同类弱夹具，使其真正执行算术循环；纯构建负例改用真实的常量除零，避免用不支持的运算假装资源压力。没有根据重跑通过声称原首轮从未失败。

物理专项覆盖原complete/结构化错误/输出限制、缺helper不回退、绑定前后portable identity不变、Read与Execute-only的403差分、空环境/NoNewPrivs/Seccomp/CapEff、实际512MiB地址空间/16MiB栈/601秒CPU声明；两个SIGSTOP子进程占满许可时排队超时及预取消不启动新进程，调用者Drop和显式取消在PIDFD确认死亡后归还许可，关闭等待实际子进程。6.5秒期限实测超过5秒仍运行，最终timeout时worker已退出；真实SIGKILL只终结worker，Host模块查询与下一次求值可用且失败不重发。拥有者先完成一次helper往返，再停止活跃worker并SIGKILL拥有者，任何恢复前PIDFD确认worker退出。信号均用pidfd_send_signal，不按复用PID或进程名发送。

## 范围、冻结与未完成项

本阶段原565份源码中12份Rust/测试及Host/Executors两份说明改变，其余551份不变；新增execution.rs、Host loader/code.rs及物理测试3份Rust，形成568源清单。16份保护/实际二进制中7份构建产物预期变化，其余9项相同；根Cargo/lock/工具链/AGENTS及打包/外部预设源码未改，无源码删除。最终完整Host结束后568源、16保护/二进制及9文档的frozen摘要仍全部匹配；之后只更新两份文件说明与控制文档，执行源码/实际二进制不变，另存final清单而不覆盖原冻结。所有测试/验收句柄已终结，无本阶段遗留Host或测试进程。

GitNexus detect(all)为310文件/3412符号/13流程/HIGH，是原累计脏树（上一阶段307/3384/13），不是本轮310个文件改动。13流程仍有旧UI/宿主和既知同名误连，不为它们扩大施工；新未跟踪实现由准确文件、阶段前归档、前后摘要与实际测试补证。未收到索引stale警告，不重索引，不commit/push。

只读Cargo tree与源码还确认：normal闭包中的nofy-workflow保留SDK脚本编排；Runtime workflow::run仅由composition/nested_control两个SDK测试文件调用，默认Host的WorkflowDocument与ProgramDefinition无script字段、走Rust DAG。它不是本次tool.rhai入口，不将其标成已隔离，也不把留在SDK视为最终产品装载完成；后续须按统一声明与干净源码要求归属/收敛，不靠删除已要求能力来缩小目标。

这里没有主动耗尽工具VM的512MiB、触发601秒CPU硬界，或注入未知wait/kill内核错误；不得将读取到的限制值等同全部故障已覆盖。没有新外部提供方请求、真实模型推理、全运行中状态迁移、物理旧树清理、新控制台或多预设发布验收。文档/定向格式/diff、真实Cargo边界及完整Host均通过；整体目标active，源码包/用户自备依赖边界不变。
