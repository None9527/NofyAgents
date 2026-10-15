# Rust/CLI 版本与本地发行

桌面版本与桌面 workflow 不属于此链。当前支持本机原生构建与产物验证，不自动发布远端 Release、推送 tag、下载更新或替用户自更新。

## 查询与检查

```sh
nofy --version
nofy version --json
cargo run --locked -p nofy-release -- check
cargo run --locked -p nofy-release -- compare 1.0.45+nofy.2 1.0.45+nofy.10
```

`compare CURRENT CANDIDATE` 输出 newer/equal/older（候选相对当前），三种成功结果均退出 0，错误退出 1。
先比较 SemVer precedence，再比较 Nofy 整数修订；未知 build metadata 拒绝猜测。配置的标准 SemVer 范围逻辑不变。

JSON schema 1 的 `currentVersion` 现在是单一 SemVer；旧实现曾包含 commit/dirty，依赖完整展示文本的脚本请改读 `fullVersion`。
其他字段为 `upstreamVersion`、`upstreamCommit`、`buildCommit`、`worktreeState`、`target`，均来自编译时身份。
版本查询在加载配置前返回，不需要模型/API key，也不创建会话。上游基线表示人工审计进度，不代表所有功能完全一致。

## 升版

```sh
cargo run --locked -p nofy-release -- bump revision --notes '修复的实际内容'
cargo run --locked -p nofy-release -- bump revision --notes '修复的实际内容' --apply
```

默认仅预览，`--apply` 才更新元数据、两个产品 Cargo 包版本、这两个锁文件条目和 `docs/releases/cli.json`。
不重新解析依赖图，不覆盖无关脏改动；写入失败尝试回滚并报告恢复失败。遇到版本漂移先检查，不静默修正为某个猜测值。
上游审计完成后使用 `bump baseline --version V --commit FULL_SHA --notes TEXT [--apply]`：
工具要求本地存在该提交、历史向前且上游产品包版本与 V 一致。版本提高时修订重置 1，同版本更换 SHA 时递增修订。
机械校验不是吸收审计；fetch 本身不会升基线。工具不自动提交，审查变更后再提交，正式打包要求干净工作区。

## 打包与验证

```sh
cargo run --locked -p nofy-release -- package --out target/nofy-dist/my-release
cargo run --locked -p nofy-release -- verify --manifest target/nofy-dist/my-release/release.json
```

默认构建 release；`--profile dev` 可验证开发构建。已有本机二进制可以显式传 `--binary PATH`，仍会核对真实身份、target、当前源码版本和 Git 状态。
输出为按版本/target 命名的可执行文件、`release.json` 和 `SHA256SUMS`；目录必须不存在，失败残留的新目录供检查，不自动递归删除。
对实际大二进制建议用 `cargo run --release --locked -p nofy-release -- ...` 运行发布工具，避免 debug 软件 SHA-256 的额外耗时；这只优化小型工具，不强制重建整个内核为 release。
构建版本覆盖与源码元数据不一致、版本记录缺失、Git unknown、stale 二进制或 dirty 正式包均被拒绝。

脏工作区只能显式打非正式快照：

```sh
cargo run --locked -p nofy-release -- package --snapshot --allow-dirty --profile dev --out target/nofy-dist/my-snapshot
```

快照名和清单会带 SHA/dirty 状态，哈希确定实际二进制内容；Git SHA+dirty 不能还原所有未提交源码，快照不能冒充可复现的正式发行。
校验器只执行本机 target 的二进制。仅校验自己构建或其他可信来源的本地产物：SHA-256 提供完整性，不证明发布者身份，也不代替代码签名。

## 安装、拒绝降级与回滚

```sh
cargo run --locked -p nofy-release -- install --manifest target/nofy-dist/my-release/release.json --dest /absolute/path/to/nofy
# 同版本重新安装需要显式允许：
cargo run --locked -p nofy-release -- install --manifest target/nofy-dist/my-release/release.json --dest /absolute/path/to/nofy --reinstall
```

先 verify，再比较已安装版本。默认拒绝降级；同版本需 `--reinstall`，不支持隐式强制降级。
旧文件备份为同目录唯一的 `.nofy-previous-*` 文件，路径会输出；随后原子替换，复查哈希与真实 JSON 身份，失败恢复旧状态。
恢复历史版本属于显式人工操作，先停用不合适的新进程，再使用已知备份；工具不会自动删除备份或终止已运行的用户进程。
安装成功后重新启动 nofy。旧版 JSON 格式被兼容识别；无法查询的安装拒绝覆盖，不猜测它的版本。
升版与安装有独占锁。异常退出遗留锁时，先检查提示路径内的 PID 及是否有操作仍在运行，再人工移除该单个锁文件，工具不自动删除无法确认归属的锁。

## 验证范围

```sh
CARGO_INCREMENTAL=0 CARGO_PROFILE_DEV_DEBUG=0 CARGO_PROFILE_TEST_DEBUG=0 cargo test --locked -p nofy-release -p nofy-version
```

独立 `.github/workflows/nofy-cli.yml` 配置 Linux/macOS/Windows 原生门禁和本地产物上传，不修改桌面 workflow，不公开发布 Release。
本地结果与远端 CI/其他平台结果必须分开报告；存在 workflow 不代表它已执行成功。旧 npm 安装壳不作为本工具的发布入口，本轮不向 npm 发布。
