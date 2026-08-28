# IntlProvider 恢复决策记录

- **原始 chunk**：`out/renderer/assets/IntlProvider-C321H7m8.js`（9,253 行，646,042 字节）
- **恢复产物**：`src-reconstructed/modules/intlProvider.tsx`（9,504 行）
- **恢复日期**：2026-08-26
- **恢复方法**：LLM 语义重命名 + JSX 还原（Provider 渲染段）+ 脚本拼装
- **定性**：**ZCode first-party 自研 i18n 运行时**（非 react-intl/formatjs——
  node_modules 中无任何 formatjs 系依赖；formatMessage 为自研 `{placeholder}` 替换）

---

## 1. 模块定性

| 成分 | 行范围（原 chunk） | 来源定性 |
|---|---|---|
| localStorage 工具 ×8 + navigator 语言探测 | 1-47 | first-party |
| **zh-CN 文案目录**（4,515 条） | 48-4564 | first-party 数据（chunk 体积主体之一） |
| **en-US 文案目录**（4,519 条） | 4565-9085 | first-party 数据 |
| 目录映射表 / 存储键 / 广播信道常量 | 9086-9089 | first-party |
| 语言/偏好判定、广播载荷解析、初始偏好裁决、回环过滤 | 9090-9121 | first-party |
| createIntlShim（formatMessage 精简实现） | 9122-9130 | first-party |
| Context + ZCodeIntlProvider + useZCodeIntl | 9131-9253 | first-party |

消费者交叉验证：入口 `index-ABImDspU.js` 以 `x`（导出别名 t）渲染
`ZCodeIntlProvider` 并传入 `settingService`（supportsSettings 时）/
`broadcastService`/`resolveSystemLocale`；三个用量图 chunk 与 styles 主
chunk 经 `n()`（useZCodeIntl）取 `intl`/`locale`。

## 2. 符号决策表

### 2.1 导入符号

| chunk 内名 | 导出别名 | 内部名 | 语义名 | 把握度 | 依据 |
|---|---|---|---|---|---|
| `r` | `Ps`（src-HCld2afU.js） | `e` | `DEFAULT_LOCALE`（'zh-CN'） | **高** | src-HCld2afU.jsx 行 1：`var e = 'zh-CN'`；在 resolveLocaleFromNavigator 中作 navigator 不可用时的兜底 |

### 2.2 本地定义符号

| 原名 | 语义名 | 导出别名 | 把握度 | 依据 |
|---|---|---|---|---|
| `a` | `getStorage` | （未导出） | **高** | try/catch 取 window.localStorage |
| `o` | `isReadableStorage` | （未导出） | **高** | `!!e && typeof e.getItem === 'function'` |
| `s` | `isWritableStorage` | （未导出） | **高** | 可读 && 有 setItem |
| `c` | `getReadableStorage` | （未导出） | **高** | 否则 null |
| `l` | `getWritableStorage` | `a` | **高** | 同上 |
| `u` | `readLocalStorageItem` | `o` | **高** | 异常返回 null |
| `d` | `writeLocalStorageItem` | `s` | **高** | 异常静默 |
| `f` | `getNavigatorLanguage` | （未导出） | **高** | navigator 守卫 |
| `p` | `ZH_CN_MESSAGES` | `i` | **高** | 4,515 条中文文案 |
| `m` | `EN_US_MESSAGES` | `r` | **高** | 4,519 条英文文案 |
| `h` | jsxRuntime | （未导出） | **高** | 互操作 |
| `g` | `MESSAGE_CATALOGS` | （未导出） | **高** | `{ 'zh-CN': p, 'en-US': m }` |
| `_` | `LOCALE_PREFERENCE_STORAGE_KEY` | （未导出） | **高** | `'zcode-locale-preference'` |
| `v` | `LOCALE_BROADCAST_CHANNEL` | （未导出） | **高** | `'state:locale'` |
| `y` | `isSupportedLocale` | （未导出） | **高** | `=== 'zh-CN' \|\| === 'en-US'` |
| `b` | `isLocalePreference` | （未导出） | **高** | `'system' \|\| 受支持语言` |
| `x` | `parseLocaleBroadcastPayload` | （未导出） | **高** | 裸字符串/对象双协议解析 |
| `S` | `resolveInitialLocalePreference` | （未导出） | **高** | preferSettingServiceLocale 优先链 |
| `C` | `isRelevantLocaleBroadcast` | （未导出） | **高** | 信道 + 载荷 + 回环过滤 |
| `w` | `createIntlShim` | （未导出） | **高** | `catalog[id] ?? id` + replaceAll 占位 |
| `T` | `ZCodeIntlContext` | （未导出） | **高** | createContext(null) |
| `E` | `ZCodeIntlProvider` | `t` | **高** | 见 §4 职责分解 |
| `D` | `useZCodeIntl` | `n` | **高** | 错误文案自带组件名（逐字保留） |

## 3. 把握度分布

**命名决策（共 24 个符号 = 1 导入 + 23 本地）：**

| 把握度 | 数量 | 符号 |
|---|---|---|
| 高 | **24** | 全部（函数体自证 + 消费者用法 + 字符串常量三重印证；错误文案直接给出 `useZCodeIntl`/`ZCodeIntlProvider` 原名） |
| 中 | **0** | — |
| 低 | **0** | — |

**类型推断：**

| 把握度 | 数量 | 项目 |
|---|---|---|
| 高 | 5 | `SupportedLocale`、`LocalePreference`、`MessageCatalog`、`ZCodeIntl`、`ZCodeIntlContextValue` |
| 中（`// TODO(infer)`） | 2 | `SettingServiceLike`、`BroadcastServiceLike`（完整接口在 @zcode/services，按用法建模） |

## 4. Provider 职责分解（恢复版注释已内联）

1. **三源裁决**：`initialLocale` prop > 本地存储偏好 > 设置服务（挂载对账，
   `preferSettingServiceLocale` 时反向以设置服务为准并回写存储）；
2. **代际防竞态**：`localeChangeGenerationRef` 每次变更 +1，异步解析回来后
   仅当代际未过期才写设置服务/应用结果；
3. **跨窗口同步**：变更经 `broadcastService.send({channel:'state:locale', payload})`
   广播；接收端以 `pendingLocalBroadcastRef` 比对过滤自身回执；应用远端变更时
   `isApplyingRemoteChangeRef` 抑制二次广播；
4. **下发**：`{intl, locale, localePreference, setLocale, setLocalePreference}`
   经 useMemo 稳定化后入上下文。

## 5. 目录数据处理说明

两个文案目录为纯数据，恢复版**逐字节**保留：由脚本 `/tmp/build-intlProvider.mjs`
自原 chunk 行 49-4563（zh）与 4566-9084（en）抽取拼装，脚本含首末行边界自检。
宿主变量名 `p`/`m` 改为 `ZH_CN_MESSAGES`/`EN_US_MESSAGES`，目录体本身零改动。

## 6. 行为等价性说明

- formatMessage 的 `?? id` 回退与 `replaceAll('{key}', String(value))` 逐键替换
  （缺占位值保留原样）逐字保留；
- 广播回环抑制、代际护栏、`.catch(() => {})` 静默错误逐字保留；
- 逗号表达式（偏好写入三连、远端应用四连）展开为语句块，求值顺序不变。

## 7. 运行时等价性验证（已通过，14/14）

验证方式：恢复版经 esbuild 机械转换（jsx=automatic，`react` 经桩包解析到
`out/renderer/assets/react-BQLj9xdT.js` 的同一 React 19 实例）为
`intlProvider.verify.mjs`，与原始 chunk 在 Node ESM 并排执行；
Provider 首帧以最小桩 dispatcher（useState/useRef/useCallback/useMemo/useEffect/
useContext）驱动。

| # | 检查项 | 结果 |
|---|---|---|
| 1 | orig 导出键恰为 `{a,i,n,o,r,s,t}` | PASS |
| 2 | rec 导出键恰为 7 个语义名 | PASS |
| 3 | 导出形状一一对应（typeof） | PASS |
| 4 | zh-CN 目录 **4,515 条逐键相等** | PASS |
| 5 | en-US 目录 **4,519 条逐键相等** | PASS |
| 6 | 目录抽查（common.loading 双语、{count} 占位） | PASS |
| 7 | readLocalStorageItem 命中/未命中/异常三路径等价 | PASS |
| 8 | writeLocalStorageItem + getWritableStorage 等价 | PASS |
| 9 | 存储抛错时静默降级（返回 null / 不抛） | PASS |
| 10 | Provider 首帧上下文值形状一致（locale/preference/setter） | PASS |
| 11 | formatMessage zh-CN 逐 id 相等（含缺 id 回退原样） | PASS |
| 12 | formatMessage en-US 逐 id 相等 | PASS |
| 13 | `{placeholder}` 替换两侧一致（含缺值保留） | PASS |
| 14 | useZCodeIntl 脱离 Provider 抛同款错误（文案逐字） | PASS |

**验证边界说明**：设置服务对账（useEffect 异步分支）与广播收发需要完整
IPC 桩与多帧渲染，超出本批次范围；其逐字对应由源码对照保证（§6）。

验证用副本与桩包已于验证后删除；harness 存于 `/tmp/verify-intlProvider.mjs`，
拼装脚本存于 `/tmp/build-intlProvider.mjs`。

## 8. 流程合规备注

- 未修改 `out/` 下任何文件（仅读取）。
- 仅新建恢复文档/源码，未编辑既有符号，故未执行 `gitnexus_impact` /
  `gitnexus_detect_changes`（本会话亦无 GitNexus MCP 工具可用）。
