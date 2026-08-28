# e2eStoreBridgeBootstrap 恢复决策记录

- **原始 chunk**：`out/renderer/assets/e2eStoreBridgeBootstrap-DOKuAE2h.js`（9 行，299 字节）
- **恢复产物**：`src-reconstructed/modules/e2eStoreBridgeBootstrap.tsx`
- **恢复日期**：2026-08-26
- **恢复方法**：LLM 语义重命名 + 依赖侧 store 定义交叉验证（无 JSX，JSX 还原不适用）

---

## 1. 模块定性

单一职责的 first-party 测试桥模块：当构建开关 `VITE_ZCODE_E2E_STORE_BRIDGE === '1'`
且运行在浏览器时，把四个 zustand store 以稳定全局名挂到 `window`，供 E2E 测试直读状态。

| 成分 | 来源定性 |
|---|---|
| `registerE2EStoreBridges`（唯一函数） | **ZCode first-party**（导出名本身未混淆） |
| 五个导入（门控 + 四 store） | 来自 `skillStore-BmeKHDBI.js`（first-party store chunk） |

消费者（且仅此一个）：入口 `index-ABImDspU.js` 在 env 开关为 '1' 时动态
`import('./e2eStoreBridgeBootstrap-DOKuAE2h.js')` 并调用 `registerE2EStoreBridges()`。

## 2. 符号决策表

### 2.1 导入符号（来自 `./skillStore-BmeKHDBI.js`）

经 skillStore chunk 尾部导出表映射到内部名，再对照 `skillStore-BmeKHDBI.jsx` 中的
定义逐一确认：

| chunk 内名 | 导出别名 | 内部名 | 语义名 | 把握度 | 依据 |
|---|---|---|---|---|---|
| `e` | `K` | `v` | `isE2EStoreBridgeEnabled` | **高** | jsx 行 50：`typeof window !== 'undefined' && env.VITE_ZCODE_E2E_STORE_BRIDGE === '1'`，与入口 chunk 的同款门控逐字一致 |
| `t` | `h` | `yn` | `useSessionStore` | **高** | jsx 行 1794：zustand store，state 含 `workspaces`/`getWorkspaceState`；挂载点 `__zcodeSessionStoreE2E` 与「会话」语义吻合 |
| `i` | `t` | `Yn` | `useSkillStore` | **高** | jsx 行 2387：state 含 `skills[]`，initialize 报 `'skillsService is required'`；chunk 名即 skillStore |
| `r` | `r` | `Gn` | `useSubagentsStore` | **高** | jsx 行 2161：state 含 `agents[]`，initialize 报 `'subagentsService is required'` |
| `n` | `o` | `In` | `useWhiteboardStore` | **高** | jsx 行 1923：state 含 `createBoard`/`defaultNamePrefix`（白板语义） |

### 2.2 本地定义符号

| 原名 | 语义名 | 导出别名 | 把握度 | 依据 |
|---|---|---|---|---|
| `a` | `registerE2EStoreBridges` | `registerE2EStoreBridges` | **高** | 原导出名即语义名（`export { a as registerE2EStoreBridges }`） |

## 3. 把握度分布

**命名决策（共 6 个符号 = 5 导入 + 1 本地）：**

| 把握度 | 数量 | 符号 |
|---|---|---|
| 高 | **6** | 全部（门控函数体逐字可读；四 store 经 state 字段 + 错误文案 + 挂载点名三重印证） |
| 中 | **0** | — |
| 低 | **0** | — |

**类型推断：**

| 把握度 | 数量 | 项目 |
|---|---|---|
| 高 | 2 | `ZCodeRendererEnv`（与多处同款内联对象逐字一致）、全局挂载点声明 |
| 中（`// TODO(infer)`） | 1 | `AnyZustandStore`（各 store 完整 state 类型不在本模块范围） |

## 4. 外部依赖

- `skillStore-BmeKHDBI.js`：门控与四个 store（运行时）。
- 无 CSS/i18n 依赖；不渲染任何 UI。

## 5. 行为等价性说明

- 原码 `e() && ((w.a = t), (w.b = i), (w.c = r), (w.d = n))` 逗号表达式改写为
  `if (!gate) return;` + 四条赋值：求值顺序、短路语义、各赋值结果完全一致，
  表达式返回值均被丢弃，无可观察差异。
- 四个 `window.__*E2E` 属性名与挂载值（store hook 本体引用）逐一不变。

## 6. 验证

- **esbuild 解析**：`esbuild e2eStoreBridgeBootstrap.tsx --loader:.tsx=tsx` → 0 错（0.24.0）。
- **运行时等价检查**：本模块逻辑为「门控 + 四条引用赋值」，等价性已由逐语句对照
  覆盖；独立 harness 需要构造 skillStore chunk 的完整 ESM 加载链（其依赖含
  zustand/react 互操作），成本与收益不成比例，故不单独建 harness——
  其运行时行为面（导出键、函数签名）在入口 chunk 的集成路径中行使。

## 7. 流程合规备注

- 未修改 `out/` 下任何文件（仅读取）。
- 本任务仅新建恢复文档/源码，未编辑既有符号，故未执行 `gitnexus_impact` /
  `gitnexus_detect_changes`（本会话亦无 GitNexus MCP 工具可用）。
