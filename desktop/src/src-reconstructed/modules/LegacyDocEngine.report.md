# legacy-doc 内部排版引擎展开报告（B4 批次 · [E1]–[E4] 段）

- 输入（未修改）：`out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js`（47,538 行）
- 对照：`src-reconstructed/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx`
  （36,535 行 pretty-print + JSX 还原版；**所有行号锚点均指 jsx**）
- 前置登记：`OfficePreview.report.md`（D8 Stage B2，[E1]-[E7] 锚点登记于 §3.2）
- 公共层：`previewPaneOfficeLegacyDocContent.tsx`（B2 全量重建，本批未改动其代码，仅更新头注释登记状态）
- 产物：`src-reconstructed/modules/` 下 4 个引擎文件 + 本报告

---

## 1. 段清单（[E?] → 语义名 → jsx 行 → 符号数 → 产物）

段语义名按**实际代码职责**核定（任务指示“按实际职责命名”）；与 B2 登记表的粗标签差异见 §5。

| 段 | 语义名（实际职责） | jsx 行 | 登记符号数 | 产物文件 | 重建行数 | 把握度 |
|---|---|---|---:|---|---:|---|
| [E1] | Unicode BiDi 与断词引擎（UAX#9 级别子集 + Intl.Segmenter 词切分管线：标点粘着/URL/数字/NBSP 粘合/CJK 禁则） | 10303-11176（登记 10305 起；10303-10304 为 Ee/De 数据表） | ≈83 | `LegacyDocEngine1.tsx` | 1,237 | 高 |
| [E2] | 文本测量与断行布局（canvas 测量缓存/表情过绘修正/怪癖探测 + 宽度表构建 + 双路径断行行走器 + 行文本提取） | 11177-11846（登记尾界 11993 中 11847-11993 为 jsx-runtime 句柄与 wasm 注册/导入管线，已在公共层 §1/§2 重建） | ≈71 | `LegacyDocEngine2.tsx` | 1,207 | 高 |
| [E3] | 字体脚本解析与段落 XML 编辑（OOXML 四脚本字体解析 + 轻量 XML 扫描器 + 修订接受/拒绝 + 批注插入 + 运行克隆族） | 12250-13243（登记 12253 起；12250-12252 为 yi/bi/xi 正则声明） | ≈71 | `LegacyDocEngine3.tsx` | 1,466 | 高 |
| [E4] | 文本编辑指令、分页与布局服务（段落/表格文本重设 + beforeinput 指令 + 分页提示/页数拟合 + 历史归约器 + LRU 行布局服务 + FNV 结构哈希） | 13244-14903（登记尾界 14901；14902-14903 = Xs 缩略图排除标记，登记表归本段） | ≈122 | `LegacyDocEngine4.tsx` | 2,169 | 高 |

合计：4 段 / 4,601 jsx 行 / ≈347 个混淆符号全量语义重建（无锚点级登记遗留）。

## 2. 依赖分层（无环）

```
LegacyDocEngine1（纯算法：BiDi + 断词；无外部依赖）
        ↑
LegacyDocEngine2（测量/断行；消费 E1 的 $t 令牌流与 Ae 段级 BiDi）
        ↑                                ↑
LegacyDocEngine3（模型类型 + 段落编辑；   LegacyDocEngine4（编辑指令/分页/布局服务/哈希；
 declare 挂接 chunk-YE7GQOST 克隆族）      消费 E2 测量 + E3 模型类型与段落助手）
```

外部挂接（`declare`，与公共层同策略）：
- `chunk-YE7GQOST-DVtn9d8T.js`：cloneParagraphNode(原 m)/cloneDocModel(原 h)/cloneTableNode(原 _)/newBlockId(原 v)
- `chunk-WKBPLHUA-Dg0DBfSj.js`：serializeDocxWithWasm(原 f=K)/packageToWireFormat(原 p=U)

## 3. 与公共契约的对接

- `previewPaneOfficeLegacyDocContent.tsx` 的公共契约（`createDocxEditor` declare / `DocxEditorView`
  占位 / `DocxModel` 宽接口 / `useDocxModel` / `DocxFitViewport` / chunk 导出）**未改动**；
  本批仅将其头注释中 [E1]-[E4] 的“接口级登记”更新为“已展开 → 文件指针”。
- 引擎侧 `DocxEditorModel`（Engine3）是公共层 `DocxModel` 的细化：
  `{ nodes: DocxBlockNode[]; metadata: { comments?; … } }` 结构上可赋值给公共层宽接口
  （`nodes: { type: string; blockId?: string; [key: string]: unknown }[]`），
  后续 [E6] 批次以 `DocxEditorModel` 实例化 `createDocxEditor` 时两侧兼容。
- `DocxEditorViewProps.editor`（`DocxEditor`）仍由 [E6] tS 重建批次落实；本批不改其占位。

## 4. 验证记录

- esbuild 0.21.5（`--loader:.tsx=tsx --jsx=preserve --outfile=/dev/null`）：
  4 个引擎文件 + 公共层文件全部解析通过。
- tsc 5.6.3 `--noEmit --strict --target esnext --lib esnext,dom,dom.iterable --jsx preserve
  --skipLibCheck --moduleResolution bundler --module esnext`（@types/react 18.3.31，
  typeRoots 指向 web/node_modules/@types）：**5 个文件联编 0 错误**。
- 行为冒烟（esbuild --bundle → Node 22，OffscreenCanvas 桩 8px/字符）：
  - BiDi：纯 LTR → null；LTR+希伯来混排级别 [0×6,1×3,0×6] ✓
  - 断词：标点粘着（`Hello,`/`world!`）、连字符数字拆分（`123-`/`456-`/`789`）、
    URL 合并止于 `?`（`…/path?`+`q=1`，与原管线 Mt→Nt 次序一致）、NBSP 粘合、
    pre-wrap 硬换行分块、CJK 禁则（`你好，`/`世界。`/`「测试」`）✓
  - 断行：80px 容器 2 行、行宽 80、首行文本含尾空格、`_r` 不改动调用方游标
    （调用方须取 `fragment.end` 前进，与原语义一致）✓
  - XML 扫描：嵌套配对/属性读取/实体解码往返/祖先序（内→外）✓
  - `prepareParagraphEdit` 对无凭证段落正确返回 `stale`（原 $i 校验语义）✓
  - 输入指令：`deleteWordBackward`/整行删除/组合态不映射 ✓；
    前后缀 diff（`Hello brave world` 插入段继承前运行样式）✓
  - 分页：表格行分页集 `[1]`、节点分页集、`Bo` 缩放搜索 15 次构建调用后按原
    回退路径返回初始页数 ✓；布局块 2 行/高 40/命中测试/光标矩形 ✓
- `out/` 未做任何修改（`git status out/` 干净）；全部产物位于 `src-reconstructed/modules/`。

## 5. 与 B2 登记表的标签差异（按实际职责更正）

| 段 | B2 登记标签 | 实际职责核定 |
|---|---|---|
| [E2] | 文本测量与行布局 | 与登记一致；尾界修正为 11846（11847-11993 属公共层已重建的 wasm/导入管线） |
| [E3] | 脚本/字体启发式 | 仅覆盖本段前 90 行（12250-12342）；主体为轻量 XML 扫描器（12343-12551）与段落级安全编辑：修订接受/拒绝、批注插入/解决、凭证校验（12552-13243） |
| [E4] | DOCX XML → 编辑器模型（字段正则 + 段落/表格/编号转换） | 字段正则（Ia/La）实为源 XML 文本补丁的安全子集探测；本段主体是编辑器**文本编辑指令层**（段落/表格文本重设、beforeinput 映射）、**分页提示与页数拟合**、**历史归约器**、**行布局服务**与**结构哈希**。真正的“XML → 模型”转换（parseDocx/buildDocModel）在 [V2] 动态 chunk（src-2FP7IUE6/src-AEHDFCS5），B2 已登记 |

## 6. 剩余段登记（本批之外）

### 6.1 并行批次（B4-B）已覆盖（据其文件头声明，本批不重复展开）

| 文件 | 覆盖 |
|---|---|
| `LegacyDocEngineBLayout.tsx` | [E6] 中段 jsx 16816-20230（浮动几何/排除带/表单域测量/断页标记/分节集合/分页主函数/段落 CSS） |
| `LegacyDocEngineBEditorState.tsx` | [E6] tS 编辑器状态机 jsx 24338-26660 |
| `LegacyDocEngineBPageRegistry.tsx` | [E6] 尾段 jsx 26661-27339（页元素注册表/缩略图快照/节段渲染器） |
| `LegacyDocEngineBPageRenderer.tsx` | [E7] ES=DocxEditorView jsx 27340-36416 |

### 6.2 尚未展开（接口级登记状态维持）

| 段 | 内容（抽样核定） | jsx 行 | 规模 |
|---|---|---|---|
| [E5] | 缩略图：Zs 高亮色表起，Ec/Dc/Oc/Wl/Gl 快照辅助（`Gl` 亦为 [E6] 前导） | 14904-15113 | ≈210 行 |
| [E6] 前段 | 编辑器核心前段：Kl/ql/Jl/Yl/Xl/Zl/Ql/$l/eu/tu/nu/ru… 编号/列表/字体表/样式准备（142 个函数） | 15114-16815 | ≈1,700 行 |
| [E6] 后段 | 编辑器核心后段：C_/w_ 样式解析起，命令/选区/历史接线（235 个函数） | 20231-24337 | ≈4,100 行 |

> 注：[E6] 中段与尾段、[E7] 已由 6.1 的 B 批文件声明覆盖；若该批最终落库口径有变，
> 以各文件头声明的 jsx 锚点为准。

## 7. 后续建议

1. [E5] 与 [E6] 前后两段（合计 ≈6,000 行）按本批同法展开：
   E6 前段宜并入 `LegacyDocEngine3/4` 的模型/编辑族，E6 后段与 B 批 EditorState 对接。
2. 引擎注入点接线：`cloneDocModel` 族 declare 在应用装配处绑定 chunk-YE7GQOST 真实导出
   （该 chunk 483 行，可按需全量重建为独立模块）。
3. 冒烟桩可固化为回归脚本：本批 `/tmp/b4/smoke*.mjs` 用例对断词/断行/XML 编辑的
   行为锚点值得保留。
