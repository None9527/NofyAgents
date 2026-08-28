var fu = Object.defineProperty;
var s = (e, n) => fu(e, "name", { value: n, configurable: !0 });
var ve = (e, n) => {
  for (var r in n) fu(e, r, { get: n[r], enumerable: !0 });
};
var y = require("electron");

function normalizeZCodeEnv(e) {
  return e?.trim().toLowerCase() === "production" ? "production" : "test";
}
s(normalizeZCodeEnv, "normalizeZCodeEnv");
var Pf = normalizeZCodeEnv("production");
var Tf = typeof process < "u" ? process.env.ZCODE_DEBUG : void 0;
var t = {};
ve(t, {
  $brand: () => Oo,
  $input: () => js,
  $output: () => Bs,
  NEVER: () => Er,
  TimePrecision: () => qs,
  ZodAny: () => Ml,
  ZodArray: () => Nl,
  ZodBase64: () => or,
  ZodBase64URL: () => nr,
  ZodBigInt: () => Tt,
  ZodBigIntFormat: () => ar,
  ZodBoolean: () => Pt,
  ZodCIDRv4: () => er,
  ZodCIDRv6: () => tr,
  ZodCUID: () => Gn,
  ZodCUID2: () => Kn,
  ZodCatch: () => ad,
  ZodCodec: () => gr,
  ZodCustom: () => ko,
  ZodCustomStringFormat: () => Ct,
  ZodDate: () => ho,
  ZodDefault: () => ed,
  ZodDiscriminatedUnion: () => Bl,
  ZodE164: () => rr,
  ZodEmail: () => Fn,
  ZodEmoji: () => qn,
  ZodEnum: () => xt,
  ZodError: () => ob,
  ZodExactOptional: () => Yl,
  ZodFile: () => Hl,
  ZodFirstPartyTypeKind: () => bd,
  ZodFunction: () => fd,
  ZodGUID: () => uo,
  ZodIPv4: () => Xn,
  ZodIPv6: () => Qn,
  ZodISODate: () => Nn,
  ZodISODateTime: () => Un,
  ZodISODuration: () => Bn,
  ZodISOTime: () => Zn,
  ZodIntersection: () => jl,
  ZodIssueCode: () => rb,
  ZodJWT: () => ir,
  ZodKSUID: () => Yn,
  ZodLazy: () => pd,
  ZodLiteral: () => Kl,
  ZodMAC: () => Pl,
  ZodMap: () => Vl,
  ZodNaN: () => cd,
  ZodNanoID: () => Vn,
  ZodNever: () => Dl,
  ZodNonOptional: () => pr,
  ZodNull: () => Al,
  ZodNullable: () => Ql,
  ZodNumber: () => Rt,
  ZodNumberFormat: () => Ve,
  ZodObject: () => bo,
  ZodOptional: () => ur,
  ZodPipe: () => mr,
  ZodPrefault: () => od,
  ZodPromise: () => gd,
  ZodReadonly: () => ld,
  ZodRealError: () => te,
  ZodRecord: () => So,
  ZodSet: () => Gl,
  ZodString: () => It,
  ZodStringFormat: () => N,
  ZodSuccess: () => id,
  ZodSymbol: () => El,
  ZodTemplateLiteral: () => ud,
  ZodTransform: () => Jl,
  ZodTuple: () => Wl,
  ZodType: () => O,
  ZodULID: () => Hn,
  ZodURL: () => fo,
  ZodUUID: () => ye,
  ZodUndefined: () => Ol,
  ZodUnion: () => vo,
  ZodUnknown: () => $l,
  ZodVoid: () => Ul,
  ZodXID: () => Jn,
  ZodXor: () => Zl,
  _ZodString: () => Wn,
  _default: () => td,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base64,
  base64url: () => base64url,
  bigint: () => bigint,
  boolean: () => boolean,
  catch: () => sd,
  check: () => check,
  cidrv4: () => cidrv4,
  cidrv6: () => cidrv6,
  clone: () => clone,
  codec: () => codec,
  coerce: () => vd,
  config: () => config,
  core: () => _e,
  cuid: () => cuid,
  cuid2: () => cuid2,
  custom: () => custom,
  date: () => Bp,
  decode: () => Sl,
  decodeAsync: () => _l,
  describe: () => lm,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e164,
  email: () => email,
  emoji: () => lp,
  encode: () => vl,
  encodeAsync: () => kl,
  endsWith: () => _endsWith,
  enum: () => lr,
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
  iso: () => _t,
  json: () => json,
  jwt: () => jwt,
  keyof: () => keyof,
  ksuid: () => ksuid,
  lazy: () => lazy,
  length: () => _length,
  literal: () => literal,
  locales: () => ao,
  looseObject: () => looseObject,
  looseRecord: () => looseRecord,
  lowercase: () => _lowercase,
  lt: () => _lt,
  lte: () => _lte,
  mac: () => mac,
  map: () => map,
  maxLength: () => _maxLength,
  maxSize: () => _maxSize,
  meta: () => dm,
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
  null: () => zl,
  nullable: () => nullable,
  nullish: () => em,
  number: () => number,
  object: () => object,
  optional: () => optional,
  overwrite: () => _overwrite,
  parse: () => fl,
  parseAsync: () => hl,
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
  regexes: () => le,
  registry: () => registry,
  safeDecode: () => Il,
  safeDecodeAsync: () => Rl,
  safeEncode: () => xl,
  safeEncodeAsync: () => Cl,
  safeParse: () => yl,
  safeParseAsync: () => bl,
  set: () => set,
  setErrorMap: () => setErrorMap,
  size: () => _size,
  slugify: () => _slugify,
  startsWith: () => _startsWith,
  strictObject: () => strictObject,
  string: () => string,
  stringFormat: () => stringFormat,
  stringbool: () => pm,
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
  undefined: () => Up,
  union: () => union,
  unknown: () => unknown,
  uppercase: () => _uppercase,
  url: () => url,
  util: () => C,
  uuid: () => uuid,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => Zp,
  xid: () => xid,
  xor: () => xor,
});
var _e = {};
ve(_e, {
  $ZodAny: () => ha,
  $ZodArray: () => ka,
  $ZodAsyncError: () => ue,
  $ZodBase64: () => aa,
  $ZodBase64URL: () => sa,
  $ZodBigInt: () => en,
  $ZodBigIntFormat: () => pa,
  $ZodBoolean: () => Qt,
  $ZodCIDRv4: () => na,
  $ZodCIDRv6: () => ra,
  $ZodCUID: () => qi,
  $ZodCUID2: () => Vi,
  $ZodCatch: () => Za,
  $ZodCheck: () => Z,
  $ZodCheckBigIntFormat: () => ki,
  $ZodCheckEndsWith: () => zi,
  $ZodCheckGreaterThan: () => Go,
  $ZodCheckIncludes: () => Oi,
  $ZodCheckLengthEquals: () => Pi,
  $ZodCheckLessThan: () => Vo,
  $ZodCheckLowerCase: () => wi,
  $ZodCheckMaxLength: () => Ci,
  $ZodCheckMaxSize: () => _i,
  $ZodCheckMimeType: () => $i,
  $ZodCheckMinLength: () => Ri,
  $ZodCheckMinSize: () => xi,
  $ZodCheckMultipleOf: () => vi,
  $ZodCheckNumberFormat: () => Si,
  $ZodCheckOverwrite: () => Di,
  $ZodCheckProperty: () => Mi,
  $ZodCheckRegex: () => Ti,
  $ZodCheckSizeEquals: () => Ii,
  $ZodCheckStartsWith: () => Ai,
  $ZodCheckStringFormat: () => at,
  $ZodCheckUpperCase: () => Ei,
  $ZodCodec: () => to,
  $ZodCustom: () => Ga,
  $ZodCustomStringFormat: () => da,
  $ZodDate: () => Sa,
  $ZodDefault: () => $a,
  $ZodDiscriminatedUnion: () => Ia,
  $ZodE164: () => ca,
  $ZodEmail: () => ji,
  $ZodEmoji: () => Wi,
  $ZodEncodeError: () => Re,
  $ZodEnum: () => wa,
  $ZodError: () => Gt,
  $ZodExactOptional: () => za,
  $ZodFile: () => Oa,
  $ZodFunction: () => Fa,
  $ZodGUID: () => Zi,
  $ZodIPv4: () => ea,
  $ZodIPv6: () => ta,
  $ZodISODate: () => Yi,
  $ZodISODateTime: () => Ji,
  $ZodISODuration: () => Qi,
  $ZodISOTime: () => Xi,
  $ZodIntersection: () => Ca,
  $ZodJWT: () => la,
  $ZodKSUID: () => Hi,
  $ZodLazy: () => Va,
  $ZodLiteral: () => Ea,
  $ZodMAC: () => oa,
  $ZodMap: () => Pa,
  $ZodNaN: () => Ba,
  $ZodNanoID: () => Fi,
  $ZodNever: () => ba,
  $ZodNonOptional: () => Ua,
  $ZodNull: () => fa,
  $ZodNullable: () => Ma,
  $ZodNumber: () => Qo,
  $ZodNumberFormat: () => ua,
  $ZodObject: () => Vu,
  $ZodObjectJIT: () => _a,
  $ZodOptional: () => on,
  $ZodPipe: () => ja,
  $ZodPrefault: () => Da,
  $ZodPromise: () => qa,
  $ZodReadonly: () => La,
  $ZodRealError: () => ee,
  $ZodRecord: () => Ra,
  $ZodRegistry: () => nn,
  $ZodSet: () => Ta,
  $ZodString: () => je,
  $ZodStringFormat: () => U,
  $ZodSuccess: () => Na,
  $ZodSymbol: () => ma,
  $ZodTemplateLiteral: () => Wa,
  $ZodTransform: () => Aa,
  $ZodTuple: () => tn,
  $ZodType: () => E,
  $ZodULID: () => Gi,
  $ZodURL: () => Li,
  $ZodUUID: () => Bi,
  $ZodUndefined: () => ga,
  $ZodUnion: () => eo,
  $ZodUnknown: () => ya,
  $ZodVoid: () => va,
  $ZodXID: () => Ki,
  $ZodXor: () => xa,
  $brand: () => Oo,
  $constructor: () => $constructor,
  $input: () => js,
  $output: () => Bs,
  Doc: () => Xt,
  JSONSchema: () => Qu,
  JSONSchemaGenerator: () => $n,
  NEVER: () => Er,
  TimePrecision: () => qs,
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
  _decode: () => Uo,
  _decodeAsync: () => Zo,
  _default: () => _default,
  _discriminatedUnion: () => _discriminatedUnion,
  _e164: () => _e164,
  _email: () => _email,
  _emoji: () => _emoji,
  _encode: () => Do,
  _encodeAsync: () => No,
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
  _parse: () => ot,
  _parseAsync: () => nt,
  _pipe: () => _pipe,
  _positive: () => _positive,
  _promise: () => _promise,
  _property: () => _property,
  _readonly: () => _readonly,
  _record: () => _record,
  _refine: () => _refine,
  _regex: () => _regex,
  _safeDecode: () => jo,
  _safeDecodeAsync: () => Wo,
  _safeEncode: () => Bo,
  _safeEncodeAsync: () => Lo,
  _safeParse: () => rt,
  _safeParseAsync: () => it,
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
  createStandardJSONSchemaMethod: () => kt,
  createToJSONSchemaMethod: () => Pc,
  decode: () => oh,
  decodeAsync: () => rh,
  describe: () => describe,
  encode: () => th,
  encodeAsync: () => nh,
  extractDefs: () => extractDefs,
  finalize: () => finalize,
  flattenError: () => flattenError,
  formatError: () => formatError,
  globalConfig: () => Bt,
  globalRegistry: () => V,
  initializeContext: () => initializeContext,
  isValidBase64: () => isValidBase64,
  isValidBase64URL: () => isValidBase64URL,
  isValidJWT: () => isValidJWT,
  locales: () => ao,
  meta: () => meta,
  parse: () => Mo,
  parseAsync: () => $o,
  prettifyError: () => prettifyError,
  process: () => D,
  regexes: () => le,
  registry: () => registry,
  safeDecode: () => ah,
  safeDecodeAsync: () => ch,
  safeEncode: () => ih,
  safeEncodeAsync: () => sh,
  safeParse: () => Wr,
  safeParseAsync: () => Fr,
  toDotPath: () => toDotPath,
  toJSONSchema: () => toJSONSchema,
  treeifyError: () => treeifyError,
  util: () => C,
  version: () => Ui,
});
var Er = Object.freeze({ status: "aborted" });
function $constructor(e, n, r) {
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
    (l._zod.traits.add(e), n(l, p));
    let u = _.prototype,
      h = Object.keys(u);
    for (let S = 0; S < h.length; S++) {
      let k = h[S];
      k in l || (l[k] = u[k].bind(l));
    }
  }
  s(init, "init");
  let o = r?.Parent ?? Object;
  class i extends o {
    static {
      s(this, "Definition");
    }
  }
  Object.defineProperty(i, "name", { value: e });
  function _(l) {
    var p;
    let u = r?.Parent ? new i() : this;
    (init(u, l), (p = u._zod).deferred ?? (p.deferred = []));
    for (let h of u._zod.deferred) h();
    return u;
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
var Oo = Symbol("zod_brand"),
  ue = class extends Error {
    static {
      s(this, "$ZodAsyncError");
    }
    constructor() {
      super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
    }
  },
  Re = class extends Error {
    static {
      s(this, "$ZodEncodeError");
    }
    constructor(n) {
      (super(`Encountered unidirectional transform during encode: ${n}`),
        (this.name = "ZodEncodeError"));
    }
  },
  Bt = {};
function config(e) {
  return (e && Object.assign(Bt, e), Bt);
}
s(config, "config");
var C = {};
ve(C, {
  BIGINT_FORMAT_RANGES: () => Br,
  Class: () => Ar,
  NUMBER_FORMAT_RANGES: () => Zr,
  aborted: () => aborted,
  allowsEval: () => $r,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => zo,
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
  getParsedType: () => Bf,
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
  primitiveTypes: () => Ur,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => Ft,
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
  let n = Object.values(e).filter((a) => typeof a == "number");
  return Object.entries(e)
    .filter(([a, o]) => n.indexOf(+a) === -1)
    .map(([a, o]) => o);
}
s(getEnumValues, "getEnumValues");
function joinValues(e, n = "|") {
  return e.map((r) => stringifyPrimitive(r)).join(n);
}
s(joinValues, "joinValues");
function jsonStringifyReplacer(e, n) {
  return typeof n == "bigint" ? n.toString() : n;
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
  let n = e.startsWith("^") ? 1 : 0,
    r = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(n, r);
}
s(cleanRegex, "cleanRegex");
function floatSafeRemainder(e, n) {
  let r = (e.toString().split(".")[1] || "").length,
    a = n.toString(),
    o = (a.split(".")[1] || "").length;
  if (o === 0 && /\d?e-\d?/.test(a)) {
    let p = a.match(/\d?e-(\d?)/);
    p?.[1] && (o = Number.parseInt(p[1]));
  }
  let i = r > o ? r : o,
    c = Number.parseInt(e.toFixed(i).replace(".", "")),
    l = Number.parseInt(n.toFixed(i).replace(".", ""));
  return (c % l) / 10 ** i;
}
s(floatSafeRemainder, "floatSafeRemainder");
var Su = Symbol("evaluating");
function defineLazy(e, n, r) {
  let a;
  Object.defineProperty(e, n, {
    get() {
      if (a !== Su) return (a === void 0 && ((a = Su), (a = r())), a);
    },
    set(o) {
      Object.defineProperty(e, n, { value: o });
    },
    configurable: !0,
  });
}
s(defineLazy, "defineLazy");
function objectClone(e) {
  return Object.create(Object.getPrototypeOf(e), Object.getOwnPropertyDescriptors(e));
}
s(objectClone, "objectClone");
function assignProp(e, n, r) {
  Object.defineProperty(e, n, { value: r, writable: !0, enumerable: !0, configurable: !0 });
}
s(assignProp, "assignProp");
function mergeDefs(...e) {
  let n = {};
  for (let r of e) {
    let a = Object.getOwnPropertyDescriptors(r);
    Object.assign(n, a);
  }
  return Object.defineProperties({}, n);
}
s(mergeDefs, "mergeDefs");
function cloneDef(e) {
  return mergeDefs(e._zod.def);
}
s(cloneDef, "cloneDef");
function getElementAtPath(e, n) {
  return n ? n.reduce((r, a) => r?.[a], e) : e;
}
s(getElementAtPath, "getElementAtPath");
function promiseAllObject(e) {
  let n = Object.keys(e),
    r = n.map((a) => e[a]);
  return Promise.all(r).then((a) => {
    let o = {};
    for (let i = 0; i < n.length; i++) o[n[i]] = a[i];
    return o;
  });
}
s(promiseAllObject, "promiseAllObject");
function randomString(e = 10) {
  let n = "abcdefghijklmnopqrstuvwxyz",
    r = "";
  for (let a = 0; a < e; a++) r += n[Math.floor(Math.random() * n.length)];
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
var zo = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function isObject(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
s(isObject, "isObject");
var $r = cached(() => {
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
  let n = e.constructor;
  if (n === void 0 || typeof n != "function") return !0;
  let r = n.prototype;
  return !(isObject(r) === !1 || Object.prototype.hasOwnProperty.call(r, "isPrototypeOf") === !1);
}
s(isPlainObject, "isPlainObject");
function shallowClone(e) {
  return isPlainObject(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
s(shallowClone, "shallowClone");
function numKeys(e) {
  let n = 0;
  for (let r in e) Object.prototype.hasOwnProperty.call(e, r) && n++;
  return n;
}
s(numKeys, "numKeys");
var Bf = s((e) => {
    let n = typeof e;
    switch (n) {
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
        throw new Error(`Unknown data type: ${n}`);
    }
  }, "getParsedType"),
  Ft = new Set(["string", "number", "symbol"]),
  Ur = new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]);
function escapeRegex(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
s(escapeRegex, "escapeRegex");
function clone(e, n, r) {
  let a = new e._zod.constr(n ?? e._zod.def);
  return ((!n || r?.parent) && (a._zod.parent = e), a);
}
s(clone, "clone");
function normalizeParams(e) {
  let n = e;
  if (!n) return {};
  if (typeof n == "string") return { error: s(() => n, "error") };
  if (n?.message !== void 0) {
    if (n?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
    n.error = n.message;
  }
  return (
    delete n.message,
    typeof n.error == "string" ? { ...n, error: s(() => n.error, "error") } : n
  );
}
s(normalizeParams, "normalizeParams");
function createTransparentProxy(e) {
  let n;
  return new Proxy(
    {},
    {
      get(r, a, o) {
        return (n ?? (n = e()), Reflect.get(n, a, o));
      },
      set(r, a, o, i) {
        return (n ?? (n = e()), Reflect.set(n, a, o, i));
      },
      has(r, a) {
        return (n ?? (n = e()), Reflect.has(n, a));
      },
      deleteProperty(r, a) {
        return (n ?? (n = e()), Reflect.deleteProperty(n, a));
      },
      ownKeys(r) {
        return (n ?? (n = e()), Reflect.ownKeys(n));
      },
      getOwnPropertyDescriptor(r, a) {
        return (n ?? (n = e()), Reflect.getOwnPropertyDescriptor(n, a));
      },
      defineProperty(r, a, o) {
        return (n ?? (n = e()), Reflect.defineProperty(n, a, o));
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
    (n) => e[n]._zod.optin === "optional" && e[n]._zod.optout === "optional",
  );
}
s(optionalKeys, "optionalKeys");
var Zr = {
    safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    int32: [-2147483648, 2147483647],
    uint32: [0, 4294967295],
    float32: [-34028234663852886e22, 34028234663852886e22],
    float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
  },
  Br = {
    int64: [BigInt("-9223372036854775808"), BigInt("9223372036854775807")],
    uint64: [BigInt(0), BigInt("18446744073709551615")],
  };
function pick(e, n) {
  let r = e._zod.def,
    a = r.checks;
  if (a && a.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  let i = mergeDefs(e._zod.def, {
    get shape() {
      let c = {};
      for (let l in n) {
        if (!(l in r.shape)) throw new Error(`Unrecognized key: "${l}"`);
        n[l] && (c[l] = r.shape[l]);
      }
      return (assignProp(this, "shape", c), c);
    },
    checks: [],
  });
  return clone(e, i);
}
s(pick, "pick");
function omit(e, n) {
  let r = e._zod.def,
    a = r.checks;
  if (a && a.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  let i = mergeDefs(e._zod.def, {
    get shape() {
      let c = { ...e._zod.def.shape };
      for (let l in n) {
        if (!(l in r.shape)) throw new Error(`Unrecognized key: "${l}"`);
        n[l] && delete c[l];
      }
      return (assignProp(this, "shape", c), c);
    },
    checks: [],
  });
  return clone(e, i);
}
s(omit, "omit");
function extend(e, n) {
  if (!isPlainObject(n)) throw new Error("Invalid input to extend: expected a plain object");
  let r = e._zod.def.checks;
  if (r && r.length > 0) {
    let i = e._zod.def.shape;
    for (let c in n)
      if (Object.getOwnPropertyDescriptor(i, c) !== void 0)
        throw new Error(
          "Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.",
        );
  }
  let o = mergeDefs(e._zod.def, {
    get shape() {
      let i = { ...e._zod.def.shape, ...n };
      return (assignProp(this, "shape", i), i);
    },
  });
  return clone(e, o);
}
s(extend, "extend");
function safeExtend(e, n) {
  if (!isPlainObject(n)) throw new Error("Invalid input to safeExtend: expected a plain object");
  let r = mergeDefs(e._zod.def, {
    get shape() {
      let a = { ...e._zod.def.shape, ...n };
      return (assignProp(this, "shape", a), a);
    },
  });
  return clone(e, r);
}
s(safeExtend, "safeExtend");
function merge(e, n) {
  let r = mergeDefs(e._zod.def, {
    get shape() {
      let a = { ...e._zod.def.shape, ...n._zod.def.shape };
      return (assignProp(this, "shape", a), a);
    },
    get catchall() {
      return n._zod.def.catchall;
    },
    checks: [],
  });
  return clone(e, r);
}
s(merge, "merge");
function partial(e, n, r) {
  let o = n._zod.def.checks;
  if (o && o.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  let c = mergeDefs(n._zod.def, {
    get shape() {
      let l = n._zod.def.shape,
        p = { ...l };
      if (r)
        for (let u in r) {
          if (!(u in l)) throw new Error(`Unrecognized key: "${u}"`);
          r[u] && (p[u] = e ? new e({ type: "optional", innerType: l[u] }) : l[u]);
        }
      else for (let u in l) p[u] = e ? new e({ type: "optional", innerType: l[u] }) : l[u];
      return (assignProp(this, "shape", p), p);
    },
    checks: [],
  });
  return clone(n, c);
}
s(partial, "partial");
function required(e, n, r) {
  let a = mergeDefs(n._zod.def, {
    get shape() {
      let o = n._zod.def.shape,
        i = { ...o };
      if (r)
        for (let c in r) {
          if (!(c in i)) throw new Error(`Unrecognized key: "${c}"`);
          r[c] && (i[c] = new e({ type: "nonoptional", innerType: o[c] }));
        }
      else for (let c in o) i[c] = new e({ type: "nonoptional", innerType: o[c] });
      return (assignProp(this, "shape", i), i);
    },
  });
  return clone(n, a);
}
s(required, "required");
function aborted(e, n = 0) {
  if (e.aborted === !0) return !0;
  for (let r = n; r < e.issues.length; r++) if (e.issues[r]?.continue !== !0) return !0;
  return !1;
}
s(aborted, "aborted");
function prefixIssues(e, n) {
  return n.map((r) => {
    var a;
    return ((a = r).path ?? (a.path = []), r.path.unshift(e), r);
  });
}
s(prefixIssues, "prefixIssues");
function unwrapMessage(e) {
  return typeof e == "string" ? e : e?.message;
}
s(unwrapMessage, "unwrapMessage");
function finalizeIssue(e, n, r) {
  let a = { ...e, path: e.path ?? [] };
  if (!e.message) {
    let o =
      unwrapMessage(e.inst?._zod.def?.error?.(e)) ??
      unwrapMessage(n?.error?.(e)) ??
      unwrapMessage(r.customError?.(e)) ??
      unwrapMessage(r.localeError?.(e)) ??
      "Invalid input";
    a.message = o;
  }
  return (delete a.inst, delete a.continue, n?.reportInput || delete a.input, a);
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
  let n = typeof e;
  switch (n) {
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
  return n;
}
s(parsedType, "parsedType");
function issue(...e) {
  let [n, r, a] = e;
  return typeof n == "string" ? { message: n, code: "custom", input: r, inst: a } : { ...n };
}
s(issue, "issue");
function cleanEnum(e) {
  return Object.entries(e)
    .filter(([n, r]) => Number.isNaN(Number.parseInt(n, 10)))
    .map((n) => n[1]);
}
s(cleanEnum, "cleanEnum");
function base64ToUint8Array(e) {
  let n = atob(e),
    r = new Uint8Array(n.length);
  for (let a = 0; a < n.length; a++) r[a] = n.charCodeAt(a);
  return r;
}
s(base64ToUint8Array, "base64ToUint8Array");
function uint8ArrayToBase64(e) {
  let n = "";
  for (let r = 0; r < e.length; r++) n += String.fromCharCode(e[r]);
  return btoa(n);
}
s(uint8ArrayToBase64, "uint8ArrayToBase64");
function base64urlToUint8Array(e) {
  let n = e.replace(/-/g, "+").replace(/_/g, "/"),
    r = "=".repeat((4 - (n.length % 4)) % 4);
  return base64ToUint8Array(n + r);
}
s(base64urlToUint8Array, "base64urlToUint8Array");
function uint8ArrayToBase64url(e) {
  return uint8ArrayToBase64(e).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
s(uint8ArrayToBase64url, "uint8ArrayToBase64url");
function hexToUint8Array(e) {
  let n = e.replace(/^0x/, "");
  if (n.length % 2 !== 0) throw new Error("Invalid hex string length");
  let r = new Uint8Array(n.length / 2);
  for (let a = 0; a < n.length; a += 2) r[a / 2] = Number.parseInt(n.slice(a, a + 2), 16);
  return r;
}
s(hexToUint8Array, "hexToUint8Array");
function uint8ArrayToHex(e) {
  return Array.from(e)
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
s(uint8ArrayToHex, "uint8ArrayToHex");
var Ar = class {
  static {
    s(this, "Class");
  }
  constructor(...n) {}
};
var xu = s((e, n) => {
    ((e.name = "$ZodError"),
      Object.defineProperty(e, "_zod", { value: e._zod, enumerable: !1 }),
      Object.defineProperty(e, "issues", { value: n, enumerable: !1 }),
      (e.message = JSON.stringify(n, jsonStringifyReplacer, 2)),
      Object.defineProperty(e, "toString", { value: s(() => e.message, "value"), enumerable: !1 }));
  }, "initializer"),
  Gt = $constructor("$ZodError", xu),
  ee = $constructor("$ZodError", xu, { Parent: Error });
function flattenError(e, n = (r) => r.message) {
  let r = {},
    a = [];
  for (let o of e.issues)
    o.path.length > 0
      ? ((r[o.path[0]] = r[o.path[0]] || []), r[o.path[0]].push(n(o)))
      : a.push(n(o));
  return { formErrors: a, fieldErrors: r };
}
s(flattenError, "flattenError");
function formatError(e, n = (r) => r.message) {
  let r = { _errors: [] },
    a = s((o) => {
      for (let i of o.issues)
        if (i.code === "invalid_union" && i.errors.length) i.errors.map((c) => a({ issues: c }));
        else if (i.code === "invalid_key") a({ issues: i.issues });
        else if (i.code === "invalid_element") a({ issues: i.issues });
        else if (i.path.length === 0) r._errors.push(n(i));
        else {
          let c = r,
            l = 0;
          for (; l < i.path.length;) {
            let p = i.path[l];
            (l === i.path.length - 1
              ? ((c[p] = c[p] || { _errors: [] }), c[p]._errors.push(n(i)))
              : (c[p] = c[p] || { _errors: [] }),
              (c = c[p]),
              l++);
          }
        }
    }, "processError");
  return (a(e), r);
}
s(formatError, "formatError");
function treeifyError(e, n = (r) => r.message) {
  let r = { errors: [] },
    a = s((o, i = []) => {
      var c, l;
      for (let p of o.issues)
        if (p.code === "invalid_union" && p.errors.length)
          p.errors.map((u) => a({ issues: u }, p.path));
        else if (p.code === "invalid_key") a({ issues: p.issues }, p.path);
        else if (p.code === "invalid_element") a({ issues: p.issues }, p.path);
        else {
          let u = [...i, ...p.path];
          if (u.length === 0) {
            r.errors.push(n(p));
            continue;
          }
          let h = r,
            S = 0;
          for (; S < u.length;) {
            let k = u[S],
              I = S === u.length - 1;
            (typeof k == "string"
              ? (h.properties ?? (h.properties = {}),
                (c = h.properties)[k] ?? (c[k] = { errors: [] }),
                (h = h.properties[k]))
              : (h.items ?? (h.items = []),
                (l = h.items)[k] ?? (l[k] = { errors: [] }),
                (h = h.items[k])),
              I && h.errors.push(n(p)),
              S++);
          }
        }
    }, "processError");
  return (a(e), r);
}
s(treeifyError, "treeifyError");
function toDotPath(e) {
  let n = [],
    r = e.map((a) => (typeof a == "object" ? a.key : a));
  for (let a of r)
    typeof a == "number"
      ? n.push(`[${a}]`)
      : typeof a == "symbol"
        ? n.push(`[${JSON.stringify(String(a))}]`)
        : /[^\w$]/.test(a)
          ? n.push(`[${JSON.stringify(a)}]`)
          : (n.length && n.push("."), n.push(a));
  return n.join("");
}
s(toDotPath, "toDotPath");
function prettifyError(e) {
  let n = [],
    r = [...e.issues].sort((a, o) => (a.path ?? []).length - (o.path ?? []).length);
  for (let a of r)
    (n.push(`\u2716 ${a.message}`), a.path?.length && n.push(`  \u2192 at ${toDotPath(a.path)}`));
  return n.join(`
`);
}
s(prettifyError, "prettifyError");
var ot = s(
    (e) => (n, r, a, o) => {
      let i = a ? Object.assign(a, { async: !1 }) : { async: !1 },
        c = n._zod.run({ value: r, issues: [] }, i);
      if (c instanceof Promise) throw new ue();
      if (c.issues.length) {
        let l = new (o?.Err ?? e)(c.issues.map((p) => finalizeIssue(p, i, config())));
        throw (zo(l, o?.callee), l);
      }
      return c.value;
    },
    "_parse",
  ),
  Mo = ot(ee),
  nt = s(
    (e) => async (n, r, a, o) => {
      let i = a ? Object.assign(a, { async: !0 }) : { async: !0 },
        c = n._zod.run({ value: r, issues: [] }, i);
      if ((c instanceof Promise && (c = await c), c.issues.length)) {
        let l = new (o?.Err ?? e)(c.issues.map((p) => finalizeIssue(p, i, config())));
        throw (zo(l, o?.callee), l);
      }
      return c.value;
    },
    "_parseAsync",
  ),
  $o = nt(ee),
  rt = s(
    (e) => (n, r, a) => {
      let o = a ? { ...a, async: !1 } : { async: !1 },
        i = n._zod.run({ value: r, issues: [] }, o);
      if (i instanceof Promise) throw new ue();
      return i.issues.length
        ? { success: !1, error: new (e ?? Gt)(i.issues.map((c) => finalizeIssue(c, o, config()))) }
        : { success: !0, data: i.value };
    },
    "_safeParse",
  ),
  Wr = rt(ee),
  it = s(
    (e) => async (n, r, a) => {
      let o = a ? Object.assign(a, { async: !0 }) : { async: !0 },
        i = n._zod.run({ value: r, issues: [] }, o);
      return (
        i instanceof Promise && (i = await i),
        i.issues.length
          ? { success: !1, error: new e(i.issues.map((c) => finalizeIssue(c, o, config()))) }
          : { success: !0, data: i.value }
      );
    },
    "_safeParseAsync",
  ),
  Fr = it(ee),
  Do = s(
    (e) => (n, r, a) => {
      let o = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return ot(e)(n, r, o);
    },
    "_encode",
  ),
  th = Do(ee),
  Uo = s((e) => (n, r, a) => ot(e)(n, r, a), "_decode"),
  oh = Uo(ee),
  No = s(
    (e) => async (n, r, a) => {
      let o = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return nt(e)(n, r, o);
    },
    "_encodeAsync",
  ),
  nh = No(ee),
  Zo = s((e) => async (n, r, a) => nt(e)(n, r, a), "_decodeAsync"),
  rh = Zo(ee),
  Bo = s(
    (e) => (n, r, a) => {
      let o = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return rt(e)(n, r, o);
    },
    "_safeEncode",
  ),
  ih = Bo(ee),
  jo = s((e) => (n, r, a) => rt(e)(n, r, a), "_safeDecode"),
  ah = jo(ee),
  Lo = s(
    (e) => async (n, r, a) => {
      let o = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return it(e)(n, r, o);
    },
    "_safeEncodeAsync",
  ),
  sh = Lo(ee),
  Wo = s((e) => async (n, r, a) => it(e)(n, r, a), "_safeDecodeAsync"),
  ch = Wo(ee);
var le = {};
ve(le, {
  base64: () => ai,
  base64url: () => Fo,
  bigint: () => pi,
  boolean: () => gi,
  browserEmail: () => hh,
  cidrv4: () => ri,
  cidrv6: () => ii,
  cuid: () => qr,
  cuid2: () => Vr,
  date: () => ci,
  datetime: () => datetime,
  domain: () => vh,
  duration: () => Yr,
  e164: () => si,
  email: () => Qr,
  emoji: () => emoji,
  extendedDuration: () => lh,
  guid: () => Xr,
  hex: () => Sh,
  hostname: () => bh,
  html5Email: () => mh,
  idnEmail: () => fh,
  integer: () => mi,
  ipv4: () => ti,
  ipv6: () => oi,
  ksuid: () => Hr,
  lowercase: () => yi,
  mac: () => ni,
  md5_base64: () => _h,
  md5_base64url: () => xh,
  md5_hex: () => kh,
  nanoid: () => Jr,
  null: () => fi,
  number: () => qo,
  rfc5322Email: () => gh,
  sha1_base64: () => Ch,
  sha1_base64url: () => Rh,
  sha1_hex: () => Ih,
  sha256_base64: () => Th,
  sha256_base64url: () => wh,
  sha256_hex: () => Ph,
  sha384_base64: () => Oh,
  sha384_base64url: () => Ah,
  sha384_hex: () => Eh,
  sha512_base64: () => Mh,
  sha512_base64url: () => $h,
  sha512_hex: () => zh,
  string: () => ui,
  time: () => time,
  ulid: () => Gr,
  undefined: () => hi,
  unicodeEmail: () => Cu,
  uppercase: () => bi,
  uuid: () => Be,
  uuid4: () => dh,
  uuid6: () => uh,
  uuid7: () => ph,
  xid: () => Kr,
});
var qr = /^[cC][^\s-]{8,}$/,
  Vr = /^[0-9a-z]+$/,
  Gr = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,
  Kr = /^[0-9a-vA-V]{20}$/,
  Hr = /^[A-Za-z0-9]{27}$/,
  Jr = /^[a-zA-Z0-9_-]{21}$/,
  Yr =
    /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
  lh =
    /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,
  Xr = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  Be = s(
    (e) =>
      e
        ? new RegExp(
            `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`,
          )
        : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,
    "uuid",
  ),
  dh = Be(4),
  uh = Be(6),
  ph = Be(7),
  Qr =
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
  mh =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  gh =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  Cu = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u,
  fh = Cu,
  hh =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  yh = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function emoji() {
  return new RegExp(yh, "u");
}
s(emoji, "emoji");
var ti =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  oi =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,
  ni = s((e) => {
    let n = escapeRegex(e ?? ":");
    return new RegExp(`^(?:[0-9A-F]{2}${n}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${n}){5}[0-9a-f]{2}$`);
  }, "mac"),
  ri =
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
  ii =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  ai = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
  Fo = /^[A-Za-z0-9_-]*$/,
  bh =
    /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/,
  vh = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
  si = /^\+[1-9]\d{6,14}$/,
  Ru =
    "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",
  ci = new RegExp(`^${Ru}$`);
function timeSource(e) {
  let n = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number"
    ? e.precision === -1
      ? `${n}`
      : e.precision === 0
        ? `${n}:[0-5]\\d`
        : `${n}:[0-5]\\d\\.\\d{${e.precision}}`
    : `${n}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
s(timeSource, "timeSource");
function time(e) {
  return new RegExp(`^${timeSource(e)}$`);
}
s(time, "time");
function datetime(e) {
  let n = timeSource({ precision: e.precision }),
    r = ["Z"];
  (e.local && r.push(""), e.offset && r.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)"));
  let a = `${n}(?:${r.join("|")})`;
  return new RegExp(`^${Ru}T(?:${a})$`);
}
s(datetime, "datetime");
var ui = s((e) => {
    let n = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}` : "[\\s\\S]*";
    return new RegExp(`^${n}$`);
  }, "string"),
  pi = /^-?\d+n?$/,
  mi = /^-?\d+$/,
  qo = /^-?\d+(?:\.\d+)?$/,
  gi = /^(?:true|false)$/i,
  fi = /^null$/i;
var hi = /^undefined$/i;
var yi = /^[^A-Z]*$/,
  bi = /^[^a-z]*$/,
  Sh = /^[0-9a-fA-F]*$/;
function fixedBase64(e, n) {
  return new RegExp(`^[A-Za-z0-9+/]{${e}}${n}$`);
}
s(fixedBase64, "fixedBase64");
function fixedBase64url(e) {
  return new RegExp(`^[A-Za-z0-9_-]{${e}}$`);
}
s(fixedBase64url, "fixedBase64url");
var kh = /^[0-9a-fA-F]{32}$/,
  _h = fixedBase64(22, "=="),
  xh = fixedBase64url(22),
  Ih = /^[0-9a-fA-F]{40}$/,
  Ch = fixedBase64(27, "="),
  Rh = fixedBase64url(27),
  Ph = /^[0-9a-fA-F]{64}$/,
  Th = fixedBase64(43, "="),
  wh = fixedBase64url(43),
  Eh = /^[0-9a-fA-F]{96}$/,
  Oh = fixedBase64(64, ""),
  Ah = fixedBase64url(64),
  zh = /^[0-9a-fA-F]{128}$/,
  Mh = fixedBase64(86, "=="),
  $h = fixedBase64url(86);
var Z = $constructor("$ZodCheck", (e, n) => {
    var r;
    (e._zod ?? (e._zod = {}), (e._zod.def = n), (r = e._zod).onattach ?? (r.onattach = []));
  }),
  wu = { number: "number", bigint: "bigint", object: "date" },
  Vo = $constructor("$ZodCheckLessThan", (e, n) => {
    Z.init(e, n);
    let r = wu[typeof n.value];
    (e._zod.onattach.push((a) => {
      let o = a._zod.bag,
        i = (n.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
      n.value < i && (n.inclusive ? (o.maximum = n.value) : (o.exclusiveMaximum = n.value));
    }),
      (e._zod.check = (a) => {
        (n.inclusive ? a.value <= n.value : a.value < n.value) ||
          a.issues.push({
            origin: r,
            code: "too_big",
            maximum: typeof n.value == "object" ? n.value.getTime() : n.value,
            input: a.value,
            inclusive: n.inclusive,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Go = $constructor("$ZodCheckGreaterThan", (e, n) => {
    Z.init(e, n);
    let r = wu[typeof n.value];
    (e._zod.onattach.push((a) => {
      let o = a._zod.bag,
        i = (n.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
      n.value > i && (n.inclusive ? (o.minimum = n.value) : (o.exclusiveMinimum = n.value));
    }),
      (e._zod.check = (a) => {
        (n.inclusive ? a.value >= n.value : a.value > n.value) ||
          a.issues.push({
            origin: r,
            code: "too_small",
            minimum: typeof n.value == "object" ? n.value.getTime() : n.value,
            input: a.value,
            inclusive: n.inclusive,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  vi = $constructor("$ZodCheckMultipleOf", (e, n) => {
    (Z.init(e, n),
      e._zod.onattach.push((r) => {
        var a;
        (a = r._zod.bag).multipleOf ?? (a.multipleOf = n.value);
      }),
      (e._zod.check = (r) => {
        if (typeof r.value != typeof n.value)
          throw new Error("Cannot mix number and bigint in multiple_of check.");
        (typeof r.value == "bigint"
          ? r.value % n.value === BigInt(0)
          : floatSafeRemainder(r.value, n.value) === 0) ||
          r.issues.push({
            origin: typeof r.value,
            code: "not_multiple_of",
            divisor: n.value,
            input: r.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Si = $constructor("$ZodCheckNumberFormat", (e, n) => {
    (Z.init(e, n), (n.format = n.format || "float64"));
    let r = n.format?.includes("int"),
      a = r ? "int" : "number",
      [o, i] = Zr[n.format];
    (e._zod.onattach.push((c) => {
      let l = c._zod.bag;
      ((l.format = n.format), (l.minimum = o), (l.maximum = i), r && (l.pattern = mi));
    }),
      (e._zod.check = (c) => {
        let l = c.value;
        if (r) {
          if (!Number.isInteger(l)) {
            c.issues.push({
              expected: a,
              format: n.format,
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
                  origin: a,
                  inclusive: !0,
                  continue: !n.abort,
                })
              : c.issues.push({
                  input: l,
                  code: "too_small",
                  minimum: Number.MIN_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: a,
                  inclusive: !0,
                  continue: !n.abort,
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
            continue: !n.abort,
          }),
          l > i &&
            c.issues.push({
              origin: "number",
              input: l,
              code: "too_big",
              maximum: i,
              inclusive: !0,
              inst: e,
              continue: !n.abort,
            }));
      }));
  }),
  ki = $constructor("$ZodCheckBigIntFormat", (e, n) => {
    Z.init(e, n);
    let [r, a] = Br[n.format];
    (e._zod.onattach.push((o) => {
      let i = o._zod.bag;
      ((i.format = n.format), (i.minimum = r), (i.maximum = a));
    }),
      (e._zod.check = (o) => {
        let i = o.value;
        (i < r &&
          o.issues.push({
            origin: "bigint",
            input: i,
            code: "too_small",
            minimum: r,
            inclusive: !0,
            inst: e,
            continue: !n.abort,
          }),
          i > a &&
            o.issues.push({
              origin: "bigint",
              input: i,
              code: "too_big",
              maximum: a,
              inclusive: !0,
              inst: e,
              continue: !n.abort,
            }));
      }));
  }),
  _i = $constructor("$ZodCheckMaxSize", (e, n) => {
    var r;
    (Z.init(e, n),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let o = a.value;
          return !nullish(o) && o.size !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let o = a._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        n.maximum < o && (a._zod.bag.maximum = n.maximum);
      }),
      (e._zod.check = (a) => {
        let o = a.value;
        o.size <= n.maximum ||
          a.issues.push({
            origin: getSizableOrigin(o),
            code: "too_big",
            maximum: n.maximum,
            inclusive: !0,
            input: o,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  xi = $constructor("$ZodCheckMinSize", (e, n) => {
    var r;
    (Z.init(e, n),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let o = a.value;
          return !nullish(o) && o.size !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let o = a._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        n.minimum > o && (a._zod.bag.minimum = n.minimum);
      }),
      (e._zod.check = (a) => {
        let o = a.value;
        o.size >= n.minimum ||
          a.issues.push({
            origin: getSizableOrigin(o),
            code: "too_small",
            minimum: n.minimum,
            inclusive: !0,
            input: o,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Ii = $constructor("$ZodCheckSizeEquals", (e, n) => {
    var r;
    (Z.init(e, n),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let o = a.value;
          return !nullish(o) && o.size !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let o = a._zod.bag;
        ((o.minimum = n.size), (o.maximum = n.size), (o.size = n.size));
      }),
      (e._zod.check = (a) => {
        let o = a.value,
          i = o.size;
        if (i === n.size) return;
        let c = i > n.size;
        a.issues.push({
          origin: getSizableOrigin(o),
          ...(c ? { code: "too_big", maximum: n.size } : { code: "too_small", minimum: n.size }),
          inclusive: !0,
          exact: !0,
          input: a.value,
          inst: e,
          continue: !n.abort,
        });
      }));
  }),
  Ci = $constructor("$ZodCheckMaxLength", (e, n) => {
    var r;
    (Z.init(e, n),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let o = a.value;
          return !nullish(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let o = a._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        n.maximum < o && (a._zod.bag.maximum = n.maximum);
      }),
      (e._zod.check = (a) => {
        let o = a.value;
        if (o.length <= n.maximum) return;
        let c = getLengthableOrigin(o);
        a.issues.push({
          origin: c,
          code: "too_big",
          maximum: n.maximum,
          inclusive: !0,
          input: o,
          inst: e,
          continue: !n.abort,
        });
      }));
  }),
  Ri = $constructor("$ZodCheckMinLength", (e, n) => {
    var r;
    (Z.init(e, n),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let o = a.value;
          return !nullish(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let o = a._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        n.minimum > o && (a._zod.bag.minimum = n.minimum);
      }),
      (e._zod.check = (a) => {
        let o = a.value;
        if (o.length >= n.minimum) return;
        let c = getLengthableOrigin(o);
        a.issues.push({
          origin: c,
          code: "too_small",
          minimum: n.minimum,
          inclusive: !0,
          input: o,
          inst: e,
          continue: !n.abort,
        });
      }));
  }),
  Pi = $constructor("$ZodCheckLengthEquals", (e, n) => {
    var r;
    (Z.init(e, n),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let o = a.value;
          return !nullish(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let o = a._zod.bag;
        ((o.minimum = n.length), (o.maximum = n.length), (o.length = n.length));
      }),
      (e._zod.check = (a) => {
        let o = a.value,
          i = o.length;
        if (i === n.length) return;
        let c = getLengthableOrigin(o),
          l = i > n.length;
        a.issues.push({
          origin: c,
          ...(l
            ? { code: "too_big", maximum: n.length }
            : { code: "too_small", minimum: n.length }),
          inclusive: !0,
          exact: !0,
          input: a.value,
          inst: e,
          continue: !n.abort,
        });
      }));
  }),
  at = $constructor("$ZodCheckStringFormat", (e, n) => {
    var r, a;
    (Z.init(e, n),
      e._zod.onattach.push((o) => {
        let i = o._zod.bag;
        ((i.format = n.format),
          n.pattern && (i.patterns ?? (i.patterns = new Set()), i.patterns.add(n.pattern)));
      }),
      n.pattern
        ? ((r = e._zod).check ??
          (r.check = (o) => {
            ((n.pattern.lastIndex = 0),
              !n.pattern.test(o.value) &&
                o.issues.push({
                  origin: "string",
                  code: "invalid_format",
                  format: n.format,
                  input: o.value,
                  ...(n.pattern ? { pattern: n.pattern.toString() } : {}),
                  inst: e,
                  continue: !n.abort,
                }));
          }))
        : ((a = e._zod).check ?? (a.check = () => {})));
  }),
  Ti = $constructor("$ZodCheckRegex", (e, n) => {
    (at.init(e, n),
      (e._zod.check = (r) => {
        ((n.pattern.lastIndex = 0),
          !n.pattern.test(r.value) &&
            r.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "regex",
              input: r.value,
              pattern: n.pattern.toString(),
              inst: e,
              continue: !n.abort,
            }));
      }));
  }),
  wi = $constructor("$ZodCheckLowerCase", (e, n) => {
    (n.pattern ?? (n.pattern = yi), at.init(e, n));
  }),
  Ei = $constructor("$ZodCheckUpperCase", (e, n) => {
    (n.pattern ?? (n.pattern = bi), at.init(e, n));
  }),
  Oi = $constructor("$ZodCheckIncludes", (e, n) => {
    Z.init(e, n);
    let r = escapeRegex(n.includes),
      a = new RegExp(typeof n.position == "number" ? `^.{${n.position}}${r}` : r);
    ((n.pattern = a),
      e._zod.onattach.push((o) => {
        let i = o._zod.bag;
        (i.patterns ?? (i.patterns = new Set()), i.patterns.add(a));
      }),
      (e._zod.check = (o) => {
        o.value.includes(n.includes, n.position) ||
          o.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "includes",
            includes: n.includes,
            input: o.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Ai = $constructor("$ZodCheckStartsWith", (e, n) => {
    Z.init(e, n);
    let r = new RegExp(`^${escapeRegex(n.prefix)}.*`);
    (n.pattern ?? (n.pattern = r),
      e._zod.onattach.push((a) => {
        let o = a._zod.bag;
        (o.patterns ?? (o.patterns = new Set()), o.patterns.add(r));
      }),
      (e._zod.check = (a) => {
        a.value.startsWith(n.prefix) ||
          a.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "starts_with",
            prefix: n.prefix,
            input: a.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  zi = $constructor("$ZodCheckEndsWith", (e, n) => {
    Z.init(e, n);
    let r = new RegExp(`.*${escapeRegex(n.suffix)}$`);
    (n.pattern ?? (n.pattern = r),
      e._zod.onattach.push((a) => {
        let o = a._zod.bag;
        (o.patterns ?? (o.patterns = new Set()), o.patterns.add(r));
      }),
      (e._zod.check = (a) => {
        a.value.endsWith(n.suffix) ||
          a.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "ends_with",
            suffix: n.suffix,
            input: a.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  });
function handleCheckPropertyResult(e, n, r) {
  e.issues.length && n.issues.push(...prefixIssues(r, e.issues));
}
s(handleCheckPropertyResult, "handleCheckPropertyResult");
var Mi = $constructor("$ZodCheckProperty", (e, n) => {
    (Z.init(e, n),
      (e._zod.check = (r) => {
        let a = n.schema._zod.run({ value: r.value[n.property], issues: [] }, {});
        if (a instanceof Promise) return a.then((o) => handleCheckPropertyResult(o, r, n.property));
        handleCheckPropertyResult(a, r, n.property);
      }));
  }),
  $i = $constructor("$ZodCheckMimeType", (e, n) => {
    Z.init(e, n);
    let r = new Set(n.mime);
    (e._zod.onattach.push((a) => {
      a._zod.bag.mime = n.mime;
    }),
      (e._zod.check = (a) => {
        r.has(a.value.type) ||
          a.issues.push({
            code: "invalid_value",
            values: n.mime,
            input: a.value.type,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Di = $constructor("$ZodCheckOverwrite", (e, n) => {
    (Z.init(e, n),
      (e._zod.check = (r) => {
        r.value = n.tx(r.value);
      }));
  });
var Xt = class {
  static {
    s(this, "Doc");
  }
  constructor(n = []) {
    ((this.content = []), (this.indent = 0), this && (this.args = n));
  }
  indented(n) {
    ((this.indent += 1), n(this), (this.indent -= 1));
  }
  write(n) {
    if (typeof n == "function") {
      (n(this, { execution: "sync" }), n(this, { execution: "async" }));
      return;
    }
    let a = n
        .split(
          `
`,
        )
        .filter((c) => c),
      o = Math.min(...a.map((c) => c.length - c.trimStart().length)),
      i = a.map((c) => c.slice(o)).map((c) => " ".repeat(this.indent * 2) + c);
    for (let c of i) this.content.push(c);
  }
  compile() {
    let n = Function,
      r = this?.args,
      o = [...(this?.content ?? [""]).map((i) => `  ${i}`)];
    return new n(
      ...r,
      o.join(`
`),
    );
  }
};
var Ui = { major: 4, minor: 3, patch: 6 };
var E = $constructor("$ZodType", (e, n) => {
    var r;
    (e ?? (e = {}), (e._zod.def = n), (e._zod.bag = e._zod.bag || {}), (e._zod.version = Ui));
    let a = [...(e._zod.def.checks ?? [])];
    e._zod.traits.has("$ZodCheck") && a.unshift(e);
    for (let o of a) for (let i of o._zod.onattach) i(e);
    if (a.length === 0)
      ((r = e._zod).deferred ?? (r.deferred = []),
        e._zod.deferred?.push(() => {
          e._zod.run = e._zod.parse;
        }));
    else {
      let o = s((c, l, p) => {
          let u = aborted(c),
            h;
          for (let S of l) {
            if (S._zod.def.when) {
              if (!S._zod.def.when(c)) continue;
            } else if (u) continue;
            let k = c.issues.length,
              I = S._zod.check(c);
            if (I instanceof Promise && p?.async === !1) throw new ue();
            if (h || I instanceof Promise)
              h = (h ?? Promise.resolve()).then(async () => {
                (await I, c.issues.length !== k && (u || (u = aborted(c, k))));
              });
            else {
              if (c.issues.length === k) continue;
              u || (u = aborted(c, k));
            }
          }
          return h ? h.then(() => c) : c;
        }, "runChecks"),
        i = s((c, l, p) => {
          if (aborted(c)) return ((c.aborted = !0), c);
          let u = o(l, a, p);
          if (u instanceof Promise) {
            if (p.async === !1) throw new ue();
            return u.then((h) => e._zod.parse(h, p));
          }
          return e._zod.parse(u, p);
        }, "handleCanaryResult");
      e._zod.run = (c, l) => {
        if (l.skipChecks) return e._zod.parse(c, l);
        if (l.direction === "backward") {
          let u = e._zod.parse({ value: c.value, issues: [] }, { ...l, skipChecks: !0 });
          return u instanceof Promise ? u.then((h) => i(h, c, l)) : i(u, c, l);
        }
        let p = e._zod.parse(c, l);
        if (p instanceof Promise) {
          if (l.async === !1) throw new ue();
          return p.then((u) => o(u, a, l));
        }
        return o(p, a, l);
      };
    }
    defineLazy(e, "~standard", () => ({
      validate: s((o) => {
        try {
          let i = Wr(e, o);
          return i.success ? { value: i.data } : { issues: i.error?.issues };
        } catch {
          return Fr(e, o).then((c) =>
            c.success ? { value: c.data } : { issues: c.error?.issues },
          );
        }
      }, "validate"),
      vendor: "zod",
      version: 1,
    }));
  }),
  je = $constructor("$ZodString", (e, n) => {
    (E.init(e, n),
      (e._zod.pattern = [...(e?._zod.bag?.patterns ?? [])].pop() ?? ui(e._zod.bag)),
      (e._zod.parse = (r, a) => {
        if (n.coerce)
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
  U = $constructor("$ZodStringFormat", (e, n) => {
    (at.init(e, n), je.init(e, n));
  }),
  Zi = $constructor("$ZodGUID", (e, n) => {
    (n.pattern ?? (n.pattern = Xr), U.init(e, n));
  }),
  Bi = $constructor("$ZodUUID", (e, n) => {
    if (n.version) {
      let a = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[n.version];
      if (a === void 0) throw new Error(`Invalid UUID version: "${n.version}"`);
      n.pattern ?? (n.pattern = Be(a));
    } else n.pattern ?? (n.pattern = Be());
    U.init(e, n);
  }),
  ji = $constructor("$ZodEmail", (e, n) => {
    (n.pattern ?? (n.pattern = Qr), U.init(e, n));
  }),
  Li = $constructor("$ZodURL", (e, n) => {
    (U.init(e, n),
      (e._zod.check = (r) => {
        try {
          let a = r.value.trim(),
            o = new URL(a);
          (n.hostname &&
            ((n.hostname.lastIndex = 0),
            n.hostname.test(o.hostname) ||
              r.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid hostname",
                pattern: n.hostname.source,
                input: r.value,
                inst: e,
                continue: !n.abort,
              })),
            n.protocol &&
              ((n.protocol.lastIndex = 0),
              n.protocol.test(o.protocol.endsWith(":") ? o.protocol.slice(0, -1) : o.protocol) ||
                r.issues.push({
                  code: "invalid_format",
                  format: "url",
                  note: "Invalid protocol",
                  pattern: n.protocol.source,
                  input: r.value,
                  inst: e,
                  continue: !n.abort,
                })),
            n.normalize ? (r.value = o.href) : (r.value = a));
          return;
        } catch {
          r.issues.push({
            code: "invalid_format",
            format: "url",
            input: r.value,
            inst: e,
            continue: !n.abort,
          });
        }
      }));
  }),
  Wi = $constructor("$ZodEmoji", (e, n) => {
    (n.pattern ?? (n.pattern = emoji()), U.init(e, n));
  }),
  Fi = $constructor("$ZodNanoID", (e, n) => {
    (n.pattern ?? (n.pattern = Jr), U.init(e, n));
  }),
  qi = $constructor("$ZodCUID", (e, n) => {
    (n.pattern ?? (n.pattern = qr), U.init(e, n));
  }),
  Vi = $constructor("$ZodCUID2", (e, n) => {
    (n.pattern ?? (n.pattern = Vr), U.init(e, n));
  }),
  Gi = $constructor("$ZodULID", (e, n) => {
    (n.pattern ?? (n.pattern = Gr), U.init(e, n));
  }),
  Ki = $constructor("$ZodXID", (e, n) => {
    (n.pattern ?? (n.pattern = Kr), U.init(e, n));
  }),
  Hi = $constructor("$ZodKSUID", (e, n) => {
    (n.pattern ?? (n.pattern = Hr), U.init(e, n));
  }),
  Ji = $constructor("$ZodISODateTime", (e, n) => {
    (n.pattern ?? (n.pattern = datetime(n)), U.init(e, n));
  }),
  Yi = $constructor("$ZodISODate", (e, n) => {
    (n.pattern ?? (n.pattern = ci), U.init(e, n));
  }),
  Xi = $constructor("$ZodISOTime", (e, n) => {
    (n.pattern ?? (n.pattern = time(n)), U.init(e, n));
  }),
  Qi = $constructor("$ZodISODuration", (e, n) => {
    (n.pattern ?? (n.pattern = Yr), U.init(e, n));
  }),
  ea = $constructor("$ZodIPv4", (e, n) => {
    (n.pattern ?? (n.pattern = ti), U.init(e, n), (e._zod.bag.format = "ipv4"));
  }),
  ta = $constructor("$ZodIPv6", (e, n) => {
    (n.pattern ?? (n.pattern = oi),
      U.init(e, n),
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
            continue: !n.abort,
          });
        }
      }));
  }),
  oa = $constructor("$ZodMAC", (e, n) => {
    (n.pattern ?? (n.pattern = ni(n.delimiter)), U.init(e, n), (e._zod.bag.format = "mac"));
  }),
  na = $constructor("$ZodCIDRv4", (e, n) => {
    (n.pattern ?? (n.pattern = ri), U.init(e, n));
  }),
  ra = $constructor("$ZodCIDRv6", (e, n) => {
    (n.pattern ?? (n.pattern = ii),
      U.init(e, n),
      (e._zod.check = (r) => {
        let a = r.value.split("/");
        try {
          if (a.length !== 2) throw new Error();
          let [o, i] = a;
          if (!i) throw new Error();
          let c = Number(i);
          if (`${c}` !== i) throw new Error();
          if (c < 0 || c > 128) throw new Error();
          new URL(`http://[${o}]`);
        } catch {
          r.issues.push({
            code: "invalid_format",
            format: "cidrv6",
            input: r.value,
            inst: e,
            continue: !n.abort,
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
var aa = $constructor("$ZodBase64", (e, n) => {
  (n.pattern ?? (n.pattern = ai),
    U.init(e, n),
    (e._zod.bag.contentEncoding = "base64"),
    (e._zod.check = (r) => {
      isValidBase64(r.value) ||
        r.issues.push({
          code: "invalid_format",
          format: "base64",
          input: r.value,
          inst: e,
          continue: !n.abort,
        });
    }));
});
function isValidBase64URL(e) {
  if (!Fo.test(e)) return !1;
  let n = e.replace(/[-_]/g, (a) => (a === "-" ? "+" : "/")),
    r = n.padEnd(Math.ceil(n.length / 4) * 4, "=");
  return isValidBase64(r);
}
s(isValidBase64URL, "isValidBase64URL");
var sa = $constructor("$ZodBase64URL", (e, n) => {
    (n.pattern ?? (n.pattern = Fo),
      U.init(e, n),
      (e._zod.bag.contentEncoding = "base64url"),
      (e._zod.check = (r) => {
        isValidBase64URL(r.value) ||
          r.issues.push({
            code: "invalid_format",
            format: "base64url",
            input: r.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  ca = $constructor("$ZodE164", (e, n) => {
    (n.pattern ?? (n.pattern = si), U.init(e, n));
  });
function isValidJWT(e, n = null) {
  try {
    let r = e.split(".");
    if (r.length !== 3) return !1;
    let [a] = r;
    if (!a) return !1;
    let o = JSON.parse(atob(a));
    return !(("typ" in o && o?.typ !== "JWT") || !o.alg || (n && (!("alg" in o) || o.alg !== n)));
  } catch {
    return !1;
  }
}
s(isValidJWT, "isValidJWT");
var la = $constructor("$ZodJWT", (e, n) => {
    (U.init(e, n),
      (e._zod.check = (r) => {
        isValidJWT(r.value, n.alg) ||
          r.issues.push({
            code: "invalid_format",
            format: "jwt",
            input: r.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  da = $constructor("$ZodCustomStringFormat", (e, n) => {
    (U.init(e, n),
      (e._zod.check = (r) => {
        n.fn(r.value) ||
          r.issues.push({
            code: "invalid_format",
            format: n.format,
            input: r.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Qo = $constructor("$ZodNumber", (e, n) => {
    (E.init(e, n),
      (e._zod.pattern = e._zod.bag.pattern ?? qo),
      (e._zod.parse = (r, a) => {
        if (n.coerce)
          try {
            r.value = Number(r.value);
          } catch {}
        let o = r.value;
        if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o)) return r;
        let i =
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
            ...(i ? { received: i } : {}),
          }),
          r
        );
      }));
  }),
  ua = $constructor("$ZodNumberFormat", (e, n) => {
    (Si.init(e, n), Qo.init(e, n));
  }),
  Qt = $constructor("$ZodBoolean", (e, n) => {
    (E.init(e, n),
      (e._zod.pattern = gi),
      (e._zod.parse = (r, a) => {
        if (n.coerce)
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
  en = $constructor("$ZodBigInt", (e, n) => {
    (E.init(e, n),
      (e._zod.pattern = pi),
      (e._zod.parse = (r, a) => {
        if (n.coerce)
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
  pa = $constructor("$ZodBigIntFormat", (e, n) => {
    (ki.init(e, n), en.init(e, n));
  }),
  ma = $constructor("$ZodSymbol", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) => {
        let o = r.value;
        return (
          typeof o == "symbol" ||
            r.issues.push({ expected: "symbol", code: "invalid_type", input: o, inst: e }),
          r
        );
      }));
  }),
  ga = $constructor("$ZodUndefined", (e, n) => {
    (E.init(e, n),
      (e._zod.pattern = hi),
      (e._zod.values = new Set([void 0])),
      (e._zod.optin = "optional"),
      (e._zod.optout = "optional"),
      (e._zod.parse = (r, a) => {
        let o = r.value;
        return (
          typeof o > "u" ||
            r.issues.push({ expected: "undefined", code: "invalid_type", input: o, inst: e }),
          r
        );
      }));
  }),
  fa = $constructor("$ZodNull", (e, n) => {
    (E.init(e, n),
      (e._zod.pattern = fi),
      (e._zod.values = new Set([null])),
      (e._zod.parse = (r, a) => {
        let o = r.value;
        return (
          o === null ||
            r.issues.push({ expected: "null", code: "invalid_type", input: o, inst: e }),
          r
        );
      }));
  }),
  ha = $constructor("$ZodAny", (e, n) => {
    (E.init(e, n), (e._zod.parse = (r) => r));
  }),
  ya = $constructor("$ZodUnknown", (e, n) => {
    (E.init(e, n), (e._zod.parse = (r) => r));
  }),
  ba = $constructor("$ZodNever", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) => (
        r.issues.push({ expected: "never", code: "invalid_type", input: r.value, inst: e }),
        r
      )));
  }),
  va = $constructor("$ZodVoid", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) => {
        let o = r.value;
        return (
          typeof o > "u" ||
            r.issues.push({ expected: "void", code: "invalid_type", input: o, inst: e }),
          r
        );
      }));
  }),
  Sa = $constructor("$ZodDate", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) => {
        if (n.coerce)
          try {
            r.value = new Date(r.value);
          } catch {}
        let o = r.value,
          i = o instanceof Date;
        return (
          (i && !Number.isNaN(o.getTime())) ||
            r.issues.push({
              expected: "date",
              code: "invalid_type",
              input: o,
              ...(i ? { received: "Invalid Date" } : {}),
              inst: e,
            }),
          r
        );
      }));
  });
function handleArrayResult(e, n, r) {
  (e.issues.length && n.issues.push(...prefixIssues(r, e.issues)), (n.value[r] = e.value));
}
s(handleArrayResult, "handleArrayResult");
var ka = $constructor("$ZodArray", (e, n) => {
  (E.init(e, n),
    (e._zod.parse = (r, a) => {
      let o = r.value;
      if (!Array.isArray(o))
        return (r.issues.push({ expected: "array", code: "invalid_type", input: o, inst: e }), r);
      r.value = Array(o.length);
      let i = [];
      for (let c = 0; c < o.length; c++) {
        let l = o[c],
          p = n.element._zod.run({ value: l, issues: [] }, a);
        p instanceof Promise ? i.push(p.then((u) => handleArrayResult(u, r, c))) : handleArrayResult(p, r, c);
      }
      return i.length ? Promise.all(i).then(() => r) : r;
    }));
});
function handlePropertyResult(e, n, r, a, o) {
  if (e.issues.length) {
    if (o && !(r in a)) return;
    n.issues.push(...prefixIssues(r, e.issues));
  }
  e.value === void 0 ? r in a && (n.value[r] = void 0) : (n.value[r] = e.value);
}
s(handlePropertyResult, "handlePropertyResult");
function normalizeDef(e) {
  let n = Object.keys(e.shape);
  for (let a of n)
    if (!e.shape?.[a]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  let r = optionalKeys(e.shape);
  return { ...e, keys: n, keySet: new Set(n), numKeys: n.length, optionalKeys: new Set(r) };
}
s(normalizeDef, "normalizeDef");
function handleCatchall(e, n, r, a, o, i) {
  let c = [],
    l = o.keySet,
    p = o.catchall._zod,
    u = p.def.type,
    h = p.optout === "optional";
  for (let S in n) {
    if (l.has(S)) continue;
    if (u === "never") {
      c.push(S);
      continue;
    }
    let k = p.run({ value: n[S], issues: [] }, a);
    k instanceof Promise ? e.push(k.then((I) => handlePropertyResult(I, r, S, n, h))) : handlePropertyResult(k, r, S, n, h);
  }
  return (
    c.length && r.issues.push({ code: "unrecognized_keys", keys: c, input: n, inst: i }),
    e.length ? Promise.all(e).then(() => r) : r
  );
}
s(handleCatchall, "handleCatchall");
var Vu = $constructor("$ZodObject", (e, n) => {
    if ((E.init(e, n), !Object.getOwnPropertyDescriptor(n, "shape")?.get)) {
      let l = n.shape;
      Object.defineProperty(n, "shape", {
        get: s(() => {
          let p = { ...l };
          return (Object.defineProperty(n, "shape", { value: p }), p);
        }, "get"),
      });
    }
    let a = cached(() => normalizeDef(n));
    defineLazy(e._zod, "propValues", () => {
      let l = n.shape,
        p = {};
      for (let u in l) {
        let h = l[u]._zod;
        if (h.values) {
          p[u] ?? (p[u] = new Set());
          for (let S of h.values) p[u].add(S);
        }
      }
      return p;
    });
    let o = isObject,
      i = n.catchall,
      c;
    e._zod.parse = (l, p) => {
      c ?? (c = a.value);
      let u = l.value;
      if (!o(u))
        return (l.issues.push({ expected: "object", code: "invalid_type", input: u, inst: e }), l);
      l.value = {};
      let h = [],
        S = c.shape;
      for (let k of c.keys) {
        let I = S[k],
          $ = I._zod.optout === "optional",
          B = I._zod.run({ value: u[k], issues: [] }, p);
        B instanceof Promise ? h.push(B.then((Xe) => handlePropertyResult(Xe, l, k, u, $))) : handlePropertyResult(B, l, k, u, $);
      }
      return i ? handleCatchall(h, u, l, p, a.value, e) : h.length ? Promise.all(h).then(() => l) : l;
    };
  }),
  _a = $constructor("$ZodObjectJIT", (e, n) => {
    Vu.init(e, n);
    let r = e._zod.parse,
      a = cached(() => normalizeDef(n)),
      o = s((k) => {
        let I = new Xt(["shape", "payload", "ctx"]),
          $ = a.value,
          B = s((me) => {
            let X = esc(me);
            return `shape[${X}]._zod.run({ value: input[${X}], issues: [] }, ctx)`;
          }, "parseStr");
        I.write("const input = payload.value;");
        let Xe = Object.create(null),
          _f = 0;
        for (let me of $.keys) Xe[me] = `key_${_f++}`;
        I.write("const newResult = {};");
        for (let me of $.keys) {
          let X = Xe[me],
            de = esc(me),
            If = k[me]?._zod?.optout === "optional";
          (I.write(`const ${X} = ${B(me)};`),
            If
              ? I.write(`
        if (${X}.issues.length) {
          if (${de} in input) {
            payload.issues = payload.issues.concat(${X}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${de}, ...iss.path] : [${de}]
            })));
          }
        }
        
        if (${X}.value === undefined) {
          if (${de} in input) {
            newResult[${de}] = undefined;
          }
        } else {
          newResult[${de}] = ${X}.value;
        }
        
      `)
              : I.write(`
        if (${X}.issues.length) {
          payload.issues = payload.issues.concat(${X}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${de}, ...iss.path] : [${de}]
          })));
        }
        
        if (${X}.value === undefined) {
          if (${de} in input) {
            newResult[${de}] = undefined;
          }
        } else {
          newResult[${de}] = ${X}.value;
        }
        
      `));
        }
        (I.write("payload.value = newResult;"), I.write("return payload;"));
        let xf = I.compile();
        return (me, X) => xf(k, me, X);
      }, "generateFastpass"),
      i,
      c = isObject,
      l = !Bt.jitless,
      u = l && $r.value,
      h = n.catchall,
      S;
    e._zod.parse = (k, I) => {
      S ?? (S = a.value);
      let $ = k.value;
      return c($)
        ? l && u && I?.async === !1 && I.jitless !== !0
          ? (i || (i = o(n.shape)), (k = i(k, I)), h ? handleCatchall([], $, k, I, S, e) : k)
          : r(k, I)
        : (k.issues.push({ expected: "object", code: "invalid_type", input: $, inst: e }), k);
    };
  });
function handleUnionResults(e, n, r, a) {
  for (let i of e) if (i.issues.length === 0) return ((n.value = i.value), n);
  let o = e.filter((i) => !aborted(i));
  return o.length === 1
    ? ((n.value = o[0].value), o[0])
    : (n.issues.push({
        code: "invalid_union",
        input: n.value,
        inst: r,
        errors: e.map((i) => i.issues.map((c) => finalizeIssue(c, a, config()))),
      }),
      n);
}
s(handleUnionResults, "handleUnionResults");
var eo = $constructor("$ZodUnion", (e, n) => {
  (E.init(e, n),
    defineLazy(e._zod, "optin", () =>
      n.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0,
    ),
    defineLazy(e._zod, "optout", () =>
      n.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0,
    ),
    defineLazy(e._zod, "values", () => {
      if (n.options.every((o) => o._zod.values))
        return new Set(n.options.flatMap((o) => Array.from(o._zod.values)));
    }),
    defineLazy(e._zod, "pattern", () => {
      if (n.options.every((o) => o._zod.pattern)) {
        let o = n.options.map((i) => i._zod.pattern);
        return new RegExp(`^(${o.map((i) => cleanRegex(i.source)).join("|")})$`);
      }
    }));
  let r = n.options.length === 1,
    a = n.options[0]._zod.run;
  e._zod.parse = (o, i) => {
    if (r) return a(o, i);
    let c = !1,
      l = [];
    for (let p of n.options) {
      let u = p._zod.run({ value: o.value, issues: [] }, i);
      if (u instanceof Promise) (l.push(u), (c = !0));
      else {
        if (u.issues.length === 0) return u;
        l.push(u);
      }
    }
    return c ? Promise.all(l).then((p) => handleUnionResults(p, o, e, i)) : handleUnionResults(l, o, e, i);
  };
});
function handleExclusiveUnionResults(e, n, r, a) {
  let o = e.filter((i) => i.issues.length === 0);
  return o.length === 1
    ? ((n.value = o[0].value), n)
    : (o.length === 0
        ? n.issues.push({
            code: "invalid_union",
            input: n.value,
            inst: r,
            errors: e.map((i) => i.issues.map((c) => finalizeIssue(c, a, config()))),
          })
        : n.issues.push({
            code: "invalid_union",
            input: n.value,
            inst: r,
            errors: [],
            inclusive: !1,
          }),
      n);
}
s(handleExclusiveUnionResults, "handleExclusiveUnionResults");
var xa = $constructor("$ZodXor", (e, n) => {
    (eo.init(e, n), (n.inclusive = !1));
    let r = n.options.length === 1,
      a = n.options[0]._zod.run;
    e._zod.parse = (o, i) => {
      if (r) return a(o, i);
      let c = !1,
        l = [];
      for (let p of n.options) {
        let u = p._zod.run({ value: o.value, issues: [] }, i);
        u instanceof Promise ? (l.push(u), (c = !0)) : l.push(u);
      }
      return c ? Promise.all(l).then((p) => handleExclusiveUnionResults(p, o, e, i)) : handleExclusiveUnionResults(l, o, e, i);
    };
  }),
  Ia = $constructor("$ZodDiscriminatedUnion", (e, n) => {
    ((n.inclusive = !1), eo.init(e, n));
    let r = e._zod.parse;
    defineLazy(e._zod, "propValues", () => {
      let o = {};
      for (let i of n.options) {
        let c = i._zod.propValues;
        if (!c || Object.keys(c).length === 0)
          throw new Error(`Invalid discriminated union option at index "${n.options.indexOf(i)}"`);
        for (let [l, p] of Object.entries(c)) {
          o[l] || (o[l] = new Set());
          for (let u of p) o[l].add(u);
        }
      }
      return o;
    });
    let a = cached(() => {
      let o = n.options,
        i = new Map();
      for (let c of o) {
        let l = c._zod.propValues?.[n.discriminator];
        if (!l || l.size === 0)
          throw new Error(`Invalid discriminated union option at index "${n.options.indexOf(c)}"`);
        for (let p of l) {
          if (i.has(p)) throw new Error(`Duplicate discriminator value "${String(p)}"`);
          i.set(p, c);
        }
      }
      return i;
    });
    e._zod.parse = (o, i) => {
      let c = o.value;
      if (!isObject(c))
        return (o.issues.push({ code: "invalid_type", expected: "object", input: c, inst: e }), o);
      let l = a.value.get(c?.[n.discriminator]);
      return l
        ? l._zod.run(o, i)
        : n.unionFallback
          ? r(o, i)
          : (o.issues.push({
              code: "invalid_union",
              errors: [],
              note: "No matching discriminator",
              discriminator: n.discriminator,
              input: c,
              path: [n.discriminator],
              inst: e,
            }),
            o);
    };
  }),
  Ca = $constructor("$ZodIntersection", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) => {
        let o = r.value,
          i = n.left._zod.run({ value: o, issues: [] }, a),
          c = n.right._zod.run({ value: o, issues: [] }, a);
        return i instanceof Promise || c instanceof Promise
          ? Promise.all([i, c]).then(([p, u]) => handleIntersectionResults(r, p, u))
          : handleIntersectionResults(r, i, c);
      }));
  });
function mergeValues(e, n) {
  if (e === n) return { valid: !0, data: e };
  if (e instanceof Date && n instanceof Date && +e == +n) return { valid: !0, data: e };
  if (isPlainObject(e) && isPlainObject(n)) {
    let r = Object.keys(n),
      a = Object.keys(e).filter((i) => r.indexOf(i) !== -1),
      o = { ...e, ...n };
    for (let i of a) {
      let c = mergeValues(e[i], n[i]);
      if (!c.valid) return { valid: !1, mergeErrorPath: [i, ...c.mergeErrorPath] };
      o[i] = c.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(n)) {
    if (e.length !== n.length) return { valid: !1, mergeErrorPath: [] };
    let r = [];
    for (let a = 0; a < e.length; a++) {
      let o = e[a],
        i = n[a],
        c = mergeValues(o, i);
      if (!c.valid) return { valid: !1, mergeErrorPath: [a, ...c.mergeErrorPath] };
      r.push(c.data);
    }
    return { valid: !0, data: r };
  }
  return { valid: !1, mergeErrorPath: [] };
}
s(mergeValues, "mergeValues");
function handleIntersectionResults(e, n, r) {
  let a = new Map(),
    o;
  for (let l of n.issues)
    if (l.code === "unrecognized_keys") {
      o ?? (o = l);
      for (let p of l.keys) (a.has(p) || a.set(p, {}), (a.get(p).l = !0));
    } else e.issues.push(l);
  for (let l of r.issues)
    if (l.code === "unrecognized_keys")
      for (let p of l.keys) (a.has(p) || a.set(p, {}), (a.get(p).r = !0));
    else e.issues.push(l);
  let i = [...a].filter(([, l]) => l.l && l.r).map(([l]) => l);
  if ((i.length && o && e.issues.push({ ...o, keys: i }), aborted(e))) return e;
  let c = mergeValues(n.value, r.value);
  if (!c.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
  return ((e.value = c.data), e);
}
s(handleIntersectionResults, "handleIntersectionResults");
var tn = $constructor("$ZodTuple", (e, n) => {
  E.init(e, n);
  let r = n.items;
  e._zod.parse = (a, o) => {
    let i = a.value;
    if (!Array.isArray(i))
      return (a.issues.push({ input: i, inst: e, expected: "tuple", code: "invalid_type" }), a);
    a.value = [];
    let c = [],
      l = [...r].reverse().findIndex((h) => h._zod.optin !== "optional"),
      p = l === -1 ? 0 : r.length - l;
    if (!n.rest) {
      let h = i.length > r.length,
        S = i.length < p - 1;
      if (h || S)
        return (
          a.issues.push({
            ...(h
              ? { code: "too_big", maximum: r.length, inclusive: !0 }
              : { code: "too_small", minimum: r.length }),
            input: i,
            inst: e,
            origin: "array",
          }),
          a
        );
    }
    let u = -1;
    for (let h of r) {
      if ((u++, u >= i.length && u >= p)) continue;
      let S = h._zod.run({ value: i[u], issues: [] }, o);
      S instanceof Promise ? c.push(S.then((k) => handleTupleResult(k, a, u))) : handleTupleResult(S, a, u);
    }
    if (n.rest) {
      let h = i.slice(r.length);
      for (let S of h) {
        u++;
        let k = n.rest._zod.run({ value: S, issues: [] }, o);
        k instanceof Promise ? c.push(k.then((I) => handleTupleResult(I, a, u))) : handleTupleResult(k, a, u);
      }
    }
    return c.length ? Promise.all(c).then(() => a) : a;
  };
});
function handleTupleResult(e, n, r) {
  (e.issues.length && n.issues.push(...prefixIssues(r, e.issues)), (n.value[r] = e.value));
}
s(handleTupleResult, "handleTupleResult");
var Ra = $constructor("$ZodRecord", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) => {
        let o = r.value;
        if (!isPlainObject(o))
          return (
            r.issues.push({ expected: "record", code: "invalid_type", input: o, inst: e }),
            r
          );
        let i = [],
          c = n.keyType._zod.values;
        if (c) {
          r.value = {};
          let l = new Set();
          for (let u of c)
            if (typeof u == "string" || typeof u == "number" || typeof u == "symbol") {
              l.add(typeof u == "number" ? u.toString() : u);
              let h = n.valueType._zod.run({ value: o[u], issues: [] }, a);
              h instanceof Promise
                ? i.push(
                    h.then((S) => {
                      (S.issues.length && r.issues.push(...prefixIssues(u, S.issues)),
                        (r.value[u] = S.value));
                    }),
                  )
                : (h.issues.length && r.issues.push(...prefixIssues(u, h.issues)), (r.value[u] = h.value));
            }
          let p;
          for (let u in o) l.has(u) || ((p = p ?? []), p.push(u));
          p &&
            p.length > 0 &&
            r.issues.push({ code: "unrecognized_keys", input: o, inst: e, keys: p });
        } else {
          r.value = {};
          for (let l of Reflect.ownKeys(o)) {
            if (l === "__proto__") continue;
            let p = n.keyType._zod.run({ value: l, issues: [] }, a);
            if (p instanceof Promise)
              throw new Error("Async schemas not supported in object keys currently");
            if (typeof l == "string" && qo.test(l) && p.issues.length) {
              let S = n.keyType._zod.run({ value: Number(l), issues: [] }, a);
              if (S instanceof Promise)
                throw new Error("Async schemas not supported in object keys currently");
              S.issues.length === 0 && (p = S);
            }
            if (p.issues.length) {
              n.mode === "loose"
                ? (r.value[l] = o[l])
                : r.issues.push({
                    code: "invalid_key",
                    origin: "record",
                    issues: p.issues.map((S) => finalizeIssue(S, a, config())),
                    input: l,
                    path: [l],
                    inst: e,
                  });
              continue;
            }
            let h = n.valueType._zod.run({ value: o[l], issues: [] }, a);
            h instanceof Promise
              ? i.push(
                  h.then((S) => {
                    (S.issues.length && r.issues.push(...prefixIssues(l, S.issues)),
                      (r.value[p.value] = S.value));
                  }),
                )
              : (h.issues.length && r.issues.push(...prefixIssues(l, h.issues)),
                (r.value[p.value] = h.value));
          }
        }
        return i.length ? Promise.all(i).then(() => r) : r;
      }));
  }),
  Pa = $constructor("$ZodMap", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) => {
        let o = r.value;
        if (!(o instanceof Map))
          return (r.issues.push({ expected: "map", code: "invalid_type", input: o, inst: e }), r);
        let i = [];
        r.value = new Map();
        for (let [c, l] of o) {
          let p = n.keyType._zod.run({ value: c, issues: [] }, a),
            u = n.valueType._zod.run({ value: l, issues: [] }, a);
          p instanceof Promise || u instanceof Promise
            ? i.push(
                Promise.all([p, u]).then(([h, S]) => {
                  handleMapResult(h, S, r, c, o, e, a);
                }),
              )
            : handleMapResult(p, u, r, c, o, e, a);
        }
        return i.length ? Promise.all(i).then(() => r) : r;
      }));
  });
function handleMapResult(e, n, r, a, o, i, c) {
  (e.issues.length &&
    (Ft.has(typeof a)
      ? r.issues.push(...prefixIssues(a, e.issues))
      : r.issues.push({
          code: "invalid_key",
          origin: "map",
          input: o,
          inst: i,
          issues: e.issues.map((l) => finalizeIssue(l, c, config())),
        })),
    n.issues.length &&
      (Ft.has(typeof a)
        ? r.issues.push(...prefixIssues(a, n.issues))
        : r.issues.push({
            origin: "map",
            code: "invalid_element",
            input: o,
            inst: i,
            key: a,
            issues: n.issues.map((l) => finalizeIssue(l, c, config())),
          })),
    r.value.set(e.value, n.value));
}
s(handleMapResult, "handleMapResult");
var Ta = $constructor("$ZodSet", (e, n) => {
  (E.init(e, n),
    (e._zod.parse = (r, a) => {
      let o = r.value;
      if (!(o instanceof Set))
        return (r.issues.push({ input: o, inst: e, expected: "set", code: "invalid_type" }), r);
      let i = [];
      r.value = new Set();
      for (let c of o) {
        let l = n.valueType._zod.run({ value: c, issues: [] }, a);
        l instanceof Promise ? i.push(l.then((p) => handleSetResult(p, r))) : handleSetResult(l, r);
      }
      return i.length ? Promise.all(i).then(() => r) : r;
    }));
});
function handleSetResult(e, n) {
  (e.issues.length && n.issues.push(...e.issues), n.value.add(e.value));
}
s(handleSetResult, "handleSetResult");
var wa = $constructor("$ZodEnum", (e, n) => {
    E.init(e, n);
    let r = getEnumValues(n.entries),
      a = new Set(r);
    ((e._zod.values = a),
      (e._zod.pattern = new RegExp(
        `^(${r
          .filter((o) => Ft.has(typeof o))
          .map((o) => (typeof o == "string" ? escapeRegex(o) : o.toString()))
          .join("|")})$`,
      )),
      (e._zod.parse = (o, i) => {
        let c = o.value;
        return (
          a.has(c) || o.issues.push({ code: "invalid_value", values: r, input: c, inst: e }),
          o
        );
      }));
  }),
  Ea = $constructor("$ZodLiteral", (e, n) => {
    if ((E.init(e, n), n.values.length === 0))
      throw new Error("Cannot create literal schema with no valid values");
    let r = new Set(n.values);
    ((e._zod.values = r),
      (e._zod.pattern = new RegExp(
        `^(${n.values.map((a) => (typeof a == "string" ? escapeRegex(a) : a ? escapeRegex(a.toString()) : String(a))).join("|")})$`,
      )),
      (e._zod.parse = (a, o) => {
        let i = a.value;
        return (
          r.has(i) || a.issues.push({ code: "invalid_value", values: n.values, input: i, inst: e }),
          a
        );
      }));
  }),
  Oa = $constructor("$ZodFile", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) => {
        let o = r.value;
        return (
          o instanceof File ||
            r.issues.push({ expected: "file", code: "invalid_type", input: o, inst: e }),
          r
        );
      }));
  }),
  Aa = $constructor("$ZodTransform", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) => {
        if (a.direction === "backward") throw new Re(e.constructor.name);
        let o = n.transform(r.value, r);
        if (a.async)
          return (o instanceof Promise ? o : Promise.resolve(o)).then((c) => ((r.value = c), r));
        if (o instanceof Promise) throw new ue();
        return ((r.value = o), r);
      }));
  });
function handleOptionalResult(e, n) {
  return e.issues.length && n === void 0 ? { issues: [], value: void 0 } : e;
}
s(handleOptionalResult, "handleOptionalResult");
var on = $constructor("$ZodOptional", (e, n) => {
    (E.init(e, n),
      (e._zod.optin = "optional"),
      (e._zod.optout = "optional"),
      defineLazy(e._zod, "values", () =>
        n.innerType._zod.values ? new Set([...n.innerType._zod.values, void 0]) : void 0,
      ),
      defineLazy(e._zod, "pattern", () => {
        let r = n.innerType._zod.pattern;
        return r ? new RegExp(`^(${cleanRegex(r.source)})?$`) : void 0;
      }),
      (e._zod.parse = (r, a) => {
        if (n.innerType._zod.optin === "optional") {
          let o = n.innerType._zod.run(r, a);
          return o instanceof Promise ? o.then((i) => handleOptionalResult(i, r.value)) : handleOptionalResult(o, r.value);
        }
        return r.value === void 0 ? r : n.innerType._zod.run(r, a);
      }));
  }),
  za = $constructor("$ZodExactOptional", (e, n) => {
    (on.init(e, n),
      defineLazy(e._zod, "values", () => n.innerType._zod.values),
      defineLazy(e._zod, "pattern", () => n.innerType._zod.pattern),
      (e._zod.parse = (r, a) => n.innerType._zod.run(r, a)));
  }),
  Ma = $constructor("$ZodNullable", (e, n) => {
    (E.init(e, n),
      defineLazy(e._zod, "optin", () => n.innerType._zod.optin),
      defineLazy(e._zod, "optout", () => n.innerType._zod.optout),
      defineLazy(e._zod, "pattern", () => {
        let r = n.innerType._zod.pattern;
        return r ? new RegExp(`^(${cleanRegex(r.source)}|null)$`) : void 0;
      }),
      defineLazy(e._zod, "values", () =>
        n.innerType._zod.values ? new Set([...n.innerType._zod.values, null]) : void 0,
      ),
      (e._zod.parse = (r, a) => (r.value === null ? r : n.innerType._zod.run(r, a))));
  }),
  $a = $constructor("$ZodDefault", (e, n) => {
    (E.init(e, n),
      (e._zod.optin = "optional"),
      defineLazy(e._zod, "values", () => n.innerType._zod.values),
      (e._zod.parse = (r, a) => {
        if (a.direction === "backward") return n.innerType._zod.run(r, a);
        if (r.value === void 0) return ((r.value = n.defaultValue), r);
        let o = n.innerType._zod.run(r, a);
        return o instanceof Promise ? o.then((i) => handleDefaultResult(i, n)) : handleDefaultResult(o, n);
      }));
  });
function handleDefaultResult(e, n) {
  return (e.value === void 0 && (e.value = n.defaultValue), e);
}
s(handleDefaultResult, "handleDefaultResult");
var Da = $constructor("$ZodPrefault", (e, n) => {
    (E.init(e, n),
      (e._zod.optin = "optional"),
      defineLazy(e._zod, "values", () => n.innerType._zod.values),
      (e._zod.parse = (r, a) => (
        a.direction === "backward" || (r.value === void 0 && (r.value = n.defaultValue)),
        n.innerType._zod.run(r, a)
      )));
  }),
  Ua = $constructor("$ZodNonOptional", (e, n) => {
    (E.init(e, n),
      defineLazy(e._zod, "values", () => {
        let r = n.innerType._zod.values;
        return r ? new Set([...r].filter((a) => a !== void 0)) : void 0;
      }),
      (e._zod.parse = (r, a) => {
        let o = n.innerType._zod.run(r, a);
        return o instanceof Promise ? o.then((i) => handleNonOptionalResult(i, e)) : handleNonOptionalResult(o, e);
      }));
  });
function handleNonOptionalResult(e, n) {
  return (
    !e.issues.length &&
      e.value === void 0 &&
      e.issues.push({ code: "invalid_type", expected: "nonoptional", input: e.value, inst: n }),
    e
  );
}
s(handleNonOptionalResult, "handleNonOptionalResult");
var Na = $constructor("$ZodSuccess", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) => {
        if (a.direction === "backward") throw new Re("ZodSuccess");
        let o = n.innerType._zod.run(r, a);
        return o instanceof Promise
          ? o.then((i) => ((r.value = i.issues.length === 0), r))
          : ((r.value = o.issues.length === 0), r);
      }));
  }),
  Za = $constructor("$ZodCatch", (e, n) => {
    (E.init(e, n),
      defineLazy(e._zod, "optin", () => n.innerType._zod.optin),
      defineLazy(e._zod, "optout", () => n.innerType._zod.optout),
      defineLazy(e._zod, "values", () => n.innerType._zod.values),
      (e._zod.parse = (r, a) => {
        if (a.direction === "backward") return n.innerType._zod.run(r, a);
        let o = n.innerType._zod.run(r, a);
        return o instanceof Promise
          ? o.then(
              (i) => (
                (r.value = i.value),
                i.issues.length &&
                  ((r.value = n.catchValue({
                    ...r,
                    error: { issues: i.issues.map((c) => finalizeIssue(c, a, config())) },
                    input: r.value,
                  })),
                  (r.issues = [])),
                r
              ),
            )
          : ((r.value = o.value),
            o.issues.length &&
              ((r.value = n.catchValue({
                ...r,
                error: { issues: o.issues.map((i) => finalizeIssue(i, a, config())) },
                input: r.value,
              })),
              (r.issues = [])),
            r);
      }));
  }),
  Ba = $constructor("$ZodNaN", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) => (
        (typeof r.value != "number" || !Number.isNaN(r.value)) &&
          r.issues.push({ input: r.value, inst: e, expected: "nan", code: "invalid_type" }),
        r
      )));
  }),
  ja = $constructor("$ZodPipe", (e, n) => {
    (E.init(e, n),
      defineLazy(e._zod, "values", () => n.in._zod.values),
      defineLazy(e._zod, "optin", () => n.in._zod.optin),
      defineLazy(e._zod, "optout", () => n.out._zod.optout),
      defineLazy(e._zod, "propValues", () => n.in._zod.propValues),
      (e._zod.parse = (r, a) => {
        if (a.direction === "backward") {
          let i = n.out._zod.run(r, a);
          return i instanceof Promise ? i.then((c) => handlePipeResult(c, n.in, a)) : handlePipeResult(i, n.in, a);
        }
        let o = n.in._zod.run(r, a);
        return o instanceof Promise ? o.then((i) => handlePipeResult(i, n.out, a)) : handlePipeResult(o, n.out, a);
      }));
  });
function handlePipeResult(e, n, r) {
  return e.issues.length
    ? ((e.aborted = !0), e)
    : n._zod.run({ value: e.value, issues: e.issues }, r);
}
s(handlePipeResult, "handlePipeResult");
var to = $constructor("$ZodCodec", (e, n) => {
  (E.init(e, n),
    defineLazy(e._zod, "values", () => n.in._zod.values),
    defineLazy(e._zod, "optin", () => n.in._zod.optin),
    defineLazy(e._zod, "optout", () => n.out._zod.optout),
    defineLazy(e._zod, "propValues", () => n.in._zod.propValues),
    (e._zod.parse = (r, a) => {
      if ((a.direction || "forward") === "forward") {
        let i = n.in._zod.run(r, a);
        return i instanceof Promise ? i.then((c) => handleCodecAResult(c, n, a)) : handleCodecAResult(i, n, a);
      } else {
        let i = n.out._zod.run(r, a);
        return i instanceof Promise ? i.then((c) => handleCodecAResult(c, n, a)) : handleCodecAResult(i, n, a);
      }
    }));
});
function handleCodecAResult(e, n, r) {
  if (e.issues.length) return ((e.aborted = !0), e);
  if ((r.direction || "forward") === "forward") {
    let o = n.transform(e.value, e);
    return o instanceof Promise ? o.then((i) => handleCodecTxResult(e, i, n.out, r)) : handleCodecTxResult(e, o, n.out, r);
  } else {
    let o = n.reverseTransform(e.value, e);
    return o instanceof Promise ? o.then((i) => handleCodecTxResult(e, i, n.in, r)) : handleCodecTxResult(e, o, n.in, r);
  }
}
s(handleCodecAResult, "handleCodecAResult");
function handleCodecTxResult(e, n, r, a) {
  return e.issues.length ? ((e.aborted = !0), e) : r._zod.run({ value: n, issues: e.issues }, a);
}
s(handleCodecTxResult, "handleCodecTxResult");
var La = $constructor("$ZodReadonly", (e, n) => {
  (E.init(e, n),
    defineLazy(e._zod, "propValues", () => n.innerType._zod.propValues),
    defineLazy(e._zod, "values", () => n.innerType._zod.values),
    defineLazy(e._zod, "optin", () => n.innerType?._zod?.optin),
    defineLazy(e._zod, "optout", () => n.innerType?._zod?.optout),
    (e._zod.parse = (r, a) => {
      if (a.direction === "backward") return n.innerType._zod.run(r, a);
      let o = n.innerType._zod.run(r, a);
      return o instanceof Promise ? o.then(handleReadonlyResult) : handleReadonlyResult(o);
    }));
});
function handleReadonlyResult(e) {
  return ((e.value = Object.freeze(e.value)), e);
}
s(handleReadonlyResult, "handleReadonlyResult");
var Wa = $constructor("$ZodTemplateLiteral", (e, n) => {
    E.init(e, n);
    let r = [];
    for (let a of n.parts)
      if (typeof a == "object" && a !== null) {
        if (!a._zod.pattern)
          throw new Error(
            `Invalid template literal part, no pattern found: ${[...a._zod.traits].shift()}`,
          );
        let o = a._zod.pattern instanceof RegExp ? a._zod.pattern.source : a._zod.pattern;
        if (!o) throw new Error(`Invalid template literal part: ${a._zod.traits}`);
        let i = o.startsWith("^") ? 1 : 0,
          c = o.endsWith("$") ? o.length - 1 : o.length;
        r.push(o.slice(i, c));
      } else if (a === null || Ur.has(typeof a)) r.push(escapeRegex(`${a}`));
      else throw new Error(`Invalid template literal part: ${a}`);
    ((e._zod.pattern = new RegExp(`^${r.join("")}$`)),
      (e._zod.parse = (a, o) =>
        typeof a.value != "string"
          ? (a.issues.push({ input: a.value, inst: e, expected: "string", code: "invalid_type" }),
            a)
          : ((e._zod.pattern.lastIndex = 0),
            e._zod.pattern.test(a.value) ||
              a.issues.push({
                input: a.value,
                inst: e,
                code: "invalid_format",
                format: n.format ?? "template_literal",
                pattern: e._zod.pattern.source,
              }),
            a)));
  }),
  Fa = $constructor(
    "$ZodFunction",
    (e, n) => (
      E.init(e, n),
      (e._def = n),
      (e._zod.def = n),
      (e.implement = (r) => {
        if (typeof r != "function") throw new Error("implement() must be called with a function");
        return function (...a) {
          let o = e._def.input ? Mo(e._def.input, a) : a,
            i = Reflect.apply(r, this, o);
          return e._def.output ? Mo(e._def.output, i) : i;
        };
      }),
      (e.implementAsync = (r) => {
        if (typeof r != "function")
          throw new Error("implementAsync() must be called with a function");
        return async function (...a) {
          let o = e._def.input ? await $o(e._def.input, a) : a,
            i = await Reflect.apply(r, this, o);
          return e._def.output ? await $o(e._def.output, i) : i;
        };
      }),
      (e._zod.parse = (r, a) =>
        typeof r.value != "function"
          ? (r.issues.push({ code: "invalid_type", expected: "function", input: r.value, inst: e }),
            r)
          : (e._def.output && e._def.output._zod.def.type === "promise"
              ? (r.value = e.implementAsync(r.value))
              : (r.value = e.implement(r.value)),
            r)),
      (e.input = (...r) => {
        let a = e.constructor;
        return Array.isArray(r[0])
          ? new a({
              type: "function",
              input: new tn({ type: "tuple", items: r[0], rest: r[1] }),
              output: e._def.output,
            })
          : new a({ type: "function", input: r[0], output: e._def.output });
      }),
      (e.output = (r) => {
        let a = e.constructor;
        return new a({ type: "function", input: e._def.input, output: r });
      }),
      e
    ),
  ),
  qa = $constructor("$ZodPromise", (e, n) => {
    (E.init(e, n),
      (e._zod.parse = (r, a) =>
        Promise.resolve(r.value).then((o) => n.innerType._zod.run({ value: o, issues: [] }, a))));
  }),
  Va = $constructor("$ZodLazy", (e, n) => {
    (E.init(e, n),
      defineLazy(e._zod, "innerType", () => n.getter()),
      defineLazy(e._zod, "pattern", () => e._zod.innerType?._zod?.pattern),
      defineLazy(e._zod, "propValues", () => e._zod.innerType?._zod?.propValues),
      defineLazy(e._zod, "optin", () => e._zod.innerType?._zod?.optin ?? void 0),
      defineLazy(e._zod, "optout", () => e._zod.innerType?._zod?.optout ?? void 0),
      (e._zod.parse = (r, a) => e._zod.innerType._zod.run(r, a)));
  }),
  Ga = $constructor("$ZodCustom", (e, n) => {
    (Z.init(e, n),
      E.init(e, n),
      (e._zod.parse = (r, a) => r),
      (e._zod.check = (r) => {
        let a = r.value,
          o = n.fn(a);
        if (o instanceof Promise) return o.then((i) => handleRefineResult(i, r, a, e));
        handleRefineResult(o, r, a, e);
      }));
  });
function handleRefineResult(e, n, r, a) {
  if (!e) {
    let o = {
      code: "custom",
      input: r,
      inst: a,
      path: [...(a._zod.def.path ?? [])],
      continue: !a._zod.def.abort,
    };
    (a._zod.def.params && (o.params = a._zod.def.params), n.issues.push(issue(o)));
  }
}
s(handleRefineResult, "handleRefineResult");
var ao = {};
ve(ao, {
  ar: () => Ka,
  az: () => Ha,
  be: () => Ja,
  bg: () => Ya,
  ca: () => Xa,
  cs: () => Qa,
  da: () => es,
  de: () => ts,
  en: () => oo,
  eo: () => os,
  es: () => ns,
  fa: () => rs,
  fi: () => is,
  fr: () => as,
  frCA: () => ss,
  he: () => cs,
  hu: () => ls,
  hy: () => ds,
  id: () => us,
  is: () => ps,
  it: () => ms,
  ja: () => gs,
  ka: () => fs,
  kh: () => hs,
  km: () => no,
  ko: () => ys,
  lt: () => bs,
  mk: () => vs,
  ms: () => Ss,
  nl: () => ks,
  no: () => _s,
  ota: () => xs,
  pl: () => Cs,
  ps: () => Is,
  pt: () => Rs,
  ru: () => Ps,
  sl: () => Ts,
  sv: () => ws,
  ta: () => Es,
  th: () => Os,
  tr: () => As,
  ua: () => zs,
  uk: () => io,
  ur: () => Ms,
  uz: () => $s,
  vi: () => Ds,
  yo: () => Zs,
  zhCN: () => Us,
  zhTW: () => Ns,
});
var Uh = s(() => {
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
    a = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 instanceof ${o.expected}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${l}`
          : `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${i}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${stringifyPrimitive(o.values[0])}`
          : `\u0627\u062E\u062A\u064A\u0627\u0631 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062A\u0648\u0642\u0639 \u0627\u0646\u062A\u0642\u0627\u0621 \u0623\u062D\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A: ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? ` \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${o.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${i} ${o.maximum.toString()} ${c.unit ?? "\u0639\u0646\u0635\u0631"}`
          : `\u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${o.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${i} ${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${o.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${i} ${o.minimum.toString()} ${c.unit}`
          : `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${o.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${i} ${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0628\u062F\u0623 \u0628\u0640 "${o.prefix}"`
          : i.format === "ends_with"
            ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0646\u062A\u0647\u064A \u0628\u0640 "${i.suffix}"`
            : i.format === "includes"
              ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0636\u0645\u0651\u064E\u0646 "${i.includes}"`
              : i.format === "regex"
                ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0637\u0627\u0628\u0642 \u0627\u0644\u0646\u0645\u0637 ${i.pattern}`
                : `${r[i.format] ?? o.format} \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644`;
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
function Ka() {
  return { localeError: Uh() };
}
s(Ka, "default");
var Nh = s(() => {
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
    a = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n instanceof ${o.expected}, daxil olan ${l}`
          : `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${i}, daxil olan ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${stringifyPrimitive(o.values[0])}`
          : `Yanl\u0131\u015F se\xE7im: a\u015Fa\u011F\u0131dak\u0131lardan biri olmal\u0131d\u0131r: ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${o.origin ?? "d\u0259y\u0259r"} ${i}${o.maximum.toString()} ${c.unit ?? "element"}`
          : `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${o.origin ?? "d\u0259y\u0259r"} ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${o.origin} ${i}${o.minimum.toString()} ${c.unit}`
          : `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${o.origin} ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Yanl\u0131\u015F m\u0259tn: "${i.prefix}" il\u0259 ba\u015Flamal\u0131d\u0131r`
          : i.format === "ends_with"
            ? `Yanl\u0131\u015F m\u0259tn: "${i.suffix}" il\u0259 bitm\u0259lidir`
            : i.format === "includes"
              ? `Yanl\u0131\u015F m\u0259tn: "${i.includes}" daxil olmal\u0131d\u0131r`
              : i.format === "regex"
                ? `Yanl\u0131\u015F m\u0259tn: ${i.pattern} \u015Fablonuna uy\u011Fun olmal\u0131d\u0131r`
                : `Yanl\u0131\u015F ${r[i.format] ?? o.format}`;
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
function Ha() {
  return { localeError: Nh() };
}
s(Ha, "default");
function getBelarusianPlural(e, n, r, a) {
  let o = Math.abs(e),
    i = o % 10,
    c = o % 100;
  return c >= 11 && c <= 19 ? a : i === 1 ? n : i >= 2 && i <= 4 ? r : a;
}
s(getBelarusianPlural, "getBelarusianPlural");
var Zh = s(() => {
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
    a = { nan: "NaN", number: "\u043B\u0456\u043A", array: "\u043C\u0430\u0441\u0456\u045E" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F instanceof ${o.expected}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${l}`
          : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F ${i}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F ${stringifyPrimitive(o.values[0])}`
          : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0432\u0430\u0440\u044B\u044F\u043D\u0442: \u0447\u0430\u043A\u0430\u045E\u0441\u044F \u0430\u0434\u0437\u0456\u043D \u0437 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.maximum),
            p = getBelarusianPlural(l, c.unit.one, c.unit.few, c.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${c.verb} ${i}${o.maximum.toString()} ${p}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.minimum),
            p = getBelarusianPlural(l, c.unit.one, c.unit.few, c.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${o.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${c.verb} ${i}${o.minimum.toString()} ${p}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${o.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u043F\u0430\u0447\u044B\u043D\u0430\u0446\u0446\u0430 \u0437 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u0430\u043A\u0430\u043D\u0447\u0432\u0430\u0446\u0446\u0430 \u043D\u0430 "${i.suffix}"`
            : i.format === "includes"
              ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u043C\u044F\u0448\u0447\u0430\u0446\u044C "${i.includes}"`
              : i.format === "regex"
                ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0430\u0434\u043F\u0430\u0432\u044F\u0434\u0430\u0446\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${i.pattern}`
                : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B ${r[i.format] ?? o.format}`;
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
function Ja() {
  return { localeError: Zh() };
}
s(Ja, "default");
var Bh = s(() => {
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
    a = {
      nan: "NaN",
      number: "\u0447\u0438\u0441\u043B\u043E",
      array: "\u043C\u0430\u0441\u0438\u0432",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D instanceof ${o.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${l}`
          : `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${i}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${stringifyPrimitive(o.values[0])}`
          : `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u043E\u043F\u0446\u0438\u044F: \u043E\u0447\u0430\u043A\u0432\u0430\u043D\u043E \u0435\u0434\u043D\u043E \u043E\u0442 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${o.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${i}${o.maximum.toString()} ${c.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430"}`
          : `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${o.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0431\u044A\u0434\u0435 ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${o.origin} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${i}${o.minimum.toString()} ${c.unit}`
          : `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${o.origin} \u0434\u0430 \u0431\u044A\u0434\u0435 ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        if (i.format === "starts_with")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u0432\u0430 \u0441 "${i.prefix}"`;
        if (i.format === "ends_with")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u0432\u044A\u0440\u0448\u0432\u0430 \u0441 "${i.suffix}"`;
        if (i.format === "includes")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0432\u043A\u043B\u044E\u0447\u0432\u0430 "${i.includes}"`;
        if (i.format === "regex")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0441\u044A\u0432\u043F\u0430\u0434\u0430 \u0441 ${i.pattern}`;
        let c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D";
        return (
          i.format === "emoji" && (c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          i.format === "datetime" && (c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          i.format === "date" && (c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430"),
          i.format === "time" && (c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          i.format === "duration" && (c = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430"),
          `${c} ${r[i.format] ?? o.format}`
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
function Ya() {
  return { localeError: Bh() };
}
s(Ya, "default");
var jh = s(() => {
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
    a = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Tipus inv\xE0lid: s'esperava instanceof ${o.expected}, s'ha rebut ${l}`
          : `Tipus inv\xE0lid: s'esperava ${i}, s'ha rebut ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Valor inv\xE0lid: s'esperava ${stringifyPrimitive(o.values[0])}`
          : `Opci\xF3 inv\xE0lida: s'esperava una de ${joinValues(o.values, " o ")}`;
      case "too_big": {
        let i = o.inclusive ? "com a m\xE0xim" : "menys de",
          c = getSizing(o.origin);
        return c
          ? `Massa gran: s'esperava que ${o.origin ?? "el valor"} contingu\xE9s ${i} ${o.maximum.toString()} ${c.unit ?? "elements"}`
          : `Massa gran: s'esperava que ${o.origin ?? "el valor"} fos ${i} ${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? "com a m\xEDnim" : "m\xE9s de",
          c = getSizing(o.origin);
        return c
          ? `Massa petit: s'esperava que ${o.origin} contingu\xE9s ${i} ${o.minimum.toString()} ${c.unit}`
          : `Massa petit: s'esperava que ${o.origin} fos ${i} ${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Format inv\xE0lid: ha de comen\xE7ar amb "${i.prefix}"`
          : i.format === "ends_with"
            ? `Format inv\xE0lid: ha d'acabar amb "${i.suffix}"`
            : i.format === "includes"
              ? `Format inv\xE0lid: ha d'incloure "${i.includes}"`
              : i.format === "regex"
                ? `Format inv\xE0lid: ha de coincidir amb el patr\xF3 ${i.pattern}`
                : `Format inv\xE0lid per a ${r[i.format] ?? o.format}`;
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
function Xa() {
  return { localeError: jh() };
}
s(Xa, "default");
var Lh = s(() => {
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
    a = {
      nan: "NaN",
      number: "\u010D\xEDslo",
      string: "\u0159et\u011Bzec",
      function: "funkce",
      array: "pole",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no instanceof ${o.expected}, obdr\u017Eeno ${l}`
          : `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${i}, obdr\u017Eeno ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${stringifyPrimitive(o.values[0])}`
          : `Neplatn\xE1 mo\u017Enost: o\u010Dek\xE1v\xE1na jedna z hodnot ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${o.origin ?? "hodnota"} mus\xED m\xEDt ${i}${o.maximum.toString()} ${c.unit ?? "prvk\u016F"}`
          : `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${o.origin ?? "hodnota"} mus\xED b\xFDt ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${o.origin ?? "hodnota"} mus\xED m\xEDt ${i}${o.minimum.toString()} ${c.unit ?? "prvk\u016F"}`
          : `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${o.origin ?? "hodnota"} mus\xED b\xFDt ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED za\u010D\xEDnat na "${i.prefix}"`
          : i.format === "ends_with"
            ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED kon\u010Dit na "${i.suffix}"`
            : i.format === "includes"
              ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED obsahovat "${i.includes}"`
              : i.format === "regex"
                ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED odpov\xEDdat vzoru ${i.pattern}`
                : `Neplatn\xFD form\xE1t ${r[i.format] ?? o.format}`;
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
function Qa() {
  return { localeError: Lh() };
}
s(Qa, "default");
var Wh = s(() => {
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
    a = {
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
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ugyldigt input: forventede instanceof ${o.expected}, fik ${l}`
          : `Ugyldigt input: forventede ${i}, fik ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ugyldig v\xE6rdi: forventede ${stringifyPrimitive(o.values[0])}`
          : `Ugyldigt valg: forventede en af f\xF8lgende ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin),
          l = a[o.origin] ?? o.origin;
        return c
          ? `For stor: forventede ${l ?? "value"} ${c.verb} ${i} ${o.maximum.toString()} ${c.unit ?? "elementer"}`
          : `For stor: forventede ${l ?? "value"} havde ${i} ${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin),
          l = a[o.origin] ?? o.origin;
        return c
          ? `For lille: forventede ${l} ${c.verb} ${i} ${o.minimum.toString()} ${c.unit}`
          : `For lille: forventede ${l} havde ${i} ${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Ugyldig streng: skal starte med "${i.prefix}"`
          : i.format === "ends_with"
            ? `Ugyldig streng: skal ende med "${i.suffix}"`
            : i.format === "includes"
              ? `Ugyldig streng: skal indeholde "${i.includes}"`
              : i.format === "regex"
                ? `Ugyldig streng: skal matche m\xF8nsteret ${i.pattern}`
                : `Ugyldig ${r[i.format] ?? o.format}`;
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
function es() {
  return { localeError: Wh() };
}
s(es, "default");
var Fh = s(() => {
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
    a = { nan: "NaN", number: "Zahl", array: "Array" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ung\xFCltige Eingabe: erwartet instanceof ${o.expected}, erhalten ${l}`
          : `Ung\xFCltige Eingabe: erwartet ${i}, erhalten ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ung\xFCltige Eingabe: erwartet ${stringifyPrimitive(o.values[0])}`
          : `Ung\xFCltige Option: erwartet eine von ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Zu gro\xDF: erwartet, dass ${o.origin ?? "Wert"} ${i}${o.maximum.toString()} ${c.unit ?? "Elemente"} hat`
          : `Zu gro\xDF: erwartet, dass ${o.origin ?? "Wert"} ${i}${o.maximum.toString()} ist`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Zu klein: erwartet, dass ${o.origin} ${i}${o.minimum.toString()} ${c.unit} hat`
          : `Zu klein: erwartet, dass ${o.origin} ${i}${o.minimum.toString()} ist`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Ung\xFCltiger String: muss mit "${i.prefix}" beginnen`
          : i.format === "ends_with"
            ? `Ung\xFCltiger String: muss mit "${i.suffix}" enden`
            : i.format === "includes"
              ? `Ung\xFCltiger String: muss "${i.includes}" enthalten`
              : i.format === "regex"
                ? `Ung\xFCltiger String: muss dem Muster ${i.pattern} entsprechen`
                : `Ung\xFCltig: ${r[i.format] ?? o.format}`;
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
function ts() {
  return { localeError: Fh() };
}
s(ts, "default");
var qh = s(() => {
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
    a = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return `Invalid input: expected ${i}, received ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Invalid input: expected ${stringifyPrimitive(o.values[0])}`
          : `Invalid option: expected one of ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Too big: expected ${o.origin ?? "value"} to have ${i}${o.maximum.toString()} ${c.unit ?? "elements"}`
          : `Too big: expected ${o.origin ?? "value"} to be ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Too small: expected ${o.origin} to have ${i}${o.minimum.toString()} ${c.unit}`
          : `Too small: expected ${o.origin} to be ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Invalid string: must start with "${i.prefix}"`
          : i.format === "ends_with"
            ? `Invalid string: must end with "${i.suffix}"`
            : i.format === "includes"
              ? `Invalid string: must include "${i.includes}"`
              : i.format === "regex"
                ? `Invalid string: must match pattern ${i.pattern}`
                : `Invalid ${r[i.format] ?? o.format}`;
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
function oo() {
  return { localeError: qh() };
}
s(oo, "default");
var Vh = s(() => {
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
    a = { nan: "NaN", number: "nombro", array: "tabelo", null: "senvalora" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Nevalida enigo: atendi\u011Dis instanceof ${o.expected}, ricevi\u011Dis ${l}`
          : `Nevalida enigo: atendi\u011Dis ${i}, ricevi\u011Dis ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Nevalida enigo: atendi\u011Dis ${stringifyPrimitive(o.values[0])}`
          : `Nevalida opcio: atendi\u011Dis unu el ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Tro granda: atendi\u011Dis ke ${o.origin ?? "valoro"} havu ${i}${o.maximum.toString()} ${c.unit ?? "elementojn"}`
          : `Tro granda: atendi\u011Dis ke ${o.origin ?? "valoro"} havu ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Tro malgranda: atendi\u011Dis ke ${o.origin} havu ${i}${o.minimum.toString()} ${c.unit}`
          : `Tro malgranda: atendi\u011Dis ke ${o.origin} estu ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Nevalida karaktraro: devas komenci\u011Di per "${i.prefix}"`
          : i.format === "ends_with"
            ? `Nevalida karaktraro: devas fini\u011Di per "${i.suffix}"`
            : i.format === "includes"
              ? `Nevalida karaktraro: devas inkluzivi "${i.includes}"`
              : i.format === "regex"
                ? `Nevalida karaktraro: devas kongrui kun la modelo ${i.pattern}`
                : `Nevalida ${r[i.format] ?? o.format}`;
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
function os() {
  return { localeError: Vh() };
}
s(os, "default");
var Gh = s(() => {
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
    a = {
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
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Entrada inv\xE1lida: se esperaba instanceof ${o.expected}, recibido ${l}`
          : `Entrada inv\xE1lida: se esperaba ${i}, recibido ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Entrada inv\xE1lida: se esperaba ${stringifyPrimitive(o.values[0])}`
          : `Opci\xF3n inv\xE1lida: se esperaba una de ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin),
          l = a[o.origin] ?? o.origin;
        return c
          ? `Demasiado grande: se esperaba que ${l ?? "valor"} tuviera ${i}${o.maximum.toString()} ${c.unit ?? "elementos"}`
          : `Demasiado grande: se esperaba que ${l ?? "valor"} fuera ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin),
          l = a[o.origin] ?? o.origin;
        return c
          ? `Demasiado peque\xF1o: se esperaba que ${l} tuviera ${i}${o.minimum.toString()} ${c.unit}`
          : `Demasiado peque\xF1o: se esperaba que ${l} fuera ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Cadena inv\xE1lida: debe comenzar con "${i.prefix}"`
          : i.format === "ends_with"
            ? `Cadena inv\xE1lida: debe terminar en "${i.suffix}"`
            : i.format === "includes"
              ? `Cadena inv\xE1lida: debe incluir "${i.includes}"`
              : i.format === "regex"
                ? `Cadena inv\xE1lida: debe coincidir con el patr\xF3n ${i.pattern}`
                : `Inv\xE1lido ${r[i.format] ?? o.format}`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE1lido: debe ser m\xFAltiplo de ${o.divisor}`;
      case "unrecognized_keys":
        return `Llave${o.keys.length > 1 ? "s" : ""} desconocida${o.keys.length > 1 ? "s" : ""}: ${joinValues(o.keys, ", ")}`;
      case "invalid_key":
        return `Llave inv\xE1lida en ${a[o.origin] ?? o.origin}`;
      case "invalid_union":
        return "Entrada inv\xE1lida";
      case "invalid_element":
        return `Valor inv\xE1lido en ${a[o.origin] ?? o.origin}`;
      default:
        return "Entrada inv\xE1lida";
    }
  };
}, "error");
function ns() {
  return { localeError: Gh() };
}
s(ns, "default");
var Kh = s(() => {
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
    a = { nan: "NaN", number: "\u0639\u062F\u062F", array: "\u0622\u0631\u0627\u06CC\u0647" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A instanceof ${o.expected} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${l} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`
          : `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${i} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${l} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${stringifyPrimitive(o.values[0])} \u0645\u06CC\u200C\u0628\u0648\u062F`
          : `\u06AF\u0632\u06CC\u0646\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A \u06CC\u06A9\u06CC \u0627\u0632 ${joinValues(o.values, "|")} \u0645\u06CC\u200C\u0628\u0648\u062F`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${o.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${i}${o.maximum.toString()} ${c.unit ?? "\u0639\u0646\u0635\u0631"} \u0628\u0627\u0634\u062F`
          : `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${o.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${i}${o.maximum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${o.origin} \u0628\u0627\u06CC\u062F ${i}${o.minimum.toString()} ${c.unit} \u0628\u0627\u0634\u062F`
          : `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${o.origin} \u0628\u0627\u06CC\u062F ${i}${o.minimum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${i.prefix}" \u0634\u0631\u0648\u0639 \u0634\u0648\u062F`
          : i.format === "ends_with"
            ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${i.suffix}" \u062A\u0645\u0627\u0645 \u0634\u0648\u062F`
            : i.format === "includes"
              ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0634\u0627\u0645\u0644 "${i.includes}" \u0628\u0627\u0634\u062F`
              : i.format === "regex"
                ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 \u0627\u0644\u06AF\u0648\u06CC ${i.pattern} \u0645\u0637\u0627\u0628\u0642\u062A \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F`
                : `${r[i.format] ?? o.format} \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
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
function rs() {
  return { localeError: Kh() };
}
s(rs, "default");
var Hh = s(() => {
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
    a = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Virheellinen tyyppi: odotettiin instanceof ${o.expected}, oli ${l}`
          : `Virheellinen tyyppi: odotettiin ${i}, oli ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Virheellinen sy\xF6te: t\xE4ytyy olla ${stringifyPrimitive(o.values[0])}`
          : `Virheellinen valinta: t\xE4ytyy olla yksi seuraavista: ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Liian suuri: ${c.subject} t\xE4ytyy olla ${i}${o.maximum.toString()} ${c.unit}`.trim()
          : `Liian suuri: arvon t\xE4ytyy olla ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Liian pieni: ${c.subject} t\xE4ytyy olla ${i}${o.minimum.toString()} ${c.unit}`.trim()
          : `Liian pieni: arvon t\xE4ytyy olla ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Virheellinen sy\xF6te: t\xE4ytyy alkaa "${i.prefix}"`
          : i.format === "ends_with"
            ? `Virheellinen sy\xF6te: t\xE4ytyy loppua "${i.suffix}"`
            : i.format === "includes"
              ? `Virheellinen sy\xF6te: t\xE4ytyy sis\xE4lt\xE4\xE4 "${i.includes}"`
              : i.format === "regex"
                ? `Virheellinen sy\xF6te: t\xE4ytyy vastata s\xE4\xE4nn\xF6llist\xE4 lauseketta ${i.pattern}`
                : `Virheellinen ${r[i.format] ?? o.format}`;
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
function is() {
  return { localeError: Hh() };
}
s(is, "default");
var Jh = s(() => {
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
    a = { nan: "NaN", number: "nombre", array: "tableau" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Entr\xE9e invalide : instanceof ${o.expected} attendu, ${l} re\xE7u`
          : `Entr\xE9e invalide : ${i} attendu, ${l} re\xE7u`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Entr\xE9e invalide : ${stringifyPrimitive(o.values[0])} attendu`
          : `Option invalide : une valeur parmi ${joinValues(o.values, "|")} attendue`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Trop grand : ${o.origin ?? "valeur"} doit ${c.verb} ${i}${o.maximum.toString()} ${c.unit ?? "\xE9l\xE9ment(s)"}`
          : `Trop grand : ${o.origin ?? "valeur"} doit \xEAtre ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Trop petit : ${o.origin} doit ${c.verb} ${i}${o.minimum.toString()} ${c.unit}`
          : `Trop petit : ${o.origin} doit \xEAtre ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Cha\xEEne invalide : doit commencer par "${i.prefix}"`
          : i.format === "ends_with"
            ? `Cha\xEEne invalide : doit se terminer par "${i.suffix}"`
            : i.format === "includes"
              ? `Cha\xEEne invalide : doit inclure "${i.includes}"`
              : i.format === "regex"
                ? `Cha\xEEne invalide : doit correspondre au mod\xE8le ${i.pattern}`
                : `${r[i.format] ?? o.format} invalide`;
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
function as() {
  return { localeError: Jh() };
}
s(as, "default");
var Yh = s(() => {
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
    a = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Entr\xE9e invalide : attendu instanceof ${o.expected}, re\xE7u ${l}`
          : `Entr\xE9e invalide : attendu ${i}, re\xE7u ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Entr\xE9e invalide : attendu ${stringifyPrimitive(o.values[0])}`
          : `Option invalide : attendu l'une des valeurs suivantes ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "\u2264" : "<",
          c = getSizing(o.origin);
        return c
          ? `Trop grand : attendu que ${o.origin ?? "la valeur"} ait ${i}${o.maximum.toString()} ${c.unit}`
          : `Trop grand : attendu que ${o.origin ?? "la valeur"} soit ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? "\u2265" : ">",
          c = getSizing(o.origin);
        return c
          ? `Trop petit : attendu que ${o.origin} ait ${i}${o.minimum.toString()} ${c.unit}`
          : `Trop petit : attendu que ${o.origin} soit ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Cha\xEEne invalide : doit commencer par "${i.prefix}"`
          : i.format === "ends_with"
            ? `Cha\xEEne invalide : doit se terminer par "${i.suffix}"`
            : i.format === "includes"
              ? `Cha\xEEne invalide : doit inclure "${i.includes}"`
              : i.format === "regex"
                ? `Cha\xEEne invalide : doit correspondre au motif ${i.pattern}`
                : `${r[i.format] ?? o.format} invalide`;
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
function ss() {
  return { localeError: Yh() };
}
s(ss, "default");
var Xh = s(() => {
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
    n = {
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
    r = s((u) => (u ? e[u] : void 0), "typeEntry"),
    a = s((u) => {
      let h = r(u);
      return h ? h.label : (u ?? e.unknown.label);
    }, "typeLabel"),
    o = s((u) => `\u05D4${a(u)}`, "withDefinite"),
    i = s(
      (u) =>
        (r(u)?.gender ?? "m") === "f"
          ? "\u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05D9\u05D5\u05EA"
          : "\u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA",
      "verbFor",
    ),
    c = s((u) => (u ? (n[u] ?? null) : null), "getSizing"),
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
  return (u) => {
    switch (u.code) {
      case "invalid_type": {
        let h = u.expected,
          S = p[h ?? ""] ?? a(h),
          k = parsedType(u.input),
          I = p[k] ?? e[k]?.label ?? k;
        return /^[A-Z]/.test(u.expected)
          ? `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA instanceof ${u.expected}, \u05D4\u05EA\u05E7\u05D1\u05DC ${I}`
          : `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${S}, \u05D4\u05EA\u05E7\u05D1\u05DC ${I}`;
      }
      case "invalid_value": {
        if (u.values.length === 1)
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05E2\u05E8\u05DA \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA ${stringifyPrimitive(u.values[0])}`;
        let h = u.values.map((I) => stringifyPrimitive(I));
        if (u.values.length === 2)
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${h[0]} \u05D0\u05D5 ${h[1]}`;
        let S = h[h.length - 1];
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${h.slice(0, -1).join(", ")} \u05D0\u05D5 ${S}`;
      }
      case "too_big": {
        let h = c(u.origin),
          S = o(u.origin ?? "value");
        if (u.origin === "string")
          return `${h?.longLabel ?? "\u05D0\u05E8\u05D5\u05DA"} \u05DE\u05D3\u05D9: ${S} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${u.maximum.toString()} ${h?.unit ?? ""} ${u.inclusive ? "\u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA" : "\u05DC\u05DB\u05DC \u05D4\u05D9\u05D5\u05EA\u05E8"}`.trim();
        if (u.origin === "number") {
          let $ = u.inclusive
            ? `\u05E7\u05D8\u05DF \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${u.maximum}`
            : `\u05E7\u05D8\u05DF \u05DE-${u.maximum}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${S} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${$}`;
        }
        if (u.origin === "array" || u.origin === "set") {
          let $ =
              u.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA",
            B = u.inclusive
              ? `${u.maximum} ${h?.unit ?? ""} \u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA`
              : `\u05E4\u05D7\u05D5\u05EA \u05DE-${u.maximum} ${h?.unit ?? ""}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${S} ${$} \u05DC\u05D4\u05DB\u05D9\u05DC ${B}`.trim();
        }
        let k = u.inclusive ? "<=" : "<",
          I = i(u.origin ?? "value");
        return h?.unit
          ? `${h.longLabel} \u05DE\u05D3\u05D9: ${S} ${I} ${k}${u.maximum.toString()} ${h.unit}`
          : `${h?.longLabel ?? "\u05D2\u05D3\u05D5\u05DC"} \u05DE\u05D3\u05D9: ${S} ${I} ${k}${u.maximum.toString()}`;
      }
      case "too_small": {
        let h = c(u.origin),
          S = o(u.origin ?? "value");
        if (u.origin === "string")
          return `${h?.shortLabel ?? "\u05E7\u05E6\u05E8"} \u05DE\u05D3\u05D9: ${S} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${u.minimum.toString()} ${h?.unit ?? ""} ${u.inclusive ? "\u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8" : "\u05DC\u05E4\u05D7\u05D5\u05EA"}`.trim();
        if (u.origin === "number") {
          let $ = u.inclusive
            ? `\u05D2\u05D3\u05D5\u05DC \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${u.minimum}`
            : `\u05D2\u05D3\u05D5\u05DC \u05DE-${u.minimum}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${S} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${$}`;
        }
        if (u.origin === "array" || u.origin === "set") {
          let $ =
            u.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
          if (u.minimum === 1 && u.inclusive) {
            let Xe =
              (u.origin === "set",
              "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3");
            return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${S} ${$} \u05DC\u05D4\u05DB\u05D9\u05DC ${Xe}`;
          }
          let B = u.inclusive
            ? `${u.minimum} ${h?.unit ?? ""} \u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8`
            : `\u05D9\u05D5\u05EA\u05E8 \u05DE-${u.minimum} ${h?.unit ?? ""}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${S} ${$} \u05DC\u05D4\u05DB\u05D9\u05DC ${B}`.trim();
        }
        let k = u.inclusive ? ">=" : ">",
          I = i(u.origin ?? "value");
        return h?.unit
          ? `${h.shortLabel} \u05DE\u05D3\u05D9: ${S} ${I} ${k}${u.minimum.toString()} ${h.unit}`
          : `${h?.shortLabel ?? "\u05E7\u05D8\u05DF"} \u05DE\u05D3\u05D9: ${S} ${I} ${k}${u.minimum.toString()}`;
      }
      case "invalid_format": {
        let h = u;
        if (h.format === "starts_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC \u05D1 "${h.prefix}"`;
        if (h.format === "ends_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD \u05D1 "${h.suffix}"`;
        if (h.format === "includes")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05DB\u05DC\u05D5\u05DC "${h.includes}"`;
        if (h.format === "regex")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D0\u05D9\u05DD \u05DC\u05EA\u05D1\u05E0\u05D9\u05EA ${h.pattern}`;
        let S = l[h.format],
          k = S?.label ?? h.format,
          $ =
            (S?.gender ?? "m") === "f"
              ? "\u05EA\u05E7\u05D9\u05E0\u05D4"
              : "\u05EA\u05E7\u05D9\u05DF";
        return `${k} \u05DC\u05D0 ${$}`;
      }
      case "not_multiple_of":
        return `\u05DE\u05E1\u05E4\u05E8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DE\u05DB\u05E4\u05DC\u05D4 \u05E9\u05DC ${u.divisor}`;
      case "unrecognized_keys":
        return `\u05DE\u05E4\u05EA\u05D7${u.keys.length > 1 ? "\u05D5\u05EA" : ""} \u05DC\u05D0 \u05DE\u05D6\u05D5\u05D4${u.keys.length > 1 ? "\u05D9\u05DD" : "\u05D4"}: ${joinValues(u.keys, ", ")}`;
      case "invalid_key":
        return "\u05E9\u05D3\u05D4 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8";
      case "invalid_union":
        return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
      case "invalid_element":
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1${o(u.origin ?? "array")}`;
      default:
        return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
    }
  };
}, "error");
function cs() {
  return { localeError: Xh() };
}
s(cs, "default");
var Qh = s(() => {
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
    a = { nan: "NaN", number: "sz\xE1m", array: "t\xF6mb" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k instanceof ${o.expected}, a kapott \xE9rt\xE9k ${l}`
          : `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${i}, a kapott \xE9rt\xE9k ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${stringifyPrimitive(o.values[0])}`
          : `\xC9rv\xE9nytelen opci\xF3: valamelyik \xE9rt\xE9k v\xE1rt ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `T\xFAl nagy: ${o.origin ?? "\xE9rt\xE9k"} m\xE9rete t\xFAl nagy ${i}${o.maximum.toString()} ${c.unit ?? "elem"}`
          : `T\xFAl nagy: a bemeneti \xE9rt\xE9k ${o.origin ?? "\xE9rt\xE9k"} t\xFAl nagy: ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${o.origin} m\xE9rete t\xFAl kicsi ${i}${o.minimum.toString()} ${c.unit}`
          : `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${o.origin} t\xFAl kicsi ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\xC9rv\xE9nytelen string: "${i.prefix}" \xE9rt\xE9kkel kell kezd\u0151dnie`
          : i.format === "ends_with"
            ? `\xC9rv\xE9nytelen string: "${i.suffix}" \xE9rt\xE9kkel kell v\xE9gz\u0151dnie`
            : i.format === "includes"
              ? `\xC9rv\xE9nytelen string: "${i.includes}" \xE9rt\xE9ket kell tartalmaznia`
              : i.format === "regex"
                ? `\xC9rv\xE9nytelen string: ${i.pattern} mint\xE1nak kell megfelelnie`
                : `\xC9rv\xE9nytelen ${r[i.format] ?? o.format}`;
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
function ls() {
  return { localeError: Qh() };
}
s(ls, "default");
function getArmenianPlural(e, n, r) {
  return Math.abs(e) === 1 ? n : r;
}
s(getArmenianPlural, "getArmenianPlural");
function withDefiniteArticle(e) {
  if (!e) return "";
  let n = ["\u0561", "\u0565", "\u0568", "\u056B", "\u0578", "\u0578\u0582", "\u0585"],
    r = e[e.length - 1];
  return e + (n.includes(r) ? "\u0576" : "\u0568");
}
s(withDefiniteArticle, "withDefiniteArticle");
var ey = s(() => {
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
    a = {
      nan: "NaN",
      number: "\u0569\u056B\u057E",
      array: "\u0566\u0561\u0576\u0563\u057E\u0561\u056E",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 instanceof ${o.expected}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${l}`
          : `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${i}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${stringifyPrimitive(o.values[1])}`
          : `\u054D\u056D\u0561\u056C \u057F\u0561\u0580\u0562\u0565\u0580\u0561\u056F\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 \u0570\u0565\u057F\u0587\u0575\u0561\u056C\u0576\u0565\u0580\u056B\u0581 \u0574\u0565\u056F\u0568\u055D ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.maximum),
            p = getArmenianPlural(l, c.unit.one, c.unit.many);
          return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(o.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${i}${o.maximum.toString()} ${p}`;
        }
        return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(o.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056C\u056B\u0576\u056B ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.minimum),
            p = getArmenianPlural(l, c.unit.one, c.unit.many);
          return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(o.origin)} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${i}${o.minimum.toString()} ${p}`;
        }
        return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(o.origin)} \u056C\u056B\u0576\u056B ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057D\u056F\u057D\u057E\u056B "${i.prefix}"-\u0578\u057E`
          : i.format === "ends_with"
            ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0561\u057E\u0561\u0580\u057F\u057E\u056B "${i.suffix}"-\u0578\u057E`
            : i.format === "includes"
              ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057A\u0561\u0580\u0578\u0582\u0576\u0561\u056F\u056B "${i.includes}"`
              : i.format === "regex"
                ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0570\u0561\u0574\u0561\u057A\u0561\u057F\u0561\u057D\u056D\u0561\u0576\u056B ${i.pattern} \u0571\u0587\u0561\u0579\u0561\u0583\u056B\u0576`
                : `\u054D\u056D\u0561\u056C ${r[i.format] ?? o.format}`;
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
function ds() {
  return { localeError: ey() };
}
s(ds, "default");
var ty = s(() => {
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
    a = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Input tidak valid: diharapkan instanceof ${o.expected}, diterima ${l}`
          : `Input tidak valid: diharapkan ${i}, diterima ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Input tidak valid: diharapkan ${stringifyPrimitive(o.values[0])}`
          : `Pilihan tidak valid: diharapkan salah satu dari ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Terlalu besar: diharapkan ${o.origin ?? "value"} memiliki ${i}${o.maximum.toString()} ${c.unit ?? "elemen"}`
          : `Terlalu besar: diharapkan ${o.origin ?? "value"} menjadi ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Terlalu kecil: diharapkan ${o.origin} memiliki ${i}${o.minimum.toString()} ${c.unit}`
          : `Terlalu kecil: diharapkan ${o.origin} menjadi ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `String tidak valid: harus dimulai dengan "${i.prefix}"`
          : i.format === "ends_with"
            ? `String tidak valid: harus berakhir dengan "${i.suffix}"`
            : i.format === "includes"
              ? `String tidak valid: harus menyertakan "${i.includes}"`
              : i.format === "regex"
                ? `String tidak valid: harus sesuai pola ${i.pattern}`
                : `${r[i.format] ?? o.format} tidak valid`;
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
function us() {
  return { localeError: ty() };
}
s(us, "default");
var oy = s(() => {
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
    a = { nan: "NaN", number: "n\xFAmer", array: "fylki" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Rangt gildi: \xDE\xFA sl\xF3st inn ${l} \xFEar sem \xE1 a\xF0 vera instanceof ${o.expected}`
          : `Rangt gildi: \xDE\xFA sl\xF3st inn ${l} \xFEar sem \xE1 a\xF0 vera ${i}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Rangt gildi: gert r\xE1\xF0 fyrir ${stringifyPrimitive(o.values[0])}`
          : `\xD3gilt val: m\xE1 vera eitt af eftirfarandi ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${o.origin ?? "gildi"} hafi ${i}${o.maximum.toString()} ${c.unit ?? "hluti"}`
          : `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${o.origin ?? "gildi"} s\xE9 ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${o.origin} hafi ${i}${o.minimum.toString()} ${c.unit}`
          : `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${o.origin} s\xE9 ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\xD3gildur strengur: ver\xF0ur a\xF0 byrja \xE1 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\xD3gildur strengur: ver\xF0ur a\xF0 enda \xE1 "${i.suffix}"`
            : i.format === "includes"
              ? `\xD3gildur strengur: ver\xF0ur a\xF0 innihalda "${i.includes}"`
              : i.format === "regex"
                ? `\xD3gildur strengur: ver\xF0ur a\xF0 fylgja mynstri ${i.pattern}`
                : `Rangt ${r[i.format] ?? o.format}`;
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
function ps() {
  return { localeError: oy() };
}
s(ps, "default");
var ny = s(() => {
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
    a = { nan: "NaN", number: "numero", array: "vettore" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Input non valido: atteso instanceof ${o.expected}, ricevuto ${l}`
          : `Input non valido: atteso ${i}, ricevuto ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Input non valido: atteso ${stringifyPrimitive(o.values[0])}`
          : `Opzione non valida: atteso uno tra ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Troppo grande: ${o.origin ?? "valore"} deve avere ${i}${o.maximum.toString()} ${c.unit ?? "elementi"}`
          : `Troppo grande: ${o.origin ?? "valore"} deve essere ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Troppo piccolo: ${o.origin} deve avere ${i}${o.minimum.toString()} ${c.unit}`
          : `Troppo piccolo: ${o.origin} deve essere ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Stringa non valida: deve iniziare con "${i.prefix}"`
          : i.format === "ends_with"
            ? `Stringa non valida: deve terminare con "${i.suffix}"`
            : i.format === "includes"
              ? `Stringa non valida: deve includere "${i.includes}"`
              : i.format === "regex"
                ? `Stringa non valida: deve corrispondere al pattern ${i.pattern}`
                : `Invalid ${r[i.format] ?? o.format}`;
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
function ms() {
  return { localeError: ny() };
}
s(ms, "default");
var ry = s(() => {
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
    a = { nan: "NaN", number: "\u6570\u5024", array: "\u914D\u5217" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u7121\u52B9\u306A\u5165\u529B: instanceof ${o.expected}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${l}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`
          : `\u7121\u52B9\u306A\u5165\u529B: ${i}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${l}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u7121\u52B9\u306A\u5165\u529B: ${stringifyPrimitive(o.values[0])}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F`
          : `\u7121\u52B9\u306A\u9078\u629E: ${joinValues(o.values, "\u3001")}\u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      case "too_big": {
        let i = o.inclusive ? "\u4EE5\u4E0B\u3067\u3042\u308B" : "\u3088\u308A\u5C0F\u3055\u3044",
          c = getSizing(o.origin);
        return c
          ? `\u5927\u304D\u3059\u304E\u308B\u5024: ${o.origin ?? "\u5024"}\u306F${o.maximum.toString()}${c.unit ?? "\u8981\u7D20"}${i}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : `\u5927\u304D\u3059\u304E\u308B\u5024: ${o.origin ?? "\u5024"}\u306F${o.maximum.toString()}${i}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "too_small": {
        let i = o.inclusive ? "\u4EE5\u4E0A\u3067\u3042\u308B" : "\u3088\u308A\u5927\u304D\u3044",
          c = getSizing(o.origin);
        return c
          ? `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${o.origin}\u306F${o.minimum.toString()}${c.unit}${i}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${o.origin}\u306F${o.minimum.toString()}${i}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${i.prefix}"\u3067\u59CB\u307E\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : i.format === "ends_with"
            ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${i.suffix}"\u3067\u7D42\u308F\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
            : i.format === "includes"
              ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${i.includes}"\u3092\u542B\u3080\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
              : i.format === "regex"
                ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: \u30D1\u30BF\u30FC\u30F3${i.pattern}\u306B\u4E00\u81F4\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
                : `\u7121\u52B9\u306A${r[i.format] ?? o.format}`;
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
function gs() {
  return { localeError: ry() };
}
s(gs, "default");
var iy = s(() => {
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
    a = {
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
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 instanceof ${o.expected}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${l}`
          : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${i}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${stringifyPrimitive(o.values[0])}`
          : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D0\u10E0\u10D8\u10D0\u10DC\u10E2\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8\u10D0 \u10D4\u10E0\u10D7-\u10D4\u10E0\u10D7\u10D8 ${joinValues(o.values, "|")}-\u10D3\u10D0\u10DC`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${o.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} ${c.verb} ${i}${o.maximum.toString()} ${c.unit}`
          : `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${o.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} \u10D8\u10E7\u10DD\u10E1 ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${o.origin} ${c.verb} ${i}${o.minimum.toString()} ${c.unit}`
          : `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${o.origin} \u10D8\u10E7\u10DD\u10E1 ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10EC\u10E7\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${i.prefix}"-\u10D8\u10D7`
          : i.format === "ends_with"
            ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10DB\u10D7\u10D0\u10D5\u10E0\u10D3\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${i.suffix}"-\u10D8\u10D7`
            : i.format === "includes"
              ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1 "${i.includes}"-\u10E1`
              : i.format === "regex"
                ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D4\u10E1\u10D0\u10D1\u10D0\u10DB\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 \u10E8\u10D0\u10D1\u10DA\u10DD\u10DC\u10E1 ${i.pattern}`
                : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 ${r[i.format] ?? o.format}`;
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
function fs() {
  return { localeError: iy() };
}
s(fs, "default");
var ay = s(() => {
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
    a = {
      nan: "NaN",
      number: "\u179B\u17C1\u1781",
      array: "\u17A2\u17B6\u179A\u17C1 (Array)",
      null: "\u1782\u17D2\u1798\u17B6\u1793\u178F\u1798\u17D2\u179B\u17C3 (null)",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A instanceof ${o.expected} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${l}`
          : `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${i} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${stringifyPrimitive(o.values[0])}`
          : `\u1787\u1798\u17D2\u179A\u17BE\u179F\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1787\u17B6\u1798\u17BD\u1799\u1780\u17D2\u1793\u17BB\u1784\u1785\u17C6\u178E\u17C4\u1798 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${o.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${i} ${o.maximum.toString()} ${c.unit ?? "\u1792\u17B6\u178F\u17BB"}`
          : `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${o.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${i} ${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${o.origin} ${i} ${o.minimum.toString()} ${c.unit}`
          : `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${o.origin} ${i} ${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u178A\u17C4\u1799 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1794\u1789\u17D2\u1785\u1794\u17CB\u178A\u17C4\u1799 "${i.suffix}"`
            : i.format === "includes"
              ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1798\u17B6\u1793 "${i.includes}"`
              : i.format === "regex"
                ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1795\u17D2\u1782\u17BC\u1795\u17D2\u1782\u1784\u1793\u17B9\u1784\u1791\u1798\u17D2\u179A\u1784\u17CB\u178A\u17C2\u179B\u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB ${i.pattern}`
                : `\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 ${r[i.format] ?? o.format}`;
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
function no() {
  return { localeError: ay() };
}
s(no, "default");
function hs() {
  return no();
}
s(hs, "default");
var sy = s(() => {
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
    a = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 instanceof ${o.expected}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${l}\uC785\uB2C8\uB2E4`
          : `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 ${i}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${l}\uC785\uB2C8\uB2E4`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\uC798\uBABB\uB41C \uC785\uB825: \uAC12\uC740 ${stringifyPrimitive(o.values[0])} \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4`
          : `\uC798\uBABB\uB41C \uC635\uC158: ${joinValues(o.values, "\uB610\uB294 ")} \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
      case "too_big": {
        let i = o.inclusive ? "\uC774\uD558" : "\uBBF8\uB9CC",
          c =
            i === "\uBBF8\uB9CC"
              ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4"
              : "\uC5EC\uC57C \uD569\uB2C8\uB2E4",
          l = getSizing(o.origin),
          p = l?.unit ?? "\uC694\uC18C";
        return l
          ? `${o.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${o.maximum.toString()}${p} ${i}${c}`
          : `${o.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${o.maximum.toString()} ${i}${c}`;
      }
      case "too_small": {
        let i = o.inclusive ? "\uC774\uC0C1" : "\uCD08\uACFC",
          c =
            i === "\uC774\uC0C1"
              ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4"
              : "\uC5EC\uC57C \uD569\uB2C8\uB2E4",
          l = getSizing(o.origin),
          p = l?.unit ?? "\uC694\uC18C";
        return l
          ? `${o.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${o.minimum.toString()}${p} ${i}${c}`
          : `${o.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${o.minimum.toString()} ${i}${c}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${i.prefix}"(\uC73C)\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4`
          : i.format === "ends_with"
            ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${i.suffix}"(\uC73C)\uB85C \uB05D\uB098\uC57C \uD569\uB2C8\uB2E4`
            : i.format === "includes"
              ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${i.includes}"\uC744(\uB97C) \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4`
              : i.format === "regex"
                ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: \uC815\uADDC\uC2DD ${i.pattern} \uD328\uD134\uACFC \uC77C\uCE58\uD574\uC57C \uD569\uB2C8\uB2E4`
                : `\uC798\uBABB\uB41C ${r[i.format] ?? o.format}`;
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
function ys() {
  return { localeError: sy() };
}
s(ys, "default");
var ro = s((e) => e.charAt(0).toUpperCase() + e.slice(1), "capitalizeFirstCharacter");
function getUnitTypeFromNumber(e) {
  let n = Math.abs(e),
    r = n % 10,
    a = n % 100;
  return (a >= 11 && a <= 19) || r === 0 ? "many" : r === 1 ? "one" : "few";
}
s(getUnitTypeFromNumber, "getUnitTypeFromNumber");
var cy = s(() => {
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
  function getSizing(o, i, c, l) {
    let p = e[o] ?? null;
    return p === null ? p : { unit: p.unit[i], verb: p.verb[l][c ? "inclusive" : "notInclusive"] };
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
    a = {
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
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Gautas tipas ${l}, o tik\u0117tasi - instanceof ${o.expected}`
          : `Gautas tipas ${l}, o tik\u0117tasi - ${i}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Privalo b\u016Bti ${stringifyPrimitive(o.values[0])}`
          : `Privalo b\u016Bti vienas i\u0161 ${joinValues(o.values, "|")} pasirinkim\u0173`;
      case "too_big": {
        let i = a[o.origin] ?? o.origin,
          c = getSizing(o.origin, getUnitTypeFromNumber(Number(o.maximum)), o.inclusive ?? !1, "smaller");
        if (c?.verb)
          return `${ro(i ?? o.origin ?? "reik\u0161m\u0117")} ${c.verb} ${o.maximum.toString()} ${c.unit ?? "element\u0173"}`;
        let l = o.inclusive ? "ne didesnis kaip" : "ma\u017Eesnis kaip";
        return `${ro(i ?? o.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${l} ${o.maximum.toString()} ${c?.unit}`;
      }
      case "too_small": {
        let i = a[o.origin] ?? o.origin,
          c = getSizing(o.origin, getUnitTypeFromNumber(Number(o.minimum)), o.inclusive ?? !1, "bigger");
        if (c?.verb)
          return `${ro(i ?? o.origin ?? "reik\u0161m\u0117")} ${c.verb} ${o.minimum.toString()} ${c.unit ?? "element\u0173"}`;
        let l = o.inclusive ? "ne ma\u017Eesnis kaip" : "didesnis kaip";
        return `${ro(i ?? o.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${l} ${o.minimum.toString()} ${c?.unit}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Eilut\u0117 privalo prasid\u0117ti "${i.prefix}"`
          : i.format === "ends_with"
            ? `Eilut\u0117 privalo pasibaigti "${i.suffix}"`
            : i.format === "includes"
              ? `Eilut\u0117 privalo \u012Ftraukti "${i.includes}"`
              : i.format === "regex"
                ? `Eilut\u0117 privalo atitikti ${i.pattern}`
                : `Neteisingas ${r[i.format] ?? o.format}`;
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
        let i = a[o.origin] ?? o.origin;
        return `${ro(i ?? o.origin ?? "reik\u0161m\u0117")} turi klaiding\u0105 \u012Fvest\u012F`;
      }
      default:
        return "Klaidinga \u012Fvestis";
    }
  };
}, "error");
function bs() {
  return { localeError: cy() };
}
s(bs, "default");
var ly = s(() => {
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
    a = { nan: "NaN", number: "\u0431\u0440\u043E\u0458", array: "\u043D\u0438\u0437\u0430" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 instanceof ${o.expected}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${l}`
          : `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${i}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Invalid input: expected ${stringifyPrimitive(o.values[0])}`
          : `\u0413\u0440\u0435\u0448\u0430\u043D\u0430 \u043E\u043F\u0446\u0438\u0458\u0430: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 \u0435\u0434\u043D\u0430 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${o.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0438\u043C\u0430 ${i}${o.maximum.toString()} ${c.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0438"}`
          : `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${o.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0431\u0438\u0434\u0435 ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${o.origin} \u0434\u0430 \u0438\u043C\u0430 ${i}${o.minimum.toString()} ${c.unit}`
          : `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${o.origin} \u0434\u0430 \u0431\u0438\u0434\u0435 ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u043D\u0443\u0432\u0430 \u0441\u043E "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u0432\u0440\u0448\u0443\u0432\u0430 \u0441\u043E "${i.suffix}"`
            : i.format === "includes"
              ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0432\u043A\u043B\u0443\u0447\u0443\u0432\u0430 "${i.includes}"`
              : i.format === "regex"
                ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u043E\u0434\u0433\u043E\u0430\u0440\u0430 \u043D\u0430 \u043F\u0430\u0442\u0435\u0440\u043D\u043E\u0442 ${i.pattern}`
                : `Invalid ${r[i.format] ?? o.format}`;
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
function vs() {
  return { localeError: ly() };
}
s(vs, "default");
var dy = s(() => {
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
    a = { nan: "NaN", number: "nombor" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Input tidak sah: dijangka instanceof ${o.expected}, diterima ${l}`
          : `Input tidak sah: dijangka ${i}, diterima ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Input tidak sah: dijangka ${stringifyPrimitive(o.values[0])}`
          : `Pilihan tidak sah: dijangka salah satu daripada ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Terlalu besar: dijangka ${o.origin ?? "nilai"} ${c.verb} ${i}${o.maximum.toString()} ${c.unit ?? "elemen"}`
          : `Terlalu besar: dijangka ${o.origin ?? "nilai"} adalah ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Terlalu kecil: dijangka ${o.origin} ${c.verb} ${i}${o.minimum.toString()} ${c.unit}`
          : `Terlalu kecil: dijangka ${o.origin} adalah ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `String tidak sah: mesti bermula dengan "${i.prefix}"`
          : i.format === "ends_with"
            ? `String tidak sah: mesti berakhir dengan "${i.suffix}"`
            : i.format === "includes"
              ? `String tidak sah: mesti mengandungi "${i.includes}"`
              : i.format === "regex"
                ? `String tidak sah: mesti sepadan dengan corak ${i.pattern}`
                : `${r[i.format] ?? o.format} tidak sah`;
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
function Ss() {
  return { localeError: dy() };
}
s(Ss, "default");
var uy = s(() => {
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
    a = { nan: "NaN", number: "getal" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ongeldige invoer: verwacht instanceof ${o.expected}, ontving ${l}`
          : `Ongeldige invoer: verwacht ${i}, ontving ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ongeldige invoer: verwacht ${stringifyPrimitive(o.values[0])}`
          : `Ongeldige optie: verwacht \xE9\xE9n van ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin),
          l = o.origin === "date" ? "laat" : o.origin === "string" ? "lang" : "groot";
        return c
          ? `Te ${l}: verwacht dat ${o.origin ?? "waarde"} ${i}${o.maximum.toString()} ${c.unit ?? "elementen"} ${c.verb}`
          : `Te ${l}: verwacht dat ${o.origin ?? "waarde"} ${i}${o.maximum.toString()} is`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin),
          l = o.origin === "date" ? "vroeg" : o.origin === "string" ? "kort" : "klein";
        return c
          ? `Te ${l}: verwacht dat ${o.origin} ${i}${o.minimum.toString()} ${c.unit} ${c.verb}`
          : `Te ${l}: verwacht dat ${o.origin} ${i}${o.minimum.toString()} is`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Ongeldige tekst: moet met "${i.prefix}" beginnen`
          : i.format === "ends_with"
            ? `Ongeldige tekst: moet op "${i.suffix}" eindigen`
            : i.format === "includes"
              ? `Ongeldige tekst: moet "${i.includes}" bevatten`
              : i.format === "regex"
                ? `Ongeldige tekst: moet overeenkomen met patroon ${i.pattern}`
                : `Ongeldig: ${r[i.format] ?? o.format}`;
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
function ks() {
  return { localeError: uy() };
}
s(ks, "default");
var py = s(() => {
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
    a = { nan: "NaN", number: "tall", array: "liste" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ugyldig input: forventet instanceof ${o.expected}, fikk ${l}`
          : `Ugyldig input: forventet ${i}, fikk ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ugyldig verdi: forventet ${stringifyPrimitive(o.values[0])}`
          : `Ugyldig valg: forventet en av ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `For stor(t): forventet ${o.origin ?? "value"} til \xE5 ha ${i}${o.maximum.toString()} ${c.unit ?? "elementer"}`
          : `For stor(t): forventet ${o.origin ?? "value"} til \xE5 ha ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `For lite(n): forventet ${o.origin} til \xE5 ha ${i}${o.minimum.toString()} ${c.unit}`
          : `For lite(n): forventet ${o.origin} til \xE5 ha ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Ugyldig streng: m\xE5 starte med "${i.prefix}"`
          : i.format === "ends_with"
            ? `Ugyldig streng: m\xE5 ende med "${i.suffix}"`
            : i.format === "includes"
              ? `Ugyldig streng: m\xE5 inneholde "${i.includes}"`
              : i.format === "regex"
                ? `Ugyldig streng: m\xE5 matche m\xF8nsteret ${i.pattern}`
                : `Ugyldig ${r[i.format] ?? o.format}`;
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
function _s() {
  return { localeError: py() };
}
s(_s, "default");
var my = s(() => {
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
    a = { nan: "NaN", number: "numara", array: "saf", null: "gayb" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `F\xE2sit giren: umulan instanceof ${o.expected}, al\u0131nan ${l}`
          : `F\xE2sit giren: umulan ${i}, al\u0131nan ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `F\xE2sit giren: umulan ${stringifyPrimitive(o.values[0])}`
          : `F\xE2sit tercih: m\xFBteberler ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Fazla b\xFCy\xFCk: ${o.origin ?? "value"}, ${i}${o.maximum.toString()} ${c.unit ?? "elements"} sahip olmal\u0131yd\u0131.`
          : `Fazla b\xFCy\xFCk: ${o.origin ?? "value"}, ${i}${o.maximum.toString()} olmal\u0131yd\u0131.`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Fazla k\xFC\xE7\xFCk: ${o.origin}, ${i}${o.minimum.toString()} ${c.unit} sahip olmal\u0131yd\u0131.`
          : `Fazla k\xFC\xE7\xFCk: ${o.origin}, ${i}${o.minimum.toString()} olmal\u0131yd\u0131.`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `F\xE2sit metin: "${i.prefix}" ile ba\u015Flamal\u0131.`
          : i.format === "ends_with"
            ? `F\xE2sit metin: "${i.suffix}" ile bitmeli.`
            : i.format === "includes"
              ? `F\xE2sit metin: "${i.includes}" ihtiv\xE2 etmeli.`
              : i.format === "regex"
                ? `F\xE2sit metin: ${i.pattern} nak\u015F\u0131na uymal\u0131.`
                : `F\xE2sit ${r[i.format] ?? o.format}`;
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
function xs() {
  return { localeError: my() };
}
s(xs, "default");
var gy = s(() => {
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
    a = { nan: "NaN", number: "\u0639\u062F\u062F", array: "\u0627\u0631\u06D0" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F instanceof ${o.expected} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${l} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`
          : `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${i} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${l} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${stringifyPrimitive(o.values[0])} \u0648\u0627\u06CC`
          : `\u0646\u0627\u0633\u0645 \u0627\u0646\u062A\u062E\u0627\u0628: \u0628\u0627\u06CC\u062F \u06CC\u0648 \u0644\u0647 ${joinValues(o.values, "|")} \u0685\u062E\u0647 \u0648\u0627\u06CC`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${o.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${i}${o.maximum.toString()} ${c.unit ?? "\u0639\u0646\u0635\u0631\u0648\u0646\u0647"} \u0648\u0644\u0631\u064A`
          : `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${o.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${i}${o.maximum.toString()} \u0648\u064A`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${o.origin} \u0628\u0627\u06CC\u062F ${i}${o.minimum.toString()} ${c.unit} \u0648\u0644\u0631\u064A`
          : `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${o.origin} \u0628\u0627\u06CC\u062F ${i}${o.minimum.toString()} \u0648\u064A`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${i.prefix}" \u0633\u0631\u0647 \u067E\u06CC\u0644 \u0634\u064A`
          : i.format === "ends_with"
            ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${i.suffix}" \u0633\u0631\u0647 \u067E\u0627\u06CC \u062A\u0647 \u0648\u0631\u0633\u064A\u0696\u064A`
            : i.format === "includes"
              ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F "${i.includes}" \u0648\u0644\u0631\u064A`
              : i.format === "regex"
                ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F ${i.pattern} \u0633\u0631\u0647 \u0645\u0637\u0627\u0628\u0642\u062A \u0648\u0644\u0631\u064A`
                : `${r[i.format] ?? o.format} \u0646\u0627\u0633\u0645 \u062F\u06CC`;
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
function Is() {
  return { localeError: gy() };
}
s(Is, "default");
var fy = s(() => {
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
    a = { nan: "NaN", number: "liczba", array: "tablica" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano instanceof ${o.expected}, otrzymano ${l}`
          : `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${i}, otrzymano ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${stringifyPrimitive(o.values[0])}`
          : `Nieprawid\u0142owa opcja: oczekiwano jednej z warto\u015Bci ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Za du\u017Ca warto\u015B\u0107: oczekiwano, \u017Ce ${o.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${i}${o.maximum.toString()} ${c.unit ?? "element\xF3w"}`
          : `Zbyt du\u017C(y/a/e): oczekiwano, \u017Ce ${o.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Za ma\u0142a warto\u015B\u0107: oczekiwano, \u017Ce ${o.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${i}${o.minimum.toString()} ${c.unit ?? "element\xF3w"}`
          : `Zbyt ma\u0142(y/a/e): oczekiwano, \u017Ce ${o.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zaczyna\u0107 si\u0119 od "${i.prefix}"`
          : i.format === "ends_with"
            ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi ko\u0144czy\u0107 si\u0119 na "${i.suffix}"`
            : i.format === "includes"
              ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zawiera\u0107 "${i.includes}"`
              : i.format === "regex"
                ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi odpowiada\u0107 wzorcowi ${i.pattern}`
                : `Nieprawid\u0142ow(y/a/e) ${r[i.format] ?? o.format}`;
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
function Cs() {
  return { localeError: fy() };
}
s(Cs, "default");
var hy = s(() => {
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
    a = { nan: "NaN", number: "n\xFAmero", null: "nulo" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Tipo inv\xE1lido: esperado instanceof ${o.expected}, recebido ${l}`
          : `Tipo inv\xE1lido: esperado ${i}, recebido ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Entrada inv\xE1lida: esperado ${stringifyPrimitive(o.values[0])}`
          : `Op\xE7\xE3o inv\xE1lida: esperada uma das ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Muito grande: esperado que ${o.origin ?? "valor"} tivesse ${i}${o.maximum.toString()} ${c.unit ?? "elementos"}`
          : `Muito grande: esperado que ${o.origin ?? "valor"} fosse ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Muito pequeno: esperado que ${o.origin} tivesse ${i}${o.minimum.toString()} ${c.unit}`
          : `Muito pequeno: esperado que ${o.origin} fosse ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Texto inv\xE1lido: deve come\xE7ar com "${i.prefix}"`
          : i.format === "ends_with"
            ? `Texto inv\xE1lido: deve terminar com "${i.suffix}"`
            : i.format === "includes"
              ? `Texto inv\xE1lido: deve incluir "${i.includes}"`
              : i.format === "regex"
                ? `Texto inv\xE1lido: deve corresponder ao padr\xE3o ${i.pattern}`
                : `${r[i.format] ?? o.format} inv\xE1lido`;
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
function Rs() {
  return { localeError: hy() };
}
s(Rs, "default");
function getRussianPlural(e, n, r, a) {
  let o = Math.abs(e),
    i = o % 10,
    c = o % 100;
  return c >= 11 && c <= 19 ? a : i === 1 ? n : i >= 2 && i <= 4 ? r : a;
}
s(getRussianPlural, "getRussianPlural");
var yy = s(() => {
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
    a = {
      nan: "NaN",
      number: "\u0447\u0438\u0441\u043B\u043E",
      array: "\u043C\u0430\u0441\u0441\u0438\u0432",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C instanceof ${o.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${l}`
          : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${i}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${stringifyPrimitive(o.values[0])}`
          : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0434\u043D\u043E \u0438\u0437 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.maximum),
            p = getRussianPlural(l, c.unit.one, c.unit.few, c.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${i}${o.maximum.toString()} ${p}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        if (c) {
          let l = Number(o.minimum),
            p = getRussianPlural(l, c.unit.one, c.unit.few, c.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${o.origin} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${i}${o.minimum.toString()} ${p}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${o.origin} \u0431\u0443\u0434\u0435\u0442 ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u043D\u0430\u0447\u0438\u043D\u0430\u0442\u044C\u0441\u044F \u0441 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u0442\u044C\u0441\u044F \u043D\u0430 "${i.suffix}"`
            : i.format === "includes"
              ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C "${i.includes}"`
              : i.format === "regex"
                ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${i.pattern}`
                : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 ${r[i.format] ?? o.format}`;
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
function Ps() {
  return { localeError: yy() };
}
s(Ps, "default");
var by = s(() => {
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
    a = { nan: "NaN", number: "\u0161tevilo", array: "tabela" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Neveljaven vnos: pri\u010Dakovano instanceof ${o.expected}, prejeto ${l}`
          : `Neveljaven vnos: pri\u010Dakovano ${i}, prejeto ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Neveljaven vnos: pri\u010Dakovano ${stringifyPrimitive(o.values[0])}`
          : `Neveljavna mo\u017Enost: pri\u010Dakovano eno izmed ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Preveliko: pri\u010Dakovano, da bo ${o.origin ?? "vrednost"} imelo ${i}${o.maximum.toString()} ${c.unit ?? "elementov"}`
          : `Preveliko: pri\u010Dakovano, da bo ${o.origin ?? "vrednost"} ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Premajhno: pri\u010Dakovano, da bo ${o.origin} imelo ${i}${o.minimum.toString()} ${c.unit}`
          : `Premajhno: pri\u010Dakovano, da bo ${o.origin} ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Neveljaven niz: mora se za\u010Deti z "${i.prefix}"`
          : i.format === "ends_with"
            ? `Neveljaven niz: mora se kon\u010Dati z "${i.suffix}"`
            : i.format === "includes"
              ? `Neveljaven niz: mora vsebovati "${i.includes}"`
              : i.format === "regex"
                ? `Neveljaven niz: mora ustrezati vzorcu ${i.pattern}`
                : `Neveljaven ${r[i.format] ?? o.format}`;
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
function Ts() {
  return { localeError: by() };
}
s(Ts, "default");
var vy = s(() => {
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
    a = { nan: "NaN", number: "antal", array: "lista" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ogiltig inmatning: f\xF6rv\xE4ntat instanceof ${o.expected}, fick ${l}`
          : `Ogiltig inmatning: f\xF6rv\xE4ntat ${i}, fick ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ogiltig inmatning: f\xF6rv\xE4ntat ${stringifyPrimitive(o.values[0])}`
          : `Ogiltigt val: f\xF6rv\xE4ntade en av ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `F\xF6r stor(t): f\xF6rv\xE4ntade ${o.origin ?? "v\xE4rdet"} att ha ${i}${o.maximum.toString()} ${c.unit ?? "element"}`
          : `F\xF6r stor(t): f\xF6rv\xE4ntat ${o.origin ?? "v\xE4rdet"} att ha ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `F\xF6r lite(t): f\xF6rv\xE4ntade ${o.origin ?? "v\xE4rdet"} att ha ${i}${o.minimum.toString()} ${c.unit}`
          : `F\xF6r lite(t): f\xF6rv\xE4ntade ${o.origin ?? "v\xE4rdet"} att ha ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Ogiltig str\xE4ng: m\xE5ste b\xF6rja med "${i.prefix}"`
          : i.format === "ends_with"
            ? `Ogiltig str\xE4ng: m\xE5ste sluta med "${i.suffix}"`
            : i.format === "includes"
              ? `Ogiltig str\xE4ng: m\xE5ste inneh\xE5lla "${i.includes}"`
              : i.format === "regex"
                ? `Ogiltig str\xE4ng: m\xE5ste matcha m\xF6nstret "${i.pattern}"`
                : `Ogiltig(t) ${r[i.format] ?? o.format}`;
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
function ws() {
  return { localeError: vy() };
}
s(ws, "default");
var Sy = s(() => {
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
    a = {
      nan: "NaN",
      number: "\u0B8E\u0BA3\u0BCD",
      array: "\u0B85\u0BA3\u0BBF",
      null: "\u0BB5\u0BC6\u0BB1\u0BC1\u0BAE\u0BC8",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 instanceof ${o.expected}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${l}`
          : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${i}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${stringifyPrimitive(o.values[0])}`
          : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0BB0\u0BC1\u0BAA\u0BCD\u0BAA\u0BAE\u0BCD: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${joinValues(o.values, "|")} \u0B87\u0BB2\u0BCD \u0B92\u0BA9\u0BCD\u0BB1\u0BC1`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${o.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${i}${o.maximum.toString()} ${c.unit ?? "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD"} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${o.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${i}${o.maximum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${o.origin} ${i}${o.minimum.toString()} ${c.unit} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${o.origin} ${i}${o.minimum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${i.prefix}" \u0B87\u0BB2\u0BCD \u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : i.format === "ends_with"
            ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${i.suffix}" \u0B87\u0BB2\u0BCD \u0BAE\u0BC1\u0B9F\u0BBF\u0BB5\u0B9F\u0BC8\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
            : i.format === "includes"
              ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${i.includes}" \u0B90 \u0B89\u0BB3\u0BCD\u0BB3\u0B9F\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
              : i.format === "regex"
                ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: ${i.pattern} \u0BAE\u0BC1\u0BB1\u0BC8\u0BAA\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0B9F\u0BA9\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
                : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 ${r[i.format] ?? o.format}`;
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
function Es() {
  return { localeError: Sy() };
}
s(Es, "default");
var ky = s(() => {
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
    a = {
      nan: "NaN",
      number: "\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02",
      array: "\u0E2D\u0E32\u0E23\u0E4C\u0E40\u0E23\u0E22\u0E4C (Array)",
      null: "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32 (null)",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 instanceof ${o.expected} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${l}`
          : `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${i} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0E04\u0E48\u0E32\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${stringifyPrimitive(o.values[0])}`
          : `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E43\u0E19 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive
            ? "\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19"
            : "\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32",
          c = getSizing(o.origin);
        return c
          ? `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${o.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${i} ${o.maximum.toString()} ${c.unit ?? "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"}`
          : `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${o.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${i} ${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive
            ? "\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22"
            : "\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32",
          c = getSizing(o.origin);
        return c
          ? `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${o.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${i} ${o.minimum.toString()} ${c.unit}`
          : `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${o.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${i} ${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E36\u0E49\u0E19\u0E15\u0E49\u0E19\u0E14\u0E49\u0E27\u0E22 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E25\u0E07\u0E17\u0E49\u0E32\u0E22\u0E14\u0E49\u0E27\u0E22 "${i.suffix}"`
            : i.format === "includes"
              ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 "${i.includes}" \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21`
              : i.format === "regex"
                ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14 ${i.pattern}`
                : `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: ${r[i.format] ?? o.format}`;
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
function Os() {
  return { localeError: ky() };
}
s(Os, "default");
var _y = s(() => {
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
    a = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Ge\xE7ersiz de\u011Fer: beklenen instanceof ${o.expected}, al\u0131nan ${l}`
          : `Ge\xE7ersiz de\u011Fer: beklenen ${i}, al\u0131nan ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Ge\xE7ersiz de\u011Fer: beklenen ${stringifyPrimitive(o.values[0])}`
          : `Ge\xE7ersiz se\xE7enek: a\u015Fa\u011F\u0131dakilerden biri olmal\u0131: ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\xC7ok b\xFCy\xFCk: beklenen ${o.origin ?? "de\u011Fer"} ${i}${o.maximum.toString()} ${c.unit ?? "\xF6\u011Fe"}`
          : `\xC7ok b\xFCy\xFCk: beklenen ${o.origin ?? "de\u011Fer"} ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\xC7ok k\xFC\xE7\xFCk: beklenen ${o.origin} ${i}${o.minimum.toString()} ${c.unit}`
          : `\xC7ok k\xFC\xE7\xFCk: beklenen ${o.origin} ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Ge\xE7ersiz metin: "${i.prefix}" ile ba\u015Flamal\u0131`
          : i.format === "ends_with"
            ? `Ge\xE7ersiz metin: "${i.suffix}" ile bitmeli`
            : i.format === "includes"
              ? `Ge\xE7ersiz metin: "${i.includes}" i\xE7ermeli`
              : i.format === "regex"
                ? `Ge\xE7ersiz metin: ${i.pattern} desenine uymal\u0131`
                : `Ge\xE7ersiz ${r[i.format] ?? o.format}`;
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
function As() {
  return { localeError: _y() };
}
s(As, "default");
var xy = s(() => {
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
    a = {
      nan: "NaN",
      number: "\u0447\u0438\u0441\u043B\u043E",
      array: "\u043C\u0430\u0441\u0438\u0432",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F instanceof ${o.expected}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${l}`
          : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${i}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${stringifyPrimitive(o.values[0])}`
          : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430 \u043E\u043F\u0446\u0456\u044F: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F \u043E\u0434\u043D\u0435 \u0437 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} ${c.verb} ${i}${o.maximum.toString()} ${c.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432"}`
          : `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${o.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} \u0431\u0443\u0434\u0435 ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${o.origin} ${c.verb} ${i}${o.minimum.toString()} ${c.unit}`
          : `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${o.origin} \u0431\u0443\u0434\u0435 ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043F\u043E\u0447\u0438\u043D\u0430\u0442\u0438\u0441\u044F \u0437 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0437\u0430\u043A\u0456\u043D\u0447\u0443\u0432\u0430\u0442\u0438\u0441\u044F \u043D\u0430 "${i.suffix}"`
            : i.format === "includes"
              ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043C\u0456\u0441\u0442\u0438\u0442\u0438 "${i.includes}"`
              : i.format === "regex"
                ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u0442\u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${i.pattern}`
                : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 ${r[i.format] ?? o.format}`;
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
function io() {
  return { localeError: xy() };
}
s(io, "default");
function zs() {
  return io();
}
s(zs, "default");
var Iy = s(() => {
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
    a = {
      nan: "NaN",
      number: "\u0646\u0645\u0628\u0631",
      array: "\u0622\u0631\u06D2",
      null: "\u0646\u0644",
    };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: instanceof ${o.expected} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${l} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`
          : `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${i} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${l} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${stringifyPrimitive(o.values[0])} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`
          : `\u063A\u0644\u0637 \u0622\u067E\u0634\u0646: ${joinValues(o.values, "|")} \u0645\u06CC\u06BA \u0633\u06D2 \u0627\u06CC\u06A9 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u0628\u06C1\u062A \u0628\u0691\u0627: ${o.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u06D2 ${i}${o.maximum.toString()} ${c.unit ?? "\u0639\u0646\u0627\u0635\u0631"} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`
          : `\u0628\u06C1\u062A \u0628\u0691\u0627: ${o.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u0627 ${i}${o.maximum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${o.origin} \u06A9\u06D2 ${i}${o.minimum.toString()} ${c.unit} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`
          : `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${o.origin} \u06A9\u0627 ${i}${o.minimum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${i.prefix}" \u0633\u06D2 \u0634\u0631\u0648\u0639 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
          : i.format === "ends_with"
            ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${i.suffix}" \u067E\u0631 \u062E\u062A\u0645 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
            : i.format === "includes"
              ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${i.includes}" \u0634\u0627\u0645\u0644 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
              : i.format === "regex"
                ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: \u067E\u06CC\u0679\u0631\u0646 ${i.pattern} \u0633\u06D2 \u0645\u06CC\u0686 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
                : `\u063A\u0644\u0637 ${r[i.format] ?? o.format}`;
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
function Ms() {
  return { localeError: Iy() };
}
s(Ms, "default");
var Cy = s(() => {
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
    a = { nan: "NaN", number: "raqam", array: "massiv" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `Noto\u2018g\u2018ri kirish: kutilgan instanceof ${o.expected}, qabul qilingan ${l}`
          : `Noto\u2018g\u2018ri kirish: kutilgan ${i}, qabul qilingan ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `Noto\u2018g\u2018ri kirish: kutilgan ${stringifyPrimitive(o.values[0])}`
          : `Noto\u2018g\u2018ri variant: quyidagilardan biri kutilgan ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Juda katta: kutilgan ${o.origin ?? "qiymat"} ${i}${o.maximum.toString()} ${c.unit} ${c.verb}`
          : `Juda katta: kutilgan ${o.origin ?? "qiymat"} ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Juda kichik: kutilgan ${o.origin} ${i}${o.minimum.toString()} ${c.unit} ${c.verb}`
          : `Juda kichik: kutilgan ${o.origin} ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Noto\u2018g\u2018ri satr: "${i.prefix}" bilan boshlanishi kerak`
          : i.format === "ends_with"
            ? `Noto\u2018g\u2018ri satr: "${i.suffix}" bilan tugashi kerak`
            : i.format === "includes"
              ? `Noto\u2018g\u2018ri satr: "${i.includes}" ni o\u2018z ichiga olishi kerak`
              : i.format === "regex"
                ? `Noto\u2018g\u2018ri satr: ${i.pattern} shabloniga mos kelishi kerak`
                : `Noto\u2018g\u2018ri ${r[i.format] ?? o.format}`;
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
function $s() {
  return { localeError: Cy() };
}
s($s, "default");
var Ry = s(() => {
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
    a = { nan: "NaN", number: "s\u1ED1", array: "m\u1EA3ng" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i instanceof ${o.expected}, nh\u1EADn \u0111\u01B0\u1EE3c ${l}`
          : `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${i}, nh\u1EADn \u0111\u01B0\u1EE3c ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${stringifyPrimitive(o.values[0])}`
          : `T\xF9y ch\u1ECDn kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i m\u1ED9t trong c\xE1c gi\xE1 tr\u1ECB ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${o.origin ?? "gi\xE1 tr\u1ECB"} ${c.verb} ${i}${o.maximum.toString()} ${c.unit ?? "ph\u1EA7n t\u1EED"}`
          : `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${o.origin ?? "gi\xE1 tr\u1ECB"} ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${o.origin} ${c.verb} ${i}${o.minimum.toString()} ${c.unit}`
          : `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${o.origin} ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i b\u1EAFt \u0111\u1EA7u b\u1EB1ng "${i.prefix}"`
          : i.format === "ends_with"
            ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i k\u1EBFt th\xFAc b\u1EB1ng "${i.suffix}"`
            : i.format === "includes"
              ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i bao g\u1ED3m "${i.includes}"`
              : i.format === "regex"
                ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i kh\u1EDBp v\u1EDBi m\u1EABu ${i.pattern}`
                : `${r[i.format] ?? o.format} kh\xF4ng h\u1EE3p l\u1EC7`;
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
function Ds() {
  return { localeError: Ry() };
}
s(Ds, "default");
var Py = s(() => {
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
    a = { nan: "NaN", number: "\u6570\u5B57", array: "\u6570\u7EC4", null: "\u7A7A\u503C(null)" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B instanceof ${o.expected}\uFF0C\u5B9E\u9645\u63A5\u6536 ${l}`
          : `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${i}\uFF0C\u5B9E\u9645\u63A5\u6536 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${stringifyPrimitive(o.values[0])}`
          : `\u65E0\u6548\u9009\u9879\uFF1A\u671F\u671B\u4EE5\u4E0B\u4E4B\u4E00 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${o.origin ?? "\u503C"} ${i}${o.maximum.toString()} ${c.unit ?? "\u4E2A\u5143\u7D20"}`
          : `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${o.origin ?? "\u503C"} ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${o.origin} ${i}${o.minimum.toString()} ${c.unit}`
          : `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${o.origin} ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${i.prefix}" \u5F00\u5934`
          : i.format === "ends_with"
            ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${i.suffix}" \u7ED3\u5C3E`
            : i.format === "includes"
              ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u5305\u542B "${i.includes}"`
              : i.format === "regex"
                ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u6EE1\u8DB3\u6B63\u5219\u8868\u8FBE\u5F0F ${i.pattern}`
                : `\u65E0\u6548${r[i.format] ?? o.format}`;
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
function Us() {
  return { localeError: Py() };
}
s(Us, "default");
var Ty = s(() => {
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
    a = { nan: "NaN" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA instanceof ${o.expected}\uFF0C\u4F46\u6536\u5230 ${l}`
          : `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${i}\uFF0C\u4F46\u6536\u5230 ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${stringifyPrimitive(o.values[0])}`
          : `\u7121\u6548\u7684\u9078\u9805\uFF1A\u9810\u671F\u70BA\u4EE5\u4E0B\u5176\u4E2D\u4E4B\u4E00 ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${o.origin ?? "\u503C"} \u61C9\u70BA ${i}${o.maximum.toString()} ${c.unit ?? "\u500B\u5143\u7D20"}`
          : `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${o.origin ?? "\u503C"} \u61C9\u70BA ${i}${o.maximum.toString()}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${o.origin} \u61C9\u70BA ${i}${o.minimum.toString()} ${c.unit}`
          : `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${o.origin} \u61C9\u70BA ${i}${o.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${i.prefix}" \u958B\u982D`
          : i.format === "ends_with"
            ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${i.suffix}" \u7D50\u5C3E`
            : i.format === "includes"
              ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u5305\u542B "${i.includes}"`
              : i.format === "regex"
                ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u7B26\u5408\u683C\u5F0F ${i.pattern}`
                : `\u7121\u6548\u7684 ${r[i.format] ?? o.format}`;
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
function Ns() {
  return { localeError: Ty() };
}
s(Ns, "default");
var wy = s(() => {
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
    a = { nan: "NaN", number: "n\u1ECD\u0301mb\xE0", array: "akop\u1ECD" };
  return (o) => {
    switch (o.code) {
      case "invalid_type": {
        let i = a[o.expected] ?? o.expected,
          c = parsedType(o.input),
          l = a[c] ?? c;
        return /^[A-Z]/.test(o.expected)
          ? `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi instanceof ${o.expected}, \xE0m\u1ECD\u0300 a r\xED ${l}`
          : `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${i}, \xE0m\u1ECD\u0300 a r\xED ${l}`;
      }
      case "invalid_value":
        return o.values.length === 1
          ? `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${stringifyPrimitive(o.values[0])}`
          : `\xC0\u1E63\xE0y\xE0n a\u1E63\xEC\u1E63e: yan \u1ECD\u0300kan l\xE1ra ${joinValues(o.values, "|")}`;
      case "too_big": {
        let i = o.inclusive ? "<=" : "<",
          c = getSizing(o.origin);
        return c
          ? `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${o.origin ?? "iye"} ${c.verb} ${i}${o.maximum} ${c.unit}`
          : `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 ${i}${o.maximum}`;
      }
      case "too_small": {
        let i = o.inclusive ? ">=" : ">",
          c = getSizing(o.origin);
        return c
          ? `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${o.origin} ${c.verb} ${i}${o.minimum} ${c.unit}`
          : `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 ${i}${o.minimum}`;
      }
      case "invalid_format": {
        let i = o;
        return i.format === "starts_with"
          ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\u1EB9\u0300r\u1EB9\u0300 p\u1EB9\u0300l\xFA "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 par\xED p\u1EB9\u0300l\xFA "${i.suffix}"`
            : i.format === "includes"
              ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 n\xED "${i.includes}"`
              : i.format === "regex"
                ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\xE1 \xE0p\u1EB9\u1EB9r\u1EB9 mu ${i.pattern}`
                : `A\u1E63\xEC\u1E63e: ${r[i.format] ?? o.format}`;
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
function Zs() {
  return { localeError: wy() };
}
s(Zs, "default");
var Yu,
  Bs = Symbol("ZodOutput"),
  js = Symbol("ZodInput"),
  nn = class {
    static {
      s(this, "$ZodRegistry");
    }
    constructor() {
      ((this._map = new WeakMap()), (this._idmap = new Map()));
    }
    add(n, ...r) {
      let a = r[0];
      return (
        this._map.set(n, a),
        a && typeof a == "object" && "id" in a && this._idmap.set(a.id, n),
        this
      );
    }
    clear() {
      return ((this._map = new WeakMap()), (this._idmap = new Map()), this);
    }
    remove(n) {
      let r = this._map.get(n);
      return (
        r && typeof r == "object" && "id" in r && this._idmap.delete(r.id),
        this._map.delete(n),
        this
      );
    }
    get(n) {
      let r = n._zod.parent;
      if (r) {
        let a = { ...(this.get(r) ?? {}) };
        delete a.id;
        let o = { ...a, ...this._map.get(n) };
        return Object.keys(o).length ? o : void 0;
      }
      return this._map.get(n);
    }
    has(n) {
      return this._map.has(n);
    }
  };
function registry() {
  return new nn();
}
s(registry, "registry");
(Yu = globalThis).__zod_globalRegistry ?? (Yu.__zod_globalRegistry = registry());
var V = globalThis.__zod_globalRegistry;
function _string(e, n) {
  return new e({ type: "string", ...normalizeParams(n) });
}
s(_string, "_string");
function _coercedString(e, n) {
  return new e({ type: "string", coerce: !0, ...normalizeParams(n) });
}
s(_coercedString, "_coercedString");
function _email(e, n) {
  return new e({ type: "string", format: "email", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_email, "_email");
function _guid(e, n) {
  return new e({ type: "string", format: "guid", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_guid, "_guid");
function _uuid(e, n) {
  return new e({ type: "string", format: "uuid", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_uuid, "_uuid");
function _uuidv4(e, n) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...normalizeParams(n),
  });
}
s(_uuidv4, "_uuidv4");
function _uuidv6(e, n) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...normalizeParams(n),
  });
}
s(_uuidv6, "_uuidv6");
function _uuidv7(e, n) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...normalizeParams(n),
  });
}
s(_uuidv7, "_uuidv7");
function _url(e, n) {
  return new e({ type: "string", format: "url", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_url, "_url");
function _emoji(e, n) {
  return new e({ type: "string", format: "emoji", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_emoji, "_emoji");
function _nanoid(e, n) {
  return new e({ type: "string", format: "nanoid", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_nanoid, "_nanoid");
function _cuid(e, n) {
  return new e({ type: "string", format: "cuid", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_cuid, "_cuid");
function _cuid2(e, n) {
  return new e({ type: "string", format: "cuid2", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_cuid2, "_cuid2");
function _ulid(e, n) {
  return new e({ type: "string", format: "ulid", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_ulid, "_ulid");
function _xid(e, n) {
  return new e({ type: "string", format: "xid", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_xid, "_xid");
function _ksuid(e, n) {
  return new e({ type: "string", format: "ksuid", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_ksuid, "_ksuid");
function _ipv4(e, n) {
  return new e({ type: "string", format: "ipv4", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_ipv4, "_ipv4");
function _ipv6(e, n) {
  return new e({ type: "string", format: "ipv6", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_ipv6, "_ipv6");
function _mac(e, n) {
  return new e({ type: "string", format: "mac", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_mac, "_mac");
function _cidrv4(e, n) {
  return new e({ type: "string", format: "cidrv4", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_cidrv4, "_cidrv4");
function _cidrv6(e, n) {
  return new e({ type: "string", format: "cidrv6", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_cidrv6, "_cidrv6");
function _base64(e, n) {
  return new e({ type: "string", format: "base64", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_base64, "_base64");
function _base64url(e, n) {
  return new e({ type: "string", format: "base64url", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_base64url, "_base64url");
function _e164(e, n) {
  return new e({ type: "string", format: "e164", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_e164, "_e164");
function _jwt(e, n) {
  return new e({ type: "string", format: "jwt", check: "string_format", abort: !1, ...normalizeParams(n) });
}
s(_jwt, "_jwt");
var qs = { Any: null, Minute: -1, Second: 0, Millisecond: 3, Microsecond: 6 };
function _isoDateTime(e, n) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...normalizeParams(n),
  });
}
s(_isoDateTime, "_isoDateTime");
function _isoDate(e, n) {
  return new e({ type: "string", format: "date", check: "string_format", ...normalizeParams(n) });
}
s(_isoDate, "_isoDate");
function _isoTime(e, n) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(n),
  });
}
s(_isoTime, "_isoTime");
function _isoDuration(e, n) {
  return new e({ type: "string", format: "duration", check: "string_format", ...normalizeParams(n) });
}
s(_isoDuration, "_isoDuration");
function _number(e, n) {
  return new e({ type: "number", checks: [], ...normalizeParams(n) });
}
s(_number, "_number");
function _coercedNumber(e, n) {
  return new e({ type: "number", coerce: !0, checks: [], ...normalizeParams(n) });
}
s(_coercedNumber, "_coercedNumber");
function _int(e, n) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "safeint", ...normalizeParams(n) });
}
s(_int, "_int");
function _float32(e, n) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "float32", ...normalizeParams(n) });
}
s(_float32, "_float32");
function _float64(e, n) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "float64", ...normalizeParams(n) });
}
s(_float64, "_float64");
function _int32(e, n) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "int32", ...normalizeParams(n) });
}
s(_int32, "_int32");
function _uint32(e, n) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "uint32", ...normalizeParams(n) });
}
s(_uint32, "_uint32");
function _boolean(e, n) {
  return new e({ type: "boolean", ...normalizeParams(n) });
}
s(_boolean, "_boolean");
function _coercedBoolean(e, n) {
  return new e({ type: "boolean", coerce: !0, ...normalizeParams(n) });
}
s(_coercedBoolean, "_coercedBoolean");
function _bigint(e, n) {
  return new e({ type: "bigint", ...normalizeParams(n) });
}
s(_bigint, "_bigint");
function _coercedBigint(e, n) {
  return new e({ type: "bigint", coerce: !0, ...normalizeParams(n) });
}
s(_coercedBigint, "_coercedBigint");
function _int64(e, n) {
  return new e({ type: "bigint", check: "bigint_format", abort: !1, format: "int64", ...normalizeParams(n) });
}
s(_int64, "_int64");
function _uint64(e, n) {
  return new e({ type: "bigint", check: "bigint_format", abort: !1, format: "uint64", ...normalizeParams(n) });
}
s(_uint64, "_uint64");
function _symbol(e, n) {
  return new e({ type: "symbol", ...normalizeParams(n) });
}
s(_symbol, "_symbol");
function _undefined(e, n) {
  return new e({ type: "undefined", ...normalizeParams(n) });
}
s(_undefined, "_undefined");
function _null(e, n) {
  return new e({ type: "null", ...normalizeParams(n) });
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
function _never(e, n) {
  return new e({ type: "never", ...normalizeParams(n) });
}
s(_never, "_never");
function _void(e, n) {
  return new e({ type: "void", ...normalizeParams(n) });
}
s(_void, "_void");
function _date(e, n) {
  return new e({ type: "date", ...normalizeParams(n) });
}
s(_date, "_date");
function _coercedDate(e, n) {
  return new e({ type: "date", coerce: !0, ...normalizeParams(n) });
}
s(_coercedDate, "_coercedDate");
function _nan(e, n) {
  return new e({ type: "nan", ...normalizeParams(n) });
}
s(_nan, "_nan");
function _lt(e, n) {
  return new Vo({ check: "less_than", ...normalizeParams(n), value: e, inclusive: !1 });
}
s(_lt, "_lt");
function _lte(e, n) {
  return new Vo({ check: "less_than", ...normalizeParams(n), value: e, inclusive: !0 });
}
s(_lte, "_lte");
function _gt(e, n) {
  return new Go({ check: "greater_than", ...normalizeParams(n), value: e, inclusive: !1 });
}
s(_gt, "_gt");
function _gte(e, n) {
  return new Go({ check: "greater_than", ...normalizeParams(n), value: e, inclusive: !0 });
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
function _multipleOf(e, n) {
  return new vi({ check: "multiple_of", ...normalizeParams(n), value: e });
}
s(_multipleOf, "_multipleOf");
function _maxSize(e, n) {
  return new _i({ check: "max_size", ...normalizeParams(n), maximum: e });
}
s(_maxSize, "_maxSize");
function _minSize(e, n) {
  return new xi({ check: "min_size", ...normalizeParams(n), minimum: e });
}
s(_minSize, "_minSize");
function _size(e, n) {
  return new Ii({ check: "size_equals", ...normalizeParams(n), size: e });
}
s(_size, "_size");
function _maxLength(e, n) {
  return new Ci({ check: "max_length", ...normalizeParams(n), maximum: e });
}
s(_maxLength, "_maxLength");
function _minLength(e, n) {
  return new Ri({ check: "min_length", ...normalizeParams(n), minimum: e });
}
s(_minLength, "_minLength");
function _length(e, n) {
  return new Pi({ check: "length_equals", ...normalizeParams(n), length: e });
}
s(_length, "_length");
function _regex(e, n) {
  return new Ti({ check: "string_format", format: "regex", ...normalizeParams(n), pattern: e });
}
s(_regex, "_regex");
function _lowercase(e) {
  return new wi({ check: "string_format", format: "lowercase", ...normalizeParams(e) });
}
s(_lowercase, "_lowercase");
function _uppercase(e) {
  return new Ei({ check: "string_format", format: "uppercase", ...normalizeParams(e) });
}
s(_uppercase, "_uppercase");
function _includes(e, n) {
  return new Oi({ check: "string_format", format: "includes", ...normalizeParams(n), includes: e });
}
s(_includes, "_includes");
function _startsWith(e, n) {
  return new Ai({ check: "string_format", format: "starts_with", ...normalizeParams(n), prefix: e });
}
s(_startsWith, "_startsWith");
function _endsWith(e, n) {
  return new zi({ check: "string_format", format: "ends_with", ...normalizeParams(n), suffix: e });
}
s(_endsWith, "_endsWith");
function _property(e, n, r) {
  return new Mi({ check: "property", property: e, schema: n, ...normalizeParams(r) });
}
s(_property, "_property");
function _mime(e, n) {
  return new $i({ check: "mime_type", mime: e, ...normalizeParams(n) });
}
s(_mime, "_mime");
function _overwrite(e) {
  return new Di({ check: "overwrite", tx: e });
}
s(_overwrite, "_overwrite");
function _normalize(e) {
  return _overwrite((n) => n.normalize(e));
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
function _array(e, n, r) {
  return new e({ type: "array", element: n, ...normalizeParams(r) });
}
s(_array, "_array");
function _union(e, n, r) {
  return new e({ type: "union", options: n, ...normalizeParams(r) });
}
s(_union, "_union");
function _xor(e, n, r) {
  return new e({ type: "union", options: n, inclusive: !1, ...normalizeParams(r) });
}
s(_xor, "_xor");
function _discriminatedUnion(e, n, r, a) {
  return new e({ type: "union", options: r, discriminator: n, ...normalizeParams(a) });
}
s(_discriminatedUnion, "_discriminatedUnion");
function _intersection(e, n, r) {
  return new e({ type: "intersection", left: n, right: r });
}
s(_intersection, "_intersection");
function _tuple(e, n, r, a) {
  let o = r instanceof E,
    i = o ? a : r,
    c = o ? r : null;
  return new e({ type: "tuple", items: n, rest: c, ...normalizeParams(i) });
}
s(_tuple, "_tuple");
function _record(e, n, r, a) {
  return new e({ type: "record", keyType: n, valueType: r, ...normalizeParams(a) });
}
s(_record, "_record");
function _map(e, n, r, a) {
  return new e({ type: "map", keyType: n, valueType: r, ...normalizeParams(a) });
}
s(_map, "_map");
function _set(e, n, r) {
  return new e({ type: "set", valueType: n, ...normalizeParams(r) });
}
s(_set, "_set");
function _enum(e, n, r) {
  let a = Array.isArray(n) ? Object.fromEntries(n.map((o) => [o, o])) : n;
  return new e({ type: "enum", entries: a, ...normalizeParams(r) });
}
s(_enum, "_enum");
function _nativeEnum(e, n, r) {
  return new e({ type: "enum", entries: n, ...normalizeParams(r) });
}
s(_nativeEnum, "_nativeEnum");
function _literal(e, n, r) {
  return new e({ type: "literal", values: Array.isArray(n) ? n : [n], ...normalizeParams(r) });
}
s(_literal, "_literal");
function _file(e, n) {
  return new e({ type: "file", ...normalizeParams(n) });
}
s(_file, "_file");
function _transform(e, n) {
  return new e({ type: "transform", transform: n });
}
s(_transform, "_transform");
function _optional(e, n) {
  return new e({ type: "optional", innerType: n });
}
s(_optional, "_optional");
function _nullable(e, n) {
  return new e({ type: "nullable", innerType: n });
}
s(_nullable, "_nullable");
function _default(e, n, r) {
  return new e({
    type: "default",
    innerType: n,
    get defaultValue() {
      return typeof r == "function" ? r() : shallowClone(r);
    },
  });
}
s(_default, "_default");
function _nonoptional(e, n, r) {
  return new e({ type: "nonoptional", innerType: n, ...normalizeParams(r) });
}
s(_nonoptional, "_nonoptional");
function _success(e, n) {
  return new e({ type: "success", innerType: n });
}
s(_success, "_success");
function _catch(e, n, r) {
  return new e({ type: "catch", innerType: n, catchValue: typeof r == "function" ? r : () => r });
}
s(_catch, "_catch");
function _pipe(e, n, r) {
  return new e({ type: "pipe", in: n, out: r });
}
s(_pipe, "_pipe");
function _readonly(e, n) {
  return new e({ type: "readonly", innerType: n });
}
s(_readonly, "_readonly");
function _templateLiteral(e, n, r) {
  return new e({ type: "template_literal", parts: n, ...normalizeParams(r) });
}
s(_templateLiteral, "_templateLiteral");
function _lazy(e, n) {
  return new e({ type: "lazy", getter: n });
}
s(_lazy, "_lazy");
function _promise(e, n) {
  return new e({ type: "promise", innerType: n });
}
s(_promise, "_promise");
function _custom(e, n, r) {
  let a = normalizeParams(r);
  return (a.abort ?? (a.abort = !0), new e({ type: "custom", check: "custom", fn: n, ...a }));
}
s(_custom, "_custom");
function _refine(e, n, r) {
  return new e({ type: "custom", check: "custom", fn: n, ...normalizeParams(r) });
}
s(_refine, "_refine");
function _superRefine(e) {
  let n = _check(
    (r) => (
      (r.addIssue = (a) => {
        if (typeof a == "string") r.issues.push(issue(a, r.value, n._zod.def));
        else {
          let o = a;
          (o.fatal && (o.continue = !1),
            o.code ?? (o.code = "custom"),
            o.input ?? (o.input = r.value),
            o.inst ?? (o.inst = n),
            o.continue ?? (o.continue = !n._zod.def.abort),
            r.issues.push(issue(o)));
        }
      }),
      e(r.value, r)
    ),
  );
  return n;
}
s(_superRefine, "_superRefine");
function _check(e, n) {
  let r = new Z({ check: "custom", ...normalizeParams(n) });
  return ((r._zod.check = e), r);
}
s(_check, "_check");
function describe(e) {
  let n = new Z({ check: "describe" });
  return (
    (n._zod.onattach = [
      (r) => {
        let a = V.get(r) ?? {};
        V.add(r, { ...a, description: e });
      },
    ]),
    (n._zod.check = () => {}),
    n
  );
}
s(describe, "describe");
function meta(e) {
  let n = new Z({ check: "meta" });
  return (
    (n._zod.onattach = [
      (r) => {
        let a = V.get(r) ?? {};
        V.add(r, { ...a, ...e });
      },
    ]),
    (n._zod.check = () => {}),
    n
  );
}
s(meta, "meta");
function _stringbool(e, n) {
  let r = normalizeParams(n),
    a = r.truthy ?? ["true", "1", "yes", "on", "y", "enabled"],
    o = r.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
  r.case !== "sensitive" &&
    ((a = a.map((I) => (typeof I == "string" ? I.toLowerCase() : I))),
    (o = o.map((I) => (typeof I == "string" ? I.toLowerCase() : I))));
  let i = new Set(a),
    c = new Set(o),
    l = e.Codec ?? to,
    p = e.Boolean ?? Qt,
    u = e.String ?? je,
    h = new u({ type: "string", error: r.error }),
    S = new p({ type: "boolean", error: r.error }),
    k = new l({
      type: "pipe",
      in: h,
      out: S,
      transform: s((I, $) => {
        let B = I;
        return (
          r.case !== "sensitive" && (B = B.toLowerCase()),
          i.has(B)
            ? !0
            : c.has(B)
              ? !1
              : ($.issues.push({
                  code: "invalid_value",
                  expected: "stringbool",
                  values: [...i, ...c],
                  input: $.value,
                  inst: k,
                  continue: !1,
                }),
                {})
        );
      }, "transform"),
      reverseTransform: s(
        (I, $) => (I === !0 ? a[0] || "true" : o[0] || "false"),
        "reverseTransform",
      ),
      error: r.error,
    });
  return k;
}
s(_stringbool, "_stringbool");
function _stringFormat(e, n, r, a = {}) {
  let o = normalizeParams(a),
    i = {
      ...normalizeParams(a),
      check: "string_format",
      type: "string",
      format: n,
      fn: typeof r == "function" ? r : (l) => r.test(l),
      ...o,
    };
  return (r instanceof RegExp && (i.pattern = r), new e(i));
}
s(_stringFormat, "_stringFormat");
function initializeContext(e) {
  let n = e?.target ?? "draft-2020-12";
  return (
    n === "draft-4" && (n = "draft-04"),
    n === "draft-7" && (n = "draft-07"),
    {
      processors: e.processors ?? {},
      metadataRegistry: e?.metadata ?? V,
      target: n,
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
function D(e, n, r = { path: [], schemaPath: [] }) {
  var a;
  let o = e._zod.def,
    i = n.seen.get(e);
  if (i) return (i.count++, r.schemaPath.includes(e) && (i.cycle = r.path), i.schema);
  let c = { schema: {}, count: 1, cycle: void 0, path: r.path };
  n.seen.set(e, c);
  let l = e._zod.toJSONSchema?.();
  if (l) c.schema = l;
  else {
    let h = { ...r, schemaPath: [...r.schemaPath, e], path: r.path };
    if (e._zod.processJSONSchema) e._zod.processJSONSchema(n, c.schema, h);
    else {
      let k = c.schema,
        I = n.processors[o.type];
      if (!I) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      I(e, n, k, h);
    }
    let S = e._zod.parent;
    S && (c.ref || (c.ref = S), D(S, n, h), (n.seen.get(S).isParent = !0));
  }
  let p = n.metadataRegistry.get(e);
  return (
    p && Object.assign(c.schema, p),
    n.io === "input" && isTransforming(e) && (delete c.schema.examples, delete c.schema.default),
    n.io === "input" &&
      c.schema._prefault &&
      ((a = c.schema).default ?? (a.default = c.schema._prefault)),
    delete c.schema._prefault,
    n.seen.get(e).schema
  );
}
s(D, "process");
function extractDefs(e, n) {
  let r = e.seen.get(n);
  if (!r) throw new Error("Unprocessed schema. This is a bug in Zod.");
  let a = new Map();
  for (let c of e.seen.entries()) {
    let l = e.metadataRegistry.get(c[0])?.id;
    if (l) {
      let p = a.get(l);
      if (p && p !== c[0])
        throw new Error(
          `Duplicate schema id "${l}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`,
        );
      a.set(l, c[0]);
    }
  }
  let o = s((c) => {
      let l = e.target === "draft-2020-12" ? "$defs" : "definitions";
      if (e.external) {
        let S = e.external.registry.get(c[0])?.id,
          k = e.external.uri ?? (($) => $);
        if (S) return { ref: k(S) };
        let I = c[1].defId ?? c[1].schema.id ?? `schema${e.counter++}`;
        return ((c[1].defId = I), { defId: I, ref: `${k("__shared")}#/${l}/${I}` });
      }
      if (c[1] === r) return { ref: "#" };
      let u = `#/${l}/`,
        h = c[1].schema.id ?? `__schema${e.counter++}`;
      return { defId: h, ref: u + h };
    }, "makeURI"),
    i = s((c) => {
      if (c[1].schema.$ref) return;
      let l = c[1],
        { ref: p, defId: u } = o(c);
      ((l.def = { ...l.schema }), u && (l.defId = u));
      let h = l.schema;
      for (let S in h) delete h[S];
      h.$ref = p;
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
    if (n === c[0]) {
      i(c);
      continue;
    }
    if (e.external) {
      let u = e.external.registry.get(c[0])?.id;
      if (n !== c[0] && u) {
        i(c);
        continue;
      }
    }
    if (e.metadataRegistry.get(c[0])?.id) {
      i(c);
      continue;
    }
    if (l.cycle) {
      i(c);
      continue;
    }
    if (l.count > 1 && e.reused === "ref") {
      i(c);
      continue;
    }
  }
}
s(extractDefs, "extractDefs");
function finalize(e, n) {
  let r = e.seen.get(n);
  if (!r) throw new Error("Unprocessed schema. This is a bug in Zod.");
  let a = s((c) => {
    let l = e.seen.get(c);
    if (l.ref === null) return;
    let p = l.def ?? l.schema,
      u = { ...p },
      h = l.ref;
    if (((l.ref = null), h)) {
      a(h);
      let k = e.seen.get(h),
        I = k.schema;
      if (
        (I.$ref &&
        (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0")
          ? ((p.allOf = p.allOf ?? []), p.allOf.push(I))
          : Object.assign(p, I),
        Object.assign(p, u),
        c._zod.parent === h)
      )
        for (let B in p) B === "$ref" || B === "allOf" || B in u || delete p[B];
      if (I.$ref && k.def)
        for (let B in p)
          B === "$ref" ||
            B === "allOf" ||
            (B in k.def && JSON.stringify(p[B]) === JSON.stringify(k.def[B]) && delete p[B]);
    }
    let S = c._zod.parent;
    if (S && S !== h) {
      a(S);
      let k = e.seen.get(S);
      if (k?.schema.$ref && ((p.$ref = k.schema.$ref), k.def))
        for (let I in p)
          I === "$ref" ||
            I === "allOf" ||
            (I in k.def && JSON.stringify(p[I]) === JSON.stringify(k.def[I]) && delete p[I]);
    }
    e.override({ zodSchema: c, jsonSchema: p, path: l.path ?? [] });
  }, "flattenRef");
  for (let c of [...e.seen.entries()].reverse()) a(c[0]);
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
    let c = e.external.registry.get(n)?.id;
    if (!c) throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(c);
  }
  Object.assign(o, r.def ?? r.schema);
  let i = e.external?.defs ?? {};
  for (let c of e.seen.entries()) {
    let l = c[1];
    l.def && l.defId && (i[l.defId] = l.def);
  }
  e.external ||
    (Object.keys(i).length > 0 &&
      (e.target === "draft-2020-12" ? (o.$defs = i) : (o.definitions = i)));
  try {
    let c = JSON.parse(JSON.stringify(o));
    return (
      Object.defineProperty(c, "~standard", {
        value: {
          ...n["~standard"],
          jsonSchema: {
            input: kt(n, "input", e.processors),
            output: kt(n, "output", e.processors),
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
function isTransforming(e, n) {
  let r = n ?? { seen: new Set() };
  if (r.seen.has(e)) return !1;
  r.seen.add(e);
  let a = e._zod.def;
  if (a.type === "transform") return !0;
  if (a.type === "array") return isTransforming(a.element, r);
  if (a.type === "set") return isTransforming(a.valueType, r);
  if (a.type === "lazy") return isTransforming(a.getter(), r);
  if (
    a.type === "promise" ||
    a.type === "optional" ||
    a.type === "nonoptional" ||
    a.type === "nullable" ||
    a.type === "readonly" ||
    a.type === "default" ||
    a.type === "prefault"
  )
    return isTransforming(a.innerType, r);
  if (a.type === "intersection") return isTransforming(a.left, r) || isTransforming(a.right, r);
  if (a.type === "record" || a.type === "map") return isTransforming(a.keyType, r) || isTransforming(a.valueType, r);
  if (a.type === "pipe") return isTransforming(a.in, r) || isTransforming(a.out, r);
  if (a.type === "object") {
    for (let o in a.shape) if (isTransforming(a.shape[o], r)) return !0;
    return !1;
  }
  if (a.type === "union") {
    for (let o of a.options) if (isTransforming(o, r)) return !0;
    return !1;
  }
  if (a.type === "tuple") {
    for (let o of a.items) if (isTransforming(o, r)) return !0;
    return !!(a.rest && isTransforming(a.rest, r));
  }
  return !1;
}
s(isTransforming, "isTransforming");
var Pc = s(
    (e, n = {}) =>
      (r) => {
        let a = initializeContext({ ...r, processors: n });
        return (D(e, a), extractDefs(a, e), finalize(a, e));
      },
    "createToJSONSchemaMethod",
  ),
  kt = s(
    (e, n, r = {}) =>
      (a) => {
        let { libraryOptions: o, target: i } = a ?? {},
          c = initializeContext({ ...(o ?? {}), target: i, io: n, processors: r });
        return (D(e, c), extractDefs(c, e), finalize(c, e));
      },
    "createStandardJSONSchemaMethod",
  );
var eb = { guid: "uuid", url: "uri", datetime: "date-time", json_string: "json-string", regex: "" },
  Tc = s((e, n, r, a) => {
    let o = r;
    o.type = "string";
    let { minimum: i, maximum: c, format: l, patterns: p, contentEncoding: u } = e._zod.bag;
    if (
      (typeof i == "number" && (o.minLength = i),
      typeof c == "number" && (o.maxLength = c),
      l &&
        ((o.format = eb[l] ?? l),
        o.format === "" && delete o.format,
        l === "time" && delete o.format),
      u && (o.contentEncoding = u),
      p && p.size > 0)
    ) {
      let h = [...p];
      h.length === 1
        ? (o.pattern = h[0].source)
        : h.length > 1 &&
          (o.allOf = [
            ...h.map((S) => ({
              ...(n.target === "draft-07" || n.target === "draft-04" || n.target === "openapi-3.0"
                ? { type: "string" }
                : {}),
              pattern: S.source,
            })),
          ]);
    }
  }, "stringProcessor"),
  wc = s((e, n, r, a) => {
    let o = r,
      {
        minimum: i,
        maximum: c,
        format: l,
        multipleOf: p,
        exclusiveMaximum: u,
        exclusiveMinimum: h,
      } = e._zod.bag;
    (typeof l == "string" && l.includes("int") ? (o.type = "integer") : (o.type = "number"),
      typeof h == "number" &&
        (n.target === "draft-04" || n.target === "openapi-3.0"
          ? ((o.minimum = h), (o.exclusiveMinimum = !0))
          : (o.exclusiveMinimum = h)),
      typeof i == "number" &&
        ((o.minimum = i),
        typeof h == "number" &&
          n.target !== "draft-04" &&
          (h >= i ? delete o.minimum : delete o.exclusiveMinimum)),
      typeof u == "number" &&
        (n.target === "draft-04" || n.target === "openapi-3.0"
          ? ((o.maximum = u), (o.exclusiveMaximum = !0))
          : (o.exclusiveMaximum = u)),
      typeof c == "number" &&
        ((o.maximum = c),
        typeof u == "number" &&
          n.target !== "draft-04" &&
          (u <= c ? delete o.maximum : delete o.exclusiveMaximum)),
      typeof p == "number" && (o.multipleOf = p));
  }, "numberProcessor"),
  Ec = s((e, n, r, a) => {
    r.type = "boolean";
  }, "booleanProcessor"),
  Oc = s((e, n, r, a) => {
    if (n.unrepresentable === "throw")
      throw new Error("BigInt cannot be represented in JSON Schema");
  }, "bigintProcessor"),
  Ac = s((e, n, r, a) => {
    if (n.unrepresentable === "throw")
      throw new Error("Symbols cannot be represented in JSON Schema");
  }, "symbolProcessor"),
  zc = s((e, n, r, a) => {
    n.target === "openapi-3.0"
      ? ((r.type = "string"), (r.nullable = !0), (r.enum = [null]))
      : (r.type = "null");
  }, "nullProcessor"),
  Mc = s((e, n, r, a) => {
    if (n.unrepresentable === "throw")
      throw new Error("Undefined cannot be represented in JSON Schema");
  }, "undefinedProcessor"),
  $c = s((e, n, r, a) => {
    if (n.unrepresentable === "throw") throw new Error("Void cannot be represented in JSON Schema");
  }, "voidProcessor"),
  Dc = s((e, n, r, a) => {
    r.not = {};
  }, "neverProcessor"),
  Uc = s((e, n, r, a) => {}, "anyProcessor"),
  Nc = s((e, n, r, a) => {}, "unknownProcessor"),
  Zc = s((e, n, r, a) => {
    if (n.unrepresentable === "throw") throw new Error("Date cannot be represented in JSON Schema");
  }, "dateProcessor"),
  Bc = s((e, n, r, a) => {
    let o = e._zod.def,
      i = getEnumValues(o.entries);
    (i.every((c) => typeof c == "number") && (r.type = "number"),
      i.every((c) => typeof c == "string") && (r.type = "string"),
      (r.enum = i));
  }, "enumProcessor"),
  jc = s((e, n, r, a) => {
    let o = e._zod.def,
      i = [];
    for (let c of o.values)
      if (c === void 0) {
        if (n.unrepresentable === "throw")
          throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      } else if (typeof c == "bigint") {
        if (n.unrepresentable === "throw")
          throw new Error("BigInt literals cannot be represented in JSON Schema");
        i.push(Number(c));
      } else i.push(c);
    if (i.length !== 0)
      if (i.length === 1) {
        let c = i[0];
        ((r.type = c === null ? "null" : typeof c),
          n.target === "draft-04" || n.target === "openapi-3.0" ? (r.enum = [c]) : (r.const = c));
      } else
        (i.every((c) => typeof c == "number") && (r.type = "number"),
          i.every((c) => typeof c == "string") && (r.type = "string"),
          i.every((c) => typeof c == "boolean") && (r.type = "boolean"),
          i.every((c) => c === null) && (r.type = "null"),
          (r.enum = i));
  }, "literalProcessor"),
  Lc = s((e, n, r, a) => {
    if (n.unrepresentable === "throw") throw new Error("NaN cannot be represented in JSON Schema");
  }, "nanProcessor"),
  Wc = s((e, n, r, a) => {
    let o = r,
      i = e._zod.pattern;
    if (!i) throw new Error("Pattern not found in template literal");
    ((o.type = "string"), (o.pattern = i.source));
  }, "templateLiteralProcessor"),
  Fc = s((e, n, r, a) => {
    let o = r,
      i = { type: "string", format: "binary", contentEncoding: "binary" },
      { minimum: c, maximum: l, mime: p } = e._zod.bag;
    (c !== void 0 && (i.minLength = c),
      l !== void 0 && (i.maxLength = l),
      p
        ? p.length === 1
          ? ((i.contentMediaType = p[0]), Object.assign(o, i))
          : (Object.assign(o, i), (o.anyOf = p.map((u) => ({ contentMediaType: u }))))
        : Object.assign(o, i));
  }, "fileProcessor"),
  qc = s((e, n, r, a) => {
    r.type = "boolean";
  }, "successProcessor"),
  Vc = s((e, n, r, a) => {
    if (n.unrepresentable === "throw")
      throw new Error("Custom types cannot be represented in JSON Schema");
  }, "customProcessor"),
  Gc = s((e, n, r, a) => {
    if (n.unrepresentable === "throw")
      throw new Error("Function types cannot be represented in JSON Schema");
  }, "functionProcessor"),
  Kc = s((e, n, r, a) => {
    if (n.unrepresentable === "throw")
      throw new Error("Transforms cannot be represented in JSON Schema");
  }, "transformProcessor"),
  Hc = s((e, n, r, a) => {
    if (n.unrepresentable === "throw") throw new Error("Map cannot be represented in JSON Schema");
  }, "mapProcessor"),
  Jc = s((e, n, r, a) => {
    if (n.unrepresentable === "throw") throw new Error("Set cannot be represented in JSON Schema");
  }, "setProcessor"),
  Yc = s((e, n, r, a) => {
    let o = r,
      i = e._zod.def,
      { minimum: c, maximum: l } = e._zod.bag;
    (typeof c == "number" && (o.minItems = c),
      typeof l == "number" && (o.maxItems = l),
      (o.type = "array"),
      (o.items = D(i.element, n, { ...a, path: [...a.path, "items"] })));
  }, "arrayProcessor"),
  Xc = s((e, n, r, a) => {
    let o = r,
      i = e._zod.def;
    ((o.type = "object"), (o.properties = {}));
    let c = i.shape;
    for (let u in c) o.properties[u] = D(c[u], n, { ...a, path: [...a.path, "properties", u] });
    let l = new Set(Object.keys(c)),
      p = new Set(
        [...l].filter((u) => {
          let h = i.shape[u]._zod;
          return n.io === "input" ? h.optin === void 0 : h.optout === void 0;
        }),
      );
    (p.size > 0 && (o.required = Array.from(p)),
      i.catchall?._zod.def.type === "never"
        ? (o.additionalProperties = !1)
        : i.catchall
          ? i.catchall &&
            (o.additionalProperties = D(i.catchall, n, {
              ...a,
              path: [...a.path, "additionalProperties"],
            }))
          : n.io === "output" && (o.additionalProperties = !1));
  }, "objectProcessor"),
  An = s((e, n, r, a) => {
    let o = e._zod.def,
      i = o.inclusive === !1,
      c = o.options.map((l, p) => D(l, n, { ...a, path: [...a.path, i ? "oneOf" : "anyOf", p] }));
    i ? (r.oneOf = c) : (r.anyOf = c);
  }, "unionProcessor"),
  Qc = s((e, n, r, a) => {
    let o = e._zod.def,
      i = D(o.left, n, { ...a, path: [...a.path, "allOf", 0] }),
      c = D(o.right, n, { ...a, path: [...a.path, "allOf", 1] }),
      l = s((u) => "allOf" in u && Object.keys(u).length === 1, "isSimpleIntersection"),
      p = [...(l(i) ? i.allOf : [i]), ...(l(c) ? c.allOf : [c])];
    r.allOf = p;
  }, "intersectionProcessor"),
  el = s((e, n, r, a) => {
    let o = r,
      i = e._zod.def;
    o.type = "array";
    let c = n.target === "draft-2020-12" ? "prefixItems" : "items",
      l = n.target === "draft-2020-12" || n.target === "openapi-3.0" ? "items" : "additionalItems",
      p = i.items.map((k, I) => D(k, n, { ...a, path: [...a.path, c, I] })),
      u = i.rest
        ? D(i.rest, n, {
            ...a,
            path: [...a.path, l, ...(n.target === "openapi-3.0" ? [i.items.length] : [])],
          })
        : null;
    n.target === "draft-2020-12"
      ? ((o.prefixItems = p), u && (o.items = u))
      : n.target === "openapi-3.0"
        ? ((o.items = { anyOf: p }),
          u && o.items.anyOf.push(u),
          (o.minItems = p.length),
          u || (o.maxItems = p.length))
        : ((o.items = p), u && (o.additionalItems = u));
    let { minimum: h, maximum: S } = e._zod.bag;
    (typeof h == "number" && (o.minItems = h), typeof S == "number" && (o.maxItems = S));
  }, "tupleProcessor"),
  tl = s((e, n, r, a) => {
    let o = r,
      i = e._zod.def;
    o.type = "object";
    let c = i.keyType,
      p = c._zod.bag?.patterns;
    if (i.mode === "loose" && p && p.size > 0) {
      let h = D(i.valueType, n, { ...a, path: [...a.path, "patternProperties", "*"] });
      o.patternProperties = {};
      for (let S of p) o.patternProperties[S.source] = h;
    } else
      ((n.target === "draft-07" || n.target === "draft-2020-12") &&
        (o.propertyNames = D(i.keyType, n, { ...a, path: [...a.path, "propertyNames"] })),
        (o.additionalProperties = D(i.valueType, n, {
          ...a,
          path: [...a.path, "additionalProperties"],
        })));
    let u = c._zod.values;
    if (u) {
      let h = [...u].filter((S) => typeof S == "string" || typeof S == "number");
      h.length > 0 && (o.required = h);
    }
  }, "recordProcessor"),
  ol = s((e, n, r, a) => {
    let o = e._zod.def,
      i = D(o.innerType, n, a),
      c = n.seen.get(e);
    n.target === "openapi-3.0"
      ? ((c.ref = o.innerType), (r.nullable = !0))
      : (r.anyOf = [i, { type: "null" }]);
  }, "nullableProcessor"),
  nl = s((e, n, r, a) => {
    let o = e._zod.def;
    D(o.innerType, n, a);
    let i = n.seen.get(e);
    i.ref = o.innerType;
  }, "nonoptionalProcessor"),
  rl = s((e, n, r, a) => {
    let o = e._zod.def;
    D(o.innerType, n, a);
    let i = n.seen.get(e);
    ((i.ref = o.innerType), (r.default = JSON.parse(JSON.stringify(o.defaultValue))));
  }, "defaultProcessor"),
  il = s((e, n, r, a) => {
    let o = e._zod.def;
    D(o.innerType, n, a);
    let i = n.seen.get(e);
    ((i.ref = o.innerType),
      n.io === "input" && (r._prefault = JSON.parse(JSON.stringify(o.defaultValue))));
  }, "prefaultProcessor"),
  al = s((e, n, r, a) => {
    let o = e._zod.def;
    D(o.innerType, n, a);
    let i = n.seen.get(e);
    i.ref = o.innerType;
    let c;
    try {
      c = o.catchValue(void 0);
    } catch {
      throw new Error("Dynamic catch values are not supported in JSON Schema");
    }
    r.default = c;
  }, "catchProcessor"),
  sl = s((e, n, r, a) => {
    let o = e._zod.def,
      i = n.io === "input" ? (o.in._zod.def.type === "transform" ? o.out : o.in) : o.out;
    D(i, n, a);
    let c = n.seen.get(e);
    c.ref = i;
  }, "pipeProcessor"),
  cl = s((e, n, r, a) => {
    let o = e._zod.def;
    D(o.innerType, n, a);
    let i = n.seen.get(e);
    ((i.ref = o.innerType), (r.readOnly = !0));
  }, "readonlyProcessor"),
  ll = s((e, n, r, a) => {
    let o = e._zod.def;
    D(o.innerType, n, a);
    let i = n.seen.get(e);
    i.ref = o.innerType;
  }, "promiseProcessor"),
  zn = s((e, n, r, a) => {
    let o = e._zod.def;
    D(o.innerType, n, a);
    let i = n.seen.get(e);
    i.ref = o.innerType;
  }, "optionalProcessor"),
  dl = s((e, n, r, a) => {
    let o = e._zod.innerType;
    D(o, n, a);
    let i = n.seen.get(e);
    i.ref = o;
  }, "lazyProcessor"),
  On = {
    string: Tc,
    number: wc,
    boolean: Ec,
    bigint: Oc,
    symbol: Ac,
    null: zc,
    undefined: Mc,
    void: $c,
    never: Dc,
    any: Uc,
    unknown: Nc,
    date: Zc,
    enum: Bc,
    literal: jc,
    nan: Lc,
    template_literal: Wc,
    file: Fc,
    success: qc,
    custom: Vc,
    function: Gc,
    transform: Kc,
    map: Hc,
    set: Jc,
    array: Yc,
    object: Xc,
    union: An,
    intersection: Qc,
    tuple: el,
    record: tl,
    nullable: ol,
    nonoptional: nl,
    default: rl,
    prefault: il,
    catch: al,
    pipe: sl,
    readonly: cl,
    promise: ll,
    optional: zn,
    lazy: dl,
  };
function toJSONSchema(e, n) {
  if ("_idmap" in e) {
    let a = e,
      o = initializeContext({ ...n, processors: On }),
      i = {};
    for (let p of a._idmap.entries()) {
      let [u, h] = p;
      D(h, o);
    }
    let c = {},
      l = { registry: a, uri: n?.uri, defs: i };
    o.external = l;
    for (let p of a._idmap.entries()) {
      let [u, h] = p;
      (extractDefs(o, h), (c[u] = finalize(o, h)));
    }
    if (Object.keys(i).length > 0) {
      let p = o.target === "draft-2020-12" ? "$defs" : "definitions";
      c.__shared = { [p]: i };
    }
    return { schemas: c };
  }
  let r = initializeContext({ ...n, processors: On });
  return (D(e, r), extractDefs(r, e), finalize(r, e));
}
s(toJSONSchema, "toJSONSchema");
var $n = class {
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
  set counter(n) {
    this.ctx.counter = n;
  }
  get seen() {
    return this.ctx.seen;
  }
  constructor(n) {
    let r = n?.target ?? "draft-2020-12";
    (r === "draft-4" && (r = "draft-04"),
      r === "draft-7" && (r = "draft-07"),
      (this.ctx = initializeContext({
        processors: On,
        target: r,
        ...(n?.metadata && { metadata: n.metadata }),
        ...(n?.unrepresentable && { unrepresentable: n.unrepresentable }),
        ...(n?.override && { override: n.override }),
        ...(n?.io && { io: n.io }),
      })));
  }
  process(n, r = { path: [], schemaPath: [] }) {
    return D(n, this.ctx, r);
  }
  emit(n, r) {
    (r &&
      (r.cycles && (this.ctx.cycles = r.cycles),
      r.reused && (this.ctx.reused = r.reused),
      r.external && (this.ctx.external = r.external)),
      extractDefs(this.ctx, n));
    let a = finalize(this.ctx, n),
      { "~standard": o, ...i } = a;
    return i;
  }
};
var Qu = {};
var lo = {};
ve(lo, {
  ZodAny: () => Ml,
  ZodArray: () => Nl,
  ZodBase64: () => or,
  ZodBase64URL: () => nr,
  ZodBigInt: () => Tt,
  ZodBigIntFormat: () => ar,
  ZodBoolean: () => Pt,
  ZodCIDRv4: () => er,
  ZodCIDRv6: () => tr,
  ZodCUID: () => Gn,
  ZodCUID2: () => Kn,
  ZodCatch: () => ad,
  ZodCodec: () => gr,
  ZodCustom: () => ko,
  ZodCustomStringFormat: () => Ct,
  ZodDate: () => ho,
  ZodDefault: () => ed,
  ZodDiscriminatedUnion: () => Bl,
  ZodE164: () => rr,
  ZodEmail: () => Fn,
  ZodEmoji: () => qn,
  ZodEnum: () => xt,
  ZodExactOptional: () => Yl,
  ZodFile: () => Hl,
  ZodFunction: () => fd,
  ZodGUID: () => uo,
  ZodIPv4: () => Xn,
  ZodIPv6: () => Qn,
  ZodIntersection: () => jl,
  ZodJWT: () => ir,
  ZodKSUID: () => Yn,
  ZodLazy: () => pd,
  ZodLiteral: () => Kl,
  ZodMAC: () => Pl,
  ZodMap: () => Vl,
  ZodNaN: () => cd,
  ZodNanoID: () => Vn,
  ZodNever: () => Dl,
  ZodNonOptional: () => pr,
  ZodNull: () => Al,
  ZodNullable: () => Ql,
  ZodNumber: () => Rt,
  ZodNumberFormat: () => Ve,
  ZodObject: () => bo,
  ZodOptional: () => ur,
  ZodPipe: () => mr,
  ZodPrefault: () => od,
  ZodPromise: () => gd,
  ZodReadonly: () => ld,
  ZodRecord: () => So,
  ZodSet: () => Gl,
  ZodString: () => It,
  ZodStringFormat: () => N,
  ZodSuccess: () => id,
  ZodSymbol: () => El,
  ZodTemplateLiteral: () => ud,
  ZodTransform: () => Jl,
  ZodTuple: () => Wl,
  ZodType: () => O,
  ZodULID: () => Hn,
  ZodURL: () => fo,
  ZodUUID: () => ye,
  ZodUndefined: () => Ol,
  ZodUnion: () => vo,
  ZodUnknown: () => $l,
  ZodVoid: () => Ul,
  ZodXID: () => Jn,
  ZodXor: () => Zl,
  _ZodString: () => Wn,
  _default: () => td,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base64,
  base64url: () => base64url,
  bigint: () => bigint,
  boolean: () => boolean,
  catch: () => sd,
  check: () => check,
  cidrv4: () => cidrv4,
  cidrv6: () => cidrv6,
  codec: () => codec,
  cuid: () => cuid,
  cuid2: () => cuid2,
  custom: () => custom,
  date: () => Bp,
  describe: () => lm,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e164,
  email: () => email,
  emoji: () => lp,
  enum: () => lr,
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
  meta: () => dm,
  nan: () => nan,
  nanoid: () => nanoid,
  nativeEnum: () => nativeEnum,
  never: () => never,
  nonoptional: () => nonoptional,
  null: () => zl,
  nullable: () => nullable,
  nullish: () => em,
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
  stringbool: () => pm,
  success: () => success,
  superRefine: () => superRefine,
  symbol: () => symbol,
  templateLiteral: () => templateLiteral,
  transform: () => transform,
  tuple: () => tuple,
  uint32: () => uint32,
  uint64: () => uint64,
  ulid: () => ulid,
  undefined: () => Up,
  union: () => union,
  unknown: () => unknown,
  url: () => url,
  uuid: () => uuid,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => Zp,
  xid: () => xid,
  xor: () => xor,
});
var Dn = {};
ve(Dn, {
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
var _t = {};
ve(_t, {
  ZodISODate: () => Nn,
  ZodISODateTime: () => Un,
  ZodISODuration: () => Bn,
  ZodISOTime: () => Zn,
  date: () => date,
  datetime: () => ul,
  duration: () => duration,
  time: () => ml,
});
var Un = $constructor("ZodISODateTime", (e, n) => {
  (Ji.init(e, n), N.init(e, n));
});
function ul(e) {
  return _isoDateTime(Un, e);
}
s(ul, "datetime");
var Nn = $constructor("ZodISODate", (e, n) => {
  (Yi.init(e, n), N.init(e, n));
});
function date(e) {
  return _isoDate(Nn, e);
}
s(date, "date");
var Zn = $constructor("ZodISOTime", (e, n) => {
  (Xi.init(e, n), N.init(e, n));
});
function ml(e) {
  return _isoTime(Zn, e);
}
s(ml, "time");
var Bn = $constructor("ZodISODuration", (e, n) => {
  (Qi.init(e, n), N.init(e, n));
});
function duration(e) {
  return _isoDuration(Bn, e);
}
s(duration, "duration");
var ep = s((e, n) => {
    (Gt.init(e, n),
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
  ob = $constructor("ZodError", ep),
  te = $constructor("ZodError", ep, { Parent: Error });
var fl = ot(te),
  hl = nt(te),
  yl = rt(te),
  bl = it(te),
  vl = Do(te),
  Sl = Uo(te),
  kl = No(te),
  _l = Zo(te),
  xl = Bo(te),
  Il = jo(te),
  Cl = Lo(te),
  Rl = Wo(te);
var O = $constructor(
    "ZodType",
    (e, n) => (
      E.init(e, n),
      Object.assign(e["~standard"], {
        jsonSchema: { input: kt(e, "input"), output: kt(e, "output") },
      }),
      (e.toJSONSchema = Pc(e, {})),
      (e.def = n),
      (e.type = n.type),
      Object.defineProperty(e, "_def", { value: n }),
      (e.check = (...r) =>
        e.clone(
          C.mergeDefs(n, {
            checks: [
              ...(n.checks ?? []),
              ...r.map((a) =>
                typeof a == "function"
                  ? { _zod: { check: a, def: { check: "custom" }, onattach: [] } }
                  : a,
              ),
            ],
          }),
          { parent: !0 },
        )),
      (e.with = e.check),
      (e.clone = (r, a) => clone(e, r, a)),
      (e.brand = () => e),
      (e.register = (r, a) => (r.add(e, a), e)),
      (e.parse = (r, a) => fl(e, r, a, { callee: e.parse })),
      (e.safeParse = (r, a) => yl(e, r, a)),
      (e.parseAsync = async (r, a) => hl(e, r, a, { callee: e.parseAsync })),
      (e.safeParseAsync = async (r, a) => bl(e, r, a)),
      (e.spa = e.safeParseAsync),
      (e.encode = (r, a) => vl(e, r, a)),
      (e.decode = (r, a) => Sl(e, r, a)),
      (e.encodeAsync = async (r, a) => kl(e, r, a)),
      (e.decodeAsync = async (r, a) => _l(e, r, a)),
      (e.safeEncode = (r, a) => xl(e, r, a)),
      (e.safeDecode = (r, a) => Il(e, r, a)),
      (e.safeEncodeAsync = async (r, a) => Cl(e, r, a)),
      (e.safeDecodeAsync = async (r, a) => Rl(e, r, a)),
      (e.refine = (r, a) => e.check(refine(r, a))),
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
      (e.default = (r) => td(e, r)),
      (e.prefault = (r) => prefault(e, r)),
      (e.catch = (r) => sd(e, r)),
      (e.pipe = (r) => pipe(e, r)),
      (e.readonly = () => readonly(e)),
      (e.describe = (r) => {
        let a = e.clone();
        return (V.add(a, { description: r }), a);
      }),
      Object.defineProperty(e, "description", {
        get() {
          return V.get(e)?.description;
        },
        configurable: !0,
      }),
      (e.meta = (...r) => {
        if (r.length === 0) return V.get(e);
        let a = e.clone();
        return (V.add(a, r[0]), a);
      }),
      (e.isOptional = () => e.safeParse(void 0).success),
      (e.isNullable = () => e.safeParse(null).success),
      (e.apply = (r) => r(e)),
      e
    ),
  ),
  Wn = $constructor("_ZodString", (e, n) => {
    (je.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (a, o, i) => Tc(e, a, o, i)));
    let r = e._zod.bag;
    ((e.format = r.format ?? null),
      (e.minLength = r.minimum ?? null),
      (e.maxLength = r.maximum ?? null),
      (e.regex = (...a) => e.check(_regex(...a))),
      (e.includes = (...a) => e.check(_includes(...a))),
      (e.startsWith = (...a) => e.check(_startsWith(...a))),
      (e.endsWith = (...a) => e.check(_endsWith(...a))),
      (e.min = (...a) => e.check(_minLength(...a))),
      (e.max = (...a) => e.check(_maxLength(...a))),
      (e.length = (...a) => e.check(_length(...a))),
      (e.nonempty = (...a) => e.check(_minLength(1, ...a))),
      (e.lowercase = (a) => e.check(_lowercase(a))),
      (e.uppercase = (a) => e.check(_uppercase(a))),
      (e.trim = () => e.check(_trim())),
      (e.normalize = (...a) => e.check(_normalize(...a))),
      (e.toLowerCase = () => e.check(_toLowerCase())),
      (e.toUpperCase = () => e.check(_toUpperCase())),
      (e.slugify = () => e.check(_slugify())));
  }),
  It = $constructor("ZodString", (e, n) => {
    (je.init(e, n),
      Wn.init(e, n),
      (e.email = (r) => e.check(_email(Fn, r))),
      (e.url = (r) => e.check(_url(fo, r))),
      (e.jwt = (r) => e.check(_jwt(ir, r))),
      (e.emoji = (r) => e.check(_emoji(qn, r))),
      (e.guid = (r) => e.check(_guid(uo, r))),
      (e.uuid = (r) => e.check(_uuid(ye, r))),
      (e.uuidv4 = (r) => e.check(_uuidv4(ye, r))),
      (e.uuidv6 = (r) => e.check(_uuidv6(ye, r))),
      (e.uuidv7 = (r) => e.check(_uuidv7(ye, r))),
      (e.nanoid = (r) => e.check(_nanoid(Vn, r))),
      (e.guid = (r) => e.check(_guid(uo, r))),
      (e.cuid = (r) => e.check(_cuid(Gn, r))),
      (e.cuid2 = (r) => e.check(_cuid2(Kn, r))),
      (e.ulid = (r) => e.check(_ulid(Hn, r))),
      (e.base64 = (r) => e.check(_base64(or, r))),
      (e.base64url = (r) => e.check(_base64url(nr, r))),
      (e.xid = (r) => e.check(_xid(Jn, r))),
      (e.ksuid = (r) => e.check(_ksuid(Yn, r))),
      (e.ipv4 = (r) => e.check(_ipv4(Xn, r))),
      (e.ipv6 = (r) => e.check(_ipv6(Qn, r))),
      (e.cidrv4 = (r) => e.check(_cidrv4(er, r))),
      (e.cidrv6 = (r) => e.check(_cidrv6(tr, r))),
      (e.e164 = (r) => e.check(_e164(rr, r))),
      (e.datetime = (r) => e.check(ul(r))),
      (e.date = (r) => e.check(date(r))),
      (e.time = (r) => e.check(ml(r))),
      (e.duration = (r) => e.check(duration(r))));
  });
function string(e) {
  return _string(It, e);
}
s(string, "string");
var N = $constructor("ZodStringFormat", (e, n) => {
    (U.init(e, n), Wn.init(e, n));
  }),
  Fn = $constructor("ZodEmail", (e, n) => {
    (ji.init(e, n), N.init(e, n));
  });
function email(e) {
  return _email(Fn, e);
}
s(email, "email");
var uo = $constructor("ZodGUID", (e, n) => {
  (Zi.init(e, n), N.init(e, n));
});
function guid(e) {
  return _guid(uo, e);
}
s(guid, "guid");
var ye = $constructor("ZodUUID", (e, n) => {
  (Bi.init(e, n), N.init(e, n));
});
function uuid(e) {
  return _uuid(ye, e);
}
s(uuid, "uuid");
function uuidv4(e) {
  return _uuidv4(ye, e);
}
s(uuidv4, "uuidv4");
function uuidv6(e) {
  return _uuidv6(ye, e);
}
s(uuidv6, "uuidv6");
function uuidv7(e) {
  return _uuidv7(ye, e);
}
s(uuidv7, "uuidv7");
var fo = $constructor("ZodURL", (e, n) => {
  (Li.init(e, n), N.init(e, n));
});
function url(e) {
  return _url(fo, e);
}
s(url, "url");
function httpUrl(e) {
  return _url(fo, { protocol: /^https?$/, hostname: le.domain, ...C.normalizeParams(e) });
}
s(httpUrl, "httpUrl");
var qn = $constructor("ZodEmoji", (e, n) => {
  (Wi.init(e, n), N.init(e, n));
});
function lp(e) {
  return _emoji(qn, e);
}
s(lp, "emoji");
var Vn = $constructor("ZodNanoID", (e, n) => {
  (Fi.init(e, n), N.init(e, n));
});
function nanoid(e) {
  return _nanoid(Vn, e);
}
s(nanoid, "nanoid");
var Gn = $constructor("ZodCUID", (e, n) => {
  (qi.init(e, n), N.init(e, n));
});
function cuid(e) {
  return _cuid(Gn, e);
}
s(cuid, "cuid");
var Kn = $constructor("ZodCUID2", (e, n) => {
  (Vi.init(e, n), N.init(e, n));
});
function cuid2(e) {
  return _cuid2(Kn, e);
}
s(cuid2, "cuid2");
var Hn = $constructor("ZodULID", (e, n) => {
  (Gi.init(e, n), N.init(e, n));
});
function ulid(e) {
  return _ulid(Hn, e);
}
s(ulid, "ulid");
var Jn = $constructor("ZodXID", (e, n) => {
  (Ki.init(e, n), N.init(e, n));
});
function xid(e) {
  return _xid(Jn, e);
}
s(xid, "xid");
var Yn = $constructor("ZodKSUID", (e, n) => {
  (Hi.init(e, n), N.init(e, n));
});
function ksuid(e) {
  return _ksuid(Yn, e);
}
s(ksuid, "ksuid");
var Xn = $constructor("ZodIPv4", (e, n) => {
  (ea.init(e, n), N.init(e, n));
});
function ipv4(e) {
  return _ipv4(Xn, e);
}
s(ipv4, "ipv4");
var Pl = $constructor("ZodMAC", (e, n) => {
  (oa.init(e, n), N.init(e, n));
});
function mac(e) {
  return _mac(Pl, e);
}
s(mac, "mac");
var Qn = $constructor("ZodIPv6", (e, n) => {
  (ta.init(e, n), N.init(e, n));
});
function ipv6(e) {
  return _ipv6(Qn, e);
}
s(ipv6, "ipv6");
var er = $constructor("ZodCIDRv4", (e, n) => {
  (na.init(e, n), N.init(e, n));
});
function cidrv4(e) {
  return _cidrv4(er, e);
}
s(cidrv4, "cidrv4");
var tr = $constructor("ZodCIDRv6", (e, n) => {
  (ra.init(e, n), N.init(e, n));
});
function cidrv6(e) {
  return _cidrv6(tr, e);
}
s(cidrv6, "cidrv6");
var or = $constructor("ZodBase64", (e, n) => {
  (aa.init(e, n), N.init(e, n));
});
function base64(e) {
  return _base64(or, e);
}
s(base64, "base64");
var nr = $constructor("ZodBase64URL", (e, n) => {
  (sa.init(e, n), N.init(e, n));
});
function base64url(e) {
  return _base64url(nr, e);
}
s(base64url, "base64url");
var rr = $constructor("ZodE164", (e, n) => {
  (ca.init(e, n), N.init(e, n));
});
function e164(e) {
  return _e164(rr, e);
}
s(e164, "e164");
var ir = $constructor("ZodJWT", (e, n) => {
  (la.init(e, n), N.init(e, n));
});
function jwt(e) {
  return _jwt(ir, e);
}
s(jwt, "jwt");
var Ct = $constructor("ZodCustomStringFormat", (e, n) => {
  (da.init(e, n), N.init(e, n));
});
function stringFormat(e, n, r = {}) {
  return _stringFormat(Ct, e, n, r);
}
s(stringFormat, "stringFormat");
function hostname(e) {
  return _stringFormat(Ct, "hostname", le.hostname, e);
}
s(hostname, "hostname");
function hex(e) {
  return _stringFormat(Ct, "hex", le.hex, e);
}
s(hex, "hex");
function hash(e, n) {
  let r = n?.enc ?? "hex",
    a = `${e}_${r}`,
    o = le[a];
  if (!o) throw new Error(`Unrecognized hash format: ${a}`);
  return _stringFormat(Ct, a, o, n);
}
s(hash, "hash");
var Rt = $constructor("ZodNumber", (e, n) => {
  (Qo.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (a, o, i) => wc(e, a, o, i)),
    (e.gt = (a, o) => e.check(_gt(a, o))),
    (e.gte = (a, o) => e.check(_gte(a, o))),
    (e.min = (a, o) => e.check(_gte(a, o))),
    (e.lt = (a, o) => e.check(_lt(a, o))),
    (e.lte = (a, o) => e.check(_lte(a, o))),
    (e.max = (a, o) => e.check(_lte(a, o))),
    (e.int = (a) => e.check(int(a))),
    (e.safe = (a) => e.check(int(a))),
    (e.positive = (a) => e.check(_gt(0, a))),
    (e.nonnegative = (a) => e.check(_gte(0, a))),
    (e.negative = (a) => e.check(_lt(0, a))),
    (e.nonpositive = (a) => e.check(_lte(0, a))),
    (e.multipleOf = (a, o) => e.check(_multipleOf(a, o))),
    (e.step = (a, o) => e.check(_multipleOf(a, o))),
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
  return _number(Rt, e);
}
s(number, "number");
var Ve = $constructor("ZodNumberFormat", (e, n) => {
  (ua.init(e, n), Rt.init(e, n));
});
function int(e) {
  return _int(Ve, e);
}
s(int, "int");
function float32(e) {
  return _float32(Ve, e);
}
s(float32, "float32");
function float64(e) {
  return _float64(Ve, e);
}
s(float64, "float64");
function int32(e) {
  return _int32(Ve, e);
}
s(int32, "int32");
function uint32(e) {
  return _uint32(Ve, e);
}
s(uint32, "uint32");
var Pt = $constructor("ZodBoolean", (e, n) => {
  (Qt.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => Ec(e, r, a, o)));
});
function boolean(e) {
  return _boolean(Pt, e);
}
s(boolean, "boolean");
var Tt = $constructor("ZodBigInt", (e, n) => {
  (en.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (a, o, i) => Oc(e, a, o, i)),
    (e.gte = (a, o) => e.check(_gte(a, o))),
    (e.min = (a, o) => e.check(_gte(a, o))),
    (e.gt = (a, o) => e.check(_gt(a, o))),
    (e.gte = (a, o) => e.check(_gte(a, o))),
    (e.min = (a, o) => e.check(_gte(a, o))),
    (e.lt = (a, o) => e.check(_lt(a, o))),
    (e.lte = (a, o) => e.check(_lte(a, o))),
    (e.max = (a, o) => e.check(_lte(a, o))),
    (e.positive = (a) => e.check(_gt(BigInt(0), a))),
    (e.negative = (a) => e.check(_lt(BigInt(0), a))),
    (e.nonpositive = (a) => e.check(_lte(BigInt(0), a))),
    (e.nonnegative = (a) => e.check(_gte(BigInt(0), a))),
    (e.multipleOf = (a, o) => e.check(_multipleOf(a, o))));
  let r = e._zod.bag;
  ((e.minValue = r.minimum ?? null),
    (e.maxValue = r.maximum ?? null),
    (e.format = r.format ?? null));
});
function bigint(e) {
  return _bigint(Tt, e);
}
s(bigint, "bigint");
var ar = $constructor("ZodBigIntFormat", (e, n) => {
  (pa.init(e, n), Tt.init(e, n));
});
function int64(e) {
  return _int64(ar, e);
}
s(int64, "int64");
function uint64(e) {
  return _uint64(ar, e);
}
s(uint64, "uint64");
var El = $constructor("ZodSymbol", (e, n) => {
  (ma.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => Ac(e, r, a, o)));
});
function symbol(e) {
  return _symbol(El, e);
}
s(symbol, "symbol");
var Ol = $constructor("ZodUndefined", (e, n) => {
  (ga.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => Mc(e, r, a, o)));
});
function Up(e) {
  return _undefined(Ol, e);
}
s(Up, "_undefined");
var Al = $constructor("ZodNull", (e, n) => {
  (fa.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => zc(e, r, a, o)));
});
function zl(e) {
  return _null(Al, e);
}
s(zl, "_null");
var Ml = $constructor("ZodAny", (e, n) => {
  (ha.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => Uc(e, r, a, o)));
});
function any() {
  return _any(Ml);
}
s(any, "any");
var $l = $constructor("ZodUnknown", (e, n) => {
  (ya.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => Nc(e, r, a, o)));
});
function unknown() {
  return _unknown($l);
}
s(unknown, "unknown");
var Dl = $constructor("ZodNever", (e, n) => {
  (ba.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => Dc(e, r, a, o)));
});
function never(e) {
  return _never(Dl, e);
}
s(never, "never");
var Ul = $constructor("ZodVoid", (e, n) => {
  (va.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => $c(e, r, a, o)));
});
function Zp(e) {
  return _void(Ul, e);
}
s(Zp, "_void");
var ho = $constructor("ZodDate", (e, n) => {
  (Sa.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (a, o, i) => Zc(e, a, o, i)),
    (e.min = (a, o) => e.check(_gte(a, o))),
    (e.max = (a, o) => e.check(_lte(a, o))));
  let r = e._zod.bag;
  ((e.minDate = r.minimum ? new Date(r.minimum) : null),
    (e.maxDate = r.maximum ? new Date(r.maximum) : null));
});
function Bp(e) {
  return _date(ho, e);
}
s(Bp, "date");
var Nl = $constructor("ZodArray", (e, n) => {
  (ka.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => Yc(e, r, a, o)),
    (e.element = n.element),
    (e.min = (r, a) => e.check(_minLength(r, a))),
    (e.nonempty = (r) => e.check(_minLength(1, r))),
    (e.max = (r, a) => e.check(_maxLength(r, a))),
    (e.length = (r, a) => e.check(_length(r, a))),
    (e.unwrap = () => e.element));
});
function array(e, n) {
  return _array(Nl, e, n);
}
s(array, "array");
function keyof(e) {
  let n = e._zod.def.shape;
  return lr(Object.keys(n));
}
s(keyof, "keyof");
var bo = $constructor("ZodObject", (e, n) => {
  (_a.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => Xc(e, r, a, o)),
    C.defineLazy(e, "shape", () => n.shape),
    (e.keyof = () => lr(Object.keys(e._zod.def.shape))),
    (e.catchall = (r) => e.clone({ ...e._zod.def, catchall: r })),
    (e.passthrough = () => e.clone({ ...e._zod.def, catchall: unknown() })),
    (e.loose = () => e.clone({ ...e._zod.def, catchall: unknown() })),
    (e.strict = () => e.clone({ ...e._zod.def, catchall: never() })),
    (e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 })),
    (e.extend = (r) => C.extend(e, r)),
    (e.safeExtend = (r) => C.safeExtend(e, r)),
    (e.merge = (r) => C.merge(e, r)),
    (e.pick = (r) => C.pick(e, r)),
    (e.omit = (r) => C.omit(e, r)),
    (e.partial = (...r) => C.partial(ur, e, r[0])),
    (e.required = (...r) => C.required(pr, e, r[0])));
});
function object(e, n) {
  let r = { type: "object", shape: e ?? {}, ...C.normalizeParams(n) };
  return new bo(r);
}
s(object, "object");
function strictObject(e, n) {
  return new bo({ type: "object", shape: e, catchall: never(), ...C.normalizeParams(n) });
}
s(strictObject, "strictObject");
function looseObject(e, n) {
  return new bo({ type: "object", shape: e, catchall: unknown(), ...C.normalizeParams(n) });
}
s(looseObject, "looseObject");
var vo = $constructor("ZodUnion", (e, n) => {
  (eo.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => An(e, r, a, o)),
    (e.options = n.options));
});
function union(e, n) {
  return new vo({ type: "union", options: e, ...C.normalizeParams(n) });
}
s(union, "union");
var Zl = $constructor("ZodXor", (e, n) => {
  (vo.init(e, n),
    xa.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => An(e, r, a, o)),
    (e.options = n.options));
});
function xor(e, n) {
  return new Zl({ type: "union", options: e, inclusive: !1, ...C.normalizeParams(n) });
}
s(xor, "xor");
var Bl = $constructor("ZodDiscriminatedUnion", (e, n) => {
  (vo.init(e, n), Ia.init(e, n));
});
function discriminatedUnion(e, n, r) {
  return new Bl({ type: "union", options: n, discriminator: e, ...C.normalizeParams(r) });
}
s(discriminatedUnion, "discriminatedUnion");
var jl = $constructor("ZodIntersection", (e, n) => {
  (Ca.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => Qc(e, r, a, o)));
});
function intersection(e, n) {
  return new jl({ type: "intersection", left: e, right: n });
}
s(intersection, "intersection");
var Wl = $constructor("ZodTuple", (e, n) => {
  (tn.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => el(e, r, a, o)),
    (e.rest = (r) => e.clone({ ...e._zod.def, rest: r })));
});
function tuple(e, n, r) {
  let a = n instanceof E,
    o = a ? r : n,
    i = a ? n : null;
  return new Wl({ type: "tuple", items: e, rest: i, ...C.normalizeParams(o) });
}
s(tuple, "tuple");
var So = $constructor("ZodRecord", (e, n) => {
  (Ra.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => tl(e, r, a, o)),
    (e.keyType = n.keyType),
    (e.valueType = n.valueType));
});
function record(e, n, r) {
  return new So({ type: "record", keyType: e, valueType: n, ...C.normalizeParams(r) });
}
s(record, "record");
function partialRecord(e, n, r) {
  let a = clone(e);
  return (
    (a._zod.values = void 0),
    new So({ type: "record", keyType: a, valueType: n, ...C.normalizeParams(r) })
  );
}
s(partialRecord, "partialRecord");
function looseRecord(e, n, r) {
  return new So({
    type: "record",
    keyType: e,
    valueType: n,
    mode: "loose",
    ...C.normalizeParams(r),
  });
}
s(looseRecord, "looseRecord");
var Vl = $constructor("ZodMap", (e, n) => {
  (Pa.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => Hc(e, r, a, o)),
    (e.keyType = n.keyType),
    (e.valueType = n.valueType),
    (e.min = (...r) => e.check(_minSize(...r))),
    (e.nonempty = (r) => e.check(_minSize(1, r))),
    (e.max = (...r) => e.check(_maxSize(...r))),
    (e.size = (...r) => e.check(_size(...r))));
});
function map(e, n, r) {
  return new Vl({ type: "map", keyType: e, valueType: n, ...C.normalizeParams(r) });
}
s(map, "map");
var Gl = $constructor("ZodSet", (e, n) => {
  (Ta.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => Jc(e, r, a, o)),
    (e.min = (...r) => e.check(_minSize(...r))),
    (e.nonempty = (r) => e.check(_minSize(1, r))),
    (e.max = (...r) => e.check(_maxSize(...r))),
    (e.size = (...r) => e.check(_size(...r))));
});
function set(e, n) {
  return new Gl({ type: "set", valueType: e, ...C.normalizeParams(n) });
}
s(set, "set");
var xt = $constructor("ZodEnum", (e, n) => {
  (wa.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (a, o, i) => Bc(e, a, o, i)),
    (e.enum = n.entries),
    (e.options = Object.values(n.entries)));
  let r = new Set(Object.keys(n.entries));
  ((e.extract = (a, o) => {
    let i = {};
    for (let c of a)
      if (r.has(c)) i[c] = n.entries[c];
      else throw new Error(`Key ${c} not found in enum`);
    return new xt({ ...n, checks: [], ...C.normalizeParams(o), entries: i });
  }),
    (e.exclude = (a, o) => {
      let i = { ...n.entries };
      for (let c of a)
        if (r.has(c)) delete i[c];
        else throw new Error(`Key ${c} not found in enum`);
      return new xt({ ...n, checks: [], ...C.normalizeParams(o), entries: i });
    }));
});
function lr(e, n) {
  let r = Array.isArray(e) ? Object.fromEntries(e.map((a) => [a, a])) : e;
  return new xt({ type: "enum", entries: r, ...C.normalizeParams(n) });
}
s(lr, "_enum");
function nativeEnum(e, n) {
  return new xt({ type: "enum", entries: e, ...C.normalizeParams(n) });
}
s(nativeEnum, "nativeEnum");
var Kl = $constructor("ZodLiteral", (e, n) => {
  (Ea.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => jc(e, r, a, o)),
    (e.values = new Set(n.values)),
    Object.defineProperty(e, "value", {
      get() {
        if (n.values.length > 1)
          throw new Error(
            "This schema contains multiple valid literal values. Use `.values` instead.",
          );
        return n.values[0];
      },
    }));
});
function literal(e, n) {
  return new Kl({ type: "literal", values: Array.isArray(e) ? e : [e], ...C.normalizeParams(n) });
}
s(literal, "literal");
var Hl = $constructor("ZodFile", (e, n) => {
  (Oa.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => Fc(e, r, a, o)),
    (e.min = (r, a) => e.check(_minSize(r, a))),
    (e.max = (r, a) => e.check(_maxSize(r, a))),
    (e.mime = (r, a) => e.check(_mime(Array.isArray(r) ? r : [r], a))));
});
function file(e) {
  return _file(Hl, e);
}
s(file, "file");
var Jl = $constructor("ZodTransform", (e, n) => {
  (Aa.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => Kc(e, r, a, o)),
    (e._zod.parse = (r, a) => {
      if (a.direction === "backward") throw new Re(e.constructor.name);
      r.addIssue = (i) => {
        if (typeof i == "string") r.issues.push(C.issue(i, r.value, n));
        else {
          let c = i;
          (c.fatal && (c.continue = !1),
            c.code ?? (c.code = "custom"),
            c.input ?? (c.input = r.value),
            c.inst ?? (c.inst = e),
            r.issues.push(C.issue(c)));
        }
      };
      let o = n.transform(r.value, r);
      return o instanceof Promise ? o.then((i) => ((r.value = i), r)) : ((r.value = o), r);
    }));
});
function transform(e) {
  return new Jl({ type: "transform", transform: e });
}
s(transform, "transform");
var ur = $constructor("ZodOptional", (e, n) => {
  (on.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => zn(e, r, a, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function optional(e) {
  return new ur({ type: "optional", innerType: e });
}
s(optional, "optional");
var Yl = $constructor("ZodExactOptional", (e, n) => {
  (za.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => zn(e, r, a, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function exactOptional(e) {
  return new Yl({ type: "optional", innerType: e });
}
s(exactOptional, "exactOptional");
var Ql = $constructor("ZodNullable", (e, n) => {
  (Ma.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => ol(e, r, a, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function nullable(e) {
  return new Ql({ type: "nullable", innerType: e });
}
s(nullable, "nullable");
function em(e) {
  return optional(nullable(e));
}
s(em, "nullish");
var ed = $constructor("ZodDefault", (e, n) => {
  ($a.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => rl(e, r, a, o)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeDefault = e.unwrap));
});
function td(e, n) {
  return new ed({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof n == "function" ? n() : C.shallowClone(n);
    },
  });
}
s(td, "_default");
var od = $constructor("ZodPrefault", (e, n) => {
  (Da.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => il(e, r, a, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function prefault(e, n) {
  return new od({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof n == "function" ? n() : C.shallowClone(n);
    },
  });
}
s(prefault, "prefault");
var pr = $constructor("ZodNonOptional", (e, n) => {
  (Ua.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => nl(e, r, a, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function nonoptional(e, n) {
  return new pr({ type: "nonoptional", innerType: e, ...C.normalizeParams(n) });
}
s(nonoptional, "nonoptional");
var id = $constructor("ZodSuccess", (e, n) => {
  (Na.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => qc(e, r, a, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function success(e) {
  return new id({ type: "success", innerType: e });
}
s(success, "success");
var ad = $constructor("ZodCatch", (e, n) => {
  (Za.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => al(e, r, a, o)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeCatch = e.unwrap));
});
function sd(e, n) {
  return new ad({ type: "catch", innerType: e, catchValue: typeof n == "function" ? n : () => n });
}
s(sd, "_catch");
var cd = $constructor("ZodNaN", (e, n) => {
  (Ba.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => Lc(e, r, a, o)));
});
function nan(e) {
  return _nan(cd, e);
}
s(nan, "nan");
var mr = $constructor("ZodPipe", (e, n) => {
  (ja.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => sl(e, r, a, o)),
    (e.in = n.in),
    (e.out = n.out));
});
function pipe(e, n) {
  return new mr({ type: "pipe", in: e, out: n });
}
s(pipe, "pipe");
var gr = $constructor("ZodCodec", (e, n) => {
  (mr.init(e, n), to.init(e, n));
});
function codec(e, n, r) {
  return new gr({ type: "pipe", in: e, out: n, transform: r.decode, reverseTransform: r.encode });
}
s(codec, "codec");
var ld = $constructor("ZodReadonly", (e, n) => {
  (La.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => cl(e, r, a, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function readonly(e) {
  return new ld({ type: "readonly", innerType: e });
}
s(readonly, "readonly");
var ud = $constructor("ZodTemplateLiteral", (e, n) => {
  (Wa.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => Wc(e, r, a, o)));
});
function templateLiteral(e, n) {
  return new ud({ type: "template_literal", parts: e, ...C.normalizeParams(n) });
}
s(templateLiteral, "templateLiteral");
var pd = $constructor("ZodLazy", (e, n) => {
  (Va.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => dl(e, r, a, o)),
    (e.unwrap = () => e._zod.def.getter()));
});
function lazy(e) {
  return new pd({ type: "lazy", getter: e });
}
s(lazy, "lazy");
var gd = $constructor("ZodPromise", (e, n) => {
  (qa.init(e, n),
    O.init(e, n),
    (e._zod.processJSONSchema = (r, a, o) => ll(e, r, a, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function promise(e) {
  return new gd({ type: "promise", innerType: e });
}
s(promise, "promise");
var fd = $constructor("ZodFunction", (e, n) => {
  (Fa.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => Gc(e, r, a, o)));
});
function _function(e) {
  return new fd({
    type: "function",
    input: Array.isArray(e?.input) ? tuple(e?.input) : (e?.input ?? array(unknown())),
    output: e?.output ?? unknown(),
  });
}
s(_function, "_function");
var ko = $constructor("ZodCustom", (e, n) => {
  (Ga.init(e, n), O.init(e, n), (e._zod.processJSONSchema = (r, a, o) => Vc(e, r, a, o)));
});
function check(e) {
  let n = new Z({ check: "custom" });
  return ((n._zod.check = e), n);
}
s(check, "check");
function custom(e, n) {
  return _custom(ko, e ?? (() => !0), n);
}
s(custom, "custom");
function refine(e, n = {}) {
  return _refine(ko, e, n);
}
s(refine, "refine");
function superRefine(e) {
  return _superRefine(e);
}
s(superRefine, "superRefine");
var lm = describe,
  dm = meta;
function _instanceof(e, n = {}) {
  let r = new ko({
    type: "custom",
    check: "custom",
    fn: s((a) => a instanceof e, "fn"),
    abort: !0,
    ...C.normalizeParams(n),
  });
  return (
    (r._zod.bag.Class = e),
    (r._zod.check = (a) => {
      a.value instanceof e ||
        a.issues.push({
          code: "invalid_type",
          expected: e.name,
          input: a.value,
          inst: r,
          path: [...(r._zod.def.path ?? [])],
        });
    }),
    r
  );
}
s(_instanceof, "_instanceof");
var pm = s((...e) => _stringbool({ Codec: gr, Boolean: Pt, String: It }, ...e), "stringbool");
function json(e) {
  let n = lazy(() => union([string(e), number(), boolean(), zl(), array(n), record(string(), n)]));
  return n;
}
s(json, "json");
function preprocess(e, n) {
  return pipe(transform(e), n);
}
s(preprocess, "preprocess");
var rb = {
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
var bd;
bd || (bd = {});
var P = { ...lo, ...Dn, iso: _t },
  sb = new Set([
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
function detectVersion(e, n) {
  let r = e.$schema;
  return r === "https://json-schema.org/draft/2020-12/schema"
    ? "draft-2020-12"
    : r === "http://json-schema.org/draft-07/schema#"
      ? "draft-7"
      : r === "http://json-schema.org/draft-04/schema#"
        ? "draft-4"
        : (n ?? "draft-2020-12");
}
s(detectVersion, "detectVersion");
function resolveRef(e, n) {
  if (!e.startsWith("#"))
    throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
  let r = e.slice(1).split("/").filter(Boolean);
  if (r.length === 0) return n.rootSchema;
  let a = n.version === "draft-2020-12" ? "$defs" : "definitions";
  if (r[0] === a) {
    let o = r[1];
    if (!o || !n.defs[o]) throw new Error(`Reference not found: ${e}`);
    return n.defs[o];
  }
  throw new Error(`Reference not found: ${e}`);
}
s(resolveRef, "resolveRef");
function convertBaseSchema(e, n) {
  if (e.not !== void 0) {
    if (typeof e.not == "object" && Object.keys(e.not).length === 0) return P.never();
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
    if (n.refs.has(o)) return n.refs.get(o);
    if (n.processing.has(o))
      return P.lazy(() => {
        if (!n.refs.has(o)) throw new Error(`Circular reference not resolved: ${o}`);
        return n.refs.get(o);
      });
    n.processing.add(o);
    let i = resolveRef(o, n),
      c = convertSchema(i, n);
    return (n.refs.set(o, c), n.processing.delete(o), c);
  }
  if (e.enum !== void 0) {
    let o = e.enum;
    if (n.version === "openapi-3.0" && e.nullable === !0 && o.length === 1 && o[0] === null)
      return P.null();
    if (o.length === 0) return P.never();
    if (o.length === 1) return P.literal(o[0]);
    if (o.every((c) => typeof c == "string")) return P.enum(o);
    let i = o.map((c) => P.literal(c));
    return i.length < 2 ? i[0] : P.union([i[0], i[1], ...i.slice(2)]);
  }
  if (e.const !== void 0) return P.literal(e.const);
  let r = e.type;
  if (Array.isArray(r)) {
    let o = r.map((i) => {
      let c = { ...e, type: i };
      return convertBaseSchema(c, n);
    });
    return o.length === 0 ? P.never() : o.length === 1 ? o[0] : P.union(o);
  }
  if (!r) return P.any();
  let a;
  switch (r) {
    case "string": {
      let o = P.string();
      if (e.format) {
        let i = e.format;
        i === "email"
          ? (o = o.check(P.email()))
          : i === "uri" || i === "uri-reference"
            ? (o = o.check(P.url()))
            : i === "uuid" || i === "guid"
              ? (o = o.check(P.uuid()))
              : i === "date-time"
                ? (o = o.check(P.iso.datetime()))
                : i === "date"
                  ? (o = o.check(P.iso.date()))
                  : i === "time"
                    ? (o = o.check(P.iso.time()))
                    : i === "duration"
                      ? (o = o.check(P.iso.duration()))
                      : i === "ipv4"
                        ? (o = o.check(P.ipv4()))
                        : i === "ipv6"
                          ? (o = o.check(P.ipv6()))
                          : i === "mac"
                            ? (o = o.check(P.mac()))
                            : i === "cidr"
                              ? (o = o.check(P.cidrv4()))
                              : i === "cidr-v6"
                                ? (o = o.check(P.cidrv6()))
                                : i === "base64"
                                  ? (o = o.check(P.base64()))
                                  : i === "base64url"
                                    ? (o = o.check(P.base64url()))
                                    : i === "e164"
                                      ? (o = o.check(P.e164()))
                                      : i === "jwt"
                                        ? (o = o.check(P.jwt()))
                                        : i === "emoji"
                                          ? (o = o.check(P.emoji()))
                                          : i === "nanoid"
                                            ? (o = o.check(P.nanoid()))
                                            : i === "cuid"
                                              ? (o = o.check(P.cuid()))
                                              : i === "cuid2"
                                                ? (o = o.check(P.cuid2()))
                                                : i === "ulid"
                                                  ? (o = o.check(P.ulid()))
                                                  : i === "xid"
                                                    ? (o = o.check(P.xid()))
                                                    : i === "ksuid" && (o = o.check(P.ksuid()));
      }
      (typeof e.minLength == "number" && (o = o.min(e.minLength)),
        typeof e.maxLength == "number" && (o = o.max(e.maxLength)),
        e.pattern && (o = o.regex(new RegExp(e.pattern))),
        (a = o));
      break;
    }
    case "number":
    case "integer": {
      let o = r === "integer" ? P.number().int() : P.number();
      (typeof e.minimum == "number" && (o = o.min(e.minimum)),
        typeof e.maximum == "number" && (o = o.max(e.maximum)),
        typeof e.exclusiveMinimum == "number"
          ? (o = o.gt(e.exclusiveMinimum))
          : e.exclusiveMinimum === !0 && typeof e.minimum == "number" && (o = o.gt(e.minimum)),
        typeof e.exclusiveMaximum == "number"
          ? (o = o.lt(e.exclusiveMaximum))
          : e.exclusiveMaximum === !0 && typeof e.maximum == "number" && (o = o.lt(e.maximum)),
        typeof e.multipleOf == "number" && (o = o.multipleOf(e.multipleOf)),
        (a = o));
      break;
    }
    case "boolean": {
      a = P.boolean();
      break;
    }
    case "null": {
      a = P.null();
      break;
    }
    case "object": {
      let o = {},
        i = e.properties || {},
        c = new Set(e.required || []);
      for (let [p, u] of Object.entries(i)) {
        let h = convertSchema(u, n);
        o[p] = c.has(p) ? h : h.optional();
      }
      if (e.propertyNames) {
        let p = convertSchema(e.propertyNames, n),
          u =
            e.additionalProperties && typeof e.additionalProperties == "object"
              ? convertSchema(e.additionalProperties, n)
              : P.any();
        if (Object.keys(o).length === 0) {
          a = P.record(p, u);
          break;
        }
        let h = P.object(o).passthrough(),
          S = P.looseRecord(p, u);
        a = P.intersection(h, S);
        break;
      }
      if (e.patternProperties) {
        let p = e.patternProperties,
          u = Object.keys(p),
          h = [];
        for (let k of u) {
          let I = convertSchema(p[k], n),
            $ = P.string().regex(new RegExp(k));
          h.push(P.looseRecord($, I));
        }
        let S = [];
        if (
          (Object.keys(o).length > 0 && S.push(P.object(o).passthrough()),
          S.push(...h),
          S.length === 0)
        )
          a = P.object({}).passthrough();
        else if (S.length === 1) a = S[0];
        else {
          let k = P.intersection(S[0], S[1]);
          for (let I = 2; I < S.length; I++) k = P.intersection(k, S[I]);
          a = k;
        }
        break;
      }
      let l = P.object(o);
      e.additionalProperties === !1
        ? (a = l.strict())
        : typeof e.additionalProperties == "object"
          ? (a = l.catchall(convertSchema(e.additionalProperties, n)))
          : (a = l.passthrough());
      break;
    }
    case "array": {
      let o = e.prefixItems,
        i = e.items;
      if (o && Array.isArray(o)) {
        let c = o.map((p) => convertSchema(p, n)),
          l = i && typeof i == "object" && !Array.isArray(i) ? convertSchema(i, n) : void 0;
        (l ? (a = P.tuple(c).rest(l)) : (a = P.tuple(c)),
          typeof e.minItems == "number" && (a = a.check(P.minLength(e.minItems))),
          typeof e.maxItems == "number" && (a = a.check(P.maxLength(e.maxItems))));
      } else if (Array.isArray(i)) {
        let c = i.map((p) => convertSchema(p, n)),
          l =
            e.additionalItems && typeof e.additionalItems == "object"
              ? convertSchema(e.additionalItems, n)
              : void 0;
        (l ? (a = P.tuple(c).rest(l)) : (a = P.tuple(c)),
          typeof e.minItems == "number" && (a = a.check(P.minLength(e.minItems))),
          typeof e.maxItems == "number" && (a = a.check(P.maxLength(e.maxItems))));
      } else if (i !== void 0) {
        let c = convertSchema(i, n),
          l = P.array(c);
        (typeof e.minItems == "number" && (l = l.min(e.minItems)),
          typeof e.maxItems == "number" && (l = l.max(e.maxItems)),
          (a = l));
      } else a = P.array(P.any());
      break;
    }
    default:
      throw new Error(`Unsupported type: ${r}`);
  }
  return (
    e.description && (a = a.describe(e.description)),
    e.default !== void 0 && (a = a.default(e.default)),
    a
  );
}
s(convertBaseSchema, "convertBaseSchema");
function convertSchema(e, n) {
  if (typeof e == "boolean") return e ? P.any() : P.never();
  let r = convertBaseSchema(e, n),
    a = e.type || e.enum !== void 0 || e.const !== void 0;
  if (e.anyOf && Array.isArray(e.anyOf)) {
    let l = e.anyOf.map((u) => convertSchema(u, n)),
      p = P.union(l);
    r = a ? P.intersection(r, p) : p;
  }
  if (e.oneOf && Array.isArray(e.oneOf)) {
    let l = e.oneOf.map((u) => convertSchema(u, n)),
      p = P.xor(l);
    r = a ? P.intersection(r, p) : p;
  }
  if (e.allOf && Array.isArray(e.allOf))
    if (e.allOf.length === 0) r = a ? r : P.any();
    else {
      let l = a ? r : convertSchema(e.allOf[0], n),
        p = a ? 0 : 1;
      for (let u = p; u < e.allOf.length; u++) l = P.intersection(l, convertSchema(e.allOf[u], n));
      r = l;
    }
  (e.nullable === !0 && n.version === "openapi-3.0" && (r = P.nullable(r)),
    e.readOnly === !0 && (r = P.readonly(r)));
  let o = {},
    i = ["$id", "id", "$comment", "$anchor", "$vocabulary", "$dynamicRef", "$dynamicAnchor"];
  for (let l of i) l in e && (o[l] = e[l]);
  let c = ["contentEncoding", "contentMediaType", "contentSchema"];
  for (let l of c) l in e && (o[l] = e[l]);
  for (let l of Object.keys(e)) sb.has(l) || (o[l] = e[l]);
  return (Object.keys(o).length > 0 && n.registry.add(r, o), r);
}
s(convertSchema, "convertSchema");
function fromJSONSchema(e, n) {
  if (typeof e == "boolean") return e ? P.any() : P.never();
  let r = detectVersion(e, n?.defaultTarget),
    a = e.$defs || e.definitions || {},
    o = {
      version: r,
      defs: a,
      refs: new Map(),
      processing: new Set(),
      rootSchema: e,
      registry: n?.registry ?? V,
    };
  return convertSchema(e, o);
}
s(fromJSONSchema, "fromJSONSchema");
var vd = {};
ve(vd, { bigint: () => mb, boolean: () => pb, date: () => gb, number: () => ub, string: () => db });
function db(e) {
  return _coercedString(It, e);
}
s(db, "string");
function ub(e) {
  return _coercedNumber(Rt, e);
}
s(ub, "number");
function pb(e) {
  return _coercedBoolean(Pt, e);
}
s(pb, "boolean");
function mb(e) {
  return _coercedBigint(Tt, e);
}
s(mb, "bigint");
function gb(e) {
  return _coercedDate(ho, e);
}
s(gb, "date");
config(oo());
var fr = { minWidth: 320, maxWidth: 3840, minHeight: 320, maxHeight: 2160 },
  Sd = t
    .object({ width: t.number().int().positive(), height: t.number().int().positive() })
    .strict(),
  ym = Sd.extend({
    width: t.number().int().min(fr.minWidth).max(fr.maxWidth),
    height: t.number().int().min(fr.minHeight).max(fr.maxHeight),
  }),
  fb = t.enum([
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
  Ge = t.enum(["desktop-continuous", "web-remote-replayable"]),
  hb = t
    .object({
      workspaceKey: t.string().min(1),
      sessionId: t.string().min(1),
      tabId: t.string().min(1).optional(),
      requestId: t.string().min(1),
      clientMode: Ge,
    })
    .strict(),
  kd = t.enum([
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
  _d = t
    .object({
      url: t.string(),
      title: t.string(),
      canGoBack: t.boolean(),
      canGoForward: t.boolean(),
      scrollX: t.number().optional(),
      scrollY: t.number().optional(),
      viewportWidth: t.number().optional(),
      viewportHeight: t.number().optional(),
    })
    .strict();
var bm = t.enum(["left", "right", "middle"]),
  wt = t.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"]),
  xd = t.object({ x: t.number(), y: t.number() }).strict(),
  yb = t.enum([
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
  bb = t.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"]),
  Ke = t.number().int().positive().optional(),
  vb = t
    .object({
      value: t.string().optional(),
      label: t.string().optional(),
      index: t.number().int().nonnegative().optional(),
    })
    .strict()
    .refine(
      (e) => e.value !== void 0 || e.label !== void 0 || e.index !== void 0,
      "Select option requires value, label, or index",
    ),
  Sb = t.discriminatedUnion("name", [
    t.object({ name: t.literal("domSnapshot") }).strict(),
    t
      .object({
        name: t.literal("elementInfo"),
        x: t.number(),
        y: t.number(),
        includeNonInteractable: t.boolean().optional(),
      })
      .strict(),
    t
      .object({
        name: t.literal("elementScreenshot"),
        x: t.number(),
        y: t.number(),
        includeNonInteractable: t.boolean().optional(),
      })
      .strict(),
    t
      .object({
        name: t.literal("evaluate"),
        expression: t.string().min(1),
        expressionKind: t.enum(["string", "function"]),
        arg: t.unknown().optional(),
        timeoutMs: Ke,
      })
      .strict(),
    t
      .object({
        name: t.literal("waitForLoadState"),
        state: t.enum(["load", "domcontentloaded", "networkidle"]).optional(),
        timeoutMs: Ke,
      })
      .strict(),
    t
      .object({
        name: t.literal("waitForURL"),
        url: t.string().min(1),
        waitUntil: t.enum(["load", "domcontentloaded", "networkidle", "commit"]).optional(),
        timeoutMs: Ke,
      })
      .strict(),
    t
      .object({
        name: t.literal("waitForEvent"),
        event: t.enum(["download", "filechooser"]),
        timeoutMs: Ke,
      })
      .strict(),
    t
      .object({ name: t.literal("downloadPath"), downloadId: t.string().min(1), timeoutMs: Ke })
      .strict(),
    t
      .object({
        name: t.literal("fileChooserSetFiles"),
        fileChooserId: t.string().min(1),
        files: t.array(t.string()).min(1),
        timeoutMs: Ke,
      })
      .strict(),
    t
      .object({
        name: t.literal("locator"),
        selector: t.string().min(1),
        operation: yb,
        value: t.unknown().optional(),
        arg: t.unknown().optional(),
        expression: t.string().min(1).optional(),
        expressionKind: t.enum(["string", "function"]).optional(),
        attribute: t.string().min(1).optional(),
        checked: t.boolean().optional(),
        replace: t.boolean().optional(),
        force: t.boolean().optional(),
        button: bm.optional(),
        modifiers: t.array(bb).optional(),
        state: t.enum(["attached", "detached", "visible", "hidden"]).optional(),
        selections: t.array(vb).min(1).optional(),
        timeoutMs: Ke,
      })
      .strict(),
  ]),
  Et = t.discriminatedUnion("method", [
    t
      .object({
        method: t.literal("navigate"),
        url: t.string().min(1),
        tabId: t.string().optional(),
      })
      .strict(),
    t.object({ method: t.literal("back"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("forward"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("reload"), tabId: t.string().optional() }).strict(),
    t
      .object({
        method: t.literal("snapshot"),
        maxElements: t.number().int().positive().optional(),
        includeHidden: t.boolean().optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("click"),
        ref: t.string().min(1).optional(),
        x: t.number().optional(),
        y: t.number().optional(),
        button: bm.optional(),
        doubleClick: t.boolean().optional(),
        modifiers: t.array(wt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("fill"),
        ref: t.string().min(1),
        value: t.string(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("type"),
        ref: t.string().min(1).optional(),
        text: t.string(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("press"),
        key: t.string().min(1),
        ref: t.string().min(1).optional(),
        modifiers: t.array(wt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("cuaKeypress"),
        keys: t.array(t.string().min(1)).min(1),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("scroll"),
        ref: t.string().min(1).optional(),
        x: t.number().optional(),
        y: t.number().optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("cuaScroll"),
        x: t.number(),
        y: t.number(),
        scrollX: t.number(),
        scrollY: t.number(),
        modifiers: t.array(wt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("domCuaScroll"),
        nodeId: t.string().min(1).optional(),
        scrollX: t.number(),
        scrollY: t.number(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("screenshot"),
        ref: t.string().min(1).optional(),
        fullPage: t.boolean().optional(),
        clip: t
          .object({
            x: t.number(),
            y: t.number(),
            width: t.number().positive(),
            height: t.number().positive(),
          })
          .strict()
          .optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t.object({ method: t.literal("getState"), tabId: t.string().optional() }).strict(),
    t
      .object({
        method: t.literal("hover"),
        ref: t.string().min(1).optional(),
        x: t.number().optional(),
        y: t.number().optional(),
        modifiers: t.array(wt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("select"),
        ref: t.string().min(1),
        values: t.array(t.string()).min(1),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("check"),
        ref: t.string().min(1),
        checked: t.boolean().optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("drag"),
        fromRef: t.string().min(1).optional(),
        toRef: t.string().min(1).optional(),
        from: xd.optional(),
        to: xd.optional(),
        modifiers: t.array(wt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("cuaDrag"),
        path: t.array(xd).min(1),
        modifiers: t.array(wt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("elementInfo"),
        x: t.number(),
        y: t.number(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("evaluate"),
        expression: t.string().min(1),
        tabId: t.string().optional(),
      })
      .strict(),
    t.object({ method: t.literal("getDialog"), tabId: t.string().optional() }).strict(),
    t
      .object({
        method: t.literal("handleDialog"),
        accept: t.boolean(),
        promptText: t.string().optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("waitFor"),
        selector: t.string().min(1).optional(),
        text: t.string().min(1).optional(),
        textGone: t.string().min(1).optional(),
        timeoutMs: t.number().int().positive().optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("playwrightWaitForTimeout"),
        timeoutMs: t.number().int().nonnegative(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({ method: t.literal("playwright"), action: Sb, tabId: t.string().optional() })
      .strict(),
    t.object({ method: t.literal("capabilities"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("browserVisibilityGet") }).strict(),
    t.object({ method: t.literal("browserVisibilitySet"), visible: t.boolean() }).strict(),
    ym.extend({ method: t.literal("browserViewportSet"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("browserViewportReset"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("activateTab"), tabId: t.string().min(1) }).strict(),
    t.object({ method: t.literal("newTab") }).strict(),
    t.object({ method: t.literal("listUserTabs") }).strict(),
    t.object({ method: t.literal("claimTab"), tabId: t.string().min(1) }).strict(),
    t
      .object({
        method: t.literal("finalizeTabs"),
        keep: t.array(
          t
            .object({ tabId: t.string().min(1), status: t.enum(["handoff", "deliverable"]) })
            .strict(),
        ),
      })
      .strict(),
    t.object({ method: t.literal("markDeliverable"), tabId: t.string().min(1) }).strict(),
    t.object({ method: t.literal("markHandoff"), tabId: t.string().min(1) }).strict(),
    t.object({ method: t.literal("nameSession"), name: t.string().trim().min(1) }).strict(),
    t
      .object({
        method: t.literal("finalize"),
        tabId: t.string().optional(),
        deliverable: t.boolean().optional(),
      })
      .strict(),
    t.object({ method: t.literal("turnEnded"), turnId: t.string().min(1).optional() }).strict(),
    t.object({ method: t.literal("closeSession") }).strict(),
    t.object({ method: t.literal("cancelRequest"), requestId: t.string().min(1) }).strict(),
    t.object({ method: t.literal("close"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("list") }).strict(),
  ]);
var Id = t.enum(["iab", "extension", "cdp"]),
  vm = t.object({ id: t.string().trim().min(1), description: t.string().trim().min(1) }).strict(),
  Cd = t
    .object({
      id: t.string().trim().min(1),
      generation: t.number().int().nonnegative().default(0),
      type: Id,
      name: t.string().trim().min(1),
      capabilities: t
        .object({ browser: t.array(vm).optional(), tab: t.array(vm).optional() })
        .strict(),
      apiSupportOverrides: t.record(t.string(), t.boolean()).optional(),
      metadata: t.record(t.string(), t.string()).optional(),
    })
    .strict(),
  hr = t.enum(["live", "cached"]),
  kb = t
    .object({
      requestId: t.string().trim().min(1),
      workspaceKey: t.string().trim().min(1),
      workspacePath: t.string().trim().min(1),
      workspaceIdentity: t.string().trim().min(1).optional(),
      remoteSessionId: t.string().trim().min(1).optional(),
      sessionId: t.string().trim().min(1),
      turnId: t.string().trim().min(1).optional(),
      clientMode: Ge,
      sessionContext: hr,
    })
    .strict(),
  Rw = kb
    .extend({
      browserId: t.string().trim().min(1),
      browserGeneration: t.number().int().nonnegative(),
    })
    .strict(),
  Sm = t.object({ browsers: t.array(Cd) }).strict();
var _b = t.object({ x: t.number(), y: t.number(), width: t.number(), height: t.number() }).strict(),
  Rd = t
    .object({
      ref: t.string().min(1),
      tag: t.string(),
      role: t.string().optional(),
      name: t.string().optional(),
      text: t.string().optional(),
      value: t.string().optional(),
      disabled: t.boolean().optional(),
      checked: t.boolean().optional(),
      selector: t.string(),
      xpath: t.string(),
      rect: _b,
      inViewport: t.boolean(),
      parentRef: t.string().optional(),
      framePath: t.string().optional(),
      attributes: t.record(t.string(), t.string()).optional(),
    })
    .strict(),
  xb = t
    .object({
      tag: t.string(),
      depth: t.number().int().nonnegative(),
      inViewport: t.boolean(),
      ref: t.string().min(1).optional(),
      role: t.string().optional(),
      name: t.string().optional(),
      text: t.string().optional(),
      attributes: t.record(t.string(), t.string()).optional(),
    })
    .strict(),
  km = t
    .object({
      url: t.string(),
      title: t.string(),
      dom: t.array(xb).optional(),
      domTruncated: t.boolean().optional(),
      elements: t.array(Rd),
      truncated: t.boolean(),
    })
    .strict();
var _m = t
    .object({
      tabId: t.string(),
      url: t.string(),
      title: t.string(),
      viewport: Sd,
      active: t.boolean().optional(),
      lifecycle: t.enum(["active", "deliverable", "handoff"]).optional(),
    })
    .strict(),
  Ib = t
    .object({
      id: t.string().min(1),
      lastOpened: t.string().optional(),
      tabGroup: t.string().optional(),
      title: t.string().optional(),
      url: t.string().optional(),
    })
    .strict(),
  Cb = t
    .object({
      type: t.enum(["alert", "confirm", "prompt", "beforeunload"]),
      message: t.string(),
      defaultPrompt: t.string().optional(),
    })
    .strict(),
  Rb = t
    .object({
      browserUse: t.literal(!0),
      backendType: Id,
      browserId: t.string().min(1),
      browserGeneration: t.number().int().nonnegative(),
      openTabIds: t.array(t.string()),
      tabId: t.string().optional(),
      currentUrl: t.string().optional(),
      lifecycle: t.enum(["active", "deliverable", "handoff", "closed"]).optional(),
    })
    .strict(),
  Ot = t
    .object({
      ok: t.boolean(),
      state: _d.optional(),
      snapshot: km.optional(),
      image: t
        .object({ base64: t.string(), mimeType: t.literal("image/png") })
        .strict()
        .optional(),
      tabs: t.array(_m).optional(),
      userTabs: t.array(Ib).optional(),
      tab: _m.optional(),
      value: t.unknown().optional(),
      element: Rd.optional(),
      dialog: Cb.nullable().optional(),
      error: t
        .object({
          code: kd,
          message: t.string(),
          sideEffect: t.enum(["none", "uncertain"]).optional(),
        })
        .strict()
        .optional(),
      meta: Rb.optional(),
      elapsedMs: t.number().nonnegative(),
    })
    .strict();
var yr = ["local-download-upload", "remote-download"];
var Pb = ["server-bundle", "node-runtime", "node-pty", "glm", "bfs", "ripgrep", "ugrep"],
  xm = ["server-bundle", "node-runtime", "node-pty", "glm", "bfs", "ripgrep", "ugrep"],
  Im = ["server-bundle", "node-runtime"];
var Lw = xm.filter((e) => !Im.includes(e)),
  Tb = new Set(Pb),
  Ww = new Set(xm),
  Fw = new Set(Im);
function isKnownRemoteResourcePackageId(e) {
  return Tb.has(e);
}
s(isKnownRemoteResourcePackageId, "isKnownRemoteResourcePackageId");
var wb = ["claude", "opencode", "gemini", "codex", "glm"],
  ie = t.enum(wb);
var Pd = ["7d", "30d"],
  Eb = t.object({ modelId: t.string().nullable(), totalTokens: t.number(), share: t.number() }),
  Ob = t.object({
    totalTokens: t.number(),
    inputTokens: t.number(),
    outputTokens: t.number(),
    reasoningTokens: t.number(),
    cacheCreationTokens: t.number(),
    cacheReadTokens: t.number(),
    cacheHitRate: t.number(),
    totalSessions: t.number(),
    totalTurns: t.number(),
    toolCallCount: t.number(),
    toolErrorRate: t.number(),
    modelErrorRate: t.number(),
    avgTimeToFirstTokenMs: t.number().nullable(),
    avgTurnDurationMs: t.number().nullable(),
    activeDays: t.number(),
    currentStreakDays: t.number(),
    favoriteModel: Eb.nullable(),
  }),
  Ab = t.object({
    date: t.string(),
    level: t.union([t.literal(0), t.literal(1), t.literal(2), t.literal(3), t.literal(4)]),
    totalTokens: t.number(),
    turnCount: t.number(),
    toolCallCount: t.number(),
  }),
  zb = t.object({ weekIndex: t.number(), days: t.array(Ab.nullable()) }),
  Mb = t.object({
    startDate: t.string().nullable(),
    endDate: t.string().nullable(),
    maxTokens: t.number(),
    weeks: t.array(zb),
  }),
  $b = t.object({ modelId: t.string().nullable(), totalTokens: t.number() }),
  Db = t.object({ date: t.string(), models: t.array($b) }),
  Ub = t.object({
    modelId: t.string().nullable(),
    totalTokens: t.number(),
    inputTokens: t.number(),
    outputTokens: t.number(),
    requestCount: t.number(),
    share: t.number(),
  }),
  Nb = t.object({
    toolName: t.string(),
    callCount: t.number(),
    errorCount: t.number(),
    errorRate: t.number(),
    avgDurationMs: t.number().nullable(),
  }),
  Zb = t.object({
    range: t.enum(Pd),
    generatedAt: t.number(),
    timeZone: t.string(),
    source: t.literal("agent-db"),
    summary: Ob,
    heatmap: Mb,
    dailyModelUsage: t.array(Db),
    models: t.array(Ub),
    tools: t.array(Nb),
  });
var vr = ["glm"];
var w = t.string().trim().min(1),
  Y = t.record(t.string(), t.unknown()),
  F = t.number().int().nonnegative(),
  _o = t.enum(["desktop-continuous", "web-remote-replayable"]),
  Td = t.enum(["user-visible", "model-only"]),
  wd = t.enum([
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
  M = t
    .object({
      workspacePath: w,
      workspaceIdentity: w.optional(),
      remoteSessionId: w.optional(),
      workspaceKey: w,
    })
    .strict(),
  Ed = t.enum(["allow", "deny", "escalate", "modify"]),
  Bb = t.enum(["allow", "deny", "ask"]),
  jb = t.object({ toolName: w, ruleContent: t.string().optional() }).strict(),
  Od = t.object({ type: t.literal("addRules"), behavior: Bb, rules: t.array(jb).min(1) }).strict(),
  At = t
    .object({
      decision: Ed,
      reason: t.string().optional(),
      modifiedInput: t.unknown().optional(),
      permissionUpdates: t.array(Od).optional(),
    })
    .strict(),
  q = t.object({ providerId: w, modelId: w, variant: w.optional() }).strict(),
  xe = t.enum(["plan", "build", "edit", "yolo", "auto"]),
  Ad = t.enum(["idle", "running", "waiting", "paused", "completed", "error"]),
  Lb = t.enum([
    "interactive",
    "fork",
    "selection_side_chat",
    "workflow_parent",
    "workflow_child",
    "subagent_child",
    "nested_workflow_child",
  ]),
  zd = t
    .object({
      sessionId: w,
      targetId: w,
      objective: w,
      summaryTitle: t.string().min(1).nullable().default(null),
      status: t.enum(["active", "paused", "budget_limited", "complete"]),
      tokenBudget: t.number().int().positive().nullable(),
      tokensUsed: t.number().int().nonnegative(),
      timeUsedSeconds: t.number().int().nonnegative(),
      activeInputId: w.nullable().optional(),
      activeRunStartedAtMs: F.nullable().optional(),
      activeRunLastSeenAtMs: F.nullable().optional(),
      createdAt: F,
      updatedAt: F,
    })
    .strict(),
  Rm = t
    .object({
      nextAction: t.string().nullable().optional(),
      passed: t.boolean(),
      reason: t.string(),
    })
    .strict(),
  Wb = t
    .object({
      version: t.literal(1),
      kind: t.literal("synthetic"),
      type: t.literal("goal_verification"),
      display: t.literal("separator"),
      targetId: w,
      verificationId: w,
      status: t.enum(["started", "completed", "failed_closed", "cancelled"]),
      verification: Rm.optional(),
      goalIteration: t.number().int().positive().optional(),
      anchorAssistantMessageId: w.optional(),
      anchorTurnId: w.optional(),
      startedAt: F.optional(),
      updatedAt: F,
    })
    .strict(),
  Md = t
    .object({
      sessionId: w,
      workspace: M,
      parentSessionId: w.optional(),
      traceId: w.optional(),
      sessionKind: Lb,
      title: t.string(),
      titleSource: t.enum(["default", "first_input", "generated", "custom"]).optional(),
      mode: xe,
      status: Ad,
      model: q.optional(),
      target: zd.nullable().optional(),
      createdAt: F,
      updatedAt: F,
      archivedAt: F.optional(),
    })
    .strict(),
  He = t
    .object({
      kind: t.literal("subagent"),
      agentId: w,
      agentType: w,
      childSessionId: w,
      childTurnId: w.optional(),
      description: t.string().optional(),
      parentSessionId: w,
      parentToolCallId: w.optional(),
      parentTurnId: w.optional(),
    })
    .strict(),
  Pm = t.object({ created: F, completed: F.optional() }).strict(),
  Tm = t
    .object({
      total: t.number().int().nonnegative().optional(),
      input: t.number().int().nonnegative(),
      output: t.number().int().nonnegative(),
      reasoning: t.number().int().nonnegative(),
      cache: t
        .object({ read: t.number().int().nonnegative(), write: t.number().int().nonnegative() })
        .strict(),
    })
    .strict(),
  wm = t
    .object({
      origin: t.enum(["real_user", "agent_runtime", "system", "migration"]),
      kind: t.enum([
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
      source: t.string().optional(),
      commandName: t.string().optional(),
      uiVisibility: t.enum(["visible", "hidden", "debug"]),
      providerVisibility: t.enum(["visible", "hidden"]),
      transcriptVisibility: t.enum(["visible", "hidden"]),
    })
    .strict(),
  Fb = t
    .object({
      messageId: w,
      sessionId: w,
      role: t.literal("user"),
      time: Pm,
      agent: w,
      model: q,
      system: t.string().optional(),
      tools: t.record(t.string(), t.boolean()).optional(),
      synthetic: t.boolean().optional(),
      source: wd.optional(),
      visibility: Td.optional(),
      semantics: wm.optional(),
      metadata: Y.optional(),
    })
    .strict(),
  qb = t
    .object({
      messageId: w,
      sessionId: w,
      role: t.literal("assistant"),
      time: Pm,
      parentMessageId: w,
      agent: w,
      model: q,
      path: t.object({ cwd: w, root: w }).strict(),
      cost: t.number().nonnegative(),
      tokens: Tm,
      finish: t.string().optional(),
      error: Y.optional(),
      semantics: wm.optional(),
      structured: t.unknown().optional(),
    })
    .strict(),
  Vb = t.discriminatedUnion("role", [Fb, qb]),
  ae = t.object({ partId: w, sessionId: w, messageId: w }),
  Gb = t.discriminatedUnion("status", [
    t.object({ status: t.literal("pending"), input: Y, raw: t.string() }).strict(),
    t
      .object({
        status: t.literal("running"),
        input: Y,
        title: t.string().optional(),
        metadata: Y.optional(),
        startedAt: F,
      })
      .strict(),
    t
      .object({
        status: t.literal("completed"),
        input: Y,
        output: t.string(),
        title: t.string(),
        metadata: Y,
        startedAt: F,
        completedAt: F,
      })
      .strict(),
    t
      .object({
        status: t.literal("error"),
        input: Y,
        error: t.string(),
        metadata: Y.optional(),
        startedAt: F,
        completedAt: F,
      })
      .strict(),
  ]),
  Cm = q.extend({ label: t.string().optional() }),
  Kb = t.object({ start: F.optional(), end: F.optional() }).strict(),
  Hb = ae
    .extend({
      type: t.literal("timeline"),
      timelineType: t.enum([
        "context_compaction",
        "goal_verification",
        "session_fork",
        "model_change",
      ]),
      display: t.enum(["separator", "worklog"]),
      status: t.string().optional(),
      anchorMessageId: w.optional(),
      anchorTurnId: w.optional(),
      time: Kb.optional(),
      operationId: t.string().optional(),
      trigger: t.enum(["manual", "auto", "partial", "reactive", "session_memory"]).optional(),
      phase: t.enum(["standalone_turn", "pre_request", "mid_turn", "reactive"]).optional(),
      compactReason: t.string().optional(),
      boundaryId: t.string().optional(),
      summaryMessageId: w.optional(),
      preCompactTokenCount: t.number().int().nonnegative().optional(),
      postCompactTokenCount: t.number().int().nonnegative().optional(),
      truePostCompactTokenCount: t.number().int().nonnegative().optional(),
      attempt: t.number().int().nonnegative().optional(),
      maxAttempts: t.number().int().nonnegative().optional(),
      reason: t.string().optional(),
      targetId: t.string().optional(),
      verificationId: t.string().optional(),
      goalIteration: t.number().int().nonnegative().optional(),
      verification: t
        .object({
          passed: t.boolean(),
          reason: t.string(),
          nextAction: t.string().nullable().optional(),
        })
        .strict()
        .optional(),
      parentSessionId: w.optional(),
      targetMessageId: w.optional(),
      targetCheckpointId: t.string().optional(),
      restoredFileCount: t.number().int().nonnegative().optional(),
      fromModel: Cm.optional(),
      toModel: Cm.extend({ label: w }).optional(),
    })
    .strict(),
  $d = t.discriminatedUnion("type", [
    ae
      .extend({
        type: t.literal("text"),
        text: t.string(),
        synthetic: t.boolean().optional(),
        ignored: t.boolean().optional(),
        metadata: Y.optional(),
      })
      .strict(),
    ae.extend({ type: t.literal("reasoning"), text: t.string(), metadata: Y.optional() }).strict(),
    ae
      .extend({
        type: t.literal("file"),
        mime: w,
        filename: t.string().optional(),
        url: w,
        metadata: Y.optional(),
      })
      .strict(),
    ae
      .extend({ type: t.literal("tool"), callId: w, tool: w, state: Gb, metadata: Y.optional() })
      .strict(),
    ae.extend({ type: t.literal("step-start"), snapshot: t.string().optional() }).strict(),
    ae
      .extend({
        type: t.literal("step-finish"),
        reason: t.string(),
        snapshot: t.string().optional(),
        cost: t.number().nonnegative(),
        tokens: Tm,
      })
      .strict(),
    ae.extend({ type: t.literal("snapshot"), snapshot: t.string() }).strict(),
    ae.extend({ type: t.literal("patch"), hash: w, files: t.array(t.string()) }).strict(),
    ae
      .extend({
        type: t.literal("compaction"),
        auto: t.boolean(),
        reason: t.string().optional(),
        summaryMessageId: w.optional(),
        metadata: Y.optional(),
      })
      .strict(),
    Hb,
    ae
      .extend({
        type: t.literal("subagent"),
        prompt: t.string(),
        description: t.string(),
        agent: w,
        model: q.optional(),
        command: t.string().optional(),
      })
      .strict(),
    ae.extend({ type: t.literal("agent"), name: w }).strict(),
    ae
      .extend({ type: t.literal("retry"), attempt: t.number().int().nonnegative(), error: Y })
      .strict(),
  ]),
  Dd = t.object({ info: Vb, parts: t.array($d) }).strict(),
  Jb = t
    .object({
      kind: t.literal("api_retry"),
      attempt: t.number().int().positive(),
      maxRetries: t.number().int().nonnegative(),
      retryDelayMs: t.number().int().nonnegative(),
      errorStatus: t.number().int().nonnegative().nullable(),
      error: t.string(),
    })
    .strict(),
  Yb = t
    .object({
      inputTokens: t.number().int().nonnegative(),
      cacheReadTokens: t.number().int().nonnegative(),
      cacheWriteTokens: t.number().int().nonnegative(),
      latestHitRate: t.number().nonnegative().nullable().optional(),
      hitRateRequestCount: t.number().int().nonnegative().optional(),
      totalInputTokens: t.number().int().nonnegative().optional(),
      totalCacheReadTokens: t.number().int().nonnegative().optional(),
      totalCacheWriteTokens: t.number().int().nonnegative().optional(),
      hitRate: t.number().nonnegative().nullable(),
    })
    .strict(),
  Xb = t.enum([
    "system_prompt",
    "meta_user_context",
    "skills",
    "tool_prompt",
    "system_tool_schemas",
    "mcp_tool_schemas",
    "messages",
  ]),
  Qb = t.object({ source: Xb, chars: t.number().int().nonnegative() }).strict(),
  ev = t.array(Qb),
  tv = t
    .object({
      used: t.number().int().nonnegative(),
      size: t.number().int().positive(),
      cost: t
        .object({ amount: t.number().nonnegative(), currency: w })
        .strict()
        .nullable()
        .optional(),
      cache: Yb.optional(),
      breakdown: ev.optional(),
    })
    .strict(),
  Em = t
    .object({
      eventSeq: t.number().int().nonnegative(),
      stateRevision: t.number().int().nonnegative(),
      deliveryKind: _o.optional(),
      activeTurnId: w.optional(),
      activeTurnKind: t.enum(["regular", "compact", "rewind"]).optional(),
      pendingRequestIds: t.array(w),
      apiRetry: Jb.nullable().optional(),
      contextUsage: tv.optional(),
      goalVerifications: t.array(Rm).optional(),
      goalVerificationTimeline: t.array(Wb).optional(),
    })
    .strict();
var ov = ["telegram", "webhook", "feishu", "lark", "weixin", "discord", "wecom"],
  Ud = t
    .object({
      provider: t.enum(["feishu", "lark", "weixin"]),
      botId: t.string().trim().min(1),
      providerUserId: t.string().trim().min(1),
      chatType: t.enum(["private", "group"]),
    })
    .strict();
var nv = t
  .object({
    status: t.boolean(),
    new: t.boolean(),
    workspace: t.boolean(),
    model: t.boolean(),
    mode: t.boolean().optional(),
    thoughtLevel: t.boolean(),
    sandboxMode: t.boolean().optional(),
    approvalPolicy: t.boolean().optional(),
    cli: t.boolean().optional(),
    reply: t.boolean(),
  })
  .strict();
var rv = t
    .object({
      model: t.string().min(1).optional(),
      mode: t.string().min(1).optional(),
      thoughtLevel: t.string().min(1).optional(),
      sandboxMode: t.string().min(1).optional(),
      approvalPolicy: t.string().min(1).optional(),
      cli: t.enum(["codex", "claude", "opencode", "gemini", "glm"]).optional(),
    })
    .strict(),
  iv = t
    .object({
      provider: t.enum(["codex", "claude", "opencode", "gemini", "glm"]),
      model: t.string().min(1).optional(),
      mode: t.string().min(1).optional(),
      thoughtLevel: t.string().min(1).optional(),
    })
    .strict(),
  av = t
    .object({ value: t.string(), label: t.string(), description: t.string().optional() })
    .strict(),
  sv = t
    .object({
      question: t.string(),
      header: t.string(),
      options: t.array(av),
      multiSelect: t.boolean().optional(),
    })
    .strict(),
  cv = t
    .object({
      taskId: t.string().min(1),
      requestId: t.string().min(1),
      runId: t.string().min(1),
      origin: He.optional(),
      actorKey: t.string().min(1).optional(),
      currentQuestionIndex: t.number().int().min(0),
      questions: t.array(sv),
      answers: t.record(t.string(), t.array(t.string())),
      renderContext: t
        .object({ kind: t.literal("plan_approval"), plan: t.string().min(1) })
        .strict()
        .optional(),
      expandedCustomAnswerQuestionIndexes: t.array(t.number().int().min(0)).optional(),
      handledAt: t.number().optional(),
    })
    .strict(),
  lv = t
    .object({
      id: t.string().min(1),
      name: t.string(),
      provider: t.enum(ov),
      enabled: t.boolean(),
      credentialRef: t.string().min(1).optional(),
      webhookSecretRef: t.string().min(1).optional(),
      webhookUrl: t.string().url().optional(),
      webhookAuthHeaderName: t.string().min(1).optional(),
      feishuAppId: t.string().min(1).optional(),
      providerUserId: t.string().min(1).optional(),
      displayName: t.string().optional(),
      allowedWorkspaces: t.array(t.string().min(1)),
      allowedCommands: nv,
      currentOptions: rv,
      replyMode: t.enum([
        "assistant_changes",
        "assistant_toolcalls_changes",
        "summary_changes",
        "streaming_card",
      ]),
    })
    .strict(),
  pE = t.object({ version: t.literal(2), bots: t.array(lv) }).strict(),
  mE = t
    .object({
      version: t.literal(2),
      bots: t.record(
        t.string(),
        t.object({
          botId: t.string().min(1),
          workspacePath: t.string().min(1),
          workspaceIdentity: t.string().min(1).optional(),
          workspaceId: t.string().min(1).optional(),
          mode: t.enum(["draft", "task"]),
          activeTaskId: t.string().min(1).nullable(),
          draftOptions: iv.optional(),
          pendingPermissionOptions: t
            .array(
              t.object({
                requestId: t.string().min(1),
                optionId: t.string().min(1),
                command: t.enum(["approve", "deny"]),
                label: t.string().min(1),
                response: At,
                handledAt: t.number().optional(),
              }),
            )
            .optional(),
          pendingElicitation: cv.optional(),
          telegramOffset: t.number().optional(),
          weixinGetUpdatesBuf: t.string().optional(),
          weixinActivatedAt: t.number().optional(),
          updatedAt: t.number(),
        }),
      ),
    })
    .strict();
var Nd = 64;
function isValidWslUser(e) {
  let n = e.trim();
  return (
    n.length > 0 &&
    n.length <= Nd &&
    !containsControlCharacter(n) &&
    !n.includes(":") &&
    !n.includes("/") &&
    !n.includes("\\")
  );
}
s(isValidWslUser, "isValidWslUser");
function containsControlCharacter(e) {
  for (let n of e) {
    let r = n.codePointAt(0) ?? 0;
    if (r < 32 || r === 127) return !0;
  }
  return !1;
}
s(containsControlCharacter, "containsControlCharacter");
var xo = t
  .string()
  .trim()
  .max(Nd)
  .refine((e) => e.length === 0 || isValidWslUser(e), { message: "Invalid WSL user" });
function normalizeZCodeEndpointOrigin(e) {
  let n = e.trim();
  if (!n) throw new Error("ZCode endpoint origin is empty");
  let r = new URL(n);
  if (r.protocol !== "https:" && r.protocol !== "http:")
    throw new Error("ZCode endpoint origin must use http or https");
  return r.origin;
}
s(normalizeZCodeEndpointOrigin, "normalizeZCodeEndpointOrigin");
var z = t.string().trim().min(1),
  Io = t.enum(["zh-CN", "en-US"]),
  zm = t.enum(["system", "zh-CN", "en-US"]),
  Mm = t.enum(["queue", "guide"]),
  $m = t.enum(["stable", "preview"]),
  Dm = t.number().int().min(-3).max(5),
  Sr = t.discriminatedUnion("mode", [
    t.object({ mode: t.literal("auto") }),
    t.object({
      mode: t.literal("shell"),
      dialect: t.enum(["cmd", "git-bash"]),
      id: z,
      label: z,
      path: z,
    }),
  ]),
  Um = t.array(ie).transform(() => [...vr]),
  Nm = t
    .object({
      zai: t.enum(["oauth", "apiKey"]).optional(),
      bigmodel: t.enum(["oauth", "apiKey"]).optional(),
    })
    .partial(),
  Zm = t.enum(["zai", "bigmodel"]),
  Bm = t
    .object({
      zai: t.string().trim().min(1).optional(),
      bigmodel: t.string().trim().min(1).optional(),
    })
    .partial();
var Bd = t.object({
    version: z,
    title: z,
    markdown: z,
    releaseDate: z.optional(),
    releaseNotesByLocale: t.partialRecord(Io, t.object({ title: z, markdown: z })).optional(),
  }),
  uv = t.partialRecord($m, z).default({}),
  jm = t.discriminatedUnion("kind", [
    t.object({
      kind: t.literal("ssh"),
      host: z,
      port: t.number().int().positive().max(65535).optional(),
      username: z,
      sshConfigAlias: z.optional(),
      privateKeyPath: t.string().optional(),
      assetInstallMode: t.enum(yr).optional(),
      resourcePackages: t
        .object({ selectedPackageIds: t.array(t.string().refine(isKnownRemoteResourcePackageId)).optional() })
        .optional(),
      passwordCredentialKey: z.optional(),
      privateKeyPassphraseCredentialKey: z.optional(),
    }),
    t.object({ kind: t.literal("wsl"), distro: t.string().optional(), user: xo.optional() }),
    t.object({ kind: t.literal("docker"), container: z }),
    t.object({
      kind: t.literal("server"),
      url: t.string().url(),
      name: z.optional(),
      workspacePath: t.string().optional(),
      serverId: z.optional(),
      tokenCredentialKey: z.optional(),
    }),
  ]),
  Lm = t.discriminatedUnion("kind", [
    t.object({
      kind: t.literal("local"),
      workspacePath: z,
      workspacePurpose: t.enum(["project", "conversation"]).default("project"),
    }),
    t.object({
      kind: t.literal("remote"),
      workspacePath: z,
      localWorkspacePath: z.optional(),
      workspaceIdentity: z.optional(),
      target: jm,
      lastOpenedAt: t.number().int().nonnegative(),
      lastConnectionStatus: t.enum(["connected", "failed"]),
      lastConnectionError: t.string().optional(),
    }),
  ]),
  Wm = t.object({ deviceSid: z }),
  Fm = t.object({ workspacePath: z, workspaceIdentity: z.optional(), initialTaskId: z.optional() }),
  jd = t.preprocess((e) => {
    if (typeof e != "string") return;
    let n = e.trim();
    if (n)
      try {
        return normalizeZCodeEndpointOrigin(n);
      } catch {
        return;
      }
  }, t.string().optional());
function sanitizeZCodeEndpointOrigin(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let n = e;
  if (!("zcodeEndpointOrigin" in n)) return e;
  let r = jd.safeParse(n.zcodeEndpointOrigin);
  if (r.success && typeof r.data == "string") return { ...n, zcodeEndpointOrigin: r.data };
  let { zcodeEndpointOrigin: a, ...o } = n;
  return o;
}
s(sanitizeZCodeEndpointOrigin, "sanitizeZCodeEndpointOrigin");
function migrateOptimizeAgentExperienceDefault(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let n = e;
  return n.optimizeAgentExperienceMigrationInitialized === !0
    ? e
    : { ...n, optimizeAgentExperienceEnabled: !1, optimizeAgentExperienceMigrationInitialized: !0 };
}
s(migrateOptimizeAgentExperienceDefault, "migrateOptimizeAgentExperienceDefault");
function migrateCloseToTrayOnWindowsDefault(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let n = e;
  return n.closeToTrayOnWindowsMigrationInitialized === !0
    ? e
    : { ...n, closeToTrayOnWindows: !0, closeToTrayOnWindowsMigrationInitialized: !0 };
}
s(migrateCloseToTrayOnWindowsDefault, "migrateCloseToTrayOnWindowsDefault");
function migrateLegacyLocalePreference(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let n = e;
  if ("localePreference" in n || !("locale" in n)) return e;
  let r = Io.safeParse(n.locale);
  return r.success ? { ...n, localePreference: r.data } : e;
}
s(migrateLegacyLocalePreference, "migrateLegacyLocalePreference");
var hv = t.object({
  id: z,
  workspacePath: z,
  localWorkspacePath: z.optional(),
  workspaceIdentity: z.optional(),
  target: jm,
  lastOpenedAt: t.number().int().nonnegative(),
  lastConnectionStatus: t.enum(["connected", "failed"]),
  lastConnectionError: t.string().optional(),
});
function migrateLegacyBuiltinAgentCliProviders(e) {
  return !e || typeof e != "object" || Array.isArray(e)
    ? e
    : { ...e, enabledBuiltinAgentCliProviders: [...vr] };
}
s(migrateLegacyBuiltinAgentCliProviders, "migrateLegacyBuiltinAgentCliProviders");
function stripHistoricalRemoteResourcePackages(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let n = e;
  if (n.kind !== "ssh" || !("resourcePackages" in n)) return e;
  let { resourcePackages: r, ...a } = n;
  return a;
}
s(stripHistoricalRemoteResourcePackages, "stripHistoricalRemoteResourcePackages");
function migrateLegacyWorkspaceSession(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let n = e,
    r = { ...n },
    a = Array.isArray(n.lastWorkspaceSession) ? n.lastWorkspaceSession : [],
    o = a.some((S) => (!S || typeof S != "object" || Array.isArray(S) ? !1 : "historyId" in S)),
    i = Array.isArray(n.remoteWorkspaceHistory) ? n.remoteWorkspaceHistory : [],
    c = new Map(
      i.flatMap((S) => {
        let k = S && typeof S == "object" && !Array.isArray(S) ? { ...S, target: stripHistoricalRemoteResourcePackages(S.target) } : S,
          I = hv.safeParse(k);
        return I.success ? [[I.data.id, I.data]] : [];
      }),
    ),
    l =
      a.length > 0
        ? a.flatMap((S) => {
            if (!S || typeof S != "object" || Array.isArray(S)) return [];
            let k = S;
            if (k.kind === "local" && typeof k.workspacePath == "string")
              return [
                {
                  kind: "local",
                  workspacePath: k.workspacePath,
                  workspacePurpose:
                    k.workspacePurpose === "conversation" ? "conversation" : "project",
                },
              ];
            if (k.kind === "remote") {
              if (typeof k.workspacePath == "string" && k.target)
                return [{ ...k, target: stripHistoricalRemoteResourcePackages(k.target) }];
              if (typeof k.historyId == "string") {
                let I = c.get(k.historyId);
                return I
                  ? [
                      {
                        kind: "remote",
                        workspacePath: I.workspacePath,
                        ...(I.localWorkspacePath
                          ? { localWorkspacePath: I.localWorkspacePath }
                          : {}),
                        ...(I.workspaceIdentity ? { workspaceIdentity: I.workspaceIdentity } : {}),
                        target: stripHistoricalRemoteResourcePackages(I.target),
                        lastOpenedAt: I.lastOpenedAt,
                        lastConnectionStatus: I.lastConnectionStatus,
                        ...(I.lastConnectionError
                          ? { lastConnectionError: I.lastConnectionError }
                          : {}),
                      },
                    ]
                  : [];
              }
            }
            return [];
          })
        : [],
    p = Array.isArray(n.lastOpenTabs)
      ? n.lastOpenTabs.flatMap((S) =>
          typeof S == "string"
            ? [{ kind: "local", workspacePath: S, workspacePurpose: "project" }]
            : [],
        )
      : [],
    u = new Set(
      l.flatMap((S) =>
        S.kind === "local" && typeof S.workspacePath == "string" ? [S.workspacePath] : [],
      ),
    ),
    h = [...l, ...p.filter((S) => !u.has(S.workspacePath))];
  return (
    (h.length > 0 || o || Array.isArray(n.lastOpenTabs)) && (r.lastWorkspaceSession = h),
    delete r.lastOpenTabs,
    delete r.remoteWorkspaceHistory,
    r
  );
}
s(migrateLegacyWorkspaceSession, "migrateLegacyWorkspaceSession");
var vv = t.object({
    recentProjects: t.array(t.string()).default([]),
    locale: Io.default("zh-CN"),
    localePreference: zm.default("system"),
    terminalInheritSystemProfile: t.boolean().default(!0),
    terminalFontFamily: z.optional(),
    integratedTerminalShell: Sr.optional(),
    httpProxy: z.optional(),
    httpProxyNoProxy: z.optional(),
    httpProxyCaCertPath: z.optional(),
    taskAutoArchiveEnabled: t.boolean().default(!1),
    taskAutoArchiveOlderThanDays: t.number().int().positive().max(365).default(7),
    closeToTrayOnWindows: t.boolean().default(!0),
    closeToTrayOnWindowsMigrationInitialized: t.boolean().default(!0),
    keepAwakeWhileRunning: t.boolean().default(!1),
    desktopZoomLevel: Dm.optional(),
    desktopChromiumHardwareAccelerationEnabled: t.boolean().default(!0),
    messageStreamShowReasoning: t.boolean().default(!1),
    messageStreamShowTodos: t.boolean().default(!1),
    zcodeInteractionBehavior: Mm.default("queue"),
    askUserQuestionAutoResolutionEnabled: t.boolean().default(!0),
    optimizeAgentExperienceEnabled: t.boolean().default(!1),
    optimizeAgentExperienceMigrationInitialized: t.boolean().default(!0),
    enabledBuiltinAgentCliProviders: Um.default([...vr]),
    modelProviderFamilyModes: Nm.default({}),
    modelProviderFamilySelectedKeys: Bm.default({}),
    providerFamilyDomain: Zm.optional(),
    providerFamilyDomainUpdatedAt: t.number().int().nonnegative().optional(),
    providerFamilyDomainMigrated: t.boolean().default(!1),
    repoSnapshotIndexingEnabled: t.boolean().default(!1),
    repoSnapshotIndexingUserConfigured: t.boolean().optional(),
    instantGrepIndexingEnabled: t.boolean().default(!1),
    nativeSearchEnhancementsEnabled: t.boolean().default(!0),
    memoryEnabled: t.boolean().default(!1),
    lastWorkspaceSession: t.array(Lm).default([]),
    lastActiveTabIndex: t.number().int().nonnegative().default(0),
    lastActiveTaskByWorkspace: t.record(t.string(), t.string()).optional(),
    dataBaseDir: t.string().trim().min(1).optional(),
    pendingPostUpdateReleaseNotes: Bd.optional(),
    receivePreviewUpdates: t.boolean().default(!1),
    autoDownloadAndInstallUpdates: t.boolean().default(!1),
    skippedElectronUpdateVersions: uv,
    settingsSyncFirstRunPromptHandled: t.boolean().optional(),
    webRemoteControlExternalRelayDevice: Wm.optional(),
    webRemoteControlLastEnabledContext: Fm.optional(),
    zcodeEndpointOrigin: jd.optional(),
  }),
  Sv = t.preprocess((e) => migrateCloseToTrayOnWindowsDefault(migrateOptimizeAgentExperienceDefault(migrateLegacyLocalePreference(sanitizeZCodeEndpointOrigin(migrateLegacyWorkspaceSession(migrateLegacyBuiltinAgentCliProviders(e)))))), vv),
  kv = t.object({
    recentProjects: t.array(t.string()).optional(),
    locale: Io.optional(),
    localePreference: zm.optional(),
    terminalInheritSystemProfile: t.boolean().optional(),
    terminalFontFamily: z.optional(),
    integratedTerminalShell: Sr.optional(),
    httpProxy: z.optional(),
    httpProxyNoProxy: z.optional(),
    httpProxyCaCertPath: z.optional(),
    taskAutoArchiveEnabled: t.boolean().optional(),
    taskAutoArchiveOlderThanDays: t.number().int().positive().max(365).optional(),
    closeToTrayOnWindows: t.boolean().optional(),
    keepAwakeWhileRunning: t.boolean().optional(),
    closeToTrayOnWindowsMigrationInitialized: t.boolean().optional(),
    desktopZoomLevel: Dm.optional(),
    desktopChromiumHardwareAccelerationEnabled: t.boolean().optional(),
    messageStreamShowReasoning: t.boolean().optional(),
    messageStreamShowTodos: t.boolean().optional(),
    zcodeInteractionBehavior: Mm.optional(),
    askUserQuestionAutoResolutionEnabled: t.boolean().optional(),
    optimizeAgentExperienceEnabled: t.boolean().optional(),
    optimizeAgentExperienceMigrationInitialized: t.boolean().optional(),
    enabledBuiltinAgentCliProviders: Um.optional(),
    modelProviderFamilyModes: Nm.optional(),
    modelProviderFamilySelectedKeys: Bm.optional(),
    providerFamilyDomain: t.union([Zm, t.literal("")]).optional(),
    providerFamilyDomainUpdatedAt: t.number().int().nonnegative().optional(),
    providerFamilyDomainMigrated: t.boolean().optional(),
    repoSnapshotIndexingEnabled: t.boolean().optional(),
    repoSnapshotIndexingUserConfigured: t.boolean().optional(),
    instantGrepIndexingEnabled: t.boolean().optional(),
    nativeSearchEnhancementsEnabled: t.boolean().optional(),
    memoryEnabled: t.boolean().optional(),
    lastWorkspaceSession: t.array(Lm).optional(),
    lastActiveTabIndex: t.number().int().nonnegative().optional(),
    lastActiveTaskByWorkspace: t.record(t.string(), t.string()).optional(),
    dataBaseDir: t.string().trim().min(1).optional(),
    pendingPostUpdateReleaseNotes: Bd.optional(),
    receivePreviewUpdates: t.boolean().optional(),
    autoDownloadAndInstallUpdates: t.boolean().optional(),
    skippedElectronUpdateVersions: t.partialRecord($m, z).optional(),
    settingsSyncFirstRunPromptHandled: t.boolean().optional(),
    webRemoteControlExternalRelayDevice: Wm.optional(),
    webRemoteControlLastEnabledContext: Fm.optional(),
    zcodeEndpointOrigin: jd.optional(),
  });
var zt = t.enum([
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
var De = "builtin:",
  be = {
    zai: `${De}zai`,
    zaiCodingPlan: `${De}zai-coding-plan`,
    zaiStartPlan: `${De}zai-start-plan`,
    bigmodel: `${De}bigmodel`,
    bigmodelCodingPlan: `${De}bigmodel-coding-plan`,
    bigmodelStartPlan: `${De}bigmodel-start-plan`,
    zapi: `${De}zapi`,
  };
var _v = t.object({
    haiku: t.string(),
    sonnet: t.string(),
    opus: t.string(),
    reasoning: t.string(),
  }),
  Gm = t.object({ claude: _v.optional() }).catchall(t.unknown()),
  Km = t.enum(["anthropic", "openai", "responses", "gemini"]),
  Hm = t.enum(["anthropic-messages", "openai-chat-completions", "openai-responses"]),
  Je = t.enum(["anthropic", "openai", "openai-compatible"]),
  xv = t.enum(["china-llm-zcode-dev"]),
  qm = t.enum(["text", "image", "video", "audio", "pdf"]),
  Vm = t.object({ path: t.array(t.string().min(1)).min(1) }),
  Iv = t.object({
    set: t.array(Vm.extend({ value: t.unknown() })).optional(),
    unset: t.array(Vm).optional(),
  }),
  Cv = t.object({
    defaultLevel: t.string().min(1).optional(),
    levels: t.record(t.string().min(1), t.partialRecord(Je, Iv)),
  }),
  Jm = t.partialRecord(Je, t.string()),
  Rv = t.object({ baseURL: t.string(), paths: Jm }),
  Ym = t.object({
    id: t.string().min(1),
    name: t.string().optional(),
    kinds: t.array(Je),
    defaultKind: Je.optional(),
    modelIdByKind: t.partialRecord(Je, t.string().min(1)).optional(),
    modalities: t.object({ input: t.array(qm), output: t.array(qm) }),
    contextWindow: t.number().int().positive(),
    maxOutputTokens: t.number().int().positive().optional(),
    reasoning: Cv.optional(),
    priority: t.number().finite().optional(),
  }),
  Pv = t.object({
    id: t.string().min(1),
    name: t.string().min(1),
    endpoints: Rv,
    defaultKind: Je.optional(),
    models: t.array(Ym),
  }),
  Tv = t.object({ schemaVersion: t.literal("zcode.model-providers.v1"), providers: t.array(Pv) }),
  wv = Ym.extend({
    disabledReason: t.string().optional(),
    supportsTools: t.boolean().optional(),
    supportsStructuredOutput: t.boolean().optional(),
    modified: t.boolean().optional(),
    deleted: t.boolean().optional(),
  }),
  Xm = t.enum(["builtin", "models-dev", "custom", "workspace"]),
  Qm = t.enum([
    "coding_plan_not_authenticated",
    "coding_plan_not_connected",
    "coding_plan_auth_failed",
    "coding_plan_not_entitled",
    "oauth_provider_inactive",
  ]),
  eg = t.object({
    anthropic: t.string().default(""),
    openai: t.string().default(""),
    gemini: t.string().default(""),
  }),
  Ev = eg.extend({
    anthropic: t.string().optional(),
    openai: t.string().optional(),
    gemini: t.string().optional(),
    baseURL: t.string().optional(),
    paths: Jm.optional(),
  }),
  Ov = t.object({
    id: t.string(),
    name: t.string(),
    enabled: t.boolean().optional(),
    systemDisabledReason: Qm.optional(),
    endpoints: eg,
    apiFormat: Hm.optional(),
    source: Xm.optional(),
    modelsDevProviderId: t.string().optional(),
    apiKeyRequired: t.boolean().optional(),
    headers: t.record(t.string(), t.string()).optional(),
    logoUrl: t.string().optional(),
    apiKey: t.string(),
    apiKeyUrl: t.string().optional(),
    models: t.array(t.string()).default([]),
    modelDisplayNames: t.record(t.string(), t.string()).optional(),
    modelSupportedFormats: t.record(t.string(), t.array(Km)).optional(),
    providerMappings: Gm.optional(),
    createdAt: t.number(),
    updatedAt: t.number(),
  }),
  NE = t.array(Ov),
  Av = t.object({
    id: t.string(),
    name: t.string(),
    enabled: t.boolean().optional(),
    systemDisabledReason: Qm.optional(),
    endpoints: Ev,
    apiFormat: Hm.optional(),
    source: Xm.optional(),
    catalogSourceId: xv.optional(),
    catalogProviderId: t.string().optional(),
    modelsDevProviderId: t.string().optional(),
    apiKeyRequired: t.boolean().optional(),
    headers: t.record(t.string(), t.string()).optional(),
    logoUrl: t.string().optional(),
    apiKey: t.string(),
    apiKeyUrl: t.string().optional(),
    defaultKind: Je.optional(),
    models: t.array(wv).default([]),
    modelDisplayNames: t.record(t.string(), t.string()).optional(),
    modelSupportedFormats: t.record(t.string(), t.array(Km)).optional(),
    providerMappings: Gm.optional(),
    createdAt: t.number(),
    updatedAt: t.number(),
  }),
  zv = t.array(Av),
  Mv = t.object({ schemaVersion: t.literal("zcode.model-providers.v2"), providers: zv }),
  ZE = t.object({
    providerIds: t.array(t.string().min(1)),
    updatedAt: t.number().int().nonnegative(),
  });
var $v = "ZCode Protocol",
  Dv = 1;
var d = t.string().trim().min(1),
  W = t.record(t.string(), t.unknown()),
  oe = t.number().int().nonnegative(),
  kr = t.union([oe, d, t.date()]),
  Uv = t
    .object({
      kind: t.literal("node_repl_images"),
      images: t
        .array(
          t
            .object({
              base64: t
                .string()
                .min(1)
                .max(200 * 1024),
              mimeType: t.string().regex(/^image\/[a-z0-9.+-]+$/iu),
            })
            .strict(),
        )
        .min(1)
        .max(2),
      truncated: t.boolean().optional(),
      source: t.literal("browser_turn_end").optional(),
    })
    .strict(),
  Nv = W.superRefine((e, n) => {
    let r = e.display;
    if (typeof r != "object" || r === null || Array.isArray(r) || r.kind !== "node_repl_images")
      return;
    let a = Uv.safeParse(r);
    if (!a.success)
      for (let o of a.error.issues) n.addIssue({ ...o, path: ["display", ...o.path] });
  }),
  Fd = t.union([t.string(), t.number().int()]),
  rg = t
    .object({
      traceId: d.optional(),
      parentId: d.optional(),
      spanId: d.optional(),
      traceparent: d.optional(),
    })
    .strict(),
  Zv = t
    .object({ id: Fd, method: d, params: t.unknown().optional(), trace: rg.optional() })
    .strict(),
  Bv = t.object({ method: d, params: t.unknown().optional(), trace: rg.optional() }).strict(),
  jv = t.object({ id: Fd, result: t.unknown() }).strict(),
  Lv = t
    .object({
      id: Fd,
      error: t
        .object({ code: t.number().int(), message: d, data: t.unknown().optional() })
        .strict(),
    })
    .strict(),
  RO = t.union([Zv, Bv, jv, Lv]);
var ig = t
    .object({
      platform: t.enum([
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
      arch: t.enum([
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
      logicalCpuCount: t.number().int().positive().max(4096),
      intervalMs: t
        .number()
        .int()
        .positive()
        .max(10080 * 60 * 1e3),
      cpuCores: t.number().finite().nonnegative().max(4096),
      cpuPercent: t.number().finite().nonnegative().max(1e5),
      rssKb: t.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER),
    })
    .strict(),
  Wv = wd,
  ag = t.enum(["immediate", "deferred"]),
  qd = t
    .object({ optionId: d, kind: d, name: d, description: t.string().optional(), response: At })
    .strict(),
  tg = t.object({ name: d, value: t.string() }).strict(),
  Fv = t.union([
    t
      .object({
        type: t.literal("client_credentials"),
        clientId: d,
        clientSecret: d,
        clientName: d.optional(),
        scope: t.string().optional(),
      })
      .strict(),
    t
      .object({
        type: t.literal("authorization_code"),
        clientId: d.optional(),
        clientSecret: d.optional(),
        clientName: d.optional(),
        redirectPath: d.optional(),
        scope: t.string().optional(),
      })
      .strict(),
  ]),
  Vd = t.union([
    t
      .object({
        name: d,
        command: d,
        args: t.array(t.string()),
        env: t.array(tg),
        isolation: t.enum(["session", "workspace"]).optional(),
        protocolVersion: t.enum(["legacy", "auto", "2026-07-28"]).optional(),
        timeoutMs: t.number().int().positive().optional(),
      })
      .strict(),
    t
      .object({
        name: d,
        type: t.enum(["http", "sse"]),
        url: d,
        headers: t.array(tg),
        oauth: Fv.optional(),
        isolation: t.enum(["session", "workspace"]).optional(),
        protocolVersion: t.enum(["legacy", "auto", "2026-07-28"]).optional(),
        timeoutMs: t.number().int().positive().optional(),
      })
      .strict(),
  ]),
  qv = t.enum(["connecting", "connected", "disabled", "disconnected", "failed", "untrusted"]),
  Vv = t
    .object({
      status: qv,
      transport: t.enum(["stdio", "http", "sse"]),
      toolCount: t.number().int().nonnegative(),
      updatedAt: d,
      error: t.string().optional(),
      protocolEra: t.enum(["legacy", "modern"]).optional(),
      authorization: t
        .object({ type: t.literal("oauth_authorization_code"), authorizationUrl: d, startedAt: d })
        .strict()
        .optional(),
    })
    .strict(),
  Gv = t.enum(["connect", "status"]),
  Kv = t
    .object({ workspace: M, mcpServers: t.array(Vd).optional(), mode: Gv.default("connect") })
    .strict(),
  Hv = t.object({ statuses: t.record(t.string(), Vv) }).strict(),
  Jv = t
    .object({ role: t.enum(["user", "assistant"]), content: t.string(), timestamp: oe.optional() })
    .strict(),
  Yv = t
    .object({
      source: t.literal("claudeCode"),
      title: t.string().optional(),
      createdAt: oe.optional(),
      updatedAt: oe.optional(),
      messages: t.array(Jv).min(1),
    })
    .strict(),
  sg = t.object({ value: d, label: d, description: t.string().optional() }).strict(),
  cg = t
    .object({
      enabled: t.boolean(),
      levels: t.array(sg),
      defaultLevel: d.optional(),
      providerOptionsByLevel: t.record(d, W).optional(),
    })
    .strict(),
  lg = t
    .object({
      ref: q,
      label: d,
      providerLabel: d.optional(),
      providerSource: t.string().optional(),
      providerLogoUrl: d.optional(),
      description: t.string().optional(),
      contextWindow: t.number().int().positive().optional(),
      maxOutputTokens: t.number().int().positive().optional(),
      reasoning: cg.optional(),
      supportsImages: t.boolean().optional(),
      supportsPdf: t.boolean().optional(),
      supportsTools: t.boolean().optional(),
      supportsStructuredOutput: t.boolean().optional(),
      disabledReason: t.string().optional(),
    })
    .strict(),
  dg = t.enum(["anthropic", "openai", "openai-compatible"]),
  ug = t.enum(["anthropic-messages", "openai-chat-completions", "openai-responses"]),
  pg = t.enum(["builtin", "models-dev", "custom", "user", "workspace", "ephemeral"]),
  Xv = t.discriminatedUnion("source", [
    t.object({ source: t.literal("credential"), key: d }).strict(),
    t.object({ source: t.literal("env"), name: d }).strict(),
    t.object({ source: t.literal("server-config"), key: d }).strict(),
    t.object({ source: t.literal("session-secret"), key: d }).strict(),
  ]),
  Qv = t.discriminatedUnion("source", [
    t.object({ source: t.literal("credential"), key: d }).strict(),
    t.object({ source: t.literal("env"), name: d }).strict(),
    t.object({ source: t.literal("server-config"), key: d }).strict(),
    t.object({ source: t.literal("inline"), value: d }).strict(),
  ]),
  mg = t
    .object({
      modelId: d,
      label: d.optional(),
      description: t.string().optional(),
      contextWindow: t.number().int().positive().optional(),
      maxOutputTokens: t.number().int().positive().optional(),
      reasoning: cg.optional(),
      supportsImages: t.boolean().optional(),
      supportsPdf: t.boolean().optional(),
      supportsTools: t.boolean().optional(),
      supportsStructuredOutput: t.boolean().optional(),
      providerOptions: W.optional(),
      disabledReason: t.string().optional(),
    })
    .strict(),
  eS = t
    .object({
      providerId: d,
      kind: dg,
      apiFormat: ug.optional(),
      label: d.optional(),
      source: pg.default("workspace"),
      baseURL: d.optional(),
      apiKeyRef: Xv.optional(),
      apiKeyRequired: t.boolean().optional(),
      headers: t.record(t.string(), t.string()).optional(),
      providerOptions: W.optional(),
      logoUrl: d.optional(),
      modelsDevProviderId: d.optional(),
      models: t.array(mg),
      disabledReason: t.string().optional(),
      updatedAt: oe.optional(),
    })
    .strict(),
  Gd = t
    .object({
      providerId: d,
      kind: dg,
      apiFormat: ug.optional(),
      label: d.optional(),
      source: pg.default("workspace"),
      baseURL: d.optional(),
      apiKey: Qv.optional(),
      apiKeyRequired: t.boolean().optional(),
      headers: t.record(t.string(), t.string()).optional(),
      providerOptions: W.optional(),
      logoUrl: d.optional(),
      modelsDevProviderId: d.optional(),
      models: t.array(mg).min(1),
    })
    .strict(),
  Ie = t
    .object({ revision: d, generatedAt: oe, model: q, provider: Gd, thoughtLevel: d.optional() })
    .strict(),
  PO = t.object({ sessionId: d, appliedModelRuntimeRevision: d, changed: t.boolean() }).strict();
var tS = t
    .object({
      revision: t.number().int().nonnegative(),
      providerRevision: d.optional(),
      providers: t.array(eS),
      available: t.array(lg),
      defaultModel: q.optional(),
      lastUsed: q.optional(),
    })
    .strict(),
  gg = t
    .object({
      content: d,
      status: t.enum(["pending", "in_progress", "completed"]),
      priority: t.enum(["high", "medium", "low"]),
    })
    .strict(),
  oS = t
    .object({
      timeUsedSeconds: t.number().int().nonnegative(),
      tokensUsed: t.number().int().nonnegative(),
      tokenBudget: t.number().int().positive().nullable(),
      contextUsed: t.number().int().nonnegative(),
      contextWindow: t.number().int().nonnegative(),
      toolCallCount: t.number().int().nonnegative(),
      iterationCount: t.number().int().nonnegative(),
    })
    .strict(),
  nS = t
    .object({
      id: d,
      source: t.enum(["goal_iteration", "session"]),
      goalIteration: t.number().int().positive().optional(),
      targetId: d.optional(),
      startedAt: oe.optional(),
      updatedAt: oe.optional(),
      todos: t.array(gg),
    })
    .strict(),
  fg = t
    .object({
      appliedProviderRevision: d.optional(),
      model: t.object({ current: q, available: t.array(lg), lastUsed: q.optional() }).strict(),
      thoughtLevel: t
        .object({
          enabled: t.boolean(),
          current: d.optional(),
          defaultLevel: d.optional(),
          available: t.array(sg),
        })
        .strict(),
      mode: t.object({ current: xe }).strict(),
      permission: t
        .object({ mode: xe.optional(), rulesRevision: t.number().int().nonnegative().optional() })
        .strict()
        .optional(),
    })
    .strict(),
  rS = t
    .object({
      requestId: d,
      toolCallId: d,
      toolName: d,
      reason: t.string(),
      riskLevel: t.enum(["low", "medium", "high", "critical"]),
      input: t.unknown().optional(),
      origin: He.optional(),
      options: t.array(qd).min(1),
      requestedAt: oe,
    })
    .strict(),
  iS = t
    .object({
      toolCallId: d,
      toolName: d,
      status: t.enum(["pending", "running", "completed", "failed", "denied"]),
      startedAt: oe.optional(),
    })
    .strict(),
  aS = t
    .object({
      sessionId: d,
      status: Ad,
      mode: xe,
      turnCount: t.number().int().nonnegative(),
      totalTokenCount: t.number().int().nonnegative(),
      contextUsed: t.number().int().nonnegative(),
      contextWindow: t.number().int().nonnegative(),
      currentTurnId: d.optional(),
      pendingPermissions: t.array(rS),
      activeToolCalls: t.array(iS),
      backgroundJobs: t.array(W),
      target: zd.nullable().optional(),
      lastError: t
        .object({ type: d, code: d.optional(), message: d, detail: t.string().optional() })
        .strict()
        .optional(),
    })
    .strict(),
  hg = t
    .object({
      name: d,
      description: t.string(),
      inputHint: t.string().optional(),
      source: t.enum(["builtin", "custom"]).optional(),
    })
    .strict(),
  sS = t.enum([
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
  cS = t
    .object({
      assistantMessageId: t.string().optional(),
      delta: t.string().optional(),
      done: t.boolean().optional(),
      input: t.unknown().optional(),
      kind: sS,
      partId: t.string().optional(),
      providerExecuted: t.boolean().optional(),
      toolCallId: t.string().optional(),
      toolName: t.string().optional(),
    })
    .strict(),
  _r = t
    .object({
      protocol: t.object({ name: t.literal($v), version: t.literal(Dv) }).strict(),
      session: Md,
      settings: fg,
      projection: aS,
      runtime: Em,
      messages: t.array(Dd),
      goalStats: oS.optional(),
      todos: t.array(gg).optional(),
      todoGroups: t.array(nS).optional(),
      slashCommands: t.array(hg).optional(),
    })
    .strict(),
  lS = t
    .object({
      eventId: d,
      sessionId: d,
      turnId: d.optional(),
      seq: t.number().int().nonnegative(),
      traceId: d.optional(),
      timestamp: oe,
      deliveryKind: _o.optional(),
    })
    .strict(),
  TO = t.enum([
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
  yg = t
    .object({
      type: d,
      message: d,
      stack: t.string().optional(),
      code: t.string().optional(),
      detail: t.string().optional(),
      retryable: t.boolean().optional(),
      data: t.unknown().optional(),
    })
    .strict(),
  dS = t.object({ mode: xe, contextWindow: t.number().int().nonnegative() }).strict(),
  uS = t
    .object({
      directory: d,
      interruptedToolCount: t.number().int().nonnegative(),
      messageCount: t.number().int().nonnegative(),
      partCount: t.number().int().nonnegative(),
      recoveredCompactTimelineCount: t.number().int().nonnegative().optional(),
      recoveredSteerInputCount: t.number().int().nonnegative().optional(),
      resumedTodoCount: t.number().int().nonnegative().optional(),
    })
    .strict(),
  pS = t
    .object({
      messageID: d.optional(),
      modelRef: W.optional(),
      previousTitle: t.string(),
      source: t.enum(["default", "first_input", "generated", "custom"]),
      title: t.string(),
    })
    .strict(),
  mS = t
    .object({
      turnNumber: t.number().int().nonnegative(),
      input: t.string(),
      inputId: d.optional(),
      queryId: d.optional(),
      inputSource: Wv.optional(),
      inputVisibility: Td.optional(),
      executionKind: t.enum(["agent", "controlOnly"]).optional(),
      targetId: d.optional(),
      messageId: d.optional(),
      foregroundExecutionId: d.optional(),
      intent: W.optional(),
      originMeta: W.optional(),
      attachments: t.array(W).optional(),
    })
    .strict(),
  gS = t.literal("plan_approval_feedback"),
  fS = t.enum(["sendText", "sendGoalCommand", "compact"]),
  bg = t.enum(["queue", "guide"]),
  hS = t
    .object({
      pendingInputId: d,
      inputId: d.optional(),
      queryId: d.optional(),
      input: t.string(),
      inputPreview: t.string(),
      inputSize: t.number().int().nonnegative(),
      commandKind: fS.optional(),
      source: gS.optional(),
      toolDisallowlist: t.array(d).optional(),
      delivery: bg.optional(),
      targetTurnId: d,
      queueLength: t.number().int().nonnegative(),
      intent: W.optional(),
    })
    .strict(),
  yS = t
    .object({
      pendingInputIds: t.array(d),
      queryIds: t.array(d).optional(),
      targetTurnId: d,
      injectedMessageIds: t.array(d),
      drainedInputs: t
        .array(
          t
            .object({
              pendingInputId: d,
              messageId: d,
              text: t.string(),
              delivery: bg.optional(),
              intent: W.optional(),
              toolDisallowlist: t.array(d).optional(),
            })
            .strict(),
        )
        .optional(),
    })
    .strict(),
  bS = t
    .object({
      response: t.string(),
      tokenCount: t.number().int().nonnegative(),
      usage: t.unknown().optional(),
      toolCallCount: t.number().int().nonnegative(),
      historyRoundCount: t.number().int().nonnegative().optional(),
      duration: t.number().nonnegative(),
      cacheStats: t
        .object({
          totalMessages: t.number().int().nonnegative(),
          cachedMessages: t.number().int().nonnegative(),
          lastCacheHit: t.boolean(),
          cacheReadTokens: t.number().int().nonnegative().optional(),
        })
        .strict()
        .optional(),
      inputId: d.optional(),
      resultType: t.enum([
        "success",
        "cancelled",
        "error_max_turns",
        "error_max_budget",
        "error_during_execution",
        "error_max_tool_calls",
      ]),
    })
    .strict(),
  vS = t.object({ error: yg, turnPhase: t.string(), inputId: d.optional() }).strict(),
  SS = t
    .object({
      content: t.string(),
      attachments: t.array(t.unknown()).optional(),
      toolCalls: t.array(t.unknown()).optional(),
      type: t.string().optional(),
      compactBoundary: t.unknown().optional(),
    })
    .strict(),
  kS = t.object({ messageId: d, reason: t.string().optional() }).strict(),
  _S = t
    .object({
      messageId: d,
      partId: d,
      field: t.enum(["text", "reasoning", "input", "output"]).optional(),
      delta: t.string(),
    })
    .strict(),
  og = t.object({ part: $d }).strict(),
  xS = t.object({ messageId: d, partId: d, reason: t.string().optional() }).strict(),
  Mt = t
    .object({
      toolCallId: d,
      toolName: t.string().optional(),
      parentToolCallId: d.optional(),
      source: t.enum(["subagent"]).optional(),
      agentId: d.optional(),
      agentType: d.optional(),
      childSessionId: d.optional(),
      childToolCallId: d.optional(),
      description: t.string().optional(),
    })
    .strict(),
  IS = t.discriminatedUnion("kind", [
    Mt.extend({
      kind: t.literal("scheduled"),
      toolName: d,
      input: t.unknown().optional(),
      inputByteLength: t.number().int().nonnegative().optional(),
      inputOmitted: t.boolean().optional(),
      inputRef: t.literal("model_stream").optional(),
      dependencies: t.array(d).optional(),
      parallelGroupIndex: t.number().int().nonnegative().optional(),
      canRunParallel: t.boolean().optional(),
      schedule: W.optional(),
    }).strict(),
    Mt.extend({ kind: t.literal("started"), startedAt: kr }).strict(),
    Mt.extend({
      kind: t.literal("progress"),
      elapsedMs: t.number().nonnegative().optional(),
      pid: t.number().int().optional(),
      stdoutBytes: t.number().int().nonnegative().optional(),
      stderrBytes: t.number().int().nonnegative().optional(),
      outputBytes: t.number().int().nonnegative().optional(),
      stdoutTail: t.string().optional(),
      stderrTail: t.string().optional(),
    }).strict(),
    Mt.extend({
      kind: t.literal("result"),
      result: Nv,
      duration: t.number().nonnegative(),
    }).strict(),
    Mt.extend({ kind: t.literal("error"), error: yg }).strict(),
    t
      .object({
        kind: t.literal("batch"),
        toolCallIds: t.array(d),
        successCount: t.number().int().nonnegative(),
        errorCount: t.number().int().nonnegative(),
      })
      .strict(),
    Mt.extend({ kind: t.literal("raw"), payload: W }).strict(),
  ]),
  CS = t
    .object({
      requestId: d.optional(),
      toolCallId: d,
      toolName: d,
      riskLevel: t.enum(["low", "medium", "high", "critical"]),
      reason: t.string(),
      input: t.unknown(),
      suggestedPermissionUpdates: t.array(Od).optional(),
      origin: He.optional(),
      options: t.array(qd).min(1),
    })
    .strict(),
  RS = t
    .object({
      requestId: d.optional(),
      toolCallId: d,
      toolName: d.optional(),
      decision: Ed.optional(),
      reason: t.string().optional(),
      modifiedInput: t.unknown().optional(),
      inputSummary: t.unknown().optional(),
    })
    .strict(),
  PS = t
    .object({
      requestId: d,
      prompt: t.string(),
      inputType: t.enum(["text", "choice", "confirm"]).optional(),
      choices: t.array(t.string()).optional(),
    })
    .strict(),
  TS = t
    .object({ requestId: d, value: t.unknown().optional(), cancelled: t.boolean().optional() })
    .strict(),
  wS = t.object({ reason: t.string().optional() }).strict();
function zcodeSessionEventEnvelopeFor(e, n) {
  return lS.extend({ type: t.literal(e), payload: n.optional() });
}
s(zcodeSessionEventEnvelopeFor, "zcodeSessionEventEnvelopeFor");
var vg = t.discriminatedUnion("type", [
    zcodeSessionEventEnvelopeFor("session.created", dS),
    zcodeSessionEventEnvelopeFor("session.resumed", uS),
    zcodeSessionEventEnvelopeFor("session.updated", W),
    zcodeSessionEventEnvelopeFor("session.titleUpdated", pS),
    zcodeSessionEventEnvelopeFor("session.closed", wS),
    zcodeSessionEventEnvelopeFor("turn.started", mS),
    zcodeSessionEventEnvelopeFor("turn.steerQueued", hS),
    zcodeSessionEventEnvelopeFor("turn.steerDrained", yS),
    zcodeSessionEventEnvelopeFor("turn.completed", bS),
    zcodeSessionEventEnvelopeFor("turn.failed", vS),
    zcodeSessionEventEnvelopeFor("message.upserted", SS),
    zcodeSessionEventEnvelopeFor("message.removed", kS),
    zcodeSessionEventEnvelopeFor("part.started", og),
    zcodeSessionEventEnvelopeFor("part.delta", _S),
    zcodeSessionEventEnvelopeFor("part.upserted", og),
    zcodeSessionEventEnvelopeFor("part.removed", xS),
    zcodeSessionEventEnvelopeFor("model.streaming", cS),
    zcodeSessionEventEnvelopeFor("tool.updated", IS),
    zcodeSessionEventEnvelopeFor("permission.requested", CS),
    zcodeSessionEventEnvelopeFor("permission.resolved", RS),
    zcodeSessionEventEnvelopeFor("userInput.requested", PS),
    zcodeSessionEventEnvelopeFor("userInput.resolved", TS),
    zcodeSessionEventEnvelopeFor("checkpoint.created", W),
    zcodeSessionEventEnvelopeFor("rewind.triggered", W),
    zcodeSessionEventEnvelopeFor("streamRecovery.updated", W),
  ]),
  wO = t.object({ events: t.array(vg) }).strict(),
  EO = t.object({ messages: t.array(Dd) }).strict(),
  OO = t
    .object({
      type: t.literal("state.updated"),
      scope: t.enum(["server", "workspace", "session"]),
      workspace: M.optional(),
      sessionId: d.optional(),
      revision: t.number().int().nonnegative(),
      reason: t.string().optional(),
      patch: t.unknown(),
    })
    .strict(),
  AO = t
    .object({
      sessionId: d,
      deliveryKind: _o,
      afterSeq: t.number().int().nonnegative().optional(),
      includeSnapshot: t.boolean().default(!1),
    })
    .strict(),
  zO = t
    .object({
      sessionId: d,
      eventSeq: t.number().int().nonnegative(),
      events: t.array(vg),
      snapshot: _r.optional(),
    })
    .strict(),
  MO = t.object({ sessions: t.array(Md) }).strict(),
  Sg = t
    .object({
      childSessionId: d,
      agentId: d.optional(),
      toolCallId: d.optional(),
      subagentType: d,
      title: d,
      summary: t.string().optional(),
      startedAt: t.number().int().nonnegative().optional(),
      endedAt: t.number().int().nonnegative().optional(),
    })
    .strict(),
  ES = Sg.extend({ status: t.enum(["running", "waiting", "blocked"]) }),
  OS = Sg.extend({ status: t.enum(["success", "failed", "cancelled", "lost"]) }),
  $O = t
    .object({
      revision: t.number().int().nonnegative(),
      childSessionIds: t.array(d),
      running: t.array(ES),
      ended: t
        .object({
          total: t.number().int().nonnegative(),
          items: t.array(OS),
          nextCursor: d.optional(),
        })
        .strict(),
    })
    .strict(),
  AS = t
    .object({
      workspace: M,
      settings: fg,
      modelCatalog: tS.optional(),
      slashCommands: t.array(hg).optional(),
    })
    .strict(),
  DO = t
    .object({
      sessionId: d.optional(),
      workspace: M,
      parentSessionId: d.optional(),
      mode: xe.optional(),
      model: q.optional(),
      runtimeModel: Ie.optional(),
      persistence: ag.optional(),
      thoughtLevel: d.optional(),
      titleGenerationEnabled: t.boolean().optional(),
      mcpServers: t.array(Vd).optional(),
      toolAllowlist: t.array(d).optional(),
      toolDenylist: t.array(d).optional(),
      importedHistory: Yv.optional(),
    })
    .strict(),
  UO = t
    .object({
      sessionId: d,
      workspace: M.optional(),
      runtimeModel: Ie.optional(),
      thoughtLevel: d.optional(),
      mcpServers: t.array(Vd).optional(),
      toolAllowlist: t.array(d).optional(),
      toolDenylist: t.array(d).optional(),
    })
    .strict(),
  NO = t
    .object({
      workspace: M.optional(),
      includeArchived: t.boolean().default(!1),
      limit: t.number().int().positive().optional(),
    })
    .strict(),
  ZO = t
    .object({
      sessionId: d,
      endedCursor: d.optional(),
      endedLimit: t.number().int().positive().max(100).default(20),
    })
    .strict(),
  BO = t.object({ range: t.enum(Pd), timeZone: t.string().optional() }).strict();
var jO = t.object({ sessionId: d }).strict(),
  LO = t
    .object({
      sessionId: d,
      totalTokens: t.number().int().nonnegative(),
      inputTokens: t.number().int().nonnegative(),
      outputTokens: t.number().int().nonnegative(),
      reasoningTokens: t.number().int().nonnegative(),
      cacheCreationTokens: t.number().int().nonnegative(),
      cacheReadTokens: t.number().int().nonnegative(),
      modelRequestCount: t.number().int().nonnegative(),
      modelErrorCount: t.number().int().nonnegative(),
      inputBaselineBySource: t.record(t.string(), t.number().int().nonnegative()),
    })
    .strict(),
  WO = t
    .object({
      sessionId: d,
      deliveryKind: _o.optional(),
      messageLimit: t.number().int().positive().optional(),
      afterSeq: t.number().int().nonnegative().optional(),
    })
    .strict(),
  FO = t
    .object({
      sessionId: d,
      afterMessageId: d.optional(),
      limit: t.number().int().positive().optional(),
    })
    .strict(),
  qO = t
    .object({
      sessionId: d,
      afterSeq: t.number().int().nonnegative().optional(),
      limit: t.number().int().positive().optional(),
    })
    .strict(),
  zS = t.enum(["runtime-materialization", "user-execution"]);
var VO = t.object({ sessionId: d, scope: zS }).strict(),
  MS = "preflight-v1",
  $S = t.enum(["legacy", "preflight-v1"]),
  GO = t
    .object({
      nativeSearchEnhancementsEnabled: t.boolean(),
      memoryEnabled: t.boolean().default(!1),
      askUserQuestionAutoResolutionEnabled: t.boolean().default(!0),
      integratedTerminalShell: Sr.optional(),
      modelContextBudgetStrategy: $S.default(MS),
    })
    .strict(),
  DS = t
    .object({
      tabCount: t.number().int().positive().max(100),
      currentUrl: t.string().trim().min(1).max(4096).optional(),
    })
    .strict(),
  KO = t
    .object({
      sessionId: d,
      inputId: d.optional(),
      queryId: d.optional(),
      content: t.string(),
      attachments: t.array(W).optional(),
      browserAmbientContext: DS.optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      expectedProviderRevision: d.optional(),
      expectedModelRuntimeRevision: d.optional(),
      runtimeModel: Ie.optional(),
      automationId: d.optional(),
      offPeakTaskId: d.optional(),
      offPeakRunType: t.enum(["init", "resume"]).optional(),
      botDeliveryTarget: Ud.optional(),
      toolDenylist: t.array(d).optional(),
    })
    .strict()
    .superRefine((e, n) => {
      (e.automationId &&
        e.offPeakTaskId &&
        n.addIssue({
          code: t.ZodIssueCode.custom,
          message: "automationId and offPeakTaskId are mutually exclusive",
        }),
        e.offPeakRunType &&
          !e.offPeakTaskId &&
          n.addIssue({
            code: t.ZodIssueCode.custom,
            message: "offPeakRunType requires offPeakTaskId",
            path: ["offPeakRunType"],
          }));
    }),
  HO = t
    .object({
      sessionId: d,
      accepted: t.literal(!0),
      stateRevision: t.number().int().nonnegative(),
      modelRuntimeRevision: d.optional(),
    })
    .strict(),
  US = t.discriminatedUnion("kind", [
    t.object({ kind: t.literal("turn"), turnIndex: t.number().int().nonnegative() }).strict(),
    t.object({ kind: t.literal("message"), messageId: d }).strict(),
    t.object({ kind: t.literal("checkpoint"), checkpointId: d }).strict(),
    t.object({ kind: t.literal("latestCheckpoint") }).strict(),
  ]),
  JO = t
    .object({
      sessionId: d,
      target: US.default({ kind: "latestCheckpoint" }),
      expectedRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  YO = t
    .object({
      forkedSessionId: d,
      parentSessionId: d.optional(),
      targetMessageId: d.optional(),
      targetCheckpointId: d.optional(),
      response: t.string(),
      snapshot: _r,
    })
    .strict(),
  XO = t
    .object({
      sessionId: d,
      inputId: d.optional(),
      instructions: t.string().optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      runtimeModel: Ie.optional(),
    })
    .strict(),
  QO = t
    .object({
      response: t.string(),
      snapshot: _r,
      compact: t
        .object({
          state: t.enum(["accepted", "already_running"]),
          inputId: d.optional(),
          operationId: d.optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
  NS = t.enum(["show", "set", "replace", "pause", "resume", "clear"]),
  eA = t
    .object({
      sessionId: d,
      inputId: d.optional(),
      action: NS,
      objective: t.string().optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  tA = t
    .object({ response: t.string(), snapshot: _r, startedTurn: t.boolean().optional() })
    .strict(),
  oA = t.object({ sessionId: d }).strict(),
  kg = t.enum(["running", "completed", "failed", "timed_out", "cancelled", "spawn_error", "lost"]),
  ZS = t
    .object({
      taskId: d,
      toolCallId: d.optional(),
      toolName: d.optional(),
      taskKind: t.enum(["bash", "subagent"]).optional(),
      blocked: t.boolean().optional(),
      blockedReason: t.string().optional(),
      cancellable: t.boolean().optional(),
      cancelRequestedAt: kr.optional(),
      command: t.string().optional(),
      description: t.string().optional(),
      status: kg,
      pid: t.number().int().positive().optional(),
      startedAt: kr.optional(),
      completedAt: kr.optional(),
      outputPath: t.string().optional(),
      stderrPersistedOutputPath: t.string().optional(),
      stdoutPersistedOutputPath: t.string().optional(),
      outputBytes: t.number().int().nonnegative().optional(),
      outputTruncated: t.boolean().optional(),
      outputTail: t.string().optional(),
      stderrBytes: t.number().int().nonnegative().optional(),
      stderrTail: t.string().optional(),
      stdoutBytes: t.number().int().nonnegative().optional(),
      stdoutTail: t.string().optional(),
      terminalId: d.optional(),
    })
    .strict(),
  nA = t.object({ sessionId: d, taskId: d }).strict(),
  rA = t
    .object({
      cancelled: t.boolean(),
      reason: t.string().optional(),
      snapshot: ZS.optional(),
      status: kg,
      taskId: d,
    })
    .strict(),
  iA = t
    .object({
      sessionId: d,
      model: q,
      runtimeModel: Ie.optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      persistAsWorkspaceLastUsed: t.boolean().default(!0),
    })
    .strict(),
  aA = t
    .object({
      sessionId: d,
      thoughtLevel: d.optional(),
      runtimeModel: Ie.optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      persistAsWorkspaceLastUsed: t.boolean().default(!0),
    })
    .strict(),
  sA = t
    .object({ sessionId: d, runtimeModel: Ie, applyModelSelection: t.boolean().default(!0) })
    .strict(),
  cA = t
    .object({ sessionId: d, mode: xe, expectedRevision: t.number().int().nonnegative().optional() })
    .strict(),
  lA = t.object({ sessionId: d, expectedPersistence: ag.optional() }).strict(),
  dA = t.object({ closed: t.boolean().optional() }).strict(),
  uA = t
    .object({
      workspace: M,
      runtimeModel: Ie.optional(),
      preferWorkspaceDefaults: t.boolean().optional(),
    })
    .strict(),
  pA = t
    .object({
      workspace: M,
      modelRef: q,
      prompt: d,
      querySource: d,
      maxOutputTokens: t.number().int().positive().optional(),
      temperature: t.number().min(0).max(2).optional(),
    })
    .strict(),
  mA = t.object({ text: t.string(), modelRef: q }).strict(),
  BS = t.object({ revision: d, generatedAt: oe, providers: t.array(Gd) }).strict(),
  jS = t.enum(["applied", "unchanged", "failed"]),
  gA = t
    .object({ workspace: M, registry: BS, includeWorkspaceState: t.boolean().optional() })
    .strict(),
  fA = t
    .object({
      workspace: M,
      appliedProviderRevision: d,
      status: jS,
      providerCount: t.number().int().nonnegative(),
      workspaceState: AS.optional(),
    })
    .strict(),
  LS = t.object({ askUserQuestionAutoResolutionEnabled: t.boolean() }).strict(),
  hA = t.object({ workspace: M, preferences: LS }).strict(),
  yA = t
    .object({
      workspace: M,
      askUserQuestionAutoResolutionEnabled: t.boolean(),
      snoozedInteractionCount: t.number().int().nonnegative(),
    })
    .strict(),
  bA = t
    .object({
      workspace: M,
      provider: Gd,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  vA = t
    .object({
      workspace: M,
      providerId: d,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  SA = t
    .object({
      workspace: M,
      model: q,
      runtimeModel: Ie.optional(),
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  kA = t
    .object({
      workspace: M,
      thoughtLevel: d,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  _A = t
    .object({
      workspace: M,
      mode: xe,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  xA = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      toolCallId: d,
      toolName: d,
      reason: t.string(),
      riskLevel: t.enum(["low", "medium", "high", "critical"]),
      input: t.unknown(),
      origin: He.optional(),
      options: t.array(qd).min(1),
    })
    .strict(),
  WS = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      workspaceKey: d,
      workspacePath: d,
      workspaceIdentity: d.optional(),
      remoteSessionId: d.optional(),
      clientMode: Ge,
      sessionContext: hr,
    })
    .strict(),
  FS = Sm,
  qS = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      browserId: d.optional(),
      browserGeneration: t.number().int().nonnegative().optional(),
      workspaceKey: d.optional(),
      workspacePath: d.optional(),
      workspaceIdentity: d.optional(),
      remoteSessionId: d.optional(),
      clientMode: Ge.optional(),
      sessionContext: hr.optional(),
      command: Et,
    })
    .strict(),
  VS = Ot,
  GS = t
    .object({
      value: d,
      label: d,
      description: t.string().optional(),
      preview: t.string().optional(),
    })
    .strict(),
  KS = t
    .object({
      question: d,
      header: d,
      options: t.array(GS).min(1),
      multiSelect: t.boolean().optional(),
    })
    .strict(),
  IA = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      toolCallId: d.optional(),
      toolName: d.optional(),
      prompt: t.string().optional(),
      questions: t.array(KS).min(1).optional(),
      input: t.unknown().optional(),
      origin: He.optional(),
      schema: t.unknown().optional(),
    })
    .strict(),
  CA = t
    .object({
      action: t.enum(["accept", "decline", "cancel"]),
      content: W.optional(),
      reason: t.string().optional(),
    })
    .strict(),
  HS = t.enum(["model-request", "captcha-retry"]),
  RA = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      workspace: M,
      modelRef: q,
      providerId: d,
      reason: HS,
    })
    .strict(),
  PA = t
    .object({
      headersApplied: t.boolean(),
      errorMessage: d.optional(),
      providerRevision: d.optional(),
    })
    .strict(),
  _g = t.union([t.string(), t.number(), t.boolean()]),
  xg = t
    .object({
      event: d,
      matcher: t.string().optional(),
      type: t.enum(["command", "process"]),
      command: d,
      args: t.array(t.string()).optional(),
      async: t.boolean().optional(),
      shell: t.union([t.literal(!0), t.string()]).optional(),
      timeout: t.number().positive().optional(),
      timeoutMs: t.number().int().positive().optional(),
      statusMessage: t.string().optional(),
      sourcePath: t.string(),
      runnable: t.boolean(),
    })
    .strict(),
  JS = t
    .object({
      default: _g.optional(),
      description: t.string().optional(),
      required: t.boolean().optional(),
      sensitive: t.boolean().optional(),
      title: t.string().optional(),
      type: t.enum(["string", "number", "boolean", "directory", "file"]).optional(),
    })
    .strict(),
  YS = t.enum(["agent", "command", "skill", "hook", "mcp"]),
  XS = t.object({ name: d, description: t.string().optional() }).strict(),
  Ig = t.object({ kind: YS, items: t.array(XS) }).strict(),
  Cg = t
    .object({
      id: d,
      name: d,
      description: t.string().optional(),
      version: t.string().optional(),
      enabled: t.boolean(),
      source: d,
      marketplace: d,
      author: t.string().optional(),
      authorUrl: t.string().optional(),
      homepage: t.string().optional(),
      skillCount: t.number().int().nonnegative().optional(),
      skillRootCount: t.number().int().nonnegative(),
      commandRootCount: t.number().int().nonnegative(),
      components: t.array(Ig).optional(),
      declaredMcpServerNames: t.array(t.string()).optional(),
      hostMcpServerNames: t.array(t.string()).optional(),
      mcpServerNames: t.array(t.string()),
      hookDetails: t.array(xg).optional(),
      rootPath: t.string(),
      userConfig: t.record(t.string(), JS).optional(),
      configuredOptions: t.record(t.string(), _g).optional(),
    })
    .strict(),
  Ce = t
    .object({
      code: t.string(),
      message: t.string(),
      severity: t.enum(["warning", "error"]).optional(),
      pluginId: t.string().optional(),
    })
    .strict(),
  TA = t.object({ workspace: M }).strict(),
  wA = t.object({ plugins: t.array(Cg), diagnostics: t.array(Ce) }).strict(),
  QS = t
    .object({
      pluginId: d,
      name: d,
      marketplace: d,
      icon: t.string().optional(),
      enabled: t.boolean(),
      conflictingPluginIds: t.array(d),
      skillQualifiedNames: t.array(d),
      mcpServerNames: t.array(d),
      subagentNames: t.array(d).default([]),
    })
    .strict(),
  EA = t.object({ workspace: M, sessionId: d.optional() }).strict(),
  OA = t.object({ authority: t.enum(["session", "workspace"]), plugins: t.array(QS) }).strict(),
  AA = t.object({ workspace: M, pluginId: d, enabled: t.boolean() }).strict(),
  zA = t.object({ plugin: Cg, enabled: t.boolean() }).strict(),
  Rg = t.enum(["user", "workspace"]),
  Pg = t
    .object({
      displayName: t.string().optional(),
      displayNameI18n: t.record(t.string(), t.string()).optional(),
      descriptionI18n: t.record(t.string(), t.string()).optional(),
      icon: t.string().optional(),
      category: t.string().optional(),
      author: t.string().optional(),
      authorUrl: t.string().optional(),
      homepage: t.string().optional(),
      privacyPolicy: t.string().optional(),
      termsOfService: t.string().optional(),
      heroImage: t.string().optional(),
      examplePrompts: t.array(t.string()).optional(),
      examplePromptsI18n: t.record(t.string(), t.array(t.string())).optional(),
    })
    .strict(),
  Wd = t
    .object({
      id: d,
      name: d,
      source: W,
      description: t.string().optional(),
      lastUpdated: t.string().optional(),
      pluginCount: t.number().int().nonnegative(),
      isOfficial: t.boolean().optional(),
      featured: t.array(t.string()).optional(),
      refreshFailure: t
        .object({ code: t.string(), failedAt: t.string(), message: t.string() })
        .strict()
        .optional(),
    })
    .strict(),
  ng = t
    .object({
      id: d,
      name: d,
      marketplace: d,
      description: t.string().optional(),
      version: t.string().optional(),
      installed: t.boolean(),
      componentTypes: t.array(t.string()).optional(),
      listing: Pg.optional(),
    })
    .strict(),
  Kd = t
    .object({
      id: d,
      name: d,
      marketplace: d,
      description: t.string().optional(),
      version: t.string().optional(),
      enabled: t.boolean(),
      scope: Rg,
      installPath: t.string().optional(),
      installedAt: t.string().optional(),
      componentTypes: t.array(t.string()).optional(),
      hookDetails: t.array(xg).optional(),
      updateStatus: t.enum(["none", "update-available", "version-changed"]).optional(),
      latestVersion: t.string().optional(),
      listing: Pg.optional(),
    })
    .strict(),
  MA = t.object({ workspace: M }).strict(),
  $A = t
    .object({
      marketplaces: t.array(Wd),
      availablePlugins: t.array(ng),
      installedPlugins: t.array(Kd),
      restorableBuiltins: t.array(ng),
      diagnostics: t.array(Ce),
      capability: t.object({ supported: t.boolean(), reason: t.string().optional() }).strict(),
    })
    .strict(),
  DA = t
    .object({ workspace: M, source: d, dryRun: t.boolean().optional(), operationId: d.optional() })
    .strict(),
  UA = t.object({ workspace: M, marketplace: d }).strict(),
  NA = t.object({ workspace: M, marketplace: d.optional() }).strict(),
  ZA = t
    .object({
      marketplace: Wd.optional(),
      marketplaces: t.array(Wd).optional(),
      diagnostics: t.array(Ce).optional(),
    })
    .strict(),
  BA = t
    .object({
      workspace: M,
      pluginName: d,
      marketplace: d,
      scope: Rg.optional(),
      dryRun: t.boolean().optional(),
      operationId: d.optional(),
    })
    .strict(),
  jA = t.object({ operationId: d }).strict(),
  LA = t.object({ operationId: d, cancelled: t.boolean() }).strict(),
  WA = t
    .object({
      workspace: M,
      pluginId: d.optional(),
      pluginName: d.optional(),
      marketplace: d.optional(),
      removeCache: t.boolean().optional(),
    })
    .strict(),
  FA = t
    .object({
      installedPlugins: t.array(Kd),
      dependencyClosure: t.array(t.string()),
      diagnostics: t.array(Ce),
    })
    .strict(),
  qA = t.object({ removedPlugin: Kd.optional(), diagnostics: t.array(Ce) }).strict(),
  VA = t.object({ workspace: M, pluginId: d.optional(), marketplace: d.optional() }).strict(),
  GA = t.object({ workspace: M, pluginId: d }).strict(),
  KA = t.object({ pluginId: d, diagnostics: t.array(Ce) }).strict(),
  HA = t.object({ workspace: M, pluginId: d, options: W, dryRun: t.boolean().optional() }).strict(),
  JA = t.object({ pluginId: d, diagnostics: t.array(Ce) }).strict(),
  YA = t
    .object({
      workspace: M,
      pluginName: d.optional(),
      marketplace: d.optional(),
      source: d.optional(),
    })
    .strict(),
  XA = t
    .object({
      ok: t.boolean(),
      diagnostics: t.array(Ce),
      compatibility: t
        .object({
          runnable: t.array(t.string()),
          diagnosticOnly: t.array(t.string()),
          unsupported: t.array(t.string()),
        })
        .strict(),
    })
    .strict(),
  QA = t.object({ workspace: M, pluginName: d, marketplace: d }).strict(),
  ez = t
    .object({
      components: t.array(Ig),
      diagnostics: t.array(Ce).optional(),
      metadata: t
        .object({
          author: t.string().optional(),
          authorUrl: t.string().optional(),
          homepage: t.string().optional(),
          version: t.string().optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
  ek = t
    .object({
      unit: t.enum(["minute", "hourly", "daily", "weekly", "monthly", "yearly"]),
      interval: t.number().int().positive(),
      hour: t.number().int().min(0).max(23),
      minute: t.number().int().min(0).max(59),
      anchorAt: t.number().int(),
      weekdays: t.array(t.number().int().min(0).max(6)).optional(),
      monthDays: t.array(t.number().int().min(1).max(31)).optional(),
      months: t.array(t.number().int().min(1).max(12)).optional(),
      monthlyMode: t.enum(["date", "weekday"]).optional(),
    })
    .strict(),
  Tg = t.enum(["minute", "hourly", "daily", "weekly", "monthly", "yearly"]),
  Hd = t
    .object({
      automationId: d,
      title: t.string(),
      cronExpr: d,
      prompt: d,
      model: t.string().optional(),
      provider: ie.optional(),
      mode: zt.optional(),
      thoughtLevel: d.optional(),
      targetTaskId: d.optional(),
      enabled: t.boolean(),
      lifecycleStatus: t.enum(["active", "completed", "failed", "paused"]),
      nextRunAt: oe.optional(),
      lastRunAt: oe.optional(),
      runCount: t.number().int().nonnegative(),
      recurring: t.boolean(),
      maxRuns: t.number().int().positive().optional(),
      scheduleRule: ek.optional(),
    })
    .strict(),
  tz = t
    .object({
      title: t.string().optional(),
      cronExpr: d,
      relativeDelayMinutes: t.number().int().positive().max(525600).optional(),
      prompt: d,
      model: t.string().optional(),
      provider: ie.optional(),
      mode: zt.optional(),
      thoughtLevel: d.optional(),
      targetTaskId: d.optional(),
      botDeliveryTarget: Ud.optional(),
      recurring: t.boolean().optional(),
      maxRuns: t.number().int().positive().optional(),
      intervalUnit: Tg.optional(),
      interval: t.number().int().min(1).max(200).optional(),
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
  oz = t.object({ automation: Hd }).strict(),
  nz = t
    .object({
      automationId: d,
      title: d.optional(),
      cronExpr: d.optional(),
      prompt: d.optional(),
      recurring: t.boolean().optional(),
      maxRuns: t.number().int().positive().nullable().optional(),
      intervalUnit: Tg.optional(),
      interval: t.number().int().min(1).max(200).optional(),
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
  rz = t.object({ automation: Hd }).strict(),
  iz = t.object({}).strict(),
  az = t.object({ automations: t.array(Hd) }).strict(),
  sz = t.object({ targetTaskId: d }).strict(),
  cz = t.object({ bound: t.boolean() }).strict(),
  lz = t.object({ automationId: d }).strict(),
  dz = t.object({ deleted: t.boolean() }).strict(),
  Ld = {
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
  uz = t.object({}).strict(),
  pz = {
    [Ld.mcpList]: { params: Kv, result: Hv },
    [Ld.interactionBrowserList]: { params: WS, result: FS },
    [Ld.interactionBrowserExecute]: { params: qS, result: VS },
  };
var bz = t
    .object({ rowId: t.number().int().nonnegative(), entityId: t.string().trim().min(1) })
    .strict(),
  vz = t.number(),
  Sz = t.enum(["text", "inputText", "output.text", "summaryText"]);
var Co = {
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
var tk = t
  .string()
  .min(4)
  .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u);
var Ue = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function encodeWireBytesBase64(e) {
  let n = "",
    r = [];
  for (let a = 0; a < e.byteLength; a += 3) {
    let o = e[a] ?? 0,
      i = a + 1 < e.byteLength,
      c = a + 2 < e.byteLength,
      l = i ? (e[a + 1] ?? 0) : 0,
      p = c ? (e[a + 2] ?? 0) : 0;
    (r.push(
      Ue[o >>> 2],
      Ue[((o & 3) << 4) | (l >>> 4)],
      i ? Ue[((l & 15) << 2) | (p >>> 6)] : "=",
      c ? Ue[p & 63] : "=",
    ),
      r.length >= 16384 && ((n += r.join("")), (r = [])));
  }
  return n + r.join("");
}
s(encodeWireBytesBase64, "encodeWireBytesBase64");
function decodeWireBase64(e) {
  if (!tk.safeParse(e).success) return null;
  let n = e.endsWith("==") ? 2 : e.endsWith("=") ? 1 : 0,
    r = new Uint8Array((e.length / 4) * 3 - n),
    a = 0;
  for (let o = 0; o < e.length; o += 4) {
    let i = Ue.indexOf(e[o]),
      c = Ue.indexOf(e[o + 1]),
      l = e[o + 2] === "=" ? 0 : Ue.indexOf(e[o + 2]),
      p = e[o + 3] === "=" ? 0 : Ue.indexOf(e[o + 3]);
    if (i < 0 || c < 0 || l < 0 || p < 0) return null;
    let u = (i << 18) | (c << 12) | (l << 6) | p;
    (a < r.length && (r[a++] = u >>> 16),
      a < r.length && (r[a++] = (u >>> 8) & 255),
      a < r.length && (r[a++] = u & 255));
  }
  return r;
}
s(decodeWireBase64, "decodeWireBase64");
var $t = {
    maxPhysicalFrameBytes: Co.maxFrameBytes,
    maxMessageBytes: 16 * 1024 * 1024,
    maxFragments: 64,
    assemblyTimeoutMs: 3e4,
    transportIdMaxChars: Co.transportEnvelopeIdMaxChars,
  },
  Jd = t.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  Ro = t.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  Dt = t
    .string()
    .min(1)
    .max($t.transportIdMaxChars)
    .regex(/^[A-Za-z0-9._~-]+$/u),
  Oz = t
    .object({ bridgeSessionId: Dt, bridgeGeneration: Ro.optional(), recoveryId: Dt.optional() })
    .strict(),
  ok = t
    .object({ algorithm: t.literal("crc32"), value: t.string().regex(/^[0-9a-f]{8}$/u) })
    .strict();
function isCanonicalBase64(e) {
  if (e.length < 4 || e.length > $t.maxPhysicalFrameBytes) return !1;
  let n = decodeWireBase64(e);
  return n !== null && n.byteLength > 0 && encodeWireBytesBase64(n) === e;
}
s(isCanonicalBase64, "isCanonicalBase64");
var Yd = t
    .object({
      zcode_type: t.literal("rpc-frame"),
      bridgeSessionId: Dt,
      bridgeGeneration: Ro.optional(),
      recoveryId: Dt.optional(),
      seq: Jd,
      messageSeq: Jd,
      fragmentIndex: t
        .number()
        .int()
        .nonnegative()
        .max($t.maxFragments - 1),
      fragmentCount: t.number().int().positive().max($t.maxFragments),
      messageBytes: t.number().int().positive().max($t.maxMessageBytes),
      checksum: ok,
      dataBase64: t.string().min(4).max($t.maxPhysicalFrameBytes).refine(isCanonicalBase64),
    })
    .strict()
    .superRefine((e, n) => {
      (e.fragmentIndex >= e.fragmentCount &&
        n.addIssue({
          code: "custom",
          path: ["fragmentIndex"],
          message: "fragmentIndex must be smaller than fragmentCount",
        }),
        e.fragmentCount > e.messageBytes &&
          n.addIssue({
            code: "custom",
            path: ["fragmentCount"],
            message: "non-empty fragments cannot exceed message bytes",
          }));
    }),
  Xd = t
    .object({
      zcode_type: t.literal("rpc-frame-ack"),
      bridgeSessionId: Dt,
      bridgeGeneration: Ro.optional(),
      recoveryId: Dt.optional(),
      ackMessageSeq: Jd,
    })
    .strict(),
  rk = t.union([Yd, Xd]),
  Az = t
    .object({
      type: t.literal("data"),
      payload: rk,
      client_ts: Ro.optional(),
      server_ts: Ro.optional(),
    })
    .strict();
var T = t.string().trim().min(1),
  ik = [
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
  ak = ["claude", "opencode", "gemini", "codex", "glm"],
  sk = ["claudeCode"],
  ck = t
    .object({
      fileCount: t.number().int().nonnegative(),
      added: t.number().int().nonnegative(),
      removed: t.number().int().nonnegative(),
      files: t.array(
        t
          .object({
            path: t.string(),
            added: t.number().int().nonnegative(),
            removed: t.number().int().nonnegative(),
            writeCount: t.number().int().positive(),
            lastTurnIndex: t.number().int().nonnegative(),
          })
          .strict(),
      ),
    })
    .strict(),
  lk = t.object({
    taskId: T,
    traceId: T,
    title: t.string(),
    titleOverridden: t.boolean().optional(),
    workspacePath: T,
    workspaceIdentity: T.optional(),
    createdAt: t.number().int().nonnegative(),
    updatedAt: t.number().int().nonnegative(),
    mode: t.enum(ik),
    model: t.string().optional(),
    runtimeEpoch: t.number().int().nonnegative().optional(),
    provider: t.enum(ak).optional(),
    migrationSource: t.enum(sk).optional(),
    forkedFromTaskId: T.optional(),
    unreadAt: t.number().int().nonnegative().optional(),
    status: t.enum(["running", "completed", "error"]).optional(),
    lastError: t
      .object({
        code: t.string().optional(),
        message: t.string().min(1),
        traceId: T.optional(),
        taskId: T.optional(),
      })
      .optional(),
    changeSummary: ck.optional(),
  });
function resolveWorkspaceKey(e) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}
s(resolveWorkspaceKey, "resolveWorkspaceKey");
var uk = t.enum([
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
  Qd = t.enum(["observer", "relay_owner"]),
  Po = t.enum(["desktop_window", "relay_bridge"]),
  Og = t
    .object({
      eventId: T,
      workspacePath: T,
      workspaceIdentity: T.optional(),
      workspaceKey: T,
      traceId: T,
      createdAt: t.number().int().nonnegative(),
    })
    .strict(),
  pk = t.object({ runId: T, opSeq: t.number().int().nonnegative() }).strict(),
  Ag = Og.extend({ reason: uk, streamWatermark: pk.optional() }).strict(),
  Ut = s((e, n) => {
    let r = resolveWorkspaceKey(n);
    n.workspaceKey !== r &&
      e.addIssue({
        code: t.ZodIssueCode.custom,
        path: ["workspaceKey"],
        message: "workspaceKey must match workspaceIdentity fallback rule",
      });
  }, "addWorkspaceKeyIssue"),
  xr = s((e, n) => {
    n.runId !== n.traceId &&
      e.addIssue({
        code: t.ZodIssueCode.custom,
        path: ["runId"],
        message: "runId must match traceId",
      });
  }, "addRunIdTraceIdIssue"),
  zg = Ag.extend({ type: t.literal("task_snapshot_invalidated"), taskId: T }).strict(),
  Mg = Ag.extend({
    type: t.literal("workspace_task_list_invalidated"),
    taskId: T.optional(),
    taskMeta: lk.optional(),
  }).strict(),
  $g = t.discriminatedUnion("kind", [
    t
      .object({
        kind: t.literal("image"),
        filename: t.string(),
        mimeType: t.string(),
        sizeBytes: t.number().int().nonnegative().optional(),
        dataBase64: t.string().optional(),
        localPath: t.string().optional(),
      })
      .strict(),
    t
      .object({
        kind: t.literal("audio"),
        filename: t.string(),
        mimeType: t.string(),
        dataBase64: t.string().optional(),
        localPath: t.string().optional(),
      })
      .strict(),
    t
      .object({
        kind: t.literal("file"),
        filename: t.string(),
        mimeType: t.string(),
        sizeBytes: t.number().int().nonnegative(),
        dataBase64: t.string().optional(),
        textContent: t.string().optional(),
        localPath: t.string().optional(),
      })
      .strict(),
  ]),
  mk = t.object({ type: T, taskId: T, traceId: T }).passthrough(),
  Dg = t
    .object({
      kind: t.literal("user_message"),
      messageId: T,
      content: t.string(),
      attachments: t.array($g).optional(),
      timestamp: t.number().finite(),
    })
    .strict(),
  Ug = t.object({ kind: t.literal("stream_event"), event: mk }).strict(),
  Ng = t.discriminatedUnion("kind", [Dg, Ug]),
  gk = t.discriminatedUnion("kind", [
    Dg.extend({ seq: t.number().int().positive() }).strict(),
    Ug.extend({ seq: t.number().int().positive() }).strict(),
  ]),
  Zg = t
    .object({
      workspacePath: T,
      workspaceIdentity: T.optional(),
      workspaceKey: T,
      taskId: T,
      runId: T,
      traceId: T,
      ownerClientId: T.optional(),
      ownerDeviceLabel: T.optional(),
    })
    .strict(),
  eu = Zg.superRefine((e, n) => {
    (Ut(n, e), xr(n, e));
  }),
  Bg = Og.extend({
    type: t.literal("task_stream_mirror_batch"),
    taskId: T,
    runId: T,
    ownerClientId: T.optional(),
    ownerDeviceLabel: T.optional(),
    batchSeq: t.number().int().positive(),
    fromSeq: t.number().int().positive(),
    toSeq: t.number().int().positive(),
    ops: t.array(gk),
    terminal: t.boolean(),
  }).strict(),
  jg = eu,
  Lg = Zg.extend({ leaseRequestId: T })
    .strict()
    .superRefine((e, n) => {
      (Ut(n, e), xr(n, e));
    }),
  Wg = t.discriminatedUnion("acquired", [
    t.object({ leaseRequestId: T, acquired: t.literal(!0), ownerHostId: T }).strict(),
    t
      .object({
        leaseRequestId: T,
        acquired: t.literal(!1),
        ownerHostId: T,
        reason: t.literal("owned_by_other_host"),
      })
      .strict(),
  ]),
  Nt = t
    .object({
      commandRequestId: T,
      workspacePath: T,
      workspaceIdentity: T.optional(),
      workspaceKey: T,
      taskId: T,
      runId: T,
    })
    .strict(),
  Fg = Nt.extend({ type: t.literal("stop_generation") }).strict(),
  qg = Nt.extend({
    type: t.literal("respond_permission"),
    permissionRequestId: T,
    optionId: T,
    response: At,
  }).strict(),
  Vg = Nt.extend({
    type: t.literal("respond_elicitation"),
    elicitationRequestId: T,
    action: t.enum(["accept", "decline", "cancel"]),
    content: t.record(t.string(), t.unknown()).optional(),
  }).strict(),
  fk = t
    .object({
      commandId: T,
      taskId: T,
      traceId: T,
      workspacePath: T,
      workspaceIdentity: T.optional(),
      workspaceKey: T,
      status: t.enum(["accepted", "running", "failed"]),
      createdAt: t.number().int().nonnegative(),
      updatedAt: t.number().int().nonnegative(),
      clientId: T.optional(),
      clientLabel: T.optional(),
      error: t.string().optional(),
    })
    .strict(),
  Gg = t.discriminatedUnion("type", [
    fk
      .extend({
        type: t.literal("send_prompt"),
        content: t.string(),
        attachments: t.array($g).optional(),
        automationId: T.optional(),
      })
      .strict(),
  ]),
  Kg = Nt.extend({ type: t.literal("enqueue_task_command"), taskCommand: Gg }).strict(),
  Hg = Nt.extend({
    type: t.literal("promote_task_command"),
    commandId: T,
    clientMode: t.literal("web-remote-replayable"),
  }).strict(),
  Jg = Nt.extend({
    type: t.literal("cancel_task_command"),
    commandId: T,
    clientMode: t.literal("web-remote-replayable"),
  }).strict(),
  Yg = t.discriminatedUnion("type", [Fg, qg, Vg, Kg, Hg, Jg]).superRefine((e, n) => {
    Ut(n, e);
  }),
  Xg = t
    .discriminatedUnion("type", [
      Fg.extend({ requesterHostId: T }).strict(),
      qg.extend({ requesterHostId: T }).strict(),
      Vg.extend({ requesterHostId: T }).strict(),
      Kg.extend({ requesterHostId: T }).strict(),
      Hg.extend({ requesterHostId: T }).strict(),
      Jg.extend({ requesterHostId: T }).strict(),
    ])
    .superRefine((e, n) => {
      Ut(n, e);
    }),
  hk = t.enum(["NO_ACTIVE_TASK_OWNER", "STALE_TASK_OWNER_COMMAND", "OWNER_COMMAND_FAILED"]),
  tu = t.discriminatedUnion("success", [
    t.object({ commandRequestId: T, success: t.literal(!0), taskCommand: Gg.optional() }).strict(),
    t
      .object({
        commandRequestId: T,
        success: t.literal(!1),
        error: t.string(),
        code: hk.optional(),
      })
      .strict(),
  ]),
  Qg = t.discriminatedUnion("type", [zg, Mg, Bg]).superRefine((e, n) => {
    (Ut(n, e), e.type === "task_stream_mirror_batch" && xr(n, e));
  }),
  ef = t
    .discriminatedUnion("type", [
      zg.extend({ originHostId: T, deliveryPurpose: Qd.optional() }).strict(),
      Mg.extend({ originHostId: T, deliveryPurpose: Qd.optional() }).strict(),
      Bg.extend({ originHostId: T, deliveryPurpose: Qd.optional() }).strict(),
    ])
    .superRefine((e, n) => {
      (Ut(n, e), e.type === "task_stream_mirror_batch" && xr(n, e));
    });
var f = t.string().trim().min(1),
  tM = t.array(t.string()),
  se = f.max(Co.transportEnvelopeIdMaxChars).regex(/^[A-Za-z0-9._~-]+$/u),
  yk = t.object({
    workspacePath: f,
    workspaceIdentity: f.optional(),
    remoteSessionId: f.optional(),
    label: f,
    workspacePurpose: t.enum(["project", "conversation"]).optional(),
    kind: t.enum(["local", "remote"]),
    connectionState: t.enum(["connected", "disconnected", "reconnecting"]).optional(),
    lastConnectionError: t.string().optional(),
  }),
  of = t.array(yk),
  oM = t.object({ requestId: f, workspaceKey: f }),
  nM = t.union([
    t.object({ requestId: f, workspaceKey: f, success: t.literal(!0) }),
    t.object({ requestId: f, workspaceKey: f, success: t.literal(!1), error: t.string() }),
  ]),
  bk = t.object({
    taskId: f,
    title: t.string(),
    workspacePath: f,
    workspaceIdentity: f.optional(),
    remoteSessionId: f.optional(),
    workspaceLabel: f,
    workspaceKind: t.enum(["local", "remote"]),
    createdAt: t.number().finite(),
    updatedAt: t.number().finite(),
    provider: ie.optional(),
    unreadAt: t.number().finite().optional(),
    displayStatus: t.enum(["idle", "running", "completed", "error"]).optional(),
    pinned: t.boolean().optional(),
    archived: t.boolean().optional(),
  }),
  nf = t.array(bk),
  ou = t.enum([
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
  vk = t.discriminatedUnion("kind", [
    t.object({
      bridgeSessionId: se,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      kind: t.literal("local"),
      workspaceKey: f,
      workspacePath: f,
      initialTaskId: f.optional(),
    }),
    t.object({
      bridgeSessionId: se,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      kind: t.literal("remote"),
      workspaceKey: f,
      workspacePath: f,
      workspaceIdentity: f,
      remoteSessionId: f,
      initialTaskId: f.optional(),
    }),
  ]),
  ru = t.object({
    activeWorkspaceKey: f.optional(),
    activeTaskId: f.optional(),
    updatedAt: t.number().finite(),
  }),
  Sk = t.object({
    platform: f,
    version: f,
    name: f,
    userAgent: t.string().optional(),
    language: t.string().optional(),
    languages: t.array(t.string()).optional(),
    browserPlatform: t.string().optional(),
    viewport: t
      .object({
        width: t.number().finite(),
        height: t.number().finite(),
        devicePixelRatio: t.number().finite(),
      })
      .optional(),
    screen: t.object({ width: t.number().finite(), height: t.number().finite() }).optional(),
    timezone: t.string().optional(),
    online: t.boolean().optional(),
    updatedAt: t.number().finite(),
  }),
  kk = t.object({
    windowControlSessionId: f,
    workspaces: of,
    tasks: nf,
    initialViewState: ru.optional(),
    mobileViewState: ru.optional(),
  }),
  tf = t.object({
    workspaces: of,
    tasks: nf.optional(),
    activeWorkspaceKey: f.optional(),
    activeTaskId: f.optional(),
  }),
  nu = t.enum([
    "isDockerAvailable",
    "listWSLDistros",
    "listDockerContainers",
    "listSSHConfigAliases",
    "loadMcpFromUserDirectory",
    "saveMcpToUserDirectory",
    "migrateLegacyCommonMcp",
  ]),
  _k = [
    t.object({ zcode_type: t.literal("bootstrap-request"), requestId: f }),
    t.object({
      zcode_type: t.literal("bootstrap-response"),
      requestId: f,
      success: t.literal(!0),
      result: kk,
    }),
    t.object({ zcode_type: t.literal("workspace-list-request"), requestId: f }),
    t.object({
      zcode_type: t.literal("workspace-list-response"),
      requestId: f,
      success: t.literal(!0),
      result: tf,
    }),
    t.object({ zcode_type: t.literal("workspace-list-updated"), result: tf }),
    t.object({
      zcode_type: t.literal("workspace-bridge-open"),
      requestId: f,
      bridgeSessionId: se,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      workspaceKey: f,
      taskId: f.optional(),
    }),
    t.object({
      zcode_type: t.literal("workspace-bridge-ready"),
      requestId: f,
      bridgeSessionId: se,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      bridge: vk,
    }),
    t.object({
      zcode_type: t.literal("workspace-bridge-error"),
      requestId: f,
      bridgeSessionId: se.optional(),
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      reason: ou,
      error: t.string(),
    }),
    t.object({
      zcode_type: t.literal("workspace-reconnect-request"),
      requestId: f,
      workspaceKey: f,
    }),
    t.object({
      zcode_type: t.literal("workspace-reconnect-response"),
      requestId: f,
      workspaceKey: f,
      success: t.literal(!0),
    }),
    t.object({
      zcode_type: t.literal("workspace-reconnect-response"),
      requestId: f,
      workspaceKey: f,
      success: t.literal(!1),
      error: t.string(),
    }),
    t.object({
      zcode_type: t.literal("mobile-view-state-update"),
      viewState: ru,
      deviceInfo: Sk.optional(),
    }),
    t.object({
      zcode_type: t.literal("platform-request"),
      requestId: f,
      method: nu,
      args: t.unknown().optional(),
    }),
    t.object({
      zcode_type: t.literal("platform-response"),
      requestId: f,
      method: nu,
      success: t.literal(!0),
      result: t.unknown(),
    }),
    t.object({
      zcode_type: t.literal("platform-response"),
      requestId: f,
      method: nu,
      success: t.literal(!1),
      error: t.string(),
    }),
    Yd,
    Xd,
    t.object({
      zcode_type: t.literal("bridge-degraded"),
      bridgeSessionId: se,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      reason: t.enum(["rpc-transport-fault", "rpc-frame-gap", "buffer-overflow", "buffer-timeout"]),
      seq: t.number().int().nonnegative().optional(),
      expectedSeq: t.number().int().nonnegative().optional(),
      droppedCount: t.number().int().nonnegative().optional(),
    }),
    t.object({
      zcode_type: t.literal("app-error"),
      requestId: f.optional(),
      bridgeSessionId: se.optional(),
      reason: ou,
      error: t.string(),
    }),
    t.object({
      zcode_type: t.literal("mobile-diagnostic"),
      event: t.enum([
        "state-transition",
        "socket-close",
        "socket-error",
        "recover-start",
        "recover-scheduled",
        "pair-status",
        "failure",
      ]),
      timestamp: t.number().int().nonnegative(),
      state: t.string().optional(),
      previousState: t.string().optional(),
      pairStatus: t.enum(["waiting", "matched"]).optional(),
      closeCode: t.number().int().optional(),
      closeReason: t.string().optional(),
      wasClean: t.boolean().optional(),
      wasPaired: t.boolean().optional(),
      failureReason: ou.optional(),
      failureMessage: t.string().optional(),
      visibilityState: t.string().optional(),
      online: t.boolean().optional(),
      hiddenDurationMs: t.number().int().nonnegative().optional(),
    }),
  ],
  rM = t.union(_k);
var iM = t.record(t.string(), t.string());
var aM = t.string(),
  rf = t.object({
    kind: t.literal("ssh"),
    host: f,
    port: t.number().int().positive().max(65535).optional(),
    username: f,
    sshConfigAlias: f.optional(),
    password: t.string().optional(),
    privateKeyPath: t.string().optional(),
    privateKeyPassphrase: t.string().optional(),
    assetInstallMode: t.enum(yr).optional(),
    resourcePackages: t
      .object({ selectedPackageIds: t.array(t.string().refine(isKnownRemoteResourcePackageId)).optional() })
      .optional(),
  }),
  af = t.object({ kind: t.literal("wsl"), distro: t.string().optional(), user: xo.optional() }),
  xk = t.object({ kind: t.literal("docker"), container: f }),
  Ik = t.object({
    kind: t.literal("server"),
    url: t.string().url(),
    name: f.optional(),
    token: t.string().optional(),
    workspacePath: t.string().optional(),
    serverId: f.optional(),
  }),
  To = t.discriminatedUnion("kind", [rf, af, xk, Ik]),
  sM = t.object({
    type: t.literal("zcode-hello"),
    version: t.string(),
    platform: t.string(),
    arch: t.string(),
    pid: t.number().int(),
  }),
  cM = t.object({ type: t.literal("zcode-hello-ack"), version: t.string(), clientId: f }),
  lM = t.object({ level: t.enum(["info", "warn", "error"]), args: t.array(t.unknown()) }),
  dM = t.object({
    taskId: f,
    status: t.enum([
      "completed",
      "failed",
      "permission_request",
      "elicitation_request",
      "feedback_update",
    ]),
    requestId: f.optional(),
    title: t.string(),
    body: t.string(),
  }),
  Ck = t.object({ clientTimezone: f, clientLanguage: f, screenResolution: f }),
  uM = t.object({
    context: Ck,
    elementName: f,
    eventRegion: f,
    eventType: f,
    eventText: t.string().optional(),
    eventExtraDetail: t.record(t.string(), t.string()),
    userId: t.string().optional(),
    talkId: t.string().optional(),
    messageId: t.string().optional(),
  }),
  pM = t.object({
    name: f,
    group: f,
    value: t.number().finite().optional(),
    properties: t
      .record(t.string(), t.union([t.string(), t.number().finite(), t.boolean(), t.undefined()]))
      .optional(),
  }),
  Rk = t.object({ channel: f, payload: t.unknown(), sourceWindowId: t.number().int().optional() }),
  Ir = t.object({
    mockCdnDir: t.string().optional(),
    remoteCdnBaseUrl: t.string().optional(),
    remoteCdnBaseUrls: t.array(t.string()).optional(),
    remoteCacheDir: t.string().optional(),
  }),
  Pk = t.object({ workspacePath: f, workspaceIdentity: f.optional() }),
  Tk = t.object({
    type: t.literal("init-local"),
    hostId: f.optional(),
    deliveryKind: Po.optional(),
    deviceMid: t.string().optional(),
    feedbackApiBase: t.string().url().optional(),
    workspacePath: f.optional(),
    workspaceIdentity: f.optional(),
    agentWarmupTargets: t.array(Pk).max(3).optional(),
    agentSpawnFallbackCwd: f.optional(),
    runtimeProcessEnvPatch: t
      .record(t.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), t.string())
      .optional(),
  }),
  wk = t.object({ type: t.literal("init-remote"), target: To, remoteAssets: Ir }),
  Ek = t.object({
    type: t.literal("init-remote-workspace"),
    target: To,
    remoteAssets: Ir,
    workspacePath: f.optional(),
    workspaceIdentity: f.optional(),
    hostId: f.optional(),
    deliveryKind: Po.optional(),
  }),
  Ok = t.object({
    type: t.literal("init-remote-ssh-host"),
    target: rf,
    remoteAssets: Ir,
    hostId: f.optional(),
    deliveryKind: Po.optional(),
  }),
  Ak = t.object({
    type: t.literal("init-remote-wsl-host"),
    target: af,
    remoteAssets: Ir,
    hostId: f.optional(),
    deliveryKind: Po.optional(),
  }),
  zk = t
    .object({
      type: t.literal("attach-service-port"),
      attachmentId: f,
      clientMode: t.enum(["desktop-continuous", "web-remote-replayable"]),
    })
    .strict(),
  Mk = t.object({ type: t.literal("detach-service-port"), attachmentId: f }),
  $k = t.object({
    type: t.literal("acquire-remote-workspace"),
    requestId: f,
    workspacePath: f,
    workspaceIdentity: f.optional(),
    generation: t.number().int().positive(),
  }),
  Dk = t.object({
    type: t.literal("release-remote-workspace"),
    workspacePath: f,
    workspaceIdentity: f.optional(),
    generation: t.number().int().positive(),
  }),
  Uk = t.object({ type: t.literal("dispose") }),
  sf = t.object({ type: t.literal("broadcast"), message: Rk }),
  Nk = t.object({ type: t.literal("task-realtime-deliver"), event: ef }),
  Zk = t.object({ type: t.literal("task-run-lease-result"), result: Wg }),
  Bk = t.object({ type: t.literal("task-owner-command-deliver"), command: Xg }),
  jk = t.object({ type: t.literal("task-owner-command-result"), result: tu }),
  Lk = t.object({
    type: t.literal("bot-remote-workspace-reconnect-result"),
    requestId: f,
    ok: t.boolean(),
    sessionId: f.optional(),
    error: t.string().optional(),
  }),
  Wk = t.object({
    type: t.literal("bot-remote-workspace-connection-status-result"),
    requestId: f,
    ok: t.boolean(),
    connected: t.boolean().optional(),
    error: t.string().optional(),
  }),
  Fk = t.object({
    type: t.literal("bot-remote-workspace-runtime-port"),
    requestId: f,
    ok: t.boolean(),
    error: t.string().optional(),
  }),
  cf = t.object({
    content: f,
    createdAt: f,
    fromSessionId: f,
    messageId: f,
    requestId: f,
    toSessionId: f,
  }),
  lf = t.object({
    error: t.string().optional(),
    messageId: f,
    requestId: f,
    sessionId: f,
    status: t.enum(["success", "failed"]),
  }),
  qk = t.object({ sessionId: f }),
  Vk = t.object({ type: t.literal("session-message-deliver"), request: cf }),
  Gk = t.object({ type: t.literal("session-message-delivery-result"), result: lf }),
  Kk = t.object({
    type: t.literal("feedback-log-archive-result"),
    requestId: f,
    ok: t.boolean(),
    path: t.string().optional(),
    size: t.number().int().nonnegative().optional(),
    error: t.string().optional(),
  }),
  Hk = t.object({
    type: t.literal("cron-run"),
    automationId: f,
    runId: f,
    workspacePath: f,
    workspaceIdentity: t.string().optional(),
    prompt: f,
    targetTaskId: f.optional(),
    model: t.string().optional(),
    provider: t.string().optional(),
    mode: t.string().optional(),
    thoughtLevel: t.string().optional(),
  }),
  Jk = t.object({
    type: t.literal("off-peak-run"),
    offPeakTaskId: f,
    workspacePath: f,
    workspaceIdentity: t.string().optional(),
    prompt: f,
    permissionMode: f,
    model: t.string().optional(),
    thoughtLevel: t.string().optional(),
    conversationId: t.string().optional(),
    sessionId: t.string().optional(),
    serverTicketId: t.string().optional(),
  }),
  Yk = t.object({ type: t.literal("browser-execute-result"), requestId: f, result: Ot }),
  mM = t.discriminatedUnion("type", [
    Tk,
    wk,
    Ek,
    Ok,
    Ak,
    zk,
    Mk,
    $k,
    Dk,
    Uk,
    sf,
    Nk,
    Zk,
    Bk,
    jk,
    Lk,
    Wk,
    Fk,
    Vk,
    Gk,
    Kk,
    Hk,
    Jk,
    Yk,
  ]),
  Xk = t.object({ type: t.literal("connected") }),
  Qk = t.object({
    type: t.literal("remote-workspace-acquired"),
    requestId: f,
    workspacePath: f,
    workspaceIdentity: f.optional(),
    generation: t.number().int().positive(),
    ok: t.boolean(),
    error: t.string().optional(),
  }),
  e_ = t.object({ type: t.literal("error"), error: t.string() }),
  t_ = t.object({
    type: t.literal("log"),
    level: t.enum(["info", "warn", "error"]),
    source: t.string(),
    message: t.string(),
  });
var o_ = t.enum(["claudeCode"]),
  n_ = t.object({
    type: t.literal("agent-process-spawned"),
    pid: t.number().int().positive(),
    provider: ie,
    workspacePath: f,
    command: t.string(),
    args: t.array(t.string()),
    startedAt: t.number().int().nonnegative(),
    runtimeGeneration: t.number().int().positive().optional(),
    runtimeInstanceId: f.optional(),
  }),
  r_ = t.object({
    type: t.literal("agent-process-ready"),
    pid: t.number().int().positive(),
    provider: ie,
    workspacePath: f,
    readyAt: t.number().int().nonnegative(),
    startupDurationMs: t.number().int().nonnegative(),
    runtimeGeneration: t.number().int().positive(),
    runtimeInstanceId: f,
  }),
  i_ = t.object({
    type: t.literal("agent-process-exited"),
    pid: t.number().int().positive(),
    provider: ie,
    workspacePath: f,
    exitCode: t.number().int().nullable(),
    signal: t.string().nullable(),
    endedAt: t.number().int().nonnegative(),
    terminationKind: t.enum(["expected", "unexpected", "watchdog_recycle"]),
    terminationReason: t.string().optional(),
    runtimeReady: t.boolean().optional(),
    runtimeGeneration: t.number().int().positive(),
    runtimeInstanceId: f.optional(),
    uptimeMs: t.number().int().nonnegative(),
    stderrLineCount: t.number().int().nonnegative(),
    stderrTail: t.array(t.string().max(1100)).max(20).optional(),
  }),
  a_ = t.object({
    type: t.literal("agent-process-error"),
    pid: t.number().int().positive().nullable(),
    provider: ie,
    workspacePath: f,
    command: t.string(),
    args: t.array(t.string()),
    errorName: f,
    errorCode: t.string().optional(),
    errorMessage: t.string(),
    errorStack: t.string().optional(),
    runtimeGeneration: t.number().int().positive(),
    runtimeInstanceId: f.optional(),
    occurredAt: t.number().int().nonnegative(),
  }),
  s_ = t
    .object({
      type: t.literal("agent-resource-sample"),
      runtimeSurface: t.enum(["local", "remote"]),
      sample: ig,
    })
    .strict(),
  c_ = t.object({
    type: t.literal("agent-running-task-count-changed"),
    runningTaskCount: t.number().int().nonnegative(),
  }),
  l_ = t.object({
    type: t.literal("workspace-running-task-count-changed"),
    workspacePath: f,
    workspaceIdentity: f.optional(),
    runningTaskCount: t.number().int().nonnegative(),
  }),
  d_ = t.object({
    type: t.literal("repo-wiki-running-task-count-changed"),
    runningTaskCount: t.number().int().nonnegative(),
  }),
  u_ = t.object({ type: t.literal("task-realtime-publish"), event: Qg }),
  p_ = t.object({ type: t.literal("task-stream-op-publish"), target: eu, op: Ng }),
  m_ = t.object({ type: t.literal("task-run-lease-acquire"), request: Lg }),
  g_ = t.object({ type: t.literal("task-run-lease-release"), target: jg }),
  f_ = t.object({ type: t.literal("task-owner-command-request"), command: Yg }),
  h_ = t.object({ type: t.literal("task-owner-command-result"), result: tu }),
  y_ = t.object({
    type: t.literal("bot-remote-workspace-reconnect-request"),
    requestId: f,
    workspacePath: f,
    workspaceIdentity: f,
    target: To,
  }),
  b_ = t.object({
    type: t.literal("bot-remote-workspace-connection-status-request"),
    requestId: f,
    workspacePath: f,
    workspaceIdentity: f,
    target: To,
  }),
  v_ = t.object({
    type: t.literal("bot-remote-workspace-runtime-port-request"),
    requestId: f,
    workspacePath: f,
    workspaceIdentity: f,
    target: To,
  }),
  S_ = t.object({ type: t.literal("session-message-send-requested"), request: cf }),
  k_ = t.object({ type: t.literal("session-route-announce"), route: qk }),
  __ = t.object({ type: t.literal("session-message-deliver-result"), result: lf }),
  x_ = t.object({ type: t.literal("feedback-log-archive-request"), requestId: f, sourceDir: f }),
  I_ = t.object({
    type: t.literal("cron-run-result"),
    runId: f,
    ok: t.boolean(),
    taskId: t.string().optional(),
    sessionId: t.string().optional(),
    error: t.string().optional(),
    failureKind: t.enum(["transient", "permanent"]).optional(),
  }),
  C_ = t.object({
    type: t.literal("off-peak-run-result"),
    offPeakTaskId: f,
    ok: t.boolean(),
    conversationId: t.string().optional(),
    sessionId: t.string().optional(),
    error: t.string().optional(),
    failureKind: t.enum(["transient", "permanent"]).optional(),
  }),
  R_ = t.object({ type: t.literal("cron-scheduler-wake-request"), automationId: f }),
  P_ = t.object({
    type: t.literal("off-peak-scheduler-wake-request"),
    offPeakTaskId: t.string().optional(),
  }),
  T_ = t.object({
    type: t.literal("browser-execute-request"),
    requestId: f,
    browserId: f.optional(),
    browserGeneration: t.number().int().nonnegative().optional(),
    sessionId: f,
    turnId: f.optional(),
    workspaceKey: f.optional(),
    workspacePath: f.optional(),
    workspaceIdentity: f.optional(),
    remoteSessionId: f.optional(),
    clientMode: t.enum(["desktop-continuous", "web-remote-replayable"]).optional(),
    sessionContext: t.enum(["live", "cached"]).optional(),
    command: Et,
  }),
  w_ = t.object({
    transport: t.enum(["http", "websocket", "rpc"]),
    interface: t.string(),
    durationMs: t.number(),
    ok: t.boolean(),
    statusCode: t.number().optional(),
    errorKind: t.string().optional(),
    attempt: t.number().int().positive().optional(),
    dnsMs: t.number().optional(),
    tcpMs: t.number().optional(),
    tlsMs: t.number().optional(),
    ttfbMs: t.number().optional(),
    downloadMs: t.number().optional(),
  }),
  E_ = t.object({ type: t.literal("network-telemetry-batch"), observations: t.array(w_).max(500) }),
  gM = t.discriminatedUnion("type", [
    Xk,
    Qk,
    e_,
    t_,
    n_,
    r_,
    i_,
    a_,
    s_,
    c_,
    l_,
    d_,
    sf,
    u_,
    p_,
    m_,
    g_,
    f_,
    h_,
    y_,
    b_,
    v_,
    S_,
    k_,
    __,
    x_,
    T_,
    E_,
    I_,
    C_,
    R_,
    P_,
  ]),
  O_ = t.enum(["running", "completed", "error"]),
  A_ = t.object({
    kind: t.literal("image"),
    filename: t.string(),
    mimeType: t.string(),
    sizeBytes: t.number().int().nonnegative().optional(),
    dataBase64: t.string().optional(),
    localPath: t.string().optional(),
  }),
  z_ = t.object({
    kind: t.literal("file"),
    filename: t.string(),
    mimeType: t.string(),
    sizeBytes: t.number().int().nonnegative(),
    dataBase64: t.string().optional(),
    textContent: t.string().optional(),
    localPath: t.string().optional(),
  }),
  M_ = t.discriminatedUnion("kind", [A_, z_]),
  $_ = t.object({
    toolName: t.string().optional(),
    title: t.string().optional(),
    kind: t.string().optional(),
    status: t.enum(["completed", "failed", "denied", "stopped"]).optional(),
    input: t.unknown(),
    output: t.unknown().optional(),
    error: t.string().optional(),
    raw: t.unknown().optional(),
    snapshotRefs: t
      .array(
        t.object({
          field: t.enum(["input", "output", "raw"]),
          refId: t.string(),
          hash: t.string(),
          fullBytes: t.number().int().nonnegative(),
          previewBytes: t.number().int().nonnegative(),
        }),
      )
      .optional(),
  }),
  D_ = t.discriminatedUnion("type", [
    t.object({ type: t.literal("content"), content: t.string() }),
    t.object({ type: t.literal("thought"), content: t.string() }),
    t.object({ type: t.literal("tool-call"), toolIndex: t.number().int().nonnegative() }),
  ]),
  U_ = t.object({
    id: t.string().optional(),
    role: t.enum(["user", "assistant"]),
    content: t.string(),
    timestamp: t.number().int().nonnegative(),
    model: t.string().optional(),
    characterCount: t.number().int().nonnegative().optional(),
    durationMs: t.number().int().nonnegative().optional(),
    interrupted: t.boolean().optional(),
    feedback: t.enum(["like", "dislike"]).optional(),
    attachments: t.array(M_).optional(),
    tools: t.array($_).optional(),
    thought: t.string().optional(),
    parts: t.array(D_).optional(),
    checkpointState: t.enum(["partial"]).optional(),
    checkpointReason: t.enum(["tool_completed", "part_boundary", "periodic"]).optional(),
    checkpointUpdatedAt: t.number().int().nonnegative().optional(),
    turnIndex: t.number().int().nonnegative().optional(),
    bodyRefs: t
      .array(
        t.object({
          field: t.enum(["content", "thought"]),
          refId: t.string(),
          hash: t.string(),
          fullBytes: t.number().int().nonnegative(),
          previewBytes: t.number().int().nonnegative(),
        }),
      )
      .optional(),
    toolSlice: t
      .object({
        persistedMessageIndex: t.number().int().nonnegative(),
        totalTools: t.number().int().nonnegative(),
        startToolIndex: t.number().int().nonnegative(),
        endToolIndexExclusive: t.number().int().nonnegative(),
      })
      .optional(),
  }),
  N_ = t.enum(["active", "paused", "budget_limited", "complete"]),
  Z_ = t.enum([
    "set",
    "status_updated",
    "cleared",
    "usage_accounted",
    "run_started",
    "run_finished",
    "summary_updated",
  ]),
  B_ = t.enum(["command", "tool", "runtime"]),
  iu = t.object({
    sessionID: f,
    targetID: f,
    objective: f,
    summaryTitle: t.string().min(1).nullable().default(null),
    status: N_,
    tokenBudget: t.number().int().positive().nullable(),
    tokensUsed: t.number().int().nonnegative(),
    timeUsedSeconds: t.number().int().nonnegative(),
    activeInputId: f.nullable().optional(),
    activeRunStartedAtMs: t.number().int().nonnegative().nullable().optional(),
    activeRunLastSeenAtMs: t.number().int().nonnegative().nullable().optional(),
    time: t.object({
      created: t.number().int().nonnegative(),
      updated: t.number().int().nonnegative(),
    }),
  }),
  fM = t.object({
    action: Z_,
    source: B_,
    target: iu.nullable(),
    previousTarget: iu.nullable().optional(),
  });
var j_ = t.object({
    taskId: f,
    traceId: f,
    title: t.string(),
    titleOverridden: t.boolean().optional(),
    workspacePath: f,
    workspaceIdentity: f.optional(),
    workspacePurpose: t.enum(["project", "conversation"]).optional(),
    createdAt: t.number().int().nonnegative(),
    updatedAt: t.number().int().nonnegative(),
    mode: zt,
    model: t.string().optional(),
    thoughtLevel: f.optional(),
    runtimeEpoch: t.number().int().nonnegative().optional(),
    provider: ie.optional(),
    migrationSource: o_.optional(),
    forkedFromTaskId: f.optional(),
    cronAutomationId: f.optional(),
    offPeakTaskId: f.optional(),
    unreadAt: t.number().int().nonnegative().optional(),
    status: O_.optional(),
    lastError: t
      .object({
        code: t.string().optional(),
        detail: t.string().optional(),
        message: t.string().min(1),
        traceId: f.optional(),
        taskId: f.optional(),
      })
      .optional(),
    repairState: t
      .object({
        claudeNativeSnapshotAssistantContentVersion: t.number().int().nonnegative().optional(),
        codexNativeSnapshotSubagentToolsVersion: t.number().int().nonnegative().optional(),
      })
      .optional(),
    changeSummary: t
      .object({
        fileCount: t.number().int().nonnegative(),
        added: t.number().int().nonnegative(),
        removed: t.number().int().nonnegative(),
        files: t.array(
          t.object({
            path: t.string(),
            added: t.number().int().nonnegative(),
            removed: t.number().int().nonnegative(),
            writeCount: t.number().int().positive(),
            lastTurnIndex: t.number().int().nonnegative(),
          }),
        ),
      })
      .optional(),
    target: iu.nullable().optional(),
  }),
  L_ = t.enum(["idle", "syncing", "ready", "stale", "failed"]),
  hM = t.object({ provider: ie, sessionId: f, lastSyncedTurnIndex: t.number().int(), state: L_ }),
  W_ = t.object({ workspaceHash: f, taskId: f }),
  yM = t.object({ version: t.literal("1"), tasks: t.array(W_) }),
  F_ = t.object({
    path: t.string(),
    beforeContent: t.string().nullable(),
    afterContent: t.string(),
    writeCount: t.number().int().positive(),
    contentRefs: t
      .array(
        t.object({
          field: t.enum(["beforeContent", "afterContent"]),
          refId: t.string(),
          hash: t.string(),
          fullBytes: t.number().int().nonnegative(),
          previewBytes: t.number().int().nonnegative(),
        }),
      )
      .optional(),
  }),
  q_ = t.object({
    turnIndex: t.number().int().nonnegative(),
    snapshots: t.array(F_),
    fileState: t.enum(["applied", "reverted"]).optional(),
  }),
  V_ = t.object({
    turnIndex: t.number().int().nonnegative(),
    baseFileCheckpointId: f,
    resultFileCheckpointId: f.optional(),
  }),
  bM = t.object({
    meta: j_,
    messages: t.array(U_),
    fileChanges: t.array(q_).optional(),
    turnCheckpoints: t.array(V_).optional(),
  });
var K_ = 1,
  H_ = t.object({
    path: t.string().trim().min(1),
    label: t.string().trim().min(1).optional(),
    workspaceIdentity: t.string().trim().min(1).optional(),
  }),
  b$ = t.object({
    serverId: t.string().trim().min(1),
    name: t.string().trim().min(1).optional(),
    version: t.string(),
    protocolVersion: t.literal(K_),
    authRequired: t.boolean(),
    workspaces: t.array(H_),
    capabilities: t.object({ desktopContinuous: t.literal(!0), websocketRpc: t.literal(!0) }),
  }),
  v$ = t
    .object({ capability: t.string().trim().min(1), expiresAt: t.number().int().positive() })
    .strict();
var b = {
  SelectDirectory: "zcode:select-directory",
  SelectFile: "zcode:select-file",
  SelectFiles: "zcode:select-files",
  CreateTempTextAttachment: "zcode:create-temp-text-attachment",
  SaveFile: "zcode:save-file",
  PrintToPdf: "zcode:print-to-pdf",
  RemoteConnectionLog: "zcode:remote-connection-log",
  RemoteSessionClosed: "zcode:remote-session-closed",
  BotRemoteWorkspaceReconnected: "zcode:bot-remote-workspace-reconnected",
  ActivateOrSetWorkspace: "zcode:activate-or-set-workspace",
  NofyListWorkspaces: "zcode:nofy-list-workspaces", // WS-ENUM：全量 workspace 枚举
  NofyWorkspaceSessions: "zcode:nofy-workspace-sessions", // WS-ENUM：单 workspace 会话懒加载
  ConnectRemote: "zcode:connect-remote",
  CancelPendingRemoteConnection: "zcode:cancel-pending-remote-connection",
  BindRemoteWorkspaceSessionContext: "zcode:bind-remote-workspace-session-context",
  StartWebRemoteControl: "zcode:start-web-remote-control",
  ResetWebRemoteControlPairing: "zcode:reset-web-remote-control-pairing",
  StopWebRemoteControl: "zcode:stop-web-remote-control",
  GetWebRemoteControlStatus: "zcode:get-web-remote-control-status",
  WebRemoteControlStatusChanged: "zcode:web-remote-control-status-changed",
  DisposeRemoteSession: "zcode:dispose-remote-session",
  IsDockerAvailable: "zcode:is-docker-available",
  ListWSLDistros: "zcode:list-wsl-distros",
  ListDockerContainers: "zcode:list-docker-containers",
  ListSSHConfigAliases: "zcode:list-ssh-config-aliases",
  LoadMcpFromUserDirectory: "zcode:load-mcp-from-user-directory",
  SaveMcpToUserDirectory: "zcode:save-mcp-to-user-directory",
  Log: "zcode:log",
  SyncWindowTabs: "zcode:sync-window-tabs",
  SyncWebRemoteControlWorkspaces: "zcode:sync-web-remote-control-workspaces",
  SyncWebRemoteControlTasks: "zcode:sync-web-remote-control-tasks",
  WebRemoteControlReconnectWorkspace: "zcode:web-remote-control-reconnect-workspace",
  SyncWindowUnreadCount: "zcode:sync-window-unread-count",
  SyncAppSettings: "zcode:sync-app-settings",
  FocusTab: "zcode:focus-tab",
  NewTab: "zcode:new-tab",
  CloseActiveContextRequest: "zcode:close-active-context-request",
  OpenBrowserUrl: "zcode:open-browser-url",
  BrowserViewReady: "zcode:browser-view-ready",
  BrowserViewOperation: "zcode:browser-view-operation",
  BrowserViewVisibility: "zcode:browser-view-visibility",
  BrowserViewViewportChanged: "zcode:browser-view-viewport-changed",
  BrowserViewScreenshotSurfacePrepare: "zcode:browser-view-screenshot-surface-prepare",
  BrowserViewScreenshotSurfaceReady: "zcode:browser-view-screenshot-surface-ready",
  BrowserViewScreenshotSurfaceRelease: "zcode:browser-view-screenshot-surface-release",
  BrowserViewCloseTab: "zcode:browser-view-close-tab",
  BrowserViewSuspend: "zcode:browser-view-suspend",
  BrowserViewRestore: "zcode:browser-view-restore",
  NewTask: "zcode:new-task",
  OpenWorkspace: "zcode:open-workspace",
  OpenWorkspacePath: "zcode:open-workspace-path",
  OpenFeedbackDialog: "zcode:open-feedback-dialog",
  OpenTicketsPanel: "zcode:open-tickets-panel",
  WindowFullscreenChanged: "zcode:window-fullscreen-changed",
  GetDesktopWindowChromeState: "zcode:get-desktop-window-chrome-state",
  DesktopWindowChromeStateChanged: "zcode:desktop-window-chrome-state-changed",
  WindowControlsOverlayChanged: "zcode:window-controls-overlay-changed",
  WindowControlsOverlayReady: "zcode:window-controls-overlay-ready",
  GetProcessMetrics: "zcode:get-process-metrics",
  OpenProcessMonitor: "zcode:open-process-monitor",
  OpenExternal: "zcode:open-external",
  CanOpenCommunity: "zcode:can-open-community",
  OpenInFileManager: "zcode:open-in-file-manager",
  OpenCuaPermissionOnboarding: "zcode:open-cua-permission-onboarding",
  PrepareCuaHelperPermissionDrag: "zcode:prepare-cua-helper-permission-drag",
  StartCuaHelperPermissionDrag: "zcode:start-cua-helper-permission-drag",
  OpenCuaAccessibilitySettings: "zcode:open-cua-accessibility-settings",
  OAuthRegisterState: "zcode:oauth-register-state",
  OAuthCallback: "zcode:oauth-callback",
  PaymentCallback: "zcode:payment-callback",
  OAuthCallbackHandled: "zcode:oauth-callback-handled",
  RendererReady: "zcode:renderer-ready",
  SyncTelemetryContext: "zcode:sync-telemetry-context",
  ReportTelemetryEvent: "zcode:report-telemetry-event",
  ReportArmsCustomEvent: "zcode:report-arms-custom-event",
  ReadFinalArmsCustomEventsE2E: "zcode:e2e:read-final-arms-custom-events",
  ClearFinalArmsCustomEventsE2E: "zcode:e2e:clear-final-arms-custom-events",
  ConfigureFinalArmsCustomEventsE2E: "zcode:e2e:configure-final-arms-custom-events",
  ShowTaskNotification: "zcode:show-task-notification",
  TaskNotificationSound: "zcode:task-notification-sound",
  TaskNotificationClick: "zcode:task-notification-click",
  ExportLogs: "zcode:export-logs",
  CaptureWindowScreenshot: "zcode:capture-window-screenshot",
  BrowserViewAttachGuest: "zcode:browser-view-attach-guest",
  BrowserViewCloseTabFromRenderer: "zcode:browser-view-close-tab-from-renderer",
  BrowserViewReportResidency: "zcode:browser-view-report-residency",
  BrowserViewSuspendReady: "zcode:browser-view-suspend-ready",
  BrowserViewEnsureResident: "zcode:browser-view-ensure-resident",
  BrowserViewRestoreTabs: "zcode:browser-view-restore-tabs",
  BrowserViewUpdateViewport: "zcode:browser-view-update-viewport",
  EmbeddedBrowserJavaScriptDialog: "zcode:embedded-browser-javascript-dialog",
  ImportChromeBrowserData: "zcode:import-chrome-browser-data",
  ClearEmbeddedBrowserData: "zcode:clear-embedded-browser-data",
  StartPerformanceTrace: "zcode:perf:start",
  StopPerformanceTrace: "zcode:perf:stop",
  UpdateReady: "zcode:update-ready",
  UpdateCheckResult: "zcode:update-check-result",
  UpdateStateChanged: "zcode:update-state-changed",
  GetUpdateState: "zcode:get-update-state",
  DownloadUpdate: "zcode:download-update",
  CancelUpdateDownload: "zcode:cancel-update-download",
  OpenUpdateStatusWindow: "zcode:open-update-status-window",
  GetAutoUpdatePreferences: "zcode:get-auto-update-preferences",
  SetAutoDownloadAndInstallUpdates: "zcode:set-auto-download-and-install-updates",
  GetDesktopSessionActivity: "zcode:get-desktop-session-activity",
  GetDesktopZoomLevel: "zcode:get-desktop-zoom-level",
  DesktopZoomLevelChanged: "zcode:desktop-zoom-level-changed",
  GetZCodeStdioTapDevState: "zcode:get-zcode-stdio-tap-dev-state",
  SettingsChanged: "zcode:settings-changed",
  ApplicationLocaleChanged: "zcode:application-locale-changed",
  GetSystemLocale: "zcode:get-system-locale",
  PostUpdateReleaseNotes: "zcode:post-update-release-notes",
  AcknowledgePostUpdateReleaseNotes: "zcode:ack-post-update-release-notes",
  SkipUpdateVersion: "zcode:skip-update-version",
  QuitAndInstallUpdate: "zcode:quit-and-install-update",
  GetInstalledEditors: "zcode:get-installed-editors",
  OpenInEditor: "zcode:open-in-editor",
  ExecuteDesktopCommand: "zcode:execute-desktop-command",
  SetApplicationLocale: "zcode:set-application-locale",
  SetTitleBarTheme: "zcode:set-title-bar-theme",
  MigrateLegacyCommonMcp: "zcode:migrate-legacy-common-mcp",
  GetDeviceId: "zcode:get-device-id",
};
var Zt = {
  ServicePort: "zcode:service-port",
  RemoteServicePort: "zcode:remote-service-port",
  TaskNotificationSound: "zcode:task-notification-sound",
};
var df = "bigmodel";
var Y_ = "none";
var X_ = [{ value: "zcode-agent", label: "ZCode Agent" }],
  M$ = [{ value: Y_, label: "\u672A\u6307\u5B9A" }, ...X_];
var F$ = `team-plan:${be.bigmodelCodingPlan}:`;
var Q_ = [
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
  ND = new Set(Q_.map((e) => e.id));
var pf = [
  {
    id: "zai",
    label: "Z.ai",
    oauthProviderId: "zai",
    apiKeyProviderId: be.zai,
    startPlanProviderId: be.zaiStartPlan,
    codingPlanProviderId: be.zaiCodingPlan,
  },
  {
    id: "bigmodel",
    label: "BigModel",
    oauthProviderId: df,
    apiKeyProviderId: be.bigmodel,
    startPlanProviderId: be.bigmodelStartPlan,
    codingPlanProviderId: be.bigmodelCodingPlan,
  },
];
var eU = new Map(pf.map((e) => [e.id, e])),
  tU = new Map(
    pf.flatMap((e) =>
      [e.apiKeyProviderId, e.startPlanProviderId, e.codingPlanProviderId].map((n) => [n, e.id]),
    ),
  );
var EU = t.object({ askUserQuestionAutoResolutionEnabled: t.boolean() }).strict();
var tx = "zcode";
function sanitizeProcessNameSegment(e) {
  if (!e) return null;
  let n = e
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return n ? n.slice(0, 24) : null;
}
s(sanitizeProcessNameSegment, "sanitizeProcessNameSegment");
function joinZCodeProcessName(...e) {
  let n = e.map((r) => sanitizeProcessNameSegment(r)).filter((r) => !!r);
  return [tx, ...n].join("-");
}
s(joinZCodeProcessName, "joinZCodeProcessName");
function formatZCodeRendererProcessName(e) {
  let n = e?.trim();
  if (!n || n === "ZCode") return joinZCodeProcessName("renderer", "main");
  if (n === "Process Monitor") return joinZCodeProcessName("renderer", "process-monitor");
  let r = "ZCode - ";
  return n.startsWith(r) ? joinZCodeProcessName("renderer", "remote", n.slice(r.length)) : joinZCodeProcessName("renderer", n);
}
s(formatZCodeRendererProcessName, "formatZCodeRendererProcessName");
function resolvePlatformBinaryName(e, n) {
  return n === "win32" ? `${e}.exe` : e;
}
s(resolvePlatformBinaryName, "resolvePlatformBinaryName");
var su = {
    bfs: {
      binaryEnvVar: "ZCODE_BFS_BINARY",
      bundledResourceDir: "bfs",
      resolveEntrySegments: s((e) => [resolvePlatformBinaryName("bfs", e)], "resolveEntrySegments"),
    },
    ripgrep: {
      binaryEnvVar: "ZCODE_RG_BINARY",
      bundledResourceDir: "ripgrep",
      resolveEntrySegments: s((e) => [resolvePlatformBinaryName("rg", e)], "resolveEntrySegments"),
    },
    ugrep: {
      binaryEnvVar: "ZCODE_UGREP_BINARY",
      bundledResourceDir: "ugrep",
      resolveEntrySegments: s((e) => [resolvePlatformBinaryName("ugrep", e)], "resolveEntrySegments"),
    },
  },
  KU = {
    bfs: { ...su.bfs, versions: { linux: "v4.1.1-2" } },
    ripgrep: { ...su.ripgrep, versions: { darwin: "v13.0.0-10", linux: "v14.1.1-1" } },
    ugrep: { ...su.ugrep, versions: { linux: "v7.5.0-2" } },
  };
var nx = [
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
var mN = new Map(nx.map((e) => [e.toLowerCase(), e]));
var rx = "studio.zcode-ai.com";
function readProcessEnv() {
  return globalThis.process?.env ?? {};
}
s(readProcessEnv, "readProcessEnv");
function resolveIntranetMachineHost(e = readProcessEnv()) {
  return e.INTRANET_MACHINE_HOST?.trim() || rx;
}
s(resolveIntranetMachineHost, "resolveIntranetMachineHost");
var gf = resolveIntranetMachineHost(),
  sx = 12345,
  cx = `http://${gf}:${sx}/zcode`,
  DN = `${cx}/deps`,
  lx = 3850,
  dx = "/api/intranet/probe",
  ux = `http://${gf}:${lx}${dx}`;
var wo = "v2",
  px = "v1",
  ff = "v1";
function repoSnapshotSchema(e, n) {
  return `repo_snapshot_${e}/${n}`;
}
s(repoSnapshotSchema, "repoSnapshotSchema");
var YN = repoSnapshotSchema("manifest", wo),
  XN = repoSnapshotSchema("prompt", wo),
  QN = repoSnapshotSchema("delta", wo),
  eZ = repoSnapshotSchema("encrypted_artifact", wo),
  tZ = repoSnapshotSchema("encryption_aad", wo),
  oZ = repoSnapshotSchema("manifest_hash", px),
  nZ = repoSnapshotSchema("upload_key", ff),
  rZ = repoSnapshotSchema("upload_target", ff);
var hf = t.object({
    id: t.string().uuid(),
    runtimeScope: t.enum(["main", "subagent"]),
    token: t.string().min(32),
    sessionId: t.string().trim().min(1),
    turnId: t.string().trim().min(1).optional(),
    trace: t
      .object({
        traceId: t.string().trim().min(1),
        spanId: t.string().trim().min(1).optional(),
        parentSpanId: t.string().trim().min(1).optional(),
      })
      .strict()
      .optional(),
  }),
  IZ = t.discriminatedUnion("op", [
    hf.extend({ op: t.literal("list") }).strict(),
    hf
      .extend({
        op: t.literal("execute"),
        browserId: t.string().trim().min(1),
        browserGeneration: t.number().int().nonnegative(),
        command: Et,
      })
      .strict(),
  ]),
  CZ = t.discriminatedUnion("ok", [
    t
      .object({
        id: t.string().uuid(),
        ok: t.literal(!0),
        browsers: t.array(Cd).optional(),
        result: Ot.optional(),
      })
      .strict(),
    t.object({ id: t.string().uuid(), ok: t.literal(!1), error: t.string().min(1) }).strict(),
  ]);
function createOAuthCallbackHandler(e, n) {
  return async (r, a) => {
    try {
      await e(a);
    } catch {
    } finally {
      n();
    }
  };
}
s(createOAuthCallbackHandler, "createOAuthCallbackHandler");
function parseDeviceIdFromArgs() {
  for (let e of process.argv) if (e.startsWith("--device-id=")) return e.slice(12);
  return "";
}
s(parseDeviceIdFromArgs, "parseDeviceIdFromArgs");
y.contextBridge.exposeInMainWorld("__ZCODE_DEVICE_ID__", parseDeviceIdFromArgs());
var cu = new Set(),
  lu = new Set(),
  du = new Set(),
  Rr = new Set(),
  Pr = null,
  uu = null,
  pu = null,
  mu = [],
  gx = 96,
  fx = 136,
  hx = 48,
  vf = 1.1,
  yx = -3,
  bx = 5,
  Tr = null,
  Ye = 0;
function clampDesktopZoomLevel(e) {
  return Math.min(bx, Math.max(yx, e));
}
s(clampDesktopZoomLevel, "clampDesktopZoomLevel");
function resolveDesktopZoomLevelFromFactor(e) {
  return !Number.isFinite(e) || e <= 0 ? 0 : clampDesktopZoomLevel(Math.round(Math.log(e) / Math.log(vf)));
}
s(resolveDesktopZoomLevelFromFactor, "resolveDesktopZoomLevelFromFactor");
function resolveDesktopZoomFactorForLevel(e) {
  return Math.pow(vf, clampDesktopZoomLevel(e));
}
s(resolveDesktopZoomFactorForLevel, "resolveDesktopZoomFactorForLevel");
function readCurrentWindowControlsOverlayReadyPayload() {
  let e = resolveDesktopZoomLevelFromFactor(y.webFrame.getZoomFactor()),
    n = resolveDesktopZoomFactorForLevel(e),
    r =
      process.platform === "darwin"
        ? { leftPaddingPx: Math.round(gx / n) }
        : process.platform === "win32"
          ? { rightPaddingPx: Math.round(fx / n), titleBarHeightPx: Math.round(hx * n) }
          : {};
  return { zoomLevel: e, metrics: r };
}
s(readCurrentWindowControlsOverlayReadyPayload, "readCurrentWindowControlsOverlayReadyPayload");
function readCurrentWindowControlsOverlayMetrics() {
  return readCurrentWindowControlsOverlayReadyPayload().metrics;
}
s(readCurrentWindowControlsOverlayMetrics, "readCurrentWindowControlsOverlayMetrics");
var gu = readCurrentWindowControlsOverlayReadyPayload();
Ye = gu.zoomLevel;
Tr = gu.metrics;
y.ipcRenderer.send(b.WindowControlsOverlayReady, gu);
y.ipcRenderer.on(b.WindowControlsOverlayChanged, (e, n) => {
  Tr = n;
});
y.ipcRenderer.on(b.DesktopZoomLevelChanged, (e, n) => {
  Number.isFinite(n.zoomLevel) && (Ye = clampDesktopZoomLevel(n.zoomLevel));
});
y.ipcRenderer.on(b.OpenWorkspacePath, (e, n) => {
  if (Rr.size === 0) {
    mu.push(n);
    return;
  }
  for (let r of Rr) r(n);
});
function updateRendererProcessTitle() {
  process.title = formatZCodeRendererProcessName(document.title);
}
s(updateRendererProcessTitle, "updateRendererProcessTitle");
function notifyUpdateReadyCallbacks(e) {
  Pr = e;
  for (let n of cu) n(e);
}
s(notifyUpdateReadyCallbacks, "notifyUpdateReadyCallbacks");
function notifyPostUpdateReleaseNotesCallbacks(e) {
  pu = e;
  for (let n of du) n(e);
}
s(notifyPostUpdateReleaseNotesCallbacks, "notifyPostUpdateReleaseNotesCallbacks");
function notifyUpdateStateCallbacks(e) {
  ((uu = e), (Pr = e.kind === "update-downloaded" ? e.version : null));
  for (let n of lu) n(e);
}
s(notifyUpdateStateCallbacks, "notifyUpdateStateCallbacks");
updateRendererProcessTitle();
window.addEventListener("DOMContentLoaded", updateRendererProcessTitle, { once: !0 });
y.contextBridge.exposeInMainWorld("zcode", {
  connectRemote: s(
    (e, n, r) => y.ipcRenderer.invoke(b.ConnectRemote, { target: e, requestId: n, ...(r || {}) }),
    "connectRemote",
  ),
  cancelPendingRemoteConnection: s(
    (e) => y.ipcRenderer.invoke(b.CancelPendingRemoteConnection, { requestId: e }),
    "cancelPendingRemoteConnection",
  ),
  bindRemoteWorkspaceSessionContext: s(
    (e) => y.ipcRenderer.invoke(b.BindRemoteWorkspaceSessionContext, e),
    "bindRemoteWorkspaceSessionContext",
  ),
  startWebRemoteControl: s(async () => ({ status: "idle" }), "startWebRemoteControl"),
  refreshWebRemoteControlPairing: s(async () => ({ status: "idle" }), "refreshWebRemoteControlPairing"),
  stopWebRemoteControl: s(async () => {}, "stopWebRemoteControl"),
  getWebRemoteControlStatus: s(async () => ({ status: "idle" }), "getWebRemoteControlStatus"),
  onWebRemoteControlStatusChanged: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.WebRemoteControlStatusChanged, n),
      () => y.ipcRenderer.removeListener(b.WebRemoteControlStatusChanged, n)
    );
  }, "onWebRemoteControlStatusChanged"),
  disposeRemoteSession: s(
    (e) => y.ipcRenderer.invoke(b.DisposeRemoteSession, e),
    "disposeRemoteSession",
  ),
  isDockerAvailable: s(() => y.ipcRenderer.invoke(b.IsDockerAvailable), "isDockerAvailable"),
  listWSLDistros: s(() => y.ipcRenderer.invoke(b.ListWSLDistros), "listWSLDistros"),
  listDockerContainers: s(
    () => y.ipcRenderer.invoke(b.ListDockerContainers),
    "listDockerContainers",
  ),
  listSSHConfigAliases: s(
    () => y.ipcRenderer.invoke(b.ListSSHConfigAliases),
    "listSSHConfigAliases",
  ),
  loadMcpFromUserDirectory: s(
    (e) => y.ipcRenderer.invoke(b.LoadMcpFromUserDirectory, e ?? {}),
    "loadMcpFromUserDirectory",
  ),
  saveMcpToUserDirectory: s(
    (e) => y.ipcRenderer.invoke(b.SaveMcpToUserDirectory, e),
    "saveMcpToUserDirectory",
  ),
  migrateLegacyCommonMcp: s(
    (e) => y.ipcRenderer.invoke(b.MigrateLegacyCommonMcp, e ?? {}),
    "migrateLegacyCommonMcp",
  ),
  log: s((e, n) => y.ipcRenderer.send(b.Log, { level: e, args: n }), "log"),
  selectDirectory: s(() => y.ipcRenderer.invoke(b.SelectDirectory), "selectDirectory"),
  selectFile: s(() => y.ipcRenderer.invoke(b.SelectFile), "selectFile"),
  selectFiles: s(() => y.ipcRenderer.invoke(b.SelectFiles), "selectFiles"),
  saveFile: s((e) => y.ipcRenderer.invoke(b.SaveFile, e), "saveFile"),
  printPageToPdf: s(() => y.ipcRenderer.invoke(b.PrintToPdf), "printPageToPdf"),
  getPathForFile: s((e) => {
    let n = y.webUtils.getPathForFile(e).trim();
    return n.length > 0 ? n : null;
  }, "getPathForFile"),
  createTempTextAttachment: s(
    (e) => y.ipcRenderer.invoke(b.CreateTempTextAttachment, e),
    "createTempTextAttachment",
  ),
  onRemoteConnectionLog: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.RemoteConnectionLog, n),
      () => y.ipcRenderer.removeListener(b.RemoteConnectionLog, n)
    );
  }, "onRemoteConnectionLog"),
  onRemoteSessionClosed: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.RemoteSessionClosed, n),
      () => y.ipcRenderer.removeListener(b.RemoteSessionClosed, n)
    );
  }, "onRemoteSessionClosed"),
  onBotRemoteWorkspaceReconnected: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.BotRemoteWorkspaceReconnected, n),
      () => y.ipcRenderer.removeListener(b.BotRemoteWorkspaceReconnected, n)
    );
  }, "onBotRemoteWorkspaceReconnected"),
  activateOrSetWorkspace: s(
    (e) => y.ipcRenderer.invoke(b.ActivateOrSetWorkspace, e),
    "activateOrSetWorkspace",
  ),
  // WS-ENUM：项目分段枚举全部 daemon 已知 workspace（main 侧 ACP workspace_list/目录扫描）
  listNofyWorkspaces: s(
    (e) => y.ipcRenderer.invoke(b.NofyListWorkspaces, e ?? {}),
    "listNofyWorkspaces",
  ),
  // WS-ENUM：单 workspace 会话（项目行展开懒加载回退路）
  listNofyWorkspaceSessions: s(
    (e) => y.ipcRenderer.invoke(b.NofyWorkspaceSessions, e),
    "listNofyWorkspaceSessions",
  ),
  syncWindowTabs: s((e) => y.ipcRenderer.send(b.SyncWindowTabs, e), "syncWindowTabs"),
  syncWebRemoteControlWorkspaces: s(
    (e) => y.ipcRenderer.send(b.SyncWebRemoteControlWorkspaces, e),
    "syncWebRemoteControlWorkspaces",
  ),
  syncWebRemoteControlTasks: s(
    (e) => y.ipcRenderer.send(b.SyncWebRemoteControlTasks, e),
    "syncWebRemoteControlTasks",
  ),
  onWebRemoteControlReconnectWorkspace: s((e) => {
    let n = s(async (r, a) => {
      let o = a;
      try {
        let i = await e(o);
        r.sender.send(b.WebRemoteControlReconnectWorkspace, i);
      } catch (i) {
        r.sender.send(b.WebRemoteControlReconnectWorkspace, {
          requestId: o.requestId,
          workspaceKey: o.workspaceKey,
          success: !1,
          error: i instanceof Error ? i.message : String(i),
        });
      }
    }, "handler");
    return (
      y.ipcRenderer.on(b.WebRemoteControlReconnectWorkspace, n),
      () => y.ipcRenderer.removeListener(b.WebRemoteControlReconnectWorkspace, n)
    );
  }, "onWebRemoteControlReconnectWorkspace"),
  syncWindowUnreadCount: s(
    (e) => y.ipcRenderer.send(b.SyncWindowUnreadCount, e),
    "syncWindowUnreadCount",
  ),
  syncAppSettings: s((e) => y.ipcRenderer.send(b.SyncAppSettings, e), "syncAppSettings"),
  onFocusTab: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (y.ipcRenderer.on(b.FocusTab, n), () => y.ipcRenderer.removeListener(b.FocusTab, n));
  }, "onFocusTab"),
  onNewTab: s((e) => {
    let n = s(() => e(), "handler");
    return (y.ipcRenderer.on(b.NewTab, n), () => y.ipcRenderer.removeListener(b.NewTab, n));
  }, "onNewTab"),
  onCloseActiveContextRequest: s((e) => {
    let n = s(() => e(), "handler");
    return (
      y.ipcRenderer.on(b.CloseActiveContextRequest, n),
      () => y.ipcRenderer.removeListener(b.CloseActiveContextRequest, n)
    );
  }, "onCloseActiveContextRequest"),
  onOpenBrowserUrl: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.OpenBrowserUrl, n),
      () => y.ipcRenderer.removeListener(b.OpenBrowserUrl, n)
    );
  }, "onOpenBrowserUrl"),
  onBrowserViewReady: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.BrowserViewReady, n),
      () => y.ipcRenderer.removeListener(b.BrowserViewReady, n)
    );
  }, "onBrowserViewReady"),
  onBrowserViewOperation: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.BrowserViewOperation, n),
      () => y.ipcRenderer.removeListener(b.BrowserViewOperation, n)
    );
  }, "onBrowserViewOperation"),
  onBrowserViewViewportChanged: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.BrowserViewViewportChanged, n),
      () => y.ipcRenderer.removeListener(b.BrowserViewViewportChanged, n)
    );
  }, "onBrowserViewViewportChanged"),
  onBrowserViewScreenshotSurfacePrepare: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.BrowserViewScreenshotSurfacePrepare, n),
      () => y.ipcRenderer.removeListener(b.BrowserViewScreenshotSurfacePrepare, n)
    );
  }, "onBrowserViewScreenshotSurfacePrepare"),
  onBrowserViewScreenshotSurfaceRelease: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.BrowserViewScreenshotSurfaceRelease, n),
      () => y.ipcRenderer.removeListener(b.BrowserViewScreenshotSurfaceRelease, n)
    );
  }, "onBrowserViewScreenshotSurfaceRelease"),
  browserViewScreenshotSurfaceReady: s((e) => {
    y.ipcRenderer.send(b.BrowserViewScreenshotSurfaceReady, e);
  }, "browserViewScreenshotSurfaceReady"),
  onBrowserViewVisibility: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.BrowserViewVisibility, n),
      () => y.ipcRenderer.removeListener(b.BrowserViewVisibility, n)
    );
  }, "onBrowserViewVisibility"),
  onBrowserViewCloseTab: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.BrowserViewCloseTab, n),
      () => y.ipcRenderer.removeListener(b.BrowserViewCloseTab, n)
    );
  }, "onBrowserViewCloseTab"),
  onBrowserViewSuspend: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.BrowserViewSuspend, n),
      () => y.ipcRenderer.removeListener(b.BrowserViewSuspend, n)
    );
  }, "onBrowserViewSuspend"),
  onBrowserViewRestore: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.BrowserViewRestore, n),
      () => y.ipcRenderer.removeListener(b.BrowserViewRestore, n)
    );
  }, "onBrowserViewRestore"),
  onNewTask: s((e) => {
    let n = s(() => e(), "handler");
    return (y.ipcRenderer.on(b.NewTask, n), () => y.ipcRenderer.removeListener(b.NewTask, n));
  }, "onNewTask"),
  onOpenWorkspace: s((e) => {
    let n = s(() => e(), "handler");
    return (
      y.ipcRenderer.on(b.OpenWorkspace, n),
      () => y.ipcRenderer.removeListener(b.OpenWorkspace, n)
    );
  }, "onOpenWorkspace"),
  onOpenWorkspacePath: s((e) => {
    for (Rr.add(e); mu.length > 0;) {
      let n = mu.shift();
      n && e(n);
    }
    return () => Rr.delete(e);
  }, "onOpenWorkspacePath"),
  onOpenFeedbackDialog: s((e) => {
    let n = s(() => e(), "handler");
    return (
      y.ipcRenderer.on(b.OpenFeedbackDialog, n),
      () => y.ipcRenderer.removeListener(b.OpenFeedbackDialog, n)
    );
  }, "onOpenFeedbackDialog"),
  onOpenTicketsPanel: s((e) => {
    let n = s(() => e(), "handler");
    return (
      y.ipcRenderer.on(b.OpenTicketsPanel, n),
      () => y.ipcRenderer.removeListener(b.OpenTicketsPanel, n)
    );
  }, "onOpenTicketsPanel"),
  onWindowFullscreenChanged: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.WindowFullscreenChanged, n),
      () => y.ipcRenderer.removeListener(b.WindowFullscreenChanged, n)
    );
  }, "onWindowFullscreenChanged"),
  getDesktopWindowChromeState: s(
    () => y.ipcRenderer.invoke(b.GetDesktopWindowChromeState),
    "getDesktopWindowChromeState",
  ),
  onDesktopWindowChromeStateChanged: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.DesktopWindowChromeStateChanged, n),
      () => y.ipcRenderer.removeListener(b.DesktopWindowChromeStateChanged, n)
    );
  }, "onDesktopWindowChromeStateChanged"),
  getWindowControlsOverlayMetrics: s(() => Tr ?? readCurrentWindowControlsOverlayMetrics(), "getWindowControlsOverlayMetrics"),
  onWindowControlsOverlayChanged: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      e(Tr ?? readCurrentWindowControlsOverlayMetrics()),
      y.ipcRenderer.on(b.WindowControlsOverlayChanged, n),
      () => y.ipcRenderer.removeListener(b.WindowControlsOverlayChanged, n)
    );
  }, "onWindowControlsOverlayChanged"),
  getDesktopZoomLevel: s(async () => {
    let e = await y.ipcRenderer.invoke(b.GetDesktopZoomLevel);
    return (Number.isFinite(e?.zoomLevel) && (Ye = clampDesktopZoomLevel(e.zoomLevel)), { zoomLevel: Ye });
  }, "getDesktopZoomLevel"),
  onDesktopZoomLevelChanged: s((e) => {
    let n = s((r, a) => {
      Number.isFinite(a.zoomLevel) && ((Ye = clampDesktopZoomLevel(a.zoomLevel)), e({ zoomLevel: Ye }));
    }, "handler");
    return (
      e({ zoomLevel: Ye }),
      y.ipcRenderer.on(b.DesktopZoomLevelChanged, n),
      () => y.ipcRenderer.removeListener(b.DesktopZoomLevelChanged, n)
    );
  }, "onDesktopZoomLevelChanged"),
  onTaskNotificationClick: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.TaskNotificationClick, n),
      () => y.ipcRenderer.removeListener(b.TaskNotificationClick, n)
    );
  }, "onTaskNotificationClick"),
  openExternal: s((e) => y.ipcRenderer.send(b.OpenExternal, e), "openExternal"),
  canOpenCommunity: s(async () => !1, "canOpenCommunity"),
  openInFileManager: s((e) => y.ipcRenderer.invoke(b.OpenInFileManager, e), "openInFileManager"),
  openCuaPermissionOnboarding: s(
    (e) => y.ipcRenderer.invoke(b.OpenCuaPermissionOnboarding, e),
    "openCuaPermissionOnboarding",
  ),
  prepareCuaHelperPermissionDrag: s(
    () => y.ipcRenderer.invoke(b.PrepareCuaHelperPermissionDrag),
    "prepareCuaHelperPermissionDrag",
  ),
  startCuaHelperPermissionDrag: s(
    () => y.ipcRenderer.send(b.StartCuaHelperPermissionDrag),
    "startCuaHelperPermissionDrag",
  ),
  openCuaAccessibilitySettings: s(
    () => y.ipcRenderer.invoke(b.OpenCuaAccessibilitySettings),
    "openCuaAccessibilitySettings",
  ),
  registerOAuthState: s(() => {}, "registerOAuthState"),
  onOAuthCallback: s((e) => {
    let n = createOAuthCallbackHandler(e, () => {
      y.ipcRenderer.send(b.OAuthCallbackHandled);
    });
    return (
      y.ipcRenderer.on(b.OAuthCallback, n),
      () => y.ipcRenderer.removeListener(b.OAuthCallback, n)
    );
  }, "onOAuthCallback"),
  onPaymentCallback: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.PaymentCallback, n),
      () => y.ipcRenderer.removeListener(b.PaymentCallback, n)
    );
  }, "onPaymentCallback"),
  notifyRendererReady: s(() => y.ipcRenderer.send(b.RendererReady), "notifyRendererReady"),
  syncTelemetryContext: s(() => {}, "syncTelemetryContext"),
  reportTelemetryEvent: s(async () => {}, "reportTelemetryEvent"),
  reportArmsCustomEvent: s(async () => {}, "reportArmsCustomEvent"),
  showTaskNotification: s(
    (e) => y.ipcRenderer.send(b.ShowTaskNotification, e),
    "showTaskNotification",
  ),
  exportLogs: s(() => y.ipcRenderer.invoke(b.ExportLogs), "exportLogs"),
  captureWindowScreenshot: s(
    () => y.ipcRenderer.invoke(b.CaptureWindowScreenshot),
    "captureWindowScreenshot",
  ),
  browserViewAttachGuest: s(
    (e) => y.ipcRenderer.invoke(b.BrowserViewAttachGuest, e),
    "browserViewAttachGuest",
  ),
  browserViewCloseTab: s(
    (e) => y.ipcRenderer.invoke(b.BrowserViewCloseTabFromRenderer, e),
    "browserViewCloseTab",
  ),
  browserViewReportResidency: s(
    (e) => y.ipcRenderer.invoke(b.BrowserViewReportResidency, e),
    "browserViewReportResidency",
  ),
  browserViewSuspendReady: s(
    (e) => y.ipcRenderer.invoke(b.BrowserViewSuspendReady, e),
    "browserViewSuspendReady",
  ),
  browserViewEnsureResident: s(
    (e) => y.ipcRenderer.invoke(b.BrowserViewEnsureResident, e),
    "browserViewEnsureResident",
  ),
  browserViewRestoreTabs: s(
    (e) => y.ipcRenderer.invoke(b.BrowserViewRestoreTabs, e),
    "browserViewRestoreTabs",
  ),
  browserViewUpdateViewport: s(
    (e) => y.ipcRenderer.invoke(b.BrowserViewUpdateViewport, e),
    "browserViewUpdateViewport",
  ),
  importChromeBrowserData: s(
    (e) => y.ipcRenderer.invoke(b.ImportChromeBrowserData, e),
    "importChromeBrowserData",
  ),
  clearEmbeddedBrowserData: s(
    (e) => y.ipcRenderer.invoke(b.ClearEmbeddedBrowserData, e),
    "clearEmbeddedBrowserData",
  ),
  startPerformanceTrace: s(
    () => y.ipcRenderer.invoke(b.StartPerformanceTrace),
    "startPerformanceTrace",
  ),
  stopPerformanceTrace: s(
    () => y.ipcRenderer.invoke(b.StopPerformanceTrace),
    "stopPerformanceTrace",
  ),
  getZCodeStdioTapDevState: s(
    () => y.ipcRenderer.invoke(b.GetZCodeStdioTapDevState),
    "getZCodeStdioTapDevState",
  ),
  onSettingsChanged: s((e) => {
    let n = s(() => e(), "handler");
    return (
      y.ipcRenderer.on(b.SettingsChanged, n),
      () => y.ipcRenderer.removeListener(b.SettingsChanged, n)
    );
  }, "onSettingsChanged"),
  onApplicationLocaleChanged: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.ApplicationLocaleChanged, n),
      () => y.ipcRenderer.removeListener(b.ApplicationLocaleChanged, n)
    );
  }, "onApplicationLocaleChanged"),
  onUpdateCheckResult: s((e) => {
    let n = s((r, a) => e(a), "handler");
    return (
      y.ipcRenderer.on(b.UpdateCheckResult, n),
      () => y.ipcRenderer.removeListener(b.UpdateCheckResult, n)
    );
  }, "onUpdateCheckResult"),
  getUpdateState: s(async () => ({ kind: "idle" }), "getUpdateState"),
  downloadUpdate: s(async () => {}, "downloadUpdate"),
  cancelUpdateDownload: s(async () => {}, "cancelUpdateDownload"),
  openUpdateStatusWindow: s(async () => {}, "openUpdateStatusWindow"),
  getAutoUpdatePreferences: s(
    async () => ({ autoDownloadAndInstallUpdates: !1 }),
    "getAutoUpdatePreferences",
  ),
  setAutoDownloadAndInstallUpdates: s(async () => {}, "setAutoDownloadAndInstallUpdates"),
  getDesktopSessionActivity: s(
    () => y.ipcRenderer.invoke(b.GetDesktopSessionActivity),
    "getDesktopSessionActivity",
  ),
  onUpdateStateChanged: s(
    (e) => (
      lu.add(e),
      uu && e(uu),
      () => {
        lu.delete(e);
      }
    ),
    "onUpdateStateChanged",
  ),
  onUpdateReady: s(
    (e) => (
      cu.add(e),
      Pr && e(Pr),
      () => {
        cu.delete(e);
      }
    ),
    "onUpdateReady",
  ),
  onPostUpdateReleaseNotes: s(
    (e) => (
      du.add(e),
      pu && e(pu),
      () => {
        du.delete(e);
      }
    ),
    "onPostUpdateReleaseNotes",
  ),
  acknowledgePostUpdateReleaseNotes: s(async () => {}, "acknowledgePostUpdateReleaseNotes"),
  skipUpdateVersion: s(async () => {}, "skipUpdateVersion"),
  quitAndInstallUpdate: s(async () => {}, "quitAndInstallUpdate"),
  getInstalledEditors: s(() => y.ipcRenderer.invoke(b.GetInstalledEditors), "getInstalledEditors"),
  openInEditor: s(
    (e, n, r) => y.ipcRenderer.invoke(b.OpenInEditor, { editorId: e, path: n, options: r }),
    "openInEditor",
  ),
  executeDesktopCommand: s(
    (e) => y.ipcRenderer.invoke(b.ExecuteDesktopCommand, e),
    "executeDesktopCommand",
  ),
  setApplicationLocale: s(
    (e) => y.ipcRenderer.invoke(b.SetApplicationLocale, e),
    "setApplicationLocale",
  ),
  getSystemLocale: s(() => y.ipcRenderer.invoke(b.GetSystemLocale), "getSystemLocale"),
  setTitleBarTheme: s((e) => y.ipcRenderer.invoke(b.SetTitleBarTheme, e), "setTitleBarTheme"),
  getDeviceId: s(() => y.ipcRenderer.invoke(b.GetDeviceId), "getDeviceId"),
});
y.ipcRenderer.on(Zt.ServicePort, (e) => {
  let [n] = e.ports;
  n && window.postMessage(Zt.ServicePort, "*", [n]);
});
y.ipcRenderer.on(Zt.RemoteServicePort, (e, n) => {
  let [r] = e.ports;
  r &&
    window.postMessage(
      { type: Zt.RemoteServicePort, sessionId: n.sessionId, target: n.target },
      "*",
      [r],
    );
});
y.ipcRenderer.on(b.TaskNotificationSound, () => {
  window.postMessage(Zt.TaskNotificationSound, "*");
});
y.ipcRenderer.on(b.UpdateReady, (e, n) => {
  notifyUpdateReadyCallbacks(n);
});
y.ipcRenderer.on(b.UpdateStateChanged, (e, n) => {
  notifyUpdateStateCallbacks(n);
});
y.ipcRenderer.on(b.PostUpdateReleaseNotes, (e, n) => {
  notifyPostUpdateReleaseNotesCallbacks(n);
});
