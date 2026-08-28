# SrcSharedA.report — B5-10a：src-HCld2afU 共享 chunk 上半部（jsx 1–4900）全量重建

- **批次**：B5-10a（B5-FULL-DECODE-PLAN §2 第 10 行上半）
- **解码对象**：`desktop/src/src-reconstructed/renderer/assets/src-HCld2afU.jsx`（pretty 孪生，9,742 行；主口径 = jsx 行号）
- **原件参照（只读）**：`desktop/src/out/renderer/assets/src-HCld2afU.js`（10,069 行，md5 `f5edd6a1207c6d20008204829dad3923`，完成后抽验未变）
- **重建产物**：`desktop/src/src-reconstructed/modules/SrcSharedA.tsx`（6,358 行，含文件头映射表与文件尾符号表）
- **范围**：jsx 1–4900 全部顶层符号；实际收录至 `Ll`（providerEndpointsSchema）收尾的 jsx 4901（边界裁决见 §7）
- **符号总数**：567（含 53 个导出符号；§2–§8 为捆绑 **zod v4.3.6** vendored 库，§1/§9–§14 为 first-party）

## §1 结构总览

| 段 | jsx 行 | 内容 | 性质 |
|---|---|---|---|
| §1 | 1–141 | 语言常量、工作区描述符清洗、路径解析、ssh 身份键、构建环境、错误解包/文件锁超时判定 | first-party |
| §2 | 142–532 | `$constructor` traits 体系、$ZodError 族、克隆/合并/issue 工具 | vendored zod |
| §3 | 533–641 | parse/safeParse/encode/decode 同步异步 12 工厂 | vendored zod |
| §4 | 642–690 | 格式正则表（cuid…uppercase 25 项） | vendored zod |
| §5 | 691–1027 | $ZodCheck 族 15 类 + JIT 代码写入器 + `ZOD_VERSION={4,3,6}`（jsx 1023） | vendored zod |
| §6 | 1028–1990 | $ZodType 基类 + 全部核心 schema（string 格式族/number/bool/date/array/object JIT/union/intersection/record/enum/literal/transform/optional 族等） | vendored zod |
| §7 | 1991–2932 | MetadataRegistry + `$globalRegistry` + core 工厂（$string…$superRefine）+ JSON Schema 转换引擎（19 类型处理器） | vendored zod |
| §8 | 2933–3402 | classic 封装（ZodType 全方法面 + 30 类 classic schema + z* 工厂） | vendored zod |
| §9 | 3403–3858 | ISSUE_CODES、browser-use 协议 schema 群（45 分支请求并集等）、文件传输能力 | first-party |
| §10 | 3865–3949 | agent CLI 供应商枚举、用量统计 schema ×9、DEFAULT_AGENT_NAME | first-party |
| §11 | 3950–4290 | 会话/消息/部件协议 schema（权限、目标验证、时间线、上下文用量） | first-party |
| §12 | 4291–4509 | bots 协议（7 供应商、回复模式、elicitation）、WSL 用户、ZCode/BigModel 端点裁决 | first-party |
| §13 | 4510–4830 | 设置 schema 全表 + 6 步迁移管道 + 远程目标/工作区会话 | first-party |
| §14 | 4831–4901 | 审批策略枚举、providerIds（builtin: 7 键）、GLM 模型判定/映射、供应商端点 schema | first-party |

**zod vendored 口径**：§2–§8（约 3,260 行）为 zod v4.3.6 库体（版本对象 `ZOD_VERSION={major:4,minor:3,patch:6}` 锚定，jsx 1023 / js 1000）。按任务「jsx 1–4900 全部符号逐字重建」要求原样转录，语义名取 zod 上游命名（`$ZodType`/`$constructor`/`$globalRegistry` 等）；内核移植阶段可整体替换为 npm `zod@4.3.6`，不影响 §9–§14 first-party 语义。

## §2 覆盖清单（567 符号 → jsx/js 双行号）

> 双行号由 @babel/parser 分别解析孪生与原件的 AST 顶层声明符位置生成（两侧各 1,336 个顶层声明符，1:1 对应）；`★` 后为导出字母。完整表亦见 `SrcSharedA.tsx` 文件尾符号表。

### §1 first-party 助手（jsx 1–141，15 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `e` | `DEFAULT_LOCALE` | 1 | 1 | ★Ps |
| `t` | `sanitizeWorkspaceDescriptor` | 2 | 2 | ★Ns |
| `n` | `parsePathRootPrefix` | 20 | 13 | — |
| `r` | `normalizeTraversalPath` | 64 | 32 | — |
| `i` | `resolveSshAuthMethod` | 83 | 52 | — |
| `a` | `sshTargetIdentityKey` | 86 | 60 | ★Ms |
| `o` | `normalizeBuildEnv` | 89 | 70 | — |
| `s` | `RESOLVED_BUILD_ENV` | 92 | 73 | ★js |
| `c` | `isNonNullObject` | 94 | 75 | — |
| `l` | `toPrimitiveString` | 97 | 78 | — |
| `u` | `unwrapErrorPayload` | 100 | 81 | — |
| `d` | `FILE_LOCK_TIMEOUT_CODE` | 103 | 88 | — |
| `f` | `stringifyErrorValue` | 104 | 89 | — |
| `ee` | `extractErrorInfo` | 115 | 100 | ★As |
| `te` | `isFileLockTimeoutError` | 136 | 113 | ★ks |

### §2 zod core 构造/工具（vendored）（jsx 142–532，46 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `p` | `$constructor` | 142 | 117 | — |
| `ne` | `$ZodAsyncError` | 180 | 155 | — |
| `re` | `$ZodEncodeError` | 185 | 160 | — |
| `ie` | `$globalConfig` | 190 | 166 | — |
| `ae` | `$getGlobalConfig` | 191 | 167 | — |
| `oe` | `$getEnumValues` | 194 | 170 | — |
| `se` | `jsonStringifyReplacer` | 198 | 176 | — |
| `ce` | `$lazy` | 201 | 179 | — |
| `le` | `nullish` | 214 | 190 | — |
| `ue` | `stripRegexAnchors` | 217 | 193 | — |
| `de` | `decimalModulo` | 222 | 198 | — |
| `fe` | `EVALUATING_SENTINEL` | 233 | 213 | — |
| `m` | `$lazyDefine` | 234 | 214 | — |
| `pe` | `defineWritableProperty` | 248 | 226 | — |
| `me` | `$mergeDefs` | 256 | 229 | — |
| `he` | `jsonStringify` | 261 | 234 | — |
| `ge` | `slugify` | 264 | 237 | — |
| `_e` | `captureStackTrace` | 267 | 245 | — |
| `ve` | `isObject` | 268 | 246 | — |
| `ye` | `$canUseFunction` | 271 | 249 | — |
| `be` | `isPlainObject` | 279 | 257 | — |
| `xe` | `shallowClone` | 286 | 264 | — |
| `Se` | `PRIMITIVE_TYPES` | 291 | 267 | — |
| `Ce` | `escapeRegex` | 292 | 268 | — |
| `h` | `clone` | 295 | 271 | — |
| `g` | `normalizeCheckParams` | 299 | 275 | — |
| `we` | `optionalKeys` | 314 | 285 | — |
| `Te` | `NUMBER_FORMAT_LIMITS` | 317 | 290 | — |
| `Ee` | `$pick` | 324 | 297 | — |
| `De` | `$omit` | 340 | 317 | — |
| `Oe` | `$extend` | 358 | 337 | — |
| `ke` | `$safeExtend` | 375 | 358 | — |
| `Ae` | `$merge` | 387 | 370 | — |
| `je` | `$partial` | 402 | 385 | — |
| `Me` | `$nonpartial` | 426 | 407 | — |
| `Ne` | `$shouldAbort` | 447 | 425 | — |
| `Pe` | `prefixIssuePath` | 452 | 430 | — |
| `Fe` | `resolveMessageString` | 458 | 436 | — |
| `Ie` | `$cleanIssue` | 461 | 439 | — |
| `Le` | `resolveOriginKind` | 468 | 455 | — |
| `Re` | `$issue` | 471 | 458 | — |
| `ze` | `$ZodErrorInternals` | 482 | 462 | — |
| `Be` | `$ZodError` | 494 | 469 | — |
| `Ve` | `$ZodRealError` | 495 | 470 | — |
| `He` | `$flattenError` | 498 | 471 | — |
| `Ue` | `$treeifyError` | 507 | 480 | — |

### §3 zod core 解析引擎（vendored）（jsx 533–641，14 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `We` | `makeParseFn` | 533 | 503 | — |
| `Ge` | `makeParseAsyncFn` | 550 | 513 | — |
| `Ke` | `makeSafeParseFn` | 566 | 522 | — |
| `qe` | `safeParseReal` | 586 | 530 | — |
| `Je` | `makeSafeParseAsyncFn` | 587 | 531 | — |
| `Ye` | `safeParseAsyncReal` | 605 | 541 | — |
| `Xe` | `makeEncodeFn` | 606 | 542 | — |
| `Ze` | `makeDecodeFn` | 614 | 546 | — |
| `Qe` | `makeEncodeAsyncFn` | 615 | 547 | — |
| `$e` | `makeDecodeAsyncFn` | 623 | 551 | — |
| `et` | `makeSafeEncodeFn` | 624 | 552 | — |
| `tt` | `makeSafeDecodeFn` | 632 | 556 | — |
| `nt` | `makeSafeEncodeAsyncFn` | 633 | 557 | — |
| `rt` | `makeSafeDecodeAsyncFn` | 641 | 561 | — |

### §4 zod core 正则表（vendored）（jsx 642–690，31 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `it` | `cuidRegex` | 642 | 562 | — |
| `at` | `cuid2Regex` | 643 | 563 | — |
| `ot` | `ulidRegex` | 644 | 564 | — |
| `st` | `xidRegex` | 645 | 565 | — |
| `ct` | `ksuidRegex` | 646 | 566 | — |
| `lt` | `nanoidRegex` | 647 | 567 | — |
| `ut` | `isoDurationRegex` | 648 | 568 | — |
| `dt` | `uuidGenericRegex` | 649 | 570 | — |
| `ft` | `uuidVersionedRegex` | 650 | 571 | — |
| `pt` | `emailRegex` | 651 | 577 | — |
| `mt` | `emojiRegexSource` | 652 | 579 | — |
| `ht` | `emojiRegex` | 653 | 580 | — |
| `gt` | `ipv4Regex` | 656 | 583 | — |
| `_t` | `ipv6Regex` | 657 | 585 | — |
| `vt` | `ipv4CidrRegex` | 658 | 587 | — |
| `yt` | `ipv6CidrRegex` | 659 | 589 | — |
| `bt` | `base64Regex` | 660 | 591 | — |
| `xt` | `base64urlRegex` | 661 | 592 | — |
| `St` | `e164Regex` | 662 | 593 | — |
| `Ct` | `isoDateSource` | 663 | 594 | — |
| `wt` | `isoDateRegex` | 664 | 595 | — |
| `Tt` | `isoTimeSource` | 665 | 596 | — |
| `Et` | `isoTimeRegex` | 669 | 606 | — |
| `Dt` | `isoDateTimeRegex` | 672 | 609 | — |
| `Ot` | `makeStringLengthRegex` | 681 | 616 | — |
| `kt` | `integerRegex` | 685 | 620 | — |
| `At` | `numberRegex` | 686 | 621 | — |
| `jt` | `booleanRegex` | 687 | 622 | — |
| `Mt` | `undefinedRegex` | 688 | 623 | — |
| `Nt` | `lowercaseRegex` | 689 | 624 | — |
| `Pt` | `uppercaseRegex` | 690 | 625 | — |

### §5 zod core 检查/JIT（vendored）（jsx 691–1027，19 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `_` | `$ZodCheck` | 691 | 626 | — |
| `Ft` | `CHECK_ORIGIN_BY_VALUE_TYPE` | 695 | 630 | — |
| `It` | `$ZodCheckLessThan` | 700 | 631 | — |
| `Lt` | `$ZodCheckGreaterThan` | 719 | 652 | — |
| `Rt` | `$ZodCheckMultipleOf` | 738 | 673 | — |
| `zt` | `$ZodCheckNumberFormat` | 754 | 695 | — |
| `Bt` | `$ZodCheckMaxLength` | 818 | 765 | — |
| `Vt` | `$ZodCheckMinLength` | 841 | 792 | — |
| `Ht` | `$ZodCheckLengthEquals` | 864 | 819 | — |
| `Ut` | `$ZodCheckStringFormat` | 895 | 850 | — |
| `Wt` | `$ZodCheckRegex` | 914 | 875 | — |
| `Gt` | `$ZodCheckLowerCase` | 927 | 891 | — |
| `Kt` | `$ZodCheckUpperCase` | 930 | 894 | — |
| `qt` | `$ZodCheckIncludes` | 933 | 897 | — |
| `Jt` | `$ZodCheckStartsWith` | 952 | 919 | — |
| `Yt` | `$ZodCheckEndsWith` | 970 | 940 | — |
| `Xt` | `$ZodCheckOverwrite` | 988 | 961 | — |
| `Zt` | `JitCodeBuilder` | 993 | 967 | — |
| `Qt` | `ZOD_VERSION` | 1023 | 1000 | — |

### §6 zod core schema（vendored）（jsx 1028–1990，69 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `v` | `$ZodType` | 1028 | 1001 | — |
| `$t` | `$ZodString` | 1106 | 1072 | — |
| `y` | `$ZodStringFormat` | 1119 | 1087 | — |
| `en` | `$ZodGUID` | 1122 | 1090 | — |
| `tn` | `$ZodUUID` | 1125 | 1093 | — |
| `nn` | `$ZodEmail` | 1142 | 1101 | — |
| `rn` | `$ZodURL` | 1145 | 1104 | — |
| `an` | `$ZodEmoji` | 1179 | 1147 | — |
| `on` | `$ZodNanoID` | 1182 | 1150 | — |
| `sn` | `$ZodCUID` | 1185 | 1153 | — |
| `cn` | `$ZodCUID2` | 1188 | 1156 | — |
| `ln` | `$ZodULID` | 1191 | 1159 | — |
| `un` | `$ZodXID` | 1194 | 1162 | — |
| `dn` | `$ZodKSUID` | 1197 | 1165 | — |
| `fn` | `$ZodISODateTime` | 1200 | 1168 | — |
| `pn` | `$ZodISODate` | 1203 | 1171 | — |
| `mn` | `$ZodISOTime` | 1206 | 1174 | — |
| `hn` | `$ZodISODuration` | 1209 | 1177 | — |
| `gn` | `$ZodIPv4` | 1212 | 1180 | — |
| `_n` | `$ZodIPv6` | 1215 | 1183 | — |
| `vn` | `$ZodCIDRv4` | 1230 | 1201 | — |
| `yn` | `$ZodCIDRv6` | 1233 | 1204 | — |
| `bn` | `isValidBase64` | 1254 | 1227 | — |
| `xn` | `$ZodBase64` | 1263 | 1236 | — |
| `Sn` | `isValidBase64URL` | 1274 | 1251 | — |
| `Cn` | `$ZodBase64URL` | 1279 | 1256 | — |
| `wn` | `$ZodE164` | 1290 | 1271 | — |
| `Tn` | `isValidJWT` | 1293 | 1274 | — |
| `En` | `$ZodJWT` | 1305 | 1286 | — |
| `Dn` | `$ZodNumber` | 1316 | 1299 | — |
| `On` | `$ZodNumberFormat` | 1335 | 1329 | — |
| `kn` | `$ZodBoolean` | 1338 | 1332 | — |
| `An` | `$ZodUndefined` | 1352 | 1348 | — |
| `jn` | `$ZodUnknown` | 1363 | 1363 | — |
| `Mn` | `$ZodNever` | 1366 | 1366 | — |
| `Nn` | `$ZodDate` | 1374 | 1373 | — |
| `Pn` | `assignArrayElementResult` | 1392 | 1395 | — |
| `Fn` | `$ZodArray` | 1395 | 1398 | — |
| `In` | `assignShapeEntryResult` | 1417 | 1414 | — |
| `Ln` | `computeObjectInternals` | 1424 | 1421 | — |
| `Rn` | `processCatchallKeys` | 1436 | 1429 | — |
| `zn` | `$ZodObject` | 1461 | 1449 | — |
| `Bn` | `$ZodObjectJIT` | 1515 | 1492 | — |
| `Vn` | `finalizeUnionParse` | 1592 | 1571 | — |
| `Hn` | `$ZodUnion` | 1602 | 1584 | — |
| `Un` | `$ZodDiscriminatedUnion` | 1630 | 1619 | — |
| `Wn` | `$ZodIntersection` | 1678 | 1670 | — |
| `Gn` | `mergeValues` | 1692 | 1681 | — |
| `Kn` | `finalizeIntersectionParse` | 1743 | 1709 | — |
| `qn` | `$ZodRecord` | 1760 | 1728 | — |
| `Jn` | `$ZodEnum` | 1832 | 1801 | — |
| `Yn` | `$ZodLiteral` | 1846 | 1820 | — |
| `Xn` | `$ZodTransform` | 1859 | 1836 | — |
| `Zn` | `resetIssuesForOptionalUndefined` | 1868 | 1847 | — |
| `Qn` | `$ZodOptional` | 1874 | 1850 | — |
| `$n` | `$ZodExactOptional` | 1886 | 1869 | — |
| `er` | `$ZodNullable` | 1889 | 1875 | — |
| `tr` | `$ZodDefault` | 1895 | 1888 | — |
| `nr` | `applyDefaultValue` | 1903 | 1899 | — |
| `rr` | `$ZodPrefault` | 1906 | 1902 | — |
| `ir` | `$ZodNonOptional` | 1909 | 1911 | — |
| `ar` | `rejectUndefinedValue` | 1918 | 1922 | — |
| `or` | `$ZodCatch` | 1926 | 1930 | — |
| `sr` | `$ZodPipe` | 1945 | 1963 | — |
| `cr` | `runPipeStage` | 1955 | 1978 | — |
| `lr` | `$ZodReadonly` | 1961 | 1983 | — |
| `ur` | `freezePayloadValue` | 1968 | 1995 | — |
| `dr` | `$ZodCustom` | 1971 | 1998 | — |
| `fr` | `handleCustomCheckResult` | 1979 | 2009 | — |

### §7 zod core registry/工厂/JSON Schema（vendored）（jsx 1991–2932，93 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `pr` | `registryInit` | 1991 | 2021 | — |
| `mr` | `MetadataRegistry` | 1992 | 2022 | — |
| `hr` | `createMetadataRegistry` | 2026 | 2059 | — |
| `gr` | `$globalRegistry` | 2030 | 2063 | — |
| `_r` | `$string` | 2031 | 2064 | — |
| `vr` | `$email` | 2037 | 2067 | — |
| `yr` | `$guid` | 2046 | 2070 | — |
| `br` | `$uuid` | 2055 | 2073 | — |
| `xr` | `$uuidv4` | 2064 | 2076 | — |
| `Sr` | `$uuidv6` | 2074 | 2086 | — |
| `Cr` | `$uuidv7` | 2084 | 2096 | — |
| `wr` | `$url` | 2094 | 2106 | — |
| `Tr` | `$emoji` | 2103 | 2109 | — |
| `Er` | `$nanoid` | 2112 | 2112 | — |
| `Dr` | `$cuid` | 2121 | 2115 | — |
| `Or` | `$cuid2` | 2130 | 2118 | — |
| `kr` | `$ulid` | 2139 | 2121 | — |
| `Ar` | `$xid` | 2148 | 2124 | — |
| `jr` | `$ksuid` | 2157 | 2127 | — |
| `Mr` | `$ipv4` | 2166 | 2130 | — |
| `Nr` | `$ipv6` | 2175 | 2133 | — |
| `Pr` | `$cidrv4` | 2184 | 2136 | — |
| `Fr` | `$cidrv6` | 2193 | 2139 | — |
| `Ir` | `$base64` | 2202 | 2142 | — |
| `Lr` | `$base64url` | 2211 | 2145 | — |
| `Rr` | `$e164` | 2220 | 2148 | — |
| `zr` | `$jwt` | 2229 | 2151 | — |
| `Br` | `$datetime` | 2238 | 2154 | — |
| `Vr` | `$date` | 2249 | 2165 | — |
| `Hr` | `$time` | 2257 | 2168 | — |
| `Ur` | `$duration` | 2266 | 2177 | — |
| `Wr` | `$number` | 2274 | 2180 | — |
| `Gr` | `$int` | 2281 | 2183 | — |
| `Kr` | `$boolean` | 2290 | 2186 | — |
| `qr` | `$undefined` | 2296 | 2189 | — |
| `Jr` | `$unknown` | 2302 | 2192 | — |
| `Yr` | `$never` | 2307 | 2195 | — |
| `Xr` | `$dateValue` | 2313 | 2198 | — |
| `Zr` | `$lt` | 2319 | 2201 | — |
| `Qr` | `$lte` | 2327 | 2204 | — |
| `$r` | `$gt` | 2335 | 2207 | — |
| `ei` | `$gte` | 2343 | 2210 | — |
| `ti` | `$multipleOf` | 2351 | 2213 | — |
| `ni` | `$maxLength` | 2358 | 2216 | — |
| `ri` | `$minLength` | 2365 | 2219 | — |
| `ii` | `$length` | 2372 | 2222 | — |
| `ai` | `$regex` | 2379 | 2225 | — |
| `oi` | `$lowercase` | 2387 | 2228 | — |
| `si` | `$uppercase` | 2394 | 2231 | — |
| `ci` | `$includes` | 2401 | 2234 | — |
| `li` | `$startsWith` | 2409 | 2237 | — |
| `ui` | `$endsWith` | 2417 | 2240 | — |
| `di` | `$overwrite` | 2425 | 2243 | — |
| `fi` | `$normalize` | 2431 | 2246 | — |
| `pi` | `$trim` | 2434 | 2249 | — |
| `mi` | `$toLowerCase` | 2437 | 2252 | — |
| `hi` | `$toUpperCase` | 2440 | 2255 | — |
| `gi` | `$slugify` | 2443 | 2258 | — |
| `_i` | `$array` | 2446 | 2261 | — |
| `vi` | `$custom` | 2453 | 2264 | — |
| `yi` | `$superRefine` | 2461 | 2267 | — |
| `bi` | `defineCheck` | 2470 | 2287 | — |
| `xi` | `initJsonSchemaContext` | 2477 | 2291 | — |
| `b` | `processJsonSchemaNode` | 2493 | 2311 | — |
| `Si` | `resolveJsonSchemaRefs` | 2527 | 2343 | — |
| `Ci` | `finalizeJsonSchema` | 2610 | 2416 | — |
| `x` | `schemaContainsTransform` | 2671 | 2501 | — |
| `wi` | `makeToJsonSchemaFn` | 2700 | 2537 | — |
| `Ti` | `makeIoJsonSchemaFn` | 2707 | 2543 | — |
| `Ei` | `JSON_SCHEMA_FORMAT_MAP` | 2720 | 2550 | — |
| `Di` | `processJsonSchemaString` | 2727 | 2551 | — |
| `Oi` | `processJsonSchemaNumber` | 2747 | 2579 | — |
| `ki` | `processJsonSchemaBoolean` | 2759 | 2610 | — |
| `Ai` | `processJsonSchemaUndefined` | 2762 | 2613 | — |
| `ji` | `processJsonSchemaNever` | 2765 | 2617 | — |
| `Mi` | `processJsonSchemaDate` | 2768 | 2620 | — |
| `Ni` | `processJsonSchemaEnum` | 2771 | 2623 | — |
| `Pi` | `processJsonSchemaLiteral` | 2776 | 2630 | — |
| `Fi` | `processJsonSchemaCustom` | 2790 | 2654 | — |
| `Ii` | `processJsonSchemaTransform` | 2793 | 2658 | — |
| `Li` | `processJsonSchemaArray` | 2796 | 2662 | — |
| `Ri` | `processJsonSchemaObject` | 2808 | 2671 | — |
| `zi` | `processJsonSchemaUnion` | 2827 | 2695 | — |
| `Bi` | `processJsonSchemaIntersection` | 2836 | 2701 | — |
| `Vi` | `processJsonSchemaRecord` | 2849 | 2708 | — |
| `Hi` | `processJsonSchemaNullable` | 2875 | 2731 | — |
| `Ui` | `processJsonSchemaNonOptional` | 2883 | 2739 | — |
| `Wi` | `processJsonSchemaDefault` | 2889 | 2745 | — |
| `Gi` | `processJsonSchemaPrefault` | 2895 | 2751 | — |
| `Ki` | `processJsonSchemaCatch` | 2901 | 2758 | — |
| `qi` | `processJsonSchemaPipe` | 2914 | 2771 | — |
| `Ji` | `processJsonSchemaReadonly` | 2921 | 2778 | — |
| `Yi` | `processJsonSchemaOptional` | 2927 | 2784 | — |

### §8 zod classic（vendored）（jsx 2933–3402，101 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `Xi` | `ZodISODateTime` | 2933 | 2790 | — |
| `Zi` | `isoDateTime` | 2936 | 2793 | — |
| `Qi` | `ZodISODate` | 2939 | 2796 | — |
| `$i` | `isoDate` | 2942 | 2799 | — |
| `ea` | `ZodISOTime` | 2945 | 2802 | — |
| `ta` | `isoTime` | 2948 | 2805 | — |
| `na` | `ZodISODuration` | 2951 | 2808 | — |
| `ra` | `isoDuration` | 2954 | 2811 | — |
| `ia` | `ZodErrorInternals` | 2957 | 2814 | — |
| `S` | `ZodError` | 2983 | 2838 | — |
| `aa` | `parseImpl` | 2986 | 2839 | — |
| `oa` | `parseAsyncImpl` | 2987 | 2840 | — |
| `sa` | `safeParseImpl` | 2988 | 2841 | — |
| `ca` | `safeParseAsyncImpl` | 2989 | 2842 | — |
| `la` | `encodeImpl` | 2990 | 2843 | — |
| `ua` | `decodeImpl` | 2991 | 2844 | — |
| `da` | `encodeAsyncImpl` | 2992 | 2845 | — |
| `fa` | `decodeAsyncImpl` | 2993 | 2846 | — |
| `pa` | `safeEncodeImpl` | 2994 | 2847 | — |
| `ma` | `safeDecodeImpl` | 2995 | 2848 | — |
| `ha` | `safeEncodeAsyncImpl` | 2996 | 2849 | — |
| `ga` | `safeDecodeAsyncImpl` | 2997 | 2850 | — |
| `C` | `ZodType` | 2998 | 2851 | — |
| `_a` | `_ZodString` | 3036 | 2931 | — |
| `va` | `ZodString` | 3041 | 2953 | — |
| `w` | `zString` | 3044 | 2984 | ★Es |
| `T` | `ZodStringFormat` | 3047 | 2987 | — |
| `ya` | `ZodEmail` | 3050 | 2990 | — |
| `ba` | `ZodGUID` | 3053 | 2993 | — |
| `xa` | `ZodUUID` | 3056 | 2996 | — |
| `Sa` | `ZodURL` | 3059 | 2999 | — |
| `Ca` | `ZodEmoji` | 3062 | 3002 | — |
| `wa` | `ZodNanoID` | 3065 | 3005 | — |
| `Ta` | `ZodCUID` | 3068 | 3008 | — |
| `Ea` | `ZodCUID2` | 3071 | 3011 | — |
| `Da` | `ZodULID` | 3074 | 3014 | — |
| `Oa` | `ZodXID` | 3077 | 3017 | — |
| `ka` | `ZodKSUID` | 3080 | 3020 | — |
| `Aa` | `ZodIPv4` | 3083 | 3023 | — |
| `ja` | `ZodIPv6` | 3086 | 3026 | — |
| `Ma` | `ZodCIDRv4` | 3089 | 3029 | — |
| `Na` | `ZodCIDRv6` | 3092 | 3032 | — |
| `Pa` | `ZodBase64` | 3095 | 3035 | — |
| `Fa` | `ZodBase64URL` | 3098 | 3038 | — |
| `Ia` | `ZodE164` | 3101 | 3041 | — |
| `La` | `ZodJWT` | 3104 | 3044 | — |
| `Ra` | `ZodNumber` | 3107 | 3047 | — |
| `E` | `zNumber` | 3112 | 3073 | ★Cs |
| `za` | `ZodNumberFormat` | 3115 | 3076 | — |
| `Ba` | `intCheck` | 3118 | 3079 | — |
| `Va` | `ZodBoolean` | 3121 | 3082 | — |
| `D` | `zBoolean` | 3124 | 3085 | ★ys |
| `Ha` | `ZodUndefined` | 3127 | 3088 | — |
| `Ua` | `zUndefined` | 3130 | 3091 | — |
| `Wa` | `ZodUnknown` | 3133 | 3094 | — |
| `O` | `zUnknown` | 3136 | 3097 | ★Os |
| `Ga` | `ZodNever` | 3139 | 3100 | — |
| `Ka` | `zNever` | 3142 | 3103 | ★Ss |
| `qa` | `ZodDate` | 3145 | 3106 | — |
| `Ja` | `zDate` | 3150 | 3116 | — |
| `Ya` | `ZodArray` | 3153 | 3119 | — |
| `k` | `zArray` | 3156 | 3130 | ★vs |
| `Xa` | `ZodObject` | 3159 | 3133 | — |
| `A` | `zObject` | 3177 | 3152 | ★ws |
| `Za` | `ZodUnion` | 3184 | 3155 | — |
| `j` | `zUnion` | 3187 | 3161 | ★Ds |
| `Qa` | `ZodDiscriminatedUnion` | 3194 | 3164 | — |
| `M` | `zDiscriminatedUnion` | 3197 | 3167 | ★bs |
| `$a` | `ZodIntersection` | 3205 | 3170 | — |
| `eo` | `zIntersection` | 3208 | 3173 | — |
| `to` | `ZodRecord` | 3215 | 3176 | — |
| `N` | `zRecord` | 3218 | 3183 | ★Ts |
| `no` | `looseRecord` | 3226 | 3186 | — |
| `ro` | `ZodEnum` | 3235 | 3190 | — |
| `P` | `zEnum` | 3260 | 3212 | ★_s |
| `io` | `ZodLiteral` | 3267 | 3219 | — |
| `F` | `zLiteral` | 3275 | 3232 | ★xs |
| `ao` | `ZodTransform` | 3282 | 3235 | — |
| `oo` | `zTransform` | 3295 | 3256 | — |
| `so` | `ZodOptional` | 3301 | 3259 | — |
| `co` | `zOptional` | 3304 | 3265 | — |
| `lo` | `ZodExactOptional` | 3310 | 3268 | — |
| `uo` | `zExactOptional` | 3313 | 3274 | — |
| `fo` | `ZodNullable` | 3319 | 3277 | — |
| `po` | `zNullable` | 3322 | 3283 | — |
| `mo` | `ZodDefault` | 3328 | 3286 | — |
| `ho` | `zDefault` | 3331 | 3293 | — |
| `go` | `ZodPrefault` | 3340 | 3302 | — |
| `_o` | `zPrefault` | 3343 | 3308 | — |
| `vo` | `ZodNonOptional` | 3352 | 3317 | — |
| `yo` | `zNonOptional` | 3355 | 3323 | — |
| `bo` | `ZodCatch` | 3362 | 3326 | — |
| `xo` | `zCatch` | 3365 | 3333 | — |
| `So` | `ZodPipe` | 3372 | 3336 | — |
| `Co` | `zPipe` | 3375 | 3343 | — |
| `wo` | `ZodReadonly` | 3382 | 3346 | — |
| `To` | `zReadonly` | 3385 | 3352 | — |
| `Eo` | `ZodCustom` | 3391 | 3355 | — |
| `Do` | `refine` | 3394 | 3358 | — |
| `Oo` | `superRefine` | 3397 | 3361 | — |
| `ko` | `transformPipe` | 3400 | 3364 | — |

### §9 first-party 问题码/browser-use（jsx 3403–3864，38 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `Ao` | `ISSUE_CODES` | 3403 | 3367 | ★gs |
| `jo` | `emptyNamespaceResidue` | 3416 | 3380 | — |
| `Mo` | `BROWSER_VIEWPORT_LIMITS` | 3418 | 3382 | ★hs |
| `No` | `browserViewportSchema` | 3424 | 3383 | — |
| `Po` | `browserViewportBoundsSchema` | 3428 | 3384 | — |
| `Fo` | `clientModeEnum` | 3433 | 3393 | — |
| `Io` | `browserErrorCodeEnum` | 3441 | 3401 | — |
| `Lo` | `browserPageStateSchema` | 3442 | 3412 | — |
| `Ro` | `mouseButtonEnum` | 3452 | 3422 | — |
| `zo` | `keyboardModifierEnum` | 3453 | 3423 | — |
| `Bo` | `pointSchema` | 3454 | 3424 | — |
| `Vo` | `locatorOperationEnum` | 3458 | 3425 | — |
| `Ho` | `locatorModifierEnum` | 3459 | 3443 | — |
| `Uo` | `timeoutMsSchema` | 3460 | 3444 | — |
| `Wo` | `selectOptionSchema` | 3461 | 3445 | — |
| `Go` | `playwrightActionSchema` | 3466 | 3455 | — |
| `Ko` | `browserRequestSchema` | 3524 | 3509 | — |
| `qo` | `browserBackendTypeEnum` | 3724 | 3654 | — |
| `Jo` | `browserCapabilityRefSchema` | 3725 | 3655 | — |
| `Yo` | `browserDescriptorSchema` | 3729 | 3656 | — |
| `Xo` | `sessionContextEnum` | 3741 | 3665 | — |
| `Zo` | `rectSchema` | 3758 | 3681 | — |
| `Qo` | `domElementSchema` | 3764 | 3682 | — |
| `$o` | `domNodeSchema` | 3781 | 3699 | — |
| `es` | `domSnapshotSchema` | 3791 | 3709 | — |
| `ts` | `browserTabSchema` | 3799 | 3717 | — |
| `ns` | `userTabSchema` | 3807 | 3725 | — |
| `rs` | `browserDialogSchema` | 3814 | 3732 | — |
| `is` | `browserMetaSchema` | 3819 | 3737 | — |
| `as` | `browserResultSchema` | 3829 | 3747 | — |
| `os` | `ASSET_INSTALL_MODES` | 3851 | 3766 | — |
| `ss` | `DEFAULT_ASSET_INSTALL_MODE` | 3852 | 3767 | ★ms |
| `cs` | `FILE_TRANSFER_CAPABILITIES` | 3853 | 3768 | — |
| `ls` | `ALL_FILE_TRANSFER_CAPABILITIES` | 3854 | 3769 | — |
| `us` | `REMOTE_FILE_TRANSFER_CAPABILITIES` | 3855 | 3770 | — |
| `ds` | `fileTransferCapabilitySet` | 3857 | 3772 | — |
| `fs` | `listFileTransferCapabilities` | 3859 | 3774 | ★ps |
| `ps` | `isFileTransferCapability` | 3862 | 3777 | — |

### §10 first-party agent CLI/用量（jsx 3865–3949，15 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `I` | `agentCliProviderEnum` | 3865 | 3780 | — |
| `ms` | `USAGE_REPORT_RANGES` | 3866 | 3781 | ★fs |
| `hs` | `favoriteModelSchema` | 3867 | 3782 | — |
| `gs` | `usageSummarySchema` | 3872 | 3783 | — |
| `_s` | `usageHeatmapDaySchema` | 3891 | 3802 | — |
| `vs` | `usageHeatmapWeekSchema` | 3898 | 3809 | — |
| `ys` | `usageHeatmapSchema` | 3902 | 3810 | — |
| `bs` | `usageDailyModelSchema` | 3908 | 3811 | — |
| `xs` | `usageDailyModelUsageSchema` | 3912 | 3812 | — |
| `Ss` | `usageModelDetailSchema` | 3916 | 3813 | — |
| `Cs` | `usageToolStatsSchema` | 3924 | 3821 | — |
| `ws` | `DEFAULT_AGENT_NAME` | 3942 | 3839 | ★ls |
| `Ts` | `BUILTIN_AGENT_CLI_PROVIDERS` | 3943 | 3840 | — |
| `Es` | `resolveDefaultAgentCliProvider` | 3944 | 3841 | ★ds |
| `Ds` | `isGlmAgentCliProvider` | 3947 | 3844 | ★us |

### §11 first-party 会话/消息协议（jsx 3950–4290，38 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `L` | `nonEmptyString` | 3950 | 3847 | — |
| `R` | `unknownRecord` | 3951 | 3848 | — |
| `z` | `timestampMs` | 3952 | 3849 | — |
| `Os` | `clientModeEnum2` | 3953 | 3850 | — |
| `ks` | `messageVisibilityEnum` | 3954 | 3851 | — |
| `As` | `syntheticSourceEnum` | 3955 | 3852 | — |
| `B` | `workspaceRefSchema` | 3956 | 3864 | — |
| `js` | `permissionDecisionEnum` | 3962 | 3870 | — |
| `Ms` | `permissionBehaviorEnum` | 3963 | 3871 | — |
| `Ns` | `permissionRuleSchema` | 3964 | 3872 | — |
| `Ps` | `addRulesUpdateSchema` | 3968 | 3873 | — |
| `Fs` | `permissionResponseSchema` | 3973 | 3874 | ★ss |
| `V` | `modelRefSchema` | 3979 | 3880 | — |
| `Is` | `sessionModeEnum` | 3984 | 3881 | — |
| `Ls` | `sessionStatusEnum` | 3985 | 3882 | — |
| `Rs` | `sessionKindEnum` | 3986 | 3883 | — |
| `zs` | `goalTargetSchema` | 3987 | 3892 | — |
| `Bs` | `goalVerificationResultSchema` | 4002 | 3907 | — |
| `Vs` | `goalVerificationTimelineSchema` | 4007 | 3908 | — |
| `Hs` | `sessionDescriptorSchema` | 4022 | 3923 | — |
| `Us` | `subagentOriginSchema` | 4038 | 3939 | ★os |
| `Ws` | `messageTimeSchema` | 4049 | 3950 | — |
| `Gs` | `tokenUsageSchema` | 4053 | 3951 | — |
| `Ks` | `messageSemanticsSchema` | 4063 | 3958 | — |
| `qs` | `messageInfoSchema` | 4072 | 3979 | — |
| `H` | `partBaseSchema` | 4105 | 4012 | — |
| `Js` | `toolStateSchema` | 4110 | 4013 | — |
| `Ys` | `labeledModelRefSchema` | 4136 | 4040 | — |
| `Xs` | `timeRangeSchema` | 4139 | 4041 | — |
| `Zs` | `timelinePartSchema` | 4143 | 4042 | — |
| `Qs` | `messagePartSchema` | 4180 | 4075 | — |
| `$s` | `messageWithPartsSchema` | 4239 | 4121 | — |
| `ec` | `apiRetrySchema` | 4243 | 4122 | — |
| `tc` | `cacheStatsSchema` | 4251 | 4130 | ★cs |
| `nc` | `contextBreakdownSchema` | 4262 | 4141 | ★as |
| `rc` | `contextUsageSchema` | 4266 | 4155 | — |
| `ic` | `sessionStateEventSchema` | 4276 | 4162 | — |
| `ac` | `extractTextFromParts` | 4288 | 4174 | — |

### §12 first-party bots/WSL/端点（jsx 4291–4509，37 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `oc` | `BOT_PROVIDER_IDS` | 4291 | 4180 | — |
| `sc` | `imBindingSchema` | 4292 | 4181 | ★is |
| `cc` | `isFeishuOrLark` | 4298 | 4187 | ★ns |
| `lc` | `BOT_REPLY_MODES` | 4301 | 4190 | — |
| `uc` | `BOTS_STREAM_TIMEOUT_MS` | 4302 | 4191 | ★Zo |
| `dc` | `BOTS_TASK_CHANNEL` | 4303 | 4192 | ★Qo |
| `fc` | `BOTS_TASK_STREAM_CHANNEL` | 4304 | 4193 | ★$o |
| `pc` | `botAllowedCommandsSchema` | 4305 | 4194 | — |
| `mc` | `botCurrentOptionsSchema` | 4317 | 4206 | — |
| `hc` | `botDraftOptionsSchema` | 4325 | 4214 | — |
| `gc` | `botQuestionOptionSchema` | 4331 | 4220 | — |
| `_c` | `botQuestionSchema` | 4336 | 4221 | — |
| `vc` | `botElicitationSchema` | 4342 | 4222 | — |
| `yc` | `botConfigSchema` | 4358 | 4237 | — |
| `bc` | `DEFAULT_BOT_REPLY_MODE` | 4403 | 4290 | ★es |
| `xc` | `availableReplyModesForProvider` | 4404 | 4291 | ★ts |
| `Sc` | `resolveBotReplyMode` | 4407 | 4294 | ★rs |
| `Cc` | `isValidWslUser` | 4412 | 4299 | ★Xo |
| `wc` | `containsControlCharacter` | 4416 | 4310 | — |
| `Tc` | `wslUserSchema` | 4423 | 4317 | — |
| `Ec` | `ZCODE_PRODUCTION_ORIGIN` | 4426 | 4321 | — |
| `Dc` | `ZCODE_TEST_ORIGIN` | 4427 | 4322 | — |
| `Oc` | `BIGMODEL_PRODUCTION_ORIGIN` | 4428 | 4323 | — |
| `kc` | `BIGMODEL_DEV_ORIGIN` | 4429 | 4324 | — |
| `Ac` | `REMOTE_V4_MIN_APP_VERSION` | 4430 | 4325 | — |
| `jc` | `isAppVersionAbove` | 4431 | 4326 | — |
| `Mc` | `readEnvValue` | 4445 | 4345 | — |
| `Nc` | `normalizeEndpointOrigin` | 4448 | 4348 | — |
| `Pc` | `resolveZcodeOriginByEnv` | 4455 | 4356 | — |
| `Fc` | `resolveBuildEnvFromVars` | 4462 | 4363 | — |
| `Ic` | `resolveZcodeEndpointOrigin` | 4465 | 4366 | — |
| `Lc` | `resolveZcodeEndpointConfig` | 4474 | 4375 | ★Yo |
| `Rc` | `resolveBigmodelApiBaseUrl` | 4477 | 4378 | — |
| `zc` | `buildBigmodelApiUrl` | 4483 | 4387 | ★Ko |
| `Bc` | `codingPlanPersonalOverviewUrl` | 4487 | 4391 | ★qo |
| `Vc` | `codingPlanTeamPlansUrl` | 4490 | 4394 | ★Jo |
| `Hc` | `buildZcodeEndpointConfig` | 4493 | 4397 | — |

### §13 first-party 设置/迁移（jsx 4510–4830，27 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `U` | `settingsNonEmptyString` | 4510 | 4414 | — |
| `Uc` | `localeEnum` | 4511 | 4415 | — |
| `Wc` | `localePreferenceEnum` | 4512 | 4416 | — |
| `Gc` | `interactionBehaviorEnum` | 4513 | 4417 | — |
| `Kc` | `updateChannelEnum` | 4514 | 4418 | — |
| `qc` | `zoomLevelSchema` | 4515 | 4419 | — |
| `Jc` | `integratedTerminalShellSchema` | 4516 | 4420 | — |
| `Yc` | `builtinAgentCliProvidersSchema` | 4525 | 4424 | — |
| `Xc` | `providerFamilyModesSchema` | 4526 | 4425 | — |
| `Zc` | `providerFamilyDomainEnum` | 4530 | 4429 | — |
| `Qc` | `providerFamilySelectedKeysSchema` | 4531 | 4430 | — |
| `$c` | `isRepoSnapshotIndexingUserEnabled` | 4535 | 4431 | ★Go |
| `el` | `releaseNotesSchema` | 4538 | 4434 | — |
| `tl` | `skippedUpdateVersionsSchema` | 4548 | 4441 | — |
| `nl` | `remoteTargetSchema` | 4549 | 4442 | — |
| `rl` | `workspaceSessionEntrySchema` | 4577 | 4466 | — |
| `il` | `webRemoteRelayDeviceSchema` | 4591 | 4483 | — |
| `al` | `webRemoteEnabledContextSchema` | 4594 | 4484 | — |
| `ol` | `zcodeEndpointOriginSchema` | 4599 | 4485 | — |
| `sl` | `migrateZcodeEndpointOrigin` | 4608 | 4495 | — |
| `cl` | `migrateOptimizeAgentExperience` | 4623 | 4504 | — |
| `ll` | `migrateCloseToTrayOnWindows` | 4632 | 4511 | — |
| `ul` | `migrateLocalePreference` | 4641 | 4518 | — |
| `dl` | `remoteWorkspaceHistoryEntrySchema` | 4651 | 4525 | — |
| `fl` | `migrateEnabledBuiltinAgentCliProviders` | 4661 | 4535 | — |
| `pl` | `stripResourcePackagesFromTarget` | 4667 | 4540 | — |
| `ml` | `migrateLastWorkspaceSession` | 4677 | 4547 | — |

### §14 first-party 供应商/模型注册表（jsx 4831–4901，24 符号）

| 混淆名 | 语义名 | jsx 行 | js 行 | 导出 |
|---|---|---|---|---|
| `hl` | `approvalPolicyEnum` | 4831 | 4720 | — |
| `gl` | `BUILTIN_PROVIDER_PREFIX` | 4832 | 4732 | — |
| `W` | `providerIds` | 4833 | 4733 | ★mo |
| `_l` | `isBuiltinProviderId` | 4842 | 4742 | ★Eo |
| `vl` | `isZaiPlanProviderId` | 4845 | 4753 | ★Po |
| `yl` | `isStartPlanProviderId` | 4848 | 4756 | ★No |
| `bl` | `isCodingPlanProviderId` | 4851 | 4759 | ★Do |
| `xl` | `GLM_MODEL_IDS` | 4854 | 4762 | ★vo |
| `Sl` | `GLM_REASONING_LEVELS` | 4855 | 4763 | ★ho |
| `Cl` | `GLM_DEFAULT_MODEL_PREFIX` | 4856 | 4764 | — |
| `wl` | `GLM_DATED_MODEL_REGEX` | 4857 | 4765 | — |
| `Tl` | `isGlmModelId` | 4858 | 4766 | ★Oo |
| `El` | `CLAUDE_TO_GLM_MODEL_MAP` | 4863 | 4771 | ★yo |
| `Dl` | `modelAliasOverrideSchema` | 4871 | 4774 | — |
| `Ol` | `apiFormatEnum` | 4879 | 4777 | — |
| `kl` | `wireFormatEnum` | 4880 | 4778 | — |
| `Al` | `providerKindEnum` | 4881 | 4779 | — |
| `jl` | `devProviderIdEnum` | 4882 | 4780 | — |
| `Ml` | `modalityEnum` | 4883 | 4781 | — |
| `Nl` | `envPathSchema` | 4884 | 4782 | — |
| `Pl` | `envOverrideSchema` | 4887 | 4783 | — |
| `Fl` | `reasoningLevelConfigSchema` | 4893 | 4784 | — |
| `Il` | `endpointsByKindSchema` | 4897 | 4785 | — |
| `Ll` | `providerEndpointsSchema` | 4898 | 4786 | — |

## §3 导出别名表（本 chunk 对外导出 ↔ 内部符号 ↔ styles 侧消费别名）

> 本范围内共 53 个导出（全 chunk 412 个导出的 12.9%）。styles 侧别名列来自 styles chunk import 块（styles js 431–827）解析，供后续批次反查。

| 内部名 | 导出字母 | styles 侧别名 | 语义名 | jsx 行 | js 行 |
|---|---|---|---|---|---|
| `e` | `Ps` | `rr` | `DEFAULT_LOCALE` | 1 | 1 |
| `t` | `Ns` | `Hn` | `sanitizeWorkspaceDescriptor` | 2 | 2 |
| `a` | `Ms` | `Pn` | `sshTargetIdentityKey` | 86 | 60 |
| `s` | `js` | `hi` | `RESOLVED_BUILD_ENV` | 92 | 73 |
| `ee` | `As` | `it` | `extractErrorInfo` | 115 | 100 |
| `te` | `ks` | `zte` | `isFileLockTimeoutError` | 136 | 113 |
| `w` | `Es` | `K` | `zString` | 3044 | 2984 |
| `E` | `Cs` | `_t` | `zNumber` | 3112 | 3073 |
| `D` | `ys` | `Li` | `zBoolean` | 3124 | 3085 |
| `O` | `Os` | `Yn` | `zUnknown` | 3136 | 3097 |
| `Ka` | `Ss` | `wr` | `zNever` | 3142 | 3103 |
| `k` | `vs` | `Oi` | `zArray` | 3156 | 3130 |
| `A` | `ws` | `ji` | `zObject` | 3177 | 3152 |
| `j` | `Ds` | `Tt` | `zUnion` | 3187 | 3161 |
| `M` | `bs` | `$r` | `zDiscriminatedUnion` | 3197 | 3167 |
| `N` | `Ts` | `Ar` | `zRecord` | 3218 | 3183 |
| `P` | `_s` | `Jr` | `zEnum` | 3260 | 3212 |
| `F` | `xs` | `Fi` | `zLiteral` | 3275 | 3232 |
| `Ao` | `gs` | `ci` | `ISSUE_CODES` | 3403 | 3367 |
| `Mo` | `hs` | `di` | `BROWSER_VIEWPORT_LIMITS` | 3418 | 3382 |
| `ss` | `ms` | `$te` | `DEFAULT_ASSET_INSTALL_MODE` | 3852 | 3767 |
| `fs` | `ps` | `vne` | `listFileTransferCapabilities` | 3859 | 3774 |
| `ms` | `fs` | `ai` | `USAGE_REPORT_RANGES` | 3866 | 3781 |
| `ws` | `ls` | `Kte` | `DEFAULT_AGENT_NAME` | 3942 | 3839 |
| `Es` | `ds` | `ni` | `resolveDefaultAgentCliProvider` | 3944 | 3841 |
| `Ds` | `us` | `Ei` | `isGlmAgentCliProvider` | 3947 | 3844 |
| `Fs` | `ss` | `zne` | `permissionResponseSchema` | 3973 | 3874 |
| `Us` | `os` | `dne` | `subagentOriginSchema` | 4038 | 3939 |
| `tc` | `cs` | `Jee` | `cacheStatsSchema` | 4251 | 4130 |
| `nc` | `as` | `Ree` | `contextBreakdownSchema` | 4262 | 4141 |
| `sc` | `is` | `Dte` | `imBindingSchema` | 4292 | 4181 |
| `cc` | `ns` | `yi` | `isFeishuOrLark` | 4298 | 4187 |
| `uc` | `Zo` | `See` | `BOTS_STREAM_TIMEOUT_MS` | 4302 | 4191 |
| `dc` | `Qo` | `—` | `BOTS_TASK_CHANNEL` | 4303 | 4192 |
| `fc` | `$o` | `—` | `BOTS_TASK_STREAM_CHANNEL` | 4304 | 4193 |
| `bc` | `es` | `ote` | `DEFAULT_BOT_REPLY_MODE` | 4403 | 4290 |
| `xc` | `ts` | `Wne` | `availableReplyModesForProvider` | 4404 | 4291 |
| `Sc` | `rs` | `Mne` | `resolveBotReplyMode` | 4407 | 4294 |
| `Cc` | `Xo` | `lee` | `isValidWslUser` | 4412 | 4299 |
| `Lc` | `Yo` | `hee` | `resolveZcodeEndpointConfig` | 4474 | 4375 |
| `zc` | `Ko` | `vn` | `buildBigmodelApiUrl` | 4483 | 4387 |
| `Bc` | `qo` | `Si` | `codingPlanPersonalOverviewUrl` | 4487 | 4391 |
| `Vc` | `Jo` | `fn` | `codingPlanTeamPlansUrl` | 4490 | 4394 |
| `$c` | `Go` | `Wt` | `isRepoSnapshotIndexingUserEnabled` | 4535 | 4431 |
| `W` | `mo` | `q` | `providerIds` | 4833 | 4733 |
| `_l` | `Eo` | `jt` | `isBuiltinProviderId` | 4842 | 4742 |
| `vl` | `Po` | `tr` | `isZaiPlanProviderId` | 4845 | 4753 |
| `yl` | `No` | `Bn` | `isStartPlanProviderId` | 4848 | 4756 |
| `bl` | `Do` | `Ct` | `isCodingPlanProviderId` | 4851 | 4759 |
| `xl` | `vo` | `Di` | `GLM_MODEL_IDS` | 4854 | 4762 |
| `Sl` | `ho` | `ui` | `GLM_REASONING_LEVELS` | 4855 | 4763 |
| `Tl` | `Oo` | `qn` | `isGlmModelId` | 4858 | 4766 |
| `El` | `yo` | `—` | `CLAUDE_TO_GLM_MODEL_MAP` | 4863 | 4771 |
## §4 与既有报告登记的核对

| 既有登记 | 出处 | 本批次核对结果 |
|---|---|---|
| `Ps`='zh-CN' DEFAULT_LOCALE（src-HCld2afU.js 行 1 `var e = 'zh-CN'`） | I18n.report §1 / intlProvider.report | ✅ 一致：`e`→`DEFAULT_LOCALE`（jsx 1 / js 1，导出 `Ps`，styles 侧 `rr`） |
| providerIds（styles 侧 `q`=`mo` 导出） | ExtendedViews.report §9 行 92 / §2.3 | ✅ 一致：`W`→`providerIds`（jsx 4833 / js 4733，导出 `mo`，styles 侧别名 `q`）；语义名按既有登记采用 `providerIds` 而非新拟名 |
| `Vte`=buildPermissionRequestViewModel（l 导出） | Conversation.report 行 170/266 | ✅ 归属核对：导出字母 `l` ↔ 内部 `CC`（jsx 9614），落在 B5-10b 范围，本批次不含，无冲突 |
| `Xr` LCS 计数（b 导出）、`ine` git-pane testid（js 8239） | GitReview.report 行 132/231 | ✅ 归属核对：`b`↔`bS`（jsx 9135）、testid 群 jsx 8346–8570，均在 B5-10b 范围 |
| testid ×9（js 8423–8440）、`ene/Ti/q/Zn/ri/xw/vee` | ExtendedViews.report §2.3/§9 | ✅ 归属核对：`n`↔`zC`（9701）、`to`↔`ip`（7034）、`P`↔`iS`（9078）、`et`↔`hx`（8853）、`Z`↔`vx`（8860）均在 B5-10b；本范围仅 `q`（styles 侧别名，指 `mo`=providerIds）相关 |
| `testidOf`（qr←Nb）、workspaceScopeKey（Ti←to） | Home.report §1.4/§9 | ✅ 均在 B5-10b 范围（8000+/7034），无冲突 |
| `K`=formatLogPrefix（内部 `Lx`，jsx 8975） | logger.report §2.1 | ✅ 在 B5-10b 范围，无冲突 |

**结论**：本范围内与既有登记重叠的符号仅 `DEFAULT_LOCALE`（e/Ps）与 `providerIds`（W/mo），两者语义名均与既有登记逐字一致；其余既有登记符号全部落在 B5-10b（jsx 4902–9742），行号互斥。

## §5 把握度分级

| 级别 | 范围 | 依据 |
|---|---|---|
| **高（逐字）** | §1–§14 全部 567 符号的字符串常量、分支结构、正则、数值、枚举值 | 直接转录自孪生；14/14 锚点回代逐字命中（§6 门禁 3）；双 AST 解析 1:1 对齐 |
| **高（语义名）** | zod vendored 段（§2–§8）符号名 | 取 zod v4.3.6 上游源码命名（`$ZodType`、`$constructor`、`$cleanIssue`…），与库体字符串（错误文案、`~standard` 等）互证 |
| **高（语义名）** | §9–§14 导出符号 + 已被消费侧登记的符号 | 导出表 + styles 侧消费别名 + 既有报告三重互证 |
| **中（语义名）** | §9–§14 未导出的内部 schema（如 `browserResultSchema`、`usageHeatmapWeekSchema` 等） | 按字段结构与判别值推断，无消费侧旁证；字符串值本身仍为逐字高把握 |
| **低** | 无 | — |

类型脚手架说明：`ZodInst/ZodDef = any`、`ParsePayload/ParseContext` 接口仅服务 strict tsc，运行时语义零改动；个别 `as`/`!` 标注（`shallowClone` 返回值、`entry` 字面量 `ref` 位、`mergeErrorPath` 展开、`_ZodString` 变参元组）均为纯类型层修补，不产生运行时差异。

## §6 验证记录（四项门禁）

| 门禁 | 命令 | 结果 |
|---|---|---|
| 1. esbuild | `web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/SrcSharedA.tsx --loader:.tsx=tsx --jsx=preserve` | ✅ exit 0，0 错 |
| 2. tsc strict | `web/node_modules/.bin/tsc -p /tmp/tsconfig.SrcSharedA.json`（strict、ES2022、jsx preserve、moduleResolution Bundler、typeRoots→`web/node_modules/@types`、include 仅产物） | ✅ exit 0，0 错 |
| 3. 锚点回代 | 14 个锚点（≥8 要求），孪生行按映射表替换后与重建文件逐字比对 | ✅ 14/14 HIT（下表） |
| 4. 报告完整 | 本文件（覆盖清单/导出别名/核对/验证/符号表/边界裁决/遗留） | ✅ |

### 门禁 3 锚点明细（回代 = 取孪生原行，按混淆→语义映射替换后，与重建内容逐字命中）

| # | jsx 行 | 内容（替换后） | 结果 |
|---|---|---|---|
| A1 | 1 | `var DEFAULT_LOCALE = \`zh-CN\`;` | HIT |
| A2 | 103 | `var FILE_LOCK_TIMEOUT_CODE = \`ZCODE_FILE_LOCK_TIMEOUT\`;` | HIT |
| A3 | 642 | `cuidRegex = /^[cC][^\s-]{8,}$/,` | HIT |
| A4 | 651 | `emailRegex = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,` | HIT |
| A5 | 1023 | `ZOD_VERSION = { major: 4, minor: 3, patch: 6 }` | HIT |
| A6 | 3418–3423 | `var BROWSER_VIEWPORT_LIMITS = { minWidth: 320, maxWidth: 3840, minHeight: 320, maxHeight: 2160 }, …` | HIT |
| A7 | 3865 | `var agentCliProviderEnum = zEnum([\`claude\`, \`opencode\`, \`gemini\`, \`codex\`, \`glm\`]),` | HIT |
| A8 | 3942 | `var DEFAULT_AGENT_NAME = \`zcodeAgent\`,` | HIT |
| A9 | 4291 | `var BOT_PROVIDER_IDS = [\`telegram\`, \`webhook\`, \`feishu\`, \`lark\`, \`weixin\`, \`discord\`, \`wecom\`],` | HIT |
| A10 | 4403 | `var DEFAULT_BOT_REPLY_MODE = \`assistant_changes\`;` | HIT |
| A11 | 4426–4430 | `ZCODE_PRODUCTION_ORIGIN = \`https://zcode.z.ai\`, … REMOTE_V4_MIN_APP_VERSION = \`3.4.0\`;` | HIT |
| A12 | 4833–4841 | `providerIds = { zai: \`\${BUILTIN_PROVIDER_PREFIX}zai\`, … zapi: \`\${BUILTIN_PROVIDER_PREFIX}zapi\` };` | HIT |
| A13 | 4854 | `var GLM_MODEL_IDS = [\`GLM-5.2\`, \`GLM-5-Turbo\`],` | HIT |
| A14 | 4857 | `GLM_DATED_MODEL_REGEX = /^glm-\d{4}(?:$|[^0-9a-z])/;` | HIT |

### 原件只读抽验

- `md5 desktop/src/out/renderer/assets/src-HCld2afU.js` = `f5edd6a1207c6d20008204829dad3923`（与开工基线一致，未变）

## §7 边界裁决（与 B5-10b）

- **jsx 4900 落在 `Ll`（providerEndpointsSchema）声明符内部**（`Ll` 起于 4898、终于 4901）。裁决：**声明符原子性** —— 声明符归其起始行所在批次。故本批次收录至 `Ll` 收尾（jsx 4901，越界 1 行），B5-10b 自 `Rl`（jsx 4902）起。两批次行号仍互斥（4901 归 B5-10a，4902+ 归 B5-10b），无重叠符号。
- `Ll` 依赖的 `Il`（endpointsByKindSchema，jsx 4897）同在本批次，`Rl` 对 `Ll` 无依赖，切割无悬空引用。
- 孪生 §14 段 banner 与 `SrcSharedA.tsx` 文件尾符号表均已注明该裁决。

## §8 遗留问题

1. **zod vendored 段（§2–§8，约 3,260 行）**：内核移植阶段建议整体替换为 npm `zod@4.3.6`（版本对象互证），届时本文件仅保留 §1/§9–§14 first-party 段；替换前本文件为全量逐字转录，可直接运行。
2. **匿名装配语句**（结果丢弃的 schema/表达式：jsx 3432、3434、3742、3856、3858、3931、4375、4738–4830）：原件即丢弃，语义上为死代码或构建期残留，逐字保留；后续批次如需精简需另行裁决。
3. **`jo` 空命名空间残留**（jsx 3416）：TS namespace 枚举遗留的空 IIFE，无语义，保留原样。
4. **`Sl`（GLM_REASONING_LEVELS）导出字母 `ho`**：part1 文件头 §14 行原仅注 `★vo`（xl），`Sl→ho` 为导出表复核时补认，已在尾符号表与 §3 导出别名表登记。
5. **未导出内部 schema 的语义名**（§5 中把握级）：如后续批次在消费侧（Conversation/Bots/Payment 等模块）发现更精确的命名证据，按 B5-FULL-DECODE-PLAN §3 冲突规则以消费侧为准，本文件不主动改名。
6. **`xw`（reportTelemetry）**：不在导出表（412 导出）中，应为 chunk 内部符号或被内联，位于 B5-10b 范围，留待该批次核对。
