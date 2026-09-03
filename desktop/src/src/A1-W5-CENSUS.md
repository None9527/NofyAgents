# A1-W5 顶群余三域普查（R137 后）

普查时点：A1-R137 提交后（台账 777；Conversation 域已闭合）。
方法：三 explore 代理并行逐件清点（消费数 word-boundary grep 实证，canonical 读目标定义核形）。
总盘：**146 declare = 88 别名改指 + 47 实体化 + 6 伪面销账 + 5 vendor/ambient**。

## 一、components/usage/UsageDeep.tsx（56）

46 别名改指 + 10 实体化 + 0 伪面 + 0 vendor。

| 簇 | 行域 | 件数 | 类 | 目标 |
|---|---|---|---|---|
| ① dnd-kit vendored | 428–451 | 11 | 别名 | npm @dnd-kit/core@6.3.1 + sortable@8.0.0 + utilities@3.2.2（B10/A1-R129o Sidebar 先例） |
| ② provider/model 助手 | 473–491 | 14 | 别名 | SrcSharedB（Ro/zo/Ao/Vo/bo/Fo/xo/Mo/Bo/go/_o/yt/So/Ho 全 facade reconstructed） |
| ③ PROVIDER_IDS+testid | 493–508 | 8 | 别名 | PROVIDER_IDS→SrcSharedA providerIds（A1-R32 先例×5 文件）；7 testid→SrcSharedB@4882–4888 |
| ④ skillStore 家族/连接 | 511–522 | 5 | 实体化 | 无 canonical（skillStore-BmeKHDBI.js 未重建） |
| ⑤ 支付/设置跨 chunk | 525–565 | 12 | 别名 | 11→PaymentDeep canonical（6 件 file-local 需补 export）+ arrayMove→npm |
| ⑥ 环境宿主面 | 2321–2328 | 4 | 实体化 | hi/xte/Ene/Mee 全树无 canonical |
| ⑦ resolveDraftBaseUrl | 2348 | 1 | 别名 | SrcSharedB@819 normalizeEndpointBaseUrl（注 Tn 为 styles-local，语义核合） |
| ⑧ newProviderId | 3918 | 1 | 实体化 | Knt 无 canonical |

侧记：UsageSettingsSection.tsx:67 另有同源 PROVIDER_IDS declare（原 q），可随 ③ 同批收。

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

30 别名改指 + 2 实体化 + 6 伪面 + 4 vendor。

| 簇 | 行域 | 件数 | 类 | 目标 |
|---|---|---|---|---|
| C1 skillStore 域 | 575–600 | 9 | 别名 | taskStore@348 + whiteboardStore 五员 + subagentsStore 三员（SkillStore 转导出面现成） |
| C2 横切 stores/services | 663–690 | 8 | 7别名+1实体 | WorkspaceTabsDeep 四员 + remoteServices 二员（666 canonical hasRemoteScope 私有需补 export）+ sessionRegistryStore 一员；688 useSessionListsHydrator 实体化 |
| C3 PopoverRoot | 739 | 1 | 伪面 | 零消费，删+碑 |
| C4 图标块 | 767–777 | 7 | 4vendor+3伪面 | 消费四员候 lucide 字形映射；774/776/777 零消费删+碑 |
| C5 文件图标族 | 788–795 | 5 | 别名 | FileIconBlocks.ts（A1-P1-B15 逐字真身）一整批 |
| C6 会话域引用存取 | 826–848 | 7 | 别名 | ConversationSelectionCore.ts（A1-P1-B4；@529 同叶 import 先例）一整批 |
| C7 遥测/路径/pptx | 863–873 | 4 | 混 | 863→StoresDeep 别名；870/872 零消费碑化；873 buildPptxElementsMarkdown 实体化 |
| C8 Ne 技能浅钩 | 1255 | 1 | 别名 | skillsStore@100 useSkillsStore（与 C1 的 600 孪生） |

## 四、收官路线（风险升序）

1. 纯别名大批：Composer C6（7）→ C5（5）→ C1+C8（10）→ UsageDeep ②（14）→ ③（8）→ ①（11）→ Onboarding B7（3）+B4（1）+B9 别名件。
2. 伪面销账：Composer C3+C4 伪面三件 + C7 两件（6 件一批）。
3. 需补 export 的别名：UsageDeep ⑤（PaymentDeep 6 件）、Composer 666、Onboarding 1126。
4. 实体化批（束真转录）：Composer 688/873、UsageDeep ④⑥⑧、Onboarding B1/B2/B5/B6/B8/B11/816/diffs 二件。
5. vendor 候裁：Composer C4 消费四件（lucide 字形映射）、Onboarding 1132（留）。
6. 联退件：Onboarding ServicesProvider/ScopeBoundary × AppRootLeaves 双声明。

台账预期：146 件中 88+6 = 94 件纯删（别名改指与伪面销账均减台账），47 实体化不减台账
（实体化 = declare 换真身，键名保留），5 vendor/ambient 候裁。W5 闭条件 = 三域业务 declare 清零
（vendor/ambient 裁定留痕）。
