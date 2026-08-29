/**
 * recharts bundle 内部件转录（A0.1 S2-a）。
 *
 * 来源：src-reconstructed/renderer/assets/chart-iT2j9K3u.jsx（只读真值底稿）。
 * 本文件承载「用量图三件」从 chart-iT2j9K3u.js 导入、但 npm recharts@3.8.0
 * 导出面中不存在的符号（bundle 内 vendored recharts 与 npm 3.8.0 的少量
 * 结构差异 + first-party 选择器），全部逐字转录，未改实现：
 *
 *   导出名                              原 chunk 内部名   导出别名（按消费文件）
 *   filterProps                         $t（575-610 链）   Bn（line chart）
 *   pickId                              Z                  pt（pie chart）
 *   pickTooltipEventType                bg（8316）         _t（pie chart）
 *   selectPolarTooltipEvents            Hm（7809）         jt（pie chart）
 *   combinePolarAppliedNumericalValues  Xh（8225）         nt（pie chart）
 *   combineTooltipPayloadConfigurationsInput hg（8298）    ot（pie chart）
 *   selectTooltipPayloadConfigurationsInput  xg（8317）    at（pie chart）
 *   lodashGetModule                     yn（827）          Ln（pie chart）
 *
 * 依赖侧全部改接 npm recharts@3.8.0 深路径（见 ../lib/recharts-deep.d.ts）
 * 与 reselect；各内部辅助（Ah/jh/Mh/Fh/Ih/Up/Wp/Kp/Yh 等）随同转录以保逐字等价。
 */

import { isValidElement } from 'react';
import { createSelector } from 'reselect';
import { getNiceTickValues, getTickValuesFixedDomain } from 'recharts/es6/util/scale/getNiceTickValues.js';
import { isNumber, isNan, isNumOrStr } from 'recharts/es6/util/DataUtils.js';
import { getValueByDataKey } from 'recharts/es6/util/ChartUtils.js'; // recharts 3.8.0 中位于 ChartUtils（原 chunk 内为 DataUtils 段内联）
import { isWellBehavedNumber } from 'recharts/es6/util/isWellBehavedNumber.js';
import { getDomainDefinition, selectHasBar } from 'recharts/es6/state/selectors/axisSelectors.js';
import { selectChartName } from 'recharts/es6/state/selectors/rootPropsSelectors.js';
import { combineRealScaleType } from 'recharts/es6/state/selectors/combiners/combineRealScaleType.js';
import lodashGet from 'es-toolkit/compat/get';

/* ═══════════════ filterProps 链（jsx 575-610；原内部名 Gt/Kt/qt/Jt/Yt/Qt/$t） ═══════════════ */

/** 事件处理器属性名清单（原内部名 Gt）。 */
const EVENT_PROPS = `dangerouslySetInnerHTML.onCopy.onCopyCapture.onCut.onCutCapture.onPaste.onPasteCapture.onCompositionEnd.onCompositionEndCapture.onCompositionStart.onCompositionStartCapture.onCompositionUpdate.onCompositionUpdateCapture.onFocus.onFocusCapture.onBlur.onBlurCapture.onChange.onChangeCapture.onBeforeInput.onBeforeInputCapture.onInput.onInputCapture.onReset.onResetCapture.onSubmit.onSubmitCapture.onInvalid.onInvalidCapture.onLoad.onLoadCapture.onError.onErrorCapture.onKeyDown.onKeyDownCapture.onKeyPress.onKeyPressCapture.onKeyUp.onKeyUpCapture.onAbort.onAbortCapture.onCanPlay.onCanPlayCapture.onCanPlayThrough.onCanPlayThroughCapture.onDurationChange.onDurationChangeCapture.onEmptied.onEmptiedCapture.onEncrypted.onEncryptedCapture.onEnded.onEndedCapture.onLoadedData.onLoadedDataCapture.onLoadedMetadata.onLoadedMetadataCapture.onLoadStart.onLoadStartCapture.onPause.onPauseCapture.onPlay.onPlayCapture.onPlaying.onPlayingCapture.onProgress.onProgressCapture.onRateChange.onRateChangeCapture.onSeeked.onSeekedCapture.onSeeking.onSeekingCapture.onStalled.onStalledCapture.onSuspend.onSuspendCapture.onTimeUpdate.onTimeUpdateCapture.onVolumeChange.onVolumeChangeCapture.onWaiting.onWaitingCapture.onAuxClick.onAuxClickCapture.onClick.onClickCapture.onContextMenu.onContextMenuCapture.onDoubleClick.onDoubleClickCapture.onDrag.onDragCapture.onDragEnd.onDragEndCapture.onDragEnter.onDragEnterCapture.onDragExit.onDragExitCapture.onDragLeave.onDragLeaveCapture.onDragOver.onDragOverCapture.onDragStart.onDragStartCapture.onDrop.onDropCapture.onMouseDown.onMouseDownCapture.onMouseEnter.onMouseLeave.onMouseMove.onMouseMoveCapture.onMouseOut.onMouseOutCapture.onMouseOver.onMouseOverCapture.onMouseUp.onMouseUpCapture.onSelect.onSelectCapture.onTouchCancel.onTouchCancelCapture.onTouchEnd.onTouchEndCapture.onTouchMove.onTouchMoveCapture.onTouchStart.onTouchStartCapture.onPointerDown.onPointerDownCapture.onPointerMove.onPointerMoveCapture.onPointerUp.onPointerUpCapture.onPointerCancel.onPointerCancelCapture.onPointerEnter.onPointerEnterCapture.onPointerLeave.onPointerLeaveCapture.onPointerOver.onPointerOverCapture.onPointerOut.onPointerOutCapture.onGotPointerCapture.onGotPointerCaptureCapture.onLostPointerCapture.onLostPointerCaptureCapture.onScroll.onScrollCapture.onWheel.onWheelCapture.onAnimationStart.onAnimationStartCapture.onAnimationEnd.onAnimationEndCapture.onAnimationIteration.onAnimationIterationCapture.onTransitionEnd.onTransitionEndCapture`.split('.');

/** 事件属性判定（原内部名 Kt）。 */
function isEventProp(e: unknown): boolean {
  return typeof e == 'string' ? EVENT_PROPS.includes(e) : false;
}

/** 合法 SVG/HTML 透传属性集（原内部名 qt）。 */
const VALID_PROPS = new Set(`aria-activedescendant.aria-atomic.aria-autocomplete.aria-busy.aria-checked.aria-colcount.aria-colindex.aria-colspan.aria-controls.aria-current.aria-describedby.aria-details.aria-disabled.aria-errormessage.aria-expanded.aria-flowto.aria-haspopup.aria-hidden.aria-invalid.aria-keyshortcuts.aria-label.aria-labelledby.aria-level.aria-live.aria-modal.aria-multiline.aria-multiselectable.aria-orientation.aria-owns.aria-placeholder.aria-posinset.aria-pressed.aria-readonly.aria-relevant.aria-required.aria-roledescription.aria-rowcount.aria-rowindex.aria-rowspan.aria-selected.aria-setsize.aria-sort.aria-valuemax.aria-valuemin.aria-valuenow.aria-valuetext.className.color.height.id.lang.max.media.method.min.name.style.target.width.role.tabIndex.accentHeight.accumulate.additive.alignmentBaseline.allowReorder.alphabetic.amplitude.arabicForm.ascent.attributeName.attributeType.autoReverse.azimuth.baseFrequency.baselineShift.baseProfile.bbox.begin.bias.by.calcMode.capHeight.clip.clipPath.clipPathUnits.clipRule.colorInterpolation.colorInterpolationFilters.colorProfile.colorRendering.contentScriptType.contentStyleType.cursor.cx.cy.d.decelerate.descent.diffuseConstant.direction.display.divisor.dominantBaseline.dur.dx.dy.edgeMode.elevation.enableBackground.end.exponent.externalResourcesRequired.fill.fillOpacity.fillRule.filter.filterRes.filterUnits.floodColor.floodOpacity.focusable.fontFamily.fontSize.fontSizeAdjust.fontStretch.fontStyle.fontVariant.fontWeight.format.from.fx.fy.g1.g2.glyphName.glyphOrientationHorizontal.glyphOrientationVertical.glyphRef.gradientTransform.gradientUnits.hanging.horizAdvX.horizOriginX.href.ideographic.imageRendering.in2.in.intercept.k1.k2.k3.k4.k.kernelMatrix.kernelUnitLength.kerning.keyPoints.keySplines.keyTimes.lengthAdjust.letterSpacing.lightingColor.limitingConeAngle.local.markerEnd.markerHeight.markerMid.markerStart.markerUnits.markerWidth.mask.maskContentUnits.maskUnits.mathematical.mode.numOctaves.offset.opacity.operator.order.orient.orientation.origin.overflow.overlinePosition.overlineThickness.paintOrder.panose1.pathLength.patternContentUnits.patternTransform.patternUnits.pointerEvents.pointsAtX.pointsAtY.pointsAtZ.preserveAlpha.preserveAspectRatio.primitiveUnits.r.radius.refX.refY.renderingIntent.repeatCount.repeatDur.requiredExtensions.requiredFeatures.restart.result.rotate.rx.ry.seed.shapeRendering.slope.spacing.specularConstant.specularExponent.speed.spreadMethod.startOffset.stdDeviation.stemh.stemv.stitchTiles.stopColor.stopOpacity.strikethroughPosition.strikethroughThickness.string.stroke.strokeDasharray.strokeDashoffset.strokeLinecap.strokeLinejoin.strokeMiterlimit.strokeOpacity.strokeWidth.surfaceScale.systemLanguage.tableValues.targetX.targetY.textAnchor.textDecoration.textLength.textRendering.to.transform.u1.u2.underlinePosition.underlineThickness.unicode.unicodeBidi.unicodeRange.unitsPerEm.vAlphabetic.values.vectorEffect.version.vertAdvY.vertOriginX.vertOriginY.vHanging.vIdeographic.viewTarget.visibility.vMathematical.widths.wordSpacing.writingMode.x1.x2.x.xChannelSelector.xHeight.xlinkActuate.xlinkArcrole.xlinkHref.xlinkRole.xlinkShow.xlinkTitle.xlinkType.xmlBase.xmlLang.xmlns.xmlnsXlink.xmlSpace.y1.y2.y.yChannelSelector.z.zoomAndPan.ref.key.angle`.split('.'));

/** 合法透传属性判定（原内部名 Jt）。 */
function isValidSvgProp(e: unknown): boolean {
  return typeof e == 'string' ? VALID_PROPS.has(e) : false;
}

/** data-* 属性判定（原内部名 Yt）。 */
function isDataAttrProp(e: unknown): e is string {
  return typeof e == 'string' && e.startsWith('data-');
}

/** 取全部可透传 SVG 属性（含事件属性）（原内部名 Qt）。 */
function allTransferableProps(e: any): Record<string, any> {
  var t: Record<string, any> = {};
  for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (isValidSvgProp(n) || isDataAttrProp(n) || isEventProp(n)) && (t[n] = e[n]);
  return t;
}

/** filterProps：React 元素取其 props、普通对象原样过滤；其余返回 null（原内部名 $t，导出别名 Bn）。 */
export function filterProps(e: any): Record<string, any> | null {
  return e == null ? null : isValidElement(e) ? allTransferableProps((e as any).props) : typeof e == 'object' && !Array.isArray(e) ? allTransferableProps(e) : null;
}

/* ═══════════════ pickId / pickTooltipEventType（jsx 8316；原内部名 Z/bg） ═══════════════ */

/** pickId：createSelector 的 id 直通输入（原内部名 Z，导出别名 pt）。 */
export const pickId = (_state: any, id: any): any => id;

/** pickTooltipEventType（原内部名 bg，导出别名 _t）。 */
export const pickTooltipEventType = createSelector([pickId, selectHasBar, selectChartName], combineRealScaleType);

/* ═══════════════ 数值域辅助（原内部名 Pn/En 依赖/Ah/jh/Mh/Up/Wp/Ys/Xs/Kp/Yh） ═══════════════ */

/** 非空判定（原内部名 Pn，未导出）。 */
const isNotNil = (e: unknown): boolean => e != null;

/** 数值化（数字/字符串/Date -> number）（原内部名 Ah）。 */
function toNumberIfNumeric(e: any): number | undefined {
  if (isNumOrStr(e) || e instanceof Date) {
    var t = Number(e);
    if (isWellBehavedNumber(t)) return t;
  }
  return undefined;
}

/** 数值对域（单值 -> [v, v]）（原内部名 jh）。 */
function toNumberPairDomain(e: any): [number, number] | undefined {
  if (Array.isArray(e)) {
    var t = [toNumberIfNumeric(e[0]), toNumberIfNumeric(e[1])];
    return isNumberPair(t) ? (t as [number, number]) : void 0;
  }
  var n = toNumberIfNumeric(e);
  if (n != null) return [n, n];
  return undefined;
}

/** 过滤出有效数值（原内部名 Mh）。 */
function filterDefinedNumbers(e: any[]): number[] {
  return e.map(toNumberIfNumeric).filter(isNotNil) as number[];
}

/** 数值对判定（原内部名 Up）。 */
function isNumberPair(e: any): boolean {
  if (Array.isArray(e) && e.length === 2) {
    var [t, n] = e;
    if (isWellBehavedNumber(t) && isWellBehavedNumber(n)) return true;
  }
  return false;
}

/** 域合并（allowDataOverflow 时保留原域）（原内部名 Wp）。 */
function mergeDomainWithPreference(e: [any, any], t: any, n: any): any {
  return n ? e : [Math.min(e[0], t[0]), Math.max(e[1], t[1])];
}

/** dataMin-<n> 域表达式（原内部名 Ys）。 */
const DATA_MIN_OFFSET_PATTERN = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/;
/** dataMax+<n> 域表达式（原内部名 Xs）。 */
const DATA_MAX_OFFSET_PATTERN = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/;

/** 解析用户指定域（函数/[auto,auto]/dataMin-/dataMax+ 形态）（原内部名 Kp）。 */
function parseSpecifiedDomain(e: any, t: any, n: any): any {
  if (!(!n && t == null)) {
    if (typeof e == 'function' && t != null) try {
      var r = e(t, n);
      if (isNumberPair(r)) return mergeDomainWithPreference(r, t, n);
    } catch { /* 原码空 catch */ }
    if (Array.isArray(e) && e.length === 2) {
      var [i, a] = e,
        o: any,
        s: any;
      if (i === 'auto') t != null && (o = Math.min(...t));else if (isNumber(i)) o = i;else if (typeof i == 'function') try {
        t != null && (o = i(t?.[0]));
      } catch { /* 原码空 catch */ } else if (typeof i == 'string' && DATA_MIN_OFFSET_PATTERN.test(i)) {
        var c = DATA_MIN_OFFSET_PATTERN.exec(i);
        if (c == null || c[1] == null || t == null) o = void 0;else {
          var l = +c[1];
          o = t[0] - l;
        }
      } else o = t?.[0];
      if (a === 'auto') t != null && (s = Math.max(...t));else if (isNumber(a)) s = a;else if (typeof a == 'function') try {
        t != null && (s = a(t?.[1]));
      } catch { /* 原码空 catch */ } else if (typeof a == 'string' && DATA_MAX_OFFSET_PATTERN.test(a)) {
        var u = DATA_MAX_OFFSET_PATTERN.exec(a);
        if (u == null || u[1] == null || t == null) s = void 0;else {
          var d = +u[1];
          s = t[1] + d;
        }
      } else s = t?.[1];
      var f = [o, s];
      if (isNumberPair(f)) return t == null ? f : mergeDomainWithPreference(f as [any, any], t, n);
    }
  }
}

/** 多域取并集极值（原内部名 Yh）。 */
function combineDomainExtremes(...args: any[]): [number, number] | undefined {
  var e = [...args].filter(Boolean);
  if (e.length !== 0) {
    var t = e.flat();
    return [Math.min(...t), Math.max(...t)];
  }
  return undefined;
}

/* ═══════════════ errorBar 数值展开（原内部名 Fh/Ih） ═══════════════ */

/** errorBar 方向与轴匹配判定（原内部名 Fh）。 */
function errorBarMatchesAxis(e: string, t: any): boolean {
  switch (e) {
    case 'xAxis':
      return t.direction === 'x';
    case 'yAxis':
      return t.direction === 'y';
    default:
      return false;
  }
}

/** 单数据点的 errorBar 偏移值列表（原内部名 Ih）。 */
function errorBarValueOffsets(e: any, t: any, n: any): number[] {
  return !n || typeof t != 'number' || isNan(t) || !n.length ? [] : filterDefinedNumbers(n.flatMap((bar: any) => {
    var r = getValueByDataKey(e, bar.dataKey),
      i: any,
      a: any;
    if (Array.isArray(r) ? [i, a] = r : i = a = r, !(!isWellBehavedNumber(i) || !isWellBehavedNumber(a))) return [t - i, t + a];
  }));
}

/* ═══════════════ 极坐标 tooltip 域族（原内部名 Xh/hg/xg/Hm） ═══════════════ */

/** combinePolarAppliedNumericalValues（原内部名 Xh，导出别名 nt）。 */
export const combinePolarAppliedNumericalValues = (e: any, t: any, n: any, r: any, i: any): any => {
  var a: any, o: any;
  if (n.length > 0 && e.forEach((entry: any) => {
    n.forEach((item: any) => {
      var s = r[item.id]?.filter((bar: any) => errorBarMatchesAxis(i, bar)),
        c = getValueByDataKey(entry, t.dataKey ?? item.dataKey),
        l = errorBarValueOffsets(entry, c, s);
      if (l.length >= 2) {
        var u = Math.min(...l),
          d = Math.max(...l);
        (a == null || u < a) && (a = u), (o == null || d > o) && (o = d);
      }
      var f = toNumberPairDomain(c);
      f != null && (a = a == null ? f[0] : Math.min(a, f[0]), o = o == null ? f[1] : Math.max(o, f[1]));
    });
  }), t?.dataKey != null && e.forEach((entry: any) => {
    var n2 = toNumberPairDomain(getValueByDataKey(entry, t.dataKey));
    n2 != null && (a = a == null ? n2[0] : Math.min(a, n2[0]), o = o == null ? n2[1] : Math.max(o, n2[1]));
  }), isWellBehavedNumber(a) && isWellBehavedNumber(o)) return [a, o];
};

/** combineTooltipPayloadConfigurationsInput（原内部名 hg，导出别名 ot）。 */
export const combineTooltipPayloadConfigurationsInput = (e: any, t: any, n: any, r: any, i: any, a: any, o: any, s: any): any =>
  n ?? parseSpecifiedDomain(t, o === 'vertical' && s === 'xAxis' || o === 'horizontal' && s === 'yAxis' ? combineDomainExtremes(r, a, i) : combineDomainExtremes(a, i), e.allowDataOverflow);

/** selectTooltipPayloadConfigurationsInput（原内部名 xg，导出别名 at；niceTicks 域精化）。 */
export const selectTooltipPayloadConfigurationsInput = (e: any, t: any, n: any): any => {
  var {
    niceTicks: r
  } = t;
  if (r !== 'none') {
    var i = getDomainDefinition(t),
      a = Array.isArray(i) && (i[0] === 'auto' || i[1] === 'auto');
    if ((r === 'snap125' || r === 'adaptive') && t != null && t.tickCount && isNumberPair(e)) {
      if (a) return getNiceTickValues(e, t.tickCount, t.allowDecimals, r);
      if (t.type === 'number') return getTickValuesFixedDomain(e, t.tickCount, t.allowDecimals, r);
    }
    if (r === 'auto' && n === 'linear' && t != null && t.tickCount) {
      if (a && isNumberPair(e)) return getNiceTickValues(e, t.tickCount, t.allowDecimals, 'adaptive');
      if (t.type === 'number' && isNumberPair(e)) return getTickValuesFixedDomain(e, t.tickCount, t.allowDecimals, 'adaptive');
    }
  }
};

/** selectPolarTooltipEvents（原内部名 Hm，导出别名 jt）。 */
export const selectPolarTooltipEvents = (e: any, t: any): any => {
  if (t != null) switch (e) {
    case 'linear':
      if (!isNumberPair(t)) {
        for (var n, r, i = 0; i < t.length; i++) {
          var a = t[i];
          isWellBehavedNumber(a) && ((n === void 0 || a < n) && (n = a), (r === void 0 || a > r) && (r = a));
        }
        return n !== void 0 && r !== void 0 ? [n, r] : void 0;
      }
      return t;
    default:
      return t;
  }
};

/* ═══════════════ lodash.get 互操作模块（原内部名 yn，导出别名 Ln） ═══════════════ */

/**
 * lodashGetModule：原 chunk 以 CJS 互操作包装持有 lodash.get
 * （`yn = n((e, t) => { t.exports = vn().get; })`），消费者经 `.default` 访问。
 * npm 等价：es-toolkit/compat/get（recharts 3.8.0 自身即以它为 lodash 替代）。
 */
export const lodashGetModule = { default: lodashGet };
