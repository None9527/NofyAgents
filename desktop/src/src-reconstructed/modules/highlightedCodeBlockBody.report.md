# highlightedCodeBlockBody 恢复决策记录（vendor：streamdown）

- **原始 chunk**：`out/renderer/assets/highlighted-body-OFNGDK62-RS9ZmWFH.js`（28 行，842 字节）
- **恢复产物**：`src-reconstructed/modules/highlightedCodeBlockBody.tsx`
- **恢复日期**：2026-08-26
- **定性**：**vendor —— streamdown@2.5.0**（vercel/streamdown，Apache-2.0），非 first-party
- **恢复方法**：逐行对照 `node_modules/streamdown/dist` 上游产物确认身份

---

## 1. 身份证据（把握度：高）

1. **文件名对应**：上游包 `dist/` 下即有同名产物
   `node_modules/streamdown/dist/highlighted-body-OFNGDK62.js`
   （`OFNGDK62` 是 streamdown 自身 rollup 构建的内容哈希；ZCode 的 Vite
   构建在其上追加了自己的哈希后缀 `-RS9ZmWFH`）。同包还有
   `dist/chunk-BO2N2NFS.js`（对应构建产物 `chunk-BO2N2NFS-CSNAeaxF.js`）
   与 `dist/mermaid-GHXKKRXX.js`（对应 `mermaid-GHXKKRXX-*.js` 系列）。
2. **逐语句一致**：上游全文仅一个组件 `R`（导出名 `HighlightedCodeBlockBody`），
   与本 chunk 的 `c` 组件逐语句对应：
   - `let { shikiTheme } = useContext(A)` ↔ `(0, o.useContext)(r)`；
   - `let highlighter = f()` ↔ `p = i()`；
   - `useState(raw)` 初值、`useEffect` 依赖 `[code, language, shikiTheme, highlighter, raw]`、
     「无高亮器回退 raw」「highlight 同步返回值与回调双通道更新」完全一致。
   差异仅 Vite 互操作包装（`e(t(), 1)` 取 React 默认导出、`n()` 取 jsx-runtime
   命名空间）与导入别名。
3. **依赖导入映射**（构建 chunk-BO2N2NFS 尾部导出表 `R as A, Li as f, At as c`）：

| 构建导入 | 构建内部名 | 上游内部名 | 上游语义 | 上游定义位置（构建 jsx 行号） |
|---|---|---|---|---|
| `i` | `Xb` | `R` | StreamdownOptionsContext（`{shikiTheme, controls, isAnimating, lineNumbers, mode, mermaid, linkSafety}`） | chunk-BO2N2NFS-CSNAeaxF.jsx 17235 |
| `n` | `ry` | `Li` | useCodeHighlighter（`() => useContext(Ve)?.code ?? null`，`Ve = createContext(null)`） | 同上 16112-16113 |
| `t` | `kv` | `At` | CodeBlockBody（memo 组件，渲染 shiki tokens，`data-streamdown="code-block-body"`，CSS 变量 `--sdm-bg/--sdm-fg/--sdm-c`） | 同上 15458 |

4. **懒加载方**：同包上游 `Fv = lazy(() => import('./highlighted-body-….js').then(e => ({ default: e.HighlightedCodeBlockBody })))`
   （构建 jsx 15520 行附近，`__vite__mapDeps([0,1,2,3])` 恰为本 chunk + 三个基础依赖），
   解释本 chunk 独立成文件的原因——代码块正文的按需分包。

## 2. 符号决策表

| 原名 | 语义名 | 把握度 | 依据 |
|---|---|---|---|
| `c`（导出 `HighlightedCodeBlockBody`） | `HighlightedCodeBlockBody` | **高** | 原导出名未混淆；与上游导出名一致 |
| `o`（局部） | ReactInterop | **高** | `e(t(), 1)` 标准 CJS 默认互操作 |
| `s`（局部） | jsxRuntime | **高** | `n()` 取 jsx-runtime 命名空间 |
| `r`（导入） | `StreamdownOptionsContext` | **高** | 上游 `A` = `R = createContext(Ys)`，`Ys` 默认值含 `shikiTheme` 等 7 字段 |
| `i`（导入） | `useCodeHighlighter` | **高** | 上游 `f` = `Li = () => ct()?.code ?? null` |
| `a`（导入） | `CodeBlockBody` | **高** | 上游 `c` = `At`，memo + 自定义比较器（result/language/className/startLine/lineNumbers） |

**类型推断（非命名）：**

| 把握度 | 数量 | 项目 |
|---|---|---|
| 高 | 2 | `HighlightedCodeBlockBodyProps`（解构即上游签名）、`StreamdownOptions`（上游默认值逐字） |
| 中（`// TODO(infer)`） | 2 | `ShikiTheme`（上游允许字符串/对象/双主题）、`CodeHighlighter.highlight` 完整签名（按 @streamdown/code 的 createHighlighter 行为建模） |

## 3. 把握度分布

**命名决策（共 6 个符号）：** 高 **6** / 中 0 / 低 0（全部有上游逐行证据）。

## 4. 行为等价性说明

恢复版与原始 chunk 运行时行为等价：组件签名、effect 依赖、双通道更新、
透传 rest props 逐字一致。唯一文本级差异：上游 `useEffect(...), jsx(...)`
逗号表达式在恢复版中展开为两条语句（上游压缩写法本身即同一求值顺序，
无可观察差异）。TS 类型标注在运行时经类型剥离，不影响行为。

## 5. 验证

- **esbuild 解析**：`esbuild highlightedCodeBlockBody.tsx --loader:.tsx=tsx` → 0 错。
- **运行时等价检查**：不单独建 harness。原因：本组件行为等价于上游
  streamdown 产物（逐语句对照已证明），其运行需要 StreamdownOptionsContext +
  代码高亮器实例 + React 渲染环境，等价性证据已由「与上游逐行一致」承担；
  若需集成级验证，应在 streamdown 升级比对流程中进行，而非本恢复批次。

## 6. 上游登记

- **包**：`streamdown@2.5.0`（vercel/streamdown，Apache-2.0）
- **文件**：`dist/highlighted-body-OFNGDK62.js`（+ 依赖 `dist/chunk-BO2N2NFS.js`）
- 同包 vendor 件 `chunk-BO2N2NFS-CSNAeaxF.js`（streamdown 主体，21,756 行）
  不在本批次任务清单内，未单独登记。

## 7. 流程合规备注

- 未修改 `out/` 下任何文件（仅读取）。
- 仅新建恢复文档/源码，未编辑既有符号，故未执行 `gitnexus_impact` /
  `gitnexus_detect_changes`（本会话亦无 GitNexus MCP 工具可用）。
