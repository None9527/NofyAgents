# A1-W5 顶群余三域普查（R137 后）

普查时点：A1-R137 提交后（台账 777；Conversation 域已闭合）。
方法：三 explore 代理并行逐件清点（消费数 word-boundary grep 实证，canonical 读目标定义核形）。
总盘：**146 declare = 88 别名改指 + 47 实体化 + 6 伪面销账 + 5 vendor/ambient**。

## 一、components/usage/UsageDeep.tsx（56）

46 别名改指 + 10 实体化 + 0 伪面 + 0 vendor。
〔A1-R144/145 修正（dossier-A/B 束证）：实为 **55 别名改指 + 1 微转录**——④⑥ 九件「实体化」
翻案为别名（符号在 styles 的 src-HCld2afU 导入块 off 12156–17038，**不在** skillStore 块，
skillStore 全文 48 名零命中；真身链闭合 SrcSharedB/SrcSharedA/lib/buildEnv 全已 export）；
⑧ Knt 为 styles-local（off 2763649）UD 本地 3 行微转录。①②③⑦ 34 件已 R144 退役。〕

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

## 二、components/onboarding/OnboardingLoginLeaves.tsx（48）

12 别名改指 + 35 实体化 + 0 伪面 + 1 ambient（1132 declare global Window，留）。

| 簇 | 行域 | 件数 | 类 | 目标 |
|---|---|---|---|---|
| B1 登录 UI 原语+testid | 555–564 | 9 | 实体化 | OrbitSpinnerIcon/ProviderIcon/7 testid（b4t/D4t 登录视图消费） |
| B2 provider 常量/注册 | 576–586 | 6 | 实体化 | BIGMODEL_PROVIDER_ID 等 |
| B3 根组件面 | 602–624 | 5 | 混 | IntlProviderShell→I18n@462 别名；ServicesProvider/ScopeBoundary 与 AppRootLeaves@287/295 双声明须联退；UpdateStatusWindow/WorkspaceTelemetryProvider 实体化 |
| B4 taskStore | 696 | 1 | 别名 | stores/taskStore.ts@2956 useTaskStore（7 消费点 .getState() 式） |
| B5 任务刷新对 | 807–808 | 2 | 实体化 | refreshPinnedTasks/refreshTimelineTasks |
| B6 provider 快照四件 | 836–839 | 4 | 实体化 | 消费互锁（@1355/3348–3361） |
| B7 team-plan-key 三件 | 851–853 | 3 | 别名 | SrcSharedB@5099/5108/5130（ModelProviderSettingsSection@23/25 别名先例在案）——全文件最低风险 |
| B8 家族域助手五件 | 859–864 | 5 | 实体化 | §F 域 |
| B9 广播/diffs/titlebar | 934–942 | 5 | 混 | cLt/oLt→FileTreePanel 别名；xo→Settings 别名；diffs 二件实体化（F14） |
| B10 store/modals | 1090+1125–1126 | 3 | 别名 | createExternalStore→zustand create（@5262 死裸创建待裁）；HeroCardShell/BrandWordmarkSvg→Modals（ZCodeLogoSvg 需补 export） |
| B11 任务态访问对 | 1847+2517 | 2 | 实体化 | 非邻接 |
| 单件 | 816/899 | 2 | 混 | isKeyCombo 实体化；useWebRemoteControlFeatureEnabled→WebRemote@2038 别名 |

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

1. 纯别名大批：Composer C6（7）→ C5（5）→ C1+C8（10）→ UsageDeep ②（14）→ ③（8）→ ①（11）→ Onboarding B7（3）+B4（1）+B9 别名件。
2. 伪面销账：Composer C3+C4 伪面三件 + C7 两件（6 件一批）。
3. 需补 export 的别名：UsageDeep ⑤（PaymentDeep 6 件）、~~Composer 666~~〔R142 已施行〕、Onboarding 1126。
4. 实体化批（束真转录）：~~Composer 688/873~~〔翻案为别名，R143 已施行〕、~~UsageDeep ④⑥⑧~~
   〔dossier-B 翻案：④⑥ 九件实为别名、⑧ 为 3 行微转录，**实体化 0 件**，候 R145〕、
   Onboarding B1/B2/B5/B6/B8/B11/816/diffs 二件。
5. vendor 候裁：Composer C4 消费四件（lucide 字形映射）、Onboarding 1132（留）。
6. 联退件：Onboarding ServicesProvider/ScopeBoundary × AppRootLeaves 双声明。

台账预期：146 件全数退役皆减台账（别名改指/伪面销账/实体化均删 declare 语句——实体化
「不减台账」系本普查初稿口径误，R129n 判例实证 868→862 含实体化 2 件）。〔A1-R142 修正〕
余量核算：普查后已退 R138(7)+R139(5)+R140(10)+R141(6)+R142(7)+R143(7)+R144(34)=76 件，三域现存 70
（**Composer 0（R143 域闭，顶群第二闭合域）** + **UsageDeep 22（R144 别名大批 34 件后，56→22）**
+ Onboarding 48）；台账实测 **701**（R144 后），全退后约 631（vendor/ambient 候裁留痕件除外）。
W5 闭条件 = 三域业务 declare 清零（vendor/ambient 裁定留痕）。
