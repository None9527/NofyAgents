# A1-W5 顶群余三域普查（R137 后）

普查时点：A1-R137 提交后（台账 777；Conversation 域已闭合）。
方法：三 explore 代理并行逐件清点（消费数 word-boundary grep 实证，canonical 读目标定义核形）。
总盘：**146 declare = 88 别名改指 + 47 实体化 + 6 伪面销账 + 5 vendor/ambient**。

## 一、components/usage/UsageDeep.tsx（56 → **0，域闭**）

**〔A1-R145 域闭〕56 件全数退役：R144 退 34（①②③⑦）+ R145 退 22（⑤ 12 + ④⑥ 9 + ⑧ 1）。
台账实测 UsageDeep.tsx declare = 0，顶群第三闭合域（Composer R143 → UsageDeep R145）。**

46 别名改指 + 10 实体化 + 0 伪面 + 0 vendor。
〔A1-R144/145 修正（dossier-A/B 束证）：实为 **55 别名改指 + 1 微转录**——④⑥ 九件「实体化」
翻案为别名（符号在 styles 的 src-HCld2afU 导入块 off 12156–17038，**不在** skillStore 块，
skillStore 全文 48 名零命中；真身链闭合 SrcSharedB/SrcSharedA/lib/buildEnv 全已 export）；
⑧ Knt 为 styles-local（off 2763649）UD 本地 3 行微转录。①②③⑦ 34 件已 R144 退役，
⑤④⑥⑧ 22 件已 R145 退役（型缝 3：@1542 返 boolean / @1551 参 any 返 boolean / @5233 open: boolean）。〕

| 簇 | 行域 | 件数 | 类 | 目标 |
|---|---|---|---|---|
| ① dnd-kit vendored | 428–451 | 11 | 别名 | npm @dnd-kit/core@6.3.1 + sortable@8.0.0 + utilities@3.2.2（B10/A1-R129o Sidebar 先例） |
| ② provider/model 助手 | 473–491 | 14 | 别名 | SrcSharedB（Ro/zo/Ao/Vo/bo/Fo/xo/Mo/Bo/go/_o/yt/So/Ho 全 facade reconstructed） |
| ③ PROVIDER_IDS+testid | 493–508 | 8 | 别名 | PROVIDER_IDS→SrcSharedA providerIds（A1-R32 先例×5 文件）；7 testid→SrcSharedB@4882–4888 |
| ④ skillStore 家族/连接 | 511–522 | 5 | 别名〔翻案〕 | dossier-B：jee/jte/kr/xn/en ≡ SrcSharedB@5152/620/631/5584/5568（全已 export；原「无 canonical」判定系 chunk 归属误判） |
| ⑤ 支付/设置跨 chunk | 525–565 | 12 | 别名 | 11→PaymentDeep canonical（6 件 file-local 需补 export）+ arrayMove→npm |
| ⑥ 环境宿主面 | 2321–2328 | 4 | 别名〔翻案〕 | dossier-B：hi/xte/Ene/Mee ≡ SrcSharedB@6276/6333/6287 + SrcSharedA@310→lib/buildEnv@9；hi 真形 = 构建期冻结串 'production'（styles R off 2084）非 import.meta.env；原 declare Record<string,string> 型 3 处均误随改指消失 |
| ⑦ resolveDraftBaseUrl | 2348 | 1 | 别名 | SrcSharedB@859 canonicalizeEndpointUrl〔A1-R144 勘误：原注 @819 normalizeEndpointBaseUrl 系误判——那是 Tn 体内所调内层 mu，少一步去尾斜杠，误接引入静默行为差且 tsc 不报；束链 styles@518 `Lo as Tn` ← src@9749 `_u as Lo` ≡ src@5073〕（R144 已退） |
| ⑧ newProviderId | 3918 | 1 | 微转录〔翻案〕 | dossier-B：Knt 非 src 符号系 styles-local（off 2763649 `function Knt(){return xi()}`）；PD@9123 authSessionSnapshotOf 已实体化但 canonical 名语义错配不走别名；UD 本地 3 行转录（generateUuid 已在树 lib/uuid@15） |

侧记：UsageSettingsSection.tsx:67 另有同源 PROVIDER_IDS declare（原 q），可随 ③ 同批收。
〔A1-R144 警注（dossier-A §风险11）：其 provenance 注为 skillStore chunk 与 UsageDeep 件（src-HCld2afU）
**不同源**，收取前须独立束证（skillStore-BmeKHDBI.js 内是否有第二 q），不可径抄 R144 结论；
其面为 2 键子集，改指后为窄→宽方向，需独立核消费点字面量收窄缝。〕

## 二、components/onboarding/OnboardingLoginLeaves.tsx（48 → **38**）

12 别名改指 + 35 实体化 + 0 伪面 + 1 ambient（1132 declare global Window，留）。
〔A1-R146 施行：别名 10 件已退（B7 三件 + B9 三件 + B10 三件 + 单件 899），域余 38。
**dossier-D 翻案（1,444 行束取证，代理已完工）**：原记「35 实体化」中 **32 件束真身已在树内有逐字
canonical，应改判别名/vendor 改指；仅 3 件真实体化**（persistProviderFamilyDomain / useDiffsWorkerPool /
DiffsWorkerPoolProviderElement）；**伪面 0 件**——936/937/1847/2517 四枚各有 1 活消费点且束真身确凿
（Y6t@211393 / X6t@211428 / R4t@206775 / R3t@209141），**不得销账**。批划分 D-1…D-9，台账预期 −33。
★dossier-D 阻断级发现：B6-4 `refreshModelProviderSnapshot` 系**双束符混并**（gM@52709 + _M@52726），
TSX@3348 现用 gM 面而束真为 `_M`（Q3t@209922 实证）→ **既存运行时行为偏差**（恒发请求 + 作废在途刷新），
须专批更正，优先级高于普通退役批。〕

| 簇 | 行域 | 件数 | 类 | 目标 |
|---|---|---|---|---|
| B1 登录 UI 原语+testid | 555–564 | 9 | 实体化 | OrbitSpinnerIcon/ProviderIcon/7 testid（b4t/D4t 登录视图消费） |
| B2 provider 常量/注册 | 576–586 | 6 | 实体化 | BIGMODEL_PROVIDER_ID 等 |
| B3 根组件面 | 602–624 | 5 | 混 | IntlProviderShell→I18n@462 别名〔**R147 已施行**，census「无原注须核身」→ 核身通过：Ge≡t≡E 单真身三跳束证；型缝 1 = `as unknown as LocalePreference`，**不采** dossier-C 备选 `(locale ?? undefined)`（束真透传 null，改 undefined 属运行期值变）〕；ServicesProvider/ScopeBoundary 与 AppRootLeaves@287/295 双声明须联退〔**R147 已施行**：双侧平行改指第三方 canonical（serviceContext@13 / ErrorBoundaryCore@286），无需互指；★dossier-C「ARL 需新增两条值边」经主树复核为误——ARL@135/140 边既有，**新增边 0**；型缝 3 = `as unknown as BaseServices` ×3（ONB 2 + ARL 1），dossier-C U1「源索引签可供目标具名成员」推论**实测证伪**，唯一不兼容键为 zcodeAgentService 非档案所虑二键；★`BaseServices` **同名两家**：Modals@245 窄面 vs stores-core@94 canonical，取错家报 systemService 缺失误导〕；UpdateStatusWindow/WorkspaceTelemetryProvider 实体化〔dossier-D 改判候施〕 |
| B4 taskStore | 696 | 1 | 别名 | stores/taskStore.ts@2956 useTaskStore（7 消费点 .getState() 式）〔**R147 试施撤回，移交 R148 专批**：tsc 实测 **13 处面冲突**（顶层虚构 activeTaskId / TaskUsage.cost 面 `UsageCost\|null` vs `number\|undefined` / setTaskError 参 string vs 错误对象 ×2 / TaskInteractionRequest 8 必填员 ×3 / undefined vs `string\|null` ×3 / `string\|undefined` vs string ×1），非 dossier-C「面精化最小集」所能覆盖；**每处需束取证裁定本地面与 canonical 面孰为近似**（setTaskError 传对象 vs canonical 收 string 属既存保真疑点）；declare 已原位复原 + 候批注登记冲突清单〕 |
| B5 任务刷新对 | 807–808 | 2 | 实体化 | refreshPinnedTasks/refreshTimelineTasks |
| B6 provider 快照四件 | 836–839 | 4 | 实体化 | 消费互锁（@1355/3348–3361） |
| B7 team-plan-key 三件 | 851–853 | 3 | 别名 | SrcSharedB@5099/5108/5130（ModelProviderSettingsSection@23/25 别名先例在案）——全文件最低风险〔**R146 已施行**，零缝〕 |
| B8 家族域助手五件 | 859–864 | 5 | 实体化 | §F 域 |
| B9 广播/diffs/titlebar | 934–942 | 5 | 混 | cLt/oLt→FileTreePanel 别名〔**R146 已施行**，型缝 2：消费铸 `task as TaskMeta`——本地 TaskBroadcastPayload.task 面非 any，档案「可赋」判定证伪〕；xo→Settings 别名〔**R146 已施行**，型缝 1：`theme as ThemeMode`，MarkdownIntegration@830 同式先例〕；diffs 二件实体化（F14）〔dossier-D：依赖闭包 ~600 行（GRe WorkerPoolManager 类 styles 46400–46960 + hO/mO/KRe/gO）**全树未重建**，建议移交 F14、本域留碑〕 |
| B10 store/modals | 1090+1125–1126 | 3 | 别名 | createExternalStore→zustand create（@5262 死裸创建待裁→dossier-C U3 裁**留**，逐字口径）；HeroCardShell/BrandWordmarkSvg→Modals（ZCodeLogoSvg 需补 export）〔**R146 已施行**：ZCodeLogoSvg 补 export + modules/Modals@248 补转导出（头注@119 登记缺口）；HeroCard 走 ModalsLeaves 新值边 + **canonical 束真回补 2 处**（children 可选化 + `relative z-10` 守卫，束真 C4t 206384-206409 全段核合）〕 |
| B11 任务态访问对 | 1847+2517 | 2 | 实体化 | 非邻接 |
| 单件 | 816/899 | 2 | 混 | isKeyCombo 实体化；useWebRemoteControlFeatureEnabled→~~WebRemote@2038~~ 别名〔**A1-R146 勘误+已施行**：WebRemote@2038 = useWebRemoteControlEnabled（原 **y8**，束 150152；束内 y8() 全集 4 处，Y3t 体内无 y8）**证伪**；真身 = styles@209397 `UTt()` ← 本地恒真 stub@123194 → 属主 **components/shell/Home@1251 useRemoteWorkspaceEnabled**（modules/Home@149 转导出，SplitLayoutUiDeep@76/1576 明注不重复）。误接 y8 将使 Y3t 远控编排受 Provider 缺省 !1 影响而行为回退〕 |

注意：611（IntlProviderShell）与 851（bigmodelTeamPlanKey）无原注——改指前须束内核身复核。

## 三、modules/Composer.tsx（42）

36 别名改指（含 4 vendor）+ 6 伪面 + 0 实体化。〔A1-R143 实证修正：原记「2 实体化」（688/873）
束取证推翻——688 真身 = TaskListQueryCore useHydratingSessions（A1-P3-B1 逐字叶）、873 真身 =
ImeComposition appendPptxElementReferences，皆已在树，别名改指零转录；dossier-E §0。〕

| 簇 | 行域 | 件数 | 类 | 目标 |
|---|---|---|---|---|
| C1 skillStore 域 | 575–600 | 9 | 别名 | taskStore@348 + whiteboardStore 五员 + subagentsStore 三员（SkillStore 转导出面现成） |
| C2 横切 stores/services | 663–690 | 8 | 别名 8〔翻案〕 | WorkspaceTabsDeep 四员 + remoteServices 二员（666 canonical hasRemoteScope 私有需补 export）+ sessionRegistryStore 一员；688 useSessionListsHydrator → **别名** TaskListQueryCore useHydratingSessions@77（原记实体化，dossier-E 束取证推翻：A1-P3-B1 ROUNDTRIP EXACT，依赖十二符全在树零转录）〔A1-R143 已施行〕 |
| C3 PopoverRoot | 739 | 1 | 伪面 | 零消费，删+碑 |
| C4 图标块 | 767–777 | 7 | 4vendor+3伪面 | 消费四员候 lucide 字形映射；774/776/777 零消费删+碑 |
| C5 文件图标族 | 788–795 | 5 | 别名 | FileIconBlocks.ts（A1-P1-B15 逐字真身）一整批 |
| C6 会话域引用存取 | 826–848 | 7 | 别名 | ConversationSelectionCore.ts（A1-P1-B4；@529 同叶 import 先例）一整批 |
| C7 遥测/路径/pptx | 863–873 | 4 | 混 | 863→StoresDeep 别名；870/872 零消费碑化；873 buildPptxElementsMarkdown → **别名** ImeComposition appendPptxElementReferences@1149（原记实体化，dossier-E 推翻：GXe 首符 `_`=块首 `c as _`←imeComposition `lr as c`）〔A1-R143 已施行〕 |
| C8 Ne 技能浅钩 | 1255 | 1 | 别名 | skillsStore@100 useSkillsStore（与 C1 的 600 孪生） |

## 四、收官路线（风险升序）

1. 纯别名大批：~~Composer C6（7）→ C5（5）→ C1+C8（10）~~〔R140–R143 已施行〕→ ~~UsageDeep ②（14）→ ③（8）→ ①（11）~~〔R144 已施行〕→ Onboarding B7（3）+B4（1）+B9 别名件。
2. 伪面销账：Composer C3+C4 伪面三件 + C7 两件（6 件一批）。
3. 需补 export 的别名：~~UsageDeep ⑤（PaymentDeep 6 件）~~〔R145 已施行：PD 6 行补 export + PDS 再导出 +6 名〕、~~Composer 666~~〔R142 已施行〕、Onboarding 1126。
4. 实体化批（束真转录）：~~Composer 688/873~~〔翻案为别名，R143 已施行〕、~~UsageDeep ④⑥⑧~~
   〔dossier-B 翻案：④⑥ 九件实为别名、⑧ 为 3 行微转录，**实体化 0 件**，R145 已施行〕、
   Onboarding B1/B2/B5/B6/B8/B11/816/diffs 二件。
5. vendor 候裁：Composer C4 消费四件（lucide 字形映射）、Onboarding 1132（留）。
6. 联退件：Onboarding ServicesProvider/ScopeBoundary × AppRootLeaves 双声明。

台账预期：146 件全数退役皆减台账（别名改指/伪面销账/实体化均删 declare 语句——实体化
「不减台账」系本普查初稿口径误，R129n 判例实证 868→862 含实体化 2 件）。〔A1-R142 修正〕
余量核算：普查后已退 R138(7)+R139(5)+R140(10)+R141(6)+R142(7)+R143(7)+R144(34)+R145(22)+R146(10)+R147(5)=113 件，
三域现存 **35**（**Composer 0（R143 域闭）** + **UsageDeep 0（R145 域闭）** + **Onboarding 35（R146 −10、R147 −3）**）；
台账实测 **664**（R147 后；该批另收 AppRootLeaves 2 件属 modules 域，不计三域），r118 基线累计 1,012→664 = 348 删 0 增。
W5a 仅余 Onboarding 一域（dossier-D 33 + ambient 留存 1 + B4 taskStore 移 R148）；
W5 闭条件 = 三域业务 declare 清零（vendor/ambient 裁定留痕）。
