# i18n 动态键消费点全域落定报告（ZCode 3.7.6 · D8 Stage B5-13）

- 输入（只读）：`desktop/src/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，主口径）、`index-ABImDspU.js`（入口）、其余 755 个 renderer chunk、`renderer/index.html`、`renderer/process-monitor.html`、`preload/*.cjs`、`main/*.js`、`host/*.js`、`scheduler/index.js`；词典基线 `IntlProvider-C321H7m8.js`（zh 48–4564 / en 4565–9085）。
- 对照：`I18n.report.md` §4（行 179-180 两类表）与 §7 行 232-233 两项遗留任务、`MODULE-MAP.md` §1/§2.3。
- 口径：`out/` 全程只读（前后 md5 抽验，§5 锚点 A0）；本批为分析批，验证门禁以锚点证据替代 esbuild/tsc。
- 结论摘要：**六前缀 109 个词典 key 中 74 个落定消费点、35 个证伪为孤儿**；`postUpdateReleaseNotes.*` 文案消费点**证伪**（IPC 链存在但 UI 改为静默确认）；`forceUpdate.*` 7 键**证伪**（唯一命中为 React 内部 API 同名误报）。

---

## 1. 六前缀消费点总表

全域穷举方法：① 全 757 个 renderer chunk 逐前缀 `grep -l` 定文件（§5 锚点 A1）；② 非 styles 命中逐条甄别误报（shiki 语法 scope、VS Code 主题色键、SVG/HTML 属性表、`transforms.` 子串、KaTeX 散文，§5 锚点 A2）；③ styles 内逐点读上下文定归属族。结果：**六个前缀的消费点全部且仅位于 `styles-CdEGpc2x.js`**（融合主 chunk）；入口 chunk 与 5 个用量图/Office 预览消费 chunk（I18n.report §5 登记的 7 家）均不触及六前缀。

### 1.1 `mode.*`（词典 47 key；消费 44，孤儿 3）— 归属 F08（接线）/F12（行包络）/F15（复用）

动态机制 = **查表**：两张 provider×mode 二维表把选项值映射为完整 key 字符串，再经 `formatMessage({ id: 变量 })` 消费。

| # | chunk:行 | 表达式 | 键空间 | 归属 |
|---|---|---|---|---|
| 1 | styles:75972–76001 | `V4e = { claude: { auto: \`mode.label.claude.auto\`, … }, codex/gemini/opencode/glm… }` | `mode.label.*` 22 key（claude 6/codex 5/gemini 4/opencode 2/glm 5） | 键空间定义表 |
| 2 | styles:76003–76032 | `H4e = { … }` 同构 | `mode.description.*` 22 key | 键空间定义表 |
| 3 | styles:76885 | `R3e(e,t) = e ? (V4e[e]?.[t.value] ?? null) : null` | label 查表 | 助手 |
| 4 | styles:76888 | `z3e(e,t) = e ? (H4e[e]?.[t.value] ?? null) : null` | description 查表 | 助手 |
| 5 | styles:76880–76882 | `L3e`: `let r = R3e(t,n); return r ? e.formatMessage({ id: r }) : n.name;` | label 动态 id 消费 | 助手 |
| 6 | styles:76893–76896 | `B3e`: `let i = z3e(t,r); return i ? e.formatMessage({ id: i }) : r.description;` | description 动态 id 消费 | 助手 |
| 7 | styles:76890–76891 | `jq(e,t,n,r) = n.category==='mode' ? L3e(e,t,r) : r.name` | label 分派 | 助手 |
| 8 | styles:77162–77164 | `X3e`: `G3e[Nq(r.value)]` 命中则 `formatMessage({id:i})`，否则回落 `jq(...)`（`G3e`@77095 为 `chat.toolbar.thoughtLevel.value.*` 表，非本前缀） | mode label 回落路径 | 助手 |
| 9 | styles:76957 | `Mq` 触发器标签 `E = T ? jq(g, m, e, T) : String(e.currentValue ?? '')` | label 渲染 | `Mq` ConfigSelect（76912–~77170） |
| 10 | styles:77014–77015 | 选项行 `r = jq(g,m,e,t); i = B3e(g,m,e,t)` | label+description 渲染 | `Mq` 选项列表 |
| 11 | styles:77053 | 选项 span `children: jq(g,m,e,t)` | label 渲染 | `Mq` 选项列表 |
| 12 | styles:89321（`qrt`@89306 内） | `(0, $.jsx)(Mq, {…})` | — | **F08 Composer 工具条模式选择器**（F08 备注「mode.* 权限模式选择亦在此接线」；行落在 F12 包络 77080–90180 内） |
| 13 | styles:135963（`YMt`@135593 内） | `(0, $.jsx)(Mq, {…})` | — | F15 自动化编辑器（模式选择复用） |
| 14 | styles:138184（`kNt`@137022 内） | `(0, $.jsx)(Mq, {…})` | — | F15 自动化编辑器 |

选项数据源：`{ id: Dge('mode'), category: 'mode', type: 'select', currentValue: Lge(e.mode.current), options: Rge() }` @24470–24475（命令队列运行时配置面）。
**孤儿 3**：`mode.default`/`mode.plan`/`mode.acceptEdits` —— 全 chunk 无字面引用、无 `` `mode.${` `` 模板（唯一 `` mode.${ `` 模板为 `settings.${e}.import.mode.${t}`@194127，属 settingsSync 前缀）、无拼接；判为旧版无 provider 限定模式选择器遗留键。

### 1.2 `forms.*`（词典 17 key；消费 1，孤儿 16）— 归属 F06

| # | chunk:行 | 表达式 | 键空间 | 归属 |
|---|---|---|---|---|
| 1 | styles:201208–201211（`G0t`@201148 内） | `n.formatMessage(\n { id: \`forms.validation.fileExists\` },\n { fileName: … }.md\`)`（**多行静态调用**——I18n.report §4 静态口径为单行直写，故此点被计入"130+ 动态/多行"而未入静态表） | 1/17 | F06 子智能体/命令编辑器保存路径（写 `.md` 文件冲突提示） |

**孤儿 16**：`forms.labels.*`(4)/`forms.placeholders.*`(3)/`forms.validation.*` 除 fileExists(9)。同区表单实际消费 `settings.subagents.form.*` 键族（197568–197774：`name.label`/`color.label`/`systemPrompt.label`/`validation.nameLength`…），`forms.*` 为被取代的平行键族。甄别：`forms\.` 在 styles 另 3 处命中均为 Lexical `transforms.` 子串误报（60319/60353/71646）。

### 1.3 `appError.*`（词典 11 key；消费 11）— 归属 F07（`l4` 壳 + `ekt` ErrorBoundary）

动态机制 = **绕过 formatMessage 的词典直查**（故 `formatMessage({id:` 普查漏计）：

```
styles:129743  function f4(e) { return (XOt() === `en-US` ? Ue : Ve)[e] ?? e; }
```

`Ue/Ve` = IntlProvider 导出的 en/zh 词典（MODULE-MAP §3）；`XOt`@129731–129742 为不依赖 React context 的 locale 裁决（localStorage→navigator 兜底）——错误边界在崩溃态不可依赖 Provider。

| # | chunk:行 | 表达式 | 键 | 归属 |
|---|---|---|---|---|
| 1 | styles:129758 | `f4(\`appError.unknown\`)` | unknown | `QOt`@129749 全屏错误回退 |
| 2 | styles:129760–129761 | `(0, $.jsx)(l4, { title: f4(\`appError.title\`) …})` —— **错误窗复用 `l4` 次级窗口壳** | title | `QOt`（F07 `l4`@129647） |
| 3 | styles:129776 / 129780 / 129789 / 129794 / 129800 / 129808 | `f4` × title/description/retry/reload/hint/details | 6 key | `QOt` |
| 4 | styles:129831 / 129845 / 129858 / 129870 / 129874 / 129887 / 129894 / 129900 / 129908 | `f4` × unknown/sectionTitle/sectionRetry(×2)/sectionDescription/reload/sectionHint/details(×2) | 7 key（含复用） | `$Ot`@129822 区域错误边界（`ekt`@129920 同族，F07 包络 129647–132305） |

11/11 全消费，无孤儿。I18n.report §4 将 appError 列入"动态选 key"类系口径所致（无 `formatMessage({id:` 字面），实际为**静态字面 + 词典直查**。

### 1.4 `notification.*`（词典 11 key；消费 8，孤儿 3）— 归属 F03（交互通知）+ F07（工作区完成通知）

动态机制 = **formatMessage 作为参数传入建造器**（`n({ id: 变量 })` 回落）+ 平台分发：

| # | chunk:行 | 表达式 | 键 | 归属 |
|---|---|---|---|---|
| 1 | styles:117238–117240 | `e0(e,t,n)`: `r ? n({ id: \`notification.taskWithTitle\` }, { title: r }) : n({ id: t })` | taskWithTitle + **变量回落 id** | 建造器助手 |
| 2 | styles:117247–117248 | `Wxt`: `n({ id: \`notification.completed\` })` / `e0(e.title, \`notification.completedBody\`, n)` | completed/completedBody | `Wxt`@117242 |
| 3 | styles:117253–117254 | `n({ id: \`notification.error\` })` ×2 | error | `Wxt` |
| 4 | styles:117287–117288 | `r({ id: \`notification.permissionRequired\` })` + `e0` 回落 | permissionRequired | `Jxt`@117275 |
| 5 | styles:117295–117296 | `planApprovalRequired` / `planApprovalBody` | 2 key | `Jxt` |
| 6 | styles:117302–117303 | `inputRequired` + `e0` 回落 | inputRequired | `Jxt` |
| 7 | styles:117320–117322 | `$xt`: `e.showTaskNotification(t)`（平台 IPC，入口桥 index:394 `window.zcode.showTaskNotification`） | 分发 | `$xt`@117320 |
| 8 | styles:117331（hook `eSt`）→ 调用点 186653（`XJt`@186515 内） | `Gxt` 相位差→`Wxt`→`$xt`；`formatMessage: re.formatMessage`（useZCodeIntl） | completed/error 链 | **F07 工作区根控制器** |
| 9 | styles:117394（hook `tSt`）→ 调用点 117618（`pSt`@117599 内） | `Yxt` 待交互→`Jxt`→`$xt`；`formatMessage: c.formatMessage`（`G()`） | permission/plan/input 链 | **F03 会话编排**（`pSt` 交互钩子） |

**孤儿 3**：`notification.command`/`notification.file`/`notification.taskWaiting` —— 全 bundle 无命中（命令/文件明细文案与"等待确认"标题在 3.7.6 未接线）。

### 1.5 `taskTimeline.*`（词典 8 key；消费 8）— 归属 F01（侧栏分组）+ F17（远控任务列表）

动态机制 = **模板拼接** `` `taskTimeline.${e.kind}` ``：

| # | chunk:行 | 表达式 | 键空间 | 归属 |
|---|---|---|---|---|
| 1 | styles:140366–140379 | `uPt`: kind ∈ {today, yesterday, daysAgo, thisWeek, lastWeek, thisMonth, lastMonth, older} | 分桶 | 助手 |
| 2 | styles:140381–140384 | `dPt`: `e.kind==='daysAgo' ? { id: \`taskTimeline.daysAgo\`, values: {days} } : { id: \`taskTimeline.${e.kind}\` }` | 8/8（1 静态分支 + 7 模板） | 描述符建造器 |
| 3 | styles:141215–141222（`BPt`@140726 内） | `let t = dPt(e.label); … m.formatMessage({ id: t.id }, t.values)` | 模板消费 | **F17 Web 远控主视图**（邻 `webRemoteControl.noTasks`@141211） |
| 4 | styles:152712–152721（`HRt`@152293 内） | `let t = e.label ? dPt(e.label) : null; … u.formatMessage({ id: t.id }, t.values)` | 模板消费 | **F01 侧栏分组任务列表**（`yk/bk` 折叠组头） |

分组源 `pPt`@140394 被 140781（BPt）与 152394（HRt）复用。8/8 全消费。

### 1.6 `usage.*`（词典 6 key；消费 2，孤儿 4）— 归属 F12（用量仪表盘，F06 包络内）

动态机制 = **双模板按错误分类选键**：

| # | chunk:行 | 表达式 | 键空间 | 归属 |
|---|---|---|---|---|
| 1 | styles:195568–195578 | `Y$t` 凭据类错误正则表（token expired/invalid key/401/403/认证…） | 分类器数据 | 助手 |
| 2 | styles:195583–195585 | `Z$t(e,t,n)`: `X$t(n) ? e.formatMessage({ id: \`usage.error.${t}.credential\` }) : e.formatMessage({ id: \`usage.error.${t}.generic\` })` | 模板 ×2 | 助手 |
| 3 | styles:195603（`W7`@195587 内） | `Z$t(t, \`stats\`, e)` —— 运行时 `t` 仅 `'stats'` | stats.credential/stats.generic | `W7` 用量错误横幅 |
| 4 | styles:195684 / 195705（`e1t`@195646）/ 195900（`a1t`@195826） | `(0, $.jsx)(W7, { error })` ×3 | 渲染 | F12 用量视图（settings.usage 分区，187020–205679 包络内） |

**孤儿 4**：`usage.error.chatPlan.*`(2)/`usage.error.entitlement.*`(2) —— `Z$t` 唯一调用实参为 `stats`；`chatPlan|entitlement` 在 renderer 仅以服务/缓存标识出现（52314 `zcode:usage-entitlement:`、76208/88067 `entitlements` 数据字段），非 i18n 消费。用量图 chunk（AppUsageDailyModelBarChart 等 3 家 + usageStatsUiParts）grep `credential|entitlement` 零命中。

### 1.7 计数汇总

| 前缀 | 词典 | 消费 | 孤儿 | 消费点（formatMessage/直查/模板构造） |
|---|---|---|---|---|
| mode | 47 | 44 | 3 | 表 2 + 动态 id 消费函数 3（L3e/B3e/X3e 回落）+ 渲染点 3（76957/77014/77053）+ 实例化 3（89321/135963/138184） |
| forms | 17 | 1 | 16 | 1（201210，多行静态） |
| appError | 11 | 11 | 0 | f4 直查 16 处（QOt 8 / $Ot 9，含复用） |
| notification | 11 | 8 | 3 | 建造器调用 11 处 + 变量回落 1（e0）+ hook 接线 2（186653/117618） |
| taskTimeline | 8 | 8 | 0 | 模板 1（dPt）+ formatMessage 2（141222/152721） |
| usage | 6 | 2 | 4 | 模板 2（Z$t）+ 渲染 3（W7 实例） |
| 合计 | 100 | 74 | 26 | — |

（合计行不含 §2 的 postUpdateReleaseNotes 2 + forceUpdate 7 = 9 孤儿；109 = 74 消费 + 35 孤儿。）

---

## 2. postUpdateReleaseNotes / forceUpdate 落定结论

### 2.1 `postUpdateReleaseNotes.*`（2 key）— **文案消费点证伪；IPC 链存在但 UI 改静默确认**

证据链（main → preload → renderer）：

1. **main**：通道常量 `PostUpdateReleaseNotes: "zcode:post-update-release-notes"` / `AcknowledgePostUpdateReleaseNotes: "zcode:ack-post-update-release-notes"`（main/chunk-FQMTTDFW.js:448-449）；状态 schema `pendingPostUpdateReleaseNotes`（:14098/:14146）与内容 schema `releaseNotesByLocale: partialRecord(locale, {title, markdown})`（:13867；host/chunk-O5YHTQBW.js:13569 同构）。main/host 内**无**活跃 send/invoke 处理点（常量与 schema 之外零引用）。
2. **preload**：`onPostUpdateReleaseNotes` 为事件订阅（带缓存回放 `pu`，index.cjs:17434-17443）；**`acknowledgePostUpdateReleaseNotes: s(async () => {}, …)` 为 no-op 桩**（index.cjs:17445）——renderer 的 ack 不发 IPC。
3. **renderer 入口**：`acknowledgePostUpdateReleaseNotes: (e) => window.zcode.acknowledgePostUpdateReleaseNotes(e)`（index-ABImDspU.js:458，I18n.report 已记）。
4. **renderer 融合 chunk**：根 effect（styles:213317-213337）`t.onPostUpdateReleaseNotes((e) => { J.info(\`[Root] 收到更新说明，改为静默确认\`, …); … t.acknowledgePostUpdateReleaseNotes(e.version) … })` —— 收到发行说明即**静默 ack，不渲染任何文案**。
5. 全域搜索 `postUpdateReleaseNotes.title|acknowledge` 字面：仅词典（IntlProvider 1061-1062/5582-5583）。次级窗口（`l4` 壳族 F07、process-monitor 窗）零命中。

**结论**：3.7.6 中发行说明对话框 UI 已被移除（日志自述「改为静默确认」），2 键为遗留词典条目；回填 §4 第二类并附本链。

### 2.2 `forceUpdate.*`（7 key）— **全键证伪（强制升级门 UI 未接线）**

- 甄别方法（沿用 I18n.report §4 示范）：`forceUpdate` 全域命中仅 **React 内部 API** `v.prototype.forceUpdate` / `enqueueForceUpdate(…, \`forceUpdate\`)`（react-BQLj9xdT.js:42-43）。
- 融合 chunk 与入口 chunk `grep -c forceUpdate` = **0**；preload/main/host/scheduler/次级窗口 html 均 0；带点形式 `forceUpdate\.` 在 renderer 仅词典。
- **结论**：`forceUpdate.title/description/currentVersion/minimalVersion/action.{check,reload,restart}` 7 键在 3.7.6 无消费点，属保留/未接线（强制升级门或在他端/后续版本）。

---

## 3. 与 I18n canonical 目录的差异清单

- **缺失键（消费点有、词典无）**：**0**。所有字面 key、查表值（V4e/H4e 44 值）、模板展开空间（`taskTimeline.${kind}` 7 值 + daysAgo；`usage.error.{stats}.{credential|generic}`）逐一存在于 zh/en 双目录。
- **孤儿键（词典有、全域无消费）35 个**：
  - mode 3：`mode.default`、`mode.plan`、`mode.acceptEdits`；
  - forms 16：`forms.labels.{color,description,name,systemPrompt}`、`forms.placeholders.{agentDescription,agentName,agentSystemPrompt}`、`forms.validation.{agentDescriptionHint,agentNameHint,agentSystemPromptHint,descriptionRequired,nameMaxLength,nameMinLength,namePattern,nameRequired,systemPromptRequired}`；
  - notification 3：`notification.command`、`notification.file`、`notification.taskWaiting`；
  - usage 4：`usage.error.{chatPlan,entitlement}.{credential,generic}`；
  - postUpdateReleaseNotes 2、forceUpdate 7（§2）。
- **口径修正**：`forms.validation.fileExists` 实有消费点（多行静态调用，§1.2），I18n.report §4 静态口径（单行直写）将其误归入"130+ 动态/多行"；`appError.*` 实为静态字面 + 词典直查 `f4`，非"动态选 key"。
- **相邻动态模式（登记备查，非本批六前缀）**：`` `settings.${e}.import.mode.${t}` ``@194127（settingsSync/F06）；offPeak 变量选键 `offPeak.notify.{completed|failed}.{title|body}`@186437-186448（`WJt`，F15/F07）；`G3e` thought-level 表@77095（`chat.*`）。

---

## 4. 建议回填 I18n.report §4 的条目文本

> **§4 第一类（动态选 key）行替换/细化建议**：
> - `mode`*(47)：消费点落定——查表 `V4e`(js 75972)/`H4e`(76003) → `L3e/B3e/X3e`(76880–77164) → `Mq` ConfigSelect(76912)，实例化于 Composer 工具条 `qrt`(89321, F08) 与自动化编辑器 `YMt/kNt`(135963/138184, F15)；44/47 消费，孤儿 `mode.default/plan/acceptEdits`。
> - `forms`*(17)：仅 `forms.validation.fileExists` 消费（201210，多行静态，F06 保存冲突）；余 16 键被 `settings.subagents.form.*` 族取代，移第二类。
> - `appError`*(11)：改记为「词典直查 `f4`(129743) 静态消费」，11/11，归属 F07（`QOt` 全屏回退经 `l4` 壳 129761；`$Ot` 区域边界）。
> - `notification`*(11)：建造器 `e0/Wxt/Jxt`(117238–117310) 经 hook `eSt`(→`XJt` 186653, F07)/`tSt`(→`pSt` 117618, F03) 消费 8 键；孤儿 `command/file/taskWaiting` 移第二类。
> - `taskTimeline`*(8)：模板 `` `taskTimeline.${kind}` ``(`dPt` 140384) 消费于侧栏 `HRt`(152712, F01) 与远控 `BPt`(141215, F17)；8/8。
> - `usage`*(6)：模板 `` `usage.error.${t}.credential|generic` ``(`Z$t` 195584) 运行时仅 `t='stats'`，经 `W7`(195587) 渲染于 F12 用量视图(195684/195705/195900)；2/6 消费，`chatPlan/entitlement` 4 键移第二类。
>
> **§4 第二类（无引用）行更新建议**：
> - `postUpdateReleaseNotes`*(2)：消费点**证伪**——IPC 链完整（main 通道 448-449；preload 订阅+no-op ack 桩 index.cjs:17434-17445；入口桥 index:458）但根 effect「改为静默确认」(styles 213317-213337) 不渲染文案；键为遗留。
> - `forceUpdate`*(7)：**证伪**——唯一命中为 React `Component.forceUpdate`(react-BQLj9xdT.js:42-43) 同名误报；融合/入口/次级窗/preload/main/host 零消费，强制升级门未接线。
> - 新增孤儿并入：`mode.default/plan/acceptEdits`、forms 16、`notification.command/file/taskWaiting`、`usage.error.{chatPlan,entitlement}.*`。

---

## 5. 证据附录（锚点摘录）

- **A0 · out/ 只读基线**：`MD5(styles-CdEGpc2x.js)=48d71d4874b0868d61fd35a328bf6ad5`；`MD5(index-ABImDspU.js)=14b63cc11e827a4297bc157ffd2cf3e2`（分析前记录，分析全程只读）。
- **A1 · 全域定文件**：`grep -rln 'mode\.' *.js`（757 chunk）非误报命中仅 styles；`forms\.`→styles+chunk-BO2N2NFS(误报)；`appError\.`/`taskTimeline\.`/`usage\.error\.`→styles 唯一；`postUpdateReleaseNotes`/`forceUpdate\.`→assets 内零（词典外）。
- **A2 · 误报甄别**：`notification.background` 等=nord/andromeeda/one-light 主题色键；`support.constant.notification.cocoa`=objective-c 语法 scope；`mathematical.mode.numOctaves`=chart SVG 属性表；`transforms.`=Lexical(60319/60353/71646) 与 BO2N2NFS:14609；`quirks mode.`=katex 散文；`prototype.forceUpdate`=react-BQLj9xdT.js:42-43。
- **A3 · mode 查表**（styles:75972-75979）：`V4e = { claude: { auto: \`mode.label.claude.auto\`, … bypassPermissions: \`mode.label.claude.bypassPermissions\`, }, codex: { "read-only": … } … }`。
- **A4 · mode 动态消费**（styles:76880-76896）：`L3e`: `return r ? e.formatMessage({ id: r }) : n.name;`；`B3e`: `return i ? e.formatMessage({ id: i }) : r.description;`；触发器 76957 `E = T ? jq(g, m, e, T) : …`。
- **A5 · appError 词典直查**（styles:129743-129761）：`function f4(e) { return (XOt() === \`en-US\` ? Ue : Ve)[e] ?? e; }` … `(0, $.jsx)(l4, { title: f4(\`appError.title\`) …`。
- **A6 · notification 建造器**（styles:117238-117240）：`function e0(e, t, n) { let r = e.trim(); return r ? n({ id: \`notification.taskWithTitle\` }, { title: r }) : n({ id: t }); }`；接线 186653 `eSt({ …, formatMessage: re.formatMessage })`（`XJt`）与 117618 `tSt({ …, formatMessage: c.formatMessage })`（`pSt`）。
- **A7 · taskTimeline 模板**（styles:140381-140384）：`dPt`: `e.kind === \`daysAgo\` ? { id: \`taskTimeline.daysAgo\`, values: { days: String(e.daysAgo ?? 0) } } : { id: \`taskTimeline.${e.kind}\` };`；消费 141222 `m.formatMessage({ id: t.id }, t.values)`（`BPt`）/152721（`HRt`）。
- **A8 · usage 模板**（styles:195583-195586）：`Z$t`: `X$t(n) ? e.formatMessage({ id: \`usage.error.${t}.credential\` }) : e.formatMessage({ id: \`usage.error.${t}.generic\` });`；唯一实参 195603 `Z$t(t, \`stats\`, e)`。
- **A9 · forms 多行静态**（styles:201208-201211）：`n.formatMessage(\n { id: \`forms.validation.fileExists\` },\n { fileName: \`${t.name.replace(/^\//, \`\`)}.md\` })`。
- **A10 · 静默确认**（styles:213317-213329）：`t.onPostUpdateReleaseNotes((e) => { (J.info(\`[Root] 收到更新说明，改为静默确认\`, …), … t.acknowledgePostUpdateReleaseNotes(e.version) …`。
- **A11 · preload 桩**（preload/index.cjs:17445）：`acknowledgePostUpdateReleaseNotes: s(async () => {}, "acknowledgePostUpdateReleaseNotes")`；main 通道（main/chunk-FQMTTDFW.js:448-449）。
- **A12 · 入口桥**（index-ABImDspU.js:458）：`acknowledgePostUpdateReleaseNotes: (e) => window.zcode.acknowledgePostUpdateReleaseNotes(e)`。
