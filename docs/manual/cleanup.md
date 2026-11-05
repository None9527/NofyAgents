# 源码与模块清理

`project.delete` 使用 project_id 和最新 expected_revision 删除 managed project。私有墓碑保存原源码与修订号；同名重建继续递增，旧写请求无法作用于新项目。已发布 release、运行记录、用户工作区和解释器独立存在。

`agent.delete` 使用普通 WriteTarget 和 agent 删除一个声明；entry 可指定新的入口程序，省略时选剩余入口。模块保留供其他声明使用。最后一个 Agent 删除后可继续编辑该不完整工程。

`agent.module.set` 与 `agent.configure` 接受 unset JSON Pointer 数组。set 中 null 是置值，unset 才是移除。数组移除后按正常 JSON 数组规则移动索引；不存在的键会明确报错。模块移除表达式在引用解析后执行，保留源声明中的参数和依赖。

`module.yank` 使用 repository/name/version 和仓库 expected_revision；默认 yanked:true，恢复用 false。撤下禁止新选择，旧 digest pin 和离线源码仍有效。不可变版本不能通过重新发布换源码。`module.gc` 默认只预览；dry_run:false 回收中断发布留下的无目录引用源码 blob。已发布版本即使撤下也保留源码，以免破坏外部声明中的精确引用。
