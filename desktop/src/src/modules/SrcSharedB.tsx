/* eslint-disable */
/**
 * ============================================================================
 * SrcSharedB.tsx — src-HCld2afU 共享 chunk 下半部全量重建（B5-10b · 解混淆逐字重建）
 * ============================================================================
 *
 * 解码对象（主口径，行号即本文件行号基准）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/src-HCld2afU.jsx
 *   （9,742 行 pretty 孪生；本文件覆盖 jsx 4901–9742，含 9742 行对外 export 块）
 * 原件参照（只读，未改动，md5 f5edd6a1207c6d20008204829dad3923）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/src-HCld2afU.js（10,069 行）
 * 并行批次：B5-10a（jsx 1–4900 → SrcSharedA.tsx）。本文件与之行号互斥；
 *   下半对上半符号的引用一律按「跨批次 import」处理（§0 declare 挂接，报告注记）。
 *
 * chunk 性质：ZCode 桌面端共享底座（~400 符号）：zod-mini 运行时（上半，vendored 变体）+
 *   first-party 协议/模型目录/会话事件/远控桥/testid/工具解析/权限视图模型等。
 *   下半（本文件）= first-party 主体：模型目录助手、ZCode Protocol 会话事件、
 *   RPC 方法表、流传输限幅与帧协议、任务流镜像、远控桥协议、agent 宿主命令/事件、
 *   任务快照、消息可见性分类、testid 常量群（242 个）、编码计划作用域、
 *   会话模式设置、OAuth 家族、MCP 归一化、工具输入/todo/权限解析、环境解析。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：jsx 行 / js 行；完整双行号见报告 §1）
 * ----------------------------------------------------------------------------
 * [S1] 模型目录 schema 与助手（jsx 4901–5242）：
 *   Rl→CatalogModelSchema(4902/4807 区) zl→CatalogProviderSchema(4916/4831 区)
 *   Bl→CatalogModelEntrySchema(4928/4807) Vl→ProviderSourceEnum(4935/4814)
 *   Hl→ProviderSystemDisabledReasonEnum(4936/4815) Ul→ProviderEndpointsSchema(4937/4822)
 *   Wl→ProviderEndpointsOverrideSchema(4942/4823) Gl→ProviderConfigEntryListSchema(4970/4851)
 *   Kl→isProviderEnabled(5001/4879) ql→isProviderReadyForUse(5004/4882)
 *   Jl→hasAnyReadyProvider(5013/4894) Yl→MODEL_CONTEXT_WINDOW_DEFAULT(5016/4897)
 *   Xl→MODEL_CONTEXT_WINDOW_FALLBACK(5017/4898) Zl→MODEL_CONTEXT_WINDOW_UNLIMITED(5018/4899)
 *   Ql→isUnlimitedContextModelId(5019/4900) $l→resolveModelContextWindow(5022/4903)
 *   eu→normalizeProviderId(5028/4909) tu→isObjectRecord(5031/4912)
 *   nu→resolveModelDisplayName(5034/4915) ru→listProviderModelIds(5037/4918)
 *   iu→findProviderModel(5040/4926) au→dedupeStrings(5044/4930)
 *   ou→mapModelFormatToKind(5047/4933) su→mapKindToModelFormat(5059/4945)
 *   cu→normalizeCatalogModel(5069/4955) lu→resolveProviderDefaultKind(5110/4977)
 *   uu→mapKindToApiFormat(5125/4992) du→mapApiFormatToKind(5135/5002)
 *   fu→mapKindToDefaultEndpointPath(5145/5012) pu→isHttpUrl(5155/5022)
 *   mu→normalizeEndpointBaseUrl(5163/5030) hu→joinEndpointUrlParts(5179/5046)
 *   gu→stripKnownEndpointPathSuffix(5184/5059) _u→canonicalizeEndpointUrl(5197/5073)
 *   vu→resolveProviderKindEndpointUrl(5200/5076) yu→listEndpointKinds(5205/5083)
 *   bu→hasOwnPropertySafe(5210/5093) xu→listEndpointApiFormats(5213/5096)
 *   Su→mapApiFormatToModelFormats(5218/5106) Cu→resolveProviderApiFormat(5228/5116)
 *   wu→resolveProviderPrimaryEndpointUrl(5231/5131) Tu→resolveModelSupportedKinds(5238/5138)
 * [S2] 协议基元（5243–5292）：
 *   Eu→ZCODE_PROTOCOL_NAME(5243/5147) G→NonEmptyTrimmedStringSchema(5244/5148)
 *   K→JsonObjectRecordSchema(5245/5149) q→NonNegativeIntegerSchema(5246/5150)
 *   Du→TimestampValueSchema(5247/5151) Ou→NodeReplImagesDisplaySchema(5249/5153)
 *   ku→ToolResultDisplaySchema(5257/5161) Au→StringOrIntegerIdSchema(5265/5169)
 *   ju→TraceContextSchema(5266/5170)
 * [S3] 协议数据 schema（5293–5493）：
 *   Mu→AgentResourceSampleSchema(5293/5187) Nu→MessageInputSourceEnum(5302/5227)
 *   Pu→SessionPersistenceEnum(5303/5228) Fu→PermissionOptionSchema(5304/5229)
 *   Iu→NameValueEntrySchema(5311/5230) Lu→McpOAuthConfigSchema(5315/5231)
 *   Ru→McpServerConfigSchema(5329/5248) zu→McpServerStatusSchema(5347/5269)
 *   Bu→McpConnectionActionEnum(5360/5280) Vu→ImportedHistoryMessageSchema(5368/5283)
 *   Hu→ImportedClaudeHistorySchema(5373/5284) Uu→ThoughtLevelOptionSchema(5380/5291)
 *   Wu→ReasoningLevelConfigSchema(5385/5292) Gu→AvailableModelEntrySchema(5391/5298)
 *   Ku→RuntimeProviderKindEnum(5407/5314) qu→RuntimeApiFormatEnum(5408/5315)
 *   Ju→RuntimeProviderSourceEnum(5409/5316) Yu→ApiKeyReferenceSchema(5410/5317)
 *   Xu→ApiKeyMaterialSchema(5423/5323) Zu→RuntimeModelEntrySchema(5436/5329)
 *   Qu→RuntimeProviderWithKeyRefSchema(5450/5343) $u→RuntimeProviderWithInlineKeySchema(5467/5360)
 *   J→RuntimeModelSelectionSchema(5482/5375)
 * [S4] 供应商视图模型构建（5494–5692）：
 *   ed→trimProviderEndpoints(5494/5383) td→resolveProviderEndpointBundle(5505/5392)
 *   nd→resolveProviderSourceBucket(5515/5398) rd→resolveProviderModelFormats(5518/5407)
 *   id→resolveCatalogModelEntry(5522/5413) ad→trimHeaderRecord(5542/5425)
 *   od→capitalizeLabel(5547/5434) sd→modelSupportsKind(5551/5438)
 *   cd→buildReasoningViewModel(5554/5441) ld→buildProviderOptionsByLevel(5574/5454)
 *   ud→providerOptionsKeyForKind(5585/5463) dd→buildReasoningProviderOptions(5595/5473)
 *   fd→setNestedOptionValue(5601/5479) pd→deleteNestedOptionValue(5612/5490)
 *   md→resolveModelIdForKind(5622/5500) hd→VISION_INPUT_MODALITIES(5625/5503)
 *   gd→isModelsDevSourcedProvider(5626/5504) _d→modelAcceptsVisionInput(5629/5510)
 *   vd→providerSupportsVisionModels(5632/5513) yd→buildRuntimeProviderFromConfig(5635/5516)
 * [S5] 会话快照与事件载荷 schema（5694–6031）：
 *   bd→ModelCatalogSnapshotSchema(5694/5570) xd→TodoItemSchema(5702/5578)
 *   Sd→GoalStatsSchema(5707/5583) Cd→TodoGroupSchema(5716/5592)
 *   wd→SessionSettingsStateSchema(5725/5601) Td→PendingPermissionRequestSchema(5746/5615)
 *   Ed→ActiveToolCallSchema(5757/5626) Dd→SessionProjectionSchema(5763/5632)
 *   Od→SlashCommandSchema(5783/5649) kd→ModelStreamEventKindEnum(5789/5655)
 *   Ad→ModelStreamingPayloadSchema(5790/5670) jd→SessionSnapshotSchema(5801/5681)
 *   Md→SessionEventEnvelopeBaseSchema(5816/5693) Nd→SerializedErrorSchema(5826/5729)
 *   Pd→SessionCreatedPayloadSchema(5835/5738) Fd→SessionResumedPayloadSchema(5839/5739)
 *   Id→SessionTitleUpdatedPayloadSchema(5848/5748) Ld→TurnStartedPayloadSchema(5855/5755)
 *   Rd→PLAN_APPROVAL_FEEDBACK_SOURCE(5870/5770) zd→SteerCommandKindEnum(5871/5771)
 *   Bd→SteerDeliveryModeEnum(5872/5772) Vd→TurnSteerQueuedPayloadSchema(5873/5773)
 *   Hd→TurnSteerDrainedPayloadSchema(5888/5788) Ud→TurnCompletedPayloadSchema(5902/5804)
 *   Wd→TurnFailedPayloadSchema(5918/5829) Gd→MessageUpsertedPayloadSchema(5923/5830)
 *   Kd→MessageRemovedPayloadSchema(5930/5837) qd→PartDeltaPayloadSchema(5934/5838)
 *   Jd→PartSnapshotPayloadSchema(5940/5844) Yd→PartRemovedPayloadSchema(5943/5845)
 *   Xd→ToolUpdateBaseSchema(5948/5846) Zd→ToolUpdatedPayloadSchema(5959/5857)
 *   Qd→PermissionRequestedPayloadSchema(5998/5891) $d→PermissionResolvedPayloadSchema(6009/5902)
 *   ef→UserInputRequestedPayloadSchema(6018/5911) tf→UserInputResolvedPayloadSchema(6024/5917)
 *   nf→SessionClosedPayloadSchema(6029/5918)
 * [S6] 会话事件并集与子代理（6032–6094）：
 *   Y→sessionEvent(6032/5919) rf→SessionEventSchema(6038/5922)
 *   af→SubagentSessionBaseSchema(6064/5973) of→ActiveSubagentSchema(6074/5983)
 *   sf→EndedSubagentSchema(6077/5984) cf→WorkspaceStateSchema(6090/5991)
 * [S7] 会话 RPC 请求/响应 schema（6094–6857，多为匿名表达式，见正文注释）：
 *   lf→PREFLIGHT_PROTOCOL_VERSION(6159/6062) uf→ModelContextBudgetStrategyEnum(6160/6063)
 *   df→BrowserAmbientContextSchema(6168/6071) ff→GoalQueueActionEnum(6241/6150)
 *   pf→BackgroundTaskStatusEnum(6255/6160) mf→BackgroundTaskSchema(6256/6161)
 *   hf→WorkspaceProviderRegistrySchema(6332/6224) gf→ProviderRegistryApplyStatusEnum(6337/6225)
 * [S8] RPC 方法目录：Pf→ZcodeRpcMethods(6797/6651)
 * [S9] 流传输限幅与 RPC 分帧（6857–6992）：
 *   Ff→StreamRowKeySchema(6857/6711) If→StreamTimestampSchema(6861/6712)
 *   Lf→StreamTextFieldEnum(6862/6713) Rf→STREAM_TRANSPORT_LIMITS(6863/6714)
 *   zf→Base64StringSchema(6893/6744) Bf→crc32Hex(6894/6747) Vf→BASE64_ALPHABET(6902/6755)
 *   Hf→encodeBase64FromBytes(6903/6756) Uf→decodeBase64ToBytes(6916/6775)
 *   Wf→RPC_FRAME_LIMITS(6932/6793) Gf→PositiveSafeIntegerSchema(6939/6800)
 *   Kf→NonNegativeSafeIntegerSchema(6940/6804) qf→BridgeTransportIdStringSchema(6941/6808)
 *   Jf→RpcFrameChecksumSchema(6947/6813) Yf→isValidRpcFramePayload(6951/6814)
 *   Xf→RpcDataFrameSchema(6956/6819) Zf→RpcFrameAckSchema(6976/6839) Qf→RpcFramePayloadSchema(6985/6848)
 * [S10] 任务流镜像（6993–7475）：
 *   X→TaskMirrorNonEmptyString(6993/6859) $f→TASK_MODE_IDS(6994/6860) ep→TASK_PROVIDER_IDS(6995/6871)
 *   tp→TASK_MIGRATION_SOURCES(6996/6872) np→TaskChangeSummarySchema(6997/6874)
 *   rp→TaskMirrorMetaSchema(7009/6888) ip→automationsWorkspaceKey(7034/6913)
 *   ap→TaskMirrorInvalidationReasonEnum(7037/6916) op→TaskMirrorDeliveryPurposeEnum(7038/6932)
 *   sp→TaskMirrorDeliverySourceEnum(7039/6933) cp→TaskMirrorEventBaseSchema(7040/6934)
 *   lp→TaskMirrorStreamWatermarkSchema(7048/6942) up→TaskMirrorInvalidationBaseSchema(7052/6943)
 *   dp→assertWorkspaceKeyMatchesIdentity(7056/6944) fp→assertRunIdMatchesTraceId(7064/6953)
 *   pp→TaskSnapshotInvalidatedEventSchema(7071/6957) mp→WorkspaceTaskListInvalidatedEventSchema(7075/6958)
 *   hp→TaskMirrorAttachmentSchema(7080/6965) gp→TaskMirrorStreamEventSchema(7102/6991)
 *   _p→TaskMirrorUserMessageOpSchema(7107/6992) vp→TaskMirrorStreamEventOpSchema(7114/6999)
 *   yp→TaskMirrorStreamOpSchema(7118/7000) bp→TaskMirrorSequencedStreamOpSchema(7119/7001)
 *   xp→TaskMirrorStreamTargetSchema(7124/7005) Sp→TaskMirrorValidatedStreamTargetSchema(7134/7015)
 *   Cp→TaskStreamMirrorBatchEventSchema(7137/7018) wp→TaskMirrorStreamReleaseTargetSchema(7149/7032)
 *   Tp→TaskRunLeaseRequestSchema(7150/7033) Ep→TaskRunLeaseResultSchema(7155/7039)
 *   Dp→TaskOwnerCommandBaseSchema(7165/7048) Op→StopGenerationOwnerCommandSchema(7173/7056)
 *   kp→RespondPermissionOwnerCommandSchema(7176/7057) Ap→RespondElicitationOwnerCommandSchema(7182/7063)
 *   jp→SendPromptTaskCommandSchema(7188/7069) Mp→EnqueueTaskCommandSchema(7207/7093)
 *   Np→PromoteTaskCommandSchema(7211/7094) Pp→CancelTaskCommandSchema(7216/7099)
 *   Fp→TaskOwnerCommandSchema(7221/7104) Ip→TaskOwnerCommandWithRequesterSchema(7224/7107)
 *   Lp→TaskOwnerCommandErrorCodeEnum(7239/7117) Rp→TaskOwnerCommandResultSchema(7240/7118)
 *   zp→TaskRealtimeEventSchema(7250/7122) Bp→TaskRealtimeEventWithOriginSchema(7253/7125)
 *   Z→RemoteBridgeNonEmptyString(7265/7132) Q→RemoteBridgeTransportIdSchema(7266/7133)
 *   Vp→WindowControlWorkspaceListSchema(7267/7134) Hp→WindowControlTaskListSchema(7290/7151)
 *   Up→MobileBridgeFailureReasonEnum(7306/7169) Wp→WorkspaceBridgeDescriptorSchema(7307/7182)
 *   Gp→RemoteViewStateChangedSchema(7326/7204) Kp→RemoteDeviceInfoSchema(7331/7205)
 *   qp→WindowControlBootstrapResultSchema(7352/7223) Jp→WorkspaceListSnapshotSchema(7359/7230)
 *   Yp→RemotePlatformRequestMethodEnum(7365/7236)
 * [S11] 远程连接目标（7476–7544）：
 *   Xp→SshRemoteTargetSchema(7476/7341) Zp→WslRemoteTargetSchema(7490/7353)
 *   Qp→RemoteConnectionTargetSchema(7495/7354)
 * [S12] agent 宿主命令（7545–7724）：
 *   $p→InterWindowBroadcastMessageSchema(7545/7400) em→RemoteAssetsConfigSchema(7550/7401)
 *   tm→AgentWarmupTargetSchema(7556/7407) nm→InitLocalAgentHostCommandSchema(7560/7408)
 *   rm→InitRemoteAgentHostCommandSchema(7572/7420) im→InitRemoteWorkspaceCommandSchema(7577/7421)
 *   am→InitRemoteSshHostCommandSchema(7586/7430) om→InitRemoteWslHostCommandSchema(7593/7437)
 *   sm→AttachServicePortCommandSchema(7600/7444) cm→DetachServicePortCommandSchema(7605/7449)
 *   lm→AcquireRemoteWorkspaceCommandSchema(7609/7450) um→ReleaseRemoteWorkspaceCommandSchema(7616/7457)
 *   dm→DisposeAgentHostCommandSchema(7622/7463) fm→BroadcastAgentHostCommandSchema(7625/7464)
 *   pm→TaskRealtimeDeliverCommandSchema(7629/7465) mm→TaskRunLeaseResultCommandSchema(7633/7466)
 *   hm→TaskOwnerCommandDeliverCommandSchema(7637/7467) gm→TaskOwnerCommandResultCommandSchema(7641/7468)
 *   _m→BotReconnectResultCommandSchema(7645/7469) vm→BotConnectionStatusResultCommandSchema(7652/7476)
 *   ym→BotRuntimePortResultCommandSchema(7659/7483) bm→SessionMessageDeliverRequestSchema(7665/7489)
 *   xm→SessionMessageDeliveryResultSchema(7673/7497) Sm→SessionRouteAnnouncePayloadSchema(7680/7504)
 * [S13] agent 宿主事件（7725–7941）：
 *   Cm→AgentConnectedEventSchema(7725/7562) wm→RemoteWorkspaceAcquiredEventSchema(7728/7563)
 *   Tm→AgentErrorEventSchema(7737/7572) Em→AgentLogEventSchema(7741/7573)
 *   Dm→AgentMigrationProviderEnum(7747/7574) Om→AgentProcessSpawnedEventSchema(7748/7575)
 *   km→AgentProcessReadyEventSchema(7759/7586) Am→AgentProcessExitedEventSchema(7769/7596)
 *   jm→AgentProcessErrorEventSchema(7786/7613) Mm→AgentResourceSampleEventSchema(7801/7628)
 *   Nm→AgentRunningTaskCountChangedEventSchema(7806/7633) Pm→WorkspaceRunningTaskCountChangedEventSchema(7810/7637)
 *   Fm→RepoWikiRunningTaskCountChangedEventSchema(7816/7643) Im→TaskRealtimePublishEventSchema(7820/7647)
 *   Lm→TaskStreamOpPublishEventSchema(7824/7648) Rm→TaskRunLeaseAcquireEventSchema(7829/7649)
 *   zm→TaskRunLeaseReleaseEventSchema(7833/7650) Bm→TaskOwnerCommandRequestEventSchema(7837/7651)
 *   Vm→TaskOwnerCommandResultEventSchema(7841/7652) Hm→BotReconnectRequestEventSchema(7845/7653)
 *   Um→BotConnectionStatusRequestEventSchema(7852/7660) Wm→BotRuntimePortRequestEventSchema(7859/7667)
 *   Gm→SessionMessageSendRequestedEventSchema(7866/7674) Km→SessionRouteAnnounceEventSchema(7870/7675)
 *   qm→SessionMessageDeliverResultEventSchema(7874/7676) Jm→FeedbackLogArchiveRequestEventSchema(7878/7677)
 *   Ym→CronRunResultEventSchema(7883/7678) Xm→OffPeakRunResultEventSchema(7892/7687)
 *   Zm→CronSchedulerWakeRequestEventSchema(7901/7696) Qm→OffPeakSchedulerWakeRequestEventSchema(7905/7697)
 *   $m→BrowserExecuteRequestEventSchema(7909/7698) eh→NetworkTelemetryObservationSchema(7924/7713)
 * [S14] 任务快照 schema（7942–8133）：
 *   th→TaskSnapshotStatusEnum(7942/7761) nh→SnapshotAttachmentSchema(7943/7762)
 *   rh→SnapshotToolCallSchema(7959/7781) ih→SnapshotMessagePartSchema(7976/7800)
 *   ah→SnapshotMessageSchema(7986/7805) oh→GoalTargetStatusEnum(8018/7839)
 *   sh→GoalStateActionKindEnum(8019/7840) ch→GoalStateSourceEnum(8020/7849)
 *   lh→GoalTargetSchema(8021/7850) uh→TaskSnapshotMetaSchema(8044/7865)
 *   dh→NativeSnapshotSyncStateEnum(8090/7913) fh→TaskSnapshotFileKeySchema(8097/7915)
 *   ph→FileChangeSnapshotSchema(8105/7917) mh→TurnFileChangesSnapshotSchema(8118/7932)
 *   hh→TurnCheckpointSchema(8123/7937)
 * [S15] 远程工作区键（8134–8178）：
 *   gh→REMOTE_WORKSPACE_KEY_PREFIX(8134/7943) _h→REMOTE_KIND_SEGMENT_COUNTS(8135/7944)
 *   vh→isRemoteWorkspaceKind(8141/7952) yh→normalizeRemoteWorkspacePath(8144/7955)
 *   bh→sanitizeServerIdForWorkspaceKey(8147/7958) xh→buildRemoteServerWorkspaceKey(8152/7963)
 *   Sh→parseRemoteWorkspaceKey(8155/7966)
 * [S16] 消息可见性分类（8179–8247）：
 *   Ch→MODEL_ONLY_VISIBILITY(8179/7987) wh→FORK_MESSAGE_SOURCE(8180/7988)
 *   Th→GOAL_CONTINUATION_REMINDER_TAG(8181/7989) Eh→GOAL_CONTINUATION_PROMPT_LINE(8182/7990)
 *   Dh→GOAL_STATE_SECTION_HEADING(8183/7991) Oh→TASK_NOTIFICATION_TAG(8184/7992)
 *   kh→SUBAGENT_NOTIFICATION_TAG(8185/7993) Ah→REWIND_APPLIED_NOTICE_LINES(8186/7994)
 *   jh→PROVIDER_ONLY_MESSAGE_SOURCES(8187/7995) Mh→classifyMessageVisibility(8188/8014)
 *   Nh→isTimelineOnlyMessage(8206/8054) Ph→hasProviderOnlyParts(8214/8069)
 *   Fh→resolveMessageSource(8220/8075) Ih→isGoalContinuationText(8224/8084)
 *   Lh→isQueuedNotificationText(8228/8092) Rh→collectVisiblePartText(8232/8096)
 *   zh→isSessionForkContextMetadata(8235/8102) Bh→asPlainRecord(8239/8106) Vh→asNonEmptyString(8242/8109)
 * [S17] goal 续跑与会话展示态（8245–8308）：
 *   Hh→GOAL_CONTINUATION_SYSTEM_TAG(8245/8112) Uh→GOAL_CONTINUATION_PROMPT(8246/8113)
 *   Wh→GOAL_STATE_HEADING_LINE(8247/8114) Gh→SUBAGENT_MESSAGE_SOURCE(8248/8115)
 *   Kh→isGoalContinuationContent(8249/8116) qh→isGoalContinuationMessage(8253/8120)
 *   Jh→isGoalStateContent(8256/8128) Yh→isGoalStateMessage(8260/8132)
 *   Xh→isMessageHiddenFromUser(8263/8135) Zh→isCompactionTimelineMessage(8268/8146)
 *   Qh→filterUserVisibleMessages(8271/8154) $h→resolveSessionDisplayTitle(8276/8159)
 *   eg→mapSubagentStatusToDisplayStatus(8284/8170) tg→hasSessionActiveWork(8289/8175)
 *   ng→isSessionBusy(8292/8184) rg→isToolCallsFinishReason(8295/8187)
 *   ig→isSessionAssistantCompleted(8298/8190) ag→resolveSessionDisplayStatus(8304/8196)
 * [S18] testid 前置 schema（8309–8328）：og→WorkspacePathOptionSchema(8309/8207)
 * [S19] testid 常量群（8329–8570，242 个，字符串值零改动；语义名=值驼峰+Testid）：
 *   sg→loginTriggerTestid(8329/8222) cg→loginMenuItemTestid(8330/8223) …（全表见 §19 正文与报告 §1.19）
 *   关键锚点：wg→gitPaneTestid(8346/8239)=`git-pane`；Ky→automationsListTestid(8530/8423)；
 *   qy→automationCreateMenuTestid(8531/8424) Jy→automationCreateManuallyTestid(8532/8425)
 *   Yy→automationCardTestid(8533/8426) Xy→offpeakCreateButtonTestid(8534/8427)
 *   ob→offpeakTabTestid(8544/8437) sb→automationCardMenuTestid(8545/8438)
 *   cb→automationActionToggleTestid(8546/8439) lb→automationActionDeleteTestid(8547/8440)
 *   _y→v4EditWorkspaceConflictDialogTestid(8501/8394) vy→v4EditWorkspaceConflictConversationOnlyTestid(8502/8395)
 * [S20] testid 拼接 + IPC 通道 + 凭据错误（8571–8628）：
 *   Nb→joinTestidParts(8571/8464)（styles 侧 `qr` 经别名 Xa 消费）
 *   Pb→IpcChannelNames(8574/8467) Fb→EmbeddedBrowserIpcTopics(8609/8502) Ib→ServicePortIpcTopics(8612/8505)
 *   Lb→BIGMODEL_PROVIDER_DOMAIN(8617/8508) Rb→CREDENTIAL_DECRYPT_FAILED_CODE(8618/8509)
 *   zb→isCredentialDecryptFailure(8619/8510) Bb→extractErrorCode(8623/8514) Vb→extractErrorMessage(8626/8517)
 * [S21] 编码计划作用域与归因（8629–8711）：
 *   Hb→ZCODE_AGENT_AUDIENCE(8629/8524) Ub→CODING_PLAN_SCOPE_PREFIX(8630/8525)
 *   Wb→buildCodingPlanScope(8631/8526) Gb→parseCodingPlanScope(8638/8533)
 *   Kb→codingPlanScopesOverlap(8658/8545) qb→encodeScopeSegment(8664/8557) Jb→decodeScopeSegment(8667/8560)
 *   Yb→resolveCodingPlanAttribution(8674/8567) Xb→makeCodingPlanAttribution(8691/8588)
 *   Zb→resolveEntitlementCacheStatus(8698/8591)
 * [S22] 浏览器恢复与远程目标净化（8712–8744）：
 *   Qb→BROWSER_RESTORE_PENDING_URL(8712/8610) $b→sanitizeRemoteTargetForRestore(8713/8611)
 * [S23] 桌面菜单动作：ex→DesktopMenuActionIds(8745/8631)
 * [S24] 遥测上下文（8774–8802）：
 *   tx→resolveClientTelemetryContext(8774/8660) nx→buildWebRemoteTelemetryEvent(8789/8668)
 *   rx→buildWebRemoteEntryViewTelemetryEvent(8797/8671)
 * [S25] 启动标记（8803–8822）：ix→LAUNCH_MARKS_STORAGE_KEY(8803/8677) ax→parseLaunchMarks(8804/8678)
 * [S26] UUID（8823–8843）：ox→toHexByte(8823/8697) sx→formatUuidFromBytes(8826/8700)
 *   cx→generateUuid(8830/8710) lx→newUniqueId(8841/8721)
 * [S27] 自动化分组与限额（8844–8859）：
 *   ux→DEFAULT_CRON_AUTOMATION_GROUP_ID(8844/8724) dx→DEFAULT_OFFPEAK_AUTOMATION_GROUP_ID(8845/8725)
 *   fx→isCronAutomationPayload(8846/8726) px→isOffPeakTaskPayload(8849/8729)
 *   mx→AUTOMATION_CREATE_LIMIT_REACHED(8852/8732) hx→isAutomationCreateLimitError(8853/8733)
 *   gx→TERMINAL_OFFPEAK_RUN_STATUSES(8856/8736) _x→isTerminalOffPeakRunStatus(8857/8737)
 * [S28] offpeak 计划与会话模式设置（8860–8953）：
 *   vx→OFFPEAK_IDLE_PLAN_ID(8860/8740)（styles 侧 OFFPEAK_TELEMETRY_DEFAULT_PROVIDER 经别名 Z 消费）
 *   yx→MODEL_SETTING_ID(8861/8741) bx→MODEL_SETTING_CATEGORY(8862/8742) xx→MODE_SETTING_ID(8863/8743)
 *   Sx→MODE_SETTING_CATEGORY(8864/8744) Cx→THOUGHT_LEVEL_SETTING_ID(8865/8745)
 *   wx→THOUGHT_LEVEL_SETTING_CATEGORY(8866/8746) Tx→SESSION_MODE_PRESETS(8867/8747)
 *   Ex→SESSION_MODE_PRESET_ID_SET(8884/8764) Dx→buildModelSettingOptionValue(8885/8766)
 *   Ox→normalizeSessionModeId(8889/8770) kx→listSessionModeOptions(8892/8773)
 *   Ax→listSessionModePresets(8899/8776) jx→buildSessionSettingsViewModel(8904/8779)
 * [S29] 稳定供应商/模型 id 与日志前缀（8954–8977）：
 *   Mx→slugifyProviderName(8954/8838) Nx→fnv1aHash32Hex(8957/8847) Px→buildStableProviderId(8962/8852)
 *   Fx→buildStableModelId(8967/8857) Ix→formatLocalTimestamp(8972/8862) Lx→formatLogLinePrefix(8975/8865)
 * [S30] agent 供应商就绪（8978–9008）：
 *   Rx→ZCODE_AGENT_PROVIDER_NOT_READY(8978/8868) zx→PROVIDER_NOT_READY_REASON(8979/8869)
 *   Bx→providerHasUsableCredential(8980/8870) Vx→resolveFirstReadyProvider(8994/8884)
 * [S31] OAuth 供应商家族（9009–9065）：
 *   Hx→OAUTH_PROVIDER_FAMILIES(9009/8892) Ux→OAUTH_FAMILY_BY_ID(9024/8907)
 *   Wx→OAUTH_FAMILY_BY_PROVIDER_ID(9025/8908) Gx→resolveProviderFamilyMode(9026/8909)
 *   Kx→isProviderAllowedForFamilyMode(9029/8912) qx→getOAuthProviderFamilyById(9033/8916)
 *   Jx→getOAuthFamilyIdByProviderId(9036/8919) Yx→getOAuthProviderFamilyByProviderId(9039/8922)
 *   Xx→normalizeProviderFamilyDomain(9043/8926) Zx→normalizeOAuthProviderDomain(9046/8929)
 *   Qx→providerFamilyMatchesDomain(9049/8932) $x→providerIdMatchesFamilyDomain(9053/8936)
 *   eS→activeOAuthProviderMatchesFamily(9060/8951)
 * [S32] 自定义模型引用（9066–9096）：
 *   tS→CUSTOM_MODEL_REF_PREFIX(9066/8954) nS→safeDecodeURIComponent(9067/8955)
 *   rS→buildCustomModelRef(9074/8962) iS→parseCustomModelRef(9078/8966)
 *   （styles 侧 parseModelString(Zn) 经别名 P 消费）
 * [S33] 供应商引用前缀（9097–9113）：
 *   aS→NATIVE_PROVIDER_REF_PREFIX(9097/8978) oS→CUSTOM_PROVIDER_REF_PREFIX(9098/8979)
 *   sS→GHOST_PROVIDER_REF_PREFIX(9099/8980) cS→nativeProviderRef(9100/8981)
 *   lS→customProviderRef(9103/8984) uS→resolveProviderRefFromCustomModelRef(9106/8987)
 * [S34] 运行时偏好与插件来源（9110–9127）：
 *   dS→isDataBaseDirForbiddenError(9110/8991) fS→APP_RUNTIME_PREFERENCES_STORAGE_KEY(9114/8998)
 *   pS→AppRuntimePreferencesSchema(9115/8999) mS→isUserPreferenceSource(9118/9000)
 *   hS→isPluginPreferenceSource(9121/9003) gS→OFFICIAL_PLUGIN_MARKETPLACE_IDS(9124/9006)
 *   _S→isOfficialPluginMarketplace(9125/9007)
 * [S35] 行级 diff（LCS）计数（9128–9172）：
 *   vS→LINE_DIFF_LCS_CELL_BUDGET(9128/9010) yS→splitTextIntoLines(9129/9011)
 *   bS→countLineDiffChanges(9135/9017)（styles 侧 Xr 经别名 b 消费，GitReview 登记）
 * [S36] MCP 配置归一化（9173–9245）：
 *   xS→readMcpServerHeaders(9173/9041) SS→normalizeMcpServerConfigEntry(9176/9044)
 *   CS→isValidPositiveTimeoutMs(9231/9082) wS→isValidMcpIsolation(9234/9085)
 *   TS→isValidMcpProtocolVersion(9237/9088) ES→isValidMcpOAuthConfig(9240/9091)
 *   DS→isPlainObjectRecord(9243/9109) OS→resolvePlatformBinaryName(9246/9112)
 * [S37] 搜索二进制预设（9246–9272）：kS→SEARCH_BINARY_PRESETS(9249/9115)
 * [S38] 工具调用状态 i18n（9273–9286）：
 *   AS→PENDING_TOOL_CALL_STATUSES(9273/9133) jS→TOOL_CALL_STATUS_I18N_IDS(9274/9134)
 *   MS→isPendingToolCallStatus(9281/9141) NS→resolveToolCallStatusI18nId(9284/9144)
 * [S39] 工具名分类（9287–9329）：
 *   PS→KNOWN_TOOL_NAME_LIST(9287/9149) FS→TOOL_VIEW_KIND_BY_NAME(9288/9153)
 *   IS→TOOL_NAME_LOWERCASE_INDEX(9318/9183) LS→canonicalizeToolName(9319/9184)
 *   RS→resolveToolViewKind(9323/9188) zS→isFileWriteToolName(9327/9192)
 * [S40] 工具输入解析（9330–9409）：
 *   BS→TOOL_INPUT_KNOWN_FIELD_NAMES(9330/9195) VS→parseToolCallInput(9331/9219)
 *   HS→tryParseJsonValue(9348/9226) US→extractKnownToolInputFields(9360/9233)
 *   WS→extractJsonStringField(9368/9241) GS→decodeExtractedJsonString(9392/9265)
 *   KS→stripTrailingPartialEscape(9400/9273) qS→unescapeJsonStringLiterals(9403/9276)
 *   JS→escapeRegExpSource(9407/9288)
 * [S41] todo 列表抽取（9410–9487）：
 *   YS→TODO_TOOL_TITLE_PATTERN(9410/9291) XS→TODO_LIST_FIELD_NAMES(9411/9292)
 *   ZS→isPlainObjectValue(9412/9293) QS→nonEmptyTrimmedString(9415/9296)
 *   $S→normalizeTodoStatus(9418/9299) eC→normalizeTodoEntry(9422/9303)
 *   tC→tryParseTodoJson(9440/9313) nC→extractTodoListContainer(9447/9320)
 *   rC→parseTodoListStrict(9456/9329) iC→collectTodoParseCandidates(9462/9335)
 *   aC→isTodoToolTitle(9474/9348) oC→extractTodosFromToolInput(9477/9351)
 *   sC→extractTodosFromToolOutput(9480/9354)
 * [S42] 权限请求视图模型（9488–9631；CC=styles 侧 Vte，别名 l，Conversation 登记）：
 *   cC→COMMAND_INPUT_FIELD_NAMES(9488/9362) lC→COMMAND_ARGS_FIELD_NAMES(9489/9363)
 *   uC→FILE_PATH_FIELD_NAMES(9490/9364) dC→DIRECTORY_FIELD_NAMES(9491/9378)
 *   fC→PERMISSION_FILE_PATH_LIMIT(9492/9379) $→isPlainRecordValue(9493/9380)
 *   pC→collapseWhitespace(9496/9383) mC→normalizeLineEndings(9499/9386)
 *   hC→coerceStringArray(9503/9393) gC→unwrapToolCallPayload(9506/9406)
 *   _C→extractCommandFromRecord(9509/9415) vC→findCommandValueDeep(9524/9430)
 *   yC→pushUniqueFilePath(9555/9461) bC→collectFilePathValues(9559/9465)
 *   xC→collectPermissionFilePaths(9576/9485) SC→collectPermissionFileChanges(9599/9508)
 *   CC→buildPermissionRequestViewModel(9614/9525)
 * [S43] 工作区键与编码计划错误码（9632–9636）：
 *   wC→webRemoteWorkspaceKey(9632/9543)（styles 侧 ei 经别名 c 消费）
 *   TC→CODING_PLAN_SECURITY_VERIFICATION_REQUIRED(9635/9546) EC→CODING_PLAN_SYSTEM_BUSY(9636/9547)
 * [S44] 内网/环境解析（9637–9696）：
 *   DC→readProcessEnv(9637/9548) OC→resolveIntranetMachineHost(9640/9551)
 *   kC→INTRANET_MACHINE_HOST(9643/9554) AC→INTRANET_PROBE_CONFIG(9645/9556)
 *   jC→shouldUseTestEndpoints(9654/9567) MC→coerceEnvRecord(9657/9570) NC→isTruthyEnvFlag(9660/9573)
 *   PC→normalizeEffectiveEnv(9665/9578) FC→normalizeNetworkEnv(9669/9582)
 *   IC→resolveEnvOverrideSignals(9673/9586) LC→resolveRuntimeEnvMode(9688/9596)
 * [S45] 仓库快照键与本地工作区查找（9697–9712）：
 *   RC→repoSnapshotStorageKey(9697/9606) zC→repoWikiWorkspaceKey(9701/9617)
 *   （styles 侧 ene 经别名 n 消费，ExtendedViews 登记）
 *   BC→findLocalWorkspaceIndexForward(9704/9620) VC→findNearestLocalWorkspaceIndex(9708/9624)
 * [S46] 浏览器执行操作 schema（9713–9741）：HC→BrowserExecuteOpBaseSchema(9713/9629)
 * [S47] 对外 export 块（jsx 9742 / js 9656–10069）：412 个别名全量收录，见文件尾与报告 §2。
 *
 * ----------------------------------------------------------------------------
 * 二、把握度分级：全部符号 = 高（逐字转录：类名/字符串/分支零改动；标识符语义化重命名）。
 *     类型标注 = 中高（推断，zod 链路以 any 挂接，行为语义由注释说明）。
 * ============================================================================
 */

/* ============================================================================
 * §0 跨批次 import 面 —— 以下 91 个符号定义于上半部（SrcSharedA.tsx，jsx 1–4900，
 *    B5-10a 批次）。A0-S2d 接线：原 declare 挂接已替换为真实 import
 *    （B5-10b 登记：接口级依赖，不影响发射代码）。逐项注明原混淆名与 jsx 行号；
 *    所需补导出已由 A0-S2d 在 SrcSharedA §15 export 块落地（含 B5-14 的
 *    DEFAULT_ASSET_INSTALL_MODE）。
 * ==========================================================================*/
import {
  zString as w, // zodString（jsx 3044）
  zNumber as E, // zodNumber（jsx 3112）
  zBoolean as D, // zodBoolean（jsx 3124）
  zUnknown as O, // zodUnknown（jsx 3136）
  zUndefined as Ua, // zodUndefined（jsx 3130）
  zDate as Ja, // zodDate（jsx 3150）
  zArray as k, // zodArray（jsx 3156）
  zObject as A, // zodObject（jsx 3177）
  zUnion as j, // zodUnion（jsx 3187）
  zDiscriminatedUnion as M, // zodDiscriminatedUnion（jsx 3197）
  zRecord as N, // zodRecord（jsx 3218）
  looseRecord as no, // zodRecord 变体（jsx 3226）
  zEnum as P, // zodEnum（jsx 3260）
  zLiteral as F, // zodLiteral（jsx 3275）
  ISSUE_CODES as Ao, // zod issue code 常量表（jsx 3403；styles 侧经别名 gs 消费）
  clientModeEnum as Fo, // clientMode 枚举（desktop-continuous/web-remote-replayable，jsx 3433）
  browserRequestSchema as Ko, // 浏览器执行命令判别并集（jsx 3524）
  browserDescriptorSchema as Yo, // 浏览器实例条目 schema（jsx 3729）
  sessionContextEnum as Xo, // 会话上下文枚举（live/cached，jsx 3741）
  browserResultSchema as as, // 浏览器执行结果 schema（jsx 3829）
  ASSET_INSTALL_MODES as os, // 资产安装模式列表（jsx 3851）
  isFileTransferCapability as ps, // 资源包 id 判定（jsx 3862）
  agentCliProviderEnum as I, // agent 供应商枚举（claude/opencode/gemini/codex/glm，jsx 3865）
  USAGE_REPORT_RANGES as ms, // 用量区间列表（7d/30d，jsx 3866）
  clientModeEnum2 as Os, // 投递类型枚举（jsx 3953）
  messageVisibilityEnum as ks, // 输入可见性枚举（jsx 3954）
  syntheticSourceEnum as As, // 消息输入来源枚举（jsx 3955）
  workspaceRefSchema as B, // 工作区引用 schema（jsx 3956）
  permissionDecisionEnum as js, // 权限决定枚举（allow/deny/escalate/modify，jsx 3962）
  addRulesUpdateSchema as Ps, // 权限规则更新 schema（jsx 3968）
  permissionResponseSchema as Fs, // 权限应答载荷 schema（jsx 3973）
  modelRefSchema as V, // 模型引用 schema（providerId/modelId/variant，jsx 3979）
  sessionModeEnum as Is, // 会话模式枚举（plan/build/edit/yolo/auto，jsx 3984）
  sessionStatusEnum as Ls, // 会话状态枚举（jsx 3985）
  goalTargetSchema as zs, // goal 目标引用 schema（jsx 3987）
  sessionDescriptorSchema as Hs, // 会话元信息 schema（jsx 4022）
  subagentOriginSchema as Us, // 交互来源 schema（subagent，jsx 4038）
  messagePartSchema as Qs, // 消息部件判别并集 schema（jsx 4180）
  messageWithPartsSchema as $s, // 会话消息（info+parts）schema（jsx 4239）
  sessionStateEventSchema as ic, // 会话运行时游标 schema（jsx 4276）
  extractTextFromParts as ac, // 部件文本拼接（jsx 4288）
  imBindingSchema as sc, // bot 投递目标 schema（feishu/lark/weixin，jsx 4292）
  wslUserSchema as Tc, // WSL 用户名 schema（jsx 4423）
  integratedTerminalShellSchema as Jc, // 集成终端 shell 模式判别并集（jsx 4516）
  extractErrorInfo as ee, // 错误归一化（jsx 115）
  approvalPolicyEnum as hl, // 会话模式全枚举（含 dontAsk/bypassPermissions 等，jsx 4831）
  providerIds as W, // builtin 供应商 id 常量表（jsx 4833；styles 侧 providerIds(q) 经别名 mo 消费）
  modelAliasOverrideSchema as Dl, // 供应商映射 schema（jsx 4871）
  apiFormatEnum as Ol, // 模型支持格式枚举（jsx 4879）
  wireFormatEnum as kl, // API 格式枚举（jsx 4880）
  providerKindEnum as Al, // 供应商种类枚举（jsx 4881）
  devProviderIdEnum as jl, // 目录来源枚举（jsx 4882）
  modalityEnum as Ml, // 模态枚举（text/image/video/audio/pdf，jsx 4883）
  reasoningLevelConfigSchema as Fl, // 推理分级 schema（defaultLevel/levels，jsx 4893）
  endpointsByKindSchema as Il, // 种类→路径记录 schema（jsx 4897）
  providerEndpointsSchema as Ll, // 端点 schema（baseURL/paths，jsx 4898）
  RESOLVED_BUILD_ENV as s, // 运行环境（production/test，jsx 92）
  DEFAULT_LOCALE as e, // 默认语言 `zh-CN`（jsx 1）
  sanitizeWorkspaceDescriptor as t, // 远程描述脱敏（ssh 口令/服务器令牌，jsx 2）
  sshTargetIdentityKey as a, // ssh 连接缓存键（jsx 86）
  isFileLockTimeoutError as te, // 特定错误码判定（jsx 136）
  zNever as Ka, // zodNever 工厂（jsx 3142）
  BROWSER_VIEWPORT_LIMITS as Mo, // 浏览器响应式视口尺寸范围（jsx 3418）
  DEFAULT_AGENT_NAME as ws, // agent 标识 `zcodeAgent`（jsx 3942）
  resolveDefaultAgentCliProvider as Es, // 供应商→glm 归一（jsx 3944）
  isGlmAgentCliProvider as Ds, // 是否 glm 供应商（jsx 3947）
  cacheStatsSchema as tc, // bot 用量 token schema（jsx 4251）
  contextBreakdownSchema as nc, // 系统提示分段字符统计 schema 列表（jsx 4262）
  isFeishuOrLark as cc, // 飞书/lark 判定（jsx 4298）
  BOTS_STREAM_TIMEOUT_MS as uc, // bot 轮询间隔 3e4（jsx 4302）
  BOTS_TASK_CHANNEL as dc, // bot IPC 主题 `bots:task`（jsx 4303）
  BOTS_TASK_STREAM_CHANNEL as fc, // bot IPC 主题 `bots:task-stream`（jsx 4304）
  listFileTransferCapabilities as fs, // 资源包 id 列表副本（jsx 3859）
  DEFAULT_ASSET_INSTALL_MODE as ss, // 默认资产安装模式 `local-download-upload`（jsx 3852）
  DEFAULT_BOT_REPLY_MODE as bc, // 卡片类型 `assistant_changes`（jsx 4403）
  availableReplyModesForProvider as xc, // bot 卡片能力列表（jsx 4404）
  resolveBotReplyMode as Sc, // bot 卡片类型解析（jsx 4407）
  isValidWslUser as Cc, // WSL 用户名校验（jsx 4412）
  resolveZcodeEndpointConfig as Lc, // 编码计划概览页 URL 组装（jsx 4474）
  buildBigmodelApiUrl as zc, // 编码计划基址+路径（jsx 4483）
  codingPlanPersonalOverviewUrl as Bc, // 编码计划个人概览 URL（jsx 4487）
  codingPlanTeamPlansUrl as Vc, // 编码计划团队方案 URL（jsx 4490）
  isRepoSnapshotIndexingUserEnabled as $c, // 仓库快照索引用户开关判定（jsx 4535）
  isBuiltinProviderId as _l, // 是否 Z.ai/BigModel 家族供应商（jsx 4842）
  isZaiPlanProviderId as vl, // 是否 coding-plan 供应商（jsx 4845）
  isStartPlanProviderId as yl, // 是否 start-plan 供应商（jsx 4848）
  isCodingPlanProviderId as bl, // 是否 coding/start-plan 供应商（jsx 4851）
  isGlmModelId as Tl, // 是否 GLM-5 系模型（jsx 4858）
  GLM_MODEL_IDS as xl, // GLM-5 系模型名列表（jsx 4854）
  GLM_REASONING_LEVELS as Sl, // GLM 思考档位（max/high/nothink，jsx 4855）
  CLAUDE_TO_GLM_MODEL_MAP as El // claude→GLM 模型映射表（jsx 4863，边界链头）
} from './SrcSharedA';

// 宿主全局（运行时以 typeof 守卫访问；原块未 import，属浏览器/Node 环境探测）
declare global {
  var process: any;
}


/* ============================================================================
 * §1 模型目录 schema 与助手（jsx 4902–5242 / js 4787–5138 区）
 *    边界注记：原 `var El = …, Dl, Ol, kl, Al, jl, Ml, Nl, Pl, Fl, Il, Ll, Rl, zl;`
 *    链自 jsx 4863 起（B5-10a 域），本批次自链成员 Rl（jsx 4902）接管；
 *    重建为独立 var 声明，成员语义与顺序不变。
 * ==========================================================================*/

/** 原 Rl（jsx 4902 / js 4787 区）：目录模型定义（供应商目录文件内的单个模型条目） */
export var CatalogModelSchema = A({
  id: w().min(1),
  name: w().optional(),
  kinds: k(Al),
  defaultKind: Al.optional(),
  modelIdByKind: no(Al, w().min(1)).optional(),
  modalities: A({
    input: k(Ml),
    output: k(Ml)
  }),
  contextWindow: E().int().positive(),
  maxOutputTokens: E().int().positive().optional(),
  reasoning: Fl.optional(),
  priority: E().finite().optional()
});

/** 原 zl（jsx 4917 / js 4799 区）：目录供应商定义（含端点与模型列表） */
export var CatalogProviderSchema = A({
  id: w().min(1),
  name: w().min(1),
  endpoints: Ll,
  defaultKind: Al.optional(),
  models: k(CatalogModelSchema)
});

/* 原匿名表达式（jsx 4924）：模型供应商文件 v1 包装 schema */
A({
  schemaVersion: F(`zcode.model-providers.v1`),
  providers: k(CatalogProviderSchema)
});

/** 原 Bl（jsx 4928 / js 4807）：目录模型条目（扩展禁用/工具/结构化输出标记） */
export var CatalogModelEntrySchema = CatalogModelSchema.extend({
  disabledReason: w().optional(),
  supportsTools: D().optional(),
  supportsStructuredOutput: D().optional(),
  modified: D().optional(),
  deleted: D().optional()
});

/** 原 Vl（jsx 4935 / js 4814）：供应商来源枚举 */
export var ProviderSourceEnum = P([`builtin`, `models-dev`, `custom`, `workspace`]);

/** 原 Hl（jsx 4936 / js 4815）：系统禁用原因枚举 */
export var ProviderSystemDisabledReasonEnum = P([`coding_plan_not_authenticated`, `coding_plan_not_connected`, `coding_plan_auth_failed`, `coding_plan_not_entitled`, `oauth_provider_inactive`]);

/** 原 Ul（jsx 4937 / js 4822）：供应商端点（三段密钥） */
export var ProviderEndpointsSchema = A({
  anthropic: w().default(``),
  openai: w().default(``),
  gemini: w().default(``)
});

/** 原 Wl（jsx 4942 / js 4823）：供应商端点覆盖（可选项 + 基址/路径） */
export var ProviderEndpointsOverrideSchema = ProviderEndpointsSchema.extend({
  anthropic: w().optional(),
  openai: w().optional(),
  gemini: w().optional(),
  baseURL: w().optional(),
  paths: Il.optional()
});

/* 原匿名表达式（jsx 4949）：单个供应商配置文件条目 schema */
A({
  id: w(),
  name: w(),
  enabled: D().optional(),
  systemDisabledReason: ProviderSystemDisabledReasonEnum.optional(),
  endpoints: ProviderEndpointsSchema,
  apiFormat: kl.optional(),
  source: ProviderSourceEnum.optional(),
  modelsDevProviderId: w().optional(),
  apiKeyRequired: D().optional(),
  headers: N(w(), w()).optional(),
  logoUrl: w().optional(),
  apiKey: w(),
  apiKeyUrl: w().optional(),
  models: k(w()).default([]),
  modelDisplayNames: N(w(), w()).optional(),
  modelSupportedFormats: N(w(), k(Ol)).optional(),
  providerMappings: Dl.optional(),
  createdAt: E(),
  updatedAt: E()
});

/** 原 Gl（jsx 4970 / js 4851）：供应商配置条目列表（v2 文件内） */
export var ProviderConfigEntryListSchema = k(A({
  id: w(),
  name: w(),
  enabled: D().optional(),
  systemDisabledReason: ProviderSystemDisabledReasonEnum.optional(),
  endpoints: ProviderEndpointsOverrideSchema,
  apiFormat: kl.optional(),
  source: ProviderSourceEnum.optional(),
  catalogSourceId: jl.optional(),
  catalogProviderId: w().optional(),
  modelsDevProviderId: w().optional(),
  apiKeyRequired: D().optional(),
  headers: N(w(), w()).optional(),
  logoUrl: w().optional(),
  apiKey: w(),
  apiKeyUrl: w().optional(),
  defaultKind: Al.optional(),
  models: k(CatalogModelEntrySchema).default([]),
  modelDisplayNames: N(w(), w()).optional(),
  modelSupportedFormats: N(w(), k(Ol)).optional(),
  providerMappings: Dl.optional(),
  createdAt: E(),
  updatedAt: E()
}));

/* 原匿名表达式（jsx 4994）：供应商配置文件 v2 包装 + providerIds 时间戳 schema */
A({
  schemaVersion: F(`zcode.model-providers.v2`),
  providers: ProviderConfigEntryListSchema
}), A({
  providerIds: k(w().min(1)),
  updatedAt: E().int().nonnegative()
});

/** 原 Kl（jsx 5001 / js 4879）：供应商启用判定 */
export function isProviderEnabled(e: any): boolean {
  return e?.enabled !== !1;
}

/** 原 ql（jsx 5004 / js 4882）：供应商可用性判定（有密钥且有可用端点的模型） */
export function isProviderReadyForUse(e: any): boolean {
  return !isProviderEnabled(e) || e.apiKeyRequired !== !1 && e.apiKey.trim().length === 0 ? !1 : listProviderModelIds(e).some((t: any) => findProviderModel(e, t)?.disabledReason?.trim() ? !1 : resolveModelSupportedKinds({
    provider: e,
    modelName: t
  }).some((t: any) => {
    let n = mapModelFormatToKind(t);
    return n ? resolveProviderKindEndpointUrl(e, n).length > 0 : !1;
  }));
}

/** 原 Jl（jsx 5013 / js 4894）：任一供应商可用 */
export function hasAnyReadyProvider(e: any[]): boolean {
  return e.some(isProviderReadyForUse);
}

/** 原 Yl（jsx 5016 / js 4897）：默认上下文窗口 */
export var MODEL_CONTEXT_WINDOW_DEFAULT = 2e5;
/** 原 Xl（jsx 5017 / js 4898）：回退上下文窗口（=默认） */
export var MODEL_CONTEXT_WINDOW_FALLBACK = MODEL_CONTEXT_WINDOW_DEFAULT;
/** 原 Zl（jsx 5018 / js 4899）：无限上下文标记值 */
export var MODEL_CONTEXT_WINDOW_UNLIMITED = 1e6;

/** 原 Ql（jsx 5019 / js 4900）：`[1m]` 后缀 = 无限上下文模型 */
export function isUnlimitedContextModelId(e: string): boolean {
  return e.trim().toLowerCase().endsWith(`[1m]`);
}

/** 原 $l（jsx 5022 / js 4903）：解析模型上下文窗口（无限标记/非法值回退） */
export function resolveModelContextWindow(e: string, t: any): number {
  if (isUnlimitedContextModelId(e)) return MODEL_CONTEXT_WINDOW_UNLIMITED;
  if (typeof t != `number` || !Number.isFinite(t)) return MODEL_CONTEXT_WINDOW_FALLBACK;
  let n = Math.floor(t);
  return n > 0 ? n : MODEL_CONTEXT_WINDOW_FALLBACK;
}

/** 原 eu（jsx 5028 / js 4909）：供应商 id 归一 */
export function normalizeProviderId(e: any): string {
  return e.id.trim();
}

/** 原 tu（jsx 5031 / js 4912；别名 Ao 经 export 转出）：对象记录判定 */
export function isObjectRecord(e: any): boolean {
  return typeof e == `object` && !!e;
}

/** 原 nu（jsx 5034 / js 4915）：模型显示名（无名退 id） */
export function resolveModelDisplayName(e: any): string {
  return e.name?.trim() || e.id;
}

/** 原 ru（jsx 5037 / js 4918）：列出供应商模型 id（剔除已删除） */
export function listProviderModelIds(e: any): string[] {
  return e ? e.models.filter((e: any) => !isObjectRecord(e) || e.deleted !== !0).map((e: any) => isObjectRecord(e) ? e.id.trim() : e.trim()).filter((e: any) => e.length > 0) : [];
}

/** 原 iu（jsx 5040 / js 4926）：按 id 查找未删除模型 */
export function findProviderModel(e: any, t: string): any {
  let n = t.trim();
  return e.models.find((e: any) => isObjectRecord(e) && e.deleted !== !0 && e.id.trim() === n);
}

/** 原 au（jsx 5044 / js 4930）：字符串去重 */
export function dedupeStrings(e: string[]): string[] {
  return [...new Set(e)];
}

/** 原 ou（jsx 5047 / js 4933）：模型支持格式 → 供应商种类（gemini 无映射） */
export function mapModelFormatToKind(e: any): string | null | undefined {
  switch (e) {
    case `anthropic`:
      return `anthropic`;
    case `openai`:
      return `openai-compatible`;
    case `responses`:
      return `openai`;
    case `gemini`:
      return null;
  }
}

/** 原 su（jsx 5059 / js 4945）：供应商种类 → 模型支持格式 */
export function mapKindToModelFormat(e: any): string | undefined {
  switch (e) {
    case `anthropic`:
      return `anthropic`;
    case `openai`:
      return `responses`;
    case `openai-compatible`:
      return `openai`;
  }
}

/** 原 cu（jsx 5069 / js 4955）：目录模型归一化（上下文窗口解析 + 可选字段按需挂载） */
export function normalizeCatalogModel(e: any): any {
  let t = [...new Set(e.modalities?.input ?? [`text`])],
    n = [...new Set(e.modalities?.output ?? [`text`])];
  return {
    id: e.id.trim(),
    name: e.name?.trim() || void 0,
    kinds: dedupeStrings([...(e.kinds ?? [])]),
    ...(e.defaultKind ? {
      defaultKind: e.defaultKind
    } : {}),
    modalities: {
      input: t,
      output: n
    },
    contextWindow: resolveModelContextWindow(e.id, e.contextWindow),
    ...(e.maxOutputTokens ? {
      maxOutputTokens: e.maxOutputTokens
    } : {}),
    ...(e.reasoning ? {
      reasoning: e.reasoning
    } : {}),
    ...(e.priority !== void 0 && Number.isFinite(e.priority) ? {
      priority: e.priority
    } : {}),
    ...(e.disabledReason ? {
      disabledReason: e.disabledReason
    } : {}),
    ...(e.supportsTools === void 0 ? {} : {
      supportsTools: e.supportsTools
    }),
    ...(e.supportsStructuredOutput === void 0 ? {} : {
      supportsStructuredOutput: e.supportsStructuredOutput
    }),
    ...(e.modified === void 0 ? {} : {
      modified: e.modified
    }),
    ...(e.deleted === void 0 ? {} : {
      deleted: e.deleted
    })
  };
}

/** 原 lu（jsx 5110 / js 4977）：解析供应商默认种类（端点路径优先，退回 API 格式） */
export function resolveProviderDefaultKind(e: any): string | undefined {
  if (e.defaultKind) return e.defaultKind;
  let t = e.endpoints.paths;
  if (t?.[`openai-compatible`] !== void 0) return `openai-compatible`;
  if (t?.openai !== void 0) return `openai`;
  if (t?.anthropic !== void 0) return `anthropic`;
  switch (resolveProviderApiFormat(e)) {
    case `anthropic-messages`:
      return `anthropic`;
    case `openai-responses`:
      return `openai`;
    case `openai-chat-completions`:
      return `openai-compatible`;
  }
}

/** 原 uu（jsx 5125 / js 4992）：种类 → API 格式 */
export function mapKindToApiFormat(e: any): string | undefined {
  switch (e) {
    case `anthropic`:
      return `anthropic-messages`;
    case `openai`:
      return `openai-responses`;
    case `openai-compatible`:
      return `openai-chat-completions`;
  }
}

/** 原 du（jsx 5135 / js 5002）：API 格式 → 种类 */
export function mapApiFormatToKind(e: any): string | undefined {
  switch (e) {
    case `anthropic-messages`:
      return `anthropic`;
    case `openai-responses`:
      return `openai`;
    case `openai-chat-completions`:
      return `openai-compatible`;
  }
}

/** 原 fu（jsx 5145 / js 5012）：种类 → 默认端点路径 */
export function mapKindToDefaultEndpointPath(e: any): string | undefined {
  switch (e) {
    case `anthropic`:
      return `/v1/messages`;
    case `openai`:
      return `/responses`;
    case `openai-compatible`:
      return `/chat/completions`;
  }
}

/** 原 pu（jsx 5155 / js 5022）：http(s) URL 判定 */
export function isHttpUrl(e: string): boolean {
  try {
    let t = new URL(e);
    return t.protocol === `http:` || t.protocol === `https:`;
  } catch {
    return !1;
  }
}

/** 原 mu（jsx 5163 / js 5030）：端点基址归一（剥离重复的协议主机前缀） */
export function normalizeEndpointBaseUrl(e: string): string {
  let t = e.trim().replace(/\/+$/, ``);
  if (!t) return ``;
  try {
    let e = new URL(t);
    if (e.protocol !== `http:` && e.protocol !== `https:`) return t;
    let n = `${e.protocol}//${e.host}`,
      r = t.indexOf(n, n.length);
    if (r < 0) return t;
    let i = t.slice(0, r).replace(/\/+$/, ``);
    if (i === t.slice(r).replace(/\/+$/, ``)) return i;
  } catch {
    return t;
  }
  return t;
}

/** 原 hu（jsx 5179 / js 5046）：拼接基址与路径（斜杠对齐） */
export function joinEndpointUrlParts(e: string, t: string): string {
  let n = e.trim(),
    r = t.trim();
  return r ? isHttpUrl(r) || !n ? r : n.endsWith(`/`) && r.startsWith(`/`) ? `${n.slice(0, -1)}${r}` : !n.endsWith(`/`) && !r.startsWith(`/`) ? `${n}/${r}` : `${n}${r}` : n;
}

/** 原 gu（jsx 5184 / js 5059）：剥离种类已知路径后缀，还原基址 */
export function stripKnownEndpointPathSuffix(e: string, t: any): string {
  let n: any = {
      anthropic: [`/v1/messages`, `/messages`],
      openai: [`/responses`],
      "openai-compatible": [`/chat/completions`]
    },
    r = canonicalizeEndpointUrl(e);
  for (let e of n[t]) if (r.toLowerCase().endsWith(e)) {
    r = r.slice(0, -e.length);
    break;
  }
  return r.replace(/\/+$/, ``);
}

/** 原 _u（jsx 5197 / js 5073）：端点 URL 规范化（归一 + 去尾斜杠） */
export function canonicalizeEndpointUrl(e: string): string {
  return normalizeEndpointBaseUrl(e).replace(/\/+$/, ``);
}

/** 原 vu（jsx 5200 / js 5076）：解析供应商某种类的端点 URL（无基址且无路径 → 空） */
export function resolveProviderKindEndpointUrl(e: any, t: any = mapApiFormatToKind(resolveProviderApiFormat(e))): string {
  let n = e.endpoints.baseURL?.trim() ?? ``,
    r = e.endpoints.paths ?? {};
  return !e.endpoints.baseURL?.trim() && !e.endpoints.paths || r[t] === void 0 ? `` : stripKnownEndpointPathSuffix(joinEndpointUrlParts(n, r[t] ?? ``), t);
}

/** 原 yu（jsx 5205 / js 5083）：列出端点配置覆盖的种类 */
export function listEndpointKinds(e: any): string[] {
  let t = [],
    n = e.paths;
  return e.baseURL?.trim() || n ? (n?.anthropic !== void 0 && t.push(`anthropic`), n?.openai !== void 0 && t.push(`openai`), n?.[`openai-compatible`] !== void 0 && t.push(`openai-compatible`), t) : [];
}

/** 原 bu（jsx 5210 / js 5093）：hasOwnProperty 安全调用 */
export function hasOwnPropertySafe(e: any, t: any): boolean {
  return !!(e && Object.prototype.hasOwnProperty.call(e, t));
}

/** 原 xu（jsx 5213 / js 5096）：列出端点可提供的模型支持格式 */
export function listEndpointApiFormats(e: any): string[] {
  let t = [],
    n = e.paths;
  return e.baseURL?.trim() || n ? (n?.anthropic !== void 0 && t.push(`anthropic`), n?.[`openai-compatible`] !== void 0 && t.push(`openai`), n?.openai !== void 0 && t.push(`responses`), t) : [];
}

/** 原 Su（jsx 5218 / js 5106）：API 格式 → 模型支持格式列表 */
export function mapApiFormatToModelFormats(e: any): string[] | undefined {
  switch (e) {
    case `anthropic-messages`:
      return [`anthropic`];
    case `openai-responses`:
      return [`responses`];
    case `openai-chat-completions`:
      return [`openai`];
  }
}

/** 原 Cu（jsx 5228 / js 5116）：解析供应商 API 格式（显式 → 默认种类 → 端点推断） */
export function resolveProviderApiFormat(e: any): string {
  return e.apiFormat === `anthropic-messages` || e.apiFormat === `openai-chat-completions` || e.apiFormat === `openai-responses` ? e.apiFormat : e.defaultKind ? mapKindToApiFormat(e.defaultKind) : e.endpoints.paths?.anthropic === void 0 ? e.endpoints.paths?.openai === void 0 ? e.endpoints.paths?.[`openai-compatible`] === void 0 ? `anthropic-messages` : `openai-chat-completions` : `openai-responses` : `anthropic-messages`;
}

/** 原 wu（jsx 5231 / js 5131）：解析供应商主端点 URL（种类端点优先，退回基址剥离） */
export function resolveProviderPrimaryEndpointUrl(e: any): string {
  let t = mapApiFormatToKind(resolveProviderApiFormat(e)),
    n = resolveProviderKindEndpointUrl(e, t);
  if (n) return n;
  let r = e.endpoints.baseURL?.trim();
  return r ? stripKnownEndpointPathSuffix(r, t) : resolveProviderKindEndpointUrl(e, t);
}

/** 原 Tu（jsx 5238 / js 5138）：解析模型支持的种类（显式模型 → 支持格式表 → 端点推断） */
export function resolveModelSupportedKinds(e: any): string[] {
  if (!e.modelName.trim()) return [];
  let t = findProviderModel(e.provider, e.modelName);
  return t ? t.kinds.map(mapKindToModelFormat) : hasOwnPropertySafe(e.provider.modelSupportedFormats, e.modelName) ? [...(e.provider.modelSupportedFormats?.[e.modelName] ?? [])] : listEndpointApiFormats(e.provider.endpoints);
}


/* ============================================================================
 * §2 协议基元（jsx 5243–5292 / js 5147–5175 区）
 * §3 协议数据 schema（jsx 5293–5493 / js 5187–5375 区）
 * ==========================================================================*/

/** 原 Eu（jsx 5243 / js 5147）：协议显示名 */
export var ZCODE_PROTOCOL_NAME = `ZCode Protocol`;

/** 原 G（jsx 5244 / js 5148）：非空去空白字符串 */
export var NonEmptyTrimmedStringSchema = w().trim().min(1);

/** 原 K（jsx 5245 / js 5149）：JSON 对象记录 */
export var JsonObjectRecordSchema = N(w(), O());

/** 原 q（jsx 5246 / js 5150）：非负整数 */
export var NonNegativeIntegerSchema = E().int().nonnegative();

/** 原 Du（jsx 5247 / js 5151）：时间戳值（数字/字符串/日期） */
export var TimestampValueSchema = j([NonNegativeIntegerSchema, NonEmptyTrimmedStringSchema, Ja()]);

/** 原 Ou（jsx 5248 / js 5152）：node REPL 图片展示 */
export var NodeReplImagesDisplaySchema = A({
  kind: F(`node_repl_images`),
  images: k(A({
    base64: w().min(1).max(200 * 1024),
    mimeType: w().regex(/^image\/[a-z0-9.+-]+$/iu)
  }).strict()).min(1).max(2),
  truncated: D().optional(),
  source: F(`browser_turn_end`).optional()
}).strict();

/** 原 ku（jsx 5257 / js 5167）：工具结果展示（内嵌 node_repl_images 校验） */
export var ToolResultDisplaySchema = JsonObjectRecordSchema.superRefine((e: any, t: any) => {
  let n = e.display;
  if (typeof n != `object` || !n || Array.isArray(n) || n.kind !== `node_repl_images`) return;
  let r = NodeReplImagesDisplaySchema.safeParse(n);
  if (!r.success) for (let e of r.error.issues) t.addIssue({
    ...e,
    path: [`display`, ...e.path]
  });
});

/** 原 Au（jsx 5266 / js 5174）：字符串或整数 id */
export var StringOrIntegerIdSchema = j([w(), E().int()]);

/** 原 ju（jsx 5267 / js 5175）：跟踪上下文 */
export var TraceContextSchema = A({
  traceId: NonEmptyTrimmedStringSchema.optional(),
  parentId: NonEmptyTrimmedStringSchema.optional(),
  spanId: NonEmptyTrimmedStringSchema.optional(),
  traceparent: NonEmptyTrimmedStringSchema.optional()
}).strict();

/* 原匿名表达式（jsx 5273）：RPC 帧联合（请求/通知/结果/错误） */
j([A({
  id: StringOrIntegerIdSchema,
  method: NonEmptyTrimmedStringSchema,
  params: O().optional(),
  trace: TraceContextSchema.optional()
}).strict(), A({
  method: NonEmptyTrimmedStringSchema,
  params: O().optional(),
  trace: TraceContextSchema.optional()
}).strict(), A({
  id: StringOrIntegerIdSchema,
  result: O()
}).strict(), A({
  id: StringOrIntegerIdSchema,
  error: A({
    code: E().int(),
    message: NonEmptyTrimmedStringSchema,
    data: O().optional()
  }).strict()
}).strict()]);

/** 原 Mu（jsx 5293 / js 5187）：代理资源采样 */
export var AgentResourceSampleSchema = A({
  platform: P([`aix`, `android`, `darwin`, `freebsd`, `haiku`, `linux`, `netbsd`, `openbsd`, `sunos`, `win32`, `cygwin`]),
  arch: P([`arm`, `arm64`, `ia32`, `loong64`, `mips`, `mipsel`, `ppc`, `ppc64`, `riscv64`, `s390`, `s390x`, `x64`]),
  logicalCpuCount: E().int().positive().max(4096),
  intervalMs: E().int().positive().max(10080 * 60 * 1e3),
  cpuCores: E().finite().nonnegative().max(4096),
  cpuPercent: E().finite().nonnegative().max(1e5),
  rssKb: E().finite().nonnegative().max(2 ** 53 - 1)
}).strict();

/** 原 Nu（jsx 5302 / js 5227）：消息输入来源枚举（复用上半 As） */
export var MessageInputSourceEnum = As;

/** 原 Pu（jsx 5303 / js 5228）：会话持久化枚举 */
export var SessionPersistenceEnum = P([`immediate`, `deferred`]);

/** 原 Fu（jsx 5304 / js 5229）：权限选项 */
export var PermissionOptionSchema = A({
  optionId: NonEmptyTrimmedStringSchema,
  kind: NonEmptyTrimmedStringSchema,
  name: NonEmptyTrimmedStringSchema,
  description: w().optional(),
  response: Fs
}).strict();

/** 原 Iu（jsx 5311 / js 5230）：名值条目 */
export var NameValueEntrySchema = A({
  name: NonEmptyTrimmedStringSchema,
  value: w()
}).strict();

/** 原 Lu（jsx 5315 / js 5231）：MCP OAuth 配置（两种授权类型） */
export var McpOAuthConfigSchema = j([A({
  type: F(`client_credentials`),
  clientId: NonEmptyTrimmedStringSchema,
  clientSecret: NonEmptyTrimmedStringSchema,
  clientName: NonEmptyTrimmedStringSchema.optional(),
  scope: w().optional()
}).strict(), A({
  type: F(`authorization_code`),
  clientId: NonEmptyTrimmedStringSchema.optional(),
  clientSecret: NonEmptyTrimmedStringSchema.optional(),
  clientName: NonEmptyTrimmedStringSchema.optional(),
  redirectPath: NonEmptyTrimmedStringSchema.optional(),
  scope: w().optional()
}).strict()]);

/** 原 Ru（jsx 5329 / js 5248）：MCP 服务器配置（stdio / http+sse） */
export var McpServerConfigSchema = j([A({
  name: NonEmptyTrimmedStringSchema,
  command: NonEmptyTrimmedStringSchema,
  args: k(w()),
  env: k(NameValueEntrySchema),
  isolation: P([`session`, `workspace`]).optional(),
  protocolVersion: P([`legacy`, `auto`, `2026-07-28`]).optional(),
  timeoutMs: E().int().positive().optional()
}).strict(), A({
  name: NonEmptyTrimmedStringSchema,
  type: P([`http`, `sse`]),
  url: NonEmptyTrimmedStringSchema,
  headers: k(NameValueEntrySchema),
  oauth: McpOAuthConfigSchema.optional(),
  isolation: P([`session`, `workspace`]).optional(),
  protocolVersion: P([`legacy`, `auto`, `2026-07-28`]).optional(),
  timeoutMs: E().int().positive().optional()
}).strict()]);

/** 原 zu（jsx 5347 / js 5269）：MCP 服务器状态 */
export var McpServerStatusSchema = A({
  status: P([`connecting`, `connected`, `disabled`, `disconnected`, `failed`, `untrusted`]),
  transport: P([`stdio`, `http`, `sse`]),
  toolCount: E().int().nonnegative(),
  updatedAt: NonEmptyTrimmedStringSchema,
  error: w().optional(),
  protocolEra: P([`legacy`, `modern`]).optional(),
  authorization: A({
    type: F(`oauth_authorization_code`),
    authorizationUrl: NonEmptyTrimmedStringSchema,
    startedAt: NonEmptyTrimmedStringSchema
  }).strict().optional()
}).strict();

/** 原 Bu（jsx 5360 / js 5280）：MCP 连接动作枚举 */
export var McpConnectionActionEnum = P([`connect`, `status`]);

/* 原匿名表达式（jsx 5361）：MCP 连接请求/响应 schema 对 */
A({
  workspace: B,
  mcpServers: k(McpServerConfigSchema).optional(),
  mode: McpConnectionActionEnum.default(`connect`)
}).strict(), A({
  statuses: N(w(), McpServerStatusSchema)
}).strict();

/** 原 Vu（jsx 5368 / js 5283）：导入的历史消息 */
export var ImportedHistoryMessageSchema = A({
  role: P([`user`, `assistant`]),
  content: w(),
  timestamp: NonNegativeIntegerSchema.optional()
}).strict();

/** 原 Hu（jsx 5373 / js 5284）：导入的 Claude 历史 */
export var ImportedClaudeHistorySchema = A({
  source: F(`claudeCode`),
  title: w().optional(),
  createdAt: NonNegativeIntegerSchema.optional(),
  updatedAt: NonNegativeIntegerSchema.optional(),
  messages: k(ImportedHistoryMessageSchema).min(1)
}).strict();

/** 原 Uu（jsx 5380 / js 5291）：思考等级选项 */
export var ThoughtLevelOptionSchema = A({
  value: NonEmptyTrimmedStringSchema,
  label: NonEmptyTrimmedStringSchema,
  description: w().optional()
}).strict();

/** 原 Wu（jsx 5385 / js 5292）：推理等级配置 */
export var ReasoningLevelConfigSchema = A({
  enabled: D(),
  levels: k(ThoughtLevelOptionSchema),
  defaultLevel: NonEmptyTrimmedStringSchema.optional(),
  providerOptionsByLevel: N(NonEmptyTrimmedStringSchema, JsonObjectRecordSchema).optional()
}).strict();

/** 原 Gu（jsx 5391 / js 5298）：可用模型条目 */
export var AvailableModelEntrySchema = A({
  ref: V,
  label: NonEmptyTrimmedStringSchema,
  providerLabel: NonEmptyTrimmedStringSchema.optional(),
  providerSource: w().optional(),
  providerLogoUrl: NonEmptyTrimmedStringSchema.optional(),
  description: w().optional(),
  contextWindow: E().int().positive().optional(),
  maxOutputTokens: E().int().positive().optional(),
  reasoning: ReasoningLevelConfigSchema.optional(),
  supportsImages: D().optional(),
  supportsPdf: D().optional(),
  supportsTools: D().optional(),
  supportsStructuredOutput: D().optional(),
  disabledReason: w().optional()
}).strict();

/** 原 Ku（jsx 5407 / js 5314）：运行时供应商类型枚举 */
export var RuntimeProviderKindEnum = P([`anthropic`, `openai`, `openai-compatible`]);

/** 原 qu（jsx 5408 / js 5315）：运行时 API 格式枚举 */
export var RuntimeApiFormatEnum = P([`anthropic-messages`, `openai-chat-completions`, `openai-responses`]);

/** 原 Ju（jsx 5409 / js 5316）：运行时供应商来源枚举 */
export var RuntimeProviderSourceEnum = P([`builtin`, `models-dev`, `custom`, `user`, `workspace`, `ephemeral`]);

/** 原 Yu（jsx 5410 / js 5317）：API 密钥引用（四种来源） */
export var ApiKeyReferenceSchema = M(`source`, [A({
  source: F(`credential`),
  key: NonEmptyTrimmedStringSchema
}).strict(), A({
  source: F(`env`),
  name: NonEmptyTrimmedStringSchema
}).strict(), A({
  source: F(`server-config`),
  key: NonEmptyTrimmedStringSchema
}).strict(), A({
  source: F(`session-secret`),
  key: NonEmptyTrimmedStringSchema
}).strict()]);

/** 原 Xu（jsx 5423 / js 5323）：API 密钥实体（含内联值） */
export var ApiKeyMaterialSchema = M(`source`, [A({
  source: F(`credential`),
  key: NonEmptyTrimmedStringSchema
}).strict(), A({
  source: F(`env`),
  name: NonEmptyTrimmedStringSchema
}).strict(), A({
  source: F(`server-config`),
  key: NonEmptyTrimmedStringSchema
}).strict(), A({
  source: F(`inline`),
  value: NonEmptyTrimmedStringSchema
}).strict()]);

/** 原 Zu（jsx 5436 / js 5329）：运行时模型条目 */
export var RuntimeModelEntrySchema = A({
  modelId: NonEmptyTrimmedStringSchema,
  label: NonEmptyTrimmedStringSchema.optional(),
  description: w().optional(),
  contextWindow: E().int().positive().optional(),
  maxOutputTokens: E().int().positive().optional(),
  reasoning: ReasoningLevelConfigSchema.optional(),
  supportsImages: D().optional(),
  supportsPdf: D().optional(),
  supportsTools: D().optional(),
  supportsStructuredOutput: D().optional(),
  providerOptions: JsonObjectRecordSchema.optional(),
  disabledReason: w().optional()
}).strict();

/** 原 Qu（jsx 5450 / js 5343）：运行时供应商（密钥引用形式） */
export var RuntimeProviderWithKeyRefSchema = A({
  providerId: NonEmptyTrimmedStringSchema,
  kind: RuntimeProviderKindEnum,
  apiFormat: RuntimeApiFormatEnum.optional(),
  label: NonEmptyTrimmedStringSchema.optional(),
  source: RuntimeProviderSourceEnum.default(`workspace`),
  baseURL: NonEmptyTrimmedStringSchema.optional(),
  apiKeyRef: ApiKeyReferenceSchema.optional(),
  apiKeyRequired: D().optional(),
  headers: N(w(), w()).optional(),
  providerOptions: JsonObjectRecordSchema.optional(),
  logoUrl: NonEmptyTrimmedStringSchema.optional(),
  modelsDevProviderId: NonEmptyTrimmedStringSchema.optional(),
  models: k(RuntimeModelEntrySchema),
  disabledReason: w().optional(),
  updatedAt: NonNegativeIntegerSchema.optional()
}).strict();

/** 原 $u（jsx 5467 / js 5360）：运行时供应商（内联密钥形式） */
export var RuntimeProviderWithInlineKeySchema = A({
  providerId: NonEmptyTrimmedStringSchema,
  kind: RuntimeProviderKindEnum,
  apiFormat: RuntimeApiFormatEnum.optional(),
  label: NonEmptyTrimmedStringSchema.optional(),
  source: RuntimeProviderSourceEnum.default(`workspace`),
  baseURL: NonEmptyTrimmedStringSchema.optional(),
  apiKey: ApiKeyMaterialSchema.optional(),
  apiKeyRequired: D().optional(),
  headers: N(w(), w()).optional(),
  providerOptions: JsonObjectRecordSchema.optional(),
  logoUrl: NonEmptyTrimmedStringSchema.optional(),
  modelsDevProviderId: NonEmptyTrimmedStringSchema.optional(),
  models: k(RuntimeModelEntrySchema).min(1)
}).strict();

/** 原 J（jsx 5482 / js 5375）：运行时模型选择 */
export var RuntimeModelSelectionSchema = A({
  revision: NonEmptyTrimmedStringSchema,
  generatedAt: NonNegativeIntegerSchema,
  model: V,
  provider: RuntimeProviderWithInlineKeySchema,
  thoughtLevel: NonEmptyTrimmedStringSchema.optional()
}).strict();

/* 原匿名表达式（jsx 5489）：运行时模型应用结果 */
A({
  sessionId: NonEmptyTrimmedStringSchema,
  appliedModelRuntimeRevision: NonEmptyTrimmedStringSchema,
  changed: D()
}).strict();


/* ============================================================================
 * §4 供应商视图模型构建器（jsx 5494–5693 / js 5383–5516 区）
 * ==========================================================================*/

/** 原 ed（jsx 5494 / js 5383）：裁剪供应商端点（baseURL/paths 去空白） */
export function trimProviderEndpoints(e: any) {
  let t = e.paths ? Object.fromEntries(Object.entries(e.paths).map(([e, t]: [any, any]) => [e, t.trim()])) : void 0;
  return {
    ...(e.baseURL === void 0 ? {} : {
      baseURL: e.baseURL.trim()
    }),
    ...(t ? {
      paths: t
    } : {})
  };
}

/** 原 td（jsx 5505 / js 5392）：解析供应商端点组合（apiFormat/kind/baseURL） */
export function resolveProviderEndpointBundle(e: any) {
  let t = resolveProviderApiFormat(e),
    n = mapApiFormatToKind(t),
    r = resolveProviderKindEndpointUrl(e, n);
  return r ? {
    apiFormat: t,
    kind: n,
    baseURL: r
  } : null;
}

/** 原 nd（jsx 5515 / js 5398）：解析供应商来源桶 */
export function resolveProviderSourceBucket(e: any) {
  return e.source === `builtin` || e.id.startsWith(`builtin:`) ? `builtin` : e.source === `models-dev` ? `models-dev` : e.source === `custom` ? `custom` : `workspace`;
}

/** 原 rd（jsx 5518 / js 5407）：解析供应商模型格式列表 */
export function resolveProviderModelFormats(e: any, t: any) {
  let n = findProviderModel(e, t);
  return n ? n.kinds.map(mapKindToModelFormat) : e.modelSupportedFormats?.[t] ?? (e.apiFormat ? mapApiFormatToModelFormats(e.apiFormat) : void 0) ?? listEndpointApiFormats(e.endpoints);
}

/** 原 id（jsx 5522 / js 5413）：解析目录模型条目（显式/合成） */
export function resolveCatalogModelEntry(e: any, t: any) {
  let n = findProviderModel(e, t);
  if (n) return {
    explicit: !0,
    model: n
  };
  let r = resolveProviderModelFormats(e, t).flatMap((e: any) => {
    let t = mapModelFormatToKind(e);
    return t ? [t] : [];
  });
  return {
    explicit: !1,
    model: normalizeCatalogModel({
      id: t,
      name: e.modelDisplayNames?.[t],
      kinds: r,
      defaultKind: resolveProviderDefaultKind(e)
    })
  };
}

/** 原 ad（jsx 5542 / js 5425）：裁剪头部记录（去空白、去空项） */
export function trimHeaderRecord(e: any) {
  if (!e) return;
  let t = Object.fromEntries(Object.entries(e).map(([e, t]: [any, any]): [any, any] => [e.trim(), t.trim()]).filter(([e, t]: [any, any]) => e.length > 0 && t.length > 0));
  return Object.keys(t).length > 0 ? t : void 0;
}

/** 原 od（jsx 5547 / js 5434）：首字母大写标签 */
export function capitalizeLabel(e: any) {
  let t = e.trim();
  return t ? `${t.slice(0, 1).toUpperCase()}${t.slice(1)}` : e;
}

/** 原 sd（jsx 5551 / js 5438）：模型是否支持指定 kind */
export function modelSupportsKind(e: any, t: any) {
  return e.kinds.includes(t);
}

/** 原 cd（jsx 5554 / js 5441）：构建推理（思考等级）视图模型 */
export function buildReasoningViewModel(e: any, t: any) {
  if (!e) return;
  let n = Object.keys(e.levels);
  if (n.length === 0) return;
  let r = e.defaultLevel && n.includes(e.defaultLevel) ? e.defaultLevel : n[0],
    i = buildProviderOptionsByLevel(e, t);
  return {
    enabled: !0,
    levels: n.map((e: any) => ({
      value: e,
      label: capitalizeLabel(e)
    })),
    ...(r ? {
      defaultLevel: r
    } : {}),
    ...(i ? {
      providerOptionsByLevel: i
    } : {})
  };
}

/** 原 ld（jsx 5574 / js 5454）：按等级构建 providerOptions 映射 */
export function buildProviderOptionsByLevel(e: any, t: any) {
  let n = Object.entries(e.levels).flatMap(([e, n]: [any, any]) => {
    let r = n[t],
      i = r ? buildReasoningProviderOptions(r) : void 0,
      a = i ? {
        [providerOptionsKeyForKind(t)]: i
      } : void 0;
    return a ? [[e, a]] : [];
  });
  return n.length > 0 ? Object.fromEntries(n) : void 0;
}

/** 原 ud（jsx 5585 / js 5463）：kind → providerOptions 键名 */
export function providerOptionsKeyForKind(e: any): any {
  switch (e) {
    case `anthropic`:
      return `anthropic`;
    case `openai`:
      return `openai`;
    case `openai-compatible`:
      return `openaiCompatible`;
  }
}

/** 原 dd（jsx 5595 / js 5473）：构建推理 providerOptions（set/unset 路径） */
export function buildReasoningProviderOptions(e: any) {
  let t: any = {};
  for (let n of e.set ?? []) setNestedOptionValue(t, n.path, n.value);
  for (let n of e.unset ?? []) deleteNestedOptionValue(t, n.path);
  return Object.keys(t).length > 0 ? t : void 0;
}

/** 原 fd（jsx 5601 / js 5479）：按路径设置嵌套选项值 */
export function setNestedOptionValue(e: any, t: any, n: any) {
  let [r, ...i] = t.map((e: any) => e.trim()).filter(Boolean);
  if (!r) return;
  if (i.length === 0) {
    e[r] = n;
    return;
  }
  let a = e[r],
    o = a && typeof a == `object` && !Array.isArray(a) ? a : {};
  e[r] = o, setNestedOptionValue(o, i, n);
}

/** 原 pd（jsx 5612 / js 5490）：按路径删除嵌套选项值 */
export function deleteNestedOptionValue(e: any, t: any) {
  let [n, ...r] = t.map((e: any) => e.trim()).filter(Boolean);
  if (!n) return;
  if (r.length === 0) {
    delete e[n];
    return;
  }
  let i = e[n];
  !i || typeof i != `object` || Array.isArray(i) || deleteNestedOptionValue(i, r);
}

/** 原 md（jsx 5622 / js 5500）：按 kind 解析模型 id */
export function resolveModelIdForKind(e: any, t: any) {
  return e.modelIdByKind?.[t]?.trim() || e.id.trim();
}

/** 原 hd（jsx 5625 / js 5503）：视觉输入模态集合 */
export var VISION_INPUT_MODALITIES = new Set([`image`, `pdf`]);

/** 原 gd（jsx 5626 / js 5504）：是否 models.dev 来源供应商 */
export function isModelsDevSourcedProvider(e: any) {
  return e.source === `models-dev` || !!(e.catalogProviderId?.trim() || e.catalogSourceId?.trim() || e.modelsDevProviderId?.trim());
}

/** 原 _d（jsx 5629 / js 5510）：模型是否接受视觉输入 */
export function modelAcceptsVisionInput(e: any) {
  return e.modalities.input.some((e: any) => VISION_INPUT_MODALITIES.has(e));
}

/** 原 vd（jsx 5632 / js 5513）：供应商是否支持视觉模型 */
export function providerSupportsVisionModels(e: any, t: any) {
  return isModelsDevSourcedProvider(e) || modelAcceptsVisionInput(t);
}

/** 原 yd（jsx 5635 / js 5516）：从供应商配置构建运行时供应商 */
export function buildRuntimeProviderFromConfig(e: any) {
  let t = trimProviderEndpoints(e.endpoints),
    n = resolveProviderEndpointBundle({
      apiFormat: e.apiFormat,
      endpoints: t,
      defaultKind: e.defaultKind
    });
  if (!n) return null;
  let r = Array.from(new Set(listProviderModelIds(e))).map((t: any) => resolveCatalogModelEntry(e, t));
  if (r.length === 0) return null;
  let i = e.apiKey.trim(),
    a = isProviderEnabled(e) ? void 0 : `Disabled in app model provider settings`,
    o = r.flatMap(({
      model: r,
      explicit: i
    }: any) => {
      let o: any = n.kind;
      if (!modelSupportsKind(r, o) || e.endpoints.paths?.[o] === void 0 && !resolveProviderPrimaryEndpointUrl({
        apiFormat: n.apiFormat,
        defaultKind: o,
        endpoints: t
      })) return [];
      let s = resolveModelIdForKind(r, o),
        c: any = {
          modelId: s,
          providerOptions: {
            supportedFormats: resolveProviderModelFormats(e, r.id)
          }
        },
        l = i ? resolveModelDisplayName(r) : e.modelDisplayNames?.[r.id]?.trim();
      l && (c.label = l), (i || isUnlimitedContextModelId(s)) && (c.contextWindow = resolveModelContextWindow(s, r.contextWindow)), i && (c.maxOutputTokens = r.maxOutputTokens, c.reasoning = buildReasoningViewModel(r.reasoning, o), providerSupportsVisionModels(e, r) && (c.supportsImages = r.modalities.input.includes(`image`), c.supportsPdf = r.modalities.input.includes(`pdf`)), c.supportsTools = r.supportsTools, c.supportsStructuredOutput = r.supportsStructuredOutput);
      let u = a ?? r.disabledReason;
      return u && (c.disabledReason = u), [c];
    });
  if (o.length === 0) return null;
  let s: any = {
      apiFormat: n.apiFormat,
      apiKeyRequired: e.apiKeyRequired,
      baseURL: n.baseURL,
      kind: n.kind,
      logoUrl: e.logoUrl,
      modelsDevProviderId: e.modelsDevProviderId,
      models: o,
      providerId: e.id,
      providerOptions: {
        endpoints: t,
        apiFormat: n.apiFormat,
        modelSupportedFormats: e.modelSupportedFormats ?? {}
      },
      source: resolveProviderSourceBucket(e)
    },
    c = e.name.trim();
  c && (s.label = c), i && (s.apiKey = {
    source: `inline`,
    value: i
  });
  let l = trimHeaderRecord(e.headers);
  return l && (s.headers = l), s;
}


/* ============================================================================
 * §5 会话快照与事件载荷 schema（jsx 5694–6031 / js 5570–5918 区）
 * §6 会话事件联合与子代理（jsx 6032–6095 / js 5919–5991 区）
 * ==========================================================================*/

/** 原 bd（jsx 5694 / js 5570）：模型目录快照 */
export var ModelCatalogSnapshotSchema = A({
  revision: E().int().nonnegative(),
  providerRevision: NonEmptyTrimmedStringSchema.optional(),
  providers: k(RuntimeProviderWithKeyRefSchema),
  available: k(AvailableModelEntrySchema),
  defaultModel: V.optional(),
  lastUsed: V.optional()
}).strict();

/** 原 xd（jsx 5702 / js 5578）：待办条目 */
export var TodoItemSchema = A({
  content: NonEmptyTrimmedStringSchema,
  status: P([`pending`, `in_progress`, `completed`]),
  priority: P([`high`, `medium`, `low`])
}).strict();

/** 原 Sd（jsx 5707 / js 5583）：目标统计 */
export var GoalStatsSchema = A({
  timeUsedSeconds: E().int().nonnegative(),
  tokensUsed: E().int().nonnegative(),
  tokenBudget: E().int().positive().nullable(),
  contextUsed: E().int().nonnegative(),
  contextWindow: E().int().nonnegative(),
  toolCallCount: E().int().nonnegative(),
  iterationCount: E().int().nonnegative()
}).strict();

/** 原 Cd（jsx 5716 / js 5592）：待办分组 */
export var TodoGroupSchema = A({
  id: NonEmptyTrimmedStringSchema,
  source: P([`goal_iteration`, `session`]),
  goalIteration: E().int().positive().optional(),
  targetId: NonEmptyTrimmedStringSchema.optional(),
  startedAt: NonNegativeIntegerSchema.optional(),
  updatedAt: NonNegativeIntegerSchema.optional(),
  todos: k(TodoItemSchema)
}).strict();

/** 原 wd（jsx 5725 / js 5601）：会话设置状态 */
export var SessionSettingsStateSchema = A({
  appliedProviderRevision: NonEmptyTrimmedStringSchema.optional(),
  model: A({
    current: V,
    available: k(AvailableModelEntrySchema),
    lastUsed: V.optional()
  }).strict(),
  thoughtLevel: A({
    enabled: D(),
    current: NonEmptyTrimmedStringSchema.optional(),
    defaultLevel: NonEmptyTrimmedStringSchema.optional(),
    available: k(ThoughtLevelOptionSchema)
  }).strict(),
  mode: A({
    current: Is
  }).strict(),
  permission: A({
    mode: Is.optional(),
    rulesRevision: E().int().nonnegative().optional()
  }).strict().optional()
}).strict();

/** 原 Td（jsx 5746 / js 5615）：待处理权限请求 */
export var PendingPermissionRequestSchema = A({
  requestId: NonEmptyTrimmedStringSchema,
  toolCallId: NonEmptyTrimmedStringSchema,
  toolName: NonEmptyTrimmedStringSchema,
  reason: w(),
  riskLevel: P([`low`, `medium`, `high`, `critical`]),
  input: O().optional(),
  origin: Us.optional(),
  options: k(PermissionOptionSchema).min(1),
  requestedAt: NonNegativeIntegerSchema
}).strict();

/** 原 Ed（jsx 5757 / js 5626）：活动工具调用 */
export var ActiveToolCallSchema = A({
  toolCallId: NonEmptyTrimmedStringSchema,
  toolName: NonEmptyTrimmedStringSchema,
  status: P([`pending`, `running`, `completed`, `failed`, `denied`]),
  startedAt: NonNegativeIntegerSchema.optional()
}).strict();

/** 原 Dd（jsx 5763 / js 5632）：会话投影 */
export var SessionProjectionSchema = A({
  sessionId: NonEmptyTrimmedStringSchema,
  status: Ls,
  mode: Is,
  turnCount: E().int().nonnegative(),
  totalTokenCount: E().int().nonnegative(),
  contextUsed: E().int().nonnegative(),
  contextWindow: E().int().nonnegative(),
  currentTurnId: NonEmptyTrimmedStringSchema.optional(),
  pendingPermissions: k(PendingPermissionRequestSchema),
  activeToolCalls: k(ActiveToolCallSchema),
  backgroundJobs: k(JsonObjectRecordSchema),
  target: zs.nullable().optional(),
  lastError: A({
    type: NonEmptyTrimmedStringSchema,
    code: NonEmptyTrimmedStringSchema.optional(),
    message: NonEmptyTrimmedStringSchema,
    detail: w().optional()
  }).strict().optional()
}).strict();

/** 原 Od（jsx 5783 / js 5649）：斜杠命令 */
export var SlashCommandSchema = A({
  name: NonEmptyTrimmedStringSchema,
  description: w(),
  inputHint: w().optional(),
  source: P([`builtin`, `custom`]).optional()
}).strict();

/** 原 kd（jsx 5789 / js 5655）：模型流事件类型枚举 */
export var ModelStreamEventKindEnum = P([`start`, `finish`, `error`, `text_start`, `text_delta`, `text_end`, `reasoning_start`, `reasoning_delta`, `reasoning_end`, `tool_input_start`, `tool_input_delta`, `tool_input_end`, `tool_call`]);

/** 原 Ad（jsx 5790 / js 5670）：模型流式载荷 */
export var ModelStreamingPayloadSchema = A({
  assistantMessageId: w().optional(),
  delta: w().optional(),
  done: D().optional(),
  input: O().optional(),
  kind: ModelStreamEventKindEnum,
  partId: w().optional(),
  providerExecuted: D().optional(),
  toolCallId: w().optional(),
  toolName: w().optional()
}).strict();

/** 原 jd（jsx 5801 / js 5681）：会话快照 */
export var SessionSnapshotSchema = A({
  protocol: A({
    name: F(ZCODE_PROTOCOL_NAME),
    version: F(1)
  }).strict(),
  session: Hs,
  settings: SessionSettingsStateSchema,
  projection: SessionProjectionSchema,
  runtime: ic,
  messages: k($s),
  goalStats: GoalStatsSchema.optional(),
  todos: k(TodoItemSchema).optional(),
  todoGroups: k(TodoGroupSchema).optional(),
  slashCommands: k(SlashCommandSchema).optional()
}).strict();

/** 原 Md（jsx 5816 / js 5693）：会话事件信封基础 */
export var SessionEventEnvelopeBaseSchema = A({
  eventId: NonEmptyTrimmedStringSchema,
  sessionId: NonEmptyTrimmedStringSchema,
  turnId: NonEmptyTrimmedStringSchema.optional(),
  seq: E().int().nonnegative(),
  traceId: NonEmptyTrimmedStringSchema.optional(),
  timestamp: NonNegativeIntegerSchema,
  deliveryKind: Os.optional()
}).strict();

/* 原匿名表达式（jsx 5825）：会话事件类型字面量枚举 */
P([`session.created`, `session.resumed`, `session.updated`, `session.titleUpdated`, `session.closed`, `turn.started`, `turn.steerQueued`, `turn.steerDrained`, `turn.completed`, `turn.failed`, `message.upserted`, `message.removed`, `part.started`, `part.delta`, `part.upserted`, `part.removed`, `model.streaming`, `tool.updated`, `permission.requested`, `permission.resolved`, `userInput.requested`, `userInput.resolved`, `checkpoint.created`, `rewind.triggered`, `streamRecovery.updated`]);

/** 原 Nd（jsx 5826 / js 5729 区）：序列化错误 */
export var SerializedErrorSchema = A({
  type: NonEmptyTrimmedStringSchema,
  message: NonEmptyTrimmedStringSchema,
  stack: w().optional(),
  code: w().optional(),
  detail: w().optional(),
  retryable: D().optional(),
  data: O().optional()
}).strict();

/** 原 Pd（jsx 5835 / js 5738 区）：会话创建载荷 */
export var SessionCreatedPayloadSchema = A({
  mode: Is,
  contextWindow: E().int().nonnegative()
}).strict();

/** 原 Fd（jsx 5839 / js 5739 区）：会话恢复载荷 */
export var SessionResumedPayloadSchema = A({
  directory: NonEmptyTrimmedStringSchema,
  interruptedToolCount: E().int().nonnegative(),
  messageCount: E().int().nonnegative(),
  partCount: E().int().nonnegative(),
  recoveredCompactTimelineCount: E().int().nonnegative().optional(),
  recoveredSteerInputCount: E().int().nonnegative().optional(),
  resumedTodoCount: E().int().nonnegative().optional()
}).strict();

/** 原 Id（jsx 5848 / js 5748 区）：会话标题更新载荷 */
export var SessionTitleUpdatedPayloadSchema = A({
  messageID: NonEmptyTrimmedStringSchema.optional(),
  modelRef: JsonObjectRecordSchema.optional(),
  previousTitle: w(),
  source: P([`default`, `first_input`, `generated`, `custom`]),
  title: w()
}).strict();

/** 原 Ld（jsx 5855 / js 5755 区）：回合开始载荷 */
export var TurnStartedPayloadSchema = A({
  turnNumber: E().int().nonnegative(),
  input: w(),
  inputId: NonEmptyTrimmedStringSchema.optional(),
  queryId: NonEmptyTrimmedStringSchema.optional(),
  inputSource: MessageInputSourceEnum.optional(),
  inputVisibility: ks.optional(),
  executionKind: P([`agent`, `controlOnly`]).optional(),
  targetId: NonEmptyTrimmedStringSchema.optional(),
  messageId: NonEmptyTrimmedStringSchema.optional(),
  foregroundExecutionId: NonEmptyTrimmedStringSchema.optional(),
  intent: JsonObjectRecordSchema.optional(),
  originMeta: JsonObjectRecordSchema.optional(),
  attachments: k(JsonObjectRecordSchema).optional()
}).strict();

/** 原 Rd（jsx 5870 / js 5770 区）：计划审批反馈来源常量 */
export var PLAN_APPROVAL_FEEDBACK_SOURCE = F(`plan_approval_feedback`);

/** 原 zd（jsx 5871 / js 5771 区）：转向命令类型枚举 */
export var SteerCommandKindEnum = P([`sendText`, `sendGoalCommand`, `compact`]);

/** 原 Bd（jsx 5872 / js 5772 区）：转向投递模式枚举 */
export var SteerDeliveryModeEnum = P([`queue`, `guide`]);

/** 原 Vd（jsx 5873 / js 5773 区）：转向排队载荷 */
export var TurnSteerQueuedPayloadSchema = A({
  pendingInputId: NonEmptyTrimmedStringSchema,
  inputId: NonEmptyTrimmedStringSchema.optional(),
  queryId: NonEmptyTrimmedStringSchema.optional(),
  input: w(),
  inputPreview: w(),
  inputSize: E().int().nonnegative(),
  commandKind: SteerCommandKindEnum.optional(),
  source: PLAN_APPROVAL_FEEDBACK_SOURCE.optional(),
  toolDisallowlist: k(NonEmptyTrimmedStringSchema).optional(),
  delivery: SteerDeliveryModeEnum.optional(),
  targetTurnId: NonEmptyTrimmedStringSchema,
  queueLength: E().int().nonnegative(),
  intent: JsonObjectRecordSchema.optional()
}).strict();

/** 原 Hd（jsx 5888 / js 5788 区）：转向耗尽载荷 */
export var TurnSteerDrainedPayloadSchema = A({
  pendingInputIds: k(NonEmptyTrimmedStringSchema),
  queryIds: k(NonEmptyTrimmedStringSchema).optional(),
  targetTurnId: NonEmptyTrimmedStringSchema,
  injectedMessageIds: k(NonEmptyTrimmedStringSchema),
  drainedInputs: k(A({
    pendingInputId: NonEmptyTrimmedStringSchema,
    messageId: NonEmptyTrimmedStringSchema,
    text: w(),
    delivery: SteerDeliveryModeEnum.optional(),
    intent: JsonObjectRecordSchema.optional(),
    toolDisallowlist: k(NonEmptyTrimmedStringSchema).optional()
  }).strict()).optional()
}).strict();

/** 原 Ud（jsx 5902 / js 5804 区）：回合完成载荷 */
export var TurnCompletedPayloadSchema = A({
  response: w(),
  tokenCount: E().int().nonnegative(),
  usage: O().optional(),
  toolCallCount: E().int().nonnegative(),
  historyRoundCount: E().int().nonnegative().optional(),
  duration: E().nonnegative(),
  cacheStats: A({
    totalMessages: E().int().nonnegative(),
    cachedMessages: E().int().nonnegative(),
    lastCacheHit: D(),
    cacheReadTokens: E().int().nonnegative().optional()
  }).strict().optional(),
  inputId: NonEmptyTrimmedStringSchema.optional(),
  resultType: P([`success`, `cancelled`, `error_max_turns`, `error_max_budget`, `error_during_execution`, `error_max_tool_calls`])
}).strict();

/** 原 Wd（jsx 5918 / js 5829 区）：回合失败载荷 */
export var TurnFailedPayloadSchema = A({
  error: SerializedErrorSchema,
  turnPhase: w(),
  inputId: NonEmptyTrimmedStringSchema.optional()
}).strict();

/** 原 Gd（jsx 5923 / js 5830 区）：消息插入/更新载荷 */
export var MessageUpsertedPayloadSchema = A({
  content: w(),
  attachments: k(O()).optional(),
  toolCalls: k(O()).optional(),
  type: w().optional(),
  compactBoundary: O().optional()
}).strict();

/** 原 Kd（jsx 5930 / js 5837 区）：消息移除载荷 */
export var MessageRemovedPayloadSchema = A({
  messageId: NonEmptyTrimmedStringSchema,
  reason: w().optional()
}).strict();

/** 原 qd（jsx 5934 / js 5838 区）：部件增量载荷 */
export var PartDeltaPayloadSchema = A({
  messageId: NonEmptyTrimmedStringSchema,
  partId: NonEmptyTrimmedStringSchema,
  field: P([`text`, `reasoning`, `input`, `output`]).optional(),
  delta: w()
}).strict();

/** 原 Jd（jsx 5940 / js 5844 区）：部件快照载荷 */
export var PartSnapshotPayloadSchema = A({
  part: Qs
}).strict();

/** 原 Yd（jsx 5943 / js 5845 区）：部件移除载荷 */
export var PartRemovedPayloadSchema = A({
  messageId: NonEmptyTrimmedStringSchema,
  partId: NonEmptyTrimmedStringSchema,
  reason: w().optional()
}).strict();

/** 原 Xd（jsx 5948 / js 5846 区）：工具更新基础 schema */
export var ToolUpdateBaseSchema = A({
  toolCallId: NonEmptyTrimmedStringSchema,
  toolName: w().optional(),
  parentToolCallId: NonEmptyTrimmedStringSchema.optional(),
  source: P([`subagent`]).optional(),
  agentId: NonEmptyTrimmedStringSchema.optional(),
  agentType: NonEmptyTrimmedStringSchema.optional(),
  childSessionId: NonEmptyTrimmedStringSchema.optional(),
  childToolCallId: NonEmptyTrimmedStringSchema.optional(),
  description: w().optional()
}).strict();

/** 原 Zd（jsx 5959 / js 5857 区）：工具更新载荷（按 kind 判别联合） */
export var ToolUpdatedPayloadSchema = M(`kind`, [ToolUpdateBaseSchema.extend({
  kind: F(`scheduled`),
  toolName: NonEmptyTrimmedStringSchema,
  input: O().optional(),
  inputByteLength: E().int().nonnegative().optional(),
  inputOmitted: D().optional(),
  inputRef: F(`model_stream`).optional(),
  dependencies: k(NonEmptyTrimmedStringSchema).optional(),
  parallelGroupIndex: E().int().nonnegative().optional(),
  canRunParallel: D().optional(),
  schedule: JsonObjectRecordSchema.optional()
}).strict(), ToolUpdateBaseSchema.extend({
  kind: F(`started`),
  startedAt: TimestampValueSchema
}).strict(), ToolUpdateBaseSchema.extend({
  kind: F(`progress`),
  elapsedMs: E().nonnegative().optional(),
  pid: E().int().optional(),
  stdoutBytes: E().int().nonnegative().optional(),
  stderrBytes: E().int().nonnegative().optional(),
  outputBytes: E().int().nonnegative().optional(),
  stdoutTail: w().optional(),
  stderrTail: w().optional()
}).strict(), ToolUpdateBaseSchema.extend({
  kind: F(`result`),
  result: ToolResultDisplaySchema,
  duration: E().nonnegative()
}).strict(), ToolUpdateBaseSchema.extend({
  kind: F(`error`),
  error: SerializedErrorSchema
}).strict(), A({
  kind: F(`batch`),
  toolCallIds: k(NonEmptyTrimmedStringSchema),
  successCount: E().int().nonnegative(),
  errorCount: E().int().nonnegative()
}).strict(), ToolUpdateBaseSchema.extend({
  kind: F(`raw`),
  payload: JsonObjectRecordSchema
}).strict()]);

/** 原 Qd（jsx 5998 / js 5891 区）：权限请求载荷 */
export var PermissionRequestedPayloadSchema = A({
  requestId: NonEmptyTrimmedStringSchema.optional(),
  toolCallId: NonEmptyTrimmedStringSchema,
  toolName: NonEmptyTrimmedStringSchema,
  riskLevel: P([`low`, `medium`, `high`, `critical`]),
  reason: w(),
  input: O(),
  suggestedPermissionUpdates: k(Ps).optional(),
  origin: Us.optional(),
  options: k(PermissionOptionSchema).min(1)
}).strict();

/** 原 $d（jsx 6009 / js 5902 区）：权限解析载荷 */
export var PermissionResolvedPayloadSchema = A({
  requestId: NonEmptyTrimmedStringSchema.optional(),
  toolCallId: NonEmptyTrimmedStringSchema,
  toolName: NonEmptyTrimmedStringSchema.optional(),
  decision: js.optional(),
  reason: w().optional(),
  modifiedInput: O().optional(),
  inputSummary: O().optional()
}).strict();

/** 原 ef（jsx 6018 / js 5911 区）：用户输入请求载荷 */
export var UserInputRequestedPayloadSchema = A({
  requestId: NonEmptyTrimmedStringSchema,
  prompt: w(),
  inputType: P([`text`, `choice`, `confirm`]).optional(),
  choices: k(w()).optional()
}).strict();

/** 原 tf（jsx 6024 / js 5917 区）：用户输入解析载荷 */
export var UserInputResolvedPayloadSchema = A({
  requestId: NonEmptyTrimmedStringSchema,
  value: O().optional(),
  cancelled: D().optional()
}).strict();

/** 原 nf（jsx 6029 / js 5918 区）：会话关闭载荷 */
export var SessionClosedPayloadSchema = A({
  reason: w().optional()
}).strict();

/** 原 Y（jsx 6032 / js 5919 区）：会话事件构造器（信封 + 类型 + 载荷） */
export function sessionEvent(e: any, t: any) {
  return SessionEventEnvelopeBaseSchema.extend({
    type: F(e),
    payload: t.optional()
  });
}

/** 原 rf（jsx 6038 / js 5922 区）：会话事件判别联合 */
export var SessionEventSchema = M(`type`, [sessionEvent(`session.created`, SessionCreatedPayloadSchema), sessionEvent(`session.resumed`, SessionResumedPayloadSchema), sessionEvent(`session.updated`, JsonObjectRecordSchema), sessionEvent(`session.titleUpdated`, SessionTitleUpdatedPayloadSchema), sessionEvent(`session.closed`, SessionClosedPayloadSchema), sessionEvent(`turn.started`, TurnStartedPayloadSchema), sessionEvent(`turn.steerQueued`, TurnSteerQueuedPayloadSchema), sessionEvent(`turn.steerDrained`, TurnSteerDrainedPayloadSchema), sessionEvent(`turn.completed`, TurnCompletedPayloadSchema), sessionEvent(`turn.failed`, TurnFailedPayloadSchema), sessionEvent(`message.upserted`, MessageUpsertedPayloadSchema), sessionEvent(`message.removed`, MessageRemovedPayloadSchema), sessionEvent(`part.started`, PartSnapshotPayloadSchema), sessionEvent(`part.delta`, PartDeltaPayloadSchema), sessionEvent(`part.upserted`, PartSnapshotPayloadSchema), sessionEvent(`part.removed`, PartRemovedPayloadSchema), sessionEvent(`model.streaming`, ModelStreamingPayloadSchema), sessionEvent(`tool.updated`, ToolUpdatedPayloadSchema), sessionEvent(`permission.requested`, PermissionRequestedPayloadSchema), sessionEvent(`permission.resolved`, PermissionResolvedPayloadSchema), sessionEvent(`userInput.requested`, UserInputRequestedPayloadSchema), sessionEvent(`userInput.resolved`, UserInputResolvedPayloadSchema), sessionEvent(`checkpoint.created`, JsonObjectRecordSchema), sessionEvent(`rewind.triggered`, JsonObjectRecordSchema), sessionEvent(`streamRecovery.updated`, JsonObjectRecordSchema)]);

/* 原匿名表达式（jsx 6039）：事件批量/消息/状态更新/订阅/投递/列表 schema 组 */
A({
  events: k(SessionEventSchema)
}).strict(), A({
  messages: k($s)
}).strict(), A({
  type: F(`state.updated`),
  scope: P([`server`, `workspace`, `session`]),
  workspace: B.optional(),
  sessionId: NonEmptyTrimmedStringSchema.optional(),
  revision: E().int().nonnegative(),
  reason: w().optional(),
  patch: O()
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  deliveryKind: Os,
  afterSeq: E().int().nonnegative().optional(),
  includeSnapshot: D().default(!1)
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  eventSeq: E().int().nonnegative(),
  events: k(SessionEventSchema),
  snapshot: SessionSnapshotSchema.optional()
}).strict(), A({
  sessions: k(Hs)
}).strict();

/** 原 af（jsx 6064 / js 5973 区）：子代理会话基础 */
export var SubagentSessionBaseSchema = A({
  childSessionId: NonEmptyTrimmedStringSchema,
  agentId: NonEmptyTrimmedStringSchema.optional(),
  toolCallId: NonEmptyTrimmedStringSchema.optional(),
  subagentType: NonEmptyTrimmedStringSchema,
  title: NonEmptyTrimmedStringSchema,
  summary: w().optional(),
  startedAt: E().int().nonnegative().optional(),
  endedAt: E().int().nonnegative().optional()
}).strict();

/** 原 of（jsx 6074 / js 5983 区）：活动子代理 */
export var ActiveSubagentSchema = SubagentSessionBaseSchema.extend({
  status: P([`running`, `waiting`, `blocked`])
});

/** 原 sf（jsx 6077 / js 5984 区）：已结束子代理 */
export var EndedSubagentSchema = SubagentSessionBaseSchema.extend({
  status: P([`success`, `failed`, `cancelled`, `lost`])
});

/* 原匿名表达式（jsx 6080）：子代理列表状态 */
A({
  revision: E().int().nonnegative(),
  childSessionIds: k(NonEmptyTrimmedStringSchema),
  running: k(ActiveSubagentSchema),
  ended: A({
    total: E().int().nonnegative(),
    items: k(EndedSubagentSchema),
    nextCursor: NonEmptyTrimmedStringSchema.optional()
  }).strict()
}).strict();

/** 原 cf（jsx 6090 / js 5991 区）：工作区状态 */
export var WorkspaceStateSchema = A({
  workspace: B,
  settings: SessionSettingsStateSchema,
  modelCatalog: ModelCatalogSnapshotSchema.optional(),
  slashCommands: k(SlashCommandSchema).optional()
}).strict();


/* ============================================================================
 * §7 会话 RPC 请求/响应 schema（jsx 6096–6796 / js 6062–6544 区）
 *    大量匿名 A({...}).strict() 请求/响应体按原逗号表达式结构保留。
 * §8 RPC 方法目录（jsx 6797–6856 / js 6651–6651 区）
 * ==========================================================================*/

/* 原匿名表达式（jsx 6096）：会话创建/更新/列表/子代理/用量等请求响应链 */
A({
  sessionId: NonEmptyTrimmedStringSchema.optional(),
  workspace: B,
  parentSessionId: NonEmptyTrimmedStringSchema.optional(),
  mode: Is.optional(),
  model: V.optional(),
  runtimeModel: RuntimeModelSelectionSchema.optional(),
  persistence: SessionPersistenceEnum.optional(),
  thoughtLevel: NonEmptyTrimmedStringSchema.optional(),
  titleGenerationEnabled: D().optional(),
  mcpServers: k(McpServerConfigSchema).optional(),
  toolAllowlist: k(NonEmptyTrimmedStringSchema).optional(),
  toolDenylist: k(NonEmptyTrimmedStringSchema).optional(),
  importedHistory: ImportedClaudeHistorySchema.optional()
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  workspace: B.optional(),
  runtimeModel: RuntimeModelSelectionSchema.optional(),
  thoughtLevel: NonEmptyTrimmedStringSchema.optional(),
  mcpServers: k(McpServerConfigSchema).optional(),
  toolAllowlist: k(NonEmptyTrimmedStringSchema).optional(),
  toolDenylist: k(NonEmptyTrimmedStringSchema).optional()
}).strict(), A({
  workspace: B.optional(),
  includeArchived: D().default(!1),
  limit: E().int().positive().optional()
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  endedCursor: NonEmptyTrimmedStringSchema.optional(),
  endedLimit: E().int().positive().max(100).default(20)
}).strict(), A({
  range: P(ms),
  timeZone: w().optional()
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  totalTokens: E().int().nonnegative(),
  inputTokens: E().int().nonnegative(),
  outputTokens: E().int().nonnegative(),
  reasoningTokens: E().int().nonnegative(),
  cacheCreationTokens: E().int().nonnegative(),
  cacheReadTokens: E().int().nonnegative(),
  modelRequestCount: E().int().nonnegative(),
  modelErrorCount: E().int().nonnegative(),
  inputBaselineBySource: N(w(), E().int().nonnegative())
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  deliveryKind: Os.optional(),
  messageLimit: E().int().positive().optional(),
  afterSeq: E().int().nonnegative().optional()
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  afterMessageId: NonEmptyTrimmedStringSchema.optional(),
  limit: E().int().positive().optional()
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  afterSeq: E().int().nonnegative().optional(),
  limit: E().int().positive().optional()
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  scope: P([`runtime-materialization`, `user-execution`])
}).strict();

/** 原 lf（jsx 6159 / js 6062）：预检协议版本常量 */
export var PREFLIGHT_PROTOCOL_VERSION = `preflight-v1`;

/** 原 uf（jsx 6160 / js 6063）：模型上下文预算策略枚举 */
export var ModelContextBudgetStrategyEnum = P([`legacy`, `preflight-v1`]);

/* 原匿名表达式（jsx 6161）：运行时偏好请求 */
A({
  nativeSearchEnhancementsEnabled: D(),
  memoryEnabled: D().default(!1),
  askUserQuestionAutoResolutionEnabled: D().default(!0),
  integratedTerminalShell: Jc.optional(),
  modelContextBudgetStrategy: ModelContextBudgetStrategyEnum.default(PREFLIGHT_PROTOCOL_VERSION)
}).strict();

/** 原 df（jsx 6168 / js 6071）：浏览器环境上下文 */
export var BrowserAmbientContextSchema = A({
  tabCount: E().int().positive().max(100),
  currentUrl: w().trim().min(1).max(4096).optional()
}).strict();

/* 原匿名表达式（jsx 6172）：会话发送/确认/回退/分叉/压缩请求响应链 */
A({
  sessionId: NonEmptyTrimmedStringSchema,
  inputId: NonEmptyTrimmedStringSchema.optional(),
  queryId: NonEmptyTrimmedStringSchema.optional(),
  content: w(),
  attachments: k(JsonObjectRecordSchema).optional(),
  browserAmbientContext: BrowserAmbientContextSchema.optional(),
  expectedRevision: E().int().nonnegative().optional(),
  expectedProviderRevision: NonEmptyTrimmedStringSchema.optional(),
  expectedModelRuntimeRevision: NonEmptyTrimmedStringSchema.optional(),
  runtimeModel: RuntimeModelSelectionSchema.optional(),
  automationId: NonEmptyTrimmedStringSchema.optional(),
  offPeakTaskId: NonEmptyTrimmedStringSchema.optional(),
  offPeakRunType: P([`init`, `resume`]).optional(),
  botDeliveryTarget: sc.optional(),
  toolDenylist: k(NonEmptyTrimmedStringSchema).optional()
}).strict().superRefine((e: any, t: any) => {
  e.automationId && e.offPeakTaskId && t.addIssue({
    code: Ao.custom,
    message: `automationId and offPeakTaskId are mutually exclusive`
  }), e.offPeakRunType && !e.offPeakTaskId && t.addIssue({
    code: Ao.custom,
    message: `offPeakRunType requires offPeakTaskId`,
    path: [`offPeakRunType`]
  });
}), A({
  sessionId: NonEmptyTrimmedStringSchema,
  accepted: F(!0),
  stateRevision: E().int().nonnegative(),
  modelRuntimeRevision: NonEmptyTrimmedStringSchema.optional()
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  target: M(`kind`, [A({
    kind: F(`turn`),
    turnIndex: E().int().nonnegative()
  }).strict(), A({
    kind: F(`message`),
    messageId: NonEmptyTrimmedStringSchema
  }).strict(), A({
    kind: F(`checkpoint`),
    checkpointId: NonEmptyTrimmedStringSchema
  }).strict(), A({
    kind: F(`latestCheckpoint`)
  }).strict()]).default({
    kind: `latestCheckpoint`
  }),
  expectedRevision: E().int().nonnegative().optional()
}).strict(), A({
  forkedSessionId: NonEmptyTrimmedStringSchema,
  parentSessionId: NonEmptyTrimmedStringSchema.optional(),
  targetMessageId: NonEmptyTrimmedStringSchema.optional(),
  targetCheckpointId: NonEmptyTrimmedStringSchema.optional(),
  response: w(),
  snapshot: SessionSnapshotSchema
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  inputId: NonEmptyTrimmedStringSchema.optional(),
  instructions: w().optional(),
  expectedRevision: E().int().nonnegative().optional(),
  runtimeModel: RuntimeModelSelectionSchema.optional()
}).strict(), A({
  response: w(),
  snapshot: SessionSnapshotSchema,
  compact: A({
    state: P([`accepted`, `already_running`]),
    inputId: NonEmptyTrimmedStringSchema.optional(),
    operationId: NonEmptyTrimmedStringSchema.optional()
  }).strict().optional()
}).strict();

/** 原 ff（jsx 6241 / js 6150）：目标队列动作枚举 */
export var GoalQueueActionEnum = P([`show`, `set`, `replace`, `pause`, `resume`, `clear`]);

/* 原匿名表达式（jsx 6242）：目标请求/响应链 */
A({
  sessionId: NonEmptyTrimmedStringSchema,
  inputId: NonEmptyTrimmedStringSchema.optional(),
  action: GoalQueueActionEnum,
  objective: w().optional(),
  expectedRevision: E().int().nonnegative().optional()
}).strict(), A({
  response: w(),
  snapshot: SessionSnapshotSchema,
  startedTurn: D().optional()
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema
}).strict();

/** 原 pf（jsx 6255 / js 6160）：后台任务状态枚举 */
export var BackgroundTaskStatusEnum = P([`running`, `completed`, `failed`, `timed_out`, `cancelled`, `spawn_error`, `lost`]);

/** 原 mf（jsx 6256 / js 6161）：后台任务 */
export var BackgroundTaskSchema = A({
  taskId: NonEmptyTrimmedStringSchema,
  toolCallId: NonEmptyTrimmedStringSchema.optional(),
  toolName: NonEmptyTrimmedStringSchema.optional(),
  taskKind: P([`bash`, `subagent`]).optional(),
  blocked: D().optional(),
  blockedReason: w().optional(),
  cancellable: D().optional(),
  cancelRequestedAt: TimestampValueSchema.optional(),
  command: w().optional(),
  description: w().optional(),
  status: BackgroundTaskStatusEnum,
  pid: E().int().positive().optional(),
  startedAt: TimestampValueSchema.optional(),
  completedAt: TimestampValueSchema.optional(),
  outputPath: w().optional(),
  stderrPersistedOutputPath: w().optional(),
  stdoutPersistedOutputPath: w().optional(),
  outputBytes: E().int().nonnegative().optional(),
  outputTruncated: D().optional(),
  outputTail: w().optional(),
  stderrBytes: E().int().nonnegative().optional(),
  stderrTail: w().optional(),
  stdoutBytes: E().int().nonnegative().optional(),
  stdoutTail: w().optional(),
  terminalId: NonEmptyTrimmedStringSchema.optional()
}).strict();

/* 原匿名表达式（jsx 6283）：后台任务取消/模型设置/模式设置请求响应链 */
A({
  sessionId: NonEmptyTrimmedStringSchema,
  taskId: NonEmptyTrimmedStringSchema
}).strict(), A({
  cancelled: D(),
  reason: w().optional(),
  snapshot: BackgroundTaskSchema.optional(),
  status: BackgroundTaskStatusEnum,
  taskId: NonEmptyTrimmedStringSchema
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  model: V,
  runtimeModel: RuntimeModelSelectionSchema.optional(),
  expectedRevision: E().int().nonnegative().optional(),
  persistAsWorkspaceLastUsed: D().default(!0)
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  thoughtLevel: NonEmptyTrimmedStringSchema.optional(),
  runtimeModel: RuntimeModelSelectionSchema.optional(),
  expectedRevision: E().int().nonnegative().optional(),
  persistAsWorkspaceLastUsed: D().default(!0)
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  runtimeModel: RuntimeModelSelectionSchema,
  applyModelSelection: D().default(!0)
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  mode: Is,
  expectedRevision: E().int().nonnegative().optional()
}).strict(), A({
  sessionId: NonEmptyTrimmedStringSchema,
  expectedPersistence: SessionPersistenceEnum.optional()
}).strict(), A({
  closed: D().optional()
}).strict(), A({
  workspace: B,
  runtimeModel: RuntimeModelSelectionSchema.optional(),
  preferWorkspaceDefaults: D().optional()
}).strict(), A({
  workspace: B,
  modelRef: V,
  prompt: NonEmptyTrimmedStringSchema,
  querySource: NonEmptyTrimmedStringSchema,
  maxOutputTokens: E().int().positive().optional(),
  temperature: E().min(0).max(2).optional()
}).strict(), A({
  text: w(),
  modelRef: V
}).strict();

/** 原 hf（jsx 6332 / js 6224）：工作区供应商注册表 */
export var WorkspaceProviderRegistrySchema = A({
  revision: NonEmptyTrimmedStringSchema,
  generatedAt: NonNegativeIntegerSchema,
  providers: k(RuntimeProviderWithInlineKeySchema)
}).strict();

/** 原 gf（jsx 6337 / js 6225）：注册表应用状态枚举 */
export var ProviderRegistryApplyStatusEnum = P([`applied`, `unchanged`, `failed`]);

/* 原匿名表达式（jsx 6338）：工作区注册表/偏好/供应商增删/默认值请求响应链 */
A({
  workspace: B,
  registry: WorkspaceProviderRegistrySchema,
  includeWorkspaceState: D().optional()
}).strict(), A({
  workspace: B,
  appliedProviderRevision: NonEmptyTrimmedStringSchema,
  status: ProviderRegistryApplyStatusEnum,
  providerCount: E().int().nonnegative(),
  workspaceState: WorkspaceStateSchema.optional()
}).strict(), A({
  workspace: B,
  preferences: A({
    askUserQuestionAutoResolutionEnabled: D()
  }).strict()
}).strict(), A({
  workspace: B,
  askUserQuestionAutoResolutionEnabled: D(),
  snoozedInteractionCount: E().int().nonnegative()
}).strict(), A({
  workspace: B,
  provider: RuntimeProviderWithInlineKeySchema,
  expectedWorkspaceRevision: E().int().nonnegative().optional()
}).strict(), A({
  workspace: B,
  providerId: NonEmptyTrimmedStringSchema,
  expectedWorkspaceRevision: E().int().nonnegative().optional()
}).strict(), A({
  workspace: B,
  model: V,
  runtimeModel: RuntimeModelSelectionSchema.optional(),
  expectedWorkspaceRevision: E().int().nonnegative().optional()
}).strict(), A({
  workspace: B,
  thoughtLevel: NonEmptyTrimmedStringSchema,
  expectedWorkspaceRevision: E().int().nonnegative().optional()
}).strict(), A({
  workspace: B,
  mode: Is,
  expectedWorkspaceRevision: E().int().nonnegative().optional()
}).strict(), A({
  requestId: NonEmptyTrimmedStringSchema,
  sessionId: NonEmptyTrimmedStringSchema,
  turnId: NonEmptyTrimmedStringSchema.optional(),
  toolCallId: NonEmptyTrimmedStringSchema,
  toolName: NonEmptyTrimmedStringSchema,
  reason: w(),
  riskLevel: P([`low`, `medium`, `high`, `critical`]),
  input: O(),
  origin: Us.optional(),
  options: k(PermissionOptionSchema).min(1)
}).strict(), A({
  requestId: NonEmptyTrimmedStringSchema,
  sessionId: NonEmptyTrimmedStringSchema,
  turnId: NonEmptyTrimmedStringSchema.optional(),
  workspaceKey: NonEmptyTrimmedStringSchema,
  workspacePath: NonEmptyTrimmedStringSchema,
  workspaceIdentity: NonEmptyTrimmedStringSchema.optional(),
  remoteSessionId: NonEmptyTrimmedStringSchema.optional(),
  clientMode: Fo,
  sessionContext: Xo
}).strict(), A({
  requestId: NonEmptyTrimmedStringSchema,
  sessionId: NonEmptyTrimmedStringSchema,
  turnId: NonEmptyTrimmedStringSchema.optional(),
  browserId: NonEmptyTrimmedStringSchema.optional(),
  browserGeneration: E().int().nonnegative().optional(),
  workspaceKey: NonEmptyTrimmedStringSchema.optional(),
  workspacePath: NonEmptyTrimmedStringSchema.optional(),
  workspaceIdentity: NonEmptyTrimmedStringSchema.optional(),
  remoteSessionId: NonEmptyTrimmedStringSchema.optional(),
  clientMode: Fo.optional(),
  sessionContext: Xo.optional(),
  command: Ko
}).strict();

/** 原 _f（jsx 6413 / js 6306）：ask-user 问题 */
export var AskUserQuestionSchema = A({
  question: NonEmptyTrimmedStringSchema,
  header: NonEmptyTrimmedStringSchema,
  options: k(A({
    value: NonEmptyTrimmedStringSchema,
    label: NonEmptyTrimmedStringSchema,
    description: w().optional(),
    preview: w().optional()
  }).strict()).min(1),
  multiSelect: D().optional()
}).strict();

/* 原匿名表达式（jsx 6424）：用户输入请求/应答 */
A({
  requestId: NonEmptyTrimmedStringSchema,
  sessionId: NonEmptyTrimmedStringSchema,
  turnId: NonEmptyTrimmedStringSchema.optional(),
  toolCallId: NonEmptyTrimmedStringSchema.optional(),
  toolName: NonEmptyTrimmedStringSchema.optional(),
  prompt: w().optional(),
  questions: k(AskUserQuestionSchema).min(1).optional(),
  input: O().optional(),
  origin: Us.optional(),
  schema: O().optional()
}).strict(), A({
  action: P([`accept`, `decline`, `cancel`]),
  content: JsonObjectRecordSchema.optional(),
  reason: w().optional()
}).strict();

/** 原 vf（jsx 6440 / js 6331）：供应商运行时头部请求原因枚举 */
export var CredentialPromptReasonEnum = P([`model-request`, `captcha-retry`]);

/* 原匿名表达式（jsx 6441）：供应商运行时头部请求/响应 */
A({
  requestId: NonEmptyTrimmedStringSchema,
  sessionId: NonEmptyTrimmedStringSchema,
  turnId: NonEmptyTrimmedStringSchema.optional(),
  workspace: B,
  modelRef: V,
  providerId: NonEmptyTrimmedStringSchema,
  reason: CredentialPromptReasonEnum
}).strict(), A({
  headersApplied: D(),
  errorMessage: NonEmptyTrimmedStringSchema.optional(),
  providerRevision: NonEmptyTrimmedStringSchema.optional()
}).strict();

/** 原 yf（jsx 6454 / js 6342）：插件配置值（字符串/数字/布尔） */
export var PluginConfigValueSchema = j([w(), E(), D()]);

/** 原 bf（jsx 6455 / js 6343）：插件 hook 明细 */
export var PluginHookDetailSchema = A({
  event: NonEmptyTrimmedStringSchema,
  matcher: w().optional(),
  type: P([`command`, `process`]),
  command: NonEmptyTrimmedStringSchema,
  args: k(w()).optional(),
  async: D().optional(),
  shell: j([F(!0), w()]).optional(),
  timeout: E().positive().optional(),
  timeoutMs: E().int().positive().optional(),
  statusMessage: w().optional(),
  sourcePath: w(),
  runnable: D()
}).strict();

/** 原 xf（jsx 6469 / js 6357）：插件用户配置选项 */
export var PluginUserConfigOptionSchema = A({
  default: PluginConfigValueSchema.optional(),
  description: w().optional(),
  required: D().optional(),
  sensitive: D().optional(),
  title: w().optional(),
  type: P([`string`, `number`, `boolean`, `directory`, `file`]).optional()
}).strict();

/** 原 Sf（jsx 6477 / js 6365）：插件组件分组 */
export var PluginComponentGroupSchema = A({
  kind: P([`agent`, `command`, `skill`, `hook`, `mcp`]),
  items: k(A({
    name: NonEmptyTrimmedStringSchema,
    description: w().optional()
  }).strict())
}).strict();

/** 原 Cf（jsx 6484 / js 6369）：插件描述符 */
export var PluginDescriptorSchema = A({
  id: NonEmptyTrimmedStringSchema,
  name: NonEmptyTrimmedStringSchema,
  description: w().optional(),
  version: w().optional(),
  enabled: D(),
  source: NonEmptyTrimmedStringSchema,
  marketplace: NonEmptyTrimmedStringSchema,
  author: w().optional(),
  authorUrl: w().optional(),
  homepage: w().optional(),
  skillCount: E().int().nonnegative().optional(),
  skillRootCount: E().int().nonnegative(),
  commandRootCount: E().int().nonnegative(),
  components: k(PluginComponentGroupSchema).optional(),
  declaredMcpServerNames: k(w()).optional(),
  hostMcpServerNames: k(w()).optional(),
  mcpServerNames: k(w()),
  hookDetails: k(PluginHookDetailSchema).optional(),
  rootPath: w(),
  userConfig: N(w(), PluginUserConfigOptionSchema).optional(),
  configuredOptions: N(w(), PluginConfigValueSchema).optional()
}).strict();

/** 原 wf（jsx 6507 / js 6392）：插件诊断项 */
export var PluginDiagnosticSchema = A({
  code: w(),
  message: w(),
  severity: P([`warning`, `error`]).optional(),
  pluginId: w().optional()
}).strict();

/* 原匿名表达式（jsx 6513）：插件列表请求/响应 */
A({
  workspace: B
}).strict(), A({
  plugins: k(PluginDescriptorSchema),
  diagnostics: k(PluginDiagnosticSchema)
}).strict();

/** 原 Tf（jsx 6519 / js 6399）：插件权限条目 */
export var PluginAuthorityEntrySchema = A({
  pluginId: NonEmptyTrimmedStringSchema,
  name: NonEmptyTrimmedStringSchema,
  marketplace: NonEmptyTrimmedStringSchema,
  icon: w().optional(),
  enabled: D(),
  conflictingPluginIds: k(NonEmptyTrimmedStringSchema),
  skillQualifiedNames: k(NonEmptyTrimmedStringSchema),
  mcpServerNames: k(NonEmptyTrimmedStringSchema),
  subagentNames: k(NonEmptyTrimmedStringSchema).default([])
}).strict();

/* 原匿名表达式（jsx 6530）：插件权限/启用请求响应链 */
A({
  workspace: B,
  sessionId: NonEmptyTrimmedStringSchema.optional()
}).strict(), A({
  authority: P([`session`, `workspace`]),
  plugins: k(PluginAuthorityEntrySchema)
}).strict(), A({
  workspace: B,
  pluginId: NonEmptyTrimmedStringSchema,
  enabled: D()
}).strict(), A({
  plugin: PluginDescriptorSchema,
  enabled: D()
}).strict();

/** 原 Ef（jsx 6544 / js 6414）：插件安装作用域枚举 */
export var PluginInstallScopeEnum = P([`user`, `workspace`]);

/** 原 Df（jsx 6545 / js 6415）：插件市场条目元数据 */
export var PluginListingSchema = A({
  displayName: w().optional(),
  displayNameI18n: N(w(), w()).optional(),
  descriptionI18n: N(w(), w()).optional(),
  icon: w().optional(),
  category: w().optional(),
  author: w().optional(),
  authorUrl: w().optional(),
  homepage: w().optional(),
  privacyPolicy: w().optional(),
  termsOfService: w().optional(),
  heroImage: w().optional(),
  examplePrompts: k(w()).optional(),
  examplePromptsI18n: N(w(), k(w())).optional()
}).strict();

/** 原 Of（jsx 6560 / js 6430）：插件市场 */
export var PluginMarketplaceSchema = A({
  id: NonEmptyTrimmedStringSchema,
  name: NonEmptyTrimmedStringSchema,
  source: JsonObjectRecordSchema,
  description: w().optional(),
  lastUpdated: w().optional(),
  pluginCount: E().int().nonnegative(),
  isOfficial: D().optional(),
  featured: k(w()).optional(),
  refreshFailure: A({
    code: w(),
    failedAt: w(),
    message: w()
  }).strict().optional()
}).strict();

/** 原 kf（jsx 6575 / js 6441）：可用插件条目 */
export var AvailablePluginEntrySchema = A({
  id: NonEmptyTrimmedStringSchema,
  name: NonEmptyTrimmedStringSchema,
  marketplace: NonEmptyTrimmedStringSchema,
  description: w().optional(),
  version: w().optional(),
  installed: D(),
  componentTypes: k(w()).optional(),
  listing: PluginListingSchema.optional()
}).strict();

/** 原 Af（jsx 6585 / js 6451）：已安装插件条目 */
export var InstalledPluginEntrySchema = A({
  id: NonEmptyTrimmedStringSchema,
  name: NonEmptyTrimmedStringSchema,
  marketplace: NonEmptyTrimmedStringSchema,
  description: w().optional(),
  version: w().optional(),
  enabled: D(),
  scope: PluginInstallScopeEnum,
  installPath: w().optional(),
  installedAt: w().optional(),
  componentTypes: k(w()).optional(),
  hookDetails: k(PluginHookDetailSchema).optional(),
  updateStatus: P([`none`, `update-available`, `version-changed`]).optional(),
  latestVersion: w().optional(),
  listing: PluginListingSchema.optional()
}).strict();

/* 原匿名表达式（jsx 6601）：插件总览/市场增删改/安装/卸载/配置/校验请求响应链 */
A({
  workspace: B
}).strict(), A({
  marketplaces: k(PluginMarketplaceSchema),
  availablePlugins: k(AvailablePluginEntrySchema),
  installedPlugins: k(InstalledPluginEntrySchema),
  restorableBuiltins: k(AvailablePluginEntrySchema),
  diagnostics: k(PluginDiagnosticSchema),
  capability: A({
    supported: D(),
    reason: w().optional()
  }).strict()
}).strict(), A({
  workspace: B,
  source: NonEmptyTrimmedStringSchema,
  dryRun: D().optional(),
  operationId: NonEmptyTrimmedStringSchema.optional()
}).strict(), A({
  workspace: B,
  marketplace: NonEmptyTrimmedStringSchema
}).strict(), A({
  workspace: B,
  marketplace: NonEmptyTrimmedStringSchema.optional()
}).strict(), A({
  marketplace: PluginMarketplaceSchema.optional(),
  marketplaces: k(PluginMarketplaceSchema).optional(),
  diagnostics: k(PluginDiagnosticSchema).optional()
}).strict(), A({
  workspace: B,
  pluginName: NonEmptyTrimmedStringSchema,
  marketplace: NonEmptyTrimmedStringSchema,
  scope: PluginInstallScopeEnum.optional(),
  dryRun: D().optional(),
  operationId: NonEmptyTrimmedStringSchema.optional()
}).strict(), A({
  operationId: NonEmptyTrimmedStringSchema
}).strict(), A({
  operationId: NonEmptyTrimmedStringSchema,
  cancelled: D()
}).strict(), A({
  workspace: B,
  pluginId: NonEmptyTrimmedStringSchema.optional(),
  pluginName: NonEmptyTrimmedStringSchema.optional(),
  marketplace: NonEmptyTrimmedStringSchema.optional(),
  removeCache: D().optional()
}).strict(), A({
  installedPlugins: k(InstalledPluginEntrySchema),
  dependencyClosure: k(w()),
  diagnostics: k(PluginDiagnosticSchema)
}).strict(), A({
  removedPlugin: InstalledPluginEntrySchema.optional(),
  diagnostics: k(PluginDiagnosticSchema)
}).strict(), A({
  workspace: B,
  pluginId: NonEmptyTrimmedStringSchema.optional(),
  marketplace: NonEmptyTrimmedStringSchema.optional()
}).strict(), A({
  workspace: B,
  pluginId: NonEmptyTrimmedStringSchema
}).strict(), A({
  pluginId: NonEmptyTrimmedStringSchema,
  diagnostics: k(PluginDiagnosticSchema)
}).strict(), A({
  workspace: B,
  pluginId: NonEmptyTrimmedStringSchema,
  options: JsonObjectRecordSchema,
  dryRun: D().optional()
}).strict(), A({
  pluginId: NonEmptyTrimmedStringSchema,
  diagnostics: k(PluginDiagnosticSchema)
}).strict(), A({
  workspace: B,
  pluginName: NonEmptyTrimmedStringSchema.optional(),
  marketplace: NonEmptyTrimmedStringSchema.optional(),
  source: NonEmptyTrimmedStringSchema.optional()
}).strict(), A({
  ok: D(),
  diagnostics: k(PluginDiagnosticSchema),
  compatibility: A({
    runnable: k(w()),
    diagnosticOnly: k(w()),
    unsupported: k(w())
  }).strict()
}).strict(), A({
  workspace: B,
  pluginName: NonEmptyTrimmedStringSchema,
  marketplace: NonEmptyTrimmedStringSchema
}).strict(), A({
  components: k(PluginComponentGroupSchema),
  diagnostics: k(PluginDiagnosticSchema).optional(),
  metadata: A({
    author: w().optional(),
    authorUrl: w().optional(),
    homepage: w().optional(),
    version: w().optional()
  }).strict().optional()
}).strict();

/** 原 jf（jsx 6698 / js 6532）：自动化调度规则 */
export var AutomationScheduleRuleSchema = A({
  unit: P([`minute`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`]),
  interval: E().int().positive(),
  hour: E().int().min(0).max(23),
  minute: E().int().min(0).max(59),
  anchorAt: E().int(),
  weekdays: k(E().int().min(0).max(6)).optional(),
  monthDays: k(E().int().min(1).max(31)).optional(),
  months: k(E().int().min(1).max(12)).optional(),
  monthlyMode: P([`date`, `weekday`]).optional()
}).strict();

/** 原 Mf（jsx 6709 / js 6543）：自动化间隔单位枚举 */
export var AutomationIntervalUnitEnum = P([`minute`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`]);

/** 原 Nf（jsx 6710 / js 6544）：自动化记录 */
export var AutomationRecordSchema = A({
  automationId: NonEmptyTrimmedStringSchema,
  title: w(),
  cronExpr: NonEmptyTrimmedStringSchema,
  prompt: NonEmptyTrimmedStringSchema,
  model: w().optional(),
  provider: I.optional(),
  mode: hl.optional(),
  thoughtLevel: NonEmptyTrimmedStringSchema.optional(),
  targetTaskId: NonEmptyTrimmedStringSchema.optional(),
  enabled: D(),
  lifecycleStatus: P([`active`, `completed`, `failed`, `paused`]),
  nextRunAt: NonNegativeIntegerSchema.optional(),
  lastRunAt: NonNegativeIntegerSchema.optional(),
  runCount: E().int().nonnegative(),
  recurring: D(),
  maxRuns: E().int().positive().optional(),
  scheduleRule: AutomationScheduleRuleSchema.optional()
}).strict();

/* 原匿名表达式（jsx 6729）：自动化创建/更新/绑定/列表/删除请求响应链 */
A({
  title: w().optional(),
  cronExpr: NonEmptyTrimmedStringSchema,
  relativeDelayMinutes: E().int().positive().max(525600).optional(),
  prompt: NonEmptyTrimmedStringSchema,
  model: w().optional(),
  provider: I.optional(),
  mode: hl.optional(),
  thoughtLevel: NonEmptyTrimmedStringSchema.optional(),
  targetTaskId: NonEmptyTrimmedStringSchema.optional(),
  botDeliveryTarget: sc.optional(),
  recurring: D().optional(),
  maxRuns: E().int().positive().optional(),
  intervalUnit: AutomationIntervalUnitEnum.optional(),
  interval: E().int().min(1).max(200).optional()
}).strict().refine((e: any) => e.intervalUnit === void 0 == (e.interval === void 0), {
  message: `intervalUnit and interval must be set together`,
  path: [`interval`]
}).refine((e: any) => e.intervalUnit === void 0 || e.relativeDelayMinutes === void 0, {
  message: `intervalUnit cannot combine with a relative delayMinutes`,
  path: [`intervalUnit`]
}).refine((e: any) => e.intervalUnit === void 0 || e.recurring !== !1, {
  message: `intervalUnit is a recurring carrier and cannot combine with recurring=false`,
  path: [`recurring`]
}).refine((e: any) => e.intervalUnit === void 0 || e.maxRuns === void 0, {
  message: `intervalUnit is a recurring carrier and cannot combine with maxRuns`,
  path: [`maxRuns`]
}), A({
  automation: AutomationRecordSchema
}).strict(), A({
  automationId: NonEmptyTrimmedStringSchema,
  title: NonEmptyTrimmedStringSchema.optional(),
  cronExpr: NonEmptyTrimmedStringSchema.optional(),
  prompt: NonEmptyTrimmedStringSchema.optional(),
  recurring: D().optional(),
  maxRuns: E().int().positive().nullable().optional(),
  intervalUnit: AutomationIntervalUnitEnum.optional(),
  interval: E().int().min(1).max(200).optional()
}).strict().refine((e: any) => e.title !== void 0 || e.cronExpr !== void 0 || e.prompt !== void 0 || e.recurring !== void 0 || e.maxRuns !== void 0 || e.intervalUnit !== void 0, {
  message: `automation update requires at least one field`
}).refine((e: any) => e.maxRuns !== null || e.recurring === !0, {
  message: `clearing maxRuns requires recurring=true`,
  path: [`maxRuns`]
}).refine((e: any) => e.recurring !== !0 || typeof e.maxRuns != `number`, {
  message: `recurring=true cannot be combined with a numeric maxRuns`,
  path: [`maxRuns`]
}).refine((e: any) => e.intervalUnit === void 0 == (e.interval === void 0), {
  message: `intervalUnit and interval must be set together`,
  path: [`interval`]
}).refine((e: any) => e.intervalUnit === void 0 || e.recurring !== !1, {
  message: `intervalUnit is a recurring carrier and cannot combine with recurring=false`,
  path: [`recurring`]
}).refine((e: any) => e.intervalUnit === void 0 || e.maxRuns === void 0 || e.maxRuns === null && e.recurring === !0, {
  message: `intervalUnit is a recurring carrier and only allows maxRuns=null with recurring=true`,
  path: [`maxRuns`]
}), A({
  automation: AutomationRecordSchema
}).strict(), A({}).strict(), A({
  automations: k(AutomationRecordSchema)
}).strict(), A({
  targetTaskId: NonEmptyTrimmedStringSchema
}).strict(), A({
  bound: D()
}).strict(), A({
  automationId: NonEmptyTrimmedStringSchema
}).strict(), A({
  deleted: D()
}).strict();

/** 原 Pf（jsx 6797 / js 6651）：ZCode RPC 方法目录 */
export var ZcodeRpcMethods = {
  sessionCreate: `session/create`,
  sessionResume: `session/resume`,
  sessionList: `session/list`,
  sessionSubagents: `session/subagents`,
  sessionRequestRuntimePreferences: `session/requestRuntimePreferences`,
  sessionRead: `session/read`,
  sessionMessages: `session/messages`,
  sessionEvents: `session/events`,
  sessionSubscribe: `session/subscribe`,
  sessionSend: `session/send`,
  sessionStop: `session/stop`,
  sessionCancelBackgroundTask: `session/cancelBackgroundTask`,
  sessionFork: `session/fork`,
  sessionCompact: `session/compact`,
  sessionGoal: `session/goal`,
  sessionClose: `session/close`,
  sessionSetModel: `session/setModel`,
  sessionSetThoughtLevel: `session/setThoughtLevel`,
  sessionUpdateRuntimeModelConfig: `session/updateRuntimeModelConfig`,
  sessionSetMode: `session/setMode`,
  workspaceReadState: `workspace/readState`,
  workspaceUpdateProviderRegistry: `workspace/updateProviderRegistry`,
  workspaceUpdateInteractionPreferences: `workspace/updateInteractionPreferences`,
  workspaceUpsertModelProvider: `workspace/upsertModelProvider`,
  workspaceRemoveModelProvider: `workspace/removeModelProvider`,
  workspaceSetDefaultModel: `workspace/setDefaultModel`,
  workspaceSetDefaultThoughtLevel: `workspace/setDefaultThoughtLevel`,
  workspaceSetDefaultMode: `workspace/setDefaultMode`,
  workspaceGenerateText: `workspace/generateText`,
  mcpList: `mcp/list`,
  pluginsList: `plugins/list`,
  pluginsReferenceCatalog: `plugins/referenceCatalog`,
  pluginsSetEnabled: `plugins/setEnabled`,
  pluginsOverview: `plugins/overview`,
  pluginsMarketplaceAdd: `plugins/marketplace/add`,
  pluginsMarketplaceRemove: `plugins/marketplace/remove`,
  pluginsMarketplaceUpdate: `plugins/marketplace/update`,
  pluginsInstall: `plugins/install`,
  pluginsCancelOperation: `plugins/cancelOperation`,
  pluginsUninstall: `plugins/uninstall`,
  pluginsUpdate: `plugins/update`,
  pluginsRestoreBuiltin: `plugins/restoreBuiltin`,
  pluginsConfigure: `plugins/configure`,
  pluginsValidate: `plugins/validate`,
  pluginsDescribe: `plugins/describe`,
  automationCreate: `automation/create`,
  automationUpdate: `automation/update`,
  automationCheckTaskBinding: `automation/checkTaskBinding`,
  automationList: `automation/list`,
  automationDelete: `automation/delete`,
  usageStats: `usage/stats`,
  sessionUsage: `session/usage`,
  interactionRequestPermission: `interaction/requestPermission`,
  interactionRequestUserInput: `interaction/requestUserInput`,
  interactionRequestProviderRuntimeHeaders: `interaction/requestProviderRuntimeHeaders`,
  interactionBrowserList: `interaction/browserList`,
  interactionBrowserExecute: `interaction/browserExecute`
};

/* 原匿名表达式（jsx 6856）：空请求体与方法常量引用 */
A({}).strict(), ZcodeRpcMethods.mcpList, ZcodeRpcMethods.interactionBrowserList, ZcodeRpcMethods.interactionBrowserExecute;


/* ============================================================================
 * §9 流传输限制与 RPC 帧编解码（jsx 6857–6992 / js 6711–6857 区）
 * ==========================================================================*/

/** 原 Ff（jsx 6857 / js 6711）：流行键 */
export var StreamRowKeySchema = A({
  rowId: E().int().nonnegative(),
  entityId: w().trim().min(1)
}).strict();

/** 原 If（jsx 6861 / js 6712）：流时间戳 */
export var StreamTimestampSchema = E();

/** 原 Lf（jsx 6862 / js 6713）：流文本字段枚举 */
export var StreamTextFieldEnum = P([`text`, `inputText`, `output.text`, `summaryText`]);

/** 原 Rf（jsx 6863 / js 6714）：流传输限制常量表 */
export var STREAM_TRANSPORT_LIMITS = {
  maxFrameBytes: 1024 * 1024,
  logicalFrameAssemblyMaxBytes: 16 * 1024 * 1024,
  logicalFrameAssemblyMaxFragments: 1024,
  logicalFrameAssemblyMaxConcurrent: 32,
  logicalFrameAssemblyMaxStagedBytes: 32 * 1024 * 1024,
  logicalFrameAssemblyTimeoutMs: 3e4,
  transportEnvelopeIdMaxChars: 256,
  subscriberBufferMaxOps: 500,
  subscriberBufferMaxBytes: 1024 * 1024,
  eventRetentionPerSession: 2e3,
  snapshotTailWindowRows: 60,
  rowsRangeMaxLimit: 200,
  toolOutputFinalHeadBytes: 32 * 1024,
  toolOutputFinalTailBytes: 32 * 1024,
  goalVerificationsRetained: 20,
  pendingCommandsDisplayMax: 32,
  commandPendingTtlMs: 1440 * 60 * 1e3,
  idempotencyTablePerSession: 512,
  conversationQueryTimeoutMs: 1e4,
  attachmentMaxBytes: 20 * 1024 * 1024,
  attachmentChunkMaxBytes: 512 * 1024,
  attachmentReadCacheMaxBytes: 32 * 1024 * 1024,
  attachmentReadCacheTtlMs: 3e4,
  attachmentUploadMaxChunks: 64,
  attachmentUploadMaxConcurrent: 16,
  attachmentUploadMaxStagedBytes: 64 * 1024 * 1024,
  attachmentUploadTtlMs: 5 * 6e4,
  attachmentUnreferencedTtlMs: 1440 * 60 * 1e3
};

/** 原 zf（jsx 6893 / js 6744）：Base64 字符串 */
export var Base64StringSchema = w().min(4).regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u);

/** 原 Bf（jsx 6894 / js 6747）：CRC32 十六进制校验值 */
export function crc32Hex(e: any) {
  let t = 4294967295;
  for (let n of e) {
    t ^= n;
    for (let e = 0; e < 8; e += 1) t = t >>> 1 ^ (t & 1 ? 3988292384 : 0);
  }
  return ((t ^ 4294967295) >>> 0).toString(16).padStart(8, `0`);
}

/** 原 Vf（jsx 6902 / js 6755）：Base64 字母表 */
export var BASE64_ALPHABET = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;

/** 原 Hf（jsx 6903 / js 6756）：字节 → Base64 编码 */
export function encodeBase64FromBytes(e: any) {
  let t = ``,
    n: any[] = [];
  for (let r = 0; r < e.byteLength; r += 3) {
    let i = e[r] ?? 0,
      a = r + 1 < e.byteLength,
      o = r + 2 < e.byteLength,
      s = a ? e[r + 1] ?? 0 : 0,
      c = o ? e[r + 2] ?? 0 : 0;
    n.push(BASE64_ALPHABET[i >>> 2], BASE64_ALPHABET[(i & 3) << 4 | s >>> 4], a ? BASE64_ALPHABET[(s & 15) << 2 | c >>> 6] : `=`, o ? BASE64_ALPHABET[c & 63] : `=`), n.length >= 16384 && (t += n.join(``), n = []);
  }
  return t + n.join(``);
}

/** 原 Uf（jsx 6916 / js 6775）：Base64 → 字节解码 */
export function decodeBase64ToBytes(e: any) {
  if (!Base64StringSchema.safeParse(e).success) return null;
  let t = e.endsWith(`==`) ? 2 : +!!e.endsWith(`=`),
    n = new Uint8Array(e.length / 4 * 3 - t),
    r = 0;
  for (let t = 0; t < e.length; t += 4) {
    let i = BASE64_ALPHABET.indexOf(e[t]),
      a = BASE64_ALPHABET.indexOf(e[t + 1]),
      o = e[t + 2] === `=` ? 0 : BASE64_ALPHABET.indexOf(e[t + 2]),
      s = e[t + 3] === `=` ? 0 : BASE64_ALPHABET.indexOf(e[t + 3]);
    if (i < 0 || a < 0 || o < 0 || s < 0) return null;
    let c = i << 18 | a << 12 | o << 6 | s;
    r < n.length && (n[r++] = c >>> 16), r < n.length && (n[r++] = c >>> 8 & 255), r < n.length && (n[r++] = c & 255);
  }
  return n;
}

/** 原 Wf（jsx 6932 / js 6793）：RPC 帧限制 */
export var RPC_FRAME_LIMITS = {
  maxPhysicalFrameBytes: STREAM_TRANSPORT_LIMITS.maxFrameBytes,
  maxMessageBytes: 16 * 1024 * 1024,
  maxFragments: 64,
  assemblyTimeoutMs: 3e4,
  transportIdMaxChars: STREAM_TRANSPORT_LIMITS.transportEnvelopeIdMaxChars
};

/** 原 Gf（jsx 6939 / js 6800）：正安全整数 */
export var PositiveSafeIntegerSchema = E().int().positive().max(2 ** 53 - 1);

/** 原 Kf（jsx 6940 / js 6804）：非负安全整数 */
export var NonNegativeSafeIntegerSchema = E().int().nonnegative().max(2 ** 53 - 1);

/** 原 qf（jsx 6941 / js 6808）：桥接传输 id 字符串 */
export var BridgeTransportIdStringSchema = w().min(1).max(RPC_FRAME_LIMITS.transportIdMaxChars).regex(/^[A-Za-z0-9._~-]+$/u);

/* 原匿名表达式（jsx 6942）：桥接恢复信封 */
A({
  bridgeSessionId: BridgeTransportIdStringSchema,
  bridgeGeneration: NonNegativeSafeIntegerSchema.optional(),
  recoveryId: BridgeTransportIdStringSchema.optional()
}).strict();

/** 原 Jf（jsx 6947 / js 6813）：RPC 帧校验和 */
export var RpcFrameChecksumSchema = A({
  algorithm: F(`crc32`),
  value: w().regex(/^[0-9a-f]{8}$/u)
}).strict();

/** 原 Yf（jsx 6951 / js 6814）：RPC 帧 Base64 载荷往返校验 */
export function isValidRpcFramePayload(e: any) {
  if (e.length < 4 || e.length > RPC_FRAME_LIMITS.maxPhysicalFrameBytes) return !1;
  let t = decodeBase64ToBytes(e);
  return t !== null && t.byteLength > 0 && encodeBase64FromBytes(t) === e;
}

/** 原 Xf（jsx 6956 / js 6819）：RPC 数据帧 */
export var RpcDataFrameSchema = A({
  zcode_type: F(`rpc-frame`),
  bridgeSessionId: BridgeTransportIdStringSchema,
  bridgeGeneration: NonNegativeSafeIntegerSchema.optional(),
  recoveryId: BridgeTransportIdStringSchema.optional(),
  seq: PositiveSafeIntegerSchema,
  messageSeq: PositiveSafeIntegerSchema,
  fragmentIndex: E().int().nonnegative().max(RPC_FRAME_LIMITS.maxFragments - 1),
  fragmentCount: E().int().positive().max(RPC_FRAME_LIMITS.maxFragments),
  messageBytes: E().int().positive().max(RPC_FRAME_LIMITS.maxMessageBytes),
  checksum: RpcFrameChecksumSchema,
  dataBase64: w().min(4).max(RPC_FRAME_LIMITS.maxPhysicalFrameBytes).refine(isValidRpcFramePayload)
}).strict().superRefine((e: any, t: any) => {
  e.fragmentIndex >= e.fragmentCount && t.addIssue({
    code: `custom`,
    path: [`fragmentIndex`],
    message: `fragmentIndex must be smaller than fragmentCount`
  }), e.fragmentCount > e.messageBytes && t.addIssue({
    code: `custom`,
    path: [`fragmentCount`],
    message: `non-empty fragments cannot exceed message bytes`
  });
});

/** 原 Zf（jsx 6979 / js 6850）：RPC 帧确认 */
export var RpcFrameAckSchema = A({
  zcode_type: F(`rpc-frame-ack`),
  bridgeSessionId: BridgeTransportIdStringSchema,
  bridgeGeneration: NonNegativeSafeIntegerSchema.optional(),
  recoveryId: BridgeTransportIdStringSchema.optional(),
  ackMessageSeq: PositiveSafeIntegerSchema
}).strict();

/** 原 Qf（jsx 6986 / js 6857）：RPC 帧载荷联合 */
export var RpcFramePayloadSchema = j([RpcDataFrameSchema, RpcFrameAckSchema]);

/* 原匿名表达式（jsx 6987）：RPC 帧传输信封 */
A({
  type: F(`data`),
  payload: RpcFramePayloadSchema,
  client_ts: NonNegativeSafeIntegerSchema.optional(),
  server_ts: NonNegativeSafeIntegerSchema.optional()
}).strict();


/* ============================================================================
 * §10 任务流镜像与远程桥接 schema（jsx 6993–7475 / js 6859–7236 区）
 * ==========================================================================*/

/** 原 X（jsx 6993 / js 6859）：任务镜像非空字符串 */
export var TaskMirrorNonEmptyString = w().trim().min(1);

/** 原 $f（jsx 6994 / js 6860）：任务模式 id 列表 */
export var TASK_MODE_IDS = [`default`, `yolo`, `plan`, `edit`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `autoEdit`, `build`];

/** 原 ep（jsx 6995 / js 6872）：任务供应商 id 列表 */
export var TASK_PROVIDER_IDS = [`claude`, `opencode`, `gemini`, `codex`, `glm`];

/** 原 tp（jsx 6996 / js 6873）：任务迁移来源列表 */
export var TASK_MIGRATION_SOURCES = [`claudeCode`];

/** 原 np（jsx 6997 / js 6874）：任务变更摘要 */
export var TaskChangeSummarySchema = A({
  fileCount: E().int().nonnegative(),
  added: E().int().nonnegative(),
  removed: E().int().nonnegative(),
  files: k(A({
    path: w(),
    added: E().int().nonnegative(),
    removed: E().int().nonnegative(),
    writeCount: E().int().positive(),
    lastTurnIndex: E().int().nonnegative()
  }).strict())
}).strict();

/** 原 rp（jsx 7009 / js 6888）：任务镜像元数据 */
export var TaskMirrorMetaSchema = A({
  taskId: TaskMirrorNonEmptyString,
  traceId: TaskMirrorNonEmptyString,
  title: w(),
  titleOverridden: D().optional(),
  workspacePath: TaskMirrorNonEmptyString,
  workspaceIdentity: TaskMirrorNonEmptyString.optional(),
  createdAt: E().int().nonnegative(),
  updatedAt: E().int().nonnegative(),
  mode: P(TASK_MODE_IDS),
  model: w().optional(),
  runtimeEpoch: E().int().nonnegative().optional(),
  provider: P(TASK_PROVIDER_IDS).optional(),
  migrationSource: P(TASK_MIGRATION_SOURCES).optional(),
  forkedFromTaskId: TaskMirrorNonEmptyString.optional(),
  unreadAt: E().int().nonnegative().optional(),
  status: P([`running`, `completed`, `error`]).optional(),
  lastError: A({
    code: w().optional(),
    message: w().min(1),
    traceId: TaskMirrorNonEmptyString.optional(),
    taskId: TaskMirrorNonEmptyString.optional()
  }).optional(),
  changeSummary: TaskChangeSummarySchema.optional()
});

/** 原 ip（jsx 7034 / js 6913）：automations 工作区键（identity 回退 path） */
export function automationsWorkspaceKey(e: any) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}

/** 原 ap（jsx 7037 / js 6916）：任务镜像失效原因枚举 */
export var TaskMirrorInvalidationReasonEnum = P([`task_created`, `user_message_saved`, `assistant_message_saved`, `task_status_changed`, `task_meta_changed`, `task_model_changed`, `task_title_changed`, `task_pinned`, `task_unpinned`, `task_archived`, `task_unarchived`, `task_deleted`, `stream_mirror_gap`, `stream_mirror_owner_lost`]);

/** 原 op（jsx 7038 / js 6932）：任务镜像投递用途枚举 */
export var TaskMirrorDeliveryPurposeEnum = P([`observer`, `relay_owner`]);

/** 原 sp（jsx 7039 / js 6933）：任务镜像投递来源枚举 */
export var TaskMirrorDeliverySourceEnum = P([`desktop_window`, `relay_bridge`]);

/** 原 cp（jsx 7040 / js 6934）：任务镜像事件基础 */
export var TaskMirrorEventBaseSchema = A({
  eventId: TaskMirrorNonEmptyString,
  workspacePath: TaskMirrorNonEmptyString,
  workspaceIdentity: TaskMirrorNonEmptyString.optional(),
  workspaceKey: TaskMirrorNonEmptyString,
  traceId: TaskMirrorNonEmptyString,
  createdAt: E().int().nonnegative()
}).strict();

/** 原 lp（jsx 7048 / js 6942）：任务镜像流水位点 */
export var TaskMirrorStreamWatermarkSchema = A({
  runId: TaskMirrorNonEmptyString,
  opSeq: E().int().nonnegative()
}).strict();

/** 原 up（jsx 7052 / js 6943）：任务镜像失效基础 */
export var TaskMirrorInvalidationBaseSchema = TaskMirrorEventBaseSchema.extend({
  reason: TaskMirrorInvalidationReasonEnum,
  streamWatermark: TaskMirrorStreamWatermarkSchema.optional()
}).strict();

/** 原 dp（jsx 7056 / js 6944）：断言工作区键与 identity 回退规则一致 */
export var assertWorkspaceKeyMatchesIdentity = (e: any, t: any) => {
  let n = automationsWorkspaceKey(t);
  t.workspaceKey !== n && e.addIssue({
    code: Ao.custom,
    path: [`workspaceKey`],
    message: `workspaceKey must match workspaceIdentity fallback rule`
  });
};

/** 原 fp（jsx 7064 / js 6953）：断言 runId 与 traceId 一致 */
export var assertRunIdMatchesTraceId = (e: any, t: any) => {
  t.runId !== t.traceId && e.addIssue({
    code: Ao.custom,
    path: [`runId`],
    message: `runId must match traceId`
  });
};

/** 原 pp（jsx 7071 / js 6957）：任务快照失效事件 */
export var TaskSnapshotInvalidatedEventSchema = TaskMirrorInvalidationBaseSchema.extend({
  type: F(`task_snapshot_invalidated`),
  taskId: TaskMirrorNonEmptyString
}).strict();

/** 原 mp（jsx 7075 / js 6958）：工作区任务列表失效事件 */
export var WorkspaceTaskListInvalidatedEventSchema = TaskMirrorInvalidationBaseSchema.extend({
  type: F(`workspace_task_list_invalidated`),
  taskId: TaskMirrorNonEmptyString.optional(),
  taskMeta: TaskMirrorMetaSchema.optional()
}).strict();

/** 原 hp（jsx 7080 / js 6965）：任务镜像附件（图片/音频/文件） */
export var TaskMirrorAttachmentSchema = M(`kind`, [A({
  kind: F(`image`),
  filename: w(),
  mimeType: w(),
  sizeBytes: E().int().nonnegative().optional(),
  dataBase64: w().optional(),
  localPath: w().optional()
}).strict(), A({
  kind: F(`audio`),
  filename: w(),
  mimeType: w(),
  dataBase64: w().optional(),
  localPath: w().optional()
}).strict(), A({
  kind: F(`file`),
  filename: w(),
  mimeType: w(),
  sizeBytes: E().int().nonnegative(),
  dataBase64: w().optional(),
  textContent: w().optional(),
  localPath: w().optional()
}).strict()]);

/** 原 gp（jsx 7102 / js 6991）：任务镜像流事件（透传） */
export var TaskMirrorStreamEventSchema = A({
  type: TaskMirrorNonEmptyString,
  taskId: TaskMirrorNonEmptyString,
  traceId: TaskMirrorNonEmptyString
}).passthrough();

/** 原 _p（jsx 7107 / js 6992）：任务镜像用户消息操作 */
export var TaskMirrorUserMessageOpSchema = A({
  kind: F(`user_message`),
  messageId: TaskMirrorNonEmptyString,
  content: w(),
  attachments: k(TaskMirrorAttachmentSchema).optional(),
  timestamp: E().finite()
}).strict();

/** 原 vp（jsx 7114 / js 6999）：任务镜像流事件操作 */
export var TaskMirrorStreamEventOpSchema = A({
  kind: F(`stream_event`),
  event: TaskMirrorStreamEventSchema
}).strict();

/** 原 yp（jsx 7118 / js 7000）：任务镜像流操作联合 */
export var TaskMirrorStreamOpSchema = M(`kind`, [TaskMirrorUserMessageOpSchema, TaskMirrorStreamEventOpSchema]);

/** 原 bp（jsx 7119 / js 7001）：任务镜像带序号流操作联合 */
export var TaskMirrorSequencedStreamOpSchema = M(`kind`, [TaskMirrorUserMessageOpSchema.extend({
  seq: E().int().positive()
}).strict(), TaskMirrorStreamEventOpSchema.extend({
  seq: E().int().positive()
}).strict()]);

/** 原 xp（jsx 7124 / js 7005）：任务镜像流目标 */
export var TaskMirrorStreamTargetSchema = A({
  workspacePath: TaskMirrorNonEmptyString,
  workspaceIdentity: TaskMirrorNonEmptyString.optional(),
  workspaceKey: TaskMirrorNonEmptyString,
  taskId: TaskMirrorNonEmptyString,
  runId: TaskMirrorNonEmptyString,
  traceId: TaskMirrorNonEmptyString,
  ownerClientId: TaskMirrorNonEmptyString.optional(),
  ownerDeviceLabel: TaskMirrorNonEmptyString.optional()
}).strict();

/** 原 Sp（jsx 7134 / js 7015）：任务镜像校验后流目标 */
export var TaskMirrorValidatedStreamTargetSchema = TaskMirrorStreamTargetSchema.superRefine((e: any, t: any) => {
  assertWorkspaceKeyMatchesIdentity(t, e), assertRunIdMatchesTraceId(t, e);
});

/** 原 Cp（jsx 7137 / js 7018）：任务流镜像批量事件 */
export var TaskStreamMirrorBatchEventSchema = TaskMirrorEventBaseSchema.extend({
  type: F(`task_stream_mirror_batch`),
  taskId: TaskMirrorNonEmptyString,
  runId: TaskMirrorNonEmptyString,
  ownerClientId: TaskMirrorNonEmptyString.optional(),
  ownerDeviceLabel: TaskMirrorNonEmptyString.optional(),
  batchSeq: E().int().positive(),
  fromSeq: E().int().positive(),
  toSeq: E().int().positive(),
  ops: k(TaskMirrorSequencedStreamOpSchema),
  terminal: D()
}).strict();

/** 原 wp（jsx 7149 / js 7032）：任务镜像流释放目标（同校验目标） */
export var TaskMirrorStreamReleaseTargetSchema = TaskMirrorValidatedStreamTargetSchema;

/** 原 Tp（jsx 7150 / js 7033）：任务运行租约请求 */
export var TaskRunLeaseRequestSchema = TaskMirrorStreamTargetSchema.extend({
  leaseRequestId: TaskMirrorNonEmptyString
}).strict().superRefine((e: any, t: any) => {
  assertWorkspaceKeyMatchesIdentity(t, e), assertRunIdMatchesTraceId(t, e);
});

/** 原 Ep（jsx 7155 / js 7039）：任务运行租约结果 */
export var TaskRunLeaseResultSchema = M(`acquired`, [A({
  leaseRequestId: TaskMirrorNonEmptyString,
  acquired: F(!0),
  ownerHostId: TaskMirrorNonEmptyString
}).strict(), A({
  leaseRequestId: TaskMirrorNonEmptyString,
  acquired: F(!1),
  ownerHostId: TaskMirrorNonEmptyString,
  reason: F(`owned_by_other_host`)
}).strict()]);

/** 原 Dp（jsx 7165 / js 7048）：任务属主命令基础 */
export var TaskOwnerCommandBaseSchema = A({
  commandRequestId: TaskMirrorNonEmptyString,
  workspacePath: TaskMirrorNonEmptyString,
  workspaceIdentity: TaskMirrorNonEmptyString.optional(),
  workspaceKey: TaskMirrorNonEmptyString,
  taskId: TaskMirrorNonEmptyString,
  runId: TaskMirrorNonEmptyString
}).strict();

/** 原 Op（jsx 7173 / js 7056）：停止生成属主命令 */
export var StopGenerationOwnerCommandSchema = TaskOwnerCommandBaseSchema.extend({
  type: F(`stop_generation`)
}).strict();

/** 原 kp（jsx 7176 / js 7057）：权限应答属主命令 */
export var RespondPermissionOwnerCommandSchema = TaskOwnerCommandBaseSchema.extend({
  type: F(`respond_permission`),
  permissionRequestId: TaskMirrorNonEmptyString,
  optionId: TaskMirrorNonEmptyString,
  response: Fs
}).strict();

/** 原 Ap（jsx 7182 / js 7063）：征询应答属主命令 */
export var RespondElicitationOwnerCommandSchema = TaskOwnerCommandBaseSchema.extend({
  type: F(`respond_elicitation`),
  elicitationRequestId: TaskMirrorNonEmptyString,
  action: P([`accept`, `decline`, `cancel`]),
  content: N(w(), O()).optional()
}).strict();

/** 原 jp（jsx 7188 / js 7069）：发送提示任务命令 */
export var SendPromptTaskCommandSchema = M(`type`, [A({
  commandId: TaskMirrorNonEmptyString,
  taskId: TaskMirrorNonEmptyString,
  traceId: TaskMirrorNonEmptyString,
  workspacePath: TaskMirrorNonEmptyString,
  workspaceIdentity: TaskMirrorNonEmptyString.optional(),
  workspaceKey: TaskMirrorNonEmptyString,
  status: P([`accepted`, `running`, `failed`]),
  createdAt: E().int().nonnegative(),
  updatedAt: E().int().nonnegative(),
  clientId: TaskMirrorNonEmptyString.optional(),
  clientLabel: TaskMirrorNonEmptyString.optional(),
  error: w().optional()
}).strict().extend({
  type: F(`send_prompt`),
  content: w(),
  attachments: k(TaskMirrorAttachmentSchema).optional(),
  automationId: TaskMirrorNonEmptyString.optional()
}).strict()]);

/** 原 Mp（jsx 7207 / js 7093）：入队任务命令 */
export var EnqueueTaskCommandSchema = TaskOwnerCommandBaseSchema.extend({
  type: F(`enqueue_task_command`),
  taskCommand: SendPromptTaskCommandSchema
}).strict();

/** 原 Np（jsx 7211 / js 7094）：提升任务命令 */
export var PromoteTaskCommandSchema = TaskOwnerCommandBaseSchema.extend({
  type: F(`promote_task_command`),
  commandId: TaskMirrorNonEmptyString,
  clientMode: F(`web-remote-replayable`)
}).strict();

/** 原 Pp（jsx 7216 / js 7099）：取消任务命令 */
export var CancelTaskCommandSchema = TaskOwnerCommandBaseSchema.extend({
  type: F(`cancel_task_command`),
  commandId: TaskMirrorNonEmptyString,
  clientMode: F(`web-remote-replayable`)
}).strict();

/** 原 Fp（jsx 7221 / js 7104）：任务属主命令联合 */
export var TaskOwnerCommandSchema = M(`type`, [StopGenerationOwnerCommandSchema, RespondPermissionOwnerCommandSchema, RespondElicitationOwnerCommandSchema, EnqueueTaskCommandSchema, PromoteTaskCommandSchema, CancelTaskCommandSchema]).superRefine((e: any, t: any) => {
  assertWorkspaceKeyMatchesIdentity(t, e);
});

/** 原 Ip（jsx 7224 / js 7107）：带请求方的任务属主命令联合 */
export var TaskOwnerCommandWithRequesterSchema = M(`type`, [StopGenerationOwnerCommandSchema.extend({
  requesterHostId: TaskMirrorNonEmptyString
}).strict(), RespondPermissionOwnerCommandSchema.extend({
  requesterHostId: TaskMirrorNonEmptyString
}).strict(), RespondElicitationOwnerCommandSchema.extend({
  requesterHostId: TaskMirrorNonEmptyString
}).strict(), EnqueueTaskCommandSchema.extend({
  requesterHostId: TaskMirrorNonEmptyString
}).strict(), PromoteTaskCommandSchema.extend({
  requesterHostId: TaskMirrorNonEmptyString
}).strict(), CancelTaskCommandSchema.extend({
  requesterHostId: TaskMirrorNonEmptyString
}).strict()]).superRefine((e: any, t: any) => {
  assertWorkspaceKeyMatchesIdentity(t, e);
});

/** 原 Lp（jsx 7239 / js 7117）：任务属主命令错误码枚举 */
export var TaskOwnerCommandErrorCodeEnum = P([`NO_ACTIVE_TASK_OWNER`, `STALE_TASK_OWNER_COMMAND`, `OWNER_COMMAND_FAILED`]);

/** 原 Rp（jsx 7240 / js 7118）：任务属主命令结果 */
export var TaskOwnerCommandResultSchema = M(`success`, [A({
  commandRequestId: TaskMirrorNonEmptyString,
  success: F(!0),
  taskCommand: SendPromptTaskCommandSchema.optional()
}).strict(), A({
  commandRequestId: TaskMirrorNonEmptyString,
  success: F(!1),
  error: w(),
  code: TaskOwnerCommandErrorCodeEnum.optional()
}).strict()]);

/** 原 zp（jsx 7250 / js 7122）：任务实时事件联合 */
export var TaskRealtimeEventSchema = M(`type`, [TaskSnapshotInvalidatedEventSchema, WorkspaceTaskListInvalidatedEventSchema, TaskStreamMirrorBatchEventSchema]).superRefine((e: any, t: any) => {
  assertWorkspaceKeyMatchesIdentity(t, e), e.type === `task_stream_mirror_batch` && assertRunIdMatchesTraceId(t, e);
});

/** 原 Bp（jsx 7253 / js 7125）：带来源的任务实时事件联合 */
export var TaskRealtimeEventWithOriginSchema = M(`type`, [TaskSnapshotInvalidatedEventSchema.extend({
  originHostId: TaskMirrorNonEmptyString,
  deliveryPurpose: TaskMirrorDeliveryPurposeEnum.optional()
}).strict(), WorkspaceTaskListInvalidatedEventSchema.extend({
  originHostId: TaskMirrorNonEmptyString,
  deliveryPurpose: TaskMirrorDeliveryPurposeEnum.optional()
}).strict(), TaskStreamMirrorBatchEventSchema.extend({
  originHostId: TaskMirrorNonEmptyString,
  deliveryPurpose: TaskMirrorDeliveryPurposeEnum.optional()
}).strict()]).superRefine((e: any, t: any) => {
  assertWorkspaceKeyMatchesIdentity(t, e), e.type === `task_stream_mirror_batch` && assertRunIdMatchesTraceId(t, e);
});

/** 原 Z（jsx 7265 / js 7132）：远程桥接非空字符串 */
export var RemoteBridgeNonEmptyString = w().trim().min(1);

/** 原 Q（jsx 7266 / js 7133）：远程桥接传输 id */
export var RemoteBridgeTransportIdSchema = RemoteBridgeNonEmptyString.max(STREAM_TRANSPORT_LIMITS.transportEnvelopeIdMaxChars).regex(/^[A-Za-z0-9._~-]+$/u);

/** 原 Vp（jsx 7267 / js 7134）：窗口控制工作区列表 */
export var WindowControlWorkspaceListSchema = k(A({
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString.optional(),
  remoteSessionId: RemoteBridgeNonEmptyString.optional(),
  label: RemoteBridgeNonEmptyString,
  workspacePurpose: P([`project`, `conversation`]).optional(),
  kind: P([`local`, `remote`]),
  connectionState: P([`connected`, `disconnected`, `reconnecting`]).optional(),
  lastConnectionError: w().optional()
}));

/* 原匿名表达式（jsx 7277）：工作区释放请求/响应 */
A({
  requestId: RemoteBridgeNonEmptyString,
  workspaceKey: RemoteBridgeNonEmptyString
}), j([A({
  requestId: RemoteBridgeNonEmptyString,
  workspaceKey: RemoteBridgeNonEmptyString,
  success: F(!0)
}), A({
  requestId: RemoteBridgeNonEmptyString,
  workspaceKey: RemoteBridgeNonEmptyString,
  success: F(!1),
  error: w()
})]);

/** 原 Hp（jsx 7290 / js 7151）：窗口控制任务列表 */
export var WindowControlTaskListSchema = k(A({
  taskId: RemoteBridgeNonEmptyString,
  title: w(),
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString.optional(),
  remoteSessionId: RemoteBridgeNonEmptyString.optional(),
  workspaceLabel: RemoteBridgeNonEmptyString,
  workspaceKind: P([`local`, `remote`]),
  createdAt: E().finite(),
  updatedAt: E().finite(),
  provider: I.optional(),
  unreadAt: E().finite().optional(),
  displayStatus: P([`idle`, `running`, `completed`, `error`]).optional(),
  pinned: D().optional(),
  archived: D().optional()
}));

/** 原 Up（jsx 7306 / js 7169）：移动端桥接失败原因枚举 */
export var MobileBridgeFailureReasonEnum = P([`session-not-found`, `session-expired`, `session-conflict`, `workspace-closed`, `desktop-disconnected`, `invalid-mobile-connection`, `desktop-bootstrap-timeout`, `connection-recovery-timeout`, `relay-unavailable`, `unsupported-action`, `unexpected-error`]);

/** 原 Wp（jsx 7307 / js 7182）：工作区桥接描述符 */
export var WorkspaceBridgeDescriptorSchema = M(`kind`, [A({
  bridgeSessionId: RemoteBridgeTransportIdSchema,
  bridgeGeneration: E().int().nonnegative().optional(),
  recoveryId: RemoteBridgeTransportIdSchema.optional(),
  kind: F(`local`),
  workspaceKey: RemoteBridgeNonEmptyString,
  workspacePath: RemoteBridgeNonEmptyString,
  initialTaskId: RemoteBridgeNonEmptyString.optional()
}), A({
  bridgeSessionId: RemoteBridgeTransportIdSchema,
  bridgeGeneration: E().int().nonnegative().optional(),
  recoveryId: RemoteBridgeTransportIdSchema.optional(),
  kind: F(`remote`),
  workspaceKey: RemoteBridgeNonEmptyString,
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString,
  remoteSessionId: RemoteBridgeNonEmptyString,
  initialTaskId: RemoteBridgeNonEmptyString.optional()
})]);

/** 原 Gp（jsx 7326 / js 7204）：远程视图状态 */
export var RemoteViewStateChangedSchema = A({
  activeWorkspaceKey: RemoteBridgeNonEmptyString.optional(),
  activeTaskId: RemoteBridgeNonEmptyString.optional(),
  updatedAt: E().finite()
});

/** 原 Kp（jsx 7331 / js 7205）：远程设备信息 */
export var RemoteDeviceInfoSchema = A({
  platform: RemoteBridgeNonEmptyString,
  version: RemoteBridgeNonEmptyString,
  name: RemoteBridgeNonEmptyString,
  userAgent: w().optional(),
  language: w().optional(),
  languages: k(w()).optional(),
  browserPlatform: w().optional(),
  viewport: A({
    width: E().finite(),
    height: E().finite(),
    devicePixelRatio: E().finite()
  }).optional(),
  screen: A({
    width: E().finite(),
    height: E().finite()
  }).optional(),
  timezone: w().optional(),
  online: D().optional(),
  updatedAt: E().finite()
});

/** 原 qp（jsx 7352 / js 7223）：窗口控制引导结果 */
export var WindowControlBootstrapResultSchema = A({
  windowControlSessionId: RemoteBridgeNonEmptyString,
  workspaces: WindowControlWorkspaceListSchema,
  tasks: WindowControlTaskListSchema,
  initialViewState: RemoteViewStateChangedSchema.optional(),
  mobileViewState: RemoteViewStateChangedSchema.optional()
});

/** 原 Jp（jsx 7359 / js 7230）：工作区列表快照 */
export var WorkspaceListSnapshotSchema = A({
  workspaces: WindowControlWorkspaceListSchema,
  tasks: WindowControlTaskListSchema.optional(),
  activeWorkspaceKey: RemoteBridgeNonEmptyString.optional(),
  activeTaskId: RemoteBridgeNonEmptyString.optional()
});

/** 原 Yp（jsx 7365 / js 7236）：远程平台请求方法枚举 */
export var RemotePlatformRequestMethodEnum = P([`isDockerAvailable`, `listWSLDistros`, `listDockerContainers`, `listSSHConfigAliases`, `loadMcpFromUserDirectory`, `saveMcpToUserDirectory`, `migrateLegacyCommonMcp`]);

/* 原匿名表达式（jsx 7366）：窗口控制 WebSocket 消息联合 + 头部记录 */
j([A({
  zcode_type: F(`bootstrap-request`),
  requestId: RemoteBridgeNonEmptyString
}), A({
  zcode_type: F(`bootstrap-response`),
  requestId: RemoteBridgeNonEmptyString,
  success: F(!0),
  result: WindowControlBootstrapResultSchema
}), A({
  zcode_type: F(`workspace-list-request`),
  requestId: RemoteBridgeNonEmptyString
}), A({
  zcode_type: F(`workspace-list-response`),
  requestId: RemoteBridgeNonEmptyString,
  success: F(!0),
  result: WorkspaceListSnapshotSchema
}), A({
  zcode_type: F(`workspace-list-updated`),
  result: WorkspaceListSnapshotSchema
}), A({
  zcode_type: F(`workspace-bridge-open`),
  requestId: RemoteBridgeNonEmptyString,
  bridgeSessionId: RemoteBridgeTransportIdSchema,
  bridgeGeneration: E().int().nonnegative().optional(),
  recoveryId: RemoteBridgeTransportIdSchema.optional(),
  workspaceKey: RemoteBridgeNonEmptyString,
  taskId: RemoteBridgeNonEmptyString.optional()
}), A({
  zcode_type: F(`workspace-bridge-ready`),
  requestId: RemoteBridgeNonEmptyString,
  bridgeSessionId: RemoteBridgeTransportIdSchema,
  bridgeGeneration: E().int().nonnegative().optional(),
  recoveryId: RemoteBridgeTransportIdSchema.optional(),
  bridge: WorkspaceBridgeDescriptorSchema
}), A({
  zcode_type: F(`workspace-bridge-error`),
  requestId: RemoteBridgeNonEmptyString,
  bridgeSessionId: RemoteBridgeTransportIdSchema.optional(),
  bridgeGeneration: E().int().nonnegative().optional(),
  recoveryId: RemoteBridgeTransportIdSchema.optional(),
  reason: MobileBridgeFailureReasonEnum,
  error: w()
}), A({
  zcode_type: F(`workspace-reconnect-request`),
  requestId: RemoteBridgeNonEmptyString,
  workspaceKey: RemoteBridgeNonEmptyString
}), A({
  zcode_type: F(`workspace-reconnect-response`),
  requestId: RemoteBridgeNonEmptyString,
  workspaceKey: RemoteBridgeNonEmptyString,
  success: F(!0)
}), A({
  zcode_type: F(`workspace-reconnect-response`),
  requestId: RemoteBridgeNonEmptyString,
  workspaceKey: RemoteBridgeNonEmptyString,
  success: F(!1),
  error: w()
}), A({
  zcode_type: F(`mobile-view-state-update`),
  viewState: RemoteViewStateChangedSchema,
  deviceInfo: RemoteDeviceInfoSchema.optional()
}), A({
  zcode_type: F(`platform-request`),
  requestId: RemoteBridgeNonEmptyString,
  method: RemotePlatformRequestMethodEnum,
  args: O().optional()
}), A({
  zcode_type: F(`platform-response`),
  requestId: RemoteBridgeNonEmptyString,
  method: RemotePlatformRequestMethodEnum,
  success: F(!0),
  result: O()
}), A({
  zcode_type: F(`platform-response`),
  requestId: RemoteBridgeNonEmptyString,
  method: RemotePlatformRequestMethodEnum,
  success: F(!1),
  error: w()
}), RpcDataFrameSchema, RpcFrameAckSchema, A({
  zcode_type: F(`bridge-degraded`),
  bridgeSessionId: RemoteBridgeTransportIdSchema,
  bridgeGeneration: E().int().nonnegative().optional(),
  recoveryId: RemoteBridgeTransportIdSchema.optional(),
  reason: P([`rpc-transport-fault`, `rpc-frame-gap`, `buffer-overflow`, `buffer-timeout`]),
  seq: E().int().nonnegative().optional(),
  expectedSeq: E().int().nonnegative().optional(),
  droppedCount: E().int().nonnegative().optional()
}), A({
  zcode_type: F(`app-error`),
  requestId: RemoteBridgeNonEmptyString.optional(),
  bridgeSessionId: RemoteBridgeTransportIdSchema.optional(),
  reason: MobileBridgeFailureReasonEnum,
  error: w()
}), A({
  zcode_type: F(`mobile-diagnostic`),
  event: P([`state-transition`, `socket-close`, `socket-error`, `recover-start`, `recover-scheduled`, `pair-status`, `failure`]),
  timestamp: E().int().nonnegative(),
  state: w().optional(),
  previousState: w().optional(),
  pairStatus: P([`waiting`, `matched`]).optional(),
  closeCode: E().int().optional(),
  closeReason: w().optional(),
  wasClean: D().optional(),
  wasPaired: D().optional(),
  failureReason: MobileBridgeFailureReasonEnum.optional(),
  failureMessage: w().optional(),
  visibilityState: w().optional(),
  online: D().optional(),
  hiddenDurationMs: E().int().nonnegative().optional()
})]), N(w(), w());


/* ============================================================================
 * §11 远程连接目标（jsx 7476–7544 / js 7341–7354 区）
 * §12 代理宿主命令（jsx 7545–7724 / js 7400–7504 区）
 * ==========================================================================*/

/** 原 Xp（jsx 7476 / js 7341）：SSH 远程目标 */
export var SshRemoteTargetSchema = A({
  kind: F(`ssh`),
  host: RemoteBridgeNonEmptyString,
  port: E().int().positive().max(65535).optional(),
  username: RemoteBridgeNonEmptyString,
  sshConfigAlias: RemoteBridgeNonEmptyString.optional(),
  password: w().optional(),
  privateKeyPath: w().optional(),
  privateKeyPassphrase: w().optional(),
  assetInstallMode: P(os).optional(),
  resourcePackages: A({
    selectedPackageIds: k(w().refine(ps)).optional()
  }).optional()
});

/** 原 Zp（jsx 7490 / js 7353）：WSL 远程目标 */
export var WslRemoteTargetSchema = A({
  kind: F(`wsl`),
  distro: w().optional(),
  user: Tc.optional()
});

/** 原 Qp（jsx 7495 / js 7354）：远程连接目标联合（ssh/wsl/docker/server） */
export var RemoteConnectionTargetSchema = M(`kind`, [SshRemoteTargetSchema, WslRemoteTargetSchema, A({
  kind: F(`docker`),
  container: RemoteBridgeNonEmptyString
}), A({
  kind: F(`server`),
  url: w().url(),
  name: RemoteBridgeNonEmptyString.optional(),
  token: w().optional(),
  workspacePath: w().optional(),
  serverId: RemoteBridgeNonEmptyString.optional()
})]);

/* 原匿名表达式（jsx 7506）：代理宿主握手/日志/任务通知/遥测消息组 */
A({
  type: F(`zcode-hello`),
  version: w(),
  platform: w(),
  arch: w(),
  pid: E().int()
}), A({
  type: F(`zcode-hello-ack`),
  version: w(),
  clientId: RemoteBridgeNonEmptyString
}), A({
  level: P([`info`, `warn`, `error`]),
  args: k(O())
}), A({
  taskId: RemoteBridgeNonEmptyString,
  status: P([`completed`, `failed`, `permission_request`, `elicitation_request`, `feedback_update`]),
  requestId: RemoteBridgeNonEmptyString.optional(),
  title: w(),
  body: w()
}), A({
  context: A({
    clientTimezone: RemoteBridgeNonEmptyString,
    clientLanguage: RemoteBridgeNonEmptyString,
    screenResolution: RemoteBridgeNonEmptyString
  }),
  elementName: RemoteBridgeNonEmptyString,
  eventRegion: RemoteBridgeNonEmptyString,
  eventType: RemoteBridgeNonEmptyString,
  eventText: w().optional(),
  eventExtraDetail: N(w(), w()),
  userId: w().optional(),
  talkId: w().optional(),
  messageId: w().optional()
}), A({
  name: RemoteBridgeNonEmptyString,
  group: RemoteBridgeNonEmptyString,
  value: E().finite().optional(),
  properties: N(w(), j([w(), E().finite(), D(), Ua()])).optional()
});

/** 原 $p（jsx 7545 / js 7400）：窗口间广播消息 */
export var InterWindowBroadcastMessageSchema = A({
  channel: RemoteBridgeNonEmptyString,
  payload: O(),
  sourceWindowId: E().int().optional()
});

/** 原 em（jsx 7550 / js 7401）：远程资产配置 */
export var RemoteAssetsConfigSchema = A({
  mockCdnDir: w().optional(),
  remoteCdnBaseUrl: w().optional(),
  remoteCdnBaseUrls: k(w()).optional(),
  remoteCacheDir: w().optional()
});

/** 原 tm（jsx 7556 / js 7407）：代理预热目标 */
export var AgentWarmupTargetSchema = A({
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString.optional()
});

/** 原 nm（jsx 7560 / js 7408）：初始化本地代理宿主命令 */
export var InitLocalAgentHostCommandSchema = A({
  type: F(`init-local`),
  hostId: RemoteBridgeNonEmptyString.optional(),
  deliveryKind: TaskMirrorDeliverySourceEnum.optional(),
  deviceMid: w().optional(),
  feedbackApiBase: w().url().optional(),
  workspacePath: RemoteBridgeNonEmptyString.optional(),
  workspaceIdentity: RemoteBridgeNonEmptyString.optional(),
  agentWarmupTargets: k(AgentWarmupTargetSchema).max(3).optional(),
  agentSpawnFallbackCwd: RemoteBridgeNonEmptyString.optional(),
  runtimeProcessEnvPatch: N(w().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), w()).optional()
});

/** 原 rm（jsx 7572 / js 7420）：初始化远程代理宿主命令 */
export var InitRemoteAgentHostCommandSchema = A({
  type: F(`init-remote`),
  target: RemoteConnectionTargetSchema,
  remoteAssets: RemoteAssetsConfigSchema
});

/** 原 im（jsx 7577 / js 7421）：初始化远程工作区命令 */
export var InitRemoteWorkspaceCommandSchema = A({
  type: F(`init-remote-workspace`),
  target: RemoteConnectionTargetSchema,
  remoteAssets: RemoteAssetsConfigSchema,
  workspacePath: RemoteBridgeNonEmptyString.optional(),
  workspaceIdentity: RemoteBridgeNonEmptyString.optional(),
  hostId: RemoteBridgeNonEmptyString.optional(),
  deliveryKind: TaskMirrorDeliverySourceEnum.optional()
});

/** 原 am（jsx 7586 / js 7430）：初始化远程 SSH 宿主命令 */
export var InitRemoteSshHostCommandSchema = A({
  type: F(`init-remote-ssh-host`),
  target: SshRemoteTargetSchema,
  remoteAssets: RemoteAssetsConfigSchema,
  hostId: RemoteBridgeNonEmptyString.optional(),
  deliveryKind: TaskMirrorDeliverySourceEnum.optional()
});

/** 原 om（jsx 7593 / js 7437）：初始化远程 WSL 宿主命令 */
export var InitRemoteWslHostCommandSchema = A({
  type: F(`init-remote-wsl-host`),
  target: WslRemoteTargetSchema,
  remoteAssets: RemoteAssetsConfigSchema,
  hostId: RemoteBridgeNonEmptyString.optional(),
  deliveryKind: TaskMirrorDeliverySourceEnum.optional()
});

/** 原 sm（jsx 7600 / js 7444）：附加服务端口命令 */
export var AttachServicePortCommandSchema = A({
  type: F(`attach-service-port`),
  attachmentId: RemoteBridgeNonEmptyString,
  clientMode: P([`desktop-continuous`, `web-remote-replayable`])
}).strict();

/** 原 cm（jsx 7605 / js 7449）：分离服务端口命令 */
export var DetachServicePortCommandSchema = A({
  type: F(`detach-service-port`),
  attachmentId: RemoteBridgeNonEmptyString
});

/** 原 lm（jsx 7609 / js 7450）：获取远程工作区命令 */
export var AcquireRemoteWorkspaceCommandSchema = A({
  type: F(`acquire-remote-workspace`),
  requestId: RemoteBridgeNonEmptyString,
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString.optional(),
  generation: E().int().positive()
});

/** 原 um（jsx 7616 / js 7457）：释放远程工作区命令 */
export var ReleaseRemoteWorkspaceCommandSchema = A({
  type: F(`release-remote-workspace`),
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString.optional(),
  generation: E().int().positive()
});

/** 原 dm（jsx 7622 / js 7463）：销毁代理宿主命令 */
export var DisposeAgentHostCommandSchema = A({
  type: F(`dispose`)
});

/** 原 fm（jsx 7625 / js 7464）：广播代理宿主命令 */
export var BroadcastAgentHostCommandSchema = A({
  type: F(`broadcast`),
  message: InterWindowBroadcastMessageSchema
});

/** 原 pm（jsx 7629 / js 7465）：任务实时投递命令 */
export var TaskRealtimeDeliverCommandSchema = A({
  type: F(`task-realtime-deliver`),
  event: TaskRealtimeEventWithOriginSchema
});

/** 原 mm（jsx 7633 / js 7466）：任务运行租约结果命令 */
export var TaskRunLeaseResultCommandSchema = A({
  type: F(`task-run-lease-result`),
  result: TaskRunLeaseResultSchema
});

/** 原 hm（jsx 7637 / js 7467）：任务属主命令投递命令 */
export var TaskOwnerCommandDeliverCommandSchema = A({
  type: F(`task-owner-command-deliver`),
  command: TaskOwnerCommandWithRequesterSchema
});

/** 原 gm（jsx 7641 / js 7468）：任务属主命令结果命令 */
export var TaskOwnerCommandResultCommandSchema = A({
  type: F(`task-owner-command-result`),
  result: TaskOwnerCommandResultSchema
});

/** 原 _m（jsx 7645 / js 7469）：机器人重连结果命令 */
export var BotReconnectResultCommandSchema = A({
  type: F(`bot-remote-workspace-reconnect-result`),
  requestId: RemoteBridgeNonEmptyString,
  ok: D(),
  sessionId: RemoteBridgeNonEmptyString.optional(),
  error: w().optional()
});

/** 原 vm（jsx 7652 / js 7476）：机器人连接状态结果命令 */
export var BotConnectionStatusResultCommandSchema = A({
  type: F(`bot-remote-workspace-connection-status-result`),
  requestId: RemoteBridgeNonEmptyString,
  ok: D(),
  connected: D().optional(),
  error: w().optional()
});

/** 原 ym（jsx 7659 / js 7483）：机器人运行时端口结果命令 */
export var BotRuntimePortResultCommandSchema = A({
  type: F(`bot-remote-workspace-runtime-port`),
  requestId: RemoteBridgeNonEmptyString,
  ok: D(),
  error: w().optional()
});

/** 原 bm（jsx 7665 / js 7489）：会话消息投递请求 */
export var SessionMessageDeliverRequestSchema = A({
  content: RemoteBridgeNonEmptyString,
  createdAt: RemoteBridgeNonEmptyString,
  fromSessionId: RemoteBridgeNonEmptyString,
  messageId: RemoteBridgeNonEmptyString,
  requestId: RemoteBridgeNonEmptyString,
  toSessionId: RemoteBridgeNonEmptyString
});

/** 原 xm（jsx 7673 / js 7497）：会话消息投递结果 */
export var SessionMessageDeliveryResultSchema = A({
  error: w().optional(),
  messageId: RemoteBridgeNonEmptyString,
  requestId: RemoteBridgeNonEmptyString,
  sessionId: RemoteBridgeNonEmptyString,
  status: P([`success`, `failed`])
});

/** 原 Sm（jsx 7680 / js 7504）：会话路由通告载荷 */
export var SessionRouteAnnouncePayloadSchema = A({
  sessionId: RemoteBridgeNonEmptyString
});

/* 原匿名表达式（jsx 7683）：代理宿主命令判别联合 */
M(`type`, [InitLocalAgentHostCommandSchema, InitRemoteAgentHostCommandSchema, InitRemoteWorkspaceCommandSchema, InitRemoteSshHostCommandSchema, InitRemoteWslHostCommandSchema, AttachServicePortCommandSchema, DetachServicePortCommandSchema, AcquireRemoteWorkspaceCommandSchema, ReleaseRemoteWorkspaceCommandSchema, DisposeAgentHostCommandSchema, BroadcastAgentHostCommandSchema, TaskRealtimeDeliverCommandSchema, TaskRunLeaseResultCommandSchema, TaskOwnerCommandDeliverCommandSchema, TaskOwnerCommandResultCommandSchema, BotReconnectResultCommandSchema, BotConnectionStatusResultCommandSchema, BotRuntimePortResultCommandSchema, A({
  type: F(`session-message-deliver`),
  request: SessionMessageDeliverRequestSchema
}), A({
  type: F(`session-message-delivery-result`),
  result: SessionMessageDeliveryResultSchema
}), A({
  type: F(`feedback-log-archive-result`),
  requestId: RemoteBridgeNonEmptyString,
  ok: D(),
  path: w().optional(),
  size: E().int().nonnegative().optional(),
  error: w().optional()
}), A({
  type: F(`cron-run`),
  automationId: RemoteBridgeNonEmptyString,
  runId: RemoteBridgeNonEmptyString,
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: w().optional(),
  prompt: RemoteBridgeNonEmptyString,
  targetTaskId: RemoteBridgeNonEmptyString.optional(),
  model: w().optional(),
  provider: w().optional(),
  mode: w().optional(),
  thoughtLevel: w().optional()
}), A({
  type: F(`off-peak-run`),
  offPeakTaskId: RemoteBridgeNonEmptyString,
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: w().optional(),
  prompt: RemoteBridgeNonEmptyString,
  permissionMode: RemoteBridgeNonEmptyString,
  model: w().optional(),
  thoughtLevel: w().optional(),
  conversationId: w().optional(),
  sessionId: w().optional(),
  serverTicketId: w().optional()
}), A({
  type: F(`browser-execute-result`),
  requestId: RemoteBridgeNonEmptyString,
  result: as
})]);


/* ============================================================================
 * §13 代理宿主事件（jsx 7725–7941 / js 7562–7713 区）
 * ==========================================================================*/

/** 原 Cm（jsx 7725 / js 7562）：代理连接事件 */
export var AgentConnectedEventSchema = A({
  type: F(`connected`)
});

/** 原 wm（jsx 7728 / js 7563）：远程工作区获取事件 */
export var RemoteWorkspaceAcquiredEventSchema = A({
  type: F(`remote-workspace-acquired`),
  requestId: RemoteBridgeNonEmptyString,
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString.optional(),
  generation: E().int().positive(),
  ok: D(),
  error: w().optional()
});

/** 原 Tm（jsx 7737 / js 7572）：代理错误事件 */
export var AgentErrorEventSchema = A({
  type: F(`error`),
  error: w()
});

/** 原 Em（jsx 7741 / js 7573）：代理日志事件 */
export var AgentLogEventSchema = A({
  type: F(`log`),
  level: P([`info`, `warn`, `error`]),
  source: w(),
  message: w()
});

/** 原 Dm（jsx 7747 / js 7574）：代理迁移供应商枚举 */
export var AgentMigrationProviderEnum = P([`claudeCode`]);

/** 原 Om（jsx 7748 / js 7575）：代理进程启动事件 */
export var AgentProcessSpawnedEventSchema = A({
  type: F(`agent-process-spawned`),
  pid: E().int().positive(),
  provider: I,
  workspacePath: RemoteBridgeNonEmptyString,
  command: w(),
  args: k(w()),
  startedAt: E().int().nonnegative(),
  runtimeGeneration: E().int().positive().optional(),
  runtimeInstanceId: RemoteBridgeNonEmptyString.optional()
});

/** 原 km（jsx 7759 / js 7586）：代理进程就绪事件 */
export var AgentProcessReadyEventSchema = A({
  type: F(`agent-process-ready`),
  pid: E().int().positive(),
  provider: I,
  workspacePath: RemoteBridgeNonEmptyString,
  readyAt: E().int().nonnegative(),
  startupDurationMs: E().int().nonnegative(),
  runtimeGeneration: E().int().positive(),
  runtimeInstanceId: RemoteBridgeNonEmptyString
});

/** 原 Am（jsx 7769 / js 7596）：代理进程退出事件 */
export var AgentProcessExitedEventSchema = A({
  type: F(`agent-process-exited`),
  pid: E().int().positive(),
  provider: I,
  workspacePath: RemoteBridgeNonEmptyString,
  exitCode: E().int().nullable(),
  signal: w().nullable(),
  endedAt: E().int().nonnegative(),
  terminationKind: P([`expected`, `unexpected`, `watchdog_recycle`]),
  terminationReason: w().optional(),
  runtimeReady: D().optional(),
  runtimeGeneration: E().int().positive(),
  runtimeInstanceId: RemoteBridgeNonEmptyString.optional(),
  uptimeMs: E().int().nonnegative(),
  stderrLineCount: E().int().nonnegative(),
  stderrTail: k(w().max(1100)).max(20).optional()
});

/** 原 jm（jsx 7786 / js 7613）：代理进程错误事件 */
export var AgentProcessErrorEventSchema = A({
  type: F(`agent-process-error`),
  pid: E().int().positive().nullable(),
  provider: I,
  workspacePath: RemoteBridgeNonEmptyString,
  command: w(),
  args: k(w()),
  errorName: RemoteBridgeNonEmptyString,
  errorCode: w().optional(),
  errorMessage: w(),
  errorStack: w().optional(),
  runtimeGeneration: E().int().positive(),
  runtimeInstanceId: RemoteBridgeNonEmptyString.optional(),
  occurredAt: E().int().nonnegative()
});

/** 原 Mm（jsx 7801 / js 7628）：代理资源采样事件 */
export var AgentResourceSampleEventSchema = A({
  type: F(`agent-resource-sample`),
  runtimeSurface: P([`local`, `remote`]),
  sample: AgentResourceSampleSchema
}).strict();

/** 原 Nm（jsx 7806 / js 7633）：代理运行任务数变更事件 */
export var AgentRunningTaskCountChangedEventSchema = A({
  type: F(`agent-running-task-count-changed`),
  runningTaskCount: E().int().nonnegative()
});

/** 原 Pm（jsx 7810 / js 7637）：工作区运行任务数变更事件 */
export var WorkspaceRunningTaskCountChangedEventSchema = A({
  type: F(`workspace-running-task-count-changed`),
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString.optional(),
  runningTaskCount: E().int().nonnegative()
});

/** 原 Fm（jsx 7816 / js 7643）：RepoWiki 运行任务数变更事件 */
export var RepoWikiRunningTaskCountChangedEventSchema = A({
  type: F(`repo-wiki-running-task-count-changed`),
  runningTaskCount: E().int().nonnegative()
});

/** 原 Im（jsx 7820 / js 7647）：任务实时发布事件 */
export var TaskRealtimePublishEventSchema = A({
  type: F(`task-realtime-publish`),
  event: TaskRealtimeEventSchema
});

/** 原 Lm（jsx 7824 / js 7648）：任务流操作发布事件 */
export var TaskStreamOpPublishEventSchema = A({
  type: F(`task-stream-op-publish`),
  target: TaskMirrorValidatedStreamTargetSchema,
  op: TaskMirrorStreamOpSchema
});

/** 原 Rm（jsx 7829 / js 7649）：任务运行租约获取事件 */
export var TaskRunLeaseAcquireEventSchema = A({
  type: F(`task-run-lease-acquire`),
  request: TaskRunLeaseRequestSchema
});

/** 原 zm（jsx 7833 / js 7650）：任务运行租约释放事件 */
export var TaskRunLeaseReleaseEventSchema = A({
  type: F(`task-run-lease-release`),
  target: TaskMirrorStreamReleaseTargetSchema
});

/** 原 Bm（jsx 7837 / js 7651）：任务属主命令请求事件 */
export var TaskOwnerCommandRequestEventSchema = A({
  type: F(`task-owner-command-request`),
  command: TaskOwnerCommandSchema
});

/** 原 Vm（jsx 7841 / js 7652）：任务属主命令结果事件 */
export var TaskOwnerCommandResultEventSchema = A({
  type: F(`task-owner-command-result`),
  result: TaskOwnerCommandResultSchema
});

/** 原 Hm（jsx 7845 / js 7653）：机器人重连请求事件 */
export var BotReconnectRequestEventSchema = A({
  type: F(`bot-remote-workspace-reconnect-request`),
  requestId: RemoteBridgeNonEmptyString,
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString,
  target: RemoteConnectionTargetSchema
});

/** 原 Um（jsx 7852 / js 7660）：机器人连接状态请求事件 */
export var BotConnectionStatusRequestEventSchema = A({
  type: F(`bot-remote-workspace-connection-status-request`),
  requestId: RemoteBridgeNonEmptyString,
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString,
  target: RemoteConnectionTargetSchema
});

/** 原 Wm（jsx 7859 / js 7667）：机器人运行时端口请求事件 */
export var BotRuntimePortRequestEventSchema = A({
  type: F(`bot-remote-workspace-runtime-port-request`),
  requestId: RemoteBridgeNonEmptyString,
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString,
  target: RemoteConnectionTargetSchema
});

/** 原 Gm（jsx 7866 / js 7674）：会话消息发送请求事件 */
export var SessionMessageSendRequestedEventSchema = A({
  type: F(`session-message-send-requested`),
  request: SessionMessageDeliverRequestSchema
});

/** 原 Km（jsx 7870 / js 7675）：会话路由通告事件 */
export var SessionRouteAnnounceEventSchema = A({
  type: F(`session-route-announce`),
  route: SessionRouteAnnouncePayloadSchema
});

/** 原 qm（jsx 7874 / js 7676）：会话消息投递结果事件 */
export var SessionMessageDeliverResultEventSchema = A({
  type: F(`session-message-deliver-result`),
  result: SessionMessageDeliveryResultSchema
});

/** 原 Jm（jsx 7878 / js 7677）：反馈日志归档请求事件 */
export var FeedbackLogArchiveRequestEventSchema = A({
  type: F(`feedback-log-archive-request`),
  requestId: RemoteBridgeNonEmptyString,
  sourceDir: RemoteBridgeNonEmptyString
});

/** 原 Ym（jsx 7883 / js 7678）：定时运行结果事件 */
export var CronRunResultEventSchema = A({
  type: F(`cron-run-result`),
  runId: RemoteBridgeNonEmptyString,
  ok: D(),
  taskId: w().optional(),
  sessionId: w().optional(),
  error: w().optional(),
  failureKind: P([`transient`, `permanent`]).optional()
});

/** 原 Xm（jsx 7892 / js 7687）：低峰运行结果事件 */
export var OffPeakRunResultEventSchema = A({
  type: F(`off-peak-run-result`),
  offPeakTaskId: RemoteBridgeNonEmptyString,
  ok: D(),
  conversationId: w().optional(),
  sessionId: w().optional(),
  error: w().optional(),
  failureKind: P([`transient`, `permanent`]).optional()
});

/** 原 Zm（jsx 7901 / js 7696）：定时调度唤醒请求事件 */
export var CronSchedulerWakeRequestEventSchema = A({
  type: F(`cron-scheduler-wake-request`),
  automationId: RemoteBridgeNonEmptyString
});

/** 原 Qm（jsx 7905 / js 7697）：低峰调度唤醒请求事件 */
export var OffPeakSchedulerWakeRequestEventSchema = A({
  type: F(`off-peak-scheduler-wake-request`),
  offPeakTaskId: w().optional()
});

/** 原 $m（jsx 7909 / js 7698）：浏览器执行请求事件 */
export var BrowserExecuteRequestEventSchema = A({
  type: F(`browser-execute-request`),
  requestId: RemoteBridgeNonEmptyString,
  browserId: RemoteBridgeNonEmptyString.optional(),
  browserGeneration: E().int().nonnegative().optional(),
  sessionId: RemoteBridgeNonEmptyString,
  turnId: RemoteBridgeNonEmptyString.optional(),
  workspaceKey: RemoteBridgeNonEmptyString.optional(),
  workspacePath: RemoteBridgeNonEmptyString.optional(),
  workspaceIdentity: RemoteBridgeNonEmptyString.optional(),
  remoteSessionId: RemoteBridgeNonEmptyString.optional(),
  clientMode: P([`desktop-continuous`, `web-remote-replayable`]).optional(),
  sessionContext: P([`live`, `cached`]).optional(),
  command: Ko
});

/** 原 eh（jsx 7924 / js 7713）：网络遥测观测项 */
export var NetworkTelemetryObservationSchema = A({
  transport: P([`http`, `websocket`, `rpc`]),
  interface: w(),
  durationMs: E(),
  ok: D(),
  statusCode: E().optional(),
  errorKind: w().optional(),
  attempt: E().int().positive().optional(),
  dnsMs: E().optional(),
  tcpMs: E().optional(),
  tlsMs: E().optional(),
  ttfbMs: E().optional(),
  downloadMs: E().optional()
});

/* 原匿名表达式（jsx 7938）：代理宿主事件判别联合 */
M(`type`, [AgentConnectedEventSchema, RemoteWorkspaceAcquiredEventSchema, AgentErrorEventSchema, AgentLogEventSchema, AgentProcessSpawnedEventSchema, AgentProcessReadyEventSchema, AgentProcessExitedEventSchema, AgentProcessErrorEventSchema, AgentResourceSampleEventSchema, AgentRunningTaskCountChangedEventSchema, WorkspaceRunningTaskCountChangedEventSchema, RepoWikiRunningTaskCountChangedEventSchema, BroadcastAgentHostCommandSchema, TaskRealtimePublishEventSchema, TaskStreamOpPublishEventSchema, TaskRunLeaseAcquireEventSchema, TaskRunLeaseReleaseEventSchema, TaskOwnerCommandRequestEventSchema, TaskOwnerCommandResultEventSchema, BotReconnectRequestEventSchema, BotConnectionStatusRequestEventSchema, BotRuntimePortRequestEventSchema, SessionMessageSendRequestedEventSchema, SessionRouteAnnounceEventSchema, SessionMessageDeliverResultEventSchema, FeedbackLogArchiveRequestEventSchema, BrowserExecuteRequestEventSchema, A({
  type: F(`network-telemetry-batch`),
  observations: k(NetworkTelemetryObservationSchema).max(500)
}), CronRunResultEventSchema, OffPeakRunResultEventSchema, CronSchedulerWakeRequestEventSchema, OffPeakSchedulerWakeRequestEventSchema]);


/* ============================================================================
 * §14 任务快照 schema（jsx 7942–8133 / js 7761–7937 区）
 * §15 远程工作区键（jsx 8134–8178 / js 7943–7966 区）
 * ==========================================================================*/

/** 原 th（jsx 7942 / js 7761）：任务快照状态枚举 */
export var TaskSnapshotStatusEnum = P([`running`, `completed`, `error`]);

/** 原 nh（jsx 7943 / js 7762）：快照附件（图片/文件） */
export var SnapshotAttachmentSchema = M(`kind`, [A({
  kind: F(`image`),
  filename: w(),
  mimeType: w(),
  sizeBytes: E().int().nonnegative().optional(),
  dataBase64: w().optional(),
  localPath: w().optional()
}), A({
  kind: F(`file`),
  filename: w(),
  mimeType: w(),
  sizeBytes: E().int().nonnegative(),
  dataBase64: w().optional(),
  textContent: w().optional(),
  localPath: w().optional()
})]);

/** 原 rh（jsx 7959 / js 7781）：快照工具调用 */
export var SnapshotToolCallSchema = A({
  toolName: w().optional(),
  title: w().optional(),
  kind: w().optional(),
  status: P([`completed`, `failed`, `denied`, `stopped`]).optional(),
  input: O(),
  output: O().optional(),
  error: w().optional(),
  raw: O().optional(),
  snapshotRefs: k(A({
    field: P([`input`, `output`, `raw`]),
    refId: w(),
    hash: w(),
    fullBytes: E().int().nonnegative(),
    previewBytes: E().int().nonnegative()
  })).optional()
});

/** 原 ih（jsx 7976 / js 7800）：快照消息部件 */
export var SnapshotMessagePartSchema = M(`type`, [A({
  type: F(`content`),
  content: w()
}), A({
  type: F(`thought`),
  content: w()
}), A({
  type: F(`tool-call`),
  toolIndex: E().int().nonnegative()
})]);

/** 原 ah（jsx 7986 / js 7805）：快照消息 */
export var SnapshotMessageSchema = A({
  id: w().optional(),
  role: P([`user`, `assistant`]),
  content: w(),
  timestamp: E().int().nonnegative(),
  model: w().optional(),
  characterCount: E().int().nonnegative().optional(),
  durationMs: E().int().nonnegative().optional(),
  interrupted: D().optional(),
  feedback: P([`like`, `dislike`]).optional(),
  attachments: k(SnapshotAttachmentSchema).optional(),
  tools: k(SnapshotToolCallSchema).optional(),
  thought: w().optional(),
  parts: k(SnapshotMessagePartSchema).optional(),
  checkpointState: P([`partial`]).optional(),
  checkpointReason: P([`tool_completed`, `part_boundary`, `periodic`]).optional(),
  checkpointUpdatedAt: E().int().nonnegative().optional(),
  turnIndex: E().int().nonnegative().optional(),
  bodyRefs: k(A({
    field: P([`content`, `thought`]),
    refId: w(),
    hash: w(),
    fullBytes: E().int().nonnegative(),
    previewBytes: E().int().nonnegative()
  })).optional(),
  toolSlice: A({
    persistedMessageIndex: E().int().nonnegative(),
    totalTools: E().int().nonnegative(),
    startToolIndex: E().int().nonnegative(),
    endToolIndexExclusive: E().int().nonnegative()
  }).optional()
});

/** 原 oh（jsx 8018 / js 7839）：目标状态枚举 */
export var GoalTargetStatusEnum = P([`active`, `paused`, `budget_limited`, `complete`]);

/** 原 sh（jsx 8019 / js 7840）：目标状态动作类型枚举 */
export var GoalStateActionKindEnum = P([`set`, `status_updated`, `cleared`, `usage_accounted`, `run_started`, `run_finished`, `summary_updated`]);

/** 原 ch（jsx 8020 / js 7849）：目标状态来源枚举 */
export var GoalStateSourceEnum = P([`command`, `tool`, `runtime`]);

/** 原 lh（jsx 8021 / js 7850）：目标对象 */
export var GoalTargetSchema = A({
  sessionID: RemoteBridgeNonEmptyString,
  targetID: RemoteBridgeNonEmptyString,
  objective: RemoteBridgeNonEmptyString,
  summaryTitle: w().min(1).nullable().default(null),
  status: GoalTargetStatusEnum,
  tokenBudget: E().int().positive().nullable(),
  tokensUsed: E().int().nonnegative(),
  timeUsedSeconds: E().int().nonnegative(),
  activeInputId: RemoteBridgeNonEmptyString.nullable().optional(),
  activeRunStartedAtMs: E().int().nonnegative().nullable().optional(),
  activeRunLastSeenAtMs: E().int().nonnegative().nullable().optional(),
  time: A({
    created: E().int().nonnegative(),
    updated: E().int().nonnegative()
  })
});

/* 原匿名表达式（jsx 8038）：目标状态变更消息 */
A({
  action: GoalStateActionKindEnum,
  source: GoalStateSourceEnum,
  target: GoalTargetSchema.nullable(),
  previousTarget: GoalTargetSchema.nullable().optional()
});

/** 原 uh（jsx 8044 / js 7865）：任务快照元数据 */
export var TaskSnapshotMetaSchema = A({
  taskId: RemoteBridgeNonEmptyString,
  traceId: RemoteBridgeNonEmptyString,
  title: w(),
  titleOverridden: D().optional(),
  workspacePath: RemoteBridgeNonEmptyString,
  workspaceIdentity: RemoteBridgeNonEmptyString.optional(),
  workspacePurpose: P([`project`, `conversation`]).optional(),
  createdAt: E().int().nonnegative(),
  updatedAt: E().int().nonnegative(),
  mode: hl,
  model: w().optional(),
  thoughtLevel: RemoteBridgeNonEmptyString.optional(),
  runtimeEpoch: E().int().nonnegative().optional(),
  provider: I.optional(),
  migrationSource: AgentMigrationProviderEnum.optional(),
  forkedFromTaskId: RemoteBridgeNonEmptyString.optional(),
  cronAutomationId: RemoteBridgeNonEmptyString.optional(),
  offPeakTaskId: RemoteBridgeNonEmptyString.optional(),
  unreadAt: E().int().nonnegative().optional(),
  status: TaskSnapshotStatusEnum.optional(),
  lastError: A({
    code: w().optional(),
    detail: w().optional(),
    message: w().min(1),
    traceId: RemoteBridgeNonEmptyString.optional(),
    taskId: RemoteBridgeNonEmptyString.optional()
  }).optional(),
  repairState: A({
    claudeNativeSnapshotAssistantContentVersion: E().int().nonnegative().optional(),
    codexNativeSnapshotSubagentToolsVersion: E().int().nonnegative().optional()
  }).optional(),
  changeSummary: A({
    fileCount: E().int().nonnegative(),
    added: E().int().nonnegative(),
    removed: E().int().nonnegative(),
    files: k(A({
      path: w(),
      added: E().int().nonnegative(),
      removed: E().int().nonnegative(),
      writeCount: E().int().positive(),
      lastTurnIndex: E().int().nonnegative()
    }))
  }).optional(),
  target: GoalTargetSchema.nullable().optional()
});

/** 原 dh（jsx 8090 / js 7913）：原生快照同步状态枚举 */
export var NativeSnapshotSyncStateEnum = P([`idle`, `syncing`, `ready`, `stale`, `failed`]);

/* 原匿名表达式（jsx 8091）：原生快照同步状态记录 */
A({
  provider: I,
  sessionId: RemoteBridgeNonEmptyString,
  lastSyncedTurnIndex: E().int(),
  state: NativeSnapshotSyncStateEnum
});

/** 原 fh（jsx 8097 / js 7915）：任务快照文件键 */
export var TaskSnapshotFileKeySchema = A({
  workspaceHash: RemoteBridgeNonEmptyString,
  taskId: RemoteBridgeNonEmptyString
});

/* 原匿名表达式（jsx 8101）：任务快照文件索引 */
A({
  version: F(`1`),
  tasks: k(TaskSnapshotFileKeySchema)
});

/** 原 ph（jsx 8105 / js 7917）：文件变更快照 */
export var FileChangeSnapshotSchema = A({
  path: w(),
  beforeContent: w().nullable(),
  afterContent: w(),
  writeCount: E().int().positive(),
  contentRefs: k(A({
    field: P([`beforeContent`, `afterContent`]),
    refId: w(),
    hash: w(),
    fullBytes: E().int().nonnegative(),
    previewBytes: E().int().nonnegative()
  })).optional()
});

/** 原 mh（jsx 8118 / js 7932）：回合文件变更快照 */
export var TurnFileChangesSnapshotSchema = A({
  turnIndex: E().int().nonnegative(),
  snapshots: k(FileChangeSnapshotSchema),
  fileState: P([`applied`, `reverted`]).optional()
});

/** 原 hh（jsx 8123 / js 7937）：回合检查点 */
export var TurnCheckpointSchema = A({
  turnIndex: E().int().nonnegative(),
  baseFileCheckpointId: RemoteBridgeNonEmptyString,
  resultFileCheckpointId: RemoteBridgeNonEmptyString.optional()
});

/* 原匿名表达式（jsx 8128）：任务快照整体 */
A({
  meta: TaskSnapshotMetaSchema,
  messages: k(SnapshotMessageSchema),
  fileChanges: k(TurnFileChangesSnapshotSchema).optional(),
  turnCheckpoints: k(TurnCheckpointSchema).optional()
});

/** 原 gh（jsx 8134 / js 7943）：远程工作区键前缀 */
export var REMOTE_WORKSPACE_KEY_PREFIX = `remote:`;

/** 原 _h（jsx 8135 / js 7944）：远程类型段数 */
export var REMOTE_KIND_SEGMENT_COUNTS: any = {
  ssh: 3,
  wsl: 1,
  docker: 1,
  server: 1
};

/** 原 vh（jsx 8141 / js 7945）：是否远程工作区类型 */
export function isRemoteWorkspaceKind(e: any) {
  return e === `ssh` || e === `wsl` || e === `docker` || e === `server`;
}

/** 原 yh（jsx 8144 / js 7948）：规范化远程工作区路径 */
export function normalizeRemoteWorkspacePath(e: any) {
  return `/${e.replace(/\\/g, `/`).replace(/\/+/g, `/`).replace(/^\/+|\/+$/g, ``)}`;
}

/** 原 bh（jsx 8147 / js 7954）：净化服务器 id 用于工作区键 */
export function sanitizeServerIdForWorkspaceKey(e: any) {
  let t = e.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, `-`).replace(/^-+|-+$/g, ``);
  if (!t) throw Error(`serverId must contain at least one identity-safe character`);
  return t;
}

/** 原 xh（jsx 8152 / js 7963）：构建远程服务器工作区键 */
export function buildRemoteServerWorkspaceKey(e: any) {
  return `${REMOTE_WORKSPACE_KEY_PREFIX}server:${sanitizeServerIdForWorkspaceKey(e.serverId)}:${normalizeRemoteWorkspacePath(e.workspacePath)}`;
}

/** 原 Sh（jsx 8155 / js 7966）：解析远程工作区键 */
export function parseRemoteWorkspaceKey(e: any) {
  if (!e.startsWith(REMOTE_WORKSPACE_KEY_PREFIX)) return null;
  let t = e.slice(7),
    n = t.indexOf(`:`);
  if (n <= 0) return null;
  let r = t.slice(0, n);
  if (!isRemoteWorkspaceKind(r)) return null;
  let i = n + 1;
  for (let e = 0; e < REMOTE_KIND_SEGMENT_COUNTS[r]; e++) {
    let e = t.indexOf(`:`, i);
    if (e <= i) return null;
    i = e + 1;
  }
  if (r === `wsl` && t[i] !== `/`) {
    let e = t.indexOf(`:`, i);
    if (e <= i) return null;
    i = e + 1;
  }
  let a = t.slice(i);
  return a.startsWith(`/`) ? {
    kind: r,
    workspacePath: a
  } : null;
}


/* ============================================================================
 * §16 消息可见性分类（jsx 8179–8244 / js 7987–8109 区）
 * §17 目标续行与会话展示状态（jsx 8245–8308 / js 8112–8196 区）
 * §18 testid 前置 schema（jsx 8309–8328 / js 8207–8207 区）
 * ==========================================================================*/

/** 原 Ch（jsx 8179 / js 7987）：仅模型可见标记 */
export var MODEL_ONLY_VISIBILITY = `model-only`;

/** 原 wh（jsx 8180 / js 7988）：分叉消息来源 */
export var FORK_MESSAGE_SOURCE = `fork`;

/** 原 Th（jsx 8181 / js 7989）：目标续行提醒标签 */
export var GOAL_CONTINUATION_REMINDER_TAG = `<system-reminder source="goal-continuation">`;

/** 原 Eh（jsx 8182 / js 7990）：目标续行提示行 */
export var GOAL_CONTINUATION_PROMPT_LINE = `Continue working toward the active session goal.`;

/** 原 Dh（jsx 8183 / js 7991）：目标状态段标题 */
export var GOAL_STATE_SECTION_HEADING = `Current session goal state`;

/** 原 Oh（jsx 8184 / js 7992）：任务通知标签 */
export var TASK_NOTIFICATION_TAG = `<task-notification>`;

/** 原 kh（jsx 8185 / js 7993）：子代理通知标签 */
export var SUBAGENT_NOTIFICATION_TAG = `<subagent-notification>`;

/** 原 Ah（jsx 8186 / js 7994）：回退应用提示行 */
export var REWIND_APPLIED_NOTICE_LINES = [`Conversation rewind applied.`, `Workspace rewind applied.`];

/** 原 jh（jsx 8187 / js 7995）：仅供应商上下文消息来源集合 */
export var PROVIDER_ONLY_MESSAGE_SOURCES = new Set([`agent_control_message`, `background_task`, `goal-continuation`, `goal_completion_verification`, `goal_state_change`, `plugin_reference`, `queued_system_notification`, `resume_goal_state`, `resume_referenced_session_context`, `rewind`, `selection_side_chat`, `subagent`, `subagent_message`, `target_continuation`, `task_notification`, `task_status`, `todo_reminder`]);

/** 原 Mh（jsx 8188 / js 8014）：消息可见性分类 */
export function classifyMessageVisibility(e: any) {
  let t = e.info,
    n = e.parts ?? [],
    r = t.semantics;
  if (r?.kind === `compact_summary` || t.summary !== void 0) return `providerContextOnly`;
  if (r) {
    if (r.kind === `timeline_event`) return `timelineOnly`;
    if (r.origin === `real_user` && t.synthetic !== !0 && t.visibility !== MODEL_ONLY_VISIBILITY) return `realUserInput`;
    if (t.role === `assistant` && r.kind === `assistant_response` && r.uiVisibility === `visible` && r.transcriptVisibility === `visible`) return `visibleAssistant`;
    if (r.providerVisibility === `visible`) return `providerContextOnly`;
    if (r.kind === `fork_notice`) return `timelineOnly`;
    if (r.origin === `agent_runtime` || r.uiVisibility === `hidden` || r.transcriptVisibility === `hidden`) return `hiddenSynthetic`;
  }
  if (t.visibility === MODEL_ONLY_VISIBILITY || hasProviderOnlyParts(n)) return `providerContextOnly`;
  if (isTimelineOnlyMessage(t, n)) return `timelineOnly`;
  let i = resolveMessageSource(t, n);
  return i === FORK_MESSAGE_SOURCE ? `timelineOnly` : i && PROVIDER_ONLY_MESSAGE_SOURCES.has(i) || isGoalContinuationText(n) || (t.synthetic === !0 || n.some((e: any) => e.synthetic === !0)) && isQueuedNotificationText(n) ? `providerContextOnly` : t.synthetic === !0 || n.some((e: any) => e.synthetic === !0) ? `hiddenSynthetic` : t.role === `assistant` ? `visibleAssistant` : `realUserInput`;
}

/** 原 Nh（jsx 8206 / js 8054）：是否仅时间线消息 */
export function isTimelineOnlyMessage(e: any, t: any) {
  if (e.semantics?.kind === `timeline_event`) return !0;
  let n = asPlainRecord(e.metadata);
  return e.source === FORK_MESSAGE_SOURCE || asNonEmptyString(n?.source) === FORK_MESSAGE_SOURCE ? !0 : t.some((e: any) => {
    let t = asPlainRecord(e.metadata);
    return e.type === `timeline` || isSessionForkContextMetadata(t) || e.type === `compaction` && (typeof t?.timelineStatus == `string` || typeof e.summaryMessageId == `string`);
  });
}

/** 原 Ph（jsx 8214 / js 8069）：是否含仅供应商部件 */
export function hasProviderOnlyParts(e: any) {
  return e.some((e: any) => {
    let t = asPlainRecord(e.metadata);
    return t?.visibility === MODEL_ONLY_VISIBILITY || asNonEmptyString(t?.source) === `goal-continuation`;
  });
}

/** 原 Fh（jsx 8220 / js 8075）：解析消息来源 */
export function resolveMessageSource(e: any, t: any) {
  let n = asPlainRecord(e.metadata);
  return e.source ?? asNonEmptyString(n?.source) ?? e.semantics?.source ?? t.map((e: any) => asNonEmptyString(asPlainRecord(e.metadata)?.source)).find((e: any) => !!e);
}

/** 原 Ih（jsx 8224 / js 8084）：是否目标续行文本 */
export function isGoalContinuationText(e: any) {
  let t = collectVisiblePartText(e).trimStart();
  return t.startsWith(GOAL_CONTINUATION_REMINDER_TAG) || t.startsWith(`<system-reminder>`) && (t.includes(GOAL_CONTINUATION_PROMPT_LINE) || t.includes(GOAL_STATE_SECTION_HEADING)) || REWIND_APPLIED_NOTICE_LINES.some((e: any) => t.includes(e));
}

/** 原 Lh（jsx 8228 / js 8092）：是否排队通知文本 */
export function isQueuedNotificationText(e: any) {
  let t = collectVisiblePartText(e).trimStart();
  return t.startsWith(TASK_NOTIFICATION_TAG) || t.startsWith(SUBAGENT_NOTIFICATION_TAG);
}

/** 原 Rh（jsx 8232 / js 8096）：收集可见部件文本 */
export function collectVisiblePartText(e: any) {
  return e.filter((e: any) => e.type === `text` && e.ignored !== !0).map((e: any) => e.text ?? ``).join(``);
}

/** 原 zh（jsx 8235 / js 8102）：是否会话分叉上下文元数据 */
export function isSessionForkContextMetadata(e: any) {
  let t = asPlainRecord(e)?.forkContext;
  return typeof t == `object` && !!t && !Array.isArray(t) && t.kind === `session_fork`;
}

/** 原 Bh（jsx 8239 / js 8106）：转纯记录 */
export function asPlainRecord(e: any) {
  return e && typeof e == `object` && !Array.isArray(e) ? e : void 0;
}

/** 原 Vh（jsx 8242 / js 8109）：转非空字符串 */
export function asNonEmptyString(e: any) {
  return typeof e == `string` && e.length > 0 ? e : void 0;
}

/** 原 Hh（jsx 8245 / js 8112）：目标续行系统标签 */
export var GOAL_CONTINUATION_SYSTEM_TAG = `<system-reminder source="goal-continuation">`;

/** 原 Uh（jsx 8246 / js 8113）：目标续行提示 */
export var GOAL_CONTINUATION_PROMPT = `Continue working toward the active session goal.`;

/** 原 Wh（jsx 8247 / js 8114）：目标状态标题行 */
export var GOAL_STATE_HEADING_LINE = `Current session goal state`;

/** 原 Gh（jsx 8248 / js 8115）：子代理消息来源 */
export var SUBAGENT_MESSAGE_SOURCE = `subagent_message`;

/** 原 Kh（jsx 8249 / js 8116）：是否目标续行内容 */
export function isGoalContinuationContent(e: any) {
  let t = e.trimStart();
  return t.startsWith(GOAL_CONTINUATION_SYSTEM_TAG) ? !0 : t.startsWith(`<system-reminder>`) && t.includes(GOAL_CONTINUATION_PROMPT);
}

/** 原 qh（jsx 8253 / js 8120）：是否目标续行消息 */
export function isGoalContinuationMessage(e: any) {
  return e.info.role === `user` && (e.info.source === `goal-continuation` || String(e.info.metadata?.source ?? ``) === `goal-continuation` || isGoalContinuationContent(ac(e.parts)));
}

/** 原 Jh（jsx 8256 / js 8128）：是否目标状态内容 */
export function isGoalStateContent(e: any) {
  let t = e.trimStart();
  return t.startsWith(`<system-reminder>`) && t.includes(GOAL_STATE_HEADING_LINE);
}

/** 原 Yh（jsx 8260 / js 8132）：是否目标状态消息 */
export function isGoalStateMessage(e: any) {
  return e.info.role === `user` && (isGoalContinuationMessage(e) || isGoalStateContent(ac(e.parts)));
}

/** 原 Xh（jsx 8263 / js 8135）：消息是否对用户隐藏 */
export function isMessageHiddenFromUser(e: any) {
  if (e.info.role === `user` && (String(e.info.source ?? ``) === SUBAGENT_MESSAGE_SOURCE || String(e.info.metadata?.source ?? ``) === SUBAGENT_MESSAGE_SOURCE || e.parts.some((e: any) => e.type === `text` && String(e.metadata?.source ?? ``) === SUBAGENT_MESSAGE_SOURCE))) return !0;
  let t = classifyMessageVisibility(e);
  return t === `providerContextOnly` || t === `hiddenSynthetic`;
}

/** 原 Zh（jsx 8268 / js 8146）：是否压缩时间线消息 */
export function isCompactionTimelineMessage(e: any) {
  return e.info.role === `user` && e.parts.some((e: any) => e.type === `compaction` ? typeof e.metadata?.timelineStatus != `string` : !1);
}

/** 原 Qh（jsx 8271 / js 8154）：过滤用户可见消息 */
export function filterUserVisibleMessages(e: any, t: any = {}) {
  let n = [];
  for (let t of e) isMessageHiddenFromUser(t) || isCompactionTimelineMessage(t) || n.push(t);
  return n;
}

/** 原 $h（jsx 8276 / js 8159）：解析会话展示标题 */
export function resolveSessionDisplayTitle(e: any) {
  let t = e.title?.trim() ?? ``;
  if (t && !isGoalContinuationContent(t) && !isGoalStateContent(t)) return t;
  let n = ac(e.messages.find((e: any) => e.info.role === `user` && classifyMessageVisibility(e) === `realUserInput` && !isGoalStateMessage(e))?.parts ?? []).trim();
  if (n) return n.slice(0, 80);
  let r = e.target?.objective.trim() ?? ``;
  return r ? r.slice(0, 80) : e.fallback ?? `New session`;
}

/** 原 eg（jsx 8284 / js 8170）：子代理状态 → 展示状态 */
export function mapSubagentStatusToDisplayStatus(e: any) {
  if (e === `running` || e === `waiting` || e === `paused`) return `running`;
  if (e === `error`) return `error`;
  if (e === `completed`) return `completed`;
}

/** 原 tg（jsx 8289 / js 8175）：会话是否有活动工作 */
export function hasSessionActiveWork(e: any) {
  return e.runtime.activeTurnId || e.runtime.activeTurnKind || (e.projection.pendingPermissions ?? []).length > 0 ? !0 : (e.projection.activeToolCalls ?? []).some((e: any) => e.status === `pending` || e.status === `running`);
}

/** 原 ng（jsx 8292 / js 8184）：会话是否忙碌 */
export function isSessionBusy(e: any) {
  return hasSessionActiveWork(e);
}

/** 原 rg（jsx 8295 / js 8187）：是否 tool-calls 结束原因 */
export function isToolCallsFinishReason(e: any) {
  return e?.trim().toLowerCase().replace(/_/g, `-`) === `tool-calls`;
}

/** 原 ig（jsx 8298 / js 8190）：会话助手是否已完成 */
export function isSessionAssistantCompleted(e: any) {
  let t = filterUserVisibleMessages(e.messages, {
    target: e.projection.target
  }).at(-1);
  return t?.info.role !== `assistant` || isToolCallsFinishReason(t.info.finish) ? !1 : typeof t.info.time.completed == `number`;
}

/** 原 ag（jsx 8304 / js 8196）：解析会话展示状态 */
export function resolveSessionDisplayStatus(e: any) {
  if (e.projection.lastError) return `error`;
  let t = mapSubagentStatusToDisplayStatus(e.session.status);
  return t === `error` || t === `completed` ? t : isSessionAssistantCompleted(e) && !hasSessionActiveWork(e) ? `completed` : isSessionBusy(e) ? t ?? `running` : t;
}

/** 原 og（jsx 8309 / js 8207）：工作区路径选项 */
export var WorkspacePathOptionSchema = A({
  path: w().trim().min(1),
  label: w().trim().min(1).optional(),
  workspaceIdentity: w().trim().min(1).optional()
});

/* 原匿名表达式（jsx 8314）：服务器能力通告/能力租约 */
A({
  serverId: w().trim().min(1),
  name: w().trim().min(1).optional(),
  version: w(),
  protocolVersion: F(1),
  authRequired: D(),
  workspaces: k(WorkspacePathOptionSchema),
  capabilities: A({
    desktopContinuous: F(!0),
    websocketRpc: F(!0)
  })
}), A({
  capability: w().trim().min(1),
  expiresAt: E().int().positive()
}).strict();


/* ============================================================================
 * §19 testid 常量群（jsx 8329–8570 / js 8222–8463 区，242 项）
 *    原为单一 var 链；按重建体例拆为独立 export var 声明，顺序不变。
 *    命名 = camelCase(字符串值) + Testid；字符串值零改动。
 * ==========================================================================*/

/** 原 sg（jsx 8329 / js 8222） */ export var loginTriggerTestid = `login-trigger`;
/** 原 cg（jsx 8330 / js 8223） */ export var loginMenuItemTestid = `login-menu-item`;
/** 原 lg（jsx 8331 / js 8224） */ export var loginUseApiKeyButtonTestid = `login-use-api-key-button`;
/** 原 ug（jsx 8332 / js 8225） */ export var loginApiKeyProviderTriggerTestid = `login-api-key-provider-trigger`;
/** 原 dg（jsx 8333 / js 8226） */ export var loginApiKeyProviderItemTestid = `login-api-key-provider-item`;
/** 原 fg（jsx 8334 / js 8227） */ export var loginApiKeyInputTestid = `login-api-key-input`;
/** 原 pg（jsx 8335 / js 8228） */ export var loginApiKeyContinueButtonTestid = `login-api-key-continue-button`;
/** 原 mg（jsx 8336 / js 8229） */ export var loginApiKeyCancelButtonTestid = `login-api-key-cancel-button`;
/** 原 hg（jsx 8337 / js 8230） */ export var loginApiKeySkipButtonTestid = `login-api-key-skip-button`;
/** 原 gg（jsx 8338 / js 8231） */ export var loginApiKeyErrorTestid = `login-api-key-error`;
/** 原 _g（jsx 8339 / js 8232） */ export var oauthLoginButtonTestid = `oauth-login-button`;
/** 原 vg（jsx 8340 / js 8233） */ export var oauthCancelTestid = `oauth-cancel`;
/** 原 yg（jsx 8341 / js 8234） */ export var oauthErrorTestid = `oauth-error`;
/** 原 bg（jsx 8342 / js 8235） */ export var appHeaderTestid = `app-header`;
/** 原 xg（jsx 8343 / js 8236） */ export var logoutButtonTestid = `logout-button`;
/** 原 Sg（jsx 8344 / js 8237） */ export var terminalToggleTestid = `terminal-toggle`;
/** 原 Cg（jsx 8345 / js 8238） */ export var terminalCloseButtonTestid = `terminal-close-button`;
/** 原 wg（jsx 8346 / js 8239） */ export var gitPaneTestid = `git-pane`;
/** 原 Tg（jsx 8347 / js 8240） */ export var browserAddressInputTestid = `browser-address-input`;
/** 原 Eg（jsx 8348 / js 8241） */ export var browserBackButtonTestid = `browser-back-button`;
/** 原 Dg（jsx 8349 / js 8242） */ export var browserForwardButtonTestid = `browser-forward-button`;
/** 原 Og（jsx 8350 / js 8243） */ export var browserRefreshButtonTestid = `browser-refresh-button`;
/** 原 kg（jsx 8351 / js 8244） */ export var browserResponsiveButtonTestid = `browser-responsive-button`;
/** 原 Ag（jsx 8352 / js 8245） */ export var browserResponsiveViewportTestid = `browser-responsive-viewport`;
/** 原 jg（jsx 8353 / js 8246） */ export var browserResponsiveToolbarTestid = `browser-responsive-toolbar`;
/** 原 Mg（jsx 8354 / js 8247） */ export var browserResponsiveWidthInputTestid = `browser-responsive-width-input`;
/** 原 Ng（jsx 8355 / js 8248） */ export var browserResponsiveHeightInputTestid = `browser-responsive-height-input`;
/** 原 Pg（jsx 8356 / js 8249） */ export var browserResponsiveZoomSelectTestid = `browser-responsive-zoom-select`;
/** 原 Fg（jsx 8357 / js 8250） */ export var browserResponsiveZoomOptionTestid = `browser-responsive-zoom-option`;
/** 原 Ig（jsx 8358 / js 8251） */ export var browserResponsiveScaledFrameTestid = `browser-responsive-scaled-frame`;
/** 原 Lg（jsx 8359 / js 8252） */ export var browserResponsiveResizeLeftTestid = `browser-responsive-resize-left`;
/** 原 Rg（jsx 8360 / js 8253） */ export var browserResponsiveResizeWidthTestid = `browser-responsive-resize-width`;
/** 原 zg（jsx 8361 / js 8254） */ export var browserResponsiveResizeTopTestid = `browser-responsive-resize-top`;
/** 原 Bg（jsx 8362 / js 8255） */ export var browserResponsiveResizeHeightTestid = `browser-responsive-resize-height`;
/** 原 Vg（jsx 8363 / js 8256） */ export var browserResponsiveResizeCornerTopLeftTestid = `browser-responsive-resize-corner-top-left`;
/** 原 Hg（jsx 8364 / js 8257） */ export var browserResponsiveResizeCornerTopRightTestid = `browser-responsive-resize-corner-top-right`;
/** 原 Ug（jsx 8365 / js 8258） */ export var browserResponsiveResizeCornerBottomLeftTestid = `browser-responsive-resize-corner-bottom-left`;
/** 原 Wg（jsx 8366 / js 8259） */ export var browserResponsiveResizeCornerTestid = `browser-responsive-resize-corner`;
/** 原 Gg（jsx 8367 / js 8260） */ export var browserElementPickerButtonTestid = `browser-element-picker-button`;
/** 原 Kg（jsx 8368 / js 8261） */ export var browserMoreButtonTestid = `browser-more-button`;
/** 原 qg（jsx 8369 / js 8262） */ export var browserOpenExternalItemTestid = `browser-open-external-item`;
/** 原 Jg（jsx 8370 / js 8263） */ export var browserDevtoolsButtonTestid = `browser-devtools-button`;
/** 原 Yg（jsx 8371 / js 8264） */ export var browserWebviewTestid = `browser-webview`;
/** 原 Xg（jsx 8372 / js 8265） */ export var previewPaneTestid = `preview-pane`;
/** 原 Zg（jsx 8373 / js 8266） */ export var toolSummaryTriggerTestid = `tool-summary-trigger`;
/** 原 Qg（jsx 8374 / js 8267） */ export var terminalTestid = `terminal`;
/** 原 $g（jsx 8375 / js 8268） */ export var sshConnectTriggerTestid = `ssh-connect-trigger`;
/** 原 e_（jsx 8376 / js 8269） */ export var sshDialogTestid = `ssh-dialog`;
/** 原 t_（jsx 8377 / js 8270） */ export var remoteKindSshTestid = `remote-kind-ssh`;
/** 原 n_（jsx 8378 / js 8271） */ export var remoteKindServerTestid = `remote-kind-server`;
/** 原 r_（jsx 8379 / js 8272） */ export var remoteKindWslTestid = `remote-kind-wsl`;
/** 原 i_（jsx 8380 / js 8273） */ export var remoteKindDockerTestid = `remote-kind-docker`;
/** 原 a_（jsx 8381 / js 8274） */ export var sshHostInputTestid = `ssh-host-input`;
/** 原 o_（jsx 8382 / js 8275） */ export var sshPortInputTestid = `ssh-port-input`;
/** 原 s_（jsx 8383 / js 8276） */ export var sshUsernameInputTestid = `ssh-username-input`;
/** 原 c_（jsx 8384 / js 8277） */ export var sshConfigAliasSelectTestid = `ssh-config-alias-select`;
/** 原 l_（jsx 8385 / js 8278） */ export var sshPasswordInputTestid = `ssh-password-input`;
/** 原 u_（jsx 8386 / js 8279） */ export var sshPrivateKeyInputTestid = `ssh-private-key-input`;
/** 原 d_（jsx 8387 / js 8280） */ export var sshAuthPasswordTestid = `ssh-auth-password`;
/** 原 f_（jsx 8388 / js 8281） */ export var sshAuthPrivateKeyTestid = `ssh-auth-private-key`;
/** 原 p_（jsx 8389 / js 8282） */ export var wslDistroSelectTestid = `wsl-distro-select`;
/** 原 m_（jsx 8390 / js 8283） */ export var wslUserInputTestid = `wsl-user-input`;
/** 原 h_（jsx 8391 / js 8284） */ export var dockerContainerSelectTestid = `docker-container-select`;
/** 原 g_（jsx 8392 / js 8285） */ export var dockerContainerInputTestid = `docker-container-input`;
/** 原 __（jsx 8393 / js 8286） */ export var serverUrlInputTestid = `server-url-input`;
/** 原 v_（jsx 8394 / js 8287） */ export var serverNameInputTestid = `server-name-input`;
/** 原 y_（jsx 8395 / js 8288） */ export var serverTokenInputTestid = `server-token-input`;
/** 原 b_（jsx 8396 / js 8289） */ export var serverWorkspacePathInputTestid = `server-workspace-path-input`;
/** 原 x_（jsx 8397 / js 8290） */ export var sidebarTestid = `sidebar`;
/** 原 S_（jsx 8398 / js 8291） */ export var workspaceListTestid = `workspace-list`;
/** 原 C_（jsx 8399 / js 8292） */ export var workspaceItemTestid = `workspace-item`;
/** 原 w_（jsx 8400 / js 8293） */ export var workspaceCloseTestid = `workspace-close`;
/** 原 T_（jsx 8401 / js 8294） */ export var conversationSectionTestid = `conversation-section`;
/** 原 E_（jsx 8402 / js 8295） */ export var projectSectionTestid = `project-section`;
/** 原 D_（jsx 8403 / js 8296） */ export var conversationNewTaskTestid = `conversation-new-task`;
/** 原 O_（jsx 8404 / js 8297） */ export var projectAddTestid = `project-add`;
/** 原 k_（jsx 8405 / js 8298） */ export var composerWorkspaceTriggerTestid = `composer-workspace-trigger`;
/** 原 A_（jsx 8406 / js 8299） */ export var composerRemoteConnectionTestid = `composer-remote-connection`;
/** 原 j_（jsx 8407 / js 8300） */ export var composerProjectDetachTestid = `composer-project-detach`;
/** 原 M_（jsx 8408 / js 8301） */ export var composerWorkOutsideProjectTestid = `composer-work-outside-project`;
/** 原 N_（jsx 8409 / js 8302） */ export var chatErrorBannerTestid = `chat-error-banner`;
/** 原 P_（jsx 8410 / js 8303） */ export var chatEmptyTestid = `chat-empty`;
/** 原 F_（jsx 8411 / js 8304） */ export var chatAttachmentButtonTestid = `chat-attachment-button`;
/** 原 I_（jsx 8412 / js 8305） */ export var chatAttachmentMenuItemTestid = `chat-attachment-menu-item`;
/** 原 L_（jsx 8413 / js 8306） */ export var chatSendButtonTestid = `chat-send-button`;
/** 原 R_（jsx 8414 / js 8307） */ export var chatLoadingTestid = `chat-loading`;
/** 原 z_（jsx 8415 / js 8308） */ export var chatSummaryPanelTestid = `chat-summary-panel`;
/** 原 B_（jsx 8416 / js 8309） */ export var chatAssistantHistoryTriggerTestid = `chat-assistant-history-trigger`;
/** 原 V_（jsx 8417 / js 8310） */ export var chatAssistantHistoryContentTestid = `chat-assistant-history-content`;
/** 原 H_（jsx 8418 / js 8311） */ export var chatBackgroundResultTitleTestid = `chat-background-result-title`;
/** 原 U_（jsx 8419 / js 8312） */ export var chatToolCallBlockTestid = `chat-tool-call-block`;
/** 原 W_（jsx 8420 / js 8313） */ export var promptSuggestionPanelTestid = `prompt-suggestion-panel`;
/** 原 G_（jsx 8421 / js 8314） */ export var promptSuggestionSectionTestid = `prompt-suggestion-section`;
/** 原 K_（jsx 8422 / js 8315） */ export var promptSuggestionOptionTestid = `prompt-suggestion-option`;
/** 原 q_（jsx 8423 / js 8316） */ export var promptSuggestionStatusTestid = `prompt-suggestion-status`;
/** 原 J_（jsx 8424 / js 8317） */ export var taskListTestid = `task-list`;
/** 原 Y_（jsx 8425 / js 8318） */ export var taskNewButtonTestid = `task-new-button`;
/** 原 X_（jsx 8426 / js 8319） */ export var taskItemTestid = `task-item`;
/** 原 Z_（jsx 8427 / js 8320） */ export var taskEmptyTestid = `task-empty`;
/** 原 Q_（jsx 8428 / js 8321） */ export var taskArchiveTestid = `task-archive`;
/** 原 $_（jsx 8429 / js 8322） */ export var taskSettingsButtonTestid = `task-settings-button`;
/** 原 ev（jsx 8430 / js 8323） */ export var settingsPageTestid = `settings-page`;
/** 原 tv（jsx 8431 / js 8324） */ export var settingsBackButtonTestid = `settings-back-button`;
/** 原 nv（jsx 8432 / js 8325） */ export var settingsSectionNavTestid = `settings-section-nav`;
/** 原 rv（jsx 8433 / js 8326） */ export var settingsNativeSearchSwitchTestid = `settings-native-search-switch`;
/** 原 iv（jsx 8434 / js 8327） */ export var settingsMemorySwitchTestid = `settings-memory-switch`;
/** 原 av（jsx 8435 / js 8328） */ export var settingsMemoryRefreshTestid = `settings-memory-refresh`;
/** 原 ov（jsx 8436 / js 8329） */ export var settingsMemoryBackProjectsTestid = `settings-memory-back-projects`;
/** 原 sv（jsx 8437 / js 8330） */ export var settingsMemoryBackMemoriesTestid = `settings-memory-back-memories`;
/** 原 cv（jsx 8438 / js 8331） */ export var settingsMemoryWorkspaceTestid = `settings-memory-workspace`;
/** 原 lv（jsx 8439 / js 8332） */ export var settingsMemoryFileTestid = `settings-memory-file`;
/** 原 uv（jsx 8440 / js 8333） */ export var settingsMemoryPreviewTestid = `settings-memory-preview`;
/** 原 dv（jsx 8441 / js 8334） */ export var settingsAskUserQuestionAutoResolutionSwitchTestid = `settings-ask-user-question-auto-resolution-switch`;
/** 原 fv（jsx 8442 / js 8335） */ export var settingsLocaleSelectTriggerTestid = `settings-locale-select-trigger`;
/** 原 pv（jsx 8443 / js 8336） */ export var settingsLocaleSelectItemTestid = `settings-locale-select-item`;
/** 原 mv（jsx 8444 / js 8337） */ export var mcpServerRowTestid = `mcp-server-row`;
/** 原 hv（jsx 8445 / js 8338） */ export var pluginMcpServerRowTestid = `plugin-mcp-server-row`;
/** 原 gv（jsx 8446 / js 8339） */ export var mcpOpenAuthorizationButtonTestid = `mcp-open-authorization-button`;
/** 原 _v（jsx 8447 / js 8340） */ export var subagentRowTestid = `subagent-row`;
/** 原 vv（jsx 8448 / js 8341） */ export var subagentBuiltInModelTriggerTestid = `subagent-built-in-model-trigger`;
/** 原 yv（jsx 8449 / js 8342） */ export var settingsUsageTabTestid = `settings-usage-tab`;
/** 原 bv（jsx 8450 / js 8343） */ export var sidebarCodingPlanUsageButtonTestid = `sidebar-coding-plan-usage-button`;
/** 原 xv（jsx 8451 / js 8344） */ export var modelProviderNavItemTestid = `model-provider-nav-item`;
/** 原 Sv（jsx 8452 / js 8345） */ export var modelProviderConnectionModeTriggerTestid = `model-provider-connection-mode-trigger`;
/** 原 Cv（jsx 8453 / js 8346） */ export var modelProviderConnectionModeItemTestid = `model-provider-connection-mode-item`;
/** 原 wv（jsx 8454 / js 8347） */ export var modelProviderApiKeyInputTestid = `model-provider-api-key-input`;
/** 原 Tv（jsx 8455 / js 8348） */ export var modelProviderModelInputTestid = `model-provider-model-input`;
/** 原 Ev（jsx 8456 / js 8349） */ export var modelProviderModelDeleteButtonTestid = `model-provider-model-delete-button`;
/** 原 Dv（jsx 8457 / js 8350） */ export var modelProviderAddModelButtonTestid = `model-provider-add-model-button`;
/** 原 Ov（jsx 8458 / js 8351） */ export var chatModelSelectTriggerTestid = `chat-model-select-trigger`;
/** 原 kv（jsx 8459 / js 8352） */ export var chatModelSelectGroupTestid = `chat-model-select-group`;
/** 原 Av（jsx 8460 / js 8353） */ export var chatModelSelectItemTestid = `chat-model-select-item`;
/** 原 jv（jsx 8461 / js 8354） */ export var chatThoughtLevelSelectTriggerTestid = `chat-thought-level-select-trigger`;
/** 原 Mv（jsx 8462 / js 8355） */ export var chatThoughtLevelSelectItemTestid = `chat-thought-level-select-item`;
/** 原 Nv（jsx 8463 / js 8356） */ export var chatModeSelectTriggerTestid = `chat-mode-select-trigger`;
/** 原 Pv（jsx 8464 / js 8357） */ export var chatModeSelectItemTestid = `chat-mode-select-item`;
/** 原 Fv（jsx 8465 / js 8358） */ export var chatContextUsageTriggerTestid = `chat-context-usage-trigger`;
/** 原 Iv（jsx 8466 / js 8359） */ export var chatReasoningTriggerTestid = `chat-reasoning-trigger`;
/** 原 Lv（jsx 8467 / js 8360） */ export var chatReasoningContentTestid = `chat-reasoning-content`;
/** 原 Rv（jsx 8468 / js 8361） */ export var workspaceHeaderTestid = `workspace-header`;
/** 原 zv（jsx 8469 / js 8362） */ export var workspaceTitleTestid = `workspace-title`;
/** 原 Bv（jsx 8470 / js 8363） */ export var workspacePathTestid = `workspace-path`;
/** 原 Vv（jsx 8471 / js 8364） */ export var workspaceMoreButtonTestid = `workspace-more-button`;
/** 原 Hv（jsx 8472 / js 8365） */ export var workspaceFileTreeButtonTestid = `workspace-file-tree-button`;
/** 原 Uv（jsx 8473 / js 8366） */ export var workspaceFileTreePanelTestid = `workspace-file-tree-panel`;
/** 原 Wv（jsx 8474 / js 8367） */ export var workspaceFileTreeRefreshButtonTestid = `workspace-file-tree-refresh-button`;
/** 原 Gv（jsx 8475 / js 8368） */ export var workspaceFileTreeRowTestid = `workspace-file-tree-row`;
/** 原 Kv（jsx 8476 / js 8369） */ export var sshErrorTestid = `ssh-error`;
/** 原 qv（jsx 8477 / js 8370） */ export var sshSuccessTestid = `ssh-success`;
/** 原 Jv（jsx 8478 / js 8371） */ export var v4SessionPaneTestid = `v4-session-pane`;
/** 原 Yv（jsx 8479 / js 8372） */ export var v4TimelineTestid = `v4-timeline`;
/** 原 Xv（jsx 8480 / js 8373） */ export var v4RowTestid = `v4-row`;
/** 原 Zv（jsx 8481 / js 8374） */ export var v4ComposerTestid = `v4-composer`;
/** 原 Qv（jsx 8482 / js 8375） */ export var v4ComposerInputTestid = `v4-composer-input`;
/** 原 $v（jsx 8483 / js 8376） */ export var v4ComposerBackgroundWorkTriggerTestid = `v4-composer-background-work-trigger`;
/** 原 ey（jsx 8484 / js 8377） */ export var v4ComposerSendTestid = `v4-composer-send`;
/** 原 ty（jsx 8485 / js 8378） */ export var v4ComposerClearQueueSendTestid = `v4-composer-clear-queue-send`;
/** 原 ny（jsx 8486 / js 8379） */ export var v4ComposerKeepQueueSendTestid = `v4-composer-keep-queue-send`;
/** 原 ry（jsx 8487 / js 8380） */ export var v4PausedQueueSendDialogTestid = `v4-paused-queue-send-dialog`;
/** 原 iy（jsx 8488 / js 8381） */ export var v4AttachmentTestid = `v4-attachment`;
/** 原 ay（jsx 8489 / js 8382） */ export var v4AttachmentUploadProgressTestid = `v4-attachment-upload-progress`;
/** 原 oy（jsx 8490 / js 8383） */ export var v4AttachmentUploadRetryTestid = `v4-attachment-upload-retry`;
/** 原 sy（jsx 8491 / js 8384） */ export var v4StopTestid = `v4-stop`;
/** 原 cy（jsx 8492 / js 8385） */ export var v4ForkTestid = `v4-fork`;
/** 原 ly（jsx 8493 / js 8386） */ export var v4FeedbackLikeTestid = `v4-feedback-like`;
/** 原 uy（jsx 8494 / js 8387） */ export var v4FeedbackDislikeTestid = `v4-feedback-dislike`;
/** 原 dy（jsx 8495 / js 8388） */ export var v4EditTestid = `v4-edit`;
/** 原 fy（jsx 8496 / js 8389） */ export var v4EditInputTestid = `v4-edit-input`;
/** 原 py（jsx 8497 / js 8390） */ export var v4EditSubmitTestid = `v4-edit-submit`;
/** 原 my（jsx 8498 / js 8391） */ export var v4EditCancelTestid = `v4-edit-cancel`;
/** 原 hy（jsx 8499 / js 8392） */ export var v4EditAttachmentRemoveTestid = `v4-edit-attachment-remove`;
/** 原 gy（jsx 8500 / js 8393） */ export var v4EditRewindWorkspaceTestid = `v4-edit-rewind-workspace`;
/** 原 _y（jsx 8501 / js 8394） */ export var v4EditWorkspaceConflictDialogTestid = `v4-edit-workspace-conflict-dialog`;
/** 原 vy（jsx 8502 / js 8395） */ export var v4EditWorkspaceConflictConversationOnlyTestid = `v4-edit-workspace-conflict-conversation-only`;
/** 原 yy（jsx 8503 / js 8396） */ export var v4QueueTestid = `v4-queue`;
/** 原 by（jsx 8504 / js 8397） */ export var v4QueuePausedBannerTestid = `v4-queue-paused-banner`;
/** 原 xy（jsx 8505 / js 8398） */ export var v4QueueResumeTestid = `v4-queue-resume`;
/** 原 Sy（jsx 8506 / js 8399） */ export var v4QueueItemTestid = `v4-queue-item`;
/** 原 Cy（jsx 8507 / js 8400） */ export var v4QueueItemDeleteTestid = `v4-queue-item-delete`;
/** 原 wy（jsx 8508 / js 8401） */ export var v4QueueItemEditTestid = `v4-queue-item-edit`;
/** 原 Ty（jsx 8509 / js 8402） */ export var v4QueueItemSendNowTestid = `v4-queue-item-send-now`;
/** 原 Ey（jsx 8510 / js 8403） */ export var v4SessionTitleTestid = `v4-session-title`;
/** 原 Dy（jsx 8511 / js 8404） */ export var v4BackgroundWorkItemTestid = `v4-background-work-item`;
/** 原 Oy（jsx 8512 / js 8405） */ export var v4BackgroundWorkCancelTestid = `v4-background-work-cancel`;
/** 原 ky（jsx 8513 / js 8406） */ export var v4ModelConfigTestid = `v4-model-config`;
/** 原 Ay（jsx 8514 / js 8407） */ export var v4RetrySubscribeTestid = `v4-retry-subscribe`;
/** 原 jy（jsx 8515 / js 8408） */ export var v4UserInputDialogTestid = `v4-user-input-dialog`;
/** 原 My（jsx 8516 / js 8409） */ export var v4UserInputOptionTestid = `v4-user-input-option`;
/** 原 Ny（jsx 8517 / js 8410） */ export var v4UserInputTextTestid = `v4-user-input-text`;
/** 原 Py（jsx 8518 / js 8411） */ export var v4TimelineBottomTestid = `v4-timeline-bottom`;
/** 原 Fy（jsx 8519 / js 8412） */ export var v4PaneShellTestid = `v4-pane-shell`;
/** 原 Iy（jsx 8520 / js 8413） */ export var v4SplitCloseTestid = `v4-split-close`;
/** 原 Ly（jsx 8521 / js 8414） */ export var v4SplitDividerTestid = `v4-split-divider`;
/** 原 Ry（jsx 8522 / js 8415） */ export var v4PaneWorkspaceBadgeTestid = `v4-pane-workspace-badge`;
/** 原 zy（jsx 8523 / js 8416） */ export var v4TaskOpenInSplitTestid = `v4-task-open-in-split`;
/** 原 By（jsx 8524 / js 8417） */ export var v4TurnNavigatorTestid = `v4-turn-navigator`;
/** 原 Vy（jsx 8525 / js 8418） */ export var v4TurnNavigatorItemTestid = `v4-turn-navigator-item`;
/** 原 Hy（jsx 8526 / js 8419） */ export var v4TurnNavigatorTooltipTestid = `v4-turn-navigator-tooltip`;
/** 原 Uy（jsx 8527 / js 8420） */ export var v4SubagentOpenSidePaneTestid = `v4-subagent-open-side-pane`;
/** 原 Wy（jsx 8528 / js 8421） */ export var v4RowAttachmentsTestid = `v4-row-attachments`;
/** 原 Gy（jsx 8529 / js 8422） */ export var automationsOpenTestid = `automations-open`;
/** 原 Ky（jsx 8530 / js 8423） */ export var automationsListTestid = `automations-list`;
/** 原 qy（jsx 8531 / js 8424） */ export var automationCreateMenuTestid = `automation-create-menu`;
/** 原 Jy（jsx 8532 / js 8425） */ export var automationCreateManuallyTestid = `automation-create-manually`;
/** 原 Yy（jsx 8533 / js 8426） */ export var automationCardTestid = `automation-card`;
/** 原 Xy（jsx 8534 / js 8427） */ export var offpeakCreateButtonTestid = `offpeak-create-button`;
/** 原 Zy（jsx 8535 / js 8428） */ export var offpeakCardTestid = `offpeak-card`;
/** 原 Qy（jsx 8536 / js 8429） */ export var offpeakCardMenuTestid = `offpeak-card-menu`;
/** 原 $y（jsx 8537 / js 8430） */ export var offpeakEditViewTestid = `offpeak-edit-view`;
/** 原 eb（jsx 8538 / js 8431） */ export var offpeakEditSubmitTestid = `offpeak-edit-submit`;
/** 原 tb（jsx 8539 / js 8432） */ export var offpeakFormTitleTestid = `offpeak-form-title`;
/** 原 nb（jsx 8540 / js 8433） */ export var offpeakFormInstructionsTestid = `offpeak-form-instructions`;
/** 原 rb（jsx 8541 / js 8434） */ export var offpeakActionPauseTestid = `offpeak-action-pause`;
/** 原 ib（jsx 8542 / js 8435） */ export var offpeakActionContinueTestid = `offpeak-action-continue`;
/** 原 ab（jsx 8543 / js 8436） */ export var offpeakActionDeleteTestid = `offpeak-action-delete`;
/** 原 ob（jsx 8544 / js 8437） */ export var offpeakTabTestid = `offpeak-tab`;
/** 原 sb（jsx 8545 / js 8438） */ export var automationCardMenuTestid = `automation-card-menu`;
/** 原 cb（jsx 8546 / js 8439） */ export var automationActionToggleTestid = `automation-action-toggle`;
/** 原 lb（jsx 8547 / js 8440） */ export var automationActionDeleteTestid = `automation-action-delete`;
/** 原 ub（jsx 8548 / js 8441） */ export var automationFormTitleTestid = `automation-form-title`;
/** 原 db（jsx 8549 / js 8442） */ export var automationFormPromptTestid = `automation-form-prompt`;
/** 原 fb（jsx 8550 / js 8443） */ export var automationFormSubmitTestid = `automation-form-submit`;
/** 原 pb（jsx 8551 / js 8444） */ export var automationRunNowTestid = `automation-run-now`;
/** 原 mb（jsx 8552 / js 8445） */ export var automationEditBackTestid = `automation-edit-back`;
/** 原 hb（jsx 8553 / js 8446） */ export var automationFrequencySelectTestid = `automation-frequency-select`;
/** 原 gb（jsx 8554 / js 8447） */ export var automationFrequencyOptionTestid = `automation-frequency-option`;
/** 原 _b（jsx 8555 / js 8448） */ export var automationCustomUnitSelectTestid = `automation-custom-unit-select`;
/** 原 vb（jsx 8556 / js 8449） */ export var automationCustomUnitOptionTestid = `automation-custom-unit-option`;
/** 原 yb（jsx 8557 / js 8450） */ export var automationCustomIntervalSelectTestid = `automation-custom-interval-select`;
/** 原 bb（jsx 8558 / js 8451） */ export var automationCustomIntervalIncrementTestid = `automation-custom-interval-increment`;
/** 原 xb（jsx 8559 / js 8452） */ export var automationCustomIntervalDecrementTestid = `automation-custom-interval-decrement`;
/** 原 Sb（jsx 8560 / js 8453） */ export var automationCustomRepeatEditTestid = `automation-custom-repeat-edit`;
/** 原 Cb（jsx 8561 / js 8454） */ export var automationCustomConfirmTestid = `automation-custom-confirm`;
/** 原 wb（jsx 8562 / js 8455） */ export var automationYearMonthdayTestid = `automation-year-monthday`;
/** 原 Tb（jsx 8563 / js 8456） */ export var automationYearMonthOptionTestid = `automation-year-month-option`;
/** 原 Eb（jsx 8564 / js 8457） */ export var automationYearDayOptionTestid = `automation-year-day-option`;
/** 原 Db（jsx 8565 / js 8458） */ export var automationSchedulePreviewTestid = `automation-schedule-preview`;
/** 原 Ob（jsx 8566 / js 8459） */ export var automationScheduleAddTestid = `automation-schedule-add`;
/** 原 kb（jsx 8567 / js 8460） */ export var automationScheduleDeleteTestid = `automation-schedule-delete`;
/** 原 Ab（jsx 8568 / js 8461） */ export var cronCreateCardTestid = `cron-create-card`;
/** 原 jb（jsx 8569 / js 8462） */ export var cronCreateOpenTestid = `cron-create-open`;
/** 原 Mb（jsx 8570 / js 8463） */ export var confirmDialogConfirmTestid = `confirm-dialog-confirm`;


/* ============================================================================
 * §19b testid 拼接器与 IPC 通道（jsx 8571–8628 / js 8464–8517 区）
 * §20 coding-plan 作用域与归因（jsx 8629–8711 / js 8524–8591 区）
 * §21 浏览器恢复与远程目标净化（jsx 8712–8744 / js 8610–8611 区）
 * §22 桌面菜单动作（jsx 8745–8773 / js 8631–8631 区）
 * §23 遥测上下文（jsx 8774–8802 / js 8660–8671 区）
 * §24 启动标记（jsx 8803–8822 / js 8677–8678 区）
 * §25 uuid（jsx 8823–8843 / js 8697–8721 区）
 * §26 自动化分组与限制（jsx 8844–8859 / js 8724–8737 区）
 * §27 低峰计划与会话模式设置（jsx 8860–8953 / js 8740–8779 区）
 * ==========================================================================*/

/** 原 Nb（jsx 8571 / js 8464）：testid 拼接器（导出别名 Xa） */
export function joinTestidParts(e: any, t: any) {
  return `${e}-${t}`;
}

/** 原 Pb（jsx 8574 / js 8467）：IPC 通道名 */
export var IpcChannelNames = {
  File: `file`,
  System: `system`,
  Terminal: `terminal`,
  Git: `git`,
  GitCheckpoint: `git-checkpoint`,
  Setting: `setting`,
  Credential: `credential`,
  Broadcast: `broadcast`,
  ZCodeTask: `zcode-task`,
  ZCodeAgent: `zcode-agent`,
  ZCodeSession: `zcode-session`,
  FileWatcher: `file-watcher`,
  OAuth: `oauth`,
  ModelProvider: `model-provider`,
  UsageStats: `usage-stats`,
  CodingPlanSubscription: `coding-plan-subscription`,
  Skills: `skills`,
  SkillSync: `skill-sync`,
  McpSync: `mcp-sync`,
  PluginSync: `plugin-sync`,
  Plugins: `plugins`,
  PluginManagement: `plugin-management`,
  Subagents: `subagents`,
  Commands: `commands`,
  Hooks: `hooks`,
  Memory: `memory`,
  OutputStyle: `output-style`,
  SettingsSync: `settings-sync`,
  Bots: `bots`,
  Feedback: `feedback`,
  RepoWiki: `repo-wiki`,
  PromptAttachmentTransfer: `prompt-attachment-transfer`,
  OffPeakTask: `off-peak-task`
};

/** 原 Fb（jsx 8609 / js 8502）：内嵌浏览器 IPC 主题 */
export var EmbeddedBrowserIpcTopics = {
  WheelBoundary: `zcode:embedded-browser-wheel-boundary`
};

/** 原 Ib（jsx 8612 / js 8503）：服务端口 IPC 主题 */
export var ServicePortIpcTopics = {
  ServicePort: `zcode:service-port`,
  RemoteServicePort: `zcode:remote-service-port`,
  TaskNotificationSound: `zcode:task-notification-sound`
};

/** 原 Lb（jsx 8617 / js 8508）：BigModel 供应商域 */
export var BIGMODEL_PROVIDER_DOMAIN = `bigmodel`;

/** 原 Rb（jsx 8618 / js 8509）：凭据解密失败错误码 */
export var CREDENTIAL_DECRYPT_FAILED_CODE = `ZCODE_CREDENTIAL_DECRYPT_FAILED`;

/** 原 zb（jsx 8619 / js 8510）：是否凭据解密失败 */
export function isCredentialDecryptFailure(e: any) {
  let t = extractErrorCode(e);
  return t ? t === CREDENTIAL_DECRYPT_FAILED_CODE : !!extractErrorMessage(e).startsWith(`凭据解密失败：`);
}

/** 原 Bb（jsx 8623 / js 8514）：提取错误码 */
export function extractErrorCode(e: any) {
  return typeof e == `object` && e && `code` in e ? String(e.code ?? ``) : ``;
}

/** 原 Vb（jsx 8626 / js 8517）：提取错误消息 */
export function extractErrorMessage(e: any) {
  return e instanceof Error ? e.message : typeof e == `object` && e && `message` in e ? String(e.message ?? ``) : ``;
}

/** 原 Hb（jsx 8629 / js 8524）：ZCode 代理受众 */
export var ZCODE_AGENT_AUDIENCE = `zcode-agent`;

/** 原 Ub（jsx 8630 / js 8525）：coding-plan 作用域前缀 */
export var CODING_PLAN_SCOPE_PREFIX = `team-plan:${W.bigmodelCodingPlan}:`;

/** 原 Wb（jsx 8631 / js 8526）：构建 coding-plan 作用域 */
export function buildCodingPlanScope(e: any) {
  let t = e.productId.trim(),
    n = e.organizationId?.trim() ?? ``,
    r = e.projectId?.trim() ?? ``,
    i = [t];
  return n && r ? i.push(n, r) : r && i.push(r), `${CODING_PLAN_SCOPE_PREFIX}${i.map(encodeScopeSegment).join(`:`)}`;
}

/** 原 Gb（jsx 8638 / js 8533）：解析 coding-plan 作用域 */
export function parseCodingPlanScope(e: any) {
  let t = e?.trim() ?? ``;
  if (!t.startsWith(CODING_PLAN_SCOPE_PREFIX)) return null;
  let n = t.slice(CODING_PLAN_SCOPE_PREFIX.length).split(`:`).map(decodeScopeSegment),
    r = n[0]?.trim() ?? ``;
  if (!r) return null;
  let i = n[1]?.trim() ?? ``,
    a = n[2]?.trim() ?? ``;
  return i && a ? {
    productId: r,
    organizationId: i,
    projectId: a,
    legacyProjectOnly: !1
  } : {
    productId: r,
    organizationId: null,
    projectId: i || null,
    legacyProjectOnly: !!i
  };
}

/** 原 Kb（jsx 8658 / js 8545）：coding-plan 作用域是否重叠 */
export function codingPlanScopesOverlap(e: any, t: any) {
  if (e === t || e.startsWith(`${t}:`) || t.startsWith(`${e}:`)) return !0;
  let n = parseCodingPlanScope(e),
    r = parseCodingPlanScope(t);
  return !n || !r ? !1 : r.projectId === `0` && n.productId === r.productId ? !0 : !n.projectId || !r.projectId || n.projectId !== r.projectId ? !1 : !n.organizationId || !r.organizationId || n.organizationId === r.organizationId;
}

/** 原 qb（jsx 8664 / js 8557）：编码作用域段 */
export function encodeScopeSegment(e: any) {
  return encodeURIComponent(e.trim());
}

/** 原 Jb（jsx 8667 / js 8560）：解码作用域段 */
export function decodeScopeSegment(e: any) {
  try {
    return decodeURIComponent(e.trim());
  } catch {
    return e.trim();
  }
}

/** 原 Yb（jsx 8674 / js 8567）：解析 coding-plan 归因 */
export function resolveCodingPlanAttribution(e: any) {
  let t = makeCodingPlanAttribution(e.now, `unknown`, ``);
  if (!e.providerFamilyDomain) return t;
  let n = resolveEntitlementCacheStatus({
    snapshot: e.codingPlanEntitlement,
    now: e.now,
    entitlementCacheTtlMs: e.entitlementCacheTtlMs
  });
  if (n.kind === `active`) return makeCodingPlanAttribution(n.generatedAt, `coding_plan`, n.planProductId);
  if (n.kind !== `none`) return t;
  let r = resolveEntitlementCacheStatus({
    snapshot: e.startPlanEntitlement,
    now: e.now,
    entitlementCacheTtlMs: e.entitlementCacheTtlMs
  });
  return r.kind === `active` ? makeCodingPlanAttribution(r.generatedAt, `start_plan`, r.planProductId) : r.kind === `none` ? makeCodingPlanAttribution(e.now, `no_plan`, ``) : t;
}

/** 原 Xb（jsx 8691 / js 8588）：构造 coding-plan 归因 */
export function makeCodingPlanAttribution(e: any, t: any, n: any) {
  return {
    generatedAt: e,
    planStatus: t,
    planProductId: n
  };
}

/** 原 Zb（jsx 8698 / js 8591）：解析权益缓存状态 */
export function resolveEntitlementCacheStatus(e: any) {
  let t = e.snapshot;
  return !t || e.now - t.generatedAt > e.entitlementCacheTtlMs || !t.authenticated || t.unavailableReason === `unavailable` || t.unavailableReason === `not_authenticated` || t.unavailableReason === `not_configured` ? {
    kind: `unknown`
  } : t.unavailableReason === `no_plan` ? {
    kind: `none`
  } : t.quota || t.subscription || t.remaining ? {
    kind: `active`,
    generatedAt: t.generatedAt,
    planProductId: t.subscription?.details[0]?.productId ?? ``
  } : {
    kind: `unknown`
  };
}

/** 原 Qb（jsx 8712 / js 8610）：浏览器恢复待处理 URL */
export var BROWSER_RESTORE_PENDING_URL = `zcode-browser-restore://pending`;

/** 原 $b（jsx 8713 / js 8611）：净化远程目标用于恢复 */
export function sanitizeRemoteTargetForRestore(e: any) {
  switch (e.kind) {
    case `ssh`:
      return {
        kind: `ssh`,
        host: e.host,
        port: e.port,
        username: e.username,
        ...(e.sshConfigAlias?.trim() ? {
          sshConfigAlias: e.sshConfigAlias.trim()
        } : {})
      };
    case `wsl`:
      {
        let t = e.user?.trim();
        return {
          kind: `wsl`,
          distro: e.distro,
          ...(t ? {
            user: t
          } : {})
        };
      }
    case `docker`:
      return {
        kind: `docker`,
        container: e.container
      };
    case `server`:
      return;
  }
}

/** 原 ex（jsx 8745 / js 8631）：桌面菜单动作 id */
export var DesktopMenuActionIds = {
  NewTask: `newTask`,
  OpenWorkspace: `openWorkspace`,
  CloseActiveContext: `closeActiveContext`,
  CloseWindow: `closeWindow`,
  MinimizeWindow: `minimizeWindow`,
  ToggleMaximizeWindow: `toggleMaximizeWindow`,
  ToggleFullScreen: `toggleFullScreen`,
  ResetZoom: `resetZoom`,
  ZoomIn: `zoomIn`,
  ZoomOut: `zoomOut`,
  ShowAbout: `showAbout`,
  OpenChangelog: `openChangelog`,
  CheckForUpdates: `checkForUpdates`,
  RelaunchApp: `relaunchApp`,
  OpenFeedback: `openFeedback`,
  OpenCommunity: `openCommunity`,
  ExportLogs: `exportLogs`,
  ToggleDevTools: `toggleDevTools`,
  OpenProcessMonitor: `openProcessMonitor`,
  ToggleZCodeStdioTapDevProxy: `toggleZCodeStdioTapDevProxy`,
  SetZCodeEndpointProduction: `setZCodeEndpointProduction`,
  SetZCodeEndpointTest: `setZCodeEndpointTest`,
  SetZCodeEndpointCustom: `setZCodeEndpointCustom`,
  ResetZCodeEndpoint: `resetZCodeEndpoint`,
  StartPerformanceRecording: `startPerformanceRecording`,
  StopPerformanceRecording: `stopPerformanceRecording`,
  ClearAllData: `clearAllData`
};

/** 原 tx（jsx 8774 / js 8660）：解析客户端遥测上下文 */
export function resolveClientTelemetryContext(e: any) {
  let t = typeof Intl < `u` ? Intl.DateTimeFormat().resolvedOptions() : void 0,
    n = e?.timeZone ?? t?.timeZone ?? `UTC`,
    r = e?.intlLocale ?? t?.locale ?? `en-US`,
    i = globalThis.screen,
    a = e?.screen ?? i ?? {
      width: 0,
      height: 0
    };
  return {
    clientTimezone: n,
    clientLanguage: r,
    screenResolution: `${a.width}x${a.height}`
  };
}

/** 原 nx（jsx 8789 / js 8668）：构建 web 远程遥测事件 */
export function buildWebRemoteTelemetryEvent(e: any, t: any, n: any) {
  return {
    elementName: e,
    eventRegion: `web_remote_control`,
    eventType: t,
    eventExtraDetail: n
  };
}

/** 原 rx（jsx 8797 / js 8671）：构建 web 远程入口视图遥测事件 */
export function buildWebRemoteEntryViewTelemetryEvent(e: any) {
  return buildWebRemoteTelemetryEvent(`web_remote_control_entry_view`, `view`, {
    workspace_kind: e.workspaceKind,
    remote_kind: e.remoteKind ?? ``
  });
}

/** 原 ix（jsx 8803 / js 8677）：启动标记存储键 */
export var LAUNCH_MARKS_STORAGE_KEY = `zcodeLaunchMarks`;

/** 原 ax（jsx 8804 / js 8678）：解析启动标记 */
export function parseLaunchMarks(e: any) {
  if (e == null || e === ``) return null;
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  if (typeof t != `object` || !t) return null;
  let n = t,
    r = [`createdAt`, `mainStart`, `appReady`, `loadUrl`],
    i: any = {};
  for (let e of r) {
    let t = n[e];
    if (typeof t != `number` || !Number.isFinite(t)) return null;
    i[e] = t;
  }
  return i;
}

/** 原 ox（jsx 8823 / js 8697）：字节转十六进制 */
export function toHexByte(e: any) {
  return e.toString(16).padStart(2, `0`);
}

/** 原 sx（jsx 8826 / js 8700）：从字节格式化 UUID */
export function formatUuidFromBytes(e: any) {
  let t = new Uint8Array(e);
  return t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128, [t.slice(0, 4), t.slice(4, 6), t.slice(6, 8), t.slice(8, 10), t.slice(10, 16)].map((e: any) => Array.from(e, toHexByte).join(``)).join(`-`);
}

/** 原 cx（jsx 8830 / js 8710）：生成 UUID */
export function generateUuid() {
  let e = globalThis.crypto;
  if (e?.randomUUID) return e.randomUUID();
  if (e?.getRandomValues) {
    let t = new Uint8Array(16);
    return e.getRandomValues(t), formatUuidFromBytes(t);
  }
  let t = new Uint8Array(16);
  for (let e = 0; e < t.length; e += 1) t[e] = Math.floor(Math.random() * 256);
  return formatUuidFromBytes(t);
}

/** 原 lx（jsx 8841 / js 8721）：新建唯一 id */
export function newUniqueId(e: any) {
  return generateUuid();
}

/** 原 ux（jsx 8844 / js 8724）：默认定时自动化分组 id */
export var DEFAULT_CRON_AUTOMATION_GROUP_ID = `zcode-default-group-cron`;

/** 原 dx（jsx 8845 / js 8725）：默认低峰自动化分组 id */
export var DEFAULT_OFFPEAK_AUTOMATION_GROUP_ID = `zcode-default-group-off-peak`;

/** 原 fx（jsx 8846 / js 8726）：是否定时自动化载荷 */
export function isCronAutomationPayload(e: any) {
  return !!(e.cronAutomationId || e.automationId);
}

/** 原 px（jsx 8849 / js 8729）：是否低峰任务载荷 */
export function isOffPeakTaskPayload(e: any) {
  return !!e.offPeakTaskId;
}

/** 原 mx（jsx 8852 / js 8732）：自动化创建达限标记 */
export var AUTOMATION_CREATE_LIMIT_REACHED = `AUTOMATION_CREATE_LIMIT_REACHED`;

/** 原 hx（jsx 8853 / js 8733）：是否自动化创建限制错误（导出别名 et） */
export function isAutomationCreateLimitError(e: any) {
  return (typeof e == `string` ? e : e instanceof Error ? e.message : ``).includes(AUTOMATION_CREATE_LIMIT_REACHED);
}

/** 原 gx（jsx 8856 / js 8736）：低峰运行终态集合 */
export var TERMINAL_OFFPEAK_RUN_STATUSES = [`completed`, `failed`, `cancelled`];

/** 原 _x（jsx 8857 / js 8737）：是否低峰运行终态 */
export function isTerminalOffPeakRunStatus(e: any) {
  return TERMINAL_OFFPEAK_RUN_STATUSES.includes(e);
}

/** 原 vx（jsx 8860 / js 8740）：低峰空闲计划 id（导出别名 Z） */
export var OFFPEAK_IDLE_PLAN_ID = `offpeak-idle-plan`;

/** 原 yx（jsx 8861 / js 8741）：模型设置 id */
export var MODEL_SETTING_ID = `model`;

/** 原 bx（jsx 8862 / js 8742）：模型设置分类 */
export var MODEL_SETTING_CATEGORY = `model`;

/** 原 xx（jsx 8863 / js 8743）：模式设置 id */
export var MODE_SETTING_ID = `mode`;

/** 原 Sx（jsx 8864 / js 8744）：模式设置分类 */
export var MODE_SETTING_CATEGORY = `mode`;

/** 原 Cx（jsx 8865 / js 8745）：思考等级设置 id */
export var THOUGHT_LEVEL_SETTING_ID = `thought_level`;

/** 原 wx（jsx 8866 / js 8746）：思考等级设置分类 */
export var THOUGHT_LEVEL_SETTING_CATEGORY = `thought_level`;

/** 原 Tx（jsx 8867 / js 8747）：会话模式预设 */
export var SESSION_MODE_PRESETS = [{
  id: `build`,
  name: `Ask before changes`,
  description: `Ask before each file changes.`
}, {
  id: `edit`,
  name: `Edit automatically`,
  description: `Edit selected files or relevant workspace files automatically.`
}, {
  id: `plan`,
  name: `Plan mode`,
  description: `Inspect the code and present a plan before editing.`
}, {
  id: `yolo`,
  name: `Full access`,
  description: `Edit and run commands with fewer confirmations.`
}];

/** 原 Ex（jsx 8884 / js 8765）：会话模式预设 id 集合 */
export var SESSION_MODE_PRESET_ID_SET = new Set(SESSION_MODE_PRESETS.map((e: any) => e.id));

/** 原 Dx（jsx 8885 / js 8766）：构建模型设置选项值 */
export function buildModelSettingOptionValue(e: any) {
  let t = `${e.providerId}/${e.modelId}`;
  return e.variant ? `${t}\$${e.variant}` : t;
}

/** 原 Ox（jsx 8889 / js 8770）：规范化会话模式 id */
export function normalizeSessionModeId(e: any) {
  return SESSION_MODE_PRESET_ID_SET.has(e) ? e : `build`;
}

/** 原 kx（jsx 8892 / js 8773）：列出会话模式选项 */
export function listSessionModeOptions() {
  return SESSION_MODE_PRESETS.map((e: any) => ({
    value: e.id,
    name: e.name,
    description: e.description
  }));
}

/** 原 Ax（jsx 8899 / js 8776）：列出会话模式预设 */
export function listSessionModePresets() {
  return SESSION_MODE_PRESETS.map((e: any) => ({
    ...e
  }));
}

/** 原 jx（jsx 8904 / js 8779）：构建会话设置视图模型 */
export function buildSessionSettingsViewModel(e: any) {
  let t: any[] = [{
    id: MODEL_SETTING_ID,
    name: `Model`,
    category: MODEL_SETTING_CATEGORY,
    type: `select`,
    currentValue: buildModelSettingOptionValue(e.model.current),
    options: e.model.available.map((e: any) => {
      let t = e.reasoning ? e.reasoning.enabled ? e.reasoning.levels.map((e: any) => e.value) : [] : void 0,
        n = e.reasoning?.defaultLevel && t?.includes(e.reasoning.defaultLevel) ? e.reasoning.defaultLevel : void 0;
      return {
        value: buildModelSettingOptionValue(e.ref),
        name: e.label,
        description: e.description,
        modelProviderId: e.ref.providerId,
        modelProviderName: e.providerLabel ?? e.ref.providerId,
        ...(t ? {
          modelThoughtLevels: t
        } : {}),
        ...(n ? {
          modelDefaultThoughtLevel: n
        } : {})
      };
    })
  }, {
    id: MODE_SETTING_ID,
    name: `Mode`,
    category: MODE_SETTING_CATEGORY,
    type: `select`,
    currentValue: normalizeSessionModeId(e.mode.current),
    options: listSessionModeOptions()
  }];
  if (e.thoughtLevel.enabled) {
    let n = new Set(e.thoughtLevel.available.map((e: any) => e.value)),
      r = e.thoughtLevel.defaultLevel && n.has(e.thoughtLevel.defaultLevel) ? e.thoughtLevel.defaultLevel : void 0;
    t.push({
      id: THOUGHT_LEVEL_SETTING_ID,
      name: `Thought Level`,
      category: THOUGHT_LEVEL_SETTING_CATEGORY,
      type: `select`,
      currentValue: e.thoughtLevel.current ?? r ?? e.thoughtLevel.available[0]?.value ?? ``,
      options: e.thoughtLevel.available.map((e: any) => ({
        value: e.value,
        name: e.label,
        description: e.description
      }))
    });
  }
  return t;
}


/* ============================================================================
 * §28 稳定供应商/模型 id 与日志前缀（jsx 8954–8977 / js 8838–8865 区）
 * §29 代理供应商就绪（jsx 8978–9008 / js 8868–8884 区）
 * §30 OAuth 供应商族（jsx 9009–9065 / js 8892–8951 区）
 * §31 自定义模型引用（jsx 9066–9096 / js 8954–8966 区）
 * §32 供应商引用前缀（jsx 9097–9109 / js 8978–8987 区）
 * §33 运行时偏好与插件来源（jsx 9110–9127 / js 8991–9007 区）
 * §34 行差异（LCS）统计（jsx 9128–9172 / js 9010–9017 区）
 * §35 MCP 配置规范化（jsx 9173–9248 / js 9041–9112 区）
 * ==========================================================================*/

/** 原 Mx（jsx 8954 / js 8838）：供应商名 slug 化 */
export function slugifyProviderName(e: any) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, `-`).replace(/^-+|-+$/g, ``) || `provider`;
}

/** 原 Nx（jsx 8957 / js 8847）：FNV-1a 32 位哈希十六进制 */
export function fnv1aHash32Hex(e: any) {
  let t = 2166136261;
  for (let n of e) t ^= n.codePointAt(0) ?? 0, t = Math.imul(t, 16777619);
  return (t >>> 0).toString(16).padStart(8, `0`);
}

/** 原 Px（jsx 8962 / js 8852）：构建稳定供应商 id */
export function buildStableProviderId(e: any) {
  let t = e.trim();
  if (!t) throw Error(`providerId 不能为空`);
  return `${slugifyProviderName(t)}-${fnv1aHash32Hex(t)}`;
}

/** 原 Fx（jsx 8967 / js 8857）：构建稳定模型 id */
export function buildStableModelId(e: any, t: any) {
  let n = t.trim();
  if (!n) throw Error(`modelName 不能为空`);
  return `${buildStableProviderId(e)}/${n}`;
}

/** 原 Ix（jsx 8972 / js 8862）：本地时间戳格式化 */
export function formatLocalTimestamp(e: any = new Date()) {
  return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, `0`)}-${String(e.getDate()).padStart(2, `0`)} ${String(e.getHours()).padStart(2, `0`)}:${String(e.getMinutes()).padStart(2, `0`)}:${String(e.getSeconds()).padStart(2, `0`)}.${String(e.getMilliseconds()).padStart(3, `0`)}`;
}

/** 原 Lx（jsx 8975 / js 8865）：日志行前缀格式化 */
export function formatLogLinePrefix(e: any, t: any) {
  return `[${formatLocalTimestamp()}]${t == null ? `` : ` [pid:${t}]`} [${e}]`;
}

/** 原 Rx（jsx 8978 / js 8868）：代理供应商未就绪标记 */
export var ZCODE_AGENT_PROVIDER_NOT_READY = `ZCODE_AGENT_PROVIDER_NOT_READY`;

/** 原 zx（jsx 8979 / js 8869）：供应商未就绪原因 */
export var PROVIDER_NOT_READY_REASON = `provider_not_ready`;

/** 原 Bx（jsx 8980 / js 8870）：供应商是否有可用凭据 */
export function providerHasUsableCredential(e: any) {
  if (e.apiKeyRequired === !1) return !0;
  let t = e.apiKey;
  if (!t) return !1;
  switch (t.source) {
    case `inline`:
      return t.value.trim().length > 0;
    case `credential`:
    case `server-config`:
      return t.key.trim().length > 0;
    case `env`:
      return t.name.trim().length > 0;
  }
}

/** 原 Vx（jsx 8994 / js 8884 区）：解析首个就绪供应商 */
export function resolveFirstReadyProvider(e: any) {
  for (let t of e.providers) {
    if (!t.baseURL?.trim() || !providerHasUsableCredential(t)) continue;
    let e = t.models.find((e: any) => !e.disabledReason?.trim());
    if (e) return {
      ready: !0,
      providerId: t.providerId,
      modelId: e.modelId
    };
  }
  return {
    ready: !1,
    reason: PROVIDER_NOT_READY_REASON
  };
}

/** 原 Hx（jsx 9009 / js 8892）：OAuth 供应商族列表 */
export var OAUTH_PROVIDER_FAMILIES = [{
  id: `zai`,
  label: `Z.ai`,
  oauthProviderId: `zai`,
  apiKeyProviderId: W.zai,
  startPlanProviderId: W.zaiStartPlan,
  codingPlanProviderId: W.zaiCodingPlan
}, {
  id: `bigmodel`,
  label: `BigModel`,
  oauthProviderId: BIGMODEL_PROVIDER_DOMAIN,
  apiKeyProviderId: W.bigmodel,
  startPlanProviderId: W.bigmodelStartPlan,
  codingPlanProviderId: W.bigmodelCodingPlan
}];

/** 原 Ux（jsx 9024 / js 8910）：按族 id 索引 */
export var OAUTH_FAMILY_BY_ID = new Map(OAUTH_PROVIDER_FAMILIES.map((e: any) => [e.id, e]));

/** 原 Wx（jsx 9025 / js 8911）：按供应商 id 索引到族 id */
export var OAUTH_FAMILY_BY_PROVIDER_ID = new Map(OAUTH_PROVIDER_FAMILIES.flatMap((e: any) => [e.apiKeyProviderId, e.startPlanProviderId, e.codingPlanProviderId].map((t: any) => [t, e.id])));

/** 原 Gx（jsx 9026 / js 8916）：解析供应商族模式 */
export function resolveProviderFamilyMode(e: any, t: any) {
  return t?.[e] ?? `oauth`;
}

/** 原 Kx（jsx 9029 / js 8919）：供应商是否允许于族模式 */
export function isProviderAllowedForFamilyMode(e: any) {
  let t = getOAuthProviderFamilyByProviderId(e.providerId);
  return t ? resolveProviderFamilyMode(t.id, e.familyModes) === `apiKey` ? e.providerId === t.apiKeyProviderId : e.providerId !== t.apiKeyProviderId : !0;
}

/** 原 qx（jsx 9033 / js 8927）：按族 id 取 OAuth 供应商族 */
export function getOAuthProviderFamilyById(e: any) {
  return OAUTH_FAMILY_BY_ID.get(e);
}

/** 原 Jx（jsx 9036 / js 8930）：按供应商 id 取族 id */
export function getOAuthFamilyIdByProviderId(e: any) {
  return OAUTH_FAMILY_BY_PROVIDER_ID.get(e) ?? null;
}

/** 原 Yx（jsx 9039 / js 8933）：按供应商 id 取 OAuth 供应商族 */
export function getOAuthProviderFamilyByProviderId(e: any) {
  let t = getOAuthFamilyIdByProviderId(e);
  return t ? getOAuthProviderFamilyById(t) : null;
}

/** 原 Xx（jsx 9043 / js 8937）：规范化供应商族域 */
export function normalizeProviderFamilyDomain(e: any) {
  return e === `zai` || e === `bigmodel` ? e : null;
}

/** 原 Zx（jsx 9046 / js 8940）：规范化 OAuth 供应商域 */
export function normalizeOAuthProviderDomain(e: any) {
  return e === `zai` ? `zai` : e === `bigmodel` ? `bigmodel` : null;
}

/** 原 Qx（jsx 9049 / js 8943）：供应商族与域是否匹配 */
export function providerFamilyMatchesDomain(e: any) {
  let t = normalizeProviderFamilyDomain(e.providerFamilyDomain);
  return t ? e.familyId === t : !0;
}

/** 原 $x（jsx 9053 / js 8947）：供应商 id 与族域是否匹配 */
export function providerIdMatchesFamilyDomain(e: any) {
  let t = getOAuthFamilyIdByProviderId(e.providerId);
  return t ? providerFamilyMatchesDomain({
    familyId: t,
    providerFamilyDomain: e.providerFamilyDomain
  }) : !0;
}

/** 原 eS（jsx 9060 / js 8951）：活动 OAuth 供应商是否匹配族 */
export function activeOAuthProviderMatchesFamily(e: any) {
  return providerIdMatchesFamilyDomain({
    providerId: e.providerId,
    providerFamilyDomain: normalizeOAuthProviderDomain(e.activeOAuthProvider)
  });
}

/** 原 tS（jsx 9066 / js 8954）：自定义模型引用前缀 */
export var CUSTOM_MODEL_REF_PREFIX = `custom:`;

/** 原 nS（jsx 9067 / js 8955）：安全解码 URI 组件 */
export function safeDecodeURIComponent(e: any) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}

/** 原 rS（jsx 9074 / js 8962）：构建自定义模型引用 */
export function buildCustomModelRef(e: any, t: any) {
  let n = encodeURIComponent(e);
  return t ? `${CUSTOM_MODEL_REF_PREFIX}${n}:${encodeURIComponent(t)}` : `${CUSTOM_MODEL_REF_PREFIX}${n}`;
}

/** 原 iS（jsx 9078 / js 8966）：解析自定义模型引用（导出别名 P） */
export function parseCustomModelRef(e: any) {
  if (!e.startsWith(`custom:`)) return null;
  let t = e.slice(7),
    n = t.indexOf(`:`);
  if (n < 0) return {
    providerId: safeDecodeURIComponent(t)
  };
  let r = t.split(`:`);
  if (r.length >= 3 && r[0] === `builtin`) return {
    providerId: `${r[0]}:${r[1]}`,
    modelName: safeDecodeURIComponent(r.slice(2).join(`:`))
  };
  let i = t.slice(0, n),
    a = t.slice(n + 1);
  return {
    providerId: safeDecodeURIComponent(i),
    modelName: safeDecodeURIComponent(a)
  };
}

/** 原 aS（jsx 9097 / js 8978）：原生供应商引用前缀 */
export var NATIVE_PROVIDER_REF_PREFIX = `native:`;

/** 原 oS（jsx 9098 / js 8979）：自定义供应商引用前缀 */
export var CUSTOM_PROVIDER_REF_PREFIX = `custom:`;

/** 原 sS（jsx 9099 / js 8980）：幽灵供应商引用前缀 */
export var GHOST_PROVIDER_REF_PREFIX = `ghost:`;

/** 原 cS（jsx 9100 / js 8981）：原生供应商引用 */
export function nativeProviderRef(e: any) {
  return `${NATIVE_PROVIDER_REF_PREFIX}${e}`;
}

/** 原 lS（jsx 9103 / js 8984）：自定义供应商引用 */
export function customProviderRef(e: any) {
  return `${CUSTOM_PROVIDER_REF_PREFIX}${e.trim()}`;
}

/** 原 uS（jsx 9106 / js 8987）：从自定义模型引用解析供应商引用 */
export function resolveProviderRefFromCustomModelRef(e: any, t: any) {
  let n = parseCustomModelRef(String(t ?? ``));
  return n?.providerId ? customProviderRef(n.providerId) : nativeProviderRef(e);
}

/** 原 dS（jsx 9110 / js 8991）：是否数据库基目录禁止错误 */
export function isDataBaseDirForbiddenError(e: any) {
  let t = ee(e);
  return t.code === `DATA_BASE_DIR_FORBIDDEN_WINDOWS_INSTALL_DIR` || t.message.includes(`DATA_BASE_DIR_FORBIDDEN_WINDOWS_INSTALL_DIR`);
}

/** 原 fS（jsx 9114 / js 8998）：应用运行时偏好存储键 */
export var APP_RUNTIME_PREFERENCES_STORAGE_KEY = `settings:app-runtime-preferences`;

/** 原 pS（jsx 9115 / js 8999）：应用运行时偏好 schema */
export var AppRuntimePreferencesSchema = A({
  askUserQuestionAutoResolutionEnabled: D()
}).strict();

/** 原 mS（jsx 9118 / js 9000）：是否用户偏好来源 */
export function isUserPreferenceSource(e: any) {
  return e.source === `user`;
}

/** 原 hS（jsx 9121 / js 9003）：是否插件偏好来源 */
export function isPluginPreferenceSource(e: any) {
  return e.source === `plugin`;
}

/** 原 gS（jsx 9124 / js 9006）：官方插件市场 id 列表 */
export var OFFICIAL_PLUGIN_MARKETPLACE_IDS = [`zcode-plugins-official`];

/** 原 _S（jsx 9125 / js 9007）：是否官方插件市场 */
export function isOfficialPluginMarketplace(e: any) {
  return OFFICIAL_PLUGIN_MARKETPLACE_IDS.includes(e);
}

/** 原 vS（jsx 9128 / js 9010）：行差异 LCS 单元预算 */
export var LINE_DIFF_LCS_CELL_BUDGET = 4e5;

/** 原 yS（jsx 9129 / js 9011）：文本按行拆分（模板串内含字面换行，零改动） */
export function splitTextIntoLines(e: any) {
  if (!e) return [];
  let t = e.split(`
`);
  return t[t.length - 1] === `` && t.pop(), t;
}

/** 原 bS（jsx 9135 / js 9017）：行差异变更统计（LCS，导出别名 b） */
export function countLineDiffChanges(e: any, t: any) {
  let n = splitTextIntoLines(e),
    r = splitTextIntoLines(t),
    i = 0;
  for (; i < n.length && i < r.length && n[i] === r[i];) i += 1;
  let a = n.length - 1,
    o = r.length - 1;
  for (; a >= i && o >= i && n[a] === r[o];) --a, --o;
  let s = n.slice(i, a + 1),
    c = r.slice(i, o + 1);
  if (s.length === 0) return {
    added: c.length,
    removed: 0
  };
  if (c.length === 0) return {
    added: 0,
    removed: s.length
  };
  if (s.length * c.length > LINE_DIFF_LCS_CELL_BUDGET) return {
    added: c.length,
    removed: s.length
  };
  let l = Array.from({
    length: c.length + 1
  }, () => 0);
  for (let e = 1; e <= s.length; e += 1) {
    let t = 0;
    for (let n = 1; n <= c.length; n += 1) {
      let r = l[n];
      s[e - 1] === c[n - 1] ? l[n] = t + 1 : l[n] = Math.max(l[n], l[n - 1]), t = r;
    }
  }
  let u = l[c.length] ?? 0;
  return {
    added: c.length - u,
    removed: s.length - u
  };
}

/** 原 xS（jsx 9173 / js 9041）：读取 MCP 服务器头部 */
export function readMcpServerHeaders(e: any) {
  return e.headers ?? e.http_headers;
}

/** 原 SS（jsx 9176 / js 9044）：规范化 MCP 服务器配置条目 */
export function normalizeMcpServerConfigEntry(e: any, t: any) {
  let n = t.type;
  if (n || (t.command ? n = `stdio` : t.url && (n = `http`)), n === `stdio` && t.command) {
    let n = t.command,
      r = t.args || [];
    if (typeof process < `u` && process.platform === `win32` || typeof navigator < `u` && /win/i.test(navigator.platform)) {
      let e = n.toLowerCase(),
        t = r[1];
      (e === `cmd` || e === `cmd.exe`) && r[0] === `/c` && t && (n = t, r = r.slice(2));
    }
    return {
      name: e,
      command: n,
      args: r,
      env: t.env ? Object.entries(t.env).map(([e, t]: [any, any]) => ({
        name: e,
        value: t
      })) : [],
      ...(isValidPositiveTimeoutMs(t.timeoutMs) ? {
        timeoutMs: t.timeoutMs
      } : {}),
      ...(isValidMcpIsolation(t.isolation) ? {
        isolation: t.isolation
      } : {}),
      ...(isValidMcpProtocolVersion(t.protocolVersion) ? {
        protocolVersion: t.protocolVersion
      } : {})
    };
  } else if (t.url && n) {
    let r = n === `sse` ? `sse` : `http`,
      i = readMcpServerHeaders(t);
    return {
      name: e,
      type: r,
      url: t.url,
      headers: i ? Object.entries(i).map(([e, t]: [any, any]) => ({
        name: e,
        value: t
      })) : [],
      ...(isValidMcpOAuthConfig(t.oauth) ? {
        oauth: t.oauth
      } : {}),
      ...(isValidPositiveTimeoutMs(t.timeoutMs) ? {
        timeoutMs: t.timeoutMs
      } : {}),
      ...(isValidMcpIsolation(t.isolation) ? {
        isolation: t.isolation
      } : {}),
      ...(isValidMcpProtocolVersion(t.protocolVersion) ? {
        protocolVersion: t.protocolVersion
      } : {})
    };
  }
  return null;
}

/** 原 CS（jsx 9231 / js 9082）：是否有效正超时毫秒 */
export function isValidPositiveTimeoutMs(e: any) {
  return typeof e == `number` && Number.isInteger(e) && e > 0;
}

/** 原 wS（jsx 9234 / js 9085）：是否有效 MCP 隔离级别 */
export function isValidMcpIsolation(e: any) {
  return e === `session` || e === `workspace`;
}

/** 原 TS（jsx 9237 / js 9088）：是否有效 MCP 协议版本 */
export function isValidMcpProtocolVersion(e: any) {
  return e === `legacy` || e === `auto` || e === `2026-07-28`;
}

/** 原 ES（jsx 9240 / js 9091）：是否有效 MCP OAuth 配置 */
export function isValidMcpOAuthConfig(e: any) {
  return isPlainObjectRecord(e) ? e.type === `client_credentials` && typeof e.clientId == `string` && e.clientId.trim().length > 0 && typeof e.clientSecret == `string` && e.clientSecret.trim().length > 0 ? (e.clientName === void 0 || typeof e.clientName == `string`) && (e.scope === void 0 || typeof e.scope == `string`) : e.type === `authorization_code` ? (e.clientId === void 0 || typeof e.clientId == `string`) && (e.clientSecret === void 0 || typeof e.clientSecret == `string`) && (e.clientName === void 0 || typeof e.clientName == `string`) && (e.redirectPath === void 0 || typeof e.redirectPath == `string`) && (e.scope === void 0 || typeof e.scope == `string`) : !1 : !1;
}

/** 原 DS（jsx 9243 / js 9109）：是否纯对象记录 */
export function isPlainObjectRecord(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}

/** 原 OS（jsx 9246 / js 9112）：解析平台二进制名 */
export function resolvePlatformBinaryName(e: any, t: any) {
  return t === `win32` ? `${e}.exe` : e;
}


/* ============================================================================
 * §36 搜索二进制预设（jsx 9249–9272 / js 9115–9115 区）
 * §37 工具调用状态 i18n（jsx 9273–9286 / js 9133–9144 区）
 * §38 工具名分类（jsx 9287–9329 / js 9149–9192 区）
 * §39 工具输入解析（jsx 9330–9409 / js 9195–9288 区）
 * §40 待办列表提取（jsx 9410–9487 / js 9291–9354 区）
 * §41 权限请求视图模型（jsx 9488–9631 / js 9362–9525 区）
 * ==========================================================================*/

/** 原 kS（jsx 9249 / js 9115）：搜索二进制预设 */
export var SEARCH_BINARY_PRESETS: any = {
  bfs: {
    binaryEnvVar: `ZCODE_BFS_BINARY`,
    bundledResourceDir: `bfs`,
    resolveEntrySegments: (e: any) => [resolvePlatformBinaryName(`bfs`, e)]
  },
  ripgrep: {
    binaryEnvVar: `ZCODE_RG_BINARY`,
    bundledResourceDir: `ripgrep`,
    resolveEntrySegments: (e: any) => [resolvePlatformBinaryName(`rg`, e)]
  },
  ugrep: {
    binaryEnvVar: `ZCODE_UGREP_BINARY`,
    bundledResourceDir: `ugrep`,
    resolveEntrySegments: (e: any) => [resolvePlatformBinaryName(`ugrep`, e)]
  }
};

/* 原匿名表达式（jsx 9266）：搜索预设展开；as any 为 TS 层等价物（编译后擦除，
 * 原 js 9132 行带外层括号 (({...}),{...},{...})，用于消除逗号左操作数无副作用告警） */
({
  ...SEARCH_BINARY_PRESETS.bfs
} as any), {
  ...SEARCH_BINARY_PRESETS.ripgrep
}, {
  ...SEARCH_BINARY_PRESETS.ugrep
};

/** 原 AS（jsx 9273 / js 9133）：待处理工具调用状态集合 */
export var PENDING_TOOL_CALL_STATUSES = new Set([`input-streaming`, `input-available`]);

/** 原 jS（jsx 9274 / js 9134）：工具调用状态 i18n id 映射 */
export var TOOL_CALL_STATUS_I18N_IDS: any = {
  "input-streaming": `chat.toolCall.status.pending`,
  "input-available": `chat.toolCall.status.running`,
  "output-available": `chat.toolCall.status.completed`,
  "output-error": `chat.toolCall.status.failed`,
  "output-denied": `chat.toolCall.status.denied`
};

/** 原 MS（jsx 9281 / js 9141）：是否待处理工具调用状态 */
export function isPendingToolCallStatus(e: any) {
  return PENDING_TOOL_CALL_STATUSES.has(e);
}

/** 原 NS（jsx 9284 / js 9144）：解析工具调用状态 i18n id */
export function resolveToolCallStatusI18nId(e: any, t: any) {
  return t === `stopped` ? `chat.toolCall.status.stopped` : TOOL_CALL_STATUS_I18N_IDS[e] ?? `chat.toolCall.status.pending`;
}

/** 原 PS（jsx 9287 / js 9149）：已知工具名列表 */
export var KNOWN_TOOL_NAME_LIST = `Read.Write.Edit.ApplyPatch.Bash.Glob.Grep.WebFetch.WebSearch.web_search.TodoRead.TodoWrite.GoalRead.ReadSessionContext.AskUserQuestion.SendMessage.RespondToCoordinator.TaskOutput.TaskStop.js.js_reset.js_add_node_module_dir.mcp__node_repl__js.mcp__node_repl__js_reset.mcp__node_repl__js_add_node_module_dir.Agent.Task.Skill`.split(`.`);

/** 原 FS（jsx 9288 / js 9153）：工具视图类型按名映射 */
export var TOOL_VIEW_KIND_BY_NAME: any = {
  Read: `file-read`,
  Write: `file-write`,
  Edit: `file-write`,
  ApplyPatch: `file-write`,
  Bash: `shell`,
  Glob: `search`,
  Grep: `search`,
  WebFetch: `search`,
  WebSearch: `search`,
  web_search: `search`,
  TodoRead: `todo`,
  TodoWrite: `todo`,
  GoalRead: `goal`,
  ReadSessionContext: `session-context`,
  AskUserQuestion: `ask-user-question`,
  SendMessage: `message`,
  RespondToCoordinator: `message`,
  TaskOutput: `task-control`,
  TaskStop: `task-control`,
  js: `node-repl`,
  js_reset: `node-repl`,
  js_add_node_module_dir: `node-repl`,
  mcp__node_repl__js: `node-repl`,
  mcp__node_repl__js_reset: `node-repl`,
  mcp__node_repl__js_add_node_module_dir: `node-repl`,
  Agent: `agent`,
  Task: `agent`,
  Skill: `skill`
};

/** 原 IS（jsx 9318 / js 9183）：工具名小写索引 */
export var TOOL_NAME_LOWERCASE_INDEX = new Map(KNOWN_TOOL_NAME_LIST.map((e: any) => [e.toLowerCase(), e]));

/** 原 LS（jsx 9319 / js 9184）：规范化工具名 */
export function canonicalizeToolName(e: any) {
  let t = e?.trim();
  return t ? TOOL_NAME_LOWERCASE_INDEX.get(t.toLowerCase()) ?? null : null;
}

/** 原 RS（jsx 9323 / js 9188）：解析工具视图类型 */
export function resolveToolViewKind(e: any) {
  let t = canonicalizeToolName(e);
  return t ? TOOL_VIEW_KIND_BY_NAME[t] : null;
}

/** 原 zS（jsx 9327 / js 9192）：是否文件写入工具名 */
export function isFileWriteToolName(e: any) {
  return canonicalizeToolName(e) === `Write`;
}

/** 原 BS（jsx 9330 / js 9195）：工具输入已知字段名 */
export var TOOL_INPUT_KNOWN_FIELD_NAMES = [`file_path`, `filePath`, `path`, `target_path`, `targetPath`, `filename`, `file`, `content`, `new_string`, `newString`, `new_text`, `newText`, `old_string`, `oldString`, `old_text`, `oldText`, `command`, `description`, `title`, `pattern`, `replacement`, `plan`];

/** 原 VS（jsx 9331 / js 9219）：解析工具调用输入 */
export function parseToolCallInput(e: any, t: any) {
  if (t !== void 0) return {
    complete: !0,
    input: t,
    rawInput: e
  };
  let n = tryParseJsonValue(e);
  return n.ok ? {
    complete: !0,
    input: n.value,
    rawInput: e
  } : {
    complete: !1,
    input: extractKnownToolInputFields(e) ?? {},
    rawInput: e
  };
}

/** 原 HS（jsx 9348 / js 9226）：尝试解析 JSON 值 */
export function tryParseJsonValue(e: any) {
  try {
    return {
      ok: !0,
      value: JSON.parse(e)
    };
  } catch {
    return {
      ok: !1
    };
  }
}

/** 原 US（jsx 9360 / js 9233）：提取已知工具输入字段 */
export function extractKnownToolInputFields(e: any) {
  let t: any = {};
  for (let n of TOOL_INPUT_KNOWN_FIELD_NAMES) {
    let r = extractJsonStringField(e, n);
    r !== void 0 && (t[n] = r);
  }
  return Object.keys(t).length > 0 ? t : null;
}

/** 原 WS（jsx 9368 / js 9241）：提取 JSON 字符串字段 */
export function extractJsonStringField(e: any, t: any) {
  let n = RegExp(`"${escapeRegExpSource(t)}"\\s*:\\s*"`).exec(e);
  if (!n) return;
  let r = ``,
    i = !1,
    a = !1;
  for (let t = n.index + n[0].length; t < e.length; t += 1) {
    let n = e[t] ?? ``;
    if (i) {
      r += `\\${n}`, i = !1;
      continue;
    }
    if (n === `\\`) {
      i = !0;
      continue;
    }
    if (n === `"`) {
      a = !0;
      break;
    }
    r += n;
  }
  return i && (r += `\\`), decodeExtractedJsonString(r, a);
}

/** 原 GS（jsx 9392 / js 9265）：解码提取的 JSON 字符串 */
export function decodeExtractedJsonString(e: any, t: any) {
  let n = t ? e : stripTrailingPartialEscape(e);
  try {
    return JSON.parse(`"${n}"`);
  } catch {
    return unescapeJsonStringLiterals(n);
  }
}

/** 原 KS（jsx 9400 / js 9273）：去除尾部不完整转义 */
export function stripTrailingPartialEscape(e: any) {
  return e.replace(/\\u[0-9a-fA-F]{0,3}$/, ``).replace(/\\$/, ``);
}

/** 原 qS（jsx 9403 / js 9276）：反转义 JSON 字符串字面量（模板串内含字面换行/制表符，零改动） */
export function unescapeJsonStringLiterals(e: any) {
  return e.replace(/\\n/g, `
`).replace(/\\r/g, `\r`).replace(/\\t/g, `	`).replace(/\\"/g, `"`).replace(/\\\\/g, `\\`);
}

/** 原 JS（jsx 9407 / js 9288）：正则源转义 */
export function escapeRegExpSource(e: any) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}

/** 原 YS（jsx 9410 / js 9291）：待办工具标题模式 */
export var TODO_TOOL_TITLE_PATTERN = /(?:^|[_\s-])(?:todo[_\s-]*(?:read|write)|update[_\s-]*plan)(?:$|[_\s-])/i;

/** 原 XS（jsx 9411 / js 9292）：待办列表字段名 */
export var TODO_LIST_FIELD_NAMES = [`todos`, `plan`, `steps`, `items`];

/** 原 ZS（jsx 9412 / js 9293）：是否纯对象值 */
export function isPlainObjectValue(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}

/** 原 QS（jsx 9415 / js 9296）：非空去空白字符串提取 */
export function nonEmptyTrimmedString(e: any) {
  return typeof e == `string` && e.trim().length > 0 ? e.trim() : void 0;
}

/** 原 $S（jsx 9418 / js 9299）：规范化待办状态 */
export function normalizeTodoStatus(e: any) {
  let t = nonEmptyTrimmedString(e)?.replace(/-/g, `_`).toLowerCase();
  return t === `pending` || t === `in_progress` || t === `completed` ? t : null;
}

/** 原 eC（jsx 9422 / js 9303）：规范化待办条目 */
export function normalizeTodoEntry(e: any, t: any) {
  if (typeof e == `string`) {
    let n = e.trim();
    return n ? {
      id: n,
      title: n,
      status: t === 0 ? `in_progress` : `pending`
    } : null;
  }
  if (!isPlainObjectValue(e)) return null;
  let n = nonEmptyTrimmedString(e.content) ?? nonEmptyTrimmedString(e.step) ?? nonEmptyTrimmedString(e.title) ?? nonEmptyTrimmedString(e.text) ?? nonEmptyTrimmedString(e.activeForm),
    r = normalizeTodoStatus(e.status);
  return !n || !r ? null : {
    id: nonEmptyTrimmedString(e.id) ?? n,
    title: n,
    status: r
  };
}

/** 原 tC（jsx 9440 / js 9313）：尝试解析待办 JSON */
export function tryParseTodoJson(e: any) {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}

/** 原 nC（jsx 9447 / js 9320）：提取待办列表容器 */
export function extractTodoListContainer(e: any) {
  let t = typeof e == `string` ? tryParseTodoJson(e) : e;
  if (!isPlainObjectValue(t)) return null;
  for (let e of TODO_LIST_FIELD_NAMES) {
    let n = t[e];
    if (Array.isArray(n)) return n;
  }
  return null;
}

/** 原 rC（jsx 9456 / js 9329）：严格解析待办列表 */
export function parseTodoListStrict(e: any) {
  let t = extractTodoListContainer(e);
  if (!t || t.length === 0) return null;
  let n = t.map((e: any, t: any) => normalizeTodoEntry(e, t)).filter((e: any) => e !== null);
  return n.length === t.length ? n : null;
}

/** 原 iC（jsx 9462 / js 9335）：收集待办解析候选 */
export function collectTodoParseCandidates(e: any) {
  let t: any[] = [e],
    n = typeof e == `string` ? tryParseTodoJson(e) : void 0;
  if (n !== void 0 && t.push(n), isPlainObjectValue(e)) for (let n of [`content`, `output`, `result`]) {
    let r = e[n];
    if (t.push(r), typeof r == `string`) {
      let e = tryParseTodoJson(r);
      e !== void 0 && t.push(e);
    }
  }
  return t;
}

/** 原 aC（jsx 9474 / js 9348）：是否待办工具标题 */
export function isTodoToolTitle(e: any) {
  return typeof e == `string` && TODO_TOOL_TITLE_PATTERN.test(e.trim());
}

/** 原 oC（jsx 9477 / js 9351）：从工具输入提取待办 */
export function extractTodosFromToolInput(e: any) {
  return isTodoToolTitle([e.title, e.kind].filter(Boolean).join(` `)) ? parseTodoListStrict(e.input) : null;
}

/** 原 sC（jsx 9480 / js 9354）：从工具输出提取待办 */
export function extractTodosFromToolOutput(e: any) {
  if (!isTodoToolTitle([e.title, e.kind].filter(Boolean).join(` `))) return null;
  for (let t of collectTodoParseCandidates(e.output)) {
    let e = parseTodoListStrict(t);
    if (e) return e;
  }
  return null;
}

/** 原 cC（jsx 9488 / js 9362）：命令输入字段名集合 */
export var COMMAND_INPUT_FIELD_NAMES = new Set([`command`, `cmd`, `script`, `shellcommand`]);

/** 原 lC（jsx 9489 / js 9363）：命令参数字段名集合 */
export var COMMAND_ARGS_FIELD_NAMES = new Set([`args`, `argv`, `arguments`]);

/** 原 uC（jsx 9490 / js 9364）：文件路径字段名集合 */
export var FILE_PATH_FIELD_NAMES = new Set([`path`, `paths`, `file`, `file_path`, `filepath`, `files`, `filename`, `filenames`, `target`, `targets`, `location`, `locations`]);

/** 原 dC（jsx 9491 / js 9378）：目录字段名集合 */
export var DIRECTORY_FIELD_NAMES = new Set([`cwd`, `directory`, `workingdirectory`]);

/** 原 fC（jsx 9492 / js 9379）：权限文件路径上限 */
export var PERMISSION_FILE_PATH_LIMIT = 6;

/** 原 $（jsx 9493 / js 9380）：是否纯记录值 */
export function isPlainRecordValue(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}

/** 原 pC（jsx 9496 / js 9383）：折叠空白 */
export function collapseWhitespace(e: any) {
  return e.trim().replace(/\s+/g, ` `);
}

/** 原 mC（jsx 9499 / js 9386）：规范化行尾（模板串内含字面换行，零改动） */
export function normalizeLineEndings(e: any) {
  return e.trim().replace(/\r\n/g, `
`);
}

/** 原 hC（jsx 9503 / js 9393）：强制字符串数组 */
export function coerceStringArray(e: any) {
  return Array.isArray(e) ? e.map((e: any) => typeof e == `string` ? e.trim() : typeof e == `number` || typeof e == `boolean` || typeof e == `bigint` ? String(e) : ``).filter((e: any) => e.length > 0) : [];
}

/** 原 gC（jsx 9506 / js 9406）：解包工具调用载荷 */
export function unwrapToolCallPayload(e: any) {
  return isPlainRecordValue(e) ? `rawInput` in e && e.rawInput !== void 0 ? e.rawInput : `input` in e ? e.input : e : e;
}

/** 原 _C（jsx 9509 / js 9415）：从记录提取命令 */
export function extractCommandFromRecord(e: any) {
  for (let [t, n] of Object.entries(e)) {
    if (!COMMAND_INPUT_FIELD_NAMES.has(t.toLowerCase()) || typeof n != `string`) continue;
    let r = normalizeLineEndings(n);
    if (r.length !== 0) {
      for (let [t, n] of Object.entries(e)) {
        if (!COMMAND_ARGS_FIELD_NAMES.has(t.toLowerCase())) continue;
        let e = coerceStringArray(n);
        if (e.length > 0) return `${r} ${e.join(` `)}`;
      }
      return r;
    }
  }
  return null;
}

/** 原 vC（jsx 9524 / js 9430）：深度查找命令值 */
export function findCommandValueDeep(e: any, t: any = new Set(), n: any = !1): any {
  if (typeof e == `string`) {
    if (!n) return null;
    let t = normalizeLineEndings(e);
    return t.length > 0 ? t : null;
  }
  if (Array.isArray(e)) {
    if (t.has(e)) return null;
    t.add(e);
    for (let n of e) {
      let e = findCommandValueDeep(n, t);
      if (e) return e;
    }
    return null;
  }
  if (!isPlainRecordValue(e) || t.has(e)) return null;
  t.add(e);
  let r = extractCommandFromRecord(e);
  if (r) return r;
  for (let n of [`rawInput`, `input`, `params`, `toolCall`]) {
    if (!(n in e)) continue;
    let r = findCommandValueDeep(e[n], t, n === `rawInput` || n === `input` || n === `params`);
    if (r) return r;
  }
  for (let n of Object.values(e)) {
    if (!Array.isArray(n) && !isPlainRecordValue(n)) continue;
    let e = findCommandValueDeep(n, t);
    if (e) return e;
  }
  return null;
}

/** 原 yC（jsx 9555 / js 9461）：推入去重文件路径 */
export function pushUniqueFilePath(e: any, t: any) {
  let n = collapseWhitespace(t);
  !n || e.includes(n) || e.push(n);
}

/** 原 bC（jsx 9559 / js 9465）：收集文件路径值 */
export function collectFilePathValues(e: any, t: any, n: any): any {
  if (!(t.length >= PERMISSION_FILE_PATH_LIMIT)) {
    if (typeof e == `string`) {
      pushUniqueFilePath(t, e);
      return;
    }
    if (Array.isArray(e)) {
      if (n.has(e)) return;
      n.add(e);
      for (let r of e) if (collectFilePathValues(r, t, n), t.length >= PERMISSION_FILE_PATH_LIMIT) return;
      return;
    }
    if (!(!isPlainRecordValue(e) || n.has(e)) && (n.add(e), !(typeof e.path == `string` && (pushUniqueFilePath(t, e.path), t.length >= PERMISSION_FILE_PATH_LIMIT)))) {
      for (let r of Object.values(e)) if (collectFilePathValues(r, t, n), t.length >= PERMISSION_FILE_PATH_LIMIT) return;
    }
  }
}

/** 原 xC（jsx 9576 / js 9485）：收集权限文件路径 */
export function collectPermissionFilePaths(e: any, t: any, n: any = new Set()): any {
  if (!(t.length >= PERMISSION_FILE_PATH_LIMIT)) {
    if (Array.isArray(e)) {
      if (n.has(e)) return;
      n.add(e);
      for (let r of e) if (collectPermissionFilePaths(r, t, n), t.length >= PERMISSION_FILE_PATH_LIMIT) return;
      return;
    }
    if (!(!isPlainRecordValue(e) || n.has(e))) {
      n.add(e);
      for (let [r, i] of Object.entries(e)) {
        let e = r.toLowerCase();
        if (!DIRECTORY_FIELD_NAMES.has(e)) {
          if (FILE_PATH_FIELD_NAMES.has(e)) {
            if (collectFilePathValues(i, t, n), t.length >= PERMISSION_FILE_PATH_LIMIT) return;
            continue;
          }
          if (!(!Array.isArray(i) && !isPlainRecordValue(i)) && (collectPermissionFilePaths(i, t, n), t.length >= PERMISSION_FILE_PATH_LIMIT)) return;
        }
      }
    }
  }
}

/** 原 SC（jsx 9599 / js 9508）：收集权限文件变更 */
export function collectPermissionFileChanges(e: any, t: any, n: any = new Set()): any {
  if (Array.isArray(e)) {
    if (n.has(e)) return;
    n.add(e);
    for (let r of e) collectPermissionFileChanges(r, t, n);
    return;
  }
  if (!(!isPlainRecordValue(e) || n.has(e))) {
    if (n.add(e), isPlainRecordValue(e.changes)) for (let [n, r] of Object.entries(e.changes) as any) isPlainRecordValue(r) && (r.type !== `add` && r.type !== `update` || t.some((e: any) => e.path === n && e.type === r.type) || t.push({
      path: n,
      type: r.type
    }));
    for (let r of Object.values(e)) !Array.isArray(r) && !isPlainRecordValue(r) || collectPermissionFileChanges(r, t, n);
  }
}

/** 原 CC（jsx 9614 / js 9525）：构建权限请求视图模型（导出别名 l） */
export function buildPermissionRequestViewModel(e: any) {
  let t = e.raw,
    n: any[] = [];
  collectPermissionFilePaths(t, n);
  let r = collapseWhitespace(e.title ?? e.description ?? e.kind) || `permission`,
    i = findCommandValueDeep(unwrapToolCallPayload(t), new Set(), !0),
    a: any[] = [];
  collectPermissionFileChanges(t, a);
  let o = a.length === 1 ? a[0] : null;
  return {
    title: r,
    command: i,
    filePaths: n,
    scope: i ? `command` : n.length > 0 ? `file` : `generic`,
    fileChange: o,
    fileChanges: a
  };
}


/* ============================================================================
 * §42 工作区键与 coding-plan 错误（jsx 9632–9636 / js 9543–9547 区）
 * §43 内网/环境解析（jsx 9637–9696 / js 9548–9596 区）
 * §44 仓库快照键与本地工作区查找（jsx 9697–9712 / js 9606–9624 区）
 * §45 浏览器执行操作 schema（jsx 9713–9741 / js 9629–9629 区）
 * ==========================================================================*/

/** 原 wC（jsx 9632 / js 9543）：web 远程工作区键（导出别名 c） */
export function webRemoteWorkspaceKey(e: any) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}

/** 原 TC（jsx 9635 / js 9546）：coding-plan 安全验证必需标记 */
export var CODING_PLAN_SECURITY_VERIFICATION_REQUIRED = `coding_plan_security_verification_required`;

/** 原 EC（jsx 9636 / js 9547）：coding-plan 系统繁忙标记 */
export var CODING_PLAN_SYSTEM_BUSY = `coding_plan_system_busy`;

/** 原 DC（jsx 9637 / js 9548）：读取进程环境变量 */
export function readProcessEnv() {
  return globalThis.process?.env ?? {};
}

/** 原 OC（jsx 9640 / js 9551）：解析内网机器主机 */
export function resolveIntranetMachineHost(e: any = readProcessEnv()) {
  return e.INTRANET_MACHINE_HOST?.trim() || `studio.zcode-ai.com`;
}

/** 原 kC（jsx 9643 / js 9554）：内网机器主机常量 */
export var INTRANET_MACHINE_HOST = resolveIntranetMachineHost();

/* 原匿名表达式（jsx 9644）：主机模板串引用 */
`${INTRANET_MACHINE_HOST}`;

/** 原 AC（jsx 9645 / js 9556）：内网探测配置 */
export var INTRANET_PROBE_CONFIG: any = {
  targets: [{
    kind: `service`,
    url: `http://${INTRANET_MACHINE_HOST}:3850/api/intranet/probe`,
    expectedMarker: `zcode-intranet`
  }],
  attempts: 2,
  requiredSuccessCount: 1
};

/** 原 jC（jsx 9654 / js 9567）：是否使用测试端点 */
export function shouldUseTestEndpoints(e: any) {
  return e.env === `test` || e.isIntranet;
}

/** 原 MC（jsx 9657 / js 9570）：强制环境记录 */
export function coerceEnvRecord(e: any) {
  return e || {};
}

/** 原 NC（jsx 9660 / js 9573）：是否真值环境标志 */
export function isTruthyEnvFlag(e: any) {
  if (!e) return !1;
  let t = e.trim().toLowerCase();
  return t === `1` || t === `true`;
}

/** 原 PC（jsx 9665 / js 9578）：规范化生效环境 */
export function normalizeEffectiveEnv(e: any) {
  let t = e?.trim().toLowerCase();
  return t === `test` || t === `production` ? t : void 0;
}

/** 原 FC（jsx 9669 / js 9582）：规范化网络环境 */
export function normalizeNetworkEnv(e: any) {
  let t = e?.trim().toLowerCase();
  return t === `auto` || t === `intranet` || t === `internet` ? t : void 0;
}

/** 原 IC（jsx 9673 / js 9586）：解析环境覆盖信号 */
export function resolveEnvOverrideSignals(e: any) {
  let t = coerceEnvRecord(e),
    n = normalizeEffectiveEnv(t.ZCODE_EFFECTIVE_ENV),
    r = normalizeNetworkEnv(t.ZCODE_NETWORK_ENV);
  return n || r ? {
    effectiveEnv: n,
    networkEnv: r ?? `auto`
  } : isTruthyEnvFlag(t.ZCODE_SIMULATE_PUBLIC_PROD) ? {
    effectiveEnv: `production`,
    networkEnv: `internet`
  } : {
    effectiveEnv: void 0,
    networkEnv: `auto`
  };
}

/** 原 LC（jsx 9688 / js 9596）：解析运行时环境模式 */
export function resolveRuntimeEnvMode(e: any) {
  let t = resolveEnvOverrideSignals(e.env),
    n = t.effectiveEnv ?? e.rawEnv;
  return {
    env: n,
    isIntranet: t.networkEnv === `intranet` ? !0 : t.networkEnv === `internet` ? !1 : e.probedIsIntranet,
    shouldProbe: n === `production` && t.networkEnv === `auto`
  };
}

/** 原 RC（jsx 9697 / js 9606）：仓库快照存储键 */
export function repoSnapshotStorageKey(e: any, t: any) {
  return `repo_snapshot_${e}/${t}`;
}

/* 原匿名表达式（jsx 9700）：仓库快照键常量组 */
repoSnapshotStorageKey(`manifest`, `v2`), repoSnapshotStorageKey(`prompt`, `v2`), repoSnapshotStorageKey(`delta`, `v2`), repoSnapshotStorageKey(`encrypted_artifact`, `v2`), repoSnapshotStorageKey(`encryption_aad`, `v2`), repoSnapshotStorageKey(`manifest_hash`, `v1`), repoSnapshotStorageKey(`upload_key`, `v1`), repoSnapshotStorageKey(`upload_target`, `v1`);

/** 原 zC（jsx 9701 / js 9617）：repo-wiki 工作区键（导出别名 n） */
export function repoWikiWorkspaceKey(e: any) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}

/** 原 BC（jsx 9704 / js 9620 区）：正向查找本地工作区索引 */
export function findLocalWorkspaceIndexForward(e: any, t: any, n: any) {
  for (let r = t; r < n; r += 1) if (e[r]?.kind === `local`) return r;
  return null;
}

/** 原 VC（jsx 9708 / js 9624）：查找最近本地工作区索引 */
export function findNearestLocalWorkspaceIndex(e: any, t: any) {
  if (e.length === 0) return null;
  let n = Math.min(Math.max(t ?? 0, 0), e.length - 1);
  return findLocalWorkspaceIndexForward(e, n, e.length) ?? findLocalWorkspaceIndexForward(e, 0, n);
}

/** 原 HC（jsx 9713 / js 9629）：浏览器执行操作基础 */
export var BrowserExecuteOpBaseSchema = A({
  id: w().uuid(),
  runtimeScope: P([`main`, `subagent`]),
  token: w().min(32),
  sessionId: w().trim().min(1),
  turnId: w().trim().min(1).optional(),
  trace: A({
    traceId: w().trim().min(1),
    spanId: w().trim().min(1).optional(),
    parentSpanId: w().trim().min(1).optional()
  }).strict().optional()
});

/* 原匿名表达式（jsx 9725）：浏览器执行操作/结果判别联合 */
M(`op`, [BrowserExecuteOpBaseSchema.extend({
  op: F(`list`)
}).strict(), BrowserExecuteOpBaseSchema.extend({
  op: F(`execute`),
  browserId: w().trim().min(1),
  browserGeneration: E().int().nonnegative(),
  command: Ko
}).strict()]), M(`ok`, [A({
  id: w().uuid(),
  ok: F(!0),
  browsers: k(Yo).optional(),
  result: as.optional()
}).strict(), A({
  id: w().uuid(),
  ok: F(!1),
  error: w().min(1)
}).strict()]);


/* ============================================================================
 * §46 对外导出块（jsx 9742 / js 9656–10069，412 个别名）
 *    别名与原块逐一对应；本批次符号以语义名导出，上半符号（SrcSharedA 域）
 *    以原混淆名导出（见文件头 §0 ambient 声明）。
 * ==========================================================================*/

export { AUTOMATION_CREATE_LIMIT_REACHED as $, buildRemoteServerWorkspaceKey as $a, v4EditCancelTestid as $i, cronCreateOpenTestid as $n, fc as $o, settingsAskUserQuestionAutoResolutionSwitchTestid as $r, browserAddressInputTestid as $t, NATIVE_PROVIDER_REF_PREFIX as A, v4TimelineBottomTestid as Aa, taskArchiveTestid as Ai, chatEmptyTestid as An, isObjectRecord as Ao, offpeakCardMenuTestid as Ar, ee as As, automationCardMenuTestid as At, getOAuthProviderFamilyByProviderId as B, workspaceFileTreeRefreshButtonTestid as Ba, v4AttachmentTestid as Bi, chatSendButtonTestid as Bn, resolveModelContextWindow as Bo, projectSectionTestid as Br, automationEditBackTestid as Bt, isPluginPreferenceSource as C, v4SessionTitleTestid as Ca, sshPasswordInputTestid as Ci, browserWebviewTestid as Cn, normalizeProviderId as Co, oauthCancelTestid as Cr, E as Cs, IpcChannelNames as Ct, isDataBaseDirForbiddenError as D, v4SubagentOpenSidePaneTestid as Da, sshUsernameInputTestid as Di, chatAttachmentMenuItemTestid as Dn, bl as Do, offpeakActionDeleteTestid as Dr, j as Ds, automationActionDeleteTestid as Dt, AppRuntimePreferencesSchema as E, v4StopTestid as Ea, sshSuccessTestid as Ei, chatAttachmentButtonTestid as En, _l as Eo, offpeakActionContinueTestid as Er, w as Es, automationsOpenTestid as Et, buildCustomModelRef as F, v4UserInputOptionTestid as Fa, taskSettingsButtonTestid as Fi, chatModelSelectTriggerTestid as Fn, mapApiFormatToKind as Fo, offpeakFormTitleTestid as Fr, automationCustomIntervalIncrementTestid as Ft, resolveFirstReadyProvider as G, workspaceMoreButtonTestid as Ga, v4ComposerTestid as Gi, composerProjectDetachTestid as Gn, $c as Go, remoteKindDockerTestid as Gr, automationFrequencySelectTestid as Gt, activeOAuthProviderMatchesFamily as H, workspaceHeaderTestid as Ha, v4AttachmentUploadRetryTestid as Hi, chatThoughtLevelSelectItemTestid as Hn, mapKindToApiFormat as Ho, promptSuggestionPanelTestid as Hr, automationFormSubmitTestid as Ht, getOAuthProviderFamilyById as I, v4UserInputTextTestid as Ia, terminalTestid as Ii, chatModeSelectItemTestid as In, mapModelFormatToKind as Io, offpeakTabTestid as Ir, automationCustomIntervalSelectTestid as It, listSessionModePresets as J, wslDistroSelectTestid as Ja, v4ComposerInputTestid as Ji, composerWorkOutsideProjectTestid as Jn, Vc as Jo, remoteKindWslTestid as Jr, automationScheduleDeleteTestid as Jt, formatLogLinePrefix as K, workspacePathTestid as Ka, v4ComposerBackgroundWorkTriggerTestid as Ki, composerRemoteConnectionTestid as Kn, zc as Ko, remoteKindServerTestid as Kr, automationRunNowTestid as Kt, normalizeProviderFamilyDomain as L, workspaceCloseTestid as La, terminalCloseButtonTestid as Li, chatModeSelectTriggerTestid as Ln, canonicalizeEndpointUrl as Lo, pluginMcpServerRowTestid as Lr, automationCustomRepeatEditTestid as Lt, nativeProviderRef as M, v4TurnNavigatorItemTestid as Ma, taskItemTestid as Mi, chatLoadingTestid as Mn, isUnlimitedContextModelId as Mo, offpeakEditSubmitTestid as Mr, a as Ms, automationCreateMenuTestid as Mt, resolveProviderRefFromCustomModelRef as N, v4TurnNavigatorTooltipTestid as Na, taskListTestid as Ni, chatModelSelectGroupTestid as Nn, yl as No, offpeakEditViewTestid as Nr, t as Ns, automationCustomConfirmTestid as Nt, CUSTOM_PROVIDER_REF_PREFIX as O, v4TaskOpenInSplitTestid as Oa, subagentBuiltInModelTriggerTestid as Oi, chatBackgroundResultTitleTestid as On, Tl as Oo, offpeakActionPauseTestid as Or, O as Os, automationActionToggleTestid as Ot, parseCustomModelRef as P, v4UserInputDialogTestid as Pa, taskNewButtonTestid as Pi, chatModelSelectItemTestid as Pn, vl as Po, offpeakFormInstructionsTestid as Pr, e as Ps, automationCustomIntervalDecrementTestid as Pt, isTerminalOffPeakRunStatus as Q, resolveSessionDisplayTitle as Qa, v4EditAttachmentRemoveTestid as Qi, cronCreateCardTestid as Qn, dc as Qo, serverWorkspacePathInputTestid as Qr, automationYearMonthOptionTestid as Qt, getOAuthFamilyIdByProviderId as R, workspaceFileTreeButtonTestid as Ra, terminalToggleTestid as Ri, chatReasoningContentTestid as Rn, resolveProviderApiFormat as Ro, previewPaneTestid as Rr, automationCustomUnitOptionTestid as Rt, isOfficialPluginMarketplace as S, v4SessionPaneTestid as Sa, sshHostInputTestid as Si, browserResponsiveZoomSelectTestid as Sn, listEndpointKinds as So, modelProviderNavItemTestid as Sr, Ka as Ss, ServicePortIpcTopics as St, APP_RUNTIME_PREFERENCES_STORAGE_KEY as T, v4SplitDividerTestid as Ta, sshPrivateKeyInputTestid as Ti, chatAssistantHistoryTriggerTestid as Tn, hasAnyReadyProvider as To, oauthLoginButtonTestid as Tr, N as Ts, automationsListTestid as Tt, isProviderAllowedForFamilyMode as U, workspaceItemTestid as Ua, v4BackgroundWorkCancelTestid as Ui, chatThoughtLevelSelectTriggerTestid as Un, resolveProviderKindEndpointUrl as Uo, promptSuggestionSectionTestid as Ur, automationFormTitleTestid as Ut, normalizeOAuthProviderDomain as V, workspaceFileTreeRowTestid as Va, v4AttachmentUploadProgressTestid as Vi, chatSummaryPanelTestid as Vn, resolveProviderDefaultKind as Vo, promptSuggestionOptionTestid as Vr, automationFormPromptTestid as Vt, ZCODE_AGENT_PROVIDER_NOT_READY as W, workspaceListTestid as Wa, v4BackgroundWorkItemTestid as Wi, chatToolCallBlockTestid as Wn, resolveModelSupportedKinds as Wo, promptSuggestionStatusTestid as Wr, automationFrequencyOptionTestid as Wt, buildSessionSettingsViewModel as X, joinTestidParts as Xa, v4ComposerSendTestid as Xi, conversationNewTaskTestid as Xn, Cc as Xo, serverTokenInputTestid as Xr, automationYearDayOptionTestid as Xt, listSessionModeOptions as Y, wslUserInputTestid as Ya, v4ComposerKeepQueueSendTestid as Yi, confirmDialogConfirmTestid as Yn, Lc as Yo, serverNameInputTestid as Yr, automationSchedulePreviewTestid as Yt, OFFPEAK_IDLE_PLAN_ID as Z, resolveSessionDisplayStatus as Za, v4EditTestid as Zi, conversationSectionTestid as Zn, uc as Zo, serverUrlInputTestid as Zr, automationYearMonthdayTestid as Zt, resolveToolCallStatusI18nId as _, v4QueuePausedBannerTestid as _a, sshAuthPrivateKeyTestid as _i, browserResponsiveScaledFrameTestid as _n, MODEL_CONTEXT_WINDOW_DEFAULT as _o, modelProviderApiKeyInputTestid as _r, P as _s, resolveCodingPlanAttribution as _t, shouldUseTestEndpoints as a, v4FeedbackDislikeTestid as aa, settingsMemoryFileTestid as ai, browserOpenExternalItemTestid as an, Base64StringSchema as ao, loginApiKeyErrorTestid as ar, nc as as, isOffPeakTaskPayload as at, countLineDiffChanges as b, v4RowTestid as ba, sshDialogTestid as bi, browserResponsiveWidthInputTestid as bn, normalizeCatalogModel as bo, modelProviderModelDeleteButtonTestid as br, M as bs, isCredentialDecryptFailure as bt, webRemoteWorkspaceKey as c, v4ModelConfigTestid as ca, settingsMemorySwitchTestid as ci, browserResponsiveHeightInputTestid as cn, StreamTextFieldEnum as co, loginApiKeyProviderTriggerTestid as cr, tc as cs, parseLaunchMarks as ct, extractTodosFromToolOutput as d, v4PausedQueueSendDialogTestid as da, settingsPageTestid as di, browserResponsiveResizeCornerTopLeftTestid as dn, BrowserAmbientContextSchema as do, loginTriggerTestid as dr, Es as ds, BROWSER_RESTORE_PENDING_URL as dt, v4EditInputTestid as ea, settingsBackButtonTestid as ei, browserBackButtonTestid as en, parseRemoteWorkspaceKey as eo, dockerContainerInputTestid as er, bc as es, isAutomationCreateLimitError as et, isTodoToolTitle as f, v4QueueTestid as fa, settingsSectionNavTestid as fi, browserResponsiveResizeCornerTopRightTestid as fn, RuntimeModelSelectionSchema as fo, loginUseApiKeyButtonTestid as fr, ms as fs, DesktopMenuActionIds as ft, canonicalizeToolName as g, v4QueueItemSendNowTestid as ga, sshAuthPasswordTestid as gi, browserResponsiveResizeWidthTestid as gn, MODEL_CONTEXT_WINDOW_UNLIMITED as go, modelProviderAddModelButtonTestid as gr, Ao as gs, parseCodingPlanScope as gt, isFileWriteToolName as h, v4QueueItemEditTestid as ha, sidebarCodingPlanUsageButtonTestid as hi, browserResponsiveResizeTopTestid as hn, Sl as ho, mcpServerRowTestid as hr, Mo as hs, codingPlanScopesOverlap as ht, INTRANET_PROBE_CONFIG as i, v4EditWorkspaceConflictDialogTestid as ia, settingsMemoryBackProjectsTestid as ii, browserMoreButtonTestid as in, decodeBase64ToBytes as io, loginApiKeyContinueButtonTestid as ir, sc as is, isCronAutomationPayload as it, customProviderRef as j, v4TurnNavigatorTestid as ja, taskEmptyTestid as ji, chatErrorBannerTestid as jn, isProviderReadyForUse as jo, offpeakCreateButtonTestid as jr, s as js, automationCreateManuallyTestid as jt, GHOST_PROVIDER_REF_PREFIX as k, v4TimelineTestid as ka, subagentRowTestid as ki, chatContextUsageTriggerTestid as kn, isProviderEnabled as ko, offpeakCardTestid as kr, te as ks, automationCardTestid as kt, buildPermissionRequestViewModel as l, v4PaneShellTestid as la, settingsMemoryWorkspaceTestid as li, browserResponsiveResizeCornerTestid as ln, StreamTimestampSchema as lo, loginApiKeySkipButtonTestid as lr, ws as ls, buildWebRemoteEntryViewTelemetryEvent as lt, resolveToolViewKind as m, v4QueueItemDeleteTestid as ma, sidebarTestid as mi, browserResponsiveResizeLeftTestid as mn, W as mo, mcpOpenAuthorizationButtonTestid as mr, ss as ms, buildCodingPlanScope as mt, repoWikiWorkspaceKey as n, v4EditSubmitTestid as na, settingsLocaleSelectTriggerTestid as ni, browserElementPickerButtonTestid as nn, RPC_FRAME_LIMITS as no, gitPaneTestid as nr, cc as ns, DEFAULT_OFFPEAK_AUTOMATION_GROUP_ID as nt, CODING_PLAN_SECURITY_VERIFICATION_REQUIRED as o, v4FeedbackLikeTestid as oa, settingsMemoryPreviewTestid as oi, browserRefreshButtonTestid as on, STREAM_TRANSPORT_LIMITS as oo, loginApiKeyInputTestid as or, Us as os, generateUuid as ot, parseToolCallInput as p, v4QueueItemTestid as pa, settingsUsageTabTestid as pi, browserResponsiveResizeHeightTestid as pn, McpServerConfigSchema as po, logoutButtonTestid as pr, fs as ps, sanitizeRemoteTargetForRestore as pt, buildStableModelId as q, workspaceTitleTestid as qa, v4ComposerClearQueueSendTestid as qi, composerWorkspaceTriggerTestid as qn, Bc as qo, remoteKindSshTestid as qr, automationScheduleAddTestid as qt, resolveRuntimeEnvMode as r, v4EditWorkspaceConflictConversationOnlyTestid as ra, settingsMemoryBackMemoriesTestid as ri, browserForwardButtonTestid as rn, crc32Hex as ro, loginApiKeyCancelButtonTestid as rr, Sc as rs, newUniqueId as rt, CODING_PLAN_SYSTEM_BUSY as s, v4ForkTestid as sa, settingsMemoryRefreshTestid as si, browserResponsiveButtonTestid as sn, StreamRowKeySchema as so, loginApiKeyProviderItemTestid as sr, Fs as ss, LAUNCH_MARKS_STORAGE_KEY as st, findNearestLocalWorkspaceIndex as t, v4EditRewindWorkspaceTestid as ta, settingsLocaleSelectItemTestid as ti, browserDevtoolsButtonTestid as tn, automationsWorkspaceKey as to, dockerContainerSelectTestid as tr, xc as ts, DEFAULT_CRON_AUTOMATION_GROUP_ID as tt, extractTodosFromToolInput as u, v4PaneWorkspaceBadgeTestid as ua, settingsNativeSearchSwitchTestid as ui, browserResponsiveResizeCornerBottomLeftTestid as un, buildRuntimeProviderFromConfig as uo, loginMenuItemTestid as ur, Ds as us, resolveClientTelemetryContext as ut, isPendingToolCallStatus as v, v4QueueResumeTestid as va, sshConfigAliasSelectTestid as vi, browserResponsiveToolbarTestid as vn, xl as vo, modelProviderConnectionModeItemTestid as vr, k as vs, ZCODE_AGENT_AUDIENCE as vt, isUserPreferenceSource as w, v4SplitCloseTestid as wa, sshPortInputTestid as wi, chatAssistantHistoryContentTestid as wn, listProviderModelIds as wo, oauthErrorTestid as wr, A as ws, appHeaderTestid as wt, OFFICIAL_PLUGIN_MARKETPLACE_IDS as x, v4RowAttachmentsTestid as xa, sshErrorTestid as xi, browserResponsiveZoomOptionTestid as xn, mapKindToDefaultEndpointPath as xo, modelProviderModelInputTestid as xr, F as xs, EmbeddedBrowserIpcTopics as xt, normalizeMcpServerConfigEntry as y, v4RetrySubscribeTestid as ya, sshConnectTriggerTestid as yi, browserResponsiveViewportTestid as yn, El as yo, modelProviderConnectionModeTriggerTestid as yr, D as ys, BIGMODEL_PROVIDER_DOMAIN as yt, resolveProviderFamilyMode as z, workspaceFileTreePanelTestid as za, toolSummaryTriggerTestid as zi, chatReasoningTriggerTestid as zn, resolveProviderPrimaryEndpointUrl as zo, projectAddTestid as zr, automationCustomUnitSelectTestid as zt };

/* ============================================================================
 * 尾符号表（混淆名 → 语义名，jsx 行 / js 行；B5-10b 全量 769 符号）
 * ============================================================================
 */
/* §1  模型目录 schema 与助手（jsx 4902–5242，42 项）
 *  Rl→CatalogModelSchema 4902/4787 | zl→CatalogProviderSchema 4917/4799 | Bl→CatalogModelEntrySchema 4928/4807
 *  Vl→ProviderSourceEnum 4935/4814 | Hl→ProviderSystemDisabledReasonEnum 4936/4815
 *  Ul→ProviderEndpointsSchema 4937/4822 | Wl→ProviderEndpointsOverrideSchema 4942/4823
 *  Gl→ProviderConfigEntryListSchema 4970/4851 | Kl→isProviderEnabled 5001/4879
 *  ql→isProviderReadyForUse 5004/4882 | Jl→hasAnyReadyProvider 5013/4894
 *  Yl→MODEL_CONTEXT_WINDOW_DEFAULT 5016/4897 | Xl→MODEL_CONTEXT_WINDOW_FALLBACK 5017/4898
 *  Zl→MODEL_CONTEXT_WINDOW_UNLIMITED 5018/4899 | Ql→isUnlimitedContextModelId 5019/4900
 *  $l→resolveModelContextWindow 5022/4903 | eu→normalizeProviderId 5028/4909 | tu→isObjectRecord 5031/4912
 *  nu→resolveModelDisplayName 5034/4915 | ru→listProviderModelIds 5037/4918 | iu→findProviderModel 5040/4926
 *  au→dedupeStrings 5044/4930 | ou→mapModelFormatToKind 5047/4933 | su→mapKindToModelFormat 5059/4945
 *  cu→normalizeCatalogModel 5069/4955 | lu→resolveProviderDefaultKind 5110/4977
 *  uu→mapKindToApiFormat 5125/4992 | du→mapApiFormatToKind 5135/5002
 *  fu→mapKindToDefaultEndpointPath 5145/5012 | pu→isHttpUrl 5155/5022 | mu→normalizeEndpointBaseUrl 5163/5030
 *  hu→joinEndpointUrlParts 5179/5046 | gu→stripKnownEndpointPathSuffix 5184/5059
 *  _u→canonicalizeEndpointUrl 5197/5073 | vu→resolveProviderKindEndpointUrl 5200/5076
 *  yu→listEndpointKinds 5205/5083 | bu→hasOwnPropertySafe 5210/5093 | xu→listEndpointApiFormats 5213/5096
 *  Su→mapApiFormatToModelFormats 5218/5106 | Cu→resolveProviderApiFormat 5228/5116
 *  wu→resolveProviderPrimaryEndpointUrl 5231/5131 | Tu→resolveModelSupportedKinds 5238/5138
 */
/* §2  协议基元（jsx 5243–5292，9 项）
 *  Eu→ZCODE_PROTOCOL_NAME 5243/5147 | G→NonEmptyTrimmedStringSchema 5244/5148
 *  K→JsonObjectRecordSchema 5245/5149 | q→NonNegativeIntegerSchema 5246/5150
 *  Du→TimestampValueSchema 5247/5151 | Ou→NodeReplImagesDisplaySchema 5248/5152
 *  ku→ToolResultDisplaySchema 5257/5167 | Au→StringOrIntegerIdSchema 5266/5174
 *  ju→TraceContextSchema 5267/5175
 */
/* §3  协议数据 schema（jsx 5293–5493，23 项）
 *  Mu→AgentResourceSampleSchema 5293/5187 | Nu→MessageInputSourceEnum 5302/5227
 *  Pu→SessionPersistenceEnum 5303/5228 | Fu→PermissionOptionSchema 5304/5229
 *  Iu→NameValueEntrySchema 5311/5230 | Lu→McpOAuthConfigSchema 5315/5231 | Ru→McpServerConfigSchema 5329/5248
 *  zu→McpServerStatusSchema 5347/5269 | Bu→McpConnectionActionEnum 5360/5280
 *  Vu→ImportedHistoryMessageSchema 5368/5283 | Hu→ImportedClaudeHistorySchema 5373/5284
 *  Uu→ThoughtLevelOptionSchema 5380/5291 | Wu→ReasoningLevelConfigSchema 5385/5292
 *  Gu→AvailableModelEntrySchema 5391/5298 | Ku→RuntimeProviderKindEnum 5407/5314
 *  qu→RuntimeApiFormatEnum 5408/5315 | Ju→RuntimeProviderSourceEnum 5409/5316
 *  Yu→ApiKeyReferenceSchema 5410/5317 | Xu→ApiKeyMaterialSchema 5423/5323
 *  Zu→RuntimeModelEntrySchema 5436/5329 | Qu→RuntimeProviderWithKeyRefSchema 5450/5343
 *  $u→RuntimeProviderWithInlineKeySchema 5467/5360 | J→RuntimeModelSelectionSchema 5482/5375
 */
/* §4  供应商视图模型构建器（jsx 5494–5693，20 项）
 *  ed→trimProviderEndpoints 5494/5383 | td→resolveProviderEndpointBundle 5505/5392
 *  nd→resolveProviderSourceBucket 5515/5398 | rd→resolveProviderModelFormats 5518/5407
 *  id→resolveCatalogModelEntry 5522/5413 | ad→trimHeaderRecord 5542/5425 | od→capitalizeLabel 5547/5434
 *  sd→modelSupportsKind 5551/5438 | cd→buildReasoningViewModel 5554/5441
 *  ld→buildProviderOptionsByLevel 5574/5454 | ud→providerOptionsKeyForKind 5585/5463
 *  dd→buildReasoningProviderOptions 5595/5473 | fd→setNestedOptionValue 5601/5479
 *  pd→deleteNestedOptionValue 5612/5490 | md→resolveModelIdForKind 5622/5500
 *  hd→VISION_INPUT_MODALITIES 5625/5503 | gd→isModelsDevSourcedProvider 5626/5504
 *  _d→modelAcceptsVisionInput 5629/5510 | vd→providerSupportsVisionModels 5632/5513
 *  yd→buildRuntimeProviderFromConfig 5635/5516
 */
/* §5  会话快照与事件载荷 schema（jsx 5694–6031，37 项）
 *  bd→ModelCatalogSnapshotSchema 5694/5570 | xd→TodoItemSchema 5702/5578 | Sd→GoalStatsSchema 5707/5583
 *  Cd→TodoGroupSchema 5716/5592 | wd→SessionSettingsStateSchema 5725/5601
 *  Td→PendingPermissionRequestSchema 5746/5615 | Ed→ActiveToolCallSchema 5757/5626
 *  Dd→SessionProjectionSchema 5763/5632 | Od→SlashCommandSchema 5783/5649
 *  kd→ModelStreamEventKindEnum 5789/5655 | Ad→ModelStreamingPayloadSchema 5790/5670
 *  jd→SessionSnapshotSchema 5801/5681 | Md→SessionEventEnvelopeBaseSchema 5816/5693
 *  Nd→SerializedErrorSchema 5826/5729 | Pd→SessionCreatedPayloadSchema 5835/5738
 *  Fd→SessionResumedPayloadSchema 5839/5739 | Id→SessionTitleUpdatedPayloadSchema 5848/5748
 *  Ld→TurnStartedPayloadSchema 5855/5755 | Rd→PLAN_APPROVAL_FEEDBACK_SOURCE 5870/5770
 *  zd→SteerCommandKindEnum 5871/5771 | Bd→SteerDeliveryModeEnum 5872/5772
 *  Vd→TurnSteerQueuedPayloadSchema 5873/5773 | Hd→TurnSteerDrainedPayloadSchema 5888/5788
 *  Ud→TurnCompletedPayloadSchema 5902/5804 | Wd→TurnFailedPayloadSchema 5918/5829
 *  Gd→MessageUpsertedPayloadSchema 5923/5830 | Kd→MessageRemovedPayloadSchema 5930/5837
 *  qd→PartDeltaPayloadSchema 5934/5838 | Jd→PartSnapshotPayloadSchema 5940/5844
 *  Yd→PartRemovedPayloadSchema 5943/5845 | Xd→ToolUpdateBaseSchema 5948/5846
 *  Zd→ToolUpdatedPayloadSchema 5959/5857 | Qd→PermissionRequestedPayloadSchema 5998/5891
 *  $d→PermissionResolvedPayloadSchema 6009/5902 | ef→UserInputRequestedPayloadSchema 6018/5911
 *  tf→UserInputResolvedPayloadSchema 6024/5917 | nf→SessionClosedPayloadSchema 6029/5918
 */
/* §6  会话事件联合与子代理（jsx 6032–6095，6 项）
 *  Y→sessionEvent 6032/5919 | rf→SessionEventSchema 6038/5922 | af→SubagentSessionBaseSchema 6064/5973
 *  of→ActiveSubagentSchema 6074/5983 | sf→EndedSubagentSchema 6077/5984 | cf→WorkspaceStateSchema 6090/5991
 */
/* §7  会话 RPC 请求/响应 schema（jsx 6096–6796，25 项）
 *  lf→PREFLIGHT_PROTOCOL_VERSION 6159/6062 | uf→ModelContextBudgetStrategyEnum 6160/6063
 *  df→BrowserAmbientContextSchema 6168/6071 | ff→GoalQueueActionEnum 6241/6150
 *  pf→BackgroundTaskStatusEnum 6255/6160 | mf→BackgroundTaskSchema 6256/6161
 *  hf→WorkspaceProviderRegistrySchema 6332/6224 | gf→ProviderRegistryApplyStatusEnum 6337/6225
 *  _f→AskUserQuestionSchema 6413/6306 | vf→CredentialPromptReasonEnum 6440/6331
 *  yf→PluginConfigValueSchema 6454/6342 | bf→PluginHookDetailSchema 6455/6343
 *  xf→PluginUserConfigOptionSchema 6469/6357 | Sf→PluginComponentGroupSchema 6477/6365
 *  Cf→PluginDescriptorSchema 6484/6369 | wf→PluginDiagnosticSchema 6507/6392
 *  Tf→PluginAuthorityEntrySchema 6519/6399 | Ef→PluginInstallScopeEnum 6544/6414
 *  Df→PluginListingSchema 6545/6415 | Of→PluginMarketplaceSchema 6560/6430
 *  kf→AvailablePluginEntrySchema 6575/6441 | Af→InstalledPluginEntrySchema 6585/6451
 *  jf→AutomationScheduleRuleSchema 6698/6532 | Mf→AutomationIntervalUnitEnum 6709/6543
 *  Nf→AutomationRecordSchema 6710/6544
 */
/* §8  RPC 方法目录（jsx 6797–6856，1 项）
 *  Pf→ZcodeRpcMethods 6797/6651
 */
/* §9  流传输限制与 RPC 帧编解码（jsx 6857–6992，18 项）
 *  Ff→StreamRowKeySchema 6857/6711 | If→StreamTimestampSchema 6861/6712 | Lf→StreamTextFieldEnum 6862/6713
 *  Rf→STREAM_TRANSPORT_LIMITS 6863/6714 | zf→Base64StringSchema 6893/6744 | Bf→crc32Hex 6894/6747
 *  Vf→BASE64_ALPHABET 6902/6755 | Hf→encodeBase64FromBytes 6903/6756 | Uf→decodeBase64ToBytes 6916/6775
 *  Wf→RPC_FRAME_LIMITS 6932/6793 | Gf→PositiveSafeIntegerSchema 6939/6800
 *  Kf→NonNegativeSafeIntegerSchema 6940/6804 | qf→BridgeTransportIdStringSchema 6941/6808
 *  Jf→RpcFrameChecksumSchema 6947/6813 | Yf→isValidRpcFramePayload 6951/6814 | Xf→RpcDataFrameSchema 6956/6819
 *  Zf→RpcFrameAckSchema 6979/6850 | Qf→RpcFramePayloadSchema 6986/6857
 */
/* §10 任务流镜像与远程桥接 schema（jsx 6993–7475，54 项）
 *  X→TaskMirrorNonEmptyString 6993/6859 | $f→TASK_MODE_IDS 6994/6860 | ep→TASK_PROVIDER_IDS 6995/6872
 *  tp→TASK_MIGRATION_SOURCES 6996/6873 | np→TaskChangeSummarySchema 6997/6874
 *  rp→TaskMirrorMetaSchema 7009/6888 | ip→automationsWorkspaceKey 7034/6913
 *  ap→TaskMirrorInvalidationReasonEnum 7037/6916 | op→TaskMirrorDeliveryPurposeEnum 7038/6932
 *  sp→TaskMirrorDeliverySourceEnum 7039/6933 | cp→TaskMirrorEventBaseSchema 7040/6934
 *  lp→TaskMirrorStreamWatermarkSchema 7048/6942 | up→TaskMirrorInvalidationBaseSchema 7052/6943
 *  dp→assertWorkspaceKeyMatchesIdentity 7056/6944 | fp→assertRunIdMatchesTraceId 7064/6953
 *  pp→TaskSnapshotInvalidatedEventSchema 7071/6957 | mp→WorkspaceTaskListInvalidatedEventSchema 7075/6958
 *  hp→TaskMirrorAttachmentSchema 7080/6965 | gp→TaskMirrorStreamEventSchema 7102/6991
 *  _p→TaskMirrorUserMessageOpSchema 7107/6992 | vp→TaskMirrorStreamEventOpSchema 7114/6999
 *  yp→TaskMirrorStreamOpSchema 7118/7000 | bp→TaskMirrorSequencedStreamOpSchema 7119/7001
 *  xp→TaskMirrorStreamTargetSchema 7124/7005 | Sp→TaskMirrorValidatedStreamTargetSchema 7134/7015
 *  Cp→TaskStreamMirrorBatchEventSchema 7137/7018 | wp→TaskMirrorStreamReleaseTargetSchema 7149/7032
 *  Tp→TaskRunLeaseRequestSchema 7150/7033 | Ep→TaskRunLeaseResultSchema 7155/7039
 *  Dp→TaskOwnerCommandBaseSchema 7165/7048 | Op→StopGenerationOwnerCommandSchema 7173/7056
 *  kp→RespondPermissionOwnerCommandSchema 7176/7057 | Ap→RespondElicitationOwnerCommandSchema 7182/7063
 *  jp→SendPromptTaskCommandSchema 7188/7069 | Mp→EnqueueTaskCommandSchema 7207/7093
 *  Np→PromoteTaskCommandSchema 7211/7094 | Pp→CancelTaskCommandSchema 7216/7099
 *  Fp→TaskOwnerCommandSchema 7221/7104 | Ip→TaskOwnerCommandWithRequesterSchema 7224/7107
 *  Lp→TaskOwnerCommandErrorCodeEnum 7239/7117 | Rp→TaskOwnerCommandResultSchema 7240/7118
 *  zp→TaskRealtimeEventSchema 7250/7122 | Bp→TaskRealtimeEventWithOriginSchema 7253/7125
 *  Z→RemoteBridgeNonEmptyString 7265/7132 | Q→RemoteBridgeTransportIdSchema 7266/7133
 *  Vp→WindowControlWorkspaceListSchema 7267/7134 | Hp→WindowControlTaskListSchema 7290/7151
 *  Up→MobileBridgeFailureReasonEnum 7306/7169 | Wp→WorkspaceBridgeDescriptorSchema 7307/7182
 *  Gp→RemoteViewStateChangedSchema 7326/7204 | Kp→RemoteDeviceInfoSchema 7331/7205
 *  qp→WindowControlBootstrapResultSchema 7352/7223 | Jp→WorkspaceListSnapshotSchema 7359/7230
 *  Yp→RemotePlatformRequestMethodEnum 7365/7236
 */
/* §11 远程连接目标（jsx 7476–7544，3 项）
 *  Xp→SshRemoteTargetSchema 7476/7341 | Zp→WslRemoteTargetSchema 7490/7353
 *  Qp→RemoteConnectionTargetSchema 7495/7354
 */
/* §12 代理宿主命令（jsx 7545–7724，24 项）
 *  $p→InterWindowBroadcastMessageSchema 7545/7400 | em→RemoteAssetsConfigSchema 7550/7401
 *  tm→AgentWarmupTargetSchema 7556/7407 | nm→InitLocalAgentHostCommandSchema 7560/7408
 *  rm→InitRemoteAgentHostCommandSchema 7572/7420 | im→InitRemoteWorkspaceCommandSchema 7577/7421
 *  am→InitRemoteSshHostCommandSchema 7586/7430 | om→InitRemoteWslHostCommandSchema 7593/7437
 *  sm→AttachServicePortCommandSchema 7600/7444 | cm→DetachServicePortCommandSchema 7605/7449
 *  lm→AcquireRemoteWorkspaceCommandSchema 7609/7450 | um→ReleaseRemoteWorkspaceCommandSchema 7616/7457
 *  dm→DisposeAgentHostCommandSchema 7622/7463 | fm→BroadcastAgentHostCommandSchema 7625/7464
 *  pm→TaskRealtimeDeliverCommandSchema 7629/7465 | mm→TaskRunLeaseResultCommandSchema 7633/7466
 *  hm→TaskOwnerCommandDeliverCommandSchema 7637/7467 | gm→TaskOwnerCommandResultCommandSchema 7641/7468
 *  _m→BotReconnectResultCommandSchema 7645/7469 | vm→BotConnectionStatusResultCommandSchema 7652/7476
 *  ym→BotRuntimePortResultCommandSchema 7659/7483 | bm→SessionMessageDeliverRequestSchema 7665/7489
 *  xm→SessionMessageDeliveryResultSchema 7673/7497 | Sm→SessionRouteAnnouncePayloadSchema 7680/7504
 */
/* §13 代理宿主事件（jsx 7725–7941，32 项）
 *  Cm→AgentConnectedEventSchema 7725/7562 | wm→RemoteWorkspaceAcquiredEventSchema 7728/7563
 *  Tm→AgentErrorEventSchema 7737/7572 | Em→AgentLogEventSchema 7741/7573
 *  Dm→AgentMigrationProviderEnum 7747/7574 | Om→AgentProcessSpawnedEventSchema 7748/7575
 *  km→AgentProcessReadyEventSchema 7759/7586 | Am→AgentProcessExitedEventSchema 7769/7596
 *  jm→AgentProcessErrorEventSchema 7786/7613 | Mm→AgentResourceSampleEventSchema 7801/7628
 *  Nm→AgentRunningTaskCountChangedEventSchema 7806/7633
 *  Pm→WorkspaceRunningTaskCountChangedEventSchema 7810/7637
 *  Fm→RepoWikiRunningTaskCountChangedEventSchema 7816/7643 | Im→TaskRealtimePublishEventSchema 7820/7647
 *  Lm→TaskStreamOpPublishEventSchema 7824/7648 | Rm→TaskRunLeaseAcquireEventSchema 7829/7649
 *  zm→TaskRunLeaseReleaseEventSchema 7833/7650 | Bm→TaskOwnerCommandRequestEventSchema 7837/7651
 *  Vm→TaskOwnerCommandResultEventSchema 7841/7652 | Hm→BotReconnectRequestEventSchema 7845/7653
 *  Um→BotConnectionStatusRequestEventSchema 7852/7660 | Wm→BotRuntimePortRequestEventSchema 7859/7667
 *  Gm→SessionMessageSendRequestedEventSchema 7866/7674 | Km→SessionRouteAnnounceEventSchema 7870/7675
 *  qm→SessionMessageDeliverResultEventSchema 7874/7676 | Jm→FeedbackLogArchiveRequestEventSchema 7878/7677
 *  Ym→CronRunResultEventSchema 7883/7678 | Xm→OffPeakRunResultEventSchema 7892/7687
 *  Zm→CronSchedulerWakeRequestEventSchema 7901/7696 | Qm→OffPeakSchedulerWakeRequestEventSchema 7905/7697
 *  $m→BrowserExecuteRequestEventSchema 7909/7698 | eh→NetworkTelemetryObservationSchema 7924/7713
 */
/* §14 任务快照 schema（jsx 7942–8133，15 项）
 *  th→TaskSnapshotStatusEnum 7942/7761 | nh→SnapshotAttachmentSchema 7943/7762
 *  rh→SnapshotToolCallSchema 7959/7781 | ih→SnapshotMessagePartSchema 7976/7800
 *  ah→SnapshotMessageSchema 7986/7805 | oh→GoalTargetStatusEnum 8018/7839
 *  sh→GoalStateActionKindEnum 8019/7840 | ch→GoalStateSourceEnum 8020/7849 | lh→GoalTargetSchema 8021/7850
 *  uh→TaskSnapshotMetaSchema 8044/7865 | dh→NativeSnapshotSyncStateEnum 8090/7913
 *  fh→TaskSnapshotFileKeySchema 8097/7915 | ph→FileChangeSnapshotSchema 8105/7917
 *  mh→TurnFileChangesSnapshotSchema 8118/7932 | hh→TurnCheckpointSchema 8123/7937
 */
/* §15 远程工作区键（jsx 8134–8178，7 项）
 *  gh→REMOTE_WORKSPACE_KEY_PREFIX 8134/7943 | _h→REMOTE_KIND_SEGMENT_COUNTS 8135/7944
 *  vh→isRemoteWorkspaceKind 8141/7945 | yh→normalizeRemoteWorkspacePath 8144/7948
 *  bh→sanitizeServerIdForWorkspaceKey 8147/7954 | xh→buildRemoteServerWorkspaceKey 8152/7963
 *  Sh→parseRemoteWorkspaceKey 8155/7966
 */
/* §16 消息可见性分类（jsx 8179–8244，19 项）
 *  Ch→MODEL_ONLY_VISIBILITY 8179/7987 | wh→FORK_MESSAGE_SOURCE 8180/7988
 *  Th→GOAL_CONTINUATION_REMINDER_TAG 8181/7989 | Eh→GOAL_CONTINUATION_PROMPT_LINE 8182/7990
 *  Dh→GOAL_STATE_SECTION_HEADING 8183/7991 | Oh→TASK_NOTIFICATION_TAG 8184/7992
 *  kh→SUBAGENT_NOTIFICATION_TAG 8185/7993 | Ah→REWIND_APPLIED_NOTICE_LINES 8186/7994
 *  jh→PROVIDER_ONLY_MESSAGE_SOURCES 8187/7995 | Mh→classifyMessageVisibility 8188/8014
 *  Nh→isTimelineOnlyMessage 8206/8054 | Ph→hasProviderOnlyParts 8214/8069 | Fh→resolveMessageSource 8220/8075
 *  Ih→isGoalContinuationText 8224/8084 | Lh→isQueuedNotificationText 8228/8092
 *  Rh→collectVisiblePartText 8232/8096 | zh→isSessionForkContextMetadata 8235/8102 | Bh→asPlainRecord 8239/8106
 *  Vh→asNonEmptyString 8242/8109
 */
/* §17 目标续行与会话展示状态（jsx 8245–8308，18 项）
 *  Hh→GOAL_CONTINUATION_SYSTEM_TAG 8245/8112 | Uh→GOAL_CONTINUATION_PROMPT 8246/8113
 *  Wh→GOAL_STATE_HEADING_LINE 8247/8114 | Gh→SUBAGENT_MESSAGE_SOURCE 8248/8115
 *  Kh→isGoalContinuationContent 8249/8116 | qh→isGoalContinuationMessage 8253/8120
 *  Jh→isGoalStateContent 8256/8128 | Yh→isGoalStateMessage 8260/8132 | Xh→isMessageHiddenFromUser 8263/8135
 *  Zh→isCompactionTimelineMessage 8268/8146 | Qh→filterUserVisibleMessages 8271/8154
 *  $h→resolveSessionDisplayTitle 8276/8159 | eg→mapSubagentStatusToDisplayStatus 8284/8170
 *  tg→hasSessionActiveWork 8289/8175 | ng→isSessionBusy 8292/8184 | rg→isToolCallsFinishReason 8295/8187
 *  ig→isSessionAssistantCompleted 8298/8190 | ag→resolveSessionDisplayStatus 8304/8196
 */
/* §18 testid 前置 schema（jsx 8309–8328，1 项）
 *  og→WorkspacePathOptionSchema 8309/8207
 */
/* §19 testid 常量群（242 项）（jsx 8329–8570，242 项）
 *  sg→loginTriggerTestid 8329/8222 | cg→loginMenuItemTestid 8330/8223 | lg→loginUseApiKeyButtonTestid 8331/8224
 *  ug→loginApiKeyProviderTriggerTestid 8332/8225 | dg→loginApiKeyProviderItemTestid 8333/8226
 *  fg→loginApiKeyInputTestid 8334/8227 | pg→loginApiKeyContinueButtonTestid 8335/8228
 *  mg→loginApiKeyCancelButtonTestid 8336/8229 | hg→loginApiKeySkipButtonTestid 8337/8230
 *  gg→loginApiKeyErrorTestid 8338/8231 | _g→oauthLoginButtonTestid 8339/8232 | vg→oauthCancelTestid 8340/8233
 *  yg→oauthErrorTestid 8341/8234 | bg→appHeaderTestid 8342/8235 | xg→logoutButtonTestid 8343/8236
 *  Sg→terminalToggleTestid 8344/8237 | Cg→terminalCloseButtonTestid 8345/8238 | wg→gitPaneTestid 8346/8239
 *  Tg→browserAddressInputTestid 8347/8240 | Eg→browserBackButtonTestid 8348/8241
 *  Dg→browserForwardButtonTestid 8349/8242 | Og→browserRefreshButtonTestid 8350/8243
 *  kg→browserResponsiveButtonTestid 8351/8244 | Ag→browserResponsiveViewportTestid 8352/8245
 *  jg→browserResponsiveToolbarTestid 8353/8246 | Mg→browserResponsiveWidthInputTestid 8354/8247
 *  Ng→browserResponsiveHeightInputTestid 8355/8248 | Pg→browserResponsiveZoomSelectTestid 8356/8249
 *  Fg→browserResponsiveZoomOptionTestid 8357/8250 | Ig→browserResponsiveScaledFrameTestid 8358/8251
 *  Lg→browserResponsiveResizeLeftTestid 8359/8252 | Rg→browserResponsiveResizeWidthTestid 8360/8253
 *  zg→browserResponsiveResizeTopTestid 8361/8254 | Bg→browserResponsiveResizeHeightTestid 8362/8255
 *  Vg→browserResponsiveResizeCornerTopLeftTestid 8363/8256
 *  Hg→browserResponsiveResizeCornerTopRightTestid 8364/8257
 *  Ug→browserResponsiveResizeCornerBottomLeftTestid 8365/8258
 *  Wg→browserResponsiveResizeCornerTestid 8366/8259 | Gg→browserElementPickerButtonTestid 8367/8260
 *  Kg→browserMoreButtonTestid 8368/8261 | qg→browserOpenExternalItemTestid 8369/8262
 *  Jg→browserDevtoolsButtonTestid 8370/8263 | Yg→browserWebviewTestid 8371/8264
 *  Xg→previewPaneTestid 8372/8265 | Zg→toolSummaryTriggerTestid 8373/8266 | Qg→terminalTestid 8374/8267
 *  $g→sshConnectTriggerTestid 8375/8268 | e_→sshDialogTestid 8376/8269 | t_→remoteKindSshTestid 8377/8270
 *  n_→remoteKindServerTestid 8378/8271 | r_→remoteKindWslTestid 8379/8272 | i_→remoteKindDockerTestid 8380/8273
 *  a_→sshHostInputTestid 8381/8274 | o_→sshPortInputTestid 8382/8275 | s_→sshUsernameInputTestid 8383/8276
 *  c_→sshConfigAliasSelectTestid 8384/8277 | l_→sshPasswordInputTestid 8385/8278
 *  u_→sshPrivateKeyInputTestid 8386/8279 | d_→sshAuthPasswordTestid 8387/8280
 *  f_→sshAuthPrivateKeyTestid 8388/8281 | p_→wslDistroSelectTestid 8389/8282 | m_→wslUserInputTestid 8390/8283
 *  h_→dockerContainerSelectTestid 8391/8284 | g_→dockerContainerInputTestid 8392/8285
 *  __→serverUrlInputTestid 8393/8286 | v_→serverNameInputTestid 8394/8287 | y_→serverTokenInputTestid 8395/8288
 *  b_→serverWorkspacePathInputTestid 8396/8289 | x_→sidebarTestid 8397/8290 | S_→workspaceListTestid 8398/8291
 *  C_→workspaceItemTestid 8399/8292 | w_→workspaceCloseTestid 8400/8293
 *  T_→conversationSectionTestid 8401/8294 | E_→projectSectionTestid 8402/8295
 *  D_→conversationNewTaskTestid 8403/8296 | O_→projectAddTestid 8404/8297
 *  k_→composerWorkspaceTriggerTestid 8405/8298 | A_→composerRemoteConnectionTestid 8406/8299
 *  j_→composerProjectDetachTestid 8407/8300 | M_→composerWorkOutsideProjectTestid 8408/8301
 *  N_→chatErrorBannerTestid 8409/8302 | P_→chatEmptyTestid 8410/8303 | F_→chatAttachmentButtonTestid 8411/8304
 *  I_→chatAttachmentMenuItemTestid 8412/8305 | L_→chatSendButtonTestid 8413/8306
 *  R_→chatLoadingTestid 8414/8307 | z_→chatSummaryPanelTestid 8415/8308
 *  B_→chatAssistantHistoryTriggerTestid 8416/8309 | V_→chatAssistantHistoryContentTestid 8417/8310
 *  H_→chatBackgroundResultTitleTestid 8418/8311 | U_→chatToolCallBlockTestid 8419/8312
 *  W_→promptSuggestionPanelTestid 8420/8313 | G_→promptSuggestionSectionTestid 8421/8314
 *  K_→promptSuggestionOptionTestid 8422/8315 | q_→promptSuggestionStatusTestid 8423/8316
 *  J_→taskListTestid 8424/8317 | Y_→taskNewButtonTestid 8425/8318 | X_→taskItemTestid 8426/8319
 *  Z_→taskEmptyTestid 8427/8320 | Q_→taskArchiveTestid 8428/8321 | $_→taskSettingsButtonTestid 8429/8322
 *  ev→settingsPageTestid 8430/8323 | tv→settingsBackButtonTestid 8431/8324
 *  nv→settingsSectionNavTestid 8432/8325 | rv→settingsNativeSearchSwitchTestid 8433/8326
 *  iv→settingsMemorySwitchTestid 8434/8327 | av→settingsMemoryRefreshTestid 8435/8328
 *  ov→settingsMemoryBackProjectsTestid 8436/8329 | sv→settingsMemoryBackMemoriesTestid 8437/8330
 *  cv→settingsMemoryWorkspaceTestid 8438/8331 | lv→settingsMemoryFileTestid 8439/8332
 *  uv→settingsMemoryPreviewTestid 8440/8333 | dv→settingsAskUserQuestionAutoResolutionSwitchTestid 8441/8334
 *  fv→settingsLocaleSelectTriggerTestid 8442/8335 | pv→settingsLocaleSelectItemTestid 8443/8336
 *  mv→mcpServerRowTestid 8444/8337 | hv→pluginMcpServerRowTestid 8445/8338
 *  gv→mcpOpenAuthorizationButtonTestid 8446/8339 | _v→subagentRowTestid 8447/8340
 *  vv→subagentBuiltInModelTriggerTestid 8448/8341 | yv→settingsUsageTabTestid 8449/8342
 *  bv→sidebarCodingPlanUsageButtonTestid 8450/8343 | xv→modelProviderNavItemTestid 8451/8344
 *  Sv→modelProviderConnectionModeTriggerTestid 8452/8345 | Cv→modelProviderConnectionModeItemTestid 8453/8346
 *  wv→modelProviderApiKeyInputTestid 8454/8347 | Tv→modelProviderModelInputTestid 8455/8348
 *  Ev→modelProviderModelDeleteButtonTestid 8456/8349 | Dv→modelProviderAddModelButtonTestid 8457/8350
 *  Ov→chatModelSelectTriggerTestid 8458/8351 | kv→chatModelSelectGroupTestid 8459/8352
 *  Av→chatModelSelectItemTestid 8460/8353 | jv→chatThoughtLevelSelectTriggerTestid 8461/8354
 *  Mv→chatThoughtLevelSelectItemTestid 8462/8355 | Nv→chatModeSelectTriggerTestid 8463/8356
 *  Pv→chatModeSelectItemTestid 8464/8357 | Fv→chatContextUsageTriggerTestid 8465/8358
 *  Iv→chatReasoningTriggerTestid 8466/8359 | Lv→chatReasoningContentTestid 8467/8360
 *  Rv→workspaceHeaderTestid 8468/8361 | zv→workspaceTitleTestid 8469/8362 | Bv→workspacePathTestid 8470/8363
 *  Vv→workspaceMoreButtonTestid 8471/8364 | Hv→workspaceFileTreeButtonTestid 8472/8365
 *  Uv→workspaceFileTreePanelTestid 8473/8366 | Wv→workspaceFileTreeRefreshButtonTestid 8474/8367
 *  Gv→workspaceFileTreeRowTestid 8475/8368 | Kv→sshErrorTestid 8476/8369 | qv→sshSuccessTestid 8477/8370
 *  Jv→v4SessionPaneTestid 8478/8371 | Yv→v4TimelineTestid 8479/8372 | Xv→v4RowTestid 8480/8373
 *  Zv→v4ComposerTestid 8481/8374 | Qv→v4ComposerInputTestid 8482/8375
 *  $v→v4ComposerBackgroundWorkTriggerTestid 8483/8376 | ey→v4ComposerSendTestid 8484/8377
 *  ty→v4ComposerClearQueueSendTestid 8485/8378 | ny→v4ComposerKeepQueueSendTestid 8486/8379
 *  ry→v4PausedQueueSendDialogTestid 8487/8380 | iy→v4AttachmentTestid 8488/8381
 *  ay→v4AttachmentUploadProgressTestid 8489/8382 | oy→v4AttachmentUploadRetryTestid 8490/8383
 *  sy→v4StopTestid 8491/8384 | cy→v4ForkTestid 8492/8385 | ly→v4FeedbackLikeTestid 8493/8386
 *  uy→v4FeedbackDislikeTestid 8494/8387 | dy→v4EditTestid 8495/8388 | fy→v4EditInputTestid 8496/8389
 *  py→v4EditSubmitTestid 8497/8390 | my→v4EditCancelTestid 8498/8391
 *  hy→v4EditAttachmentRemoveTestid 8499/8392 | gy→v4EditRewindWorkspaceTestid 8500/8393
 *  _y→v4EditWorkspaceConflictDialogTestid 8501/8394
 *  vy→v4EditWorkspaceConflictConversationOnlyTestid 8502/8395 | yy→v4QueueTestid 8503/8396
 *  by→v4QueuePausedBannerTestid 8504/8397 | xy→v4QueueResumeTestid 8505/8398 | Sy→v4QueueItemTestid 8506/8399
 *  Cy→v4QueueItemDeleteTestid 8507/8400 | wy→v4QueueItemEditTestid 8508/8401
 *  Ty→v4QueueItemSendNowTestid 8509/8402 | Ey→v4SessionTitleTestid 8510/8403
 *  Dy→v4BackgroundWorkItemTestid 8511/8404 | Oy→v4BackgroundWorkCancelTestid 8512/8405
 *  ky→v4ModelConfigTestid 8513/8406 | Ay→v4RetrySubscribeTestid 8514/8407
 *  jy→v4UserInputDialogTestid 8515/8408 | My→v4UserInputOptionTestid 8516/8409
 *  Ny→v4UserInputTextTestid 8517/8410 | Py→v4TimelineBottomTestid 8518/8411 | Fy→v4PaneShellTestid 8519/8412
 *  Iy→v4SplitCloseTestid 8520/8413 | Ly→v4SplitDividerTestid 8521/8414
 *  Ry→v4PaneWorkspaceBadgeTestid 8522/8415 | zy→v4TaskOpenInSplitTestid 8523/8416
 *  By→v4TurnNavigatorTestid 8524/8417 | Vy→v4TurnNavigatorItemTestid 8525/8418
 *  Hy→v4TurnNavigatorTooltipTestid 8526/8419 | Uy→v4SubagentOpenSidePaneTestid 8527/8420
 *  Wy→v4RowAttachmentsTestid 8528/8421 | Gy→automationsOpenTestid 8529/8422
 *  Ky→automationsListTestid 8530/8423 | qy→automationCreateMenuTestid 8531/8424
 *  Jy→automationCreateManuallyTestid 8532/8425 | Yy→automationCardTestid 8533/8426
 *  Xy→offpeakCreateButtonTestid 8534/8427 | Zy→offpeakCardTestid 8535/8428 | Qy→offpeakCardMenuTestid 8536/8429
 *  $y→offpeakEditViewTestid 8537/8430 | eb→offpeakEditSubmitTestid 8538/8431
 *  tb→offpeakFormTitleTestid 8539/8432 | nb→offpeakFormInstructionsTestid 8540/8433
 *  rb→offpeakActionPauseTestid 8541/8434 | ib→offpeakActionContinueTestid 8542/8435
 *  ab→offpeakActionDeleteTestid 8543/8436 | ob→offpeakTabTestid 8544/8437
 *  sb→automationCardMenuTestid 8545/8438 | cb→automationActionToggleTestid 8546/8439
 *  lb→automationActionDeleteTestid 8547/8440 | ub→automationFormTitleTestid 8548/8441
 *  db→automationFormPromptTestid 8549/8442 | fb→automationFormSubmitTestid 8550/8443
 *  pb→automationRunNowTestid 8551/8444 | mb→automationEditBackTestid 8552/8445
 *  hb→automationFrequencySelectTestid 8553/8446 | gb→automationFrequencyOptionTestid 8554/8447
 *  _b→automationCustomUnitSelectTestid 8555/8448 | vb→automationCustomUnitOptionTestid 8556/8449
 *  yb→automationCustomIntervalSelectTestid 8557/8450 | bb→automationCustomIntervalIncrementTestid 8558/8451
 *  xb→automationCustomIntervalDecrementTestid 8559/8452 | Sb→automationCustomRepeatEditTestid 8560/8453
 *  Cb→automationCustomConfirmTestid 8561/8454 | wb→automationYearMonthdayTestid 8562/8455
 *  Tb→automationYearMonthOptionTestid 8563/8456 | Eb→automationYearDayOptionTestid 8564/8457
 *  Db→automationSchedulePreviewTestid 8565/8458 | Ob→automationScheduleAddTestid 8566/8459
 *  kb→automationScheduleDeleteTestid 8567/8460 | Ab→cronCreateCardTestid 8568/8461
 *  jb→cronCreateOpenTestid 8569/8462 | Mb→confirmDialogConfirmTestid 8570/8463
 */
/* §19b testid 拼接器与 IPC 通道（jsx 8571–8628，9 项）
 *  Nb→joinTestidParts 8571/8464 | Pb→IpcChannelNames 8574/8467 | Fb→EmbeddedBrowserIpcTopics 8609/8502
 *  Ib→ServicePortIpcTopics 8612/8503 | Lb→BIGMODEL_PROVIDER_DOMAIN 8617/8508
 *  Rb→CREDENTIAL_DECRYPT_FAILED_CODE 8618/8509 | zb→isCredentialDecryptFailure 8619/8510
 *  Bb→extractErrorCode 8623/8514 | Vb→extractErrorMessage 8626/8517
 */
/* §20 coding-plan 作用域与归因（jsx 8629–8711，10 项）
 *  Hb→ZCODE_AGENT_AUDIENCE 8629/8524 | Ub→CODING_PLAN_SCOPE_PREFIX 8630/8525
 *  Wb→buildCodingPlanScope 8631/8526 | Gb→parseCodingPlanScope 8638/8533 | Kb→codingPlanScopesOverlap 8658/8545
 *  qb→encodeScopeSegment 8664/8557 | Jb→decodeScopeSegment 8667/8560
 *  Yb→resolveCodingPlanAttribution 8674/8567 | Xb→makeCodingPlanAttribution 8691/8588
 *  Zb→resolveEntitlementCacheStatus 8698/8591
 */
/* §21 浏览器恢复与远程目标净化（jsx 8712–8744，2 项）
 *  Qb→BROWSER_RESTORE_PENDING_URL 8712/8610 | $b→sanitizeRemoteTargetForRestore 8713/8611
 */
/* §22 桌面菜单动作（jsx 8745–8773，1 项）
 *  ex→DesktopMenuActionIds 8745/8631
 */
/* §23 遥测上下文（jsx 8774–8802，3 项）
 *  tx→resolveClientTelemetryContext 8774/8660 | nx→buildWebRemoteTelemetryEvent 8789/8668
 *  rx→buildWebRemoteEntryViewTelemetryEvent 8797/8671
 */
/* §24 启动标记（jsx 8803–8822，2 项）
 *  ix→LAUNCH_MARKS_STORAGE_KEY 8803/8677 | ax→parseLaunchMarks 8804/8678
 */
/* §25 uuid（jsx 8823–8843，4 项）
 *  ox→toHexByte 8823/8697 | sx→formatUuidFromBytes 8826/8700 | cx→generateUuid 8830/8710
 *  lx→newUniqueId 8841/8721
 */
/* §26 自动化分组与限制（jsx 8844–8859，8 项）
 *  ux→DEFAULT_CRON_AUTOMATION_GROUP_ID 8844/8724 | dx→DEFAULT_OFFPEAK_AUTOMATION_GROUP_ID 8845/8725
 *  fx→isCronAutomationPayload 8846/8726 | px→isOffPeakTaskPayload 8849/8729
 *  mx→AUTOMATION_CREATE_LIMIT_REACHED 8852/8732 | hx→isAutomationCreateLimitError 8853/8733
 *  gx→TERMINAL_OFFPEAK_RUN_STATUSES 8856/8736 | _x→isTerminalOffPeakRunStatus 8857/8737
 */
/* §27 低峰计划与会话模式设置（jsx 8860–8953，14 项）
 *  vx→OFFPEAK_IDLE_PLAN_ID 8860/8740 | yx→MODEL_SETTING_ID 8861/8741 | bx→MODEL_SETTING_CATEGORY 8862/8742
 *  xx→MODE_SETTING_ID 8863/8743 | Sx→MODE_SETTING_CATEGORY 8864/8744 | Cx→THOUGHT_LEVEL_SETTING_ID 8865/8745
 *  wx→THOUGHT_LEVEL_SETTING_CATEGORY 8866/8746 | Tx→SESSION_MODE_PRESETS 8867/8747
 *  Ex→SESSION_MODE_PRESET_ID_SET 8884/8765 | Dx→buildModelSettingOptionValue 8885/8766
 *  Ox→normalizeSessionModeId 8889/8770 | kx→listSessionModeOptions 8892/8773
 *  Ax→listSessionModePresets 8899/8776 | jx→buildSessionSettingsViewModel 8904/8779
 */
/* §28 稳定供应商/模型 id 与日志前缀（jsx 8954–8977，6 项）
 *  Mx→slugifyProviderName 8954/8838 | Nx→fnv1aHash32Hex 8957/8847 | Px→buildStableProviderId 8962/8852
 *  Fx→buildStableModelId 8967/8857 | Ix→formatLocalTimestamp 8972/8862 | Lx→formatLogLinePrefix 8975/8865
 */
/* §29 代理供应商就绪（jsx 8978–9008，4 项）
 *  Rx→ZCODE_AGENT_PROVIDER_NOT_READY 8978/8868 | zx→PROVIDER_NOT_READY_REASON 8979/8869
 *  Bx→providerHasUsableCredential 8980/8870 | Vx→resolveFirstReadyProvider 8994/8884
 */
/* §30 OAuth 供应商族（jsx 9009–9065，13 项）
 *  Hx→OAUTH_PROVIDER_FAMILIES 9009/8892 | Ux→OAUTH_FAMILY_BY_ID 9024/8910
 *  Wx→OAUTH_FAMILY_BY_PROVIDER_ID 9025/8911 | Gx→resolveProviderFamilyMode 9026/8916
 *  Kx→isProviderAllowedForFamilyMode 9029/8919 | qx→getOAuthProviderFamilyById 9033/8927
 *  Jx→getOAuthFamilyIdByProviderId 9036/8930 | Yx→getOAuthProviderFamilyByProviderId 9039/8933
 *  Xx→normalizeProviderFamilyDomain 9043/8937 | Zx→normalizeOAuthProviderDomain 9046/8940
 *  Qx→providerFamilyMatchesDomain 9049/8943 | $x→providerIdMatchesFamilyDomain 9053/8947
 *  eS→activeOAuthProviderMatchesFamily 9060/8951
 */
/* §31 自定义模型引用（jsx 9066–9096，4 项）
 *  tS→CUSTOM_MODEL_REF_PREFIX 9066/8954 | nS→safeDecodeURIComponent 9067/8955
 *  rS→buildCustomModelRef 9074/8962 | iS→parseCustomModelRef 9078/8966
 */
/* §32 供应商引用前缀（jsx 9097–9109，6 项）
 *  aS→NATIVE_PROVIDER_REF_PREFIX 9097/8978 | oS→CUSTOM_PROVIDER_REF_PREFIX 9098/8979
 *  sS→GHOST_PROVIDER_REF_PREFIX 9099/8980 | cS→nativeProviderRef 9100/8981 | lS→customProviderRef 9103/8984
 *  uS→resolveProviderRefFromCustomModelRef 9106/8987
 */
/* §33 运行时偏好与插件来源（jsx 9110–9127，7 项）
 *  dS→isDataBaseDirForbiddenError 9110/8991 | fS→APP_RUNTIME_PREFERENCES_STORAGE_KEY 9114/8998
 *  pS→AppRuntimePreferencesSchema 9115/8999 | mS→isUserPreferenceSource 9118/9000
 *  hS→isPluginPreferenceSource 9121/9003 | gS→OFFICIAL_PLUGIN_MARKETPLACE_IDS 9124/9006
 *  _S→isOfficialPluginMarketplace 9125/9007
 */
/* §34 行差异（LCS）统计（jsx 9128–9172，3 项）
 *  vS→LINE_DIFF_LCS_CELL_BUDGET 9128/9010 | yS→splitTextIntoLines 9129/9011 | bS→countLineDiffChanges 9135/9017
 */
/* §35 MCP 配置规范化（jsx 9173–9248，8 项）
 *  xS→readMcpServerHeaders 9173/9041 | SS→normalizeMcpServerConfigEntry 9176/9044
 *  CS→isValidPositiveTimeoutMs 9231/9082 | wS→isValidMcpIsolation 9234/9085
 *  TS→isValidMcpProtocolVersion 9237/9088 | ES→isValidMcpOAuthConfig 9240/9091
 *  DS→isPlainObjectRecord 9243/9109 | OS→resolvePlatformBinaryName 9246/9112
 */
/* §36 搜索二进制预设（jsx 9249–9272，1 项）
 *  kS→SEARCH_BINARY_PRESETS 9249/9115
 */
/* §37 工具调用状态 i18n（jsx 9273–9286，4 项）
 *  AS→PENDING_TOOL_CALL_STATUSES 9273/9133 | jS→TOOL_CALL_STATUS_I18N_IDS 9274/9134
 *  MS→isPendingToolCallStatus 9281/9141 | NS→resolveToolCallStatusI18nId 9284/9144
 */
/* §38 工具名分类（jsx 9287–9329，6 项）
 *  PS→KNOWN_TOOL_NAME_LIST 9287/9149 | FS→TOOL_VIEW_KIND_BY_NAME 9288/9153
 *  IS→TOOL_NAME_LOWERCASE_INDEX 9318/9183 | LS→canonicalizeToolName 9319/9184
 *  RS→resolveToolViewKind 9323/9188 | zS→isFileWriteToolName 9327/9192
 */
/* §39 工具输入解析（jsx 9330–9409，9 项）
 *  BS→TOOL_INPUT_KNOWN_FIELD_NAMES 9330/9195 | VS→parseToolCallInput 9331/9219 | HS→tryParseJsonValue 9348/9226
 *  US→extractKnownToolInputFields 9360/9233 | WS→extractJsonStringField 9368/9241
 *  GS→decodeExtractedJsonString 9392/9265 | KS→stripTrailingPartialEscape 9400/9273
 *  qS→unescapeJsonStringLiterals 9403/9276 | JS→escapeRegExpSource 9407/9288
 */
/* §40 待办列表提取（jsx 9410–9487，13 项）
 *  YS→TODO_TOOL_TITLE_PATTERN 9410/9291 | XS→TODO_LIST_FIELD_NAMES 9411/9292 | ZS→isPlainObjectValue 9412/9293
 *  QS→nonEmptyTrimmedString 9415/9296 | $S→normalizeTodoStatus 9418/9299 | eC→normalizeTodoEntry 9422/9303
 *  tC→tryParseTodoJson 9440/9313 | nC→extractTodoListContainer 9447/9320 | rC→parseTodoListStrict 9456/9329
 *  iC→collectTodoParseCandidates 9462/9335 | aC→isTodoToolTitle 9474/9348
 *  oC→extractTodosFromToolInput 9477/9351 | sC→extractTodosFromToolOutput 9480/9354
 */
/* §41 权限请求视图模型（jsx 9488–9631，17 项）
 *  cC→COMMAND_INPUT_FIELD_NAMES 9488/9362 | lC→COMMAND_ARGS_FIELD_NAMES 9489/9363
 *  uC→FILE_PATH_FIELD_NAMES 9490/9364 | dC→DIRECTORY_FIELD_NAMES 9491/9378
 *  fC→PERMISSION_FILE_PATH_LIMIT 9492/9379 | $→isPlainRecordValue 9493/9380 | pC→collapseWhitespace 9496/9383
 *  mC→normalizeLineEndings 9499/9386 | hC→coerceStringArray 9503/9393 | gC→unwrapToolCallPayload 9506/9406
 *  _C→extractCommandFromRecord 9509/9415 | vC→findCommandValueDeep 9524/9430 | yC→pushUniqueFilePath 9555/9461
 *  bC→collectFilePathValues 9559/9465 | xC→collectPermissionFilePaths 9576/9485
 *  SC→collectPermissionFileChanges 9599/9508 | CC→buildPermissionRequestViewModel 9614/9525
 */
/* §42 工作区键与 coding-plan 错误（jsx 9632–9636，3 项）
 *  wC→webRemoteWorkspaceKey 9632/9543 | TC→CODING_PLAN_SECURITY_VERIFICATION_REQUIRED 9635/9546
 *  EC→CODING_PLAN_SYSTEM_BUSY 9636/9547
 */
/* §43 内网/环境解析（jsx 9637–9696，11 项）
 *  DC→readProcessEnv 9637/9548 | OC→resolveIntranetMachineHost 9640/9551 | kC→INTRANET_MACHINE_HOST 9643/9554
 *  AC→INTRANET_PROBE_CONFIG 9645/9556 | jC→shouldUseTestEndpoints 9654/9567 | MC→coerceEnvRecord 9657/9570
 *  NC→isTruthyEnvFlag 9660/9573 | PC→normalizeEffectiveEnv 9665/9578 | FC→normalizeNetworkEnv 9669/9582
 *  IC→resolveEnvOverrideSignals 9673/9586 | LC→resolveRuntimeEnvMode 9688/9596
 */
/* §44 仓库快照键与本地工作区查找（jsx 9697–9712，4 项）
 *  RC→repoSnapshotStorageKey 9697/9606 | zC→repoWikiWorkspaceKey 9701/9617
 *  BC→findLocalWorkspaceIndexForward 9704/9620 | VC→findNearestLocalWorkspaceIndex 9708/9624
 */
/* §45 浏览器执行操作 schema（jsx 9713–9741，1 项）
 *  HC→BrowserExecuteOpBaseSchema 9713/9629
 */
