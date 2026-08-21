# P1 三入口基准结果

总计 10 题:✅ 10 / 🔶 0 / ❌ 0

## U1(10/10)

| 题 | 状态 | 归因 | 耗时 | 说明 |
|---|---|---|---|---|
| U1-01 配好模型就能用:nofy models 列出且自带 key | ✅ |  | 0s | models 列出 bench 且标注自带 key |
| U1-02 换模型只改 config 一处,会话实际模型随之变 | ✅ |  | 4s | config 改一处,会话实际模型由 deepseek-v4-flash-0731 → deepseek-v4-flash |
| U1-03 空 config 首启有引导,不静默失败 | ✅ |  | 0s | 无配置时给出登录/配 key 引导 |
| U1-04 坏 key 给清晰鉴权错误,不挂死 | ✅ |  | 1s | 坏 key 得到清晰鉴权错误 |
| U1-05 单配置门:headless 与 provider 都用同一份 config 的模型 | ✅ |  | 7s | headless 与 provider 均用 config 的 deepseek-v4-flash-0731(单配置门通过) |
| U1-06 config 的上下文窗设定被会话尊重 | ✅ |  | 2s | 带 context_window=4096 的会话正常起(设定被读取) |
| U1-07 config 权限模式(plan)下不改文件 | ✅ |  | 3s | plan 模式下未落盘文件(权限偏好生效) |
| U1-08 只写必要段,其余走默认 | ✅ |  | 2s | 最小配置可用,缺省字段不报错 |
| U1-09 坏 TOML 启动报错有定位,不崩 | ✅ |  | 0s | 坏 TOML 得到指向配置的错误 |
| U1-10 env_key 引用,配置文件无明文 key | ✅ |  | 2s | key 经 env_key 引用不落盘,功能正常 |


---

> 执行说明:v2 首维(U1 安装与一份配置),驱动面=用户面(config.toml + `nofy` CLI + 会话落盘文件)。
> **单配置门 U1-05 通过**:headless 会话与 provider 委派任务在同一份 config 下实跑模型一致(deepseek-v4-flash-0731),证据见 U1-05.models。
> 过程发现(已修):harness 守护进程未 setsid/重定向 stdin 致整轮挂起;provider 活体检查未验 nofy 真身。
