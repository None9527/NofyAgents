# legacy-doc 内部引擎 [E5]–[E7] 展开报告（批次 B · 后半：缩略图常量/编辑器核心/页面渲染器）

- 输入（未修改）：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js`（47,538 行）
- 对照（行号口径）：`src-reconstructed/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx`（36,535 行 pretty-print 版；**所有行号锚点均指 jsx**）
- 上游登记：`src-reconstructed/modules/OfficePreview.report.md`（[E1]-[E7] 锚点出处；本批未改动该共享报告）
- 并行约束：[E1]-[E4] 由批次 A（LegacyDocEngineA*）并行展开；本批仅产出 `LegacyDocEngineB*` 六文件，未触碰共享文件（`previewPaneOfficeLegacyDocContent.tsx` / `OfficePreview.report.md` 的 mtime 与内容均非本批改动）。

---

## 1. 产物清单

| 文件 | 行数 | 覆盖区段（jsx） | 内容 |
|---|---|---|---|
| `LegacyDocEngineBThumbnails.ts` | 337 | [E5] 14902-15113 | 缩略图常量层全量转录 |
| `LegacyDocEngineBModel.ts` | 2,694 | [E6] 15114-16815 | 模型类型 + 节点/选区/节/字体/剪贴板助手 |
| `LegacyDocEngineBLayout.tsx` | 1,942 | [E6] 16816-20230 | 行布局/浮动排除/断页标记/分页骨架/段落 CSS |
| `LegacyDocEngineBEditorState.tsx` | 2,453 | [E6] 24338-26660 | 编辑器状态机（原 tS；100 成员返回面） |
| `LegacyDocEngineBPageRegistry.tsx` | 890 | [E6] 26661-27339 | 页元素注册表 + 缩略图快照 + 节段渲染器（原 TS） |
| `LegacyDocEngineBPageRenderer.tsx` | 934 | [E7] 27340-36416 | 页面渲染组件（原 ES = DocxEditorView） |

合计 9,250 行重建代码。依赖方向：Thumbnails ← Model ← Layout ← (EditorState / PageRegistry) ← PageRenderer，无环。

---

## 2. 段清单（[E?] → 语义名 → 行号 → 符号数）

符号数 = 区段内顶层声明（var 链/函数）按混淆名逐一清点；括号内为重建口径。

| 段 | 语义名 | jsx 行 | 符号数 | 重建口径 |
|---|---|---|---|---|
| [E5] | 缩略图常量层（排除标记/高亮色板/标题样式/布局常量/性能标记/编辑器核心常量簇/缓存簇） | 14902-15113 | 106（顶层声明 8 处，含 var 链成员 106） | **全量逐句转录** |
| [E6]a | 文档模型与节点助手（标题/首字下沉/信头/DOM 选区/菜单表/OPC 字体/分节页码/页眉页脚核算/分页身份/表格选区/起始模型/谓词族） | 15114-16815 | 148 | 全量语义重建（逐句对照为主） |
| [E6]b | 行布局与分页（浮动几何/排除带/表单域测量/断页标记族/分节集合/分页主函数/段落 CSS/run CSS） | 16816-20230 | 270 | 逐句转录为主；测量原语族（lh/uh/Ns/Ms/zh/lg/Tg）与分页主循环内层按锚点登记 |
| [E6]c | 渲染助手与编辑器 reducer（制表/脚注标记/段落渲染器 Tv/编号标签/边框预设/修订标记/选区同步/Gx reducer） | 20944-24337 | 195 | **锚点登记**（接口面已还原：本批以 declare 契约对接） |
| [E6]d | 编辑器状态机（原 tS：状态核/25 组状态/80 命令/100 成员返回面） | 24338-26660 | 1（函数体 2,323 行） | 全量语义重建；3 个超长命令体按语义归纳（锚点注明） |
| [E6]e | 页注册表与缩略图快照（原 nS..wS）+ 节段渲染器（原 TS） | 26661-27339 | 20 | 全量语义重建（TS 的手柄 JSX 浓缩，行为面完整） |
| [E7] | 页面渲染组件（原 ES = DocxEditorView：分页 memo 链/虚拟化页窗/页面结构/批注槽/右键菜单） | 27340-36416 | 1（函数体 9,077 行） | props/状态骨架/分页链/最终 JSX 全量；交互回调簇 ~6,300 行锚点登记 |

---

## 3. 每文件把握度

口径：**高** = 逐句对照转录并过严格类型检查；**中** = 结构/语义完整但局部细节经归纳；**登记** = 锚点级登记（签名/职责/边界已核实，逐行实现待补全）。

### 3.1 LegacyDocEngineBThumbnails.ts —— 高

106 个符号全部逐句转录：`THUMBNAIL_EXCLUDE_ATTR`/死代码选择器（原 14903 裸表达式在 out/ js 21042 复核确为无赋值语句）、8 色高亮色板、标题 1-6 级双样式表（CSS 版 Qs + 度量版 $s）、22 项布局常量、性能标记三助手（消费方 tS 24843-24871 逐一对上）、48 项编辑器核心常量（含 9 组断页正则与 14 座缓存）、键集 2 座、`boundedCacheSet`（FIFO 淘汰 4000 容量）、`normalizeRowHeightPx`。

### 3.2 LegacyDocEngineBModel.ts —— 高（少量中）

148 个符号：模型类型体系（节点/run/表格/节/位置/范围，含 `[key: string]: unknown` 开放尾以对齐公共层 `DocxModel`）、`parseDropCap`（framePr 全属性）、信头三判定、`floatingImageGeometry` 前置的页眉/页脚浮动图核算链（Ed..Fd）、`resolvePageBodyHeight`、分页身份键/节度量/脚注三轮迭代分页（Xd）、起始模型（pf 数据逐字）、节点谓词族 30 余式。
**中**：`nodeHasHeavyContent`/`textDuplicatedInTextBox` 等长分支按原控制流归纳（分支条件逐一保留）。

### 3.3 LegacyDocEngineBLayout.tsx —— 高 + 登记

270 个符号中逐句转录约 230：浮动图几何（Jp 全量）、段落浮动布局（Yp/Xp 全量）、表单域测量族（启发式字宽字符权重表逐字）、断页标记族（wm..Rm 缓存五合一）、分节集合（Bm..Wm）、高亮色/行高/缩进/编号缩进（c_ 三路归并全量）、段落 CSS 构建器（d_ 全量）、run CSS（__/v_/b_/x_ 全量）。
**登记**：测量原语族（lh/uh/ch/Ns/Ms/Nh/Fh/Lh/Rh/zh/lg/Tg，jsx 18106-19189）、分页主函数内层循环（Mg jsx 19230-19541——外层骨架/参数面/测量回灌已还原，逐节点推进算法登记）。

### 3.4 LegacyDocEngineBEditorState.tsx —— 高（命令体少量中）

tS 全量语义重建：状态核（reducer + 5 分片提交器）、25 组 useState/30 余 refs、副作用链（光标归一广播/历史恢复/字体加载/快捷键）、全部 80 个命令回调、**100 成员返回面与原 jsx 26554-26659 逐一对照**。
**高**：状态机结构、导入管线（性能埋点/中止/回退）、撤销重做、修订/批注四命令、表单域族、表格结构族、文本提交族。
**中**（语义归纳 + 锚点）：`replaceExpandedSelection`（原 ~190 行，主路径保留、链接继承/空表清理分支登记，锚点 25196-25386）、`applyBorderPreset`（三分支登记，锚点 25456-25548）、`toggleList`（光标补偿登记，锚点 25575-25644）。

### 3.5 LegacyDocEngineBPageRegistry.tsx —— 高

20 个符号全量：页注册表五路差量发布（内容键/尺寸/缩略图/越界清理/监听通知）、缩略图 run 预算合并（28 run/900 字符/120 字符单元格预算）、段落/表格缩略图元素（≤220 单元格、≤4 图占位）、逐页快照（含图页跳过策略）、节段渲染器 TS（段落草稿宿主 + 表格手柄行为面）。
**中**：TS 的表格缩放/移动手柄 JSX 细节浓缩（锚点 27144-27339），事件回调名与触发条件完整。

### 3.6 LegacyDocEngineBPageRenderer.tsx —— 中 + 登记

props 22 项契约（与公共层 `DocxEditorViewProps` 逐字段对齐）、~60 组状态骨架、节/几何/度量 memo 链（Bn→Hn→Un→Wn→逐节点三映射→Zn→Qn）、分页仲裁链（纯估算仲裁/声明页数收敛/缩放仲裁三段全量）、最终 JSX 结构（根容器 `data-testid="docx-editor-viewer"`、初始遮罩、导入错误横幅、前后页窗占位、页包装/页表面/封面层/边框层/页眉/正文/页脚/批注槽/右键菜单，data-* 属性逐字）。
**登记**（~6,300 行交互回调簇，锚点见文件 §3）：节点渲染器 fs、指针/键盘/拖放/粘贴、页眉页脚编辑会话、图片浮动交互、测量回灌循环、虚拟化细节。

---

## 4. 公共契约对接（不破坏）

1. **类型兼容**：`LegacyDocEngineBEditorState.tsx` 尾部静态断言 `createDocxEditor(...) → 公共层 DocxEditor`、`STARTER_DOCX_MODEL → 公共层 DocxModel` 编译通过（结构对齐：model/documentTheme/showTrackedChanges/trackedChanges/showComments/comments 全命中）。
2. **组件契约**：`LegacyDocEngineBPageRenderer.tsx` 的 `DocxEditorView` 以 `DocxEditorViewProps` 为签名（静态断言通过），内部经 `editor as DocxEditorState` 还原完整面——与公共层占位实现（`previewPaneOfficeLegacyDocContent.tsx` 190-199 行）同签名可直接替换。
3. **跨批边界**：[E4] 契约（Uo reducer 工厂/Mo 断页集/编号文本族/修订操作/序列化等）以 `declare` 登记于使用方，供批次 A 产出后接线；[E1]-[E3] 无直接依赖。
4. **未改动共享文件**：`previewPaneOfficeLegacyDocContent.tsx`（18:42 的修改来自并行批次 A，非本批）、`OfficePreview.report.md`（mtime 15:50，早于本批）。

## 5. 交叉验证

- 分页仲裁链与源一致：`Qn` memo 的三段仲裁（Ro 纯估算 27748 / 声明页数三候选 27758 / Bo 缩放 27843）逐一在源中核对；`documentPageCount`/`lastRenderedPageBreak` 提示路径与 `Bm`/`Em` 消费一致。
- tS 返回面 100 成员与 jsx 26554-26659 逐行对照（含 `syncPaginationInfo`——页注册表宿主键，`PageRegistry` 以其为 WeakMap 键与源一致）。
- 缩略图消费链核对：`Zs ← e_`（19875）、`Qs ← d_`（20052 合成段落回退）、`$s ← Xl/_S`（15134/26757）、`Ec/Dc/Oc ← tS 导入埋点`（24843-24871）。
- 死代码确认：14903 裸选择器表达式在 `out/` js 21042 同为无赋值语句（非 pretty-print 伪影）。

## 6. 验证记录

- esbuild 0.21.5（`--loader:.tsx=tsx --loader:.ts=ts --jsx=preserve --outfile=/dev/null`）：**6/6 解析通过**。
- tsc 5.6.3 `--noEmit --strict --target esnext --lib esnext,dom,dom.iterable --jsx preserve --skipLibCheck`（@types/react 18.3.31，/home/none/grok-build/web 环境）：**6 个文件 0 错误**。
- `out/` 未做任何修改（`ref-ui/zcode-restored/out` 等为 git 未跟踪目录，本批零写入）。

## 7. 后续建议

1. [E6]c 渲染助手区（20944-24337，195 符号：Tv 段落渲染器 572 行、zv 编号标签、边框预设族、Gx reducer 实例）按本批 declare 契约逐式补全——此为批次 A/B 接线后的首个缺口。
2. [E7] 交互回调簇（~6,300 行：fs 节点渲染器/指针/键盘/拖放/测量回灌）按 `LegacyDocEngineBPageRenderer.tsx` §3 锚点分批展开，建议顺序：测量回灌 → fs 节点渲染器 → 键盘 → 指针。
3. 测量原语族（lh/uh/Ns/Ms，jsx 18200±）与分页主循环内层（Mg 19230-19541）为布局保真度关键路径，展开后可移除 `paginateDocumentReconstructed` 的单页占位。
4. 装配接线：以 `LegacyDocEngineBEditorState.createDocxEditor` / `LegacyDocEngineBPageRenderer.DocxEditorView` 替换公共层的 `declare`/占位实现（一处 import 替换，签名已验证兼容）。
