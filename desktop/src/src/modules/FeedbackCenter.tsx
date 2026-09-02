/* eslint-disable */
/**
 * ============================================================================
 * FeedbackCenter.tsx — ZCode 3.7.6 反馈中心 F09（RMe 族）逐字重建（B5-03）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,979 行，未改动）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：COVERAGE-LEDGER §c #9（反馈中心 RMe）+ B5-FULL-DECODE-PLAN 批次 #3。
 *
 * 行号口径：本文件 js 行号 = 当前融合 chunk 行号。注意：当前 chunk 较旧账（213,695 行）
 * 在本区段之前插入了 48 行（去品牌提交 cb2ab75），故旧账行号一律 +48 对本文件成立
 * （旧 37067→37115、旧 39107→39155、旧 40396→40444、旧 41892→41940）。
 *
 * 范围（当前行号）：
 *   37093–39298  反馈中心全族（37093–37114 状态徽章 Bje/Vje 起；截图/表单原语/
 *                提交作业引擎/提交表单/功能请求/我的工单/后台指示卡/根 RMe）
 *                + F07 邻接助手 zMe/BMe
 *   39455        JMe 可见性守卫（F07 助手，WorkspaceShell.tsx 已 declare）
 *   39459–39460  uw logo dataURI / dw 附件分块字节（lw 已在 TopBar.tsx，见边界注记）
 *   39461–40444  附件上传协议 + v4 会话传输/快照存储/数据层（会话运行时域）
 * 排除（只注记）：
 *   37040–37092  yC FeedbackStore → stores-core.tsx §3
 *   37139–37172  xC/SC/CC/Wje/wC 联系持久化 → stores-core.tsx §3（TC 除外，见 §2）
 *   39299–39453  设置导航状态机 → Settings.tsx §2
 *   39458        lw PRODUCT_DOCS_URL → TopBar.tsx
 *   40445–41855  遥测下沉 29 函数 → StoresDeep.tsx §H
 *   41856–41940  遥测 fact 助手 uT/dT/fT/pT/fFe/pFe/mFe/mT → services.tsx（已抽取）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  [状态呈现]
 *   Bje  → TICKET_STATUS_STYLES          (37093)
 *   Vje  → TICKET_STATUS_I18N_KEYS       (37104)
 *   Hje  → formatTicketStatus            (37115)
 *   Uje  → TicketStatusBadge             (37118)
 *   bC   → FeedbackErrorBanner           (37129)
 *  [联系方式持久化]（xC/SC/CC/Wje/wC 已在 stores-core.tsx §3；本文件仅补 TC）
 *   TC   → persistFeedbackContact        (37172)
 *  [截图]
 *   Gje  → ScreenshotPicker              (37175)
 *   Kje  → ScreenshotGridItem            (37294)
 *   qje  → readScreenshotFile            (37320)
 *   EC   → screenshotDataUrl             (37342)
 *  [表单原语]
 *   DC   → FeedbackSwitch                (37345)
 *   OC   → UploadProgressRow             (37360)
 *   Jje  → DescriptionField              (37394)
 *   Yje  → ContactField                  (37411)
 *   Xje  → LogsToggleRow                 (37430)
 *   Zje  → SubmitActionBar               (37465)
 *   kC   → FormSection                   (37530)
 *   AC   → FormFieldBody                 (37548)
 *   Qje  → CharCount                     (37559)
 *   $je  → SCROLL_FADE_CLASSES           (37565)
 *   jC   → FadeScrollArea                (37571)
 *  [模型上下文 / 错误归一]
 *   eMe  → MODEL_OPTIONS_PREVIEW_LIMIT=12 (37630)
 *   tMe  → collectModelContext           (37631)
 *   MC   → extractErrorMessage           (37651)
 *  [提交作业引擎]
 *   NC   → DEFAULT_SUBMISSION_COPY       (37656)
 *   nMe  → submissionJobSeq              (37679)
 *   PC   → submissionJobsById            (37680)
 *   FC   → submissionRegistryListeners   (37681)
 *   IC   → snapshotSubmissionJobs        (37682)
 *   LC   → notifySubmissionRegistry      (37685)
 *   rMe  → getSubmissionJobs             (37689)
 *   iMe  → subscribeSubmissionJobs       (37692)
 *   RC   → dismissSubmissionJob          (37703)
 *   aMe  → getSubmissionJobById          (37706)
 *   zC   → cancelJobBeforeTicket         (37709)
 *   oMe  → createFeedbackSubmissionJob   (37723)
 *   sMe  → freezeFormDraft               (37898)
 *   cMe  → displaySubmissionError        (37902)
 *   BC   → FeedbackSubmissionCanceledError (37911)
 *   lMe  → uploadFullLogWithResume       (37916)
 *   VC   → formatBytes                   (37992)
 *   uMe  → mapUploadProgress             (37999)
 *   dMe  → isUploadCanceledError         (38021)
 *   HC   → useSubmissionCopy             (38024)
 *  [提交表单]
 *   fMe  → TITLE_MAX_LENGTH=80           (38052)
 *   pMe  → TICKET_AGENT_NAME='Nofy Agent' (38053)  REBRAND-014+114
 *   mMe  → deriveTicketTitle             (38054)
 *   hMe  → buildFeedbackDescription     (38064)
 *   gMe  → DEVICE_AGENT_PROVIDER='Nofy Agent' (38089)  REBRAND-015+115
 *   _Me  → DEFAULT_SEVERITY='P2-中'      (38090)
 *   vMe  → DEFAULT_MODULE='其它'         (38091)
 *   UC   → startFeedbackSubmission       (38092)
 *   yMe  → DESCRIPTION_MAX_LENGTH=4000   (38162)
 *   bMe  → CONTACT_MAX_LENGTH=200        (38163)
 *   WC   → SCREENSHOT_MAX_COUNT=5        (38164)
 *   xMe  → hasFeedbackAttachments         (38165)
 *   SMe  → FeedbackSubmitForm            (38168)
 *   CMe  → isTextEditingTarget           (38389)
 *   wMe  → useFeedbackModelContext       (38394)
 *  [功能请求]
 *   GC   → FEATURE_FIELD_MAX=2000        (38400)
 *   TMe  → FEATURE_CONTACT_MAX=200       (38401)
 *   EMe  → FeatureRequestDialog          (38402)
 *   KC   → FeatureRequestField           (38637)
 *   DMe  → buildFeatureRequestDescription (38677)
 *  [我的工单]
 *   qC   → formatRelativeTime            (38690)
 *   OMe  → FeedbackTicketsView           (38717)
 *   kMe  → TicketsLoadingPlaceholder     (38827)
 *   AMe  → TicketList                    (38837)
 *   jMe  → TicketsEmptyState             (38924)
 *  [后台提交指示]
 *   MMe  → SUCCESS_CARD_TTL_MS=5000      (38952)
 *   NMe  → isJobSettledWithTicket        (38953)
 *   PMe  → jobOpenTarget                 (38956)
 *   FMe  → FeedbackBackgroundJobHost    (38961)
 *   IMe  → BackgroundJobCard             (38980)
 *   LMe  → BackgroundJobIndicator        (39014)
 *  [根]
 *   RMe  → FeedbackCenter（memo 根）     (39155)
 *  [F07 邻接助手（行段在 F09 包络内，归属 F07；WorkspaceShell.tsx 已 declare）]
 *   zMe  → resolveAdjacentTasks          (39254)
 *   BMe  → collectWorkspaceTaskIds       (39268)
 *   JMe  → runWithWorkspaceVisibility    (39455)
 *  [常量（邻接）]
 *   uw   → APP_LOGO_DATA_URL             (39459)  REBRAND-003+103
 *   dw   → ATTACHMENT_CHUNK_BYTES=384KB  (39460)
 *  [附件上传协议]
 *   fw   → throwIfUploadAborted          (39461)
 *   YMe  → base64ToBytes                 (39466)
 *   XMe  → base64ByteLength              (39472)
 *   ZMe  → bytesToBase64                 (39492)
 *   QMe  → sha256Checksum                (39498)
 *   $Me  → newUploadId                   (39503)
 *   eNe  → measureAttachmentFrameBytes   (39508)
 *   pw   → assertFrameWithinLimit        (39512)
 *   tNe  → uploadAttachmentChunkedV4     (39515)
 *  [v4 会话运行时（会话数据层域；ExtendedViews/services 曾接口级登记）]
 *   mw   → createConversationTransport   (39582)
 *   nNe  → INITIAL_SNAPSHOT_STORE_STATE  (39781)
 *   rNe  → TERMINAL_COMMAND_STATUSES     (39793)
 *   iNe  → frameBumpsPlanDirectory       (39794)
 *   aNe  → frameBumpsTurnNavigator       (39804)
 *   hw   → hasOlderRows                  (39814)
 *   oNe  → isFirstTurnHeaderMissing      (39819)
 *   gw   → prependOlderRows              (39824)
 *   sNe  → ConversationSnapshotStore     (39829)
 *   cNe  → KEEP_WARM_MS_DEFAULT=30000    (40329)
 *   lNe  → KEEP_WARM_MS_E2E=1000         (40330)
 *   uNe  → resolveKeepWarmMs             (40331)
 *   _w   → ConversationDataLayer         (40334)
 *   vw   → dataLayerEntriesByKey         (40390)
 *   dNe  → DATA_LAYER_KEEP_WARM_MS=30000 (40391)
 *   fNe  → dataLayerKey                  (40392)
 *   yw   → disposeDataLayerEntry         (40396)
 *   pNe  → releaseDataLayerEntry         (40400)
 *   mNe  → acquireConversationDataLayer  (40411)
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/feedback/FeedbackCenter.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  TICKET_STATUS_STYLES,
  TICKET_STATUS_I18N_KEYS,
  formatTicketStatus,
  TicketStatusBadge,
  FeedbackErrorBanner,
  persistFeedbackContact,
  screenshotDataUrl,
  readScreenshotFile,
  ScreenshotGridItem,
  ScreenshotPicker,
  FeedbackSwitch,
  UploadProgressRow,
  FormSection,
  FormFieldBody,
  CharCount,
  DescriptionField,
  ContactField,
  LogsToggleRow,
  SubmitActionBar,
  SCROLL_FADE_CLASSES,
  FadeScrollArea,
  MODEL_OPTIONS_PREVIEW_LIMIT,
  collectModelContext,
  extractErrorMessage,
  DEFAULT_SUBMISSION_COPY,
  FeedbackSubmissionCanceledError,
  snapshotSubmissionJobs,
  notifySubmissionRegistry,
  getSubmissionJobs,
  subscribeSubmissionJobs,
  dismissSubmissionJob,
  getSubmissionJobById,
  cancelJobBeforeTicket,
  freezeFormDraft,
  displaySubmissionError,
  formatBytes,
  mapUploadProgress,
  isUploadCanceledError,
  useSubmissionCopy,
  createFeedbackSubmissionJob,
  TITLE_MAX_LENGTH,
  deriveTicketTitle,
  buildFeedbackDescription,
  startFeedbackSubmission,
  DESCRIPTION_MAX_LENGTH,
  CONTACT_MAX_LENGTH,
  SCREENSHOT_MAX_COUNT,
  hasFeedbackAttachments,
  isTextEditingTarget,
  useFeedbackModelContext,
  FeedbackSubmitForm,
  FEATURE_FIELD_MAX,
  FEATURE_CONTACT_MAX,
  FeatureRequestField,
  buildFeatureRequestDescription,
  FeatureRequestDialog,
  formatRelativeTime,
  TicketsLoadingPlaceholder,
  TicketList,
  TicketsEmptyState,
  FeedbackTicketsView,
  SUCCESS_CARD_TTL_MS,
  isJobSettledWithTicket,
  jobOpenTarget,
  BackgroundJobIndicator,
  BackgroundJobCard,
  FeedbackBackgroundJobHost,
  FeedbackCenter,
  resolveAdjacentTasks,
  collectWorkspaceTaskIds,
  runWithWorkspaceVisibility,
  APP_LOGO_DATA_URL,
  ATTACHMENT_CHUNK_BYTES,
  throwIfUploadAborted,
  base64ToBytes,
  base64ByteLength,
  bytesToBase64,
  sha256Checksum,
  newUploadId,
  measureAttachmentFrameBytes,
  assertFrameWithinLimit,
  uploadAttachmentChunkedV4,
  createConversationTransport,
  INITIAL_SNAPSHOT_STORE_STATE,
  frameBumpsPlanDirectory,
  frameBumpsTurnNavigator,
  hasOlderRows,
  isFirstTurnHeaderMissing,
  prependOlderRows,
  ConversationSnapshotStore,
  resolveKeepWarmMs,
  ConversationDataLayer,
  dataLayerKey,
  disposeDataLayerEntry,
  releaseDataLayerEntry,
  acquireConversationDataLayer,
} from '../components/feedback/FeedbackCenter';
export type {
  FeedbackScreenshot,
  FeedbackUploadScreenshot,
  FeedbackTicket,
  FeedbackTicketInput,
  FeedbackService,
  UploadProgressEvent,
  ConfigOptionItem,
  FeedbackModelContext,
  FeedbackJobStatus,
  FeedbackProgress,
  FeedbackSubmissionJobState,
  FeedbackFormDraft,
  FeedbackSubmissionCopy,
  FeedbackSubmissionJob,
  SubmissionJobSnapshot,
  FeedbackSubmissionJobInput,
  StartFeedbackSubmissionArgs,
  AttachmentPutInput,
  AttachmentPutOptions,
  SessionRow,
  SessionDelta,
  SessionSnapshot,
  SessionPlan,
  DeliveryKind,
  ConversationFrame,
  AssemblyFault,
  AgentServiceV4,
  ConversationTransport,
  SnapshotStoreState,
  TurnNavigatorHydrationResult,
} from '../components/feedback/FeedbackCenter';
