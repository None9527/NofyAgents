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
 *   〔A0-S4-1：本节 15 符号实体已迁 lib/locale.ts、lib/workspaceUtils.ts、lib/buildEnv.ts、lib/errorUtils.ts；文件体保留 re-export，映射信息不变〕
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
 *   oe  → $getEnumValues                 (170)  —
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
 *   Ae  → $merge                         (370)  —
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
 *   Ke  → makeSafeParseFn                (161926)  —
 *   qe  → safeParseReal                  (161949)  —    = Ke($ZodRealError)；~standard 用
 *   Je  → makeSafeParseAsyncFn           (587)  —
 *   Ye  → safeParseAsyncReal             (128200)  —    = Je($ZodRealError)
 *   Xe/Ze/Qe/$e → makeEncodeFn/makeDecodeFn/makeEncodeAsyncFn/makeDecodeAsyncFn (606/614/615/623)
 *   et/tt/nt/rt → makeSafeEncodeFn/makeSafeDecodeFn/makeSafeEncodeAsyncFn/makeSafeDecodeAsyncFn (624/632/633/641)
 * §4 zod core — 正则表（jsx 642–690，同 §3 var 链）
 *   it/at/ot/st/ct/lt/ut → cuid/cuid2/ulid/xid/ksuid/nanoid/isoDuration 正则 (642–648)
 *   dt  → uuidGenericRegex               (156080)  —    rfc4122
 *   ft  → uuidVersionedRegex             (650)  —    (version?) → RegExp
 *   pt  → emailRegex                     (651)  —
 *   mt/ht → emojiRegexSource/emojiRegex  (652/653)
 *   gt/_t/vt/yt → ipv4/ipv6/ipv4Cidr/ipv6Cidr 正则 (656–659)
 *   bt/xt/St → base64/base64url/e164 正则 (660–662)
 *   Ct/wt → isoDateSource/isoDateRegex  (663/664)
 *   Tt/Et → isoTimeSource/isoTimeRegex  (665/669)
 *   Dt  → isoDateTimeRegex               (609)  —
 *   Ot  → makeStringLengthRegex          (681)  —
 *   kt/At/jt/Mt/Nt/Pt → integer/number/boolean/undefined/lowercase/uppercase 正则 (685–690)
 * §5 zod core — checks（jsx 691–1022）
 *   _   → $ZodCheck                      (691)  —
 *   Ft  → CHECK_ORIGIN_BY_VALUE_TYPE     (213394)  —
 *   It/Lt/Rt/zt → $ZodCheckLessThan/$ZodCheckGreaterThan/$ZodCheckMultipleOf/$ZodCheckNumberFormat (700/719/738/754)
 *   Bt/Vt/Ht → $ZodCheckMaxLength/$ZodCheckMinLength/$ZodCheckLengthEquals (818/841/864)
 *   Ut/Wt → $ZodCheckStringFormat/$ZodCheckRegex (895/914)
 *   Gt/Kt → $ZodCheckLowerCase/$ZodCheckUpperCase (927/930)
 *   qt/Jt/Yt → $ZodCheckIncludes/$ZodCheckStartsWith/$ZodCheckEndsWith (933/952/970)
 *   Xt  → $ZodCheckOverwrite             (988)  —
 *   Zt  → JitCodeBuilder                 (90769)  —    缩进/编译 Function 的代码写入器
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
 *   ia  → ZodErrorInternals              (2814) —    format/flatten/addIssue(s)/isEmpty
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
 *   no  → looseRecord                     (3186) —
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
 *   Lo  → browserPageStateSchema         (1371)
 *   Ro/zo/Bo → mouseButtonEnum/keyboardModifierEnum/pointSchema (3452/3453/3454)
 *   Vo/Ho/Uo/Wo → locatorOperationEnum/locatorModifierEnum/timeoutMsSchema/selectOptionSchema (3458/3459/3460/3461)
 *   Go  → playwrightActionSchema         (1928) —    domSnapshot…locator 10 分支
 *   Ko  → browserRequestSchema           (1941) —    navigate…list 45 分支
 *   qo/Jo/Yo → browserBackendTypeEnum/browserCapabilityRefSchema/browserDescriptorSchema (3724/3725/3729)
 *   Xo  → sessionContextEnum             (2051) —    live | cached
 *   Zo/Qo/$o/es/ts/ns/rs/is/as → rectSchema/domElementSchema/domNodeSchema/domSnapshotSchema/browserTabSchema/userTabSchema/browserDialogSchema/browserMetaSchema/browserResultSchema (3758–3829)
 *   os/ss → ASSET_INSTALL_MODES/DEFAULT_ASSET_INSTALL_MODE (3851/3852) ★ms/—
 *   cs/ls/us → FILE_TRANSFER_CAPABILITIES/ALL_FILE_TRANSFER_CAPABILITIES/REMOTE_FILE_TRANSFER_CAPABILITIES (3853/3854/3855)
 *   ds/fs/ps → fileTransferCapabilitySet/listFileTransferCapabilities/isFileTransferCapability (3857/3859/3862) ★ps/—
 * §10 first-party — agent CLI 与用量 schema（jsx 3865–3949）
 *   I   → agentCliProviderEnum           (3865) —    claude/opencode/gemini/codex/glm
 *   ms  → USAGE_REPORT_RANGES            (2683) ★fs  ['7d','30d']
 *   hs/gs/_s/vs/ys/bs/xs/Ss/Cs → 用量统计 schema ×9（收藏模型/汇总/日档/周档/热图/日模型/日模型用量/模型明细/工具统计）(3867–3921)
 *   ws  → DEFAULT_AGENT_NAME             (3942) ★ls  'zcodeAgent'
 *   Ts  → BUILTIN_AGENT_CLI_PROVIDERS    (2751) —    ['glm']
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
 *   $c  → isRepoSnapshotIndexingUserEnabled (4431) ★Go
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
 * 二、外部依赖：npm zod@4.3.6（A0-S3a：§2–§8 vendored 库体改 npm 薄层接入，
 *     见下方 §2–§8 薄层段）；其余零依赖（React 亦不使用）。
 *     类型脚手架仅服务 strict tsc，运行时语义与原件逐字一致。
 * ============================================================================
 */

import * as zod from 'zod';

/* ============================================================================
 * §0 类型脚手架（zod 内部面以 any 承载；运行时行为零改动）〔A1-R186〕★本节注（块 @275-277）所辖之节（自块尾至 @294）今**失全部代码**：节内 16 行代码皆落在本批被删区间内、存活 0 ⇒ 本节只剩墓碑与注记。原文逐字保留、只增不改（骑手只增文、不删旧字）。
 * ==========================================================================*/

/* ── tombstone〔A1-R186〕死界面普查批第五批（modules/SrcSharedA.tsx：4 面／16 行，本批该文件共 1 碑）：本地 type ZodInst@279-279（1 行）、type ZodDef@280-280（1 行）、interface ParsePayload@281-286（6 行）、interface ParseContext@287-294（8 行）纯删，16 行等行墓碑在原位。
 *    判据〔A1-R176 立／A1-R183 v7／A1-R184 v8〕：一面为死当且仅当 Ⓐ本文件内无代码位读者落在其自身定义跨度之外，且 Ⓑ不带 export（或带 export 而无一家导入方把该名作 specifier 拉取）；级联＝读者全落在已判死之面内者亦判死，迭代至不动点（本批 3 轮收敛，全树 1924 面中得死面 66）。量测一律用 token 级 code-only 掩码 v8（单点模块导入、13 形自检 + 9 负对照），禁行首前缀法〔A1-R174 沉淀①〕。
 *    type ZodInst：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；未 export ⇒ 跨文件读者结构性不可能。
 *    type ZodDef：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；未 export ⇒ 跨文件读者结构性不可能。
 *    interface ParsePayload：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；未 export ⇒ 跨文件读者结构性不可能。
 *    interface ParseContext：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；未 export ⇒ 跨文件读者结构性不可能。
 *    同名定义站：ParseContext 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。
 *    同名定义站：ParsePayload 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。
 *    同名定义站：ZodDef 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。
 *    同名定义站：ZodInst 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。
 *    邻接注记裁定（±4 行窗口）：@276／@319 之注记皆**存活**、其原文逐字保留并各带同批骑手（骑手只增文、不删旧字），已断言与 HEAD 之差异仅限骑手所增。
 *    型-only 批：interface 与 type 别名皆非台账对象〔A1-R164 登记〕⇒ 台账 588/571/510 不得变动（反向哨兵：若变动即证动了 declare、须立即停批核查）；esbuild 擦除全部型构造 ⇒ 三 bundle 必逐字节全等〔A1-R173 沉淀③／A1-R174 沉淀⑥，可用于预测〕。
 *    原界面共 16 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 16 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 16 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    净零行：本碑 16 行置换原 16 行，文件行数 2739 不变、零重锚（本文件 SrcSharedA 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 46 条（原始发射 61）；带行号之记录 61 条，其中落在首个编辑点 @279 及其后者 59 条 ⇒ **强制净零行**）。★口径须自载：六形係**下界**——R185 查出第七形「Name 型面（NNN）」，本批之骑手网另以 P0 裸名谓词兜底；两口径同判「净零行强制」故结论不受影响〔A1-R173 沉淀⑧〕。 ── */
/* ============================================================================
 * §1 first-party 基础助手（jsx 1–141）—— A0-S4-1：实体代码已整体迁入 lib/
 *   DEFAULT_LOCALE                                        → ../lib/locale.ts
 *   WorkspaceDescriptor + sanitizeWorkspaceDescriptor + parsePathRootPrefix +
 *     normalizeTraversalPath + resolveSshAuthMethod + sshTargetIdentityKey
 *                                                         → ../lib/workspaceUtils.ts
 *   normalizeBuildEnv + RESOLVED_BUILD_ENV + jsx 93 探针  → ../lib/buildEnv.ts
 *   isNonNullObject + toPrimitiveString + unwrapErrorPayload +
 *     FILE_LOCK_TIMEOUT_CODE + stringifyErrorValue + extractErrorInfo +
 *     isFileLockTimeoutError + jsx 139–141 冻结语句       → ../lib/errorUtils.ts
 *   导出面不变（Ps/Ns/Ms/js/As/ks）；全部导入方（含 SrcSharedB §0、services、
 *   rendererEntry、intlProvider）无需改动。映射见头块 §1 与尾符号表（原样保留）。
 * ==========================================================================*/
export { DEFAULT_LOCALE } from '../lib/locale';
export { sanitizeWorkspaceDescriptor, sshTargetIdentityKey } from '../lib/workspaceUtils';
export { RESOLVED_BUILD_ENV } from '../lib/buildEnv';
export { extractErrorInfo, isFileLockTimeoutError } from '../lib/errorUtils';

/* ============================================================================
 * §2–§8 zod v4.3.6 —— npm zod@4.3.6 薄层接入（A0-S3a）
 *    原 vendored 库体（jsx 142–3402，§2 构造/工具、§3 解析引擎、§4 正则表、
 *    §5 checks、§6 schemas、§7 registry/工厂/JSON Schema、§8 classic，共约
 *    3,580 行）已整体移除，运行时改由 npm zod@4.3.6（同版本）承载。
 *    此处仅保留 first-party（§9 起）与 SrcSharedB 实际消费的语义工厂名薄层：
 *    包装签名与返回（any）沿用原 $constructor→ZodInst=any 脚手架，保证下游〔A1-R186〕★本行（注块 @313-322）之散文因死界面普查批第五批而失 referent 或被证伪：命中行 @319，type ZodInst@279-279（1 行、代码位读者 0）已销账、1 行等行墓碑在 @279 原位。命中谓词 P0 裸名（被删名之词边界命中、不带旁证）；失效屏 S6 名 + 同行注册形。原文逐字保留、只增不改（骑手只增文、不删旧字）。
 *    schema 链的类型面与运行时语义逐字不变。导出面与原 §8 一致
 *    （zUndefined/zDate/looseRecord 仍经 §15 export 块转出，transformPipe 局部）。
 * ==========================================================================*/

/** jsx 3044 ★Es —— z.string（classic 工厂） */
export function zString(params?: any): any {
  return zod.string(params);
}
/** jsx 3112 ★Cs —— z.number */
export function zNumber(params?: any): any {
  return zod.number(params);
}
/** jsx 3124 ★ys —— z.boolean */
export function zBoolean(params?: any): any {
  return zod.boolean(params);
}
/** jsx 3130 —— z.undefined（经 §15 export 块导出） */
function zUndefined(params?: any): any {
  return zod.undefined(params);
}
/** jsx 3136 ★Os —— z.unknown */
export function zUnknown(): any {
  return zod.unknown();
}
/** jsx 3142 ★Ss —— z.never */
export function zNever(params?: any): any {
  return zod.never(params);
}
/** jsx 3150 —— z.date（经 §15 export 块导出） */
function zDate(params?: any): any {
  return zod.date(params);
}
/** jsx 3156 ★vs —— z.array */
export function zArray(element: any, params?: any): any {
  return zod.array(element, params);
}
/** jsx 3177 ★ws —— z.object */
export function zObject(shape?: Record<string, any>, params?: any): any {
  return zod.object(shape ?? {}, params);
}
/** jsx 3187 ★Ds —— z.union */
export function zUnion(options: any, params?: any): any {
  return zod.union(options, params);
}
/** jsx 3197 ★bs —— z.discriminatedUnion */
export function zDiscriminatedUnion(discriminator: string, options: any, params?: any): any {
  return zod.discriminatedUnion(discriminator, options, params);
}
/** jsx 3218 ★Ts —— z.record */
export function zRecord(keyType: any, valueType: any, params?: any): any {
  return zod.record(keyType, valueType, params);
}
/** jsx 3226 —— z.looseRecord（经 §15 export 块导出） */
function looseRecord(keyType: any, valueType: any, params?: any): any {
  return zod.looseRecord(keyType, valueType, params);
}
/** jsx 3260 ★_s —— z.enum */
export function zEnum(entries: any, params?: any): any {
  return zod.enum(entries, params);
}
/** jsx 3275 ★xs —— z.literal */
export function zLiteral(values: any, params?: any): any {
  return zod.literal(values, params);
}
/** jsx 3400 —— transform 后接管道（= z.transform(fn) 后接 outSchema） */
function transformPipe(fn: (value: any, ctx: any) => any, outSchema: any): any {
  return zod.pipe(zod.transform(fn), outSchema);
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
 *   〔A0-S4-1：本节 15 符号实体已迁 lib/（locale/workspaceUtils/buildEnv/errorUtils）；表映射保留，文件体保留 re-export〕
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
