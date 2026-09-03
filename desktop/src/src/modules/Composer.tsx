/* eslint-disable */
/**
 * ============================================================================
 * Composer.tsx — Composer 族（F08）first-party 逐字重建（B5-01 批次 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动；主口径）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：COVERAGE-LEDGER §c.1 #1（Composer 族 first-party，B4-1 最大余项）；
 *       MODULE-MAP F08；Home.report §1.2 F08 接口保留清单 → 本文件全部实体化。
 *
 * js 行段（本文件覆盖；行号 = styles js 主口径）：
 *   A. 63490–63751  子代理/技能上下文 store 与钩子（pqe 63490–63561 在登记起点 63593
 *                   之前、落在账本标注的「Lexical 57652–63592 vendored」段内，但实测为
 *                   first-party（消费 fs/subagentsService）——边界裁决 §R1，随族收录）
 *   B. 63562–69353  Composer first-party 主体（技能上下文/建议过滤/提及节点/建议面板/
 *                   斜杠面板/提及选择器/编辑器插件族/ComposerInput 根/附件上传/草稿域/
 *                   代码评论/网页元素/PPTX 引用/后台工作胶囊）
 *                   ——登记终点 69297，实测主体止于 69353（iZe memo 69345 + XH/ZH
 *                   69346–69353，被 75527 段与 96789 消费）——边界裁决 §R2
 *   C. 75495–76148  模型选择器段（N4e/P4e/_q 起点在登记 75527 之前 32 行，随族收录；
 *                   vq ModelSelector + 模式文案表 + 分段进度 + 上下文环）
 *   D. 76849–77167  ConfigSelect + 思考级别解析族（登记段 77014–77079 的完整闭包；
 *                   前后溢出见边界裁决 §R3）
 * 不转录（vendored，仅注记）：
 *   - Lexical 引擎体 57652–63489（含 @lexical/react useHistory 尾段 dqe/fqe 63476–63489）
 *   - framer-motion 引擎体 69354–75494（MotionContext/useConstant/SubscriptionManager 起）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号 = 融合 chunk js 行）
 * ----------------------------------------------------------------------------
 *  [A] 子代理/技能上下文（skillStore 域消费面）：
 *   pqe  → useSubagentsContext                (63490；登记段外，裁决 §R1)
 *   RB   → skillContextRequestCache           (63562)
 *   zB   → skillContextGeneration             (63563)
 *   mqe  → skillContextGenerationCounter      (63564)
 *   BB   → skillContextCacheKey               (63565)
 *   VB   → mergeSkillContextEntry             (63568)
 *   hqe  → dedupeSkillContextList             (63571)
 *   HB   → loadSkillContext                   (63581；起点在 63593 前 12 行，随函数收录)
 *   UB   → useSkillContextStore               (63640 / jsx 56751，MODULE-MAP 副根)
 *   WB   → useSkillsContext                   (63680)
 *  [B1] 建议过滤/评分：
 *   gqe  → SUGGESTION_DEFAULT_LIMIT = 1000    (63752)
 *   GB   → hasNonEmptyQuery                   (63753)
 *   _qe  → suggestionLimitForQuery            (63756)
 *   vqe  → filterVisibleSuggestionSections    (63759)
 *   KB   → fuzzyScore                         (63762)
 *   yqe  → sortByFuzzyScore                   (63779)
 *   qB   → limitItems                         (63795)
 *   bqe  → fileDirectoryPriority              (63800)
 *   xqe  → sortFilesDirectoryFirst            (63803)
 *   JB   → filterSuggestionsByQuery           (63809)
 *  [B2] 技能/子代理建议构造：
 *   YB   → subagentScopePriority              (63843)
 *   Sqe  → subagentScopeLabel                 (63846)
 *   Cqe  → dedupeSubagentsByName              (63855)
 *   wqe  → detectGlmSkillOrigin               (63878)
 *   Tqe  → GLM_SKILL_ID_PREFIX_REGEX          (63884)
 *   Eqe  → isGlmSkill                         (63885)
 *   XB   → filterGlmSkills                    (63890)
 *   Dqe  → OFFICIAL_SKILL_PLUGINS             (63893；MODULE-MAP 建议卡数据注记)
 *   Oqe  → OFFICIAL_PLUGIN_PATH_MARKERS       (63903)
 *   kqe  → CURATED_SKILL_DESCRIPTIONS         (63911)
 *   Aqe  → localizeSkillScopeLabel            (64010)
 *   jqe  → curatedSkillDescription            (64023)
 *   Mqe  → isOfficialPluginSkill              (64026)
 *   ZB   → buildSkillSuggestions              (64033)
 *   Nqe  → useSkillSuggestions                (64056；Home.report 段钩子)
 *  [B3] 触发解析与斜杠建议：
 *   QB   → suggestionQueryKey                 (64070)
 *   Pqe  → MENTION_TRIGGER_REGEX              (64073)
 *   Fqe  → MENTION_TOKEN_PREFIX_REGEX         (64073)
 *   Iqe  → normalizeCnyTrigger                (64075)
 *   $B   → mentionFuzzyScore                  (64078)
 *   eV   → scoreMentionSuggestion             (64095)
 *   tV   → parseMentionTrigger                (64109)
 *   nV   → mentionCompletionOverlap           (64113)
 *   rV   → sortMentionSuggestions             (64131)
 *   Lqe  → findBestSuggestionIndex            (64151)
 *   iV   → APP_SLASH_PREFIX `app-slash:`      (64164；MODULE-MAP 副根)
 *   Rqe  → buildAppSlashSuggestions           (64165)
 *   zqe  → isAppSlashSuggestion               (64182)
 *   Bqe  → isSlashPanelAvailable              (64185)
 *   aV   → normalizeSlashCommandName          (64188)
 *   Vqe  → buildSessionSlashSuggestions       (64191)
 *   Hqe  → buildSubagentSlashSuggestions      (64208)
 *   Uqe  → buildSkillSlashSuggestions         (64211)
 *   Wqe  → toSubagentSlashSuggestion          (64222)
 *   Gqe  → readTextAroundCursor               (64233)
 *   Kqe  → toSlashPanelMention                (64243)
 *   qqe  → useSessionSlashCommands            (64274)
 *  [B4] 提及节点（Lexical TextNode 派生）：
 *   oV   → isHttpUrl                          (64277；A1-R13 行校正，旧注 64278)
 *   sV   → MENTION_NODE_BASE_CLASS            (64280)
 *   cV   → mentionCategoryClass               (64281)
 *   Jqe  → unescapeMarkdownLinkLabel          (64294)
 *   Yqe  → parseMarkdownLinkLabel             (64305)
 *   lV   → mentionDisplayLabel                (64309)
 *   uV   → SVG_NAMESPACE                      (64320)
 *   Xqe/Zqe/Qqe/$qe/eJe/tJe/nJe/rJe → 技能/子代理/白板/目标命令/紧凑命令/命令/会话/插件
 *          提及图标 path 表                    (64320–64386)
 *   dV   → createMentionIconSvg               (64388)
 *   iJe/aJe/oJe/sJe/cJe/lJe/uJe/dJe → create*Icon (64406–64431)
 *   fJe  → mentionFilePath                    (64432)
 *   fV   → stripLeadingSlashes                (64435)
 *   pV   → renderMentionNodeContent           (64438)
 *   mV   → PromptMentionNode                  (64514)
 *   hV   → createMentionNode                  (64632)
 *   gV   → isMentionNode                      (64636)
 *  [B5] 建议面板（虚拟滚动）：
 *   _V   → SCROLL_FADE_HEIGHT = 24            (64639)
 *   vV   → SCROLL_FADE_THRESHOLD = 1          (64640)
 *   yV   → NO_SCROLL_FADE                     (64641)
 *   bV   → computeScrollFade                  (64642)
 *   xV   → scrollFadeMaskStyle                (64646)
 *   pJe/mJe/hJe → 行高 34/40/28               (64655–64657)
 *   gJe  → flattenSuggestionRows              (64661)
 *   SV   → SuggestionPanel                    (64687 / jsx 57678，Home 已登记)
 *   _Je  → SuggestionSectionHeaderRow         (64825)
 *   vJe  → SuggestionStatusRow                (64833)
 *   yJe  → SuggestionOptionRow                (64861)
 *  [B6] 斜杠面板：
 *   bJe  → useSlashPanelSections              (64915；Home.report 段构造)
 *   CV   → readSlashCursorContext             (65000)
 *   wV   → isCursorInsideToken                (65018)
 *   TV   → parseSlashTokenAtCursor            (65021)
 *   EV   → trackSlashToken                    (65028)
 *   DV   → resolveSlashTokenRange             (65039)
 *   OV   → PROGRAMMATIC_UPDATE_TAG            (65047)
 *   kV   → HISTORY_NAVIGATION_TAG             (65047)
 *   xJe  → isUserInitiatedUpdate              (65049)
 *   SJe  → SlashPanel                         (65052 / jsx 58050 区，MODULE-MAP 副根)
 *   AV   → PluginMentionIcon                  (65256)
 *  [B7] 提及选择器：
 *   CJe/wJe/TJe → @/#/$ 触发类别表            (65276–65278)
 *   EJe  → mentionCategoriesForTrigger        (65280)
 *   DJe  → mentionSessionScope                (65283)
 *   OJe  → buildFileSuggestions               (65286)
 *   jV   → normalizeQueryCase                 (65298)
 *   kJe  → shouldRefreshFileList              (65301)
 *   AJe  → useFileSuggestions                 (65312；Home.report 段钩子)
 *   MV   → EMPTY_PLUGIN_CATALOG               (65360)
 *   jJe  → INITIAL_PLUGIN_CATALOG_STATE       (65361)
 *   NV   → pluginCatalogRequestCache          (65362)
 *   PV   → releasePluginCatalogRequest        (65363)
 *   MJe  → trackPluginCatalogRequest          (65366)
 *   FV   → usePluginReferenceCatalog          (65370)
 *   NJe  → buildPluginSuggestions             (65438)
 *   PJe  → usePluginSuggestions               (65456；Home.report 段钩子)
 *   FJe  → SESSION_SUGGESTIONS_PER_WORKSPACE = 20 (65484)
 *   IJe  → compareSessionSuggestions          (65485)
 *   IV   → sessionDisplayTitle                (65496)
 *   LJe  → sessionWorkspaceLabel              (65499)
 *   RJe  → buildSessionSuggestion             (65503)
 *   zJe  → dedupeAndSortSessions              (65517)
 *   BJe  → limitSessionsPerWorkspace          (65528)
 *   VJe  → collectSessionListEndpoints        (65535)
 *   HJe  → useSessionSuggestions              (65564；Home.report 段钩子)
 *   UJe  → buildWhiteboardSuggestions         (65610)
 *   WJe  → useWhiteboardSuggestions           (65622；Home.report 段钩子)
 *   LV   → wrapIndex                          (65634)
 *   RV   → findNextEnabledIndex               (65637)
 *   GJe  → clampToEnabledIndex                (65646)
 *   KJe  → MentionSelector                    (65653 / jsx 58473，MODULE-MAP 副根)
 *  [B8] 编辑器辅助（提交/历史/移动端/编辑器指令）：
 *   zV   → resolveTaskProvider                (66096)
 *   qJe  → useActiveTaskProvider              (66103)
 *   JJe  → appendPromptHistory                (66112)
 *   YJe  → navigatePromptHistory              (66118)
 *   BV   → MOBILE_TEXT_INPUT_MEDIA_QUERY      (66132)
 *   XJe  → matchesMediaQuery                  (66133)
 *   ZJe  → subscribeMediaQuery                (66138)
 *   QJe  → isMobileTextInputViewportNow       (66149)
 *   $Je  → subscribeMobileTextInputViewport   (66152)
 *   VV   → useIsMobileTextInputViewport       (66155)
 *   eYe  → isEnterSubmitAllowed               (66159)
 *   tYe  → submitShortcutKey                  (66162)
 *   nYe  → isMobileWebRemoteInput             (66165)
 *   HV   → inputTextClass                     (66168)
 *   rYe  → CJK_COMMA `、`                     (66171)
 *   iYe  → SLASH_CHAR `/`                     (66174)
 *   aYe  → canSubmitText                      (66173)
 *   oYe  → isSubmitAccepted                   (66184)
 *   sYe  → isCjkCommaSlashInput               (66187)
 *   UV   → readEditorText                     (66190)
 *   WV   → setEditorText                      (66199)
 *   cYe  → setEditorMention                   (66215)
 *   GV   → applyEditorStateJson               (66226)
 *   KV   → clearEditor                        (66230)
 *   lYe  → setSkillMentionContent             (66233)
 *   uYe  → setSlashCommandMentionContent      (66249)
 *   dYe  → appendFileMentionContent           (66265)
 *   fYe  → appendTextContent                  (66290)
 *   pYe  → findMentionIdAfterCaret            (66303)
 *   qV   → mentionIdFromElement               (66315)
 *   mYe  → focusAfterMention                  (66320)
 *  [B9] Lexical 插件族 + 输入根：
 *   hYe  → SubmitOnEnterPlugin                (66333)
 *   gYe  → EditorChangeLogger                 (66411)
 *   _Ye  → EditableSyncPlugin                 (66453)
 *   vYe  → E2ELexicalBridgePlugin             (66462)
 *   yYe  → PromptHistoryNavigationPlugin      (66507)
 *   JV   → isCaretAtEditorStart               (66576)
 *   bYe  → CjkCommaSlashPlugin                (66589)
 *   xYe  → PasteCapturePlugin                 (66622)
 *   SYe  → EditorApiPlugin                    (66640)
 *   CYe  → LEXICAL_CHAT_INPUT_THEME           (66668)
 *   wYe  → LexicalChatInput                   (66669)
 *   TYe  → PassthroughErrorBoundary           (66808)
 *  [B10] ComposerInput 根 + 动作菜单 + 拖拽：
 *   YV   → applyWorkspaceFileMentionDrop      (66811)
 *   EYe  → hasExternalFiles                   (66822；A1-R13 行校正，旧注 66823)
 *   XV   → useComposerFileDragDetection       (66828；Home.report 拖拽检测；A1-R13 行校正，旧注 66827)
 *   DYe  → buildActionMenuShortcuts           (66886)
 *   OYe  → onNextFrame                        (66894)
 *   kYe  → appendTriggerText                  (66901)
 *   AYe  → preventDefaultOnMouseDown          (66906)
 *   jYe  → ComposerActionMenu                 (66909)
 *   MYe  → runOnNextFrame                     (67000)
 *   ZV   → ComposerInput                      (67007 / jsx 59468，F08 根组件)
 *  [B11] 附件模型与上传管线：
 *   NYe  → NANOID_ALPHABET                    (67277)
 *   QV   → nanoid                             (67278)
 *   PYe  → LARGE_PASTED_TEXT_THRESHOLD = 5KB  (67282)
 *   $V   → MAX_INLINE_IMAGE_BYTES = 20MB      (67283)
 *   eH   → TEXT_ATTACHMENT_PREVIEW_LIMIT = 64KB (67284)
 *   FYe  → OversizedInlineImageAttachmentError (67285)
 *   IYe  → readFileAsDataUrl                  (67299)
 *   LYe  → createFileAttachment               (67315)
 *   RYe  → createLocalPathAttachment          (67326)
 *   zYe  → createClipboardTextAttachment      (67330)
 *   BYe  → isLargePastedText                  (67342)
 *   VYe  → SPREADSHEET_HTML_PATTERN           (67345)
 *   HYe  → prefersSpreadsheetText             (67347)
 *   UYe  → pastedTextFilename                 (67350)
 *   WYe  → countLines                         (67353)
 *   tH   → revokeAttachmentObjectUrl          (67374)
 *   GYe  → resolveAttachmentPayload           (67377)
 *   KYe  → readAttachmentBase64               (67418)
 *   nH   → isImageAttachment                  (67425)
 *   qYe  → isTextLikeAttachment               (67428)
 *   JYe  → readTextFilePreview                (67435)
 *   rH   → guessMimeType                      (67439)
 *   YYe  → basenameOfPath                     (67463)
 *   XYe  → formatPastedTextFilename           (67466)
 *   ZYe  → resolveComposerPlaceholderKey      (67470)
 *  [B12] 提示词历史/聚焦策略/草稿域：
 *   QYe  → PROMPT_HISTORY_STORAGE_PREFIX      (67480)
 *   iH   → safeLocalStorage                   (67481)
 *   aH   → promptHistoryStorageKey            (67489)
 *   oH   → sanitizePromptHistory              (67492)
 *   sH   → loadPromptHistory                  (67499)
 *   cH   → savePromptHistory                  (67509)
 *   lH   → resolveFocusStrategy               (67513)
 *   $Ye  → DRAFT_STORAGE_PREFIX `zcode-v4-composer-drafts:v1:` (67516)
 *   eXe  → DRAFT_SCOPE_ID `__draft__`         (67519)
 *   uH   → MAX_DRAFT_SCOPES = 50              (67520)
 *   dH   → safeDraftStorage                   (67519)
 *   fH   → draftStorageKey                    (67527)
 *   pH   → parseDraftStore                    (67531)
 *   mH   → persistDraftStore                  (67543)
 *   tXe  → pruneDraftScopes                   (67559)
 *   nXe  → readDraftScope                     (67569)
 *   hH   → writeDraftScope                    (67573)
 *   gH   → deleteDraftScope                   (67581)
 *   _H   → pendingDraftTransfer               (67586)
 *   vH   → draftScopeWorkspaceKey             (67587)
 *   rXe  → setPendingDraftTransfer            (67590)
 *   iXe  → consumePendingDraftTransfer        (67593)
 *  [B13] 附件 store + 上传钩子（mXe 白板提及域）：
 *   yH   → useComposerAttachmentStore         (67602)
 *   bH   → getScopeAttachments                (67603)
 *   aXe  → updateScopeAttachments             (67606)
 *   oXe  → encodeBase64Utf8                   (67616)
 *   sXe  → estimateBase64Bytes                (67623)
 *   cXe  → putAttachmentContent               (67627)
 *   lXe  → EMPTY_ATTACHMENTS                  (67646)
 *   xH   → REMOTE_ATTACHMENT_NOT_STAGED       (67647)
 *   uXe  → selectAttachmentPaths              (67648)
 *   dXe  → attachmentScopeKey                 (67653)
 *   SH   → isAbortError                       (67656)
 *   fXe  → RemoteAttachmentNotStagedError     (67663)
 *   pXe  → isTransientUploadError             (67666)
 *   CH   → uploadProgressPercent              (67673)
 *   wH   → isRemoteAttachmentTarget           (67676)
 *   mXe  → useComposerAttachments             (67679；MODULE-MAP 白板提及/附件域)
 *  [B14] 代码评论域：
 *   hXe  → codeCommentKey                     (68295)
 *   TH   → CodeCommentsChip                   (68298；Home.report 代码评论)
 *   EH   → CODE_COMMENT_ADD_EVENT             (68411)
 *   DH   → CODE_COMMENT_REMOVE_EVENT          (68412)
 *   gXe  → CODE_COMMENT_REMOVE_CHANNEL        (68413)
 *   OH   → suppressedCodeCommentIds           (68414)
 *   kH   → commentWorkspaceKey                (68415)
 *   AH   → codeCommentIdentityKey             (68418)
 *   _Xe  → isCodeCommentSuppressed            (68421)
 *   jH   → suppressCodeComment                (68424)
 *   vXe  → unsuppressCodeComment              (68427)
 *   yXe  → isCodeCommentAddEvent              (68430)
 *   bXe  → isCodeCommentRemoveEvent           (68438)
 *   MH   → isCodeCommentRemoveDetail          (68446)
 *   NH   → isCodeCommentAddDetail             (68457)
 *   xXe  → formatCodeCommentMarkdown          (68475)
 *   SXe  → formatCodeCommentsMarkdown         (68479)
 *   CXe  → appendCodeCommentsToContent        (68486)
 *   wXe  → pathBasename                       (68499)
 *   TXe  → parseLineRange                     (68502)
 *   EXe  → parseCodeCommentMarkdown           (68510)
 *   DXe  → extractCodeCommentsFromContent     (68536)
 *   OXe  → dispatchCodeCommentAddEvent        (68551)
 *   kXe  → dispatchCodeCommentRemoveEvent     (68555)
 *   AXe  → EMPTY_COMMENTS                     (68558)
 *   PH   → commentBucketKey                   (68559)
 *   FH   → useCodeCommentsStore               (68562；MODULE-MAP store 表 #9)
 *   jXe  → removeCodeCommentEverywhere        (68628；Home.report 代码评论钩子)
 *  [B15] 网页元素域：
 *   IH   → WEB_ELEMENT_ADD_EVENT               (68643)
 *   LH   → WEB_ELEMENT_REMOVE_EVENT            (68644)
 *   MXe  → WEB_ELEMENTS_MARKDOWN_HEADER        (68645)
 *   RH   → WEB_ELEMENT_TEXT_LIMIT = 8000       (68646)
 *   NXe  → createWebElementId                  (68647)
 *   zH   → webElementWorkspaceKey              (68652)
 *   PXe  → isWebElementAddEvent                (68655)
 *   FXe  → isWebElementRemoveEvent             (68663)
 *   BH   → isWebElementAddDetail               (68671)
 *   VH   → truncateWebElementText              (68687)
 *   HH   → pushWebElementField                 (68692)
 *   IXe  → formatWebElementAttributes          (68696)
 *   LXe  → formatWebElementFont                (68703)
 *   RXe  → formatWebElementMarkdown            (68706)
 *   zXe  → appendWebElementsToContent          (68738)
 *   UH   → readWebElementField                 (68752)
 *   WH   → readWebElementCodeField             (68755)
 *   BXe  → parseWebElementFont                 (68761)
 *   VXe  → parseWebElementStyle                (68768)
 *   HXe  → parseWebElementMarkdown             (68783)
 *   UXe  → extractWebElementsFromContent       (68807)
 *   WXe  → dispatchWebElementAddEvent          (68822)
 *  [B16] 上下文装配 + PPTX/会话引用 + 后台工作胶囊：
 *   GH   → countComposerContexts               (68825)
 *   GXe  → buildComposerContextMarkdown        (68833)
 *   KXe  → parseComposerContextContent         (68839)
 *   qXe  → createCodeCommentId                 (68852)
 *   KH   → codeCommentContextKey               (68857)
 *   JXe  → useCodeCommentContexts              (68860；Home.report 钩子)
 *   YXe  → isWebElementRemoveDetail            (68927)
 *   XXe  → normalizeWebElementDetail           (68939)
 *   ZXe  → useWebElementContexts               (68940；Home.report 网页元素)
 *   QXe  → usePptxElementReferences            (68996；PPTX 引用)
 *   qH   → pptxReferenceLabel                  (69033)
 *   JH   → PptxReferencesChip                  (69036；Home.report 会话选择/PPTX chip)
 *   $Xe  → buildPptxPreviewNavigation          (69185)
 *   eZe  → toPptxViewerTarget                  (69195)
 *   YH   → usePptxPreviewOpener                (69207；Home.report 钩子)
 *   tZe  → useSessionScopedReferences          (69224)
 *   nZe  → countBackgroundWorks                (69267)
 *   rZe  → BackgroundWorksCapsule              (69273)
 *   iZe  → BackgroundWorksCapsuleMemo          (69345；MODULE-MAP 后台工作胶囊)
 *   XH   → isCoarseTouchDevice                 (69346；登记终点 69297 外，裁决 §R2)
 *   ZH   → shouldRestoreFocus                  (69351；同上)
 *  [B17] 上下文 chip 行（js 2827 + 89982–90178；A1-R22 逐字；归属裁定见区段头注）：
 *   sit  → webElementAccessibleLabel          (89982)
 *   cit  → webElementDescriptor               (89985)
 *   lit  → WebElementsChip                    (89989；Home/Conversation declare 收敛)
 *   Ds   → isConversationSelectionReference   (2827；F03 选择引用守护)
 *   uit  → SelectionsChip                     (90087；Home/Conversation declare 收敛)
 *  [C] 模型选择器段：
 *   N4e  → LABEL_ANIMATION_TRANSITION          (75495；登记 75527 前 32 行，随族收录)
 *   P4e  → usePrefersReducedMotion             (75495)
 *   _q   → AnimatedLabel                       (75520)
 *   F4e  → EMPTY_FOOTER_ACTIONS                (75557)
 *   I4e  → hasMultipleGroups                   (75558)
 *   L4e  → hasGroupDecoration                  (75561)
 *   R4e  → needsGroupSeparator                 (75566)
 *   z4e  → groupContainsValue                  (75569)
 *   B4e  → resolveTriggerLabelClass            (75572)
 *   vq   → ModelSelector                       (75575 / jsx 67089，MODULE-MAP 副根)
 *   V4e  → MODE_LABEL_I18N                     (75972)
 *   H4e  → MODE_DESCRIPTION_I18N               (76002)
 *   yq   → SegmentedProgress                   (76034)
 *   bq/U4e/xq/W4e → 上下文环几何 10/24/12/4    (76066–76069)
 *   G4e  → ContextUsageContext                 (76071)
 *   K4e  → usageRatio                          (76071)
 *   q4e  → useContextUsage                     (76074)
 *   J4e  → ContextUsageProvider                (76079)
 *   Y4e  → ContextRingGlyph                    (76089)
 *   X4e  → ContextRingTrigger                  (76125)
 *   Z4e  → ContextRingTooltipContent           (76139)
 *   Q4e  → ContextRingTooltipBody              (76147)
 *   （76149–76245 Sq/Cq/$4e/wq/e3e/t3e/Tq/n3e/Eq/Dq/Oq/r3e/i3e → 已由 UsageDeep.tsx
 *     抽取（该批 §D，js 76101–76563 记账口径；实测 76149–76611），让位不重复转录，
 *     裁决 §R4）
 *  [D] ConfigSelect + 思考级别解析族：
 *   M3e  → isOptionValue                       (76848)
 *   N3e  → DANGEROUS_MODE_VALUES               (76851)
 *   P3e  → configSelectTestId                  (76852)
 *   F3e  → configOptionTestId                  (76856)
 *   I3e  → ApiRetryIndicator                   (76860)
 *   L3e  → modeOptionLabel                     (76880)
 *   R3e  → modeLabelI18nId                     (76884)
 *   z3e  → modeDescriptionI18nId               (76887)
 *   jq   → configOptionLabel                   (76890)
 *   B3e  → configOptionDescription             (76893)
 *   V3e  → isDangerousModeValue                (76898)
 *   H3e  → modeOptionIcon                      (76901)
 *   Mq   → ConfigSelect                        (76911；登记段 77014 前溢出，裁决 §R3)
 *   U3e  → THOUGHT_LEVEL_DISABLED_VALUES       (77062；MODULE-MAP 副根「思考级别解析」)
 *   W3e  → THOUGHT_LEVEL_RANKS                 (77063；跨 77079 终点，随表收录)
 *   G3e  → THOUGHT_LEVEL_LABEL_I18N            (77094；77079 外，随表收录)
 *   Nq   → normalizeThoughtLevelKey            (77127)
 *   K3e  → isDisabledThoughtOption             (77130)
 *   q3e  → thoughtOptionRank                   (77133)
 *   J3e  → sortThoughtOptions                  (77141)
 *   Y3e  → nextThoughtLevelValue               (77155)
 *   X3e  → thoughtOptionLabel                  (77162)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk / 本 chunk 它族；未重建者 declare，已重建者注来源）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime / react-dom(createPortal)
 *  2. cn (Z)                        utils-CEEH0K_K.js（UtilsCn.tsx 已重建）
 *  3. Button (X)                    button-laUijeDG.js（button.tsx 已重建）
 *  4. useIntlContext (G)            IntlProvider-C321H7m8.js（I18n.tsx canonical）
 *  5. toast (m) / info 图标 (p) / close 图标 (g) / usePlatformService (l)
 *                                   imeComposition-DEYFkwWm.js（ImeComposition.tsx 已重建）
 *  6. logger (J)                    logger-PFDwl5Yq.js（logger.tsx 已重建）
 *  7. zustand create (Ae) / useTaskStore (xe) / fe 任务域选择器 / 白板 store (Te/Oe/Pe) /
 *     白板事件 (Ee/Me)              skillStore-BmeKHDBI.js（未重建，B5-11 队列，declare）
 *  8. 子代理上下文 store (Se/he/je)  skillStore-BmeKHDBI.js（未重建，declare）
 *  9. useWorkspaceServices (fs) / 工作区 store 选择器 (pc/co/oc/bg/bc/vc/Dc/Io/Ec/Zs/JS)
 *                                   本 chunk 横切层（stores/services 族已部分重建，declare 挂接）
 * 10. Lexical 引擎（kN/zI/TI/gI/sR/hI/AL/jL/dI/LR/gKe/tqe/aqe + 命令常量
 *     cF/sF/lF/pF/dF/xF/gF/uF）    本 chunk 57652–63489 vendored（依赖替换策略，declare）
 * 11. useVirtualizer (to)           @tanstack/react-virtual（esm-BY6T6pIH.js，vendored）
 * 12. Tooltip (Ia) / Tooltip 原语 (dN/fN/pN) / Popover (Na/Oa/Ma/ka) /
 *     Progress 原语 (XTe/ZTe)      usageStatsUiParts-CiR7YEhh.js（未重建，B5-11，declare）
 * 13. DropdownMenu 原语 (VO/HO/UO/WO/YO/JO/ZO/QO/$O/KO/qO/iO/oO/sO/cO/aO) /
 *     HoverCard 原语 (CN/wN/TN)     本 chunk Radix 封装区（TopBar.tsx 已还原 VO 族，declare 挂接）
 * 14. 图标（lucide 封装）：kv/Hv/rye/av/fv/EN/T_/Cv/N_/M_/F_/O_/zv/Sv/Bv/Yv/wv/yv/jv/
 *     _v/Av/Kv/Cye/pv/Uv/D_/y_     本 chunk 图标块（vendored 登记）+ ImeComposition 导出
 * 15. testid 常量（Qt/Lr/Gr/nee/gn/It/zn/er/Fr/Xt/rn/Lte + qr）
 *                                   src-HCld2afU.js（未重建，B5-11；值已回代核实，见下）
 * 16. 文件图标 (zc/Bc/Fc/Mc/Ic)     本 chunk 文件图标族（Home/Conversation 已登记）
 * 17. 提及 markdown 构造 (wj/Tj/Ej/KHe/Dj) 本 chunk 52124–52142（F02 域，declare）
 * 18. 工作区文件拖拽 (jj/Nj/Mj/tUe/aUe) 本 chunk 52248–52271（declare）
 * 19. 会话引用装配 (Moe/Noe) + 会话域引用存取 (Cs/ws/Doe/Foe/Ioe/Ooe)
 *                                   本 chunk 2741–2819（F03 域，declare）
 * 20. 输入遥测 (rFe) 41771 / 路径判定 (VA) 50977 / pptx 域 (v/D/E/y/k/_/w) =
 *     imeComposition 导出族 + 本 chunk Noe（declare/注释）
 * 21. 用量域 (dj/v3e/g3e/w3e/O3e/k3e/C3e/T3e/E3e/b3e/s3e) = UsageDeep.tsx / F12 域
 *     （本文件仅 ContextRing 原语层；消费面 j3e 76630 属 F12 B5-04，不转录）
 *
 * testid 值（回代 src-HCld2afU.js 核实）：
 *   Qt=`prompt-suggestion-panel` Lr=`prompt-suggestion-section` nee=`prompt-suggestion-option`
 *   Gr=`prompt-suggestion-status` It=`chat-model-select-trigger` zn=`chat-model-select-group`
 *   er=`chat-model-select-item` Fr=`chat-thought-level-select-trigger`
 *   Xt=`chat-thought-level-select-item` rn=`chat-mode-select-item`
 *   gn=`v4-composer-background-work-trigger` Lte=`chat-context-usage-trigger`
 * ============================================================================
 */

/* ============================================================================
 * 〔A0-S4-4b：components 拆分（conversation/composer 域）——本文件现为薄 re-export shim〕
 * 五个组件单元已原样迁入，导入方零改动（仍从本文件取符号）：
 *   [B5] SuggestionPanel（2351–2676）              → components/composer/SuggestionPanel.tsx
 *   [C]  ModelSelector + 上下文环（7996–8741）      → components/composer/ModelSelector.tsx
 *   [D]  ConfigSelect + 思考级别族（8742–9132）     → components/composer/ConfigSelect.tsx
 *   [B16] PPTX 引用 chip 六实体（7612–7852）        → components/composer/PptxReferencesChip.tsx
 *   [B16] 后台工作胶囊（7899–7982）                 → components/composer/BackgroundWorksCapsule.tsx
 * §0 分配：SUGGESTION_* testid 随 B5；BACKGROUND_WORKS_TRIGGER_TESTID/AgentIcon/WorksCompactIcon
 * 随胶囊；MODEL_SELECT_* 三件与 MODE_SELECT_ITEM_TESTID/ProgressRoot/ProgressIndicator/motion/
 * AnimatePresence/NestedTooltip 四件随 [C]（HoverCardRoot 三面共用，复制+shim 保留）；
 * THOUGHT_LEVEL_* testid/PlanIcon 随 [D]；pptx declare 五件/PptxElementIcon 随 pptx 族。
 * testidOf（三族共用）、isCoarseTouchDevice/shouldRestoreFocus（[C]/[D] 消费）、
 * MentionSuggestionItem（B5 型别）、PptxElementAddDetail（pptx 族型别，留守面亦消费）
 * 留守本文件并补 export，组件侧经 import/type import 取回（函数声明提升/型别擦除，环安全）。
 * 编辑器引擎域（[A] 技能上下文 store、[B1–B4] 建议引擎与提及节点、[B6–B10] 斜杠面板/提及选择器/
 * 编辑器辅助/Lexical 插件族/ComposerInput 根、[B11–B13] 附件/草稿/上传管线、[B14] 代码评论域、
 * [B15] 网页元素域、[B16] 余量）与编辑器状态闭包深耦合，按阶段纪律留守（见报告 §6）。
 * ==========================================================================*/
import * as React from "react";
import { DropdownMenu as DropdownMenuRoot, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '../components/ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { HoverCardTooltip, HoverCardTooltipContent, HoverCardTooltipTrigger } from '../components/ui/hover-card'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import；〔A1-R22〕HoverCardContent/HoverCardTrigger 消费面（A0 版 CodeCommentsChip）随 TH 逐字化删除，收敛为 CN/wN/TN=HoverCardTooltip 三面（54832–54836）：[B17] chip 行消费
import { CodeXml as CodeCommentIcon, Earth as WebElementIcon, MessageSquareText as CommentGlyphIcon, MousePointer2 as WebElementPointerIcon, Quote as SelectionGlyphIcon, X as CloseIcon, PlusIcon, SlashIcon, AtSignIcon, PaperclipIcon, ArrowUpIcon, HandIcon, Trash2 as TrashIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）；〔A0-S4-4b〕InfoIcon/LoaderIcon/ShieldCheckIcon/SparkleIcon/ChevronDownIcon/CheckIcon/LockIcon/BrainIcon/ShieldAlertIcon/TerminalIcon 随迁出族移入 components/composer/；〔A1-R22〕+CodeXml/Earth/MessageSquareText/MousePointer2/Quote（原 Cye 26969 / wye 26983 / _v 27447 / o=imeComposition C 导出 Wt 11787 / fbe 27690）：[B17] chip 行消费
import * as ReactDOM from "react-dom";
import * as $ from "react/jsx-runtime"; // A1-R22：[B14]/[B17] chip 行编译形 JSX 消费面（原 $，jsx-runtime-B5yMD3-t.js）
import {
  $applyNodeReplacement,
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $getRoot,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  BLUR_COMMAND,
  COPY_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  type EditorState as LexicalEditorState,
  type LexicalEditor,
  type RangeSelection as LexicalRangeSelection,
  TextNode as LexicalTextNode,
  type SerializedEditorState,
} from 'lexical'; // A0-S3d：vendored lexical declare → npm lexical@0.42.0（版本指纹：styles 60548 `FL.version` / 62523 `TB` = `0.42.0+prod.esm`；LexicalEditor/EditorState/RangeSelection 为 type-only 导出；依据见 A0-S3d.report.md）
import { LexicalComposer } from '@lexical/react/LexicalComposer'; // A0-S3d：@lexical/react@0.42.0（子路径导出名 LexicalComposer）
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'; // A0-S3d：@lexical/react@0.42.0
import { ContentEditable as LexicalContentEditable } from '@lexical/react/LexicalContentEditable'; // A0-S3d：导出名 ContentEditable，语义别名保留
import { HistoryPlugin as LexicalHistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'; // A0-S3d：导出名 HistoryPlugin，语义别名保留
import { RichTextPlugin as LexicalRichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'; // A0-S3d：导出名 RichTextPlugin，语义别名保留
import { Spinner } from './Home';
import { toast, usePlatformService, type PlatformService } from './ImeComposition'; // 〔A0-S4-4b〕PopoverAnchor/PopoverContent/PopoverTrigger 随 pptx 族迁出后留守面仅余 toast；〔A1-R49〕+usePlatformService/type PlatformService（原 l declare 改指 canonical 富面，本地五员面碑化）
import { create as createStore, logger, resolveWorkspaceKey as workspaceKey, useTaskStore, useWhiteboardStore, useWhiteboardStore as whiteboardStore, getWorkspaceTaskState as taskScopeSelector, resolveWhiteboardWorkspaceKey as whiteboardScopeKey, whiteboardToPngFile as exportWhiteboardToPngFile, isWhiteboardAddToChatEvent as isWhiteboardMentionAddEvent, WHITEBOARD_ADD_TO_CHAT_EVENT as WHITEBOARD_MENTION_ADD_EVENT_TYPE, getSubagentContextScopeKey as subagentContextKey, useSubagentContextsStore as useSubagentStore, useSubagentsStore as useShallowSubagentLoadedState, useSkillsStore as useShallowSkillLoadedState } from './SkillStore'; // 〔A1-R140〕+10 别名（原 S/W/In/jn/Mn/Cn/Y/Bn/Gn/Ne，jsx 195/1807/1923/1868/1879/1805/2018/2094/2161/2387；四 store 转导出面现成；消费面逐字不变） // +createStore（A0-S2d 接线：原 zustand create declare → SkillStore q 导出）；+workspaceKey（A0-D 接线：declare → SkillStore b 导出 resolveWorkspaceKey）
import { normalizeProviderId, useShallowSelector } from './SrcSharedB'; // 〔A1-R39〕+useShallowSelector（co 真身：styles 1033-1039 ≡ lib/shallowSelector，SrcSharedB 转导出面 R38 补）：shallowSelector declare 收敛改指，见下墓碑
import { useBaseServices, useServices } from './services'; // 原 fs（bundle 2675）= services.tsx useServices（context 面）；基线误名 useWorkspaceServices（= Oc，带参解析面），A0-D 裁决改接 useServices
import { InfoTooltip as TooltipRoot, TooltipContent, TooltipTrigger } from './UsageStatsUiParts'; // 原 fN/pN + Ia（A0-D 接线 + A0-CLEANUP2 item 47：TooltipRoot declare → InfoTooltip 属主导出）
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from './I18n'; // 原 G，IntlProvider-C321H7m8.js（A0-D 接线：declare → I18n canonical）
import { Button } from './button'; // 原 H，button-laUijeDG.js（A0-D 接线：declare → button canonical）
import { cn } from './UtilsCn'; // 原 Z，utils-CEEH0K_K.js（A0-D 接线：declare → UtilsCn canonical）
import { SuggestionPanel, type PanelSection } from '../components/composer/SuggestionPanel'; // 〔A0-S4-4b〕留守面消费回取：B6 SlashPanel 段型别 + 建议面板渲染点（函数声明提升/型别擦除，环安全）
import { buildFileTreeDragText as fileMentionMarkdown, pluginMentionMarkdown, skillMentionMarkdown, subagentMentionMarkdown, sessionMentionMarkdown, hasWorkspaceFilePayload, readWorkspaceFilePayload, isWorkspaceFileDragEvent, buildWorkspaceFileMentionPayload, WORKSPACE_FILE_DRAG_STATE_EVENT as WORKSPACE_FILE_DRAG_EVENT_TYPE, type WorkspaceFileDragPayload } from '../components/composer/FileMentionDragHelpers'; // A1-R11：wj（52124）/Dj（52138）转录改指（纯函数叶子，环安全同 SuggestionPanel 先例）；调用点 2779/2998 逐字不变。wj 双归属：FileTreePanel 经名 buildFileTreeDragText、本文件经名 fileMentionMarkdown，bundle 唯一真身。A1-R12：§17/§18 declares 全量改指（Tj/Ej/KHe 52128/52131/52134、Mj/Nj/tUe/aUe 52248/52251/52254/52271、jj 52212），调用点 1391/1591/1856/1866/3096/4653/4657/4663/4671/4986/5003/4605 逐字不变
import { extractSelectionsFromText as extractConversationSelections, appendSelectionBlockToText as appendConversationSelections, listSelectionReferences as readSessionScopedReferences, selectionLoadErrorOf as readSessionScopedLimitReason, setSelectionReferences as writeSessionScopedReferences, clearSelectionLoadError as clearSessionScopedLimitReason, isSelectionAddEvent as isSessionScopedReferencesChangedEvent, selectionAddEventName as sessionScopedReferencesChangedEventType } from '../components/conversation/ConversationSelectionCore'; // 〔A1-R138〕+7 别名（原 Moe/Cs/ws/Doe/Ooe/Foe/Ioe，F03 域 2761/2732/2738/2734/2743/2816/2819；消费面 7170/7621–7657 逐字不变） // 〔A1-R129z〕原 Noe（styles 74669 / F03 域 2775）declare 改指（canonical = ConversationSelectionCore A1-P1-B4 逐字真身；parseComposerContextContent 消费面）。环安全：纯 TS 叶，仅 SrcSharedB 边
import { resolveFileIconMeta as resolveFileIcon, FileIconWithName as FileRow, FOLDER_ICON_SRC as DIRECTORY_ICON_SRC, DEFAULT_FILE_ICON_SRC as DOCUMENT_ICON_SRC, FALLBACK_DOCUMENT_ICON_DATA_URL as DOCUMENT_FALLBACK_ICON_SRC } from '../components/conversation/FileIconBlocks'; // 〔A1-R139〕文件图标族五别名（原 zc/Bc/Fc/Ic/Mc，5198/5205/5173/5174/5159；canonical = A1-P1-B15 逐字真身；消费面 2223/2225/2234/3488 逐字不变）。环安全：叶仅 React+MarkdownIntegration 边，无反向
import { extractPptxElementReferences as extractPptxElementReferencesFromContent } from '../components/ime/ImeComposition'; // 〔A1-R129z〕原 pptx 抽取 declare 改指——束真：styles KXe（2122719）之 `w` = imeComposition 块 m 导出（块首导入 `m as w` ← ./imeComposition-DEYFkwWm.js）≡ 本名原码 ur；canonical = ImeComposition@1164 逐字。一符一家归 imeComposition 域。环安全：ImeComposition 对本文件仅 type-only 回边（A1-R49 判例，编译期擦除）
import { useWorkspaceTabStore as useWorkspaceTabsSelector, isWorkspaceKindTab as isWorkspaceTab, resolveTabServicesBinding as resolveTabServices, type WorkspaceTab, type SessionRegistrySnapshotState } from './WorkspaceTabsDeep'; // 〔A1-R142〕C2 三别名（原 pc/oc/vc，R1 canonical 属主；remoteServices 头导入 useTabStoreSelector/isWorkspaceTab 同体先例）+ 二型（collectSessionListEndpoints 面校准）。消费面 919/1183/3222/3767 + 929/1193/3223/3770 + 3196 逐字不变。环安全：WTD 运行闭包（zustand/e2eStoreBridge/uuid/SkillStore/sessionRegistryStore/remoteServices）不达本文件
import { hasRemoteScope as remoteScopeKey, useResolvedRemoteSessionId as resolvePreferredRemoteSessionId, useResolvedWorkspaceServices as useResolvedServices } from '../services/remoteServices'; // 〔A1-R142〕C2 三别名（原 Tc/bc/Dc ≡ 束 pqe/WB/HJe 消费 bg/bc/Dc 同体；hasRemoteScope 补 export 同批；Dc≡useResolvedWorkspaceServices 既判 R136）。消费面 939/1203 + 941/1205 + 2956/3231 逐字不变。环安全：本文件 → ./services → remoteServices 边既成（useBaseServices 转导出），直连无新环类
import { useSessionRegistryStore as useSessionRegistry, type BaseServices } from '../stores/sessionRegistryStore'; // 〔A1-R142〕C2 一别名（原 Zs；WTD/remoteServices/stores-core 导入先例）+ BaseServices 型（面校准）。消费面 3224–3226 逐字不变。环安全：该 store 运行闭包仅 ./zustand（skillContextStore 边 type-only 编译期擦除，无 Composer 运行环）

/* ============================================================================
 * 0. 外部依赖类型声明（未重建依赖以 declare 挂接；来源见上方清单）
 * ==========================================================================*/

/** 2. cn（utils-CEEH0K_K.js，UtilsCn.tsx 已重建） */
/* ── tombstone（A0-D）：cn declare 删除 → import { cn } from './UtilsCn'（canonical）。 ── */

/** 4. useIntlContext（IntlProvider-C321H7m8.js，I18n.tsx canonical） */
/* ── tombstone（A0-D）：IntlShape/useIntlContext 脚手架删除 → I18n useZCodeIntl（alias）+ type ZCodeIntl as IntlShape。 ── */

/** 5. toast / 图标 / 平台服务（imeComposition-DEYFkwWm.js，ImeComposition.tsx 已重建） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：InfoIcon/CloseIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/** 〔A1-R49〕补 export：canonical PlatformService.createTempTextAttachment 返型
 * 经 type import 回指本属主（型别面零变；R48 ChromeImportResult←BrowserSettingsSection 同式）。 */
export interface TempTextAttachmentMeta {
  filename: string;
  localPath?: string;
  mimeType: string;
  sizeBytes: number;
}
/* ── tombstone（A1-R49）：本地 PlatformService 五员面 + declare usePlatformService
 *    （原 l，imeComposition chunk 导出别名 M）删除——改经文件头 ImeComposition import
 *    消费 canonical 富面（R48 增补 28 员 + 本批续补 selectFile/selectFiles/
 *    createTempTextAttachment 三员，桥接真值 rendererEntry@458-460 在案）。
 *    型相容逐员核验：canSelectFilePath 同形；getPathForFile 返型 string|null
 *    （本地 string|null|undefined 宽面，消费 6107 `resolved?.trim()` 相容）；
 *    selectFile/selectFiles/createTempTextAttachment 三员签名 = 本地既判形逐字。
 *    消费位 5734（selectAttachmentPaths 参型同名解析）/5809（hook 调用）/
 *    6107/6125/6173 逐字不变。 ── */

/** 6. logger（logger-PFDwl5Yq.js，logger.tsx 已重建） */

/** 3. Button（button-laUijeDG.js，button.tsx 已重建） */
/* ── tombstone（A0-D）：Button declare 删除 → import { Button } from './button'（canonical，
 *    ButtonProps 为 loose Record；事件回调参数需显式标注，见各调用面）。 ── */

/** 7/8. skillStore-BmeKHDBI.js（B5-11 已重建为 SkillStore.tsx）：任务 store / 白板 store / 子代理 store
 *  ── tombstone（A0-S2d）：createStore declare 与本地 ZustandStore/ZustandSetState
 *     脚手架已删除，canonical = SkillStore.tsx vendored zustand create（原 q 导出），
 *     经文件头真实 import 消费；本文件消费面均为选择器/getState/setState 调用，形状兼容。 ── */
interface TaskStoreState {
  [key: string]: unknown;
}
/* ── tombstone〔A1-R140〕：declare function taskScopeSelector（原 S，jsx 195 导出 V）删除 →
 *    文件头 SkillStore 导入别名接入（getWorkspaceTaskState as taskScopeSelector；
 *    canonical = stores/taskStore@348 逐字真身）。面校准：canonical 首参宽化
 *    string | undefined + 体内双 cast（运行期恒在）。消费面实证（2 处）：1911/3767 逐字不变。 ── */
interface WhiteboardStoreState {
  workspaces: Record<
    string,
    { boardIds: string[]; boardsById: Record<string, WhiteboardBoard | undefined> } | undefined
  >;
}
/* ── tombstone〔A1-R140〕：declare 五件（原 W/In/jn/Mn/Cn，jsx 1807/1923/1868/1879/1805）删除 →
 *    文件头 SkillStore 导入别名接入（resolveWhiteboardWorkspaceKey/useWhiteboardStore/
 *    whiteboardToPngFile/isWhiteboardAddToChatEvent/WHITEBOARD_ADD_TO_CHAT_EVENT，
 *    canonical = stores/whiteboardStore 逐字真身）。面校准二件：resolveWhiteboardWorkspaceKey
 *    首参宽化 + 体内 cast；isWhiteboardAddToChatEvent 返回面 boolean → 型谓词
 *    （编译期擦除；消费面 6275–6279 event.detail 窄化所依）。
 *    消费面实证（6 处）：3287/6254/6260/6275/6276×2/6279×2 逐字不变。 ── */
interface WhiteboardBoard {
  id: string;
  name: string;
  strokes: unknown[];
}
/* ── tombstone〔A1-R140〕：declare 三件（原 Y/Bn/Gn，jsx 2018/2094/2161）删除 →
 *    文件头 SkillStore 导入别名接入（getSubagentContextScopeKey/useSubagentContextsStore/
 *    useSubagentsStore，canonical = stores/subagentsStore 逐字真身；contexts/initialize/
 *    refresh/setEnabled 与 loaded* 字段面全合）。消费面实证（6 处）：945/946–949/950 逐字不变。 ── */

/** 9. 本 chunk 横切 stores/services（已部分重建；按消费面 declare 挂接） */
interface WorkspaceFileEntry {
  name: string;
  path: string;
  relativePath: string;
  type: "file" | "directory";
}
interface SkillsService {
  list(args: {
    workspacePath: string;
    workspaceIdentity?: string;
    provider: string;
  }): Promise<{ skills: SkillEntry[]; capability: unknown }>;
  setEnabled(args: {
    workspacePath: string;
    workspaceIdentity?: string;
    provider: string;
    scope: string;
    skillId: string;
    enabled: boolean;
  }): Promise<unknown>;
}
interface SkillEntry {
  id: string;
  name: string;
  description?: string;
  scope: "workspace" | "plugin" | "user";
  source: "user" | "plugin" | "built-in";
  enabled: boolean;
  path: string;
  model?: string | null;
  pluginName?: string;
}
interface SubagentsService {
  list(args: {
    workspacePath: string;
    workspaceIdentity?: string;
    provider: string;
  }): Promise<{ agents: SubagentEntry[]; capability: unknown }>;
}
interface SubagentEntry {
  id: string;
  name: string;
  description?: string;
  scope: "workspace" | "plugin" | "user";
  source: "user" | "plugin" | "built-in";
  enabled: boolean;
  path: string;
  model?: string | null;
}
interface PromptAttachmentTransferService {
  stage(args: Record<string, unknown>): Promise<{ staged: boolean; ref: string; bytes: number }>;
  adopt(operationId: string): Promise<unknown>;
  cancel(operationId: string): Promise<unknown>;
  cleanup(operationId: string): Promise<unknown>;
  onDynamicProgress(
    operationId: string,
  ): (listener: (p: { phase: string; uploadedBytes: number; totalBytes: number }) => void) => {
    dispose(): void;
  };
}
/* ── tombstone〔A1-R142〕：declare useWorkspaceTabsSelector（原 pc）删除 → 改指 modules/WorkspaceTabsDeep useWorkspaceTabStore（R1 canonical 属主）。消费面实证（4 处）：919/1183/3222/3767 逐字不变；泛型面 (state: any)→T 双变可赋，3222 选择器经上下文型化得 WorkspaceTab[]。 ── */
/* ── tombstone〔A1-R39〕：declare shallowSelector（原 co）删除 → 改指 modules/SrcSharedB useShallowSelector（co 真身：styles-local 1033-1039 ≡ lib/shallowSelector.ts 公共叶，A1-R38 迁叶裁定；SrcSharedB 转导出面在位）。消费面实测（4 处改名改指 ≡ bundle settings 63494 区）：@912/@947（useSubagentsContext≡pqe 63490，co 消费 63494/63523）/@1176/@1211（useSkillsContext≡WB 63680，co 消费 63684/63713）。负证据：本文件 co 面全集 4 处；型面 (state: any)→T 与公共叶 (e: any) 双变可赋。 ── */
/* ── tombstone〔A1-R142〕：declare isWorkspaceTab（原 oc）删除 → 改指 modules/WorkspaceTabsDeep isWorkspaceKindTab（R1 canonical；AutomationsMain A1-R2 / WorkspaceShell P2-B2 别名先例）。谓词面 → boolean 面：消费面 929/1193/3223/3770 皆守卫/过滤用，无收窄依赖（P2-B2 逐点判例）；filter(isWorkspaceTab) 前后型不变。 ── */
/* ── tombstone〔A1-R142〕：declare remoteScopeKey（原 Tc 横切）删除 → 改指 services/remoteServices hasRemoteScope（canonical 真身，补 export 同批；束 pqe/WB 消费 bg ≡ 本函数）。消费面实证（2 处）：939/1203 逐字不变；面 remoteTarget string|null → canonical unknown 超集相容。 ── */
/* ── tombstone〔A1-R142〕：declare resolvePreferredRemoteSessionId（原 bc）删除 → 改指 services/remoteServices useResolvedRemoteSessionId（canonical 真身；束 pqe/WB 消费 bc(e, preferredRemoteSessionId, identity, remoteTarget) 四参同形）。消费面实证（2 处）：941/1205 逐字不变；返回面 string|null|undefined → canonical string|null 子集相容（消费面皆 ?? 链）。 ── */
/* ── tombstone〔A1-R142〕：declare resolveTabServices（原 vc）删除 → 改指 modules/WorkspaceTabsDeep resolveTabServicesBinding（canonical 真身；束 VJe 消费 vc(a, baseServices, serviceResolverState) 同形，R126/R129 buildScopedServices 改指同判在案）。消费面实证（1 处）：3196 逐字不变；面校准：collectSessionListEndpoints 三参面 unknown → 真面（BaseServices/SessionRegistrySnapshotState/WorkspaceTab[]），services 面 BaseServices 消费铸 ×2（VJe 体内型缝）。 ── */
/* ── tombstone〔A1-R142〕：declare useResolvedServices（原 Dc）删除 → 改指 services/remoteServices useResolvedWorkspaceServices（canonical 真身 4907–4944；R136 既判 Dc≡useResolvedWorkspaceServices，首参面宽化 string|null|undefined 同批承续）。消费面实证（2 处）：2956/3231 逐字不变；返回面超集相容（connectionKind 增项不消费）；services 面 ResolvedBaseServices 消费铸 ×4（2966/2991/2994/3243 型缝，二段收敛判例）。 ── */
/* ── tombstone（A0-D）：workspaceKey declare 删除 → SkillStore b 导出 resolveWorkspaceKey（alias workspaceKey）。 ── */
/* ── tombstone〔A1-R142〕：declare useSessionRegistry（原 Zs）删除 → 改指 stores/sessionRegistryStore useSessionRegistryStore（canonical 真身）。消费面实证（3 处）：3224–3226 逐字不变；选择器 (state: any)→T 上下文型化（SessionRegistryState 三索引字段全合）。 ── */
declare function useSessionListsHydrator(endpoints: SessionListEndpoint[]): {
  items: SessionListItem[];
  hydratingEndpointKeys: string[];
};
interface SessionListEndpoint {
  workspacePath: string | undefined; // 〔A1-R137〕面级联
  workspaceIdentity?: string;
  endpointKey?: string;
  agentService: ZcodeAgentService;
}
interface ZcodeAgentService {
  onAgentRuntimeRestarted(listener: (e: { workspaceKey: string }) => void): { dispose(): void };
}
interface PluginManagementService {
  getPluginReferenceCatalog(args: Record<string, unknown>): Promise<{
    plugins: PluginCatalogEntry[];
    authority: string | null;
  }>;
}
interface SessionListItem {
  taskId: string;
  title: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  updatedAt: number;
  createdAt: number;
  model?: string | null;
  provider?: string | null;
  migrationSource?: boolean;
}

/* ── tombstone（A0-S3d）：vendored lexical 引擎 declare 删除（20 条：LexicalNode/LexicalTextNode/LexicalElementNode/
 *    LexicalEditor/LexicalEditorState/LexicalRangeSelection 类 + useLexicalComposerContext/$getSelection/$isRangeSelection/
 *    $isTextNode/$getRoot/$createTextNode/$createParagraphNode/$isParagraphNode 函数 + LexicalComposer/LexicalRichTextPlugin/
 *    LexicalContentEditable/LexicalHistoryPlugin 组件）+ 本地 LexicalCommand 接口与 KEY_x/COPY/BLUR 8 条命令 declare
 *    → npm lexical@0.42.0 + @lexical/react@0.42.0 真实 import（文件头导入块）。
 *    版本指纹：styles 60548 `FL.version = '0.42.0+prod.esm'`（LexicalEditor.version）/ 62523 `TB`（@lexical/extension
 *    PACKAGE_VERSION）；错误码面 125 码 ⊆ 0.42.0 包并集（含 @lexical/clipboard 166）。
 *    两处形状适配：$applyNodeMutation 实为 $applyNodeReplacement（bundle hV = `(t.setMode('token'), LR(t))`，LR@61025）；
 *    parseEditorState 参数面 `unknown` → `string | SerializedEditorState`（0.42.0 d.ts 实面）。依据见 A0-S3d.report.md。 ── */

/* ── tombstone（A0-S3a）：vendored useVirtualizer（原 to，esm-BY6T6pIH.js）declare 删除，
 *    改 npm @tanstack/react-virtual@3.14.10 真实 import（文件头）；
 *    count/getScrollElement/estimateSize/overscan 调用面与 getTotalSize/getVirtualItems/scrollToIndex 返回面逐字不变。 ── */

/** 12. usageStatsUiParts-CiR7YEhh.js（B5-11 已重建 UsageStatsUiParts.tsx）：Tooltip/Progress 原语 */
/* ── tombstone（A0-D）：Tooltip（原 Ia，title/shortcut 形）declare 删除——本文件无调用面（孤儿）；
 *    同形组件 UsageStatsUiParts.InfoTooltip 已导出，供后续波次按需接线。 ── */
/* A0-CLEANUP2 item 47：TooltipRoot declare 删除 → import { InfoTooltip as TooltipRoot } from './UsageStatsUiParts'（原 Ia = u 导出，title/shortcut/triggerRef 面吻合）。 */
/* ── tombstone（A0-D）：TooltipTrigger/TooltipContent declare 删除 → import from './UsageStatsUiParts'（radix 导出）。 ── */
/* ── tombstone〔A1-R141〕：declare const PopoverRoot（C3）删除——伪面销账：全树零消费（word-boundary 实测仅本声明位）；radix popover 原语 declare 面，后续转录如需按 @radix-ui/react-popover 真实 import 取回（A0-S3c radix 族同判）。 ── */

/** 13. Radix 菜单/悬浮卡原语（本 chunk 封装区；VO 族 TopBar.tsx 已还原） */
/* ── tombstone（A0-S3c）：DropdownMenuContent、DropdownMenuGroup、DropdownMenuItem、DropdownMenuLabel、DropdownMenuRadioGroup、DropdownMenuRadioItem、DropdownMenuRoot、DropdownMenuSeparator、DropdownMenuSub、DropdownMenuSubContent、DropdownMenuSubTrigger、DropdownMenuTrigger、HoverCardContent、HoverCardTrigger、SelectRoot declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */












/* ── tombstone（A1-R22）：HoverCardRoot declare 删除（原 dN 54538 透传面）——本文件最后消费面
 *    A0 版 CodeCommentsChip 随 TH（68298）逐字化改指 HoverCardTooltip（CN 54832）；[C] J4e 调用面
 *    （76086）由 components/composer/ModelSelector.tsx 自带复制件消费（该文件 18 行），不留运行期洞。 ── */



/** 13b. framer-motion（vendored 69354–75494；仅消费面 declare，不转录） */

/** 13c. 嵌套 Tooltip 原语（Radix tooltip 封装区；锁定模型项提示用） */

/** 14. 图标（本 chunk 图标块 = lucide vendored 登记；语义按消费点命名） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（14）：PlusIcon/SlashIcon/AtSignIcon/PaperclipIcon/LoaderIcon/ArrowUpIcon/HandIcon/ShieldCheckIcon/SparkleIcon/ChevronDownIcon/CheckIcon/LockIcon/BrainIcon/ShieldAlertIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const SkillIcon: React.ComponentType<{ className?: string }>;
declare const WhiteboardIcon: React.ComponentType<{ className?: string }>;
declare const SessionIcon: React.ComponentType<{ className?: string }>;
declare const PluginFallbackIcon: React.ComponentType<{ className?: string }>;
/* ── tombstone（A1-R22）：CodeCommentIcon declare 删除（原 Cye，Sa('code-xml') vendored，js 26969）→ npm lucide-react CodeXml as CodeCommentIcon 真实 import（文件头导入块）；消费面 [B14] CodeCommentsChip 本批逐字化，调用面逐字不变。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：TrashIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone（A1-R22）：CommentGlyphIcon declare 删除（原 _v，Sa('message-square-text') vendored，js 27447）→ npm lucide-react MessageSquareText as CommentGlyphIcon 真实 import（文件头导入块）；消费面 [B14] CodeCommentsChip 本批逐字化，调用面逐字不变。 ── */
/* ── tombstone〔A1-R141〕：declare const LoginIcon 删除——伪面销账：全树零消费（C4 图标块七件中三伪面之一）；vendored lucide 面，后续如需按 A0-S3b 判例 npm lucide-react 真实 import 取回。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：TerminalIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone〔A1-R141〕：declare const SubagentGlyphIcon 删除——伪面销账：全树零消费；vendored lucide 面，后续如需按 A0-S3b 判例 npm lucide-react 真实 import 取回。 ── */
/* ── tombstone〔A1-R141〕：declare const AttachmentIcon 删除——伪面销账：全树零消费；vendored lucide 面，后续如需按 A0-S3b 判例 npm lucide-react 真实 import 取回。 ── */

/** 15. testid 常量（src-HCld2afU.js，B5-11；值已回代核实，见文件头） */
export const MODE_TRIGGER_TESTID = `chat-mode-select-trigger`; // 〔A0-S4-4b〕补 export：[D] configSelectTestId 消费（迁出后 import 取回）
const CONTEXT_USAGE_TRIGGER_TESTID = `chat-context-usage-trigger`;
/** qr：`${prefix}-${id}` */
export function testidOf(prefix: string, id: string): string {
  return `${prefix}-${id}`;
}

/** 16. 文件图标族（本 chunk；Home/Conversation 已登记） */
/* ── tombstone〔A1-R139〕：declare 五件（原 zc/Bc/Fc/Ic/Mc，5198/5205/5173/5174/5159）删除 →
 *    新导入行别名接入 components/conversation/FileIconBlocks（A1-P1-B15 逐字真身：
 *    resolveFileIconMeta/FileIconWithName/FOLDER_ICON_SRC/DEFAULT_FILE_ICON_SRC/
 *    FALLBACK_DOCUMENT_ICON_DATA_URL；zc≡resolveFileIconMeta 之判 ConversationToolViews@25/
 *    PreviewCards@13 既案）。面校准：declare 返回面 {fileIconSrc;fileName} vs canonical
 *    超集面 {fileIcon,fileIconSrc,fileName,filePath,normalizedPath}（消费面仅读 fileIconSrc）；
 *    FileRow declare 面 {path,options{basePath,kind,showFilePath}} vs canonical any 面
 *    （消费面三参逐字吻合）。消费面实证（4 处）：2223/2225/2234×2/3488 逐字不变。 ── */

/** 17. 提及 markdown 构造（本 chunk 52124–52142，F02 域） */
/* ── tombstone（A1-R11）：declare fileMentionMarkdown（原 wj，52124）删除，改经文件头
 *    ../components/composer/FileMentionDragHelpers import 别名消费（canonical = buildFileTreeDragText，
 *    本批逐字转录；与 FileTreePanel 消费面同符双归属，bundle 唯一真身）。 ── */
/* ── tombstone（A1-R12）：declare skillMentionMarkdown（原 Tj，52128）删除 → 文件头
 *    ../components/composer/FileMentionDragHelpers import 消费（本批逐字转录；调用点 1591/1856 逐字不变）。 ── */
/* ── tombstone（A1-R12）：declare subagentMentionMarkdown（原 Ej，52131）删除 → 文件头
 *    ../components/composer/FileMentionDragHelpers import 消费（本批逐字转录；调用点 1391/1866 逐字不变）。 ── */
/* ── tombstone（A1-R12）：declare sessionMentionMarkdown（原 KHe，52134）删除 → 文件头
 *    ../components/composer/FileMentionDragHelpers import 消费（本批逐字转录；调用点 3096 逐字不变）。 ── */
/* ── tombstone（A1-R11）：declare pluginMentionMarkdown（原 Dj，52138）删除，改经文件头
 *    ../components/composer/FileMentionDragHelpers import 消费（本批逐字转录）。 ── */

/** 18. 工作区文件拖拽（本 chunk 52248–52271） */
/* ── tombstone（A1-R12）：declare WORKSPACE_FILE_DRAG_EVENT_TYPE（原 jj，52212）删除 → 文件头
 *    WORKSPACE_FILE_DRAG_STATE_EVENT 别名 import（调用点 4663/4671 逐字不变）。 ── */
/* ── tombstone（A1-R12）：declare hasWorkspaceFilePayload（原 Nj，52251）删除 → 文件头
 *    ../components/composer/FileMentionDragHelpers import 消费（本批逐字转录；调用点 4657/4986 逐字不变）。 ── */
/* ── tombstone（A1-R12）：declare readWorkspaceFilePayload（原 Mj，52248）删除 → 文件头
 *    ../components/composer/FileMentionDragHelpers import 消费（本批逐字转录；调用点 5003 逐字不变）。 ── */
/* ── tombstone（A1-R12）：declare isWorkspaceFileDragEvent（原 tUe，52254）删除 → 文件头
 *    ../components/composer/FileMentionDragHelpers import 消费（本批逐字转录，谓词签名沿用原 declare；调用点 4653 逐字不变）。 ── */
/* ── tombstone（A1-R12）：declare buildWorkspaceFileMentionPayload（原 aUe，52271）删除 → 文件头
 *    ../components/composer/FileMentionDragHelpers import 消费（本批逐字转录；唯一消费 = applyWorkspaceFileMentionDrop 4605）。 ── */
/* ── tombstone（A1-R12）：interface WorkspaceFileDragPayload（本地 4 字段窄化形）删除 → type import
 *    FileMentionDragHelpers.WorkspaceFileDragPayload（bundle eUe 52219 解析输出含 workspacePath/
 *    workspaceIdentity，aUe 52269 实测消费 e.workspacePath；本地窄形仅 declare 时代产物）。 ── */

/** 19. 会话引用装配/会话域引用存取（本 chunk 2741–2819，F03 域） */
/* ── tombstone〔A1-R138〕：declare function appendConversationSelections（原 Moe，F03 域 2761）删除 →
 *    文件头 ConversationSelectionCore 导入别名接入（appendSelectionBlockToText as appendConversationSelections；
 *    canonical = A1-P1-B4 逐字真身，any 面超集相容）。消费面实证（1 处）：@7170 逐字不变。 ── */
/* ── tombstone〔A1-R129z〕：declare function extractConversationSelections（原 Noe，
 *    styles 74669 / F03 域 2775）删除 → 文件头 `extractSelectionsFromText as
 *    extractConversationSelections` 真实 import（canonical = components/conversation/
 *    ConversationSelectionCore A1-P1-B4 逐字真身，roundtrip 证明在案；消费面 7172 逐字不变）。 ── */
export interface ConversationSelection { // 〔A1-R22〕补 export：Conversation ParsedUserInput 型别收敛消费（型别擦除，环安全）
  /* 〔A1-R22〕型缝：koe（2720）构建面携 id/text/sourceSessionId/sourceRowId/contentType（Ds 2827 守护窄化所依）；
   * 原开放索引签名保留（uit 90087 消费面按束真渲染 e.text/e.id）。 */
  id?: string;
  text?: string;
  sourceSessionId?: string;
  sourceRowId?: number;
  contentType?: string;
  [key: string]: unknown;
}
/* 〔A1-R21〕型缝：sessionId 放宽为 string | null——bundle 消费面（composer 90400 tZe({ sessionId: t, … })）
 * 透传 composer sessionId prop（Home 5590 面 string | null）；F03 域存取函数为 ambient declare，编译期擦除。 */
/* ── tombstone〔A1-R138〕：declare 六件（原 Cs/ws/Doe/Ooe/Foe/Ioe，F03 域 2732/2738/2734/2743/2816/2819）
 *    删除 → 文件头 ConversationSelectionCore 导入别名接入（listSelectionReferences/selectionLoadErrorOf/
 *    setSelectionReferences/clearSelectionLoadError/isSelectionAddEvent/selectionAddEventName 六 canonical，
 *    A1-P1-B4 逐字真身，any 面超集相容；模块级 Map 存取与事件名同束真形）。
 *    消费面实证（6 件共 10 处）：7621/7622/7624×2/7630/7637/7640×2/7642×2/7657 逐字不变。 ── */
interface SessionScopedReference {
  id: string;
  status?: string;
  kind?: string;
  /* 〔A1-R22〕型缝：存取面（F03 readSessionScopedReferences）回读的引用由 koe（2720）构建，
   * 携 text/sourceSessionId/sourceRowId/contentType；uit（90087）chip 行经 Ds（2827）守护消费。 */
  text?: string;
  sourceSessionId?: string;
  sourceRowId?: number;
  contentType?: string;
  [key: string]: unknown;
}

/** 20. 输入遥测 / 路径判定 / pptx 域 */
declare function reportLexicalInputTelemetry(payload: {
  lagMs: number;
  textLength: number;
  isProgrammatic: boolean;
  isComposing: boolean;
  taskId?: string;
}): void;
/* ── tombstone〔A1-R141〕：declare function isPathWithinWorkspace 删除——伪面销账：全树零消费（C7 遥测/路径/pptx 簇）；路径包含判定 declare 面，后续如需按束真转录取回。 ── */
/** pptx 域（imeComposition 导出族 + 本 chunk）：事件判定/匹配/去重/键/markdown 装配 */
/* ── tombstone〔A1-R141〕：declare function isPptxElementAddDetail 删除——伪面销账：全树零消费
 *    （§0「留守」名单注 7618–7621 列此名系历史快照，今实测仅本声明位）；pptx detail 判定面，
 *    后续如需按束真转录取回（buildPptxElementsMarkdown 同族，彼件仍留守待实体化）。 ── */
declare function buildPptxElementsMarkdown(content: string, elements: PptxElementAddDetail[]): string;
/* ── tombstone〔A1-R129z〕：declare function extractPptxElementReferencesFromContent
 *    删除 → 文件头 `extractPptxElementReferences as extractPptxElementReferencesFromContent`
 *    真实 import。束真取证：styles KXe（2122719）首段 `w(e)` 之 `w` = 块首导入
 *    `m as w` ← ./imeComposition-DEYFkwWm.js（原码 ur），canonical = ImeComposition@1164
 *    逐字。一符一家归 imeComposition 域；消费面 7169 逐字不变。型面：canonical 返
 *    PptxElementReference[]，对 PptxElementAddDetail[]（开放索引签名面）可指派，无缝。 ── */
export interface PptxElementAddDetail {
  id: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  sourceTitle: string;
  sourcePath: string;
  sourceFingerprint?: string;
  slideIndex: number;
  nodeId: string;
  nodeName?: string;
  nodeType?: string;
  text?: string;
  selectedText?: string;
  comment?: string;
  [key: string]: unknown;
}
/** 21. 用量域消费面（UsageDeep.tsx / F12）——本文件不重复实现，仅注释指引 */

/* ============================================================================
 * [A] 子代理/技能上下文 store 与钩子（js 63490–63751）
 * ==========================================================================*/

/**
 * 原 pqe（js 63490）：按 工作区×供应商 解析子代理上下文。
 * 边界注记：位于登记起点 63593 之前（账本将该段记为 Lexical vendored，实测 first-party），
 * 且被 SJe（65070）直接消费，故随族收录（裁决 §R1）。
 */
export function useSubagentsContext(
  workspacePath: string | null | undefined, // 〔A1-R137〕面级联
  provider: string,
  workspaceIdentity?: string | null,
) {
  const { subagentsService } = useServices();
  const trimmedIdentity = workspaceIdentity?.trim() || void 0;
  const tabResolution = useWorkspaceTabsSelector(
    useShallowSelector((state: any) => { // 〔A1-R39〕co≡useShallowSelector 改指（≡ bundle 63494/63684）
      if (!workspacePath)
        return {
          workspaceIdentity: void 0,
          preferredRemoteSessionId: void 0,
          remoteTarget: void 0,
        };
      const activeTab = state.activeTabId ? state.tabs.find((e: any) => e.id === state.activeTabId) : void 0;
      const matches = (tab: any) =>
        isWorkspaceTab(tab) && tab.workspacePath === workspacePath && (!trimmedIdentity || tab.workspaceIdentity?.trim() === trimmedIdentity);
      const tab = activeTab && matches(activeTab) ? activeTab : state.tabs.find(matches);
      return {
        workspaceIdentity: tab?.workspaceIdentity,
        preferredRemoteSessionId: tab?.remoteSessionId,
        remoteTarget: tab?.remoteTarget,
      };
    }),
  );
  const effectiveIdentity = trimmedIdentity || tabResolution.workspaceIdentity;
  const remoteReady = remoteScopeKey({
    workspaceIdentity: effectiveIdentity,
    remoteSessionId: resolvePreferredRemoteSessionId(
      workspacePath!,
      tabResolution.preferredRemoteSessionId,
      effectiveIdentity,
      tabResolution.remoteTarget,
    ),
    remoteTarget: tabResolution.remoteTarget,
  });
  const contextKey = workspacePath ? subagentContextKey(workspacePath, provider, effectiveIdentity) : null;
  const contextEntry = useSubagentStore((state) => (contextKey ? state.contexts[contextKey] : void 0));
  const initialize = useSubagentStore((state) => state.initialize);
  const refresh = useSubagentStore((state) => state.refresh);
  const setEnabled = useSubagentStore((state) => state.setEnabled);
  const loadedContext = useShallowSubagentLoadedState(
    useShallowSelector((state: any) => ({ // 〔A1-R39〕co 改指（≡ bundle 63523/63713）
      workspacePath: state.loadedWorkspacePath,
      workspaceIdentity: state.loadedWorkspaceIdentity,
      provider: state.loadedProvider,
      agents: state.agents,
      capability: state.capability,
      loading: state.loading,
      error: state.error,
    })),
  );
  const isLoadedContext =
    workspacePath !== null &&
    loadedContext.workspacePath === workspacePath &&
    loadedContext.workspaceIdentity === (effectiveIdentity ?? null) &&
    loadedContext.provider === provider;
  React.useEffect(() => {
    !workspacePath || !remoteReady || contextEntry || initialize(workspacePath, provider, subagentsService, effectiveIdentity);
  }, [contextEntry, initialize, provider, subagentsService, effectiveIdentity, workspacePath, remoteReady]);
  const handleRefresh = React.useCallback(async () => {
    remoteReady && workspacePath && (await refresh(workspacePath, provider, subagentsService, effectiveIdentity));
  }, [provider, refresh, subagentsService, effectiveIdentity, workspacePath, remoteReady]);
  const handleSetEnabled = React.useCallback(
    async (agentId: string, enabled: boolean) => { // 〔A1-R140〕面校准：束 pqe g 真形 = 2 参 6 箭（styles 1962272 async (n, i) => f(e, t, n, i, r, o) → Bn.setEnabled 6 参面）；旧转录误取 WB 3 参 7 箭之形（declare any 期潜缝；束内此面零调用，运行期无变）
      remoteReady && workspacePath && (await setEnabled(workspacePath, provider, agentId, enabled, subagentsService, effectiveIdentity));
    },
    [provider, setEnabled, subagentsService, effectiveIdentity, workspacePath, remoteReady],
  );
  return React.useMemo(
    () => ({
      agents: remoteReady ? (isLoadedContext ? loadedContext.agents : (contextEntry?.agents ?? [])) : [],
      capability: remoteReady ? (isLoadedContext ? loadedContext.capability : (contextEntry?.capability ?? null)) : null,
      loading: remoteReady && workspacePath !== null ? (isLoadedContext ? loadedContext.loading : !contextEntry || contextEntry.loading) : false,
      error: remoteReady ? (isLoadedContext ? loadedContext.error : (contextEntry?.error ?? null)) : null,
      refresh: handleRefresh,
      setEnabled: handleSetEnabled,
    }),
    [contextEntry, loadedContext, handleRefresh, handleSetEnabled, isLoadedContext, workspacePath, remoteReady],
  );
}

/** 原 RB（js 63562）：在途技能上下文请求缓存（键 → Promise） */
const skillContextRequestCache = new Map<string, Promise<{ skills: SkillEntry[]; capability: unknown }>>();
/** 原 zB（js 63563）：键 → 加载代次（防竞态） */
const skillContextGeneration = new Map<string, number>();
/** 原 mqe（js 63564）：代次计数器 */
let skillContextGenerationCounter = 0;

/** 原 BB（js 63565）：技能上下文缓存键 `workspace::provider[::identity]` */
function skillContextCacheKey(workspacePath: string, provider: string, workspaceIdentity?: string): string {
  return `${workspaceIdentity?.trim() || workspacePath}::${normalizeProviderId(provider)}`;
}

/** 原 VB（js 63568）：合并单个上下文条目 */
function mergeSkillContextEntry(state: SkillContextStoreState, key: string, entry: SkillContextEntry): Pick<SkillContextStoreState, `contexts`> {
  return { contexts: { ...state.contexts, [key]: entry } };
}

/** 原 hqe（js 63571）：在途请求去重（bypassCache 时跳过缓存） */
function dedupeSkillContextList(
  key: string,
  workspacePath: string,
  provider: string,
  skillsService: SkillsService,
  workspaceIdentity?: string,
  bypassCache = false,
) {
  if (!bypassCache) {
    const pending = skillContextRequestCache.get(key);
    if (pending) return pending;
  }
  const request = skillsService
    .list({ workspacePath, workspaceIdentity, provider })
    .finally(() => {
      skillContextRequestCache.get(key) === request && skillContextRequestCache.delete(key);
    });
  return (skillContextRequestCache.set(key, request), request);
}

/** 原 HB（js 63581）：加载技能上下文（两阶段：占位 loading → 结果/错误；代次防竞态） */
export async function loadSkillContext(
  args: {
    workspacePath: string;
    provider: string;
    skillsService: SkillsService;
    workspaceIdentity?: string;
    bypassCache: boolean;
  },
  set: (fn: (state: SkillContextStoreState) => Partial<SkillContextStoreState>) => void,
  get: () => SkillContextStoreState,
) {
  const provider = normalizeProviderId(args.provider);
  const identity = args.workspaceIdentity?.trim() || void 0;
  const key = skillContextCacheKey(args.workspacePath, provider, identity);
  const existing = get().contexts[key];
  const generation = ++skillContextGenerationCounter;
  (skillContextGeneration.set(key, generation),
    set((state) =>
      mergeSkillContextEntry(state, key, {
        workspacePath: args.workspacePath,
        workspaceIdentity: identity ?? null,
        provider,
        skills: existing?.skills ?? [],
        capability: existing?.capability ?? null,
        loading: existing?.loaded !== true,
        loaded: existing?.loaded ?? false,
        error: null,
      }),
    ));
  try {
    const result = await dedupeSkillContextList(key, args.workspacePath, provider, args.skillsService, identity, args.bypassCache);
    if (skillContextGeneration.get(key) !== generation) return;
    set((state) =>
      mergeSkillContextEntry(state, key, {
        workspacePath: args.workspacePath,
        workspaceIdentity: identity ?? null,
        provider,
        skills: result.skills,
        capability: result.capability,
        loading: false,
        loaded: true,
        error: null,
      }),
    );
  } catch (error) {
    if (skillContextGeneration.get(key) !== generation) return;
    const message = error instanceof Error ? error.message : String(error);
    (logger.error(`[skills] workspace context load failed`, {
      workspacePath: args.workspacePath,
      workspaceIdentity: identity,
      provider,
      error: message,
    }),
      set((state) =>
        mergeSkillContextEntry(state, key, {
          ...(state.contexts[key] ?? {
            workspacePath: args.workspacePath,
            workspaceIdentity: identity ?? null,
            provider,
            skills: [],
            capability: null,
            loaded: false,
          }),
          loading: false,
          error: message,
        }),
      ));
  }
}

interface SkillContextEntry {
  workspacePath: string;
  workspaceIdentity: string | null;
  provider: string;
  skills: SkillEntry[];
  capability: unknown;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}
interface SkillContextStoreState {
  contexts: Record<string, SkillContextEntry | undefined>;
  initialize(workspacePath: string, provider: string, skillsService: SkillsService, workspaceIdentity?: string): Promise<void>;
  refresh(workspacePath: string, provider: string, skillsService: SkillsService, workspaceIdentity?: string): Promise<void>;
  setEnabled( // 〔A1-R140〕面校准：束 UB setEnabled 槽序（styles 1965136：第3槽=skillId，第4槽=scope；体 scope: a, skillId: i）；旧转录误对两槽名（此面零调用，运行期无变）
    workspacePath: string,
    provider: string,
    skillId: string,
    scope: string,
    enabled: boolean,
    skillsService: SkillsService,
    workspaceIdentity?: string,
  ): Promise<void>;
}

/** 原 UB（js 63640 / jsx 56751）：技能上下文 store（zustand） */
/** A1-R8 双实例收敛 canonical：bundle 唯一 UB（@63640，本文件转录域 63571–63704）。
 * 树内原两并行实例（本文件 + stores/skillContextStore.ts 80）；本文件消费面
 * 1173–1176 = bundle 63708–63711 钩子簇。stores/ 侧降 re-export shim（其 →本文件
 * 边 A0-CLEANUP2 item 13 既成，零新边）。 */
export const useSkillContextStore = createStore<SkillContextStoreState>((set, get) => ({
  contexts: {},
  async initialize(workspacePath, provider, skillsService, workspaceIdentity) {
    const key = skillContextCacheKey(workspacePath, provider, workspaceIdentity);
    get().contexts[key] ||
      (await loadSkillContext(
        { workspacePath, provider, skillsService, workspaceIdentity, bypassCache: false },
        set as never,
        get,
      ));
  },
  async refresh(workspacePath, provider, skillsService, workspaceIdentity) {
    await loadSkillContext(
      { workspacePath, provider, skillsService, workspaceIdentity, bypassCache: true },
      set as never,
      get,
    );
  },
  async setEnabled(workspacePath, provider, skillId, scope, enabled, skillsService, workspaceIdentity) {
    const normalizedProvider = normalizeProviderId(provider);
    try {
      (await skillsService.setEnabled({
        workspacePath,
        workspaceIdentity: workspaceIdentity?.trim() || void 0,
        provider: normalizedProvider,
        scope,
        skillId,
        enabled,
      }),
        await get().refresh(workspacePath, normalizedProvider, skillsService, workspaceIdentity));
    } catch (error) {
      const key = skillContextCacheKey(workspacePath, normalizedProvider, workspaceIdentity);
      const message = error instanceof Error ? error.message : String(error);
      (set as (fn: (state: SkillContextStoreState) => Partial<SkillContextStoreState>) => void)((state) => {
        const entry = state.contexts[key];
        return entry ? mergeSkillContextEntry(state, key, { ...entry, loading: false, error: message }) : {};
      });
    }
  },
}));

/** 原 WB（js 63680）：按 工作区×供应商 解析技能上下文（与 pqe 对称） */
export function useSkillsContext(
  workspacePath: string | null | undefined, // 〔A1-R137〕面级联
  provider: string,
  workspaceIdentity?: string | null,
) {
  const { skillsService } = useServices() as unknown as { skillsService: SkillsService };
  const trimmedIdentity = workspaceIdentity?.trim() || void 0;
  const tabResolution = useWorkspaceTabsSelector(
    useShallowSelector((state: any) => { // 〔A1-R39〕co≡useShallowSelector 改指（≡ bundle 63494/63684）
      if (!workspacePath)
        return {
          workspaceIdentity: void 0,
          preferredRemoteSessionId: void 0,
          remoteTarget: void 0,
        };
      const activeTab = state.activeTabId ? state.tabs.find((e: any) => e.id === state.activeTabId) : void 0;
      const matches = (tab: any) =>
        isWorkspaceTab(tab) && tab.workspacePath === workspacePath && (!trimmedIdentity || tab.workspaceIdentity?.trim() === trimmedIdentity);
      const tab = activeTab && matches(activeTab) ? activeTab : state.tabs.find(matches);
      return {
        workspaceIdentity: tab?.workspaceIdentity,
        preferredRemoteSessionId: tab?.remoteSessionId,
        remoteTarget: tab?.remoteTarget,
      };
    }),
  );
  const effectiveIdentity = trimmedIdentity || tabResolution.workspaceIdentity;
  const remoteReady = remoteScopeKey({
    workspaceIdentity: effectiveIdentity,
    remoteSessionId: resolvePreferredRemoteSessionId(
      workspacePath!,
      tabResolution.preferredRemoteSessionId,
      effectiveIdentity,
      tabResolution.remoteTarget,
    ),
    remoteTarget: tabResolution.remoteTarget,
  });
  const contextKey = workspacePath ? skillContextCacheKey(workspacePath, provider, effectiveIdentity) : null;
  const contextEntry = useSkillContextStore((state) => (contextKey ? state.contexts[contextKey] : void 0));
  const initialize = useSkillContextStore((state) => state.initialize);
  const refresh = useSkillContextStore((state) => state.refresh);
  const setEnabled = useSkillContextStore((state) => state.setEnabled);
  const loadedContext = useShallowSkillLoadedState(
    useShallowSelector((state: any) => ({ // 〔A1-R39〕co 改指（≡ bundle 63523/63713）
      workspacePath: state.loadedWorkspacePath,
      workspaceIdentity: state.loadedWorkspaceIdentity,
      provider: state.loadedProvider,
      skills: state.skills,
      capability: state.capability,
      loading: state.loading,
      error: state.error,
    })),
  );
  const isLoadedContext =
    workspacePath !== null &&
    loadedContext.workspacePath === workspacePath &&
    loadedContext.workspaceIdentity === (effectiveIdentity ?? null) &&
    loadedContext.provider === provider;
  React.useEffect(() => {
    !workspacePath || !remoteReady || contextEntry || initialize(workspacePath, provider, skillsService, effectiveIdentity);
  }, [contextEntry, initialize, provider, skillsService, effectiveIdentity, workspacePath, remoteReady]);
  const handleRefresh = React.useCallback(async () => {
    remoteReady && workspacePath && (await refresh(workspacePath, provider, skillsService, effectiveIdentity));
  }, [provider, refresh, skillsService, effectiveIdentity, workspacePath, remoteReady]);
  const handleSetEnabled = React.useCallback(
    async (skillId: string, scope: string, enabled: boolean) => { // 〔A1-R140〕面校准：束 WB g 参序 (n, i, a) → UB 槽3=skillId/槽4=scope（styles 1967458）；旧转录误对两名（此面零调用，运行期无变）
      remoteReady && workspacePath && (await setEnabled(workspacePath, provider, skillId, scope, enabled, skillsService, effectiveIdentity));
    },
    [provider, setEnabled, skillsService, effectiveIdentity, workspacePath, remoteReady],
  );
  return React.useMemo(
    () => ({
      skills: remoteReady ? (isLoadedContext ? loadedContext.skills : (contextEntry?.skills ?? [])) : [],
      capability: remoteReady ? (isLoadedContext ? loadedContext.capability : (contextEntry?.capability ?? null)) : null,
      loading: remoteReady && workspacePath !== null ? (isLoadedContext ? loadedContext.loading : !contextEntry || contextEntry.loading) : false,
      error: remoteReady ? (isLoadedContext ? loadedContext.error : (contextEntry?.error ?? null)) : null,
      refresh: handleRefresh,
      setEnabled: handleSetEnabled,
    }),
    [contextEntry, loadedContext, handleRefresh, handleSetEnabled, isLoadedContext, workspacePath, remoteReady],
  );
}
/* ── tombstone〔A1-R140〕：declare function useShallowSkillLoadedState（原 Ne ≡ Yn，jsx 2387 导出 t）
 *    删除 → 文件头 SkillStore 导入别名接入（useSkillsStore as useShallowSkillLoadedState；
 *    canonical = stores/skillsStore@100 逐字真身，与 600 号 Gn 孪生；loaded* 字段面全合）。
 *    消费面实证（1 处）：1214 逐字不变。 ── */
/** ni（本 chunk 横切）：供应商 id 归一 */

/* ============================================================================
 * [B1] 建议过滤/评分（js 63751–63843）
 * ==========================================================================*/

/** 原 gqe（js 63752）：建议缺省上限 */
const SUGGESTION_DEFAULT_LIMIT = 1000;

/** 原 GB（js 63753）：查询非空判定 */
function hasNonEmptyQuery(query: string): boolean {
  return query.trim().length > 0;
}

/** 原 _qe（js 63756）：空查询时限流（缺省 3） */
function suggestionLimitForQuery(query: string, emptyLimit = 3): number | undefined {
  return hasNonEmptyQuery(query) ? void 0 : emptyLimit;
}

/** 原 vqe（js 63759）：仅保留可见段（loading/错误/有条目） */
function filterVisibleSuggestionSections(sections: SuggestionSectionModel[]): SuggestionSectionModel[] {
  return sections.filter((section) => section.loading || section.errorText !== null || section.items.length > 0);
}

/** 原 KB（js 63762）：模糊评分（前缀 < 包含 < 子序列；不可匹配 → null） */
function fuzzyScore(haystack: string | undefined, needle: string): number | null {
  const text = haystack!.trim().toLowerCase();
  const query = needle.trim().toLowerCase();
  if (!text) return null;
  if (!query) return 0;
  if (text.startsWith(query)) return text.length - query.length;
  const index = text.indexOf(query);
  if (index !== -1) return 100 + index;
  let score = 200;
  let cursor = 0;
  for (const char of query) {
    const found = text.indexOf(char, cursor);
    if (found === -1) return null;
    ((score += found - cursor), (cursor = found + 1));
  }
  return score + (text.length - query.length);
}

/** 原 yqe（js 63779）：按评分排序（同分按原序，再按标签 localeCompare） */
function sortByFuzzyScore<T>(
  items: T[],
  scoreOf: (item: T) => number | null,
  labelOf: (item: T) => string,
): T[] {
  return items
    .map((item, index) => {
      const score = scoreOf(item);
      return score === null ? null : { index, item, score };
    })
    .filter((entry) => entry !== null)
    .sort((a, b) =>
      a!.score === b!.score
        ? a!.index === b!.index
          ? labelOf(a!.item).localeCompare(labelOf(b!.item))
          : a!.index - b!.index
        : a!.score - b!.score,
    )
    .map((entry) => entry!.item);
}

/** 原 qB（js 63795）：截断到 limit */
function limitItems<T>(items: T[], limit: number): T[] {
  if (!Number.isFinite(limit)) return items;
  const count = Math.max(0, Math.trunc(limit ?? 0));
  return items.slice(0, count);
}

/** 原 bqe（js 63800）：目录排后（文件优先） */
function fileDirectoryPriority(item: MentionSuggestionItem): number {
  return item.category === `files` ? +(item.data?.kind === `directory`) : 0;
}

/** 原 xqe（js 63803）：按目录优先稳定排序 */
function sortFilesDirectoryFirst(items: MentionSuggestionItem[]): MentionSuggestionItem[] {
  return items
    .map((item, index) => ({ index, item, priority: fileDirectoryPriority(item) }))
    .sort((a, b) => a.priority - b.priority || a.index - b.index)
    .map(({ item }) => item);
}

/** 原 JB（js 63809）：建议查询过滤（空查询 → 目录优先原序；requireQuery → 空） */
function filterSuggestionsByQuery(
  items: MentionSuggestionItem[],
  query: string,
  options: { limit?: number; requireQuery?: boolean } = {},
): MentionSuggestionItem[] {
  const limit = options.limit ?? SUGGESTION_DEFAULT_LIMIT;
  const trimmed = query.trim();
  return trimmed
    ? limitItems(
        sortByFuzzyScore(
          items,
          (item) => {
            const labelScore = fuzzyScore(item.label, trimmed);
            const descriptionScore = fuzzyScore(item.description, trimmed);
            const valueScore = fuzzyScore(item.value, trimmed);
            const keywordScore = Math.min(
              ...(item.keywords ?? []).map((keyword) => {
                const score = fuzzyScore(keyword, trimmed);
                return score === null ? 1 / 0 : score + 300;
              }),
              1 / 0,
            );
            const best = Math.min(
              labelScore ?? 1 / 0,
              valueScore === null ? 1 / 0 : valueScore + 25,
              descriptionScore === null ? 1 / 0 : descriptionScore + 100,
              keywordScore,
            );
            return Number.isFinite(best) ? best : null;
          },
          (item) => item.label,
        ),
        limit,
      )
    : options.requireQuery
      ? []
      : limitItems(sortFilesDirectoryFirst(items), limit);
}

/* ============================================================================
 * [B2] 技能/子代理建议构造（js 63843–64070）
 * ==========================================================================*/

/** 原 YB（js 63843）：子代理作用域优先级（workspace < user < 其它） */
function subagentScopePriority(agent: SubagentEntry): number {
  return agent.scope === `workspace` ? 0 : agent.source === `user` ? 1 : 2;
}

/** 原 Sqe（js 63846）：子代理作用域英文标签 */
function subagentScopeLabel(agent: SubagentEntry): string {
  return agent.scope === `workspace`
    ? `Workspace`
    : agent.source === `plugin`
      ? `Plugin`
      : agent.source === `built-in`
        ? `Built-in`
        : `User`;
}

/** 原 Cqe（js 63855）：按名去重（保留作用域优先级更高者）→ 子代理建议条目 */
function dedupeSubagentsByName(agents: SubagentEntry[]): MentionSuggestionItem[] {
  const byName = new Map<string, SubagentEntry>();
  for (const agent of agents) {
    if (!agent.enabled) continue;
    const name = agent.name.trim().toLowerCase();
    if (!name) continue;
    const existing = byName.get(name);
    (!existing || subagentScopePriority(agent) < subagentScopePriority(existing)) && byName.set(name, agent);
  }
  return [...byName.values()].map((agent) => {
    const scopeLabel = subagentScopeLabel(agent);
    return {
      id: `subagent:${agent.id}`,
      category: `subagents`,
      label: agent.name,
      description: agent.description ? `${scopeLabel} · ${agent.description}` : scopeLabel,
      value: agent.name,
      markdown: subagentMentionMarkdown(agent.name),
      keywords: [agent.name, agent.description, agent.scope, agent.source, scopeLabel, agent.model ?? ``, agent.path],
      data: { path: agent.path, scope: agent.scope, source: agent.source, model: agent.model },
    };
  });
}

/** 原 wqe（js 63878）：按路径探测 glm 技能来源 */
function detectGlmSkillOrigin(path: string): string {
  const normalized = path.replaceAll(`\\`, `/`).toLowerCase();
  return normalized.includes(`/.nofy/skills/`) || normalized.includes(`/.nofy/cli/plugins/cache/`)
    ? `glm`
    : `unknown`;
}

/** 原 Tqe（js 63884）：glm 技能 id 前缀 */
const GLM_SKILL_ID_PREFIX_REGEX = /^glm:/;

/** 原 Eqe（js 63885）：glm 技能判定（插件作用域 / glm: 前缀 / 路径特征） */
function isGlmSkill(skill: SkillEntry): boolean {
  return (
    skill.scope === `plugin` || (typeof skill.id == `string` && GLM_SKILL_ID_PREFIX_REGEX.test(skill.id)) || detectGlmSkillOrigin(skill.path) === `glm`
  );
}

/** 原 XB（js 63890）：仅保留 glm 技能 */
function filterGlmSkills(skills: SkillEntry[], _provider: string): SkillEntry[] {
  return skills.filter(isGlmSkill);
}

/** 原 Dqe（js 63893）：官方技能插件名集合（MODULE-MAP「建议卡数据」注记所指） */
const OFFICIAL_SKILL_PLUGINS = new Set([
  `android-emulator`,
  `browser`,
  `browser-use`,
  `document-skills`,
  `ios-simulator`,
  `restore-legacy-sessions`,
  `skill-creator`,
  `superpowers`,
  `zcode-guide`,
]);

/** 原 Oqe（js 63903）：官方插件路径特征 */
const OFFICIAL_PLUGIN_PATH_MARKERS = [
  `/zcode-plugins-official/`,
  `\\zcode-plugins-official\\`,
  `/android-emulator-plugin/`,
  `/browser-use-plugin/`,
  `/document-skills-plugin/`,
  `/ios-simulator-plugin/`,
  `/restore-legacy-sessions-plugin/`,
  `/skill-creator-plugin/`,
  `/superpowers-plugin/`,
  `/zcode-guide-plugin/`,
];

/** 原 kqe（js 63911）：官方技能精选文案（zh-CN/en-US；逐字保留含 REBRAND 注释） */
const CURATED_SKILL_DESCRIPTIONS: Record<string, Record<string, string>> = {
  "android-dev": {
    "zh-CN": `通过 android-emulator MCP 工具构建、运行、检查并轻量自动化 Android 应用。`,
    "en-US": `Build, run, inspect, and lightly automate Android apps through the android-emulator MCP tools.`,
  },
  brainstorming: {
    "zh-CN": `在任何创造性工作之前使用：创建功能、构建组件、增加能力或修改行为；先探索用户意图、需求和设计。`,
    "en-US": `Use before any creative work, including creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements, and design before implementation.`,
  },
  "control-browser": {
    "zh-CN": `控制 nofy 内置浏览器，用于打开、检查、点击、输入、截图或验证网页和本地开发页面。`, // REBRAND-004+104
    "en-US": `Control nofy's built-in browser to open, inspect, click, type, screenshot, or verify webpages and local development targets.`, // REBRAND-004+104
  },
  "dispatching-parallel-agents": {
    "zh-CN": `面对 2 个以上彼此独立、无共享状态或顺序依赖的任务时使用。`,
    "en-US": `Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies.`,
  },
  docx: {
    "zh-CN": `完整的 DOCX 文档创建、编辑和分析能力，支持修订、批注、格式保持和文本提取。适用于创建新文档、修改内容、处理修订、添加批注或其它专业 Word 文档任务。`,
    "en-US": `Create, edit, and analyze DOCX documents with revisions, comments, formatting preservation, and text extraction. Use for new documents, edits, revision handling, comments, and professional Word document work.`,
  },
  "executing-plans": {
    "zh-CN": `已有书面实现计划，并要在带评审检查点的独立会话中执行时使用。`,
    "en-US": `Use when you have a written implementation plan to execute in a separate session with review checkpoints.`,
  },
  "finishing-a-development-branch": {
    "zh-CN": `实现已完成、测试通过、需要决定如何合并、发 PR 或清理分支时使用。`,
    "en-US": `Use when implementation is complete, tests pass, and you need to decide how to integrate the work through merge, PR, or cleanup.`,
  },
  "ios-dev": {
    "zh-CN": `通过 ios-simulator MCP 工具构建、运行、检查并轻量自动化 iOS 模拟器应用。`,
    "en-US": `Build, run, inspect, and lightly automate iOS Simulator apps through the ios-simulator MCP tools.`,
  },
  pdf: {
    "zh-CN": `专业 PDF 工具集，覆盖报告、创意视觉、学术 LaTeX 和现有 PDF 处理四条生产线。可按文档类型自动路由，支持报告、海报、论文、简历、提取、合并、拆分、表单填写和格式转换等任务。`,
    "en-US": `Professional PDF toolkit for reports, creative visuals, academic LaTeX, and existing-PDF workflows. Supports reports, posters, papers, resumes, extraction, merge, split, forms, and conversion.`,
  },
  pptx: {
    "zh-CN": `检查并窄范围更新从 PPTX 预览区选择的元素。通过完整文件指纹和 OOXML 定位校验 shape 文本或表格单元格，冲突时停止而不猜测。`,
    "en-US": `Inspect and narrowly update elements selected in PPTX Preview Pane. Verifies the whole-file fingerprint and OOXML locator for shape or table-cell text, and stops on conflicts instead of guessing.`,
  },
  "receiving-code-review": {
    "zh-CN": `收到代码评审反馈、准备实现建议前使用；尤其当反馈不清楚或技术上可疑时，需要严谨验证而非盲目同意。`,
    "en-US": `Use when receiving code review feedback before implementing suggestions, especially when feedback is unclear or technically questionable.`,
  },
  "requesting-code-review": {
    "zh-CN": `完成任务、实现重大功能或合并前，用于请求代码评审以确认满足需求。`,
    "en-US": `Use when completing tasks, implementing major features, or before merging to verify work meets requirements.`,
  },
  "restore-legacy-sessions": {
    "zh-CN": `检查、规划或执行 ACP 时代 nofy 旧 session 恢复到新的 nofy 任务与会话库。`, // REBRAND-004+104
    "en-US": `Inspect, plan, or restore old ACP-era nofy sessions into the new nofy task and session stores.`, // REBRAND-004+104
  },
  "skill-creator": {
    "zh-CN": `创建新技能、编辑现有技能并迭代措辞。适用于从零编写 SKILL.md、改进已有技能、把重复工作流沉淀为可复用技能，或优化技能描述以提升触发可靠性。`,
    "en-US": `Create new skills, edit existing skills, and iterate wording. Use for writing SKILL.md from scratch, improving skills, capturing repeated workflows, or tuning descriptions for reliable triggering.`,
  },
  "subagent-driven-development": {
    "zh-CN": `在当前会话中执行包含独立任务的实现计划时使用。`,
    "en-US": `Use when executing implementation plans with independent tasks in the current session.`,
  },
  "systematic-debugging": {
    "zh-CN": `遇到任何 bug、测试失败或异常行为时，在提出修复前使用。`,
    "en-US": `Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes.`,
  },
  "test-driven-development": {
    "zh-CN": `实现任何功能或 bugfix 时，在编写实现代码前使用。`,
    "en-US": `Use when implementing any feature or bugfix, before writing implementation code.`,
  },
  "using-git-worktrees": {
    "zh-CN": `开始需要隔离的功能工作或执行实现计划前使用，确保存在隔离 workspace，优先使用原生工具，否则回退 git worktree。`,
    "en-US": `Use when starting feature work that needs isolation or before executing implementation plans. Ensures an isolated workspace exists via native tools or git worktree fallback.`,
  },
  "using-superpowers": {
    "zh-CN": `开始任何对话时使用；说明如何查找和使用技能，并要求在任何回复包括澄清问题前调用 Skill 工具。`,
    "en-US": `Use when starting any conversation. Establishes how to find and use skills, requiring Skill tool invocation before any response including clarifying questions.`,
  },
  "verification-before-completion": {
    "zh-CN": `准备声明工作完成、已修复或测试通过前使用；要求先运行验证命令并确认输出，先有证据再下结论。`,
    "en-US": `Use before claiming work is complete, fixed, or passing. Requires running verification commands and confirming output before success claims.`,
  },
  "web-gui-tester": {
    "zh-CN": `使用 nofy Browser Use 对网页和本地 Web 前端执行纯 GUI 黑盒测试，通过真实用户交互、DOM 语义证据和截图验证功能、交互与响应式布局。`, // REBRAND-004+104
    "en-US": `Run pure GUI black-box tests against websites and local web frontends with nofy Browser Use, combining real user interactions, semantic DOM evidence, and inspected screenshots.`, // REBRAND-004+104
  },
  "writing-plans": {
    "zh-CN": `已有规格或多步骤任务需求，在动代码前用于编写实现计划。`,
    "en-US": `Use when you have a spec or requirements for a multi-step task, before touching code.`,
  },
  "writing-skills": {
    "zh-CN": `创建新技能、编辑现有技能或在发布前验证技能是否有效时使用。`,
    "en-US": `Use when creating new skills, editing existing skills, or verifying skills work before deployment.`,
  },
};

/** 原 Aqe（js 64010）：技能作用域本地化标签 */
function localizeSkillScopeLabel(scope: string, locale?: string): string {
  return locale === `zh-CN`
    ? scope === `workspace`
      ? `工作区`
      : scope === `plugin`
        ? `插件`
        : `用户`
    : scope === `workspace`
      ? `Workspace`
      : scope === `plugin`
        ? `Plugin`
        : `User`;
}

/** 原 jqe（js 64023）：精选文案回退到原描述 */
function curatedSkillDescription(skill: SkillEntry, locale?: string): string | undefined {
  return (isOfficialPluginSkill(skill) ? CURATED_SKILL_DESCRIPTIONS[skill.name]?.[locale ?? `en-US`] : void 0) ?? skill.description;
}

/** 原 Mqe（js 64026）：官方插件技能判定（插件名集合 / 路径特征） */
function isOfficialPluginSkill(skill: SkillEntry): boolean {
  if (skill.scope !== `plugin`) return false;
  const pluginName = skill.pluginName?.trim();
  if (pluginName && OFFICIAL_SKILL_PLUGINS.has(pluginName)) return true;
  const normalizedPath = skill.path.replaceAll(`\\`, `/`);
  return OFFICIAL_PLUGIN_PATH_MARKERS.some((marker) => normalizedPath.includes(marker));
}

/** 原 ZB（js 64033）：技能建议条目构造（按名去重，作用域优先级） */
function buildSkillSuggestions(skills: SkillEntry[], locale?: string): MentionSuggestionItem[] {
  const byName = new Map<string, SkillEntry>();
  const scopePriority = { workspace: 0, plugin: 1, user: 2 };
  for (const skill of skills) {
    const name = skill.name.trim().toLowerCase();
    const existing = byName.get(name);
    (!existing || scopePriority[skill.scope] < scopePriority[existing.scope]) && byName.set(name, skill);
  }
  return [...byName.values()].map((skill) => {
    const scopeLabel = localizeSkillScopeLabel(skill.scope, locale);
    const description = curatedSkillDescription(skill, locale);
    return {
      id: `skill:${skill.id}`,
      category: `skills`,
      label: skill.name,
      description: description ? `${scopeLabel} · ${description}` : scopeLabel,
      value: skill.name,
      markdown: skillMentionMarkdown(skill.name, skill.path),
      keywords: [...new Set([skill.name, skill.description, description, skill.scope])],
      data: { path: skill.path, scope: skill.scope },
    };
  });
}

/** 原 Nqe（js 64056）：技能建议段钩子（启用 + 过滤 + 查询） */
function useSkillSuggestions(
  workspacePath: string | null | undefined, // 〔A1-R137〕面级联
  workspaceIdentity: string | null | undefined,
  provider: string,
  query: string,
  enabled: boolean,
  requireQuery: boolean,
  emptyText: string,
  title: string,
) {
  const { locale } = useIntlContext();
  const { skills, loading, error } = useSkillsContext(workspacePath, provider, workspaceIdentity);
  const suggestions = React.useMemo(
    () =>
      buildSkillSuggestions(
        filterGlmSkills(skills, provider).filter((skill) => skill.enabled),
        locale,
      ),
    [locale, provider, skills],
  );
  const items = React.useMemo(() => filterSuggestionsByQuery(suggestions, query, { requireQuery }), [suggestions, query, requireQuery]);
  return { items: enabled ? items : [], loading, error: error ? Error(error) : null, emptyText, title };
}

/* ============================================================================
 * [B3] 触发解析与斜杠建议（js 64069–64278）
 * ==========================================================================*/

/** 原 QB（js 64070）：触发查询键（去抖比较用） */
function suggestionQueryKey(trigger: { trigger: string; query: string } | null): string | null {
  return trigger ? `${trigger.trigger}:${trigger.query}` : null;
}

/** 原 Pqe（js 64073）：提及触发正则（行内空白后的 / @ $ # ¥ ￥） */
const MENTION_TRIGGER_REGEX = /(^|\s)([/@$#¥￥])([^\s/@$#¥￥]*)$/;
/** 原 Fqe（js 64073）：提及词元前缀正则 */
const MENTION_TOKEN_PREFIX_REGEX = /^[^\s/@$#¥￥]*/;

/** 原 Iqe（js 64075）：人民币符号归一为 $ */
function normalizeCnyTrigger(trigger: string): string {
  return trigger === `¥` || trigger === `￥` ? `$` : trigger;
}

/** 原 $B（js 64078）：提及模糊评分（与 KB 同构，独立实例） */
function mentionFuzzyScore(haystack: string | undefined, needle: string): number | null {
  const text = haystack!.trim().toLowerCase();
  const query = needle.trim().toLowerCase();
  if (!text) return null;
  if (!query) return 0;
  if (text.startsWith(query)) return text.length - query.length;
  const index = text.indexOf(query);
  if (index !== -1) return 100 + index;
  let score = 200;
  let cursor = 0;
  for (const char of query) {
    const found = text.indexOf(char, cursor);
    if (found === -1) return null;
    ((score += found - cursor), (cursor = found + 1));
  }
  return score + (text.length - query.length);
}

/** 原 eV（js 64095）：提及建议综合评分（value < label+50 < description+250 < keywords+450） */
function scoreMentionSuggestion(item: MentionSuggestionItem, query: string): number | null {
  const valueScore = mentionFuzzyScore(item.value, query);
  const labelScore = mentionFuzzyScore(item.label, query);
  const descriptionScore = mentionFuzzyScore(item.description, query);
  const keywordScore = Math.min(
    ...(item.keywords ?? []).map((keyword) => {
      const score = mentionFuzzyScore(keyword, query);
      return score === null ? 1 / 0 : score + 450;
    }),
    1 / 0,
  );
  const best = Math.min(valueScore ?? 1 / 0, labelScore === null ? 1 / 0 : labelScore + 50, descriptionScore === null ? 1 / 0 : descriptionScore + 250, keywordScore);
  return Number.isFinite(best) ? best : null;
}

/** 原 tV（js 64109）：从光标前文本解析触发器 */
function parseMentionTrigger(textBeforeCursor: string): { trigger: string; query: string } | null {
  const match = MENTION_TRIGGER_REGEX.exec(textBeforeCursor);
  return match ? { trigger: normalizeCnyTrigger(match[2] ?? ``), query: match[3] ?? `` } : null;
}

/** 原 nV（js 64113）：补全重叠长度（光标后已有文本与建议值的公共前缀） */
function mentionCompletionOverlap(
  trigger: { query: string },
  textAfterCursor: string,
  candidateValues: string | string[],
): number {
  if (trigger.query.length === 0) return 0;
  const existingPrefix = MENTION_TOKEN_PREFIX_REGEX.exec(textAfterCursor)?.[0] ?? ``;
  if (!existingPrefix) return 0;
  const query = trigger.query.toLowerCase();
  const candidates = Array.isArray(candidateValues) ? candidateValues : [candidateValues];
  let overlap = 0;
  for (const candidate of candidates) {
    const normalized = candidate.trim().replace(/^[/@$#¥￥]+/, ``);
    if (!normalized || !normalized.toLowerCase().startsWith(query)) continue;
    const remainder = normalized.slice(trigger.query.length);
    if (!remainder) continue;
    const comparableLength = Math.min(existingPrefix.length, remainder.length);
    const existingSlice = existingPrefix.slice(0, comparableLength);
    remainder.toLowerCase().startsWith(existingSlice.toLowerCase()) && (overlap = Math.max(overlap, comparableLength));
  }
  return overlap;
}

/** 原 rV（js 64131）：提及建议排序（评分 → 原序 → 标签） */
function sortMentionSuggestions(items: MentionSuggestionItem[], query: string | null): MentionSuggestionItem[] {
  if (query === null) return [];
  const normalized = query.trim().toLowerCase();
  return normalized
    ? items
        .map((item, index) => {
          const score = scoreMentionSuggestion(item, normalized);
          return score === null ? null : { index, score, suggestion: item };
        })
        .filter((entry) => entry !== null)
        .sort((a, b) =>
          a!.score === b!.score
            ? a!.index === b!.index
              ? a!.suggestion.label.localeCompare(b!.suggestion.label)
              : a!.index - b!.index
            : a!.score - b!.score,
        )
        .map((entry) => entry!.suggestion)
    : items;
}

/** 原 Lqe（js 64151）：最佳建议索引（缺省 0） */
function findBestSuggestionIndex(items: MentionSuggestionItem[], query?: string | null): number {
  const normalized = query?.trim().toLowerCase() ?? ``;
  if (!normalized) return 0;
  let bestIndex = 0;
  let bestScore = 1 / 0;
  return (
    items.forEach((item, index) => {
      const score = scoreMentionSuggestion(item, normalized);
      score !== null && score < bestScore && ((bestScore = score), (bestIndex = index));
    }),
    bestIndex
  );
}

/** 原 iV（js 64164）：应用级斜杠命令 id 前缀 */
const APP_SLASH_PREFIX = `app-slash:`;

/** 原 Rqe（js 64165）：应用斜杠命令 → 建议条目 */
function buildAppSlashSuggestions(commands: AppSlashCommand[]): MentionSuggestionItem[] {
  return commands.flatMap((command) => {
    const name = normalizeSlashCommandName(command.value);
    return name
      ? [
          {
            id: `${APP_SLASH_PREFIX}${name}`,
            trigger: `/`,
            value: name,
            label: `/${name}`,
            description: command.description,
            keywords: [...new Set([name, command.description, ...(command.keywords ?? [])])],
          },
        ]
      : [];
  });
}

/** 原 zqe（js 64182）：应用斜杠建议判定（选中后执行 run） */
function isAppSlashSuggestion(item: MentionSuggestionItem): boolean {
  return item.id.startsWith(APP_SLASH_PREFIX);
}

/** 原 Bqe（js 64185）：斜杠面板可用条件（非草稿/非引用侧栏/非只读/非移动端） */
export function isSlashPanelAvailable(state: { // 〔A1-P1-B4〕补 export：R0 簇 ConversationPaneCore 652 消费面回取（原 Bqe 64184）
  isDraft: boolean;
  selectionSideChat: boolean;
  readOnly: boolean;
  isMobileViewport: boolean;
}): boolean {
  return !state.isDraft && !state.selectionSideChat && !state.readOnly && !state.isMobileViewport;
}

/** 原 aV（js 64188）：斜杠命令名归一（去前导 /） */
function normalizeSlashCommandName(name: string): string {
  return name.trim().replace(/^\/+/, ``);
}

/** 原 Vqe（js 64191）：会话斜杠命令 → 建议条目 */
function buildSessionSlashSuggestions(commands: SessionSlashCommand[]): MentionSuggestionItem[] {
  return commands.flatMap((command) => {
    const name = normalizeSlashCommandName(command.name);
    return name
      ? [
          {
            id: `slash:${name}`,
            trigger: `/`,
            value: name,
            label: command.inputHint?.trim() || `/${name}`,
            description: command.description,
            keywords: [...new Set([name, command.name, command.description, command.inputHint ?? ``])],
          },
        ]
      : [];
  });
}

/** 原 Hqe（js 64208）：子代理斜杠建议 */
function buildSubagentSlashSuggestions(agents: SubagentEntry[]): MentionSuggestionItem[] {
  return dedupeSubagentsByName(agents).map((item) => toSubagentSlashSuggestion(item));
}

/** 原 Uqe（js 64211）：技能斜杠建议（$ 前缀标签） */
function buildSkillSlashSuggestions(skills: SkillEntry[], locale?: string): MentionSuggestionItem[] {
  return buildSkillSuggestions(skills, locale).map((item) => ({
    id: item.id,
    trigger: `/`,
    value: item.value,
    label: `$${item.value}`,
    description: item.description,
    keywords: [...new Set([...(item.keywords ?? []), `skill`, `skills`, item.value])],
    data: item.data,
  }));
}

/** 原 Wqe（js 64222）：子代理建议 → 斜杠建议 */
function toSubagentSlashSuggestion(item: MentionSuggestionItem): MentionSuggestionItem {
  return {
    id: item.id,
    trigger: `/`,
    value: item.value,
    label: item.label,
    description: item.description,
    keywords: [...new Set([...(item.keywords ?? []), `subagent`, `agent`])],
    data: item.data,
  };
}

/** 原 Gqe（js 64233）：读取光标前后文本（非折叠选区 → null） */
function readTextAroundCursor(): { textAfterCursor: string; textBeforeCursor: string } | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;
  const anchor = selection.anchor;
  if (anchor.type !== `text`) return { textAfterCursor: ``, textBeforeCursor: $getRoot().getTextContent() };
  const node = anchor.getNode();
  if (!$isTextNode(node)) return null;
  const text = node.getTextContent();
  return { textAfterCursor: text.slice(anchor.offset), textBeforeCursor: text.slice(0, anchor.offset) };
}

/** 原 Kqe（js 64243）：斜杠面板建议 → 提及节点载荷（技能/子代理/命令三分支） */
function toSlashPanelMention(item: MentionSuggestionItem): MentionPayload {
  if (item.id.startsWith(`skill:`))
    return {
      id: item.id,
      category: `skills`,
      label: item.value as string,
      value: item.value as string,
      markdown: skillMentionMarkdown(item.value as string, item.data?.path as string | undefined),
      description: item.description,
      data: item.data,
    };
  if (item.id.startsWith(`subagent:`))
    return {
      id: item.id,
      category: `subagents`,
      label: item.value as string,
      value: item.value as string,
      markdown: subagentMentionMarkdown(item.value as string),
      description: item.description,
      data: item.data,
    };
  const commandName = normalizeSlashCommandName(item.value as string);
  return {
    id: item.id,
    category: `commands`,
    label: commandName,
    value: commandName,
    markdown: `/${commandName}`,
    description: item.description,
  };
}

/** 原 qqe（js 64274）：会话斜杠命令（任务 store 消费面） */
function useSessionSlashCommands(workspacePath: string | undefined, workspaceIdentity?: string | null): SessionSlashCommand[] { // 〔A1-R137〕面级联
  return useTaskStore((state) => taskScopeSelector(state, workspacePath, workspaceIdentity).slashCommands as SessionSlashCommand[]); // 〔型缝 A1-R140〕实存 unknown[] 宽面 → 会话斜杠命令面（运行期同物；R129n bFt 判例）
}

export interface AppSlashCommand {
  value: string;
  description?: string;
  keywords?: string[];
  run: () => void;
}
interface SessionSlashCommand {
  name: string;
  description?: string;
  inputHint?: string;
}
export interface MentionSuggestionItem {
  id: string;
  category?: string;
  label: string;
  value?: string;
  description?: string;
  markdown?: string;
  keywords?: Array<string | undefined>;
  data?: Record<string, unknown>;
  trigger?: string;
  disabled?: boolean;
  disabledReason?: string;
  content?: React.ReactNode;
  meta?: string;
}
interface MentionPayload {
  id: string;
  category: string;
  label: string;
  value: string;
  markdown?: string;
  description?: string;
  data?: Record<string, unknown>;
}
interface SuggestionSectionModel {
  id: string;
  title: string;
  items: MentionSuggestionItem[];
  loading: boolean;
  loadingText?: string;
  errorText: string | null;
  emptyText: string;
}

/* ============================================================================
 * [B4] 提及节点（js 64278–64640；Lexical TextNode 派生，渲染为内联图标+文本）
 * ==========================================================================*/

/** 原 oV（js 64277）：https URL 判定（插件图标用）。A1-R13 补 export + 行校正（旧注 64278）：
 *  oV 三归属收敛 canonical（PluginLeaves isHttpsUrl 副本、Conversation isPluginIconUrl declare 改指）。 */
export function isHttpUrl(value: unknown): value is string {
  return typeof value == `string` && value.startsWith(`https://`);
}

/** 原 sV（js 64280；A1-R13 行校正，旧注 64279）：提及节点基类名 */
const MENTION_NODE_BASE_CLASS = `inline-flex cursor-default items-center gap-1 align-top text-ui-base leading-5 font-medium`;

/** 原 cV（js 64281；A1-R13 行校正，旧注 64280）：提及类别前景色类名 */
function mentionCategoryClass(category: string): string {
  return category === `skills`
    ? `text-skill-node-foreground`
    : category === `subagents`
      ? `text-subagent-node-foreground`
      : category === `commands`
        ? `text-command-node-foreground capitalize`
        : category === `sessions`
          ? `text-session-node-foreground`
          : category === `plugins`
            ? `text-plugin-node-foreground`
            : `text-file-node-foreground`;
}

/** 原 Jqe（js 64294）：反转义 markdown 链接标签 */
function unescapeMarkdownLinkLabel(label: string): string {
  let result = ``;
  for (let index = 0; index < label.length; index += 1) {
    if (label[index] === `\\` && index + 1 < label.length) {
      ((result += label[index + 1]), (index += 1));
      continue;
    }
    result += label[index];
  }
  return result;
}

/** 原 Yqe（js 64305）：解析 markdown 链接标签 `[label](target)` */
function parseMarkdownLinkLabel(markdown: string): string | null {
  const label = /^\[((?:\\.|[^\\\]])*)\]\((?:<((?:\\.|[^>])*?)>|((?:\\.|[^)])*))\)$/.exec(markdown.trim())?.[1];
  return label ? unescapeMarkdownLinkLabel(label) : null;
}

/** 原 lV（js 64309）：提及显示标签（去触发符前缀，回退缺省） */
function mentionDisplayLabel(category: string, label: string, value: string): string {
  let display = parseMarkdownLinkLabel(value) ?? value;
  return (
    ((category === `skills` && display.startsWith(`$`)) ||
      (category === `sessions` && display.startsWith(`#`)) ||
      ((category === `files` || category === `subagents` || category === `whiteboards` || category === `plugins`) &&
        display.startsWith(`@`))) &&
      (display = display.slice(1)),
    display.trim() || label
  );
}

/** 原 uV（js 64320）：SVG 命名空间 */
const SVG_NAMESPACE = `http://www.w3.org/2000/svg`;

/** 原 Xqe（js 64320）：技能提及图标 path 表 */
const SKILL_MENTION_ICON_PATHS: Array<[string, Record<string, string>]> = [
  [
    `path`,
    {
      d: `m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72`,
    },
  ],
  [`path`, { d: `m14 7 3 3` }],
  [`path`, { d: `M5 6v4` }],
  [`path`, { d: `M19 14v4` }],
  [`path`, { d: `M10 2v2` }],
  [`path`, { d: `M7 8H3` }],
  [`path`, { d: `M21 16h-4` }],
  [`path`, { d: `M11 3H9` }],
];
/** 原 Zqe（js 64333）：子代理提及图标 */
const SUBAGENT_MENTION_ICON_PATHS: Array<[string, Record<string, string>]> = [
  [`path`, { d: `M12 8V4H8` }],
  [`rect`, { width: `16`, height: `12`, x: `4`, y: `8`, rx: `2` }],
  [`path`, { d: `M2 14h2` }],
  [`path`, { d: `M20 14h2` }],
  [`path`, { d: `M15 13v2` }],
  [`path`, { d: `M9 13v2` }],
];
/** 原 Qqe（js 64342）：白板提及图标 */
const WHITEBOARD_MENTION_ICON_PATHS: Array<[string, Record<string, string>]> = [
  [
    `path`,
    {
      d: `M12 22a8 8 0 0 1-8-8 8.5 8.5 0 0 1 8.5-8.5H16a4 4 0 0 1 0 8h-1.5a2 2 0 0 0 0 4H16a6 6 0 0 1-4 4.5Z`,
    },
  ],
  [`path`, { d: `M7.5 14h.01` }],
  [`path`, { d: `M9.5 10h.01` }],
  [`path`, { d: `M14.5 9h.01` }],
  [`path`, { d: `M17 12h.01` }],
];
/** 原 $qe（js 64356）：/goal 命令图标 */
const GOAL_COMMAND_ICON_PATHS: Array<[string, Record<string, string>]> = [
  [`path`, { d: `M12 13V2l8 4-8 4` }],
  [`path`, { d: `M20.561 10.222a9 9 0 1 1-12.55-5.29` }],
  [`path`, { d: `M8.002 9.997a5 5 0 1 0 8.9 2.02` }],
];
/** 原 eJe（js 64358）：/compact 命令图标 */
const COMPACT_COMMAND_ICON_PATHS: Array<[string, Record<string, string>]> = [
  [`path`, { d: `M15 12h-5` }],
  [`path`, { d: `M15 8h-5` }],
  [`path`, { d: `M19 17V5a2 2 0 0 0-2-2H4` }],
  [
    `path`,
    {
      d: `M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3`,
    },
  ],
];
/** 原 tJe（js 64371）：命令提及缺省图标 */
const COMMAND_MENTION_ICON_PATHS: Array<[string, Record<string, string>]> = [
  [`path`, { d: `M21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z` }],
  [`path`, { d: `m9 15 6-6` }],
];
/** 原 nJe（js 64375）：会话提及图标 */
const SESSION_MENTION_ICON_PATHS: Array<[string, Record<string, string>]> = [
  [`path`, { d: `M14 9a2 2 0 0 1-2 2H6l-4 4V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z` }],
  [`path`, { d: `M18 9h2a2 2 0 0 1 2 2v10l-4-4h-6a2 2 0 0 1-2-2v-1` }],
];
/** 原 rJe（js 64380）：插件提及图标 */
const PLUGIN_MENTION_ICON_PATHS: Array<[string, Record<string, string>]> = [
  [
    `path`,
    {
      d: `M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 0-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 0 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 0 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z`,
    },
  ],
];

/** 原 dV（js 64388）：由 path 表构造 16px 内联 SVG 元素 */
function createMentionIconSvg(paths: Array<[string, Record<string, string>]>): SVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, `svg`);
  (svg.setAttribute(`viewBox`, `0 0 24 24`),
    svg.setAttribute(`width`, `16`),
    svg.setAttribute(`height`, `16`),
    svg.setAttribute(`fill`, `none`),
    svg.setAttribute(`stroke`, `currentColor`),
    svg.setAttribute(`stroke-width`, `1.5`),
    svg.setAttribute(`stroke-linecap`, `round`),
    svg.setAttribute(`stroke-linejoin`, `round`),
    svg.setAttribute(`aria-hidden`, `true`),
    svg.setAttribute(`focusable`, `false`),
    svg.classList.add(`inline-block`, `align-middle`, `shrink-0`));
  for (const [tagName, attributes] of paths) {
    const element = document.createElementNS(SVG_NAMESPACE, tagName);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    svg.append(element);
  }
  return svg;
}

/** 原 iJe–dJe（js 64406–64431）：各类别图标工厂 */
function createSkillMentionIcon(): SVGElement {
  return createMentionIconSvg(SKILL_MENTION_ICON_PATHS);
}
function createSubagentMentionIcon(): SVGElement {
  return createMentionIconSvg(SUBAGENT_MENTION_ICON_PATHS);
}
function createWhiteboardMentionIcon(): SVGElement {
  return createMentionIconSvg(WHITEBOARD_MENTION_ICON_PATHS);
}
function createGoalCommandIcon(): SVGElement {
  return createMentionIconSvg(GOAL_COMMAND_ICON_PATHS);
}
function createCompactCommandIcon(): SVGElement {
  return createMentionIconSvg(COMPACT_COMMAND_ICON_PATHS);
}
function createCommandMentionIcon(): SVGElement {
  return createMentionIconSvg(COMMAND_MENTION_ICON_PATHS);
}
function createSessionMentionIcon(): SVGElement {
  return createMentionIconSvg(SESSION_MENTION_ICON_PATHS);
}
function createPluginMentionIcon(): SVGElement {
  return createMentionIconSvg(PLUGIN_MENTION_ICON_PATHS);
}

/** 原 fJe（js 64432）：提及文件路径（path → relativePath → 标签） */
function mentionFilePath(data: Record<string, unknown> | undefined, fallback: string): string {
  return (data?.path as string) ?? (data?.relativePath as string) ?? fallback;
}

/** 原 fV（js 64435）：去前导斜杠（命令名比较用） */
function stripLeadingSlashes(value: string): string {
  return value.trim().replace(/^\/+/, ``);
}

/** 原 pV（js 64438）：按类别渲染提及节点 DOM 内容（图标 + 文本；插件远程图标带错误回退） */
function renderMentionNodeContent(
  element: HTMLElement,
  category: string,
  data: Record<string, unknown> | undefined,
  value: string,
  label: string,
): void {
  if (category === `skills`) {
    const icon = createSkillMentionIcon();
    const text = document.createTextNode(mentionDisplayLabel(category, label, value));
    element.replaceChildren(icon, text);
    return;
  }
  if (category === `subagents`) {
    const icon = createSubagentMentionIcon();
    const text = document.createTextNode(mentionDisplayLabel(category, label, value));
    element.replaceChildren(icon, text);
    return;
  }
  if (category === `commands`) {
    const commandName = stripLeadingSlashes(value) || stripLeadingSlashes(label);
    if (commandName === `goal`) {
      element.replaceChildren(createGoalCommandIcon(), document.createTextNode(mentionDisplayLabel(category, label, value)));
      return;
    }
    if (commandName === `compact`) {
      element.replaceChildren(createCompactCommandIcon(), document.createTextNode(mentionDisplayLabel(category, label, value)));
      return;
    }
    element.replaceChildren(createCommandMentionIcon(), document.createTextNode(mentionDisplayLabel(category, label, value)));
    return;
  }
  if (category === `whiteboards`) {
    const icon = createWhiteboardMentionIcon();
    const text = document.createTextNode(mentionDisplayLabel(category, label, value));
    element.replaceChildren(icon, text);
    return;
  }
  if (category === `sessions`) {
    const icon = createSessionMentionIcon();
    const text = document.createTextNode(mentionDisplayLabel(category, label, value));
    element.replaceChildren(icon, text);
    return;
  }
  if (category === `plugins`) {
    const display = mentionDisplayLabel(category, label, value);
    const applyFallback = () => {
      element.replaceChildren(createPluginMentionIcon(), document.createTextNode(display));
    };
    if (!isHttpUrl(data?.icon)) {
      applyFallback();
      return;
    }
    const image = document.createElement(`img`);
    ((image.src = data!.icon as string),
      (image.alt = ``),
      (image.width = 16),
      (image.height = 16),
      (image.draggable = false),
      (image.className = `inline-block size-4 shrink-0 rounded-sm object-contain align-middle`),
      image.setAttribute(`aria-hidden`, `true`),
      image.setAttribute(`data-plugin-mention-icon`, `true`),
      image.addEventListener(`error`, applyFallback, { once: true }),
      element.replaceChildren(image, document.createTextNode(display)));
    return;
  }
  const resolved = resolveFileIcon(mentionFilePath(data, value));
  const image = document.createElement(`img`);
  ((image.src = data?.kind === `directory` ? DIRECTORY_ICON_SRC : resolved.fileIconSrc),
    (image.alt = ``),
    (image.width = 16),
    (image.height = 16),
    (image.className = `inline-block align-middle shrink-0`),
    image.setAttribute(`aria-hidden`, `true`),
    image.addEventListener(`error`, () => {
      image.src !==
        `data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M4.5%201.5h4.586L12.5%204.914V13a1.5%201.5%200%200%201-1.5%201.5h-6A1.5%201.5%200%200%201%203.5%2013V3A1.5%201.5%200%200%201%205%201.5Z%22%20stroke%3D%22%252394A3B8%22%20stroke-width%3D%221.2%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M9%201.75V5h3.25%22%20stroke%3D%22%252394A3B8%22%20stroke-width%3D%221.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E` &&
        (image.src = image.src.endsWith(`/document.svg`) ? DOCUMENT_ICON_SRC : DOCUMENT_FALLBACK_ICON_SRC);
    }));
  const text = document.createTextNode(resolved.fileName || label);
  element.replaceChildren(image, text);
}

/** 原 mV（js 64514）：PromptMentionNode（Lexical TextNode 派生的不可编辑提及词元） */
export class PromptMentionNode extends LexicalTextNode {
  __category: string;
  __data: Record<string, unknown> | undefined;
  __description: string;
  __markdown: string;
  __mentionId: string;
  __value: string;
  static getType(): string {
    return `prompt-mention`;
  }
  static clone(source: PromptMentionNode): PromptMentionNode {
    return new PromptMentionNode(
      {
        id: source.__mentionId,
        category: source.__category,
        label: source.__text,
        value: source.__value,
        markdown: source.__markdown,
        description: source.__description,
        data: source.__data,
      },
      source.__key,
    );
  }
  static importJSON(json: any): PromptMentionNode {
    const node = createMentionNode({
      id: json.mentionId,
      category: json.category,
      label: json.text,
      value: json.value,
      markdown: json.markdown,
      description: json.description,
      data: json.data,
    });
    return (
      node.setFormat(json.format),
      node.setDetail(json.detail),
      node.setMode(json.mode),
      node.setStyle(json.style),
      node
    );
  }
  constructor(payload: MentionPayload, key?: string) {
    (super(mentionDisplayLabel(payload.category, payload.label, payload.value), key),
      (this.__mentionId = payload.id),
      (this.__category = payload.category),
      (this.__value = payload.value),
      (this.__markdown = payload.markdown ?? ``),
      (this.__description = payload.description ?? ``),
      (this.__data = payload.data));
  }
  createDOM(config: unknown): HTMLElement {
    const element = super.createDOM(config as never) as unknown as HTMLElement;
    return (
      (element.className = `${MENTION_NODE_BASE_CLASS} ${mentionCategoryClass(this.__category)}`),
      element.setAttribute(`data-mention-category`, this.__category),
      element.setAttribute(`data-mention-id`, this.__mentionId),
      element.setAttribute(`spellcheck`, `false`),
      renderMentionNodeContent(element, this.__category, this.__data, this.__value, this.__text),
      element
    );
  }
  updateDOM(prevNode: PromptMentionNode, element: HTMLElement, config: unknown): boolean {
    const result = super.updateDOM(prevNode as never, element as never, config as never) as unknown as boolean;
    return (
      prevNode.__category !== this.__category &&
        ((element.className = `${MENTION_NODE_BASE_CLASS} ${mentionCategoryClass(this.__category)}`),
        element.setAttribute(`data-mention-category`, this.__category)),
      prevNode.__mentionId !== this.__mentionId && element.setAttribute(`data-mention-id`, this.__mentionId),
      (prevNode.__text !== this.__text ||
        prevNode.__category !== this.__category ||
        prevNode.__value !== this.__value ||
        prevNode.__data?.path !== this.__data?.path ||
        prevNode.__data?.relativePath !== this.__data?.relativePath ||
        prevNode.__data?.kind !== this.__data?.kind ||
        prevNode.__data?.scope !== this.__data?.scope ||
        prevNode.__data?.icon !== this.__data?.icon) &&
        renderMentionNodeContent(element, this.__category, this.__data, this.__value, this.__text),
      result
    );
  }
  exportJSON() {
    // A0-S3d：去 `: Record<string, unknown>` 注解（bundle mV@styles 64595 无注解；推断面对真实 TextNode.exportJSON(): SerializedTextNode 协变兼容）
    return {
      ...super.exportJSON(),
      type: `prompt-mention`,
      version: 1,
      mentionId: this.__mentionId,
      category: this.__category,
      value: this.__value,
      markdown: this.__markdown,
      description: this.__description,
      data: this.__data,
    };
  }
  getTextContent(): string {
    return this.__markdown;
  }
  isTextEntity(): boolean {
    return true;
  }
  canInsertTextBefore(): boolean {
    return false;
  }
  canInsertTextAfter(): boolean {
    return false;
  }
  getMention(): MentionPayload {
    return {
      id: this.__mentionId,
      category: this.__category,
      label: this.__text,
      value: this.__value,
      markdown: this.__markdown,
      description: this.__description,
      data: this.__data,
    };
  }
}

/** 原 hV（js 64632）：创建 token 模式提及节点（bundle：`(t.setMode('token'), LR(t))`，LR = $applyNodeReplacement@styles 61025；A0-S3d：返回值按 bundle 收口） */
function createMentionNode(payload: MentionPayload): PromptMentionNode {
  const node = new PromptMentionNode(payload);
  return (node.setMode(`token`), $applyNodeReplacement(node));
}

/** 原 gV（js 64636）：提及节点判定 */
function isMentionNode(node: unknown): node is PromptMentionNode {
  return node instanceof PromptMentionNode;
}

/* 〔A0-S4-4b〕[B5] 建议面板（SuggestionPanel 全族，原 2351–2676）整体迁出 → components/composer/SuggestionPanel.tsx；
 * SUGGESTION_* testid 四件随迁；testidOf/MentionSuggestionItem 留守本文件补 export，组件侧 import 取回。 */
export { SuggestionPanel } from '../components/composer/SuggestionPanel';
/* ============================================================================
 * [B6] 斜杠面板（js 64915–65276）
 * ==========================================================================*/

/** 原 bJe（js 64915）：斜杠面板三段（commands/skills/subagents）构造 */
function useSlashPanelSections(
  intl: IntlShape,
  sessionCommandCount: number,
  commandItems: MentionSuggestionItem[],
  skillItems: MentionSuggestionItem[],
  skillsLoading: boolean,
  skillsError: string | null,
  subagentItems: MentionSuggestionItem[],
  subagentsLoading: boolean,
  subagentsError: string | null,
): PanelSection[] {
  return React.useMemo(
    () => [
      {
        id: `commands`,
        title: intl.formatMessage({ id: `chat.slash.commands.title` }),
        options: commandItems.map((item) => ({
          id: item.id,
          label: `/${item.value}`,
          description: item.description,
          content: (
            <span className={`min-w-0 flex-1 flex items-center gap-2`}>
              <span className={`truncate text-ui-base font-medium text-foreground max-w-[40%]`}>{`/${item.value}`}</span>
              <span className={`truncate text-ui-base text-foreground-subtlest flex-1`}>{item.description}</span>
            </span>
          ),
        })),
        loading: false,
        emptyText:
          sessionCommandCount === 0
            ? intl.formatMessage({ id: `chat.slash.emptyUnavailable` })
            : intl.formatMessage({ id: `chat.slash.emptyResults` }),
      },
      {
        id: `skills`,
        title: intl.formatMessage({ id: `chat.slash.skills.title` }),
        options: skillItems.map((item) => ({
          id: item.id,
          label: `$${item.value}`,
          description: item.description,
          content: (
            <span className={`min-w-0 flex-1 flex items-center gap-2`}>
              <span className={`truncate text-ui-base font-medium text-foreground max-w-[40%]`}>{`$${item.value}`}</span>
              <span className={`truncate text-ui-base text-foreground-subtlest flex-1`}>{item.description}</span>
            </span>
          ),
        })),
        loading: skillsLoading,
        loadingText: intl.formatMessage({ id: `chat.mention.category.loading` }),
        emptyText: intl.formatMessage({ id: `chat.slash.skills.empty` }),
        errorText: skillsError,
      },
      {
        id: `subagents`,
        title: intl.formatMessage({ id: `chat.slash.subagents.title` }),
        options: subagentItems.map((item) => ({
          id: item.id,
          label: item.value as string,
          description: item.description,
          content: (
            <span className={`min-w-0 flex-1 flex items-center gap-2`}>
              <span className={`truncate text-ui-base font-medium text-foreground max-w-[40%]`}>{item.value}</span>
              <span className={`truncate text-ui-base text-foreground-subtlest flex-1`}>{item.description}</span>
            </span>
          ),
        })),
        loading: subagentsLoading,
        emptyText: intl.formatMessage({ id: `chat.slash.subagents.empty` }),
        errorText: subagentsError,
      },
    ],
    [sessionCommandCount, commandItems, skillItems, subagentItems, intl, skillsError, skillsLoading, subagentsError, subagentsLoading],
  );
}

interface SlashCursorContext {
  selection: LexicalRangeSelection;
  node: LexicalTextNode;
  cursorOffset: number;
  nodeKey: string;
  text: string;
  textAfterCursor: string;
  textBeforeCursor: string;
}

/** 原 CV（js 65000）：读取斜杠光标上下文（折叠文本选区） */
function readSlashCursorContext(): SlashCursorContext | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;
  const anchor = selection.anchor;
  if (anchor.type !== `text`) return null;
  const node = anchor.getNode();
  if (!$isTextNode(node)) return null;
  const text = node.getTextContent();
  return {
    selection,
    node,
    cursorOffset: anchor.offset,
    nodeKey: node.getKey(),
    text,
    textAfterCursor: text.slice(anchor.offset),
    textBeforeCursor: text.slice(0, anchor.offset),
  };
}

/** 原 wV（js 65018）：光标在词元内判定（触发符后到词元尾） */
function isCursorInsideToken(token: SlashTokenState, cursorOffset: number): boolean {
  return cursorOffset >= token.tokenStart + 1 && cursorOffset <= token.tokenEnd;
}

interface SlashTokenState {
  trigger: string;
  query: string;
  nodeKey: string;
  tokenEnd: number;
  tokenStart: number;
  tokenText: string;
}

/** 原 TV（js 65021）：在光标处解析斜杠词元 */
function parseSlashTokenAtCursor(context: SlashCursorContext): SlashTokenState | null {
  const parsed = parseMentionTrigger(context.textBeforeCursor);
  if (!parsed) return null;
  const tokenStart = context.cursorOffset - parsed.query.length - 1;
  const tokenEnd = context.cursorOffset;
  return { ...parsed, nodeKey: context.nodeKey, tokenEnd, tokenStart, tokenText: context.text.slice(tokenStart, tokenEnd) };
}

/** 原 EV（js 65028）：词元跟踪（同节点且文本未变 → 沿用；否则重解析） */
function trackSlashToken(
  previous: SlashTokenState | null,
  context: SlashCursorContext,
  selectionOnlyChange: boolean,
): SlashTokenState | null {
  return !selectionOnlyChange || !previous
    ? parseSlashTokenAtCursor(context)
    : previous.nodeKey === context.nodeKey
      ? context.text.slice(previous.tokenStart, previous.tokenEnd) === previous.tokenText
        ? isCursorInsideToken(previous, context.cursorOffset)
          ? previous
          : null
        : parseSlashTokenAtCursor(context)
      : null;
}

/** 原 DV（js 65039）：词元范围解析（失效 → null） */
function resolveSlashTokenRange(
  token: SlashTokenState | null,
  context: SlashCursorContext,
): { end: number; start: number } | null {
  return !token ||
    token.nodeKey !== context.nodeKey ||
    !isCursorInsideToken(token, context.cursorOffset) ||
    context.text.slice(token.tokenStart, token.tokenEnd) !== token.tokenText
    ? null
    : { end: token.tokenEnd, start: token.tokenStart };
}

/** 原 OV（js 65047）：编程式更新标签 */
const PROGRAMMATIC_UPDATE_TAG = `zcode-programmatic`;
/** 原 kV（js 65047）：历史导航更新标签 */
const HISTORY_NAVIGATION_TAG = `zcode-history-navigation`;

/** 原 xJe（js 65049）：用户发起更新判定（排除历史导航） */
function isUserInitiatedUpdate(tags: Set<string>): boolean {
  return !tags.has(HISTORY_NAVIGATION_TAG);
}

/** 原 SJe（js 65052）：斜杠面板（/ 触发；命令+技能+子代理；键盘命令接管） */
export function SlashPanel({
  workspacePath,
  workspaceIdentity,
  provider,
  container,
  disabled = false,
  excludedCommandNames,
  appCommands,
}: {
  workspacePath: string | undefined; // 〔A1-R137〕面级联
  workspaceIdentity?: string | null;
  provider: string;
  container: HTMLElement | null;
  disabled?: boolean;
  excludedCommandNames?: string[];
  appCommands?: AppSlashCommand[];
}) {
  const [editor] = useLexicalComposerContext();
  const { intl, locale } = useIntlContext();
  const sessionCommands = useSessionSlashCommands(workspacePath, workspaceIdentity);
  const { agents, loading: subagentsLoading, error: subagentsError } = useSubagentsContext(workspacePath, provider, workspaceIdentity);
  const { skills, loading: skillsLoading, error: skillsError } = useSkillsContext(workspacePath, provider, workspaceIdentity);
  const [activeTrigger, setActiveTrigger] = React.useState<{ trigger: string; query: string } | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const lastQueryKeyRef = React.useRef<string | null>(null);
  const lastTriggerKeyRef = React.useRef<string | null>(null);
  const trackedTokenRef = React.useRef<SlashTokenState | null>(null);
  const commandItems = React.useMemo(() => {
    const excluded = new Set((excludedCommandNames ?? []).map(normalizeSlashCommandName));
    const sessionItems = buildSessionSlashSuggestions(sessionCommands).filter((item) => !excluded.has(item.value as string));
    const sessionValues = new Set(sessionItems.map((item) => item.value));
    const appItems = buildAppSlashSuggestions(appCommands ?? []).filter(
      (item) => !sessionValues.has(item.value) && !excluded.has(item.value as string),
    );
    return [...sessionItems, ...appItems];
  }, [appCommands, sessionCommands, excludedCommandNames]);
  const subagentItems = React.useMemo(() => buildSubagentSlashSuggestions(agents), [agents]);
  const skillItems = React.useMemo(
    () =>
      buildSkillSlashSuggestions(
        filterGlmSkills(skills, provider).filter((skill) => skill.enabled),
        locale,
      ),
    [locale, provider, skills],
  );
  const filteredCommands = React.useMemo(() => sortMentionSuggestions(commandItems, activeTrigger?.query ?? null), [commandItems, activeTrigger?.query]);
  const filteredSubagents = React.useMemo(() => sortMentionSuggestions(subagentItems, activeTrigger?.query ?? null), [subagentItems, activeTrigger?.query]);
  const filteredSkills = React.useMemo(() => sortMentionSuggestions(skillItems, activeTrigger?.query ?? null), [skillItems, activeTrigger?.query]);
  const mergedItems = React.useMemo(() => [...filteredCommands, ...filteredSkills, ...filteredSubagents], [filteredCommands, filteredSkills, filteredSubagents]);
  const queryKey = React.useMemo(() => suggestionQueryKey(activeTrigger), [activeTrigger]);
  const isOpen = !disabled && activeTrigger !== null;
  ((React.useEffect(() => {
    lastTriggerKeyRef.current = queryKey;
  }, [queryKey]),
    React.useEffect(() => {
      setSelectedIndex(findBestSuggestionIndex(mergedItems, activeTrigger?.query ?? null));
    }, [queryKey, activeTrigger?.query, mergedItems]),
    React.useEffect(() => {
      setSelectedIndex((prev) => (mergedItems.length === 0 ? 0 : Math.min(prev, mergedItems.length - 1)));
    }, [mergedItems.length]),
    React.useEffect(() => {
      disabled && (setActiveTrigger(null), setSelectedIndex(0), (trackedTokenRef.current = null));
    }, [disabled]),
    React.useEffect(
      () =>
        editor.registerUpdateListener(
          ({ dirtyElements, dirtyLeaves, editorState, tags }) => {
            editorState.read(() => {
              if (!isUserInitiatedUpdate(tags)) {
                ((trackedTokenRef.current = null), setActiveTrigger(null));
                return;
              }
              if (disabled) {
                ((trackedTokenRef.current = null), setActiveTrigger(null));
                return;
              }
              const context = readSlashCursorContext();
              const fallback = context ?? readTextAroundCursor();
              if (!fallback) {
                ((trackedTokenRef.current = null), (lastQueryKeyRef.current = null), setActiveTrigger(null));
                return;
              }
              const tracked = context ? trackSlashToken(trackedTokenRef.current, context, dirtyElements.size === 0 && dirtyLeaves.size === 0) : null;
              const parsed = context ? tracked : parseMentionTrigger(fallback.textBeforeCursor);
              if (!parsed || parsed.trigger !== `/`) {
                ((trackedTokenRef.current = null), (lastQueryKeyRef.current = null), setActiveTrigger(null));
                return;
              }
              trackedTokenRef.current = tracked;
              const nextKey = suggestionQueryKey(parsed);
              if ((lastQueryKeyRef.current !== null && lastQueryKeyRef.current !== nextKey && (lastQueryKeyRef.current = null), lastQueryKeyRef.current === nextKey)) {
                setActiveTrigger(null);
                return;
              }
              setActiveTrigger((prev) => (prev?.trigger === parsed.trigger && prev.query === parsed.query ? prev : parsed));
            });
          },
        ),
      [disabled, editor],
    )));
  const selectItem = React.useCallback(
    (item: MentionSuggestionItem) => {
      const isAppCommand = isAppSlashSuggestion(item);
      if (
        (editor.update(() => {
          const context = readSlashCursorContext();
          if (!context) return;
          const range = resolveSlashTokenRange(trackedTokenRef.current, context);
          const token = range ? trackedTokenRef.current : parseMentionTrigger(context.textBeforeCursor);
          if (!token || token.trigger !== `/`) return;
          const start = range?.start ?? context.cursorOffset - token.query.length - 1;
          const end = range?.end ?? context.cursorOffset + mentionCompletionOverlap(token, context.textAfterCursor, item.value as string);
          if ((context.selection.setTextNodeRange(context.node, start, context.node, end), isAppCommand)) {
            context.selection.removeText();
            return;
          }
          const mentionNode = createMentionNode(toSlashPanelMention(item));
          const spaceNode = $createTextNode(` `);
          (context.selection.insertNodes([mentionNode, spaceNode]), spaceNode.selectEnd());
        }),
        (lastQueryKeyRef.current = null),
        (trackedTokenRef.current = null),
        setActiveTrigger(null),
        setSelectedIndex(0),
        isAppCommand)
      ) {
        appCommands?.find((command) => normalizeSlashCommandName(command.value) === item.value)?.run();
        return;
      }
      requestAnimationFrame(() => {
        editor.focus();
      });
    },
    [appCommands, editor],
  );
  const selectByIndex = React.useCallback(
    (index: number) => {
      const item = mergedItems[index];
      return item ? (selectItem(item), true) : false;
    },
    [selectItem, mergedItems],
  );
  React.useEffect(() => {
    if (!isOpen) return;
    const unregisterDown = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event) =>
        mergedItems.length === 0
          ? false
          : (event?.preventDefault(),
            event?.stopPropagation(),
            setSelectedIndex((prev) => Math.min(prev + 1, mergedItems.length - 1)),
            true),
      4,
    );
    const unregisterUp = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event) =>
        mergedItems.length === 0
          ? false
          : (event?.preventDefault(), event?.stopPropagation(), setSelectedIndex((prev) => Math.max(prev - 1, 0)), true),
      4,
    );
    const unregisterEnter = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => (selectByIndex(selectedIndex) ? (event?.preventDefault(), event?.stopPropagation(), true) : false),
      4,
    );
    const unregisterTab = editor.registerCommand(
      KEY_TAB_COMMAND,
      (event) => (selectByIndex(selectedIndex) ? (event?.preventDefault(), event?.stopPropagation(), true) : false),
      4,
    );
    const unregisterEscape = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      (event) => (
        event?.preventDefault(),
        event?.stopPropagation(),
        (lastQueryKeyRef.current = lastTriggerKeyRef.current),
        setActiveTrigger(null),
        setSelectedIndex(0),
        true
      ),
      4,
    );
    const unregisterBlur = editor.registerCommand(
      BLUR_COMMAND,
      () => ((lastQueryKeyRef.current = null), (trackedTokenRef.current = null), setActiveTrigger(null), setSelectedIndex(0), false),
      1,
    );
    return () => {
      (unregisterDown(), unregisterUp(), unregisterEnter(), unregisterTab(), unregisterEscape(), unregisterBlur());
    };
  }, [editor, mergedItems.length, isOpen, selectByIndex, selectedIndex]);
  const panelTitle = intl.formatMessage({ id: `chat.slash.title` });
  const hasActiveQuery = (activeTrigger?.query ?? ``).trim().length > 0;
  const description = hasActiveQuery ? `` : intl.formatMessage({ id: `chat.slash.searchHint` });
  const sections = useSlashPanelSections(intl, sessionCommands.length, filteredCommands, filteredSkills, skillsLoading, skillsError, filteredSubagents, subagentsLoading, subagentsError);
  return !isOpen || !container
    ? null
    : ReactDOM.createPortal(
        <SuggestionPanel
          title={panelTitle}
          description={description}
          trigger={`/`}
          sections={sections}
          emptyText={``}
          selectedIndex={selectedIndex}
          hasActiveQuery={hasActiveQuery}
          onSelect={selectByIndex}
        />,
        container,
      );
}

/** 原 AV（js 65256）：插件提及图标（远程图标 + 错误回退） */
function PluginMentionIcon({ src, className, iconClassName }: { src?: string; className?: string; iconClassName?: string }) {
  const [failed, setFailed] = React.useState(false);
  const showRemote = isHttpUrl(src) && !failed;
  return (
    <span
      aria-hidden={`true`}
      className={cn(
        `flex shrink-0 select-none items-center justify-center rounded-xl bg-surface`,
        !showRemote && `text-foreground-subtle`,
        className,
      )}
    >
      {showRemote ? (
        <img src={src} alt={``} draggable={false} className={`h-2/3 w-2/3 object-contain`} onError={() => setFailed(true)} />
      ) : (
        <PluginFallbackIcon className={cn(`size-4`, iconClassName)} />
      )}
    </span>
  );
}

/* ============================================================================
 * [B7] 提及选择器（js 65276–66097；@/#/$ 触发的五类建议面板接线）
 * ==========================================================================*/

/** 原 CJe/wJe/TJe（js 65276–65278）：触发符 → 类别表 */
const AT_MENTION_CATEGORIES = [`plugins`, `files`, `sessions`, `whiteboards`];
const HASH_MENTION_CATEGORIES = [`sessions`];
const DOLLAR_MENTION_CATEGORIES = [`skills`];

/** 原 EJe（js 65280）：触发符 → 类别表 */
function mentionCategoriesForTrigger(trigger?: string): string[] {
  return trigger === `@` ? AT_MENTION_CATEGORIES : trigger === `#` ? HASH_MENTION_CATEGORIES : trigger === `$` ? DOLLAR_MENTION_CATEGORIES : [];
}

/** 原 DJe（js 65283）：# 触发跨同权限工作区，@ 限当前工作区 */
function mentionSessionScope(trigger?: string): `same-authority-workspaces` | `current-workspace` {
  return trigger === `#` ? `same-authority-workspaces` : `current-workspace`;
}

/** 原 OJe（js 65286）：工作区文件 → 建议条目 */
function buildFileSuggestions(files: WorkspaceFileEntry[]): MentionSuggestionItem[] {
  return files.map((file) => ({
    id: `file:${file.relativePath}`,
    category: `files`,
    label: file.name,
    description: file.relativePath,
    value: file.relativePath,
    markdown: fileMentionMarkdown(file.relativePath, file.name, file.type),
    keywords: [file.relativePath, file.path],
    data: { kind: file.type, path: file.path, relativePath: file.relativePath },
  }));
}

/** 原 jV（js 65298）：查询归一（trim+lower） */
function normalizeQueryCase(query: string): string {
  return query.trim().toLowerCase();
}

/** 原 kJe（js 65301）：文件列表刷新判定（空查询或零结果未刷新过） */
function shouldRefreshFileList(args: {
  enabled: boolean;
  loading: boolean;
  loaded: boolean;
  query: string;
  resultCount: number;
  lastMissRefreshQuery: string | null;
}): boolean {
  const normalized = normalizeQueryCase(args.query);
  return !args.enabled || args.loading ? false : args.loaded ? (normalized.length === 0 || args.resultCount > 0 ? false : args.lastMissRefreshQuery !== normalized) : true;
}

/** 原 AJe（js 65312）：文件建议段钩子（列表缓存 + 失效刷新） */
function useFileSuggestions(
  workspacePath: string | undefined, // 〔A1-R137〕面级联
  query: string,
  enabled: boolean,
  emptyText: string,
  title: string,
  emptyQueryLimit: number,
) {
  const { fileService } = useServices() as unknown as { fileService: { listWorkspaceFiles(args: { rootPath: string | undefined }): Promise<WorkspaceFileEntry[]> } }; // 〔A1-R137〕面级联
  const [files, setFiles] = React.useState<MentionSuggestionItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const requestGenerationRef = React.useRef(0);
  const lastMissRefreshQueryRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    (setFiles([]), setLoading(false), setLoaded(false), setError(null), (lastMissRefreshQueryRef.current = null), (requestGenerationRef.current += 1));
  }, [workspacePath]);
  const items = React.useMemo(
    () => filterSuggestionsByQuery(files, query, { limit: suggestionLimitForQuery(query, emptyQueryLimit), requireQuery: false }),
    [files, emptyQueryLimit, query],
  );
  return (
    React.useEffect(() => {
      enabled || (setFiles([]), setLoading(false), setLoaded(false), setError(null), (lastMissRefreshQueryRef.current = null), (requestGenerationRef.current += 1));
    }, [enabled]),
    React.useEffect(() => {
      if (
        !shouldRefreshFileList({
          enabled,
          loading,
          loaded,
          query,
          resultCount: items.length,
          lastMissRefreshQuery: lastMissRefreshQueryRef.current,
        })
      )
        return;
      const generation = requestGenerationRef.current + 1;
      ((requestGenerationRef.current = generation),
        loaded && items.length === 0 && (lastMissRefreshQueryRef.current = normalizeQueryCase(query)),
        setLoading(true),
        setError(null),
        fileService
          .listWorkspaceFiles({ rootPath: workspacePath })
          .then((entries) => {
            requestGenerationRef.current === generation && (setFiles(buildFileSuggestions(entries)), setLoaded(true));
          })
          .catch((reason) => {
            requestGenerationRef.current === generation && setError(reason instanceof Error ? reason : Error(String(reason)));
          })
          .finally(() => {
            requestGenerationRef.current === generation && setLoading(false);
          }));
    }, [enabled, fileService, items.length, loaded, loading, query, workspacePath]),
    { items, loading, error, emptyText, title }
  );
}

interface PluginCatalogEntry {
  pluginId: string;
  name: string;
  enabled: boolean;
  marketplace: string;
  skillQualifiedNames: string[];
  mcpServerNames: string[];
  conflictingPluginIds: string[];
  icon?: string;
}

/** 原 MV（js 65360）：空插件目录 */
const EMPTY_PLUGIN_CATALOG: { entries: PluginCatalogEntry[]; authority: string | null; loading: boolean; error: string | null } = {
  entries: [],
  authority: null,
  loading: false,
  error: null,
};
/** 原 jJe（js 65361）：目录状态初值 */
const INITIAL_PLUGIN_CATALOG_STATE: { scope: object | null; value: typeof EMPTY_PLUGIN_CATALOG } = { scope: null, value: EMPTY_PLUGIN_CATALOG };
/** 原 NV（js 65362）：按服务实例的会话目录请求去重缓存 */
const pluginCatalogRequestCache = new WeakMap<object, Map<string, Promise<{ plugins: PluginCatalogEntry[]; authority: string | null }>>>();

/** 原 PV（js 65363）：释放去重缓存条目 */
function releasePluginCatalogRequest(
  services: object,
  cache: Map<string, Promise<{ plugins: PluginCatalogEntry[]; authority: string | null }>>,
  requestKey: string,
  request: Promise<{ plugins: PluginCatalogEntry[]; authority: string | null }>,
): void {
  cache.get(requestKey) === request && (cache.delete(requestKey), cache.size === 0 && pluginCatalogRequestCache.delete(services));
}

/** 原 MJe（js 65366）：请求结算后清理缓存 */
function trackPluginCatalogRequest(
  services: object,
  cache: Map<string, Promise<{ plugins: PluginCatalogEntry[]; authority: string | null }>>,
  requestKey: string,
  request: Promise<{ plugins: PluginCatalogEntry[]; authority: string | null }>,
): void {
  const cleanup = () => releasePluginCatalogRequest(services, cache, requestKey, request);
  request.then(cleanup, cleanup);
}

/** 原 FV（js 65370）：插件引用目录钩子（会话级去重 + 运行时重启递增）；〔A1-R136〕补 export +
 * 首参面宽化 string|undefined（Conversation PluginIconProvider 消费面逐字锁定；束真 FV 首参带 !e 守卫）。 */
export function usePluginReferenceCatalog(
  workspacePath: string | undefined,
  workspaceIdentity: string | null | undefined,
  sessionId: string | null,
  enabled: boolean,
  options?: { dedupeSessionRequest?: boolean; suppressErrorLog?: boolean; preferredRemoteSessionId?: string | null },
) {
  const resolved = useResolvedServices(workspacePath, void 0, workspaceIdentity, options);
  const [state, setState] = React.useState(INITIAL_PLUGIN_CATALOG_STATE);
  const [runtimeEpoch, setRuntimeEpoch] = React.useState(0);
  const requestGenerationRef = React.useRef(0);
  const effectiveIdentity = workspaceIdentity?.trim() || workspacePath;
  const remoteSessionId = resolved.remoteSessionId ?? options?.preferredRemoteSessionId ?? void 0;
  const requestKey = `${effectiveIdentity}|${remoteSessionId ?? `local`}|${sessionId ?? `draft`}|runtime:${runtimeEpoch}`;
  const services = resolved.services;
  const rpcReady = resolved.rpcReady;
  React.useEffect(() => {
    if (!enabled || !workspacePath || !sessionId || !rpcReady) return;
    const subscription = (services.zcodeAgentService as unknown as ZcodeAgentService).onAgentRuntimeRestarted((event) => { // 〔型缝 A1-R142〕AutomationsAgentService 索引签名面 → 本地 onAgentRuntimeRestarted 面（运行期同物；telemetryScopes@261 二段收敛判例）
      event.workspaceKey === effectiveIdentity && setRuntimeEpoch((prev) => prev + 1);
    });
    return () => subscription.dispose();
  }, [enabled, rpcReady, services, sessionId, effectiveIdentity, workspacePath]);
  const scopeToken = React.useMemo(() => ({}), [enabled, remoteSessionId, requestKey, rpcReady, services, workspacePath]);
  return (
    React.useEffect(() => {
      if (!enabled || !workspacePath || !rpcReady) return;
      const generation = ++requestGenerationRef.current;
      let cancelled = false;
      setState({ scope: scopeToken, value: { entries: [], authority: null, loading: true, error: null } });
      const requestArgs = {
        workspacePath,
        ...(workspaceIdentity ? { workspaceIdentity } : {}),
        ...(remoteSessionId ? { remoteSessionId } : {}),
        ...(sessionId ? { sessionId } : {}),
      };
      let request: Promise<{ plugins: PluginCatalogEntry[]; authority: string | null }>;
      let dedupeCache: Map<string, Promise<{ plugins: PluginCatalogEntry[]; authority: string | null }>> | undefined;
      if (options?.dedupeSessionRequest && sessionId) {
        let cache = pluginCatalogRequestCache.get(services);
        cache || ((cache = new Map()), pluginCatalogRequestCache.set(services, cache));
        const pending = cache.get(requestKey);
        ((request = pending ?? (services.pluginManagementService as unknown as PluginManagementService).getPluginReferenceCatalog(requestArgs)), // 〔型缝 A1-R142〕canonical PluginService 面无 getPluginReferenceCatalog → 本地面二段收敛（运行期同物）
          (dedupeCache = cache),
          pending || (cache.set(requestKey, request), trackPluginCatalogRequest(services, cache, requestKey, request)));
      } else request = (services.pluginManagementService as unknown as PluginManagementService).getPluginReferenceCatalog(requestArgs); // 〔型缝 A1-R142〕同上判
      return (
        request
          .then((result) => {
            cancelled ||
              generation !== requestGenerationRef.current ||
              setState({
                scope: scopeToken,
                value: { entries: result.plugins, authority: result.authority, loading: false, error: null },
              });
          })
          .catch((reason) => {
            if (cancelled || generation !== requestGenerationRef.current) return;
            const message = reason instanceof Error ? reason.message : String(reason);
            (options?.suppressErrorLog ||
              logger.warn(`[usePluginReferenceCatalog] 拉取 Plugin 引用 catalog 失败`, {
                error: message,
                requestKey,
              }),
              setState({ scope: scopeToken, value: { entries: [], authority: null, loading: false, error: message } }));
          }),
        () => {
          ((cancelled = true), dedupeCache && releasePluginCatalogRequest(services, dedupeCache, requestKey, request));
        }
      );
    }, [enabled, options?.dedupeSessionRequest, options?.suppressErrorLog, remoteSessionId, requestKey, scopeToken, rpcReady, services, sessionId, workspaceIdentity, workspacePath]),
    !enabled || !workspacePath || !rpcReady || state.scope !== scopeToken ? EMPTY_PLUGIN_CATALOG : state.value
  );
}

/** 原 NJe（js 65438）：插件目录 → 建议条目（冲突禁用） */
function buildPluginSuggestions(
  entries: PluginCatalogEntry[],
  labels: { conflictReason: string; formatDescription(entry: PluginCatalogEntry): string },
): MentionSuggestionItem[] {
  return entries
    .filter((entry) => entry.enabled)
    .map((entry) => {
      const hasConflict = entry.conflictingPluginIds.length > 0;
      return {
        id: `plugin:${entry.pluginId}`,
        category: `plugins`,
        label: entry.name,
        description: labels.formatDescription(entry),
        value: entry.pluginId,
        markdown: pluginMentionMarkdown(entry.name, entry.pluginId),
        keywords: [entry.name, entry.pluginId, entry.marketplace],
        data: { pluginId: entry.pluginId, ...(entry.icon ? { icon: entry.icon } : {}) },
        ...(hasConflict ? { disabled: true, disabledReason: labels.conflictReason } : {}),
      };
    });
}

/** 原 PJe（js 65456）：插件建议段钩子 */
function usePluginSuggestions(
  workspacePath: string | undefined, // 〔A1-R137〕面级联
  workspaceIdentity: string | null | undefined,
  sessionId: string | null,
  query: string,
  enabled: boolean,
  emptyText: string,
  title: string,
) {
  const { intl } = useIntlContext();
  const catalog = usePluginReferenceCatalog(workspacePath, workspaceIdentity, sessionId, enabled);
  const suggestions = React.useMemo(
    () =>
      buildPluginSuggestions(catalog.entries, {
        conflictReason: intl.formatMessage({ id: `chat.mention.plugins.conflict` }),
        formatDescription: (entry) =>
          intl.formatMessage(
            { id: `chat.mention.plugins.description` },
            {
              marketplace: entry.marketplace,
              skillCount: entry.skillQualifiedNames.length,
              mcpCount: entry.mcpServerNames.length,
            },
          ),
      }),
    [catalog.entries, intl],
  );
  const items = React.useMemo(() => filterSuggestionsByQuery(suggestions, query, { requireQuery: false }), [suggestions, query]);
  return {
    items: enabled ? items : [],
    loading: catalog.loading,
    error: catalog.error ? Error(catalog.error) : null,
    emptyText,
    title,
  };
}

/** 原 FJe（js 65484）：每工作区会话建议上限 */
const SESSION_SUGGESTIONS_PER_WORKSPACE = 20;

/** 原 IJe（js 65485）：会话建议比较（当前工作区优先 → 更新时间 → 创建时间 → 标题） */
function compareSessionSuggestions(a: SessionSuggestionItem, b: SessionSuggestionItem, preferredWorkspaceKey?: string): number {
  if (preferredWorkspaceKey) {
    const aPreferred = workspaceKey(a.workspacePath, a.workspaceIdentity) === preferredWorkspaceKey;
    if (aPreferred !== (workspaceKey(b.workspacePath, b.workspaceIdentity) === preferredWorkspaceKey)) return aPreferred ? -1 : 1;
  }
  return b.updatedAt === a.updatedAt
    ? b.createdAt === a.createdAt
      ? a.title.localeCompare(b.title)
      : b.createdAt - a.createdAt
    : b.updatedAt - a.updatedAt;
}

/** 原 IV（js 65496）：会话显示标题（剥离 #sess_ 前缀） */
function sessionDisplayTitle(session: SessionListItem): string {
  return session.title.replace(/^#sess_[a-zA-Z0-9._-]+\s*/, ``).trim() || `Untitled session`;
}

/** 原 LJe（js 65499）：会话工作区短名 */
function sessionWorkspaceLabel(session: SessionListItem): string {
  const raw = session.workspacePath.trim() || session.workspaceIdentity?.trim() || ``;
  return raw.split(/[\\/]/).filter(Boolean).at(-1) ?? raw;
}

interface SessionSuggestionItem extends MentionSuggestionItem {
  workspaceKey: string;
  taskId: string;
  title: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  updatedAt: number;
  createdAt: number;
}

/** 原 RJe（js 65503）：会话 → 建议条目 */
function buildSessionSuggestion(session: SessionListItem, fallbackProvider: string): SessionSuggestionItem {
  const taskId = session.taskId;
  const provider = session.provider ?? fallbackProvider;
  return {
    id: `session:${session.taskId}`,
    category: `sessions`,
    label: sessionDisplayTitle(session),
    description: sessionWorkspaceLabel(session),
    value: taskId,
    markdown: sessionMentionMarkdown(taskId, sessionDisplayTitle(session)),
    keywords: [session.title, session.taskId, session.workspacePath, session.workspaceIdentity ?? ``, session.model ?? ``, provider],
    workspaceKey: workspaceKey(session.workspacePath, session.workspaceIdentity),
    taskId,
    title: session.title,
    workspacePath: session.workspacePath,
    workspaceIdentity: session.workspaceIdentity,
    updatedAt: session.updatedAt,
    createdAt: session.createdAt,
  };
}

/** 原 zJe（js 65517）：会话去重（按 taskId 保留最新）+ 排序 */
function dedupeAndSortSessions(
  sessions: SessionListItem[],
  fallbackProvider: string,
  options: { workspacePath?: string; workspaceIdentity?: string | null } = {},
): SessionSuggestionItem[] {
  const preferredWorkspaceKey = options.workspacePath ? workspaceKey(options.workspacePath, options.workspaceIdentity) : void 0;
  const byTaskId = new Map<string, SessionListItem>();
  for (const session of sessions) {
    if (session.migrationSource) continue;
    const taskId = session.taskId;
    const existing = byTaskId.get(taskId);
    (!existing || session.updatedAt > existing.updatedAt) && byTaskId.set(taskId, session);
  }
  return [...byTaskId.values()].sort((a, b) => compareSessionSuggestions(a as never, b as never, preferredWorkspaceKey)).map((session) => buildSessionSuggestion(session, fallbackProvider));
}

/** 原 BJe（js 65528）：每工作区限流 */
function limitSessionsPerWorkspace(items: SessionSuggestionItem[]): SessionSuggestionItem[] {
  const counts = new Map<string, number>();
  return items.filter((item) => {
    const count = counts.get(item.workspaceKey) ?? 0;
    return count >= SESSION_SUGGESTIONS_PER_WORKSPACE ? false : (counts.set(item.workspaceKey, count + 1), true);
  });
}

/** 原 VJe（js 65535）：收集会话列表端点（当前工作区 + 标签页，按服务实例去重） */
function collectSessionListEndpoints(args: {
  baseServices: BaseServices; // 〔A1-R142〕面校准：unknown → 真面（束 VJe 实参 = Ec() 解析服务）
  currentRemoteSessionId?: string | null;
  currentServices: { zcodeAgentService: unknown }; // 〔A1-R142〕面校准：ZcodeAgentService → unknown 宽面（实参真面 ResolvedBaseServices.zcodeAgentService = AutomationsAgentService 不重叠；3197 比较面运行期同物）
  currentWorkspaceIdentity?: string | null;
  currentWorkspacePath: string | undefined; // 〔A1-R137〕面级联
  enabled: boolean;
  serviceResolverState: SessionRegistrySnapshotState; // 〔A1-R142〕面校准：unknown → 真面（束 VJe 实参 = sessionRegistryModel memo 三索引）
  workspaceTabs: WorkspaceTab[]; // 〔A1-R142〕面校准：unknown[] → 真面（束 VJe 实参 = tabs.filter(oc)）
}): SessionListEndpoint[] {
  if (!args.enabled) return [];
  const currentAgentService = args.currentServices.zcodeAgentService;
  const endpoints: SessionListEndpoint[] = [];
  const seenKeys = new Set<string>();
  const candidates = [
    {
      workspacePath: args.currentWorkspacePath,
      ...(args.currentWorkspaceIdentity ? { workspaceIdentity: args.currentWorkspaceIdentity } : {}),
      ...(args.currentRemoteSessionId ? { remoteSessionId: args.currentRemoteSessionId } : {}),
    },
    ...args.workspaceTabs,
  ];
  for (const candidate of candidates) {
    const key = workspaceKey((candidate as any).workspacePath, (candidate as any).workspaceIdentity);
    if (seenKeys.has(key)) continue;
    const resolved = resolveTabServices(candidate, args.baseServices, args.serviceResolverState);
    !resolved ||
      resolved.services.zcodeAgentService !== currentAgentService ||
      (seenKeys.add(key),
      endpoints.push({
        workspacePath: (candidate as any).workspacePath,
        ...((candidate as any).workspaceIdentity ? { workspaceIdentity: (candidate as any).workspaceIdentity } : {}),
        ...(resolved.remoteSessionId ? { endpointKey: resolved.remoteSessionId } : {}),
        agentService: resolved.services.zcodeAgentService as unknown as ZcodeAgentService, // 〔型缝 A1-R142〕BaseServices.zcodeAgentService（AutomationsAgentService|undefined）→ 端点面（运行期同物；二段收敛判例）
      }));
  }
  return endpoints;
}

/** 原 HJe（js 65564）：会话建议段钩子（@ 当前工作区 / # 同权限工作区） */
function useSessionSuggestions(
  provider: string,
  workspacePath: string | undefined, // 〔A1-R137〕面级联
  workspaceIdentity: string | null | undefined,
  query: string,
  enabled: boolean,
  scope: `same-authority-workspaces` | `current-workspace`,
  emptyText: string,
  title: string,
): { items: MentionSuggestionItem[]; loading: boolean; error: Error | null; emptyText: string; title: string } {
  const baseServices = useBaseServices();
  const tabs = useWorkspaceTabsSelector((state) => state.tabs);
  const workspaceTabs = React.useMemo(() => tabs.filter(isWorkspaceTab), [tabs]);
  const sessionsById = useSessionRegistry((state) => state.sessionsById);
  const sessionIdByWorkspaceIdentity = useSessionRegistry((state) => state.sessionIdByWorkspaceIdentity);
  const sessionIdByWorkspacePath = useSessionRegistry((state) => state.sessionIdByWorkspacePath);
  const sessionRegistryModel = React.useMemo(
    () => ({ sessionsById, sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath }),
    [sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath, sessionsById],
  );
  const { services, remoteSessionId, isRemoteTarget } = useResolvedServices(workspacePath, void 0, workspaceIdentity);
  const { items, hydratingEndpointKeys } = useSessionListsHydrator(
    React.useMemo(
      () =>
        !enabled || (isRemoteTarget && !remoteSessionId)
          ? []
          : scope === `current-workspace`
            ? [
                {
                  workspacePath,
                  ...(workspaceIdentity ? { workspaceIdentity } : {}),
                  ...(remoteSessionId ? { endpointKey: remoteSessionId } : {}),
                  agentService: services.zcodeAgentService as unknown as ZcodeAgentService, // 〔型缝 A1-R142〕ResolvedBaseServices.zcodeAgentService（AutomationsAgentService）→ 端点面（运行期同物；二段收敛判例）
                },
              ]
            : collectSessionListEndpoints({
                baseServices,
                currentRemoteSessionId: remoteSessionId,
                currentServices: services,
                currentWorkspaceIdentity: workspaceIdentity,
                currentWorkspacePath: workspacePath,
                enabled,
                serviceResolverState: sessionRegistryModel,
                workspaceTabs,
              }),
      [baseServices, enabled, isRemoteTarget, remoteSessionId, sessionRegistryModel, workspaceIdentity, workspacePath, scope, services, workspaceTabs],
    ),
  );
  const suggestions = React.useMemo(
    () => dedupeAndSortSessions(items, provider, { workspacePath, workspaceIdentity }),
    [items, provider, workspaceIdentity, workspacePath],
  );
  const filtered = React.useMemo(() => {
    const result = filterSuggestionsByQuery(suggestions, query, { limit: 1 / 0, requireQuery: false });
    return scope === `same-authority-workspaces` ? limitSessionsPerWorkspace(result as SessionSuggestionItem[]) : result;
  }, [suggestions, query, scope]);
  return { items: enabled ? filtered : [], loading: enabled && hydratingEndpointKeys.length > 0, error: null, emptyText, title };
}

/** 原 UJe（js 65610）：白板 → 建议条目 */
function buildWhiteboardSuggestions(boards: WhiteboardBoard[]): MentionSuggestionItem[] {
  return boards.map((board) => ({
    id: `whiteboard:${board.id}`,
    category: `whiteboards`,
    label: board.name,
    description: `${board.strokes.length}`,
    value: board.id,
    markdown: `@${board.name}`,
    keywords: [board.name, board.id],
    data: { boardId: board.id, kind: `whiteboard` },
  }));
}

/** 原 WJe（js 65622）：白板建议段钩子 */
function useWhiteboardSuggestions(
  workspacePath: string | undefined, // 〔A1-R137〕面级联
  workspaceIdentity: string | null | undefined,
  query: string,
  enabled: boolean,
  emptyText: string,
  title: string,
): { items: MentionSuggestionItem[]; loading: boolean; error: Error | null; emptyText: string; title: string } {
  const scopeKey = whiteboardScopeKey({ workspacePath, workspaceIdentity });
  const workspaceState = useWhiteboardStore((state) => state.workspaces[scopeKey]);
  const boards = React.useMemo(() => workspaceState?.boardIds.map((id) => workspaceState.boardsById[id]).filter((board) => !!board) ?? [], [workspaceState]);
  return {
    items: React.useMemo(() => (enabled ? filterSuggestionsByQuery(buildWhiteboardSuggestions(boards as WhiteboardBoard[]), query, { requireQuery: false }) : []), [boards, enabled, query]),
    loading: false,
    error: null,
    emptyText,
    title,
  };
}

/** 原 LV（js 65634）：环形索引 */
function wrapIndex(index: number, delta: number, length: number): number {
  return length <= 0 ? 0 : (index + delta + length) % length;
}

/** 原 RV（js 65637）：跳过禁用项的环形移动 */
function findNextEnabledIndex(current: number, delta: number, items: MentionSuggestionItem[]): number {
  if (items.length === 0) return 0;
  let index = wrapIndex(current, delta, items.length);
  for (let step = 0; step < items.length; step++) {
    if (!items[index]?.disabled) return index;
    index = wrapIndex(index, delta >= 0 ? 1 : -1, items.length);
  }
  return current;
}

/** 原 GJe（js 65646）：列表变化后钳制到可用项 */
function clampToEnabledIndex(current: number, items: MentionSuggestionItem[]): number {
  if (items.length === 0) return 0;
  const clamped = Math.min(Math.max(current, 0), items.length - 1);
  if (!items[clamped]?.disabled) return clamped;
  const firstEnabled = items.findIndex((item) => !item.disabled);
  return firstEnabled >= 0 ? firstEnabled : clamped;
}

/** 原 KJe（js 65653 / jsx 58473）：提及选择器（@ 五类 / # 会话 / $ 技能） */
export function MentionSelector({
  workspacePath,
  workspaceIdentity,
  sessionId,
  provider,
  container,
  disabled = false,
  onWhiteboardMentionSelected,
}: {
  workspacePath: string | undefined; // 〔A1-R137〕面级联
  workspaceIdentity?: string | null;
  sessionId?: string | null;
  provider: string;
  container: HTMLElement | null;
  disabled?: boolean;
  onWhiteboardMentionSelected?: (boardId: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const { intl } = useIntlContext();
  const [activeTrigger, setActiveTrigger] = React.useState<{ trigger: string; query: string } | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const lastQueryKeyRef = React.useRef<string | null>(null);
  const lastTriggerKeyRef = React.useRef<string | null>(null);
  const trackedTokenRef = React.useRef<SlashTokenState | null>(null);
  const query = activeTrigger?.query ?? ``;
  const hasActiveQuery = hasNonEmptyQuery(query);
  const queryKey = React.useMemo(() => suggestionQueryKey(activeTrigger), [activeTrigger]);
  const isOpen = !disabled && (activeTrigger?.trigger === `@` || activeTrigger?.trigger === `$` || activeTrigger?.trigger === `#`);
  const isAtTrigger = activeTrigger?.trigger === `@`;
  const isHashTrigger = activeTrigger?.trigger === `#`;
  const isDollarTrigger = activeTrigger?.trigger === `$`;
  const skillSection = useSkillSuggestions(
    workspacePath,
    workspaceIdentity,
    provider,
    query,
    isOpen && isDollarTrigger,
    false,
    intl.formatMessage({ id: `chat.mention.skills.empty` }),
    intl.formatMessage({ id: `chat.mention.skills.title` }),
  );
  const emptyQueryLimit = hasActiveQuery ? 3 : 10;
  const fileSection = useFileSuggestions(
    workspacePath,
    query,
    isOpen && isAtTrigger,
    intl.formatMessage({ id: `chat.mention.files.empty` }),
    intl.formatMessage({ id: `chat.mention.files.title` }),
    emptyQueryLimit,
  );
  const whiteboardSection = useWhiteboardSuggestions(
    workspacePath,
    workspaceIdentity,
    query,
    isOpen && isAtTrigger && !!onWhiteboardMentionSelected,
    intl.formatMessage({ id: `chat.mention.whiteboards.empty` }),
    intl.formatMessage({ id: `chat.mention.whiteboards.title` }),
  );
  const sessionSection = useSessionSuggestions(
    provider,
    workspacePath,
    workspaceIdentity,
    query,
    isOpen && (isAtTrigger || isHashTrigger),
    mentionSessionScope(activeTrigger?.trigger),
    intl.formatMessage({ id: `chat.mention.sessions.empty` }),
    intl.formatMessage({ id: `chat.mention.sessions.title` }),
  );
  const pluginSection = usePluginSuggestions(
    workspacePath,
    workspaceIdentity,
    sessionId ?? null,
    query,
    isOpen && isAtTrigger,
    intl.formatMessage({ id: `chat.mention.plugins.empty` }),
    intl.formatMessage({ id: `chat.mention.plugins.title` }),
  );
  const visibleSections = React.useMemo(() => {
    const sections: Record<string, SuggestionSectionModel> = {
      files: {
        id: `files`,
        title: fileSection.title,
        items: fileSection.items,
        loading: fileSection.loading,
        errorText: fileSection.error?.message ?? null,
        emptyText: fileSection.emptyText,
      },
      plugins: {
        id: `plugins`,
        title: pluginSection.title,
        items: pluginSection.items,
        loading: pluginSection.loading,
        errorText: pluginSection.error?.message ?? null,
        emptyText: pluginSection.emptyText,
      },
      sessions: {
        id: `sessions`,
        title: sessionSection.title,
        items: sessionSection.items,
        loading: sessionSection.loading,
        errorText: sessionSection.error?.message ?? null,
        emptyText: sessionSection.emptyText,
      },
      skills: {
        id: `skills`,
        title: skillSection.title,
        items: skillSection.items,
        loading: skillSection.loading,
        errorText: skillSection.error?.message ?? null,
        emptyText: skillSection.emptyText,
      },
      whiteboards: {
        id: `whiteboards`,
        title: whiteboardSection.title,
        items: whiteboardSection.items,
        loading: whiteboardSection.loading,
        errorText: whiteboardSection.error?.message ?? null,
        emptyText: whiteboardSection.emptyText,
      },
    };
    return filterVisibleSuggestionSections(mentionCategoriesForTrigger(activeTrigger?.trigger).map((category) => sections[category]));
  }, [
    fileSection.emptyText,
    fileSection.error,
    fileSection.items,
    fileSection.loading,
    fileSection.title,
    activeTrigger?.trigger,
    pluginSection.emptyText,
    pluginSection.error,
    pluginSection.items,
    pluginSection.loading,
    pluginSection.title,
    sessionSection.emptyText,
    sessionSection.error,
    sessionSection.items,
    sessionSection.loading,
    sessionSection.title,
    whiteboardSection.emptyText,
    whiteboardSection.error,
    whiteboardSection.items,
    whiteboardSection.loading,
    whiteboardSection.title,
    skillSection.emptyText,
    skillSection.error,
    skillSection.items,
    skillSection.loading,
    skillSection.title,
  ]);
  const flatItems = React.useMemo(() => visibleSections.flatMap((section) => section.items), [visibleSections]);
  const panelSections = React.useMemo(
    () =>
      visibleSections.map((section) => ({
        id: section.id,
        title: section.title,
        options: section.items.map((item) => ({
          id: item.id,
          label: item.label,
          description: item.description,
          disabled: item.disabled,
          disabledReason: item.disabledReason,
          content:
            item.category === `files` ? (
              <FileRow
                path={(item.data?.path as string) ?? (item.data?.relativePath as string) ?? item.value}
                options={{
                  basePath: workspacePath,
                  kind:
                    item.data?.kind === `file` || item.data?.kind === `directory`
                      ? (item.data.kind as `file` | `directory`)
                      : void 0,
                  showFilePath: true,
                }}
              />
            ) : item.category === `skills` ? (
              <span className={`min-w-0 flex flex-1 items-center gap-2`}>
                <SkillIcon className={`size-3.5 shrink-0 text-foreground`} />
                <span className={`shrink-0 whitespace-nowrap text-ui-base font-medium text-foreground`}>{item.label}</span>
                <span className={`min-w-0 truncate text-ui-xs text-foreground-subtlest`}>{item.description}</span>
              </span>
            ) : item.category === `whiteboards` ? (
              <span className={`min-w-0 flex flex-1 items-center gap-2`}>
                <WhiteboardIcon className={`size-3.5 shrink-0 text-foreground`} />
                <span className={`shrink-0 whitespace-nowrap text-ui-base font-medium text-foreground`}>{item.label}</span>
                <span className={`min-w-0 truncate text-ui-xs text-foreground-subtlest`}>
                  {intl.formatMessage(
                    { id: `chat.mention.whiteboards.strokeCount` },
                    { count: item.description },
                  )}
                </span>
              </span>
            ) : item.category === `sessions` ? (
              <span className={`min-w-0 flex flex-1 items-center gap-2`}>
                <SessionIcon className={`size-3.5 shrink-0 text-foreground`} />
                <span className={`min-w-0 truncate text-ui-base font-medium text-foreground`}>{item.label}</span>
                <span className={`min-w-0 truncate text-ui-xs text-foreground-subtlest`}>{item.description}</span>
              </span>
            ) : item.category === `plugins` ? (
              <span className={`min-w-0 flex flex-1 items-center gap-2`}>
                <PluginMentionIcon src={item.data?.icon as string | undefined} className={`size-5 rounded-md`} iconClassName={`size-3`} />
                <span className={`shrink-0 whitespace-nowrap text-ui-base font-medium text-foreground`}>{item.label}</span>
                <span className={`min-w-0 truncate text-ui-xs text-foreground-subtlest`}>
                  {item.disabled && item.disabledReason ? item.disabledReason : item.description}
                </span>
              </span>
            ) : void 0,
        })),
        loading: section.loading,
        loadingText: intl.formatMessage({ id: `chat.mention.category.loading` }),
        errorText: section.errorText,
        emptyText: section.emptyText,
      })),
    [intl, visibleSections, workspacePath],
  );
  ((React.useEffect(() => {
    lastTriggerKeyRef.current = queryKey;
  }, [queryKey]),
    React.useEffect(() => {
      setSelectedIndex(0);
    }, [queryKey]),
    React.useEffect(() => {
      setSelectedIndex((prev) => clampToEnabledIndex(prev, flatItems));
    }, [flatItems]),
    React.useEffect(() => {
      disabled && (setActiveTrigger(null), setSelectedIndex(0), (trackedTokenRef.current = null));
    }, [disabled]),
    React.useEffect(
      () =>
        editor.registerUpdateListener(({ dirtyElements, dirtyLeaves, editorState }) => {
          editorState.read(() => {
            if (disabled) {
              ((trackedTokenRef.current = null), setActiveTrigger(null));
              return;
            }
            const context = readSlashCursorContext();
            if (!context) {
              ((trackedTokenRef.current = null), (lastQueryKeyRef.current = null), setActiveTrigger(null));
              return;
            }
            const tracked = trackSlashToken(trackedTokenRef.current, context, dirtyElements.size === 0 && dirtyLeaves.size === 0);
            if (!tracked || (tracked.trigger !== `@` && tracked.trigger !== `$` && tracked.trigger !== `#`)) {
              ((trackedTokenRef.current = null), (lastQueryKeyRef.current = null), setActiveTrigger(null));
              return;
            }
            trackedTokenRef.current = tracked;
            const nextKey = suggestionQueryKey(tracked);
            if ((lastQueryKeyRef.current !== null && lastQueryKeyRef.current !== nextKey && (lastQueryKeyRef.current = null), lastQueryKeyRef.current === nextKey)) {
              setActiveTrigger(null);
              return;
            }
            setActiveTrigger((prev) =>
              prev?.trigger === tracked.trigger && prev.query === tracked.query
                ? prev
                : { query: tracked.query, trigger: tracked.trigger },
            );
          });
        }),
      [disabled, editor],
    )));
  const selectItem = React.useCallback(
    (item: MentionSuggestionItem) => {
      if (item.category === `whiteboards` && onWhiteboardMentionSelected) {
        (editor.update(() => {
          const context = readSlashCursorContext();
          if (!context) return;
          const range = resolveSlashTokenRange(trackedTokenRef.current, context);
          const token = range ? trackedTokenRef.current : parseMentionTrigger(context.textBeforeCursor);
          if (!token || (token.trigger !== `@` && token.trigger !== `$`)) return;
          const start = range?.start ?? context.cursorOffset - token.query.length - 1;
          const end =
            range?.end ?? context.cursorOffset + mentionCompletionOverlap(token, context.textAfterCursor, [item.label, item.value as string, item.markdown ?? ``]);
          (context.selection.setTextNodeRange(context.node, start, context.node, end), context.selection.insertText(``));
        }),
          (lastQueryKeyRef.current = null),
          (trackedTokenRef.current = null),
          setActiveTrigger(null),
          setSelectedIndex(0),
          onWhiteboardMentionSelected(item.value as string),
          requestAnimationFrame(() => {
            editor.focus();
          }));
        return;
      }
      (editor.update(() => {
        const context = readSlashCursorContext();
        if (!context) return;
        const range = resolveSlashTokenRange(trackedTokenRef.current, context);
        const token = range ? trackedTokenRef.current : parseMentionTrigger(context.textBeforeCursor);
        if (!token || (token.trigger !== `@` && token.trigger !== `$` && token.trigger !== `#`)) return;
        const start = range?.start ?? context.cursorOffset - token.query.length - 1;
        const end =
          range?.end ?? context.cursorOffset + mentionCompletionOverlap(token, context.textAfterCursor, [item.label, item.value as string, item.markdown ?? ``]);
        context.selection.setTextNodeRange(context.node, start, context.node, end);
        const spaceNode = $createTextNode(` `);
        (context.selection.insertNodes([
          createMentionNode({
            id: item.id,
            category: item.category as string,
            label: item.label,
            value: item.value as string,
            markdown: item.markdown,
            description: item.description,
            data: item.data,
          }),
          spaceNode,
        ]),
          spaceNode.selectEnd());
      }),
        (lastQueryKeyRef.current = null),
        (trackedTokenRef.current = null),
        setActiveTrigger(null),
        setSelectedIndex(0),
        requestAnimationFrame(() => {
          editor.focus();
        }));
    },
    [editor, onWhiteboardMentionSelected],
  );
  const selectByIndex = React.useCallback(
    (index: number) => {
      const item = flatItems[index];
      return !item || item.disabled ? false : (selectItem(item), true);
    },
    [flatItems, selectItem],
  );
  ((React.useEffect(() => {
    if (!isOpen) return;
    const unregisterDown = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event) =>
        flatItems.length === 0
          ? false
          : (event?.preventDefault(), event?.stopPropagation(), setSelectedIndex((prev) => findNextEnabledIndex(prev, 1, flatItems)), true),
      4,
    );
    const unregisterUp = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event) =>
        flatItems.length === 0
          ? false
          : (event?.preventDefault(), event?.stopPropagation(), setSelectedIndex((prev) => findNextEnabledIndex(prev, -1, flatItems)), true),
      4,
    );
    const unregisterEnter = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => (selectByIndex(selectedIndex) ? (event?.preventDefault(), event?.stopPropagation(), true) : false),
      4,
    );
    const unregisterTab = editor.registerCommand(
      KEY_TAB_COMMAND,
      (event) => (selectByIndex(selectedIndex) ? (event?.preventDefault(), event?.stopPropagation(), true) : false),
      4,
    );
    const unregisterEscape = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      (event) => (
        event?.preventDefault(),
        event?.stopPropagation(),
        (lastQueryKeyRef.current = lastTriggerKeyRef.current),
        setActiveTrigger(null),
        setSelectedIndex(0),
        true
      ),
      4,
    );
    const unregisterBlur = editor.registerCommand(
      BLUR_COMMAND,
      () => ((lastQueryKeyRef.current = null), (trackedTokenRef.current = null), setActiveTrigger(null), setSelectedIndex(0), false),
      1,
    );
    return () => {
      (unregisterDown(), unregisterUp(), unregisterEnter(), unregisterTab(), unregisterEscape(), unregisterBlur());
    };
  }, [editor, flatItems, isOpen, selectByIndex, selectedIndex]),
    React.useEffect(
      () =>
        editor.registerCommand(
          COPY_COMMAND,
          (event) => {
            const selection = $getSelection();
            return !$isRangeSelection(selection) || !(event instanceof ClipboardEvent)
              ? false
              : (event.preventDefault(),
                event.clipboardData?.setData(`text/plain`, selection.getTextContent()),
                true);
          },
          4,
        ),
      [editor],
    )));
  const panelTitle = intl.formatMessage({ id: `chat.mention.title` });
  const description = hasActiveQuery
    ? ``
    : activeTrigger?.trigger === `#`
      ? intl.formatMessage({ id: `chat.mention.sessions.searchHint` })
      : activeTrigger?.trigger === `$`
        ? intl.formatMessage({ id: `chat.mention.skills.searchHint` })
        : intl.formatMessage({ id: `chat.mention.searchHint` });
  const emptyText = hasActiveQuery ? intl.formatMessage({ id: `chat.mention.emptyResults` }) : ``;
  return !isOpen || !container
    ? null
    : ReactDOM.createPortal(
        <SuggestionPanel
          title={panelTitle}
          description={description}
          trigger={activeTrigger?.trigger ?? `@`}
          sections={panelSections}
          emptyText={emptyText}
          selectedIndex={selectedIndex}
          hasActiveQuery={hasActiveQuery}
          onSelect={selectByIndex}
        />,
        container,
      );
}

/* ============================================================================
 * [B8] js 66094–66331 —— 编辑器辅助：任务 provider 解析、提示词历史、媒体查询、
 *      提交判定、Lexical 内容读写/提及填充
 * ========================================================================== */

/** zV → resolveTaskProvider（js 66094） */
function resolveTaskProvider(taskId: string | null | undefined, scope: any): any {
  return taskId
    ? (scope.optimisticTaskListByTaskId[taskId]?.provider ??
        scope.taskListCache?.find((entry: any) => entry.taskId === taskId)?.provider ??
        scope.selectedProvider)
    : scope.selectedProvider;
}

/** qJe → useActiveTaskProvider（js 66103） */
function useActiveTaskProvider(
  taskId: string | null | undefined,
  workspacePath: string | undefined, // 〔A1-R137〕面级联
  workspaceIdentity?: string | null,
): any {
  const tabWorkspaceIdentity = useWorkspaceTabsSelector((state: any) => {
      if (!state.activeTabId) return;
      const tab = state.tabs.find((candidate: any) => candidate.id === state.activeTabId);
      if (!(!tab || !isWorkspaceTab(tab) || tab.workspacePath !== workspacePath)) return tab.workspaceIdentity;
    });
  const effectiveIdentity = workspaceIdentity ?? tabWorkspaceIdentity;
  return useTaskStore((scope) => resolveTaskProvider(taskId, taskScopeSelector(scope, workspacePath, effectiveIdentity)));
}

/** JJe → appendPromptHistory（js 66112） */
function appendPromptHistory(history: string[], rawText: string, limit = 30): string[] {
  const trimmed = rawText.trim();
  if (!trimmed || history.at(-1)?.trim() === trimmed) return [...history];
  const maxEntries = Math.max(1, Math.trunc(limit));
  return [...history, trimmed].slice(-maxEntries);
}

/** YJe → navigatePromptHistory（js 66118） */
function navigatePromptHistory(
  history: string[],
  currentIndex: number | null,
  direction: string,
): { nextIndex: number | null; nextValue: string; shouldHandle: boolean } {
  if (history.length === 0) return { nextIndex: currentIndex, nextValue: ``, shouldHandle: false };
  if (direction === `up`) {
    const nextIndex = currentIndex === null ? history.length - 1 : Math.max(currentIndex - 1, 0);
    return { nextIndex, nextValue: history[nextIndex] ?? ``, shouldHandle: true };
  }
  if (currentIndex === null) {
    const lastIndex = history.length - 1;
    return { nextIndex: lastIndex, nextValue: history[lastIndex] ?? ``, shouldHandle: true };
  }
  if (currentIndex >= history.length - 1) return { nextIndex: null, nextValue: ``, shouldHandle: true };
  const nextIndex = currentIndex + 1;
  return { nextIndex, nextValue: history[nextIndex] ?? ``, shouldHandle: true };
}

/** BV → MOBILE_TEXT_INPUT_MEDIA_QUERY（js 66134） */
const MOBILE_TEXT_INPUT_MEDIA_QUERY = `(max-width: 767px) and (hover: none) and (pointer: coarse)`;

/** XJe → matchesMediaQuery（js 66135） */
function matchesMediaQuery(query: string): boolean {
  return (
    typeof window < `u` && typeof window.matchMedia == `function` && window.matchMedia(query).matches
  );
}

/** ZJe → subscribeMediaQuery（js 66139） */
function subscribeMediaQuery(query: string, onChange: (matches: boolean) => void): () => void {
  if (typeof window > `u` || typeof window.matchMedia != `function`) return (onChange(false), () => {});
  const mediaQueryList = window.matchMedia(query);
  const report = () => onChange(mediaQueryList.matches);
  return (
    report(),
    typeof mediaQueryList.addEventListener == `function`
      ? (mediaQueryList.addEventListener(`change`, report), () => mediaQueryList.removeEventListener(`change`, report))
      : ((mediaQueryList as any).addListener(report), () => (mediaQueryList as any).removeListener(report))
  );
}

/** QJe → isMobileTextInputViewportNow（js 66149） */
function isMobileTextInputViewportNow(): boolean {
  return matchesMediaQuery(MOBILE_TEXT_INPUT_MEDIA_QUERY);
}

/** $Je → subscribeMobileTextInputViewport（js 66152） */
function subscribeMobileTextInputViewport(onChange: (matches: boolean) => void): () => void {
  return subscribeMediaQuery(MOBILE_TEXT_INPUT_MEDIA_QUERY, onChange);
}

/** VV → useIsMobileTextInputViewport（js 66155） */
export function useIsMobileTextInputViewport(): boolean {
  const [matches, setMatches] = React.useState(isMobileTextInputViewportNow);
  return (React.useEffect(() => subscribeMobileTextInputViewport(setMatches), []), matches);
}

/** eYe → isEnterSubmitAllowed（js 66159） */
function isEnterSubmitAllowed({ isMobileTextInputViewport: mobile, preferEnterNewline: preferNewline }: { isMobileTextInputViewport: boolean; preferEnterNewline: boolean }): boolean {
  return !(preferNewline && mobile);
}

/** tYe → submitShortcutKey（js 66162） */
function submitShortcutKey({ enterSubmits }: { enterSubmits: boolean }): string | undefined {
  return enterSubmits ? `Enter` : void 0;
}

/** nYe → isMobileWebRemoteInput（js 66165） */
function isMobileWebRemoteInput({ isMobileTextInputViewport: mobile, isWebRemoteControl: webRemote }: { isMobileTextInputViewport: boolean; isWebRemoteControl: boolean }): boolean {
  return webRemote && mobile;
}

/** HV → inputTextClass（js 66167） */
function inputTextClass({ avoidIosInputFocusZoom }: { avoidIosInputFocusZoom: boolean }): string {
  return avoidIosInputFocusZoom ? `text-mobile-input-safe leading-6` : `text-ui-base leading-5`;
}

/** rYe → CJK_COMMA（js 66173） */
const CJK_COMMA = `、`;
/** iYe → SLASH_CHAR（js 66174） */
const SLASH_CHAR = `/`;

/** aYe → canSubmitText（js 66175） */
function canSubmitText({
  allowSubmitWhenEmpty: allowEmpty = false,
  ctrlKey = false,
  enterSubmits,
  isComposing = false,
  metaKey = false,
  shiftKey = false,
  text,
}: {
  allowSubmitWhenEmpty?: boolean;
  ctrlKey?: boolean;
  enterSubmits: boolean;
  isComposing?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  text: string;
}): boolean {
  return !enterSubmits || shiftKey || ctrlKey || metaKey || isComposing ? false : !!(text.trim() || allowEmpty);
}

/** oYe → isSubmitAccepted（js 66187） */
function isSubmitAccepted(result: unknown): boolean {
  return result !== false;
}

/** sYe → isCjkCommaSlashInput（js 66188） */
function isCjkCommaSlashInput({ data, inputType, isAtEditorStart, isComposing = false }: { data: string | null | undefined; inputType: string; isAtEditorStart: boolean; isComposing?: boolean }): boolean {
  return data === CJK_COMMA && inputType === `insertText` && isAtEditorStart && !isComposing;
}

/** UV → readEditorText（js 66192） */
function readEditorText(editor: LexicalEditor | LexicalEditorState): string {
  let text = ``;
  return (
    editor.read(() => {
      text = $getRoot().getTextContent();
    }),
    text
  );
}

/** WV → setEditorText（js 66199） */
function setEditorText(editor: LexicalEditor, text: string): void {
  editor.update(
    () => {
      const root = $getRoot();
      root.clear();
      for (const line of text.split(`

`)) {
        const paragraph = $createParagraphNode();
        (line && paragraph.append($createTextNode(line)), root.append(paragraph));
      }
      root.getLastChild()?.selectEnd();
    },
    { tag: PROGRAMMATIC_UPDATE_TAG },
  );
}

/** cYe → setEditorMention（js 66214） */
function setEditorMention(editor: LexicalEditor, mention: MentionPayload, trailingText = ``): void {
  editor.update(
    () => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      (paragraph.append(createMentionNode(mention), ...(trailingText ? [$createTextNode(trailingText)] : [])), root.append(paragraph), root.getLastChild()?.selectEnd());
    },
    { tag: PROGRAMMATIC_UPDATE_TAG },
  );
}

/** GV → applyEditorStateJson（js 66225；A0-S3d：json 面收口真实 parseEditorState 参数 `string | SerializedEditorState`） */
function applyEditorStateJson(editor: LexicalEditor, json: string | SerializedEditorState): void {
  const state = editor.parseEditorState(json);
  editor.setEditorState(state, { tag: PROGRAMMATIC_UPDATE_TAG });
}

/** KV → clearEditor（js 66229） */
function clearEditor(editor: LexicalEditor): void {
  setEditorText(editor, ``);
}

/** lYe → setSkillMentionContent（js 66232） */
function setSkillMentionContent(editor: LexicalEditor, skillName: string, markdown = `$${skillName}`, trailingText = ` `): void {
  editor.update(
    () => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      (paragraph.append(
        createMentionNode({ id: `prefill-skill:${skillName}`, category: `skills`, label: skillName, value: skillName, markdown }),
        $createTextNode(trailingText),
      ),
        root.append(paragraph),
        root.getLastChild()?.selectEnd());
    },
    { tag: PROGRAMMATIC_UPDATE_TAG },
  );
}

/** uYe → setSlashCommandMentionContent（js 66248） */
function setSlashCommandMentionContent(editor: LexicalEditor, commandName: string, markdown = `/${commandName}`, trailingText = ` `): void {
  editor.update(
    () => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      (paragraph.append(
        createMentionNode({ id: `prefill-slash:${commandName}`, category: `commands`, label: commandName, value: commandName, markdown }),
        $createTextNode(trailingText),
      ),
        root.append(paragraph),
        root.getLastChild()?.selectEnd());
    },
    { tag: PROGRAMMATIC_UPDATE_TAG },
  );
}

/** dYe → appendFileMentionContent（js 66264） */
function appendFileMentionContent(
  editor: LexicalEditor,
  label: string,
  filePath: string,
  markdown: string,
  data: Record<string, unknown> | undefined,
  trailingText = ` `,
): void {
  editor.update(
    () => {
      const root = $getRoot();
      const lastChild = root.getLastChild();
      const paragraph = $isParagraphNode(lastChild) ? lastChild : $createParagraphNode();
      $isParagraphNode(lastChild) || root.append(paragraph);
      const existingText = paragraph.getTextContent();
      (existingText.length > 0 && !/\s$/.test(existingText) && paragraph.append($createTextNode(` `)),
        paragraph.append(
          createMentionNode({
            id: `dropped-file:${filePath}`,
            category: `files`,
            label,
            value: filePath,
            markdown,
            data,
          }),
          $createTextNode(trailingText),
        ),
        paragraph.selectEnd());
    },
    { tag: PROGRAMMATIC_UPDATE_TAG },
  );
}

/** fYe → appendTextContent（js 66289） */
function appendTextContent(editor: LexicalEditor, text: string): void {
  editor.update(
    () => {
      const root = $getRoot();
      const lastChild = root.getLastChild();
      const paragraph = $isParagraphNode(lastChild) ? lastChild : $createParagraphNode();
      $isParagraphNode(lastChild) || root.append(paragraph);
      const existingText = paragraph.getTextContent();
      (existingText.length > 0 && !/\s$/.test(existingText) && paragraph.append($createTextNode(` `)), paragraph.append($createTextNode(text)), paragraph.selectEnd());
    },
    { tag: PROGRAMMATIC_UPDATE_TAG },
  );
}

/** pYe → findMentionIdAfterCaret（js 66302） */
function findMentionIdAfterCaret(container: HTMLElement): string | null {
  const selection = window.getSelection();
  if (!selection?.isCollapsed || !selection.anchorNode) return null;
  const anchorNode = selection.anchorNode;
  return container.contains(anchorNode)
    ? anchorNode.nodeType === Node.ELEMENT_NODE
      ? mentionIdFromElement((anchorNode as Element).childNodes.item(selection.anchorOffset))
      : anchorNode.nodeType !== Node.TEXT_NODE || selection.anchorOffset !== (anchorNode.textContent ?? ``).length
        ? null
        : mentionIdFromElement(anchorNode.nextSibling)
    : null;
}

/** qV → mentionIdFromElement（js 66316） */
function mentionIdFromElement(node: Node | null | undefined): string | null {
  return !(node instanceof HTMLElement) || !node.matches(`[data-mention-id]`)
    ? null
    : (node.dataset.mentionId ?? null);
}

/** mYe → focusAfterMention（js 66321） */
function focusAfterMention(mentionId: string): boolean {
  const mentionNode = $getRoot()
    .getAllTextNodes()
    .find((node) => isMentionNode(node) && (node as PromptMentionNode).getMention().id === mentionId);
  if (!mentionNode) return false;
  const nextSibling = mentionNode.getNextSibling();
  if ($isTextNode(nextSibling)) {
    const text = nextSibling.getTextContent();
    const offset = /^\s/.test(text) ? Math.min(1, text.length) : 0;
    return (nextSibling.select(offset, offset), true);
  }
  return (mentionNode.selectNext(0, 0), true);
}

/* ============================================================================
 * [B9] js 66333–66810 —— Lexical 插件族 + LexicalChatInput 宿主
 * ========================================================================== */

/** hYe → SubmitOnEnterPlugin（js 66333） */
function SubmitOnEnterPlugin({
  onSubmit,
  disabled,
  submitDisabled,
  allowSubmitWhenEmpty,
  enterSubmits,
}: {
  onSubmit: (text: string) => unknown;
  disabled: boolean;
  submitDisabled: boolean;
  allowSubmitWhenEmpty: boolean;
  enterSubmits: boolean;
}): null {
  const [editor] = useLexicalComposerContext();
  return (
    React.useEffect(() => {
      const unregisterEnter = editor.registerCommand(
          KEY_ENTER_COMMAND,
          (event) => {
            if (!event) return false;
            if (disabled) return (event.preventDefault(), true);
            if (event.shiftKey || event.ctrlKey || event.metaKey || event.isComposing || submitDisabled || !enterSubmits) return false;
            event.preventDefault();
            const text = readEditorText(editor.getEditorState());
            return (
              canSubmitText({ allowSubmitWhenEmpty, enterSubmits, text }) && isSubmitAccepted(onSubmit(text)) && clearEditor(editor),
              true
            );
          },
          3,
        ),
        unregisterBackspace = editor.registerCommand(
          KEY_BACKSPACE_COMMAND,
          (event) => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;
            const anchor = selection.anchor;
            if (anchor.type !== `text`) return false;
            const anchorNode = anchor.getNode();
            if (!$isTextNode(anchorNode)) return false;
            const textContent = anchorNode.getTextContent();
            if (anchor.offset !== 1 || textContent !== ` `) return false;
            const previousSibling = anchorNode.getPreviousSibling();
            return isMentionNode(previousSibling)
              ? (event?.preventDefault(), previousSibling.remove(), anchorNode.remove(), anchorNode.getParent()?.selectEnd(), true)
              : false;
          },
          3,
        ),
        handleAltArrowRight = (event: KeyboardEvent) => {
          if (
            disabled ||
            event.key !== `ArrowRight` ||
            !event.altKey ||
            event.shiftKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.isComposing
          )
            return;
          const rootElement = editor.getRootElement();
          if (!rootElement) return;
          const mentionId = findMentionIdAfterCaret(rootElement);
          mentionId &&
            (event.preventDefault(),
            event.stopImmediatePropagation(),
            editor.update(
              () => {
                focusAfterMention(mentionId);
              },
              { tag: PROGRAMMATIC_UPDATE_TAG },
            ));
        },
        unregisterRoot = editor.registerRootListener((nextRoot, prevRoot) => {
          (prevRoot?.removeEventListener(`keydown`, handleAltArrowRight, { capture: true }),
            nextRoot?.addEventListener(`keydown`, handleAltArrowRight, { capture: true }));
        });
      return () => {
        (unregisterEnter(), unregisterBackspace(), unregisterRoot(), editor.getRootElement()?.removeEventListener(`keydown`, handleAltArrowRight, { capture: true }));
      };
    }, [allowSubmitWhenEmpty, disabled, editor, enterSubmits, onSubmit, submitDisabled]),
    null
  );
}

/** gYe → EditorChangeLogger（js 66411） */
function EditorChangeLogger({ onChange, taskId }: { onChange?: ((text: string) => void) | undefined; taskId?: string | null }): null {
  const [editor] = useLexicalComposerContext();
  const isComposingRef = React.useRef(false);
  return (
    React.useEffect(() => {
      const markCompositionStart = () => {
          isComposingRef.current = true;
        },
        markCompositionEnd = () => {
          queueMicrotask(() => {
            isComposingRef.current = false;
          });
        };
      return editor.registerRootListener((nextRoot, prevRoot) => {
        (prevRoot?.removeEventListener(`compositionstart`, markCompositionStart),
          prevRoot?.removeEventListener(`compositionend`, markCompositionEnd),
          nextRoot?.addEventListener(`compositionstart`, markCompositionStart),
          nextRoot?.addEventListener(`compositionend`, markCompositionEnd));
      });
    }, [editor]),
    React.useEffect(() => {
      if (onChange)
        return editor.registerUpdateListener(
          ({ dirtyElements, dirtyLeaves, editorState, prevEditorState, tags }) => {
            if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
            const startedAt = performance.now();
            const text = readEditorText(editorState);
            text !== readEditorText(prevEditorState) &&
              (onChange(text),
              reportLexicalInputTelemetry({
                lagMs: performance.now() - startedAt,
                textLength: text.length,
                isProgrammatic: tags.has(PROGRAMMATIC_UPDATE_TAG),
                isComposing: isComposingRef.current,
                taskId: taskId ?? void 0,
              }));
          },
        );
    }, [editor, onChange, taskId]),
    null
  );
}

/** _Ye → EditableSyncPlugin（js 66451） */
function EditableSyncPlugin({ editable }: { editable: boolean }): null {
  const [editor] = useLexicalComposerContext();
  return (
    React.useEffect(() => {
      editor.setEditable(editable);
    }, [editor, editable]),
    null
  );
}

/** vYe → E2ELexicalBridgePlugin（js 66463） */
function E2ELexicalBridgePlugin({ inputTestId }: { inputTestId?: string }): null {
  const [editor] = useLexicalComposerContext();
  return (
    React.useEffect(() => {
      if (!inputTestId || typeof document > `u`) return;
      const bridgeApi = {
          focus: () => editor.focus(),
          getEditorState: () => editor.getEditorState(),
          getText: () => readEditorText(editor.getEditorState()),
          setText: (text: string) => setEditorText(editor, text),
          setEditorStateJson: (json: string | SerializedEditorState) => applyEditorStateJson(editor, json),
        };
      let attachedElement: Element | null = null;
      const detachBridge = (element: Element | null) => {
          (element && (element as any).__zcodeLexicalInputE2E === bridgeApi && delete (element as any).__zcodeLexicalInputE2E,
            element?.removeAttribute(`data-e2e-lexical-bridge`));
        },
        attachBridge = (element: Element | null) => {
          (attachedElement && attachedElement !== element && detachBridge(attachedElement),
            (attachedElement = element),
            element &&
              (Object.defineProperty(element, `__zcodeLexicalInputE2E`, { configurable: true, value: bridgeApi }),
              element.setAttribute(`data-e2e-lexical-bridge`, `ready`)));
        },
        resolveBridgeElement = (candidate: Element | null) =>
          candidate?.getAttribute(`data-testid`) === inputTestId ? candidate : document.querySelector(`[data-testid="${inputTestId}"]`);
      let pollTimer: number | null = null;
      const syncBridge = () => {
          const element = resolveBridgeElement(editor.getRootElement());
          (attachBridge(element), element && pollTimer !== null && (window.clearInterval(pollTimer), (pollTimer = null)));
        },
        unregisterRoot = editor.registerRootListener((nextRoot, prevRoot) => {
          (prevRoot !== nextRoot && detachBridge(prevRoot), attachBridge(resolveBridgeElement(nextRoot)));
        });
      return (
        syncBridge(),
        (pollTimer = window.setInterval(syncBridge, 100)),
        () => {
          (unregisterRoot(), pollTimer !== null && window.clearInterval(pollTimer), detachBridge(attachedElement));
        }
      );
    }, [editor, inputTestId]),
    null
  );
}

/** yYe → PromptHistoryNavigationPlugin（js 66507） */
function PromptHistoryNavigationPlugin({ entries, disabled }: { entries: string[]; disabled: boolean }): null {
  const [editor] = useLexicalComposerContext();
  const historyIndexRef = React.useRef<number | null>(null);
  const suppressNextUpdateRef = React.useRef(false);
  (React.useEffect(() => {
    historyIndexRef.current !== null && entries[historyIndexRef.current] === void 0 && (historyIndexRef.current = null);
  }, [entries]),
    React.useEffect(
      () =>
        editor.registerUpdateListener(({ dirtyElements, dirtyLeaves, editorState }) => {
          if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
          if (suppressNextUpdateRef.current) {
            suppressNextUpdateRef.current = false;
            return;
          }
          const historyIndex = historyIndexRef.current;
          if (historyIndex !== null) {
            if (entries[historyIndex] === void 0) {
              historyIndexRef.current = null;
              return;
            }
            readEditorText(editorState) !== entries[historyIndex] && (historyIndexRef.current = null);
          }
        }),
      [editor, entries],
    ));
  const applyHistoryEntry = React.useCallback(
      (nextIndex: number | null, nextValue: string) => {
        ((historyIndexRef.current = nextIndex),
          (suppressNextUpdateRef.current = true),
          editor.update(
            () => {
              const root = $getRoot();
              root.clear();
              for (const line of nextValue.split(`

`)) {
                const paragraph = $createParagraphNode();
                (line && paragraph.append($createTextNode(line)), root.append(paragraph));
              }
              root.getLastChild()?.selectEnd();
            },
            { tag: HISTORY_NAVIGATION_TAG },
          ));
      },
      [editor],
    ),
    buildHistoryHandler = React.useCallback(
      (direction: string) => (event: KeyboardEvent | null) => {
        if (!event || disabled || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return false;
        const text = readEditorText(editor.getEditorState());
        const historyIndex = historyIndexRef.current;
        if (historyIndex === null && text.length > 0) return false;
        const navigation = navigatePromptHistory(entries, historyIndex, direction);
        return navigation.shouldHandle ? (event.preventDefault(), applyHistoryEntry(navigation.nextIndex, navigation.nextValue), true) : false;
      },
      [applyHistoryEntry, disabled, editor, entries],
    );
  return (
    React.useEffect(() => {
      const unregisterUp = editor.registerCommand(KEY_ARROW_UP_COMMAND, buildHistoryHandler(`up`), 3);
      const unregisterDown = editor.registerCommand(KEY_ARROW_DOWN_COMMAND, buildHistoryHandler(`down`), 3);
      return () => {
        (unregisterUp(), unregisterDown());
      };
    }, [editor, buildHistoryHandler]),
    null
  );
}

/** JV → isCaretAtEditorStart（js 66575） */
function isCaretAtEditorStart(): boolean {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;
  const [anchor] = selection.getStartEndPoints() ?? [];
  if (!anchor || anchor.offset !== 0) return false;
  const root = $getRoot();
  const anchorNode = anchor.getNode();
  return anchor.type === `text`
    ? ((root.getAllTextNodes()[0] ?? null)?.is(anchorNode) ?? root.getTextContentSize() === 0)
    : anchorNode.is(root)
      ? true
      : (root.getFirstDescendant()?.is(anchorNode) ?? root.getTextContentSize() === 0);
}

/** bYe → CjkCommaSlashPlugin（js 66588） */
function CjkCommaSlashPlugin({ disabled }: { disabled: boolean }): null {
  const [editor] = useLexicalComposerContext();
  return (
    React.useEffect(() => {
      if (disabled) return;
      const handleBeforeInput = (event: InputEvent) => {
        let shouldConvert = false;
        (editor.getEditorState().read(() => {
          shouldConvert = isCjkCommaSlashInput({
            data: event.data,
            inputType: event.inputType,
            isAtEditorStart: isCaretAtEditorStart(),
            isComposing: event.isComposing,
          });
        }),
          shouldConvert &&
            (event.preventDefault(),
            editor.update(
              () => {
                if (!isCaretAtEditorStart()) return;
                const selection = $getSelection();
                $isRangeSelection(selection) && selection.insertText(SLASH_CHAR);
              },
              { tag: PROGRAMMATIC_UPDATE_TAG },
            )));
      };
      return editor.registerRootListener((nextRoot, prevRoot) => {
        (prevRoot?.removeEventListener(`beforeinput`, handleBeforeInput), nextRoot?.addEventListener(`beforeinput`, handleBeforeInput));
      });
    }, [disabled, editor]),
    null
  );
}

/** xYe → PasteCapturePlugin（js 66623） */
function PasteCapturePlugin({ disabled, onPaste }: { disabled: boolean; onPaste?: ((event: ClipboardEvent) => void) | undefined }): null {
  const [editor] = useLexicalComposerContext();
  return (
    React.useEffect(() => {
      if (!onPaste) return;
      const handlePaste = (event: ClipboardEvent) => {
        if (disabled) return;
        const alreadyPrevented = event.defaultPrevented;
        (onPaste(event), event.defaultPrevented && !alreadyPrevented && event.stopImmediatePropagation());
      };
      return editor.registerRootListener((nextRoot, prevRoot) => {
        (prevRoot?.removeEventListener(`paste`, handlePaste, { capture: true }),
          nextRoot?.addEventListener(`paste`, handlePaste, { capture: true }));
      });
    }, [disabled, editor, onPaste]),
    null
  );
}

/** Composer 编辑器对外 API（SYe 注入形状） */
export interface ComposerEditorApi {
  clear(): void;
  focus(): void;
  getEditorState(): LexicalEditorState;
  getMarkdown(): string;
  getText(): string;
  appendText(text: string): void;
  appendFileMention(label: string, filePath: string, markdown: string, data: Record<string, unknown> | undefined, trailingText?: string): void;
  setMention(mention: MentionPayload, trailingText?: string): void;
  setText(text: string): void;
  setEditorStateJson(json: string | SerializedEditorState): void;
  setSkillMention(skillName: string, markdown?: string, trailingText?: string): void;
  setSlashCommandMention(commandName: string, markdown?: string, trailingText?: string): void;
}

/** SYe → EditorApiPlugin（js 66639） */
function EditorApiPlugin({ editorApiRef }: { editorApiRef?: { current: ComposerEditorApi | null } | null }): null {
  const [editor] = useLexicalComposerContext();
  return (
    React.useEffect(() => {
      if (editorApiRef)
        return (
          (editorApiRef.current = {
            clear: () => clearEditor(editor),
            focus: () => editor.focus(),
            getEditorState: () => editor.getEditorState(),
            getMarkdown: () => readEditorText(editor.getEditorState()),
            getText: () => readEditorText(editor.getEditorState()),
            appendText: (text) => appendTextContent(editor, text),
            appendFileMention: (label, filePath, markdown, data, trailingText = ` `) => appendFileMentionContent(editor, label, filePath, markdown, data, trailingText),
            setMention: (mention, trailingText) => setEditorMention(editor, mention, trailingText),
            setText: (text) => setEditorText(editor, text),
            setEditorStateJson: (json) => applyEditorStateJson(editor, json),
            setSkillMention: (skillName, markdown = `$${skillName}`, trailingText = ` `) => setSkillMentionContent(editor, skillName, markdown, trailingText),
            setSlashCommandMention: (commandName, markdown = `/${commandName}`, trailingText = ` `) => setSlashCommandMentionContent(editor, commandName, markdown, trailingText),
          }),
          () => {
            editorApiRef.current = null;
          }
        );
    }, [editor, editorApiRef]),
    null
  );
}

/** CYe → LEXICAL_CHAT_INPUT_THEME（js 66666） */
const LEXICAL_CHAT_INPUT_THEME = { paragraph: `m-0` };

/** wYe → LexicalChatInput（js 66668） */
function LexicalChatInput({
  placeholder,
  disabled = false,
  submitDisabled = false,
  allowSubmitWhenEmpty = false,
  enterSubmits = true,
  onSubmit,
  onChange,
  onFocus,
  triggerPanelContainer,
  workspacePath,
  workspaceIdentity,
  taskId,
  inputTestId,
  editorApiRef,
  promptHistory = [],
  avoidIosInputFocusZoom = false,
  compactPlaceholder = false,
  onWhiteboardMentionSelected,
  onPaste,
  excludedSlashCommandNames,
  appSlashCommands,
  enableMentionPanel = true,
}: {
  placeholder?: string;
  disabled?: boolean;
  submitDisabled?: boolean;
  allowSubmitWhenEmpty?: boolean;
  enterSubmits?: boolean;
  onSubmit: (text: string) => unknown;
  onChange?: (text: string) => void;
  onFocus?: React.FocusEventHandler;
  triggerPanelContainer: HTMLElement | null;
  workspacePath: string | undefined; // 〔A1-R137〕面级联
  workspaceIdentity?: string | null;
  taskId?: string | null;
  inputTestId?: string;
  editorApiRef?: { current: ComposerEditorApi | null } | null;
  promptHistory?: string[];
  avoidIosInputFocusZoom?: boolean;
  compactPlaceholder?: boolean;
  onWhiteboardMentionSelected?: (mention: unknown) => void;
  onPaste?: (event: ClipboardEvent) => void;
  excludedSlashCommandNames?: string[];
  appSlashCommands?: AppSlashCommand[];
  enableMentionPanel?: boolean;
}): React.ReactElement {
  const mountTimeRef = React.useRef(Date.now());
  const firstFrameKeyRef = React.useRef<string | null>(null);
  const activeProvider = useActiveTaskProvider(taskId, workspacePath, workspaceIdentity);
  React.useEffect(() => {
    const frameKey = [workspaceIdentity ?? workspacePath, taskId ?? `draft`, activeProvider, triggerPanelContainer ? `trigger-ready` : `trigger-missing`].join(`|`);
    if (firstFrameKeyRef.current === frameKey) return;
    firstFrameKeyRef.current = frameKey;
    let animationFrame: number | null = null;
    const reportFirstFrame = () => {
      logger.info(`[LexicalChatInput] 输入编辑器首帧完成`, {
        durationMs: Date.now() - mountTimeRef.current,
        activeTaskProvider: activeProvider,
        disabled,
        hasPromptHistory: promptHistory.length > 0,
        submitDisabled,
        taskId,
        triggerPanelReady: !!triggerPanelContainer,
        workspaceIdentity: workspaceIdentity ?? null,
        workspacePath,
      });
    };
    return (
      typeof requestAnimationFrame == `function` ? (animationFrame = requestAnimationFrame(reportFirstFrame)) : reportFirstFrame(),
      () => {
        animationFrame !== null && cancelAnimationFrame(animationFrame);
      }
    );
  }, [activeProvider, disabled, promptHistory.length, submitDisabled, taskId, triggerPanelContainer, workspaceIdentity, workspacePath]);
  const submitAndRefocus = React.useCallback(
      (text: string) => {
        const result = onSubmit(text);
        return (
          requestAnimationFrame(() => {
            editorApiRef?.current?.focus();
          }),
          result
        );
      },
      [editorApiRef, onSubmit],
    ),
    placeholderProps = placeholder
      ? {
          "aria-placeholder": placeholder,
          placeholder: (
            <div className={`pointer-events-none absolute left-0 top-0 ${compactPlaceholder ? `line-clamp-2` : ``} ${inputTextClass({ avoidIosInputFocusZoom })} text-foreground-subtlest`}>
              {placeholder}
            </div>
          ),
        }
      : { placeholder: null },
    contentEditable = (
      <LexicalContentEditable
        className={`min-h-10 max-h-40 overflow-y-auto ${inputTextClass({ avoidIosInputFocusZoom })} text-foreground outline-none`}
        data-testid={inputTestId}
        onFocus={onFocus}
        {...placeholderProps}
      />
    );
  return (
    <div className={`relative flex-1`}>
      <LexicalComposer
        initialConfig={React.useMemo(
          () => ({
            namespace: `ChatInput`,
            theme: LEXICAL_CHAT_INPUT_THEME,
            nodes: [PromptMentionNode],
            onError: (error: unknown) => {
              logger.error(`[LexicalChatInput] editor error:`, error);
            },
          }),
          [],
        )}
      >
        <div className={`relative`}>
          <LexicalRichTextPlugin contentEditable={contentEditable} ErrorBoundary={PassthroughErrorBoundary} />
          <LexicalHistoryPlugin />
          <EditorChangeLogger onChange={onChange} taskId={taskId} />
          <SubmitOnEnterPlugin
            onSubmit={submitAndRefocus}
            disabled={disabled}
            submitDisabled={submitDisabled}
            allowSubmitWhenEmpty={allowSubmitWhenEmpty}
            enterSubmits={enterSubmits}
          />
          <PromptHistoryNavigationPlugin entries={promptHistory} disabled={disabled} />
          <EditableSyncPlugin editable={!disabled} />
          <E2ELexicalBridgePlugin inputTestId={inputTestId} />
          <EditorApiPlugin editorApiRef={editorApiRef} />
          <CjkCommaSlashPlugin disabled={disabled} />
          <PasteCapturePlugin disabled={disabled} onPaste={onPaste} />
        </div>
        <SlashPanel
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          provider={activeProvider}
          container={triggerPanelContainer}
          disabled={disabled}
          excludedCommandNames={excludedSlashCommandNames}
          appCommands={appSlashCommands}
        />
        {enableMentionPanel
          ? (
            <MentionSelector
              workspacePath={workspacePath}
              workspaceIdentity={workspaceIdentity}
              sessionId={taskId}
              provider={activeProvider}
              container={triggerPanelContainer}
              disabled={disabled}
              onWhiteboardMentionSelected={onWhiteboardMentionSelected}
            />
          )
          : null}
      </LexicalComposer>
    </div>
  );
}

/** TYe → PassthroughErrorBoundary（js 66808） */
function PassthroughErrorBoundary({ children }: { children?: React.ReactNode }): React.ReactElement {
  return <>{children}</>;
}

/* ============================================================================
 * [B10] js 66811–67276 —— ComposerInput 根组件 + 动作菜单 + 文件拖拽
 * ========================================================================== */

/** YV → applyWorkspaceFileMentionDrop（js 66811）。A1-R12 补 export：Home insertAddToChatPayload
 *  declare（90348/90735 消费面）改指本函数，一符一家。型缝：inputApiRef 宽化为结构最小面
 *  （bundle 66811 体内仅消费 appendFileMention/focus），Home Ce=ComposerInputApi 面可赋。 */
export function applyWorkspaceFileMentionDrop(args: {
  inputApiRef: { current: { appendFileMention(label: string, filePath: string, markdown: string, data: Record<string, unknown> | undefined): void; focus(): void } | null };
  currentMarkdown: string;
  payload: WorkspaceFileDragPayload;
  workspacePath: string | undefined; // 〔A1-R137〕面级联
  workspaceIdentity?: string | null;
  onTextChange: (text: string) => void;
}): string {
  const mention = buildWorkspaceFileMentionPayload(args.payload, args.workspacePath, args.workspaceIdentity);
  const separator = args.currentMarkdown.length > 0 && !/\s$/.test(args.currentMarkdown) ? ` ` : ``;
  const nextMarkdown = `${args.currentMarkdown}${separator}${mention.markdown} `;
  return (
    args.onTextChange(nextMarkdown),
    args.inputApiRef.current?.appendFileMention(args.payload.name, mention.value, mention.markdown, mention.data),
    args.inputApiRef.current?.focus(),
    nextMarkdown
  );
}

/** EYe → hasExternalFiles（js 66822） */
function hasExternalFiles(dataTransfer: DataTransfer): boolean {
  return (
    Array.from(dataTransfer.types).includes(`Files`) ||
    Array.from(dataTransfer.items ?? []).some((item) => item.kind === `file`)
  );
}

/** XV → useComposerFileDragDetection（js 66828）。A1-R13 补 export：Home useFileDragDetection declare
 *  （66828 同一真身）改指本函数，一符一家；体内消费 tUe/Nj/EYe（R12 叶子化后不变）。 */
export function useComposerFileDragDetection({ enableWorkspaceFileDrop, enableExternalFileDrop }: { enableWorkspaceFileDrop: boolean; enableExternalFileDrop: boolean }): {
  externalFileDragging: boolean;
  internalDragging: boolean;
  setExternalFileDragging: (value: boolean) => void;
  setInternalDragging: (value: boolean) => void;
  setWorkspaceFileDragging: (value: boolean) => void;
  workspaceFileDragging: boolean;
} {
  const [internalDragging, setInternalDragging] = React.useState(false);
  const [workspaceFileDragging, setWorkspaceFileDragging] = React.useState(false);
  const [externalFileDragging, setExternalFileDragging] = React.useState(false);
  const resetTimerRef = React.useRef<number | null>(null);
  return (
    React.useEffect(() => {
      if ((!enableWorkspaceFileDrop && !enableExternalFileDrop) || typeof window > `u`) {
        (setWorkspaceFileDragging(false), setExternalFileDragging(false));
        return;
      }
      const clearResetTimer = () => {
          resetTimerRef.current !== null && (window.clearTimeout(resetTimerRef.current), (resetTimerRef.current = null));
        },
        resetDragState = () => {
          (clearResetTimer(), setWorkspaceFileDragging(false), setExternalFileDragging(false), setInternalDragging(false));
        },
        scheduleReset = () => {
          (clearResetTimer(), (resetTimerRef.current = window.setTimeout(resetDragState, 300)));
        },
        handleWorkspaceDragEvent = (event: Event) => {
          isWorkspaceFileDragEvent(event) && (setWorkspaceFileDragging(event.detail.dragging), event.detail.dragging ? scheduleReset() : resetDragState());
        },
        handleDragOver = (event: DragEvent) => {
          event.dataTransfer &&
            (enableWorkspaceFileDrop && hasWorkspaceFilePayload(event.dataTransfer) ? (setWorkspaceFileDragging(true), scheduleReset()) : enableExternalFileDrop && hasExternalFiles(event.dataTransfer) && (setExternalFileDragging(true), scheduleReset()));
        },
        handleDragLeave = (event: DragEvent) => {
          event.relatedTarget === null && resetDragState();
        };
      return (
        window.addEventListener(WORKSPACE_FILE_DRAG_EVENT_TYPE, handleWorkspaceDragEvent),
        window.addEventListener(`dragover`, handleDragOver),
        window.addEventListener(`dragend`, resetDragState),
        window.addEventListener(`drop`, resetDragState),
        window.addEventListener(`blur`, resetDragState),
        typeof document < `u` && document.addEventListener(`dragleave`, handleDragLeave),
        () => {
          (clearResetTimer(),
            window.removeEventListener(WORKSPACE_FILE_DRAG_EVENT_TYPE, handleWorkspaceDragEvent),
            window.removeEventListener(`dragover`, handleDragOver),
            window.removeEventListener(`dragend`, resetDragState),
            window.removeEventListener(`drop`, resetDragState),
            window.removeEventListener(`blur`, resetDragState),
            typeof document < `u` && document.removeEventListener(`dragleave`, handleDragLeave));
        }
      );
    }, [enableExternalFileDrop, enableWorkspaceFileDrop]),
    {
      externalFileDragging,
      internalDragging,
      setExternalFileDragging,
      setInternalDragging,
      setWorkspaceFileDragging,
      workspaceFileDragging,
    }
  );
}

/** DYe → buildActionMenuShortcuts（js 66887） */
function buildActionMenuShortcuts(args: {
  mentionShortcutTitle: string;
  showMentionAction: boolean;
  showSlashAction: boolean;
  slashShortcutTitle: string;
}): Array<{ title: string; trigger: string }> {
  const shortcuts: Array<{ title: string; trigger: string }> = [];
  return (
    args.showMentionAction && shortcuts.push({ title: args.mentionShortcutTitle, trigger: `@` }),
    args.showSlashAction && shortcuts.push({ title: args.slashShortcutTitle, trigger: `/` }),
    shortcuts
  );
}

/** OYe → onNextFrame（js 66893） */
function onNextFrame(callback: () => void): void {
  if (typeof requestAnimationFrame == `function`) {
    requestAnimationFrame(callback);
    return;
  }
  callback();
}

/** kYe → appendTriggerText（js 66899） */
function appendTriggerText(inputApiRef: { current: ComposerEditorApi | null }, trigger: string): void {
  onNextFrame(() => {
    (inputApiRef.current?.focus(), inputApiRef.current?.appendText(trigger), inputApiRef.current?.focus());
  });
}

/** AYe → preventDefaultOnMouseDown（js 66904） */
const preventDefaultOnMouseDown = (event: React.SyntheticEvent) => {
  event.preventDefault();
};

/** jYe → ComposerActionMenu（js 66907） */
function ComposerActionMenu({
  actionMenuTitle,
  attachmentAction,
  disabled,
  disabledReason,
  inputApiRef,
  mentionShortcutTitle,
  showMentionAction,
  showSlashAction,
  slashShortcutTitle,
}: {
  actionMenuTitle: string;
  attachmentAction?: { label: string; testId?: string; menuItemTestId?: string; onSelect: () => void } | null;
  disabled: boolean;
  disabledReason?: string;
  inputApiRef: { current: ComposerEditorApi | null };
  mentionShortcutTitle: string;
  showMentionAction: boolean;
  showSlashAction: boolean;
  slashShortcutTitle: string;
}): React.ReactElement {
  const suppressRefocusRef = React.useRef(false);
  const shortcuts = buildActionMenuShortcuts({
      mentionShortcutTitle,
      showMentionAction,
      showSlashAction,
      slashShortcutTitle,
    }),
    insertTrigger = (trigger: string) => {
      ((suppressRefocusRef.current = true), appendTriggerText(inputApiRef, trigger));
    };
  return (
    <DropdownMenuRoot>
      <TooltipRoot title={disabledReason ?? actionMenuTitle}>
        {/* asChild 经 spread 透传：UsageStatsUiParts radix TooltipTrigger 面未声明 asChild（内部 Slot 支持） */}
        <TooltipTrigger {...{ asChild: true }}>
          <Button
            type={`button`}
            variant={`ghost`}
            size={`icon-md`}
            className={`gap-1 rounded-lg text-ui-base`}
            onMouseDown={preventDefaultOnMouseDown}
            aria-label={actionMenuTitle}
            data-testid={attachmentAction?.testId}
            disabled={disabled}
            title={disabledReason}
          >
            <PlusIcon className={`size-4`} />
            <span className={`sr-only`}>{actionMenuTitle}</span>
          </Button>
        </TooltipTrigger>
      </TooltipRoot>
      <DropdownMenuContent
        align={`start`}
        side={`top`}
        className={`w-52`}
        onCloseAutoFocus={(event: Event) => {
          suppressRefocusRef.current &&= (event.preventDefault(), false);
        }}
      >
        {attachmentAction
          ? (
            <DropdownMenuItem
              data-testid={attachmentAction.menuItemTestId}
              disabled={disabled}
              title={disabledReason}
              onSelect={() => {
                disabled || attachmentAction.onSelect();
              }}
            >
              <PaperclipIcon className={`size-4`} />
              <span>{attachmentAction.label}</span>
            </DropdownMenuItem>
          )
          : null}
        {shortcuts.map((shortcut) =>
          (
            <DropdownMenuItem
              key={shortcut.trigger}
              data-composer-trigger={shortcut.trigger}
              disabled={disabled}
              title={disabledReason}
              onSelect={() => {
                disabled || insertTrigger(shortcut.trigger);
              }}
            >
              {shortcut.trigger === `@`
                ? <AtSignIcon className={`size-4`} />
                : <SlashIcon className={`size-4`} />}
              <span>{shortcut.title}</span>
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

/** MYe → runOnNextFrame（js 67000） */
function runOnNextFrame(callback: () => void): void {
  if (typeof requestAnimationFrame == `function`) {
    requestAnimationFrame(callback);
    return;
  }
  callback();
}

/** ZV → ComposerInput（js 67007 / jsx 59468；F08 根组件） */
export function ComposerInput({
  workspacePath,
  workspaceIdentity,
  taskId,
  initialValue,
  syncInitialValueOnMount = true,
  placeholder,
  disabled = false,
  disabledReason,
  submitting = false,
  submitDisabled = false,
  allowSubmitWhenEmpty = false,
  enterSubmits = true,
  submitLabel,
  cancelLabel,
  showMentionButton = false,
  showSlashButton = false,
  enableWorkspaceFileDrop = false,
  enableExternalFileDrop = false,
  isDraggingOver = false,
  dragAttachmentHint,
  topContent,
  leadingActions,
  attachmentAction,
  betweenCancelAndSubmitAction,
  submitControl,
  inputTestId,
  submitTestId,
  cancelTestId,
  inputApiRef,
  onModeSwitchContainerChange,
  triggerPanelContainer,
  promptHistory,
  className,
  shellClassName,
  avoidIosInputFocusZoom = false,
  compactPlaceholder = false,
  onChange,
  onSubmit,
  onCancel,
  onFocus,
  onWhiteboardMentionSelected,
  onPaste,
  onDragOver,
  onDragLeave,
  onDrop,
  excludedSlashCommandNames,
  appSlashCommands,
  enableMentionPanel,
}: {
  workspacePath: string | undefined; // 〔A1-R137〕面校准：束 3535334 内联编辑消费面 workspacePath: t.workspacePath 直传（RowRenderContext.workspacePath? 带 undefined）；级联本族 17 面，型缝仅编译期
  workspaceIdentity?: string | null;
  taskId?: string | null;
  initialValue?: string;
  syncInitialValueOnMount?: boolean;
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: string;
  submitting?: boolean;
  submitDisabled?: boolean;
  allowSubmitWhenEmpty?: boolean;
  enterSubmits?: boolean;
  submitLabel: string;
  cancelLabel?: string;
  showMentionButton?: boolean;
  showSlashButton?: boolean;
  enableWorkspaceFileDrop?: boolean;
  enableExternalFileDrop?: boolean;
  isDraggingOver?: boolean;
  dragAttachmentHint?: string;
  topContent?: React.ReactNode;
  leadingActions?: React.ReactNode;
  attachmentAction?: { label: string; testId?: string; menuItemTestId?: string; onSelect: () => void } | null;
  betweenCancelAndSubmitAction?: React.ReactNode;
  submitControl?: React.ReactNode;
  inputTestId?: string;
  submitTestId?: string;
  cancelTestId?: string;
  inputApiRef?: { current: ComposerEditorApi | null } | null;
  onModeSwitchContainerChange?: React.Ref<HTMLSpanElement>;
  triggerPanelContainer?: HTMLElement | null;
  promptHistory?: string[];
  className?: string;
  shellClassName?: string;
  avoidIosInputFocusZoom?: boolean;
  compactPlaceholder?: boolean;
  onChange?: (text: string) => void;
  onSubmit: (text: string) => unknown;
  onCancel?: () => void;
  onFocus?: React.FocusEventHandler;
  onWhiteboardMentionSelected?: (mention: unknown) => void;
  onPaste?: (event: ClipboardEvent) => void;
  onDragOver?: React.DragEventHandler<HTMLDivElement>;
  onDragLeave?: React.DragEventHandler<HTMLDivElement>;
  onDrop?: React.DragEventHandler<HTMLDivElement>;
  excludedSlashCommandNames?: string[];
  appSlashCommands?: AppSlashCommand[];
  enableMentionPanel?: boolean;
}): React.ReactElement {
  const { intl } = useIntlContext();
  const fallbackInputApiRef = React.useRef<ComposerEditorApi | null>(null);
  const effectiveInputApiRef = inputApiRef ?? fallbackInputApiRef;
  const [fallbackTriggerContainer, setFallbackTriggerContainer] = React.useState<HTMLElement | null>(null);
  const effectiveTriggerContainer = triggerPanelContainer ?? fallbackTriggerContainer;
  const currentMarkdownRef = React.useRef(initialValue ?? ``);
  const didSyncInitialValueRef = React.useRef(false);
  const {
    externalFileDragging,
    internalDragging,
    setExternalFileDragging,
    setInternalDragging,
    setWorkspaceFileDragging,
    workspaceFileDragging,
  } = useComposerFileDragDetection({ enableExternalFileDrop, enableWorkspaceFileDrop });
  const insertMentionLabel = intl.formatMessage({ id: `chat.composer.insertMentionShortcut` });
  const insertSlashLabel = intl.formatMessage({ id: `chat.composer.insertSlashShortcut` });
  const actionMenuLabel = intl.formatMessage({ id: `chat.composer.actionMenu` });
  const workspaceFileDragHint = intl.formatMessage({ id: `chat.composer.workspaceFileDragHint` });
  const showActionMenu = !!attachmentAction || showMentionButton || showSlashButton;
  React.useEffect(() => {
    syncInitialValueOnMount &&
      initialValue !== void 0 &&
      (didSyncInitialValueRef.current ||
        ((didSyncInitialValueRef.current = true),
        (currentMarkdownRef.current = initialValue),
        runOnNextFrame(() => {
          effectiveInputApiRef.current?.getMarkdown() !== initialValue && effectiveInputApiRef.current?.setText(initialValue);
        })));
  }, [initialValue, effectiveInputApiRef, syncInitialValueOnMount]);
  const handleTextChange = React.useCallback(
      (text: string) => {
        ((currentMarkdownRef.current = text), onChange?.(text));
      },
      [onChange],
    ),
    handleFormSubmit = React.useCallback(
      (event: React.FormEvent) => {
        (event.preventDefault(), onSubmit(effectiveInputApiRef.current?.getMarkdown() ?? currentMarkdownRef.current));
      },
      [onSubmit, effectiveInputApiRef],
    ),
    handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        event.key !== `Escape` || !onCancel || submitting || (event.preventDefault(), onCancel());
      },
      [onCancel, submitting],
    ),
    handleSubmitText = React.useCallback((text: string) => onSubmit(text), [onSubmit]),
    handleDragOver = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        if (enableWorkspaceFileDrop && hasWorkspaceFilePayload(event.dataTransfer)) {
          (event.preventDefault(), (event.dataTransfer.dropEffect = `copy`), setWorkspaceFileDragging(true), setInternalDragging(true));
          return;
        }
        (enableExternalFileDrop && Array.from(event.dataTransfer.types).includes(`Files`) && setExternalFileDragging(true), onDragOver?.(event));
      },
      [enableExternalFileDrop, enableWorkspaceFileDrop, onDragOver],
    ),
    handleDragLeave = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        const relatedTarget = event.relatedTarget;
        (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) || (setInternalDragging(false), onDragLeave?.(event));
      },
      [onDragLeave],
    ),
    handleDrop = React.useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        const workspacePayload = enableWorkspaceFileDrop ? readWorkspaceFilePayload(event.dataTransfer) : null;
        if (workspacePayload) {
          (event.preventDefault(),
            event.stopPropagation(),
            setInternalDragging(false),
            setWorkspaceFileDragging(false),
            applyWorkspaceFileMentionDrop({
              inputApiRef: effectiveInputApiRef,
              currentMarkdown: effectiveInputApiRef.current?.getMarkdown() ?? currentMarkdownRef.current,
              payload: workspacePayload,
              workspacePath,
              workspaceIdentity,
              onTextChange: handleTextChange,
            }));
          return;
        }
        (setInternalDragging(false), setWorkspaceFileDragging(false), setExternalFileDragging(false), onDrop?.(event));
      },
      [enableWorkspaceFileDrop, handleTextChange, onDrop, effectiveInputApiRef, workspaceIdentity, workspacePath],
    ),
    isInternalDragActive = workspaceFileDragging || internalDragging,
    isExternalDragActive = externalFileDragging || isDraggingOver,
    dragHint = isInternalDragActive ? workspaceFileDragHint : isExternalDragActive ? dragAttachmentHint : void 0;
  return (
    <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className={cn(`relative`, className)}>
      {triggerPanelContainer ? null : <div ref={setFallbackTriggerContainer} className={`absolute inset-x-0 bottom-full z-20`} />}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          `relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-input-border bg-input p-3 transition-colors hover:border-input-border-hover focus-within:!border-input-border-focused focus-within:bg-input-focused`,
          (isInternalDragActive || isExternalDragActive) && `border-brand bg-input-focused ring-1 ring-brand/30`,
          shellClassName,
        )}
      >
        {dragHint
          ? (
            <div className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-accent/55 backdrop-blur-sm`}>
              <div className={`flex items-center gap-2 rounded-full border border-border bg-accent px-4 py-2 text-ui-base text-foreground shadow-sm`}>
                <HandIcon className={`size-4 text-foreground`} />
                <span>{dragHint}</span>
              </div>
            </div>
          )
          : null}
        {topContent}
        <LexicalChatInput
          placeholder={placeholder}
          disabled={disabled}
          submitDisabled={submitDisabled}
          allowSubmitWhenEmpty={allowSubmitWhenEmpty}
          enterSubmits={enterSubmits}
          onSubmit={handleSubmitText}
          onChange={handleTextChange}
          onFocus={onFocus}
          triggerPanelContainer={effectiveTriggerContainer}
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          taskId={taskId}
          inputTestId={inputTestId}
          editorApiRef={effectiveInputApiRef}
          promptHistory={promptHistory}
          avoidIosInputFocusZoom={avoidIosInputFocusZoom}
          compactPlaceholder={compactPlaceholder}
          onWhiteboardMentionSelected={onWhiteboardMentionSelected}
          onPaste={onPaste}
          excludedSlashCommandNames={excludedSlashCommandNames}
          appSlashCommands={appSlashCommands}
          enableMentionPanel={enableMentionPanel}
        />
        <div className={`flex items-end gap-3`}>
          <div className={`flex min-w-0 flex-1 items-center gap-1`}>
            {showActionMenu
              ? (
                <ComposerActionMenu
                  actionMenuTitle={actionMenuLabel}
                  attachmentAction={attachmentAction}
                  disabled={disabled}
                  disabledReason={disabledReason}
                  inputApiRef={effectiveInputApiRef}
                  mentionShortcutTitle={insertMentionLabel}
                  showMentionAction={showMentionButton}
                  showSlashAction={showSlashButton}
                  slashShortcutTitle={insertSlashLabel}
                />
              )
              : null}
            {leadingActions}
            {onModeSwitchContainerChange
              ? <span ref={onModeSwitchContainerChange} className={`flex shrink-0 items-center`} />
              : null}
          </div>
          <div className={`flex items-center gap-1.5`}>
            {onCancel && cancelLabel
              ? (
                <TooltipRoot title={cancelLabel} shortcut={`Esc`}>
                  <Button
                    type={`button`}
                    variant={`ghost`}
                    size={`icon-lg`}
                    onClick={onCancel}
                    disabled={submitting}
                    data-testid={cancelTestId}
                    aria-label={cancelLabel}
                  >
                    <CloseIcon className={`size-4`} />
                    <span className={`sr-only`}>{cancelLabel}</span>
                  </Button>
                </TooltipRoot>
              )
              : null}
            {betweenCancelAndSubmitAction}
            {submitControl ??
              (
                <TooltipRoot title={submitLabel} shortcut={enterSubmits ? `Enter` : void 0}>
                  <Button
                    type={`submit`}
                    size={`icon-md`}
                    disabled={submitDisabled}
                    data-testid={submitTestId ?? `chat-send-button`}
                    aria-label={submitLabel}
                    className={`gap-1 rounded-lg bg-brand text-ui-base text-foreground-inverse hover:bg-brand/80`}
                  >
                    {submitting
                      ? <Spinner className={`size-4`} />
                      : <ArrowUpIcon className={`size-4`} />}
                    <span className={`sr-only`}>{submitLabel}</span>
                  </Button>
                </TooltipRoot>
              )}
          </div>
        </div>
      </div>
    </form>
  );
}

/* ============================================================================
 * [B11] js 67277–67477 —— 附件模型与上传管线（纯函数域）
 * ========================================================================== */

/** 附件本地暂存形状（语义归纳；中把握度） */
interface ComposerAttachment {
  id: string;
  file?: File;
  filename: string;
  localPath?: string;
  mimeType: string;
  objectUrl?: string;
  sizeBytes: number;
  charCount?: number;
  lineCount?: number;
  sourceKind?: `clipboard-text`;
}

/** NYe → NANOID_ALPHABET（js 67277） */
const NANOID_ALPHABET = `useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict`;

/** QV → nanoid（js 67278） */
export const nanoid = (size = 21): string => {
  let id = ``;
  const bytes = crypto.getRandomValues(new Uint8Array((size |= 0)));
  for (; size--;) id += NANOID_ALPHABET[bytes[size] & 63];
  return id;
};

/** PYe → LARGE_PASTED_TEXT_THRESHOLD（js 67282） */
const LARGE_PASTED_TEXT_THRESHOLD = 5 * 1024;
/** $V → MAX_INLINE_IMAGE_BYTES（js 67283） */
const MAX_INLINE_IMAGE_BYTES = 20 * 1024 * 1024;
/** eH → TEXT_ATTACHMENT_PREVIEW_LIMIT（js 67284） */
const TEXT_ATTACHMENT_PREVIEW_LIMIT = 64 * 1024;

/** FYe → OversizedInlineImageAttachmentError（js 67285） */
class OversizedInlineImageAttachmentError extends Error {
  filename: string;
  maxSizeBytes: number;
  sizeBytes: number;
  constructor(args: { filename: string; maxSizeBytes: number; sizeBytes: number }) {
    (super(`oversized-inline-image-attachment`),
      (this.name = `OversizedInlineImageAttachmentError`),
      (this.filename = args.filename),
      (this.maxSizeBytes = args.maxSizeBytes),
      (this.sizeBytes = args.sizeBytes));
  }
}

/** IYe → readFileAsDataUrl（js 67299） */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    ((reader.onload = () => {
      if (typeof reader.result == `string`) {
        resolve(reader.result);
        return;
      }
      reject(Error(`读取附件失败`));
    }),
      (reader.onerror = () => {
        reject(reader.error ?? Error(`读取附件失败`));
      }),
      reader.readAsDataURL(file));
  });
}

/** LYe → createFileAttachment（js 67315） */
function createFileAttachment(file: File, localPath?: string): ComposerAttachment {
  return {
    id: nanoid(),
    file,
    filename: file.name,
    localPath,
    mimeType: file.type || guessMimeType(file.name),
    objectUrl: URL.createObjectURL(file),
    sizeBytes: file.size,
  };
}

/** RYe → createLocalPathAttachment（js 67324） */
function createLocalPathAttachment(path: string): ComposerAttachment {
  const filename = basenameOfPath(path);
  return { id: nanoid(), filename, localPath: path, mimeType: guessMimeType(filename), sizeBytes: 0 };
}

/** zYe → createClipboardTextAttachment（js 67328） */
function createClipboardTextAttachment(text: string, meta: { filename: string; localPath?: string; mimeType: string; sizeBytes: number }): ComposerAttachment {
  return {
    id: nanoid(),
    filename: meta.filename,
    localPath: meta.localPath,
    mimeType: meta.mimeType,
    sizeBytes: meta.sizeBytes,
    charCount: text.length,
    lineCount: countLines(text),
    sourceKind: `clipboard-text`,
  };
}

/** BYe → isLargePastedText（js 67338） */
function isLargePastedText(text: string): boolean {
  return text.length >= LARGE_PASTED_TEXT_THRESHOLD;
}

/** VYe → SPREADSHEET_HTML_PATTERN（js 67340） */
const SPREADSHEET_HTML_PATTERN =
  /(?:<table\b|urn:schemas-microsoft-com:office:excel|\bExcel\.Sheet\b|\bMicrosoft\s+Excel\b|\bmso-(?:number-format|displayed-decimal-separator)\b)/iu;

/** HYe → prefersSpreadsheetText（js 67342） */
function prefersSpreadsheetText(text: string, html: string): boolean {
  return text.length === 0 ? false : text.includes(`	`) || SPREADSHEET_HTML_PATTERN.test(html);
}

/** UYe → pastedTextFilename（js 67346） */
function pastedTextFilename(date = new Date()): string {
  return formatPastedTextFilename(date);
}

/** WYe → countLines（js 67349） */
function countLines(text: string): number {
  if (text.length === 0) return 0;
  let lines = 1;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (
      char ===
      `
`
    ) {
      lines += 1;
      continue;
    }
    char === `\r` &&
      ((lines += 1),
      text[index + 1] ===
        `
` && (index += 1));
  }
  return lines;
}

/** tH → revokeAttachmentObjectUrl（js 67371） */
function revokeAttachmentObjectUrl(attachment: ComposerAttachment): void {
  attachment.objectUrl && URL.revokeObjectURL(attachment.objectUrl);
}

/** 附件出站载荷形状（语义归纳；中把握度） */
type ComposerAttachmentPayload =
  | { kind: `image`; filename: string; localPath?: string; mimeType: string; dataBase64?: string; sizeBytes: number }
  | { kind: `file`; filename: string; localPath?: string; mimeType: string; sourceKind?: `clipboard-text`; sizeBytes: number; textContent?: string };

/** GYe → resolveAttachmentPayload（js 67374） */
async function resolveAttachmentPayload(attachment: ComposerAttachment): Promise<ComposerAttachmentPayload> {
  const mimeType = attachment.mimeType || guessMimeType(attachment.filename);
  if (mimeType.startsWith(`image/`)) {
    if (!attachment.localPath && attachment.sizeBytes > MAX_INLINE_IMAGE_BYTES)
      throw new OversizedInlineImageAttachmentError({ filename: attachment.filename, maxSizeBytes: MAX_INLINE_IMAGE_BYTES, sizeBytes: attachment.sizeBytes });
    if (attachment.localPath && (!attachment.file || attachment.sizeBytes > MAX_INLINE_IMAGE_BYTES))
      return {
        kind: `image`,
        filename: attachment.filename,
        localPath: attachment.localPath,
        mimeType,
        sizeBytes: attachment.sizeBytes,
      };
    const dataBase64 = await readAttachmentBase64(attachment);
    return {
      kind: `image`,
      filename: attachment.filename,
      mimeType,
      dataBase64,
      ...(attachment.localPath ? { localPath: attachment.localPath } : {}),
      sizeBytes: attachment.sizeBytes,
    };
  }
  if (attachment.localPath)
    return {
      kind: `file`,
      filename: attachment.filename,
      localPath: attachment.localPath,
      mimeType,
      ...(attachment.sourceKind === `clipboard-text` ? { sourceKind: `clipboard-text` } : {}),
      sizeBytes: attachment.sizeBytes,
    };
  const textContent = attachment.file && isTextLikeAttachment(attachment) ? await readTextFilePreview(attachment.file) : void 0;
  return {
    kind: `file`,
    filename: attachment.filename,
    mimeType,
    sizeBytes: attachment.sizeBytes,
    ...(textContent === void 0 ? {} : { textContent }),
  };
}

/** KYe → readAttachmentBase64（js 67417） */
async function readAttachmentBase64(attachment: ComposerAttachment): Promise<string> {
  if (!attachment.file) throw Error(`附件缺少可读取内容`);
  const dataUrl = await readFileAsDataUrl(attachment.file);
  const commaIndex = dataUrl.indexOf(`,`);
  if (commaIndex === -1) throw Error(`附件数据格式不正确`);
  return dataUrl.slice(commaIndex + 1);
}

/** nH → isImageAttachment（js 67424） */
function isImageAttachment(attachment: ComposerAttachment): boolean {
  return attachment.mimeType.startsWith(`image/`);
}

/** qYe → isTextLikeAttachment（js 67427） */
function isTextLikeAttachment(attachment: ComposerAttachment): boolean {
  return (attachment.mimeType || guessMimeType(attachment.filename)).startsWith(`text/`)
    ? true
    : /\.(cjs|conf|cpp|cs|css|csv|go|h|hpp|html|ini|java|js|json|jsx|log|md|mjs|py|rs|sh|sql|toml|ts|tsx|txt|xml|yaml|yml)$/iu.test(
        attachment.filename,
      );
}

/** JYe → readTextFilePreview（js 67434） */
async function readTextFilePreview(file: File): Promise<string> {
  const text = await file.text();
  return text.length > TEXT_ATTACHMENT_PREVIEW_LIMIT ? `${text.slice(0, TEXT_ATTACHMENT_PREVIEW_LIMIT)}\n\n[内容过长，已截断]` : text;
}

/** rH → guessMimeType（js 67439） */
function guessMimeType(filename: string): string {
  const extension = filename.split(`.`).pop()?.toLocaleLowerCase() ?? ``;
  return extension === `md`
    ? `text/markdown`
    : extension === `json`
      ? `application/json`
      : extension === `csv`
        ? `text/csv`
        : extension === `txt` || extension === `log`
          ? `text/plain`
          : extension === `png`
            ? `image/png`
            : extension === `jpg` || extension === `jpeg`
              ? `image/jpeg`
              : extension === `gif`
                ? `image/gif`
                : extension === `webp`
                  ? `image/webp`
                  : extension === `svg`
                    ? `image/svg+xml`
                    : extension === `pdf`
                      ? `application/pdf`
                      : `application/octet-stream`;
}

/** YYe → basenameOfPath（js 67466） */
function basenameOfPath(path: string): string {
  return path.split(/[\\/]/u).filter(Boolean).pop() ?? path;
}

/** XYe → formatPastedTextFilename（js 67469） */
function formatPastedTextFilename(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, `0`);
  return `pasted-text-${[date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(``)}-${[pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(``)}.txt`;
}

/** ZYe → resolveComposerPlaceholderKey（js 67473） */
function resolveComposerPlaceholderKey(args: { compactNewTask?: boolean; hasHistoryMessages: boolean; isTaskProcessing: boolean }): string {
  const { compactNewTask = false, hasHistoryMessages, isTaskProcessing } = args;
  return hasHistoryMessages
    ? isTaskProcessing
      ? `chat.placeholder.followUpQueue`
      : `chat.placeholder.followUpAsk`
    : compactNewTask
      ? `chat.placeholder.newTaskMobile`
      : `chat.placeholder.newTask`;
}

/* ============================================================================
 * [B12] js 67480–67600 —— 提示词历史持久化 / 聚焦策略 / 草稿域
 * ========================================================================== */

/** QYe → PROMPT_HISTORY_STORAGE_PREFIX（js 67480） */
const PROMPT_HISTORY_STORAGE_PREFIX = `zcode-chat-prompt-history:`;

/** iH → safeLocalStorage（js 67481） */
function safeLocalStorage(): Storage | null {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** aH → promptHistoryStorageKey（js 67489） */
function promptHistoryStorageKey(scope: string): string {
  return `${PROMPT_HISTORY_STORAGE_PREFIX}${scope}`;
}

/** oH → sanitizePromptHistory（js 67492） */
function sanitizePromptHistory(entries: unknown[]): string[] {
  return entries
    .filter((entry): entry is string => typeof entry == `string`)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .slice(-30);
}

/** sH → loadPromptHistory（js 67499） */
function loadPromptHistory(scope: string, storage: Storage | null = safeLocalStorage()): string[] {
  const raw = storage?.getItem(promptHistoryStorageKey(scope));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sanitizePromptHistory(parsed) : [];
  } catch {
    return [];
  }
}

/** cH → savePromptHistory（js 67509） */
function savePromptHistory(scope: string, history: string[], storage: Storage | null = safeLocalStorage()): void {
  const sanitized = sanitizePromptHistory(history);
  storage?.setItem(promptHistoryStorageKey(scope), JSON.stringify(sanitized));
}

/** lH → resolveFocusStrategy（js 67514） */
function resolveFocusStrategy({ autoFocusEnabled, disabled, isMobileViewport }: { autoFocusEnabled: boolean; disabled: boolean; isMobileViewport: boolean }): `skip` | `defer` | `focus-now` {
  return !autoFocusEnabled || isMobileViewport ? `skip` : disabled ? `defer` : `focus-now`;
}

/** $Ye → DRAFT_STORAGE_PREFIX（js 67518） */
const DRAFT_STORAGE_PREFIX = `zcode-v4-composer-drafts:v1:`;
/** eXe → DRAFT_SCOPE_ID（js 67519） */
const DRAFT_SCOPE_ID = `__draft__`;
/** uH → MAX_DRAFT_SCOPES（js 67520） */
const MAX_DRAFT_SCOPES = 50;

/** dH → safeDraftStorage（js 67521） */
function safeDraftStorage(): Storage | null {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** fH → draftStorageKey（js 67527） */
function draftStorageKey(workspacePath: string, workspaceIdentity?: string | null): string {
  const scopeKey = workspaceIdentity?.trim() || workspacePath;
  return `${DRAFT_STORAGE_PREFIX}${encodeURIComponent(scopeKey)}`;
}

/** 草稿条目/仓形状（语义归纳；中把握度） */
interface DraftScopeEntry {
  text: string;
  editorStateJson?: unknown;
  updatedAt?: number;
}
interface DraftStore {
  version: number;
  scopes: Record<string, DraftScopeEntry>;
}

/** pH → parseDraftStore（js 67532） */
function parseDraftStore(storageKey: string): DraftStore {
  const raw = safeDraftStorage()?.getItem(storageKey);
  if (!raw) return { version: 1, scopes: {} };
  try {
    const parsed = JSON.parse(raw);
    return parsed.version !== 1 || typeof parsed.scopes != `object` || parsed.scopes === null
      ? { version: 1, scopes: {} }
      : { version: 1, scopes: parsed.scopes };
  } catch {
    return { version: 1, scopes: {} };
  }
}

/** mH → persistDraftStore（js 67542） */
function persistDraftStore(storageKey: string, store: DraftStore): void {
  const storage = safeDraftStorage();
  if (storage)
    try {
      if (Object.keys(store.scopes).length === 0) {
        storage.removeItem(storageKey);
        return;
      }
      storage.setItem(storageKey, JSON.stringify(store));
    } catch (error) {
      logger.warn(`[v4-composer-draft] 草稿持久化写入失败`, {
        error: error instanceof Error ? error.message : String(error),
        key: storageKey,
      });
    }
}

/** tXe → pruneDraftScopes（js 67559） */
function pruneDraftScopes(store: DraftStore): void {
  const entries = Object.entries(store.scopes);
  entries.length <= MAX_DRAFT_SCOPES ||
    entries
      .sort((a, b) => a[1].updatedAt! - b[1].updatedAt!)
      .slice(0, entries.length - MAX_DRAFT_SCOPES)
      .forEach(([scopeId]) => {
        delete store.scopes[scopeId];
      });
}

/** nXe → readDraftScope（js 67568） */
function readDraftScope(workspacePath: string, workspaceIdentity: string | null | undefined, scopeId: string): DraftScopeEntry | null {
  const scope = parseDraftStore(draftStorageKey(workspacePath, workspaceIdentity)).scopes[scopeId];
  return !scope || typeof scope.text != `string` ? null : scope;
}

/** hH → writeDraftScope（js 67574） */
function writeDraftScope(workspacePath: string, workspaceIdentity: string | null | undefined, scopeId: string, draft: DraftScopeEntry): void {
  const storageKey = draftStorageKey(workspacePath, workspaceIdentity);
  const store = parseDraftStore(storageKey);
  (!draft.text.trim() && !draft.editorStateJson
    ? delete store.scopes[scopeId]
    : ((store.scopes[scopeId] = { ...draft, updatedAt: Date.now() }), pruneDraftScopes(store)),
    persistDraftStore(storageKey, store));
}

/** gH → deleteDraftScope（js 67581） */
function deleteDraftScope(workspacePath: string, workspaceIdentity: string | null | undefined, scopeId: string): void {
  const storageKey = draftStorageKey(workspacePath, workspaceIdentity);
  const store = parseDraftStore(storageKey);
  scopeId in store.scopes && (delete store.scopes[scopeId], persistDraftStore(storageKey, store));
}

/** 草稿迁移挂起形状（语义归纳；中把握度） */
interface PendingDraftTransfer {
  sourceWorkspacePath: string;
  sourceWorkspaceIdentity?: string | null;
  targetWorkspacePath: string;
  targetWorkspaceIdentity?: string | null;
}

/** _H → pendingDraftTransfer（js 67587） */
let pendingDraftTransfer: PendingDraftTransfer | null = null;

/** vH → draftScopeWorkspaceKey（js 67588） */
function draftScopeWorkspaceKey(workspacePath: string, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath;
}

/** rXe → setPendingDraftTransfer（js 67591） */
function setPendingDraftTransfer(transfer: PendingDraftTransfer | null): void {
  pendingDraftTransfer = transfer;
}

/** iXe → consumePendingDraftTransfer（js 67593） */
function consumePendingDraftTransfer(candidate: PendingDraftTransfer): boolean {
  if (!pendingDraftTransfer) return false;
  const matches =
    draftScopeWorkspaceKey(pendingDraftTransfer.sourceWorkspacePath, pendingDraftTransfer.sourceWorkspaceIdentity) ===
      draftScopeWorkspaceKey(candidate.sourceWorkspacePath, candidate.sourceWorkspaceIdentity) &&
    draftScopeWorkspaceKey(pendingDraftTransfer.targetWorkspacePath, pendingDraftTransfer.targetWorkspaceIdentity) ===
      draftScopeWorkspaceKey(candidate.targetWorkspacePath, candidate.targetWorkspaceIdentity);
  return (matches && (pendingDraftTransfer = null), matches);
}

/* ============================================================================
 * [B13] js 67601–68290 —— 附件 store + useComposerAttachments（mXe 域）
 * ========================================================================== */

/** 附件上传/暂存形状（语义归纳；中把握度） */
interface AttachmentRef {
  ref: string;
  fileName: string;
  mime: string;
  bytes: number;
}
type ComposerUploadStatus = `queued` | `waitingSession` | `uploading` | `committing` | `ready` | `failed`;
interface ComposerAttachmentRecord extends ComposerAttachment {
  referenceOwnership: `composer` | `session`;
  operationId: string;
  uploadStatus: ComposerUploadStatus;
  uploadProgress: number;
  uploadError?: string;
  uploadErrorKind?: `transient` | `permanent` | `runtimeRestarted`;
  attachmentRef?: AttachmentRef;
  autoRetryCount: number;
  staged: boolean;
  adopted: boolean;
  showComplete: boolean;
  localZeroCopy?: boolean;
}
interface AttachmentStoreState {
  scopes: Record<string, ComposerAttachmentRecord[]>;
}
interface AttachmentPutProgress {
  phase: string;
  uploadedBytes: number;
  totalBytes: number;
}
type AttachmentPutFn = (
  args: { sessionId: string; fileName: string; mime: string; dataBase64: string },
  options: { signal: AbortSignal; onProgress(progress: AttachmentPutProgress): void },
) => Promise<{ ref: string }>;

/** yH → useComposerAttachmentStore（js 67602） */
const useComposerAttachmentStore = createStore()<AttachmentStoreState>(() => ({ scopes: {} }));

/** bH → getScopeAttachments（js 67603） */
function getScopeAttachments(scopeKey: string): ComposerAttachmentRecord[] {
  return useComposerAttachmentStore.getState().scopes[scopeKey] ?? [];
}

/** aXe → updateScopeAttachments（js 67606） */
function updateScopeAttachments(scopeKey: string, updater: (list: ComposerAttachmentRecord[]) => ComposerAttachmentRecord[]): void {
  useComposerAttachmentStore.setState((state) => {
    const next = updater(state.scopes[scopeKey] ?? []);
    if (next.length === 0) {
      const { [scopeKey]: _removed, ...rest } = state.scopes;
      return { scopes: rest };
    }
    return { scopes: { ...state.scopes, [scopeKey]: next } };
  });
}

/** oXe → encodeBase64Utf8（js 67616） */
function encodeBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = ``;
  const chunkSize = 32768;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  return btoa(binary);
}

/** sXe → estimateBase64Bytes（js 67623） */
function estimateBase64Bytes(base64: string): number {
  const padding = base64.endsWith(`==`) ? 2 : +!!base64.endsWith(`=`);
  return Math.floor((base64.length * 3) / 4) - padding;
}

/** cXe → putAttachmentContent（js 67627） */
async function putAttachmentContent(
  attachmentPut: AttachmentPutFn,
  sessionId: string,
  payload: ComposerAttachmentPayload,
  options: { signal: AbortSignal; onProgress(progress: AttachmentPutProgress): void },
): Promise<AttachmentRef | null> {
  const fileName = payload.filename;
  const mime = payload.mimeType;
  const bytes = `sizeBytes` in payload && typeof payload.sizeBytes == `number` ? payload.sizeBytes : void 0;
  if (payload.localPath) return { ref: payload.localPath, fileName, mime, bytes: bytes ?? 0 };
  const dataBase64 =
    `dataBase64` in payload && payload.dataBase64
      ? payload.dataBase64
      : `textContent` in payload && payload.textContent !== void 0
        ? encodeBase64Utf8(payload.textContent)
        : null;
  if (dataBase64 === null)
    return (
      logger.warn(`[v4-composer] 附件无内容可发（无 localPath/dataBase64/textContent），已丢弃: ${fileName}`),
      null
    );
  const { ref } = await attachmentPut({ sessionId, fileName, mime, dataBase64 }, options);
  return { ref, fileName, mime, bytes: bytes ?? estimateBase64Bytes(dataBase64) };
}

/** lXe → EMPTY_ATTACHMENTS（js 67646） */
const EMPTY_ATTACHMENTS: ComposerAttachmentRecord[] = [];
/** xH → REMOTE_ATTACHMENT_NOT_STAGED（js 67647） */
const REMOTE_ATTACHMENT_NOT_STAGED = `remoteAttachmentNotStaged`;

/** uXe → selectAttachmentPaths（js 67648） */
async function selectAttachmentPaths(platform: PlatformService): Promise<string[]> {
  return (
    platform.selectFiles ? await platform.selectFiles() : await platform.selectFile!().then((path) => (path ? [path] : []))
  ).filter((path) => path.trim().length > 0);
}

/** dXe → attachmentScopeKey（js 67653） */
function attachmentScopeKey(workspacePath: string, workspaceIdentity: string | null | undefined, scopeId: string): string {
  return `${workspaceIdentity?.trim() || workspacePath}\u0000${scopeId}`;
}

/** SH → isAbortError（js 67656） */
function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === `AbortError`
    ? true
    : error instanceof Error && (error as Error & { cause?: unknown }).cause !== void 0
      ? isAbortError((error as Error & { cause?: unknown }).cause)
      : false;
}

/** fXe → RemoteAttachmentNotStagedError（js 67663） */
class RemoteAttachmentNotStagedError extends Error {
  code = REMOTE_ATTACHMENT_NOT_STAGED;
}

/** pXe → isTransientUploadError（js 67666） */
function isTransientUploadError(error: unknown): boolean {
  if (isAbortError(error) || (error instanceof Error && `code` in error && (error as { code?: string }).code === REMOTE_ATTACHMENT_NOT_STAGED)) return false;
  const message = error instanceof Error ? error.message : String(error);
  return !/(?:payloadTooLarge|invalidBase64|invalidServerProgress|frameTooLarge|permission|EACCES|ENOENT|not found|unsupported|附件缺少|缺少可读取内容|远端附件未完成物化)/iu.test(
    message,
  );
}

/** CH → uploadProgressPercent（js 67673） */
function uploadProgressPercent(uploadedBytes: number, totalBytes: number): number {
  return totalBytes <= 0 ? 0 : Math.min(99, Math.max(0, Math.floor((uploadedBytes / totalBytes) * 99)));
}

/** wH → isRemoteAttachmentTarget（js 67676） */
function isRemoteAttachmentTarget(target: { remoteSessionId?: string | null; workspaceIdentity?: string | null }): boolean {
  return !!(target.remoteSessionId?.trim() || target.workspaceIdentity?.trim());
}

/** mXe 作用域上下文（语义归纳；中把握度） */
interface AttachmentScopeContext {
  sessionId: string | null;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  attachmentPut: AttachmentPutFn;
  transferService: PromptAttachmentTransferService;
}

/** mXe → useComposerAttachments（js 67679） */
function useComposerAttachments(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  scopeId: string;
  attachmentSessionId?: string | null;
  attachmentPut: AttachmentPutFn;
  onRuntimeRestart?: (handler: () => void) => (() => void) | void;
  disabled?: boolean;
}) {
  const {
      workspacePath,
      workspaceIdentity,
      remoteSessionId,
      scopeId,
      attachmentSessionId = null,
      attachmentPut,
      onRuntimeRestart,
      disabled = false,
    } = args,
    platform = usePlatformService(),
    { promptAttachmentTransferService } = useServices() as unknown as { promptAttachmentTransferService: PromptAttachmentTransferService },
    { intl } = useIntlContext(),
    scopeKey = attachmentScopeKey(workspacePath, workspaceIdentity, scopeId),
    scopeContextsRef = React.useRef(new Map<string, AttachmentScopeContext>()),
    uploadQueueRef = React.useRef<Array<{ scopeKey: string; attachmentId: string }>>([]),
    activeUploadsRef = React.useRef(0),
    uploadControllersRef = React.useRef(new Map<string, AbortController>()),
    completeTimersRef = React.useRef(new Map<string, number>()),
    retryTimersRef = React.useRef(new Map<string, number>()),
    pumpQueueRef = React.useRef<() => void>(() => {}),
    attachments = useComposerAttachmentStore((state) => state.scopes[scopeKey] ?? EMPTY_ATTACHMENTS),
    [attachmentError, setAttachmentError] = React.useState<string | null>(null),
    [composerDragKind, setComposerDragKind] = React.useState<`workspace` | `attachment` | null>(null),
    isDraggingOverComposer = composerDragKind !== null,
    attachmentInputRef = React.useRef<HTMLInputElement | null>(null),
    dragDismissTimerRef = React.useRef<number | null>(null);
  scopeContextsRef.current.set(scopeKey, {
    sessionId: attachmentSessionId,
    workspacePath,
    workspaceIdentity,
    remoteSessionId,
    attachmentPut,
    transferService: promptAttachmentTransferService,
  });
  const updateScope = React.useCallback((targetScopeKey: string, updater: (list: ComposerAttachmentRecord[]) => ComposerAttachmentRecord[]) => {
      updateScopeAttachments(targetScopeKey, updater);
    }, []),
    updateAttachment = React.useCallback(
      (targetScopeKey: string, attachmentId: string, updater: (record: ComposerAttachmentRecord) => ComposerAttachmentRecord) => {
        updateScope(targetScopeKey, (list) => list.map((item) => (item.id === attachmentId ? updater(item) : item)));
      },
      [updateScope],
    ),
    enqueueUpload = React.useCallback((targetScopeKey: string, attachmentId: string) => {
      (uploadQueueRef.current.some((entry) => entry.scopeKey === targetScopeKey && entry.attachmentId === attachmentId) ||
        uploadQueueRef.current.push({ scopeKey: targetScopeKey, attachmentId }),
        queueMicrotask(() => pumpQueueRef.current()));
    }, []),
    markUploadComplete = React.useCallback(
      (targetScopeKey: string, attachmentId: string, attachmentRef: AttachmentRef, staged: boolean) => {
        updateAttachment(targetScopeKey, attachmentId, (record) => ({
          ...record,
          uploadStatus: `ready`,
          uploadProgress: 100,
          uploadError: void 0,
          uploadErrorKind: void 0,
          attachmentRef,
          staged,
          showComplete: !record.localZeroCopy,
        }));
        const timerKey = `${targetScopeKey}\u0000${attachmentId}`;
        const existingTimer = completeTimersRef.current.get(timerKey);
        existingTimer !== void 0 && window.clearTimeout(existingTimer);
        const timer = window.setTimeout(() => {
          (completeTimersRef.current.delete(timerKey), updateAttachment(targetScopeKey, attachmentId, (record) => ({ ...record, showComplete: false })));
        }, 300);
        completeTimersRef.current.set(timerKey, timer);
      },
      [updateAttachment],
    ),
    runUpload = React.useCallback(
      async (targetScopeKey: string, attachmentId: string, context: AttachmentScopeContext) => {
        const controllerKey = `${targetScopeKey}\u0000${attachmentId}`;
        const controller = new AbortController();
        (uploadControllersRef.current.set(controllerKey, controller),
          updateAttachment(targetScopeKey, attachmentId, (record) => ({
            ...record,
            uploadStatus: `uploading`,
            uploadProgress: Math.min(record.uploadProgress, 99),
            uploadError: void 0,
            uploadErrorKind: void 0,
          })));
        let progressSubscription: { dispose(): void } | null = null;
        try {
          const attachment = getScopeAttachments(targetScopeKey).find((item) => item.id === attachmentId);
          if (!attachment || !context.sessionId) return;
          if (attachment.localPath && isRemoteAttachmentTarget(context)) {
            if (!context.remoteSessionId) {
              updateAttachment(targetScopeKey, attachmentId, (record) => ({ ...record, uploadStatus: `waitingSession` }));
              return;
            }
            progressSubscription = context.transferService.onDynamicProgress(attachment.operationId)((progress) => {
              uploadControllersRef.current.get(controllerKey) === controller &&
                updateAttachment(targetScopeKey, attachmentId, (record) => ({
                  ...record,
                  uploadStatus: progress.phase === `committing` ? `committing` : record.uploadStatus,
                  uploadProgress: Math.max(record.uploadProgress, uploadProgressPercent(progress.uploadedBytes, progress.totalBytes)),
                }));
            });
            const stageResult = await context.transferService.stage({
              operationId: attachment.operationId,
              sessionId: context.sessionId,
              workspacePath: context.workspacePath,
              ...(context.workspaceIdentity ? { workspaceIdentity: context.workspaceIdentity } : {}),
              remoteSessionId: context.remoteSessionId,
              localPath: attachment.localPath,
              fileName: attachment.filename,
              mime: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
            });
            if (uploadControllersRef.current.get(controllerKey) !== controller) return;
            if (!stageResult.staged)
              throw new RemoteAttachmentNotStagedError(
                intl.formatMessage({ id: `chat.attachments.upload.remoteMaterializationRequired` }),
              );
            markUploadComplete(
              targetScopeKey,
              attachmentId,
              { ref: stageResult.ref, fileName: attachment.filename, mime: attachment.mimeType, bytes: stageResult.bytes },
              stageResult.staged,
            );
            return;
          }
          const payload = await resolveAttachmentPayload(attachment);
          const content = await putAttachmentContent(context.attachmentPut, context.sessionId, payload, {
            signal: controller.signal,
            onProgress(progress) {
              uploadControllersRef.current.get(controllerKey) === controller &&
                updateAttachment(targetScopeKey, attachmentId, (record) => ({
                  ...record,
                  uploadStatus: progress.phase === `committing` ? `committing` : `uploading`,
                  uploadProgress: Math.max(record.uploadProgress, uploadProgressPercent(progress.uploadedBytes, progress.totalBytes)),
                }));
            },
          });
          if (!content) throw Error(`附件缺少可读取内容`);
          if (uploadControllersRef.current.get(controllerKey) !== controller) return;
          markUploadComplete(targetScopeKey, attachmentId, content, false);
        } catch (error) {
          if (uploadControllersRef.current.get(controllerKey) !== controller || controller.signal.aborted) return;
          const attachment = getScopeAttachments(targetScopeKey).find((item) => item.id === attachmentId);
          if (!attachment) return;
          const message = error instanceof Error ? error.message : String(error);
          const transient = isTransientUploadError(error);
          if (transient && attachment.autoRetryCount < 1) {
            updateAttachment(targetScopeKey, attachmentId, (record) => ({
              ...record,
              uploadStatus: `queued`,
              uploadProgress: 0,
              uploadError: message,
              uploadErrorKind: `transient`,
              autoRetryCount: record.autoRetryCount + 1,
            }));
            const retryKey = `${targetScopeKey}\u0000${attachmentId}`;
            const retryTimer = window.setTimeout(() => {
              (retryTimersRef.current.delete(retryKey), enqueueUpload(targetScopeKey, attachmentId));
            }, 500);
            retryTimersRef.current.set(retryKey, retryTimer);
          } else
            (updateAttachment(targetScopeKey, attachmentId, (record) => ({
              ...record,
              uploadStatus: `failed`,
              uploadProgress: Math.min(record.uploadProgress, 99),
              uploadError: message,
              uploadErrorKind: transient ? `transient` : `permanent`,
            })),
              logger.warn(`[v4-composer-attachments] 附件上传失败`, {
                attachmentId,
                error: message,
                scopeKey: targetScopeKey,
              }));
        } finally {
          (progressSubscription?.dispose(),
            uploadControllersRef.current.get(controllerKey) === controller && uploadControllersRef.current.delete(controllerKey),
            (activeUploadsRef.current = Math.max(0, activeUploadsRef.current - 1)),
            pumpQueueRef.current());
        }
      },
      [enqueueUpload, markUploadComplete, intl, updateAttachment],
    );
  ((pumpQueueRef.current = React.useCallback(() => {
    for (; activeUploadsRef.current < 2 && uploadQueueRef.current.length > 0;) {
      const entry = uploadQueueRef.current.shift();
      if (!entry) break;
      const attachment = getScopeAttachments(entry.scopeKey).find((item) => item.id === entry.attachmentId);
      if (!attachment || (attachment.uploadStatus !== `queued` && attachment.uploadStatus !== `waitingSession`)) continue;
      const context = scopeContextsRef.current.get(entry.scopeKey);
      const waitingRemoteSession = !!(context && attachment.localPath && isRemoteAttachmentTarget(context) && !context.remoteSessionId);
      if (!context?.sessionId || waitingRemoteSession) {
        updateAttachment(entry.scopeKey, entry.attachmentId, (record) => ({ ...record, uploadStatus: `waitingSession` }));
        continue;
      }
      ((activeUploadsRef.current += 1), runUpload(entry.scopeKey, entry.attachmentId, context));
    }
  }, [runUpload, updateAttachment])),
    React.useEffect(() => {
      const scopeAttachments = getScopeAttachments(scopeKey);
      const sessionReady = !isRemoteAttachmentTarget({ remoteSessionId, workspaceIdentity }) || !!remoteSessionId;
      if (attachmentSessionId && sessionReady)
        for (const attachment of scopeAttachments)
          attachment.uploadStatus === `waitingSession` &&
            (updateAttachment(scopeKey, attachment.id, (record) => ({ ...record, uploadStatus: `queued` })), enqueueUpload(scopeKey, attachment.id));
    }, [attachmentSessionId, enqueueUpload, remoteSessionId, scopeKey, updateAttachment, workspaceIdentity]),
    React.useEffect(() => {
      if (onRuntimeRestart)
        return onRuntimeRestart(() => {
          for (const [entryScopeKey, scopeAttachments] of Object.entries(useComposerAttachmentStore.getState().scopes)) {
            const context = scopeContextsRef.current.get(entryScopeKey);
            if (context)
              for (const attachment of scopeAttachments) {
                if (
                  attachment.referenceOwnership === `session` ||
                  attachment.localZeroCopy ||
                  attachment.uploadStatus === `failed`
                )
                  continue;
                const controllerKey = `${entryScopeKey}\u0000${attachment.id}`;
                if (
                  (uploadControllersRef.current.get(controllerKey)?.abort(),
                  uploadControllersRef.current.delete(controllerKey),
                  attachment.staged && context?.transferService.cleanup(attachment.operationId).catch(() => {}),
                  attachment.autoRetryCount >= 1)
                ) {
                  updateAttachment(entryScopeKey, attachment.id, (record) => ({
                    ...record,
                    uploadStatus: `failed`,
                    uploadProgress: 0,
                    uploadError: intl.formatMessage({
                      id: `chat.attachments.upload.runtimeRestarted`,
                    }),
                    uploadErrorKind: `runtimeRestarted`,
                    attachmentRef: void 0,
                    staged: false,
                    adopted: false,
                    showComplete: false,
                  }));
                  continue;
                }
                (updateAttachment(entryScopeKey, attachment.id, (record) => ({
                  ...record,
                  uploadStatus: context?.sessionId ? `queued` : `waitingSession`,
                  uploadProgress: 0,
                  uploadError: intl.formatMessage({ id: `chat.attachments.upload.runtimeRestarted` }),
                  uploadErrorKind: `runtimeRestarted`,
                  attachmentRef: void 0,
                  staged: false,
                  adopted: false,
                  showComplete: false,
                  autoRetryCount: record.autoRetryCount + 1,
                })),
                  context?.sessionId && enqueueUpload(entryScopeKey, attachment.id));
              }
          }
        });
    }, [enqueueUpload, intl, onRuntimeRestart, updateAttachment]));
  const addAttachments = React.useCallback(
      (incoming: ComposerAttachment[]) => {
        if (incoming.length === 0) return;
        const remainingSlots = 8 - getScopeAttachments(scopeKey).length;
        if (remainingSlots <= 0) {
          (incoming.forEach(revokeAttachmentObjectUrl), setAttachmentError(intl.formatMessage({ id: `chat.attachments.maxFiles` }, { count: `8` })));
          return;
        }
        const accepted = incoming.slice(0, remainingSlots);
        incoming.slice(remainingSlots).forEach(revokeAttachmentObjectUrl);
        const context = scopeContextsRef.current.get(scopeKey);
        const records = accepted.map((attachment): ComposerAttachmentRecord => {
          const localZeroCopy = !!(attachment.localPath && context && !isRemoteAttachmentTarget(context));
          return {
            ...attachment,
            referenceOwnership: `composer` as const,
            operationId: `prompt-attachment-${attachment.id}`,
            uploadStatus: localZeroCopy ? `ready` : context?.sessionId ? `queued` : `waitingSession`,
            uploadProgress: localZeroCopy ? 100 : 0,
            ...(localZeroCopy && attachment.localPath
              ? {
                  attachmentRef: {
                    ref: attachment.localPath,
                    fileName: attachment.filename,
                    mime: attachment.mimeType,
                    bytes: attachment.sizeBytes,
                  },
                }
              : {}),
            autoRetryCount: 0,
            staged: false,
            adopted: false,
            showComplete: false,
            localZeroCopy,
          };
        });
        (updateScope(scopeKey, (list) => [...list, ...records]),
          setAttachmentError(
            incoming.length > remainingSlots
              ? intl.formatMessage({ id: `chat.attachments.maxFiles` }, { count: `8` })
              : null,
          ));
        for (const record of records) record.uploadStatus === `queued` && enqueueUpload(scopeKey, record.id);
      },
      [updateScope, enqueueUpload, intl, scopeKey],
    ),
    addFiles = React.useCallback(
      (files: File[]) => {
        addAttachments(
          files.map((file) => {
            let localPath: string | undefined;
            try {
              const resolved = platform.getPathForFile?.(file);
              localPath = resolved?.trim() ? resolved : void 0;
            } catch (error) {
              logger.warn(`[v4-composer-attachments] 解析附件本地路径失败`, error);
            }
            return createFileAttachment(file, localPath);
          }),
        );
      },
      [addAttachments, platform],
    ),
    addLocalPaths = React.useCallback(
      (paths: string[]) => {
        addAttachments(paths.map(createLocalPathAttachment));
      },
      [addAttachments],
    ),
    openAttachmentPicker = React.useCallback(() => {
      if (!platform.canSelectFilePath) {
        attachmentInputRef.current?.click();
        return;
      }
      selectAttachmentPaths(platform)
        .then((paths) => addLocalPaths(paths))
        .catch((error) => {
          (logger.warn(`[v4-composer-attachments] 选择附件路径失败`, error),
            setAttachmentError(
              intl.formatMessage(
                { id: `chat.attachments.readFailed` },
                { message: error instanceof Error ? error.message : String(error) },
              ),
            ));
        });
    }, [addLocalPaths, intl, platform]),
    handleAttachmentInputChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.currentTarget.files ?? []);
        ((event.currentTarget.value = ``), addFiles(files));
      },
      [addFiles],
    ),
    handlePaste = React.useCallback(
      (event: React.ClipboardEvent) => {
        if (disabled || !event.clipboardData) return;
        const clipboardFiles = Array.from(event.clipboardData.files);
        const plainText = event.clipboardData.getData(`text/plain`);
        const htmlText = event.clipboardData.getData(`text/html`);
        const preferSpreadsheetText = clipboardFiles.length > 0 && prefersSpreadsheetText(plainText, htmlText);
        if (
          (clipboardFiles.length > 0 &&
            logger.debug(`[v4-composer-attachments] 识别剪贴板多表示 payload`, {
              clipboardTypes: Array.from(event.clipboardData.types),
              fileTypes: clipboardFiles.map((file) => file.type),
              prefersSpreadsheetText: preferSpreadsheetText,
              textLength: plainText.length,
            }),
          clipboardFiles.length > 0 && !preferSpreadsheetText)
        ) {
          (event.preventDefault(), event.stopPropagation?.(), addFiles(clipboardFiles));
          return;
        }
        isLargePastedText(plainText) &&
          (event.preventDefault(),
          event.stopPropagation?.(),
          (async () => {
            try {
              const tempMeta = await platform.createTempTextAttachment?.({ text: plainText, filename: pastedTextFilename() });
              if (!tempMeta) throw Error(`当前平台不支持临时文本附件`);
              addAttachments([createClipboardTextAttachment(plainText, tempMeta)]);
            } catch (error) {
              (logger.warn(`[v4-composer-attachments] 创建粘贴文本临时附件失败`, error),
                setAttachmentError(
                  intl.formatMessage(
                    { id: `chat.attachments.readFailed` },
                    { message: error instanceof Error ? error.message : String(error) },
                  ),
                ));
            }
          })());
      },
      [addFiles, addAttachments, disabled, intl, platform],
    ),
    cancelDragDismiss = React.useCallback(() => {
      dragDismissTimerRef.current !== null && (window.clearTimeout(dragDismissTimerRef.current), (dragDismissTimerRef.current = null));
    }, []),
    dismissComposerDrag = React.useCallback(() => {
      (cancelDragDismiss(), setComposerDragKind(null));
    }, [cancelDragDismiss]),
    scheduleDragDismiss = React.useCallback(() => {
      (cancelDragDismiss(), (dragDismissTimerRef.current = window.setTimeout(dismissComposerDrag, 300)));
    }, [cancelDragDismiss, dismissComposerDrag]);
  React.useEffect(() => {
    const handleDragLeave = (event: DragEvent) => {
      event.relatedTarget === null && dismissComposerDrag();
    };
    return (
      window.addEventListener(`dragend`, dismissComposerDrag),
      window.addEventListener(`drop`, dismissComposerDrag),
      window.addEventListener(`blur`, dismissComposerDrag),
      document.addEventListener(`dragleave`, handleDragLeave),
      () => {
        (cancelDragDismiss(),
          window.removeEventListener(`dragend`, dismissComposerDrag),
          window.removeEventListener(`drop`, dismissComposerDrag),
          window.removeEventListener(`blur`, dismissComposerDrag),
          document.removeEventListener(`dragleave`, handleDragLeave));
      }
    );
  }, [cancelDragDismiss, dismissComposerDrag]);
  const handleDragOverComposer = React.useCallback(
      (event: React.DragEvent) => {
        const types = Array.from(event.dataTransfer.types);
        (!Array.from(event.dataTransfer.items ?? []).some((item) => item.kind === `file`) &&
          !types.includes(`Files`) &&
          !types.includes(`application/x-zcode-workspace-file`)) ||
          (event.preventDefault(),
          (event.dataTransfer.dropEffect = `copy`),
          setComposerDragKind(types.includes(`application/x-zcode-workspace-file`) ? `workspace` : `attachment`),
          scheduleDragDismiss());
      },
      [scheduleDragDismiss],
    ),
    handleDragLeaveComposer = React.useCallback(
      (event: React.DragEvent) => {
        const relatedTarget = event.relatedTarget;
        (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) || dismissComposerDrag();
      },
      [dismissComposerDrag],
    ),
    handleDropComposer = React.useCallback(
      (event: React.DragEvent) => {
        if (Array.from(event.dataTransfer.types).includes(`application/x-zcode-workspace-file`)) {
          (event.preventDefault(), dismissComposerDrag());
          return;
        }
        const droppedFiles = Array.from(event.dataTransfer.files);
        (droppedFiles.length > 0 && (event.preventDefault(), addFiles(droppedFiles)), dismissComposerDrag());
      },
      [addFiles, dismissComposerDrag],
    ),
    exportWhiteboardBoard = React.useCallback(
      async (boardId: string) => {
        const board = whiteboardStore.getState().getBoard({ boardId, workspaceIdentity, workspacePath });
        if (!board) {
          setAttachmentError(intl.formatMessage({ id: `whiteboard.exportMissing` }));
          return;
        }
        try {
          addFiles([exportWhiteboardToPngFile(board)]);
        } catch (error) {
          setAttachmentError(
            intl.formatMessage(
              { id: `whiteboard.exportFailed` },
              { message: error instanceof Error ? error.message : String(error) },
            ),
          );
        }
      },
      [addFiles, intl, workspaceIdentity, workspacePath],
    ),
    handleWhiteboardMentionSelected = React.useCallback(async (detail: { boardId: string }) => exportWhiteboardBoard(detail.boardId), [exportWhiteboardBoard]);
  React.useEffect(() => {
    const handleWhiteboardMentionAdd = (event: Event) => {
      isWhiteboardMentionAddEvent(event) &&
        whiteboardScopeKey(event.detail) === whiteboardScopeKey({ workspacePath, workspaceIdentity }) &&
        (event.preventDefault(), exportWhiteboardBoard(event.detail.boardId));
    };
    return (window.addEventListener(WHITEBOARD_MENTION_ADD_EVENT_TYPE, handleWhiteboardMentionAdd), () => window.removeEventListener(WHITEBOARD_MENTION_ADD_EVENT_TYPE, handleWhiteboardMentionAdd));
  }, [exportWhiteboardBoard, workspaceIdentity, workspacePath]);
  const removeAttachment = React.useCallback(
      (attachmentId: string) => {
        const attachment = getScopeAttachments(scopeKey).find((item) => item.id === attachmentId);
        if (!attachment) return;
        const controllerKey = `${scopeKey}\u0000${attachmentId}`;
        (uploadControllersRef.current.get(controllerKey)?.abort(),
          uploadControllersRef.current.delete(controllerKey),
          (uploadQueueRef.current = uploadQueueRef.current.filter((entry) => !(entry.scopeKey === scopeKey && entry.attachmentId === attachmentId))));
        const completeTimer = completeTimersRef.current.get(controllerKey);
        completeTimer !== void 0 && window.clearTimeout(completeTimer);
        const retryTimer = retryTimersRef.current.get(controllerKey);
        (retryTimer !== void 0 && window.clearTimeout(retryTimer), completeTimersRef.current.delete(controllerKey), retryTimersRef.current.delete(controllerKey), revokeAttachmentObjectUrl(attachment));
        const context = scopeContextsRef.current.get(scopeKey);
        ((attachment.staged || attachment.uploadStatus === `uploading` || attachment.uploadStatus === `committing`) &&
          context?.transferService.cancel(attachment.operationId).catch((error) => {
            logger.warn(`[v4-composer-attachments] 取消远程附件失败`, error);
          }),
          updateScope(scopeKey, (list) => list.filter((item) => item.id !== attachmentId)),
          setAttachmentError(null));
      },
      [updateScope, scopeKey],
    ),
    retryAttachment = React.useCallback(
      (attachmentId: string) => {
        const attachment = getScopeAttachments(scopeKey).find((item) => item.id === attachmentId);
        if (!attachment || attachment.uploadStatus !== `failed`) return;
        const context = scopeContextsRef.current.get(scopeKey);
        (context?.transferService.cleanup(attachment.operationId).catch(() => {}),
          updateAttachment(scopeKey, attachmentId, (record) => ({
            ...record,
            uploadStatus: context?.sessionId ? `queued` : `waitingSession`,
            uploadProgress: 0,
            uploadError: void 0,
            uploadErrorKind: void 0,
            attachmentRef: void 0,
            autoRetryCount: 0,
            staged: false,
            adopted: false,
            showComplete: false,
          })),
          context?.sessionId && enqueueUpload(scopeKey, attachmentId));
      },
      [enqueueUpload, scopeKey, updateAttachment],
    ),
    clearAttachments = React.useCallback(() => {
      const scopeAttachments = getScopeAttachments(scopeKey);
      const context = scopeContextsRef.current.get(scopeKey);
      for (const attachment of scopeAttachments) {
        const controllerKey = `${scopeKey}\u0000${attachment.id}`;
        (uploadControllersRef.current.get(controllerKey)?.abort(), uploadControllersRef.current.delete(controllerKey));
        const completeTimer = completeTimersRef.current.get(controllerKey);
        completeTimer !== void 0 && window.clearTimeout(completeTimer);
        const retryTimer = retryTimersRef.current.get(controllerKey);
        (retryTimer !== void 0 && window.clearTimeout(retryTimer),
          completeTimersRef.current.delete(controllerKey),
          retryTimersRef.current.delete(controllerKey),
          revokeAttachmentObjectUrl(attachment),
          !attachment.adopted &&
            (attachment.staged || attachment.uploadStatus === `uploading` || attachment.uploadStatus === `committing`) &&
            context?.transferService.cleanup(attachment.operationId).catch((error) => {
              logger.warn(`[v4-composer-attachments] 清理未发送附件失败`, error);
            }));
      }
      ((uploadQueueRef.current = uploadQueueRef.current.filter((entry) => entry.scopeKey !== scopeKey)), updateScope(scopeKey, () => []), setAttachmentError(null));
    }, [updateScope, scopeKey]),
    restoreSessionOwnedAttachments = React.useCallback(
      (refs: AttachmentRef[]) => {
        if (refs.length === 0) return true;
        if (getScopeAttachments(scopeKey).length > 0) return false;
        const records = refs.map((ref) => {
          const id = nanoid();
          return {
            id,
            filename: ref.fileName,
            mimeType: ref.mime,
            sizeBytes: ref.bytes,
            referenceOwnership: `session` as const,
            uploadStatus: `ready` as const,
            uploadProgress: 100,
            attachmentRef: { ...ref },
            operationId: `session-owned-${id}`,
            autoRetryCount: 0,
            staged: false,
            adopted: true,
            showComplete: false,
            localZeroCopy: false,
          };
        });
        return (updateScope(scopeKey, () => records), setAttachmentError(null), true);
      },
      [updateScope, scopeKey],
    ),
    prepareForSend = React.useCallback(async () => {
      const scopeAttachments = getScopeAttachments(scopeKey);
      return scopeAttachments.some((attachment) => attachment.uploadStatus !== `ready` || !attachment.attachmentRef)
        ? null
        : scopeAttachments.flatMap((attachment) => (attachment.attachmentRef ? [attachment.attachmentRef] : []));
    }, [scopeKey]),
    adoptSentAttachments = React.useCallback(async () => {
      const scopeAttachments = getScopeAttachments(scopeKey);
      const context = scopeContextsRef.current.get(scopeKey);
      for (const attachment of scopeAttachments)
        if (attachment.staged && !attachment.adopted) {
          try {
            await context?.transferService.adopt(attachment.operationId);
          } catch (error) {
            logger.warn(`[v4-composer-attachments] 附件发送后 adopt 失败`, error);
          }
          updateAttachment(scopeKey, attachment.id, (record) => ({ ...record, adopted: true }));
        }
    }, [scopeKey, updateAttachment]);
  return React.useMemo(
    () => ({
      attachments,
      attachmentError,
      composerDragKind,
      hasAttachments: attachments.length > 0,
      hasUnreadyAttachments: attachments.some((attachment) => attachment.uploadStatus !== `ready`),
      isDraggingOverComposer,
      attachmentInputRef,
      openAttachmentPicker,
      handleAttachmentInputChange,
      handlePaste,
      handleDragOverComposer,
      handleDragLeaveComposer,
      handleDropComposer,
      handleWhiteboardMentionSelected,
      removeAttachment,
      retryAttachment,
      clearAttachments,
      restoreSessionOwnedAttachments,
      prepareForSend,
      adoptSentAttachments,
      setAttachmentError,
    }),
    [attachmentError, adoptSentAttachments, attachments, composerDragKind, clearAttachments, restoreSessionOwnedAttachments, handleAttachmentInputChange, handleDragLeaveComposer, handleDragOverComposer, handleDropComposer, handlePaste, handleWhiteboardMentionSelected, isDraggingOverComposer, openAttachmentPicker, prepareForSend, removeAttachment, retryAttachment],
  );
}

/* ============================================================================
 * [B14] js 68294–68640 —— 代码评论域（chip + 事件 + store + markdown 装配）
 * ========================================================================== */

/** 代码评论形状（语义归纳；中把握度） */
interface CodeCommentEntry {
  id: string;
  sourcePath: string; // A1-R8 精化：?→必填（bundle 真形：EXe 解析缺 sourcePath 即返 null，FH 各写点必携；CodeViewer 改指缝合所需）
  sourceTitle: string;
  startLine: number;
  endLine: number;
  selectedText: string;
  comment: string;
}
interface CodeCommentAttachment extends CodeCommentEntry {
  workspacePath: string;
  workspaceIdentity?: string | null;
}

/** hXe → codeCommentKey（js 68295） */
function codeCommentKey(comment: { id: string; workspacePath: string; workspaceIdentity?: string | null }): string {
  return `${comment.workspaceIdentity?.trim() || comment.workspacePath}\0${comment.id}`;
}

/* --- A1-R22：[B14] CodeCommentsChip 逐字化（js 68298–68410）。A0 时代语义局部变量 + JSX 源形
 *   副本删除，换编译形逐字；消费面 = composer topContent（bundle 90781）+ 用户消息行
 *   （112241，contentAlign=end）。双副本裁定见 A1-R22.report.md §三。
 *   映射表（minified → 语义名 → bundle 行）：
 *     TH  → CodeCommentsChip  (68298)  补 export：Home CodeCommentChipRow / Conversation CodeCommentChips
 *                                        declare 收敛 + code-viewer/GitReview A1-R12 副本降 re-export
 *     hXe → codeCommentKey    (68295)  行键（本文件既有 A0 转录，复用）
 *   行内消费：G=useIntlContext / Z=cn / X=Button / g=CloseIcon（X）/ _v=CommentGlyphIcon
 *     （MessageSquareText）/ Cye=CodeCommentIcon（CodeXml）/ Kv=TrashIcon（Trash2）/
 *     CN=HoverCardTooltip / wN=HoverCardTooltipTrigger / TN=HoverCardTooltipContent
 *     （components/ui/hover-card）/ $=react/jsx-runtime。JSX 保持编译形态。 ── */

/** TH → CodeCommentsChip（js 68298） */
export function CodeCommentsChip({ comments: e, contentAlign: t = `start`, onRemove: n, onRemoveAll: r }: {
  comments: CodeCommentAttachment[];
  contentAlign?: `start` | `center` | `end`;
  onRemove?: (comment: CodeCommentAttachment) => void;
  onRemoveAll?: () => void;
}): React.ReactElement | null {
  let { intl: i } = useIntlContext();
  if (e.length === 0) return null;
  let a = i.formatMessage(
      { id: e.length === 1 ? `chat.codeComments.one` : `chat.codeComments.many` },
      { count: String(e.length) },
    ),
    o = i.formatMessage({ id: `chat.codeComments.remove` });
  return (0, $.jsxs)(HoverCardTooltip, {
    children: [
      (0, $.jsx)(HoverCardTooltipTrigger, {
        asChild: !0,
        children: (0, $.jsxs)(`div`, {
          className: cn(
            `group flex h-8 max-w-full cursor-pointer select-none items-center gap-1.5`,
            `rounded-md border border-border bg-surface p-1`,
            `text-ui-base font-medium text-foreground transition-all hover:bg-surface-hover`,
            `outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`,
          ),
          "aria-label": a,
          role: `button`,
          tabIndex: 0,
          children: [
            (0, $.jsxs)(`span`, {
              className: `flex min-w-0 items-center gap-1.5 rounded-sm px-1`,
              children: [
                (0, $.jsx)(CommentGlyphIcon, { className: `size-4 shrink-0 text-foreground-subtle` }),
                (0, $.jsx)(`span`, { className: `truncate`, children: a }),
              ],
            }),
            r
              ? (0, $.jsx)(Button, {
                  type: `button`,
                  variant: `ghost`,
                  size: `icon-xs`,
                  className: `size-5 shrink-0 rounded-sm text-foreground-subtle opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100`,
                  "aria-label": o,
                  title: o,
                  onClick: (e: React.MouseEvent<HTMLButtonElement>) => { // 〔A1-R22〕型缝注参（Home §V 同约定）：Button 面上下文推不出参数形
                    (e.stopPropagation(), r());
                  },
                  children: (0, $.jsx)(CloseIcon, { className: `size-3.5` }),
                })
              : null,
          ],
        }),
      }),
      (0, $.jsx)(HoverCardTooltipContent, {
        align: t,
        side: `top`,
        className: `w-80 rounded-xl border border-popover-border bg-menu p-1 text-foreground shadow-md ring-0`,
        children: (0, $.jsx)(`div`, {
          className: `max-h-64 overflow-y-auto`,
          children: e.map((e) => {
            let t = e.startLine === e.endLine ? `L${e.startLine}` : `L${e.startLine}-L${e.endLine}`;
            return (0, $.jsxs)(
              `div`,
              {
                className: `group/comment flex min-h-7 cursor-default gap-2 rounded-lg px-2 py-1 text-ui-base/relaxed text-foreground hover:bg-menu-hover`,
                children: [
                  (0, $.jsx)(CodeCommentIcon, { className: `mt-1 size-4 shrink-0 text-foreground-subtle` }),
                  (0, $.jsxs)(`div`, {
                    className: `min-w-0 flex-1`,
                    children: [
                      (0, $.jsxs)(`div`, {
                        className: `flex min-w-0 items-center gap-2`,
                        children: [
                          (0, $.jsx)(`span`, {
                            className: `truncate font-medium`,
                            children: e.sourceTitle,
                          }),
                          (0, $.jsx)(`span`, {
                            className: `shrink-0 font-mono text-ui-base text-foreground-subtle`,
                            children: t,
                          }),
                        ],
                      }),
                      (0, $.jsx)(`div`, {
                        className: `truncate font-mono text-ui-base text-foreground-subtlest`,
                        children: e.sourcePath ?? e.sourceTitle,
                      }),
                      e.comment.trim()
                        ? (0, $.jsx)(`div`, {
                            className: `line-clamp-2 text-ui-base/relaxed text-foreground-subtle`,
                            children: e.comment,
                          })
                        : null,
                    ],
                  }),
                  n
                    ? (0, $.jsx)(Button, {
                        type: `button`,
                        variant: `ghost`,
                        size: `icon-xs`,
                        className: `mt-0.5 size-5 shrink-0 rounded-sm text-foreground-subtle opacity-0 transition-opacity hover:text-foreground group-hover/comment:opacity-100`,
                        "aria-label": o,
                        title: o,
                        onClick: (t: React.MouseEvent<HTMLButtonElement>) => { // 〔A1-R22〕型缝注参（同上）
                          (t.stopPropagation(), n(e));
                        },
                        children: (0, $.jsx)(TrashIcon, { className: `size-3.5` }),
                      })
                    : null,
                ],
              },
              codeCommentKey(e),
            );
          }),
        }),
      }),
    ],
  });
}

/** EH → CODE_COMMENT_ADD_EVENT（js 68411） */
const CODE_COMMENT_ADD_EVENT = `zcode:code-comment-add-to-chat`;
/** DH → CODE_COMMENT_REMOVE_EVENT（js 68412） */
const CODE_COMMENT_REMOVE_EVENT = `zcode:code-comment-remove-from-chat`;
/** gXe → CODE_COMMENT_REMOVE_CHANNEL（js 68413） */
const CODE_COMMENT_REMOVE_CHANNEL = `code-comment:remove-from-chat`;
/** OH → suppressedCodeCommentIds（js 68414） */
const suppressedCodeCommentIds = new Set<string>();

/** kH → commentWorkspaceKey（js 68415） */
function commentWorkspaceKey(workspacePath: string, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath;
}

/** AH → codeCommentIdentityKey（js 68418） */
function codeCommentIdentityKey(comment: { id: string; workspacePath: string; workspaceIdentity?: string | null }): string {
  return `${commentWorkspaceKey(comment.workspacePath, comment.workspaceIdentity)}\0${comment.id}`;
}

/** _Xe → isCodeCommentSuppressed（js 68421） */
function isCodeCommentSuppressed(comment: { id: string; workspacePath: string; workspaceIdentity?: string | null }): boolean {
  return suppressedCodeCommentIds.has(codeCommentIdentityKey(comment));
}

/** jH → suppressCodeComment（js 68424） */
function suppressCodeComment(comment: { id: string; workspacePath: string; workspaceIdentity?: string | null }): void {
  suppressedCodeCommentIds.add(codeCommentIdentityKey(comment));
}

/** vXe → unsuppressCodeComment（js 68427） */
function unsuppressCodeComment(comment: { id: string; workspacePath: string; workspaceIdentity?: string | null }): void {
  suppressedCodeCommentIds.delete(codeCommentIdentityKey(comment));
}

/** yXe → isCodeCommentAddEvent（js 68430） */
function isCodeCommentAddEvent(event: Event): boolean {
  return (
    event.type === `zcode:code-comment-add-to-chat` &&
    `detail` in event &&
    typeof (event as CustomEvent).detail == `object` &&
    (event as CustomEvent).detail !== null
  );
}

/** bXe → isCodeCommentRemoveEvent（js 68438） */
function isCodeCommentRemoveEvent(event: Event): boolean {
  return (
    event.type === `zcode:code-comment-remove-from-chat` &&
    `detail` in event &&
    typeof (event as CustomEvent).detail == `object` &&
    (event as CustomEvent).detail !== null
  );
}

/** MH → isCodeCommentRemoveDetail（js 68446） */
function isCodeCommentRemoveDetail(detail: unknown): detail is { id: string; workspacePath: string; workspaceIdentity?: string } {
  return (
    typeof detail == `object` &&
    !!detail &&
    typeof (detail as { id?: unknown }).id == `string` &&
    (detail as { id: string }).id.length > 0 &&
    typeof (detail as { workspacePath?: unknown }).workspacePath == `string` &&
    (detail as { workspacePath: string }).workspacePath.length > 0 &&
    ((detail as { workspaceIdentity?: unknown }).workspaceIdentity === void 0 || typeof (detail as { workspaceIdentity?: unknown }).workspaceIdentity == `string`)
  );
}

/** NH → isCodeCommentAddDetail（js 68457） */
function isCodeCommentAddDetail(detail: unknown): detail is CodeCommentAttachment {
  const candidate = detail as CodeCommentAttachment;
  return (
    typeof detail == `object` &&
    !!detail &&
    typeof candidate.workspacePath == `string` &&
    candidate.workspacePath.length > 0 &&
    (candidate.workspaceIdentity === void 0 || typeof candidate.workspaceIdentity == `string`) &&
    typeof candidate.sourcePath == `string` &&
    candidate.sourcePath.length > 0 &&
    typeof candidate.sourceTitle == `string` &&
    candidate.sourceTitle.length > 0 &&
    typeof candidate.selectedText == `string` &&
    typeof candidate.comment == `string` &&
    Number.isFinite(candidate.startLine) &&
    Number.isFinite(candidate.endLine)
  );
}

/** xXe → formatCodeCommentMarkdown（js 68475） */
function formatCodeCommentMarkdown(comment: CodeCommentEntry): string {
  const lineRange = comment.startLine === comment.endLine ? String(comment.startLine) : `${comment.startLine}-${comment.endLine}`;
  return `## Comment\nFile: ${comment.sourcePath ?? comment.sourceTitle}\nSide: R\nLines: ${lineRange}\nSelected text:\n\`\`\`\n${comment.selectedText.trim()}\n\`\`\`\nComment:\n${comment.comment.trim()}\n`;
}

/** SXe → formatCodeCommentsMarkdown（js 68479） */
function formatCodeCommentsMarkdown(comments: CodeCommentEntry[]): string {
  return comments.length === 0
    ? ``
    : `# Code comments:\n\n${comments.map((comment, index) => formatCodeCommentMarkdown(comment).replace(`## Comment`, `## Comment ${index + 1}`))
        .join(`
`)}`;
}

/** CXe → appendCodeCommentsToContent（js 68486） */
function appendCodeCommentsToContent(content: string, comments: CodeCommentEntry[]): string {
  const trimmedContent = content.trimEnd();
  const commentsMarkdown = formatCodeCommentsMarkdown(comments);
  return commentsMarkdown
    ? `${trimmedContent}${
        trimmedContent
          ? `

`
          : ``
      }${commentsMarkdown}`.trim()
    : trimmedContent.trim();
}

/** wXe → pathBasename（js 68499） */
function pathBasename(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}

/** TXe → parseLineRange（js 68502） */
function parseLineRange(raw: string): { startLine: number; endLine: number } | null {
  const normalized = raw.trim().replace(/^L/i, ``);
  const match = /^(\d+)(?:\s*-\s*L?(\d+))?$/.exec(normalized);
  if (!match) return null;
  const startLine = Number(match[1]);
  const endLine = Number(match[2] ?? match[1]);
  return !Number.isFinite(startLine) || !Number.isFinite(endLine) ? null : { startLine, endLine };
}

/** EXe → parseCodeCommentMarkdown（js 68510） */
function parseCodeCommentMarkdown(markdown: string, index: number, workspacePath: string, workspaceIdentity?: string | null): CodeCommentAttachment | null {
  const fileMatch = /^File:\s*(.+)$/m.exec(markdown);
  const linesMatch = /^Lines:\s*(.+)$/m.exec(markdown);
  const bodyMatch = /Selected text:\s*\n```(?:[^\n`]*)?\n([\s\S]*?)\n```\s*\nComment:\s*\n?([\s\S]*)$/m.exec(markdown);
  if (!fileMatch || !linesMatch || !bodyMatch) return null;
  const sourcePath = fileMatch[1];
  const lineRangeRaw = linesMatch[1];
  const selectedText = bodyMatch[1];
  const commentText = bodyMatch[2];
  if (!sourcePath || !lineRangeRaw || selectedText === void 0 || commentText === void 0) return null;
  const lineRange = parseLineRange(lineRangeRaw);
  if (!lineRange) return null;
  const trimmedPath = sourcePath.trim();
  const trimmedComment = commentText.trim();
  return {
    id: `parsed-code-comment-${index + 1}-${lineRange.startLine}-${lineRange.endLine}`,
    workspacePath,
    ...(workspaceIdentity ? { workspaceIdentity } : {}),
    sourcePath: trimmedPath,
    sourceTitle: pathBasename(trimmedPath),
    startLine: lineRange.startLine,
    endLine: lineRange.endLine,
    selectedText: selectedText.trim(),
    comment: trimmedComment,
  };
}

/** DXe → extractCodeCommentsFromContent（js 68536） */
function extractCodeCommentsFromContent(content: string, scope: { workspacePath: string; workspaceIdentity?: string | null }): {
  visibleContent: string;
  codeCommentAttachments: CodeCommentAttachment[];
} {
  const sectionMatch = /(?:^|\n\n)# Code comments:\s*\n\n([\s\S]*?)\s*$/.exec(content);
  if (!sectionMatch || sectionMatch.index < 0) return { visibleContent: content, codeCommentAttachments: [] };
  const section = sectionMatch[1];
  if (section === void 0) return { visibleContent: content, codeCommentAttachments: [] };
  const parsed = section
    .split(/\n(?=## Comment(?:\s+\d+)?\n)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => parseCodeCommentMarkdown(chunk, index, scope.workspacePath, scope.workspaceIdentity))
    .filter((entry) => entry !== null);
  return parsed.length === 0
    ? { visibleContent: content, codeCommentAttachments: [] }
    : { visibleContent: content.slice(0, sectionMatch.index).trimEnd(), codeCommentAttachments: parsed as CodeCommentAttachment[] };
}

/** OXe → dispatchCodeCommentAddEvent（js 68551） */
function dispatchCodeCommentAddEvent(detail: CodeCommentAttachment): boolean {
  const event = new CustomEvent(CODE_COMMENT_ADD_EVENT, { cancelable: true, detail });
  return !window.dispatchEvent(event);
}

/** kXe → dispatchCodeCommentRemoveEvent（js 68555） */
function dispatchCodeCommentRemoveEvent(detail: { id: string; workspacePath: string; workspaceIdentity?: string | null }): void {
  (suppressCodeComment(detail), window.dispatchEvent(new CustomEvent(CODE_COMMENT_REMOVE_EVENT, { detail })));
}

/** AXe → EMPTY_COMMENTS（js 68558） */
const EMPTY_COMMENTS: CodeCommentEntry[] = [];

/** PH → commentBucketKey（js 68559） */
function commentBucketKey(args: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string }): string {
  return `${commentWorkspaceKey(args.workspacePath, args.workspaceIdentity)}\0${args.sourcePath}`;
}

/** 代码评论 store 形状（语义归纳；中把握度） */
interface CodeCommentsStoreState {
  commentsByBucketKey: Record<string, CodeCommentEntry[]>;
  getComments(bucket: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string }): CodeCommentEntry[];
  addComment(args: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string; comment: CodeCommentEntry }): void;
  removeComment(args: { id: string; workspacePath: string; workspaceIdentity?: string | null; sourcePath: string }): void;
  removeCommentBySource(args: { id: string; workspacePath: string; workspaceIdentity?: string | null }): void;
  restoreCommentFromAttachment(attachment: CodeCommentAttachment & { sourcePath: string }): void;
  clearSource(bucket: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string }): void;
}

/** FH → useCodeCommentsStore（js 68562）
 * A1-R8 双实例收敛 canonical：bundle 唯一 FH（@68562，定义于本文件转录域 68558–68628，
 * 尾表在案）。树内原四并行实例（本文件 + CodeViewer.tsx 325 + GitReview.tsx 2202 +
 * stores/codeCommentsStore.ts 58）实测消费面：本文件 6793（jXe 转录 = bundle 68634）；
 * CodeViewer 1604–1606（= bundle 161450–161452 钩子簇）；GitReview 2290/2606/2676/2681
 * （jXe/Ue-We/g8t 助手转录）；AppRootLeaves 2009/2014（= bundle 212998/213003 广播监听，
 * 原 declare 改指）。裁决本实例为 canonical：FH 定义区属主 + 环安全唯一可行向
 * （CodeViewer 88 / GitReview 215 已 import 本文件；反向 Composer→CodeViewer 与
 * Composer→GitReview 皆成二环）。余三实例降 re-export shim/改指，证据链各就其位。 */
export const useCodeCommentsStore = createStore<CodeCommentsStoreState>((set, get) => ({
  commentsByBucketKey: {},
  getComments: (bucket) => get().commentsByBucketKey[commentBucketKey(bucket)] ?? EMPTY_COMMENTS,
  addComment: (args) => {
    const bucketKey = commentBucketKey(args);
    set((state) => {
      const existing = state.commentsByBucketKey[bucketKey] ?? [];
      return {
        commentsByBucketKey: {
          ...state.commentsByBucketKey,
          [bucketKey]: [...existing.filter((entry) => entry.id !== args.comment.id), args.comment],
        },
      };
    });
  },
  removeComment: (args) => {
    const bucketKey = commentBucketKey(args);
    set((state) => {
      const existing = state.commentsByBucketKey[bucketKey] ?? [];
      const remaining = existing.filter((entry) => entry.id !== args.id);
      return remaining.length === existing.length
        ? state
        : { commentsByBucketKey: { ...state.commentsByBucketKey, [bucketKey]: remaining } };
    });
  },
  removeCommentBySource: (args) => {
    const workspaceKey = commentWorkspaceKey(args.workspacePath, args.workspaceIdentity);
    set((state) => {
      let changed = false;
      const nextBuckets = Object.fromEntries(
        Object.entries(state.commentsByBucketKey).map(([bucketKey, entries]): [string, CodeCommentEntry[]] => {
          if (!bucketKey.startsWith(`${workspaceKey}\0`)) return [bucketKey, entries];
          const remaining = entries.filter((entry) => entry.id !== args.id);
          return ((changed ||= remaining.length !== entries.length), [bucketKey, remaining]);
        }),
      );
      return changed ? { commentsByBucketKey: nextBuckets } : state;
    });
  },
  restoreCommentFromAttachment: (attachment) => {
    attachment.sourcePath &&
      (unsuppressCodeComment({ id: attachment.id, workspacePath: attachment.workspacePath, workspaceIdentity: attachment.workspaceIdentity }),
      get().addComment({
        workspacePath: attachment.workspacePath,
        workspaceIdentity: attachment.workspaceIdentity,
        sourcePath: attachment.sourcePath,
        comment: {
          id: attachment.id,
          sourcePath: attachment.sourcePath,
          sourceTitle: attachment.sourceTitle,
          startLine: attachment.startLine,
          endLine: attachment.endLine,
          selectedText: attachment.selectedText,
          comment: attachment.comment,
        },
      }));
  },
  clearSource: (bucket) => {
    const bucketKey = commentBucketKey(bucket);
    set((state) => {
      if (!state.commentsByBucketKey[bucketKey]) return state;
      const { [bucketKey]: _removed, ...rest } = state.commentsByBucketKey;
      return { commentsByBucketKey: rest };
    });
  },
}));

/** jXe → removeCodeCommentEverywhere（js 68628） */
export function removeCodeCommentEverywhere( // 〔A1-R21〕补 export：Home broadcastContextRemoved declare（68628 同身）收敛消费（函数声明提升，环安全）
  comment: { id: string; workspacePath: string; workspaceIdentity?: string | null },
  broadcaster?: { send(message: { channel: string; payload: unknown }): unknown } | null,
): void {
  const identity = {
    id: comment.id,
    workspacePath: comment.workspacePath,
    ...(comment.workspaceIdentity ? { workspaceIdentity: comment.workspaceIdentity } : {}),
  };
  if ((suppressCodeComment(identity), useCodeCommentsStore.getState().removeCommentBySource(identity), broadcaster))
    try {
      Promise.resolve(broadcaster.send({ channel: CODE_COMMENT_REMOVE_CHANNEL, payload: identity })).catch((error) => {
        logger.warn(`[v4-composer] code comment preview 广播失败: ${String(error)}`);
      });
    } catch (error) {
      logger.warn(`[v4-composer] code comment preview 广播失败: ${String(error)}`);
    }
}

/* ============================================================================
 * [B15] js 68643–68826 —— 网页元素域（事件 + markdown 装配/解析）
 * ========================================================================== */

/** 网页元素形状（语义归纳；中把握度） */
export interface WebElementContext {
  /** 派发面可缺省（BH 校验不含 id）；接收侧 XXe 归一时 `id ?? NXe()` 补齐（bundle 68936）。 */
  id?: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  pageUrl: string;
  pageTitle: string;
  tagName: string;
  role?: string;
  accessibleName?: string;
  selector?: string;
  xpath?: string;
  attributes?: Record<string, unknown>;
  style?: {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    display?: string;
  };
  rect?: { x: number; y: number; width: number; height: number };
  text?: string;
  nearbyText?: string;
  htmlExcerpt?: string;
  capturedAt: number;
}

/** IH → WEB_ELEMENT_ADD_EVENT（js 68643） */
const WEB_ELEMENT_ADD_EVENT = `zcode:web-element-context-add-to-chat`;
/** LH → WEB_ELEMENT_REMOVE_EVENT（js 68644） */
const WEB_ELEMENT_REMOVE_EVENT = `zcode:web-element-context-remove-from-chat`;
/** MXe → WEB_ELEMENTS_MARKDOWN_HEADER（js 68645） */
const WEB_ELEMENTS_MARKDOWN_HEADER = `# Web page elements:`;
/** RH → WEB_ELEMENT_TEXT_LIMIT（js 68646） */
const WEB_ELEMENT_TEXT_LIMIT = 8e3;

/** NXe → createWebElementId（js 68648） */
function createWebElementId(): string {
  return typeof crypto < `u` && `randomUUID` in crypto
    ? crypto.randomUUID()
    : `web-element-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** zH → webElementWorkspaceKey（js 68653） */
function webElementWorkspaceKey(workspacePath: string, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath;
}

/** PXe → isWebElementAddEvent（js 68656） */
function isWebElementAddEvent(event: Event): boolean {
  return (
    event.type === `zcode:web-element-context-add-to-chat` &&
    `detail` in event &&
    typeof (event as CustomEvent).detail == `object` &&
    (event as CustomEvent).detail !== null
  );
}

/** FXe → isWebElementRemoveEvent（js 68663） */
function isWebElementRemoveEvent(event: Event): boolean {
  return (
    event.type === `zcode:web-element-context-remove-from-chat` &&
    `detail` in event &&
    typeof (event as CustomEvent).detail == `object` &&
    (event as CustomEvent).detail !== null
  );
}

/** BH → isWebElementAddDetail（js 68670；BrowserPane 消费名 validateWebElementContext） */
export function isWebElementAddDetail(detail: unknown): detail is WebElementContext {
  const candidate = detail as WebElementContext;
  return (
    typeof detail == `object` &&
    !!detail &&
    typeof candidate.workspacePath == `string` &&
    candidate.workspacePath.length > 0 &&
    (candidate.workspaceIdentity === void 0 || typeof candidate.workspaceIdentity == `string`) &&
    typeof candidate.pageUrl == `string` &&
    candidate.pageUrl.length > 0 &&
    typeof candidate.pageTitle == `string` &&
    typeof candidate.tagName == `string` &&
    candidate.tagName.length > 0 &&
    typeof candidate.capturedAt == `number`
  );
}

/** VH → truncateWebElementText（js 68686） */
function truncateWebElementText(text: string | undefined): string {
  if (!text) return ``;
  const trimmed = text.trim();
  return trimmed.length > WEB_ELEMENT_TEXT_LIMIT ? `${trimmed.slice(0, WEB_ELEMENT_TEXT_LIMIT)}\n\n[truncated]` : trimmed;
}

/** HH → pushWebElementField（js 68691） */
function pushWebElementField(lines: string[], label: string, value: string | undefined): void {
  const truncated = truncateWebElementText(value);
  truncated && lines.push(`${label}: ${truncated}`);
}

/** IXe → formatWebElementAttributes（js 68695） */
function formatWebElementAttributes(attributes: Record<string, unknown> | undefined): string {
  return !attributes || Object.keys(attributes).length === 0
    ? ``
    : Object.entries(attributes)
        .map(([name, value]) => `${name}=${JSON.stringify(value)}`)
        .join(` `);
}

/** LXe → formatWebElementFont（js 68703） */
function formatWebElementFont(style: WebElementContext[`style`]): string {
  return !style?.fontSize && !style?.fontFamily ? `` : [style.fontSize, style.fontFamily].filter(Boolean).join(` `);
}

/** RXe → formatWebElementMarkdown（js 68707） */
function formatWebElementMarkdown(element: WebElementContext): string {
  const lines = [
    `## Element`,
    `URL: ${element.pageUrl}`,
    `Title: ${element.pageTitle || `(untitled)`}`,
    `Tag: ${element.tagName.toLowerCase()}`,
  ];
  (pushWebElementField(lines, `Role`, element.role),
    pushWebElementField(lines, `Accessible name`, element.accessibleName),
    pushWebElementField(lines, `Selector`, element.selector),
    pushWebElementField(lines, `XPath`, element.xpath),
    pushWebElementField(lines, `Attributes`, formatWebElementAttributes(element.attributes)),
    pushWebElementField(lines, `Color`, element.style?.color),
    pushWebElementField(lines, `Background`, element.style?.backgroundColor),
    pushWebElementField(lines, `Font`, formatWebElementFont(element.style)),
    pushWebElementField(lines, `Font weight`, element.style?.fontWeight),
    pushWebElementField(lines, `Display`, element.style?.display),
    element.rect &&
      lines.push(
        `Rect: x=${Math.round(element.rect.x)}, y=${Math.round(element.rect.y)}, width=${Math.round(element.rect.width)}, height=${Math.round(element.rect.height)}`,
      ));
  const text = truncateWebElementText(element.text);
  text && lines.push(``, `Text:`, "```", text, "```");
  const nearbyText = truncateWebElementText(element.nearbyText);
  nearbyText && lines.push(``, `Nearby context:`, "```", nearbyText, "```");
  const htmlExcerpt = truncateWebElementText(element.htmlExcerpt);
  return (
    htmlExcerpt && lines.push(``, `HTML excerpt:`, "```html", htmlExcerpt, "```"),
    lines.join(`
`)
  );
}

/** zXe → appendWebElementsToContent（js 68737） */
export function appendWebElementsToContent(content: string, elements: WebElementContext[]): string {
  const trimmedContent = content.trimEnd();
  if (elements.length === 0) return trimmedContent.trim();
  const section = `${WEB_ELEMENTS_MARKDOWN_HEADER}\n\n${elements.map((element, index) => formatWebElementMarkdown(element).replace(`## Element`, `## Element ${index + 1}`)).join(`

`)}`;
  return `${trimmedContent}${
    trimmedContent
      ? `

`
      : ``
  }${section}`.trim();
}

/** UH → readWebElementField（js 68749） */
function readWebElementField(markdown: string, label: string): string {
  return RegExp(`^${label}:\\s*(.*)$`, `m`).exec(markdown)?.[1]?.trim() ?? ``;
}

/** WH → readWebElementCodeField（js 68752） */
function readWebElementCodeField(markdown: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  return (
    RegExp(`${escaped}:\\s*\\n\`\`\`(?:html)?\\n([\\s\\S]*?)\\n\`\`\``, `m`).exec(markdown)?.[1]?.trim() ?? ``
  );
}

/** BXe → parseWebElementFont（js 68761） */
function parseWebElementFont(raw: string): { fontSize?: string; fontFamily: string } {
  const match = /^([0-9.]+(?:px|rem|em|pt|%))\s+(.+)$/iu.exec(raw);
  if (!match) return { fontFamily: raw };
  const fontSize = match[1];
  const fontFamily = match[2];
  return !fontSize || !fontFamily ? { fontFamily: raw } : { fontSize, fontFamily };
}

/** VXe → parseWebElementStyle（js 68766） */
function parseWebElementStyle(markdown: string): WebElementContext[`style`] | undefined {
  const color = readWebElementField(markdown, `Color`);
  const backgroundColor = readWebElementField(markdown, `Background`);
  const font = readWebElementField(markdown, `Font`);
  const fontWeight = readWebElementField(markdown, `Font weight`);
  const display = readWebElementField(markdown, `Display`);
  const style = {
    ...(color ? { color } : {}),
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(font ? parseWebElementFont(font) : {}),
    ...(fontWeight ? { fontWeight } : {}),
    ...(display ? { display } : {}),
  };
  return Object.keys(style).length > 0 ? style : void 0;
}

/** HXe → parseWebElementMarkdown（js 68781） */
function parseWebElementMarkdown(markdown: string, index: number, workspacePath: string, workspaceIdentity?: string | null): WebElementContext | null {
  const pageUrl = readWebElementField(markdown, `URL`);
  const pageTitle = readWebElementField(markdown, `Title`);
  const tagName = readWebElementField(markdown, `Tag`);
  return !pageUrl || !tagName
    ? null
    : {
        id: `parsed-web-element-${index + 1}-${tagName}`,
        workspacePath,
        ...(workspaceIdentity ? { workspaceIdentity } : {}),
        pageUrl,
        pageTitle: pageTitle === `(untitled)` ? `` : pageTitle,
        tagName,
        role: readWebElementField(markdown, `Role`) || void 0,
        accessibleName: readWebElementField(markdown, `Accessible name`) || void 0,
        selector: readWebElementField(markdown, `Selector`) || void 0,
        xpath: readWebElementField(markdown, `XPath`) || void 0,
        text: readWebElementCodeField(markdown, `Text`) || void 0,
        nearbyText: readWebElementCodeField(markdown, `Nearby context`) || void 0,
        htmlExcerpt: readWebElementCodeField(markdown, `HTML excerpt`) || void 0,
        style: parseWebElementStyle(markdown),
        capturedAt: 0,
      };
}

/** UXe → extractWebElementsFromContent（js 68805）；〔A1-R129z〕返面窄化：
 * webElementContexts → Array<WebElementContext & { id: string }>——HXe 解析面必携
 * `parsed-web-element-${index+1}-${tagName}` id（束真 68781；WebElementsChip 契约同注），
 * 面差销账；cast 同步窄化，编译期擦除。 */
function extractWebElementsFromContent(content: string, scope: { workspacePath: string; workspaceIdentity?: string | null }): {
  visibleContent: string;
  webElementContexts: Array<WebElementContext & { id: string }>;
} {
  const sectionMatch = /(?:^|\n\n)# Web page elements:\s*\n\n([\s\S]*?)\s*$/.exec(content);
  if (!sectionMatch || sectionMatch.index < 0) return { visibleContent: content, webElementContexts: [] };
  const section = sectionMatch[1];
  if (section === void 0) return { visibleContent: content, webElementContexts: [] };
  const parsed = section
    .split(/\n(?=## Element(?:\s+\d+)?\n)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => parseWebElementMarkdown(chunk, index, scope.workspacePath, scope.workspaceIdentity))
    .filter((entry) => entry !== null);
  return parsed.length === 0
    ? { visibleContent: content, webElementContexts: [] }
    : { visibleContent: content.slice(0, sectionMatch.index).trimEnd(), webElementContexts: parsed as Array<WebElementContext & { id: string }> }; // 〔A1-R129z〕窄化 cast（HXe 必携 id，见函数头注）
}

/** WXe → dispatchWebElementAddEvent（js 68824；BrowserPane 消费名 addWebElementContextToChat） */
export function dispatchWebElementAddEvent(detail: WebElementContext): void {
  window.dispatchEvent(new CustomEvent(WEB_ELEMENT_ADD_EVENT, { detail }));
}

/* ============================================================================
 * [B16] js 68827–69353 —— 上下文装配 + PPTX/会话引用 + 后台工作胶囊
 *      （主体实际止于 69353；69354 起为 framer-motion vendored，见裁决 §R2）
 * ========================================================================== */

/** Composer 上下文集合形状（语义归纳；中把握度） */
interface ComposerContexts {
  codeComments: CodeCommentAttachment[];
  conversationSelections: ConversationSelection[];
  webElements: Array<WebElementContext & { id: string }>; // 〔A1-R129z〕窄化同 extractWebElementsFromContent 返面（WebElementsChip 契约）
  pptxElements: PptxElementAddDetail[];
}

/** GH → countComposerContexts（js 68825） */
function countComposerContexts(contexts: ComposerContexts): number {
  return (
    contexts.codeComments.length +
    contexts.conversationSelections.length +
    contexts.webElements.length +
    contexts.pptxElements.length
  );
}

/** GXe → buildComposerContextMarkdown（js 68833） */
function buildComposerContextMarkdown(content: string, contexts: ComposerContexts): string {
  return buildPptxElementsMarkdown(
    appendWebElementsToContent(appendCodeCommentsToContent(appendConversationSelections(content, contexts.conversationSelections), contexts.codeComments), contexts.webElements),
    contexts.pptxElements,
  );
}

/** KXe → parseComposerContextContent（js 68839）；〔A1-R129z〕补 export + 面校准：
 * scope.workspacePath string→string?（超集面——束真 KXe 无类型直传；Conversation 行上下文
 * RowRenderContext.workspacePath?: string 消费面直入；既有内部调用方全携真串不受影响）
 * + 内部二缝铸（抽取面窄形，铸编译期擦除，运行期与束逐字同）。 */
export function parseComposerContextContent(content: string, scope: { workspacePath?: string; workspaceIdentity?: string | null }): ComposerContexts & { visibleContent: string } {
  const pptxResult = extractPptxElementReferencesFromContent(content);
  const webResult = extractWebElementsFromContent(pptxResult.visibleContent, scope as { workspacePath: string; workspaceIdentity?: string | null }); // 〔A1-R129z〕型缝一：束真 UXe 受 t 直传（无类型）；抽取面窄形，铸编译期擦除
  const commentResult = extractCodeCommentsFromContent(webResult.visibleContent, scope as { workspacePath: string; workspaceIdentity?: string | null }); // 〔A1-R129z〕型缝二：同上（DXe 面）
  const selectionResult = extractConversationSelections(commentResult.visibleContent);
  return {
    visibleContent: selectionResult.visibleContent,
    codeComments: commentResult.codeCommentAttachments,
    conversationSelections: selectionResult.references,
    webElements: webResult.webElementContexts,
    pptxElements: pptxResult.pptxElementReferences as unknown as PptxElementAddDetail[], // 〔A1-R129z〕型缝三：canonical 返 PptxElementReference[]（imeComposition 域窄形，无索引签名）；ComposerContexts 面 PptxElementAddDetail[] 带开放索引签名，单向不足铸（TS2352）经 unknown 二级——束真 KXe 直传 w(e).pptxElementReferences 无型，铸编译期擦除，运行期逐字同
  };
}

/** qXe → createCodeCommentId（js 68852） */
function createCodeCommentId(): string {
  return typeof crypto < `u` && `randomUUID` in crypto
    ? crypto.randomUUID()
    : `code-comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** KH → codeCommentContextKey（js 68857） */
export function codeCommentContextKey(comment: { id: string; workspacePath: string; workspaceIdentity?: string | null }): string { // 〔A1-R22〕补 export：code-viewer/GitReview hXe/KH 双副本降 re-export 收敛（函数声明提升，环安全）
  return `${commentWorkspaceKey(comment.workspacePath, comment.workspaceIdentity)}\0${comment.id}`;
}

/** JXe → useCodeCommentContexts（js 68860） */
export function useCodeCommentContexts({ listenAddToChatEvents = true, onContextRemoved, requestFocus, scopeKey }: { // 〔A1-R22〕补 export：JXe 双副本裁定——bundle 唯一真身 68860，本转录为逐字副本（canonical）；code-viewer/GitReview A1-R12 副本降 re-export（见该墓碑），Home 经 modules/GitReview 消费链不变
  listenAddToChatEvents?: boolean;
  onContextRemoved?: (comment: CodeCommentAttachment) => void;
  requestFocus?: () => void;
  scopeKey: string;
}) {
  const [contexts, setContexts] = React.useState<CodeCommentAttachment[]>([]);
  const contextsRef = React.useRef(contexts);
  const handlersRef = React.useRef({ onContextRemoved, requestFocus });
  const scopeKeyRef = React.useRef(scopeKey);
  handlersRef.current = { onContextRemoved, requestFocus };
  const replaceContexts = React.useCallback((next: CodeCommentAttachment[]) => {
      const nextKeys = new Set(next.map(codeCommentContextKey));
      for (const existing of contextsRef.current) nextKeys.has(codeCommentContextKey(existing)) || handlersRef.current.onContextRemoved?.(existing);
      ((contextsRef.current = next), setContexts(next));
    }, []),
    removeContext = React.useCallback(
      (comment: CodeCommentAttachment) => {
        const key = codeCommentContextKey(comment);
        const remaining = contextsRef.current.filter((entry) => codeCommentContextKey(entry) !== key);
        remaining.length !== contextsRef.current.length && replaceContexts(remaining);
      },
      [replaceContexts],
    ),
    clearContexts = React.useCallback(() => {
      contextsRef.current.length > 0 && replaceContexts([]);
    }, [replaceContexts]),
    getContexts = React.useCallback(() => contextsRef.current, []);
  return (
    React.useEffect(() => {
      scopeKeyRef.current !== scopeKey && ((scopeKeyRef.current = scopeKey), clearContexts());
    }, [clearContexts, scopeKey]),
    React.useEffect(() => {
      if (!listenAddToChatEvents || typeof window > `u`) return;
      const handleAdd = (event: Event) => {
          if (
            !isCodeCommentAddEvent(event) ||
            !isCodeCommentAddDetail((event as CustomEvent).detail) ||
            event.defaultPrevented ||
            !(event as CustomEvent).cancelable ||
            (event.preventDefault(), !event.defaultPrevented)
          )
            return;
          const incoming = { ...(event as CustomEvent<CodeCommentAttachment>).detail, id: (event as CustomEvent<CodeCommentAttachment>).detail.id ?? createCodeCommentId() };
          const incomingKey = codeCommentContextKey(incoming);
          const existingIndex = contextsRef.current.findIndex((entry) => codeCommentContextKey(entry) === incomingKey);
          (replaceContexts(existingIndex < 0 ? [...contextsRef.current, incoming] : contextsRef.current.map((entry, index) => (index === existingIndex ? incoming : entry))),
            handlersRef.current.requestFocus?.());
        },
        handleRemove = (event: Event) => {
          !isCodeCommentRemoveEvent(event) || !isCodeCommentRemoveDetail((event as CustomEvent).detail) || removeContext((event as CustomEvent).detail);
        };
      return (
        window.addEventListener(CODE_COMMENT_ADD_EVENT, handleAdd),
        window.addEventListener(CODE_COMMENT_REMOVE_EVENT, handleRemove),
        () => {
          (window.removeEventListener(CODE_COMMENT_ADD_EVENT, handleAdd), window.removeEventListener(CODE_COMMENT_REMOVE_EVENT, handleRemove));
        }
      );
    }, [replaceContexts, listenAddToChatEvents, removeContext]),
    React.useMemo(
      () => ({
        contexts,
        hasContexts: contexts.length > 0,
        removeContext,
        clearContexts,
        getContexts,
      }),
      [clearContexts, contexts, getContexts, removeContext],
    )
  );
}

/** YXe → isWebElementRemoveDetail（js 68926） */
function isWebElementRemoveDetail(detail: unknown): detail is { id: string; workspacePath: string; workspaceIdentity?: string | null } {
  const candidate = detail as { id?: unknown; workspacePath?: unknown; workspaceIdentity?: unknown };
  return (
    typeof detail == `object` &&
    !!detail &&
    typeof candidate.id == `string` &&
    candidate.id.length > 0 &&
    typeof candidate.workspacePath == `string` &&
    candidate.workspacePath.length > 0 &&
    (candidate.workspaceIdentity === void 0 || typeof candidate.workspaceIdentity == `string`)
  );
}

/** XXe → normalizeWebElementDetail（js 68936） */
function normalizeWebElementDetail(detail: unknown): (WebElementContext & { id: string }) | null { // 〔A1-R22〕型缝：归一面必携 id（`id ?? NXe()` 补齐，束真）；[B17] WebElementsChip 行键/移除面消费
  return isWebElementAddDetail(detail) ? { ...detail, id: detail.id ?? createWebElementId() } : null;
}

/** ZXe → useWebElementContexts（js 68940） */
export function useWebElementContexts({ // 〔A1-R21〕补 export：Home useWebContexts declare（68940 同身）收敛消费（函数声明提升，环安全）
  workspacePath,
  workspaceIdentity,
  listenAddToChatEvents = true,
  scopeId = null,
}: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  listenAddToChatEvents?: boolean;
  scopeId?: string | null;
}) {
  const [contexts, setContexts] = React.useState<Array<WebElementContext & { id: string }>>([]); // 〔A1-R22〕型缝：状态面仅收 XXe 归一条目（必携 id）；[B17] WebElementsChip 消费契约
  const workspaceKey = webElementWorkspaceKey(workspacePath, workspaceIdentity);
  React.useEffect(() => {
    setContexts([]);
  }, [scopeId, workspaceKey]);
  const removeContext = React.useCallback((id: string) => {
      setContexts((current) => current.filter((entry) => entry.id !== id));
    }, []),
    clearContexts = React.useCallback(() => {
      setContexts([]);
    }, []);
  return (
    React.useEffect(() => {
      if (!listenAddToChatEvents || typeof window > `u`) return;
      const handleAdd = (event: Event) => {
          if (!isWebElementAddEvent(event)) return;
          const normalized = normalizeWebElementDetail((event as CustomEvent).detail);
          normalized &&
            webElementWorkspaceKey(normalized.workspacePath, normalized.workspaceIdentity) === workspaceKey &&
            (event.preventDefault(),
            setContexts((current) =>
              current.findIndex((entry) => entry.id === normalized.id) < 0
                ? [...current, normalized]
                : current.map((entry) => (entry.id === normalized.id ? normalized : entry)),
            ));
        },
        handleRemove = (event: Event) => {
          isWebElementRemoveEvent(event) &&
            isWebElementRemoveDetail((event as CustomEvent).detail) &&
            webElementWorkspaceKey((event as CustomEvent).detail.workspacePath, (event as CustomEvent).detail.workspaceIdentity) === workspaceKey &&
            (event.preventDefault(), removeContext((event as CustomEvent).detail.id));
        };
      return (
        window.addEventListener(WEB_ELEMENT_ADD_EVENT, handleAdd),
        window.addEventListener(WEB_ELEMENT_REMOVE_EVENT, handleRemove),
        () => {
          (window.removeEventListener(WEB_ELEMENT_ADD_EVENT, handleAdd), window.removeEventListener(WEB_ELEMENT_REMOVE_EVENT, handleRemove));
        }
      );
    }, [listenAddToChatEvents, removeContext, workspaceKey]),
    React.useMemo(
      () => ({ contexts, hasContexts: contexts.length > 0, removeContext, clearContexts }),
      [clearContexts, contexts, removeContext],
    )
  );
}

/* ============================================================================
 * [B17] 上下文 chip 行（js 2827 + 89982–90178；A1-R22 逐字转录）
 *   bundle 区域 89982–90178 位于 composer 工具条（ait 89977）与草稿恢复（dit 90181）之间；
 *   消费面 = composer topContent（90781–90789）+ 用户消息行（112241–112244）。
 *   A0 时代 PaymentDeep §10 归属（pay_range 13378–13568）为误登——其本地副本零消费面，
 *   本批删除（见该处墓碑）；属主收归 Composer（[B14]/[B15]/[B16] 上下文域同族）。
 *   映射表（minified → 语义名 → bundle 行）：
 *     sit → webElementAccessibleLabel         (89982)
 *     cit → webElementDescriptor              (89985)
 *     lit → WebElementsChip                   (89989)  补 export：Home WebContextChipRow /
 *                                                        Conversation WebElementChips declare 收敛
 *     Ds  → isConversationSelectionReference  (2827)   F03 选择引用守护（koe 2720 同区）
 *     uit → SelectionsChip                    (90087)  补 export：Home ConversationSelectionChipRow /
 *                                                        Conversation ConversationSelectionChips declare 收敛
 *   行内消费：G=useIntlContext / Z=cn / X=Button / g=CloseIcon（X）/ o=WebElementPointerIcon
 *     （MousePointer2，imeComposition C 导出 Wt 11787）/ wye=WebElementIcon（Earth）/
 *     fbe=SelectionGlyphIcon（Quote）/ Kv=TrashIcon（Trash2）/ CN=HoverCardTooltip /
 *     wN=HoverCardTooltipTrigger / TN=HoverCardTooltipContent / $=react/jsx-runtime。
 *   JSX 保持编译形态。
 * ==========================================================================*/

/** sit → webElementAccessibleLabel（js 89982） */
function webElementAccessibleLabel(e: WebElementContext): string {
  return e.accessibleName || e.text || e.selector || e.tagName.toLowerCase();
}

/** cit → webElementDescriptor（js 89985） */
function webElementDescriptor(e: WebElementContext): string {
  let t = e.role ? `role=${e.role}` : null;
  return [e.tagName.toLowerCase(), t].filter(Boolean).join(` · `);
}

/** lit → WebElementsChip（js 89989） */
export function WebElementsChip({ contexts: e, contentAlign: t = `start`, onRemove: n, onRemoveAll: r }: {
  contexts: Array<WebElementContext & { id: string }>; // 〔A1-R22〕型缝：chip 契约——消费面均经 XXe 归一（90782）或 HXe 解析（112242，必携 parsed-web-element-* id）；行键/移除面按束真消费 e.id
  contentAlign?: `start` | `center` | `end`;
  onRemove?: (id: string) => void;
  onRemoveAll?: () => void;
}): React.ReactElement | null {
  let { intl: i } = useIntlContext();
  if (e.length === 0) return null;
  let a = i.formatMessage(
      { id: e.length === 1 ? `chat.webElements.one` : `chat.webElements.many` },
      { count: String(e.length) },
    ),
    s = i.formatMessage({ id: `chat.webElements.remove` });
  return (0, $.jsxs)(HoverCardTooltip, {
    children: [
      (0, $.jsx)(HoverCardTooltipTrigger, {
        asChild: !0,
        children: (0, $.jsxs)(`div`, {
          className: cn(
            `group flex h-8 max-w-full cursor-pointer select-none items-center gap-1.5`,
            `rounded-md border border-border bg-surface p-1`,
            `font-medium text-ui-base text-foreground transition-all hover:bg-surface-hover`,
            `outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`,
          ),
          "aria-label": a,
          role: `button`,
          tabIndex: 0,
          children: [
            (0, $.jsxs)(`span`, {
              className: `flex min-w-0 items-center gap-1.5 rounded-sm px-1`,
              children: [
                (0, $.jsx)(WebElementPointerIcon, { className: `size-4 shrink-0 text-foreground-subtle` }),
                (0, $.jsx)(`span`, { className: `truncate`, children: a }),
              ],
            }),
            r
              ? (0, $.jsx)(Button, {
                  type: `button`,
                  variant: `ghost`,
                  size: `icon-xs`,
                  className: `size-5 shrink-0 rounded-sm text-foreground-subtle opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100`,
                  "aria-label": s,
                  title: s,
                  onClick: (e: React.MouseEvent<HTMLButtonElement>) => { // 〔A1-R22〕型缝注参（Home §V 同约定）：Button 面上下文推不出参数形
                    (e.stopPropagation(), r());
                  },
                  children: (0, $.jsx)(CloseIcon, { className: `size-3.5` }),
                })
              : null,
          ],
        }),
      }),
      (0, $.jsx)(HoverCardTooltipContent, {
        align: t,
        side: `top`,
        className: `w-80 rounded-xl border border-popover-border bg-menu p-1 text-foreground shadow-md ring-0`,
        children: (0, $.jsx)(`div`, {
          className: `max-h-64 overflow-y-auto`,
          children: e.map((e) =>
            (0, $.jsxs)(
              `div`,
              {
                className: `group/context flex min-h-7 cursor-default gap-2 rounded-lg px-2 py-1 text-ui-base/relaxed text-foreground hover:bg-menu-hover`,
                children: [
                  (0, $.jsx)(WebElementIcon, { className: `mt-1 size-4 shrink-0 text-foreground-subtle` }),
                  (0, $.jsxs)(`div`, {
                    className: `min-w-0 flex-1`,
                    children: [
                      (0, $.jsx)(`div`, { className: `truncate font-medium`, children: webElementAccessibleLabel(e) }),
                      (0, $.jsx)(`div`, {
                        className: `truncate font-mono text-ui-base text-foreground-subtle`,
                        children: webElementDescriptor(e),
                      }),
                      (0, $.jsx)(`div`, {
                        className: `truncate text-ui-base text-foreground-subtlest`,
                        children: e.pageTitle || e.pageUrl,
                      }),
                    ],
                  }),
                  n
                    ? (0, $.jsx)(Button, {
                        type: `button`,
                        variant: `ghost`,
                        size: `icon-xs`,
                        className: `mt-0.5 size-5 shrink-0 rounded-sm text-foreground-subtle opacity-0 transition-opacity hover:text-foreground group-hover/context:opacity-100`,
                        "aria-label": s,
                        title: s,
                        onClick: (t: React.MouseEvent<HTMLButtonElement>) => { // 〔A1-R22〕型缝注参（同上）
                          (t.stopPropagation(), n(e.id));
                        },
                        children: (0, $.jsx)(TrashIcon, { className: `size-3.5` }),
                      })
                    : null,
                ],
              },
              e.id,
            ),
          ),
        }),
      }),
    ],
  });
}

/** Ds → isConversationSelectionReference（js 2827） */
function isConversationSelectionReference(e: ConversationSelection): e is ConversationSelection & {
  id: string;
  sourceSessionId: string;
  sourceRowId: number;
  text: string;
  contentType: string;
} {
  if (!e || typeof e != `object`) return !1;
  let t = e;
  return (
    typeof t.id == `string` &&
    typeof t.sourceSessionId == `string` &&
    typeof t.sourceRowId == `number` &&
    typeof t.text == `string` &&
    [`user`, `assistant`, `reasoning`, `tool`].includes(t.contentType ?? ``)
  );
}

/** uit → SelectionsChip（js 90087） */
export function SelectionsChip({ references: e, onRemove: t, onRemoveAll: n }: {
  references: ConversationSelection[];
  onRemove?: (id: string) => void;
  onRemoveAll?: () => void;
}): React.ReactElement | null {
  let { intl: r } = useIntlContext();
  if (e.length === 0) return null;
  let i = r.formatMessage({ id: `chat.selections.count` }, { count: String(e.length) }),
    a = r.formatMessage({ id: `chat.selections.remove` });
  return (0, $.jsxs)(HoverCardTooltip, {
    children: [
      (0, $.jsx)(HoverCardTooltipTrigger, {
        asChild: !0,
        children: (0, $.jsxs)(`div`, {
          role: `button`,
          tabIndex: 0,
          "aria-label": i,
          "data-conversation-selection-reference-count": e.length,
          className: `group flex h-8 max-w-full cursor-pointer select-none items-center gap-1.5 rounded-md border border-border bg-surface p-1 text-ui-base font-medium text-foreground transition-all hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`,
          children: [
            (0, $.jsxs)(`span`, {
              className: `flex min-w-0 items-center gap-1.5 rounded-sm px-1`,
              children: [
                (0, $.jsx)(SelectionGlyphIcon, { className: `size-4 shrink-0 text-foreground-subtle` }),
                (0, $.jsx)(`span`, { className: `truncate`, children: i }),
              ],
            }),
            n
              ? (0, $.jsx)(Button, {
                  type: `button`,
                  variant: `ghost`,
                  size: `icon-xs`,
                  className: `size-5 shrink-0 rounded-sm text-foreground-subtle opacity-0 transition-opacity group-hover:opacity-100`,
                  "aria-label": a,
                  onClick: (e: React.MouseEvent<HTMLButtonElement>) => { // 〔A1-R22〕型缝注参（同上）
                    (e.stopPropagation(), n());
                  },
                  children: (0, $.jsx)(CloseIcon, { className: `size-3.5` }),
                })
              : null,
          ],
        }),
      }),
      (0, $.jsx)(HoverCardTooltipContent, {
        align: `start`,
        side: `top`,
        className: `w-80 rounded-xl border border-popover-border bg-menu p-1 text-foreground shadow-md ring-0`,
        children: (0, $.jsx)(`div`, {
          className: `max-h-64 overflow-y-auto`,
          children: e.map((e, n) =>
            (0, $.jsxs)(
              `div`,
              {
                className: `group/reference flex gap-2 rounded-lg px-2 py-1.5 text-ui-base hover:bg-menu-hover`,
                children: [
                  (0, $.jsx)(SelectionGlyphIcon, { className: `mt-0.5 size-4 shrink-0 text-foreground-subtle` }),
                  (0, $.jsxs)(`div`, {
                    className: `min-w-0 flex-1`,
                    children: [
                      (0, $.jsx)(`div`, {
                        className: `line-clamp-3 whitespace-pre-wrap break-words`,
                        children: e.text,
                      }),
                      isConversationSelectionReference(e)
                        ? (0, $.jsxs)(`div`, {
                            className: `mt-0.5 text-ui-sm text-foreground-subtlest`,
                            children: [
                              r.formatMessage({ id: `chat.selections.type.${e.contentType}` }),
                              ` `,
                              `· #`,
                              e.sourceRowId,
                            ],
                          })
                        : null,
                    ],
                  }),
                  t && isConversationSelectionReference(e)
                    ? (0, $.jsx)(Button, {
                        type: `button`,
                        variant: `ghost`,
                        size: `icon-xs`,
                        className: `size-5 shrink-0 text-foreground-subtle opacity-0 group-hover/reference:opacity-100`,
                        "aria-label": a,
                        onClick: () => t(e.id),
                        children: (0, $.jsx)(TrashIcon, { className: `size-3.5` }),
                      })
                    : null,
                ],
              },
              isConversationSelectionReference(e) ? e.id : `${n}:${e.text}`,
            ),
          ),
        }),
      }),
    ],
  });
}
/* 〔A0-S4-4b〕[B16] PPTX 引用 chip 六实体（usePptxElementReferences/pptxReferenceLabel/PptxReferencesChip/
 * buildPptxPreviewNavigation/toPptxViewerTarget/usePptxPreviewOpener，原 7612–7852）整体迁出 →
 * components/composer/PptxReferencesChip.tsx。六实体原即模块私有，无 re-export 面。
 * §0 分配：pptx declare 五件（pptxScopeKey/isPptxElementAddEvent/matchesPptxElementScope/
 * mergePptxElementReference/PPTX_ELEMENT_ADD_EVENT_TYPE）+ PptxElementIcon 随迁；HoverCardRoot 复制；
 * isPptxElementAddDetail/buildPptxElementsMarkdown/extractPptxElementReferencesFromContent/
 * PptxElementAddDetail 留守（留守面消费）。 */

/** tZe → useSessionScopedReferences（js 69225） */
export function useSessionScopedReferences(args: { sessionId: string | null; workspaceKey: string }) { // 〔A0-S4-4b〕补 export：pptx 族迁出后消费（函数声明提升，环安全）。〔A1-R21〕sessionId 型缝放宽（见上方 F03 declare 注）：Home useConversationSelections declare 收敛消费
  const [references, setReferences] = React.useState<SessionScopedReference[]>(() => readSessionScopedReferences(args.sessionId, args.workspaceKey)); // 〔型缝 A1-R138〕declare 时代返回面 SessionScopedReference[] 之状态型显式登记（canonical any 面，编译期擦除）
  const [limitReason, setLimitReason] = React.useState(() => readSessionScopedLimitReason(args.sessionId, args.workspaceKey));
  React.useEffect(() => {
    (setReferences(readSessionScopedReferences(args.sessionId, args.workspaceKey)), setLimitReason(readSessionScopedLimitReason(args.sessionId, args.workspaceKey)));
  }, [args.sessionId, args.workspaceKey]);
  const updateReferences = React.useCallback(
    (updater: SessionScopedReference[] | ((current: SessionScopedReference[]) => SessionScopedReference[])) => {
      setReferences((current) => {
        const next = typeof updater == `function` ? updater(current) : updater;
        return (writeSessionScopedReferences(args.sessionId, args.workspaceKey, next), next);
      });
    },
    [args.sessionId, args.workspaceKey],
  );
  React.useEffect(() => {
    const handleChange = (event: Event) => {
      isSessionScopedReferencesChangedEvent(event) &&
        ((event as CustomEvent<{ targetSessionId: string; workspaceKey: string }>).detail.targetSessionId !== args.sessionId ||
          (event as CustomEvent<{ targetSessionId: string; workspaceKey: string }>).detail.workspaceKey !== args.workspaceKey ||
          (setReferences(readSessionScopedReferences(args.sessionId, args.workspaceKey)), setLimitReason(readSessionScopedLimitReason(args.sessionId, args.workspaceKey))));
    };
    return (window.addEventListener(sessionScopedReferencesChangedEventType(), handleChange), () => window.removeEventListener(sessionScopedReferencesChangedEventType(), handleChange));
  }, [args.sessionId, args.workspaceKey]);
  const removeReference = React.useCallback(
      (id: string) => {
        (updateReferences((current) => current.filter((entry) => entry.id !== id)), setLimitReason(null));
      },
      [updateReferences],
    ),
    clearReferences = React.useCallback(() => {
      (updateReferences([]), setLimitReason(null));
    }, [updateReferences]);
  return {
    references,
    limitReason,
    dismissLimitReason: React.useCallback(() => {
      (clearSessionScopedLimitReason(args.sessionId, args.workspaceKey), setLimitReason(null));
    }, [args.sessionId, args.workspaceKey]),
    removeReference,
    clearReferences,
  };
}

/* 〔A0-S4-4b〕[B16] 后台工作胶囊（BackgroundWork/countBackgroundWorks/BackgroundWorksCapsule/
 * BackgroundWorksCapsuleMemo，原 7899–7982）整体迁出 → components/composer/BackgroundWorksCapsule.tsx；
 * BACKGROUND_WORKS_TRIGGER_TESTID/AgentIcon/WorksCompactIcon 随迁。 */
export { BackgroundWorksCapsule } from '../components/composer/BackgroundWorksCapsule';
export type { BackgroundWork } from '../components/composer/BackgroundWorksCapsule';

/** XH → isCoarseTouchDevice（js 69346；登记终点 69297 外，裁决 §R2） */
export function isCoarseTouchDevice(): boolean {
  return typeof window > `u` || typeof window.matchMedia != `function`
    ? false
    : window.matchMedia(`(hover: none) and (pointer: coarse)`).matches;
}

/** ZH → shouldRestoreFocus（js 69351；同上） */
export function shouldRestoreFocus({ isCoarseTouchDevice: coarse }: { isCoarseTouchDevice: boolean }): boolean {
  return !coarse;
}

/* 〔A0-S4-4b〕[C] 模型选择器段（ModelSelector + 上下文环，原 7996–8741）整体迁出 →
 * components/composer/ModelSelector.tsx；[D] ConfigSelect + 思考级别解析族（原 8742–9132）整体迁出 →
 * components/composer/ConfigSelect.tsx。§0 分配：MODEL_SELECT_* testid/MODE_SELECT_ITEM_TESTID/
 * ProgressRoot/ProgressIndicator/motion/AnimatePresence/NestedTooltip 四件随 [C]（HoverCardRoot 复制）；
 * THOUGHT_LEVEL_* testid/PlanIcon 随 [D]。MODE_LABEL_I18N/MODE_DESCRIPTION_I18N/MODE_SELECT_ITEM_TESTID
 * 在 ModelSelector.tsx 补 export（[D] 消费）；testidOf/isCoarseTouchDevice/shouldRestoreFocus
 * 留守本文件补 export，组件侧 import 取回（函数声明提升，环安全）。 */
export { ModelSelector, SegmentedProgress, ContextUsageProvider, ContextRingTrigger, ContextRingTooltipContent, ContextRingTooltipBody } from '../components/composer/ModelSelector';
export type { ModelGroup } from '../components/composer/ModelSelector';
export { ConfigSelect, isDisabledThoughtOption, sortThoughtOptions, nextThoughtLevelValue, thoughtOptionLabel } from '../components/composer/ConfigSelect';
export type { ConfigSelectOption, ConfigSelectSpec } from '../components/composer/ConfigSelect';
/* ============================================================================
 * 文件尾符号表（供 SYMBOL-INDEX 增量抽取；js 主口径行号）
 * ========================================================================== */
/**
 * [A] pqe→useSubagentsContext 63490 | RB→skillContextRequestCache 63562 | zB→skillContextGeneration 63563 |
 * mqe→skillContextGenerationCounter 63564 | BB→skillContextCacheKey 63565 | VB→mergeSkillContextEntry 63568 |
 * hqe→dedupeSkillContextList 63571 | HB→loadSkillContext 63581 | UB→useSkillContextStore 63640 | WB→useSkillsContext 63680
 * [B1-B3] gqe→hasNonEmptyQuery | eqe→limitEmptySuggestions | tqe…（建议过滤/构建/触发解析，见文件头映射表 63752–65051）
 * [B4] mV→PromptMentionNode 64514 | hV→createMentionNode 64632 | gV→isMentionNode 64636
 * [B5] SV→SuggestionPanel 64687
 * [B6] SJe→SlashPanel 65052 | bJe→useSlashPanelSections | CV/wV/TV/EV/DV/OV/kV→编辑令牌 65040–65047 | xJe→token 跟踪 | AV→PluginMentionIcon
 * [B7] KJe→MentionSelector 65653 | AJe/FV/PJe/HJe/WJe→建议钩子 | MV…MJe→目录去重 | LV/RV/GJe→换行/夹取
 * [B8] zV→resolveTaskProvider 66094 | qJe→useActiveTaskProvider 66103 | JJe→appendPromptHistory 66112 | YJe→navigatePromptHistory 66118 |
 * BV→MOBILE_TEXT_INPUT_MEDIA_QUERY 66134 | XJe→matchesMediaQuery 66135 | ZJe→subscribeMediaQuery 66139 | QJe→isMobileTextInputViewportNow 66149 |
 * $Je→subscribeMobileTextInputViewport 66152 | VV→useIsMobileTextInputViewport 66155 | eYe→isEnterSubmitAllowed 66159 | tYe→submitShortcutKey 66162 |
 * nYe→isMobileWebRemoteInput 66165 | HV→inputTextClass 66167 | rYe→CJK_COMMA 66173 | iYe→SLASH_CHAR 66174 | aYe→canSubmitText 66175 |
 * oYe→isSubmitAccepted 66187 | sYe→isCjkCommaSlashInput 66188 | UV→readEditorText 66192 | WV→setEditorText 66199 | cYe→setEditorMention 66214 |
 * GV→applyEditorStateJson 66225 | KV→clearEditor 66229 | lYe→setSkillMentionContent 66232 | uYe→setSlashCommandMentionContent 66248 |
 * dYe→appendFileMentionContent 66264 | fYe→appendTextContent 66289 | pYe→findMentionIdAfterCaret 66302 | qV→mentionIdFromElement 66316 | mYe→focusAfterMention 66321
 * [B9] hYe→SubmitOnEnterPlugin 66333 | gYe→EditorChangeLogger 66411 | _Ye→EditableSyncPlugin 66451 | vYe→E2ELexicalBridgePlugin 66463 |
 * yYe→PromptHistoryNavigationPlugin 66507 | JV→isCaretAtEditorStart 66575 | bYe→CjkCommaSlashPlugin 66588 | xYe→PasteCapturePlugin 66623 |
 * SYe→EditorApiPlugin 66639 | CYe→LEXICAL_CHAT_INPUT_THEME 66666 | wYe→LexicalChatInput 66668 | TYe→PassthroughErrorBoundary 66808
 * [B10] YV→applyWorkspaceFileMentionDrop 66811 | EYe→hasExternalFiles 66822 | XV→useComposerFileDragDetection 66828 | DYe→buildActionMenuShortcuts 66886 |
 * OYe→onNextFrame 66893 | kYe→appendTriggerText 66899 | AYe→preventDefaultOnMouseDown 66904 | jYe→ComposerActionMenu 66907 | MYe→runOnNextFrame 67000 | ZV→ComposerInput 67007
 * [B11] NYe→NANOID_ALPHABET 67277 | QV→nanoid 67278 | PYe→LARGE_PASTED_TEXT_THRESHOLD 67282 | $V→MAX_INLINE_IMAGE_BYTES 67283 |
 * eH→TEXT_ATTACHMENT_PREVIEW_LIMIT 67284 | FYe→OversizedInlineImageAttachmentError 67285 | IYe→readFileAsDataUrl 67299 | LYe→createFileAttachment 67315 |
 * RYe→createLocalPathAttachment 67324 | zYe→createClipboardTextAttachment 67328 | BYe→isLargePastedText 67338 | VYe→SPREADSHEET_HTML_PATTERN 67340 |
 * HYe→prefersSpreadsheetText 67342 | UYe→pastedTextFilename 67346 | WYe→countLines 67349 | tH→revokeAttachmentObjectUrl 67371 | GYe→resolveAttachmentPayload 67374 |
 * KYe→readAttachmentBase64 67417 | nH→isImageAttachment 67424 | qYe→isTextLikeAttachment 67427 | JYe→readTextFilePreview 67434 | rH→guessMimeType 67439 |
 * YYe→basenameOfPath 67466 | XYe→formatPastedTextFilename 67469 | ZYe→resolveComposerPlaceholderKey 67473
 * [B12] QYe→PROMPT_HISTORY_STORAGE_PREFIX 67480 | iH→safeLocalStorage 67481 | aH→promptHistoryStorageKey 67489 | oH→sanitizePromptHistory 67492 |
 * sH→loadPromptHistory 67499 | cH→savePromptHistory 67509 | lH→resolveFocusStrategy 67514 | $Ye→DRAFT_STORAGE_PREFIX 67518 | eXe→DRAFT_SCOPE_ID 67519 |
 * uH→MAX_DRAFT_SCOPES 67520 | dH→safeDraftStorage 67521 | fH→draftStorageKey 67527 | pH→parseDraftStore 67532 | mH→persistDraftStore 67542 |
 * tXe→pruneDraftScopes 67559 | nXe→readDraftScope 67568 | hH→writeDraftScope 67574 | gH→deleteDraftScope 67581 | _H→pendingDraftTransfer 67587 |
 * vH→draftScopeWorkspaceKey 67588 | rXe→setPendingDraftTransfer 67591 | iXe→consumePendingDraftTransfer 67593
 * [B13] yH→useComposerAttachmentStore 67602 | bH→getScopeAttachments 67603 | aXe→updateScopeAttachments 67606 | oXe→encodeBase64Utf8 67616 |
 * sXe→estimateBase64Bytes 67623 | cXe→putAttachmentContent 67627 | lXe→EMPTY_ATTACHMENTS 67646 | xH→REMOTE_ATTACHMENT_NOT_STAGED 67647 | uXe→selectAttachmentPaths 67648 |
 * dXe→attachmentScopeKey 67653 | SH→isAbortError 67656 | fXe→RemoteAttachmentNotStagedError 67663 | pXe→isTransientUploadError 67666 | CH→uploadProgressPercent 67673 |
 * wH→isRemoteAttachmentTarget 67676 | mXe→useComposerAttachments 67679
 * [B14] hXe→codeCommentKey 68295 | TH→CodeCommentsChip 68298（A1-R22 逐字化 + 补 export） | EH→CODE_COMMENT_ADD_EVENT 68411 | DH→CODE_COMMENT_REMOVE_EVENT 68412 |
 * gXe→CODE_COMMENT_REMOVE_CHANNEL 68413 | OH→suppressedCodeCommentIds 68414 | kH→commentWorkspaceKey 68415 | AH→codeCommentIdentityKey 68418 | _Xe→isCodeCommentSuppressed 68421 |
 * jH→suppressCodeComment 68424 | vXe→unsuppressCodeComment 68427 | yXe→isCodeCommentAddEvent 68430 | bXe→isCodeCommentRemoveEvent 68438 | MH→isCodeCommentRemoveDetail 68446 |
 * NH→isCodeCommentAddDetail 68457 | xXe→formatCodeCommentMarkdown 68475 | SXe→formatCodeCommentsMarkdown 68479 | CXe→appendCodeCommentsToContent 68486 | wXe→pathBasename 68499 |
 * TXe→parseLineRange 68502 | EXe→parseCodeCommentMarkdown 68510 | DXe→extractCodeCommentsFromContent 68536 | OXe→dispatchCodeCommentAddEvent 68551 | kXe→dispatchCodeCommentRemoveEvent 68555 |
 * AXe→EMPTY_COMMENTS 68558 | PH→commentBucketKey 68559 | FH→useCodeCommentsStore 68562 | jXe→removeCodeCommentEverywhere 68628
 * [B15] IH→WEB_ELEMENT_ADD_EVENT 68643 | LH→WEB_ELEMENT_REMOVE_EVENT 68644 | MXe→WEB_ELEMENTS_MARKDOWN_HEADER 68645 | RH→WEB_ELEMENT_TEXT_LIMIT 68646 |
 * NXe→createWebElementId 68648 | zH→webElementWorkspaceKey 68653 | PXe→isWebElementAddEvent 68656 | FXe→isWebElementRemoveEvent 68663 | BH→isWebElementAddDetail 68670 |
 * VH→truncateWebElementText 68686 | HH→pushWebElementField 68691 | IXe→formatWebElementAttributes 68695 | LXe→formatWebElementFont 68703 | RXe→formatWebElementMarkdown 68707 |
 * zXe→appendWebElementsToContent 68737 | UH→readWebElementField 68749 | WH→readWebElementCodeField 68752 | BXe→parseWebElementFont 68761 | VXe→parseWebElementStyle 68766 |
 * HXe→parseWebElementMarkdown 68781 | UXe→extractWebElementsFromContent 68805 | WXe→dispatchWebElementAddEvent 68824
 * [B16] GH→countComposerContexts 68825 | GXe→buildComposerContextMarkdown 68833 | KXe→parseComposerContextContent 68839 | qXe→createCodeCommentId 68852 |
 * KH→codeCommentContextKey 68857（A1-R22 补 export） | JXe→useCodeCommentContexts 68860（A1-R22 补 export，JXe 双副本裁定 canonical） | YXe→isWebElementRemoveDetail 68926 | XXe→normalizeWebElementDetail 68936 | ZXe→useWebElementContexts 68940 |
 * QXe→usePptxElementReferences 68996 | qH→pptxReferenceLabel 69033 | JH→PptxReferencesChip 69036 | $Xe→buildPptxPreviewNavigation 69181 | eZe→toPptxViewerTarget 69194 |
 * YH→usePptxPreviewOpener 69207 | tZe→useSessionScopedReferences 69225 | nZe→countBackgroundWorks 69266 | rZe→BackgroundWorksCapsule 69273 | iZe→BackgroundWorksCapsuleMemo 69345 |
 * XH→isCoarseTouchDevice 69346 | ZH→shouldRestoreFocus 69351
 * [B17] sit→webElementAccessibleLabel 89982 | cit→webElementDescriptor 89985 | lit→WebElementsChip 89989（补 export） | Ds→isConversationSelectionReference 2827 | uit→SelectionsChip 90087（补 export）
 * [C] N4e→LABEL_ANIMATION_TRANSITION 75494 | P4e→usePrefersReducedMotion 75496 | _q→AnimatedLabel 75520 | F4e→EMPTY_FOOTER_ACTIONS 75556 | I4e→hasMultipleGroups 75557 |
 * L4e→hasGroupDecoration 75560 | R4e→needsGroupSeparator 75565 | z4e→groupContainsValue 75568 | B4e→resolveTriggerLabelClass 75571 | vq→ModelSelector 75575 |
 * V4e→MODE_LABEL_I18N 75972 | H4e→MODE_DESCRIPTION_I18N 76002 | yq→SegmentedProgress 76034 | bq→CONTEXT_RING_RADIUS 76066 | U4e→CONTEXT_RING_VIEWBOX 76067 |
 * xq→CONTEXT_RING_CENTER 76068 | W4e→CONTEXT_RING_STROKE_WIDTH 76069 | G4e→ContextUsageContext 76071 | K4e→usageRatio 76072 | q4e→useContextUsage 76075 |
 * J4e→ContextUsageProvider 76079 | Y4e→ContextRingGlyph 76089 | X4e→ContextRingTrigger 76125 | Z4e→ContextRingTooltipContent 76139 | Q4e→ContextRingTooltipBody 76147
 * [D] M3e→isOptionValue 76848 | N3e→DANGEROUS_MODE_VALUES 76851 | P3e→configSelectTestId 76852 | F3e→configOptionTestId 76856 | I3e→ApiRetryIndicator 76860 |
 * L3e→modeOptionLabel 76880 | R3e→modeLabelI18nId 76883 | z3e→modeDescriptionI18nId 76886 | jq→configOptionLabel 76889 | B3e→configOptionDescription 76892 |
 * V3e→isDangerousModeValue 76897 | H3e→modeOptionIcon 76900 | Mq→ConfigSelect 76911 | U3e→THOUGHT_LEVEL_DISABLED_VALUES 77062 | W3e→THOUGHT_LEVEL_RANKS 77063 |
 * G3e→THOUGHT_LEVEL_LABEL_I18N 77094 | Nq→normalizeThoughtLevelKey 77127 | K3e→isDisabledThoughtOption 77130 | q3e→thoughtOptionRank 77133 | J3e→sortThoughtOptions 77141 |
 * Y3e→nextThoughtLevelValue 77155 | X3e→thoughtOptionLabel 77163
 */
