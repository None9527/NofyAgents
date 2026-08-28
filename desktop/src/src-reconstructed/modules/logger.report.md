# logger 恢复决策记录

- **原始 chunk**：`out/renderer/assets/logger-PFDwl5Yq.js`（31 行，891 字节）
- **恢复产物**：`src-reconstructed/modules/logger.tsx`
- **恢复日期**：2026-08-26
- **恢复方法**：LLM 语义重命名 + 唯一导入 `K` 逐行溯源（无 JSX，JSX 还原不适用）

---

## 1. 模块定性

渲染进程日志器：级别化输出到 console（带 `[时间戳] [ui]` 前缀），
非 debug 级别并经 `window.zcode.log` 转发到主进程旁路。

| 成分 | 来源定性 |
|---|---|
| 全部 6 个本地符号 | **ZCode first-party** |
| 唯一导入 `K`（前缀格式化器） | 来自 `src-HCld2afU.js`（first-party 共享 chunk，内部名 `Lx`） |

注：入口 `index-ABImDspU.js` 内有一份 `isStartupLoggingDisabled/startupLog`
的本地副本（避免启动期循环依赖），与本模块逻辑同构、相互独立。

## 2. 符号决策表

### 2.1 导入符号（来自 `./src-HCld2afU.js`）

| chunk 内名 | 导出别名 | 内部名 | 语义名 | 把握度 | 依据 |
|---|---|---|---|---|---|
| `e` | `K` | `Lx` | `formatLogPrefix` | **高** | `src-HCld2afU.jsx` 行 8975：`` `[${Ix()}]${t == null ? '' : ` [pid:${t}]`} [${e}]` ``；`Ix`（行 8968）生成 `YYYY-MM-DD HH:mm:ss.SSS` 时间戳。本模块以 `('ui')` 单参调用，产出 `[时间戳] [ui]` |

### 2.2 本地定义符号

| 原名 | 语义名 | 导出别名 | 把握度 | 依据 |
|---|---|---|---|---|
| `t` | `isLoggingDisabled` | （未导出） | **高** | `__ZCODE_RENDERER_DISABLE_LOGGING__ === true \|\| env.PROD === true`，二条件语义直白 |
| `n` | `CONSOLE_METHODS` | （未导出） | **高** | 级别->console 方法表；`info -> console.log` 的怪癖逐字可证 |
| `r` | `shouldLog` | （未导出） | **高** | 形参未使用、恒返回 `!isLoggingDisabled()`（怪癖保留，见等价说明） |
| `i` | `logAtLevel` | （未导出） | **高** | console 输出 + `level !== 'debug' && typeof window !== 'undefined'` 时的主进程旁路 |
| `a` | `logger` | `t` | **高** | 五方法对象；`trace(scope, level, ...)` 前缀 `[trace:<scope>]` |
| （内联字面量） | `RENDERER_ENV` | （未导出） | **高** | import.meta.env 构建期快照，与入口/门控 chunk 中同款对象逐字一致 |

## 3. 把握度分布

**命名决策（共 6 个符号 = 1 导入 + 5 本地）：**

| 把握度 | 数量 | 符号 |
|---|---|---|
| 高 | **6** | 全部（函数体短小、语义自证；唯一导入经源码行级溯源） |
| 中 | **0** | — |
| 低 | **0** | — |

**类型推断：**

| 把握度 | 数量 | 项目 |
|---|---|---|
| 高 | 3 | `LogLevel` 联合、`RENDERER_ENV` 形状、`window.zcode.log` 签名（按调用点） |
| 中（`// TODO(infer)`） | 1 | `shouldLog` 的级别参数语义（原码即忽略该参数，未来或扩展为阈值过滤） |

## 4. 行为等价性说明

- `info -> console.log`（而非 console.info）映射怪癖逐字保留。
- `shouldLog(level)` 忽略 level 的怪癖逐字保留。
- 旁路传参为 `(level, argsArray)`（整个 rest 数组作第二实参）逐字保留。
- `trace(scope, level, ...)` 的 `[trace:<scope>]` 前缀插在消息最前逐字保留。
- 内联 env 快照保持内联（未改引 import.meta.env，避免构建语义漂移）。

## 5. 运行时等价性验证（已通过，8/8）

验证方式：恢复版 `.tsx` **逐字节复制**为 `logger.verify.mts`（Node 22
`--experimental-strip-types` 原生类型剥离），与原始 chunk 一同在 Node ESM 加载
（`src-HCld2afU.js` 无 DOM 依赖、可独立加载），以桩 `window.zcode.log` 与
console 捕获器度量两侧行为。

| # | 检查项 | 结果 |
|---|---|---|
| 1 | orig 导出键恰为 `{t}` | PASS |
| 2 | rec 导出键恰为 `{t}` | PASS |
| 3 | 导出对象方法集一致（debug/info/warn/error/trace，typeof 对应） | PASS |
| 4 | PROD 构建下四级日志均零 console 输出（两侧） | PASS |
| 5 | PROD 下 trace 零输出且不抛错（含缺省实参变体） | PASS |
| 6 | PROD 下 `window.zcode.log` 旁路零调用 | PASS |
| 7 | `__ZCODE_RENDERER_DISABLE_LOGGING__=true` 路径同样静默 | PASS |
| 8 | `window.zcode` 无 `log` / `window` 缺失时 `?.` 短路不抛错 | PASS |

**验证边界说明**：构建期快照 `PROD: true` 在原码与恢复版中同为内联常量，
「启用日志」分支在本构建中两侧均不可达，故等价性验证覆盖「禁用路径 +
导出面 + 短路安全」；启用路径的逐字对应由源码对照保证（§4）。

验证用 `.mts` 副本已于验证后删除；harness 存于 `/tmp/verify-logger.mjs` 可复跑。

## 6. 流程合规备注

- 未修改 `out/` 下任何文件（仅读取）。
- 仅新建恢复文档/源码，未编辑既有符号，故未执行 `gitnexus_impact` /
  `gitnexus_detect_changes`（本会话亦无 GitNexus MCP 工具可用）。
