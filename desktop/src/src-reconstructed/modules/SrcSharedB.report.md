# SrcSharedB.report.md — B5-10b：src-HCld2afU 共享 chunk 下半部（jsx 4901–9742）全量重建

批次：**B5-10b**（与 B5-10a jsx 1–4900 互斥）
主口径：`desktop/src/src-reconstructed/renderer/assets/src-HCld2afU.jsx`（9,742 行 pretty 孪生，行号即 jsx 行号）
原件参照（只读）：`desktop/src/out/renderer/assets/src-HCld2afU.js`（10,069 行，md5 `f5edd6a1207c6d20008204829dad3923`）
产物：`SrcSharedB.tsx`（7010 行）+ 本报告

## §0 摘要

- 重建符号：**769**（var 566 + function 203），全部给出 jsx/js 双行号（§1）。
- 骨架差分审计：16 个体内分段全部 **MATCH**（去注释/去 TS 标注/语义名回改混淆名/空白归一后，与孪生对应行区逐字相等）。
- testid 常量群：**242** 项（jsx 8329–8570 / js 8222–8463），字符串值逐一与原件核对，含 ExtendedViews/GitReview 报告登记的 9+3 项（§3）。
- 文件尾对外 export 块：**412** 个别名整行收录（jsx 9742），别名→内部符号对照见 §2；其中 359 个内部符号属本批次（以语义名导出），53 个属上半（SrcSharedA 域，以原混淆名导出）。
- 上半引用：90 个 `declare const` ambient 声明（§0 头节），含 53 个上半导出内部名 + 体内引用的上半符号（含边界链 Ml/Fl/Ll/Al/Il、`no` 等）。
- 四项验证门禁全过（§5）：esbuild 0 错、tsc strict 0 错、21 个锚点回代逐字命中（≥8）、报告完整。

## §1 覆盖清单（769 符号，混淆名 → 语义名，jsx/js 双行号）

行号口径：jsx = pretty 孪生行号（主口径）；js = 原件 minified 行号。把握度指**语义命名**置信度（代码本体 769/769 经骨架审计逐字验证）：高 = 名称由字符串字面量/报告登记直接给出；中-高 = 由结构与用法归纳。

### §1 模型目录 schema 与助手（jsx 4902–5242，42 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Rl` | CatalogModelSchema | 4902 | 4787 | var | 高 |
| `zl` | CatalogProviderSchema | 4917 | 4799 | var | 高 |
| `Bl` | CatalogModelEntrySchema | 4928 | 4807 | var | 高 |
| `Vl` | ProviderSourceEnum | 4935 | 4814 | var | 高 |
| `Hl` | ProviderSystemDisabledReasonEnum | 4936 | 4815 | var | 高 |
| `Ul` | ProviderEndpointsSchema | 4937 | 4822 | var | 高 |
| `Wl` | ProviderEndpointsOverrideSchema | 4942 | 4823 | var | 高 |
| `Gl` | ProviderConfigEntryListSchema | 4970 | 4851 | var | 高 |
| `Kl` | isProviderEnabled | 5001 | 4879 | function | 中-高 |
| `ql` | isProviderReadyForUse | 5004 | 4882 | function | 中-高 |
| `Jl` | hasAnyReadyProvider | 5013 | 4894 | function | 中-高 |
| `Yl` | MODEL_CONTEXT_WINDOW_DEFAULT | 5016 | 4897 | var | 高 |
| `Xl` | MODEL_CONTEXT_WINDOW_FALLBACK | 5017 | 4898 | var | 高 |
| `Zl` | MODEL_CONTEXT_WINDOW_UNLIMITED | 5018 | 4899 | var | 高 |
| `Ql` | isUnlimitedContextModelId | 5019 | 4900 | function | 高 |
| `$l` | resolveModelContextWindow | 5022 | 4903 | function | 高 |
| `eu` | normalizeProviderId | 5028 | 4909 | function | 中-高 |
| `tu` | isObjectRecord | 5031 | 4912 | function | 高 |
| `nu` | resolveModelDisplayName | 5034 | 4915 | function | 中-高 |
| `ru` | listProviderModelIds | 5037 | 4918 | function | 中-高 |
| `iu` | findProviderModel | 5040 | 4926 | function | 中-高 |
| `au` | dedupeStrings | 5044 | 4930 | function | 中-高 |
| `ou` | mapModelFormatToKind | 5047 | 4933 | function | 高 |
| `su` | mapKindToModelFormat | 5059 | 4945 | function | 高 |
| `cu` | normalizeCatalogModel | 5069 | 4955 | function | 高 |
| `lu` | resolveProviderDefaultKind | 5110 | 4977 | function | 高 |
| `uu` | mapKindToApiFormat | 5125 | 4992 | function | 高 |
| `du` | mapApiFormatToKind | 5135 | 5002 | function | 高 |
| `fu` | mapKindToDefaultEndpointPath | 5145 | 5012 | function | 高 |
| `pu` | isHttpUrl | 5155 | 5022 | function | 高 |
| `mu` | normalizeEndpointBaseUrl | 5163 | 5030 | function | 高 |
| `hu` | joinEndpointUrlParts | 5179 | 5046 | function | 高 |
| `gu` | stripKnownEndpointPathSuffix | 5184 | 5059 | function | 高 |
| `_u` | canonicalizeEndpointUrl | 5197 | 5073 | function | 高 |
| `vu` | resolveProviderKindEndpointUrl | 5200 | 5076 | function | 高 |
| `yu` | listEndpointKinds | 5205 | 5083 | function | 高 |
| `bu` | hasOwnPropertySafe | 5210 | 5093 | function | 中-高 |
| `xu` | listEndpointApiFormats | 5213 | 5096 | function | 高 |
| `Su` | mapApiFormatToModelFormats | 5218 | 5106 | function | 高 |
| `Cu` | resolveProviderApiFormat | 5228 | 5116 | function | 高 |
| `wu` | resolveProviderPrimaryEndpointUrl | 5231 | 5131 | function | 中-高 |
| `Tu` | resolveModelSupportedKinds | 5238 | 5138 | function | 中-高 |

### §2 协议基元（jsx 5243–5292，9 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Eu` | ZCODE_PROTOCOL_NAME | 5243 | 5147 | var | 高 |
| `G` | NonEmptyTrimmedStringSchema | 5244 | 5148 | var | 高 |
| `K` | JsonObjectRecordSchema | 5245 | 5149 | var | 高 |
| `q` | NonNegativeIntegerSchema | 5246 | 5150 | var | 高 |
| `Du` | TimestampValueSchema | 5247 | 5151 | var | 高 |
| `Ou` | NodeReplImagesDisplaySchema | 5248 | 5152 | var | 高 |
| `ku` | ToolResultDisplaySchema | 5257 | 5167 | var | 高 |
| `Au` | StringOrIntegerIdSchema | 5266 | 5174 | var | 高 |
| `ju` | TraceContextSchema | 5267 | 5175 | var | 高 |

### §3 协议数据 schema（jsx 5293–5493，23 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Mu` | AgentResourceSampleSchema | 5293 | 5187 | var | 高 |
| `Nu` | MessageInputSourceEnum | 5302 | 5227 | var | 高 |
| `Pu` | SessionPersistenceEnum | 5303 | 5228 | var | 高 |
| `Fu` | PermissionOptionSchema | 5304 | 5229 | var | 高 |
| `Iu` | NameValueEntrySchema | 5311 | 5230 | var | 高 |
| `Lu` | McpOAuthConfigSchema | 5315 | 5231 | var | 高 |
| `Ru` | McpServerConfigSchema | 5329 | 5248 | var | 高 |
| `zu` | McpServerStatusSchema | 5347 | 5269 | var | 高 |
| `Bu` | McpConnectionActionEnum | 5360 | 5280 | var | 高 |
| `Vu` | ImportedHistoryMessageSchema | 5368 | 5283 | var | 高 |
| `Hu` | ImportedClaudeHistorySchema | 5373 | 5284 | var | 高 |
| `Uu` | ThoughtLevelOptionSchema | 5380 | 5291 | var | 高 |
| `Wu` | ReasoningLevelConfigSchema | 5385 | 5292 | var | 高 |
| `Gu` | AvailableModelEntrySchema | 5391 | 5298 | var | 高 |
| `Ku` | RuntimeProviderKindEnum | 5407 | 5314 | var | 高 |
| `qu` | RuntimeApiFormatEnum | 5408 | 5315 | var | 高 |
| `Ju` | RuntimeProviderSourceEnum | 5409 | 5316 | var | 高 |
| `Yu` | ApiKeyReferenceSchema | 5410 | 5317 | var | 高 |
| `Xu` | ApiKeyMaterialSchema | 5423 | 5323 | var | 高 |
| `Zu` | RuntimeModelEntrySchema | 5436 | 5329 | var | 高 |
| `Qu` | RuntimeProviderWithKeyRefSchema | 5450 | 5343 | var | 高 |
| `$u` | RuntimeProviderWithInlineKeySchema | 5467 | 5360 | var | 高 |
| `J` | RuntimeModelSelectionSchema | 5482 | 5375 | var | 高 |

### §4 供应商视图模型构建器（jsx 5494–5693，20 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `ed` | trimProviderEndpoints | 5494 | 5383 | function | 中-高 |
| `td` | resolveProviderEndpointBundle | 5505 | 5392 | function | 中-高 |
| `nd` | resolveProviderSourceBucket | 5515 | 5398 | function | 高 |
| `rd` | resolveProviderModelFormats | 5518 | 5407 | function | 中-高 |
| `id` | resolveCatalogModelEntry | 5522 | 5413 | function | 中-高 |
| `ad` | trimHeaderRecord | 5542 | 5425 | function | 中-高 |
| `od` | capitalizeLabel | 5547 | 5434 | function | 高 |
| `sd` | modelSupportsKind | 5551 | 5438 | function | 中-高 |
| `cd` | buildReasoningViewModel | 5554 | 5441 | function | 中-高 |
| `ld` | buildProviderOptionsByLevel | 5574 | 5454 | function | 中-高 |
| `ud` | providerOptionsKeyForKind | 5585 | 5463 | function | 高 |
| `dd` | buildReasoningProviderOptions | 5595 | 5473 | function | 中-高 |
| `fd` | setNestedOptionValue | 5601 | 5479 | function | 高 |
| `pd` | deleteNestedOptionValue | 5612 | 5490 | function | 高 |
| `md` | resolveModelIdForKind | 5622 | 5500 | function | 中-高 |
| `hd` | VISION_INPUT_MODALITIES | 5625 | 5503 | var | 高 |
| `gd` | isModelsDevSourcedProvider | 5626 | 5504 | function | 高 |
| `_d` | modelAcceptsVisionInput | 5629 | 5510 | function | 中-高 |
| `vd` | providerSupportsVisionModels | 5632 | 5513 | function | 中-高 |
| `yd` | buildRuntimeProviderFromConfig | 5635 | 5516 | function | 高 |

### §5 会话快照与事件载荷 schema（jsx 5694–6031，37 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `bd` | ModelCatalogSnapshotSchema | 5694 | 5570 | var | 高 |
| `xd` | TodoItemSchema | 5702 | 5578 | var | 高 |
| `Sd` | GoalStatsSchema | 5707 | 5583 | var | 高 |
| `Cd` | TodoGroupSchema | 5716 | 5592 | var | 高 |
| `wd` | SessionSettingsStateSchema | 5725 | 5601 | var | 高 |
| `Td` | PendingPermissionRequestSchema | 5746 | 5615 | var | 高 |
| `Ed` | ActiveToolCallSchema | 5757 | 5626 | var | 高 |
| `Dd` | SessionProjectionSchema | 5763 | 5632 | var | 高 |
| `Od` | SlashCommandSchema | 5783 | 5649 | var | 高 |
| `kd` | ModelStreamEventKindEnum | 5789 | 5655 | var | 高 |
| `Ad` | ModelStreamingPayloadSchema | 5790 | 5670 | var | 高 |
| `jd` | SessionSnapshotSchema | 5801 | 5681 | var | 高 |
| `Md` | SessionEventEnvelopeBaseSchema | 5816 | 5693 | var | 高 |
| `Nd` | SerializedErrorSchema | 5826 | 5729 | var | 高 |
| `Pd` | SessionCreatedPayloadSchema | 5835 | 5738 | var | 高 |
| `Fd` | SessionResumedPayloadSchema | 5839 | 5739 | var | 高 |
| `Id` | SessionTitleUpdatedPayloadSchema | 5848 | 5748 | var | 高 |
| `Ld` | TurnStartedPayloadSchema | 5855 | 5755 | var | 高 |
| `Rd` | PLAN_APPROVAL_FEEDBACK_SOURCE | 5870 | 5770 | var | 高 |
| `zd` | SteerCommandKindEnum | 5871 | 5771 | var | 高 |
| `Bd` | SteerDeliveryModeEnum | 5872 | 5772 | var | 高 |
| `Vd` | TurnSteerQueuedPayloadSchema | 5873 | 5773 | var | 高 |
| `Hd` | TurnSteerDrainedPayloadSchema | 5888 | 5788 | var | 高 |
| `Ud` | TurnCompletedPayloadSchema | 5902 | 5804 | var | 高 |
| `Wd` | TurnFailedPayloadSchema | 5918 | 5829 | var | 高 |
| `Gd` | MessageUpsertedPayloadSchema | 5923 | 5830 | var | 高 |
| `Kd` | MessageRemovedPayloadSchema | 5930 | 5837 | var | 高 |
| `qd` | PartDeltaPayloadSchema | 5934 | 5838 | var | 高 |
| `Jd` | PartSnapshotPayloadSchema | 5940 | 5844 | var | 高 |
| `Yd` | PartRemovedPayloadSchema | 5943 | 5845 | var | 高 |
| `Xd` | ToolUpdateBaseSchema | 5948 | 5846 | var | 高 |
| `Zd` | ToolUpdatedPayloadSchema | 5959 | 5857 | var | 高 |
| `Qd` | PermissionRequestedPayloadSchema | 5998 | 5891 | var | 高 |
| `$d` | PermissionResolvedPayloadSchema | 6009 | 5902 | var | 高 |
| `ef` | UserInputRequestedPayloadSchema | 6018 | 5911 | var | 高 |
| `tf` | UserInputResolvedPayloadSchema | 6024 | 5917 | var | 高 |
| `nf` | SessionClosedPayloadSchema | 6029 | 5918 | var | 高 |

### §6 会话事件联合与子代理（jsx 6032–6095，6 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Y` | sessionEvent | 6032 | 5919 | function | 中-高 |
| `rf` | SessionEventSchema | 6038 | 5922 | var | 高 |
| `af` | SubagentSessionBaseSchema | 6064 | 5973 | var | 高 |
| `of` | ActiveSubagentSchema | 6074 | 5983 | var | 高 |
| `sf` | EndedSubagentSchema | 6077 | 5984 | var | 高 |
| `cf` | WorkspaceStateSchema | 6090 | 5991 | var | 高 |

### §7 会话 RPC 请求/响应 schema（jsx 6096–6796，25 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `lf` | PREFLIGHT_PROTOCOL_VERSION | 6159 | 6062 | var | 高 |
| `uf` | ModelContextBudgetStrategyEnum | 6160 | 6063 | var | 高 |
| `df` | BrowserAmbientContextSchema | 6168 | 6071 | var | 高 |
| `ff` | GoalQueueActionEnum | 6241 | 6150 | var | 高 |
| `pf` | BackgroundTaskStatusEnum | 6255 | 6160 | var | 高 |
| `mf` | BackgroundTaskSchema | 6256 | 6161 | var | 高 |
| `hf` | WorkspaceProviderRegistrySchema | 6332 | 6224 | var | 高 |
| `gf` | ProviderRegistryApplyStatusEnum | 6337 | 6225 | var | 高 |
| `_f` | AskUserQuestionSchema | 6413 | 6306 | var | 高 |
| `vf` | CredentialPromptReasonEnum | 6440 | 6331 | var | 高 |
| `yf` | PluginConfigValueSchema | 6454 | 6342 | var | 高 |
| `bf` | PluginHookDetailSchema | 6455 | 6343 | var | 高 |
| `xf` | PluginUserConfigOptionSchema | 6469 | 6357 | var | 高 |
| `Sf` | PluginComponentGroupSchema | 6477 | 6365 | var | 高 |
| `Cf` | PluginDescriptorSchema | 6484 | 6369 | var | 高 |
| `wf` | PluginDiagnosticSchema | 6507 | 6392 | var | 高 |
| `Tf` | PluginAuthorityEntrySchema | 6519 | 6399 | var | 高 |
| `Ef` | PluginInstallScopeEnum | 6544 | 6414 | var | 高 |
| `Df` | PluginListingSchema | 6545 | 6415 | var | 高 |
| `Of` | PluginMarketplaceSchema | 6560 | 6430 | var | 高 |
| `kf` | AvailablePluginEntrySchema | 6575 | 6441 | var | 高 |
| `Af` | InstalledPluginEntrySchema | 6585 | 6451 | var | 高 |
| `jf` | AutomationScheduleRuleSchema | 6698 | 6532 | var | 高 |
| `Mf` | AutomationIntervalUnitEnum | 6709 | 6543 | var | 高 |
| `Nf` | AutomationRecordSchema | 6710 | 6544 | var | 高 |

### §8 RPC 方法目录（jsx 6797–6856，1 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Pf` | ZcodeRpcMethods | 6797 | 6651 | var | 高 |

### §9 流传输限制与 RPC 帧编解码（jsx 6857–6992，18 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Ff` | StreamRowKeySchema | 6857 | 6711 | var | 高 |
| `If` | StreamTimestampSchema | 6861 | 6712 | var | 高 |
| `Lf` | StreamTextFieldEnum | 6862 | 6713 | var | 高 |
| `Rf` | STREAM_TRANSPORT_LIMITS | 6863 | 6714 | var | 高 |
| `zf` | Base64StringSchema | 6893 | 6744 | var | 高 |
| `Bf` | crc32Hex | 6894 | 6747 | function | 高 |
| `Vf` | BASE64_ALPHABET | 6902 | 6755 | var | 高 |
| `Hf` | encodeBase64FromBytes | 6903 | 6756 | function | 高 |
| `Uf` | decodeBase64ToBytes | 6916 | 6775 | function | 高 |
| `Wf` | RPC_FRAME_LIMITS | 6932 | 6793 | var | 高 |
| `Gf` | PositiveSafeIntegerSchema | 6939 | 6800 | var | 高 |
| `Kf` | NonNegativeSafeIntegerSchema | 6940 | 6804 | var | 高 |
| `qf` | BridgeTransportIdStringSchema | 6941 | 6808 | var | 高 |
| `Jf` | RpcFrameChecksumSchema | 6947 | 6813 | var | 高 |
| `Yf` | isValidRpcFramePayload | 6951 | 6814 | function | 中-高 |
| `Xf` | RpcDataFrameSchema | 6956 | 6819 | var | 高 |
| `Zf` | RpcFrameAckSchema | 6979 | 6850 | var | 高 |
| `Qf` | RpcFramePayloadSchema | 6986 | 6857 | var | 高 |

### §10 任务流镜像与远程桥接 schema（jsx 6993–7475，54 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `X` | TaskMirrorNonEmptyString | 6993 | 6859 | var | 中-高 |
| `$f` | TASK_MODE_IDS | 6994 | 6860 | var | 高 |
| `ep` | TASK_PROVIDER_IDS | 6995 | 6872 | var | 高 |
| `tp` | TASK_MIGRATION_SOURCES | 6996 | 6873 | var | 高 |
| `np` | TaskChangeSummarySchema | 6997 | 6874 | var | 高 |
| `rp` | TaskMirrorMetaSchema | 7009 | 6888 | var | 高 |
| `ip` | automationsWorkspaceKey | 7034 | 6913 | function | 中-高 |
| `ap` | TaskMirrorInvalidationReasonEnum | 7037 | 6916 | var | 高 |
| `op` | TaskMirrorDeliveryPurposeEnum | 7038 | 6932 | var | 高 |
| `sp` | TaskMirrorDeliverySourceEnum | 7039 | 6933 | var | 高 |
| `cp` | TaskMirrorEventBaseSchema | 7040 | 6934 | var | 高 |
| `lp` | TaskMirrorStreamWatermarkSchema | 7048 | 6942 | var | 高 |
| `up` | TaskMirrorInvalidationBaseSchema | 7052 | 6943 | var | 高 |
| `dp` | assertWorkspaceKeyMatchesIdentity | 7056 | 6944 | var | 高 |
| `fp` | assertRunIdMatchesTraceId | 7064 | 6953 | var | 高 |
| `pp` | TaskSnapshotInvalidatedEventSchema | 7071 | 6957 | var | 高 |
| `mp` | WorkspaceTaskListInvalidatedEventSchema | 7075 | 6958 | var | 高 |
| `hp` | TaskMirrorAttachmentSchema | 7080 | 6965 | var | 高 |
| `gp` | TaskMirrorStreamEventSchema | 7102 | 6991 | var | 高 |
| `_p` | TaskMirrorUserMessageOpSchema | 7107 | 6992 | var | 高 |
| `vp` | TaskMirrorStreamEventOpSchema | 7114 | 6999 | var | 高 |
| `yp` | TaskMirrorStreamOpSchema | 7118 | 7000 | var | 高 |
| `bp` | TaskMirrorSequencedStreamOpSchema | 7119 | 7001 | var | 高 |
| `xp` | TaskMirrorStreamTargetSchema | 7124 | 7005 | var | 高 |
| `Sp` | TaskMirrorValidatedStreamTargetSchema | 7134 | 7015 | var | 高 |
| `Cp` | TaskStreamMirrorBatchEventSchema | 7137 | 7018 | var | 高 |
| `wp` | TaskMirrorStreamReleaseTargetSchema | 7149 | 7032 | var | 高 |
| `Tp` | TaskRunLeaseRequestSchema | 7150 | 7033 | var | 高 |
| `Ep` | TaskRunLeaseResultSchema | 7155 | 7039 | var | 高 |
| `Dp` | TaskOwnerCommandBaseSchema | 7165 | 7048 | var | 高 |
| `Op` | StopGenerationOwnerCommandSchema | 7173 | 7056 | var | 高 |
| `kp` | RespondPermissionOwnerCommandSchema | 7176 | 7057 | var | 高 |
| `Ap` | RespondElicitationOwnerCommandSchema | 7182 | 7063 | var | 高 |
| `jp` | SendPromptTaskCommandSchema | 7188 | 7069 | var | 高 |
| `Mp` | EnqueueTaskCommandSchema | 7207 | 7093 | var | 高 |
| `Np` | PromoteTaskCommandSchema | 7211 | 7094 | var | 高 |
| `Pp` | CancelTaskCommandSchema | 7216 | 7099 | var | 高 |
| `Fp` | TaskOwnerCommandSchema | 7221 | 7104 | var | 高 |
| `Ip` | TaskOwnerCommandWithRequesterSchema | 7224 | 7107 | var | 高 |
| `Lp` | TaskOwnerCommandErrorCodeEnum | 7239 | 7117 | var | 高 |
| `Rp` | TaskOwnerCommandResultSchema | 7240 | 7118 | var | 高 |
| `zp` | TaskRealtimeEventSchema | 7250 | 7122 | var | 高 |
| `Bp` | TaskRealtimeEventWithOriginSchema | 7253 | 7125 | var | 高 |
| `Z` | RemoteBridgeNonEmptyString | 7265 | 7132 | var | 中-高 |
| `Q` | RemoteBridgeTransportIdSchema | 7266 | 7133 | var | 高 |
| `Vp` | WindowControlWorkspaceListSchema | 7267 | 7134 | var | 高 |
| `Hp` | WindowControlTaskListSchema | 7290 | 7151 | var | 高 |
| `Up` | MobileBridgeFailureReasonEnum | 7306 | 7169 | var | 高 |
| `Wp` | WorkspaceBridgeDescriptorSchema | 7307 | 7182 | var | 高 |
| `Gp` | RemoteViewStateChangedSchema | 7326 | 7204 | var | 高 |
| `Kp` | RemoteDeviceInfoSchema | 7331 | 7205 | var | 高 |
| `qp` | WindowControlBootstrapResultSchema | 7352 | 7223 | var | 高 |
| `Jp` | WorkspaceListSnapshotSchema | 7359 | 7230 | var | 高 |
| `Yp` | RemotePlatformRequestMethodEnum | 7365 | 7236 | var | 高 |

### §11 远程连接目标（jsx 7476–7544，3 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Xp` | SshRemoteTargetSchema | 7476 | 7341 | var | 高 |
| `Zp` | WslRemoteTargetSchema | 7490 | 7353 | var | 高 |
| `Qp` | RemoteConnectionTargetSchema | 7495 | 7354 | var | 高 |

### §12 代理宿主命令（jsx 7545–7724，24 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `$p` | InterWindowBroadcastMessageSchema | 7545 | 7400 | var | 高 |
| `em` | RemoteAssetsConfigSchema | 7550 | 7401 | var | 高 |
| `tm` | AgentWarmupTargetSchema | 7556 | 7407 | var | 高 |
| `nm` | InitLocalAgentHostCommandSchema | 7560 | 7408 | var | 高 |
| `rm` | InitRemoteAgentHostCommandSchema | 7572 | 7420 | var | 高 |
| `im` | InitRemoteWorkspaceCommandSchema | 7577 | 7421 | var | 高 |
| `am` | InitRemoteSshHostCommandSchema | 7586 | 7430 | var | 高 |
| `om` | InitRemoteWslHostCommandSchema | 7593 | 7437 | var | 高 |
| `sm` | AttachServicePortCommandSchema | 7600 | 7444 | var | 高 |
| `cm` | DetachServicePortCommandSchema | 7605 | 7449 | var | 高 |
| `lm` | AcquireRemoteWorkspaceCommandSchema | 7609 | 7450 | var | 高 |
| `um` | ReleaseRemoteWorkspaceCommandSchema | 7616 | 7457 | var | 高 |
| `dm` | DisposeAgentHostCommandSchema | 7622 | 7463 | var | 高 |
| `fm` | BroadcastAgentHostCommandSchema | 7625 | 7464 | var | 高 |
| `pm` | TaskRealtimeDeliverCommandSchema | 7629 | 7465 | var | 高 |
| `mm` | TaskRunLeaseResultCommandSchema | 7633 | 7466 | var | 高 |
| `hm` | TaskOwnerCommandDeliverCommandSchema | 7637 | 7467 | var | 高 |
| `gm` | TaskOwnerCommandResultCommandSchema | 7641 | 7468 | var | 高 |
| `_m` | BotReconnectResultCommandSchema | 7645 | 7469 | var | 高 |
| `vm` | BotConnectionStatusResultCommandSchema | 7652 | 7476 | var | 高 |
| `ym` | BotRuntimePortResultCommandSchema | 7659 | 7483 | var | 高 |
| `bm` | SessionMessageDeliverRequestSchema | 7665 | 7489 | var | 高 |
| `xm` | SessionMessageDeliveryResultSchema | 7673 | 7497 | var | 高 |
| `Sm` | SessionRouteAnnouncePayloadSchema | 7680 | 7504 | var | 高 |

### §13 代理宿主事件（jsx 7725–7941，32 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Cm` | AgentConnectedEventSchema | 7725 | 7562 | var | 高 |
| `wm` | RemoteWorkspaceAcquiredEventSchema | 7728 | 7563 | var | 高 |
| `Tm` | AgentErrorEventSchema | 7737 | 7572 | var | 高 |
| `Em` | AgentLogEventSchema | 7741 | 7573 | var | 高 |
| `Dm` | AgentMigrationProviderEnum | 7747 | 7574 | var | 高 |
| `Om` | AgentProcessSpawnedEventSchema | 7748 | 7575 | var | 高 |
| `km` | AgentProcessReadyEventSchema | 7759 | 7586 | var | 高 |
| `Am` | AgentProcessExitedEventSchema | 7769 | 7596 | var | 高 |
| `jm` | AgentProcessErrorEventSchema | 7786 | 7613 | var | 高 |
| `Mm` | AgentResourceSampleEventSchema | 7801 | 7628 | var | 高 |
| `Nm` | AgentRunningTaskCountChangedEventSchema | 7806 | 7633 | var | 高 |
| `Pm` | WorkspaceRunningTaskCountChangedEventSchema | 7810 | 7637 | var | 高 |
| `Fm` | RepoWikiRunningTaskCountChangedEventSchema | 7816 | 7643 | var | 高 |
| `Im` | TaskRealtimePublishEventSchema | 7820 | 7647 | var | 高 |
| `Lm` | TaskStreamOpPublishEventSchema | 7824 | 7648 | var | 高 |
| `Rm` | TaskRunLeaseAcquireEventSchema | 7829 | 7649 | var | 高 |
| `zm` | TaskRunLeaseReleaseEventSchema | 7833 | 7650 | var | 高 |
| `Bm` | TaskOwnerCommandRequestEventSchema | 7837 | 7651 | var | 高 |
| `Vm` | TaskOwnerCommandResultEventSchema | 7841 | 7652 | var | 高 |
| `Hm` | BotReconnectRequestEventSchema | 7845 | 7653 | var | 高 |
| `Um` | BotConnectionStatusRequestEventSchema | 7852 | 7660 | var | 高 |
| `Wm` | BotRuntimePortRequestEventSchema | 7859 | 7667 | var | 高 |
| `Gm` | SessionMessageSendRequestedEventSchema | 7866 | 7674 | var | 高 |
| `Km` | SessionRouteAnnounceEventSchema | 7870 | 7675 | var | 高 |
| `qm` | SessionMessageDeliverResultEventSchema | 7874 | 7676 | var | 高 |
| `Jm` | FeedbackLogArchiveRequestEventSchema | 7878 | 7677 | var | 高 |
| `Ym` | CronRunResultEventSchema | 7883 | 7678 | var | 高 |
| `Xm` | OffPeakRunResultEventSchema | 7892 | 7687 | var | 高 |
| `Zm` | CronSchedulerWakeRequestEventSchema | 7901 | 7696 | var | 高 |
| `Qm` | OffPeakSchedulerWakeRequestEventSchema | 7905 | 7697 | var | 高 |
| `$m` | BrowserExecuteRequestEventSchema | 7909 | 7698 | var | 高 |
| `eh` | NetworkTelemetryObservationSchema | 7924 | 7713 | var | 高 |

### §14 任务快照 schema（jsx 7942–8133，15 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `th` | TaskSnapshotStatusEnum | 7942 | 7761 | var | 高 |
| `nh` | SnapshotAttachmentSchema | 7943 | 7762 | var | 高 |
| `rh` | SnapshotToolCallSchema | 7959 | 7781 | var | 高 |
| `ih` | SnapshotMessagePartSchema | 7976 | 7800 | var | 高 |
| `ah` | SnapshotMessageSchema | 7986 | 7805 | var | 高 |
| `oh` | GoalTargetStatusEnum | 8018 | 7839 | var | 高 |
| `sh` | GoalStateActionKindEnum | 8019 | 7840 | var | 高 |
| `ch` | GoalStateSourceEnum | 8020 | 7849 | var | 高 |
| `lh` | GoalTargetSchema | 8021 | 7850 | var | 高 |
| `uh` | TaskSnapshotMetaSchema | 8044 | 7865 | var | 高 |
| `dh` | NativeSnapshotSyncStateEnum | 8090 | 7913 | var | 高 |
| `fh` | TaskSnapshotFileKeySchema | 8097 | 7915 | var | 高 |
| `ph` | FileChangeSnapshotSchema | 8105 | 7917 | var | 高 |
| `mh` | TurnFileChangesSnapshotSchema | 8118 | 7932 | var | 高 |
| `hh` | TurnCheckpointSchema | 8123 | 7937 | var | 高 |

### §15 远程工作区键（jsx 8134–8178，7 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `gh` | REMOTE_WORKSPACE_KEY_PREFIX | 8134 | 7943 | var | 高 |
| `_h` | REMOTE_KIND_SEGMENT_COUNTS | 8135 | 7944 | var | 高 |
| `vh` | isRemoteWorkspaceKind | 8141 | 7945 | function | 高 |
| `yh` | normalizeRemoteWorkspacePath | 8144 | 7948 | function | 高 |
| `bh` | sanitizeServerIdForWorkspaceKey | 8147 | 7954 | function | 高 |
| `xh` | buildRemoteServerWorkspaceKey | 8152 | 7963 | function | 高 |
| `Sh` | parseRemoteWorkspaceKey | 8155 | 7966 | function | 高 |

### §16 消息可见性分类（jsx 8179–8244，19 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Ch` | MODEL_ONLY_VISIBILITY | 8179 | 7987 | var | 高 |
| `wh` | FORK_MESSAGE_SOURCE | 8180 | 7988 | var | 高 |
| `Th` | GOAL_CONTINUATION_REMINDER_TAG | 8181 | 7989 | var | 高 |
| `Eh` | GOAL_CONTINUATION_PROMPT_LINE | 8182 | 7990 | var | 高 |
| `Dh` | GOAL_STATE_SECTION_HEADING | 8183 | 7991 | var | 高 |
| `Oh` | TASK_NOTIFICATION_TAG | 8184 | 7992 | var | 高 |
| `kh` | SUBAGENT_NOTIFICATION_TAG | 8185 | 7993 | var | 高 |
| `Ah` | REWIND_APPLIED_NOTICE_LINES | 8186 | 7994 | var | 高 |
| `jh` | PROVIDER_ONLY_MESSAGE_SOURCES | 8187 | 7995 | var | 高 |
| `Mh` | classifyMessageVisibility | 8188 | 8014 | function | 高 |
| `Nh` | isTimelineOnlyMessage | 8206 | 8054 | function | 高 |
| `Ph` | hasProviderOnlyParts | 8214 | 8069 | function | 高 |
| `Fh` | resolveMessageSource | 8220 | 8075 | function | 中-高 |
| `Ih` | isGoalContinuationText | 8224 | 8084 | function | 高 |
| `Lh` | isQueuedNotificationText | 8228 | 8092 | function | 中-高 |
| `Rh` | collectVisiblePartText | 8232 | 8096 | function | 高 |
| `zh` | isSessionForkContextMetadata | 8235 | 8102 | function | 高 |
| `Bh` | asPlainRecord | 8239 | 8106 | function | 高 |
| `Vh` | asNonEmptyString | 8242 | 8109 | function | 高 |

### §17 目标续行与会话展示状态（jsx 8245–8308，18 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Hh` | GOAL_CONTINUATION_SYSTEM_TAG | 8245 | 8112 | var | 高 |
| `Uh` | GOAL_CONTINUATION_PROMPT | 8246 | 8113 | var | 高 |
| `Wh` | GOAL_STATE_HEADING_LINE | 8247 | 8114 | var | 高 |
| `Gh` | SUBAGENT_MESSAGE_SOURCE | 8248 | 8115 | var | 高 |
| `Kh` | isGoalContinuationContent | 8249 | 8116 | function | 高 |
| `qh` | isGoalContinuationMessage | 8253 | 8120 | function | 高 |
| `Jh` | isGoalStateContent | 8256 | 8128 | function | 高 |
| `Yh` | isGoalStateMessage | 8260 | 8132 | function | 高 |
| `Xh` | isMessageHiddenFromUser | 8263 | 8135 | function | 高 |
| `Zh` | isCompactionTimelineMessage | 8268 | 8146 | function | 高 |
| `Qh` | filterUserVisibleMessages | 8271 | 8154 | function | 中-高 |
| `$h` | resolveSessionDisplayTitle | 8276 | 8159 | function | 高 |
| `eg` | mapSubagentStatusToDisplayStatus | 8284 | 8170 | function | 高 |
| `tg` | hasSessionActiveWork | 8289 | 8175 | function | 高 |
| `ng` | isSessionBusy | 8292 | 8184 | function | 中-高 |
| `rg` | isToolCallsFinishReason | 8295 | 8187 | function | 高 |
| `ig` | isSessionAssistantCompleted | 8298 | 8190 | function | 高 |
| `ag` | resolveSessionDisplayStatus | 8304 | 8196 | function | 高 |

### §18 testid 前置 schema（jsx 8309–8328，1 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `og` | WorkspacePathOptionSchema | 8309 | 8207 | var | 高 |

### §19 testid 常量群（242 项）（jsx 8329–8570，242 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `sg` | loginTriggerTestid | 8329 | 8222 | var | 高 |
| `cg` | loginMenuItemTestid | 8330 | 8223 | var | 高 |
| `lg` | loginUseApiKeyButtonTestid | 8331 | 8224 | var | 高 |
| `ug` | loginApiKeyProviderTriggerTestid | 8332 | 8225 | var | 高 |
| `dg` | loginApiKeyProviderItemTestid | 8333 | 8226 | var | 高 |
| `fg` | loginApiKeyInputTestid | 8334 | 8227 | var | 高 |
| `pg` | loginApiKeyContinueButtonTestid | 8335 | 8228 | var | 高 |
| `mg` | loginApiKeyCancelButtonTestid | 8336 | 8229 | var | 高 |
| `hg` | loginApiKeySkipButtonTestid | 8337 | 8230 | var | 高 |
| `gg` | loginApiKeyErrorTestid | 8338 | 8231 | var | 高 |
| `_g` | oauthLoginButtonTestid | 8339 | 8232 | var | 高 |
| `vg` | oauthCancelTestid | 8340 | 8233 | var | 高 |
| `yg` | oauthErrorTestid | 8341 | 8234 | var | 高 |
| `bg` | appHeaderTestid | 8342 | 8235 | var | 高 |
| `xg` | logoutButtonTestid | 8343 | 8236 | var | 高 |
| `Sg` | terminalToggleTestid | 8344 | 8237 | var | 高 |
| `Cg` | terminalCloseButtonTestid | 8345 | 8238 | var | 高 |
| `wg` | gitPaneTestid | 8346 | 8239 | var | 高 |
| `Tg` | browserAddressInputTestid | 8347 | 8240 | var | 高 |
| `Eg` | browserBackButtonTestid | 8348 | 8241 | var | 高 |
| `Dg` | browserForwardButtonTestid | 8349 | 8242 | var | 高 |
| `Og` | browserRefreshButtonTestid | 8350 | 8243 | var | 高 |
| `kg` | browserResponsiveButtonTestid | 8351 | 8244 | var | 高 |
| `Ag` | browserResponsiveViewportTestid | 8352 | 8245 | var | 高 |
| `jg` | browserResponsiveToolbarTestid | 8353 | 8246 | var | 高 |
| `Mg` | browserResponsiveWidthInputTestid | 8354 | 8247 | var | 高 |
| `Ng` | browserResponsiveHeightInputTestid | 8355 | 8248 | var | 高 |
| `Pg` | browserResponsiveZoomSelectTestid | 8356 | 8249 | var | 高 |
| `Fg` | browserResponsiveZoomOptionTestid | 8357 | 8250 | var | 高 |
| `Ig` | browserResponsiveScaledFrameTestid | 8358 | 8251 | var | 高 |
| `Lg` | browserResponsiveResizeLeftTestid | 8359 | 8252 | var | 高 |
| `Rg` | browserResponsiveResizeWidthTestid | 8360 | 8253 | var | 高 |
| `zg` | browserResponsiveResizeTopTestid | 8361 | 8254 | var | 高 |
| `Bg` | browserResponsiveResizeHeightTestid | 8362 | 8255 | var | 高 |
| `Vg` | browserResponsiveResizeCornerTopLeftTestid | 8363 | 8256 | var | 高 |
| `Hg` | browserResponsiveResizeCornerTopRightTestid | 8364 | 8257 | var | 高 |
| `Ug` | browserResponsiveResizeCornerBottomLeftTestid | 8365 | 8258 | var | 高 |
| `Wg` | browserResponsiveResizeCornerTestid | 8366 | 8259 | var | 高 |
| `Gg` | browserElementPickerButtonTestid | 8367 | 8260 | var | 高 |
| `Kg` | browserMoreButtonTestid | 8368 | 8261 | var | 高 |
| `qg` | browserOpenExternalItemTestid | 8369 | 8262 | var | 高 |
| `Jg` | browserDevtoolsButtonTestid | 8370 | 8263 | var | 高 |
| `Yg` | browserWebviewTestid | 8371 | 8264 | var | 高 |
| `Xg` | previewPaneTestid | 8372 | 8265 | var | 高 |
| `Zg` | toolSummaryTriggerTestid | 8373 | 8266 | var | 高 |
| `Qg` | terminalTestid | 8374 | 8267 | var | 高 |
| `$g` | sshConnectTriggerTestid | 8375 | 8268 | var | 高 |
| `e_` | sshDialogTestid | 8376 | 8269 | var | 高 |
| `t_` | remoteKindSshTestid | 8377 | 8270 | var | 高 |
| `n_` | remoteKindServerTestid | 8378 | 8271 | var | 高 |
| `r_` | remoteKindWslTestid | 8379 | 8272 | var | 高 |
| `i_` | remoteKindDockerTestid | 8380 | 8273 | var | 高 |
| `a_` | sshHostInputTestid | 8381 | 8274 | var | 高 |
| `o_` | sshPortInputTestid | 8382 | 8275 | var | 高 |
| `s_` | sshUsernameInputTestid | 8383 | 8276 | var | 高 |
| `c_` | sshConfigAliasSelectTestid | 8384 | 8277 | var | 高 |
| `l_` | sshPasswordInputTestid | 8385 | 8278 | var | 高 |
| `u_` | sshPrivateKeyInputTestid | 8386 | 8279 | var | 高 |
| `d_` | sshAuthPasswordTestid | 8387 | 8280 | var | 高 |
| `f_` | sshAuthPrivateKeyTestid | 8388 | 8281 | var | 高 |
| `p_` | wslDistroSelectTestid | 8389 | 8282 | var | 高 |
| `m_` | wslUserInputTestid | 8390 | 8283 | var | 高 |
| `h_` | dockerContainerSelectTestid | 8391 | 8284 | var | 高 |
| `g_` | dockerContainerInputTestid | 8392 | 8285 | var | 高 |
| `__` | serverUrlInputTestid | 8393 | 8286 | var | 高 |
| `v_` | serverNameInputTestid | 8394 | 8287 | var | 高 |
| `y_` | serverTokenInputTestid | 8395 | 8288 | var | 高 |
| `b_` | serverWorkspacePathInputTestid | 8396 | 8289 | var | 高 |
| `x_` | sidebarTestid | 8397 | 8290 | var | 高 |
| `S_` | workspaceListTestid | 8398 | 8291 | var | 高 |
| `C_` | workspaceItemTestid | 8399 | 8292 | var | 高 |
| `w_` | workspaceCloseTestid | 8400 | 8293 | var | 高 |
| `T_` | conversationSectionTestid | 8401 | 8294 | var | 高 |
| `E_` | projectSectionTestid | 8402 | 8295 | var | 高 |
| `D_` | conversationNewTaskTestid | 8403 | 8296 | var | 高 |
| `O_` | projectAddTestid | 8404 | 8297 | var | 高 |
| `k_` | composerWorkspaceTriggerTestid | 8405 | 8298 | var | 高 |
| `A_` | composerRemoteConnectionTestid | 8406 | 8299 | var | 高 |
| `j_` | composerProjectDetachTestid | 8407 | 8300 | var | 高 |
| `M_` | composerWorkOutsideProjectTestid | 8408 | 8301 | var | 高 |
| `N_` | chatErrorBannerTestid | 8409 | 8302 | var | 高 |
| `P_` | chatEmptyTestid | 8410 | 8303 | var | 高 |
| `F_` | chatAttachmentButtonTestid | 8411 | 8304 | var | 高 |
| `I_` | chatAttachmentMenuItemTestid | 8412 | 8305 | var | 高 |
| `L_` | chatSendButtonTestid | 8413 | 8306 | var | 高 |
| `R_` | chatLoadingTestid | 8414 | 8307 | var | 高 |
| `z_` | chatSummaryPanelTestid | 8415 | 8308 | var | 高 |
| `B_` | chatAssistantHistoryTriggerTestid | 8416 | 8309 | var | 高 |
| `V_` | chatAssistantHistoryContentTestid | 8417 | 8310 | var | 高 |
| `H_` | chatBackgroundResultTitleTestid | 8418 | 8311 | var | 高 |
| `U_` | chatToolCallBlockTestid | 8419 | 8312 | var | 高 |
| `W_` | promptSuggestionPanelTestid | 8420 | 8313 | var | 高 |
| `G_` | promptSuggestionSectionTestid | 8421 | 8314 | var | 高 |
| `K_` | promptSuggestionOptionTestid | 8422 | 8315 | var | 高 |
| `q_` | promptSuggestionStatusTestid | 8423 | 8316 | var | 高 |
| `J_` | taskListTestid | 8424 | 8317 | var | 高 |
| `Y_` | taskNewButtonTestid | 8425 | 8318 | var | 高 |
| `X_` | taskItemTestid | 8426 | 8319 | var | 高 |
| `Z_` | taskEmptyTestid | 8427 | 8320 | var | 高 |
| `Q_` | taskArchiveTestid | 8428 | 8321 | var | 高 |
| `$_` | taskSettingsButtonTestid | 8429 | 8322 | var | 高 |
| `ev` | settingsPageTestid | 8430 | 8323 | var | 高 |
| `tv` | settingsBackButtonTestid | 8431 | 8324 | var | 高 |
| `nv` | settingsSectionNavTestid | 8432 | 8325 | var | 高 |
| `rv` | settingsNativeSearchSwitchTestid | 8433 | 8326 | var | 高 |
| `iv` | settingsMemorySwitchTestid | 8434 | 8327 | var | 高 |
| `av` | settingsMemoryRefreshTestid | 8435 | 8328 | var | 高 |
| `ov` | settingsMemoryBackProjectsTestid | 8436 | 8329 | var | 高 |
| `sv` | settingsMemoryBackMemoriesTestid | 8437 | 8330 | var | 高 |
| `cv` | settingsMemoryWorkspaceTestid | 8438 | 8331 | var | 高 |
| `lv` | settingsMemoryFileTestid | 8439 | 8332 | var | 高 |
| `uv` | settingsMemoryPreviewTestid | 8440 | 8333 | var | 高 |
| `dv` | settingsAskUserQuestionAutoResolutionSwitchTestid | 8441 | 8334 | var | 高 |
| `fv` | settingsLocaleSelectTriggerTestid | 8442 | 8335 | var | 高 |
| `pv` | settingsLocaleSelectItemTestid | 8443 | 8336 | var | 高 |
| `mv` | mcpServerRowTestid | 8444 | 8337 | var | 高 |
| `hv` | pluginMcpServerRowTestid | 8445 | 8338 | var | 高 |
| `gv` | mcpOpenAuthorizationButtonTestid | 8446 | 8339 | var | 高 |
| `_v` | subagentRowTestid | 8447 | 8340 | var | 高 |
| `vv` | subagentBuiltInModelTriggerTestid | 8448 | 8341 | var | 高 |
| `yv` | settingsUsageTabTestid | 8449 | 8342 | var | 高 |
| `bv` | sidebarCodingPlanUsageButtonTestid | 8450 | 8343 | var | 高 |
| `xv` | modelProviderNavItemTestid | 8451 | 8344 | var | 高 |
| `Sv` | modelProviderConnectionModeTriggerTestid | 8452 | 8345 | var | 高 |
| `Cv` | modelProviderConnectionModeItemTestid | 8453 | 8346 | var | 高 |
| `wv` | modelProviderApiKeyInputTestid | 8454 | 8347 | var | 高 |
| `Tv` | modelProviderModelInputTestid | 8455 | 8348 | var | 高 |
| `Ev` | modelProviderModelDeleteButtonTestid | 8456 | 8349 | var | 高 |
| `Dv` | modelProviderAddModelButtonTestid | 8457 | 8350 | var | 高 |
| `Ov` | chatModelSelectTriggerTestid | 8458 | 8351 | var | 高 |
| `kv` | chatModelSelectGroupTestid | 8459 | 8352 | var | 高 |
| `Av` | chatModelSelectItemTestid | 8460 | 8353 | var | 高 |
| `jv` | chatThoughtLevelSelectTriggerTestid | 8461 | 8354 | var | 高 |
| `Mv` | chatThoughtLevelSelectItemTestid | 8462 | 8355 | var | 高 |
| `Nv` | chatModeSelectTriggerTestid | 8463 | 8356 | var | 高 |
| `Pv` | chatModeSelectItemTestid | 8464 | 8357 | var | 高 |
| `Fv` | chatContextUsageTriggerTestid | 8465 | 8358 | var | 高 |
| `Iv` | chatReasoningTriggerTestid | 8466 | 8359 | var | 高 |
| `Lv` | chatReasoningContentTestid | 8467 | 8360 | var | 高 |
| `Rv` | workspaceHeaderTestid | 8468 | 8361 | var | 高 |
| `zv` | workspaceTitleTestid | 8469 | 8362 | var | 高 |
| `Bv` | workspacePathTestid | 8470 | 8363 | var | 高 |
| `Vv` | workspaceMoreButtonTestid | 8471 | 8364 | var | 高 |
| `Hv` | workspaceFileTreeButtonTestid | 8472 | 8365 | var | 高 |
| `Uv` | workspaceFileTreePanelTestid | 8473 | 8366 | var | 高 |
| `Wv` | workspaceFileTreeRefreshButtonTestid | 8474 | 8367 | var | 高 |
| `Gv` | workspaceFileTreeRowTestid | 8475 | 8368 | var | 高 |
| `Kv` | sshErrorTestid | 8476 | 8369 | var | 高 |
| `qv` | sshSuccessTestid | 8477 | 8370 | var | 高 |
| `Jv` | v4SessionPaneTestid | 8478 | 8371 | var | 高 |
| `Yv` | v4TimelineTestid | 8479 | 8372 | var | 高 |
| `Xv` | v4RowTestid | 8480 | 8373 | var | 高 |
| `Zv` | v4ComposerTestid | 8481 | 8374 | var | 高 |
| `Qv` | v4ComposerInputTestid | 8482 | 8375 | var | 高 |
| `$v` | v4ComposerBackgroundWorkTriggerTestid | 8483 | 8376 | var | 高 |
| `ey` | v4ComposerSendTestid | 8484 | 8377 | var | 高 |
| `ty` | v4ComposerClearQueueSendTestid | 8485 | 8378 | var | 高 |
| `ny` | v4ComposerKeepQueueSendTestid | 8486 | 8379 | var | 高 |
| `ry` | v4PausedQueueSendDialogTestid | 8487 | 8380 | var | 高 |
| `iy` | v4AttachmentTestid | 8488 | 8381 | var | 高 |
| `ay` | v4AttachmentUploadProgressTestid | 8489 | 8382 | var | 高 |
| `oy` | v4AttachmentUploadRetryTestid | 8490 | 8383 | var | 高 |
| `sy` | v4StopTestid | 8491 | 8384 | var | 高 |
| `cy` | v4ForkTestid | 8492 | 8385 | var | 高 |
| `ly` | v4FeedbackLikeTestid | 8493 | 8386 | var | 高 |
| `uy` | v4FeedbackDislikeTestid | 8494 | 8387 | var | 高 |
| `dy` | v4EditTestid | 8495 | 8388 | var | 高 |
| `fy` | v4EditInputTestid | 8496 | 8389 | var | 高 |
| `py` | v4EditSubmitTestid | 8497 | 8390 | var | 高 |
| `my` | v4EditCancelTestid | 8498 | 8391 | var | 高 |
| `hy` | v4EditAttachmentRemoveTestid | 8499 | 8392 | var | 高 |
| `gy` | v4EditRewindWorkspaceTestid | 8500 | 8393 | var | 高 |
| `_y` | v4EditWorkspaceConflictDialogTestid | 8501 | 8394 | var | 高 |
| `vy` | v4EditWorkspaceConflictConversationOnlyTestid | 8502 | 8395 | var | 高 |
| `yy` | v4QueueTestid | 8503 | 8396 | var | 高 |
| `by` | v4QueuePausedBannerTestid | 8504 | 8397 | var | 高 |
| `xy` | v4QueueResumeTestid | 8505 | 8398 | var | 高 |
| `Sy` | v4QueueItemTestid | 8506 | 8399 | var | 高 |
| `Cy` | v4QueueItemDeleteTestid | 8507 | 8400 | var | 高 |
| `wy` | v4QueueItemEditTestid | 8508 | 8401 | var | 高 |
| `Ty` | v4QueueItemSendNowTestid | 8509 | 8402 | var | 高 |
| `Ey` | v4SessionTitleTestid | 8510 | 8403 | var | 高 |
| `Dy` | v4BackgroundWorkItemTestid | 8511 | 8404 | var | 高 |
| `Oy` | v4BackgroundWorkCancelTestid | 8512 | 8405 | var | 高 |
| `ky` | v4ModelConfigTestid | 8513 | 8406 | var | 高 |
| `Ay` | v4RetrySubscribeTestid | 8514 | 8407 | var | 高 |
| `jy` | v4UserInputDialogTestid | 8515 | 8408 | var | 高 |
| `My` | v4UserInputOptionTestid | 8516 | 8409 | var | 高 |
| `Ny` | v4UserInputTextTestid | 8517 | 8410 | var | 高 |
| `Py` | v4TimelineBottomTestid | 8518 | 8411 | var | 高 |
| `Fy` | v4PaneShellTestid | 8519 | 8412 | var | 高 |
| `Iy` | v4SplitCloseTestid | 8520 | 8413 | var | 高 |
| `Ly` | v4SplitDividerTestid | 8521 | 8414 | var | 高 |
| `Ry` | v4PaneWorkspaceBadgeTestid | 8522 | 8415 | var | 高 |
| `zy` | v4TaskOpenInSplitTestid | 8523 | 8416 | var | 高 |
| `By` | v4TurnNavigatorTestid | 8524 | 8417 | var | 高 |
| `Vy` | v4TurnNavigatorItemTestid | 8525 | 8418 | var | 高 |
| `Hy` | v4TurnNavigatorTooltipTestid | 8526 | 8419 | var | 高 |
| `Uy` | v4SubagentOpenSidePaneTestid | 8527 | 8420 | var | 高 |
| `Wy` | v4RowAttachmentsTestid | 8528 | 8421 | var | 高 |
| `Gy` | automationsOpenTestid | 8529 | 8422 | var | 高 |
| `Ky` | automationsListTestid | 8530 | 8423 | var | 高 |
| `qy` | automationCreateMenuTestid | 8531 | 8424 | var | 高 |
| `Jy` | automationCreateManuallyTestid | 8532 | 8425 | var | 高 |
| `Yy` | automationCardTestid | 8533 | 8426 | var | 高 |
| `Xy` | offpeakCreateButtonTestid | 8534 | 8427 | var | 高 |
| `Zy` | offpeakCardTestid | 8535 | 8428 | var | 高 |
| `Qy` | offpeakCardMenuTestid | 8536 | 8429 | var | 高 |
| `$y` | offpeakEditViewTestid | 8537 | 8430 | var | 高 |
| `eb` | offpeakEditSubmitTestid | 8538 | 8431 | var | 高 |
| `tb` | offpeakFormTitleTestid | 8539 | 8432 | var | 高 |
| `nb` | offpeakFormInstructionsTestid | 8540 | 8433 | var | 高 |
| `rb` | offpeakActionPauseTestid | 8541 | 8434 | var | 高 |
| `ib` | offpeakActionContinueTestid | 8542 | 8435 | var | 高 |
| `ab` | offpeakActionDeleteTestid | 8543 | 8436 | var | 高 |
| `ob` | offpeakTabTestid | 8544 | 8437 | var | 高 |
| `sb` | automationCardMenuTestid | 8545 | 8438 | var | 高 |
| `cb` | automationActionToggleTestid | 8546 | 8439 | var | 高 |
| `lb` | automationActionDeleteTestid | 8547 | 8440 | var | 高 |
| `ub` | automationFormTitleTestid | 8548 | 8441 | var | 高 |
| `db` | automationFormPromptTestid | 8549 | 8442 | var | 高 |
| `fb` | automationFormSubmitTestid | 8550 | 8443 | var | 高 |
| `pb` | automationRunNowTestid | 8551 | 8444 | var | 高 |
| `mb` | automationEditBackTestid | 8552 | 8445 | var | 高 |
| `hb` | automationFrequencySelectTestid | 8553 | 8446 | var | 高 |
| `gb` | automationFrequencyOptionTestid | 8554 | 8447 | var | 高 |
| `_b` | automationCustomUnitSelectTestid | 8555 | 8448 | var | 高 |
| `vb` | automationCustomUnitOptionTestid | 8556 | 8449 | var | 高 |
| `yb` | automationCustomIntervalSelectTestid | 8557 | 8450 | var | 高 |
| `bb` | automationCustomIntervalIncrementTestid | 8558 | 8451 | var | 高 |
| `xb` | automationCustomIntervalDecrementTestid | 8559 | 8452 | var | 高 |
| `Sb` | automationCustomRepeatEditTestid | 8560 | 8453 | var | 高 |
| `Cb` | automationCustomConfirmTestid | 8561 | 8454 | var | 高 |
| `wb` | automationYearMonthdayTestid | 8562 | 8455 | var | 高 |
| `Tb` | automationYearMonthOptionTestid | 8563 | 8456 | var | 高 |
| `Eb` | automationYearDayOptionTestid | 8564 | 8457 | var | 高 |
| `Db` | automationSchedulePreviewTestid | 8565 | 8458 | var | 高 |
| `Ob` | automationScheduleAddTestid | 8566 | 8459 | var | 高 |
| `kb` | automationScheduleDeleteTestid | 8567 | 8460 | var | 高 |
| `Ab` | cronCreateCardTestid | 8568 | 8461 | var | 高 |
| `jb` | cronCreateOpenTestid | 8569 | 8462 | var | 高 |
| `Mb` | confirmDialogConfirmTestid | 8570 | 8463 | var | 高 |

### §19b testid 拼接器与 IPC 通道（jsx 8571–8628，9 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Nb` | joinTestidParts | 8571 | 8464 | function | 高 |
| `Pb` | IpcChannelNames | 8574 | 8467 | var | 高 |
| `Fb` | EmbeddedBrowserIpcTopics | 8609 | 8502 | var | 高 |
| `Ib` | ServicePortIpcTopics | 8612 | 8503 | var | 高 |
| `Lb` | BIGMODEL_PROVIDER_DOMAIN | 8617 | 8508 | var | 高 |
| `Rb` | CREDENTIAL_DECRYPT_FAILED_CODE | 8618 | 8509 | var | 高 |
| `zb` | isCredentialDecryptFailure | 8619 | 8510 | function | 高 |
| `Bb` | extractErrorCode | 8623 | 8514 | function | 高 |
| `Vb` | extractErrorMessage | 8626 | 8517 | function | 高 |

### §20 coding-plan 作用域与归因（jsx 8629–8711，10 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Hb` | ZCODE_AGENT_AUDIENCE | 8629 | 8524 | var | 高 |
| `Ub` | CODING_PLAN_SCOPE_PREFIX | 8630 | 8525 | var | 高 |
| `Wb` | buildCodingPlanScope | 8631 | 8526 | function | 高 |
| `Gb` | parseCodingPlanScope | 8638 | 8533 | function | 高 |
| `Kb` | codingPlanScopesOverlap | 8658 | 8545 | function | 高 |
| `qb` | encodeScopeSegment | 8664 | 8557 | function | 中-高 |
| `Jb` | decodeScopeSegment | 8667 | 8560 | function | 中-高 |
| `Yb` | resolveCodingPlanAttribution | 8674 | 8567 | function | 高 |
| `Xb` | makeCodingPlanAttribution | 8691 | 8588 | function | 中-高 |
| `Zb` | resolveEntitlementCacheStatus | 8698 | 8591 | function | 高 |

### §21 浏览器恢复与远程目标净化（jsx 8712–8744，2 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Qb` | BROWSER_RESTORE_PENDING_URL | 8712 | 8610 | var | 高 |
| `$b` | sanitizeRemoteTargetForRestore | 8713 | 8611 | function | 高 |

### §22 桌面菜单动作（jsx 8745–8773，1 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `ex` | DesktopMenuActionIds | 8745 | 8631 | var | 高 |

### §23 遥测上下文（jsx 8774–8802，3 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `tx` | resolveClientTelemetryContext | 8774 | 8660 | function | 高 |
| `nx` | buildWebRemoteTelemetryEvent | 8789 | 8668 | function | 高 |
| `rx` | buildWebRemoteEntryViewTelemetryEvent | 8797 | 8671 | function | 高 |

### §24 启动标记（jsx 8803–8822，2 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `ix` | LAUNCH_MARKS_STORAGE_KEY | 8803 | 8677 | var | 高 |
| `ax` | parseLaunchMarks | 8804 | 8678 | function | 高 |

### §25 uuid（jsx 8823–8843，4 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `ox` | toHexByte | 8823 | 8697 | function | 高 |
| `sx` | formatUuidFromBytes | 8826 | 8700 | function | 高 |
| `cx` | generateUuid | 8830 | 8710 | function | 中-高 |
| `lx` | newUniqueId | 8841 | 8721 | function | 中-高 |

### §26 自动化分组与限制（jsx 8844–8859，8 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `ux` | DEFAULT_CRON_AUTOMATION_GROUP_ID | 8844 | 8724 | var | 高 |
| `dx` | DEFAULT_OFFPEAK_AUTOMATION_GROUP_ID | 8845 | 8725 | var | 高 |
| `fx` | isCronAutomationPayload | 8846 | 8726 | function | 中-高 |
| `px` | isOffPeakTaskPayload | 8849 | 8729 | function | 中-高 |
| `mx` | AUTOMATION_CREATE_LIMIT_REACHED | 8852 | 8732 | var | 高 |
| `hx` | isAutomationCreateLimitError | 8853 | 8733 | function | 高 |
| `gx` | TERMINAL_OFFPEAK_RUN_STATUSES | 8856 | 8736 | var | 高 |
| `_x` | isTerminalOffPeakRunStatus | 8857 | 8737 | function | 中-高 |

### §27 低峰计划与会话模式设置（jsx 8860–8953，14 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `vx` | OFFPEAK_IDLE_PLAN_ID | 8860 | 8740 | var | 高 |
| `yx` | MODEL_SETTING_ID | 8861 | 8741 | var | 高 |
| `bx` | MODEL_SETTING_CATEGORY | 8862 | 8742 | var | 高 |
| `xx` | MODE_SETTING_ID | 8863 | 8743 | var | 高 |
| `Sx` | MODE_SETTING_CATEGORY | 8864 | 8744 | var | 高 |
| `Cx` | THOUGHT_LEVEL_SETTING_ID | 8865 | 8745 | var | 高 |
| `wx` | THOUGHT_LEVEL_SETTING_CATEGORY | 8866 | 8746 | var | 高 |
| `Tx` | SESSION_MODE_PRESETS | 8867 | 8747 | var | 高 |
| `Ex` | SESSION_MODE_PRESET_ID_SET | 8884 | 8765 | var | 高 |
| `Dx` | buildModelSettingOptionValue | 8885 | 8766 | function | 高 |
| `Ox` | normalizeSessionModeId | 8889 | 8770 | function | 高 |
| `kx` | listSessionModeOptions | 8892 | 8773 | function | 中-高 |
| `Ax` | listSessionModePresets | 8899 | 8776 | function | 中-高 |
| `jx` | buildSessionSettingsViewModel | 8904 | 8779 | function | 高 |

### §28 稳定供应商/模型 id 与日志前缀（jsx 8954–8977，6 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Mx` | slugifyProviderName | 8954 | 8838 | function | 高 |
| `Nx` | fnv1aHash32Hex | 8957 | 8847 | function | 高 |
| `Px` | buildStableProviderId | 8962 | 8852 | function | 高 |
| `Fx` | buildStableModelId | 8967 | 8857 | function | 高 |
| `Ix` | formatLocalTimestamp | 8972 | 8862 | function | 高 |
| `Lx` | formatLogLinePrefix | 8975 | 8865 | function | 高 |

### §29 代理供应商就绪（jsx 8978–9008，4 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Rx` | ZCODE_AGENT_PROVIDER_NOT_READY | 8978 | 8868 | var | 高 |
| `zx` | PROVIDER_NOT_READY_REASON | 8979 | 8869 | var | 高 |
| `Bx` | providerHasUsableCredential | 8980 | 8870 | function | 高 |
| `Vx` | resolveFirstReadyProvider | 8994 | 8884 | function | 中-高 |

### §30 OAuth 供应商族（jsx 9009–9065，13 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `Hx` | OAUTH_PROVIDER_FAMILIES | 9009 | 8892 | var | 高 |
| `Ux` | OAUTH_FAMILY_BY_ID | 9024 | 8910 | var | 高 |
| `Wx` | OAUTH_FAMILY_BY_PROVIDER_ID | 9025 | 8911 | var | 高 |
| `Gx` | resolveProviderFamilyMode | 9026 | 8916 | function | 高 |
| `Kx` | isProviderAllowedForFamilyMode | 9029 | 8919 | function | 高 |
| `qx` | getOAuthProviderFamilyById | 9033 | 8927 | function | 中-高 |
| `Jx` | getOAuthFamilyIdByProviderId | 9036 | 8930 | function | 中-高 |
| `Yx` | getOAuthProviderFamilyByProviderId | 9039 | 8933 | function | 中-高 |
| `Xx` | normalizeProviderFamilyDomain | 9043 | 8937 | function | 高 |
| `Zx` | normalizeOAuthProviderDomain | 9046 | 8940 | function | 高 |
| `Qx` | providerFamilyMatchesDomain | 9049 | 8943 | function | 中-高 |
| `$x` | providerIdMatchesFamilyDomain | 9053 | 8947 | function | 中-高 |
| `eS` | activeOAuthProviderMatchesFamily | 9060 | 8951 | function | 中-高 |

### §31 自定义模型引用（jsx 9066–9096，4 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `tS` | CUSTOM_MODEL_REF_PREFIX | 9066 | 8954 | var | 高 |
| `nS` | safeDecodeURIComponent | 9067 | 8955 | function | 中-高 |
| `rS` | buildCustomModelRef | 9074 | 8962 | function | 高 |
| `iS` | parseCustomModelRef | 9078 | 8966 | function | 高 |

### §32 供应商引用前缀（jsx 9097–9109，6 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `aS` | NATIVE_PROVIDER_REF_PREFIX | 9097 | 8978 | var | 高 |
| `oS` | CUSTOM_PROVIDER_REF_PREFIX | 9098 | 8979 | var | 高 |
| `sS` | GHOST_PROVIDER_REF_PREFIX | 9099 | 8980 | var | 高 |
| `cS` | nativeProviderRef | 9100 | 8981 | function | 高 |
| `lS` | customProviderRef | 9103 | 8984 | function | 高 |
| `uS` | resolveProviderRefFromCustomModelRef | 9106 | 8987 | function | 高 |

### §33 运行时偏好与插件来源（jsx 9110–9127，7 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `dS` | isDataBaseDirForbiddenError | 9110 | 8991 | function | 高 |
| `fS` | APP_RUNTIME_PREFERENCES_STORAGE_KEY | 9114 | 8998 | var | 高 |
| `pS` | AppRuntimePreferencesSchema | 9115 | 8999 | var | 高 |
| `mS` | isUserPreferenceSource | 9118 | 9000 | function | 高 |
| `hS` | isPluginPreferenceSource | 9121 | 9003 | function | 高 |
| `gS` | OFFICIAL_PLUGIN_MARKETPLACE_IDS | 9124 | 9006 | var | 高 |
| `_S` | isOfficialPluginMarketplace | 9125 | 9007 | function | 中-高 |

### §34 行差异（LCS）统计（jsx 9128–9172，3 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `vS` | LINE_DIFF_LCS_CELL_BUDGET | 9128 | 9010 | var | 高 |
| `yS` | splitTextIntoLines | 9129 | 9011 | function | 高 |
| `bS` | countLineDiffChanges | 9135 | 9017 | function | 高 |

### §35 MCP 配置规范化（jsx 9173–9248，8 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `xS` | readMcpServerHeaders | 9173 | 9041 | function | 中-高 |
| `SS` | normalizeMcpServerConfigEntry | 9176 | 9044 | function | 高 |
| `CS` | isValidPositiveTimeoutMs | 9231 | 9082 | function | 高 |
| `wS` | isValidMcpIsolation | 9234 | 9085 | function | 高 |
| `TS` | isValidMcpProtocolVersion | 9237 | 9088 | function | 高 |
| `ES` | isValidMcpOAuthConfig | 9240 | 9091 | function | 高 |
| `DS` | isPlainObjectRecord | 9243 | 9109 | function | 高 |
| `OS` | resolvePlatformBinaryName | 9246 | 9112 | function | 高 |

### §36 搜索二进制预设（jsx 9249–9272，1 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `kS` | SEARCH_BINARY_PRESETS | 9249 | 9115 | var | 高 |

### §37 工具调用状态 i18n（jsx 9273–9286，4 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `AS` | PENDING_TOOL_CALL_STATUSES | 9273 | 9133 | var | 高 |
| `jS` | TOOL_CALL_STATUS_I18N_IDS | 9274 | 9134 | var | 高 |
| `MS` | isPendingToolCallStatus | 9281 | 9141 | function | 中-高 |
| `NS` | resolveToolCallStatusI18nId | 9284 | 9144 | function | 高 |

### §38 工具名分类（jsx 9287–9329，6 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `PS` | KNOWN_TOOL_NAME_LIST | 9287 | 9149 | var | 高 |
| `FS` | TOOL_VIEW_KIND_BY_NAME | 9288 | 9153 | var | 高 |
| `IS` | TOOL_NAME_LOWERCASE_INDEX | 9318 | 9183 | var | 高 |
| `LS` | canonicalizeToolName | 9319 | 9184 | function | 中-高 |
| `RS` | resolveToolViewKind | 9323 | 9188 | function | 中-高 |
| `zS` | isFileWriteToolName | 9327 | 9192 | function | 高 |

### §39 工具输入解析（jsx 9330–9409，9 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `BS` | TOOL_INPUT_KNOWN_FIELD_NAMES | 9330 | 9195 | var | 高 |
| `VS` | parseToolCallInput | 9331 | 9219 | function | 中-高 |
| `HS` | tryParseJsonValue | 9348 | 9226 | function | 中-高 |
| `US` | extractKnownToolInputFields | 9360 | 9233 | function | 中-高 |
| `WS` | extractJsonStringField | 9368 | 9241 | function | 高 |
| `GS` | decodeExtractedJsonString | 9392 | 9265 | function | 高 |
| `KS` | stripTrailingPartialEscape | 9400 | 9273 | function | 高 |
| `qS` | unescapeJsonStringLiterals | 9403 | 9276 | function | 高 |
| `JS` | escapeRegExpSource | 9407 | 9288 | function | 高 |

### §40 待办列表提取（jsx 9410–9487，13 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `YS` | TODO_TOOL_TITLE_PATTERN | 9410 | 9291 | var | 高 |
| `XS` | TODO_LIST_FIELD_NAMES | 9411 | 9292 | var | 高 |
| `ZS` | isPlainObjectValue | 9412 | 9293 | function | 高 |
| `QS` | nonEmptyTrimmedString | 9415 | 9296 | function | 高 |
| `$S` | normalizeTodoStatus | 9418 | 9299 | function | 高 |
| `eC` | normalizeTodoEntry | 9422 | 9303 | function | 高 |
| `tC` | tryParseTodoJson | 9440 | 9313 | function | 中-高 |
| `nC` | extractTodoListContainer | 9447 | 9320 | function | 高 |
| `rC` | parseTodoListStrict | 9456 | 9329 | function | 中-高 |
| `iC` | collectTodoParseCandidates | 9462 | 9335 | function | 高 |
| `aC` | isTodoToolTitle | 9474 | 9348 | function | 高 |
| `oC` | extractTodosFromToolInput | 9477 | 9351 | function | 高 |
| `sC` | extractTodosFromToolOutput | 9480 | 9354 | function | 高 |

### §41 权限请求视图模型（jsx 9488–9631，17 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `cC` | COMMAND_INPUT_FIELD_NAMES | 9488 | 9362 | var | 高 |
| `lC` | COMMAND_ARGS_FIELD_NAMES | 9489 | 9363 | var | 高 |
| `uC` | FILE_PATH_FIELD_NAMES | 9490 | 9364 | var | 高 |
| `dC` | DIRECTORY_FIELD_NAMES | 9491 | 9378 | var | 高 |
| `fC` | PERMISSION_FILE_PATH_LIMIT | 9492 | 9379 | var | 高 |
| `$` | isPlainRecordValue | 9493 | 9380 | function | 高 |
| `pC` | collapseWhitespace | 9496 | 9383 | function | 高 |
| `mC` | normalizeLineEndings | 9499 | 9386 | function | 高 |
| `hC` | coerceStringArray | 9503 | 9393 | function | 高 |
| `gC` | unwrapToolCallPayload | 9506 | 9406 | function | 高 |
| `_C` | extractCommandFromRecord | 9509 | 9415 | function | 高 |
| `vC` | findCommandValueDeep | 9524 | 9430 | function | 高 |
| `yC` | pushUniqueFilePath | 9555 | 9461 | function | 中-高 |
| `bC` | collectFilePathValues | 9559 | 9465 | function | 高 |
| `xC` | collectPermissionFilePaths | 9576 | 9485 | function | 中-高 |
| `SC` | collectPermissionFileChanges | 9599 | 9508 | function | 高 |
| `CC` | buildPermissionRequestViewModel | 9614 | 9525 | function | 高 |

### §42 工作区键与 coding-plan 错误（jsx 9632–9636，3 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `wC` | webRemoteWorkspaceKey | 9632 | 9543 | function | 中-高 |
| `TC` | CODING_PLAN_SECURITY_VERIFICATION_REQUIRED | 9635 | 9546 | var | 高 |
| `EC` | CODING_PLAN_SYSTEM_BUSY | 9636 | 9547 | var | 高 |

### §43 内网/环境解析（jsx 9637–9696，11 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `DC` | readProcessEnv | 9637 | 9548 | function | 中-高 |
| `OC` | resolveIntranetMachineHost | 9640 | 9551 | function | 高 |
| `kC` | INTRANET_MACHINE_HOST | 9643 | 9554 | var | 高 |
| `AC` | INTRANET_PROBE_CONFIG | 9645 | 9556 | var | 高 |
| `jC` | shouldUseTestEndpoints | 9654 | 9567 | function | 高 |
| `MC` | coerceEnvRecord | 9657 | 9570 | function | 中-高 |
| `NC` | isTruthyEnvFlag | 9660 | 9573 | function | 高 |
| `PC` | normalizeEffectiveEnv | 9665 | 9578 | function | 高 |
| `FC` | normalizeNetworkEnv | 9669 | 9582 | function | 高 |
| `IC` | resolveEnvOverrideSignals | 9673 | 9586 | function | 高 |
| `LC` | resolveRuntimeEnvMode | 9688 | 9596 | function | 高 |

### §44 仓库快照键与本地工作区查找（jsx 9697–9712，4 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `RC` | repoSnapshotStorageKey | 9697 | 9606 | function | 高 |
| `zC` | repoWikiWorkspaceKey | 9701 | 9617 | function | 中-高 |
| `BC` | findLocalWorkspaceIndexForward | 9704 | 9620 | function | 高 |
| `VC` | findNearestLocalWorkspaceIndex | 9708 | 9624 | function | 中-高 |

### §45 浏览器执行操作 schema（jsx 9713–9741，1 项）

| 混淆名 | 语义名 | jsx | js | 种类 | 把握度 |
|---|---|---:|---:|---|---|
| `HC` | BrowserExecuteOpBaseSchema | 9713 | 9629 | var | 高 |

## §2 导出别名表（412 项，按导出块原序）

导出块位于 jsx 9742（js 9656–10069），单行 `export { ... }`。本批次内部符号以**语义名**列出，上半符号以原混淆名列出（标注「上半」）。

| # | 别名 | 内部符号 | 语义名 | jsx | 归属 |
|---:|---|---|---|---:|---|
| 1 | `$` | `mx` | AUTOMATION_CREATE_LIMIT_REACHED | 8852 | 本批次 |
| 2 | `$a` | `xh` | buildRemoteServerWorkspaceKey | 8152 | 本批次 |
| 3 | `$i` | `my` | v4EditCancelTestid | 8498 | 本批次 |
| 4 | `$n` | `jb` | cronCreateOpenTestid | 8569 | 本批次 |
| 5 | `$o` | `fc` | （上半 SrcSharedA 域） | — | 上半 |
| 6 | `$r` | `dv` | settingsAskUserQuestionAutoResolutionSwitchTestid | 8441 | 本批次 |
| 7 | `$t` | `Tg` | browserAddressInputTestid | 8347 | 本批次 |
| 8 | `A` | `aS` | NATIVE_PROVIDER_REF_PREFIX | 9097 | 本批次 |
| 9 | `Aa` | `Py` | v4TimelineBottomTestid | 8518 | 本批次 |
| 10 | `Ai` | `Q_` | taskArchiveTestid | 8428 | 本批次 |
| 11 | `An` | `P_` | chatEmptyTestid | 8410 | 本批次 |
| 12 | `Ao` | `tu` | isObjectRecord | 5031 | 本批次 |
| 13 | `Ar` | `Qy` | offpeakCardMenuTestid | 8536 | 本批次 |
| 14 | `As` | `ee` | （上半 SrcSharedA 域） | — | 上半 |
| 15 | `At` | `sb` | automationCardMenuTestid | 8545 | 本批次 |
| 16 | `B` | `Yx` | getOAuthProviderFamilyByProviderId | 9039 | 本批次 |
| 17 | `Ba` | `Wv` | workspaceFileTreeRefreshButtonTestid | 8474 | 本批次 |
| 18 | `Bi` | `iy` | v4AttachmentTestid | 8488 | 本批次 |
| 19 | `Bn` | `L_` | chatSendButtonTestid | 8413 | 本批次 |
| 20 | `Bo` | `$l` | resolveModelContextWindow | 5022 | 本批次 |
| 21 | `Br` | `E_` | projectSectionTestid | 8402 | 本批次 |
| 22 | `Bt` | `mb` | automationEditBackTestid | 8552 | 本批次 |
| 23 | `C` | `hS` | isPluginPreferenceSource | 9121 | 本批次 |
| 24 | `Ca` | `Ey` | v4SessionTitleTestid | 8510 | 本批次 |
| 25 | `Ci` | `l_` | sshPasswordInputTestid | 8385 | 本批次 |
| 26 | `Cn` | `Yg` | browserWebviewTestid | 8371 | 本批次 |
| 27 | `Co` | `eu` | normalizeProviderId | 5028 | 本批次 |
| 28 | `Cr` | `vg` | oauthCancelTestid | 8340 | 本批次 |
| 29 | `Cs` | `E` | （上半 SrcSharedA 域） | — | 上半 |
| 30 | `Ct` | `Pb` | IpcChannelNames | 8574 | 本批次 |
| 31 | `D` | `dS` | isDataBaseDirForbiddenError | 9110 | 本批次 |
| 32 | `Da` | `Uy` | v4SubagentOpenSidePaneTestid | 8527 | 本批次 |
| 33 | `Di` | `s_` | sshUsernameInputTestid | 8383 | 本批次 |
| 34 | `Dn` | `I_` | chatAttachmentMenuItemTestid | 8412 | 本批次 |
| 35 | `Do` | `bl` | （上半 SrcSharedA 域） | — | 上半 |
| 36 | `Dr` | `ab` | offpeakActionDeleteTestid | 8543 | 本批次 |
| 37 | `Ds` | `j` | （上半 SrcSharedA 域） | — | 上半 |
| 38 | `Dt` | `lb` | automationActionDeleteTestid | 8547 | 本批次 |
| 39 | `E` | `pS` | AppRuntimePreferencesSchema | 9115 | 本批次 |
| 40 | `Ea` | `sy` | v4StopTestid | 8491 | 本批次 |
| 41 | `Ei` | `qv` | sshSuccessTestid | 8477 | 本批次 |
| 42 | `En` | `F_` | chatAttachmentButtonTestid | 8411 | 本批次 |
| 43 | `Eo` | `_l` | （上半 SrcSharedA 域） | — | 上半 |
| 44 | `Er` | `ib` | offpeakActionContinueTestid | 8542 | 本批次 |
| 45 | `Es` | `w` | （上半 SrcSharedA 域） | — | 上半 |
| 46 | `Et` | `Gy` | automationsOpenTestid | 8529 | 本批次 |
| 47 | `F` | `rS` | buildCustomModelRef | 9074 | 本批次 |
| 48 | `Fa` | `My` | v4UserInputOptionTestid | 8516 | 本批次 |
| 49 | `Fi` | `$_` | taskSettingsButtonTestid | 8429 | 本批次 |
| 50 | `Fn` | `Ov` | chatModelSelectTriggerTestid | 8458 | 本批次 |
| 51 | `Fo` | `du` | mapApiFormatToKind | 5135 | 本批次 |
| 52 | `Fr` | `tb` | offpeakFormTitleTestid | 8539 | 本批次 |
| 53 | `Ft` | `bb` | automationCustomIntervalIncrementTestid | 8558 | 本批次 |
| 54 | `G` | `Vx` | resolveFirstReadyProvider | 8994 | 本批次 |
| 55 | `Ga` | `Vv` | workspaceMoreButtonTestid | 8471 | 本批次 |
| 56 | `Gi` | `Zv` | v4ComposerTestid | 8481 | 本批次 |
| 57 | `Gn` | `j_` | composerProjectDetachTestid | 8407 | 本批次 |
| 58 | `Go` | `$c` | （上半 SrcSharedA 域） | — | 上半 |
| 59 | `Gr` | `i_` | remoteKindDockerTestid | 8380 | 本批次 |
| 60 | `Gt` | `hb` | automationFrequencySelectTestid | 8553 | 本批次 |
| 61 | `H` | `eS` | activeOAuthProviderMatchesFamily | 9060 | 本批次 |
| 62 | `Ha` | `Rv` | workspaceHeaderTestid | 8468 | 本批次 |
| 63 | `Hi` | `oy` | v4AttachmentUploadRetryTestid | 8490 | 本批次 |
| 64 | `Hn` | `Mv` | chatThoughtLevelSelectItemTestid | 8462 | 本批次 |
| 65 | `Ho` | `uu` | mapKindToApiFormat | 5125 | 本批次 |
| 66 | `Hr` | `W_` | promptSuggestionPanelTestid | 8420 | 本批次 |
| 67 | `Ht` | `fb` | automationFormSubmitTestid | 8550 | 本批次 |
| 68 | `I` | `qx` | getOAuthProviderFamilyById | 9033 | 本批次 |
| 69 | `Ia` | `Ny` | v4UserInputTextTestid | 8517 | 本批次 |
| 70 | `Ii` | `Qg` | terminalTestid | 8374 | 本批次 |
| 71 | `In` | `Pv` | chatModeSelectItemTestid | 8464 | 本批次 |
| 72 | `Io` | `ou` | mapModelFormatToKind | 5047 | 本批次 |
| 73 | `Ir` | `ob` | offpeakTabTestid | 8544 | 本批次 |
| 74 | `It` | `yb` | automationCustomIntervalSelectTestid | 8557 | 本批次 |
| 75 | `J` | `Ax` | listSessionModePresets | 8899 | 本批次 |
| 76 | `Ja` | `p_` | wslDistroSelectTestid | 8389 | 本批次 |
| 77 | `Ji` | `Qv` | v4ComposerInputTestid | 8482 | 本批次 |
| 78 | `Jn` | `M_` | composerWorkOutsideProjectTestid | 8408 | 本批次 |
| 79 | `Jo` | `Vc` | （上半 SrcSharedA 域） | — | 上半 |
| 80 | `Jr` | `r_` | remoteKindWslTestid | 8379 | 本批次 |
| 81 | `Jt` | `kb` | automationScheduleDeleteTestid | 8567 | 本批次 |
| 82 | `K` | `Lx` | formatLogLinePrefix | 8975 | 本批次 |
| 83 | `Ka` | `Bv` | workspacePathTestid | 8470 | 本批次 |
| 84 | `Ki` | `$v` | v4ComposerBackgroundWorkTriggerTestid | 8483 | 本批次 |
| 85 | `Kn` | `A_` | composerRemoteConnectionTestid | 8406 | 本批次 |
| 86 | `Ko` | `zc` | （上半 SrcSharedA 域） | — | 上半 |
| 87 | `Kr` | `n_` | remoteKindServerTestid | 8378 | 本批次 |
| 88 | `Kt` | `pb` | automationRunNowTestid | 8551 | 本批次 |
| 89 | `L` | `Xx` | normalizeProviderFamilyDomain | 9043 | 本批次 |
| 90 | `La` | `w_` | workspaceCloseTestid | 8400 | 本批次 |
| 91 | `Li` | `Cg` | terminalCloseButtonTestid | 8345 | 本批次 |
| 92 | `Ln` | `Nv` | chatModeSelectTriggerTestid | 8463 | 本批次 |
| 93 | `Lo` | `_u` | canonicalizeEndpointUrl | 5197 | 本批次 |
| 94 | `Lr` | `hv` | pluginMcpServerRowTestid | 8445 | 本批次 |
| 95 | `Lt` | `Sb` | automationCustomRepeatEditTestid | 8560 | 本批次 |
| 96 | `M` | `cS` | nativeProviderRef | 9100 | 本批次 |
| 97 | `Ma` | `Vy` | v4TurnNavigatorItemTestid | 8525 | 本批次 |
| 98 | `Mi` | `X_` | taskItemTestid | 8426 | 本批次 |
| 99 | `Mn` | `R_` | chatLoadingTestid | 8414 | 本批次 |
| 100 | `Mo` | `Ql` | isUnlimitedContextModelId | 5019 | 本批次 |
| 101 | `Mr` | `eb` | offpeakEditSubmitTestid | 8538 | 本批次 |
| 102 | `Ms` | `a` | （上半 SrcSharedA 域） | — | 上半 |
| 103 | `Mt` | `qy` | automationCreateMenuTestid | 8531 | 本批次 |
| 104 | `N` | `uS` | resolveProviderRefFromCustomModelRef | 9106 | 本批次 |
| 105 | `Na` | `Hy` | v4TurnNavigatorTooltipTestid | 8526 | 本批次 |
| 106 | `Ni` | `J_` | taskListTestid | 8424 | 本批次 |
| 107 | `Nn` | `kv` | chatModelSelectGroupTestid | 8459 | 本批次 |
| 108 | `No` | `yl` | （上半 SrcSharedA 域） | — | 上半 |
| 109 | `Nr` | `$y` | offpeakEditViewTestid | 8537 | 本批次 |
| 110 | `Ns` | `t` | （上半 SrcSharedA 域） | — | 上半 |
| 111 | `Nt` | `Cb` | automationCustomConfirmTestid | 8561 | 本批次 |
| 112 | `O` | `oS` | CUSTOM_PROVIDER_REF_PREFIX | 9098 | 本批次 |
| 113 | `Oa` | `zy` | v4TaskOpenInSplitTestid | 8523 | 本批次 |
| 114 | `Oi` | `vv` | subagentBuiltInModelTriggerTestid | 8448 | 本批次 |
| 115 | `On` | `H_` | chatBackgroundResultTitleTestid | 8418 | 本批次 |
| 116 | `Oo` | `Tl` | （上半 SrcSharedA 域） | — | 上半 |
| 117 | `Or` | `rb` | offpeakActionPauseTestid | 8541 | 本批次 |
| 118 | `Os` | `O` | （上半 SrcSharedA 域） | — | 上半 |
| 119 | `Ot` | `cb` | automationActionToggleTestid | 8546 | 本批次 |
| 120 | `P` | `iS` | parseCustomModelRef | 9078 | 本批次 |
| 121 | `Pa` | `jy` | v4UserInputDialogTestid | 8515 | 本批次 |
| 122 | `Pi` | `Y_` | taskNewButtonTestid | 8425 | 本批次 |
| 123 | `Pn` | `Av` | chatModelSelectItemTestid | 8460 | 本批次 |
| 124 | `Po` | `vl` | （上半 SrcSharedA 域） | — | 上半 |
| 125 | `Pr` | `nb` | offpeakFormInstructionsTestid | 8540 | 本批次 |
| 126 | `Ps` | `e` | （上半 SrcSharedA 域） | — | 上半 |
| 127 | `Pt` | `xb` | automationCustomIntervalDecrementTestid | 8559 | 本批次 |
| 128 | `Q` | `_x` | isTerminalOffPeakRunStatus | 8857 | 本批次 |
| 129 | `Qa` | `$h` | resolveSessionDisplayTitle | 8276 | 本批次 |
| 130 | `Qi` | `hy` | v4EditAttachmentRemoveTestid | 8499 | 本批次 |
| 131 | `Qn` | `Ab` | cronCreateCardTestid | 8568 | 本批次 |
| 132 | `Qo` | `dc` | （上半 SrcSharedA 域） | — | 上半 |
| 133 | `Qr` | `b_` | serverWorkspacePathInputTestid | 8396 | 本批次 |
| 134 | `Qt` | `Tb` | automationYearMonthOptionTestid | 8563 | 本批次 |
| 135 | `R` | `Jx` | getOAuthFamilyIdByProviderId | 9036 | 本批次 |
| 136 | `Ra` | `Hv` | workspaceFileTreeButtonTestid | 8472 | 本批次 |
| 137 | `Ri` | `Sg` | terminalToggleTestid | 8344 | 本批次 |
| 138 | `Rn` | `Lv` | chatReasoningContentTestid | 8467 | 本批次 |
| 139 | `Ro` | `Cu` | resolveProviderApiFormat | 5228 | 本批次 |
| 140 | `Rr` | `Xg` | previewPaneTestid | 8372 | 本批次 |
| 141 | `Rt` | `vb` | automationCustomUnitOptionTestid | 8556 | 本批次 |
| 142 | `S` | `_S` | isOfficialPluginMarketplace | 9125 | 本批次 |
| 143 | `Sa` | `Jv` | v4SessionPaneTestid | 8478 | 本批次 |
| 144 | `Si` | `a_` | sshHostInputTestid | 8381 | 本批次 |
| 145 | `Sn` | `Pg` | browserResponsiveZoomSelectTestid | 8356 | 本批次 |
| 146 | `So` | `yu` | listEndpointKinds | 5205 | 本批次 |
| 147 | `Sr` | `xv` | modelProviderNavItemTestid | 8451 | 本批次 |
| 148 | `Ss` | `Ka` | （上半 SrcSharedA 域） | — | 上半 |
| 149 | `St` | `Ib` | ServicePortIpcTopics | 8612 | 本批次 |
| 150 | `T` | `fS` | APP_RUNTIME_PREFERENCES_STORAGE_KEY | 9114 | 本批次 |
| 151 | `Ta` | `Ly` | v4SplitDividerTestid | 8521 | 本批次 |
| 152 | `Ti` | `u_` | sshPrivateKeyInputTestid | 8386 | 本批次 |
| 153 | `Tn` | `B_` | chatAssistantHistoryTriggerTestid | 8416 | 本批次 |
| 154 | `To` | `Jl` | hasAnyReadyProvider | 5013 | 本批次 |
| 155 | `Tr` | `_g` | oauthLoginButtonTestid | 8339 | 本批次 |
| 156 | `Ts` | `N` | （上半 SrcSharedA 域） | — | 上半 |
| 157 | `Tt` | `Ky` | automationsListTestid | 8530 | 本批次 |
| 158 | `U` | `Kx` | isProviderAllowedForFamilyMode | 9029 | 本批次 |
| 159 | `Ua` | `C_` | workspaceItemTestid | 8399 | 本批次 |
| 160 | `Ui` | `Oy` | v4BackgroundWorkCancelTestid | 8512 | 本批次 |
| 161 | `Un` | `jv` | chatThoughtLevelSelectTriggerTestid | 8461 | 本批次 |
| 162 | `Uo` | `vu` | resolveProviderKindEndpointUrl | 5200 | 本批次 |
| 163 | `Ur` | `G_` | promptSuggestionSectionTestid | 8421 | 本批次 |
| 164 | `Ut` | `ub` | automationFormTitleTestid | 8548 | 本批次 |
| 165 | `V` | `Zx` | normalizeOAuthProviderDomain | 9046 | 本批次 |
| 166 | `Va` | `Gv` | workspaceFileTreeRowTestid | 8475 | 本批次 |
| 167 | `Vi` | `ay` | v4AttachmentUploadProgressTestid | 8489 | 本批次 |
| 168 | `Vn` | `z_` | chatSummaryPanelTestid | 8415 | 本批次 |
| 169 | `Vo` | `lu` | resolveProviderDefaultKind | 5110 | 本批次 |
| 170 | `Vr` | `K_` | promptSuggestionOptionTestid | 8422 | 本批次 |
| 171 | `Vt` | `db` | automationFormPromptTestid | 8549 | 本批次 |
| 172 | `W` | `Rx` | ZCODE_AGENT_PROVIDER_NOT_READY | 8978 | 本批次 |
| 173 | `Wa` | `S_` | workspaceListTestid | 8398 | 本批次 |
| 174 | `Wi` | `Dy` | v4BackgroundWorkItemTestid | 8511 | 本批次 |
| 175 | `Wn` | `U_` | chatToolCallBlockTestid | 8419 | 本批次 |
| 176 | `Wo` | `Tu` | resolveModelSupportedKinds | 5238 | 本批次 |
| 177 | `Wr` | `q_` | promptSuggestionStatusTestid | 8423 | 本批次 |
| 178 | `Wt` | `gb` | automationFrequencyOptionTestid | 8554 | 本批次 |
| 179 | `X` | `jx` | buildSessionSettingsViewModel | 8904 | 本批次 |
| 180 | `Xa` | `Nb` | joinTestidParts | 8571 | 本批次 |
| 181 | `Xi` | `ey` | v4ComposerSendTestid | 8484 | 本批次 |
| 182 | `Xn` | `D_` | conversationNewTaskTestid | 8403 | 本批次 |
| 183 | `Xo` | `Cc` | （上半 SrcSharedA 域） | — | 上半 |
| 184 | `Xr` | `y_` | serverTokenInputTestid | 8395 | 本批次 |
| 185 | `Xt` | `Eb` | automationYearDayOptionTestid | 8564 | 本批次 |
| 186 | `Y` | `kx` | listSessionModeOptions | 8892 | 本批次 |
| 187 | `Ya` | `m_` | wslUserInputTestid | 8390 | 本批次 |
| 188 | `Yi` | `ny` | v4ComposerKeepQueueSendTestid | 8486 | 本批次 |
| 189 | `Yn` | `Mb` | confirmDialogConfirmTestid | 8570 | 本批次 |
| 190 | `Yo` | `Lc` | （上半 SrcSharedA 域） | — | 上半 |
| 191 | `Yr` | `v_` | serverNameInputTestid | 8394 | 本批次 |
| 192 | `Yt` | `Db` | automationSchedulePreviewTestid | 8565 | 本批次 |
| 193 | `Z` | `vx` | OFFPEAK_IDLE_PLAN_ID | 8860 | 本批次 |
| 194 | `Za` | `ag` | resolveSessionDisplayStatus | 8304 | 本批次 |
| 195 | `Zi` | `dy` | v4EditTestid | 8495 | 本批次 |
| 196 | `Zn` | `T_` | conversationSectionTestid | 8401 | 本批次 |
| 197 | `Zo` | `uc` | （上半 SrcSharedA 域） | — | 上半 |
| 198 | `Zr` | `__` | serverUrlInputTestid | 8393 | 本批次 |
| 199 | `Zt` | `wb` | automationYearMonthdayTestid | 8562 | 本批次 |
| 200 | `_` | `NS` | resolveToolCallStatusI18nId | 9284 | 本批次 |
| 201 | `_a` | `by` | v4QueuePausedBannerTestid | 8504 | 本批次 |
| 202 | `_i` | `f_` | sshAuthPrivateKeyTestid | 8388 | 本批次 |
| 203 | `_n` | `Ig` | browserResponsiveScaledFrameTestid | 8358 | 本批次 |
| 204 | `_o` | `Yl` | MODEL_CONTEXT_WINDOW_DEFAULT | 5016 | 本批次 |
| 205 | `_r` | `wv` | modelProviderApiKeyInputTestid | 8454 | 本批次 |
| 206 | `_s` | `P` | （上半 SrcSharedA 域） | — | 上半 |
| 207 | `_t` | `Yb` | resolveCodingPlanAttribution | 8674 | 本批次 |
| 208 | `a` | `jC` | shouldUseTestEndpoints | 9654 | 本批次 |
| 209 | `aa` | `uy` | v4FeedbackDislikeTestid | 8494 | 本批次 |
| 210 | `ai` | `lv` | settingsMemoryFileTestid | 8439 | 本批次 |
| 211 | `an` | `qg` | browserOpenExternalItemTestid | 8369 | 本批次 |
| 212 | `ao` | `zf` | Base64StringSchema | 6893 | 本批次 |
| 213 | `ar` | `gg` | loginApiKeyErrorTestid | 8338 | 本批次 |
| 214 | `as` | `nc` | （上半 SrcSharedA 域） | — | 上半 |
| 215 | `at` | `px` | isOffPeakTaskPayload | 8849 | 本批次 |
| 216 | `b` | `bS` | countLineDiffChanges | 9135 | 本批次 |
| 217 | `ba` | `Xv` | v4RowTestid | 8480 | 本批次 |
| 218 | `bi` | `e_` | sshDialogTestid | 8376 | 本批次 |
| 219 | `bn` | `Mg` | browserResponsiveWidthInputTestid | 8354 | 本批次 |
| 220 | `bo` | `cu` | normalizeCatalogModel | 5069 | 本批次 |
| 221 | `br` | `Ev` | modelProviderModelDeleteButtonTestid | 8456 | 本批次 |
| 222 | `bs` | `M` | （上半 SrcSharedA 域） | — | 上半 |
| 223 | `bt` | `zb` | isCredentialDecryptFailure | 8619 | 本批次 |
| 224 | `c` | `wC` | webRemoteWorkspaceKey | 9632 | 本批次 |
| 225 | `ca` | `ky` | v4ModelConfigTestid | 8513 | 本批次 |
| 226 | `ci` | `iv` | settingsMemorySwitchTestid | 8434 | 本批次 |
| 227 | `cn` | `Ng` | browserResponsiveHeightInputTestid | 8355 | 本批次 |
| 228 | `co` | `Lf` | StreamTextFieldEnum | 6862 | 本批次 |
| 229 | `cr` | `ug` | loginApiKeyProviderTriggerTestid | 8332 | 本批次 |
| 230 | `cs` | `tc` | （上半 SrcSharedA 域） | — | 上半 |
| 231 | `ct` | `ax` | parseLaunchMarks | 8804 | 本批次 |
| 232 | `d` | `sC` | extractTodosFromToolOutput | 9480 | 本批次 |
| 233 | `da` | `ry` | v4PausedQueueSendDialogTestid | 8487 | 本批次 |
| 234 | `di` | `ev` | settingsPageTestid | 8430 | 本批次 |
| 235 | `dn` | `Vg` | browserResponsiveResizeCornerTopLeftTestid | 8363 | 本批次 |
| 236 | `do` | `df` | BrowserAmbientContextSchema | 6168 | 本批次 |
| 237 | `dr` | `sg` | loginTriggerTestid | 8329 | 本批次 |
| 238 | `ds` | `Es` | （上半 SrcSharedA 域） | — | 上半 |
| 239 | `dt` | `Qb` | BROWSER_RESTORE_PENDING_URL | 8712 | 本批次 |
| 240 | `ea` | `fy` | v4EditInputTestid | 8496 | 本批次 |
| 241 | `ei` | `tv` | settingsBackButtonTestid | 8431 | 本批次 |
| 242 | `en` | `Eg` | browserBackButtonTestid | 8348 | 本批次 |
| 243 | `eo` | `Sh` | parseRemoteWorkspaceKey | 8155 | 本批次 |
| 244 | `er` | `g_` | dockerContainerInputTestid | 8392 | 本批次 |
| 245 | `es` | `bc` | （上半 SrcSharedA 域） | — | 上半 |
| 246 | `et` | `hx` | isAutomationCreateLimitError | 8853 | 本批次 |
| 247 | `f` | `aC` | isTodoToolTitle | 9474 | 本批次 |
| 248 | `fa` | `yy` | v4QueueTestid | 8503 | 本批次 |
| 249 | `fi` | `nv` | settingsSectionNavTestid | 8432 | 本批次 |
| 250 | `fn` | `Hg` | browserResponsiveResizeCornerTopRightTestid | 8364 | 本批次 |
| 251 | `fo` | `J` | RuntimeModelSelectionSchema | 5482 | 本批次 |
| 252 | `fr` | `lg` | loginUseApiKeyButtonTestid | 8331 | 本批次 |
| 253 | `fs` | `ms` | （上半 SrcSharedA 域） | — | 上半 |
| 254 | `ft` | `ex` | DesktopMenuActionIds | 8745 | 本批次 |
| 255 | `g` | `LS` | canonicalizeToolName | 9319 | 本批次 |
| 256 | `ga` | `Ty` | v4QueueItemSendNowTestid | 8509 | 本批次 |
| 257 | `gi` | `d_` | sshAuthPasswordTestid | 8387 | 本批次 |
| 258 | `gn` | `Rg` | browserResponsiveResizeWidthTestid | 8360 | 本批次 |
| 259 | `go` | `Zl` | MODEL_CONTEXT_WINDOW_UNLIMITED | 5018 | 本批次 |
| 260 | `gr` | `Dv` | modelProviderAddModelButtonTestid | 8457 | 本批次 |
| 261 | `gs` | `Ao` | （上半 SrcSharedA 域） | — | 上半 |
| 262 | `gt` | `Gb` | parseCodingPlanScope | 8638 | 本批次 |
| 263 | `h` | `zS` | isFileWriteToolName | 9327 | 本批次 |
| 264 | `ha` | `wy` | v4QueueItemEditTestid | 8508 | 本批次 |
| 265 | `hi` | `bv` | sidebarCodingPlanUsageButtonTestid | 8450 | 本批次 |
| 266 | `hn` | `zg` | browserResponsiveResizeTopTestid | 8361 | 本批次 |
| 267 | `ho` | `Sl` | （上半 SrcSharedA 域） | — | 上半 |
| 268 | `hr` | `mv` | mcpServerRowTestid | 8444 | 本批次 |
| 269 | `hs` | `Mo` | （上半 SrcSharedA 域） | — | 上半 |
| 270 | `ht` | `Kb` | codingPlanScopesOverlap | 8658 | 本批次 |
| 271 | `i` | `AC` | INTRANET_PROBE_CONFIG | 9645 | 本批次 |
| 272 | `ia` | `_y` | v4EditWorkspaceConflictDialogTestid | 8501 | 本批次 |
| 273 | `ii` | `ov` | settingsMemoryBackProjectsTestid | 8436 | 本批次 |
| 274 | `in` | `Kg` | browserMoreButtonTestid | 8368 | 本批次 |
| 275 | `io` | `Uf` | decodeBase64ToBytes | 6916 | 本批次 |
| 276 | `ir` | `pg` | loginApiKeyContinueButtonTestid | 8335 | 本批次 |
| 277 | `is` | `sc` | （上半 SrcSharedA 域） | — | 上半 |
| 278 | `it` | `fx` | isCronAutomationPayload | 8846 | 本批次 |
| 279 | `j` | `lS` | customProviderRef | 9103 | 本批次 |
| 280 | `ja` | `By` | v4TurnNavigatorTestid | 8524 | 本批次 |
| 281 | `ji` | `Z_` | taskEmptyTestid | 8427 | 本批次 |
| 282 | `jn` | `N_` | chatErrorBannerTestid | 8409 | 本批次 |
| 283 | `jo` | `ql` | isProviderReadyForUse | 5004 | 本批次 |
| 284 | `jr` | `Xy` | offpeakCreateButtonTestid | 8534 | 本批次 |
| 285 | `js` | `s` | （上半 SrcSharedA 域） | — | 上半 |
| 286 | `jt` | `Jy` | automationCreateManuallyTestid | 8532 | 本批次 |
| 287 | `k` | `sS` | GHOST_PROVIDER_REF_PREFIX | 9099 | 本批次 |
| 288 | `ka` | `Yv` | v4TimelineTestid | 8479 | 本批次 |
| 289 | `ki` | `_v` | subagentRowTestid | 8447 | 本批次 |
| 290 | `kn` | `Fv` | chatContextUsageTriggerTestid | 8465 | 本批次 |
| 291 | `ko` | `Kl` | isProviderEnabled | 5001 | 本批次 |
| 292 | `kr` | `Zy` | offpeakCardTestid | 8535 | 本批次 |
| 293 | `ks` | `te` | （上半 SrcSharedA 域） | — | 上半 |
| 294 | `kt` | `Yy` | automationCardTestid | 8533 | 本批次 |
| 295 | `l` | `CC` | buildPermissionRequestViewModel | 9614 | 本批次 |
| 296 | `la` | `Fy` | v4PaneShellTestid | 8519 | 本批次 |
| 297 | `li` | `cv` | settingsMemoryWorkspaceTestid | 8438 | 本批次 |
| 298 | `ln` | `Wg` | browserResponsiveResizeCornerTestid | 8366 | 本批次 |
| 299 | `lo` | `If` | StreamTimestampSchema | 6861 | 本批次 |
| 300 | `lr` | `hg` | loginApiKeySkipButtonTestid | 8337 | 本批次 |
| 301 | `ls` | `ws` | （上半 SrcSharedA 域） | — | 上半 |
| 302 | `lt` | `rx` | buildWebRemoteEntryViewTelemetryEvent | 8797 | 本批次 |
| 303 | `m` | `RS` | resolveToolViewKind | 9323 | 本批次 |
| 304 | `ma` | `Cy` | v4QueueItemDeleteTestid | 8507 | 本批次 |
| 305 | `mi` | `x_` | sidebarTestid | 8397 | 本批次 |
| 306 | `mn` | `Lg` | browserResponsiveResizeLeftTestid | 8359 | 本批次 |
| 307 | `mo` | `W` | （上半 SrcSharedA 域） | — | 上半 |
| 308 | `mr` | `gv` | mcpOpenAuthorizationButtonTestid | 8446 | 本批次 |
| 309 | `ms` | `ss` | （上半 SrcSharedA 域） | — | 上半 |
| 310 | `mt` | `Wb` | buildCodingPlanScope | 8631 | 本批次 |
| 311 | `n` | `zC` | repoWikiWorkspaceKey | 9701 | 本批次 |
| 312 | `na` | `py` | v4EditSubmitTestid | 8497 | 本批次 |
| 313 | `ni` | `fv` | settingsLocaleSelectTriggerTestid | 8442 | 本批次 |
| 314 | `nn` | `Gg` | browserElementPickerButtonTestid | 8367 | 本批次 |
| 315 | `no` | `Wf` | RPC_FRAME_LIMITS | 6932 | 本批次 |
| 316 | `nr` | `wg` | gitPaneTestid | 8346 | 本批次 |
| 317 | `ns` | `cc` | （上半 SrcSharedA 域） | — | 上半 |
| 318 | `nt` | `dx` | DEFAULT_OFFPEAK_AUTOMATION_GROUP_ID | 8845 | 本批次 |
| 319 | `o` | `TC` | CODING_PLAN_SECURITY_VERIFICATION_REQUIRED | 9635 | 本批次 |
| 320 | `oa` | `ly` | v4FeedbackLikeTestid | 8493 | 本批次 |
| 321 | `oi` | `uv` | settingsMemoryPreviewTestid | 8440 | 本批次 |
| 322 | `on` | `Og` | browserRefreshButtonTestid | 8350 | 本批次 |
| 323 | `oo` | `Rf` | STREAM_TRANSPORT_LIMITS | 6863 | 本批次 |
| 324 | `or` | `fg` | loginApiKeyInputTestid | 8334 | 本批次 |
| 325 | `os` | `Us` | （上半 SrcSharedA 域） | — | 上半 |
| 326 | `ot` | `cx` | generateUuid | 8830 | 本批次 |
| 327 | `p` | `VS` | parseToolCallInput | 9331 | 本批次 |
| 328 | `pa` | `Sy` | v4QueueItemTestid | 8506 | 本批次 |
| 329 | `pi` | `yv` | settingsUsageTabTestid | 8449 | 本批次 |
| 330 | `pn` | `Bg` | browserResponsiveResizeHeightTestid | 8362 | 本批次 |
| 331 | `po` | `Ru` | McpServerConfigSchema | 5329 | 本批次 |
| 332 | `pr` | `xg` | logoutButtonTestid | 8343 | 本批次 |
| 333 | `ps` | `fs` | （上半 SrcSharedA 域） | — | 上半 |
| 334 | `pt` | `$b` | sanitizeRemoteTargetForRestore | 8713 | 本批次 |
| 335 | `q` | `Fx` | buildStableModelId | 8967 | 本批次 |
| 336 | `qa` | `zv` | workspaceTitleTestid | 8469 | 本批次 |
| 337 | `qi` | `ty` | v4ComposerClearQueueSendTestid | 8485 | 本批次 |
| 338 | `qn` | `k_` | composerWorkspaceTriggerTestid | 8405 | 本批次 |
| 339 | `qo` | `Bc` | （上半 SrcSharedA 域） | — | 上半 |
| 340 | `qr` | `t_` | remoteKindSshTestid | 8377 | 本批次 |
| 341 | `qt` | `Ob` | automationScheduleAddTestid | 8566 | 本批次 |
| 342 | `r` | `LC` | resolveRuntimeEnvMode | 9688 | 本批次 |
| 343 | `ra` | `vy` | v4EditWorkspaceConflictConversationOnlyTestid | 8502 | 本批次 |
| 344 | `ri` | `sv` | settingsMemoryBackMemoriesTestid | 8437 | 本批次 |
| 345 | `rn` | `Dg` | browserForwardButtonTestid | 8349 | 本批次 |
| 346 | `ro` | `Bf` | crc32Hex | 6894 | 本批次 |
| 347 | `rr` | `mg` | loginApiKeyCancelButtonTestid | 8336 | 本批次 |
| 348 | `rs` | `Sc` | （上半 SrcSharedA 域） | — | 上半 |
| 349 | `rt` | `lx` | newUniqueId | 8841 | 本批次 |
| 350 | `s` | `EC` | CODING_PLAN_SYSTEM_BUSY | 9636 | 本批次 |
| 351 | `sa` | `cy` | v4ForkTestid | 8492 | 本批次 |
| 352 | `si` | `av` | settingsMemoryRefreshTestid | 8435 | 本批次 |
| 353 | `sn` | `kg` | browserResponsiveButtonTestid | 8351 | 本批次 |
| 354 | `so` | `Ff` | StreamRowKeySchema | 6857 | 本批次 |
| 355 | `sr` | `dg` | loginApiKeyProviderItemTestid | 8333 | 本批次 |
| 356 | `ss` | `Fs` | （上半 SrcSharedA 域） | — | 上半 |
| 357 | `st` | `ix` | LAUNCH_MARKS_STORAGE_KEY | 8803 | 本批次 |
| 358 | `t` | `VC` | findNearestLocalWorkspaceIndex | 9708 | 本批次 |
| 359 | `ta` | `gy` | v4EditRewindWorkspaceTestid | 8500 | 本批次 |
| 360 | `ti` | `pv` | settingsLocaleSelectItemTestid | 8443 | 本批次 |
| 361 | `tn` | `Jg` | browserDevtoolsButtonTestid | 8370 | 本批次 |
| 362 | `to` | `ip` | automationsWorkspaceKey | 7034 | 本批次 |
| 363 | `tr` | `h_` | dockerContainerSelectTestid | 8391 | 本批次 |
| 364 | `ts` | `xc` | （上半 SrcSharedA 域） | — | 上半 |
| 365 | `tt` | `ux` | DEFAULT_CRON_AUTOMATION_GROUP_ID | 8844 | 本批次 |
| 366 | `u` | `oC` | extractTodosFromToolInput | 9477 | 本批次 |
| 367 | `ua` | `Ry` | v4PaneWorkspaceBadgeTestid | 8522 | 本批次 |
| 368 | `ui` | `rv` | settingsNativeSearchSwitchTestid | 8433 | 本批次 |
| 369 | `un` | `Ug` | browserResponsiveResizeCornerBottomLeftTestid | 8365 | 本批次 |
| 370 | `uo` | `yd` | buildRuntimeProviderFromConfig | 5635 | 本批次 |
| 371 | `ur` | `cg` | loginMenuItemTestid | 8330 | 本批次 |
| 372 | `us` | `Ds` | （上半 SrcSharedA 域） | — | 上半 |
| 373 | `ut` | `tx` | resolveClientTelemetryContext | 8774 | 本批次 |
| 374 | `v` | `MS` | isPendingToolCallStatus | 9281 | 本批次 |
| 375 | `va` | `xy` | v4QueueResumeTestid | 8505 | 本批次 |
| 376 | `vi` | `c_` | sshConfigAliasSelectTestid | 8384 | 本批次 |
| 377 | `vn` | `jg` | browserResponsiveToolbarTestid | 8353 | 本批次 |
| 378 | `vo` | `xl` | （上半 SrcSharedA 域） | — | 上半 |
| 379 | `vr` | `Cv` | modelProviderConnectionModeItemTestid | 8453 | 本批次 |
| 380 | `vs` | `k` | （上半 SrcSharedA 域） | — | 上半 |
| 381 | `vt` | `Hb` | ZCODE_AGENT_AUDIENCE | 8629 | 本批次 |
| 382 | `w` | `mS` | isUserPreferenceSource | 9118 | 本批次 |
| 383 | `wa` | `Iy` | v4SplitCloseTestid | 8520 | 本批次 |
| 384 | `wi` | `o_` | sshPortInputTestid | 8382 | 本批次 |
| 385 | `wn` | `V_` | chatAssistantHistoryContentTestid | 8417 | 本批次 |
| 386 | `wo` | `ru` | listProviderModelIds | 5037 | 本批次 |
| 387 | `wr` | `yg` | oauthErrorTestid | 8341 | 本批次 |
| 388 | `ws` | `A` | （上半 SrcSharedA 域） | — | 上半 |
| 389 | `wt` | `bg` | appHeaderTestid | 8342 | 本批次 |
| 390 | `x` | `gS` | OFFICIAL_PLUGIN_MARKETPLACE_IDS | 9124 | 本批次 |
| 391 | `xa` | `Wy` | v4RowAttachmentsTestid | 8528 | 本批次 |
| 392 | `xi` | `Kv` | sshErrorTestid | 8476 | 本批次 |
| 393 | `xn` | `Fg` | browserResponsiveZoomOptionTestid | 8357 | 本批次 |
| 394 | `xo` | `fu` | mapKindToDefaultEndpointPath | 5145 | 本批次 |
| 395 | `xr` | `Tv` | modelProviderModelInputTestid | 8455 | 本批次 |
| 396 | `xs` | `F` | （上半 SrcSharedA 域） | — | 上半 |
| 397 | `xt` | `Fb` | EmbeddedBrowserIpcTopics | 8609 | 本批次 |
| 398 | `y` | `SS` | normalizeMcpServerConfigEntry | 9176 | 本批次 |
| 399 | `ya` | `Ay` | v4RetrySubscribeTestid | 8514 | 本批次 |
| 400 | `yi` | `$g` | sshConnectTriggerTestid | 8375 | 本批次 |
| 401 | `yn` | `Ag` | browserResponsiveViewportTestid | 8352 | 本批次 |
| 402 | `yo` | `El` | （上半 SrcSharedA 域） | — | 上半 |
| 403 | `yr` | `Sv` | modelProviderConnectionModeTriggerTestid | 8452 | 本批次 |
| 404 | `ys` | `D` | （上半 SrcSharedA 域） | — | 上半 |
| 405 | `yt` | `Lb` | BIGMODEL_PROVIDER_DOMAIN | 8617 | 本批次 |
| 406 | `z` | `Gx` | resolveProviderFamilyMode | 9026 | 本批次 |
| 407 | `za` | `Uv` | workspaceFileTreePanelTestid | 8473 | 本批次 |
| 408 | `zi` | `Zg` | toolSummaryTriggerTestid | 8373 | 本批次 |
| 409 | `zn` | `Iv` | chatReasoningTriggerTestid | 8466 | 本批次 |
| 410 | `zo` | `wu` | resolveProviderPrimaryEndpointUrl | 5231 | 本批次 |
| 411 | `zr` | `O_` | projectAddTestid | 8404 | 本批次 |
| 412 | `zt` | `_b` | automationCustomUnitSelectTestid | 8555 | 本批次 |


## §3 与既有报告登记的核对

### 3.1 ExtendedViews.report.md §2 闭包追踪 item 3（行 64）：9 个 testid 字符串值

报告登记 9 个字符串值，标注行区 src-HCld2afU.js 8423–8440。**字符串值 9/9 逐字命中**本批次 §19 testid 群（jsx 8530–8547 / js 8423–8440，`Ky…lb` 段）；但报告给出的混淆名与值的绑定有误，实证如下（原件 js 8423–8440 逐行核对）：

| 字符串值 | 报告所记混淆名 | 实际内部名（js 行） | 实际导出别名 | 判定 |
|---|---|---|---|---|
| `automations-list` | `jr` | `Ky`（8423 / jsx 8530） | `Tt` | 值命中，名更正 |
| `automation-create-menu` | `Fn` | `qy`（8424 / jsx 8531） | `Mt` | 值命中，名更正 |
| `automation-create-manually` | `Nte` | `Jy`（8425 / jsx 8532） | `jt` | 值命中，名更正 |
| `automation-card` | `Bte` | `Yy`（8426 / jsx 8533） | `kt` | 值命中，名更正 |
| `offpeak-create-button` | `Mte` | `Xy`（8427 / jsx 8534） | `jr` | 值命中，名更正 |
| `offpeak-tab` | `on` | `ob`（8437 / jsx 8544） | `Ir` | 值命中，名更正 |
| `automation-card-menu` | `at` | `sb`（8438 / jsx 8545） | `At` | 值命中，名更正 |
| `automation-action-toggle` | `Xn` | `cb`（8439 / jsx 8546） | `Ot` | 值命中，名更正 |
| `automation-action-delete` | `Et` | `lb`（8440 / jsx 8547） | `Dt` | 值命中，名更正 |

证据：`Bte`/`Mte`/`Nte` 在原件全文 **0 命中**（既非内部名也非导出别名）；`jr`/`on`/`Fn`/`at`/`Xn`/`Et` 是导出别名，但分别绑定 `Xy`=offpeak-create-button、`Og`=browser-refresh-button、`Ov`=chat-model-select-trigger、`px`（非 testid）、`D_`=conversation-new-task、`Gy`=automations-open —— 报告疑似从消费端 import 别名反查时错绑。本批次按原件真值重建（§1 行区 jsx 8530–8547）。

### 3.2 ExtendedViews.report.md §2 闭包追踪 item 3（行 62）：跨 chunk 别名六件

`n/to/mo/P/et/Z` 六件导出全部在本文件 §2 导出别名表中命中：`n`←zC=repoWikiWorkspaceKey、`to`←ip=automationsWorkspaceKey、`mo`←W（上半）、`P`←iS=parseCustomModelRef、`et`←hx=isAutomationCreateLimitError、`Z`←vx=OFFPEAK_IDLE_PLAN_ID。✓

### 3.3 GitReview.report.md：git-pane（行 32/231）

- 行 32 登记「`data-testid=git-pane`（原 `ine`，src-HCld2afU.js 8239）」：字符串值与行号正确；`ine` 在原件全文 **0 命中** —— 实际内部名为 **`wg`**（jsx 8346 / js 8239），导出别名 `nr`。GitReview 行 231 自记「nr←wg 8239」，与行 32 互斥，本批次以原件为准（`gitPaneTestid`，§19）。
- 语义名沿用：git-pane。✓

### 3.4 GitReview.report.md：Xr LCS 行计数（行 132/231）

- 行 231 登记「diff 行计数（Xr=b，out 9020–9040）」：实际 LCS 行计数函数为 **`bS`**（jsx 9135 / js 9017–9040），导出别名 **`b`** —— 别名半正确，内部名应为 bS。本批次语义名 countLineDiffChanges（§34）。
- `Xr` 实为 **`y_`=server-token-input testid**（jsx 8395 / js 8288）的导出别名（`y_ as Xr`），与 LCS 无关。
- 行 132「`Xr` LCS 计数」同此更正。语义（行级增删计数）沿用。✓

### 3.5 GitReview.report.md：editConflict 双 testid（行 231，8394/8395）

`_y`=`v4-edit-workspace-conflict-dialog`（jsx 8501 / js 8394，别名 `ia`）、`vy`=`v4-edit-workspace-conflict-conversation-only`（jsx 8502 / js 8395，别名 `ra`）—— 值与行号逐字命中。✓

### 3.6 Conversation.report.md（行 170/266/285）

- 行 170「`Vte` = buildPermissionRequestViewModel（src-HCld2afU 的 **l** 导出）」：内部 `CC`（jsx 9614 / js 9525），导出块 `CC as l` ✓（§41，语义名 buildPermissionRequestViewModel 沿用）。
- 行 266「~400 符号：qr() testid 模板（**Xa**）、testid 常量群、**Ao** 设置选择器、Vte=buildPermissionRequestViewModel（l 导出）、DesktopCommand、环境常量」：`Nb as Xa`（joinTestidParts，jsx 8571）✓；testid 常量群 242 项 ✓；`Ao` 为上半符号（本批次 §0 ambient + 导出块原名再导出）✓；宿主命令群 §12、环境解析 §43 ✓。
- 行 285「跨 chunk 符号归属：高」：本批次为 src-HCld2afU 侧提供全量证据（§2 导出别名表 412 行）。✓

## §4 边界裁决（与 B5-10a 互斥）

1. **范围切分**：jsx 1–4900 = B5-10a（SrcSharedA.tsx，zod-mini 运行时等）；jsx 4901–9742 = 本批次。本文件首个符号 `Rl`=CatalogModelSchema（jsx 4902），末个符号 `HC`=BrowserExecuteOpBaseSchema（jsx 9713）+ 导出块（jsx 9742）。
2. **边界 var 链 El…zl**（jsx 4863 起）：链关键字 `var` 及成员 El…Ll 归 B5-10a；本批次自 `Rl`（链中成员，jsx 4902）起，将后半链成员重建为**独立 `export var` 声明**，声明顺序与原件一致。孪生中这些成员是同一 `var` 链的逗号续项；拆分不改变发射代码语义 —— 骨架审计通过 `;`/`,` 归一与 `var` 关键字归一验证等价（16/16 MATCH）。
3. **下半引用上半符号**：一律按「import 处理」= §0 头节 90 条 `declare const X: any;` ambient 声明，覆盖 53 个上半导出内部名（`$c A Ao Bc Cc D Ds E El Es F Fs Ka Lc M Mo N O P Sc Sl Tl Us Vc W _l a bc bl cc dc e ee fc fs j k ms nc s sc ss t tc te uc vl w ws xc xl yl zc`）+ 体内引用的上半符号（含边界链成员 Ml/Fl/Ll/Al/Il、zodRecord 变体 `no` jsx 3226 等）。
4. **导出块中的上半符号**：53 个上半内部名在 jsx 9742 导出块中以**原混淆名**再导出（语义化属 B5-10a 职责），本批次 §2 表中标注「上半」。
5. **行号口径**：jsx（pretty 孪生）为主口径，js（原件 minified）为参照；两者非线性对应，本批次全部 769 符号的双行号由 TypeScript AST 清单权威给出（单调性已验证）。
6. **既有文件零改动**：未修改任何既有 .tsx/.report.md；未发现边界冲突（ExtendedViews/GitReview 报告中的混淆名登记错误属内容更正建议，见 §3/§7，不在本批次改动范围）。

## §5 验证记录（四项门禁）

### 门禁 1：esbuild —— 通过

```
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/SrcSharedB.tsx --loader:.tsx=tsx --jsx=preserve
```
exit 0，stderr 空（输出 201,550 字节）。

### 门禁 2：tsc strict —— 通过

`/tmp/tsconfig.SrcSharedB.json`：strict、target/lib ES2022（+DOM）、jsx preserve、module ESNext、moduleResolution Bundler、typeRoots `web/node_modules/@types`、types []、include 仅 SrcSharedB.tsx。

```
web/node_modules/.bin/tsc -p /tmp/tsconfig.SrcSharedB.json
```
exit 0，0 错。

**TS 层-only 调整（8 处）**：均为类型标注/ambient 声明/`as any` 断言，编译发射后擦除，运行时代码与原件逐字一致；骨架审计（下述）在剥离这些标注后仍 16/16 MATCH。

| # | 位置 | 调整 | 原因 |
|---|---|---|---|
| 1 | §0 头节 | `declare global { var process: any; }` | jsx 5795/9637 以 `typeof` 守卫访问宿主全局 |
| 2 | mapModelFormatToKind | 返回标注 `string \| null \| undefined` | switch 无 default 分支 |
| 3 | stripKnownEndpointPathSuffix | `let n: any =` | 字面量对象的 any 索引（TS7053） |
| 4 | trimHeaderRecord | map 回调返回标注 `: [any, any]` | filter 元组解构（TS2769） |
| 5 | providerOptionsKeyForKind | 返回标注 `: any` | 计算属性名须为 string/number/symbol/any（TS2464） |
| 6 | buildRuntimeProviderFromConfig | `let o: any = n.kind` | 索引类型含 undefined（TS2538） |
| 7 | jsx 9266 匿名逗号表达式 | `({...} as any)` 内嵌断言 | TS2695 逗号左操作数无副作用；原 js 9132 即带双括号的死代码，`as any` 发射后擦除 |
| 8 | collectPermissionFileChanges | `Object.entries(e.changes) as any` | for-of 解构元素 unknown（TS18046；for-of 左侧不允许标注，TS2483） |

### 门禁 3：锚点回代 —— 21/21 逐字命中（≥8）

方法：取重建行 → 去注释/去 TS 标注 → 语义名回改混淆名 → `export (var|function)` 归一 → 与孪生行做链拆分归一（trim、去行首 `var `、行尾 `;`→`,`）后逐字比对。

| # | 本文件行 | 孪生 jsx 行 | 锚点 | 结果 |
|---:|---:|---:|---|---|
| 1 | 462 | 4902 | §1 Rl 模型目录根 schema 首行 | MATCH |
| 2 | 812 | 5184 | §1 gu 端点基址还原签名 | MATCH |
| 3 | 2745 | 6797 | §8 Pf RPC 方法目录首行 | MATCH |
| 4 | 3048 | 7034 | §10 ip 自动化工作区键 | MATCH |
| 5 | 4744 | 8346 | §19 wg=git-pane（GitReview js 8239 登记） | MATCH |
| 6 | 4928 | 8530 | §19 Ky 自动化列表（ExtendedViews js 8423） | MATCH |
| 7 | 4945 | 8547 | §19 lb 自动化删除（ExtendedViews js 8440） | MATCH |
| 8 | 4984 | 8571 | §19b Nb testid 拼接器 | MATCH |
| 9 | 5335 | 8852 | §26 mx 自动化创建限制错误码 | MATCH |
| 10 | 5351 | 8860 | §27 vx 低峰计划 id | MATCH |
| 11 | 5372 | 8867 | §27 Tx 会话模式预设 | MATCH |
| 12 | 5560 | 9009 | §30 Hx OAuth 供应商族 | MATCH |
| 13 | 5750 | 9135 | §34 bS LCS 行差异统计 | MATCH |
| 14 | 6085 | 9403 | §39 qS JSON 字符串反转义 | MATCH |
| 15 | 5912 | 9266 | §36 匿名逗号表达式首行 | MATCH |
| 16 | 5914 | 9268 | §36 逗号表达式闭合行（as any 擦除后） | MATCH |
| 17 | 6358 | 9614 | §41 CC 权限请求视图模型 | MATCH |
| 18 | 6386 | 9632 | §42 wC Web 远程工作区键 | MATCH |
| 19 | 6413 | 9645 | §43 AC 内网探测配置 | MATCH |
| 20 | 6489 | 9701 | §44 zC 仓库 Wiki 工作区键 | MATCH |
| 21 | 6546 | 9742 | §46 导出块（412 别名整行） | MATCH |

### 骨架差分审计（逐字性总证明）

16 个体内分段（p02–p17，覆盖 jsx 4902–9741 全部代码行）经归一化（去注释 → 字符串/正则字面量掩码（保留 `${...}` 插值）→ 剥离 TS 标注与 `as any` → 语义名回改混淆名（带字符串掩码与 spread 感知）→ 去 `export `/`var ` → `(e) =>`→`e =>` → `;`→`,` → 空白折叠）后，与孪生对应行区归一化结果**逐字相等**：

p02(§1) p03(§2–3) p04(§4) p05(§5–6) p06(§7–8) p07(§9) p08(§10) p09(§11–12) p10(§13) p11(§14–15) p12(§16–18) p13(§19 testid 242 行) p14(§19b–27) p15(§28–35) p16(§36–41) p17(§42–45) —— **16/16 MATCH**。

### 其他逐字核验

- **导出块**：412 个 `internal as alias` token 逐一存在于孪生 jsx 9742 行（生成器内置校验）；整行锚点回代 MATCH（门禁 3 #21）。
- **testid 242 行**：每行生成后与孪生对应 jsx 行逐字核对（生成器内置校验）。
- **原件只读抽验**：`md5 desktop/src/out/renderer/assets/src-HCld2afU.js` = `f5edd6a1207c6d20008204829dad3923`（与批次基线一致，见 §0 摘要下记录）。

### 门禁 4：报告完整 —— 本文件（§0–§7 + 导出别名表 412 行 + 覆盖清单 769 行）。

## §6 符号表与把握度

- 文件尾符号表：`SrcSharedB.tsx` 尾部注释块（462 行），按 §1–§45 分组收录全部 **769** 符号（混淆名→语义名，jsx 行 / js 行），体例与 ConversationLeaves.tsx 尾表一致。
- 统计：var 566 + function 203 = 769；把握度：**高 702 / 中-高 67**（§1 表逐行标注；中-高均为纯结构归纳的函数名，其代码本体同样经骨架审计逐字验证）。
- 命名约定：testid = camelCase(值)+`Testid`；schema = `…Schema`/`…Enum`；函数 = 动词短语；常量 = UPPER_SNAKE。
- 原件惯用法零改动保留：`!0`/`!1`、反引号字符串、逗号表达式语句、38 处匿名 `A({...}).strict();` 表达式语句（逐一标注原 jsx 行号）、含字面换行（yS/qS/mC）与字面制表符（qS）的模板字符串。

## §7 遗留问题

1. **外部报告混淆名登记错误（只记录，不改动既有文件）**：ExtendedViews 行 64 的 `on/jr/Bte/Mte/Nte/Fn/at/Xn/Et` 绑定与 GitReview 行 32 的 `ine`、行 132/231 的 `Xr`，均与原件不符（证据见 §3）；建议后续批次统一更正原报告。
2. **jsx 9266 匿名逗号表达式**为原 bundle 死代码（无副作用；原 js 9132 带双括号），逐字保留并以 TS 层 `as any` 过门禁。
3. **导出块中 53 个上半内部名**保留原混淆名（`fc as $o` 等），语义化归 B5-10a；本批次 §2 表已给出对照。
4. **§0 的 90 条 ambient declare** 是对 SrcSharedA 的接口级依赖；B5-10a 落定后可换为真实 import，不影响本文件发射代码。
5. **双行号口径**：js 行号为 minified 原件行号，区段边界处（如 §8 js 6651–6651、§22 js 8631–8631）因 minified 多符号同行而退化，属预期现象。
