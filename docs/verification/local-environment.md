# 用户自备环境执行验收（M3d4）

2026-11-03。默认源码打包不安装/检查外部依赖、不要求锁文件，也不携带Python/GCC。此阶段打通用户已安装环境的实际运行路径，未新增Agent主循环或语言安装器。

## 实现边界

`resource.process_local`只声明程序、prefix_args、env和paths，依赖路径只读，execute独立控制。纯build/validate无依赖文件探测，import、publication和新job检查路径是否可用；已有checkpoint、历史与成功效果不因依赖暂缺而失败。子运行的环境声明必须是父级精确配置的子集，不能绕过新授权接纳。

两类环境共用现有ProcessArtifact/TreeArtifact、原Loader、管理API、审批、预算与取消拥有者；本地环境不生成依赖映像，不进入映像缓存或GC。用户安装变化不自动生成generation，回滚配置不声称回滚外部安装内容。默认源码tar.gz仍须解包后以settings生成同一原生Deployment，不是另一套内核运行格式。

中立InstalledProgram追加保留调用路径的方法，旧load不变；不把venv符号链接规范化为基解释器入口。内部程序调用前字节检查保留，但用户无需提供任何依赖摘要；本地模式每次准备重新读取用户提供的程序。

## 已通过的真实专项

最终专项 `/tmp/nofy-local-runtime.1eKTRv/local-execution-6.log` 通过，98.26秒。一份独立systemd委托服务实际执行，委托子入口不是第二次物理实验；没有迁动原开发会话cgroup。源码仍只有一个chat Agent，测试另外声明Tool程序以验证具体能力，不用这些诊断入口冒充真实模型闭环。

| 范围 | 实际证据 |
|---|---|
| 源码与用户依赖分离 | build.py仅用settings生成v2，runtime_sources为空、无runtime_images；目标映像objects/trees均为空 |
| 自备模块 | 读取用户提供的user_math.py，单进程执行结果32，fork实际被拒绝；原预设read_file读取真实项目源码 |
| 正常venv | 测试用标准venv --without-pip准备真实环境，在site-packages放入模块；未设置PYTHONPATH，单进程及整树均实际导入，sys.prefix均为该venv |
| GCC | 经精确审批后，Guest内运行/usr/bin/gcc，实际链接libm并生成项目二进制；再经原命令工具执行，stdout为sum=32 sqrt=3.000及换行。不是宿主编译探针的结果 |
| 用户独立更新 | 用户模块从sum改为sum+1，未重编译Host、未重锁或发布新系统；相同release的新调用得到33 |
| 权限 | 依赖写入被拒绝、文件mode可执行但execute=false仍拒绝、内核私有文件不可读；宿主文件原字节保持 |
| 审批 | 命令先暂停；每次审批伪造argv均409，原完整请求才能批准。未关闭floor或改内核拒绝规则 |
| 取消 | 普通API取消double-fork/setsid后代，实际pidfd全部死亡、cgroup为空且管理器名额归还 |
| 缺依赖恢复 | 暂时移走用户模块环境，新job明确拒绝；既有11份完整记录仍可读取。真实发行CLI无RUST_MIN_STACK重开且依赖仍缺失时，记录逐项完全一致 |
| 成功效果 | 重开后重放同一成功请求，effect-count仍为1，不重新执行 |

结果保存在 `execution-6/local-passed.json`；实际SQLite、项目/二进制、venv与依赖目录均保留在证据根。11份最终记录另导出为 `local-final-records.json`。

## 构建、契约与回归

- Python预设53项通过，2.288秒；本地环境单元6项通过，0.13秒，含纯构建、未装依赖、路径/私有别名/FIFO、用户更新无锁、继承及成功回执边界。
- Executors启用rhai的完整15项通过：新增程序别名验证1项、Rhai4项、HTTP/进程10项；旧load/字节拒绝与原进程取消行为不变。
- Host与Executors严格Rustdoc通过；构建11.52秒、定向格式、git diff --check及真实Cargo依赖边界通过。Host普通内部16、含build/dev17，无新增依赖。
- Host最终按未变范围分组覆盖206项：72单元、5凭据、118HTTP及11进程树，无忽略。首轮完整命令的前三组全部通过（HTTP730.68秒），进程树10过1失败（224.59秒）；仅修正新增测试探针后，完整并发进程树组11项通过225.56秒，不声称一次全量无失败。
- 全量前冻结555份源码/声明及16份保护配置/实际二进制。并发失败修正后，原冻结仅1份测试源码及其1份测试二进制变化，生产Rust、预设及其余保护文件不变；最终source-fixed.sha256和artifacts-fixed.sha256全部核对通过。测试存活期间无源码修改、重编译或重索引，无遗留验收服务/CLI进程。
- 最终源码包26文件、203396源码字节、49244归档字节，解包逐字节一致，再次打包完整字节相同；解包后禁用site的53项测试通过2.383秒。归档SHA256为8496e64e4f5d96f6a8012802610088c4345b86408c43bd182bb7dacb25ab9c2c，证据为coding-source.tar.gz、source-archive-verification.json及unpacked-python.log。

## 保留的失败与修正

初始构建的Landlock位标志类型及旧预检调用点错误记于host-build.log，已按实际类型修正，没有放宽边界。首次实际测试使用了空registry而缺binding.cwd，改为原native registry；第二次新增探针漏配工具floor，被原规则拦截。测试仅对新增工具补精确白名单及内容版本/引用，不关闭策略。

execution-3/4实际单进程与文件读取通过，但整树普通绑定/usr返回EINVAL。独立可丢弃user/mount namespace诊断复现普通bind失败、递归bind及递归属性设置成功，实际/proc/self/mountinfo显示/usr下的WSL子挂载。仅本地依赖目录改为递归绑定并递归添加只读/nosuid/nodev/noexec，不清除既有属性；原映像/工作区绑定及两个seccomp过滤器未放宽。映射普通文件还补建私有Guest父目录，错误明确标出配置中的依赖路径。

execution-5无venv专项先通过91.43秒、恢复9份记录。随后真实解释器诊断证明原canonicalize会把venv入口切换到/usr基解释器；追加通用保留路径入口，并以真实venv两条路径验收，最终扩展专项恢复11份。所有前段日志与状态保留，没有把失败改写成成功或降低断言。

首次完整Host并发回归又暴露测试探针未读取JSON stdin：local-venv-single的工具输出为failed to write process input，根状态completed不代表工具成功。结合ProcessToolFactory实际write_all与探针快速退出，按输入管道竞态修正；原执行器没有保留errno，不声称原日志捕获了具体EPIPE码。仅让两份探针显式读取并断言完整JSON输入为{}，收紧恢复记录数量为精确11，精简失败输出；未改生产IO逻辑、放宽超时/权限或隐藏错误。完整并发树组随后全部通过，最终物理实验保存在execution-final，原失败日志host-full.log及提取的full-failure-summary.json保留。

## 范围控制与未完成项

GitNexus集中upstream覆盖RuntimeSource、TreeArtifactFactory、Sandbox、LoaderAdmission、compile_preset，补充InstalledProgram；Rust缺边及LOW/0由实际调用与源码补证，涉及执行边界按HIGH分段。使用重构技能共用同一启动协议，不建立第二套运行/旧产品兼容工厂。回退快照为before.tar.gz及executor-before.tar.gz，仅包含明确目标，不清空原脏树。

最终detect_changes(all)仍为299文件/3270符号/13流程/HIGH，与本阶段前累计脏树相同；不把它视为新入口完整覆盖。stage-delta.json另核对目标既有文件与3份新增Host源码，删除项为空；另有中立Executors程序装载入口及说明变更，没有Cargo依赖或旧UI/宿主回流。未出现stale告警，不在无必要时重复索引。

本轮无新真实模型请求；不将Tool专项当成真实模型Agent端到端验收，不声称任意大型项目、PTY、后台作业或完整运行中状态转换已完成。用户依赖仍由用户准备。C8进程隔离、干净源码树、新控制台与多套版本化行为预设继续开放，整体目标保持active，未commit/push。
