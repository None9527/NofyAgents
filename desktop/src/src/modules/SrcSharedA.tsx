/* eslint-disable */
/**
 * ============================================================================
 * SrcSharedA.tsx — src-HCld2afU 共享 chunk 上半部全量重建（B5-10a · 解混淆重建）
 * ============================================================================
 *
 * 解码对象（主口径，行号即本文件行号基准）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/src-HCld2afU.jsx
 *   （9,742 行 pretty 孪生；本文件覆盖 jsx 1–4901，即上半部全部符号）
 * 原件参照（只读，未改动，md5 f5edd6a1207c6d20008204829dad3923）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/src-HCld2afU.js（10,069 行）
 * 批次：B5-FULL-DECODE-PLAN §2 第 10 行（B5-10a）；与 B5-10b（jsx 4902–9742 → SrcSharedB.tsx）
 *       行号互斥。边界裁决：jsx 4900 落在 Ll（4898–4901）声明符内部，按声明符原子性归本批次
 *       （收录至 4901），B5-10b 自 Rl（4902）起（见 §14 段 banner 与报告 §7）。
 *
 * 本 chunk 是全图共享底层（无 import，零外部依赖）：默认语言、工作区描述符净化、
 * 路径前缀解析、错误信息提取、zod v4.3.6（vendored 库体，随 chunk 捆绑）、
 * 浏览器自动化（browser-use）协议 schema、会话/消息协议 schema、bots schema、
 * ZCode/BigModel 端点解析、应用设置 schema 与迁移、供应商/模型注册表助手。
 * 导出表共 412 个字母导出（jsx 9742 单行 export{}），本文件范围内命中 66 个，
 * 对照表见报告 §3。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号 = jsx 孪生行；★ = 本 chunk 对外导出）
 * ----------------------------------------------------------------------------
 * §1 first-party 基础助手（jsx 1–141）
 *   e   → DEFAULT_LOCALE                 (1)   ★Ps  已登记：I18n.report/intlProvider.report（'zh-CN'）
 *   t   → sanitizeWorkspaceDescriptor    (2)   ★Ns  ssh 去 password/passphrase、server 去 token
 *   n   → parsePathRootPrefix            (20)   —    Windows 盘符/UNC/绝对/~/ 前缀解析
 *   r   → normalizeTraversalPath         (64)   —    反斜杠归一 + 盘符大写 + ./.. 消解
 *   i   → resolveSshAuthMethod           (83)   —    private-key | password | agent
 *   a   → sshTargetIdentityKey           (86)   ★Ms  ['ssh:v1', host, port, user, authMethod, keyPath] JSON 键
 *   o   → normalizeBuildEnv              (89)   —    'production' | 'test'
 *   s   → RESOLVED_BUILD_ENV             (92)   ★js  = normalizeBuildEnv('production')
 *   c   → isNonNullObject                (94)   —
 *   l   → toPrimitiveString              (97)   —    string|number|bigint → String
 *   u   → unwrapErrorPayload             (100)  —    e.error 有 message/code 时解包
 *   d   → FILE_LOCK_TIMEOUT_CODE         (103)  —    'ZCODE_FILE_LOCK_TIMEOUT'
 *   f   → stringifyErrorValue            (104)  —
 *   ee  → extractErrorInfo               (115)  ★As  {message, code}
 *   te  → isFileLockTimeoutError         (136)  ★ks
 * §2 zod v4.3.6 core — 构造器与工具（jsx 142–532；vendored，语义名取 zod 上游名）
 *   p   → $constructor                   (142)  —    _zod traits/init/deferred 装配
 *   ne  → $ZodAsyncError                 (180)  —
 *   re  → $ZodEncodeError                (185)  —
 *   ie  → $globalConfig                  (190)  —
 *   ae  → $getGlobalConfig               (191)  —
 *   oe  → $getEnumValues                 (194)  —
 *   se  → jsonStringifyReplacer          (198)  —
 *   ce  → $lazy                          (201)  —
 *   le  → nullish                        (214)  —
 *   ue  → stripRegexAnchors              (217)  —
 *   de  → decimalModulo                  (222)  —
 *   fe  → EVALUATING_SENTINEL            (233)  —
 *   m   → $lazyDefine                    (234)  —
 *   pe  → defineWritableProperty         (248)  —
 *   me  → $mergeDefs                     (256)  —
 *   he  → jsonStringify                  (261)  —
 *   ge  → slugify                        (264)  —
 *   _e  → captureStackTrace              (267)  —
 *   ve  → isObject                       (268)  —    本构建排除数组
 *   ye  → $canUseFunction                (271)  —    Cloudflare/jitless 探测
 *   be  → isPlainObject                  (279)  —
 *   xe  → shallowClone                   (286)  —
 *   Se  → PRIMITIVE_TYPES                (291)  —
 *   Ce  → escapeRegex                    (292)  —
 *   h   → clone                          (295)  —    schema 克隆（params.parent）
 *   g   → normalizeCheckParams           (299)  —    message→error 归一
 *   we  → optionalKeys                   (314)  —
 *   Te  → NUMBER_FORMAT_LIMITS           (317)  —    safeint/int32/uint32/float32/float64
 *   Ee  → $pick                          (324)  —
 *   De  → $omit                          (340)  —
 *   Oe  → $extend                        (358)  —
 *   ke  → $safeExtend                    (375)  —
 *   Ae  → $merge                         (387)  —
 *   je  → $partial                       (402)  —
 *   Me  → $nonpartial                    (426)  —
 *   Ne  → $shouldAbort                   (447)  —
 *   Pe  → prefixIssuePath                (452)  —
 *   Fe  → resolveMessageString           (458)  —
 *   Ie  → $cleanIssue                    (461)  —
 *   Le  → resolveOriginKind              (468)  —
 *   Re  → $issue                         (471)  —
 *   ze  → $ZodErrorInternals             (482)  —
 *   Be  → $ZodError                      (494)  —
 *   Ve  → $ZodRealError                  (495)  —
 *   He  → $flattenError                  (498)  —
 *   Ue  → $treeifyError                  (507)  —
 * §3 zod core — 解析执行引擎（jsx 533–652）
 *   We  → makeParseFn                    (533)  —    同步 throw 型
 *   Ge  → makeParseAsyncFn               (550)  —
 *   Ke  → makeSafeParseFn                (566)  —
 *   qe  → safeParseReal                  (586)  —    = Ke($ZodRealError)；~standard 用
 *   Je  → makeSafeParseAsyncFn           (587)  —
 *   Ye  → safeParseAsyncReal             (605)  —    = Je($ZodRealError)
 *   Xe/Ze/Qe/$e → makeEncodeFn/makeDecodeFn/makeEncodeAsyncFn/makeDecodeAsyncFn (606/614/615/623)
 *   et/tt/nt/rt → makeSafeEncodeFn/makeSafeDecodeFn/makeSafeEncodeAsyncFn/makeSafeDecodeAsyncFn (624/632/633/641)
 * §4 zod core — 正则表（jsx 642–690，同 §3 var 链）
 *   it/at/ot/st/ct/lt/ut → cuid/cuid2/ulid/xid/ksuid/nanoid/isoDuration 正则 (642–648)
 *   dt  → uuidGenericRegex               (649)  —    rfc4122
 *   ft  → uuidVersionedRegex             (650)  —    (version?) → RegExp
 *   pt  → emailRegex                     (651)  —
 *   mt/ht → emojiRegexSource/emojiRegex  (652/653)
 *   gt/_t/vt/yt → ipv4/ipv6/ipv4Cidr/ipv6Cidr 正则 (656–659)
 *   bt/xt/St → base64/base64url/e164 正则 (660–662)
 *   Ct/wt → isoDateSource/isoDateRegex  (663/664)
 *   Tt/Et → isoTimeSource/isoTimeRegex  (665/669)
 *   Dt  → isoDateTimeRegex               (672)  —
 *   Ot  → makeStringLengthRegex          (681)  —
 *   kt/At/jt/Mt/Nt/Pt → integer/number/boolean/undefined/lowercase/uppercase 正则 (685–690)
 * §5 zod core — checks（jsx 691–1022）
 *   _   → $ZodCheck                      (691)  —
 *   Ft  → CHECK_ORIGIN_BY_VALUE_TYPE     (695)  —
 *   It/Lt/Rt/zt → $ZodCheckLessThan/$ZodCheckGreaterThan/$ZodCheckMultipleOf/$ZodCheckNumberFormat (700/719/738/754)
 *   Bt/Vt/Ht → $ZodCheckMaxLength/$ZodCheckMinLength/$ZodCheckLengthEquals (818/841/864)
 *   Ut/Wt → $ZodCheckStringFormat/$ZodCheckRegex (895/914)
 *   Gt/Kt → $ZodCheckLowerCase/$ZodCheckUpperCase (927/930)
 *   qt/Jt/Yt → $ZodCheckIncludes/$ZodCheckStartsWith/$ZodCheckEndsWith (933/952/970)
 *   Xt  → $ZodCheckOverwrite             (988)  —
 *   Zt  → JitCodeBuilder                 (993)  —    缩进/编译 Function 的代码写入器
 *   Qt  → ZOD_VERSION                    (1023) —    {major:4, minor:3, patch:6}
 * §6 zod core — schemas（jsx 1028–2030）
 *   v   → $ZodType                       (1028) —    run/check 装配 + ~standard
 *   $t  → $ZodString                     (1106) —
 *   y   → $ZodStringFormat               (1119) —
 *   en/tn/nn/rn/an/on/sn/cn/ln/un/dn → $ZodGUID/$ZodUUID/$ZodEmail/$ZodURL/$ZodEmoji/$ZodNanoID/$ZodCUID/$ZodCUID2/$ZodULID/$ZodXID/$ZodKSUID (1122–1197)
 *   fn/pn/mn/hn → $ZodISODateTime/$ZodISODate/$ZodISOTime/$ZodISODuration (1200–1209)
 *   gn/_n/vn/yn → $ZodIPv4/$ZodIPv6/$ZodCIDRv4/$ZodCIDRv6 (1212–1233)
 *   bn/xn → isValidBase64/$ZodBase64     (1254/1263)
 *   Sn/Cn → isValidBase64URL/$ZodBase64URL (1274/1279)
 *   wn  → $ZodE164                       (1290) —
 *   Tn/En → isValidJWT/$ZodJWT           (1293/1305)
 *   Dn/On/kn/An/jn/Mn/Nn → $ZodNumber/$ZodNumberFormat/$ZodBoolean/$ZodUndefined/$ZodUnknown/$ZodNever/$ZodDate (1316–1374)
 *   Pn/Fn → assignArrayElementResult/$ZodArray (1392/1395)
 *   In/Ln/Rn → assignShapeEntryResult/computeObjectInternals/processCatchallKeys (1417/1424/1436)
 *   zn/Bn → $ZodObject/$ZodObjectJIT     (1461/1515)
 *   Vn/Hn → finalizeUnionParse/$ZodUnion (1592/1602)
 *   Un/Wn → $ZodDiscriminatedUnion/$ZodIntersection (1630/1678)
 *   Gn/Kn → mergeValues/finalizeIntersectionParse (1692/1743)
 *   qn/Jn/Yn/Xn → $ZodRecord/$ZodEnum/$ZodLiteral/$ZodTransform (1760/1832/1846/1859)
 *   Zn/Qn/$n/er/tr/nr → resetIssuesForOptionalUndefined/$ZodOptional/$ZodExactOptional/$ZodNullable/$ZodDefault/applyDefaultValue (1868/1874/1886/1889/1895/1903)
 *   rr/ir/ar → $ZodPrefault/$ZodNonOptional/rejectUndefinedValue (1906/1909/1918)
 *   or/sr/cr → $ZodCatch/$ZodPipe/runPipeStage (1926/1945/1955)
 *   lr/ur → $ZodReadonly/freezePayloadValue (1961/1968)
 *   dr/fr → $ZodCustom/handleCustomCheckResult (1971/1979)
 * §7 zod core — registry + 工厂 + JSON Schema（jsx 1991–2935）
 *   pr/mr/hr/gr → (临时变量)/MetadataRegistry/createMetadataRegistry/$globalRegistry (1991/1992/2026/2030)
 *   _r/vr/yr/br/xr/Sr/Cr/wr/Tr/Er/Dr/Or/kr/Ar/jr/Mr/Nr/Pr/Fr/Ir/Lr/Rr/zr
 *      → $string/$email/$guid/$uuid/$uuidv4/$uuidv6/$uuidv7/$url/$emoji/$nanoid/$cuid/$cuid2/$ulid/$xid/$ksuid/$ipv4/$ipv6/$cidrv4/$cidrv6/$base64/$base64url/$e164/$jwt (2031–2229)
 *   Br/Vr/Hr/Ur/Wr/Gr/Kr/qr/Jr/Yr/Xr → $datetime/$date/$time/$duration/$number/$int/$boolean/$undefined/$unknown/$never/$date (2238–2313)
 *   Zr/Qr/$r/ei/ti/ni/ri/ii/ai/oi/si/ci/li/ui/di → $lt/$lte/$gt/$gte/$multipleOf/$maxLength/$minLength/$length/$regex/$lowercase/$uppercase/$includes/$startsWith/$endsWith/$overwrite (2319–2425)
 *   fi/pi/mi/hi/gi → $normalize/$trim/$toLowerCase/$toUpperCase/$slugify (2431–2443)
 *   _i/vi/yi/bi → $array/$custom/$superRefine/defineCheck (2446–2477)
 *   xi/b/Si/Ci/x → initJsonSchemaContext/processJsonSchemaNode/resolveJsonSchemaRefs/finalizeJsonSchema/schemaContainsTransform (2477/2493/2527/2610/2671)
 *   wi/Ti/Ei → makeToJsonSchemaFn/makeIoJsonSchemaFn/JSON_SCHEMA_FORMAT_MAP (2700/2707/2720)
 *   Di/Oi/ki/Ai/ji/Mi/Ni/Pi/Fi/Ii/Li/Ri/zi/Bi/Vi/Hi/Ui/Wi/Gi/Ki/qi/Ji/Yi
 *      → JSON Schema 类型处理器 ×19（string/number/boolean/undefined/never/date/enum/literal/custom/transform/array/object/union/intersection/record/nullable/nonoptional/default/prefault/catch/pipe/readonly/optional）(2727–2927)
 * §8 zod classic（jsx 2933–3402）
 *   Xi/Zi → ZodISODateTime/isoDateTimeCheck (2933/2936)
 *   Qi/$i → ZodISODate/isoDateCheck      (2939/2942)
 *   ea/ta → ZodISOTime/isoTimeCheck      (2945/2948)
 *   na/ra → ZodISODuration/isoDurationCheck (2951/2954)
 *   ia  → ZodErrorInternals              (2957) —    format/flatten/addIssue(s)/isEmpty
 *   S   → ZodError                       (2983) —    Parent: Error
 *   aa/oa/sa/ca/la/ua/da/fa/pa/ma/ha/ga → parse/parseAsync/safeParse/safeParseAsync/encode/decode/encodeAsync/decodeAsync/safeEncode/safeDecode/safeEncodeAsync/safeDecodeAsync 实现 (2986–2997)
 *   C   → ZodType（classic 基类）         (2998) —    全方法面（check/parse/…/apply）
 *   _a/va → _ZodString/ZodString          (3036/3041)
 *   w   → zString（z.string 工厂）        (3044) ★Es
 *   T   → ZodStringFormat（classic）      (3047)
 *   ya/ba/xa/Sa/Ca/wa/Ta/Ea/Da/Oa/ka/Aa/ja/Ma/Na/Pa/Fa/Ia/La
 *      → ZodEmail/ZodGUID/ZodUUID/ZodURL/ZodEmoji/ZodNanoID/ZodCUID/ZodCUID2/ZodULID/ZodXID/ZodKSUID/ZodIPv4/ZodIPv6/ZodCIDRv4/ZodCIDRv6/ZodBase64/ZodBase64URL/ZodE164/ZodJWT (3050–3104)
 *   Ra/E → ZodNumber/zNumber              (3107/3112) ★Es 系（E ★Cs）
 *   za/Ba → ZodNumberFormat/intCheck      (3115/3118)
 *   Va/D → ZodBoolean/zBoolean            (3121/3124) ★ys
 *   Ha/Ua → ZodUndefined/zUndefined       (3127/3130)
 *   Wa/O → ZodUnknown/zUnknown            (3133/3136) ★Os
 *   Ga/Ka → ZodNever/zNever               (3139/3142) ★Ss
 *   qa/Ja → ZodDate/zDate                 (3145/3150)
 *   Ya/k → ZodArray/zArray                (3153/3156) ★vs
 *   Xa/A → ZodObject/zObject              (3159/3177) ★ws
 *   Za/j → ZodUnion/zUnion                (3184/3187) ★Ds
 *   Qa/M → ZodDiscriminatedUnion/zDiscriminatedUnion (3194/3197) ★bs
 *   $a/eo → ZodIntersection/zIntersection (3205/3208)
 *   to/N → ZodRecord/zRecord              (3215/3218) ★Ts
 *   no  → looseRecord                     (3226) —
 *   ro/P → ZodEnum/zEnum                  (3235/3260) ★_s
 *   io/F → ZodLiteral/zLiteral            (3267/3275) ★xs
 *   ao/oo → ZodTransform/zTransform       (3282/3295)
 *   so/co → ZodOptional/zOptional         (3301/3304)
 *   lo/uo → ZodExactOptional/zExactOptional (3310/3313)
 *   fo/po → ZodNullable/zNullable         (3319/3322)
 *   mo/ho → ZodDefault/zDefault           (3328/3331)
 *   go/_o → ZodPrefault/zPrefault         (3340/3343)
 *   vo/yo → ZodNonOptional/zNonOptional   (3352/3355)
 *   bo/xo → ZodCatch/zCatch               (3362/3365)
 *   So/Co → ZodPipe/zPipe                 (3372/3375)
 *   wo/To → ZodReadonly/zReadonly         (3382/3385)
 *   Eo/Do/Oo/ko → ZodCustom/refine/superRefine/transformPipe (3391/3394/3397/3400)
 * §9 first-party — 问题码常量 + browser-use 协议（jsx 3403–3858）
 *   Ao  → ISSUE_CODES                    (3403) ★gs
 *   jo  → (空命名空间残留)                (3416)
 *   Mo  → BROWSER_VIEWPORT_LIMITS        (3418) ★hs  320–3840 × 320–2160
 *   No/Po → browserViewportSchema/browserViewportBoundsSchema (3424/3428)
 *   Fo  → clientModeEnum                 (3433) —    desktop-continuous | web-remote-replayable
 *   Io  → browserErrorCodeEnum           (3441) —    backend_unavailable…execution_error 9 值
 *   Lo  → browserPageStateSchema         (3442)
 *   Ro/zo/Bo → mouseButtonEnum/keyboardModifierEnum/pointSchema (3452/3453/3454)
 *   Vo/Ho/Uo/Wo → locatorOperationEnum/locatorModifierEnum/timeoutMsSchema/selectOptionSchema (3458/3459/3460/3461)
 *   Go  → playwrightActionSchema         (3466) —    domSnapshot…locator 10 分支
 *   Ko  → browserRequestSchema           (3524) —    navigate…list 45 分支
 *   qo/Jo/Yo → browserBackendTypeEnum/browserCapabilityRefSchema/browserDescriptorSchema (3724/3725/3729)
 *   Xo  → sessionContextEnum             (3741) —    live | cached
 *   Zo/Qo/$o/es/ts/ns/rs/is/as → rectSchema/domElementSchema/domNodeSchema/domSnapshotSchema/browserTabSchema/userTabSchema/browserDialogSchema/browserMetaSchema/browserResultSchema (3758–3829)
 *   os/ss → ASSET_INSTALL_MODES/DEFAULT_ASSET_INSTALL_MODE (3851/3852) ★ms/—
 *   cs/ls/us → FILE_TRANSFER_CAPABILITIES/ALL_FILE_TRANSFER_CAPABILITIES/REMOTE_FILE_TRANSFER_CAPABILITIES (3853/3854/3855)
 *   ds/fs/ps → fileTransferCapabilitySet/listFileTransferCapabilities/isFileTransferCapability (3857/3859/3862) ★ps/—
 * §10 first-party — agent CLI 与用量 schema（jsx 3865–3949）
 *   I   → agentCliProviderEnum           (3865) —    claude/opencode/gemini/codex/glm
 *   ms  → USAGE_REPORT_RANGES            (3866) ★fs  ['7d','30d']
 *   hs/gs/_s/vs/ys/bs/xs/Ss/Cs → 用量统计 schema ×9（收藏模型/汇总/日档/周档/热图/日模型/日模型用量/模型明细/工具统计）(3867–3921)
 *   ws  → DEFAULT_AGENT_NAME             (3942) ★ls  'zcodeAgent'
 *   Ts  → BUILTIN_AGENT_CLI_PROVIDERS    (3943) —    ['glm']
 *   Es  → resolveDefaultAgentCliProvider (3944) ★ds  恒 'glm'
 *   Ds  → isGlmAgentCliProvider          (3947) ★us
 * §11 first-party — 会话/消息协议 schema（jsx 3950–4290）
 *   L/R/z → nonEmptyString/unknownRecord/timestampMs 基础 schema (3950/3951/3952)
 *   Os/ks/As → clientModeEnum2/messageVisibilityEnum/syntheticSourceEnum (3953/3954/3955)
 *   B   → workspaceRefSchema             (3956)
 *   js/Ms/Ns/Ps/Fs → permissionDecisionEnum/permissionBehaviorEnum/permissionRuleSchema/addRulesUpdateSchema/permissionResponseSchema (3962–3973) ★Fs→ss
 *   V   → modelRefSchema                 (3979)
 *   Is/Ls/Rs → sessionModeEnum/sessionStatusEnum/sessionKindEnum (3984/3985/3986)
 *   zs/Bs/Vs/Hs/Us → goalTargetSchema/goalVerificationResultSchema/goalVerificationTimelineSchema/sessionDescriptorSchema/subagentOriginSchema (3987–4038) ★Us→os
 *   Ws/Gs/Ks/qs → messageTimeSchema/tokenUsageSchema/messageSemanticsSchema/messageInfoSchema (4049–4072)
 *   H/Js/Ys/Xs/Zs/Qs/$s → partBaseSchema/toolStateSchema/labeledModelRefSchema/timeRangeSchema/timelinePartSchema/messagePartSchema/messageWithPartsSchema (4105–4239)
 *   ec/tc/nc/rc/ic → apiRetrySchema/cacheStatsSchema/contextBreakdownSchema/contextUsageSchema/sessionStateEventSchema (4243–4276) ★tc→cs、nc→as
 *   ac  → extractTextFromParts           (4288)
 * §12 first-party — bots/WSL/端点（jsx 4291–4509）
 *   oc/sc → BOT_PROVIDER_IDS/imBindingSchema (4291/4292) ★sc→is
 *   cc  → isFeishuOrLark                 (4298) ★ns
 *   lc  → BOT_REPLY_MODES                (4301) —    4 值
 *   uc/dc/fc → BOTS_STREAM_TIMEOUT_MS=30000/BOTS_TASK_CHANNEL/BOTS_TASK_STREAM_CHANNEL (4302/4303/4304) ★Zo/Qo/$o
 *   pc/mc/hc/gc/_c/vc/yc → botAllowedCommandsSchema/botCurrentOptionsSchema/botDraftOptionsSchema/botQuestionOptionSchema/botQuestionSchema/botElicitationSchema/botConfigSchema (4305–4358)
 *   bc  → DEFAULT_BOT_REPLY_MODE         (4403) ★es  'assistant_changes'
 *   xc/Sc → availableReplyModesForProvider/resolveBotReplyMode (4404/4407) ★ts/rs
 *   Cc/wc/Tc → isValidWslUser/containsControlCharacter/wslUserSchema (4412/4416/4423) ★Xo
 *   Ec/Dc/Oc/kc/Ac → ZCODE_PRODUCTION_ORIGIN/ZCODE_TEST_ORIGIN/BIGMODEL_PRODUCTION_ORIGIN/BIGMODEL_DEV_ORIGIN/REMOTE_V4_MIN_APP_VERSION (4426–4430)
 *   jc/Mc/Nc/Pc/Fc/Ic/Lc/Rc/zc/Bc/Vc/Hc → isAppVersionAbove/ readEnvValue/normalizeEndpointOrigin/resolveZcodeOriginByEnv/resolveBuildEnvFromVars/resolveZcodeEndpointOrigin/resolveZcodeEndpointConfig/resolveBigmodelApiBaseUrl/buildBigmodelApiUrl/codingPlanPersonalOverviewUrl/codingPlanTeamPlansUrl/buildZcodeEndpointConfig (4431–4493) ★Yo/Ko/qo/Jo
 * §13 first-party — 设置 schema 与迁移（jsx 4510–4830）
 *   U/Uc/Wc/Gc/Kc/qc → settingsNonEmptyString/localeEnum/localePreferenceEnum/interactionBehaviorEnum/updateChannelEnum/zoomLevelSchema (4510–4515)
 *   Jc/Yc/Xc/Zc/Qc → integratedTerminalShellSchema/builtinAgentCliProvidersSchema/providerFamilyModesSchema/providerFamilyDomainEnum/providerFamilySelectedKeysSchema (4516–4531)
 *   $c  → isRepoSnapshotIndexingUserEnabled (4535) ★Go
 *   el/tl/nl/rl/il/al/ol → releaseNotesSchema/skippedUpdateVersionsSchema/remoteTargetSchema/workspaceSessionEntrySchema/webRemoteRelayDeviceSchema/webRemoteEnabledContextSchema/zcodeEndpointOriginSchema (4538–4599)
 *   sl/cl/ll/ul → migrateZcodeEndpointOrigin/migrateOptimizeAgentExperience/migrateCloseToTrayOnWindows/migrateLocalePreference (4608/4623/4632/4641)
 *   dl/fl/pl/ml → remoteWorkspaceHistoryEntrySchema/migrateEnabledBuiltinAgentCliProviders/stripResourcePackagesFromTarget/migrateLastWorkspaceSession (4651/4661/4667/4677)
 * §14 first-party — 供应商/模型注册表（jsx 4831–4901）
 *   hl  → approvalPolicyEnum             (4831) —    10 值
 *   gl  → BUILTIN_PROVIDER_PREFIX        (4832) —    'builtin:'
 *   W   → providerIds                    (4833) ★mo  已登记：providerIds（ExtendedViews.report：styles 侧 q=mo；值域 builtin: 前缀 7 键）
 *   _l/vl/yl/bl → isBuiltinProviderId/isZaiPlanProviderId/isStartPlanProviderId/isCodingPlanProviderId (4842/4845/4848/4851) ★Eo/Po/No/Do
 *   xl/Sl/Cl/wl → GLM_MODEL_IDS/GLM_REASONING_LEVELS/GLM_DEFAULT_MODEL_PREFIX/GLM_DATED_MODEL_REGEX (4854–4857) ★vo
 *   Tl  → isGlmModelId                   (4858) ★Oo
 *   El  → CLAUDE_TO_GLM_MODEL_MAP        (4863) ★yo
 *   Dl/Ol/kl/Al/jl/Ml/Nl/Pl/Fl/Il/Ll → modelAliasOverrideSchema/apiFormatEnum/wireFormatEnum/providerKindEnum/devProviderIdEnum/modalityEnum/envPathSchema/envOverrideSchema/reasoningLevelConfigSchema/endpointsByKindSchema/providerEndpointsSchema (4871–4898)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖：无。本 chunk 为全图依赖底，零 import（React 亦不使用）。
 *     类型脚手架仅服务 strict tsc，运行时语义与原件逐字一致。
 * ============================================================================
 */

/* ============================================================================
 * §0 类型脚手架（zod 内部面以 any 承载；运行时行为零改动）
 * ==========================================================================*/

type ZodInst = any;
type ZodDef = any;
interface ParsePayload {
  value: any;
  issues: any[];
  aborted?: boolean;
  [key: string]: any;
}
interface ParseContext {
  async?: boolean;
  direction?: "forward" | "backward";
  skipChecks?: boolean;
  jitless?: boolean;
  reportInput?: boolean;
  [key: string]: any;
}
interface WorkspaceDescriptor {
  kind: string;
  [key: string]: any;
}

/* ============================================================================
 * §1 first-party 基础助手（jsx 1–141）
 * ==========================================================================*/

/** jsx 1 ★Ps —— 已登记：I18n.report / intlProvider.report（Ps='zh-CN' DEFAULT_LOCALE） */
export const DEFAULT_LOCALE = `zh-CN`;

/** jsx 2 ★Ns —— ssh 描述符去 password/privateKeyPassphrase；server 描述符去 token */
export function sanitizeWorkspaceDescriptor(descriptor: WorkspaceDescriptor): WorkspaceDescriptor {
  if (descriptor.kind === `ssh`) {
    let {
      password: password,
      privateKeyPassphrase: privateKeyPassphrase,
      ...rest
    } = descriptor;
    return rest;
  }
  if (descriptor.kind === `server`) {
    let {
      token: token,
      ...rest
    } = descriptor;
    return rest;
  }
  return descriptor;
}

interface PathRootPrefix {
  prefix: string;
  body: string;
  blocksParentTraversal: boolean;
}

/** jsx 20 —— Windows 盘符（`C:/` 与 `C:` 两形）、UNC（`//srv/share`）、POSIX 绝对、`~/` 四路前缀解析 */
function parsePathRootPrefix(path: string): PathRootPrefix {
  let driveSlash = path.match(/^([A-Z]:)\/(.*)$/);
  if (driveSlash) return {
    prefix: `${driveSlash[1]}/`,
    body: driveSlash[2] ?? ``,
    blocksParentTraversal: !0
  };
  if (path.startsWith(`//`)) {
    let segments = path.slice(2).split(`/`).filter(Boolean);
    if (segments.length >= 2) {
      let [server, share, ...rest] = segments;
      return {
        prefix: `//${server}/${share}/`,
        body: rest.join(`/`),
        blocksParentTraversal: !0
      };
    }
    return {
      prefix: `//`,
      body: segments.join(`/`),
      blocksParentTraversal: !0
    };
  }
  if (path.startsWith(`/`)) return {
    prefix: `/`,
    body: path.replace(/^\/+/, ``),
    blocksParentTraversal: !0
  };
  if (path.startsWith(`~/`)) return {
    prefix: `~/`,
    body: path.slice(2),
    blocksParentTraversal: !1
  };
  let driveOnly = path.match(/^([A-Z]:)(.*)$/);
  return driveOnly ? {
    prefix: driveOnly[1] ?? ``,
    body: driveOnly[2] ?? ``,
    blocksParentTraversal: !1
  } : {
    prefix: ``,
    body: path,
    blocksParentTraversal: !1
  };
}

/** jsx 64 —— 反斜杠归一 + 盘符大写 + `.`/`..` 段消解（`..` 越界时按 blocksParentTraversal 裁决） */
function normalizeTraversalPath(raw?: string | null): string {
  let trimmed = raw?.trim();
  if (!trimmed) return ``;
  let root = parsePathRootPrefix(trimmed.replace(/\\/g, `/`).replace(/^([a-z]):/i, (m, drive) => `${drive.toUpperCase()}:`)),
    segments: string[] = [];
  for (let segment of root.body.split(`/`)) if (!(!segment || segment === `.`)) {
    if (segment === `..`) {
      if (segments.length > 0 && segments.at(-1) !== `..`) {
        segments.pop();
        continue;
      }
      if (root.blocksParentTraversal) continue;
      segments.push(segment);
      continue;
    }
    segments.push(segment);
  }
  return `${root.prefix}${segments.join(`/`)}` || root.prefix;
}

/** jsx 83 —— ssh 认证方式三态判定：私钥路径 → private-key；password/passwordCredentialKey → password；否则 agent */
function resolveSshAuthMethod(descriptor: any): `private-key` | `password` | `agent` {
  return descriptor.privateKeyPath?.trim() ? `private-key` : `password` in descriptor && typeof descriptor.password == `string` || `passwordCredentialKey` in descriptor && descriptor.passwordCredentialKey?.trim() ? `password` : `agent`;
}

/** jsx 86 ★Ms —— ssh 目标身份键（版本化 JSON 元组：host 小写、port 缺省 22、认证方式、私钥路径归一） */
export function sshTargetIdentityKey(descriptor: any): string {
  return JSON.stringify([`ssh:v1`, descriptor.host.trim().toLowerCase(), descriptor.port ?? 22, descriptor.username.trim(), resolveSshAuthMethod(descriptor), normalizeTraversalPath(descriptor.privateKeyPath)]);
}

/** jsx 89 —— 环境归一：仅 'production'（大小写空白宽容）为生产，其余一律 test */
function normalizeBuildEnv(value?: string | null): `production` | `test` {
  return value?.trim().toLowerCase() === `production` ? `production` : `test`;
}

/** jsx 92 ★js */
export const RESOLVED_BUILD_ENV = normalizeBuildEnv(`production`);
// jsx 93 —— 原样保留的调试探针（死代码）：`typeof process < 'u'` 即 process 存在时读 `{}.ZCODE_DEBUG`（恒 undefined）
typeof process < `u` && ({} as { ZCODE_DEBUG?: unknown }).ZCODE_DEBUG;

/** jsx 94 */
function isNonNullObject(value: unknown): value is object {
  return typeof value == `object` && !!value;
}

/** jsx 97 */
function toPrimitiveString(value: unknown): string | undefined {
  if (typeof value == `string` || typeof value == `number` || typeof value == `bigint`) return String(value);
}

/** jsx 100 —— 载荷带 error 子对象（含 message 或 code）时解包，否则原样返回 */
function unwrapErrorPayload(value: any): any {
  return !isNonNullObject(value) || !(`error` in value) || !isNonNullObject(value.error) ? value : `message` in value.error || `code` in value.error ? value.error : value;
}

/** jsx 103 */
const FILE_LOCK_TIMEOUT_CODE = `ZCODE_FILE_LOCK_TIMEOUT`;

/** jsx 104 —— 任意值 → 错误文案字符串（JSON.stringify 兜底 String） */
function stringifyErrorValue(value: any): string {
  if (typeof value == `string`) return value;
  if (value === null) return `null`;
  if (value === void 0) return `undefined`;
  if (typeof value == `number` || typeof value == `boolean` || typeof value == `bigint`) return String(value);
  try {
    let json = JSON.stringify(value);
    if (json !== void 0) return json;
  } catch {}
  return String(value);
}

/** jsx 115 ★As —— Error/对象/任意值 → {message, code} 归一 */
export function extractErrorInfo(value: any): { message: string; code?: string } {
  let unwrapped = unwrapErrorPayload(value);
  if (unwrapped instanceof Error) {
    let error = unwrapped as Error & { code?: unknown };
    return {
      message: unwrapped.message || unwrapped.name || String(unwrapped),
      code: toPrimitiveString(error.code)
    };
  }
  if (isNonNullObject(unwrapped)) {
    let code = `code` in unwrapped ? toPrimitiveString((unwrapped as any).code) : void 0,
      message = `message` in unwrapped ? stringifyErrorValue((unwrapped as any).message) : stringifyErrorValue(unwrapped);
    return {
      message: message !== `undefined` && message.length > 0 ? message : stringifyErrorValue(unwrapped),
      code: code
    };
  }
  return {
    message: stringifyErrorValue(unwrapped)
  };
}

/** jsx 136 ★ks */
export function isFileLockTimeoutError(value: any): boolean {
  return extractErrorInfo(value).code === FILE_LOCK_TIMEOUT_CODE;
}

// jsx 139–141 —— 匿名冻结对象（模块级副作用语句，原样保留）
Object.freeze({
  status: `aborted`
});

/* ============================================================================
 * §2 zod v4.3.6 core —— 构造器与工具（jsx 142–532）
 *    vendored 库体（随 first-party chunk 捆绑）；语义名取 zod 上游名，
 *    逐字重建（类名/字符串/分支零改动）；内核移植期可以 npm zod@4.3.6 整体替换。
 * ==========================================================================*/

/** jsx 142 —— zod $constructor：traits 装配 + 原型方法绑定 + deferred 钩子 + hasInstance 判定 */
function $constructor(traits: string, init: (inst: ZodInst, def: ZodDef) => void, params?: { Parent?: any }): any {
  function initialize(inst: ZodInst, def: ZodDef) {
    if (inst._zod || Object.defineProperty(inst, `_zod`, {
      value: {
        def: def,
        constr: Klass,
        traits: new Set<string>()
      },
      enumerable: !1
    }), inst._zod.traits.has(traits)) return;
    inst._zod.traits.add(traits), init(inst, def);
    let proto = Klass.prototype,
      keys = Object.keys(proto);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      key in inst || (inst[key] = proto[key].bind(inst));
    }
  }
  let Base = params?.Parent ?? Object;
  class Intermediate extends Base {}
  Object.defineProperty(Intermediate, `name`, {
    value: traits
  });
  function Klass(this: any, def: ZodDef) {
    var _a;
    let inst = params?.Parent ? new (Intermediate as any)() : this;
    initialize(inst, def), (_a = inst._zod).deferred ?? (_a.deferred = []);
    for (let fn of inst._zod.deferred) fn();
    return inst;
  }
  return Object.defineProperty(Klass, `init`, {
    value: initialize
  }), Object.defineProperty(Klass, Symbol.hasInstance, {
    value: (value: any) => params?.Parent && value instanceof params.Parent ? !0 : value?._zod?.traits?.has(traits)
  }), Object.defineProperty(Klass, `name`, {
    value: traits
  }), Klass;
}

/** jsx 180 */
const $ZodAsyncError = class extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
};

/** jsx 185 */
const $ZodEncodeError = class extends Error {
  constructor(name: string) {
    super(`Encountered unidirectional transform during encode: ${name}`), this.name = `ZodEncodeError`;
  }
};

/** jsx 190 —— zod 全局配置对象（jitless/customError/localeError 等） */
const $globalConfig: Record<string, any> = {};

/** jsx 191 */
function $getGlobalConfig(config?: Record<string, any>) {
  return config && Object.assign($globalConfig, config), $globalConfig;
}

/** jsx 194 —— TS 数字枚举值提取（过滤反向映射） */
function $getEnumValues(enumObject: Record<string, any>): any[] {
  let numericValues = Object.values(enumObject).filter(value => typeof value == `number`);
  return Object.entries(enumObject).filter(([key]) => numericValues.indexOf(+key) === -1).map(([, value]) => value);
}

/** jsx 198 —— JSON.stringify 的 bigint 转换器 */
function jsonStringifyReplacer(_key: string, value: any) {
  return typeof value == `bigint` ? value.toString() : value;
}

/** jsx 201 —— 惰性求值缓存（首次访问 value 时求值并固化） */
function $lazy<T>(fn: () => T): { value: T } {
  return {
    get value() {
      {
        let computed = fn();
        return Object.defineProperty(this, `value`, {
          value: computed
        }), computed;
      }
      throw Error(`cached value already set`);
    }
  } as { value: T };
}

/** jsx 214 */
function nullish(value: unknown): boolean {
  return value == null;
}

/** jsx 217 —— 去掉正则源码首尾 ^/$ 锚点（供并集模式拼接） */
function stripRegexAnchors(source: string): string {
  let lead = +!!source.startsWith(`^`),
    end = source.endsWith(`$`) ? source.length - 1 : source.length;
  return source.slice(lead, end);
}

/** jsx 222 —— 十进制安全取模（multiple_of 检查用；先按最大小数位放大为整数） */
function decimalModulo(value: number, divisor: number): number {
  let valueDecimals = (value.toString().split(`.`)[1] || ``).length,
    divisorText = divisor.toString(),
    divisorDecimals = (divisorText.split(`.`)[1] || ``).length;
  if (divisorDecimals === 0 && /\d?e-\d?/.test(divisorText)) {
    let exp = divisorText.match(/\d?e-(\d?)/);
    exp?.[1] && (divisorDecimals = Number.parseInt(exp[1]));
  }
  let scale = valueDecimals > divisorDecimals ? valueDecimals : divisorDecimals;
  return Number.parseInt(value.toFixed(scale).replace(`.`, ``)) % Number.parseInt(divisor.toFixed(scale).replace(`.`, ``)) / 10 ** scale;
}

/** jsx 233 */
const EVALUATING_SENTINEL = Symbol(`evaluating`);

/** jsx 234 —— 惰性属性定义（首次 get 时求值；哨兵防递归） */
function $lazyDefine(obj: any, prop: string, fn: () => any) {
  let cached: any;
  Object.defineProperty(obj, prop, {
    get() {
      if (cached !== EVALUATING_SENTINEL) return cached === void 0 && (cached = EVALUATING_SENTINEL, cached = fn()), cached;
    },
    set(value) {
      Object.defineProperty(obj, prop, {
        value: value
      });
    },
    configurable: !0
  });
}

/** jsx 248 */
function defineWritableProperty(obj: any, prop: string, value: any) {
  Object.defineProperty(obj, prop, {
    value: value,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}

/** jsx 256 —— def 合并（属性描述符级，保留 getter） */
function $mergeDefs(...defs: any[]): any {
  let merged: Record<string, PropertyDescriptor> = {};
  for (let def of defs) Object.assign(merged, Object.getOwnPropertyDescriptors(def));
  return Object.defineProperties({}, merged);
}

/** jsx 261 */
function jsonStringify(value: any): string {
  return JSON.stringify(value);
}

/** jsx 264 —— slug 化（小写、去标点、空白/下划线 → 连字符、去首尾连字符） */
function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^\w\s-]/g, ``).replace(/[\s_-]+/g, `-`).replace(/^-+|-+$/g, ``);
}

/** jsx 267 */
const captureStackTrace: (error: Error, callee?: unknown) => void = `captureStackTrace` in Error ? (Error.captureStackTrace as any) : (..._args: any[]) => {};

/** jsx 268 —— zod 对象判定（本构建排除数组） */
function isObject(value: unknown): boolean {
  return typeof value == `object` && !!value && !Array.isArray(value);
}

/** jsx 271 —— 运行时 Function 构造可用性（Cloudflare Workers jitless 探测） */
const $canUseFunction = $lazy(() => {
  if (typeof navigator < `u` && navigator?.userAgent?.includes(`Cloudflare`)) return !1;
  try {
    return Function(``), !0;
  } catch {
    return !1;
  }
});

/** jsx 279 —— 纯对象判定（构造器原型链 isPrototypeOf 检查） */
function isPlainObject(value: any): boolean {
  if (isObject(value) === !1) return !1;
  let ctor = value.constructor;
  if (ctor === void 0 || typeof ctor != `function`) return !0;
  let proto = ctor.prototype;
  return !(isObject(proto) === !1 || Object.prototype.hasOwnProperty.call(proto, `isPrototypeOf`) === !1);
}

/** jsx 286 —— 浅克隆（纯对象/数组） */
function shallowClone<T>(value: T): T {
  return (isPlainObject(value) ? {
    ...value
  } : Array.isArray(value) ? [...value] : value) as T;
}

/** jsx 291 */
const PRIMITIVE_TYPES = new Set([`string`, `number`, `symbol`]);

/** jsx 292 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}

/** jsx 295 —— schema 克隆（新 def 缺省取原 def；params.parent 时挂父引用） */
function clone(inst: ZodInst, def?: ZodDef, params?: { parent?: boolean }): ZodInst {
  let cloned = new inst._zod.constr(def ?? inst._zod.def);
  return (!def || params?.parent) && (cloned._zod.parent = inst), cloned;
}

/** jsx 299 —— check 参数归一：字符串 → {error: () => s}；message → error（二者互斥） */
function normalizeCheckParams(params?: any): any {
  let normalized = params;
  if (!normalized) return {};
  if (typeof normalized == `string`) return {
    error: () => normalized
  };
  if (normalized?.message !== void 0) {
    if (normalized?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
    normalized.error = normalized.message;
  }
  return delete normalized.message, typeof normalized.error == `string` ? {
    ...normalized,
    error: () => normalized.error
  } : normalized;
}

/** jsx 314 —— shape 中 in/out 双向皆可缺省的键 */
function optionalKeys(shape: Record<string, ZodInst>): string[] {
  return Object.keys(shape).filter(key => shape[key]._zod.optin === `optional` && shape[key]._zod.optout === `optional`);
}

/** jsx 317 —— 数字格式值域（safeint/int32/uint32/float32/float64） */
const NUMBER_FORMAT_LIMITS: Record<string, [number, number]> = {
  safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};

/** jsx 324 —— object.pick（带 refinement 的 shape 禁用） */
function $pick(inst: ZodInst, mask: Record<string, any>): ZodInst {
  let def = inst._zod.def,
    checks = def.checks;
  if (checks && checks.length > 0) throw Error(`.pick() cannot be used on object schemas containing refinements`);
  return clone(inst, $mergeDefs(inst._zod.def, {
    get shape() {
      let picked: Record<string, any> = {};
      for (let key in mask) {
        if (!(key in def.shape)) throw Error(`Unrecognized key: "${key}"`);
        mask[key] && (picked[key] = def.shape[key]);
      }
      return defineWritableProperty(this, `shape`, picked), picked;
    },
    checks: []
  }));
}

/** jsx 340 —— object.omit */
function $omit(inst: ZodInst, mask: Record<string, any>): ZodInst {
  let def = inst._zod.def,
    checks = def.checks;
  if (checks && checks.length > 0) throw Error(`.omit() cannot be used on object schemas containing refinements`);
  return clone(inst, $mergeDefs(inst._zod.def, {
    get shape() {
      let omitted: Record<string, any> = {
        ...inst._zod.def.shape
      };
      for (let key in mask) {
        if (!(key in def.shape)) throw Error(`Unrecognized key: "${key}"`);
        mask[key] && delete omitted[key];
      }
      return defineWritableProperty(this, `shape`, omitted), omitted;
    },
    checks: []
  }));
}

/** jsx 358 —— object.extend（refinement 存在时禁止覆写既有键） */
function $extend(inst: ZodInst, shape: Record<string, any>): ZodInst {
  if (!isPlainObject(shape)) throw Error(`Invalid input to extend: expected a plain object`);
  let checks = inst._zod.def.checks;
  if (checks && checks.length > 0) {
    let existing = inst._zod.def.shape;
    for (let key in shape) if (Object.getOwnPropertyDescriptor(existing, key) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  return clone(inst, $mergeDefs(inst._zod.def, {
    get shape() {
      let merged = {
        ...inst._zod.def.shape,
        ...shape
      };
      return defineWritableProperty(this, `shape`, merged), merged;
    }
  }));
}

/** jsx 375 —— object.safeExtend（允许覆写） */
function $safeExtend(inst: ZodInst, shape: Record<string, any>): ZodInst {
  if (!isPlainObject(shape)) throw Error(`Invalid input to safeExtend: expected a plain object`);
  return clone(inst, $mergeDefs(inst._zod.def, {
    get shape() {
      let merged = {
        ...inst._zod.def.shape,
        ...shape
      };
      return defineWritableProperty(this, `shape`, merged), merged;
    }
  }));
}

/** jsx 387 —— object.merge（catchall 取右侧，checks 清空） */
function $merge(inst: ZodInst, other: ZodInst): ZodInst {
  return clone(inst, $mergeDefs(inst._zod.def, {
    get shape() {
      let merged = {
        ...inst._zod.def.shape,
        ...other._zod.def.shape
      };
      return defineWritableProperty(this, `shape`, merged), merged;
    },
    get catchall() {
      return other._zod.def.catchall;
    },
    checks: []
  }));
}

/** jsx 402 —— object.partial（mask 缺省 = 全键；Optional 构造器注入） */
function $partial(Optional: any, inst: ZodInst, mask?: Record<string, any>): ZodInst {
  let checks = inst._zod.def.checks;
  if (checks && checks.length > 0) throw Error(`.partial() cannot be used on object schemas containing refinements`);
  return clone(inst, $mergeDefs(inst._zod.def, {
    get shape() {
      let shape = inst._zod.def.shape,
        partialShape: Record<string, any> = {
          ...shape
        };
      if (mask) for (let key in mask) {
        if (!(key in shape)) throw Error(`Unrecognized key: "${key}"`);
        mask[key] && (partialShape[key] = Optional ? new Optional({
          type: `optional`,
          innerType: shape[key]
        }) : shape[key]);
      } else for (let key in shape) partialShape[key] = Optional ? new Optional({
        type: `optional`,
        innerType: shape[key]
      }) : shape[key];
      return defineWritableProperty(this, `shape`, partialShape), partialShape;
    },
    checks: []
  }));
}

/** jsx 426 —— object.required（NonOptional 构造器注入） */
function $nonpartial(NonOptional: any, inst: ZodInst, mask?: Record<string, any>): ZodInst {
  return clone(inst, $mergeDefs(inst._zod.def, {
    get shape() {
      let shape = inst._zod.def.shape,
        requiredShape: Record<string, any> = {
          ...shape
        };
      if (mask) for (let key in mask) {
        if (!(key in requiredShape)) throw Error(`Unrecognized key: "${key}"`);
        mask[key] && (requiredShape[key] = new NonOptional({
          type: `nonoptional`,
          innerType: shape[key]
        }));
      } else for (let key in shape) requiredShape[key] = new NonOptional({
        type: `nonoptional`,
        innerType: shape[key]
      });
      return defineWritableProperty(this, `shape`, requiredShape), requiredShape;
    }
  }));
}

/** jsx 447 —— 解析中止判定（aborted 或首个非 continue issue） */
function $shouldAbort(payload: ParsePayload, index = 0): boolean {
  if (payload.aborted === !0) return !0;
  for (let i = index; i < payload.issues.length; i++) if (payload.issues[i]?.continue !== !0) return !0;
  return !1;
}

/** jsx 452 —— issue 路径前缀（unshift 段键） */
function prefixIssuePath(segment: PropertyKey, issues: any[]): any[] {
  return issues.map(issue => {
    var target = issue;
    return (target).path ?? (target.path = []), issue.path.unshift(segment), issue;
  });
}

/** jsx 458 */
function resolveMessageString(value: any): string | undefined {
  return typeof value == `string` ? value : value?.message;
}

/** jsx 461 —— issue 净化：补 message（inst.def.error → ctx.error → customError → localeError → 缺省），删 inst/continue，reportInput 门控 input */
function $cleanIssue(issue: any, ctx: ParseContext | undefined, config: Record<string, any>): any {
  let cleaned: any = {
    ...issue,
    path: issue.path ?? []
  };
  return issue.message || (cleaned.message = resolveMessageString(issue.inst?._zod.def?.error?.(issue)) ?? resolveMessageString(ctx?.error?.(issue)) ?? resolveMessageString(config.customError?.(issue)) ?? resolveMessageString(config.localeError?.(issue)) ?? `Invalid input`), delete cleaned.inst, delete cleaned.continue, ctx?.reportInput || delete cleaned.input, cleaned;
}

/** jsx 468 —— issue origin 档位（array/string/unknown） */
function resolveOriginKind(value: any): `array` | `string` | `unknown` {
  return Array.isArray(value) ? `array` : typeof value == `string` ? `string` : `unknown`;
}

/** jsx 471 —— issue 构造（字符串 → custom issue；对象原样展开） */
function $issue(...args: any[]): any {
  let [issueOrMessage, input, inst] = args;
  return typeof issueOrMessage == `string` ? {
    message: issueOrMessage,
    code: `custom`,
    input: input,
    inst: inst
  } : {
    ...issueOrMessage
  };
}

/** jsx 482 —— $ZodError 内部装配（issues 不可枚举；message = issues JSON） */
const $ZodErrorInternals = (inst: any, issues: any[]) => {
  inst.name = `$ZodError`, Object.defineProperty(inst, `_zod`, {
    value: inst._zod,
    enumerable: !1
  }), Object.defineProperty(inst, `issues`, {
    value: issues,
    enumerable: !1
  }), inst.message = JSON.stringify(issues, jsonStringifyReplacer, 2), Object.defineProperty(inst, `toString`, {
    value: () => inst.message,
    enumerable: !1
  });
};

/** jsx 494 —— $ZodError（plain） */
const $ZodError = $constructor(`$ZodError`, $ZodErrorInternals);

/** jsx 495 —— $ZodRealError（extends Error，~standard 用） */
const $ZodRealError = $constructor(`$ZodError`, $ZodErrorInternals, {
  Parent: Error
});

/** jsx 498 —— error.flatten()：{formErrors, fieldErrors} */
function $flattenError(error: { issues: any[] }, map: (issue: any) => any = issue => issue.message) {
  let fieldErrors: Record<string, any[]> = {},
    formErrors: any[] = [];
  for (let issue of error.issues) issue.path.length > 0 ? (fieldErrors[issue.path[0]] = fieldErrors[issue.path[0]] || [], fieldErrors[issue.path[0]].push(map(issue))) : formErrors.push(map(issue));
  return {
    formErrors: formErrors,
    fieldErrors: fieldErrors
  };
}

/** jsx 507 —— error.format()：嵌套 {_errors} 树（union/key/element 递归展开） */
function $treeifyError(error: { issues: any[] }, map: (issue: any) => any = issue => issue.message) {
  let tree: any = {
      _errors: []
    },
    walk = (node: { issues: any[] }) => {
      for (let issue of node.issues) if (issue.code === `invalid_union` && issue.errors.length) issue.errors.map((issues: any[]) => walk({
        issues: issues
      }));else if (issue.code === `invalid_key`) walk({
        issues: issue.issues
      });else if (issue.code === `invalid_element`) walk({
        issues: issue.issues
      });else if (issue.path.length === 0) tree._errors.push(map(issue));else {
        let cursor = tree,
          i = 0;
        for (; i < issue.path.length;) {
          let segment = issue.path[i];
          i === issue.path.length - 1 ? (cursor[segment] = cursor[segment] || {
            _errors: []
          }, cursor[segment]._errors.push(map(issue))) : cursor[segment] = cursor[segment] || {
            _errors: []
          }, cursor = cursor[segment], i++;
        }
      }
    };
  return walk(error), tree;
}

/* ============================================================================
 * §3 zod core —— 解析执行引擎（jsx 533–652）
 * ==========================================================================*/

/** jsx 533 —— 同步 throw 型 parse 工厂（Err 参数化；同步遇 Promise 抛 $ZodAsyncError） */
const makeParseFn = (Err: any) => (inst: ZodInst, input: any, ctx?: ParseContext, params?: { callee?: unknown; Err?: any }) => {
  let context: ParseContext = ctx ? Object.assign(ctx, {
      async: !1
    }) : {
      async: !1
    },
    payload = inst._zod.run({
      value: input,
      issues: []
    }, context);
  if (payload instanceof Promise) throw new $ZodAsyncError();
  if (payload.issues.length) {
    let error = new (params?.Err ?? Err)(payload.issues.map((issue: any) => $cleanIssue(issue, context, $getGlobalConfig())));
    throw captureStackTrace(error, params?.callee), error;
  }
  return payload.value;
};

/** jsx 550 —— 异步 throw 型 parse 工厂 */
const makeParseAsyncFn = (Err: any) => async (inst: ZodInst, input: any, ctx?: ParseContext, params?: { callee?: unknown; Err?: any }) => {
  let context: ParseContext = ctx ? Object.assign(ctx, {
      async: !0
    }) : {
      async: !0
    },
    payload = inst._zod.run({
      value: input,
      issues: []
    }, context);
  if (payload instanceof Promise && (payload = await payload), payload.issues.length) {
    let error = new (params?.Err ?? Err)(payload.issues.map((issue: any) => $cleanIssue(issue, context, $getGlobalConfig())));
    throw captureStackTrace(error, params?.callee), error;
  }
  return payload.value;
};

/** jsx 566 —— 同步 safeParse 工厂（{success, data | error}） */
const makeSafeParseFn = (Err?: any) => (inst: ZodInst, input: any, ctx?: ParseContext) => {
  let context: ParseContext = ctx ? {
      ...ctx,
      async: !1
    } : {
      async: !1
    },
    payload = inst._zod.run({
      value: input,
      issues: []
    }, context);
  if (payload instanceof Promise) throw new $ZodAsyncError();
  return payload.issues.length ? {
    success: !1,
    error: new (Err ?? $ZodError)(payload.issues.map((issue: any) => $cleanIssue(issue, context, $getGlobalConfig())))
  } : {
    success: !0,
    data: payload.value
  };
};

/** jsx 586 —— ~standard.validate 同步路径（$ZodRealError） */
const safeParseReal = makeSafeParseFn($ZodRealError);

/** jsx 587 —— 异步 safeParse 工厂 */
const makeSafeParseAsyncFn = (Err: any) => async (inst: ZodInst, input: any, ctx?: ParseContext) => {
  let context: ParseContext = ctx ? Object.assign(ctx, {
      async: !0
    }) : {
      async: !0
    },
    payload = inst._zod.run({
      value: input,
      issues: []
    }, context);
  return payload instanceof Promise && (payload = await payload), payload.issues.length ? {
    success: !1,
    error: new Err(payload.issues.map((issue: any) => $cleanIssue(issue, context, $getGlobalConfig())))
  } : {
    success: !0,
    data: payload.value
  };
};

/** jsx 605 —— ~standard.validate 异步路径（$ZodRealError） */
const safeParseAsyncReal = makeSafeParseAsyncFn($ZodRealError);

/** jsx 606 —— encode（backward 方向同步 throw 型） */
const makeEncodeFn = (Err: any) => (inst: ZodInst, input: any, ctx?: ParseContext) => {
  let context: ParseContext = ctx ? Object.assign(ctx, {
    direction: `backward`
  }) : {
    direction: `backward`
  };
  return makeParseFn(Err)(inst, input, context);
};

/** jsx 614 —— decode（forward 方向同步 throw 型） */
const makeDecodeFn = (Err: any) => (inst: ZodInst, input: any, ctx?: ParseContext) => makeParseFn(Err)(inst, input, ctx);

/** jsx 615 —— encodeAsync */
const makeEncodeAsyncFn = (Err: any) => async (inst: ZodInst, input: any, ctx?: ParseContext) => {
  let context: ParseContext = ctx ? Object.assign(ctx, {
    direction: `backward`
  }) : {
    direction: `backward`
  };
  return makeParseAsyncFn(Err)(inst, input, context);
};

/** jsx 623 —— decodeAsync */
const makeDecodeAsyncFn = (Err: any) => async (inst: ZodInst, input: any, ctx?: ParseContext) => makeParseAsyncFn(Err)(inst, input, ctx);

/** jsx 624 —— safeEncode */
const makeSafeEncodeFn = (Err?: any) => (inst: ZodInst, input: any, ctx?: ParseContext) => {
  let context: ParseContext = ctx ? Object.assign(ctx, {
    direction: `backward`
  }) : {
    direction: `backward`
  };
  return makeSafeParseFn(Err)(inst, input, context);
};

/** jsx 632 —— safeDecode */
const makeSafeDecodeFn = (Err?: any) => (inst: ZodInst, input: any, ctx?: ParseContext) => makeSafeParseFn(Err)(inst, input, ctx);

/** jsx 633 —— safeEncodeAsync */
const makeSafeEncodeAsyncFn = (Err: any) => async (inst: ZodInst, input: any, ctx?: ParseContext) => {
  let context: ParseContext = ctx ? Object.assign(ctx, {
    direction: `backward`
  }) : {
    direction: `backward`
  };
  return makeSafeParseAsyncFn(Err)(inst, input, context);
};

/** jsx 641 —— safeDecodeAsync */
const makeSafeDecodeAsyncFn = (Err: any) => async (inst: ZodInst, input: any, ctx?: ParseContext) => makeSafeParseAsyncFn(Err)(inst, input, ctx);

/* ============================================================================
 * §4 zod core —— 正则表（jsx 642–690，与 §3 同一 var 链）
 * ==========================================================================*/

/** jsx 642 */ const cuidRegex = /^[cC][^\s-]{8,}$/;
/** jsx 643 */ const cuid2Regex = /^[0-9a-z]+$/;
/** jsx 644 */ const ulidRegex = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
/** jsx 645 */ const xidRegex = /^[0-9a-vA-V]{20}$/;
/** jsx 646 */ const ksuidRegex = /^[A-Za-z0-9]{27}$/;
/** jsx 647 */ const nanoidRegex = /^[a-zA-Z0-9_-]{21}$/;
/** jsx 648 */ const isoDurationRegex = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** jsx 649 —— UUID 通用（rfc4122） */ const uuidGenericRegex = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** jsx 650 —— UUID 版本化（v1–v8 指定或全版本含 nil/max） */ const uuidVersionedRegex = (version?: number) => version ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
/** jsx 651 */ const emailRegex = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
/** jsx 652 */ const emojiRegexSource = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
/** jsx 653 */ function emojiRegex() {
  return new RegExp(emojiRegexSource, `u`);
}
/** jsx 656 */ const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
/** jsx 657 */ const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
/** jsx 658 */ const ipv4CidrRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
/** jsx 659 */ const ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
/** jsx 660 */ const base64Regex = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
/** jsx 661 */ const base64urlRegex = /^[A-Za-z0-9_-]*$/;
/** jsx 662 */ const e164Regex = /^\+[1-9]\d{6,14}$/;
/** jsx 663 —— ISO 日期源码（闰年规则内联） */ const isoDateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
/** jsx 664 */ const isoDateRegex = RegExp(`^${isoDateSource}$`);
/** jsx 665 —— ISO 时间源码（precision: -1=仅时分 / 0=秒 / n=毫秒位） */ function isoTimeSource(params: { precision?: number | null }): string {
  let hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  return typeof params.precision == `number` ? params.precision === -1 ? `${hhmm}` : params.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${params.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
/** jsx 669 */ function isoTimeRegex(params: { precision?: number | null }): RegExp {
  return RegExp(`^${isoTimeSource(params)}$`);
}
/** jsx 672 —— ISO 日期时间（local/offset/Z 三尾） */ function isoDateTimeRegex(params: { precision?: number | null; local?: boolean; offset?: boolean }): RegExp {
  let time = isoTimeSource({
      precision: params.precision
    }),
    suffixes = [`Z`];
  params.local && suffixes.push(``), params.offset && suffixes.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  let tail = `${time}(?:${suffixes.join(`|`)})`;
  return RegExp(`^${isoDateSource}T(?:${tail})$`);
}
/** jsx 681 —— 字符串长度 → 通配模式（$ZodString 缺省 pattern） */ const makeStringLengthRegex = (limits?: { minimum?: number; maximum?: number }) => {
  let body = limits ? `[\\s\\S]{${limits?.minimum ?? 0},${limits?.maximum ?? ``}}` : `[\\s\\S]*`;
  return RegExp(`^${body}$`);
};
/** jsx 685 */ const integerRegex = /^-?\d+$/;
/** jsx 686 */ const numberRegex = /^-?\d+(?:\.\d+)?$/;
/** jsx 687 */ const booleanRegex = /^(?:true|false)$/i;
/** jsx 688 */ const undefinedRegex = /^undefined$/i;
/** jsx 689 */ const lowercaseRegex = /^[^A-Z]*$/;
/** jsx 690 */ const uppercaseRegex = /^[^a-z]*$/;

/* ============================================================================
 * §5 zod core —— checks（jsx 691–1022）
 * ==========================================================================*/

/** jsx 691 —— $ZodCheck 基类（def/onattach 装配） */
const $ZodCheck = $constructor(`$ZodCheck`, (inst: ZodInst, def: ZodDef) => {
  var _a;
  inst._zod ??= {}, inst._zod.def = def, (_a = inst._zod).onattach ?? (_a.onattach = []);
});

/** jsx 695 —— less_than/greater_than/multiple_of 的 origin 映射 */
const CHECK_ORIGIN_BY_VALUE_TYPE: Record<string, string> = {
  number: `number`,
  bigint: `bigint`,
  object: `date`
};

/** jsx 700 */ const $ZodCheckLessThan = $constructor(`$ZodCheckLessThan`, (inst: ZodInst, def: ZodDef) => {
  ($ZodCheck as any).init(inst, def);
  let origin = CHECK_ORIGIN_BY_VALUE_TYPE[typeof def.value];
  inst._zod.onattach.push((schema: ZodInst) => {
    let bag = schema._zod.bag,
      current = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? 1 / 0;
    def.value < current && (def.inclusive ? bag.maximum = def.value : bag.exclusiveMaximum = def.value);
  }), inst._zod.check = (payload: ParsePayload) => {
    (def.inclusive ? payload.value <= def.value : payload.value < def.value) || payload.issues.push({
      origin: origin,
      code: `too_big`,
      maximum: typeof def.value == `object` ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 719 */ const $ZodCheckGreaterThan = $constructor(`$ZodCheckGreaterThan`, (inst: ZodInst, def: ZodDef) => {
  ($ZodCheck as any).init(inst, def);
  let origin = CHECK_ORIGIN_BY_VALUE_TYPE[typeof def.value];
  inst._zod.onattach.push((schema: ZodInst) => {
    let bag = schema._zod.bag,
      current = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? -1 / 0;
    def.value > current && (def.inclusive ? bag.minimum = def.value : bag.exclusiveMinimum = def.value);
  }), inst._zod.check = (payload: ParsePayload) => {
    (def.inclusive ? payload.value >= def.value : payload.value > def.value) || payload.issues.push({
      origin: origin,
      code: `too_small`,
      minimum: typeof def.value == `object` ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 738 */ const $ZodCheckMultipleOf = $constructor(`$ZodCheckMultipleOf`, (inst: ZodInst, def: ZodDef) => {
  ($ZodCheck as any).init(inst, def), inst._zod.onattach.push((schema: ZodInst) => {
    var _a;
    (_a = schema._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
  }), inst._zod.check = (payload: ParsePayload) => {
    if (typeof payload.value != typeof def.value) throw Error(`Cannot mix number and bigint in multiple_of check.`);
    (typeof payload.value == `bigint` ? payload.value % def.value === BigInt(0) : decimalModulo(payload.value, def.value) === 0) || payload.issues.push({
      origin: typeof payload.value,
      code: `not_multiple_of`,
      divisor: def.value,
      input: payload.value,
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 754 —— 数字格式检查（int 档：整数性 + safe 区间；值域按 NUMBER_FORMAT_LIMITS） */ const $ZodCheckNumberFormat = $constructor(`$ZodCheckNumberFormat`, (inst: ZodInst, def: ZodDef) => {
  ($ZodCheck as any).init(inst, def), def.format = def.format || `float64`;
  let isIntFormat = def.format?.includes(`int`),
    origin = isIntFormat ? `int` : `number`,
    [minimum, maximum] = NUMBER_FORMAT_LIMITS[def.format];
  inst._zod.onattach.push((schema: ZodInst) => {
    let bag = schema._zod.bag;
    bag.format = def.format, bag.minimum = minimum, bag.maximum = maximum, isIntFormat && (bag.pattern = integerRegex);
  }), inst._zod.check = (payload: ParsePayload) => {
    let value = payload.value;
    if (isIntFormat) {
      if (!Number.isInteger(value)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: `invalid_type`,
          continue: !1,
          input: value,
          inst: inst
        });
        return;
      }
      if (!Number.isSafeInteger(value)) {
        value > 0 ? payload.issues.push({
          input: value,
          code: `too_big`,
          maximum: 2 ** 53 - 1,
          note: `Integers must be within the safe integer range.`,
          inst: inst,
          origin: origin,
          inclusive: !0,
          continue: !def.abort
        }) : payload.issues.push({
          input: value,
          code: `too_small`,
          minimum: -(2 ** 53 - 1),
          note: `Integers must be within the safe integer range.`,
          inst: inst,
          origin: origin,
          inclusive: !0,
          continue: !def.abort
        });
        return;
      }
    }
    value < minimum && payload.issues.push({
      origin: `number`,
      input: value,
      code: `too_small`,
      minimum: minimum,
      inclusive: !0,
      inst: inst,
      continue: !def.abort
    }), value > maximum && payload.issues.push({
      origin: `number`,
      input: value,
      code: `too_big`,
      maximum: maximum,
      inclusive: !0,
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 818 */ const $ZodCheckMaxLength = $constructor(`$ZodCheckMaxLength`, (inst: ZodInst, def: ZodDef) => {
  var _a;
  ($ZodCheck as any).init(inst, def), (_a = inst._zod.def).when ?? (_a.when = (payload: ParsePayload) => {
    let value = payload.value;
    return !nullish(value) && value.length !== void 0;
  }), inst._zod.onattach.push((schema: ZodInst) => {
    let current = schema._zod.bag.maximum ?? 1 / 0;
    def.maximum < current && (schema._zod.bag.maximum = def.maximum);
  }), inst._zod.check = (payload: ParsePayload) => {
    let value = payload.value;
    if (value.length <= def.maximum) return;
    let origin = resolveOriginKind(value);
    payload.issues.push({
      origin: origin,
      code: `too_big`,
      maximum: def.maximum,
      inclusive: !0,
      input: value,
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 841 */ const $ZodCheckMinLength = $constructor(`$ZodCheckMinLength`, (inst: ZodInst, def: ZodDef) => {
  var _a;
  ($ZodCheck as any).init(inst, def), (_a = inst._zod.def).when ?? (_a.when = (payload: ParsePayload) => {
    let value = payload.value;
    return !nullish(value) && value.length !== void 0;
  }), inst._zod.onattach.push((schema: ZodInst) => {
    let current = schema._zod.bag.minimum ?? -1 / 0;
    def.minimum > current && (schema._zod.bag.minimum = def.minimum);
  }), inst._zod.check = (payload: ParsePayload) => {
    let value = payload.value;
    if (value.length >= def.minimum) return;
    let origin = resolveOriginKind(value);
    payload.issues.push({
      origin: origin,
      code: `too_small`,
      minimum: def.minimum,
      inclusive: !0,
      input: value,
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 864 */ const $ZodCheckLengthEquals = $constructor(`$ZodCheckLengthEquals`, (inst: ZodInst, def: ZodDef) => {
  var _a;
  ($ZodCheck as any).init(inst, def), (_a = inst._zod.def).when ?? (_a.when = (payload: ParsePayload) => {
    let value = payload.value;
    return !nullish(value) && value.length !== void 0;
  }), inst._zod.onattach.push((schema: ZodInst) => {
    let bag = schema._zod.bag;
    bag.minimum = def.length, bag.maximum = def.length, bag.length = def.length;
  }), inst._zod.check = (payload: ParsePayload) => {
    let value = payload.value,
      length = value.length;
    if (length === def.length) return;
    let origin = resolveOriginKind(value),
      tooBig = length > def.length;
    payload.issues.push({
      origin: origin,
      ...(tooBig ? {
        code: `too_big`,
        maximum: def.length
      } : {
        code: `too_small`,
        minimum: def.length
      }),
      inclusive: !0,
      exact: !0,
      input: payload.value,
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 895 —— 字符串格式检查基类（pattern 缺省时挂空检查） */ const $ZodCheckStringFormat = $constructor(`$ZodCheckStringFormat`, (inst: ZodInst, def: ZodDef) => {
  var _a, _b;
  ($ZodCheck as any).init(inst, def), inst._zod.onattach.push((schema: ZodInst) => {
    let bag = schema._zod.bag;
    bag.format = def.format, def.pattern && (bag.patterns ??= new Set(), bag.patterns.add(def.pattern));
  }), def.pattern ? (_a = inst._zod).check ?? (_a.check = (payload: ParsePayload) => {
    def.pattern.lastIndex = 0, !def.pattern.test(payload.value) && payload.issues.push({
      origin: `string`,
      code: `invalid_format`,
      format: def.format,
      input: payload.value,
      ...(def.pattern ? {
        pattern: def.pattern.toString()
      } : {}),
      inst: inst,
      continue: !def.abort
    });
  }) : (_b = inst._zod).check ?? (_b.check = () => {});
});

/** jsx 914 */ const $ZodCheckRegex = $constructor(`$ZodCheckRegex`, (inst: ZodInst, def: ZodDef) => {
  ($ZodCheckStringFormat as any).init(inst, def), inst._zod.check = (payload: ParsePayload) => {
    def.pattern.lastIndex = 0, !def.pattern.test(payload.value) && payload.issues.push({
      origin: `string`,
      code: `invalid_format`,
      format: `regex`,
      input: payload.value,
      pattern: def.pattern.toString(),
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 927 */ const $ZodCheckLowerCase = $constructor(`$ZodCheckLowerCase`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= lowercaseRegex, ($ZodCheckStringFormat as any).init(inst, def);
});

/** jsx 930 */ const $ZodCheckUpperCase = $constructor(`$ZodCheckUpperCase`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= uppercaseRegex, ($ZodCheckStringFormat as any).init(inst, def);
});

/** jsx 933 */ const $ZodCheckIncludes = $constructor(`$ZodCheckIncludes`, (inst: ZodInst, def: ZodDef) => {
  ($ZodCheck as any).init(inst, def);
  let escaped = escapeRegex(def.includes),
    pattern = new RegExp(typeof def.position == `number` ? `^.{${def.position}}${escaped}` : escaped);
  def.pattern = pattern, inst._zod.onattach.push((schema: ZodInst) => {
    let bag = schema._zod.bag;
    bag.patterns ??= new Set(), bag.patterns.add(pattern);
  }), inst._zod.check = (payload: ParsePayload) => {
    payload.value.includes(def.includes, def.position) || payload.issues.push({
      origin: `string`,
      code: `invalid_format`,
      format: `includes`,
      includes: def.includes,
      input: payload.value,
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 952 */ const $ZodCheckStartsWith = $constructor(`$ZodCheckStartsWith`, (inst: ZodInst, def: ZodDef) => {
  ($ZodCheck as any).init(inst, def);
  let pattern = RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ??= pattern, inst._zod.onattach.push((schema: ZodInst) => {
    let bag = schema._zod.bag;
    bag.patterns ??= new Set(), bag.patterns.add(pattern);
  }), inst._zod.check = (payload: ParsePayload) => {
    payload.value.startsWith(def.prefix) || payload.issues.push({
      origin: `string`,
      code: `invalid_format`,
      format: `starts_with`,
      prefix: def.prefix,
      input: payload.value,
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 970 */ const $ZodCheckEndsWith = $constructor(`$ZodCheckEndsWith`, (inst: ZodInst, def: ZodDef) => {
  ($ZodCheck as any).init(inst, def);
  let pattern = RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ??= pattern, inst._zod.onattach.push((schema: ZodInst) => {
    let bag = schema._zod.bag;
    bag.patterns ??= new Set(), bag.patterns.add(pattern);
  }), inst._zod.check = (payload: ParsePayload) => {
    payload.value.endsWith(def.suffix) || payload.issues.push({
      origin: `string`,
      code: `invalid_format`,
      format: `ends_with`,
      suffix: def.suffix,
      input: payload.value,
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 988 —— 值覆写检查（trim/toLowerCase/normalize 等的底层） */ const $ZodCheckOverwrite = $constructor(`$ZodCheckOverwrite`, (inst: ZodInst, def: ZodDef) => {
  ($ZodCheck as any).init(inst, def), inst._zod.check = (payload: ParsePayload) => {
    payload.value = def.tx(payload.value);
  };
});

/** jsx 993 —— JIT 代码写入器（缩进累积 + Function 编译） */ const JitCodeBuilder = class {
  content: string[];
  indent: number;
  args!: string[];
  constructor(args: string[] = []) {
    this.content = [], this.indent = 0, this && (this.args = args);
  }
  indented(fn: (builder: this) => void) {
    this.indent += 1, fn(this), --this.indent;
  }
  write(text: string | ((builder: this, opts: { execution: string }) => void)) {
    if (typeof text == `function`) {
      text(this, {
        execution: `sync`
      }), text(this, {
        execution: `async`
      });
      return;
    }
    let lines = text.split(`
`).filter(line => line),
      commonIndent = Math.min(...lines.map(line => line.length - line.trimStart().length)),
      rendered = lines.map(line => line.slice(commonIndent)).map(line => ` `.repeat(this.indent * 2) + line);
    for (let line of rendered) this.content.push(line);
  }
  compile(): (...args: any[]) => any {
    let Fn = Function,
      args = this?.args,
      body = [...(this?.content ?? [``]).map(line => `  ${line}`)];
    return new Fn(...args, body.join(`
`)) as (...args: any[]) => any;
  }
};

/** jsx 1023 —— 捆绑 zod 版本（4.3.6） */ const ZOD_VERSION = {
  major: 4,
  minor: 3,
  patch: 6
};

/* ============================================================================
 * §6 zod core —— schemas（jsx 1028–2030）
 * ==========================================================================*/

/** jsx 1028 —— $ZodType：checks 装配（when 门控/中止判定/异步合并）+ run 调度（forward/backward）+ ~standard 协议 */
const $ZodType = $constructor(`$ZodType`, (inst: ZodInst, def: ZodDef) => {
  var _a;
  inst ??= {}, inst._zod.def = def, inst._zod.bag = inst._zod.bag || {}, inst._zod.version = ZOD_VERSION;
  let checks = [...(inst._zod.def.checks ?? [])];
  inst._zod.traits.has(`$ZodCheck`) && checks.unshift(inst);
  for (let check of checks) for (let hook of check._zod.onattach) hook(inst);
  if (checks.length === 0) (_a = inst._zod).deferred ?? (_a.deferred = []), inst._zod.deferred?.push(() => {
    inst._zod.run = inst._zod.parse;
  });else {
    let runChecks = (payload: ParsePayload, checkList: ZodInst[], ctx?: ParseContext) => {
        let aborted = $shouldAbort(payload),
          asyncChain: Promise<void> | undefined;
        for (let check of checkList) {
          if (check._zod.def.when) {
            if (!check._zod.def.when(payload)) continue;
          } else if (aborted) continue;
          let issueCount = payload.issues.length,
            result = check._zod.check(payload);
          if (result instanceof Promise && ctx?.async === !1) throw new $ZodAsyncError();
          if (asyncChain || result instanceof Promise) asyncChain = (asyncChain ?? Promise.resolve()).then(async () => {
            await result, payload.issues.length !== issueCount && (aborted ||= $shouldAbort(payload, issueCount));
          });else {
            if (payload.issues.length === issueCount) continue;
            aborted ||= $shouldAbort(payload, issueCount);
          }
        }
        return asyncChain ? asyncChain.then(() => payload) : payload;
      },
      runWithChecks = (payload: ParsePayload, input: ParsePayload, ctx: ParseContext) => {
        if ($shouldAbort(payload)) return payload.aborted = !0, payload;
        let checked = runChecks(input, checks, ctx);
        if (checked instanceof Promise) {
          if (ctx.async === !1) throw new $ZodAsyncError();
          return checked.then(result => inst._zod.parse(result, ctx));
        }
        return inst._zod.parse(checked, ctx);
      };
    inst._zod.run = (payload: ParsePayload, ctx: ParseContext) => {
      if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
      if (ctx.direction === `backward`) {
        let parsed = inst._zod.parse({
          value: payload.value,
          issues: []
        }, {
          ...ctx,
          skipChecks: !0
        });
        return parsed instanceof Promise ? parsed.then(result => runWithChecks(result, payload, ctx)) : runWithChecks(parsed, payload, ctx);
      }
      let parsed = inst._zod.parse(payload, ctx);
      if (parsed instanceof Promise) {
        if (ctx.async === !1) throw new $ZodAsyncError();
        return parsed.then(result => runChecks(result, checks, ctx));
      }
      return runChecks(parsed, checks, ctx);
    };
  }
  $lazyDefine(inst, `~standard`, () => ({
    validate: (input: any) => {
      try {
        let result = safeParseReal(inst, input);
        return result.success ? {
          value: result.data
        } : {
          issues: result.error?.issues
        };
      } catch {
        return safeParseAsyncReal(inst, input).then(result => result.success ? {
          value: result.data
        } : {
          issues: result.error?.issues
        });
      }
    },
    vendor: `zod`,
    version: 1
  }));
});

/** jsx 1106 */ const $ZodString = $constructor(`$ZodString`, (inst: ZodInst, def: ZodDef) => {
  ($ZodType as any).init(inst, def), inst._zod.pattern = [...(inst?._zod.bag?.patterns ?? [])].pop() ?? makeStringLengthRegex(inst._zod.bag), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
    if (def.coerce) try {
      payload.value = String(payload.value);
    } catch {}
    return typeof payload.value == `string` || payload.issues.push({
      expected: `string`,
      code: `invalid_type`,
      input: payload.value,
      inst: inst
    }), payload;
  };
});

/** jsx 1119 */ const $ZodStringFormat = $constructor(`$ZodStringFormat`, (inst: ZodInst, def: ZodDef) => {
  ($ZodCheckStringFormat as any).init(inst, def), ($ZodString as any).init(inst, def);
});

/** jsx 1122 */ const $ZodGUID = $constructor(`$ZodGUID`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= uuidGenericRegex, ($ZodStringFormat as any).init(inst, def);
});

/** jsx 1125 */ const $ZodUUID = $constructor(`$ZodUUID`, (inst: ZodInst, def: ZodDef) => {
  if (def.version) {
    let numericVersion = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[def.version as `v1` | `v2` | `v3` | `v4` | `v5` | `v6` | `v7` | `v8`];
    if (numericVersion === void 0) throw Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ??= uuidVersionedRegex(numericVersion);
  } else def.pattern ??= uuidVersionedRegex();
  ($ZodStringFormat as any).init(inst, def);
});

/** jsx 1142 */ const $ZodEmail = $constructor(`$ZodEmail`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= emailRegex, ($ZodStringFormat as any).init(inst, def);
});

/** jsx 1145 */ const $ZodURL = $constructor(`$ZodURL`, (inst: ZodInst, def: ZodDef) => {
  ($ZodStringFormat as any).init(inst, def), inst._zod.check = (payload: ParsePayload) => {
    try {
      let trimmed = payload.value.trim(),
        url = new URL(trimmed);
      def.hostname && (def.hostname.lastIndex = 0, def.hostname.test(url.hostname) || payload.issues.push({
        code: `invalid_format`,
        format: `url`,
        note: `Invalid hostname`,
        pattern: def.hostname.source,
        input: payload.value,
        inst: inst,
        continue: !def.abort
      })), def.protocol && (def.protocol.lastIndex = 0, def.protocol.test(url.protocol.endsWith(`:`) ? url.protocol.slice(0, -1) : url.protocol) || payload.issues.push({
        code: `invalid_format`,
        format: `url`,
        note: `Invalid protocol`,
        pattern: def.protocol.source,
        input: payload.value,
        inst: inst,
        continue: !def.abort
      })), def.normalize ? payload.value = url.href : payload.value = trimmed;
      return;
    } catch {
      payload.issues.push({
        code: `invalid_format`,
        format: `url`,
        input: payload.value,
        inst: inst,
        continue: !def.abort
      });
    }
  };
});

/** jsx 1179 */ const $ZodEmoji = $constructor(`$ZodEmoji`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= emojiRegex(), ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1182 */ const $ZodNanoID = $constructor(`$ZodNanoID`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= nanoidRegex, ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1185 */ const $ZodCUID = $constructor(`$ZodCUID`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= cuidRegex, ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1188 */ const $ZodCUID2 = $constructor(`$ZodCUID2`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= cuid2Regex, ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1191 */ const $ZodULID = $constructor(`$ZodULID`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= ulidRegex, ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1194 */ const $ZodXID = $constructor(`$ZodXID`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= xidRegex, ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1197 */ const $ZodKSUID = $constructor(`$ZodKSUID`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= ksuidRegex, ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1200 */ const $ZodISODateTime = $constructor(`$ZodISODateTime`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= isoDateTimeRegex(def), ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1203 */ const $ZodISODate = $constructor(`$ZodISODate`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= isoDateRegex, ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1206 */ const $ZodISOTime = $constructor(`$ZodISOTime`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= isoTimeRegex(def), ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1209 */ const $ZodISODuration = $constructor(`$ZodISODuration`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= isoDurationRegex, ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1212 */ const $ZodIPv4 = $constructor(`$ZodIPv4`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= ipv4Regex, ($ZodStringFormat as any).init(inst, def), inst._zod.bag.format = `ipv4`;
});
/** jsx 1215 */ const $ZodIPv6 = $constructor(`$ZodIPv6`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= ipv6Regex, ($ZodStringFormat as any).init(inst, def), inst._zod.bag.format = `ipv6`, inst._zod.check = (payload: ParsePayload) => {
    try {
      new URL(`http://[${payload.value}]`);
    } catch {
      payload.issues.push({
        code: `invalid_format`,
        format: `ipv6`,
        input: payload.value,
        inst: inst,
        continue: !def.abort
      });
    }
  };
});
/** jsx 1230 */ const $ZodCIDRv4 = $constructor(`$ZodCIDRv4`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= ipv4CidrRegex, ($ZodStringFormat as any).init(inst, def);
});
/** jsx 1233 */ const $ZodCIDRv6 = $constructor(`$ZodCIDRv6`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= ipv6CidrRegex, ($ZodStringFormat as any).init(inst, def), inst._zod.check = (payload: ParsePayload) => {
    let parts = payload.value.split(`/`);
    try {
      if (parts.length !== 2) throw Error();
      let [address, mask] = parts;
      if (!mask) throw Error();
      let numericMask = Number(mask);
      if (`${numericMask}` !== mask || numericMask < 0 || numericMask > 128) throw Error();
      new URL(`http://[${address}]`);
    } catch {
      payload.issues.push({
        code: `invalid_format`,
        format: `cidrv6`,
        input: payload.value,
        inst: inst,
        continue: !def.abort
      });
    }
  };
});

/** jsx 1254 */ function isValidBase64(value: string): boolean {
  if (value === ``) return !0;
  if (value.length % 4 != 0) return !1;
  try {
    return atob(value), !0;
  } catch {
    return !1;
  }
}

/** jsx 1263 */ const $ZodBase64 = $constructor(`$ZodBase64`, (inst: ZodInst, def: ZodDef) => {
  def.pattern ??= base64Regex, ($ZodStringFormat as any).init(inst, def), inst._zod.bag.contentEncoding = `base64`, inst._zod.check = (payload: ParsePayload) => {
    isValidBase64(payload.value) || payload.issues.push({
      code: `invalid_format`,
      format: `base64`,
      input: payload.value,
      inst: inst,
      continue: !def.abort
    });
  };
});

/** jsx 1274 */ function isValidBase64URL(value: string): boolean {
  if (!base64urlRegex.test(value)) return !1;
  let normalized = value.replace(/[-_]/g, ch => ch === `-` ? `+` : `/`);
  return isValidBase64(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, `=`));
}

/** jsx 1279 */ const $ZodBase64URL = $constructor(`$ZodBase64URL`, (inst: ZodInst, def: ZodDef) => {
    def.pattern ??= base64urlRegex, ($ZodStringFormat as any).init(inst, def), inst._zod.bag.contentEncoding = `base64url`, inst._zod.check = (payload: ParsePayload) => {
      isValidBase64URL(payload.value) || payload.issues.push({
        code: `invalid_format`,
        format: `base64url`,
        input: payload.value,
        inst: inst,
        continue: !def.abort
      });
    };
  }),
  /** jsx 1290 */ $ZodE164 = $constructor(`$ZodE164`, (inst: ZodInst, def: ZodDef) => {
    def.pattern ??= e164Regex, ($ZodStringFormat as any).init(inst, def);
  });

/** jsx 1293 */ function isValidJWT(value: string, alg: string | null = null): boolean {
  try {
    let segments = value.split(`.`);
    if (segments.length !== 3) return !1;
    let [headerSegment] = segments;
    if (!headerSegment) return !1;
    let header = JSON.parse(atob(headerSegment));
    return !(`typ` in header && header?.typ !== `JWT` || !header.alg || alg && (!(`alg` in header) || header.alg !== alg));
  } catch {
    return !1;
  }
}

/** jsx 1305 */ const $ZodJWT = $constructor(`$ZodJWT`, (inst: ZodInst, def: ZodDef) => {
    ($ZodStringFormat as any).init(inst, def), inst._zod.check = (payload: ParsePayload) => {
      isValidJWT(payload.value, def.alg) || payload.issues.push({
        code: `invalid_format`,
        format: `jwt`,
        input: payload.value,
        inst: inst,
        continue: !def.abort
      });
    };
  }),
  /** jsx 1316 */ $ZodNumber = $constructor(`$ZodNumber`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.pattern = inst._zod.bag.pattern ?? numberRegex, inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      if (def.coerce) try {
        payload.value = Number(payload.value);
      } catch {}
      let value = payload.value;
      if (typeof value == `number` && !Number.isNaN(value) && Number.isFinite(value)) return payload;
      let received = typeof value == `number` ? Number.isNaN(value) ? `NaN` : Number.isFinite(value) ? void 0 : `Infinity` : void 0;
      return payload.issues.push({
        expected: `number`,
        code: `invalid_type`,
        input: value,
        inst: inst,
        ...(received ? {
          received: received
        } : {})
      }), payload;
    };
  }),
  /** jsx 1335 */ $ZodNumberFormat = $constructor(`$ZodNumberFormat`, (inst: ZodInst, def: ZodDef) => {
    ($ZodCheckNumberFormat as any).init(inst, def), ($ZodNumber as any).init(inst, def);
  }),
  /** jsx 1338 */ $ZodBoolean = $constructor(`$ZodBoolean`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.pattern = booleanRegex, inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      if (def.coerce) try {
        payload.value = !!payload.value;
      } catch {}
      let value = payload.value;
      return typeof value == `boolean` || payload.issues.push({
        expected: `boolean`,
        code: `invalid_type`,
        input: value,
        inst: inst
      }), payload;
    };
  }),
  /** jsx 1352 */ $ZodUndefined = $constructor(`$ZodUndefined`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.pattern = undefinedRegex, inst._zod.values = new Set([void 0]), inst._zod.optin = `optional`, inst._zod.optout = `optional`, inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      let value = payload.value;
      return value === void 0 || payload.issues.push({
        expected: `undefined`,
        code: `invalid_type`,
        input: value,
        inst: inst
      }), payload;
    };
  }),
  /** jsx 1363 */ $ZodUnknown = $constructor(`$ZodUnknown`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.parse = (payload: ParsePayload) => payload;
  }),
  /** jsx 1366 */ $ZodNever = $constructor(`$ZodNever`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => (payload.issues.push({
      expected: `never`,
      code: `invalid_type`,
      input: payload.value,
      inst: inst
    }), payload);
  }),
  /** jsx 1374 */ $ZodDate = $constructor(`$ZodDate`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      if (def.coerce) try {
        payload.value = new Date(payload.value);
      } catch {}
      let value = payload.value,
        isDate = value instanceof Date;
      return isDate && !Number.isNaN(value.getTime()) || payload.issues.push({
        expected: `date`,
        code: `invalid_type`,
        input: value,
        ...(isDate ? {
          received: `Invalid Date`
        } : {}),
        inst: inst
      }), payload;
    };
  });

/** jsx 1392 —— 数组元素结果回填（issue 路径加下标前缀） */ function assignArrayElementResult(elementPayload: ParsePayload, arrayPayload: ParsePayload, index: number) {
  elementPayload.issues.length && arrayPayload.issues.push(...prefixIssuePath(index, elementPayload.issues)), arrayPayload.value[index] = elementPayload.value;
}

/** jsx 1395 */ const $ZodArray = $constructor(`$ZodArray`, (inst: ZodInst, def: ZodDef) => {
  ($ZodType as any).init(inst, def), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
    let input = payload.value;
    if (!Array.isArray(input)) return payload.issues.push({
      expected: `array`,
      code: `invalid_type`,
      input: input,
      inst: inst
    }), payload;
    payload.value = Array(input.length);
    let asyncTasks: Promise<void>[] = [];
    for (let i = 0; i < input.length; i++) {
      let element = input[i],
        elementPayload = def.element._zod.run({
          value: element,
          issues: []
        }, ctx);
      elementPayload instanceof Promise ? asyncTasks.push(elementPayload.then(result => assignArrayElementResult(result, payload, i))) : assignArrayElementResult(elementPayload, payload, i);
    }
    return asyncTasks.length ? Promise.all(asyncTasks).then(() => payload) : payload;
  };
});

/** jsx 1417 —— 对象键结果回填（可选键语义：输入有键才写 undefined） */ function assignShapeEntryResult(entryPayload: ParsePayload, objectPayload: ParsePayload, key: string, input: Record<string, any>, isOptionalOut: boolean) {
  if (entryPayload.issues.length) {
    if (isOptionalOut && !(key in input)) return;
    objectPayload.issues.push(...prefixIssuePath(key, entryPayload.issues));
  }
  entryPayload.value === void 0 ? key in input && (objectPayload.value[key] = void 0) : objectPayload.value[key] = entryPayload.value;
}

/** jsx 1424 —— shape 内部结构（keys/keySet/numKeys/optionalKeys；非法元素抛错） */ function computeObjectInternals(def: ZodDef) {
  let keys = Object.keys(def.shape);
  for (let key of keys) if (!def.shape?.[key]?._zod?.traits?.has(`$ZodType`)) throw Error(`Invalid element at key "${key}": expected a Zod schema`);
  let optional = optionalKeys(def.shape);
  return {
    ...def,
    keys: keys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(optional)
  };
}

/** jsx 1436 —— catchall 处理（never → 收集未识别键；其余逐键解析） */ function processCatchallKeys(asyncTasks: Promise<void>[], input: Record<string, any>, payload: ParsePayload, ctx: ParseContext, internals: any, inst: ZodInst) {
  let unrecognized: string[] = [],
    keySet = internals.keySet,
    catchallZod = internals.catchall._zod,
    catchallType = catchallZod.def.type,
    isOptionalOut = catchallZod.optout === `optional`;
  for (let key in input) {
    if (keySet.has(key)) continue;
    if (catchallType === `never`) {
      unrecognized.push(key);
      continue;
    }
    let entryPayload = catchallZod.run({
      value: input[key],
      issues: []
    }, ctx);
    entryPayload instanceof Promise ? asyncTasks.push(entryPayload.then(result => assignShapeEntryResult(result, payload, key, input, isOptionalOut))) : assignShapeEntryResult(entryPayload, payload, key, input, isOptionalOut);
  }
  return unrecognized.length && payload.issues.push({
    code: `unrecognized_keys`,
    keys: unrecognized,
    input: input,
    inst: inst
  }), asyncTasks.length ? Promise.all(asyncTasks).then(() => payload) : payload;
}

/** jsx 1461 */ const $ZodObject = $constructor(`$ZodObject`, (inst: ZodInst, def: ZodDef) => {
    if (($ZodType as any).init(inst, def), !Object.getOwnPropertyDescriptor(def, `shape`)?.get) {
      let initialShape = def.shape;
      Object.defineProperty(def, `shape`, {
        get: () => {
          let copied = {
            ...initialShape
          };
          return Object.defineProperty(def, `shape`, {
            value: copied
          }), copied;
        }
      });
    }
    let internals = $lazy(() => computeObjectInternals(def));
    $lazyDefine(inst._zod, `propValues`, () => {
      let shape = def.shape,
        propValues: Record<string, Set<any>> = {};
      for (let key in shape) {
        let member = shape[key]._zod;
        if (member.values) {
          propValues[key] ?? (propValues[key] = new Set());
          for (let value of member.values) propValues[key].add(value);
        }
      }
      return propValues;
    });
    let inputCheck = isObject,
      catchall = def.catchall,
      cachedInternals: any;
    inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      cachedInternals ??= internals.value;
      let input = payload.value;
      if (!inputCheck(input)) return payload.issues.push({
        expected: `object`,
        code: `invalid_type`,
        input: input,
        inst: inst
      }), payload;
      payload.value = {};
      let asyncTasks: Promise<void>[] = [],
        shape = cachedInternals.shape;
      for (let key of cachedInternals.keys) {
        let member = shape[key],
          isOptionalOut = member._zod.optout === `optional`,
          entryPayload = member._zod.run({
            value: input[key],
            issues: []
          }, ctx);
        entryPayload instanceof Promise ? asyncTasks.push(entryPayload.then(result => assignShapeEntryResult(result, payload, key, input, isOptionalOut))) : assignShapeEntryResult(entryPayload, payload, key, input, isOptionalOut);
      }
      return catchall ? processCatchallKeys(asyncTasks, input, payload, ctx, internals.value, inst) : asyncTasks.length ? Promise.all(asyncTasks).then(() => payload) : payload;
    };
  }),
  /** jsx 1515 —— JIT 编译版对象解析（同步路径；jitless/Cloudflare 回退普通解析） */ $ZodObjectJIT = $constructor(`$ZodObjectJIT`, (inst: ZodInst, def: ZodDef) => {
    ($ZodObject as any).init(inst, def);
    let baseParse = inst._zod.parse,
      internals = $lazy(() => computeObjectInternals(def)),
      compileShape = (shape: Record<string, any>) => {
        let builder = new JitCodeBuilder([`shape`, `payload`, `ctx`]),
          compiled = internals.value,
          runMember = (key: string) => {
            let encoded = jsonStringify(key);
            return `shape[${encoded}]._zod.run({ value: input[${encoded}], issues: [] }, ctx)`;
          };
        builder.write(`const input = payload.value;`);
        let localNames = Object.create(null),
          counter = 0;
        for (let key of compiled.keys) localNames[key] = `key_${counter++}`;
        builder.write(`const newResult = {};`);
        for (let key of compiled.keys) {
          let local = localNames[key],
            encoded = jsonStringify(key),
            isOptionalOut = shape[key]?._zod?.optout === `optional`;
          builder.write(`const ${local} = ${runMember(key)};`), isOptionalOut ? builder.write(`
        if (${local}.issues.length) {
          if (${encoded} in input) {
            payload.issues = payload.issues.concat(${local}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${encoded}, ...iss.path] : [${encoded}]
            })));
          }
        }
        
        if (${local}.value === undefined) {
          if (${encoded} in input) {
            newResult[${encoded}] = undefined;
          }
        } else {
          newResult[${encoded}] = ${local}.value;
        }
        
      `) : builder.write(`
        if (${local}.issues.length) {
          payload.issues = payload.issues.concat(${local}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${encoded}, ...iss.path] : [${encoded}]
          })));
        }
        
        if (${local}.value === undefined) {
          if (${encoded} in input) {
            newResult[${encoded}] = undefined;
          }
        } else {
          newResult[${encoded}] = ${local}.value;
        }
        
      `);
        }
        builder.write(`payload.value = newResult;`), builder.write(`return payload;`);
        let fn = builder.compile();
        return (payload: ParsePayload, ctx: ParseContext) => fn(shape, payload, ctx);
      },
      compiledFn: any,
      inputCheck = isObject,
      jitEnabled = !$globalConfig.jitless,
      canUseJit = jitEnabled && $canUseFunction.value,
      catchall = def.catchall,
      cachedInternals: any;
    inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      cachedInternals ??= internals.value;
      let input = payload.value;
      return inputCheck(input) ? jitEnabled && canUseJit && ctx?.async === !1 && ctx.jitless !== !0 ? (compiledFn ||= compileShape(def.shape), payload = compiledFn(payload, ctx), catchall ? processCatchallKeys([], input, payload, ctx, cachedInternals, inst) : payload) : baseParse(payload, ctx) : (payload.issues.push({
        expected: `object`,
        code: `invalid_type`,
        input: input,
        inst: inst
      }), payload);
    };
  });

/** jsx 1592 —— 并集结果裁决（首个零 issue 命中；恰一非中止候选时采纳；否则 invalid_union） */ function finalizeUnionParse(optionPayloads: ParsePayload[], payload: ParsePayload, inst: ZodInst, ctx: ParseContext) {
  for (let candidate of optionPayloads) if (candidate.issues.length === 0) return payload.value = candidate.value, payload;
  let nonAborted = optionPayloads.filter(candidate => !$shouldAbort(candidate));
  return nonAborted.length === 1 ? (payload.value = nonAborted[0].value, nonAborted[0]) : (payload.issues.push({
    code: `invalid_union`,
    input: payload.value,
    inst: inst,
    errors: optionPayloads.map(candidate => candidate.issues.map(issue => $cleanIssue(issue, ctx, $getGlobalConfig())))
  }), payload);
}

/** jsx 1602 */ const $ZodUnion = $constructor(`$ZodUnion`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), $lazyDefine(inst._zod, `optin`, () => def.options.some((option: ZodInst) => option._zod.optin === `optional`) ? `optional` : void 0), $lazyDefine(inst._zod, `optout`, () => def.options.some((option: ZodInst) => option._zod.optout === `optional`) ? `optional` : void 0), $lazyDefine(inst._zod, `values`, () => {
      if (def.options.every((option: ZodInst) => option._zod.values)) return new Set(def.options.flatMap((option: ZodInst) => Array.from(option._zod.values)));
    }), $lazyDefine(inst._zod, `pattern`, () => {
      if (def.options.every((option: ZodInst) => option._zod.pattern)) {
        let sources = def.options.map((option: ZodInst) => option._zod.pattern);
        return RegExp(`^(${sources.map((re: RegExp) => stripRegexAnchors(re.source)).join(`|`)})$`);
      }
    });
    let singleOption = def.options.length === 1,
      singleRun = def.options[0]._zod.run;
    inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      if (singleOption) return singleRun(payload, ctx);
      let hasAsync = !1,
        optionPayloads: any[] = [];
      for (let option of def.options) {
        let optionPayload = option._zod.run({
          value: payload.value,
          issues: []
        }, ctx);
        if (optionPayload instanceof Promise) optionPayloads.push(optionPayload), hasAsync = !0;else {
          if (optionPayload.issues.length === 0) return optionPayload;
          optionPayloads.push(optionPayload);
        }
      }
      return hasAsync ? Promise.all(optionPayloads).then(resolved => finalizeUnionParse(resolved, payload, inst, ctx)) : finalizeUnionParse(optionPayloads, payload, inst, ctx);
    };
  }),
  /** jsx 1630 */ $ZodDiscriminatedUnion = $constructor(`$ZodDiscriminatedUnion`, (inst: ZodInst, def: ZodDef) => {
    def.inclusive = !1, ($ZodUnion as any).init(inst, def);
    let unionParse = inst._zod.parse;
    $lazyDefine(inst._zod, `propValues`, () => {
      let merged: Record<string, Set<any>> = {};
      for (let option of def.options) {
        let optionPropValues = option._zod.propValues;
        if (!optionPropValues || Object.keys(optionPropValues).length === 0) throw Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
        for (let [key, values] of Object.entries(optionPropValues)) {
          merged[key] || (merged[key] = new Set());
          for (let value of values as Set<any>) merged[key].add(value);
        }
      }
      return merged;
    });
    let discriminatorMap = $lazy(() => {
      let options = def.options,
        map = new Map<any, ZodInst>();
      for (let option of options) {
        let values = option._zod.propValues?.[def.discriminator];
        if (!values || values.size === 0) throw Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
        for (let value of values) {
          if (map.has(value)) throw Error(`Duplicate discriminator value "${String(value)}"`);
          map.set(value, option);
        }
      }
      return map;
    });
    inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      let input = payload.value;
      if (!isObject(input)) return payload.issues.push({
        code: `invalid_type`,
        expected: `object`,
        input: input,
        inst: inst
      }), payload;
      let matched = discriminatorMap.value.get(input?.[def.discriminator]);
      return matched ? matched._zod.run(payload, ctx) : def.unionFallback ? unionParse(payload, ctx) : (payload.issues.push({
        code: `invalid_union`,
        errors: [],
        note: `No matching discriminator`,
        discriminator: def.discriminator,
        input: input,
        path: [def.discriminator],
        inst: inst
      }), payload);
    };
  }),
  /** jsx 1678 */ $ZodIntersection = $constructor(`$ZodIntersection`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      let input = payload.value,
        leftPayload = def.left._zod.run({
          value: input,
          issues: []
        }, ctx),
        rightPayload = def.right._zod.run({
          value: input,
          issues: []
        }, ctx);
      return leftPayload instanceof Promise || rightPayload instanceof Promise ? Promise.all([leftPayload, rightPayload]).then(([left, right]) => finalizeIntersectionParse(payload, left, right)) : finalizeIntersectionParse(payload, leftPayload, rightPayload);
    };
  });

/** jsx 1692 —— 交集值合并（深合并对象/数组；Date 按时间比较） */ function mergeValues(a: any, b: any): { valid: boolean; data?: any; mergeErrorPath?: PropertyKey[] } {
  if (a === b || a instanceof Date && b instanceof Date && +a == +b) return {
    valid: !0,
    data: a
  };
  if (isPlainObject(a) && isPlainObject(b)) {
    let bKeys = Object.keys(b),
      sharedKeys = Object.keys(a).filter(key => bKeys.indexOf(key) !== -1),
      merged: Record<string, any> = {
        ...a,
        ...b
      };
    for (let key of sharedKeys) {
      let result = mergeValues(a[key], b[key]);
      if (!result.valid) return {
        valid: !1,
        mergeErrorPath: [key, ...result.mergeErrorPath!]
      };
      merged[key] = result.data;
    }
    return {
      valid: !0,
      data: merged
    };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return {
      valid: !1,
      mergeErrorPath: []
    };
    let mergedArray: any[] = [];
    for (let i = 0; i < a.length; i++) {
      let leftElement = a[i],
        rightElement = b[i],
        result = mergeValues(leftElement, rightElement);
      if (!result.valid) return {
        valid: !1,
        mergeErrorPath: [i, ...result.mergeErrorPath!]
      };
      mergedArray.push(result.data);
    }
    return {
      valid: !0,
      data: mergedArray
    };
  }
  return {
    valid: !1,
    mergeErrorPath: []
  };
}

/** jsx 1743 —— 交集解析收尾（unrecognized_keys 左右求交；值合并失败抛错） */ function finalizeIntersectionParse(payload: ParsePayload, leftPayload: ParsePayload, rightPayload: ParsePayload) {
  let keyOwnership = new Map<string, { l?: boolean; r?: boolean }>(),
    firstUnrecognized: any;
  for (let issue of leftPayload.issues) if (issue.code === `unrecognized_keys`) {
    firstUnrecognized ??= issue;
    for (let key of issue.keys) keyOwnership.has(key) || keyOwnership.set(key, {}), keyOwnership.get(key)!.l = !0;
  } else payload.issues.push(issue);
  for (let issue of rightPayload.issues) if (issue.code === `unrecognized_keys`) for (let key of issue.keys) keyOwnership.has(key) || keyOwnership.set(key, {}), keyOwnership.get(key)!.r = !0;else payload.issues.push(issue);
  let sharedKeys = [...keyOwnership].filter(([, flags]) => flags.l && flags.r).map(([key]) => key);
  if (sharedKeys.length && firstUnrecognized && payload.issues.push({
    ...firstUnrecognized,
    keys: sharedKeys
  }), $shouldAbort(payload)) return payload;
  let merged = mergeValues(leftPayload.value, rightPayload.value);
  if (!merged.valid) throw Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
  return payload.value = merged.data, payload;
}

/** jsx 1760 */ const $ZodRecord = $constructor(`$ZodRecord`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      let input = payload.value;
      if (!isPlainObject(input)) return payload.issues.push({
        expected: `record`,
        code: `invalid_type`,
        input: input,
        inst: inst
      }), payload;
      let asyncTasks: Promise<void>[] = [],
        knownValues = def.keyType._zod.values;
      if (knownValues) {
        payload.value = {};
        let seen = new Set<PropertyKey>();
        for (let key of knownValues) if (typeof key == `string` || typeof key == `number` || typeof key == `symbol`) {
          seen.add(typeof key == `number` ? key.toString() : key);
          let valuePayload = def.valueType._zod.run({
            value: input[key],
            issues: []
          }, ctx);
          valuePayload instanceof Promise ? asyncTasks.push(valuePayload.then(result => {
            result.issues.length && payload.issues.push(...prefixIssuePath(key, result.issues)), payload.value[key] = result.value;
          })) : (valuePayload.issues.length && payload.issues.push(...prefixIssuePath(key, valuePayload.issues)), payload.value[key] = valuePayload.value);
        }
        let unrecognized: string[] | undefined;
        for (let key in input) seen.has(key) || (unrecognized ??= [], unrecognized.push(key));
        unrecognized && unrecognized.length > 0 && payload.issues.push({
          code: `unrecognized_keys`,
          input: input,
          inst: inst,
          keys: unrecognized
        });
      } else {
        payload.value = {};
        for (let rawKey of Reflect.ownKeys(input)) {
          if (rawKey === `__proto__`) continue;
          let keyPayload = def.keyType._zod.run({
            value: rawKey,
            issues: []
          }, ctx);
          if (keyPayload instanceof Promise) throw Error(`Async schemas not supported in object keys currently`);
          if (typeof rawKey == `string` && numberRegex.test(rawKey) && keyPayload.issues.length) {
            let numericKeyPayload = def.keyType._zod.run({
              value: Number(rawKey),
              issues: []
            }, ctx);
            if (numericKeyPayload instanceof Promise) throw Error(`Async schemas not supported in object keys currently`);
            numericKeyPayload.issues.length === 0 && (keyPayload = numericKeyPayload);
          }
          if (keyPayload.issues.length) {
            def.mode === `loose` ? payload.value[rawKey] = input[rawKey] : payload.issues.push({
              code: `invalid_key`,
              origin: `record`,
              issues: keyPayload.issues.map((issue: any) => $cleanIssue(issue, ctx, $getGlobalConfig())),
              input: rawKey,
              path: [rawKey],
              inst: inst
            });
            continue;
          }
          let valuePayload = def.valueType._zod.run({
            value: input[rawKey],
            issues: []
          }, ctx);
          valuePayload instanceof Promise ? asyncTasks.push(valuePayload.then(result => {
            result.issues.length && payload.issues.push(...prefixIssuePath(rawKey, result.issues)), payload.value[keyPayload.value] = result.value;
          })) : (valuePayload.issues.length && payload.issues.push(...prefixIssuePath(rawKey, valuePayload.issues)), payload.value[keyPayload.value] = valuePayload.value);
        }
      }
      return asyncTasks.length ? Promise.all(asyncTasks).then(() => payload) : payload;
    };
  }),
  /** jsx 1832 */ $ZodEnum = $constructor(`$ZodEnum`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def);
    let values = $getEnumValues(def.entries),
      valueSet = new Set(values);
    inst._zod.values = valueSet, inst._zod.pattern = RegExp(`^(${values.filter(value => PRIMITIVE_TYPES.has(typeof value)).map(value => typeof value == `string` ? escapeRegex(value) : value.toString()).join(`|`)})$`), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      let input = payload.value;
      return valueSet.has(input) || payload.issues.push({
        code: `invalid_value`,
        values: values,
        input: input,
        inst: inst
      }), payload;
    };
  }),
  /** jsx 1846 */ $ZodLiteral = $constructor(`$ZodLiteral`, (inst: ZodInst, def: ZodDef) => {
    if (($ZodType as any).init(inst, def), def.values.length === 0) throw Error(`Cannot create literal schema with no valid values`);
    let valueSet = new Set(def.values);
    inst._zod.values = valueSet, inst._zod.pattern = RegExp(`^(${def.values.map((value: any) => typeof value == `string` ? escapeRegex(value) : value ? escapeRegex(value.toString()) : String(value)).join(`|`)})$`), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      let input = payload.value;
      return valueSet.has(input) || payload.issues.push({
        code: `invalid_value`,
        values: def.values,
        input: input,
        inst: inst
      }), payload;
    };
  }),
  /** jsx 1859 */ $ZodTransform = $constructor(`$ZodTransform`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      if (ctx.direction === `backward`) throw new $ZodEncodeError(inst.constructor.name);
      let transformed = def.transform(payload.value, payload);
      if (ctx.async) return (transformed instanceof Promise ? transformed : Promise.resolve(transformed)).then(value => (payload.value = value, payload));
      if (transformed instanceof Promise) throw new $ZodAsyncError();
      return payload.value = transformed, payload;
    };
  });

/** jsx 1868 —— optional 内层产生 issue 且输入为 undefined 时清空 issue */ function resetIssuesForOptionalUndefined(innerPayload: ParsePayload, inputValue: any) {
  return innerPayload.issues.length && inputValue === void 0 ? {
    issues: [],
    value: void 0
  } : innerPayload;
}

/** jsx 1874 */ const $ZodOptional = $constructor(`$ZodOptional`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.optin = `optional`, inst._zod.optout = `optional`, $lazyDefine(inst._zod, `values`, () => def.innerType._zod.values ? new Set([...def.innerType._zod.values, void 0]) : void 0), $lazyDefine(inst._zod, `pattern`, () => {
      let innerPattern = def.innerType._zod.pattern;
      return innerPattern ? RegExp(`^(${stripRegexAnchors(innerPattern.source)})?$`) : void 0;
    }), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      if (def.innerType._zod.optin === `optional`) {
        let innerPayload = def.innerType._zod.run(payload, ctx);
        return innerPayload instanceof Promise ? innerPayload.then(result => resetIssuesForOptionalUndefined(result, payload.value)) : resetIssuesForOptionalUndefined(innerPayload, payload.value);
      }
      return payload.value === void 0 ? payload : def.innerType._zod.run(payload, ctx);
    };
  }),
  /** jsx 1886 */ $ZodExactOptional = $constructor(`$ZodExactOptional`, (inst: ZodInst, def: ZodDef) => {
    ($ZodOptional as any).init(inst, def), $lazyDefine(inst._zod, `values`, () => def.innerType._zod.values), $lazyDefine(inst._zod, `pattern`, () => def.innerType._zod.pattern), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => def.innerType._zod.run(payload, ctx);
  }),
  /** jsx 1889 */ $ZodNullable = $constructor(`$ZodNullable`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), $lazyDefine(inst._zod, `optin`, () => def.innerType._zod.optin), $lazyDefine(inst._zod, `optout`, () => def.innerType._zod.optout), $lazyDefine(inst._zod, `pattern`, () => {
      let innerPattern = def.innerType._zod.pattern;
      return innerPattern ? RegExp(`^(${stripRegexAnchors(innerPattern.source)}|null)$`) : void 0;
    }), $lazyDefine(inst._zod, `values`, () => def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : void 0), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => payload.value === null ? payload : def.innerType._zod.run(payload, ctx);
  }),
  /** jsx 1895 */ $ZodDefault = $constructor(`$ZodDefault`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.optin = `optional`, $lazyDefine(inst._zod, `values`, () => def.innerType._zod.values), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      if (ctx.direction === `backward`) return def.innerType._zod.run(payload, ctx);
      if (payload.value === void 0) return payload.value = def.defaultValue, payload;
      let innerPayload = def.innerType._zod.run(payload, ctx);
      return innerPayload instanceof Promise ? innerPayload.then(result => applyDefaultValue(result, def)) : applyDefaultValue(innerPayload, def);
    };
  });

/** jsx 1903 */ function applyDefaultValue(payload: ParsePayload, def: ZodDef) {
  return payload.value === void 0 && (payload.value = def.defaultValue), payload;
}

/** jsx 1906 */ const $ZodPrefault = $constructor(`$ZodPrefault`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), inst._zod.optin = `optional`, $lazyDefine(inst._zod, `values`, () => def.innerType._zod.values), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => (ctx.direction === `backward` || payload.value === void 0 && (payload.value = def.defaultValue), def.innerType._zod.run(payload, ctx));
  }),
  /** jsx 1909 */ $ZodNonOptional = $constructor(`$ZodNonOptional`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), $lazyDefine(inst._zod, `values`, () => {
      let innerValues = def.innerType._zod.values;
      return innerValues ? new Set([...innerValues].filter(value => value !== void 0)) : void 0;
    }), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      let innerPayload = def.innerType._zod.run(payload, ctx);
      return innerPayload instanceof Promise ? innerPayload.then(result => rejectUndefinedValue(result, inst)) : rejectUndefinedValue(innerPayload, inst);
    };
  });

/** jsx 1918 */ function rejectUndefinedValue(payload: ParsePayload, inst: ZodInst) {
  return !payload.issues.length && payload.value === void 0 && payload.issues.push({
    code: `invalid_type`,
    expected: `nonoptional`,
    input: payload.value,
    inst: inst
  }), payload;
}

/** jsx 1926 */ const $ZodCatch = $constructor(`$ZodCatch`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), $lazyDefine(inst._zod, `optin`, () => def.innerType._zod.optin), $lazyDefine(inst._zod, `optout`, () => def.innerType._zod.optout), $lazyDefine(inst._zod, `values`, () => def.innerType._zod.values), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      if (ctx.direction === `backward`) return def.innerType._zod.run(payload, ctx);
      let innerPayload = def.innerType._zod.run(payload, ctx);
      return innerPayload instanceof Promise ? innerPayload.then(result => (payload.value = result.value, result.issues.length && (payload.value = def.catchValue({
        ...payload,
        error: {
          issues: result.issues.map((issue: any) => $cleanIssue(issue, ctx, $getGlobalConfig()))
        },
        input: payload.value
      }), payload.issues = []), payload)) : (payload.value = innerPayload.value, innerPayload.issues.length && (payload.value = def.catchValue({
        ...payload,
        error: {
          issues: innerPayload.issues.map((issue: any) => $cleanIssue(issue, ctx, $getGlobalConfig()))
        },
        input: payload.value
      }), payload.issues = []), payload);
    };
  }),
  /** jsx 1945 */ $ZodPipe = $constructor(`$ZodPipe`, (inst: ZodInst, def: ZodDef) => {
    ($ZodType as any).init(inst, def), $lazyDefine(inst._zod, `values`, () => def.in._zod.values), $lazyDefine(inst._zod, `optin`, () => def.in._zod.optin), $lazyDefine(inst._zod, `optout`, () => def.out._zod.optout), $lazyDefine(inst._zod, `propValues`, () => def.in._zod.propValues), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
      if (ctx.direction === `backward`) {
        let outPayload = def.out._zod.run(payload, ctx);
        return outPayload instanceof Promise ? outPayload.then(result => runPipeStage(result, def.in, ctx)) : runPipeStage(outPayload, def.in, ctx);
      }
      let inPayload = def.in._zod.run(payload, ctx);
      return inPayload instanceof Promise ? inPayload.then(result => runPipeStage(result, def.out, ctx)) : runPipeStage(inPayload, def.out, ctx);
    };
  });

/** jsx 1955 —— pipe 级联（前段有 issue 即中止） */ function runPipeStage(payload: ParsePayload, next: ZodInst, ctx: ParseContext) {
  return payload.issues.length ? (payload.aborted = !0, payload) : next._zod.run({
    value: payload.value,
    issues: payload.issues
  }, ctx);
}

/** jsx 1961 */ const $ZodReadonly = $constructor(`$ZodReadonly`, (inst: ZodInst, def: ZodDef) => {
  ($ZodType as any).init(inst, def), $lazyDefine(inst._zod, `propValues`, () => def.innerType._zod.propValues), $lazyDefine(inst._zod, `values`, () => def.innerType._zod.values), $lazyDefine(inst._zod, `optin`, () => def.innerType?._zod?.optin), $lazyDefine(inst._zod, `optout`, () => def.innerType?._zod?.optout), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
    if (ctx.direction === `backward`) return def.innerType._zod.run(payload, ctx);
    let innerPayload = def.innerType._zod.run(payload, ctx);
    return innerPayload instanceof Promise ? innerPayload.then(freezePayloadValue) : freezePayloadValue(innerPayload);
  };
});

/** jsx 1968 */ function freezePayloadValue(payload: ParsePayload) {
  return payload.value = Object.freeze(payload.value), payload;
}

/** jsx 1971 */ const $ZodCustom = $constructor(`$ZodCustom`, (inst: ZodInst, def: ZodDef) => {
  ($ZodCheck as any).init(inst, def), ($ZodType as any).init(inst, def), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => payload, inst._zod.check = (payload: ParsePayload) => {
    let value = payload.value,
      result = def.fn(value);
    if (result instanceof Promise) return result.then(resolved => handleCustomCheckResult(resolved, payload, value, inst));
    handleCustomCheckResult(result, payload, value, inst);
  };
});

/** jsx 1979 —— 自定义检查失败 → custom issue（path/params/abort 语义） */ function handleCustomCheckResult(passed: any, payload: ParsePayload, value: any, inst: ZodInst) {
  if (!passed) {
    let issue: any = {
      code: `custom`,
      input: value,
      inst: inst,
      path: [...(inst._zod.def.path ?? [])],
      continue: !inst._zod.def.abort
    };
    inst._zod.def.params && (issue.params = inst._zod.def.params), payload.issues.push($issue(issue));
  }
}

/* ============================================================================
 * §7 zod core —— registry + 工厂 + JSON Schema（jsx 1991–2935）
 * ==========================================================================*/

/** jsx 1991 —— 注册表初始化变量前置声明 */
let registryInit: any;
/** jsx 1992 —— 元数据注册表（WeakMap 主表 + id 反查表；父链合并读取） */
const MetadataRegistry = class {
  _map: WeakMap<object, any>;
  _idmap: Map<any, object>;
  constructor() {
    this._map = new WeakMap(), this._idmap = new Map();
  }
  add(schema: object, meta: any) {
    let stored = meta;
    return this._map.set(schema, stored), stored && typeof stored == `object` && `id` in stored && this._idmap.set(stored.id, schema), this;
  }
  clear() {
    return this._map = new WeakMap(), this._idmap = new Map(), this;
  }
  remove(schema: object) {
    let meta = this._map.get(schema);
    return meta && typeof meta == `object` && `id` in meta && this._idmap.delete(meta.id), this._map.delete(schema), this;
  }
  get(schema: any): any {
    let parent = schema._zod.parent;
    if (parent) {
      let inherited: any = {
        ...(this.get(parent) ?? {})
      };
      delete inherited.id;
      let merged = {
        ...inherited,
        ...this._map.get(schema)
      };
      return Object.keys(merged).length ? merged : void 0;
    }
    return this._map.get(schema);
  }
  has(schema: object) {
    return this._map.has(schema);
  }
};

/** jsx 2026 */ function createMetadataRegistry() {
  return new MetadataRegistry();
}

// jsx 2029 —— 全局注册表单例（__zod_globalRegistry 幂等装配）
(registryInit = globalThis as any).__zod_globalRegistry ?? (registryInit.__zod_globalRegistry = createMetadataRegistry());

/** jsx 2030 */ const $globalRegistry: any = (globalThis as any).__zod_globalRegistry;

/** jsx 2031 */ function $string(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2037 */ function $email(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `email`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2046 */ function $guid(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `guid`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2055 */ function $uuid(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `uuid`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2064 */ function $uuidv4(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `uuid`,
    check: `string_format`,
    abort: !1,
    version: `v4`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2074 */ function $uuidv6(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `uuid`,
    check: `string_format`,
    abort: !1,
    version: `v6`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2084 */ function $uuidv7(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `uuid`,
    check: `string_format`,
    abort: !1,
    version: `v7`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2094 */ function $url(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `url`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2103 */ function $emoji(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `emoji`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2112 */ function $nanoid(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `nanoid`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2121 */ function $cuid(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `cuid`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2130 */ function $cuid2(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `cuid2`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2139 */ function $ulid(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `ulid`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2148 */ function $xid(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `xid`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2157 */ function $ksuid(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `ksuid`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2166 */ function $ipv4(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `ipv4`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2175 */ function $ipv6(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `ipv6`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2184 */ function $cidrv4(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `cidrv4`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2193 */ function $cidrv6(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `cidrv6`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2202 */ function $base64(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `base64`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2211 */ function $base64url(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `base64url`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2220 */ function $e164(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `e164`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2229 */ function $jwt(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `jwt`,
    check: `string_format`,
    abort: !1,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2238 */ function $datetime(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `datetime`,
    check: `string_format`,
    offset: !1,
    local: !1,
    precision: null,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2249 */ function $date(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `date`,
    check: `string_format`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2257 */ function $time(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `time`,
    check: `string_format`,
    precision: null,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2266 */ function $duration(Ctor: any, params?: any) {
  return new Ctor({
    type: `string`,
    format: `duration`,
    check: `string_format`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2274 */ function $number(Ctor: any, params?: any) {
  return new Ctor({
    type: `number`,
    checks: [],
    ...normalizeCheckParams(params)
  });
}
/** jsx 2281 */ function $int(Ctor: any, params?: any) {
  return new Ctor({
    type: `number`,
    check: `number_format`,
    abort: !1,
    format: `safeint`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2290 */ function $boolean(Ctor: any, params?: any) {
  return new Ctor({
    type: `boolean`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2296 */ function $undefined(Ctor: any, params?: any) {
  return new Ctor({
    type: `undefined`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2302 */ function $unknown(Ctor: any) {
  return new Ctor({
    type: `unknown`
  });
}
/** jsx 2307 */ function $never(Ctor: any, params?: any) {
  return new Ctor({
    type: `never`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2313 */ function $dateValue(Ctor: any, params?: any) {
  return new Ctor({
    type: `date`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2319 */ function $lt(value: any, params?: any) {
  return new ($ZodCheckLessThan as any)({
    check: `less_than`,
    ...normalizeCheckParams(params),
    value: value,
    inclusive: !1
  });
}
/** jsx 2327 */ function $lte(value: any, params?: any) {
  return new ($ZodCheckLessThan as any)({
    check: `less_than`,
    ...normalizeCheckParams(params),
    value: value,
    inclusive: !0
  });
}
/** jsx 2335 */ function $gt(value: any, params?: any) {
  return new ($ZodCheckGreaterThan as any)({
    check: `greater_than`,
    ...normalizeCheckParams(params),
    value: value,
    inclusive: !1
  });
}
/** jsx 2343 */ function $gte(value: any, params?: any) {
  return new ($ZodCheckGreaterThan as any)({
    check: `greater_than`,
    ...normalizeCheckParams(params),
    value: value,
    inclusive: !0
  });
}
/** jsx 2351 */ function $multipleOf(value: any, params?: any) {
  return new ($ZodCheckMultipleOf as any)({
    check: `multiple_of`,
    ...normalizeCheckParams(params),
    value: value
  });
}
/** jsx 2358 */ function $maxLength(maximum: number, params?: any) {
  return new ($ZodCheckMaxLength as any)({
    check: `max_length`,
    ...normalizeCheckParams(params),
    maximum: maximum
  });
}
/** jsx 2365 */ function $minLength(minimum: number, params?: any) {
  return new ($ZodCheckMinLength as any)({
    check: `min_length`,
    ...normalizeCheckParams(params),
    minimum: minimum
  });
}
/** jsx 2372 */ function $length(length: number, params?: any) {
  return new ($ZodCheckLengthEquals as any)({
    check: `length_equals`,
    ...normalizeCheckParams(params),
    length: length
  });
}
/** jsx 2379 */ function $regex(pattern: RegExp, params?: any) {
  return new ($ZodCheckRegex as any)({
    check: `string_format`,
    format: `regex`,
    ...normalizeCheckParams(params),
    pattern: pattern
  });
}
/** jsx 2387 */ function $lowercase(params?: any) {
  return new ($ZodCheckLowerCase as any)({
    check: `string_format`,
    format: `lowercase`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2394 */ function $uppercase(params?: any) {
  return new ($ZodCheckUpperCase as any)({
    check: `string_format`,
    format: `uppercase`,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2401 */ function $includes(includes: string, params?: any) {
  return new ($ZodCheckIncludes as any)({
    check: `string_format`,
    format: `includes`,
    ...normalizeCheckParams(params),
    includes: includes
  });
}
/** jsx 2409 */ function $startsWith(prefix: string, params?: any) {
  return new ($ZodCheckStartsWith as any)({
    check: `string_format`,
    format: `starts_with`,
    ...normalizeCheckParams(params),
    prefix: prefix
  });
}
/** jsx 2417 */ function $endsWith(suffix: string, params?: any) {
  return new ($ZodCheckEndsWith as any)({
    check: `string_format`,
    format: `ends_with`,
    ...normalizeCheckParams(params),
    suffix: suffix
  });
}
/** jsx 2425 */ function $overwrite(tx: (value: any) => any) {
  return new ($ZodCheckOverwrite as any)({
    check: `overwrite`,
    tx: tx
  });
}
/** jsx 2431 */ function $normalize(form: string) {
  return $overwrite(value => value.normalize(form));
}
/** jsx 2434 */ function $trim() {
  return $overwrite(value => value.trim());
}
/** jsx 2437 */ function $toLowerCase() {
  return $overwrite(value => value.toLowerCase());
}
/** jsx 2440 */ function $toUpperCase() {
  return $overwrite(value => value.toUpperCase());
}
/** jsx 2443 */ function $slugify() {
  return $overwrite(value => slugify(value));
}
/** jsx 2446 */ function $array(Ctor: any, element: ZodInst, params?: any) {
  return new Ctor({
    type: `array`,
    element: element,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2453 */ function $custom(Ctor: any, fn: (value: any) => any, params?: any) {
  return new Ctor({
    type: `custom`,
    check: `custom`,
    fn: fn,
    ...normalizeCheckParams(params)
  });
}
/** jsx 2461 —— superRefine（addIssue 上下文注入） */ function $superRefine(fn: (value: any, ctx: any) => void) {
  let schema = defineCheck((payload: ParsePayload) => (payload.addIssue = (issue: any) => {
    if (typeof issue == `string`) payload.issues.push($issue(issue, payload.value, schema._zod.def));else {
      let normalized = issue;
      normalized.fatal && (normalized.continue = !1), normalized.code ??= `custom`, normalized.input ??= payload.value, normalized.inst ??= schema, normalized.continue ??= !schema._zod.def.abort, payload.issues.push($issue(normalized));
    }
  }, fn(payload.value, payload)));
  return schema;
}
/** jsx 2470 */ function defineCheck(check: (payload: ParsePayload) => void, params?: any) {
  let inst = new ($ZodCheck as any)({
    check: `custom`,
    ...normalizeCheckParams(params)
  });
  return inst._zod.check = check, inst;
}
/** jsx 2477 —— JSON Schema 转换上下文归一（target/io/cycles/reused/external 缺省值） */ function initJsonSchemaContext(params?: any) {
  let target = params?.target ?? `draft-2020-12`;
  return target === `draft-4` && (target = `draft-04`), target === `draft-7` && (target = `draft-07`), {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? $globalRegistry,
    target: target,
    unrepresentable: params?.unrepresentable ?? `throw`,
    override: params?.override ?? (() => {}),
    io: params?.io ?? `output`,
    counter: 0,
    seen: new Map<any, any>(),
    cycles: params?.cycles ?? `ref`,
    reused: params?.reused ?? `inline`,
    external: params?.external ?? void 0
  };
}
/** jsx 2493 —— JSON Schema 递归生成（环检测/父链 ref/metadata 合并/io=input 时 examples/default 处理） */ function processJsonSchemaNode(schema: ZodInst, ctx: any, params: { path: PropertyKey[]; schemaPath: ZodInst[] } = {
  path: [],
  schemaPath: []
}) {
  var _a;
  let def = schema._zod.def,
    seenEntry = ctx.seen.get(schema);
  if (seenEntry) return seenEntry.count++, params.schemaPath.includes(schema) && (seenEntry.cycle = params.path), seenEntry.schema;
  let entry = {
    schema: {} as Record<string, any>,
    count: 1,
    cycle: void 0 as PropertyKey[] | undefined,
    path: params.path
  } as { schema: Record<string, any>; count: number; cycle: PropertyKey[] | undefined; path: PropertyKey[]; ref?: any };
  ctx.seen.set(schema, entry);
  let direct = schema._zod.toJSONSchema?.();
  if (direct) entry.schema = direct;else {
    let childParams = {
      ...params,
      schemaPath: [...params.schemaPath, schema],
      path: params.path
    };
    if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, entry.schema, childParams);else {
      let jsonSchema = entry.schema,
        processor = ctx.processors[def.type];
      if (!processor) throw Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      processor(schema, ctx, jsonSchema, childParams);
    }
    let parent = schema._zod.parent;
    parent && (entry.ref ||= parent, processJsonSchemaNode(parent, ctx, childParams), ctx.seen.get(parent).isParent = !0);
  }
  let metadata = ctx.metadataRegistry.get(schema);
  return metadata && Object.assign(entry.schema, metadata), ctx.io === `input` && schemaContainsTransform(schema) && (delete entry.schema.examples, delete entry.schema.default), ctx.io === `input` && entry.schema._prefault && ((_a = entry.schema).default ?? (_a.default = entry.schema._prefault)), delete entry.schema._prefault, ctx.seen.get(schema).schema;
}
/** jsx 2527 —— refs/defs 解析（环/复用/外部注册表；draft 差异 $defs|definitions） */ function resolveJsonSchemaRefs(ctx: any, root: ZodInst) {
  let rootEntry = ctx.seen.get(root);
  if (!rootEntry) throw Error(`Unprocessed schema. This is a bug in Zod.`);
  let idsSeen = new Map<any, ZodInst>();
  for (let [seenSchema, seenEntry] of ctx.seen.entries()) {
    let id = ctx.metadataRegistry.get(seenSchema)?.id;
    if (id) {
      let existing = idsSeen.get(id);
      if (existing && existing !== seenSchema) throw Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      idsSeen.set(id, seenSchema);
    }
  }
  let makeRef = (entryPair: [ZodInst, any]) => {
      let defsKey = ctx.target === `draft-2020-12` ? `$defs` : `definitions`;
      if (ctx.external) {
        let externalId = ctx.external.registry.get(entryPair[0])?.id,
          uri = ctx.external.uri ?? ((id: string) => id);
        if (externalId) return {
          ref: uri(externalId)
        };
        let defId = entryPair[1].defId ?? entryPair[1].schema.id ?? `schema${ctx.counter++}`;
        return entryPair[1].defId = defId, {
          defId: defId,
          ref: `${uri(`__shared`)}#/${defsKey}/${defId}`
        };
      }
      if (entryPair[1] === rootEntry) return {
        ref: `#`
      };
      let refPrefix = `#/${defsKey}/`,
        defId = entryPair[1].schema.id ?? `__schema${ctx.counter++}`;
      return {
        defId: defId,
        ref: refPrefix + defId
      };
    },
    convertToRef = (entryPair: [ZodInst, any]) => {
      if (entryPair[1].schema.$ref) return;
      let entry = entryPair[1],
        {
          ref: refValue,
          defId: defIdValue
        } = makeRef(entryPair);
      entry.def = {
        ...entry.schema
      }, defIdValue && (entry.defId = defIdValue);
      let schema = entry.schema;
      for (let key in schema) delete schema[key];
      schema.$ref = refValue;
    };
  if (ctx.cycles === `throw`) for (let [, entry] of ctx.seen.entries()) {
    if (entry.cycle) throw Error(`Cycle detected: #/${entry.cycle?.join(`/`)}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
  }
  for (let entryPair of ctx.seen.entries()) {
    let entry = entryPair[1];
    if (root === entryPair[0]) {
      convertToRef(entryPair);
      continue;
    }
    if (ctx.external) {
      let externalId = ctx.external.registry.get(entryPair[0])?.id;
      if (root !== entryPair[0] && externalId) {
        convertToRef(entryPair);
        continue;
      }
    }
    if (ctx.metadataRegistry.get(entryPair[0])?.id) {
      convertToRef(entryPair);
      continue;
    }
    if (entry.cycle) {
      convertToRef(entryPair);
      continue;
    }
    if (entry.count > 1 && ctx.reused === `ref`) {
      convertToRef(entryPair);
      continue;
    }
  }
}
/** jsx 2610 —— JSON Schema 终稿装配（$schema/$id/$defs；父链内联；~standard.jsonSchema 挂载） */ function finalizeJsonSchema(ctx: any, root: ZodInst) {
  let rootEntry = ctx.seen.get(root);
  if (!rootEntry) throw Error(`Unprocessed schema. This is a bug in Zod.`);
  let inlineEntry = (schema: ZodInst) => {
    let entry = ctx.seen.get(schema);
    if (entry.ref === null) return;
    let base = entry.def ?? entry.schema,
      snapshot = {
        ...base
      },
      refTarget = entry.ref;
    if (entry.ref = null, refTarget) {
      inlineEntry(refTarget);
      let refEntry = ctx.seen.get(refTarget),
        refSchema = refEntry.schema;
      if (refSchema.$ref && (ctx.target === `draft-07` || ctx.target === `draft-04` || ctx.target === `openapi-3.0`) ? (base.allOf = base.allOf ?? [], base.allOf.push(refSchema)) : Object.assign(base, refSchema), Object.assign(base, snapshot), schema._zod.parent === refTarget) for (let key in base) key === `$ref` || key === `allOf` || key in snapshot || delete base[key];
      if (refSchema.$ref && refEntry.def) for (let key in base) key === `$ref` || key === `allOf` || key in refEntry.def && JSON.stringify(base[key]) === JSON.stringify(refEntry.def[key]) && delete base[key];
    }
    let parent = schema._zod.parent;
    if (parent && parent !== refTarget) {
      inlineEntry(parent);
      let parentEntry = ctx.seen.get(parent);
      if (parentEntry?.schema.$ref && (base.$ref = parentEntry.schema.$ref, parentEntry.def)) for (let key in base) key === `$ref` || key === `allOf` || key in parentEntry.def && JSON.stringify(base[key]) === JSON.stringify(parentEntry.def[key]) && delete base[key];
    }
    ctx.override({
      zodSchema: schema,
      jsonSchema: base,
      path: entry.path ?? []
    });
  };
  for (let entryPair of [...ctx.seen.entries()].reverse()) inlineEntry(entryPair[0]);
  let output: Record<string, any> = {};
  if (ctx.target === `draft-2020-12` ? output.$schema = `https://json-schema.org/draft/2020-12/schema` : ctx.target === `draft-07` ? output.$schema = `http://json-schema.org/draft-07/schema#` : ctx.target === `draft-04` ? output.$schema = `http://json-schema.org/draft-04/schema#` : ctx.target, ctx.external?.uri) {
    let externalId = ctx.external.registry.get(root)?.id;
    if (!externalId) throw Error("Schema is missing an `id` property");
    output.$id = ctx.external.uri(externalId);
  }
  Object.assign(output, rootEntry.def ?? rootEntry.schema);
  let defs = ctx.external?.defs ?? {};
  for (let [, entry] of ctx.seen.entries()) {
    entry.def && entry.defId && (defs[entry.defId] = entry.def);
  }
  ctx.external || Object.keys(defs).length > 0 && (ctx.target === `draft-2020-12` ? output.$defs = defs : output.definitions = defs);
  try {
    let parsed = JSON.parse(JSON.stringify(output));
    return Object.defineProperty(parsed, `~standard`, {
      value: {
        ...root[`~standard`],
        jsonSchema: {
          input: makeIoJsonSchemaFn(root, `input`, ctx.processors),
          output: makeIoJsonSchemaFn(root, `output`, ctx.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), parsed;
  } catch {
    throw Error(`Error converting schema to JSON.`);
  }
}
/** jsx 2671 —— 子树是否含 transform（io=input 的 default/examples 裁剪判定） */ function schemaContainsTransform(schema: ZodInst, state?: { seen: Set<ZodInst> }): boolean {
  let traversal = state ?? {
    seen: new Set()
  };
  if (traversal.seen.has(schema)) return !1;
  traversal.seen.add(schema);
  let def = schema._zod.def;
  if (def.type === `transform`) return !0;
  if (def.type === `array`) return schemaContainsTransform(def.element, traversal);
  if (def.type === `set`) return schemaContainsTransform(def.valueType, traversal);
  if (def.type === `lazy`) return schemaContainsTransform(def.getter(), traversal);
  if (def.type === `promise` || def.type === `optional` || def.type === `nonoptional` || def.type === `nullable` || def.type === `readonly` || def.type === `default` || def.type === `prefault`) return schemaContainsTransform(def.innerType, traversal);
  if (def.type === `intersection`) return schemaContainsTransform(def.left, traversal) || schemaContainsTransform(def.right, traversal);
  if (def.type === `record` || def.type === `map`) return schemaContainsTransform(def.keyType, traversal) || schemaContainsTransform(def.valueType, traversal);
  if (def.type === `pipe`) return schemaContainsTransform(def.in, traversal) || schemaContainsTransform(def.out, traversal);
  if (def.type === `object`) {
    for (let key in def.shape) if (schemaContainsTransform(def.shape[key], traversal)) return !0;
    return !1;
  }
  if (def.type === `union`) {
    for (let option of def.options) if (schemaContainsTransform(option, traversal)) return !0;
    return !1;
  }
  if (def.type === `tuple`) {
    for (let item of def.items) if (schemaContainsTransform(item, traversal)) return !0;
    return !!(def.rest && schemaContainsTransform(def.rest, traversal));
  }
  return !1;
}
/** jsx 2700 —— toJSONSchema 工厂（processors 预绑定） */ const makeToJsonSchemaFn = (schema: ZodInst, processors: Record<string, any> = {}) => (params: any) => {
    let ctx = initJsonSchemaContext({
      ...params,
      processors: processors
    });
    return processJsonSchemaNode(schema, ctx), resolveJsonSchemaRefs(ctx, schema), finalizeJsonSchema(ctx, schema);
  },
  /** jsx 2707 —— io 定向 JSON Schema 工厂（~standard.jsonSchema input/output） */ makeIoJsonSchemaFn = (schema: ZodInst, io: `input` | `output`, processors: Record<string, any> = {}) => (params?: any) => {
    let {
        libraryOptions: libraryOptions,
        target: target
      } = params ?? {},
      ctx = initJsonSchemaContext({
        ...(libraryOptions ?? {}),
        target: target,
        io: io,
        processors: processors
      });
    return processJsonSchemaNode(schema, ctx), resolveJsonSchemaRefs(ctx, schema), finalizeJsonSchema(ctx, schema);
  },
  /** jsx 2720 —— zod format → JSON Schema format 映射 */ JSON_SCHEMA_FORMAT_MAP: Record<string, string> = {
    guid: `uuid`,
    url: `uri`,
    datetime: `date-time`,
    json_string: `json-string`,
    regex: ``
  },
  /** jsx 2727 */ processJsonSchemaString = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let output = jsonSchema;
    output.type = `string`;
    let {
      minimum: minimum,
      maximum: maximum,
      format: format,
      patterns: patterns,
      contentEncoding: contentEncoding
    } = schema._zod.bag;
    if (typeof minimum == `number` && (output.minLength = minimum), typeof maximum == `number` && (output.maxLength = maximum), format && (output.format = JSON_SCHEMA_FORMAT_MAP[format] ?? format, output.format === `` && delete output.format, format === `time` && delete output.format), contentEncoding && (output.contentEncoding = contentEncoding), patterns && patterns.size > 0) {
      let patternList = [...patterns];
      patternList.length === 1 ? output.pattern = patternList[0].source : patternList.length > 1 && (output.allOf = [...patternList.map((pattern: RegExp) => ({
        ...(ctx.target === `draft-07` || ctx.target === `draft-04` || ctx.target === `openapi-3.0` ? {
          type: `string`
        } : {}),
        pattern: pattern.source
      }))]);
    }
  },
  /** jsx 2747 */ processJsonSchemaNumber = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let output = jsonSchema,
      {
        minimum: minimum,
        maximum: maximum,
        format: format,
        multipleOf: multipleOf,
        exclusiveMaximum: exclusiveMaximum,
        exclusiveMinimum: exclusiveMinimum
      } = schema._zod.bag;
    typeof format == `string` && format.includes(`int`) ? output.type = `integer` : output.type = `number`, typeof exclusiveMinimum == `number` && (ctx.target === `draft-04` || ctx.target === `openapi-3.0` ? (output.minimum = exclusiveMinimum, output.exclusiveMinimum = !0) : output.exclusiveMinimum = exclusiveMinimum), typeof minimum == `number` && (output.minimum = minimum, typeof exclusiveMinimum == `number` && ctx.target !== `draft-04` && (exclusiveMinimum >= minimum ? delete output.minimum : delete output.exclusiveMinimum)), typeof exclusiveMaximum == `number` && (ctx.target === `draft-04` || ctx.target === `openapi-3.0` ? (output.maximum = exclusiveMaximum, output.exclusiveMaximum = !0) : output.exclusiveMaximum = exclusiveMaximum), typeof maximum == `number` && (output.maximum = maximum, typeof exclusiveMaximum == `number` && ctx.target !== `draft-04` && (exclusiveMaximum <= maximum ? delete output.maximum : delete output.exclusiveMaximum)), typeof multipleOf == `number` && (output.multipleOf = multipleOf);
  },
  /** jsx 2759 */ processJsonSchemaBoolean = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    jsonSchema.type = `boolean`;
  },
  /** jsx 2762 */ processJsonSchemaUndefined = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    if (ctx.unrepresentable === `throw`) throw Error(`Undefined cannot be represented in JSON Schema`);
  },
  /** jsx 2765 */ processJsonSchemaNever = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    jsonSchema.not = {};
  },
  /** jsx 2768 */ processJsonSchemaDate = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    if (ctx.unrepresentable === `throw`) throw Error(`Date cannot be represented in JSON Schema`);
  },
  /** jsx 2771 */ processJsonSchemaEnum = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def,
      values = $getEnumValues(def.entries);
    values.every(value => typeof value == `number`) && (jsonSchema.type = `number`), values.every(value => typeof value == `string`) && (jsonSchema.type = `string`), jsonSchema.enum = values;
  },
  /** jsx 2776 */ processJsonSchemaLiteral = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def,
      values: any[] = [];
    for (let value of def.values) if (value === void 0) {
      if (ctx.unrepresentable === `throw`) throw Error("Literal `undefined` cannot be represented in JSON Schema");
    } else if (typeof value == `bigint`) {
      if (ctx.unrepresentable === `throw`) throw Error(`BigInt literals cannot be represented in JSON Schema`);
      values.push(Number(value));
    } else values.push(value);
    if (values.length !== 0) if (values.length === 1) {
      let single = values[0];
      jsonSchema.type = single === null ? `null` : typeof single, ctx.target === `draft-04` || ctx.target === `openapi-3.0` ? jsonSchema.enum = [single] : jsonSchema.const = single;
    } else values.every(value => typeof value == `number`) && (jsonSchema.type = `number`), values.every(value => typeof value == `string`) && (jsonSchema.type = `string`), values.every(value => typeof value == `boolean`) && (jsonSchema.type = `boolean`), values.every(value => value === null) && (jsonSchema.type = `null`), jsonSchema.enum = values;
  },
  /** jsx 2790 */ processJsonSchemaCustom = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    if (ctx.unrepresentable === `throw`) throw Error(`Custom types cannot be represented in JSON Schema`);
  },
  /** jsx 2793 */ processJsonSchemaTransform = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    if (ctx.unrepresentable === `throw`) throw Error(`Transforms cannot be represented in JSON Schema`);
  },
  /** jsx 2796 */ processJsonSchemaArray = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let output = jsonSchema,
      def = schema._zod.def,
      {
        minimum: minimum,
        maximum: maximum
      } = schema._zod.bag;
    typeof minimum == `number` && (output.minItems = minimum), typeof maximum == `number` && (output.maxItems = maximum), output.type = `array`, output.items = processJsonSchemaNode(def.element, ctx, {
      ...params,
      path: [...params.path, `items`]
    });
  },
  /** jsx 2808 */ processJsonSchemaObject = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let output = jsonSchema,
      def = schema._zod.def;
    output.type = `object`, output.properties = {};
    let shape = def.shape;
    for (let key in shape) output.properties[key] = processJsonSchemaNode(shape[key], ctx, {
      ...params,
      path: [...params.path, `properties`, key]
    });
    let allKeys = new Set(Object.keys(shape)),
      requiredKeys = new Set([...allKeys].filter(key => {
        let member = def.shape[key]._zod;
        return ctx.io === `input` ? member.optin === void 0 : member.optout === void 0;
      }));
    requiredKeys.size > 0 && (output.required = Array.from(requiredKeys)), def.catchall?._zod.def.type === `never` ? output.additionalProperties = !1 : def.catchall ? def.catchall && (output.additionalProperties = processJsonSchemaNode(def.catchall, ctx, {
      ...params,
      path: [...params.path, `additionalProperties`]
    })) : ctx.io === `output` && (output.additionalProperties = !1);
  },
  /** jsx 2827 */ processJsonSchemaUnion = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def,
      exclusive = def.inclusive === !1,
      options = def.options.map((option: ZodInst, index: number) => processJsonSchemaNode(option, ctx, {
        ...params,
        path: [...params.path, exclusive ? `oneOf` : `anyOf`, index]
      }));
    exclusive ? jsonSchema.oneOf = options : jsonSchema.anyOf = options;
  },
  /** jsx 2836 */ processJsonSchemaIntersection = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def,
      left = processJsonSchemaNode(def.left, ctx, {
        ...params,
        path: [...params.path, `allOf`, 0]
      }),
      right = processJsonSchemaNode(def.right, ctx, {
        ...params,
        path: [...params.path, `allOf`, 1]
      }),
      isBareAllOf = (schemaNode: any) => `allOf` in schemaNode && Object.keys(schemaNode).length === 1;
    jsonSchema.allOf = [...(isBareAllOf(left) ? left.allOf : [left]), ...(isBareAllOf(right) ? right.allOf : [right])];
  },
  /** jsx 2849 */ processJsonSchemaRecord = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let output = jsonSchema,
      def = schema._zod.def;
    output.type = `object`;
    let keyType = def.keyType,
      keyPatterns = keyType._zod.bag?.patterns;
    if (def.mode === `loose` && keyPatterns && keyPatterns.size > 0) {
      let valueSchema = processJsonSchemaNode(def.valueType, ctx, {
        ...params,
        path: [...params.path, `patternProperties`, `*`]
      });
      output.patternProperties = {};
      for (let pattern of keyPatterns) output.patternProperties[pattern.source] = valueSchema;
    } else (ctx.target === `draft-07` || ctx.target === `draft-2020-12`) && (output.propertyNames = processJsonSchemaNode(def.keyType, ctx, {
      ...params,
      path: [...params.path, `propertyNames`]
    })), output.additionalProperties = processJsonSchemaNode(def.valueType, ctx, {
      ...params,
      path: [...params.path, `additionalProperties`]
    });
    let knownValues = keyType._zod.values;
    if (knownValues) {
      let requiredKeys = [...knownValues].filter(value => typeof value == `string` || typeof value == `number`);
      requiredKeys.length > 0 && (output.required = requiredKeys);
    }
  },
  /** jsx 2875 */ processJsonSchemaNullable = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def,
      innerSchema = processJsonSchemaNode(def.innerType, ctx, params),
      entry = ctx.seen.get(schema);
    ctx.target === `openapi-3.0` ? (entry.ref = def.innerType, jsonSchema.nullable = !0) : jsonSchema.anyOf = [innerSchema, {
      type: `null`
    }];
  },
  /** jsx 2883 */ processJsonSchemaNonOptional = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def;
    processJsonSchemaNode(def.innerType, ctx, params);
    let entry = ctx.seen.get(schema);
    entry.ref = def.innerType;
  },
  /** jsx 2889 */ processJsonSchemaDefault = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def;
    processJsonSchemaNode(def.innerType, ctx, params);
    let entry = ctx.seen.get(schema);
    entry.ref = def.innerType, jsonSchema.default = JSON.parse(JSON.stringify(def.defaultValue));
  },
  /** jsx 2895 */ processJsonSchemaPrefault = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def;
    processJsonSchemaNode(def.innerType, ctx, params);
    let entry = ctx.seen.get(schema);
    entry.ref = def.innerType, ctx.io === `input` && (jsonSchema._prefault = JSON.parse(JSON.stringify(def.defaultValue)));
  },
  /** jsx 2901 */ processJsonSchemaCatch = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def;
    processJsonSchemaNode(def.innerType, ctx, params);
    let entry = ctx.seen.get(schema);
    entry.ref = def.innerType;
    let catchValue;
    try {
      catchValue = def.catchValue(void 0);
    } catch {
      throw Error(`Dynamic catch values are not supported in JSON Schema`);
    }
    jsonSchema.default = catchValue;
  },
  /** jsx 2914 */ processJsonSchemaPipe = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def,
      targetSchema = ctx.io === `input` ? def.in._zod.def.type === `transform` ? def.out : def.in : def.out;
    processJsonSchemaNode(targetSchema, ctx, params);
    let entry = ctx.seen.get(schema);
    entry.ref = targetSchema;
  },
  /** jsx 2921 */ processJsonSchemaReadonly = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def;
    processJsonSchemaNode(def.innerType, ctx, params);
    let entry = ctx.seen.get(schema);
    entry.ref = def.innerType, jsonSchema.readOnly = !0;
  },
  /** jsx 2927 */ processJsonSchemaOptional = (schema: ZodInst, ctx: any, jsonSchema: any, params: any) => {
    let def = schema._zod.def;
    processJsonSchemaNode(def.innerType, ctx, params);
    let entry = ctx.seen.get(schema);
    entry.ref = def.innerType;
  };

/* ============================================================================
 * §8 zod classic —— 经典 API 封装层（jsx 2933–3402）
 *   混淆名→语义名（本段内新声明者）：
 *   Xi/Zi → ZodISODateTime/isoDateTime      Qi/$i → ZodISODate/isoDate
 *   ea/ta → ZodISOTime/isoTime              na/ra → ZodISODuration/isoDuration
 *   ia → ZodErrorInternals（classic）       S → ZodError（classic，Parent: Error）
 *   aa/oa/sa/ca/la/ua/da/fa/pa/ma/ha/ga → parseImpl/parseAsyncImpl/safeParseImpl/
 *     safeParseAsyncImpl/encodeImpl/decodeImpl/encodeAsyncImpl/decodeAsyncImpl/
 *     safeEncodeImpl/safeDecodeImpl/safeEncodeAsyncImpl/safeDecodeAsyncImpl
 *   C → ZodType（classic 基类）             _a/va → _ZodString/ZodString
 *   w → zString ★Es                         T → ZodStringFormat（classic）
 *   ya…La → ZodEmail/ZodGUID/ZodUUID/ZodURL/ZodEmoji/ZodNanoID/ZodCUID/ZodCUID2/
 *     ZodULID/ZodXID/ZodKSUID/ZodIPv4/ZodIPv6/ZodCIDRv4/ZodCIDRv6/ZodBase64/
 *     ZodBase64URL/ZodE164/ZodJWT
 *   Ra/E → ZodNumber/zNumber ★Cs            za/Ba → ZodNumberFormat/intCheck
 *   Va/D → ZodBoolean/zBoolean ★ys          Ha/Ua → ZodUndefined/zUndefined
 *   Wa/O → ZodUnknown/zUnknown ★Os          Ga/Ka → ZodNever/zNever ★Ss
 *   qa/Ja → ZodDate/zDate                   Ya/k → ZodArray/zArray ★vs
 *   Xa/A → ZodObject/zObject ★ws            Za/j → ZodUnion/zUnion ★Ds
 *   Qa/M → ZodDiscriminatedUnion/zDiscriminatedUnion ★bs
 *   $a/eo → ZodIntersection/zIntersection   to/N → ZodRecord/zRecord ★Ts
 *   no → looseRecord                        ro/P → ZodEnum/zEnum ★_s
 *   io/F → ZodLiteral/zLiteral ★xs          ao/oo → ZodTransform/zTransform
 *   so/co → ZodOptional/zOptional           lo/uo → ZodExactOptional/zExactOptional
 *   fo/po → ZodNullable/zNullable           mo/ho → ZodDefault/zDefault
 *   go/_o → ZodPrefault/zPrefault           vo/yo → ZodNonOptional/zNonOptional
 *   bo/xo → ZodCatch/zCatch                 So/Co → ZodPipe/zPipe
 *   wo/To → ZodReadonly/zReadonly           Eo → ZodCustom（classic）
 *   Do/Oo/ko → refine/superRefine/transformPipe
 * ==========================================================================*/

/** jsx 2933 —— classic ISO 日期时间（core 装配 + classic 字符串格式装配） */
const ZodISODateTime = $constructor(`ZodISODateTime`, (inst: ZodInst, def: ZodDef) => {
  $ZodISODateTime.init(inst, def), ZodStringFormat.init(inst, def);
});
/** jsx 2936 */
function isoDateTime(params?: any) {
  return $datetime(ZodISODateTime, params);
}
/** jsx 2939 */
const ZodISODate = $constructor(`ZodISODate`, (inst: ZodInst, def: ZodDef) => {
  $ZodISODate.init(inst, def), ZodStringFormat.init(inst, def);
});
/** jsx 2942 */
function isoDate(params?: any) {
  return $date(ZodISODate, params);
}
/** jsx 2945 */
const ZodISOTime = $constructor(`ZodISOTime`, (inst: ZodInst, def: ZodDef) => {
  $ZodISOTime.init(inst, def), ZodStringFormat.init(inst, def);
});
/** jsx 2948 */
function isoTime(params?: any) {
  return $time(ZodISOTime, params);
}
/** jsx 2951 */
const ZodISODuration = $constructor(`ZodISODuration`, (inst: ZodInst, def: ZodDef) => {
  $ZodISODuration.init(inst, def), ZodStringFormat.init(inst, def);
});
/** jsx 2954 */
function isoDuration(params?: any) {
  return $duration(ZodISODuration, params);
}
/** jsx 2957 —— classic ZodError 内部装配：format/flatten/addIssue/addIssues/isEmpty */
const ZodErrorInternals = (inst: any, issues: any[]) => {
  $ZodError.init(inst, issues), inst.name = `ZodError`, Object.defineProperties(inst, {
    format: {
      value: (map: any) => $flattenError(inst, map)
    },
    flatten: {
      value: (map: any) => $treeifyError(inst, map)
    },
    addIssue: {
      value: (issue: any) => {
        inst.issues.push(issue), inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
    },
    addIssues: {
      value: (issuesToAdd: any[]) => {
        inst.issues.push(...issuesToAdd), inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0;
      }
    }
  });
};
/** jsx 2982 —— 空跑装配（仅注册 traits，不产出导出） */
$constructor(`ZodError`, ZodErrorInternals);
/** jsx 2983 —— classic ZodError（继承 Error） */
const ZodError = $constructor(`ZodError`, ZodErrorInternals, {
    Parent: Error
  }),
  /** jsx 2986 */ parseImpl = makeParseFn(ZodError),
  /** jsx 2987 */ parseAsyncImpl = makeParseAsyncFn(ZodError),
  /** jsx 2988 */ safeParseImpl = makeSafeParseFn(ZodError),
  /** jsx 2989 */ safeParseAsyncImpl = makeSafeParseAsyncFn(ZodError),
  /** jsx 2990 */ encodeImpl = makeEncodeFn(ZodError),
  /** jsx 2991 */ decodeImpl = makeDecodeFn(ZodError),
  /** jsx 2992 */ encodeAsyncImpl = makeEncodeAsyncFn(ZodError),
  /** jsx 2993 */ decodeAsyncImpl = makeDecodeAsyncFn(ZodError),
  /** jsx 2994 */ safeEncodeImpl = makeSafeEncodeFn(ZodError),
  /** jsx 2995 */ safeDecodeImpl = makeSafeDecodeFn(ZodError),
  /** jsx 2996 */ safeEncodeAsyncImpl = makeSafeEncodeAsyncFn(ZodError),
  /** jsx 2997 */ safeDecodeAsyncImpl = makeSafeDecodeAsyncFn(ZodError);
/** jsx 2998 —— classic 基类：~standard.jsonSchema、toJSONSchema、_def 与全方法面 */
const ZodType = $constructor(`ZodType`, (inst: ZodInst, def: ZodDef) => ($ZodType.init(inst, def), Object.assign(inst[`~standard`], {
  jsonSchema: {
    input: makeIoJsonSchemaFn(inst, `input`),
    output: makeIoJsonSchemaFn(inst, `output`)
  }
}), inst.toJSONSchema = makeToJsonSchemaFn(inst, {}), inst.def = def, inst.type = def.type, Object.defineProperty(inst, `_def`, {
  value: def
}), inst.check = (...checks: any[]) => inst.clone($mergeDefs(def, {
  checks: [...(def.checks ?? []), ...checks.map(check => typeof check == `function` ? {
    _zod: {
      check: check,
      def: {
        check: `custom`
      },
      onattach: []
    }
  } : check)]
}), {
  parent: !0
}), inst.with = inst.check, inst.clone = (newDef: any, params: any) => clone(inst, newDef, params), inst.brand = () => inst, inst.register = (registry: any, value: any) => (registry.add(inst, value), inst), inst.parse = (input: any, ctx?: ParseContext) => parseImpl(inst, input, ctx, {
  callee: inst.parse
}), inst.safeParse = (input: any, ctx?: ParseContext) => safeParseImpl(inst, input, ctx), inst.parseAsync = async (input: any, ctx?: ParseContext) => parseAsyncImpl(inst, input, ctx, {
  callee: inst.parseAsync
}), inst.safeParseAsync = async (input: any, ctx?: ParseContext) => safeParseAsyncImpl(inst, input, ctx), inst.spa = inst.safeParseAsync, inst.encode = (input: any, ctx?: ParseContext) => encodeImpl(inst, input, ctx), inst.decode = (input: any, ctx?: ParseContext) => decodeImpl(inst, input, ctx), inst.encodeAsync = async (input: any, ctx?: ParseContext) => encodeAsyncImpl(inst, input, ctx), inst.decodeAsync = async (input: any, ctx?: ParseContext) => decodeAsyncImpl(inst, input, ctx), inst.safeEncode = (input: any, ctx?: ParseContext) => safeEncodeImpl(inst, input, ctx), inst.safeDecode = (input: any, ctx?: ParseContext) => safeDecodeImpl(inst, input, ctx), inst.safeEncodeAsync = async (input: any, ctx?: ParseContext) => safeEncodeAsyncImpl(inst, input, ctx), inst.safeDecodeAsync = async (input: any, ctx?: ParseContext) => safeDecodeAsyncImpl(inst, input, ctx), inst.refine = (check: any, params: any) => inst.check(refine(check, params)), inst.superRefine = (fn: any) => inst.check(superRefine(fn)), inst.overwrite = (fn: any) => inst.check($overwrite(fn)), inst.optional = () => zOptional(inst), inst.exactOptional = () => zExactOptional(inst), inst.nullable = () => zNullable(inst), inst.nullish = () => zOptional(zNullable(inst)), inst.nonoptional = (params: any) => zNonOptional(inst, params), inst.array = () => zArray(inst), inst.or = (other: ZodInst) => zUnion([inst, other]), inst.and = (other: ZodInst) => zIntersection(inst, other), inst.transform = (fn: any) => zPipe(inst, zTransform(fn)), inst.default = (value: any) => zDefault(inst, value), inst.prefault = (value: any) => zPrefault(inst, value), inst.catch = (value: any) => zCatch(inst, value), inst.pipe = (target: ZodInst) => zPipe(inst, target), inst.readonly = () => zReadonly(inst), inst.describe = (description: string) => {
  let cloned = inst.clone();
  return $globalRegistry.add(cloned, {
    description: description
  }), cloned;
}, Object.defineProperty(inst, `description`, {
  get() {
    return $globalRegistry.get(inst)?.description;
  },
  configurable: !0
}), inst.meta = (...meta: any[]) => {
  if (meta.length === 0) return $globalRegistry.get(inst);
  let cloned = inst.clone();
  return $globalRegistry.add(cloned, meta[0]), cloned;
}, inst.isOptional = () => inst.safeParse(void 0).success, inst.isNullable = () => inst.safeParse(null).success, inst.apply = (fn: any) => fn(inst), inst));
/** jsx 3036 —— classic 字符串内部层（JSON Schema 处理 + bag 派生属性 + 全部字符串方法） */
const _ZodString = $constructor(`_ZodString`, (inst: ZodInst, def: ZodDef) => {
  $ZodString.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaString(inst, ctx, jsonSchema, params);
  let bag = inst._zod.bag;
  inst.format = bag.format ?? null, inst.minLength = bag.minimum ?? null, inst.maxLength = bag.maximum ?? null, inst.regex = (...args: [any, any?]) => inst.check($regex(...args)), inst.includes = (...args: [any, any?]) => inst.check($includes(...args)), inst.startsWith = (...args: [any, any?]) => inst.check($startsWith(...args)), inst.endsWith = (...args: [any, any?]) => inst.check($endsWith(...args)), inst.min = (...args: [any, any?]) => inst.check($minLength(...args)), inst.max = (...args: [any, any?]) => inst.check($maxLength(...args)), inst.length = (...args: [any, any?]) => inst.check($length(...args)), inst.nonempty = (...args: [any?]) => inst.check($minLength(1, ...args)), inst.lowercase = (params: any) => inst.check($lowercase(params)), inst.uppercase = (params: any) => inst.check($uppercase(params)), inst.trim = () => inst.check($trim()), inst.normalize = (...args: [any]) => inst.check($normalize(...args)), inst.toLowerCase = () => inst.check($toLowerCase()), inst.toUpperCase = () => inst.check($toUpperCase()), inst.slugify = () => inst.check($slugify());
});
/** jsx 3041 —— classic 字符串（全部格式方法委托对应 classic 格式检查工厂） */
const ZodString = $constructor(`ZodString`, (inst: ZodInst, def: ZodDef) => {
  $ZodString.init(inst, def), _ZodString.init(inst, def), inst.email = (params: any) => inst.check($email(ZodEmail, params)), inst.url = (params: any) => inst.check($url(ZodURL, params)), inst.jwt = (params: any) => inst.check($jwt(ZodJWT, params)), inst.emoji = (params: any) => inst.check($emoji(ZodEmoji, params)), inst.guid = (params: any) => inst.check($guid(ZodGUID, params)), inst.uuid = (params: any) => inst.check($uuid(ZodUUID, params)), inst.uuidv4 = (params: any) => inst.check($uuidv4(ZodUUID, params)), inst.uuidv6 = (params: any) => inst.check($uuidv6(ZodUUID, params)), inst.uuidv7 = (params: any) => inst.check($uuidv7(ZodUUID, params)), inst.nanoid = (params: any) => inst.check($nanoid(ZodNanoID, params)), inst.guid = (params: any) => inst.check($guid(ZodGUID, params)), inst.cuid = (params: any) => inst.check($cuid(ZodCUID, params)), inst.cuid2 = (params: any) => inst.check($cuid2(ZodCUID2, params)), inst.ulid = (params: any) => inst.check($ulid(ZodULID, params)), inst.base64 = (params: any) => inst.check($base64(ZodBase64, params)), inst.base64url = (params: any) => inst.check($base64url(ZodBase64URL, params)), inst.xid = (params: any) => inst.check($xid(ZodXID, params)), inst.ksuid = (params: any) => inst.check($ksuid(ZodKSUID, params)), inst.ipv4 = (params: any) => inst.check($ipv4(ZodIPv4, params)), inst.ipv6 = (params: any) => inst.check($ipv6(ZodIPv6, params)), inst.cidrv4 = (params: any) => inst.check($cidrv4(ZodCIDRv4, params)), inst.cidrv6 = (params: any) => inst.check($cidrv6(ZodCIDRv6, params)), inst.e164 = (params: any) => inst.check($e164(ZodE164, params)), inst.datetime = (params: any) => inst.check(isoDateTime(params)), inst.date = (params: any) => inst.check(isoDate(params)), inst.time = (params: any) => inst.check(isoTime(params)), inst.duration = (params: any) => inst.check(isoDuration(params));
});
/** jsx 3044 ★Es —— z.string 工厂 */
export function zString(params?: any) {
  return $string(ZodString, params);
}
/** jsx 3047 —— classic 字符串格式基类 */
const ZodStringFormat = $constructor(`ZodStringFormat`, (inst: ZodInst, def: ZodDef) => {
    $ZodStringFormat.init(inst, def), _ZodString.init(inst, def);
  }),
  /** jsx 3050 */ ZodEmail = $constructor(`ZodEmail`, (inst: ZodInst, def: ZodDef) => {
    $ZodEmail.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3053 */ ZodGUID = $constructor(`ZodGUID`, (inst: ZodInst, def: ZodDef) => {
    $ZodGUID.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3056 */ ZodUUID = $constructor(`ZodUUID`, (inst: ZodInst, def: ZodDef) => {
    $ZodUUID.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3059 */ ZodURL = $constructor(`ZodURL`, (inst: ZodInst, def: ZodDef) => {
    $ZodURL.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3062 */ ZodEmoji = $constructor(`ZodEmoji`, (inst: ZodInst, def: ZodDef) => {
    $ZodEmoji.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3065 */ ZodNanoID = $constructor(`ZodNanoID`, (inst: ZodInst, def: ZodDef) => {
    $ZodNanoID.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3068 */ ZodCUID = $constructor(`ZodCUID`, (inst: ZodInst, def: ZodDef) => {
    $ZodCUID.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3071 */ ZodCUID2 = $constructor(`ZodCUID2`, (inst: ZodInst, def: ZodDef) => {
    $ZodCUID2.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3074 */ ZodULID = $constructor(`ZodULID`, (inst: ZodInst, def: ZodDef) => {
    $ZodULID.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3077 */ ZodXID = $constructor(`ZodXID`, (inst: ZodInst, def: ZodDef) => {
    $ZodXID.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3080 */ ZodKSUID = $constructor(`ZodKSUID`, (inst: ZodInst, def: ZodDef) => {
    $ZodKSUID.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3083 */ ZodIPv4 = $constructor(`ZodIPv4`, (inst: ZodInst, def: ZodDef) => {
    $ZodIPv4.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3086 */ ZodIPv6 = $constructor(`ZodIPv6`, (inst: ZodInst, def: ZodDef) => {
    $ZodIPv6.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3089 */ ZodCIDRv4 = $constructor(`ZodCIDRv4`, (inst: ZodInst, def: ZodDef) => {
    $ZodCIDRv4.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3092 */ ZodCIDRv6 = $constructor(`ZodCIDRv6`, (inst: ZodInst, def: ZodDef) => {
    $ZodCIDRv6.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3095 */ ZodBase64 = $constructor(`ZodBase64`, (inst: ZodInst, def: ZodDef) => {
    $ZodBase64.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3098 */ ZodBase64URL = $constructor(`ZodBase64URL`, (inst: ZodInst, def: ZodDef) => {
    $ZodBase64URL.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3101 */ ZodE164 = $constructor(`ZodE164`, (inst: ZodInst, def: ZodDef) => {
    $ZodE164.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3104 */ ZodJWT = $constructor(`ZodJWT`, (inst: ZodInst, def: ZodDef) => {
    $ZodJWT.init(inst, def), ZodStringFormat.init(inst, def);
  }),
  /** jsx 3107 —— classic 数字（JSON Schema + 比较/整数/倍数方法 + bag 派生属性） */
  ZodNumber = $constructor(`ZodNumber`, (inst: ZodInst, def: ZodDef) => {
    $ZodNumber.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaNumber(inst, ctx, jsonSchema, params), inst.gt = (value: number, params: any) => inst.check($gt(value, params)), inst.gte = (value: number, params: any) => inst.check($gte(value, params)), inst.min = (value: number, params: any) => inst.check($gte(value, params)), inst.lt = (value: number, params: any) => inst.check($lt(value, params)), inst.lte = (value: number, params: any) => inst.check($lte(value, params)), inst.max = (value: number, params: any) => inst.check($lte(value, params)), inst.int = (params: any) => inst.check(intCheck(params)), inst.safe = (params: any) => inst.check(intCheck(params)), inst.positive = (params: any) => inst.check($gt(0, params)), inst.nonnegative = (params: any) => inst.check($gte(0, params)), inst.negative = (params: any) => inst.check($lt(0, params)), inst.nonpositive = (params: any) => inst.check($lte(0, params)), inst.multipleOf = (value: number, params: any) => inst.check($multipleOf(value, params)), inst.step = (value: number, params: any) => inst.check($multipleOf(value, params)), inst.finite = () => inst;
    let bag = inst._zod.bag;
    inst.minValue = Math.max(bag.minimum ?? -1 / 0, bag.exclusiveMinimum ?? -1 / 0) ?? null, inst.maxValue = Math.min(bag.maximum ?? 1 / 0, bag.exclusiveMaximum ?? 1 / 0) ?? null, inst.isInt = (bag.format ?? ``).includes(`int`) || Number.isSafeInteger(bag.multipleOf ?? 0.5), inst.isFinite = !0, inst.format = bag.format ?? null;
  });
/** jsx 3112 ★Cs —— z.number 工厂 */
export function zNumber(params?: any) {
  return $number(ZodNumber, params);
}
/** jsx 3115 —— classic 数字格式（int 档） */
const ZodNumberFormat = $constructor(`ZodNumberFormat`, (inst: ZodInst, def: ZodDef) => {
  $ZodNumberFormat.init(inst, def), ZodNumber.init(inst, def);
});
/** jsx 3118 —— z.int 工厂 */
function intCheck(params?: any) {
  return $int(ZodNumberFormat, params);
}
/** jsx 3121 —— classic 布尔 */
const ZodBoolean = $constructor(`ZodBoolean`, (inst: ZodInst, def: ZodDef) => {
  $ZodBoolean.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaBoolean(inst, ctx, jsonSchema, params);
});
/** jsx 3124 ★ys —— z.boolean 工厂 */
export function zBoolean(params?: any) {
  return $boolean(ZodBoolean, params);
}
/** jsx 3127 —— classic undefined */
const ZodUndefined = $constructor(`ZodUndefined`, (inst: ZodInst, def: ZodDef) => {
  $ZodUndefined.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaUndefined(inst, ctx, jsonSchema, params);
});
/** jsx 3130 —— z.undefined 工厂 */
function zUndefined(params?: any) {
  return $undefined(ZodUndefined, params);
}
/** jsx 3133 —— classic unknown（JSON Schema 处理为空操作） */
const ZodUnknown = $constructor(`ZodUnknown`, (inst: ZodInst, def: ZodDef) => {
  $ZodUnknown.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => void 0;
});
/** jsx 3136 ★Os —— z.unknown 工厂 */
export function zUnknown() {
  return $unknown(ZodUnknown);
}
/** jsx 3139 —— classic never */
const ZodNever = $constructor(`ZodNever`, (inst: ZodInst, def: ZodDef) => {
  $ZodNever.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaNever(inst, ctx, jsonSchema, params);
});
/** jsx 3142 ★Ss —— z.never 工厂 */
export function zNever(params?: any) {
  return $never(ZodNever, params);
}
/** jsx 3145 —— classic 日期（min/max + bag 派生 minDate/maxDate） */
const ZodDate = $constructor(`ZodDate`, (inst: ZodInst, def: ZodDef) => {
  $ZodDate.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaDate(inst, ctx, jsonSchema, params), inst.min = (value: number, params: any) => inst.check($gte(value, params)), inst.max = (value: number, params: any) => inst.check($lte(value, params));
  let bag = inst._zod.bag;
  inst.minDate = bag.minimum ? new Date(bag.minimum) : null, inst.maxDate = bag.maximum ? new Date(bag.maximum) : null;
});
/** jsx 3150 —— z.date 工厂 */
function zDate(params?: any) {
  return $dateValue(ZodDate, params);
}
/** jsx 3153 —— classic 数组（element + min/nonempty/max/length/unwrap） */
const ZodArray = $constructor(`ZodArray`, (inst: ZodInst, def: ZodDef) => {
  $ZodArray.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaArray(inst, ctx, jsonSchema, params), inst.element = def.element, inst.min = (length: number, params: any) => inst.check($minLength(length, params)), inst.nonempty = (params: any) => inst.check($minLength(1, params)), inst.max = (length: number, params: any) => inst.check($maxLength(length, params)), inst.length = (length: number, params: any) => inst.check($length(length, params)), inst.unwrap = () => inst.element;
});
/** jsx 3156 ★vs —— z.array 工厂 */
export function zArray(element: ZodInst, params?: any) {
  return $array(ZodArray, element, params);
}
/** jsx 3159 —— classic 对象（shape 只读属性 + keyof/catchall/passthrough/loose/strict/strip/extend/safeExtend/merge/pick/omit/partial/required） */
const ZodObject = $constructor(`ZodObject`, (inst: ZodInst, def: ZodDef) => {
  $ZodObject.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaObject(inst, ctx, jsonSchema, params), defineWritableProperty(inst, `shape`, () => def.shape), inst.keyof = () => zEnum(Object.keys(inst._zod.def.shape)), inst.catchall = (type: ZodInst) => inst.clone({
    ...inst._zod.def,
    catchall: type
  }), inst.passthrough = () => inst.clone({
    ...inst._zod.def,
    catchall: zUnknown()
  }), inst.loose = () => inst.clone({
    ...inst._zod.def,
    catchall: zUnknown()
  }), inst.strict = () => inst.clone({
    ...inst._zod.def,
    catchall: zNever()
  }), inst.strip = () => inst.clone({
    ...inst._zod.def,
    catchall: void 0
  }), inst.extend = (shape: Record<string, any>) => $extend(inst, shape), inst.safeExtend = (shape: Record<string, any>) => $safeExtend(inst, shape), inst.merge = (other: ZodInst) => $merge(inst, other), inst.pick = (mask: Record<string, any>) => $pick(inst, mask), inst.omit = (mask: Record<string, any>) => $omit(inst, mask), inst.partial = (...args: any[]) => $partial(ZodOptional, inst, args[0]), inst.required = (...args: any[]) => $nonpartial(ZodNonOptional, inst, args[0]);
});
/** jsx 3177 ★ws —— z.object 工厂 */
export function zObject(shape?: Record<string, ZodInst>, params?: any) {
  return new ZodObject({
    type: `object`,
    shape: shape ?? {},
    ...normalizeCheckParams(params)
  });
}
/** jsx 3184 —— classic 并集 */
const ZodUnion = $constructor(`ZodUnion`, (inst: ZodInst, def: ZodDef) => {
  $ZodUnion.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaUnion(inst, ctx, jsonSchema, params), inst.options = def.options;
});
/** jsx 3187 ★Ds —— z.union 工厂 */
export function zUnion(options: ZodInst[], params?: any) {
  return new ZodUnion({
    type: `union`,
    options: options,
    ...normalizeCheckParams(params)
  });
}
/** jsx 3194 —— classic 判别并集（并集装配 + core 判别装配） */
const ZodDiscriminatedUnion = $constructor(`ZodDiscriminatedUnion`, (inst: ZodInst, def: ZodDef) => {
  ZodUnion.init(inst, def), $ZodDiscriminatedUnion.init(inst, def);
});
/** jsx 3197 ★bs —— z.discriminatedUnion 工厂 */
export function zDiscriminatedUnion(discriminator: string, options: ZodInst[], params?: any) {
  return new ZodDiscriminatedUnion({
    type: `union`,
    options: options,
    discriminator: discriminator,
    ...normalizeCheckParams(params)
  });
}
/** jsx 3205 —— classic 交集 */
const ZodIntersection = $constructor(`ZodIntersection`, (inst: ZodInst, def: ZodDef) => {
  $ZodIntersection.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaIntersection(inst, ctx, jsonSchema, params);
});
/** jsx 3208 —— z.intersection 工厂 */
function zIntersection(left: ZodInst, right: ZodInst) {
  return new ZodIntersection({
    type: `intersection`,
    left: left,
    right: right
  });
}
/** jsx 3215 —— classic 记录 */
const ZodRecord = $constructor(`ZodRecord`, (inst: ZodInst, def: ZodDef) => {
  $ZodRecord.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaRecord(inst, ctx, jsonSchema, params), inst.keyType = def.keyType, inst.valueType = def.valueType;
});
/** jsx 3218 ★Ts —— z.record 工厂 */
export function zRecord(keyType: ZodInst, valueType: ZodInst, params?: any) {
  return new ZodRecord({
    type: `record`,
    keyType: keyType,
    valueType: valueType,
    ...normalizeCheckParams(params)
  });
}
/** jsx 3226 —— 宽松 record（键 schema 克隆后清 values，允许任意键） */
function looseRecord(keyType: ZodInst, valueType: ZodInst, params?: any) {
  let keySchema = clone(keyType);
  return keySchema._zod.values = void 0, new ZodRecord({
    type: `record`,
    keyType: keySchema,
    valueType: valueType,
    ...normalizeCheckParams(params)
  });
}
/** jsx 3235 —— classic 枚举（entries/options + extract/exclude） */
const ZodEnum = $constructor(`ZodEnum`, (inst: ZodInst, def: ZodDef) => {
  $ZodEnum.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaEnum(inst, ctx, jsonSchema, params), inst.enum = def.entries, inst.options = Object.values(def.entries);
  let keys = new Set(Object.keys(def.entries));
  inst.extract = (toExtract: string[], params: any) => {
    let picked: any = {};
    for (let key of toExtract) if (keys.has(key)) picked[key] = def.entries[key];else throw Error(`Key ${key} not found in enum`);
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeCheckParams(params),
      entries: picked
    });
  }, inst.exclude = (toExclude: string[], params: any) => {
    let remaining: any = {
      ...def.entries
    };
    for (let key of toExclude) if (keys.has(key)) delete remaining[key];else throw Error(`Key ${key} not found in enum`);
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeCheckParams(params),
      entries: remaining
    });
  };
});
/** jsx 3260 ★_s —— z.enum 工厂（数组 → 自映射 entries） */
export function zEnum(entries: string[] | Record<string, any>, params?: any) {
  return new ZodEnum({
    type: `enum`,
    entries: Array.isArray(entries) ? Object.fromEntries(entries.map(entry => [entry, entry])) : entries,
    ...normalizeCheckParams(params)
  });
}
/** jsx 3267 —— classic 字面量（values 集合 + 单值 value 访问器） */
const ZodLiteral = $constructor(`ZodLiteral`, (inst: ZodInst, def: ZodDef) => {
  $ZodLiteral.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaLiteral(inst, ctx, jsonSchema, params), inst.values = new Set(def.values), Object.defineProperty(inst, `value`, {
    get() {
      if (def.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
      return def.values[0];
    }
  });
});
/** jsx 3275 ★xs —— z.literal 工厂 */
export function zLiteral(values: any, params?: any) {
  return new ZodLiteral({
    type: `literal`,
    values: Array.isArray(values) ? values : [values],
    ...normalizeCheckParams(params)
  });
}
/** jsx 3282 —— classic transform（backward 方向抛 $ZodEncodeError；addIssue 上下文注入） */
const ZodTransform = $constructor(`ZodTransform`, (inst: ZodInst, def: ZodDef) => {
  $ZodTransform.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaTransform(inst, ctx, jsonSchema, params), inst._zod.parse = (payload: ParsePayload, ctx: ParseContext) => {
    if (ctx.direction === `backward`) throw new $ZodEncodeError(inst.constructor.name);
    payload.addIssue = (issue: any) => {
      if (typeof issue == `string`) payload.issues.push($issue(issue, payload.value, def));else {
        let normalized = issue;
        normalized.fatal && (normalized.continue = !1), normalized.code ??= `custom`, normalized.input ??= payload.value, normalized.inst ??= inst, payload.issues.push($issue(normalized));
      }
    };
    let result = def.transform(payload.value, payload);
    return result instanceof Promise ? result.then(value => (payload.value = value, payload)) : (payload.value = result, payload);
  };
});
/** jsx 3295 —— z.transform 工厂 */
function zTransform(transform: (value: any, ctx: any) => any) {
  return new ZodTransform({
    type: `transform`,
    transform: transform
  });
}
/** jsx 3301 —— classic optional */
const ZodOptional = $constructor(`ZodOptional`, (inst: ZodInst, def: ZodDef) => {
  $ZodOptional.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaOptional(inst, ctx, jsonSchema, params), inst.unwrap = () => inst._zod.def.innerType;
});
/** jsx 3304 —— z.optional 工厂 */
function zOptional(innerType: ZodInst) {
  return new ZodOptional({
    type: `optional`,
    innerType: innerType
  });
}
/** jsx 3310 —— classic exact optional */
const ZodExactOptional = $constructor(`ZodExactOptional`, (inst: ZodInst, def: ZodDef) => {
  $ZodExactOptional.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaOptional(inst, ctx, jsonSchema, params), inst.unwrap = () => inst._zod.def.innerType;
});
/** jsx 3313 —— z.exactOptional 工厂 */
function zExactOptional(innerType: ZodInst) {
  return new ZodExactOptional({
    type: `optional`,
    innerType: innerType
  });
}
/** jsx 3319 —— classic nullable */
const ZodNullable = $constructor(`ZodNullable`, (inst: ZodInst, def: ZodDef) => {
  $ZodNullable.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaNullable(inst, ctx, jsonSchema, params), inst.unwrap = () => inst._zod.def.innerType;
});
/** jsx 3322 —— z.nullable 工厂 */
function zNullable(innerType: ZodInst) {
  return new ZodNullable({
    type: `nullable`,
    innerType: innerType
  });
}
/** jsx 3328 —— classic default（defaultValue 惰性求值 + removeDefault） */
const ZodDefault = $constructor(`ZodDefault`, (inst: ZodInst, def: ZodDef) => {
  $ZodDefault.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaDefault(inst, ctx, jsonSchema, params), inst.unwrap = () => inst._zod.def.innerType, inst.removeDefault = inst.unwrap;
});
/** jsx 3331 —— z.default 工厂（函数缺省值惰性调用，非函数浅克隆） */
function zDefault(innerType: ZodInst, defaultValue: any) {
  return new ZodDefault({
    type: `default`,
    innerType: innerType,
    get defaultValue() {
      return typeof defaultValue == `function` ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
/** jsx 3340 —— classic prefault */
const ZodPrefault = $constructor(`ZodPrefault`, (inst: ZodInst, def: ZodDef) => {
  $ZodPrefault.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaPrefault(inst, ctx, jsonSchema, params), inst.unwrap = () => inst._zod.def.innerType;
});
/** jsx 3343 —— z.prefault 工厂 */
function zPrefault(innerType: ZodInst, defaultValue: any) {
  return new ZodPrefault({
    type: `prefault`,
    innerType: innerType,
    get defaultValue() {
      return typeof defaultValue == `function` ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
/** jsx 3352 —— classic nonoptional */
const ZodNonOptional = $constructor(`ZodNonOptional`, (inst: ZodInst, def: ZodDef) => {
  $ZodNonOptional.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaNonOptional(inst, ctx, jsonSchema, params), inst.unwrap = () => inst._zod.def.innerType;
});
/** jsx 3355 —— z.nonoptional 工厂 */
function zNonOptional(innerType: ZodInst, params?: any) {
  return new ZodNonOptional({
    type: `nonoptional`,
    innerType: innerType,
    ...normalizeCheckParams(params)
  });
}
/** jsx 3362 —— classic catch（removeCatch） */
const ZodCatch = $constructor(`ZodCatch`, (inst: ZodInst, def: ZodDef) => {
  $ZodCatch.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaCatch(inst, ctx, jsonSchema, params), inst.unwrap = () => inst._zod.def.innerType, inst.removeCatch = inst.unwrap;
});
/** jsx 3365 —— z.catch 工厂（函数/值两形 catchValue） */
function zCatch(innerType: ZodInst, catchValue: any) {
  return new ZodCatch({
    type: `catch`,
    innerType: innerType,
    catchValue: typeof catchValue == `function` ? catchValue : () => catchValue
  });
}
/** jsx 3372 —— classic pipe（in/out 暴露） */
const ZodPipe = $constructor(`ZodPipe`, (inst: ZodInst, def: ZodDef) => {
  $ZodPipe.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaPipe(inst, ctx, jsonSchema, params), inst.in = def.in, inst.out = def.out;
});
/** jsx 3375 —— z.pipe 工厂 */
function zPipe(inSchema: ZodInst, outSchema: ZodInst) {
  return new ZodPipe({
    type: `pipe`,
    in: inSchema,
    out: outSchema
  });
}
/** jsx 3382 —— classic readonly */
const ZodReadonly = $constructor(`ZodReadonly`, (inst: ZodInst, def: ZodDef) => {
  $ZodReadonly.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaReadonly(inst, ctx, jsonSchema, params), inst.unwrap = () => inst._zod.def.innerType;
});
/** jsx 3385 —— z.readonly 工厂 */
function zReadonly(innerType: ZodInst) {
  return new ZodReadonly({
    type: `readonly`,
    innerType: innerType
  });
}
/** jsx 3391 —— classic custom */
const ZodCustom = $constructor(`ZodCustom`, (inst: ZodInst, def: ZodDef) => {
  $ZodCustom.init(inst, def), ZodType.init(inst, def), inst._zod.processJSONSchema = (ctx: any, jsonSchema: any, params: any) => processJsonSchemaCustom(inst, ctx, jsonSchema, params);
});
/** jsx 3394 —— refine（custom schema 工厂） */
function refine(fn: (value: any) => any, params: any = {}) {
  return $custom(ZodCustom, fn, params);
}
/** jsx 3397 —— superRefine */
function superRefine(fn: (value: any, ctx: any) => void) {
  return $superRefine(fn);
}
/** jsx 3400 —— transform 后接管道 */
function transformPipe(fn: (value: any, ctx: any) => any, outSchema: ZodInst) {
  return zPipe(zTransform(fn), outSchema);
}

/* ============================================================================
 * §9 first-party —— 问题码常量 + browser-use 协议 schema（jsx 3403–3858）
 * ==========================================================================*/

/** jsx 3403 ★gs —— zod 问题码常量表 */
export const ISSUE_CODES = {
    invalid_type: `invalid_type`,
    too_big: `too_big`,
    too_small: `too_small`,
    invalid_format: `invalid_format`,
    not_multiple_of: `not_multiple_of`,
    unrecognized_keys: `unrecognized_keys`,
    invalid_union: `invalid_union`,
    invalid_key: `invalid_key`,
    invalid_element: `invalid_element`,
    invalid_value: `invalid_value`,
    custom: `custom`
  };
/** jsx 3416 —— 空命名空间残留（TS namespace 枚举遗留的空装配） */
let emptyNamespaceResidue: any;
(function (_ns: any) {})(emptyNamespaceResidue ||= {});
/** jsx 3418 ★hs —— 浏览器视口限界（320–3840 × 320–2160） */
export const BROWSER_VIEWPORT_LIMITS = {
    minWidth: 320,
    maxWidth: 3840,
    minHeight: 320,
    maxHeight: 2160
  },
  /** jsx 3424 —— 视口尺寸（严格正整数） */
  browserViewportSchema = zObject({
    width: zNumber().int().positive(),
    height: zNumber().int().positive()
  }).strict(),
  /** jsx 3428 —— 视口限界内尺寸 */
  browserViewportBoundsSchema = browserViewportSchema.extend({
    width: zNumber().int().min(BROWSER_VIEWPORT_LIMITS.minWidth).max(BROWSER_VIEWPORT_LIMITS.maxWidth),
    height: zNumber().int().min(BROWSER_VIEWPORT_LIMITS.minHeight).max(BROWSER_VIEWPORT_LIMITS.maxHeight)
  });
/** jsx 3432 —— 浏览器命令全集枚举（匿名装配，结果丢弃） */
zEnum(`navigate.back.forward.reload.snapshot.click.fill.type.press.cuaKeypress.scroll.cuaScroll.domCuaScroll.hover.select.check.drag.cuaDrag.screenshot.getState.elementInfo.evaluate.getDialog.handleDialog.waitFor.playwright.playwrightWaitForTimeout.capabilities.browserVisibilityGet.browserVisibilitySet.browserViewportSet.browserViewportReset.activateTab.newTab.finalize.finalizeTabs.listUserTabs.claimTab.markDeliverable.markHandoff.nameSession.turnEnded.closeSession.cancelRequest.close.list`.split(`.`));
/** jsx 3433 —— 客户端模式（桌面连续 | web 远程可回放） */
const clientModeEnum = zEnum([`desktop-continuous`, `web-remote-replayable`]);
/** jsx 3434 —— 浏览器请求上下文（匿名装配，结果丢弃） */
zObject({
  workspaceKey: zString().min(1),
  sessionId: zString().min(1),
  tabId: zString().min(1).optional(),
  requestId: zString().min(1),
  clientMode: clientModeEnum
}).strict();
/** jsx 3441 —— 浏览器错误码（9 值） */
const browserErrorCodeEnum = zEnum([`backend_unavailable`, `capability_unsupported`, `duplicate_request_id`, `ref_not_found`, `navigation_blocked`, `timeout`, `renderer_unreachable`, `cancelled`, `execution_error`]),
  /** jsx 3442 —— 页面状态快照 */
  browserPageStateSchema = zObject({
    url: zString(),
    title: zString(),
    canGoBack: zBoolean(),
    canGoForward: zBoolean(),
    scrollX: zNumber().optional(),
    scrollY: zNumber().optional(),
    viewportWidth: zNumber().optional(),
    viewportHeight: zNumber().optional()
  }).strict(),
  /** jsx 3452 */ mouseButtonEnum = zEnum([`left`, `right`, `middle`]),
  /** jsx 3453 */ keyboardModifierEnum = zEnum([`Alt`, `Control`, `ControlOrMeta`, `Meta`, `Shift`]),
  /** jsx 3454 */ pointSchema = zObject({
    x: zNumber(),
    y: zNumber()
  }).strict(),
  /** jsx 3458 —— playwright locator 操作集 */
  locatorOperationEnum = zEnum([`allTextContents`, `click`, `count`, `dblclick`, `downloadMedia`, `evaluate`, `fill`, `getAttribute`, `innerText`, `isEnabled`, `isVisible`, `press`, `selectOption`, `setChecked`, `textContent`, `waitFor`]),
  /** jsx 3459 */ locatorModifierEnum = zEnum([`Alt`, `Control`, `ControlOrMeta`, `Meta`, `Shift`]),
  /** jsx 3460 */ timeoutMsSchema = zNumber().int().positive().optional(),
  /** jsx 3461 —— select 选项（value/label/index 至少其一） */
  selectOptionSchema = zObject({
    value: zString().optional(),
    label: zString().optional(),
    index: zNumber().int().nonnegative().optional()
  }).strict().refine((option: any) => option.value !== void 0 || option.label !== void 0 || option.index !== void 0, `Select option requires value, label, or index`),
  /** jsx 3466 —— playwright 动作（domSnapshot…locator 10 分支判别并集） */
  playwrightActionSchema = zDiscriminatedUnion(`name`, [zObject({
    name: zLiteral(`domSnapshot`)
  }).strict(), zObject({
    name: zLiteral(`elementInfo`),
    x: zNumber(),
    y: zNumber(),
    includeNonInteractable: zBoolean().optional()
  }).strict(), zObject({
    name: zLiteral(`elementScreenshot`),
    x: zNumber(),
    y: zNumber(),
    includeNonInteractable: zBoolean().optional()
  }).strict(), zObject({
    name: zLiteral(`evaluate`),
    expression: zString().min(1),
    expressionKind: zEnum([`string`, `function`]),
    arg: zUnknown().optional(),
    timeoutMs: timeoutMsSchema
  }).strict(), zObject({
    name: zLiteral(`waitForLoadState`),
    state: zEnum([`load`, `domcontentloaded`, `networkidle`]).optional(),
    timeoutMs: timeoutMsSchema
  }).strict(), zObject({
    name: zLiteral(`waitForURL`),
    url: zString().min(1),
    waitUntil: zEnum([`load`, `domcontentloaded`, `networkidle`, `commit`]).optional(),
    timeoutMs: timeoutMsSchema
  }).strict(), zObject({
    name: zLiteral(`waitForEvent`),
    event: zEnum([`download`, `filechooser`]),
    timeoutMs: timeoutMsSchema
  }).strict(), zObject({
    name: zLiteral(`downloadPath`),
    downloadId: zString().min(1),
    timeoutMs: timeoutMsSchema
  }).strict(), zObject({
    name: zLiteral(`fileChooserSetFiles`),
    fileChooserId: zString().min(1),
    files: zArray(zString()).min(1),
    timeoutMs: timeoutMsSchema
  }).strict(), zObject({
    name: zLiteral(`locator`),
    selector: zString().min(1),
    operation: locatorOperationEnum,
    value: zUnknown().optional(),
    arg: zUnknown().optional(),
    expression: zString().min(1).optional(),
    expressionKind: zEnum([`string`, `function`]).optional(),
    attribute: zString().min(1).optional(),
    checked: zBoolean().optional(),
    replace: zBoolean().optional(),
    force: zBoolean().optional(),
    button: mouseButtonEnum.optional(),
    modifiers: zArray(locatorModifierEnum).optional(),
    state: zEnum([`attached`, `detached`, `visible`, `hidden`]).optional(),
    selections: zArray(selectOptionSchema).min(1).optional(),
    timeoutMs: timeoutMsSchema
  }).strict()]),
  /** jsx 3524 —— 浏览器请求（navigate…list 45 分支判别并集） */
  browserRequestSchema = zDiscriminatedUnion(`method`, [zObject({
    method: zLiteral(`navigate`),
    url: zString().min(1),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`back`),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`forward`),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`reload`),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`snapshot`),
    maxElements: zNumber().int().positive().optional(),
    includeHidden: zBoolean().optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`click`),
    ref: zString().min(1).optional(),
    x: zNumber().optional(),
    y: zNumber().optional(),
    button: mouseButtonEnum.optional(),
    doubleClick: zBoolean().optional(),
    modifiers: zArray(keyboardModifierEnum).optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`fill`),
    ref: zString().min(1),
    value: zString(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`type`),
    ref: zString().min(1).optional(),
    text: zString(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`press`),
    key: zString().min(1),
    ref: zString().min(1).optional(),
    modifiers: zArray(keyboardModifierEnum).optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`cuaKeypress`),
    keys: zArray(zString().min(1)).min(1),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`scroll`),
    ref: zString().min(1).optional(),
    x: zNumber().optional(),
    y: zNumber().optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`cuaScroll`),
    x: zNumber(),
    y: zNumber(),
    scrollX: zNumber(),
    scrollY: zNumber(),
    modifiers: zArray(keyboardModifierEnum).optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`domCuaScroll`),
    nodeId: zString().min(1).optional(),
    scrollX: zNumber(),
    scrollY: zNumber(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`screenshot`),
    ref: zString().min(1).optional(),
    fullPage: zBoolean().optional(),
    clip: zObject({
      x: zNumber(),
      y: zNumber(),
      width: zNumber().positive(),
      height: zNumber().positive()
    }).strict().optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`getState`),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`hover`),
    ref: zString().min(1).optional(),
    x: zNumber().optional(),
    y: zNumber().optional(),
    modifiers: zArray(keyboardModifierEnum).optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`select`),
    ref: zString().min(1),
    values: zArray(zString()).min(1),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`check`),
    ref: zString().min(1),
    checked: zBoolean().optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`drag`),
    fromRef: zString().min(1).optional(),
    toRef: zString().min(1).optional(),
    from: pointSchema.optional(),
    to: pointSchema.optional(),
    modifiers: zArray(keyboardModifierEnum).optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`cuaDrag`),
    path: zArray(pointSchema).min(1),
    modifiers: zArray(keyboardModifierEnum).optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`elementInfo`),
    x: zNumber(),
    y: zNumber(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`evaluate`),
    expression: zString().min(1),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`getDialog`),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`handleDialog`),
    accept: zBoolean(),
    promptText: zString().optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`waitFor`),
    selector: zString().min(1).optional(),
    text: zString().min(1).optional(),
    textGone: zString().min(1).optional(),
    timeoutMs: zNumber().int().positive().optional(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`playwrightWaitForTimeout`),
    timeoutMs: zNumber().int().nonnegative(),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`playwright`),
    action: playwrightActionSchema,
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`capabilities`),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`browserVisibilityGet`)
  }).strict(), zObject({
    method: zLiteral(`browserVisibilitySet`),
    visible: zBoolean()
  }).strict(), browserViewportBoundsSchema.extend({
    method: zLiteral(`browserViewportSet`),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`browserViewportReset`),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`activateTab`),
    tabId: zString().min(1)
  }).strict(), zObject({
    method: zLiteral(`newTab`)
  }).strict(), zObject({
    method: zLiteral(`listUserTabs`)
  }).strict(), zObject({
    method: zLiteral(`claimTab`),
    tabId: zString().min(1)
  }).strict(), zObject({
    method: zLiteral(`finalizeTabs`),
    keep: zArray(zObject({
      tabId: zString().min(1),
      status: zEnum([`handoff`, `deliverable`])
    }).strict())
  }).strict(), zObject({
    method: zLiteral(`markDeliverable`),
    tabId: zString().min(1)
  }).strict(), zObject({
    method: zLiteral(`markHandoff`),
    tabId: zString().min(1)
  }).strict(), zObject({
    method: zLiteral(`nameSession`),
    name: zString().trim().min(1)
  }).strict(), zObject({
    method: zLiteral(`finalize`),
    tabId: zString().optional(),
    deliverable: zBoolean().optional()
  }).strict(), zObject({
    method: zLiteral(`turnEnded`),
    turnId: zString().min(1).optional()
  }).strict(), zObject({
    method: zLiteral(`closeSession`)
  }).strict(), zObject({
    method: zLiteral(`cancelRequest`),
    requestId: zString().min(1)
  }).strict(), zObject({
    method: zLiteral(`close`),
    tabId: zString().optional()
  }).strict(), zObject({
    method: zLiteral(`list`)
  }).strict()]),
  /** jsx 3724 —— 浏览器后端类型（iab | extension | cdp） */
  browserBackendTypeEnum = zEnum([`iab`, `extension`, `cdp`]),
  /** jsx 3725 —— 能力引用 */
  browserCapabilityRefSchema = zObject({
    id: zString().trim().min(1),
    description: zString().trim().min(1)
  }).strict(),
  /** jsx 3729 —— 浏览器描述符（能力 + api 支持覆写 + 元数据） */
  browserDescriptorSchema = zObject({
    id: zString().trim().min(1),
    generation: zNumber().int().nonnegative().default(0),
    type: browserBackendTypeEnum,
    name: zString().trim().min(1),
    capabilities: zObject({
      browser: zArray(browserCapabilityRefSchema).optional(),
      tab: zArray(browserCapabilityRefSchema).optional()
    }).strict(),
    apiSupportOverrides: zRecord(zString(), zBoolean()).optional(),
    metadata: zRecord(zString(), zString()).optional()
  }).strict(),
  /** jsx 3741 —— 会话上下文（live | cached） */
  sessionContextEnum = zEnum([`live`, `cached`]);
/** jsx 3742 —— 浏览器会话绑定 + 浏览器列表（匿名装配，结果丢弃） */
zObject({
  requestId: zString().trim().min(1),
  workspaceKey: zString().trim().min(1),
  workspacePath: zString().trim().min(1),
  workspaceIdentity: zString().trim().min(1).optional(),
  remoteSessionId: zString().trim().min(1).optional(),
  sessionId: zString().trim().min(1),
  turnId: zString().trim().min(1).optional(),
  clientMode: clientModeEnum,
  sessionContext: sessionContextEnum
}).strict().extend({
  browserId: zString().trim().min(1),
  browserGeneration: zNumber().int().nonnegative()
}).strict(), zObject({
  browsers: zArray(browserDescriptorSchema)
}).strict();
/** jsx 3758 —— 矩形区域 */
const rectSchema = zObject({
    x: zNumber(),
    y: zNumber(),
    width: zNumber(),
    height: zNumber()
  }).strict(),
  /** jsx 3764 —— DOM 元素（可交互） */
  domElementSchema = zObject({
    ref: zString().min(1),
    tag: zString(),
    role: zString().optional(),
    name: zString().optional(),
    text: zString().optional(),
    value: zString().optional(),
    disabled: zBoolean().optional(),
    checked: zBoolean().optional(),
    selector: zString(),
    xpath: zString(),
    rect: rectSchema,
    inViewport: zBoolean(),
    parentRef: zString().optional(),
    framePath: zString().optional(),
    attributes: zRecord(zString(), zString()).optional()
  }).strict(),
  /** jsx 3781 —— DOM 节点（快照树） */
  domNodeSchema = zObject({
    tag: zString(),
    depth: zNumber().int().nonnegative(),
    inViewport: zBoolean(),
    ref: zString().min(1).optional(),
    role: zString().optional(),
    name: zString().optional(),
    text: zString().optional(),
    attributes: zRecord(zString(), zString()).optional()
  }).strict(),
  /** jsx 3791 —— DOM 快照 */
  domSnapshotSchema = zObject({
    url: zString(),
    title: zString(),
    dom: zArray(domNodeSchema).optional(),
    domTruncated: zBoolean().optional(),
    elements: zArray(domElementSchema),
    truncated: zBoolean()
  }).strict(),
  /** jsx 3799 —— 浏览器标签页 */
  browserTabSchema = zObject({
    tabId: zString(),
    url: zString(),
    title: zString(),
    viewport: browserViewportSchema,
    active: zBoolean().optional(),
    lifecycle: zEnum([`active`, `deliverable`, `handoff`]).optional()
  }).strict(),
  /** jsx 3807 —— 用户标签页 */
  userTabSchema = zObject({
    id: zString().min(1),
    lastOpened: zString().optional(),
    tabGroup: zString().optional(),
    title: zString().optional(),
    url: zString().optional()
  }).strict(),
  /** jsx 3814 —— 浏览器对话框 */
  browserDialogSchema = zObject({
    type: zEnum([`alert`, `confirm`, `prompt`, `beforeunload`]),
    message: zString(),
    defaultPrompt: zString().optional()
  }).strict(),
  /** jsx 3819 —— 浏览器元信息 */
  browserMetaSchema = zObject({
    browserUse: zLiteral(!0),
    backendType: browserBackendTypeEnum,
    browserId: zString().min(1),
    browserGeneration: zNumber().int().nonnegative(),
    openTabIds: zArray(zString()),
    tabId: zString().optional(),
    currentUrl: zString().optional(),
    lifecycle: zEnum([`active`, `deliverable`, `handoff`, `closed`]).optional()
  }).strict(),
  /** jsx 3829 —— 浏览器操作结果 */
  browserResultSchema = zObject({
    ok: zBoolean(),
    state: browserPageStateSchema.optional(),
    snapshot: domSnapshotSchema.optional(),
    image: zObject({
      base64: zString(),
      mimeType: zLiteral(`image/png`)
    }).strict().optional(),
    tabs: zArray(browserTabSchema).optional(),
    userTabs: zArray(userTabSchema).optional(),
    tab: browserTabSchema.optional(),
    value: zUnknown().optional(),
    element: domElementSchema.optional(),
    dialog: browserDialogSchema.nullable().optional(),
    error: zObject({
      code: browserErrorCodeEnum,
      message: zString(),
      sideEffect: zEnum([`none`, `uncertain`]).optional()
    }).strict().optional(),
    meta: browserMetaSchema.optional(),
    elapsedMs: zNumber().nonnegative()
  }).strict(),
  /** jsx 3851 —— 资产安装模式 */
  ASSET_INSTALL_MODES = [`local-download-upload`, `remote-download`],
  /** jsx 3852 ★ms */ DEFAULT_ASSET_INSTALL_MODE = `local-download-upload`,
  /** jsx 3853 —— 文件传输能力（全集声明） */
  FILE_TRANSFER_CAPABILITIES = [`server-bundle`, `node-runtime`, `node-pty`, `glm`, `bfs`, `ripgrep`, `ugrep`],
  /** jsx 3854 —— 文件传输能力（可用全集） */
  ALL_FILE_TRANSFER_CAPABILITIES = [`server-bundle`, `node-runtime`, `node-pty`, `glm`, `bfs`, `ripgrep`, `ugrep`],
  /** jsx 3855 —— 远程文件传输能力 */
  REMOTE_FILE_TRANSFER_CAPABILITIES = [`server-bundle`, `node-runtime`];
/** jsx 3856 —— 差集计算（匿名表达式，结果丢弃） */
ALL_FILE_TRANSFER_CAPABILITIES.filter(capability => !REMOTE_FILE_TRANSFER_CAPABILITIES.includes(capability));
/** jsx 3857 —— 文件传输能力集合 */
const fileTransferCapabilitySet = new Set(FILE_TRANSFER_CAPABILITIES);
/** jsx 3858 —— 附加集合装配（匿名表达式，结果丢弃） */
new Set(ALL_FILE_TRANSFER_CAPABILITIES), new Set(REMOTE_FILE_TRANSFER_CAPABILITIES);
/** jsx 3859 ★ps —— 列出全部文件传输能力 */
export function listFileTransferCapabilities(_scope?: any) {
  return [...ALL_FILE_TRANSFER_CAPABILITIES];
}
/** jsx 3862 —— 文件传输能力判定 */
function isFileTransferCapability(capability: string) {
  return fileTransferCapabilitySet.has(capability);
}

/* ============================================================================
 * §10 first-party —— agent CLI 与用量统计 schema（jsx 3865–3949）
 * ==========================================================================*/

/** jsx 3865 —— agent CLI 供应商枚举 */
const agentCliProviderEnum = zEnum([`claude`, `opencode`, `gemini`, `codex`, `glm`]),
  /** jsx 3866 ★fs —— 用量报表区间 */
  USAGE_REPORT_RANGES = [`7d`, `30d`],
  /** jsx 3867 —— 收藏模型用量 */
  favoriteModelSchema = zObject({
    modelId: zString().nullable(),
    totalTokens: zNumber(),
    share: zNumber()
  }),
  /** jsx 3872 —— 用量汇总 */
  usageSummarySchema = zObject({
    totalTokens: zNumber(),
    inputTokens: zNumber(),
    outputTokens: zNumber(),
    reasoningTokens: zNumber(),
    cacheCreationTokens: zNumber(),
    cacheReadTokens: zNumber(),
    cacheHitRate: zNumber(),
    totalSessions: zNumber(),
    totalTurns: zNumber(),
    toolCallCount: zNumber(),
    toolErrorRate: zNumber(),
    modelErrorRate: zNumber(),
    avgTimeToFirstTokenMs: zNumber().nullable(),
    avgTurnDurationMs: zNumber().nullable(),
    activeDays: zNumber(),
    currentStreakDays: zNumber(),
    favoriteModel: favoriteModelSchema.nullable()
  }),
  /** jsx 3891 —— 热图日档（0–4 级） */
  usageHeatmapDaySchema = zObject({
    date: zString(),
    level: zUnion([zLiteral(0), zLiteral(1), zLiteral(2), zLiteral(3), zLiteral(4)]),
    totalTokens: zNumber(),
    turnCount: zNumber(),
    toolCallCount: zNumber()
  }),
  /** jsx 3898 —— 热图周档 */
  usageHeatmapWeekSchema = zObject({
    weekIndex: zNumber(),
    days: zArray(usageHeatmapDaySchema.nullable())
  }),
  /** jsx 3902 —— 用量热图 */
  usageHeatmapSchema = zObject({
    startDate: zString().nullable(),
    endDate: zString().nullable(),
    maxTokens: zNumber(),
    weeks: zArray(usageHeatmapWeekSchema)
  }),
  /** jsx 3908 —— 日模型用量条目 */
  usageDailyModelSchema = zObject({
    modelId: zString().nullable(),
    totalTokens: zNumber()
  }),
  /** jsx 3912 —— 日模型用量 */
  usageDailyModelUsageSchema = zObject({
    date: zString(),
    models: zArray(usageDailyModelSchema)
  }),
  /** jsx 3916 —— 模型用量明细 */
  usageModelDetailSchema = zObject({
    modelId: zString().nullable(),
    totalTokens: zNumber(),
    inputTokens: zNumber(),
    outputTokens: zNumber(),
    requestCount: zNumber(),
    share: zNumber()
  }),
  /** jsx 3924 —— 工具用量统计 */
  usageToolStatsSchema = zObject({
    toolName: zString(),
    callCount: zNumber(),
    errorCount: zNumber(),
    errorRate: zNumber(),
    avgDurationMs: zNumber().nullable()
  });
/** jsx 3931 —— 用量报表（匿名装配，结果丢弃） */
zObject({
  range: zEnum(USAGE_REPORT_RANGES),
  generatedAt: zNumber(),
  timeZone: zString(),
  source: zLiteral(`agent-db`),
  summary: usageSummarySchema,
  heatmap: usageHeatmapSchema,
  dailyModelUsage: zArray(usageDailyModelUsageSchema),
  models: zArray(usageModelDetailSchema),
  tools: zArray(usageToolStatsSchema)
});
/** jsx 3942 ★ls —— 缺省 agent 名 */
export const DEFAULT_AGENT_NAME = `zcodeAgent`,
  /** jsx 3943 —— 内置 agent CLI 供应商 */
  BUILTIN_AGENT_CLI_PROVIDERS = [`glm`];
/** jsx 3944 ★ds —— 缺省 agent CLI 供应商（恒 'glm'） */
export function resolveDefaultAgentCliProvider(_provider?: any) {
  return `glm`;
}
/** jsx 3947 ★us —— GLM agent CLI 供应商判定 */
export function isGlmAgentCliProvider(provider: string) {
  return provider === `glm`;
}

/* ============================================================================
 * §11 first-party —— 会话/消息协议 schema（jsx 3950–4290）
 * ==========================================================================*/

/** jsx 3950 —— 非空字符串（trim 后 ≥1） */
const nonEmptyString = zString().trim().min(1),
  /** jsx 3951 —— 未知记录 */
  unknownRecord = zRecord(zString(), zUnknown()),
  /** jsx 3952 —— 毫秒时间戳 */
  timestampMs = zNumber().int().nonnegative(),
  /** jsx 3953 —— 客户端模式（会话协议口径） */
  clientModeEnum2 = zEnum([`desktop-continuous`, `web-remote-replayable`]),
  /** jsx 3954 —— 消息可见性 */
  messageVisibilityEnum = zEnum([`user-visible`, `model-only`]),
  /** jsx 3955 —— 合成消息来源 */
  syntheticSourceEnum = zEnum([`background_task`, `fork`, `goal_state_change`, `goal-continuation`, `plugin_reference`, `rewind`, `selection_side_chat`, `subagent`, `subagent_message`, `todo_reminder`]),
  /** jsx 3956 —— 工作区引用 */
  workspaceRefSchema = zObject({
    workspacePath: nonEmptyString,
    workspaceIdentity: nonEmptyString.optional(),
    remoteSessionId: nonEmptyString.optional(),
    workspaceKey: nonEmptyString
  }).strict(),
  /** jsx 3962 —— 权限裁决 */
  permissionDecisionEnum = zEnum([`allow`, `deny`, `escalate`, `modify`]),
  /** jsx 3963 —— 权限行为 */
  permissionBehaviorEnum = zEnum([`allow`, `deny`, `ask`]),
  /** jsx 3964 —— 权限规则 */
  permissionRuleSchema = zObject({
    toolName: nonEmptyString,
    ruleContent: zString().optional()
  }).strict(),
  /** jsx 3968 —— addRules 权限更新 */
  addRulesUpdateSchema = zObject({
    type: zLiteral(`addRules`),
    behavior: permissionBehaviorEnum,
    rules: zArray(permissionRuleSchema).min(1)
  }).strict(),
  /** jsx 3973 ★ss —— 权限响应 */
  permissionResponseSchema = zObject({
    decision: permissionDecisionEnum,
    reason: zString().optional(),
    modifiedInput: zUnknown().optional(),
    permissionUpdates: zArray(addRulesUpdateSchema).optional()
  }).strict(),
  /** jsx 3979 —— 模型引用 */
  modelRefSchema = zObject({
    providerId: nonEmptyString,
    modelId: nonEmptyString,
    variant: nonEmptyString.optional()
  }).strict(),
  /** jsx 3984 —— 会话模式 */
  sessionModeEnum = zEnum([`plan`, `build`, `edit`, `yolo`, `auto`]),
  /** jsx 3985 —— 会话状态 */
  sessionStatusEnum = zEnum([`idle`, `running`, `waiting`, `paused`, `completed`, `error`]),
  /** jsx 3986 —— 会话种类 */
  sessionKindEnum = zEnum([`interactive`, `fork`, `selection_side_chat`, `workflow_parent`, `workflow_child`, `subagent_child`, `nested_workflow_child`]),
  /** jsx 3987 —— 目标（goal）靶点 */
  goalTargetSchema = zObject({
    sessionId: nonEmptyString,
    targetId: nonEmptyString,
    objective: nonEmptyString,
    summaryTitle: zString().min(1).nullable().default(null),
    status: zEnum([`active`, `paused`, `budget_limited`, `complete`]),
    tokenBudget: zNumber().int().positive().nullable(),
    tokensUsed: zNumber().int().nonnegative(),
    timeUsedSeconds: zNumber().int().nonnegative(),
    activeInputId: nonEmptyString.nullable().optional(),
    activeRunStartedAtMs: timestampMs.nullable().optional(),
    activeRunLastSeenAtMs: timestampMs.nullable().optional(),
    createdAt: timestampMs,
    updatedAt: timestampMs
  }).strict(),
  /** jsx 4002 —— 目标验证结果 */
  goalVerificationResultSchema = zObject({
    nextAction: zString().nullable().optional(),
    passed: zBoolean(),
    reason: zString()
  }).strict(),
  /** jsx 4007 —— 目标验证时间线条目 */
  goalVerificationTimelineSchema = zObject({
    version: zLiteral(1),
    kind: zLiteral(`synthetic`),
    type: zLiteral(`goal_verification`),
    display: zLiteral(`separator`),
    targetId: nonEmptyString,
    verificationId: nonEmptyString,
    status: zEnum([`started`, `completed`, `failed_closed`, `cancelled`]),
    verification: goalVerificationResultSchema.optional(),
    goalIteration: zNumber().int().positive().optional(),
    anchorAssistantMessageId: nonEmptyString.optional(),
    anchorTurnId: nonEmptyString.optional(),
    startedAt: timestampMs.optional(),
    updatedAt: timestampMs
  }).strict(),
  /** jsx 4022 —— 会话描述符 */
  sessionDescriptorSchema = zObject({
    sessionId: nonEmptyString,
    workspace: workspaceRefSchema,
    parentSessionId: nonEmptyString.optional(),
    traceId: nonEmptyString.optional(),
    sessionKind: sessionKindEnum,
    title: zString(),
    titleSource: zEnum([`default`, `first_input`, `generated`, `custom`]).optional(),
    mode: sessionModeEnum,
    status: sessionStatusEnum,
    model: modelRefSchema.optional(),
    target: goalTargetSchema.nullable().optional(),
    createdAt: timestampMs,
    updatedAt: timestampMs,
    archivedAt: timestampMs.optional()
  }).strict(),
  /** jsx 4038 ★os —— 子代理来源 */
  subagentOriginSchema = zObject({
    kind: zLiteral(`subagent`),
    agentId: nonEmptyString,
    agentType: nonEmptyString,
    childSessionId: nonEmptyString,
    childTurnId: nonEmptyString.optional(),
    description: zString().optional(),
    parentSessionId: nonEmptyString,
    parentToolCallId: nonEmptyString.optional(),
    parentTurnId: nonEmptyString.optional()
  }).strict(),
  /** jsx 4049 —— 消息时间（创建/完成） */
  messageTimeSchema = zObject({
    created: timestampMs,
    completed: timestampMs.optional()
  }).strict(),
  /** jsx 4053 —— token 用量（含缓存读写） */
  tokenUsageSchema = zObject({
    total: zNumber().int().nonnegative().optional(),
    input: zNumber().int().nonnegative(),
    output: zNumber().int().nonnegative(),
    reasoning: zNumber().int().nonnegative(),
    cache: zObject({
      read: zNumber().int().nonnegative(),
      write: zNumber().int().nonnegative()
    }).strict()
  }).strict(),
  /** jsx 4063 —— 消息语义（来源/可见性三通道） */
  messageSemanticsSchema = zObject({
    origin: zEnum([`real_user`, `agent_runtime`, `system`, `migration`]),
    kind: zEnum([`user_prompt`, `slash_command`, `system_reminder`, `background_notification`, `subagent_notification`, `todo_reminder`, `rewind_notice`, `fork_notice`, `timeline_event`, `compact_summary`, `assistant_response`]),
    source: zString().optional(),
    commandName: zString().optional(),
    uiVisibility: zEnum([`visible`, `hidden`, `debug`]),
    providerVisibility: zEnum([`visible`, `hidden`]),
    transcriptVisibility: zEnum([`visible`, `hidden`])
  }).strict(),
  /** jsx 4072 —— 消息信息（user/assistant 双分支判别并集） */
  messageInfoSchema = zDiscriminatedUnion(`role`, [zObject({
    messageId: nonEmptyString,
    sessionId: nonEmptyString,
    role: zLiteral(`user`),
    time: messageTimeSchema,
    agent: nonEmptyString,
    model: modelRefSchema,
    system: zString().optional(),
    tools: zRecord(zString(), zBoolean()).optional(),
    synthetic: zBoolean().optional(),
    source: syntheticSourceEnum.optional(),
    visibility: messageVisibilityEnum.optional(),
    semantics: messageSemanticsSchema.optional(),
    metadata: unknownRecord.optional()
  }).strict(), zObject({
    messageId: nonEmptyString,
    sessionId: nonEmptyString,
    role: zLiteral(`assistant`),
    time: messageTimeSchema,
    parentMessageId: nonEmptyString,
    agent: nonEmptyString,
    model: modelRefSchema,
    path: zObject({
      cwd: nonEmptyString,
      root: nonEmptyString
    }).strict(),
    cost: zNumber().nonnegative(),
    tokens: tokenUsageSchema,
    finish: zString().optional(),
    error: unknownRecord.optional(),
    semantics: messageSemanticsSchema.optional(),
    structured: zUnknown().optional()
  }).strict()]),
  /** jsx 4105 —— 消息部件基座 */
  partBaseSchema = zObject({
    partId: nonEmptyString,
    sessionId: nonEmptyString,
    messageId: nonEmptyString
  }),
  /** jsx 4110 —— 工具状态（pending/running/completed/error 判别并集） */
  toolStateSchema = zDiscriminatedUnion(`status`, [zObject({
    status: zLiteral(`pending`),
    input: unknownRecord,
    raw: zString()
  }).strict(), zObject({
    status: zLiteral(`running`),
    input: unknownRecord,
    title: zString().optional(),
    metadata: unknownRecord.optional(),
    startedAt: timestampMs
  }).strict(), zObject({
    status: zLiteral(`completed`),
    input: unknownRecord,
    output: zString(),
    title: zString(),
    metadata: unknownRecord,
    startedAt: timestampMs,
    completedAt: timestampMs
  }).strict(), zObject({
    status: zLiteral(`error`),
    input: unknownRecord,
    error: zString(),
    metadata: unknownRecord.optional(),
    startedAt: timestampMs,
    completedAt: timestampMs
  }).strict()]),
  /** jsx 4136 —— 带标签模型引用 */
  labeledModelRefSchema = modelRefSchema.extend({
    label: zString().optional()
  }),
  /** jsx 4139 —— 时间区间 */
  timeRangeSchema = zObject({
    start: timestampMs.optional(),
    end: timestampMs.optional()
  }).strict(),
  /** jsx 4143 —— 时间线部件（上下文压缩/目标验证/会话分叉/模型切换） */
  timelinePartSchema = partBaseSchema.extend({
    type: zLiteral(`timeline`),
    timelineType: zEnum([`context_compaction`, `goal_verification`, `session_fork`, `model_change`]),
    display: zEnum([`separator`, `worklog`]),
    status: zString().optional(),
    anchorMessageId: nonEmptyString.optional(),
    anchorTurnId: nonEmptyString.optional(),
    time: timeRangeSchema.optional(),
    operationId: zString().optional(),
    trigger: zEnum([`manual`, `auto`, `partial`, `reactive`, `session_memory`]).optional(),
    phase: zEnum([`standalone_turn`, `pre_request`, `mid_turn`, `reactive`]).optional(),
    compactReason: zString().optional(),
    boundaryId: zString().optional(),
    summaryMessageId: nonEmptyString.optional(),
    preCompactTokenCount: zNumber().int().nonnegative().optional(),
    postCompactTokenCount: zNumber().int().nonnegative().optional(),
    truePostCompactTokenCount: zNumber().int().nonnegative().optional(),
    attempt: zNumber().int().nonnegative().optional(),
    maxAttempts: zNumber().int().nonnegative().optional(),
    reason: zString().optional(),
    targetId: zString().optional(),
    verificationId: zString().optional(),
    goalIteration: zNumber().int().nonnegative().optional(),
    verification: zObject({
      passed: zBoolean(),
      reason: zString(),
      nextAction: zString().nullable().optional()
    }).strict().optional(),
    parentSessionId: nonEmptyString.optional(),
    targetMessageId: nonEmptyString.optional(),
    targetCheckpointId: zString().optional(),
    restoredFileCount: zNumber().int().nonnegative().optional(),
    fromModel: labeledModelRefSchema.optional(),
    toModel: labeledModelRefSchema.extend({
      label: nonEmptyString
    }).optional()
  }).strict(),
  /** jsx 4180 —— 消息部件（13 分支判别并集） */
  messagePartSchema = zDiscriminatedUnion(`type`, [partBaseSchema.extend({
    type: zLiteral(`text`),
    text: zString(),
    synthetic: zBoolean().optional(),
    ignored: zBoolean().optional(),
    metadata: unknownRecord.optional()
  }).strict(), partBaseSchema.extend({
    type: zLiteral(`reasoning`),
    text: zString(),
    metadata: unknownRecord.optional()
  }).strict(), partBaseSchema.extend({
    type: zLiteral(`file`),
    mime: nonEmptyString,
    filename: zString().optional(),
    url: nonEmptyString,
    metadata: unknownRecord.optional()
  }).strict(), partBaseSchema.extend({
    type: zLiteral(`tool`),
    callId: nonEmptyString,
    tool: nonEmptyString,
    state: toolStateSchema,
    metadata: unknownRecord.optional()
  }).strict(), partBaseSchema.extend({
    type: zLiteral(`step-start`),
    snapshot: zString().optional()
  }).strict(), partBaseSchema.extend({
    type: zLiteral(`step-finish`),
    reason: zString(),
    snapshot: zString().optional(),
    cost: zNumber().nonnegative(),
    tokens: tokenUsageSchema
  }).strict(), partBaseSchema.extend({
    type: zLiteral(`snapshot`),
    snapshot: zString()
  }).strict(), partBaseSchema.extend({
    type: zLiteral(`patch`),
    hash: nonEmptyString,
    files: zArray(zString())
  }).strict(), partBaseSchema.extend({
    type: zLiteral(`compaction`),
    auto: zBoolean(),
    reason: zString().optional(),
    summaryMessageId: nonEmptyString.optional(),
    metadata: unknownRecord.optional()
  }).strict(), timelinePartSchema, partBaseSchema.extend({
    type: zLiteral(`subagent`),
    prompt: zString(),
    description: zString(),
    agent: nonEmptyString,
    model: modelRefSchema.optional(),
    command: zString().optional()
  }).strict(), partBaseSchema.extend({
    type: zLiteral(`agent`),
    name: nonEmptyString
  }).strict(), partBaseSchema.extend({
    type: zLiteral(`retry`),
    attempt: zNumber().int().nonnegative(),
    error: unknownRecord
  }).strict()]),
  /** jsx 4239 —— 消息 + 部件聚合 */
  messageWithPartsSchema = zObject({
    info: messageInfoSchema,
    parts: zArray(messagePartSchema)
  }).strict(),
  /** jsx 4243 —— API 重试事件 */
  apiRetrySchema = zObject({
    kind: zLiteral(`api_retry`),
    attempt: zNumber().int().positive(),
    maxRetries: zNumber().int().nonnegative(),
    retryDelayMs: zNumber().int().nonnegative(),
    errorStatus: zNumber().int().nonnegative().nullable(),
    error: zString()
  }).strict(),
  /** jsx 4251 ★cs —— 缓存统计（命中率 + 累计） */
  cacheStatsSchema = zObject({
    inputTokens: zNumber().int().nonnegative(),
    cacheReadTokens: zNumber().int().nonnegative(),
    cacheWriteTokens: zNumber().int().nonnegative(),
    latestHitRate: zNumber().nonnegative().nullable().optional(),
    hitRateRequestCount: zNumber().int().nonnegative().optional(),
    totalInputTokens: zNumber().int().nonnegative().optional(),
    totalCacheReadTokens: zNumber().int().nonnegative().optional(),
    totalCacheWriteTokens: zNumber().int().nonnegative().optional(),
    hitRate: zNumber().nonnegative().nullable()
  }).strict(),
  /** jsx 4262 ★as —— 上下文占用分解 */
  contextBreakdownSchema = zArray(zObject({
    source: zEnum([`system_prompt`, `meta_user_context`, `skills`, `tool_prompt`, `system_tool_schemas`, `mcp_tool_schemas`, `messages`]),
    chars: zNumber().int().nonnegative()
  }).strict()),
  /** jsx 4266 —— 上下文用量（含成本/缓存/分解） */
  contextUsageSchema = zObject({
    used: zNumber().int().nonnegative(),
    size: zNumber().int().positive(),
    cost: zObject({
      amount: zNumber().nonnegative(),
      currency: nonEmptyString
    }).strict().nullable().optional(),
    cache: cacheStatsSchema.optional(),
    breakdown: contextBreakdownSchema.optional()
  }).strict(),
  /** jsx 4276 —— 会话状态事件 */
  sessionStateEventSchema = zObject({
    eventSeq: zNumber().int().nonnegative(),
    stateRevision: zNumber().int().nonnegative(),
    deliveryKind: clientModeEnum2.optional(),
    activeTurnId: nonEmptyString.optional(),
    activeTurnKind: zEnum([`regular`, `compact`, `rewind`]).optional(),
    pendingRequestIds: zArray(nonEmptyString),
    apiRetry: apiRetrySchema.nullable().optional(),
    contextUsage: contextUsageSchema.optional(),
    goalVerifications: zArray(goalVerificationResultSchema).optional(),
    goalVerificationTimeline: zArray(goalVerificationTimelineSchema).optional()
  }).strict();
/** jsx 4288 —— 部件序列 → 纯文本拼接 */
function extractTextFromParts(parts: any[]) {
  return parts.filter(part => part.type === `text`).map(part => part.text).join(``);
}

/* ============================================================================
 * §12 first-party —— bots/WSL/端点（jsx 4291–4509）
 * ==========================================================================*/

/** jsx 4291 —— IM 机器人供应商 */
const BOT_PROVIDER_IDS = [`telegram`, `webhook`, `feishu`, `lark`, `weixin`, `discord`, `wecom`],
  /** jsx 4292 ★is —— IM 绑定 */
  imBindingSchema = zObject({
    provider: zEnum([`feishu`, `lark`, `weixin`]),
    botId: zString().trim().min(1),
    providerUserId: zString().trim().min(1),
    chatType: zEnum([`private`, `group`])
  }).strict();
/** jsx 4298 ★ns —— 飞书/Lark 判定 */
export function isFeishuOrLark(provider: string) {
  return provider === `feishu` || provider === `lark`;
}
/** jsx 4301 —— 机器人回复模式（4 值） */
const BOT_REPLY_MODES = [`assistant_changes`, `assistant_toolcalls_changes`, `summary_changes`, `streaming_card`],
  /** jsx 4302 ★Zo —— bots 流超时（30000ms） */
  BOTS_STREAM_TIMEOUT_MS = 3e4,
  /** jsx 4303 ★Qo —— bots 任务频道 */
  BOTS_TASK_CHANNEL = `bots:task`,
  /** jsx 4304 ★$o —— bots 任务流频道 */
  BOTS_TASK_STREAM_CHANNEL = `bots:task-stream`,
  /** jsx 4305 —— 机器人允许命令开关 */
  botAllowedCommandsSchema = zObject({
    status: zBoolean(),
    new: zBoolean(),
    workspace: zBoolean(),
    model: zBoolean(),
    mode: zBoolean().optional(),
    thoughtLevel: zBoolean(),
    sandboxMode: zBoolean().optional(),
    approvalPolicy: zBoolean().optional(),
    cli: zBoolean().optional(),
    reply: zBoolean()
  }).strict(),
  /** jsx 4317 —— 机器人当前选项 */
  botCurrentOptionsSchema = zObject({
    model: zString().min(1).optional(),
    mode: zString().min(1).optional(),
    thoughtLevel: zString().min(1).optional(),
    sandboxMode: zString().min(1).optional(),
    approvalPolicy: zString().min(1).optional(),
    cli: zEnum([`codex`, `claude`, `opencode`, `gemini`, `glm`]).optional()
  }).strict(),
  /** jsx 4325 —— 机器人草稿选项 */
  botDraftOptionsSchema = zObject({
    provider: zEnum([`codex`, `claude`, `opencode`, `gemini`, `glm`]),
    model: zString().min(1).optional(),
    mode: zString().min(1).optional(),
    thoughtLevel: zString().min(1).optional()
  }).strict(),
  /** jsx 4331 —— 机器人问题选项 */
  botQuestionOptionSchema = zObject({
    value: zString(),
    label: zString(),
    description: zString().optional()
  }).strict(),
  /** jsx 4336 —— 机器人问题 */
  botQuestionSchema = zObject({
    question: zString(),
    header: zString(),
    options: zArray(botQuestionOptionSchema),
    multiSelect: zBoolean().optional()
  }).strict(),
  /** jsx 4342 —— 机器人问询（elicitation） */
  botElicitationSchema = zObject({
    taskId: zString().min(1),
    requestId: zString().min(1),
    runId: zString().min(1),
    origin: subagentOriginSchema.optional(),
    actorKey: zString().min(1).optional(),
    currentQuestionIndex: zNumber().int().min(0),
    questions: zArray(botQuestionSchema),
    answers: zRecord(zString(), zArray(zString())),
    renderContext: zObject({
      kind: zLiteral(`plan_approval`),
      plan: zString().min(1)
    }).strict().optional(),
    expandedCustomAnswerQuestionIndexes: zArray(zNumber().int().min(0)).optional(),
    handledAt: zNumber().optional()
  }).strict(),
  /** jsx 4358 —— 机器人配置 */
  botConfigSchema = zObject({
    id: zString().min(1),
    name: zString(),
    provider: zEnum(BOT_PROVIDER_IDS),
    enabled: zBoolean(),
    credentialRef: zString().min(1).optional(),
    webhookSecretRef: zString().min(1).optional(),
    webhookUrl: zString().url().optional(),
    webhookAuthHeaderName: zString().min(1).optional(),
    feishuAppId: zString().min(1).optional(),
    providerUserId: zString().min(1).optional(),
    displayName: zString().optional(),
    allowedWorkspaces: zArray(zString().min(1)),
    allowedCommands: botAllowedCommandsSchema,
    currentOptions: botCurrentOptionsSchema,
    replyMode: zEnum([`assistant_changes`, `assistant_toolcalls_changes`, `summary_changes`, `streaming_card`])
  }).strict();
/** jsx 4375 —— bots 存储双形态（数组版 + 记录版；匿名装配，结果丢弃） */
zObject({
  version: zLiteral(2),
  bots: zArray(botConfigSchema)
}).strict(), zObject({
  version: zLiteral(2),
  bots: zRecord(zString(), zObject({
    botId: zString().min(1),
    workspacePath: zString().min(1),
    workspaceIdentity: zString().min(1).optional(),
    workspaceId: zString().min(1).optional(),
    mode: zEnum([`draft`, `task`]),
    activeTaskId: zString().min(1).nullable(),
    draftOptions: botDraftOptionsSchema.optional(),
    pendingPermissionOptions: zArray(zObject({
      requestId: zString().min(1),
      optionId: zString().min(1),
      command: zEnum([`approve`, `deny`]),
      label: zString().min(1),
      response: permissionResponseSchema,
      handledAt: zNumber().optional()
    })).optional(),
    pendingElicitation: botElicitationSchema.optional(),
    telegramOffset: zNumber().optional(),
    weixinGetUpdatesBuf: zString().optional(),
    weixinActivatedAt: zNumber().optional(),
    updatedAt: zNumber()
  }))
}).strict();
/** jsx 4403 ★es —— 缺省机器人回复模式 */
export const DEFAULT_BOT_REPLY_MODE = `assistant_changes`;
/** jsx 4404 ★ts —— 供应商可用回复模式（飞书/Lark 仅 streaming_card；其余排除之） */
export function availableReplyModesForProvider(provider: string) {
  return isFeishuOrLark(provider) ? [`streaming_card`] : BOT_REPLY_MODES.filter(mode => mode !== `streaming_card`);
}
/** jsx 4407 ★rs —— 机器人回复模式裁决（非法/缺省回退首个可用） */
export function resolveBotReplyMode(provider: string, requested?: string) {
  let available = availableReplyModesForProvider(provider),
    candidate = requested ?? `assistant_changes`;
  return available.includes(candidate) ? candidate : available[0];
}
/** jsx 4412 ★Xo —— WSL 用户名校验（≤64、无控制字符、无 : / \） */
export function isValidWslUser(user: string) {
  let trimmed = user.trim();
  return trimmed.length > 0 && trimmed.length <= 64 && !containsControlCharacter(trimmed) && !trimmed.includes(`:`) && !trimmed.includes(`/`) && !trimmed.includes(`\\`);
}
/** jsx 4416 —— 控制字符判定（<32 或 127） */
function containsControlCharacter(text: string) {
  for (let char of text) {
    let code = char.codePointAt(0) ?? 0;
    if (code < 32 || code === 127) return !0;
  }
  return !1;
}
/** jsx 4423 —— WSL 用户 schema */
const wslUserSchema = zString().trim().max(64).refine((user: any) => user.length === 0 || isValidWslUser(user), {
    message: `Invalid WSL user`
  }),
  /** jsx 4426 —— ZCode 生产源 */
  ZCODE_PRODUCTION_ORIGIN = `https://zcode.z.ai`,
  /** jsx 4427 —— ZCode 测试源 */
  ZCODE_TEST_ORIGIN = `https://zcode.chatglm.site`,
  /** jsx 4428 —— BigModel 生产源 */
  BIGMODEL_PRODUCTION_ORIGIN = `https://bigmodel.cn`,
  /** jsx 4429 —— BigModel 开发源 */
  BIGMODEL_DEV_ORIGIN = `https://dev.bigmodel.cn`,
  /** jsx 4430 —— 远程 v4 协议最低应用版本 */
  REMOTE_V4_MIN_APP_VERSION = `3.4.0`;
/** jsx 4431 —— 应用版本 > 3.4.0 判定（semver 全形解析：预发布/构建段合法性） */
function isAppVersionAbove(version?: string) {
  if (!version) return !1;
  let match = version.trim().replace(/^v/i, ``).match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([^+]+))?(?:\+(.+))?$/);
  if (!match) return !1;
  let prerelease = match[4]?.split(`.`),
    prereleaseValid = prerelease === void 0 || prerelease.every(part => /^[0-9A-Za-z-]+$/.test(part) && (!/^\d+$/.test(part) || /^(0|[1-9]\d*)$/.test(part))),
    build = match[5]?.split(`.`),
    buildValid = build === void 0 || build.every(part => /^[0-9A-Za-z-]+$/.test(part));
  if (!prereleaseValid || !buildValid) return !1;
  let parts = [Number(match[1]), Number(match[2]), Number(match[3])],
    baseline = REMOTE_V4_MIN_APP_VERSION.split(`.`).map(Number);
  for (let index = 0; index < baseline.length; index += 1) if (parts[index] !== baseline[index]) return parts[index] > baseline[index];
  return prerelease === void 0;
}
/** jsx 4445 —— 环境变量读取（trim 后空串 → undefined） */
function readEnvValue(env: Record<string, string | undefined>, key: string) {
  return env[key]?.trim() || void 0;
}
/** jsx 4448 —— 端点源归一（http/https 校验 → origin） */
function normalizeEndpointOrigin(origin: string) {
  let trimmed = origin.trim();
  if (!trimmed) throw Error(`ZCode endpoint origin is empty`);
  let url = new URL(trimmed);
  if (url.protocol !== `https:` && url.protocol !== `http:`) throw Error(`ZCode endpoint origin must use http or https`);
  return url.origin;
}
/** jsx 4455 —— 按环境裁决 ZCode 源（生产 → 环境基源/生产缺省；测试 → 覆写/环境基源/测试缺省） */
function resolveZcodeOriginByEnv(options?: { env?: string; envBaseOrigin?: string; overrideOrigin?: string }) {
  let env = options?.env ?? `test`,
    envBaseOrigin = options?.envBaseOrigin?.trim();
  if (env === `production`) return envBaseOrigin ? normalizeEndpointOrigin(envBaseOrigin) : ZCODE_PRODUCTION_ORIGIN;
  let overrideOrigin = options?.overrideOrigin?.trim();
  return overrideOrigin ? normalizeEndpointOrigin(overrideOrigin) : envBaseOrigin ? normalizeEndpointOrigin(envBaseOrigin) : ZCODE_TEST_ORIGIN;
}
/** jsx 4462 —— 构建环境判定（ZCODE_ENV=test 外皆生产） */
function resolveBuildEnvFromVars(envVars: Record<string, string | undefined> = {}) {
  return envVars.ZCODE_ENV?.trim().toLowerCase() === `test` ? `test` : `production`;
}
/** jsx 4465 —— 端点源解析（ZCODE_BASE_URL → ZCODE_ENDPOINT_ORIGIN → 分环境 BASE_URL） */
function resolveZcodeEndpointOrigin(envVars: Record<string, string | undefined> = {}, overrides?: { overrideOrigin?: string }) {
  let env = resolveBuildEnvFromVars(envVars),
    envBaseUrl = env === `production` ? readEnvValue(envVars, `ZCODE_PRODUCTION_BASE_URL`) : readEnvValue(envVars, `ZCODE_TEST_BASE_URL`);
  return resolveZcodeOriginByEnv({
    env: env,
    envBaseOrigin: readEnvValue(envVars, `ZCODE_BASE_URL`) ?? readEnvValue(envVars, `ZCODE_ENDPOINT_ORIGIN`) ?? envBaseUrl,
    overrideOrigin: overrides?.overrideOrigin
  });
}
/** jsx 4474 ★Yo —— ZCode 端点配置（源 → 全量端点） */
export function resolveZcodeEndpointConfig(envVars: Record<string, string | undefined> = {}) {
  return buildZcodeEndpointConfig(resolveZcodeEndpointOrigin(envVars));
}
/** jsx 4477 —— BigModel API 基址裁决 */
function resolveBigmodelApiBaseUrl(envVars: Record<string, string | undefined> = {}) {
  let env = resolveBuildEnvFromVars(envVars),
    envBaseUrl = env === `production` ? readEnvValue(envVars, `BIGMODEL_PRODUCTION_API_BASE_URL`) : readEnvValue(envVars, `BIGMODEL_TEST_API_BASE_URL`),
    fallback = env === `production` ? BIGMODEL_PRODUCTION_ORIGIN : BIGMODEL_DEV_ORIGIN;
  return normalizeEndpointOrigin(readEnvValue(envVars, `BIGMODEL_API_BASE_URL`) ?? envBaseUrl ?? fallback);
}
/** jsx 4483 ★Ko —— BigModel API URL 拼接（路径前导 / 归一） */
export function buildBigmodelApiUrl(envVars: Record<string, string | undefined> = {}, path: string) {
  let normalizedPath = path.startsWith(`/`) ? path : `/${path}`;
  return `${resolveBigmodelApiBaseUrl(envVars)}${normalizedPath}`;
}
/** jsx 4487 ★qo —— 编码计划个人概览 URL */
export function codingPlanPersonalOverviewUrl(envVars: Record<string, string | undefined> = {}) {
  return buildBigmodelApiUrl(envVars, `/coding-plan/personal/overview`);
}
/** jsx 4490 ★Jo —— 编码计划团队方案 URL */
export function codingPlanTeamPlansUrl(envVars: Record<string, string | undefined> = {}) {
  return buildBigmodelApiUrl(envVars, `/coding-plan/team/plans`);
}
/** jsx 4493 —— ZCode 端点配置装配（ws/remote/web-remote/zcode-plan 全端点） */
function buildZcodeEndpointConfig(origin: string, options: { appVersion?: string } = {}) {
  let normalizedOrigin = normalizeEndpointOrigin(origin),
    url = new URL(normalizedOrigin),
    wsOrigin = `${url.protocol === `https:` ? `wss:` : `ws:`}//${url.host}`,
    remoteVersion = isAppVersionAbove(options.appVersion) ? `v4` : `v3`;
  return {
    origin: normalizedOrigin,
    apiBaseUrl: `${normalizedOrigin}/api/v1`,
    remoteUrl: `${normalizedOrigin}/remote/${remoteVersion}`,
    webRemoteCallbackUrl: `${normalizedOrigin}/web-remote/callback`,
    relayWsUrl: `${wsOrigin}/ws`,
    zcodePlanOpenAiBaseUrl: `${normalizedOrigin}/api/v1/zcode-plan`,
    zcodePlanAnthropicBaseUrl: `${normalizedOrigin}/api/v1/zcode-plan/anthropic`,
    zcodePlanBillingCurrentUrl: `${normalizedOrigin}/api/v1/zcode-plan/billing/current`,
    zcodePlanBillingBalanceUrl: `${normalizedOrigin}/api/v1/zcode-plan/billing/balance`
  };
}

/* ============================================================================
 * §13 first-party —— 设置 schema 与迁移（jsx 4510–4830）
 * ==========================================================================*/

/** jsx 4510 —— 设置非空字符串 */
const settingsNonEmptyString = zString().trim().min(1),
  /** jsx 4511 —— 语言 */
  localeEnum = zEnum([`zh-CN`, `en-US`]),
  /** jsx 4512 —— 语言偏好（system 跟随） */
  localePreferenceEnum = zEnum([`system`, `zh-CN`, `en-US`]),
  /** jsx 4513 —— 交互行为（队列 | 引导） */
  interactionBehaviorEnum = zEnum([`queue`, `guide`]),
  /** jsx 4514 —— 更新通道 */
  updateChannelEnum = zEnum([`stable`, `preview`]),
  /** jsx 4515 —— 缩放级别（-3…5） */
  zoomLevelSchema = zNumber().int().min(-3).max(5),
  /** jsx 4516 —— 集成终端 shell（auto | shell 双分支） */
  integratedTerminalShellSchema = zDiscriminatedUnion(`mode`, [zObject({
    mode: zLiteral(`auto`)
  }), zObject({
    mode: zLiteral(`shell`),
    dialect: zEnum([`cmd`, `git-bash`]),
    id: settingsNonEmptyString,
    label: settingsNonEmptyString,
    path: settingsNonEmptyString
  })]),
  /** jsx 4525 —— 内置 agent CLI 供应商（transform 恒映射为 BUILTIN_AGENT_CLI_PROVIDERS） */
  builtinAgentCliProvidersSchema = zArray(agentCliProviderEnum).transform(() => [...BUILTIN_AGENT_CLI_PROVIDERS]),
  /** jsx 4526 —— 供应商族模式（oauth | apiKey） */
  providerFamilyModesSchema = zObject({
    zai: zEnum([`oauth`, `apiKey`]).optional(),
    bigmodel: zEnum([`oauth`, `apiKey`]).optional()
  }).partial(),
  /** jsx 4530 —— 供应商族域 */
  providerFamilyDomainEnum = zEnum([`zai`, `bigmodel`]),
  /** jsx 4531 —— 供应商族选中键 */
  providerFamilySelectedKeysSchema = zObject({
    zai: zString().trim().min(1).optional(),
    bigmodel: zString().trim().min(1).optional()
  }).partial();
/** jsx 4535 ★Go —— 仓库快照索引用户启用判定（双旗标皆真） */
export function isRepoSnapshotIndexingUserEnabled(settings?: any) {
  return settings?.repoSnapshotIndexingEnabled === !0 && settings.repoSnapshotIndexingUserConfigured === !0;
}
/** jsx 4538 —— 发布说明（多语言） */
const releaseNotesSchema = zObject({
    version: settingsNonEmptyString,
    title: settingsNonEmptyString,
    markdown: settingsNonEmptyString,
    releaseDate: settingsNonEmptyString.optional(),
    releaseNotesByLocale: looseRecord(localeEnum, zObject({
      title: settingsNonEmptyString,
      markdown: settingsNonEmptyString
    })).optional()
  }),
  /** jsx 4548 —— 已跳过更新版本（通道 → 版本） */
  skippedUpdateVersionsSchema = looseRecord(updateChannelEnum, settingsNonEmptyString).default({}),
  /** jsx 4549 —— 远程目标（ssh/wsl/docker/server 判别并集） */
  remoteTargetSchema = zDiscriminatedUnion(`kind`, [zObject({
    kind: zLiteral(`ssh`),
    host: settingsNonEmptyString,
    port: zNumber().int().positive().max(65535).optional(),
    username: settingsNonEmptyString,
    sshConfigAlias: settingsNonEmptyString.optional(),
    privateKeyPath: zString().optional(),
    assetInstallMode: zEnum(ASSET_INSTALL_MODES).optional(),
    resourcePackages: zObject({
      selectedPackageIds: zArray(zString().refine(isFileTransferCapability)).optional()
    }).optional(),
    passwordCredentialKey: settingsNonEmptyString.optional(),
    privateKeyPassphraseCredentialKey: settingsNonEmptyString.optional()
  }), zObject({
    kind: zLiteral(`wsl`),
    distro: zString().optional(),
    user: wslUserSchema.optional()
  }), zObject({
    kind: zLiteral(`docker`),
    container: settingsNonEmptyString
  }), zObject({
    kind: zLiteral(`server`),
    url: zString().url(),
    name: settingsNonEmptyString.optional(),
    workspacePath: zString().optional(),
    serverId: settingsNonEmptyString.optional(),
    tokenCredentialKey: settingsNonEmptyString.optional()
  })]),
  /** jsx 4577 —— 工作区会话条目（local | remote） */
  workspaceSessionEntrySchema = zDiscriminatedUnion(`kind`, [zObject({
    kind: zLiteral(`local`),
    workspacePath: settingsNonEmptyString,
    workspacePurpose: zEnum([`project`, `conversation`]).default(`project`)
  }), zObject({
    kind: zLiteral(`remote`),
    workspacePath: settingsNonEmptyString,
    localWorkspacePath: settingsNonEmptyString.optional(),
    workspaceIdentity: settingsNonEmptyString.optional(),
    target: remoteTargetSchema,
    lastOpenedAt: zNumber().int().nonnegative(),
    lastConnectionStatus: zEnum([`connected`, `failed`]),
    lastConnectionError: zString().optional()
  })]),
  /** jsx 4591 —— web 远程中继设备 */
  webRemoteRelayDeviceSchema = zObject({
    deviceSid: settingsNonEmptyString
  }),
  /** jsx 4594 —— web 远程启用上下文 */
  webRemoteEnabledContextSchema = zObject({
    workspacePath: settingsNonEmptyString,
    workspaceIdentity: settingsNonEmptyString.optional(),
    initialTaskId: settingsNonEmptyString.optional()
  }),
  /** jsx 4599 —— ZCode 端点源（trim → origin 归一，失败剥离） */
  zcodeEndpointOriginSchema = transformPipe(value => {
    if (typeof value != `string`) return;
    let trimmed = value.trim();
    if (trimmed) try {
      return normalizeEndpointOrigin(trimmed);
    } catch {
      return;
    }
  }, zString().optional());
/** jsx 4608 —— 迁移：端点源归一（非法则剥离键） */
function migrateZcodeEndpointOrigin(settings: any) {
  if (!settings || typeof settings != `object` || Array.isArray(settings)) return settings;
  let record = settings;
  if (!(`zcodeEndpointOrigin` in record)) return settings;
  let parsed = zcodeEndpointOriginSchema.safeParse(record.zcodeEndpointOrigin);
  if (parsed.success && typeof parsed.data == `string`) return {
    ...record,
    zcodeEndpointOrigin: parsed.data
  };
  let {
    zcodeEndpointOrigin: _discarded,
    ...rest
  } = record;
  return rest;
}
/** jsx 4623 —— 迁移：优化代理体验默认关（一次性初始化旗标） */
function migrateOptimizeAgentExperience(settings: any) {
  if (!settings || typeof settings != `object` || Array.isArray(settings)) return settings;
  let record = settings;
  return record.optimizeAgentExperienceMigrationInitialized === !0 ? settings : {
    ...record,
    optimizeAgentExperienceEnabled: !1,
    optimizeAgentExperienceMigrationInitialized: !0
  };
}
/** jsx 4632 —— 迁移：Windows 关闭到托盘默认开（一次性初始化旗标） */
function migrateCloseToTrayOnWindows(settings: any) {
  if (!settings || typeof settings != `object` || Array.isArray(settings)) return settings;
  let record = settings;
  return record.closeToTrayOnWindowsMigrationInitialized === !0 ? settings : {
    ...record,
    closeToTrayOnWindows: !0,
    closeToTrayOnWindowsMigrationInitialized: !0
  };
}
/** jsx 4641 —— 迁移：locale → localePreference */
function migrateLocalePreference(settings: any) {
  if (!settings || typeof settings != `object` || Array.isArray(settings)) return settings;
  let record = settings;
  if (`localePreference` in record || !(`locale` in record)) return settings;
  let parsed = localeEnum.safeParse(record.locale);
  return parsed.success ? {
    ...record,
    localePreference: parsed.data
  } : settings;
}
/** jsx 4651 —— 远程工作区历史条目 */
const remoteWorkspaceHistoryEntrySchema = zObject({
  id: settingsNonEmptyString,
  workspacePath: settingsNonEmptyString,
  localWorkspacePath: settingsNonEmptyString.optional(),
  workspaceIdentity: settingsNonEmptyString.optional(),
  target: remoteTargetSchema,
  lastOpenedAt: zNumber().int().nonnegative(),
  lastConnectionStatus: zEnum([`connected`, `failed`]),
  lastConnectionError: zString().optional()
});
/** jsx 4661 —— 迁移：内置 agent CLI 供应商重置为 BUILTIN_AGENT_CLI_PROVIDERS */
function migrateEnabledBuiltinAgentCliProviders(settings: any) {
  return !settings || typeof settings != `object` || Array.isArray(settings) ? settings : {
    ...settings,
    enabledBuiltinAgentCliProviders: [...BUILTIN_AGENT_CLI_PROVIDERS]
  };
}
/** jsx 4667 —— 迁移：剥离 target 的 resourcePackages */
function stripResourcePackagesFromTarget(target: any) {
  if (!target || typeof target != `object` || Array.isArray(target)) return target;
  let record = target;
  if (record.kind !== `ssh` || !(`resourcePackages` in record)) return target;
  let {
    resourcePackages: _discarded,
    ...rest
  } = record;
  return rest;
}
/** jsx 4677 —— 迁移：末次工作区会话（历史条目展开 + 标签页字符串归一 + 去重） */
function migrateLastWorkspaceSession(settings: any) {
  if (!settings || typeof settings != `object` || Array.isArray(settings)) return settings;
  let record = settings,
    migrated: any = {
      ...record
    },
    lastSession = Array.isArray(record.lastWorkspaceSession) ? record.lastWorkspaceSession : [],
    hasLegacyHistoryId = lastSession.some((entry: any) => !entry || typeof entry != `object` || Array.isArray(entry) ? !1 : `historyId` in entry),
    history = Array.isArray(record.remoteWorkspaceHistory) ? record.remoteWorkspaceHistory : [],
    historyById = new Map<any, any>(history.flatMap((entry: any) => {
      let normalized = entry && typeof entry == `object` && !Array.isArray(entry) ? {
          ...entry,
          target: stripResourcePackagesFromTarget(entry.target)
        } : entry,
        parsed = remoteWorkspaceHistoryEntrySchema.safeParse(normalized);
      return parsed.success ? [[parsed.data.id, parsed.data]] : [];
    })),
    sessionEntries = lastSession.length > 0 ? lastSession.flatMap((entry: any) => {
      if (!entry || typeof entry != `object` || Array.isArray(entry)) return [];
      let item = entry;
      if (item.kind === `local` && typeof item.workspacePath == `string`) return [{
        kind: `local`,
        workspacePath: item.workspacePath,
        workspacePurpose: item.workspacePurpose === `conversation` ? `conversation` : `project`
      }];
      if (item.kind === `remote`) {
        if (typeof item.workspacePath == `string` && item.target) return [{
          ...item,
          target: stripResourcePackagesFromTarget(item.target)
        }];
        if (typeof item.historyId == `string`) {
          let historical = historyById.get(item.historyId);
          return historical ? [{
            kind: `remote`,
            workspacePath: historical.workspacePath,
            ...(historical.localWorkspacePath ? {
              localWorkspacePath: historical.localWorkspacePath
            } : {}),
            ...(historical.workspaceIdentity ? {
              workspaceIdentity: historical.workspaceIdentity
            } : {}),
            target: stripResourcePackagesFromTarget(historical.target),
            lastOpenedAt: historical.lastOpenedAt,
            lastConnectionStatus: historical.lastConnectionStatus,
            ...(historical.lastConnectionError ? {
              lastConnectionError: historical.lastConnectionError
            } : {})
          }] : [];
        }
      }
      return [];
    }) : [],
    tabEntries = Array.isArray(record.lastOpenTabs) ? record.lastOpenTabs.flatMap((tab: any) => typeof tab == `string` ? [{
      kind: `local`,
      workspacePath: tab,
      workspacePurpose: `project`
    }] : []) : [],
    seenLocalPaths = new Set(sessionEntries.flatMap((entry: any) => entry.kind === `local` && typeof entry.workspacePath == `string` ? [entry.workspacePath] : [])),
    merged = [...sessionEntries, ...tabEntries.filter((entry: any) => !seenLocalPaths.has(entry.workspacePath))];
  return (merged.length > 0 || hasLegacyHistoryId || Array.isArray(record.lastOpenTabs)) && (migrated.lastWorkspaceSession = merged), delete migrated.lastOpenTabs, delete migrated.remoteWorkspaceHistory, migrated;
}
/** jsx 4738 —— 设置迁移管道 + 缺省值 schema（匿名装配，结果丢弃） */
transformPipe(settings => migrateCloseToTrayOnWindows(migrateOptimizeAgentExperience(migrateLocalePreference(migrateZcodeEndpointOrigin(migrateLastWorkspaceSession(migrateEnabledBuiltinAgentCliProviders(settings)))))), zObject({
  recentProjects: zArray(zString()).default([]),
  locale: localeEnum.default(`zh-CN`),
  localePreference: localePreferenceEnum.default(`system`),
  terminalInheritSystemProfile: zBoolean().default(!0),
  terminalFontFamily: settingsNonEmptyString.optional(),
  integratedTerminalShell: integratedTerminalShellSchema.optional(),
  httpProxy: settingsNonEmptyString.optional(),
  httpProxyNoProxy: settingsNonEmptyString.optional(),
  httpProxyCaCertPath: settingsNonEmptyString.optional(),
  taskAutoArchiveEnabled: zBoolean().default(!1),
  taskAutoArchiveOlderThanDays: zNumber().int().positive().max(365).default(7),
  closeToTrayOnWindows: zBoolean().default(!0),
  closeToTrayOnWindowsMigrationInitialized: zBoolean().default(!0),
  keepAwakeWhileRunning: zBoolean().default(!1),
  desktopZoomLevel: zoomLevelSchema.optional(),
  desktopChromiumHardwareAccelerationEnabled: zBoolean().default(!0),
  messageStreamShowReasoning: zBoolean().default(!1),
  messageStreamShowTodos: zBoolean().default(!1),
  zcodeInteractionBehavior: interactionBehaviorEnum.default(`queue`),
  askUserQuestionAutoResolutionEnabled: zBoolean().default(!0),
  optimizeAgentExperienceEnabled: zBoolean().default(!1),
  optimizeAgentExperienceMigrationInitialized: zBoolean().default(!0),
  enabledBuiltinAgentCliProviders: builtinAgentCliProvidersSchema.default([...BUILTIN_AGENT_CLI_PROVIDERS]),
  modelProviderFamilyModes: providerFamilyModesSchema.default({}),
  modelProviderFamilySelectedKeys: providerFamilySelectedKeysSchema.default({}),
  providerFamilyDomain: providerFamilyDomainEnum.optional(),
  providerFamilyDomainUpdatedAt: zNumber().int().nonnegative().optional(),
  providerFamilyDomainMigrated: zBoolean().default(!1),
  repoSnapshotIndexingEnabled: zBoolean().default(!1),
  repoSnapshotIndexingUserConfigured: zBoolean().optional(),
  instantGrepIndexingEnabled: zBoolean().default(!1),
  nativeSearchEnhancementsEnabled: zBoolean().default(!0),
  memoryEnabled: zBoolean().default(!1),
  lastWorkspaceSession: zArray(workspaceSessionEntrySchema).default([]),
  lastActiveTabIndex: zNumber().int().nonnegative().default(0),
  lastActiveTaskByWorkspace: zRecord(zString(), zString()).optional(),
  dataBaseDir: zString().trim().min(1).optional(),
  pendingPostUpdateReleaseNotes: releaseNotesSchema.optional(),
  receivePreviewUpdates: zBoolean().default(!1),
  autoDownloadAndInstallUpdates: zBoolean().default(!1),
  skippedElectronUpdateVersions: skippedUpdateVersionsSchema,
  settingsSyncFirstRunPromptHandled: zBoolean().optional(),
  webRemoteControlExternalRelayDevice: webRemoteRelayDeviceSchema.optional(),
  webRemoteControlLastEnabledContext: webRemoteEnabledContextSchema.optional(),
  zcodeEndpointOrigin: zcodeEndpointOriginSchema.optional()
})), zObject({
  recentProjects: zArray(zString()).optional(),
  locale: localeEnum.optional(),
  localePreference: localePreferenceEnum.optional(),
  terminalInheritSystemProfile: zBoolean().optional(),
  terminalFontFamily: settingsNonEmptyString.optional(),
  integratedTerminalShell: integratedTerminalShellSchema.optional(),
  httpProxy: settingsNonEmptyString.optional(),
  httpProxyNoProxy: settingsNonEmptyString.optional(),
  httpProxyCaCertPath: settingsNonEmptyString.optional(),
  taskAutoArchiveEnabled: zBoolean().optional(),
  taskAutoArchiveOlderThanDays: zNumber().int().positive().max(365).optional(),
  closeToTrayOnWindows: zBoolean().optional(),
  keepAwakeWhileRunning: zBoolean().optional(),
  closeToTrayOnWindowsMigrationInitialized: zBoolean().optional(),
  desktopZoomLevel: zoomLevelSchema.optional(),
  desktopChromiumHardwareAccelerationEnabled: zBoolean().optional(),
  messageStreamShowReasoning: zBoolean().optional(),
  messageStreamShowTodos: zBoolean().optional(),
  zcodeInteractionBehavior: interactionBehaviorEnum.optional(),
  askUserQuestionAutoResolutionEnabled: zBoolean().optional(),
  optimizeAgentExperienceEnabled: zBoolean().optional(),
  optimizeAgentExperienceMigrationInitialized: zBoolean().optional(),
  enabledBuiltinAgentCliProviders: builtinAgentCliProvidersSchema.optional(),
  modelProviderFamilyModes: providerFamilyModesSchema.optional(),
  modelProviderFamilySelectedKeys: providerFamilySelectedKeysSchema.optional(),
  providerFamilyDomain: zUnion([providerFamilyDomainEnum, zLiteral(``)]).optional(),
  providerFamilyDomainUpdatedAt: zNumber().int().nonnegative().optional(),
  providerFamilyDomainMigrated: zBoolean().optional(),
  repoSnapshotIndexingEnabled: zBoolean().optional(),
  repoSnapshotIndexingUserConfigured: zBoolean().optional(),
  instantGrepIndexingEnabled: zBoolean().optional(),
  nativeSearchEnhancementsEnabled: zBoolean().optional(),
  memoryEnabled: zBoolean().optional(),
  lastWorkspaceSession: zArray(workspaceSessionEntrySchema).optional(),
  lastActiveTabIndex: zNumber().int().nonnegative().optional(),
  lastActiveTaskByWorkspace: zRecord(zString(), zString()).optional(),
  dataBaseDir: zString().trim().min(1).optional(),
  pendingPostUpdateReleaseNotes: releaseNotesSchema.optional(),
  receivePreviewUpdates: zBoolean().optional(),
  autoDownloadAndInstallUpdates: zBoolean().optional(),
  skippedElectronUpdateVersions: looseRecord(updateChannelEnum, settingsNonEmptyString).optional(),
  settingsSyncFirstRunPromptHandled: zBoolean().optional(),
  webRemoteControlExternalRelayDevice: webRemoteRelayDeviceSchema.optional(),
  webRemoteControlLastEnabledContext: webRemoteEnabledContextSchema.optional(),
  zcodeEndpointOrigin: zcodeEndpointOriginSchema.optional()
});

/* ============================================================================
 * §14 first-party —— 供应商/模型注册表（jsx 4831–4901；Ll 跨 4900 边界，
 *   按「声明符原子性」裁决归本批次，B5-10b 自 Rl（4902）起）
 * ==========================================================================*/

/** jsx 4831 —— 审批策略枚举（10 值） */
const approvalPolicyEnum = zEnum([`default`, `yolo`, `plan`, `edit`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `autoEdit`, `build`]),
  /** jsx 4832 —— 内置供应商前缀 */
  BUILTIN_PROVIDER_PREFIX = `builtin:`,
  /** jsx 4833 ★mo —— 内置供应商 ID 表（已登记：providerIds，ExtendedViews.report styles 侧 q=mo） */
  providerIds = {
    zai: `${BUILTIN_PROVIDER_PREFIX}zai`,
    zaiCodingPlan: `${BUILTIN_PROVIDER_PREFIX}zai-coding-plan`,
    zaiStartPlan: `${BUILTIN_PROVIDER_PREFIX}zai-start-plan`,
    bigmodel: `${BUILTIN_PROVIDER_PREFIX}bigmodel`,
    bigmodelCodingPlan: `${BUILTIN_PROVIDER_PREFIX}bigmodel-coding-plan`,
    bigmodelStartPlan: `${BUILTIN_PROVIDER_PREFIX}bigmodel-start-plan`,
    zapi: `${BUILTIN_PROVIDER_PREFIX}zapi`
  };
/** jsx 4842 ★Eo —— 内置供应商 ID 判定 */
export function isBuiltinProviderId(providerId: string) {
  return providerId === providerIds.zai || providerId === providerIds.zaiCodingPlan || providerId === providerIds.zaiStartPlan || providerId === providerIds.bigmodel || providerId === providerIds.bigmodelCodingPlan || providerId === providerIds.bigmodelStartPlan || providerId === providerIds.zapi;
}
/** jsx 4845 ★Po —— ZAI 计划供应商判定 */
export function isZaiPlanProviderId(providerId: string) {
  return providerId === providerIds.zaiCodingPlan || providerId === providerIds.zaiStartPlan;
}
/** jsx 4848 ★No —— StartPlan 供应商判定 */
export function isStartPlanProviderId(providerId: string) {
  return providerId === providerIds.zaiStartPlan || providerId === providerIds.bigmodelStartPlan;
}
/** jsx 4851 ★Do —— CodingPlan 供应商判定（ZAI 计划 + BigModel 两计划键） */
export function isCodingPlanProviderId(providerId: string) {
  return isZaiPlanProviderId(providerId) || providerId === providerIds.bigmodelCodingPlan || providerId === providerIds.bigmodelStartPlan;
}
/** jsx 4854 ★vo —— GLM 模型 ID 表 */
export const GLM_MODEL_IDS = [`GLM-5.2`, `GLM-5-Turbo`],
  /** jsx 4855 ★ho —— GLM 推理档位 */
  GLM_REASONING_LEVELS = [`max`, `high`, `nothink`],
  /** jsx 4856 —— GLM 缺省模型前缀 */
  GLM_DEFAULT_MODEL_PREFIX = `glm-5.2`,
  /** jsx 4857 —— GLM 日期化模型正则（glm-NNNN 后随边界） */
  GLM_DATED_MODEL_REGEX = /^glm-\d{4}(?:$|[^0-9a-z])/;
/** jsx 4858 ★Oo —— GLM 模型判定（含 provider/model 斜杠末段双形） */
export function isGlmModelId(modelId: string) {
  let lower = modelId.toLowerCase(),
    tail = lower.split(`/`).filter(Boolean).at(-1);
  return (tail && tail !== lower ? [lower, tail] : [lower]).some(candidate => candidate.startsWith(GLM_DEFAULT_MODEL_PREFIX) || GLM_DATED_MODEL_REGEX.test(candidate));
}
/** jsx 4863 ★yo —— Claude 档位 → GLM 模型映射 */
export const CLAUDE_TO_GLM_MODEL_MAP = {
    claude: {
      haiku: `GLM-5-Turbo`,
      sonnet: `GLM-5-Turbo`,
      opus: `GLM-5.2`,
      reasoning: `GLM-5.2`
    }
  },
  /** jsx 4871 —— 模型别名覆写 schema */
  modelAliasOverrideSchema = zObject({
    claude: zObject({
      haiku: zString(),
      sonnet: zString(),
      opus: zString(),
      reasoning: zString()
    }).optional()
  }).catchall(zUnknown()),
  /** jsx 4879 —— API 格式 */
  apiFormatEnum = zEnum([`anthropic`, `openai`, `responses`, `gemini`]),
  /** jsx 4880 —— 线路格式 */
  wireFormatEnum = zEnum([`anthropic-messages`, `openai-chat-completions`, `openai-responses`]),
  /** jsx 4881 —— 供应商种类 */
  providerKindEnum = zEnum([`anthropic`, `openai`, `openai-compatible`]),
  /** jsx 4882 —— 开发供应商 ID */
  devProviderIdEnum = zEnum([`china-llm-zcode-dev`]),
  /** jsx 4883 —— 模态 */
  modalityEnum = zEnum([`text`, `image`, `video`, `audio`, `pdf`]),
  /** jsx 4884 —— 环境路径 */
  envPathSchema = zObject({
    path: zArray(zString().min(1)).min(1)
  }),
  /** jsx 4887 —— 环境覆写（set/unset） */
  envOverrideSchema = zObject({
    set: zArray(envPathSchema.extend({
      value: zUnknown()
    })).optional(),
    unset: zArray(envPathSchema).optional()
  }),
  /** jsx 4893 —— 推理档位配置 */
  reasoningLevelConfigSchema = zObject({
    defaultLevel: zString().min(1).optional(),
    levels: zRecord(zString().min(1), looseRecord(providerKindEnum, envOverrideSchema))
  }),
  /** jsx 4897 —— 按种类的端点表 */
  endpointsByKindSchema = looseRecord(providerKindEnum, zString()),
  /** jsx 4898–4901 —— 供应商端点（跨 4900 边界；声明符原子性归本批次） */
  providerEndpointsSchema = zObject({
    baseURL: zString(),
    paths: endpointsByKindSchema
  });

/* ============================================================================
 * §15 对外导出补充（A0-S2d · B5-10b/B5-14）：SrcSharedB §0 跨批次消费、原未导出的
 *    40 符号（50 登记中 10 件已随 5706/5720 导出链转出，无需重复）；均为上方
 *    边界链成员，export 不触碰实体正文（接口级依赖，不影响发射代码）；
 *    逐项注明原混淆名与 jsx 行。DEFAULT_ASSET_INSTALL_MODE 为 B5-14 清单补导出。
 * ============================================================================ */
export {
  zUndefined, // Ua（jsx 3130）
  zDate, // Ja（jsx 3150）
  looseRecord, // no（jsx 3226）
  clientModeEnum, // Fo（jsx 3433）
  browserRequestSchema, // Ko（jsx 3524）
  browserDescriptorSchema, // Yo（jsx 3729）
  sessionContextEnum, // Xo（jsx 3741）
  browserResultSchema, // as（jsx 3829）
  ASSET_INSTALL_MODES, // os（jsx 3851）
  DEFAULT_ASSET_INSTALL_MODE, // ss（jsx 3852）—— B5-14 补导出
  isFileTransferCapability, // ps（jsx 3862）
  agentCliProviderEnum, // I（jsx 3865）
  USAGE_REPORT_RANGES, // ms（jsx 3866）
  clientModeEnum2, // Os（jsx 3953）
  messageVisibilityEnum, // ks（jsx 3954）
  syntheticSourceEnum, // As（jsx 3955）
  workspaceRefSchema, // B（jsx 3956）
  permissionDecisionEnum, // js（jsx 3962）
  addRulesUpdateSchema, // Ps（jsx 3968）
  permissionResponseSchema, // Fs（jsx 3973）
  modelRefSchema, // V（jsx 3979）
  sessionModeEnum, // Is（jsx 3984）
  sessionStatusEnum, // Ls（jsx 3985）
  goalTargetSchema, // zs（jsx 3987）
  sessionDescriptorSchema, // Hs（jsx 4022）
  subagentOriginSchema, // Us（jsx 4038）
  messagePartSchema, // Qs（jsx 4180）
  messageWithPartsSchema, // $s（jsx 4239）
  cacheStatsSchema, // tc（jsx 4251）
  contextBreakdownSchema, // nc（jsx 4262）
  sessionStateEventSchema, // ic（jsx 4276）
  extractTextFromParts, // ac（jsx 4288）
  imBindingSchema, // sc（jsx 4292）
  BOTS_STREAM_TIMEOUT_MS, // uc（jsx 4302）
  BOTS_TASK_CHANNEL, // dc（jsx 4303）
  BOTS_TASK_STREAM_CHANNEL, // fc（jsx 4304）
  wslUserSchema, // Tc（jsx 4423）
  integratedTerminalShellSchema, // Jc（jsx 4516）
  approvalPolicyEnum, // hl（jsx 4831）
  providerIds // W（jsx 4833）
  // Dl/Ol/kl/Al/jl/Ml/Fl/Il/Ll（modelAliasOverrideSchema…providerEndpointsSchema）
  // 与 Sl（GLM_REASONING_LEVELS）已随 5706/5720 导出链转出，此处不重复登记。
};

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → jsx 行 / js 行 → 导出字母；jsx 1–4901 全覆盖）
 *   ★ = 有导出字母；§2–§8 为捆绑 zod v4.3.6（vendored，语义名取 zod 上游命名）；
 *   §1/§9–§14 为 first-party（语义名按用法规约，把握度见报告 §5）
 * ============================================================================
 * §1 first-party 助手（jsx 1–141，15 符号）
 *   e      → DEFAULT_LOCALE                             jsx 1     / js 1     ★Ps
 *   t      → sanitizeWorkspaceDescriptor                jsx 2     / js 2     ★Ns
 *   n      → parsePathRootPrefix                        jsx 20    / js 13     —
 *   r      → normalizeTraversalPath                     jsx 64    / js 32     —
 *   i      → resolveSshAuthMethod                       jsx 83    / js 52     —
 *   a      → sshTargetIdentityKey                       jsx 86    / js 60    ★Ms
 *   o      → normalizeBuildEnv                          jsx 89    / js 70     —
 *   s      → RESOLVED_BUILD_ENV                         jsx 92    / js 73    ★js
 *   c      → isNonNullObject                            jsx 94    / js 75     —
 *   l      → toPrimitiveString                          jsx 97    / js 78     —
 *   u      → unwrapErrorPayload                         jsx 100   / js 81     —
 *   d      → FILE_LOCK_TIMEOUT_CODE                     jsx 103   / js 88     —
 *   f      → stringifyErrorValue                        jsx 104   / js 89     —
 *   ee     → extractErrorInfo                           jsx 115   / js 100   ★As
 *   te     → isFileLockTimeoutError                     jsx 136   / js 113   ★ks
 * §2 zod core 构造/工具（jsx 142–532，46 符号）
 *   p      → $constructor                               jsx 142   / js 117    —
 *   ne     → $ZodAsyncError                             jsx 180   / js 155    —
 *   re     → $ZodEncodeError                            jsx 185   / js 160    —
 *   ie     → $globalConfig                              jsx 190   / js 166    —
 *   ae     → $getGlobalConfig                           jsx 191   / js 167    —
 *   oe     → $getEnumValues                             jsx 194   / js 170    —
 *   se     → jsonStringifyReplacer                      jsx 198   / js 176    —
 *   ce     → $lazy                                      jsx 201   / js 179    —
 *   le     → nullish                                    jsx 214   / js 190    —
 *   ue     → stripRegexAnchors                          jsx 217   / js 193    —
 *   de     → decimalModulo                              jsx 222   / js 198    —
 *   fe     → EVALUATING_SENTINEL                        jsx 233   / js 213    —
 *   m      → $lazyDefine                                jsx 234   / js 214    —
 *   pe     → defineWritableProperty                     jsx 248   / js 226    —
 *   me     → $mergeDefs                                 jsx 256   / js 229    —
 *   he     → jsonStringify                              jsx 261   / js 234    —
 *   ge     → slugify                                    jsx 264   / js 237    —
 *   _e     → captureStackTrace                          jsx 267   / js 245    —
 *   ve     → isObject                                   jsx 268   / js 246    —
 *   ye     → $canUseFunction                            jsx 271   / js 249    —
 *   be     → isPlainObject                              jsx 279   / js 257    —
 *   xe     → shallowClone                               jsx 286   / js 264    —
 *   Se     → PRIMITIVE_TYPES                            jsx 291   / js 267    —
 *   Ce     → escapeRegex                                jsx 292   / js 268    —
 *   h      → clone                                      jsx 295   / js 271    —
 *   g      → normalizeCheckParams                       jsx 299   / js 275    —
 *   we     → optionalKeys                               jsx 314   / js 285    —
 *   Te     → NUMBER_FORMAT_LIMITS                       jsx 317   / js 290    —
 *   Ee     → $pick                                      jsx 324   / js 297    —
 *   De     → $omit                                      jsx 340   / js 317    —
 *   Oe     → $extend                                    jsx 358   / js 337    —
 *   ke     → $safeExtend                                jsx 375   / js 358    —
 *   Ae     → $merge                                     jsx 387   / js 370    —
 *   je     → $partial                                   jsx 402   / js 385    —
 *   Me     → $nonpartial                                jsx 426   / js 407    —
 *   Ne     → $shouldAbort                               jsx 447   / js 425    —
 *   Pe     → prefixIssuePath                            jsx 452   / js 430    —
 *   Fe     → resolveMessageString                       jsx 458   / js 436    —
 *   Ie     → $cleanIssue                                jsx 461   / js 439    —
 *   Le     → resolveOriginKind                          jsx 468   / js 455    —
 *   Re     → $issue                                     jsx 471   / js 458    —
 *   ze     → $ZodErrorInternals                         jsx 482   / js 462    —
 *   Be     → $ZodError                                  jsx 494   / js 469    —
 *   Ve     → $ZodRealError                              jsx 495   / js 470    —
 *   He     → $flattenError                              jsx 498   / js 471    —
 *   Ue     → $treeifyError                              jsx 507   / js 480    —
 * §3 zod core 解析引擎（jsx 533–641，14 符号）
 *   We     → makeParseFn                                jsx 533   / js 503    —
 *   Ge     → makeParseAsyncFn                           jsx 550   / js 513    —
 *   Ke     → makeSafeParseFn                            jsx 566   / js 522    —
 *   qe     → safeParseReal                              jsx 586   / js 530    —
 *   Je     → makeSafeParseAsyncFn                       jsx 587   / js 531    —
 *   Ye     → safeParseAsyncReal                         jsx 605   / js 541    —
 *   Xe     → makeEncodeFn                               jsx 606   / js 542    —
 *   Ze     → makeDecodeFn                               jsx 614   / js 546    —
 *   Qe     → makeEncodeAsyncFn                          jsx 615   / js 547    —
 *   $e     → makeDecodeAsyncFn                          jsx 623   / js 551    —
 *   et     → makeSafeEncodeFn                           jsx 624   / js 552    —
 *   tt     → makeSafeDecodeFn                           jsx 632   / js 556    —
 *   nt     → makeSafeEncodeAsyncFn                      jsx 633   / js 557    —
 *   rt     → makeSafeDecodeAsyncFn                      jsx 641   / js 561    —
 * §4 zod core 正则表（jsx 642–690，31 符号）
 *   it     → cuidRegex                                  jsx 642   / js 562    —
 *   at     → cuid2Regex                                 jsx 643   / js 563    —
 *   ot     → ulidRegex                                  jsx 644   / js 564    —
 *   st     → xidRegex                                   jsx 645   / js 565    —
 *   ct     → ksuidRegex                                 jsx 646   / js 566    —
 *   lt     → nanoidRegex                                jsx 647   / js 567    —
 *   ut     → isoDurationRegex                           jsx 648   / js 568    —
 *   dt     → uuidGenericRegex                           jsx 649   / js 570    —
 *   ft     → uuidVersionedRegex                         jsx 650   / js 571    —
 *   pt     → emailRegex                                 jsx 651   / js 577    —
 *   mt     → emojiRegexSource                           jsx 652   / js 579    —
 *   ht     → emojiRegex                                 jsx 653   / js 580    —
 *   gt     → ipv4Regex                                  jsx 656   / js 583    —
 *   _t     → ipv6Regex                                  jsx 657   / js 585    —
 *   vt     → ipv4CidrRegex                              jsx 658   / js 587    —
 *   yt     → ipv6CidrRegex                              jsx 659   / js 589    —
 *   bt     → base64Regex                                jsx 660   / js 591    —
 *   xt     → base64urlRegex                             jsx 661   / js 592    —
 *   St     → e164Regex                                  jsx 662   / js 593    —
 *   Ct     → isoDateSource                              jsx 663   / js 594    —
 *   wt     → isoDateRegex                               jsx 664   / js 595    —
 *   Tt     → isoTimeSource                              jsx 665   / js 596    —
 *   Et     → isoTimeRegex                               jsx 669   / js 606    —
 *   Dt     → isoDateTimeRegex                           jsx 672   / js 609    —
 *   Ot     → makeStringLengthRegex                      jsx 681   / js 616    —
 *   kt     → integerRegex                               jsx 685   / js 620    —
 *   At     → numberRegex                                jsx 686   / js 621    —
 *   jt     → booleanRegex                               jsx 687   / js 622    —
 *   Mt     → undefinedRegex                             jsx 688   / js 623    —
 *   Nt     → lowercaseRegex                             jsx 689   / js 624    —
 *   Pt     → uppercaseRegex                             jsx 690   / js 625    —
 * §5 zod core 检查/JIT（jsx 691–1027，19 符号）
 *   _      → $ZodCheck                                  jsx 691   / js 626    —
 *   Ft     → CHECK_ORIGIN_BY_VALUE_TYPE                 jsx 695   / js 630    —
 *   It     → $ZodCheckLessThan                          jsx 700   / js 631    —
 *   Lt     → $ZodCheckGreaterThan                       jsx 719   / js 652    —
 *   Rt     → $ZodCheckMultipleOf                        jsx 738   / js 673    —
 *   zt     → $ZodCheckNumberFormat                      jsx 754   / js 695    —
 *   Bt     → $ZodCheckMaxLength                         jsx 818   / js 765    —
 *   Vt     → $ZodCheckMinLength                         jsx 841   / js 792    —
 *   Ht     → $ZodCheckLengthEquals                      jsx 864   / js 819    —
 *   Ut     → $ZodCheckStringFormat                      jsx 895   / js 850    —
 *   Wt     → $ZodCheckRegex                             jsx 914   / js 875    —
 *   Gt     → $ZodCheckLowerCase                         jsx 927   / js 891    —
 *   Kt     → $ZodCheckUpperCase                         jsx 930   / js 894    —
 *   qt     → $ZodCheckIncludes                          jsx 933   / js 897    —
 *   Jt     → $ZodCheckStartsWith                        jsx 952   / js 919    —
 *   Yt     → $ZodCheckEndsWith                          jsx 970   / js 940    —
 *   Xt     → $ZodCheckOverwrite                         jsx 988   / js 961    —
 *   Zt     → JitCodeBuilder                             jsx 993   / js 967    —
 *   Qt     → ZOD_VERSION                                jsx 1023  / js 1000   —
 * §6 zod core schema（jsx 1028–1990，69 符号）
 *   v      → $ZodType                                   jsx 1028  / js 1001   —
 *   $t     → $ZodString                                 jsx 1106  / js 1072   —
 *   y      → $ZodStringFormat                           jsx 1119  / js 1087   —
 *   en     → $ZodGUID                                   jsx 1122  / js 1090   —
 *   tn     → $ZodUUID                                   jsx 1125  / js 1093   —
 *   nn     → $ZodEmail                                  jsx 1142  / js 1101   —
 *   rn     → $ZodURL                                    jsx 1145  / js 1104   —
 *   an     → $ZodEmoji                                  jsx 1179  / js 1147   —
 *   on     → $ZodNanoID                                 jsx 1182  / js 1150   —
 *   sn     → $ZodCUID                                   jsx 1185  / js 1153   —
 *   cn     → $ZodCUID2                                  jsx 1188  / js 1156   —
 *   ln     → $ZodULID                                   jsx 1191  / js 1159   —
 *   un     → $ZodXID                                    jsx 1194  / js 1162   —
 *   dn     → $ZodKSUID                                  jsx 1197  / js 1165   —
 *   fn     → $ZodISODateTime                            jsx 1200  / js 1168   —
 *   pn     → $ZodISODate                                jsx 1203  / js 1171   —
 *   mn     → $ZodISOTime                                jsx 1206  / js 1174   —
 *   hn     → $ZodISODuration                            jsx 1209  / js 1177   —
 *   gn     → $ZodIPv4                                   jsx 1212  / js 1180   —
 *   _n     → $ZodIPv6                                   jsx 1215  / js 1183   —
 *   vn     → $ZodCIDRv4                                 jsx 1230  / js 1201   —
 *   yn     → $ZodCIDRv6                                 jsx 1233  / js 1204   —
 *   bn     → isValidBase64                              jsx 1254  / js 1227   —
 *   xn     → $ZodBase64                                 jsx 1263  / js 1236   —
 *   Sn     → isValidBase64URL                           jsx 1274  / js 1251   —
 *   Cn     → $ZodBase64URL                              jsx 1279  / js 1256   —
 *   wn     → $ZodE164                                   jsx 1290  / js 1271   —
 *   Tn     → isValidJWT                                 jsx 1293  / js 1274   —
 *   En     → $ZodJWT                                    jsx 1305  / js 1286   —
 *   Dn     → $ZodNumber                                 jsx 1316  / js 1299   —
 *   On     → $ZodNumberFormat                           jsx 1335  / js 1329   —
 *   kn     → $ZodBoolean                                jsx 1338  / js 1332   —
 *   An     → $ZodUndefined                              jsx 1352  / js 1348   —
 *   jn     → $ZodUnknown                                jsx 1363  / js 1363   —
 *   Mn     → $ZodNever                                  jsx 1366  / js 1366   —
 *   Nn     → $ZodDate                                   jsx 1374  / js 1373   —
 *   Pn     → assignArrayElementResult                   jsx 1392  / js 1395   —
 *   Fn     → $ZodArray                                  jsx 1395  / js 1398   —
 *   In     → assignShapeEntryResult                     jsx 1417  / js 1414   —
 *   Ln     → computeObjectInternals                     jsx 1424  / js 1421   —
 *   Rn     → processCatchallKeys                        jsx 1436  / js 1429   —
 *   zn     → $ZodObject                                 jsx 1461  / js 1449   —
 *   Bn     → $ZodObjectJIT                              jsx 1515  / js 1492   —
 *   Vn     → finalizeUnionParse                         jsx 1592  / js 1571   —
 *   Hn     → $ZodUnion                                  jsx 1602  / js 1584   —
 *   Un     → $ZodDiscriminatedUnion                     jsx 1630  / js 1619   —
 *   Wn     → $ZodIntersection                           jsx 1678  / js 1670   —
 *   Gn     → mergeValues                                jsx 1692  / js 1681   —
 *   Kn     → finalizeIntersectionParse                  jsx 1743  / js 1709   —
 *   qn     → $ZodRecord                                 jsx 1760  / js 1728   —
 *   Jn     → $ZodEnum                                   jsx 1832  / js 1801   —
 *   Yn     → $ZodLiteral                                jsx 1846  / js 1820   —
 *   Xn     → $ZodTransform                              jsx 1859  / js 1836   —
 *   Zn     → resetIssuesForOptionalUndefined            jsx 1868  / js 1847   —
 *   Qn     → $ZodOptional                               jsx 1874  / js 1850   —
 *   $n     → $ZodExactOptional                          jsx 1886  / js 1869   —
 *   er     → $ZodNullable                               jsx 1889  / js 1875   —
 *   tr     → $ZodDefault                                jsx 1895  / js 1888   —
 *   nr     → applyDefaultValue                          jsx 1903  / js 1899   —
 *   rr     → $ZodPrefault                               jsx 1906  / js 1902   —
 *   ir     → $ZodNonOptional                            jsx 1909  / js 1911   —
 *   ar     → rejectUndefinedValue                       jsx 1918  / js 1922   —
 *   or     → $ZodCatch                                  jsx 1926  / js 1930   —
 *   sr     → $ZodPipe                                   jsx 1945  / js 1963   —
 *   cr     → runPipeStage                               jsx 1955  / js 1978   —
 *   lr     → $ZodReadonly                               jsx 1961  / js 1983   —
 *   ur     → freezePayloadValue                         jsx 1968  / js 1995   —
 *   dr     → $ZodCustom                                 jsx 1971  / js 1998   —
 *   fr     → handleCustomCheckResult                    jsx 1979  / js 2009   —
 * §7 zod core registry/工厂/JSON Schema（jsx 1991–2932，93 符号）
 *   pr     → registryInit                               jsx 1991  / js 2021   —
 *   mr     → MetadataRegistry                           jsx 1992  / js 2022   —
 *   hr     → createMetadataRegistry                     jsx 2026  / js 2059   —
 *   gr     → $globalRegistry                            jsx 2030  / js 2063   —
 *   _r     → $string                                    jsx 2031  / js 2064   —
 *   vr     → $email                                     jsx 2037  / js 2067   —
 *   yr     → $guid                                      jsx 2046  / js 2070   —
 *   br     → $uuid                                      jsx 2055  / js 2073   —
 *   xr     → $uuidv4                                    jsx 2064  / js 2076   —
 *   Sr     → $uuidv6                                    jsx 2074  / js 2086   —
 *   Cr     → $uuidv7                                    jsx 2084  / js 2096   —
 *   wr     → $url                                       jsx 2094  / js 2106   —
 *   Tr     → $emoji                                     jsx 2103  / js 2109   —
 *   Er     → $nanoid                                    jsx 2112  / js 2112   —
 *   Dr     → $cuid                                      jsx 2121  / js 2115   —
 *   Or     → $cuid2                                     jsx 2130  / js 2118   —
 *   kr     → $ulid                                      jsx 2139  / js 2121   —
 *   Ar     → $xid                                       jsx 2148  / js 2124   —
 *   jr     → $ksuid                                     jsx 2157  / js 2127   —
 *   Mr     → $ipv4                                      jsx 2166  / js 2130   —
 *   Nr     → $ipv6                                      jsx 2175  / js 2133   —
 *   Pr     → $cidrv4                                    jsx 2184  / js 2136   —
 *   Fr     → $cidrv6                                    jsx 2193  / js 2139   —
 *   Ir     → $base64                                    jsx 2202  / js 2142   —
 *   Lr     → $base64url                                 jsx 2211  / js 2145   —
 *   Rr     → $e164                                      jsx 2220  / js 2148   —
 *   zr     → $jwt                                       jsx 2229  / js 2151   —
 *   Br     → $datetime                                  jsx 2238  / js 2154   —
 *   Vr     → $date                                      jsx 2249  / js 2165   —
 *   Hr     → $time                                      jsx 2257  / js 2168   —
 *   Ur     → $duration                                  jsx 2266  / js 2177   —
 *   Wr     → $number                                    jsx 2274  / js 2180   —
 *   Gr     → $int                                       jsx 2281  / js 2183   —
 *   Kr     → $boolean                                   jsx 2290  / js 2186   —
 *   qr     → $undefined                                 jsx 2296  / js 2189   —
 *   Jr     → $unknown                                   jsx 2302  / js 2192   —
 *   Yr     → $never                                     jsx 2307  / js 2195   —
 *   Xr     → $dateValue                                 jsx 2313  / js 2198   —
 *   Zr     → $lt                                        jsx 2319  / js 2201   —
 *   Qr     → $lte                                       jsx 2327  / js 2204   —
 *   $r     → $gt                                        jsx 2335  / js 2207   —
 *   ei     → $gte                                       jsx 2343  / js 2210   —
 *   ti     → $multipleOf                                jsx 2351  / js 2213   —
 *   ni     → $maxLength                                 jsx 2358  / js 2216   —
 *   ri     → $minLength                                 jsx 2365  / js 2219   —
 *   ii     → $length                                    jsx 2372  / js 2222   —
 *   ai     → $regex                                     jsx 2379  / js 2225   —
 *   oi     → $lowercase                                 jsx 2387  / js 2228   —
 *   si     → $uppercase                                 jsx 2394  / js 2231   —
 *   ci     → $includes                                  jsx 2401  / js 2234   —
 *   li     → $startsWith                                jsx 2409  / js 2237   —
 *   ui     → $endsWith                                  jsx 2417  / js 2240   —
 *   di     → $overwrite                                 jsx 2425  / js 2243   —
 *   fi     → $normalize                                 jsx 2431  / js 2246   —
 *   pi     → $trim                                      jsx 2434  / js 2249   —
 *   mi     → $toLowerCase                               jsx 2437  / js 2252   —
 *   hi     → $toUpperCase                               jsx 2440  / js 2255   —
 *   gi     → $slugify                                   jsx 2443  / js 2258   —
 *   _i     → $array                                     jsx 2446  / js 2261   —
 *   vi     → $custom                                    jsx 2453  / js 2264   —
 *   yi     → $superRefine                               jsx 2461  / js 2267   —
 *   bi     → defineCheck                                jsx 2470  / js 2287   —
 *   xi     → initJsonSchemaContext                      jsx 2477  / js 2291   —
 *   b      → processJsonSchemaNode                      jsx 2493  / js 2311   —
 *   Si     → resolveJsonSchemaRefs                      jsx 2527  / js 2343   —
 *   Ci     → finalizeJsonSchema                         jsx 2610  / js 2416   —
 *   x      → schemaContainsTransform                    jsx 2671  / js 2501   —
 *   wi     → makeToJsonSchemaFn                         jsx 2700  / js 2537   —
 *   Ti     → makeIoJsonSchemaFn                         jsx 2707  / js 2543   —
 *   Ei     → JSON_SCHEMA_FORMAT_MAP                     jsx 2720  / js 2550   —
 *   Di     → processJsonSchemaString                    jsx 2727  / js 2551   —
 *   Oi     → processJsonSchemaNumber                    jsx 2747  / js 2579   —
 *   ki     → processJsonSchemaBoolean                   jsx 2759  / js 2610   —
 *   Ai     → processJsonSchemaUndefined                 jsx 2762  / js 2613   —
 *   ji     → processJsonSchemaNever                     jsx 2765  / js 2617   —
 *   Mi     → processJsonSchemaDate                      jsx 2768  / js 2620   —
 *   Ni     → processJsonSchemaEnum                      jsx 2771  / js 2623   —
 *   Pi     → processJsonSchemaLiteral                   jsx 2776  / js 2630   —
 *   Fi     → processJsonSchemaCustom                    jsx 2790  / js 2654   —
 *   Ii     → processJsonSchemaTransform                 jsx 2793  / js 2658   —
 *   Li     → processJsonSchemaArray                     jsx 2796  / js 2662   —
 *   Ri     → processJsonSchemaObject                    jsx 2808  / js 2671   —
 *   zi     → processJsonSchemaUnion                     jsx 2827  / js 2695   —
 *   Bi     → processJsonSchemaIntersection              jsx 2836  / js 2701   —
 *   Vi     → processJsonSchemaRecord                    jsx 2849  / js 2708   —
 *   Hi     → processJsonSchemaNullable                  jsx 2875  / js 2731   —
 *   Ui     → processJsonSchemaNonOptional               jsx 2883  / js 2739   —
 *   Wi     → processJsonSchemaDefault                   jsx 2889  / js 2745   —
 *   Gi     → processJsonSchemaPrefault                  jsx 2895  / js 2751   —
 *   Ki     → processJsonSchemaCatch                     jsx 2901  / js 2758   —
 *   qi     → processJsonSchemaPipe                      jsx 2914  / js 2771   —
 *   Ji     → processJsonSchemaReadonly                  jsx 2921  / js 2778   —
 *   Yi     → processJsonSchemaOptional                  jsx 2927  / js 2784   —
 * §8 zod classic（jsx 2933–3402，101 符号）
 *   Xi     → ZodISODateTime                             jsx 2933  / js 2790   —
 *   Zi     → isoDateTime                                jsx 2936  / js 2793   —
 *   Qi     → ZodISODate                                 jsx 2939  / js 2796   —
 *   $i     → isoDate                                    jsx 2942  / js 2799   —
 *   ea     → ZodISOTime                                 jsx 2945  / js 2802   —
 *   ta     → isoTime                                    jsx 2948  / js 2805   —
 *   na     → ZodISODuration                             jsx 2951  / js 2808   —
 *   ra     → isoDuration                                jsx 2954  / js 2811   —
 *   ia     → ZodErrorInternals                          jsx 2957  / js 2814   —
 *   S      → ZodError                                   jsx 2983  / js 2838   —
 *   aa     → parseImpl                                  jsx 2986  / js 2839   —
 *   oa     → parseAsyncImpl                             jsx 2987  / js 2840   —
 *   sa     → safeParseImpl                              jsx 2988  / js 2841   —
 *   ca     → safeParseAsyncImpl                         jsx 2989  / js 2842   —
 *   la     → encodeImpl                                 jsx 2990  / js 2843   —
 *   ua     → decodeImpl                                 jsx 2991  / js 2844   —
 *   da     → encodeAsyncImpl                            jsx 2992  / js 2845   —
 *   fa     → decodeAsyncImpl                            jsx 2993  / js 2846   —
 *   pa     → safeEncodeImpl                             jsx 2994  / js 2847   —
 *   ma     → safeDecodeImpl                             jsx 2995  / js 2848   —
 *   ha     → safeEncodeAsyncImpl                        jsx 2996  / js 2849   —
 *   ga     → safeDecodeAsyncImpl                        jsx 2997  / js 2850   —
 *   C      → ZodType                                    jsx 2998  / js 2851   —
 *   _a     → _ZodString                                 jsx 3036  / js 2931   —
 *   va     → ZodString                                  jsx 3041  / js 2953   —
 *   w      → zString                                    jsx 3044  / js 2984  ★Es
 *   T      → ZodStringFormat                            jsx 3047  / js 2987   —
 *   ya     → ZodEmail                                   jsx 3050  / js 2990   —
 *   ba     → ZodGUID                                    jsx 3053  / js 2993   —
 *   xa     → ZodUUID                                    jsx 3056  / js 2996   —
 *   Sa     → ZodURL                                     jsx 3059  / js 2999   —
 *   Ca     → ZodEmoji                                   jsx 3062  / js 3002   —
 *   wa     → ZodNanoID                                  jsx 3065  / js 3005   —
 *   Ta     → ZodCUID                                    jsx 3068  / js 3008   —
 *   Ea     → ZodCUID2                                   jsx 3071  / js 3011   —
 *   Da     → ZodULID                                    jsx 3074  / js 3014   —
 *   Oa     → ZodXID                                     jsx 3077  / js 3017   —
 *   ka     → ZodKSUID                                   jsx 3080  / js 3020   —
 *   Aa     → ZodIPv4                                    jsx 3083  / js 3023   —
 *   ja     → ZodIPv6                                    jsx 3086  / js 3026   —
 *   Ma     → ZodCIDRv4                                  jsx 3089  / js 3029   —
 *   Na     → ZodCIDRv6                                  jsx 3092  / js 3032   —
 *   Pa     → ZodBase64                                  jsx 3095  / js 3035   —
 *   Fa     → ZodBase64URL                               jsx 3098  / js 3038   —
 *   Ia     → ZodE164                                    jsx 3101  / js 3041   —
 *   La     → ZodJWT                                     jsx 3104  / js 3044   —
 *   Ra     → ZodNumber                                  jsx 3107  / js 3047   —
 *   E      → zNumber                                    jsx 3112  / js 3073  ★Cs
 *   za     → ZodNumberFormat                            jsx 3115  / js 3076   —
 *   Ba     → intCheck                                   jsx 3118  / js 3079   —
 *   Va     → ZodBoolean                                 jsx 3121  / js 3082   —
 *   D      → zBoolean                                   jsx 3124  / js 3085  ★ys
 *   Ha     → ZodUndefined                               jsx 3127  / js 3088   —
 *   Ua     → zUndefined                                 jsx 3130  / js 3091   —
 *   Wa     → ZodUnknown                                 jsx 3133  / js 3094   —
 *   O      → zUnknown                                   jsx 3136  / js 3097  ★Os
 *   Ga     → ZodNever                                   jsx 3139  / js 3100   —
 *   Ka     → zNever                                     jsx 3142  / js 3103  ★Ss
 *   qa     → ZodDate                                    jsx 3145  / js 3106   —
 *   Ja     → zDate                                      jsx 3150  / js 3116   —
 *   Ya     → ZodArray                                   jsx 3153  / js 3119   —
 *   k      → zArray                                     jsx 3156  / js 3130  ★vs
 *   Xa     → ZodObject                                  jsx 3159  / js 3133   —
 *   A      → zObject                                    jsx 3177  / js 3152  ★ws
 *   Za     → ZodUnion                                   jsx 3184  / js 3155   —
 *   j      → zUnion                                     jsx 3187  / js 3161  ★Ds
 *   Qa     → ZodDiscriminatedUnion                      jsx 3194  / js 3164   —
 *   M      → zDiscriminatedUnion                        jsx 3197  / js 3167  ★bs
 *   $a     → ZodIntersection                            jsx 3205  / js 3170   —
 *   eo     → zIntersection                              jsx 3208  / js 3173   —
 *   to     → ZodRecord                                  jsx 3215  / js 3176   —
 *   N      → zRecord                                    jsx 3218  / js 3183  ★Ts
 *   no     → looseRecord                                jsx 3226  / js 3186   —
 *   ro     → ZodEnum                                    jsx 3235  / js 3190   —
 *   P      → zEnum                                      jsx 3260  / js 3212  ★_s
 *   io     → ZodLiteral                                 jsx 3267  / js 3219   —
 *   F      → zLiteral                                   jsx 3275  / js 3232  ★xs
 *   ao     → ZodTransform                               jsx 3282  / js 3235   —
 *   oo     → zTransform                                 jsx 3295  / js 3256   —
 *   so     → ZodOptional                                jsx 3301  / js 3259   —
 *   co     → zOptional                                  jsx 3304  / js 3265   —
 *   lo     → ZodExactOptional                           jsx 3310  / js 3268   —
 *   uo     → zExactOptional                             jsx 3313  / js 3274   —
 *   fo     → ZodNullable                                jsx 3319  / js 3277   —
 *   po     → zNullable                                  jsx 3322  / js 3283   —
 *   mo     → ZodDefault                                 jsx 3328  / js 3286   —
 *   ho     → zDefault                                   jsx 3331  / js 3293   —
 *   go     → ZodPrefault                                jsx 3340  / js 3302   —
 *   _o     → zPrefault                                  jsx 3343  / js 3308   —
 *   vo     → ZodNonOptional                             jsx 3352  / js 3317   —
 *   yo     → zNonOptional                               jsx 3355  / js 3323   —
 *   bo     → ZodCatch                                   jsx 3362  / js 3326   —
 *   xo     → zCatch                                     jsx 3365  / js 3333   —
 *   So     → ZodPipe                                    jsx 3372  / js 3336   —
 *   Co     → zPipe                                      jsx 3375  / js 3343   —
 *   wo     → ZodReadonly                                jsx 3382  / js 3346   —
 *   To     → zReadonly                                  jsx 3385  / js 3352   —
 *   Eo     → ZodCustom                                  jsx 3391  / js 3355   —
 *   Do     → refine                                     jsx 3394  / js 3358   —
 *   Oo     → superRefine                                jsx 3397  / js 3361   —
 *   ko     → transformPipe                              jsx 3400  / js 3364   —
 * §9 first-party 问题码/browser-use（jsx 3403–3864，38 符号）
 *   Ao     → ISSUE_CODES                                jsx 3403  / js 3367  ★gs
 *   jo     → emptyNamespaceResidue                      jsx 3416  / js 3380   —
 *   Mo     → BROWSER_VIEWPORT_LIMITS                    jsx 3418  / js 3382  ★hs
 *   No     → browserViewportSchema                      jsx 3424  / js 3383   —
 *   Po     → browserViewportBoundsSchema                jsx 3428  / js 3384   —
 *   Fo     → clientModeEnum                             jsx 3433  / js 3393   —
 *   Io     → browserErrorCodeEnum                       jsx 3441  / js 3401   —
 *   Lo     → browserPageStateSchema                     jsx 3442  / js 3412   —
 *   Ro     → mouseButtonEnum                            jsx 3452  / js 3422   —
 *   zo     → keyboardModifierEnum                       jsx 3453  / js 3423   —
 *   Bo     → pointSchema                                jsx 3454  / js 3424   —
 *   Vo     → locatorOperationEnum                       jsx 3458  / js 3425   —
 *   Ho     → locatorModifierEnum                        jsx 3459  / js 3443   —
 *   Uo     → timeoutMsSchema                            jsx 3460  / js 3444   —
 *   Wo     → selectOptionSchema                         jsx 3461  / js 3445   —
 *   Go     → playwrightActionSchema                     jsx 3466  / js 3455   —
 *   Ko     → browserRequestSchema                       jsx 3524  / js 3509   —
 *   qo     → browserBackendTypeEnum                     jsx 3724  / js 3654   —
 *   Jo     → browserCapabilityRefSchema                 jsx 3725  / js 3655   —
 *   Yo     → browserDescriptorSchema                    jsx 3729  / js 3656   —
 *   Xo     → sessionContextEnum                         jsx 3741  / js 3665   —
 *   Zo     → rectSchema                                 jsx 3758  / js 3681   —
 *   Qo     → domElementSchema                           jsx 3764  / js 3682   —
 *   $o     → domNodeSchema                              jsx 3781  / js 3699   —
 *   es     → domSnapshotSchema                          jsx 3791  / js 3709   —
 *   ts     → browserTabSchema                           jsx 3799  / js 3717   —
 *   ns     → userTabSchema                              jsx 3807  / js 3725   —
 *   rs     → browserDialogSchema                        jsx 3814  / js 3732   —
 *   is     → browserMetaSchema                          jsx 3819  / js 3737   —
 *   as     → browserResultSchema                        jsx 3829  / js 3747   —
 *   os     → ASSET_INSTALL_MODES                        jsx 3851  / js 3766   —
 *   ss     → DEFAULT_ASSET_INSTALL_MODE                 jsx 3852  / js 3767  ★ms
 *   cs     → FILE_TRANSFER_CAPABILITIES                 jsx 3853  / js 3768   —
 *   ls     → ALL_FILE_TRANSFER_CAPABILITIES             jsx 3854  / js 3769   —
 *   us     → REMOTE_FILE_TRANSFER_CAPABILITIES          jsx 3855  / js 3770   —
 *   ds     → fileTransferCapabilitySet                  jsx 3857  / js 3772   —
 *   fs     → listFileTransferCapabilities               jsx 3859  / js 3774  ★ps
 *   ps     → isFileTransferCapability                   jsx 3862  / js 3777   —
 * §10 first-party agent CLI/用量（jsx 3865–3949，15 符号）
 *   I      → agentCliProviderEnum                       jsx 3865  / js 3780   —
 *   ms     → USAGE_REPORT_RANGES                        jsx 3866  / js 3781  ★fs
 *   hs     → favoriteModelSchema                        jsx 3867  / js 3782   —
 *   gs     → usageSummarySchema                         jsx 3872  / js 3783   —
 *   _s     → usageHeatmapDaySchema                      jsx 3891  / js 3802   —
 *   vs     → usageHeatmapWeekSchema                     jsx 3898  / js 3809   —
 *   ys     → usageHeatmapSchema                         jsx 3902  / js 3810   —
 *   bs     → usageDailyModelSchema                      jsx 3908  / js 3811   —
 *   xs     → usageDailyModelUsageSchema                 jsx 3912  / js 3812   —
 *   Ss     → usageModelDetailSchema                     jsx 3916  / js 3813   —
 *   Cs     → usageToolStatsSchema                       jsx 3924  / js 3821   —
 *   ws     → DEFAULT_AGENT_NAME                         jsx 3942  / js 3839  ★ls
 *   Ts     → BUILTIN_AGENT_CLI_PROVIDERS                jsx 3943  / js 3840   —
 *   Es     → resolveDefaultAgentCliProvider             jsx 3944  / js 3841  ★ds
 *   Ds     → isGlmAgentCliProvider                      jsx 3947  / js 3844  ★us
 * §11 first-party 会话/消息协议（jsx 3950–4290，38 符号）
 *   L      → nonEmptyString                             jsx 3950  / js 3847   —
 *   R      → unknownRecord                              jsx 3951  / js 3848   —
 *   z      → timestampMs                                jsx 3952  / js 3849   —
 *   Os     → clientModeEnum2                            jsx 3953  / js 3850   —
 *   ks     → messageVisibilityEnum                      jsx 3954  / js 3851   —
 *   As     → syntheticSourceEnum                        jsx 3955  / js 3852   —
 *   B      → workspaceRefSchema                         jsx 3956  / js 3864   —
 *   js     → permissionDecisionEnum                     jsx 3962  / js 3870   —
 *   Ms     → permissionBehaviorEnum                     jsx 3963  / js 3871   —
 *   Ns     → permissionRuleSchema                       jsx 3964  / js 3872   —
 *   Ps     → addRulesUpdateSchema                       jsx 3968  / js 3873   —
 *   Fs     → permissionResponseSchema                   jsx 3973  / js 3874  ★ss
 *   V      → modelRefSchema                             jsx 3979  / js 3880   —
 *   Is     → sessionModeEnum                            jsx 3984  / js 3881   —
 *   Ls     → sessionStatusEnum                          jsx 3985  / js 3882   —
 *   Rs     → sessionKindEnum                            jsx 3986  / js 3883   —
 *   zs     → goalTargetSchema                           jsx 3987  / js 3892   —
 *   Bs     → goalVerificationResultSchema               jsx 4002  / js 3907   —
 *   Vs     → goalVerificationTimelineSchema             jsx 4007  / js 3908   —
 *   Hs     → sessionDescriptorSchema                    jsx 4022  / js 3923   —
 *   Us     → subagentOriginSchema                       jsx 4038  / js 3939  ★os
 *   Ws     → messageTimeSchema                          jsx 4049  / js 3950   —
 *   Gs     → tokenUsageSchema                           jsx 4053  / js 3951   —
 *   Ks     → messageSemanticsSchema                     jsx 4063  / js 3958   —
 *   qs     → messageInfoSchema                          jsx 4072  / js 3979   —
 *   H      → partBaseSchema                             jsx 4105  / js 4012   —
 *   Js     → toolStateSchema                            jsx 4110  / js 4013   —
 *   Ys     → labeledModelRefSchema                      jsx 4136  / js 4040   —
 *   Xs     → timeRangeSchema                            jsx 4139  / js 4041   —
 *   Zs     → timelinePartSchema                         jsx 4143  / js 4042   —
 *   Qs     → messagePartSchema                          jsx 4180  / js 4075   —
 *   $s     → messageWithPartsSchema                     jsx 4239  / js 4121   —
 *   ec     → apiRetrySchema                             jsx 4243  / js 4122   —
 *   tc     → cacheStatsSchema                           jsx 4251  / js 4130  ★cs
 *   nc     → contextBreakdownSchema                     jsx 4262  / js 4141  ★as
 *   rc     → contextUsageSchema                         jsx 4266  / js 4155   —
 *   ic     → sessionStateEventSchema                    jsx 4276  / js 4162   —
 *   ac     → extractTextFromParts                       jsx 4288  / js 4174   —
 * §12 first-party bots/WSL/端点（jsx 4291–4509，37 符号）
 *   oc     → BOT_PROVIDER_IDS                           jsx 4291  / js 4180   —
 *   sc     → imBindingSchema                            jsx 4292  / js 4181  ★is
 *   cc     → isFeishuOrLark                             jsx 4298  / js 4187  ★ns
 *   lc     → BOT_REPLY_MODES                            jsx 4301  / js 4190   —
 *   uc     → BOTS_STREAM_TIMEOUT_MS                     jsx 4302  / js 4191  ★Zo
 *   dc     → BOTS_TASK_CHANNEL                          jsx 4303  / js 4192  ★Qo
 *   fc     → BOTS_TASK_STREAM_CHANNEL                   jsx 4304  / js 4193  ★$o
 *   pc     → botAllowedCommandsSchema                   jsx 4305  / js 4194   —
 *   mc     → botCurrentOptionsSchema                    jsx 4317  / js 4206   —
 *   hc     → botDraftOptionsSchema                      jsx 4325  / js 4214   —
 *   gc     → botQuestionOptionSchema                    jsx 4331  / js 4220   —
 *   _c     → botQuestionSchema                          jsx 4336  / js 4221   —
 *   vc     → botElicitationSchema                       jsx 4342  / js 4222   —
 *   yc     → botConfigSchema                            jsx 4358  / js 4237   —
 *   bc     → DEFAULT_BOT_REPLY_MODE                     jsx 4403  / js 4290  ★es
 *   xc     → availableReplyModesForProvider             jsx 4404  / js 4291  ★ts
 *   Sc     → resolveBotReplyMode                        jsx 4407  / js 4294  ★rs
 *   Cc     → isValidWslUser                             jsx 4412  / js 4299  ★Xo
 *   wc     → containsControlCharacter                   jsx 4416  / js 4310   —
 *   Tc     → wslUserSchema                              jsx 4423  / js 4317   —
 *   Ec     → ZCODE_PRODUCTION_ORIGIN                    jsx 4426  / js 4321   —
 *   Dc     → ZCODE_TEST_ORIGIN                          jsx 4427  / js 4322   —
 *   Oc     → BIGMODEL_PRODUCTION_ORIGIN                 jsx 4428  / js 4323   —
 *   kc     → BIGMODEL_DEV_ORIGIN                        jsx 4429  / js 4324   —
 *   Ac     → REMOTE_V4_MIN_APP_VERSION                  jsx 4430  / js 4325   —
 *   jc     → isAppVersionAbove                          jsx 4431  / js 4326   —
 *   Mc     → readEnvValue                               jsx 4445  / js 4345   —
 *   Nc     → normalizeEndpointOrigin                    jsx 4448  / js 4348   —
 *   Pc     → resolveZcodeOriginByEnv                    jsx 4455  / js 4356   —
 *   Fc     → resolveBuildEnvFromVars                    jsx 4462  / js 4363   —
 *   Ic     → resolveZcodeEndpointOrigin                 jsx 4465  / js 4366   —
 *   Lc     → resolveZcodeEndpointConfig                 jsx 4474  / js 4375  ★Yo
 *   Rc     → resolveBigmodelApiBaseUrl                  jsx 4477  / js 4378   —
 *   zc     → buildBigmodelApiUrl                        jsx 4483  / js 4387  ★Ko
 *   Bc     → codingPlanPersonalOverviewUrl              jsx 4487  / js 4391  ★qo
 *   Vc     → codingPlanTeamPlansUrl                     jsx 4490  / js 4394  ★Jo
 *   Hc     → buildZcodeEndpointConfig                   jsx 4493  / js 4397   —
 * §13 first-party 设置/迁移（jsx 4510–4830，27 符号）
 *   U      → settingsNonEmptyString                     jsx 4510  / js 4414   —
 *   Uc     → localeEnum                                 jsx 4511  / js 4415   —
 *   Wc     → localePreferenceEnum                       jsx 4512  / js 4416   —
 *   Gc     → interactionBehaviorEnum                    jsx 4513  / js 4417   —
 *   Kc     → updateChannelEnum                          jsx 4514  / js 4418   —
 *   qc     → zoomLevelSchema                            jsx 4515  / js 4419   —
 *   Jc     → integratedTerminalShellSchema              jsx 4516  / js 4420   —
 *   Yc     → builtinAgentCliProvidersSchema             jsx 4525  / js 4424   —
 *   Xc     → providerFamilyModesSchema                  jsx 4526  / js 4425   —
 *   Zc     → providerFamilyDomainEnum                   jsx 4530  / js 4429   —
 *   Qc     → providerFamilySelectedKeysSchema           jsx 4531  / js 4430   —
 *   $c     → isRepoSnapshotIndexingUserEnabled          jsx 4535  / js 4431  ★Go
 *   el     → releaseNotesSchema                         jsx 4538  / js 4434   —
 *   tl     → skippedUpdateVersionsSchema                jsx 4548  / js 4441   —
 *   nl     → remoteTargetSchema                         jsx 4549  / js 4442   —
 *   rl     → workspaceSessionEntrySchema                jsx 4577  / js 4466   —
 *   il     → webRemoteRelayDeviceSchema                 jsx 4591  / js 4483   —
 *   al     → webRemoteEnabledContextSchema              jsx 4594  / js 4484   —
 *   ol     → zcodeEndpointOriginSchema                  jsx 4599  / js 4485   —
 *   sl     → migrateZcodeEndpointOrigin                 jsx 4608  / js 4495   —
 *   cl     → migrateOptimizeAgentExperience             jsx 4623  / js 4504   —
 *   ll     → migrateCloseToTrayOnWindows                jsx 4632  / js 4511   —
 *   ul     → migrateLocalePreference                    jsx 4641  / js 4518   —
 *   dl     → remoteWorkspaceHistoryEntrySchema          jsx 4651  / js 4525   —
 *   fl     → migrateEnabledBuiltinAgentCliProviders     jsx 4661  / js 4535   —
 *   pl     → stripResourcePackagesFromTarget            jsx 4667  / js 4540   —
 *   ml     → migrateLastWorkspaceSession                jsx 4677  / js 4547   —
 * §14 first-party 供应商/模型注册表（jsx 4831–4901，24 符号）
 *   hl     → approvalPolicyEnum                         jsx 4831  / js 4720   —
 *   gl     → BUILTIN_PROVIDER_PREFIX                    jsx 4832  / js 4732   —
 *   W      → providerIds                                jsx 4833  / js 4733  ★mo
 *   _l     → isBuiltinProviderId                        jsx 4842  / js 4742  ★Eo
 *   vl     → isZaiPlanProviderId                        jsx 4845  / js 4753  ★Po
 *   yl     → isStartPlanProviderId                      jsx 4848  / js 4756  ★No
 *   bl     → isCodingPlanProviderId                     jsx 4851  / js 4759  ★Do
 *   xl     → GLM_MODEL_IDS                              jsx 4854  / js 4762  ★vo
 *   Sl     → GLM_REASONING_LEVELS                       jsx 4855  / js 4763  ★ho
 *   Cl     → GLM_DEFAULT_MODEL_PREFIX                   jsx 4856  / js 4764   —
 *   wl     → GLM_DATED_MODEL_REGEX                      jsx 4857  / js 4765   —
 *   Tl     → isGlmModelId                               jsx 4858  / js 4766  ★Oo
 *   El     → CLAUDE_TO_GLM_MODEL_MAP                    jsx 4863  / js 4771  ★yo
 *   Dl     → modelAliasOverrideSchema                   jsx 4871  / js 4774   —
 *   Ol     → apiFormatEnum                              jsx 4879  / js 4777   —
 *   kl     → wireFormatEnum                             jsx 4880  / js 4778   —
 *   Al     → providerKindEnum                           jsx 4881  / js 4779   —
 *   jl     → devProviderIdEnum                          jsx 4882  / js 4780   —
 *   Ml     → modalityEnum                               jsx 4883  / js 4781   —
 *   Nl     → envPathSchema                              jsx 4884  / js 4782   —
 *   Pl     → envOverrideSchema                          jsx 4887  / js 4783   —
 *   Fl     → reasoningLevelConfigSchema                 jsx 4893  / js 4784   —
 *   Il     → endpointsByKindSchema                      jsx 4897  / js 4785   —
 *   Ll     → providerEndpointsSchema                    jsx 4898  / js 4786   —
 * ============================================================================
 */
