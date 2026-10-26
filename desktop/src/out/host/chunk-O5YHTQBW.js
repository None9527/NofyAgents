import { a as s, b as Re } from "./chunk-LVLFJXEE.js";
var ey = "3.7.6",
  ty = "cc3ba847",
  ny = "2026-08-10T10:00:17.872Z";
function normalizeZCodeEnv(e) {
  return e?.trim().toLowerCase() === "production" ? "production" : "test";
}
s(normalizeZCodeEnv, "normalizeZCodeEnv");
var oy = normalizeZCodeEnv("production"),
  ry = "ZCODE_APP_VERSION";
var iy = typeof process < "u" ? process.env.ZCODE_DEBUG : void 0;
var n = {};
Re(n, {
  $brand: () => Yn,
  $input: () => hc,
  $output: () => fc,
  NEVER: () => ii,
  TimePrecision: () => Sc,
  ZodAny: () => ld,
  ZodArray: () => md,
  ZodBase64: () => xr,
  ZodBase64URL: () => kr,
  ZodBigInt: () => Ut,
  ZodBigIntFormat: () => Rr,
  ZodBoolean: () => Dt,
  ZodCIDRv4: () => Sr,
  ZodCIDRv6: () => _r,
  ZodCUID: () => mr,
  ZodCUID2: () => gr,
  ZodCatch: () => $d,
  ZodCodec: () => Mr,
  ZodCustom: () => $n,
  ZodCustomStringFormat: () => Mt,
  ZodDate: () => En,
  ZodDefault: () => wd,
  ZodDiscriminatedUnion: () => fd,
  ZodE164: () => Ir,
  ZodEmail: () => dr,
  ZodEmoji: () => ur,
  ZodEnum: () => At,
  ZodError: () => zv,
  ZodExactOptional: () => Rd,
  ZodFile: () => Id,
  ZodFirstPartyTypeKind: () => Gd,
  ZodFunction: () => Fd,
  ZodGUID: () => Cn,
  ZodIPv4: () => br,
  ZodIPv6: () => vr,
  ZodISODate: () => rr,
  ZodISODateTime: () => or,
  ZodISODuration: () => ar,
  ZodISOTime: () => ir,
  ZodIntersection: () => hd,
  ZodIssueCode: () => $v,
  ZodJWT: () => Cr,
  ZodKSUID: () => yr,
  ZodLazy: () => Bd,
  ZodLiteral: () => kd,
  ZodMAC: () => nd,
  ZodMap: () => _d,
  ZodNaN: () => Ud,
  ZodNanoID: () => pr,
  ZodNever: () => ud,
  ZodNonOptional: () => Ar,
  ZodNull: () => sd,
  ZodNullable: () => Td,
  ZodNumber: () => $t,
  ZodNumberFormat: () => tt,
  ZodObject: () => An,
  ZodOptional: () => Or,
  ZodPipe: () => zr,
  ZodPrefault: () => Od,
  ZodPromise: () => Wd,
  ZodReadonly: () => Nd,
  ZodRealError: () => ne,
  ZodRecord: () => Mn,
  ZodSet: () => xd,
  ZodString: () => zt,
  ZodStringFormat: () => N,
  ZodSuccess: () => Md,
  ZodSymbol: () => id,
  ZodTemplateLiteral: () => jd,
  ZodTransform: () => Cd,
  ZodTuple: () => bd,
  ZodType: () => O,
  ZodULID: () => fr,
  ZodURL: () => wn,
  ZodUUID: () => xe,
  ZodUndefined: () => ad,
  ZodUnion: () => zn,
  ZodUnknown: () => dd,
  ZodVoid: () => pd,
  ZodXID: () => hr,
  ZodXor: () => gd,
  _ZodString: () => lr,
  _default: () => Ed,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base64,
  base64url: () => base64url,
  bigint: () => bigint,
  boolean: () => boolean,
  catch: () => Dd,
  check: () => check,
  cidrv4: () => cidrv4,
  cidrv6: () => cidrv6,
  clone: () => clone,
  codec: () => codec,
  coerce: () => Kd,
  config: () => config,
  core: () => we,
  cuid: () => cuid,
  cuid2: () => cuid2,
  custom: () => custom,
  date: () => Tm,
  decode: () => Hl,
  decodeAsync: () => Yl,
  describe: () => Ym,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e164,
  email: () => email,
  emoji: () => Yp,
  encode: () => Kl,
  encodeAsync: () => Jl,
  endsWith: () => _endsWith,
  enum: () => wr,
  exactOptional: () => exactOptional,
  file: () => file,
  flattenError: () => flattenError,
  float32: () => float32,
  float64: () => float64,
  formatError: () => formatError,
  fromJSONSchema: () => fromJSONSchema,
  function: () => _function,
  getErrorMap: () => getErrorMap,
  globalRegistry: () => V,
  gt: () => _gt,
  gte: () => _gte,
  guid: () => guid,
  hash: () => hash,
  hex: () => hex,
  hostname: () => hostname,
  httpUrl: () => httpUrl,
  includes: () => _includes,
  instanceof: () => _instanceof,
  int: () => int,
  int32: () => int32,
  int64: () => int64,
  intersection: () => intersection,
  ipv4: () => ipv4,
  ipv6: () => ipv6,
  iso: () => Ot,
  json: () => json,
  jwt: () => jwt,
  keyof: () => keyof,
  ksuid: () => ksuid,
  lazy: () => lazy,
  length: () => _length,
  literal: () => literal,
  locales: () => _n,
  looseObject: () => looseObject,
  looseRecord: () => looseRecord,
  lowercase: () => _lowercase,
  lt: () => _lt,
  lte: () => _lte,
  mac: () => mac,
  map: () => map,
  maxLength: () => _maxLength,
  maxSize: () => _maxSize,
  meta: () => Xm,
  mime: () => _mime,
  minLength: () => _minLength,
  minSize: () => _minSize,
  multipleOf: () => _multipleOf,
  nan: () => nan,
  nanoid: () => nanoid,
  nativeEnum: () => nativeEnum,
  negative: () => _negative,
  never: () => never,
  nonnegative: () => _nonnegative,
  nonoptional: () => nonoptional,
  nonpositive: () => _nonpositive,
  normalize: () => _normalize,
  null: () => cd,
  nullable: () => nullable,
  nullish: () => Lm,
  number: () => number,
  object: () => object,
  optional: () => optional,
  overwrite: () => _overwrite,
  parse: () => Fl,
  parseAsync: () => ql,
  partialRecord: () => partialRecord,
  pipe: () => pipe,
  positive: () => _positive,
  prefault: () => prefault,
  preprocess: () => preprocess,
  prettifyError: () => prettifyError,
  promise: () => promise,
  property: () => _property,
  readonly: () => readonly,
  record: () => record,
  refine: () => refine,
  regex: () => _regex,
  regexes: () => de,
  registry: () => registry,
  safeDecode: () => Ql,
  safeDecodeAsync: () => td,
  safeEncode: () => Xl,
  safeEncodeAsync: () => ed,
  safeParse: () => Vl,
  safeParseAsync: () => Gl,
  set: () => set,
  setErrorMap: () => setErrorMap,
  size: () => _size,
  slugify: () => _slugify,
  startsWith: () => _startsWith,
  strictObject: () => strictObject,
  string: () => string,
  stringFormat: () => stringFormat,
  stringbool: () => eg,
  success: () => success,
  superRefine: () => superRefine,
  symbol: () => symbol,
  templateLiteral: () => templateLiteral,
  toJSONSchema: () => toJSONSchema,
  toLowerCase: () => _toLowerCase,
  toUpperCase: () => _toUpperCase,
  transform: () => transform,
  treeifyError: () => treeifyError,
  trim: () => _trim,
  tuple: () => tuple,
  uint32: () => uint32,
  uint64: () => uint64,
  ulid: () => ulid,
  undefined: () => Cm,
  union: () => union,
  unknown: () => unknown,
  uppercase: () => _uppercase,
  url: () => url,
  util: () => k,
  uuid: () => uuid,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => Pm,
  xid: () => xid,
  xor: () => xor,
});
var we = {};
Re(we, {
  $ZodAny: () => qa,
  $ZodArray: () => Ja,
  $ZodAsyncError: () => ge,
  $ZodBase64: () => $a,
  $ZodBase64URL: () => Da,
  $ZodBigInt: () => _o,
  $ZodBigIntFormat: () => Ba,
  $ZodBoolean: () => gn,
  $ZodCIDRv4: () => Aa,
  $ZodCIDRv6: () => za,
  $ZodCUID: () => Sa,
  $ZodCUID2: () => _a,
  $ZodCatch: () => gs,
  $ZodCheck: () => Z,
  $ZodCheckBigIntFormat: () => Ji,
  $ZodCheckEndsWith: () => ca,
  $ZodCheckGreaterThan: () => go,
  $ZodCheckIncludes: () => aa,
  $ZodCheckLengthEquals: () => na,
  $ZodCheckLessThan: () => mo,
  $ZodCheckLowerCase: () => ra,
  $ZodCheckMaxLength: () => ea,
  $ZodCheckMaxSize: () => Yi,
  $ZodCheckMimeType: () => da,
  $ZodCheckMinLength: () => ta,
  $ZodCheckMinSize: () => Xi,
  $ZodCheckMultipleOf: () => Ki,
  $ZodCheckNumberFormat: () => Hi,
  $ZodCheckOverwrite: () => ua,
  $ZodCheckProperty: () => la,
  $ZodCheckRegex: () => oa,
  $ZodCheckSizeEquals: () => Qi,
  $ZodCheckStartsWith: () => sa,
  $ZodCheckStringFormat: () => ft,
  $ZodCheckUpperCase: () => ia,
  $ZodCodec: () => hn,
  $ZodCustom: () => xs,
  $ZodCustomStringFormat: () => Za,
  $ZodDate: () => Ha,
  $ZodDefault: () => ds,
  $ZodDiscriminatedUnion: () => Qa,
  $ZodE164: () => Ua,
  $ZodEmail: () => ha,
  $ZodEmoji: () => ba,
  $ZodEncodeError: () => Me,
  $ZodEnum: () => rs,
  $ZodError: () => cn,
  $ZodExactOptional: () => cs,
  $ZodFile: () => as,
  $ZodFunction: () => vs,
  $ZodGUID: () => ga,
  $ZodIPv4: () => wa,
  $ZodIPv6: () => Ea,
  $ZodISODate: () => Ra,
  $ZodISODateTime: () => Ca,
  $ZodISODuration: () => Ta,
  $ZodISOTime: () => Pa,
  $ZodIntersection: () => es,
  $ZodJWT: () => Na,
  $ZodKSUID: () => Ia,
  $ZodLazy: () => _s,
  $ZodLiteral: () => is,
  $ZodMAC: () => Oa,
  $ZodMap: () => ns,
  $ZodNaN: () => fs,
  $ZodNanoID: () => va,
  $ZodNever: () => Ga,
  $ZodNonOptional: () => ps,
  $ZodNull: () => Fa,
  $ZodNullable: () => ls,
  $ZodNumber: () => So,
  $ZodNumberFormat: () => ja,
  $ZodObject: () => Mp,
  $ZodObjectJIT: () => Ya,
  $ZodOptional: () => ko,
  $ZodPipe: () => hs,
  $ZodPrefault: () => us,
  $ZodPromise: () => Ss,
  $ZodReadonly: () => ys,
  $ZodRealError: () => te,
  $ZodRecord: () => ts,
  $ZodRegistry: () => Io,
  $ZodSet: () => os,
  $ZodString: () => Je,
  $ZodStringFormat: () => U,
  $ZodSuccess: () => ms,
  $ZodSymbol: () => La,
  $ZodTemplateLiteral: () => bs,
  $ZodTransform: () => ss,
  $ZodTuple: () => xo,
  $ZodType: () => E,
  $ZodULID: () => xa,
  $ZodURL: () => ya,
  $ZodUUID: () => fa,
  $ZodUndefined: () => Wa,
  $ZodUnion: () => fn,
  $ZodUnknown: () => Va,
  $ZodVoid: () => Ka,
  $ZodXID: () => ka,
  $ZodXor: () => Xa,
  $brand: () => Yn,
  $constructor: () => $constructor,
  $input: () => hc,
  $output: () => fc,
  Doc: () => mn,
  JSONSchema: () => Bp,
  JSONSchemaGenerator: () => tr,
  NEVER: () => ii,
  TimePrecision: () => Sc,
  _any: () => _any,
  _array: () => _array,
  _base64: () => _base64,
  _base64url: () => _base64url,
  _bigint: () => _bigint,
  _boolean: () => _boolean,
  _catch: () => _catch,
  _check: () => _check,
  _cidrv4: () => _cidrv4,
  _cidrv6: () => _cidrv6,
  _coercedBigint: () => _coercedBigint,
  _coercedBoolean: () => _coercedBoolean,
  _coercedDate: () => _coercedDate,
  _coercedNumber: () => _coercedNumber,
  _coercedString: () => _coercedString,
  _cuid: () => _cuid,
  _cuid2: () => _cuid2,
  _custom: () => _custom,
  _date: () => _date,
  _decode: () => oo,
  _decodeAsync: () => io,
  _default: () => _default,
  _discriminatedUnion: () => _discriminatedUnion,
  _e164: () => _e164,
  _email: () => _email,
  _emoji: () => _emoji,
  _encode: () => no,
  _encodeAsync: () => ro,
  _endsWith: () => _endsWith,
  _enum: () => _enum,
  _file: () => _file,
  _float32: () => _float32,
  _float64: () => _float64,
  _gt: () => _gt,
  _gte: () => _gte,
  _guid: () => _guid,
  _includes: () => _includes,
  _int: () => _int,
  _int32: () => _int32,
  _int64: () => _int64,
  _intersection: () => _intersection,
  _ipv4: () => _ipv4,
  _ipv6: () => _ipv6,
  _isoDate: () => _isoDate,
  _isoDateTime: () => _isoDateTime,
  _isoDuration: () => _isoDuration,
  _isoTime: () => _isoTime,
  _jwt: () => _jwt,
  _ksuid: () => _ksuid,
  _lazy: () => _lazy,
  _length: () => _length,
  _literal: () => _literal,
  _lowercase: () => _lowercase,
  _lt: () => _lt,
  _lte: () => _lte,
  _mac: () => _mac,
  _map: () => _map,
  _max: () => _lte,
  _maxLength: () => _maxLength,
  _maxSize: () => _maxSize,
  _mime: () => _mime,
  _min: () => _gte,
  _minLength: () => _minLength,
  _minSize: () => _minSize,
  _multipleOf: () => _multipleOf,
  _nan: () => _nan,
  _nanoid: () => _nanoid,
  _nativeEnum: () => _nativeEnum,
  _negative: () => _negative,
  _never: () => _never,
  _nonnegative: () => _nonnegative,
  _nonoptional: () => _nonoptional,
  _nonpositive: () => _nonpositive,
  _normalize: () => _normalize,
  _null: () => _null,
  _nullable: () => _nullable,
  _number: () => _number,
  _optional: () => _optional,
  _overwrite: () => _overwrite,
  _parse: () => ut,
  _parseAsync: () => pt,
  _pipe: () => _pipe,
  _positive: () => _positive,
  _promise: () => _promise,
  _property: () => _property,
  _readonly: () => _readonly,
  _record: () => _record,
  _refine: () => _refine,
  _regex: () => _regex,
  _safeDecode: () => so,
  _safeDecodeAsync: () => lo,
  _safeEncode: () => ao,
  _safeEncodeAsync: () => co,
  _safeParse: () => mt,
  _safeParseAsync: () => gt,
  _set: () => _set,
  _size: () => _size,
  _slugify: () => _slugify,
  _startsWith: () => _startsWith,
  _string: () => _string,
  _stringFormat: () => _stringFormat,
  _stringbool: () => _stringbool,
  _success: () => _success,
  _superRefine: () => _superRefine,
  _symbol: () => _symbol,
  _templateLiteral: () => _templateLiteral,
  _toLowerCase: () => _toLowerCase,
  _toUpperCase: () => _toUpperCase,
  _transform: () => _transform,
  _trim: () => _trim,
  _tuple: () => _tuple,
  _uint32: () => _uint32,
  _uint64: () => _uint64,
  _ulid: () => _ulid,
  _undefined: () => _undefined,
  _union: () => _union,
  _unknown: () => _unknown,
  _uppercase: () => _uppercase,
  _url: () => _url,
  _uuid: () => _uuid,
  _uuidv4: () => _uuidv4,
  _uuidv6: () => _uuidv6,
  _uuidv7: () => _uuidv7,
  _void: () => _void,
  _xid: () => _xid,
  _xor: () => _xor,
  clone: () => clone,
  config: () => config,
  createStandardJSONSchemaMethod: () => Et,
  createToJSONSchemaMethod: () => nl,
  decode: () => zy,
  decodeAsync: () => $y,
  describe: () => describe,
  encode: () => Ay,
  encodeAsync: () => My,
  extractDefs: () => extractDefs,
  finalize: () => finalize,
  flattenError: () => flattenError,
  formatError: () => formatError,
  globalConfig: () => en,
  globalRegistry: () => V,
  initializeContext: () => initializeContext,
  isValidBase64: () => isValidBase64,
  isValidBase64URL: () => isValidBase64URL,
  isValidJWT: () => isValidJWT,
  locales: () => _n,
  meta: () => meta,
  parse: () => eo,
  parseAsync: () => to,
  prettifyError: () => prettifyError,
  process: () => $,
  regexes: () => de,
  registry: () => registry,
  safeDecode: () => Uy,
  safeDecodeAsync: () => Zy,
  safeEncode: () => Dy,
  safeEncodeAsync: () => Ny,
  safeParse: () => bi,
  safeParseAsync: () => vi,
  toDotPath: () => toDotPath,
  toJSONSchema: () => toJSONSchema,
  treeifyError: () => treeifyError,
  util: () => k,
  version: () => pa,
});
var ii = Object.freeze({ status: "aborted" });
function $constructor(e, t, r) {
  function init(l, p) {
    if (
      (l._zod ||
        Object.defineProperty(l, "_zod", {
          value: { def: p, constr: _, traits: new Set() },
          enumerable: !1,
        }),
      l._zod.traits.has(e))
    )
      return;
    (l._zod.traits.add(e), t(l, p));
    let d = _.prototype,
      g = Object.keys(d);
    for (let y = 0; y < g.length; y++) {
      let S = g[y];
      S in l || (l[S] = d[S].bind(l));
    }
  }
  s(init, "init");
  let o = r?.Parent ?? Object;
  class a extends o {
    static {
      s(this, "Definition");
    }
  }
  Object.defineProperty(a, "name", { value: e });
  function _(l) {
    var p;
    let d = r?.Parent ? new a() : this;
    (init(d, l), (p = d._zod).deferred ?? (p.deferred = []));
    for (let g of d._zod.deferred) g();
    return d;
  }
  return (
    s(_, "_"),
    Object.defineProperty(_, "init", { value: init }),
    Object.defineProperty(_, Symbol.hasInstance, {
      value: s((l) => (r?.Parent && l instanceof r.Parent ? !0 : l?._zod?.traits?.has(e)), "value"),
    }),
    Object.defineProperty(_, "name", { value: e }),
    _
  );
}
s($constructor, "$constructor");
var Yn = Symbol("zod_brand"),
  ge = class extends Error {
    static {
      s(this, "$ZodAsyncError");
    }
    constructor() {
      super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
    }
  },
  Me = class extends Error {
    static {
      s(this, "$ZodEncodeError");
    }
    constructor(t) {
      (super(`Encountered unidirectional transform during encode: ${t}`),
        (this.name = "ZodEncodeError"));
    }
  },
  en = {};
function config(e) {
  return (e && Object.assign(en, e), en);
}
s(config, "config");
var k = {};
Re(k, {
  BIGINT_FORMAT_RANGES: () => fi,
  Class: () => si,
  NUMBER_FORMAT_RANGES: () => gi,
  aborted: () => aborted,
  allowsEval: () => di,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => Qn,
  cleanEnum: () => cleanEnum,
  cleanRegex: () => cleanRegex,
  clone: () => clone,
  cloneDef: () => cloneDef,
  createTransparentProxy: () => createTransparentProxy,
  defineLazy: () => defineLazy,
  esc: () => esc,
  escapeRegex: () => escapeRegex,
  extend: () => extend,
  finalizeIssue: () => finalizeIssue,
  floatSafeRemainder: () => floatSafeRemainder,
  getElementAtPath: () => getElementAtPath,
  getEnumValues: () => getEnumValues,
  getLengthableOrigin: () => getLengthableOrigin,
  getParsedType: () => yy,
  getSizableOrigin: () => getSizableOrigin,
  hexToUint8Array: () => hexToUint8Array,
  isObject: () => isObject,
  isPlainObject: () => isPlainObject,
  issue: () => issue,
  joinValues: () => joinValues,
  jsonStringifyReplacer: () => jsonStringifyReplacer,
  merge: () => merge,
  mergeDefs: () => mergeDefs,
  normalizeParams: () => normalizeParams,
  nullish: () => nullish,
  numKeys: () => numKeys,
  objectClone: () => objectClone,
  omit: () => omit,
  optionalKeys: () => optionalKeys,
  parsedType: () => parsedType,
  partial: () => partial,
  pick: () => pick,
  prefixIssues: () => prefixIssues,
  primitiveTypes: () => pi,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => rn,
  randomString: () => randomString,
  required: () => required,
  safeExtend: () => safeExtend,
  shallowClone: () => shallowClone,
  slugify: () => slugify,
  stringifyPrimitive: () => stringifyPrimitive,
  uint8ArrayToBase64: () => uint8ArrayToBase64,
  uint8ArrayToBase64url: () => uint8ArrayToBase64url,
  uint8ArrayToHex: () => uint8ArrayToHex,
  unwrapMessage: () => unwrapMessage,
});
function assertEqual(e) {
  return e;
}
s(assertEqual, "assertEqual");
function assertNotEqual(e) {
  return e;
}
s(assertNotEqual, "assertNotEqual");
function assertIs(e) {}
s(assertIs, "assertIs");
function assertNever(e) {
  throw new Error("Unexpected value in exhaustive check");
}
s(assertNever, "assertNever");
function assert(e) {}
s(assert, "assert");
function getEnumValues(e) {
  let t = Object.values(e).filter((i) => typeof i == "number");
  return Object.entries(e)
    .filter(([i, o]) => t.indexOf(+i) === -1)
    .map(([i, o]) => o);
}
s(getEnumValues, "getEnumValues");
function joinValues(e, t = "|") {
  return e.map((r) => stringifyPrimitive(r)).join(t);
}
s(joinValues, "joinValues");
function jsonStringifyReplacer(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
s(jsonStringifyReplacer, "jsonStringifyReplacer");
function cached(e) {
  return {
    get value() {
      {
        let r = e();
        return (Object.defineProperty(this, "value", { value: r }), r);
      }
      throw new Error("cached value already set");
    },
  };
}
s(cached, "cached");
function nullish(e) {
  return e == null;
}
s(nullish, "nullish");
function cleanRegex(e) {
  let t = e.startsWith("^") ? 1 : 0,
    r = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, r);
}
s(cleanRegex, "cleanRegex");
function floatSafeRemainder(e, t) {
  let r = (e.toString().split(".")[1] || "").length,
    i = t.toString(),
    o = (i.split(".")[1] || "").length;
  if (o === 0 && /\d?e-\d?/.test(i)) {
    let p = i.match(/\d?e-(\d?)/);
    p?.[1] && (o = Number.parseInt(p[1]));
  }
  let a = r > o ? r : o,
    c = Number.parseInt(e.toFixed(a).replace(".", "")),
    l = Number.parseInt(t.toFixed(a).replace(".", ""));
  return (c % l) / 10 ** a;
}
s(floatSafeRemainder, "floatSafeRemainder");
var cp = Symbol("evaluating");
function defineLazy(e, t, r) {
  let i;
  Object.defineProperty(e, t, {
    get() {
      if (i !== cp) return (i === void 0 && ((i = cp), (i = r())), i);
    },
    set(o) {
      Object.defineProperty(e, t, { value: o });
    },
    configurable: !0,
  });
}
s(defineLazy, "defineLazy");
function objectClone(e) {
  return Object.create(Object.getPrototypeOf(e), Object.getOwnPropertyDescriptors(e));
}
s(objectClone, "objectClone");
function assignProp(e, t, r) {
  Object.defineProperty(e, t, { value: r, writable: !0, enumerable: !0, configurable: !0 });
}
s(assignProp, "assignProp");
function mergeDefs(...e) {
  let t = {};
  for (let r of e) {
    let i = Object.getOwnPropertyDescriptors(r);
    Object.assign(t, i);
  }
  return Object.defineProperties({}, t);
}
s(mergeDefs, "mergeDefs");
function cloneDef(e) {
  return mergeDefs(e._zod.def);
}
s(cloneDef, "cloneDef");
function getElementAtPath(e, t) {
  return t ? t.reduce((r, i) => r?.[i], e) : e;
}
s(getElementAtPath, "getElementAtPath");
function promiseAllObject(e) {
  let t = Object.keys(e),
    r = t.map((i) => e[i]);
  return Promise.all(r).then((i) => {
    let o = {};
    for (let a = 0; a < t.length; a++) o[t[a]] = i[a];
    return o;
  });
}
s(promiseAllObject, "promiseAllObject");
function randomString(e = 10) {
  let t = "abcdefghijklmnopqrstuvwxyz",
    r = "";
  for (let i = 0; i < e; i++) r += t[Math.floor(Math.random() * t.length)];
  return r;
}
s(randomString, "randomString");
function esc(e) {
  return JSON.stringify(e);
}
s(esc, "esc");
function slugify(e) {
  return e
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
s(slugify, "slugify");
var Qn = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function isObject(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
s(isObject, "isObject");
var di = cached(() => {
  if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
  try {
    let e = Function;
    return (new e(""), !0);
  } catch {
    return !1;
  }
});
function isPlainObject(e) {
  if (isObject(e) === !1) return !1;
  let t = e.constructor;
  if (t === void 0 || typeof t != "function") return !0;
  let r = t.prototype;
  return !(isObject(r) === !1 || Object.prototype.hasOwnProperty.call(r, "isPrototypeOf") === !1);
}
s(isPlainObject, "isPlainObject");
function shallowClone(e) {
  return isPlainObject(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
s(shallowClone, "shallowClone");
function numKeys(e) {
  let t = 0;
  for (let r in e) Object.prototype.hasOwnProperty.call(e, r) && t++;
  return t;
}
s(numKeys, "numKeys");
var yy = s((e) => {
    let t = typeof e;
    switch (t) {
      case "undefined":
        return "undefined";
      case "string":
        return "string";
      case "number":
        return Number.isNaN(e) ? "nan" : "number";
      case "boolean":
        return "boolean";
      case "function":
        return "function";
      case "bigint":
        return "bigint";
      case "symbol":
        return "symbol";
      case "object":
        return Array.isArray(e)
          ? "array"
          : e === null
            ? "null"
            : e.then && typeof e.then == "function" && e.catch && typeof e.catch == "function"
              ? "promise"
              : typeof Map < "u" && e instanceof Map
                ? "map"
                : typeof Set < "u" && e instanceof Set
                  ? "set"
                  : typeof Date < "u" && e instanceof Date
                    ? "date"
                    : typeof File < "u" && e instanceof File
                      ? "file"
                      : "object";
      default:
        throw new Error(`Unknown data type: ${t}`);
    }
  }, "getParsedType"),
  rn = new Set(["string", "number", "symbol"]),
  pi = new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]);
function escapeRegex(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
s(escapeRegex, "escapeRegex");
function clone(e, t, r) {
  let i = new e._zod.constr(t ?? e._zod.def);
  return ((!t || r?.parent) && (i._zod.parent = e), i);
}
s(clone, "clone");
function normalizeParams(e) {
  let t = e;
  if (!t) return {};
  if (typeof t == "string") return { error: s(() => t, "error") };
  if (t?.message !== void 0) {
    if (t?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return (
    delete t.message,
    typeof t.error == "string" ? { ...t, error: s(() => t.error, "error") } : t
  );
}
s(normalizeParams, "normalizeParams");
function createTransparentProxy(e) {
  let t;
  return new Proxy(
    {},
    {
      get(r, i, o) {
        return (t ?? (t = e()), Reflect.get(t, i, o));
      },
      set(r, i, o, a) {
        return (t ?? (t = e()), Reflect.set(t, i, o, a));
      },
      has(r, i) {
        return (t ?? (t = e()), Reflect.has(t, i));
      },
      deleteProperty(r, i) {
        return (t ?? (t = e()), Reflect.deleteProperty(t, i));
      },
      ownKeys(r) {
        return (t ?? (t = e()), Reflect.ownKeys(t));
      },
      getOwnPropertyDescriptor(r, i) {
        return (t ?? (t = e()), Reflect.getOwnPropertyDescriptor(t, i));
      },
      defineProperty(r, i, o) {
        return (t ?? (t = e()), Reflect.defineProperty(t, i, o));
      },
    },
  );
}
s(createTransparentProxy, "createTransparentProxy");
function stringifyPrimitive(e) {
  return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
s(stringifyPrimitive, "stringifyPrimitive");
function optionalKeys(e) {
  return Object.keys(e).filter(
    (t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional",
  );
}
s(optionalKeys, "optionalKeys");
var gi = {
    safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    int32: [-2147483648, 2147483647],
    uint32: [0, 4294967295],
    float32: [-34028234663852886e22, 34028234663852886e22],
    float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
  },
  fi = {
    int64: [BigInt("-9223372036854775808"), BigInt("9223372036854775807")],
    uint64: [BigInt(0), BigInt("18446744073709551615")],
  };
function pick(e, t) {
  let r = e._zod.def,
    i = r.checks;
  if (i && i.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  let a = mergeDefs(e._zod.def, {
    get shape() {
      let c = {};
      for (let l in t) {
        if (!(l in r.shape)) throw new Error(`Unrecognized key: "${l}"`);
        t[l] && (c[l] = r.shape[l]);
      }
      return (assignProp(this, "shape", c), c);
    },
    checks: [],
  });
  return clone(e, a);
}
s(pick, "pick");
function omit(e, t) {
  let r = e._zod.def,
    i = r.checks;
  if (i && i.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  let a = mergeDefs(e._zod.def, {
    get shape() {
      let c = { ...e._zod.def.shape };
      for (let l in t) {
        if (!(l in r.shape)) throw new Error(`Unrecognized key: "${l}"`);
        t[l] && delete c[l];
      }
      return (assignProp(this, "shape", c), c);
    },
    checks: [],
  });
  return clone(e, a);
}
s(omit, "omit");
function extend(e, t) {
  if (!isPlainObject(t)) throw new Error("Invalid input to extend: expected a plain object");
  let r = e._zod.def.checks;
  if (r && r.length > 0) {
    let a = e._zod.def.shape;
    for (let c in t)
      if (Object.getOwnPropertyDescriptor(a, c) !== void 0)
        throw new Error(
          "Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.",
        );
  }
  let o = mergeDefs(e._zod.def, {
    get shape() {
      let a = { ...e._zod.def.shape, ...t };
      return (assignProp(this, "shape", a), a);
    },
  });
  return clone(e, o);
}
s(extend, "extend");
function safeExtend(e, t) {
  if (!isPlainObject(t)) throw new Error("Invalid input to safeExtend: expected a plain object");
  let r = mergeDefs(e._zod.def, {
    get shape() {
      let i = { ...e._zod.def.shape, ...t };
      return (assignProp(this, "shape", i), i);
    },
  });
  return clone(e, r);
}
s(safeExtend, "safeExtend");
function merge(e, t) {
  let r = mergeDefs(e._zod.def, {
    get shape() {
      let i = { ...e._zod.def.shape, ...t._zod.def.shape };
      return (assignProp(this, "shape", i), i);
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: [],
  });
  return clone(e, r);
}
s(merge, "merge");
function partial(e, t, r) {
  let o = t._zod.def.checks;
  if (o && o.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  let c = mergeDefs(t._zod.def, {
    get shape() {
      let l = t._zod.def.shape,
        p = { ...l };
      if (r)
        for (let d in r) {
          if (!(d in l)) throw new Error(`Unrecognized key: "${d}"`);
          r[d] && (p[d] = e ? new e({ type: "optional", innerType: l[d] }) : l[d]);
        }
      else for (let d in l) p[d] = e ? new e({ type: "optional", innerType: l[d] }) : l[d];
      return (assignProp(this, "shape", p), p);
    },
    checks: [],
  });
  return clone(t, c);
}
s(partial, "partial");
function required(e, t, r) {
  let i = mergeDefs(t._zod.def, {
    get shape() {
      let o = t._zod.def.shape,
        a = { ...o };
      if (r)
        for (let c in r) {
          if (!(c in a)) throw new Error(`Unrecognized key: "${c}"`);
          r[c] && (a[c] = new e({ type: "nonoptional", innerType: o[c] }));
        }
      else for (let c in o) a[c] = new e({ type: "nonoptional", innerType: o[c] });
      return (assignProp(this, "shape", a), a);
    },
  });
  return clone(t, i);
}
s(required, "required");
function aborted(e, t = 0) {
  if (e.aborted === !0) return !0;
  for (let r = t; r < e.issues.length; r++) if (e.issues[r]?.continue !== !0) return !0;
  return !1;
}
s(aborted, "aborted");
function prefixIssues(e, t) {
  return t.map((r) => {
    var i;
    return ((i = r).path ?? (i.path = []), r.path.unshift(e), r);
  });
}
s(prefixIssues, "prefixIssues");
function unwrapMessage(e) {
  return typeof e == "string" ? e : e?.message;
}
s(unwrapMessage, "unwrapMessage");
function finalizeIssue(e, t, r) {
  let i = { ...e, path: e.path ?? [] };
  if (!e.message) {
    let o =
      unwrapMessage(e.inst?._zod.def?.error?.(e)) ??
      unwrapMessage(t?.error?.(e)) ??
      unwrapMessage(r.customError?.(e)) ??
      unwrapMessage(r.localeError?.(e)) ??
      "Invalid input";
    i.message = o;
  }
  return (delete i.inst, delete i.continue, t?.reportInput || delete i.input, i);
}
s(finalizeIssue, "finalizeIssue");
function getSizableOrigin(e) {
  return e instanceof Set
    ? "set"
    : e instanceof Map
      ? "map"
      : e instanceof File
        ? "file"
        : "unknown";
}
s(getSizableOrigin, "getSizableOrigin");
function getLengthableOrigin(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
s(getLengthableOrigin, "getLengthableOrigin");
function parsedType(e) {
  let t = typeof e;
  switch (t) {
    case "number":
      return Number.isNaN(e) ? "nan" : "number";
    case "object": {
      if (e === null) return "null";
      if (Array.isArray(e)) return "array";
      let r = e;
      if (r && Object.getPrototypeOf(r) !== Object.prototype && "constructor" in r && r.constructor)
        return r.constructor.name;
    }
  }
  return t;
}
s(parsedType, "parsedType");
function issue(...e) {
  let [t, r, i] = e;
  return typeof t == "string" ? { message: t, code: "custom", input: r, inst: i } : { ...t };
}
s(issue, "issue");
function cleanEnum(e) {
  return Object.entries(e)
    .filter(([t, r]) => Number.isNaN(Number.parseInt(t, 10)))
    .map((t) => t[1]);
}
s(cleanEnum, "cleanEnum");
function base64ToUint8Array(e) {
  let t = atob(e),
    r = new Uint8Array(t.length);
  for (let i = 0; i < t.length; i++) r[i] = t.charCodeAt(i);
  return r;
}
s(base64ToUint8Array, "base64ToUint8Array");
function uint8ArrayToBase64(e) {
  let t = "";
  for (let r = 0; r < e.length; r++) t += String.fromCharCode(e[r]);
  return btoa(t);
}
s(uint8ArrayToBase64, "uint8ArrayToBase64");
function base64urlToUint8Array(e) {
  let t = e.replace(/-/g, "+").replace(/_/g, "/"),
    r = "=".repeat((4 - (t.length % 4)) % 4);
  return base64ToUint8Array(t + r);
}
s(base64urlToUint8Array, "base64urlToUint8Array");
function uint8ArrayToBase64url(e) {
  return uint8ArrayToBase64(e).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
s(uint8ArrayToBase64url, "uint8ArrayToBase64url");
function hexToUint8Array(e) {
  let t = e.replace(/^0x/, "");
  if (t.length % 2 !== 0) throw new Error("Invalid hex string length");
  let r = new Uint8Array(t.length / 2);
  for (let i = 0; i < t.length; i += 2) r[i / 2] = Number.parseInt(t.slice(i, i + 2), 16);
  return r;
}
s(hexToUint8Array, "hexToUint8Array");
function uint8ArrayToHex(e) {
  return Array.from(e)
    .map((t) => t.toString(16).padStart(2, "0"))
    .join("");
}
s(uint8ArrayToHex, "uint8ArrayToHex");
var si = class {
  static {
    s(this, "Class");
  }
  constructor(...t) {}
};
var up = s((e, t) => {
    ((e.name = "$ZodError"),
      Object.defineProperty(e, "_zod", { value: e._zod, enumerable: !1 }),
      Object.defineProperty(e, "issues", { value: t, enumerable: !1 }),
      (e.message = JSON.stringify(t, jsonStringifyReplacer, 2)),
      Object.defineProperty(e, "toString", { value: s(() => e.message, "value"), enumerable: !1 }));
  }, "initializer"),
  cn = $constructor("$ZodError", up),
  te = $constructor("$ZodError", up, { Parent: Error });
function flattenError(e, t = (r) => r.message) {
  let r = {},
    i = [];
  for (let o of e.issues)
    o.path.length > 0
      ? ((r[o.path[0]] = r[o.path[0]] || []), r[o.path[0]].push(t(o)))
      : i.push(t(o));
  return { formErrors: i, fieldErrors: r };
}
s(flattenError, "flattenError");
function formatError(e, t = (r) => r.message) {
  let r = { _errors: [] },
    i = s((o) => {
      for (let a of o.issues)
        if (a.code === "invalid_union" && a.errors.length) a.errors.map((c) => i({ issues: c }));
        else if (a.code === "invalid_key") i({ issues: a.issues });
        else if (a.code === "invalid_element") i({ issues: a.issues });
        else if (a.path.length === 0) r._errors.push(t(a));
        else {
          let c = r,
            l = 0;
          for (; l < a.path.length;) {
            let p = a.path[l];
            (l === a.path.length - 1
              ? ((c[p] = c[p] || { _errors: [] }), c[p]._errors.push(t(a)))
              : (c[p] = c[p] || { _errors: [] }),
              (c = c[p]),
              l++);
          }
        }
    }, "processError");
  return (i(e), r);
}
s(formatError, "formatError");
function treeifyError(e, t = (r) => r.message) {
  let r = { errors: [] },
    i = s((o, a = []) => {
      var c, l;
      for (let p of o.issues)
        if (p.code === "invalid_union" && p.errors.length)
          p.errors.map((d) => i({ issues: d }, p.path));
        else if (p.code === "invalid_key") i({ issues: p.issues }, p.path);
        else if (p.code === "invalid_element") i({ issues: p.issues }, p.path);
        else {
          let d = [...a, ...p.path];
          if (d.length === 0) {
            r.errors.push(t(p));
            continue;
          }
          let g = r,
            y = 0;
          for (; y < d.length;) {
            let S = d[y],
              v = y === d.length - 1;
            (typeof S == "string"
              ? (g.properties ?? (g.properties = {}),
                (c = g.properties)[S] ?? (c[S] = { errors: [] }),
                (g = g.properties[S]))
              : (g.items ?? (g.items = []),
                (l = g.items)[S] ?? (l[S] = { errors: [] }),
                (g = g.items[S])),
              v && g.errors.push(t(p)),
              y++);
          }
        }
    }, "processError");
  return (i(e), r);
}
s(treeifyError, "treeifyError");
function toDotPath(e) {
  let t = [],
    r = e.map((i) => (typeof i == "object" ? i.key : i));
  for (let i of r)
    typeof i == "number"
      ? t.push(`[${i}]`)
      : typeof i == "symbol"
        ? t.push(`[${JSON.stringify(String(i))}]`)
        : /[^\w$]/.test(i)
          ? t.push(`[${JSON.stringify(i)}]`)
          : (t.length && t.push("."), t.push(i));
  return t.join("");
}
s(toDotPath, "toDotPath");
function prettifyError(e) {
  let t = [],
    r = [...e.issues].sort((i, o) => (i.path ?? []).length - (o.path ?? []).length);
  for (let i of r)
    (t.push(`\u2716 ${i.message}`), i.path?.length && t.push(`  \u2192 at ${toDotPath(i.path)}`));
  return t.join(`
`);
}
s(prettifyError, "prettifyError");
var ut = s(
    (e) => (t, r, i, o) => {
      let a = i ? Object.assign(i, { async: !1 }) : { async: !1 },
        c = t._zod.run({ value: r, issues: [] }, a);
      if (c instanceof Promise) throw new ge();
      if (c.issues.length) {
        let l = new (o?.Err ?? e)(c.issues.map((p) => finalizeIssue(p, a, config())));
        throw (Qn(l, o?.callee), l);
      }
      return c.value;
    },
    "_parse",
  ),
  eo = ut(te),
  pt = s(
    (e) => async (t, r, i, o) => {
      let a = i ? Object.assign(i, { async: !0 }) : { async: !0 },
        c = t._zod.run({ value: r, issues: [] }, a);
      if ((c instanceof Promise && (c = await c), c.issues.length)) {
        let l = new (o?.Err ?? e)(c.issues.map((p) => finalizeIssue(p, a, config())));
        throw (Qn(l, o?.callee), l);
      }
      return c.value;
    },
    "_parseAsync",
  ),
  to = pt(te),
  mt = s(
    (e) => (t, r, i) => {
      let o = i ? { ...i, async: !1 } : { async: !1 },
        a = t._zod.run({ value: r, issues: [] }, o);
      if (a instanceof Promise) throw new ge();
      return a.issues.length
        ? { success: !1, error: new (e ?? cn)(a.issues.map((c) => finalizeIssue(c, o, config()))) }
        : { success: !0, data: a.value };
    },
    "_safeParse",
  ),
  bi = mt(te),
  gt = s(
    (e) => async (t, r, i) => {
      let o = i ? Object.assign(i, { async: !0 }) : { async: !0 },
        a = t._zod.run({ value: r, issues: [] }, o);
      return (
        a instanceof Promise && (a = await a),
        a.issues.length
          ? { success: !1, error: new e(a.issues.map((c) => finalizeIssue(c, o, config()))) }
          : { success: !0, data: a.value }
      );
    },
    "_safeParseAsync",
  ),
  vi = gt(te),
  no = s(
    (e) => (t, r, i) => {
      let o = i ? Object.assign(i, { direction: "backward" }) : { direction: "backward" };
      return ut(e)(t, r, o);
    },
    "_encode",
  ),
  Ay = no(te),
  oo = s((e) => (t, r, i) => ut(e)(t, r, i), "_decode"),
  zy = oo(te),
  ro = s(
    (e) => async (t, r, i) => {
      let o = i ? Object.assign(i, { direction: "backward" }) : { direction: "backward" };
      return pt(e)(t, r, o);
    },
    "_encodeAsync",
  ),
  My = ro(te),
  io = s((e) => async (t, r, i) => pt(e)(t, r, i), "_decodeAsync"),
  $y = io(te),
  ao = s(
    (e) => (t, r, i) => {
      let o = i ? Object.assign(i, { direction: "backward" }) : { direction: "backward" };
      return mt(e)(t, r, o);
    },
    "_safeEncode",
  ),
  Dy = ao(te),
  so = s((e) => (t, r, i) => mt(e)(t, r, i), "_safeDecode"),
  Uy = so(te),
  co = s(
    (e) => async (t, r, i) => {
      let o = i ? Object.assign(i, { direction: "backward" }) : { direction: "backward" };
      return gt(e)(t, r, o);
    },
    "_safeEncodeAsync",
  ),
  Ny = co(te),
  lo = s((e) => async (t, r, i) => gt(e)(t, r, i), "_safeDecodeAsync"),
  Zy = lo(te);
var de = {};
Re(de, {
  base64: () => $i,
  base64url: () => uo,
  bigint: () => Bi,
  boolean: () => Wi,
  browserEmail: () => Gy,
  cidrv4: () => zi,
  cidrv6: () => Mi,
  cuid: () => Si,
  cuid2: () => _i,
  date: () => Ui,
  datetime: () => datetime,
  domain: () => Jy,
  duration: () => Ri,
  e164: () => Di,
  email: () => Ti,
  emoji: () => emoji,
  extendedDuration: () => jy,
  guid: () => Pi,
  hex: () => Yy,
  hostname: () => Hy,
  html5Email: () => Fy,
  idnEmail: () => Vy,
  integer: () => Li,
  ipv4: () => Ei,
  ipv6: () => Oi,
  ksuid: () => Ii,
  lowercase: () => Vi,
  mac: () => Ai,
  md5_base64: () => Qy,
  md5_base64url: () => eb,
  md5_hex: () => Xy,
  nanoid: () => Ci,
  null: () => Fi,
  number: () => po,
  rfc5322Email: () => qy,
  sha1_base64: () => nb,
  sha1_base64url: () => ob,
  sha1_hex: () => tb,
  sha256_base64: () => ib,
  sha256_base64url: () => ab,
  sha256_hex: () => rb,
  sha384_base64: () => cb,
  sha384_base64url: () => lb,
  sha384_hex: () => sb,
  sha512_base64: () => ub,
  sha512_base64url: () => pb,
  sha512_hex: () => db,
  string: () => ji,
  time: () => time,
  ulid: () => xi,
  undefined: () => qi,
  unicodeEmail: () => mp,
  uppercase: () => Gi,
  uuid: () => He,
  uuid4: () => By,
  uuid6: () => Ly,
  uuid7: () => Wy,
  xid: () => ki,
});
var Si = /^[cC][^\s-]{8,}$/,
  _i = /^[0-9a-z]+$/,
  xi = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,
  ki = /^[0-9a-vA-V]{20}$/,
  Ii = /^[A-Za-z0-9]{27}$/,
  Ci = /^[a-zA-Z0-9_-]{21}$/,
  Ri =
    /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
  jy =
    /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,
  Pi = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  He = s(
    (e) =>
      e
        ? new RegExp(
            `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`,
          )
        : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,
    "uuid",
  ),
  By = He(4),
  Ly = He(6),
  Wy = He(7),
  Ti =
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
  Fy =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  qy =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  mp = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u,
  Vy = mp,
  Gy =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  Ky = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function emoji() {
  return new RegExp(Ky, "u");
}
s(emoji, "emoji");
var Ei =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  Oi =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,
  Ai = s((e) => {
    let t = escapeRegex(e ?? ":");
    return new RegExp(`^(?:[0-9A-F]{2}${t}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${t}){5}[0-9a-f]{2}$`);
  }, "mac"),
  zi =
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
  Mi =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  $i = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
  uo = /^[A-Za-z0-9_-]*$/,
  Hy =
    /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/,
  Jy = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
  Di = /^\+[1-9]\d{6,14}$/,
  gp =
    "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",
  Ui = new RegExp(`^${gp}$`);
function timeSource(e) {
  let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number"
    ? e.precision === -1
      ? `${t}`
      : e.precision === 0
        ? `${t}:[0-5]\\d`
        : `${t}:[0-5]\\d\\.\\d{${e.precision}}`
    : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
s(timeSource, "timeSource");
function time(e) {
  return new RegExp(`^${timeSource(e)}$`);
}
s(time, "time");
function datetime(e) {
  let t = timeSource({ precision: e.precision }),
    r = ["Z"];
  (e.local && r.push(""), e.offset && r.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)"));
  let i = `${t}(?:${r.join("|")})`;
  return new RegExp(`^${gp}T(?:${i})$`);
}
s(datetime, "datetime");
var ji = s((e) => {
    let t = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}` : "[\\s\\S]*";
    return new RegExp(`^${t}$`);
  }, "string"),
  Bi = /^-?\d+n?$/,
  Li = /^-?\d+$/,
  po = /^-?\d+(?:\.\d+)?$/,
  Wi = /^(?:true|false)$/i,
  Fi = /^null$/i;
var qi = /^undefined$/i;
var Vi = /^[^A-Z]*$/,
  Gi = /^[^a-z]*$/,
  Yy = /^[0-9a-fA-F]*$/;
function fixedBase64(e, t) {
  return new RegExp(`^[A-Za-z0-9+/]{${e}}${t}$`);
}
s(fixedBase64, "fixedBase64");
function fixedBase64url(e) {
  return new RegExp(`^[A-Za-z0-9_-]{${e}}$`);
}
s(fixedBase64url, "fixedBase64url");
var Xy = /^[0-9a-fA-F]{32}$/,
  Qy = fixedBase64(22, "=="),
  eb = fixedBase64url(22),
  tb = /^[0-9a-fA-F]{40}$/,
  nb = fixedBase64(27, "="),
  ob = fixedBase64url(27),
  rb = /^[0-9a-fA-F]{64}$/,
  ib = fixedBase64(43, "="),
  ab = fixedBase64url(43),
  sb = /^[0-9a-fA-F]{96}$/,
  cb = fixedBase64(64, ""),
  lb = fixedBase64url(64),
  db = /^[0-9a-fA-F]{128}$/,
  ub = fixedBase64(86, "=="),
  pb = fixedBase64url(86);
var Z = $constructor("$ZodCheck", (e, t) => {
    var r;
    (e._zod ?? (e._zod = {}), (e._zod.def = t), (r = e._zod).onattach ?? (r.onattach = []));
  }),
  yp = { number: "number", bigint: "bigint", object: "date" },
  mo = $constructor("$ZodCheckLessThan", (e, t) => {
    Z.init(e, t);
    let r = yp[typeof t.value];
    (e._zod.onattach.push((i) => {
      let o = i._zod.bag,
        a = (t.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
      t.value < a && (t.inclusive ? (o.maximum = t.value) : (o.exclusiveMaximum = t.value));
    }),
      (e._zod.check = (i) => {
        (t.inclusive ? i.value <= t.value : i.value < t.value) ||
          i.issues.push({
            origin: r,
            code: "too_big",
            maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
            input: i.value,
            inclusive: t.inclusive,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  go = $constructor("$ZodCheckGreaterThan", (e, t) => {
    Z.init(e, t);
    let r = yp[typeof t.value];
    (e._zod.onattach.push((i) => {
      let o = i._zod.bag,
        a = (t.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
      t.value > a && (t.inclusive ? (o.minimum = t.value) : (o.exclusiveMinimum = t.value));
    }),
      (e._zod.check = (i) => {
        (t.inclusive ? i.value >= t.value : i.value > t.value) ||
          i.issues.push({
            origin: r,
            code: "too_small",
            minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
            input: i.value,
            inclusive: t.inclusive,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Ki = $constructor("$ZodCheckMultipleOf", (e, t) => {
    (Z.init(e, t),
      e._zod.onattach.push((r) => {
        var i;
        (i = r._zod.bag).multipleOf ?? (i.multipleOf = t.value);
      }),
      (e._zod.check = (r) => {
        if (typeof r.value != typeof t.value)
          throw new Error("Cannot mix number and bigint in multiple_of check.");
        (typeof r.value == "bigint"
          ? r.value % t.value === BigInt(0)
          : floatSafeRemainder(r.value, t.value) === 0) ||
          r.issues.push({
            origin: typeof r.value,
            code: "not_multiple_of",
            divisor: t.value,
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Hi = $constructor("$ZodCheckNumberFormat", (e, t) => {
    (Z.init(e, t), (t.format = t.format || "float64"));
    let r = t.format?.includes("int"),
      i = r ? "int" : "number",
      [o, a] = gi[t.format];
    (e._zod.onattach.push((c) => {
      let l = c._zod.bag;
      ((l.format = t.format), (l.minimum = o), (l.maximum = a), r && (l.pattern = Li));
    }),
      (e._zod.check = (c) => {
        let l = c.value;
        if (r) {
          if (!Number.isInteger(l)) {
            c.issues.push({
              expected: i,
              format: t.format,
              code: "invalid_type",
              continue: !1,
              input: l,
              inst: e,
            });
            return;
          }
          if (!Number.isSafeInteger(l)) {
            l > 0
              ? c.issues.push({
                  input: l,
                  code: "too_big",
                  maximum: Number.MAX_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: i,
                  inclusive: !0,
                  continue: !t.abort,
                })
              : c.issues.push({
                  input: l,
                  code: "too_small",
                  minimum: Number.MIN_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: i,
                  inclusive: !0,
                  continue: !t.abort,
                });
            return;
          }
        }
        (l < o &&
          c.issues.push({
            origin: "number",
            input: l,
            code: "too_small",
            minimum: o,
            inclusive: !0,
            inst: e,
            continue: !t.abort,
          }),
          l > a &&
            c.issues.push({
              origin: "number",
              input: l,
              code: "too_big",
              maximum: a,
              inclusive: !0,
              inst: e,
              continue: !t.abort,
            }));
      }));
  }),
  Ji = $constructor("$ZodCheckBigIntFormat", (e, t) => {
    Z.init(e, t);
    let [r, i] = fi[t.format];
    (e._zod.onattach.push((o) => {
      let a = o._zod.bag;
      ((a.format = t.format), (a.minimum = r), (a.maximum = i));
    }),
      (e._zod.check = (o) => {
        let a = o.value;
        (a < r &&
          o.issues.push({
            origin: "bigint",
            input: a,
            code: "too_small",
            minimum: r,
            inclusive: !0,
            inst: e,
            continue: !t.abort,
          }),
          a > i &&
            o.issues.push({
              origin: "bigint",
              input: a,
              code: "too_big",
              maximum: i,
              inclusive: !0,
              inst: e,
              continue: !t.abort,
            }));
      }));
  }),
  Yi = $constructor("$ZodCheckMaxSize", (e, t) => {
    var r;
    (Z.init(e, t),
      (r = e._zod.def).when ??
        (r.when = (i) => {
          let o = i.value;
          return !nullish(o) && o.size !== void 0;
        }),
      e._zod.onattach.push((i) => {
        let o = i._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        t.maximum < o && (i._zod.bag.maximum = t.maximum);
      }),
      (e._zod.check = (i) => {
        let o = i.value;
        o.size <= t.maximum ||
          i.issues.push({
            origin: getSizableOrigin(o),
            code: "too_big",
            maximum: t.maximum,
            inclusive: !0,
            input: o,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Xi = $constructor("$ZodCheckMinSize", (e, t) => {
    var r;
    (Z.init(e, t),
      (r = e._zod.def).when ??
        (r.when = (i) => {
          let o = i.value;
          return !nullish(o) && o.size !== void 0;
        }),
      e._zod.onattach.push((i) => {
        let o = i._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        t.minimum > o && (i._zod.bag.minimum = t.minimum);
      }),
      (e._zod.check = (i) => {
        let o = i.value;
        o.size >= t.minimum ||
          i.issues.push({
            origin: getSizableOrigin(o),
            code: "too_small",
            minimum: t.minimum,
            inclusive: !0,
            input: o,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Qi = $constructor("$ZodCheckSizeEquals", (e, t) => {
    var r;
    (Z.init(e, t),
      (r = e._zod.def).when ??
        (r.when = (i) => {
          let o = i.value;
          return !nullish(o) && o.size !== void 0;
        }),
      e._zod.onattach.push((i) => {
        let o = i._zod.bag;
        ((o.minimum = t.size), (o.maximum = t.size), (o.size = t.size));
      }),
      (e._zod.check = (i) => {
        let o = i.value,
          a = o.size;
        if (a === t.size) return;
        let c = a > t.size;
        i.issues.push({
          origin: getSizableOrigin(o),
          ...(c ? { code: "too_big", maximum: t.size } : { code: "too_small", minimum: t.size }),
          inclusive: !0,
          exact: !0,
          input: i.value,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  ea = $constructor("$ZodCheckMaxLength", (e, t) => {
    var r;
    (Z.init(e, t),
      (r = e._zod.def).when ??
        (r.when = (i) => {
          let o = i.value;
          return !nullish(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((i) => {
        let o = i._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        t.maximum < o && (i._zod.bag.maximum = t.maximum);
      }),
      (e._zod.check = (i) => {
        let o = i.value;
        if (o.length <= t.maximum) return;
        let c = getLengthableOrigin(o);
        i.issues.push({
          origin: c,
          code: "too_big",
          maximum: t.maximum,
          inclusive: !0,
          input: o,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  ta = $constructor("$ZodCheckMinLength", (e, t) => {
    var r;
    (Z.init(e, t),
      (r = e._zod.def).when ??
        (r.when = (i) => {
          let o = i.value;
          return !nullish(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((i) => {
        let o = i._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        t.minimum > o && (i._zod.bag.minimum = t.minimum);
      }),
      (e._zod.check = (i) => {
        let o = i.value;
        if (o.length >= t.minimum) return;
        let c = getLengthableOrigin(o);
        i.issues.push({
          origin: c,
          code: "too_small",
          minimum: t.minimum,
          inclusive: !0,
          input: o,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  na = $constructor("$ZodCheckLengthEquals", (e, t) => {
    var r;
    (Z.init(e, t),
      (r = e._zod.def).when ??
        (r.when = (i) => {
          let o = i.value;
          return !nullish(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((i) => {
        let o = i._zod.bag;
        ((o.minimum = t.length), (o.maximum = t.length), (o.length = t.length));
      }),
      (e._zod.check = (i) => {
        let o = i.value,
          a = o.length;
        if (a === t.length) return;
        let c = getLengthableOrigin(o),
          l = a > t.length;
        i.issues.push({
          origin: c,
          ...(l
            ? { code: "too_big", maximum: t.length }
            : { code: "too_small", minimum: t.length }),
          inclusive: !0,
          exact: !0,
          input: i.value,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  ft = $constructor("$ZodCheckStringFormat", (e, t) => {
    var r, i;
    (Z.init(e, t),
      e._zod.onattach.push((o) => {
        let a = o._zod.bag;
        ((a.format = t.format),
          t.pattern && (a.patterns ?? (a.patterns = new Set()), a.patterns.add(t.pattern)));
      }),
      t.pattern
        ? ((r = e._zod).check ??
          (r.check = (o) => {
            ((t.pattern.lastIndex = 0),
              !t.pattern.test(o.value) &&
                o.issues.push({
                  origin: "string",
                  code: "invalid_format",
                  format: t.format,
                  input: o.value,
                  ...(t.pattern ? { pattern: t.pattern.toString() } : {}),
                  inst: e,
                  continue: !t.abort,
                }));
          }))
        : ((i = e._zod).check ?? (i.check = () => {})));
  }),
  oa = $constructor("$ZodCheckRegex", (e, t) => {
    (ft.init(e, t),
      (e._zod.check = (r) => {
        ((t.pattern.lastIndex = 0),
          !t.pattern.test(r.value) &&
            r.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "regex",
              input: r.value,
              pattern: t.pattern.toString(),
              inst: e,
              continue: !t.abort,
            }));
      }));
  }),
  ra = $constructor("$ZodCheckLowerCase", (e, t) => {
    (t.pattern ?? (t.pattern = Vi), ft.init(e, t));
  }),
  ia = $constructor("$ZodCheckUpperCase", (e, t) => {
    (t.pattern ?? (t.pattern = Gi), ft.init(e, t));
  }),
  aa = $constructor("$ZodCheckIncludes", (e, t) => {
    Z.init(e, t);
    let r = escapeRegex(t.includes),
      i = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${r}` : r);
    ((t.pattern = i),
      e._zod.onattach.push((o) => {
        let a = o._zod.bag;
        (a.patterns ?? (a.patterns = new Set()), a.patterns.add(i));
      }),
      (e._zod.check = (o) => {
        o.value.includes(t.includes, t.position) ||
          o.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "includes",
            includes: t.includes,
            input: o.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  sa = $constructor("$ZodCheckStartsWith", (e, t) => {
    Z.init(e, t);
    let r = new RegExp(`^${escapeRegex(t.prefix)}.*`);
    (t.pattern ?? (t.pattern = r),
      e._zod.onattach.push((i) => {
        let o = i._zod.bag;
        (o.patterns ?? (o.patterns = new Set()), o.patterns.add(r));
      }),
      (e._zod.check = (i) => {
        i.value.startsWith(t.prefix) ||
          i.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "starts_with",
            prefix: t.prefix,
            input: i.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  ca = $constructor("$ZodCheckEndsWith", (e, t) => {
    Z.init(e, t);
    let r = new RegExp(`.*${escapeRegex(t.suffix)}$`);
    (t.pattern ?? (t.pattern = r),
      e._zod.onattach.push((i) => {
        let o = i._zod.bag;
        (o.patterns ?? (o.patterns = new Set()), o.patterns.add(r));
      }),
      (e._zod.check = (i) => {
        i.value.endsWith(t.suffix) ||
          i.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "ends_with",
            suffix: t.suffix,
            input: i.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  });
function handleCheckPropertyResult(e, t, r) {
  e.issues.length && t.issues.push(...prefixIssues(r, e.issues));
}
s(handleCheckPropertyResult, "handleCheckPropertyResult");
var la = $constructor("$ZodCheckProperty", (e, t) => {
    (Z.init(e, t),
      (e._zod.check = (r) => {
        let i = t.schema._zod.run({ value: r.value[t.property], issues: [] }, {});
        if (i instanceof Promise) return i.then((o) => handleCheckPropertyResult(o, r, t.property));
        handleCheckPropertyResult(i, r, t.property);
      }));
  }),
  da = $constructor("$ZodCheckMimeType", (e, t) => {
    Z.init(e, t);
    let r = new Set(t.mime);
    (e._zod.onattach.push((i) => {
      i._zod.bag.mime = t.mime;
    }),
      (e._zod.check = (i) => {
        r.has(i.value.type) ||
          i.issues.push({
            code: "invalid_value",
            values: t.mime,
            input: i.value.type,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  ua = $constructor("$ZodCheckOverwrite", (e, t) => {
    (Z.init(e, t),
      (e._zod.check = (r) => {
        r.value = t.tx(r.value);
      }));
  });
var mn = class {
  static {
    s(this, "Doc");
  }
  constructor(t = []) {
    ((this.content = []), (this.indent = 0), this && (this.args = t));
  }
  indented(t) {
    ((this.indent += 1), t(this), (this.indent -= 1));
  }
  write(t) {
    if (typeof t == "function") {
      (t(this, { execution: "sync" }), t(this, { execution: "async" }));
      return;
    }
    let i = t
        .split(
          `
`,
        )
        .filter((c) => c),
      o = Math.min(...i.map((c) => c.length - c.trimStart().length)),
      a = i.map((c) => c.slice(o)).map((c) => " ".repeat(this.indent * 2) + c);
    for (let c of a) this.content.push(c);
  }
  compile() {
    let t = Function,
      r = this?.args,
      o = [...(this?.content ?? [""]).map((a) => `  ${a}`)];
    return new t(
      ...r,
      o.join(`
`),
    );
  }
};
var pa = { major: 4, minor: 3, patch: 6 };
var E = $constructor("$ZodType", (e, t) => {
    var r;
    (e ?? (e = {}), (e._zod.def = t), (e._zod.bag = e._zod.bag || {}), (e._zod.version = pa));
    let i = [...(e._zod.def.checks ?? [])];
    e._zod.traits.has("$ZodCheck") && i.unshift(e);
    for (let o of i) for (let a of o._zod.onattach) a(e);
    if (i.length === 0)
      ((r = e._zod).deferred ?? (r.deferred = []),
        e._zod.deferred?.push(() => {
          e._zod.run = e._zod.parse;
        }));
    else {
      let o = s((c, l, p) => {
          let d = aborted(c),
            g;
          for (let y of l) {
            if (y._zod.def.when) {
              if (!y._zod.def.when(c)) continue;
            } else if (d) continue;
            let S = c.issues.length,
              v = y._zod.check(c);
            if (v instanceof Promise && p?.async === !1) throw new ge();
            if (g || v instanceof Promise)
              g = (g ?? Promise.resolve()).then(async () => {
                (await v, c.issues.length !== S && (d || (d = aborted(c, S))));
              });
            else {
              if (c.issues.length === S) continue;
              d || (d = aborted(c, S));
            }
          }
          return g ? g.then(() => c) : c;
        }, "runChecks"),
        a = s((c, l, p) => {
          if (aborted(c)) return ((c.aborted = !0), c);
          let d = o(l, i, p);
          if (d instanceof Promise) {
            if (p.async === !1) throw new ge();
            return d.then((g) => e._zod.parse(g, p));
          }
          return e._zod.parse(d, p);
        }, "handleCanaryResult");
      e._zod.run = (c, l) => {
        if (l.skipChecks) return e._zod.parse(c, l);
        if (l.direction === "backward") {
          let d = e._zod.parse({ value: c.value, issues: [] }, { ...l, skipChecks: !0 });
          return d instanceof Promise ? d.then((g) => a(g, c, l)) : a(d, c, l);
        }
        let p = e._zod.parse(c, l);
        if (p instanceof Promise) {
          if (l.async === !1) throw new ge();
          return p.then((d) => o(d, i, l));
        }
        return o(p, i, l);
      };
    }
    defineLazy(e, "~standard", () => ({
      validate: s((o) => {
        try {
          let a = bi(e, o);
          return a.success ? { value: a.data } : { issues: a.error?.issues };
        } catch {
          return vi(e, o).then((c) =>
            c.success ? { value: c.data } : { issues: c.error?.issues },
          );
        }
      }, "validate"),
      vendor: "zod",
      version: 1,
    }));
  }),
  Je = $constructor("$ZodString", (e, t) => {
    (E.init(e, t),
      (e._zod.pattern = [...(e?._zod.bag?.patterns ?? [])].pop() ?? ji(e._zod.bag)),
      (e._zod.parse = (r, i) => {
        if (t.coerce)
          try {
            r.value = String(r.value);
          } catch {}
        return (
          typeof r.value == "string" ||
            r.issues.push({ expected: "string", code: "invalid_type", input: r.value, inst: e }),
          r
        );
      }));
  }),
  U = $constructor("$ZodStringFormat", (e, t) => {
    (ft.init(e, t), Je.init(e, t));
  }),
  ga = $constructor("$ZodGUID", (e, t) => {
    (t.pattern ?? (t.pattern = Pi), U.init(e, t));
  }),
  fa = $constructor("$ZodUUID", (e, t) => {
    if (t.version) {
      let i = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[t.version];
      if (i === void 0) throw new Error(`Invalid UUID version: "${t.version}"`);
      t.pattern ?? (t.pattern = He(i));
    } else t.pattern ?? (t.pattern = He());
    U.init(e, t);
  }),
  ha = $constructor("$ZodEmail", (e, t) => {
    (t.pattern ?? (t.pattern = Ti), U.init(e, t));
  }),
  ya = $constructor("$ZodURL", (e, t) => {
    (U.init(e, t),
      (e._zod.check = (r) => {
        try {
          let i = r.value.trim(),
            o = new URL(i);
          (t.hostname &&
            ((t.hostname.lastIndex = 0),
            t.hostname.test(o.hostname) ||
              r.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid hostname",
                pattern: t.hostname.source,
                input: r.value,
                inst: e,
                continue: !t.abort,
              })),
            t.protocol &&
              ((t.protocol.lastIndex = 0),
              t.protocol.test(o.protocol.endsWith(":") ? o.protocol.slice(0, -1) : o.protocol) ||
                r.issues.push({
                  code: "invalid_format",
                  format: "url",
                  note: "Invalid protocol",
                  pattern: t.protocol.source,
                  input: r.value,
                  inst: e,
                  continue: !t.abort,
                })),
            t.normalize ? (r.value = o.href) : (r.value = i));
          return;
        } catch {
          r.issues.push({
            code: "invalid_format",
            format: "url",
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  }),
  ba = $constructor("$ZodEmoji", (e, t) => {
    (t.pattern ?? (t.pattern = emoji()), U.init(e, t));
  }),
  va = $constructor("$ZodNanoID", (e, t) => {
    (t.pattern ?? (t.pattern = Ci), U.init(e, t));
  }),
  Sa = $constructor("$ZodCUID", (e, t) => {
    (t.pattern ?? (t.pattern = Si), U.init(e, t));
  }),
  _a = $constructor("$ZodCUID2", (e, t) => {
    (t.pattern ?? (t.pattern = _i), U.init(e, t));
  }),
  xa = $constructor("$ZodULID", (e, t) => {
    (t.pattern ?? (t.pattern = xi), U.init(e, t));
  }),
  ka = $constructor("$ZodXID", (e, t) => {
    (t.pattern ?? (t.pattern = ki), U.init(e, t));
  }),
  Ia = $constructor("$ZodKSUID", (e, t) => {
    (t.pattern ?? (t.pattern = Ii), U.init(e, t));
  }),
  Ca = $constructor("$ZodISODateTime", (e, t) => {
    (t.pattern ?? (t.pattern = datetime(t)), U.init(e, t));
  }),
  Ra = $constructor("$ZodISODate", (e, t) => {
    (t.pattern ?? (t.pattern = Ui), U.init(e, t));
  }),
  Pa = $constructor("$ZodISOTime", (e, t) => {
    (t.pattern ?? (t.pattern = time(t)), U.init(e, t));
  }),
  Ta = $constructor("$ZodISODuration", (e, t) => {
    (t.pattern ?? (t.pattern = Ri), U.init(e, t));
  }),
  wa = $constructor("$ZodIPv4", (e, t) => {
    (t.pattern ?? (t.pattern = Ei), U.init(e, t), (e._zod.bag.format = "ipv4"));
  }),
  Ea = $constructor("$ZodIPv6", (e, t) => {
    (t.pattern ?? (t.pattern = Oi),
      U.init(e, t),
      (e._zod.bag.format = "ipv6"),
      (e._zod.check = (r) => {
        try {
          new URL(`http://[${r.value}]`);
        } catch {
          r.issues.push({
            code: "invalid_format",
            format: "ipv6",
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  }),
  Oa = $constructor("$ZodMAC", (e, t) => {
    (t.pattern ?? (t.pattern = Ai(t.delimiter)), U.init(e, t), (e._zod.bag.format = "mac"));
  }),
  Aa = $constructor("$ZodCIDRv4", (e, t) => {
    (t.pattern ?? (t.pattern = zi), U.init(e, t));
  }),
  za = $constructor("$ZodCIDRv6", (e, t) => {
    (t.pattern ?? (t.pattern = Mi),
      U.init(e, t),
      (e._zod.check = (r) => {
        let i = r.value.split("/");
        try {
          if (i.length !== 2) throw new Error();
          let [o, a] = i;
          if (!a) throw new Error();
          let c = Number(a);
          if (`${c}` !== a) throw new Error();
          if (c < 0 || c > 128) throw new Error();
          new URL(`http://[${o}]`);
        } catch {
          r.issues.push({
            code: "invalid_format",
            format: "cidrv6",
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  });
function isValidBase64(e) {
  if (e === "") return !0;
  if (e.length % 4 !== 0) return !1;
  try {
    return (atob(e), !0);
  } catch {
    return !1;
  }
}
s(isValidBase64, "isValidBase64");
var $a = $constructor("$ZodBase64", (e, t) => {
  (t.pattern ?? (t.pattern = $i),
    U.init(e, t),
    (e._zod.bag.contentEncoding = "base64"),
    (e._zod.check = (r) => {
      isValidBase64(r.value) ||
        r.issues.push({
          code: "invalid_format",
          format: "base64",
          input: r.value,
          inst: e,
          continue: !t.abort,
        });
    }));
});
function isValidBase64URL(e) {
  if (!uo.test(e)) return !1;
  let t = e.replace(/[-_]/g, (i) => (i === "-" ? "+" : "/")),
    r = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return isValidBase64(r);
}
s(isValidBase64URL, "isValidBase64URL");
var Da = $constructor("$ZodBase64URL", (e, t) => {
    (t.pattern ?? (t.pattern = uo),
      U.init(e, t),
      (e._zod.bag.contentEncoding = "base64url"),
      (e._zod.check = (r) => {
        isValidBase64URL(r.value) ||
          r.issues.push({
            code: "invalid_format",
            format: "base64url",
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Ua = $constructor("$ZodE164", (e, t) => {
    (t.pattern ?? (t.pattern = Di), U.init(e, t));
  });
function isValidJWT(e, t = null) {
  try {
    let r = e.split(".");
    if (r.length !== 3) return !1;
    let [i] = r;
    if (!i) return !1;
    let o = JSON.parse(atob(i));
    return !(("typ" in o && o?.typ !== "JWT") || !o.alg || (t && (!("alg" in o) || o.alg !== t)));
  } catch {
    return !1;
  }
}
s(isValidJWT, "isValidJWT");
var Na = $constructor("$ZodJWT", (e, t) => {
    (U.init(e, t),
      (e._zod.check = (r) => {
        isValidJWT(r.value, t.alg) ||
          r.issues.push({
            code: "invalid_format",
            format: "jwt",
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Za = $constructor("$ZodCustomStringFormat", (e, t) => {
    (U.init(e, t),
      (e._zod.check = (r) => {
        t.fn(r.value) ||
          r.issues.push({
            code: "invalid_format",
            format: t.format,
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  So = $constructor("$ZodNumber", (e, t) => {
    (E.init(e, t),
      (e._zod.pattern = e._zod.bag.pattern ?? po),
      (e._zod.parse = (r, i) => {
        if (t.coerce)
          try {
            r.value = Number(r.value);
          } catch {}
        let o = r.value;
        if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o)) return r;
        let a =
          typeof o == "number"
            ? Number.isNaN(o)
              ? "NaN"
              : Number.isFinite(o)
                ? void 0
                : "Infinity"
            : void 0;
        return (
          r.issues.push({
            expected: "number",
            code: "invalid_type",
            input: o,
            inst: e,
            ...(a ? { received: a } : {}),
          }),
          r
        );
      }));
  }),
  ja = $constructor("$ZodNumberFormat", (e, t) => {
    (Hi.init(e, t), So.init(e, t));
  }),
  gn = $constructor("$ZodBoolean", (e, t) => {
    (E.init(e, t),
      (e._zod.pattern = Wi),
      (e._zod.parse = (r, i) => {
        if (t.coerce)
          try {
            r.value = !!r.value;
          } catch {}
        let o = r.value;
        return (
          typeof o == "boolean" ||
            r.issues.push({ expected: "boolean", code: "invalid_type", input: o, inst: e }),
          r
        );
      }));
  }),
  _o = $constructor("$ZodBigInt", (e, t) => {
    (E.init(e, t),
      (e._zod.pattern = Bi),
      (e._zod.parse = (r, i) => {
        if (t.coerce)
          try {
            r.value = BigInt(r.value);
          } catch {}
        return (
          typeof r.value == "bigint" ||
            r.issues.push({ expected: "bigint", code: "invalid_type", input: r.value, inst: e }),
          r
        );
      }));
  }),
  Ba = $constructor("$ZodBigIntFormat", (e, t) => {
    (Ji.init(e, t), _o.init(e, t));
  }),
  La = $constructor("$ZodSymbol", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) => {
        let o = r.value;
        return (
          typeof o == "symbol" ||
            r.issues.push({ expected: "symbol", code: "invalid_type", input: o, inst: e }),
          r
        );
      }));
  }),
  Wa = $constructor("$ZodUndefined", (e, t) => {
    (E.init(e, t),
      (e._zod.pattern = qi),
      (e._zod.values = new Set([void 0])),
      (e._zod.optin = "optional"),
      (e._zod.optout = "optional"),
      (e._zod.parse = (r, i) => {
        let o = r.value;
        return (
          typeof o > "u" ||
            r.issues.push({ expected: "undefined", code: "invalid_type", input: o, inst: e }),
          r
        );
      }));
  }),
  Fa = $constructor("$ZodNull", (e, t) => {
    (E.init(e, t),
      (e._zod.pattern = Fi),
      (e._zod.values = new Set([null])),
      (e._zod.parse = (r, i) => {
        let o = r.value;
        return (
          o === null ||
            r.issues.push({ expected: "null", code: "invalid_type", input: o, inst: e }),
          r
        );
      }));
  }),
  qa = $constructor("$ZodAny", (e, t) => {
    (E.init(e, t), (e._zod.parse = (r) => r));
  }),
  Va = $constructor("$ZodUnknown", (e, t) => {
    (E.init(e, t), (e._zod.parse = (r) => r));
  }),
  Ga = $constructor("$ZodNever", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) => (
        r.issues.push({ expected: "never", code: "invalid_type", input: r.value, inst: e }),
        r
      )));
  }),
  Ka = $constructor("$ZodVoid", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) => {
        let o = r.value;
        return (
          typeof o > "u" ||
            r.issues.push({ expected: "void", code: "invalid_type", input: o, inst: e }),
          r
        );
      }));
  }),
  Ha = $constructor("$ZodDate", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) => {
        if (t.coerce)
          try {
            r.value = new Date(r.value);
          } catch {}
        let o = r.value,
          a = o instanceof Date;
        return (
          (a && !Number.isNaN(o.getTime())) ||
            r.issues.push({
              expected: "date",
              code: "invalid_type",
              input: o,
              ...(a ? { received: "Invalid Date" } : {}),
              inst: e,
            }),
          r
        );
      }));
  });
function handleArrayResult(e, t, r) {
  (e.issues.length && t.issues.push(...prefixIssues(r, e.issues)), (t.value[r] = e.value));
}
s(handleArrayResult, "handleArrayResult");
var Ja = $constructor("$ZodArray", (e, t) => {
  (E.init(e, t),
    (e._zod.parse = (r, i) => {
      let o = r.value;
      if (!Array.isArray(o))
        return (r.issues.push({ expected: "array", code: "invalid_type", input: o, inst: e }), r);
      r.value = Array(o.length);
      let a = [];
      for (let c = 0; c < o.length; c++) {
        let l = o[c],
          p = t.element._zod.run({ value: l, issues: [] }, i);
        p instanceof Promise ? a.push(p.then((d) => handleArrayResult(d, r, c))) : handleArrayResult(p, r, c);
      }
      return a.length ? Promise.all(a).then(() => r) : r;
    }));
});
function handlePropertyResult(e, t, r, i, o) {
  if (e.issues.length) {
    if (o && !(r in i)) return;
    t.issues.push(...prefixIssues(r, e.issues));
  }
  e.value === void 0 ? r in i && (t.value[r] = void 0) : (t.value[r] = e.value);
}
s(handlePropertyResult, "handlePropertyResult");
function normalizeDef(e) {
  let t = Object.keys(e.shape);
  for (let i of t)
    if (!e.shape?.[i]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${i}": expected a Zod schema`);
  let r = optionalKeys(e.shape);
  return { ...e, keys: t, keySet: new Set(t), numKeys: t.length, optionalKeys: new Set(r) };
}
s(normalizeDef, "normalizeDef");
function handleCatchall(e, t, r, i, o, a) {
  let c = [],
    l = o.keySet,
    p = o.catchall._zod,
    d = p.def.type,
    g = p.optout === "optional";
  for (let y in t) {
    if (l.has(y)) continue;
    if (d === "never") {
      c.push(y);
      continue;
    }
    let S = p.run({ value: t[y], issues: [] }, i);
    S instanceof Promise ? e.push(S.then((v) => handlePropertyResult(v, r, y, t, g))) : handlePropertyResult(S, r, y, t, g);
  }
  return (
    c.length && r.issues.push({ code: "unrecognized_keys", keys: c, input: t, inst: a }),
    e.length ? Promise.all(e).then(() => r) : r
  );
}
s(handleCatchall, "handleCatchall");
var Mp = $constructor("$ZodObject", (e, t) => {
    if ((E.init(e, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get)) {
      let l = t.shape;
      Object.defineProperty(t, "shape", {
        get: s(() => {
          let p = { ...l };
          return (Object.defineProperty(t, "shape", { value: p }), p);
        }, "get"),
      });
    }
    let i = cached(() => normalizeDef(t));
    defineLazy(e._zod, "propValues", () => {
      let l = t.shape,
        p = {};
      for (let d in l) {
        let g = l[d]._zod;
        if (g.values) {
          p[d] ?? (p[d] = new Set());
          for (let y of g.values) p[d].add(y);
        }
      }
      return p;
    });
    let o = isObject,
      a = t.catchall,
      c;
    e._zod.parse = (l, p) => {
      c ?? (c = i.value);
      let d = l.value;
      if (!o(d))
        return (l.issues.push({ expected: "object", code: "invalid_type", input: d, inst: e }), l);
      l.value = {};
      let g = [],
        y = c.shape;
      for (let S of c.keys) {
        let v = y[S],
          P = v._zod.optout === "optional",
          w = v._zod.run({ value: d[S], issues: [] }, p);
        w instanceof Promise ? g.push(w.then((G) => handlePropertyResult(G, l, S, d, P))) : handlePropertyResult(w, l, S, d, P);
      }
      return a ? handleCatchall(g, d, l, p, i.value, e) : g.length ? Promise.all(g).then(() => l) : l;
    };
  }),
  Ya = $constructor("$ZodObjectJIT", (e, t) => {
    Mp.init(e, t);
    let r = e._zod.parse,
      i = cached(() => normalizeDef(t)),
      o = s((S) => {
        let v = new mn(["shape", "payload", "ctx"]),
          P = i.value,
          w = s((be) => {
            let Q = esc(be);
            return `shape[${Q}]._zod.run({ value: input[${Q}], issues: [] }, ctx)`;
          }, "parseStr");
        v.write("const input = payload.value;");
        let G = Object.create(null),
          Jn = 0;
        for (let be of P.keys) G[be] = `key_${Jn++}`;
        v.write("const newResult = {};");
        for (let be of P.keys) {
          let Q = G[be],
            me = esc(be),
            Qh = S[be]?._zod?.optout === "optional";
          (v.write(`const ${Q} = ${w(be)};`),
            Qh
              ? v.write(`
        if (${Q}.issues.length) {
          if (${me} in input) {
            payload.issues = payload.issues.concat(${Q}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${me}, ...iss.path] : [${me}]
            })));
          }
        }
        
        if (${Q}.value === undefined) {
          if (${me} in input) {
            newResult[${me}] = undefined;
          }
        } else {
          newResult[${me}] = ${Q}.value;
        }
        
      `)
              : v.write(`
        if (${Q}.issues.length) {
          payload.issues = payload.issues.concat(${Q}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${me}, ...iss.path] : [${me}]
          })));
        }
        
        if (${Q}.value === undefined) {
          if (${me} in input) {
            newResult[${me}] = undefined;
          }
        } else {
          newResult[${me}] = ${Q}.value;
        }
        
      `));
        }
        (v.write("payload.value = newResult;"), v.write("return payload;"));
        let Xh = v.compile();
        return (be, Q) => Xh(S, be, Q);
      }, "generateFastpass"),
      a,
      c = isObject,
      l = !en.jitless,
      d = l && di.value,
      g = t.catchall,
      y;
    e._zod.parse = (S, v) => {
      y ?? (y = i.value);
      let P = S.value;
      return c(P)
        ? l && d && v?.async === !1 && v.jitless !== !0
          ? (a || (a = o(t.shape)), (S = a(S, v)), g ? handleCatchall([], P, S, v, y, e) : S)
          : r(S, v)
        : (S.issues.push({ expected: "object", code: "invalid_type", input: P, inst: e }), S);
    };
  });
function handleUnionResults(e, t, r, i) {
  for (let a of e) if (a.issues.length === 0) return ((t.value = a.value), t);
  let o = e.filter((a) => !aborted(a));
  return o.length === 1
    ? ((t.value = o[0].value), o[0])
    : (t.issues.push({
        code: "invalid_union",
        input: t.value,
        inst: r,
        errors: e.map((a) => a.issues.map((c) => finalizeIssue(c, i, config()))),
      }),
      t);
}
s(handleUnionResults, "handleUnionResults");
var fn = $constructor("$ZodUnion", (e, t) => {
  (E.init(e, t),
    defineLazy(e._zod, "optin", () =>
      t.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0,
    ),
    defineLazy(e._zod, "optout", () =>
      t.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0,
    ),
    defineLazy(e._zod, "values", () => {
      if (t.options.every((o) => o._zod.values))
        return new Set(t.options.flatMap((o) => Array.from(o._zod.values)));
    }),
    defineLazy(e._zod, "pattern", () => {
      if (t.options.every((o) => o._zod.pattern)) {
        let o = t.options.map((a) => a._zod.pattern);
        return new RegExp(`^(${o.map((a) => cleanRegex(a.source)).join("|")})$`);
      }
    }));
  let r = t.options.length === 1,
    i = t.options[0]._zod.run;
  e._zod.parse = (o, a) => {
    if (r) return i(o, a);
    let c = !1,
      l = [];
    for (let p of t.options) {
      let d = p._zod.run({ value: o.value, issues: [] }, a);
      if (d instanceof Promise) (l.push(d), (c = !0));
      else {
        if (d.issues.length === 0) return d;
        l.push(d);
      }
    }
    return c ? Promise.all(l).then((p) => handleUnionResults(p, o, e, a)) : handleUnionResults(l, o, e, a);
  };
});
function handleExclusiveUnionResults(e, t, r, i) {
  let o = e.filter((a) => a.issues.length === 0);
  return o.length === 1
    ? ((t.value = o[0].value), t)
    : (o.length === 0
        ? t.issues.push({
            code: "invalid_union",
            input: t.value,
            inst: r,
            errors: e.map((a) => a.issues.map((c) => finalizeIssue(c, i, config()))),
          })
        : t.issues.push({
            code: "invalid_union",
            input: t.value,
            inst: r,
            errors: [],
            inclusive: !1,
          }),
      t);
}
s(handleExclusiveUnionResults, "handleExclusiveUnionResults");
var Xa = $constructor("$ZodXor", (e, t) => {
    (fn.init(e, t), (t.inclusive = !1));
    let r = t.options.length === 1,
      i = t.options[0]._zod.run;
    e._zod.parse = (o, a) => {
      if (r) return i(o, a);
      let c = !1,
        l = [];
      for (let p of t.options) {
        let d = p._zod.run({ value: o.value, issues: [] }, a);
        d instanceof Promise ? (l.push(d), (c = !0)) : l.push(d);
      }
      return c ? Promise.all(l).then((p) => handleExclusiveUnionResults(p, o, e, a)) : handleExclusiveUnionResults(l, o, e, a);
    };
  }),
  Qa = $constructor("$ZodDiscriminatedUnion", (e, t) => {
    ((t.inclusive = !1), fn.init(e, t));
    let r = e._zod.parse;
    defineLazy(e._zod, "propValues", () => {
      let o = {};
      for (let a of t.options) {
        let c = a._zod.propValues;
        if (!c || Object.keys(c).length === 0)
          throw new Error(`Invalid discriminated union option at index "${t.options.indexOf(a)}"`);
        for (let [l, p] of Object.entries(c)) {
          o[l] || (o[l] = new Set());
          for (let d of p) o[l].add(d);
        }
      }
      return o;
    });
    let i = cached(() => {
      let o = t.options,
        a = new Map();
      for (let c of o) {
        let l = c._zod.propValues?.[t.discriminator];
        if (!l || l.size === 0)
          throw new Error(`Invalid discriminated union option at index "${t.options.indexOf(c)}"`);
        for (let p of l) {
          if (a.has(p)) throw new Error(`Duplicate discriminator value "${String(p)}"`);
          a.set(p, c);
        }
      }
      return a;
    });
    e._zod.parse = (o, a) => {
      let c = o.value;
      if (!isObject(c))
        return (o.issues.push({ code: "invalid_type", expected: "object", input: c, inst: e }), o);
      let l = i.value.get(c?.[t.discriminator]);
      return l
        ? l._zod.run(o, a)
        : t.unionFallback
          ? r(o, a)
          : (o.issues.push({
              code: "invalid_union",
              errors: [],
              note: "No matching discriminator",
              discriminator: t.discriminator,
              input: c,
              path: [t.discriminator],
              inst: e,
            }),
            o);
    };
  }),
  es = $constructor("$ZodIntersection", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) => {
        let o = r.value,
          a = t.left._zod.run({ value: o, issues: [] }, i),
          c = t.right._zod.run({ value: o, issues: [] }, i);
        return a instanceof Promise || c instanceof Promise
          ? Promise.all([a, c]).then(([p, d]) => handleIntersectionResults(r, p, d))
          : handleIntersectionResults(r, a, c);
      }));
  });
function mergeValues(e, t) {
  if (e === t) return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t) return { valid: !0, data: e };
  if (isPlainObject(e) && isPlainObject(t)) {
    let r = Object.keys(t),
      i = Object.keys(e).filter((a) => r.indexOf(a) !== -1),
      o = { ...e, ...t };
    for (let a of i) {
      let c = mergeValues(e[a], t[a]);
      if (!c.valid) return { valid: !1, mergeErrorPath: [a, ...c.mergeErrorPath] };
      o[a] = c.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return { valid: !1, mergeErrorPath: [] };
    let r = [];
    for (let i = 0; i < e.length; i++) {
      let o = e[i],
        a = t[i],
        c = mergeValues(o, a);
      if (!c.valid) return { valid: !1, mergeErrorPath: [i, ...c.mergeErrorPath] };
      r.push(c.data);
    }
    return { valid: !0, data: r };
  }
  return { valid: !1, mergeErrorPath: [] };
}
s(mergeValues, "mergeValues");
function handleIntersectionResults(e, t, r) {
  let i = new Map(),
    o;
  for (let l of t.issues)
    if (l.code === "unrecognized_keys") {
      o ?? (o = l);
      for (let p of l.keys) (i.has(p) || i.set(p, {}), (i.get(p).l = !0));
    } else e.issues.push(l);
  for (let l of r.issues)
    if (l.code === "unrecognized_keys")
      for (let p of l.keys) (i.has(p) || i.set(p, {}), (i.get(p).r = !0));
    else e.issues.push(l);
  let a = [...i].filter(([, l]) => l.l && l.r).map(([l]) => l);
  if ((a.length && o && e.issues.push({ ...o, keys: a }), aborted(e))) return e;
  let c = mergeValues(t.value, r.value);
  if (!c.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
  return ((e.value = c.data), e);
}
s(handleIntersectionResults, "handleIntersectionResults");
var xo = $constructor("$ZodTuple", (e, t) => {
  E.init(e, t);
  let r = t.items;
  e._zod.parse = (i, o) => {
    let a = i.value;
    if (!Array.isArray(a))
      return (i.issues.push({ input: a, inst: e, expected: "tuple", code: "invalid_type" }), i);
    i.value = [];
    let c = [],
      l = [...r].reverse().findIndex((g) => g._zod.optin !== "optional"),
      p = l === -1 ? 0 : r.length - l;
    if (!t.rest) {
      let g = a.length > r.length,
        y = a.length < p - 1;
      if (g || y)
        return (
          i.issues.push({
            ...(g
              ? { code: "too_big", maximum: r.length, inclusive: !0 }
              : { code: "too_small", minimum: r.length }),
            input: a,
            inst: e,
            origin: "array",
          }),
          i
        );
    }
    let d = -1;
    for (let g of r) {
      if ((d++, d >= a.length && d >= p)) continue;
      let y = g._zod.run({ value: a[d], issues: [] }, o);
      y instanceof Promise ? c.push(y.then((S) => handleTupleResult(S, i, d))) : handleTupleResult(y, i, d);
    }
    if (t.rest) {
      let g = a.slice(r.length);
      for (let y of g) {
        d++;
        let S = t.rest._zod.run({ value: y, issues: [] }, o);
        S instanceof Promise ? c.push(S.then((v) => handleTupleResult(v, i, d))) : handleTupleResult(S, i, d);
      }
    }
    return c.length ? Promise.all(c).then(() => i) : i;
  };
});
function handleTupleResult(e, t, r) {
  (e.issues.length && t.issues.push(...prefixIssues(r, e.issues)), (t.value[r] = e.value));
}
s(handleTupleResult, "handleTupleResult");
var ts = $constructor("$ZodRecord", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) => {
        let o = r.value;
        if (!isPlainObject(o))
          return (
            r.issues.push({ expected: "record", code: "invalid_type", input: o, inst: e }),
            r
          );
        let a = [],
          c = t.keyType._zod.values;
        if (c) {
          r.value = {};
          let l = new Set();
          for (let d of c)
            if (typeof d == "string" || typeof d == "number" || typeof d == "symbol") {
              l.add(typeof d == "number" ? d.toString() : d);
              let g = t.valueType._zod.run({ value: o[d], issues: [] }, i);
              g instanceof Promise
                ? a.push(
                    g.then((y) => {
                      (y.issues.length && r.issues.push(...prefixIssues(d, y.issues)),
                        (r.value[d] = y.value));
                    }),
                  )
                : (g.issues.length && r.issues.push(...prefixIssues(d, g.issues)), (r.value[d] = g.value));
            }
          let p;
          for (let d in o) l.has(d) || ((p = p ?? []), p.push(d));
          p &&
            p.length > 0 &&
            r.issues.push({ code: "unrecognized_keys", input: o, inst: e, keys: p });
        } else {
          r.value = {};
          for (let l of Reflect.ownKeys(o)) {
            if (l === "__proto__") continue;
            let p = t.keyType._zod.run({ value: l, issues: [] }, i);
            if (p instanceof Promise)
              throw new Error("Async schemas not supported in object keys currently");
            if (typeof l == "string" && po.test(l) && p.issues.length) {
              let y = t.keyType._zod.run({ value: Number(l), issues: [] }, i);
              if (y instanceof Promise)
                throw new Error("Async schemas not supported in object keys currently");
              y.issues.length === 0 && (p = y);
            }
            if (p.issues.length) {
              t.mode === "loose"
                ? (r.value[l] = o[l])
                : r.issues.push({
                    code: "invalid_key",
                    origin: "record",
                    issues: p.issues.map((y) => finalizeIssue(y, i, config())),
                    input: l,
                    path: [l],
                    inst: e,
                  });
              continue;
            }
            let g = t.valueType._zod.run({ value: o[l], issues: [] }, i);
            g instanceof Promise
              ? a.push(
                  g.then((y) => {
                    (y.issues.length && r.issues.push(...prefixIssues(l, y.issues)),
                      (r.value[p.value] = y.value));
                  }),
                )
              : (g.issues.length && r.issues.push(...prefixIssues(l, g.issues)),
                (r.value[p.value] = g.value));
          }
        }
        return a.length ? Promise.all(a).then(() => r) : r;
      }));
  }),
  ns = $constructor("$ZodMap", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) => {
        let o = r.value;
        if (!(o instanceof Map))
          return (r.issues.push({ expected: "map", code: "invalid_type", input: o, inst: e }), r);
        let a = [];
        r.value = new Map();
        for (let [c, l] of o) {
          let p = t.keyType._zod.run({ value: c, issues: [] }, i),
            d = t.valueType._zod.run({ value: l, issues: [] }, i);
          p instanceof Promise || d instanceof Promise
            ? a.push(
                Promise.all([p, d]).then(([g, y]) => {
                  handleMapResult(g, y, r, c, o, e, i);
                }),
              )
            : handleMapResult(p, d, r, c, o, e, i);
        }
        return a.length ? Promise.all(a).then(() => r) : r;
      }));
  });
function handleMapResult(e, t, r, i, o, a, c) {
  (e.issues.length &&
    (rn.has(typeof i)
      ? r.issues.push(...prefixIssues(i, e.issues))
      : r.issues.push({
          code: "invalid_key",
          origin: "map",
          input: o,
          inst: a,
          issues: e.issues.map((l) => finalizeIssue(l, c, config())),
        })),
    t.issues.length &&
      (rn.has(typeof i)
        ? r.issues.push(...prefixIssues(i, t.issues))
        : r.issues.push({
            origin: "map",
            code: "invalid_element",
            input: o,
            inst: a,
            key: i,
            issues: t.issues.map((l) => finalizeIssue(l, c, config())),
          })),
    r.value.set(e.value, t.value));
}
s(handleMapResult, "handleMapResult");
var os = $constructor("$ZodSet", (e, t) => {
  (E.init(e, t),
    (e._zod.parse = (r, i) => {
      let o = r.value;
      if (!(o instanceof Set))
        return (r.issues.push({ input: o, inst: e, expected: "set", code: "invalid_type" }), r);
      let a = [];
      r.value = new Set();
      for (let c of o) {
        let l = t.valueType._zod.run({ value: c, issues: [] }, i);
        l instanceof Promise ? a.push(l.then((p) => handleSetResult(p, r))) : handleSetResult(l, r);
      }
      return a.length ? Promise.all(a).then(() => r) : r;
    }));
});
function handleSetResult(e, t) {
  (e.issues.length && t.issues.push(...e.issues), t.value.add(e.value));
}
s(handleSetResult, "handleSetResult");
var rs = $constructor("$ZodEnum", (e, t) => {
    E.init(e, t);
    let r = getEnumValues(t.entries),
      i = new Set(r);
    ((e._zod.values = i),
      (e._zod.pattern = new RegExp(
        `^(${r
          .filter((o) => rn.has(typeof o))
          .map((o) => (typeof o == "string" ? escapeRegex(o) : o.toString()))
          .join("|")})$`,
      )),
      (e._zod.parse = (o, a) => {
        let c = o.value;
        return (
          i.has(c) || o.issues.push({ code: "invalid_value", values: r, input: c, inst: e }),
          o
        );
      }));
  }),
  is = $constructor("$ZodLiteral", (e, t) => {
    if ((E.init(e, t), t.values.length === 0))
      throw new Error("Cannot create literal schema with no valid values");
    let r = new Set(t.values);
    ((e._zod.values = r),
      (e._zod.pattern = new RegExp(
        `^(${t.values.map((i) => (typeof i == "string" ? escapeRegex(i) : i ? escapeRegex(i.toString()) : String(i))).join("|")})$`,
      )),
      (e._zod.parse = (i, o) => {
        let a = i.value;
        return (
          r.has(a) || i.issues.push({ code: "invalid_value", values: t.values, input: a, inst: e }),
          i
        );
      }));
  }),
  as = $constructor("$ZodFile", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) => {
        let o = r.value;
        return (
          o instanceof File ||
            r.issues.push({ expected: "file", code: "invalid_type", input: o, inst: e }),
          r
        );
      }));
  }),
  ss = $constructor("$ZodTransform", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) => {
        if (i.direction === "backward") throw new Me(e.constructor.name);
        let o = t.transform(r.value, r);
        if (i.async)
          return (o instanceof Promise ? o : Promise.resolve(o)).then((c) => ((r.value = c), r));
        if (o instanceof Promise) throw new ge();
        return ((r.value = o), r);
      }));
  });
function handleOptionalResult(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
s(handleOptionalResult, "handleOptionalResult");
var ko = $constructor("$ZodOptional", (e, t) => {
    (E.init(e, t),
      (e._zod.optin = "optional"),
      (e._zod.optout = "optional"),
      defineLazy(e._zod, "values", () =>
        t.innerType._zod.values ? new Set([...t.innerType._zod.values, void 0]) : void 0,
      ),
      defineLazy(e._zod, "pattern", () => {
        let r = t.innerType._zod.pattern;
        return r ? new RegExp(`^(${cleanRegex(r.source)})?$`) : void 0;
      }),
      (e._zod.parse = (r, i) => {
        if (t.innerType._zod.optin === "optional") {
          let o = t.innerType._zod.run(r, i);
          return o instanceof Promise ? o.then((a) => handleOptionalResult(a, r.value)) : handleOptionalResult(o, r.value);
        }
        return r.value === void 0 ? r : t.innerType._zod.run(r, i);
      }));
  }),
  cs = $constructor("$ZodExactOptional", (e, t) => {
    (ko.init(e, t),
      defineLazy(e._zod, "values", () => t.innerType._zod.values),
      defineLazy(e._zod, "pattern", () => t.innerType._zod.pattern),
      (e._zod.parse = (r, i) => t.innerType._zod.run(r, i)));
  }),
  ls = $constructor("$ZodNullable", (e, t) => {
    (E.init(e, t),
      defineLazy(e._zod, "optin", () => t.innerType._zod.optin),
      defineLazy(e._zod, "optout", () => t.innerType._zod.optout),
      defineLazy(e._zod, "pattern", () => {
        let r = t.innerType._zod.pattern;
        return r ? new RegExp(`^(${cleanRegex(r.source)}|null)$`) : void 0;
      }),
      defineLazy(e._zod, "values", () =>
        t.innerType._zod.values ? new Set([...t.innerType._zod.values, null]) : void 0,
      ),
      (e._zod.parse = (r, i) => (r.value === null ? r : t.innerType._zod.run(r, i))));
  }),
  ds = $constructor("$ZodDefault", (e, t) => {
    (E.init(e, t),
      (e._zod.optin = "optional"),
      defineLazy(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (r, i) => {
        if (i.direction === "backward") return t.innerType._zod.run(r, i);
        if (r.value === void 0) return ((r.value = t.defaultValue), r);
        let o = t.innerType._zod.run(r, i);
        return o instanceof Promise ? o.then((a) => handleDefaultResult(a, t)) : handleDefaultResult(o, t);
      }));
  });
function handleDefaultResult(e, t) {
  return (e.value === void 0 && (e.value = t.defaultValue), e);
}
s(handleDefaultResult, "handleDefaultResult");
var us = $constructor("$ZodPrefault", (e, t) => {
    (E.init(e, t),
      (e._zod.optin = "optional"),
      defineLazy(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (r, i) => (
        i.direction === "backward" || (r.value === void 0 && (r.value = t.defaultValue)),
        t.innerType._zod.run(r, i)
      )));
  }),
  ps = $constructor("$ZodNonOptional", (e, t) => {
    (E.init(e, t),
      defineLazy(e._zod, "values", () => {
        let r = t.innerType._zod.values;
        return r ? new Set([...r].filter((i) => i !== void 0)) : void 0;
      }),
      (e._zod.parse = (r, i) => {
        let o = t.innerType._zod.run(r, i);
        return o instanceof Promise ? o.then((a) => handleNonOptionalResult(a, e)) : handleNonOptionalResult(o, e);
      }));
  });
function handleNonOptionalResult(e, t) {
  return (
    !e.issues.length &&
      e.value === void 0 &&
      e.issues.push({ code: "invalid_type", expected: "nonoptional", input: e.value, inst: t }),
    e
  );
}
s(handleNonOptionalResult, "handleNonOptionalResult");
var ms = $constructor("$ZodSuccess", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) => {
        if (i.direction === "backward") throw new Me("ZodSuccess");
        let o = t.innerType._zod.run(r, i);
        return o instanceof Promise
          ? o.then((a) => ((r.value = a.issues.length === 0), r))
          : ((r.value = o.issues.length === 0), r);
      }));
  }),
  gs = $constructor("$ZodCatch", (e, t) => {
    (E.init(e, t),
      defineLazy(e._zod, "optin", () => t.innerType._zod.optin),
      defineLazy(e._zod, "optout", () => t.innerType._zod.optout),
      defineLazy(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (r, i) => {
        if (i.direction === "backward") return t.innerType._zod.run(r, i);
        let o = t.innerType._zod.run(r, i);
        return o instanceof Promise
          ? o.then(
              (a) => (
                (r.value = a.value),
                a.issues.length &&
                  ((r.value = t.catchValue({
                    ...r,
                    error: { issues: a.issues.map((c) => finalizeIssue(c, i, config())) },
                    input: r.value,
                  })),
                  (r.issues = [])),
                r
              ),
            )
          : ((r.value = o.value),
            o.issues.length &&
              ((r.value = t.catchValue({
                ...r,
                error: { issues: o.issues.map((a) => finalizeIssue(a, i, config())) },
                input: r.value,
              })),
              (r.issues = [])),
            r);
      }));
  }),
  fs = $constructor("$ZodNaN", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) => (
        (typeof r.value != "number" || !Number.isNaN(r.value)) &&
          r.issues.push({ input: r.value, inst: e, expected: "nan", code: "invalid_type" }),
        r
      )));
  }),
  hs = $constructor("$ZodPipe", (e, t) => {
    (E.init(e, t),
      defineLazy(e._zod, "values", () => t.in._zod.values),
      defineLazy(e._zod, "optin", () => t.in._zod.optin),
      defineLazy(e._zod, "optout", () => t.out._zod.optout),
      defineLazy(e._zod, "propValues", () => t.in._zod.propValues),
      (e._zod.parse = (r, i) => {
        if (i.direction === "backward") {
          let a = t.out._zod.run(r, i);
          return a instanceof Promise ? a.then((c) => handlePipeResult(c, t.in, i)) : handlePipeResult(a, t.in, i);
        }
        let o = t.in._zod.run(r, i);
        return o instanceof Promise ? o.then((a) => handlePipeResult(a, t.out, i)) : handlePipeResult(o, t.out, i);
      }));
  });
function handlePipeResult(e, t, r) {
  return e.issues.length
    ? ((e.aborted = !0), e)
    : t._zod.run({ value: e.value, issues: e.issues }, r);
}
s(handlePipeResult, "handlePipeResult");
var hn = $constructor("$ZodCodec", (e, t) => {
  (E.init(e, t),
    defineLazy(e._zod, "values", () => t.in._zod.values),
    defineLazy(e._zod, "optin", () => t.in._zod.optin),
    defineLazy(e._zod, "optout", () => t.out._zod.optout),
    defineLazy(e._zod, "propValues", () => t.in._zod.propValues),
    (e._zod.parse = (r, i) => {
      if ((i.direction || "forward") === "forward") {
        let a = t.in._zod.run(r, i);
        return a instanceof Promise ? a.then((c) => handleCodecAResult(c, t, i)) : handleCodecAResult(a, t, i);
      } else {
        let a = t.out._zod.run(r, i);
        return a instanceof Promise ? a.then((c) => handleCodecAResult(c, t, i)) : handleCodecAResult(a, t, i);
      }
    }));
});
function handleCodecAResult(e, t, r) {
  if (e.issues.length) return ((e.aborted = !0), e);
  if ((r.direction || "forward") === "forward") {
    let o = t.transform(e.value, e);
    return o instanceof Promise ? o.then((a) => handleCodecTxResult(e, a, t.out, r)) : handleCodecTxResult(e, o, t.out, r);
  } else {
    let o = t.reverseTransform(e.value, e);
    return o instanceof Promise ? o.then((a) => handleCodecTxResult(e, a, t.in, r)) : handleCodecTxResult(e, o, t.in, r);
  }
}
s(handleCodecAResult, "handleCodecAResult");
function handleCodecTxResult(e, t, r, i) {
  return e.issues.length ? ((e.aborted = !0), e) : r._zod.run({ value: t, issues: e.issues }, i);
}
s(handleCodecTxResult, "handleCodecTxResult");
var ys = $constructor("$ZodReadonly", (e, t) => {
  (E.init(e, t),
    defineLazy(e._zod, "propValues", () => t.innerType._zod.propValues),
    defineLazy(e._zod, "values", () => t.innerType._zod.values),
    defineLazy(e._zod, "optin", () => t.innerType?._zod?.optin),
    defineLazy(e._zod, "optout", () => t.innerType?._zod?.optout),
    (e._zod.parse = (r, i) => {
      if (i.direction === "backward") return t.innerType._zod.run(r, i);
      let o = t.innerType._zod.run(r, i);
      return o instanceof Promise ? o.then(handleReadonlyResult) : handleReadonlyResult(o);
    }));
});
function handleReadonlyResult(e) {
  return ((e.value = Object.freeze(e.value)), e);
}
s(handleReadonlyResult, "handleReadonlyResult");
var bs = $constructor("$ZodTemplateLiteral", (e, t) => {
    E.init(e, t);
    let r = [];
    for (let i of t.parts)
      if (typeof i == "object" && i !== null) {
        if (!i._zod.pattern)
          throw new Error(
            `Invalid template literal part, no pattern found: ${[...i._zod.traits].shift()}`,
          );
        let o = i._zod.pattern instanceof RegExp ? i._zod.pattern.source : i._zod.pattern;
        if (!o) throw new Error(`Invalid template literal part: ${i._zod.traits}`);
        let a = o.startsWith("^") ? 1 : 0,
          c = o.endsWith("$") ? o.length - 1 : o.length;
        r.push(o.slice(a, c));
      } else if (i === null || pi.has(typeof i)) r.push(escapeRegex(`${i}`));
      else throw new Error(`Invalid template literal part: ${i}`);
    ((e._zod.pattern = new RegExp(`^${r.join("")}$`)),
      (e._zod.parse = (i, o) =>
        typeof i.value != "string"
          ? (i.issues.push({ input: i.value, inst: e, expected: "string", code: "invalid_type" }),
            i)
          : ((e._zod.pattern.lastIndex = 0),
            e._zod.pattern.test(i.value) ||
              i.issues.push({
                input: i.value,
                inst: e,
                code: "invalid_format",
                format: t.format ?? "template_literal",
                pattern: e._zod.pattern.source,
              }),
            i)));
  }),
  vs = $constructor(
    "$ZodFunction",
    (e, t) => (
      E.init(e, t),
      (e._def = t),
      (e._zod.def = t),
      (e.implement = (r) => {
        if (typeof r != "function") throw new Error("implement() must be called with a function");
        return function (...i) {
          let o = e._def.input ? eo(e._def.input, i) : i,
            a = Reflect.apply(r, this, o);
          return e._def.output ? eo(e._def.output, a) : a;
        };
      }),
      (e.implementAsync = (r) => {
        if (typeof r != "function")
          throw new Error("implementAsync() must be called with a function");
        return async function (...i) {
          let o = e._def.input ? await to(e._def.input, i) : i,
            a = await Reflect.apply(r, this, o);
          return e._def.output ? await to(e._def.output, a) : a;
        };
      }),
      (e._zod.parse = (r, i) =>
        typeof r.value != "function"
          ? (r.issues.push({ code: "invalid_type", expected: "function", input: r.value, inst: e }),
            r)
          : (e._def.output && e._def.output._zod.def.type === "promise"
              ? (r.value = e.implementAsync(r.value))
              : (r.value = e.implement(r.value)),
            r)),
      (e.input = (...r) => {
        let i = e.constructor;
        return Array.isArray(r[0])
          ? new i({
              type: "function",
              input: new xo({ type: "tuple", items: r[0], rest: r[1] }),
              output: e._def.output,
            })
          : new i({ type: "function", input: r[0], output: e._def.output });
      }),
      (e.output = (r) => {
        let i = e.constructor;
        return new i({ type: "function", input: e._def.input, output: r });
      }),
      e
    ),
  ),
  Ss = $constructor("$ZodPromise", (e, t) => {
    (E.init(e, t),
      (e._zod.parse = (r, i) =>
        Promise.resolve(r.value).then((o) => t.innerType._zod.run({ value: o, issues: [] }, i))));
  }),
  _s = $constructor("$ZodLazy", (e, t) => {
    (E.init(e, t),
      defineLazy(e._zod, "innerType", () => t.getter()),
      defineLazy(e._zod, "pattern", () => e._zod.innerType?._zod?.pattern),
      defineLazy(e._zod, "propValues", () => e._zod.innerType?._zod?.propValues),
      defineLazy(e._zod, "optin", () => e._zod.innerType?._zod?.optin ?? void 0),
      defineLazy(e._zod, "optout", () => e._zod.innerType?._zod?.optout ?? void 0),
      (e._zod.parse = (r, i) => e._zod.innerType._zod.run(r, i)));
  }),
  xs = $constructor("$ZodCustom", (e, t) => {
    (Z.init(e, t),
      E.init(e, t),
      (e._zod.parse = (r, i) => r),
      (e._zod.check = (r) => {
        let i = r.value,
          o = t.fn(i);
        if (o instanceof Promise) return o.then((a) => handleRefineResult(a, r, i, e));
        handleRefineResult(o, r, i, e);
      }));
  });
function handleRefineResult(e, t, r, i) {
  if (!e) {
    let o = {
      code: "custom",
      input: r,
      inst: i,
      path: [...(i._zod.def.path ?? [])],
      continue: !i._zod.def.abort,
    };
    (i._zod.def.params && (o.params = i._zod.def.params), t.issues.push(issue(o)));
  }
}
s(handleRefineResult, "handleRefineResult");
var _n = {};
Re(_n, {
  ar: () => ks,
  az: () => Is,
  be: () => Cs,
  bg: () => Rs,
  ca: () => Ps,
  cs: () => Ts,
  da: () => ws,
  de: () => Es,
  en: () => yn,
  eo: () => Os,
  es: () => As,
  fa: () => zs,
  fi: () => Ms,
  fr: () => $s,
  frCA: () => Ds,
  he: () => Us,
  hu: () => Ns,
  hy: () => Zs,
  id: () => js,
  is: () => Bs,
  it: () => Ls,
  ja: () => Ws,
  ka: () => Fs,
  kh: () => qs,
  km: () => bn,
  ko: () => Vs,
  lt: () => Gs,
  mk: () => Ks,
  ms: () => Hs,
  nl: () => Js,
  no: () => Ys,
  ota: () => Xs,
  pl: () => ec,
  ps: () => Qs,
  pt: () => tc,
  ru: () => nc,
  sl: () => oc,
  sv: () => rc,
  ta: () => ic,
  th: () => ac,
  tr: () => sc,
  ua: () => cc,
  uk: () => Sn,
  ur: () => lc,
  uz: () => dc,
  vi: () => uc,
  yo: () => gc,
  zhCN: () => pc,
  zhTW: () => mc,
});
var gb = s(() => {
  let e = {
    string: { unit: "\u062D\u0631\u0641", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    file: { unit: "\u0628\u0627\u064A\u062A", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    array: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    set: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0645\u062F\u062E\u0644",
      email: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
      url: "\u0631\u0627\u0628\u0637",
      emoji: "\u0625\u064A\u0645\u0648\u062C\u064A",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime:
        "\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      date: "\u062A\u0627\u0631\u064A\u062E \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      time: "\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      duration: "\u0645\u062F\u0629 \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      ipv4: "\u0639\u0646\u0648\u0627\u0646 IPv4",
      ipv6: "\u0639\u0646\u0648\u0627\u0646 IPv6",
      cidrv4:
        "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv4",
      cidrv6:
        "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv6",
      base64: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64-encoded",
      base64url: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64url-encoded",
      json_string: "\u0646\u064E\u0635 \u0639\u0644\u0649 \u0647\u064A\u0626\u0629 JSON",
      e164: "\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0628\u0645\u0639\u064A\u0627\u0631 E.164",
      jwt: "JWT",
      template_literal: "\u0645\u062F\u062E\u0644",
    },
    i = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 instanceof ${o.expected}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${l}`
          : `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${a}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${stringifyPrimitive(o.values[0])}`
          : `\u0627\u062E\u062A\u064A\u0627\u0631 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062A\u0648\u0642\u0639 \u0627\u0646\u062A\u0642\u0627\u0621 \u0623\u062D\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A: ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? ` \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${o.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${a} ${o.maximum.toString()} ${c.unit ?? "\u0639\u0646\u0635\u0631"}`
          : `\u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${o.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${a} ${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${o.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${a} ${o.minimum.toString()} ${c.unit}`
          : `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${o.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${a} ${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0628\u062F\u0623 \u0628\u0640 "${o.prefix}"`
          : a.format === "ends_with"
            ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0646\u062A\u0647\u064A \u0628\u0640 "${a.suffix}"`
            : a.format === "includes"
              ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0636\u0645\u0651\u064E\u0646 "${a.includes}"`
              : a.format === "regex"
                ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0637\u0627\u0628\u0642 \u0627\u0644\u0646\u0645\u0637 ${a.pattern}`
                : `${r[a.format] ?? o.format} \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644`;
      }
      case "not_multiple_of":
        return `\u0631\u0642\u0645 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0646 \u0645\u0636\u0627\u0639\u0641\u0627\u062A ${o.divisor}`;
      case "unrecognized_keys":
        return `\u0645\u0639\u0631\u0641${o.keys.length > 1 ? "\u0627\u062A" : ""} \u063A\u0631\u064A\u0628${o.keys.length > 1 ? "\u0629" : ""}: ${joinValues(o.keys, "\u060C ")}`;
      case "invalid_key":
        return `\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${o.origin}`;
      case "invalid_union":
        return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
      case "invalid_element":
        return `\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${o.origin}`;
      default:
        return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
    }
  };
}, "error");
function ks() {
  return { localeError: gb() };
}
s(ks, "default");
var fb = s(() => {
  let e = {
    string: { unit: "simvol", verb: "olmal\u0131d\u0131r" },
    file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
    array: { unit: "element", verb: "olmal\u0131d\u0131r" },
    set: { unit: "element", verb: "olmal\u0131d\u0131r" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "email address",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datetime",
      date: "ISO date",
      time: "ISO time",
      duration: "ISO duration",
      ipv4: "IPv4 address",
      ipv6: "IPv6 address",
      cidrv4: "IPv4 range",
      cidrv6: "IPv6 range",
      base64: "base64-encoded string",
      base64url: "base64url-encoded string",
      json_string: "JSON string",
      e164: "E.164 number",
      jwt: "JWT",
      template_literal: "input",
    },
    i = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n instanceof ${o.expected}, daxil olan ${l}`
          : `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${a}, daxil olan ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${stringifyPrimitive(o.values[0])}`
          : `Yanl\u0131\u015F se\xE7im: a\u015Fa\u011F\u0131dak\u0131lardan biri olmal\u0131d\u0131r: ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${o.origin ?? "d\u0259y\u0259r"} ${a}${o.maximum.toString()} ${c.unit ?? "element"}`
          : `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${o.origin ?? "d\u0259y\u0259r"} ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${o.origin} ${a}${o.minimum.toString()} ${c.unit}`
          : `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${o.origin} ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Yanl\u0131\u015F m\u0259tn: "${a.prefix}" il\u0259 ba\u015Flamal\u0131d\u0131r`
          : a.format === "ends_with"
            ? `Yanl\u0131\u015F m\u0259tn: "${a.suffix}" il\u0259 bitm\u0259lidir`
            : a.format === "includes"
              ? `Yanl\u0131\u015F m\u0259tn: "${a.includes}" daxil olmal\u0131d\u0131r`
              : a.format === "regex"
                ? `Yanl\u0131\u015F m\u0259tn: ${a.pattern} \u015Fablonuna uy\u011Fun olmal\u0131d\u0131r`
                : `Yanl\u0131\u015F ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Yanl\u0131\u015F \u0259d\u0259d: ${o.divisor} il\u0259 b\xF6l\xFCn\u0259 bil\u0259n olmal\u0131d\u0131r`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan a\xE7ar${o.keys.length > 1 ? "lar" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `${o.origin} daxilind\u0259 yanl\u0131\u015F a\xE7ar`;
      case "invalid_union":
        return "Yanl\u0131\u015F d\u0259y\u0259r";
      case "invalid_element":
        return `${o.origin} daxilind\u0259 yanl\u0131\u015F d\u0259y\u0259r`;
      default:
        return "Yanl\u0131\u015F d\u0259y\u0259r";
    }
  };
}, "error");
function Is() {
  return { localeError: fb() };
}
s(Is, "default");
function getBelarusianPlural(e, t, r, i) {
  let o = Math.abs(e),
    a = o % 10,
    c = o % 100;
  return c >= 11 && c <= 19 ? i : a === 1 ? t : a >= 2 && a <= 4 ? r : i;
}
s(getBelarusianPlural, "getBelarusianPlural");
var hb = s(() => {
  let e = {
    string: {
      unit: {
        one: "\u0441\u0456\u043C\u0432\u0430\u043B",
        few: "\u0441\u0456\u043C\u0432\u0430\u043B\u044B",
        many: "\u0441\u0456\u043C\u0432\u0430\u043B\u0430\u045E",
      },
      verb: "\u043C\u0435\u0446\u044C",
    },
    array: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E",
      },
      verb: "\u043C\u0435\u0446\u044C",
    },
    set: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E",
      },
      verb: "\u043C\u0435\u0446\u044C",
    },
    file: {
      unit: {
        one: "\u0431\u0430\u0439\u0442",
        few: "\u0431\u0430\u0439\u0442\u044B",
        many: "\u0431\u0430\u0439\u0442\u0430\u045E",
      },
      verb: "\u043C\u0435\u0446\u044C",
    },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0443\u0432\u043E\u0434",
      email: "email \u0430\u0434\u0440\u0430\u0441",
      url: "URL",
      emoji: "\u044D\u043C\u043E\u0434\u0437\u0456",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0434\u0430\u0442\u0430 \u0456 \u0447\u0430\u0441",
      date: "ISO \u0434\u0430\u0442\u0430",
      time: "ISO \u0447\u0430\u0441",
      duration: "ISO \u043F\u0440\u0430\u0446\u044F\u0433\u043B\u0430\u0441\u0446\u044C",
      ipv4: "IPv4 \u0430\u0434\u0440\u0430\u0441",
      ipv6: "IPv6 \u0430\u0434\u0440\u0430\u0441",
      cidrv4: "IPv4 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
      cidrv6: "IPv6 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
      base64:
        "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64",
      base64url:
        "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64url",
      json_string: "JSON \u0440\u0430\u0434\u043E\u043A",
      e164: "\u043D\u0443\u043C\u0430\u0440 E.164",
      jwt: "JWT",
      template_literal: "\u0443\u0432\u043E\u0434",
    },
    i = { nan: "NaN", number: "\u043B\u0456\u043A", array: "\u043C\u0430\u0441\u0456\u045E" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F instanceof ${o.expected}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${l}`
          : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F ${a}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F ${stringifyPrimitive(o.values[0])}`
          : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0432\u0430\u0440\u044B\u044F\u043D\u0442: \u0447\u0430\u043A\u0430\u045E\u0441\u044F \u0430\u0434\u0437\u0456\u043D \u0437 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.maximum),
            p = getBelarusianPlural(l, c.unit.one, c.unit.few, c.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${c.verb} ${a}${o.maximum.toString()} ${p}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.minimum),
            p = getBelarusianPlural(l, c.unit.one, c.unit.few, c.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${o.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${c.verb} ${a}${o.minimum.toString()} ${p}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${o.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u043F\u0430\u0447\u044B\u043D\u0430\u0446\u0446\u0430 \u0437 "${a.prefix}"`
          : a.format === "ends_with"
            ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u0430\u043A\u0430\u043D\u0447\u0432\u0430\u0446\u0446\u0430 \u043D\u0430 "${a.suffix}"`
            : a.format === "includes"
              ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u043C\u044F\u0448\u0447\u0430\u0446\u044C "${a.includes}"`
              : a.format === "regex"
                ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0430\u0434\u043F\u0430\u0432\u044F\u0434\u0430\u0446\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${a.pattern}`
                : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043B\u0456\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0431\u044B\u0446\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${o.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0441\u043F\u0430\u0437\u043D\u0430\u043D\u044B ${o.keys.length > 1 ? "\u043A\u043B\u044E\u0447\u044B" : "\u043A\u043B\u044E\u0447"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043A\u043B\u044E\u0447 \u0443 ${o.origin}`;
      case "invalid_union":
        return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434";
      case "invalid_element":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u0430\u0435 \u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435 \u045E ${o.origin}`;
      default:
        return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434";
    }
  };
}, "error");
function Cs() {
  return { localeError: hb() };
}
s(Cs, "default");
var yb = s(() => {
  let e = {
    string: {
      unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430",
      verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430",
    },
    file: {
      unit: "\u0431\u0430\u0439\u0442\u0430",
      verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430",
    },
    array: {
      unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
      verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430",
    },
    set: {
      unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
      verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430",
    },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0432\u0445\u043E\u0434",
      email: "\u0438\u043C\u0435\u0439\u043B \u0430\u0434\u0440\u0435\u0441",
      url: "URL",
      emoji: "\u0435\u043C\u043E\u0434\u0436\u0438",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0432\u0440\u0435\u043C\u0435",
      date: "ISO \u0434\u0430\u0442\u0430",
      time: "ISO \u0432\u0440\u0435\u043C\u0435",
      duration:
        "ISO \u043F\u0440\u043E\u0434\u044A\u043B\u0436\u0438\u0442\u0435\u043B\u043D\u043E\u0441\u0442",
      ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
      ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
      cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      base64: "base64-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
      base64url: "base64url-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
      json_string: "JSON \u043D\u0438\u0437",
      e164: "E.164 \u043D\u043E\u043C\u0435\u0440",
      jwt: "JWT",
      template_literal: "\u0432\u0445\u043E\u0434",
    },
    i = {
      nan: "NaN",
      number: "\u0447\u0438\u0441\u043B\u043E",
      array: "\u043C\u0430\u0441\u0438\u0432",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D instanceof ${o.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${l}`
          : `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${a}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${stringifyPrimitive(o.values[0])}`
          : `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u043E\u043F\u0446\u0438\u044F: \u043E\u0447\u0430\u043A\u0432\u0430\u043D\u043E \u0435\u0434\u043D\u043E \u043E\u0442 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${o.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${a}${o.maximum.toString()} ${c.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430"}`
          : `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${o.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0431\u044A\u0434\u0435 ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${o.origin} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${a}${o.minimum.toString()} ${c.unit}`
          : `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${o.origin} \u0434\u0430 \u0431\u044A\u0434\u0435 ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        if (a.format === "starts_with")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u0432\u0430 \u0441 "${a.prefix}"`;
        if (a.format === "ends_with")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u0432\u044A\u0440\u0448\u0432\u0430 \u0441 "${a.suffix}"`;
        if (a.format === "includes")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0432\u043A\u043B\u044E\u0447\u0432\u0430 "${a.includes}"`;
        if (a.format === "regex")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0441\u044A\u0432\u043F\u0430\u0434\u0430 \u0441 ${a.pattern}`;
        let c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D";
        return (
          a.format === "emoji" && (c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          a.format === "datetime" && (c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          a.format === "date" && (c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430"),
          a.format === "time" && (c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          a.format === "duration" && (c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430"),
          `${c} ${r[a.format] ?? o.format}`
        );
      }
      case "not_multiple_of":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E \u0447\u0438\u0441\u043B\u043E: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0431\u044A\u0434\u0435 \u043A\u0440\u0430\u0442\u043D\u043E \u043D\u0430 ${o.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0437\u043F\u043E\u0437\u043D\u0430\u0442${o.keys.length > 1 ? "\u0438" : ""} \u043A\u043B\u044E\u0447${o.keys.length > 1 ? "\u043E\u0432\u0435" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043A\u043B\u044E\u0447 \u0432 ${o.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434";
      case "invalid_element":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442 \u0432 ${o.origin}`;
      default:
        return "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434";
    }
  };
}, "error");
function Rs() {
  return { localeError: yb() };
}
s(Rs, "default");
var bb = s(() => {
  let e = {
    string: { unit: "car\xE0cters", verb: "contenir" },
    file: { unit: "bytes", verb: "contenir" },
    array: { unit: "elements", verb: "contenir" },
    set: { unit: "elements", verb: "contenir" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "entrada",
      email: "adre\xE7a electr\xF2nica",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data i hora ISO",
      date: "data ISO",
      time: "hora ISO",
      duration: "durada ISO",
      ipv4: "adre\xE7a IPv4",
      ipv6: "adre\xE7a IPv6",
      cidrv4: "rang IPv4",
      cidrv6: "rang IPv6",
      base64: "cadena codificada en base64",
      base64url: "cadena codificada en base64url",
      json_string: "cadena JSON",
      e164: "n\xFAmero E.164",
      jwt: "JWT",
      template_literal: "entrada",
    },
    i = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Tipus inv\xE0lid: s'esperava instanceof ${o.expected}, s'ha rebut ${l}`
          : `Tipus inv\xE0lid: s'esperava ${a}, s'ha rebut ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Valor inv\xE0lid: s'esperava ${stringifyPrimitive(o.values[0])}`
          : `Opci\xF3 inv\xE0lida: s'esperava una de ${joinValues(o.values, " o ")}`;
      case "too_big": {
        let a = o.inclusive ? "com a m\xE0xim" : "menys de",
          c = getSizing(o.origin);
        return c
          ? `Massa gran: s'esperava que ${o.origin ?? "el valor"} contingu\xE9s ${a} ${o.maximum.toString()} ${c.unit ?? "elements"}`
          : `Massa gran: s'esperava que ${o.origin ?? "el valor"} fos ${a} ${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? "com a m\xEDnim" : "m\xE9s de",
          c = getSizing(o.origin);
        return c
          ? `Massa petit: s'esperava que ${o.origin} contingu\xE9s ${a} ${o.minimum.toString()} ${c.unit}`
          : `Massa petit: s'esperava que ${o.origin} fos ${a} ${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Format inv\xE0lid: ha de comen\xE7ar amb "${a.prefix}"`
          : a.format === "ends_with"
            ? `Format inv\xE0lid: ha d'acabar amb "${a.suffix}"`
            : a.format === "includes"
              ? `Format inv\xE0lid: ha d'incloure "${a.includes}"`
              : a.format === "regex"
                ? `Format inv\xE0lid: ha de coincidir amb el patr\xF3 ${a.pattern}`
                : `Format inv\xE0lid per a ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE0lid: ha de ser m\xFAltiple de ${o.divisor}`;
      case "unrecognized_keys":
        return `Clau${o.keys.length > 1 ? "s" : ""} no reconeguda${o.keys.length > 1 ? "s" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Clau inv\xE0lida a ${o.origin}`;
      case "invalid_union":
        return "Entrada inv\xE0lida";
      case "invalid_element":
        return `Element inv\xE0lid a ${o.origin}`;
      default:
        return "Entrada inv\xE0lida";
    }
  };
}, "error");
function Ps() {
  return { localeError: bb() };
}
s(Ps, "default");
var vb = s(() => {
  let e = {
    string: { unit: "znak\u016F", verb: "m\xEDt" },
    file: { unit: "bajt\u016F", verb: "m\xEDt" },
    array: { unit: "prvk\u016F", verb: "m\xEDt" },
    set: { unit: "prvk\u016F", verb: "m\xEDt" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "regul\xE1rn\xED v\xFDraz",
      email: "e-mailov\xE1 adresa",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "datum a \u010Das ve form\xE1tu ISO",
      date: "datum ve form\xE1tu ISO",
      time: "\u010Das ve form\xE1tu ISO",
      duration: "doba trv\xE1n\xED ISO",
      ipv4: "IPv4 adresa",
      ipv6: "IPv6 adresa",
      cidrv4: "rozsah IPv4",
      cidrv6: "rozsah IPv6",
      base64: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64",
      base64url: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64url",
      json_string: "\u0159et\u011Bzec ve form\xE1tu JSON",
      e164: "\u010D\xEDslo E.164",
      jwt: "JWT",
      template_literal: "vstup",
    },
    i = {
      nan: "NaN",
      number: "\u010D\xEDslo",
      string: "\u0159et\u011Bzec",
      function: "funkce",
      array: "pole",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no instanceof ${o.expected}, obdr\u017Eeno ${l}`
          : `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${a}, obdr\u017Eeno ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${stringifyPrimitive(o.values[0])}`
          : `Neplatn\xE1 mo\u017Enost: o\u010Dek\xE1v\xE1na jedna z hodnot ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${o.origin ?? "hodnota"} mus\xED m\xEDt ${a}${o.maximum.toString()} ${c.unit ?? "prvk\u016F"}`
          : `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${o.origin ?? "hodnota"} mus\xED b\xFDt ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${o.origin ?? "hodnota"} mus\xED m\xEDt ${a}${o.minimum.toString()} ${c.unit ?? "prvk\u016F"}`
          : `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${o.origin ?? "hodnota"} mus\xED b\xFDt ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED za\u010D\xEDnat na "${a.prefix}"`
          : a.format === "ends_with"
            ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED kon\u010Dit na "${a.suffix}"`
            : a.format === "includes"
              ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED obsahovat "${a.includes}"`
              : a.format === "regex"
                ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED odpov\xEDdat vzoru ${a.pattern}`
                : `Neplatn\xFD form\xE1t ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Neplatn\xE9 \u010D\xEDslo: mus\xED b\xFDt n\xE1sobkem ${o.divisor}`;
      case "unrecognized_keys":
        return `Nezn\xE1m\xE9 kl\xED\u010De: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Neplatn\xFD kl\xED\u010D v ${o.origin}`;
      case "invalid_union":
        return "Neplatn\xFD vstup";
      case "invalid_element":
        return `Neplatn\xE1 hodnota v ${o.origin}`;
      default:
        return "Neplatn\xFD vstup";
    }
  };
}, "error");
function Ts() {
  return { localeError: vb() };
}
s(Ts, "default");
var Sb = s(() => {
  let e = {
    string: { unit: "tegn", verb: "havde" },
    file: { unit: "bytes", verb: "havde" },
    array: { unit: "elementer", verb: "indeholdt" },
    set: { unit: "elementer", verb: "indeholdt" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "e-mailadresse",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO dato- og klokkesl\xE6t",
      date: "ISO-dato",
      time: "ISO-klokkesl\xE6t",
      duration: "ISO-varighed",
      ipv4: "IPv4-omr\xE5de",
      ipv6: "IPv6-omr\xE5de",
      cidrv4: "IPv4-spektrum",
      cidrv6: "IPv6-spektrum",
      base64: "base64-kodet streng",
      base64url: "base64url-kodet streng",
      json_string: "JSON-streng",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "input",
    },
    i = {
      nan: "NaN",
      string: "streng",
      number: "tal",
      boolean: "boolean",
      array: "liste",
      object: "objekt",
      set: "s\xE6t",
      file: "fil",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ugyldigt input: forventede instanceof ${o.expected}, fik ${l}`
          : `Ugyldigt input: forventede ${a}, fik ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ugyldig v\xE6rdi: forventede ${stringifyPrimitive(o.values[0])}`
          : `Ugyldigt valg: forventede en af f\xF8lgende ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin),
          l = i[o.origin] ?? o.origin;
        return c
          ? `For stor: forventede ${l ?? "value"} ${c.verb} ${a} ${o.maximum.toString()} ${c.unit ?? "elementer"}`
          : `For stor: forventede ${l ?? "value"} havde ${a} ${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin),
          l = i[o.origin] ?? o.origin;
        return c
          ? `For lille: forventede ${l} ${c.verb} ${a} ${o.minimum.toString()} ${c.unit}`
          : `For lille: forventede ${l} havde ${a} ${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Ugyldig streng: skal starte med "${a.prefix}"`
          : a.format === "ends_with"
            ? `Ugyldig streng: skal ende med "${a.suffix}"`
            : a.format === "includes"
              ? `Ugyldig streng: skal indeholde "${a.includes}"`
              : a.format === "regex"
                ? `Ugyldig streng: skal matche m\xF8nsteret ${a.pattern}`
                : `Ugyldig ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Ugyldigt tal: skal v\xE6re deleligt med ${o.divisor}`;
      case "unrecognized_keys":
        return `${o.keys.length > 1 ? "Ukendte n\xF8gler" : "Ukendt n\xF8gle"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Ugyldig n\xF8gle i ${o.origin}`;
      case "invalid_union":
        return "Ugyldigt input: matcher ingen af de tilladte typer";
      case "invalid_element":
        return `Ugyldig v\xE6rdi i ${o.origin}`;
      default:
        return "Ugyldigt input";
    }
  };
}, "error");
function ws() {
  return { localeError: Sb() };
}
s(ws, "default");
var _b = s(() => {
  let e = {
    string: { unit: "Zeichen", verb: "zu haben" },
    file: { unit: "Bytes", verb: "zu haben" },
    array: { unit: "Elemente", verb: "zu haben" },
    set: { unit: "Elemente", verb: "zu haben" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "Eingabe",
      email: "E-Mail-Adresse",
      url: "URL",
      emoji: "Emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-Datum und -Uhrzeit",
      date: "ISO-Datum",
      time: "ISO-Uhrzeit",
      duration: "ISO-Dauer",
      ipv4: "IPv4-Adresse",
      ipv6: "IPv6-Adresse",
      cidrv4: "IPv4-Bereich",
      cidrv6: "IPv6-Bereich",
      base64: "Base64-codierter String",
      base64url: "Base64-URL-codierter String",
      json_string: "JSON-String",
      e164: "E.164-Nummer",
      jwt: "JWT",
      template_literal: "Eingabe",
    },
    i = { nan: "NaN", number: "Zahl", array: "Array" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ung\xFCltige Eingabe: erwartet instanceof ${o.expected}, erhalten ${l}`
          : `Ung\xFCltige Eingabe: erwartet ${a}, erhalten ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ung\xFCltige Eingabe: erwartet ${stringifyPrimitive(o.values[0])}`
          : `Ung\xFCltige Option: erwartet eine von ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Zu gro\xDF: erwartet, dass ${o.origin ?? "Wert"} ${a}${o.maximum.toString()} ${c.unit ?? "Elemente"} hat`
          : `Zu gro\xDF: erwartet, dass ${o.origin ?? "Wert"} ${a}${o.maximum.toString()} ist`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Zu klein: erwartet, dass ${o.origin} ${a}${o.minimum.toString()} ${c.unit} hat`
          : `Zu klein: erwartet, dass ${o.origin} ${a}${o.minimum.toString()} ist`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Ung\xFCltiger String: muss mit "${a.prefix}" beginnen`
          : a.format === "ends_with"
            ? `Ung\xFCltiger String: muss mit "${a.suffix}" enden`
            : a.format === "includes"
              ? `Ung\xFCltiger String: muss "${a.includes}" enthalten`
              : a.format === "regex"
                ? `Ung\xFCltiger String: muss dem Muster ${a.pattern} entsprechen`
                : `Ung\xFCltig: ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Ung\xFCltige Zahl: muss ein Vielfaches von ${o.divisor} sein`;
      case "unrecognized_keys":
        return `${o.keys.length > 1 ? "Unbekannte Schl\xFCssel" : "Unbekannter Schl\xFCssel"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Ung\xFCltiger Schl\xFCssel in ${o.origin}`;
      case "invalid_union":
        return "Ung\xFCltige Eingabe";
      case "invalid_element":
        return `Ung\xFCltiger Wert in ${o.origin}`;
      default:
        return "Ung\xFCltige Eingabe";
    }
  };
}, "error");
function Es() {
  return { localeError: _b() };
}
s(Es, "default");
var xb = s(() => {
  let e = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" },
    map: { unit: "entries", verb: "to have" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "email address",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datetime",
      date: "ISO date",
      time: "ISO time",
      duration: "ISO duration",
      ipv4: "IPv4 address",
      ipv6: "IPv6 address",
      mac: "MAC address",
      cidrv4: "IPv4 range",
      cidrv6: "IPv6 range",
      base64: "base64-encoded string",
      base64url: "base64url-encoded string",
      json_string: "JSON string",
      e164: "E.164 number",
      jwt: "JWT",
      template_literal: "input",
    },
    i = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return `Invalid input: expected ${a}, received ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Invalid input: expected ${stringifyPrimitive(o.values[0])}`
          : `Invalid option: expected one of ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Too big: expected ${o.origin ?? "value"} to have ${a}${o.maximum.toString()} ${c.unit ?? "elements"}`
          : `Too big: expected ${o.origin ?? "value"} to be ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Too small: expected ${o.origin} to have ${a}${o.minimum.toString()} ${c.unit}`
          : `Too small: expected ${o.origin} to be ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Invalid string: must start with "${a.prefix}"`
          : a.format === "ends_with"
            ? `Invalid string: must end with "${a.suffix}"`
            : a.format === "includes"
              ? `Invalid string: must include "${a.includes}"`
              : a.format === "regex"
                ? `Invalid string: must match pattern ${a.pattern}`
                : `Invalid ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${o.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${o.keys.length > 1 ? "s" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${o.origin}`;
      case "invalid_union":
        return "Invalid input";
      case "invalid_element":
        return `Invalid value in ${o.origin}`;
      default:
        return "Invalid input";
    }
  };
}, "error");
function yn() {
  return { localeError: xb() };
}
s(yn, "default");
var kb = s(() => {
  let e = {
    string: { unit: "karaktrojn", verb: "havi" },
    file: { unit: "bajtojn", verb: "havi" },
    array: { unit: "elementojn", verb: "havi" },
    set: { unit: "elementojn", verb: "havi" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "enigo",
      email: "retadreso",
      url: "URL",
      emoji: "emo\u011Dio",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-datotempo",
      date: "ISO-dato",
      time: "ISO-tempo",
      duration: "ISO-da\u016Dro",
      ipv4: "IPv4-adreso",
      ipv6: "IPv6-adreso",
      cidrv4: "IPv4-rango",
      cidrv6: "IPv6-rango",
      base64: "64-ume kodita karaktraro",
      base64url: "URL-64-ume kodita karaktraro",
      json_string: "JSON-karaktraro",
      e164: "E.164-nombro",
      jwt: "JWT",
      template_literal: "enigo",
    },
    i = { nan: "NaN", number: "nombro", array: "tabelo", null: "senvalora" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Nevalida enigo: atendi\u011Dis instanceof ${o.expected}, ricevi\u011Dis ${l}`
          : `Nevalida enigo: atendi\u011Dis ${a}, ricevi\u011Dis ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Nevalida enigo: atendi\u011Dis ${stringifyPrimitive(o.values[0])}`
          : `Nevalida opcio: atendi\u011Dis unu el ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Tro granda: atendi\u011Dis ke ${o.origin ?? "valoro"} havu ${a}${o.maximum.toString()} ${c.unit ?? "elementojn"}`
          : `Tro granda: atendi\u011Dis ke ${o.origin ?? "valoro"} havu ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Tro malgranda: atendi\u011Dis ke ${o.origin} havu ${a}${o.minimum.toString()} ${c.unit}`
          : `Tro malgranda: atendi\u011Dis ke ${o.origin} estu ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Nevalida karaktraro: devas komenci\u011Di per "${a.prefix}"`
          : a.format === "ends_with"
            ? `Nevalida karaktraro: devas fini\u011Di per "${a.suffix}"`
            : a.format === "includes"
              ? `Nevalida karaktraro: devas inkluzivi "${a.includes}"`
              : a.format === "regex"
                ? `Nevalida karaktraro: devas kongrui kun la modelo ${a.pattern}`
                : `Nevalida ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Nevalida nombro: devas esti oblo de ${o.divisor}`;
      case "unrecognized_keys":
        return `Nekonata${o.keys.length > 1 ? "j" : ""} \u015Dlosilo${o.keys.length > 1 ? "j" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Nevalida \u015Dlosilo en ${o.origin}`;
      case "invalid_union":
        return "Nevalida enigo";
      case "invalid_element":
        return `Nevalida valoro en ${o.origin}`;
      default:
        return "Nevalida enigo";
    }
  };
}, "error");
function Os() {
  return { localeError: kb() };
}
s(Os, "default");
var Ib = s(() => {
  let e = {
    string: { unit: "caracteres", verb: "tener" },
    file: { unit: "bytes", verb: "tener" },
    array: { unit: "elementos", verb: "tener" },
    set: { unit: "elementos", verb: "tener" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "entrada",
      email: "direcci\xF3n de correo electr\xF3nico",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "fecha y hora ISO",
      date: "fecha ISO",
      time: "hora ISO",
      duration: "duraci\xF3n ISO",
      ipv4: "direcci\xF3n IPv4",
      ipv6: "direcci\xF3n IPv6",
      cidrv4: "rango IPv4",
      cidrv6: "rango IPv6",
      base64: "cadena codificada en base64",
      base64url: "URL codificada en base64",
      json_string: "cadena JSON",
      e164: "n\xFAmero E.164",
      jwt: "JWT",
      template_literal: "entrada",
    },
    i = {
      nan: "NaN",
      string: "texto",
      number: "n\xFAmero",
      boolean: "booleano",
      array: "arreglo",
      object: "objeto",
      set: "conjunto",
      file: "archivo",
      date: "fecha",
      bigint: "n\xFAmero grande",
      symbol: "s\xEDmbolo",
      undefined: "indefinido",
      null: "nulo",
      function: "funci\xF3n",
      map: "mapa",
      record: "registro",
      tuple: "tupla",
      enum: "enumeraci\xF3n",
      union: "uni\xF3n",
      literal: "literal",
      promise: "promesa",
      void: "vac\xEDo",
      never: "nunca",
      unknown: "desconocido",
      any: "cualquiera",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Entrada inv\xE1lida: se esperaba instanceof ${o.expected}, recibido ${l}`
          : `Entrada inv\xE1lida: se esperaba ${a}, recibido ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Entrada inv\xE1lida: se esperaba ${stringifyPrimitive(o.values[0])}`
          : `Opci\xF3n inv\xE1lida: se esperaba una de ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin),
          l = i[o.origin] ?? o.origin;
        return c
          ? `Demasiado grande: se esperaba que ${l ?? "valor"} tuviera ${a}${o.maximum.toString()} ${c.unit ?? "elementos"}`
          : `Demasiado grande: se esperaba que ${l ?? "valor"} fuera ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin),
          l = i[o.origin] ?? o.origin;
        return c
          ? `Demasiado peque\xF1o: se esperaba que ${l} tuviera ${a}${o.minimum.toString()} ${c.unit}`
          : `Demasiado peque\xF1o: se esperaba que ${l} fuera ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Cadena inv\xE1lida: debe comenzar con "${a.prefix}"`
          : a.format === "ends_with"
            ? `Cadena inv\xE1lida: debe terminar en "${a.suffix}"`
            : a.format === "includes"
              ? `Cadena inv\xE1lida: debe incluir "${a.includes}"`
              : a.format === "regex"
                ? `Cadena inv\xE1lida: debe coincidir con el patr\xF3n ${a.pattern}`
                : `Inv\xE1lido ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE1lido: debe ser m\xFAltiplo de ${o.divisor}`;
      case "unrecognized_keys":
        return `Llave${o.keys.length > 1 ? "s" : ""} desconocida${o.keys.length > 1 ? "s" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Llave inv\xE1lida en ${i[o.origin] ?? o.origin}`;
      case "invalid_union":
        return "Entrada inv\xE1lida";
      case "invalid_element":
        return `Valor inv\xE1lido en ${i[o.origin] ?? o.origin}`;
      default:
        return "Entrada inv\xE1lida";
    }
  };
}, "error");
function As() {
  return { localeError: Ib() };
}
s(As, "default");
var Cb = s(() => {
  let e = {
    string: {
      unit: "\u06A9\u0627\u0631\u0627\u06A9\u062A\u0631",
      verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F",
    },
    file: {
      unit: "\u0628\u0627\u06CC\u062A",
      verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F",
    },
    array: {
      unit: "\u0622\u06CC\u062A\u0645",
      verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F",
    },
    set: {
      unit: "\u0622\u06CC\u062A\u0645",
      verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F",
    },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0648\u0631\u0648\u062F\u06CC",
      email: "\u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644",
      url: "URL",
      emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime:
        "\u062A\u0627\u0631\u06CC\u062E \u0648 \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
      date: "\u062A\u0627\u0631\u06CC\u062E \u0627\u06CC\u0632\u0648",
      time: "\u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
      duration: "\u0645\u062F\u062A \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
      ipv4: "IPv4 \u0622\u062F\u0631\u0633",
      ipv6: "IPv6 \u0622\u062F\u0631\u0633",
      cidrv4: "IPv4 \u062F\u0627\u0645\u0646\u0647",
      cidrv6: "IPv6 \u062F\u0627\u0645\u0646\u0647",
      base64: "base64-encoded \u0631\u0634\u062A\u0647",
      base64url: "base64url-encoded \u0631\u0634\u062A\u0647",
      json_string: "JSON \u0631\u0634\u062A\u0647",
      e164: "E.164 \u0639\u062F\u062F",
      jwt: "JWT",
      template_literal: "\u0648\u0631\u0648\u062F\u06CC",
    },
    i = { nan: "NaN", number: "\u0639\u062F\u062F", array: "\u0622\u0631\u0627\u06CC\u0647" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A instanceof ${o.expected} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${l} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`
          : `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${a} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${l} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${stringifyPrimitive(o.values[0])} \u0645\u06CC\u200C\u0628\u0648\u062F`
          : `\u06AF\u0632\u06CC\u0646\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A \u06CC\u06A9\u06CC \u0627\u0632 ${joinValues(o.values, "|")} \u0645\u06CC\u200C\u0628\u0648\u062F`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${o.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${a}${o.maximum.toString()} ${c.unit ?? "\u0639\u0646\u0635\u0631"} \u0628\u0627\u0634\u062F`
          : `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${o.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${a}${o.maximum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${o.origin} \u0628\u0627\u06CC\u062F ${a}${o.minimum.toString()} ${c.unit} \u0628\u0627\u0634\u062F`
          : `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${o.origin} \u0628\u0627\u06CC\u062F ${a}${o.minimum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${a.prefix}" \u0634\u0631\u0648\u0639 \u0634\u0648\u062F`
          : a.format === "ends_with"
            ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${a.suffix}" \u062A\u0645\u0627\u0645 \u0634\u0648\u062F`
            : a.format === "includes"
              ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0634\u0627\u0645\u0644 "${a.includes}" \u0628\u0627\u0634\u062F`
              : a.format === "regex"
                ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 \u0627\u0644\u06AF\u0648\u06CC ${a.pattern} \u0645\u0637\u0627\u0628\u0642\u062A \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F`
                : `${r[a.format] ?? o.format} \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
      }
      case "not_multiple_of":
        return `\u0639\u062F\u062F \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0645\u0636\u0631\u0628 ${o.divisor} \u0628\u0627\u0634\u062F`;
      case "unrecognized_keys":
        return `\u06A9\u0644\u06CC\u062F${o.keys.length > 1 ? "\u0647\u0627\u06CC" : ""} \u0646\u0627\u0634\u0646\u0627\u0633: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\u06A9\u0644\u06CC\u062F \u0646\u0627\u0634\u0646\u0627\u0633 \u062F\u0631 ${o.origin}`;
      case "invalid_union":
        return "\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631";
      case "invalid_element":
        return `\u0645\u0642\u062F\u0627\u0631 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u062F\u0631 ${o.origin}`;
      default:
        return "\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631";
    }
  };
}, "error");
function zs() {
  return { localeError: Cb() };
}
s(zs, "default");
var Rb = s(() => {
  let e = {
    string: { unit: "merkki\xE4", subject: "merkkijonon" },
    file: { unit: "tavua", subject: "tiedoston" },
    array: { unit: "alkiota", subject: "listan" },
    set: { unit: "alkiota", subject: "joukon" },
    number: { unit: "", subject: "luvun" },
    bigint: { unit: "", subject: "suuren kokonaisluvun" },
    int: { unit: "", subject: "kokonaisluvun" },
    date: { unit: "", subject: "p\xE4iv\xE4m\xE4\xE4r\xE4n" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "s\xE4\xE4nn\xF6llinen lauseke",
      email: "s\xE4hk\xF6postiosoite",
      url: "URL-osoite",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-aikaleima",
      date: "ISO-p\xE4iv\xE4m\xE4\xE4r\xE4",
      time: "ISO-aika",
      duration: "ISO-kesto",
      ipv4: "IPv4-osoite",
      ipv6: "IPv6-osoite",
      cidrv4: "IPv4-alue",
      cidrv6: "IPv6-alue",
      base64: "base64-koodattu merkkijono",
      base64url: "base64url-koodattu merkkijono",
      json_string: "JSON-merkkijono",
      e164: "E.164-luku",
      jwt: "JWT",
      template_literal: "templaattimerkkijono",
    },
    i = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Virheellinen tyyppi: odotettiin instanceof ${o.expected}, oli ${l}`
          : `Virheellinen tyyppi: odotettiin ${a}, oli ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Virheellinen sy\xF6te: t\xE4ytyy olla ${stringifyPrimitive(o.values[0])}`
          : `Virheellinen valinta: t\xE4ytyy olla yksi seuraavista: ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Liian suuri: ${c.subject} t\xE4ytyy olla ${a}${o.maximum.toString()} ${c.unit}`.trim()
          : `Liian suuri: arvon t\xE4ytyy olla ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Liian pieni: ${c.subject} t\xE4ytyy olla ${a}${o.minimum.toString()} ${c.unit}`.trim()
          : `Liian pieni: arvon t\xE4ytyy olla ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Virheellinen sy\xF6te: t\xE4ytyy alkaa "${a.prefix}"`
          : a.format === "ends_with"
            ? `Virheellinen sy\xF6te: t\xE4ytyy loppua "${a.suffix}"`
            : a.format === "includes"
              ? `Virheellinen sy\xF6te: t\xE4ytyy sis\xE4lt\xE4\xE4 "${a.includes}"`
              : a.format === "regex"
                ? `Virheellinen sy\xF6te: t\xE4ytyy vastata s\xE4\xE4nn\xF6llist\xE4 lauseketta ${a.pattern}`
                : `Virheellinen ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Virheellinen luku: t\xE4ytyy olla luvun ${o.divisor} monikerta`;
      case "unrecognized_keys":
        return `${o.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return "Virheellinen avain tietueessa";
      case "invalid_union":
        return "Virheellinen unioni";
      case "invalid_element":
        return "Virheellinen arvo joukossa";
      default:
        return "Virheellinen sy\xF6te";
    }
  };
}, "error");
function Ms() {
  return { localeError: Rb() };
}
s(Ms, "default");
var Pb = s(() => {
  let e = {
    string: { unit: "caract\xE8res", verb: "avoir" },
    file: { unit: "octets", verb: "avoir" },
    array: { unit: "\xE9l\xE9ments", verb: "avoir" },
    set: { unit: "\xE9l\xE9ments", verb: "avoir" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "entr\xE9e",
      email: "adresse e-mail",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "date et heure ISO",
      date: "date ISO",
      time: "heure ISO",
      duration: "dur\xE9e ISO",
      ipv4: "adresse IPv4",
      ipv6: "adresse IPv6",
      cidrv4: "plage IPv4",
      cidrv6: "plage IPv6",
      base64: "cha\xEEne encod\xE9e en base64",
      base64url: "cha\xEEne encod\xE9e en base64url",
      json_string: "cha\xEEne JSON",
      e164: "num\xE9ro E.164",
      jwt: "JWT",
      template_literal: "entr\xE9e",
    },
    i = { nan: "NaN", number: "nombre", array: "tableau" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Entr\xE9e invalide : instanceof ${o.expected} attendu, ${l} re\xE7u`
          : `Entr\xE9e invalide : ${a} attendu, ${l} re\xE7u`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Entr\xE9e invalide : ${stringifyPrimitive(o.values[0])} attendu`
          : `Option invalide : une valeur parmi ${joinValues(o.values, "|")} attendue`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Trop grand : ${o.origin ?? "valeur"} doit ${c.verb} ${a}${o.maximum.toString()} ${c.unit ?? "\xE9l\xE9ment(s)"}`
          : `Trop grand : ${o.origin ?? "valeur"} doit \xEAtre ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Trop petit : ${o.origin} doit ${c.verb} ${a}${o.minimum.toString()} ${c.unit}`
          : `Trop petit : ${o.origin} doit \xEAtre ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Cha\xEEne invalide : doit commencer par "${a.prefix}"`
          : a.format === "ends_with"
            ? `Cha\xEEne invalide : doit se terminer par "${a.suffix}"`
            : a.format === "includes"
              ? `Cha\xEEne invalide : doit inclure "${a.includes}"`
              : a.format === "regex"
                ? `Cha\xEEne invalide : doit correspondre au mod\xE8le ${a.pattern}`
                : `${r[a.format] ?? o.format} invalide`;
      }
      case "not_multiple_of":
        return `Nombre invalide : doit \xEAtre un multiple de ${o.divisor}`;
      case "unrecognized_keys":
        return `Cl\xE9${o.keys.length > 1 ? "s" : ""} non reconnue${o.keys.length > 1 ? "s" : ""} : ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Cl\xE9 invalide dans ${o.origin}`;
      case "invalid_union":
        return "Entr\xE9e invalide";
      case "invalid_element":
        return `Valeur invalide dans ${o.origin}`;
      default:
        return "Entr\xE9e invalide";
    }
  };
}, "error");
function $s() {
  return { localeError: Pb() };
}
s($s, "default");
var Tb = s(() => {
  let e = {
    string: { unit: "caract\xE8res", verb: "avoir" },
    file: { unit: "octets", verb: "avoir" },
    array: { unit: "\xE9l\xE9ments", verb: "avoir" },
    set: { unit: "\xE9l\xE9ments", verb: "avoir" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "entr\xE9e",
      email: "adresse courriel",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "date-heure ISO",
      date: "date ISO",
      time: "heure ISO",
      duration: "dur\xE9e ISO",
      ipv4: "adresse IPv4",
      ipv6: "adresse IPv6",
      cidrv4: "plage IPv4",
      cidrv6: "plage IPv6",
      base64: "cha\xEEne encod\xE9e en base64",
      base64url: "cha\xEEne encod\xE9e en base64url",
      json_string: "cha\xEEne JSON",
      e164: "num\xE9ro E.164",
      jwt: "JWT",
      template_literal: "entr\xE9e",
    },
    i = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Entr\xE9e invalide : attendu instanceof ${o.expected}, re\xE7u ${l}`
          : `Entr\xE9e invalide : attendu ${a}, re\xE7u ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Entr\xE9e invalide : attendu ${stringifyPrimitive(o.values[0])}`
          : `Option invalide : attendu l'une des valeurs suivantes ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "\u2264" : "<",
          c = getSizing(o.origin);
        return c
          ? `Trop grand : attendu que ${o.origin ?? "la valeur"} ait ${a}${o.maximum.toString()} ${c.unit}`
          : `Trop grand : attendu que ${o.origin ?? "la valeur"} soit ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? "\u2265" : ">",
          c = getSizing(o.origin);
        return c
          ? `Trop petit : attendu que ${o.origin} ait ${a}${o.minimum.toString()} ${c.unit}`
          : `Trop petit : attendu que ${o.origin} soit ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Cha\xEEne invalide : doit commencer par "${a.prefix}"`
          : a.format === "ends_with"
            ? `Cha\xEEne invalide : doit se terminer par "${a.suffix}"`
            : a.format === "includes"
              ? `Cha\xEEne invalide : doit inclure "${a.includes}"`
              : a.format === "regex"
                ? `Cha\xEEne invalide : doit correspondre au motif ${a.pattern}`
                : `${r[a.format] ?? o.format} invalide`;
      }
      case "not_multiple_of":
        return `Nombre invalide : doit \xEAtre un multiple de ${o.divisor}`;
      case "unrecognized_keys":
        return `Cl\xE9${o.keys.length > 1 ? "s" : ""} non reconnue${o.keys.length > 1 ? "s" : ""} : ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Cl\xE9 invalide dans ${o.origin}`;
      case "invalid_union":
        return "Entr\xE9e invalide";
      case "invalid_element":
        return `Valeur invalide dans ${o.origin}`;
      default:
        return "Entr\xE9e invalide";
    }
  };
}, "error");
function Ds() {
  return { localeError: Tb() };
}
s(Ds, "default");
var wb = s(() => {
  let e = {
      string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA", gender: "f" },
      number: { label: "\u05DE\u05E1\u05E4\u05E8", gender: "m" },
      boolean: {
        label: "\u05E2\u05E8\u05DA \u05D1\u05D5\u05DC\u05D9\u05D0\u05E0\u05D9",
        gender: "m",
      },
      bigint: { label: "BigInt", gender: "m" },
      date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA", gender: "m" },
      array: { label: "\u05DE\u05E2\u05E8\u05DA", gender: "m" },
      object: { label: "\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8", gender: "m" },
      null: { label: "\u05E2\u05E8\u05DA \u05E8\u05D9\u05E7 (null)", gender: "m" },
      undefined: {
        label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05DE\u05D5\u05D2\u05D3\u05E8 (undefined)",
        gender: "m",
      },
      symbol: { label: "\u05E1\u05D9\u05DE\u05D1\u05D5\u05DC (Symbol)", gender: "m" },
      function: { label: "\u05E4\u05D5\u05E0\u05E7\u05E6\u05D9\u05D4", gender: "f" },
      map: { label: "\u05DE\u05E4\u05D4 (Map)", gender: "f" },
      set: { label: "\u05E7\u05D1\u05D5\u05E6\u05D4 (Set)", gender: "f" },
      file: { label: "\u05E7\u05D5\u05D1\u05E5", gender: "m" },
      promise: { label: "Promise", gender: "m" },
      NaN: { label: "NaN", gender: "m" },
      unknown: { label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2", gender: "m" },
      value: { label: "\u05E2\u05E8\u05DA", gender: "m" },
    },
    t = {
      string: {
        unit: "\u05EA\u05D5\u05D5\u05D9\u05DD",
        shortLabel: "\u05E7\u05E6\u05E8",
        longLabel: "\u05D0\u05E8\u05D5\u05DA",
      },
      file: {
        unit: "\u05D1\u05D9\u05D9\u05D8\u05D9\u05DD",
        shortLabel: "\u05E7\u05D8\u05DF",
        longLabel: "\u05D2\u05D3\u05D5\u05DC",
      },
      array: {
        unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD",
        shortLabel: "\u05E7\u05D8\u05DF",
        longLabel: "\u05D2\u05D3\u05D5\u05DC",
      },
      set: {
        unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD",
        shortLabel: "\u05E7\u05D8\u05DF",
        longLabel: "\u05D2\u05D3\u05D5\u05DC",
      },
      number: { unit: "", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
    },
    r = s((d) => (d ? e[d] : void 0), "typeEntry"),
    i = s((d) => {
      let g = r(d);
      return g ? g.label : (d ?? e.unknown.label);
    }, "typeLabel"),
    o = s((d) => `\u05D4${i(d)}`, "withDefinite"),
    a = s(
      (d) =>
        (r(d)?.gender ?? "m") === "f"
          ? "\u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05D9\u05D5\u05EA"
          : "\u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA",
      "verbFor",
    ),
    c = s((d) => (d ? (t[d] ?? null) : null), "getSizing"),
    l = {
      regex: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      email: {
        label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC",
        gender: "f",
      },
      url: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05E8\u05E9\u05EA", gender: "f" },
      emoji: { label: "\u05D0\u05D9\u05DE\u05D5\u05D2'\u05D9", gender: "m" },
      uuid: { label: "UUID", gender: "m" },
      nanoid: { label: "nanoid", gender: "m" },
      guid: { label: "GUID", gender: "m" },
      cuid: { label: "cuid", gender: "m" },
      cuid2: { label: "cuid2", gender: "m" },
      ulid: { label: "ULID", gender: "m" },
      xid: { label: "XID", gender: "m" },
      ksuid: { label: "KSUID", gender: "m" },
      datetime: {
        label: "\u05EA\u05D0\u05E8\u05D9\u05DA \u05D5\u05D6\u05DE\u05DF ISO",
        gender: "m",
      },
      date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA ISO", gender: "m" },
      time: { label: "\u05D6\u05DE\u05DF ISO", gender: "m" },
      duration: { label: "\u05DE\u05E9\u05DA \u05D6\u05DE\u05DF ISO", gender: "m" },
      ipv4: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv4", gender: "f" },
      ipv6: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv6", gender: "f" },
      cidrv4: { label: "\u05D8\u05D5\u05D5\u05D7 IPv4", gender: "m" },
      cidrv6: { label: "\u05D8\u05D5\u05D5\u05D7 IPv6", gender: "m" },
      base64: {
        label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64",
        gender: "f",
      },
      base64url: {
        label:
          "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64 \u05DC\u05DB\u05EA\u05D5\u05D1\u05D5\u05EA \u05E8\u05E9\u05EA",
        gender: "f",
      },
      json_string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA JSON", gender: "f" },
      e164: { label: "\u05DE\u05E1\u05E4\u05E8 E.164", gender: "m" },
      jwt: { label: "JWT", gender: "m" },
      ends_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      includes: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      lowercase: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      starts_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      uppercase: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    },
    p = { nan: "NaN" };
  return (d) => {
    switch (d.code) {
      case "invalid_type": {
        let g = d.expected,
          y = p[g ?? ""] ?? i(g),
          S = parsedType(d.input),
          v = p[S] ?? e[S]?.label ?? S;
        return /^[A-Z]/.test(d.expected)
          ? `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA instanceof ${d.expected}, \u05D4\u05EA\u05E7\u05D1\u05DC ${v}`
          : `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${y}, \u05D4\u05EA\u05E7\u05D1\u05DC ${v}`;
      }
      case "invalid_value": {
        if (d.values.length === 1)
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05E2\u05E8\u05DA \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA ${stringifyPrimitive(d.values[0])}`;
        let g = d.values.map((v) => stringifyPrimitive(v));
        if (d.values.length === 2)
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${g[0]} \u05D0\u05D5 ${g[1]}`;
        let y = g[g.length - 1];
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${g.slice(0, -1).join(", ")} \u05D0\u05D5 ${y}`;
      }
      case "too_big": {
        let g = c(d.origin),
          y = o(d.origin ?? "value");
        if (d.origin === "string")
          return `${g?.longLabel ?? "\u05D0\u05E8\u05D5\u05DA"} \u05DE\u05D3\u05D9: ${y} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${d.maximum.toString()} ${g?.unit ?? ""} ${d.inclusive ? "\u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA" : "\u05DC\u05DB\u05DC \u05D4\u05D9\u05D5\u05EA\u05E8"}`.trim();
        if (d.origin === "number") {
          let P = d.inclusive
            ? `\u05E7\u05D8\u05DF \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${d.maximum}`
            : `\u05E7\u05D8\u05DF \u05DE-${d.maximum}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${y} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${P}`;
        }
        if (d.origin === "array" || d.origin === "set") {
          let P =
              d.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA",
            w = d.inclusive
              ? `${d.maximum} ${g?.unit ?? ""} \u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA`
              : `\u05E4\u05D7\u05D5\u05EA \u05DE-${d.maximum} ${g?.unit ?? ""}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${y} ${P} \u05DC\u05D4\u05DB\u05D9\u05DC ${w}`.trim();
        }
        let S = d.inclusive ? "<=" : "<",
          v = a(d.origin ?? "value");
        return g?.unit
          ? `${g.longLabel} \u05DE\u05D3\u05D9: ${y} ${v} ${S}${d.maximum.toString()} ${g.unit}`
          : `${g?.longLabel ?? "\u05D2\u05D3\u05D5\u05DC"} \u05DE\u05D3\u05D9: ${y} ${v} ${S}${d.maximum.toString()}`;
      }
      case "too_small": {
        let g = c(d.origin),
          y = o(d.origin ?? "value");
        if (d.origin === "string")
          return `${g?.shortLabel ?? "\u05E7\u05E6\u05E8"} \u05DE\u05D3\u05D9: ${y} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${d.minimum.toString()} ${g?.unit ?? ""} ${d.inclusive ? "\u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8" : "\u05DC\u05E4\u05D7\u05D5\u05EA"}`.trim();
        if (d.origin === "number") {
          let P = d.inclusive
            ? `\u05D2\u05D3\u05D5\u05DC \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${d.minimum}`
            : `\u05D2\u05D3\u05D5\u05DC \u05DE-${d.minimum}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${y} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${P}`;
        }
        if (d.origin === "array" || d.origin === "set") {
          let P =
            d.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
          if (d.minimum === 1 && d.inclusive) {
            let G =
              (d.origin === "set",
              "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3");
            return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${y} ${P} \u05DC\u05D4\u05DB\u05D9\u05DC ${G}`;
          }
          let w = d.inclusive
            ? `${d.minimum} ${g?.unit ?? ""} \u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8`
            : `\u05D9\u05D5\u05EA\u05E8 \u05DE-${d.minimum} ${g?.unit ?? ""}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${y} ${P} \u05DC\u05D4\u05DB\u05D9\u05DC ${w}`.trim();
        }
        let S = d.inclusive ? ">=" : ">",
          v = a(d.origin ?? "value");
        return g?.unit
          ? `${g.shortLabel} \u05DE\u05D3\u05D9: ${y} ${v} ${S}${d.minimum.toString()} ${g.unit}`
          : `${g?.shortLabel ?? "\u05E7\u05D8\u05DF"} \u05DE\u05D3\u05D9: ${y} ${v} ${S}${d.minimum.toString()}`;
      }
      case "invalid_format": {
        let g = d;
        if (g.format === "starts_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC \u05D1 "${g.prefix}"`;
        if (g.format === "ends_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD \u05D1 "${g.suffix}"`;
        if (g.format === "includes")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05DB\u05DC\u05D5\u05DC "${g.includes}"`;
        if (g.format === "regex")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D0\u05D9\u05DD \u05DC\u05EA\u05D1\u05E0\u05D9\u05EA ${g.pattern}`;
        let y = l[g.format],
          S = y?.label ?? g.format,
          P =
            (y?.gender ?? "m") === "f"
              ? "\u05EA\u05E7\u05D9\u05E0\u05D4"
              : "\u05EA\u05E7\u05D9\u05DF";
        return `${S} \u05DC\u05D0 ${P}`;
      }
      case "not_multiple_of":
        return `\u05DE\u05E1\u05E4\u05E8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DE\u05DB\u05E4\u05DC\u05D4 \u05E9\u05DC ${d.divisor}`;
      case "unrecognized_keys":
        return `\u05DE\u05E4\u05EA\u05D7${d.keys.length > 1 ? "\u05D5\u05EA" : ""} \u05DC\u05D0 \u05DE\u05D6\u05D5\u05D4${d.keys.length > 1 ? "\u05D9\u05DD" : "\u05D4"}: ${joinValues(d.keys, ", ")}`;
      case "invalid_key":
        return "\u05E9\u05D3\u05D4 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8";
      case "invalid_union":
        return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
      case "invalid_element":
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1${o(d.origin ?? "array")}`;
      default:
        return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
    }
  };
}, "error");
function Us() {
  return { localeError: wb() };
}
s(Us, "default");
var Eb = s(() => {
  let e = {
    string: { unit: "karakter", verb: "legyen" },
    file: { unit: "byte", verb: "legyen" },
    array: { unit: "elem", verb: "legyen" },
    set: { unit: "elem", verb: "legyen" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "bemenet",
      email: "email c\xEDm",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO id\u0151b\xE9lyeg",
      date: "ISO d\xE1tum",
      time: "ISO id\u0151",
      duration: "ISO id\u0151intervallum",
      ipv4: "IPv4 c\xEDm",
      ipv6: "IPv6 c\xEDm",
      cidrv4: "IPv4 tartom\xE1ny",
      cidrv6: "IPv6 tartom\xE1ny",
      base64: "base64-k\xF3dolt string",
      base64url: "base64url-k\xF3dolt string",
      json_string: "JSON string",
      e164: "E.164 sz\xE1m",
      jwt: "JWT",
      template_literal: "bemenet",
    },
    i = { nan: "NaN", number: "sz\xE1m", array: "t\xF6mb" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k instanceof ${o.expected}, a kapott \xE9rt\xE9k ${l}`
          : `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${a}, a kapott \xE9rt\xE9k ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${stringifyPrimitive(o.values[0])}`
          : `\xC9rv\xE9nytelen opci\xF3: valamelyik \xE9rt\xE9k v\xE1rt ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `T\xFAl nagy: ${o.origin ?? "\xE9rt\xE9k"} m\xE9rete t\xFAl nagy ${a}${o.maximum.toString()} ${c.unit ?? "elem"}`
          : `T\xFAl nagy: a bemeneti \xE9rt\xE9k ${o.origin ?? "\xE9rt\xE9k"} t\xFAl nagy: ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${o.origin} m\xE9rete t\xFAl kicsi ${a}${o.minimum.toString()} ${c.unit}`
          : `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${o.origin} t\xFAl kicsi ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\xC9rv\xE9nytelen string: "${a.prefix}" \xE9rt\xE9kkel kell kezd\u0151dnie`
          : a.format === "ends_with"
            ? `\xC9rv\xE9nytelen string: "${a.suffix}" \xE9rt\xE9kkel kell v\xE9gz\u0151dnie`
            : a.format === "includes"
              ? `\xC9rv\xE9nytelen string: "${a.includes}" \xE9rt\xE9ket kell tartalmaznia`
              : a.format === "regex"
                ? `\xC9rv\xE9nytelen string: ${a.pattern} mint\xE1nak kell megfelelnie`
                : `\xC9rv\xE9nytelen ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\xC9rv\xE9nytelen sz\xE1m: ${o.divisor} t\xF6bbsz\xF6r\xF6s\xE9nek kell lennie`;
      case "unrecognized_keys":
        return `Ismeretlen kulcs${o.keys.length > 1 ? "s" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\xC9rv\xE9nytelen kulcs ${o.origin}`;
      case "invalid_union":
        return "\xC9rv\xE9nytelen bemenet";
      case "invalid_element":
        return `\xC9rv\xE9nytelen \xE9rt\xE9k: ${o.origin}`;
      default:
        return "\xC9rv\xE9nytelen bemenet";
    }
  };
}, "error");
function Ns() {
  return { localeError: Eb() };
}
s(Ns, "default");
function getArmenianPlural(e, t, r) {
  return Math.abs(e) === 1 ? t : r;
}
s(getArmenianPlural, "getArmenianPlural");
function withDefiniteArticle(e) {
  if (!e) return "";
  let t = ["\u0561", "\u0565", "\u0568", "\u056B", "\u0578", "\u0578\u0582", "\u0585"],
    r = e[e.length - 1];
  return e + (t.includes(r) ? "\u0576" : "\u0568");
}
s(withDefiniteArticle, "withDefiniteArticle");
var Ob = s(() => {
  let e = {
    string: {
      unit: { one: "\u0576\u0577\u0561\u0576", many: "\u0576\u0577\u0561\u0576\u0576\u0565\u0580" },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C",
    },
    file: {
      unit: { one: "\u0562\u0561\u0575\u0569", many: "\u0562\u0561\u0575\u0569\u0565\u0580" },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C",
    },
    array: {
      unit: { one: "\u057F\u0561\u0580\u0580", many: "\u057F\u0561\u0580\u0580\u0565\u0580" },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C",
    },
    set: {
      unit: { one: "\u057F\u0561\u0580\u0580", many: "\u057F\u0561\u0580\u0580\u0565\u0580" },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C",
    },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0574\u0578\u0582\u057F\u0584",
      email: "\u0567\u056C. \u0570\u0561\u057D\u0581\u0565",
      url: "URL",
      emoji: "\u0567\u0574\u0578\u057B\u056B",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0561\u0574\u057D\u0561\u0569\u056B\u057E \u0587 \u056A\u0561\u0574",
      date: "ISO \u0561\u0574\u057D\u0561\u0569\u056B\u057E",
      time: "ISO \u056A\u0561\u0574",
      duration: "ISO \u057F\u0587\u0578\u0572\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
      ipv4: "IPv4 \u0570\u0561\u057D\u0581\u0565",
      ipv6: "IPv6 \u0570\u0561\u057D\u0581\u0565",
      cidrv4: "IPv4 \u0574\u056B\u057B\u0561\u056F\u0561\u0575\u0584",
      cidrv6: "IPv6 \u0574\u056B\u057B\u0561\u056F\u0561\u0575\u0584",
      base64: "base64 \u0571\u0587\u0561\u0579\u0561\u0583\u0578\u057E \u057F\u0578\u0572",
      base64url: "base64url \u0571\u0587\u0561\u0579\u0561\u0583\u0578\u057E \u057F\u0578\u0572",
      json_string: "JSON \u057F\u0578\u0572",
      e164: "E.164 \u0570\u0561\u0574\u0561\u0580",
      jwt: "JWT",
      template_literal: "\u0574\u0578\u0582\u057F\u0584",
    },
    i = {
      nan: "NaN",
      number: "\u0569\u056B\u057E",
      array: "\u0566\u0561\u0576\u0563\u057E\u0561\u056E",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 instanceof ${o.expected}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${l}`
          : `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${a}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${stringifyPrimitive(o.values[1])}`
          : `\u054D\u056D\u0561\u056C \u057F\u0561\u0580\u0562\u0565\u0580\u0561\u056F\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 \u0570\u0565\u057F\u0587\u0575\u0561\u056C\u0576\u0565\u0580\u056B\u0581 \u0574\u0565\u056F\u0568\u055D ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.maximum),
            p = getArmenianPlural(l, c.unit.one, c.unit.many);
          return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(o.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${a}${o.maximum.toString()} ${p}`;
        }
        return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(o.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056C\u056B\u0576\u056B ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.minimum),
            p = getArmenianPlural(l, c.unit.one, c.unit.many);
          return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(o.origin)} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${a}${o.minimum.toString()} ${p}`;
        }
        return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(o.origin)} \u056C\u056B\u0576\u056B ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057D\u056F\u057D\u057E\u056B "${a.prefix}"-\u0578\u057E`
          : a.format === "ends_with"
            ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0561\u057E\u0561\u0580\u057F\u057E\u056B "${a.suffix}"-\u0578\u057E`
            : a.format === "includes"
              ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057A\u0561\u0580\u0578\u0582\u0576\u0561\u056F\u056B "${a.includes}"`
              : a.format === "regex"
                ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0570\u0561\u0574\u0561\u057A\u0561\u057F\u0561\u057D\u056D\u0561\u0576\u056B ${a.pattern} \u0571\u0587\u0561\u0579\u0561\u0583\u056B\u0576`
                : `\u054D\u056D\u0561\u056C ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u054D\u056D\u0561\u056C \u0569\u056B\u057E\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0562\u0561\u0566\u0574\u0561\u057A\u0561\u057F\u056B\u056F \u056C\u056B\u0576\u056B ${o.divisor}-\u056B`;
      case "unrecognized_keys":
        return `\u0549\u0573\u0561\u0576\u0561\u0579\u057E\u0561\u056E \u0562\u0561\u0576\u0561\u056C\u056B${o.keys.length > 1 ? "\u0576\u0565\u0580" : ""}. ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\u054D\u056D\u0561\u056C \u0562\u0561\u0576\u0561\u056C\u056B ${withDefiniteArticle(o.origin)}-\u0578\u0582\u0574`;
      case "invalid_union":
        return "\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574";
      case "invalid_element":
        return `\u054D\u056D\u0561\u056C \u0561\u0580\u056A\u0565\u0584 ${withDefiniteArticle(o.origin)}-\u0578\u0582\u0574`;
      default:
        return "\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574";
    }
  };
}, "error");
function Zs() {
  return { localeError: Ob() };
}
s(Zs, "default");
var Ab = s(() => {
  let e = {
    string: { unit: "karakter", verb: "memiliki" },
    file: { unit: "byte", verb: "memiliki" },
    array: { unit: "item", verb: "memiliki" },
    set: { unit: "item", verb: "memiliki" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "alamat email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "tanggal dan waktu format ISO",
      date: "tanggal format ISO",
      time: "jam format ISO",
      duration: "durasi format ISO",
      ipv4: "alamat IPv4",
      ipv6: "alamat IPv6",
      cidrv4: "rentang alamat IPv4",
      cidrv6: "rentang alamat IPv6",
      base64: "string dengan enkode base64",
      base64url: "string dengan enkode base64url",
      json_string: "string JSON",
      e164: "angka E.164",
      jwt: "JWT",
      template_literal: "input",
    },
    i = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Input tidak valid: diharapkan instanceof ${o.expected}, diterima ${l}`
          : `Input tidak valid: diharapkan ${a}, diterima ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Input tidak valid: diharapkan ${stringifyPrimitive(o.values[0])}`
          : `Pilihan tidak valid: diharapkan salah satu dari ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Terlalu besar: diharapkan ${o.origin ?? "value"} memiliki ${a}${o.maximum.toString()} ${c.unit ?? "elemen"}`
          : `Terlalu besar: diharapkan ${o.origin ?? "value"} menjadi ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Terlalu kecil: diharapkan ${o.origin} memiliki ${a}${o.minimum.toString()} ${c.unit}`
          : `Terlalu kecil: diharapkan ${o.origin} menjadi ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `String tidak valid: harus dimulai dengan "${a.prefix}"`
          : a.format === "ends_with"
            ? `String tidak valid: harus berakhir dengan "${a.suffix}"`
            : a.format === "includes"
              ? `String tidak valid: harus menyertakan "${a.includes}"`
              : a.format === "regex"
                ? `String tidak valid: harus sesuai pola ${a.pattern}`
                : `${r[a.format] ?? o.format} tidak valid`;
      }
      case "not_multiple_of":
        return `Angka tidak valid: harus kelipatan dari ${o.divisor}`;
      case "unrecognized_keys":
        return `Kunci tidak dikenali ${o.keys.length > 1 ? "s" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Kunci tidak valid di ${o.origin}`;
      case "invalid_union":
        return "Input tidak valid";
      case "invalid_element":
        return `Nilai tidak valid di ${o.origin}`;
      default:
        return "Input tidak valid";
    }
  };
}, "error");
function js() {
  return { localeError: Ab() };
}
s(js, "default");
var zb = s(() => {
  let e = {
    string: { unit: "stafi", verb: "a\xF0 hafa" },
    file: { unit: "b\xE6ti", verb: "a\xF0 hafa" },
    array: { unit: "hluti", verb: "a\xF0 hafa" },
    set: { unit: "hluti", verb: "a\xF0 hafa" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "gildi",
      email: "netfang",
      url: "vefsl\xF3\xF0",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO dagsetning og t\xEDmi",
      date: "ISO dagsetning",
      time: "ISO t\xEDmi",
      duration: "ISO t\xEDmalengd",
      ipv4: "IPv4 address",
      ipv6: "IPv6 address",
      cidrv4: "IPv4 range",
      cidrv6: "IPv6 range",
      base64: "base64-encoded strengur",
      base64url: "base64url-encoded strengur",
      json_string: "JSON strengur",
      e164: "E.164 t\xF6lugildi",
      jwt: "JWT",
      template_literal: "gildi",
    },
    i = { nan: "NaN", number: "n\xFAmer", array: "fylki" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Rangt gildi: \xDE\xFA sl\xF3st inn ${l} \xFEar sem \xE1 a\xF0 vera instanceof ${o.expected}`
          : `Rangt gildi: \xDE\xFA sl\xF3st inn ${l} \xFEar sem \xE1 a\xF0 vera ${a}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Rangt gildi: gert r\xE1\xF0 fyrir ${stringifyPrimitive(o.values[0])}`
          : `\xD3gilt val: m\xE1 vera eitt af eftirfarandi ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${o.origin ?? "gildi"} hafi ${a}${o.maximum.toString()} ${c.unit ?? "hluti"}`
          : `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${o.origin ?? "gildi"} s\xE9 ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${o.origin} hafi ${a}${o.minimum.toString()} ${c.unit}`
          : `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${o.origin} s\xE9 ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\xD3gildur strengur: ver\xF0ur a\xF0 byrja \xE1 "${a.prefix}"`
          : a.format === "ends_with"
            ? `\xD3gildur strengur: ver\xF0ur a\xF0 enda \xE1 "${a.suffix}"`
            : a.format === "includes"
              ? `\xD3gildur strengur: ver\xF0ur a\xF0 innihalda "${a.includes}"`
              : a.format === "regex"
                ? `\xD3gildur strengur: ver\xF0ur a\xF0 fylgja mynstri ${a.pattern}`
                : `Rangt ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `R\xF6ng tala: ver\xF0ur a\xF0 vera margfeldi af ${o.divisor}`;
      case "unrecognized_keys":
        return `\xD3\xFEekkt ${o.keys.length > 1 ? "ir lyklar" : "ur lykill"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Rangur lykill \xED ${o.origin}`;
      case "invalid_union":
        return "Rangt gildi";
      case "invalid_element":
        return `Rangt gildi \xED ${o.origin}`;
      default:
        return "Rangt gildi";
    }
  };
}, "error");
function Bs() {
  return { localeError: zb() };
}
s(Bs, "default");
var Mb = s(() => {
  let e = {
    string: { unit: "caratteri", verb: "avere" },
    file: { unit: "byte", verb: "avere" },
    array: { unit: "elementi", verb: "avere" },
    set: { unit: "elementi", verb: "avere" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "indirizzo email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data e ora ISO",
      date: "data ISO",
      time: "ora ISO",
      duration: "durata ISO",
      ipv4: "indirizzo IPv4",
      ipv6: "indirizzo IPv6",
      cidrv4: "intervallo IPv4",
      cidrv6: "intervallo IPv6",
      base64: "stringa codificata in base64",
      base64url: "URL codificata in base64",
      json_string: "stringa JSON",
      e164: "numero E.164",
      jwt: "JWT",
      template_literal: "input",
    },
    i = { nan: "NaN", number: "numero", array: "vettore" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Input non valido: atteso instanceof ${o.expected}, ricevuto ${l}`
          : `Input non valido: atteso ${a}, ricevuto ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Input non valido: atteso ${stringifyPrimitive(o.values[0])}`
          : `Opzione non valida: atteso uno tra ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Troppo grande: ${o.origin ?? "valore"} deve avere ${a}${o.maximum.toString()} ${c.unit ?? "elementi"}`
          : `Troppo grande: ${o.origin ?? "valore"} deve essere ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Troppo piccolo: ${o.origin} deve avere ${a}${o.minimum.toString()} ${c.unit}`
          : `Troppo piccolo: ${o.origin} deve essere ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Stringa non valida: deve iniziare con "${a.prefix}"`
          : a.format === "ends_with"
            ? `Stringa non valida: deve terminare con "${a.suffix}"`
            : a.format === "includes"
              ? `Stringa non valida: deve includere "${a.includes}"`
              : a.format === "regex"
                ? `Stringa non valida: deve corrispondere al pattern ${a.pattern}`
                : `Invalid ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Numero non valido: deve essere un multiplo di ${o.divisor}`;
      case "unrecognized_keys":
        return `Chiav${o.keys.length > 1 ? "i" : "e"} non riconosciut${o.keys.length > 1 ? "e" : "a"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Chiave non valida in ${o.origin}`;
      case "invalid_union":
        return "Input non valido";
      case "invalid_element":
        return `Valore non valido in ${o.origin}`;
      default:
        return "Input non valido";
    }
  };
}, "error");
function Ls() {
  return { localeError: Mb() };
}
s(Ls, "default");
var $b = s(() => {
  let e = {
    string: { unit: "\u6587\u5B57", verb: "\u3067\u3042\u308B" },
    file: { unit: "\u30D0\u30A4\u30C8", verb: "\u3067\u3042\u308B" },
    array: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
    set: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u5165\u529B\u5024",
      email: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
      url: "URL",
      emoji: "\u7D75\u6587\u5B57",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO\u65E5\u6642",
      date: "ISO\u65E5\u4ED8",
      time: "ISO\u6642\u523B",
      duration: "ISO\u671F\u9593",
      ipv4: "IPv4\u30A2\u30C9\u30EC\u30B9",
      ipv6: "IPv6\u30A2\u30C9\u30EC\u30B9",
      cidrv4: "IPv4\u7BC4\u56F2",
      cidrv6: "IPv6\u7BC4\u56F2",
      base64: "base64\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
      base64url: "base64url\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
      json_string: "JSON\u6587\u5B57\u5217",
      e164: "E.164\u756A\u53F7",
      jwt: "JWT",
      template_literal: "\u5165\u529B\u5024",
    },
    i = { nan: "NaN", number: "\u6570\u5024", array: "\u914D\u5217" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u7121\u52B9\u306A\u5165\u529B: instanceof ${o.expected}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${l}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`
          : `\u7121\u52B9\u306A\u5165\u529B: ${a}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${l}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u7121\u52B9\u306A\u5165\u529B: ${stringifyPrimitive(o.values[0])}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F`
          : `\u7121\u52B9\u306A\u9078\u629E: ${joinValues(o.values, "\u3001")}\u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      case "too_big": {
        let a = o.inclusive ? "\u4EE5\u4E0B\u3067\u3042\u308B" : "\u3088\u308A\u5C0F\u3055\u3044",
          c = getSizing(o.origin);
        return c
          ? `\u5927\u304D\u3059\u304E\u308B\u5024: ${o.origin ?? "\u5024"}\u306F${o.maximum.toString()}${c.unit ?? "\u8981\u7D20"}${a}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : `\u5927\u304D\u3059\u304E\u308B\u5024: ${o.origin ?? "\u5024"}\u306F${o.maximum.toString()}${a}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "too_small": {
        let a = o.inclusive ? "\u4EE5\u4E0A\u3067\u3042\u308B" : "\u3088\u308A\u5927\u304D\u3044",
          c = getSizing(o.origin);
        return c
          ? `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${o.origin}\u306F${o.minimum.toString()}${c.unit}${a}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${o.origin}\u306F${o.minimum.toString()}${a}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${a.prefix}"\u3067\u59CB\u307E\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : a.format === "ends_with"
            ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${a.suffix}"\u3067\u7D42\u308F\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
            : a.format === "includes"
              ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${a.includes}"\u3092\u542B\u3080\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
              : a.format === "regex"
                ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: \u30D1\u30BF\u30FC\u30F3${a.pattern}\u306B\u4E00\u81F4\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
                : `\u7121\u52B9\u306A${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u7121\u52B9\u306A\u6570\u5024: ${o.divisor}\u306E\u500D\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      case "unrecognized_keys":
        return `\u8A8D\u8B58\u3055\u308C\u3066\u3044\u306A\u3044\u30AD\u30FC${o.keys.length > 1 ? "\u7FA4" : ""}: ${joinValues(o.keys, "\u3001")}`;
      case "invalid_key":
        return `${o.origin}\u5185\u306E\u7121\u52B9\u306A\u30AD\u30FC`;
      case "invalid_union":
        return "\u7121\u52B9\u306A\u5165\u529B";
      case "invalid_element":
        return `${o.origin}\u5185\u306E\u7121\u52B9\u306A\u5024`;
      default:
        return "\u7121\u52B9\u306A\u5165\u529B";
    }
  };
}, "error");
function Ws() {
  return { localeError: $b() };
}
s(Ws, "default");
var Db = s(() => {
  let e = {
    string: {
      unit: "\u10E1\u10D8\u10DB\u10D1\u10DD\u10DA\u10DD",
      verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1",
    },
    file: {
      unit: "\u10D1\u10D0\u10D8\u10E2\u10D8",
      verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1",
    },
    array: {
      unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8",
      verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1",
    },
    set: {
      unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8",
      verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1",
    },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0",
      email:
        "\u10D4\u10DA-\u10E4\u10DD\u10E1\u10E2\u10D8\u10E1 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
      url: "URL",
      emoji: "\u10D4\u10DB\u10DD\u10EF\u10D8",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8-\u10D3\u10E0\u10DD",
      date: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8",
      time: "\u10D3\u10E0\u10DD",
      duration: "\u10EE\u10D0\u10DC\u10D2\u10E0\u10EB\u10DA\u10D8\u10D5\u10DD\u10D1\u10D0",
      ipv4: "IPv4 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
      ipv6: "IPv6 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
      cidrv4: "IPv4 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
      cidrv6: "IPv6 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
      base64:
        "base64-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      base64url:
        "base64url-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      json_string: "JSON \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      e164: "E.164 \u10DC\u10DD\u10DB\u10D4\u10E0\u10D8",
      jwt: "JWT",
      template_literal: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0",
    },
    i = {
      nan: "NaN",
      number: "\u10E0\u10D8\u10EA\u10EE\u10D5\u10D8",
      string: "\u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      boolean: "\u10D1\u10E3\u10DA\u10D4\u10D0\u10DC\u10D8",
      function: "\u10E4\u10E3\u10DC\u10E5\u10EA\u10D8\u10D0",
      array: "\u10DB\u10D0\u10E1\u10D8\u10D5\u10D8",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 instanceof ${o.expected}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${l}`
          : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${a}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${stringifyPrimitive(o.values[0])}`
          : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D0\u10E0\u10D8\u10D0\u10DC\u10E2\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8\u10D0 \u10D4\u10E0\u10D7-\u10D4\u10E0\u10D7\u10D8 ${joinValues(o.values, "|")}-\u10D3\u10D0\u10DC`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${o.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} ${c.verb} ${a}${o.maximum.toString()} ${c.unit}`
          : `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${o.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} \u10D8\u10E7\u10DD\u10E1 ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${o.origin} ${c.verb} ${a}${o.minimum.toString()} ${c.unit}`
          : `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${o.origin} \u10D8\u10E7\u10DD\u10E1 ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10EC\u10E7\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${a.prefix}"-\u10D8\u10D7`
          : a.format === "ends_with"
            ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10DB\u10D7\u10D0\u10D5\u10E0\u10D3\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${a.suffix}"-\u10D8\u10D7`
            : a.format === "includes"
              ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1 "${a.includes}"-\u10E1`
              : a.format === "regex"
                ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D4\u10E1\u10D0\u10D1\u10D0\u10DB\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 \u10E8\u10D0\u10D1\u10DA\u10DD\u10DC\u10E1 ${a.pattern}`
                : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E0\u10D8\u10EA\u10EE\u10D5\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 ${o.divisor}-\u10D8\u10E1 \u10EF\u10D4\u10E0\u10D0\u10D3\u10D8`;
      case "unrecognized_keys":
        return `\u10E3\u10EA\u10DC\u10DD\u10D1\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1${o.keys.length > 1 ? "\u10D4\u10D1\u10D8" : "\u10D8"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1\u10D8 ${o.origin}-\u10E8\u10D8`;
      case "invalid_union":
        return "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0";
      case "invalid_element":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0 ${o.origin}-\u10E8\u10D8`;
      default:
        return "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0";
    }
  };
}, "error");
function Fs() {
  return { localeError: Db() };
}
s(Fs, "default");
var Ub = s(() => {
  let e = {
    string: {
      unit: "\u178F\u17BD\u17A2\u1780\u17D2\u179F\u179A",
      verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793",
    },
    file: { unit: "\u1794\u17C3", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    array: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    set: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B",
      email:
        "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793\u17A2\u17CA\u17B8\u1798\u17C2\u179B",
      url: "URL",
      emoji: "\u179F\u1789\u17D2\u1789\u17B6\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime:
        "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 \u1793\u17B7\u1784\u1798\u17C9\u17C4\u1784 ISO",
      date: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 ISO",
      time: "\u1798\u17C9\u17C4\u1784 ISO",
      duration: "\u179A\u1799\u17C8\u1796\u17C1\u179B ISO",
      ipv4: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
      ipv6: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
      cidrv4: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
      cidrv6: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
      base64:
        "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64",
      base64url:
        "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64url",
      json_string: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A JSON",
      e164: "\u179B\u17C1\u1781 E.164",
      jwt: "JWT",
      template_literal:
        "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B",
    },
    i = {
      nan: "NaN",
      number: "\u179B\u17C1\u1781",
      array: "\u17A2\u17B6\u179A\u17C1 (Array)",
      null: "\u1782\u17D2\u1798\u17B6\u1793\u178F\u1798\u17D2\u179B\u17C3 (null)",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A instanceof ${o.expected} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${l}`
          : `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${a} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${stringifyPrimitive(o.values[0])}`
          : `\u1787\u1798\u17D2\u179A\u17BE\u179F\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1787\u17B6\u1798\u17BD\u1799\u1780\u17D2\u1793\u17BB\u1784\u1785\u17C6\u178E\u17C4\u1798 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${o.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${a} ${o.maximum.toString()} ${c.unit ?? "\u1792\u17B6\u178F\u17BB"}`
          : `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${o.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${a} ${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${o.origin} ${a} ${o.minimum.toString()} ${c.unit}`
          : `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${o.origin} ${a} ${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u178A\u17C4\u1799 "${a.prefix}"`
          : a.format === "ends_with"
            ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1794\u1789\u17D2\u1785\u1794\u17CB\u178A\u17C4\u1799 "${a.suffix}"`
            : a.format === "includes"
              ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1798\u17B6\u1793 "${a.includes}"`
              : a.format === "regex"
                ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1795\u17D2\u1782\u17BC\u1795\u17D2\u1782\u1784\u1793\u17B9\u1784\u1791\u1798\u17D2\u179A\u1784\u17CB\u178A\u17C2\u179B\u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB ${a.pattern}`
                : `\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u179B\u17C1\u1781\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1787\u17B6\u1796\u17A0\u17BB\u1782\u17BB\u178E\u1793\u17C3 ${o.divisor}`;
      case "unrecognized_keys":
        return `\u179A\u1780\u1783\u17BE\u1789\u179F\u17C4\u1798\u17B7\u1793\u179F\u17D2\u1782\u17B6\u179B\u17CB\u17D6 ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\u179F\u17C4\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${o.origin}`;
      case "invalid_union":
        return "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C";
      case "invalid_element":
        return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${o.origin}`;
      default:
        return "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C";
    }
  };
}, "error");
function bn() {
  return { localeError: Ub() };
}
s(bn, "default");
function qs() {
  return bn();
}
s(qs, "default");
var Nb = s(() => {
  let e = {
    string: { unit: "\uBB38\uC790", verb: "to have" },
    file: { unit: "\uBC14\uC774\uD2B8", verb: "to have" },
    array: { unit: "\uAC1C", verb: "to have" },
    set: { unit: "\uAC1C", verb: "to have" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\uC785\uB825",
      email: "\uC774\uBA54\uC77C \uC8FC\uC18C",
      url: "URL",
      emoji: "\uC774\uBAA8\uC9C0",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \uB0A0\uC9DC\uC2DC\uAC04",
      date: "ISO \uB0A0\uC9DC",
      time: "ISO \uC2DC\uAC04",
      duration: "ISO \uAE30\uAC04",
      ipv4: "IPv4 \uC8FC\uC18C",
      ipv6: "IPv6 \uC8FC\uC18C",
      cidrv4: "IPv4 \uBC94\uC704",
      cidrv6: "IPv6 \uBC94\uC704",
      base64: "base64 \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
      base64url: "base64url \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
      json_string: "JSON \uBB38\uC790\uC5F4",
      e164: "E.164 \uBC88\uD638",
      jwt: "JWT",
      template_literal: "\uC785\uB825",
    },
    i = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 instanceof ${o.expected}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${l}\uC785\uB2C8\uB2E4`
          : `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 ${a}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${l}\uC785\uB2C8\uB2E4`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\uC798\uBABB\uB41C \uC785\uB825: \uAC12\uC740 ${stringifyPrimitive(o.values[0])} \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4`
          : `\uC798\uBABB\uB41C \uC635\uC158: ${joinValues(o.values, "\uB610\uB294 ")} \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
      case "too_big": {
        let a = o.inclusive ? "\uC774\uD558" : "\uBBF8\uB9CC",
          c =
            a === "\uBBF8\uB9CC"
              ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4"
              : "\uC5EC\uC57C \uD569\uB2C8\uB2E4",
          l = getSizing(o.origin),
          p = l?.unit ?? "\uC694\uC18C";
        return l
          ? `${o.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${o.maximum.toString()}${p} ${a}${c}`
          : `${o.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${o.maximum.toString()} ${a}${c}`;
      }
      case "too_small": {
        let a = o.inclusive ? "\uC774\uC0C1" : "\uCD08\uACFC",
          c =
            a === "\uC774\uC0C1"
              ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4"
              : "\uC5EC\uC57C \uD569\uB2C8\uB2E4",
          l = getSizing(o.origin),
          p = l?.unit ?? "\uC694\uC18C";
        return l
          ? `${o.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${o.minimum.toString()}${p} ${a}${c}`
          : `${o.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${o.minimum.toString()} ${a}${c}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${a.prefix}"(\uC73C)\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4`
          : a.format === "ends_with"
            ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${a.suffix}"(\uC73C)\uB85C \uB05D\uB098\uC57C \uD569\uB2C8\uB2E4`
            : a.format === "includes"
              ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${a.includes}"\uC744(\uB97C) \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4`
              : a.format === "regex"
                ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: \uC815\uADDC\uC2DD ${a.pattern} \uD328\uD134\uACFC \uC77C\uCE58\uD574\uC57C \uD569\uB2C8\uB2E4`
                : `\uC798\uBABB\uB41C ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\uC798\uBABB\uB41C \uC22B\uC790: ${o.divisor}\uC758 \uBC30\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
      case "unrecognized_keys":
        return `\uC778\uC2DD\uD560 \uC218 \uC5C6\uB294 \uD0A4: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\uC798\uBABB\uB41C \uD0A4: ${o.origin}`;
      case "invalid_union":
        return "\uC798\uBABB\uB41C \uC785\uB825";
      case "invalid_element":
        return `\uC798\uBABB\uB41C \uAC12: ${o.origin}`;
      default:
        return "\uC798\uBABB\uB41C \uC785\uB825";
    }
  };
}, "error");
function Vs() {
  return { localeError: Nb() };
}
s(Vs, "default");
var vn = s((e) => e.charAt(0).toUpperCase() + e.slice(1), "capitalizeFirstCharacter");
function getUnitTypeFromNumber(e) {
  let t = Math.abs(e),
    r = t % 10,
    i = t % 100;
  return (i >= 11 && i <= 19) || r === 0 ? "many" : r === 1 ? "one" : "few";
}
s(getUnitTypeFromNumber, "getUnitTypeFromNumber");
var Zb = s(() => {
  let e = {
    string: {
      unit: { one: "simbolis", few: "simboliai", many: "simboli\u0173" },
      verb: {
        smaller: {
          inclusive: "turi b\u016Bti ne ilgesn\u0117 kaip",
          notInclusive: "turi b\u016Bti trumpesn\u0117 kaip",
        },
        bigger: {
          inclusive: "turi b\u016Bti ne trumpesn\u0117 kaip",
          notInclusive: "turi b\u016Bti ilgesn\u0117 kaip",
        },
      },
    },
    file: {
      unit: { one: "baitas", few: "baitai", many: "bait\u0173" },
      verb: {
        smaller: {
          inclusive: "turi b\u016Bti ne didesnis kaip",
          notInclusive: "turi b\u016Bti ma\u017Eesnis kaip",
        },
        bigger: {
          inclusive: "turi b\u016Bti ne ma\u017Eesnis kaip",
          notInclusive: "turi b\u016Bti didesnis kaip",
        },
      },
    },
    array: {
      unit: { one: "element\u0105", few: "elementus", many: "element\u0173" },
      verb: {
        smaller: {
          inclusive: "turi tur\u0117ti ne daugiau kaip",
          notInclusive: "turi tur\u0117ti ma\u017Eiau kaip",
        },
        bigger: {
          inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
          notInclusive: "turi tur\u0117ti daugiau kaip",
        },
      },
    },
    set: {
      unit: { one: "element\u0105", few: "elementus", many: "element\u0173" },
      verb: {
        smaller: {
          inclusive: "turi tur\u0117ti ne daugiau kaip",
          notInclusive: "turi tur\u0117ti ma\u017Eiau kaip",
        },
        bigger: {
          inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
          notInclusive: "turi tur\u0117ti daugiau kaip",
        },
      },
    },
  };
  function getSizing(o, a, c, l) {
    let p = e[o] ?? null;
    return p === null ? p : { unit: p.unit[a], verb: p.verb[l][c ? "inclusive" : "notInclusive"] };
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u012Fvestis",
      email: "el. pa\u0161to adresas",
      url: "URL",
      emoji: "jaustukas",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO data ir laikas",
      date: "ISO data",
      time: "ISO laikas",
      duration: "ISO trukm\u0117",
      ipv4: "IPv4 adresas",
      ipv6: "IPv6 adresas",
      cidrv4: "IPv4 tinklo prefiksas (CIDR)",
      cidrv6: "IPv6 tinklo prefiksas (CIDR)",
      base64: "base64 u\u017Ekoduota eilut\u0117",
      base64url: "base64url u\u017Ekoduota eilut\u0117",
      json_string: "JSON eilut\u0117",
      e164: "E.164 numeris",
      jwt: "JWT",
      template_literal: "\u012Fvestis",
    },
    i = {
      nan: "NaN",
      number: "skai\u010Dius",
      bigint: "sveikasis skai\u010Dius",
      string: "eilut\u0117",
      boolean: "login\u0117 reik\u0161m\u0117",
      undefined: "neapibr\u0117\u017Eta reik\u0161m\u0117",
      function: "funkcija",
      symbol: "simbolis",
      array: "masyvas",
      object: "objektas",
      null: "nulin\u0117 reik\u0161m\u0117",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Gautas tipas ${l}, o tik\u0117tasi - instanceof ${o.expected}`
          : `Gautas tipas ${l}, o tik\u0117tasi - ${a}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Privalo b\u016Bti ${stringifyPrimitive(o.values[0])}`
          : `Privalo b\u016Bti vienas i\u0161 ${joinValues(o.values, "|")} pasirinkim\u0173`;
      case "too_big": {
        let a = i[o.origin] ?? o.origin,
          c = getSizing(o.origin, getUnitTypeFromNumber(Number(o.maximum)), o.inclusive ?? !1, "smaller");
        if (c?.verb)
          return `${vn(a ?? o.origin ?? "reik\u0161m\u0117")} ${c.verb} ${o.maximum.toString()} ${c.unit ?? "element\u0173"}`;
        let l = o.inclusive ? "ne didesnis kaip" : "ma\u017Eesnis kaip";
        return `${vn(a ?? o.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${l} ${o.maximum.toString()} ${c?.unit}`;
      }
      case "too_small": {
        let a = i[o.origin] ?? o.origin,
          c = getSizing(o.origin, getUnitTypeFromNumber(Number(o.minimum)), o.inclusive ?? !1, "bigger");
        if (c?.verb)
          return `${vn(a ?? o.origin ?? "reik\u0161m\u0117")} ${c.verb} ${o.minimum.toString()} ${c.unit ?? "element\u0173"}`;
        let l = o.inclusive ? "ne ma\u017Eesnis kaip" : "didesnis kaip";
        return `${vn(a ?? o.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${l} ${o.minimum.toString()} ${c?.unit}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Eilut\u0117 privalo prasid\u0117ti "${a.prefix}"`
          : a.format === "ends_with"
            ? `Eilut\u0117 privalo pasibaigti "${a.suffix}"`
            : a.format === "includes"
              ? `Eilut\u0117 privalo \u012Ftraukti "${a.includes}"`
              : a.format === "regex"
                ? `Eilut\u0117 privalo atitikti ${a.pattern}`
                : `Neteisingas ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Skai\u010Dius privalo b\u016Bti ${o.divisor} kartotinis.`;
      case "unrecognized_keys":
        return `Neatpa\u017Eint${o.keys.length > 1 ? "i" : "as"} rakt${o.keys.length > 1 ? "ai" : "as"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return "Rastas klaidingas raktas";
      case "invalid_union":
        return "Klaidinga \u012Fvestis";
      case "invalid_element": {
        let a = i[o.origin] ?? o.origin;
        return `${vn(a ?? o.origin ?? "reik\u0161m\u0117")} turi klaiding\u0105 \u012Fvest\u012F`;
      }
      default:
        return "Klaidinga \u012Fvestis";
    }
  };
}, "error");
function Gs() {
  return { localeError: Zb() };
}
s(Gs, "default");
var jb = s(() => {
  let e = {
    string: {
      unit: "\u0437\u043D\u0430\u0446\u0438",
      verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442",
    },
    file: {
      unit: "\u0431\u0430\u0458\u0442\u0438",
      verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442",
    },
    array: {
      unit: "\u0441\u0442\u0430\u0432\u043A\u0438",
      verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442",
    },
    set: {
      unit: "\u0441\u0442\u0430\u0432\u043A\u0438",
      verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442",
    },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0432\u043D\u0435\u0441",
      email:
        "\u0430\u0434\u0440\u0435\u0441\u0430 \u043D\u0430 \u0435-\u043F\u043E\u0448\u0442\u0430",
      url: "URL",
      emoji: "\u0435\u043C\u043E\u045F\u0438",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0434\u0430\u0442\u0443\u043C \u0438 \u0432\u0440\u0435\u043C\u0435",
      date: "ISO \u0434\u0430\u0442\u0443\u043C",
      time: "ISO \u0432\u0440\u0435\u043C\u0435",
      duration: "ISO \u0432\u0440\u0435\u043C\u0435\u0442\u0440\u0430\u0435\u045A\u0435",
      ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441\u0430",
      ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441\u0430",
      cidrv4: "IPv4 \u043E\u043F\u0441\u0435\u0433",
      cidrv6: "IPv6 \u043E\u043F\u0441\u0435\u0433",
      base64:
        "base64-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
      base64url:
        "base64url-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
      json_string: "JSON \u043D\u0438\u0437\u0430",
      e164: "E.164 \u0431\u0440\u043E\u0458",
      jwt: "JWT",
      template_literal: "\u0432\u043D\u0435\u0441",
    },
    i = { nan: "NaN", number: "\u0431\u0440\u043E\u0458", array: "\u043D\u0438\u0437\u0430" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 instanceof ${o.expected}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${l}`
          : `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${a}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Invalid input: expected ${stringifyPrimitive(o.values[0])}`
          : `\u0413\u0440\u0435\u0448\u0430\u043D\u0430 \u043E\u043F\u0446\u0438\u0458\u0430: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 \u0435\u0434\u043D\u0430 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${o.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0438\u043C\u0430 ${a}${o.maximum.toString()} ${c.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0438"}`
          : `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${o.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0431\u0438\u0434\u0435 ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${o.origin} \u0434\u0430 \u0438\u043C\u0430 ${a}${o.minimum.toString()} ${c.unit}`
          : `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${o.origin} \u0434\u0430 \u0431\u0438\u0434\u0435 ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u043D\u0443\u0432\u0430 \u0441\u043E "${a.prefix}"`
          : a.format === "ends_with"
            ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u0432\u0440\u0448\u0443\u0432\u0430 \u0441\u043E "${a.suffix}"`
            : a.format === "includes"
              ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0432\u043A\u043B\u0443\u0447\u0443\u0432\u0430 "${a.includes}"`
              : a.format === "regex"
                ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u043E\u0434\u0433\u043E\u0430\u0440\u0430 \u043D\u0430 \u043F\u0430\u0442\u0435\u0440\u043D\u043E\u0442 ${a.pattern}`
                : `Invalid ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u0431\u0440\u043E\u0458: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u0434\u0435\u043B\u0438\u0432 \u0441\u043E ${o.divisor}`;
      case "unrecognized_keys":
        return `${o.keys.length > 1 ? "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D\u0438 \u043A\u043B\u0443\u0447\u0435\u0432\u0438" : "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D \u043A\u043B\u0443\u0447"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u043A\u043B\u0443\u0447 \u0432\u043E ${o.origin}`;
      case "invalid_union":
        return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441";
      case "invalid_element":
        return `\u0413\u0440\u0435\u0448\u043D\u0430 \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442 \u0432\u043E ${o.origin}`;
      default:
        return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441";
    }
  };
}, "error");
function Ks() {
  return { localeError: jb() };
}
s(Ks, "default");
var Bb = s(() => {
  let e = {
    string: { unit: "aksara", verb: "mempunyai" },
    file: { unit: "bait", verb: "mempunyai" },
    array: { unit: "elemen", verb: "mempunyai" },
    set: { unit: "elemen", verb: "mempunyai" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "alamat e-mel",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "tarikh masa ISO",
      date: "tarikh ISO",
      time: "masa ISO",
      duration: "tempoh ISO",
      ipv4: "alamat IPv4",
      ipv6: "alamat IPv6",
      cidrv4: "julat IPv4",
      cidrv6: "julat IPv6",
      base64: "string dikodkan base64",
      base64url: "string dikodkan base64url",
      json_string: "string JSON",
      e164: "nombor E.164",
      jwt: "JWT",
      template_literal: "input",
    },
    i = { nan: "NaN", number: "nombor" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Input tidak sah: dijangka instanceof ${o.expected}, diterima ${l}`
          : `Input tidak sah: dijangka ${a}, diterima ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Input tidak sah: dijangka ${stringifyPrimitive(o.values[0])}`
          : `Pilihan tidak sah: dijangka salah satu daripada ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Terlalu besar: dijangka ${o.origin ?? "nilai"} ${c.verb} ${a}${o.maximum.toString()} ${c.unit ?? "elemen"}`
          : `Terlalu besar: dijangka ${o.origin ?? "nilai"} adalah ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Terlalu kecil: dijangka ${o.origin} ${c.verb} ${a}${o.minimum.toString()} ${c.unit}`
          : `Terlalu kecil: dijangka ${o.origin} adalah ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `String tidak sah: mesti bermula dengan "${a.prefix}"`
          : a.format === "ends_with"
            ? `String tidak sah: mesti berakhir dengan "${a.suffix}"`
            : a.format === "includes"
              ? `String tidak sah: mesti mengandungi "${a.includes}"`
              : a.format === "regex"
                ? `String tidak sah: mesti sepadan dengan corak ${a.pattern}`
                : `${r[a.format] ?? o.format} tidak sah`;
      }
      case "not_multiple_of":
        return `Nombor tidak sah: perlu gandaan ${o.divisor}`;
      case "unrecognized_keys":
        return `Kunci tidak dikenali: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Kunci tidak sah dalam ${o.origin}`;
      case "invalid_union":
        return "Input tidak sah";
      case "invalid_element":
        return `Nilai tidak sah dalam ${o.origin}`;
      default:
        return "Input tidak sah";
    }
  };
}, "error");
function Hs() {
  return { localeError: Bb() };
}
s(Hs, "default");
var Lb = s(() => {
  let e = {
    string: { unit: "tekens", verb: "heeft" },
    file: { unit: "bytes", verb: "heeft" },
    array: { unit: "elementen", verb: "heeft" },
    set: { unit: "elementen", verb: "heeft" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "invoer",
      email: "emailadres",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datum en tijd",
      date: "ISO datum",
      time: "ISO tijd",
      duration: "ISO duur",
      ipv4: "IPv4-adres",
      ipv6: "IPv6-adres",
      cidrv4: "IPv4-bereik",
      cidrv6: "IPv6-bereik",
      base64: "base64-gecodeerde tekst",
      base64url: "base64 URL-gecodeerde tekst",
      json_string: "JSON string",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "invoer",
    },
    i = { nan: "NaN", number: "getal" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ongeldige invoer: verwacht instanceof ${o.expected}, ontving ${l}`
          : `Ongeldige invoer: verwacht ${a}, ontving ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ongeldige invoer: verwacht ${stringifyPrimitive(o.values[0])}`
          : `Ongeldige optie: verwacht \xE9\xE9n van ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin),
          l = o.origin === "date" ? "laat" : o.origin === "string" ? "lang" : "groot";
        return c
          ? `Te ${l}: verwacht dat ${o.origin ?? "waarde"} ${a}${o.maximum.toString()} ${c.unit ?? "elementen"} ${c.verb}`
          : `Te ${l}: verwacht dat ${o.origin ?? "waarde"} ${a}${o.maximum.toString()} is`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin),
          l = o.origin === "date" ? "vroeg" : o.origin === "string" ? "kort" : "klein";
        return c
          ? `Te ${l}: verwacht dat ${o.origin} ${a}${o.minimum.toString()} ${c.unit} ${c.verb}`
          : `Te ${l}: verwacht dat ${o.origin} ${a}${o.minimum.toString()} is`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Ongeldige tekst: moet met "${a.prefix}" beginnen`
          : a.format === "ends_with"
            ? `Ongeldige tekst: moet op "${a.suffix}" eindigen`
            : a.format === "includes"
              ? `Ongeldige tekst: moet "${a.includes}" bevatten`
              : a.format === "regex"
                ? `Ongeldige tekst: moet overeenkomen met patroon ${a.pattern}`
                : `Ongeldig: ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Ongeldig getal: moet een veelvoud van ${o.divisor} zijn`;
      case "unrecognized_keys":
        return `Onbekende key${o.keys.length > 1 ? "s" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Ongeldige key in ${o.origin}`;
      case "invalid_union":
        return "Ongeldige invoer";
      case "invalid_element":
        return `Ongeldige waarde in ${o.origin}`;
      default:
        return "Ongeldige invoer";
    }
  };
}, "error");
function Js() {
  return { localeError: Lb() };
}
s(Js, "default");
var Wb = s(() => {
  let e = {
    string: { unit: "tegn", verb: "\xE5 ha" },
    file: { unit: "bytes", verb: "\xE5 ha" },
    array: { unit: "elementer", verb: "\xE5 inneholde" },
    set: { unit: "elementer", verb: "\xE5 inneholde" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "e-postadresse",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO dato- og klokkeslett",
      date: "ISO-dato",
      time: "ISO-klokkeslett",
      duration: "ISO-varighet",
      ipv4: "IPv4-omr\xE5de",
      ipv6: "IPv6-omr\xE5de",
      cidrv4: "IPv4-spekter",
      cidrv6: "IPv6-spekter",
      base64: "base64-enkodet streng",
      base64url: "base64url-enkodet streng",
      json_string: "JSON-streng",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "input",
    },
    i = { nan: "NaN", number: "tall", array: "liste" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ugyldig input: forventet instanceof ${o.expected}, fikk ${l}`
          : `Ugyldig input: forventet ${a}, fikk ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ugyldig verdi: forventet ${stringifyPrimitive(o.values[0])}`
          : `Ugyldig valg: forventet en av ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `For stor(t): forventet ${o.origin ?? "value"} til \xE5 ha ${a}${o.maximum.toString()} ${c.unit ?? "elementer"}`
          : `For stor(t): forventet ${o.origin ?? "value"} til \xE5 ha ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `For lite(n): forventet ${o.origin} til \xE5 ha ${a}${o.minimum.toString()} ${c.unit}`
          : `For lite(n): forventet ${o.origin} til \xE5 ha ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Ugyldig streng: m\xE5 starte med "${a.prefix}"`
          : a.format === "ends_with"
            ? `Ugyldig streng: m\xE5 ende med "${a.suffix}"`
            : a.format === "includes"
              ? `Ugyldig streng: m\xE5 inneholde "${a.includes}"`
              : a.format === "regex"
                ? `Ugyldig streng: m\xE5 matche m\xF8nsteret ${a.pattern}`
                : `Ugyldig ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Ugyldig tall: m\xE5 v\xE6re et multiplum av ${o.divisor}`;
      case "unrecognized_keys":
        return `${o.keys.length > 1 ? "Ukjente n\xF8kler" : "Ukjent n\xF8kkel"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Ugyldig n\xF8kkel i ${o.origin}`;
      case "invalid_union":
        return "Ugyldig input";
      case "invalid_element":
        return `Ugyldig verdi i ${o.origin}`;
      default:
        return "Ugyldig input";
    }
  };
}, "error");
function Ys() {
  return { localeError: Wb() };
}
s(Ys, "default");
var Fb = s(() => {
  let e = {
    string: { unit: "harf", verb: "olmal\u0131d\u0131r" },
    file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
    array: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
    set: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "giren",
      email: "epostag\xE2h",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO heng\xE2m\u0131",
      date: "ISO tarihi",
      time: "ISO zaman\u0131",
      duration: "ISO m\xFCddeti",
      ipv4: "IPv4 ni\u015F\xE2n\u0131",
      ipv6: "IPv6 ni\u015F\xE2n\u0131",
      cidrv4: "IPv4 menzili",
      cidrv6: "IPv6 menzili",
      base64: "base64-\u015Fifreli metin",
      base64url: "base64url-\u015Fifreli metin",
      json_string: "JSON metin",
      e164: "E.164 say\u0131s\u0131",
      jwt: "JWT",
      template_literal: "giren",
    },
    i = { nan: "NaN", number: "numara", array: "saf", null: "gayb" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `F\xE2sit giren: umulan instanceof ${o.expected}, al\u0131nan ${l}`
          : `F\xE2sit giren: umulan ${a}, al\u0131nan ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `F\xE2sit giren: umulan ${stringifyPrimitive(o.values[0])}`
          : `F\xE2sit tercih: m\xFBteberler ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Fazla b\xFCy\xFCk: ${o.origin ?? "value"}, ${a}${o.maximum.toString()} ${c.unit ?? "elements"} sahip olmal\u0131yd\u0131.`
          : `Fazla b\xFCy\xFCk: ${o.origin ?? "value"}, ${a}${o.maximum.toString()} olmal\u0131yd\u0131.`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Fazla k\xFC\xE7\xFCk: ${o.origin}, ${a}${o.minimum.toString()} ${c.unit} sahip olmal\u0131yd\u0131.`
          : `Fazla k\xFC\xE7\xFCk: ${o.origin}, ${a}${o.minimum.toString()} olmal\u0131yd\u0131.`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `F\xE2sit metin: "${a.prefix}" ile ba\u015Flamal\u0131.`
          : a.format === "ends_with"
            ? `F\xE2sit metin: "${a.suffix}" ile bitmeli.`
            : a.format === "includes"
              ? `F\xE2sit metin: "${a.includes}" ihtiv\xE2 etmeli.`
              : a.format === "regex"
                ? `F\xE2sit metin: ${a.pattern} nak\u015F\u0131na uymal\u0131.`
                : `F\xE2sit ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `F\xE2sit say\u0131: ${o.divisor} kat\u0131 olmal\u0131yd\u0131.`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan anahtar ${o.keys.length > 1 ? "s" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `${o.origin} i\xE7in tan\u0131nmayan anahtar var.`;
      case "invalid_union":
        return "Giren tan\u0131namad\u0131.";
      case "invalid_element":
        return `${o.origin} i\xE7in tan\u0131nmayan k\u0131ymet var.`;
      default:
        return "K\u0131ymet tan\u0131namad\u0131.";
    }
  };
}, "error");
function Xs() {
  return { localeError: Fb() };
}
s(Xs, "default");
var qb = s(() => {
  let e = {
    string: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
    file: { unit: "\u0628\u0627\u06CC\u067C\u0633", verb: "\u0648\u0644\u0631\u064A" },
    array: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
    set: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0648\u0631\u0648\u062F\u064A",
      email: "\u0628\u0631\u06CC\u069A\u0646\u0627\u0644\u06CC\u06A9",
      url: "\u06CC\u0648 \u0622\u0631 \u0627\u0644",
      emoji: "\u0627\u06CC\u0645\u0648\u062C\u064A",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u0646\u06CC\u067C\u0647 \u0627\u0648 \u0648\u062E\u062A",
      date: "\u0646\u06D0\u067C\u0647",
      time: "\u0648\u062E\u062A",
      duration: "\u0645\u0648\u062F\u0647",
      ipv4: "\u062F IPv4 \u067E\u062A\u0647",
      ipv6: "\u062F IPv6 \u067E\u062A\u0647",
      cidrv4: "\u062F IPv4 \u0633\u0627\u062D\u0647",
      cidrv6: "\u062F IPv6 \u0633\u0627\u062D\u0647",
      base64: "base64-encoded \u0645\u062A\u0646",
      base64url: "base64url-encoded \u0645\u062A\u0646",
      json_string: "JSON \u0645\u062A\u0646",
      e164: "\u062F E.164 \u0634\u0645\u06D0\u0631\u0647",
      jwt: "JWT",
      template_literal: "\u0648\u0631\u0648\u062F\u064A",
    },
    i = { nan: "NaN", number: "\u0639\u062F\u062F", array: "\u0627\u0631\u06D0" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F instanceof ${o.expected} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${l} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`
          : `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${a} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${l} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${stringifyPrimitive(o.values[0])} \u0648\u0627\u06CC`
          : `\u0646\u0627\u0633\u0645 \u0627\u0646\u062A\u062E\u0627\u0628: \u0628\u0627\u06CC\u062F \u06CC\u0648 \u0644\u0647 ${joinValues(o.values, "|")} \u0685\u062E\u0647 \u0648\u0627\u06CC`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${o.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${a}${o.maximum.toString()} ${c.unit ?? "\u0639\u0646\u0635\u0631\u0648\u0646\u0647"} \u0648\u0644\u0631\u064A`
          : `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${o.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${a}${o.maximum.toString()} \u0648\u064A`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${o.origin} \u0628\u0627\u06CC\u062F ${a}${o.minimum.toString()} ${c.unit} \u0648\u0644\u0631\u064A`
          : `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${o.origin} \u0628\u0627\u06CC\u062F ${a}${o.minimum.toString()} \u0648\u064A`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${a.prefix}" \u0633\u0631\u0647 \u067E\u06CC\u0644 \u0634\u064A`
          : a.format === "ends_with"
            ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${a.suffix}" \u0633\u0631\u0647 \u067E\u0627\u06CC \u062A\u0647 \u0648\u0631\u0633\u064A\u0696\u064A`
            : a.format === "includes"
              ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F "${a.includes}" \u0648\u0644\u0631\u064A`
              : a.format === "regex"
                ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F ${a.pattern} \u0633\u0631\u0647 \u0645\u0637\u0627\u0628\u0642\u062A \u0648\u0644\u0631\u064A`
                : `${r[a.format] ?? o.format} \u0646\u0627\u0633\u0645 \u062F\u06CC`;
      }
      case "not_multiple_of":
        return `\u0646\u0627\u0633\u0645 \u0639\u062F\u062F: \u0628\u0627\u06CC\u062F \u062F ${o.divisor} \u0645\u0636\u0631\u0628 \u0648\u064A`;
      case "unrecognized_keys":
        return `\u0646\u0627\u0633\u0645 ${o.keys.length > 1 ? "\u06A9\u0644\u06CC\u0689\u0648\u0646\u0647" : "\u06A9\u0644\u06CC\u0689"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\u0646\u0627\u0633\u0645 \u06A9\u0644\u06CC\u0689 \u067E\u0647 ${o.origin} \u06A9\u06D0`;
      case "invalid_union":
        return "\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A";
      case "invalid_element":
        return `\u0646\u0627\u0633\u0645 \u0639\u0646\u0635\u0631 \u067E\u0647 ${o.origin} \u06A9\u06D0`;
      default:
        return "\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A";
    }
  };
}, "error");
function Qs() {
  return { localeError: qb() };
}
s(Qs, "default");
var Vb = s(() => {
  let e = {
    string: { unit: "znak\xF3w", verb: "mie\u0107" },
    file: { unit: "bajt\xF3w", verb: "mie\u0107" },
    array: { unit: "element\xF3w", verb: "mie\u0107" },
    set: { unit: "element\xF3w", verb: "mie\u0107" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "wyra\u017Cenie",
      email: "adres email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data i godzina w formacie ISO",
      date: "data w formacie ISO",
      time: "godzina w formacie ISO",
      duration: "czas trwania ISO",
      ipv4: "adres IPv4",
      ipv6: "adres IPv6",
      cidrv4: "zakres IPv4",
      cidrv6: "zakres IPv6",
      base64: "ci\u0105g znak\xF3w zakodowany w formacie base64",
      base64url: "ci\u0105g znak\xF3w zakodowany w formacie base64url",
      json_string: "ci\u0105g znak\xF3w w formacie JSON",
      e164: "liczba E.164",
      jwt: "JWT",
      template_literal: "wej\u015Bcie",
    },
    i = { nan: "NaN", number: "liczba", array: "tablica" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano instanceof ${o.expected}, otrzymano ${l}`
          : `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${a}, otrzymano ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${stringifyPrimitive(o.values[0])}`
          : `Nieprawid\u0142owa opcja: oczekiwano jednej z warto\u015Bci ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Za du\u017Ca warto\u015B\u0107: oczekiwano, \u017Ce ${o.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${a}${o.maximum.toString()} ${c.unit ?? "element\xF3w"}`
          : `Zbyt du\u017C(y/a/e): oczekiwano, \u017Ce ${o.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Za ma\u0142a warto\u015B\u0107: oczekiwano, \u017Ce ${o.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${a}${o.minimum.toString()} ${c.unit ?? "element\xF3w"}`
          : `Zbyt ma\u0142(y/a/e): oczekiwano, \u017Ce ${o.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zaczyna\u0107 si\u0119 od "${a.prefix}"`
          : a.format === "ends_with"
            ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi ko\u0144czy\u0107 si\u0119 na "${a.suffix}"`
            : a.format === "includes"
              ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zawiera\u0107 "${a.includes}"`
              : a.format === "regex"
                ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi odpowiada\u0107 wzorcowi ${a.pattern}`
                : `Nieprawid\u0142ow(y/a/e) ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Nieprawid\u0142owa liczba: musi by\u0107 wielokrotno\u015Bci\u0105 ${o.divisor}`;
      case "unrecognized_keys":
        return `Nierozpoznane klucze${o.keys.length > 1 ? "s" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Nieprawid\u0142owy klucz w ${o.origin}`;
      case "invalid_union":
        return "Nieprawid\u0142owe dane wej\u015Bciowe";
      case "invalid_element":
        return `Nieprawid\u0142owa warto\u015B\u0107 w ${o.origin}`;
      default:
        return "Nieprawid\u0142owe dane wej\u015Bciowe";
    }
  };
}, "error");
function ec() {
  return { localeError: Vb() };
}
s(ec, "default");
var Gb = s(() => {
  let e = {
    string: { unit: "caracteres", verb: "ter" },
    file: { unit: "bytes", verb: "ter" },
    array: { unit: "itens", verb: "ter" },
    set: { unit: "itens", verb: "ter" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "padr\xE3o",
      email: "endere\xE7o de e-mail",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data e hora ISO",
      date: "data ISO",
      time: "hora ISO",
      duration: "dura\xE7\xE3o ISO",
      ipv4: "endere\xE7o IPv4",
      ipv6: "endere\xE7o IPv6",
      cidrv4: "faixa de IPv4",
      cidrv6: "faixa de IPv6",
      base64: "texto codificado em base64",
      base64url: "URL codificada em base64",
      json_string: "texto JSON",
      e164: "n\xFAmero E.164",
      jwt: "JWT",
      template_literal: "entrada",
    },
    i = { nan: "NaN", number: "n\xFAmero", null: "nulo" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Tipo inv\xE1lido: esperado instanceof ${o.expected}, recebido ${l}`
          : `Tipo inv\xE1lido: esperado ${a}, recebido ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Entrada inv\xE1lida: esperado ${stringifyPrimitive(o.values[0])}`
          : `Op\xE7\xE3o inv\xE1lida: esperada uma das ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Muito grande: esperado que ${o.origin ?? "valor"} tivesse ${a}${o.maximum.toString()} ${c.unit ?? "elementos"}`
          : `Muito grande: esperado que ${o.origin ?? "valor"} fosse ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Muito pequeno: esperado que ${o.origin} tivesse ${a}${o.minimum.toString()} ${c.unit}`
          : `Muito pequeno: esperado que ${o.origin} fosse ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Texto inv\xE1lido: deve come\xE7ar com "${a.prefix}"`
          : a.format === "ends_with"
            ? `Texto inv\xE1lido: deve terminar com "${a.suffix}"`
            : a.format === "includes"
              ? `Texto inv\xE1lido: deve incluir "${a.includes}"`
              : a.format === "regex"
                ? `Texto inv\xE1lido: deve corresponder ao padr\xE3o ${a.pattern}`
                : `${r[a.format] ?? o.format} inv\xE1lido`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE1lido: deve ser m\xFAltiplo de ${o.divisor}`;
      case "unrecognized_keys":
        return `Chave${o.keys.length > 1 ? "s" : ""} desconhecida${o.keys.length > 1 ? "s" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Chave inv\xE1lida em ${o.origin}`;
      case "invalid_union":
        return "Entrada inv\xE1lida";
      case "invalid_element":
        return `Valor inv\xE1lido em ${o.origin}`;
      default:
        return "Campo inv\xE1lido";
    }
  };
}, "error");
function tc() {
  return { localeError: Gb() };
}
s(tc, "default");
function getRussianPlural(e, t, r, i) {
  let o = Math.abs(e),
    a = o % 10,
    c = o % 100;
  return c >= 11 && c <= 19 ? i : a === 1 ? t : a >= 2 && a <= 4 ? r : i;
}
s(getRussianPlural, "getRussianPlural");
var Kb = s(() => {
  let e = {
    string: {
      unit: {
        one: "\u0441\u0438\u043C\u0432\u043E\u043B",
        few: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430",
        many: "\u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432",
      },
      verb: "\u0438\u043C\u0435\u0442\u044C",
    },
    file: {
      unit: {
        one: "\u0431\u0430\u0439\u0442",
        few: "\u0431\u0430\u0439\u0442\u0430",
        many: "\u0431\u0430\u0439\u0442",
      },
      verb: "\u0438\u043C\u0435\u0442\u044C",
    },
    array: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432",
      },
      verb: "\u0438\u043C\u0435\u0442\u044C",
    },
    set: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432",
      },
      verb: "\u0438\u043C\u0435\u0442\u044C",
    },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0432\u0432\u043E\u0434",
      email: "email \u0430\u0434\u0440\u0435\u0441",
      url: "URL",
      emoji: "\u044D\u043C\u043E\u0434\u0437\u0438",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0434\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F",
      date: "ISO \u0434\u0430\u0442\u0430",
      time: "ISO \u0432\u0440\u0435\u043C\u044F",
      duration: "ISO \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
      ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
      ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
      cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      base64:
        "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64",
      base64url:
        "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64url",
      json_string: "JSON \u0441\u0442\u0440\u043E\u043A\u0430",
      e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
      jwt: "JWT",
      template_literal: "\u0432\u0432\u043E\u0434",
    },
    i = {
      nan: "NaN",
      number: "\u0447\u0438\u0441\u043B\u043E",
      array: "\u043C\u0430\u0441\u0441\u0438\u0432",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C instanceof ${o.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${l}`
          : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${a}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${stringifyPrimitive(o.values[0])}`
          : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0434\u043D\u043E \u0438\u0437 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.maximum),
            p = getRussianPlural(l, c.unit.one, c.unit.few, c.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${a}${o.maximum.toString()} ${p}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.minimum),
            p = getRussianPlural(l, c.unit.one, c.unit.few, c.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${o.origin} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${a}${o.minimum.toString()} ${p}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${o.origin} \u0431\u0443\u0434\u0435\u0442 ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u043D\u0430\u0447\u0438\u043D\u0430\u0442\u044C\u0441\u044F \u0441 "${a.prefix}"`
          : a.format === "ends_with"
            ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u0442\u044C\u0441\u044F \u043D\u0430 "${a.suffix}"`
            : a.format === "includes"
              ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C "${a.includes}"`
              : a.format === "regex"
                ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${a.pattern}`
                : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E: \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${o.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D\u043D${o.keys.length > 1 ? "\u044B\u0435" : "\u044B\u0439"} \u043A\u043B\u044E\u0447${o.keys.length > 1 ? "\u0438" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043A\u043B\u044E\u0447 \u0432 ${o.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435";
      case "invalid_element":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432 ${o.origin}`;
      default:
        return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435";
    }
  };
}, "error");
function nc() {
  return { localeError: Kb() };
}
s(nc, "default");
var Hb = s(() => {
  let e = {
    string: { unit: "znakov", verb: "imeti" },
    file: { unit: "bajtov", verb: "imeti" },
    array: { unit: "elementov", verb: "imeti" },
    set: { unit: "elementov", verb: "imeti" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "vnos",
      email: "e-po\u0161tni naslov",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datum in \u010Das",
      date: "ISO datum",
      time: "ISO \u010Das",
      duration: "ISO trajanje",
      ipv4: "IPv4 naslov",
      ipv6: "IPv6 naslov",
      cidrv4: "obseg IPv4",
      cidrv6: "obseg IPv6",
      base64: "base64 kodiran niz",
      base64url: "base64url kodiran niz",
      json_string: "JSON niz",
      e164: "E.164 \u0161tevilka",
      jwt: "JWT",
      template_literal: "vnos",
    },
    i = { nan: "NaN", number: "\u0161tevilo", array: "tabela" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Neveljaven vnos: pri\u010Dakovano instanceof ${o.expected}, prejeto ${l}`
          : `Neveljaven vnos: pri\u010Dakovano ${a}, prejeto ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Neveljaven vnos: pri\u010Dakovano ${stringifyPrimitive(o.values[0])}`
          : `Neveljavna mo\u017Enost: pri\u010Dakovano eno izmed ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Preveliko: pri\u010Dakovano, da bo ${o.origin ?? "vrednost"} imelo ${a}${o.maximum.toString()} ${c.unit ?? "elementov"}`
          : `Preveliko: pri\u010Dakovano, da bo ${o.origin ?? "vrednost"} ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Premajhno: pri\u010Dakovano, da bo ${o.origin} imelo ${a}${o.minimum.toString()} ${c.unit}`
          : `Premajhno: pri\u010Dakovano, da bo ${o.origin} ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Neveljaven niz: mora se za\u010Deti z "${a.prefix}"`
          : a.format === "ends_with"
            ? `Neveljaven niz: mora se kon\u010Dati z "${a.suffix}"`
            : a.format === "includes"
              ? `Neveljaven niz: mora vsebovati "${a.includes}"`
              : a.format === "regex"
                ? `Neveljaven niz: mora ustrezati vzorcu ${a.pattern}`
                : `Neveljaven ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Neveljavno \u0161tevilo: mora biti ve\u010Dkratnik ${o.divisor}`;
      case "unrecognized_keys":
        return `Neprepoznan${o.keys.length > 1 ? "i klju\u010Di" : " klju\u010D"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Neveljaven klju\u010D v ${o.origin}`;
      case "invalid_union":
        return "Neveljaven vnos";
      case "invalid_element":
        return `Neveljavna vrednost v ${o.origin}`;
      default:
        return "Neveljaven vnos";
    }
  };
}, "error");
function oc() {
  return { localeError: Hb() };
}
s(oc, "default");
var Jb = s(() => {
  let e = {
    string: { unit: "tecken", verb: "att ha" },
    file: { unit: "bytes", verb: "att ha" },
    array: { unit: "objekt", verb: "att inneh\xE5lla" },
    set: { unit: "objekt", verb: "att inneh\xE5lla" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "regulj\xE4rt uttryck",
      email: "e-postadress",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-datum och tid",
      date: "ISO-datum",
      time: "ISO-tid",
      duration: "ISO-varaktighet",
      ipv4: "IPv4-intervall",
      ipv6: "IPv6-intervall",
      cidrv4: "IPv4-spektrum",
      cidrv6: "IPv6-spektrum",
      base64: "base64-kodad str\xE4ng",
      base64url: "base64url-kodad str\xE4ng",
      json_string: "JSON-str\xE4ng",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "mall-literal",
    },
    i = { nan: "NaN", number: "antal", array: "lista" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ogiltig inmatning: f\xF6rv\xE4ntat instanceof ${o.expected}, fick ${l}`
          : `Ogiltig inmatning: f\xF6rv\xE4ntat ${a}, fick ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ogiltig inmatning: f\xF6rv\xE4ntat ${stringifyPrimitive(o.values[0])}`
          : `Ogiltigt val: f\xF6rv\xE4ntade en av ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `F\xF6r stor(t): f\xF6rv\xE4ntade ${o.origin ?? "v\xE4rdet"} att ha ${a}${o.maximum.toString()} ${c.unit ?? "element"}`
          : `F\xF6r stor(t): f\xF6rv\xE4ntat ${o.origin ?? "v\xE4rdet"} att ha ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `F\xF6r lite(t): f\xF6rv\xE4ntade ${o.origin ?? "v\xE4rdet"} att ha ${a}${o.minimum.toString()} ${c.unit}`
          : `F\xF6r lite(t): f\xF6rv\xE4ntade ${o.origin ?? "v\xE4rdet"} att ha ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Ogiltig str\xE4ng: m\xE5ste b\xF6rja med "${a.prefix}"`
          : a.format === "ends_with"
            ? `Ogiltig str\xE4ng: m\xE5ste sluta med "${a.suffix}"`
            : a.format === "includes"
              ? `Ogiltig str\xE4ng: m\xE5ste inneh\xE5lla "${a.includes}"`
              : a.format === "regex"
                ? `Ogiltig str\xE4ng: m\xE5ste matcha m\xF6nstret "${a.pattern}"`
                : `Ogiltig(t) ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Ogiltigt tal: m\xE5ste vara en multipel av ${o.divisor}`;
      case "unrecognized_keys":
        return `${o.keys.length > 1 ? "Ok\xE4nda nycklar" : "Ok\xE4nd nyckel"}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Ogiltig nyckel i ${o.origin ?? "v\xE4rdet"}`;
      case "invalid_union":
        return "Ogiltig input";
      case "invalid_element":
        return `Ogiltigt v\xE4rde i ${o.origin ?? "v\xE4rdet"}`;
      default:
        return "Ogiltig input";
    }
  };
}, "error");
function rc() {
  return { localeError: Jb() };
}
s(rc, "default");
var Yb = s(() => {
  let e = {
    string: {
      unit: "\u0B8E\u0BB4\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0B95\u0BCD\u0B95\u0BB3\u0BCD",
      verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
    },
    file: {
      unit: "\u0BAA\u0BC8\u0B9F\u0BCD\u0B9F\u0BC1\u0B95\u0BB3\u0BCD",
      verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
    },
    array: {
      unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD",
      verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
    },
    set: {
      unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD",
      verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
    },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1",
      email:
        "\u0BAE\u0BBF\u0BA9\u0BCD\u0BA9\u0B9E\u0BCD\u0B9A\u0BB2\u0BCD \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0BA4\u0BC7\u0BA4\u0BBF \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
      date: "ISO \u0BA4\u0BC7\u0BA4\u0BBF",
      time: "ISO \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
      duration: "ISO \u0B95\u0BBE\u0BB2 \u0B85\u0BB3\u0BB5\u0BC1",
      ipv4: "IPv4 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
      ipv6: "IPv6 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
      cidrv4: "IPv4 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
      cidrv6: "IPv6 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
      base64: "base64-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
      base64url: "base64url-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
      json_string: "JSON \u0B9A\u0BB0\u0BAE\u0BCD",
      e164: "E.164 \u0B8E\u0BA3\u0BCD",
      jwt: "JWT",
      template_literal: "input",
    },
    i = {
      nan: "NaN",
      number: "\u0B8E\u0BA3\u0BCD",
      array: "\u0B85\u0BA3\u0BBF",
      null: "\u0BB5\u0BC6\u0BB1\u0BC1\u0BAE\u0BC8",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 instanceof ${o.expected}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${l}`
          : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${a}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${stringifyPrimitive(o.values[0])}`
          : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0BB0\u0BC1\u0BAA\u0BCD\u0BAA\u0BAE\u0BCD: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${joinValues(o.values, "|")} \u0B87\u0BB2\u0BCD \u0B92\u0BA9\u0BCD\u0BB1\u0BC1`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${o.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${a}${o.maximum.toString()} ${c.unit ?? "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD"} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${o.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${a}${o.maximum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${o.origin} ${a}${o.minimum.toString()} ${c.unit} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${o.origin} ${a}${o.minimum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${a.prefix}" \u0B87\u0BB2\u0BCD \u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : a.format === "ends_with"
            ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${a.suffix}" \u0B87\u0BB2\u0BCD \u0BAE\u0BC1\u0B9F\u0BBF\u0BB5\u0B9F\u0BC8\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
            : a.format === "includes"
              ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${a.includes}" \u0B90 \u0B89\u0BB3\u0BCD\u0BB3\u0B9F\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
              : a.format === "regex"
                ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: ${a.pattern} \u0BAE\u0BC1\u0BB1\u0BC8\u0BAA\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0B9F\u0BA9\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
                : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B8E\u0BA3\u0BCD: ${o.divisor} \u0B87\u0BA9\u0BCD \u0BAA\u0BB2\u0BAE\u0BBE\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      case "unrecognized_keys":
        return `\u0B85\u0B9F\u0BC8\u0BAF\u0BBE\u0BB3\u0BAE\u0BCD \u0BA4\u0BC6\u0BB0\u0BBF\u0BAF\u0BBE\u0BA4 \u0BB5\u0BBF\u0B9A\u0BC8${o.keys.length > 1 ? "\u0B95\u0BB3\u0BCD" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `${o.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0B9A\u0BC8`;
      case "invalid_union":
        return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1";
      case "invalid_element":
        return `${o.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1`;
      default:
        return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1";
    }
  };
}, "error");
function ic() {
  return { localeError: Yb() };
}
s(ic, "default");
var Xb = s(() => {
  let e = {
    string: {
      unit: "\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23",
      verb: "\u0E04\u0E27\u0E23\u0E21\u0E35",
    },
    file: { unit: "\u0E44\u0E1A\u0E15\u0E4C", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    array: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    set: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19",
      email: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E2D\u0E35\u0E40\u0E21\u0E25",
      url: "URL",
      emoji: "\u0E2D\u0E34\u0E42\u0E21\u0E08\u0E34",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime:
        "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
      date: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1A\u0E1A ISO",
      time: "\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
      duration: "\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
      ipv4: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv4",
      ipv6: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv6",
      cidrv4: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv4",
      cidrv6: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv6",
      base64: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64",
      base64url:
        "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64 \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A URL",
      json_string: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A JSON",
      e164: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 (E.164)",
      jwt: "\u0E42\u0E17\u0E40\u0E04\u0E19 JWT",
      template_literal:
        "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19",
    },
    i = {
      nan: "NaN",
      number: "\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02",
      array: "\u0E2D\u0E32\u0E23\u0E4C\u0E40\u0E23\u0E22\u0E4C (Array)",
      null: "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32 (null)",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 instanceof ${o.expected} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${l}`
          : `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${a} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0E04\u0E48\u0E32\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${stringifyPrimitive(o.values[0])}`
          : `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E43\u0E19 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive
            ? "\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19"
            : "\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32",
          c = getSizing(o.origin);
        return c
          ? `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${o.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${a} ${o.maximum.toString()} ${c.unit ?? "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"}`
          : `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${o.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${a} ${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive
            ? "\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22"
            : "\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32",
          c = getSizing(o.origin);
        return c
          ? `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${o.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${a} ${o.minimum.toString()} ${c.unit}`
          : `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${o.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${a} ${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E36\u0E49\u0E19\u0E15\u0E49\u0E19\u0E14\u0E49\u0E27\u0E22 "${a.prefix}"`
          : a.format === "ends_with"
            ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E25\u0E07\u0E17\u0E49\u0E32\u0E22\u0E14\u0E49\u0E27\u0E22 "${a.suffix}"`
            : a.format === "includes"
              ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 "${a.includes}" \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21`
              : a.format === "regex"
                ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14 ${a.pattern}`
                : `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E33\u0E19\u0E27\u0E19\u0E17\u0E35\u0E48\u0E2B\u0E32\u0E23\u0E14\u0E49\u0E27\u0E22 ${o.divisor} \u0E44\u0E14\u0E49\u0E25\u0E07\u0E15\u0E31\u0E27`;
      case "unrecognized_keys":
        return `\u0E1E\u0E1A\u0E04\u0E35\u0E22\u0E4C\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\u0E04\u0E35\u0E22\u0E4C\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${o.origin}`;
      case "invalid_union":
        return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E22\u0E39\u0E40\u0E19\u0E35\u0E22\u0E19\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E44\u0E27\u0E49";
      case "invalid_element":
        return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${o.origin}`;
      default:
        return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07";
    }
  };
}, "error");
function ac() {
  return { localeError: Xb() };
}
s(ac, "default");
var Qb = s(() => {
  let e = {
    string: { unit: "karakter", verb: "olmal\u0131" },
    file: { unit: "bayt", verb: "olmal\u0131" },
    array: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
    set: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "girdi",
      email: "e-posta adresi",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO tarih ve saat",
      date: "ISO tarih",
      time: "ISO saat",
      duration: "ISO s\xFCre",
      ipv4: "IPv4 adresi",
      ipv6: "IPv6 adresi",
      cidrv4: "IPv4 aral\u0131\u011F\u0131",
      cidrv6: "IPv6 aral\u0131\u011F\u0131",
      base64: "base64 ile \u015Fifrelenmi\u015F metin",
      base64url: "base64url ile \u015Fifrelenmi\u015F metin",
      json_string: "JSON dizesi",
      e164: "E.164 say\u0131s\u0131",
      jwt: "JWT",
      template_literal: "\u015Eablon dizesi",
    },
    i = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ge\xE7ersiz de\u011Fer: beklenen instanceof ${o.expected}, al\u0131nan ${l}`
          : `Ge\xE7ersiz de\u011Fer: beklenen ${a}, al\u0131nan ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ge\xE7ersiz de\u011Fer: beklenen ${stringifyPrimitive(o.values[0])}`
          : `Ge\xE7ersiz se\xE7enek: a\u015Fa\u011F\u0131dakilerden biri olmal\u0131: ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\xC7ok b\xFCy\xFCk: beklenen ${o.origin ?? "de\u011Fer"} ${a}${o.maximum.toString()} ${c.unit ?? "\xF6\u011Fe"}`
          : `\xC7ok b\xFCy\xFCk: beklenen ${o.origin ?? "de\u011Fer"} ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\xC7ok k\xFC\xE7\xFCk: beklenen ${o.origin} ${a}${o.minimum.toString()} ${c.unit}`
          : `\xC7ok k\xFC\xE7\xFCk: beklenen ${o.origin} ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Ge\xE7ersiz metin: "${a.prefix}" ile ba\u015Flamal\u0131`
          : a.format === "ends_with"
            ? `Ge\xE7ersiz metin: "${a.suffix}" ile bitmeli`
            : a.format === "includes"
              ? `Ge\xE7ersiz metin: "${a.includes}" i\xE7ermeli`
              : a.format === "regex"
                ? `Ge\xE7ersiz metin: ${a.pattern} desenine uymal\u0131`
                : `Ge\xE7ersiz ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Ge\xE7ersiz say\u0131: ${o.divisor} ile tam b\xF6l\xFCnebilmeli`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan anahtar${o.keys.length > 1 ? "lar" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `${o.origin} i\xE7inde ge\xE7ersiz anahtar`;
      case "invalid_union":
        return "Ge\xE7ersiz de\u011Fer";
      case "invalid_element":
        return `${o.origin} i\xE7inde ge\xE7ersiz de\u011Fer`;
      default:
        return "Ge\xE7ersiz de\u011Fer";
    }
  };
}, "error");
function sc() {
  return { localeError: Qb() };
}
s(sc, "default");
var ev = s(() => {
  let e = {
    string: {
      unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0456\u0432",
      verb: "\u043C\u0430\u0442\u0438\u043C\u0435",
    },
    file: {
      unit: "\u0431\u0430\u0439\u0442\u0456\u0432",
      verb: "\u043C\u0430\u0442\u0438\u043C\u0435",
    },
    array: {
      unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432",
      verb: "\u043C\u0430\u0442\u0438\u043C\u0435",
    },
    set: {
      unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432",
      verb: "\u043C\u0430\u0442\u0438\u043C\u0435",
    },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456",
      email:
        "\u0430\u0434\u0440\u0435\u0441\u0430 \u0435\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0457 \u043F\u043E\u0448\u0442\u0438",
      url: "URL",
      emoji: "\u0435\u043C\u043E\u0434\u0437\u0456",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u0434\u0430\u0442\u0430 \u0442\u0430 \u0447\u0430\u0441 ISO",
      date: "\u0434\u0430\u0442\u0430 ISO",
      time: "\u0447\u0430\u0441 ISO",
      duration: "\u0442\u0440\u0438\u0432\u0430\u043B\u0456\u0441\u0442\u044C ISO",
      ipv4: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv4",
      ipv6: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv6",
      cidrv4: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv4",
      cidrv6: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv6",
      base64:
        "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64",
      base64url:
        "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64url",
      json_string: "\u0440\u044F\u0434\u043E\u043A JSON",
      e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
      jwt: "JWT",
      template_literal: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456",
    },
    i = {
      nan: "NaN",
      number: "\u0447\u0438\u0441\u043B\u043E",
      array: "\u043C\u0430\u0441\u0438\u0432",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F instanceof ${o.expected}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${l}`
          : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${a}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${stringifyPrimitive(o.values[0])}`
          : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430 \u043E\u043F\u0446\u0456\u044F: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F \u043E\u0434\u043D\u0435 \u0437 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} ${c.verb} ${a}${o.maximum.toString()} ${c.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432"}`
          : `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} \u0431\u0443\u0434\u0435 ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${o.origin} ${c.verb} ${a}${o.minimum.toString()} ${c.unit}`
          : `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${o.origin} \u0431\u0443\u0434\u0435 ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043F\u043E\u0447\u0438\u043D\u0430\u0442\u0438\u0441\u044F \u0437 "${a.prefix}"`
          : a.format === "ends_with"
            ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0437\u0430\u043A\u0456\u043D\u0447\u0443\u0432\u0430\u0442\u0438\u0441\u044F \u043D\u0430 "${a.suffix}"`
            : a.format === "includes"
              ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043C\u0456\u0441\u0442\u0438\u0442\u0438 "${a.includes}"`
              : a.format === "regex"
                ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u0442\u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${a.pattern}`
                : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0447\u0438\u0441\u043B\u043E: \u043F\u043E\u0432\u0438\u043D\u043D\u043E \u0431\u0443\u0442\u0438 \u043A\u0440\u0430\u0442\u043D\u0438\u043C ${o.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u043E\u0437\u043F\u0456\u0437\u043D\u0430\u043D\u0438\u0439 \u043A\u043B\u044E\u0447${o.keys.length > 1 ? "\u0456" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u043A\u043B\u044E\u0447 \u0443 ${o.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456";
      case "invalid_element":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0443 ${o.origin}`;
      default:
        return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456";
    }
  };
}, "error");
function Sn() {
  return { localeError: ev() };
}
s(Sn, "default");
function cc() {
  return Sn();
}
s(cc, "default");
var tv = s(() => {
  let e = {
    string: { unit: "\u062D\u0631\u0648\u0641", verb: "\u06C1\u0648\u0646\u0627" },
    file: { unit: "\u0628\u0627\u0626\u0679\u0633", verb: "\u06C1\u0648\u0646\u0627" },
    array: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
    set: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0627\u0646 \u067E\u0679",
      email: "\u0627\u06CC \u0645\u06CC\u0644 \u0627\u06CC\u0688\u0631\u06CC\u0633",
      url: "\u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644",
      emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
      uuid: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      uuidv4: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 4",
      uuidv6: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 6",
      nanoid: "\u0646\u06CC\u0646\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      guid: "\u062C\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      cuid: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      cuid2: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC 2",
      ulid: "\u06CC\u0648 \u0627\u06CC\u0644 \u0622\u0626\u06CC \u0688\u06CC",
      xid: "\u0627\u06CC\u06A9\u0633 \u0622\u0626\u06CC \u0688\u06CC",
      ksuid: "\u06A9\u06D2 \u0627\u06CC\u0633 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      datetime:
        "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0688\u06CC\u0679 \u0679\u0627\u0626\u0645",
      date: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u062A\u0627\u0631\u06CC\u062E",
      time: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0648\u0642\u062A",
      duration: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0645\u062F\u062A",
      ipv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0627\u06CC\u0688\u0631\u06CC\u0633",
      ipv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0627\u06CC\u0688\u0631\u06CC\u0633",
      cidrv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0631\u06CC\u0646\u062C",
      cidrv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0631\u06CC\u0646\u062C",
      base64:
        "\u0628\u06CC\u0633 64 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
      base64url:
        "\u0628\u06CC\u0633 64 \u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
      json_string:
        "\u062C\u06D2 \u0627\u06CC\u0633 \u0627\u0648 \u0627\u06CC\u0646 \u0633\u0679\u0631\u0646\u06AF",
      e164: "\u0627\u06CC 164 \u0646\u0645\u0628\u0631",
      jwt: "\u062C\u06D2 \u0688\u0628\u0644\u06CC\u0648 \u0679\u06CC",
      template_literal: "\u0627\u0646 \u067E\u0679",
    },
    i = {
      nan: "NaN",
      number: "\u0646\u0645\u0628\u0631",
      array: "\u0622\u0631\u06D2",
      null: "\u0646\u0644",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: instanceof ${o.expected} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${l} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`
          : `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${a} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${l} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${stringifyPrimitive(o.values[0])} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`
          : `\u063A\u0644\u0637 \u0622\u067E\u0634\u0646: ${joinValues(o.values, "|")} \u0645\u06CC\u06BA \u0633\u06D2 \u0627\u06CC\u06A9 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u0628\u06C1\u062A \u0628\u0691\u0627: ${o.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u06D2 ${a}${o.maximum.toString()} ${c.unit ?? "\u0639\u0646\u0627\u0635\u0631"} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`
          : `\u0628\u06C1\u062A \u0628\u0691\u0627: ${o.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u0627 ${a}${o.maximum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${o.origin} \u06A9\u06D2 ${a}${o.minimum.toString()} ${c.unit} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`
          : `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${o.origin} \u06A9\u0627 ${a}${o.minimum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${a.prefix}" \u0633\u06D2 \u0634\u0631\u0648\u0639 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
          : a.format === "ends_with"
            ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${a.suffix}" \u067E\u0631 \u062E\u062A\u0645 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
            : a.format === "includes"
              ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${a.includes}" \u0634\u0627\u0645\u0644 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
              : a.format === "regex"
                ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: \u067E\u06CC\u0679\u0631\u0646 ${a.pattern} \u0633\u06D2 \u0645\u06CC\u0686 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
                : `\u063A\u0644\u0637 ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u063A\u0644\u0637 \u0646\u0645\u0628\u0631: ${o.divisor} \u06A9\u0627 \u0645\u0636\u0627\u0639\u0641 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
      case "unrecognized_keys":
        return `\u063A\u06CC\u0631 \u062A\u0633\u0644\u06CC\u0645 \u0634\u062F\u06C1 \u06A9\u06CC${o.keys.length > 1 ? "\u0632" : ""}: ${joinValues(o.keys, "\u060C ")}`;
      case "invalid_key":
        return `${o.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u06A9\u06CC`;
      case "invalid_union":
        return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679";
      case "invalid_element":
        return `${o.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u0648\u06CC\u0644\u06CC\u0648`;
      default:
        return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679";
    }
  };
}, "error");
function lc() {
  return { localeError: tv() };
}
s(lc, "default");
var nv = s(() => {
  let e = {
    string: { unit: "belgi", verb: "bo\u2018lishi kerak" },
    file: { unit: "bayt", verb: "bo\u2018lishi kerak" },
    array: { unit: "element", verb: "bo\u2018lishi kerak" },
    set: { unit: "element", verb: "bo\u2018lishi kerak" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "kirish",
      email: "elektron pochta manzili",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO sana va vaqti",
      date: "ISO sana",
      time: "ISO vaqt",
      duration: "ISO davomiylik",
      ipv4: "IPv4 manzil",
      ipv6: "IPv6 manzil",
      mac: "MAC manzil",
      cidrv4: "IPv4 diapazon",
      cidrv6: "IPv6 diapazon",
      base64: "base64 kodlangan satr",
      base64url: "base64url kodlangan satr",
      json_string: "JSON satr",
      e164: "E.164 raqam",
      jwt: "JWT",
      template_literal: "kirish",
    },
    i = { nan: "NaN", number: "raqam", array: "massiv" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Noto\u2018g\u2018ri kirish: kutilgan instanceof ${o.expected}, qabul qilingan ${l}`
          : `Noto\u2018g\u2018ri kirish: kutilgan ${a}, qabul qilingan ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Noto\u2018g\u2018ri kirish: kutilgan ${stringifyPrimitive(o.values[0])}`
          : `Noto\u2018g\u2018ri variant: quyidagilardan biri kutilgan ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Juda katta: kutilgan ${o.origin ?? "qiymat"} ${a}${o.maximum.toString()} ${c.unit} ${c.verb}`
          : `Juda katta: kutilgan ${o.origin ?? "qiymat"} ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Juda kichik: kutilgan ${o.origin} ${a}${o.minimum.toString()} ${c.unit} ${c.verb}`
          : `Juda kichik: kutilgan ${o.origin} ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Noto\u2018g\u2018ri satr: "${a.prefix}" bilan boshlanishi kerak`
          : a.format === "ends_with"
            ? `Noto\u2018g\u2018ri satr: "${a.suffix}" bilan tugashi kerak`
            : a.format === "includes"
              ? `Noto\u2018g\u2018ri satr: "${a.includes}" ni o\u2018z ichiga olishi kerak`
              : a.format === "regex"
                ? `Noto\u2018g\u2018ri satr: ${a.pattern} shabloniga mos kelishi kerak`
                : `Noto\u2018g\u2018ri ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `Noto\u2018g\u2018ri raqam: ${o.divisor} ning karralisi bo\u2018lishi kerak`;
      case "unrecognized_keys":
        return `Noma\u2019lum kalit${o.keys.length > 1 ? "lar" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `${o.origin} dagi kalit noto\u2018g\u2018ri`;
      case "invalid_union":
        return "Noto\u2018g\u2018ri kirish";
      case "invalid_element":
        return `${o.origin} da noto\u2018g\u2018ri qiymat`;
      default:
        return "Noto\u2018g\u2018ri kirish";
    }
  };
}, "error");
function dc() {
  return { localeError: nv() };
}
s(dc, "default");
var ov = s(() => {
  let e = {
    string: { unit: "k\xFD t\u1EF1", verb: "c\xF3" },
    file: { unit: "byte", verb: "c\xF3" },
    array: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
    set: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u0111\u1EA7u v\xE0o",
      email: "\u0111\u1ECBa ch\u1EC9 email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ng\xE0y gi\u1EDD ISO",
      date: "ng\xE0y ISO",
      time: "gi\u1EDD ISO",
      duration: "kho\u1EA3ng th\u1EDDi gian ISO",
      ipv4: "\u0111\u1ECBa ch\u1EC9 IPv4",
      ipv6: "\u0111\u1ECBa ch\u1EC9 IPv6",
      cidrv4: "d\u1EA3i IPv4",
      cidrv6: "d\u1EA3i IPv6",
      base64: "chu\u1ED7i m\xE3 h\xF3a base64",
      base64url: "chu\u1ED7i m\xE3 h\xF3a base64url",
      json_string: "chu\u1ED7i JSON",
      e164: "s\u1ED1 E.164",
      jwt: "JWT",
      template_literal: "\u0111\u1EA7u v\xE0o",
    },
    i = { nan: "NaN", number: "s\u1ED1", array: "m\u1EA3ng" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i instanceof ${o.expected}, nh\u1EADn \u0111\u01B0\u1EE3c ${l}`
          : `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${a}, nh\u1EADn \u0111\u01B0\u1EE3c ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${stringifyPrimitive(o.values[0])}`
          : `T\xF9y ch\u1ECDn kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i m\u1ED9t trong c\xE1c gi\xE1 tr\u1ECB ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${o.origin ?? "gi\xE1 tr\u1ECB"} ${c.verb} ${a}${o.maximum.toString()} ${c.unit ?? "ph\u1EA7n t\u1EED"}`
          : `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${o.origin ?? "gi\xE1 tr\u1ECB"} ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${o.origin} ${c.verb} ${a}${o.minimum.toString()} ${c.unit}`
          : `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${o.origin} ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i b\u1EAFt \u0111\u1EA7u b\u1EB1ng "${a.prefix}"`
          : a.format === "ends_with"
            ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i k\u1EBFt th\xFAc b\u1EB1ng "${a.suffix}"`
            : a.format === "includes"
              ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i bao g\u1ED3m "${a.includes}"`
              : a.format === "regex"
                ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i kh\u1EDBp v\u1EDBi m\u1EABu ${a.pattern}`
                : `${r[a.format] ?? o.format} kh\xF4ng h\u1EE3p l\u1EC7`;
      }
      case "not_multiple_of":
        return `S\u1ED1 kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i l\xE0 b\u1ED9i s\u1ED1 c\u1EE7a ${o.divisor}`;
      case "unrecognized_keys":
        return `Kh\xF3a kh\xF4ng \u0111\u01B0\u1EE3c nh\u1EADn d\u1EA1ng: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Kh\xF3a kh\xF4ng h\u1EE3p l\u1EC7 trong ${o.origin}`;
      case "invalid_union":
        return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7";
      case "invalid_element":
        return `Gi\xE1 tr\u1ECB kh\xF4ng h\u1EE3p l\u1EC7 trong ${o.origin}`;
      default:
        return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7";
    }
  };
}, "error");
function uc() {
  return { localeError: ov() };
}
s(uc, "default");
var rv = s(() => {
  let e = {
    string: { unit: "\u5B57\u7B26", verb: "\u5305\u542B" },
    file: { unit: "\u5B57\u8282", verb: "\u5305\u542B" },
    array: { unit: "\u9879", verb: "\u5305\u542B" },
    set: { unit: "\u9879", verb: "\u5305\u542B" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u8F93\u5165",
      email: "\u7535\u5B50\u90AE\u4EF6",
      url: "URL",
      emoji: "\u8868\u60C5\u7B26\u53F7",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO\u65E5\u671F\u65F6\u95F4",
      date: "ISO\u65E5\u671F",
      time: "ISO\u65F6\u95F4",
      duration: "ISO\u65F6\u957F",
      ipv4: "IPv4\u5730\u5740",
      ipv6: "IPv6\u5730\u5740",
      cidrv4: "IPv4\u7F51\u6BB5",
      cidrv6: "IPv6\u7F51\u6BB5",
      base64: "base64\u7F16\u7801\u5B57\u7B26\u4E32",
      base64url: "base64url\u7F16\u7801\u5B57\u7B26\u4E32",
      json_string: "JSON\u5B57\u7B26\u4E32",
      e164: "E.164\u53F7\u7801",
      jwt: "JWT",
      template_literal: "\u8F93\u5165",
    },
    i = { nan: "NaN", number: "\u6570\u5B57", array: "\u6570\u7EC4", null: "\u7A7A\u503C(null)" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B instanceof ${o.expected}\uFF0C\u5B9E\u9645\u63A5\u6536 ${l}`
          : `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${a}\uFF0C\u5B9E\u9645\u63A5\u6536 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${stringifyPrimitive(o.values[0])}`
          : `\u65E0\u6548\u9009\u9879\uFF1A\u671F\u671B\u4EE5\u4E0B\u4E4B\u4E00 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${o.origin ?? "\u503C"} ${a}${o.maximum.toString()} ${c.unit ?? "\u4E2A\u5143\u7D20"}`
          : `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${o.origin ?? "\u503C"} ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${o.origin} ${a}${o.minimum.toString()} ${c.unit}`
          : `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${o.origin} ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${a.prefix}" \u5F00\u5934`
          : a.format === "ends_with"
            ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${a.suffix}" \u7ED3\u5C3E`
            : a.format === "includes"
              ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u5305\u542B "${a.includes}"`
              : a.format === "regex"
                ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u6EE1\u8DB3\u6B63\u5219\u8868\u8FBE\u5F0F ${a.pattern}`
                : `\u65E0\u6548${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u65E0\u6548\u6570\u5B57\uFF1A\u5FC5\u987B\u662F ${o.divisor} \u7684\u500D\u6570`;
      case "unrecognized_keys":
        return `\u51FA\u73B0\u672A\u77E5\u7684\u952E(key): ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `${o.origin} \u4E2D\u7684\u952E(key)\u65E0\u6548`;
      case "invalid_union":
        return "\u65E0\u6548\u8F93\u5165";
      case "invalid_element":
        return `${o.origin} \u4E2D\u5305\u542B\u65E0\u6548\u503C(value)`;
      default:
        return "\u65E0\u6548\u8F93\u5165";
    }
  };
}, "error");
function pc() {
  return { localeError: rv() };
}
s(pc, "default");
var iv = s(() => {
  let e = {
    string: { unit: "\u5B57\u5143", verb: "\u64C1\u6709" },
    file: { unit: "\u4F4D\u5143\u7D44", verb: "\u64C1\u6709" },
    array: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
    set: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u8F38\u5165",
      email: "\u90F5\u4EF6\u5730\u5740",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u65E5\u671F\u6642\u9593",
      date: "ISO \u65E5\u671F",
      time: "ISO \u6642\u9593",
      duration: "ISO \u671F\u9593",
      ipv4: "IPv4 \u4F4D\u5740",
      ipv6: "IPv6 \u4F4D\u5740",
      cidrv4: "IPv4 \u7BC4\u570D",
      cidrv6: "IPv6 \u7BC4\u570D",
      base64: "base64 \u7DE8\u78BC\u5B57\u4E32",
      base64url: "base64url \u7DE8\u78BC\u5B57\u4E32",
      json_string: "JSON \u5B57\u4E32",
      e164: "E.164 \u6578\u503C",
      jwt: "JWT",
      template_literal: "\u8F38\u5165",
    },
    i = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA instanceof ${o.expected}\uFF0C\u4F46\u6536\u5230 ${l}`
          : `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${a}\uFF0C\u4F46\u6536\u5230 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${stringifyPrimitive(o.values[0])}`
          : `\u7121\u6548\u7684\u9078\u9805\uFF1A\u9810\u671F\u70BA\u4EE5\u4E0B\u5176\u4E2D\u4E4B\u4E00 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${o.origin ?? "\u503C"} \u61C9\u70BA ${a}${o.maximum.toString()} ${c.unit ?? "\u500B\u5143\u7D20"}`
          : `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${o.origin ?? "\u503C"} \u61C9\u70BA ${a}${o.maximum.toString()}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${o.origin} \u61C9\u70BA ${a}${o.minimum.toString()} ${c.unit}`
          : `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${o.origin} \u61C9\u70BA ${a}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${a.prefix}" \u958B\u982D`
          : a.format === "ends_with"
            ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${a.suffix}" \u7D50\u5C3E`
            : a.format === "includes"
              ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u5305\u542B "${a.includes}"`
              : a.format === "regex"
                ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u7B26\u5408\u683C\u5F0F ${a.pattern}`
                : `\u7121\u6548\u7684 ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `\u7121\u6548\u7684\u6578\u5B57\uFF1A\u5FC5\u9808\u70BA ${o.divisor} \u7684\u500D\u6578`;
      case "unrecognized_keys":
        return `\u7121\u6CD5\u8B58\u5225\u7684\u9375\u503C${o.keys.length > 1 ? "\u5011" : ""}\uFF1A${joinValues(o.keys, "\u3001")}`;
      case "invalid_key":
        return `${o.origin} \u4E2D\u6709\u7121\u6548\u7684\u9375\u503C`;
      case "invalid_union":
        return "\u7121\u6548\u7684\u8F38\u5165\u503C";
      case "invalid_element":
        return `${o.origin} \u4E2D\u6709\u7121\u6548\u7684\u503C`;
      default:
        return "\u7121\u6548\u7684\u8F38\u5165\u503C";
    }
  };
}, "error");
function mc() {
  return { localeError: iv() };
}
s(mc, "default");
var av = s(() => {
  let e = {
    string: { unit: "\xE0mi", verb: "n\xED" },
    file: { unit: "bytes", verb: "n\xED" },
    array: { unit: "nkan", verb: "n\xED" },
    set: { unit: "nkan", verb: "n\xED" },
  };
  function getSizing(o) {
    return e[o] ?? null;
  }
  s(getSizing, "getSizing");
  let r = {
      regex: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9",
      email: "\xE0d\xEDr\u1EB9\u0301s\xEC \xECm\u1EB9\u0301l\xEC",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\xE0k\xF3k\xF2 ISO",
      date: "\u1ECDj\u1ECD\u0301 ISO",
      time: "\xE0k\xF3k\xF2 ISO",
      duration: "\xE0k\xF3k\xF2 t\xF3 p\xE9 ISO",
      ipv4: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv4",
      ipv6: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv6",
      cidrv4: "\xE0gb\xE8gb\xE8 IPv4",
      cidrv6: "\xE0gb\xE8gb\xE8 IPv6",
      base64: "\u1ECD\u0300r\u1ECD\u0300 t\xED a k\u1ECD\u0301 n\xED base64",
      base64url: "\u1ECD\u0300r\u1ECD\u0300 base64url",
      json_string: "\u1ECD\u0300r\u1ECD\u0300 JSON",
      e164: "n\u1ECD\u0301mb\xE0 E.164",
      jwt: "JWT",
      template_literal: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9",
    },
    i = { nan: "NaN", number: "n\u1ECD\u0301mb\xE0", array: "akop\u1ECD" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let a = i[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = i[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi instanceof ${o.expected}, \xE0m\u1ECD\u0300 a r\xED ${l}`
          : `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${a}, \xE0m\u1ECD\u0300 a r\xED ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${stringifyPrimitive(o.values[0])}`
          : `\xC0\u1E63\xE0y\xE0n a\u1E63\xEC\u1E63e: yan \u1ECD\u0300kan l\xE1ra ${joinValues(o.values, "|")}`;
      case "too_big": {
        let a = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${o.origin ?? "iye"} ${c.verb} ${a}${o.maximum} ${c.unit}`
          : `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 ${a}${o.maximum}`;
      }
      case "too_small": {
        let a = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${o.origin} ${c.verb} ${a}${o.minimum} ${c.unit}`
          : `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 ${a}${o.minimum}`;
      }
      case "invalid_format": {
        let a = o;
        return a.format === "starts_with"
          ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\u1EB9\u0300r\u1EB9\u0300 p\u1EB9\u0300l\xFA "${a.prefix}"`
          : a.format === "ends_with"
            ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 par\xED p\u1EB9\u0300l\xFA "${a.suffix}"`
            : a.format === "includes"
              ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 n\xED "${a.includes}"`
              : a.format === "regex"
                ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\xE1 \xE0p\u1EB9\u1EB9r\u1EB9 mu ${a.pattern}`
                : `A\u1E63\xEC\u1E63e: ${r[a.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `N\u1ECD\u0301mb\xE0 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 j\u1EB9\u0301 \xE8y\xE0 p\xEDp\xEDn ti ${o.divisor}`;
      case "unrecognized_keys":
        return `B\u1ECDt\xECn\xEC \xE0\xECm\u1ECD\u0300: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `B\u1ECDt\xECn\xEC a\u1E63\xEC\u1E63e n\xEDn\xFA ${o.origin}`;
      case "invalid_union":
        return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
      case "invalid_element":
        return `Iye a\u1E63\xEC\u1E63e n\xEDn\xFA ${o.origin}`;
      default:
        return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
    }
  };
}, "error");
function gc() {
  return { localeError: av() };
}
s(gc, "default");
var Zp,
  fc = Symbol("ZodOutput"),
  hc = Symbol("ZodInput"),
  Io = class {
    static {
      s(this, "$ZodRegistry");
    }
    constructor() {
      ((this._map = new WeakMap()), (this._idmap = new Map()));
    }
    add(t, ...r) {
      let i = r[0];
      return (
        this._map.set(t, i),
        i && typeof i == "object" && "id" in i && this._idmap.set(i.id, t),
        this
      );
    }
    clear() {
      return ((this._map = new WeakMap()), (this._idmap = new Map()), this);
    }
    remove(t) {
      let r = this._map.get(t);
      return (
        r && typeof r == "object" && "id" in r && this._idmap.delete(r.id),
        this._map.delete(t),
        this
      );
    }
    get(t) {
      let r = t._zod.parent;
      if (r) {
        let i = { ...(this.get(r) ?? {}) };
        delete i.id;
        let o = { ...i, ...this._map.get(t) };
        return Object.keys(o).length ? o : void 0;
      }
      return this._map.get(t);
    }
    has(t) {
      return this._map.has(t);
    }
  };
function registry() {
  return new Io();
}
s(registry, "registry");
(Zp = globalThis).__zod_globalRegistry ?? (Zp.__zod_globalRegistry = registry());
var V = globalThis.__zod_globalRegistry;
function _string(e, t) {
  return new e({ type: "string", ...normalizeParams(t) });
}
s(_string, "_string");
function _coercedString(e, t) {
  return new e({ type: "string", coerce: !0, ...normalizeParams(t) });
}
s(_coercedString, "_coercedString");
function _email(e, t) {
  return new e({ type: "string", format: "email", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_email, "_email");
function _guid(e, t) {
  return new e({ type: "string", format: "guid", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_guid, "_guid");
function _uuid(e, t) {
  return new e({ type: "string", format: "uuid", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_uuid, "_uuid");
function _uuidv4(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...normalizeParams(t),
  });
}
s(_uuidv4, "_uuidv4");
function _uuidv6(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...normalizeParams(t),
  });
}
s(_uuidv6, "_uuidv6");
function _uuidv7(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...normalizeParams(t),
  });
}
s(_uuidv7, "_uuidv7");
function _url(e, t) {
  return new e({ type: "string", format: "url", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_url, "_url");
function _emoji(e, t) {
  return new e({ type: "string", format: "emoji", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_emoji, "_emoji");
function _nanoid(e, t) {
  return new e({ type: "string", format: "nanoid", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_nanoid, "_nanoid");
function _cuid(e, t) {
  return new e({ type: "string", format: "cuid", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_cuid, "_cuid");
function _cuid2(e, t) {
  return new e({ type: "string", format: "cuid2", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_cuid2, "_cuid2");
function _ulid(e, t) {
  return new e({ type: "string", format: "ulid", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_ulid, "_ulid");
function _xid(e, t) {
  return new e({ type: "string", format: "xid", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_xid, "_xid");
function _ksuid(e, t) {
  return new e({ type: "string", format: "ksuid", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_ksuid, "_ksuid");
function _ipv4(e, t) {
  return new e({ type: "string", format: "ipv4", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_ipv4, "_ipv4");
function _ipv6(e, t) {
  return new e({ type: "string", format: "ipv6", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_ipv6, "_ipv6");
function _mac(e, t) {
  return new e({ type: "string", format: "mac", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_mac, "_mac");
function _cidrv4(e, t) {
  return new e({ type: "string", format: "cidrv4", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_cidrv4, "_cidrv4");
function _cidrv6(e, t) {
  return new e({ type: "string", format: "cidrv6", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_cidrv6, "_cidrv6");
function _base64(e, t) {
  return new e({ type: "string", format: "base64", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_base64, "_base64");
function _base64url(e, t) {
  return new e({ type: "string", format: "base64url", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_base64url, "_base64url");
function _e164(e, t) {
  return new e({ type: "string", format: "e164", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_e164, "_e164");
function _jwt(e, t) {
  return new e({ type: "string", format: "jwt", check: "string_format", abort: !1, ...normalizeParams(t) });
}
s(_jwt, "_jwt");
var Sc = { Any: null, Minute: -1, Second: 0, Millisecond: 3, Microsecond: 6 };
function _isoDateTime(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...normalizeParams(t),
  });
}
s(_isoDateTime, "_isoDateTime");
function _isoDate(e, t) {
  return new e({ type: "string", format: "date", check: "string_format", ...normalizeParams(t) });
}
s(_isoDate, "_isoDate");
function _isoTime(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(t),
  });
}
s(_isoTime, "_isoTime");
function _isoDuration(e, t) {
  return new e({ type: "string", format: "duration", check: "string_format", ...normalizeParams(t) });
}
s(_isoDuration, "_isoDuration");
function _number(e, t) {
  return new e({ type: "number", checks: [], ...normalizeParams(t) });
}
s(_number, "_number");
function _coercedNumber(e, t) {
  return new e({ type: "number", coerce: !0, checks: [], ...normalizeParams(t) });
}
s(_coercedNumber, "_coercedNumber");
function _int(e, t) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "safeint", ...normalizeParams(t) });
}
s(_int, "_int");
function _float32(e, t) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "float32", ...normalizeParams(t) });
}
s(_float32, "_float32");
function _float64(e, t) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "float64", ...normalizeParams(t) });
}
s(_float64, "_float64");
function _int32(e, t) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "int32", ...normalizeParams(t) });
}
s(_int32, "_int32");
function _uint32(e, t) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "uint32", ...normalizeParams(t) });
}
s(_uint32, "_uint32");
function _boolean(e, t) {
  return new e({ type: "boolean", ...normalizeParams(t) });
}
s(_boolean, "_boolean");
function _coercedBoolean(e, t) {
  return new e({ type: "boolean", coerce: !0, ...normalizeParams(t) });
}
s(_coercedBoolean, "_coercedBoolean");
function _bigint(e, t) {
  return new e({ type: "bigint", ...normalizeParams(t) });
}
s(_bigint, "_bigint");
function _coercedBigint(e, t) {
  return new e({ type: "bigint", coerce: !0, ...normalizeParams(t) });
}
s(_coercedBigint, "_coercedBigint");
function _int64(e, t) {
  return new e({ type: "bigint", check: "bigint_format", abort: !1, format: "int64", ...normalizeParams(t) });
}
s(_int64, "_int64");
function _uint64(e, t) {
  return new e({ type: "bigint", check: "bigint_format", abort: !1, format: "uint64", ...normalizeParams(t) });
}
s(_uint64, "_uint64");
function _symbol(e, t) {
  return new e({ type: "symbol", ...normalizeParams(t) });
}
s(_symbol, "_symbol");
function _undefined(e, t) {
  return new e({ type: "undefined", ...normalizeParams(t) });
}
s(_undefined, "_undefined");
function _null(e, t) {
  return new e({ type: "null", ...normalizeParams(t) });
}
s(_null, "_null");
function _any(e) {
  return new e({ type: "any" });
}
s(_any, "_any");
function _unknown(e) {
  return new e({ type: "unknown" });
}
s(_unknown, "_unknown");
function _never(e, t) {
  return new e({ type: "never", ...normalizeParams(t) });
}
s(_never, "_never");
function _void(e, t) {
  return new e({ type: "void", ...normalizeParams(t) });
}
s(_void, "_void");
function _date(e, t) {
  return new e({ type: "date", ...normalizeParams(t) });
}
s(_date, "_date");
function _coercedDate(e, t) {
  return new e({ type: "date", coerce: !0, ...normalizeParams(t) });
}
s(_coercedDate, "_coercedDate");
function _nan(e, t) {
  return new e({ type: "nan", ...normalizeParams(t) });
}
s(_nan, "_nan");
function _lt(e, t) {
  return new mo({ check: "less_than", ...normalizeParams(t), value: e, inclusive: !1 });
}
s(_lt, "_lt");
function _lte(e, t) {
  return new mo({ check: "less_than", ...normalizeParams(t), value: e, inclusive: !0 });
}
s(_lte, "_lte");
function _gt(e, t) {
  return new go({ check: "greater_than", ...normalizeParams(t), value: e, inclusive: !1 });
}
s(_gt, "_gt");
function _gte(e, t) {
  return new go({ check: "greater_than", ...normalizeParams(t), value: e, inclusive: !0 });
}
s(_gte, "_gte");
function _positive(e) {
  return _gt(0, e);
}
s(_positive, "_positive");
function _negative(e) {
  return _lt(0, e);
}
s(_negative, "_negative");
function _nonpositive(e) {
  return _lte(0, e);
}
s(_nonpositive, "_nonpositive");
function _nonnegative(e) {
  return _gte(0, e);
}
s(_nonnegative, "_nonnegative");
function _multipleOf(e, t) {
  return new Ki({ check: "multiple_of", ...normalizeParams(t), value: e });
}
s(_multipleOf, "_multipleOf");
function _maxSize(e, t) {
  return new Yi({ check: "max_size", ...normalizeParams(t), maximum: e });
}
s(_maxSize, "_maxSize");
function _minSize(e, t) {
  return new Xi({ check: "min_size", ...normalizeParams(t), minimum: e });
}
s(_minSize, "_minSize");
function _size(e, t) {
  return new Qi({ check: "size_equals", ...normalizeParams(t), size: e });
}
s(_size, "_size");
function _maxLength(e, t) {
  return new ea({ check: "max_length", ...normalizeParams(t), maximum: e });
}
s(_maxLength, "_maxLength");
function _minLength(e, t) {
  return new ta({ check: "min_length", ...normalizeParams(t), minimum: e });
}
s(_minLength, "_minLength");
function _length(e, t) {
  return new na({ check: "length_equals", ...normalizeParams(t), length: e });
}
s(_length, "_length");
function _regex(e, t) {
  return new oa({ check: "string_format", format: "regex", ...normalizeParams(t), pattern: e });
}
s(_regex, "_regex");
function _lowercase(e) {
  return new ra({ check: "string_format", format: "lowercase", ...normalizeParams(e) });
}
s(_lowercase, "_lowercase");
function _uppercase(e) {
  return new ia({ check: "string_format", format: "uppercase", ...normalizeParams(e) });
}
s(_uppercase, "_uppercase");
function _includes(e, t) {
  return new aa({ check: "string_format", format: "includes", ...normalizeParams(t), includes: e });
}
s(_includes, "_includes");
function _startsWith(e, t) {
  return new sa({ check: "string_format", format: "starts_with", ...normalizeParams(t), prefix: e });
}
s(_startsWith, "_startsWith");
function _endsWith(e, t) {
  return new ca({ check: "string_format", format: "ends_with", ...normalizeParams(t), suffix: e });
}
s(_endsWith, "_endsWith");
function _property(e, t, r) {
  return new la({ check: "property", property: e, schema: t, ...normalizeParams(r) });
}
s(_property, "_property");
function _mime(e, t) {
  return new da({ check: "mime_type", mime: e, ...normalizeParams(t) });
}
s(_mime, "_mime");
function _overwrite(e) {
  return new ua({ check: "overwrite", tx: e });
}
s(_overwrite, "_overwrite");
function _normalize(e) {
  return _overwrite((t) => t.normalize(e));
}
s(_normalize, "_normalize");
function _trim() {
  return _overwrite((e) => e.trim());
}
s(_trim, "_trim");
function _toLowerCase() {
  return _overwrite((e) => e.toLowerCase());
}
s(_toLowerCase, "_toLowerCase");
function _toUpperCase() {
  return _overwrite((e) => e.toUpperCase());
}
s(_toUpperCase, "_toUpperCase");
function _slugify() {
  return _overwrite((e) => slugify(e));
}
s(_slugify, "_slugify");
function _array(e, t, r) {
  return new e({ type: "array", element: t, ...normalizeParams(r) });
}
s(_array, "_array");
function _union(e, t, r) {
  return new e({ type: "union", options: t, ...normalizeParams(r) });
}
s(_union, "_union");
function _xor(e, t, r) {
  return new e({ type: "union", options: t, inclusive: !1, ...normalizeParams(r) });
}
s(_xor, "_xor");
function _discriminatedUnion(e, t, r, i) {
  return new e({ type: "union", options: r, discriminator: t, ...normalizeParams(i) });
}
s(_discriminatedUnion, "_discriminatedUnion");
function _intersection(e, t, r) {
  return new e({ type: "intersection", left: t, right: r });
}
s(_intersection, "_intersection");
function _tuple(e, t, r, i) {
  let o = r instanceof E,
    a = o ? i : r,
    c = o ? r : null;
  return new e({ type: "tuple", items: t, rest: c, ...normalizeParams(a) });
}
s(_tuple, "_tuple");
function _record(e, t, r, i) {
  return new e({ type: "record", keyType: t, valueType: r, ...normalizeParams(i) });
}
s(_record, "_record");
function _map(e, t, r, i) {
  return new e({ type: "map", keyType: t, valueType: r, ...normalizeParams(i) });
}
s(_map, "_map");
function _set(e, t, r) {
  return new e({ type: "set", valueType: t, ...normalizeParams(r) });
}
s(_set, "_set");
function _enum(e, t, r) {
  let i = Array.isArray(t) ? Object.fromEntries(t.map((o) => [o, o])) : t;
  return new e({ type: "enum", entries: i, ...normalizeParams(r) });
}
s(_enum, "_enum");
function _nativeEnum(e, t, r) {
  return new e({ type: "enum", entries: t, ...normalizeParams(r) });
}
s(_nativeEnum, "_nativeEnum");
function _literal(e, t, r) {
  return new e({ type: "literal", values: Array.isArray(t) ? t : [t], ...normalizeParams(r) });
}
s(_literal, "_literal");
function _file(e, t) {
  return new e({ type: "file", ...normalizeParams(t) });
}
s(_file, "_file");
function _transform(e, t) {
  return new e({ type: "transform", transform: t });
}
s(_transform, "_transform");
function _optional(e, t) {
  return new e({ type: "optional", innerType: t });
}
s(_optional, "_optional");
function _nullable(e, t) {
  return new e({ type: "nullable", innerType: t });
}
s(_nullable, "_nullable");
function _default(e, t, r) {
  return new e({
    type: "default",
    innerType: t,
    get defaultValue() {
      return typeof r == "function" ? r() : shallowClone(r);
    },
  });
}
s(_default, "_default");
function _nonoptional(e, t, r) {
  return new e({ type: "nonoptional", innerType: t, ...normalizeParams(r) });
}
s(_nonoptional, "_nonoptional");
function _success(e, t) {
  return new e({ type: "success", innerType: t });
}
s(_success, "_success");
function _catch(e, t, r) {
  return new e({ type: "catch", innerType: t, catchValue: typeof r == "function" ? r : () => r });
}
s(_catch, "_catch");
function _pipe(e, t, r) {
  return new e({ type: "pipe", in: t, out: r });
}
s(_pipe, "_pipe");
function _readonly(e, t) {
  return new e({ type: "readonly", innerType: t });
}
s(_readonly, "_readonly");
function _templateLiteral(e, t, r) {
  return new e({ type: "template_literal", parts: t, ...normalizeParams(r) });
}
s(_templateLiteral, "_templateLiteral");
function _lazy(e, t) {
  return new e({ type: "lazy", getter: t });
}
s(_lazy, "_lazy");
function _promise(e, t) {
  return new e({ type: "promise", innerType: t });
}
s(_promise, "_promise");
function _custom(e, t, r) {
  let i = normalizeParams(r);
  return (i.abort ?? (i.abort = !0), new e({ type: "custom", check: "custom", fn: t, ...i }));
}
s(_custom, "_custom");
function _refine(e, t, r) {
  return new e({ type: "custom", check: "custom", fn: t, ...normalizeParams(r) });
}
s(_refine, "_refine");
function _superRefine(e) {
  let t = _check(
    (r) => (
      (r.addIssue = (i) => {
        if (typeof i == "string") r.issues.push(issue(i, r.value, t._zod.def));
        else {
          let o = i;
          (o.fatal && (o.continue = !1),
            o.code ?? (o.code = "custom"),
            o.input ?? (o.input = r.value),
            o.inst ?? (o.inst = t),
            o.continue ?? (o.continue = !t._zod.def.abort),
            r.issues.push(issue(o)));
        }
      }),
      e(r.value, r)
    ),
  );
  return t;
}
s(_superRefine, "_superRefine");
function _check(e, t) {
  let r = new Z({ check: "custom", ...normalizeParams(t) });
  return ((r._zod.check = e), r);
}
s(_check, "_check");
function describe(e) {
  let t = new Z({ check: "describe" });
  return (
    (t._zod.onattach = [
      (r) => {
        let i = V.get(r) ?? {};
        V.add(r, { ...i, description: e });
      },
    ]),
    (t._zod.check = () => {}),
    t
  );
}
s(describe, "describe");
function meta(e) {
  let t = new Z({ check: "meta" });
  return (
    (t._zod.onattach = [
      (r) => {
        let i = V.get(r) ?? {};
        V.add(r, { ...i, ...e });
      },
    ]),
    (t._zod.check = () => {}),
    t
  );
}
s(meta, "meta");
function _stringbool(e, t) {
  let r = normalizeParams(t),
    i = r.truthy ?? ["true", "1", "yes", "on", "y", "enabled"],
    o = r.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
  r.case !== "sensitive" &&
    ((i = i.map((v) => (typeof v == "string" ? v.toLowerCase() : v))),
    (o = o.map((v) => (typeof v == "string" ? v.toLowerCase() : v))));
  let a = new Set(i),
    c = new Set(o),
    l = e.Codec ?? hn,
    p = e.Boolean ?? gn,
    d = e.String ?? Je,
    g = new d({ type: "string", error: r.error }),
    y = new p({ type: "boolean", error: r.error }),
    S = new l({
      type: "pipe",
      in: g,
      out: y,
      transform: s((v, P) => {
        let w = v;
        return (
          r.case !== "sensitive" && (w = w.toLowerCase()),
          a.has(w)
            ? !0
            : c.has(w)
              ? !1
              : (P.issues.push({
                  code: "invalid_value",
                  expected: "stringbool",
                  values: [...a, ...c],
                  input: P.value,
                  inst: S,
                  continue: !1,
                }),
                {})
        );
      }, "transform"),
      reverseTransform: s(
        (v, P) => (v === !0 ? i[0] || "true" : o[0] || "false"),
        "reverseTransform",
      ),
      error: r.error,
    });
  return S;
}
s(_stringbool, "_stringbool");
function _stringFormat(e, t, r, i = {}) {
  let o = normalizeParams(i),
    a = {
      ...normalizeParams(i),
      check: "string_format",
      type: "string",
      format: t,
      fn: typeof r == "function" ? r : (l) => r.test(l),
      ...o,
    };
  return (r instanceof RegExp && (a.pattern = r), new e(a));
}
s(_stringFormat, "_stringFormat");
function initializeContext(e) {
  let t = e?.target ?? "draft-2020-12";
  return (
    t === "draft-4" && (t = "draft-04"),
    t === "draft-7" && (t = "draft-07"),
    {
      processors: e.processors ?? {},
      metadataRegistry: e?.metadata ?? V,
      target: t,
      unrepresentable: e?.unrepresentable ?? "throw",
      override: e?.override ?? (() => {}),
      io: e?.io ?? "output",
      counter: 0,
      seen: new Map(),
      cycles: e?.cycles ?? "ref",
      reused: e?.reused ?? "inline",
      external: e?.external ?? void 0,
    }
  );
}
s(initializeContext, "initializeContext");
function $(e, t, r = { path: [], schemaPath: [] }) {
  var i;
  let o = e._zod.def,
    a = t.seen.get(e);
  if (a) return (a.count++, r.schemaPath.includes(e) && (a.cycle = r.path), a.schema);
  let c = { schema: {}, count: 1, cycle: void 0, path: r.path };
  t.seen.set(e, c);
  let l = e._zod.toJSONSchema?.();
  if (l) c.schema = l;
  else {
    let g = { ...r, schemaPath: [...r.schemaPath, e], path: r.path };
    if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, c.schema, g);
    else {
      let S = c.schema,
        v = t.processors[o.type];
      if (!v) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      v(e, t, S, g);
    }
    let y = e._zod.parent;
    y && (c.ref || (c.ref = y), $(y, t, g), (t.seen.get(y).isParent = !0));
  }
  let p = t.metadataRegistry.get(e);
  return (
    p && Object.assign(c.schema, p),
    t.io === "input" && isTransforming(e) && (delete c.schema.examples, delete c.schema.default),
    t.io === "input" &&
      c.schema._prefault &&
      ((i = c.schema).default ?? (i.default = c.schema._prefault)),
    delete c.schema._prefault,
    t.seen.get(e).schema
  );
}
s($, "process");
function extractDefs(e, t) {
  let r = e.seen.get(t);
  if (!r) throw new Error("Unprocessed schema. This is a bug in Zod.");
  let i = new Map();
  for (let c of e.seen.entries()) {
    let l = e.metadataRegistry.get(c[0])?.id;
    if (l) {
      let p = i.get(l);
      if (p && p !== c[0])
        throw new Error(
          `Duplicate schema id "${l}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`,
        );
      i.set(l, c[0]);
    }
  }
  let o = s((c) => {
      let l = e.target === "draft-2020-12" ? "$defs" : "definitions";
      if (e.external) {
        let y = e.external.registry.get(c[0])?.id,
          S = e.external.uri ?? ((P) => P);
        if (y) return { ref: S(y) };
        let v = c[1].defId ?? c[1].schema.id ?? `schema${e.counter++}`;
        return ((c[1].defId = v), { defId: v, ref: `${S("__shared")}#/${l}/${v}` });
      }
      if (c[1] === r) return { ref: "#" };
      let d = `#/${l}/`,
        g = c[1].schema.id ?? `__schema${e.counter++}`;
      return { defId: g, ref: d + g };
    }, "makeURI"),
    a = s((c) => {
      if (c[1].schema.$ref) return;
      let l = c[1],
        { ref: p, defId: d } = o(c);
      ((l.def = { ...l.schema }), d && (l.defId = d));
      let g = l.schema;
      for (let y in g) delete g[y];
      g.$ref = p;
    }, "extractToDef");
  if (e.cycles === "throw")
    for (let c of e.seen.entries()) {
      let l = c[1];
      if (l.cycle)
        throw new Error(`Cycle detected: #/${l.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (let c of e.seen.entries()) {
    let l = c[1];
    if (t === c[0]) {
      a(c);
      continue;
    }
    if (e.external) {
      let d = e.external.registry.get(c[0])?.id;
      if (t !== c[0] && d) {
        a(c);
        continue;
      }
    }
    if (e.metadataRegistry.get(c[0])?.id) {
      a(c);
      continue;
    }
    if (l.cycle) {
      a(c);
      continue;
    }
    if (l.count > 1 && e.reused === "ref") {
      a(c);
      continue;
    }
  }
}
s(extractDefs, "extractDefs");
function finalize(e, t) {
  let r = e.seen.get(t);
  if (!r) throw new Error("Unprocessed schema. This is a bug in Zod.");
  let i = s((c) => {
    let l = e.seen.get(c);
    if (l.ref === null) return;
    let p = l.def ?? l.schema,
      d = { ...p },
      g = l.ref;
    if (((l.ref = null), g)) {
      i(g);
      let S = e.seen.get(g),
        v = S.schema;
      if (
        (v.$ref &&
        (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0")
          ? ((p.allOf = p.allOf ?? []), p.allOf.push(v))
          : Object.assign(p, v),
        Object.assign(p, d),
        c._zod.parent === g)
      )
        for (let w in p) w === "$ref" || w === "allOf" || w in d || delete p[w];
      if (v.$ref && S.def)
        for (let w in p)
          w === "$ref" ||
            w === "allOf" ||
            (w in S.def && JSON.stringify(p[w]) === JSON.stringify(S.def[w]) && delete p[w]);
    }
    let y = c._zod.parent;
    if (y && y !== g) {
      i(y);
      let S = e.seen.get(y);
      if (S?.schema.$ref && ((p.$ref = S.schema.$ref), S.def))
        for (let v in p)
          v === "$ref" ||
            v === "allOf" ||
            (v in S.def && JSON.stringify(p[v]) === JSON.stringify(S.def[v]) && delete p[v]);
    }
    e.override({ zodSchema: c, jsonSchema: p, path: l.path ?? [] });
  }, "flattenRef");
  for (let c of [...e.seen.entries()].reverse()) i(c[0]);
  let o = {};
  if (
    (e.target === "draft-2020-12"
      ? (o.$schema = "https://json-schema.org/draft/2020-12/schema")
      : e.target === "draft-07"
        ? (o.$schema = "http://json-schema.org/draft-07/schema#")
        : e.target === "draft-04"
          ? (o.$schema = "http://json-schema.org/draft-04/schema#")
          : e.target,
    e.external?.uri)
  ) {
    let c = e.external.registry.get(t)?.id;
    if (!c) throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(c);
  }
  Object.assign(o, r.def ?? r.schema);
  let a = e.external?.defs ?? {};
  for (let c of e.seen.entries()) {
    let l = c[1];
    l.def && l.defId && (a[l.defId] = l.def);
  }
  e.external ||
    (Object.keys(a).length > 0 &&
      (e.target === "draft-2020-12" ? (o.$defs = a) : (o.definitions = a)));
  try {
    let c = JSON.parse(JSON.stringify(o));
    return (
      Object.defineProperty(c, "~standard", {
        value: {
          ...t["~standard"],
          jsonSchema: {
            input: Et(t, "input", e.processors),
            output: Et(t, "output", e.processors),
          },
        },
        enumerable: !1,
        writable: !1,
      }),
      c
    );
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
s(finalize, "finalize");
function isTransforming(e, t) {
  let r = t ?? { seen: new Set() };
  if (r.seen.has(e)) return !1;
  r.seen.add(e);
  let i = e._zod.def;
  if (i.type === "transform") return !0;
  if (i.type === "array") return isTransforming(i.element, r);
  if (i.type === "set") return isTransforming(i.valueType, r);
  if (i.type === "lazy") return isTransforming(i.getter(), r);
  if (
    i.type === "promise" ||
    i.type === "optional" ||
    i.type === "nonoptional" ||
    i.type === "nullable" ||
    i.type === "readonly" ||
    i.type === "default" ||
    i.type === "prefault"
  )
    return isTransforming(i.innerType, r);
  if (i.type === "intersection") return isTransforming(i.left, r) || isTransforming(i.right, r);
  if (i.type === "record" || i.type === "map") return isTransforming(i.keyType, r) || isTransforming(i.valueType, r);
  if (i.type === "pipe") return isTransforming(i.in, r) || isTransforming(i.out, r);
  if (i.type === "object") {
    for (let o in i.shape) if (isTransforming(i.shape[o], r)) return !0;
    return !1;
  }
  if (i.type === "union") {
    for (let o of i.options) if (isTransforming(o, r)) return !0;
    return !1;
  }
  if (i.type === "tuple") {
    for (let o of i.items) if (isTransforming(o, r)) return !0;
    return !!(i.rest && isTransforming(i.rest, r));
  }
  return !1;
}
s(isTransforming, "isTransforming");
var nl = s(
    (e, t = {}) =>
      (r) => {
        let i = initializeContext({ ...r, processors: t });
        return ($(e, i), extractDefs(i, e), finalize(i, e));
      },
    "createToJSONSchemaMethod",
  ),
  Et = s(
    (e, t, r = {}) =>
      (i) => {
        let { libraryOptions: o, target: a } = i ?? {},
          c = initializeContext({ ...(o ?? {}), target: a, io: t, processors: r });
        return ($(e, c), extractDefs(c, e), finalize(c, e));
      },
    "createStandardJSONSchemaMethod",
  );
var Ov = { guid: "uuid", url: "uri", datetime: "date-time", json_string: "json-string", regex: "" },
  ol = s((e, t, r, i) => {
    let o = r;
    o.type = "string";
    let { minimum: a, maximum: c, format: l, patterns: p, contentEncoding: d } = e._zod.bag;
    if (
      (typeof a == "number" && (o.minLength = a),
      typeof c == "number" && (o.maxLength = c),
      l &&
        ((o.format = Ov[l] ?? l),
        o.format === "" && delete o.format,
        l === "time" && delete o.format),
      d && (o.contentEncoding = d),
      p && p.size > 0)
    ) {
      let g = [...p];
      g.length === 1
        ? (o.pattern = g[0].source)
        : g.length > 1 &&
          (o.allOf = [
            ...g.map((y) => ({
              ...(t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0"
                ? { type: "string" }
                : {}),
              pattern: y.source,
            })),
          ]);
    }
  }, "stringProcessor"),
  rl = s((e, t, r, i) => {
    let o = r,
      {
        minimum: a,
        maximum: c,
        format: l,
        multipleOf: p,
        exclusiveMaximum: d,
        exclusiveMinimum: g,
      } = e._zod.bag;
    (typeof l == "string" && l.includes("int") ? (o.type = "integer") : (o.type = "number"),
      typeof g == "number" &&
        (t.target === "draft-04" || t.target === "openapi-3.0"
          ? ((o.minimum = g), (o.exclusiveMinimum = !0))
          : (o.exclusiveMinimum = g)),
      typeof a == "number" &&
        ((o.minimum = a),
        typeof g == "number" &&
          t.target !== "draft-04" &&
          (g >= a ? delete o.minimum : delete o.exclusiveMinimum)),
      typeof d == "number" &&
        (t.target === "draft-04" || t.target === "openapi-3.0"
          ? ((o.maximum = d), (o.exclusiveMaximum = !0))
          : (o.exclusiveMaximum = d)),
      typeof c == "number" &&
        ((o.maximum = c),
        typeof d == "number" &&
          t.target !== "draft-04" &&
          (d <= c ? delete o.maximum : delete o.exclusiveMaximum)),
      typeof p == "number" && (o.multipleOf = p));
  }, "numberProcessor"),
  il = s((e, t, r, i) => {
    r.type = "boolean";
  }, "booleanProcessor"),
  al = s((e, t, r, i) => {
    if (t.unrepresentable === "throw")
      throw new Error("BigInt cannot be represented in JSON Schema");
  }, "bigintProcessor"),
  sl = s((e, t, r, i) => {
    if (t.unrepresentable === "throw")
      throw new Error("Symbols cannot be represented in JSON Schema");
  }, "symbolProcessor"),
  cl = s((e, t, r, i) => {
    t.target === "openapi-3.0"
      ? ((r.type = "string"), (r.nullable = !0), (r.enum = [null]))
      : (r.type = "null");
  }, "nullProcessor"),
  ll = s((e, t, r, i) => {
    if (t.unrepresentable === "throw")
      throw new Error("Undefined cannot be represented in JSON Schema");
  }, "undefinedProcessor"),
  dl = s((e, t, r, i) => {
    if (t.unrepresentable === "throw") throw new Error("Void cannot be represented in JSON Schema");
  }, "voidProcessor"),
  ul = s((e, t, r, i) => {
    r.not = {};
  }, "neverProcessor"),
  pl = s((e, t, r, i) => {}, "anyProcessor"),
  ml = s((e, t, r, i) => {}, "unknownProcessor"),
  gl = s((e, t, r, i) => {
    if (t.unrepresentable === "throw") throw new Error("Date cannot be represented in JSON Schema");
  }, "dateProcessor"),
  fl = s((e, t, r, i) => {
    let o = e._zod.def,
      a = getEnumValues(o.entries);
    (a.every((c) => typeof c == "number") && (r.type = "number"),
      a.every((c) => typeof c == "string") && (r.type = "string"),
      (r.enum = a));
  }, "enumProcessor"),
  hl = s((e, t, r, i) => {
    let o = e._zod.def,
      a = [];
    for (let c of o.values)
      if (c === void 0) {
        if (t.unrepresentable === "throw")
          throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      } else if (typeof c == "bigint") {
        if (t.unrepresentable === "throw")
          throw new Error("BigInt literals cannot be represented in JSON Schema");
        a.push(Number(c));
      } else a.push(c);
    if (a.length !== 0)
      if (a.length === 1) {
        let c = a[0];
        ((r.type = c === null ? "null" : typeof c),
          t.target === "draft-04" || t.target === "openapi-3.0" ? (r.enum = [c]) : (r.const = c));
      } else
        (a.every((c) => typeof c == "number") && (r.type = "number"),
          a.every((c) => typeof c == "string") && (r.type = "string"),
          a.every((c) => typeof c == "boolean") && (r.type = "boolean"),
          a.every((c) => c === null) && (r.type = "null"),
          (r.enum = a));
  }, "literalProcessor"),
  yl = s((e, t, r, i) => {
    if (t.unrepresentable === "throw") throw new Error("NaN cannot be represented in JSON Schema");
  }, "nanProcessor"),
  bl = s((e, t, r, i) => {
    let o = r,
      a = e._zod.pattern;
    if (!a) throw new Error("Pattern not found in template literal");
    ((o.type = "string"), (o.pattern = a.source));
  }, "templateLiteralProcessor"),
  vl = s((e, t, r, i) => {
    let o = r,
      a = { type: "string", format: "binary", contentEncoding: "binary" },
      { minimum: c, maximum: l, mime: p } = e._zod.bag;
    (c !== void 0 && (a.minLength = c),
      l !== void 0 && (a.maxLength = l),
      p
        ? p.length === 1
          ? ((a.contentMediaType = p[0]), Object.assign(o, a))
          : (Object.assign(o, a), (o.anyOf = p.map((d) => ({ contentMediaType: d }))))
        : Object.assign(o, a));
  }, "fileProcessor"),
  Sl = s((e, t, r, i) => {
    r.type = "boolean";
  }, "successProcessor"),
  _l = s((e, t, r, i) => {
    if (t.unrepresentable === "throw")
      throw new Error("Custom types cannot be represented in JSON Schema");
  }, "customProcessor"),
  xl = s((e, t, r, i) => {
    if (t.unrepresentable === "throw")
      throw new Error("Function types cannot be represented in JSON Schema");
  }, "functionProcessor"),
  kl = s((e, t, r, i) => {
    if (t.unrepresentable === "throw")
      throw new Error("Transforms cannot be represented in JSON Schema");
  }, "transformProcessor"),
  Il = s((e, t, r, i) => {
    if (t.unrepresentable === "throw") throw new Error("Map cannot be represented in JSON Schema");
  }, "mapProcessor"),
  Cl = s((e, t, r, i) => {
    if (t.unrepresentable === "throw") throw new Error("Set cannot be represented in JSON Schema");
  }, "setProcessor"),
  Rl = s((e, t, r, i) => {
    let o = r,
      a = e._zod.def,
      { minimum: c, maximum: l } = e._zod.bag;
    (typeof c == "number" && (o.minItems = c),
      typeof l == "number" && (o.maxItems = l),
      (o.type = "array"),
      (o.items = $(a.element, t, { ...i, path: [...i.path, "items"] })));
  }, "arrayProcessor"),
  Pl = s((e, t, r, i) => {
    let o = r,
      a = e._zod.def;
    ((o.type = "object"), (o.properties = {}));
    let c = a.shape;
    for (let d in c) o.properties[d] = $(c[d], t, { ...i, path: [...i.path, "properties", d] });
    let l = new Set(Object.keys(c)),
      p = new Set(
        [...l].filter((d) => {
          let g = a.shape[d]._zod;
          return t.io === "input" ? g.optin === void 0 : g.optout === void 0;
        }),
      );
    (p.size > 0 && (o.required = Array.from(p)),
      a.catchall?._zod.def.type === "never"
        ? (o.additionalProperties = !1)
        : a.catchall
          ? a.catchall &&
            (o.additionalProperties = $(a.catchall, t, {
              ...i,
              path: [...i.path, "additionalProperties"],
            }))
          : t.io === "output" && (o.additionalProperties = !1));
  }, "objectProcessor"),
  Xo = s((e, t, r, i) => {
    let o = e._zod.def,
      a = o.inclusive === !1,
      c = o.options.map((l, p) => $(l, t, { ...i, path: [...i.path, a ? "oneOf" : "anyOf", p] }));
    a ? (r.oneOf = c) : (r.anyOf = c);
  }, "unionProcessor"),
  Tl = s((e, t, r, i) => {
    let o = e._zod.def,
      a = $(o.left, t, { ...i, path: [...i.path, "allOf", 0] }),
      c = $(o.right, t, { ...i, path: [...i.path, "allOf", 1] }),
      l = s((d) => "allOf" in d && Object.keys(d).length === 1, "isSimpleIntersection"),
      p = [...(l(a) ? a.allOf : [a]), ...(l(c) ? c.allOf : [c])];
    r.allOf = p;
  }, "intersectionProcessor"),
  wl = s((e, t, r, i) => {
    let o = r,
      a = e._zod.def;
    o.type = "array";
    let c = t.target === "draft-2020-12" ? "prefixItems" : "items",
      l = t.target === "draft-2020-12" || t.target === "openapi-3.0" ? "items" : "additionalItems",
      p = a.items.map((S, v) => $(S, t, { ...i, path: [...i.path, c, v] })),
      d = a.rest
        ? $(a.rest, t, {
            ...i,
            path: [...i.path, l, ...(t.target === "openapi-3.0" ? [a.items.length] : [])],
          })
        : null;
    t.target === "draft-2020-12"
      ? ((o.prefixItems = p), d && (o.items = d))
      : t.target === "openapi-3.0"
        ? ((o.items = { anyOf: p }),
          d && o.items.anyOf.push(d),
          (o.minItems = p.length),
          d || (o.maxItems = p.length))
        : ((o.items = p), d && (o.additionalItems = d));
    let { minimum: g, maximum: y } = e._zod.bag;
    (typeof g == "number" && (o.minItems = g), typeof y == "number" && (o.maxItems = y));
  }, "tupleProcessor"),
  El = s((e, t, r, i) => {
    let o = r,
      a = e._zod.def;
    o.type = "object";
    let c = a.keyType,
      p = c._zod.bag?.patterns;
    if (a.mode === "loose" && p && p.size > 0) {
      let g = $(a.valueType, t, { ...i, path: [...i.path, "patternProperties", "*"] });
      o.patternProperties = {};
      for (let y of p) o.patternProperties[y.source] = g;
    } else
      ((t.target === "draft-07" || t.target === "draft-2020-12") &&
        (o.propertyNames = $(a.keyType, t, { ...i, path: [...i.path, "propertyNames"] })),
        (o.additionalProperties = $(a.valueType, t, {
          ...i,
          path: [...i.path, "additionalProperties"],
        })));
    let d = c._zod.values;
    if (d) {
      let g = [...d].filter((y) => typeof y == "string" || typeof y == "number");
      g.length > 0 && (o.required = g);
    }
  }, "recordProcessor"),
  Ol = s((e, t, r, i) => {
    let o = e._zod.def,
      a = $(o.innerType, t, i),
      c = t.seen.get(e);
    t.target === "openapi-3.0"
      ? ((c.ref = o.innerType), (r.nullable = !0))
      : (r.anyOf = [a, { type: "null" }]);
  }, "nullableProcessor"),
  Al = s((e, t, r, i) => {
    let o = e._zod.def;
    $(o.innerType, t, i);
    let a = t.seen.get(e);
    a.ref = o.innerType;
  }, "nonoptionalProcessor"),
  zl = s((e, t, r, i) => {
    let o = e._zod.def;
    $(o.innerType, t, i);
    let a = t.seen.get(e);
    ((a.ref = o.innerType), (r.default = JSON.parse(JSON.stringify(o.defaultValue))));
  }, "defaultProcessor"),
  Ml = s((e, t, r, i) => {
    let o = e._zod.def;
    $(o.innerType, t, i);
    let a = t.seen.get(e);
    ((a.ref = o.innerType),
      t.io === "input" && (r._prefault = JSON.parse(JSON.stringify(o.defaultValue))));
  }, "prefaultProcessor"),
  $l = s((e, t, r, i) => {
    let o = e._zod.def;
    $(o.innerType, t, i);
    let a = t.seen.get(e);
    a.ref = o.innerType;
    let c;
    try {
      c = o.catchValue(void 0);
    } catch {
      throw new Error("Dynamic catch values are not supported in JSON Schema");
    }
    r.default = c;
  }, "catchProcessor"),
  Dl = s((e, t, r, i) => {
    let o = e._zod.def,
      a = t.io === "input" ? (o.in._zod.def.type === "transform" ? o.out : o.in) : o.out;
    $(a, t, i);
    let c = t.seen.get(e);
    c.ref = a;
  }, "pipeProcessor"),
  Ul = s((e, t, r, i) => {
    let o = e._zod.def;
    $(o.innerType, t, i);
    let a = t.seen.get(e);
    ((a.ref = o.innerType), (r.readOnly = !0));
  }, "readonlyProcessor"),
  Nl = s((e, t, r, i) => {
    let o = e._zod.def;
    $(o.innerType, t, i);
    let a = t.seen.get(e);
    a.ref = o.innerType;
  }, "promiseProcessor"),
  Qo = s((e, t, r, i) => {
    let o = e._zod.def;
    $(o.innerType, t, i);
    let a = t.seen.get(e);
    a.ref = o.innerType;
  }, "optionalProcessor"),
  Zl = s((e, t, r, i) => {
    let o = e._zod.innerType;
    $(o, t, i);
    let a = t.seen.get(e);
    a.ref = o;
  }, "lazyProcessor"),
  Yo = {
    string: ol,
    number: rl,
    boolean: il,
    bigint: al,
    symbol: sl,
    null: cl,
    undefined: ll,
    void: dl,
    never: ul,
    any: pl,
    unknown: ml,
    date: gl,
    enum: fl,
    literal: hl,
    nan: yl,
    template_literal: bl,
    file: vl,
    success: Sl,
    custom: _l,
    function: xl,
    transform: kl,
    map: Il,
    set: Cl,
    array: Rl,
    object: Pl,
    union: Xo,
    intersection: Tl,
    tuple: wl,
    record: El,
    nullable: Ol,
    nonoptional: Al,
    default: zl,
    prefault: Ml,
    catch: $l,
    pipe: Dl,
    readonly: Ul,
    promise: Nl,
    optional: Qo,
    lazy: Zl,
  };
function toJSONSchema(e, t) {
  if ("_idmap" in e) {
    let i = e,
      o = initializeContext({ ...t, processors: Yo }),
      a = {};
    for (let p of i._idmap.entries()) {
      let [d, g] = p;
      $(g, o);
    }
    let c = {},
      l = { registry: i, uri: t?.uri, defs: a };
    o.external = l;
    for (let p of i._idmap.entries()) {
      let [d, g] = p;
      (extractDefs(o, g), (c[d] = finalize(o, g)));
    }
    if (Object.keys(a).length > 0) {
      let p = o.target === "draft-2020-12" ? "$defs" : "definitions";
      c.__shared = { [p]: a };
    }
    return { schemas: c };
  }
  let r = initializeContext({ ...t, processors: Yo });
  return ($(e, r), extractDefs(r, e), finalize(r, e));
}
s(toJSONSchema, "toJSONSchema");
var tr = class {
  static {
    s(this, "JSONSchemaGenerator");
  }
  get metadataRegistry() {
    return this.ctx.metadataRegistry;
  }
  get target() {
    return this.ctx.target;
  }
  get unrepresentable() {
    return this.ctx.unrepresentable;
  }
  get override() {
    return this.ctx.override;
  }
  get io() {
    return this.ctx.io;
  }
  get counter() {
    return this.ctx.counter;
  }
  set counter(t) {
    this.ctx.counter = t;
  }
  get seen() {
    return this.ctx.seen;
  }
  constructor(t) {
    let r = t?.target ?? "draft-2020-12";
    (r === "draft-4" && (r = "draft-04"),
      r === "draft-7" && (r = "draft-07"),
      (this.ctx = initializeContext({
        processors: Yo,
        target: r,
        ...(t?.metadata && { metadata: t.metadata }),
        ...(t?.unrepresentable && { unrepresentable: t.unrepresentable }),
        ...(t?.override && { override: t.override }),
        ...(t?.io && { io: t.io }),
      })));
  }
  process(t, r = { path: [], schemaPath: [] }) {
    return $(t, this.ctx, r);
  }
  emit(t, r) {
    (r &&
      (r.cycles && (this.ctx.cycles = r.cycles),
      r.reused && (this.ctx.reused = r.reused),
      r.external && (this.ctx.external = r.external)),
      extractDefs(this.ctx, t));
    let i = finalize(this.ctx, t),
      { "~standard": o, ...a } = i;
    return a;
  }
};
var Bp = {};
var In = {};
Re(In, {
  ZodAny: () => ld,
  ZodArray: () => md,
  ZodBase64: () => xr,
  ZodBase64URL: () => kr,
  ZodBigInt: () => Ut,
  ZodBigIntFormat: () => Rr,
  ZodBoolean: () => Dt,
  ZodCIDRv4: () => Sr,
  ZodCIDRv6: () => _r,
  ZodCUID: () => mr,
  ZodCUID2: () => gr,
  ZodCatch: () => $d,
  ZodCodec: () => Mr,
  ZodCustom: () => $n,
  ZodCustomStringFormat: () => Mt,
  ZodDate: () => En,
  ZodDefault: () => wd,
  ZodDiscriminatedUnion: () => fd,
  ZodE164: () => Ir,
  ZodEmail: () => dr,
  ZodEmoji: () => ur,
  ZodEnum: () => At,
  ZodExactOptional: () => Rd,
  ZodFile: () => Id,
  ZodFunction: () => Fd,
  ZodGUID: () => Cn,
  ZodIPv4: () => br,
  ZodIPv6: () => vr,
  ZodIntersection: () => hd,
  ZodJWT: () => Cr,
  ZodKSUID: () => yr,
  ZodLazy: () => Bd,
  ZodLiteral: () => kd,
  ZodMAC: () => nd,
  ZodMap: () => _d,
  ZodNaN: () => Ud,
  ZodNanoID: () => pr,
  ZodNever: () => ud,
  ZodNonOptional: () => Ar,
  ZodNull: () => sd,
  ZodNullable: () => Td,
  ZodNumber: () => $t,
  ZodNumberFormat: () => tt,
  ZodObject: () => An,
  ZodOptional: () => Or,
  ZodPipe: () => zr,
  ZodPrefault: () => Od,
  ZodPromise: () => Wd,
  ZodReadonly: () => Nd,
  ZodRecord: () => Mn,
  ZodSet: () => xd,
  ZodString: () => zt,
  ZodStringFormat: () => N,
  ZodSuccess: () => Md,
  ZodSymbol: () => id,
  ZodTemplateLiteral: () => jd,
  ZodTransform: () => Cd,
  ZodTuple: () => bd,
  ZodType: () => O,
  ZodULID: () => fr,
  ZodURL: () => wn,
  ZodUUID: () => xe,
  ZodUndefined: () => ad,
  ZodUnion: () => zn,
  ZodUnknown: () => dd,
  ZodVoid: () => pd,
  ZodXID: () => hr,
  ZodXor: () => gd,
  _ZodString: () => lr,
  _default: () => Ed,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base64,
  base64url: () => base64url,
  bigint: () => bigint,
  boolean: () => boolean,
  catch: () => Dd,
  check: () => check,
  cidrv4: () => cidrv4,
  cidrv6: () => cidrv6,
  codec: () => codec,
  cuid: () => cuid,
  cuid2: () => cuid2,
  custom: () => custom,
  date: () => Tm,
  describe: () => Ym,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e164,
  email: () => email,
  emoji: () => Yp,
  enum: () => wr,
  exactOptional: () => exactOptional,
  file: () => file,
  float32: () => float32,
  float64: () => float64,
  function: () => _function,
  guid: () => guid,
  hash: () => hash,
  hex: () => hex,
  hostname: () => hostname,
  httpUrl: () => httpUrl,
  instanceof: () => _instanceof,
  int: () => int,
  int32: () => int32,
  int64: () => int64,
  intersection: () => intersection,
  ipv4: () => ipv4,
  ipv6: () => ipv6,
  json: () => json,
  jwt: () => jwt,
  keyof: () => keyof,
  ksuid: () => ksuid,
  lazy: () => lazy,
  literal: () => literal,
  looseObject: () => looseObject,
  looseRecord: () => looseRecord,
  mac: () => mac,
  map: () => map,
  meta: () => Xm,
  nan: () => nan,
  nanoid: () => nanoid,
  nativeEnum: () => nativeEnum,
  never: () => never,
  nonoptional: () => nonoptional,
  null: () => cd,
  nullable: () => nullable,
  nullish: () => Lm,
  number: () => number,
  object: () => object,
  optional: () => optional,
  partialRecord: () => partialRecord,
  pipe: () => pipe,
  prefault: () => prefault,
  preprocess: () => preprocess,
  promise: () => promise,
  readonly: () => readonly,
  record: () => record,
  refine: () => refine,
  set: () => set,
  strictObject: () => strictObject,
  string: () => string,
  stringFormat: () => stringFormat,
  stringbool: () => eg,
  success: () => success,
  superRefine: () => superRefine,
  symbol: () => symbol,
  templateLiteral: () => templateLiteral,
  transform: () => transform,
  tuple: () => tuple,
  uint32: () => uint32,
  uint64: () => uint64,
  ulid: () => ulid,
  undefined: () => Cm,
  union: () => union,
  unknown: () => unknown,
  url: () => url,
  uuid: () => uuid,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => Pm,
  xid: () => xid,
  xor: () => xor,
});
var nr = {};
Re(nr, {
  endsWith: () => _endsWith,
  gt: () => _gt,
  gte: () => _gte,
  includes: () => _includes,
  length: () => _length,
  lowercase: () => _lowercase,
  lt: () => _lt,
  lte: () => _lte,
  maxLength: () => _maxLength,
  maxSize: () => _maxSize,
  mime: () => _mime,
  minLength: () => _minLength,
  minSize: () => _minSize,
  multipleOf: () => _multipleOf,
  negative: () => _negative,
  nonnegative: () => _nonnegative,
  nonpositive: () => _nonpositive,
  normalize: () => _normalize,
  overwrite: () => _overwrite,
  positive: () => _positive,
  property: () => _property,
  regex: () => _regex,
  size: () => _size,
  slugify: () => _slugify,
  startsWith: () => _startsWith,
  toLowerCase: () => _toLowerCase,
  toUpperCase: () => _toUpperCase,
  trim: () => _trim,
  uppercase: () => _uppercase,
});
var Ot = {};
Re(Ot, {
  ZodISODate: () => rr,
  ZodISODateTime: () => or,
  ZodISODuration: () => ar,
  ZodISOTime: () => ir,
  date: () => date,
  datetime: () => jl,
  duration: () => duration,
  time: () => Ll,
});
var or = $constructor("ZodISODateTime", (e, t) => {
  (Ca.init(e, t), N.init(e, t));
});
function jl(e) {
  return _isoDateTime(or, e);
}
s(jl, "datetime");
var rr = $constructor("ZodISODate", (e, t) => {
  (Ra.init(e, t), N.init(e, t));
});
function date(e) {
  return _isoDate(rr, e);
}
s(date, "date");
var ir = $constructor("ZodISOTime", (e, t) => {
  (Pa.init(e, t), N.init(e, t));
});
function Ll(e) {
  return _isoTime(ir, e);
}
s(Ll, "time");
var ar = $constructor("ZodISODuration", (e, t) => {
  (Ta.init(e, t), N.init(e, t));
});
function duration(e) {
  return _isoDuration(ar, e);
}
s(duration, "duration");
var Lp = s((e, t) => {
    (cn.init(e, t),
      (e.name = "ZodError"),
      Object.defineProperties(e, {
        format: { value: s((r) => formatError(e, r), "value") },
        flatten: { value: s((r) => flattenError(e, r), "value") },
        addIssue: {
          value: s((r) => {
            (e.issues.push(r), (e.message = JSON.stringify(e.issues, jsonStringifyReplacer, 2)));
          }, "value"),
        },
        addIssues: {
          value: s((r) => {
            (e.issues.push(...r), (e.message = JSON.stringify(e.issues, jsonStringifyReplacer, 2)));
          }, "value"),
        },
        isEmpty: {
          get() {
            return e.issues.length === 0;
          },
        },
      }));
  }, "initializer"),
  zv = $constructor("ZodError", Lp),
  ne = $constructor("ZodError", Lp, { Parent: Error });
var Fl = ut(ne),
  ql = pt(ne),
  Vl = mt(ne),
  Gl = gt(ne),
  Kl = no(ne),
  Hl = oo(ne),
  Jl = ro(ne),
  Yl = io(ne),
  Xl = ao(ne),
  Ql = so(ne),
  ed = co(ne),
  td = lo(ne);
var O = $constructor(
    "ZodType",
    (e, t) => (
      E.init(e, t),
      Object.assign(e["~standard"], {
        jsonSchema: { input: Et(e, "input"), output: Et(e, "output") },
      }),
      (e.toJSONSchema = nl(e, {})),
      (e.def = t),
      (e.type = t.type),
      Object.defineProperty(e, "_def", { value: t }),
      (e.check = (...r) =>
        e.clone(
          k.mergeDefs(t, {
            checks: [
              ...(t.checks ?? []),
              ...r.map((i) =>
                typeof i == "function"
                  ? { _zod: { check: i, def: { check: "custom" }, onattach: [] } }
                  : i,
              ),
            ],
          }),
          { parent: !0 },
        )),
      (e.with = e.check),
      (e.clone = (r, i) => clone(e, r, i)),
      (e.brand = () => e),
      (e.register = (r, i) => (r.add(e, i), e)),
      (e.parse = (r, i) => Fl(e, r, i, { callee: e.parse })),
      (e.safeParse = (r, i) => Vl(e, r, i)),
      (e.parseAsync = async (r, i) => ql(e, r, i, { callee: e.parseAsync })),
      (e.safeParseAsync = async (r, i) => Gl(e, r, i)),
      (e.spa = e.safeParseAsync),
      (e.encode = (r, i) => Kl(e, r, i)),
      (e.decode = (r, i) => Hl(e, r, i)),
      (e.encodeAsync = async (r, i) => Jl(e, r, i)),
      (e.decodeAsync = async (r, i) => Yl(e, r, i)),
      (e.safeEncode = (r, i) => Xl(e, r, i)),
      (e.safeDecode = (r, i) => Ql(e, r, i)),
      (e.safeEncodeAsync = async (r, i) => ed(e, r, i)),
      (e.safeDecodeAsync = async (r, i) => td(e, r, i)),
      (e.refine = (r, i) => e.check(refine(r, i))),
      (e.superRefine = (r) => e.check(superRefine(r))),
      (e.overwrite = (r) => e.check(_overwrite(r))),
      (e.optional = () => optional(e)),
      (e.exactOptional = () => exactOptional(e)),
      (e.nullable = () => nullable(e)),
      (e.nullish = () => optional(nullable(e))),
      (e.nonoptional = (r) => nonoptional(e, r)),
      (e.array = () => array(e)),
      (e.or = (r) => union([e, r])),
      (e.and = (r) => intersection(e, r)),
      (e.transform = (r) => pipe(e, transform(r))),
      (e.default = (r) => Ed(e, r)),
      (e.prefault = (r) => prefault(e, r)),
      (e.catch = (r) => Dd(e, r)),
      (e.pipe = (r) => pipe(e, r)),
      (e.readonly = () => readonly(e)),
      (e.describe = (r) => {
        let i = e.clone();
        return (V.add(i, { description: r }), i);
      }),
      Object.defineProperty(e, "description", {
        get() {
          return V.get(e)?.description;
        },
        configurable: !0,
      }),
      (e.meta = (...r) => {
        if (r.length === 0) return V.get(e);
        let i = e.clone();
        return (V.add(i, r[0]), i);
      }),
      (e.isOptional = () => e.safeParse(void 0).success),
      (e.isNullable = () => e.safeParse(null).success),
      (e.apply = (r) => r(e)),
      e
    ),
  ),
  lr = $constructor("_ZodString", (e, t) => {
    (Je.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (i, o, a) => ol(e, i, o, a)));
    let r = e._zod.bag;
    ((e.format = r.format ?? null),
      (e.minLength = r.minimum ?? null),
      (e.maxLength = r.maximum ?? null),
      (e.regex = (...i) => e.check(_regex(...i))),
      (e.includes = (...i) => e.check(_includes(...i))),
      (e.startsWith = (...i) => e.check(_startsWith(...i))),
      (e.endsWith = (...i) => e.check(_endsWith(...i))),
      (e.min = (...i) => e.check(_minLength(...i))),
      (e.max = (...i) => e.check(_maxLength(...i))),
      (e.length = (...i) => e.check(_length(...i))),
      (e.nonempty = (...i) => e.check(_minLength(1, ...i))),
      (e.lowercase = (i) => e.check(_lowercase(i))),
      (e.uppercase = (i) => e.check(_uppercase(i))),
      (e.trim = () => e.check(_trim())),
      (e.normalize = (...i) => e.check(_normalize(...i))),
      (e.toLowerCase = () => e.check(_toLowerCase())),
      (e.toUpperCase = () => e.check(_toUpperCase())),
      (e.slugify = () => e.check(_slugify())));
  }),
  zt = $constructor("ZodString", (e, t) => {
    (Je.init(e, t),
      lr.init(e, t),
      (e.email = (r) => e.check(_email(dr, r))),
      (e.url = (r) => e.check(_url(wn, r))),
      (e.jwt = (r) => e.check(_jwt(Cr, r))),
      (e.emoji = (r) => e.check(_emoji(ur, r))),
      (e.guid = (r) => e.check(_guid(Cn, r))),
      (e.uuid = (r) => e.check(_uuid(xe, r))),
      (e.uuidv4 = (r) => e.check(_uuidv4(xe, r))),
      (e.uuidv6 = (r) => e.check(_uuidv6(xe, r))),
      (e.uuidv7 = (r) => e.check(_uuidv7(xe, r))),
      (e.nanoid = (r) => e.check(_nanoid(pr, r))),
      (e.guid = (r) => e.check(_guid(Cn, r))),
      (e.cuid = (r) => e.check(_cuid(mr, r))),
      (e.cuid2 = (r) => e.check(_cuid2(gr, r))),
      (e.ulid = (r) => e.check(_ulid(fr, r))),
      (e.base64 = (r) => e.check(_base64(xr, r))),
      (e.base64url = (r) => e.check(_base64url(kr, r))),
      (e.xid = (r) => e.check(_xid(hr, r))),
      (e.ksuid = (r) => e.check(_ksuid(yr, r))),
      (e.ipv4 = (r) => e.check(_ipv4(br, r))),
      (e.ipv6 = (r) => e.check(_ipv6(vr, r))),
      (e.cidrv4 = (r) => e.check(_cidrv4(Sr, r))),
      (e.cidrv6 = (r) => e.check(_cidrv6(_r, r))),
      (e.e164 = (r) => e.check(_e164(Ir, r))),
      (e.datetime = (r) => e.check(jl(r))),
      (e.date = (r) => e.check(date(r))),
      (e.time = (r) => e.check(Ll(r))),
      (e.duration = (r) => e.check(duration(r))));
  });
function string(e) {
  return _string(zt, e);
}
s(string, "string");
var N = $constructor("ZodStringFormat", (e, t) => {
    (U.init(e, t), lr.init(e, t));
  }),
  dr = $constructor("ZodEmail", (e, t) => {
    (ha.init(e, t), N.init(e, t));
  });
function email(e) {
  return _email(dr, e);
}
s(email, "email");
var Cn = $constructor("ZodGUID", (e, t) => {
  (ga.init(e, t), N.init(e, t));
});
function guid(e) {
  return _guid(Cn, e);
}
s(guid, "guid");
var xe = $constructor("ZodUUID", (e, t) => {
  (fa.init(e, t), N.init(e, t));
});
function uuid(e) {
  return _uuid(xe, e);
}
s(uuid, "uuid");
function uuidv4(e) {
  return _uuidv4(xe, e);
}
s(uuidv4, "uuidv4");
function uuidv6(e) {
  return _uuidv6(xe, e);
}
s(uuidv6, "uuidv6");
function uuidv7(e) {
  return _uuidv7(xe, e);
}
s(uuidv7, "uuidv7");
var wn = $constructor("ZodURL", (e, t) => {
  (ya.init(e, t), N.init(e, t));
});
function url(e) {
  return _url(wn, e);
}
s(url, "url");
function httpUrl(e) {
  return _url(wn, { protocol: /^https?$/, hostname: de.domain, ...k.normalizeParams(e) });
}
s(httpUrl, "httpUrl");
var ur = $constructor("ZodEmoji", (e, t) => {
  (ba.init(e, t), N.init(e, t));
});
function Yp(e) {
  return _emoji(ur, e);
}
s(Yp, "emoji");
var pr = $constructor("ZodNanoID", (e, t) => {
  (va.init(e, t), N.init(e, t));
});
function nanoid(e) {
  return _nanoid(pr, e);
}
s(nanoid, "nanoid");
var mr = $constructor("ZodCUID", (e, t) => {
  (Sa.init(e, t), N.init(e, t));
});
function cuid(e) {
  return _cuid(mr, e);
}
s(cuid, "cuid");
var gr = $constructor("ZodCUID2", (e, t) => {
  (_a.init(e, t), N.init(e, t));
});
function cuid2(e) {
  return _cuid2(gr, e);
}
s(cuid2, "cuid2");
var fr = $constructor("ZodULID", (e, t) => {
  (xa.init(e, t), N.init(e, t));
});
function ulid(e) {
  return _ulid(fr, e);
}
s(ulid, "ulid");
var hr = $constructor("ZodXID", (e, t) => {
  (ka.init(e, t), N.init(e, t));
});
function xid(e) {
  return _xid(hr, e);
}
s(xid, "xid");
var yr = $constructor("ZodKSUID", (e, t) => {
  (Ia.init(e, t), N.init(e, t));
});
function ksuid(e) {
  return _ksuid(yr, e);
}
s(ksuid, "ksuid");
var br = $constructor("ZodIPv4", (e, t) => {
  (wa.init(e, t), N.init(e, t));
});
function ipv4(e) {
  return _ipv4(br, e);
}
s(ipv4, "ipv4");
var nd = $constructor("ZodMAC", (e, t) => {
  (Oa.init(e, t), N.init(e, t));
});
function mac(e) {
  return _mac(nd, e);
}
s(mac, "mac");
var vr = $constructor("ZodIPv6", (e, t) => {
  (Ea.init(e, t), N.init(e, t));
});
function ipv6(e) {
  return _ipv6(vr, e);
}
s(ipv6, "ipv6");
var Sr = $constructor("ZodCIDRv4", (e, t) => {
  (Aa.init(e, t), N.init(e, t));
});
function cidrv4(e) {
  return _cidrv4(Sr, e);
}
s(cidrv4, "cidrv4");
var _r = $constructor("ZodCIDRv6", (e, t) => {
  (za.init(e, t), N.init(e, t));
});
function cidrv6(e) {
  return _cidrv6(_r, e);
}
s(cidrv6, "cidrv6");
var xr = $constructor("ZodBase64", (e, t) => {
  ($a.init(e, t), N.init(e, t));
});
function base64(e) {
  return _base64(xr, e);
}
s(base64, "base64");
var kr = $constructor("ZodBase64URL", (e, t) => {
  (Da.init(e, t), N.init(e, t));
});
function base64url(e) {
  return _base64url(kr, e);
}
s(base64url, "base64url");
var Ir = $constructor("ZodE164", (e, t) => {
  (Ua.init(e, t), N.init(e, t));
});
function e164(e) {
  return _e164(Ir, e);
}
s(e164, "e164");
var Cr = $constructor("ZodJWT", (e, t) => {
  (Na.init(e, t), N.init(e, t));
});
function jwt(e) {
  return _jwt(Cr, e);
}
s(jwt, "jwt");
var Mt = $constructor("ZodCustomStringFormat", (e, t) => {
  (Za.init(e, t), N.init(e, t));
});
function stringFormat(e, t, r = {}) {
  return _stringFormat(Mt, e, t, r);
}
s(stringFormat, "stringFormat");
function hostname(e) {
  return _stringFormat(Mt, "hostname", de.hostname, e);
}
s(hostname, "hostname");
function hex(e) {
  return _stringFormat(Mt, "hex", de.hex, e);
}
s(hex, "hex");
function hash(e, t) {
  let r = t?.enc ?? "hex",
    i = `${e}_${r}`,
    o = de[i];
  if (!o) throw new Error(`Unrecognized hash format: ${i}`);
  return _stringFormat(Mt, i, o, t);
}
s(hash, "hash");
var $t = $constructor("ZodNumber", (e, t) => {
  (So.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (i, o, a) => rl(e, i, o, a)),
    (e.gt = (i, o) => e.check(_gt(i, o))),
    (e.gte = (i, o) => e.check(_gte(i, o))),
    (e.min = (i, o) => e.check(_gte(i, o))),
    (e.lt = (i, o) => e.check(_lt(i, o))),
    (e.lte = (i, o) => e.check(_lte(i, o))),
    (e.max = (i, o) => e.check(_lte(i, o))),
    (e.int = (i) => e.check(int(i))),
    (e.safe = (i) => e.check(int(i))),
    (e.positive = (i) => e.check(_gt(0, i))),
    (e.nonnegative = (i) => e.check(_gte(0, i))),
    (e.negative = (i) => e.check(_lt(0, i))),
    (e.nonpositive = (i) => e.check(_lte(0, i))),
    (e.multipleOf = (i, o) => e.check(_multipleOf(i, o))),
    (e.step = (i, o) => e.check(_multipleOf(i, o))),
    (e.finite = () => e));
  let r = e._zod.bag;
  ((e.minValue =
    Math.max(
      r.minimum ?? Number.NEGATIVE_INFINITY,
      r.exclusiveMinimum ?? Number.NEGATIVE_INFINITY,
    ) ?? null),
    (e.maxValue =
      Math.min(
        r.maximum ?? Number.POSITIVE_INFINITY,
        r.exclusiveMaximum ?? Number.POSITIVE_INFINITY,
      ) ?? null),
    (e.isInt = (r.format ?? "").includes("int") || Number.isSafeInteger(r.multipleOf ?? 0.5)),
    (e.isFinite = !0),
    (e.format = r.format ?? null));
});
function number(e) {
  return _number($t, e);
}
s(number, "number");
var tt = $constructor("ZodNumberFormat", (e, t) => {
  (ja.init(e, t), $t.init(e, t));
});
function int(e) {
  return _int(tt, e);
}
s(int, "int");
function float32(e) {
  return _float32(tt, e);
}
s(float32, "float32");
function float64(e) {
  return _float64(tt, e);
}
s(float64, "float64");
function int32(e) {
  return _int32(tt, e);
}
s(int32, "int32");
function uint32(e) {
  return _uint32(tt, e);
}
s(uint32, "uint32");
var Dt = $constructor("ZodBoolean", (e, t) => {
  (gn.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => il(e, r, i, o)));
});
function boolean(e) {
  return _boolean(Dt, e);
}
s(boolean, "boolean");
var Ut = $constructor("ZodBigInt", (e, t) => {
  (_o.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (i, o, a) => al(e, i, o, a)),
    (e.gte = (i, o) => e.check(_gte(i, o))),
    (e.min = (i, o) => e.check(_gte(i, o))),
    (e.gt = (i, o) => e.check(_gt(i, o))),
    (e.gte = (i, o) => e.check(_gte(i, o))),
    (e.min = (i, o) => e.check(_gte(i, o))),
    (e.lt = (i, o) => e.check(_lt(i, o))),
    (e.lte = (i, o) => e.check(_lte(i, o))),
    (e.max = (i, o) => e.check(_lte(i, o))),
    (e.positive = (i) => e.check(_gt(BigInt(0), i))),
    (e.negative = (i) => e.check(_lt(BigInt(0), i))),
    (e.nonpositive = (i) => e.check(_lte(BigInt(0), i))),
    (e.nonnegative = (i) => e.check(_gte(BigInt(0), i))),
    (e.multipleOf = (i, o) => e.check(_multipleOf(i, o))));
  let r = e._zod.bag;
  ((e.minValue = r.minimum ?? null),
    (e.maxValue = r.maximum ?? null),
    (e.format = r.format ?? null));
});
function bigint(e) {
  return _bigint(Ut, e);
}
s(bigint, "bigint");
var Rr = $constructor("ZodBigIntFormat", (e, t) => {
  (Ba.init(e, t), Ut.init(e, t));
});
function int64(e) {
  return _int64(Rr, e);
}
s(int64, "int64");
function uint64(e) {
  return _uint64(Rr, e);
}
s(uint64, "uint64");
var id = $constructor("ZodSymbol", (e, t) => {
  (La.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => sl(e, r, i, o)));
});
function symbol(e) {
  return _symbol(id, e);
}
s(symbol, "symbol");
var ad = $constructor("ZodUndefined", (e, t) => {
  (Wa.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => ll(e, r, i, o)));
});
function Cm(e) {
  return _undefined(ad, e);
}
s(Cm, "_undefined");
var sd = $constructor("ZodNull", (e, t) => {
  (Fa.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => cl(e, r, i, o)));
});
function cd(e) {
  return _null(sd, e);
}
s(cd, "_null");
var ld = $constructor("ZodAny", (e, t) => {
  (qa.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => pl(e, r, i, o)));
});
function any() {
  return _any(ld);
}
s(any, "any");
var dd = $constructor("ZodUnknown", (e, t) => {
  (Va.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => ml(e, r, i, o)));
});
function unknown() {
  return _unknown(dd);
}
s(unknown, "unknown");
var ud = $constructor("ZodNever", (e, t) => {
  (Ga.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => ul(e, r, i, o)));
});
function never(e) {
  return _never(ud, e);
}
s(never, "never");
var pd = $constructor("ZodVoid", (e, t) => {
  (Ka.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => dl(e, r, i, o)));
});
function Pm(e) {
  return _void(pd, e);
}
s(Pm, "_void");
var En = $constructor("ZodDate", (e, t) => {
  (Ha.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (i, o, a) => gl(e, i, o, a)),
    (e.min = (i, o) => e.check(_gte(i, o))),
    (e.max = (i, o) => e.check(_lte(i, o))));
  let r = e._zod.bag;
  ((e.minDate = r.minimum ? new Date(r.minimum) : null),
    (e.maxDate = r.maximum ? new Date(r.maximum) : null));
});
function Tm(e) {
  return _date(En, e);
}
s(Tm, "date");
var md = $constructor("ZodArray", (e, t) => {
  (Ja.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Rl(e, r, i, o)),
    (e.element = t.element),
    (e.min = (r, i) => e.check(_minLength(r, i))),
    (e.nonempty = (r) => e.check(_minLength(1, r))),
    (e.max = (r, i) => e.check(_maxLength(r, i))),
    (e.length = (r, i) => e.check(_length(r, i))),
    (e.unwrap = () => e.element));
});
function array(e, t) {
  return _array(md, e, t);
}
s(array, "array");
function keyof(e) {
  let t = e._zod.def.shape;
  return wr(Object.keys(t));
}
s(keyof, "keyof");
var An = $constructor("ZodObject", (e, t) => {
  (Ya.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Pl(e, r, i, o)),
    k.defineLazy(e, "shape", () => t.shape),
    (e.keyof = () => wr(Object.keys(e._zod.def.shape))),
    (e.catchall = (r) => e.clone({ ...e._zod.def, catchall: r })),
    (e.passthrough = () => e.clone({ ...e._zod.def, catchall: unknown() })),
    (e.loose = () => e.clone({ ...e._zod.def, catchall: unknown() })),
    (e.strict = () => e.clone({ ...e._zod.def, catchall: never() })),
    (e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 })),
    (e.extend = (r) => k.extend(e, r)),
    (e.safeExtend = (r) => k.safeExtend(e, r)),
    (e.merge = (r) => k.merge(e, r)),
    (e.pick = (r) => k.pick(e, r)),
    (e.omit = (r) => k.omit(e, r)),
    (e.partial = (...r) => k.partial(Or, e, r[0])),
    (e.required = (...r) => k.required(Ar, e, r[0])));
});
function object(e, t) {
  let r = { type: "object", shape: e ?? {}, ...k.normalizeParams(t) };
  return new An(r);
}
s(object, "object");
function strictObject(e, t) {
  return new An({ type: "object", shape: e, catchall: never(), ...k.normalizeParams(t) });
}
s(strictObject, "strictObject");
function looseObject(e, t) {
  return new An({ type: "object", shape: e, catchall: unknown(), ...k.normalizeParams(t) });
}
s(looseObject, "looseObject");
var zn = $constructor("ZodUnion", (e, t) => {
  (fn.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Xo(e, r, i, o)),
    (e.options = t.options));
});
function union(e, t) {
  return new zn({ type: "union", options: e, ...k.normalizeParams(t) });
}
s(union, "union");
var gd = $constructor("ZodXor", (e, t) => {
  (zn.init(e, t),
    Xa.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Xo(e, r, i, o)),
    (e.options = t.options));
});
function xor(e, t) {
  return new gd({ type: "union", options: e, inclusive: !1, ...k.normalizeParams(t) });
}
s(xor, "xor");
var fd = $constructor("ZodDiscriminatedUnion", (e, t) => {
  (zn.init(e, t), Qa.init(e, t));
});
function discriminatedUnion(e, t, r) {
  return new fd({ type: "union", options: t, discriminator: e, ...k.normalizeParams(r) });
}
s(discriminatedUnion, "discriminatedUnion");
var hd = $constructor("ZodIntersection", (e, t) => {
  (es.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => Tl(e, r, i, o)));
});
function intersection(e, t) {
  return new hd({ type: "intersection", left: e, right: t });
}
s(intersection, "intersection");
var bd = $constructor("ZodTuple", (e, t) => {
  (xo.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => wl(e, r, i, o)),
    (e.rest = (r) => e.clone({ ...e._zod.def, rest: r })));
});
function tuple(e, t, r) {
  let i = t instanceof E,
    o = i ? r : t,
    a = i ? t : null;
  return new bd({ type: "tuple", items: e, rest: a, ...k.normalizeParams(o) });
}
s(tuple, "tuple");
var Mn = $constructor("ZodRecord", (e, t) => {
  (ts.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => El(e, r, i, o)),
    (e.keyType = t.keyType),
    (e.valueType = t.valueType));
});
function record(e, t, r) {
  return new Mn({ type: "record", keyType: e, valueType: t, ...k.normalizeParams(r) });
}
s(record, "record");
function partialRecord(e, t, r) {
  let i = clone(e);
  return (
    (i._zod.values = void 0),
    new Mn({ type: "record", keyType: i, valueType: t, ...k.normalizeParams(r) })
  );
}
s(partialRecord, "partialRecord");
function looseRecord(e, t, r) {
  return new Mn({
    type: "record",
    keyType: e,
    valueType: t,
    mode: "loose",
    ...k.normalizeParams(r),
  });
}
s(looseRecord, "looseRecord");
var _d = $constructor("ZodMap", (e, t) => {
  (ns.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Il(e, r, i, o)),
    (e.keyType = t.keyType),
    (e.valueType = t.valueType),
    (e.min = (...r) => e.check(_minSize(...r))),
    (e.nonempty = (r) => e.check(_minSize(1, r))),
    (e.max = (...r) => e.check(_maxSize(...r))),
    (e.size = (...r) => e.check(_size(...r))));
});
function map(e, t, r) {
  return new _d({ type: "map", keyType: e, valueType: t, ...k.normalizeParams(r) });
}
s(map, "map");
var xd = $constructor("ZodSet", (e, t) => {
  (os.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Cl(e, r, i, o)),
    (e.min = (...r) => e.check(_minSize(...r))),
    (e.nonempty = (r) => e.check(_minSize(1, r))),
    (e.max = (...r) => e.check(_maxSize(...r))),
    (e.size = (...r) => e.check(_size(...r))));
});
function set(e, t) {
  return new xd({ type: "set", valueType: e, ...k.normalizeParams(t) });
}
s(set, "set");
var At = $constructor("ZodEnum", (e, t) => {
  (rs.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (i, o, a) => fl(e, i, o, a)),
    (e.enum = t.entries),
    (e.options = Object.values(t.entries)));
  let r = new Set(Object.keys(t.entries));
  ((e.extract = (i, o) => {
    let a = {};
    for (let c of i)
      if (r.has(c)) a[c] = t.entries[c];
      else throw new Error(`Key ${c} not found in enum`);
    return new At({ ...t, checks: [], ...k.normalizeParams(o), entries: a });
  }),
    (e.exclude = (i, o) => {
      let a = { ...t.entries };
      for (let c of i)
        if (r.has(c)) delete a[c];
        else throw new Error(`Key ${c} not found in enum`);
      return new At({ ...t, checks: [], ...k.normalizeParams(o), entries: a });
    }));
});
function wr(e, t) {
  let r = Array.isArray(e) ? Object.fromEntries(e.map((i) => [i, i])) : e;
  return new At({ type: "enum", entries: r, ...k.normalizeParams(t) });
}
s(wr, "_enum");
function nativeEnum(e, t) {
  return new At({ type: "enum", entries: e, ...k.normalizeParams(t) });
}
s(nativeEnum, "nativeEnum");
var kd = $constructor("ZodLiteral", (e, t) => {
  (is.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => hl(e, r, i, o)),
    (e.values = new Set(t.values)),
    Object.defineProperty(e, "value", {
      get() {
        if (t.values.length > 1)
          throw new Error(
            "This schema contains multiple valid literal values. Use `.values` instead.",
          );
        return t.values[0];
      },
    }));
});
function literal(e, t) {
  return new kd({ type: "literal", values: Array.isArray(e) ? e : [e], ...k.normalizeParams(t) });
}
s(literal, "literal");
var Id = $constructor("ZodFile", (e, t) => {
  (as.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => vl(e, r, i, o)),
    (e.min = (r, i) => e.check(_minSize(r, i))),
    (e.max = (r, i) => e.check(_maxSize(r, i))),
    (e.mime = (r, i) => e.check(_mime(Array.isArray(r) ? r : [r], i))));
});
function file(e) {
  return _file(Id, e);
}
s(file, "file");
var Cd = $constructor("ZodTransform", (e, t) => {
  (ss.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => kl(e, r, i, o)),
    (e._zod.parse = (r, i) => {
      if (i.direction === "backward") throw new Me(e.constructor.name);
      r.addIssue = (a) => {
        if (typeof a == "string") r.issues.push(k.issue(a, r.value, t));
        else {
          let c = a;
          (c.fatal && (c.continue = !1),
            c.code ?? (c.code = "custom"),
            c.input ?? (c.input = r.value),
            c.inst ?? (c.inst = e),
            r.issues.push(k.issue(c)));
        }
      };
      let o = t.transform(r.value, r);
      return o instanceof Promise ? o.then((a) => ((r.value = a), r)) : ((r.value = o), r);
    }));
});
function transform(e) {
  return new Cd({ type: "transform", transform: e });
}
s(transform, "transform");
var Or = $constructor("ZodOptional", (e, t) => {
  (ko.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Qo(e, r, i, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function optional(e) {
  return new Or({ type: "optional", innerType: e });
}
s(optional, "optional");
var Rd = $constructor("ZodExactOptional", (e, t) => {
  (cs.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Qo(e, r, i, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function exactOptional(e) {
  return new Rd({ type: "optional", innerType: e });
}
s(exactOptional, "exactOptional");
var Td = $constructor("ZodNullable", (e, t) => {
  (ls.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Ol(e, r, i, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function nullable(e) {
  return new Td({ type: "nullable", innerType: e });
}
s(nullable, "nullable");
function Lm(e) {
  return optional(nullable(e));
}
s(Lm, "nullish");
var wd = $constructor("ZodDefault", (e, t) => {
  (ds.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => zl(e, r, i, o)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeDefault = e.unwrap));
});
function Ed(e, t) {
  return new wd({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : k.shallowClone(t);
    },
  });
}
s(Ed, "_default");
var Od = $constructor("ZodPrefault", (e, t) => {
  (us.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Ml(e, r, i, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function prefault(e, t) {
  return new Od({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : k.shallowClone(t);
    },
  });
}
s(prefault, "prefault");
var Ar = $constructor("ZodNonOptional", (e, t) => {
  (ps.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Al(e, r, i, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function nonoptional(e, t) {
  return new Ar({ type: "nonoptional", innerType: e, ...k.normalizeParams(t) });
}
s(nonoptional, "nonoptional");
var Md = $constructor("ZodSuccess", (e, t) => {
  (ms.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Sl(e, r, i, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function success(e) {
  return new Md({ type: "success", innerType: e });
}
s(success, "success");
var $d = $constructor("ZodCatch", (e, t) => {
  (gs.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => $l(e, r, i, o)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeCatch = e.unwrap));
});
function Dd(e, t) {
  return new $d({ type: "catch", innerType: e, catchValue: typeof t == "function" ? t : () => t });
}
s(Dd, "_catch");
var Ud = $constructor("ZodNaN", (e, t) => {
  (fs.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => yl(e, r, i, o)));
});
function nan(e) {
  return _nan(Ud, e);
}
s(nan, "nan");
var zr = $constructor("ZodPipe", (e, t) => {
  (hs.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Dl(e, r, i, o)),
    (e.in = t.in),
    (e.out = t.out));
});
function pipe(e, t) {
  return new zr({ type: "pipe", in: e, out: t });
}
s(pipe, "pipe");
var Mr = $constructor("ZodCodec", (e, t) => {
  (zr.init(e, t), hn.init(e, t));
});
function codec(e, t, r) {
  return new Mr({ type: "pipe", in: e, out: t, transform: r.decode, reverseTransform: r.encode });
}
s(codec, "codec");
var Nd = $constructor("ZodReadonly", (e, t) => {
  (ys.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Ul(e, r, i, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function readonly(e) {
  return new Nd({ type: "readonly", innerType: e });
}
s(readonly, "readonly");
var jd = $constructor("ZodTemplateLiteral", (e, t) => {
  (bs.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => bl(e, r, i, o)));
});
function templateLiteral(e, t) {
  return new jd({ type: "template_literal", parts: e, ...k.normalizeParams(t) });
}
s(templateLiteral, "templateLiteral");
var Bd = $constructor("ZodLazy", (e, t) => {
  (_s.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Zl(e, r, i, o)),
    (e.unwrap = () => e._zod.def.getter()));
});
function lazy(e) {
  return new Bd({ type: "lazy", getter: e });
}
s(lazy, "lazy");
var Wd = $constructor("ZodPromise", (e, t) => {
  (Ss.init(e, t),
    O.init(e, t),
    (e._zod.processJSONSchema = (r, i, o) => Nl(e, r, i, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function promise(e) {
  return new Wd({ type: "promise", innerType: e });
}
s(promise, "promise");
var Fd = $constructor("ZodFunction", (e, t) => {
  (vs.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => xl(e, r, i, o)));
});
function _function(e) {
  return new Fd({
    type: "function",
    input: Array.isArray(e?.input) ? tuple(e?.input) : (e?.input ?? array(unknown())),
    output: e?.output ?? unknown(),
  });
}
s(_function, "_function");
var $n = $constructor("ZodCustom", (e, t) => {
  (xs.init(e, t), O.init(e, t), (e._zod.processJSONSchema = (r, i, o) => _l(e, r, i, o)));
});
function check(e) {
  let t = new Z({ check: "custom" });
  return ((t._zod.check = e), t);
}
s(check, "check");
function custom(e, t) {
  return _custom($n, e ?? (() => !0), t);
}
s(custom, "custom");
function refine(e, t = {}) {
  return _refine($n, e, t);
}
s(refine, "refine");
function superRefine(e) {
  return _superRefine(e);
}
s(superRefine, "superRefine");
var Ym = describe,
  Xm = meta;
function _instanceof(e, t = {}) {
  let r = new $n({
    type: "custom",
    check: "custom",
    fn: s((i) => i instanceof e, "fn"),
    abort: !0,
    ...k.normalizeParams(t),
  });
  return (
    (r._zod.bag.Class = e),
    (r._zod.check = (i) => {
      i.value instanceof e ||
        i.issues.push({
          code: "invalid_type",
          expected: e.name,
          input: i.value,
          inst: r,
          path: [...(r._zod.def.path ?? [])],
        });
    }),
    r
  );
}
s(_instanceof, "_instanceof");
var eg = s((...e) => _stringbool({ Codec: Mr, Boolean: Dt, String: zt }, ...e), "stringbool");
function json(e) {
  let t = lazy(() => union([string(e), number(), boolean(), cd(), array(t), record(string(), t)]));
  return t;
}
s(json, "json");
function preprocess(e, t) {
  return pipe(transform(e), t);
}
s(preprocess, "preprocess");
var $v = {
  invalid_type: "invalid_type",
  too_big: "too_big",
  too_small: "too_small",
  invalid_format: "invalid_format",
  not_multiple_of: "not_multiple_of",
  unrecognized_keys: "unrecognized_keys",
  invalid_union: "invalid_union",
  invalid_key: "invalid_key",
  invalid_element: "invalid_element",
  invalid_value: "invalid_value",
  custom: "custom",
};
function setErrorMap(e) {
  config({ customError: e });
}
s(setErrorMap, "setErrorMap");
function getErrorMap() {
  return config().customError;
}
s(getErrorMap, "getErrorMap");
var Gd;
Gd || (Gd = {});
var C = { ...In, ...nr, iso: Ot },
  Nv = new Set([
    "$schema",
    "$ref",
    "$defs",
    "definitions",
    "$id",
    "id",
    "$comment",
    "$anchor",
    "$vocabulary",
    "$dynamicRef",
    "$dynamicAnchor",
    "type",
    "enum",
    "const",
    "anyOf",
    "oneOf",
    "allOf",
    "not",
    "properties",
    "required",
    "additionalProperties",
    "patternProperties",
    "propertyNames",
    "minProperties",
    "maxProperties",
    "items",
    "prefixItems",
    "additionalItems",
    "minItems",
    "maxItems",
    "uniqueItems",
    "contains",
    "minContains",
    "maxContains",
    "minLength",
    "maxLength",
    "pattern",
    "format",
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    "description",
    "default",
    "contentEncoding",
    "contentMediaType",
    "contentSchema",
    "unevaluatedItems",
    "unevaluatedProperties",
    "if",
    "then",
    "else",
    "dependentSchemas",
    "dependentRequired",
    "nullable",
    "readOnly",
  ]);
function detectVersion(e, t) {
  let r = e.$schema;
  return r === "https://json-schema.org/draft/2020-12/schema"
    ? "draft-2020-12"
    : r === "http://json-schema.org/draft-07/schema#"
      ? "draft-7"
      : r === "http://json-schema.org/draft-04/schema#"
        ? "draft-4"
        : (t ?? "draft-2020-12");
}
s(detectVersion, "detectVersion");
function resolveRef(e, t) {
  if (!e.startsWith("#"))
    throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
  let r = e.slice(1).split("/").filter(Boolean);
  if (r.length === 0) return t.rootSchema;
  let i = t.version === "draft-2020-12" ? "$defs" : "definitions";
  if (r[0] === i) {
    let o = r[1];
    if (!o || !t.defs[o]) throw new Error(`Reference not found: ${e}`);
    return t.defs[o];
  }
  throw new Error(`Reference not found: ${e}`);
}
s(resolveRef, "resolveRef");
function convertBaseSchema(e, t) {
  if (e.not !== void 0) {
    if (typeof e.not == "object" && Object.keys(e.not).length === 0) return C.never();
    throw new Error("not is not supported in Zod (except { not: {} } for never)");
  }
  if (e.unevaluatedItems !== void 0) throw new Error("unevaluatedItems is not supported");
  if (e.unevaluatedProperties !== void 0) throw new Error("unevaluatedProperties is not supported");
  if (e.if !== void 0 || e.then !== void 0 || e.else !== void 0)
    throw new Error("Conditional schemas (if/then/else) are not supported");
  if (e.dependentSchemas !== void 0 || e.dependentRequired !== void 0)
    throw new Error("dependentSchemas and dependentRequired are not supported");
  if (e.$ref) {
    let o = e.$ref;
    if (t.refs.has(o)) return t.refs.get(o);
    if (t.processing.has(o))
      return C.lazy(() => {
        if (!t.refs.has(o)) throw new Error(`Circular reference not resolved: ${o}`);
        return t.refs.get(o);
      });
    t.processing.add(o);
    let a = resolveRef(o, t),
      c = convertSchema(a, t);
    return (t.refs.set(o, c), t.processing.delete(o), c);
  }
  if (e.enum !== void 0) {
    let o = e.enum;
    if (t.version === "openapi-3.0" && e.nullable === !0 && o.length === 1 && o[0] === null)
      return C.null();
    if (o.length === 0) return C.never();
    if (o.length === 1) return C.literal(o[0]);
    if (o.every((c) => typeof c == "string")) return C.enum(o);
    let a = o.map((c) => C.literal(c));
    return a.length < 2 ? a[0] : C.union([a[0], a[1], ...a.slice(2)]);
  }
  if (e.const !== void 0) return C.literal(e.const);
  let r = e.type;
  if (Array.isArray(r)) {
    let o = r.map((a) => {
      let c = { ...e, type: a };
      return convertBaseSchema(c, t);
    });
    return o.length === 0 ? C.never() : o.length === 1 ? o[0] : C.union(o);
  }
  if (!r) return C.any();
  let i;
  switch (r) {
    case "string": {
      let o = C.string();
      if (e.format) {
        let a = e.format;
        a === "email"
          ? (o = o.check(C.email()))
          : a === "uri" || a === "uri-reference"
            ? (o = o.check(C.url()))
            : a === "uuid" || a === "guid"
              ? (o = o.check(C.uuid()))
              : a === "date-time"
                ? (o = o.check(C.iso.datetime()))
                : a === "date"
                  ? (o = o.check(C.iso.date()))
                  : a === "time"
                    ? (o = o.check(C.iso.time()))
                    : a === "duration"
                      ? (o = o.check(C.iso.duration()))
                      : a === "ipv4"
                        ? (o = o.check(C.ipv4()))
                        : a === "ipv6"
                          ? (o = o.check(C.ipv6()))
                          : a === "mac"
                            ? (o = o.check(C.mac()))
                            : a === "cidr"
                              ? (o = o.check(C.cidrv4()))
                              : a === "cidr-v6"
                                ? (o = o.check(C.cidrv6()))
                                : a === "base64"
                                  ? (o = o.check(C.base64()))
                                  : a === "base64url"
                                    ? (o = o.check(C.base64url()))
                                    : a === "e164"
                                      ? (o = o.check(C.e164()))
                                      : a === "jwt"
                                        ? (o = o.check(C.jwt()))
                                        : a === "emoji"
                                          ? (o = o.check(C.emoji()))
                                          : a === "nanoid"
                                            ? (o = o.check(C.nanoid()))
                                            : a === "cuid"
                                              ? (o = o.check(C.cuid()))
                                              : a === "cuid2"
                                                ? (o = o.check(C.cuid2()))
                                                : a === "ulid"
                                                  ? (o = o.check(C.ulid()))
                                                  : a === "xid"
                                                    ? (o = o.check(C.xid()))
                                                    : a === "ksuid" && (o = o.check(C.ksuid()));
      }
      (typeof e.minLength == "number" && (o = o.min(e.minLength)),
        typeof e.maxLength == "number" && (o = o.max(e.maxLength)),
        e.pattern && (o = o.regex(new RegExp(e.pattern))),
        (i = o));
      break;
    }
    case "number":
    case "integer": {
      let o = r === "integer" ? C.number().int() : C.number();
      (typeof e.minimum == "number" && (o = o.min(e.minimum)),
        typeof e.maximum == "number" && (o = o.max(e.maximum)),
        typeof e.exclusiveMinimum == "number"
          ? (o = o.gt(e.exclusiveMinimum))
          : e.exclusiveMinimum === !0 && typeof e.minimum == "number" && (o = o.gt(e.minimum)),
        typeof e.exclusiveMaximum == "number"
          ? (o = o.lt(e.exclusiveMaximum))
          : e.exclusiveMaximum === !0 && typeof e.maximum == "number" && (o = o.lt(e.maximum)),
        typeof e.multipleOf == "number" && (o = o.multipleOf(e.multipleOf)),
        (i = o));
      break;
    }
    case "boolean": {
      i = C.boolean();
      break;
    }
    case "null": {
      i = C.null();
      break;
    }
    case "object": {
      let o = {},
        a = e.properties || {},
        c = new Set(e.required || []);
      for (let [p, d] of Object.entries(a)) {
        let g = convertSchema(d, t);
        o[p] = c.has(p) ? g : g.optional();
      }
      if (e.propertyNames) {
        let p = convertSchema(e.propertyNames, t),
          d =
            e.additionalProperties && typeof e.additionalProperties == "object"
              ? convertSchema(e.additionalProperties, t)
              : C.any();
        if (Object.keys(o).length === 0) {
          i = C.record(p, d);
          break;
        }
        let g = C.object(o).passthrough(),
          y = C.looseRecord(p, d);
        i = C.intersection(g, y);
        break;
      }
      if (e.patternProperties) {
        let p = e.patternProperties,
          d = Object.keys(p),
          g = [];
        for (let S of d) {
          let v = convertSchema(p[S], t),
            P = C.string().regex(new RegExp(S));
          g.push(C.looseRecord(P, v));
        }
        let y = [];
        if (
          (Object.keys(o).length > 0 && y.push(C.object(o).passthrough()),
          y.push(...g),
          y.length === 0)
        )
          i = C.object({}).passthrough();
        else if (y.length === 1) i = y[0];
        else {
          let S = C.intersection(y[0], y[1]);
          for (let v = 2; v < y.length; v++) S = C.intersection(S, y[v]);
          i = S;
        }
        break;
      }
      let l = C.object(o);
      e.additionalProperties === !1
        ? (i = l.strict())
        : typeof e.additionalProperties == "object"
          ? (i = l.catchall(convertSchema(e.additionalProperties, t)))
          : (i = l.passthrough());
      break;
    }
    case "array": {
      let o = e.prefixItems,
        a = e.items;
      if (o && Array.isArray(o)) {
        let c = o.map((p) => convertSchema(p, t)),
          l = a && typeof a == "object" && !Array.isArray(a) ? convertSchema(a, t) : void 0;
        (l ? (i = C.tuple(c).rest(l)) : (i = C.tuple(c)),
          typeof e.minItems == "number" && (i = i.check(C.minLength(e.minItems))),
          typeof e.maxItems == "number" && (i = i.check(C.maxLength(e.maxItems))));
      } else if (Array.isArray(a)) {
        let c = a.map((p) => convertSchema(p, t)),
          l =
            e.additionalItems && typeof e.additionalItems == "object"
              ? convertSchema(e.additionalItems, t)
              : void 0;
        (l ? (i = C.tuple(c).rest(l)) : (i = C.tuple(c)),
          typeof e.minItems == "number" && (i = i.check(C.minLength(e.minItems))),
          typeof e.maxItems == "number" && (i = i.check(C.maxLength(e.maxItems))));
      } else if (a !== void 0) {
        let c = convertSchema(a, t),
          l = C.array(c);
        (typeof e.minItems == "number" && (l = l.min(e.minItems)),
          typeof e.maxItems == "number" && (l = l.max(e.maxItems)),
          (i = l));
      } else i = C.array(C.any());
      break;
    }
    default:
      throw new Error(`Unsupported type: ${r}`);
  }
  return (
    e.description && (i = i.describe(e.description)),
    e.default !== void 0 && (i = i.default(e.default)),
    i
  );
}
s(convertBaseSchema, "convertBaseSchema");
function convertSchema(e, t) {
  if (typeof e == "boolean") return e ? C.any() : C.never();
  let r = convertBaseSchema(e, t),
    i = e.type || e.enum !== void 0 || e.const !== void 0;
  if (e.anyOf && Array.isArray(e.anyOf)) {
    let l = e.anyOf.map((d) => convertSchema(d, t)),
      p = C.union(l);
    r = i ? C.intersection(r, p) : p;
  }
  if (e.oneOf && Array.isArray(e.oneOf)) {
    let l = e.oneOf.map((d) => convertSchema(d, t)),
      p = C.xor(l);
    r = i ? C.intersection(r, p) : p;
  }
  if (e.allOf && Array.isArray(e.allOf))
    if (e.allOf.length === 0) r = i ? r : C.any();
    else {
      let l = i ? r : convertSchema(e.allOf[0], t),
        p = i ? 0 : 1;
      for (let d = p; d < e.allOf.length; d++) l = C.intersection(l, convertSchema(e.allOf[d], t));
      r = l;
    }
  (e.nullable === !0 && t.version === "openapi-3.0" && (r = C.nullable(r)),
    e.readOnly === !0 && (r = C.readonly(r)));
  let o = {},
    a = ["$id", "id", "$comment", "$anchor", "$vocabulary", "$dynamicRef", "$dynamicAnchor"];
  for (let l of a) l in e && (o[l] = e[l]);
  let c = ["contentEncoding", "contentMediaType", "contentSchema"];
  for (let l of c) l in e && (o[l] = e[l]);
  for (let l of Object.keys(e)) Nv.has(l) || (o[l] = e[l]);
  return (Object.keys(o).length > 0 && t.registry.add(r, o), r);
}
s(convertSchema, "convertSchema");
function fromJSONSchema(e, t) {
  if (typeof e == "boolean") return e ? C.any() : C.never();
  let r = detectVersion(e, t?.defaultTarget),
    i = e.$defs || e.definitions || {},
    o = {
      version: r,
      defs: i,
      refs: new Map(),
      processing: new Set(),
      rootSchema: e,
      registry: t?.registry ?? V,
    };
  return convertSchema(e, o);
}
s(fromJSONSchema, "fromJSONSchema");
var Kd = {};
Re(Kd, { bigint: () => Fv, boolean: () => Wv, date: () => qv, number: () => Lv, string: () => Bv });
function Bv(e) {
  return _coercedString(zt, e);
}
s(Bv, "string");
function Lv(e) {
  return _coercedNumber($t, e);
}
s(Lv, "number");
function Wv(e) {
  return _coercedBoolean(Dt, e);
}
s(Wv, "boolean");
function Fv(e) {
  return _coercedBigint(Ut, e);
}
s(Fv, "bigint");
function qv(e) {
  return _coercedDate(En, e);
}
s(qv, "date");
config(yn());
var T = n.string().trim().min(1),
  X = n.record(n.string(), n.unknown()),
  F = n.number().int().nonnegative(),
  Dn = n.enum(["desktop-continuous", "web-remote-replayable"]),
  Hd = n.enum(["user-visible", "model-only"]),
  Jd = n.enum([
    "background_task",
    "fork",
    "goal_state_change",
    "goal-continuation",
    "plugin_reference",
    "rewind",
    "selection_side_chat",
    "subagent",
    "subagent_message",
    "todo_reminder",
  ]),
  M = n
    .object({
      workspacePath: T,
      workspaceIdentity: T.optional(),
      remoteSessionId: T.optional(),
      workspaceKey: T,
    })
    .strict(),
  Yd = n.enum(["allow", "deny", "escalate", "modify"]),
  Vv = n.enum(["allow", "deny", "ask"]),
  Gv = n.object({ toolName: T, ruleContent: n.string().optional() }).strict(),
  Xd = n.object({ type: n.literal("addRules"), behavior: Vv, rules: n.array(Gv).min(1) }).strict(),
  Nt = n
    .object({
      decision: Yd,
      reason: n.string().optional(),
      modifiedInput: n.unknown().optional(),
      permissionUpdates: n.array(Xd).optional(),
    })
    .strict(),
  q = n.object({ providerId: T, modelId: T, variant: T.optional() }).strict(),
  Ee = n.enum(["plan", "build", "edit", "yolo", "auto"]),
  Qd = n.enum(["idle", "running", "waiting", "paused", "completed", "error"]),
  Kv = n.enum([
    "interactive",
    "fork",
    "selection_side_chat",
    "workflow_parent",
    "workflow_child",
    "subagent_child",
    "nested_workflow_child",
  ]),
  eu = n
    .object({
      sessionId: T,
      targetId: T,
      objective: T,
      summaryTitle: n.string().min(1).nullable().default(null),
      status: n.enum(["active", "paused", "budget_limited", "complete"]),
      tokenBudget: n.number().int().positive().nullable(),
      tokensUsed: n.number().int().nonnegative(),
      timeUsedSeconds: n.number().int().nonnegative(),
      activeInputId: T.nullable().optional(),
      activeRunStartedAtMs: F.nullable().optional(),
      activeRunLastSeenAtMs: F.nullable().optional(),
      createdAt: F,
      updatedAt: F,
    })
    .strict(),
  ag = n
    .object({
      nextAction: n.string().nullable().optional(),
      passed: n.boolean(),
      reason: n.string(),
    })
    .strict(),
  Hv = n
    .object({
      version: n.literal(1),
      kind: n.literal("synthetic"),
      type: n.literal("goal_verification"),
      display: n.literal("separator"),
      targetId: T,
      verificationId: T,
      status: n.enum(["started", "completed", "failed_closed", "cancelled"]),
      verification: ag.optional(),
      goalIteration: n.number().int().positive().optional(),
      anchorAssistantMessageId: T.optional(),
      anchorTurnId: T.optional(),
      startedAt: F.optional(),
      updatedAt: F,
    })
    .strict(),
  tu = n
    .object({
      sessionId: T,
      workspace: M,
      parentSessionId: T.optional(),
      traceId: T.optional(),
      sessionKind: Kv,
      title: n.string(),
      titleSource: n.enum(["default", "first_input", "generated", "custom"]).optional(),
      mode: Ee,
      status: Qd,
      model: q.optional(),
      target: eu.nullable().optional(),
      createdAt: F,
      updatedAt: F,
      archivedAt: F.optional(),
    })
    .strict(),
  nt = n
    .object({
      kind: n.literal("subagent"),
      agentId: T,
      agentType: T,
      childSessionId: T,
      childTurnId: T.optional(),
      description: n.string().optional(),
      parentSessionId: T,
      parentToolCallId: T.optional(),
      parentTurnId: T.optional(),
    })
    .strict(),
  sg = n.object({ created: F, completed: F.optional() }).strict(),
  cg = n
    .object({
      total: n.number().int().nonnegative().optional(),
      input: n.number().int().nonnegative(),
      output: n.number().int().nonnegative(),
      reasoning: n.number().int().nonnegative(),
      cache: n
        .object({ read: n.number().int().nonnegative(), write: n.number().int().nonnegative() })
        .strict(),
    })
    .strict(),
  lg = n
    .object({
      origin: n.enum(["real_user", "agent_runtime", "system", "migration"]),
      kind: n.enum([
        "user_prompt",
        "slash_command",
        "system_reminder",
        "background_notification",
        "subagent_notification",
        "todo_reminder",
        "rewind_notice",
        "fork_notice",
        "timeline_event",
        "compact_summary",
        "assistant_response",
      ]),
      source: n.string().optional(),
      commandName: n.string().optional(),
      uiVisibility: n.enum(["visible", "hidden", "debug"]),
      providerVisibility: n.enum(["visible", "hidden"]),
      transcriptVisibility: n.enum(["visible", "hidden"]),
    })
    .strict(),
  Jv = n
    .object({
      messageId: T,
      sessionId: T,
      role: n.literal("user"),
      time: sg,
      agent: T,
      model: q,
      system: n.string().optional(),
      tools: n.record(n.string(), n.boolean()).optional(),
      synthetic: n.boolean().optional(),
      source: Jd.optional(),
      visibility: Hd.optional(),
      semantics: lg.optional(),
      metadata: X.optional(),
    })
    .strict(),
  Yv = n
    .object({
      messageId: T,
      sessionId: T,
      role: n.literal("assistant"),
      time: sg,
      parentMessageId: T,
      agent: T,
      model: q,
      path: n.object({ cwd: T, root: T }).strict(),
      cost: n.number().nonnegative(),
      tokens: cg,
      finish: n.string().optional(),
      error: X.optional(),
      semantics: lg.optional(),
      structured: n.unknown().optional(),
    })
    .strict(),
  Xv = n.discriminatedUnion("role", [Jv, Yv]),
  ae = n.object({ partId: T, sessionId: T, messageId: T }),
  Qv = n.discriminatedUnion("status", [
    n.object({ status: n.literal("pending"), input: X, raw: n.string() }).strict(),
    n
      .object({
        status: n.literal("running"),
        input: X,
        title: n.string().optional(),
        metadata: X.optional(),
        startedAt: F,
      })
      .strict(),
    n
      .object({
        status: n.literal("completed"),
        input: X,
        output: n.string(),
        title: n.string(),
        metadata: X,
        startedAt: F,
        completedAt: F,
      })
      .strict(),
    n
      .object({
        status: n.literal("error"),
        input: X,
        error: n.string(),
        metadata: X.optional(),
        startedAt: F,
        completedAt: F,
      })
      .strict(),
  ]),
  ig = q.extend({ label: n.string().optional() }),
  eS = n.object({ start: F.optional(), end: F.optional() }).strict(),
  tS = ae
    .extend({
      type: n.literal("timeline"),
      timelineType: n.enum([
        "context_compaction",
        "goal_verification",
        "session_fork",
        "model_change",
      ]),
      display: n.enum(["separator", "worklog"]),
      status: n.string().optional(),
      anchorMessageId: T.optional(),
      anchorTurnId: T.optional(),
      time: eS.optional(),
      operationId: n.string().optional(),
      trigger: n.enum(["manual", "auto", "partial", "reactive", "session_memory"]).optional(),
      phase: n.enum(["standalone_turn", "pre_request", "mid_turn", "reactive"]).optional(),
      compactReason: n.string().optional(),
      boundaryId: n.string().optional(),
      summaryMessageId: T.optional(),
      preCompactTokenCount: n.number().int().nonnegative().optional(),
      postCompactTokenCount: n.number().int().nonnegative().optional(),
      truePostCompactTokenCount: n.number().int().nonnegative().optional(),
      attempt: n.number().int().nonnegative().optional(),
      maxAttempts: n.number().int().nonnegative().optional(),
      reason: n.string().optional(),
      targetId: n.string().optional(),
      verificationId: n.string().optional(),
      goalIteration: n.number().int().nonnegative().optional(),
      verification: n
        .object({
          passed: n.boolean(),
          reason: n.string(),
          nextAction: n.string().nullable().optional(),
        })
        .strict()
        .optional(),
      parentSessionId: T.optional(),
      targetMessageId: T.optional(),
      targetCheckpointId: n.string().optional(),
      restoredFileCount: n.number().int().nonnegative().optional(),
      fromModel: ig.optional(),
      toModel: ig.extend({ label: T }).optional(),
    })
    .strict(),
  nu = n.discriminatedUnion("type", [
    ae
      .extend({
        type: n.literal("text"),
        text: n.string(),
        synthetic: n.boolean().optional(),
        ignored: n.boolean().optional(),
        metadata: X.optional(),
      })
      .strict(),
    ae.extend({ type: n.literal("reasoning"), text: n.string(), metadata: X.optional() }).strict(),
    ae
      .extend({
        type: n.literal("file"),
        mime: T,
        filename: n.string().optional(),
        url: T,
        metadata: X.optional(),
      })
      .strict(),
    ae
      .extend({ type: n.literal("tool"), callId: T, tool: T, state: Qv, metadata: X.optional() })
      .strict(),
    ae.extend({ type: n.literal("step-start"), snapshot: n.string().optional() }).strict(),
    ae
      .extend({
        type: n.literal("step-finish"),
        reason: n.string(),
        snapshot: n.string().optional(),
        cost: n.number().nonnegative(),
        tokens: cg,
      })
      .strict(),
    ae.extend({ type: n.literal("snapshot"), snapshot: n.string() }).strict(),
    ae.extend({ type: n.literal("patch"), hash: T, files: n.array(n.string()) }).strict(),
    ae
      .extend({
        type: n.literal("compaction"),
        auto: n.boolean(),
        reason: n.string().optional(),
        summaryMessageId: T.optional(),
        metadata: X.optional(),
      })
      .strict(),
    tS,
    ae
      .extend({
        type: n.literal("subagent"),
        prompt: n.string(),
        description: n.string(),
        agent: T,
        model: q.optional(),
        command: n.string().optional(),
      })
      .strict(),
    ae.extend({ type: n.literal("agent"), name: T }).strict(),
    ae
      .extend({ type: n.literal("retry"), attempt: n.number().int().nonnegative(), error: X })
      .strict(),
  ]),
  ou = n.object({ info: Xv, parts: n.array(nu) }).strict(),
  nS = n
    .object({
      kind: n.literal("api_retry"),
      attempt: n.number().int().positive(),
      maxRetries: n.number().int().nonnegative(),
      retryDelayMs: n.number().int().nonnegative(),
      errorStatus: n.number().int().nonnegative().nullable(),
      error: n.string(),
    })
    .strict(),
  oS = n
    .object({
      inputTokens: n.number().int().nonnegative(),
      cacheReadTokens: n.number().int().nonnegative(),
      cacheWriteTokens: n.number().int().nonnegative(),
      latestHitRate: n.number().nonnegative().nullable().optional(),
      hitRateRequestCount: n.number().int().nonnegative().optional(),
      totalInputTokens: n.number().int().nonnegative().optional(),
      totalCacheReadTokens: n.number().int().nonnegative().optional(),
      totalCacheWriteTokens: n.number().int().nonnegative().optional(),
      hitRate: n.number().nonnegative().nullable(),
    })
    .strict(),
  rS = n.enum([
    "system_prompt",
    "meta_user_context",
    "skills",
    "tool_prompt",
    "system_tool_schemas",
    "mcp_tool_schemas",
    "messages",
  ]),
  iS = n.object({ source: rS, chars: n.number().int().nonnegative() }).strict(),
  aS = n.array(iS),
  sS = n
    .object({
      used: n.number().int().nonnegative(),
      size: n.number().int().positive(),
      cost: n
        .object({ amount: n.number().nonnegative(), currency: T })
        .strict()
        .nullable()
        .optional(),
      cache: oS.optional(),
      breakdown: aS.optional(),
    })
    .strict(),
  dg = n
    .object({
      eventSeq: n.number().int().nonnegative(),
      stateRevision: n.number().int().nonnegative(),
      deliveryKind: Dn.optional(),
      activeTurnId: T.optional(),
      activeTurnKind: n.enum(["regular", "compact", "rewind"]).optional(),
      pendingRequestIds: n.array(T),
      apiRetry: nS.nullable().optional(),
      contextUsage: sS.optional(),
      goalVerifications: n.array(ag).optional(),
      goalVerificationTimeline: n.array(Hv).optional(),
    })
    .strict();
function textFromZCodeMessageParts(e) {
  return e
    .filter((t) => t.type === "text")
    .map((t) => t.text)
    .join("");
}
s(textFromZCodeMessageParts, "textFromZCodeMessageParts");
var R = n.string().trim().min(1),
  cS = [
    "default",
    "yolo",
    "plan",
    "edit",
    "acceptEdits",
    "auto",
    "dontAsk",
    "bypassPermissions",
    "autoEdit",
    "build",
  ],
  lS = ["claude", "opencode", "gemini", "codex", "glm"],
  dS = ["claudeCode"],
  uS = n
    .object({
      fileCount: n.number().int().nonnegative(),
      added: n.number().int().nonnegative(),
      removed: n.number().int().nonnegative(),
      files: n.array(
        n
          .object({
            path: n.string(),
            added: n.number().int().nonnegative(),
            removed: n.number().int().nonnegative(),
            writeCount: n.number().int().positive(),
            lastTurnIndex: n.number().int().nonnegative(),
          })
          .strict(),
      ),
    })
    .strict(),
  pS = n.object({
    taskId: R,
    traceId: R,
    title: n.string(),
    titleOverridden: n.boolean().optional(),
    workspacePath: R,
    workspaceIdentity: R.optional(),
    createdAt: n.number().int().nonnegative(),
    updatedAt: n.number().int().nonnegative(),
    mode: n.enum(cS),
    model: n.string().optional(),
    runtimeEpoch: n.number().int().nonnegative().optional(),
    provider: n.enum(lS).optional(),
    migrationSource: n.enum(dS).optional(),
    forkedFromTaskId: R.optional(),
    unreadAt: n.number().int().nonnegative().optional(),
    status: n.enum(["running", "completed", "error"]).optional(),
    lastError: n
      .object({
        code: n.string().optional(),
        message: n.string().min(1),
        traceId: R.optional(),
        taskId: R.optional(),
      })
      .optional(),
    changeSummary: uS.optional(),
  });
function resolveWorkspaceKey(e) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}
s(resolveWorkspaceKey, "resolveWorkspaceKey");
var gS = n.enum([
    "task_created",
    "user_message_saved",
    "assistant_message_saved",
    "task_status_changed",
    "task_meta_changed",
    "task_model_changed",
    "task_title_changed",
    "task_pinned",
    "task_unpinned",
    "task_archived",
    "task_unarchived",
    "task_deleted",
    "stream_mirror_gap",
    "stream_mirror_owner_lost",
  ]),
  ru = n.enum(["observer", "relay_owner"]),
  Un = n.enum(["desktop_window", "relay_bridge"]),
  ug = n
    .object({
      eventId: R,
      workspacePath: R,
      workspaceIdentity: R.optional(),
      workspaceKey: R,
      traceId: R,
      createdAt: n.number().int().nonnegative(),
    })
    .strict(),
  fS = n.object({ runId: R, opSeq: n.number().int().nonnegative() }).strict(),
  pg = ug.extend({ reason: gS, streamWatermark: fS.optional() }).strict(),
  jt = s((e, t) => {
    let r = resolveWorkspaceKey(t);
    t.workspaceKey !== r &&
      e.addIssue({
        code: n.ZodIssueCode.custom,
        path: ["workspaceKey"],
        message: "workspaceKey must match workspaceIdentity fallback rule",
      });
  }, "addWorkspaceKeyIssue"),
  $r = s((e, t) => {
    t.runId !== t.traceId &&
      e.addIssue({
        code: n.ZodIssueCode.custom,
        path: ["runId"],
        message: "runId must match traceId",
      });
  }, "addRunIdTraceIdIssue"),
  mg = pg.extend({ type: n.literal("task_snapshot_invalidated"), taskId: R }).strict(),
  gg = pg
    .extend({
      type: n.literal("workspace_task_list_invalidated"),
      taskId: R.optional(),
      taskMeta: pS.optional(),
    })
    .strict(),
  fg = n.discriminatedUnion("kind", [
    n
      .object({
        kind: n.literal("image"),
        filename: n.string(),
        mimeType: n.string(),
        sizeBytes: n.number().int().nonnegative().optional(),
        dataBase64: n.string().optional(),
        localPath: n.string().optional(),
      })
      .strict(),
    n
      .object({
        kind: n.literal("audio"),
        filename: n.string(),
        mimeType: n.string(),
        dataBase64: n.string().optional(),
        localPath: n.string().optional(),
      })
      .strict(),
    n
      .object({
        kind: n.literal("file"),
        filename: n.string(),
        mimeType: n.string(),
        sizeBytes: n.number().int().nonnegative(),
        dataBase64: n.string().optional(),
        textContent: n.string().optional(),
        localPath: n.string().optional(),
      })
      .strict(),
  ]),
  hS = n.object({ type: R, taskId: R, traceId: R }).passthrough(),
  hg = n
    .object({
      kind: n.literal("user_message"),
      messageId: R,
      content: n.string(),
      attachments: n.array(fg).optional(),
      timestamp: n.number().finite(),
    })
    .strict(),
  yg = n.object({ kind: n.literal("stream_event"), event: hS }).strict(),
  bg = n.discriminatedUnion("kind", [hg, yg]),
  yS = n.discriminatedUnion("kind", [
    hg.extend({ seq: n.number().int().positive() }).strict(),
    yg.extend({ seq: n.number().int().positive() }).strict(),
  ]),
  vg = n
    .object({
      workspacePath: R,
      workspaceIdentity: R.optional(),
      workspaceKey: R,
      taskId: R,
      runId: R,
      traceId: R,
      ownerClientId: R.optional(),
      ownerDeviceLabel: R.optional(),
    })
    .strict(),
  iu = vg.superRefine((e, t) => {
    (jt(t, e), $r(t, e));
  }),
  Sg = ug
    .extend({
      type: n.literal("task_stream_mirror_batch"),
      taskId: R,
      runId: R,
      ownerClientId: R.optional(),
      ownerDeviceLabel: R.optional(),
      batchSeq: n.number().int().positive(),
      fromSeq: n.number().int().positive(),
      toSeq: n.number().int().positive(),
      ops: n.array(yS),
      terminal: n.boolean(),
    })
    .strict(),
  _g = iu,
  xg = vg
    .extend({ leaseRequestId: R })
    .strict()
    .superRefine((e, t) => {
      (jt(t, e), $r(t, e));
    }),
  kg = n.discriminatedUnion("acquired", [
    n.object({ leaseRequestId: R, acquired: n.literal(!0), ownerHostId: R }).strict(),
    n
      .object({
        leaseRequestId: R,
        acquired: n.literal(!1),
        ownerHostId: R,
        reason: n.literal("owned_by_other_host"),
      })
      .strict(),
  ]),
  Bt = n
    .object({
      commandRequestId: R,
      workspacePath: R,
      workspaceIdentity: R.optional(),
      workspaceKey: R,
      taskId: R,
      runId: R,
    })
    .strict(),
  Ig = Bt.extend({ type: n.literal("stop_generation") }).strict(),
  Cg = Bt.extend({
    type: n.literal("respond_permission"),
    permissionRequestId: R,
    optionId: R,
    response: Nt,
  }).strict(),
  Rg = Bt.extend({
    type: n.literal("respond_elicitation"),
    elicitationRequestId: R,
    action: n.enum(["accept", "decline", "cancel"]),
    content: n.record(n.string(), n.unknown()).optional(),
  }).strict(),
  bS = n
    .object({
      commandId: R,
      taskId: R,
      traceId: R,
      workspacePath: R,
      workspaceIdentity: R.optional(),
      workspaceKey: R,
      status: n.enum(["accepted", "running", "failed"]),
      createdAt: n.number().int().nonnegative(),
      updatedAt: n.number().int().nonnegative(),
      clientId: R.optional(),
      clientLabel: R.optional(),
      error: n.string().optional(),
    })
    .strict(),
  Pg = n.discriminatedUnion("type", [
    bS
      .extend({
        type: n.literal("send_prompt"),
        content: n.string(),
        attachments: n.array(fg).optional(),
        automationId: R.optional(),
      })
      .strict(),
  ]),
  Tg = Bt.extend({ type: n.literal("enqueue_task_command"), taskCommand: Pg }).strict(),
  wg = Bt.extend({
    type: n.literal("promote_task_command"),
    commandId: R,
    clientMode: n.literal("web-remote-replayable"),
  }).strict(),
  Eg = Bt.extend({
    type: n.literal("cancel_task_command"),
    commandId: R,
    clientMode: n.literal("web-remote-replayable"),
  }).strict(),
  Og = n.discriminatedUnion("type", [Ig, Cg, Rg, Tg, wg, Eg]).superRefine((e, t) => {
    jt(t, e);
  }),
  Ag = n
    .discriminatedUnion("type", [
      Ig.extend({ requesterHostId: R }).strict(),
      Cg.extend({ requesterHostId: R }).strict(),
      Rg.extend({ requesterHostId: R }).strict(),
      Tg.extend({ requesterHostId: R }).strict(),
      wg.extend({ requesterHostId: R }).strict(),
      Eg.extend({ requesterHostId: R }).strict(),
    ])
    .superRefine((e, t) => {
      jt(t, e);
    }),
  vS = n.enum(["NO_ACTIVE_TASK_OWNER", "STALE_TASK_OWNER_COMMAND", "OWNER_COMMAND_FAILED"]),
  au = n.discriminatedUnion("success", [
    n.object({ commandRequestId: R, success: n.literal(!0), taskCommand: Pg.optional() }).strict(),
    n
      .object({
        commandRequestId: R,
        success: n.literal(!1),
        error: n.string(),
        code: vS.optional(),
      })
      .strict(),
  ]),
  zg = n.discriminatedUnion("type", [mg, gg, Sg]).superRefine((e, t) => {
    (jt(t, e), e.type === "task_stream_mirror_batch" && $r(t, e));
  }),
  Mg = n
    .discriminatedUnion("type", [
      mg.extend({ originHostId: R, deliveryPurpose: ru.optional() }).strict(),
      gg.extend({ originHostId: R, deliveryPurpose: ru.optional() }).strict(),
      Sg.extend({ originHostId: R, deliveryPurpose: ru.optional() }).strict(),
    ])
    .superRefine((e, t) => {
      (jt(t, e), e.type === "task_stream_mirror_batch" && $r(t, e));
    });
var Dr = { minWidth: 320, maxWidth: 3840, minHeight: 320, maxHeight: 2160 },
  su = n
    .object({ width: n.number().int().positive(), height: n.number().int().positive() })
    .strict(),
  $g = su.extend({
    width: n.number().int().min(Dr.minWidth).max(Dr.maxWidth),
    height: n.number().int().min(Dr.minHeight).max(Dr.maxHeight),
  }),
  SS = n.enum([
    "navigate",
    "back",
    "forward",
    "reload",
    "snapshot",
    "click",
    "fill",
    "type",
    "press",
    "cuaKeypress",
    "scroll",
    "cuaScroll",
    "domCuaScroll",
    "hover",
    "select",
    "check",
    "drag",
    "cuaDrag",
    "screenshot",
    "getState",
    "elementInfo",
    "evaluate",
    "getDialog",
    "handleDialog",
    "waitFor",
    "playwright",
    "playwrightWaitForTimeout",
    "capabilities",
    "browserVisibilityGet",
    "browserVisibilitySet",
    "browserViewportSet",
    "browserViewportReset",
    "activateTab",
    "newTab",
    "finalize",
    "finalizeTabs",
    "listUserTabs",
    "claimTab",
    "markDeliverable",
    "markHandoff",
    "nameSession",
    "turnEnded",
    "closeSession",
    "cancelRequest",
    "close",
    "list",
  ]),
  ot = n.enum(["desktop-continuous", "web-remote-replayable"]),
  _S = n
    .object({
      workspaceKey: n.string().min(1),
      sessionId: n.string().min(1),
      tabId: n.string().min(1).optional(),
      requestId: n.string().min(1),
      clientMode: ot,
    })
    .strict(),
  cu = n.enum([
    "backend_unavailable",
    "capability_unsupported",
    "duplicate_request_id",
    "ref_not_found",
    "navigation_blocked",
    "timeout",
    "renderer_unreachable",
    "cancelled",
    "execution_error",
  ]),
  lu = n
    .object({
      url: n.string(),
      title: n.string(),
      canGoBack: n.boolean(),
      canGoForward: n.boolean(),
      scrollX: n.number().optional(),
      scrollY: n.number().optional(),
      viewportWidth: n.number().optional(),
      viewportHeight: n.number().optional(),
    })
    .strict();
var Dg = n.enum(["left", "right", "middle"]),
  Lt = n.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"]),
  du = n.object({ x: n.number(), y: n.number() }).strict(),
  xS = n.enum([
    "allTextContents",
    "click",
    "count",
    "dblclick",
    "downloadMedia",
    "evaluate",
    "fill",
    "getAttribute",
    "innerText",
    "isEnabled",
    "isVisible",
    "press",
    "selectOption",
    "setChecked",
    "textContent",
    "waitFor",
  ]),
  kS = n.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"]),
  rt = n.number().int().positive().optional(),
  IS = n
    .object({
      value: n.string().optional(),
      label: n.string().optional(),
      index: n.number().int().nonnegative().optional(),
    })
    .strict()
    .refine(
      (e) => e.value !== void 0 || e.label !== void 0 || e.index !== void 0,
      "Select option requires value, label, or index",
    ),
  CS = n.discriminatedUnion("name", [
    n.object({ name: n.literal("domSnapshot") }).strict(),
    n
      .object({
        name: n.literal("elementInfo"),
        x: n.number(),
        y: n.number(),
        includeNonInteractable: n.boolean().optional(),
      })
      .strict(),
    n
      .object({
        name: n.literal("elementScreenshot"),
        x: n.number(),
        y: n.number(),
        includeNonInteractable: n.boolean().optional(),
      })
      .strict(),
    n
      .object({
        name: n.literal("evaluate"),
        expression: n.string().min(1),
        expressionKind: n.enum(["string", "function"]),
        arg: n.unknown().optional(),
        timeoutMs: rt,
      })
      .strict(),
    n
      .object({
        name: n.literal("waitForLoadState"),
        state: n.enum(["load", "domcontentloaded", "networkidle"]).optional(),
        timeoutMs: rt,
      })
      .strict(),
    n
      .object({
        name: n.literal("waitForURL"),
        url: n.string().min(1),
        waitUntil: n.enum(["load", "domcontentloaded", "networkidle", "commit"]).optional(),
        timeoutMs: rt,
      })
      .strict(),
    n
      .object({
        name: n.literal("waitForEvent"),
        event: n.enum(["download", "filechooser"]),
        timeoutMs: rt,
      })
      .strict(),
    n
      .object({ name: n.literal("downloadPath"), downloadId: n.string().min(1), timeoutMs: rt })
      .strict(),
    n
      .object({
        name: n.literal("fileChooserSetFiles"),
        fileChooserId: n.string().min(1),
        files: n.array(n.string()).min(1),
        timeoutMs: rt,
      })
      .strict(),
    n
      .object({
        name: n.literal("locator"),
        selector: n.string().min(1),
        operation: xS,
        value: n.unknown().optional(),
        arg: n.unknown().optional(),
        expression: n.string().min(1).optional(),
        expressionKind: n.enum(["string", "function"]).optional(),
        attribute: n.string().min(1).optional(),
        checked: n.boolean().optional(),
        replace: n.boolean().optional(),
        force: n.boolean().optional(),
        button: Dg.optional(),
        modifiers: n.array(kS).optional(),
        state: n.enum(["attached", "detached", "visible", "hidden"]).optional(),
        selections: n.array(IS).min(1).optional(),
        timeoutMs: rt,
      })
      .strict(),
  ]),
  Wt = n.discriminatedUnion("method", [
    n
      .object({
        method: n.literal("navigate"),
        url: n.string().min(1),
        tabId: n.string().optional(),
      })
      .strict(),
    n.object({ method: n.literal("back"), tabId: n.string().optional() }).strict(),
    n.object({ method: n.literal("forward"), tabId: n.string().optional() }).strict(),
    n.object({ method: n.literal("reload"), tabId: n.string().optional() }).strict(),
    n
      .object({
        method: n.literal("snapshot"),
        maxElements: n.number().int().positive().optional(),
        includeHidden: n.boolean().optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("click"),
        ref: n.string().min(1).optional(),
        x: n.number().optional(),
        y: n.number().optional(),
        button: Dg.optional(),
        doubleClick: n.boolean().optional(),
        modifiers: n.array(Lt).optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("fill"),
        ref: n.string().min(1),
        value: n.string(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("type"),
        ref: n.string().min(1).optional(),
        text: n.string(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("press"),
        key: n.string().min(1),
        ref: n.string().min(1).optional(),
        modifiers: n.array(Lt).optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("cuaKeypress"),
        keys: n.array(n.string().min(1)).min(1),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("scroll"),
        ref: n.string().min(1).optional(),
        x: n.number().optional(),
        y: n.number().optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("cuaScroll"),
        x: n.number(),
        y: n.number(),
        scrollX: n.number(),
        scrollY: n.number(),
        modifiers: n.array(Lt).optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("domCuaScroll"),
        nodeId: n.string().min(1).optional(),
        scrollX: n.number(),
        scrollY: n.number(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("screenshot"),
        ref: n.string().min(1).optional(),
        fullPage: n.boolean().optional(),
        clip: n
          .object({
            x: n.number(),
            y: n.number(),
            width: n.number().positive(),
            height: n.number().positive(),
          })
          .strict()
          .optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n.object({ method: n.literal("getState"), tabId: n.string().optional() }).strict(),
    n
      .object({
        method: n.literal("hover"),
        ref: n.string().min(1).optional(),
        x: n.number().optional(),
        y: n.number().optional(),
        modifiers: n.array(Lt).optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("select"),
        ref: n.string().min(1),
        values: n.array(n.string()).min(1),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("check"),
        ref: n.string().min(1),
        checked: n.boolean().optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("drag"),
        fromRef: n.string().min(1).optional(),
        toRef: n.string().min(1).optional(),
        from: du.optional(),
        to: du.optional(),
        modifiers: n.array(Lt).optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("cuaDrag"),
        path: n.array(du).min(1),
        modifiers: n.array(Lt).optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("elementInfo"),
        x: n.number(),
        y: n.number(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("evaluate"),
        expression: n.string().min(1),
        tabId: n.string().optional(),
      })
      .strict(),
    n.object({ method: n.literal("getDialog"), tabId: n.string().optional() }).strict(),
    n
      .object({
        method: n.literal("handleDialog"),
        accept: n.boolean(),
        promptText: n.string().optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("waitFor"),
        selector: n.string().min(1).optional(),
        text: n.string().min(1).optional(),
        textGone: n.string().min(1).optional(),
        timeoutMs: n.number().int().positive().optional(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({
        method: n.literal("playwrightWaitForTimeout"),
        timeoutMs: n.number().int().nonnegative(),
        tabId: n.string().optional(),
      })
      .strict(),
    n
      .object({ method: n.literal("playwright"), action: CS, tabId: n.string().optional() })
      .strict(),
    n.object({ method: n.literal("capabilities"), tabId: n.string().optional() }).strict(),
    n.object({ method: n.literal("browserVisibilityGet") }).strict(),
    n.object({ method: n.literal("browserVisibilitySet"), visible: n.boolean() }).strict(),
    $g.extend({ method: n.literal("browserViewportSet"), tabId: n.string().optional() }).strict(),
    n.object({ method: n.literal("browserViewportReset"), tabId: n.string().optional() }).strict(),
    n.object({ method: n.literal("activateTab"), tabId: n.string().min(1) }).strict(),
    n.object({ method: n.literal("newTab") }).strict(),
    n.object({ method: n.literal("listUserTabs") }).strict(),
    n.object({ method: n.literal("claimTab"), tabId: n.string().min(1) }).strict(),
    n
      .object({
        method: n.literal("finalizeTabs"),
        keep: n.array(
          n
            .object({ tabId: n.string().min(1), status: n.enum(["handoff", "deliverable"]) })
            .strict(),
        ),
      })
      .strict(),
    n.object({ method: n.literal("markDeliverable"), tabId: n.string().min(1) }).strict(),
    n.object({ method: n.literal("markHandoff"), tabId: n.string().min(1) }).strict(),
    n.object({ method: n.literal("nameSession"), name: n.string().trim().min(1) }).strict(),
    n
      .object({
        method: n.literal("finalize"),
        tabId: n.string().optional(),
        deliverable: n.boolean().optional(),
      })
      .strict(),
    n.object({ method: n.literal("turnEnded"), turnId: n.string().min(1).optional() }).strict(),
    n.object({ method: n.literal("closeSession") }).strict(),
    n.object({ method: n.literal("cancelRequest"), requestId: n.string().min(1) }).strict(),
    n.object({ method: n.literal("close"), tabId: n.string().optional() }).strict(),
    n.object({ method: n.literal("list") }).strict(),
  ]);
var uu = n.enum(["iab", "extension", "cdp"]),
  Ug = n.object({ id: n.string().trim().min(1), description: n.string().trim().min(1) }).strict(),
  pu = n
    .object({
      id: n.string().trim().min(1),
      generation: n.number().int().nonnegative().default(0),
      type: uu,
      name: n.string().trim().min(1),
      capabilities: n
        .object({ browser: n.array(Ug).optional(), tab: n.array(Ug).optional() })
        .strict(),
      apiSupportOverrides: n.record(n.string(), n.boolean()).optional(),
      metadata: n.record(n.string(), n.string()).optional(),
    })
    .strict(),
  Ur = n.enum(["live", "cached"]),
  RS = n
    .object({
      requestId: n.string().trim().min(1),
      workspaceKey: n.string().trim().min(1),
      workspacePath: n.string().trim().min(1),
      workspaceIdentity: n.string().trim().min(1).optional(),
      remoteSessionId: n.string().trim().min(1).optional(),
      sessionId: n.string().trim().min(1),
      turnId: n.string().trim().min(1).optional(),
      clientMode: ot,
      sessionContext: Ur,
    })
    .strict(),
  uM = RS.extend({
    browserId: n.string().trim().min(1),
    browserGeneration: n.number().int().nonnegative(),
  }).strict(),
  Ng = n.object({ browsers: n.array(pu) }).strict();
var PS = n.object({ x: n.number(), y: n.number(), width: n.number(), height: n.number() }).strict(),
  mu = n
    .object({
      ref: n.string().min(1),
      tag: n.string(),
      role: n.string().optional(),
      name: n.string().optional(),
      text: n.string().optional(),
      value: n.string().optional(),
      disabled: n.boolean().optional(),
      checked: n.boolean().optional(),
      selector: n.string(),
      xpath: n.string(),
      rect: PS,
      inViewport: n.boolean(),
      parentRef: n.string().optional(),
      framePath: n.string().optional(),
      attributes: n.record(n.string(), n.string()).optional(),
    })
    .strict(),
  TS = n
    .object({
      tag: n.string(),
      depth: n.number().int().nonnegative(),
      inViewport: n.boolean(),
      ref: n.string().min(1).optional(),
      role: n.string().optional(),
      name: n.string().optional(),
      text: n.string().optional(),
      attributes: n.record(n.string(), n.string()).optional(),
    })
    .strict(),
  Zg = n
    .object({
      url: n.string(),
      title: n.string(),
      dom: n.array(TS).optional(),
      domTruncated: n.boolean().optional(),
      elements: n.array(mu),
      truncated: n.boolean(),
    })
    .strict();
var jg = n
    .object({
      tabId: n.string(),
      url: n.string(),
      title: n.string(),
      viewport: su,
      active: n.boolean().optional(),
      lifecycle: n.enum(["active", "deliverable", "handoff"]).optional(),
    })
    .strict(),
  wS = n
    .object({
      id: n.string().min(1),
      lastOpened: n.string().optional(),
      tabGroup: n.string().optional(),
      title: n.string().optional(),
      url: n.string().optional(),
    })
    .strict(),
  ES = n
    .object({
      type: n.enum(["alert", "confirm", "prompt", "beforeunload"]),
      message: n.string(),
      defaultPrompt: n.string().optional(),
    })
    .strict(),
  OS = n
    .object({
      browserUse: n.literal(!0),
      backendType: uu,
      browserId: n.string().min(1),
      browserGeneration: n.number().int().nonnegative(),
      openTabIds: n.array(n.string()),
      tabId: n.string().optional(),
      currentUrl: n.string().optional(),
      lifecycle: n.enum(["active", "deliverable", "handoff", "closed"]).optional(),
    })
    .strict(),
  Ft = n
    .object({
      ok: n.boolean(),
      state: lu.optional(),
      snapshot: Zg.optional(),
      image: n
        .object({ base64: n.string(), mimeType: n.literal("image/png") })
        .strict()
        .optional(),
      tabs: n.array(jg).optional(),
      userTabs: n.array(wS).optional(),
      tab: jg.optional(),
      value: n.unknown().optional(),
      element: mu.optional(),
      dialog: ES.nullable().optional(),
      error: n
        .object({
          code: cu,
          message: n.string(),
          sideEffect: n.enum(["none", "uncertain"]).optional(),
        })
        .strict()
        .optional(),
      meta: OS.optional(),
      elapsedMs: n.number().nonnegative(),
    })
    .strict();
var Nr = ["local-download-upload", "remote-download"];
var AS = ["server-bundle", "node-runtime", "node-pty", "glm", "bfs", "ripgrep", "ugrep"],
  gu = ["server-bundle", "node-runtime", "node-pty", "glm", "bfs", "ripgrep", "ugrep"],
  Bg = ["server-bundle", "node-runtime"];
var PM = gu.filter((e) => !Bg.includes(e)),
  zS = new Set(AS),
  TM = new Set(gu),
  wM = new Set(Bg);
function normalizeRemoteResourcePackageSelection(e) {
  return [...gu];
}
s(normalizeRemoteResourcePackageSelection, "normalizeRemoteResourcePackageSelection");
function isKnownRemoteResourcePackageId(e) {
  return zS.has(e);
}
s(isKnownRemoteResourcePackageId, "isKnownRemoteResourcePackageId");
var MS = ["claude", "opencode", "gemini", "codex", "glm"],
  se = n.enum(MS);
var NM = 3,
  fu = ["7d", "30d"],
  $S = n.object({ modelId: n.string().nullable(), totalTokens: n.number(), share: n.number() }),
  DS = n.object({
    totalTokens: n.number(),
    inputTokens: n.number(),
    outputTokens: n.number(),
    reasoningTokens: n.number(),
    cacheCreationTokens: n.number(),
    cacheReadTokens: n.number(),
    cacheHitRate: n.number(),
    totalSessions: n.number(),
    totalTurns: n.number(),
    toolCallCount: n.number(),
    toolErrorRate: n.number(),
    modelErrorRate: n.number(),
    avgTimeToFirstTokenMs: n.number().nullable(),
    avgTurnDurationMs: n.number().nullable(),
    activeDays: n.number(),
    currentStreakDays: n.number(),
    favoriteModel: $S.nullable(),
  }),
  US = n.object({
    date: n.string(),
    level: n.union([n.literal(0), n.literal(1), n.literal(2), n.literal(3), n.literal(4)]),
    totalTokens: n.number(),
    turnCount: n.number(),
    toolCallCount: n.number(),
  }),
  NS = n.object({ weekIndex: n.number(), days: n.array(US.nullable()) }),
  ZS = n.object({
    startDate: n.string().nullable(),
    endDate: n.string().nullable(),
    maxTokens: n.number(),
    weeks: n.array(NS),
  }),
  jS = n.object({ modelId: n.string().nullable(), totalTokens: n.number() }),
  BS = n.object({ date: n.string(), models: n.array(jS) }),
  LS = n.object({
    modelId: n.string().nullable(),
    totalTokens: n.number(),
    inputTokens: n.number(),
    outputTokens: n.number(),
    requestCount: n.number(),
    share: n.number(),
  }),
  WS = n.object({
    toolName: n.string(),
    callCount: n.number(),
    errorCount: n.number(),
    errorRate: n.number(),
    avgDurationMs: n.number().nullable(),
  }),
  FS = n.object({
    range: n.enum(fu),
    generatedAt: n.number(),
    timeZone: n.string(),
    source: n.literal("agent-db"),
    summary: DS,
    heatmap: ZS,
    dailyModelUsage: n.array(BS),
    models: n.array(LS),
    tools: n.array(WS),
  });
var qS = "zcodeAgent",
  jr = ["glm"],
  BM = [qS];
function normalizeAgentProviderToZCodeAgent(e) {
  return "glm";
}
s(normalizeAgentProviderToZCodeAgent, "normalizeAgentProviderToZCodeAgent");
var VS = ["telegram", "webhook", "feishu", "lark", "weixin", "discord", "wecom"],
  hu = n
    .object({
      provider: n.enum(["feishu", "lark", "weixin"]),
      botId: n.string().trim().min(1),
      providerUserId: n.string().trim().min(1),
      chatType: n.enum(["private", "group"]),
    })
    .strict();
function isFeishuBotProvider(e) {
  return e === "feishu" || e === "lark";
}
s(isFeishuBotProvider, "isFeishuBotProvider");
var KS = ["assistant_changes", "assistant_toolcalls_changes", "summary_changes", "streaming_card"],
  YM = "*",
  XM = 3e4,
  QM = "bots:task",
  e$ = "bots:task-stream",
  HS = n
    .object({
      status: n.boolean(),
      new: n.boolean(),
      workspace: n.boolean(),
      model: n.boolean(),
      mode: n.boolean().optional(),
      thoughtLevel: n.boolean(),
      sandboxMode: n.boolean().optional(),
      approvalPolicy: n.boolean().optional(),
      cli: n.boolean().optional(),
      reply: n.boolean(),
    })
    .strict();
var JS = n
    .object({
      model: n.string().min(1).optional(),
      mode: n.string().min(1).optional(),
      thoughtLevel: n.string().min(1).optional(),
      sandboxMode: n.string().min(1).optional(),
      approvalPolicy: n.string().min(1).optional(),
      cli: n.enum(["codex", "claude", "opencode", "gemini", "glm"]).optional(),
    })
    .strict(),
  YS = n
    .object({
      provider: n.enum(["codex", "claude", "opencode", "gemini", "glm"]),
      model: n.string().min(1).optional(),
      mode: n.string().min(1).optional(),
      thoughtLevel: n.string().min(1).optional(),
    })
    .strict(),
  XS = n
    .object({ value: n.string(), label: n.string(), description: n.string().optional() })
    .strict(),
  QS = n
    .object({
      question: n.string(),
      header: n.string(),
      options: n.array(XS),
      multiSelect: n.boolean().optional(),
    })
    .strict(),
  e_ = n
    .object({
      taskId: n.string().min(1),
      requestId: n.string().min(1),
      runId: n.string().min(1),
      origin: nt.optional(),
      actorKey: n.string().min(1).optional(),
      currentQuestionIndex: n.number().int().min(0),
      questions: n.array(QS),
      answers: n.record(n.string(), n.array(n.string())),
      renderContext: n
        .object({ kind: n.literal("plan_approval"), plan: n.string().min(1) })
        .strict()
        .optional(),
      expandedCustomAnswerQuestionIndexes: n.array(n.number().int().min(0)).optional(),
      handledAt: n.number().optional(),
    })
    .strict(),
  t_ = n
    .object({
      id: n.string().min(1),
      name: n.string(),
      provider: n.enum(VS),
      enabled: n.boolean(),
      credentialRef: n.string().min(1).optional(),
      webhookSecretRef: n.string().min(1).optional(),
      webhookUrl: n.string().url().optional(),
      webhookAuthHeaderName: n.string().min(1).optional(),
      feishuAppId: n.string().min(1).optional(),
      providerUserId: n.string().min(1).optional(),
      displayName: n.string().optional(),
      allowedWorkspaces: n.array(n.string().min(1)),
      allowedCommands: HS,
      currentOptions: JS,
      replyMode: n.enum([
        "assistant_changes",
        "assistant_toolcalls_changes",
        "summary_changes",
        "streaming_card",
      ]),
    })
    .strict(),
  t$ = n.object({ version: n.literal(2), bots: n.array(t_) }).strict(),
  n$ = n
    .object({
      version: n.literal(2),
      bots: n.record(
        n.string(),
        n.object({
          botId: n.string().min(1),
          workspacePath: n.string().min(1),
          workspaceIdentity: n.string().min(1).optional(),
          workspaceId: n.string().min(1).optional(),
          mode: n.enum(["draft", "task"]),
          activeTaskId: n.string().min(1).nullable(),
          draftOptions: YS.optional(),
          pendingPermissionOptions: n
            .array(
              n.object({
                requestId: n.string().min(1),
                optionId: n.string().min(1),
                command: n.enum(["approve", "deny"]),
                label: n.string().min(1),
                response: Nt,
                handledAt: n.number().optional(),
              }),
            )
            .optional(),
          pendingElicitation: e_.optional(),
          telegramOffset: n.number().optional(),
          weixinGetUpdatesBuf: n.string().optional(),
          weixinActivatedAt: n.number().optional(),
          updatedAt: n.number(),
        }),
      ),
    })
    .strict(),
  o$ = { status: !0, new: !0, workspace: !0, model: !0, mode: !0, thoughtLevel: !0, reply: !0 },
  n_ = "assistant_changes";
function getSupportedBotReplyGranularities(e) {
  return isFeishuBotProvider(e) ? ["streaming_card"] : KS.filter((t) => t !== "streaming_card");
}
s(getSupportedBotReplyGranularities, "getSupportedBotReplyGranularities");
function normalizeBotReplyGranularity(e, t) {
  let r = getSupportedBotReplyGranularities(e),
    i = t ?? n_;
  return r.includes(i) ? i : r[0];
}
s(normalizeBotReplyGranularity, "normalizeBotReplyGranularity");
var yu = 64;
function isValidWslUser(e) {
  let t = e.trim();
  return (
    t.length > 0 &&
    t.length <= yu &&
    !containsControlCharacter(t) &&
    !t.includes(":") &&
    !t.includes("/") &&
    !t.includes("\\")
  );
}
s(isValidWslUser, "isValidWslUser");
function containsControlCharacter(e) {
  for (let t of e) {
    let r = t.codePointAt(0) ?? 0;
    if (r < 32 || r === 127) return !0;
  }
  return !1;
}
s(containsControlCharacter, "containsControlCharacter");
var Nn = n
  .string()
  .trim()
  .max(yu)
  .refine((e) => e.length === 0 || isValidWslUser(e), { message: "Invalid WSL user" });
var Zn = "https://zcode.z.ai",
  i_ = "https://zcode.chatglm.site",
  a_ = "https://bigmodel.cn",
  s_ = "https://dev.bigmodel.cn",
  c_ = "https://chat.z.ai",
  l_ = "https://zai-test.chatglm.site",
  d_ = "https://api.z.ai",
  u_ = "https://api.chatglm.site",
  p_ = "client_P8X5CMWmlaRO9gyO-KSqtg",
  m_ = "client_RzngVdSk8sYsG2_3HzOMdQ";
var g_ = "3.4.0";
function isWebRemoteControlV4AppVersion(e) {
  if (!e) return !1;
  let r = e
    .trim()
    .replace(/^v/i, "")
    .match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([^+]+))?(?:\+(.+))?$/);
  if (!r) return !1;
  let i = r[4]?.split("."),
    o =
      i === void 0 ||
      i.every((d) => /^[0-9A-Za-z-]+$/.test(d) && (!/^\d+$/.test(d) || /^(0|[1-9]\d*)$/.test(d))),
    a = r[5]?.split("."),
    c = a === void 0 || a.every((d) => /^[0-9A-Za-z-]+$/.test(d));
  if (!o || !c) return !1;
  let l = [Number(r[1]), Number(r[2]), Number(r[3])],
    p = g_.split(".").map(Number);
  for (let d = 0; d < p.length; d += 1) if (l[d] !== p[d]) return l[d] > p[d];
  return i === void 0;
}
s(isWebRemoteControlV4AppVersion, "isWebRemoteControlV4AppVersion");
function readRuntimeEnvValue(e, t) {
  let r = e[t]?.trim();
  return r || void 0;
}
s(readRuntimeEnvValue, "readRuntimeEnvValue");
function readRuntimeZCodeEnvScopedValue(e, t, r, i) {
  return readRuntimeEnvValue(e, t === "production" ? i : r);
}
s(readRuntimeZCodeEnvScopedValue, "readRuntimeZCodeEnvScopedValue");
function normalizeZCodeEndpointOrigin(e) {
  let t = e.trim();
  if (!t) throw new Error("ZCode endpoint origin is empty");
  let r = new URL(t);
  if (r.protocol !== "https:" && r.protocol !== "http:")
    throw new Error("ZCode endpoint origin must use http or https");
  return r.origin;
}
s(normalizeZCodeEndpointOrigin, "normalizeZCodeEndpointOrigin");
function resolveZCodeEndpointOrigin(e) {
  let t = e?.env ?? "test",
    r = e?.envBaseOrigin?.trim();
  if (t === "production") return r ? normalizeZCodeEndpointOrigin(r) : Zn;
  let i = e?.overrideOrigin?.trim();
  return i ? normalizeZCodeEndpointOrigin(i) : r ? normalizeZCodeEndpointOrigin(r) : i_;
}
s(resolveZCodeEndpointOrigin, "resolveZCodeEndpointOrigin");
function resolveRuntimeZCodeEnv(e = {}) {
  return e.ZCODE_ENV?.trim().toLowerCase() === "test" ? "test" : "production";
}
s(resolveRuntimeZCodeEnv, "resolveRuntimeZCodeEnv");
function resolveRuntimeZCodeEndpointOrigin(e = {}, t) {
  let r = resolveRuntimeZCodeEnv(e),
    i = r === "production" ? readRuntimeEnvValue(e, "ZCODE_PRODUCTION_BASE_URL") : readRuntimeEnvValue(e, "ZCODE_TEST_BASE_URL");
  return resolveZCodeEndpointOrigin({
    env: r,
    envBaseOrigin: readRuntimeEnvValue(e, "ZCODE_BASE_URL") ?? readRuntimeEnvValue(e, "ZCODE_ENDPOINT_ORIGIN") ?? i,
    overrideOrigin: t?.overrideOrigin,
  });
}
s(resolveRuntimeZCodeEndpointOrigin, "resolveRuntimeZCodeEndpointOrigin");
function buildRuntimeZCodeEndpointUrls(e = {}) {
  return buildZCodeEndpointUrls(resolveRuntimeZCodeEndpointOrigin(e));
}
s(buildRuntimeZCodeEndpointUrls, "buildRuntimeZCodeEndpointUrls");
function buildRuntimeZCodeApiUrl(e = {}, t) {
  let r = t.startsWith("/") ? t : `/${t}`;
  return `${resolveRuntimeZCodeEndpointOrigin(e)}${r}`;
}
s(buildRuntimeZCodeApiUrl, "buildRuntimeZCodeApiUrl");
function resolveBigModelApiOrigin(e = {}) {
  let t = resolveRuntimeZCodeEnv(e),
    r =
      t === "production"
        ? readRuntimeEnvValue(e, "BIGMODEL_PRODUCTION_API_BASE_URL")
        : readRuntimeEnvValue(e, "BIGMODEL_TEST_API_BASE_URL"),
    i = t === "production" ? a_ : s_;
  return normalizeZCodeEndpointOrigin(readRuntimeEnvValue(e, "BIGMODEL_API_BASE_URL") ?? r ?? i);
}
s(resolveBigModelApiOrigin, "resolveBigModelApiOrigin");
function buildBigModelApiUrl(e = {}, t) {
  let r = t.startsWith("/") ? t : `/${t}`;
  return `${resolveBigModelApiOrigin(e)}${r}`;
}
s(buildBigModelApiUrl, "buildBigModelApiUrl");
function resolveZaiOAuthOrigin(e = {}) {
  let t = resolveRuntimeZCodeEnv(e),
    r = readRuntimeZCodeEnvScopedValue(e, t, "ZAI_TEST_OAUTH_ORIGIN", "ZAI_PRODUCTION_OAUTH_ORIGIN"),
    i = t === "production" ? c_ : l_;
  return normalizeZCodeEndpointOrigin(readRuntimeEnvValue(e, "ZAI_OAUTH_ORIGIN") ?? r ?? i);
}
s(resolveZaiOAuthOrigin, "resolveZaiOAuthOrigin");
function resolveZaiBusinessBaseUrl(e = {}) {
  let t = resolveRuntimeZCodeEnv(e),
    r = readRuntimeZCodeEnvScopedValue(e, t, "ZAI_TEST_BUSINESS_BASE_URL", "ZAI_PRODUCTION_BUSINESS_BASE_URL"),
    i = t === "production" ? d_ : u_;
  return normalizeZCodeEndpointOrigin(readRuntimeEnvValue(e, "ZAI_BUSINESS_BASE_URL") ?? r ?? i);
}
s(resolveZaiBusinessBaseUrl, "resolveZaiBusinessBaseUrl");
function resolveZaiOAuthClientId(e = {}) {
  let t = resolveRuntimeZCodeEnv(e),
    r = readRuntimeZCodeEnvScopedValue(e, t, "ZAI_TEST_OAUTH_CLIENT_ID", "ZAI_PRODUCTION_OAUTH_CLIENT_ID"),
    i = t === "production" ? p_ : m_;
  return readRuntimeEnvValue(e, "ZAI_OAUTH_CLIENT_ID") ?? r ?? readRuntimeEnvValue(e, "ZAI_OAUTH_APP_ID") ?? i;
}
s(resolveZaiOAuthClientId, "resolveZaiOAuthClientId");
function buildZaiOAuthUrl(e, t) {
  let r = t.startsWith("/") ? t : `/${t}`;
  return `${normalizeZCodeEndpointOrigin(e)}${r}`;
}
s(buildZaiOAuthUrl, "buildZaiOAuthUrl");
function buildRuntimeZaiOAuthUrl(e = {}, t) {
  return buildZaiOAuthUrl(resolveZaiOAuthOrigin(e), t);
}
s(buildRuntimeZaiOAuthUrl, "buildRuntimeZaiOAuthUrl");
function buildRuntimeZaiBusinessUrl(e = {}, t) {
  let r = t.startsWith("/") ? t : `/${t}`;
  return `${resolveZaiBusinessBaseUrl(e)}${r}`;
}
s(buildRuntimeZaiBusinessUrl, "buildRuntimeZaiBusinessUrl");
function buildZCodeEndpointUrls(e, t = {}) {
  let r = normalizeZCodeEndpointOrigin(e),
    i = new URL(r),
    a = `${i.protocol === "https:" ? "wss:" : "ws:"}//${i.host}`,
    c = isWebRemoteControlV4AppVersion(t.appVersion) ? "v4" : "v3";
  return {
    origin: r,
    apiBaseUrl: `${r}/api/v1`,
    remoteUrl: `${r}/remote/${c}`,
    webRemoteCallbackUrl: `${r}/web-remote/callback`,
    relayWsUrl: `${a}/ws`,
    zcodePlanOpenAiBaseUrl: `${r}/api/v1/zcode-plan`,
    zcodePlanAnthropicBaseUrl: `${r}/api/v1/zcode-plan/anthropic`,
    zcodePlanBillingCurrentUrl: `${r}/api/v1/zcode-plan/billing/current`,
    zcodePlanBillingBalanceUrl: `${r}/api/v1/zcode-plan/billing/balance`,
  };
}
s(buildZCodeEndpointUrls, "buildZCodeEndpointUrls");
function rewriteZCodeEndpointUrl(e, t) {
  let r = typeof e == "string" ? e : e.toString(),
    i;
  try {
    i = new URL(r);
  } catch {
    return e;
  }
  let o = Zn;
  if (i.origin !== o) return e;
  let a = normalizeZCodeEndpointOrigin(t);
  if (a === o) return e;
  let c = new URL(a);
  return ((c.pathname = i.pathname), (c.search = i.search), (c.hash = i.hash), c.toString());
}
s(rewriteZCodeEndpointUrl, "rewriteZCodeEndpointUrl");
var z = n.string().trim().min(1),
  Bn = n.enum(["zh-CN", "en-US"]),
  Fg = n.enum(["system", "zh-CN", "en-US"]),
  qg = n.enum(["queue", "guide"]),
  Vg = n.enum(["stable", "preview"]),
  Gg = n.number().int().min(-3).max(5),
  Br = n.discriminatedUnion("mode", [
    n.object({ mode: n.literal("auto") }),
    n.object({
      mode: n.literal("shell"),
      dialect: n.enum(["cmd", "git-bash"]),
      id: z,
      label: z,
      path: z,
    }),
  ]),
  Kg = n.array(se).transform(() => [...jr]),
  Hg = n
    .object({
      zai: n.enum(["oauth", "apiKey"]).optional(),
      bigmodel: n.enum(["oauth", "apiKey"]).optional(),
    })
    .partial(),
  Jg = n.enum(["zai", "bigmodel"]),
  Yg = n
    .object({
      zai: n.string().trim().min(1).optional(),
      bigmodel: n.string().trim().min(1).optional(),
    })
    .partial();
var Su = n.object({
    version: z,
    title: z,
    markdown: z,
    releaseDate: z.optional(),
    releaseNotesByLocale: n.partialRecord(Bn, n.object({ title: z, markdown: z })).optional(),
  }),
  x_ = n.partialRecord(Vg, z).default({}),
  Xg = n.discriminatedUnion("kind", [
    n.object({
      kind: n.literal("ssh"),
      host: z,
      port: n.number().int().positive().max(65535).optional(),
      username: z,
      sshConfigAlias: z.optional(),
      privateKeyPath: n.string().optional(),
      assetInstallMode: n.enum(Nr).optional(),
      resourcePackages: n
        .object({ selectedPackageIds: n.array(n.string().refine(isKnownRemoteResourcePackageId)).optional() })
        .optional(),
      passwordCredentialKey: z.optional(),
      privateKeyPassphraseCredentialKey: z.optional(),
    }),
    n.object({ kind: n.literal("wsl"), distro: n.string().optional(), user: Nn.optional() }),
    n.object({ kind: n.literal("docker"), container: z }),
    n.object({
      kind: n.literal("server"),
      url: n.string().url(),
      name: z.optional(),
      workspacePath: n.string().optional(),
      serverId: z.optional(),
      tokenCredentialKey: z.optional(),
    }),
  ]),
  Qg = n.discriminatedUnion("kind", [
    n.object({
      kind: n.literal("local"),
      workspacePath: z,
      workspacePurpose: n.enum(["project", "conversation"]).default("project"),
    }),
    n.object({
      kind: n.literal("remote"),
      workspacePath: z,
      localWorkspacePath: z.optional(),
      workspaceIdentity: z.optional(),
      target: Xg,
      lastOpenedAt: n.number().int().nonnegative(),
      lastConnectionStatus: n.enum(["connected", "failed"]),
      lastConnectionError: n.string().optional(),
    }),
  ]),
  ef = n.object({ deviceSid: z }),
  tf = n.object({ workspacePath: z, workspaceIdentity: z.optional(), initialTaskId: z.optional() }),
  _u = n.preprocess((e) => {
    if (typeof e != "string") return;
    let t = e.trim();
    if (t)
      try {
        return normalizeZCodeEndpointOrigin(t);
      } catch {
        return;
      }
  }, n.string().optional());
function sanitizeZCodeEndpointOrigin(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let t = e;
  if (!("zcodeEndpointOrigin" in t)) return e;
  let r = _u.safeParse(t.zcodeEndpointOrigin);
  if (r.success && typeof r.data == "string") return { ...t, zcodeEndpointOrigin: r.data };
  let { zcodeEndpointOrigin: i, ...o } = t;
  return o;
}
s(sanitizeZCodeEndpointOrigin, "sanitizeZCodeEndpointOrigin");
function migrateOptimizeAgentExperienceDefault(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let t = e;
  return t.optimizeAgentExperienceMigrationInitialized === !0
    ? e
    : { ...t, optimizeAgentExperienceEnabled: !1, optimizeAgentExperienceMigrationInitialized: !0 };
}
s(migrateOptimizeAgentExperienceDefault, "migrateOptimizeAgentExperienceDefault");
function migrateCloseToTrayOnWindowsDefault(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let t = e;
  return t.closeToTrayOnWindowsMigrationInitialized === !0
    ? e
    : { ...t, closeToTrayOnWindows: !0, closeToTrayOnWindowsMigrationInitialized: !0 };
}
s(migrateCloseToTrayOnWindowsDefault, "migrateCloseToTrayOnWindowsDefault");
function migrateLegacyLocalePreference(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let t = e;
  if ("localePreference" in t || !("locale" in t)) return e;
  let r = Bn.safeParse(t.locale);
  return r.success ? { ...t, localePreference: r.data } : e;
}
s(migrateLegacyLocalePreference, "migrateLegacyLocalePreference");
var P_ = n.object({
  id: z,
  workspacePath: z,
  localWorkspacePath: z.optional(),
  workspaceIdentity: z.optional(),
  target: Xg,
  lastOpenedAt: n.number().int().nonnegative(),
  lastConnectionStatus: n.enum(["connected", "failed"]),
  lastConnectionError: n.string().optional(),
});
function migrateLegacyBuiltinAgentCliProviders(e) {
  return !e || typeof e != "object" || Array.isArray(e)
    ? e
    : { ...e, enabledBuiltinAgentCliProviders: [...jr] };
}
s(migrateLegacyBuiltinAgentCliProviders, "migrateLegacyBuiltinAgentCliProviders");
function stripHistoricalRemoteResourcePackages(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let t = e;
  if (t.kind !== "ssh" || !("resourcePackages" in t)) return e;
  let { resourcePackages: r, ...i } = t;
  return i;
}
s(stripHistoricalRemoteResourcePackages, "stripHistoricalRemoteResourcePackages");
function migrateLegacyWorkspaceSession(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let t = e,
    r = { ...t },
    i = Array.isArray(t.lastWorkspaceSession) ? t.lastWorkspaceSession : [],
    o = i.some((y) => (!y || typeof y != "object" || Array.isArray(y) ? !1 : "historyId" in y)),
    a = Array.isArray(t.remoteWorkspaceHistory) ? t.remoteWorkspaceHistory : [],
    c = new Map(
      a.flatMap((y) => {
        let S = y && typeof y == "object" && !Array.isArray(y) ? { ...y, target: stripHistoricalRemoteResourcePackages(y.target) } : y,
          v = P_.safeParse(S);
        return v.success ? [[v.data.id, v.data]] : [];
      }),
    ),
    l =
      i.length > 0
        ? i.flatMap((y) => {
            if (!y || typeof y != "object" || Array.isArray(y)) return [];
            let S = y;
            if (S.kind === "local" && typeof S.workspacePath == "string")
              return [
                {
                  kind: "local",
                  workspacePath: S.workspacePath,
                  workspacePurpose:
                    S.workspacePurpose === "conversation" ? "conversation" : "project",
                },
              ];
            if (S.kind === "remote") {
              if (typeof S.workspacePath == "string" && S.target)
                return [{ ...S, target: stripHistoricalRemoteResourcePackages(S.target) }];
              if (typeof S.historyId == "string") {
                let v = c.get(S.historyId);
                return v
                  ? [
                      {
                        kind: "remote",
                        workspacePath: v.workspacePath,
                        ...(v.localWorkspacePath
                          ? { localWorkspacePath: v.localWorkspacePath }
                          : {}),
                        ...(v.workspaceIdentity ? { workspaceIdentity: v.workspaceIdentity } : {}),
                        target: stripHistoricalRemoteResourcePackages(v.target),
                        lastOpenedAt: v.lastOpenedAt,
                        lastConnectionStatus: v.lastConnectionStatus,
                        ...(v.lastConnectionError
                          ? { lastConnectionError: v.lastConnectionError }
                          : {}),
                      },
                    ]
                  : [];
              }
            }
            return [];
          })
        : [],
    p = Array.isArray(t.lastOpenTabs)
      ? t.lastOpenTabs.flatMap((y) =>
          typeof y == "string"
            ? [{ kind: "local", workspacePath: y, workspacePurpose: "project" }]
            : [],
        )
      : [],
    d = new Set(
      l.flatMap((y) =>
        y.kind === "local" && typeof y.workspacePath == "string" ? [y.workspacePath] : [],
      ),
    ),
    g = [...l, ...p.filter((y) => !d.has(y.workspacePath))];
  return (
    (g.length > 0 || o || Array.isArray(t.lastOpenTabs)) && (r.lastWorkspaceSession = g),
    delete r.lastOpenTabs,
    delete r.remoteWorkspaceHistory,
    r
  );
}
s(migrateLegacyWorkspaceSession, "migrateLegacyWorkspaceSession");
var E_ = n.object({
    recentProjects: n.array(n.string()).default([]),
    locale: Bn.default("zh-CN"),
    localePreference: Fg.default("system"),
    terminalInheritSystemProfile: n.boolean().default(!0),
    terminalFontFamily: z.optional(),
    integratedTerminalShell: Br.optional(),
    httpProxy: z.optional(),
    httpProxyNoProxy: z.optional(),
    httpProxyCaCertPath: z.optional(),
    taskAutoArchiveEnabled: n.boolean().default(!1),
    taskAutoArchiveOlderThanDays: n.number().int().positive().max(365).default(7),
    closeToTrayOnWindows: n.boolean().default(!0),
    closeToTrayOnWindowsMigrationInitialized: n.boolean().default(!0),
    keepAwakeWhileRunning: n.boolean().default(!1),
    desktopZoomLevel: Gg.optional(),
    desktopChromiumHardwareAccelerationEnabled: n.boolean().default(!0),
    messageStreamShowReasoning: n.boolean().default(!1),
    messageStreamShowTodos: n.boolean().default(!1),
    zcodeInteractionBehavior: qg.default("queue"),
    askUserQuestionAutoResolutionEnabled: n.boolean().default(!0),
    optimizeAgentExperienceEnabled: n.boolean().default(!1),
    optimizeAgentExperienceMigrationInitialized: n.boolean().default(!0),
    enabledBuiltinAgentCliProviders: Kg.default([...jr]),
    modelProviderFamilyModes: Hg.default({}),
    modelProviderFamilySelectedKeys: Yg.default({}),
    providerFamilyDomain: Jg.optional(),
    providerFamilyDomainUpdatedAt: n.number().int().nonnegative().optional(),
    providerFamilyDomainMigrated: n.boolean().default(!1),
    repoSnapshotIndexingEnabled: n.boolean().default(!1),
    repoSnapshotIndexingUserConfigured: n.boolean().optional(),
    instantGrepIndexingEnabled: n.boolean().default(!1),
    nativeSearchEnhancementsEnabled: n.boolean().default(!0),
    memoryEnabled: n.boolean().default(!1),
    lastWorkspaceSession: n.array(Qg).default([]),
    lastActiveTabIndex: n.number().int().nonnegative().default(0),
    lastActiveTaskByWorkspace: n.record(n.string(), n.string()).optional(),
    dataBaseDir: n.string().trim().min(1).optional(),
    pendingPostUpdateReleaseNotes: Su.optional(),
    receivePreviewUpdates: n.boolean().default(!1),
    autoDownloadAndInstallUpdates: n.boolean().default(!1),
    skippedElectronUpdateVersions: x_,
    settingsSyncFirstRunPromptHandled: n.boolean().optional(),
    webRemoteControlExternalRelayDevice: ef.optional(),
    webRemoteControlLastEnabledContext: tf.optional(),
    zcodeEndpointOrigin: _u.optional(),
  }),
  O_ = n.preprocess((e) => migrateCloseToTrayOnWindowsDefault(migrateOptimizeAgentExperienceDefault(migrateLegacyLocalePreference(sanitizeZCodeEndpointOrigin(migrateLegacyWorkspaceSession(migrateLegacyBuiltinAgentCliProviders(e)))))), E_),
  A_ = n.object({
    recentProjects: n.array(n.string()).optional(),
    locale: Bn.optional(),
    localePreference: Fg.optional(),
    terminalInheritSystemProfile: n.boolean().optional(),
    terminalFontFamily: z.optional(),
    integratedTerminalShell: Br.optional(),
    httpProxy: z.optional(),
    httpProxyNoProxy: z.optional(),
    httpProxyCaCertPath: z.optional(),
    taskAutoArchiveEnabled: n.boolean().optional(),
    taskAutoArchiveOlderThanDays: n.number().int().positive().max(365).optional(),
    closeToTrayOnWindows: n.boolean().optional(),
    keepAwakeWhileRunning: n.boolean().optional(),
    closeToTrayOnWindowsMigrationInitialized: n.boolean().optional(),
    desktopZoomLevel: Gg.optional(),
    desktopChromiumHardwareAccelerationEnabled: n.boolean().optional(),
    messageStreamShowReasoning: n.boolean().optional(),
    messageStreamShowTodos: n.boolean().optional(),
    zcodeInteractionBehavior: qg.optional(),
    askUserQuestionAutoResolutionEnabled: n.boolean().optional(),
    optimizeAgentExperienceEnabled: n.boolean().optional(),
    optimizeAgentExperienceMigrationInitialized: n.boolean().optional(),
    enabledBuiltinAgentCliProviders: Kg.optional(),
    modelProviderFamilyModes: Hg.optional(),
    modelProviderFamilySelectedKeys: Yg.optional(),
    providerFamilyDomain: n.union([Jg, n.literal("")]).optional(),
    providerFamilyDomainUpdatedAt: n.number().int().nonnegative().optional(),
    providerFamilyDomainMigrated: n.boolean().optional(),
    repoSnapshotIndexingEnabled: n.boolean().optional(),
    repoSnapshotIndexingUserConfigured: n.boolean().optional(),
    instantGrepIndexingEnabled: n.boolean().optional(),
    nativeSearchEnhancementsEnabled: n.boolean().optional(),
    memoryEnabled: n.boolean().optional(),
    lastWorkspaceSession: n.array(Qg).optional(),
    lastActiveTabIndex: n.number().int().nonnegative().optional(),
    lastActiveTaskByWorkspace: n.record(n.string(), n.string()).optional(),
    dataBaseDir: n.string().trim().min(1).optional(),
    pendingPostUpdateReleaseNotes: Su.optional(),
    receivePreviewUpdates: n.boolean().optional(),
    autoDownloadAndInstallUpdates: n.boolean().optional(),
    skippedElectronUpdateVersions: n.partialRecord(Vg, z).optional(),
    settingsSyncFirstRunPromptHandled: n.boolean().optional(),
    webRemoteControlExternalRelayDevice: ef.optional(),
    webRemoteControlLastEnabledContext: tf.optional(),
    zcodeEndpointOrigin: _u.optional(),
  });
var qt = n.enum([
  "default",
  "yolo",
  "plan",
  "edit",
  "acceptEdits",
  "auto",
  "dontAsk",
  "bypassPermissions",
  "autoEdit",
  "build",
]);
var ke = "builtin:",
  D = {
    zai: `${ke}zai`,
    zaiCodingPlan: `${ke}zai-coding-plan`,
    zaiStartPlan: `${ke}zai-start-plan`,
    bigmodel: `${ke}bigmodel`,
    bigmodelCodingPlan: `${ke}bigmodel-coding-plan`,
    bigmodelStartPlan: `${ke}bigmodel-start-plan`,
    zapi: `${ke}zapi`,
  };
function isBuiltinModelProviderId(e) {
  return (
    e === D.zai ||
    e === D.zaiCodingPlan ||
    e === D.zaiStartPlan ||
    e === D.bigmodel ||
    e === D.bigmodelCodingPlan ||
    e === D.bigmodelStartPlan ||
    e === D.zapi
  );
}
s(isBuiltinModelProviderId, "isBuiltinModelProviderId");
function isZaiCodingPlanProviderId(e) {
  return e === D.zaiCodingPlan || e === D.zaiStartPlan;
}
s(isZaiCodingPlanProviderId, "isZaiCodingPlanProviderId");
function isBigModelStartPlanProviderId(e) {
  return e === D.bigmodelStartPlan;
}
s(isBigModelStartPlanProviderId, "isBigModelStartPlanProviderId");
function isStartPlanModelProviderId(e) {
  return e === D.zaiStartPlan || e === D.bigmodelStartPlan;
}
s(isStartPlanModelProviderId, "isStartPlanModelProviderId");
function isCodingPlanModelProviderId(e) {
  return isZaiCodingPlanProviderId(e) || e === D.bigmodelCodingPlan || e === D.bigmodelStartPlan;
}
s(isCodingPlanModelProviderId, "isCodingPlanModelProviderId");
var N$ = ["GLM-5.2", "GLM-5-Turbo"];
var Z$ = {
  claude: { haiku: "GLM-5-Turbo", sonnet: "GLM-5-Turbo", opus: "GLM-5.2", reasoning: "GLM-5.2" },
};
function stripModelProviderReasoningPatches(e) {
  return {
    ...(e.defaultLevel ? { defaultLevel: e.defaultLevel } : {}),
    levels: Object.fromEntries(Object.keys(e.levels).map((t) => [t, {}])),
  };
}
s(stripModelProviderReasoningPatches, "stripModelProviderReasoningPatches");
var $_ = n.object({
    haiku: n.string(),
    sonnet: n.string(),
    opus: n.string(),
    reasoning: n.string(),
  }),
  sf = n.object({ claude: $_.optional() }).catchall(n.unknown()),
  cf = n.enum(["anthropic", "openai", "responses", "gemini"]),
  lf = n.enum(["anthropic-messages", "openai-chat-completions", "openai-responses"]),
  it = n.enum(["anthropic", "openai", "openai-compatible"]),
  D_ = n.enum(["china-llm-zcode-dev"]),
  nf = n.enum(["text", "image", "video", "audio", "pdf"]),
  of = n.object({ path: n.array(n.string().min(1)).min(1) }),
  U_ = n.object({
    set: n.array(of.extend({ value: n.unknown() })).optional(),
    unset: n.array(of).optional(),
  }),
  N_ = n.object({
    defaultLevel: n.string().min(1).optional(),
    levels: n.record(n.string().min(1), n.partialRecord(it, U_)),
  }),
  df = n.partialRecord(it, n.string()),
  Z_ = n.object({ baseURL: n.string(), paths: df }),
  uf = n.object({
    id: n.string().min(1),
    name: n.string().optional(),
    kinds: n.array(it),
    defaultKind: it.optional(),
    modelIdByKind: n.partialRecord(it, n.string().min(1)).optional(),
    modalities: n.object({ input: n.array(nf), output: n.array(nf) }),
    contextWindow: n.number().int().positive(),
    maxOutputTokens: n.number().int().positive().optional(),
    reasoning: N_.optional(),
    priority: n.number().finite().optional(),
  }),
  j_ = n.object({
    id: n.string().min(1),
    name: n.string().min(1),
    endpoints: Z_,
    defaultKind: it.optional(),
    models: n.array(uf),
  }),
  B_ = n.object({ schemaVersion: n.literal("zcode.model-providers.v1"), providers: n.array(j_) }),
  L_ = uf.extend({
    modalitiesConfigured: n.boolean().optional(),
    disabledReason: n.string().optional(),
    supportsTools: n.boolean().optional(),
    supportsStructuredOutput: n.boolean().optional(),
    modified: n.boolean().optional(),
    deleted: n.boolean().optional(),
  }),
  pf = n.enum(["builtin", "models-dev", "custom", "workspace"]),
  mf = n.enum([
    "coding_plan_not_authenticated",
    "coding_plan_not_connected",
    "coding_plan_auth_failed",
    "coding_plan_not_entitled",
    "oauth_provider_inactive",
  ]),
  gf = n.object({
    anthropic: n.string().default(""),
    openai: n.string().default(""),
    gemini: n.string().default(""),
  }),
  W_ = gf.extend({
    anthropic: n.string().optional(),
    openai: n.string().optional(),
    gemini: n.string().optional(),
    baseURL: n.string().optional(),
    paths: df.optional(),
  }),
  F_ = n.object({
    id: n.string(),
    name: n.string(),
    enabled: n.boolean().optional(),
    systemDisabledReason: mf.optional(),
    endpoints: gf,
    apiFormat: lf.optional(),
    source: pf.optional(),
    modelsDevProviderId: n.string().optional(),
    apiKeyRequired: n.boolean().optional(),
    headers: n.record(n.string(), n.string()).optional(),
    logoUrl: n.string().optional(),
    apiKey: n.string(),
    apiKeyUrl: n.string().optional(),
    models: n.array(n.string()).default([]),
    modelDisplayNames: n.record(n.string(), n.string()).optional(),
    modelSupportedFormats: n.record(n.string(), n.array(cf)).optional(),
    providerMappings: sf.optional(),
    createdAt: n.number(),
    updatedAt: n.number(),
  }),
  q_ = n.array(F_),
  V_ = n.object({
    id: n.string(),
    name: n.string(),
    enabled: n.boolean().optional(),
    systemDisabledReason: mf.optional(),
    endpoints: W_,
    apiFormat: lf.optional(),
    source: pf.optional(),
    catalogSourceId: D_.optional(),
    catalogProviderId: n.string().optional(),
    modelsDevProviderId: n.string().optional(),
    apiKeyRequired: n.boolean().optional(),
    headers: n.record(n.string(), n.string()).optional(),
    logoUrl: n.string().optional(),
    apiKey: n.string(),
    apiKeyUrl: n.string().optional(),
    defaultKind: it.optional(),
    models: n.array(L_).default([]),
    modelDisplayNames: n.record(n.string(), n.string()).optional(),
    modelSupportedFormats: n.record(n.string(), n.array(cf)).optional(),
    providerMappings: sf.optional(),
    createdAt: n.number(),
    updatedAt: n.number(),
  }),
  G_ = n.array(V_),
  K_ = n.object({ schemaVersion: n.literal("zcode.model-providers.v2"), providers: G_ }),
  B$ = n.object({
    providerIds: n.array(n.string().min(1)),
    updatedAt: n.number().int().nonnegative(),
  });
function stripLegacyClaudeProviderMappings(e) {
  if (!e) return;
  let { claude: t, ...r } = e;
  return r;
}
s(stripLegacyClaudeProviderMappings, "stripLegacyClaudeProviderMappings");
function isModelProviderEnabled(e) {
  return e?.enabled !== !1;
}
s(isModelProviderEnabled, "isModelProviderEnabled");
function shouldIncludeModelProviderInZCodeAgentRegistry(e) {
  return isModelProviderEnabled(e)
    ? isZaiCodingPlanProviderId(e.id) || isStartPlanModelProviderId(e.id)
      ? !0
      : e.apiKeyRequired !== !1 && e.apiKey.trim().length === 0
        ? !1
        : isBuiltinModelProviderId(e.id)
          ? !0
          : e.source !== "builtin" && !e.id.startsWith(ke)
    : !1;
}
s(shouldIncludeModelProviderInZCodeAgentRegistry, "shouldIncludeModelProviderInZCodeAgentRegistry");
var J_ = 2e5,
  rf = J_,
  Y_ = 1e6;
function isOneMillionContextModelName(e) {
  return e.trim().toLowerCase().endsWith("[1m]");
}
s(isOneMillionContextModelName, "isOneMillionContextModelName");
function resolveModelProviderContextWindow(e, t) {
  if (isOneMillionContextModelName(e)) return Y_;
  if (typeof t != "number" || !Number.isFinite(t)) return rf;
  let r = Math.floor(t);
  return r > 0 ? r : rf;
}
s(resolveModelProviderContextWindow, "resolveModelProviderContextWindow");
function isModelProviderModelConfig(e) {
  return typeof e == "object" && e !== null;
}
s(isModelProviderModelConfig, "isModelProviderModelConfig");
function getModelProviderModelLabel(e) {
  return e.name?.trim() || e.id;
}
s(getModelProviderModelLabel, "getModelProviderModelLabel");
function getModelProviderModelIds(e) {
  return e
    ? e.models
        .filter((t) => !isModelProviderModelConfig(t) || t.deleted !== !0)
        .map((t) => (isModelProviderModelConfig(t) ? t.id.trim() : t.trim()))
        .filter((t) => t.length > 0)
    : [];
}
s(getModelProviderModelIds, "getModelProviderModelIds");
function findModelProviderModel(e, t) {
  let r = t.trim();
  return e.models.find((i) => isModelProviderModelConfig(i) && i.deleted !== !0 && i.id.trim() === r);
}
s(findModelProviderModel, "findModelProviderModel");
function uniqueModelProviderKinds(e) {
  return [...new Set(e)];
}
s(uniqueModelProviderKinds, "uniqueModelProviderKinds");
function mapModelProviderSupportedFormatToKind(e) {
  switch (e) {
    case "anthropic":
      return "anthropic";
    case "openai":
      return "openai-compatible";
    case "responses":
      return "openai";
    case "gemini":
      return null;
  }
}
s(mapModelProviderSupportedFormatToKind, "mapModelProviderSupportedFormatToKind");
function mapModelProviderKindToSupportedFormat(e) {
  switch (e) {
    case "anthropic":
      return "anthropic";
    case "openai":
      return "responses";
    case "openai-compatible":
      return "openai";
  }
}
s(mapModelProviderKindToSupportedFormat, "mapModelProviderKindToSupportedFormat");
function createModelProviderModelConfig(e) {
  let t = [...new Set(e.modalities?.input ?? ["text"])],
    r = [...new Set(e.modalities?.output ?? ["text"])];
  return {
    id: e.id.trim(),
    name: e.name?.trim() || void 0,
    kinds: uniqueModelProviderKinds([...(e.kinds ?? [])]),
    ...(e.defaultKind ? { defaultKind: e.defaultKind } : {}),
    modalities: { input: t, output: r },
    ...e.modalitiesConfigured !== void 0 ? { modalitiesConfigured: e.modalitiesConfigured } : {},
    contextWindow: resolveModelProviderContextWindow(e.id, e.contextWindow),
    ...(e.maxOutputTokens ? { maxOutputTokens: e.maxOutputTokens } : {}),
    ...(e.reasoning ? { reasoning: e.reasoning } : {}),
    ...(e.priority !== void 0 && Number.isFinite(e.priority) ? { priority: e.priority } : {}),
    ...(e.disabledReason ? { disabledReason: e.disabledReason } : {}),
    ...(e.supportsTools !== void 0 ? { supportsTools: e.supportsTools } : {}),
    ...(e.supportsStructuredOutput !== void 0
      ? { supportsStructuredOutput: e.supportsStructuredOutput }
      : {}),
    ...(e.modified !== void 0 ? { modified: e.modified } : {}),
    ...(e.deleted !== void 0 ? { deleted: e.deleted } : {}),
  };
}
s(createModelProviderModelConfig, "createModelProviderModelConfig");
function resolveModelProviderDefaultKind(e) {
  if (e.defaultKind) return e.defaultKind;
  let t = e.endpoints.paths;
  if (t?.["openai-compatible"] !== void 0) return "openai-compatible";
  if (t?.openai !== void 0) return "openai";
  if (t?.anthropic !== void 0) return "anthropic";
  switch (resolveModelProviderApiFormat(e)) {
    case "anthropic-messages":
      return "anthropic";
    case "openai-responses":
      return "openai";
    case "openai-chat-completions":
      return "openai-compatible";
  }
}
s(resolveModelProviderDefaultKind, "resolveModelProviderDefaultKind");
function resolveModelProviderKindApiFormat(e) {
  switch (e) {
    case "anthropic":
      return "anthropic-messages";
    case "openai":
      return "openai-responses";
    case "openai-compatible":
      return "openai-chat-completions";
  }
}
s(resolveModelProviderKindApiFormat, "resolveModelProviderKindApiFormat");
function mapModelProviderApiFormatToKind(e) {
  switch (e) {
    case "anthropic-messages":
      return "anthropic";
    case "openai-responses":
      return "openai";
    case "openai-chat-completions":
      return "openai-compatible";
  }
}
s(mapModelProviderApiFormatToKind, "mapModelProviderApiFormatToKind");
function getDefaultModelProviderEndpointPathForKind(e) {
  switch (e) {
    case "anthropic":
      return "/v1/messages";
    case "openai":
      return "/responses";
    case "openai-compatible":
      return "/chat/completions";
  }
}
s(getDefaultModelProviderEndpointPathForKind, "getDefaultModelProviderEndpointPathForKind");
function isAbsoluteHttpUrl(e) {
  try {
    let t = new URL(e);
    return t.protocol === "http:" || t.protocol === "https:";
  } catch {
    return !1;
  }
}
s(isAbsoluteHttpUrl, "isAbsoluteHttpUrl");
function collapseDuplicatedAbsoluteRuntimeBaseUrl(e) {
  let t = e.trim().replace(/\/+$/, "");
  if (!t) return "";
  try {
    let r = new URL(t);
    if (r.protocol !== "http:" && r.protocol !== "https:") return t;
    let i = `${r.protocol}//${r.host}`,
      o = t.indexOf(i, i.length);
    if (o < 0) return t;
    let a = t.slice(0, o).replace(/\/+$/, ""),
      c = t.slice(o).replace(/\/+$/, "");
    if (a === c) return a;
  } catch {
    return t;
  }
  return t;
}
s(collapseDuplicatedAbsoluteRuntimeBaseUrl, "collapseDuplicatedAbsoluteRuntimeBaseUrl");
function joinBaseUrlAndPath(e, t) {
  let r = e.trim(),
    i = t.trim();
  return i
    ? isAbsoluteHttpUrl(i) || !r
      ? i
      : r.endsWith("/") && i.startsWith("/")
        ? `${r.slice(0, -1)}${i}`
        : !r.endsWith("/") && !i.startsWith("/")
          ? `${r}/${i}`
          : `${r}${i}`
    : r;
}
s(joinBaseUrlAndPath, "joinBaseUrlAndPath");
function normalizeModelProviderBaseUrlForKind(e, t) {
  let r = {
      anthropic: ["/v1/messages", "/messages"],
      openai: ["/responses"],
      "openai-compatible": ["/chat/completions"],
    },
    i = normalizeModelProviderConfiguredBaseUrl(e);
  for (let o of r[t])
    if (i.toLowerCase().endsWith(o)) {
      i = i.slice(0, -o.length);
      break;
    }
  return i.replace(/\/+$/, "");
}
s(normalizeModelProviderBaseUrlForKind, "normalizeModelProviderBaseUrlForKind");
function normalizeModelProviderConfiguredBaseUrl(e) {
  return collapseDuplicatedAbsoluteRuntimeBaseUrl(e).replace(/\/+$/, "");
}
s(normalizeModelProviderConfiguredBaseUrl, "normalizeModelProviderConfiguredBaseUrl");
function resolveModelProviderRuntimeBaseUrl(e, t = mapModelProviderApiFormatToKind(resolveModelProviderApiFormat(e))) {
  let r = e.endpoints.baseURL?.trim() ?? "",
    i = e.endpoints.paths ?? {};
  return (!e.endpoints.baseURL?.trim() && !e.endpoints.paths) || i[t] === void 0
    ? ""
    : normalizeModelProviderBaseUrlForKind(joinBaseUrlAndPath(r, i[t] ?? ""), t);
}
s(resolveModelProviderRuntimeBaseUrl, "resolveModelProviderRuntimeBaseUrl");
function getModelProviderEndpointKinds(e) {
  let t = [],
    r = e.paths;
  return e.baseURL?.trim() || r
    ? (r?.anthropic !== void 0 && t.push("anthropic"),
      r?.openai !== void 0 && t.push("openai"),
      r?.["openai-compatible"] !== void 0 && t.push("openai-compatible"),
      t)
    : [];
}
s(getModelProviderEndpointKinds, "getModelProviderEndpointKinds");
function pathFromModelProviderEndpointUrl(e) {
  return `${e.pathname === "/" ? "" : e.pathname.replace(/\/+$/, "")}${e.search}`;
}
s(pathFromModelProviderEndpointUrl, "pathFromModelProviderEndpointUrl");
function buildEndpointsFromLegacyRuntimeBaseUrls(e) {
  let t = e.flatMap(([a, c]) => {
    let l = normalizeModelProviderBaseUrlForKind(c, a);
    return l ? [{ kind: a, url: l }] : [];
  });
  if (t.length === 0) return {};
  let r = t.map((a) => {
      try {
        return { ...a, parsed: new URL(a.url) };
      } catch {
        return { ...a, parsed: null };
      }
    }),
    i = r[0]?.parsed,
    o = i && r.every((a) => a.parsed?.origin === i.origin);
  return {
    ...(o ? { baseURL: i.origin } : {}),
    paths: Object.fromEntries(r.map((a) => [a.kind, o && a.parsed ? pathFromModelProviderEndpointUrl(a.parsed) : a.url])),
  };
}
s(buildEndpointsFromLegacyRuntimeBaseUrls, "buildEndpointsFromLegacyRuntimeBaseUrls");
function resolveLegacyModelProviderDefaultKind(e) {
  switch (e.apiFormat) {
    case "anthropic-messages":
      return "anthropic";
    case "openai-responses":
      return "openai";
    case "openai-chat-completions":
      return "openai-compatible";
    case void 0:
      break;
  }
  return e.endpoints.anthropic?.trim()
    ? "anthropic"
    : e.endpoints.openai?.trim()
      ? "openai-compatible"
      : "anthropic";
}
s(resolveLegacyModelProviderDefaultKind, "resolveLegacyModelProviderDefaultKind");
function getDefaultModelSupportedFormatsFromLegacyEndpoints(e) {
  let t = [];
  return (e.anthropic?.trim() && t.push("anthropic"), e.openai?.trim() && t.push("openai"), t);
}
s(getDefaultModelSupportedFormatsFromLegacyEndpoints, "getDefaultModelSupportedFormatsFromLegacyEndpoints");
function migrateLegacyModelProviderConfig(e) {
  let t = resolveLegacyModelProviderDefaultKind(e),
    r = [],
    i = e.endpoints.anthropic?.trim();
  i && r.push(["anthropic", i]);
  let o = e.endpoints.openai?.trim();
  o && r.push([t === "openai" ? "openai" : "openai-compatible", o]);
  let a = buildEndpointsFromLegacyRuntimeBaseUrls(r),
    c = e.models.map((l) => {
      let p = e.modelSupportedFormats?.[l] ?? (e.apiFormat ? getDefaultModelSupportedFormatsFromApiFormat(e.apiFormat) : getDefaultModelSupportedFormatsFromLegacyEndpoints(e.endpoints)),
        d = uniqueModelProviderKinds(
          p.flatMap((y) => {
            let S = mapModelProviderSupportedFormatToKind(y);
            return S ? [S] : [];
          }),
        ),
        g =
          d.length === 0 && p.includes("gemini")
            ? "legacy gemini format is not supported by zcode.model-providers.v2"
            : void 0;
      return createModelProviderModelConfig({
        id: l,
        name: e.modelDisplayNames?.[l],
        kinds: d,
        defaultKind: d.includes(t) ? t : d[0],
        disabledReason: g,
      });
    });
  return {
    id: e.id,
    name: e.name,
    ...(e.enabled !== void 0 ? { enabled: e.enabled } : {}),
    ...(e.systemDisabledReason ? { systemDisabledReason: e.systemDisabledReason } : {}),
    endpoints: a,
    apiFormat: e.apiFormat,
    source: e.source,
    modelsDevProviderId: e.modelsDevProviderId,
    apiKeyRequired: e.apiKeyRequired,
    headers: e.headers,
    logoUrl: e.logoUrl,
    apiKey: e.apiKey,
    apiKeyUrl: e.apiKeyUrl,
    defaultKind: t,
    models: c,
    providerMappings: stripLegacyClaudeProviderMappings(e.providerMappings),
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}
s(migrateLegacyModelProviderConfig, "migrateLegacyModelProviderConfig");
function migrateLegacyModelProviderListToStoreFile(e) {
  return { schemaVersion: "zcode.model-providers.v2", providers: q_.parse(e).map(migrateLegacyModelProviderConfig) };
}
s(migrateLegacyModelProviderListToStoreFile, "migrateLegacyModelProviderListToStoreFile");
function hasOwnModelSupportedFormats(e, t) {
  return !!(e && Object.prototype.hasOwnProperty.call(e, t));
}
s(hasOwnModelSupportedFormats, "hasOwnModelSupportedFormats");
function getDefaultModelSupportedFormatsFromEndpoints(e) {
  let t = [],
    r = e.paths;
  return e.baseURL?.trim() || r
    ? (r?.anthropic !== void 0 && t.push("anthropic"),
      r?.["openai-compatible"] !== void 0 && t.push("openai"),
      r?.openai !== void 0 && t.push("responses"),
      t)
    : [];
}
s(getDefaultModelSupportedFormatsFromEndpoints, "getDefaultModelSupportedFormatsFromEndpoints");
function getDefaultModelSupportedFormatsFromApiFormat(e) {
  switch (e) {
    case "anthropic-messages":
      return ["anthropic"];
    case "openai-responses":
      return ["responses"];
    case "openai-chat-completions":
      return ["openai"];
  }
}
s(getDefaultModelSupportedFormatsFromApiFormat, "getDefaultModelSupportedFormatsFromApiFormat");
function resolveModelProviderApiFormat(e) {
  return e.apiFormat === "anthropic-messages" ||
    e.apiFormat === "openai-chat-completions" ||
    e.apiFormat === "openai-responses"
    ? e.apiFormat
    : e.defaultKind
      ? resolveModelProviderKindApiFormat(e.defaultKind)
      : e.endpoints.paths?.anthropic !== void 0
        ? "anthropic-messages"
        : e.endpoints.paths?.openai !== void 0
          ? "openai-responses"
          : e.endpoints.paths?.["openai-compatible"] !== void 0
            ? "openai-chat-completions"
            : "anthropic-messages";
}
s(resolveModelProviderApiFormat, "resolveModelProviderApiFormat");
function resolveModelProviderBaseUrl(e) {
  let t = mapModelProviderApiFormatToKind(resolveModelProviderApiFormat(e)),
    r = resolveModelProviderRuntimeBaseUrl(e, t);
  if (r) return r;
  let i = e.endpoints.baseURL?.trim();
  return i ? normalizeModelProviderBaseUrlForKind(i, t) : resolveModelProviderRuntimeBaseUrl(e, t);
}
s(resolveModelProviderBaseUrl, "resolveModelProviderBaseUrl");
function resolveModelSupportedFormatsForModel(e) {
  if (!e.modelName.trim()) return [];
  let t = findModelProviderModel(e.provider, e.modelName);
  return t
    ? t.kinds.map(mapModelProviderKindToSupportedFormat)
    : hasOwnModelSupportedFormats(e.provider.modelSupportedFormats, e.modelName)
      ? [...(e.provider.modelSupportedFormats?.[e.modelName] ?? [])]
      : getDefaultModelSupportedFormatsFromEndpoints(e.provider.endpoints);
}
s(resolveModelSupportedFormatsForModel, "resolveModelSupportedFormatsForModel");
var dx = "ZCode Protocol",
  ux = 1;
var u = n.string().trim().min(1),
  L = n.record(n.string(), n.unknown()),
  oe = n.number().int().nonnegative(),
  qr = n.union([oe, u, n.date()]),
  px = n
    .object({
      kind: n.literal("node_repl_images"),
      images: n
        .array(
          n
            .object({
              base64: n
                .string()
                .min(1)
                .max(200 * 1024),
              mimeType: n.string().regex(/^image\/[a-z0-9.+-]+$/iu),
            })
            .strict(),
        )
        .min(1)
        .max(2),
      truncated: n.boolean().optional(),
      source: n.literal("browser_turn_end").optional(),
    })
    .strict(),
  mx = L.superRefine((e, t) => {
    let r = e.display;
    if (typeof r != "object" || r === null || Array.isArray(r) || r.kind !== "node_repl_images")
      return;
    let i = px.safeParse(r);
    if (!i.success)
      for (let o of i.error.issues) t.addIssue({ ...o, path: ["display", ...o.path] });
  }),
  Mu = n.union([n.string(), n.number().int()]),
  kf = n
    .object({
      traceId: u.optional(),
      parentId: u.optional(),
      spanId: u.optional(),
      traceparent: u.optional(),
    })
    .strict(),
  gx = n
    .object({ id: Mu, method: u, params: n.unknown().optional(), trace: kf.optional() })
    .strict(),
  fx = n.object({ method: u, params: n.unknown().optional(), trace: kf.optional() }).strict(),
  hx = n.object({ id: Mu, result: n.unknown() }).strict(),
  yx = n
    .object({
      id: Mu,
      error: n
        .object({ code: n.number().int(), message: u, data: n.unknown().optional() })
        .strict(),
    })
    .strict(),
  fD = n.union([gx, fx, hx, yx]),
  hD = { processResourceSample: "process/resourceSample" },
  If = n
    .object({
      platform: n.enum([
        "aix",
        "android",
        "darwin",
        "freebsd",
        "haiku",
        "linux",
        "netbsd",
        "openbsd",
        "sunos",
        "win32",
        "cygwin",
      ]),
      arch: n.enum([
        "arm",
        "arm64",
        "ia32",
        "loong64",
        "mips",
        "mipsel",
        "ppc",
        "ppc64",
        "riscv64",
        "s390",
        "s390x",
        "x64",
      ]),
      logicalCpuCount: n.number().int().positive().max(4096),
      intervalMs: n
        .number()
        .int()
        .positive()
        .max(10080 * 60 * 1e3),
      cpuCores: n.number().finite().nonnegative().max(4096),
      cpuPercent: n.number().finite().nonnegative().max(1e5),
      rssKb: n.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER),
    })
    .strict(),
  bx = Jd,
  Cf = n.enum(["immediate", "deferred"]),
  $u = n
    .object({ optionId: u, kind: u, name: u, description: n.string().optional(), response: Nt })
    .strict(),
  Sf = n.object({ name: u, value: n.string() }).strict(),
  vx = n.union([
    n
      .object({
        type: n.literal("client_credentials"),
        clientId: u,
        clientSecret: u,
        clientName: u.optional(),
        scope: n.string().optional(),
      })
      .strict(),
    n
      .object({
        type: n.literal("authorization_code"),
        clientId: u.optional(),
        clientSecret: u.optional(),
        clientName: u.optional(),
        redirectPath: u.optional(),
        scope: n.string().optional(),
      })
      .strict(),
  ]),
  Du = n.union([
    n
      .object({
        name: u,
        command: u,
        args: n.array(n.string()),
        env: n.array(Sf),
        isolation: n.enum(["session", "workspace"]).optional(),
        protocolVersion: n.enum(["legacy", "auto", "2026-07-28"]).optional(),
        timeoutMs: n.number().int().positive().optional(),
      })
      .strict(),
    n
      .object({
        name: u,
        type: n.enum(["http", "sse"]),
        url: u,
        headers: n.array(Sf),
        oauth: vx.optional(),
        isolation: n.enum(["session", "workspace"]).optional(),
        protocolVersion: n.enum(["legacy", "auto", "2026-07-28"]).optional(),
        timeoutMs: n.number().int().positive().optional(),
      })
      .strict(),
  ]),
  Sx = n.enum(["connecting", "connected", "disabled", "disconnected", "failed", "untrusted"]),
  _x = n
    .object({
      status: Sx,
      transport: n.enum(["stdio", "http", "sse"]),
      toolCount: n.number().int().nonnegative(),
      updatedAt: u,
      error: n.string().optional(),
      protocolEra: n.enum(["legacy", "modern"]).optional(),
      authorization: n
        .object({ type: n.literal("oauth_authorization_code"), authorizationUrl: u, startedAt: u })
        .strict()
        .optional(),
    })
    .strict(),
  xx = n.enum(["connect", "status"]),
  kx = n
    .object({ workspace: M, mcpServers: n.array(Du).optional(), mode: xx.default("connect") })
    .strict(),
  Ix = n.object({ statuses: n.record(n.string(), _x) }).strict(),
  Cx = n
    .object({ role: n.enum(["user", "assistant"]), content: n.string(), timestamp: oe.optional() })
    .strict(),
  Rx = n
    .object({
      source: n.literal("claudeCode"),
      title: n.string().optional(),
      createdAt: oe.optional(),
      updatedAt: oe.optional(),
      messages: n.array(Cx).min(1),
    })
    .strict(),
  Rf = n.object({ value: u, label: u, description: n.string().optional() }).strict(),
  Pf = n
    .object({
      enabled: n.boolean(),
      levels: n.array(Rf),
      defaultLevel: u.optional(),
      providerOptionsByLevel: n.record(u, L).optional(),
    })
    .strict(),
  Tf = n
    .object({
      ref: q,
      label: u,
      providerLabel: u.optional(),
      providerSource: n.string().optional(),
      providerLogoUrl: u.optional(),
      description: n.string().optional(),
      contextWindow: n.number().int().positive().optional(),
      maxOutputTokens: n.number().int().positive().optional(),
      reasoning: Pf.optional(),
      supportsImages: n.boolean().optional(),
      supportsPdf: n.boolean().optional(),
      supportsTools: n.boolean().optional(),
      supportsStructuredOutput: n.boolean().optional(),
      disabledReason: n.string().optional(),
    })
    .strict(),
  wf = n.enum(["anthropic", "openai", "openai-compatible"]),
  Ef = n.enum(["anthropic-messages", "openai-chat-completions", "openai-responses"]),
  Of = n.enum(["builtin", "models-dev", "custom", "user", "workspace", "ephemeral"]),
  Px = n.discriminatedUnion("source", [
    n.object({ source: n.literal("credential"), key: u }).strict(),
    n.object({ source: n.literal("env"), name: u }).strict(),
    n.object({ source: n.literal("server-config"), key: u }).strict(),
    n.object({ source: n.literal("session-secret"), key: u }).strict(),
  ]),
  Tx = n.discriminatedUnion("source", [
    n.object({ source: n.literal("credential"), key: u }).strict(),
    n.object({ source: n.literal("env"), name: u }).strict(),
    n.object({ source: n.literal("server-config"), key: u }).strict(),
    n.object({ source: n.literal("inline"), value: u }).strict(),
  ]),
  Af = n
    .object({
      modelId: u,
      label: u.optional(),
      description: n.string().optional(),
      contextWindow: n.number().int().positive().optional(),
      maxOutputTokens: n.number().int().positive().optional(),
      reasoning: Pf.optional(),
      supportsImages: n.boolean().optional(),
      supportsPdf: n.boolean().optional(),
      supportsTools: n.boolean().optional(),
      supportsStructuredOutput: n.boolean().optional(),
      providerOptions: L.optional(),
      disabledReason: n.string().optional(),
    })
    .strict(),
  wx = n
    .object({
      providerId: u,
      kind: wf,
      apiFormat: Ef.optional(),
      label: u.optional(),
      source: Of.default("workspace"),
      baseURL: u.optional(),
      apiKeyRef: Px.optional(),
      apiKeyRequired: n.boolean().optional(),
      headers: n.record(n.string(), n.string()).optional(),
      providerOptions: L.optional(),
      logoUrl: u.optional(),
      modelsDevProviderId: u.optional(),
      models: n.array(Af),
      disabledReason: n.string().optional(),
      updatedAt: oe.optional(),
    })
    .strict(),
  Uu = n
    .object({
      providerId: u,
      kind: wf,
      apiFormat: Ef.optional(),
      label: u.optional(),
      source: Of.default("workspace"),
      baseURL: u.optional(),
      apiKey: Tx.optional(),
      apiKeyRequired: n.boolean().optional(),
      headers: n.record(n.string(), n.string()).optional(),
      providerOptions: L.optional(),
      logoUrl: u.optional(),
      modelsDevProviderId: u.optional(),
      models: n.array(Af).min(1),
    })
    .strict(),
  Oe = n
    .object({ revision: u, generatedAt: oe, model: q, provider: Uu, thoughtLevel: u.optional() })
    .strict(),
  yD = n.object({ sessionId: u, appliedModelRuntimeRevision: u, changed: n.boolean() }).strict();
function normalizeProtocolProviderEndpoints(e) {
  let t = e.paths
    ? Object.fromEntries(Object.entries(e.paths).map(([r, i]) => [r, i.trim()]))
    : void 0;
  return {
    ...(e.baseURL !== void 0 ? { baseURL: e.baseURL.trim() } : {}),
    ...(t ? { paths: t } : {}),
  };
}
s(normalizeProtocolProviderEndpoints, "normalizeProtocolProviderEndpoints");
function resolveProtocolProviderEndpoint(e) {
  let t = resolveModelProviderApiFormat(e),
    r = mapModelProviderApiFormatToKind(t),
    i = resolveModelProviderRuntimeBaseUrl(e, r);
  return i ? { apiFormat: t, kind: r, baseURL: i } : null;
}
s(resolveProtocolProviderEndpoint, "resolveProtocolProviderEndpoint");
function resolveProtocolProviderSource(e) {
  return e.source === "builtin" || e.id.startsWith(ke)
    ? "builtin"
    : e.source === "models-dev"
      ? "models-dev"
      : e.source === "custom"
        ? "custom"
        : "workspace";
}
s(resolveProtocolProviderSource, "resolveProtocolProviderSource");
function resolveProtocolModelSupportedFormats(e, t) {
  let r = findModelProviderModel(e, t);
  return r
    ? r.kinds.map(mapModelProviderKindToSupportedFormat)
    : (e.modelSupportedFormats?.[t] ?? (e.apiFormat ? getDefaultModelSupportedFormatsFromApiFormat(e.apiFormat) : void 0) ?? getDefaultModelSupportedFormatsFromEndpoints(e.endpoints));
}
s(resolveProtocolModelSupportedFormats, "resolveProtocolModelSupportedFormats");
function resolveModelConfigForProjection(e, t) {
  let r = findModelProviderModel(e, t);
  if (r) return { explicit: !0, model: r };
  let o = resolveProtocolModelSupportedFormats(e, t).flatMap((a) => {
    let c = mapModelProviderSupportedFormatToKind(a);
    return c ? [c] : [];
  });
  return {
    explicit: !1,
    model: createModelProviderModelConfig({ id: t, name: e.modelDisplayNames?.[t], kinds: o, defaultKind: resolveModelProviderDefaultKind(e) }),
  };
}
s(resolveModelConfigForProjection, "resolveModelConfigForProjection");
function normalizeProtocolProviderHeaders(e) {
  if (!e) return;
  let t = Object.fromEntries(
    Object.entries(e)
      .map(([r, i]) => [r.trim(), i.trim()])
      .filter(([r, i]) => r.length > 0 && i.length > 0),
  );
  return Object.keys(t).length > 0 ? t : void 0;
}
s(normalizeProtocolProviderHeaders, "normalizeProtocolProviderHeaders");
function titleCaseReasoningLevel(e) {
  let t = e.trim();
  return t ? `${t.slice(0, 1).toUpperCase()}${t.slice(1)}` : e;
}
s(titleCaseReasoningLevel, "titleCaseReasoningLevel");
function modelSupportsProviderKind(e, t) {
  return e.kinds.includes(t);
}
s(modelSupportsProviderKind, "modelSupportsProviderKind");
function buildProtocolReasoningState(e, t) {
  if (!e) return;
  let r = Object.keys(e.levels);
  if (r.length === 0) return;
  let i = e.defaultLevel && r.includes(e.defaultLevel) ? e.defaultLevel : r[0],
    o = buildProtocolReasoningProviderOptionsByLevel(e, t);
  return {
    enabled: !0,
    levels: r.map((a) => ({ value: a, label: titleCaseReasoningLevel(a) })),
    ...(i ? { defaultLevel: i } : {}),
    ...(o ? { providerOptionsByLevel: o } : {}),
  };
}
s(buildProtocolReasoningState, "buildProtocolReasoningState");
function buildProtocolReasoningProviderOptionsByLevel(e, t) {
  let r = Object.entries(e.levels).flatMap(([i, o]) => {
    let a = o[t],
      c = a ? applyProviderOptionsPatch(a) : void 0,
      l = c ? { [providerOptionsNamespaceForKind(t)]: c } : void 0;
    return l ? [[i, l]] : [];
  });
  return r.length > 0 ? Object.fromEntries(r) : void 0;
}
s(buildProtocolReasoningProviderOptionsByLevel, "buildProtocolReasoningProviderOptionsByLevel");
function providerOptionsNamespaceForKind(e) {
  switch (e) {
    case "anthropic":
      return "anthropic";
    case "openai":
      return "openai";
    case "openai-compatible":
      return "openaiCompatible";
  }
}
s(providerOptionsNamespaceForKind, "providerOptionsNamespaceForKind");
function applyProviderOptionsPatch(e) {
  let t = {};
  for (let r of e.set ?? []) setNestedProviderOption(t, r.path, r.value);
  for (let r of e.unset ?? []) unsetNestedProviderOption(t, r.path);
  return Object.keys(t).length > 0 ? t : void 0;
}
s(applyProviderOptionsPatch, "applyProviderOptionsPatch");
function setNestedProviderOption(e, t, r) {
  let [i, ...o] = t.map((l) => l.trim()).filter(Boolean);
  if (!i) return;
  if (o.length === 0) {
    e[i] = r;
    return;
  }
  let a = e[i],
    c = a && typeof a == "object" && !Array.isArray(a) ? a : {};
  ((e[i] = c), setNestedProviderOption(c, o, r));
}
s(setNestedProviderOption, "setNestedProviderOption");
function unsetNestedProviderOption(e, t) {
  let [r, ...i] = t.map((a) => a.trim()).filter(Boolean);
  if (!r) return;
  if (i.length === 0) {
    delete e[r];
    return;
  }
  let o = e[r];
  !o || typeof o != "object" || Array.isArray(o) || unsetNestedProviderOption(o, i);
}
s(unsetNestedProviderOption, "unsetNestedProviderOption");
function resolveProtocolModelId(e, t) {
  return e.modelIdByKind?.[t]?.trim() || e.id.trim();
}
s(resolveProtocolModelId, "resolveProtocolModelId");
var Lx = new Set(["image", "pdf"]);
function isCatalogBackedModelProvider(e) {
  return (
    e.source === "models-dev" ||
    !!(e.catalogProviderId?.trim() || e.catalogSourceId?.trim() || e.modelsDevProviderId?.trim())
  );
}
s(isCatalogBackedModelProvider, "isCatalogBackedModelProvider");
function hasPositiveProtocolMediaInputFact(e) {
  return e.modalities.input.some((t) => Lx.has(t));
}
s(hasPositiveProtocolMediaInputFact, "hasPositiveProtocolMediaInputFact");
function shouldProjectProtocolMediaCapabilities(e, t) {
  return isCatalogBackedModelProvider(e) || hasPositiveProtocolMediaInputFact(t);
}
s(shouldProjectProtocolMediaCapabilities, "shouldProjectProtocolMediaCapabilities");
function convertModelProviderConfigToZCodeProviderInput(e) {
  let t = normalizeProtocolProviderEndpoints(e.endpoints),
    r = resolveProtocolProviderEndpoint({ apiFormat: e.apiFormat, endpoints: t, defaultKind: e.defaultKind });
  if (!r) return null;
  let o = Array.from(new Set(getModelProviderModelIds(e))).map((y) => resolveModelConfigForProjection(e, y));
  if (o.length === 0) return null;
  let a = e.apiKey.trim(),
    c = isModelProviderEnabled(e) ? void 0 : "Disabled in app model provider settings",
    l = o.flatMap(({ model: y, explicit: S }) => {
      let v = r.kind;
      if (
        !modelSupportsProviderKind(y, v) ||
        (e.endpoints.paths?.[v] === void 0 &&
          !resolveModelProviderBaseUrl({ apiFormat: r.apiFormat, defaultKind: v, endpoints: t }))
      )
        return [];
      let P = resolveProtocolModelId(y, v),
        w = { modelId: P, providerOptions: { supportedFormats: resolveProtocolModelSupportedFormats(e, y.id) } },
        G = S ? getModelProviderModelLabel(y) : e.modelDisplayNames?.[y.id]?.trim();
      (G && (w.label = G),
        (S || isOneMillionContextModelName(P)) && (w.contextWindow = resolveModelProviderContextWindow(P, y.contextWindow)),
        S &&
          ((w.maxOutputTokens = y.maxOutputTokens),
          (w.reasoning = buildProtocolReasoningState(y.reasoning, v)),
          shouldProjectProtocolMediaCapabilities(e, y) &&
            ((w.supportsImages = y.modalities.input.includes("image")),
            (w.supportsPdf = y.modalities.input.includes("pdf"))),
          (w.supportsTools = y.supportsTools),
          (w.supportsStructuredOutput = y.supportsStructuredOutput)));
      let Jn = c ?? y.disabledReason;
      return (Jn && (w.disabledReason = Jn), [w]);
    });
  if (l.length === 0) return null;
  let p = {
      apiFormat: r.apiFormat,
      apiKeyRequired: e.apiKeyRequired,
      baseURL: r.baseURL,
      kind: r.kind,
      logoUrl: e.logoUrl,
      modelsDevProviderId: e.modelsDevProviderId,
      models: l,
      providerId: e.id,
      providerOptions: {
        endpoints: t,
        apiFormat: r.apiFormat,
        modelSupportedFormats: e.modelSupportedFormats ?? {},
      },
      source: resolveProtocolProviderSource(e),
    },
    d = e.name.trim();
  (d && (p.label = d), a && (p.apiKey = { source: "inline", value: a }));
  let g = normalizeProtocolProviderHeaders(e.headers);
  return (g && (p.headers = g), p);
}
s(convertModelProviderConfigToZCodeProviderInput, "convertModelProviderConfigToZCodeProviderInput");
var Vx = n
    .object({
      revision: n.number().int().nonnegative(),
      providerRevision: u.optional(),
      providers: n.array(wx),
      available: n.array(Tf),
      defaultModel: q.optional(),
      lastUsed: q.optional(),
    })
    .strict(),
  Df = n
    .object({
      content: u,
      status: n.enum(["pending", "in_progress", "completed"]),
      priority: n.enum(["high", "medium", "low"]),
    })
    .strict(),
  Gx = n
    .object({
      timeUsedSeconds: n.number().int().nonnegative(),
      tokensUsed: n.number().int().nonnegative(),
      tokenBudget: n.number().int().positive().nullable(),
      contextUsed: n.number().int().nonnegative(),
      contextWindow: n.number().int().nonnegative(),
      toolCallCount: n.number().int().nonnegative(),
      iterationCount: n.number().int().nonnegative(),
    })
    .strict(),
  Kx = n
    .object({
      id: u,
      source: n.enum(["goal_iteration", "session"]),
      goalIteration: n.number().int().positive().optional(),
      targetId: u.optional(),
      startedAt: oe.optional(),
      updatedAt: oe.optional(),
      todos: n.array(Df),
    })
    .strict(),
  Uf = n
    .object({
      appliedProviderRevision: u.optional(),
      model: n.object({ current: q, available: n.array(Tf), lastUsed: q.optional() }).strict(),
      thoughtLevel: n
        .object({
          enabled: n.boolean(),
          current: u.optional(),
          defaultLevel: u.optional(),
          available: n.array(Rf),
        })
        .strict(),
      mode: n.object({ current: Ee }).strict(),
      permission: n
        .object({ mode: Ee.optional(), rulesRevision: n.number().int().nonnegative().optional() })
        .strict()
        .optional(),
    })
    .strict(),
  Hx = n
    .object({
      requestId: u,
      toolCallId: u,
      toolName: u,
      reason: n.string(),
      riskLevel: n.enum(["low", "medium", "high", "critical"]),
      input: n.unknown().optional(),
      origin: nt.optional(),
      options: n.array($u).min(1),
      requestedAt: oe,
    })
    .strict(),
  Jx = n
    .object({
      toolCallId: u,
      toolName: u,
      status: n.enum(["pending", "running", "completed", "failed", "denied"]),
      startedAt: oe.optional(),
    })
    .strict(),
  Yx = n
    .object({
      sessionId: u,
      status: Qd,
      mode: Ee,
      turnCount: n.number().int().nonnegative(),
      totalTokenCount: n.number().int().nonnegative(),
      contextUsed: n.number().int().nonnegative(),
      contextWindow: n.number().int().nonnegative(),
      currentTurnId: u.optional(),
      pendingPermissions: n.array(Hx),
      activeToolCalls: n.array(Jx),
      backgroundJobs: n.array(L),
      target: eu.nullable().optional(),
      lastError: n
        .object({ type: u, code: u.optional(), message: u, detail: n.string().optional() })
        .strict()
        .optional(),
    })
    .strict(),
  Nf = n
    .object({
      name: u,
      description: n.string(),
      inputHint: n.string().optional(),
      source: n.enum(["builtin", "custom"]).optional(),
    })
    .strict(),
  Xx = n.enum([
    "start",
    "finish",
    "error",
    "text_start",
    "text_delta",
    "text_end",
    "reasoning_start",
    "reasoning_delta",
    "reasoning_end",
    "tool_input_start",
    "tool_input_delta",
    "tool_input_end",
    "tool_call",
  ]),
  Qx = n
    .object({
      assistantMessageId: n.string().optional(),
      delta: n.string().optional(),
      done: n.boolean().optional(),
      input: n.unknown().optional(),
      kind: Xx,
      partId: n.string().optional(),
      providerExecuted: n.boolean().optional(),
      toolCallId: n.string().optional(),
      toolName: n.string().optional(),
    })
    .strict(),
  Vr = n
    .object({
      protocol: n.object({ name: n.literal(dx), version: n.literal(ux) }).strict(),
      session: tu,
      settings: Uf,
      projection: Yx,
      runtime: dg,
      messages: n.array(ou),
      goalStats: Gx.optional(),
      todos: n.array(Df).optional(),
      todoGroups: n.array(Kx).optional(),
      slashCommands: n.array(Nf).optional(),
    })
    .strict(),
  ek = n
    .object({
      eventId: u,
      sessionId: u,
      turnId: u.optional(),
      seq: n.number().int().nonnegative(),
      traceId: u.optional(),
      timestamp: oe,
      deliveryKind: Dn.optional(),
    })
    .strict(),
  vD = n.enum([
    "session.created",
    "session.resumed",
    "session.updated",
    "session.titleUpdated",
    "session.closed",
    "turn.started",
    "turn.steerQueued",
    "turn.steerDrained",
    "turn.completed",
    "turn.failed",
    "message.upserted",
    "message.removed",
    "part.started",
    "part.delta",
    "part.upserted",
    "part.removed",
    "model.streaming",
    "tool.updated",
    "permission.requested",
    "permission.resolved",
    "userInput.requested",
    "userInput.resolved",
    "checkpoint.created",
    "rewind.triggered",
    "streamRecovery.updated",
  ]),
  Zf = n
    .object({
      type: u,
      message: u,
      stack: n.string().optional(),
      code: n.string().optional(),
      detail: n.string().optional(),
      retryable: n.boolean().optional(),
      data: n.unknown().optional(),
    })
    .strict(),
  tk = n.object({ mode: Ee, contextWindow: n.number().int().nonnegative() }).strict(),
  nk = n
    .object({
      directory: u,
      interruptedToolCount: n.number().int().nonnegative(),
      messageCount: n.number().int().nonnegative(),
      partCount: n.number().int().nonnegative(),
      recoveredCompactTimelineCount: n.number().int().nonnegative().optional(),
      recoveredSteerInputCount: n.number().int().nonnegative().optional(),
      resumedTodoCount: n.number().int().nonnegative().optional(),
    })
    .strict(),
  ok = n
    .object({
      messageID: u.optional(),
      modelRef: L.optional(),
      previousTitle: n.string(),
      source: n.enum(["default", "first_input", "generated", "custom"]),
      title: n.string(),
    })
    .strict(),
  rk = n
    .object({
      turnNumber: n.number().int().nonnegative(),
      input: n.string(),
      inputId: u.optional(),
      queryId: u.optional(),
      inputSource: bx.optional(),
      inputVisibility: Hd.optional(),
      executionKind: n.enum(["agent", "controlOnly"]).optional(),
      targetId: u.optional(),
      messageId: u.optional(),
      foregroundExecutionId: u.optional(),
      intent: L.optional(),
      originMeta: L.optional(),
      attachments: n.array(L).optional(),
    })
    .strict(),
  ik = n.literal("plan_approval_feedback"),
  ak = n.enum(["sendText", "sendGoalCommand", "compact"]),
  jf = n.enum(["queue", "guide"]),
  sk = n
    .object({
      pendingInputId: u,
      inputId: u.optional(),
      queryId: u.optional(),
      input: n.string(),
      inputPreview: n.string(),
      inputSize: n.number().int().nonnegative(),
      commandKind: ak.optional(),
      source: ik.optional(),
      toolDisallowlist: n.array(u).optional(),
      delivery: jf.optional(),
      targetTurnId: u,
      queueLength: n.number().int().nonnegative(),
      intent: L.optional(),
    })
    .strict(),
  ck = n
    .object({
      pendingInputIds: n.array(u),
      queryIds: n.array(u).optional(),
      targetTurnId: u,
      injectedMessageIds: n.array(u),
      drainedInputs: n
        .array(
          n
            .object({
              pendingInputId: u,
              messageId: u,
              text: n.string(),
              delivery: jf.optional(),
              intent: L.optional(),
              toolDisallowlist: n.array(u).optional(),
            })
            .strict(),
        )
        .optional(),
    })
    .strict(),
  lk = n
    .object({
      response: n.string(),
      tokenCount: n.number().int().nonnegative(),
      usage: n.unknown().optional(),
      toolCallCount: n.number().int().nonnegative(),
      historyRoundCount: n.number().int().nonnegative().optional(),
      duration: n.number().nonnegative(),
      cacheStats: n
        .object({
          totalMessages: n.number().int().nonnegative(),
          cachedMessages: n.number().int().nonnegative(),
          lastCacheHit: n.boolean(),
          cacheReadTokens: n.number().int().nonnegative().optional(),
        })
        .strict()
        .optional(),
      inputId: u.optional(),
      resultType: n.enum([
        "success",
        "cancelled",
        "error_max_turns",
        "error_max_budget",
        "error_during_execution",
        "error_max_tool_calls",
      ]),
    })
    .strict(),
  dk = n.object({ error: Zf, turnPhase: n.string(), inputId: u.optional() }).strict(),
  uk = n
    .object({
      content: n.string(),
      attachments: n.array(n.unknown()).optional(),
      toolCalls: n.array(n.unknown()).optional(),
      type: n.string().optional(),
      compactBoundary: n.unknown().optional(),
    })
    .strict(),
  pk = n.object({ messageId: u, reason: n.string().optional() }).strict(),
  mk = n
    .object({
      messageId: u,
      partId: u,
      field: n.enum(["text", "reasoning", "input", "output"]).optional(),
      delta: n.string(),
    })
    .strict(),
  _f = n.object({ part: nu }).strict(),
  gk = n.object({ messageId: u, partId: u, reason: n.string().optional() }).strict(),
  Vt = n
    .object({
      toolCallId: u,
      toolName: n.string().optional(),
      parentToolCallId: u.optional(),
      source: n.enum(["subagent"]).optional(),
      agentId: u.optional(),
      agentType: u.optional(),
      childSessionId: u.optional(),
      childToolCallId: u.optional(),
      description: n.string().optional(),
    })
    .strict(),
  fk = n.discriminatedUnion("kind", [
    Vt.extend({
      kind: n.literal("scheduled"),
      toolName: u,
      input: n.unknown().optional(),
      inputByteLength: n.number().int().nonnegative().optional(),
      inputOmitted: n.boolean().optional(),
      inputRef: n.literal("model_stream").optional(),
      dependencies: n.array(u).optional(),
      parallelGroupIndex: n.number().int().nonnegative().optional(),
      canRunParallel: n.boolean().optional(),
      schedule: L.optional(),
    }).strict(),
    Vt.extend({ kind: n.literal("started"), startedAt: qr }).strict(),
    Vt.extend({
      kind: n.literal("progress"),
      elapsedMs: n.number().nonnegative().optional(),
      pid: n.number().int().optional(),
      stdoutBytes: n.number().int().nonnegative().optional(),
      stderrBytes: n.number().int().nonnegative().optional(),
      outputBytes: n.number().int().nonnegative().optional(),
      stdoutTail: n.string().optional(),
      stderrTail: n.string().optional(),
    }).strict(),
    Vt.extend({
      kind: n.literal("result"),
      result: mx,
      duration: n.number().nonnegative(),
    }).strict(),
    Vt.extend({ kind: n.literal("error"), error: Zf }).strict(),
    n
      .object({
        kind: n.literal("batch"),
        toolCallIds: n.array(u),
        successCount: n.number().int().nonnegative(),
        errorCount: n.number().int().nonnegative(),
      })
      .strict(),
    Vt.extend({ kind: n.literal("raw"), payload: L }).strict(),
  ]),
  hk = n
    .object({
      requestId: u.optional(),
      toolCallId: u,
      toolName: u,
      riskLevel: n.enum(["low", "medium", "high", "critical"]),
      reason: n.string(),
      input: n.unknown(),
      suggestedPermissionUpdates: n.array(Xd).optional(),
      origin: nt.optional(),
      options: n.array($u).min(1),
    })
    .strict(),
  yk = n
    .object({
      requestId: u.optional(),
      toolCallId: u,
      toolName: u.optional(),
      decision: Yd.optional(),
      reason: n.string().optional(),
      modifiedInput: n.unknown().optional(),
      inputSummary: n.unknown().optional(),
    })
    .strict(),
  bk = n
    .object({
      requestId: u,
      prompt: n.string(),
      inputType: n.enum(["text", "choice", "confirm"]).optional(),
      choices: n.array(n.string()).optional(),
    })
    .strict(),
  vk = n
    .object({ requestId: u, value: n.unknown().optional(), cancelled: n.boolean().optional() })
    .strict(),
  Sk = n.object({ reason: n.string().optional() }).strict();
function zcodeSessionEventEnvelopeFor(e, t) {
  return ek.extend({ type: n.literal(e), payload: t.optional() });
}
s(zcodeSessionEventEnvelopeFor, "zcodeSessionEventEnvelopeFor");
var Bf = n.discriminatedUnion("type", [
    zcodeSessionEventEnvelopeFor("session.created", tk),
    zcodeSessionEventEnvelopeFor("session.resumed", nk),
    zcodeSessionEventEnvelopeFor("session.updated", L),
    zcodeSessionEventEnvelopeFor("session.titleUpdated", ok),
    zcodeSessionEventEnvelopeFor("session.closed", Sk),
    zcodeSessionEventEnvelopeFor("turn.started", rk),
    zcodeSessionEventEnvelopeFor("turn.steerQueued", sk),
    zcodeSessionEventEnvelopeFor("turn.steerDrained", ck),
    zcodeSessionEventEnvelopeFor("turn.completed", lk),
    zcodeSessionEventEnvelopeFor("turn.failed", dk),
    zcodeSessionEventEnvelopeFor("message.upserted", uk),
    zcodeSessionEventEnvelopeFor("message.removed", pk),
    zcodeSessionEventEnvelopeFor("part.started", _f),
    zcodeSessionEventEnvelopeFor("part.delta", mk),
    zcodeSessionEventEnvelopeFor("part.upserted", _f),
    zcodeSessionEventEnvelopeFor("part.removed", gk),
    zcodeSessionEventEnvelopeFor("model.streaming", Qx),
    zcodeSessionEventEnvelopeFor("tool.updated", fk),
    zcodeSessionEventEnvelopeFor("permission.requested", hk),
    zcodeSessionEventEnvelopeFor("permission.resolved", yk),
    zcodeSessionEventEnvelopeFor("userInput.requested", bk),
    zcodeSessionEventEnvelopeFor("userInput.resolved", vk),
    zcodeSessionEventEnvelopeFor("checkpoint.created", L),
    zcodeSessionEventEnvelopeFor("rewind.triggered", L),
    zcodeSessionEventEnvelopeFor("streamRecovery.updated", L),
  ]),
  SD = n.object({ events: n.array(Bf) }).strict(),
  _D = n.object({ messages: n.array(ou) }).strict(),
  xD = n
    .object({
      type: n.literal("state.updated"),
      scope: n.enum(["server", "workspace", "session"]),
      workspace: M.optional(),
      sessionId: u.optional(),
      revision: n.number().int().nonnegative(),
      reason: n.string().optional(),
      patch: n.unknown(),
    })
    .strict(),
  kD = n
    .object({
      sessionId: u,
      deliveryKind: Dn,
      afterSeq: n.number().int().nonnegative().optional(),
      includeSnapshot: n.boolean().default(!1),
    })
    .strict(),
  ID = n
    .object({
      sessionId: u,
      eventSeq: n.number().int().nonnegative(),
      events: n.array(Bf),
      snapshot: Vr.optional(),
    })
    .strict(),
  CD = n.object({ sessions: n.array(tu) }).strict(),
  Lf = n
    .object({
      childSessionId: u,
      agentId: u.optional(),
      toolCallId: u.optional(),
      subagentType: u,
      title: u,
      summary: n.string().optional(),
      startedAt: n.number().int().nonnegative().optional(),
      endedAt: n.number().int().nonnegative().optional(),
    })
    .strict(),
  _k = Lf.extend({ status: n.enum(["running", "waiting", "blocked"]) }),
  xk = Lf.extend({ status: n.enum(["success", "failed", "cancelled", "lost"]) }),
  RD = n
    .object({
      revision: n.number().int().nonnegative(),
      childSessionIds: n.array(u),
      running: n.array(_k),
      ended: n
        .object({
          total: n.number().int().nonnegative(),
          items: n.array(xk),
          nextCursor: u.optional(),
        })
        .strict(),
    })
    .strict(),
  kk = n
    .object({
      workspace: M,
      settings: Uf,
      modelCatalog: Vx.optional(),
      slashCommands: n.array(Nf).optional(),
    })
    .strict(),
  PD = n
    .object({
      sessionId: u.optional(),
      workspace: M,
      parentSessionId: u.optional(),
      mode: Ee.optional(),
      model: q.optional(),
      runtimeModel: Oe.optional(),
      persistence: Cf.optional(),
      thoughtLevel: u.optional(),
      titleGenerationEnabled: n.boolean().optional(),
      mcpServers: n.array(Du).optional(),
      toolAllowlist: n.array(u).optional(),
      toolDenylist: n.array(u).optional(),
      importedHistory: Rx.optional(),
    })
    .strict(),
  TD = n
    .object({
      sessionId: u,
      workspace: M.optional(),
      runtimeModel: Oe.optional(),
      thoughtLevel: u.optional(),
      mcpServers: n.array(Du).optional(),
      toolAllowlist: n.array(u).optional(),
      toolDenylist: n.array(u).optional(),
    })
    .strict(),
  wD = n
    .object({
      workspace: M.optional(),
      includeArchived: n.boolean().default(!1),
      limit: n.number().int().positive().optional(),
    })
    .strict(),
  ED = n
    .object({
      sessionId: u,
      endedCursor: u.optional(),
      endedLimit: n.number().int().positive().max(100).default(20),
    })
    .strict(),
  OD = n.object({ range: n.enum(fu), timeZone: n.string().optional() }).strict();
var AD = n.object({ sessionId: u }).strict(),
  zD = n
    .object({
      sessionId: u,
      totalTokens: n.number().int().nonnegative(),
      inputTokens: n.number().int().nonnegative(),
      outputTokens: n.number().int().nonnegative(),
      reasoningTokens: n.number().int().nonnegative(),
      cacheCreationTokens: n.number().int().nonnegative(),
      cacheReadTokens: n.number().int().nonnegative(),
      modelRequestCount: n.number().int().nonnegative(),
      modelErrorCount: n.number().int().nonnegative(),
      inputBaselineBySource: n.record(n.string(), n.number().int().nonnegative()),
    })
    .strict(),
  MD = n
    .object({
      sessionId: u,
      deliveryKind: Dn.optional(),
      messageLimit: n.number().int().positive().optional(),
      afterSeq: n.number().int().nonnegative().optional(),
    })
    .strict(),
  $D = n
    .object({
      sessionId: u,
      afterMessageId: u.optional(),
      limit: n.number().int().positive().optional(),
    })
    .strict(),
  DD = n
    .object({
      sessionId: u,
      afterSeq: n.number().int().nonnegative().optional(),
      limit: n.number().int().positive().optional(),
    })
    .strict(),
  Ik = n.enum(["runtime-materialization", "user-execution"]),
  UD = 15e3,
  ND = n.object({ sessionId: u, scope: Ik }).strict(),
  Ck = "preflight-v1",
  Rk = n.enum(["legacy", "preflight-v1"]),
  ZD = n
    .object({
      nativeSearchEnhancementsEnabled: n.boolean(),
      memoryEnabled: n.boolean().default(!1),
      askUserQuestionAutoResolutionEnabled: n.boolean().default(!0),
      integratedTerminalShell: Br.optional(),
      modelContextBudgetStrategy: Rk.default(Ck),
    })
    .strict(),
  Pk = n
    .object({
      tabCount: n.number().int().positive().max(100),
      currentUrl: n.string().trim().min(1).max(4096).optional(),
    })
    .strict(),
  jD = n
    .object({
      sessionId: u,
      inputId: u.optional(),
      queryId: u.optional(),
      content: n.string(),
      attachments: n.array(L).optional(),
      browserAmbientContext: Pk.optional(),
      expectedRevision: n.number().int().nonnegative().optional(),
      expectedProviderRevision: u.optional(),
      expectedModelRuntimeRevision: u.optional(),
      runtimeModel: Oe.optional(),
      automationId: u.optional(),
      offPeakTaskId: u.optional(),
      offPeakRunType: n.enum(["init", "resume"]).optional(),
      botDeliveryTarget: hu.optional(),
      toolDenylist: n.array(u).optional(),
    })
    .strict()
    .superRefine((e, t) => {
      (e.automationId &&
        e.offPeakTaskId &&
        t.addIssue({
          code: n.ZodIssueCode.custom,
          message: "automationId and offPeakTaskId are mutually exclusive",
        }),
        e.offPeakRunType &&
          !e.offPeakTaskId &&
          t.addIssue({
            code: n.ZodIssueCode.custom,
            message: "offPeakRunType requires offPeakTaskId",
            path: ["offPeakRunType"],
          }));
    }),
  BD = n
    .object({
      sessionId: u,
      accepted: n.literal(!0),
      stateRevision: n.number().int().nonnegative(),
      modelRuntimeRevision: u.optional(),
    })
    .strict(),
  Tk = n.discriminatedUnion("kind", [
    n.object({ kind: n.literal("turn"), turnIndex: n.number().int().nonnegative() }).strict(),
    n.object({ kind: n.literal("message"), messageId: u }).strict(),
    n.object({ kind: n.literal("checkpoint"), checkpointId: u }).strict(),
    n.object({ kind: n.literal("latestCheckpoint") }).strict(),
  ]),
  LD = n
    .object({
      sessionId: u,
      target: Tk.default({ kind: "latestCheckpoint" }),
      expectedRevision: n.number().int().nonnegative().optional(),
    })
    .strict(),
  WD = n
    .object({
      forkedSessionId: u,
      parentSessionId: u.optional(),
      targetMessageId: u.optional(),
      targetCheckpointId: u.optional(),
      response: n.string(),
      snapshot: Vr,
    })
    .strict(),
  FD = n
    .object({
      sessionId: u,
      inputId: u.optional(),
      instructions: n.string().optional(),
      expectedRevision: n.number().int().nonnegative().optional(),
      runtimeModel: Oe.optional(),
    })
    .strict(),
  qD = n
    .object({
      response: n.string(),
      snapshot: Vr,
      compact: n
        .object({
          state: n.enum(["accepted", "already_running"]),
          inputId: u.optional(),
          operationId: u.optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
  wk = n.enum(["show", "set", "replace", "pause", "resume", "clear"]),
  VD = n
    .object({
      sessionId: u,
      inputId: u.optional(),
      action: wk,
      objective: n.string().optional(),
      expectedRevision: n.number().int().nonnegative().optional(),
    })
    .strict(),
  GD = n
    .object({ response: n.string(), snapshot: Vr, startedTurn: n.boolean().optional() })
    .strict(),
  KD = n.object({ sessionId: u }).strict(),
  Wf = n.enum(["running", "completed", "failed", "timed_out", "cancelled", "spawn_error", "lost"]),
  Ek = n
    .object({
      taskId: u,
      toolCallId: u.optional(),
      toolName: u.optional(),
      taskKind: n.enum(["bash", "subagent"]).optional(),
      blocked: n.boolean().optional(),
      blockedReason: n.string().optional(),
      cancellable: n.boolean().optional(),
      cancelRequestedAt: qr.optional(),
      command: n.string().optional(),
      description: n.string().optional(),
      status: Wf,
      pid: n.number().int().positive().optional(),
      startedAt: qr.optional(),
      completedAt: qr.optional(),
      outputPath: n.string().optional(),
      stderrPersistedOutputPath: n.string().optional(),
      stdoutPersistedOutputPath: n.string().optional(),
      outputBytes: n.number().int().nonnegative().optional(),
      outputTruncated: n.boolean().optional(),
      outputTail: n.string().optional(),
      stderrBytes: n.number().int().nonnegative().optional(),
      stderrTail: n.string().optional(),
      stdoutBytes: n.number().int().nonnegative().optional(),
      stdoutTail: n.string().optional(),
      terminalId: u.optional(),
    })
    .strict(),
  HD = n.object({ sessionId: u, taskId: u }).strict(),
  JD = n
    .object({
      cancelled: n.boolean(),
      reason: n.string().optional(),
      snapshot: Ek.optional(),
      status: Wf,
      taskId: u,
    })
    .strict(),
  YD = n
    .object({
      sessionId: u,
      model: q,
      runtimeModel: Oe.optional(),
      expectedRevision: n.number().int().nonnegative().optional(),
      persistAsWorkspaceLastUsed: n.boolean().default(!0),
    })
    .strict(),
  XD = n
    .object({
      sessionId: u,
      thoughtLevel: u.optional(),
      runtimeModel: Oe.optional(),
      expectedRevision: n.number().int().nonnegative().optional(),
      persistAsWorkspaceLastUsed: n.boolean().default(!0),
    })
    .strict(),
  QD = n
    .object({ sessionId: u, runtimeModel: Oe, applyModelSelection: n.boolean().default(!0) })
    .strict(),
  eU = n
    .object({ sessionId: u, mode: Ee, expectedRevision: n.number().int().nonnegative().optional() })
    .strict(),
  tU = n.object({ sessionId: u, expectedPersistence: Cf.optional() }).strict(),
  nU = n.object({ closed: n.boolean().optional() }).strict(),
  oU = n
    .object({
      workspace: M,
      runtimeModel: Oe.optional(),
      preferWorkspaceDefaults: n.boolean().optional(),
    })
    .strict(),
  rU = n
    .object({
      workspace: M,
      modelRef: q,
      prompt: u,
      querySource: u,
      maxOutputTokens: n.number().int().positive().optional(),
      temperature: n.number().min(0).max(2).optional(),
    })
    .strict(),
  iU = n.object({ text: n.string(), modelRef: q }).strict(),
  Ok = n.object({ revision: u, generatedAt: oe, providers: n.array(Uu) }).strict(),
  Ak = n.enum(["applied", "unchanged", "failed"]),
  aU = n
    .object({ workspace: M, registry: Ok, includeWorkspaceState: n.boolean().optional() })
    .strict(),
  sU = n
    .object({
      workspace: M,
      appliedProviderRevision: u,
      status: Ak,
      providerCount: n.number().int().nonnegative(),
      workspaceState: kk.optional(),
    })
    .strict(),
  zk = n.object({ askUserQuestionAutoResolutionEnabled: n.boolean() }).strict(),
  cU = n.object({ workspace: M, preferences: zk }).strict(),
  lU = n
    .object({
      workspace: M,
      askUserQuestionAutoResolutionEnabled: n.boolean(),
      snoozedInteractionCount: n.number().int().nonnegative(),
    })
    .strict(),
  dU = n
    .object({
      workspace: M,
      provider: Uu,
      expectedWorkspaceRevision: n.number().int().nonnegative().optional(),
    })
    .strict(),
  uU = n
    .object({
      workspace: M,
      providerId: u,
      expectedWorkspaceRevision: n.number().int().nonnegative().optional(),
    })
    .strict(),
  pU = n
    .object({
      workspace: M,
      model: q,
      runtimeModel: Oe.optional(),
      expectedWorkspaceRevision: n.number().int().nonnegative().optional(),
    })
    .strict(),
  mU = n
    .object({
      workspace: M,
      thoughtLevel: u,
      expectedWorkspaceRevision: n.number().int().nonnegative().optional(),
    })
    .strict(),
  gU = n
    .object({
      workspace: M,
      mode: Ee,
      expectedWorkspaceRevision: n.number().int().nonnegative().optional(),
    })
    .strict(),
  fU = n
    .object({
      requestId: u,
      sessionId: u,
      turnId: u.optional(),
      toolCallId: u,
      toolName: u,
      reason: n.string(),
      riskLevel: n.enum(["low", "medium", "high", "critical"]),
      input: n.unknown(),
      origin: nt.optional(),
      options: n.array($u).min(1),
    })
    .strict(),
  Mk = n
    .object({
      requestId: u,
      sessionId: u,
      turnId: u.optional(),
      workspaceKey: u,
      workspacePath: u,
      workspaceIdentity: u.optional(),
      remoteSessionId: u.optional(),
      clientMode: ot,
      sessionContext: Ur,
    })
    .strict(),
  $k = Ng,
  Dk = n
    .object({
      requestId: u,
      sessionId: u,
      turnId: u.optional(),
      browserId: u.optional(),
      browserGeneration: n.number().int().nonnegative().optional(),
      workspaceKey: u.optional(),
      workspacePath: u.optional(),
      workspaceIdentity: u.optional(),
      remoteSessionId: u.optional(),
      clientMode: ot.optional(),
      sessionContext: Ur.optional(),
      command: Wt,
    })
    .strict(),
  Uk = Ft,
  Nk = n
    .object({
      value: u,
      label: u,
      description: n.string().optional(),
      preview: n.string().optional(),
    })
    .strict(),
  Zk = n
    .object({
      question: u,
      header: u,
      options: n.array(Nk).min(1),
      multiSelect: n.boolean().optional(),
    })
    .strict(),
  hU = n
    .object({
      requestId: u,
      sessionId: u,
      turnId: u.optional(),
      toolCallId: u.optional(),
      toolName: u.optional(),
      prompt: n.string().optional(),
      questions: n.array(Zk).min(1).optional(),
      input: n.unknown().optional(),
      origin: nt.optional(),
      schema: n.unknown().optional(),
    })
    .strict(),
  yU = n
    .object({
      action: n.enum(["accept", "decline", "cancel"]),
      content: L.optional(),
      reason: n.string().optional(),
    })
    .strict(),
  jk = n.enum(["model-request", "captcha-retry"]),
  bU = n
    .object({
      requestId: u,
      sessionId: u,
      turnId: u.optional(),
      workspace: M,
      modelRef: q,
      providerId: u,
      reason: jk,
    })
    .strict(),
  vU = n
    .object({
      headersApplied: n.boolean(),
      errorMessage: u.optional(),
      providerRevision: u.optional(),
    })
    .strict(),
  Ff = n.union([n.string(), n.number(), n.boolean()]),
  qf = n
    .object({
      event: u,
      matcher: n.string().optional(),
      type: n.enum(["command", "process"]),
      command: u,
      args: n.array(n.string()).optional(),
      async: n.boolean().optional(),
      shell: n.union([n.literal(!0), n.string()]).optional(),
      timeout: n.number().positive().optional(),
      timeoutMs: n.number().int().positive().optional(),
      statusMessage: n.string().optional(),
      sourcePath: n.string(),
      runnable: n.boolean(),
    })
    .strict(),
  Bk = n
    .object({
      default: Ff.optional(),
      description: n.string().optional(),
      required: n.boolean().optional(),
      sensitive: n.boolean().optional(),
      title: n.string().optional(),
      type: n.enum(["string", "number", "boolean", "directory", "file"]).optional(),
    })
    .strict(),
  Lk = n.enum(["agent", "command", "skill", "hook", "mcp"]),
  Wk = n.object({ name: u, description: n.string().optional() }).strict(),
  Vf = n.object({ kind: Lk, items: n.array(Wk) }).strict(),
  Gf = n
    .object({
      id: u,
      name: u,
      description: n.string().optional(),
      version: n.string().optional(),
      enabled: n.boolean(),
      source: u,
      marketplace: u,
      author: n.string().optional(),
      authorUrl: n.string().optional(),
      homepage: n.string().optional(),
      skillCount: n.number().int().nonnegative().optional(),
      skillRootCount: n.number().int().nonnegative(),
      commandRootCount: n.number().int().nonnegative(),
      components: n.array(Vf).optional(),
      declaredMcpServerNames: n.array(n.string()).optional(),
      hostMcpServerNames: n.array(n.string()).optional(),
      mcpServerNames: n.array(n.string()),
      hookDetails: n.array(qf).optional(),
      rootPath: n.string(),
      userConfig: n.record(n.string(), Bk).optional(),
      configuredOptions: n.record(n.string(), Ff).optional(),
    })
    .strict(),
  Ae = n
    .object({
      code: n.string(),
      message: n.string(),
      severity: n.enum(["warning", "error"]).optional(),
      pluginId: n.string().optional(),
    })
    .strict(),
  SU = n.object({ workspace: M }).strict(),
  _U = n.object({ plugins: n.array(Gf), diagnostics: n.array(Ae) }).strict(),
  Fk = n
    .object({
      pluginId: u,
      name: u,
      marketplace: u,
      icon: n.string().optional(),
      enabled: n.boolean(),
      conflictingPluginIds: n.array(u),
      skillQualifiedNames: n.array(u),
      mcpServerNames: n.array(u),
      subagentNames: n.array(u).default([]),
    })
    .strict(),
  xU = n.object({ workspace: M, sessionId: u.optional() }).strict(),
  kU = n.object({ authority: n.enum(["session", "workspace"]), plugins: n.array(Fk) }).strict(),
  IU = n.object({ workspace: M, pluginId: u, enabled: n.boolean() }).strict(),
  CU = n.object({ plugin: Gf, enabled: n.boolean() }).strict(),
  Kf = n.enum(["user", "workspace"]),
  Hf = n
    .object({
      displayName: n.string().optional(),
      displayNameI18n: n.record(n.string(), n.string()).optional(),
      descriptionI18n: n.record(n.string(), n.string()).optional(),
      icon: n.string().optional(),
      category: n.string().optional(),
      author: n.string().optional(),
      authorUrl: n.string().optional(),
      homepage: n.string().optional(),
      privacyPolicy: n.string().optional(),
      termsOfService: n.string().optional(),
      heroImage: n.string().optional(),
      examplePrompts: n.array(n.string()).optional(),
      examplePromptsI18n: n.record(n.string(), n.array(n.string())).optional(),
    })
    .strict(),
  zu = n
    .object({
      id: u,
      name: u,
      source: L,
      description: n.string().optional(),
      lastUpdated: n.string().optional(),
      pluginCount: n.number().int().nonnegative(),
      isOfficial: n.boolean().optional(),
      featured: n.array(n.string()).optional(),
      refreshFailure: n
        .object({ code: n.string(), failedAt: n.string(), message: n.string() })
        .strict()
        .optional(),
    })
    .strict(),
  xf = n
    .object({
      id: u,
      name: u,
      marketplace: u,
      description: n.string().optional(),
      version: n.string().optional(),
      installed: n.boolean(),
      componentTypes: n.array(n.string()).optional(),
      listing: Hf.optional(),
    })
    .strict(),
  Nu = n
    .object({
      id: u,
      name: u,
      marketplace: u,
      description: n.string().optional(),
      version: n.string().optional(),
      enabled: n.boolean(),
      scope: Kf,
      installPath: n.string().optional(),
      installedAt: n.string().optional(),
      componentTypes: n.array(n.string()).optional(),
      hookDetails: n.array(qf).optional(),
      updateStatus: n.enum(["none", "update-available", "version-changed"]).optional(),
      latestVersion: n.string().optional(),
      listing: Hf.optional(),
    })
    .strict(),
  RU = n.object({ workspace: M }).strict(),
  PU = n
    .object({
      marketplaces: n.array(zu),
      availablePlugins: n.array(xf),
      installedPlugins: n.array(Nu),
      restorableBuiltins: n.array(xf),
      diagnostics: n.array(Ae),
      capability: n.object({ supported: n.boolean(), reason: n.string().optional() }).strict(),
    })
    .strict(),
  TU = n
    .object({ workspace: M, source: u, dryRun: n.boolean().optional(), operationId: u.optional() })
    .strict(),
  wU = n.object({ workspace: M, marketplace: u }).strict(),
  EU = n.object({ workspace: M, marketplace: u.optional() }).strict(),
  OU = n
    .object({
      marketplace: zu.optional(),
      marketplaces: n.array(zu).optional(),
      diagnostics: n.array(Ae).optional(),
    })
    .strict(),
  AU = n
    .object({
      workspace: M,
      pluginName: u,
      marketplace: u,
      scope: Kf.optional(),
      dryRun: n.boolean().optional(),
      operationId: u.optional(),
    })
    .strict(),
  zU = n.object({ operationId: u }).strict(),
  MU = n.object({ operationId: u, cancelled: n.boolean() }).strict(),
  $U = n
    .object({
      workspace: M,
      pluginId: u.optional(),
      pluginName: u.optional(),
      marketplace: u.optional(),
      removeCache: n.boolean().optional(),
    })
    .strict(),
  DU = n
    .object({
      installedPlugins: n.array(Nu),
      dependencyClosure: n.array(n.string()),
      diagnostics: n.array(Ae),
    })
    .strict(),
  UU = n.object({ removedPlugin: Nu.optional(), diagnostics: n.array(Ae) }).strict(),
  NU = n.object({ workspace: M, pluginId: u.optional(), marketplace: u.optional() }).strict(),
  ZU = n.object({ workspace: M, pluginId: u }).strict(),
  jU = n.object({ pluginId: u, diagnostics: n.array(Ae) }).strict(),
  BU = n.object({ workspace: M, pluginId: u, options: L, dryRun: n.boolean().optional() }).strict(),
  LU = n.object({ pluginId: u, diagnostics: n.array(Ae) }).strict(),
  WU = n
    .object({
      workspace: M,
      pluginName: u.optional(),
      marketplace: u.optional(),
      source: u.optional(),
    })
    .strict(),
  FU = n
    .object({
      ok: n.boolean(),
      diagnostics: n.array(Ae),
      compatibility: n
        .object({
          runnable: n.array(n.string()),
          diagnosticOnly: n.array(n.string()),
          unsupported: n.array(n.string()),
        })
        .strict(),
    })
    .strict(),
  qU = n.object({ workspace: M, pluginName: u, marketplace: u }).strict(),
  VU = n
    .object({
      components: n.array(Vf),
      diagnostics: n.array(Ae).optional(),
      metadata: n
        .object({
          author: n.string().optional(),
          authorUrl: n.string().optional(),
          homepage: n.string().optional(),
          version: n.string().optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
  qk = n
    .object({
      unit: n.enum(["minute", "hourly", "daily", "weekly", "monthly", "yearly"]),
      interval: n.number().int().positive(),
      hour: n.number().int().min(0).max(23),
      minute: n.number().int().min(0).max(59),
      anchorAt: n.number().int(),
      weekdays: n.array(n.number().int().min(0).max(6)).optional(),
      monthDays: n.array(n.number().int().min(1).max(31)).optional(),
      months: n.array(n.number().int().min(1).max(12)).optional(),
      monthlyMode: n.enum(["date", "weekday"]).optional(),
    })
    .strict(),
  Jf = n.enum(["minute", "hourly", "daily", "weekly", "monthly", "yearly"]),
  Zu = n
    .object({
      automationId: u,
      title: n.string(),
      cronExpr: u,
      prompt: u,
      model: n.string().optional(),
      provider: se.optional(),
      mode: qt.optional(),
      thoughtLevel: u.optional(),
      targetTaskId: u.optional(),
      enabled: n.boolean(),
      lifecycleStatus: n.enum(["active", "completed", "failed", "paused"]),
      nextRunAt: oe.optional(),
      lastRunAt: oe.optional(),
      runCount: n.number().int().nonnegative(),
      recurring: n.boolean(),
      maxRuns: n.number().int().positive().optional(),
      scheduleRule: qk.optional(),
    })
    .strict(),
  GU = n
    .object({
      title: n.string().optional(),
      cronExpr: u,
      relativeDelayMinutes: n.number().int().positive().max(525600).optional(),
      prompt: u,
      model: n.string().optional(),
      provider: se.optional(),
      mode: qt.optional(),
      thoughtLevel: u.optional(),
      targetTaskId: u.optional(),
      botDeliveryTarget: hu.optional(),
      recurring: n.boolean().optional(),
      maxRuns: n.number().int().positive().optional(),
      intervalUnit: Jf.optional(),
      interval: n.number().int().min(1).max(200).optional(),
    })
    .strict()
    .refine((e) => (e.intervalUnit === void 0) == (e.interval === void 0), {
      message: "intervalUnit and interval must be set together",
      path: ["interval"],
    })
    .refine((e) => e.intervalUnit === void 0 || e.relativeDelayMinutes === void 0, {
      message: "intervalUnit cannot combine with a relative delayMinutes",
      path: ["intervalUnit"],
    })
    .refine((e) => e.intervalUnit === void 0 || e.recurring !== !1, {
      message: "intervalUnit is a recurring carrier and cannot combine with recurring=false",
      path: ["recurring"],
    })
    .refine((e) => e.intervalUnit === void 0 || e.maxRuns === void 0, {
      message: "intervalUnit is a recurring carrier and cannot combine with maxRuns",
      path: ["maxRuns"],
    }),
  KU = n.object({ automation: Zu }).strict(),
  HU = n
    .object({
      automationId: u,
      title: u.optional(),
      cronExpr: u.optional(),
      prompt: u.optional(),
      recurring: n.boolean().optional(),
      maxRuns: n.number().int().positive().nullable().optional(),
      intervalUnit: Jf.optional(),
      interval: n.number().int().min(1).max(200).optional(),
    })
    .strict()
    .refine(
      (e) =>
        e.title !== void 0 ||
        e.cronExpr !== void 0 ||
        e.prompt !== void 0 ||
        e.recurring !== void 0 ||
        e.maxRuns !== void 0 ||
        e.intervalUnit !== void 0,
      { message: "automation update requires at least one field" },
    )
    .refine((e) => e.maxRuns !== null || e.recurring === !0, {
      message: "clearing maxRuns requires recurring=true",
      path: ["maxRuns"],
    })
    .refine((e) => e.recurring !== !0 || typeof e.maxRuns != "number", {
      message: "recurring=true cannot be combined with a numeric maxRuns",
      path: ["maxRuns"],
    })
    .refine((e) => (e.intervalUnit === void 0) == (e.interval === void 0), {
      message: "intervalUnit and interval must be set together",
      path: ["interval"],
    })
    .refine((e) => e.intervalUnit === void 0 || e.recurring !== !1, {
      message: "intervalUnit is a recurring carrier and cannot combine with recurring=false",
      path: ["recurring"],
    })
    .refine(
      (e) =>
        e.intervalUnit === void 0 ||
        e.maxRuns === void 0 ||
        (e.maxRuns === null && e.recurring === !0),
      {
        message:
          "intervalUnit is a recurring carrier and only allows maxRuns=null with recurring=true",
        path: ["maxRuns"],
      },
    ),
  JU = n.object({ automation: Zu }).strict(),
  YU = n.object({}).strict(),
  XU = n.object({ automations: n.array(Zu) }).strict(),
  QU = n.object({ targetTaskId: u }).strict(),
  eN = n.object({ bound: n.boolean() }).strict(),
  tN = n.object({ automationId: u }).strict(),
  nN = n.object({ deleted: n.boolean() }).strict(),
  Au = {
    sessionCreate: "session/create",
    sessionResume: "session/resume",
    sessionList: "session/list",
    sessionSubagents: "session/subagents",
    sessionRequestRuntimePreferences: "session/requestRuntimePreferences",
    sessionRead: "session/read",
    sessionMessages: "session/messages",
    sessionEvents: "session/events",
    sessionSubscribe: "session/subscribe",
    sessionSend: "session/send",
    sessionStop: "session/stop",
    sessionCancelBackgroundTask: "session/cancelBackgroundTask",
    sessionFork: "session/fork",
    sessionCompact: "session/compact",
    sessionGoal: "session/goal",
    sessionClose: "session/close",
    sessionSetModel: "session/setModel",
    sessionSetThoughtLevel: "session/setThoughtLevel",
    sessionUpdateRuntimeModelConfig: "session/updateRuntimeModelConfig",
    sessionSetMode: "session/setMode",
    workspaceReadState: "workspace/readState",
    workspaceUpdateProviderRegistry: "workspace/updateProviderRegistry",
    workspaceUpdateInteractionPreferences: "workspace/updateInteractionPreferences",
    workspaceUpsertModelProvider: "workspace/upsertModelProvider",
    workspaceRemoveModelProvider: "workspace/removeModelProvider",
    workspaceSetDefaultModel: "workspace/setDefaultModel",
    workspaceSetDefaultThoughtLevel: "workspace/setDefaultThoughtLevel",
    workspaceSetDefaultMode: "workspace/setDefaultMode",
    workspaceGenerateText: "workspace/generateText",
    mcpList: "mcp/list",
    pluginsList: "plugins/list",
    pluginsReferenceCatalog: "plugins/referenceCatalog",
    pluginsSetEnabled: "plugins/setEnabled",
    pluginsOverview: "plugins/overview",
    pluginsMarketplaceAdd: "plugins/marketplace/add",
    pluginsMarketplaceRemove: "plugins/marketplace/remove",
    pluginsMarketplaceUpdate: "plugins/marketplace/update",
    pluginsInstall: "plugins/install",
    pluginsCancelOperation: "plugins/cancelOperation",
    pluginsUninstall: "plugins/uninstall",
    pluginsUpdate: "plugins/update",
    pluginsRestoreBuiltin: "plugins/restoreBuiltin",
    pluginsConfigure: "plugins/configure",
    pluginsValidate: "plugins/validate",
    pluginsDescribe: "plugins/describe",
    automationCreate: "automation/create",
    automationUpdate: "automation/update",
    automationCheckTaskBinding: "automation/checkTaskBinding",
    automationList: "automation/list",
    automationDelete: "automation/delete",
    usageStats: "usage/stats",
    sessionUsage: "session/usage",
    interactionRequestPermission: "interaction/requestPermission",
    interactionRequestUserInput: "interaction/requestUserInput",
    interactionRequestProviderRuntimeHeaders: "interaction/requestProviderRuntimeHeaders",
    interactionBrowserList: "interaction/browserList",
    interactionBrowserExecute: "interaction/browserExecute",
  },
  oN = n.object({}).strict(),
  rN = {
    [Au.mcpList]: { params: kx, result: Ix },
    [Au.interactionBrowserList]: { params: Mk, result: $k },
    [Au.interactionBrowserExecute]: { params: Dk, result: Uk },
  };
var dN = 3,
  uN = n
    .object({ rowId: n.number().int().nonnegative(), entityId: n.string().trim().min(1) })
    .strict(),
  pN = n.number(),
  mN = n.enum(["text", "inputText", "output.text", "summaryText"]);
var Wn = {
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
  attachmentUnreferencedTtlMs: 1440 * 60 * 1e3,
};
var Vk = n
  .string()
  .min(4)
  .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u);
function crc32WireBytes(e) {
  let t = 4294967295;
  for (let r of e) {
    t ^= r;
    for (let i = 0; i < 8; i += 1) t = (t >>> 1) ^ (t & 1 ? 3988292384 : 0);
  }
  return ((t ^ 4294967295) >>> 0).toString(16).padStart(8, "0");
}
s(crc32WireBytes, "crc32WireBytes");
var Fe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function encodeWireBytesBase64(e) {
  let t = "",
    r = [];
  for (let i = 0; i < e.byteLength; i += 3) {
    let o = e[i] ?? 0,
      a = i + 1 < e.byteLength,
      c = i + 2 < e.byteLength,
      l = a ? (e[i + 1] ?? 0) : 0,
      p = c ? (e[i + 2] ?? 0) : 0;
    (r.push(
      Fe[o >>> 2],
      Fe[((o & 3) << 4) | (l >>> 4)],
      a ? Fe[((l & 15) << 2) | (p >>> 6)] : "=",
      c ? Fe[p & 63] : "=",
    ),
      r.length >= 16384 && ((t += r.join("")), (r = [])));
  }
  return t + r.join("");
}
s(encodeWireBytesBase64, "encodeWireBytesBase64");
function decodeWireBase64(e) {
  if (!Vk.safeParse(e).success) return null;
  let t = e.endsWith("==") ? 2 : e.endsWith("=") ? 1 : 0,
    r = new Uint8Array((e.length / 4) * 3 - t),
    i = 0;
  for (let o = 0; o < e.length; o += 4) {
    let a = Fe.indexOf(e[o]),
      c = Fe.indexOf(e[o + 1]),
      l = e[o + 2] === "=" ? 0 : Fe.indexOf(e[o + 2]),
      p = e[o + 3] === "=" ? 0 : Fe.indexOf(e[o + 3]);
    if (a < 0 || c < 0 || l < 0 || p < 0) return null;
    let d = (a << 18) | (c << 12) | (l << 6) | p;
    (i < r.length && (r[i++] = d >>> 16),
      i < r.length && (r[i++] = (d >>> 8) & 255),
      i < r.length && (r[i++] = d & 255));
  }
  return r;
}
s(decodeWireBase64, "decodeWireBase64");
var Gt = {
    maxPhysicalFrameBytes: Wn.maxFrameBytes,
    maxMessageBytes: 16 * 1024 * 1024,
    maxFragments: 64,
    assemblyTimeoutMs: 3e4,
    transportIdMaxChars: Wn.transportEnvelopeIdMaxChars,
  },
  ju = n.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  Fn = n.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  Kt = n
    .string()
    .min(1)
    .max(Gt.transportIdMaxChars)
    .regex(/^[A-Za-z0-9._~-]+$/u),
  kN = n
    .object({ bridgeSessionId: Kt, bridgeGeneration: Fn.optional(), recoveryId: Kt.optional() })
    .strict(),
  Kk = n
    .object({ algorithm: n.literal("crc32"), value: n.string().regex(/^[0-9a-f]{8}$/u) })
    .strict();
function isCanonicalBase64(e) {
  if (e.length < 4 || e.length > Gt.maxPhysicalFrameBytes) return !1;
  let t = decodeWireBase64(e);
  return t !== null && t.byteLength > 0 && encodeWireBytesBase64(t) === e;
}
s(isCanonicalBase64, "isCanonicalBase64");
var Bu = n
    .object({
      zcode_type: n.literal("rpc-frame"),
      bridgeSessionId: Kt,
      bridgeGeneration: Fn.optional(),
      recoveryId: Kt.optional(),
      seq: ju,
      messageSeq: ju,
      fragmentIndex: n
        .number()
        .int()
        .nonnegative()
        .max(Gt.maxFragments - 1),
      fragmentCount: n.number().int().positive().max(Gt.maxFragments),
      messageBytes: n.number().int().positive().max(Gt.maxMessageBytes),
      checksum: Kk,
      dataBase64: n.string().min(4).max(Gt.maxPhysicalFrameBytes).refine(isCanonicalBase64),
    })
    .strict()
    .superRefine((e, t) => {
      (e.fragmentIndex >= e.fragmentCount &&
        t.addIssue({
          code: "custom",
          path: ["fragmentIndex"],
          message: "fragmentIndex must be smaller than fragmentCount",
        }),
        e.fragmentCount > e.messageBytes &&
          t.addIssue({
            code: "custom",
            path: ["fragmentCount"],
            message: "non-empty fragments cannot exceed message bytes",
          }));
    }),
  Lu = n
    .object({
      zcode_type: n.literal("rpc-frame-ack"),
      bridgeSessionId: Kt,
      bridgeGeneration: Fn.optional(),
      recoveryId: Kt.optional(),
      ackMessageSeq: ju,
    })
    .strict(),
  Jk = n.union([Bu, Lu]),
  IN = n
    .object({
      type: n.literal("data"),
      payload: Jk,
      client_ts: Fn.optional(),
      server_ts: Fn.optional(),
    })
    .strict();
function formatZodError(e) {
  return e.issues
    .map((t) => `${t.path.length > 0 ? t.path.join(".") : "<root>"}: ${t.message}`)
    .join("; ");
}
s(formatZodError, "formatZodError");
var h = n.string().trim().min(1),
  WN = n.array(n.string()),
  ce = h.max(Wn.transportEnvelopeIdMaxChars).regex(/^[A-Za-z0-9._~-]+$/u),
  Yk = n.object({
    workspacePath: h,
    workspaceIdentity: h.optional(),
    remoteSessionId: h.optional(),
    label: h,
    workspacePurpose: n.enum(["project", "conversation"]).optional(),
    kind: n.enum(["local", "remote"]),
    connectionState: n.enum(["connected", "disconnected", "reconnecting"]).optional(),
    lastConnectionError: n.string().optional(),
  }),
  eh = n.array(Yk),
  FN = n.object({ requestId: h, workspaceKey: h }),
  qN = n.union([
    n.object({ requestId: h, workspaceKey: h, success: n.literal(!0) }),
    n.object({ requestId: h, workspaceKey: h, success: n.literal(!1), error: n.string() }),
  ]),
  Xk = n.object({
    taskId: h,
    title: n.string(),
    workspacePath: h,
    workspaceIdentity: h.optional(),
    remoteSessionId: h.optional(),
    workspaceLabel: h,
    workspaceKind: n.enum(["local", "remote"]),
    createdAt: n.number().finite(),
    updatedAt: n.number().finite(),
    provider: se.optional(),
    unreadAt: n.number().finite().optional(),
    displayStatus: n.enum(["idle", "running", "completed", "error"]).optional(),
    pinned: n.boolean().optional(),
    archived: n.boolean().optional(),
  }),
  th = n.array(Xk),
  Wu = n.enum([
    "session-not-found",
    "session-expired",
    "session-conflict",
    "workspace-closed",
    "desktop-disconnected",
    "invalid-mobile-connection",
    "desktop-bootstrap-timeout",
    "connection-recovery-timeout",
    "relay-unavailable",
    "unsupported-action",
    "unexpected-error",
  ]),
  Qk = n.discriminatedUnion("kind", [
    n.object({
      bridgeSessionId: ce,
      bridgeGeneration: n.number().int().nonnegative().optional(),
      recoveryId: ce.optional(),
      kind: n.literal("local"),
      workspaceKey: h,
      workspacePath: h,
      initialTaskId: h.optional(),
    }),
    n.object({
      bridgeSessionId: ce,
      bridgeGeneration: n.number().int().nonnegative().optional(),
      recoveryId: ce.optional(),
      kind: n.literal("remote"),
      workspaceKey: h,
      workspacePath: h,
      workspaceIdentity: h,
      remoteSessionId: h,
      initialTaskId: h.optional(),
    }),
  ]),
  qu = n.object({
    activeWorkspaceKey: h.optional(),
    activeTaskId: h.optional(),
    updatedAt: n.number().finite(),
  }),
  eI = n.object({
    platform: h,
    version: h,
    name: h,
    userAgent: n.string().optional(),
    language: n.string().optional(),
    languages: n.array(n.string()).optional(),
    browserPlatform: n.string().optional(),
    viewport: n
      .object({
        width: n.number().finite(),
        height: n.number().finite(),
        devicePixelRatio: n.number().finite(),
      })
      .optional(),
    screen: n.object({ width: n.number().finite(), height: n.number().finite() }).optional(),
    timezone: n.string().optional(),
    online: n.boolean().optional(),
    updatedAt: n.number().finite(),
  }),
  tI = n.object({
    windowControlSessionId: h,
    workspaces: eh,
    tasks: th,
    initialViewState: qu.optional(),
    mobileViewState: qu.optional(),
  }),
  Qf = n.object({
    workspaces: eh,
    tasks: th.optional(),
    activeWorkspaceKey: h.optional(),
    activeTaskId: h.optional(),
  }),
  Fu = n.enum([
    "isDockerAvailable",
    "listWSLDistros",
    "listDockerContainers",
    "listSSHConfigAliases",
    "loadMcpFromUserDirectory",
    "saveMcpToUserDirectory",
    "migrateLegacyCommonMcp",
  ]),
  nI = [
    n.object({ zcode_type: n.literal("bootstrap-request"), requestId: h }),
    n.object({
      zcode_type: n.literal("bootstrap-response"),
      requestId: h,
      success: n.literal(!0),
      result: tI,
    }),
    n.object({ zcode_type: n.literal("workspace-list-request"), requestId: h }),
    n.object({
      zcode_type: n.literal("workspace-list-response"),
      requestId: h,
      success: n.literal(!0),
      result: Qf,
    }),
    n.object({ zcode_type: n.literal("workspace-list-updated"), result: Qf }),
    n.object({
      zcode_type: n.literal("workspace-bridge-open"),
      requestId: h,
      bridgeSessionId: ce,
      bridgeGeneration: n.number().int().nonnegative().optional(),
      recoveryId: ce.optional(),
      workspaceKey: h,
      taskId: h.optional(),
    }),
    n.object({
      zcode_type: n.literal("workspace-bridge-ready"),
      requestId: h,
      bridgeSessionId: ce,
      bridgeGeneration: n.number().int().nonnegative().optional(),
      recoveryId: ce.optional(),
      bridge: Qk,
    }),
    n.object({
      zcode_type: n.literal("workspace-bridge-error"),
      requestId: h,
      bridgeSessionId: ce.optional(),
      bridgeGeneration: n.number().int().nonnegative().optional(),
      recoveryId: ce.optional(),
      reason: Wu,
      error: n.string(),
    }),
    n.object({
      zcode_type: n.literal("workspace-reconnect-request"),
      requestId: h,
      workspaceKey: h,
    }),
    n.object({
      zcode_type: n.literal("workspace-reconnect-response"),
      requestId: h,
      workspaceKey: h,
      success: n.literal(!0),
    }),
    n.object({
      zcode_type: n.literal("workspace-reconnect-response"),
      requestId: h,
      workspaceKey: h,
      success: n.literal(!1),
      error: n.string(),
    }),
    n.object({
      zcode_type: n.literal("mobile-view-state-update"),
      viewState: qu,
      deviceInfo: eI.optional(),
    }),
    n.object({
      zcode_type: n.literal("platform-request"),
      requestId: h,
      method: Fu,
      args: n.unknown().optional(),
    }),
    n.object({
      zcode_type: n.literal("platform-response"),
      requestId: h,
      method: Fu,
      success: n.literal(!0),
      result: n.unknown(),
    }),
    n.object({
      zcode_type: n.literal("platform-response"),
      requestId: h,
      method: Fu,
      success: n.literal(!1),
      error: n.string(),
    }),
    Bu,
    Lu,
    n.object({
      zcode_type: n.literal("bridge-degraded"),
      bridgeSessionId: ce,
      bridgeGeneration: n.number().int().nonnegative().optional(),
      recoveryId: ce.optional(),
      reason: n.enum(["rpc-transport-fault", "rpc-frame-gap", "buffer-overflow", "buffer-timeout"]),
      seq: n.number().int().nonnegative().optional(),
      expectedSeq: n.number().int().nonnegative().optional(),
      droppedCount: n.number().int().nonnegative().optional(),
    }),
    n.object({
      zcode_type: n.literal("app-error"),
      requestId: h.optional(),
      bridgeSessionId: ce.optional(),
      reason: Wu,
      error: n.string(),
    }),
    n.object({
      zcode_type: n.literal("mobile-diagnostic"),
      event: n.enum([
        "state-transition",
        "socket-close",
        "socket-error",
        "recover-start",
        "recover-scheduled",
        "pair-status",
        "failure",
      ]),
      timestamp: n.number().int().nonnegative(),
      state: n.string().optional(),
      previousState: n.string().optional(),
      pairStatus: n.enum(["waiting", "matched"]).optional(),
      closeCode: n.number().int().optional(),
      closeReason: n.string().optional(),
      wasClean: n.boolean().optional(),
      wasPaired: n.boolean().optional(),
      failureReason: Wu.optional(),
      failureMessage: n.string().optional(),
      visibilityState: n.string().optional(),
      online: n.boolean().optional(),
      hiddenDurationMs: n.number().int().nonnegative().optional(),
    }),
  ],
  VN = n.union(nI);
var GN = n.record(n.string(), n.string()),
  KN = h,
  HN = n.string(),
  nh = n.object({
    kind: n.literal("ssh"),
    host: h,
    port: n.number().int().positive().max(65535).optional(),
    username: h,
    sshConfigAlias: h.optional(),
    password: n.string().optional(),
    privateKeyPath: n.string().optional(),
    privateKeyPassphrase: n.string().optional(),
    assetInstallMode: n.enum(Nr).optional(),
    resourcePackages: n
      .object({ selectedPackageIds: n.array(n.string().refine(isKnownRemoteResourcePackageId)).optional() })
      .optional(),
  }),
  oh = n.object({ kind: n.literal("wsl"), distro: n.string().optional(), user: Nn.optional() }),
  oI = n.object({ kind: n.literal("docker"), container: h }),
  rI = n.object({
    kind: n.literal("server"),
    url: n.string().url(),
    name: h.optional(),
    token: n.string().optional(),
    workspacePath: n.string().optional(),
    serverId: h.optional(),
  }),
  qn = n.discriminatedUnion("kind", [nh, oh, oI, rI]),
  JN = n.object({
    type: n.literal("zcode-hello"),
    version: n.string(),
    platform: n.string(),
    arch: n.string(),
    pid: n.number().int(),
  }),
  YN = n.object({ type: n.literal("zcode-hello-ack"), version: n.string(), clientId: h }),
  XN = n.object({ level: n.enum(["info", "warn", "error"]), args: n.array(n.unknown()) }),
  QN = n.object({
    taskId: h,
    status: n.enum([
      "completed",
      "failed",
      "permission_request",
      "elicitation_request",
      "feedback_update",
    ]),
    requestId: h.optional(),
    title: n.string(),
    body: n.string(),
  }),
  iI = n.object({ clientTimezone: h, clientLanguage: h, screenResolution: h }),
  eZ = n.object({
    context: iI,
    elementName: h,
    eventRegion: h,
    eventType: h,
    eventText: n.string().optional(),
    eventExtraDetail: n.record(n.string(), n.string()),
    userId: n.string().optional(),
    talkId: n.string().optional(),
    messageId: n.string().optional(),
  }),
  tZ = n.object({
    name: h,
    group: h,
    value: n.number().finite().optional(),
    properties: n
      .record(n.string(), n.union([n.string(), n.number().finite(), n.boolean(), n.undefined()]))
      .optional(),
  }),
  aI = n.object({ channel: h, payload: n.unknown(), sourceWindowId: n.number().int().optional() }),
  Gr = n.object({
    mockCdnDir: n.string().optional(),
    remoteCdnBaseUrl: n.string().optional(),
    remoteCdnBaseUrls: n.array(n.string()).optional(),
    remoteCacheDir: n.string().optional(),
  }),
  sI = n.object({ workspacePath: h, workspaceIdentity: h.optional() }),
  cI = n.object({
    type: n.literal("init-local"),
    hostId: h.optional(),
    deliveryKind: Un.optional(),
    deviceMid: n.string().optional(),
    feedbackApiBase: n.string().url().optional(),
    workspacePath: h.optional(),
    workspaceIdentity: h.optional(),
    agentWarmupTargets: n.array(sI).max(3).optional(),
    agentSpawnFallbackCwd: h.optional(),
    runtimeProcessEnvPatch: n
      .record(n.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), n.string())
      .optional(),
  }),
  lI = n.object({ type: n.literal("init-remote"), target: qn, remoteAssets: Gr }),
  dI = n.object({
    type: n.literal("init-remote-workspace"),
    target: qn,
    remoteAssets: Gr,
    workspacePath: h.optional(),
    workspaceIdentity: h.optional(),
    hostId: h.optional(),
    deliveryKind: Un.optional(),
  }),
  uI = n.object({
    type: n.literal("init-remote-ssh-host"),
    target: nh,
    remoteAssets: Gr,
    hostId: h.optional(),
    deliveryKind: Un.optional(),
  }),
  pI = n.object({
    type: n.literal("init-remote-wsl-host"),
    target: oh,
    remoteAssets: Gr,
    hostId: h.optional(),
    deliveryKind: Un.optional(),
  }),
  mI = n
    .object({
      type: n.literal("attach-service-port"),
      attachmentId: h,
      clientMode: n.enum(["desktop-continuous", "web-remote-replayable"]),
    })
    .strict(),
  gI = n.object({ type: n.literal("detach-service-port"), attachmentId: h }),
  fI = n.object({
    type: n.literal("acquire-remote-workspace"),
    requestId: h,
    workspacePath: h,
    workspaceIdentity: h.optional(),
    generation: n.number().int().positive(),
  }),
  hI = n.object({
    type: n.literal("release-remote-workspace"),
    workspacePath: h,
    workspaceIdentity: h.optional(),
    generation: n.number().int().positive(),
  }),
  yI = n.object({ type: n.literal("dispose") }),
  rh = n.object({ type: n.literal("broadcast"), message: aI }),
  bI = n.object({ type: n.literal("task-realtime-deliver"), event: Mg }),
  vI = n.object({ type: n.literal("task-run-lease-result"), result: kg }),
  SI = n.object({ type: n.literal("task-owner-command-deliver"), command: Ag }),
  _I = n.object({ type: n.literal("task-owner-command-result"), result: au }),
  xI = n.object({
    type: n.literal("bot-remote-workspace-reconnect-result"),
    requestId: h,
    ok: n.boolean(),
    sessionId: h.optional(),
    error: n.string().optional(),
  }),
  kI = n.object({
    type: n.literal("bot-remote-workspace-connection-status-result"),
    requestId: h,
    ok: n.boolean(),
    connected: n.boolean().optional(),
    error: n.string().optional(),
  }),
  II = n.object({
    type: n.literal("bot-remote-workspace-runtime-port"),
    requestId: h,
    ok: n.boolean(),
    error: n.string().optional(),
  }),
  ih = n.object({
    content: h,
    createdAt: h,
    fromSessionId: h,
    messageId: h,
    requestId: h,
    toSessionId: h,
  }),
  ah = n.object({
    error: n.string().optional(),
    messageId: h,
    requestId: h,
    sessionId: h,
    status: n.enum(["success", "failed"]),
  }),
  CI = n.object({ sessionId: h }),
  RI = n.object({ type: n.literal("session-message-deliver"), request: ih }),
  PI = n.object({ type: n.literal("session-message-delivery-result"), result: ah }),
  TI = n.object({
    type: n.literal("feedback-log-archive-result"),
    requestId: h,
    ok: n.boolean(),
    path: n.string().optional(),
    size: n.number().int().nonnegative().optional(),
    error: n.string().optional(),
  }),
  wI = n.object({
    type: n.literal("cron-run"),
    automationId: h,
    runId: h,
    workspacePath: h,
    workspaceIdentity: n.string().optional(),
    prompt: h,
    targetTaskId: h.optional(),
    model: n.string().optional(),
    provider: n.string().optional(),
    mode: n.string().optional(),
    thoughtLevel: n.string().optional(),
  }),
  EI = n.object({
    type: n.literal("off-peak-run"),
    offPeakTaskId: h,
    workspacePath: h,
    workspaceIdentity: n.string().optional(),
    prompt: h,
    permissionMode: h,
    model: n.string().optional(),
    thoughtLevel: n.string().optional(),
    conversationId: n.string().optional(),
    sessionId: n.string().optional(),
    serverTicketId: n.string().optional(),
  }),
  OI = n.object({ type: n.literal("browser-execute-result"), requestId: h, result: Ft }),
  nZ = n.discriminatedUnion("type", [
    cI,
    lI,
    dI,
    uI,
    pI,
    mI,
    gI,
    fI,
    hI,
    yI,
    rh,
    bI,
    vI,
    SI,
    _I,
    xI,
    kI,
    II,
    RI,
    PI,
    TI,
    wI,
    EI,
    OI,
  ]),
  AI = n.object({ type: n.literal("connected") }),
  zI = n.object({
    type: n.literal("remote-workspace-acquired"),
    requestId: h,
    workspacePath: h,
    workspaceIdentity: h.optional(),
    generation: n.number().int().positive(),
    ok: n.boolean(),
    error: n.string().optional(),
  }),
  MI = n.object({ type: n.literal("error"), error: n.string() }),
  $I = n.object({
    type: n.literal("log"),
    level: n.enum(["info", "warn", "error"]),
    source: n.string(),
    message: n.string(),
  });
var DI = n.enum(["claudeCode"]),
  UI = n.object({
    type: n.literal("agent-process-spawned"),
    pid: n.number().int().positive(),
    provider: se,
    workspacePath: h,
    command: n.string(),
    args: n.array(n.string()),
    startedAt: n.number().int().nonnegative(),
    runtimeGeneration: n.number().int().positive().optional(),
    runtimeInstanceId: h.optional(),
  }),
  NI = n.object({
    type: n.literal("agent-process-ready"),
    pid: n.number().int().positive(),
    provider: se,
    workspacePath: h,
    readyAt: n.number().int().nonnegative(),
    startupDurationMs: n.number().int().nonnegative(),
    runtimeGeneration: n.number().int().positive(),
    runtimeInstanceId: h,
  }),
  ZI = n.object({
    type: n.literal("agent-process-exited"),
    pid: n.number().int().positive(),
    provider: se,
    workspacePath: h,
    exitCode: n.number().int().nullable(),
    signal: n.string().nullable(),
    endedAt: n.number().int().nonnegative(),
    terminationKind: n.enum(["expected", "unexpected", "watchdog_recycle"]),
    terminationReason: n.string().optional(),
    runtimeReady: n.boolean().optional(),
    runtimeGeneration: n.number().int().positive(),
    runtimeInstanceId: h.optional(),
    uptimeMs: n.number().int().nonnegative(),
    stderrLineCount: n.number().int().nonnegative(),
    stderrTail: n.array(n.string().max(1100)).max(20).optional(),
  }),
  jI = n.object({
    type: n.literal("agent-process-error"),
    pid: n.number().int().positive().nullable(),
    provider: se,
    workspacePath: h,
    command: n.string(),
    args: n.array(n.string()),
    errorName: h,
    errorCode: n.string().optional(),
    errorMessage: n.string(),
    errorStack: n.string().optional(),
    runtimeGeneration: n.number().int().positive(),
    runtimeInstanceId: h.optional(),
    occurredAt: n.number().int().nonnegative(),
  }),
  BI = n
    .object({
      type: n.literal("agent-resource-sample"),
      runtimeSurface: n.enum(["local", "remote"]),
      sample: If,
    })
    .strict(),
  LI = n.object({
    type: n.literal("agent-running-task-count-changed"),
    runningTaskCount: n.number().int().nonnegative(),
  }),
  WI = n.object({
    type: n.literal("workspace-running-task-count-changed"),
    workspacePath: h,
    workspaceIdentity: h.optional(),
    runningTaskCount: n.number().int().nonnegative(),
  }),
  FI = n.object({
    type: n.literal("repo-wiki-running-task-count-changed"),
    runningTaskCount: n.number().int().nonnegative(),
  }),
  qI = n.object({ type: n.literal("task-realtime-publish"), event: zg }),
  VI = n.object({ type: n.literal("task-stream-op-publish"), target: iu, op: bg }),
  GI = n.object({ type: n.literal("task-run-lease-acquire"), request: xg }),
  KI = n.object({ type: n.literal("task-run-lease-release"), target: _g }),
  HI = n.object({ type: n.literal("task-owner-command-request"), command: Og }),
  JI = n.object({ type: n.literal("task-owner-command-result"), result: au }),
  YI = n.object({
    type: n.literal("bot-remote-workspace-reconnect-request"),
    requestId: h,
    workspacePath: h,
    workspaceIdentity: h,
    target: qn,
  }),
  XI = n.object({
    type: n.literal("bot-remote-workspace-connection-status-request"),
    requestId: h,
    workspacePath: h,
    workspaceIdentity: h,
    target: qn,
  }),
  QI = n.object({
    type: n.literal("bot-remote-workspace-runtime-port-request"),
    requestId: h,
    workspacePath: h,
    workspaceIdentity: h,
    target: qn,
  }),
  eC = n.object({ type: n.literal("session-message-send-requested"), request: ih }),
  tC = n.object({ type: n.literal("session-route-announce"), route: CI }),
  nC = n.object({ type: n.literal("session-message-deliver-result"), result: ah }),
  oC = n.object({ type: n.literal("feedback-log-archive-request"), requestId: h, sourceDir: h }),
  rC = n.object({
    type: n.literal("cron-run-result"),
    runId: h,
    ok: n.boolean(),
    taskId: n.string().optional(),
    sessionId: n.string().optional(),
    error: n.string().optional(),
    failureKind: n.enum(["transient", "permanent"]).optional(),
  }),
  iC = n.object({
    type: n.literal("off-peak-run-result"),
    offPeakTaskId: h,
    ok: n.boolean(),
    conversationId: n.string().optional(),
    sessionId: n.string().optional(),
    error: n.string().optional(),
    failureKind: n.enum(["transient", "permanent"]).optional(),
  }),
  aC = n.object({ type: n.literal("cron-scheduler-wake-request"), automationId: h }),
  sC = n.object({
    type: n.literal("off-peak-scheduler-wake-request"),
    offPeakTaskId: n.string().optional(),
  }),
  cC = n.object({
    type: n.literal("browser-execute-request"),
    requestId: h,
    browserId: h.optional(),
    browserGeneration: n.number().int().nonnegative().optional(),
    sessionId: h,
    turnId: h.optional(),
    workspaceKey: h.optional(),
    workspacePath: h.optional(),
    workspaceIdentity: h.optional(),
    remoteSessionId: h.optional(),
    clientMode: n.enum(["desktop-continuous", "web-remote-replayable"]).optional(),
    sessionContext: n.enum(["live", "cached"]).optional(),
    command: Wt,
  }),
  lC = n.object({
    transport: n.enum(["http", "websocket", "rpc"]),
    interface: n.string(),
    durationMs: n.number(),
    ok: n.boolean(),
    statusCode: n.number().optional(),
    errorKind: n.string().optional(),
    attempt: n.number().int().positive().optional(),
    dnsMs: n.number().optional(),
    tcpMs: n.number().optional(),
    tlsMs: n.number().optional(),
    ttfbMs: n.number().optional(),
    downloadMs: n.number().optional(),
  }),
  dC = n.object({ type: n.literal("network-telemetry-batch"), observations: n.array(lC).max(500) }),
  oZ = n.discriminatedUnion("type", [
    AI,
    zI,
    MI,
    $I,
    UI,
    NI,
    ZI,
    jI,
    BI,
    LI,
    WI,
    FI,
    rh,
    qI,
    VI,
    GI,
    KI,
    HI,
    JI,
    YI,
    XI,
    QI,
    eC,
    tC,
    nC,
    oC,
    cC,
    dC,
    rC,
    iC,
    aC,
    sC,
  ]),
  uC = n.enum(["running", "completed", "error"]),
  pC = n.object({
    kind: n.literal("image"),
    filename: n.string(),
    mimeType: n.string(),
    sizeBytes: n.number().int().nonnegative().optional(),
    dataBase64: n.string().optional(),
    localPath: n.string().optional(),
  }),
  mC = n.object({
    kind: n.literal("file"),
    filename: n.string(),
    mimeType: n.string(),
    sizeBytes: n.number().int().nonnegative(),
    dataBase64: n.string().optional(),
    textContent: n.string().optional(),
    localPath: n.string().optional(),
  }),
  gC = n.discriminatedUnion("kind", [pC, mC]),
  fC = n.object({
    toolName: n.string().optional(),
    title: n.string().optional(),
    kind: n.string().optional(),
    status: n.enum(["completed", "failed", "denied", "stopped"]).optional(),
    input: n.unknown(),
    output: n.unknown().optional(),
    error: n.string().optional(),
    raw: n.unknown().optional(),
    snapshotRefs: n
      .array(
        n.object({
          field: n.enum(["input", "output", "raw"]),
          refId: n.string(),
          hash: n.string(),
          fullBytes: n.number().int().nonnegative(),
          previewBytes: n.number().int().nonnegative(),
        }),
      )
      .optional(),
  }),
  hC = n.discriminatedUnion("type", [
    n.object({ type: n.literal("content"), content: n.string() }),
    n.object({ type: n.literal("thought"), content: n.string() }),
    n.object({ type: n.literal("tool-call"), toolIndex: n.number().int().nonnegative() }),
  ]),
  yC = n.object({
    id: n.string().optional(),
    role: n.enum(["user", "assistant"]),
    content: n.string(),
    timestamp: n.number().int().nonnegative(),
    model: n.string().optional(),
    characterCount: n.number().int().nonnegative().optional(),
    durationMs: n.number().int().nonnegative().optional(),
    interrupted: n.boolean().optional(),
    feedback: n.enum(["like", "dislike"]).optional(),
    attachments: n.array(gC).optional(),
    tools: n.array(fC).optional(),
    thought: n.string().optional(),
    parts: n.array(hC).optional(),
    checkpointState: n.enum(["partial"]).optional(),
    checkpointReason: n.enum(["tool_completed", "part_boundary", "periodic"]).optional(),
    checkpointUpdatedAt: n.number().int().nonnegative().optional(),
    turnIndex: n.number().int().nonnegative().optional(),
    bodyRefs: n
      .array(
        n.object({
          field: n.enum(["content", "thought"]),
          refId: n.string(),
          hash: n.string(),
          fullBytes: n.number().int().nonnegative(),
          previewBytes: n.number().int().nonnegative(),
        }),
      )
      .optional(),
    toolSlice: n
      .object({
        persistedMessageIndex: n.number().int().nonnegative(),
        totalTools: n.number().int().nonnegative(),
        startToolIndex: n.number().int().nonnegative(),
        endToolIndexExclusive: n.number().int().nonnegative(),
      })
      .optional(),
  }),
  bC = n.enum(["active", "paused", "budget_limited", "complete"]),
  vC = n.enum([
    "set",
    "status_updated",
    "cleared",
    "usage_accounted",
    "run_started",
    "run_finished",
    "summary_updated",
  ]),
  SC = n.enum(["command", "tool", "runtime"]),
  Vu = n.object({
    sessionID: h,
    targetID: h,
    objective: h,
    summaryTitle: n.string().min(1).nullable().default(null),
    status: bC,
    tokenBudget: n.number().int().positive().nullable(),
    tokensUsed: n.number().int().nonnegative(),
    timeUsedSeconds: n.number().int().nonnegative(),
    activeInputId: h.nullable().optional(),
    activeRunStartedAtMs: n.number().int().nonnegative().nullable().optional(),
    activeRunLastSeenAtMs: n.number().int().nonnegative().nullable().optional(),
    time: n.object({
      created: n.number().int().nonnegative(),
      updated: n.number().int().nonnegative(),
    }),
  }),
  rZ = n.object({
    action: vC,
    source: SC,
    target: Vu.nullable(),
    previousTarget: Vu.nullable().optional(),
  });
var _C = n.object({
    taskId: h,
    traceId: h,
    title: n.string(),
    titleOverridden: n.boolean().optional(),
    workspacePath: h,
    workspaceIdentity: h.optional(),
    workspacePurpose: n.enum(["project", "conversation"]).optional(),
    createdAt: n.number().int().nonnegative(),
    updatedAt: n.number().int().nonnegative(),
    mode: qt,
    model: n.string().optional(),
    thoughtLevel: h.optional(),
    runtimeEpoch: n.number().int().nonnegative().optional(),
    provider: se.optional(),
    migrationSource: DI.optional(),
    forkedFromTaskId: h.optional(),
    cronAutomationId: h.optional(),
    offPeakTaskId: h.optional(),
    unreadAt: n.number().int().nonnegative().optional(),
    status: uC.optional(),
    lastError: n
      .object({
        code: n.string().optional(),
        detail: n.string().optional(),
        message: n.string().min(1),
        traceId: h.optional(),
        taskId: h.optional(),
      })
      .optional(),
    repairState: n
      .object({
        claudeNativeSnapshotAssistantContentVersion: n.number().int().nonnegative().optional(),
        codexNativeSnapshotSubagentToolsVersion: n.number().int().nonnegative().optional(),
      })
      .optional(),
    changeSummary: n
      .object({
        fileCount: n.number().int().nonnegative(),
        added: n.number().int().nonnegative(),
        removed: n.number().int().nonnegative(),
        files: n.array(
          n.object({
            path: n.string(),
            added: n.number().int().nonnegative(),
            removed: n.number().int().nonnegative(),
            writeCount: n.number().int().positive(),
            lastTurnIndex: n.number().int().nonnegative(),
          }),
        ),
      })
      .optional(),
    target: Vu.nullable().optional(),
  }),
  xC = n.enum(["idle", "syncing", "ready", "stale", "failed"]),
  iZ = n.object({ provider: se, sessionId: h, lastSyncedTurnIndex: n.number().int(), state: xC }),
  kC = n.object({ workspaceHash: h, taskId: h }),
  aZ = n.object({ version: n.literal("1"), tasks: n.array(kC) }),
  IC = n.object({
    path: n.string(),
    beforeContent: n.string().nullable(),
    afterContent: n.string(),
    writeCount: n.number().int().positive(),
    contentRefs: n
      .array(
        n.object({
          field: n.enum(["beforeContent", "afterContent"]),
          refId: n.string(),
          hash: n.string(),
          fullBytes: n.number().int().nonnegative(),
          previewBytes: n.number().int().nonnegative(),
        }),
      )
      .optional(),
  }),
  CC = n.object({
    turnIndex: n.number().int().nonnegative(),
    snapshots: n.array(IC),
    fileState: n.enum(["applied", "reverted"]).optional(),
  }),
  RC = n.object({
    turnIndex: n.number().int().nonnegative(),
    baseFileCheckpointId: h,
    resultFileCheckpointId: h.optional(),
  }),
  sZ = n.object({
    meta: _C,
    messages: n.array(yC),
    fileChanges: n.array(CC).optional(),
    turnCheckpoints: n.array(RC).optional(),
  });
var PC = "ZCODE_RUNTIME_ENV",
  gZ = "ZCODE_HTTP_PROXY",
  fZ = "ZCODE_NO_PROXY",
  hZ = "ZCODE_AGENT_CA_CERT",
  sh = "ZCODE_TOOL_ENV_PASSTHROUGH_JSON",
  ch = [
    "NODE_ENV",
    "ELECTRON_RUN_AS_NODE",
    "NODE_NO_WARNINGS",
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "ALL_PROXY",
    "NO_PROXY",
    "NODE_EXTRA_CA_CERTS",
    "SSL_CERT_FILE",
    "SSL_CERT_DIR",
    "REQUESTS_CA_BUNDLE",
    "CURL_CA_BUNDLE",
    "GIT_SSL_CAINFO",
    "ZCODE_CUA_PERMISSION_BROKER_TOKEN",
    "ZCODE_CUA_PERMISSION_BROKER_SOCKET",
    "OTEL_EXPORTER_OTLP_ENDPOINT",
    "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT",
    "OTEL_EXPORTER_OTLP_HEADERS",
    "OTEL_EXPORTER_OTLP_TRACES_HEADERS",
    "OTEL_SERVICE_NAME",
    "OTEL_RESOURCE_ATTRIBUTES",
    "OTEL_EXPORTER_OTLP_COMPRESSION",
    "ZCODE_MODEL_TELEMETRY_ENABLED",
    "ZCODE_TELEMETRY_DEVICE_MID",
    "ZCODE_TELEMETRY_USER_ID",
    "ZCODE_TELEMETRY_USER_ID_HASH",
    "ZCODE_TELEMETRY_USER_SUBJECT_ID",
    "ZCODE_TELEMETRY_IDENTITY_STATE",
    "ZCODE_TELEMETRY_RUNTIME_SURFACE",
    "ZCODE_TELEMETRY_RUNTIME_DISTRIBUTION",
  ],
  TC = [
    "NODE_ENV",
    "ELECTRON_RUN_AS_NODE",
    "NODE_NO_WARNINGS",
    "ZCODE_CUA_PERMISSION_BROKER_TOKEN",
    "ZCODE_CUA_PERMISSION_BROKER_SOCKET",
  ],
  wC = /^(npm_config|yarn|pnpm)_(http_proxy|https_proxy|proxy|all_proxy|no_proxy|cafile|ca)$/i;
function normalizeZCodeRuntimeEnv(e) {
  let t = e?.trim().toLowerCase();
  if (t === "development" || t === "production" || t === "test") return t;
}
s(normalizeZCodeRuntimeEnv, "normalizeZCodeRuntimeEnv");
function resolveZCodeRuntimeEnv(e, t = "production") {
  return normalizeZCodeRuntimeEnv(e[PC]) ?? t;
}
s(resolveZCodeRuntimeEnv, "resolveZCodeRuntimeEnv");
var OC = "ZCODE_CUA_PERMISSION_BROKER_SOCKET",
  AC = "ZCODE_CUA_PERMISSION_BROKER_TOKEN",
  zC,
  MC,
  lh = {};
function captureZCodeCuaBrokerCredentials(e) {
  let t = e[OC]?.trim(),
    r = e[AC]?.trim();
  (t && (zC = t), r && (MC = r));
}
s(captureZCodeCuaBrokerCredentials, "captureZCodeCuaBrokerCredentials");
function captureZCodeAgentTelemetryEnv(e) {
  Object.assign(lh, readZCodeAgentTelemetryEnv(e));
}
s(captureZCodeAgentTelemetryEnv, "captureZCodeAgentTelemetryEnv");
function readZCodeAgentTelemetryEnv(e) {
  let t = {};
  for (let r of ch) {
    if (!isZCodeAgentTelemetryEnvKey(r)) continue;
    let i = e[r]?.trim();
    i && (t[r] = i);
  }
  return t;
}
s(readZCodeAgentTelemetryEnv, "readZCodeAgentTelemetryEnv");
function getCapturedZCodeAgentTelemetryEnv() {
  return { ...lh };
}
s(getCapturedZCodeAgentTelemetryEnv, "getCapturedZCodeAgentTelemetryEnv");
function sanitizeZCodeRuntimeEnv(e) {
  (captureZCodeCuaBrokerCredentials(e), captureZCodeAgentTelemetryEnv(e));
  let t = {};
  for (let [r, i] of Object.entries(e)) i === void 0 || shouldSanitizeZCodeRuntimeEnvKey(r) || (t[r] = i);
  return t;
}
s(sanitizeZCodeRuntimeEnv, "sanitizeZCodeRuntimeEnv");
function buildZCodeToolEnvPassthroughEnv(e) {
  let t = readZCodeToolEnvPassthroughEnv(e);
  for (let [r, i] of Object.entries(e)) i === void 0 || !shouldCaptureZCodeToolEnvPassthroughKey(r) || (t[r] = i);
  return stringifyZCodeToolEnvPassthroughEnv(t);
}
s(buildZCodeToolEnvPassthroughEnv, "buildZCodeToolEnvPassthroughEnv");
function readZCodeToolEnvPassthroughEnv(e) {
  let t = e[sh];
  if (!t) return {};
  try {
    let r = JSON.parse(t);
    if (!r || typeof r != "object" || Array.isArray(r)) return {};
    let i = {};
    for (let [o, a] of Object.entries(r))
      typeof a == "string" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(o) && shouldCaptureZCodeToolEnvPassthroughKey(o) && (i[o] = a);
    return i;
  } catch {
    return {};
  }
}
s(readZCodeToolEnvPassthroughEnv, "readZCodeToolEnvPassthroughEnv");
function sanitizeZCodeRuntimeEnvInPlace(e) {
  (captureZCodeCuaBrokerCredentials(e), captureZCodeAgentTelemetryEnv(e));
  for (let t of Object.keys(e)) shouldSanitizeZCodeRuntimeEnvKey(t) && delete e[t];
}
s(sanitizeZCodeRuntimeEnvInPlace, "sanitizeZCodeRuntimeEnvInPlace");
function isZCodeAgentTelemetryEnvKey(e) {
  return (
    e.startsWith("OTEL_") ||
    e.startsWith("ZCODE_TELEMETRY_") ||
    e === "ZCODE_MODEL_TELEMETRY_ENABLED"
  );
}
s(isZCodeAgentTelemetryEnvKey, "isZCodeAgentTelemetryEnvKey");
function shouldSanitizeZCodeRuntimeEnvKey(e) {
  let t = e.toUpperCase();
  return ch.some((r) => r === t) || wC.test(e);
}
s(shouldSanitizeZCodeRuntimeEnvKey, "shouldSanitizeZCodeRuntimeEnvKey");
function shouldCaptureZCodeToolEnvPassthroughKey(e) {
  let t = e.toUpperCase();
  return isZCodeAgentTelemetryEnvKey(t) || TC.some((r) => r === t) ? !1 : shouldSanitizeZCodeRuntimeEnvKey(e);
}
s(shouldCaptureZCodeToolEnvPassthroughKey, "shouldCaptureZCodeToolEnvPassthroughKey");
function stringifyZCodeToolEnvPassthroughEnv(e) {
  let t = Object.entries(e).sort(([r], [i]) => r.localeCompare(i));
  return t.length === 0 ? {} : { [sh]: JSON.stringify(Object.fromEntries(t)) };
}
s(stringifyZCodeToolEnvPassthroughEnv, "stringifyZCodeToolEnvPassthroughEnv");
var CZ = {
  File: "file",
  System: "system",
  Terminal: "terminal",
  Git: "git",
  GitCheckpoint: "git-checkpoint",
  Setting: "setting",
  Credential: "credential",
  Broadcast: "broadcast",
  ZCodeTask: "zcode-task",
  ZCodeAgent: "nofy-agent",
  ZCodeSession: "zcode-session",
  FileWatcher: "file-watcher",
  OAuth: "oauth",
  ModelProvider: "model-provider",
  UsageStats: "usage-stats",
  CodingPlanSubscription: "coding-plan-subscription",
  Skills: "skills",
  SkillSync: "skill-sync",
  McpSync: "mcp-sync",
  PluginSync: "plugin-sync",
  Plugins: "plugins",
  PluginManagement: "plugin-management",
  Subagents: "subagents",
  Commands: "commands",
  Hooks: "hooks",
  Memory: "memory",
  OutputStyle: "output-style",
  SettingsSync: "settings-sync",
  Bots: "bots",
  Feedback: "feedback",
  RepoWiki: "repo-wiki",
  PromptAttachmentTransfer: "prompt-attachment-transfer",
  OffPeakTask: "off-peak-task",
};
var RZ = "x-zcode-rpc-host-capability",
  PZ = {
    InitLocal: "init-local",
    InitRemote: "init-remote",
    InitRemoteWorkspace: "init-remote-workspace",
    InitRemoteSshHost: "init-remote-ssh-host",
    InitRemoteWslHost: "init-remote-wsl-host",
    AttachServicePort: "attach-service-port",
    DetachServicePort: "detach-service-port",
    AcquireRemoteWorkspace: "acquire-remote-workspace",
    ReleaseRemoteWorkspace: "release-remote-workspace",
    Dispose: "dispose",
    Broadcast: "broadcast",
    TaskRealtimeDeliver: "task-realtime-deliver",
    TaskRunLeaseResult: "task-run-lease-result",
    TaskOwnerCommandDeliver: "task-owner-command-deliver",
    TaskOwnerCommandResult: "task-owner-command-result",
    BotRemoteWorkspaceReconnectResult: "bot-remote-workspace-reconnect-result",
    BotRemoteWorkspaceConnectionStatusResult: "bot-remote-workspace-connection-status-result",
    BotRemoteWorkspaceRuntimePort: "bot-remote-workspace-runtime-port",
    SessionMessageDeliver: "session-message-deliver",
    SessionMessageDeliveryResult: "session-message-delivery-result",
    FeedbackLogArchiveResult: "feedback-log-archive-result",
    CronRun: "cron-run",
    OffPeakRun: "off-peak-run",
    BrowserExecuteResult: "browser-execute-result",
  },
  TZ = {
    Connected: "connected",
    Error: "error",
    Log: "log",
    AgentProcessSpawned: "agent-process-spawned",
    AgentProcessReady: "agent-process-ready",
    AgentProcessExited: "agent-process-exited",
    AgentProcessError: "agent-process-error",
    AgentResourceSample: "agent-resource-sample",
    AgentRunningTaskCountChanged: "agent-running-task-count-changed",
    WorkspaceRunningTaskCountChanged: "workspace-running-task-count-changed",
    RemoteWorkspaceAcquired: "remote-workspace-acquired",
    RepoWikiRunningTaskCountChanged: "repo-wiki-running-task-count-changed",
    Broadcast: "broadcast",
    TaskRealtimePublish: "task-realtime-publish",
    TaskStreamOpPublish: "task-stream-op-publish",
    TaskRunLeaseAcquire: "task-run-lease-acquire",
    TaskRunLeaseRelease: "task-run-lease-release",
    TaskOwnerCommandRequest: "task-owner-command-request",
    TaskOwnerCommandResult: "task-owner-command-result",
    BotRemoteWorkspaceReconnectRequest: "bot-remote-workspace-reconnect-request",
    BotRemoteWorkspaceConnectionStatusRequest: "bot-remote-workspace-connection-status-request",
    BotRemoteWorkspaceRuntimePortRequest: "bot-remote-workspace-runtime-port-request",
    SessionMessageSendRequested: "session-message-send-requested",
    SessionRouteAnnounce: "session-route-announce",
    SessionMessageDeliverResult: "session-message-deliver-result",
    FeedbackLogArchiveRequest: "feedback-log-archive-request",
    CronRunResult: "cron-run-result",
    OffPeakRunResult: "off-peak-run-result",
    CronSchedulerWakeRequest: "cron-scheduler-wake-request",
    OffPeakSchedulerWakeRequest: "off-peak-scheduler-wake-request",
    BrowserExecuteRequest: "browser-execute-request",
    NetworkTelemetryBatch: "network-telemetry-batch",
  };
var NC = ["completed", "failed", "cancelled"];
function isOffPeakTerminalStatus(e) {
  return NC.includes(e);
}
s(isOffPeakTerminalStatus, "isOffPeakTerminalStatus");
var ZC = "off-peak-ticket-expired",
  AZ = "offpeak-idle-plan";
function isOffPeakTicketExpiredError(e) {
  return !!e?.includes(ZC);
}
s(isOffPeakTicketExpiredError, "isOffPeakTicketExpiredError");
function formatTimestamp(e = new Date()) {
  let t = e.getFullYear(),
    r = String(e.getMonth() + 1).padStart(2, "0"),
    i = String(e.getDate()).padStart(2, "0"),
    o = String(e.getHours()).padStart(2, "0"),
    a = String(e.getMinutes()).padStart(2, "0"),
    c = String(e.getSeconds()).padStart(2, "0"),
    l = String(e.getMilliseconds()).padStart(3, "0");
  return `${t}-${r}-${i} ${o}:${a}:${c}.${l}`;
}
s(formatTimestamp, "formatTimestamp");
function formatLogPrefix(e, t) {
  let r = formatTimestamp(),
    i = t != null ? ` [pid:${t}]` : "";
  return `[${r}]${i} [${e}]`;
}
s(formatLogPrefix, "formatLogPrefix");
var BC = "nofy"; // REBRAND-047+147
function sanitizeProcessNameSegment(e) {
  if (!e) return null;
  let t = e
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return t ? t.slice(0, 24) : null;
}
s(sanitizeProcessNameSegment, "sanitizeProcessNameSegment");
function joinZCodeProcessName(...e) {
  let t = e.map((r) => sanitizeProcessNameSegment(r)).filter((r) => !!r);
  return [BC, ...t].join("-");
}
s(joinZCodeProcessName, "joinZCodeProcessName");
function formatZCodeHostProcessName(e) {
  return joinZCodeProcessName("host", e);
}
s(formatZCodeHostProcessName, "formatZCodeHostProcessName");
var FC = "studio.zcode-ai.com";
function readProcessEnv() {
  return globalThis.process?.env ?? {};
}
s(readProcessEnv, "readProcessEnv");
function resolveIntranetMachineHost(e = readProcessEnv()) {
  return e.INTRANET_MACHINE_HOST?.trim() || FC;
}
s(resolveIntranetMachineHost, "resolveIntranetMachineHost");
var yh = resolveIntranetMachineHost(),
  bh = 12345,
  qC = `http://${yh}:${bh}/zcode`,
  FZ = `${qC}/deps`,
  VC = 3850,
  GC = "/api/intranet/probe",
  vh = `http://${yh}:${VC}${GC}`;
function resolveIntranetDepsBaseUrl(e = readProcessEnv()) {
  let t = e.ZCODE_DEPS_BASE_URL?.trim();
  return t ? t.replace(/\/+$/, "") : `http://${resolveIntranetMachineHost(e)}:${bh}/zcode/deps`;
}
s(resolveIntranetDepsBaseUrl, "resolveIntranetDepsBaseUrl");
var JZ = {
  targets: [{ kind: "service", url: vh, expectedMarker: "zcode-intranet" }],
  attempts: 2,
  requiredSuccessCount: 1,
};
function shouldEnableInternalOnlyFeature(e) {
  return e.env === "test" || e.isIntranet;
}
s(shouldEnableInternalOnlyFeature, "shouldEnableInternalOnlyFeature");
var lj = "ZCODE_FILE_LOCK_TIMEOUT";
var Sh = class extends Error {
  static {
    s(this, "ApiError");
  }
  url;
  method;
  status;
  responseHeaders;
  constructor(t) {
    (super(t.message, t.cause === void 0 ? void 0 : { cause: t.cause }),
      (this.name = "ApiError"),
      (this.url = t.url),
      (this.method = (t.method ?? "GET").toUpperCase()),
      (this.status = t.status),
      (this.responseHeaders = t.responseHeaders));
  }
};
var _h = "remote:",
  KC = { ssh: 3, wsl: 1, docker: 1, server: 1 };
function isRemoteWorkspaceIdentityKind(e) {
  return e === "ssh" || e === "wsl" || e === "docker" || e === "server";
}
s(isRemoteWorkspaceIdentityKind, "isRemoteWorkspaceIdentityKind");
function parseRemoteWorkspaceIdentity(e) {
  if (!e.startsWith(_h)) return null;
  let t = e.slice(_h.length),
    r = t.indexOf(":");
  if (r <= 0) return null;
  let i = t.slice(0, r);
  if (!isRemoteWorkspaceIdentityKind(i)) return null;
  let o = r + 1;
  for (let c = 0; c < KC[i]; c++) {
    let l = t.indexOf(":", o);
    if (l <= o) return null;
    o = l + 1;
  }
  if (i === "wsl" && t[o] !== "/") {
    let c = t.indexOf(":", o);
    if (c <= o) return null;
    o = c + 1;
  }
  let a = t.slice(o);
  return a.startsWith("/") ? { kind: i, workspacePath: a } : null;
}
s(parseRemoteWorkspaceIdentity, "parseRemoteWorkspaceIdentity");
function isRemoteWorkspaceIdentity(e) {
  return parseRemoteWorkspaceIdentity(e) !== null;
}
s(isRemoteWorkspaceIdentity, "isRemoteWorkspaceIdentity");
function normalizeZCodeApiRetryStatus(e) {
  if (e === null) return null;
  let t = asRecord(e);
  if (Object.keys(t).length === 0) return;
  let r = positiveIntegerValue(t.attempt) ?? Math.max((positiveIntegerValue(t.nextAttempt) ?? 2) - 1, 1),
    i = Math.max(nonNegativeIntegerValue(t.maxRetries) ?? (positiveIntegerValue(t.maxAttempts) ?? r + 1) - 1, r);
  return {
    kind: "api_retry",
    attempt: r,
    maxRetries: i,
    retryDelayMs: nonNegativeIntegerValue(t.retryDelayMs) ?? nonNegativeIntegerValue(t.delayMs) ?? 0,
    errorStatus: nonNegativeIntegerValue(t.errorStatus) ?? nonNegativeIntegerValue(t.statusCode) ?? null,
    error: stringValue(t.error) ?? stringValue(t.message) ?? stringValue(t.reason) ?? "Model retry scheduled",
  };
}
s(normalizeZCodeApiRetryStatus, "normalizeZCodeApiRetryStatus");
function zcodeApiRetryFromModelNetworkStatusPayload(e) {
  let t = stringValue(e.type);
  if (t === "model_retry_scheduled") return normalizeZCodeApiRetryStatus(e);
  if (t === "model_request_started") {
    let r = zcodeApiRetryFromStreamRecoveryPayload(e.streamRecovery);
    if (r !== void 0) return r;
    if ((positiveIntegerValue(e.attempt) ?? 1) <= 1) return null;
  }
  if (t === "model_request_completed" || (t === "model_request_failed" && e.retryable !== !0))
    return null;
}
s(zcodeApiRetryFromModelNetworkStatusPayload, "zcodeApiRetryFromModelNetworkStatusPayload");
function isZCodeModelRetryRecoveryProgressPayload(e) {
  let t = stringValue(e.kind);
  return t === "text_delta" || t === "reasoning_delta"
    ? !!stringValue(e.delta)
    : stringValue(e.toolCallId)
      ? t === "tool_input_start" || t === "tool_input_end" || t === "tool_call"
        ? !0
        : t === "tool_input_delta"
          ? !!stringValue(e.delta)
          : !1
      : !1;
}
s(isZCodeModelRetryRecoveryProgressPayload, "isZCodeModelRetryRecoveryProgressPayload");
function zcodeApiRetryFromStreamRecoveryPayload(e) {
  let t = asRecord(e),
    r = positiveIntegerValue(t.retryNumber);
  if (r !== void 0)
    return {
      kind: "api_retry",
      attempt: r,
      maxRetries: Math.max(nonNegativeIntegerValue(t.maxRetries) ?? r, r),
      retryDelayMs: 0,
      errorStatus: null,
      error: stringValue(t.message) ?? "Model stream recovery retry started",
    };
}
s(zcodeApiRetryFromStreamRecoveryPayload, "zcodeApiRetryFromStreamRecoveryPayload");
function asRecord(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e) ? e : {};
}
s(asRecord, "asRecord");
function stringValue(e) {
  return typeof e == "string" ? e : void 0;
}
s(stringValue, "stringValue");
function nonNegativeIntegerValue(e) {
  return typeof e == "number" && Number.isInteger(e) && e >= 0 ? e : void 0;
}
s(nonNegativeIntegerValue, "nonNegativeIntegerValue");
function positiveIntegerValue(e) {
  return typeof e == "number" && Number.isInteger(e) && e > 0 ? e : void 0;
}
s(positiveIntegerValue, "positiveIntegerValue");
var QC = new Set([
  "model_request_started",
  "model_request_completed",
  "model_request_failed",
  "model_retry_scheduled",
  "model_stream_stalled",
]);
function zcodeTaskNetworkDebugStatusFromPayload(e) {
  let t = networkStatusTypeValue(e.payload.type);
  if (!t) return null;
  let r = stringRecordValue(e.payload.requestHeaders),
    i = stringRecordValue(e.payload.responseHeaders),
    o = Ch(e.payload.model),
    a = W(e.payload.requestId),
    c = W(e.payload.queryId),
    l = e.queryId ?? c,
    p = Gn(e.payload.attempt),
    d = W(e.payload.timestamp),
    g =
      e.eventId ??
      [
        e.traceId,
        e.inputId ?? "no-input",
        t,
        a ?? "no-request",
        p ?? "no-attempt",
        d ?? "no-time",
      ].join(":");
  return {
    type: "task_network_debug_status",
    taskId: e.taskId,
    traceId: e.traceId,
    ...(e.inputId ? { inputId: e.inputId } : {}),
    ...(l ? { queryId: l } : {}),
    eventKey: g,
    ...(e.eventId ? { eventId: e.eventId } : {}),
    statusType: t,
    ...(a ? { requestId: a } : {}),
    ...(W(o.providerId) ? { providerId: W(o.providerId) } : {}),
    ...(W(o.modelId) ? { modelId: W(o.modelId) } : {}),
    ...(W(e.payload.providerKind) ? { providerKind: W(e.payload.providerKind) } : {}),
    ...(W(e.payload.transport) ? { transport: W(e.payload.transport) } : {}),
    ...(W(e.payload.baseURL) ? { baseURL: W(e.payload.baseURL) } : {}),
    ...(W(e.payload.querySource) ? { querySource: W(e.payload.querySource) } : {}),
    ...(p !== void 0 ? { attempt: p } : {}),
    ...(Gn(e.payload.maxAttempts) !== void 0 ? { maxAttempts: Gn(e.payload.maxAttempts) } : {}),
    ...(Gn(e.payload.nextAttempt) !== void 0 ? { nextAttempt: Gn(e.payload.nextAttempt) } : {}),
    ...(booleanValue(e.payload.retryable) !== void 0 ? { retryable: booleanValue(e.payload.retryable) } : {}),
    ...(Kr(e.payload.statusCode) !== void 0 ? { statusCode: Kr(e.payload.statusCode) } : {}),
    ...(nonNegativeNumberValue(e.payload.durationMs) !== void 0 ? { durationMs: nonNegativeNumberValue(e.payload.durationMs) } : {}),
    ...(nonNegativeNumberValue(e.payload.delayMs) !== void 0 ? { delayMs: nonNegativeNumberValue(e.payload.delayMs) } : {}),
    ...(nonNegativeNumberValue(e.payload.idleMs) !== void 0 ? { idleMs: nonNegativeNumberValue(e.payload.idleMs) } : {}),
    ...(nonNegativeNumberValue(e.payload.timeoutMs) !== void 0 ? { timeoutMs: nonNegativeNumberValue(e.payload.timeoutMs) } : {}),
    ...(W(e.payload.reason) ? { reason: W(e.payload.reason) } : {}),
    ...(W(e.payload.message) ? { message: W(e.payload.message) } : {}),
    ...(d ? { timestamp: d } : {}),
    requestHeaders: r,
    responseHeaders: i,
    requestHeaderCount: Kr(e.payload.requestHeaderCount) ?? Object.keys(r).length,
    responseHeaderCount: Kr(e.payload.responseHeaderCount) ?? Object.keys(i).length,
  };
}
s(zcodeTaskNetworkDebugStatusFromPayload, "zcodeTaskNetworkDebugStatusFromPayload");
function networkStatusTypeValue(e) {
  return typeof e == "string" && QC.has(e) ? e : void 0;
}
s(networkStatusTypeValue, "networkStatusTypeValue");
function Ch(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e) ? e : {};
}
s(Ch, "asRecord");
function stringRecordValue(e) {
  let t = Ch(e);
  return Object.fromEntries(
    Object.entries(t)
      .filter((r) => typeof r[1] == "string")
      .map(([r, i]) => [r, i]),
  );
}
s(stringRecordValue, "stringRecordValue");
function W(e) {
  return typeof e == "string" && e.length > 0 ? e : void 0;
}
s(W, "stringValue");
function booleanValue(e) {
  return typeof e == "boolean" ? e : void 0;
}
s(booleanValue, "booleanValue");
function nonNegativeNumberValue(e) {
  return typeof e == "number" && Number.isFinite(e) && e >= 0 ? e : void 0;
}
s(nonNegativeNumberValue, "nonNegativeNumberValue");
function Kr(e) {
  return Number.isInteger(e) && typeof e == "number" && e >= 0 ? e : void 0;
}
s(Kr, "nonNegativeIntegerValue");
function Gn(e) {
  return Number.isInteger(e) && typeof e == "number" && e > 0 ? e : void 0;
}
s(Gn, "positiveIntegerValue");
var Ku = "model-only",
  Hu = "fork",
  tR = '<system-reminder source="goal-continuation">',
  nR = "Continue working toward the active session goal.",
  oR = "Current session goal state",
  rR = "<task-notification>",
  iR = "<subagent-notification>",
  aR = ["Conversation rewind applied.", "Workspace rewind applied."],
  sR = new Set([
    "agent_control_message",
    "background_task",
    "goal-continuation",
    "goal_completion_verification",
    "goal_state_change",
    "plugin_reference",
    "queued_system_notification",
    "resume_goal_state",
    "resume_referenced_session_context",
    "rewind",
    "selection_side_chat",
    "subagent",
    "subagent_message",
    "target_continuation",
    "task_notification",
    "task_status",
    "todo_reminder",
  ]);
function getConversationMessageProjectionPolicy(e) {
  let t = e.info,
    r = e.parts ?? [],
    i = t.semantics;
  if (i?.kind === "compact_summary" || t.summary !== void 0) return "providerContextOnly";
  if (i) {
    if (i.kind === "timeline_event") return "timelineOnly";
    if (i.origin === "real_user" && t.synthetic !== !0 && t.visibility !== Ku)
      return "realUserInput";
    if (
      t.role === "assistant" &&
      i.kind === "assistant_response" &&
      i.uiVisibility === "visible" &&
      i.transcriptVisibility === "visible"
    )
      return "visibleAssistant";
    if (i.providerVisibility === "visible") return "providerContextOnly";
    if (i.kind === "fork_notice") return "timelineOnly";
    if (
      i.origin === "agent_runtime" ||
      i.uiVisibility === "hidden" ||
      i.transcriptVisibility === "hidden"
    )
      return "hiddenSynthetic";
  }
  if (t.visibility === Ku || hasModelOnlyPart(r)) return "providerContextOnly";
  if (isTimelineOnlyMessage(t, r)) return "timelineOnly";
  let o = messageSource(t, r);
  return o === Hu
    ? "timelineOnly"
    : (o && sR.has(o)) ||
        hasLegacySystemReminderContextText(r) ||
        ((t.synthetic === !0 || r.some((a) => a.synthetic === !0)) && hasLegacyNotificationContextText(r))
      ? "providerContextOnly"
      : t.synthetic === !0 || r.some((a) => a.synthetic === !0)
        ? "hiddenSynthetic"
        : t.role === "assistant"
          ? "visibleAssistant"
          : "realUserInput";
}
s(getConversationMessageProjectionPolicy, "getConversationMessageProjectionPolicy");
function isTimelineOnlyMessage(e, t) {
  if (e.semantics?.kind === "timeline_event") return !0;
  let r = metadataRecord(e.metadata);
  return e.source === Hu || Hr(r?.source) === Hu
    ? !0
    : t.some((i) => {
        let o = metadataRecord(i.metadata);
        return (
          i.type === "timeline" ||
          hasSessionForkContext(o) ||
          (i.type === "compaction" &&
            (typeof o?.timelineStatus == "string" || typeof i.summaryMessageId == "string"))
        );
      });
}
s(isTimelineOnlyMessage, "isTimelineOnlyMessage");
function hasModelOnlyPart(e) {
  return e.some((t) => {
    let r = metadataRecord(t.metadata);
    return r?.visibility === Ku || Hr(r?.source) === "goal-continuation";
  });
}
s(hasModelOnlyPart, "hasModelOnlyPart");
function messageSource(e, t) {
  let r = metadataRecord(e.metadata);
  return (
    e.source ??
    Hr(r?.source) ??
    e.semantics?.source ??
    t.map((i) => Hr(metadataRecord(i.metadata)?.source)).find((i) => !!i)
  );
}
s(messageSource, "messageSource");
function hasLegacySystemReminderContextText(e) {
  let t = textFromParts(e).trimStart();
  return (
    t.startsWith(tR) ||
    (t.startsWith("<system-reminder>") && (t.includes(nR) || t.includes(oR))) ||
    aR.some((r) => t.includes(r))
  );
}
s(hasLegacySystemReminderContextText, "hasLegacySystemReminderContextText");
function hasLegacyNotificationContextText(e) {
  let t = textFromParts(e).trimStart();
  return t.startsWith(rR) || t.startsWith(iR);
}
s(hasLegacyNotificationContextText, "hasLegacyNotificationContextText");
function textFromParts(e) {
  return e
    .filter((t) => t.type === "text" && t.ignored !== !0)
    .map((t) => t.text ?? "")
    .join("");
}
s(textFromParts, "textFromParts");
function hasSessionForkContext(e) {
  let t = metadataRecord(e)?.forkContext;
  return typeof t == "object" && t !== null && !Array.isArray(t) && t.kind === "session_fork";
}
s(hasSessionForkContext, "hasSessionForkContext");
function metadataRecord(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : void 0;
}
s(metadataRecord, "metadataRecord");
function Hr(e) {
  return typeof e == "string" && e.length > 0 ? e : void 0;
}
s(Hr, "stringValue");
var gR = '<system-reminder source="goal-continuation">',
  fR = "Continue working toward the active session goal.",
  hR = "Current session goal state",
  Ju = "subagent_message";
function isZCodeGoalContinuationReminderText(e) {
  let t = e.trimStart();
  return t.startsWith(gR) ? !0 : t.startsWith("<system-reminder>") && t.includes(fR);
}
s(isZCodeGoalContinuationReminderText, "isZCodeGoalContinuationReminderText");
function isZCodeGoalContinuationReminderMessage(e) {
  return (
    e.info.role === "user" &&
    (e.info.source === "goal-continuation" ||
      String(e.info.metadata?.source ?? "") === "goal-continuation" ||
      isZCodeGoalContinuationReminderText(textFromZCodeMessageParts(e.parts)))
  );
}
s(isZCodeGoalContinuationReminderMessage, "isZCodeGoalContinuationReminderMessage");
function isZCodeGoalStateReminderText(e) {
  let t = e.trimStart();
  return t.startsWith("<system-reminder>") && t.includes(hR);
}
s(isZCodeGoalStateReminderText, "isZCodeGoalStateReminderText");
function isZCodeGoalModelOnlyReminderMessage(e) {
  return e.info.role === "user" && (isZCodeGoalContinuationReminderMessage(e) || isZCodeGoalStateReminderText(textFromZCodeMessageParts(e.parts)));
}
s(isZCodeGoalModelOnlyReminderMessage, "isZCodeGoalModelOnlyReminderMessage");
function isZCodeModelOnlySyntheticUserMessage(e) {
  if (
    e.info.role === "user" &&
    (String(e.info.source ?? "") === Ju ||
      String(e.info.metadata?.source ?? "") === Ju ||
      e.parts.some((r) => r.type === "text" && String(r.metadata?.source ?? "") === Ju))
  )
    return !0;
  let t = getConversationMessageProjectionPolicy(e);
  return t === "providerContextOnly" || t === "hiddenSynthetic";
}
s(isZCodeModelOnlySyntheticUserMessage, "isZCodeModelOnlySyntheticUserMessage");
function isZCodeCompactSummaryMessage(e) {
  return (
    e.info.role === "user" &&
    e.parts.some((t) =>
      t.type !== "compaction" ? !1 : typeof t.metadata?.timelineStatus != "string",
    )
  );
}
s(isZCodeCompactSummaryMessage, "isZCodeCompactSummaryMessage");
function getZCodeUserVisibleMessages(e, t = {}) {
  let r = [];
  for (let i of e) isZCodeModelOnlySyntheticUserMessage(i) || isZCodeCompactSummaryMessage(i) || r.push(i);
  return r;
}
s(getZCodeUserVisibleMessages, "getZCodeUserVisibleMessages");
function getZCodeGoalIterationByAssistantMessageId(e, t = {}) {
  let r = t.target ?? null;
  if (!r) return new Map();
  let i = new Map(),
    o = [...e].sort(compareZCodeMessagesByCreatedTime),
    a = r.status === "active" ? null : r.updatedAt,
    c = 0,
    l = !1;
  for (let p of o) {
    if (p.info.role === "user") {
      if (isZCodeGoalContinuationReminderMessage(p)) {
        ((c += 1), (l = !1));
        continue;
      }
      isVisibleRealGoalUserMessage(p, r) && (l = !0);
      continue;
    }
    if (
      p.info.role === "assistant" &&
      !(a !== null && p.info.time.created > a) &&
      (l && ((c += 1), (l = !1)), c === 0 && p.info.time.created >= r.createdAt && (c = 1), c > 0)
    ) {
      let d = t.maxGoalIteration && t.maxGoalIteration > 0 ? Math.min(c, t.maxGoalIteration) : c;
      i.set(p.info.messageId, d);
    }
  }
  return i;
}
s(getZCodeGoalIterationByAssistantMessageId, "getZCodeGoalIterationByAssistantMessageId");
function getZCodeGoalActiveIterationCount(e) {
  if (!e.targetStatus) return 0;
  let t = e.timeline ?? [];
  if (t.length === 0) return 1;
  let r = t[t.length - 1];
  if (!r) return 1;
  let i = r.goalIteration ?? t.length;
  return r.status === "started" ||
    (r.status === "completed" && r.verification?.passed === !0) ||
    e.targetStatus === "complete" ||
    e.targetStatus !== "active"
    ? i
    : i + 1;
}
s(getZCodeGoalActiveIterationCount, "getZCodeGoalActiveIterationCount");
function compareZCodeMessagesByCreatedTime(e, t) {
  let r = e.info.time.created - t.info.time.created;
  return r !== 0 ? r : e.info.messageId.localeCompare(t.info.messageId);
}
s(compareZCodeMessagesByCreatedTime, "compareZCodeMessagesByCreatedTime");
function isVisibleRealGoalUserMessage(e, t) {
  return !(
    e.info.role !== "user" ||
    getConversationMessageProjectionPolicy(e) !== "realUserInput" ||
    !(e.info.time.created >= t.createdAt - 3e4)
  );
}
s(isVisibleRealGoalUserMessage, "isVisibleRealGoalUserMessage");
function resolveZCodeVisibleSessionTitle(e) {
  let t = e.title?.trim() ?? "";
  if (t && !isZCodeGoalContinuationReminderText(t) && !isZCodeGoalStateReminderText(t)) return t;
  let r = e.messages.find((a) => a.info.role === "user" && getConversationMessageProjectionPolicy(a) === "realUserInput" && !isZCodeGoalModelOnlyReminderMessage(a)),
    i = textFromZCodeMessageParts(r?.parts ?? []).trim();
  if (i) return i.slice(0, 80);
  let o = e.target?.objective.trim() ?? "";
  return o ? o.slice(0, 80) : (e.fallback ?? "New session");
}
s(resolveZCodeVisibleSessionTitle, "resolveZCodeVisibleSessionTitle");
function statusFromZCodeSession(e) {
  if (e === "running" || e === "waiting" || e === "paused") return "running";
  if (e === "error") return "error";
  if (e === "completed") return "completed";
}
s(statusFromZCodeSession, "statusFromZCodeSession");
function hasBlockingActiveSnapshotRuntime(e) {
  return e.runtime.activeTurnId ||
    e.runtime.activeTurnKind ||
    (e.projection.pendingPermissions ?? []).length > 0
    ? !0
    : (e.projection.activeToolCalls ?? []).some(
        (t) => t.status === "pending" || t.status === "running",
      );
}
s(hasBlockingActiveSnapshotRuntime, "hasBlockingActiveSnapshotRuntime");
function hasActiveSnapshotRuntime(e) {
  return hasBlockingActiveSnapshotRuntime(e);
}
s(hasActiveSnapshotRuntime, "hasActiveSnapshotRuntime");
function isToolCallContinuationFinish(e) {
  return e?.trim().toLowerCase().replace(/_/g, "-") === "tool-calls";
}
s(isToolCallContinuationFinish, "isToolCallContinuationFinish");
function hasCompletedVisibleAssistantTurn(e) {
  let r = getZCodeUserVisibleMessages(e.messages, { target: e.projection.target }).at(-1);
  return r?.info.role !== "assistant" || isToolCallContinuationFinish(r.info.finish)
    ? !1
    : typeof r.info.time.completed == "number";
}
s(hasCompletedVisibleAssistantTurn, "hasCompletedVisibleAssistantTurn");
function deriveZCodeTaskStatusFromSessionSnapshot(e) {
  if (e.projection.lastError) return "error";
  let t = statusFromZCodeSession(e.session.status);
  return t === "error" || t === "completed"
    ? t
    : hasCompletedVisibleAssistantTurn(e) && !hasBlockingActiveSnapshotRuntime(e)
      ? "completed"
      : hasActiveSnapshotRuntime(e)
        ? (t ?? "running")
        : t;
}
s(deriveZCodeTaskStatusFromSessionSnapshot, "deriveZCodeTaskStatusFromSessionSnapshot");
function createZCodeToolProjectionMemory() {
  return {
    completeToolInputById: new Map(),
    streamingToolInputById: new Map(),
    toolNameById: new Map(),
  };
}
s(createZCodeToolProjectionMemory, "createZCodeToolProjectionMemory");
function resolveZCodeToolProjectionMetadata(e, t, r) {
  let i = readNonEmptyString(e.toolName) ?? r.toolNameById?.get(t);
  return (
    i && r.toolNameById?.set(t, i),
    "input" in e
      ? { hasInput: e.input !== void 0, input: e.input, toolName: i }
      : r.completeToolInputById?.has(t)
        ? { hasInput: !0, input: r.completeToolInputById.get(t), toolName: i }
        : { hasInput: !1, toolName: i }
  );
}
s(resolveZCodeToolProjectionMetadata, "resolveZCodeToolProjectionMetadata");
function finalizeZCodeToolProjectionInput(e, t, r) {
  ((r.completeToolInputById ??= new Map()), r.completeToolInputById.set(e, t));
  let i = r.streamingToolInputById?.get(e);
  i && ((i.lastPreviewRawInputLength = i.rawInput.length), (i.rawInput = ""));
}
s(finalizeZCodeToolProjectionInput, "finalizeZCodeToolProjectionInput");
function forgetZCodeToolProjectionMetadata(e, t) {
  (t.completeToolInputById?.delete(e),
    t.streamingToolInputById?.delete(e),
    t.toolNameById?.delete(e));
}
s(forgetZCodeToolProjectionMetadata, "forgetZCodeToolProjectionMetadata");
function readNonEmptyString(e) {
  return typeof e == "string" && e.length > 0 ? e : void 0;
}
s(readNonEmptyString, "readNonEmptyString");
var PR = { "User-Agent": "ZCode/unknown", "HTTP-Referer": Zn, "X-Title": "Z Code@electron" };
function normalizeZCodeSourceHeaderValue(e) {
  let t = e?.trim();
  if (!(!t || !/^[\x20-\x7e]+$/.test(t))) return t;
}
s(normalizeZCodeSourceHeaderValue, "normalizeZCodeSourceHeaderValue");
function buildZCodeSourceHeadersFromContext(e = {}) {
  let t = normalizeZCodeSourceHeaderValue(e.appVersion),
    r = normalizeZCodeSourceHeaderValue(e.arch),
    i = normalizeZCodeSourceHeaderValue(e.clientLanguage) ?? "unknown",
    o = normalizeZCodeSourceHeaderValue(e.clientTimezone) ?? "unknown",
    a = normalizeZCodeSourceHeaderValue(e.deviceMid),
    c = normalizeZCodeSourceHeaderValue(e.endpointOrigin) ?? Zn,
    l = normalizeZCodeSourceHeaderValue(e.osVersion),
    p = normalizeZCodeSourceHeaderValue(e.platform),
    d = normalizeZCodeSourceHeaderValue(e.releaseChannel),
    g = normalizeZCodeSourceHeaderValue(e.sourceTitle) ?? "electron";
  return {
    ...PR,
    "HTTP-Referer": c,
    "User-Agent": `ZCode/${t ?? "unknown"}`,
    ...(t ? { "X-ZCode-App-Version": t } : {}),
    "X-Title": `Z Code@${g}`,
    ...(p && r ? { "X-Platform": `${p}-${r}` } : {}),
    ...(d ? { "X-Release-Channel": d } : {}),
    "X-Client-Language": i,
    "X-Client-Timezone": o,
    ...(p ? { "X-Os-Category": normalizeOsCategory(p) } : {}),
    ...(l ? { "X-Os-Version": l } : {}),
    ...(a ? { "X-Device-Mid": a } : {}),
  };
}
s(buildZCodeSourceHeadersFromContext, "buildZCodeSourceHeadersFromContext");
function normalizeOsCategory(e) {
  switch (e) {
    case "darwin":
      return "macos";
    case "win32":
      return "windows";
    default:
      return "linux";
  }
}
s(normalizeOsCategory, "normalizeOsCategory");
function resolvePlatformBinaryName(e, t) {
  return t === "win32" ? `${e}.exe` : e;
}
s(resolvePlatformBinaryName, "resolvePlatformBinaryName");
var aB = {
  binaryKind: "native-binary",
  binaryEnvVar: "GLM_BINARY_PATH",
  bundledResourceDir: "glm",
  version: "0.13.3",
  spawnArgs: ["app-server", "--stdio"],
  nativeConfigDir: ".nofy/cli",
  nativeConfigFileName: "config.json",
  missingBinaryMessage:
    "[ZCode Agent] glm binary \u672A\u627E\u5230\uFF0C\u8BF7\u8BBE\u7F6E ZCODE_AGENT_WORKDIR\u3001GLM_BINARY_PATH \u6216\u5148\u51C6\u5907 GLM \u8FD0\u884C\u65F6\u8D44\u6E90",
  resolveEntrySegments: s((e) => [resolvePlatformBinaryName("nofy-agent", e)], "resolveEntrySegments"),
  nodeBundleEntryFile: "nofy.cjs",
  resolveNodeBundleSegments() {
    return [this.nodeBundleEntryFile];
  },
};
var dB = "ZCODE_SERVICE_AUTHORITY_MODE";
function shouldUseProviderRegistrySourceForAuthorityMode(e) {
  return e !== "desktop-attached-remote";
}
s(shouldUseProviderRegistrySourceForAuthorityMode, "shouldUseProviderRegistrySourceForAuthorityMode");
var ER = 1,
  OR = n.object({
    path: n.string().trim().min(1),
    label: n.string().trim().min(1).optional(),
    workspaceIdentity: n.string().trim().min(1).optional(),
  }),
  hB = n.object({
    serverId: n.string().trim().min(1),
    name: n.string().trim().min(1).optional(),
    version: n.string(),
    protocolVersion: n.literal(ER),
    authRequired: n.boolean(),
    workspaces: n.array(OR),
    capabilities: n.object({ desktopContinuous: n.literal(!0), websocketRpc: n.literal(!0) }),
  }),
  yB = n
    .object({ capability: n.string().trim().min(1), expiresAt: n.number().int().positive() })
    .strict();
var Ah = "bigmodel";
var AR = "\u51ED\u636E\u89E3\u5BC6\u5931\u8D25\uFF1A",
  zR = "ZCODE_CREDENTIAL_DECRYPT_FAILED";
function isCredentialDecryptError(e) {
  let t = readCredentialErrorCode(e);
  return t ? t === zR : !!readCredentialErrorMessage(e).startsWith(AR);
}
s(isCredentialDecryptError, "isCredentialDecryptError");
function readCredentialErrorCode(e) {
  return typeof e == "object" && e !== null && "code" in e ? String(e.code ?? "") : "";
}
s(readCredentialErrorCode, "readCredentialErrorCode");
function readCredentialErrorMessage(e) {
  return e instanceof Error
    ? e.message
    : typeof e == "object" && e !== null && "message" in e
      ? String(e.message ?? "")
      : "";
}
s(readCredentialErrorMessage, "readCredentialErrorMessage");
function resolveJwtExpiration(e, t = Date.now(), r = 3e4) {
  try {
    let i = e.split(".")[1];
    if (!i) return { kind: "unknown" };
    let o = i.replace(/-/g, "+").replace(/_/g, "/"),
      a = o.padEnd(Math.ceil(o.length / 4) * 4, "="),
      c = globalThis.atob(a),
      l = Uint8Array.from(c, (g) => g.charCodeAt(0)),
      p = JSON.parse(new TextDecoder().decode(l));
    if (typeof p.exp != "number" || !Number.isFinite(p.exp) || p.exp <= 0)
      return { kind: "unknown" };
    let d = p.exp * 1e3;
    return t + Math.max(0, r) >= d
      ? { kind: "expired", expiresAt: d }
      : { kind: "valid", expiresAt: d };
  } catch {
    return { kind: "unknown" };
  }
}
s(resolveJwtExpiration, "resolveJwtExpiration");
var UR = "none";
var NR = [{ value: "nofy-agent", label: "ZCode Agent" }],
  AB = [{ value: UR, label: "\u672A\u6307\u5B9A" }, ...NR];
var zh = `team-plan:${D.bigmodelCodingPlan}:`;
function parseBigModelTeamPlanConnectionKey(e) {
  let t = e?.trim() ?? "";
  if (!t.startsWith(zh)) return null;
  let r = t.slice(zh.length).split(":").map(decodeTeamPlanKeyPart),
    i = r[0]?.trim() ?? "";
  if (!i) return null;
  let o = r[1]?.trim() ?? "",
    a = r[2]?.trim() ?? "";
  return o && a
    ? { productId: i, organizationId: o, projectId: a, legacyProjectOnly: !1 }
    : { productId: i, organizationId: null, projectId: o || null, legacyProjectOnly: !!o };
}
s(parseBigModelTeamPlanConnectionKey, "parseBigModelTeamPlanConnectionKey");
function decodeTeamPlanKeyPart(e) {
  try {
    return decodeURIComponent(e.trim());
  } catch {
    return e.trim();
  }
}
s(decodeTeamPlanKeyPart, "decodeTeamPlanKeyPart");
function resolveSafeTelemetryHostname(e) {
  let t = e?.trim();
  if (!t) return "";
  try {
    let r = new URL(t);
    return r.protocol !== "https:" && r.protocol !== "http:" ? "" : r.hostname.toLowerCase();
  } catch {
    return "";
  }
}
s(resolveSafeTelemetryHostname, "resolveSafeTelemetryHostname");
function byteToHex(e) {
  return e.toString(16).padStart(2, "0");
}
s(byteToHex, "byteToHex");
function formatUuid(e) {
  let t = new Uint8Array(e);
  return (
    (t[6] = (t[6] & 15) | 64),
    (t[8] = (t[8] & 63) | 128),
    [t.slice(0, 4), t.slice(4, 6), t.slice(6, 8), t.slice(8, 10), t.slice(10, 16)]
      .map((i) => Array.from(i, byteToHex).join(""))
      .join("-")
  );
}
s(formatUuid, "formatUuid");
function createUuid() {
  let e = globalThis.crypto;
  if (e?.randomUUID) return e.randomUUID();
  if (e?.getRandomValues) {
    let r = new Uint8Array(16);
    return (e.getRandomValues(r), formatUuid(r));
  }
  let t = new Uint8Array(16);
  for (let r = 0; r < t.length; r += 1) t[r] = Math.floor(Math.random() * 256);
  return formatUuid(t);
}
s(createUuid, "createUuid");
function generateTraceId(e) {
  return createUuid();
}
s(generateTraceId, "generateTraceId");
function createSessionTraceId() {
  return createUuid();
}
s(createSessionTraceId, "createSessionTraceId");
var dL = "zcode-default-group-cron",
  uL = "zcode-default-group-off-peak";
var fL = "AUTOMATION_CREATE_LIMIT_REACHED";
function mergeZCodeBackgroundTaskControlItems(e, t) {
  let r = new Map(e.map((i) => [i.jobId, i]));
  for (let i of t) r.set(i.jobId, i);
  return Array.from(r.values());
}
s(mergeZCodeBackgroundTaskControlItems, "mergeZCodeBackgroundTaskControlItems");
function isPlainRecord(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
s(isPlainRecord, "isPlainRecord");
function readStringField(e, t) {
  if (isPlainRecord(e))
    for (let r of t) {
      let i = e[r];
      if (typeof i != "string") continue;
      let o = i.trim();
      if (o.length > 0) return o;
    }
}
s(readStringField, "readStringField");
function readNumberField(e, t) {
  if (isPlainRecord(e))
    for (let r of t) {
      let i = e[r];
      if (typeof i == "number" && Number.isFinite(i)) return i;
      if (typeof i == "string" && i.trim().length > 0) {
        let o = Number(i);
        if (Number.isFinite(o)) return o;
      }
    }
}
s(readNumberField, "readNumberField");
function readBooleanField(e, t) {
  if (isPlainRecord(e))
    for (let r of t) {
      let i = e[r];
      if (typeof i == "boolean") return i;
      if (typeof i == "string") {
        let o = i.trim().toLowerCase();
        if (o === "true" || o === "yes" || o === "1") return !0;
        if (o === "false" || o === "no" || o === "0") return !1;
      }
    }
}
s(readBooleanField, "readBooleanField");
function readInstantMs(e, t) {
  let r = readNumberField(e, t);
  if (r !== void 0) return r;
  if (isPlainRecord(e))
    for (let i of t) {
      let o = e[i];
      if (typeof o != "string" || o.trim().length === 0) continue;
      let a = Date.parse(o);
      if (Number.isFinite(a)) return a;
    }
}
s(readInstantMs, "readInstantMs");
function commandFromValue(e) {
  if (typeof e == "string" && e.trim().length > 0) return e.trim();
  if (Array.isArray(e)) {
    let t = e.map((r) => (typeof r == "string" ? r.trim() : "")).filter((r) => r.length > 0);
    return t.length > 0 ? t.join(" ") : void 0;
  }
}
s(commandFromValue, "commandFromValue");
function readCommand(e) {
  let t = commandFromValue(e.command) ?? commandFromValue(e.cmd) ?? commandFromValue(e.script);
  if (t) return t;
  let r = isPlainRecord(e.input) ? e.input : null;
  return r ? (commandFromValue(r.command) ?? commandFromValue(r.cmd) ?? commandFromValue(r.script)) : void 0;
}
s(readCommand, "readCommand");
function normalizeToken(e) {
  return (
    e
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "_") ?? ""
  );
}
s(normalizeToken, "normalizeToken");
function taskKindFromToken(e) {
  if (e === "agent" || e === "local_agent" || e === "subagent" || e === "background_agent")
    return "agent";
  if (
    e === "bash" ||
    e === "local_bash" ||
    e === "shell" ||
    e === "terminal" ||
    e === "background_bash" ||
    e === "background_shell"
  )
    return "bash";
}
s(taskKindFromToken, "taskKindFromToken");
function readExplicitTaskKind(e) {
  let t = normalizeToken(readStringField(e, ["taskKind", "task_kind", "taskType", "task_type"]));
  return taskKindFromToken(t);
}
s(readExplicitTaskKind, "readExplicitTaskKind");
function readToolTaskKind(e) {
  let t = normalizeToken(readStringField(e, ["toolName", "tool_name"]));
  return t === "task" ? "agent" : taskKindFromToken(t);
}
s(readToolTaskKind, "readToolTaskKind");
function readBackgroundTypeTaskKind(e) {
  let t = normalizeToken(readStringField(e, ["type", "kind", "category"]));
  if (
    t === "local_agent" ||
    t === "subagent" ||
    t === "background_agent" ||
    t === "agent_background"
  )
    return "agent";
  if (
    t === "local_bash" ||
    t === "background_bash" ||
    t === "background_shell" ||
    t === "bash_background" ||
    t === "shell_background"
  )
    return "bash";
}
s(readBackgroundTypeTaskKind, "readBackgroundTypeTaskKind");
function resolveTaskKind(e) {
  return readExplicitTaskKind(e) ?? readToolTaskKind(e) ?? readBackgroundTypeTaskKind(e);
}
s(resolveTaskKind, "resolveTaskKind");
function resolveZCodeBackgroundTaskControlKind(e) {
  return isPlainRecord(e) ? resolveTaskKind(e) : void 0;
}
s(resolveZCodeBackgroundTaskControlKind, "resolveZCodeBackgroundTaskControlKind");
function readDisplayCommand(e, t) {
  return t === "agent"
    ? (readStringField(e, ["description", "summary", "title", "label"]) ?? readCommand(e))
    : (readCommand(e) ?? readStringField(e, ["description", "summary", "title", "label"]));
}
s(readDisplayCommand, "readDisplayCommand");
function normalizeStatus(e) {
  let t = normalizeToken(e);
  return t === "queued" || t === "scheduled" || t === "starting" || t === "pending"
    ? "pending"
    : t === "running" || t === "in_progress" || t === "started" || t === "active"
      ? "running"
      : t === "completed" ||
          t === "complete" ||
          t === "success" ||
          t === "succeeded" ||
          t === "done"
        ? "completed"
        : t === "failed" || t === "failure" || t === "error" || t === "spawn_error"
          ? "failed"
          : t === "killed" ||
              t === "cancelled" ||
              t === "canceled" ||
              t === "stopped" ||
              t === "terminated" ||
              t === "timed_out" ||
              t === "timeout"
            ? "killed"
            : t === "lost" || t === "unknown"
              ? "lost"
              : "running";
}
s(normalizeStatus, "normalizeStatus");
function readJobId(e, t) {
  let r = readStringField(e, [
    "taskId",
    "task_id",
    "backgroundTaskId",
    "background_task_id",
    "jobId",
    "job_id",
    "backgroundJobId",
    "background_job_id",
    "id",
  ]);
  if (r) return r;
  let i = readInstantMs(e, ["startedAt", "started_at", "startTime", "start_time"]);
  return `background-task:${readNumberField(e, ["pid", "processId", "process_id"]) ?? "no-pid"}:${i ?? "no-start"}:${t}`;
}
s(readJobId, "readJobId");
function parseZCodeBackgroundTaskControlItems(e) {
  if (!Array.isArray(e)) return [];
  let t = new Map();
  for (let r of e) {
    if (!isPlainRecord(r)) continue;
    let i = resolveZCodeBackgroundTaskControlKind(r);
    if (!i) continue;
    let o = readDisplayCommand(r, i);
    if (!o) continue;
    let a = readJobId(r, o),
      c = readStringField(r, ["toolCallId", "tool_call_id"]),
      l = readInstantMs(r, ["startedAt", "started_at", "startTime", "start_time"]),
      p = readNumberField(r, ["elapsedMs", "elapsed_ms", "durationMs", "duration_ms"]),
      d = readNumberField(r, ["pid", "processId", "process_id"]),
      g = readStringField(r, ["title", "name", "label", "description"]),
      y = normalizeStatus(readStringField(r, ["status", "state", "phase"])),
      S = readBooleanField(r, ["cancellable"]),
      v = readStringField(r, ["stdoutTail", "stdout_tail"]),
      P = readStringField(r, ["stderrTail", "stderr_tail"]),
      w = readStringField(r, ["outputTail", "output_tail"]),
      G = {
        jobId: a,
        ...(c ? { toolCallId: c } : {}),
        command: o,
        taskKind: i,
        ...(S !== void 0 ? { cancellable: S } : {}),
        ...(g ? { title: g } : {}),
        status: y,
        ...(l !== void 0 ? { startedAt: l } : {}),
        ...(p !== void 0 ? { elapsedMs: p } : {}),
        ...(d !== void 0 ? { pid: d } : {}),
        ...(v ? { stdoutTail: v } : {}),
        ...(P ? { stderrTail: P } : {}),
        ...(w ? { outputTail: w } : {}),
        raw: r,
      };
    t.set(G.jobId, G);
  }
  return Array.from(t.values());
}
s(parseZCodeBackgroundTaskControlItems, "parseZCodeBackgroundTaskControlItems");
function parseZCodeBackgroundTaskNotificationText(e) {
  let t = e?.trim();
  if (!t?.startsWith("<task-notification>")) return null;
  let r = readTaskNotificationTag(t, "tool-use-id");
  return r
    ? {
        toolUseId: r,
        notification: {
          error: readTaskNotificationTag(t, "error"),
          outputFile: readTaskNotificationTag(t, "output-file"),
          result: readTaskNotificationTag(t, "result"),
          status: readTaskNotificationTag(t, "status"),
          summary: readTaskNotificationTag(t, "summary"),
          taskId: readTaskNotificationTag(t, "task-id"),
        },
      }
    : null;
}
s(parseZCodeBackgroundTaskNotificationText, "parseZCodeBackgroundTaskNotificationText");
function collectZCodeBackgroundTaskNotificationsByToolUseId(e) {
  let t = new Map();
  for (let r of e) {
    if (r.info.role !== "user") continue;
    let i = parseZCodeBackgroundTaskNotificationText(textFromZCodeMessageParts(r.parts));
    i && t.set(i.toolUseId, i.notification);
  }
  return t;
}
s(collectZCodeBackgroundTaskNotificationsByToolUseId, "collectZCodeBackgroundTaskNotificationsByToolUseId");
function zcodeBackgroundTaskNotificationToolUpdateStatus(e) {
  return e === "failed" || e === "lost"
    ? "failed"
    : e === "stopped" || e === "killed"
      ? "stopped"
      : "completed";
}
s(zcodeBackgroundTaskNotificationToolUpdateStatus, "zcodeBackgroundTaskNotificationToolUpdateStatus");
function attachZCodeBackgroundTaskNotificationToRaw(e, t) {
  if (!t) return e;
  let r = asPlainRecord(e),
    i = asPlainRecord(r._meta),
    o = asPlainRecord(i.zcode);
  return { ...r, _meta: { ...i, zcode: { ...o, taskNotification: t } } };
}
s(attachZCodeBackgroundTaskNotificationToRaw, "attachZCodeBackgroundTaskNotificationToRaw");
function readTaskNotificationTag(e, t) {
  let i = e.match(new RegExp(`<${t}>([\\s\\S]*?)<\\/${t}>`, "u"))?.[1]?.trim();
  return i ? decodeTaskNotificationXmlText(i) : void 0;
}
s(readTaskNotificationTag, "readTaskNotificationTag");
function decodeTaskNotificationXmlText(e) {
  return e
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
s(decodeTaskNotificationXmlText, "decodeTaskNotificationXmlText");
function asPlainRecord(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e) ? e : {};
}
s(asPlainRecord, "asPlainRecord");
var eP = "model",
  tP = "model",
  nP = "mode",
  oP = "mode",
  rP = "thought_level",
  iP = "thought_level",
  Qu = [
    { id: "build", name: "Ask before changes", description: "Ask before each file changes." },
    {
      id: "edit",
      name: "Edit automatically",
      description: "Edit selected files or relevant workspace files automatically.",
    },
    {
      id: "plan",
      name: "Plan mode",
      description: "Inspect the code and present a plan before editing.",
    },
    {
      id: "yolo",
      name: "Full access",
      description: "Edit and run commands with fewer confirmations.",
    },
  ],
  aP = new Set(Qu.map((e) => e.id)),
  sP = "$";
function formatZCodeModelRef(e) {
  let t = `${e.providerId}/${e.modelId}`;
  return e.variant ? `${t}${sP}${e.variant}` : t;
}
s(formatZCodeModelRef, "formatZCodeModelRef");
function normalizeAvailableZCodeMode(e) {
  return aP.has(e) ? e : "build";
}
s(normalizeAvailableZCodeMode, "normalizeAvailableZCodeMode");
function getZCodeAgentModeSelectOptions() {
  return Qu.map((e) => ({ value: e.id, name: e.name, description: e.description }));
}
s(getZCodeAgentModeSelectOptions, "getZCodeAgentModeSelectOptions");
function getZCodeAgentAvailableModes() {
  return Qu.map((e) => ({ ...e }));
}
s(getZCodeAgentAvailableModes, "getZCodeAgentAvailableModes");
function zcodeSessionSettingsToZCodeConfigOptions(e) {
  let t = [
    {
      id: eP,
      name: "Model",
      category: tP,
      type: "select",
      currentValue: formatZCodeModelRef(e.model.current),
      options: e.model.available.map((r) => {
        let i = r.reasoning
            ? r.reasoning.enabled
              ? r.reasoning.levels.map((a) => a.value)
              : []
            : void 0,
          o =
            r.reasoning?.defaultLevel && i?.includes(r.reasoning.defaultLevel)
              ? r.reasoning.defaultLevel
              : void 0;
        return {
          value: formatZCodeModelRef(r.ref),
          name: r.label,
          description: r.description,
          modelProviderId: r.ref.providerId,
          modelProviderName: r.providerLabel ?? r.ref.providerId,
          ...(i ? { modelThoughtLevels: i } : {}),
          ...(o ? { modelDefaultThoughtLevel: o } : {}),
        };
      }),
    },
    {
      id: nP,
      name: "Mode",
      category: oP,
      type: "select",
      currentValue: normalizeAvailableZCodeMode(e.mode.current),
      options: getZCodeAgentModeSelectOptions(),
    },
  ];
  if (e.thoughtLevel.enabled) {
    let r = new Set(e.thoughtLevel.available.map((o) => o.value)),
      i =
        e.thoughtLevel.defaultLevel && r.has(e.thoughtLevel.defaultLevel)
          ? e.thoughtLevel.defaultLevel
          : void 0;
    t.push({
      id: rP,
      name: "Thought Level",
      category: iP,
      type: "select",
      currentValue: e.thoughtLevel.current ?? i ?? e.thoughtLevel.available[0]?.value ?? "",
      options: e.thoughtLevel.available.map((o) => ({
        value: o.value,
        name: o.label,
        description: o.description,
      })),
    });
  }
  return t;
}
s(zcodeSessionSettingsToZCodeConfigOptions, "zcodeSessionSettingsToZCodeConfigOptions");
function toAsciiSlug(e) {
  return (
    e
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "provider"
  );
}
s(toAsciiSlug, "toAsciiSlug");
function hash8(e) {
  let t = 2166136261;
  for (let r of e) ((t ^= r.codePointAt(0) ?? 0), (t = Math.imul(t, 16777619)));
  return (t >>> 0).toString(16).padStart(8, "0");
}
s(hash8, "hash8");
function toOpencodeProviderKey(e) {
  let t = e.trim();
  if (!t) throw new Error("providerId \u4E0D\u80FD\u4E3A\u7A7A");
  return `${toAsciiSlug(t)}-${hash8(t)}`;
}
s(toOpencodeProviderKey, "toOpencodeProviderKey");
function toOpencodeModelId(e, t) {
  let r = t.trim();
  if (!r) throw new Error("modelName \u4E0D\u80FD\u4E3A\u7A7A");
  return `${toOpencodeProviderKey(e)}/${r}`;
}
s(toOpencodeModelId, "toOpencodeModelId");
var JL = "ZCODE_AGENT_PROVIDER_NOT_READY",
  mP = "provider_not_ready";
function hasRuntimeCredential(e) {
  if (e.apiKeyRequired === !1) return !0;
  let t = e.apiKey;
  if (!t) return !1;
  switch (t.source) {
    case "inline":
      return t.value.trim().length > 0;
    case "credential":
    case "server-config":
      return t.key.trim().length > 0;
    case "env":
      return t.name.trim().length > 0;
  }
}
s(hasRuntimeCredential, "hasRuntimeCredential");
function resolveZCodeAgentStartupReadiness(e) {
  for (let t of e.providers) {
    if (!t.baseURL?.trim() || !hasRuntimeCredential(t)) continue;
    let r = t.models.find((i) => !i.disabledReason?.trim());
    if (r) return { ready: !0, providerId: t.providerId, modelId: r.modelId };
  }
  return { ready: !1, reason: mP };
}
s(resolveZCodeAgentStartupReadiness, "resolveZCodeAgentStartupReadiness");
function isZCodeAgentStartupReady(e) {
  return resolveZCodeAgentStartupReadiness(e).ready;
}
s(isZCodeAgentStartupReady, "isZCodeAgentStartupReady");
// D14/§0：ZCode 预设供应商目录清空。内核（~/.nofy/config.toml）是模型唯一真源；
// 预设（智谱 Z.ai / BigModel）是 ZCode 云端时代残留。磁盘存储里并无其条目
// （grep ~/.nofy/v2 无 bigmodel/zai）⇒ 清空目录即从界面彻底移除，无需清存储。
// 消费点仅下方两处迭代（new Map(Zh.map…)、Zh.flatMap…），空数组安全。
var Zh = [
  ],
  yP = "oauth",
  bP = new Map(Zh.map((e) => [e.id, e])),
  vP = new Map(
    Zh.flatMap((e) =>
      [e.apiKeyProviderId, e.startPlanProviderId, e.codingPlanProviderId].map((t) => [t, e.id]),
    ),
  );
function resolveModelProviderFamilyMode(e, t) {
  return t?.[e] ?? yP;
}
s(resolveModelProviderFamilyMode, "resolveModelProviderFamilyMode");
function getModelProviderFamilySpec(e) {
  return bP.get(e);
}
s(getModelProviderFamilySpec, "getModelProviderFamilySpec");
function resolveModelProviderFamilyIdByProviderId(e) {
  return vP.get(e) ?? null;
}
s(resolveModelProviderFamilyIdByProviderId, "resolveModelProviderFamilyIdByProviderId");
function normalizeProviderFamilyDomain(e) {
  return e === "zai" || e === "bigmodel" ? e : null;
}
s(normalizeProviderFamilyDomain, "normalizeProviderFamilyDomain");
var ei = "custom:";
function safeDecodeUriComponent(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}
s(safeDecodeUriComponent, "safeDecodeUriComponent");
function encodeCustomModelValue(e, t) {
  let r = encodeURIComponent(e);
  return t ? `${ei}${r}:${encodeURIComponent(t)}` : `${ei}${r}`;
}
s(encodeCustomModelValue, "encodeCustomModelValue");
function decodeCustomModelValue(e) {
  if (!e.startsWith(ei)) return null;
  let t = e.slice(ei.length),
    r = t.indexOf(":");
  if (r < 0) return { providerId: safeDecodeUriComponent(t) };
  let i = t.split(":");
  if (i.length >= 3 && i[0] === "builtin")
    return { providerId: `${i[0]}:${i[1]}`, modelName: safeDecodeUriComponent(i.slice(2).join(":")) };
  let o = t.slice(0, r),
    a = t.slice(r + 1);
  return { providerId: safeDecodeUriComponent(o), modelName: safeDecodeUriComponent(a) };
}
s(decodeCustomModelValue, "decodeCustomModelValue");
var _P = "custom:",
  xP = "ghost:",
  kP = /\/+$/,
  IP = 160;
function fnv1a32(e, t = 2166136261) {
  let r = t >>> 0;
  for (let i of e) ((r ^= i.codePointAt(0) ?? 0), (r = Math.imul(r, 16777619)), (r >>>= 0));
  return r >>> 0;
}
s(fnv1a32, "fnv1a32");
function hash12(e) {
  let t = fnv1a32(e, 2166136261).toString(16).padStart(8, "0"),
    r = fnv1a32(e, 2654435761).toString(16).padStart(8, "0");
  return `${t}${r}`.slice(0, 12);
}
s(hash12, "hash12");
function normalizeSupplierBaseUrl(e) {
  return e.trim().replace(kP, "");
}
s(normalizeSupplierBaseUrl, "normalizeSupplierBaseUrl");
function buildCustomSupplierKey(e) {
  return `${_P}${e.trim()}`;
}
s(buildCustomSupplierKey, "buildCustomSupplierKey");
function buildGhostSupplierIdentity(e) {
  let t = encodeURIComponent(e.trim() || "unknown");
  return t.length <= IP ? t : `hash=${hash12(e)}`;
}
s(buildGhostSupplierIdentity, "buildGhostSupplierIdentity");
function buildGhostSupplierKey(e, t, r) {
  return [xP, e, ":", t, ":", buildGhostSupplierIdentity(r)].join("");
}
s(buildGhostSupplierKey, "buildGhostSupplierKey");
function createAgentStateId(e) {
  return `${e.source}:${e.scope}:${e.name.trim().toLowerCase()}`;
}
s(createAgentStateId, "createAgentStateId");
var $W = "DATA_BASE_DIR_FORBIDDEN_WINDOWS_INSTALL_DIR";
var jW = n.object({ askUserQuestionAutoResolutionEnabled: n.boolean() }).strict();
function splitIntoLogicalLines(e) {
  if (!e) return [];
  let t = e.split(`
`);
  return (t[t.length - 1] === "" && t.pop(), t);
}
s(splitIntoLogicalLines, "splitIntoLogicalLines");
function computeLineChangeStat(e, t) {
  let r = splitIntoLogicalLines(e),
    i = splitIntoLogicalLines(t),
    o = 0;
  for (; o < r.length && o < i.length && r[o] === i[o];) o += 1;
  let a = r.length - 1,
    c = i.length - 1;
  for (; a >= o && c >= o && r[a] === i[c];) ((a -= 1), (c -= 1));
  let l = r.slice(o, a + 1),
    p = i.slice(o, c + 1);
  if (l.length === 0) return { added: p.length, removed: 0 };
  if (p.length === 0) return { added: 0, removed: l.length };
  if (l.length * p.length > 4e5) return { added: p.length, removed: l.length };
  let d = Array.from({ length: p.length + 1 }, () => 0);
  for (let y = 1; y <= l.length; y += 1) {
    let S = 0;
    for (let v = 1; v <= p.length; v += 1) {
      let P = d[v];
      (l[y - 1] === p[v - 1] ? (d[v] = S + 1) : (d[v] = Math.max(d[v], d[v - 1])), (S = P));
    }
  }
  let g = d[p.length] ?? 0;
  return { added: p.length - g, removed: l.length - g };
}
s(computeLineChangeStat, "computeLineChangeStat");
function zcodeCuaArgLeaf(e) {
  return (
    e
      .replace(/[\\/]+$/, "")
      .split(/[\\/]/)
      .pop() ?? e
  );
}
s(zcodeCuaArgLeaf, "zcodeCuaArgLeaf");
function matchesZCodeCuaSpec(e) {
  let t = e.replace(/_/g, "-");
  return (
    t === "zcode-cua" ||
    t.startsWith("zcode-cua[") ||
    t.startsWith("zcode-cua@") ||
    t.startsWith("zcode-cua==") ||
    t.startsWith("zcode-cua.")
  );
}
s(matchesZCodeCuaSpec, "matchesZCodeCuaSpec");
function isZCodeCuaMcpCommand(e) {
  return matchesZCodeCuaSpec(e) || matchesZCodeCuaSpec(zcodeCuaArgLeaf(e));
}
s(isZCodeCuaMcpCommand, "isZCodeCuaMcpCommand");
function isZCodeCuaMcpPackageArg(e) {
  return matchesZCodeCuaSpec(e) || matchesZCodeCuaSpec(zcodeCuaArgLeaf(e));
}
s(isZCodeCuaMcpPackageArg, "isZCodeCuaMcpPackageArg");
function ep(e, t) {
  return t === "win32" ? `${e}.exe` : e;
}
s(ep, "resolvePlatformBinaryName");
var ni = {
    bfs: {
      binaryEnvVar: "ZCODE_BFS_BINARY",
      bundledResourceDir: "bfs",
      resolveEntrySegments: s((e) => [ep("bfs", e)], "resolveEntrySegments"),
    },
    ripgrep: {
      binaryEnvVar: "ZCODE_RG_BINARY",
      bundledResourceDir: "ripgrep",
      resolveEntrySegments: s((e) => [ep("rg", e)], "resolveEntrySegments"),
    },
    ugrep: {
      binaryEnvVar: "ZCODE_UGREP_BINARY",
      bundledResourceDir: "ugrep",
      resolveEntrySegments: s((e) => [ep("ugrep", e)], "resolveEntrySegments"),
    },
  },
  PP = {
    bfs: { ...ni.bfs, versions: { linux: "v4.1.1-2" } },
    ripgrep: { ...ni.ripgrep, versions: { darwin: "v13.0.0-10", linux: "v14.1.1-1" } },
    ugrep: { ...ni.ugrep, versions: { linux: "v7.5.0-2" } },
  };
function getRemoteRuntimeToolsForPlatform(e) {
  return Object.entries(PP).flatMap(([t, r]) => {
    let i = r.versions[e];
    return i ? [{ toolId: t, runtime: r, version: i }] : [];
  });
}
s(getRemoteRuntimeToolsForPlatform, "getRemoteRuntimeToolsForPlatform");
function getRuntimeToolRuntime(e) {
  return ni[e];
}
s(getRuntimeToolRuntime, "getRuntimeToolRuntime");
function appendAssistantMessagePart(e, t) {
  let r = e ?? [],
    i = r[r.length - 1];
  return i &&
    i.type === t.type &&
    (i.type === "content" || i.type === "thought") &&
    (t.type === "content" || t.type === "thought")
    ? [...r.slice(0, -1), { ...i, content: i.content + t.content }]
    : [...r, t];
}
s(appendAssistantMessagePart, "appendAssistantMessagePart");
function getLatestAssistantContentPart(e) {
  for (let t = e.length - 1; t >= 0; t -= 1) {
    let r = e[t];
    if (r?.type === "content") return r;
  }
  return null;
}
s(getLatestAssistantContentPart, "getLatestAssistantContentPart");
function coalesceConsecutiveZCodeAssistants(e) {
  let t = [];
  for (let i of e) {
    let o = t[t.length - 1];
    if (
      i.role === "assistant" &&
      o?.role === "assistant" &&
      !o.syntheticTimeline &&
      !i.syntheticTimeline &&
      o.goalIteration === i.goalIteration
    ) {
      t[t.length - 1] = mergeAssistantPair(o, i);
      continue;
    }
    t.push(i);
  }
  let r = -1;
  return t.map((i) => {
    i.role === "user" && (r += 1);
    let o = r < 0 ? 0 : r;
    return i.turnIndex === o ? i : { ...i, turnIndex: o };
  });
}
s(coalesceConsecutiveZCodeAssistants, "coalesceConsecutiveZCodeAssistants");
function mergeAssistantPair(e, t) {
  let r = e.tools ?? [],
    i = t.tools ?? [],
    o = r.length + i.length > 0 ? [...r, ...i] : void 0,
    a = r.length,
    c = e.parts ?? [],
    l = (t.parts ?? []).map((P) =>
      P.type === "tool-call" ? { type: "tool-call", toolIndex: P.toolIndex + a } : P,
    ),
    p = c.length + l.length > 0 ? [...c, ...l] : void 0,
    d = e.content + t.content,
    g =
      e.thought === void 0 && t.thought === void 0 ? void 0 : (e.thought ?? "") + (t.thought ?? ""),
    y =
      e.durationMs === void 0 || t.durationMs === void 0
        ? void 0
        : Math.max(t.timestamp + t.durationMs - e.timestamp, 0),
    S = e.characterCount === void 0 && t.characterCount === void 0 ? void 0 : d.length,
    v = collectMergedMessageIds(e, t);
  return {
    ...e,
    content: d,
    timestamp: e.timestamp,
    model: t.model ?? e.model,
    durationMs: y,
    characterCount: S,
    interrupted: t.interrupted ?? e.interrupted,
    feedback: t.feedback ?? e.feedback,
    mergedMessageIds: v.length > 0 ? v : void 0,
    goalIteration: t.goalIteration ?? e.goalIteration,
    attachments: t.attachments ?? e.attachments,
    tools: o,
    thought: g,
    parts: p,
    checkpointState: t.checkpointState ?? e.checkpointState,
    checkpointReason: t.checkpointReason ?? e.checkpointReason,
    checkpointUpdatedAt: t.checkpointUpdatedAt ?? e.checkpointUpdatedAt,
    bodyRefs: t.bodyRefs ?? e.bodyRefs,
    toolSlice: t.toolSlice ?? e.toolSlice,
  };
}
s(mergeAssistantPair, "mergeAssistantPair");
function collectMergedMessageIds(e, t) {
  let r = [e.id, ...(e.mergedMessageIds ?? []), t.id, ...(t.mergedMessageIds ?? [])].filter(
    (i) => !!i,
  );
  return [...new Set(r)];
}
s(collectMergedMessageIds, "collectMergedMessageIds");
function buildFallbackAssistantParts({ content: e, thought: t, toolCalls: r }) {
  let i = (r ?? []).filter((o) => {
    let a = o.parentToolUseId ?? null;
    return !a || a === o.toolId || !(r ?? []).some((c) => c.toolId === a);
  });
  return [
    ...(t ? [{ type: "thought", content: t }] : []),
    ...i.map((o) => ({ type: "tool-call", toolId: o.toolId })),
    ...(e ? [{ type: "content", content: e }] : []),
  ];
}
s(buildFallbackAssistantParts, "buildFallbackAssistantParts");
function buildZCodeAssistantPresentation({
  content: e,
  thought: t,
  toolCalls: r = [],
  parts: i,
  streaming: o = !1,
  interrupted: a = !1,
  settling: c = !1,
}) {
  let l = i && i.length > 0 ? [...i] : buildFallbackAssistantParts({ content: e, thought: t, toolCalls: r }),
    p = new Map(r.map((P) => [P.toolId, P])),
    d = new Set(),
    g = [];
  for (let P of l) {
    if (P.type === "content") {
      g.push({ type: "content", content: P.content });
      continue;
    }
    if (P.type === "thought") {
      g.push({ type: "thought", content: P.content });
      continue;
    }
    let w = p.get(P.toolId);
    if (!w || d.has(P.toolId)) continue;
    let G = w.parentToolUseId ?? null;
    (G && G !== w.toolId && p.has(G)) ||
      (d.add(P.toolId), g.push({ type: "tool-call", toolCall: w }));
  }
  let y =
      o || a || c
        ? null
        : getLatestAssistantContentPart(
            g
              .filter((P) => P.type === "content")
              .map((P) => ({ type: "content", content: P.content })),
          ),
    S = null,
    v = -1;
  return (
    y &&
      ((v = g.findLastIndex((P) => P.type === "content" && P.content === y.content)),
      (S = v >= 0 ? g[v] : null)),
    { messageParts: l, blocks: g, latestPart: S, historyBlocks: g.filter((P, w) => w !== v) }
  );
}
s(buildZCodeAssistantPresentation, "buildZCodeAssistantPresentation");
function isRecord(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
s(isRecord, "isRecord");
function normalizeDisplayText(e) {
  return e.trim().replace(/\s+/g, " ");
}
s(normalizeDisplayText, "normalizeDisplayText");
function countLines(e) {
  if (e.length === 0) return 0;
  let t = 1;
  for (let r = 0; r < e.length; r++) e.charCodeAt(r) === 10 && t++;
  return (e.charCodeAt(e.length - 1) === 10 && t--, t);
}
s(countLines, "countLines");
function readFirstStringField(e, t) {
  for (let r of t) {
    let i = e[r];
    if (typeof i == "string") return i;
  }
}
s(readFirstStringField, "readFirstStringField");
function extractBeforeAfterText(e) {
  if (!isRecord(e)) return null;
  let t = readFirstStringField(e, ["old_string", "oldString", "oldText", "before"]),
    r = readFirstStringField(e, ["new_string", "newString", "newText", "after", "content"]);
  if (t !== void 0 && r !== void 0) return { before: t, after: r };
  let i = e.metadata;
  if (isRecord(i)) {
    let a = i.filediff;
    if (isRecord(a)) {
      let c = readFirstStringField(a, ["old_string", "oldString", "oldText", "before"]),
        l = readFirstStringField(a, ["new_string", "newString", "newText", "after", "content"]);
      if (c !== void 0 && l !== void 0) return { before: c, after: l };
    }
  }
  let o = e.content;
  if (Array.isArray(o))
    for (let a of o) {
      if (!isRecord(a)) continue;
      let c = readFirstStringField(a, ["old_string", "oldString", "oldText", "before"]),
        l = readFirstStringField(a, ["new_string", "newString", "newText", "after", "content"]);
      if (c !== void 0 && l !== void 0) return { before: c, after: l };
    }
  return null;
}
s(extractBeforeAfterText, "extractBeforeAfterText");
function getChangeStat(e, t, r, i) {
  if (!/(edit|patch|replace|multi.?edit)/i.test(e)) return;
  let o = extractBeforeAfterText(t) ?? extractBeforeAfterText(r) ?? extractBeforeAfterText(i);
  if (!o) return;
  let a = countLines(o.before),
    c = countLines(o.after);
  if (!(c === 0 && a === 0)) return { added: c, removed: a };
}
s(getChangeStat, "getChangeStat");
function getInputSummary(e) {
  if (typeof e == "string") {
    let t = normalizeDisplayText(e);
    return t.length > 0 ? t : void 0;
  }
  if (isRecord(e))
    for (let t of ["command", "path", "file_path", "filePath", "prompt"]) {
      let r = e[t];
      if (typeof r != "string") continue;
      let i = normalizeDisplayText(r);
      if (i.length > 0) return i;
    }
}
s(getInputSummary, "getInputSummary");
function getCompactToolCallSummary({ title: e, kind: t, input: r, output: i, raw: o }) {
  let a = getChangeStat(t, r, i, o),
    c = (e && normalizeDisplayText(e)) || "tool",
    l = getInputSummary(r);
  return { primaryText: c, secondaryText: l, changeStat: a };
}
s(getCompactToolCallSummary, "getCompactToolCallSummary");
var zP = [
  "Read",
  "Write",
  "Edit",
  "ApplyPatch",
  "Bash",
  "Glob",
  "Grep",
  "WebFetch",
  "WebSearch",
  "web_search",
  "TodoRead",
  "TodoWrite",
  "GoalRead",
  "ReadSessionContext",
  "AskUserQuestion",
  "SendMessage",
  "RespondToCoordinator",
  "TaskOutput",
  "TaskStop",
  "js",
  "js_reset",
  "js_add_node_module_dir",
  "mcp__node_repl__js",
  "mcp__node_repl__js_reset",
  "mcp__node_repl__js_add_node_module_dir",
  "Agent",
  "Task",
  "Skill",
];
var PF = new Map(zP.map((e) => [e.toLowerCase(), e]));
var MP = [
  "file_path",
  "filePath",
  "path",
  "target_path",
  "targetPath",
  "filename",
  "file",
  "content",
  "new_string",
  "newString",
  "new_text",
  "newText",
  "old_string",
  "oldString",
  "old_text",
  "oldText",
  "command",
  "description",
  "title",
  "pattern",
  "replacement",
  "plan",
];
function appendZCodeStreamingToolInputDelta(e, t) {
  return { ...e, deltaCount: (e?.deltaCount ?? 0) + 1, rawInput: `${e?.rawInput ?? ""}${t}` };
}
s(appendZCodeStreamingToolInputDelta, "appendZCodeStreamingToolInputDelta");
function buildZCodeStreamingToolInputPreview(e, t) {
  if (t !== void 0) return { complete: !0, input: t, rawInput: e };
  let r = parseCompleteJson(e);
  return r.ok
    ? { complete: !0, input: r.value, rawInput: e }
    : { complete: !1, input: readPartialJsonObjectPreview(e) ?? {}, rawInput: e };
}
s(buildZCodeStreamingToolInputPreview, "buildZCodeStreamingToolInputPreview");
function shouldMaterializeZCodeStreamingToolInputPreview(e, t = {}) {
  if (t.mode === "background-summary") return !1;
  if ((e.deltaCount ?? 0) <= 1) return !0;
  let i = e.lastPreviewAt ?? 0;
  if (isZCodeFileStreamingToolInputPreviewTool(t.toolName)) return (t.now ?? Date.now()) - i >= 1e3;
  let o = e.lastPreviewRawInputLength ?? 0;
  return e.rawInput.length - o >= 8192
    ? !0
    : (t.now ?? Date.now()) - i >= 750
      ? e.rawInput.length <= 8192
      : !1;
}
s(shouldMaterializeZCodeStreamingToolInputPreview, "shouldMaterializeZCodeStreamingToolInputPreview");
function isZCodeFileStreamingToolInputPreviewTool(e) {
  let t = e?.trim().toLowerCase();
  return t === "write" || t === "edit";
}
s(isZCodeFileStreamingToolInputPreviewTool, "isZCodeFileStreamingToolInputPreviewTool");
function markZCodeStreamingToolInputPreviewMaterialized(e, t = Date.now()) {
  ((e.lastPreviewAt = t), (e.lastPreviewRawInputLength = e.rawInput.length));
}
s(markZCodeStreamingToolInputPreviewMaterialized, "markZCodeStreamingToolInputPreviewMaterialized");
function parseCompleteJson(e) {
  try {
    return { ok: !0, value: JSON.parse(e) };
  } catch {
    return { ok: !1 };
  }
}
s(parseCompleteJson, "parseCompleteJson");
function readPartialJsonObjectPreview(e) {
  let t = {};
  for (let r of MP) {
    let i = readPartialJsonStringField(e, r);
    i !== void 0 && (t[r] = i);
  }
  return Object.keys(t).length > 0 ? t : null;
}
s(readPartialJsonObjectPreview, "readPartialJsonObjectPreview");
function readPartialJsonStringField(e, t) {
  let r = new RegExp(`"${escapeRegExp(t)}"\\s*:\\s*"`).exec(e);
  if (!r) return;
  let i = "",
    o = !1,
    a = !1;
  for (let c = r.index + r[0].length; c < e.length; c += 1) {
    let l = e[c] ?? "";
    if (o) {
      ((i += `\\${l}`), (o = !1));
      continue;
    }
    if (l === "\\") {
      o = !0;
      continue;
    }
    if (l === '"') {
      a = !0;
      break;
    }
    i += l;
  }
  return (o && (i += "\\"), decodeJsonStringSegment(i, a));
}
s(readPartialJsonStringField, "readPartialJsonStringField");
function decodeJsonStringSegment(e, t) {
  let r = t ? e : trimDanglingJsonEscape(e);
  try {
    return JSON.parse(`"${r}"`);
  } catch {
    return decodeJsonStringSegmentBestEffort(r);
  }
}
s(decodeJsonStringSegment, "decodeJsonStringSegment");
function trimDanglingJsonEscape(e) {
  return e.replace(/\\u[0-9a-fA-F]{0,3}$/, "").replace(/\\$/, "");
}
s(trimDanglingJsonEscape, "trimDanglingJsonEscape");
function decodeJsonStringSegmentBestEffort(e) {
  return e
    .replace(
      /\\n/g,
      `
`,
    )
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "	")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}
s(decodeJsonStringSegmentBestEffort, "decodeJsonStringSegmentBestEffort");
function escapeRegExp(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
s(escapeRegExp, "escapeRegExp");
var WP = /(?:^|[_\s-])(?:todo[_\s-]*(?:read|write)|update[_\s-]*plan)(?:$|[_\s-])/i,
  FP = ["todos", "plan", "steps", "items"];
function Qt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
s(Qt, "isRecord");
function readString(e) {
  return typeof e == "string" && e.trim().length > 0 ? e.trim() : void 0;
}
s(readString, "readString");
function normalizePlanStatus(e) {
  let t = readString(e)?.replace(/-/g, "_").toLowerCase();
  return t === "pending" || t === "in_progress" || t === "completed" ? t : null;
}
s(normalizePlanStatus, "normalizePlanStatus");
function parsePlanStep(e, t) {
  if (typeof e == "string") {
    let o = e.trim();
    return o ? { id: o, title: o, status: t === 0 ? "in_progress" : "pending" } : null;
  }
  if (!Qt(e)) return null;
  let r = readString(e.content) ?? readString(e.step) ?? readString(e.title) ?? readString(e.text) ?? readString(e.activeForm),
    i = normalizePlanStatus(e.status);
  return !r || !i ? null : { id: readString(e.id) ?? r, title: r, status: i };
}
s(parsePlanStep, "parsePlanStep");
function parseJsonValue(e) {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}
s(parseJsonValue, "parseJsonValue");
function readPlanCollection(e) {
  let t = typeof e == "string" ? parseJsonValue(e) : e;
  if (!Qt(t)) return null;
  for (let r of FP) {
    let i = t[r];
    if (Array.isArray(i)) return i;
  }
  return null;
}
s(readPlanCollection, "readPlanCollection");
function extractPlanStepsFromValue(e) {
  let t = readPlanCollection(e);
  if (!t || t.length === 0) return null;
  let r = t.map((i, o) => parsePlanStep(i, o)).filter((i) => i !== null);
  return r.length === t.length ? r : null;
}
s(extractPlanStepsFromValue, "extractPlanStepsFromValue");
function collectOutputCandidates(e) {
  let t = [e],
    r = typeof e == "string" ? parseJsonValue(e) : void 0;
  if ((r !== void 0 && t.push(r), Qt(e)))
    for (let i of ["content", "output", "result"]) {
      let o = e[i];
      if ((t.push(o), typeof o == "string")) {
        let a = parseJsonValue(o);
        a !== void 0 && t.push(a);
      }
    }
  return t;
}
s(collectOutputCandidates, "collectOutputCandidates");
function isTodoPlanToolName(e) {
  return typeof e == "string" && WP.test(e.trim());
}
s(isTodoPlanToolName, "isTodoPlanToolName");
function readClaudeParentToolUseId(e) {
  let t = e._meta;
  if (!Qt(t)) return;
  let r = t.claudeCode;
  if (Qt(r)) return readString(r.parentToolUseId);
}
s(readClaudeParentToolUseId, "readClaudeParentToolUseId");
function isMainAgentToolProjectionSource(...e) {
  for (let t of e)
    if (
      Qt(t) &&
      (readString(t.source) === "subagent" || readString(t.parentToolCallId) || readString(t.parentToolUseId) || readClaudeParentToolUseId(t))
    )
      return !1;
  return !0;
}
s(isMainAgentToolProjectionSource, "isMainAgentToolProjectionSource");
function extractPlanStepsFromToolInput(e) {
  let t = [e.title, e.kind].filter(Boolean).join(" ");
  return isTodoPlanToolName(t) ? extractPlanStepsFromValue(e.input) : null;
}
s(extractPlanStepsFromToolInput, "extractPlanStepsFromToolInput");
function extractPlanStepsFromToolOutput(e) {
  let t = [e.title, e.kind].filter(Boolean).join(" ");
  if (!isTodoPlanToolName(t)) return null;
  for (let r of collectOutputCandidates(e.output)) {
    let i = extractPlanStepsFromValue(r);
    if (i) return i;
  }
  return null;
}
s(extractPlanStepsFromToolOutput, "extractPlanStepsFromToolOutput");
var JP = new Set(["command", "cmd", "script", "shellcommand"]),
  YP = new Set(["args", "argv", "arguments"]),
  XP = new Set([
    "path",
    "paths",
    "file",
    "file_path",
    "filepath",
    "files",
    "filename",
    "filenames",
    "target",
    "targets",
    "location",
    "locations",
  ]),
  QP = new Set(["cwd", "directory", "workingdirectory"]),
  Ve = 6;
function Ce(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
s(Ce, "isRecord");
function normalizeInlineText(e) {
  return e.trim().replace(/\s+/g, " ");
}
s(normalizeInlineText, "normalizeInlineText");
function normalizeBlockText(e) {
  return e.trim().replace(
    /\r\n/g,
    `
`,
  );
}
s(normalizeBlockText, "normalizeBlockText");
function getStringArray(e) {
  return Array.isArray(e)
    ? e
        .map((t) =>
          typeof t == "string"
            ? t.trim()
            : typeof t == "number" || typeof t == "boolean" || typeof t == "bigint"
              ? String(t)
              : "",
        )
        .filter((t) => t.length > 0)
    : [];
}
s(getStringArray, "getStringArray");
function readPermissionInputSource(e) {
  return Ce(e)
    ? "rawInput" in e && e.rawInput !== void 0
      ? e.rawInput
      : "input" in e
        ? e.input
        : e
    : e;
}
s(readPermissionInputSource, "readPermissionInputSource");
function getCommandFromRecord(e) {
  for (let [t, r] of Object.entries(e)) {
    if (!JP.has(t.toLowerCase()) || typeof r != "string") continue;
    let i = normalizeBlockText(r);
    if (i.length !== 0) {
      for (let [o, a] of Object.entries(e)) {
        if (!YP.has(o.toLowerCase())) continue;
        let c = getStringArray(a);
        if (c.length > 0) return `${i} ${c.join(" ")}`;
      }
      return i;
    }
  }
  return null;
}
s(getCommandFromRecord, "getCommandFromRecord");
function findFirstCommand(e, t = new Set(), r = !1) {
  if (typeof e == "string") {
    if (!r) return null;
    let o = normalizeBlockText(e);
    return o.length > 0 ? o : null;
  }
  if (Array.isArray(e)) {
    if (t.has(e)) return null;
    t.add(e);
    for (let o of e) {
      let a = findFirstCommand(o, t);
      if (a) return a;
    }
    return null;
  }
  if (!Ce(e) || t.has(e)) return null;
  t.add(e);
  let i = getCommandFromRecord(e);
  if (i) return i;
  for (let o of ["rawInput", "input", "params", "toolCall"]) {
    if (!(o in e)) continue;
    let a = findFirstCommand(e[o], t, o === "rawInput" || o === "input" || o === "params");
    if (a) return a;
  }
  for (let o of Object.values(e)) {
    if (!Array.isArray(o) && !Ce(o)) continue;
    let a = findFirstCommand(o, t);
    if (a) return a;
  }
  return null;
}
s(findFirstCommand, "findFirstCommand");
function pushUniquePath(e, t) {
  let r = normalizeInlineText(t);
  !r || e.includes(r) || e.push(r);
}
s(pushUniquePath, "pushUniquePath");
function extractPathsFromCandidate(e, t, r) {
  if (!(t.length >= Ve)) {
    if (typeof e == "string") {
      pushUniquePath(t, e);
      return;
    }
    if (Array.isArray(e)) {
      if (r.has(e)) return;
      r.add(e);
      for (let i of e) if ((extractPathsFromCandidate(i, t, r), t.length >= Ve)) return;
      return;
    }
    if (
      !(!Ce(e) || r.has(e)) &&
      (r.add(e), !(typeof e.path == "string" && (pushUniquePath(t, e.path), t.length >= Ve)))
    ) {
      for (let i of Object.values(e)) if ((extractPathsFromCandidate(i, t, r), t.length >= Ve)) return;
    }
  }
}
s(extractPathsFromCandidate, "extractPathsFromCandidate");
function collectFilePaths(e, t, r = new Set()) {
  if (!(t.length >= Ve)) {
    if (Array.isArray(e)) {
      if (r.has(e)) return;
      r.add(e);
      for (let i of e) if ((collectFilePaths(i, t, r), t.length >= Ve)) return;
      return;
    }
    if (!(!Ce(e) || r.has(e))) {
      r.add(e);
      for (let [i, o] of Object.entries(e)) {
        let a = i.toLowerCase();
        if (!QP.has(a)) {
          if (XP.has(a)) {
            if ((extractPathsFromCandidate(o, t, r), t.length >= Ve)) return;
            continue;
          }
          if (!(!Array.isArray(o) && !Ce(o)) && (collectFilePaths(o, t, r), t.length >= Ve)) return;
        }
      }
    }
  }
}
s(collectFilePaths, "collectFilePaths");
function collectFileChanges(e, t, r = new Set()) {
  if (Array.isArray(e)) {
    if (r.has(e)) return;
    r.add(e);
    for (let i of e) collectFileChanges(i, t, r);
    return;
  }
  if (!(!Ce(e) || r.has(e))) {
    if ((r.add(e), Ce(e.changes)))
      for (let [i, o] of Object.entries(e.changes))
        Ce(o) &&
          ((o.type !== "add" && o.type !== "update") ||
            t.some((a) => a.path === i && a.type === o.type) ||
            t.push({ path: i, type: o.type }));
    for (let i of Object.values(e)) (!Array.isArray(i) && !Ce(i)) || collectFileChanges(i, t, r);
  }
}
s(collectFileChanges, "collectFileChanges");
function getPermissionRequestPreview(e) {
  let t = e.raw,
    r = [];
  collectFilePaths(t, r);
  let i = normalizeInlineText(e.title ?? e.description ?? e.kind) || "permission",
    o = findFirstCommand(readPermissionInputSource(t), new Set(), !0),
    a = [];
  collectFileChanges(t, a);
  let c = a.length === 1 ? a[0] : null,
    l = o ? "command" : r.length > 0 ? "file" : "generic";
  return { title: i, command: o, filePaths: r, scope: l, fileChange: c, fileChanges: a };
}
s(getPermissionRequestPreview, "getPermissionRequestPreview");
var XF = "coding_plan_security_verification_required",
  QF = "coding_plan_system_busy";
function resolveRuntimeEnv(e) {
  return e || (typeof process < "u" ? process.env : {});
}
s(resolveRuntimeEnv, "resolveRuntimeEnv");
function isTruthyEnvFlag(e) {
  if (!e) return !1;
  let t = e.trim().toLowerCase();
  return t === "1" || t === "true";
}
s(isTruthyEnvFlag, "isTruthyEnvFlag");
function normalizeEffectiveEnv(e) {
  let t = e?.trim().toLowerCase();
  return t === "test" || t === "production" ? t : void 0;
}
s(normalizeEffectiveEnv, "normalizeEffectiveEnv");
function normalizeNetworkEnv(e) {
  let t = e?.trim().toLowerCase();
  return t === "auto" || t === "intranet" || t === "internet" ? t : void 0;
}
s(normalizeNetworkEnv, "normalizeNetworkEnv");
function resolveInternalOnlyFeatureRuntimeOverrides(e) {
  let t = resolveRuntimeEnv(e),
    r = normalizeEffectiveEnv(t.ZCODE_EFFECTIVE_ENV),
    i = normalizeNetworkEnv(t.ZCODE_NETWORK_ENV);
  return r || i
    ? { effectiveEnv: r, networkEnv: i ?? "auto" }
    : isTruthyEnvFlag(t.ZCODE_SIMULATE_PUBLIC_PROD)
      ? { effectiveEnv: "production", networkEnv: "internet" }
      : { effectiveEnv: void 0, networkEnv: "auto" };
}
s(resolveInternalOnlyFeatureRuntimeOverrides, "resolveInternalOnlyFeatureRuntimeOverrides");
function resolveInternalOnlyFeatureGateState(e) {
  let t = resolveInternalOnlyFeatureRuntimeOverrides(e.env),
    r = t.effectiveEnv ?? e.rawEnv,
    i = t.networkEnv === "intranet" ? !0 : t.networkEnv === "internet" ? !1 : e.probedIsIntranet;
  return { env: r, isIntranet: i, shouldProbe: r === "production" && t.networkEnv === "auto" };
}
s(resolveInternalOnlyFeatureGateState, "resolveInternalOnlyFeatureGateState");
var Hn = "desktop", // nofy：v2 目录废除
  cT = "v1",
  Jh = "v1";
function repoSnapshotSchema(e, t) {
  return `repo_snapshot_${e}/${t}`;
}
s(repoSnapshotSchema, "repoSnapshotSchema");
var g4 = repoSnapshotSchema("manifest", Hn),
  f4 = repoSnapshotSchema("prompt", Hn),
  h4 = repoSnapshotSchema("delta", Hn),
  y4 = repoSnapshotSchema("encrypted_artifact", Hn),
  b4 = repoSnapshotSchema("encryption_aad", Hn),
  v4 = repoSnapshotSchema("manifest_hash", cT),
  S4 = repoSnapshotSchema("upload_key", Jh),
  _4 = repoSnapshotSchema("upload_target", Jh);
function buildRepoSnapshotWorkspaceKey(e) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}
s(buildRepoSnapshotWorkspaceKey, "buildRepoSnapshotWorkspaceKey");
function hostnameFromBaseUrl(e) {
  let t = e?.trim();
  if (!t) return null;
  try {
    return new URL(t).hostname.toLowerCase();
  } catch {
    return null;
  }
}
s(hostnameFromBaseUrl, "hostnameFromBaseUrl");
function resolveRepoSnapshotPromptProvider(e) {
  let t = e.providerId?.trim();
  if (t === D.bigmodel || t === D.bigmodelCodingPlan || t === D.bigmodelStartPlan)
    return "bigmodel";
  if (t === D.zai || t === D.zaiCodingPlan || t === D.zaiStartPlan) return "z.ai";
  let r = hostnameFromBaseUrl(e.baseURL);
  return r
    ? r === "bigmodel.cn" || r.endsWith(".bigmodel.cn")
      ? "bigmodel"
      : r === "z.ai" || r.endsWith(".z.ai")
        ? "z.ai"
        : "others"
    : "others";
}
s(resolveRepoSnapshotPromptProvider, "resolveRepoSnapshotPromptProvider");
function buildRepoWikiWorkspaceKey(e) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}
s(buildRepoWikiWorkspaceKey, "buildRepoWikiWorkspaceKey");
var dT = { "X-OpenRouter-Title": "ZCode", "X-OpenRouter-Categories": "programming-app" };
function isOpenRouterBaseUrl(e) {
  let t = e?.trim();
  if (!t) return !1;
  try {
    let r = new URL(t),
      i = r.hostname.toLowerCase();
    return r.protocol === "https:" && (i === "openrouter.ai" || i.endsWith(".openrouter.ai"));
  } catch {
    return !1;
  }
}
s(isOpenRouterBaseUrl, "isOpenRouterBaseUrl");
function withOpenRouterAttributionHeaders(e, t) {
  return isOpenRouterBaseUrl(t) ? { ...e, ...dT } : e;
}
s(withOpenRouterAttributionHeaders, "withOpenRouterAttributionHeaders");
var N4 = "SKILL.md",
  pT = new Set([
    "node_modules",
    "dist",
    "build",
    "out",
    "target",
    "vendor",
    "coverage",
    ".cache",
    ".next",
    ".turbo",
    ".venv",
    "__pycache__",
  ]),
  Z4 = 8,
  mT = new Set([".system"]);
function shouldWalkSkillDirectoryEntry(e) {
  return pT.has(e) ? !1 : e.startsWith(".") ? mT.has(e) : !0;
}
s(shouldWalkSkillDirectoryEntry, "shouldWalkSkillDirectoryEntry");
var Yh = n.object({
    id: n.string().uuid(),
    runtimeScope: n.enum(["main", "subagent"]),
    token: n.string().min(32),
    sessionId: n.string().trim().min(1),
    turnId: n.string().trim().min(1).optional(),
    trace: n
      .object({
        traceId: n.string().trim().min(1),
        spanId: n.string().trim().min(1).optional(),
        parentSpanId: n.string().trim().min(1).optional(),
      })
      .strict()
      .optional(),
  }),
  K4 = n.discriminatedUnion("op", [
    Yh.extend({ op: n.literal("list") }).strict(),
    Yh.extend({
      op: n.literal("execute"),
      browserId: n.string().trim().min(1),
      browserGeneration: n.number().int().nonnegative(),
      command: Wt,
    }).strict(),
  ]),
  H4 = n.discriminatedUnion("ok", [
    n
      .object({
        id: n.string().uuid(),
        ok: n.literal(!0),
        browsers: n.array(pu).optional(),
        result: Ft.optional(),
      })
      .strict(),
    n.object({ id: n.string().uuid(), ok: n.literal(!1), error: n.string().min(1) }).strict(),
  ]);
function quotePosixShellArg(e) {
  return `'${e.replaceAll("'", `'"'"'`)}'`;
}
s(quotePosixShellArg, "quotePosixShellArg");
function buildPosixShellExecCommand(e) {
  return `/bin/sh -c ${quotePosixShellArg(e)}`;
}
s(buildPosixShellExecCommand, "buildPosixShellExecCommand");
function quotePosixPathArg(e) {
  return e === "~" ? '"$HOME"' : e.startsWith("~/") ? `"$HOME"${quotePosixShellArg(e.slice(1))}` : quotePosixShellArg(e);
}
s(quotePosixPathArg, "quotePosixPathArg");
function resolvePosixHomePath(e, t) {
  return e === "~" ? t : e.startsWith("~/") ? `${t.replace(/\/$/, "")}/${e.slice(2)}` : e;
}
s(resolvePosixHomePath, "resolvePosixHomePath");
function buildWriteLiteralFileCommand(e, t) {
  return `printf %s ${quotePosixShellArg(t)} > ${quotePosixPathArg(e)}`;
}
s(buildWriteLiteralFileCommand, "buildWriteLiteralFileCommand");
export {
  ey as a,
  ty as b,
  ny as c,
  oy as d,
  ry as e,
  lj as f,
  n as g,
  Ft as h,
  normalizeRemoteResourcePackageSelection as i,
  NM as j,
  fu as k,
  FS as l,
  qS as m,
  BM as n,
  normalizeAgentProviderToZCodeAgent as o,
  Nt as p,
  nt as q,
  oS as r,
  aS as s,
  textFromZCodeMessageParts as t,
  hu as u,
  isFeishuBotProvider as v,
  YM as w,
  XM as x,
  QM as y,
  e$ as z,
  t$ as A,
  n$ as B,
  o$ as C,
  n_ as D,
  getSupportedBotReplyGranularities as E,
  normalizeBotReplyGranularity as F,
  Zn as G,
  normalizeZCodeEndpointOrigin as H,
  resolveRuntimeZCodeEnv as I,
  resolveRuntimeZCodeEndpointOrigin as J,
  buildRuntimeZCodeEndpointUrls as K,
  buildRuntimeZCodeApiUrl as L,
  resolveBigModelApiOrigin as M,
  buildBigModelApiUrl as N,
  resolveZaiBusinessBaseUrl as O,
  resolveZaiOAuthClientId as P,
  buildRuntimeZaiOAuthUrl as Q,
  buildRuntimeZaiBusinessUrl as R,
  rewriteZCodeEndpointUrl as S,
  O_ as T,
  A_ as U,
  qt as V,
  D as W,
  isZaiCodingPlanProviderId as X,
  isBigModelStartPlanProviderId as Y,
  isStartPlanModelProviderId as Z,
  isCodingPlanModelProviderId as _,
  N$ as $,
  Z$ as aa,
  stripModelProviderReasoningPatches as ba,
  lf as ca,
  it as da,
  D_ as ea,
  N_ as fa,
  B_ as ga,
  pf as ha,
  mf as ia,
  W_ as ja,
  q_ as ka,
  G_ as la,
  K_ as ma,
  B$ as na,
  stripLegacyClaudeProviderMappings as oa,
  isModelProviderEnabled as pa,
  shouldIncludeModelProviderInZCodeAgentRegistry as qa,
  J_ as ra,
  Y_ as sa,
  resolveModelProviderContextWindow as ta,
  isModelProviderModelConfig as ua,
  getModelProviderModelIds as va,
  mapModelProviderSupportedFormatToKind as wa,
  createModelProviderModelConfig as xa,
  resolveModelProviderDefaultKind as ya,
  resolveModelProviderKindApiFormat as za,
  mapModelProviderApiFormatToKind as Aa,
  getDefaultModelProviderEndpointPathForKind as Ba,
  normalizeModelProviderBaseUrlForKind as Ca,
  normalizeModelProviderConfiguredBaseUrl as Da,
  resolveModelProviderRuntimeBaseUrl as Ea,
  getModelProviderEndpointKinds as Fa,
  migrateLegacyModelProviderConfig as Ga,
  migrateLegacyModelProviderListToStoreFile as Ha,
  getDefaultModelSupportedFormatsFromEndpoints as Ia,
  getDefaultModelSupportedFormatsFromApiFormat as Ja,
  resolveModelProviderApiFormat as Ka,
  resolveModelSupportedFormatsForModel as La,
  dx as Ma,
  ux as Na,
  fD as Oa,
  hD as Pa,
  If as Qa,
  Du as Ra,
  Ix as Sa,
  Oe as Ta,
  yD as Ua,
  convertModelProviderConfigToZCodeProviderInput as Va,
  Uf as Wa,
  Vr as Xa,
  Bf as Ya,
  SD as Za,
  _D as _a,
  xD as $a,
  ID as ab,
  CD as bb,
  RD as cb,
  kk as db,
  UD as eb,
  ND as fb,
  Ck as gb,
  ZD as hb,
  Pk as ib,
  BD as jb,
  qD as kb,
  GD as lb,
  nU as mb,
  iU as nb,
  sU as ob,
  lU as pb,
  fU as qb,
  Mk as rb,
  Dk as sb,
  hU as tb,
  bU as ub,
  _U as vb,
  kU as wb,
  CU as xb,
  PU as yb,
  OU as zb,
  MU as Ab,
  DU as Bb,
  UU as Cb,
  jU as Db,
  LU as Eb,
  FU as Fb,
  VU as Gb,
  GU as Hb,
  HU as Ib,
  YU as Jb,
  QU as Kb,
  tN as Lb,
  Au as Mb,
  oN as Nb,
  dN as Ob,
  uN as Pb,
  pN as Qb,
  mN as Rb,
  Wn as Sb,
  Vk as Tb,
  crc32WireBytes as Ub,
  decodeWireBase64 as Vb,
  Gt as Wb,
  resolveWorkspaceKey as Xb,
  formatZodError as Yb,
  GN as Zb,
  KN as _b,
  HN as $b,
  JN as ac,
  aI as bc,
  rh as cc,
  xI as dc,
  kI as ec,
  II as fc,
  nZ as gc,
  _C as hc,
  sZ as ic,
  Sh as jc,
  isRemoteWorkspaceIdentity as kc,
  normalizeZCodeApiRetryStatus as lc,
  zcodeApiRetryFromModelNetworkStatusPayload as mc,
  isZCodeModelRetryRecoveryProgressPayload as nc,
  zcodeApiRetryFromStreamRecoveryPayload as oc,
  zcodeTaskNetworkDebugStatusFromPayload as pc,
  isZCodeGoalContinuationReminderText as qc,
  isZCodeModelOnlySyntheticUserMessage as rc,
  getZCodeUserVisibleMessages as sc,
  getZCodeGoalIterationByAssistantMessageId as tc,
  getZCodeGoalActiveIterationCount as uc,
  resolveZCodeVisibleSessionTitle as vc,
  deriveZCodeTaskStatusFromSessionSnapshot as wc,
  createZCodeToolProjectionMemory as xc,
  resolveZCodeToolProjectionMetadata as yc,
  finalizeZCodeToolProjectionInput as zc,
  forgetZCodeToolProjectionMetadata as Ac,
  PR as Bc,
  normalizeZCodeSourceHeaderValue as Cc,
  buildZCodeSourceHeadersFromContext as Dc,
  aB as Ec,
  PC as Fc,
  gZ as Gc,
  fZ as Hc,
  hZ as Ic,
  resolveZCodeRuntimeEnv as Jc,
  getCapturedZCodeAgentTelemetryEnv as Kc,
  sanitizeZCodeRuntimeEnv as Lc,
  buildZCodeToolEnvPassthroughEnv as Mc,
  sanitizeZCodeRuntimeEnvInPlace as Nc,
  dB as Oc,
  shouldUseProviderRegistrySourceForAuthorityMode as Pc,
  hB as Qc,
  yB as Rc,
  CZ as Sc,
  RZ as Tc,
  PZ as Uc,
  TZ as Vc,
  Ah as Wc,
  AR as Xc,
  zR as Yc,
  isCredentialDecryptError as Zc,
  resolveJwtExpiration as _c,
  parseBigModelTeamPlanConnectionKey as $c,
  resolveSafeTelemetryHostname as ad,
  createUuid as bd,
  generateTraceId as cd,
  createSessionTraceId as dd,
  dL as ed,
  uL as fd,
  fL as gd,
  NC as hd,
  isOffPeakTerminalStatus as id,
  AZ as jd,
  isOffPeakTicketExpiredError as kd,
  mergeZCodeBackgroundTaskControlItems as ld,
  parseZCodeBackgroundTaskControlItems as md,
  parseZCodeBackgroundTaskNotificationText as nd,
  collectZCodeBackgroundTaskNotificationsByToolUseId as od,
  zcodeBackgroundTaskNotificationToolUpdateStatus as pd,
  attachZCodeBackgroundTaskNotificationToRaw as qd,
  sP as rd,
  formatZCodeModelRef as sd,
  normalizeAvailableZCodeMode as td,
  getZCodeAgentAvailableModes as ud,
  zcodeSessionSettingsToZCodeConfigOptions as vd,
  toOpencodeModelId as wd,
  formatLogPrefix as xd,
  JL as yd,
  mP as zd,
  resolveZCodeAgentStartupReadiness as Ad,
  isZCodeAgentStartupReady as Bd,
  resolveModelProviderFamilyMode as Cd,
  getModelProviderFamilySpec as Dd,
  resolveModelProviderFamilyIdByProviderId as Ed,
  normalizeProviderFamilyDomain as Fd,
  encodeCustomModelValue as Gd,
  decodeCustomModelValue as Hd,
  normalizeSupplierBaseUrl as Id,
  buildCustomSupplierKey as Jd,
  buildGhostSupplierKey as Kd,
  createAgentStateId as Ld,
  $W as Md,
  computeLineChangeStat as Nd,
  formatZCodeHostProcessName as Od,
  isZCodeCuaMcpCommand as Pd,
  isZCodeCuaMcpPackageArg as Qd,
  getRemoteRuntimeToolsForPlatform as Rd,
  getRuntimeToolRuntime as Sd,
  appendAssistantMessagePart as Td,
  coalesceConsecutiveZCodeAssistants as Ud,
  buildZCodeAssistantPresentation as Vd,
  getCompactToolCallSummary as Wd,
  appendZCodeStreamingToolInputDelta as Xd,
  buildZCodeStreamingToolInputPreview as Yd,
  shouldMaterializeZCodeStreamingToolInputPreview as Zd,
  markZCodeStreamingToolInputPreviewMaterialized as _d,
  isMainAgentToolProjectionSource as $d,
  extractPlanStepsFromToolInput as ae,
  extractPlanStepsFromToolOutput as be,
  getPermissionRequestPreview as ce,
  XF as de,
  QF as ee,
  resolveIntranetDepsBaseUrl as fe,
  JZ as ge,
  shouldEnableInternalOnlyFeature as he,
  resolveInternalOnlyFeatureGateState as ie,
  g4 as je,
  f4 as ke,
  h4 as le,
  y4 as me,
  b4 as ne,
  v4 as oe,
  S4 as pe,
  _4 as qe,
  buildRepoSnapshotWorkspaceKey as re,
  resolveRepoSnapshotPromptProvider as se,
  buildRepoWikiWorkspaceKey as te,
  withOpenRouterAttributionHeaders as ue,
  N4 as ve,
  Z4 as we,
  shouldWalkSkillDirectoryEntry as xe,
  quotePosixShellArg as ye,
  buildPosixShellExecCommand as ze,
  quotePosixPathArg as Ae,
  resolvePosixHomePath as Be,
  buildWriteLiteralFileCommand as Ce,
};
