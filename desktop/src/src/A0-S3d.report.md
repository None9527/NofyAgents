# A0-S3d 报告 — vendored→npm 迁移（lexical 20 名：版本锚定 0.42.0 + Composer 族接线）

日期：2026-08-29 · 工作目录：`desktop/src/src`（该 package.json）· 基线 tsc：2 errors（/tmp/tsc-now15.txt，均为 TopBar S4 stub，保留）

## 一、版本裁决（先做，证据链完整）——**0.42.0**，非台账所记 latest 0.49.0

A0-PROGRESS S3 表注「lexical/@lexical/react（latest 0.49.0）✓ 可达；vendored 版本号需先从 bundle 锚定」。本批锚定结果：**bundle vendored lexical = 0.42.0**（0.49.0 为 npm 当前 latest，与 bundle 不符，差 7 个 minor）。

### 1.1 版本字符串双锚（决定性证据）

| 锚点 | bundle 位置 | 实测 | npm 0.42.0 对应物 |
|---|---|---|---|
| `LexicalEditor.version` 静态 | styles-CdEGpc2x.js **60548** | `FL.version = '0.42.0+prod.esm'` | lexical@0.42.0 `Lexical.prod.mjs`：`io.version="0.42.0+prod.esm"`（逐字同构） |
| `LexicalBuilder.PACKAGE_VERSION` 常量 | styles **62523** | `var TB = '0.42.0+prod.esm'`（`PKe` = LexicalBuilder 类构造入 `PACKAGE_VERSION`） | @lexical/extension@0.42.0 `LexicalExtension.prod.mjs`：`const oe="0.42.0+prod.esm"`（逐字同构） |

差异验证：0.41.0 / 0.43.0 tarball 的 prod dist 各含且仅含 `0.41.0+prod.esm` / `0.43.0+prod.esm` → 版本字符串逐版唯一，bundle 双锚唯一指向 0.42.0。

### 1.2 错误码面指纹（S3-a xterm 法移植）

- 从 bundle vendored 段（实际边界见 §1.4）抽取全部 `lexical.dev/docs/error?code=N` 抛错助手的数字码：**125 个不同码，最大 334**。
- 与 npm 0.42.0 包族（lexical core + @lexical/{extension,react,history,rich-text,plain-text,clipboard,html,selection,utils,text,devtools-core}）prod dist 码集求并（143 码）：**bundle − 并集 = ∅**（全部 125 码命中）。
- 关键单码锚定：码 **166** 仅存于 @lexical/clipboard `$getHtmlContent`（`selection == null` 抛错）；bundle `WKe`@62880 `return (t ?? UKe(166), …isCollapsed()…getNodes().length === 0 ? '' : HKe(e,t))` 与 0.42.0 dist `function D(e,n=$getSelection()){return null==n&&v(166),…}` 逐结构同构（`??`/`&&` 之差为 ZCode 构建管线 minifier 差异，0.41–0.43 源码面逐字相同，非版本信号）。
- 并集 − bundle = {0,1,4,58,102,125,133,150,165,177,179,182,183,280,281,283,291,303}，均为 tree-shaking 未落 bundle 的死路径码，符合预期。
- 注：core 码集在 0.41/0.42/0.43 三版完全相同（103 码/最大 334），码数本身不具版本判别力；判别力在版本字符串 + 166 单码 + §1.3 结构面。

### 1.3 结构面标记（0.42.0 extension 架构实证）

- bundle `PKe`@62516 类字段 `roots/extensionNameMap/outgoingConfigEdges/incomingEdges/conflicts/_sortedExtensionReps` + `PACKAGE_VERSION` 与 @lexical/extension@0.42.0 `LexicalBuilder`（dist `se` 类）逐字段同构。
- 扩展名字面：`@lexical/extension/InitialState`（styles 62512）、`Symbol.for('@lexical/extension/LexicalBuilder')`（62515）、`@lexical/react/ReactProvider`（62746）——均为 0.42.0 extension 架构产物，与 @lexical/react@0.42.0 的 `LexicalReactProviderExtension` / `InitialStateExtension` 对应。
- devtools 版本检查标记 `String(i.constructor.version || '<0.17.1')`（styles 58927）在 0.42.0 core dist 同构。
- 反证复现：以 `--define:process.env.NODE_ENV="production"` 探针 bundle 本批所装 npm 0.42.0，输出恰含 `0.42.0+prod.esm` ×2 + `Minified Lexical error` 串——与 ZCode bundle 的双版本串指纹形态完全一致。

### 1.4 vendored 体边界勘误

台账/文件头注「57652–63592」为体内中段；实测 lexical 体自 **~54890**（`var ON = createContext(null)` = composer context；54907 起 `lexical.dev/docs/error` 抛错助手）至 **~63592**，约 8,700 行（含 @lexical/extension、@lexical/react、@lexical/clipboard 等 vendored 段）。边界仅影响登记口径；out/ 本体零触碰。

## 二、包清单（2 直接依赖，全部 exact 钉版；传递 28 包）

| 包 | 钉版 | 角色 |
|---|---|---|
| lexical | **0.42.0** | core：$ 函数/命令常量/TextNode 类/LexicalEditor/EditorState/RangeSelection 类型面 |
| @lexical/react | **0.42.0** | LexicalComposer/LexicalComposerContext(useLexicalComposerContext)/LexicalContentEditable/LexicalRichTextPlugin/LexicalHistoryPlugin 五条子路径 |

传递锁定（均 0.42.0，经 package-lock）：@lexical/{clipboard,code-core,devtools-core,dragon,extension,hashtag,history,html,link,list,mark,markdown,offset,overflow,plain-text,rich-text,selection,table,text,utils,yjs}；另 @floating-ui/{core 1.8.0,dom 1.8.0,react 0.27.20,react-dom 2.1.9,utils 0.2.12}、react-error-boundary 6.1.3（@lexical/react 依赖面）。共 +30 包。

## 三、族普查（20 declared → 库归属）

任务提示「主要在 MarkdownIntegration/MarkdownElements/LegacyDocEngine*」经 grep **证伪**：全部 lexical 消费面唯一落在 **Composer.tsx**（Home/MarkdownVendored/ImeComposition 仅注释提及）。lane4 桶 28 名中另 8 名（`$`/`$_`/`$c`/`$g`/`$i`/`$l`/`$s`/`$v`）为 LegacyDocEngineC4/SrcSharedB/XlsxDeepA/B 的单字符混淆名粗归入桶，与 lexical npm 无关（wiring-plan 登记为它域 UNIQUE/UNRESOLVED），不在本批范围。

| 归属 | 名 | 处置 |
|---|---|---|
| lexical core 类型（3） | LexicalEditor、LexicalEditorState、LexicalRangeSelection | 转 `type` 导入（0.42.0 中为 **type-only 导出**，无运行时值——esbuild 运行面实证） |
| lexical core 类（1） | LexicalTextNode | 转值导入 `TextNode as LexicalTextNode`（PromptMentionNode 运行时 extends） |
| lexical core $ 函数（8） | $getSelection/$isRangeSelection/$isTextNode/$getRoot/$createTextNode/$createParagraphNode/$isParagraphNode/$applyNodeMutation | 前 7 个同名直转；**$applyNodeMutation 实为 $applyNodeReplacement**（§四.1） |
| lexical core 命令（8，census 外同块） | KEY_ARROW_UP/DOWN/ENTER/TAB/ESCAPE/BACKSPACE_COMMAND、COPY_COMMAND、BLUR_COMMAND + 本地 `LexicalCommand` 接口 | 命令转真实导入（0.42.0 `LexicalCommand<P>` 载荷型：KEY_*=KeyboardEvent\|null 系、COPY=ClipboardEvent、BLUR=FocusEvent）；本地接口删除 |
| @lexical/react（5） | LexicalComposer、LexicalRichTextPlugin、LexicalContentEditable、LexicalHistoryPlugin、useLexicalComposerContext | 五条子路径导入；后三者 0.42.0 导出名为 `RichTextPlugin`/`ContentEditable`/`HistoryPlugin`，语义别名保留 |
| **第一方**（1，保留） | reportLexicalInputTelemetry | ZCode 自研输入遥测（非 lexical npm，无上游包）→ **declare 保留** |

## 四、转换汇总与调用面修正（均有 bundle 锚点）

**declare 转换：27 条语句**（19 条 lane4 census 内 lexical 名 + 8 条命令 + 1 座本地接口删除）；**保留：1 条**（reportLexicalInputTelemetry）。Composer.tsx diff **+45/−118**。新增 @ts-expect-error/@ts-ignore/as any：**0**（git diff 全量审计）。

### 最小调用面修正（4 处）

1. **`$applyNodeMutation` → `$applyNodeReplacement` + 返回值收口**（createMentionNode，Composer 原 2416）：bundle hV@styles 64633 实为 `return (t.setMode('token'), LR(t))`——逗号表达式返回 `LR(t)` 而非 `t`；`LR`@61025 即 `$applyNodeReplacement`（体含错误码 200/201/202/203 = 0.42.0 core 该函数专属码；`$applyNodeMutation` 在 0.42.0 导出面与 bundle 全文均不存在，系重建期误名）。`$applyNodeReplacement<T>(node: T): T` → 返回型 PromptMentionNode 不变。
2. **PromptMentionNode.exportJSON 去 `: Record<string, unknown>` 注解**（原 2377）：真实基类 `TextNode.exportJSON(): SerializedTextNode`，`Record<string, unknown>` 对其不协变；bundle mV@styles 64595 本无注解，去注解后推断面（SerializedTextNode 展开 + `type: 'prompt-mention'` 覆写）协变兼容，调用面零改动。
3. **parseEditorState 参数面 `unknown` → `string | SerializedEditorState`**（3 处：applyEditorStateJson GV、E2ELexicalBridgePlugin 桥接闭包、ComposerEditorApi.setEditorStateJson 接口）：0.42.0 `LexicalEditor.parseEditorState(maybeStringifiedEditorState: string | SerializedEditorState)` 实面；消费方 Home.tsx 恒传 string（storedDraft.editorStateJson），零改动。
4. **`type` 修饰导入**（LexicalEditor/EditorState/RangeSelection/SerializedEditorState）：0.42.0 index.d.ts 中四者为 `export type`，Lexical.mjs 无对应运行时导出（esbuild 报 No matching export 实证）；TextNode 为运行时类（extends 需要），保持值导入。

### 真实类型面兼容性核验（0.42.0 d.ts 逐项，全通过，零额外改动）

- `editor.registerCommand(cmd, listener, 4|3|1)`：`CommandListenerPriority = 0|1|2|3|4`、`CommandListener<P> = (payload, editor) => boolean`，8 处注册面（含 `event?.preventDefault()` 可选链对 `KeyboardEvent | null` 载荷）逐处吻合。
- `initialConfig`：`{namespace: 'ChatInput', theme: {paragraph: 'm-0'}, nodes: [PromptMentionNode], onError: (error: unknown) => …}` 对 `InitialConfigType`（namespace/onError 必填、theme: EditorThemeClasses、nodes: Klass<LexicalNode>[]）全吻合（onError 参数 unknown ⊇ Error 逆变成立）。
- `<LexicalContentEditable className data-testid onFocus {...placeholderProps}>`：`ContentEditableProps = Omit<ContentEditableElementProps,'editor'> & ({'aria-placeholder'?: void; placeholder?: null} | {'aria-placeholder': string; placeholder: JSX.Element|fn})`；placeholderProps 双分支联合对双分支联合目标逐支可赋。
- `ErrorBoundary={PassthroughErrorBoundary}`：`ErrorBoundaryType = ComponentClass|FC<{children: JSX.Element; onError}>`，PassthroughErrorBoundary `{children?: ReactNode}` 参数面逆变兼容。
- PromptMentionNode extends 真实 TextNode：`__text/__key` 公开字段、`static clone/importJSON`（方法双变）、`createDOM(config: unknown)`/`updateDOM(prevNode: this)` 覆写、`setMode('token')`: TextModeType、`constructor(payload, key?)`（构造器不参与覆写检查）逐项通过。
- `readEditorText(editor: LexicalEditor | LexicalEditorState)` 联合 `.read()` 调用、`getStartEndPoints(): null | [Point, Point]` 的 `?? []`、`setTextNodeRange/insertNodes/insertText/removeText/selectEnd/selectNext/getAllTextNodes/registerUpdateListener/registerRootListener` 全部与 0.42.0 d.ts 吻合。

## 五、tsc 增量（gate b）

| 时点 | errors | 说明 |
|---|---|---|
| 基线 /tmp/tsc-now15.txt | 2 | TopBar S4 stub ×2 |
| tombstone 首版（`KEY_*` 后随斜杠误闭合块注释） | 57 | 语法错——未交付，即修（改写为 `KEY_x`） |
| 转换完成后（终态） | **2** | 与基线逐条 diff **完全一致**（同文件同行同文案） |

无任何文件 error 数增加。

## 六、Gate 结果（全部通过）

- **a. esbuild**：Composer.tsx transform（`--loader:.tsx=tsx --jsx=automatic`，esbuild 0.25.x）**0 errors**；探针 bundle（本批全部 26 个导入名，包内解析）：默认模式 737KB 成功、`--define:process.env.NODE_ENV="production"` 模式成功且复现 `0.42.0+prod.esm` ×2 + `Minified Lexical error` 指纹；Composer 全量 bundle 的既有错误（LazyPreviewViewers 3 条懒 chunk 解析 + MarkdownVendored 导出缺口）经对照为 S3-b 已登记的未重建区既有错，本批零新增。
- **b. tsc 总量**：2 = 基线 2，逐条一致（§五）。
- **c. ground truth md5**：`src-HCld2afU.js` = `f5edd6a1207c6d20008204829dad3923` ✓ · `styles-CdEGpc2x.js` = `48d71d4874b0868d61fd35a328bf6ad5` ✓。
- **d. git 作用域**：改动 = modules/Composer.tsx + package.json + package-lock.json，全部位于 `desktop/src/src/`；`?? web/` 与 `?? desktop/src/src/A0-S4-PLAN.md`（22:27 生成，批前既有）为批前状态；A0-PROGRESS.md / src-reconstructed/ / out/ 零触碰。

## 七、版本登记表（供 A0-PROGRESS.md S3 台账录入）

| 库 | 钉版 | 状态 | 落点 |
|---|---|---|---|
| lexical | 0.42.0 | ✅ landed | Composer.tsx（bundle 双版本串锚定；19 条 lexical declare → import；台账 latest 0.49.0 与 bundle 不符，以 0.42.0 为准） |
| @lexical/react | 0.42.0 | ✅ landed | Composer.tsx（Composer/RichTextPlugin/ContentEditable/HistoryPlugin/useLexicalComposerContext 五子路径；导出名差异以语义别名保留） |

## 八、S3 全局状态（a–d 收尾）

| 子批 | 库 | 状态 |
|---|---|---|
| S3-a | zod 4.3.6 · qrcode 1.5.4 · @tanstack/react-virtual 3.14.10 · @stripe/stripe-js 9.6.0 · @stripe/react-stripe-js 6.4.0 · @xterm/xterm 5.5.0 · @xterm/addon-fit 0.10.0 | ✅ landed |
| S3-a | react-resizable-panels | ⏸ deferred（整库：需 X4/Z4/Q4 封装重建 + 运行时验证） |
| S3-b | lucide-react 1.35.0 | ✅ landed（429 条 declare；62 条保留逐条登记） |
| S3-c | @radix-ui/* 12 包 + cmdk 1.1.1 | ✅ landed（348 条 declare；8 条保留逐条登记） |
| S3-d | lexical 0.42.0 + @lexical/react 0.42.0 | ✅ landed（27 条 declare；1 条第一方保留） |

**S3 结论**：lane-4 vendored→npm 四子批收官。landed 22 库（全部 exact 钉版、版本经 bundle 指纹/版本串锚定）；deferred 1 库（react-resizable-panels，S3-a 裁决整库回退）。保留 declare 均为逐条登记项（S3-b 62 + S3-c 8 + S3-d 1 + S3-a 残留），属 first-party 深部（S4 目标）或证据冲突待运行时核验，无未登记遗留。

## 九、遗留事项（移交后续批次）

1. **reportLexicalInputTelemetry**（Composer.tsx:838）：第一方遥测 declare，S4 实体化时处置。
2. **lexical 主题类串**：LEXICAL_CHAT_INPUT_THEME 仅 `{paragraph: 'm-0'}`（bundle CYe@66666 同面），样式面沿用 bundle 派生全局样式，未额外接线。
3. A0-PROGRESS.md L42「lexical（latest 0.49.0）」条目可按 §七 更新为 **0.42.0 已裁决 landed**（本批未改该文件）。
