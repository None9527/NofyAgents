# Session fork、rewind 与 tree

`nofy session fork` / `nofy_session_fork` 从原会话的已关闭 Agent turn 创建新会话及第一轮；`nofy session rewind` / `nofy_session_rewind` 在指定消息数 `through_message` 处创建分支。旧历史、文件改动和外部效果保留，原账本不退款。通过 `session.tree` 查询父子关系，再选择需要继续的会话。

先读取 `session.inspect` 的 session_revision 和 `run.inspect` 的 live_revision。新根请求必须使用来源 turn 实际冻结的 release、program、system，提供全新 run_id/thread_id；不能用当前 active release 猜测旧会话配置。目标 session_id 首次创建使用 expected_session_revision:null。fork 沿用来源会话当前 SessionPolicy 进行普通 create 决策，并以目标 root 建立独立预算；模型子任务使用父预算协作接口。

```json
{
  "session_id":"coder-branch",
  "command_id":"fork-command-1",
  "expected_session_revision":null,
  "source_session_id":"coder-main",
  "expected_source_session_revision":"0",
  "source_run_id":"turn-1",
  "expected_source_revision":"0",
  "request_json":"{\"run_id\":\"branch-turn-1\",\"thread_id\":\"branch-thread\",\"system\":\"coder\",\"release\":\"<来源精确摘要>\",\"program\":\"coder\",\"input\":{\"text\":\"沿另一方案继续\",\"attachments\":[]}}"
}
```

rewind 输入在上述基础上增加 `through_message`，表示保留前 N 条消息（包括 system 消息）。内核拒绝越界或在未匹配 tool call/result 之间截断。来源必须已关闭且无待决效果；任意运行中的部分状态不能伪装成已完成历史。创建后普通 worker 运行新输入，不重复执行复制历史中的工具。

provider-native 的 Opaque 消息原样保留。Rust 不解析其内部工具格式；包含 Opaque 的 rewind 前缀必须结束于完整用户轮次边界（下一条是 user/user_parts），或保留整个已关闭历史。尚未包含 Opaque 的普通前缀继续按 canonical 工具配对检查。原冻结模型的纯历史校验在数据库事务外执行，不发模型请求、不消费采样预算。

命令先冻结来源执行摘要及历史，再保存策略决策；最终在一个事务内比较来源 revision、验证目标 thread 未使用，提交新 root、会话、history checkpoint 和 lineage。相同 command_id 查询原回执；不同内容复用 ID 冲突。失败后的 prepared/rejected 回执保留。断线后查询 `session.command`，不要另建 ID 重复 fork。

`session.tree` 返回 root_session_id、selected_session_id 以及扁平 branches 数组，每项包含父会话、来源 turn/live 版本、保留消息数、seed_digest 和新 root。lineage、输入证明、历史及预算随 runtime store 持久化和迁移；Host 重启后保留原身份。接口返回树关系，调用方显式选择当前会话。
