# 开发与验证

Nofy 的交付边界是统一 Rust 内核、声明式 Agent 源码和可装载模块。常规业务能力应通过声明或外部模块实现。

## 本地检查

使用根目录 [rust-toolchain.toml](rust-toolchain.toml) 指定的工具链，在 Linux 执行：

```sh
bash scripts/check-release.sh
```

这个入口检查格式、全部工作区目标及 feature 的编译、CLI／MCP／源码工程测试、Host 库与选定 HTTP 回归、coding 预设源码测试和旧宿主依赖边界。Cargo 首次运行会下载锁定依赖；已有本地缓存时可设置 `CARGO_NET_OFFLINE=true`。

完整回归另行执行：

```sh
cargo test --workspace --all-features --locked
```

真实进程树集成测试需要 Linux、systemd 用户服务及可委派 cgroup；真实模型用例需要独立注入凭据。缺少这些前提时应明确报告，不能以编译或静态配置校验代替行为通过。

## 变更约定

- 模块、插槽、依赖、发布与运行继续使用统一装载和执行路径。
- 公共契约更新同步源码中的契约副本、手册与实际调用方；源码 revision、generation、会话 revision 分别处理。
- 以完整功能块集中实现和验证。测试失败后只补跑受影响范围，记录真实失败及修复。
- 源码打包不执行项目脚本、不安装业务依赖，不把完整依赖闭包或包体配额设为打包前提。
- 本地凭据、运行状态、构建产物和参考仓库不进入提交。

安全问题的处理见 [SECURITY.md](SECURITY.md)。源码许可见 [LICENSE](LICENSE)，第三方署名见 [THIRD-PARTY-NOTICES](THIRD-PARTY-NOTICES)。
