# Unified Nofy Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将上游 Memory v2 的可靠性机制与 Nofy 已有能力合并为唯一的 `nofy-memory` 记忆系统，让用户只需理解“关于我、当前项目”以及记住、纠正、忘记、解释四个动作；知识库本期只预留稳定 provider 接口，不实现数据源、索引或界面。

**Architecture:** `nofy-memory` 同时承担规范数据、状态机、检索派生层和访问策略；Shell、工具、Pager、Dream/Consolidation、自动捕获与显式写入全部只调用一个 `MemoryService`。规范数据由不可变 Observation、可修订 Topic、Tombstone 和操作账本组成，FTS/向量索引与 `MEMORY.md` 清单都只是可重建派生物。迁移采用 staging + 原子目录切换，运行期不做双写、双读或版本选择。

**Tech Stack:** Rust、Tokio、SQLite/rusqlite、FTS5、现有 embedding provider、serde、sha2、tempfile、age、keyring、现有 Nofy telemetry 与 Pager 协议。

---

## 1. 不可妥协的终态

最终代码和运行时必须同时满足以下约束：

- 只有一个生产 crate：`crates/codegen/nofy-memory`。
- 只有一个根目录：`~/.nofy/memory/`；项目 scope 由稳定 `ProjectId` 分区，不以临时 worktree 路径创建另一套 runtime root。
- 只有一个服务入口：`MemoryService`；不再保留独立的 `MemoryBackend`、`MemoryWriter`、legacy storage 或 v2 adapter。
- 不提供 `Legacy/V2` 模式、feature flag、回退读路径、双写或永久兼容层。
- `Off/RecordOnly/Shadow/Active` 只控制同一系统内的自动捕获与整理行为，不选择不同记忆实现。
- 关于我、当前工作区是同一模型的两个写入 scope，不是两套引擎；取消含义重叠的 Global scope。
- 知识库不是本期记忆 scope；只在 `nofy-tools` 预留独立只读 `KnowledgeBaseProvider` 接口，默认未连接，记忆系统不保存或索引其数据。
- Observation、Topic、Tombstone、Operation Ledger 是规范事实；FTS、向量、manifest 都可删除重建。
- 一次性迁移成功后，旧目录转换为短期加密灾备包，运行时永不读取；到期或首次显式 forget 时销毁灾备包及密钥。
- `nofy-memorycore` 中值得保留的策略迁入 `nofy-memory`，随后整个 crate 从 workspace 删除。

### 用户体验契约

用户本期只接触一个“记忆”功能和两个区域：

```text
记忆
├── 关于我        跨项目的稳定偏好与个人事实
└── 当前项目      只在当前项目生效的决策与事实
```

用户只需掌握四个动作：

1. **记住**：“记住我默认使用 Rust”立即生效，并返回“已记住到关于我”和可撤销入口。
2. **纠正**：“其实我现在住在上海”创建最高优先级纠正，旧事实下一轮不再被召回。
3. **忘记**：“忘掉我的公司名称”下一轮前从 snapshot、搜索、索引、规范文件和可恢复灾备中移除。
4. **解释**：“你为什么知道？”返回事实、来源对话、作用范围、记忆时间和可执行的纠正/忘记入口。

以下是产品级行为，而不是 UI 建议：

- 显式 remember/revise/forget 必须在下一次模型推理前完成当前 session snapshot 的定向失效与重建。
- 自动 capture/consolidation 始终后台运行，不延迟答案展示，不逐轮弹通知。
- 用户界面只暴露“记忆总开关”“自动学习开关”“允许范围”“敏感类别排除”；`RecordOnly/Shadow/Active` 仅供内部发布控制。
- 记忆关闭时不注入、不自动学习；显式调用记忆工具时先提示用户开启。自动学习关闭时，显式记忆仍可用。
- 项目记忆永不跨 `ProjectId` 注入；本期不存在知识库注册、扫描、索引、注入或 UI 入口。
- hash、revision、operation ID 只出现在技术详情，不作为主要反馈。

### 数据关系

```text
top-level turn / explicit memory tool / legacy import
                         │
                         ▼
               immutable Observation
                         │ evidence
                         ▼
                 mutable Topic ──────► generated MEMORY.md
                         │
                         ├────────────► FTS5 + vector index
                         │
explicit forget ──► Tombstone ───────► file/index/manifest convergence

explicit correction ──► supersedes old facts before next inference

All transitions ──► durable Operation Ledger + hash + lease generation
```

### 统一 scope

```rust
pub enum MemoryScope {
    Personal,
    Project(ProjectId),
}

```

知识库接口与记忆领域模型隔离，放在 `crates/codegen/nofy-tools/src/types/knowledge_base.rs`：

```rust
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[async_trait]
pub trait KnowledgeBaseProvider: Send + Sync {
    async fn search(&self, request: KnowledgeQuery) -> KnowledgeBaseResult<Vec<KnowledgeHit>>;
    async fn get(&self, id: KnowledgeDocumentId) -> KnowledgeBaseResult<KnowledgeDocument>;
}

#[derive(Clone, Debug, Eq, Hash, PartialEq, Deserialize, Serialize)]
pub struct KnowledgeDocumentId(pub String);

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct KnowledgeContentHash(pub [u8; 32]);

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct KnowledgeQuery {
    pub query: String,
    pub limit: usize,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct KnowledgeHit {
    pub id: KnowledgeDocumentId,
    pub title: String,
    pub snippet: String,
    pub source_uri: String,
    pub score: f32,
    pub content_hash: KnowledgeContentHash,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct KnowledgeDocument {
    pub id: KnowledgeDocumentId,
    pub title: String,
    pub body: String,
    pub source_uri: String,
    pub content_hash: KnowledgeContentHash,
}

#[derive(Debug, thiserror::Error)]
pub enum KnowledgeBaseError {
    #[error("knowledge base is unavailable")]
    Unavailable,
    #[error("knowledge document was not found")]
    NotFound,
    #[error("invalid knowledge query: {0}")]
    InvalidRequest(String),
    #[error("knowledge provider failed: {0}")]
    Provider(String),
}

pub type KnowledgeBaseResult<T> = Result<T, KnowledgeBaseError>;
```

本期只保证该接口可编译、可由 fake provider 做契约测试；`MemoryService`、Shell、agent builder 和 Pager 都不持有 provider，也不提供默认实现。未来知识库项目通过 composition root 接入，不能把知识文档写成 Observation 或 Topic。

### 主助手、子代理与项目边界

- 主助手不是一个存储 scope，而是唯一的记忆协调者：它可以读取 Personal + 当前 Project，并负责所有显式写入与顶层自动捕获。
- 子代理不持有 `MemoryService`，不能 search/list/remember/revise/forget/capture/consolidate；只接收主助手为当前任务筛选的只读 snapshot 片段。
- 子代理输出本身不形成记忆；只有主助手验收并纳入成功的顶层 turn 后，相关事实才可能进入 capture job。
- 同一 Git repository 的主 checkout 与所有 worktree 共享 `ProjectId`；branch/worktree 特有事实必须带 commit/ref provenance 和 `BranchLocal` 有效域。
- `ProjectId` 首次由规范 remote identity + root commit fingerprint 匹配并生成稳定 UUID，同时登记 git common-dir alias；remote 缺失时使用 git common-dir registry。非 Git 项目使用规范路径 registry 生成 UUID。
- 删除 worktree、切换分支或 fork Codex 任务不删除项目记忆；注入时只选择 `ProjectWide` 或与当前 commit/ref 匹配的 `BranchLocal` 事实。
- 冲突优先级固定为：当前用户明确指令 > 当前项目中的用户纠正/明确规则 > Personal 稳定偏好 > 自动捕获的项目事实。

## 2. 实施纪律与风险门禁

GitNexus 静态图对当前关键符号给出的结果是：`MemoryBackendImpl::search` 为 MEDIUM，`ShellMemoryWriter::apply_batch`、`run_memory_flush` 和 `MemoryConfig::resolve` 为 LOW；但仓库文本检索发现 181 处相关 Rust 引用，而且大量依赖通过 trait、异步任务和结构体构造发生。实际切换风险按 **HIGH** 管理。

每个任务都遵守以下顺序：

1. 编辑任何函数、结构体、trait 或方法前，对准确 symbol 运行 `gitnexus_impact(..., direction: upstream)`。
2. 若结果为 HIGH 或 CRITICAL，先向用户报告调用者、执行流和不可逆风险，再继续该任务。
3. 先写失败测试并运行，确认失败原因对应本任务。
4. 实现最小闭环，再运行目标测试、crate 测试和相关集成测试。
5. 每次提交前运行 `gitnexus_detect_changes()`，确认只影响预期符号和执行流。
6. 每个任务独立提交；不把格式化、无关清理或用户已有改动混入提交。
7. 每完成结构性批次运行 `npx gitnexus analyze`，保持索引与当前提交一致。

执行时从干净的隔离 worktree 开始；本计划本身不授权覆盖 `/Users/mac/nofy-build` 的现有未提交内容。

## 3. 规范模型与目录布局

统一根目录：

```text
~/.nofy/memory/
├── meta.sqlite
├── migration-report.json
├── personal/
│   ├── topics/
│   ├── observations/_inbox/
│   ├── archive/
│   ├── MEMORY.md
│   ├── state.sqlite
│   └── index.sqlite
├── global/
│   └── <same layout>
├── projects/<project-id>/
│   └── <same layout>
└── quarantine/
```

- `meta.sqlite` 保存 schema version、ProjectId registry、git common-dir aliases 和迁移状态；不保存知识库或外部根注册表。
- `migration-report.json` 是一次性迁移产物；可记录旧 `roots.json` 的路径清单，但运行时不读取，也不包含外部文件正文。
- 每个 scope 使用同一 schema、同一访问策略、同一索引构建器。
- 原来的 `USER.md` 迁为 `personal/topics/profile.md`，标记 `origin = User`、`pinned = true`，但用户仍可显式修订或忘记。
- `MEMORY.md` 是只读生成清单，包含 topic path、摘要、revision、evidence count 和更新时间。
- Observation 文件不可原地修改；整理成功后从 `_inbox` 原子移动到 `archive`。
- Topic 修订必须携带 `expected_hash`；不匹配返回冲突，不做覆盖写。
- `memory.legacy.<timestamp>.age` 是最长保留 7 天的加密灾备包；首次成功显式 forget 会立即销毁整个灾备包和独立密钥，避免被忘记的原文仍可恢复。

核心类型放入 `crates/codegen/nofy-memory/src/model.rs`：

```rust
pub struct ProjectId(pub Uuid);

pub enum ProjectValidity {
    ProjectWide,
    BranchLocal {
        git_ref: String,
        anchor_commit: String,
    },
}

pub struct Observation {
    pub id: ObservationId,
    pub scope: MemoryScope,
    pub kind: ObservationKind,
    pub statement: String,
    pub keywords: Vec<String>,
    pub aliases: Vec<String>,
    pub supersedes: Vec<ObservationId>,
    pub project_validity: Option<ProjectValidity>,
    pub provenance: Provenance,
    pub content_hash: ContentHash,
    pub created_at: DateTime<Utc>,
}

pub struct ObservationView {
    pub observation: Observation,
    pub status: ObservationStatus,
    pub resolved_by: Option<ObservationId>,
}

pub struct Topic {
    pub id: TopicId,
    pub scope: MemoryScope,
    pub path: TopicPath,
    pub title: String,
    pub description: String,
    pub body: String,
    pub origin: TopicOrigin,
    pub pinned: bool,
    pub project_validity: Option<ProjectValidity>,
    pub revision: u64,
    pub content_hash: ContentHash,
    pub evidence: Vec<ObservationId>,
}

pub enum TopicOrigin { User, Curator }
pub enum ObservationKind { User, UserCorrection, Feedback, Project, Reference, Explicit }
pub enum ObservationStatus { Active, Superseded, Disputed }
pub enum CaptureRollout { Off, RecordOnly, Shadow, Active }
```

`CaptureRollout` 不是用户设置。用户设置只控制 `memory_enabled` 与 `automatic_learning_enabled`；内部 rollout 不能覆盖用户选择。

## 4. 任务分解

### Task 0: 固化用户体验契约与产品词汇

**Files:**

- Create: `docs/architecture/memory-ux-contract.md`

- [x] 记忆产品文档只使用“关于我、当前项目、记住、纠正、忘记、解释”；将 scope、observation、topic、rollout、lease、hash 放入实现术语附录。
- [x] 写入六个可执行场景：立即记住、立即纠正、彻底忘记、解释来源、项目隔离、关闭自动学习。
- [x] 单列“未来知识库”边界：本期只有 provider trait 契约，没有目录注册、索引、注入、设置页或用户命令。
- [x] 为每个场景写 Given/When/Then 和用户可见文案，后续 Tasks 5、9、12、13、14 必须分别引用并实现这些场景。
- [x] Commit: `文档(memory): 固化统一记忆体验契约`

### Task 1: 建立统一领域模型和单系统守卫

**Files:**

- Create: `crates/codegen/nofy-memory/src/model.rs`
- Create: `crates/codegen/nofy-memory/tests/model_contract.rs`
- Modify: `crates/codegen/nofy-memory/src/lib.rs`
- Create: `scripts/check-unified-memory.sh`

- [x] 为 `MemoryScope`、ID newtypes、hash、Observation、Topic、Tombstone、operation phase 和 rollout 定义 serde 稳定格式。
- [x] 测试 ID 非空、topic path 正规化、同仓库 worktree 共享 ProjectId、BranchLocal 匹配和非 Git 项目 identity 稳定；领域模型不得出现 External/Knowledge scope。
- [x] 校验 Personal 对象的 `project_validity` 必须为 None，Project 对象必须显式为 ProjectWide 或 BranchLocal。
- [x] 测试 `UserCorrection` 必须至少引用一个 superseded observation，且 superseded observation 不再参与默认检索。
- [x] 守卫脚本扫描最终禁止符号：`MemoryMode::Legacy`、`MemoryMode::V2`、`memory-v2`、`LegacyMemory`、`V2Memory`、`dual_write`。
- [x] 运行：`cargo test -p nofy-memory --test model_contract`。
- [x] 提交前运行 `gitnexus_detect_changes()`。
- [x] Commit: `重构(memory): 建立统一记忆领域模型`

### Task 2: 收敛唯一配置模型

**Files:**

- Modify: `crates/codegen/nofy-config-types/src/memory.rs`
- Modify: `crates/codegen/nofy-shell/src/config/mod.rs`
- Modify: `crates/codegen/nofy-shell/src/config/tests.rs`
- Modify: `crates/codegen/nofy-pager/docs/user-guide/13-memory.md`

- [x] 保留现有 search、embedding、budget、watcher、GC 配置并迁入统一 `MemoryConfig`。
- [x] 用户配置只暴露 `memory_enabled`、`automatic_learning_enabled`、允许写入的 Personal/Project 范围和 `automatic_excluded_sensitive_categories`；类别至少覆盖 credentials、financial、health、identity、location。
- [x] 新增内部 `capture`、`consolidation`、`retention`、`migration` 子配置；rollout 默认 `RecordOnly`，但不进入普通设置界面，也没有 implementation selector。
- [x] 强制优先级：`memory_enabled = false` 覆盖所有内部 rollout；`automatic_learning_enabled = false` 禁止 capture/consolidation 但不禁止显式 remember/revise/forget。
- [ ] 删除 flush/pruning 的 serde 跳过字段和任何旧版根目录 override。（保留为过渡期运行时兼容垫片；在最终硬切换任务中随旧存储调用点一起删除，且配置文件已明确拒绝这些字段。）
- [x] 配置解析测试覆盖默认值、非法 lease/retry、跨字段预算约束和旧字段的明确报错。
- [x] 运行：`cargo test -p nofy-config-types memory`、`cargo test -p nofy-shell config::tests`。（记忆相关测试通过；4 个未改动的 plugin CTA 文件测试保持基线失败。）
- [x] Commit: `重构(memory): 收敛单一配置入口`

### Task 3: 建立原子文件层与状态账本

**Files:**

- Create: `crates/codegen/nofy-memory/src/layout.rs`
- Create: `crates/codegen/nofy-memory/src/state.rs`
- Create: `crates/codegen/nofy-memory/src/atomic_file.rs`
- Create: `crates/codegen/nofy-memory/tests/state_recovery.rs`
- Modify: `crates/codegen/nofy-memory/src/schema.rs`
- Modify: `crates/codegen/nofy-memory/src/storage.rs`
- Delete after callers migrate: `crates/codegen/nofy-memory/src/dream_lock.rs`

- [x] `meta.sqlite` 和 scope `state.sqlite` 使用 WAL、busy timeout、foreign keys 和显式 schema version。
- [x] 建表：`capture_jobs`、`capture_outcomes`、`files`、`observation_states`、`operations`、`operation_claims`、`topic_changes`、`tombstones`、`quarantine`、`metadata`；不创建 external roots 或 knowledge documents 表。
- [x] Observation 文件正文和 `supersedes` 永不修改；Active/Superseded/Disputed 是账本中的可重建状态投影，通过 `ObservationView` 对外读取。
- [x] 所有 Markdown 写入使用同目录 tempfile、flush、fsync、rename、父目录 fsync；不再直接 `std::fs::write` 覆盖规范文件。
- [x] lease 使用 generation fencing；旧 worker 即使继续运行也不能提交新 generation 的结果。
- [x] 测试 kill-point：临时文件写完、rename 前、数据库提交前、数据库提交后；重启后只能观察到旧版本或完整新版本。
- [x] 运行：`cargo test -p nofy-memory --test state_recovery`。
- [x] Commit: `重构(memory): 建立原子存储与持久账本`

### Task 4: 实现统一访问策略

**Files:**

- Create: `crates/codegen/nofy-memory/src/access.rs`
- Create: `crates/codegen/nofy-memory/tests/access_policy.rs`
- Modify: `crates/codegen/nofy-memory/src/storage.rs`

- [x] 所有路径先做 lexical normalize，再验证 canonical parent 位于 scope root 内。
- [x] 拒绝绝对路径、`..`、symlink escape、写 manifest 和修改 observation。
- [x] Topic update/rename/delete 要求先读得到的 `expected_hash`。
- [x] 多文件操作先登记 operation，再按 phase 推进；失败时恢复数据库与 manifest 可证明的一致状态。
- [x] 测试 traversal、symlink、stale hash、protected internals、immutable observation、manifest rollback。
- [x] 运行：`cargo test -p nofy-memory --test access_policy`。
- [x] Commit: `加固(memory): 统一文件访问与并发控制`

### Task 5: 实现一次性、可恢复迁移

**Files:**

- Create: `crates/codegen/nofy-memory/src/migration.rs`
- Create: `crates/codegen/nofy-memory/src/migration_backup.rs`
- Create: `crates/codegen/nofy-memory/tests/migration_cutover.rs`
- Create: `crates/codegen/nofy-memory/tests/fixtures/legacy-memory/USER.md`
- Create: `crates/codegen/nofy-memory/tests/fixtures/legacy-memory/MEMORY.md`
- Create: `crates/codegen/nofy-memory/tests/fixtures/legacy-memory/roots.json`
- Modify: `Cargo.toml`
- Modify: `crates/codegen/nofy-memory/Cargo.toml`

- [x] 在同一父目录创建 `memory.next.<uuid>`，导入时绝不修改源目录。
- [x] `USER.md` 导入 pinned user-owned Personal topic；旧 global MEMORY 由确定性分类器归入 Personal 或对应 Project，无法归类的条目进入 migration review，不创建 Global scope。
- [x] 旧 workspace MEMORY 根据 ProjectId registry 导入 curator-owned Project topics 并记录 legacy provenance，使其之后仍可被整理；session logs 导入 immutable observations。
- [x] `roots.json` 不导入运行时数据库；只把原注册路径写入迁移报告的 `deferred_knowledge_sources` 数组，供未来知识库功能读取或由用户手工清理。
- [x] 每个导入对象写入 legacy provenance、源 hash、内容 hash 和幂等键；重跑不会重复。
- [x] staging 内生成迁移索引和 manifest，并核对对象数、内容 hash、引用完整性和索引 smoke query；Task 8 再将迁移索引接入统一 FTS/向量派生索引。
- [x] 验证通过后 fsync；将源目录流式打包为 `memory.legacy.<timestamp>.tar.age`，使用 `age` 随机密钥加密并记录最长 7 天保留截止时间，再将 staging rename 为 `memory`；到期调度随 Task 12 retention 接线。
- [x] 灾备密钥只存入 OS credential store；不得进入 SQLite、日志、telemetry 或同目录 key file。credential store 不可用时暂停切换，让用户选择取消或明确继续且不创建灾备。
- [x] 中断恢复覆盖三种状态：切换前清理/续跑、第一次 rename 后完成激活、激活后只使用新目录。
- [x] 激活后禁止自动回退到 legacy backup；显式销毁接口先删除 credential-store 密钥使灾备立即不可解密，再删除整个 legacy backup；Task 12 将它接入完整 forget receipt。
- [x] 迁移回调展示扫描、导入、校验、切换四阶段以及扫描/导入对象数；原子切换前的错误或取消保持 legacy 活跃，切换后恢复只完成新系统激活。
- [x] 运行：`cargo test -p nofy-memory --test migration_cutover`（7 passed）。
- [x] Commit: `迁移(memory): 原子切换到统一存储`

### Task 6: 实现耐久自动捕获队列

**Files:**

- Create: `crates/codegen/nofy-memory/src/capture.rs`
- Create: `crates/codegen/nofy-memory/src/observation_store.rs`
- Create: `crates/codegen/nofy-memory/tests/capture_recovery.rs`
- Modify: `crates/codegen/nofy-memory/src/threat_scan.rs`

- [ ] 只接受“已持久化且成功完成的顶层 turn”产生的 durable capture job；subagent、工具内部采样和失败 turn 不入队。
- [ ] job 使用 transcript hash + session id + turn id 幂等；支持 queued/leased/succeeded/retryable/terminal 状态。
- [ ] 模型输出严格反序列化为结构化 ObservationDraft；拒绝未知字段、空 statement、非法 scope。
- [ ] Host 最终裁决 scope：稳定偏好和个人事实进入 Personal，项目事实进入当前 Project；不存在 Global 写入分支。
- [ ] 冲突检测将明确纠正输出为 `UserCorrection` 并写入 `supersedes`；不确定冲突标为 `Disputed`，不自动覆盖用户事实。
- [ ] Observation 落盘前执行 credential/secret filter、瞬时任务状态过滤和现有 promptware scan；可疑内容进入 quarantine，不进入检索。
- [ ] capture 在模型调用前后都应用 `automatic_excluded_sensitive_categories`；被排除内容只记录无正文 outcome code，不进入 prompt、quarantine、telemetry 或重试队列。
- [ ] 实现 lease 到期重领、有限重试、幂等 outcome、启动 reconciliation 和 shutdown join/cancel。
- [ ] 运行：`cargo test -p nofy-memory --test capture_recovery`。
- [ ] Commit: `实现(memory): 耐久化自动记忆捕获`

### Task 7: 将捕获接入 Shell 的 transcript barrier

**Files:**

- Create: `crates/codegen/nofy-shell/src/session/memory_capture.rs`
- Modify: `crates/codegen/nofy-shell/src/session/persistence.rs`
- Modify: `crates/codegen/nofy-shell/src/session/turn_completion.rs`
- Modify: `crates/codegen/nofy-shell/src/session/acp_session_impl/turn_end.rs`
- Modify: `crates/codegen/nofy-shell/src/session/memory_state.rs`
- Modify: `crates/codegen/nofy-shell/src/session/acp_session_impl/spawn.rs`

- [ ] transcript persistence 返回带 durable sequence/hash 的 barrier receipt。
- [ ] 只有收到 receipt 后才 enqueue capture；enqueue 自身必须提交 SQLite 才算 turn hook 完成。
- [ ] 答案先展示，再执行 capture enqueue；本地队列提交的 p95 目标小于 20ms，模型提取、embedding 和整理不得位于用户响应关键路径。
- [ ] session state 只持有 `Arc<MemoryService>`、capture worker handle 和最后 barrier，不缓存第二份记忆事实。
- [ ] 主助手 session 持有 `Arc<MemoryService>`；spawn subagent 时只复制已筛选、带 hash 的 snapshot 文本，不复制 service handle、capture worker 或写工具注册。
- [ ] shutdown 顺序固定：停止接收新任务、等待 transcript、提交队列、有限等待 worker、释放 lease。
- [ ] Shell 测试覆盖成功 turn、失败 turn、持久化失败、重复 hook、关闭竞态和 subagent 排除。
- [ ] 运行：`cargo test -p nofy-shell memory_capture`。
- [ ] Commit: `集成(shell): 在持久化屏障后捕获记忆`

### Task 8: 将 Nofy 检索升级为统一派生索引

**Files:**

- Modify: `crates/codegen/nofy-memory/src/index.rs`
- Modify: `crates/codegen/nofy-memory/src/search.rs`
- Modify: `crates/codegen/nofy-memory/src/backend.rs`
- Modify: `crates/codegen/nofy-memory/src/mmr.rs`
- Modify: `crates/codegen/nofy-memory/src/query_expansion.rs`
- Create: `crates/codegen/nofy-memory/tests/unified_search.rs`

- [ ] 索引 Topic 和允许召回的 inbox Observation；记录规范对象 ID、Personal/Project scope、ProjectWide/BranchLocal validity、revision/hash。本期索引不得接受知识库文档。
- [ ] 保留现有 FTS5 + vector、CJK probe、时间衰减、source weight、access-frequency boost 与 MMR。
- [ ] 查询 Personal/当前 Project 后统一 rerank；BranchLocal 结果必须与当前 git ref/commit 匹配。
- [ ] 默认检索只返回 Active observations；UserCorrection 权重高于 Explicit 和自动捕获，Superseded 永不进入注入结果。
- [ ] 搜索读取索引前校验对象 hash；脏记录跳过并触发 repair，不返回过时内容。
- [ ] 删除索引后可从规范文件与账本全量重建，结果集合等价。
- [ ] 运行：`cargo test -p nofy-memory --test unified_search`、`cargo test -p nofy-memory`。
- [ ] Commit: `重构(memory): 统一多作用域混合检索`

### Task 9: 用一个 MemoryService 取代 backend + writer

**Files:**

- Create: `crates/codegen/nofy-memory/src/service.rs`
- Create: `crates/codegen/nofy-memory/tests/user_experience_contract.rs`
- Create: `crates/codegen/nofy-tools/src/types/memory_service.rs`
- Create: `crates/codegen/nofy-tools/src/types/knowledge_base.rs`
- Create: `crates/codegen/nofy-tools/tests/knowledge_base_contract.rs`
- Modify: `crates/codegen/nofy-tools/src/types/mod.rs`
- Modify: `crates/codegen/nofy-tools/src/implementations/memory/mod.rs`
- Modify: `crates/codegen/nofy-tools/src/implementations/memory/get_tool.rs`
- Modify: `crates/codegen/nofy-tools/src/implementations/memory/search_tool.rs`
- Modify: `crates/codegen/nofy-tools/src/implementations/memory/write_tool.rs`
- Delete after all callers migrate: `crates/codegen/nofy-tools/src/types/memory_backend.rs`
- Delete after all callers migrate: `crates/codegen/nofy-tools/src/types/memory_writer.rs`
- Delete after all callers migrate: `crates/codegen/nofy-shell/src/session/memory_writer.rs`

目标接口：

```rust
#[async_trait]
pub trait MemoryService: Send + Sync {
    async fn search(&self, request: SearchRequest) -> Result<SearchPage>;
    async fn list(&self, request: ListMemoryRequest) -> Result<MemoryList>;
    async fn get(&self, target: MemoryTarget) -> Result<MemoryDocument>;
    async fn explain(&self, target: MemoryTarget) -> Result<MemoryExplanation>;
    async fn remember(&self, request: RememberRequest) -> Result<RememberReceipt>;
    async fn revise(&self, request: ReviseTopicRequest) -> Result<TopicRevision>;
    async fn forget(&self, request: ForgetRequest) -> Result<ForgetReceipt>;
    async fn undo(&self, token: UndoToken) -> Result<UndoReceipt>;
    async fn capture(&self, request: CaptureRequest) -> Result<CaptureReceipt>;
    async fn consolidate(&self, request: ConsolidateRequest) -> Result<OperationReceipt>;
    async fn snapshot(&self, request: SnapshotRequest) -> Result<MemorySnapshot>;
}
```

- [ ] `remember` 先创建 immutable Explicit observation，再立即索引，并按请求 materialize 为 user-owned/pinned topic；返回前刷新当前 session snapshot，receipt 包含用户语言的 scope label、摘要和短期 undo token。
- [ ] 显式 remember 命中自动排除的敏感类别时不静默保存，先返回 confirmation request，说明范围与风险；credentials/secret 永远拒绝持久化。
- [ ] `revise` 创建 `UserCorrection`、关联 superseded IDs，并在返回前刷新当前 session snapshot；旧事实保留为审计证据但不再检索或注入。
- [ ] `forget` 使用 ID/path + expected hash，并在返回前从活动 snapshot、规范文件、索引和可恢复灾备清除；删除 fuzzy `old_text` replace/remove API。
- [ ] `list/explain` 提供“你记得我什么”和“你为什么知道”的稳定边界；解释结果包含人类可读来源、时间、范围及纠正/忘记 target，不暴露原始内部路径。
- [ ] `undo` 只适用于最近的 remember/revise，校验 operation generation；forget 不可撤销，执行前展示范围确认，执行后不提供恢复入口。
- [ ] 按“统一 scope”章节实现独立 `KnowledgeBaseProvider` trait 和数据类型；契约测试用 fake provider 验证 trait-object search/get，但不得把 provider 注入 `MemoryService`、Shell、agent builder 或 Pager。
- [ ] 工具层只验证输入、调用 service、序列化 receipt；不直接接触文件或 SQLite。
- [ ] 在 `user_experience_contract.rs` 实现 Task 0 的立即记住、立即纠正、解释来源和关闭自动学习场景；测试必须通过公开 `MemoryService`，不得读取内部 SQLite 作为主要断言。
- [ ] 运行：`cargo test -p nofy-memory --test user_experience_contract`、`cargo test -p nofy-tools --test knowledge_base_contract`、`cargo test -p nofy-tools memory`、`cargo test -p nofy-shell memory`。
- [ ] Commit: `重构(memory): 统一服务与工具接口`

### Task 10: 实现可恢复的单一整理引擎

**Files:**

- Create: `crates/codegen/nofy-memory/src/consolidation.rs`
- Create: `crates/codegen/nofy-memory/src/manifest.rs`
- Create: `crates/codegen/nofy-memory/tests/consolidation_recovery.rs`
- Replace: `crates/codegen/nofy-memory/src/dream.rs`

- [ ] 整理 plan 只包含 Create/Update/Rename/Merge/Split；Delete 不属于自动整理，只能由显式 forget 发起。
- [ ] 每个 operation 固化输入 observation IDs、目标 hashes、plan hash、lease generation 和 phase。
- [ ] Curator 只能改 `origin = Curator && !pinned` 的 topic；User 或 pinned topic 只能作为检索证据，不能自动修改；legacy provenance 不改变其导入后所有权。
- [ ] Active：验证 plan → claim evidence → 原子提交 topic → 重建 manifest/index → archive observations → 完成 operation。
- [ ] Shadow：保存并评估相同 plan，但不改 topic、不 archive evidence；RecordOnly 不生成 plan。
- [ ] 崩溃测试覆盖每个 phase，确保重启后继续同一 operation，而不是重复生成不同 plan。
- [ ] 运行：`cargo test -p nofy-memory --test consolidation_recovery`。
- [ ] Commit: `实现(memory): 可恢复的统一记忆整理`

### Task 11: 统一 flush、dream 和 compaction 生命周期

**Files:**

- Create: `crates/codegen/nofy-shell/src/session/acp_session_impl/memory_consolidation.rs`
- Modify: `crates/codegen/nofy-shell/src/session/helpers/memory_flush.rs`
- Modify: `crates/codegen/nofy-shell/src/session/compaction.rs`
- Modify: `crates/codegen/nofy-shell/src/session/agent_rebuild.rs`
- Modify: `crates/codegen/nofy-shell/src/session/acp_session_impl/slash_exec.rs`
- Delete: `crates/codegen/nofy-shell/src/session/acp_session_impl/memory_dream.rs`

- [ ] `/flush` 定义为“等待指定 top-level turn 的 transcript + capture durable barrier”，不再写 session Markdown 或调用第二 writer。
- [ ] `/dream` 定义为调用同一 service 的 consolidation；返回 operation ID、scope、模式和处理数量。
- [ ] compaction 前只需要 flush barrier；compaction 后通过 service 建新 frozen snapshot。
- [ ] 多 session 并发使用 SQLite lease generation，不使用 PID lock。
- [ ] 运行：`cargo test -p nofy-shell memory_flush`、`cargo test -p nofy-shell memory_dream`、`cargo test -p nofy-shell compaction`。
- [ ] Commit: `重构(shell): 统一记忆生命周期命令`

### Task 12: 完成 forget、保留策略并移除旧外部根运行路径

**Files:**

- Create: `crates/codegen/nofy-memory/src/retention.rs`
- Create: `crates/codegen/nofy-memory/tests/forget_and_retention.rs`
- Modify: `crates/codegen/nofy-memory/src/watcher.rs`
- Modify: `crates/codegen/nofy-pager/src/memory_cmd.rs`
- Modify: `crates/codegen/nofy-pager/src/memory_release.rs`
- Modify: `crates/codegen/nofy-pager/src/memory_trace.rs`

- [ ] forget 顺序固定：验证 expected hash → 提交无正文 tombstone → 删除灾备密钥 → 删除灾备包 → 删除/改写规范文件 → 使 session snapshots 失效 → 更新 manifest/index → 完成 operation。
- [ ] tombstone 只保存 opaque target ID、不可逆 salted hash、reason code、时间与 retention deadline；不得保存原文、关键词、标题、路径正文或可逆 provenance。
- [ ] forget 在提交用户可见成功前销毁迁移灾备密钥及灾备包，并使所有活动 session snapshot 中对应对象失效；任一步失败都返回“尚未完全忘记”，不得显示成功。
- [ ] GC 只删除已过 retention 且没有未完成 operation 引用的 archive/tombstone。
- [ ] 删除 `memory add-dir/dirs/remove-dir` 命令和 `roots.json` runtime registry；命令帮助不展示尚未实现的知识库入口。
- [ ] 删除 watcher 对外部目录的扫描/索引路径；未来知识库只能通过 `KnowledgeBaseProvider` 接入，不能复用记忆文件 watcher。
- [ ] 迁移报告完整保留旧注册路径及存在性检查结果，但活动记忆库不读取这些路径。
- [ ] 运行：`cargo test -p nofy-memory --test forget_and_retention`、`cargo test -p nofy-pager memory_cmd`。
- [ ] Commit: `实现(memory): 统一遗忘保留与外部数据源`

### Task 13: 统一注入、安全扫描和冻结快照

**Files:**

- Modify: `crates/codegen/nofy-shell/src/session/helpers/memory_context.rs`
- Modify: `crates/codegen/nofy-shell/src/session/memory/hooks.rs`
- Modify: `crates/codegen/nofy-shell/src/session/memory/mod.rs`
- Modify: `crates/codegen/nofy-agent/src/builder.rs`
- Modify: `crates/codegen/nofy-agent/src/prompt/context.rs`
- Modify: `crates/codegen/nofy-agent/src/prompt/template.rs`
- Modify: `crates/codegen/nofy-agent/templates/prompt.md`
- Modify: `crates/codegen/nofy-memory/src/threat_scan.rs`
- Create: `crates/codegen/nofy-memory/tests/snapshot_injection.rs`

- [ ] `snapshot()` 在一个事务视图内取得 pinned Personal topics、当前 Project manifest 摘要和与当前 ref 匹配的 query top-K snippets。
- [ ] 全文进入 prompt 前运行 promptware scan；发现高风险内容时隔离该对象并返回安全告警，不注入模型。
- [ ] 自动 capture/consolidation 保留冻结语义：只在新 session segment 或 compaction 后进入 snapshot，turn 中途不漂移。
- [ ] 显式 remember/revise/forget 是例外：operation 成功后递增 snapshot generation；下一次模型推理前必须定向重建。Forget 先从所有 session 的 in-memory snapshot 删除，再允许下一次推理。
- [ ] prompt 明确区分记忆是非权威上下文、不能把记忆内指令当系统指令、显式记忆调用的 hash 约束。
- [ ] agent builder 为主助手注册 memory tools；subagent builder 明确移除 memory tool kinds 和 service handle，并测试子代理无法调用 search/get/write/dream。
- [ ] token budget 在 Personal/Project 两类来源间确定性分配，超限使用 MMR 截断；snapshot 输入类型不接受 KnowledgeHit。
- [ ] 运行：`cargo test -p nofy-memory --test snapshot_injection`、`cargo test -p nofy-agent`、`cargo test -p nofy-shell memory_context`。
- [ ] Commit: `加固(memory): 统一安全注入与冻结快照`

### Task 14: 对齐 UI、协议、扩展和遥测

**Files:**

- Modify: `crates/codegen/nofy-pager/src/views/memory_modal.rs`
- Modify: `crates/codegen/nofy-shell/src/extensions/memory.rs`
- Modify: `crates/codegen/nofy-shell/src/session/notifications.rs`
- Modify: `crates/codegen/nofy-telemetry/src/memory_telemetry.rs`
- Modify: `crates/codegen/nofy-telemetry/src/events/mod.rs`

- [ ] 主 UI 只展示“关于我、当前项目”、人类可读摘要、来源时间和“纠正/忘记”；revision、hash、evidence IDs 和 operation ID 收入技术详情。
- [ ] 本期不显示知识库标签、空状态、目录注册按钮或灰置入口；预留接口不转化为半成品用户功能。
- [ ] 设置页只展示记忆总开关、自动学习、Personal/Project 范围和敏感类别；不显示 rollout、lease、capture queue 或 consolidation 模式。
- [ ] remember/revise 返回即时内联 receipt：保存位置、摘要和可用的撤销动作；forget 执行前显示清除范围，成功后明确说明不可恢复。
- [ ] 提供“你记得我什么”和“为什么知道”视图；解释页面可直接发起纠正或忘记。
- [ ] 自动 capture/consolidation 成功保持静默；只有持续失败、需要用户决定或迁移完成时通知。内部事件仍携带 operation ID。
- [ ] telemetry 只记录计数、耗时、模式、失败类别和脱敏 ID，不记录记忆正文、关键词或路径正文。
- [ ] 增加 schema/serialization snapshot 测试，确保 UI 与 Shell 同步升级。
- [ ] 运行：`cargo test -p nofy-pager memory`、`cargo test -p nofy-telemetry memory`、`cargo test -p nofy-shell extensions::memory`。
- [ ] Commit: `集成(memory): 对齐界面通知与遥测`

### Task 15: 吸收并删除 nofy-memorycore

**Files:**

- Delete: `crates/codegen/nofy-memorycore/`
- Modify: `Cargo.toml`
- Modify: `Cargo.lock`
- Modify: `crates/codegen/nofy-daemon/tests/ratchet.rs`

迁移映射：

| memorycore 模块 | 终态 |
|---|---|
| `snapshot` | 合并到 `nofy-memory::service::snapshot` 与 `threat_scan` |
| `curator` | 合并到 `nofy-memory::consolidation` |
| `auditstore` | 合并到 state operation/outcome 元数据 |
| `dreaming`, `compleases` | 由 consolidation durable state machine 取代 |
| `forkrev`, `projstore` | 由 operation ledger、revision/hash 与 replay 取代 |
| `injection` | 合并到 service snapshot + Shell context adapter |
| `compact` | 不迁移未接入的平行压缩状态机 |
| `modelops`, `seal` | 不迁移未被生产调用的旁路能力 |

- [ ] 先为每项被保留策略补齐统一系统测试，再删除原模块。
- [ ] `cargo tree -i nofy-memorycore` 必须无输出，`rg "nofy.memorycore|nofy_memorycore"` 只允许出现在迁移历史文档。
- [ ] 运行：`cargo check --workspace`、`cargo test -p nofy-memory`。
- [ ] Commit: `清理(memory): 删除平行记忆内核`

### Task 16: 删除所有 legacy 运行路径并完成硬切换

**Files:**

- Delete after replacements land: `crates/codegen/nofy-memory/src/dream_lock.rs`
- Delete or rewrite after replacements land: `crates/codegen/nofy-memory/src/dream.rs`
- Delete after replacements land: `crates/codegen/nofy-shell/src/session/memory_writer.rs`
- Delete after replacements land: `crates/codegen/nofy-tools/src/types/memory_backend.rs`
- Delete after replacements land: `crates/codegen/nofy-tools/src/types/memory_writer.rs`
- Modify: `scripts/check-unified-memory.sh`
- Modify: all `Cargo.toml` files that carried legacy dependencies

- [ ] 删除直接写 `USER.md`、`MEMORY.md`、session memory Markdown 的生产路径。
- [ ] 删除 fuzzy batch replace/remove、PID dream lock、旧 roots registry、legacy session log writer。
- [ ] 让守卫脚本额外拒绝生产代码中的 `std::fs::write`/`OpenOptions::append` 对 memory root 的调用。
- [ ] 用 `rg` 证明所有工具、Shell、Pager、agent builder 只依赖统一 `MemoryService`。
- [ ] 运行：`scripts/check-unified-memory.sh`、`cargo check --workspace`。
- [ ] Commit: `重构(memory): 完成单系统硬切换`

### Task 17: 全量验证、文档和索引收尾

**Files:**

- Rewrite: `crates/codegen/nofy-pager/docs/user-guide/13-memory.md`
- Modify: `docs/upstream-absorb-plan.md`
- Modify: `docs/upstream-sync.md`
- Create: `docs/architecture/unified-memory.md`

- [ ] 文档只描述统一系统，不向用户暴露 v1/v2 术语或实现选择。
- [ ] 用户文档以“关于我、当前项目”和四个动作组织；内部架构文档再记录数据模型、事务边界、捕获条件、整理所有权、forget、安全模型及未来 `KnowledgeBaseProvider` 扩展边界。
- [ ] 运行迁移 fixture 的 end-to-end：legacy seed → migrate → explain → remember → correct → next-inference snapshot → capture → consolidate → restart → forget → destroy backup → rebuild index。
- [ ] 运行故障注入：SQLite busy、worker crash、lease expiry、embedding failure、manifest rename failure、磁盘写失败。
- [ ] 运行性能基线：10k/100k observations 下的启动、top-K search、capture enqueue、consolidation batch；将阈值固化为非波动过大的 benchmark 报告。
- [ ] 运行完整验证：

```bash
cargo fmt --all -- --check
cargo check --workspace
cargo test -p nofy-memory
cargo test -p nofy-tools memory
cargo test -p nofy-shell memory
cargo test -p nofy-agent
cargo test -p nofy-pager memory
cargo test -p nofy-telemetry memory
scripts/check-unified-memory.sh
npx gitnexus analyze
```

- [ ] 最后运行 `gitnexus_detect_changes()`，核对执行流变化与计划一致。
- [ ] Commit: `文档(memory): 完成统一记忆架构验收`

## 5. 跨任务不变量测试

这些测试在 Task 3 后建立，并随每个任务持续扩充：

1. **Single writer invariant**：除 migration staging 和 atomic writer 外，没有代码可修改规范记忆文件。
2. **No split brain**：一个进程只打开一个 active root；加密 legacy backup 和 staging 都不能被识别为 active store。
3. **Observation immutability**：同一 observation ID 的内容 hash 永不变化。
4. **Topic concurrency**：stale expected hash 永远不能提交。
5. **Forget precedence**：存在 tombstone 时，reconcile/index rebuild 不得复活对象。
6. **Evidence ownership**：同一 observation 同一时刻最多被一个 active consolidation operation claim。
7. **Curator boundary**：自动整理不能修改 user-owned 或 pinned topic；legacy provenance 本身不改变所有权。
8. **Index derivation**：删掉全部 index 后重建，搜索对象集合与规范源一致。
9. **Capture barrier**：没有 durable transcript receipt 就没有 capture job。
10. **Secret exclusion**：被 secret filter/quarantine 拒绝的正文永不进入 observation、topic、index、manifest 或 telemetry。
11. **Knowledge boundary**：本期只有独立 `KnowledgeBaseProvider` trait；memory schema、index、snapshot、Shell 和 Pager 都不包含知识库运行路径。
12. **Controlled snapshot invalidation**：自动变化不影响当前 segment；显式 remember/revise/forget 必须在下一次推理前生成新 snapshot generation。
13. **Correction precedence**：UserCorrection 立即压制被 supersede 的事实；自动捕获不能覆盖用户纠正。
14. **Recoverable-copy deletion**：首次显式 forget 后，加密 legacy backup 和密钥都不存在，tombstone 不含可恢复正文。
15. **Quiet background work**：正常 capture/consolidation 不产生逐轮通知，也不阻塞答案展示。
16. **Main-assistant ownership**：只有主助手持有 MemoryService 和写工具；子代理只能读取任务相关 snapshot，不能直接查询或修改记忆。
17. **Stable project identity**：同仓库所有 worktree 共享 ProjectId；不同 ProjectId 永不互相注入。
18. **Branch validity**：BranchLocal 事实只在匹配的 ref/commit 上召回，ProjectWide 事实可跨该项目分支使用。

## 6. 验收标准

重构完成必须提供以下证据：

- `cargo tree -i nofy-memorycore` 无依赖且 workspace 不再包含该 crate。
- `rg` 找不到运行期 v1/v2 selector、dual read/write、legacy writer/backend 或 `memory-v2` root。
- 所有 memory 工具和 Shell 生命周期只持有/调用一个 `Arc<dyn MemoryService>`。
- 从旧 Nofy 数据迁移一次后，旧数据按 Personal/Project 归类、用户 profile 为可显式编辑的 pinned topic、session history 成为 immutable observations；旧 registered roots 只存在迁移报告中，不进入运行时。
- 任意 kill-point 重启后，系统可通过账本继续或修复，不产生半写 topic、重复 observation 或失配 manifest。
- 显式 remember/revise/forget 在下一次推理前生效；forget 在重建索引、重启、consolidation 和迁移灾备中都不会复活内容。
- Nofy 原有混合检索、CJK、MMR、时间/访问权重、promptware scan 和冻结注入能力继续通过回归测试。
- 上游 Memory v2 的 durable capture、lease fencing、reconciliation、hash consistency、tombstone 和 shadow rollout 能力在同一实现中通过故障测试。
- 用户文档只呈现一个“记忆”功能和“关于我、当前项目”两个区域，不出现知识库半成品、实现版本、Global scope 或 rollout 模式。
- `KnowledgeBaseProvider` 有独立编译与 fake-provider 契约测试，但 `rg` 能证明当前产品 composition root 没有实例化或注入它。
- 主助手可以使用 Personal + 当前 Project；subagent 工具注册表中没有 memory search/get/write/dream，且顶层 capture 测试证明子代理 turn 不单独入队。
- 同一 repository 的两个 worktree 解析为同一 ProjectId，BranchLocal fixture 不会泄漏到不匹配分支。

## 7. 上线顺序

代码合并可以分批，但产品激活只有一次：

1. 先在测试和开发 profile 完成 Tasks 1–14，生产入口仍未切换。
2. 在同一变更窗口完成 Tasks 15–16，删除旧 crate 与旧入口。
3. 首次启动执行 migration preflight；只有 staging 全量验证通过才原子激活。
4. 首次运行向用户解释“自动学习”并取得设置选择；用户关闭时内部 rollout 不得绕过。激活后工程侧先处于 `RecordOnly`，这是同一 store 内的发布策略，不出现在普通 UI。
5. 观察 durable queue、quarantine、search correctness 后升到 `Shadow`，再升到 `Active`。
6. 任一阶段失败只暂停 capture/consolidation；显式 remember/search/get 仍使用同一个 active store。

这套顺序允许逐步验证自动化质量，但从硬切换开始到最终运行态，始终只有一个记忆实现和一个规范数据源。
