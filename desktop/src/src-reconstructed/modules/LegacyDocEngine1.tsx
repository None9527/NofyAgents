/* eslint-disable */
/**
 * ============================================================================
 * LegacyDocEngine1.tsx — legacy-doc 内部排版引擎 · [E1] Unicode BiDi 与断词引擎
 * （解混淆重建 · D8 Stage B4 · Office 预览族 / legacy-doc 引擎展开第 1 段）
 *
 * 源 chunk：out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js
 * （47,538 行；JSX 还原版 src-reconstructed/renderer/assets/
 *  previewPaneOfficeLegacyDocContent-HWD4EOEM.jsx，36,535 行，行号锚点均指此）
 * 本文件覆盖：[E1] jsx 10303-11176（登记表 10305 起；10303-10304 为 Ee/De 数据表，
 * 与算法同段，一并收入）。
 *
 * 段职责（按实际代码核定）：
 *   1) UAX#9 双向（BiDi）算法子集：字符双向类型表（0-255 直接表 + 区间表）、
 *      段落级别推导与隐式级别计算（ke），供 [E2] 行布局按段取级（Ae）。
 *   2) 空白归一（white-space: normal/pre-wrap 两态）与硬换行归一。
 *   3) 基于 Intl.Segmenter 的词切分管线：标点粘着（开/闭引号、CJK 禁则）、
 *      URL 合并、数字合并、连字符数字拆分、NBSP 粘合、CJK 尾部开标点拆分、
 *      阿拉伯语/缅甸语标点特判，产出供 [E2] 测量/断行消费的令牌流（$t）。
 *
 * 与其他段的依赖：无外部依赖（纯算法 + Intl/正则）；被 [E2] LegacyDocEngine2
 * 的 buildWidthTable（ur）调用。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名 映射表（行号 = jsx）
 * ----------------------------------------------------------------------------
 *  BiDi：
 *   Ee → BIDI_DIRECT_TYPES          0-255 双向类型直接表 (10303)
 *   De → BIDI_RANGE_TABLE           区间表 [起,止,类型] (10304)
 *   Oe → getBidiCharType            类型查找（直接表 + 二分区间表）(10305)
 *   ke → computeBidiLevels          UAX#9 级别算法（P2/W2/W4-W7/N1/N2/I1/I2 子集）(10324)
 *   Ae → mapBidiLevelsToSegmentStarts 文本级别 → 段首级别 (10400)
 *  空白归一：
 *   je → COLLAPSIBLE_WS_RE (10407) · Me → NEEDS_WS_NORMALIZE_RE (10408)
 *   Ne → resolveWhiteSpaceMode (10409) · Pe → normalizeCollapsibleSpaces (10418)
 *   Fe → normalizeHardLineBreaks (10425)
 *  词切分宿主：
 *   Ie/Le/Re → 词粒度 Intl.Segmenter 单例 (10429-10435)
 *  脚本探测：
 *   ze → ARABIC_SCRIPT_RE (10437) · Be → COMBINING_MARK_RE (10438)
 *   Ve → DECIMAL_DIGIT_RE (10439) · He → containsArabic (10440)
 *   Ue → isCJKCodePoint (10443) · We → containsCJK (10447)
 *   Ge → endsWithCJKClosingPunct (10464)
 *  标点/空白集：
 *   Ke → NON_BREAK_SPACE_SET (10468) · Q → HYPHEN_CHAR_SET (10469)
 *   qe → endsWithNoBreakSpace (10471) · Je → endsWithHyphen (10475)
 *   Ye → allowsBreakAfter (10478)
 *   Xe → CJK_NO_LINE_START_SET (10481) · Ze → OPEN_PUNCT_SET (10482)
 *   Qe → APOSTROPHE_SET (10483) · $e → CLOSE_PUNCT_SET (10484)
 *   et → ARABIC_SENTENCE_END_SET (10485) · tt → MYANMAR_FULL_STOP_SET (10486)
 *   nt → CLOSING_QUOTE_SET (10487)
 *  标点簇判定：
 *   rt → isClosingPunctCluster (10488) · it → isCJKClosingPunctRun (10499)
 *   at → isOpenPunctRun (10503) · ot → isPurePunctRun (10509)
 *  字素助手：
 *   st → prevGraphemeBoundary (10518) · ct → lastGraphemeCluster (10528)
 *   lt → firstNonMarkChar (10533) · ut → lastNonMarkCluster (10538)
 *  货币/数字：
 *   dt → CURRENCY_SIGN_RANGES (10548) · ft → inCodePointRanges (10549)
 *   pt → isCurrencySign (10553) · mt → endsWithCurrencySign (10557)
 *   ht → firstNonMarkIsDigit (10560)
 *  令牌整形：
 *   gt → splitTrailingOpenPunct (10563) · _t → repeatUnitOf (10579)
 *   vt → expandRepeatUnit (10583) · yt → endsWithArabicSentencePunct (10594)
 *   bt → endsWithMyanmarFullStop (10597) · xt → splitLeadingSpaceWithMarks (10601)
 *   St → endsWithClosingQuoteRun (10609) · Ct → classifyCharForTokenization (10621)
 *   wt → TOKEN_BOUNDARY_WS_RE (10632) · Tt → joinTokenParts (10634)
 *   Et → prependRepeatUnits (10637) · Dt → splitWordSegmentByCharKind (10642)
 *   Ot → isBreakableTokenKind (10673)
 *  URL/数字合并：
 *   kt → URL_SCHEME_RE (10678) · At → isUrlSchemeToken (10679)
 *   jt → looksLikeUrlQuery (10685) · Mt → mergeUrlTokens (10688)
 *   Nt → mergeUrlQueryTokens (10713)
 *   Pt → NUMERIC_INFIX_SET (10739) · Ft → PUNCT_OR_SYMBOL_RE (10740)
 *   It → EMOJI_PRESENTATION_RE (10741) · Lt → HYPHEN_LIKE_SET (10742)
 *   Rt → isAsciiPunctuation (10743) · zt → isBreakablePunctuation (10748)
 *   Bt → isBreakablePunctRun (10751) · Vt → endsWithBreakableOrCurrency (10758)
 *   Ht → shouldJoinAdjacentWords (10769) · Ut → containsDecimalDigit (10776)
 *   Wt → isNumericTokenText (10780) · Gt → mergeNumericTokens (10786)
 *   Kt → mergeAdjacentWordTokens (10812) · qt → splitHyphenatedNumbers (10845)
 *   Jt → mergeGlueTokens (10877) · Yt → splitCJKOpenPunctTails (10921)
 *  主管线：
 *   Xt → buildTokenStreamFromSegmenter (10934)
 *   Zt → splitChunksAtHardBreaks (11013)
 *   Qt → applyKeepAllToTokens (11034)
 *   $t → segmentTextToLayoutTokens（段入口）(11075)
 * ============================================================================
 */

/* ============================================================================
 * 类型
 * ==========================================================================*/

/** UAX#9 双向字符类型（本引擎使用的子集） */
export type BidiCharType =
  | `L` | `R` | `AL` | `AN` | `EN` | `ES` | `ET` | `CS`
  | `NSM` | `BN` | `B` | `S` | `WS` | `ON`;

/** white-space 归一模式（原 Ne 返回） */
export interface WhiteSpaceMode {
  mode: string;
  /** pre-wrap 下保留普通空格 */
  preserveOrdinarySpaces: boolean;
  /** pre-wrap 下保留硬换行（\n） */
  preserveHardBreaks: boolean;
}

/** 令牌类别（原 Ct 返回域） */
export type TokenKind =
  | `text`
  | `space`
  | `preserved-space`
  | `tab`
  | `hard-break`
  | `glue`
  | `zero-width-break`
  | `soft-hyphen`;

/** 令牌数组（各归并通道的中间形态；原代码所有通道共用的五元组） */
export interface TokenArray {
  len: number;
  texts: string[];
  isWordLike: boolean[];
  kinds: TokenKind[];
  /** 各令牌在归一文本中的起始偏移 */
  starts: number[];
}

/** 布局令牌流（原 $t 返回；供 [E2] buildWidthTable 消费） */
export interface LayoutTokenStream extends TokenArray {
  /** 归一后的文本（折叠空白或保留硬换行） */
  normalized: string;
  /** 硬换行分块（段索引区间；无硬换行 = 单块） */
  chunks: { startSegmentIndex: number; endSegmentIndex: number; consumedEndSegmentIndex: number }[];
}

/** 引擎排版怪癖开关（原 fn，[E2] jsx 11119；此处仅声明被本段消费的字段） */
export interface LineLayoutQuirks {
  lineFitEpsilon: number;
  carryCJKAfterClosingQuote: boolean;
  breakKeepAllAfterPunctuation: boolean;
  preferPrefixWidthsForBreakableRuns: boolean;
  preferEarlySoftHyphenBreak: boolean;
}

/* ============================================================================
 * §1 UAX#9 双向类型表与级别算法（原 Ee/De/Oe/ke/Ae，jsx 10303-10406）
 * ==========================================================================*/

/** 原 Ee（jsx 10303）：UAX#9 双向类型直接表（U+0000-U+00FF，256 项）—— 字符串逐字保留 */
export const BIDI_DIRECT_TYPES: readonly string[] = `BN.BN.BN.BN.BN.BN.BN.BN.BN.S.B.S.WS.B.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.B.B.B.S.WS.ON.ON.ET.ET.ET.ON.ON.ON.ON.ON.ES.CS.ES.CS.CS.EN.EN.EN.EN.EN.EN.EN.EN.EN.EN.CS.ON.ON.ON.ON.ON.ON.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.ON.ON.ON.ON.ON.ON.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.ON.ON.ON.ON.BN.BN.BN.BN.BN.BN.B.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.BN.CS.ON.ET.ET.ET.ET.ON.ON.ON.ON.L.ON.ON.BN.ON.ON.ET.ET.EN.EN.ON.L.ON.ON.ON.EN.L.ON.ON.ON.ON.ON.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.ON.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.L.ON.L.L.L.L.L.L.L.L`.split(`.`); // 256 项，原样保留
export interface BidiRangeEntry { readonly 0: number; readonly 1: number; readonly 2: string }
/** 原 De（jsx 10304）：UAX#9 双向类型区间表 [起, 止, 类型]（升序、不重叠）—— 数组逐字保留 */
export const BIDI_RANGE_TABLE: readonly BidiRangeEntry[] = [[697, 698, `ON`], [706, 719, `ON`], [722, 735, `ON`], [741, 749, `ON`], [751, 767, `ON`], [768, 879, `NSM`], [884, 885, `ON`], [894, 894, `ON`], [900, 901, `ON`], [903, 903, `ON`], [1014, 1014, `ON`], [1155, 1161, `NSM`], [1418, 1418, `ON`], [1421, 1422, `ON`], [1423, 1423, `ET`], [1424, 1424, `R`], [1425, 1469, `NSM`], [1470, 1470, `R`], [1471, 1471, `NSM`], [1472, 1472, `R`], [1473, 1474, `NSM`], [1475, 1475, `R`], [1476, 1477, `NSM`], [1478, 1478, `R`], [1479, 1479, `NSM`], [1480, 1535, `R`], [1536, 1541, `AN`], [1542, 1543, `ON`], [1544, 1544, `AL`], [1545, 1546, `ET`], [1547, 1547, `AL`], [1548, 1548, `CS`], [1549, 1549, `AL`], [1550, 1551, `ON`], [1552, 1562, `NSM`], [1563, 1610, `AL`], [1611, 1631, `NSM`], [1632, 1641, `AN`], [1642, 1642, `ET`], [1643, 1644, `AN`], [1645, 1647, `AL`], [1648, 1648, `NSM`], [1649, 1749, `AL`], [1750, 1756, `NSM`], [1757, 1757, `AN`], [1758, 1758, `ON`], [1759, 1764, `NSM`], [1765, 1766, `AL`], [1767, 1768, `NSM`], [1769, 1769, `ON`], [1770, 1773, `NSM`], [1774, 1775, `AL`], [1776, 1785, `EN`], [1786, 1808, `AL`], [1809, 1809, `NSM`], [1810, 1839, `AL`], [1840, 1866, `NSM`], [1867, 1957, `AL`], [1958, 1968, `NSM`], [1969, 1983, `AL`], [1984, 2026, `R`], [2027, 2035, `NSM`], [2036, 2037, `R`], [2038, 2041, `ON`], [2042, 2044, `R`], [2045, 2045, `NSM`], [2046, 2069, `R`], [2070, 2073, `NSM`], [2074, 2074, `R`], [2075, 2083, `NSM`], [2084, 2084, `R`], [2085, 2087, `NSM`], [2088, 2088, `R`], [2089, 2093, `NSM`], [2094, 2136, `R`], [2137, 2139, `NSM`], [2140, 2143, `R`], [2144, 2191, `AL`], [2192, 2193, `AN`], [2194, 2198, `AL`], [2199, 2207, `NSM`], [2208, 2249, `AL`], [2250, 2273, `NSM`], [2274, 2274, `AN`], [2275, 2306, `NSM`], [2362, 2362, `NSM`], [2364, 2364, `NSM`], [2369, 2376, `NSM`], [2381, 2381, `NSM`], [2385, 2391, `NSM`], [2402, 2403, `NSM`], [2433, 2433, `NSM`], [2492, 2492, `NSM`], [2497, 2500, `NSM`], [2509, 2509, `NSM`], [2530, 2531, `NSM`], [2546, 2547, `ET`], [2555, 2555, `ET`], [2558, 2558, `NSM`], [2561, 2562, `NSM`], [2620, 2620, `NSM`], [2625, 2626, `NSM`], [2631, 2632, `NSM`], [2635, 2637, `NSM`], [2641, 2641, `NSM`], [2672, 2673, `NSM`], [2677, 2677, `NSM`], [2689, 2690, `NSM`], [2748, 2748, `NSM`], [2753, 2757, `NSM`], [2759, 2760, `NSM`], [2765, 2765, `NSM`], [2786, 2787, `NSM`], [2801, 2801, `ET`], [2810, 2815, `NSM`], [2817, 2817, `NSM`], [2876, 2876, `NSM`], [2879, 2879, `NSM`], [2881, 2884, `NSM`], [2893, 2893, `NSM`], [2901, 2902, `NSM`], [2914, 2915, `NSM`], [2946, 2946, `NSM`], [3008, 3008, `NSM`], [3021, 3021, `NSM`], [3059, 3064, `ON`], [3065, 3065, `ET`], [3066, 3066, `ON`], [3072, 3072, `NSM`], [3076, 3076, `NSM`], [3132, 3132, `NSM`], [3134, 3136, `NSM`], [3142, 3144, `NSM`], [3146, 3149, `NSM`], [3157, 3158, `NSM`], [3170, 3171, `NSM`], [3192, 3198, `ON`], [3201, 3201, `NSM`], [3260, 3260, `NSM`], [3276, 3277, `NSM`], [3298, 3299, `NSM`], [3328, 3329, `NSM`], [3387, 3388, `NSM`], [3393, 3396, `NSM`], [3405, 3405, `NSM`], [3426, 3427, `NSM`], [3457, 3457, `NSM`], [3530, 3530, `NSM`], [3538, 3540, `NSM`], [3542, 3542, `NSM`], [3633, 3633, `NSM`], [3636, 3642, `NSM`], [3647, 3647, `ET`], [3655, 3662, `NSM`], [3761, 3761, `NSM`], [3764, 3772, `NSM`], [3784, 3790, `NSM`], [3864, 3865, `NSM`], [3893, 3893, `NSM`], [3895, 3895, `NSM`], [3897, 3897, `NSM`], [3898, 3901, `ON`], [3953, 3966, `NSM`], [3968, 3972, `NSM`], [3974, 3975, `NSM`], [3981, 3991, `NSM`], [3993, 4028, `NSM`], [4038, 4038, `NSM`], [4141, 4144, `NSM`], [4146, 4151, `NSM`], [4153, 4154, `NSM`], [4157, 4158, `NSM`], [4184, 4185, `NSM`], [4190, 4192, `NSM`], [4209, 4212, `NSM`], [4226, 4226, `NSM`], [4229, 4230, `NSM`], [4237, 4237, `NSM`], [4253, 4253, `NSM`], [4957, 4959, `NSM`], [5008, 5017, `ON`], [5120, 5120, `ON`], [5760, 5760, `WS`], [5787, 5788, `ON`], [5906, 5908, `NSM`], [5938, 5939, `NSM`], [5970, 5971, `NSM`], [6002, 6003, `NSM`], [6068, 6069, `NSM`], [6071, 6077, `NSM`], [6086, 6086, `NSM`], [6089, 6099, `NSM`], [6107, 6107, `ET`], [6109, 6109, `NSM`], [6128, 6137, `ON`], [6144, 6154, `ON`], [6155, 6157, `NSM`], [6158, 6158, `BN`], [6159, 6159, `NSM`], [6277, 6278, `NSM`], [6313, 6313, `NSM`], [6432, 6434, `NSM`], [6439, 6440, `NSM`], [6450, 6450, `NSM`], [6457, 6459, `NSM`], [6464, 6464, `ON`], [6468, 6469, `ON`], [6622, 6655, `ON`], [6679, 6680, `NSM`], [6683, 6683, `NSM`], [6742, 6742, `NSM`], [6744, 6750, `NSM`], [6752, 6752, `NSM`], [6754, 6754, `NSM`], [6757, 6764, `NSM`], [6771, 6780, `NSM`], [6783, 6783, `NSM`], [6832, 6877, `NSM`], [6880, 6891, `NSM`], [6912, 6915, `NSM`], [6964, 6964, `NSM`], [6966, 6970, `NSM`], [6972, 6972, `NSM`], [6978, 6978, `NSM`], [7019, 7027, `NSM`], [7040, 7041, `NSM`], [7074, 7077, `NSM`], [7080, 7081, `NSM`], [7083, 7085, `NSM`], [7142, 7142, `NSM`], [7144, 7145, `NSM`], [7149, 7149, `NSM`], [7151, 7153, `NSM`], [7212, 7219, `NSM`], [7222, 7223, `NSM`], [7376, 7378, `NSM`], [7380, 7392, `NSM`], [7394, 7400, `NSM`], [7405, 7405, `NSM`], [7412, 7412, `NSM`], [7416, 7417, `NSM`], [7616, 7679, `NSM`], [8125, 8125, `ON`], [8127, 8129, `ON`], [8141, 8143, `ON`], [8157, 8159, `ON`], [8173, 8175, `ON`], [8189, 8190, `ON`], [8192, 8202, `WS`], [8203, 8205, `BN`], [8207, 8207, `R`], [8208, 8231, `ON`], [8232, 8232, `WS`], [8233, 8233, `B`], [8234, 8238, `BN`], [8239, 8239, `CS`], [8240, 8244, `ET`], [8245, 8259, `ON`], [8260, 8260, `CS`], [8261, 8286, `ON`], [8287, 8287, `WS`], [8288, 8303, `BN`], [8304, 8304, `EN`], [8308, 8313, `EN`], [8314, 8315, `ES`], [8316, 8318, `ON`], [8320, 8329, `EN`], [8330, 8331, `ES`], [8332, 8334, `ON`], [8352, 8399, `ET`], [8400, 8432, `NSM`], [8448, 8449, `ON`], [8451, 8454, `ON`], [8456, 8457, `ON`], [8468, 8468, `ON`], [8470, 8472, `ON`], [8478, 8483, `ON`], [8485, 8485, `ON`], [8487, 8487, `ON`], [8489, 8489, `ON`], [8494, 8494, `ET`], [8506, 8507, `ON`], [8512, 8516, `ON`], [8522, 8525, `ON`], [8528, 8543, `ON`], [8585, 8587, `ON`], [8592, 8721, `ON`], [8722, 8722, `ES`], [8723, 8723, `ET`], [8724, 9013, `ON`], [9083, 9108, `ON`], [9110, 9257, `ON`], [9280, 9290, `ON`], [9312, 9351, `ON`], [9352, 9371, `EN`], [9450, 9899, `ON`], [9901, 10239, `ON`], [10496, 11123, `ON`], [11126, 11263, `ON`], [11493, 11498, `ON`], [11503, 11505, `NSM`], [11513, 11519, `ON`], [11647, 11647, `NSM`], [11744, 11775, `NSM`], [11776, 11869, `ON`], [11904, 11929, `ON`], [11931, 12019, `ON`], [12032, 12245, `ON`], [12272, 12287, `ON`], [12288, 12288, `WS`], [12289, 12292, `ON`], [12296, 12320, `ON`], [12330, 12333, `NSM`], [12336, 12336, `ON`], [12342, 12343, `ON`], [12349, 12351, `ON`], [12441, 12442, `NSM`], [12443, 12444, `ON`], [12448, 12448, `ON`], [12539, 12539, `ON`], [12736, 12773, `ON`], [12783, 12783, `ON`], [12829, 12830, `ON`], [12880, 12895, `ON`], [12924, 12926, `ON`], [12977, 12991, `ON`], [13004, 13007, `ON`], [13175, 13178, `ON`], [13278, 13279, `ON`], [13311, 13311, `ON`], [19904, 19967, `ON`], [42128, 42182, `ON`], [42509, 42511, `ON`], [42607, 42610, `NSM`], [42611, 42611, `ON`], [42612, 42621, `NSM`], [42622, 42623, `ON`], [42654, 42655, `NSM`], [42736, 42737, `NSM`], [42752, 42785, `ON`], [42888, 42888, `ON`], [43010, 43010, `NSM`], [43014, 43014, `NSM`], [43019, 43019, `NSM`], [43045, 43046, `NSM`], [43048, 43051, `ON`], [43052, 43052, `NSM`], [43064, 43065, `ET`], [43124, 43127, `ON`], [43204, 43205, `NSM`], [43232, 43249, `NSM`], [43263, 43263, `NSM`], [43302, 43309, `NSM`], [43335, 43345, `NSM`], [43392, 43394, `NSM`], [43443, 43443, `NSM`], [43446, 43449, `NSM`], [43452, 43453, `NSM`], [43493, 43493, `NSM`], [43561, 43566, `NSM`], [43569, 43570, `NSM`], [43573, 43574, `NSM`], [43587, 43587, `NSM`], [43596, 43596, `NSM`], [43644, 43644, `NSM`], [43696, 43696, `NSM`], [43698, 43700, `NSM`], [43703, 43704, `NSM`], [43710, 43711, `NSM`], [43713, 43713, `NSM`], [43756, 43757, `NSM`], [43766, 43766, `NSM`], [43882, 43883, `ON`], [44005, 44005, `NSM`], [44008, 44008, `NSM`], [44013, 44013, `NSM`], [64285, 64285, `R`], [64286, 64286, `NSM`], [64287, 64296, `R`], [64297, 64297, `ES`], [64298, 64335, `R`], [64336, 64450, `AL`], [64451, 64466, `ON`], [64467, 64829, `AL`], [64830, 64847, `ON`], [64848, 64911, `AL`], [64912, 64913, `ON`], [64914, 64967, `AL`], [64968, 64975, `ON`], [64976, 65007, `BN`], [65008, 65020, `AL`], [65021, 65023, `ON`], [65024, 65039, `NSM`], [65040, 65049, `ON`], [65056, 65071, `NSM`], [65072, 65103, `ON`], [65104, 65104, `CS`], [65105, 65105, `ON`], [65106, 65106, `CS`], [65108, 65108, `ON`], [65109, 65109, `CS`], [65110, 65118, `ON`], [65119, 65119, `ET`], [65120, 65121, `ON`], [65122, 65123, `ES`], [65124, 65126, `ON`], [65128, 65128, `ON`], [65129, 65130, `ET`], [65131, 65131, `ON`], [65136, 65278, `AL`], [65279, 65279, `BN`], [65281, 65282, `ON`], [65283, 65285, `ET`], [65286, 65290, `ON`], [65291, 65291, `ES`], [65292, 65292, `CS`], [65293, 65293, `ES`], [65294, 65295, `CS`], [65296, 65305, `EN`], [65306, 65306, `CS`], [65307, 65312, `ON`], [65339, 65344, `ON`], [65371, 65381, `ON`], [65504, 65505, `ET`], [65506, 65508, `ON`], [65509, 65510, `ET`], [65512, 65518, `ON`], [65520, 65528, `BN`], [65529, 65533, `ON`], [65534, 65535, `BN`], [65793, 65793, `ON`], [65856, 65932, `ON`], [65936, 65948, `ON`], [65952, 65952, `ON`], [66045, 66045, `NSM`], [66272, 66272, `NSM`], [66273, 66299, `EN`], [66422, 66426, `NSM`], [67584, 67870, `R`], [67871, 67871, `ON`], [67872, 68096, `R`], [68097, 68099, `NSM`], [68100, 68100, `R`], [68101, 68102, `NSM`], [68103, 68107, `R`], [68108, 68111, `NSM`], [68112, 68151, `R`], [68152, 68154, `NSM`], [68155, 68158, `R`], [68159, 68159, `NSM`], [68160, 68324, `R`], [68325, 68326, `NSM`], [68327, 68408, `R`], [68409, 68415, `ON`], [68416, 68863, `R`], [68864, 68899, `AL`], [68900, 68903, `NSM`], [68904, 68911, `AL`], [68912, 68921, `AN`], [68922, 68927, `AL`], [68928, 68937, `AN`], [68938, 68968, `R`], [68969, 68973, `NSM`], [68974, 68974, `ON`], [68975, 69215, `R`], [69216, 69246, `AN`], [69247, 69290, `R`], [69291, 69292, `NSM`], [69293, 69311, `R`], [69312, 69327, `AL`], [69328, 69336, `ON`], [69337, 69369, `AL`], [69370, 69375, `NSM`], [69376, 69423, `R`], [69424, 69445, `AL`], [69446, 69456, `NSM`], [69457, 69487, `AL`], [69488, 69505, `R`], [69506, 69509, `NSM`], [69510, 69631, `R`], [69633, 69633, `NSM`], [69688, 69702, `NSM`], [69714, 69733, `ON`], [69744, 69744, `NSM`], [69747, 69748, `NSM`], [69759, 69761, `NSM`], [69811, 69814, `NSM`], [69817, 69818, `NSM`], [69826, 69826, `NSM`], [69888, 69890, `NSM`], [69927, 69931, `NSM`], [69933, 69940, `NSM`], [70003, 70003, `NSM`], [70016, 70017, `NSM`], [70070, 70078, `NSM`], [70089, 70092, `NSM`], [70095, 70095, `NSM`], [70191, 70193, `NSM`], [70196, 70196, `NSM`], [70198, 70199, `NSM`], [70206, 70206, `NSM`], [70209, 70209, `NSM`], [70367, 70367, `NSM`], [70371, 70378, `NSM`], [70400, 70401, `NSM`], [70459, 70460, `NSM`], [70464, 70464, `NSM`], [70502, 70508, `NSM`], [70512, 70516, `NSM`], [70587, 70592, `NSM`], [70606, 70606, `NSM`], [70608, 70608, `NSM`], [70610, 70610, `NSM`], [70625, 70626, `NSM`], [70712, 70719, `NSM`], [70722, 70724, `NSM`], [70726, 70726, `NSM`], [70750, 70750, `NSM`], [70835, 70840, `NSM`], [70842, 70842, `NSM`], [70847, 70848, `NSM`], [70850, 70851, `NSM`], [71090, 71093, `NSM`], [71100, 71101, `NSM`], [71103, 71104, `NSM`], [71132, 71133, `NSM`], [71219, 71226, `NSM`], [71229, 71229, `NSM`], [71231, 71232, `NSM`], [71264, 71276, `ON`], [71339, 71339, `NSM`], [71341, 71341, `NSM`], [71344, 71349, `NSM`], [71351, 71351, `NSM`], [71453, 71453, `NSM`], [71455, 71455, `NSM`], [71458, 71461, `NSM`], [71463, 71467, `NSM`], [71727, 71735, `NSM`], [71737, 71738, `NSM`], [71995, 71996, `NSM`], [71998, 71998, `NSM`], [72003, 72003, `NSM`], [72148, 72151, `NSM`], [72154, 72155, `NSM`], [72160, 72160, `NSM`], [72193, 72198, `NSM`], [72201, 72202, `NSM`], [72243, 72248, `NSM`], [72251, 72254, `NSM`], [72263, 72263, `NSM`], [72273, 72278, `NSM`], [72281, 72283, `NSM`], [72330, 72342, `NSM`], [72344, 72345, `NSM`], [72544, 72544, `NSM`], [72546, 72548, `NSM`], [72550, 72550, `NSM`], [72752, 72758, `NSM`], [72760, 72765, `NSM`], [72850, 72871, `NSM`], [72874, 72880, `NSM`], [72882, 72883, `NSM`], [72885, 72886, `NSM`], [73009, 73014, `NSM`], [73018, 73018, `NSM`], [73020, 73021, `NSM`], [73023, 73029, `NSM`], [73031, 73031, `NSM`], [73104, 73105, `NSM`], [73109, 73109, `NSM`], [73111, 73111, `NSM`], [73459, 73460, `NSM`], [73472, 73473, `NSM`], [73526, 73530, `NSM`], [73536, 73536, `NSM`], [73538, 73538, `NSM`], [73562, 73562, `NSM`], [73685, 73692, `ON`], [73693, 73696, `ET`], [73697, 73713, `ON`], [78912, 78912, `NSM`], [78919, 78933, `NSM`], [90398, 90409, `NSM`], [90413, 90415, `NSM`], [92912, 92916, `NSM`], [92976, 92982, `NSM`], [94031, 94031, `NSM`], [94095, 94098, `NSM`], [94178, 94178, `ON`], [94180, 94180, `NSM`], [113821, 113822, `NSM`], [113824, 113827, `BN`], [117760, 117973, `ON`], [118e3, 118009, `EN`], [118010, 118012, `ON`], [118016, 118451, `ON`], [118458, 118480, `ON`], [118496, 118512, `ON`], [118528, 118573, `NSM`], [118576, 118598, `NSM`], [119143, 119145, `NSM`], [119155, 119162, `BN`], [119163, 119170, `NSM`], [119173, 119179, `NSM`], [119210, 119213, `NSM`], [119273, 119274, `ON`], [119296, 119361, `ON`], [119362, 119364, `NSM`], [119365, 119365, `ON`], [119552, 119638, `ON`], [120513, 120513, `ON`], [120539, 120539, `ON`], [120571, 120571, `ON`], [120597, 120597, `ON`], [120629, 120629, `ON`], [120655, 120655, `ON`], [120687, 120687, `ON`], [120713, 120713, `ON`], [120745, 120745, `ON`], [120771, 120771, `ON`], [120782, 120831, `EN`], [121344, 121398, `NSM`], [121403, 121452, `NSM`], [121461, 121461, `NSM`], [121476, 121476, `NSM`], [121499, 121503, `NSM`], [121505, 121519, `NSM`], [122880, 122886, `NSM`], [122888, 122904, `NSM`], [122907, 122913, `NSM`], [122915, 122916, `NSM`], [122918, 122922, `NSM`], [123023, 123023, `NSM`], [123184, 123190, `NSM`], [123566, 123566, `NSM`], [123628, 123631, `NSM`], [123647, 123647, `ET`], [124140, 124143, `NSM`], [124398, 124399, `NSM`], [124643, 124643, `NSM`], [124646, 124646, `NSM`], [124654, 124655, `NSM`], [124661, 124661, `NSM`], [124928, 125135, `R`], [125136, 125142, `NSM`], [125143, 125251, `R`], [125252, 125258, `NSM`], [125259, 126063, `R`], [126064, 126143, `AL`], [126144, 126207, `R`], [126208, 126287, `AL`], [126288, 126463, `R`], [126464, 126703, `AL`], [126704, 126705, `ON`], [126706, 126719, `AL`], [126720, 126975, `R`], [126976, 127019, `ON`], [127024, 127123, `ON`], [127136, 127150, `ON`], [127153, 127167, `ON`], [127169, 127183, `ON`], [127185, 127221, `ON`], [127232, 127242, `EN`], [127243, 127247, `ON`], [127279, 127279, `ON`], [127338, 127343, `ON`], [127405, 127405, `ON`], [127584, 127589, `ON`], [127744, 128728, `ON`], [128732, 128748, `ON`], [128752, 128764, `ON`], [128768, 128985, `ON`], [128992, 129003, `ON`], [129008, 129008, `ON`], [129024, 129035, `ON`], [129040, 129095, `ON`], [129104, 129113, `ON`], [129120, 129159, `ON`], [129168, 129197, `ON`], [129200, 129211, `ON`], [129216, 129217, `ON`], [129232, 129240, `ON`], [129280, 129623, `ON`], [129632, 129645, `ON`], [129648, 129660, `ON`], [129664, 129674, `ON`], [129678, 129734, `ON`], [129736, 129736, `ON`], [129741, 129756, `ON`], [129759, 129770, `ON`], [129775, 129784, `ON`], [129792, 129938, `ON`], [129940, 130031, `ON`], [130032, 130041, `EN`], [130042, 130042, `ON`], [131070, 131071, `BN`], [196606, 196607, `BN`], [262142, 262143, `BN`], [327678, 327679, `BN`], [393214, 393215, `BN`], [458750, 458751, `BN`], [524286, 524287, `BN`], [589822, 589823, `BN`], [655358, 655359, `BN`], [720894, 720895, `BN`], [786430, 786431, `BN`], [851966, 851967, `BN`], [917502, 917759, `BN`], [917760, 917999, `NSM`], [918e3, 921599, `BN`], [983038, 983039, `BN`], [1048574, 1048575, `BN`], [1114110, 1114111, `BN`]]; // 原样保留

/** 原 Oe：码位 → 双向类型（≤255 查直接表，否则二分区间表，缺省 L） */
export function getBidiCharType(codePoint: number): BidiCharType {
  if (codePoint <= 255) return BIDI_DIRECT_TYPES[codePoint] as BidiCharType;
  let lo = 0,
    hi = BIDI_RANGE_TABLE.length - 1;
  for (; lo <= hi;) {
    const mid = (lo + hi) >> 1,
      entry = BIDI_RANGE_TABLE[mid];
    if (codePoint < entry[0]) {
      hi = mid - 1;
      continue;
    }
    if (codePoint > entry[1]) {
      lo = mid + 1;
      continue;
    }
    return entry[2] as BidiCharType;
  }
  return `L`;
}

/**
 * 原 ke：UAX#9 级别算法（子集）——
 * P2 段落方向（首个 L / R|AL 定 0/1 级；无 RTL 字符返回 null 表示无需 BiDi）；
 * X1 简化（全段同段落级）；W2（AL+EN→AN）、W4（ES/CS 夹合同类数字）、
 * W5（ET 邻 EN）、W6（残余 ES/ET/CS→ON）、W7（L+EN→L）、
 * N1/N2（ON 夹同向→同向，否则段落方向）；I1/I2 隐式级别。
 * 返回每字符级别（Int8Array），纯 LTR 文本返回 null。
 */
export function computeBidiLevels(text: string): Int8Array | null {
  const length = text.length;
  if (length === 0) return null;
  const types: BidiCharType[] = Array(length);
  let hasRtl = false;
  for (let i = 0; i < length;) {
    const hi = text.charCodeAt(i);
    let codePoint = hi,
      units = 1;
    if (hi >= 55296 && hi <= 56319 && i + 1 < length) {
      const lo = text.charCodeAt(i + 1);
      lo >= 56320 && lo <= 57343 && ((codePoint = ((hi - 55296) << 10) + (lo - 56320) + 65536), (units = 2));
    }
    const type = getBidiCharType(codePoint);
    (type === `R` || type === `AL` || type === `AN`) && (hasRtl = true);
    for (let k = 0; k < units; k++) types[i + k] = type;
    i += units;
  }
  if (!hasRtl) return null;
  // P2：首个强类型定段落方向
  let paragraphLevel = 0;
  for (let i = 0; i < length; i++) {
    const type = types[i];
    if (type === `L`) {
      paragraphLevel = 0;
      break;
    }
    if (type === `R` || type === `AL`) {
      paragraphLevel = 1;
      break;
    }
  }
  const levels = new Int8Array(length);
  for (let i = 0; i < length; i++) levels[i] = paragraphLevel;
  const paragraphType: BidiCharType = paragraphLevel & 1 ? `R` : `L`;
  let lastStrong: BidiCharType = paragraphType;
  // X1 简化：NSM 继承前一字符类型
  for (let i = 0; i < length; i++) types[i] === `NSM` ? (types[i] = lastStrong) : (lastStrong = types[i]);
  // W2：AL 后的 EN → AN
  lastStrong = paragraphType;
  for (let i = 0; i < length; i++) {
    const type = types[i];
    type === `EN` ? (types[i] = lastStrong === `AL` ? `AN` : `EN`) : (type === `R` || type === `L` || type === `AL`) && (lastStrong = type);
  }
  // AL → R
  for (let i = 0; i < length; i++) types[i] === `AL` && (types[i] = `R`);
  // W4：EN/AN 之间的 ES/CS 同化
  for (let i = 1; i < length - 1; i++)
    types[i] === `ES` && types[i - 1] === `EN` && types[i + 1] === `EN` && (types[i] = `EN`),
      types[i] === `CS` && (types[i - 1] === `EN` || types[i - 1] === `AN`) && types[i + 1] === types[i - 1] && (types[i] = types[i - 1]);
  // W5：ET 与相邻 EN 同化
  for (let i = 0; i < length; i++) {
    if (types[i] !== `EN`) continue;
    let k;
    for (k = i - 1; k >= 0 && types[k] === `ET`; k--) types[k] = `EN`;
    for (k = i + 1; k < length && types[k] === `ET`; k++) types[k] = `EN`;
  }
  // W6：残余 WS/ES/ET/CS → ON
  for (let i = 0; i < length; i++) {
    const type = types[i];
    (type === `WS` || type === `ES` || type === `ET` || type === `CS`) && (types[i] = `ON`);
  }
  // W7：L 后的 EN → L
  lastStrong = paragraphType;
  for (let i = 0; i < length; i++) {
    const type = types[i];
    type === `EN` ? (types[i] = lastStrong === `L` ? `L` : `EN`) : (type === `R` || type === `L`) && (lastStrong = type);
  }
  // N1/N2：ON 串两侧同向则同化，否则段落方向
  for (let i = 0; i < length; i++) {
    if (types[i] !== `ON`) continue;
    let end = i + 1;
    for (; end < length && types[end] === `ON`;) end++;
    const before = i > 0 ? types[i - 1] : paragraphType,
      after = end < length ? types[end] : paragraphType,
      beforeDir = before === `L` ? `L` : `R`;
    if (beforeDir === (after === `L` ? `L` : `R`)) for (let k = i; k < end; k++) types[k] = beforeDir;
    i = end - 1;
  }
  for (let i = 0; i < length; i++) types[i] === `ON` && (types[i] = paragraphType);
  // I1/I2：隐式级别（偶=LTR 基，奇=RTL）
  for (let i = 0; i < length; i++) {
    const type = types[i];
    levels[i] & 1
      ? (type === `L` || type === `AN` || type === `EN`) && levels[i]++
      : type === `R`
        ? levels[i]++
        : (type === `AN` || type === `EN`) && (levels[i] += 2);
  }
  return levels;
}

/** 原 Ae：全文级别 → 各段（按段首偏移取样）级别；无 RTL 返回 null */
export function mapBidiLevelsToSegmentStarts(normalizedText: string, segmentStarts: number[]): Int8Array | null {
  const levels = computeBidiLevels(normalizedText);
  if (levels === null) return null;
  const segLevels = new Int8Array(segmentStarts.length);
  for (let i = 0; i < segmentStarts.length; i++) segLevels[i] = levels[segmentStarts[i]];
  return segLevels;
}

/* ============================================================================
 * §2 空白归一（原 je/Me/Ne/Pe/Fe，jsx 10407-10428）
 * ==========================================================================*/

/** 原 je：可折叠空白（空格/制表/换行/换页/回车） */
const COLLAPSIBLE_WS_RE = /[ \t\n\r\f]+/g;
/** 原 Me：需要归一的迹象（硬空白、连续空格、首尾空格） */
const NEEDS_WS_NORMALIZE_RE = /[\t\n\r\f]| {2,}|^ | $/;

/** 原 Ne：white-space 值 → 归一模式（仅 pre-wrap 保留空格与硬换行） */
export function resolveWhiteSpaceMode(whiteSpace: string | undefined): WhiteSpaceMode {
  const mode = whiteSpace ?? `normal`;
  return mode === `pre-wrap`
    ? { mode, preserveOrdinarySpaces: true, preserveHardBreaks: true }
    : { mode, preserveOrdinarySpaces: false, preserveHardBreaks: false };
}

/** 原 Pe：折叠空白为单空格并去首尾空格（无迹象则原样返回） */
export function normalizeCollapsibleSpaces(text: string): string {
  if (!NEEDS_WS_NORMALIZE_RE.test(text)) return text;
  let result = text.replace(COLLAPSIBLE_WS_RE, ` `);
  return (
    result.charCodeAt(0) === 32 && (result = result.slice(1)),
    result.length > 0 && result.charCodeAt(result.length - 1) === 32 && (result = result.slice(0, -1)),
    result
  );
}

/** 原 Fe：\r\n、\r、\f → \n（无则原样返回） */
export function normalizeHardLineBreaks(text: string): string {
  return /[\r\f]/.test(text) ? text.replace(/\r\n/g, `\n`).replace(/[\r\f]/g, `\n`) : text;
}

/* ============================================================================
 * §3 词切分宿主与脚本探测（原 Ie..We，jsx 10429-10467）
 * ==========================================================================*/

let cachedWordSegmenter: Intl.Segmenter | null = null; // 原 Ie
let wordSegmenterLocale: string | undefined; // 原 Le（始终 undefined = 默认 locale）

/** 原 Re：词粒度 Intl.Segmenter 单例 */
export function getWordSegmenter(): Intl.Segmenter {
  return cachedWordSegmenter === null && (cachedWordSegmenter = new Intl.Segmenter(wordSegmenterLocale, { granularity: `word` })), cachedWordSegmenter;
}

/** 原 ze：阿拉伯脚本探测 */
export const ARABIC_SCRIPT_RE = /\p{Script=Arabic}/u;
/** 原 Be：组合记号（\p{M}）——标点簇判定的“附着物” */
export const COMBINING_MARK_RE = /\p{M}/u;
/** 原 Ve：十进制数字（\p{Nd}） */
export const DECIMAL_DIGIT_RE = /\p{Nd}/u;

/** 原 He：含阿拉伯字符 */
export function containsArabic(text: string): boolean {
  return ARABIC_SCRIPT_RE.test(text);
}

/** 原 Ue：CJK 及东亚表意/音节文字码位判定（统一表意区/扩展 A-G/兼容/
 * 全角形/假名/谚文） */
export function isCJKCodePoint(codePoint: number): boolean {
  return (
    (codePoint >= 19968 && codePoint <= 40959) ||
    (codePoint >= 13312 && codePoint <= 19903) ||
    (codePoint >= 131072 && codePoint <= 173791) ||
    (codePoint >= 173824 && codePoint <= 177983) ||
    (codePoint >= 177984 && codePoint <= 178207) ||
    (codePoint >= 178208 && codePoint <= 183983) ||
    (codePoint >= 183984 && codePoint <= 191471) ||
    (codePoint >= 191472 && codePoint <= 192093) ||
    (codePoint >= 194560 && codePoint <= 195103) ||
    (codePoint >= 196608 && codePoint <= 201551) ||
    (codePoint >= 201552 && codePoint <= 205743) ||
    (codePoint >= 205744 && codePoint <= 210041) ||
    (codePoint >= 63744 && codePoint <= 64255) ||
    (codePoint >= 12288 && codePoint <= 12351) ||
    (codePoint >= 12352 && codePoint <= 12447) ||
    (codePoint >= 12448 && codePoint <= 12543) ||
    (codePoint >= 12592 && codePoint <= 12687) ||
    (codePoint >= 44032 && codePoint <= 55215) ||
    (codePoint >= 65280 && codePoint <= 65519)
  );
}

/** 原 We：文本含 CJK（代理对展开；<12288 快速排除） */
export function containsCJK(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (!(code < 12288)) {
      if (code >= 55296 && code <= 56319 && i + 1 < text.length) {
        const lo = text.charCodeAt(i + 1);
        if (lo >= 56320 && lo <= 57343) {
          if (isCJKCodePoint(((code - 55296) << 10) + (lo - 56320) + 65536)) return true;
          i++;
          continue;
        }
      }
      if (isCJKCodePoint(code)) return true;
    }
  }
  return false;
}

/** 原 Ge：末字素为 CJK 禁则闭标点（Xe）或通用闭标点（$e） */
export function endsWithCJKClosingPunct(text: string): boolean {
  const last = lastGraphemeCluster(text);
  return last !== null && (CJK_NO_LINE_START_SET.has(last) || CLOSE_PUNCT_SET.has(last));
}

/* ============================================================================
 * §4 标点/空白集合与断行许可（原 Ke..nt + qe/Je/Ye，jsx 10468-10487）
 * ==========================================================================*/

/** 原 Ke（jsx 10468）：不间断空白集（NBSP/NNBSP/WJ/ZWNBSP），断行时视为粘合 —— 数据逐字保留 */
export const NON_BREAK_SPACE_SET = new Set([`\xA0`, ` `, `⁠`, `﻿`]);
/** 原 Q（jsx 10469）：连字符族 —— 数据逐字保留 */
export const HYPHEN_CHAR_SET = new Set([`-`, `‐`, `–`, `—`]);
/** 原 Xe（jsx 10481）：CJK 禁则：不得置于行首的标点/长音/叠字号 —— 数据逐字保留 */
export const CJK_NO_LINE_START_SET = new Set(`，.．.！.：.；.？.、.。.・.）.〕.〉.》.」.』.】.〗.〙.〛.ー.々.〻.ゝ.ゞ.ヽ.ヾ`.split(`.`));
/** 原 Ze（jsx 10482）：开引号/开括号族（含全角与倒置引号） —— 数据逐字保留 */
export const OPEN_PUNCT_SET = new Set([`"`, `(`, `[`, `{`, `¡`, `¿`, `“`, `‘`, `‚`, `„`, `«`, `‹`, `⸘`, `（`, `〔`, `〈`, `《`, `「`, `『`, `【`, `〖`, `〘`, `〚`]);
/** 原 Qe（jsx 10483）：撇号族 —— 数据逐字保留 */
export const APOSTROPHE_SET = new Set([`'`, `’`]);
/** 原 $e（jsx 10484）：闭标点族（句读/闭括号/百分号/省略号等） —— 数据逐字保留 */
export const CLOSE_PUNCT_SET = new Set(`.(,(!(?(:(;(،(؛(؟(।(॥(၊(။(၌(၍(၏()(](}(%("(”(’(»(›(…`.split(`(`));
/** 原 et（jsx 10485）：阿拉伯语句子收尾标点 —— 数据逐字保留 */
export const ARABIC_SENTENCE_END_SET = new Set([`:`, `.`, `،`, `؛`]);
/** 原 tt（jsx 10486）：缅甸语句号 —— 数据逐字保留 */
export const MYANMAR_FULL_STOP_SET = new Set([`၏`]);
/** 原 nt（jsx 10487）：闭引号族 —— 数据逐字保留 */
export const CLOSING_QUOTE_SET = new Set([`”`, `’`, `»`, `›`, `」`, `』`, `】`, `》`, `〉`, `〕`, `）`]);

/** 原 qe：末字素为不间断空白（粘合，不可断） */
export function endsWithNoBreakSpace(text: string): boolean {
  const last = lastGraphemeCluster(text);
  return last !== null && NON_BREAK_SPACE_SET.has(last);
}

/** 原 Je：末字素为连字符族 */
export function endsWithHyphen(text: string): boolean {
  const last = lastGraphemeCluster(text);
  return last !== null && HYPHEN_CHAR_SET.has(last);
}

/**
 * 原 Ye：前一令牌之后是否允许断行——
 * 末尾粘合空白 → 否；keepAllAfterPunctuation 模式下末尾为
 * CJK 闭标点或连字符 → 否；其余 → 是。
 */
export function allowsBreakAfter(text: string, keepAllAfterPunctuation: boolean): boolean {
  return endsWithNoBreakSpace(text) ? false : keepAllAfterPunctuation ? !(endsWithCJKClosingPunct(text) || endsWithHyphen(text)) : true;
}

/* ============================================================================
 * §5 标点簇判定与字素助手（原 rt..ut，jsx 10488-10546）
 * ==========================================================================*/

/** 原 rt：闭标点簇——全由闭标点/货币符（可后随组合记号）组成且至少一个标点 */
export function isClosingPunctCluster(text: string): boolean {
  if (isPurePunctRun(text)) return true;
  let seenPunct = false;
  for (const ch of text) {
    if (CLOSE_PUNCT_SET.has(ch) || isCurrencySign(ch)) {
      seenPunct = true;
      continue;
    }
    if (!(seenPunct && COMBINING_MARK_RE.test(ch))) return false;
  }
  return seenPunct;
}

/** 原 it：CJK 闭标点串（全为 Xe∪$e 且非空）——粘着到前词 */
export function isCJKClosingPunctRun(text: string): boolean {
  for (const ch of text) if (!CJK_NO_LINE_START_SET.has(ch) && !CLOSE_PUNCT_SET.has(ch)) return false;
  return text.length > 0;
}

/** 原 at：开标点串（全为开标点/撇号/组合记号/货币符且非空）——粘着到后词 */
export function isOpenPunctRun(text: string): boolean {
  if (isPurePunctRun(text)) return true;
  for (const ch of text) if (!OPEN_PUNCT_SET.has(ch) && !APOSTROPHE_SET.has(ch) && !COMBINING_MARK_RE.test(ch) && !isCurrencySign(ch)) return false;
  return text.length > 0;
}

/** 原 ot：纯标点串（仅标点/反斜杠/组合记号，且至少一个标点） */
export function isPurePunctRun(text: string): boolean {
  let seenPunct = false;
  for (const ch of text)
    if (!(ch === `\\` || COMBINING_MARK_RE.test(ch))) {
      if (OPEN_PUNCT_SET.has(ch) || CLOSE_PUNCT_SET.has(ch) || APOSTROPHE_SET.has(ch)) {
        seenPunct = true;
        continue;
      }
      return false;
    }
  return seenPunct;
}

/** 原 st：endIndex 前一个字素簇的起点（代理对感知） */
export function prevGraphemeBoundary(text: string, endIndex: number): number {
  let index = endIndex - 1;
  if (index <= 0) return Math.max(index, 0);
  const lo = text.charCodeAt(index);
  if (lo < 56320 || lo > 57343) return index;
  const prev = index - 1;
  if (prev < 0) return index;
  const hi = text.charCodeAt(prev);
  return hi >= 55296 && hi <= 56319 ? prev : index;
}

/** 原 ct：末字素簇（空串 → null） */
export function lastGraphemeCluster(text: string): string | null {
  if (text.length === 0) return null;
  const start = prevGraphemeBoundary(text, text.length);
  return text.slice(start);
}

/** 原 lt：首个非组合记号字符 */
export function firstNonMarkChar(text: string): string | null {
  for (const ch of text) if (!COMBINING_MARK_RE.test(ch)) return ch;
  return null;
}

/** 原 ut：末尾非组合记号字素簇（跳过尾部记号） */
export function lastNonMarkCluster(text: string): string | null {
  for (let end = text.length; end > 0;) {
    const start = prevGraphemeBoundary(text, end),
      cluster = text.slice(start, end);
    if (!COMBINING_MARK_RE.test(cluster)) return cluster;
    end = start;
  }
  return null;
}

/* ============================================================================
 * §6 货币符与数字助手（原 dt..ht，jsx 10548-10562）
 * ==========================================================================*/

/** 原 dt（jsx 10548）：货币/度量符号码位区间（成对 [起,止]） —— 数据逐字保留 */
export const CURRENCY_SIGN_RANGES = [36, 37, 43, 43, 92, 92, 162, 165, 176, 177, 1423, 1423, 1545, 1547, 1642, 1642, 2046, 2047, 2546, 2547, 2553, 2555, 2801, 2801, 3065, 3065, 3449, 3449, 3647, 3647, 6107, 6107, 8240, 8247, 8279, 8279, 8352, 8399, 8451, 8451, 8457, 8457, 8470, 8470, 8722, 8723, 43064, 43064, 65020, 65020, 65129, 65130, 65284, 65285, 65504, 65505, 65509, 65510, 73693, 73696, 123647, 123647, 126124, 126124, 126128, 126128];

/** 原 ft：码位是否落在成对区间表内 */
export function inCodePointRanges(codePoint: number, ranges: readonly number[]): boolean {
  for (let i = 0; i < ranges.length; i += 2) if (codePoint >= ranges[i] && codePoint <= ranges[i + 1]) return true;
  return false;
}

/** 原 pt：字符为货币/度量符号 */
export function isCurrencySign(ch: string): boolean {
  const codePoint = ch.codePointAt(0);
  return codePoint !== undefined && inCodePointRanges(codePoint, CURRENCY_SIGN_RANGES);
}

/** 原 mt：末尾（跳过组合记号）为货币符 */
export function endsWithCurrencySign(text: string): boolean {
  const cluster = lastNonMarkCluster(text);
  return cluster !== null && isCurrencySign(cluster);
}

/** 原 ht：首个非记号字符为十进制数字 */
export function firstNonMarkIsDigit(text: string): boolean {
  const ch = firstNonMarkChar(text);
  return ch !== null && DECIMAL_DIGIT_RE.test(ch);
}

/* ============================================================================
 * §7 令牌整形助手（原 gt..St，jsx 10563-10620）
 * ==========================================================================*/

/** 原 gt：拆出 CJK 词尾部悬挂的开引号/开括号（可随组合记号） */
export function splitTrailingOpenPunct(text: string): { head: string; tail: string } | null {
  const chars = Array.from(text);
  let cut = chars.length;
  for (; cut > 0;) {
    const ch = chars[cut - 1];
    if (COMBINING_MARK_RE.test(ch)) {
      cut--;
      continue;
    }
    if (OPEN_PUNCT_SET.has(ch) || APOSTROPHE_SET.has(ch)) {
      cut--;
      continue;
    }
    break;
  }
  return cut <= 0 || cut === chars.length
    ? null
    : { head: chars.slice(0, cut).join(``), tail: chars.slice(cut).join(``) };
}

/** 原 _t：可重复单位——单字符、非词、非连字符/破折号（供强调点/引导符重复） */
export function repeatUnitOf(text: string, isWordLike: boolean, kind: TokenKind): string | null {
  return kind === `text` && !isWordLike && text.length === 1 && text !== `-` && text !== `—` ? text : null;
}

/** 原 vt：把重复单位令牌展开到目标长度（原地写回 texts 槽） */
export function expandRepeatUnit(texts: string[], repeatUnits: (string | null)[], repeatCounts: number[], index: number): string {
  const unit = repeatUnits[index],
    current = texts[index];
  if (unit == null) return current;
  const count = repeatCounts[index];
  if (current.length === count) return current;
  const expanded = unit.repeat(count);
  return (texts[index] = expanded), expanded;
}

/** 原 yt：阿拉伯文本且末字素为句读（: . ، ؛） */
export function endsWithArabicSentencePunct(containsArabicText: boolean, lastCluster: string | null): boolean {
  return containsArabicText && lastCluster !== null && ARABIC_SENTENCE_END_SET.has(lastCluster);
}

/** 原 bt：末尾为缅甸语句号 */
export function endsWithMyanmarFullStop(text: string): boolean {
  const last = lastGraphemeCluster(text);
  return last !== null && MYANMAR_FULL_STOP_SET.has(last);
}

/** 原 xt：“空格+纯组合记号”令牌拆分（记号移归后续阿拉伯词） */
export function splitLeadingSpaceWithMarks(text: string): { space: string; marks: string } | null {
  if (text.length < 2 || text[0] !== ` `) return null;
  const rest = text.slice(1);
  return /^\p{M}+$/u.test(rest) ? { space: ` `, marks: rest } : null;
}

/** 原 St：末尾为闭引号链（闭引号可叠在闭标点串上） */
export function endsWithClosingQuoteRun(text: string): boolean {
  let end = text.length;
  for (; end > 0;) {
    const start = prevGraphemeBoundary(text, end),
      cluster = text.slice(start, end);
    if (CLOSING_QUOTE_SET.has(cluster)) return true;
    if (!CLOSE_PUNCT_SET.has(cluster)) return false;
    end = start;
  }
  return false;
}

/* ============================================================================
 * §8 字符分类与令牌切分（原 Ct..Ot，jsx 10621-10677）
 * ==========================================================================*/

/** 原 Ct：单字符 → 令牌类别（保留模式优先；粘合/零宽/软连字符特判） */
export function classifyCharForTokenization(ch: string, mode: WhiteSpaceMode): TokenKind {
  if (mode.preserveOrdinarySpaces || mode.preserveHardBreaks) {
    if (ch === ` `) return `preserved-space`;
    if (ch === `\t`) return `tab`;
    if (mode.preserveHardBreaks && ch === `\n`) return `hard-break`;
  }
  return ch === ` `
    ? `space`
    : ch === `\xA0` || ch === `\u202F` || ch === `\u2060` || ch === `\uFEFF`
      ? `glue`
      : ch === `\u200B`
        ? `zero-width-break`
        : ch === `\xAD`
          ? `soft-hyphen`
          : `text`;
}

/** 原 wt（jsx 10632） —— 数据逐字保留 */
export const TOKEN_BOUNDARY_WS_RE = /[\x20\t\n\xA0\xAD\u200B\u202F\u2060\uFEFF]/;

/** 原 Tt：字符串数组 → 单串（单元素免 join） */
export function joinTokenParts(parts: string[]): string {
  return parts.length === 1 ? parts[0] : parts.join(``);
}

/** 原 Et：把悬挂的重复单位（逆序收集）前置到基文本 */
export function prependRepeatUnits(units: string[], baseText: string): string {
  const ordered: string[] = [];
  for (let i = units.length - 1; i >= 0; i--) ordered.push(units[i]);
  return ordered.push(baseText), joinTokenParts(ordered);
}

/** 原 Dt：Intl 词段内部按字符类别再切分（空白/粘合/软连字符等独立成令牌） */
export function splitWordSegmentByCharKind(
  segmentText: string,
  isWordLike: boolean,
  startIndex: number,
  mode: WhiteSpaceMode,
): { text: string; isWordLike: boolean; kind: TokenKind; start: number }[] {
  if (!TOKEN_BOUNDARY_WS_RE.test(segmentText)) return [{ text: segmentText, isWordLike, kind: `text`, start: startIndex }];
  const tokens: { text: string; isWordLike: boolean; kind: TokenKind; start: number }[] = [];
  let currentKind: TokenKind | null = null,
    buffer: string[] = [],
    start = startIndex,
    wordLike = false,
    consumed = 0;
  for (const ch of segmentText) {
    const kind = classifyCharForTokenization(ch, mode),
      chWordLike = kind === `text` && isWordLike;
    if (currentKind !== null && kind === currentKind && chWordLike === wordLike) {
      buffer.push(ch), (consumed += ch.length);
      continue;
    }
    currentKind !== null && tokens.push({ text: joinTokenParts(buffer), isWordLike: wordLike, kind: currentKind, start }),
      (currentKind = kind),
      (buffer = [ch]),
      (start = startIndex + consumed),
      (wordLike = chWordLike),
      (consumed += ch.length);
  }
  return currentKind !== null && tokens.push({ text: joinTokenParts(buffer), isWordLike: wordLike, kind: currentKind, start }), tokens;
}

/** 原 Ot：可断令牌类别（空格/保留空格/零宽断点/硬换行） */
export function isBreakableTokenKind(kind: TokenKind): boolean {
  return kind === `space` || kind === `preserved-space` || kind === `zero-width-break` || kind === `hard-break`;
}

/* ============================================================================
 * §9 URL 合并（原 kt..Nt，jsx 10678-10738）
 * ==========================================================================*/

/** 原 kt（jsx 10678） —— 数据逐字保留 */
export const URL_SCHEME_RE = /^[A-Za-z][A-Za-z0-9+.-]*:$/;

/** 原 At：令牌为 URL 起点（www. 或 scheme: 后接 //） */
export function isUrlSchemeToken(stream: Pick<TokenArray, `texts` | `kinds` | `len`>, index: number): boolean {
  const text = stream.texts[index];
  return text.startsWith(`www.`) ? true : URL_SCHEME_RE.test(text) && index + 1 < stream.len && stream.kinds[index + 1] === `text` && stream.texts[index + 1] === `//`;
}

/** 原 jt：疑似带查询串的 URL */
export function looksLikeUrlQuery(text: string): boolean {
  return text.includes(`?`) && (text.includes(`://`) || text.startsWith(`www.`));
}

/** 原 Mt：URL 令牌合并——自 scheme 起吞并后续非断令牌（遇 ? 再吞一段即止） */
export function mergeUrlTokens(stream: TokenArray): TokenArray {
  const texts = stream.texts.slice(),
    isWordLike = stream.isWordLike.slice(),
    kinds = stream.kinds.slice(),
    starts = stream.starts.slice();
  for (let i = 0; i < stream.len; i++) {
    if (kinds[i] !== `text` || !isUrlSchemeToken(stream, i)) continue;
    const parts = [texts[i]];
    let j = i + 1;
    for (; j < stream.len && !isBreakableTokenKind(kinds[j]);) {
      parts.push(texts[j]), (isWordLike[i] = true);
      const sawQuery = texts[j].includes(`?`);
      if ((kinds[j] = `text`), (texts[j] = ``), j++, sawQuery) break;
    }
    texts[i] = joinTokenParts(parts);
  }
  let write = 0;
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    text.length !== 0 && (write !== i && ((texts[write] = text), (isWordLike[write] = isWordLike[i]), (kinds[write] = kinds[i]), (starts[write] = starts[i])), write++);
  }
  return (
    (texts.length = write),
    (isWordLike.length = write),
    (kinds.length = write),
    (starts.length = write),
    { len: write, texts, isWordLike, kinds: kinds as TokenKind[], starts }
  );
}

/** 原 Nt：URL 查询段合并——? 之后到下一断点整体并为一词 */
export function mergeUrlQueryTokens(stream: TokenArray): TokenArray {
  const texts: string[] = [],
    isWordLike: boolean[] = [],
    kinds: TokenKind[] = [],
    starts: number[] = [];
  for (let i = 0; i < stream.len; i++) {
    const text = stream.texts[i];
    if (texts.push(text), isWordLike.push(stream.isWordLike[i]), kinds.push(stream.kinds[i]), starts.push(stream.starts[i]), !looksLikeUrlQuery(text)) continue;
    const next = i + 1;
    if (next >= stream.len || isBreakableTokenKind(stream.kinds[next])) continue;
    const queryParts: string[] = [],
      queryStart = stream.starts[next];
    let j = next;
    for (; j < stream.len && !isBreakableTokenKind(stream.kinds[j]);) queryParts.push(stream.texts[j]), j++;
    queryParts.length > 0 && (texts.push(joinTokenParts(queryParts)), isWordLike.push(true), kinds.push(`text`), starts.push(queryStart), (i = j - 1));
  }
  return { len: texts.length, texts, isWordLike, kinds, starts };
}

/* ============================================================================
 * §10 标点可断性与词间合并（原 Pt..Wt，jsx 10739-10785）
 * ==========================================================================*/

/** 原 Pt（jsx 10739）：数字内部允许的分隔符 —— 数据逐字保留 */
export const NUMERIC_INFIX_SET = new Set([`:`, `-`, `/`, `×`, `,`, `.`, `+`, `–`, `—`]);
/** 原 Ft（jsx 10740） —— 数据逐字保留 */
export const PUNCT_OR_SYMBOL_RE = /[\p{P}\p{S}\p{Co}]/u;
/** 原 It（jsx 10741） —— 数据逐字保留 */
export const EMOJI_PRESENTATION_RE = /\p{Emoji_Presentation}/u;
/** 原 Lt（jsx 10742）：可断行的连字符/破折号族 —— 数据逐字保留 */
export const HYPHEN_LIKE_SET = new Set([`?`, `֊`, `-`, `‐`, `‒`, `–`, `—`, `…`, `‼`, `‽`, `⁉`]);

/** 原 Rt：ASCII 标点（不含 '-' 与 '?'） */
export function isAsciiPunctuation(code: number): boolean {
  return (code >= 33 && code <= 47 && code !== 45) || (code >= 58 && code <= 64 && code !== 63) || (code >= 91 && code <= 96) || (code >= 123 && code <= 126);
}

/** 原 zt：可断标点字符（ASCII 标点，或非连字符/非表情的 Unicode 标点符号） */
export function isBreakablePunctuation(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code < 128 ? isAsciiPunctuation(code) : !HYPHEN_LIKE_SET.has(ch) && !EMOJI_PRESENTATION_RE.test(ch) && PUNCT_OR_SYMBOL_RE.test(ch);
}

/** 原 Bt：整串为可断标点（组合记号忽略，至少一个实体标点） */
export function isBreakablePunctRun(text: string): boolean {
  let seen = false;
  for (const ch of text)
    if (!COMBINING_MARK_RE.test(ch)) {
      if (!isBreakablePunctuation(ch)) return false;
      seen = true;
    }
  return seen;
}

/** 原 Vt：末尾（跳过记号）为可断标点或货币符 */
export function endsWithBreakableOrCurrency(text: string): boolean {
  for (let end = text.length; end > 0;) {
    const start = prevGraphemeBoundary(text, end),
      cluster = text.slice(start, end);
    if (COMBINING_MARK_RE.test(cluster)) {
      end = start;
      continue;
    }
    return isBreakablePunctuation(cluster) || isCurrencySign(cluster);
  }
  return false;
}

/**
 * 原 Ht：相邻两文本令牌是否应合并为一词——
 * 任一侧为纯可断标点串、或前侧以“词/货币符+可断标点/货币符”收尾时可合并；
 * 含 CJK 则一律不合并。
 */
export function shouldJoinAdjacentWords(prevText: string, prevIsWordLike: boolean, nextText: string, nextIsWordLike: boolean): boolean {
  const prevPunctOnly = !prevIsWordLike && isBreakablePunctRun(prevText),
    nextPunctOnly = !nextIsWordLike && isBreakablePunctRun(nextText),
    prevEndsCurrency = endsWithCurrencySign(prevText),
    prevWordTail = (prevIsWordLike || prevEndsCurrency) && endsWithBreakableOrCurrency(prevText);
  return !prevPunctOnly && !nextPunctOnly && !prevWordTail || containsCJK(prevText) || containsCJK(nextText)
    ? false
    : (prevIsWordLike || prevPunctOnly || prevEndsCurrency) && (nextIsWordLike || nextPunctOnly);
}

/** 原 Ut：含十进制数字 */
export function containsDecimalDigit(text: string): boolean {
  for (const ch of text) if (DECIMAL_DIGIT_RE.test(ch)) return true;
  return false;
}

/** 原 Wt：数字串（全为数字或数字分隔符，非空） */
export function isNumericTokenText(text: string): boolean {
  if (text.length === 0) return false;
  for (const ch of text) if (!(DECIMAL_DIGIT_RE.test(ch) || NUMERIC_INFIX_SET.has(ch))) return false;
  return true;
}

/* ============================================================================
 * §11 令牌流归并通道（原 Gt..Yt，jsx 10786-10933）
 * ==========================================================================*/

/** 原 Gt：相邻数字令牌合并（含千分位/小数点等内嵌分隔符） */
export function mergeNumericTokens(stream: TokenArray): TokenArray {
  const texts: string[] = [],
    isWordLike: boolean[] = [],
    kinds: TokenKind[] = [],
    starts: number[] = [];
  for (let i = 0; i < stream.len; i++) {
    const text = stream.texts[i],
      kind = stream.kinds[i];
    if (kind === `text` && isNumericTokenText(text) && containsDecimalDigit(text)) {
      const parts = [text];
      let j = i + 1;
      for (; j < stream.len && stream.kinds[j] === `text` && isNumericTokenText(stream.texts[j]);) parts.push(stream.texts[j]), j++;
      texts.push(joinTokenParts(parts)), isWordLike.push(true), kinds.push(`text`), starts.push(stream.starts[i]), (i = j - 1);
      continue;
    }
    texts.push(text), isWordLike.push(stream.isWordLike[i]), kinds.push(kind), starts.push(stream.starts[i]);
  }
  return { len: texts.length, texts, isWordLike, kinds, starts };
}

/** 原 Kt：按 shouldJoinAdjacentWords 合并相邻文本令牌 */
export function mergeAdjacentWordTokens(stream: TokenArray): TokenArray {
  const texts: string[] = [],
    isWordLike: boolean[] = [],
    kinds: TokenKind[] = [],
    starts: number[] = [];
  let i = 0;
  for (; i < stream.len;) {
    const text = stream.texts[i],
      kind = stream.kinds[i],
      wordLike = stream.isWordLike[i];
    if (kind === `text`) {
      const parts = [text];
      let j = i + 1,
        merged = wordLike;
      for (; j < stream.len && stream.kinds[j] === `text` && shouldJoinAdjacentWords(stream.texts[j - 1], stream.isWordLike[j - 1], stream.texts[j], stream.isWordLike[j]);) {
        const next = stream.texts[j];
        parts.push(next), (merged ||= stream.isWordLike[j]), j++;
      }
      if (j > i + 1) {
        texts.push(joinTokenParts(parts)), isWordLike.push(merged), kinds.push(`text`), starts.push(stream.starts[i]), (i = j);
        continue;
      }
    }
    texts.push(text), isWordLike.push(wordLike), kinds.push(kind), starts.push(stream.starts[i]), i++;
  }
  return { len: texts.length, texts, isWordLike, kinds, starts };
}

/** 原 qt：连字符连接的数字串拆分（电话号/编号逐段可断，连字符随前段） */
export function splitHyphenatedNumbers(stream: TokenArray): TokenArray {
  const texts: string[] = [],
    isWordLike: boolean[] = [],
    kinds: TokenKind[] = [],
    starts: number[] = [];
  for (let i = 0; i < stream.len; i++) {
    const text = stream.texts[i];
    if (stream.kinds[i] === `text` && text.includes(`-`)) {
      const parts = text.split(`-`);
      let allNumeric = parts.length > 1;
      for (let k = 0; k < parts.length; k++) {
        const part = parts[k];
        if (!allNumeric) break;
        (part.length === 0 || !containsDecimalDigit(part) || !isNumericTokenText(part)) && (allNumeric = false);
      }
      if (allNumeric) {
        let offset = 0;
        for (let k = 0; k < parts.length; k++) {
          const part = parts[k],
            piece = k < parts.length - 1 ? `${part}-` : part;
          texts.push(piece), isWordLike.push(true), kinds.push(`text`), starts.push(stream.starts[i] + offset), (offset += piece.length);
        }
        continue;
      }
    }
    texts.push(text), isWordLike.push(stream.isWordLike[i]), kinds.push(stream.kinds[i]), starts.push(stream.starts[i]);
  }
  return { len: texts.length, texts, isWordLike, kinds, starts };
}

/** 原 Jt：NBSP 粘合令牌合并（glue 与前后文本粘成整体；纯 glue 串独立） */
export function mergeGlueTokens(stream: TokenArray): TokenArray {
  const texts: string[] = [],
    isWordLike: boolean[] = [],
    kinds: TokenKind[] = [],
    starts: number[] = [];
  let i = 0;
  for (; i < stream.len;) {
    const parts = [stream.texts[i]];
    let wordLike = stream.isWordLike[i],
      kind = stream.kinds[i],
      start = stream.starts[i];
    if (kind === `glue`) {
      const glueParts = [parts[0]],
        glueStart = start;
      for (i++; i < stream.len && stream.kinds[i] === `glue`;) glueParts.push(stream.texts[i]), i++;
      const glueText = joinTokenParts(glueParts);
      if (i < stream.len && stream.kinds[i] === `text`)
        (parts[0] = glueText), parts.push(stream.texts[i]), (wordLike = stream.isWordLike[i]), (kind = `text`), (start = glueStart), i++;
      else {
        texts.push(glueText), isWordLike.push(false), kinds.push(`glue`), starts.push(glueStart);
        continue;
      }
    } else i++;
    if (kind === `text`)
      for (; i < stream.len && stream.kinds[i] === `glue`;) {
        const run: string[] = [];
        for (; i < stream.len && stream.kinds[i] === `glue`;) run.push(stream.texts[i]), i++;
        const glueText = joinTokenParts(run);
        if (i < stream.len && stream.kinds[i] === `text`) {
          parts.push(glueText, stream.texts[i]), (wordLike ||= stream.isWordLike[i]), i++;
          continue;
        }
        parts.push(glueText);
      }
    texts.push(joinTokenParts(parts)), isWordLike.push(wordLike), kinds.push(kind), starts.push(start);
  }
  return { len: texts.length, texts, isWordLike, kinds, starts };
}

/** 原 Yt：相邻 CJK 词间，前词尾部悬挂的开标点移归后词（禁则：开标点不置行尾） */
export function splitCJKOpenPunctTails(stream: TokenArray): TokenArray {
  const texts = stream.texts.slice(),
    isWordLike = stream.isWordLike.slice(),
    kinds = stream.kinds.slice(),
    starts = stream.starts.slice();
  for (let i = 0; i < texts.length - 1; i++) {
    if (kinds[i] !== `text` || kinds[i + 1] !== `text` || !containsCJK(texts[i]) || !containsCJK(texts[i + 1])) continue;
    const split = splitTrailingOpenPunct(texts[i]);
    split !== null && ((texts[i] = split.head), (texts[i + 1] = split.tail + texts[i + 1]), (starts[i + 1] = starts[i] + split.head.length));
  }
  return { len: texts.length, texts, isWordLike, kinds: kinds as TokenKind[], starts };
}

/* ============================================================================
 * §12 词切分主管线（原 Xt，jsx 10934-11012）
 * ==========================================================================*/

/**
 * 原 Xt：词切分主管线——
 * Intl.Segmenter(word) 逐段 → 字符类别再切分（Dt）→ 按粘着规则归并：
 *   a) CJK 词后随闭引号（怪癖开关）/闭标点串/缅甸语句号 → 并入前词；
 *   b) 阿拉伯语词后随句读 → 并入前词；
 *   c) 可重复单字符（强调点等）累计重复次数；
 *   d) 非词标点簇（或词内连字符）→ 并入前词；
 * 之后：重复单位展开 → 纯标点串前粘（前词非 CJK）→ 开标点串后粘
 * （反向扫描挂到下一实词，连字符需前词以数字收尾）→ 压实 →
 * 归并通道：Jt(glue) → Mt(URL) → Nt(查询串) → Gt(数字) → qt(连字符数字)
 * → Kt(词间标点) → Yt(CJK 开标点) → 空格携带组合记号移归阿拉伯词。
 */
export function buildTokenStreamFromSegmenter(text: string, quirks: LineLayoutQuirks, mode: WhiteSpaceMode): TokenArray {
  const segmenter = getWordSegmenter();
  let count = 0;
  const texts: string[] = [],
    partLists: string[][] = [],
    isWordLike: boolean[] = [],
    kinds: TokenKind[] = [],
    starts: number[] = [],
    repeatUnits: (string | null)[] = [],
    repeatCounts: number[] = [],
    cjkFlags: boolean[] = [],
    arabicFlags: boolean[] = [],
    closingQuoteFlags: boolean[] = [],
    myanmarFlags: boolean[] = [],
    arabicPunctFlags: boolean[] = [];
  for (const word of segmenter.segment(text))
    for (const piece of splitWordSegmentByCharKind(word.segment, word.isWordLike ?? false, word.index, mode)) {
      const isText = piece.kind === `text`,
        unit = repeatUnitOf(piece.text, piece.isWordLike, piece.kind),
        hasCJK = containsCJK(piece.text),
        hasArabic = containsArabic(piece.text),
        lastCluster = lastGraphemeCluster(piece.text),
        endsQuoteRun = endsWithClosingQuoteRun(piece.text),
        endsMyanmar = endsWithMyanmarFullStop(piece.text),
        prev = count - 1;
      /** 并入前一令牌（原 C 闭包） */
      const mergeIntoPrev = () => {
        repeatUnits[prev] !== null && ((partLists[prev] = [expandRepeatUnit(texts, repeatUnits, repeatCounts, prev)]), (repeatUnits[prev] = null)),
          partLists[prev].push(piece.text),
          (isWordLike[prev] = isWordLike[prev] || piece.isWordLike),
          (cjkFlags[prev] = cjkFlags[prev] || hasCJK),
          (arabicFlags[prev] = arabicFlags[prev] || hasArabic),
          (closingQuoteFlags[prev] = endsQuoteRun),
          (myanmarFlags[prev] = endsMyanmar),
          (arabicPunctFlags[prev] = endsWithArabicSentencePunct(arabicFlags[prev], lastCluster));
      };
      if (
        (quirks.carryCJKAfterClosingQuote && isText && count > 0 && kinds[prev] === `text` && hasCJK && cjkFlags[prev] && closingQuoteFlags[prev]) ||
        (isText && count > 0 && kinds[prev] === `text` && isCJKClosingPunctRun(piece.text) && cjkFlags[prev]) ||
        (isText && count > 0 && kinds[prev] === `text` && myanmarFlags[prev])
      )
        mergeIntoPrev();
      else if (isText && count > 0 && kinds[prev] === `text` && piece.isWordLike && hasArabic && arabicPunctFlags[prev]) (mergeIntoPrev(), (isWordLike[prev] = true));
      else if (unit !== null && count > 0 && kinds[prev] === `text` && repeatUnits[prev] === unit) repeatCounts[prev] = (repeatCounts[prev] ?? 1) + 1;
      else if (isText && !piece.isWordLike && count > 0 && kinds[prev] === `text` && !cjkFlags[prev] && (isClosingPunctCluster(piece.text) || (piece.text === `-` && isWordLike[prev]))) mergeIntoPrev();
      else
        (texts[count] = piece.text),
          (partLists[count] = [piece.text]),
          (isWordLike[count] = piece.isWordLike),
          (kinds[count] = piece.kind),
          (starts[count] = piece.start),
          (repeatUnits[count] = unit),
          (repeatCounts[count] = unit === null ? 0 : 1),
          (cjkFlags[count] = hasCJK),
          (arabicFlags[count] = hasArabic),
          (closingQuoteFlags[count] = endsQuoteRun),
          (myanmarFlags[count] = endsMyanmar),
          (arabicPunctFlags[count] = endsWithArabicSentencePunct(hasArabic, lastCluster)),
          count++;
    }
  // 重复单位展开 / 部件合并
  for (let i = 0; i < count; i++) {
    if (repeatUnits[i] !== null) {
      texts[i] = expandRepeatUnit(texts, repeatUnits, repeatCounts, i);
      continue;
    }
    texts[i] = joinTokenParts(partLists[i]);
  }
  // 纯标点串（非词）前粘：并入前一非 CJK 文本令牌
  for (let i = 1; i < count; i++)
    kinds[i] === `text` && !isWordLike[i] && isPurePunctRun(texts[i]) && kinds[i - 1] === `text` && !cjkFlags[i - 1] && ((texts[i - 1] += texts[i]), (isWordLike[i - 1] = isWordLike[i - 1] || isWordLike[i]), (texts[i] = ``));
  // 开标点串后粘：反向扫描，挂到下一实词之前（连字符要求前词以数字收尾）
  const pendingOpen: (string[] | null)[] = Array.from({ length: count }, () => null);
  let nextReal = -1;
  for (let i = count - 1; i >= 0; i--) {
    const text = texts[i];
    if (text.length !== 0) {
      if (kinds[i] === `text` && !isWordLike[i] && nextReal >= 0 && kinds[nextReal] === `text` && (isOpenPunctRun(text) || (text === `-` && firstNonMarkIsDigit(texts[nextReal])))) {
        const list = pendingOpen[nextReal] ?? [];
        list.push(text), (pendingOpen[nextReal] = list), (starts[nextReal] = starts[i]), (texts[i] = ``);
        continue;
      }
      nextReal = i;
    }
  }
  for (let i = 0; i < count; i++) {
    const list = pendingOpen[i];
    list != null && (texts[i] = prependRepeatUnits(list, texts[i]));
  }
  // 压实（去空槽）
  let write = 0;
  for (let i = 0; i < count; i++) {
    const text = texts[i];
    text.length !== 0 && (write !== i && ((texts[write] = text), (isWordLike[write] = isWordLike[i]), (kinds[write] = kinds[i]), (starts[write] = starts[i])), write++);
  }
  (texts.length = write), (isWordLike.length = write), (kinds.length = write), (starts.length = write);
  // 归并通道（顺序固定：glue → URL → 查询串 → 数字 → 连字符数字 → 词间标点 → CJK 开标点）
  const merged = splitCJKOpenPunctTails(mergeAdjacentWordTokens(splitHyphenatedNumbers(mergeNumericTokens(mergeUrlQueryTokens(mergeUrlTokens(mergeGlueTokens({ len: write, texts, isWordLike, kinds, starts })))))));
  // “空格+组合记号”移归后续阿拉伯词
  for (let i = 0; i < merged.len - 1; i++) {
    const split = splitLeadingSpaceWithMarks(merged.texts[i]);
    split !== null &&
      ((merged.kinds[i] !== `space` && merged.kinds[i] !== `preserved-space`) ||
        merged.kinds[i + 1] !== `text` ||
        !containsArabic(merged.texts[i + 1]) ||
        ((merged.texts[i] = split.space),
        (merged.isWordLike[i] = false),
        (merged.kinds[i] = merged.kinds[i] === `preserved-space` ? `preserved-space` : `space`),
        (merged.texts[i + 1] = split.marks + merged.texts[i + 1]),
        (merged.starts[i + 1] = merged.starts[i] + split.space.length)));
  }
  return merged;
}

/* ============================================================================
 * §13 硬换行分块 / keep-all / 段入口（原 Zt/Qt/$t，jsx 11013-11095）
 * ==========================================================================*/

/** 原 Zt：按硬换行令牌把段索引区间切块（无保留硬换行 = 单块） */
export function splitChunksAtHardBreaks(
  stream: Pick<TokenArray, `len` | `kinds`>,
  mode: WhiteSpaceMode,
): { startSegmentIndex: number; endSegmentIndex: number; consumedEndSegmentIndex: number }[] {
  if (stream.len === 0) return [];
  if (!mode.preserveHardBreaks) return [{ startSegmentIndex: 0, endSegmentIndex: stream.len, consumedEndSegmentIndex: stream.len }];
  const chunks: { startSegmentIndex: number; endSegmentIndex: number; consumedEndSegmentIndex: number }[] = [];
  let chunkStart = 0;
  for (let i = 0; i < stream.len; i++)
    stream.kinds[i] === `hard-break` && (chunks.push({ startSegmentIndex: chunkStart, endSegmentIndex: i, consumedEndSegmentIndex: i + 1 }), (chunkStart = i + 1));
  return chunkStart < stream.len && chunks.push({ startSegmentIndex: chunkStart, endSegmentIndex: stream.len, consumedEndSegmentIndex: stream.len }), chunks;
}

/**
 * 原 Qt：word-break: keep-all——CJK 文本跨标点禁断：
 * 连续文本令牌按“前令牌末尾是否允许断行”分组，组内含 CJK 则整组
 * 还原为原文切片（不拆词），否则逐令牌保留。
 */
export function applyKeepAllToTokens(text: string, stream: TokenArray, breakKeepAllAfterPunctuation: boolean): TokenArray {
  if (stream.len <= 1) return stream;
  const texts: string[] = [],
    isWordLike: boolean[] = [],
    kinds: TokenKind[] = [],
    starts: number[] = [];
  let runStart = -1,
    runHasCJK = false;
  function pushSingle(index: number): void {
    texts.push(stream.texts[index]), isWordLike.push(stream.isWordLike[index]), kinds.push(`text`), starts.push(stream.starts[index]);
  }
  function pushRange(from: number, to: number): void {
    let anyWordLike = false;
    for (let i = from; i < to; i++) anyWordLike ||= stream.isWordLike[i];
    const start = stream.starts[from],
      end = to < stream.len ? stream.starts[to] : text.length;
    texts.push(text.slice(start, end)), isWordLike.push(anyWordLike), kinds.push(`text`), starts.push(start);
  }
  function flush(index: number): void {
    if (!(runStart < 0)) {
      if (runHasCJK) runStart + 1 === index ? pushSingle(runStart) : pushRange(runStart, index);
      else for (let i = runStart; i < index; i++) pushSingle(i);
      (runStart = -1), (runHasCJK = false);
    }
  }
  for (let i = 0; i < stream.len; i++) {
    const text = stream.texts[i],
      kind = stream.kinds[i];
    if (kind === `text`) {
      runStart >= 0 && !allowsBreakAfter(stream.texts[i - 1], breakKeepAllAfterPunctuation) && flush(i), runStart < 0 && (runStart = i), (runHasCJK ||= containsCJK(text));
      continue;
    }
    flush(i), texts.push(text), isWordLike.push(stream.isWordLike[i]), kinds.push(kind), starts.push(stream.starts[i]);
  }
  return flush(stream.len), { len: texts.length, texts, isWordLike, kinds, starts };
}

/**
 * 原 $t（[E1] 段入口）：文本 → 布局令牌流——
 * 空白归一（pre-wrap 保硬换行，否则折叠）→ 词切分主管线（Xt）→
 * keep-all 归并（可选）→ 硬换行分块。空文本返回空流。
 */
export function segmentTextToLayoutTokens(
  text: string,
  quirks: LineLayoutQuirks,
  whiteSpace: string | undefined = `normal`,
  wordBreak: string | undefined = `normal`,
): LayoutTokenStream {
  const mode = resolveWhiteSpaceMode(whiteSpace),
    normalized = mode.mode === `pre-wrap` ? normalizeHardLineBreaks(text) : normalizeCollapsibleSpaces(text);
  if (normalized.length === 0)
    return { normalized, chunks: [], len: 0, texts: [], isWordLike: [], kinds: [], starts: [] };
  const tokens = buildTokenStreamFromSegmenter(normalized, quirks, mode),
    finalTokens = wordBreak === `keep-all` ? applyKeepAllToTokens(normalized, tokens, quirks.breakKeepAllAfterPunctuation) : tokens;
  return { normalized, chunks: splitChunksAtHardBreaks(finalTokens, mode), ...finalTokens };
}

/* ============================================================================
 * 尾符号表（本文件导出 ↔ 原混淆名 ↔ jsx 行）
 * ----------------------------------------------------------------------------
 * 导出符号（36）：
 *  数据：BIDI_DIRECT_TYPES(Ee,10303) BIDI_RANGE_TABLE(De,10304)
 *   NON_BREAK_SPACE_SET(Ke,10468) HYPHEN_CHAR_SET(Q,10469)
 *   CJK_NO_LINE_START_SET(Xe,10481) OPEN_PUNCT_SET(Ze,10482)
 *   APOSTROPHE_SET(Qe,10483) CLOSE_PUNCT_SET($e,10484)
 *   ARABIC_SENTENCE_END_SET(et,10485) MYANMAR_FULL_STOP_SET(tt,10486)
 *   CLOSING_QUOTE_SET(nt,10487) CURRENCY_SIGN_RANGES(dt,10548)
 *   TOKEN_BOUNDARY_WS_RE(wt,10632) URL_SCHEME_RE(kt,10678)
 *   NUMERIC_INFIX_SET(Pt,10739) PUNCT_OR_SYMBOL_RE(Ft,10740)
 *   EMOJI_PRESENTATION_RE(It,10741) HYPHEN_LIKE_SET(Lt,10742)
 *   ARABIC_SCRIPT_RE(ze,10437) COMBINING_MARK_RE(Be,10438)
 *   DECIMAL_DIGIT_RE(Ve,10439)
 *  BiDi：getBidiCharType(Oe,10305) computeBidiLevels(ke,10324)
 *   mapBidiLevelsToSegmentStarts(Ae,10400)
 *  空白：resolveWhiteSpaceMode(Ne,10409) normalizeCollapsibleSpaces(Pe,10418)
 *   normalizeHardLineBreaks(Fe,10425) getWordSegmenter(Re,10431)
 *  脚本：containsArabic(He,10440) isCJKCodePoint(Ue,10443) containsCJK(We,10447)
 *  断行许可：endsWithNoBreakSpace(qe,10471) endsWithHyphen(Je,10475)
 *   allowsBreakAfter(Ye,10478) endsWithCJKClosingPunct(Ge,10464)
 *  标点簇：isClosingPunctCluster(rt,10488) isCJKClosingPunctRun(it,10499)
 *   isOpenPunctRun(at,10503) isPurePunctRun(ot,10509)
 *  字素：prevGraphemeBoundary(st,10518) lastGraphemeCluster(ct,10528)
 *   firstNonMarkChar(lt,10533) lastNonMarkCluster(ut,10538)
 *  货币/数字：inCodePointRanges(ft,10549) isCurrencySign(pt,10553)
 *   endsWithCurrencySign(mt,10557) firstNonMarkIsDigit(ht,10560)
 *   containsDecimalDigit(Ut,10776) isNumericTokenText(Wt,10780)
 *  令牌整形：splitTrailingOpenPunct(gt,10563) repeatUnitOf(_t,10579)
 *   expandRepeatUnit(vt,10583) endsWithArabicSentencePunct(yt,10594)
 *   endsWithMyanmarFullStop(bt,10597) splitLeadingSpaceWithMarks(xt,10601)
 *   endsWithClosingQuoteRun(St,10609) classifyCharForTokenization(Ct,10621)
 *   joinTokenParts(Tt,10634) prependRepeatUnits(Et,10637)
 *   splitWordSegmentByCharKind(Dt,10642) isBreakableTokenKind(Ot,10673)
 *  URL：isUrlSchemeToken(At,10679) looksLikeUrlQuery(jt,10685)
 *   mergeUrlTokens(Mt,10688) mergeUrlQueryTokens(Nt,10713)
 *  标点/合并：isAsciiPunctuation(Rt,10743) isBreakablePunctuation(zt,10748)
 *   isBreakablePunctRun(Bt,10751) endsWithBreakableOrCurrency(Vt,10758)
 *   shouldJoinAdjacentWords(Ht,10769) mergeNumericTokens(Gt,10786)
 *   mergeAdjacentWordTokens(Kt,10812) splitHyphenatedNumbers(qt,10845)
 *   mergeGlueTokens(Jt,10877) splitCJKOpenPunctTails(Yt,10921)
 *  管线：buildTokenStreamFromSegmenter(Xt,10934) splitChunksAtHardBreaks(Zt,11013)
 *   applyKeepAllToTokens(Qt,11034) segmentTextToLayoutTokens($t,11075)
 * 内部（未导出）：COLLAPSIBLE_WS_RE(je,10407) NEEDS_WS_NORMALIZE_RE(Me,10408)
 *   cachedWordSegmenter(Ie,10429) wordSegmenterLocale(Le,10430)
 * ============================================================================
 */
