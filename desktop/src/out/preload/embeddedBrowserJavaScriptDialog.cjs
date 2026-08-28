var eu = Object.defineProperty;
var c = (e, o) => eu(e, "name", { value: o, configurable: !0 });
var ye = (e, o) => {
  for (var i in o) eu(e, i, { get: o[i], enumerable: !0 });
};
var Ut = require("electron");
function normalizeZCodeEnv(e) {
  return e?.trim().toLowerCase() === "production" ? "production" : "test";
}
c(normalizeZCodeEnv, "normalizeZCodeEnv");
var cf = normalizeZCodeEnv("production");
var lf = typeof process < "u" ? process.env.ZCODE_DEBUG : void 0;
var t = {};
ye(t, {
  $brand: () => Tn,
  $input: () => zs,
  $output: () => As,
  NEVER: () => xr,
  TimePrecision: () => Us,
  ZodAny: () => Rl,
  ZodArray: () => El,
  ZodBase64: () => Qo,
  ZodBase64URL: () => er,
  ZodBigInt: () => Rt,
  ZodBigIntFormat: () => or,
  ZodBoolean: () => Ct,
  ZodCIDRv4: () => Yo,
  ZodCIDRv6: () => Xo,
  ZodCUID: () => Fo,
  ZodCUID2: () => qo,
  ZodCatch: () => Xl,
  ZodCodec: () => ur,
  ZodCustom: () => vn,
  ZodCustomStringFormat: () => kt,
  ZodDate: () => gn,
  ZodDefault: () => Vl,
  ZodDiscriminatedUnion: () => Al,
  ZodE164: () => tr,
  ZodEmail: () => Bo,
  ZodEmoji: () => Lo,
  ZodEnum: () => _t,
  ZodError: () => Uy,
  ZodExactOptional: () => Wl,
  ZodFile: () => Bl,
  ZodFirstPartyTypeKind: () => dd,
  ZodFunction: () => sd,
  ZodGUID: () => ln,
  ZodIPv4: () => Ho,
  ZodIPv6: () => Jo,
  ZodISODate: () => $o,
  ZodISODateTime: () => Mo,
  ZodISODuration: () => Uo,
  ZodISOTime: () => Do,
  ZodIntersection: () => zl,
  ZodIssueCode: () => Zy,
  ZodJWT: () => nr,
  ZodKSUID: () => Ko,
  ZodLazy: () => rd,
  ZodLiteral: () => jl,
  ZodMAC: () => vl,
  ZodMap: () => Nl,
  ZodNaN: () => ed,
  ZodNanoID: () => Wo,
  ZodNever: () => Tl,
  ZodNonOptional: () => lr,
  ZodNull: () => Il,
  ZodNullable: () => ql,
  ZodNumber: () => It,
  ZodNumberFormat: () => Fe,
  ZodObject: () => hn,
  ZodOptional: () => cr,
  ZodPipe: () => dr,
  ZodPrefault: () => Kl,
  ZodPromise: () => ad,
  ZodReadonly: () => td,
  ZodRealError: () => Q,
  ZodRecord: () => bn,
  ZodSet: () => Zl,
  ZodString: () => xt,
  ZodStringFormat: () => D,
  ZodSuccess: () => Yl,
  ZodSymbol: () => xl,
  ZodTemplateLiteral: () => od,
  ZodTransform: () => Ll,
  ZodTuple: () => $l,
  ZodType: () => w,
  ZodULID: () => Vo,
  ZodURL: () => mn,
  ZodUUID: () => fe,
  ZodUndefined: () => kl,
  ZodUnion: () => yn,
  ZodUnknown: () => Pl,
  ZodVoid: () => wl,
  ZodXID: () => Go,
  ZodXor: () => Ol,
  _ZodString: () => jo,
  _default: () => Gl,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base64,
  base64url: () => base64url,
  bigint: () => bigint,
  boolean: () => boolean,
  catch: () => Ql,
  check: () => check,
  cidrv4: () => cidrv4,
  cidrv6: () => cidrv6,
  clone: () => clone,
  codec: () => codec,
  coerce: () => ud,
  config: () => config,
  core: () => Se,
  cuid: () => cuid,
  cuid2: () => cuid2,
  custom: () => custom,
  date: () => xp,
  decode: () => pl,
  decodeAsync: () => gl,
  describe: () => qp,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e164,
  email: () => email,
  emoji: () => qu,
  encode: () => ul,
  encodeAsync: () => ml,
  endsWith: () => _endsWith,
  enum: () => ar,
  exactOptional: () => exactOptional,
  file: () => file,
  flattenError: () => flattenError,
  float32: () => float32,
  float64: () => float64,
  formatError: () => formatError,
  fromJSONSchema: () => fromJSONSchema,
  function: () => _function,
  getErrorMap: () => getErrorMap,
  globalRegistry: () => F,
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
  iso: () => St,
  json: () => json,
  jwt: () => jwt,
  keyof: () => keyof,
  ksuid: () => ksuid,
  lazy: () => lazy,
  length: () => _length,
  literal: () => literal,
  locales: () => rn,
  looseObject: () => looseObject,
  looseRecord: () => looseRecord,
  lowercase: () => _lowercase,
  lt: () => _lt,
  lte: () => _lte,
  mac: () => mac,
  map: () => map,
  maxLength: () => _maxLength,
  maxSize: () => _maxSize,
  meta: () => Vp,
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
  null: () => Cl,
  nullable: () => nullable,
  nullish: () => Dp,
  number: () => number,
  object: () => object,
  optional: () => optional,
  overwrite: () => _overwrite,
  parse: () => sl,
  parseAsync: () => cl,
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
  regexes: () => se,
  registry: () => registry,
  safeDecode: () => hl,
  safeDecodeAsync: () => bl,
  safeEncode: () => fl,
  safeEncodeAsync: () => yl,
  safeParse: () => ll,
  safeParseAsync: () => dl,
  set: () => set,
  setErrorMap: () => setErrorMap,
  size: () => _size,
  slugify: () => _slugify,
  startsWith: () => _startsWith,
  strictObject: () => strictObject,
  string: () => string,
  stringFormat: () => stringFormat,
  stringbool: () => Kp,
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
  undefined: () => vp,
  union: () => union,
  unknown: () => unknown,
  uppercase: () => _uppercase,
  url: () => url,
  util: () => k,
  uuid: () => uuid,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => _p,
  xid: () => xid,
  xor: () => xor,
});
var Se = {};
ye(Se, {
  $ZodAny: () => ca,
  $ZodArray: () => ma,
  $ZodAsyncError: () => le,
  $ZodBase64: () => Xi,
  $ZodBase64URL: () => Qi,
  $ZodBigInt: () => Yn,
  $ZodBigIntFormat: () => ra,
  $ZodBoolean: () => Yt,
  $ZodCIDRv4: () => Hi,
  $ZodCIDRv6: () => Ji,
  $ZodCUID: () => Ui,
  $ZodCUID2: () => Ni,
  $ZodCatch: () => Oa,
  $ZodCheck: () => U,
  $ZodCheckBigIntFormat: () => mi,
  $ZodCheckEndsWith: () => Ci,
  $ZodCheckGreaterThan: () => Fn,
  $ZodCheckIncludes: () => ki,
  $ZodCheckLengthEquals: () => vi,
  $ZodCheckLessThan: () => Wn,
  $ZodCheckLowerCase: () => _i,
  $ZodCheckMaxLength: () => yi,
  $ZodCheckMaxSize: () => gi,
  $ZodCheckMimeType: () => Pi,
  $ZodCheckMinLength: () => bi,
  $ZodCheckMinSize: () => fi,
  $ZodCheckMultipleOf: () => ui,
  $ZodCheckNumberFormat: () => pi,
  $ZodCheckOverwrite: () => Ti,
  $ZodCheckProperty: () => Ri,
  $ZodCheckRegex: () => Si,
  $ZodCheckSizeEquals: () => hi,
  $ZodCheckStartsWith: () => Ii,
  $ZodCheckStringFormat: () => rt,
  $ZodCheckUpperCase: () => xi,
  $ZodCodec: () => Qt,
  $ZodCustom: () => Za,
  $ZodCustomStringFormat: () => na,
  $ZodDate: () => pa,
  $ZodDefault: () => Pa,
  $ZodDiscriminatedUnion: () => ha,
  $ZodE164: () => ea,
  $ZodEmail: () => zi,
  $ZodEmoji: () => $i,
  $ZodEncodeError: () => Ie,
  $ZodEnum: () => _a,
  $ZodError: () => qt,
  $ZodExactOptional: () => Ca,
  $ZodFile: () => ka,
  $ZodFunction: () => Da,
  $ZodGUID: () => Oi,
  $ZodIPv4: () => Vi,
  $ZodIPv6: () => Gi,
  $ZodISODate: () => Wi,
  $ZodISODateTime: () => Li,
  $ZodISODuration: () => qi,
  $ZodISOTime: () => Fi,
  $ZodIntersection: () => ya,
  $ZodJWT: () => ta,
  $ZodKSUID: () => Bi,
  $ZodLazy: () => Na,
  $ZodLiteral: () => xa,
  $ZodMAC: () => Ki,
  $ZodMap: () => va,
  $ZodNaN: () => Aa,
  $ZodNanoID: () => Di,
  $ZodNever: () => da,
  $ZodNonOptional: () => wa,
  $ZodNull: () => sa,
  $ZodNullable: () => Ra,
  $ZodNumber: () => Jn,
  $ZodNumberFormat: () => oa,
  $ZodObject: () => Tu,
  $ZodObjectJIT: () => ga,
  $ZodOptional: () => Qn,
  $ZodPipe: () => za,
  $ZodPrefault: () => Ta,
  $ZodPromise: () => Ua,
  $ZodReadonly: () => Ma,
  $ZodRealError: () => X,
  $ZodRecord: () => ba,
  $ZodRegistry: () => eo,
  $ZodSet: () => Sa,
  $ZodString: () => Ze,
  $ZodStringFormat: () => $,
  $ZodSuccess: () => Ea,
  $ZodSymbol: () => ia,
  $ZodTemplateLiteral: () => $a,
  $ZodTransform: () => Ia,
  $ZodTuple: () => Xn,
  $ZodType: () => T,
  $ZodULID: () => Zi,
  $ZodURL: () => Mi,
  $ZodUUID: () => Ai,
  $ZodUndefined: () => aa,
  $ZodUnion: () => Xt,
  $ZodUnknown: () => la,
  $ZodVoid: () => ua,
  $ZodXID: () => ji,
  $ZodXor: () => fa,
  $brand: () => Tn,
  $constructor: () => $constructor,
  $input: () => zs,
  $output: () => As,
  Doc: () => Jt,
  JSONSchema: () => $u,
  JSONSchemaGenerator: () => Ao,
  NEVER: () => xr,
  TimePrecision: () => Us,
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
  _decode: () => Mn,
  _decodeAsync: () => Dn,
  _default: () => _default,
  _discriminatedUnion: () => _discriminatedUnion,
  _e164: () => _e164,
  _email: () => _email,
  _emoji: () => _emoji,
  _encode: () => zn,
  _encodeAsync: () => $n,
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
  _parse: () => et,
  _parseAsync: () => tt,
  _pipe: () => _pipe,
  _positive: () => _positive,
  _promise: () => _promise,
  _property: () => _property,
  _readonly: () => _readonly,
  _record: () => _record,
  _refine: () => _refine,
  _regex: () => _regex,
  _safeDecode: () => Nn,
  _safeDecodeAsync: () => jn,
  _safeEncode: () => Un,
  _safeEncodeAsync: () => Zn,
  _safeParse: () => nt,
  _safeParseAsync: () => ot,
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
  createStandardJSONSchemaMethod: () => vt,
  createToJSONSchemaMethod: () => vc,
  decode: () => Uf,
  decodeAsync: () => Zf,
  describe: () => describe,
  encode: () => Df,
  encodeAsync: () => Nf,
  extractDefs: () => extractDefs,
  finalize: () => finalize,
  flattenError: () => flattenError,
  formatError: () => formatError,
  globalConfig: () => Nt,
  globalRegistry: () => F,
  initializeContext: () => initializeContext,
  isValidBase64: () => isValidBase64,
  isValidBase64URL: () => isValidBase64URL,
  isValidJWT: () => isValidJWT,
  locales: () => rn,
  meta: () => meta,
  parse: () => On,
  parseAsync: () => An,
  prettifyError: () => prettifyError,
  process: () => M,
  regexes: () => se,
  registry: () => registry,
  safeDecode: () => Bf,
  safeDecodeAsync: () => Wf,
  safeEncode: () => jf,
  safeEncodeAsync: () => Lf,
  safeParse: () => $r,
  safeParseAsync: () => Dr,
  toDotPath: () => toDotPath,
  toJSONSchema: () => toJSONSchema,
  treeifyError: () => treeifyError,
  util: () => k,
  version: () => wi,
});
var xr = Object.freeze({ status: "aborted" });
function $constructor(e, o, i) {
  function init(l, u) {
    if (
      (l._zod ||
        Object.defineProperty(l, "_zod", {
          value: { def: u, constr: _, traits: new Set() },
          enumerable: !1,
        }),
      l._zod.traits.has(e))
    )
      return;
    (l._zod.traits.add(e), o(l, u));
    let p = _.prototype,
      f = Object.keys(p);
    for (let y = 0; y < f.length; y++) {
      let v = f[y];
      v in l || (l[v] = p[v].bind(l));
    }
  }
  c(init, "init");
  let n = i?.Parent ?? Object;
  class r extends n {
    static {
      c(this, "Definition");
    }
  }
  Object.defineProperty(r, "name", { value: e });
  function _(l) {
    var u;
    let p = i?.Parent ? new r() : this;
    (init(p, l), (u = p._zod).deferred ?? (u.deferred = []));
    for (let f of p._zod.deferred) f();
    return p;
  }
  return (
    c(_, "_"),
    Object.defineProperty(_, "init", { value: init }),
    Object.defineProperty(_, Symbol.hasInstance, {
      value: c((l) => (i?.Parent && l instanceof i.Parent ? !0 : l?._zod?.traits?.has(e)), "value"),
    }),
    Object.defineProperty(_, "name", { value: e }),
    _
  );
}
c($constructor, "$constructor");
var Tn = Symbol("zod_brand"),
  le = class extends Error {
    static {
      c(this, "$ZodAsyncError");
    }
    constructor() {
      super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
    }
  },
  Ie = class extends Error {
    static {
      c(this, "$ZodEncodeError");
    }
    constructor(o) {
      (super(`Encountered unidirectional transform during encode: ${o}`),
        (this.name = "ZodEncodeError"));
    }
  },
  Nt = {};
function config(e) {
  return (e && Object.assign(Nt, e), Nt);
}
c(config, "config");
var k = {};
ye(k, {
  BIGINT_FORMAT_RANGES: () => Ar,
  Class: () => Ir,
  NUMBER_FORMAT_RANGES: () => Or,
  aborted: () => aborted,
  allowsEval: () => Pr,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => En,
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
  getParsedType: () => _f,
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
  primitiveTypes: () => wr,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => Lt,
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
c(assertEqual, "assertEqual");
function assertNotEqual(e) {
  return e;
}
c(assertNotEqual, "assertNotEqual");
function assertIs(e) {}
c(assertIs, "assertIs");
function assertNever(e) {
  throw new Error("Unexpected value in exhaustive check");
}
c(assertNever, "assertNever");
function assert(e) {}
c(assert, "assert");
function getEnumValues(e) {
  let o = Object.values(e).filter((a) => typeof a == "number");
  return Object.entries(e)
    .filter(([a, n]) => o.indexOf(+a) === -1)
    .map(([a, n]) => n);
}
c(getEnumValues, "getEnumValues");
function joinValues(e, o = "|") {
  return e.map((i) => stringifyPrimitive(i)).join(o);
}
c(joinValues, "joinValues");
function jsonStringifyReplacer(e, o) {
  return typeof o == "bigint" ? o.toString() : o;
}
c(jsonStringifyReplacer, "jsonStringifyReplacer");
function cached(e) {
  return {
    get value() {
      {
        let i = e();
        return (Object.defineProperty(this, "value", { value: i }), i);
      }
      throw new Error("cached value already set");
    },
  };
}
c(cached, "cached");
function nullish(e) {
  return e == null;
}
c(nullish, "nullish");
function cleanRegex(e) {
  let o = e.startsWith("^") ? 1 : 0,
    i = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(o, i);
}
c(cleanRegex, "cleanRegex");
function floatSafeRemainder(e, o) {
  let i = (e.toString().split(".")[1] || "").length,
    a = o.toString(),
    n = (a.split(".")[1] || "").length;
  if (n === 0 && /\d?e-\d?/.test(a)) {
    let u = a.match(/\d?e-(\d?)/);
    u?.[1] && (n = Number.parseInt(u[1]));
  }
  let r = i > n ? i : n,
    s = Number.parseInt(e.toFixed(r).replace(".", "")),
    l = Number.parseInt(o.toFixed(r).replace(".", ""));
  return (s % l) / 10 ** r;
}
c(floatSafeRemainder, "floatSafeRemainder");
var nu = Symbol("evaluating");
function defineLazy(e, o, i) {
  let a;
  Object.defineProperty(e, o, {
    get() {
      if (a !== nu) return (a === void 0 && ((a = nu), (a = i())), a);
    },
    set(n) {
      Object.defineProperty(e, o, { value: n });
    },
    configurable: !0,
  });
}
c(defineLazy, "defineLazy");
function objectClone(e) {
  return Object.create(Object.getPrototypeOf(e), Object.getOwnPropertyDescriptors(e));
}
c(objectClone, "objectClone");
function assignProp(e, o, i) {
  Object.defineProperty(e, o, { value: i, writable: !0, enumerable: !0, configurable: !0 });
}
c(assignProp, "assignProp");
function mergeDefs(...e) {
  let o = {};
  for (let i of e) {
    let a = Object.getOwnPropertyDescriptors(i);
    Object.assign(o, a);
  }
  return Object.defineProperties({}, o);
}
c(mergeDefs, "mergeDefs");
function cloneDef(e) {
  return mergeDefs(e._zod.def);
}
c(cloneDef, "cloneDef");
function getElementAtPath(e, o) {
  return o ? o.reduce((i, a) => i?.[a], e) : e;
}
c(getElementAtPath, "getElementAtPath");
function promiseAllObject(e) {
  let o = Object.keys(e),
    i = o.map((a) => e[a]);
  return Promise.all(i).then((a) => {
    let n = {};
    for (let r = 0; r < o.length; r++) n[o[r]] = a[r];
    return n;
  });
}
c(promiseAllObject, "promiseAllObject");
function randomString(e = 10) {
  let o = "abcdefghijklmnopqrstuvwxyz",
    i = "";
  for (let a = 0; a < e; a++) i += o[Math.floor(Math.random() * o.length)];
  return i;
}
c(randomString, "randomString");
function esc(e) {
  return JSON.stringify(e);
}
c(esc, "esc");
function slugify(e) {
  return e
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
c(slugify, "slugify");
var En = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function isObject(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
c(isObject, "isObject");
var Pr = cached(() => {
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
  let o = e.constructor;
  if (o === void 0 || typeof o != "function") return !0;
  let i = o.prototype;
  return !(isObject(i) === !1 || Object.prototype.hasOwnProperty.call(i, "isPrototypeOf") === !1);
}
c(isPlainObject, "isPlainObject");
function shallowClone(e) {
  return isPlainObject(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
c(shallowClone, "shallowClone");
function numKeys(e) {
  let o = 0;
  for (let i in e) Object.prototype.hasOwnProperty.call(e, i) && o++;
  return o;
}
c(numKeys, "numKeys");
var _f = c((e) => {
    let o = typeof e;
    switch (o) {
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
        throw new Error(`Unknown data type: ${o}`);
    }
  }, "getParsedType"),
  Lt = new Set(["string", "number", "symbol"]),
  wr = new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]);
function escapeRegex(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
c(escapeRegex, "escapeRegex");
function clone(e, o, i) {
  let a = new e._zod.constr(o ?? e._zod.def);
  return ((!o || i?.parent) && (a._zod.parent = e), a);
}
c(clone, "clone");
function normalizeParams(e) {
  let o = e;
  if (!o) return {};
  if (typeof o == "string") return { error: c(() => o, "error") };
  if (o?.message !== void 0) {
    if (o?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
    o.error = o.message;
  }
  return (
    delete o.message,
    typeof o.error == "string" ? { ...o, error: c(() => o.error, "error") } : o
  );
}
c(normalizeParams, "normalizeParams");
function createTransparentProxy(e) {
  let o;
  return new Proxy(
    {},
    {
      get(i, a, n) {
        return (o ?? (o = e()), Reflect.get(o, a, n));
      },
      set(i, a, n, r) {
        return (o ?? (o = e()), Reflect.set(o, a, n, r));
      },
      has(i, a) {
        return (o ?? (o = e()), Reflect.has(o, a));
      },
      deleteProperty(i, a) {
        return (o ?? (o = e()), Reflect.deleteProperty(o, a));
      },
      ownKeys(i) {
        return (o ?? (o = e()), Reflect.ownKeys(o));
      },
      getOwnPropertyDescriptor(i, a) {
        return (o ?? (o = e()), Reflect.getOwnPropertyDescriptor(o, a));
      },
      defineProperty(i, a, n) {
        return (o ?? (o = e()), Reflect.defineProperty(o, a, n));
      },
    },
  );
}
c(createTransparentProxy, "createTransparentProxy");
function stringifyPrimitive(e) {
  return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
c(stringifyPrimitive, "stringifyPrimitive");
function optionalKeys(e) {
  return Object.keys(e).filter(
    (o) => e[o]._zod.optin === "optional" && e[o]._zod.optout === "optional",
  );
}
c(optionalKeys, "optionalKeys");
var Or = {
    safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    int32: [-2147483648, 2147483647],
    uint32: [0, 4294967295],
    float32: [-34028234663852886e22, 34028234663852886e22],
    float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
  },
  Ar = {
    int64: [BigInt("-9223372036854775808"), BigInt("9223372036854775807")],
    uint64: [BigInt(0), BigInt("18446744073709551615")],
  };
function pick(e, o) {
  let i = e._zod.def,
    a = i.checks;
  if (a && a.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  let r = mergeDefs(e._zod.def, {
    get shape() {
      let s = {};
      for (let l in o) {
        if (!(l in i.shape)) throw new Error(`Unrecognized key: "${l}"`);
        o[l] && (s[l] = i.shape[l]);
      }
      return (assignProp(this, "shape", s), s);
    },
    checks: [],
  });
  return clone(e, r);
}
c(pick, "pick");
function omit(e, o) {
  let i = e._zod.def,
    a = i.checks;
  if (a && a.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  let r = mergeDefs(e._zod.def, {
    get shape() {
      let s = { ...e._zod.def.shape };
      for (let l in o) {
        if (!(l in i.shape)) throw new Error(`Unrecognized key: "${l}"`);
        o[l] && delete s[l];
      }
      return (assignProp(this, "shape", s), s);
    },
    checks: [],
  });
  return clone(e, r);
}
c(omit, "omit");
function extend(e, o) {
  if (!isPlainObject(o)) throw new Error("Invalid input to extend: expected a plain object");
  let i = e._zod.def.checks;
  if (i && i.length > 0) {
    let r = e._zod.def.shape;
    for (let s in o)
      if (Object.getOwnPropertyDescriptor(r, s) !== void 0)
        throw new Error(
          "Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.",
        );
  }
  let n = mergeDefs(e._zod.def, {
    get shape() {
      let r = { ...e._zod.def.shape, ...o };
      return (assignProp(this, "shape", r), r);
    },
  });
  return clone(e, n);
}
c(extend, "extend");
function safeExtend(e, o) {
  if (!isPlainObject(o)) throw new Error("Invalid input to safeExtend: expected a plain object");
  let i = mergeDefs(e._zod.def, {
    get shape() {
      let a = { ...e._zod.def.shape, ...o };
      return (assignProp(this, "shape", a), a);
    },
  });
  return clone(e, i);
}
c(safeExtend, "safeExtend");
function merge(e, o) {
  let i = mergeDefs(e._zod.def, {
    get shape() {
      let a = { ...e._zod.def.shape, ...o._zod.def.shape };
      return (assignProp(this, "shape", a), a);
    },
    get catchall() {
      return o._zod.def.catchall;
    },
    checks: [],
  });
  return clone(e, i);
}
c(merge, "merge");
function partial(e, o, i) {
  let n = o._zod.def.checks;
  if (n && n.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  let s = mergeDefs(o._zod.def, {
    get shape() {
      let l = o._zod.def.shape,
        u = { ...l };
      if (i)
        for (let p in i) {
          if (!(p in l)) throw new Error(`Unrecognized key: "${p}"`);
          i[p] && (u[p] = e ? new e({ type: "optional", innerType: l[p] }) : l[p]);
        }
      else for (let p in l) u[p] = e ? new e({ type: "optional", innerType: l[p] }) : l[p];
      return (assignProp(this, "shape", u), u);
    },
    checks: [],
  });
  return clone(o, s);
}
c(partial, "partial");
function required(e, o, i) {
  let a = mergeDefs(o._zod.def, {
    get shape() {
      let n = o._zod.def.shape,
        r = { ...n };
      if (i)
        for (let s in i) {
          if (!(s in r)) throw new Error(`Unrecognized key: "${s}"`);
          i[s] && (r[s] = new e({ type: "nonoptional", innerType: n[s] }));
        }
      else for (let s in n) r[s] = new e({ type: "nonoptional", innerType: n[s] });
      return (assignProp(this, "shape", r), r);
    },
  });
  return clone(o, a);
}
c(required, "required");
function aborted(e, o = 0) {
  if (e.aborted === !0) return !0;
  for (let i = o; i < e.issues.length; i++) if (e.issues[i]?.continue !== !0) return !0;
  return !1;
}
c(aborted, "aborted");
function prefixIssues(e, o) {
  return o.map((i) => {
    var a;
    return ((a = i).path ?? (a.path = []), i.path.unshift(e), i);
  });
}
c(prefixIssues, "prefixIssues");
function unwrapMessage(e) {
  return typeof e == "string" ? e : e?.message;
}
c(unwrapMessage, "unwrapMessage");
function finalizeIssue(e, o, i) {
  let a = { ...e, path: e.path ?? [] };
  if (!e.message) {
    let n =
      unwrapMessage(e.inst?._zod.def?.error?.(e)) ??
      unwrapMessage(o?.error?.(e)) ??
      unwrapMessage(i.customError?.(e)) ??
      unwrapMessage(i.localeError?.(e)) ??
      "Invalid input";
    a.message = n;
  }
  return (delete a.inst, delete a.continue, o?.reportInput || delete a.input, a);
}
c(finalizeIssue, "finalizeIssue");
function getSizableOrigin(e) {
  return e instanceof Set
    ? "set"
    : e instanceof Map
      ? "map"
      : e instanceof File
        ? "file"
        : "unknown";
}
c(getSizableOrigin, "getSizableOrigin");
function getLengthableOrigin(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
c(getLengthableOrigin, "getLengthableOrigin");
function parsedType(e) {
  let o = typeof e;
  switch (o) {
    case "number":
      return Number.isNaN(e) ? "nan" : "number";
    case "object": {
      if (e === null) return "null";
      if (Array.isArray(e)) return "array";
      let i = e;
      if (i && Object.getPrototypeOf(i) !== Object.prototype && "constructor" in i && i.constructor)
        return i.constructor.name;
    }
  }
  return o;
}
c(parsedType, "parsedType");
function issue(...e) {
  let [o, i, a] = e;
  return typeof o == "string" ? { message: o, code: "custom", input: i, inst: a } : { ...o };
}
c(issue, "issue");
function cleanEnum(e) {
  return Object.entries(e)
    .filter(([o, i]) => Number.isNaN(Number.parseInt(o, 10)))
    .map((o) => o[1]);
}
c(cleanEnum, "cleanEnum");
function base64ToUint8Array(e) {
  let o = atob(e),
    i = new Uint8Array(o.length);
  for (let a = 0; a < o.length; a++) i[a] = o.charCodeAt(a);
  return i;
}
c(base64ToUint8Array, "base64ToUint8Array");
function uint8ArrayToBase64(e) {
  let o = "";
  for (let i = 0; i < e.length; i++) o += String.fromCharCode(e[i]);
  return btoa(o);
}
c(uint8ArrayToBase64, "uint8ArrayToBase64");
function base64urlToUint8Array(e) {
  let o = e.replace(/-/g, "+").replace(/_/g, "/"),
    i = "=".repeat((4 - (o.length % 4)) % 4);
  return base64ToUint8Array(o + i);
}
c(base64urlToUint8Array, "base64urlToUint8Array");
function uint8ArrayToBase64url(e) {
  return uint8ArrayToBase64(e).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
c(uint8ArrayToBase64url, "uint8ArrayToBase64url");
function hexToUint8Array(e) {
  let o = e.replace(/^0x/, "");
  if (o.length % 2 !== 0) throw new Error("Invalid hex string length");
  let i = new Uint8Array(o.length / 2);
  for (let a = 0; a < o.length; a += 2) i[a / 2] = Number.parseInt(o.slice(a, a + 2), 16);
  return i;
}
c(hexToUint8Array, "hexToUint8Array");
function uint8ArrayToHex(e) {
  return Array.from(e)
    .map((o) => o.toString(16).padStart(2, "0"))
    .join("");
}
c(uint8ArrayToHex, "uint8ArrayToHex");
var Ir = class {
  static {
    c(this, "Class");
  }
  constructor(...o) {}
};
var iu = c((e, o) => {
    ((e.name = "$ZodError"),
      Object.defineProperty(e, "_zod", { value: e._zod, enumerable: !1 }),
      Object.defineProperty(e, "issues", { value: o, enumerable: !1 }),
      (e.message = JSON.stringify(o, jsonStringifyReplacer, 2)),
      Object.defineProperty(e, "toString", { value: c(() => e.message, "value"), enumerable: !1 }));
  }, "initializer"),
  qt = $constructor("$ZodError", iu),
  X = $constructor("$ZodError", iu, { Parent: Error });
function flattenError(e, o = (i) => i.message) {
  let i = {},
    a = [];
  for (let n of e.issues)
    n.path.length > 0
      ? ((i[n.path[0]] = i[n.path[0]] || []), i[n.path[0]].push(o(n)))
      : a.push(o(n));
  return { formErrors: a, fieldErrors: i };
}
c(flattenError, "flattenError");
function formatError(e, o = (i) => i.message) {
  let i = { _errors: [] },
    a = c((n) => {
      for (let r of n.issues)
        if (r.code === "invalid_union" && r.errors.length) r.errors.map((s) => a({ issues: s }));
        else if (r.code === "invalid_key") a({ issues: r.issues });
        else if (r.code === "invalid_element") a({ issues: r.issues });
        else if (r.path.length === 0) i._errors.push(o(r));
        else {
          let s = i,
            l = 0;
          for (; l < r.path.length;) {
            let u = r.path[l];
            (l === r.path.length - 1
              ? ((s[u] = s[u] || { _errors: [] }), s[u]._errors.push(o(r)))
              : (s[u] = s[u] || { _errors: [] }),
              (s = s[u]),
              l++);
          }
        }
    }, "processError");
  return (a(e), i);
}
c(formatError, "formatError");
function treeifyError(e, o = (i) => i.message) {
  let i = { errors: [] },
    a = c((n, r = []) => {
      var s, l;
      for (let u of n.issues)
        if (u.code === "invalid_union" && u.errors.length)
          u.errors.map((p) => a({ issues: p }, u.path));
        else if (u.code === "invalid_key") a({ issues: u.issues }, u.path);
        else if (u.code === "invalid_element") a({ issues: u.issues }, u.path);
        else {
          let p = [...r, ...u.path];
          if (p.length === 0) {
            i.errors.push(o(u));
            continue;
          }
          let f = i,
            y = 0;
          for (; y < p.length;) {
            let v = p[y],
              S = y === p.length - 1;
            (typeof v == "string"
              ? (f.properties ?? (f.properties = {}),
                (s = f.properties)[v] ?? (s[v] = { errors: [] }),
                (f = f.properties[v]))
              : (f.items ?? (f.items = []),
                (l = f.items)[v] ?? (l[v] = { errors: [] }),
                (f = f.items[v])),
              S && f.errors.push(o(u)),
              y++);
          }
        }
    }, "processError");
  return (a(e), i);
}
c(treeifyError, "treeifyError");
function toDotPath(e) {
  let o = [],
    i = e.map((a) => (typeof a == "object" ? a.key : a));
  for (let a of i)
    typeof a == "number"
      ? o.push(`[${a}]`)
      : typeof a == "symbol"
        ? o.push(`[${JSON.stringify(String(a))}]`)
        : /[^\w$]/.test(a)
          ? o.push(`[${JSON.stringify(a)}]`)
          : (o.length && o.push("."), o.push(a));
  return o.join("");
}
c(toDotPath, "toDotPath");
function prettifyError(e) {
  let o = [],
    i = [...e.issues].sort((a, n) => (a.path ?? []).length - (n.path ?? []).length);
  for (let a of i)
    (o.push(`\u2716 ${a.message}`), a.path?.length && o.push(`  \u2192 at ${toDotPath(a.path)}`));
  return o.join(`
`);
}
c(prettifyError, "prettifyError");
var et = c(
    (e) => (o, i, a, n) => {
      let r = a ? Object.assign(a, { async: !1 }) : { async: !1 },
        s = o._zod.run({ value: i, issues: [] }, r);
      if (s instanceof Promise) throw new le();
      if (s.issues.length) {
        let l = new (n?.Err ?? e)(s.issues.map((u) => finalizeIssue(u, r, config())));
        throw (En(l, n?.callee), l);
      }
      return s.value;
    },
    "_parse",
  ),
  On = et(X),
  tt = c(
    (e) => async (o, i, a, n) => {
      let r = a ? Object.assign(a, { async: !0 }) : { async: !0 },
        s = o._zod.run({ value: i, issues: [] }, r);
      if ((s instanceof Promise && (s = await s), s.issues.length)) {
        let l = new (n?.Err ?? e)(s.issues.map((u) => finalizeIssue(u, r, config())));
        throw (En(l, n?.callee), l);
      }
      return s.value;
    },
    "_parseAsync",
  ),
  An = tt(X),
  nt = c(
    (e) => (o, i, a) => {
      let n = a ? { ...a, async: !1 } : { async: !1 },
        r = o._zod.run({ value: i, issues: [] }, n);
      if (r instanceof Promise) throw new le();
      return r.issues.length
        ? { success: !1, error: new (e ?? qt)(r.issues.map((s) => finalizeIssue(s, n, config()))) }
        : { success: !0, data: r.value };
    },
    "_safeParse",
  ),
  $r = nt(X),
  ot = c(
    (e) => async (o, i, a) => {
      let n = a ? Object.assign(a, { async: !0 }) : { async: !0 },
        r = o._zod.run({ value: i, issues: [] }, n);
      return (
        r instanceof Promise && (r = await r),
        r.issues.length
          ? { success: !1, error: new e(r.issues.map((s) => finalizeIssue(s, n, config()))) }
          : { success: !0, data: r.value }
      );
    },
    "_safeParseAsync",
  ),
  Dr = ot(X),
  zn = c(
    (e) => (o, i, a) => {
      let n = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return et(e)(o, i, n);
    },
    "_encode",
  ),
  Df = zn(X),
  Mn = c((e) => (o, i, a) => et(e)(o, i, a), "_decode"),
  Uf = Mn(X),
  $n = c(
    (e) => async (o, i, a) => {
      let n = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return tt(e)(o, i, n);
    },
    "_encodeAsync",
  ),
  Nf = $n(X),
  Dn = c((e) => async (o, i, a) => tt(e)(o, i, a), "_decodeAsync"),
  Zf = Dn(X),
  Un = c(
    (e) => (o, i, a) => {
      let n = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return nt(e)(o, i, n);
    },
    "_safeEncode",
  ),
  jf = Un(X),
  Nn = c((e) => (o, i, a) => nt(e)(o, i, a), "_safeDecode"),
  Bf = Nn(X),
  Zn = c(
    (e) => async (o, i, a) => {
      let n = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return ot(e)(o, i, n);
    },
    "_safeEncodeAsync",
  ),
  Lf = Zn(X),
  jn = c((e) => async (o, i, a) => ot(e)(o, i, a), "_safeDecodeAsync"),
  Wf = jn(X);
var se = {};
ye(se, {
  base64: () => Xr,
  base64url: () => Bn,
  bigint: () => ri,
  boolean: () => ai,
  browserEmail: () => Yf,
  cidrv4: () => Jr,
  cidrv6: () => Yr,
  cuid: () => Ur,
  cuid2: () => Nr,
  date: () => ei,
  datetime: () => datetime,
  domain: () => eh,
  duration: () => Wr,
  e164: () => Qr,
  email: () => qr,
  emoji: () => emoji,
  extendedDuration: () => Ff,
  guid: () => Fr,
  hex: () => th,
  hostname: () => Qf,
  html5Email: () => Kf,
  idnEmail: () => Jf,
  integer: () => ii,
  ipv4: () => Gr,
  ipv6: () => Kr,
  ksuid: () => Br,
  lowercase: () => li,
  mac: () => Hr,
  md5_base64: () => oh,
  md5_base64url: () => rh,
  md5_hex: () => nh,
  nanoid: () => Lr,
  null: () => si,
  number: () => Ln,
  rfc5322Email: () => Hf,
  sha1_base64: () => ah,
  sha1_base64url: () => sh,
  sha1_hex: () => ih,
  sha256_base64: () => lh,
  sha256_base64url: () => dh,
  sha256_hex: () => ch,
  sha384_base64: () => ph,
  sha384_base64url: () => mh,
  sha384_hex: () => uh,
  sha512_base64: () => fh,
  sha512_base64url: () => hh,
  sha512_hex: () => gh,
  string: () => oi,
  time: () => time,
  ulid: () => Zr,
  undefined: () => ci,
  unicodeEmail: () => su,
  uppercase: () => di,
  uuid: () => Ne,
  uuid4: () => qf,
  uuid6: () => Vf,
  uuid7: () => Gf,
  xid: () => jr,
});
var Ur = /^[cC][^\s-]{8,}$/,
  Nr = /^[0-9a-z]+$/,
  Zr = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,
  jr = /^[0-9a-vA-V]{20}$/,
  Br = /^[A-Za-z0-9]{27}$/,
  Lr = /^[a-zA-Z0-9_-]{21}$/,
  Wr =
    /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
  Ff =
    /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,
  Fr = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  Ne = c(
    (e) =>
      e
        ? new RegExp(
            `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`,
          )
        : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,
    "uuid",
  ),
  qf = Ne(4),
  Vf = Ne(6),
  Gf = Ne(7),
  qr =
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
  Kf =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  Hf =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  su = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u,
  Jf = su,
  Yf =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  Xf = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function emoji() {
  return new RegExp(Xf, "u");
}
c(emoji, "emoji");
var Gr =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  Kr =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,
  Hr = c((e) => {
    let o = escapeRegex(e ?? ":");
    return new RegExp(`^(?:[0-9A-F]{2}${o}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${o}){5}[0-9a-f]{2}$`);
  }, "mac"),
  Jr =
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
  Yr =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  Xr = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
  Bn = /^[A-Za-z0-9_-]*$/,
  Qf =
    /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/,
  eh = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
  Qr = /^\+[1-9]\d{6,14}$/,
  cu =
    "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",
  ei = new RegExp(`^${cu}$`);
function timeSource(e) {
  let o = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number"
    ? e.precision === -1
      ? `${o}`
      : e.precision === 0
        ? `${o}:[0-5]\\d`
        : `${o}:[0-5]\\d\\.\\d{${e.precision}}`
    : `${o}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
c(timeSource, "timeSource");
function time(e) {
  return new RegExp(`^${timeSource(e)}$`);
}
c(time, "time");
function datetime(e) {
  let o = timeSource({ precision: e.precision }),
    i = ["Z"];
  (e.local && i.push(""), e.offset && i.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)"));
  let a = `${o}(?:${i.join("|")})`;
  return new RegExp(`^${cu}T(?:${a})$`);
}
c(datetime, "datetime");
var oi = c((e) => {
    let o = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}` : "[\\s\\S]*";
    return new RegExp(`^${o}$`);
  }, "string"),
  ri = /^-?\d+n?$/,
  ii = /^-?\d+$/,
  Ln = /^-?\d+(?:\.\d+)?$/,
  ai = /^(?:true|false)$/i,
  si = /^null$/i;
var ci = /^undefined$/i;
var li = /^[^A-Z]*$/,
  di = /^[^a-z]*$/,
  th = /^[0-9a-fA-F]*$/;
function fixedBase64(e, o) {
  return new RegExp(`^[A-Za-z0-9+/]{${e}}${o}$`);
}
c(fixedBase64, "fixedBase64");
function fixedBase64url(e) {
  return new RegExp(`^[A-Za-z0-9_-]{${e}}$`);
}
c(fixedBase64url, "fixedBase64url");
var nh = /^[0-9a-fA-F]{32}$/,
  oh = fixedBase64(22, "=="),
  rh = fixedBase64url(22),
  ih = /^[0-9a-fA-F]{40}$/,
  ah = fixedBase64(27, "="),
  sh = fixedBase64url(27),
  ch = /^[0-9a-fA-F]{64}$/,
  lh = fixedBase64(43, "="),
  dh = fixedBase64url(43),
  uh = /^[0-9a-fA-F]{96}$/,
  ph = fixedBase64(64, ""),
  mh = fixedBase64url(64),
  gh = /^[0-9a-fA-F]{128}$/,
  fh = fixedBase64(86, "=="),
  hh = fixedBase64url(86);
var U = $constructor("$ZodCheck", (e, o) => {
    var i;
    (e._zod ?? (e._zod = {}), (e._zod.def = o), (i = e._zod).onattach ?? (i.onattach = []));
  }),
  uu = { number: "number", bigint: "bigint", object: "date" },
  Wn = $constructor("$ZodCheckLessThan", (e, o) => {
    U.init(e, o);
    let i = uu[typeof o.value];
    (e._zod.onattach.push((a) => {
      let n = a._zod.bag,
        r = (o.inclusive ? n.maximum : n.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
      o.value < r && (o.inclusive ? (n.maximum = o.value) : (n.exclusiveMaximum = o.value));
    }),
      (e._zod.check = (a) => {
        (o.inclusive ? a.value <= o.value : a.value < o.value) ||
          a.issues.push({
            origin: i,
            code: "too_big",
            maximum: typeof o.value == "object" ? o.value.getTime() : o.value,
            input: a.value,
            inclusive: o.inclusive,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Fn = $constructor("$ZodCheckGreaterThan", (e, o) => {
    U.init(e, o);
    let i = uu[typeof o.value];
    (e._zod.onattach.push((a) => {
      let n = a._zod.bag,
        r = (o.inclusive ? n.minimum : n.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
      o.value > r && (o.inclusive ? (n.minimum = o.value) : (n.exclusiveMinimum = o.value));
    }),
      (e._zod.check = (a) => {
        (o.inclusive ? a.value >= o.value : a.value > o.value) ||
          a.issues.push({
            origin: i,
            code: "too_small",
            minimum: typeof o.value == "object" ? o.value.getTime() : o.value,
            input: a.value,
            inclusive: o.inclusive,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  ui = $constructor("$ZodCheckMultipleOf", (e, o) => {
    (U.init(e, o),
      e._zod.onattach.push((i) => {
        var a;
        (a = i._zod.bag).multipleOf ?? (a.multipleOf = o.value);
      }),
      (e._zod.check = (i) => {
        if (typeof i.value != typeof o.value)
          throw new Error("Cannot mix number and bigint in multiple_of check.");
        (typeof i.value == "bigint"
          ? i.value % o.value === BigInt(0)
          : floatSafeRemainder(i.value, o.value) === 0) ||
          i.issues.push({
            origin: typeof i.value,
            code: "not_multiple_of",
            divisor: o.value,
            input: i.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  pi = $constructor("$ZodCheckNumberFormat", (e, o) => {
    (U.init(e, o), (o.format = o.format || "float64"));
    let i = o.format?.includes("int"),
      a = i ? "int" : "number",
      [n, r] = Or[o.format];
    (e._zod.onattach.push((s) => {
      let l = s._zod.bag;
      ((l.format = o.format), (l.minimum = n), (l.maximum = r), i && (l.pattern = ii));
    }),
      (e._zod.check = (s) => {
        let l = s.value;
        if (i) {
          if (!Number.isInteger(l)) {
            s.issues.push({
              expected: a,
              format: o.format,
              code: "invalid_type",
              continue: !1,
              input: l,
              inst: e,
            });
            return;
          }
          if (!Number.isSafeInteger(l)) {
            l > 0
              ? s.issues.push({
                  input: l,
                  code: "too_big",
                  maximum: Number.MAX_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: a,
                  inclusive: !0,
                  continue: !o.abort,
                })
              : s.issues.push({
                  input: l,
                  code: "too_small",
                  minimum: Number.MIN_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: a,
                  inclusive: !0,
                  continue: !o.abort,
                });
            return;
          }
        }
        (l < n &&
          s.issues.push({
            origin: "number",
            input: l,
            code: "too_small",
            minimum: n,
            inclusive: !0,
            inst: e,
            continue: !o.abort,
          }),
          l > r &&
            s.issues.push({
              origin: "number",
              input: l,
              code: "too_big",
              maximum: r,
              inclusive: !0,
              inst: e,
              continue: !o.abort,
            }));
      }));
  }),
  mi = $constructor("$ZodCheckBigIntFormat", (e, o) => {
    U.init(e, o);
    let [i, a] = Ar[o.format];
    (e._zod.onattach.push((n) => {
      let r = n._zod.bag;
      ((r.format = o.format), (r.minimum = i), (r.maximum = a));
    }),
      (e._zod.check = (n) => {
        let r = n.value;
        (r < i &&
          n.issues.push({
            origin: "bigint",
            input: r,
            code: "too_small",
            minimum: i,
            inclusive: !0,
            inst: e,
            continue: !o.abort,
          }),
          r > a &&
            n.issues.push({
              origin: "bigint",
              input: r,
              code: "too_big",
              maximum: a,
              inclusive: !0,
              inst: e,
              continue: !o.abort,
            }));
      }));
  }),
  gi = $constructor("$ZodCheckMaxSize", (e, o) => {
    var i;
    (U.init(e, o),
      (i = e._zod.def).when ??
        (i.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.size !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        o.maximum < n && (a._zod.bag.maximum = o.maximum);
      }),
      (e._zod.check = (a) => {
        let n = a.value;
        n.size <= o.maximum ||
          a.issues.push({
            origin: getSizableOrigin(n),
            code: "too_big",
            maximum: o.maximum,
            inclusive: !0,
            input: n,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  fi = $constructor("$ZodCheckMinSize", (e, o) => {
    var i;
    (U.init(e, o),
      (i = e._zod.def).when ??
        (i.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.size !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        o.minimum > n && (a._zod.bag.minimum = o.minimum);
      }),
      (e._zod.check = (a) => {
        let n = a.value;
        n.size >= o.minimum ||
          a.issues.push({
            origin: getSizableOrigin(n),
            code: "too_small",
            minimum: o.minimum,
            inclusive: !0,
            input: n,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  hi = $constructor("$ZodCheckSizeEquals", (e, o) => {
    var i;
    (U.init(e, o),
      (i = e._zod.def).when ??
        (i.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.size !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag;
        ((n.minimum = o.size), (n.maximum = o.size), (n.size = o.size));
      }),
      (e._zod.check = (a) => {
        let n = a.value,
          r = n.size;
        if (r === o.size) return;
        let s = r > o.size;
        a.issues.push({
          origin: getSizableOrigin(n),
          ...(s ? { code: "too_big", maximum: o.size } : { code: "too_small", minimum: o.size }),
          inclusive: !0,
          exact: !0,
          input: a.value,
          inst: e,
          continue: !o.abort,
        });
      }));
  }),
  yi = $constructor("$ZodCheckMaxLength", (e, o) => {
    var i;
    (U.init(e, o),
      (i = e._zod.def).when ??
        (i.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        o.maximum < n && (a._zod.bag.maximum = o.maximum);
      }),
      (e._zod.check = (a) => {
        let n = a.value;
        if (n.length <= o.maximum) return;
        let s = getLengthableOrigin(n);
        a.issues.push({
          origin: s,
          code: "too_big",
          maximum: o.maximum,
          inclusive: !0,
          input: n,
          inst: e,
          continue: !o.abort,
        });
      }));
  }),
  bi = $constructor("$ZodCheckMinLength", (e, o) => {
    var i;
    (U.init(e, o),
      (i = e._zod.def).when ??
        (i.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        o.minimum > n && (a._zod.bag.minimum = o.minimum);
      }),
      (e._zod.check = (a) => {
        let n = a.value;
        if (n.length >= o.minimum) return;
        let s = getLengthableOrigin(n);
        a.issues.push({
          origin: s,
          code: "too_small",
          minimum: o.minimum,
          inclusive: !0,
          input: n,
          inst: e,
          continue: !o.abort,
        });
      }));
  }),
  vi = $constructor("$ZodCheckLengthEquals", (e, o) => {
    var i;
    (U.init(e, o),
      (i = e._zod.def).when ??
        (i.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag;
        ((n.minimum = o.length), (n.maximum = o.length), (n.length = o.length));
      }),
      (e._zod.check = (a) => {
        let n = a.value,
          r = n.length;
        if (r === o.length) return;
        let s = getLengthableOrigin(n),
          l = r > o.length;
        a.issues.push({
          origin: s,
          ...(l
            ? { code: "too_big", maximum: o.length }
            : { code: "too_small", minimum: o.length }),
          inclusive: !0,
          exact: !0,
          input: a.value,
          inst: e,
          continue: !o.abort,
        });
      }));
  }),
  rt = $constructor("$ZodCheckStringFormat", (e, o) => {
    var i, a;
    (U.init(e, o),
      e._zod.onattach.push((n) => {
        let r = n._zod.bag;
        ((r.format = o.format),
          o.pattern && (r.patterns ?? (r.patterns = new Set()), r.patterns.add(o.pattern)));
      }),
      o.pattern
        ? ((i = e._zod).check ??
          (i.check = (n) => {
            ((o.pattern.lastIndex = 0),
              !o.pattern.test(n.value) &&
                n.issues.push({
                  origin: "string",
                  code: "invalid_format",
                  format: o.format,
                  input: n.value,
                  ...(o.pattern ? { pattern: o.pattern.toString() } : {}),
                  inst: e,
                  continue: !o.abort,
                }));
          }))
        : ((a = e._zod).check ?? (a.check = () => {})));
  }),
  Si = $constructor("$ZodCheckRegex", (e, o) => {
    (rt.init(e, o),
      (e._zod.check = (i) => {
        ((o.pattern.lastIndex = 0),
          !o.pattern.test(i.value) &&
            i.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "regex",
              input: i.value,
              pattern: o.pattern.toString(),
              inst: e,
              continue: !o.abort,
            }));
      }));
  }),
  _i = $constructor("$ZodCheckLowerCase", (e, o) => {
    (o.pattern ?? (o.pattern = li), rt.init(e, o));
  }),
  xi = $constructor("$ZodCheckUpperCase", (e, o) => {
    (o.pattern ?? (o.pattern = di), rt.init(e, o));
  }),
  ki = $constructor("$ZodCheckIncludes", (e, o) => {
    U.init(e, o);
    let i = escapeRegex(o.includes),
      a = new RegExp(typeof o.position == "number" ? `^.{${o.position}}${i}` : i);
    ((o.pattern = a),
      e._zod.onattach.push((n) => {
        let r = n._zod.bag;
        (r.patterns ?? (r.patterns = new Set()), r.patterns.add(a));
      }),
      (e._zod.check = (n) => {
        n.value.includes(o.includes, o.position) ||
          n.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "includes",
            includes: o.includes,
            input: n.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Ii = $constructor("$ZodCheckStartsWith", (e, o) => {
    U.init(e, o);
    let i = new RegExp(`^${escapeRegex(o.prefix)}.*`);
    (o.pattern ?? (o.pattern = i),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag;
        (n.patterns ?? (n.patterns = new Set()), n.patterns.add(i));
      }),
      (e._zod.check = (a) => {
        a.value.startsWith(o.prefix) ||
          a.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "starts_with",
            prefix: o.prefix,
            input: a.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Ci = $constructor("$ZodCheckEndsWith", (e, o) => {
    U.init(e, o);
    let i = new RegExp(`.*${escapeRegex(o.suffix)}$`);
    (o.pattern ?? (o.pattern = i),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag;
        (n.patterns ?? (n.patterns = new Set()), n.patterns.add(i));
      }),
      (e._zod.check = (a) => {
        a.value.endsWith(o.suffix) ||
          a.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "ends_with",
            suffix: o.suffix,
            input: a.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  });
function handleCheckPropertyResult(e, o, i) {
  e.issues.length && o.issues.push(...prefixIssues(i, e.issues));
}
c(handleCheckPropertyResult, "handleCheckPropertyResult");
var Ri = $constructor("$ZodCheckProperty", (e, o) => {
    (U.init(e, o),
      (e._zod.check = (i) => {
        let a = o.schema._zod.run({ value: i.value[o.property], issues: [] }, {});
        if (a instanceof Promise) return a.then((n) => handleCheckPropertyResult(n, i, o.property));
        handleCheckPropertyResult(a, i, o.property);
      }));
  }),
  Pi = $constructor("$ZodCheckMimeType", (e, o) => {
    U.init(e, o);
    let i = new Set(o.mime);
    (e._zod.onattach.push((a) => {
      a._zod.bag.mime = o.mime;
    }),
      (e._zod.check = (a) => {
        i.has(a.value.type) ||
          a.issues.push({
            code: "invalid_value",
            values: o.mime,
            input: a.value.type,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Ti = $constructor("$ZodCheckOverwrite", (e, o) => {
    (U.init(e, o),
      (e._zod.check = (i) => {
        i.value = o.tx(i.value);
      }));
  });
var Jt = class {
  static {
    c(this, "Doc");
  }
  constructor(o = []) {
    ((this.content = []), (this.indent = 0), this && (this.args = o));
  }
  indented(o) {
    ((this.indent += 1), o(this), (this.indent -= 1));
  }
  write(o) {
    if (typeof o == "function") {
      (o(this, { execution: "sync" }), o(this, { execution: "async" }));
      return;
    }
    let a = o
        .split(
          `
`,
        )
        .filter((s) => s),
      n = Math.min(...a.map((s) => s.length - s.trimStart().length)),
      r = a.map((s) => s.slice(n)).map((s) => " ".repeat(this.indent * 2) + s);
    for (let s of r) this.content.push(s);
  }
  compile() {
    let o = Function,
      i = this?.args,
      n = [...(this?.content ?? [""]).map((r) => `  ${r}`)];
    return new o(
      ...i,
      n.join(`
`),
    );
  }
};
var wi = { major: 4, minor: 3, patch: 6 };
var T = $constructor("$ZodType", (e, o) => {
    var i;
    (e ?? (e = {}), (e._zod.def = o), (e._zod.bag = e._zod.bag || {}), (e._zod.version = wi));
    let a = [...(e._zod.def.checks ?? [])];
    e._zod.traits.has("$ZodCheck") && a.unshift(e);
    for (let n of a) for (let r of n._zod.onattach) r(e);
    if (a.length === 0)
      ((i = e._zod).deferred ?? (i.deferred = []),
        e._zod.deferred?.push(() => {
          e._zod.run = e._zod.parse;
        }));
    else {
      let n = c((s, l, u) => {
          let p = aborted(s),
            f;
          for (let y of l) {
            if (y._zod.def.when) {
              if (!y._zod.def.when(s)) continue;
            } else if (p) continue;
            let v = s.issues.length,
              S = y._zod.check(s);
            if (S instanceof Promise && u?.async === !1) throw new le();
            if (f || S instanceof Promise)
              f = (f ?? Promise.resolve()).then(async () => {
                (await S, s.issues.length !== v && (p || (p = aborted(s, v))));
              });
            else {
              if (s.issues.length === v) continue;
              p || (p = aborted(s, v));
            }
          }
          return f ? f.then(() => s) : s;
        }, "runChecks"),
        r = c((s, l, u) => {
          if (aborted(s)) return ((s.aborted = !0), s);
          let p = n(l, a, u);
          if (p instanceof Promise) {
            if (u.async === !1) throw new le();
            return p.then((f) => e._zod.parse(f, u));
          }
          return e._zod.parse(p, u);
        }, "handleCanaryResult");
      e._zod.run = (s, l) => {
        if (l.skipChecks) return e._zod.parse(s, l);
        if (l.direction === "backward") {
          let p = e._zod.parse({ value: s.value, issues: [] }, { ...l, skipChecks: !0 });
          return p instanceof Promise ? p.then((f) => r(f, s, l)) : r(p, s, l);
        }
        let u = e._zod.parse(s, l);
        if (u instanceof Promise) {
          if (l.async === !1) throw new le();
          return u.then((p) => n(p, a, l));
        }
        return n(u, a, l);
      };
    }
    defineLazy(e, "~standard", () => ({
      validate: c((n) => {
        try {
          let r = $r(e, n);
          return r.success ? { value: r.data } : { issues: r.error?.issues };
        } catch {
          return Dr(e, n).then((s) =>
            s.success ? { value: s.data } : { issues: s.error?.issues },
          );
        }
      }, "validate"),
      vendor: "zod",
      version: 1,
    }));
  }),
  Ze = $constructor("$ZodString", (e, o) => {
    (T.init(e, o),
      (e._zod.pattern = [...(e?._zod.bag?.patterns ?? [])].pop() ?? oi(e._zod.bag)),
      (e._zod.parse = (i, a) => {
        if (o.coerce)
          try {
            i.value = String(i.value);
          } catch {}
        return (
          typeof i.value == "string" ||
            i.issues.push({ expected: "string", code: "invalid_type", input: i.value, inst: e }),
          i
        );
      }));
  }),
  $ = $constructor("$ZodStringFormat", (e, o) => {
    (rt.init(e, o), Ze.init(e, o));
  }),
  Oi = $constructor("$ZodGUID", (e, o) => {
    (o.pattern ?? (o.pattern = Fr), $.init(e, o));
  }),
  Ai = $constructor("$ZodUUID", (e, o) => {
    if (o.version) {
      let a = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[o.version];
      if (a === void 0) throw new Error(`Invalid UUID version: "${o.version}"`);
      o.pattern ?? (o.pattern = Ne(a));
    } else o.pattern ?? (o.pattern = Ne());
    $.init(e, o);
  }),
  zi = $constructor("$ZodEmail", (e, o) => {
    (o.pattern ?? (o.pattern = qr), $.init(e, o));
  }),
  Mi = $constructor("$ZodURL", (e, o) => {
    ($.init(e, o),
      (e._zod.check = (i) => {
        try {
          let a = i.value.trim(),
            n = new URL(a);
          (o.hostname &&
            ((o.hostname.lastIndex = 0),
            o.hostname.test(n.hostname) ||
              i.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid hostname",
                pattern: o.hostname.source,
                input: i.value,
                inst: e,
                continue: !o.abort,
              })),
            o.protocol &&
              ((o.protocol.lastIndex = 0),
              o.protocol.test(n.protocol.endsWith(":") ? n.protocol.slice(0, -1) : n.protocol) ||
                i.issues.push({
                  code: "invalid_format",
                  format: "url",
                  note: "Invalid protocol",
                  pattern: o.protocol.source,
                  input: i.value,
                  inst: e,
                  continue: !o.abort,
                })),
            o.normalize ? (i.value = n.href) : (i.value = a));
          return;
        } catch {
          i.issues.push({
            code: "invalid_format",
            format: "url",
            input: i.value,
            inst: e,
            continue: !o.abort,
          });
        }
      }));
  }),
  $i = $constructor("$ZodEmoji", (e, o) => {
    (o.pattern ?? (o.pattern = emoji()), $.init(e, o));
  }),
  Di = $constructor("$ZodNanoID", (e, o) => {
    (o.pattern ?? (o.pattern = Lr), $.init(e, o));
  }),
  Ui = $constructor("$ZodCUID", (e, o) => {
    (o.pattern ?? (o.pattern = Ur), $.init(e, o));
  }),
  Ni = $constructor("$ZodCUID2", (e, o) => {
    (o.pattern ?? (o.pattern = Nr), $.init(e, o));
  }),
  Zi = $constructor("$ZodULID", (e, o) => {
    (o.pattern ?? (o.pattern = Zr), $.init(e, o));
  }),
  ji = $constructor("$ZodXID", (e, o) => {
    (o.pattern ?? (o.pattern = jr), $.init(e, o));
  }),
  Bi = $constructor("$ZodKSUID", (e, o) => {
    (o.pattern ?? (o.pattern = Br), $.init(e, o));
  }),
  Li = $constructor("$ZodISODateTime", (e, o) => {
    (o.pattern ?? (o.pattern = datetime(o)), $.init(e, o));
  }),
  Wi = $constructor("$ZodISODate", (e, o) => {
    (o.pattern ?? (o.pattern = ei), $.init(e, o));
  }),
  Fi = $constructor("$ZodISOTime", (e, o) => {
    (o.pattern ?? (o.pattern = time(o)), $.init(e, o));
  }),
  qi = $constructor("$ZodISODuration", (e, o) => {
    (o.pattern ?? (o.pattern = Wr), $.init(e, o));
  }),
  Vi = $constructor("$ZodIPv4", (e, o) => {
    (o.pattern ?? (o.pattern = Gr), $.init(e, o), (e._zod.bag.format = "ipv4"));
  }),
  Gi = $constructor("$ZodIPv6", (e, o) => {
    (o.pattern ?? (o.pattern = Kr),
      $.init(e, o),
      (e._zod.bag.format = "ipv6"),
      (e._zod.check = (i) => {
        try {
          new URL(`http://[${i.value}]`);
        } catch {
          i.issues.push({
            code: "invalid_format",
            format: "ipv6",
            input: i.value,
            inst: e,
            continue: !o.abort,
          });
        }
      }));
  }),
  Ki = $constructor("$ZodMAC", (e, o) => {
    (o.pattern ?? (o.pattern = Hr(o.delimiter)), $.init(e, o), (e._zod.bag.format = "mac"));
  }),
  Hi = $constructor("$ZodCIDRv4", (e, o) => {
    (o.pattern ?? (o.pattern = Jr), $.init(e, o));
  }),
  Ji = $constructor("$ZodCIDRv6", (e, o) => {
    (o.pattern ?? (o.pattern = Yr),
      $.init(e, o),
      (e._zod.check = (i) => {
        let a = i.value.split("/");
        try {
          if (a.length !== 2) throw new Error();
          let [n, r] = a;
          if (!r) throw new Error();
          let s = Number(r);
          if (`${s}` !== r) throw new Error();
          if (s < 0 || s > 128) throw new Error();
          new URL(`http://[${n}]`);
        } catch {
          i.issues.push({
            code: "invalid_format",
            format: "cidrv6",
            input: i.value,
            inst: e,
            continue: !o.abort,
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
c(isValidBase64, "isValidBase64");
var Xi = $constructor("$ZodBase64", (e, o) => {
  (o.pattern ?? (o.pattern = Xr),
    $.init(e, o),
    (e._zod.bag.contentEncoding = "base64"),
    (e._zod.check = (i) => {
      isValidBase64(i.value) ||
        i.issues.push({
          code: "invalid_format",
          format: "base64",
          input: i.value,
          inst: e,
          continue: !o.abort,
        });
    }));
});
function isValidBase64URL(e) {
  if (!Bn.test(e)) return !1;
  let o = e.replace(/[-_]/g, (a) => (a === "-" ? "+" : "/")),
    i = o.padEnd(Math.ceil(o.length / 4) * 4, "=");
  return isValidBase64(i);
}
c(isValidBase64URL, "isValidBase64URL");
var Qi = $constructor("$ZodBase64URL", (e, o) => {
    (o.pattern ?? (o.pattern = Bn),
      $.init(e, o),
      (e._zod.bag.contentEncoding = "base64url"),
      (e._zod.check = (i) => {
        isValidBase64URL(i.value) ||
          i.issues.push({
            code: "invalid_format",
            format: "base64url",
            input: i.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  ea = $constructor("$ZodE164", (e, o) => {
    (o.pattern ?? (o.pattern = Qr), $.init(e, o));
  });
function isValidJWT(e, o = null) {
  try {
    let i = e.split(".");
    if (i.length !== 3) return !1;
    let [a] = i;
    if (!a) return !1;
    let n = JSON.parse(atob(a));
    return !(("typ" in n && n?.typ !== "JWT") || !n.alg || (o && (!("alg" in n) || n.alg !== o)));
  } catch {
    return !1;
  }
}
c(isValidJWT, "isValidJWT");
var ta = $constructor("$ZodJWT", (e, o) => {
    ($.init(e, o),
      (e._zod.check = (i) => {
        isValidJWT(i.value, o.alg) ||
          i.issues.push({
            code: "invalid_format",
            format: "jwt",
            input: i.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  na = $constructor("$ZodCustomStringFormat", (e, o) => {
    ($.init(e, o),
      (e._zod.check = (i) => {
        o.fn(i.value) ||
          i.issues.push({
            code: "invalid_format",
            format: o.format,
            input: i.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Jn = $constructor("$ZodNumber", (e, o) => {
    (T.init(e, o),
      (e._zod.pattern = e._zod.bag.pattern ?? Ln),
      (e._zod.parse = (i, a) => {
        if (o.coerce)
          try {
            i.value = Number(i.value);
          } catch {}
        let n = i.value;
        if (typeof n == "number" && !Number.isNaN(n) && Number.isFinite(n)) return i;
        let r =
          typeof n == "number"
            ? Number.isNaN(n)
              ? "NaN"
              : Number.isFinite(n)
                ? void 0
                : "Infinity"
            : void 0;
        return (
          i.issues.push({
            expected: "number",
            code: "invalid_type",
            input: n,
            inst: e,
            ...(r ? { received: r } : {}),
          }),
          i
        );
      }));
  }),
  oa = $constructor("$ZodNumberFormat", (e, o) => {
    (pi.init(e, o), Jn.init(e, o));
  }),
  Yt = $constructor("$ZodBoolean", (e, o) => {
    (T.init(e, o),
      (e._zod.pattern = ai),
      (e._zod.parse = (i, a) => {
        if (o.coerce)
          try {
            i.value = !!i.value;
          } catch {}
        let n = i.value;
        return (
          typeof n == "boolean" ||
            i.issues.push({ expected: "boolean", code: "invalid_type", input: n, inst: e }),
          i
        );
      }));
  }),
  Yn = $constructor("$ZodBigInt", (e, o) => {
    (T.init(e, o),
      (e._zod.pattern = ri),
      (e._zod.parse = (i, a) => {
        if (o.coerce)
          try {
            i.value = BigInt(i.value);
          } catch {}
        return (
          typeof i.value == "bigint" ||
            i.issues.push({ expected: "bigint", code: "invalid_type", input: i.value, inst: e }),
          i
        );
      }));
  }),
  ra = $constructor("$ZodBigIntFormat", (e, o) => {
    (mi.init(e, o), Yn.init(e, o));
  }),
  ia = $constructor("$ZodSymbol", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) => {
        let n = i.value;
        return (
          typeof n == "symbol" ||
            i.issues.push({ expected: "symbol", code: "invalid_type", input: n, inst: e }),
          i
        );
      }));
  }),
  aa = $constructor("$ZodUndefined", (e, o) => {
    (T.init(e, o),
      (e._zod.pattern = ci),
      (e._zod.values = new Set([void 0])),
      (e._zod.optin = "optional"),
      (e._zod.optout = "optional"),
      (e._zod.parse = (i, a) => {
        let n = i.value;
        return (
          typeof n > "u" ||
            i.issues.push({ expected: "undefined", code: "invalid_type", input: n, inst: e }),
          i
        );
      }));
  }),
  sa = $constructor("$ZodNull", (e, o) => {
    (T.init(e, o),
      (e._zod.pattern = si),
      (e._zod.values = new Set([null])),
      (e._zod.parse = (i, a) => {
        let n = i.value;
        return (
          n === null ||
            i.issues.push({ expected: "null", code: "invalid_type", input: n, inst: e }),
          i
        );
      }));
  }),
  ca = $constructor("$ZodAny", (e, o) => {
    (T.init(e, o), (e._zod.parse = (i) => i));
  }),
  la = $constructor("$ZodUnknown", (e, o) => {
    (T.init(e, o), (e._zod.parse = (i) => i));
  }),
  da = $constructor("$ZodNever", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) => (
        i.issues.push({ expected: "never", code: "invalid_type", input: i.value, inst: e }),
        i
      )));
  }),
  ua = $constructor("$ZodVoid", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) => {
        let n = i.value;
        return (
          typeof n > "u" ||
            i.issues.push({ expected: "void", code: "invalid_type", input: n, inst: e }),
          i
        );
      }));
  }),
  pa = $constructor("$ZodDate", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) => {
        if (o.coerce)
          try {
            i.value = new Date(i.value);
          } catch {}
        let n = i.value,
          r = n instanceof Date;
        return (
          (r && !Number.isNaN(n.getTime())) ||
            i.issues.push({
              expected: "date",
              code: "invalid_type",
              input: n,
              ...(r ? { received: "Invalid Date" } : {}),
              inst: e,
            }),
          i
        );
      }));
  });
function handleArrayResult(e, o, i) {
  (e.issues.length && o.issues.push(...prefixIssues(i, e.issues)), (o.value[i] = e.value));
}
c(handleArrayResult, "handleArrayResult");
var ma = $constructor("$ZodArray", (e, o) => {
  (T.init(e, o),
    (e._zod.parse = (i, a) => {
      let n = i.value;
      if (!Array.isArray(n))
        return (i.issues.push({ expected: "array", code: "invalid_type", input: n, inst: e }), i);
      i.value = Array(n.length);
      let r = [];
      for (let s = 0; s < n.length; s++) {
        let l = n[s],
          u = o.element._zod.run({ value: l, issues: [] }, a);
        u instanceof Promise ? r.push(u.then((p) => handleArrayResult(p, i, s))) : handleArrayResult(u, i, s);
      }
      return r.length ? Promise.all(r).then(() => i) : i;
    }));
});
function handlePropertyResult(e, o, i, a, n) {
  if (e.issues.length) {
    if (n && !(i in a)) return;
    o.issues.push(...prefixIssues(i, e.issues));
  }
  e.value === void 0 ? i in a && (o.value[i] = void 0) : (o.value[i] = e.value);
}
c(handlePropertyResult, "handlePropertyResult");
function normalizeDef(e) {
  let o = Object.keys(e.shape);
  for (let a of o)
    if (!e.shape?.[a]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  let i = optionalKeys(e.shape);
  return { ...e, keys: o, keySet: new Set(o), numKeys: o.length, optionalKeys: new Set(i) };
}
c(normalizeDef, "normalizeDef");
function handleCatchall(e, o, i, a, n, r) {
  let s = [],
    l = n.keySet,
    u = n.catchall._zod,
    p = u.def.type,
    f = u.optout === "optional";
  for (let y in o) {
    if (l.has(y)) continue;
    if (p === "never") {
      s.push(y);
      continue;
    }
    let v = u.run({ value: o[y], issues: [] }, a);
    v instanceof Promise ? e.push(v.then((S) => handlePropertyResult(S, i, y, o, f))) : handlePropertyResult(v, i, y, o, f);
  }
  return (
    s.length && i.issues.push({ code: "unrecognized_keys", keys: s, input: o, inst: r }),
    e.length ? Promise.all(e).then(() => i) : i
  );
}
c(handleCatchall, "handleCatchall");
var Tu = $constructor("$ZodObject", (e, o) => {
    if ((T.init(e, o), !Object.getOwnPropertyDescriptor(o, "shape")?.get)) {
      let l = o.shape;
      Object.defineProperty(o, "shape", {
        get: c(() => {
          let u = { ...l };
          return (Object.defineProperty(o, "shape", { value: u }), u);
        }, "get"),
      });
    }
    let a = cached(() => normalizeDef(o));
    defineLazy(e._zod, "propValues", () => {
      let l = o.shape,
        u = {};
      for (let p in l) {
        let f = l[p]._zod;
        if (f.values) {
          u[p] ?? (u[p] = new Set());
          for (let y of f.values) u[p].add(y);
        }
      }
      return u;
    });
    let n = isObject,
      r = o.catchall,
      s;
    e._zod.parse = (l, u) => {
      s ?? (s = a.value);
      let p = l.value;
      if (!n(p))
        return (l.issues.push({ expected: "object", code: "invalid_type", input: p, inst: e }), l);
      l.value = {};
      let f = [],
        y = s.shape;
      for (let v of s.keys) {
        let S = y[v],
          z = S._zod.optout === "optional",
          N = S._zod.run({ value: p[v], issues: [] }, u);
        N instanceof Promise ? f.push(N.then((Je) => handlePropertyResult(Je, l, v, p, z))) : handlePropertyResult(N, l, v, p, z);
      }
      return r ? handleCatchall(f, p, l, u, a.value, e) : f.length ? Promise.all(f).then(() => l) : l;
    };
  }),
  ga = $constructor("$ZodObjectJIT", (e, o) => {
    Tu.init(e, o);
    let i = e._zod.parse,
      a = cached(() => normalizeDef(o)),
      n = c((v) => {
        let S = new Jt(["shape", "payload", "ctx"]),
          z = a.value,
          N = c((ue) => {
            let J = esc(ue);
            return `shape[${J}]._zod.run({ value: input[${J}], issues: [] }, ctx)`;
          }, "parseStr");
        S.write("const input = payload.value;");
        let Je = Object.create(null),
          rf = 0;
        for (let ue of z.keys) Je[ue] = `key_${rf++}`;
        S.write("const newResult = {};");
        for (let ue of z.keys) {
          let J = Je[ue],
            ce = esc(ue),
            sf = v[ue]?._zod?.optout === "optional";
          (S.write(`const ${J} = ${N(ue)};`),
            sf
              ? S.write(`
        if (${J}.issues.length) {
          if (${ce} in input) {
            payload.issues = payload.issues.concat(${J}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${ce}, ...iss.path] : [${ce}]
            })));
          }
        }
        
        if (${J}.value === undefined) {
          if (${ce} in input) {
            newResult[${ce}] = undefined;
          }
        } else {
          newResult[${ce}] = ${J}.value;
        }
        
      `)
              : S.write(`
        if (${J}.issues.length) {
          payload.issues = payload.issues.concat(${J}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${ce}, ...iss.path] : [${ce}]
          })));
        }
        
        if (${J}.value === undefined) {
          if (${ce} in input) {
            newResult[${ce}] = undefined;
          }
        } else {
          newResult[${ce}] = ${J}.value;
        }
        
      `));
        }
        (S.write("payload.value = newResult;"), S.write("return payload;"));
        let af = S.compile();
        return (ue, J) => af(v, ue, J);
      }, "generateFastpass"),
      r,
      s = isObject,
      l = !Nt.jitless,
      p = l && Pr.value,
      f = o.catchall,
      y;
    e._zod.parse = (v, S) => {
      y ?? (y = a.value);
      let z = v.value;
      return s(z)
        ? l && p && S?.async === !1 && S.jitless !== !0
          ? (r || (r = n(o.shape)), (v = r(v, S)), f ? handleCatchall([], z, v, S, y, e) : v)
          : i(v, S)
        : (v.issues.push({ expected: "object", code: "invalid_type", input: z, inst: e }), v);
    };
  });
function handleUnionResults(e, o, i, a) {
  for (let r of e) if (r.issues.length === 0) return ((o.value = r.value), o);
  let n = e.filter((r) => !aborted(r));
  return n.length === 1
    ? ((o.value = n[0].value), n[0])
    : (o.issues.push({
        code: "invalid_union",
        input: o.value,
        inst: i,
        errors: e.map((r) => r.issues.map((s) => finalizeIssue(s, a, config()))),
      }),
      o);
}
c(handleUnionResults, "handleUnionResults");
var Xt = $constructor("$ZodUnion", (e, o) => {
  (T.init(e, o),
    defineLazy(e._zod, "optin", () =>
      o.options.some((n) => n._zod.optin === "optional") ? "optional" : void 0,
    ),
    defineLazy(e._zod, "optout", () =>
      o.options.some((n) => n._zod.optout === "optional") ? "optional" : void 0,
    ),
    defineLazy(e._zod, "values", () => {
      if (o.options.every((n) => n._zod.values))
        return new Set(o.options.flatMap((n) => Array.from(n._zod.values)));
    }),
    defineLazy(e._zod, "pattern", () => {
      if (o.options.every((n) => n._zod.pattern)) {
        let n = o.options.map((r) => r._zod.pattern);
        return new RegExp(`^(${n.map((r) => cleanRegex(r.source)).join("|")})$`);
      }
    }));
  let i = o.options.length === 1,
    a = o.options[0]._zod.run;
  e._zod.parse = (n, r) => {
    if (i) return a(n, r);
    let s = !1,
      l = [];
    for (let u of o.options) {
      let p = u._zod.run({ value: n.value, issues: [] }, r);
      if (p instanceof Promise) (l.push(p), (s = !0));
      else {
        if (p.issues.length === 0) return p;
        l.push(p);
      }
    }
    return s ? Promise.all(l).then((u) => handleUnionResults(u, n, e, r)) : handleUnionResults(l, n, e, r);
  };
});
function handleExclusiveUnionResults(e, o, i, a) {
  let n = e.filter((r) => r.issues.length === 0);
  return n.length === 1
    ? ((o.value = n[0].value), o)
    : (n.length === 0
        ? o.issues.push({
            code: "invalid_union",
            input: o.value,
            inst: i,
            errors: e.map((r) => r.issues.map((s) => finalizeIssue(s, a, config()))),
          })
        : o.issues.push({
            code: "invalid_union",
            input: o.value,
            inst: i,
            errors: [],
            inclusive: !1,
          }),
      o);
}
c(handleExclusiveUnionResults, "handleExclusiveUnionResults");
var fa = $constructor("$ZodXor", (e, o) => {
    (Xt.init(e, o), (o.inclusive = !1));
    let i = o.options.length === 1,
      a = o.options[0]._zod.run;
    e._zod.parse = (n, r) => {
      if (i) return a(n, r);
      let s = !1,
        l = [];
      for (let u of o.options) {
        let p = u._zod.run({ value: n.value, issues: [] }, r);
        p instanceof Promise ? (l.push(p), (s = !0)) : l.push(p);
      }
      return s ? Promise.all(l).then((u) => handleExclusiveUnionResults(u, n, e, r)) : handleExclusiveUnionResults(l, n, e, r);
    };
  }),
  ha = $constructor("$ZodDiscriminatedUnion", (e, o) => {
    ((o.inclusive = !1), Xt.init(e, o));
    let i = e._zod.parse;
    defineLazy(e._zod, "propValues", () => {
      let n = {};
      for (let r of o.options) {
        let s = r._zod.propValues;
        if (!s || Object.keys(s).length === 0)
          throw new Error(`Invalid discriminated union option at index "${o.options.indexOf(r)}"`);
        for (let [l, u] of Object.entries(s)) {
          n[l] || (n[l] = new Set());
          for (let p of u) n[l].add(p);
        }
      }
      return n;
    });
    let a = cached(() => {
      let n = o.options,
        r = new Map();
      for (let s of n) {
        let l = s._zod.propValues?.[o.discriminator];
        if (!l || l.size === 0)
          throw new Error(`Invalid discriminated union option at index "${o.options.indexOf(s)}"`);
        for (let u of l) {
          if (r.has(u)) throw new Error(`Duplicate discriminator value "${String(u)}"`);
          r.set(u, s);
        }
      }
      return r;
    });
    e._zod.parse = (n, r) => {
      let s = n.value;
      if (!isObject(s))
        return (n.issues.push({ code: "invalid_type", expected: "object", input: s, inst: e }), n);
      let l = a.value.get(s?.[o.discriminator]);
      return l
        ? l._zod.run(n, r)
        : o.unionFallback
          ? i(n, r)
          : (n.issues.push({
              code: "invalid_union",
              errors: [],
              note: "No matching discriminator",
              discriminator: o.discriminator,
              input: s,
              path: [o.discriminator],
              inst: e,
            }),
            n);
    };
  }),
  ya = $constructor("$ZodIntersection", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) => {
        let n = i.value,
          r = o.left._zod.run({ value: n, issues: [] }, a),
          s = o.right._zod.run({ value: n, issues: [] }, a);
        return r instanceof Promise || s instanceof Promise
          ? Promise.all([r, s]).then(([u, p]) => handleIntersectionResults(i, u, p))
          : handleIntersectionResults(i, r, s);
      }));
  });
function mergeValues(e, o) {
  if (e === o) return { valid: !0, data: e };
  if (e instanceof Date && o instanceof Date && +e == +o) return { valid: !0, data: e };
  if (isPlainObject(e) && isPlainObject(o)) {
    let i = Object.keys(o),
      a = Object.keys(e).filter((r) => i.indexOf(r) !== -1),
      n = { ...e, ...o };
    for (let r of a) {
      let s = mergeValues(e[r], o[r]);
      if (!s.valid) return { valid: !1, mergeErrorPath: [r, ...s.mergeErrorPath] };
      n[r] = s.data;
    }
    return { valid: !0, data: n };
  }
  if (Array.isArray(e) && Array.isArray(o)) {
    if (e.length !== o.length) return { valid: !1, mergeErrorPath: [] };
    let i = [];
    for (let a = 0; a < e.length; a++) {
      let n = e[a],
        r = o[a],
        s = mergeValues(n, r);
      if (!s.valid) return { valid: !1, mergeErrorPath: [a, ...s.mergeErrorPath] };
      i.push(s.data);
    }
    return { valid: !0, data: i };
  }
  return { valid: !1, mergeErrorPath: [] };
}
c(mergeValues, "mergeValues");
function handleIntersectionResults(e, o, i) {
  let a = new Map(),
    n;
  for (let l of o.issues)
    if (l.code === "unrecognized_keys") {
      n ?? (n = l);
      for (let u of l.keys) (a.has(u) || a.set(u, {}), (a.get(u).l = !0));
    } else e.issues.push(l);
  for (let l of i.issues)
    if (l.code === "unrecognized_keys")
      for (let u of l.keys) (a.has(u) || a.set(u, {}), (a.get(u).r = !0));
    else e.issues.push(l);
  let r = [...a].filter(([, l]) => l.l && l.r).map(([l]) => l);
  if ((r.length && n && e.issues.push({ ...n, keys: r }), aborted(e))) return e;
  let s = mergeValues(o.value, i.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return ((e.value = s.data), e);
}
c(handleIntersectionResults, "handleIntersectionResults");
var Xn = $constructor("$ZodTuple", (e, o) => {
  T.init(e, o);
  let i = o.items;
  e._zod.parse = (a, n) => {
    let r = a.value;
    if (!Array.isArray(r))
      return (a.issues.push({ input: r, inst: e, expected: "tuple", code: "invalid_type" }), a);
    a.value = [];
    let s = [],
      l = [...i].reverse().findIndex((f) => f._zod.optin !== "optional"),
      u = l === -1 ? 0 : i.length - l;
    if (!o.rest) {
      let f = r.length > i.length,
        y = r.length < u - 1;
      if (f || y)
        return (
          a.issues.push({
            ...(f
              ? { code: "too_big", maximum: i.length, inclusive: !0 }
              : { code: "too_small", minimum: i.length }),
            input: r,
            inst: e,
            origin: "array",
          }),
          a
        );
    }
    let p = -1;
    for (let f of i) {
      if ((p++, p >= r.length && p >= u)) continue;
      let y = f._zod.run({ value: r[p], issues: [] }, n);
      y instanceof Promise ? s.push(y.then((v) => handleTupleResult(v, a, p))) : handleTupleResult(y, a, p);
    }
    if (o.rest) {
      let f = r.slice(i.length);
      for (let y of f) {
        p++;
        let v = o.rest._zod.run({ value: y, issues: [] }, n);
        v instanceof Promise ? s.push(v.then((S) => handleTupleResult(S, a, p))) : handleTupleResult(v, a, p);
      }
    }
    return s.length ? Promise.all(s).then(() => a) : a;
  };
});
function handleTupleResult(e, o, i) {
  (e.issues.length && o.issues.push(...prefixIssues(i, e.issues)), (o.value[i] = e.value));
}
c(handleTupleResult, "handleTupleResult");
var ba = $constructor("$ZodRecord", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) => {
        let n = i.value;
        if (!isPlainObject(n))
          return (
            i.issues.push({ expected: "record", code: "invalid_type", input: n, inst: e }),
            i
          );
        let r = [],
          s = o.keyType._zod.values;
        if (s) {
          i.value = {};
          let l = new Set();
          for (let p of s)
            if (typeof p == "string" || typeof p == "number" || typeof p == "symbol") {
              l.add(typeof p == "number" ? p.toString() : p);
              let f = o.valueType._zod.run({ value: n[p], issues: [] }, a);
              f instanceof Promise
                ? r.push(
                    f.then((y) => {
                      (y.issues.length && i.issues.push(...prefixIssues(p, y.issues)),
                        (i.value[p] = y.value));
                    }),
                  )
                : (f.issues.length && i.issues.push(...prefixIssues(p, f.issues)), (i.value[p] = f.value));
            }
          let u;
          for (let p in n) l.has(p) || ((u = u ?? []), u.push(p));
          u &&
            u.length > 0 &&
            i.issues.push({ code: "unrecognized_keys", input: n, inst: e, keys: u });
        } else {
          i.value = {};
          for (let l of Reflect.ownKeys(n)) {
            if (l === "__proto__") continue;
            let u = o.keyType._zod.run({ value: l, issues: [] }, a);
            if (u instanceof Promise)
              throw new Error("Async schemas not supported in object keys currently");
            if (typeof l == "string" && Ln.test(l) && u.issues.length) {
              let y = o.keyType._zod.run({ value: Number(l), issues: [] }, a);
              if (y instanceof Promise)
                throw new Error("Async schemas not supported in object keys currently");
              y.issues.length === 0 && (u = y);
            }
            if (u.issues.length) {
              o.mode === "loose"
                ? (i.value[l] = n[l])
                : i.issues.push({
                    code: "invalid_key",
                    origin: "record",
                    issues: u.issues.map((y) => finalizeIssue(y, a, config())),
                    input: l,
                    path: [l],
                    inst: e,
                  });
              continue;
            }
            let f = o.valueType._zod.run({ value: n[l], issues: [] }, a);
            f instanceof Promise
              ? r.push(
                  f.then((y) => {
                    (y.issues.length && i.issues.push(...prefixIssues(l, y.issues)),
                      (i.value[u.value] = y.value));
                  }),
                )
              : (f.issues.length && i.issues.push(...prefixIssues(l, f.issues)),
                (i.value[u.value] = f.value));
          }
        }
        return r.length ? Promise.all(r).then(() => i) : i;
      }));
  }),
  va = $constructor("$ZodMap", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) => {
        let n = i.value;
        if (!(n instanceof Map))
          return (i.issues.push({ expected: "map", code: "invalid_type", input: n, inst: e }), i);
        let r = [];
        i.value = new Map();
        for (let [s, l] of n) {
          let u = o.keyType._zod.run({ value: s, issues: [] }, a),
            p = o.valueType._zod.run({ value: l, issues: [] }, a);
          u instanceof Promise || p instanceof Promise
            ? r.push(
                Promise.all([u, p]).then(([f, y]) => {
                  handleMapResult(f, y, i, s, n, e, a);
                }),
              )
            : handleMapResult(u, p, i, s, n, e, a);
        }
        return r.length ? Promise.all(r).then(() => i) : i;
      }));
  });
function handleMapResult(e, o, i, a, n, r, s) {
  (e.issues.length &&
    (Lt.has(typeof a)
      ? i.issues.push(...prefixIssues(a, e.issues))
      : i.issues.push({
          code: "invalid_key",
          origin: "map",
          input: n,
          inst: r,
          issues: e.issues.map((l) => finalizeIssue(l, s, config())),
        })),
    o.issues.length &&
      (Lt.has(typeof a)
        ? i.issues.push(...prefixIssues(a, o.issues))
        : i.issues.push({
            origin: "map",
            code: "invalid_element",
            input: n,
            inst: r,
            key: a,
            issues: o.issues.map((l) => finalizeIssue(l, s, config())),
          })),
    i.value.set(e.value, o.value));
}
c(handleMapResult, "handleMapResult");
var Sa = $constructor("$ZodSet", (e, o) => {
  (T.init(e, o),
    (e._zod.parse = (i, a) => {
      let n = i.value;
      if (!(n instanceof Set))
        return (i.issues.push({ input: n, inst: e, expected: "set", code: "invalid_type" }), i);
      let r = [];
      i.value = new Set();
      for (let s of n) {
        let l = o.valueType._zod.run({ value: s, issues: [] }, a);
        l instanceof Promise ? r.push(l.then((u) => handleSetResult(u, i))) : handleSetResult(l, i);
      }
      return r.length ? Promise.all(r).then(() => i) : i;
    }));
});
function handleSetResult(e, o) {
  (e.issues.length && o.issues.push(...e.issues), o.value.add(e.value));
}
c(handleSetResult, "handleSetResult");
var _a = $constructor("$ZodEnum", (e, o) => {
    T.init(e, o);
    let i = getEnumValues(o.entries),
      a = new Set(i);
    ((e._zod.values = a),
      (e._zod.pattern = new RegExp(
        `^(${i
          .filter((n) => Lt.has(typeof n))
          .map((n) => (typeof n == "string" ? escapeRegex(n) : n.toString()))
          .join("|")})$`,
      )),
      (e._zod.parse = (n, r) => {
        let s = n.value;
        return (
          a.has(s) || n.issues.push({ code: "invalid_value", values: i, input: s, inst: e }),
          n
        );
      }));
  }),
  xa = $constructor("$ZodLiteral", (e, o) => {
    if ((T.init(e, o), o.values.length === 0))
      throw new Error("Cannot create literal schema with no valid values");
    let i = new Set(o.values);
    ((e._zod.values = i),
      (e._zod.pattern = new RegExp(
        `^(${o.values.map((a) => (typeof a == "string" ? escapeRegex(a) : a ? escapeRegex(a.toString()) : String(a))).join("|")})$`,
      )),
      (e._zod.parse = (a, n) => {
        let r = a.value;
        return (
          i.has(r) || a.issues.push({ code: "invalid_value", values: o.values, input: r, inst: e }),
          a
        );
      }));
  }),
  ka = $constructor("$ZodFile", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) => {
        let n = i.value;
        return (
          n instanceof File ||
            i.issues.push({ expected: "file", code: "invalid_type", input: n, inst: e }),
          i
        );
      }));
  }),
  Ia = $constructor("$ZodTransform", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) => {
        if (a.direction === "backward") throw new Ie(e.constructor.name);
        let n = o.transform(i.value, i);
        if (a.async)
          return (n instanceof Promise ? n : Promise.resolve(n)).then((s) => ((i.value = s), i));
        if (n instanceof Promise) throw new le();
        return ((i.value = n), i);
      }));
  });
function handleOptionalResult(e, o) {
  return e.issues.length && o === void 0 ? { issues: [], value: void 0 } : e;
}
c(handleOptionalResult, "handleOptionalResult");
var Qn = $constructor("$ZodOptional", (e, o) => {
    (T.init(e, o),
      (e._zod.optin = "optional"),
      (e._zod.optout = "optional"),
      defineLazy(e._zod, "values", () =>
        o.innerType._zod.values ? new Set([...o.innerType._zod.values, void 0]) : void 0,
      ),
      defineLazy(e._zod, "pattern", () => {
        let i = o.innerType._zod.pattern;
        return i ? new RegExp(`^(${cleanRegex(i.source)})?$`) : void 0;
      }),
      (e._zod.parse = (i, a) => {
        if (o.innerType._zod.optin === "optional") {
          let n = o.innerType._zod.run(i, a);
          return n instanceof Promise ? n.then((r) => handleOptionalResult(r, i.value)) : handleOptionalResult(n, i.value);
        }
        return i.value === void 0 ? i : o.innerType._zod.run(i, a);
      }));
  }),
  Ca = $constructor("$ZodExactOptional", (e, o) => {
    (Qn.init(e, o),
      defineLazy(e._zod, "values", () => o.innerType._zod.values),
      defineLazy(e._zod, "pattern", () => o.innerType._zod.pattern),
      (e._zod.parse = (i, a) => o.innerType._zod.run(i, a)));
  }),
  Ra = $constructor("$ZodNullable", (e, o) => {
    (T.init(e, o),
      defineLazy(e._zod, "optin", () => o.innerType._zod.optin),
      defineLazy(e._zod, "optout", () => o.innerType._zod.optout),
      defineLazy(e._zod, "pattern", () => {
        let i = o.innerType._zod.pattern;
        return i ? new RegExp(`^(${cleanRegex(i.source)}|null)$`) : void 0;
      }),
      defineLazy(e._zod, "values", () =>
        o.innerType._zod.values ? new Set([...o.innerType._zod.values, null]) : void 0,
      ),
      (e._zod.parse = (i, a) => (i.value === null ? i : o.innerType._zod.run(i, a))));
  }),
  Pa = $constructor("$ZodDefault", (e, o) => {
    (T.init(e, o),
      (e._zod.optin = "optional"),
      defineLazy(e._zod, "values", () => o.innerType._zod.values),
      (e._zod.parse = (i, a) => {
        if (a.direction === "backward") return o.innerType._zod.run(i, a);
        if (i.value === void 0) return ((i.value = o.defaultValue), i);
        let n = o.innerType._zod.run(i, a);
        return n instanceof Promise ? n.then((r) => handleDefaultResult(r, o)) : handleDefaultResult(n, o);
      }));
  });
function handleDefaultResult(e, o) {
  return (e.value === void 0 && (e.value = o.defaultValue), e);
}
c(handleDefaultResult, "handleDefaultResult");
var Ta = $constructor("$ZodPrefault", (e, o) => {
    (T.init(e, o),
      (e._zod.optin = "optional"),
      defineLazy(e._zod, "values", () => o.innerType._zod.values),
      (e._zod.parse = (i, a) => (
        a.direction === "backward" || (i.value === void 0 && (i.value = o.defaultValue)),
        o.innerType._zod.run(i, a)
      )));
  }),
  wa = $constructor("$ZodNonOptional", (e, o) => {
    (T.init(e, o),
      defineLazy(e._zod, "values", () => {
        let i = o.innerType._zod.values;
        return i ? new Set([...i].filter((a) => a !== void 0)) : void 0;
      }),
      (e._zod.parse = (i, a) => {
        let n = o.innerType._zod.run(i, a);
        return n instanceof Promise ? n.then((r) => handleNonOptionalResult(r, e)) : handleNonOptionalResult(n, e);
      }));
  });
function handleNonOptionalResult(e, o) {
  return (
    !e.issues.length &&
      e.value === void 0 &&
      e.issues.push({ code: "invalid_type", expected: "nonoptional", input: e.value, inst: o }),
    e
  );
}
c(handleNonOptionalResult, "handleNonOptionalResult");
var Ea = $constructor("$ZodSuccess", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) => {
        if (a.direction === "backward") throw new Ie("ZodSuccess");
        let n = o.innerType._zod.run(i, a);
        return n instanceof Promise
          ? n.then((r) => ((i.value = r.issues.length === 0), i))
          : ((i.value = n.issues.length === 0), i);
      }));
  }),
  Oa = $constructor("$ZodCatch", (e, o) => {
    (T.init(e, o),
      defineLazy(e._zod, "optin", () => o.innerType._zod.optin),
      defineLazy(e._zod, "optout", () => o.innerType._zod.optout),
      defineLazy(e._zod, "values", () => o.innerType._zod.values),
      (e._zod.parse = (i, a) => {
        if (a.direction === "backward") return o.innerType._zod.run(i, a);
        let n = o.innerType._zod.run(i, a);
        return n instanceof Promise
          ? n.then(
              (r) => (
                (i.value = r.value),
                r.issues.length &&
                  ((i.value = o.catchValue({
                    ...i,
                    error: { issues: r.issues.map((s) => finalizeIssue(s, a, config())) },
                    input: i.value,
                  })),
                  (i.issues = [])),
                i
              ),
            )
          : ((i.value = n.value),
            n.issues.length &&
              ((i.value = o.catchValue({
                ...i,
                error: { issues: n.issues.map((r) => finalizeIssue(r, a, config())) },
                input: i.value,
              })),
              (i.issues = [])),
            i);
      }));
  }),
  Aa = $constructor("$ZodNaN", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) => (
        (typeof i.value != "number" || !Number.isNaN(i.value)) &&
          i.issues.push({ input: i.value, inst: e, expected: "nan", code: "invalid_type" }),
        i
      )));
  }),
  za = $constructor("$ZodPipe", (e, o) => {
    (T.init(e, o),
      defineLazy(e._zod, "values", () => o.in._zod.values),
      defineLazy(e._zod, "optin", () => o.in._zod.optin),
      defineLazy(e._zod, "optout", () => o.out._zod.optout),
      defineLazy(e._zod, "propValues", () => o.in._zod.propValues),
      (e._zod.parse = (i, a) => {
        if (a.direction === "backward") {
          let r = o.out._zod.run(i, a);
          return r instanceof Promise ? r.then((s) => handlePipeResult(s, o.in, a)) : handlePipeResult(r, o.in, a);
        }
        let n = o.in._zod.run(i, a);
        return n instanceof Promise ? n.then((r) => handlePipeResult(r, o.out, a)) : handlePipeResult(n, o.out, a);
      }));
  });
function handlePipeResult(e, o, i) {
  return e.issues.length
    ? ((e.aborted = !0), e)
    : o._zod.run({ value: e.value, issues: e.issues }, i);
}
c(handlePipeResult, "handlePipeResult");
var Qt = $constructor("$ZodCodec", (e, o) => {
  (T.init(e, o),
    defineLazy(e._zod, "values", () => o.in._zod.values),
    defineLazy(e._zod, "optin", () => o.in._zod.optin),
    defineLazy(e._zod, "optout", () => o.out._zod.optout),
    defineLazy(e._zod, "propValues", () => o.in._zod.propValues),
    (e._zod.parse = (i, a) => {
      if ((a.direction || "forward") === "forward") {
        let r = o.in._zod.run(i, a);
        return r instanceof Promise ? r.then((s) => handleCodecAResult(s, o, a)) : handleCodecAResult(r, o, a);
      } else {
        let r = o.out._zod.run(i, a);
        return r instanceof Promise ? r.then((s) => handleCodecAResult(s, o, a)) : handleCodecAResult(r, o, a);
      }
    }));
});
function handleCodecAResult(e, o, i) {
  if (e.issues.length) return ((e.aborted = !0), e);
  if ((i.direction || "forward") === "forward") {
    let n = o.transform(e.value, e);
    return n instanceof Promise ? n.then((r) => handleCodecTxResult(e, r, o.out, i)) : handleCodecTxResult(e, n, o.out, i);
  } else {
    let n = o.reverseTransform(e.value, e);
    return n instanceof Promise ? n.then((r) => handleCodecTxResult(e, r, o.in, i)) : handleCodecTxResult(e, n, o.in, i);
  }
}
c(handleCodecAResult, "handleCodecAResult");
function handleCodecTxResult(e, o, i, a) {
  return e.issues.length ? ((e.aborted = !0), e) : i._zod.run({ value: o, issues: e.issues }, a);
}
c(handleCodecTxResult, "handleCodecTxResult");
var Ma = $constructor("$ZodReadonly", (e, o) => {
  (T.init(e, o),
    defineLazy(e._zod, "propValues", () => o.innerType._zod.propValues),
    defineLazy(e._zod, "values", () => o.innerType._zod.values),
    defineLazy(e._zod, "optin", () => o.innerType?._zod?.optin),
    defineLazy(e._zod, "optout", () => o.innerType?._zod?.optout),
    (e._zod.parse = (i, a) => {
      if (a.direction === "backward") return o.innerType._zod.run(i, a);
      let n = o.innerType._zod.run(i, a);
      return n instanceof Promise ? n.then(handleReadonlyResult) : handleReadonlyResult(n);
    }));
});
function handleReadonlyResult(e) {
  return ((e.value = Object.freeze(e.value)), e);
}
c(handleReadonlyResult, "handleReadonlyResult");
var $a = $constructor("$ZodTemplateLiteral", (e, o) => {
    T.init(e, o);
    let i = [];
    for (let a of o.parts)
      if (typeof a == "object" && a !== null) {
        if (!a._zod.pattern)
          throw new Error(
            `Invalid template literal part, no pattern found: ${[...a._zod.traits].shift()}`,
          );
        let n = a._zod.pattern instanceof RegExp ? a._zod.pattern.source : a._zod.pattern;
        if (!n) throw new Error(`Invalid template literal part: ${a._zod.traits}`);
        let r = n.startsWith("^") ? 1 : 0,
          s = n.endsWith("$") ? n.length - 1 : n.length;
        i.push(n.slice(r, s));
      } else if (a === null || wr.has(typeof a)) i.push(escapeRegex(`${a}`));
      else throw new Error(`Invalid template literal part: ${a}`);
    ((e._zod.pattern = new RegExp(`^${i.join("")}$`)),
      (e._zod.parse = (a, n) =>
        typeof a.value != "string"
          ? (a.issues.push({ input: a.value, inst: e, expected: "string", code: "invalid_type" }),
            a)
          : ((e._zod.pattern.lastIndex = 0),
            e._zod.pattern.test(a.value) ||
              a.issues.push({
                input: a.value,
                inst: e,
                code: "invalid_format",
                format: o.format ?? "template_literal",
                pattern: e._zod.pattern.source,
              }),
            a)));
  }),
  Da = $constructor(
    "$ZodFunction",
    (e, o) => (
      T.init(e, o),
      (e._def = o),
      (e._zod.def = o),
      (e.implement = (i) => {
        if (typeof i != "function") throw new Error("implement() must be called with a function");
        return function (...a) {
          let n = e._def.input ? On(e._def.input, a) : a,
            r = Reflect.apply(i, this, n);
          return e._def.output ? On(e._def.output, r) : r;
        };
      }),
      (e.implementAsync = (i) => {
        if (typeof i != "function")
          throw new Error("implementAsync() must be called with a function");
        return async function (...a) {
          let n = e._def.input ? await An(e._def.input, a) : a,
            r = await Reflect.apply(i, this, n);
          return e._def.output ? await An(e._def.output, r) : r;
        };
      }),
      (e._zod.parse = (i, a) =>
        typeof i.value != "function"
          ? (i.issues.push({ code: "invalid_type", expected: "function", input: i.value, inst: e }),
            i)
          : (e._def.output && e._def.output._zod.def.type === "promise"
              ? (i.value = e.implementAsync(i.value))
              : (i.value = e.implement(i.value)),
            i)),
      (e.input = (...i) => {
        let a = e.constructor;
        return Array.isArray(i[0])
          ? new a({
              type: "function",
              input: new Xn({ type: "tuple", items: i[0], rest: i[1] }),
              output: e._def.output,
            })
          : new a({ type: "function", input: i[0], output: e._def.output });
      }),
      (e.output = (i) => {
        let a = e.constructor;
        return new a({ type: "function", input: e._def.input, output: i });
      }),
      e
    ),
  ),
  Ua = $constructor("$ZodPromise", (e, o) => {
    (T.init(e, o),
      (e._zod.parse = (i, a) =>
        Promise.resolve(i.value).then((n) => o.innerType._zod.run({ value: n, issues: [] }, a))));
  }),
  Na = $constructor("$ZodLazy", (e, o) => {
    (T.init(e, o),
      defineLazy(e._zod, "innerType", () => o.getter()),
      defineLazy(e._zod, "pattern", () => e._zod.innerType?._zod?.pattern),
      defineLazy(e._zod, "propValues", () => e._zod.innerType?._zod?.propValues),
      defineLazy(e._zod, "optin", () => e._zod.innerType?._zod?.optin ?? void 0),
      defineLazy(e._zod, "optout", () => e._zod.innerType?._zod?.optout ?? void 0),
      (e._zod.parse = (i, a) => e._zod.innerType._zod.run(i, a)));
  }),
  Za = $constructor("$ZodCustom", (e, o) => {
    (U.init(e, o),
      T.init(e, o),
      (e._zod.parse = (i, a) => i),
      (e._zod.check = (i) => {
        let a = i.value,
          n = o.fn(a);
        if (n instanceof Promise) return n.then((r) => handleRefineResult(r, i, a, e));
        handleRefineResult(n, i, a, e);
      }));
  });
function handleRefineResult(e, o, i, a) {
  if (!e) {
    let n = {
      code: "custom",
      input: i,
      inst: a,
      path: [...(a._zod.def.path ?? [])],
      continue: !a._zod.def.abort,
    };
    (a._zod.def.params && (n.params = a._zod.def.params), o.issues.push(issue(n)));
  }
}
c(handleRefineResult, "handleRefineResult");
var rn = {};
ye(rn, {
  ar: () => ja,
  az: () => Ba,
  be: () => La,
  bg: () => Wa,
  ca: () => Fa,
  cs: () => qa,
  da: () => Va,
  de: () => Ga,
  en: () => en,
  eo: () => Ka,
  es: () => Ha,
  fa: () => Ja,
  fi: () => Ya,
  fr: () => Xa,
  frCA: () => Qa,
  he: () => es,
  hu: () => ts,
  hy: () => ns,
  id: () => os,
  is: () => rs,
  it: () => is,
  ja: () => as,
  ka: () => ss,
  kh: () => cs,
  km: () => tn,
  ko: () => ls,
  lt: () => ds,
  mk: () => us,
  ms: () => ps,
  nl: () => ms,
  no: () => gs,
  ota: () => fs,
  pl: () => ys,
  ps: () => hs,
  pt: () => bs,
  ru: () => vs,
  sl: () => Ss,
  sv: () => _s,
  ta: () => xs,
  th: () => ks,
  tr: () => Is,
  ua: () => Cs,
  uk: () => on,
  ur: () => Rs,
  uz: () => Ps,
  vi: () => Ts,
  yo: () => Os,
  zhCN: () => ws,
  zhTW: () => Es,
});
var bh = c(() => {
  let e = {
    string: { unit: "\u062D\u0631\u0641", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    file: { unit: "\u0628\u0627\u064A\u062A", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    array: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    set: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 instanceof ${n.expected}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${l}`
          : `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${r}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${stringifyPrimitive(n.values[0])}`
          : `\u0627\u062E\u062A\u064A\u0627\u0631 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062A\u0648\u0642\u0639 \u0627\u0646\u062A\u0642\u0627\u0621 \u0623\u062D\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A: ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? ` \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${n.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${r} ${n.maximum.toString()} ${s.unit ?? "\u0639\u0646\u0635\u0631"}`
          : `\u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${n.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${r} ${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${n.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${r} ${n.minimum.toString()} ${s.unit}`
          : `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${n.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${r} ${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0628\u062F\u0623 \u0628\u0640 "${n.prefix}"`
          : r.format === "ends_with"
            ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0646\u062A\u0647\u064A \u0628\u0640 "${r.suffix}"`
            : r.format === "includes"
              ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0636\u0645\u0651\u064E\u0646 "${r.includes}"`
              : r.format === "regex"
                ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0637\u0627\u0628\u0642 \u0627\u0644\u0646\u0645\u0637 ${r.pattern}`
                : `${i[r.format] ?? n.format} \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644`;
      }
      case "not_multiple_of":
        return `\u0631\u0642\u0645 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0646 \u0645\u0636\u0627\u0639\u0641\u0627\u062A ${n.divisor}`;
      case "unrecognized_keys":
        return `\u0645\u0639\u0631\u0641${n.keys.length > 1 ? "\u0627\u062A" : ""} \u063A\u0631\u064A\u0628${n.keys.length > 1 ? "\u0629" : ""}: ${joinValues(n.keys, "\u060C ")}`;
      case "invalid_key":
        return `\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${n.origin}`;
      case "invalid_union":
        return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
      case "invalid_element":
        return `\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${n.origin}`;
      default:
        return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
    }
  };
}, "error");
function ja() {
  return { localeError: bh() };
}
c(ja, "default");
var vh = c(() => {
  let e = {
    string: { unit: "simvol", verb: "olmal\u0131d\u0131r" },
    file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
    array: { unit: "element", verb: "olmal\u0131d\u0131r" },
    set: { unit: "element", verb: "olmal\u0131d\u0131r" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n instanceof ${n.expected}, daxil olan ${l}`
          : `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${r}, daxil olan ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${stringifyPrimitive(n.values[0])}`
          : `Yanl\u0131\u015F se\xE7im: a\u015Fa\u011F\u0131dak\u0131lardan biri olmal\u0131d\u0131r: ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${n.origin ?? "d\u0259y\u0259r"} ${r}${n.maximum.toString()} ${s.unit ?? "element"}`
          : `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${n.origin ?? "d\u0259y\u0259r"} ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${n.origin} ${r}${n.minimum.toString()} ${s.unit}`
          : `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${n.origin} ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Yanl\u0131\u015F m\u0259tn: "${r.prefix}" il\u0259 ba\u015Flamal\u0131d\u0131r`
          : r.format === "ends_with"
            ? `Yanl\u0131\u015F m\u0259tn: "${r.suffix}" il\u0259 bitm\u0259lidir`
            : r.format === "includes"
              ? `Yanl\u0131\u015F m\u0259tn: "${r.includes}" daxil olmal\u0131d\u0131r`
              : r.format === "regex"
                ? `Yanl\u0131\u015F m\u0259tn: ${r.pattern} \u015Fablonuna uy\u011Fun olmal\u0131d\u0131r`
                : `Yanl\u0131\u015F ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Yanl\u0131\u015F \u0259d\u0259d: ${n.divisor} il\u0259 b\xF6l\xFCn\u0259 bil\u0259n olmal\u0131d\u0131r`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan a\xE7ar${n.keys.length > 1 ? "lar" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} daxilind\u0259 yanl\u0131\u015F a\xE7ar`;
      case "invalid_union":
        return "Yanl\u0131\u015F d\u0259y\u0259r";
      case "invalid_element":
        return `${n.origin} daxilind\u0259 yanl\u0131\u015F d\u0259y\u0259r`;
      default:
        return "Yanl\u0131\u015F d\u0259y\u0259r";
    }
  };
}, "error");
function Ba() {
  return { localeError: vh() };
}
c(Ba, "default");
function getBelarusianPlural(e, o, i, a) {
  let n = Math.abs(e),
    r = n % 10,
    s = n % 100;
  return s >= 11 && s <= 19 ? a : r === 1 ? o : r >= 2 && r <= 4 ? i : a;
}
c(getBelarusianPlural, "getBelarusianPlural");
var Sh = c(() => {
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
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F instanceof ${n.expected}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${l}`
          : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F ${r}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F ${stringifyPrimitive(n.values[0])}`
          : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0432\u0430\u0440\u044B\u044F\u043D\u0442: \u0447\u0430\u043A\u0430\u045E\u0441\u044F \u0430\u0434\u0437\u0456\u043D \u0437 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.maximum),
            u = getBelarusianPlural(l, s.unit.one, s.unit.few, s.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${s.verb} ${r}${n.maximum.toString()} ${u}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.minimum),
            u = getBelarusianPlural(l, s.unit.one, s.unit.few, s.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${n.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${s.verb} ${r}${n.minimum.toString()} ${u}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${n.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u043F\u0430\u0447\u044B\u043D\u0430\u0446\u0446\u0430 \u0437 "${r.prefix}"`
          : r.format === "ends_with"
            ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u0430\u043A\u0430\u043D\u0447\u0432\u0430\u0446\u0446\u0430 \u043D\u0430 "${r.suffix}"`
            : r.format === "includes"
              ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u043C\u044F\u0448\u0447\u0430\u0446\u044C "${r.includes}"`
              : r.format === "regex"
                ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0430\u0434\u043F\u0430\u0432\u044F\u0434\u0430\u0446\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${r.pattern}`
                : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043B\u0456\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0431\u044B\u0446\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${n.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0441\u043F\u0430\u0437\u043D\u0430\u043D\u044B ${n.keys.length > 1 ? "\u043A\u043B\u044E\u0447\u044B" : "\u043A\u043B\u044E\u0447"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043A\u043B\u044E\u0447 \u0443 ${n.origin}`;
      case "invalid_union":
        return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434";
      case "invalid_element":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u0430\u0435 \u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435 \u045E ${n.origin}`;
      default:
        return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434";
    }
  };
}, "error");
function La() {
  return { localeError: Sh() };
}
c(La, "default");
var _h = c(() => {
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
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D instanceof ${n.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${l}`
          : `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${r}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${stringifyPrimitive(n.values[0])}`
          : `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u043E\u043F\u0446\u0438\u044F: \u043E\u0447\u0430\u043A\u0432\u0430\u043D\u043E \u0435\u0434\u043D\u043E \u043E\u0442 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${n.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${r}${n.maximum.toString()} ${s.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430"}`
          : `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${n.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0431\u044A\u0434\u0435 ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${n.origin} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${r}${n.minimum.toString()} ${s.unit}`
          : `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${n.origin} \u0434\u0430 \u0431\u044A\u0434\u0435 ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        if (r.format === "starts_with")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u0432\u0430 \u0441 "${r.prefix}"`;
        if (r.format === "ends_with")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u0432\u044A\u0440\u0448\u0432\u0430 \u0441 "${r.suffix}"`;
        if (r.format === "includes")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0432\u043A\u043B\u044E\u0447\u0432\u0430 "${r.includes}"`;
        if (r.format === "regex")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0441\u044A\u0432\u043F\u0430\u0434\u0430 \u0441 ${r.pattern}`;
        let s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D";
        return (
          r.format === "emoji" && (s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          r.format === "datetime" && (s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          r.format === "date" && (s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430"),
          r.format === "time" && (s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          r.format === "duration" && (s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430"),
          `${s} ${i[r.format] ?? n.format}`
        );
      }
      case "not_multiple_of":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E \u0447\u0438\u0441\u043B\u043E: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0431\u044A\u0434\u0435 \u043A\u0440\u0430\u0442\u043D\u043E \u043D\u0430 ${n.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0437\u043F\u043E\u0437\u043D\u0430\u0442${n.keys.length > 1 ? "\u0438" : ""} \u043A\u043B\u044E\u0447${n.keys.length > 1 ? "\u043E\u0432\u0435" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043A\u043B\u044E\u0447 \u0432 ${n.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434";
      case "invalid_element":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442 \u0432 ${n.origin}`;
      default:
        return "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434";
    }
  };
}, "error");
function Wa() {
  return { localeError: _h() };
}
c(Wa, "default");
var xh = c(() => {
  let e = {
    string: { unit: "car\xE0cters", verb: "contenir" },
    file: { unit: "bytes", verb: "contenir" },
    array: { unit: "elements", verb: "contenir" },
    set: { unit: "elements", verb: "contenir" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Tipus inv\xE0lid: s'esperava instanceof ${n.expected}, s'ha rebut ${l}`
          : `Tipus inv\xE0lid: s'esperava ${r}, s'ha rebut ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Valor inv\xE0lid: s'esperava ${stringifyPrimitive(n.values[0])}`
          : `Opci\xF3 inv\xE0lida: s'esperava una de ${joinValues(n.values, " o ")}`;
      case "too_big": {
        let r = n.inclusive ? "com a m\xE0xim" : "menys de",
          s = getSizing(n.origin);
        return s
          ? `Massa gran: s'esperava que ${n.origin ?? "el valor"} contingu\xE9s ${r} ${n.maximum.toString()} ${s.unit ?? "elements"}`
          : `Massa gran: s'esperava que ${n.origin ?? "el valor"} fos ${r} ${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? "com a m\xEDnim" : "m\xE9s de",
          s = getSizing(n.origin);
        return s
          ? `Massa petit: s'esperava que ${n.origin} contingu\xE9s ${r} ${n.minimum.toString()} ${s.unit}`
          : `Massa petit: s'esperava que ${n.origin} fos ${r} ${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Format inv\xE0lid: ha de comen\xE7ar amb "${r.prefix}"`
          : r.format === "ends_with"
            ? `Format inv\xE0lid: ha d'acabar amb "${r.suffix}"`
            : r.format === "includes"
              ? `Format inv\xE0lid: ha d'incloure "${r.includes}"`
              : r.format === "regex"
                ? `Format inv\xE0lid: ha de coincidir amb el patr\xF3 ${r.pattern}`
                : `Format inv\xE0lid per a ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE0lid: ha de ser m\xFAltiple de ${n.divisor}`;
      case "unrecognized_keys":
        return `Clau${n.keys.length > 1 ? "s" : ""} no reconeguda${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Clau inv\xE0lida a ${n.origin}`;
      case "invalid_union":
        return "Entrada inv\xE0lida";
      case "invalid_element":
        return `Element inv\xE0lid a ${n.origin}`;
      default:
        return "Entrada inv\xE0lida";
    }
  };
}, "error");
function Fa() {
  return { localeError: xh() };
}
c(Fa, "default");
var kh = c(() => {
  let e = {
    string: { unit: "znak\u016F", verb: "m\xEDt" },
    file: { unit: "bajt\u016F", verb: "m\xEDt" },
    array: { unit: "prvk\u016F", verb: "m\xEDt" },
    set: { unit: "prvk\u016F", verb: "m\xEDt" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no instanceof ${n.expected}, obdr\u017Eeno ${l}`
          : `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${r}, obdr\u017Eeno ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${stringifyPrimitive(n.values[0])}`
          : `Neplatn\xE1 mo\u017Enost: o\u010Dek\xE1v\xE1na jedna z hodnot ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${n.origin ?? "hodnota"} mus\xED m\xEDt ${r}${n.maximum.toString()} ${s.unit ?? "prvk\u016F"}`
          : `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${n.origin ?? "hodnota"} mus\xED b\xFDt ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${n.origin ?? "hodnota"} mus\xED m\xEDt ${r}${n.minimum.toString()} ${s.unit ?? "prvk\u016F"}`
          : `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${n.origin ?? "hodnota"} mus\xED b\xFDt ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED za\u010D\xEDnat na "${r.prefix}"`
          : r.format === "ends_with"
            ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED kon\u010Dit na "${r.suffix}"`
            : r.format === "includes"
              ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED obsahovat "${r.includes}"`
              : r.format === "regex"
                ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED odpov\xEDdat vzoru ${r.pattern}`
                : `Neplatn\xFD form\xE1t ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Neplatn\xE9 \u010D\xEDslo: mus\xED b\xFDt n\xE1sobkem ${n.divisor}`;
      case "unrecognized_keys":
        return `Nezn\xE1m\xE9 kl\xED\u010De: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Neplatn\xFD kl\xED\u010D v ${n.origin}`;
      case "invalid_union":
        return "Neplatn\xFD vstup";
      case "invalid_element":
        return `Neplatn\xE1 hodnota v ${n.origin}`;
      default:
        return "Neplatn\xFD vstup";
    }
  };
}, "error");
function qa() {
  return { localeError: kh() };
}
c(qa, "default");
var Ih = c(() => {
  let e = {
    string: { unit: "tegn", verb: "havde" },
    file: { unit: "bytes", verb: "havde" },
    array: { unit: "elementer", verb: "indeholdt" },
    set: { unit: "elementer", verb: "indeholdt" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ugyldigt input: forventede instanceof ${n.expected}, fik ${l}`
          : `Ugyldigt input: forventede ${r}, fik ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ugyldig v\xE6rdi: forventede ${stringifyPrimitive(n.values[0])}`
          : `Ugyldigt valg: forventede en af f\xF8lgende ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin),
          l = a[n.origin] ?? n.origin;
        return s
          ? `For stor: forventede ${l ?? "value"} ${s.verb} ${r} ${n.maximum.toString()} ${s.unit ?? "elementer"}`
          : `For stor: forventede ${l ?? "value"} havde ${r} ${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin),
          l = a[n.origin] ?? n.origin;
        return s
          ? `For lille: forventede ${l} ${s.verb} ${r} ${n.minimum.toString()} ${s.unit}`
          : `For lille: forventede ${l} havde ${r} ${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Ugyldig streng: skal starte med "${r.prefix}"`
          : r.format === "ends_with"
            ? `Ugyldig streng: skal ende med "${r.suffix}"`
            : r.format === "includes"
              ? `Ugyldig streng: skal indeholde "${r.includes}"`
              : r.format === "regex"
                ? `Ugyldig streng: skal matche m\xF8nsteret ${r.pattern}`
                : `Ugyldig ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ugyldigt tal: skal v\xE6re deleligt med ${n.divisor}`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "Ukendte n\xF8gler" : "Ukendt n\xF8gle"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Ugyldig n\xF8gle i ${n.origin}`;
      case "invalid_union":
        return "Ugyldigt input: matcher ingen af de tilladte typer";
      case "invalid_element":
        return `Ugyldig v\xE6rdi i ${n.origin}`;
      default:
        return "Ugyldigt input";
    }
  };
}, "error");
function Va() {
  return { localeError: Ih() };
}
c(Va, "default");
var Ch = c(() => {
  let e = {
    string: { unit: "Zeichen", verb: "zu haben" },
    file: { unit: "Bytes", verb: "zu haben" },
    array: { unit: "Elemente", verb: "zu haben" },
    set: { unit: "Elemente", verb: "zu haben" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ung\xFCltige Eingabe: erwartet instanceof ${n.expected}, erhalten ${l}`
          : `Ung\xFCltige Eingabe: erwartet ${r}, erhalten ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ung\xFCltige Eingabe: erwartet ${stringifyPrimitive(n.values[0])}`
          : `Ung\xFCltige Option: erwartet eine von ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Zu gro\xDF: erwartet, dass ${n.origin ?? "Wert"} ${r}${n.maximum.toString()} ${s.unit ?? "Elemente"} hat`
          : `Zu gro\xDF: erwartet, dass ${n.origin ?? "Wert"} ${r}${n.maximum.toString()} ist`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Zu klein: erwartet, dass ${n.origin} ${r}${n.minimum.toString()} ${s.unit} hat`
          : `Zu klein: erwartet, dass ${n.origin} ${r}${n.minimum.toString()} ist`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Ung\xFCltiger String: muss mit "${r.prefix}" beginnen`
          : r.format === "ends_with"
            ? `Ung\xFCltiger String: muss mit "${r.suffix}" enden`
            : r.format === "includes"
              ? `Ung\xFCltiger String: muss "${r.includes}" enthalten`
              : r.format === "regex"
                ? `Ung\xFCltiger String: muss dem Muster ${r.pattern} entsprechen`
                : `Ung\xFCltig: ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ung\xFCltige Zahl: muss ein Vielfaches von ${n.divisor} sein`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "Unbekannte Schl\xFCssel" : "Unbekannter Schl\xFCssel"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Ung\xFCltiger Schl\xFCssel in ${n.origin}`;
      case "invalid_union":
        return "Ung\xFCltige Eingabe";
      case "invalid_element":
        return `Ung\xFCltiger Wert in ${n.origin}`;
      default:
        return "Ung\xFCltige Eingabe";
    }
  };
}, "error");
function Ga() {
  return { localeError: Ch() };
}
c(Ga, "default");
var Rh = c(() => {
  let e = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" },
    map: { unit: "entries", verb: "to have" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return `Invalid input: expected ${r}, received ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Invalid input: expected ${stringifyPrimitive(n.values[0])}`
          : `Invalid option: expected one of ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Too big: expected ${n.origin ?? "value"} to have ${r}${n.maximum.toString()} ${s.unit ?? "elements"}`
          : `Too big: expected ${n.origin ?? "value"} to be ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Too small: expected ${n.origin} to have ${r}${n.minimum.toString()} ${s.unit}`
          : `Too small: expected ${n.origin} to be ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Invalid string: must start with "${r.prefix}"`
          : r.format === "ends_with"
            ? `Invalid string: must end with "${r.suffix}"`
            : r.format === "includes"
              ? `Invalid string: must include "${r.includes}"`
              : r.format === "regex"
                ? `Invalid string: must match pattern ${r.pattern}`
                : `Invalid ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${n.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${n.origin}`;
      case "invalid_union":
        return "Invalid input";
      case "invalid_element":
        return `Invalid value in ${n.origin}`;
      default:
        return "Invalid input";
    }
  };
}, "error");
function en() {
  return { localeError: Rh() };
}
c(en, "default");
var Ph = c(() => {
  let e = {
    string: { unit: "karaktrojn", verb: "havi" },
    file: { unit: "bajtojn", verb: "havi" },
    array: { unit: "elementojn", verb: "havi" },
    set: { unit: "elementojn", verb: "havi" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Nevalida enigo: atendi\u011Dis instanceof ${n.expected}, ricevi\u011Dis ${l}`
          : `Nevalida enigo: atendi\u011Dis ${r}, ricevi\u011Dis ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Nevalida enigo: atendi\u011Dis ${stringifyPrimitive(n.values[0])}`
          : `Nevalida opcio: atendi\u011Dis unu el ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Tro granda: atendi\u011Dis ke ${n.origin ?? "valoro"} havu ${r}${n.maximum.toString()} ${s.unit ?? "elementojn"}`
          : `Tro granda: atendi\u011Dis ke ${n.origin ?? "valoro"} havu ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Tro malgranda: atendi\u011Dis ke ${n.origin} havu ${r}${n.minimum.toString()} ${s.unit}`
          : `Tro malgranda: atendi\u011Dis ke ${n.origin} estu ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Nevalida karaktraro: devas komenci\u011Di per "${r.prefix}"`
          : r.format === "ends_with"
            ? `Nevalida karaktraro: devas fini\u011Di per "${r.suffix}"`
            : r.format === "includes"
              ? `Nevalida karaktraro: devas inkluzivi "${r.includes}"`
              : r.format === "regex"
                ? `Nevalida karaktraro: devas kongrui kun la modelo ${r.pattern}`
                : `Nevalida ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Nevalida nombro: devas esti oblo de ${n.divisor}`;
      case "unrecognized_keys":
        return `Nekonata${n.keys.length > 1 ? "j" : ""} \u015Dlosilo${n.keys.length > 1 ? "j" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Nevalida \u015Dlosilo en ${n.origin}`;
      case "invalid_union":
        return "Nevalida enigo";
      case "invalid_element":
        return `Nevalida valoro en ${n.origin}`;
      default:
        return "Nevalida enigo";
    }
  };
}, "error");
function Ka() {
  return { localeError: Ph() };
}
c(Ka, "default");
var Th = c(() => {
  let e = {
    string: { unit: "caracteres", verb: "tener" },
    file: { unit: "bytes", verb: "tener" },
    array: { unit: "elementos", verb: "tener" },
    set: { unit: "elementos", verb: "tener" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Entrada inv\xE1lida: se esperaba instanceof ${n.expected}, recibido ${l}`
          : `Entrada inv\xE1lida: se esperaba ${r}, recibido ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Entrada inv\xE1lida: se esperaba ${stringifyPrimitive(n.values[0])}`
          : `Opci\xF3n inv\xE1lida: se esperaba una de ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin),
          l = a[n.origin] ?? n.origin;
        return s
          ? `Demasiado grande: se esperaba que ${l ?? "valor"} tuviera ${r}${n.maximum.toString()} ${s.unit ?? "elementos"}`
          : `Demasiado grande: se esperaba que ${l ?? "valor"} fuera ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin),
          l = a[n.origin] ?? n.origin;
        return s
          ? `Demasiado peque\xF1o: se esperaba que ${l} tuviera ${r}${n.minimum.toString()} ${s.unit}`
          : `Demasiado peque\xF1o: se esperaba que ${l} fuera ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Cadena inv\xE1lida: debe comenzar con "${r.prefix}"`
          : r.format === "ends_with"
            ? `Cadena inv\xE1lida: debe terminar en "${r.suffix}"`
            : r.format === "includes"
              ? `Cadena inv\xE1lida: debe incluir "${r.includes}"`
              : r.format === "regex"
                ? `Cadena inv\xE1lida: debe coincidir con el patr\xF3n ${r.pattern}`
                : `Inv\xE1lido ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE1lido: debe ser m\xFAltiplo de ${n.divisor}`;
      case "unrecognized_keys":
        return `Llave${n.keys.length > 1 ? "s" : ""} desconocida${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Llave inv\xE1lida en ${a[n.origin] ?? n.origin}`;
      case "invalid_union":
        return "Entrada inv\xE1lida";
      case "invalid_element":
        return `Valor inv\xE1lido en ${a[n.origin] ?? n.origin}`;
      default:
        return "Entrada inv\xE1lida";
    }
  };
}, "error");
function Ha() {
  return { localeError: Th() };
}
c(Ha, "default");
var wh = c(() => {
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
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A instanceof ${n.expected} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${l} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`
          : `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${r} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${l} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${stringifyPrimitive(n.values[0])} \u0645\u06CC\u200C\u0628\u0648\u062F`
          : `\u06AF\u0632\u06CC\u0646\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A \u06CC\u06A9\u06CC \u0627\u0632 ${joinValues(n.values, "|")} \u0645\u06CC\u200C\u0628\u0648\u062F`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${n.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${r}${n.maximum.toString()} ${s.unit ?? "\u0639\u0646\u0635\u0631"} \u0628\u0627\u0634\u062F`
          : `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${n.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${r}${n.maximum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${n.origin} \u0628\u0627\u06CC\u062F ${r}${n.minimum.toString()} ${s.unit} \u0628\u0627\u0634\u062F`
          : `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${n.origin} \u0628\u0627\u06CC\u062F ${r}${n.minimum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${r.prefix}" \u0634\u0631\u0648\u0639 \u0634\u0648\u062F`
          : r.format === "ends_with"
            ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${r.suffix}" \u062A\u0645\u0627\u0645 \u0634\u0648\u062F`
            : r.format === "includes"
              ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0634\u0627\u0645\u0644 "${r.includes}" \u0628\u0627\u0634\u062F`
              : r.format === "regex"
                ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 \u0627\u0644\u06AF\u0648\u06CC ${r.pattern} \u0645\u0637\u0627\u0628\u0642\u062A \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F`
                : `${i[r.format] ?? n.format} \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
      }
      case "not_multiple_of":
        return `\u0639\u062F\u062F \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0645\u0636\u0631\u0628 ${n.divisor} \u0628\u0627\u0634\u062F`;
      case "unrecognized_keys":
        return `\u06A9\u0644\u06CC\u062F${n.keys.length > 1 ? "\u0647\u0627\u06CC" : ""} \u0646\u0627\u0634\u0646\u0627\u0633: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u06A9\u0644\u06CC\u062F \u0646\u0627\u0634\u0646\u0627\u0633 \u062F\u0631 ${n.origin}`;
      case "invalid_union":
        return "\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631";
      case "invalid_element":
        return `\u0645\u0642\u062F\u0627\u0631 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u062F\u0631 ${n.origin}`;
      default:
        return "\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631";
    }
  };
}, "error");
function Ja() {
  return { localeError: wh() };
}
c(Ja, "default");
var Eh = c(() => {
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
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Virheellinen tyyppi: odotettiin instanceof ${n.expected}, oli ${l}`
          : `Virheellinen tyyppi: odotettiin ${r}, oli ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Virheellinen sy\xF6te: t\xE4ytyy olla ${stringifyPrimitive(n.values[0])}`
          : `Virheellinen valinta: t\xE4ytyy olla yksi seuraavista: ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Liian suuri: ${s.subject} t\xE4ytyy olla ${r}${n.maximum.toString()} ${s.unit}`.trim()
          : `Liian suuri: arvon t\xE4ytyy olla ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Liian pieni: ${s.subject} t\xE4ytyy olla ${r}${n.minimum.toString()} ${s.unit}`.trim()
          : `Liian pieni: arvon t\xE4ytyy olla ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Virheellinen sy\xF6te: t\xE4ytyy alkaa "${r.prefix}"`
          : r.format === "ends_with"
            ? `Virheellinen sy\xF6te: t\xE4ytyy loppua "${r.suffix}"`
            : r.format === "includes"
              ? `Virheellinen sy\xF6te: t\xE4ytyy sis\xE4lt\xE4\xE4 "${r.includes}"`
              : r.format === "regex"
                ? `Virheellinen sy\xF6te: t\xE4ytyy vastata s\xE4\xE4nn\xF6llist\xE4 lauseketta ${r.pattern}`
                : `Virheellinen ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Virheellinen luku: t\xE4ytyy olla luvun ${n.divisor} monikerta`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${joinValues(n.keys, ", ")}`;
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
function Ya() {
  return { localeError: Eh() };
}
c(Ya, "default");
var Oh = c(() => {
  let e = {
    string: { unit: "caract\xE8res", verb: "avoir" },
    file: { unit: "octets", verb: "avoir" },
    array: { unit: "\xE9l\xE9ments", verb: "avoir" },
    set: { unit: "\xE9l\xE9ments", verb: "avoir" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Entr\xE9e invalide : instanceof ${n.expected} attendu, ${l} re\xE7u`
          : `Entr\xE9e invalide : ${r} attendu, ${l} re\xE7u`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Entr\xE9e invalide : ${stringifyPrimitive(n.values[0])} attendu`
          : `Option invalide : une valeur parmi ${joinValues(n.values, "|")} attendue`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Trop grand : ${n.origin ?? "valeur"} doit ${s.verb} ${r}${n.maximum.toString()} ${s.unit ?? "\xE9l\xE9ment(s)"}`
          : `Trop grand : ${n.origin ?? "valeur"} doit \xEAtre ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Trop petit : ${n.origin} doit ${s.verb} ${r}${n.minimum.toString()} ${s.unit}`
          : `Trop petit : ${n.origin} doit \xEAtre ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Cha\xEEne invalide : doit commencer par "${r.prefix}"`
          : r.format === "ends_with"
            ? `Cha\xEEne invalide : doit se terminer par "${r.suffix}"`
            : r.format === "includes"
              ? `Cha\xEEne invalide : doit inclure "${r.includes}"`
              : r.format === "regex"
                ? `Cha\xEEne invalide : doit correspondre au mod\xE8le ${r.pattern}`
                : `${i[r.format] ?? n.format} invalide`;
      }
      case "not_multiple_of":
        return `Nombre invalide : doit \xEAtre un multiple de ${n.divisor}`;
      case "unrecognized_keys":
        return `Cl\xE9${n.keys.length > 1 ? "s" : ""} non reconnue${n.keys.length > 1 ? "s" : ""} : ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Cl\xE9 invalide dans ${n.origin}`;
      case "invalid_union":
        return "Entr\xE9e invalide";
      case "invalid_element":
        return `Valeur invalide dans ${n.origin}`;
      default:
        return "Entr\xE9e invalide";
    }
  };
}, "error");
function Xa() {
  return { localeError: Oh() };
}
c(Xa, "default");
var Ah = c(() => {
  let e = {
    string: { unit: "caract\xE8res", verb: "avoir" },
    file: { unit: "octets", verb: "avoir" },
    array: { unit: "\xE9l\xE9ments", verb: "avoir" },
    set: { unit: "\xE9l\xE9ments", verb: "avoir" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Entr\xE9e invalide : attendu instanceof ${n.expected}, re\xE7u ${l}`
          : `Entr\xE9e invalide : attendu ${r}, re\xE7u ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Entr\xE9e invalide : attendu ${stringifyPrimitive(n.values[0])}`
          : `Option invalide : attendu l'une des valeurs suivantes ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "\u2264" : "<",
          s = getSizing(n.origin);
        return s
          ? `Trop grand : attendu que ${n.origin ?? "la valeur"} ait ${r}${n.maximum.toString()} ${s.unit}`
          : `Trop grand : attendu que ${n.origin ?? "la valeur"} soit ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? "\u2265" : ">",
          s = getSizing(n.origin);
        return s
          ? `Trop petit : attendu que ${n.origin} ait ${r}${n.minimum.toString()} ${s.unit}`
          : `Trop petit : attendu que ${n.origin} soit ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Cha\xEEne invalide : doit commencer par "${r.prefix}"`
          : r.format === "ends_with"
            ? `Cha\xEEne invalide : doit se terminer par "${r.suffix}"`
            : r.format === "includes"
              ? `Cha\xEEne invalide : doit inclure "${r.includes}"`
              : r.format === "regex"
                ? `Cha\xEEne invalide : doit correspondre au motif ${r.pattern}`
                : `${i[r.format] ?? n.format} invalide`;
      }
      case "not_multiple_of":
        return `Nombre invalide : doit \xEAtre un multiple de ${n.divisor}`;
      case "unrecognized_keys":
        return `Cl\xE9${n.keys.length > 1 ? "s" : ""} non reconnue${n.keys.length > 1 ? "s" : ""} : ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Cl\xE9 invalide dans ${n.origin}`;
      case "invalid_union":
        return "Entr\xE9e invalide";
      case "invalid_element":
        return `Valeur invalide dans ${n.origin}`;
      default:
        return "Entr\xE9e invalide";
    }
  };
}, "error");
function Qa() {
  return { localeError: Ah() };
}
c(Qa, "default");
var zh = c(() => {
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
    o = {
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
    i = c((p) => (p ? e[p] : void 0), "typeEntry"),
    a = c((p) => {
      let f = i(p);
      return f ? f.label : (p ?? e.unknown.label);
    }, "typeLabel"),
    n = c((p) => `\u05D4${a(p)}`, "withDefinite"),
    r = c(
      (p) =>
        (i(p)?.gender ?? "m") === "f"
          ? "\u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05D9\u05D5\u05EA"
          : "\u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA",
      "verbFor",
    ),
    s = c((p) => (p ? (o[p] ?? null) : null), "getSizing"),
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
    u = { nan: "NaN" };
  return (p) => {
    switch (p.code) {
      case "invalid_type": {
        let f = p.expected,
          y = u[f ?? ""] ?? a(f),
          v = parsedType(p.input),
          S = u[v] ?? e[v]?.label ?? v;
        return /^[A-Z]/.test(p.expected)
          ? `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA instanceof ${p.expected}, \u05D4\u05EA\u05E7\u05D1\u05DC ${S}`
          : `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${y}, \u05D4\u05EA\u05E7\u05D1\u05DC ${S}`;
      }
      case "invalid_value": {
        if (p.values.length === 1)
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05E2\u05E8\u05DA \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA ${stringifyPrimitive(p.values[0])}`;
        let f = p.values.map((S) => stringifyPrimitive(S));
        if (p.values.length === 2)
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${f[0]} \u05D0\u05D5 ${f[1]}`;
        let y = f[f.length - 1];
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${f.slice(0, -1).join(", ")} \u05D0\u05D5 ${y}`;
      }
      case "too_big": {
        let f = s(p.origin),
          y = n(p.origin ?? "value");
        if (p.origin === "string")
          return `${f?.longLabel ?? "\u05D0\u05E8\u05D5\u05DA"} \u05DE\u05D3\u05D9: ${y} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${p.maximum.toString()} ${f?.unit ?? ""} ${p.inclusive ? "\u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA" : "\u05DC\u05DB\u05DC \u05D4\u05D9\u05D5\u05EA\u05E8"}`.trim();
        if (p.origin === "number") {
          let z = p.inclusive
            ? `\u05E7\u05D8\u05DF \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${p.maximum}`
            : `\u05E7\u05D8\u05DF \u05DE-${p.maximum}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${y} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${z}`;
        }
        if (p.origin === "array" || p.origin === "set") {
          let z =
              p.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA",
            N = p.inclusive
              ? `${p.maximum} ${f?.unit ?? ""} \u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA`
              : `\u05E4\u05D7\u05D5\u05EA \u05DE-${p.maximum} ${f?.unit ?? ""}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${y} ${z} \u05DC\u05D4\u05DB\u05D9\u05DC ${N}`.trim();
        }
        let v = p.inclusive ? "<=" : "<",
          S = r(p.origin ?? "value");
        return f?.unit
          ? `${f.longLabel} \u05DE\u05D3\u05D9: ${y} ${S} ${v}${p.maximum.toString()} ${f.unit}`
          : `${f?.longLabel ?? "\u05D2\u05D3\u05D5\u05DC"} \u05DE\u05D3\u05D9: ${y} ${S} ${v}${p.maximum.toString()}`;
      }
      case "too_small": {
        let f = s(p.origin),
          y = n(p.origin ?? "value");
        if (p.origin === "string")
          return `${f?.shortLabel ?? "\u05E7\u05E6\u05E8"} \u05DE\u05D3\u05D9: ${y} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${p.minimum.toString()} ${f?.unit ?? ""} ${p.inclusive ? "\u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8" : "\u05DC\u05E4\u05D7\u05D5\u05EA"}`.trim();
        if (p.origin === "number") {
          let z = p.inclusive
            ? `\u05D2\u05D3\u05D5\u05DC \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${p.minimum}`
            : `\u05D2\u05D3\u05D5\u05DC \u05DE-${p.minimum}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${y} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${z}`;
        }
        if (p.origin === "array" || p.origin === "set") {
          let z =
            p.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
          if (p.minimum === 1 && p.inclusive) {
            let Je =
              (p.origin === "set",
              "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3");
            return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${y} ${z} \u05DC\u05D4\u05DB\u05D9\u05DC ${Je}`;
          }
          let N = p.inclusive
            ? `${p.minimum} ${f?.unit ?? ""} \u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8`
            : `\u05D9\u05D5\u05EA\u05E8 \u05DE-${p.minimum} ${f?.unit ?? ""}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${y} ${z} \u05DC\u05D4\u05DB\u05D9\u05DC ${N}`.trim();
        }
        let v = p.inclusive ? ">=" : ">",
          S = r(p.origin ?? "value");
        return f?.unit
          ? `${f.shortLabel} \u05DE\u05D3\u05D9: ${y} ${S} ${v}${p.minimum.toString()} ${f.unit}`
          : `${f?.shortLabel ?? "\u05E7\u05D8\u05DF"} \u05DE\u05D3\u05D9: ${y} ${S} ${v}${p.minimum.toString()}`;
      }
      case "invalid_format": {
        let f = p;
        if (f.format === "starts_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC \u05D1 "${f.prefix}"`;
        if (f.format === "ends_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD \u05D1 "${f.suffix}"`;
        if (f.format === "includes")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05DB\u05DC\u05D5\u05DC "${f.includes}"`;
        if (f.format === "regex")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D0\u05D9\u05DD \u05DC\u05EA\u05D1\u05E0\u05D9\u05EA ${f.pattern}`;
        let y = l[f.format],
          v = y?.label ?? f.format,
          z =
            (y?.gender ?? "m") === "f"
              ? "\u05EA\u05E7\u05D9\u05E0\u05D4"
              : "\u05EA\u05E7\u05D9\u05DF";
        return `${v} \u05DC\u05D0 ${z}`;
      }
      case "not_multiple_of":
        return `\u05DE\u05E1\u05E4\u05E8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DE\u05DB\u05E4\u05DC\u05D4 \u05E9\u05DC ${p.divisor}`;
      case "unrecognized_keys":
        return `\u05DE\u05E4\u05EA\u05D7${p.keys.length > 1 ? "\u05D5\u05EA" : ""} \u05DC\u05D0 \u05DE\u05D6\u05D5\u05D4${p.keys.length > 1 ? "\u05D9\u05DD" : "\u05D4"}: ${joinValues(p.keys, ", ")}`;
      case "invalid_key":
        return "\u05E9\u05D3\u05D4 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8";
      case "invalid_union":
        return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
      case "invalid_element":
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1${n(p.origin ?? "array")}`;
      default:
        return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
    }
  };
}, "error");
function es() {
  return { localeError: zh() };
}
c(es, "default");
var Mh = c(() => {
  let e = {
    string: { unit: "karakter", verb: "legyen" },
    file: { unit: "byte", verb: "legyen" },
    array: { unit: "elem", verb: "legyen" },
    set: { unit: "elem", verb: "legyen" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k instanceof ${n.expected}, a kapott \xE9rt\xE9k ${l}`
          : `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${r}, a kapott \xE9rt\xE9k ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${stringifyPrimitive(n.values[0])}`
          : `\xC9rv\xE9nytelen opci\xF3: valamelyik \xE9rt\xE9k v\xE1rt ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `T\xFAl nagy: ${n.origin ?? "\xE9rt\xE9k"} m\xE9rete t\xFAl nagy ${r}${n.maximum.toString()} ${s.unit ?? "elem"}`
          : `T\xFAl nagy: a bemeneti \xE9rt\xE9k ${n.origin ?? "\xE9rt\xE9k"} t\xFAl nagy: ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${n.origin} m\xE9rete t\xFAl kicsi ${r}${n.minimum.toString()} ${s.unit}`
          : `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${n.origin} t\xFAl kicsi ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\xC9rv\xE9nytelen string: "${r.prefix}" \xE9rt\xE9kkel kell kezd\u0151dnie`
          : r.format === "ends_with"
            ? `\xC9rv\xE9nytelen string: "${r.suffix}" \xE9rt\xE9kkel kell v\xE9gz\u0151dnie`
            : r.format === "includes"
              ? `\xC9rv\xE9nytelen string: "${r.includes}" \xE9rt\xE9ket kell tartalmaznia`
              : r.format === "regex"
                ? `\xC9rv\xE9nytelen string: ${r.pattern} mint\xE1nak kell megfelelnie`
                : `\xC9rv\xE9nytelen ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\xC9rv\xE9nytelen sz\xE1m: ${n.divisor} t\xF6bbsz\xF6r\xF6s\xE9nek kell lennie`;
      case "unrecognized_keys":
        return `Ismeretlen kulcs${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\xC9rv\xE9nytelen kulcs ${n.origin}`;
      case "invalid_union":
        return "\xC9rv\xE9nytelen bemenet";
      case "invalid_element":
        return `\xC9rv\xE9nytelen \xE9rt\xE9k: ${n.origin}`;
      default:
        return "\xC9rv\xE9nytelen bemenet";
    }
  };
}, "error");
function ts() {
  return { localeError: Mh() };
}
c(ts, "default");
function getArmenianPlural(e, o, i) {
  return Math.abs(e) === 1 ? o : i;
}
c(getArmenianPlural, "getArmenianPlural");
function withDefiniteArticle(e) {
  if (!e) return "";
  let o = ["\u0561", "\u0565", "\u0568", "\u056B", "\u0578", "\u0578\u0582", "\u0585"],
    i = e[e.length - 1];
  return e + (o.includes(i) ? "\u0576" : "\u0568");
}
c(withDefiniteArticle, "withDefiniteArticle");
var $h = c(() => {
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
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 instanceof ${n.expected}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${l}`
          : `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${r}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${stringifyPrimitive(n.values[1])}`
          : `\u054D\u056D\u0561\u056C \u057F\u0561\u0580\u0562\u0565\u0580\u0561\u056F\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 \u0570\u0565\u057F\u0587\u0575\u0561\u056C\u0576\u0565\u0580\u056B\u0581 \u0574\u0565\u056F\u0568\u055D ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.maximum),
            u = getArmenianPlural(l, s.unit.one, s.unit.many);
          return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(n.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${r}${n.maximum.toString()} ${u}`;
        }
        return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(n.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056C\u056B\u0576\u056B ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.minimum),
            u = getArmenianPlural(l, s.unit.one, s.unit.many);
          return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(n.origin)} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${r}${n.minimum.toString()} ${u}`;
        }
        return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(n.origin)} \u056C\u056B\u0576\u056B ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057D\u056F\u057D\u057E\u056B "${r.prefix}"-\u0578\u057E`
          : r.format === "ends_with"
            ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0561\u057E\u0561\u0580\u057F\u057E\u056B "${r.suffix}"-\u0578\u057E`
            : r.format === "includes"
              ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057A\u0561\u0580\u0578\u0582\u0576\u0561\u056F\u056B "${r.includes}"`
              : r.format === "regex"
                ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0570\u0561\u0574\u0561\u057A\u0561\u057F\u0561\u057D\u056D\u0561\u0576\u056B ${r.pattern} \u0571\u0587\u0561\u0579\u0561\u0583\u056B\u0576`
                : `\u054D\u056D\u0561\u056C ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u054D\u056D\u0561\u056C \u0569\u056B\u057E\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0562\u0561\u0566\u0574\u0561\u057A\u0561\u057F\u056B\u056F \u056C\u056B\u0576\u056B ${n.divisor}-\u056B`;
      case "unrecognized_keys":
        return `\u0549\u0573\u0561\u0576\u0561\u0579\u057E\u0561\u056E \u0562\u0561\u0576\u0561\u056C\u056B${n.keys.length > 1 ? "\u0576\u0565\u0580" : ""}. ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u054D\u056D\u0561\u056C \u0562\u0561\u0576\u0561\u056C\u056B ${withDefiniteArticle(n.origin)}-\u0578\u0582\u0574`;
      case "invalid_union":
        return "\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574";
      case "invalid_element":
        return `\u054D\u056D\u0561\u056C \u0561\u0580\u056A\u0565\u0584 ${withDefiniteArticle(n.origin)}-\u0578\u0582\u0574`;
      default:
        return "\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574";
    }
  };
}, "error");
function ns() {
  return { localeError: $h() };
}
c(ns, "default");
var Dh = c(() => {
  let e = {
    string: { unit: "karakter", verb: "memiliki" },
    file: { unit: "byte", verb: "memiliki" },
    array: { unit: "item", verb: "memiliki" },
    set: { unit: "item", verb: "memiliki" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Input tidak valid: diharapkan instanceof ${n.expected}, diterima ${l}`
          : `Input tidak valid: diharapkan ${r}, diterima ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Input tidak valid: diharapkan ${stringifyPrimitive(n.values[0])}`
          : `Pilihan tidak valid: diharapkan salah satu dari ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Terlalu besar: diharapkan ${n.origin ?? "value"} memiliki ${r}${n.maximum.toString()} ${s.unit ?? "elemen"}`
          : `Terlalu besar: diharapkan ${n.origin ?? "value"} menjadi ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Terlalu kecil: diharapkan ${n.origin} memiliki ${r}${n.minimum.toString()} ${s.unit}`
          : `Terlalu kecil: diharapkan ${n.origin} menjadi ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `String tidak valid: harus dimulai dengan "${r.prefix}"`
          : r.format === "ends_with"
            ? `String tidak valid: harus berakhir dengan "${r.suffix}"`
            : r.format === "includes"
              ? `String tidak valid: harus menyertakan "${r.includes}"`
              : r.format === "regex"
                ? `String tidak valid: harus sesuai pola ${r.pattern}`
                : `${i[r.format] ?? n.format} tidak valid`;
      }
      case "not_multiple_of":
        return `Angka tidak valid: harus kelipatan dari ${n.divisor}`;
      case "unrecognized_keys":
        return `Kunci tidak dikenali ${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Kunci tidak valid di ${n.origin}`;
      case "invalid_union":
        return "Input tidak valid";
      case "invalid_element":
        return `Nilai tidak valid di ${n.origin}`;
      default:
        return "Input tidak valid";
    }
  };
}, "error");
function os() {
  return { localeError: Dh() };
}
c(os, "default");
var Uh = c(() => {
  let e = {
    string: { unit: "stafi", verb: "a\xF0 hafa" },
    file: { unit: "b\xE6ti", verb: "a\xF0 hafa" },
    array: { unit: "hluti", verb: "a\xF0 hafa" },
    set: { unit: "hluti", verb: "a\xF0 hafa" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Rangt gildi: \xDE\xFA sl\xF3st inn ${l} \xFEar sem \xE1 a\xF0 vera instanceof ${n.expected}`
          : `Rangt gildi: \xDE\xFA sl\xF3st inn ${l} \xFEar sem \xE1 a\xF0 vera ${r}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Rangt gildi: gert r\xE1\xF0 fyrir ${stringifyPrimitive(n.values[0])}`
          : `\xD3gilt val: m\xE1 vera eitt af eftirfarandi ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${n.origin ?? "gildi"} hafi ${r}${n.maximum.toString()} ${s.unit ?? "hluti"}`
          : `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${n.origin ?? "gildi"} s\xE9 ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${n.origin} hafi ${r}${n.minimum.toString()} ${s.unit}`
          : `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${n.origin} s\xE9 ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\xD3gildur strengur: ver\xF0ur a\xF0 byrja \xE1 "${r.prefix}"`
          : r.format === "ends_with"
            ? `\xD3gildur strengur: ver\xF0ur a\xF0 enda \xE1 "${r.suffix}"`
            : r.format === "includes"
              ? `\xD3gildur strengur: ver\xF0ur a\xF0 innihalda "${r.includes}"`
              : r.format === "regex"
                ? `\xD3gildur strengur: ver\xF0ur a\xF0 fylgja mynstri ${r.pattern}`
                : `Rangt ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `R\xF6ng tala: ver\xF0ur a\xF0 vera margfeldi af ${n.divisor}`;
      case "unrecognized_keys":
        return `\xD3\xFEekkt ${n.keys.length > 1 ? "ir lyklar" : "ur lykill"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Rangur lykill \xED ${n.origin}`;
      case "invalid_union":
        return "Rangt gildi";
      case "invalid_element":
        return `Rangt gildi \xED ${n.origin}`;
      default:
        return "Rangt gildi";
    }
  };
}, "error");
function rs() {
  return { localeError: Uh() };
}
c(rs, "default");
var Nh = c(() => {
  let e = {
    string: { unit: "caratteri", verb: "avere" },
    file: { unit: "byte", verb: "avere" },
    array: { unit: "elementi", verb: "avere" },
    set: { unit: "elementi", verb: "avere" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Input non valido: atteso instanceof ${n.expected}, ricevuto ${l}`
          : `Input non valido: atteso ${r}, ricevuto ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Input non valido: atteso ${stringifyPrimitive(n.values[0])}`
          : `Opzione non valida: atteso uno tra ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Troppo grande: ${n.origin ?? "valore"} deve avere ${r}${n.maximum.toString()} ${s.unit ?? "elementi"}`
          : `Troppo grande: ${n.origin ?? "valore"} deve essere ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Troppo piccolo: ${n.origin} deve avere ${r}${n.minimum.toString()} ${s.unit}`
          : `Troppo piccolo: ${n.origin} deve essere ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Stringa non valida: deve iniziare con "${r.prefix}"`
          : r.format === "ends_with"
            ? `Stringa non valida: deve terminare con "${r.suffix}"`
            : r.format === "includes"
              ? `Stringa non valida: deve includere "${r.includes}"`
              : r.format === "regex"
                ? `Stringa non valida: deve corrispondere al pattern ${r.pattern}`
                : `Invalid ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Numero non valido: deve essere un multiplo di ${n.divisor}`;
      case "unrecognized_keys":
        return `Chiav${n.keys.length > 1 ? "i" : "e"} non riconosciut${n.keys.length > 1 ? "e" : "a"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Chiave non valida in ${n.origin}`;
      case "invalid_union":
        return "Input non valido";
      case "invalid_element":
        return `Valore non valido in ${n.origin}`;
      default:
        return "Input non valido";
    }
  };
}, "error");
function is() {
  return { localeError: Nh() };
}
c(is, "default");
var Zh = c(() => {
  let e = {
    string: { unit: "\u6587\u5B57", verb: "\u3067\u3042\u308B" },
    file: { unit: "\u30D0\u30A4\u30C8", verb: "\u3067\u3042\u308B" },
    array: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
    set: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u7121\u52B9\u306A\u5165\u529B: instanceof ${n.expected}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${l}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`
          : `\u7121\u52B9\u306A\u5165\u529B: ${r}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${l}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u7121\u52B9\u306A\u5165\u529B: ${stringifyPrimitive(n.values[0])}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F`
          : `\u7121\u52B9\u306A\u9078\u629E: ${joinValues(n.values, "\u3001")}\u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      case "too_big": {
        let r = n.inclusive ? "\u4EE5\u4E0B\u3067\u3042\u308B" : "\u3088\u308A\u5C0F\u3055\u3044",
          s = getSizing(n.origin);
        return s
          ? `\u5927\u304D\u3059\u304E\u308B\u5024: ${n.origin ?? "\u5024"}\u306F${n.maximum.toString()}${s.unit ?? "\u8981\u7D20"}${r}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : `\u5927\u304D\u3059\u304E\u308B\u5024: ${n.origin ?? "\u5024"}\u306F${n.maximum.toString()}${r}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "too_small": {
        let r = n.inclusive ? "\u4EE5\u4E0A\u3067\u3042\u308B" : "\u3088\u308A\u5927\u304D\u3044",
          s = getSizing(n.origin);
        return s
          ? `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${n.origin}\u306F${n.minimum.toString()}${s.unit}${r}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${n.origin}\u306F${n.minimum.toString()}${r}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${r.prefix}"\u3067\u59CB\u307E\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : r.format === "ends_with"
            ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${r.suffix}"\u3067\u7D42\u308F\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
            : r.format === "includes"
              ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${r.includes}"\u3092\u542B\u3080\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
              : r.format === "regex"
                ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: \u30D1\u30BF\u30FC\u30F3${r.pattern}\u306B\u4E00\u81F4\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
                : `\u7121\u52B9\u306A${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u7121\u52B9\u306A\u6570\u5024: ${n.divisor}\u306E\u500D\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      case "unrecognized_keys":
        return `\u8A8D\u8B58\u3055\u308C\u3066\u3044\u306A\u3044\u30AD\u30FC${n.keys.length > 1 ? "\u7FA4" : ""}: ${joinValues(n.keys, "\u3001")}`;
      case "invalid_key":
        return `${n.origin}\u5185\u306E\u7121\u52B9\u306A\u30AD\u30FC`;
      case "invalid_union":
        return "\u7121\u52B9\u306A\u5165\u529B";
      case "invalid_element":
        return `${n.origin}\u5185\u306E\u7121\u52B9\u306A\u5024`;
      default:
        return "\u7121\u52B9\u306A\u5165\u529B";
    }
  };
}, "error");
function as() {
  return { localeError: Zh() };
}
c(as, "default");
var jh = c(() => {
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
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 instanceof ${n.expected}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${l}`
          : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${r}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${stringifyPrimitive(n.values[0])}`
          : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D0\u10E0\u10D8\u10D0\u10DC\u10E2\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8\u10D0 \u10D4\u10E0\u10D7-\u10D4\u10E0\u10D7\u10D8 ${joinValues(n.values, "|")}-\u10D3\u10D0\u10DC`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${n.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} ${s.verb} ${r}${n.maximum.toString()} ${s.unit}`
          : `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${n.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} \u10D8\u10E7\u10DD\u10E1 ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${n.origin} ${s.verb} ${r}${n.minimum.toString()} ${s.unit}`
          : `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${n.origin} \u10D8\u10E7\u10DD\u10E1 ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10EC\u10E7\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${r.prefix}"-\u10D8\u10D7`
          : r.format === "ends_with"
            ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10DB\u10D7\u10D0\u10D5\u10E0\u10D3\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${r.suffix}"-\u10D8\u10D7`
            : r.format === "includes"
              ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1 "${r.includes}"-\u10E1`
              : r.format === "regex"
                ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D4\u10E1\u10D0\u10D1\u10D0\u10DB\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 \u10E8\u10D0\u10D1\u10DA\u10DD\u10DC\u10E1 ${r.pattern}`
                : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E0\u10D8\u10EA\u10EE\u10D5\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 ${n.divisor}-\u10D8\u10E1 \u10EF\u10D4\u10E0\u10D0\u10D3\u10D8`;
      case "unrecognized_keys":
        return `\u10E3\u10EA\u10DC\u10DD\u10D1\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1${n.keys.length > 1 ? "\u10D4\u10D1\u10D8" : "\u10D8"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1\u10D8 ${n.origin}-\u10E8\u10D8`;
      case "invalid_union":
        return "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0";
      case "invalid_element":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0 ${n.origin}-\u10E8\u10D8`;
      default:
        return "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0";
    }
  };
}, "error");
function ss() {
  return { localeError: jh() };
}
c(ss, "default");
var Bh = c(() => {
  let e = {
    string: {
      unit: "\u178F\u17BD\u17A2\u1780\u17D2\u179F\u179A",
      verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793",
    },
    file: { unit: "\u1794\u17C3", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    array: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    set: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A instanceof ${n.expected} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${l}`
          : `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${r} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${stringifyPrimitive(n.values[0])}`
          : `\u1787\u1798\u17D2\u179A\u17BE\u179F\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1787\u17B6\u1798\u17BD\u1799\u1780\u17D2\u1793\u17BB\u1784\u1785\u17C6\u178E\u17C4\u1798 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${n.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${r} ${n.maximum.toString()} ${s.unit ?? "\u1792\u17B6\u178F\u17BB"}`
          : `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${n.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${r} ${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${n.origin} ${r} ${n.minimum.toString()} ${s.unit}`
          : `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${n.origin} ${r} ${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u178A\u17C4\u1799 "${r.prefix}"`
          : r.format === "ends_with"
            ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1794\u1789\u17D2\u1785\u1794\u17CB\u178A\u17C4\u1799 "${r.suffix}"`
            : r.format === "includes"
              ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1798\u17B6\u1793 "${r.includes}"`
              : r.format === "regex"
                ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1795\u17D2\u1782\u17BC\u1795\u17D2\u1782\u1784\u1793\u17B9\u1784\u1791\u1798\u17D2\u179A\u1784\u17CB\u178A\u17C2\u179B\u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB ${r.pattern}`
                : `\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u179B\u17C1\u1781\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1787\u17B6\u1796\u17A0\u17BB\u1782\u17BB\u178E\u1793\u17C3 ${n.divisor}`;
      case "unrecognized_keys":
        return `\u179A\u1780\u1783\u17BE\u1789\u179F\u17C4\u1798\u17B7\u1793\u179F\u17D2\u1782\u17B6\u179B\u17CB\u17D6 ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u179F\u17C4\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${n.origin}`;
      case "invalid_union":
        return "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C";
      case "invalid_element":
        return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${n.origin}`;
      default:
        return "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C";
    }
  };
}, "error");
function tn() {
  return { localeError: Bh() };
}
c(tn, "default");
function cs() {
  return tn();
}
c(cs, "default");
var Lh = c(() => {
  let e = {
    string: { unit: "\uBB38\uC790", verb: "to have" },
    file: { unit: "\uBC14\uC774\uD2B8", verb: "to have" },
    array: { unit: "\uAC1C", verb: "to have" },
    set: { unit: "\uAC1C", verb: "to have" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 instanceof ${n.expected}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${l}\uC785\uB2C8\uB2E4`
          : `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 ${r}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${l}\uC785\uB2C8\uB2E4`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\uC798\uBABB\uB41C \uC785\uB825: \uAC12\uC740 ${stringifyPrimitive(n.values[0])} \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4`
          : `\uC798\uBABB\uB41C \uC635\uC158: ${joinValues(n.values, "\uB610\uB294 ")} \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
      case "too_big": {
        let r = n.inclusive ? "\uC774\uD558" : "\uBBF8\uB9CC",
          s =
            r === "\uBBF8\uB9CC"
              ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4"
              : "\uC5EC\uC57C \uD569\uB2C8\uB2E4",
          l = getSizing(n.origin),
          u = l?.unit ?? "\uC694\uC18C";
        return l
          ? `${n.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${n.maximum.toString()}${u} ${r}${s}`
          : `${n.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${n.maximum.toString()} ${r}${s}`;
      }
      case "too_small": {
        let r = n.inclusive ? "\uC774\uC0C1" : "\uCD08\uACFC",
          s =
            r === "\uC774\uC0C1"
              ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4"
              : "\uC5EC\uC57C \uD569\uB2C8\uB2E4",
          l = getSizing(n.origin),
          u = l?.unit ?? "\uC694\uC18C";
        return l
          ? `${n.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${n.minimum.toString()}${u} ${r}${s}`
          : `${n.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${n.minimum.toString()} ${r}${s}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${r.prefix}"(\uC73C)\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4`
          : r.format === "ends_with"
            ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${r.suffix}"(\uC73C)\uB85C \uB05D\uB098\uC57C \uD569\uB2C8\uB2E4`
            : r.format === "includes"
              ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${r.includes}"\uC744(\uB97C) \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4`
              : r.format === "regex"
                ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: \uC815\uADDC\uC2DD ${r.pattern} \uD328\uD134\uACFC \uC77C\uCE58\uD574\uC57C \uD569\uB2C8\uB2E4`
                : `\uC798\uBABB\uB41C ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\uC798\uBABB\uB41C \uC22B\uC790: ${n.divisor}\uC758 \uBC30\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
      case "unrecognized_keys":
        return `\uC778\uC2DD\uD560 \uC218 \uC5C6\uB294 \uD0A4: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\uC798\uBABB\uB41C \uD0A4: ${n.origin}`;
      case "invalid_union":
        return "\uC798\uBABB\uB41C \uC785\uB825";
      case "invalid_element":
        return `\uC798\uBABB\uB41C \uAC12: ${n.origin}`;
      default:
        return "\uC798\uBABB\uB41C \uC785\uB825";
    }
  };
}, "error");
function ls() {
  return { localeError: Lh() };
}
c(ls, "default");
var nn = c((e) => e.charAt(0).toUpperCase() + e.slice(1), "capitalizeFirstCharacter");
function getUnitTypeFromNumber(e) {
  let o = Math.abs(e),
    i = o % 10,
    a = o % 100;
  return (a >= 11 && a <= 19) || i === 0 ? "many" : i === 1 ? "one" : "few";
}
c(getUnitTypeFromNumber, "getUnitTypeFromNumber");
var Wh = c(() => {
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
  function getSizing(n, r, s, l) {
    let u = e[n] ?? null;
    return u === null ? u : { unit: u.unit[r], verb: u.verb[l][s ? "inclusive" : "notInclusive"] };
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Gautas tipas ${l}, o tik\u0117tasi - instanceof ${n.expected}`
          : `Gautas tipas ${l}, o tik\u0117tasi - ${r}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Privalo b\u016Bti ${stringifyPrimitive(n.values[0])}`
          : `Privalo b\u016Bti vienas i\u0161 ${joinValues(n.values, "|")} pasirinkim\u0173`;
      case "too_big": {
        let r = a[n.origin] ?? n.origin,
          s = getSizing(n.origin, getUnitTypeFromNumber(Number(n.maximum)), n.inclusive ?? !1, "smaller");
        if (s?.verb)
          return `${nn(r ?? n.origin ?? "reik\u0161m\u0117")} ${s.verb} ${n.maximum.toString()} ${s.unit ?? "element\u0173"}`;
        let l = n.inclusive ? "ne didesnis kaip" : "ma\u017Eesnis kaip";
        return `${nn(r ?? n.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${l} ${n.maximum.toString()} ${s?.unit}`;
      }
      case "too_small": {
        let r = a[n.origin] ?? n.origin,
          s = getSizing(n.origin, getUnitTypeFromNumber(Number(n.minimum)), n.inclusive ?? !1, "bigger");
        if (s?.verb)
          return `${nn(r ?? n.origin ?? "reik\u0161m\u0117")} ${s.verb} ${n.minimum.toString()} ${s.unit ?? "element\u0173"}`;
        let l = n.inclusive ? "ne ma\u017Eesnis kaip" : "didesnis kaip";
        return `${nn(r ?? n.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${l} ${n.minimum.toString()} ${s?.unit}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Eilut\u0117 privalo prasid\u0117ti "${r.prefix}"`
          : r.format === "ends_with"
            ? `Eilut\u0117 privalo pasibaigti "${r.suffix}"`
            : r.format === "includes"
              ? `Eilut\u0117 privalo \u012Ftraukti "${r.includes}"`
              : r.format === "regex"
                ? `Eilut\u0117 privalo atitikti ${r.pattern}`
                : `Neteisingas ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Skai\u010Dius privalo b\u016Bti ${n.divisor} kartotinis.`;
      case "unrecognized_keys":
        return `Neatpa\u017Eint${n.keys.length > 1 ? "i" : "as"} rakt${n.keys.length > 1 ? "ai" : "as"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return "Rastas klaidingas raktas";
      case "invalid_union":
        return "Klaidinga \u012Fvestis";
      case "invalid_element": {
        let r = a[n.origin] ?? n.origin;
        return `${nn(r ?? n.origin ?? "reik\u0161m\u0117")} turi klaiding\u0105 \u012Fvest\u012F`;
      }
      default:
        return "Klaidinga \u012Fvestis";
    }
  };
}, "error");
function ds() {
  return { localeError: Wh() };
}
c(ds, "default");
var Fh = c(() => {
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
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 instanceof ${n.expected}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${l}`
          : `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${r}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Invalid input: expected ${stringifyPrimitive(n.values[0])}`
          : `\u0413\u0440\u0435\u0448\u0430\u043D\u0430 \u043E\u043F\u0446\u0438\u0458\u0430: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 \u0435\u0434\u043D\u0430 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${n.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0438\u043C\u0430 ${r}${n.maximum.toString()} ${s.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0438"}`
          : `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${n.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0431\u0438\u0434\u0435 ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${n.origin} \u0434\u0430 \u0438\u043C\u0430 ${r}${n.minimum.toString()} ${s.unit}`
          : `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${n.origin} \u0434\u0430 \u0431\u0438\u0434\u0435 ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u043D\u0443\u0432\u0430 \u0441\u043E "${r.prefix}"`
          : r.format === "ends_with"
            ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u0432\u0440\u0448\u0443\u0432\u0430 \u0441\u043E "${r.suffix}"`
            : r.format === "includes"
              ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0432\u043A\u043B\u0443\u0447\u0443\u0432\u0430 "${r.includes}"`
              : r.format === "regex"
                ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u043E\u0434\u0433\u043E\u0430\u0440\u0430 \u043D\u0430 \u043F\u0430\u0442\u0435\u0440\u043D\u043E\u0442 ${r.pattern}`
                : `Invalid ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u0431\u0440\u043E\u0458: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u0434\u0435\u043B\u0438\u0432 \u0441\u043E ${n.divisor}`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D\u0438 \u043A\u043B\u0443\u0447\u0435\u0432\u0438" : "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D \u043A\u043B\u0443\u0447"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u043A\u043B\u0443\u0447 \u0432\u043E ${n.origin}`;
      case "invalid_union":
        return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441";
      case "invalid_element":
        return `\u0413\u0440\u0435\u0448\u043D\u0430 \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442 \u0432\u043E ${n.origin}`;
      default:
        return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441";
    }
  };
}, "error");
function us() {
  return { localeError: Fh() };
}
c(us, "default");
var qh = c(() => {
  let e = {
    string: { unit: "aksara", verb: "mempunyai" },
    file: { unit: "bait", verb: "mempunyai" },
    array: { unit: "elemen", verb: "mempunyai" },
    set: { unit: "elemen", verb: "mempunyai" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Input tidak sah: dijangka instanceof ${n.expected}, diterima ${l}`
          : `Input tidak sah: dijangka ${r}, diterima ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Input tidak sah: dijangka ${stringifyPrimitive(n.values[0])}`
          : `Pilihan tidak sah: dijangka salah satu daripada ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Terlalu besar: dijangka ${n.origin ?? "nilai"} ${s.verb} ${r}${n.maximum.toString()} ${s.unit ?? "elemen"}`
          : `Terlalu besar: dijangka ${n.origin ?? "nilai"} adalah ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Terlalu kecil: dijangka ${n.origin} ${s.verb} ${r}${n.minimum.toString()} ${s.unit}`
          : `Terlalu kecil: dijangka ${n.origin} adalah ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `String tidak sah: mesti bermula dengan "${r.prefix}"`
          : r.format === "ends_with"
            ? `String tidak sah: mesti berakhir dengan "${r.suffix}"`
            : r.format === "includes"
              ? `String tidak sah: mesti mengandungi "${r.includes}"`
              : r.format === "regex"
                ? `String tidak sah: mesti sepadan dengan corak ${r.pattern}`
                : `${i[r.format] ?? n.format} tidak sah`;
      }
      case "not_multiple_of":
        return `Nombor tidak sah: perlu gandaan ${n.divisor}`;
      case "unrecognized_keys":
        return `Kunci tidak dikenali: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Kunci tidak sah dalam ${n.origin}`;
      case "invalid_union":
        return "Input tidak sah";
      case "invalid_element":
        return `Nilai tidak sah dalam ${n.origin}`;
      default:
        return "Input tidak sah";
    }
  };
}, "error");
function ps() {
  return { localeError: qh() };
}
c(ps, "default");
var Vh = c(() => {
  let e = {
    string: { unit: "tekens", verb: "heeft" },
    file: { unit: "bytes", verb: "heeft" },
    array: { unit: "elementen", verb: "heeft" },
    set: { unit: "elementen", verb: "heeft" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ongeldige invoer: verwacht instanceof ${n.expected}, ontving ${l}`
          : `Ongeldige invoer: verwacht ${r}, ontving ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ongeldige invoer: verwacht ${stringifyPrimitive(n.values[0])}`
          : `Ongeldige optie: verwacht \xE9\xE9n van ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin),
          l = n.origin === "date" ? "laat" : n.origin === "string" ? "lang" : "groot";
        return s
          ? `Te ${l}: verwacht dat ${n.origin ?? "waarde"} ${r}${n.maximum.toString()} ${s.unit ?? "elementen"} ${s.verb}`
          : `Te ${l}: verwacht dat ${n.origin ?? "waarde"} ${r}${n.maximum.toString()} is`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin),
          l = n.origin === "date" ? "vroeg" : n.origin === "string" ? "kort" : "klein";
        return s
          ? `Te ${l}: verwacht dat ${n.origin} ${r}${n.minimum.toString()} ${s.unit} ${s.verb}`
          : `Te ${l}: verwacht dat ${n.origin} ${r}${n.minimum.toString()} is`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Ongeldige tekst: moet met "${r.prefix}" beginnen`
          : r.format === "ends_with"
            ? `Ongeldige tekst: moet op "${r.suffix}" eindigen`
            : r.format === "includes"
              ? `Ongeldige tekst: moet "${r.includes}" bevatten`
              : r.format === "regex"
                ? `Ongeldige tekst: moet overeenkomen met patroon ${r.pattern}`
                : `Ongeldig: ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ongeldig getal: moet een veelvoud van ${n.divisor} zijn`;
      case "unrecognized_keys":
        return `Onbekende key${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Ongeldige key in ${n.origin}`;
      case "invalid_union":
        return "Ongeldige invoer";
      case "invalid_element":
        return `Ongeldige waarde in ${n.origin}`;
      default:
        return "Ongeldige invoer";
    }
  };
}, "error");
function ms() {
  return { localeError: Vh() };
}
c(ms, "default");
var Gh = c(() => {
  let e = {
    string: { unit: "tegn", verb: "\xE5 ha" },
    file: { unit: "bytes", verb: "\xE5 ha" },
    array: { unit: "elementer", verb: "\xE5 inneholde" },
    set: { unit: "elementer", verb: "\xE5 inneholde" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ugyldig input: forventet instanceof ${n.expected}, fikk ${l}`
          : `Ugyldig input: forventet ${r}, fikk ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ugyldig verdi: forventet ${stringifyPrimitive(n.values[0])}`
          : `Ugyldig valg: forventet en av ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `For stor(t): forventet ${n.origin ?? "value"} til \xE5 ha ${r}${n.maximum.toString()} ${s.unit ?? "elementer"}`
          : `For stor(t): forventet ${n.origin ?? "value"} til \xE5 ha ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `For lite(n): forventet ${n.origin} til \xE5 ha ${r}${n.minimum.toString()} ${s.unit}`
          : `For lite(n): forventet ${n.origin} til \xE5 ha ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Ugyldig streng: m\xE5 starte med "${r.prefix}"`
          : r.format === "ends_with"
            ? `Ugyldig streng: m\xE5 ende med "${r.suffix}"`
            : r.format === "includes"
              ? `Ugyldig streng: m\xE5 inneholde "${r.includes}"`
              : r.format === "regex"
                ? `Ugyldig streng: m\xE5 matche m\xF8nsteret ${r.pattern}`
                : `Ugyldig ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ugyldig tall: m\xE5 v\xE6re et multiplum av ${n.divisor}`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "Ukjente n\xF8kler" : "Ukjent n\xF8kkel"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Ugyldig n\xF8kkel i ${n.origin}`;
      case "invalid_union":
        return "Ugyldig input";
      case "invalid_element":
        return `Ugyldig verdi i ${n.origin}`;
      default:
        return "Ugyldig input";
    }
  };
}, "error");
function gs() {
  return { localeError: Gh() };
}
c(gs, "default");
var Kh = c(() => {
  let e = {
    string: { unit: "harf", verb: "olmal\u0131d\u0131r" },
    file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
    array: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
    set: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `F\xE2sit giren: umulan instanceof ${n.expected}, al\u0131nan ${l}`
          : `F\xE2sit giren: umulan ${r}, al\u0131nan ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `F\xE2sit giren: umulan ${stringifyPrimitive(n.values[0])}`
          : `F\xE2sit tercih: m\xFBteberler ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Fazla b\xFCy\xFCk: ${n.origin ?? "value"}, ${r}${n.maximum.toString()} ${s.unit ?? "elements"} sahip olmal\u0131yd\u0131.`
          : `Fazla b\xFCy\xFCk: ${n.origin ?? "value"}, ${r}${n.maximum.toString()} olmal\u0131yd\u0131.`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Fazla k\xFC\xE7\xFCk: ${n.origin}, ${r}${n.minimum.toString()} ${s.unit} sahip olmal\u0131yd\u0131.`
          : `Fazla k\xFC\xE7\xFCk: ${n.origin}, ${r}${n.minimum.toString()} olmal\u0131yd\u0131.`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `F\xE2sit metin: "${r.prefix}" ile ba\u015Flamal\u0131.`
          : r.format === "ends_with"
            ? `F\xE2sit metin: "${r.suffix}" ile bitmeli.`
            : r.format === "includes"
              ? `F\xE2sit metin: "${r.includes}" ihtiv\xE2 etmeli.`
              : r.format === "regex"
                ? `F\xE2sit metin: ${r.pattern} nak\u015F\u0131na uymal\u0131.`
                : `F\xE2sit ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `F\xE2sit say\u0131: ${n.divisor} kat\u0131 olmal\u0131yd\u0131.`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan anahtar ${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} i\xE7in tan\u0131nmayan anahtar var.`;
      case "invalid_union":
        return "Giren tan\u0131namad\u0131.";
      case "invalid_element":
        return `${n.origin} i\xE7in tan\u0131nmayan k\u0131ymet var.`;
      default:
        return "K\u0131ymet tan\u0131namad\u0131.";
    }
  };
}, "error");
function fs() {
  return { localeError: Kh() };
}
c(fs, "default");
var Hh = c(() => {
  let e = {
    string: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
    file: { unit: "\u0628\u0627\u06CC\u067C\u0633", verb: "\u0648\u0644\u0631\u064A" },
    array: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
    set: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F instanceof ${n.expected} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${l} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`
          : `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${r} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${l} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${stringifyPrimitive(n.values[0])} \u0648\u0627\u06CC`
          : `\u0646\u0627\u0633\u0645 \u0627\u0646\u062A\u062E\u0627\u0628: \u0628\u0627\u06CC\u062F \u06CC\u0648 \u0644\u0647 ${joinValues(n.values, "|")} \u0685\u062E\u0647 \u0648\u0627\u06CC`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${n.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${r}${n.maximum.toString()} ${s.unit ?? "\u0639\u0646\u0635\u0631\u0648\u0646\u0647"} \u0648\u0644\u0631\u064A`
          : `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${n.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${r}${n.maximum.toString()} \u0648\u064A`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${n.origin} \u0628\u0627\u06CC\u062F ${r}${n.minimum.toString()} ${s.unit} \u0648\u0644\u0631\u064A`
          : `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${n.origin} \u0628\u0627\u06CC\u062F ${r}${n.minimum.toString()} \u0648\u064A`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${r.prefix}" \u0633\u0631\u0647 \u067E\u06CC\u0644 \u0634\u064A`
          : r.format === "ends_with"
            ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${r.suffix}" \u0633\u0631\u0647 \u067E\u0627\u06CC \u062A\u0647 \u0648\u0631\u0633\u064A\u0696\u064A`
            : r.format === "includes"
              ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F "${r.includes}" \u0648\u0644\u0631\u064A`
              : r.format === "regex"
                ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F ${r.pattern} \u0633\u0631\u0647 \u0645\u0637\u0627\u0628\u0642\u062A \u0648\u0644\u0631\u064A`
                : `${i[r.format] ?? n.format} \u0646\u0627\u0633\u0645 \u062F\u06CC`;
      }
      case "not_multiple_of":
        return `\u0646\u0627\u0633\u0645 \u0639\u062F\u062F: \u0628\u0627\u06CC\u062F \u062F ${n.divisor} \u0645\u0636\u0631\u0628 \u0648\u064A`;
      case "unrecognized_keys":
        return `\u0646\u0627\u0633\u0645 ${n.keys.length > 1 ? "\u06A9\u0644\u06CC\u0689\u0648\u0646\u0647" : "\u06A9\u0644\u06CC\u0689"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u0646\u0627\u0633\u0645 \u06A9\u0644\u06CC\u0689 \u067E\u0647 ${n.origin} \u06A9\u06D0`;
      case "invalid_union":
        return "\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A";
      case "invalid_element":
        return `\u0646\u0627\u0633\u0645 \u0639\u0646\u0635\u0631 \u067E\u0647 ${n.origin} \u06A9\u06D0`;
      default:
        return "\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A";
    }
  };
}, "error");
function hs() {
  return { localeError: Hh() };
}
c(hs, "default");
var Jh = c(() => {
  let e = {
    string: { unit: "znak\xF3w", verb: "mie\u0107" },
    file: { unit: "bajt\xF3w", verb: "mie\u0107" },
    array: { unit: "element\xF3w", verb: "mie\u0107" },
    set: { unit: "element\xF3w", verb: "mie\u0107" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano instanceof ${n.expected}, otrzymano ${l}`
          : `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${r}, otrzymano ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${stringifyPrimitive(n.values[0])}`
          : `Nieprawid\u0142owa opcja: oczekiwano jednej z warto\u015Bci ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Za du\u017Ca warto\u015B\u0107: oczekiwano, \u017Ce ${n.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${r}${n.maximum.toString()} ${s.unit ?? "element\xF3w"}`
          : `Zbyt du\u017C(y/a/e): oczekiwano, \u017Ce ${n.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Za ma\u0142a warto\u015B\u0107: oczekiwano, \u017Ce ${n.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${r}${n.minimum.toString()} ${s.unit ?? "element\xF3w"}`
          : `Zbyt ma\u0142(y/a/e): oczekiwano, \u017Ce ${n.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zaczyna\u0107 si\u0119 od "${r.prefix}"`
          : r.format === "ends_with"
            ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi ko\u0144czy\u0107 si\u0119 na "${r.suffix}"`
            : r.format === "includes"
              ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zawiera\u0107 "${r.includes}"`
              : r.format === "regex"
                ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi odpowiada\u0107 wzorcowi ${r.pattern}`
                : `Nieprawid\u0142ow(y/a/e) ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Nieprawid\u0142owa liczba: musi by\u0107 wielokrotno\u015Bci\u0105 ${n.divisor}`;
      case "unrecognized_keys":
        return `Nierozpoznane klucze${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Nieprawid\u0142owy klucz w ${n.origin}`;
      case "invalid_union":
        return "Nieprawid\u0142owe dane wej\u015Bciowe";
      case "invalid_element":
        return `Nieprawid\u0142owa warto\u015B\u0107 w ${n.origin}`;
      default:
        return "Nieprawid\u0142owe dane wej\u015Bciowe";
    }
  };
}, "error");
function ys() {
  return { localeError: Jh() };
}
c(ys, "default");
var Yh = c(() => {
  let e = {
    string: { unit: "caracteres", verb: "ter" },
    file: { unit: "bytes", verb: "ter" },
    array: { unit: "itens", verb: "ter" },
    set: { unit: "itens", verb: "ter" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Tipo inv\xE1lido: esperado instanceof ${n.expected}, recebido ${l}`
          : `Tipo inv\xE1lido: esperado ${r}, recebido ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Entrada inv\xE1lida: esperado ${stringifyPrimitive(n.values[0])}`
          : `Op\xE7\xE3o inv\xE1lida: esperada uma das ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Muito grande: esperado que ${n.origin ?? "valor"} tivesse ${r}${n.maximum.toString()} ${s.unit ?? "elementos"}`
          : `Muito grande: esperado que ${n.origin ?? "valor"} fosse ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Muito pequeno: esperado que ${n.origin} tivesse ${r}${n.minimum.toString()} ${s.unit}`
          : `Muito pequeno: esperado que ${n.origin} fosse ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Texto inv\xE1lido: deve come\xE7ar com "${r.prefix}"`
          : r.format === "ends_with"
            ? `Texto inv\xE1lido: deve terminar com "${r.suffix}"`
            : r.format === "includes"
              ? `Texto inv\xE1lido: deve incluir "${r.includes}"`
              : r.format === "regex"
                ? `Texto inv\xE1lido: deve corresponder ao padr\xE3o ${r.pattern}`
                : `${i[r.format] ?? n.format} inv\xE1lido`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE1lido: deve ser m\xFAltiplo de ${n.divisor}`;
      case "unrecognized_keys":
        return `Chave${n.keys.length > 1 ? "s" : ""} desconhecida${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Chave inv\xE1lida em ${n.origin}`;
      case "invalid_union":
        return "Entrada inv\xE1lida";
      case "invalid_element":
        return `Valor inv\xE1lido em ${n.origin}`;
      default:
        return "Campo inv\xE1lido";
    }
  };
}, "error");
function bs() {
  return { localeError: Yh() };
}
c(bs, "default");
function getRussianPlural(e, o, i, a) {
  let n = Math.abs(e),
    r = n % 10,
    s = n % 100;
  return s >= 11 && s <= 19 ? a : r === 1 ? o : r >= 2 && r <= 4 ? i : a;
}
c(getRussianPlural, "getRussianPlural");
var Xh = c(() => {
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
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C instanceof ${n.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${l}`
          : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${r}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${stringifyPrimitive(n.values[0])}`
          : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0434\u043D\u043E \u0438\u0437 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.maximum),
            u = getRussianPlural(l, s.unit.one, s.unit.few, s.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${r}${n.maximum.toString()} ${u}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.minimum),
            u = getRussianPlural(l, s.unit.one, s.unit.few, s.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${n.origin} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${r}${n.minimum.toString()} ${u}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${n.origin} \u0431\u0443\u0434\u0435\u0442 ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u043D\u0430\u0447\u0438\u043D\u0430\u0442\u044C\u0441\u044F \u0441 "${r.prefix}"`
          : r.format === "ends_with"
            ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u0442\u044C\u0441\u044F \u043D\u0430 "${r.suffix}"`
            : r.format === "includes"
              ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C "${r.includes}"`
              : r.format === "regex"
                ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${r.pattern}`
                : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E: \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${n.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D\u043D${n.keys.length > 1 ? "\u044B\u0435" : "\u044B\u0439"} \u043A\u043B\u044E\u0447${n.keys.length > 1 ? "\u0438" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043A\u043B\u044E\u0447 \u0432 ${n.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435";
      case "invalid_element":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432 ${n.origin}`;
      default:
        return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435";
    }
  };
}, "error");
function vs() {
  return { localeError: Xh() };
}
c(vs, "default");
var Qh = c(() => {
  let e = {
    string: { unit: "znakov", verb: "imeti" },
    file: { unit: "bajtov", verb: "imeti" },
    array: { unit: "elementov", verb: "imeti" },
    set: { unit: "elementov", verb: "imeti" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Neveljaven vnos: pri\u010Dakovano instanceof ${n.expected}, prejeto ${l}`
          : `Neveljaven vnos: pri\u010Dakovano ${r}, prejeto ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Neveljaven vnos: pri\u010Dakovano ${stringifyPrimitive(n.values[0])}`
          : `Neveljavna mo\u017Enost: pri\u010Dakovano eno izmed ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Preveliko: pri\u010Dakovano, da bo ${n.origin ?? "vrednost"} imelo ${r}${n.maximum.toString()} ${s.unit ?? "elementov"}`
          : `Preveliko: pri\u010Dakovano, da bo ${n.origin ?? "vrednost"} ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Premajhno: pri\u010Dakovano, da bo ${n.origin} imelo ${r}${n.minimum.toString()} ${s.unit}`
          : `Premajhno: pri\u010Dakovano, da bo ${n.origin} ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Neveljaven niz: mora se za\u010Deti z "${r.prefix}"`
          : r.format === "ends_with"
            ? `Neveljaven niz: mora se kon\u010Dati z "${r.suffix}"`
            : r.format === "includes"
              ? `Neveljaven niz: mora vsebovati "${r.includes}"`
              : r.format === "regex"
                ? `Neveljaven niz: mora ustrezati vzorcu ${r.pattern}`
                : `Neveljaven ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Neveljavno \u0161tevilo: mora biti ve\u010Dkratnik ${n.divisor}`;
      case "unrecognized_keys":
        return `Neprepoznan${n.keys.length > 1 ? "i klju\u010Di" : " klju\u010D"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Neveljaven klju\u010D v ${n.origin}`;
      case "invalid_union":
        return "Neveljaven vnos";
      case "invalid_element":
        return `Neveljavna vrednost v ${n.origin}`;
      default:
        return "Neveljaven vnos";
    }
  };
}, "error");
function Ss() {
  return { localeError: Qh() };
}
c(Ss, "default");
var ey = c(() => {
  let e = {
    string: { unit: "tecken", verb: "att ha" },
    file: { unit: "bytes", verb: "att ha" },
    array: { unit: "objekt", verb: "att inneh\xE5lla" },
    set: { unit: "objekt", verb: "att inneh\xE5lla" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ogiltig inmatning: f\xF6rv\xE4ntat instanceof ${n.expected}, fick ${l}`
          : `Ogiltig inmatning: f\xF6rv\xE4ntat ${r}, fick ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ogiltig inmatning: f\xF6rv\xE4ntat ${stringifyPrimitive(n.values[0])}`
          : `Ogiltigt val: f\xF6rv\xE4ntade en av ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `F\xF6r stor(t): f\xF6rv\xE4ntade ${n.origin ?? "v\xE4rdet"} att ha ${r}${n.maximum.toString()} ${s.unit ?? "element"}`
          : `F\xF6r stor(t): f\xF6rv\xE4ntat ${n.origin ?? "v\xE4rdet"} att ha ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `F\xF6r lite(t): f\xF6rv\xE4ntade ${n.origin ?? "v\xE4rdet"} att ha ${r}${n.minimum.toString()} ${s.unit}`
          : `F\xF6r lite(t): f\xF6rv\xE4ntade ${n.origin ?? "v\xE4rdet"} att ha ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Ogiltig str\xE4ng: m\xE5ste b\xF6rja med "${r.prefix}"`
          : r.format === "ends_with"
            ? `Ogiltig str\xE4ng: m\xE5ste sluta med "${r.suffix}"`
            : r.format === "includes"
              ? `Ogiltig str\xE4ng: m\xE5ste inneh\xE5lla "${r.includes}"`
              : r.format === "regex"
                ? `Ogiltig str\xE4ng: m\xE5ste matcha m\xF6nstret "${r.pattern}"`
                : `Ogiltig(t) ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ogiltigt tal: m\xE5ste vara en multipel av ${n.divisor}`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "Ok\xE4nda nycklar" : "Ok\xE4nd nyckel"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Ogiltig nyckel i ${n.origin ?? "v\xE4rdet"}`;
      case "invalid_union":
        return "Ogiltig input";
      case "invalid_element":
        return `Ogiltigt v\xE4rde i ${n.origin ?? "v\xE4rdet"}`;
      default:
        return "Ogiltig input";
    }
  };
}, "error");
function _s() {
  return { localeError: ey() };
}
c(_s, "default");
var ty = c(() => {
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
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 instanceof ${n.expected}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${l}`
          : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${r}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${stringifyPrimitive(n.values[0])}`
          : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0BB0\u0BC1\u0BAA\u0BCD\u0BAA\u0BAE\u0BCD: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${joinValues(n.values, "|")} \u0B87\u0BB2\u0BCD \u0B92\u0BA9\u0BCD\u0BB1\u0BC1`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${n.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${r}${n.maximum.toString()} ${s.unit ?? "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD"} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${n.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${r}${n.maximum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${n.origin} ${r}${n.minimum.toString()} ${s.unit} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${n.origin} ${r}${n.minimum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${r.prefix}" \u0B87\u0BB2\u0BCD \u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : r.format === "ends_with"
            ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${r.suffix}" \u0B87\u0BB2\u0BCD \u0BAE\u0BC1\u0B9F\u0BBF\u0BB5\u0B9F\u0BC8\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
            : r.format === "includes"
              ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${r.includes}" \u0B90 \u0B89\u0BB3\u0BCD\u0BB3\u0B9F\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
              : r.format === "regex"
                ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: ${r.pattern} \u0BAE\u0BC1\u0BB1\u0BC8\u0BAA\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0B9F\u0BA9\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
                : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B8E\u0BA3\u0BCD: ${n.divisor} \u0B87\u0BA9\u0BCD \u0BAA\u0BB2\u0BAE\u0BBE\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      case "unrecognized_keys":
        return `\u0B85\u0B9F\u0BC8\u0BAF\u0BBE\u0BB3\u0BAE\u0BCD \u0BA4\u0BC6\u0BB0\u0BBF\u0BAF\u0BBE\u0BA4 \u0BB5\u0BBF\u0B9A\u0BC8${n.keys.length > 1 ? "\u0B95\u0BB3\u0BCD" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0B9A\u0BC8`;
      case "invalid_union":
        return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1";
      case "invalid_element":
        return `${n.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1`;
      default:
        return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1";
    }
  };
}, "error");
function xs() {
  return { localeError: ty() };
}
c(xs, "default");
var ny = c(() => {
  let e = {
    string: {
      unit: "\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23",
      verb: "\u0E04\u0E27\u0E23\u0E21\u0E35",
    },
    file: { unit: "\u0E44\u0E1A\u0E15\u0E4C", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    array: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    set: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 instanceof ${n.expected} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${l}`
          : `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${r} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0E04\u0E48\u0E32\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${stringifyPrimitive(n.values[0])}`
          : `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E43\u0E19 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive
            ? "\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19"
            : "\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32",
          s = getSizing(n.origin);
        return s
          ? `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${n.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${r} ${n.maximum.toString()} ${s.unit ?? "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"}`
          : `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${n.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${r} ${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive
            ? "\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22"
            : "\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32",
          s = getSizing(n.origin);
        return s
          ? `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${n.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${r} ${n.minimum.toString()} ${s.unit}`
          : `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${n.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${r} ${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E36\u0E49\u0E19\u0E15\u0E49\u0E19\u0E14\u0E49\u0E27\u0E22 "${r.prefix}"`
          : r.format === "ends_with"
            ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E25\u0E07\u0E17\u0E49\u0E32\u0E22\u0E14\u0E49\u0E27\u0E22 "${r.suffix}"`
            : r.format === "includes"
              ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 "${r.includes}" \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21`
              : r.format === "regex"
                ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14 ${r.pattern}`
                : `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E33\u0E19\u0E27\u0E19\u0E17\u0E35\u0E48\u0E2B\u0E32\u0E23\u0E14\u0E49\u0E27\u0E22 ${n.divisor} \u0E44\u0E14\u0E49\u0E25\u0E07\u0E15\u0E31\u0E27`;
      case "unrecognized_keys":
        return `\u0E1E\u0E1A\u0E04\u0E35\u0E22\u0E4C\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u0E04\u0E35\u0E22\u0E4C\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${n.origin}`;
      case "invalid_union":
        return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E22\u0E39\u0E40\u0E19\u0E35\u0E22\u0E19\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E44\u0E27\u0E49";
      case "invalid_element":
        return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${n.origin}`;
      default:
        return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07";
    }
  };
}, "error");
function ks() {
  return { localeError: ny() };
}
c(ks, "default");
var oy = c(() => {
  let e = {
    string: { unit: "karakter", verb: "olmal\u0131" },
    file: { unit: "bayt", verb: "olmal\u0131" },
    array: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
    set: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ge\xE7ersiz de\u011Fer: beklenen instanceof ${n.expected}, al\u0131nan ${l}`
          : `Ge\xE7ersiz de\u011Fer: beklenen ${r}, al\u0131nan ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ge\xE7ersiz de\u011Fer: beklenen ${stringifyPrimitive(n.values[0])}`
          : `Ge\xE7ersiz se\xE7enek: a\u015Fa\u011F\u0131dakilerden biri olmal\u0131: ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\xC7ok b\xFCy\xFCk: beklenen ${n.origin ?? "de\u011Fer"} ${r}${n.maximum.toString()} ${s.unit ?? "\xF6\u011Fe"}`
          : `\xC7ok b\xFCy\xFCk: beklenen ${n.origin ?? "de\u011Fer"} ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\xC7ok k\xFC\xE7\xFCk: beklenen ${n.origin} ${r}${n.minimum.toString()} ${s.unit}`
          : `\xC7ok k\xFC\xE7\xFCk: beklenen ${n.origin} ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Ge\xE7ersiz metin: "${r.prefix}" ile ba\u015Flamal\u0131`
          : r.format === "ends_with"
            ? `Ge\xE7ersiz metin: "${r.suffix}" ile bitmeli`
            : r.format === "includes"
              ? `Ge\xE7ersiz metin: "${r.includes}" i\xE7ermeli`
              : r.format === "regex"
                ? `Ge\xE7ersiz metin: ${r.pattern} desenine uymal\u0131`
                : `Ge\xE7ersiz ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ge\xE7ersiz say\u0131: ${n.divisor} ile tam b\xF6l\xFCnebilmeli`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan anahtar${n.keys.length > 1 ? "lar" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} i\xE7inde ge\xE7ersiz anahtar`;
      case "invalid_union":
        return "Ge\xE7ersiz de\u011Fer";
      case "invalid_element":
        return `${n.origin} i\xE7inde ge\xE7ersiz de\u011Fer`;
      default:
        return "Ge\xE7ersiz de\u011Fer";
    }
  };
}, "error");
function Is() {
  return { localeError: oy() };
}
c(Is, "default");
var ry = c(() => {
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
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F instanceof ${n.expected}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${l}`
          : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${r}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${stringifyPrimitive(n.values[0])}`
          : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430 \u043E\u043F\u0446\u0456\u044F: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F \u043E\u0434\u043D\u0435 \u0437 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} ${s.verb} ${r}${n.maximum.toString()} ${s.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432"}`
          : `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} \u0431\u0443\u0434\u0435 ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${n.origin} ${s.verb} ${r}${n.minimum.toString()} ${s.unit}`
          : `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${n.origin} \u0431\u0443\u0434\u0435 ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043F\u043E\u0447\u0438\u043D\u0430\u0442\u0438\u0441\u044F \u0437 "${r.prefix}"`
          : r.format === "ends_with"
            ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0437\u0430\u043A\u0456\u043D\u0447\u0443\u0432\u0430\u0442\u0438\u0441\u044F \u043D\u0430 "${r.suffix}"`
            : r.format === "includes"
              ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043C\u0456\u0441\u0442\u0438\u0442\u0438 "${r.includes}"`
              : r.format === "regex"
                ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u0442\u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${r.pattern}`
                : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0447\u0438\u0441\u043B\u043E: \u043F\u043E\u0432\u0438\u043D\u043D\u043E \u0431\u0443\u0442\u0438 \u043A\u0440\u0430\u0442\u043D\u0438\u043C ${n.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u043E\u0437\u043F\u0456\u0437\u043D\u0430\u043D\u0438\u0439 \u043A\u043B\u044E\u0447${n.keys.length > 1 ? "\u0456" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u043A\u043B\u044E\u0447 \u0443 ${n.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456";
      case "invalid_element":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0443 ${n.origin}`;
      default:
        return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456";
    }
  };
}, "error");
function on() {
  return { localeError: ry() };
}
c(on, "default");
function Cs() {
  return on();
}
c(Cs, "default");
var iy = c(() => {
  let e = {
    string: { unit: "\u062D\u0631\u0648\u0641", verb: "\u06C1\u0648\u0646\u0627" },
    file: { unit: "\u0628\u0627\u0626\u0679\u0633", verb: "\u06C1\u0648\u0646\u0627" },
    array: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
    set: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: instanceof ${n.expected} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${l} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`
          : `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${r} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${l} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${stringifyPrimitive(n.values[0])} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`
          : `\u063A\u0644\u0637 \u0622\u067E\u0634\u0646: ${joinValues(n.values, "|")} \u0645\u06CC\u06BA \u0633\u06D2 \u0627\u06CC\u06A9 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u0628\u06C1\u062A \u0628\u0691\u0627: ${n.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u06D2 ${r}${n.maximum.toString()} ${s.unit ?? "\u0639\u0646\u0627\u0635\u0631"} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`
          : `\u0628\u06C1\u062A \u0628\u0691\u0627: ${n.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u0627 ${r}${n.maximum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${n.origin} \u06A9\u06D2 ${r}${n.minimum.toString()} ${s.unit} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`
          : `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${n.origin} \u06A9\u0627 ${r}${n.minimum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${r.prefix}" \u0633\u06D2 \u0634\u0631\u0648\u0639 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
          : r.format === "ends_with"
            ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${r.suffix}" \u067E\u0631 \u062E\u062A\u0645 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
            : r.format === "includes"
              ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${r.includes}" \u0634\u0627\u0645\u0644 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
              : r.format === "regex"
                ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: \u067E\u06CC\u0679\u0631\u0646 ${r.pattern} \u0633\u06D2 \u0645\u06CC\u0686 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
                : `\u063A\u0644\u0637 ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u063A\u0644\u0637 \u0646\u0645\u0628\u0631: ${n.divisor} \u06A9\u0627 \u0645\u0636\u0627\u0639\u0641 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
      case "unrecognized_keys":
        return `\u063A\u06CC\u0631 \u062A\u0633\u0644\u06CC\u0645 \u0634\u062F\u06C1 \u06A9\u06CC${n.keys.length > 1 ? "\u0632" : ""}: ${joinValues(n.keys, "\u060C ")}`;
      case "invalid_key":
        return `${n.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u06A9\u06CC`;
      case "invalid_union":
        return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679";
      case "invalid_element":
        return `${n.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u0648\u06CC\u0644\u06CC\u0648`;
      default:
        return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679";
    }
  };
}, "error");
function Rs() {
  return { localeError: iy() };
}
c(Rs, "default");
var ay = c(() => {
  let e = {
    string: { unit: "belgi", verb: "bo\u2018lishi kerak" },
    file: { unit: "bayt", verb: "bo\u2018lishi kerak" },
    array: { unit: "element", verb: "bo\u2018lishi kerak" },
    set: { unit: "element", verb: "bo\u2018lishi kerak" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Noto\u2018g\u2018ri kirish: kutilgan instanceof ${n.expected}, qabul qilingan ${l}`
          : `Noto\u2018g\u2018ri kirish: kutilgan ${r}, qabul qilingan ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Noto\u2018g\u2018ri kirish: kutilgan ${stringifyPrimitive(n.values[0])}`
          : `Noto\u2018g\u2018ri variant: quyidagilardan biri kutilgan ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Juda katta: kutilgan ${n.origin ?? "qiymat"} ${r}${n.maximum.toString()} ${s.unit} ${s.verb}`
          : `Juda katta: kutilgan ${n.origin ?? "qiymat"} ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Juda kichik: kutilgan ${n.origin} ${r}${n.minimum.toString()} ${s.unit} ${s.verb}`
          : `Juda kichik: kutilgan ${n.origin} ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Noto\u2018g\u2018ri satr: "${r.prefix}" bilan boshlanishi kerak`
          : r.format === "ends_with"
            ? `Noto\u2018g\u2018ri satr: "${r.suffix}" bilan tugashi kerak`
            : r.format === "includes"
              ? `Noto\u2018g\u2018ri satr: "${r.includes}" ni o\u2018z ichiga olishi kerak`
              : r.format === "regex"
                ? `Noto\u2018g\u2018ri satr: ${r.pattern} shabloniga mos kelishi kerak`
                : `Noto\u2018g\u2018ri ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Noto\u2018g\u2018ri raqam: ${n.divisor} ning karralisi bo\u2018lishi kerak`;
      case "unrecognized_keys":
        return `Noma\u2019lum kalit${n.keys.length > 1 ? "lar" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} dagi kalit noto\u2018g\u2018ri`;
      case "invalid_union":
        return "Noto\u2018g\u2018ri kirish";
      case "invalid_element":
        return `${n.origin} da noto\u2018g\u2018ri qiymat`;
      default:
        return "Noto\u2018g\u2018ri kirish";
    }
  };
}, "error");
function Ps() {
  return { localeError: ay() };
}
c(Ps, "default");
var sy = c(() => {
  let e = {
    string: { unit: "k\xFD t\u1EF1", verb: "c\xF3" },
    file: { unit: "byte", verb: "c\xF3" },
    array: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
    set: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i instanceof ${n.expected}, nh\u1EADn \u0111\u01B0\u1EE3c ${l}`
          : `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${r}, nh\u1EADn \u0111\u01B0\u1EE3c ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${stringifyPrimitive(n.values[0])}`
          : `T\xF9y ch\u1ECDn kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i m\u1ED9t trong c\xE1c gi\xE1 tr\u1ECB ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${n.origin ?? "gi\xE1 tr\u1ECB"} ${s.verb} ${r}${n.maximum.toString()} ${s.unit ?? "ph\u1EA7n t\u1EED"}`
          : `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${n.origin ?? "gi\xE1 tr\u1ECB"} ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${n.origin} ${s.verb} ${r}${n.minimum.toString()} ${s.unit}`
          : `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${n.origin} ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i b\u1EAFt \u0111\u1EA7u b\u1EB1ng "${r.prefix}"`
          : r.format === "ends_with"
            ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i k\u1EBFt th\xFAc b\u1EB1ng "${r.suffix}"`
            : r.format === "includes"
              ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i bao g\u1ED3m "${r.includes}"`
              : r.format === "regex"
                ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i kh\u1EDBp v\u1EDBi m\u1EABu ${r.pattern}`
                : `${i[r.format] ?? n.format} kh\xF4ng h\u1EE3p l\u1EC7`;
      }
      case "not_multiple_of":
        return `S\u1ED1 kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i l\xE0 b\u1ED9i s\u1ED1 c\u1EE7a ${n.divisor}`;
      case "unrecognized_keys":
        return `Kh\xF3a kh\xF4ng \u0111\u01B0\u1EE3c nh\u1EADn d\u1EA1ng: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Kh\xF3a kh\xF4ng h\u1EE3p l\u1EC7 trong ${n.origin}`;
      case "invalid_union":
        return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7";
      case "invalid_element":
        return `Gi\xE1 tr\u1ECB kh\xF4ng h\u1EE3p l\u1EC7 trong ${n.origin}`;
      default:
        return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7";
    }
  };
}, "error");
function Ts() {
  return { localeError: sy() };
}
c(Ts, "default");
var cy = c(() => {
  let e = {
    string: { unit: "\u5B57\u7B26", verb: "\u5305\u542B" },
    file: { unit: "\u5B57\u8282", verb: "\u5305\u542B" },
    array: { unit: "\u9879", verb: "\u5305\u542B" },
    set: { unit: "\u9879", verb: "\u5305\u542B" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B instanceof ${n.expected}\uFF0C\u5B9E\u9645\u63A5\u6536 ${l}`
          : `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${r}\uFF0C\u5B9E\u9645\u63A5\u6536 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${stringifyPrimitive(n.values[0])}`
          : `\u65E0\u6548\u9009\u9879\uFF1A\u671F\u671B\u4EE5\u4E0B\u4E4B\u4E00 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${n.origin ?? "\u503C"} ${r}${n.maximum.toString()} ${s.unit ?? "\u4E2A\u5143\u7D20"}`
          : `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${n.origin ?? "\u503C"} ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${n.origin} ${r}${n.minimum.toString()} ${s.unit}`
          : `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${n.origin} ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${r.prefix}" \u5F00\u5934`
          : r.format === "ends_with"
            ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${r.suffix}" \u7ED3\u5C3E`
            : r.format === "includes"
              ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u5305\u542B "${r.includes}"`
              : r.format === "regex"
                ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u6EE1\u8DB3\u6B63\u5219\u8868\u8FBE\u5F0F ${r.pattern}`
                : `\u65E0\u6548${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u65E0\u6548\u6570\u5B57\uFF1A\u5FC5\u987B\u662F ${n.divisor} \u7684\u500D\u6570`;
      case "unrecognized_keys":
        return `\u51FA\u73B0\u672A\u77E5\u7684\u952E(key): ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} \u4E2D\u7684\u952E(key)\u65E0\u6548`;
      case "invalid_union":
        return "\u65E0\u6548\u8F93\u5165";
      case "invalid_element":
        return `${n.origin} \u4E2D\u5305\u542B\u65E0\u6548\u503C(value)`;
      default:
        return "\u65E0\u6548\u8F93\u5165";
    }
  };
}, "error");
function ws() {
  return { localeError: cy() };
}
c(ws, "default");
var ly = c(() => {
  let e = {
    string: { unit: "\u5B57\u5143", verb: "\u64C1\u6709" },
    file: { unit: "\u4F4D\u5143\u7D44", verb: "\u64C1\u6709" },
    array: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
    set: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA instanceof ${n.expected}\uFF0C\u4F46\u6536\u5230 ${l}`
          : `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${r}\uFF0C\u4F46\u6536\u5230 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${stringifyPrimitive(n.values[0])}`
          : `\u7121\u6548\u7684\u9078\u9805\uFF1A\u9810\u671F\u70BA\u4EE5\u4E0B\u5176\u4E2D\u4E4B\u4E00 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${n.origin ?? "\u503C"} \u61C9\u70BA ${r}${n.maximum.toString()} ${s.unit ?? "\u500B\u5143\u7D20"}`
          : `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${n.origin ?? "\u503C"} \u61C9\u70BA ${r}${n.maximum.toString()}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${n.origin} \u61C9\u70BA ${r}${n.minimum.toString()} ${s.unit}`
          : `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${n.origin} \u61C9\u70BA ${r}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${r.prefix}" \u958B\u982D`
          : r.format === "ends_with"
            ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${r.suffix}" \u7D50\u5C3E`
            : r.format === "includes"
              ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u5305\u542B "${r.includes}"`
              : r.format === "regex"
                ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u7B26\u5408\u683C\u5F0F ${r.pattern}`
                : `\u7121\u6548\u7684 ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u7121\u6548\u7684\u6578\u5B57\uFF1A\u5FC5\u9808\u70BA ${n.divisor} \u7684\u500D\u6578`;
      case "unrecognized_keys":
        return `\u7121\u6CD5\u8B58\u5225\u7684\u9375\u503C${n.keys.length > 1 ? "\u5011" : ""}\uFF1A${joinValues(n.keys, "\u3001")}`;
      case "invalid_key":
        return `${n.origin} \u4E2D\u6709\u7121\u6548\u7684\u9375\u503C`;
      case "invalid_union":
        return "\u7121\u6548\u7684\u8F38\u5165\u503C";
      case "invalid_element":
        return `${n.origin} \u4E2D\u6709\u7121\u6548\u7684\u503C`;
      default:
        return "\u7121\u6548\u7684\u8F38\u5165\u503C";
    }
  };
}, "error");
function Es() {
  return { localeError: ly() };
}
c(Es, "default");
var dy = c(() => {
  let e = {
    string: { unit: "\xE0mi", verb: "n\xED" },
    file: { unit: "bytes", verb: "n\xED" },
    array: { unit: "nkan", verb: "n\xED" },
    set: { unit: "nkan", verb: "n\xED" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let i = {
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
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let r = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi instanceof ${n.expected}, \xE0m\u1ECD\u0300 a r\xED ${l}`
          : `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${r}, \xE0m\u1ECD\u0300 a r\xED ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${stringifyPrimitive(n.values[0])}`
          : `\xC0\u1E63\xE0y\xE0n a\u1E63\xEC\u1E63e: yan \u1ECD\u0300kan l\xE1ra ${joinValues(n.values, "|")}`;
      case "too_big": {
        let r = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${n.origin ?? "iye"} ${s.verb} ${r}${n.maximum} ${s.unit}`
          : `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 ${r}${n.maximum}`;
      }
      case "too_small": {
        let r = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${n.origin} ${s.verb} ${r}${n.minimum} ${s.unit}`
          : `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 ${r}${n.minimum}`;
      }
      case "invalid_format": {
        let r = n;
        return r.format === "starts_with"
          ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\u1EB9\u0300r\u1EB9\u0300 p\u1EB9\u0300l\xFA "${r.prefix}"`
          : r.format === "ends_with"
            ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 par\xED p\u1EB9\u0300l\xFA "${r.suffix}"`
            : r.format === "includes"
              ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 n\xED "${r.includes}"`
              : r.format === "regex"
                ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\xE1 \xE0p\u1EB9\u1EB9r\u1EB9 mu ${r.pattern}`
                : `A\u1E63\xEC\u1E63e: ${i[r.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `N\u1ECD\u0301mb\xE0 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 j\u1EB9\u0301 \xE8y\xE0 p\xEDp\xEDn ti ${n.divisor}`;
      case "unrecognized_keys":
        return `B\u1ECDt\xECn\xEC \xE0\xECm\u1ECD\u0300: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `B\u1ECDt\xECn\xEC a\u1E63\xEC\u1E63e n\xEDn\xFA ${n.origin}`;
      case "invalid_union":
        return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
      case "invalid_element":
        return `Iye a\u1E63\xEC\u1E63e n\xEDn\xFA ${n.origin}`;
      default:
        return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
    }
  };
}, "error");
function Os() {
  return { localeError: dy() };
}
c(Os, "default");
var zu,
  As = Symbol("ZodOutput"),
  zs = Symbol("ZodInput"),
  eo = class {
    static {
      c(this, "$ZodRegistry");
    }
    constructor() {
      ((this._map = new WeakMap()), (this._idmap = new Map()));
    }
    add(o, ...i) {
      let a = i[0];
      return (
        this._map.set(o, a),
        a && typeof a == "object" && "id" in a && this._idmap.set(a.id, o),
        this
      );
    }
    clear() {
      return ((this._map = new WeakMap()), (this._idmap = new Map()), this);
    }
    remove(o) {
      let i = this._map.get(o);
      return (
        i && typeof i == "object" && "id" in i && this._idmap.delete(i.id),
        this._map.delete(o),
        this
      );
    }
    get(o) {
      let i = o._zod.parent;
      if (i) {
        let a = { ...(this.get(i) ?? {}) };
        delete a.id;
        let n = { ...a, ...this._map.get(o) };
        return Object.keys(n).length ? n : void 0;
      }
      return this._map.get(o);
    }
    has(o) {
      return this._map.has(o);
    }
  };
function registry() {
  return new eo();
}
c(registry, "registry");
(zu = globalThis).__zod_globalRegistry ?? (zu.__zod_globalRegistry = registry());
var F = globalThis.__zod_globalRegistry;
function _string(e, o) {
  return new e({ type: "string", ...normalizeParams(o) });
}
c(_string, "_string");
function _coercedString(e, o) {
  return new e({ type: "string", coerce: !0, ...normalizeParams(o) });
}
c(_coercedString, "_coercedString");
function _email(e, o) {
  return new e({ type: "string", format: "email", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_email, "_email");
function _guid(e, o) {
  return new e({ type: "string", format: "guid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_guid, "_guid");
function _uuid(e, o) {
  return new e({ type: "string", format: "uuid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_uuid, "_uuid");
function _uuidv4(e, o) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...normalizeParams(o),
  });
}
c(_uuidv4, "_uuidv4");
function _uuidv6(e, o) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...normalizeParams(o),
  });
}
c(_uuidv6, "_uuidv6");
function _uuidv7(e, o) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...normalizeParams(o),
  });
}
c(_uuidv7, "_uuidv7");
function _url(e, o) {
  return new e({ type: "string", format: "url", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_url, "_url");
function _emoji(e, o) {
  return new e({ type: "string", format: "emoji", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_emoji, "_emoji");
function _nanoid(e, o) {
  return new e({ type: "string", format: "nanoid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_nanoid, "_nanoid");
function _cuid(e, o) {
  return new e({ type: "string", format: "cuid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_cuid, "_cuid");
function _cuid2(e, o) {
  return new e({ type: "string", format: "cuid2", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_cuid2, "_cuid2");
function _ulid(e, o) {
  return new e({ type: "string", format: "ulid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_ulid, "_ulid");
function _xid(e, o) {
  return new e({ type: "string", format: "xid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_xid, "_xid");
function _ksuid(e, o) {
  return new e({ type: "string", format: "ksuid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_ksuid, "_ksuid");
function _ipv4(e, o) {
  return new e({ type: "string", format: "ipv4", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_ipv4, "_ipv4");
function _ipv6(e, o) {
  return new e({ type: "string", format: "ipv6", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_ipv6, "_ipv6");
function _mac(e, o) {
  return new e({ type: "string", format: "mac", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_mac, "_mac");
function _cidrv4(e, o) {
  return new e({ type: "string", format: "cidrv4", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_cidrv4, "_cidrv4");
function _cidrv6(e, o) {
  return new e({ type: "string", format: "cidrv6", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_cidrv6, "_cidrv6");
function _base64(e, o) {
  return new e({ type: "string", format: "base64", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_base64, "_base64");
function _base64url(e, o) {
  return new e({ type: "string", format: "base64url", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_base64url, "_base64url");
function _e164(e, o) {
  return new e({ type: "string", format: "e164", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_e164, "_e164");
function _jwt(e, o) {
  return new e({ type: "string", format: "jwt", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_jwt, "_jwt");
var Us = { Any: null, Minute: -1, Second: 0, Millisecond: 3, Microsecond: 6 };
function _isoDateTime(e, o) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...normalizeParams(o),
  });
}
c(_isoDateTime, "_isoDateTime");
function _isoDate(e, o) {
  return new e({ type: "string", format: "date", check: "string_format", ...normalizeParams(o) });
}
c(_isoDate, "_isoDate");
function _isoTime(e, o) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(o),
  });
}
c(_isoTime, "_isoTime");
function _isoDuration(e, o) {
  return new e({ type: "string", format: "duration", check: "string_format", ...normalizeParams(o) });
}
c(_isoDuration, "_isoDuration");
function _number(e, o) {
  return new e({ type: "number", checks: [], ...normalizeParams(o) });
}
c(_number, "_number");
function _coercedNumber(e, o) {
  return new e({ type: "number", coerce: !0, checks: [], ...normalizeParams(o) });
}
c(_coercedNumber, "_coercedNumber");
function _int(e, o) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "safeint", ...normalizeParams(o) });
}
c(_int, "_int");
function _float32(e, o) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "float32", ...normalizeParams(o) });
}
c(_float32, "_float32");
function _float64(e, o) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "float64", ...normalizeParams(o) });
}
c(_float64, "_float64");
function _int32(e, o) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "int32", ...normalizeParams(o) });
}
c(_int32, "_int32");
function _uint32(e, o) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "uint32", ...normalizeParams(o) });
}
c(_uint32, "_uint32");
function _boolean(e, o) {
  return new e({ type: "boolean", ...normalizeParams(o) });
}
c(_boolean, "_boolean");
function _coercedBoolean(e, o) {
  return new e({ type: "boolean", coerce: !0, ...normalizeParams(o) });
}
c(_coercedBoolean, "_coercedBoolean");
function _bigint(e, o) {
  return new e({ type: "bigint", ...normalizeParams(o) });
}
c(_bigint, "_bigint");
function _coercedBigint(e, o) {
  return new e({ type: "bigint", coerce: !0, ...normalizeParams(o) });
}
c(_coercedBigint, "_coercedBigint");
function _int64(e, o) {
  return new e({ type: "bigint", check: "bigint_format", abort: !1, format: "int64", ...normalizeParams(o) });
}
c(_int64, "_int64");
function _uint64(e, o) {
  return new e({ type: "bigint", check: "bigint_format", abort: !1, format: "uint64", ...normalizeParams(o) });
}
c(_uint64, "_uint64");
function _symbol(e, o) {
  return new e({ type: "symbol", ...normalizeParams(o) });
}
c(_symbol, "_symbol");
function _undefined(e, o) {
  return new e({ type: "undefined", ...normalizeParams(o) });
}
c(_undefined, "_undefined");
function _null(e, o) {
  return new e({ type: "null", ...normalizeParams(o) });
}
c(_null, "_null");
function _any(e) {
  return new e({ type: "any" });
}
c(_any, "_any");
function _unknown(e) {
  return new e({ type: "unknown" });
}
c(_unknown, "_unknown");
function _never(e, o) {
  return new e({ type: "never", ...normalizeParams(o) });
}
c(_never, "_never");
function _void(e, o) {
  return new e({ type: "void", ...normalizeParams(o) });
}
c(_void, "_void");
function _date(e, o) {
  return new e({ type: "date", ...normalizeParams(o) });
}
c(_date, "_date");
function _coercedDate(e, o) {
  return new e({ type: "date", coerce: !0, ...normalizeParams(o) });
}
c(_coercedDate, "_coercedDate");
function _nan(e, o) {
  return new e({ type: "nan", ...normalizeParams(o) });
}
c(_nan, "_nan");
function _lt(e, o) {
  return new Wn({ check: "less_than", ...normalizeParams(o), value: e, inclusive: !1 });
}
c(_lt, "_lt");
function _lte(e, o) {
  return new Wn({ check: "less_than", ...normalizeParams(o), value: e, inclusive: !0 });
}
c(_lte, "_lte");
function _gt(e, o) {
  return new Fn({ check: "greater_than", ...normalizeParams(o), value: e, inclusive: !1 });
}
c(_gt, "_gt");
function _gte(e, o) {
  return new Fn({ check: "greater_than", ...normalizeParams(o), value: e, inclusive: !0 });
}
c(_gte, "_gte");
function _positive(e) {
  return _gt(0, e);
}
c(_positive, "_positive");
function _negative(e) {
  return _lt(0, e);
}
c(_negative, "_negative");
function _nonpositive(e) {
  return _lte(0, e);
}
c(_nonpositive, "_nonpositive");
function _nonnegative(e) {
  return _gte(0, e);
}
c(_nonnegative, "_nonnegative");
function _multipleOf(e, o) {
  return new ui({ check: "multiple_of", ...normalizeParams(o), value: e });
}
c(_multipleOf, "_multipleOf");
function _maxSize(e, o) {
  return new gi({ check: "max_size", ...normalizeParams(o), maximum: e });
}
c(_maxSize, "_maxSize");
function _minSize(e, o) {
  return new fi({ check: "min_size", ...normalizeParams(o), minimum: e });
}
c(_minSize, "_minSize");
function _size(e, o) {
  return new hi({ check: "size_equals", ...normalizeParams(o), size: e });
}
c(_size, "_size");
function _maxLength(e, o) {
  return new yi({ check: "max_length", ...normalizeParams(o), maximum: e });
}
c(_maxLength, "_maxLength");
function _minLength(e, o) {
  return new bi({ check: "min_length", ...normalizeParams(o), minimum: e });
}
c(_minLength, "_minLength");
function _length(e, o) {
  return new vi({ check: "length_equals", ...normalizeParams(o), length: e });
}
c(_length, "_length");
function _regex(e, o) {
  return new Si({ check: "string_format", format: "regex", ...normalizeParams(o), pattern: e });
}
c(_regex, "_regex");
function _lowercase(e) {
  return new _i({ check: "string_format", format: "lowercase", ...normalizeParams(e) });
}
c(_lowercase, "_lowercase");
function _uppercase(e) {
  return new xi({ check: "string_format", format: "uppercase", ...normalizeParams(e) });
}
c(_uppercase, "_uppercase");
function _includes(e, o) {
  return new ki({ check: "string_format", format: "includes", ...normalizeParams(o), includes: e });
}
c(_includes, "_includes");
function _startsWith(e, o) {
  return new Ii({ check: "string_format", format: "starts_with", ...normalizeParams(o), prefix: e });
}
c(_startsWith, "_startsWith");
function _endsWith(e, o) {
  return new Ci({ check: "string_format", format: "ends_with", ...normalizeParams(o), suffix: e });
}
c(_endsWith, "_endsWith");
function _property(e, o, i) {
  return new Ri({ check: "property", property: e, schema: o, ...normalizeParams(i) });
}
c(_property, "_property");
function _mime(e, o) {
  return new Pi({ check: "mime_type", mime: e, ...normalizeParams(o) });
}
c(_mime, "_mime");
function _overwrite(e) {
  return new Ti({ check: "overwrite", tx: e });
}
c(_overwrite, "_overwrite");
function _normalize(e) {
  return _overwrite((o) => o.normalize(e));
}
c(_normalize, "_normalize");
function _trim() {
  return _overwrite((e) => e.trim());
}
c(_trim, "_trim");
function _toLowerCase() {
  return _overwrite((e) => e.toLowerCase());
}
c(_toLowerCase, "_toLowerCase");
function _toUpperCase() {
  return _overwrite((e) => e.toUpperCase());
}
c(_toUpperCase, "_toUpperCase");
function _slugify() {
  return _overwrite((e) => slugify(e));
}
c(_slugify, "_slugify");
function _array(e, o, i) {
  return new e({ type: "array", element: o, ...normalizeParams(i) });
}
c(_array, "_array");
function _union(e, o, i) {
  return new e({ type: "union", options: o, ...normalizeParams(i) });
}
c(_union, "_union");
function _xor(e, o, i) {
  return new e({ type: "union", options: o, inclusive: !1, ...normalizeParams(i) });
}
c(_xor, "_xor");
function _discriminatedUnion(e, o, i, a) {
  return new e({ type: "union", options: i, discriminator: o, ...normalizeParams(a) });
}
c(_discriminatedUnion, "_discriminatedUnion");
function _intersection(e, o, i) {
  return new e({ type: "intersection", left: o, right: i });
}
c(_intersection, "_intersection");
function _tuple(e, o, i, a) {
  let n = i instanceof T,
    r = n ? a : i,
    s = n ? i : null;
  return new e({ type: "tuple", items: o, rest: s, ...normalizeParams(r) });
}
c(_tuple, "_tuple");
function _record(e, o, i, a) {
  return new e({ type: "record", keyType: o, valueType: i, ...normalizeParams(a) });
}
c(_record, "_record");
function _map(e, o, i, a) {
  return new e({ type: "map", keyType: o, valueType: i, ...normalizeParams(a) });
}
c(_map, "_map");
function _set(e, o, i) {
  return new e({ type: "set", valueType: o, ...normalizeParams(i) });
}
c(_set, "_set");
function _enum(e, o, i) {
  let a = Array.isArray(o) ? Object.fromEntries(o.map((n) => [n, n])) : o;
  return new e({ type: "enum", entries: a, ...normalizeParams(i) });
}
c(_enum, "_enum");
function _nativeEnum(e, o, i) {
  return new e({ type: "enum", entries: o, ...normalizeParams(i) });
}
c(_nativeEnum, "_nativeEnum");
function _literal(e, o, i) {
  return new e({ type: "literal", values: Array.isArray(o) ? o : [o], ...normalizeParams(i) });
}
c(_literal, "_literal");
function _file(e, o) {
  return new e({ type: "file", ...normalizeParams(o) });
}
c(_file, "_file");
function _transform(e, o) {
  return new e({ type: "transform", transform: o });
}
c(_transform, "_transform");
function _optional(e, o) {
  return new e({ type: "optional", innerType: o });
}
c(_optional, "_optional");
function _nullable(e, o) {
  return new e({ type: "nullable", innerType: o });
}
c(_nullable, "_nullable");
function _default(e, o, i) {
  return new e({
    type: "default",
    innerType: o,
    get defaultValue() {
      return typeof i == "function" ? i() : shallowClone(i);
    },
  });
}
c(_default, "_default");
function _nonoptional(e, o, i) {
  return new e({ type: "nonoptional", innerType: o, ...normalizeParams(i) });
}
c(_nonoptional, "_nonoptional");
function _success(e, o) {
  return new e({ type: "success", innerType: o });
}
c(_success, "_success");
function _catch(e, o, i) {
  return new e({ type: "catch", innerType: o, catchValue: typeof i == "function" ? i : () => i });
}
c(_catch, "_catch");
function _pipe(e, o, i) {
  return new e({ type: "pipe", in: o, out: i });
}
c(_pipe, "_pipe");
function _readonly(e, o) {
  return new e({ type: "readonly", innerType: o });
}
c(_readonly, "_readonly");
function _templateLiteral(e, o, i) {
  return new e({ type: "template_literal", parts: o, ...normalizeParams(i) });
}
c(_templateLiteral, "_templateLiteral");
function _lazy(e, o) {
  return new e({ type: "lazy", getter: o });
}
c(_lazy, "_lazy");
function _promise(e, o) {
  return new e({ type: "promise", innerType: o });
}
c(_promise, "_promise");
function _custom(e, o, i) {
  let a = normalizeParams(i);
  return (a.abort ?? (a.abort = !0), new e({ type: "custom", check: "custom", fn: o, ...a }));
}
c(_custom, "_custom");
function _refine(e, o, i) {
  return new e({ type: "custom", check: "custom", fn: o, ...normalizeParams(i) });
}
c(_refine, "_refine");
function _superRefine(e) {
  let o = _check(
    (i) => (
      (i.addIssue = (a) => {
        if (typeof a == "string") i.issues.push(issue(a, i.value, o._zod.def));
        else {
          let n = a;
          (n.fatal && (n.continue = !1),
            n.code ?? (n.code = "custom"),
            n.input ?? (n.input = i.value),
            n.inst ?? (n.inst = o),
            n.continue ?? (n.continue = !o._zod.def.abort),
            i.issues.push(issue(n)));
        }
      }),
      e(i.value, i)
    ),
  );
  return o;
}
c(_superRefine, "_superRefine");
function _check(e, o) {
  let i = new U({ check: "custom", ...normalizeParams(o) });
  return ((i._zod.check = e), i);
}
c(_check, "_check");
function describe(e) {
  let o = new U({ check: "describe" });
  return (
    (o._zod.onattach = [
      (i) => {
        let a = F.get(i) ?? {};
        F.add(i, { ...a, description: e });
      },
    ]),
    (o._zod.check = () => {}),
    o
  );
}
c(describe, "describe");
function meta(e) {
  let o = new U({ check: "meta" });
  return (
    (o._zod.onattach = [
      (i) => {
        let a = F.get(i) ?? {};
        F.add(i, { ...a, ...e });
      },
    ]),
    (o._zod.check = () => {}),
    o
  );
}
c(meta, "meta");
function _stringbool(e, o) {
  let i = normalizeParams(o),
    a = i.truthy ?? ["true", "1", "yes", "on", "y", "enabled"],
    n = i.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
  i.case !== "sensitive" &&
    ((a = a.map((S) => (typeof S == "string" ? S.toLowerCase() : S))),
    (n = n.map((S) => (typeof S == "string" ? S.toLowerCase() : S))));
  let r = new Set(a),
    s = new Set(n),
    l = e.Codec ?? Qt,
    u = e.Boolean ?? Yt,
    p = e.String ?? Ze,
    f = new p({ type: "string", error: i.error }),
    y = new u({ type: "boolean", error: i.error }),
    v = new l({
      type: "pipe",
      in: f,
      out: y,
      transform: c((S, z) => {
        let N = S;
        return (
          i.case !== "sensitive" && (N = N.toLowerCase()),
          r.has(N)
            ? !0
            : s.has(N)
              ? !1
              : (z.issues.push({
                  code: "invalid_value",
                  expected: "stringbool",
                  values: [...r, ...s],
                  input: z.value,
                  inst: v,
                  continue: !1,
                }),
                {})
        );
      }, "transform"),
      reverseTransform: c(
        (S, z) => (S === !0 ? a[0] || "true" : n[0] || "false"),
        "reverseTransform",
      ),
      error: i.error,
    });
  return v;
}
c(_stringbool, "_stringbool");
function _stringFormat(e, o, i, a = {}) {
  let n = normalizeParams(a),
    r = {
      ...normalizeParams(a),
      check: "string_format",
      type: "string",
      format: o,
      fn: typeof i == "function" ? i : (l) => i.test(l),
      ...n,
    };
  return (i instanceof RegExp && (r.pattern = i), new e(r));
}
c(_stringFormat, "_stringFormat");
function initializeContext(e) {
  let o = e?.target ?? "draft-2020-12";
  return (
    o === "draft-4" && (o = "draft-04"),
    o === "draft-7" && (o = "draft-07"),
    {
      processors: e.processors ?? {},
      metadataRegistry: e?.metadata ?? F,
      target: o,
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
c(initializeContext, "initializeContext");
function M(e, o, i = { path: [], schemaPath: [] }) {
  var a;
  let n = e._zod.def,
    r = o.seen.get(e);
  if (r) return (r.count++, i.schemaPath.includes(e) && (r.cycle = i.path), r.schema);
  let s = { schema: {}, count: 1, cycle: void 0, path: i.path };
  o.seen.set(e, s);
  let l = e._zod.toJSONSchema?.();
  if (l) s.schema = l;
  else {
    let f = { ...i, schemaPath: [...i.schemaPath, e], path: i.path };
    if (e._zod.processJSONSchema) e._zod.processJSONSchema(o, s.schema, f);
    else {
      let v = s.schema,
        S = o.processors[n.type];
      if (!S) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${n.type}`);
      S(e, o, v, f);
    }
    let y = e._zod.parent;
    y && (s.ref || (s.ref = y), M(y, o, f), (o.seen.get(y).isParent = !0));
  }
  let u = o.metadataRegistry.get(e);
  return (
    u && Object.assign(s.schema, u),
    o.io === "input" && isTransforming(e) && (delete s.schema.examples, delete s.schema.default),
    o.io === "input" &&
      s.schema._prefault &&
      ((a = s.schema).default ?? (a.default = s.schema._prefault)),
    delete s.schema._prefault,
    o.seen.get(e).schema
  );
}
c(M, "process");
function extractDefs(e, o) {
  let i = e.seen.get(o);
  if (!i) throw new Error("Unprocessed schema. This is a bug in Zod.");
  let a = new Map();
  for (let s of e.seen.entries()) {
    let l = e.metadataRegistry.get(s[0])?.id;
    if (l) {
      let u = a.get(l);
      if (u && u !== s[0])
        throw new Error(
          `Duplicate schema id "${l}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`,
        );
      a.set(l, s[0]);
    }
  }
  let n = c((s) => {
      let l = e.target === "draft-2020-12" ? "$defs" : "definitions";
      if (e.external) {
        let y = e.external.registry.get(s[0])?.id,
          v = e.external.uri ?? ((z) => z);
        if (y) return { ref: v(y) };
        let S = s[1].defId ?? s[1].schema.id ?? `schema${e.counter++}`;
        return ((s[1].defId = S), { defId: S, ref: `${v("__shared")}#/${l}/${S}` });
      }
      if (s[1] === i) return { ref: "#" };
      let p = `#/${l}/`,
        f = s[1].schema.id ?? `__schema${e.counter++}`;
      return { defId: f, ref: p + f };
    }, "makeURI"),
    r = c((s) => {
      if (s[1].schema.$ref) return;
      let l = s[1],
        { ref: u, defId: p } = n(s);
      ((l.def = { ...l.schema }), p && (l.defId = p));
      let f = l.schema;
      for (let y in f) delete f[y];
      f.$ref = u;
    }, "extractToDef");
  if (e.cycles === "throw")
    for (let s of e.seen.entries()) {
      let l = s[1];
      if (l.cycle)
        throw new Error(`Cycle detected: #/${l.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (let s of e.seen.entries()) {
    let l = s[1];
    if (o === s[0]) {
      r(s);
      continue;
    }
    if (e.external) {
      let p = e.external.registry.get(s[0])?.id;
      if (o !== s[0] && p) {
        r(s);
        continue;
      }
    }
    if (e.metadataRegistry.get(s[0])?.id) {
      r(s);
      continue;
    }
    if (l.cycle) {
      r(s);
      continue;
    }
    if (l.count > 1 && e.reused === "ref") {
      r(s);
      continue;
    }
  }
}
c(extractDefs, "extractDefs");
function finalize(e, o) {
  let i = e.seen.get(o);
  if (!i) throw new Error("Unprocessed schema. This is a bug in Zod.");
  let a = c((s) => {
    let l = e.seen.get(s);
    if (l.ref === null) return;
    let u = l.def ?? l.schema,
      p = { ...u },
      f = l.ref;
    if (((l.ref = null), f)) {
      a(f);
      let v = e.seen.get(f),
        S = v.schema;
      if (
        (S.$ref &&
        (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0")
          ? ((u.allOf = u.allOf ?? []), u.allOf.push(S))
          : Object.assign(u, S),
        Object.assign(u, p),
        s._zod.parent === f)
      )
        for (let N in u) N === "$ref" || N === "allOf" || N in p || delete u[N];
      if (S.$ref && v.def)
        for (let N in u)
          N === "$ref" ||
            N === "allOf" ||
            (N in v.def && JSON.stringify(u[N]) === JSON.stringify(v.def[N]) && delete u[N]);
    }
    let y = s._zod.parent;
    if (y && y !== f) {
      a(y);
      let v = e.seen.get(y);
      if (v?.schema.$ref && ((u.$ref = v.schema.$ref), v.def))
        for (let S in u)
          S === "$ref" ||
            S === "allOf" ||
            (S in v.def && JSON.stringify(u[S]) === JSON.stringify(v.def[S]) && delete u[S]);
    }
    e.override({ zodSchema: s, jsonSchema: u, path: l.path ?? [] });
  }, "flattenRef");
  for (let s of [...e.seen.entries()].reverse()) a(s[0]);
  let n = {};
  if (
    (e.target === "draft-2020-12"
      ? (n.$schema = "https://json-schema.org/draft/2020-12/schema")
      : e.target === "draft-07"
        ? (n.$schema = "http://json-schema.org/draft-07/schema#")
        : e.target === "draft-04"
          ? (n.$schema = "http://json-schema.org/draft-04/schema#")
          : e.target,
    e.external?.uri)
  ) {
    let s = e.external.registry.get(o)?.id;
    if (!s) throw new Error("Schema is missing an `id` property");
    n.$id = e.external.uri(s);
  }
  Object.assign(n, i.def ?? i.schema);
  let r = e.external?.defs ?? {};
  for (let s of e.seen.entries()) {
    let l = s[1];
    l.def && l.defId && (r[l.defId] = l.def);
  }
  e.external ||
    (Object.keys(r).length > 0 &&
      (e.target === "draft-2020-12" ? (n.$defs = r) : (n.definitions = r)));
  try {
    let s = JSON.parse(JSON.stringify(n));
    return (
      Object.defineProperty(s, "~standard", {
        value: {
          ...o["~standard"],
          jsonSchema: {
            input: vt(o, "input", e.processors),
            output: vt(o, "output", e.processors),
          },
        },
        enumerable: !1,
        writable: !1,
      }),
      s
    );
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
c(finalize, "finalize");
function isTransforming(e, o) {
  let i = o ?? { seen: new Set() };
  if (i.seen.has(e)) return !1;
  i.seen.add(e);
  let a = e._zod.def;
  if (a.type === "transform") return !0;
  if (a.type === "array") return isTransforming(a.element, i);
  if (a.type === "set") return isTransforming(a.valueType, i);
  if (a.type === "lazy") return isTransforming(a.getter(), i);
  if (
    a.type === "promise" ||
    a.type === "optional" ||
    a.type === "nonoptional" ||
    a.type === "nullable" ||
    a.type === "readonly" ||
    a.type === "default" ||
    a.type === "prefault"
  )
    return isTransforming(a.innerType, i);
  if (a.type === "intersection") return isTransforming(a.left, i) || isTransforming(a.right, i);
  if (a.type === "record" || a.type === "map") return isTransforming(a.keyType, i) || isTransforming(a.valueType, i);
  if (a.type === "pipe") return isTransforming(a.in, i) || isTransforming(a.out, i);
  if (a.type === "object") {
    for (let n in a.shape) if (isTransforming(a.shape[n], i)) return !0;
    return !1;
  }
  if (a.type === "union") {
    for (let n of a.options) if (isTransforming(n, i)) return !0;
    return !1;
  }
  if (a.type === "tuple") {
    for (let n of a.items) if (isTransforming(n, i)) return !0;
    return !!(a.rest && isTransforming(a.rest, i));
  }
  return !1;
}
c(isTransforming, "isTransforming");
var vc = c(
    (e, o = {}) =>
      (i) => {
        let a = initializeContext({ ...i, processors: o });
        return (M(e, a), extractDefs(a, e), finalize(a, e));
      },
    "createToJSONSchemaMethod",
  ),
  vt = c(
    (e, o, i = {}) =>
      (a) => {
        let { libraryOptions: n, target: r } = a ?? {},
          s = initializeContext({ ...(n ?? {}), target: r, io: o, processors: i });
        return (M(e, s), extractDefs(s, e), finalize(s, e));
      },
    "createStandardJSONSchemaMethod",
  );
var $y = { guid: "uuid", url: "uri", datetime: "date-time", json_string: "json-string", regex: "" },
  Sc = c((e, o, i, a) => {
    let n = i;
    n.type = "string";
    let { minimum: r, maximum: s, format: l, patterns: u, contentEncoding: p } = e._zod.bag;
    if (
      (typeof r == "number" && (n.minLength = r),
      typeof s == "number" && (n.maxLength = s),
      l &&
        ((n.format = $y[l] ?? l),
        n.format === "" && delete n.format,
        l === "time" && delete n.format),
      p && (n.contentEncoding = p),
      u && u.size > 0)
    ) {
      let f = [...u];
      f.length === 1
        ? (n.pattern = f[0].source)
        : f.length > 1 &&
          (n.allOf = [
            ...f.map((y) => ({
              ...(o.target === "draft-07" || o.target === "draft-04" || o.target === "openapi-3.0"
                ? { type: "string" }
                : {}),
              pattern: y.source,
            })),
          ]);
    }
  }, "stringProcessor"),
  _c = c((e, o, i, a) => {
    let n = i,
      {
        minimum: r,
        maximum: s,
        format: l,
        multipleOf: u,
        exclusiveMaximum: p,
        exclusiveMinimum: f,
      } = e._zod.bag;
    (typeof l == "string" && l.includes("int") ? (n.type = "integer") : (n.type = "number"),
      typeof f == "number" &&
        (o.target === "draft-04" || o.target === "openapi-3.0"
          ? ((n.minimum = f), (n.exclusiveMinimum = !0))
          : (n.exclusiveMinimum = f)),
      typeof r == "number" &&
        ((n.minimum = r),
        typeof f == "number" &&
          o.target !== "draft-04" &&
          (f >= r ? delete n.minimum : delete n.exclusiveMinimum)),
      typeof p == "number" &&
        (o.target === "draft-04" || o.target === "openapi-3.0"
          ? ((n.maximum = p), (n.exclusiveMaximum = !0))
          : (n.exclusiveMaximum = p)),
      typeof s == "number" &&
        ((n.maximum = s),
        typeof p == "number" &&
          o.target !== "draft-04" &&
          (p <= s ? delete n.maximum : delete n.exclusiveMaximum)),
      typeof u == "number" && (n.multipleOf = u));
  }, "numberProcessor"),
  xc = c((e, o, i, a) => {
    i.type = "boolean";
  }, "booleanProcessor"),
  kc = c((e, o, i, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("BigInt cannot be represented in JSON Schema");
  }, "bigintProcessor"),
  Ic = c((e, o, i, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("Symbols cannot be represented in JSON Schema");
  }, "symbolProcessor"),
  Cc = c((e, o, i, a) => {
    o.target === "openapi-3.0"
      ? ((i.type = "string"), (i.nullable = !0), (i.enum = [null]))
      : (i.type = "null");
  }, "nullProcessor"),
  Rc = c((e, o, i, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("Undefined cannot be represented in JSON Schema");
  }, "undefinedProcessor"),
  Pc = c((e, o, i, a) => {
    if (o.unrepresentable === "throw") throw new Error("Void cannot be represented in JSON Schema");
  }, "voidProcessor"),
  Tc = c((e, o, i, a) => {
    i.not = {};
  }, "neverProcessor"),
  wc = c((e, o, i, a) => {}, "anyProcessor"),
  Ec = c((e, o, i, a) => {}, "unknownProcessor"),
  Oc = c((e, o, i, a) => {
    if (o.unrepresentable === "throw") throw new Error("Date cannot be represented in JSON Schema");
  }, "dateProcessor"),
  Ac = c((e, o, i, a) => {
    let n = e._zod.def,
      r = getEnumValues(n.entries);
    (r.every((s) => typeof s == "number") && (i.type = "number"),
      r.every((s) => typeof s == "string") && (i.type = "string"),
      (i.enum = r));
  }, "enumProcessor"),
  zc = c((e, o, i, a) => {
    let n = e._zod.def,
      r = [];
    for (let s of n.values)
      if (s === void 0) {
        if (o.unrepresentable === "throw")
          throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      } else if (typeof s == "bigint") {
        if (o.unrepresentable === "throw")
          throw new Error("BigInt literals cannot be represented in JSON Schema");
        r.push(Number(s));
      } else r.push(s);
    if (r.length !== 0)
      if (r.length === 1) {
        let s = r[0];
        ((i.type = s === null ? "null" : typeof s),
          o.target === "draft-04" || o.target === "openapi-3.0" ? (i.enum = [s]) : (i.const = s));
      } else
        (r.every((s) => typeof s == "number") && (i.type = "number"),
          r.every((s) => typeof s == "string") && (i.type = "string"),
          r.every((s) => typeof s == "boolean") && (i.type = "boolean"),
          r.every((s) => s === null) && (i.type = "null"),
          (i.enum = r));
  }, "literalProcessor"),
  Mc = c((e, o, i, a) => {
    if (o.unrepresentable === "throw") throw new Error("NaN cannot be represented in JSON Schema");
  }, "nanProcessor"),
  $c = c((e, o, i, a) => {
    let n = i,
      r = e._zod.pattern;
    if (!r) throw new Error("Pattern not found in template literal");
    ((n.type = "string"), (n.pattern = r.source));
  }, "templateLiteralProcessor"),
  Dc = c((e, o, i, a) => {
    let n = i,
      r = { type: "string", format: "binary", contentEncoding: "binary" },
      { minimum: s, maximum: l, mime: u } = e._zod.bag;
    (s !== void 0 && (r.minLength = s),
      l !== void 0 && (r.maxLength = l),
      u
        ? u.length === 1
          ? ((r.contentMediaType = u[0]), Object.assign(n, r))
          : (Object.assign(n, r), (n.anyOf = u.map((p) => ({ contentMediaType: p }))))
        : Object.assign(n, r));
  }, "fileProcessor"),
  Uc = c((e, o, i, a) => {
    i.type = "boolean";
  }, "successProcessor"),
  Nc = c((e, o, i, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("Custom types cannot be represented in JSON Schema");
  }, "customProcessor"),
  Zc = c((e, o, i, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("Function types cannot be represented in JSON Schema");
  }, "functionProcessor"),
  jc = c((e, o, i, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("Transforms cannot be represented in JSON Schema");
  }, "transformProcessor"),
  Bc = c((e, o, i, a) => {
    if (o.unrepresentable === "throw") throw new Error("Map cannot be represented in JSON Schema");
  }, "mapProcessor"),
  Lc = c((e, o, i, a) => {
    if (o.unrepresentable === "throw") throw new Error("Set cannot be represented in JSON Schema");
  }, "setProcessor"),
  Wc = c((e, o, i, a) => {
    let n = i,
      r = e._zod.def,
      { minimum: s, maximum: l } = e._zod.bag;
    (typeof s == "number" && (n.minItems = s),
      typeof l == "number" && (n.maxItems = l),
      (n.type = "array"),
      (n.items = M(r.element, o, { ...a, path: [...a.path, "items"] })));
  }, "arrayProcessor"),
  Fc = c((e, o, i, a) => {
    let n = i,
      r = e._zod.def;
    ((n.type = "object"), (n.properties = {}));
    let s = r.shape;
    for (let p in s) n.properties[p] = M(s[p], o, { ...a, path: [...a.path, "properties", p] });
    let l = new Set(Object.keys(s)),
      u = new Set(
        [...l].filter((p) => {
          let f = r.shape[p]._zod;
          return o.io === "input" ? f.optin === void 0 : f.optout === void 0;
        }),
      );
    (u.size > 0 && (n.required = Array.from(u)),
      r.catchall?._zod.def.type === "never"
        ? (n.additionalProperties = !1)
        : r.catchall
          ? r.catchall &&
            (n.additionalProperties = M(r.catchall, o, {
              ...a,
              path: [...a.path, "additionalProperties"],
            }))
          : o.io === "output" && (n.additionalProperties = !1));
  }, "objectProcessor"),
  wo = c((e, o, i, a) => {
    let n = e._zod.def,
      r = n.inclusive === !1,
      s = n.options.map((l, u) => M(l, o, { ...a, path: [...a.path, r ? "oneOf" : "anyOf", u] }));
    r ? (i.oneOf = s) : (i.anyOf = s);
  }, "unionProcessor"),
  qc = c((e, o, i, a) => {
    let n = e._zod.def,
      r = M(n.left, o, { ...a, path: [...a.path, "allOf", 0] }),
      s = M(n.right, o, { ...a, path: [...a.path, "allOf", 1] }),
      l = c((p) => "allOf" in p && Object.keys(p).length === 1, "isSimpleIntersection"),
      u = [...(l(r) ? r.allOf : [r]), ...(l(s) ? s.allOf : [s])];
    i.allOf = u;
  }, "intersectionProcessor"),
  Vc = c((e, o, i, a) => {
    let n = i,
      r = e._zod.def;
    n.type = "array";
    let s = o.target === "draft-2020-12" ? "prefixItems" : "items",
      l = o.target === "draft-2020-12" || o.target === "openapi-3.0" ? "items" : "additionalItems",
      u = r.items.map((v, S) => M(v, o, { ...a, path: [...a.path, s, S] })),
      p = r.rest
        ? M(r.rest, o, {
            ...a,
            path: [...a.path, l, ...(o.target === "openapi-3.0" ? [r.items.length] : [])],
          })
        : null;
    o.target === "draft-2020-12"
      ? ((n.prefixItems = u), p && (n.items = p))
      : o.target === "openapi-3.0"
        ? ((n.items = { anyOf: u }),
          p && n.items.anyOf.push(p),
          (n.minItems = u.length),
          p || (n.maxItems = u.length))
        : ((n.items = u), p && (n.additionalItems = p));
    let { minimum: f, maximum: y } = e._zod.bag;
    (typeof f == "number" && (n.minItems = f), typeof y == "number" && (n.maxItems = y));
  }, "tupleProcessor"),
  Gc = c((e, o, i, a) => {
    let n = i,
      r = e._zod.def;
    n.type = "object";
    let s = r.keyType,
      u = s._zod.bag?.patterns;
    if (r.mode === "loose" && u && u.size > 0) {
      let f = M(r.valueType, o, { ...a, path: [...a.path, "patternProperties", "*"] });
      n.patternProperties = {};
      for (let y of u) n.patternProperties[y.source] = f;
    } else
      ((o.target === "draft-07" || o.target === "draft-2020-12") &&
        (n.propertyNames = M(r.keyType, o, { ...a, path: [...a.path, "propertyNames"] })),
        (n.additionalProperties = M(r.valueType, o, {
          ...a,
          path: [...a.path, "additionalProperties"],
        })));
    let p = s._zod.values;
    if (p) {
      let f = [...p].filter((y) => typeof y == "string" || typeof y == "number");
      f.length > 0 && (n.required = f);
    }
  }, "recordProcessor"),
  Kc = c((e, o, i, a) => {
    let n = e._zod.def,
      r = M(n.innerType, o, a),
      s = o.seen.get(e);
    o.target === "openapi-3.0"
      ? ((s.ref = n.innerType), (i.nullable = !0))
      : (i.anyOf = [r, { type: "null" }]);
  }, "nullableProcessor"),
  Hc = c((e, o, i, a) => {
    let n = e._zod.def;
    M(n.innerType, o, a);
    let r = o.seen.get(e);
    r.ref = n.innerType;
  }, "nonoptionalProcessor"),
  Jc = c((e, o, i, a) => {
    let n = e._zod.def;
    M(n.innerType, o, a);
    let r = o.seen.get(e);
    ((r.ref = n.innerType), (i.default = JSON.parse(JSON.stringify(n.defaultValue))));
  }, "defaultProcessor"),
  Yc = c((e, o, i, a) => {
    let n = e._zod.def;
    M(n.innerType, o, a);
    let r = o.seen.get(e);
    ((r.ref = n.innerType),
      o.io === "input" && (i._prefault = JSON.parse(JSON.stringify(n.defaultValue))));
  }, "prefaultProcessor"),
  Xc = c((e, o, i, a) => {
    let n = e._zod.def;
    M(n.innerType, o, a);
    let r = o.seen.get(e);
    r.ref = n.innerType;
    let s;
    try {
      s = n.catchValue(void 0);
    } catch {
      throw new Error("Dynamic catch values are not supported in JSON Schema");
    }
    i.default = s;
  }, "catchProcessor"),
  Qc = c((e, o, i, a) => {
    let n = e._zod.def,
      r = o.io === "input" ? (n.in._zod.def.type === "transform" ? n.out : n.in) : n.out;
    M(r, o, a);
    let s = o.seen.get(e);
    s.ref = r;
  }, "pipeProcessor"),
  el = c((e, o, i, a) => {
    let n = e._zod.def;
    M(n.innerType, o, a);
    let r = o.seen.get(e);
    ((r.ref = n.innerType), (i.readOnly = !0));
  }, "readonlyProcessor"),
  tl = c((e, o, i, a) => {
    let n = e._zod.def;
    M(n.innerType, o, a);
    let r = o.seen.get(e);
    r.ref = n.innerType;
  }, "promiseProcessor"),
  Eo = c((e, o, i, a) => {
    let n = e._zod.def;
    M(n.innerType, o, a);
    let r = o.seen.get(e);
    r.ref = n.innerType;
  }, "optionalProcessor"),
  nl = c((e, o, i, a) => {
    let n = e._zod.innerType;
    M(n, o, a);
    let r = o.seen.get(e);
    r.ref = n;
  }, "lazyProcessor"),
  To = {
    string: Sc,
    number: _c,
    boolean: xc,
    bigint: kc,
    symbol: Ic,
    null: Cc,
    undefined: Rc,
    void: Pc,
    never: Tc,
    any: wc,
    unknown: Ec,
    date: Oc,
    enum: Ac,
    literal: zc,
    nan: Mc,
    template_literal: $c,
    file: Dc,
    success: Uc,
    custom: Nc,
    function: Zc,
    transform: jc,
    map: Bc,
    set: Lc,
    array: Wc,
    object: Fc,
    union: wo,
    intersection: qc,
    tuple: Vc,
    record: Gc,
    nullable: Kc,
    nonoptional: Hc,
    default: Jc,
    prefault: Yc,
    catch: Xc,
    pipe: Qc,
    readonly: el,
    promise: tl,
    optional: Eo,
    lazy: nl,
  };
function toJSONSchema(e, o) {
  if ("_idmap" in e) {
    let a = e,
      n = initializeContext({ ...o, processors: To }),
      r = {};
    for (let u of a._idmap.entries()) {
      let [p, f] = u;
      M(f, n);
    }
    let s = {},
      l = { registry: a, uri: o?.uri, defs: r };
    n.external = l;
    for (let u of a._idmap.entries()) {
      let [p, f] = u;
      (extractDefs(n, f), (s[p] = finalize(n, f)));
    }
    if (Object.keys(r).length > 0) {
      let u = n.target === "draft-2020-12" ? "$defs" : "definitions";
      s.__shared = { [u]: r };
    }
    return { schemas: s };
  }
  let i = initializeContext({ ...o, processors: To });
  return (M(e, i), extractDefs(i, e), finalize(i, e));
}
c(toJSONSchema, "toJSONSchema");
var Ao = class {
  static {
    c(this, "JSONSchemaGenerator");
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
  set counter(o) {
    this.ctx.counter = o;
  }
  get seen() {
    return this.ctx.seen;
  }
  constructor(o) {
    let i = o?.target ?? "draft-2020-12";
    (i === "draft-4" && (i = "draft-04"),
      i === "draft-7" && (i = "draft-07"),
      (this.ctx = initializeContext({
        processors: To,
        target: i,
        ...(o?.metadata && { metadata: o.metadata }),
        ...(o?.unrepresentable && { unrepresentable: o.unrepresentable }),
        ...(o?.override && { override: o.override }),
        ...(o?.io && { io: o.io }),
      })));
  }
  process(o, i = { path: [], schemaPath: [] }) {
    return M(o, this.ctx, i);
  }
  emit(o, i) {
    (i &&
      (i.cycles && (this.ctx.cycles = i.cycles),
      i.reused && (this.ctx.reused = i.reused),
      i.external && (this.ctx.external = i.external)),
      extractDefs(this.ctx, o));
    let a = finalize(this.ctx, o),
      { "~standard": n, ...r } = a;
    return r;
  }
};
var $u = {};
var cn = {};
ye(cn, {
  ZodAny: () => Rl,
  ZodArray: () => El,
  ZodBase64: () => Qo,
  ZodBase64URL: () => er,
  ZodBigInt: () => Rt,
  ZodBigIntFormat: () => or,
  ZodBoolean: () => Ct,
  ZodCIDRv4: () => Yo,
  ZodCIDRv6: () => Xo,
  ZodCUID: () => Fo,
  ZodCUID2: () => qo,
  ZodCatch: () => Xl,
  ZodCodec: () => ur,
  ZodCustom: () => vn,
  ZodCustomStringFormat: () => kt,
  ZodDate: () => gn,
  ZodDefault: () => Vl,
  ZodDiscriminatedUnion: () => Al,
  ZodE164: () => tr,
  ZodEmail: () => Bo,
  ZodEmoji: () => Lo,
  ZodEnum: () => _t,
  ZodExactOptional: () => Wl,
  ZodFile: () => Bl,
  ZodFunction: () => sd,
  ZodGUID: () => ln,
  ZodIPv4: () => Ho,
  ZodIPv6: () => Jo,
  ZodIntersection: () => zl,
  ZodJWT: () => nr,
  ZodKSUID: () => Ko,
  ZodLazy: () => rd,
  ZodLiteral: () => jl,
  ZodMAC: () => vl,
  ZodMap: () => Nl,
  ZodNaN: () => ed,
  ZodNanoID: () => Wo,
  ZodNever: () => Tl,
  ZodNonOptional: () => lr,
  ZodNull: () => Il,
  ZodNullable: () => ql,
  ZodNumber: () => It,
  ZodNumberFormat: () => Fe,
  ZodObject: () => hn,
  ZodOptional: () => cr,
  ZodPipe: () => dr,
  ZodPrefault: () => Kl,
  ZodPromise: () => ad,
  ZodReadonly: () => td,
  ZodRecord: () => bn,
  ZodSet: () => Zl,
  ZodString: () => xt,
  ZodStringFormat: () => D,
  ZodSuccess: () => Yl,
  ZodSymbol: () => xl,
  ZodTemplateLiteral: () => od,
  ZodTransform: () => Ll,
  ZodTuple: () => $l,
  ZodType: () => w,
  ZodULID: () => Vo,
  ZodURL: () => mn,
  ZodUUID: () => fe,
  ZodUndefined: () => kl,
  ZodUnion: () => yn,
  ZodUnknown: () => Pl,
  ZodVoid: () => wl,
  ZodXID: () => Go,
  ZodXor: () => Ol,
  _ZodString: () => jo,
  _default: () => Gl,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base64,
  base64url: () => base64url,
  bigint: () => bigint,
  boolean: () => boolean,
  catch: () => Ql,
  check: () => check,
  cidrv4: () => cidrv4,
  cidrv6: () => cidrv6,
  codec: () => codec,
  cuid: () => cuid,
  cuid2: () => cuid2,
  custom: () => custom,
  date: () => xp,
  describe: () => qp,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e164,
  email: () => email,
  emoji: () => qu,
  enum: () => ar,
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
  meta: () => Vp,
  nan: () => nan,
  nanoid: () => nanoid,
  nativeEnum: () => nativeEnum,
  never: () => never,
  nonoptional: () => nonoptional,
  null: () => Cl,
  nullable: () => nullable,
  nullish: () => Dp,
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
  stringbool: () => Kp,
  success: () => success,
  superRefine: () => superRefine,
  symbol: () => symbol,
  templateLiteral: () => templateLiteral,
  transform: () => transform,
  tuple: () => tuple,
  uint32: () => uint32,
  uint64: () => uint64,
  ulid: () => ulid,
  undefined: () => vp,
  union: () => union,
  unknown: () => unknown,
  url: () => url,
  uuid: () => uuid,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => _p,
  xid: () => xid,
  xor: () => xor,
});
var zo = {};
ye(zo, {
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
var St = {};
ye(St, {
  ZodISODate: () => $o,
  ZodISODateTime: () => Mo,
  ZodISODuration: () => Uo,
  ZodISOTime: () => Do,
  date: () => date,
  datetime: () => ol,
  duration: () => duration,
  time: () => il,
});
var Mo = $constructor("ZodISODateTime", (e, o) => {
  (Li.init(e, o), D.init(e, o));
});
function ol(e) {
  return _isoDateTime(Mo, e);
}
c(ol, "datetime");
var $o = $constructor("ZodISODate", (e, o) => {
  (Wi.init(e, o), D.init(e, o));
});
function date(e) {
  return _isoDate($o, e);
}
c(date, "date");
var Do = $constructor("ZodISOTime", (e, o) => {
  (Fi.init(e, o), D.init(e, o));
});
function il(e) {
  return _isoTime(Do, e);
}
c(il, "time");
var Uo = $constructor("ZodISODuration", (e, o) => {
  (qi.init(e, o), D.init(e, o));
});
function duration(e) {
  return _isoDuration(Uo, e);
}
c(duration, "duration");
var Du = c((e, o) => {
    (qt.init(e, o),
      (e.name = "ZodError"),
      Object.defineProperties(e, {
        format: { value: c((i) => formatError(e, i), "value") },
        flatten: { value: c((i) => flattenError(e, i), "value") },
        addIssue: {
          value: c((i) => {
            (e.issues.push(i), (e.message = JSON.stringify(e.issues, jsonStringifyReplacer, 2)));
          }, "value"),
        },
        addIssues: {
          value: c((i) => {
            (e.issues.push(...i), (e.message = JSON.stringify(e.issues, jsonStringifyReplacer, 2)));
          }, "value"),
        },
        isEmpty: {
          get() {
            return e.issues.length === 0;
          },
        },
      }));
  }, "initializer"),
  Uy = $constructor("ZodError", Du),
  Q = $constructor("ZodError", Du, { Parent: Error });
var sl = et(Q),
  cl = tt(Q),
  ll = nt(Q),
  dl = ot(Q),
  ul = zn(Q),
  pl = Mn(Q),
  ml = $n(Q),
  gl = Dn(Q),
  fl = Un(Q),
  hl = Nn(Q),
  yl = Zn(Q),
  bl = jn(Q);
var w = $constructor(
    "ZodType",
    (e, o) => (
      T.init(e, o),
      Object.assign(e["~standard"], {
        jsonSchema: { input: vt(e, "input"), output: vt(e, "output") },
      }),
      (e.toJSONSchema = vc(e, {})),
      (e.def = o),
      (e.type = o.type),
      Object.defineProperty(e, "_def", { value: o }),
      (e.check = (...i) =>
        e.clone(
          k.mergeDefs(o, {
            checks: [
              ...(o.checks ?? []),
              ...i.map((a) =>
                typeof a == "function"
                  ? { _zod: { check: a, def: { check: "custom" }, onattach: [] } }
                  : a,
              ),
            ],
          }),
          { parent: !0 },
        )),
      (e.with = e.check),
      (e.clone = (i, a) => clone(e, i, a)),
      (e.brand = () => e),
      (e.register = (i, a) => (i.add(e, a), e)),
      (e.parse = (i, a) => sl(e, i, a, { callee: e.parse })),
      (e.safeParse = (i, a) => ll(e, i, a)),
      (e.parseAsync = async (i, a) => cl(e, i, a, { callee: e.parseAsync })),
      (e.safeParseAsync = async (i, a) => dl(e, i, a)),
      (e.spa = e.safeParseAsync),
      (e.encode = (i, a) => ul(e, i, a)),
      (e.decode = (i, a) => pl(e, i, a)),
      (e.encodeAsync = async (i, a) => ml(e, i, a)),
      (e.decodeAsync = async (i, a) => gl(e, i, a)),
      (e.safeEncode = (i, a) => fl(e, i, a)),
      (e.safeDecode = (i, a) => hl(e, i, a)),
      (e.safeEncodeAsync = async (i, a) => yl(e, i, a)),
      (e.safeDecodeAsync = async (i, a) => bl(e, i, a)),
      (e.refine = (i, a) => e.check(refine(i, a))),
      (e.superRefine = (i) => e.check(superRefine(i))),
      (e.overwrite = (i) => e.check(_overwrite(i))),
      (e.optional = () => optional(e)),
      (e.exactOptional = () => exactOptional(e)),
      (e.nullable = () => nullable(e)),
      (e.nullish = () => optional(nullable(e))),
      (e.nonoptional = (i) => nonoptional(e, i)),
      (e.array = () => array(e)),
      (e.or = (i) => union([e, i])),
      (e.and = (i) => intersection(e, i)),
      (e.transform = (i) => pipe(e, transform(i))),
      (e.default = (i) => Gl(e, i)),
      (e.prefault = (i) => prefault(e, i)),
      (e.catch = (i) => Ql(e, i)),
      (e.pipe = (i) => pipe(e, i)),
      (e.readonly = () => readonly(e)),
      (e.describe = (i) => {
        let a = e.clone();
        return (F.add(a, { description: i }), a);
      }),
      Object.defineProperty(e, "description", {
        get() {
          return F.get(e)?.description;
        },
        configurable: !0,
      }),
      (e.meta = (...i) => {
        if (i.length === 0) return F.get(e);
        let a = e.clone();
        return (F.add(a, i[0]), a);
      }),
      (e.isOptional = () => e.safeParse(void 0).success),
      (e.isNullable = () => e.safeParse(null).success),
      (e.apply = (i) => i(e)),
      e
    ),
  ),
  jo = $constructor("_ZodString", (e, o) => {
    (Ze.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (a, n, r) => Sc(e, a, n, r)));
    let i = e._zod.bag;
    ((e.format = i.format ?? null),
      (e.minLength = i.minimum ?? null),
      (e.maxLength = i.maximum ?? null),
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
  xt = $constructor("ZodString", (e, o) => {
    (Ze.init(e, o),
      jo.init(e, o),
      (e.email = (i) => e.check(_email(Bo, i))),
      (e.url = (i) => e.check(_url(mn, i))),
      (e.jwt = (i) => e.check(_jwt(nr, i))),
      (e.emoji = (i) => e.check(_emoji(Lo, i))),
      (e.guid = (i) => e.check(_guid(ln, i))),
      (e.uuid = (i) => e.check(_uuid(fe, i))),
      (e.uuidv4 = (i) => e.check(_uuidv4(fe, i))),
      (e.uuidv6 = (i) => e.check(_uuidv6(fe, i))),
      (e.uuidv7 = (i) => e.check(_uuidv7(fe, i))),
      (e.nanoid = (i) => e.check(_nanoid(Wo, i))),
      (e.guid = (i) => e.check(_guid(ln, i))),
      (e.cuid = (i) => e.check(_cuid(Fo, i))),
      (e.cuid2 = (i) => e.check(_cuid2(qo, i))),
      (e.ulid = (i) => e.check(_ulid(Vo, i))),
      (e.base64 = (i) => e.check(_base64(Qo, i))),
      (e.base64url = (i) => e.check(_base64url(er, i))),
      (e.xid = (i) => e.check(_xid(Go, i))),
      (e.ksuid = (i) => e.check(_ksuid(Ko, i))),
      (e.ipv4 = (i) => e.check(_ipv4(Ho, i))),
      (e.ipv6 = (i) => e.check(_ipv6(Jo, i))),
      (e.cidrv4 = (i) => e.check(_cidrv4(Yo, i))),
      (e.cidrv6 = (i) => e.check(_cidrv6(Xo, i))),
      (e.e164 = (i) => e.check(_e164(tr, i))),
      (e.datetime = (i) => e.check(ol(i))),
      (e.date = (i) => e.check(date(i))),
      (e.time = (i) => e.check(il(i))),
      (e.duration = (i) => e.check(duration(i))));
  });
function string(e) {
  return _string(xt, e);
}
c(string, "string");
var D = $constructor("ZodStringFormat", (e, o) => {
    ($.init(e, o), jo.init(e, o));
  }),
  Bo = $constructor("ZodEmail", (e, o) => {
    (zi.init(e, o), D.init(e, o));
  });
function email(e) {
  return _email(Bo, e);
}
c(email, "email");
var ln = $constructor("ZodGUID", (e, o) => {
  (Oi.init(e, o), D.init(e, o));
});
function guid(e) {
  return _guid(ln, e);
}
c(guid, "guid");
var fe = $constructor("ZodUUID", (e, o) => {
  (Ai.init(e, o), D.init(e, o));
});
function uuid(e) {
  return _uuid(fe, e);
}
c(uuid, "uuid");
function uuidv4(e) {
  return _uuidv4(fe, e);
}
c(uuidv4, "uuidv4");
function uuidv6(e) {
  return _uuidv6(fe, e);
}
c(uuidv6, "uuidv6");
function uuidv7(e) {
  return _uuidv7(fe, e);
}
c(uuidv7, "uuidv7");
var mn = $constructor("ZodURL", (e, o) => {
  (Mi.init(e, o), D.init(e, o));
});
function url(e) {
  return _url(mn, e);
}
c(url, "url");
function httpUrl(e) {
  return _url(mn, { protocol: /^https?$/, hostname: se.domain, ...k.normalizeParams(e) });
}
c(httpUrl, "httpUrl");
var Lo = $constructor("ZodEmoji", (e, o) => {
  ($i.init(e, o), D.init(e, o));
});
function qu(e) {
  return _emoji(Lo, e);
}
c(qu, "emoji");
var Wo = $constructor("ZodNanoID", (e, o) => {
  (Di.init(e, o), D.init(e, o));
});
function nanoid(e) {
  return _nanoid(Wo, e);
}
c(nanoid, "nanoid");
var Fo = $constructor("ZodCUID", (e, o) => {
  (Ui.init(e, o), D.init(e, o));
});
function cuid(e) {
  return _cuid(Fo, e);
}
c(cuid, "cuid");
var qo = $constructor("ZodCUID2", (e, o) => {
  (Ni.init(e, o), D.init(e, o));
});
function cuid2(e) {
  return _cuid2(qo, e);
}
c(cuid2, "cuid2");
var Vo = $constructor("ZodULID", (e, o) => {
  (Zi.init(e, o), D.init(e, o));
});
function ulid(e) {
  return _ulid(Vo, e);
}
c(ulid, "ulid");
var Go = $constructor("ZodXID", (e, o) => {
  (ji.init(e, o), D.init(e, o));
});
function xid(e) {
  return _xid(Go, e);
}
c(xid, "xid");
var Ko = $constructor("ZodKSUID", (e, o) => {
  (Bi.init(e, o), D.init(e, o));
});
function ksuid(e) {
  return _ksuid(Ko, e);
}
c(ksuid, "ksuid");
var Ho = $constructor("ZodIPv4", (e, o) => {
  (Vi.init(e, o), D.init(e, o));
});
function ipv4(e) {
  return _ipv4(Ho, e);
}
c(ipv4, "ipv4");
var vl = $constructor("ZodMAC", (e, o) => {
  (Ki.init(e, o), D.init(e, o));
});
function mac(e) {
  return _mac(vl, e);
}
c(mac, "mac");
var Jo = $constructor("ZodIPv6", (e, o) => {
  (Gi.init(e, o), D.init(e, o));
});
function ipv6(e) {
  return _ipv6(Jo, e);
}
c(ipv6, "ipv6");
var Yo = $constructor("ZodCIDRv4", (e, o) => {
  (Hi.init(e, o), D.init(e, o));
});
function cidrv4(e) {
  return _cidrv4(Yo, e);
}
c(cidrv4, "cidrv4");
var Xo = $constructor("ZodCIDRv6", (e, o) => {
  (Ji.init(e, o), D.init(e, o));
});
function cidrv6(e) {
  return _cidrv6(Xo, e);
}
c(cidrv6, "cidrv6");
var Qo = $constructor("ZodBase64", (e, o) => {
  (Xi.init(e, o), D.init(e, o));
});
function base64(e) {
  return _base64(Qo, e);
}
c(base64, "base64");
var er = $constructor("ZodBase64URL", (e, o) => {
  (Qi.init(e, o), D.init(e, o));
});
function base64url(e) {
  return _base64url(er, e);
}
c(base64url, "base64url");
var tr = $constructor("ZodE164", (e, o) => {
  (ea.init(e, o), D.init(e, o));
});
function e164(e) {
  return _e164(tr, e);
}
c(e164, "e164");
var nr = $constructor("ZodJWT", (e, o) => {
  (ta.init(e, o), D.init(e, o));
});
function jwt(e) {
  return _jwt(nr, e);
}
c(jwt, "jwt");
var kt = $constructor("ZodCustomStringFormat", (e, o) => {
  (na.init(e, o), D.init(e, o));
});
function stringFormat(e, o, i = {}) {
  return _stringFormat(kt, e, o, i);
}
c(stringFormat, "stringFormat");
function hostname(e) {
  return _stringFormat(kt, "hostname", se.hostname, e);
}
c(hostname, "hostname");
function hex(e) {
  return _stringFormat(kt, "hex", se.hex, e);
}
c(hex, "hex");
function hash(e, o) {
  let i = o?.enc ?? "hex",
    a = `${e}_${i}`,
    n = se[a];
  if (!n) throw new Error(`Unrecognized hash format: ${a}`);
  return _stringFormat(kt, a, n, o);
}
c(hash, "hash");
var It = $constructor("ZodNumber", (e, o) => {
  (Jn.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (a, n, r) => _c(e, a, n, r)),
    (e.gt = (a, n) => e.check(_gt(a, n))),
    (e.gte = (a, n) => e.check(_gte(a, n))),
    (e.min = (a, n) => e.check(_gte(a, n))),
    (e.lt = (a, n) => e.check(_lt(a, n))),
    (e.lte = (a, n) => e.check(_lte(a, n))),
    (e.max = (a, n) => e.check(_lte(a, n))),
    (e.int = (a) => e.check(int(a))),
    (e.safe = (a) => e.check(int(a))),
    (e.positive = (a) => e.check(_gt(0, a))),
    (e.nonnegative = (a) => e.check(_gte(0, a))),
    (e.negative = (a) => e.check(_lt(0, a))),
    (e.nonpositive = (a) => e.check(_lte(0, a))),
    (e.multipleOf = (a, n) => e.check(_multipleOf(a, n))),
    (e.step = (a, n) => e.check(_multipleOf(a, n))),
    (e.finite = () => e));
  let i = e._zod.bag;
  ((e.minValue =
    Math.max(
      i.minimum ?? Number.NEGATIVE_INFINITY,
      i.exclusiveMinimum ?? Number.NEGATIVE_INFINITY,
    ) ?? null),
    (e.maxValue =
      Math.min(
        i.maximum ?? Number.POSITIVE_INFINITY,
        i.exclusiveMaximum ?? Number.POSITIVE_INFINITY,
      ) ?? null),
    (e.isInt = (i.format ?? "").includes("int") || Number.isSafeInteger(i.multipleOf ?? 0.5)),
    (e.isFinite = !0),
    (e.format = i.format ?? null));
});
function number(e) {
  return _number(It, e);
}
c(number, "number");
var Fe = $constructor("ZodNumberFormat", (e, o) => {
  (oa.init(e, o), It.init(e, o));
});
function int(e) {
  return _int(Fe, e);
}
c(int, "int");
function float32(e) {
  return _float32(Fe, e);
}
c(float32, "float32");
function float64(e) {
  return _float64(Fe, e);
}
c(float64, "float64");
function int32(e) {
  return _int32(Fe, e);
}
c(int32, "int32");
function uint32(e) {
  return _uint32(Fe, e);
}
c(uint32, "uint32");
var Ct = $constructor("ZodBoolean", (e, o) => {
  (Yt.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => xc(e, i, a, n)));
});
function boolean(e) {
  return _boolean(Ct, e);
}
c(boolean, "boolean");
var Rt = $constructor("ZodBigInt", (e, o) => {
  (Yn.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (a, n, r) => kc(e, a, n, r)),
    (e.gte = (a, n) => e.check(_gte(a, n))),
    (e.min = (a, n) => e.check(_gte(a, n))),
    (e.gt = (a, n) => e.check(_gt(a, n))),
    (e.gte = (a, n) => e.check(_gte(a, n))),
    (e.min = (a, n) => e.check(_gte(a, n))),
    (e.lt = (a, n) => e.check(_lt(a, n))),
    (e.lte = (a, n) => e.check(_lte(a, n))),
    (e.max = (a, n) => e.check(_lte(a, n))),
    (e.positive = (a) => e.check(_gt(BigInt(0), a))),
    (e.negative = (a) => e.check(_lt(BigInt(0), a))),
    (e.nonpositive = (a) => e.check(_lte(BigInt(0), a))),
    (e.nonnegative = (a) => e.check(_gte(BigInt(0), a))),
    (e.multipleOf = (a, n) => e.check(_multipleOf(a, n))));
  let i = e._zod.bag;
  ((e.minValue = i.minimum ?? null),
    (e.maxValue = i.maximum ?? null),
    (e.format = i.format ?? null));
});
function bigint(e) {
  return _bigint(Rt, e);
}
c(bigint, "bigint");
var or = $constructor("ZodBigIntFormat", (e, o) => {
  (ra.init(e, o), Rt.init(e, o));
});
function int64(e) {
  return _int64(or, e);
}
c(int64, "int64");
function uint64(e) {
  return _uint64(or, e);
}
c(uint64, "uint64");
var xl = $constructor("ZodSymbol", (e, o) => {
  (ia.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => Ic(e, i, a, n)));
});
function symbol(e) {
  return _symbol(xl, e);
}
c(symbol, "symbol");
var kl = $constructor("ZodUndefined", (e, o) => {
  (aa.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => Rc(e, i, a, n)));
});
function vp(e) {
  return _undefined(kl, e);
}
c(vp, "_undefined");
var Il = $constructor("ZodNull", (e, o) => {
  (sa.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => Cc(e, i, a, n)));
});
function Cl(e) {
  return _null(Il, e);
}
c(Cl, "_null");
var Rl = $constructor("ZodAny", (e, o) => {
  (ca.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => wc(e, i, a, n)));
});
function any() {
  return _any(Rl);
}
c(any, "any");
var Pl = $constructor("ZodUnknown", (e, o) => {
  (la.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => Ec(e, i, a, n)));
});
function unknown() {
  return _unknown(Pl);
}
c(unknown, "unknown");
var Tl = $constructor("ZodNever", (e, o) => {
  (da.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => Tc(e, i, a, n)));
});
function never(e) {
  return _never(Tl, e);
}
c(never, "never");
var wl = $constructor("ZodVoid", (e, o) => {
  (ua.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => Pc(e, i, a, n)));
});
function _p(e) {
  return _void(wl, e);
}
c(_p, "_void");
var gn = $constructor("ZodDate", (e, o) => {
  (pa.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (a, n, r) => Oc(e, a, n, r)),
    (e.min = (a, n) => e.check(_gte(a, n))),
    (e.max = (a, n) => e.check(_lte(a, n))));
  let i = e._zod.bag;
  ((e.minDate = i.minimum ? new Date(i.minimum) : null),
    (e.maxDate = i.maximum ? new Date(i.maximum) : null));
});
function xp(e) {
  return _date(gn, e);
}
c(xp, "date");
var El = $constructor("ZodArray", (e, o) => {
  (ma.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Wc(e, i, a, n)),
    (e.element = o.element),
    (e.min = (i, a) => e.check(_minLength(i, a))),
    (e.nonempty = (i) => e.check(_minLength(1, i))),
    (e.max = (i, a) => e.check(_maxLength(i, a))),
    (e.length = (i, a) => e.check(_length(i, a))),
    (e.unwrap = () => e.element));
});
function array(e, o) {
  return _array(El, e, o);
}
c(array, "array");
function keyof(e) {
  let o = e._zod.def.shape;
  return ar(Object.keys(o));
}
c(keyof, "keyof");
var hn = $constructor("ZodObject", (e, o) => {
  (ga.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Fc(e, i, a, n)),
    k.defineLazy(e, "shape", () => o.shape),
    (e.keyof = () => ar(Object.keys(e._zod.def.shape))),
    (e.catchall = (i) => e.clone({ ...e._zod.def, catchall: i })),
    (e.passthrough = () => e.clone({ ...e._zod.def, catchall: unknown() })),
    (e.loose = () => e.clone({ ...e._zod.def, catchall: unknown() })),
    (e.strict = () => e.clone({ ...e._zod.def, catchall: never() })),
    (e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 })),
    (e.extend = (i) => k.extend(e, i)),
    (e.safeExtend = (i) => k.safeExtend(e, i)),
    (e.merge = (i) => k.merge(e, i)),
    (e.pick = (i) => k.pick(e, i)),
    (e.omit = (i) => k.omit(e, i)),
    (e.partial = (...i) => k.partial(cr, e, i[0])),
    (e.required = (...i) => k.required(lr, e, i[0])));
});
function object(e, o) {
  let i = { type: "object", shape: e ?? {}, ...k.normalizeParams(o) };
  return new hn(i);
}
c(object, "object");
function strictObject(e, o) {
  return new hn({ type: "object", shape: e, catchall: never(), ...k.normalizeParams(o) });
}
c(strictObject, "strictObject");
function looseObject(e, o) {
  return new hn({ type: "object", shape: e, catchall: unknown(), ...k.normalizeParams(o) });
}
c(looseObject, "looseObject");
var yn = $constructor("ZodUnion", (e, o) => {
  (Xt.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => wo(e, i, a, n)),
    (e.options = o.options));
});
function union(e, o) {
  return new yn({ type: "union", options: e, ...k.normalizeParams(o) });
}
c(union, "union");
var Ol = $constructor("ZodXor", (e, o) => {
  (yn.init(e, o),
    fa.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => wo(e, i, a, n)),
    (e.options = o.options));
});
function xor(e, o) {
  return new Ol({ type: "union", options: e, inclusive: !1, ...k.normalizeParams(o) });
}
c(xor, "xor");
var Al = $constructor("ZodDiscriminatedUnion", (e, o) => {
  (yn.init(e, o), ha.init(e, o));
});
function discriminatedUnion(e, o, i) {
  return new Al({ type: "union", options: o, discriminator: e, ...k.normalizeParams(i) });
}
c(discriminatedUnion, "discriminatedUnion");
var zl = $constructor("ZodIntersection", (e, o) => {
  (ya.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => qc(e, i, a, n)));
});
function intersection(e, o) {
  return new zl({ type: "intersection", left: e, right: o });
}
c(intersection, "intersection");
var $l = $constructor("ZodTuple", (e, o) => {
  (Xn.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Vc(e, i, a, n)),
    (e.rest = (i) => e.clone({ ...e._zod.def, rest: i })));
});
function tuple(e, o, i) {
  let a = o instanceof T,
    n = a ? i : o,
    r = a ? o : null;
  return new $l({ type: "tuple", items: e, rest: r, ...k.normalizeParams(n) });
}
c(tuple, "tuple");
var bn = $constructor("ZodRecord", (e, o) => {
  (ba.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Gc(e, i, a, n)),
    (e.keyType = o.keyType),
    (e.valueType = o.valueType));
});
function record(e, o, i) {
  return new bn({ type: "record", keyType: e, valueType: o, ...k.normalizeParams(i) });
}
c(record, "record");
function partialRecord(e, o, i) {
  let a = clone(e);
  return (
    (a._zod.values = void 0),
    new bn({ type: "record", keyType: a, valueType: o, ...k.normalizeParams(i) })
  );
}
c(partialRecord, "partialRecord");
function looseRecord(e, o, i) {
  return new bn({
    type: "record",
    keyType: e,
    valueType: o,
    mode: "loose",
    ...k.normalizeParams(i),
  });
}
c(looseRecord, "looseRecord");
var Nl = $constructor("ZodMap", (e, o) => {
  (va.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Bc(e, i, a, n)),
    (e.keyType = o.keyType),
    (e.valueType = o.valueType),
    (e.min = (...i) => e.check(_minSize(...i))),
    (e.nonempty = (i) => e.check(_minSize(1, i))),
    (e.max = (...i) => e.check(_maxSize(...i))),
    (e.size = (...i) => e.check(_size(...i))));
});
function map(e, o, i) {
  return new Nl({ type: "map", keyType: e, valueType: o, ...k.normalizeParams(i) });
}
c(map, "map");
var Zl = $constructor("ZodSet", (e, o) => {
  (Sa.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Lc(e, i, a, n)),
    (e.min = (...i) => e.check(_minSize(...i))),
    (e.nonempty = (i) => e.check(_minSize(1, i))),
    (e.max = (...i) => e.check(_maxSize(...i))),
    (e.size = (...i) => e.check(_size(...i))));
});
function set(e, o) {
  return new Zl({ type: "set", valueType: e, ...k.normalizeParams(o) });
}
c(set, "set");
var _t = $constructor("ZodEnum", (e, o) => {
  (_a.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (a, n, r) => Ac(e, a, n, r)),
    (e.enum = o.entries),
    (e.options = Object.values(o.entries)));
  let i = new Set(Object.keys(o.entries));
  ((e.extract = (a, n) => {
    let r = {};
    for (let s of a)
      if (i.has(s)) r[s] = o.entries[s];
      else throw new Error(`Key ${s} not found in enum`);
    return new _t({ ...o, checks: [], ...k.normalizeParams(n), entries: r });
  }),
    (e.exclude = (a, n) => {
      let r = { ...o.entries };
      for (let s of a)
        if (i.has(s)) delete r[s];
        else throw new Error(`Key ${s} not found in enum`);
      return new _t({ ...o, checks: [], ...k.normalizeParams(n), entries: r });
    }));
});
function ar(e, o) {
  let i = Array.isArray(e) ? Object.fromEntries(e.map((a) => [a, a])) : e;
  return new _t({ type: "enum", entries: i, ...k.normalizeParams(o) });
}
c(ar, "_enum");
function nativeEnum(e, o) {
  return new _t({ type: "enum", entries: e, ...k.normalizeParams(o) });
}
c(nativeEnum, "nativeEnum");
var jl = $constructor("ZodLiteral", (e, o) => {
  (xa.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => zc(e, i, a, n)),
    (e.values = new Set(o.values)),
    Object.defineProperty(e, "value", {
      get() {
        if (o.values.length > 1)
          throw new Error(
            "This schema contains multiple valid literal values. Use `.values` instead.",
          );
        return o.values[0];
      },
    }));
});
function literal(e, o) {
  return new jl({ type: "literal", values: Array.isArray(e) ? e : [e], ...k.normalizeParams(o) });
}
c(literal, "literal");
var Bl = $constructor("ZodFile", (e, o) => {
  (ka.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Dc(e, i, a, n)),
    (e.min = (i, a) => e.check(_minSize(i, a))),
    (e.max = (i, a) => e.check(_maxSize(i, a))),
    (e.mime = (i, a) => e.check(_mime(Array.isArray(i) ? i : [i], a))));
});
function file(e) {
  return _file(Bl, e);
}
c(file, "file");
var Ll = $constructor("ZodTransform", (e, o) => {
  (Ia.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => jc(e, i, a, n)),
    (e._zod.parse = (i, a) => {
      if (a.direction === "backward") throw new Ie(e.constructor.name);
      i.addIssue = (r) => {
        if (typeof r == "string") i.issues.push(k.issue(r, i.value, o));
        else {
          let s = r;
          (s.fatal && (s.continue = !1),
            s.code ?? (s.code = "custom"),
            s.input ?? (s.input = i.value),
            s.inst ?? (s.inst = e),
            i.issues.push(k.issue(s)));
        }
      };
      let n = o.transform(i.value, i);
      return n instanceof Promise ? n.then((r) => ((i.value = r), i)) : ((i.value = n), i);
    }));
});
function transform(e) {
  return new Ll({ type: "transform", transform: e });
}
c(transform, "transform");
var cr = $constructor("ZodOptional", (e, o) => {
  (Qn.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Eo(e, i, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function optional(e) {
  return new cr({ type: "optional", innerType: e });
}
c(optional, "optional");
var Wl = $constructor("ZodExactOptional", (e, o) => {
  (Ca.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Eo(e, i, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function exactOptional(e) {
  return new Wl({ type: "optional", innerType: e });
}
c(exactOptional, "exactOptional");
var ql = $constructor("ZodNullable", (e, o) => {
  (Ra.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Kc(e, i, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function nullable(e) {
  return new ql({ type: "nullable", innerType: e });
}
c(nullable, "nullable");
function Dp(e) {
  return optional(nullable(e));
}
c(Dp, "nullish");
var Vl = $constructor("ZodDefault", (e, o) => {
  (Pa.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Jc(e, i, a, n)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeDefault = e.unwrap));
});
function Gl(e, o) {
  return new Vl({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof o == "function" ? o() : k.shallowClone(o);
    },
  });
}
c(Gl, "_default");
var Kl = $constructor("ZodPrefault", (e, o) => {
  (Ta.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Yc(e, i, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function prefault(e, o) {
  return new Kl({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof o == "function" ? o() : k.shallowClone(o);
    },
  });
}
c(prefault, "prefault");
var lr = $constructor("ZodNonOptional", (e, o) => {
  (wa.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Hc(e, i, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function nonoptional(e, o) {
  return new lr({ type: "nonoptional", innerType: e, ...k.normalizeParams(o) });
}
c(nonoptional, "nonoptional");
var Yl = $constructor("ZodSuccess", (e, o) => {
  (Ea.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Uc(e, i, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function success(e) {
  return new Yl({ type: "success", innerType: e });
}
c(success, "success");
var Xl = $constructor("ZodCatch", (e, o) => {
  (Oa.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Xc(e, i, a, n)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeCatch = e.unwrap));
});
function Ql(e, o) {
  return new Xl({ type: "catch", innerType: e, catchValue: typeof o == "function" ? o : () => o });
}
c(Ql, "_catch");
var ed = $constructor("ZodNaN", (e, o) => {
  (Aa.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => Mc(e, i, a, n)));
});
function nan(e) {
  return _nan(ed, e);
}
c(nan, "nan");
var dr = $constructor("ZodPipe", (e, o) => {
  (za.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => Qc(e, i, a, n)),
    (e.in = o.in),
    (e.out = o.out));
});
function pipe(e, o) {
  return new dr({ type: "pipe", in: e, out: o });
}
c(pipe, "pipe");
var ur = $constructor("ZodCodec", (e, o) => {
  (dr.init(e, o), Qt.init(e, o));
});
function codec(e, o, i) {
  return new ur({ type: "pipe", in: e, out: o, transform: i.decode, reverseTransform: i.encode });
}
c(codec, "codec");
var td = $constructor("ZodReadonly", (e, o) => {
  (Ma.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => el(e, i, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function readonly(e) {
  return new td({ type: "readonly", innerType: e });
}
c(readonly, "readonly");
var od = $constructor("ZodTemplateLiteral", (e, o) => {
  ($a.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => $c(e, i, a, n)));
});
function templateLiteral(e, o) {
  return new od({ type: "template_literal", parts: e, ...k.normalizeParams(o) });
}
c(templateLiteral, "templateLiteral");
var rd = $constructor("ZodLazy", (e, o) => {
  (Na.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => nl(e, i, a, n)),
    (e.unwrap = () => e._zod.def.getter()));
});
function lazy(e) {
  return new rd({ type: "lazy", getter: e });
}
c(lazy, "lazy");
var ad = $constructor("ZodPromise", (e, o) => {
  (Ua.init(e, o),
    w.init(e, o),
    (e._zod.processJSONSchema = (i, a, n) => tl(e, i, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function promise(e) {
  return new ad({ type: "promise", innerType: e });
}
c(promise, "promise");
var sd = $constructor("ZodFunction", (e, o) => {
  (Da.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => Zc(e, i, a, n)));
});
function _function(e) {
  return new sd({
    type: "function",
    input: Array.isArray(e?.input) ? tuple(e?.input) : (e?.input ?? array(unknown())),
    output: e?.output ?? unknown(),
  });
}
c(_function, "_function");
var vn = $constructor("ZodCustom", (e, o) => {
  (Za.init(e, o), w.init(e, o), (e._zod.processJSONSchema = (i, a, n) => Nc(e, i, a, n)));
});
function check(e) {
  let o = new U({ check: "custom" });
  return ((o._zod.check = e), o);
}
c(check, "check");
function custom(e, o) {
  return _custom(vn, e ?? (() => !0), o);
}
c(custom, "custom");
function refine(e, o = {}) {
  return _refine(vn, e, o);
}
c(refine, "refine");
function superRefine(e) {
  return _superRefine(e);
}
c(superRefine, "superRefine");
var qp = describe,
  Vp = meta;
function _instanceof(e, o = {}) {
  let i = new vn({
    type: "custom",
    check: "custom",
    fn: c((a) => a instanceof e, "fn"),
    abort: !0,
    ...k.normalizeParams(o),
  });
  return (
    (i._zod.bag.Class = e),
    (i._zod.check = (a) => {
      a.value instanceof e ||
        a.issues.push({
          code: "invalid_type",
          expected: e.name,
          input: a.value,
          inst: i,
          path: [...(i._zod.def.path ?? [])],
        });
    }),
    i
  );
}
c(_instanceof, "_instanceof");
var Kp = c((...e) => _stringbool({ Codec: ur, Boolean: Ct, String: xt }, ...e), "stringbool");
function json(e) {
  let o = lazy(() => union([string(e), number(), boolean(), Cl(), array(o), record(string(), o)]));
  return o;
}
c(json, "json");
function preprocess(e, o) {
  return pipe(transform(e), o);
}
c(preprocess, "preprocess");
var Zy = {
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
c(setErrorMap, "setErrorMap");
function getErrorMap() {
  return config().customError;
}
c(getErrorMap, "getErrorMap");
var dd;
dd || (dd = {});
var C = { ...cn, ...zo, iso: St },
  Ly = new Set([
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
function detectVersion(e, o) {
  let i = e.$schema;
  return i === "https://json-schema.org/draft/2020-12/schema"
    ? "draft-2020-12"
    : i === "http://json-schema.org/draft-07/schema#"
      ? "draft-7"
      : i === "http://json-schema.org/draft-04/schema#"
        ? "draft-4"
        : (o ?? "draft-2020-12");
}
c(detectVersion, "detectVersion");
function resolveRef(e, o) {
  if (!e.startsWith("#"))
    throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
  let i = e.slice(1).split("/").filter(Boolean);
  if (i.length === 0) return o.rootSchema;
  let a = o.version === "draft-2020-12" ? "$defs" : "definitions";
  if (i[0] === a) {
    let n = i[1];
    if (!n || !o.defs[n]) throw new Error(`Reference not found: ${e}`);
    return o.defs[n];
  }
  throw new Error(`Reference not found: ${e}`);
}
c(resolveRef, "resolveRef");
function convertBaseSchema(e, o) {
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
    let n = e.$ref;
    if (o.refs.has(n)) return o.refs.get(n);
    if (o.processing.has(n))
      return C.lazy(() => {
        if (!o.refs.has(n)) throw new Error(`Circular reference not resolved: ${n}`);
        return o.refs.get(n);
      });
    o.processing.add(n);
    let r = resolveRef(n, o),
      s = convertSchema(r, o);
    return (o.refs.set(n, s), o.processing.delete(n), s);
  }
  if (e.enum !== void 0) {
    let n = e.enum;
    if (o.version === "openapi-3.0" && e.nullable === !0 && n.length === 1 && n[0] === null)
      return C.null();
    if (n.length === 0) return C.never();
    if (n.length === 1) return C.literal(n[0]);
    if (n.every((s) => typeof s == "string")) return C.enum(n);
    let r = n.map((s) => C.literal(s));
    return r.length < 2 ? r[0] : C.union([r[0], r[1], ...r.slice(2)]);
  }
  if (e.const !== void 0) return C.literal(e.const);
  let i = e.type;
  if (Array.isArray(i)) {
    let n = i.map((r) => {
      let s = { ...e, type: r };
      return convertBaseSchema(s, o);
    });
    return n.length === 0 ? C.never() : n.length === 1 ? n[0] : C.union(n);
  }
  if (!i) return C.any();
  let a;
  switch (i) {
    case "string": {
      let n = C.string();
      if (e.format) {
        let r = e.format;
        r === "email"
          ? (n = n.check(C.email()))
          : r === "uri" || r === "uri-reference"
            ? (n = n.check(C.url()))
            : r === "uuid" || r === "guid"
              ? (n = n.check(C.uuid()))
              : r === "date-time"
                ? (n = n.check(C.iso.datetime()))
                : r === "date"
                  ? (n = n.check(C.iso.date()))
                  : r === "time"
                    ? (n = n.check(C.iso.time()))
                    : r === "duration"
                      ? (n = n.check(C.iso.duration()))
                      : r === "ipv4"
                        ? (n = n.check(C.ipv4()))
                        : r === "ipv6"
                          ? (n = n.check(C.ipv6()))
                          : r === "mac"
                            ? (n = n.check(C.mac()))
                            : r === "cidr"
                              ? (n = n.check(C.cidrv4()))
                              : r === "cidr-v6"
                                ? (n = n.check(C.cidrv6()))
                                : r === "base64"
                                  ? (n = n.check(C.base64()))
                                  : r === "base64url"
                                    ? (n = n.check(C.base64url()))
                                    : r === "e164"
                                      ? (n = n.check(C.e164()))
                                      : r === "jwt"
                                        ? (n = n.check(C.jwt()))
                                        : r === "emoji"
                                          ? (n = n.check(C.emoji()))
                                          : r === "nanoid"
                                            ? (n = n.check(C.nanoid()))
                                            : r === "cuid"
                                              ? (n = n.check(C.cuid()))
                                              : r === "cuid2"
                                                ? (n = n.check(C.cuid2()))
                                                : r === "ulid"
                                                  ? (n = n.check(C.ulid()))
                                                  : r === "xid"
                                                    ? (n = n.check(C.xid()))
                                                    : r === "ksuid" && (n = n.check(C.ksuid()));
      }
      (typeof e.minLength == "number" && (n = n.min(e.minLength)),
        typeof e.maxLength == "number" && (n = n.max(e.maxLength)),
        e.pattern && (n = n.regex(new RegExp(e.pattern))),
        (a = n));
      break;
    }
    case "number":
    case "integer": {
      let n = i === "integer" ? C.number().int() : C.number();
      (typeof e.minimum == "number" && (n = n.min(e.minimum)),
        typeof e.maximum == "number" && (n = n.max(e.maximum)),
        typeof e.exclusiveMinimum == "number"
          ? (n = n.gt(e.exclusiveMinimum))
          : e.exclusiveMinimum === !0 && typeof e.minimum == "number" && (n = n.gt(e.minimum)),
        typeof e.exclusiveMaximum == "number"
          ? (n = n.lt(e.exclusiveMaximum))
          : e.exclusiveMaximum === !0 && typeof e.maximum == "number" && (n = n.lt(e.maximum)),
        typeof e.multipleOf == "number" && (n = n.multipleOf(e.multipleOf)),
        (a = n));
      break;
    }
    case "boolean": {
      a = C.boolean();
      break;
    }
    case "null": {
      a = C.null();
      break;
    }
    case "object": {
      let n = {},
        r = e.properties || {},
        s = new Set(e.required || []);
      for (let [u, p] of Object.entries(r)) {
        let f = convertSchema(p, o);
        n[u] = s.has(u) ? f : f.optional();
      }
      if (e.propertyNames) {
        let u = convertSchema(e.propertyNames, o),
          p =
            e.additionalProperties && typeof e.additionalProperties == "object"
              ? convertSchema(e.additionalProperties, o)
              : C.any();
        if (Object.keys(n).length === 0) {
          a = C.record(u, p);
          break;
        }
        let f = C.object(n).passthrough(),
          y = C.looseRecord(u, p);
        a = C.intersection(f, y);
        break;
      }
      if (e.patternProperties) {
        let u = e.patternProperties,
          p = Object.keys(u),
          f = [];
        for (let v of p) {
          let S = convertSchema(u[v], o),
            z = C.string().regex(new RegExp(v));
          f.push(C.looseRecord(z, S));
        }
        let y = [];
        if (
          (Object.keys(n).length > 0 && y.push(C.object(n).passthrough()),
          y.push(...f),
          y.length === 0)
        )
          a = C.object({}).passthrough();
        else if (y.length === 1) a = y[0];
        else {
          let v = C.intersection(y[0], y[1]);
          for (let S = 2; S < y.length; S++) v = C.intersection(v, y[S]);
          a = v;
        }
        break;
      }
      let l = C.object(n);
      e.additionalProperties === !1
        ? (a = l.strict())
        : typeof e.additionalProperties == "object"
          ? (a = l.catchall(convertSchema(e.additionalProperties, o)))
          : (a = l.passthrough());
      break;
    }
    case "array": {
      let n = e.prefixItems,
        r = e.items;
      if (n && Array.isArray(n)) {
        let s = n.map((u) => convertSchema(u, o)),
          l = r && typeof r == "object" && !Array.isArray(r) ? convertSchema(r, o) : void 0;
        (l ? (a = C.tuple(s).rest(l)) : (a = C.tuple(s)),
          typeof e.minItems == "number" && (a = a.check(C.minLength(e.minItems))),
          typeof e.maxItems == "number" && (a = a.check(C.maxLength(e.maxItems))));
      } else if (Array.isArray(r)) {
        let s = r.map((u) => convertSchema(u, o)),
          l =
            e.additionalItems && typeof e.additionalItems == "object"
              ? convertSchema(e.additionalItems, o)
              : void 0;
        (l ? (a = C.tuple(s).rest(l)) : (a = C.tuple(s)),
          typeof e.minItems == "number" && (a = a.check(C.minLength(e.minItems))),
          typeof e.maxItems == "number" && (a = a.check(C.maxLength(e.maxItems))));
      } else if (r !== void 0) {
        let s = convertSchema(r, o),
          l = C.array(s);
        (typeof e.minItems == "number" && (l = l.min(e.minItems)),
          typeof e.maxItems == "number" && (l = l.max(e.maxItems)),
          (a = l));
      } else a = C.array(C.any());
      break;
    }
    default:
      throw new Error(`Unsupported type: ${i}`);
  }
  return (
    e.description && (a = a.describe(e.description)),
    e.default !== void 0 && (a = a.default(e.default)),
    a
  );
}
c(convertBaseSchema, "convertBaseSchema");
function convertSchema(e, o) {
  if (typeof e == "boolean") return e ? C.any() : C.never();
  let i = convertBaseSchema(e, o),
    a = e.type || e.enum !== void 0 || e.const !== void 0;
  if (e.anyOf && Array.isArray(e.anyOf)) {
    let l = e.anyOf.map((p) => convertSchema(p, o)),
      u = C.union(l);
    i = a ? C.intersection(i, u) : u;
  }
  if (e.oneOf && Array.isArray(e.oneOf)) {
    let l = e.oneOf.map((p) => convertSchema(p, o)),
      u = C.xor(l);
    i = a ? C.intersection(i, u) : u;
  }
  if (e.allOf && Array.isArray(e.allOf))
    if (e.allOf.length === 0) i = a ? i : C.any();
    else {
      let l = a ? i : convertSchema(e.allOf[0], o),
        u = a ? 0 : 1;
      for (let p = u; p < e.allOf.length; p++) l = C.intersection(l, convertSchema(e.allOf[p], o));
      i = l;
    }
  (e.nullable === !0 && o.version === "openapi-3.0" && (i = C.nullable(i)),
    e.readOnly === !0 && (i = C.readonly(i)));
  let n = {},
    r = ["$id", "id", "$comment", "$anchor", "$vocabulary", "$dynamicRef", "$dynamicAnchor"];
  for (let l of r) l in e && (n[l] = e[l]);
  let s = ["contentEncoding", "contentMediaType", "contentSchema"];
  for (let l of s) l in e && (n[l] = e[l]);
  for (let l of Object.keys(e)) Ly.has(l) || (n[l] = e[l]);
  return (Object.keys(n).length > 0 && o.registry.add(i, n), i);
}
c(convertSchema, "convertSchema");
function fromJSONSchema(e, o) {
  if (typeof e == "boolean") return e ? C.any() : C.never();
  let i = detectVersion(e, o?.defaultTarget),
    a = e.$defs || e.definitions || {},
    n = {
      version: i,
      defs: a,
      refs: new Map(),
      processing: new Set(),
      rootSchema: e,
      registry: o?.registry ?? F,
    };
  return convertSchema(e, n);
}
c(fromJSONSchema, "fromJSONSchema");
var ud = {};
ye(ud, { bigint: () => Ky, boolean: () => Gy, date: () => Hy, number: () => Vy, string: () => qy });
function qy(e) {
  return _coercedString(xt, e);
}
c(qy, "string");
function Vy(e) {
  return _coercedNumber(It, e);
}
c(Vy, "number");
function Gy(e) {
  return _coercedBoolean(Ct, e);
}
c(Gy, "boolean");
function Ky(e) {
  return _coercedBigint(Rt, e);
}
c(Ky, "bigint");
function Hy(e) {
  return _coercedDate(gn, e);
}
c(Hy, "date");
config(en());
var pr = { minWidth: 320, maxWidth: 3840, minHeight: 320, maxHeight: 2160 },
  pd = t
    .object({ width: t.number().int().positive(), height: t.number().int().positive() })
    .strict(),
  Qp = pd.extend({
    width: t.number().int().min(pr.minWidth).max(pr.maxWidth),
    height: t.number().int().min(pr.minHeight).max(pr.maxHeight),
  }),
  Jy = t.enum([
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
  qe = t.enum(["desktop-continuous", "web-remote-replayable"]),
  Yy = t
    .object({
      workspaceKey: t.string().min(1),
      sessionId: t.string().min(1),
      tabId: t.string().min(1).optional(),
      requestId: t.string().min(1),
      clientMode: qe,
    })
    .strict(),
  md = t.enum([
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
  gd = t
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
var em = t.enum(["left", "right", "middle"]),
  Pt = t.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"]),
  fd = t.object({ x: t.number(), y: t.number() }).strict(),
  Xy = t.enum([
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
  Qy = t.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"]),
  Ve = t.number().int().positive().optional(),
  eb = t
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
  tb = t.discriminatedUnion("name", [
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
        timeoutMs: Ve,
      })
      .strict(),
    t
      .object({
        name: t.literal("waitForLoadState"),
        state: t.enum(["load", "domcontentloaded", "networkidle"]).optional(),
        timeoutMs: Ve,
      })
      .strict(),
    t
      .object({
        name: t.literal("waitForURL"),
        url: t.string().min(1),
        waitUntil: t.enum(["load", "domcontentloaded", "networkidle", "commit"]).optional(),
        timeoutMs: Ve,
      })
      .strict(),
    t
      .object({
        name: t.literal("waitForEvent"),
        event: t.enum(["download", "filechooser"]),
        timeoutMs: Ve,
      })
      .strict(),
    t
      .object({ name: t.literal("downloadPath"), downloadId: t.string().min(1), timeoutMs: Ve })
      .strict(),
    t
      .object({
        name: t.literal("fileChooserSetFiles"),
        fileChooserId: t.string().min(1),
        files: t.array(t.string()).min(1),
        timeoutMs: Ve,
      })
      .strict(),
    t
      .object({
        name: t.literal("locator"),
        selector: t.string().min(1),
        operation: Xy,
        value: t.unknown().optional(),
        arg: t.unknown().optional(),
        expression: t.string().min(1).optional(),
        expressionKind: t.enum(["string", "function"]).optional(),
        attribute: t.string().min(1).optional(),
        checked: t.boolean().optional(),
        replace: t.boolean().optional(),
        force: t.boolean().optional(),
        button: em.optional(),
        modifiers: t.array(Qy).optional(),
        state: t.enum(["attached", "detached", "visible", "hidden"]).optional(),
        selections: t.array(eb).min(1).optional(),
        timeoutMs: Ve,
      })
      .strict(),
  ]),
  Tt = t.discriminatedUnion("method", [
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
        button: em.optional(),
        doubleClick: t.boolean().optional(),
        modifiers: t.array(Pt).optional(),
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
        modifiers: t.array(Pt).optional(),
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
        modifiers: t.array(Pt).optional(),
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
        modifiers: t.array(Pt).optional(),
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
        from: fd.optional(),
        to: fd.optional(),
        modifiers: t.array(Pt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("cuaDrag"),
        path: t.array(fd).min(1),
        modifiers: t.array(Pt).optional(),
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
      .object({ method: t.literal("playwright"), action: tb, tabId: t.string().optional() })
      .strict(),
    t.object({ method: t.literal("capabilities"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("browserVisibilityGet") }).strict(),
    t.object({ method: t.literal("browserVisibilitySet"), visible: t.boolean() }).strict(),
    Qp.extend({ method: t.literal("browserViewportSet"), tabId: t.string().optional() }).strict(),
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
var hd = t.enum(["iab", "extension", "cdp"]),
  tm = t.object({ id: t.string().trim().min(1), description: t.string().trim().min(1) }).strict(),
  yd = t
    .object({
      id: t.string().trim().min(1),
      generation: t.number().int().nonnegative().default(0),
      type: hd,
      name: t.string().trim().min(1),
      capabilities: t
        .object({ browser: t.array(tm).optional(), tab: t.array(tm).optional() })
        .strict(),
      apiSupportOverrides: t.record(t.string(), t.boolean()).optional(),
      metadata: t.record(t.string(), t.string()).optional(),
    })
    .strict(),
  mr = t.enum(["live", "cached"]),
  nb = t
    .object({
      requestId: t.string().trim().min(1),
      workspaceKey: t.string().trim().min(1),
      workspacePath: t.string().trim().min(1),
      workspaceIdentity: t.string().trim().min(1).optional(),
      remoteSessionId: t.string().trim().min(1).optional(),
      sessionId: t.string().trim().min(1),
      turnId: t.string().trim().min(1).optional(),
      clientMode: qe,
      sessionContext: mr,
    })
    .strict(),
  JT = nb
    .extend({
      browserId: t.string().trim().min(1),
      browserGeneration: t.number().int().nonnegative(),
    })
    .strict(),
  nm = t.object({ browsers: t.array(yd) }).strict();
var ob = t.object({ x: t.number(), y: t.number(), width: t.number(), height: t.number() }).strict(),
  bd = t
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
      rect: ob,
      inViewport: t.boolean(),
      parentRef: t.string().optional(),
      framePath: t.string().optional(),
      attributes: t.record(t.string(), t.string()).optional(),
    })
    .strict(),
  rb = t
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
  om = t
    .object({
      url: t.string(),
      title: t.string(),
      dom: t.array(rb).optional(),
      domTruncated: t.boolean().optional(),
      elements: t.array(bd),
      truncated: t.boolean(),
    })
    .strict();
var rm = t
    .object({
      tabId: t.string(),
      url: t.string(),
      title: t.string(),
      viewport: pd,
      active: t.boolean().optional(),
      lifecycle: t.enum(["active", "deliverable", "handoff"]).optional(),
    })
    .strict(),
  ib = t
    .object({
      id: t.string().min(1),
      lastOpened: t.string().optional(),
      tabGroup: t.string().optional(),
      title: t.string().optional(),
      url: t.string().optional(),
    })
    .strict(),
  ab = t
    .object({
      type: t.enum(["alert", "confirm", "prompt", "beforeunload"]),
      message: t.string(),
      defaultPrompt: t.string().optional(),
    })
    .strict(),
  sb = t
    .object({
      browserUse: t.literal(!0),
      backendType: hd,
      browserId: t.string().min(1),
      browserGeneration: t.number().int().nonnegative(),
      openTabIds: t.array(t.string()),
      tabId: t.string().optional(),
      currentUrl: t.string().optional(),
      lifecycle: t.enum(["active", "deliverable", "handoff", "closed"]).optional(),
    })
    .strict(),
  wt = t
    .object({
      ok: t.boolean(),
      state: gd.optional(),
      snapshot: om.optional(),
      image: t
        .object({ base64: t.string(), mimeType: t.literal("image/png") })
        .strict()
        .optional(),
      tabs: t.array(rm).optional(),
      userTabs: t.array(ib).optional(),
      tab: rm.optional(),
      value: t.unknown().optional(),
      element: bd.optional(),
      dialog: ab.nullable().optional(),
      error: t
        .object({
          code: md,
          message: t.string(),
          sideEffect: t.enum(["none", "uncertain"]).optional(),
        })
        .strict()
        .optional(),
      meta: sb.optional(),
      elapsedMs: t.number().nonnegative(),
    })
    .strict();
var gr = ["local-download-upload", "remote-download"];
var cb = ["server-bundle", "node-runtime", "node-pty", "glm", "bfs", "ripgrep", "ugrep"],
  im = ["server-bundle", "node-runtime", "node-pty", "glm", "bfs", "ripgrep", "ugrep"],
  am = ["server-bundle", "node-runtime"];
var pw = im.filter((e) => !am.includes(e)),
  lb = new Set(cb),
  mw = new Set(im),
  gw = new Set(am);
function isKnownRemoteResourcePackageId(e) {
  return lb.has(e);
}
c(isKnownRemoteResourcePackageId, "isKnownRemoteResourcePackageId");
var db = ["claude", "opencode", "gemini", "codex", "glm"],
  oe = t.enum(db);
var vd = ["7d", "30d"],
  ub = t.object({ modelId: t.string().nullable(), totalTokens: t.number(), share: t.number() }),
  pb = t.object({
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
    favoriteModel: ub.nullable(),
  }),
  mb = t.object({
    date: t.string(),
    level: t.union([t.literal(0), t.literal(1), t.literal(2), t.literal(3), t.literal(4)]),
    totalTokens: t.number(),
    turnCount: t.number(),
    toolCallCount: t.number(),
  }),
  gb = t.object({ weekIndex: t.number(), days: t.array(mb.nullable()) }),
  fb = t.object({
    startDate: t.string().nullable(),
    endDate: t.string().nullable(),
    maxTokens: t.number(),
    weeks: t.array(gb),
  }),
  hb = t.object({ modelId: t.string().nullable(), totalTokens: t.number() }),
  yb = t.object({ date: t.string(), models: t.array(hb) }),
  bb = t.object({
    modelId: t.string().nullable(),
    totalTokens: t.number(),
    inputTokens: t.number(),
    outputTokens: t.number(),
    requestCount: t.number(),
    share: t.number(),
  }),
  vb = t.object({
    toolName: t.string(),
    callCount: t.number(),
    errorCount: t.number(),
    errorRate: t.number(),
    avgDurationMs: t.number().nullable(),
  }),
  Sb = t.object({
    range: t.enum(vd),
    generatedAt: t.number(),
    timeZone: t.string(),
    source: t.literal("agent-db"),
    summary: pb,
    heatmap: fb,
    dailyModelUsage: t.array(yb),
    models: t.array(bb),
    tools: t.array(vb),
  });
var hr = ["glm"];
var P = t.string().trim().min(1),
  H = t.record(t.string(), t.unknown()),
  L = t.number().int().nonnegative(),
  Sn = t.enum(["desktop-continuous", "web-remote-replayable"]),
  Sd = t.enum(["user-visible", "model-only"]),
  _d = t.enum([
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
  A = t
    .object({
      workspacePath: P,
      workspaceIdentity: P.optional(),
      remoteSessionId: P.optional(),
      workspaceKey: P,
    })
    .strict(),
  xd = t.enum(["allow", "deny", "escalate", "modify"]),
  _b = t.enum(["allow", "deny", "ask"]),
  xb = t.object({ toolName: P, ruleContent: t.string().optional() }).strict(),
  kd = t.object({ type: t.literal("addRules"), behavior: _b, rules: t.array(xb).min(1) }).strict(),
  Et = t
    .object({
      decision: xd,
      reason: t.string().optional(),
      modifiedInput: t.unknown().optional(),
      permissionUpdates: t.array(kd).optional(),
    })
    .strict(),
  W = t.object({ providerId: P, modelId: P, variant: P.optional() }).strict(),
  _e = t.enum(["plan", "build", "edit", "yolo", "auto"]),
  Id = t.enum(["idle", "running", "waiting", "paused", "completed", "error"]),
  kb = t.enum([
    "interactive",
    "fork",
    "selection_side_chat",
    "workflow_parent",
    "workflow_child",
    "subagent_child",
    "nested_workflow_child",
  ]),
  Cd = t
    .object({
      sessionId: P,
      targetId: P,
      objective: P,
      summaryTitle: t.string().min(1).nullable().default(null),
      status: t.enum(["active", "paused", "budget_limited", "complete"]),
      tokenBudget: t.number().int().positive().nullable(),
      tokensUsed: t.number().int().nonnegative(),
      timeUsedSeconds: t.number().int().nonnegative(),
      activeInputId: P.nullable().optional(),
      activeRunStartedAtMs: L.nullable().optional(),
      activeRunLastSeenAtMs: L.nullable().optional(),
      createdAt: L,
      updatedAt: L,
    })
    .strict(),
  cm = t
    .object({
      nextAction: t.string().nullable().optional(),
      passed: t.boolean(),
      reason: t.string(),
    })
    .strict(),
  Ib = t
    .object({
      version: t.literal(1),
      kind: t.literal("synthetic"),
      type: t.literal("goal_verification"),
      display: t.literal("separator"),
      targetId: P,
      verificationId: P,
      status: t.enum(["started", "completed", "failed_closed", "cancelled"]),
      verification: cm.optional(),
      goalIteration: t.number().int().positive().optional(),
      anchorAssistantMessageId: P.optional(),
      anchorTurnId: P.optional(),
      startedAt: L.optional(),
      updatedAt: L,
    })
    .strict(),
  Rd = t
    .object({
      sessionId: P,
      workspace: A,
      parentSessionId: P.optional(),
      traceId: P.optional(),
      sessionKind: kb,
      title: t.string(),
      titleSource: t.enum(["default", "first_input", "generated", "custom"]).optional(),
      mode: _e,
      status: Id,
      model: W.optional(),
      target: Cd.nullable().optional(),
      createdAt: L,
      updatedAt: L,
      archivedAt: L.optional(),
    })
    .strict(),
  Ge = t
    .object({
      kind: t.literal("subagent"),
      agentId: P,
      agentType: P,
      childSessionId: P,
      childTurnId: P.optional(),
      description: t.string().optional(),
      parentSessionId: P,
      parentToolCallId: P.optional(),
      parentTurnId: P.optional(),
    })
    .strict(),
  lm = t.object({ created: L, completed: L.optional() }).strict(),
  dm = t
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
  um = t
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
  Cb = t
    .object({
      messageId: P,
      sessionId: P,
      role: t.literal("user"),
      time: lm,
      agent: P,
      model: W,
      system: t.string().optional(),
      tools: t.record(t.string(), t.boolean()).optional(),
      synthetic: t.boolean().optional(),
      source: _d.optional(),
      visibility: Sd.optional(),
      semantics: um.optional(),
      metadata: H.optional(),
    })
    .strict(),
  Rb = t
    .object({
      messageId: P,
      sessionId: P,
      role: t.literal("assistant"),
      time: lm,
      parentMessageId: P,
      agent: P,
      model: W,
      path: t.object({ cwd: P, root: P }).strict(),
      cost: t.number().nonnegative(),
      tokens: dm,
      finish: t.string().optional(),
      error: H.optional(),
      semantics: um.optional(),
      structured: t.unknown().optional(),
    })
    .strict(),
  Pb = t.discriminatedUnion("role", [Cb, Rb]),
  re = t.object({ partId: P, sessionId: P, messageId: P }),
  Tb = t.discriminatedUnion("status", [
    t.object({ status: t.literal("pending"), input: H, raw: t.string() }).strict(),
    t
      .object({
        status: t.literal("running"),
        input: H,
        title: t.string().optional(),
        metadata: H.optional(),
        startedAt: L,
      })
      .strict(),
    t
      .object({
        status: t.literal("completed"),
        input: H,
        output: t.string(),
        title: t.string(),
        metadata: H,
        startedAt: L,
        completedAt: L,
      })
      .strict(),
    t
      .object({
        status: t.literal("error"),
        input: H,
        error: t.string(),
        metadata: H.optional(),
        startedAt: L,
        completedAt: L,
      })
      .strict(),
  ]),
  sm = W.extend({ label: t.string().optional() }),
  wb = t.object({ start: L.optional(), end: L.optional() }).strict(),
  Eb = re
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
      anchorMessageId: P.optional(),
      anchorTurnId: P.optional(),
      time: wb.optional(),
      operationId: t.string().optional(),
      trigger: t.enum(["manual", "auto", "partial", "reactive", "session_memory"]).optional(),
      phase: t.enum(["standalone_turn", "pre_request", "mid_turn", "reactive"]).optional(),
      compactReason: t.string().optional(),
      boundaryId: t.string().optional(),
      summaryMessageId: P.optional(),
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
      parentSessionId: P.optional(),
      targetMessageId: P.optional(),
      targetCheckpointId: t.string().optional(),
      restoredFileCount: t.number().int().nonnegative().optional(),
      fromModel: sm.optional(),
      toModel: sm.extend({ label: P }).optional(),
    })
    .strict(),
  Pd = t.discriminatedUnion("type", [
    re
      .extend({
        type: t.literal("text"),
        text: t.string(),
        synthetic: t.boolean().optional(),
        ignored: t.boolean().optional(),
        metadata: H.optional(),
      })
      .strict(),
    re.extend({ type: t.literal("reasoning"), text: t.string(), metadata: H.optional() }).strict(),
    re
      .extend({
        type: t.literal("file"),
        mime: P,
        filename: t.string().optional(),
        url: P,
        metadata: H.optional(),
      })
      .strict(),
    re
      .extend({ type: t.literal("tool"), callId: P, tool: P, state: Tb, metadata: H.optional() })
      .strict(),
    re.extend({ type: t.literal("step-start"), snapshot: t.string().optional() }).strict(),
    re
      .extend({
        type: t.literal("step-finish"),
        reason: t.string(),
        snapshot: t.string().optional(),
        cost: t.number().nonnegative(),
        tokens: dm,
      })
      .strict(),
    re.extend({ type: t.literal("snapshot"), snapshot: t.string() }).strict(),
    re.extend({ type: t.literal("patch"), hash: P, files: t.array(t.string()) }).strict(),
    re
      .extend({
        type: t.literal("compaction"),
        auto: t.boolean(),
        reason: t.string().optional(),
        summaryMessageId: P.optional(),
        metadata: H.optional(),
      })
      .strict(),
    Eb,
    re
      .extend({
        type: t.literal("subagent"),
        prompt: t.string(),
        description: t.string(),
        agent: P,
        model: W.optional(),
        command: t.string().optional(),
      })
      .strict(),
    re.extend({ type: t.literal("agent"), name: P }).strict(),
    re
      .extend({ type: t.literal("retry"), attempt: t.number().int().nonnegative(), error: H })
      .strict(),
  ]),
  Td = t.object({ info: Pb, parts: t.array(Pd) }).strict(),
  Ob = t
    .object({
      kind: t.literal("api_retry"),
      attempt: t.number().int().positive(),
      maxRetries: t.number().int().nonnegative(),
      retryDelayMs: t.number().int().nonnegative(),
      errorStatus: t.number().int().nonnegative().nullable(),
      error: t.string(),
    })
    .strict(),
  Ab = t
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
  zb = t.enum([
    "system_prompt",
    "meta_user_context",
    "skills",
    "tool_prompt",
    "system_tool_schemas",
    "mcp_tool_schemas",
    "messages",
  ]),
  Mb = t.object({ source: zb, chars: t.number().int().nonnegative() }).strict(),
  $b = t.array(Mb),
  Db = t
    .object({
      used: t.number().int().nonnegative(),
      size: t.number().int().positive(),
      cost: t
        .object({ amount: t.number().nonnegative(), currency: P })
        .strict()
        .nullable()
        .optional(),
      cache: Ab.optional(),
      breakdown: $b.optional(),
    })
    .strict(),
  pm = t
    .object({
      eventSeq: t.number().int().nonnegative(),
      stateRevision: t.number().int().nonnegative(),
      deliveryKind: Sn.optional(),
      activeTurnId: P.optional(),
      activeTurnKind: t.enum(["regular", "compact", "rewind"]).optional(),
      pendingRequestIds: t.array(P),
      apiRetry: Ob.nullable().optional(),
      contextUsage: Db.optional(),
      goalVerifications: t.array(cm).optional(),
      goalVerificationTimeline: t.array(Ib).optional(),
    })
    .strict();
var Ub = ["telegram", "webhook", "feishu", "lark", "weixin", "discord", "wecom"],
  wd = t
    .object({
      provider: t.enum(["feishu", "lark", "weixin"]),
      botId: t.string().trim().min(1),
      providerUserId: t.string().trim().min(1),
      chatType: t.enum(["private", "group"]),
    })
    .strict();
var Nb = t
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
var Zb = t
    .object({
      model: t.string().min(1).optional(),
      mode: t.string().min(1).optional(),
      thoughtLevel: t.string().min(1).optional(),
      sandboxMode: t.string().min(1).optional(),
      approvalPolicy: t.string().min(1).optional(),
      cli: t.enum(["codex", "claude", "opencode", "gemini", "glm"]).optional(),
    })
    .strict(),
  jb = t
    .object({
      provider: t.enum(["codex", "claude", "opencode", "gemini", "glm"]),
      model: t.string().min(1).optional(),
      mode: t.string().min(1).optional(),
      thoughtLevel: t.string().min(1).optional(),
    })
    .strict(),
  Bb = t
    .object({ value: t.string(), label: t.string(), description: t.string().optional() })
    .strict(),
  Lb = t
    .object({
      question: t.string(),
      header: t.string(),
      options: t.array(Bb),
      multiSelect: t.boolean().optional(),
    })
    .strict(),
  Wb = t
    .object({
      taskId: t.string().min(1),
      requestId: t.string().min(1),
      runId: t.string().min(1),
      origin: Ge.optional(),
      actorKey: t.string().min(1).optional(),
      currentQuestionIndex: t.number().int().min(0),
      questions: t.array(Lb),
      answers: t.record(t.string(), t.array(t.string())),
      renderContext: t
        .object({ kind: t.literal("plan_approval"), plan: t.string().min(1) })
        .strict()
        .optional(),
      expandedCustomAnswerQuestionIndexes: t.array(t.number().int().min(0)).optional(),
      handledAt: t.number().optional(),
    })
    .strict(),
  Fb = t
    .object({
      id: t.string().min(1),
      name: t.string(),
      provider: t.enum(Ub),
      enabled: t.boolean(),
      credentialRef: t.string().min(1).optional(),
      webhookSecretRef: t.string().min(1).optional(),
      webhookUrl: t.string().url().optional(),
      webhookAuthHeaderName: t.string().min(1).optional(),
      feishuAppId: t.string().min(1).optional(),
      providerUserId: t.string().min(1).optional(),
      displayName: t.string().optional(),
      allowedWorkspaces: t.array(t.string().min(1)),
      allowedCommands: Nb,
      currentOptions: Zb,
      replyMode: t.enum([
        "assistant_changes",
        "assistant_toolcalls_changes",
        "summary_changes",
        "streaming_card",
      ]),
    })
    .strict(),
  Dw = t.object({ version: t.literal(2), bots: t.array(Fb) }).strict(),
  Uw = t
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
          draftOptions: jb.optional(),
          pendingPermissionOptions: t
            .array(
              t.object({
                requestId: t.string().min(1),
                optionId: t.string().min(1),
                command: t.enum(["approve", "deny"]),
                label: t.string().min(1),
                response: Et,
                handledAt: t.number().optional(),
              }),
            )
            .optional(),
          pendingElicitation: Wb.optional(),
          telegramOffset: t.number().optional(),
          weixinGetUpdatesBuf: t.string().optional(),
          weixinActivatedAt: t.number().optional(),
          updatedAt: t.number(),
        }),
      ),
    })
    .strict();
var Ed = 64;
function isValidWslUser(e) {
  let o = e.trim();
  return (
    o.length > 0 &&
    o.length <= Ed &&
    !containsControlCharacter(o) &&
    !o.includes(":") &&
    !o.includes("/") &&
    !o.includes("\\")
  );
}
c(isValidWslUser, "isValidWslUser");
function containsControlCharacter(e) {
  for (let o of e) {
    let i = o.codePointAt(0) ?? 0;
    if (i < 32 || i === 127) return !0;
  }
  return !1;
}
c(containsControlCharacter, "containsControlCharacter");
var _n = t
  .string()
  .trim()
  .max(Ed)
  .refine((e) => e.length === 0 || isValidWslUser(e), { message: "Invalid WSL user" });
function normalizeZCodeEndpointOrigin(e) {
  let o = e.trim();
  if (!o) throw new Error("ZCode endpoint origin is empty");
  let i = new URL(o);
  if (i.protocol !== "https:" && i.protocol !== "http:")
    throw new Error("ZCode endpoint origin must use http or https");
  return i.origin;
}
c(normalizeZCodeEndpointOrigin, "normalizeZCodeEndpointOrigin");
var O = t.string().trim().min(1),
  xn = t.enum(["zh-CN", "en-US"]),
  fm = t.enum(["system", "zh-CN", "en-US"]),
  hm = t.enum(["queue", "guide"]),
  ym = t.enum(["stable", "preview"]),
  bm = t.number().int().min(-3).max(5),
  yr = t.discriminatedUnion("mode", [
    t.object({ mode: t.literal("auto") }),
    t.object({
      mode: t.literal("shell"),
      dialect: t.enum(["cmd", "git-bash"]),
      id: O,
      label: O,
      path: O,
    }),
  ]),
  vm = t.array(oe).transform(() => [...hr]),
  Sm = t
    .object({
      zai: t.enum(["oauth", "apiKey"]).optional(),
      bigmodel: t.enum(["oauth", "apiKey"]).optional(),
    })
    .partial(),
  _m = t.enum(["zai", "bigmodel"]),
  xm = t
    .object({
      zai: t.string().trim().min(1).optional(),
      bigmodel: t.string().trim().min(1).optional(),
    })
    .partial();
var Ad = t.object({
    version: O,
    title: O,
    markdown: O,
    releaseDate: O.optional(),
    releaseNotesByLocale: t.partialRecord(xn, t.object({ title: O, markdown: O })).optional(),
  }),
  Vb = t.partialRecord(ym, O).default({}),
  km = t.discriminatedUnion("kind", [
    t.object({
      kind: t.literal("ssh"),
      host: O,
      port: t.number().int().positive().max(65535).optional(),
      username: O,
      sshConfigAlias: O.optional(),
      privateKeyPath: t.string().optional(),
      assetInstallMode: t.enum(gr).optional(),
      resourcePackages: t
        .object({ selectedPackageIds: t.array(t.string().refine(isKnownRemoteResourcePackageId)).optional() })
        .optional(),
      passwordCredentialKey: O.optional(),
      privateKeyPassphraseCredentialKey: O.optional(),
    }),
    t.object({ kind: t.literal("wsl"), distro: t.string().optional(), user: _n.optional() }),
    t.object({ kind: t.literal("docker"), container: O }),
    t.object({
      kind: t.literal("server"),
      url: t.string().url(),
      name: O.optional(),
      workspacePath: t.string().optional(),
      serverId: O.optional(),
      tokenCredentialKey: O.optional(),
    }),
  ]),
  Im = t.discriminatedUnion("kind", [
    t.object({
      kind: t.literal("local"),
      workspacePath: O,
      workspacePurpose: t.enum(["project", "conversation"]).default("project"),
    }),
    t.object({
      kind: t.literal("remote"),
      workspacePath: O,
      localWorkspacePath: O.optional(),
      workspaceIdentity: O.optional(),
      target: km,
      lastOpenedAt: t.number().int().nonnegative(),
      lastConnectionStatus: t.enum(["connected", "failed"]),
      lastConnectionError: t.string().optional(),
    }),
  ]),
  Cm = t.object({ deviceSid: O }),
  Rm = t.object({ workspacePath: O, workspaceIdentity: O.optional(), initialTaskId: O.optional() }),
  zd = t.preprocess((e) => {
    if (typeof e != "string") return;
    let o = e.trim();
    if (o)
      try {
        return normalizeZCodeEndpointOrigin(o);
      } catch {
        return;
      }
  }, t.string().optional());
function sanitizeZCodeEndpointOrigin(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e;
  if (!("zcodeEndpointOrigin" in o)) return e;
  let i = zd.safeParse(o.zcodeEndpointOrigin);
  if (i.success && typeof i.data == "string") return { ...o, zcodeEndpointOrigin: i.data };
  let { zcodeEndpointOrigin: a, ...n } = o;
  return n;
}
c(sanitizeZCodeEndpointOrigin, "sanitizeZCodeEndpointOrigin");
function migrateOptimizeAgentExperienceDefault(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e;
  return o.optimizeAgentExperienceMigrationInitialized === !0
    ? e
    : { ...o, optimizeAgentExperienceEnabled: !1, optimizeAgentExperienceMigrationInitialized: !0 };
}
c(migrateOptimizeAgentExperienceDefault, "migrateOptimizeAgentExperienceDefault");
function migrateCloseToTrayOnWindowsDefault(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e;
  return o.closeToTrayOnWindowsMigrationInitialized === !0
    ? e
    : { ...o, closeToTrayOnWindows: !0, closeToTrayOnWindowsMigrationInitialized: !0 };
}
c(migrateCloseToTrayOnWindowsDefault, "migrateCloseToTrayOnWindowsDefault");
function migrateLegacyLocalePreference(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e;
  if ("localePreference" in o || !("locale" in o)) return e;
  let i = xn.safeParse(o.locale);
  return i.success ? { ...o, localePreference: i.data } : e;
}
c(migrateLegacyLocalePreference, "migrateLegacyLocalePreference");
var Yb = t.object({
  id: O,
  workspacePath: O,
  localWorkspacePath: O.optional(),
  workspaceIdentity: O.optional(),
  target: km,
  lastOpenedAt: t.number().int().nonnegative(),
  lastConnectionStatus: t.enum(["connected", "failed"]),
  lastConnectionError: t.string().optional(),
});
function migrateLegacyBuiltinAgentCliProviders(e) {
  return !e || typeof e != "object" || Array.isArray(e)
    ? e
    : { ...e, enabledBuiltinAgentCliProviders: [...hr] };
}
c(migrateLegacyBuiltinAgentCliProviders, "migrateLegacyBuiltinAgentCliProviders");
function stripHistoricalRemoteResourcePackages(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e;
  if (o.kind !== "ssh" || !("resourcePackages" in o)) return e;
  let { resourcePackages: i, ...a } = o;
  return a;
}
c(stripHistoricalRemoteResourcePackages, "stripHistoricalRemoteResourcePackages");
function migrateLegacyWorkspaceSession(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e,
    i = { ...o },
    a = Array.isArray(o.lastWorkspaceSession) ? o.lastWorkspaceSession : [],
    n = a.some((y) => (!y || typeof y != "object" || Array.isArray(y) ? !1 : "historyId" in y)),
    r = Array.isArray(o.remoteWorkspaceHistory) ? o.remoteWorkspaceHistory : [],
    s = new Map(
      r.flatMap((y) => {
        let v = y && typeof y == "object" && !Array.isArray(y) ? { ...y, target: stripHistoricalRemoteResourcePackages(y.target) } : y,
          S = Yb.safeParse(v);
        return S.success ? [[S.data.id, S.data]] : [];
      }),
    ),
    l =
      a.length > 0
        ? a.flatMap((y) => {
            if (!y || typeof y != "object" || Array.isArray(y)) return [];
            let v = y;
            if (v.kind === "local" && typeof v.workspacePath == "string")
              return [
                {
                  kind: "local",
                  workspacePath: v.workspacePath,
                  workspacePurpose:
                    v.workspacePurpose === "conversation" ? "conversation" : "project",
                },
              ];
            if (v.kind === "remote") {
              if (typeof v.workspacePath == "string" && v.target)
                return [{ ...v, target: stripHistoricalRemoteResourcePackages(v.target) }];
              if (typeof v.historyId == "string") {
                let S = s.get(v.historyId);
                return S
                  ? [
                      {
                        kind: "remote",
                        workspacePath: S.workspacePath,
                        ...(S.localWorkspacePath
                          ? { localWorkspacePath: S.localWorkspacePath }
                          : {}),
                        ...(S.workspaceIdentity ? { workspaceIdentity: S.workspaceIdentity } : {}),
                        target: stripHistoricalRemoteResourcePackages(S.target),
                        lastOpenedAt: S.lastOpenedAt,
                        lastConnectionStatus: S.lastConnectionStatus,
                        ...(S.lastConnectionError
                          ? { lastConnectionError: S.lastConnectionError }
                          : {}),
                      },
                    ]
                  : [];
              }
            }
            return [];
          })
        : [],
    u = Array.isArray(o.lastOpenTabs)
      ? o.lastOpenTabs.flatMap((y) =>
          typeof y == "string"
            ? [{ kind: "local", workspacePath: y, workspacePurpose: "project" }]
            : [],
        )
      : [],
    p = new Set(
      l.flatMap((y) =>
        y.kind === "local" && typeof y.workspacePath == "string" ? [y.workspacePath] : [],
      ),
    ),
    f = [...l, ...u.filter((y) => !p.has(y.workspacePath))];
  return (
    (f.length > 0 || n || Array.isArray(o.lastOpenTabs)) && (i.lastWorkspaceSession = f),
    delete i.lastOpenTabs,
    delete i.remoteWorkspaceHistory,
    i
  );
}
c(migrateLegacyWorkspaceSession, "migrateLegacyWorkspaceSession");
var ev = t.object({
    recentProjects: t.array(t.string()).default([]),
    locale: xn.default("zh-CN"),
    localePreference: fm.default("system"),
    terminalInheritSystemProfile: t.boolean().default(!0),
    terminalFontFamily: O.optional(),
    integratedTerminalShell: yr.optional(),
    httpProxy: O.optional(),
    httpProxyNoProxy: O.optional(),
    httpProxyCaCertPath: O.optional(),
    taskAutoArchiveEnabled: t.boolean().default(!1),
    taskAutoArchiveOlderThanDays: t.number().int().positive().max(365).default(7),
    closeToTrayOnWindows: t.boolean().default(!0),
    closeToTrayOnWindowsMigrationInitialized: t.boolean().default(!0),
    keepAwakeWhileRunning: t.boolean().default(!1),
    desktopZoomLevel: bm.optional(),
    desktopChromiumHardwareAccelerationEnabled: t.boolean().default(!0),
    messageStreamShowReasoning: t.boolean().default(!1),
    messageStreamShowTodos: t.boolean().default(!1),
    zcodeInteractionBehavior: hm.default("queue"),
    askUserQuestionAutoResolutionEnabled: t.boolean().default(!0),
    optimizeAgentExperienceEnabled: t.boolean().default(!1),
    optimizeAgentExperienceMigrationInitialized: t.boolean().default(!0),
    enabledBuiltinAgentCliProviders: vm.default([...hr]),
    modelProviderFamilyModes: Sm.default({}),
    modelProviderFamilySelectedKeys: xm.default({}),
    providerFamilyDomain: _m.optional(),
    providerFamilyDomainUpdatedAt: t.number().int().nonnegative().optional(),
    providerFamilyDomainMigrated: t.boolean().default(!1),
    repoSnapshotIndexingEnabled: t.boolean().default(!1),
    repoSnapshotIndexingUserConfigured: t.boolean().optional(),
    instantGrepIndexingEnabled: t.boolean().default(!1),
    nativeSearchEnhancementsEnabled: t.boolean().default(!0),
    memoryEnabled: t.boolean().default(!1),
    lastWorkspaceSession: t.array(Im).default([]),
    lastActiveTabIndex: t.number().int().nonnegative().default(0),
    lastActiveTaskByWorkspace: t.record(t.string(), t.string()).optional(),
    dataBaseDir: t.string().trim().min(1).optional(),
    pendingPostUpdateReleaseNotes: Ad.optional(),
    receivePreviewUpdates: t.boolean().default(!1),
    autoDownloadAndInstallUpdates: t.boolean().default(!1),
    skippedElectronUpdateVersions: Vb,
    settingsSyncFirstRunPromptHandled: t.boolean().optional(),
    webRemoteControlExternalRelayDevice: Cm.optional(),
    webRemoteControlLastEnabledContext: Rm.optional(),
    zcodeEndpointOrigin: zd.optional(),
  }),
  tv = t.preprocess((e) => migrateCloseToTrayOnWindowsDefault(migrateOptimizeAgentExperienceDefault(migrateLegacyLocalePreference(sanitizeZCodeEndpointOrigin(migrateLegacyWorkspaceSession(migrateLegacyBuiltinAgentCliProviders(e)))))), ev),
  nv = t.object({
    recentProjects: t.array(t.string()).optional(),
    locale: xn.optional(),
    localePreference: fm.optional(),
    terminalInheritSystemProfile: t.boolean().optional(),
    terminalFontFamily: O.optional(),
    integratedTerminalShell: yr.optional(),
    httpProxy: O.optional(),
    httpProxyNoProxy: O.optional(),
    httpProxyCaCertPath: O.optional(),
    taskAutoArchiveEnabled: t.boolean().optional(),
    taskAutoArchiveOlderThanDays: t.number().int().positive().max(365).optional(),
    closeToTrayOnWindows: t.boolean().optional(),
    keepAwakeWhileRunning: t.boolean().optional(),
    closeToTrayOnWindowsMigrationInitialized: t.boolean().optional(),
    desktopZoomLevel: bm.optional(),
    desktopChromiumHardwareAccelerationEnabled: t.boolean().optional(),
    messageStreamShowReasoning: t.boolean().optional(),
    messageStreamShowTodos: t.boolean().optional(),
    zcodeInteractionBehavior: hm.optional(),
    askUserQuestionAutoResolutionEnabled: t.boolean().optional(),
    optimizeAgentExperienceEnabled: t.boolean().optional(),
    optimizeAgentExperienceMigrationInitialized: t.boolean().optional(),
    enabledBuiltinAgentCliProviders: vm.optional(),
    modelProviderFamilyModes: Sm.optional(),
    modelProviderFamilySelectedKeys: xm.optional(),
    providerFamilyDomain: t.union([_m, t.literal("")]).optional(),
    providerFamilyDomainUpdatedAt: t.number().int().nonnegative().optional(),
    providerFamilyDomainMigrated: t.boolean().optional(),
    repoSnapshotIndexingEnabled: t.boolean().optional(),
    repoSnapshotIndexingUserConfigured: t.boolean().optional(),
    instantGrepIndexingEnabled: t.boolean().optional(),
    nativeSearchEnhancementsEnabled: t.boolean().optional(),
    memoryEnabled: t.boolean().optional(),
    lastWorkspaceSession: t.array(Im).optional(),
    lastActiveTabIndex: t.number().int().nonnegative().optional(),
    lastActiveTaskByWorkspace: t.record(t.string(), t.string()).optional(),
    dataBaseDir: t.string().trim().min(1).optional(),
    pendingPostUpdateReleaseNotes: Ad.optional(),
    receivePreviewUpdates: t.boolean().optional(),
    autoDownloadAndInstallUpdates: t.boolean().optional(),
    skippedElectronUpdateVersions: t.partialRecord(ym, O).optional(),
    settingsSyncFirstRunPromptHandled: t.boolean().optional(),
    webRemoteControlExternalRelayDevice: Cm.optional(),
    webRemoteControlLastEnabledContext: Rm.optional(),
    zcodeEndpointOrigin: zd.optional(),
  });
var Ot = t.enum([
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
var Me = "builtin:",
  he = {
    zai: `${Me}zai`,
    zaiCodingPlan: `${Me}zai-coding-plan`,
    zaiStartPlan: `${Me}zai-start-plan`,
    bigmodel: `${Me}bigmodel`,
    bigmodelCodingPlan: `${Me}bigmodel-coding-plan`,
    bigmodelStartPlan: `${Me}bigmodel-start-plan`,
    zapi: `${Me}zapi`,
  };
var ov = t.object({
    haiku: t.string(),
    sonnet: t.string(),
    opus: t.string(),
    reasoning: t.string(),
  }),
  wm = t.object({ claude: ov.optional() }).catchall(t.unknown()),
  Em = t.enum(["anthropic", "openai", "responses", "gemini"]),
  Om = t.enum(["anthropic-messages", "openai-chat-completions", "openai-responses"]),
  Ke = t.enum(["anthropic", "openai", "openai-compatible"]),
  rv = t.enum(["china-llm-zcode-dev"]),
  Pm = t.enum(["text", "image", "video", "audio", "pdf"]),
  Tm = t.object({ path: t.array(t.string().min(1)).min(1) }),
  iv = t.object({
    set: t.array(Tm.extend({ value: t.unknown() })).optional(),
    unset: t.array(Tm).optional(),
  }),
  av = t.object({
    defaultLevel: t.string().min(1).optional(),
    levels: t.record(t.string().min(1), t.partialRecord(Ke, iv)),
  }),
  Am = t.partialRecord(Ke, t.string()),
  sv = t.object({ baseURL: t.string(), paths: Am }),
  zm = t.object({
    id: t.string().min(1),
    name: t.string().optional(),
    kinds: t.array(Ke),
    defaultKind: Ke.optional(),
    modelIdByKind: t.partialRecord(Ke, t.string().min(1)).optional(),
    modalities: t.object({ input: t.array(Pm), output: t.array(Pm) }),
    contextWindow: t.number().int().positive(),
    maxOutputTokens: t.number().int().positive().optional(),
    reasoning: av.optional(),
    priority: t.number().finite().optional(),
  }),
  cv = t.object({
    id: t.string().min(1),
    name: t.string().min(1),
    endpoints: sv,
    defaultKind: Ke.optional(),
    models: t.array(zm),
  }),
  lv = t.object({ schemaVersion: t.literal("zcode.model-providers.v1"), providers: t.array(cv) }),
  dv = zm.extend({
    disabledReason: t.string().optional(),
    supportsTools: t.boolean().optional(),
    supportsStructuredOutput: t.boolean().optional(),
    modified: t.boolean().optional(),
    deleted: t.boolean().optional(),
  }),
  Mm = t.enum(["builtin", "models-dev", "custom", "workspace"]),
  $m = t.enum([
    "coding_plan_not_authenticated",
    "coding_plan_not_connected",
    "coding_plan_auth_failed",
    "coding_plan_not_entitled",
    "oauth_provider_inactive",
  ]),
  Dm = t.object({
    anthropic: t.string().default(""),
    openai: t.string().default(""),
    gemini: t.string().default(""),
  }),
  uv = Dm.extend({
    anthropic: t.string().optional(),
    openai: t.string().optional(),
    gemini: t.string().optional(),
    baseURL: t.string().optional(),
    paths: Am.optional(),
  }),
  pv = t.object({
    id: t.string(),
    name: t.string(),
    enabled: t.boolean().optional(),
    systemDisabledReason: $m.optional(),
    endpoints: Dm,
    apiFormat: Om.optional(),
    source: Mm.optional(),
    modelsDevProviderId: t.string().optional(),
    apiKeyRequired: t.boolean().optional(),
    headers: t.record(t.string(), t.string()).optional(),
    logoUrl: t.string().optional(),
    apiKey: t.string(),
    apiKeyUrl: t.string().optional(),
    models: t.array(t.string()).default([]),
    modelDisplayNames: t.record(t.string(), t.string()).optional(),
    modelSupportedFormats: t.record(t.string(), t.array(Em)).optional(),
    providerMappings: wm.optional(),
    createdAt: t.number(),
    updatedAt: t.number(),
  }),
  cE = t.array(pv),
  mv = t.object({
    id: t.string(),
    name: t.string(),
    enabled: t.boolean().optional(),
    systemDisabledReason: $m.optional(),
    endpoints: uv,
    apiFormat: Om.optional(),
    source: Mm.optional(),
    catalogSourceId: rv.optional(),
    catalogProviderId: t.string().optional(),
    modelsDevProviderId: t.string().optional(),
    apiKeyRequired: t.boolean().optional(),
    headers: t.record(t.string(), t.string()).optional(),
    logoUrl: t.string().optional(),
    apiKey: t.string(),
    apiKeyUrl: t.string().optional(),
    defaultKind: Ke.optional(),
    models: t.array(dv).default([]),
    modelDisplayNames: t.record(t.string(), t.string()).optional(),
    modelSupportedFormats: t.record(t.string(), t.array(Em)).optional(),
    providerMappings: wm.optional(),
    createdAt: t.number(),
    updatedAt: t.number(),
  }),
  gv = t.array(mv),
  fv = t.object({ schemaVersion: t.literal("zcode.model-providers.v2"), providers: gv }),
  lE = t.object({
    providerIds: t.array(t.string().min(1)),
    updatedAt: t.number().int().nonnegative(),
  });
var hv = "ZCode Protocol",
  yv = 1;
var d = t.string().trim().min(1),
  B = t.record(t.string(), t.unknown()),
  ee = t.number().int().nonnegative(),
  br = t.union([ee, d, t.date()]),
  bv = t
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
  vv = B.superRefine((e, o) => {
    let i = e.display;
    if (typeof i != "object" || i === null || Array.isArray(i) || i.kind !== "node_repl_images")
      return;
    let a = bv.safeParse(i);
    if (!a.success)
      for (let n of a.error.issues) o.addIssue({ ...n, path: ["display", ...n.path] });
  }),
  Dd = t.union([t.string(), t.number().int()]),
  jm = t
    .object({
      traceId: d.optional(),
      parentId: d.optional(),
      spanId: d.optional(),
      traceparent: d.optional(),
    })
    .strict(),
  Sv = t
    .object({ id: Dd, method: d, params: t.unknown().optional(), trace: jm.optional() })
    .strict(),
  _v = t.object({ method: d, params: t.unknown().optional(), trace: jm.optional() }).strict(),
  xv = t.object({ id: Dd, result: t.unknown() }).strict(),
  kv = t
    .object({
      id: Dd,
      error: t
        .object({ code: t.number().int(), message: d, data: t.unknown().optional() })
        .strict(),
    })
    .strict(),
  JE = t.union([Sv, _v, xv, kv]);
var Bm = t
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
  Iv = _d,
  Lm = t.enum(["immediate", "deferred"]),
  Ud = t
    .object({ optionId: d, kind: d, name: d, description: t.string().optional(), response: Et })
    .strict(),
  Um = t.object({ name: d, value: t.string() }).strict(),
  Cv = t.union([
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
  Nd = t.union([
    t
      .object({
        name: d,
        command: d,
        args: t.array(t.string()),
        env: t.array(Um),
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
        headers: t.array(Um),
        oauth: Cv.optional(),
        isolation: t.enum(["session", "workspace"]).optional(),
        protocolVersion: t.enum(["legacy", "auto", "2026-07-28"]).optional(),
        timeoutMs: t.number().int().positive().optional(),
      })
      .strict(),
  ]),
  Rv = t.enum(["connecting", "connected", "disabled", "disconnected", "failed", "untrusted"]),
  Pv = t
    .object({
      status: Rv,
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
  Tv = t.enum(["connect", "status"]),
  wv = t
    .object({ workspace: A, mcpServers: t.array(Nd).optional(), mode: Tv.default("connect") })
    .strict(),
  Ev = t.object({ statuses: t.record(t.string(), Pv) }).strict(),
  Ov = t
    .object({ role: t.enum(["user", "assistant"]), content: t.string(), timestamp: ee.optional() })
    .strict(),
  Av = t
    .object({
      source: t.literal("claudeCode"),
      title: t.string().optional(),
      createdAt: ee.optional(),
      updatedAt: ee.optional(),
      messages: t.array(Ov).min(1),
    })
    .strict(),
  Wm = t.object({ value: d, label: d, description: t.string().optional() }).strict(),
  Fm = t
    .object({
      enabled: t.boolean(),
      levels: t.array(Wm),
      defaultLevel: d.optional(),
      providerOptionsByLevel: t.record(d, B).optional(),
    })
    .strict(),
  qm = t
    .object({
      ref: W,
      label: d,
      providerLabel: d.optional(),
      providerSource: t.string().optional(),
      providerLogoUrl: d.optional(),
      description: t.string().optional(),
      contextWindow: t.number().int().positive().optional(),
      maxOutputTokens: t.number().int().positive().optional(),
      reasoning: Fm.optional(),
      supportsImages: t.boolean().optional(),
      supportsPdf: t.boolean().optional(),
      supportsTools: t.boolean().optional(),
      supportsStructuredOutput: t.boolean().optional(),
      disabledReason: t.string().optional(),
    })
    .strict(),
  Vm = t.enum(["anthropic", "openai", "openai-compatible"]),
  Gm = t.enum(["anthropic-messages", "openai-chat-completions", "openai-responses"]),
  Km = t.enum(["builtin", "models-dev", "custom", "user", "workspace", "ephemeral"]),
  zv = t.discriminatedUnion("source", [
    t.object({ source: t.literal("credential"), key: d }).strict(),
    t.object({ source: t.literal("env"), name: d }).strict(),
    t.object({ source: t.literal("server-config"), key: d }).strict(),
    t.object({ source: t.literal("session-secret"), key: d }).strict(),
  ]),
  Mv = t.discriminatedUnion("source", [
    t.object({ source: t.literal("credential"), key: d }).strict(),
    t.object({ source: t.literal("env"), name: d }).strict(),
    t.object({ source: t.literal("server-config"), key: d }).strict(),
    t.object({ source: t.literal("inline"), value: d }).strict(),
  ]),
  Hm = t
    .object({
      modelId: d,
      label: d.optional(),
      description: t.string().optional(),
      contextWindow: t.number().int().positive().optional(),
      maxOutputTokens: t.number().int().positive().optional(),
      reasoning: Fm.optional(),
      supportsImages: t.boolean().optional(),
      supportsPdf: t.boolean().optional(),
      supportsTools: t.boolean().optional(),
      supportsStructuredOutput: t.boolean().optional(),
      providerOptions: B.optional(),
      disabledReason: t.string().optional(),
    })
    .strict(),
  $v = t
    .object({
      providerId: d,
      kind: Vm,
      apiFormat: Gm.optional(),
      label: d.optional(),
      source: Km.default("workspace"),
      baseURL: d.optional(),
      apiKeyRef: zv.optional(),
      apiKeyRequired: t.boolean().optional(),
      headers: t.record(t.string(), t.string()).optional(),
      providerOptions: B.optional(),
      logoUrl: d.optional(),
      modelsDevProviderId: d.optional(),
      models: t.array(Hm),
      disabledReason: t.string().optional(),
      updatedAt: ee.optional(),
    })
    .strict(),
  Zd = t
    .object({
      providerId: d,
      kind: Vm,
      apiFormat: Gm.optional(),
      label: d.optional(),
      source: Km.default("workspace"),
      baseURL: d.optional(),
      apiKey: Mv.optional(),
      apiKeyRequired: t.boolean().optional(),
      headers: t.record(t.string(), t.string()).optional(),
      providerOptions: B.optional(),
      logoUrl: d.optional(),
      modelsDevProviderId: d.optional(),
      models: t.array(Hm).min(1),
    })
    .strict(),
  xe = t
    .object({ revision: d, generatedAt: ee, model: W, provider: Zd, thoughtLevel: d.optional() })
    .strict(),
  YE = t.object({ sessionId: d, appliedModelRuntimeRevision: d, changed: t.boolean() }).strict();
var Dv = t
    .object({
      revision: t.number().int().nonnegative(),
      providerRevision: d.optional(),
      providers: t.array($v),
      available: t.array(qm),
      defaultModel: W.optional(),
      lastUsed: W.optional(),
    })
    .strict(),
  Jm = t
    .object({
      content: d,
      status: t.enum(["pending", "in_progress", "completed"]),
      priority: t.enum(["high", "medium", "low"]),
    })
    .strict(),
  Uv = t
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
  Nv = t
    .object({
      id: d,
      source: t.enum(["goal_iteration", "session"]),
      goalIteration: t.number().int().positive().optional(),
      targetId: d.optional(),
      startedAt: ee.optional(),
      updatedAt: ee.optional(),
      todos: t.array(Jm),
    })
    .strict(),
  Ym = t
    .object({
      appliedProviderRevision: d.optional(),
      model: t.object({ current: W, available: t.array(qm), lastUsed: W.optional() }).strict(),
      thoughtLevel: t
        .object({
          enabled: t.boolean(),
          current: d.optional(),
          defaultLevel: d.optional(),
          available: t.array(Wm),
        })
        .strict(),
      mode: t.object({ current: _e }).strict(),
      permission: t
        .object({ mode: _e.optional(), rulesRevision: t.number().int().nonnegative().optional() })
        .strict()
        .optional(),
    })
    .strict(),
  Zv = t
    .object({
      requestId: d,
      toolCallId: d,
      toolName: d,
      reason: t.string(),
      riskLevel: t.enum(["low", "medium", "high", "critical"]),
      input: t.unknown().optional(),
      origin: Ge.optional(),
      options: t.array(Ud).min(1),
      requestedAt: ee,
    })
    .strict(),
  jv = t
    .object({
      toolCallId: d,
      toolName: d,
      status: t.enum(["pending", "running", "completed", "failed", "denied"]),
      startedAt: ee.optional(),
    })
    .strict(),
  Bv = t
    .object({
      sessionId: d,
      status: Id,
      mode: _e,
      turnCount: t.number().int().nonnegative(),
      totalTokenCount: t.number().int().nonnegative(),
      contextUsed: t.number().int().nonnegative(),
      contextWindow: t.number().int().nonnegative(),
      currentTurnId: d.optional(),
      pendingPermissions: t.array(Zv),
      activeToolCalls: t.array(jv),
      backgroundJobs: t.array(B),
      target: Cd.nullable().optional(),
      lastError: t
        .object({ type: d, code: d.optional(), message: d, detail: t.string().optional() })
        .strict()
        .optional(),
    })
    .strict(),
  Xm = t
    .object({
      name: d,
      description: t.string(),
      inputHint: t.string().optional(),
      source: t.enum(["builtin", "custom"]).optional(),
    })
    .strict(),
  Lv = t.enum([
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
  Wv = t
    .object({
      assistantMessageId: t.string().optional(),
      delta: t.string().optional(),
      done: t.boolean().optional(),
      input: t.unknown().optional(),
      kind: Lv,
      partId: t.string().optional(),
      providerExecuted: t.boolean().optional(),
      toolCallId: t.string().optional(),
      toolName: t.string().optional(),
    })
    .strict(),
  vr = t
    .object({
      protocol: t.object({ name: t.literal(hv), version: t.literal(yv) }).strict(),
      session: Rd,
      settings: Ym,
      projection: Bv,
      runtime: pm,
      messages: t.array(Td),
      goalStats: Uv.optional(),
      todos: t.array(Jm).optional(),
      todoGroups: t.array(Nv).optional(),
      slashCommands: t.array(Xm).optional(),
    })
    .strict(),
  Fv = t
    .object({
      eventId: d,
      sessionId: d,
      turnId: d.optional(),
      seq: t.number().int().nonnegative(),
      traceId: d.optional(),
      timestamp: ee,
      deliveryKind: Sn.optional(),
    })
    .strict(),
  XE = t.enum([
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
  Qm = t
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
  qv = t.object({ mode: _e, contextWindow: t.number().int().nonnegative() }).strict(),
  Vv = t
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
  Gv = t
    .object({
      messageID: d.optional(),
      modelRef: B.optional(),
      previousTitle: t.string(),
      source: t.enum(["default", "first_input", "generated", "custom"]),
      title: t.string(),
    })
    .strict(),
  Kv = t
    .object({
      turnNumber: t.number().int().nonnegative(),
      input: t.string(),
      inputId: d.optional(),
      queryId: d.optional(),
      inputSource: Iv.optional(),
      inputVisibility: Sd.optional(),
      executionKind: t.enum(["agent", "controlOnly"]).optional(),
      targetId: d.optional(),
      messageId: d.optional(),
      foregroundExecutionId: d.optional(),
      intent: B.optional(),
      originMeta: B.optional(),
      attachments: t.array(B).optional(),
    })
    .strict(),
  Hv = t.literal("plan_approval_feedback"),
  Jv = t.enum(["sendText", "sendGoalCommand", "compact"]),
  eg = t.enum(["queue", "guide"]),
  Yv = t
    .object({
      pendingInputId: d,
      inputId: d.optional(),
      queryId: d.optional(),
      input: t.string(),
      inputPreview: t.string(),
      inputSize: t.number().int().nonnegative(),
      commandKind: Jv.optional(),
      source: Hv.optional(),
      toolDisallowlist: t.array(d).optional(),
      delivery: eg.optional(),
      targetTurnId: d,
      queueLength: t.number().int().nonnegative(),
      intent: B.optional(),
    })
    .strict(),
  Xv = t
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
              delivery: eg.optional(),
              intent: B.optional(),
              toolDisallowlist: t.array(d).optional(),
            })
            .strict(),
        )
        .optional(),
    })
    .strict(),
  Qv = t
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
  eS = t.object({ error: Qm, turnPhase: t.string(), inputId: d.optional() }).strict(),
  tS = t
    .object({
      content: t.string(),
      attachments: t.array(t.unknown()).optional(),
      toolCalls: t.array(t.unknown()).optional(),
      type: t.string().optional(),
      compactBoundary: t.unknown().optional(),
    })
    .strict(),
  nS = t.object({ messageId: d, reason: t.string().optional() }).strict(),
  oS = t
    .object({
      messageId: d,
      partId: d,
      field: t.enum(["text", "reasoning", "input", "output"]).optional(),
      delta: t.string(),
    })
    .strict(),
  Nm = t.object({ part: Pd }).strict(),
  rS = t.object({ messageId: d, partId: d, reason: t.string().optional() }).strict(),
  At = t
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
  iS = t.discriminatedUnion("kind", [
    At.extend({
      kind: t.literal("scheduled"),
      toolName: d,
      input: t.unknown().optional(),
      inputByteLength: t.number().int().nonnegative().optional(),
      inputOmitted: t.boolean().optional(),
      inputRef: t.literal("model_stream").optional(),
      dependencies: t.array(d).optional(),
      parallelGroupIndex: t.number().int().nonnegative().optional(),
      canRunParallel: t.boolean().optional(),
      schedule: B.optional(),
    }).strict(),
    At.extend({ kind: t.literal("started"), startedAt: br }).strict(),
    At.extend({
      kind: t.literal("progress"),
      elapsedMs: t.number().nonnegative().optional(),
      pid: t.number().int().optional(),
      stdoutBytes: t.number().int().nonnegative().optional(),
      stderrBytes: t.number().int().nonnegative().optional(),
      outputBytes: t.number().int().nonnegative().optional(),
      stdoutTail: t.string().optional(),
      stderrTail: t.string().optional(),
    }).strict(),
    At.extend({
      kind: t.literal("result"),
      result: vv,
      duration: t.number().nonnegative(),
    }).strict(),
    At.extend({ kind: t.literal("error"), error: Qm }).strict(),
    t
      .object({
        kind: t.literal("batch"),
        toolCallIds: t.array(d),
        successCount: t.number().int().nonnegative(),
        errorCount: t.number().int().nonnegative(),
      })
      .strict(),
    At.extend({ kind: t.literal("raw"), payload: B }).strict(),
  ]),
  aS = t
    .object({
      requestId: d.optional(),
      toolCallId: d,
      toolName: d,
      riskLevel: t.enum(["low", "medium", "high", "critical"]),
      reason: t.string(),
      input: t.unknown(),
      suggestedPermissionUpdates: t.array(kd).optional(),
      origin: Ge.optional(),
      options: t.array(Ud).min(1),
    })
    .strict(),
  sS = t
    .object({
      requestId: d.optional(),
      toolCallId: d,
      toolName: d.optional(),
      decision: xd.optional(),
      reason: t.string().optional(),
      modifiedInput: t.unknown().optional(),
      inputSummary: t.unknown().optional(),
    })
    .strict(),
  cS = t
    .object({
      requestId: d,
      prompt: t.string(),
      inputType: t.enum(["text", "choice", "confirm"]).optional(),
      choices: t.array(t.string()).optional(),
    })
    .strict(),
  lS = t
    .object({ requestId: d, value: t.unknown().optional(), cancelled: t.boolean().optional() })
    .strict(),
  dS = t.object({ reason: t.string().optional() }).strict();
function zcodeSessionEventEnvelopeFor(e, o) {
  return Fv.extend({ type: t.literal(e), payload: o.optional() });
}
c(zcodeSessionEventEnvelopeFor, "zcodeSessionEventEnvelopeFor");
var tg = t.discriminatedUnion("type", [
    zcodeSessionEventEnvelopeFor("session.created", qv),
    zcodeSessionEventEnvelopeFor("session.resumed", Vv),
    zcodeSessionEventEnvelopeFor("session.updated", B),
    zcodeSessionEventEnvelopeFor("session.titleUpdated", Gv),
    zcodeSessionEventEnvelopeFor("session.closed", dS),
    zcodeSessionEventEnvelopeFor("turn.started", Kv),
    zcodeSessionEventEnvelopeFor("turn.steerQueued", Yv),
    zcodeSessionEventEnvelopeFor("turn.steerDrained", Xv),
    zcodeSessionEventEnvelopeFor("turn.completed", Qv),
    zcodeSessionEventEnvelopeFor("turn.failed", eS),
    zcodeSessionEventEnvelopeFor("message.upserted", tS),
    zcodeSessionEventEnvelopeFor("message.removed", nS),
    zcodeSessionEventEnvelopeFor("part.started", Nm),
    zcodeSessionEventEnvelopeFor("part.delta", oS),
    zcodeSessionEventEnvelopeFor("part.upserted", Nm),
    zcodeSessionEventEnvelopeFor("part.removed", rS),
    zcodeSessionEventEnvelopeFor("model.streaming", Wv),
    zcodeSessionEventEnvelopeFor("tool.updated", iS),
    zcodeSessionEventEnvelopeFor("permission.requested", aS),
    zcodeSessionEventEnvelopeFor("permission.resolved", sS),
    zcodeSessionEventEnvelopeFor("userInput.requested", cS),
    zcodeSessionEventEnvelopeFor("userInput.resolved", lS),
    zcodeSessionEventEnvelopeFor("checkpoint.created", B),
    zcodeSessionEventEnvelopeFor("rewind.triggered", B),
    zcodeSessionEventEnvelopeFor("streamRecovery.updated", B),
  ]),
  QE = t.object({ events: t.array(tg) }).strict(),
  eO = t.object({ messages: t.array(Td) }).strict(),
  tO = t
    .object({
      type: t.literal("state.updated"),
      scope: t.enum(["server", "workspace", "session"]),
      workspace: A.optional(),
      sessionId: d.optional(),
      revision: t.number().int().nonnegative(),
      reason: t.string().optional(),
      patch: t.unknown(),
    })
    .strict(),
  nO = t
    .object({
      sessionId: d,
      deliveryKind: Sn,
      afterSeq: t.number().int().nonnegative().optional(),
      includeSnapshot: t.boolean().default(!1),
    })
    .strict(),
  oO = t
    .object({
      sessionId: d,
      eventSeq: t.number().int().nonnegative(),
      events: t.array(tg),
      snapshot: vr.optional(),
    })
    .strict(),
  rO = t.object({ sessions: t.array(Rd) }).strict(),
  ng = t
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
  uS = ng.extend({ status: t.enum(["running", "waiting", "blocked"]) }),
  pS = ng.extend({ status: t.enum(["success", "failed", "cancelled", "lost"]) }),
  iO = t
    .object({
      revision: t.number().int().nonnegative(),
      childSessionIds: t.array(d),
      running: t.array(uS),
      ended: t
        .object({
          total: t.number().int().nonnegative(),
          items: t.array(pS),
          nextCursor: d.optional(),
        })
        .strict(),
    })
    .strict(),
  mS = t
    .object({
      workspace: A,
      settings: Ym,
      modelCatalog: Dv.optional(),
      slashCommands: t.array(Xm).optional(),
    })
    .strict(),
  aO = t
    .object({
      sessionId: d.optional(),
      workspace: A,
      parentSessionId: d.optional(),
      mode: _e.optional(),
      model: W.optional(),
      runtimeModel: xe.optional(),
      persistence: Lm.optional(),
      thoughtLevel: d.optional(),
      titleGenerationEnabled: t.boolean().optional(),
      mcpServers: t.array(Nd).optional(),
      toolAllowlist: t.array(d).optional(),
      toolDenylist: t.array(d).optional(),
      importedHistory: Av.optional(),
    })
    .strict(),
  sO = t
    .object({
      sessionId: d,
      workspace: A.optional(),
      runtimeModel: xe.optional(),
      thoughtLevel: d.optional(),
      mcpServers: t.array(Nd).optional(),
      toolAllowlist: t.array(d).optional(),
      toolDenylist: t.array(d).optional(),
    })
    .strict(),
  cO = t
    .object({
      workspace: A.optional(),
      includeArchived: t.boolean().default(!1),
      limit: t.number().int().positive().optional(),
    })
    .strict(),
  lO = t
    .object({
      sessionId: d,
      endedCursor: d.optional(),
      endedLimit: t.number().int().positive().max(100).default(20),
    })
    .strict(),
  dO = t.object({ range: t.enum(vd), timeZone: t.string().optional() }).strict();
var uO = t.object({ sessionId: d }).strict(),
  pO = t
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
  mO = t
    .object({
      sessionId: d,
      deliveryKind: Sn.optional(),
      messageLimit: t.number().int().positive().optional(),
      afterSeq: t.number().int().nonnegative().optional(),
    })
    .strict(),
  gO = t
    .object({
      sessionId: d,
      afterMessageId: d.optional(),
      limit: t.number().int().positive().optional(),
    })
    .strict(),
  fO = t
    .object({
      sessionId: d,
      afterSeq: t.number().int().nonnegative().optional(),
      limit: t.number().int().positive().optional(),
    })
    .strict(),
  gS = t.enum(["runtime-materialization", "user-execution"]);
var hO = t.object({ sessionId: d, scope: gS }).strict(),
  fS = "preflight-v1",
  hS = t.enum(["legacy", "preflight-v1"]),
  yO = t
    .object({
      nativeSearchEnhancementsEnabled: t.boolean(),
      memoryEnabled: t.boolean().default(!1),
      askUserQuestionAutoResolutionEnabled: t.boolean().default(!0),
      integratedTerminalShell: yr.optional(),
      modelContextBudgetStrategy: hS.default(fS),
    })
    .strict(),
  yS = t
    .object({
      tabCount: t.number().int().positive().max(100),
      currentUrl: t.string().trim().min(1).max(4096).optional(),
    })
    .strict(),
  bO = t
    .object({
      sessionId: d,
      inputId: d.optional(),
      queryId: d.optional(),
      content: t.string(),
      attachments: t.array(B).optional(),
      browserAmbientContext: yS.optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      expectedProviderRevision: d.optional(),
      expectedModelRuntimeRevision: d.optional(),
      runtimeModel: xe.optional(),
      automationId: d.optional(),
      offPeakTaskId: d.optional(),
      offPeakRunType: t.enum(["init", "resume"]).optional(),
      botDeliveryTarget: wd.optional(),
      toolDenylist: t.array(d).optional(),
    })
    .strict()
    .superRefine((e, o) => {
      (e.automationId &&
        e.offPeakTaskId &&
        o.addIssue({
          code: t.ZodIssueCode.custom,
          message: "automationId and offPeakTaskId are mutually exclusive",
        }),
        e.offPeakRunType &&
          !e.offPeakTaskId &&
          o.addIssue({
            code: t.ZodIssueCode.custom,
            message: "offPeakRunType requires offPeakTaskId",
            path: ["offPeakRunType"],
          }));
    }),
  vO = t
    .object({
      sessionId: d,
      accepted: t.literal(!0),
      stateRevision: t.number().int().nonnegative(),
      modelRuntimeRevision: d.optional(),
    })
    .strict(),
  bS = t.discriminatedUnion("kind", [
    t.object({ kind: t.literal("turn"), turnIndex: t.number().int().nonnegative() }).strict(),
    t.object({ kind: t.literal("message"), messageId: d }).strict(),
    t.object({ kind: t.literal("checkpoint"), checkpointId: d }).strict(),
    t.object({ kind: t.literal("latestCheckpoint") }).strict(),
  ]),
  SO = t
    .object({
      sessionId: d,
      target: bS.default({ kind: "latestCheckpoint" }),
      expectedRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  _O = t
    .object({
      forkedSessionId: d,
      parentSessionId: d.optional(),
      targetMessageId: d.optional(),
      targetCheckpointId: d.optional(),
      response: t.string(),
      snapshot: vr,
    })
    .strict(),
  xO = t
    .object({
      sessionId: d,
      inputId: d.optional(),
      instructions: t.string().optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      runtimeModel: xe.optional(),
    })
    .strict(),
  kO = t
    .object({
      response: t.string(),
      snapshot: vr,
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
  vS = t.enum(["show", "set", "replace", "pause", "resume", "clear"]),
  IO = t
    .object({
      sessionId: d,
      inputId: d.optional(),
      action: vS,
      objective: t.string().optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  CO = t
    .object({ response: t.string(), snapshot: vr, startedTurn: t.boolean().optional() })
    .strict(),
  RO = t.object({ sessionId: d }).strict(),
  og = t.enum(["running", "completed", "failed", "timed_out", "cancelled", "spawn_error", "lost"]),
  SS = t
    .object({
      taskId: d,
      toolCallId: d.optional(),
      toolName: d.optional(),
      taskKind: t.enum(["bash", "subagent"]).optional(),
      blocked: t.boolean().optional(),
      blockedReason: t.string().optional(),
      cancellable: t.boolean().optional(),
      cancelRequestedAt: br.optional(),
      command: t.string().optional(),
      description: t.string().optional(),
      status: og,
      pid: t.number().int().positive().optional(),
      startedAt: br.optional(),
      completedAt: br.optional(),
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
  PO = t.object({ sessionId: d, taskId: d }).strict(),
  TO = t
    .object({
      cancelled: t.boolean(),
      reason: t.string().optional(),
      snapshot: SS.optional(),
      status: og,
      taskId: d,
    })
    .strict(),
  wO = t
    .object({
      sessionId: d,
      model: W,
      runtimeModel: xe.optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      persistAsWorkspaceLastUsed: t.boolean().default(!0),
    })
    .strict(),
  EO = t
    .object({
      sessionId: d,
      thoughtLevel: d.optional(),
      runtimeModel: xe.optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      persistAsWorkspaceLastUsed: t.boolean().default(!0),
    })
    .strict(),
  OO = t
    .object({ sessionId: d, runtimeModel: xe, applyModelSelection: t.boolean().default(!0) })
    .strict(),
  AO = t
    .object({ sessionId: d, mode: _e, expectedRevision: t.number().int().nonnegative().optional() })
    .strict(),
  zO = t.object({ sessionId: d, expectedPersistence: Lm.optional() }).strict(),
  MO = t.object({ closed: t.boolean().optional() }).strict(),
  $O = t
    .object({
      workspace: A,
      runtimeModel: xe.optional(),
      preferWorkspaceDefaults: t.boolean().optional(),
    })
    .strict(),
  DO = t
    .object({
      workspace: A,
      modelRef: W,
      prompt: d,
      querySource: d,
      maxOutputTokens: t.number().int().positive().optional(),
      temperature: t.number().min(0).max(2).optional(),
    })
    .strict(),
  UO = t.object({ text: t.string(), modelRef: W }).strict(),
  _S = t.object({ revision: d, generatedAt: ee, providers: t.array(Zd) }).strict(),
  xS = t.enum(["applied", "unchanged", "failed"]),
  NO = t
    .object({ workspace: A, registry: _S, includeWorkspaceState: t.boolean().optional() })
    .strict(),
  ZO = t
    .object({
      workspace: A,
      appliedProviderRevision: d,
      status: xS,
      providerCount: t.number().int().nonnegative(),
      workspaceState: mS.optional(),
    })
    .strict(),
  kS = t.object({ askUserQuestionAutoResolutionEnabled: t.boolean() }).strict(),
  jO = t.object({ workspace: A, preferences: kS }).strict(),
  BO = t
    .object({
      workspace: A,
      askUserQuestionAutoResolutionEnabled: t.boolean(),
      snoozedInteractionCount: t.number().int().nonnegative(),
    })
    .strict(),
  LO = t
    .object({
      workspace: A,
      provider: Zd,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  WO = t
    .object({
      workspace: A,
      providerId: d,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  FO = t
    .object({
      workspace: A,
      model: W,
      runtimeModel: xe.optional(),
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  qO = t
    .object({
      workspace: A,
      thoughtLevel: d,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  VO = t
    .object({
      workspace: A,
      mode: _e,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  GO = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      toolCallId: d,
      toolName: d,
      reason: t.string(),
      riskLevel: t.enum(["low", "medium", "high", "critical"]),
      input: t.unknown(),
      origin: Ge.optional(),
      options: t.array(Ud).min(1),
    })
    .strict(),
  IS = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      workspaceKey: d,
      workspacePath: d,
      workspaceIdentity: d.optional(),
      remoteSessionId: d.optional(),
      clientMode: qe,
      sessionContext: mr,
    })
    .strict(),
  CS = nm,
  RS = t
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
      clientMode: qe.optional(),
      sessionContext: mr.optional(),
      command: Tt,
    })
    .strict(),
  PS = wt,
  TS = t
    .object({
      value: d,
      label: d,
      description: t.string().optional(),
      preview: t.string().optional(),
    })
    .strict(),
  wS = t
    .object({
      question: d,
      header: d,
      options: t.array(TS).min(1),
      multiSelect: t.boolean().optional(),
    })
    .strict(),
  KO = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      toolCallId: d.optional(),
      toolName: d.optional(),
      prompt: t.string().optional(),
      questions: t.array(wS).min(1).optional(),
      input: t.unknown().optional(),
      origin: Ge.optional(),
      schema: t.unknown().optional(),
    })
    .strict(),
  HO = t
    .object({
      action: t.enum(["accept", "decline", "cancel"]),
      content: B.optional(),
      reason: t.string().optional(),
    })
    .strict(),
  ES = t.enum(["model-request", "captcha-retry"]),
  JO = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      workspace: A,
      modelRef: W,
      providerId: d,
      reason: ES,
    })
    .strict(),
  YO = t
    .object({
      headersApplied: t.boolean(),
      errorMessage: d.optional(),
      providerRevision: d.optional(),
    })
    .strict(),
  rg = t.union([t.string(), t.number(), t.boolean()]),
  ig = t
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
  OS = t
    .object({
      default: rg.optional(),
      description: t.string().optional(),
      required: t.boolean().optional(),
      sensitive: t.boolean().optional(),
      title: t.string().optional(),
      type: t.enum(["string", "number", "boolean", "directory", "file"]).optional(),
    })
    .strict(),
  AS = t.enum(["agent", "command", "skill", "hook", "mcp"]),
  zS = t.object({ name: d, description: t.string().optional() }).strict(),
  ag = t.object({ kind: AS, items: t.array(zS) }).strict(),
  sg = t
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
      components: t.array(ag).optional(),
      declaredMcpServerNames: t.array(t.string()).optional(),
      hostMcpServerNames: t.array(t.string()).optional(),
      mcpServerNames: t.array(t.string()),
      hookDetails: t.array(ig).optional(),
      rootPath: t.string(),
      userConfig: t.record(t.string(), OS).optional(),
      configuredOptions: t.record(t.string(), rg).optional(),
    })
    .strict(),
  ke = t
    .object({
      code: t.string(),
      message: t.string(),
      severity: t.enum(["warning", "error"]).optional(),
      pluginId: t.string().optional(),
    })
    .strict(),
  XO = t.object({ workspace: A }).strict(),
  QO = t.object({ plugins: t.array(sg), diagnostics: t.array(ke) }).strict(),
  MS = t
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
  eA = t.object({ workspace: A, sessionId: d.optional() }).strict(),
  tA = t.object({ authority: t.enum(["session", "workspace"]), plugins: t.array(MS) }).strict(),
  nA = t.object({ workspace: A, pluginId: d, enabled: t.boolean() }).strict(),
  oA = t.object({ plugin: sg, enabled: t.boolean() }).strict(),
  cg = t.enum(["user", "workspace"]),
  lg = t
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
  $d = t
    .object({
      id: d,
      name: d,
      source: B,
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
  Zm = t
    .object({
      id: d,
      name: d,
      marketplace: d,
      description: t.string().optional(),
      version: t.string().optional(),
      installed: t.boolean(),
      componentTypes: t.array(t.string()).optional(),
      listing: lg.optional(),
    })
    .strict(),
  jd = t
    .object({
      id: d,
      name: d,
      marketplace: d,
      description: t.string().optional(),
      version: t.string().optional(),
      enabled: t.boolean(),
      scope: cg,
      installPath: t.string().optional(),
      installedAt: t.string().optional(),
      componentTypes: t.array(t.string()).optional(),
      hookDetails: t.array(ig).optional(),
      updateStatus: t.enum(["none", "update-available", "version-changed"]).optional(),
      latestVersion: t.string().optional(),
      listing: lg.optional(),
    })
    .strict(),
  rA = t.object({ workspace: A }).strict(),
  iA = t
    .object({
      marketplaces: t.array($d),
      availablePlugins: t.array(Zm),
      installedPlugins: t.array(jd),
      restorableBuiltins: t.array(Zm),
      diagnostics: t.array(ke),
      capability: t.object({ supported: t.boolean(), reason: t.string().optional() }).strict(),
    })
    .strict(),
  aA = t
    .object({ workspace: A, source: d, dryRun: t.boolean().optional(), operationId: d.optional() })
    .strict(),
  sA = t.object({ workspace: A, marketplace: d }).strict(),
  cA = t.object({ workspace: A, marketplace: d.optional() }).strict(),
  lA = t
    .object({
      marketplace: $d.optional(),
      marketplaces: t.array($d).optional(),
      diagnostics: t.array(ke).optional(),
    })
    .strict(),
  dA = t
    .object({
      workspace: A,
      pluginName: d,
      marketplace: d,
      scope: cg.optional(),
      dryRun: t.boolean().optional(),
      operationId: d.optional(),
    })
    .strict(),
  uA = t.object({ operationId: d }).strict(),
  pA = t.object({ operationId: d, cancelled: t.boolean() }).strict(),
  mA = t
    .object({
      workspace: A,
      pluginId: d.optional(),
      pluginName: d.optional(),
      marketplace: d.optional(),
      removeCache: t.boolean().optional(),
    })
    .strict(),
  gA = t
    .object({
      installedPlugins: t.array(jd),
      dependencyClosure: t.array(t.string()),
      diagnostics: t.array(ke),
    })
    .strict(),
  fA = t.object({ removedPlugin: jd.optional(), diagnostics: t.array(ke) }).strict(),
  hA = t.object({ workspace: A, pluginId: d.optional(), marketplace: d.optional() }).strict(),
  yA = t.object({ workspace: A, pluginId: d }).strict(),
  bA = t.object({ pluginId: d, diagnostics: t.array(ke) }).strict(),
  vA = t.object({ workspace: A, pluginId: d, options: B, dryRun: t.boolean().optional() }).strict(),
  SA = t.object({ pluginId: d, diagnostics: t.array(ke) }).strict(),
  _A = t
    .object({
      workspace: A,
      pluginName: d.optional(),
      marketplace: d.optional(),
      source: d.optional(),
    })
    .strict(),
  xA = t
    .object({
      ok: t.boolean(),
      diagnostics: t.array(ke),
      compatibility: t
        .object({
          runnable: t.array(t.string()),
          diagnosticOnly: t.array(t.string()),
          unsupported: t.array(t.string()),
        })
        .strict(),
    })
    .strict(),
  kA = t.object({ workspace: A, pluginName: d, marketplace: d }).strict(),
  IA = t
    .object({
      components: t.array(ag),
      diagnostics: t.array(ke).optional(),
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
  $S = t
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
  dg = t.enum(["minute", "hourly", "daily", "weekly", "monthly", "yearly"]),
  Bd = t
    .object({
      automationId: d,
      title: t.string(),
      cronExpr: d,
      prompt: d,
      model: t.string().optional(),
      provider: oe.optional(),
      mode: Ot.optional(),
      thoughtLevel: d.optional(),
      targetTaskId: d.optional(),
      enabled: t.boolean(),
      lifecycleStatus: t.enum(["active", "completed", "failed", "paused"]),
      nextRunAt: ee.optional(),
      lastRunAt: ee.optional(),
      runCount: t.number().int().nonnegative(),
      recurring: t.boolean(),
      maxRuns: t.number().int().positive().optional(),
      scheduleRule: $S.optional(),
    })
    .strict(),
  CA = t
    .object({
      title: t.string().optional(),
      cronExpr: d,
      relativeDelayMinutes: t.number().int().positive().max(525600).optional(),
      prompt: d,
      model: t.string().optional(),
      provider: oe.optional(),
      mode: Ot.optional(),
      thoughtLevel: d.optional(),
      targetTaskId: d.optional(),
      botDeliveryTarget: wd.optional(),
      recurring: t.boolean().optional(),
      maxRuns: t.number().int().positive().optional(),
      intervalUnit: dg.optional(),
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
  RA = t.object({ automation: Bd }).strict(),
  PA = t
    .object({
      automationId: d,
      title: d.optional(),
      cronExpr: d.optional(),
      prompt: d.optional(),
      recurring: t.boolean().optional(),
      maxRuns: t.number().int().positive().nullable().optional(),
      intervalUnit: dg.optional(),
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
  TA = t.object({ automation: Bd }).strict(),
  wA = t.object({}).strict(),
  EA = t.object({ automations: t.array(Bd) }).strict(),
  OA = t.object({ targetTaskId: d }).strict(),
  AA = t.object({ bound: t.boolean() }).strict(),
  zA = t.object({ automationId: d }).strict(),
  MA = t.object({ deleted: t.boolean() }).strict(),
  Md = {
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
  $A = t.object({}).strict(),
  DA = {
    [Md.mcpList]: { params: wv, result: Ev },
    [Md.interactionBrowserList]: { params: IS, result: CS },
    [Md.interactionBrowserExecute]: { params: RS, result: PS },
  };
var LA = t
    .object({ rowId: t.number().int().nonnegative(), entityId: t.string().trim().min(1) })
    .strict(),
  WA = t.number(),
  FA = t.enum(["text", "inputText", "output.text", "summaryText"]);
var kn = {
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
var DS = t
  .string()
  .min(4)
  .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u);
var $e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function encodeWireBytesBase64(e) {
  let o = "",
    i = [];
  for (let a = 0; a < e.byteLength; a += 3) {
    let n = e[a] ?? 0,
      r = a + 1 < e.byteLength,
      s = a + 2 < e.byteLength,
      l = r ? (e[a + 1] ?? 0) : 0,
      u = s ? (e[a + 2] ?? 0) : 0;
    (i.push(
      $e[n >>> 2],
      $e[((n & 3) << 4) | (l >>> 4)],
      r ? $e[((l & 15) << 2) | (u >>> 6)] : "=",
      s ? $e[u & 63] : "=",
    ),
      i.length >= 16384 && ((o += i.join("")), (i = [])));
  }
  return o + i.join("");
}
c(encodeWireBytesBase64, "encodeWireBytesBase64");
function decodeWireBase64(e) {
  if (!DS.safeParse(e).success) return null;
  let o = e.endsWith("==") ? 2 : e.endsWith("=") ? 1 : 0,
    i = new Uint8Array((e.length / 4) * 3 - o),
    a = 0;
  for (let n = 0; n < e.length; n += 4) {
    let r = $e.indexOf(e[n]),
      s = $e.indexOf(e[n + 1]),
      l = e[n + 2] === "=" ? 0 : $e.indexOf(e[n + 2]),
      u = e[n + 3] === "=" ? 0 : $e.indexOf(e[n + 3]);
    if (r < 0 || s < 0 || l < 0 || u < 0) return null;
    let p = (r << 18) | (s << 12) | (l << 6) | u;
    (a < i.length && (i[a++] = p >>> 16),
      a < i.length && (i[a++] = (p >>> 8) & 255),
      a < i.length && (i[a++] = p & 255));
  }
  return i;
}
c(decodeWireBase64, "decodeWireBase64");
var zt = {
    maxPhysicalFrameBytes: kn.maxFrameBytes,
    maxMessageBytes: 16 * 1024 * 1024,
    maxFragments: 64,
    assemblyTimeoutMs: 3e4,
    transportIdMaxChars: kn.transportEnvelopeIdMaxChars,
  },
  Ld = t.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  In = t.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  Mt = t
    .string()
    .min(1)
    .max(zt.transportIdMaxChars)
    .regex(/^[A-Za-z0-9._~-]+$/u),
  tz = t
    .object({ bridgeSessionId: Mt, bridgeGeneration: In.optional(), recoveryId: Mt.optional() })
    .strict(),
  US = t
    .object({ algorithm: t.literal("crc32"), value: t.string().regex(/^[0-9a-f]{8}$/u) })
    .strict();
function isCanonicalBase64(e) {
  if (e.length < 4 || e.length > zt.maxPhysicalFrameBytes) return !1;
  let o = decodeWireBase64(e);
  return o !== null && o.byteLength > 0 && encodeWireBytesBase64(o) === e;
}
c(isCanonicalBase64, "isCanonicalBase64");
var Wd = t
    .object({
      zcode_type: t.literal("rpc-frame"),
      bridgeSessionId: Mt,
      bridgeGeneration: In.optional(),
      recoveryId: Mt.optional(),
      seq: Ld,
      messageSeq: Ld,
      fragmentIndex: t
        .number()
        .int()
        .nonnegative()
        .max(zt.maxFragments - 1),
      fragmentCount: t.number().int().positive().max(zt.maxFragments),
      messageBytes: t.number().int().positive().max(zt.maxMessageBytes),
      checksum: US,
      dataBase64: t.string().min(4).max(zt.maxPhysicalFrameBytes).refine(isCanonicalBase64),
    })
    .strict()
    .superRefine((e, o) => {
      (e.fragmentIndex >= e.fragmentCount &&
        o.addIssue({
          code: "custom",
          path: ["fragmentIndex"],
          message: "fragmentIndex must be smaller than fragmentCount",
        }),
        e.fragmentCount > e.messageBytes &&
          o.addIssue({
            code: "custom",
            path: ["fragmentCount"],
            message: "non-empty fragments cannot exceed message bytes",
          }));
    }),
  Fd = t
    .object({
      zcode_type: t.literal("rpc-frame-ack"),
      bridgeSessionId: Mt,
      bridgeGeneration: In.optional(),
      recoveryId: Mt.optional(),
      ackMessageSeq: Ld,
    })
    .strict(),
  ZS = t.union([Wd, Fd]),
  nz = t
    .object({
      type: t.literal("data"),
      payload: ZS,
      client_ts: In.optional(),
      server_ts: In.optional(),
    })
    .strict();
var R = t.string().trim().min(1),
  jS = [
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
  BS = ["claude", "opencode", "gemini", "codex", "glm"],
  LS = ["claudeCode"],
  WS = t
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
  FS = t.object({
    taskId: R,
    traceId: R,
    title: t.string(),
    titleOverridden: t.boolean().optional(),
    workspacePath: R,
    workspaceIdentity: R.optional(),
    createdAt: t.number().int().nonnegative(),
    updatedAt: t.number().int().nonnegative(),
    mode: t.enum(jS),
    model: t.string().optional(),
    runtimeEpoch: t.number().int().nonnegative().optional(),
    provider: t.enum(BS).optional(),
    migrationSource: t.enum(LS).optional(),
    forkedFromTaskId: R.optional(),
    unreadAt: t.number().int().nonnegative().optional(),
    status: t.enum(["running", "completed", "error"]).optional(),
    lastError: t
      .object({
        code: t.string().optional(),
        message: t.string().min(1),
        traceId: R.optional(),
        taskId: R.optional(),
      })
      .optional(),
    changeSummary: WS.optional(),
  });
function resolveWorkspaceKey(e) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}
c(resolveWorkspaceKey, "resolveWorkspaceKey");
var VS = t.enum([
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
  qd = t.enum(["observer", "relay_owner"]),
  Cn = t.enum(["desktop_window", "relay_bridge"]),
  mg = t
    .object({
      eventId: R,
      workspacePath: R,
      workspaceIdentity: R.optional(),
      workspaceKey: R,
      traceId: R,
      createdAt: t.number().int().nonnegative(),
    })
    .strict(),
  GS = t.object({ runId: R, opSeq: t.number().int().nonnegative() }).strict(),
  gg = mg.extend({ reason: VS, streamWatermark: GS.optional() }).strict(),
  $t = c((e, o) => {
    let i = resolveWorkspaceKey(o);
    o.workspaceKey !== i &&
      e.addIssue({
        code: t.ZodIssueCode.custom,
        path: ["workspaceKey"],
        message: "workspaceKey must match workspaceIdentity fallback rule",
      });
  }, "addWorkspaceKeyIssue"),
  Sr = c((e, o) => {
    o.runId !== o.traceId &&
      e.addIssue({
        code: t.ZodIssueCode.custom,
        path: ["runId"],
        message: "runId must match traceId",
      });
  }, "addRunIdTraceIdIssue"),
  fg = gg.extend({ type: t.literal("task_snapshot_invalidated"), taskId: R }).strict(),
  hg = gg
    .extend({
      type: t.literal("workspace_task_list_invalidated"),
      taskId: R.optional(),
      taskMeta: FS.optional(),
    })
    .strict(),
  yg = t.discriminatedUnion("kind", [
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
  KS = t.object({ type: R, taskId: R, traceId: R }).passthrough(),
  bg = t
    .object({
      kind: t.literal("user_message"),
      messageId: R,
      content: t.string(),
      attachments: t.array(yg).optional(),
      timestamp: t.number().finite(),
    })
    .strict(),
  vg = t.object({ kind: t.literal("stream_event"), event: KS }).strict(),
  Sg = t.discriminatedUnion("kind", [bg, vg]),
  HS = t.discriminatedUnion("kind", [
    bg.extend({ seq: t.number().int().positive() }).strict(),
    vg.extend({ seq: t.number().int().positive() }).strict(),
  ]),
  _g = t
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
  Vd = _g.superRefine((e, o) => {
    ($t(o, e), Sr(o, e));
  }),
  xg = mg
    .extend({
      type: t.literal("task_stream_mirror_batch"),
      taskId: R,
      runId: R,
      ownerClientId: R.optional(),
      ownerDeviceLabel: R.optional(),
      batchSeq: t.number().int().positive(),
      fromSeq: t.number().int().positive(),
      toSeq: t.number().int().positive(),
      ops: t.array(HS),
      terminal: t.boolean(),
    })
    .strict(),
  kg = Vd,
  Ig = _g
    .extend({ leaseRequestId: R })
    .strict()
    .superRefine((e, o) => {
      ($t(o, e), Sr(o, e));
    }),
  Cg = t.discriminatedUnion("acquired", [
    t.object({ leaseRequestId: R, acquired: t.literal(!0), ownerHostId: R }).strict(),
    t
      .object({
        leaseRequestId: R,
        acquired: t.literal(!1),
        ownerHostId: R,
        reason: t.literal("owned_by_other_host"),
      })
      .strict(),
  ]),
  Dt = t
    .object({
      commandRequestId: R,
      workspacePath: R,
      workspaceIdentity: R.optional(),
      workspaceKey: R,
      taskId: R,
      runId: R,
    })
    .strict(),
  Rg = Dt.extend({ type: t.literal("stop_generation") }).strict(),
  Pg = Dt.extend({
    type: t.literal("respond_permission"),
    permissionRequestId: R,
    optionId: R,
    response: Et,
  }).strict(),
  Tg = Dt.extend({
    type: t.literal("respond_elicitation"),
    elicitationRequestId: R,
    action: t.enum(["accept", "decline", "cancel"]),
    content: t.record(t.string(), t.unknown()).optional(),
  }).strict(),
  JS = t
    .object({
      commandId: R,
      taskId: R,
      traceId: R,
      workspacePath: R,
      workspaceIdentity: R.optional(),
      workspaceKey: R,
      status: t.enum(["accepted", "running", "failed"]),
      createdAt: t.number().int().nonnegative(),
      updatedAt: t.number().int().nonnegative(),
      clientId: R.optional(),
      clientLabel: R.optional(),
      error: t.string().optional(),
    })
    .strict(),
  wg = t.discriminatedUnion("type", [
    JS.extend({
      type: t.literal("send_prompt"),
      content: t.string(),
      attachments: t.array(yg).optional(),
      automationId: R.optional(),
    }).strict(),
  ]),
  Eg = Dt.extend({ type: t.literal("enqueue_task_command"), taskCommand: wg }).strict(),
  Og = Dt.extend({
    type: t.literal("promote_task_command"),
    commandId: R,
    clientMode: t.literal("web-remote-replayable"),
  }).strict(),
  Ag = Dt.extend({
    type: t.literal("cancel_task_command"),
    commandId: R,
    clientMode: t.literal("web-remote-replayable"),
  }).strict(),
  zg = t.discriminatedUnion("type", [Rg, Pg, Tg, Eg, Og, Ag]).superRefine((e, o) => {
    $t(o, e);
  }),
  Mg = t
    .discriminatedUnion("type", [
      Rg.extend({ requesterHostId: R }).strict(),
      Pg.extend({ requesterHostId: R }).strict(),
      Tg.extend({ requesterHostId: R }).strict(),
      Eg.extend({ requesterHostId: R }).strict(),
      Og.extend({ requesterHostId: R }).strict(),
      Ag.extend({ requesterHostId: R }).strict(),
    ])
    .superRefine((e, o) => {
      $t(o, e);
    }),
  YS = t.enum(["NO_ACTIVE_TASK_OWNER", "STALE_TASK_OWNER_COMMAND", "OWNER_COMMAND_FAILED"]),
  Gd = t.discriminatedUnion("success", [
    t.object({ commandRequestId: R, success: t.literal(!0), taskCommand: wg.optional() }).strict(),
    t
      .object({
        commandRequestId: R,
        success: t.literal(!1),
        error: t.string(),
        code: YS.optional(),
      })
      .strict(),
  ]),
  $g = t.discriminatedUnion("type", [fg, hg, xg]).superRefine((e, o) => {
    ($t(o, e), e.type === "task_stream_mirror_batch" && Sr(o, e));
  }),
  Dg = t
    .discriminatedUnion("type", [
      fg.extend({ originHostId: R, deliveryPurpose: qd.optional() }).strict(),
      hg.extend({ originHostId: R, deliveryPurpose: qd.optional() }).strict(),
      xg.extend({ originHostId: R, deliveryPurpose: qd.optional() }).strict(),
    ])
    .superRefine((e, o) => {
      ($t(o, e), e.type === "task_stream_mirror_batch" && Sr(o, e));
    });
var h = t.string().trim().min(1),
  Cz = t.array(t.string()),
  ie = h.max(kn.transportEnvelopeIdMaxChars).regex(/^[A-Za-z0-9._~-]+$/u),
  XS = t.object({
    workspacePath: h,
    workspaceIdentity: h.optional(),
    remoteSessionId: h.optional(),
    label: h,
    workspacePurpose: t.enum(["project", "conversation"]).optional(),
    kind: t.enum(["local", "remote"]),
    connectionState: t.enum(["connected", "disconnected", "reconnecting"]).optional(),
    lastConnectionError: t.string().optional(),
  }),
  Ng = t.array(XS),
  Rz = t.object({ requestId: h, workspaceKey: h }),
  Pz = t.union([
    t.object({ requestId: h, workspaceKey: h, success: t.literal(!0) }),
    t.object({ requestId: h, workspaceKey: h, success: t.literal(!1), error: t.string() }),
  ]),
  QS = t.object({
    taskId: h,
    title: t.string(),
    workspacePath: h,
    workspaceIdentity: h.optional(),
    remoteSessionId: h.optional(),
    workspaceLabel: h,
    workspaceKind: t.enum(["local", "remote"]),
    createdAt: t.number().finite(),
    updatedAt: t.number().finite(),
    provider: oe.optional(),
    unreadAt: t.number().finite().optional(),
    displayStatus: t.enum(["idle", "running", "completed", "error"]).optional(),
    pinned: t.boolean().optional(),
    archived: t.boolean().optional(),
  }),
  Zg = t.array(QS),
  Kd = t.enum([
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
  e_ = t.discriminatedUnion("kind", [
    t.object({
      bridgeSessionId: ie,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: ie.optional(),
      kind: t.literal("local"),
      workspaceKey: h,
      workspacePath: h,
      initialTaskId: h.optional(),
    }),
    t.object({
      bridgeSessionId: ie,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: ie.optional(),
      kind: t.literal("remote"),
      workspaceKey: h,
      workspacePath: h,
      workspaceIdentity: h,
      remoteSessionId: h,
      initialTaskId: h.optional(),
    }),
  ]),
  Jd = t.object({
    activeWorkspaceKey: h.optional(),
    activeTaskId: h.optional(),
    updatedAt: t.number().finite(),
  }),
  t_ = t.object({
    platform: h,
    version: h,
    name: h,
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
  n_ = t.object({
    windowControlSessionId: h,
    workspaces: Ng,
    tasks: Zg,
    initialViewState: Jd.optional(),
    mobileViewState: Jd.optional(),
  }),
  Ug = t.object({
    workspaces: Ng,
    tasks: Zg.optional(),
    activeWorkspaceKey: h.optional(),
    activeTaskId: h.optional(),
  }),
  Hd = t.enum([
    "isDockerAvailable",
    "listWSLDistros",
    "listDockerContainers",
    "listSSHConfigAliases",
    "loadMcpFromUserDirectory",
    "saveMcpToUserDirectory",
    "migrateLegacyCommonMcp",
  ]),
  o_ = [
    t.object({ zcode_type: t.literal("bootstrap-request"), requestId: h }),
    t.object({
      zcode_type: t.literal("bootstrap-response"),
      requestId: h,
      success: t.literal(!0),
      result: n_,
    }),
    t.object({ zcode_type: t.literal("workspace-list-request"), requestId: h }),
    t.object({
      zcode_type: t.literal("workspace-list-response"),
      requestId: h,
      success: t.literal(!0),
      result: Ug,
    }),
    t.object({ zcode_type: t.literal("workspace-list-updated"), result: Ug }),
    t.object({
      zcode_type: t.literal("workspace-bridge-open"),
      requestId: h,
      bridgeSessionId: ie,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: ie.optional(),
      workspaceKey: h,
      taskId: h.optional(),
    }),
    t.object({
      zcode_type: t.literal("workspace-bridge-ready"),
      requestId: h,
      bridgeSessionId: ie,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: ie.optional(),
      bridge: e_,
    }),
    t.object({
      zcode_type: t.literal("workspace-bridge-error"),
      requestId: h,
      bridgeSessionId: ie.optional(),
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: ie.optional(),
      reason: Kd,
      error: t.string(),
    }),
    t.object({
      zcode_type: t.literal("workspace-reconnect-request"),
      requestId: h,
      workspaceKey: h,
    }),
    t.object({
      zcode_type: t.literal("workspace-reconnect-response"),
      requestId: h,
      workspaceKey: h,
      success: t.literal(!0),
    }),
    t.object({
      zcode_type: t.literal("workspace-reconnect-response"),
      requestId: h,
      workspaceKey: h,
      success: t.literal(!1),
      error: t.string(),
    }),
    t.object({
      zcode_type: t.literal("mobile-view-state-update"),
      viewState: Jd,
      deviceInfo: t_.optional(),
    }),
    t.object({
      zcode_type: t.literal("platform-request"),
      requestId: h,
      method: Hd,
      args: t.unknown().optional(),
    }),
    t.object({
      zcode_type: t.literal("platform-response"),
      requestId: h,
      method: Hd,
      success: t.literal(!0),
      result: t.unknown(),
    }),
    t.object({
      zcode_type: t.literal("platform-response"),
      requestId: h,
      method: Hd,
      success: t.literal(!1),
      error: t.string(),
    }),
    Wd,
    Fd,
    t.object({
      zcode_type: t.literal("bridge-degraded"),
      bridgeSessionId: ie,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: ie.optional(),
      reason: t.enum(["rpc-transport-fault", "rpc-frame-gap", "buffer-overflow", "buffer-timeout"]),
      seq: t.number().int().nonnegative().optional(),
      expectedSeq: t.number().int().nonnegative().optional(),
      droppedCount: t.number().int().nonnegative().optional(),
    }),
    t.object({
      zcode_type: t.literal("app-error"),
      requestId: h.optional(),
      bridgeSessionId: ie.optional(),
      reason: Kd,
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
      failureReason: Kd.optional(),
      failureMessage: t.string().optional(),
      visibilityState: t.string().optional(),
      online: t.boolean().optional(),
      hiddenDurationMs: t.number().int().nonnegative().optional(),
    }),
  ],
  Tz = t.union(o_);
var wz = t.record(t.string(), t.string());
var Ez = t.string(),
  jg = t.object({
    kind: t.literal("ssh"),
    host: h,
    port: t.number().int().positive().max(65535).optional(),
    username: h,
    sshConfigAlias: h.optional(),
    password: t.string().optional(),
    privateKeyPath: t.string().optional(),
    privateKeyPassphrase: t.string().optional(),
    assetInstallMode: t.enum(gr).optional(),
    resourcePackages: t
      .object({ selectedPackageIds: t.array(t.string().refine(isKnownRemoteResourcePackageId)).optional() })
      .optional(),
  }),
  Bg = t.object({ kind: t.literal("wsl"), distro: t.string().optional(), user: _n.optional() }),
  r_ = t.object({ kind: t.literal("docker"), container: h }),
  i_ = t.object({
    kind: t.literal("server"),
    url: t.string().url(),
    name: h.optional(),
    token: t.string().optional(),
    workspacePath: t.string().optional(),
    serverId: h.optional(),
  }),
  Rn = t.discriminatedUnion("kind", [jg, Bg, r_, i_]),
  Oz = t.object({
    type: t.literal("zcode-hello"),
    version: t.string(),
    platform: t.string(),
    arch: t.string(),
    pid: t.number().int(),
  }),
  Az = t.object({ type: t.literal("zcode-hello-ack"), version: t.string(), clientId: h }),
  zz = t.object({ level: t.enum(["info", "warn", "error"]), args: t.array(t.unknown()) }),
  Mz = t.object({
    taskId: h,
    status: t.enum([
      "completed",
      "failed",
      "permission_request",
      "elicitation_request",
      "feedback_update",
    ]),
    requestId: h.optional(),
    title: t.string(),
    body: t.string(),
  }),
  a_ = t.object({ clientTimezone: h, clientLanguage: h, screenResolution: h }),
  $z = t.object({
    context: a_,
    elementName: h,
    eventRegion: h,
    eventType: h,
    eventText: t.string().optional(),
    eventExtraDetail: t.record(t.string(), t.string()),
    userId: t.string().optional(),
    talkId: t.string().optional(),
    messageId: t.string().optional(),
  }),
  Dz = t.object({
    name: h,
    group: h,
    value: t.number().finite().optional(),
    properties: t
      .record(t.string(), t.union([t.string(), t.number().finite(), t.boolean(), t.undefined()]))
      .optional(),
  }),
  s_ = t.object({ channel: h, payload: t.unknown(), sourceWindowId: t.number().int().optional() }),
  _r = t.object({
    mockCdnDir: t.string().optional(),
    remoteCdnBaseUrl: t.string().optional(),
    remoteCdnBaseUrls: t.array(t.string()).optional(),
    remoteCacheDir: t.string().optional(),
  }),
  c_ = t.object({ workspacePath: h, workspaceIdentity: h.optional() }),
  l_ = t.object({
    type: t.literal("init-local"),
    hostId: h.optional(),
    deliveryKind: Cn.optional(),
    deviceMid: t.string().optional(),
    feedbackApiBase: t.string().url().optional(),
    workspacePath: h.optional(),
    workspaceIdentity: h.optional(),
    agentWarmupTargets: t.array(c_).max(3).optional(),
    agentSpawnFallbackCwd: h.optional(),
    runtimeProcessEnvPatch: t
      .record(t.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), t.string())
      .optional(),
  }),
  d_ = t.object({ type: t.literal("init-remote"), target: Rn, remoteAssets: _r }),
  u_ = t.object({
    type: t.literal("init-remote-workspace"),
    target: Rn,
    remoteAssets: _r,
    workspacePath: h.optional(),
    workspaceIdentity: h.optional(),
    hostId: h.optional(),
    deliveryKind: Cn.optional(),
  }),
  p_ = t.object({
    type: t.literal("init-remote-ssh-host"),
    target: jg,
    remoteAssets: _r,
    hostId: h.optional(),
    deliveryKind: Cn.optional(),
  }),
  m_ = t.object({
    type: t.literal("init-remote-wsl-host"),
    target: Bg,
    remoteAssets: _r,
    hostId: h.optional(),
    deliveryKind: Cn.optional(),
  }),
  g_ = t
    .object({
      type: t.literal("attach-service-port"),
      attachmentId: h,
      clientMode: t.enum(["desktop-continuous", "web-remote-replayable"]),
    })
    .strict(),
  f_ = t.object({ type: t.literal("detach-service-port"), attachmentId: h }),
  h_ = t.object({
    type: t.literal("acquire-remote-workspace"),
    requestId: h,
    workspacePath: h,
    workspaceIdentity: h.optional(),
    generation: t.number().int().positive(),
  }),
  y_ = t.object({
    type: t.literal("release-remote-workspace"),
    workspacePath: h,
    workspaceIdentity: h.optional(),
    generation: t.number().int().positive(),
  }),
  b_ = t.object({ type: t.literal("dispose") }),
  Lg = t.object({ type: t.literal("broadcast"), message: s_ }),
  v_ = t.object({ type: t.literal("task-realtime-deliver"), event: Dg }),
  S_ = t.object({ type: t.literal("task-run-lease-result"), result: Cg }),
  __ = t.object({ type: t.literal("task-owner-command-deliver"), command: Mg }),
  x_ = t.object({ type: t.literal("task-owner-command-result"), result: Gd }),
  k_ = t.object({
    type: t.literal("bot-remote-workspace-reconnect-result"),
    requestId: h,
    ok: t.boolean(),
    sessionId: h.optional(),
    error: t.string().optional(),
  }),
  I_ = t.object({
    type: t.literal("bot-remote-workspace-connection-status-result"),
    requestId: h,
    ok: t.boolean(),
    connected: t.boolean().optional(),
    error: t.string().optional(),
  }),
  C_ = t.object({
    type: t.literal("bot-remote-workspace-runtime-port"),
    requestId: h,
    ok: t.boolean(),
    error: t.string().optional(),
  }),
  Wg = t.object({
    content: h,
    createdAt: h,
    fromSessionId: h,
    messageId: h,
    requestId: h,
    toSessionId: h,
  }),
  Fg = t.object({
    error: t.string().optional(),
    messageId: h,
    requestId: h,
    sessionId: h,
    status: t.enum(["success", "failed"]),
  }),
  R_ = t.object({ sessionId: h }),
  P_ = t.object({ type: t.literal("session-message-deliver"), request: Wg }),
  T_ = t.object({ type: t.literal("session-message-delivery-result"), result: Fg }),
  w_ = t.object({
    type: t.literal("feedback-log-archive-result"),
    requestId: h,
    ok: t.boolean(),
    path: t.string().optional(),
    size: t.number().int().nonnegative().optional(),
    error: t.string().optional(),
  }),
  E_ = t.object({
    type: t.literal("cron-run"),
    automationId: h,
    runId: h,
    workspacePath: h,
    workspaceIdentity: t.string().optional(),
    prompt: h,
    targetTaskId: h.optional(),
    model: t.string().optional(),
    provider: t.string().optional(),
    mode: t.string().optional(),
    thoughtLevel: t.string().optional(),
  }),
  O_ = t.object({
    type: t.literal("off-peak-run"),
    offPeakTaskId: h,
    workspacePath: h,
    workspaceIdentity: t.string().optional(),
    prompt: h,
    permissionMode: h,
    model: t.string().optional(),
    thoughtLevel: t.string().optional(),
    conversationId: t.string().optional(),
    sessionId: t.string().optional(),
    serverTicketId: t.string().optional(),
  }),
  A_ = t.object({ type: t.literal("browser-execute-result"), requestId: h, result: wt }),
  Uz = t.discriminatedUnion("type", [
    l_,
    d_,
    u_,
    p_,
    m_,
    g_,
    f_,
    h_,
    y_,
    b_,
    Lg,
    v_,
    S_,
    __,
    x_,
    k_,
    I_,
    C_,
    P_,
    T_,
    w_,
    E_,
    O_,
    A_,
  ]),
  z_ = t.object({ type: t.literal("connected") }),
  M_ = t.object({
    type: t.literal("remote-workspace-acquired"),
    requestId: h,
    workspacePath: h,
    workspaceIdentity: h.optional(),
    generation: t.number().int().positive(),
    ok: t.boolean(),
    error: t.string().optional(),
  }),
  $_ = t.object({ type: t.literal("error"), error: t.string() }),
  D_ = t.object({
    type: t.literal("log"),
    level: t.enum(["info", "warn", "error"]),
    source: t.string(),
    message: t.string(),
  });
var U_ = t.enum(["claudeCode"]),
  N_ = t.object({
    type: t.literal("agent-process-spawned"),
    pid: t.number().int().positive(),
    provider: oe,
    workspacePath: h,
    command: t.string(),
    args: t.array(t.string()),
    startedAt: t.number().int().nonnegative(),
    runtimeGeneration: t.number().int().positive().optional(),
    runtimeInstanceId: h.optional(),
  }),
  Z_ = t.object({
    type: t.literal("agent-process-ready"),
    pid: t.number().int().positive(),
    provider: oe,
    workspacePath: h,
    readyAt: t.number().int().nonnegative(),
    startupDurationMs: t.number().int().nonnegative(),
    runtimeGeneration: t.number().int().positive(),
    runtimeInstanceId: h,
  }),
  j_ = t.object({
    type: t.literal("agent-process-exited"),
    pid: t.number().int().positive(),
    provider: oe,
    workspacePath: h,
    exitCode: t.number().int().nullable(),
    signal: t.string().nullable(),
    endedAt: t.number().int().nonnegative(),
    terminationKind: t.enum(["expected", "unexpected", "watchdog_recycle"]),
    terminationReason: t.string().optional(),
    runtimeReady: t.boolean().optional(),
    runtimeGeneration: t.number().int().positive(),
    runtimeInstanceId: h.optional(),
    uptimeMs: t.number().int().nonnegative(),
    stderrLineCount: t.number().int().nonnegative(),
    stderrTail: t.array(t.string().max(1100)).max(20).optional(),
  }),
  B_ = t.object({
    type: t.literal("agent-process-error"),
    pid: t.number().int().positive().nullable(),
    provider: oe,
    workspacePath: h,
    command: t.string(),
    args: t.array(t.string()),
    errorName: h,
    errorCode: t.string().optional(),
    errorMessage: t.string(),
    errorStack: t.string().optional(),
    runtimeGeneration: t.number().int().positive(),
    runtimeInstanceId: h.optional(),
    occurredAt: t.number().int().nonnegative(),
  }),
  L_ = t
    .object({
      type: t.literal("agent-resource-sample"),
      runtimeSurface: t.enum(["local", "remote"]),
      sample: Bm,
    })
    .strict(),
  W_ = t.object({
    type: t.literal("agent-running-task-count-changed"),
    runningTaskCount: t.number().int().nonnegative(),
  }),
  F_ = t.object({
    type: t.literal("workspace-running-task-count-changed"),
    workspacePath: h,
    workspaceIdentity: h.optional(),
    runningTaskCount: t.number().int().nonnegative(),
  }),
  q_ = t.object({
    type: t.literal("repo-wiki-running-task-count-changed"),
    runningTaskCount: t.number().int().nonnegative(),
  }),
  V_ = t.object({ type: t.literal("task-realtime-publish"), event: $g }),
  G_ = t.object({ type: t.literal("task-stream-op-publish"), target: Vd, op: Sg }),
  K_ = t.object({ type: t.literal("task-run-lease-acquire"), request: Ig }),
  H_ = t.object({ type: t.literal("task-run-lease-release"), target: kg }),
  J_ = t.object({ type: t.literal("task-owner-command-request"), command: zg }),
  Y_ = t.object({ type: t.literal("task-owner-command-result"), result: Gd }),
  X_ = t.object({
    type: t.literal("bot-remote-workspace-reconnect-request"),
    requestId: h,
    workspacePath: h,
    workspaceIdentity: h,
    target: Rn,
  }),
  Q_ = t.object({
    type: t.literal("bot-remote-workspace-connection-status-request"),
    requestId: h,
    workspacePath: h,
    workspaceIdentity: h,
    target: Rn,
  }),
  ex = t.object({
    type: t.literal("bot-remote-workspace-runtime-port-request"),
    requestId: h,
    workspacePath: h,
    workspaceIdentity: h,
    target: Rn,
  }),
  tx = t.object({ type: t.literal("session-message-send-requested"), request: Wg }),
  nx = t.object({ type: t.literal("session-route-announce"), route: R_ }),
  ox = t.object({ type: t.literal("session-message-deliver-result"), result: Fg }),
  rx = t.object({ type: t.literal("feedback-log-archive-request"), requestId: h, sourceDir: h }),
  ix = t.object({
    type: t.literal("cron-run-result"),
    runId: h,
    ok: t.boolean(),
    taskId: t.string().optional(),
    sessionId: t.string().optional(),
    error: t.string().optional(),
    failureKind: t.enum(["transient", "permanent"]).optional(),
  }),
  ax = t.object({
    type: t.literal("off-peak-run-result"),
    offPeakTaskId: h,
    ok: t.boolean(),
    conversationId: t.string().optional(),
    sessionId: t.string().optional(),
    error: t.string().optional(),
    failureKind: t.enum(["transient", "permanent"]).optional(),
  }),
  sx = t.object({ type: t.literal("cron-scheduler-wake-request"), automationId: h }),
  cx = t.object({
    type: t.literal("off-peak-scheduler-wake-request"),
    offPeakTaskId: t.string().optional(),
  }),
  lx = t.object({
    type: t.literal("browser-execute-request"),
    requestId: h,
    browserId: h.optional(),
    browserGeneration: t.number().int().nonnegative().optional(),
    sessionId: h,
    turnId: h.optional(),
    workspaceKey: h.optional(),
    workspacePath: h.optional(),
    workspaceIdentity: h.optional(),
    remoteSessionId: h.optional(),
    clientMode: t.enum(["desktop-continuous", "web-remote-replayable"]).optional(),
    sessionContext: t.enum(["live", "cached"]).optional(),
    command: Tt,
  }),
  dx = t.object({
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
  ux = t.object({ type: t.literal("network-telemetry-batch"), observations: t.array(dx).max(500) }),
  Nz = t.discriminatedUnion("type", [
    z_,
    M_,
    $_,
    D_,
    N_,
    Z_,
    j_,
    B_,
    L_,
    W_,
    F_,
    q_,
    Lg,
    V_,
    G_,
    K_,
    H_,
    J_,
    Y_,
    X_,
    Q_,
    ex,
    tx,
    nx,
    ox,
    rx,
    lx,
    ux,
    ix,
    ax,
    sx,
    cx,
  ]),
  px = t.enum(["running", "completed", "error"]),
  mx = t.object({
    kind: t.literal("image"),
    filename: t.string(),
    mimeType: t.string(),
    sizeBytes: t.number().int().nonnegative().optional(),
    dataBase64: t.string().optional(),
    localPath: t.string().optional(),
  }),
  gx = t.object({
    kind: t.literal("file"),
    filename: t.string(),
    mimeType: t.string(),
    sizeBytes: t.number().int().nonnegative(),
    dataBase64: t.string().optional(),
    textContent: t.string().optional(),
    localPath: t.string().optional(),
  }),
  fx = t.discriminatedUnion("kind", [mx, gx]),
  hx = t.object({
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
  yx = t.discriminatedUnion("type", [
    t.object({ type: t.literal("content"), content: t.string() }),
    t.object({ type: t.literal("thought"), content: t.string() }),
    t.object({ type: t.literal("tool-call"), toolIndex: t.number().int().nonnegative() }),
  ]),
  bx = t.object({
    id: t.string().optional(),
    role: t.enum(["user", "assistant"]),
    content: t.string(),
    timestamp: t.number().int().nonnegative(),
    model: t.string().optional(),
    characterCount: t.number().int().nonnegative().optional(),
    durationMs: t.number().int().nonnegative().optional(),
    interrupted: t.boolean().optional(),
    feedback: t.enum(["like", "dislike"]).optional(),
    attachments: t.array(fx).optional(),
    tools: t.array(hx).optional(),
    thought: t.string().optional(),
    parts: t.array(yx).optional(),
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
  vx = t.enum(["active", "paused", "budget_limited", "complete"]),
  Sx = t.enum([
    "set",
    "status_updated",
    "cleared",
    "usage_accounted",
    "run_started",
    "run_finished",
    "summary_updated",
  ]),
  _x = t.enum(["command", "tool", "runtime"]),
  Yd = t.object({
    sessionID: h,
    targetID: h,
    objective: h,
    summaryTitle: t.string().min(1).nullable().default(null),
    status: vx,
    tokenBudget: t.number().int().positive().nullable(),
    tokensUsed: t.number().int().nonnegative(),
    timeUsedSeconds: t.number().int().nonnegative(),
    activeInputId: h.nullable().optional(),
    activeRunStartedAtMs: t.number().int().nonnegative().nullable().optional(),
    activeRunLastSeenAtMs: t.number().int().nonnegative().nullable().optional(),
    time: t.object({
      created: t.number().int().nonnegative(),
      updated: t.number().int().nonnegative(),
    }),
  }),
  Zz = t.object({
    action: Sx,
    source: _x,
    target: Yd.nullable(),
    previousTarget: Yd.nullable().optional(),
  });
var xx = t.object({
    taskId: h,
    traceId: h,
    title: t.string(),
    titleOverridden: t.boolean().optional(),
    workspacePath: h,
    workspaceIdentity: h.optional(),
    workspacePurpose: t.enum(["project", "conversation"]).optional(),
    createdAt: t.number().int().nonnegative(),
    updatedAt: t.number().int().nonnegative(),
    mode: Ot,
    model: t.string().optional(),
    thoughtLevel: h.optional(),
    runtimeEpoch: t.number().int().nonnegative().optional(),
    provider: oe.optional(),
    migrationSource: U_.optional(),
    forkedFromTaskId: h.optional(),
    cronAutomationId: h.optional(),
    offPeakTaskId: h.optional(),
    unreadAt: t.number().int().nonnegative().optional(),
    status: px.optional(),
    lastError: t
      .object({
        code: t.string().optional(),
        detail: t.string().optional(),
        message: t.string().min(1),
        traceId: h.optional(),
        taskId: h.optional(),
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
    target: Yd.nullable().optional(),
  }),
  kx = t.enum(["idle", "syncing", "ready", "stale", "failed"]),
  jz = t.object({ provider: oe, sessionId: h, lastSyncedTurnIndex: t.number().int(), state: kx }),
  Ix = t.object({ workspaceHash: h, taskId: h }),
  Bz = t.object({ version: t.literal("1"), tasks: t.array(Ix) }),
  Cx = t.object({
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
  Rx = t.object({
    turnIndex: t.number().int().nonnegative(),
    snapshots: t.array(Cx),
    fileState: t.enum(["applied", "reverted"]).optional(),
  }),
  Px = t.object({
    turnIndex: t.number().int().nonnegative(),
    baseFileCheckpointId: h,
    resultFileCheckpointId: h.optional(),
  }),
  Lz = t.object({
    meta: xx,
    messages: t.array(bx),
    fileChanges: t.array(Rx).optional(),
    turnCheckpoints: t.array(Px).optional(),
  });
var wx = 1,
  Ex = t.object({
    path: t.string().trim().min(1),
    label: t.string().trim().min(1).optional(),
    workspaceIdentity: t.string().trim().min(1).optional(),
  }),
  LM = t.object({
    serverId: t.string().trim().min(1),
    name: t.string().trim().min(1).optional(),
    version: t.string(),
    protocolVersion: t.literal(wx),
    authRequired: t.boolean(),
    workspaces: t.array(Ex),
    capabilities: t.object({ desktopContinuous: t.literal(!0), websocketRpc: t.literal(!0) }),
  }),
  WM = t
    .object({ capability: t.string().trim().min(1), expiresAt: t.number().int().positive() })
    .strict();
var qg = {
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
  },
  Vg = { WheelBoundary: "zcode:embedded-browser-wheel-boundary" };
var Gg = "bigmodel";
var Ax = "none";
var zx = [{ value: "nofy-agent", label: "ZCode Agent" }],
  r$ = [{ value: Ax, label: "\u672A\u6307\u5B9A" }, ...zx];
var g$ = `team-plan:${he.bigmodelCodingPlan}:`;
var Mx = [
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
  cD = new Set(Mx.map((e) => e.id));
var Kg = [
  {
    id: "zai",
    label: "Z.ai",
    oauthProviderId: "zai",
    apiKeyProviderId: he.zai,
    startPlanProviderId: he.zaiStartPlan,
    codingPlanProviderId: he.zaiCodingPlan,
  },
  {
    id: "bigmodel",
    label: "BigModel",
    oauthProviderId: Gg,
    apiKeyProviderId: he.bigmodel,
    startPlanProviderId: he.bigmodelStartPlan,
    codingPlanProviderId: he.bigmodelCodingPlan,
  },
];
var ID = new Map(Kg.map((e) => [e.id, e])),
  CD = new Map(
    Kg.flatMap((e) =>
      [e.apiKeyProviderId, e.startPlanProviderId, e.codingPlanProviderId].map((o) => [o, e.id]),
    ),
  );
var eU = t.object({ askUserQuestionAutoResolutionEnabled: t.boolean() }).strict();
function resolvePlatformBinaryName(e, o) {
  return o === "win32" ? `${e}.exe` : e;
}
c(resolvePlatformBinaryName, "resolvePlatformBinaryName");
var Qd = {
    bfs: {
      binaryEnvVar: "ZCODE_BFS_BINARY",
      bundledResourceDir: "bfs",
      resolveEntrySegments: c((e) => [resolvePlatformBinaryName("bfs", e)], "resolveEntrySegments"),
    },
    ripgrep: {
      binaryEnvVar: "ZCODE_RG_BINARY",
      bundledResourceDir: "ripgrep",
      resolveEntrySegments: c((e) => [resolvePlatformBinaryName("rg", e)], "resolveEntrySegments"),
    },
    ugrep: {
      binaryEnvVar: "ZCODE_UGREP_BINARY",
      bundledResourceDir: "ugrep",
      resolveEntrySegments: c((e) => [resolvePlatformBinaryName("ugrep", e)], "resolveEntrySegments"),
    },
  },
  bU = {
    bfs: { ...Qd.bfs, versions: { linux: "v4.1.1-2" } },
    ripgrep: { ...Qd.ripgrep, versions: { darwin: "v13.0.0-10", linux: "v14.1.1-1" } },
    ugrep: { ...Qd.ugrep, versions: { linux: "v7.5.0-2" } },
  };
var Dx = [
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
var UU = new Map(Dx.map((e) => [e.toLowerCase(), e]));
var Ux = "studio.zcode-ai.com";
function readProcessEnv() {
  return globalThis.process?.env ?? {};
}
c(readProcessEnv, "readProcessEnv");
function resolveIntranetMachineHost(e = readProcessEnv()) {
  return e.INTRANET_MACHINE_HOST?.trim() || Ux;
}
c(resolveIntranetMachineHost, "resolveIntranetMachineHost");
var Hg = resolveIntranetMachineHost(),
  jx = 12345,
  Bx = `http://${Hg}:${jx}/zcode`,
  aN = `${Bx}/deps`,
  Lx = 3850,
  Wx = "/api/intranet/probe",
  Fx = `http://${Hg}:${Lx}${Wx}`;
var Pn = "v2",
  qx = "v1",
  Jg = "v1";
function repoSnapshotSchema(e, o) {
  return `repo_snapshot_${e}/${o}`;
}
c(repoSnapshotSchema, "repoSnapshotSchema");
var _N = repoSnapshotSchema("manifest", Pn),
  xN = repoSnapshotSchema("prompt", Pn),
  kN = repoSnapshotSchema("delta", Pn),
  IN = repoSnapshotSchema("encrypted_artifact", Pn),
  CN = repoSnapshotSchema("encryption_aad", Pn),
  RN = repoSnapshotSchema("manifest_hash", qx),
  PN = repoSnapshotSchema("upload_key", Jg),
  TN = repoSnapshotSchema("upload_target", Jg);
var Yg = t.object({
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
  KN = t.discriminatedUnion("op", [
    Yg.extend({ op: t.literal("list") }).strict(),
    Yg.extend({
      op: t.literal("execute"),
      browserId: t.string().trim().min(1),
      browserGeneration: t.number().int().nonnegative(),
      command: Tt,
    }).strict(),
  ]),
  HN = t.discriminatedUnion("ok", [
    t
      .object({
        id: t.string().uuid(),
        ok: t.literal(!0),
        browsers: t.array(yd).optional(),
        result: wt.optional(),
      })
      .strict(),
    t.object({ id: t.string().uuid(), ok: t.literal(!1), error: t.string().min(1) }).strict(),
  ]);
var tf = 0.01,
  He = 1,
  Vx = 40,
  Xg = 1e4;
function clampForwardedDelta(e) {
  return Math.max(-Xg, Math.min(Xg, e));
}
c(clampForwardedDelta, "clampForwardedDelta");
function normalizeAxisDelta(e, o, i) {
  if (!Number.isFinite(e) || Math.abs(e) <= tf) return 0;
  let a = o.deltaMode === 1 ? Vx : o.deltaMode === 2 ? Math.max(1, i) : 1;
  return clampForwardedDelta(e * a);
}
c(normalizeAxisDelta, "normalizeAxisDelta");
function normalizeEmbeddedBrowserWheelDelta(e, o) {
  let i = Math.abs(e.deltaX) > tf ? e.deltaX : e.shiftKey ? e.deltaY : 0,
    a = e.shiftKey ? 0 : e.deltaY;
  return { deltaX: normalizeAxisDelta(i, e, o.innerWidth), deltaY: normalizeAxisDelta(a, e, o.innerHeight) };
}
c(normalizeEmbeddedBrowserWheelDelta, "normalizeEmbeddedBrowserWheelDelta");
function isElement(e) {
  return "nodeType" in e && e.nodeType === 1;
}
c(isElement, "isElement");
function canElementConsumeDelta(e, o, i, a) {
  let n = o === "x",
    r = n ? e.scrollWidth : e.scrollHeight,
    s = n ? e.clientWidth : e.clientHeight,
    l = r - s;
  if (l <= He) return !1;
  let u = a.getComputedStyle(e),
    p = (n ? u.overflowX : u.overflowY) || u.overflow,
    f = e === a.document.scrollingElement;
  return p === "hidden" || p === "clip" || (!f && !["auto", "scroll", "overlay"].includes(p))
    ? !1
    : n
      ? u.direction === "rtl"
        ? i > 0
          ? e.scrollLeft < -He
          : e.scrollLeft > -l + He
        : i > 0
          ? e.scrollLeft < l - He
          : e.scrollLeft > He
      : i > 0
        ? e.scrollTop < l - He
        : e.scrollTop > He;
}
c(canElementConsumeDelta, "canElementConsumeDelta");
function guestCanConsumeDelta(e, o, i, a) {
  if (i === 0) return !1;
  let n = new Set();
  for (let s of e.composedPath()) isElement(s) && n.add(s);
  let r = a.document.scrollingElement;
  return (r && n.add(r), [...n].some((s) => canElementConsumeDelta(s, o, i, a)));
}
c(guestCanConsumeDelta, "guestCanConsumeDelta");
function installEmbeddedBrowserWheelForwarding(e, o) {
  let i = c((a) => {
    let n = normalizeEmbeddedBrowserWheelDelta(a, e),
      r = guestCanConsumeDelta(a, "x", n.deltaX, e) ? 0 : n.deltaX,
      s = guestCanConsumeDelta(a, "y", n.deltaY, e) ? 0 : n.deltaY;
    (r === 0 && s === 0) ||
      e.queueMicrotask(() => {
        a.defaultPrevented || o(Vg.WheelBoundary, { deltaX: r, deltaY: s });
      });
  }, "handleWheel");
  return (e.addEventListener("wheel", i, { passive: !0 }), () => e.removeEventListener("wheel", i));
}
c(installEmbeddedBrowserWheelForwarding, "installEmbeddedBrowserWheelForwarding");
var of = "__zcodeEmbeddedBrowserJavaScriptDialog__";
typeof window < "u" &&
  installEmbeddedBrowserWheelForwarding(window, (e, o) => {
    Ut.ipcRenderer.sendToHost(e, o);
  });
Ut.contextBridge.exposeInMainWorld(of, {
  show(e, o) {
    try {
      let i = Ut.ipcRenderer.sendSync(qg.EmbeddedBrowserJavaScriptDialog, { type: e, message: o });
      if (typeof i != "object" || i === null) return { handled: !1 };
      let a = i;
      return a.handled !== !0
        ? { handled: !1 }
        : { handled: !0, ...(typeof a.value == "boolean" ? { value: a.value } : {}) };
    } catch {
      return { handled: !1 };
    }
  },
});
Ut.contextBridge.executeInMainWorld({
  func: c((e) => {
    let o = window[e];
    if (!o) return;
    let i = new WeakMap(),
      a = new WeakSet(),
      n = c((l) => {
        try {
          if (i.get(l) === l.confirm) return;
          let u = l.alert.bind(l),
            p = l.confirm.bind(l);
          l.alert = (y) => {
            let v = y === void 0 ? "" : String(y);
            o.show("alert", v).handled || u(v);
          };
          let f = c((y) => {
            let v = y === void 0 ? "" : String(y),
              S = o.show("confirm", v);
            return S.handled ? S.value === !0 : p(v);
          }, "wrappedConfirm");
          ((l.confirm = f), i.set(l, f));
        } catch {}
      }, "installInWindow"),
      r = c((l) => {
        n(l);
        try {
          for (let u of l.document.querySelectorAll("iframe"))
            (a.has(u) ||
              (a.add(u),
              u.addEventListener(
                "load",
                () => {
                  u.contentWindow && r(u.contentWindow);
                },
                !0,
              )),
              u.contentWindow && r(u.contentWindow));
        } catch {}
      }, "installFrameTree");
    r(window);
    let s = c(() => {
      r(window);
      let l = window.document?.documentElement;
      l && new window.MutationObserver(() => r(window)).observe(l, { childList: !0, subtree: !0 });
    }, "observeFrames");
    window.document?.documentElement
      ? s()
      : window.addEventListener?.("DOMContentLoaded", s, { once: !0 });
  }, "func"),
  args: [of],
});
